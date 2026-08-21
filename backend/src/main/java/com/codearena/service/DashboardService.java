package com.codearena.service;

import com.codearena.dto.DashboardStatsDto;
import com.codearena.dto.SubmissionResponse;
import com.codearena.entity.*;
import com.codearena.exception.ResourceNotFoundException;
import com.codearena.repository.*;
import com.codearena.util.AdminUtils;
import com.codearena.security.UserPrincipal;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@SuppressWarnings("null")
public class DashboardService {

    private final UserRepository userRepository;
    private final ProblemRepository problemRepository;
    private final SubmissionRepository submissionRepository;
    private final StreakRepository streakRepository;
    private final LeaderboardEntryRepository leaderboardEntryRepository;

    public DashboardService(UserRepository userRepository, ProblemRepository problemRepository,
                            SubmissionRepository submissionRepository, StreakRepository streakRepository,
                            LeaderboardEntryRepository leaderboardEntryRepository) {
        this.userRepository = userRepository;
        this.problemRepository = problemRepository;
        this.submissionRepository = submissionRepository;
        this.streakRepository = streakRepository;
        this.leaderboardEntryRepository = leaderboardEntryRepository;
    }

    @Transactional
    public DashboardStatsDto getDashboardStats(UserPrincipal principal) {
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        List<Problem> allProblems = problemRepository.findAll();
        long totalEasy = allProblems.stream().filter(p -> p.getDifficulty() == Difficulty.EASY).count();
        long totalMedium = allProblems.stream().filter(p -> p.getDifficulty() == Difficulty.MEDIUM).count();
        long totalHard = allProblems.stream().filter(p -> p.getDifficulty() == Difficulty.HARD).count();

        // Get user submissions
        List<Submission> userSubmissions = submissionRepository.findByUserIdOrderByCreatedAtDesc(user.getId());

        // Find unique solved problems & attempted problems
        Set<Long> solvedProblemIds = userSubmissions.stream()
                .filter(s -> s.getVerdict() == Verdict.ACCEPTED)
                .map(s -> s.getProblem().getId())
                .collect(Collectors.toSet());

        Set<Long> attemptedProblemIds = userSubmissions.stream()
                .map(s -> s.getProblem().getId())
                .collect(Collectors.toSet());

        long attemptingCount = attemptedProblemIds.stream()
                .filter(id -> !solvedProblemIds.contains(id))
                .count();

        List<Problem> solvedProblems = allProblems.stream()
                .filter(p -> solvedProblemIds.contains(p.getId()))
                .collect(Collectors.toList());

        long solvedEasy = solvedProblems.stream().filter(p -> p.getDifficulty() == Difficulty.EASY).count();
        long solvedMedium = solvedProblems.stream().filter(p -> p.getDifficulty() == Difficulty.MEDIUM).count();
        long solvedHard = solvedProblems.stream().filter(p -> p.getDifficulty() == Difficulty.HARD).count();

        // Streaks
        Streak streak = streakRepository.findByUserId(user.getId())
                .orElseGet(() -> Streak.builder().user(user).currentStreak(0).longestStreak(0).build());

        java.time.LocalDate today = java.time.LocalDate.now();
        if (streak.getLastSolvedDate() != null) {
            long daysBetween = java.time.temporal.ChronoUnit.DAYS.between(streak.getLastSolvedDate(), today);
            if (daysBetween > 1) {
                streak.setCurrentStreak(0);
                streakRepository.save(streak);
            }
        }

        java.time.LocalDateTime startOfDay = today.atStartOfDay();
        java.time.LocalDateTime endOfDay = today.atTime(23, 59, 59, 999999999);
        long solvedToday = submissionRepository.countDistinctProblemsSolvedByUserIdAndDate(user.getId(), startOfDay, endOfDay);

        // Leaderboard stats (solved count, score, acceptance rate)
        LeaderboardEntry entry = leaderboardEntryRepository.findByUserId(user.getId())
                .orElseGet(() -> LeaderboardEntry.builder().user(user).solvedCount(0).score(0).acceptanceRate(0.0).build());

        // Language stats (accepted submissions per language)
        Map<String, Long> languageStats = userSubmissions.stream()
                .filter(s -> s.getVerdict() == Verdict.ACCEPTED)
                .collect(Collectors.groupingBy(Submission::getLanguage, Collectors.counting()));

        // Submissions calendar YYYY-MM-DD -> count
        Map<String, Long> calendar = userSubmissions.stream()
                .collect(Collectors.groupingBy(
                        s -> s.getCreatedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd")),
                        Collectors.counting()
                ));

        // Recent submissions (limit to 10)
        List<SubmissionResponse> recentSubmissions = userSubmissions.stream()
                .limit(10)
                .map(s -> SubmissionResponse.builder()
                        .id(s.getId())
                        .problemId(s.getProblem().getId())
                        .problemTitle(s.getProblem().getTitle())
                        .language(s.getLanguage())
                        .verdict(s.getVerdict() != null ? s.getVerdict().name() : null)
                        .executionTimeMs(s.getExecutionTimeMs())
                        .memoryUsedKb(s.getMemoryUsedKb())
                        .createdAt(s.getCreatedAt())
                        .build())
                .collect(Collectors.toList());

        // Achievements list
        List<String> achievements = new ArrayList<>();
        int solvedCount = solvedProblemIds.size();
        if (solvedCount >= 1) {
            achievements.add("First Blood: Solved your first problem");
        }
        if (solvedCount >= 5) {
            achievements.add("Code Scholar: Solved 5 problems");
        }
        if (solvedCount >= 15) {
            achievements.add("Coding Guru: Solved 15 problems");
        }
        if (streak.getLongestStreak() >= 3) {
            achievements.add("Consistent Coder: Maintained a 3+ day streak");
        }
        if ((user.getRole() != null && "ROLE_ADMIN".equals(user.getRole().getName())) || AdminUtils.isAdminEmailOrUsername(user.getEmail(), user.getUsername())) {
            achievements.add("System Overlord: Holds Admin access");
        }

        // Leaderboard rank calculation
        List<LeaderboardEntry> allEntries = leaderboardEntryRepository.findAll();
        allEntries.sort((a, b) -> {
            int scoreCmp = Integer.compare(b.getScore() != null ? b.getScore() : 0, a.getScore() != null ? a.getScore() : 0);
            if (scoreCmp != 0) return scoreCmp;
            return Integer.compare(b.getSolvedCount() != null ? b.getSolvedCount() : 0, a.getSolvedCount() != null ? a.getSolvedCount() : 0);
        });
        int userRank = 1;
        for (int i = 0; i < allEntries.size(); i++) {
            if (allEntries.get(i).getUser() != null && allEntries.get(i).getUser().getId().equals(user.getId())) {
                userRank = i + 1;
                break;
            }
        }

        return DashboardStatsDto.builder()
                .solvedCount(solvedCount)
                .attemptingCount((int) attemptingCount)
                .totalActiveDays(calendar.size())
                .totalProblemsCount(allProblems.size())
                .solvedToday((int) solvedToday)
                .solvedEasy((int) solvedEasy)
                .solvedMedium((int) solvedMedium)
                .solvedHard((int) solvedHard)
                .totalEasy((int) totalEasy)
                .totalMedium((int) totalMedium)
                .totalHard((int) totalHard)
                .currentStreak(streak.getCurrentStreak())
                .longestStreak(streak.getLongestStreak())
                .acceptanceRate(entry.getAcceptanceRate())
                .userRank(userRank)
                .languageStats(languageStats)
                .submissionsCalendar(calendar)
                .recentSubmissions(recentSubmissions)
                .achievements(achievements)
                .build();
    }
}
