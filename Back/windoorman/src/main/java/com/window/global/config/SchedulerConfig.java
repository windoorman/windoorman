package com.window.global.config;


import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.JobParameters;
import org.springframework.batch.core.JobParametersBuilder;
import org.springframework.batch.core.launch.JobLauncher;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class SchedulerConfig {
    private final JobLauncher jobLauncher;
    private final Job startTimeJob;
    private final Job endTimeJob;

    @Scheduled(cron = "0 * * * * *")
    public void launchJob() {
        log.info("job");
        try{
            // `startTimeJob`에 고유한 매개변수 추가
            JobParameters startTimeJobParams = new JobParametersBuilder()
                    .addLong("startJobTime", System.currentTimeMillis())
                    .toJobParameters();
            jobLauncher.run(startTimeJob, startTimeJobParams);

//             `endTimeJob`에 고유한 매개변수 추가
            JobParameters endTimeJobParams = new JobParametersBuilder()
                    .addLong("endJobTime", System.currentTimeMillis())
                    .toJobParameters();
            jobLauncher.run(endTimeJob, endTimeJobParams);

        } catch (Exception e){
            e.printStackTrace();
        }
    }



}
