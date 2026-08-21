package com.codearena.controller;

import com.codearena.dto.ApiResponse;
import com.codearena.dto.DashboardStatsDto;
import com.codearena.security.UserPrincipal;
import com.codearena.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<DashboardStatsDto>> getDashboardStats(@AuthenticationPrincipal UserPrincipal principal) {
        DashboardStatsDto stats = dashboardService.getDashboardStats(principal);
        return ResponseEntity.ok(ApiResponse.success("Dashboard stats fetched successfully!", stats));
    }
}
