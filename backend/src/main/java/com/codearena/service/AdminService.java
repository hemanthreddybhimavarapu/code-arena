package com.codearena.service;

import com.codearena.dto.*;
import com.codearena.entity.*;
import com.codearena.exception.BadRequestException;
import com.codearena.exception.ResourceNotFoundException;
import com.codearena.repository.*;
import com.codearena.util.AdminUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.util.*;
import java.util.stream.Collectors;

@Service
@SuppressWarnings("null")
public class AdminService {

    private final UserRepository userRepository;
    private final ProblemRepository problemRepository;
    private final TestCaseRepository testCaseRepository;
    private final HintRepository hintRepository;
    private final EditorialRepository editorialRepository;
    private final TagRepository tagRepository;
    private final SubmissionRepository submissionRepository;
    private final LeaderboardEntryRepository leaderboardEntryRepository;
    private final PasswordEncoder passwordEncoder;
    private final StreakRepository streakRepository;
    private final RoleRepository roleRepository;
    private final org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;
    private final SubmissionResultRepository submissionResultRepository;
    private final BookmarkRepository bookmarkRepository;
    private final DiscussionRepository discussionRepository;
    private final OtpRepository otpRepository;

    @jakarta.persistence.PersistenceContext
    private jakarta.persistence.EntityManager entityManager;

    public AdminService(UserRepository userRepository, ProblemRepository problemRepository,
                        TestCaseRepository testCaseRepository, HintRepository hintRepository,
                        EditorialRepository editorialRepository, TagRepository tagRepository,
                        SubmissionRepository submissionRepository, LeaderboardEntryRepository leaderboardEntryRepository,
                        PasswordEncoder passwordEncoder, StreakRepository streakRepository,
                        RoleRepository roleRepository,
                        org.springframework.jdbc.core.JdbcTemplate jdbcTemplate,
                        SubmissionResultRepository submissionResultRepository,
                        BookmarkRepository bookmarkRepository,
                        DiscussionRepository discussionRepository,
                        OtpRepository otpRepository) {
        this.userRepository = userRepository;
        this.problemRepository = problemRepository;
        this.testCaseRepository = testCaseRepository;
        this.hintRepository = hintRepository;
        this.editorialRepository = editorialRepository;
        this.tagRepository = tagRepository;
        this.submissionRepository = submissionRepository;
        this.leaderboardEntryRepository = leaderboardEntryRepository;
        this.passwordEncoder = passwordEncoder;
        this.streakRepository = streakRepository;
        this.roleRepository = roleRepository;
        this.jdbcTemplate = jdbcTemplate;
        this.submissionResultRepository = submissionResultRepository;
        this.bookmarkRepository = bookmarkRepository;
        this.discussionRepository = discussionRepository;
        this.otpRepository = otpRepository;
    }

    // User management
    @Transactional(readOnly = true)
    public List<AuthResponse> getAllUsers() {
        return userRepository.findAll().stream().map(u -> {
            Integer solved = leaderboardEntryRepository.findByUserId(u.getId())
                    .map(LeaderboardEntry::getSolvedCount)
                    .orElse(0);
            return AuthResponse.builder()
                    .id(u.getId())
                    .username(u.getUsername())
                    .email(u.getEmail())
                    .role(u.getRole() != null ? u.getRole().getName() : "")
                    .avatar(u.getAvatar())
                    .name(u.getName())
                    .bio(u.getBio())
                    .solvedCount(solved)
                    .isActive(u.getIsActive() == null || u.getIsActive())
                    .isBanned(u.getIsBanned() != null && u.getIsBanned())
                    .isVerified(u.getIsVerified())
                    .build();
        }).collect(Collectors.toList());
    }

    @Transactional
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (AdminUtils.isAdminEmailOrUsername(user.getEmail(), user.getUsername()) 
                || (user.getRole() != null && "ROLE_ADMIN".equals(user.getRole().getName()))) {
            throw new BadRequestException("Administrator accounts cannot be deleted or terminated.");
        }

        submissionResultRepository.deleteByUserId(userId);
        submissionRepository.deleteByUserId(userId);
        leaderboardEntryRepository.deleteByUserId(userId);
        streakRepository.deleteByUserId(userId);
        bookmarkRepository.deleteByUserId(userId);
        discussionRepository.deleteByUserId(userId);
        otpRepository.deleteByEmail(user.getEmail());

        userRepository.deleteById(userId);
    }

    // Problem CRUD
    @Transactional
    public Problem createProblem(ProblemDetailDto dto) {
        syncSequences();

        Set<Tag> tags = getOrCreateTags(dto.getTags());

        Difficulty difficulty = Difficulty.EASY;
        if (dto.getDifficulty() != null && !dto.getDifficulty().isBlank()) {
            try {
                difficulty = Difficulty.valueOf(dto.getDifficulty().toUpperCase());
            } catch (Exception ignored) {}
        }

        Problem problem = Problem.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .difficulty(difficulty)
                .constraints(dto.getConstraints())
                .starterCodeJava(dto.getStarterCodeJava())
                .starterCodePython(dto.getStarterCodePython())
                .starterCodeC(dto.getStarterCodeC())
                .starterCodeCpp(dto.getStarterCodeCpp())
                .starterCodeJs(dto.getStarterCodeJs())
                .timeLimitMs(dto.getTimeLimitMs() != null && dto.getTimeLimitMs() > 0 ? dto.getTimeLimitMs() : 5000)
                .memoryLimitMb(dto.getMemoryLimitMb() != null && dto.getMemoryLimitMb() > 0 ? dto.getMemoryLimitMb() : 512)
                .tags(tags)
                .build();

        checkForDuplicates(problem);

        problem = problemRepository.save(problem);

        // Add editorial
        if (dto.getEditorial() != null && !dto.getEditorial().isBlank()) {
            editorialRepository.save(Editorial.builder()
                    .problem(problem)
                    .content(dto.getEditorial())
                    .build());
        }

        // Add hints
        if (dto.getHints() != null) {
            for (HintDto h : dto.getHints()) {
                hintRepository.save(Hint.builder()
                        .problem(problem)
                        .hintNumber(h.getHintNumber())
                        .content(h.getContent())
                        .build());
            }
        }

        // Add test cases if provided directly
        if (dto.getTestCases() != null) {
            for (TestCaseDto tc : dto.getTestCases()) {
                testCaseRepository.save(TestCase.builder()
                        .problem(problem)
                        .input(tc.getInput())
                        .expectedOutput(tc.getExpectedOutput())
                        .isHidden(tc.getIsHidden() != null && tc.getIsHidden())
                        .build());
            }
        }

        return problem;
    }

    @Transactional
    public Problem editProblem(Long problemId, ProblemDetailDto dto) {
        Problem problem = problemRepository.findById(problemId)
                .orElseThrow(() -> new ResourceNotFoundException("Problem not found"));

        Problem testProblem = Problem.builder()
                .id(problemId)
                .title(dto.getTitle())
                .description(dto.getDescription())
                .build();
        checkForDuplicates(testProblem);

        Difficulty difficulty = Difficulty.EASY;
        if (dto.getDifficulty() != null && !dto.getDifficulty().isBlank()) {
            try {
                difficulty = Difficulty.valueOf(dto.getDifficulty().toUpperCase());
            } catch (Exception ignored) {}
        }

        problem.setTitle(dto.getTitle());
        problem.setDescription(dto.getDescription());
        problem.setDifficulty(difficulty);
        problem.setConstraints(dto.getConstraints());
        problem.setStarterCodeJava(dto.getStarterCodeJava());
        problem.setStarterCodePython(dto.getStarterCodePython());
        problem.setStarterCodeC(dto.getStarterCodeC());
        problem.setStarterCodeCpp(dto.getStarterCodeCpp());
        problem.setStarterCodeJs(dto.getStarterCodeJs());
        problem.setTimeLimitMs(dto.getTimeLimitMs() != null && dto.getTimeLimitMs() > 0 ? dto.getTimeLimitMs() : 5000);
        problem.setMemoryLimitMb(dto.getMemoryLimitMb() != null && dto.getMemoryLimitMb() > 0 ? dto.getMemoryLimitMb() : 512);
        problem.setTags(getOrCreateTags(dto.getTags()));

        problemRepository.save(problem);

        // Update/save editorial
        Optional<Editorial> edOpt = editorialRepository.findByProblemId(problemId);
        if (edOpt.isPresent()) {
            Editorial ed = edOpt.get();
            ed.setContent(dto.getEditorial());
            editorialRepository.save(ed);
        } else if (dto.getEditorial() != null && !dto.getEditorial().isBlank()) {
            editorialRepository.save(Editorial.builder()
                    .problem(problem)
                    .content(dto.getEditorial())
                    .build());
        }

        // Hints & test cases update can be handled separately or simple delete-all-insert-all
        // For simplicity, update hints using reset approach if provided
        if (dto.getHints() != null) {
            List<Hint> existingHints = hintRepository.findByProblemIdOrderByHintNumberAsc(problemId);
            hintRepository.deleteAll(existingHints);
            for (HintDto h : dto.getHints()) {
                hintRepository.save(Hint.builder()
                        .problem(problem)
                        .hintNumber(h.getHintNumber())
                        .content(h.getContent())
                        .build());
            }
        }

        return problem;
    }

    @Transactional
    public void deleteProblem(Long problemId) {
        if (!problemRepository.existsById(problemId)) {
            throw new ResourceNotFoundException("Problem not found");
        }
        problemRepository.deleteById(problemId);
    }

    // Test cases CRUD
    @Transactional(readOnly = true)
    public List<TestCaseDto> getTestCases(Long problemId) {
        return testCaseRepository.findByProblemId(problemId).stream().map(tc -> TestCaseDto.builder()
                .id(tc.getId())
                .input(tc.getInput())
                .expectedOutput(tc.getExpectedOutput())
                .isHidden(tc.getIsHidden())
                .build()).collect(Collectors.toList());
    }

    @Transactional
    public TestCase addTestCase(Long problemId, TestCaseDto dto) {
        Problem problem = problemRepository.findById(problemId)
                .orElseThrow(() -> new ResourceNotFoundException("Problem not found"));

        TestCase tc = TestCase.builder()
                .problem(problem)
                .input(dto.getInput())
                .expectedOutput(dto.getExpectedOutput())
                .isHidden(dto.getIsHidden() != null && dto.getIsHidden())
                .build();

        return testCaseRepository.save(tc);
    }

    @Transactional
    public void deleteTestCase(Long testCaseId) {
        if (!testCaseRepository.existsById(testCaseId)) {
            throw new ResourceNotFoundException("Test case not found");
        }
        testCaseRepository.deleteById(testCaseId);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getPlatformAnalytics() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("totalProblems", problemRepository.count());
        stats.put("totalSubmissions", submissionRepository.count());
        
        // Count verdicts
        List<Submission> submissions = submissionRepository.findAll();
        Map<String, Long> verdicts = submissions.stream()
                .collect(Collectors.groupingBy(s -> s.getVerdict() != null ? s.getVerdict().name() : "null", Collectors.counting()));
        stats.put("verdictStats", verdicts);

        return stats;
    }

    private Set<Tag> getOrCreateTags(Set<String> tagNames) {
        if (tagNames == null) return Collections.emptySet();
        Set<Tag> tags = new HashSet<>();
        for (String name : tagNames) {
            Tag tag = tagRepository.findByName(name)
                    .orElseGet(() -> tagRepository.save(Tag.builder().name(name).build()));
            tags.add(tag);
        }
        return tags;
    }

    @Transactional(readOnly = true)
    public List<SubmissionResponse> getAllSubmissions() {
        return submissionRepository.findAll().stream()
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
    }

    @Transactional
    public void deleteSubmission(Long submissionId) {
        if (!submissionRepository.existsById(submissionId)) {
            throw new ResourceNotFoundException("Submission not found");
        }
        submissionRepository.deleteById(submissionId);
    }

    @Transactional(readOnly = true)
    public List<LeaderboardEntryDto> getLeaderboard() {
        return leaderboardEntryRepository.findAllByOrderByScoreDescSolvedCountDescTotalExecutionTimeAscAcceptanceRateDescLastUpdatedAsc().stream()
                .filter(entry -> entry.getUser().getRole() == null || !"ROLE_ADMIN".equals(entry.getUser().getRole().getName()))
                .map(entry -> LeaderboardEntryDto.builder()
                        .id(entry.getId())
                        .userId(entry.getUser().getId())
                        .username(entry.getUser().getUsername())
                        .avatar(entry.getUser().getAvatar())
                        .score(entry.getScore())
                        .solvedCount(entry.getSolvedCount())
                        .acceptanceRate(entry.getAcceptanceRate())
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional
    public LeaderboardEntryDto updateLeaderboardEntry(Long id, LeaderboardEntryDto dto) {
        LeaderboardEntry entry = leaderboardEntryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Leaderboard entry not found"));

        if (dto.getScore() != null) entry.setScore(dto.getScore());
        if (dto.getSolvedCount() != null) entry.setSolvedCount(dto.getSolvedCount());
        if (dto.getAcceptanceRate() != null) entry.setAcceptanceRate(dto.getAcceptanceRate());
        entry.setLastUpdated(java.time.LocalDateTime.now());
        entry = leaderboardEntryRepository.save(entry);

        return LeaderboardEntryDto.builder()
                .id(entry.getId())
                .userId(entry.getUser().getId())
                .username(entry.getUser().getUsername())
                .avatar(entry.getUser().getAvatar())
                .score(entry.getScore())
                .solvedCount(entry.getSolvedCount())
                .acceptanceRate(entry.getAcceptanceRate())
                .build();
    }

    @Transactional
    public void deleteLeaderboardEntry(Long id) {
        if (!leaderboardEntryRepository.existsById(id)) {
            throw new ResourceNotFoundException("Leaderboard entry not found");
        }
        leaderboardEntryRepository.deleteById(id);
    }

    // Programmatic duplicate problem check using Jaccard Similarity
    public double calculateJaccardSimilarity(String s1, String s2) {
        if (s1 == null || s2 == null) return 0.0;
        Set<String> set1 = tokenize(s1);
        Set<String> set2 = tokenize(s2);
        if (set1.isEmpty() && set2.isEmpty()) return 1.0;
        if (set1.isEmpty() || set2.isEmpty()) return 0.0;
        
        Set<String> intersection = new HashSet<>(set1);
        intersection.retainAll(set2);
        
        Set<String> union = new HashSet<>(set1);
        union.addAll(set2);
        
        return (double) intersection.size() / union.size();
    }

    private Set<String> tokenize(String s) {
        String[] words = s.toLowerCase().replaceAll("[^a-zA-Z0-9\\s]", "").split("\\s+");
        Set<String> set = new HashSet<>();
        for (String w : words) {
            if (w.trim().length() > 2) {
                set.add(w.trim());
            }
        }
        return set;
    }

    public void checkForDuplicates(Problem problem) {
        if (problem == null || problem.getTitle() == null) return;
        List<Problem> allProblems = problemRepository.findAll();
        for (Problem existing : allProblems) {
            if (problem.getId() != null && problem.getId().equals(existing.getId())) {
                continue;
            }
            if (problem.getTitle().trim().equalsIgnoreCase(existing.getTitle().trim())) {
                throw new BadRequestException("A problem with the title '" + existing.getTitle() + "' already exists. Please use a unique title.");
            }
        }
    }

    public void syncSequences() {
        String[] tables = {"problems", "test_cases", "hints", "editorials", "tags", "discussions", "submissions", "leaderboard_entries", "users"};
        for (String table : tables) {
            try {
                Long maxId = jdbcTemplate.queryForObject("SELECT COALESCE(MAX(id), 0) FROM " + table, Long.class);
                if (maxId != null && maxId > 0) {
                    try { jdbcTemplate.execute("SELECT setval(pg_get_serial_sequence('" + table + "', 'id'), " + maxId + ")"); } catch (Exception ignored) {}
                    try { jdbcTemplate.execute("SELECT setval('" + table + "_id_seq', " + maxId + ")"); } catch (Exception ignored) {}
                }
            } catch (Exception ignored) {}
        }
    }

    // User management additions
    @Transactional(readOnly = true)
    public AuthResponse getUserDetails(Long userId) {
        User u = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Integer solved = leaderboardEntryRepository.findByUserId(u.getId())
                .map(LeaderboardEntry::getSolvedCount)
                .orElse(0);
        return AuthResponse.builder()
                .id(u.getId())
                .username(u.getUsername())
                .email(u.getEmail())
                .role(u.getRole() != null ? u.getRole().getName() : "")
                .avatar(u.getAvatar())
                .name(u.getName())
                .bio(u.getBio())
                .solvedCount(solved)
                .isActive(u.getIsActive() == null || u.getIsActive())
                .isBanned(u.getIsBanned() != null && u.getIsBanned())
                .isVerified(u.getIsVerified())
                .build();
    }

    @Transactional(readOnly = true)
    public UserStatsDto getUserStatistics(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        LeaderboardEntry entry = leaderboardEntryRepository.findByUserId(userId).orElse(null);
        Streak streak = streakRepository.findByUserId(userId).orElse(null);
        
        long totalSub = submissionRepository.countByUserId(userId);
        long accSub = submissionRepository.countByUserIdAndVerdict(userId, Verdict.ACCEPTED);
        double rate = totalSub > 0 ? ((double) accSub / totalSub) * 100.0 : 0.0;
        
        List<SubmissionResponse> recentSubs = submissionRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
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

        return UserStatsDto.builder()
                .solvedCount(entry != null ? entry.getSolvedCount() : 0)
                .score(entry != null ? entry.getScore() : 0)
                .acceptanceRate(entry != null ? entry.getAcceptanceRate() : rate)
                .currentStreak(streak != null ? streak.getCurrentStreak() : 0)
                .longestStreak(streak != null ? streak.getLongestStreak() : 0)
                .totalSubmissions(totalSub)
                .acceptedSubmissions(accSub)
                .recentSubmissions(recentSubs)
                .build();
    }

    @Transactional
    public void activateUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setIsActive(true);
        userRepository.save(user);
    }

    @Transactional
    public void deactivateUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if ("admin".equals(user.getUsername())) {
            throw new BadRequestException("Cannot deactivate primary admin account.");
        }
        user.setIsActive(false);
        userRepository.save(user);
    }

    @Transactional
    public void banUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if ("admin".equals(user.getUsername())) {
            throw new BadRequestException("Cannot ban primary admin account.");
        }
        user.setIsBanned(true);
        userRepository.save(user);
    }

    @Transactional
    public void unbanUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setIsBanned(false);
        userRepository.save(user);
    }

    @Transactional
    public void changeUserRole(Long userId, String roleName) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if ("admin".equals(user.getUsername())) {
            throw new BadRequestException("Cannot change role of primary admin account.");
        }
        Role role = roleRepository.findByName(roleName)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found: " + roleName));
        user.setRole(role);
        userRepository.save(user);
    }

    @Transactional
    public void resetUserPassword(Long userId, String newPassword) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    // Granular Hint operations
    @Transactional
    public Hint addHint(Long problemId, HintDto dto) {
        Problem problem = problemRepository.findById(problemId)
                .orElseThrow(() -> new ResourceNotFoundException("Problem not found"));
        Hint hint = Hint.builder()
                .problem(problem)
                .hintNumber(dto.getHintNumber())
                .content(dto.getContent())
                .build();
        return hintRepository.save(hint);
    }

    @Transactional
    public Hint editHint(Long hintId, HintDto dto) {
        Hint hint = hintRepository.findById(hintId)
                .orElseThrow(() -> new ResourceNotFoundException("Hint not found"));
        hint.setHintNumber(dto.getHintNumber());
        hint.setContent(dto.getContent());
        return hintRepository.save(hint);
    }

    @Transactional
    public void deleteHint(Long hintId) {
        if (!hintRepository.existsById(hintId)) {
            throw new ResourceNotFoundException("Hint not found");
        }
        hintRepository.deleteById(hintId);
    }

    // Granular Editorial operations
    @Transactional
    public Editorial addOrUpdateEditorial(Long problemId, String content) {
        Problem problem = problemRepository.findById(problemId)
                .orElseThrow(() -> new ResourceNotFoundException("Problem not found"));
        
        Editorial editorial = editorialRepository.findByProblemId(problemId)
                .orElseGet(() -> Editorial.builder().problem(problem).build());
        
        editorial.setContent(content);
        return editorialRepository.save(editorial);
    }

    @Transactional
    public void deleteEditorial(Long editorialId) {
        if (!editorialRepository.existsById(editorialId)) {
            throw new ResourceNotFoundException("Editorial not found");
        }
        editorialRepository.deleteById(editorialId);
    }
}
