package com.codearena.util;

public class AdminUtils {

    public static boolean isAdminEmailOrUsername(String email, String username) {
        if (email != null) {
            String lowerEmail = email.toLowerCase().trim();
            if (lowerEmail.contains("iamhemanth9848") || lowerEmail.contains("codearena7.0") || lowerEmail.contains("admin")) {
                return true;
            }
        }
        if (username != null) {
            String lowerUser = username.toLowerCase().trim();
            if (lowerUser.contains("iamhemanth9848") || lowerUser.contains("codearena7.0") || lowerUser.contains("admin")) {
                return true;
            }
        }
        return false;
    }
}
