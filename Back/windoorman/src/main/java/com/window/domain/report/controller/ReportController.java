package com.window.domain.report.controller;

import com.window.domain.report.dto.AirReportResponseDto;
import com.window.domain.report.service.ReportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/report")
@RequiredArgsConstructor
@Slf4j
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/air/{placeId}/{windowId}")
    public ResponseEntity<?> findAirReport(@PathVariable Long placeId, @PathVariable LocalDate windowId, Authentication authentication) {
        AirReportResponseDto response = reportService.findAirReport(placeId, windowId, authentication);
        return ResponseEntity.ok(response);
    }
}
