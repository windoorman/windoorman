package com.window.global.config;

import com.window.domain.report.service.ElasticReportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.JobParameters;
import org.springframework.batch.core.JobParametersBuilder;
import org.springframework.batch.core.launch.JobLauncher;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@RequiredArgsConstructor
@Slf4j
@EnableScheduling
public class SchedulerConfig {

    private final ElasticReportService elasticReportService;
    private final JobLauncher jobLauncher;
    private final Job startTimeJob;
    private final Job endTimeJob;


    @Scheduled(cron = "0 0 00 * * *")
    public void saveAirReport() throws IOException {
        log.info("save air report");
        elasticReportService.saveDailyAirReport();
    }

    @Scheduled(cron = "0 * * * * *")
    public void launchJobs() {
        launchStartTimeJob();
        launchEndTimeJob();
    }

    @Async("asyncExecutor")
    public void launchStartTimeJob() {
        log.info("Start Job");
        try{
            JobParameters startTimeJobParams = new JobParametersBuilder()
                    .addLong("startJobTime", System.currentTimeMillis())
                    .toJobParameters();
            jobLauncher.run(startTimeJob, startTimeJobParams);
            log.info("startTimeJob 실행 완료");

        } catch (Exception e){
            e.printStackTrace();
        }
    }

    @Async("asyncExecutor")
    public void launchEndTimeJob() {
        log.info("End Job");
        try{
            JobParameters endTimeJobParams = new JobParametersBuilder()
                    .addLong("endJobTime", System.currentTimeMillis())
                    .toJobParameters();
            jobLauncher.run(endTimeJob, endTimeJobParams);

        } catch (Exception e){
            e.printStackTrace();
        }
    }

}
