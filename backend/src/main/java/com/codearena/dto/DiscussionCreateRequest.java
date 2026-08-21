package com.codearena.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class DiscussionCreateRequest {
    @NotBlank(message = "Content cannot be blank")
    private String content;

    private Long parentId;
}
