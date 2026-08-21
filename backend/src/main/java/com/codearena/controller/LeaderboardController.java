package com.codearena.controller;

import com.codearena.dto.ApiResponse;
import com.codearena.dto.LeaderboardEntryDto;
import com.codearena.service.LeaderboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
@RequestMapping("/api/leaderboard")
public class LeaderboardController {

    private final LeaderboardService leaderboardService;

    public LeaderboardController(LeaderboardService leaderboardService) {
        this.leaderboardService = leaderboardService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<LeaderboardEntryDto>>> getLeaderboard(
            @org.springframework.web.bind.annotation.RequestParam(required = false) String type,
            @org.springframework.web.bind.annotation.RequestParam(required = false) String language) {
        
        List<LeaderboardEntryDto> leaderboard;
        boolean hasLanguage = language != null && !language.trim().isEmpty();
        boolean isWeekly = "weekly".equalsIgnoreCase(type);

        if (hasLanguage && isWeekly) {
            leaderboard = leaderboardService.getWeeklyLanguageLeaderboard(language.trim());
        } else if (hasLanguage) {
            leaderboard = leaderboardService.getLanguageLeaderboard(language.trim());
        } else if (isWeekly) {
            leaderboard = leaderboardService.getWeeklyLeaderboard();
        } else if ("monthly".equalsIgnoreCase(type)) {
            leaderboard = leaderboardService.getMonthlyLeaderboard();
        } else {
            leaderboard = leaderboardService.getLeaderboard();
        }
        
        return ResponseEntity.ok(ApiResponse.success("Leaderboard fetched successfully!", leaderboard));
    }
}
