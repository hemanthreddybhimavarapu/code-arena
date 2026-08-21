package com.codearena.controller;

import com.codearena.dto.ApiResponse;
import com.codearena.dto.SubmissionRequest;
import com.codearena.dto.SubmissionResponse;
import com.codearena.security.UserPrincipal;
import com.codearena.service.SubmissionService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/submissions")
public class SubmissionController {

    private final SubmissionService submissionService;

    public SubmissionController(SubmissionService submissionService) {
        this.submissionService = submissionService;
    }

    @PostMapping("/{problemId}/submit")
    public ResponseEntity<ApiResponse<SubmissionResponse>> submit(
            @PathVariable Long problemId,
            @Valid @RequestBody SubmissionRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        SubmissionResponse response = submissionService.submit(problemId, request, principal);
        return ResponseEntity.ok(ApiResponse.success("Submitted successfully!", response));
    }

    @PostMapping("/{problemId}/run")
    public ResponseEntity<ApiResponse<SubmissionResponse>> run(
            @PathVariable Long problemId,
            @Valid @RequestBody SubmissionRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        SubmissionResponse response = submissionService.run(problemId, request, principal);
        return ResponseEntity.ok(ApiResponse.success("Code executed!", response));
    }

    @GetMapping("/{problemId}/history")
    public ResponseEntity<ApiResponse<List<SubmissionResponse>>> getSubmissionHistory(
            @PathVariable Long problemId,
            @AuthenticationPrincipal UserPrincipal principal) {
        List<SubmissionResponse> list = submissionService.getSubmissionHistory(problemId, principal);
        return ResponseEntity.ok(ApiResponse.success("Submission history fetched successfully!", list));
    }
}
