package com.codearena.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeaderboardEntryDto {
    private Long id;
    private Long userId;
    private String username;
    private String avatar;
    private Integer solvedCount;
    private Integer score;
    private Double acceptanceRate;
    private Long totalExecutionTime;
    private Integer rank;
}
