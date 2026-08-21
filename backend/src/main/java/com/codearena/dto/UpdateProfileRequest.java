package com.codearena.dto;

import lombok.Data;

@Data
public class UpdateProfileRequest {
    private String name;
    private String bio;
    private String avatar;
    private String oldPassword;
    private String newPassword;
}
