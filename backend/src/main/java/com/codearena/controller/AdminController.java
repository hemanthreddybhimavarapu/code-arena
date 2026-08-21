package com.codearena.controller;

import com.codearena.dto.*;
import com.codearena.entity.Problem;
import com.codearena.entity.TestCase;
import com.codearena.entity.Hint;
import com.codearena.entity.Editorial;
import com.codearena.service.AdminService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import com.codearena.entity.ContactMessage;
import com.codearena.repository.ContactMessageRepository;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;
    private final ContactMessageRepository contactMessageRepository;

    public AdminController(AdminService adminService, ContactMessageRepository contactMessageRepository) {
        this.adminService = adminService;
        this.contactMessageRepository = contactMessageRepository;
    }

    // Support Contact Messages management
    @GetMapping("/contact-messages")
    public ResponseEntity<ApiResponse<List<ContactMessage>>> getAllContactMessages() {
        List<ContactMessage> messages = contactMessageRepository.findAllByOrderByCreatedAtDesc();
        return ResponseEntity.ok(ApiResponse.success("Support messages fetched successfully!", messages));
    }

    @PatchMapping("/contact-messages/{id}/status")
    public ResponseEntity<ApiResponse<ContactMessage>> updateContactMessageStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        ContactMessage message = contactMessageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Contact message not found with id: " + id));
        String newStatus = body.getOrDefault("status", "RESOLVED");
        message.setStatus(newStatus);
        ContactMessage updated = contactMessageRepository.save(message);
        return ResponseEntity.ok(ApiResponse.success("Message status updated to " + newStatus, updated));
    }

    // User management
    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<AuthResponse>>> getAllUsers() {
        List<AuthResponse> users = adminService.getAllUsers();
        return ResponseEntity.ok(ApiResponse.success("Users fetched successfully!", users));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id) {
        adminService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.success("User deleted successfully!"));
    }

    // Problem CRUD
    @PostMapping("/problems")
    public ResponseEntity<ApiResponse<Problem>> createProblem(@Valid @RequestBody ProblemDetailDto dto) {
        Problem problem = adminService.createProblem(dto);
        return ResponseEntity.ok(ApiResponse.success("Problem created successfully!", problem));
    }

    @PutMapping("/problems/{id}")
    public ResponseEntity<ApiResponse<Problem>> editProblem(@PathVariable Long id, @Valid @RequestBody ProblemDetailDto dto) {
        Problem problem = adminService.editProblem(id, dto);
        return ResponseEntity.ok(ApiResponse.success("Problem updated successfully!", problem));
    }

    @DeleteMapping("/problems/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteProblem(@PathVariable Long id) {
        adminService.deleteProblem(id);
        return ResponseEntity.ok(ApiResponse.success("Problem deleted successfully!"));
    }

    // Test cases CRUD
    @GetMapping("/problems/{problemId}/testcases")
    public ResponseEntity<ApiResponse<List<TestCaseDto>>> getTestCases(@PathVariable Long problemId) {
        List<TestCaseDto> testCases = adminService.getTestCases(problemId);
        return ResponseEntity.ok(ApiResponse.success("Test cases fetched successfully!", testCases));
    }

    @PostMapping("/problems/{problemId}/testcases")
    public ResponseEntity<ApiResponse<TestCase>> addTestCase(@PathVariable Long problemId, @Valid @RequestBody TestCaseDto dto) {
        TestCase testCase = adminService.addTestCase(problemId, dto);
        return ResponseEntity.ok(ApiResponse.success("Test case added successfully!", testCase));
    }

    @DeleteMapping("/problems/testcases/{testCaseId}")
    public ResponseEntity<ApiResponse<Void>> deleteTestCase(@PathVariable Long testCaseId) {
        adminService.deleteTestCase(testCaseId);
        return ResponseEntity.ok(ApiResponse.success("Test case deleted successfully!"));
    }

    // Analytics
    @GetMapping("/analytics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getPlatformAnalytics() {
        Map<String, Object> analytics = adminService.getPlatformAnalytics();
        return ResponseEntity.ok(ApiResponse.success("Analytics fetched successfully!", analytics));
    }

    // Submissions
    @GetMapping("/submissions")
    public ResponseEntity<ApiResponse<List<SubmissionResponse>>> getAllSubmissions() {
        List<SubmissionResponse> submissions = adminService.getAllSubmissions();
        return ResponseEntity.ok(ApiResponse.success("Submissions fetched successfully!", submissions));
    }

    @DeleteMapping("/submissions/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteSubmission(@PathVariable Long id) {
        adminService.deleteSubmission(id);
        return ResponseEntity.ok(ApiResponse.success("Submission deleted successfully!"));
    }

    // Leaderboard management
    @GetMapping("/leaderboard")
    public ResponseEntity<ApiResponse<List<LeaderboardEntryDto>>> getLeaderboard() {
        List<LeaderboardEntryDto> leaderboard = adminService.getLeaderboard();
        return ResponseEntity.ok(ApiResponse.success("Leaderboard entries fetched successfully!", leaderboard));
    }

    @PutMapping("/leaderboard/{id}")
    public ResponseEntity<ApiResponse<LeaderboardEntryDto>> updateLeaderboardEntry(@PathVariable Long id, @RequestBody LeaderboardEntryDto dto) {
        LeaderboardEntryDto updated = adminService.updateLeaderboardEntry(id, dto);
        return ResponseEntity.ok(ApiResponse.success("Leaderboard entry updated successfully!", updated));
    }

    @DeleteMapping("/leaderboard/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteLeaderboardEntry(@PathVariable Long id) {
        adminService.deleteLeaderboardEntry(id);
        return ResponseEntity.ok(ApiResponse.success("Leaderboard entry deleted successfully!"));
    }

    // User management endpoints
    @GetMapping("/users/{id}")
    public ResponseEntity<ApiResponse<AuthResponse>> getUserDetails(@PathVariable Long id) {
        AuthResponse detail = adminService.getUserDetails(id);
        return ResponseEntity.ok(ApiResponse.success("User details fetched successfully!", detail));
    }

    @GetMapping("/users/{id}/statistics")
    public ResponseEntity<ApiResponse<UserStatsDto>> getUserStatistics(@PathVariable Long id) {
        UserStatsDto stats = adminService.getUserStatistics(id);
        return ResponseEntity.ok(ApiResponse.success("User statistics fetched successfully!", stats));
    }

    @PostMapping("/users/{id}/activate")
    public ResponseEntity<ApiResponse<Void>> activateUser(@PathVariable Long id) {
        adminService.activateUser(id);
        return ResponseEntity.ok(ApiResponse.success("User activated successfully!"));
    }

    @PostMapping("/users/{id}/deactivate")
    public ResponseEntity<ApiResponse<Void>> deactivateUser(@PathVariable Long id) {
        adminService.deactivateUser(id);
        return ResponseEntity.ok(ApiResponse.success("User deactivated successfully!"));
    }

    @PostMapping("/users/{id}/ban")
    public ResponseEntity<ApiResponse<Void>> banUser(@PathVariable Long id) {
        adminService.banUser(id);
        return ResponseEntity.ok(ApiResponse.success("User banned successfully!"));
    }

    @PostMapping("/users/{id}/unban")
    public ResponseEntity<ApiResponse<Void>> unbanUser(@PathVariable Long id) {
        adminService.unbanUser(id);
        return ResponseEntity.ok(ApiResponse.success("User unbanned successfully!"));
    }

    @PostMapping("/users/{id}/role")
    public ResponseEntity<ApiResponse<Void>> changeUserRole(@PathVariable Long id, @RequestBody Map<String, String> body) {
        adminService.changeUserRole(id, body.get("role"));
        return ResponseEntity.ok(ApiResponse.success("User role updated successfully!"));
    }

    @PostMapping("/users/{id}/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetUserPassword(@PathVariable Long id, @RequestBody Map<String, String> body) {
        adminService.resetUserPassword(id, body.get("password"));
        return ResponseEntity.ok(ApiResponse.success("User password reset successfully!"));
    }

    // Granular Hint operations
    @PostMapping("/problems/{problemId}/hints")
    public ResponseEntity<ApiResponse<Hint>> addHint(@PathVariable Long problemId, @Valid @RequestBody HintDto dto) {
        Hint hint = adminService.addHint(problemId, dto);
        return ResponseEntity.ok(ApiResponse.success("Hint added successfully!", hint));
    }

    @PutMapping("/problems/hints/{hintId}")
    public ResponseEntity<ApiResponse<Hint>> editHint(@PathVariable Long hintId, @Valid @RequestBody HintDto dto) {
        Hint hint = adminService.editHint(hintId, dto);
        return ResponseEntity.ok(ApiResponse.success("Hint updated successfully!", hint));
    }

    @DeleteMapping("/problems/hints/{hintId}")
    public ResponseEntity<ApiResponse<Void>> deleteHint(@PathVariable Long hintId) {
        adminService.deleteHint(hintId);
        return ResponseEntity.ok(ApiResponse.success("Hint deleted successfully!"));
    }

    // Granular Editorial operations
    @PostMapping("/problems/{problemId}/editorial")
    public ResponseEntity<ApiResponse<Editorial>> addOrUpdateEditorial(@PathVariable Long problemId, @RequestBody Map<String, String> body) {
        Editorial ed = adminService.addOrUpdateEditorial(problemId, body.get("content"));
        return ResponseEntity.ok(ApiResponse.success("Editorial updated successfully!", ed));
    }

    @DeleteMapping("/problems/editorials/{editorialId}")
    public ResponseEntity<ApiResponse<Void>> deleteEditorial(@PathVariable Long editorialId) {
        adminService.deleteEditorial(editorialId);
        return ResponseEntity.ok(ApiResponse.success("Editorial deleted successfully!"));
    }
}
