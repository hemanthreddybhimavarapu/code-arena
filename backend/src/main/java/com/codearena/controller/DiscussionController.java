package com.codearena.controller;

import com.codearena.dto.ApiResponse;
import com.codearena.dto.DiscussionCreateRequest;
import com.codearena.dto.DiscussionDto;
import com.codearena.security.UserPrincipal;
import com.codearena.service.DiscussionService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/discussions")
public class DiscussionController {

    private final DiscussionService discussionService;

    public DiscussionController(DiscussionService discussionService) {
        this.discussionService = discussionService;
    }

    @GetMapping("/{problemId}")
    public ResponseEntity<ApiResponse<List<DiscussionDto>>> getDiscussions(@PathVariable Long problemId) {
        List<DiscussionDto> list = discussionService.getDiscussions(problemId);
        return ResponseEntity.ok(ApiResponse.success("Discussions fetched successfully!", list));
    }

    @PostMapping("/{problemId}")
    public ResponseEntity<ApiResponse<DiscussionDto>> createDiscussion(
            @PathVariable Long problemId,
            @Valid @RequestBody DiscussionCreateRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        DiscussionDto dto = discussionService.createDiscussion(problemId, request, principal);
        return ResponseEntity.ok(ApiResponse.success("Discussion posted successfully!", dto));
    }
}
