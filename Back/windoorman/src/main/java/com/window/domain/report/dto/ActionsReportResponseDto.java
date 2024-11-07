package com.window.domain.report.dto;

import lombok.Builder;

import java.time.LocalDateTime;

@Builder
public record ActionsReportResponseDto(
    String open,
    LocalDateTime openTime
) {
}
