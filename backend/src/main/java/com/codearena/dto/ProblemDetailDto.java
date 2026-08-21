package com.codearena.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProblemDetailDto {
    private Long id;
    private String title;
    private String description;
    private String difficulty;
    private String constraints;
    private String starterCodeJava;
    private String starterCodePython;
    private String starterCodeC;
    private String starterCodeCpp;
    private String starterCodeJs;
    private Integer timeLimitMs;
    private Integer memoryLimitMb;
    private Set<String> tags;
    private List<HintDto> hints;
    private List<TestCaseDto> testCases;
    private String editorial;
    private List<EditorialStepDto> editorials;
    private Boolean isBookmarked;
    private Boolean isSolved;
}
