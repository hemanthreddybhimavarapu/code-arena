package com.codearena.config;

import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import javax.sql.DataSource;
import java.net.URI;

@Configuration
public class DatabaseConfig {

    @Bean
    @Primary
    public DataSource dataSource(DataSourceProperties properties) {
        String rawUrl = properties.getUrl();
        if (rawUrl == null || rawUrl.isBlank()) {
            rawUrl = System.getenv("SPRING_DATASOURCE_URL");
        }
        if (rawUrl == null || rawUrl.isBlank()) {
            rawUrl = System.getenv("DATABASE_URL");
        }

        if (rawUrl != null && !rawUrl.isBlank()) {
            String cleanUrl = rawUrl.trim();
            if (cleanUrl.startsWith("postgres://") || cleanUrl.startsWith("postgresql://")) {
                try {
                    String uriString = cleanUrl.replace("jdbc:", "");
                    if (uriString.startsWith("postgres://")) {
                        uriString = "postgresql://" + uriString.substring("postgres://".length());
                    }
                    URI uri = new URI(uriString);
                    String host = uri.getHost();
                    int port = uri.getPort() != -1 ? uri.getPort() : 5432;
                    String path = uri.getPath();

                    String jdbcUrl = "jdbc:postgresql://" + host + ":" + port + path;
                    properties.setUrl(jdbcUrl);

                    if (uri.getUserInfo() != null && !uri.getUserInfo().isBlank()) {
                        String[] userInfo = uri.getUserInfo().split(":", 2);
                        properties.setUsername(userInfo[0]);
                        if (userInfo.length > 1) {
                            properties.setPassword(userInfo[1]);
                        }
                    }
                } catch (Exception e) {
                    if (!cleanUrl.startsWith("jdbc:")) {
                        cleanUrl = "jdbc:" + cleanUrl;
                    }
                    properties.setUrl(cleanUrl);
                }
            } else {
                properties.setUrl(cleanUrl);
            }
        }

        return properties.initializeDataSourceBuilder().build();
    }
}
