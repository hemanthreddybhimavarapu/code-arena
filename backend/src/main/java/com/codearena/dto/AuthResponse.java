package com.codearena.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String refreshToken;
    @Builder.Default
    private String tokenType = "Bearer";
    private Long id;
    private String username;
    private String email;
    private String role;
    private String avatar;
    private String name;
    private String bio;
    private Integer solvedCount;
    private Boolean isActive;
    private Boolean isBanned;
    private Boolean isVerified;
}
