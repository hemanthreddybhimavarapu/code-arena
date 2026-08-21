package com.codearena.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProblemDto {
    private Long id;
    private String title;
    private String difficulty;
    private Set<String> tags;
    private Double acceptanceRate;
    private Boolean isSolved;
    private Boolean isAttempted;
}
