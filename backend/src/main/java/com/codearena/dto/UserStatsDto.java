package com.codearena.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserStatsDto {
    private Integer solvedCount;
    private Integer score;
    private Double acceptanceRate;
    private Integer currentStreak;
    private Integer longestStreak;
    private Long totalSubmissions;
    private Long acceptedSubmissions;
    private List<SubmissionResponse> recentSubmissions;
}
