package com.codearena.service;

import com.codearena.dto.*;
import com.codearena.entity.*;
import com.codearena.exception.BadRequestException;
import com.codearena.exception.ResourceNotFoundException;
import com.codearena.repository.*;
import com.codearena.security.UserPrincipal;
import com.codearena.util.AdminUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@SuppressWarnings("null")
public class SubmissionService {

    private final SubmissionRepository submissionRepository;
    private final SubmissionResultRepository submissionResultRepository;
    private final ProblemRepository problemRepository;
    private final TestCaseRepository testCaseRepository;
    private final UserRepository userRepository;
    private final LeaderboardEntryRepository leaderboardEntryRepository;
    private final StreakRepository streakRepository;
    private final CodeExecutionService codeExecutionService;

    public SubmissionService(SubmissionRepository submissionRepository,
                             SubmissionResultRepository submissionResultRepository,
                             ProblemRepository problemRepository,
                             TestCaseRepository testCaseRepository,
                             UserRepository userRepository,
                             LeaderboardEntryRepository leaderboardEntryRepository,
                             StreakRepository streakRepository,
                             CodeExecutionService codeExecutionService) {
        this.submissionRepository = submissionRepository;
        this.submissionResultRepository = submissionResultRepository;
        this.problemRepository = problemRepository;
        this.testCaseRepository = testCaseRepository;
        this.userRepository = userRepository;
        this.leaderboardEntryRepository = leaderboardEntryRepository;
        this.streakRepository = streakRepository;
        this.codeExecutionService = codeExecutionService;
    }

    @Transactional
    public SubmissionResponse submit(Long problemId, SubmissionRequest request, UserPrincipal principal) {
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Problem problem = problemRepository.findById(problemId)
                .orElseThrow(() -> new ResourceNotFoundException("Problem not found"));

        if ((user.getRole() != null && "ROLE_ADMIN".equals(user.getRole().getName())) || AdminUtils.isAdminEmailOrUsername(user.getEmail(), user.getUsername())) {
            throw new BadRequestException("Admins are not allowed to submit solutions.");
        }

        // Rate limiting: 5 submissions per minute per problem
        LocalDateTime oneMinuteAgo = LocalDateTime.now().minusMinutes(1);
        long count = submissionRepository.countByUserIdAndProblemIdAndCreatedAtAfter(user.getId(), problemId, oneMinuteAgo);
        if (count >= 5) {
            throw new BadRequestException("Rate limit exceeded. Max 5 submissions per minute per problem.");
        }

        List<TestCase> testCases = testCaseRepository.findByProblemId(problemId);
        if (testCases.isEmpty()) {
            throw new BadRequestException("No test cases defined for this problem.");
        }
        for (int i = 0; i < testCases.size(); i++) {
            testCases.get(i).setIsHidden(i >= 3);
        }

        // Save preliminary PENDING submission
        Submission submission = Submission.builder()
                .user(user)
                .problem(problem)
                .code(request.getCode())
                .language(request.getLanguage())
                .verdict(Verdict.PENDING)
                .createdAt(LocalDateTime.now())
                .build();
        submission = submissionRepository.save(submission);

        // Execute code
        List<SubmissionResultDto> testResults = codeExecutionService.execute(
                request.getCode(),
                request.getLanguage(),
                testCases,
                problem.getTimeLimitMs()
        );

        // Calculate final verdict, time, memory
        Verdict finalVerdict = Verdict.ACCEPTED;
        int totalTime = 0;
        int maxMemory = 0;

        for (SubmissionResultDto r : testResults) {
            if (r.getExecutionTimeMs() > totalTime) {
                totalTime = r.getExecutionTimeMs();
            }
            if (r.getMemoryUsedKb() > maxMemory) {
                maxMemory = r.getMemoryUsedKb();
            }

            // The first failing verdict overrides ACCEPTED
            Verdict currentVerdict = Verdict.valueOf(r.getVerdict());
            if (finalVerdict == Verdict.ACCEPTED && currentVerdict != Verdict.ACCEPTED) {
                finalVerdict = currentVerdict;
            }
        }

        submission.setVerdict(finalVerdict);
        submission.setExecutionTimeMs(totalTime);
        submission.setMemoryUsedKb(maxMemory);
        submissionRepository.save(submission);

        // Save individual results
        for (int i = 0; i < testCases.size(); i++) {
            TestCase tc = testCases.get(i);
            SubmissionResultDto rd = testResults.get(i);

            SubmissionResult res = SubmissionResult.builder()
                    .submission(submission)
                    .testCase(tc)
                    .verdict(Verdict.valueOf(rd.getVerdict()))
                    .executionTimeMs(rd.getExecutionTimeMs())
                    .memoryUsedKb(rd.getMemoryUsedKb())
                    .stdout(rd.getStdout())
                    .stderr(rd.getStderr())
                    .build();
            submissionResultRepository.save(res);
        }

        // Update stats and streak
        updateUserStats(user, problem, finalVerdict, totalTime);
        if (finalVerdict == Verdict.ACCEPTED) {
            updateUserStreak(user);
        }

        return mapToResponse(submission, testResults);
    }

    @Transactional
    public SubmissionResponse run(Long problemId, SubmissionRequest request, UserPrincipal principal) {
        Problem problem = problemRepository.findById(problemId)
                .orElseThrow(() -> new ResourceNotFoundException("Problem not found"));

        List<TestCase> testCases;
        boolean isCustom = request.getCustomInput() != null && !request.getCustomInput().trim().isEmpty();

        if (isCustom) {
            TestCase customTc = new TestCase();
            customTc.setInput(request.getCustomInput());
            customTc.setExpectedOutput("");
            customTc.setIsHidden(false);
            testCases = List.of(customTc);
        } else {
            List<TestCase> allTestCases = testCaseRepository.findByProblemId(problemId);
            if (allTestCases.isEmpty()) {
                throw new BadRequestException("No test cases defined for this problem.");
            }
            testCases = allTestCases.stream()
                    .limit(3)
                    .peek(tc -> tc.setIsHidden(false))
                    .collect(Collectors.toList());
        }

        // Execute code
        List<SubmissionResultDto> testResults = codeExecutionService.execute(
                request.getCode(),
                request.getLanguage(),
                testCases,
                problem.getTimeLimitMs()
        );

        // Calculate final verdict, time, memory (but do not save to DB)
        Verdict finalVerdict = Verdict.ACCEPTED;
        int totalTime = 0;
        int maxMemory = 0;

        for (SubmissionResultDto r : testResults) {
            if (r.getExecutionTimeMs() > totalTime) {
                totalTime = r.getExecutionTimeMs();
            }
            if (r.getMemoryUsedKb() > maxMemory) {
                maxMemory = r.getMemoryUsedKb();
            }

            Verdict currentVerdict = Verdict.ACCEPTED;
            try {
                currentVerdict = Verdict.valueOf(r.getVerdict());
            } catch (Exception e) {
                // If it is custom execution, verdict could be SUCCESS or COMPILATION_ERROR / RUNTIME_ERROR
            }
            if (finalVerdict == Verdict.ACCEPTED && currentVerdict != Verdict.ACCEPTED) {
                finalVerdict = currentVerdict;
            }
        }

        if (isCustom) {
            if (testResults.get(0).getVerdict().equals("COMPILATION_ERROR")) {
                finalVerdict = Verdict.COMPILATION_ERROR;
            } else if (testResults.get(0).getVerdict().equals("RUNTIME_ERROR") || testResults.get(0).getVerdict().equals("TIME_LIMIT_EXCEEDED")) {
                finalVerdict = Verdict.valueOf(testResults.get(0).getVerdict());
            } else {
                finalVerdict = Verdict.ACCEPTED;
                testResults.get(0).setVerdict("SUCCESS");
            }
        }

        Submission mockSubmission = Submission.builder()
                .problem(problem)
                .code(request.getCode())
                .language(request.getLanguage())
                .verdict(finalVerdict)
                .executionTimeMs(totalTime)
                .memoryUsedKb(maxMemory)
                .createdAt(LocalDateTime.now())
                .build();

        return mapToResponse(mockSubmission, testResults);
    }

    @Transactional(readOnly = true)
    public List<SubmissionResponse> getSubmissionHistory(Long problemId, UserPrincipal principal) {
        List<Submission> submissions = submissionRepository.findByUserIdAndProblemIdOrderByCreatedAtDesc(principal.getId(), problemId);
        return submissions.stream().map(this::mapToResponseSimple).collect(Collectors.toList());
    }

    private void updateUserStats(User user, Problem problem, Verdict finalVerdict, int executionTime) {
        LeaderboardEntry entry = leaderboardEntryRepository.findByUserId(user.getId())
                .orElseGet(() -> LeaderboardEntry.builder()
                        .user(user)
                        .solvedCount(0)
                        .score(0)
                        .acceptanceRate(0.0)
                        .totalExecutionTime(0L)
                        .build());

        if (finalVerdict == Verdict.ACCEPTED) {
            // Solved count check (First time solving this problem?)
            List<Submission> acceptedSubmissions = submissionRepository.findByUserIdAndProblemIdOrderByCreatedAtDesc(user.getId(), problem.getId())
                    .stream()
                    .filter(s -> s.getVerdict() == Verdict.ACCEPTED)
                    .collect(Collectors.toList());

            boolean isFirstTime = acceptedSubmissions.size() <= 1; // Since we just saved one accepted submission

            if (isFirstTime) {
                int problemScore = switch (problem.getDifficulty()) {
                    case EASY -> 10;
                    case MEDIUM -> 20;
                    case HARD -> 30;
                };

                entry.setScore(entry.getScore() + problemScore);
                entry.setTotalExecutionTime(entry.getTotalExecutionTime() + executionTime);
            }
        }

        entry.setSolvedCount((int) submissionRepository.countDistinctProblemsSolvedByUserId(user.getId()));

        // Recalculate acceptance rate on every submission (accepted or rejected)
        long totalSubmissions = submissionRepository.countByUserId(user.getId());
        long acceptedSubmissionsCount = submissionRepository.countByUserIdAndVerdict(user.getId(), Verdict.ACCEPTED);
        double rate = totalSubmissions > 0 ? ((double) acceptedSubmissionsCount / totalSubmissions) * 100.0 : 0.0;
        entry.setAcceptanceRate(rate);
        entry.setLastUpdated(LocalDateTime.now());
        leaderboardEntryRepository.save(entry);
    }

    private void updateUserStreak(User user) {
        LocalDate today = LocalDate.now();
        LocalDateTime startOfDay = today.atStartOfDay();
        LocalDateTime endOfDay = today.atTime(23, 59, 59, 999999999);
        long distinctSolvedToday = submissionRepository.countDistinctProblemsSolvedByUserIdAndDate(user.getId(), startOfDay, endOfDay);

        if (distinctSolvedToday >= 5) {
            Streak streak = streakRepository.findByUserId(user.getId())
                    .orElseGet(() -> Streak.builder().user(user).currentStreak(0).longestStreak(0).build());

            if (streak.getLastSolvedDate() == null || !streak.getLastSolvedDate().equals(today)) {
                if (streak.getLastSolvedDate() == null) {
                    streak.setCurrentStreak(1);
                } else {
                    long daysBetween = java.time.temporal.ChronoUnit.DAYS.between(streak.getLastSolvedDate(), today);
                    if (daysBetween == 1) {
                        streak.setCurrentStreak(streak.getCurrentStreak() + 1);
                    } else if (daysBetween > 1) {
                        streak.setCurrentStreak(1);
                    }
                }
                streak.setLongestStreak(Math.max(streak.getLongestStreak(), streak.getCurrentStreak()));
                streak.setLastSolvedDate(today);
                streakRepository.save(streak);
            }
        }
    }

    private SubmissionResponse mapToResponse(Submission submission, List<SubmissionResultDto> testResults) {
        return SubmissionResponse.builder()
                .id(submission.getId())
                .problemId(submission.getProblem().getId())
                .problemTitle(submission.getProblem().getTitle())
                .language(submission.getLanguage())
                .verdict(submission.getVerdict() != null ? submission.getVerdict().name() : null)
                .executionTimeMs(submission.getExecutionTimeMs())
                .memoryUsedKb(submission.getMemoryUsedKb())
                .createdAt(submission.getCreatedAt())
                .code(submission.getCode())
                .results(testResults)
                .build();
    }

    private SubmissionResponse mapToResponseSimple(Submission submission) {
        return SubmissionResponse.builder()
                .id(submission.getId())
                .problemId(submission.getProblem().getId())
                .problemTitle(submission.getProblem().getTitle())
                .language(submission.getLanguage())
                .verdict(submission.getVerdict() != null ? submission.getVerdict().name() : null)
                .executionTimeMs(submission.getExecutionTimeMs())
                .memoryUsedKb(submission.getMemoryUsedKb())
                .createdAt(submission.getCreatedAt())
                .code(submission.getCode())
                .build();
    }
}
