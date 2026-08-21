package com.codearena.service;

import com.codearena.dto.LeaderboardEntryDto;
import com.codearena.entity.LeaderboardEntry;
import com.codearena.repository.LeaderboardEntryRepository;
import com.codearena.repository.SubmissionRepository;
import com.codearena.util.AdminUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.ArrayList;
import java.util.List;

import java.time.LocalDateTime;

@Service
public class LeaderboardService {

    private final LeaderboardEntryRepository leaderboardEntryRepository;
    private final SubmissionRepository submissionRepository;

    public LeaderboardService(LeaderboardEntryRepository leaderboardEntryRepository,
                              SubmissionRepository submissionRepository) {
        this.leaderboardEntryRepository = leaderboardEntryRepository;
        this.submissionRepository = submissionRepository;
    }

    @Transactional(readOnly = true)
    public List<LeaderboardEntryDto> getLeaderboard() {
        List<LeaderboardEntry> entries = leaderboardEntryRepository.findAllByOrderByScoreDescSolvedCountDescTotalExecutionTimeAscAcceptanceRateDescLastUpdatedAsc();
        List<LeaderboardEntryDto> dtos = new ArrayList<>();
        int rank = 1;
        for (LeaderboardEntry entry : entries) {
            if ((entry.getUser().getRole() != null && "ROLE_ADMIN".equals(entry.getUser().getRole().getName())) || AdminUtils.isAdminEmailOrUsername(entry.getUser().getEmail(), entry.getUser().getUsername())) {
                continue;
            }
            dtos.add(LeaderboardEntryDto.builder()
                    .id(entry.getId())
                    .userId(entry.getUser().getId())
                    .username(entry.getUser().getUsername())
                    .avatar(entry.getUser().getAvatar())
                    .solvedCount(entry.getSolvedCount())
                    .score(entry.getScore())
                    .acceptanceRate(entry.getAcceptanceRate())
                    .totalExecutionTime(entry.getTotalExecutionTime())
                    .rank(rank++)
                    .build());
        }
        return dtos;
    }

    @Transactional(readOnly = true)
    public List<LeaderboardEntryDto> getWeeklyLeaderboard() {
        LocalDateTime oneWeekAgo = LocalDateTime.now().minusWeeks(1);
        List<Object[]> rows = submissionRepository.getLeaderboardByDateAfterNative(oneWeekAgo);
        return mapToDtos(rows);
    }

    @Transactional(readOnly = true)
    public List<LeaderboardEntryDto> getMonthlyLeaderboard() {
        LocalDateTime oneMonthAgo = LocalDateTime.now().minusDays(30);
        List<Object[]> rows = submissionRepository.getLeaderboardByDateAfterNative(oneMonthAgo);
        return mapToDtos(rows);
    }

    @Transactional(readOnly = true)
    public List<LeaderboardEntryDto> getLanguageLeaderboard(String language) {
        List<Object[]> rows = submissionRepository.getLeaderboardByLanguageNative(language);
        return mapToDtos(rows);
    }

    @Transactional(readOnly = true)
    public List<LeaderboardEntryDto> getWeeklyLanguageLeaderboard(String language) {
        LocalDateTime oneWeekAgo = LocalDateTime.now().minusWeeks(1);
        List<Object[]> rows = submissionRepository.getLeaderboardByDateAndLanguageNative(oneWeekAgo, language);
        return mapToDtos(rows);
    }

    private List<LeaderboardEntryDto> mapToDtos(List<Object[]> rows) {
        List<LeaderboardEntryDto> dtos = new ArrayList<>();
        int rank = 1;
        for (Object[] row : rows) {
            Number userId = (Number) row[0];
            String username = (String) row[1];
            String avatar = (String) row[2];
            Number solvedCount = (Number) row[3];
            Number score = (Number) row[4];

            dtos.add(LeaderboardEntryDto.builder()
                    .id(null)
                    .userId(userId != null ? userId.longValue() : null)
                    .username(username)
                    .avatar(avatar)
                    .solvedCount(solvedCount != null ? solvedCount.intValue() : 0)
                    .score(score != null ? score.intValue() : 0)
                    .acceptanceRate(0.0)
                    .totalExecutionTime(0L)
                    .rank(rank++)
                    .build());
        }
        return dtos;
    }
}
