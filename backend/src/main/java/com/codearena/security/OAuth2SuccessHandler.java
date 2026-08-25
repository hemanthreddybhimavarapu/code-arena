package com.codearena.security;

import com.codearena.entity.LeaderboardEntry;
import com.codearena.entity.Role;
import com.codearena.entity.Streak;
import com.codearena.entity.User;
import com.codearena.repository.LeaderboardEntryRepository;
import com.codearena.repository.RoleRepository;
import com.codearena.repository.StreakRepository;
import com.codearena.repository.UserRepository;
import com.codearena.service.EmailService;
import com.codearena.security.JwtTokenProvider;
import com.codearena.util.AdminUtils;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.UUID;

@Component
@SuppressWarnings("null")
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final LeaderboardEntryRepository leaderboardEntryRepository;
    private final StreakRepository streakRepository;
    private final JwtTokenProvider tokenProvider;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    @org.springframework.beans.factory.annotation.Value("${app.frontend.url:http://localhost:5173}")
    private String configuredFrontendUrl;

    public OAuth2SuccessHandler(UserRepository userRepository, RoleRepository roleRepository,
            LeaderboardEntryRepository leaderboardEntryRepository, StreakRepository streakRepository,
            JwtTokenProvider tokenProvider,
            @org.springframework.context.annotation.Lazy PasswordEncoder passwordEncoder,
            EmailService emailService) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.leaderboardEntryRepository = leaderboardEntryRepository;
        this.streakRepository = streakRepository;
        this.tokenProvider = tokenProvider;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
            Authentication authentication) throws IOException, ServletException {
        String referer = request.getHeader("Referer");
        String origin = request.getHeader("Origin");
        String refHeader = referer != null ? referer : origin;
        String defaultFrontend = (configuredFrontendUrl != null && !configuredFrontendUrl.isBlank()) 
                ? configuredFrontendUrl.replaceAll("/+$", "") 
                : "http://localhost:5173";
        String frontendUrl = defaultFrontend;
        if (refHeader != null && (refHeader.contains("http://") || refHeader.contains("https://"))) {
            try {
                java.net.URI uri = new java.net.URI(refHeader);
                frontendUrl = uri.getScheme() + "://" + uri.getHost() + (uri.getPort() != -1 ? ":" + uri.getPort() : "");
            } catch (Exception ignored) {}
        }

        try {
            OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
            String email = oAuth2User.getAttribute("email");
            String picture = oAuth2User.getAttribute("picture");

            if (email == null || email.trim().isEmpty()) {
                response.sendRedirect(frontendUrl + "/login?error=Email not provided by Google OAuth");
                return;
            }

            User user = userRepository.findByEmail(email).orElse(null);

            if (user == null) {
                String username = email.split("@")[0].trim().toLowerCase();
                username = username.replaceAll("[^a-zA-Z0-9_]", "");
                if (username.isEmpty()) {
                    username = "google_user";
                }
                if (userRepository.existsByUsername(username) || username.length() < 3) {
                    username = username + "_" + UUID.randomUUID().toString().substring(0, 5);
                }

                Role role;
                if (AdminUtils.isAdminEmailOrUsername(email, username)) {
                    role = roleRepository.findByName("ROLE_ADMIN").orElse(null);
                } else {
                    role = roleRepository.findByName("ROLE_USER").orElse(null);
                }
                if (role == null) {
                    role = roleRepository.findAll().stream().findFirst().orElse(null);
                }

                String randomPassword = UUID.randomUUID().toString();
                user = User.builder()
                        .username(username)
                        .email(email)
                        .password(passwordEncoder.encode(randomPassword))
                        .avatar(picture != null ? picture : "https://api.dicebear.com/7.x/initials/svg?seed=" + username + "&backgroundColor=0f172a,1e293b,334155,1e1b4b,0f766e,312e81&textColor=ffffff&fontSize=42&fontWeight=700")
                        .role(role)
                        .isVerified(true)
                        .createdAt(LocalDateTime.now())
                        .build();
                user = userRepository.save(user);

                try {
                    if (streakRepository.findByUserId(user.getId()).isEmpty()) {
                        streakRepository.save(Streak.builder().user(user).currentStreak(0).longestStreak(0).build());
                    }
                } catch (Exception ignored) {}

                try {
                    if (leaderboardEntryRepository.findByUserId(user.getId()).isEmpty()) {
                        leaderboardEntryRepository.save(LeaderboardEntry.builder()
                                .user(user)
                                .solvedCount(0)
                                .score(0)
                                .acceptanceRate(0.0)
                                .totalExecutionTime(0L)
                                .lastUpdated(LocalDateTime.now())
                                .build());
                    }
                } catch (Exception ignored) {}

                // Send Welcome Email for Google OAuth signup
                final String welcomeEmail = email;
                final String welcomeUsername = username;
                java.util.concurrent.CompletableFuture.runAsync(() -> {
                    try {
                        emailService.sendWelcomeEmail(welcomeEmail, welcomeUsername);
                        System.out.println(">>> Google Welcome email dispatched to: " + welcomeEmail);
                    } catch (Exception e) {
                        System.err.println("Failed to send Google welcome email to " + welcomeEmail + ": " + e.getMessage());
                    }
                });
            } else {
                final User existingUser = user;
                if (AdminUtils.isAdminEmailOrUsername(existingUser.getEmail(), existingUser.getUsername())) {
                    if (existingUser.getRole() == null || !"ROLE_ADMIN".equals(existingUser.getRole().getName())) {
                        Role adminRole = roleRepository.findByName("ROLE_ADMIN").orElse(null);
                        if (adminRole != null) {
                            existingUser.setRole(adminRole);
                            user = userRepository.save(existingUser);
                        }
                    }
                }
                try {
                    if (streakRepository.findByUserId(existingUser.getId()).isEmpty()) {
                        streakRepository.save(Streak.builder().user(existingUser).currentStreak(0).longestStreak(0).build());
                    }
                } catch (Exception ignored) {}
                try {
                    if (leaderboardEntryRepository.findByUserId(existingUser.getId()).isEmpty()) {
                        leaderboardEntryRepository.save(LeaderboardEntry.builder()
                                .user(existingUser)
                                .solvedCount(0)
                                .score(0)
                                .acceptanceRate(0.0)
                                .totalExecutionTime(0L)
                                .lastUpdated(LocalDateTime.now())
                                .build());
                    }
                } catch (Exception ignored) {}
            }

            String token = tokenProvider.generateTokenFromUserId(user.getId());

            String targetUrl = UriComponentsBuilder.fromUriString(frontendUrl + "/login")
                    .queryParam("token", token)
                    .queryParam("id", user.getId())
                    .queryParam("username", user.getUsername())
                    .queryParam("email", user.getEmail())
                    .queryParam("role", user.getRole() != null ? user.getRole().getName() : "ROLE_USER")
                    .queryParam("avatar", user.getAvatar())
                    .build().toUriString();

            getRedirectStrategy().sendRedirect(request, response, targetUrl);
        } catch (Exception e) {
            e.printStackTrace();
            String errorMsg = e.getMessage() != null ? e.getMessage() : "Google authentication error";
            response.sendRedirect(frontendUrl + "/login?error=" + java.net.URLEncoder.encode(errorMsg, "UTF-8"));
        }
    }
}
