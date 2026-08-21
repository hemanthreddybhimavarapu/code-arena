package com.codearena.controller;

import com.codearena.dto.ApiResponse;
import com.codearena.dto.ProblemDetailDto;
import com.codearena.dto.ProblemDto;
import com.codearena.security.UserPrincipal;
import com.codearena.service.ProblemService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/problems")
public class ProblemController {

    private final ProblemService problemService;

    public ProblemController(ProblemService problemService) {
        this.problemService = problemService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ProblemDto>>> getProblems(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String difficulty,
            @RequestParam(required = false) String tag,
            @AuthenticationPrincipal UserPrincipal principal) {
        List<ProblemDto> list = problemService.getProblems(query, difficulty, tag, principal);
        return ResponseEntity.ok(ApiResponse.success("Problems fetched successfully!", list));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProblemDetailDto>> getProblemDetail(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        ProblemDetailDto detail = problemService.getProblemDetail(id, principal);
        return ResponseEntity.ok(ApiResponse.success("Problem details fetched successfully!", detail));
    }

    @PostMapping("/{id}/bookmark")
    public ResponseEntity<ApiResponse<Boolean>> toggleBookmark(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        boolean isBookmarked = problemService.toggleBookmark(id, principal);
        String msg = isBookmarked ? "Problem bookmarked!" : "Bookmark removed!";
        return ResponseEntity.ok(ApiResponse.success(msg, isBookmarked));
    }
}
