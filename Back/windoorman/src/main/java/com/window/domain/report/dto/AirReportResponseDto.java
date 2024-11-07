package com.window.domain.report.dto;

import lombok.Builder;

@Builder
public record AirReportResponseDto(
        Long reportId,
        double lowTemperature,
        double highTemperature,
        double humidity,
        double airCondition
) {
}
