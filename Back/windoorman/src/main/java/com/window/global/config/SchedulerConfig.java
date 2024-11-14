package com.window.global.config;

import com.window.domain.report.service.ElasticReportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@RequiredArgsConstructor
@Slf4j
public class SchedulerConfig {

    private final ElasticReportService elasticReportService;

    @Scheduled(cron = "0 0 00 * * *")
    public void saveAirReport() throws IOException {
        log.info("save air report");
        elasticReportService.saveDailyAirReport();
    }
}
