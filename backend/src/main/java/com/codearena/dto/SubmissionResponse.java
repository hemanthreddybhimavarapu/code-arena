package com.codearena.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubmissionResponse {
    private Long id;
    private Long problemId;
    private String problemTitle;
    private String language;
    private String verdict;
    private Integer executionTimeMs;
    private Integer memoryUsedKb;
    private LocalDateTime createdAt;
    private String code;
    private List<SubmissionResultDto> results;
}
