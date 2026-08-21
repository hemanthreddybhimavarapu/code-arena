package com.codearena.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsDto {
    private Integer solvedCount;
    private Integer attemptingCount;
    private Integer totalActiveDays;
    private Integer totalProblemsCount;
    private Integer solvedToday;
    private Integer solvedEasy;
    private Integer solvedMedium;
    private Integer solvedHard;
    private Integer totalEasy;
    private Integer totalMedium;
    private Integer totalHard;
    private Integer currentStreak;
    private Integer longestStreak;
    private Double acceptanceRate;
    private Integer userRank;
    private Map<String, Long> languageStats;
    private Map<String, Long> submissionsCalendar; // Format: "YYYY-MM-DD" -> count
    private List<SubmissionResponse> recentSubmissions;
    private List<String> achievements;
}
