package com.codearena.service;

import com.codearena.dto.HintDto;
import com.codearena.dto.ProblemDetailDto;
import com.codearena.dto.ProblemDto;
import com.codearena.dto.TestCaseDto;
import com.codearena.dto.EditorialStepDto;
import com.codearena.entity.Bookmark;
import com.codearena.entity.Problem;
import com.codearena.entity.Difficulty;
import com.codearena.entity.Tag;
import com.codearena.entity.User;
import com.codearena.entity.Submission;
import com.codearena.entity.Verdict;
import com.codearena.entity.TestCase;
import com.codearena.exception.ResourceNotFoundException;
import com.codearena.repository.*;
import com.codearena.security.UserPrincipal;
import com.codearena.util.AdminUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Value;
import java.util.*;
import java.util.stream.Collectors;

@Service
@SuppressWarnings("null")
public class ProblemService {

    private final ProblemRepository problemRepository;
    private final BookmarkRepository bookmarkRepository;
    private final HintRepository hintRepository;
    private final EditorialRepository editorialRepository;
    private final UserRepository userRepository;
    private final TestCaseRepository testCaseRepository;
    private final SubmissionRepository submissionRepository;

    @Value("${app.limits.hints-failed-attempts:3}")
    private int hintsLimit;

    @Value("${app.limits.editorial-failed-attempts:3}")
    private int editorialLimit;

    public ProblemService(ProblemRepository problemRepository, BookmarkRepository bookmarkRepository,
            HintRepository hintRepository, EditorialRepository editorialRepository,
            UserRepository userRepository, TestCaseRepository testCaseRepository,
            SubmissionRepository submissionRepository) {
        this.problemRepository = problemRepository;
        this.bookmarkRepository = bookmarkRepository;
        this.hintRepository = hintRepository;
        this.editorialRepository = editorialRepository;
        this.userRepository = userRepository;
        this.testCaseRepository = testCaseRepository;
        this.submissionRepository = submissionRepository;
    }

    @Transactional(readOnly = true)
    public List<ProblemDto> getProblems(String query, String difficulty, String tag, UserPrincipal principal) {
        Difficulty diffEnum = null;
        if (difficulty != null && !difficulty.trim().isEmpty()) {
            try {
                diffEnum = Difficulty.valueOf(difficulty.trim().toUpperCase());
            } catch (IllegalArgumentException e) {
                // If invalid difficulty, search won't match any or we can handle it.
            }
        }
        List<Problem> problems = problemRepository.searchProblems(query, diffEnum, tag);
        
        java.util.Set<Long> solvedProblemIds = java.util.Collections.emptySet();
        java.util.Set<Long> attemptedProblemIds = java.util.Collections.emptySet();
        if (principal != null) {
            List<Submission> userSubmissions = submissionRepository.findByUserIdOrderByCreatedAtDesc(principal.getId());
            solvedProblemIds = userSubmissions.stream()
                    .filter(s -> s.getVerdict() == Verdict.ACCEPTED)
                    .map(s -> s.getProblem().getId())
                    .collect(Collectors.toSet());
            attemptedProblemIds = userSubmissions.stream()
                    .map(s -> s.getProblem().getId())
                    .collect(Collectors.toSet());
        }
        
        final java.util.Set<Long> finalSolvedProblemIds = solvedProblemIds;
        final java.util.Set<Long> finalAttemptedProblemIds = attemptedProblemIds;
        return problems.stream()
                .<ProblemDto>map(p -> mapToDto(
                    p, 
                    finalSolvedProblemIds.contains(p.getId()),
                    finalAttemptedProblemIds.contains(p.getId()) && !finalSolvedProblemIds.contains(p.getId())
                ))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ProblemDetailDto getProblemDetail(Long problemId, UserPrincipal principal) {
        Problem problem = problemRepository.findById(problemId)
                .orElseThrow(() -> new ResourceNotFoundException("Problem not found with id: " + problemId));

        boolean isBookmarked = false;
        boolean isSolved = false;
        int failedAttempts = 0;
        boolean isAdmin = false;

        if (principal != null) {
            isBookmarked = bookmarkRepository.existsByUserIdAndProblemId(principal.getId(), problemId);
            isAdmin = (principal.getUser().getRole() != null && "ROLE_ADMIN".equals(principal.getUser().getRole().getName()))
                    || AdminUtils.isAdminEmailOrUsername(principal.getEmail(), principal.getUsername())
                    || principal.getAuthorities().stream().anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));

            List<Submission> userSubmissions = submissionRepository
                    .findByUserIdAndProblemIdOrderByCreatedAtDesc(principal.getId(), problemId);
            isSolved = userSubmissions.stream().anyMatch(s -> s.getVerdict() == Verdict.ACCEPTED);
            failedAttempts = (int) userSubmissions.stream()
                    .filter(s -> s.getVerdict() != Verdict.ACCEPTED && s.getVerdict() != Verdict.PENDING)
                    .count();
        }

        final boolean finalIsAdmin = isAdmin;
        final boolean finalIsSolved = isSolved;
        final int finalFailedAttempts = failedAttempts;

        boolean showEditorial = isAdmin || isSolved || failedAttempts >= 3;

        List<HintDto> hints = hintRepository.findByProblemIdOrderByHintNumberAsc(problemId)
                .stream()
                .map(h -> {
                    int requiredFails = h.getHintNumber() * 3;
                    boolean isHintUnlocked = finalIsAdmin || finalIsSolved || finalFailedAttempts >= requiredFails;
                    return HintDto.builder()
                            .id(h.getId())
                            .hintNumber(h.getHintNumber())
                            .content(isHintUnlocked ? h.getContent()
                                    : "[Locked - Complete " + requiredFails + " failed attempts to unlock]")
                            .build();
                })
                .collect(Collectors.toList());

        // Ensure each problem has at least 5 progressive hints
        if (hints.size() < 5) {
            String[] defaultHintTemplates = {
                "Read the problem statement and constraints carefully. Understand the inputs and outputs.",
                "Consider the base cases and edge cases (e.g. empty inputs, negative numbers, extreme values).",
                "Think about the mathematical relationships or pattern logic inside the inputs.",
                "Try visualizing the solution steps using standard data structures like Arrays, Lists or Maps.",
                "Examine how to optimize the search space or execution runtime to avoid timeouts."
            };
            for (int i = hints.size() + 1; i <= 5; i++) {
                int requiredFails = i * 3;
                boolean isHintUnlocked = finalIsAdmin || finalIsSolved || finalFailedAttempts >= requiredFails;
                String defaultContent = defaultHintTemplates[i - 1];
                hints.add(HintDto.builder()
                        .id(null)
                        .hintNumber(i)
                        .content(isHintUnlocked ? defaultContent : "[Locked - Complete " + requiredFails + " failed attempts to unlock]")
                        .build());
            }
        }

        String editorialText = editorialRepository.findByProblemId(problemId)
                .map(e -> e.getContent())
                .orElse("Optimal Strategy:\n1. Analyze constraints.\n2. Design strategy.\n3. Implement solution.\n4. Analyze complexity.");

        String[] titles = {
            "Analyze Constraints",
            "Design Strategy",
            "Optimal Implementation",
            "Complexity Analysis"
        };

        List<EditorialStepDto> editorialSteps = new java.util.ArrayList<>();
        String[] parsedSteps = new String[4];
        java.util.Arrays.fill(parsedSteps, "");

        try {
            int idx1 = editorialText.indexOf("1.");
            int idx2 = editorialText.indexOf("2.");
            int idx3 = editorialText.indexOf("3.");
            int idx4 = editorialText.indexOf("4.");

            if (idx1 != -1 && idx2 != -1 && idx3 != -1 && idx4 != -1 && idx1 < idx2 && idx2 < idx3 && idx3 < idx4) {
                parsedSteps[0] = editorialText.substring(idx1, idx2).trim();
                parsedSteps[1] = editorialText.substring(idx2, idx3).trim();
                parsedSteps[2] = editorialText.substring(idx3, idx4).trim();
                parsedSteps[3] = editorialText.substring(idx4).trim();
            } else {
                String[] paras = editorialText.split("\n\n");
                for (int i = 0; i < 4; i++) {
                    if (i < paras.length) {
                        parsedSteps[i] = paras[i].trim();
                    } else {
                        parsedSteps[i] = "Review edge cases and compile the solution successfully.";
                    }
                }
            }
        } catch (Exception e) {
            for (int i = 0; i < 4; i++) {
                parsedSteps[i] = "Standard editorial strategy step " + (i + 1) + ".";
            }
        }

        for (int i = 0; i < 4; i++) {
            if (parsedSteps[i] == null || parsedSteps[i].trim().isEmpty()) {
                parsedSteps[i] = "Optimal strategy and layout details for step " + (i + 1) + ".";
            }
        }

        for (int i = 0; i < 4; i++) {
            int stepNum = i + 1;
            int requiredFails = 3;
            if (stepNum == 1) requiredFails = 3;
            else if (stepNum == 2) requiredFails = 6;
            else if (stepNum == 3) requiredFails = 9;
            else if (stepNum == 4) requiredFails = 10;

            boolean isStepUnlocked = finalIsAdmin || finalIsSolved || finalFailedAttempts >= requiredFails;

            editorialSteps.add(EditorialStepDto.builder()
                    .stepNumber(stepNum)
                    .title(titles[i])
                    .content(isStepUnlocked ? parsedSteps[i] : "[Locked - Complete " + requiredFails + " failed attempts to unlock]")
                    .build());
        }

        String editorial = showEditorial
                ? editorialText
                : "[Locked - Solve the problem or reach 3 failed attempts to unlock]";

        List<TestCase> dbTestCases = testCaseRepository.findByProblemId(problemId);
        for (int i = 0; i < dbTestCases.size(); i++) {
            dbTestCases.get(i).setIsHidden(i >= 3);
        }

        List<TestCaseDto> visibleTestCases = dbTestCases.stream()
                .filter(tc -> !tc.getIsHidden())
                .map(tc -> TestCaseDto.builder()
                        .id(tc.getId())
                        .input(tc.getInput())
                        .expectedOutput(tc.getExpectedOutput())
                        .isHidden(false)
                        .build())
                .collect(Collectors.toList());

        return ProblemDetailDto.builder()
                .id(problem.getId())
                .title(problem.getTitle())
                .description(problem.getDescription())
                .difficulty(problem.getDifficulty() != null ? problem.getDifficulty().name() : null)
                .constraints(problem.getConstraints())
                .starterCodeJava(problem.getStarterCodeJava())
                .starterCodePython(problem.getStarterCodePython())
                .starterCodeC(problem.getStarterCodeC())
                .starterCodeCpp(problem.getStarterCodeCpp())
                .starterCodeJs(problem.getStarterCodeJs())
                .timeLimitMs(problem.getTimeLimitMs())
                .memoryLimitMb(problem.getMemoryLimitMb())
                .tags(problem.getTags().stream().map(Tag::getName).collect(Collectors.toSet()))
                .hints(hints)
                .editorial(editorial)
                .editorials(editorialSteps)
                .isBookmarked(isBookmarked)
                .isSolved(isSolved)
                .testCases(visibleTestCases)
                .build();
    }

    @Transactional
    public boolean toggleBookmark(Long problemId, UserPrincipal principal) {
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Problem problem = problemRepository.findById(problemId)
                .orElseThrow(() -> new ResourceNotFoundException("Problem not found"));

        Optional<Bookmark> bookmarkOpt = bookmarkRepository.findByUserIdAndProblemId(user.getId(), problemId);
        if (bookmarkOpt.isPresent()) {
            bookmarkRepository.delete(bookmarkOpt.get());
            return false; // Bookmarked removed
        } else {
            bookmarkRepository.save(Bookmark.builder().user(user).problem(problem).build());
            return true; // Bookmarked added
        }
    }

    private ProblemDto mapToDto(Problem problem, boolean isSolved, boolean isAttempted) {
        long total = submissionRepository.countByProblemId(problem.getId());
        long accepted = submissionRepository.countByProblemIdAndVerdict(problem.getId(), Verdict.ACCEPTED);
        double rate = total > 0 ? ((double) accepted / total) * 100.0 : 0.0;

        return ProblemDto.builder()
                .id(problem.getId())
                .title(problem.getTitle())
                .difficulty(problem.getDifficulty() != null ? problem.getDifficulty().name() : null)
                .tags(problem.getTags().stream().map(Tag::getName).collect(Collectors.toSet()))
                .acceptanceRate(rate)
                .isSolved(isSolved)
                .isAttempted(isAttempted)
                .build();
    }
}
