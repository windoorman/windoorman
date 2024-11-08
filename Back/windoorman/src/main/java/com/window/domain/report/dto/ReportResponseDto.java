package com.window.domain.report.dto;

import lombok.Builder;

import java.util.List;

@Builder
public record ReportResponseDto(
        String placeName,
        AirReportDto airReport,
        List<WindowsDto> windows,
        List<ActionsReportResponseDto> actionsReport
) {
}
