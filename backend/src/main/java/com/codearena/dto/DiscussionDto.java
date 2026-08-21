package com.codearena.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DiscussionDto {
    private Long id;
    private Long problemId;
    private Long userId;
    private String username;
    private String userAvatar;
    private String content;
    private Long parentId;
    private LocalDateTime createdAt;
}
