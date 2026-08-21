package com.codearena.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SubmissionRequest {
    @NotBlank(message = "Code cannot be empty")
    private String code;

    @NotBlank(message = "Language cannot be empty")
    private String language; // java, python, c, cpp, javascript

    private String customInput;
}
