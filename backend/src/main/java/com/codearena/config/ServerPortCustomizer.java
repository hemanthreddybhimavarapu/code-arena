package com.codearena.config;

import org.springframework.boot.web.embedded.tomcat.TomcatServletWebServerFactory;
import org.springframework.boot.web.server.WebServerFactoryCustomizer;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.ServerSocket;

@Component
public class ServerPortCustomizer implements WebServerFactoryCustomizer<TomcatServletWebServerFactory> {

    @Override
    public void customize(TomcatServletWebServerFactory factory) {
        String envPort = System.getenv("PORT");
        if (envPort != null && !envPort.isBlank()) {
            try {
                int port = Integer.parseInt(envPort.trim());
                factory.setPort(port);
                System.out.println(">>> Server running on configured PORT environment variable: " + port + " <<<");
                return;
            } catch (NumberFormatException ignored) {}
        }
        int defaultPort = 9090;
        if (!isPortAvailable(defaultPort)) {
            int fallbackPort = findAvailablePort(9091);
            System.out.println(">>> Port " + defaultPort + " is occupied. Automatically using fallback port " + fallbackPort + " <<<");
            factory.setPort(fallbackPort);
        }
    }

    private boolean isPortAvailable(int port) {
        try (ServerSocket serverSocket = new ServerSocket(port)) {
            serverSocket.setReuseAddress(true);
            return true;
        } catch (IOException e) {
            return false;
        }
    }

    private int findAvailablePort(int startPort) {
        for (int port = startPort; port <= startPort + 50; port++) {
            if (isPortAvailable(port)) {
                return port;
            }
        }
        return 0; // Dynamic random free port fallback
    }
}
