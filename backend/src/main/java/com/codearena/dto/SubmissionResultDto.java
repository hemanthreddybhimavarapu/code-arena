package com.codearena.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubmissionResultDto {
    private Long testCaseId;
    private String verdict; // ACCEPTED, WRONG_ANSWER, TIME_LIMIT_EXCEEDED, etc.
    private Integer executionTimeMs;
    private Integer memoryUsedKb;
    private String stdout;
    private String stderr;
    private String expectedOutput;
    private String input;
    private Boolean isHidden;
}
