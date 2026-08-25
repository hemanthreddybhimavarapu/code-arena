package com.codearena.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.web.DefaultOAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.client.web.OAuth2AuthorizationRequestResolver;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.beans.factory.annotation.Value;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@SuppressWarnings("null")
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final OAuth2SuccessHandler oauth2SuccessHandler;
    private final ClientRegistrationRepository clientRegistrationRepository;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    @Value("${app.cors.allowed-origins:http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173}")
    private String allowedOriginsConfig;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter, OAuth2SuccessHandler oauth2SuccessHandler, ClientRegistrationRepository clientRegistrationRepository) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.oauth2SuccessHandler = oauth2SuccessHandler;
        this.clientRegistrationRepository = clientRegistrationRepository;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**", "/api/contact/**", "/login/oauth2/**", "/oauth2/**", "/error").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/problems/**", "/api/problems", "/api/discussions/**", "/api/leaderboard", "/api/leaderboard/**").permitAll()
                .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
                // Admin endpoints
                .requestMatchers("/api/admin/**").access((authentication, context) -> 
                    new org.springframework.security.authorization.AuthorizationDecision(
                        authentication.get().getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))
                    )
                )
                // Any other request must be authenticated
                .anyRequest().authenticated()
            )
            .exceptionHandling(exceptions -> exceptions
                .authenticationEntryPoint((request, response, authException) -> {
                    String reqUri = request.getRequestURI();
                    if (reqUri != null && reqUri.contains("/oauth2/")) {
                        String targetFrontend = (frontendUrl != null && !frontendUrl.isBlank()) ? frontendUrl.replaceAll("/+$", "") : "https://code-arena-three-beryl.vercel.app";
                        response.sendRedirect(targetFrontend + "/login?error=" + java.net.URLEncoder.encode(authException.getMessage() != null ? authException.getMessage() : "Authentication required", "UTF-8"));
                    } else {
                        response.setContentType("application/json");
                        response.setStatus(jakarta.servlet.http.HttpServletResponse.SC_UNAUTHORIZED);
                        response.getWriter().write("{\"success\":false,\"message\":\"Unauthorized access\"}");
                    }
                })
            )
            .oauth2Login(oauth -> oauth
                .authorizationEndpoint(authorization -> authorization
                    .authorizationRequestResolver(authorizationRequestResolver(clientRegistrationRepository))
                )
                .successHandler(oauth2SuccessHandler)
                .failureHandler((request, response, exception) -> {
                    System.err.println(">>> OAuth2 Login Failure: " + exception.getMessage());
                    String msg = exception.getMessage() != null ? exception.getMessage() : "Google OAuth authentication failed";
                    String targetFrontend = (frontendUrl != null && !frontendUrl.isBlank()) ? frontendUrl.replaceAll("/+$", "") : "https://code-arena-three-beryl.vercel.app";
                    response.sendRedirect(targetFrontend + "/login?error=" + java.net.URLEncoder.encode(msg, "UTF-8"));
                })
            );

        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        List<String> origins = new ArrayList<>();
        if (allowedOriginsConfig != null && !allowedOriginsConfig.isBlank()) {
            for (String origin : allowedOriginsConfig.split(",")) {
                if (!origin.trim().isEmpty()) {
                    origins.add(origin.trim());
                }
            }
        }
        // Always include dev defaults and Vercel wildcard patterns if not present
        if (!origins.contains("http://localhost:*")) origins.add("http://localhost:*");
        if (!origins.contains("http://127.0.0.1:*")) origins.add("http://127.0.0.1:*");
        if (!origins.contains("https://*.vercel.app")) origins.add("https://*.vercel.app");

        configuration.setAllowedOriginPatterns(origins);
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "Cache-Control", "X-Requested-With"));
        configuration.setExposedHeaders(Collections.singletonList("Authorization"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    private OAuth2AuthorizationRequestResolver authorizationRequestResolver(
            ClientRegistrationRepository clientRegistrationRepository) {
        DefaultOAuth2AuthorizationRequestResolver authorizationRequestResolver =
                new DefaultOAuth2AuthorizationRequestResolver(
                        clientRegistrationRepository, "/oauth2/authorization");
        authorizationRequestResolver.setAuthorizationRequestCustomizer(
                customizer -> customizer.additionalParameters(params -> params.put("prompt", "select_account"))
        );
        return authorizationRequestResolver;
    }
}
