package com.window.global.config;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.window.domain.schedule.dto.ScheduleRedisDto;
import com.window.domain.schedule.entity.Schedule;
import com.window.domain.windows.entity.Windows;
import com.zaxxer.hikari.HikariDataSource;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.Step;
import org.springframework.batch.core.configuration.annotation.EnableBatchProcessing;
import org.springframework.batch.core.configuration.support.DefaultBatchConfiguration;
import org.springframework.batch.core.job.builder.JobBuilder;
import org.springframework.batch.core.repository.JobRepository;
import org.springframework.batch.core.repository.support.JobRepositoryFactoryBean;
import org.springframework.batch.core.step.builder.StepBuilder;
import org.springframework.batch.item.*;
import org.springframework.batch.item.database.JdbcCursorItemReader;
import org.springframework.batch.item.database.builder.JdbcCursorItemReaderBuilder;
import org.springframework.batch.support.transaction.ResourcelessTransactionManager;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import javax.sql.DataSource;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Configuration
@EnableBatchProcessing
@RequiredArgsConstructor
@Slf4j
public class BatchConfig {

    private final JobRepository jobRepository;
    private final PlatformTransactionManager transactionManager;
    private final WebClient webClient;
    private final DataSource dataSource;
    private final RedisTemplate<String, String> redisTemplate;
    private final ObjectMapper objectMapper;

    @Value("${smartthings.secret}")
    private String smartThingsSecret;


    @Bean
    public Job startTimeJob() {
        return new JobBuilder("startTimeJob", jobRepository)
                .start(startTimeStep())
                .build();
    }

    @Bean
    public Step startTimeStep() {
        return new StepBuilder("startTimeStep", jobRepository)
                .<Schedule, Schedule>chunk(100, transactionManager)
                .reader(startTimeReader())
                .writer(startTimeWriter())
                .build();
    }

    @Bean
    public JdbcCursorItemReader<Schedule> startTimeReader() {
        return new JdbcCursorItemReaderBuilder<Schedule>()
                .name("jdbcCursorItemReader")
                .fetchSize(100)
                .sql("SELECT s.id, s.start_time, s.end_time, w.id as windows_id, w.device_id FROM schedule s left JOIN windows w ON s.windows_id = w.id where is_activate = true and DATE_FORMAT(s.start_time, '%H:%i') = ?")
                .preparedStatementSetter(ps -> {
                    String currentTime = LocalTime.now().format(DateTimeFormatter.ofPattern("HH:mm"));
                    ps.setString(1, currentTime);
                })
                .rowMapper((rs, rowNum) -> {
                    Windows window = Windows.builder()
                            .id(rs.getLong("windows_id"))
                            .deviceId(rs.getString("device_id"))
                            .build();

                    return Schedule.builder()
                            .startTime(rs.getTime("start_time").toLocalTime())
                            .endTime(rs.getTime("end_time").toLocalTime())
                            .windows(window)
                            .build();
                })
                .dataSource(dataSource)
                .build();
    }


    @Bean
    public ItemWriter<Schedule> startTimeWriter() {
        return items -> {
            // start time의 시간으로 문을 열기
            String jsonData = """
            {
                "commands": [
                    {
                        "component": "main",
                        "capability": "windowShade",
                        "command": "open"
                    }
                ]
            }
            """;
            for(Schedule schedule : items) {
                Windows window = schedule.getWindows();
                String deviceId = window.getDeviceId();
                Mono<String> data =  webClient.post()
                        .uri("/" + deviceId + "/commands") // API의 경로
                        .header("Content-Type", "application/json")
                        .headers(headers -> headers.setBearerAuth(smartThingsSecret))
                        .bodyValue(jsonData)  // JSON 데이터 설정
                        .retrieve()
                        .bodyToMono(String.class);  // 응답을 처리하지 않음 (응답 본문을 무시)

                data.subscribe(json -> {
                    log.info("open command: {}", data);
                });
            }

            // endtime으로 redis 넣기
            Map<LocalTime, List<Schedule>> schedulesByEndTime = items.getItems().stream()
                    .collect(Collectors.groupingBy(Schedule::getEndTime));

            schedulesByEndTime.forEach((endTime, schedules) -> {
                String redisKey = "schedules:" + endTime.toString();

                List<ScheduleRedisDto> redisDtos = schedules.stream()
                        .map(schedule -> {
                            Long windowsId = schedule.getWindows().getId();
                            String deviceId = schedule.getWindows().getDeviceId();
                            return new ScheduleRedisDto(windowsId, endTime, deviceId);
                        })
                        .collect(Collectors.toList());

                try {
                    String jsonArray = objectMapper.writeValueAsString(redisDtos);
                    redisTemplate.opsForValue().set(redisKey, jsonArray);
                } catch (JsonProcessingException e) {
                    throw new RuntimeException("Error serializing ScheduleRedisDto list to JSON", e);
                }
            });
        };
    }

    @Bean
    public Job endTimeJob() {
        return new JobBuilder("endTimeJob", jobRepository)
                .start(endTimeStep())
                .build();
    }

    @Bean
    public Step endTimeStep() {
        return new StepBuilder("endTimeStep", jobRepository)
                .<ScheduleRedisDto, ScheduleRedisDto>chunk(100, transactionManager)
                .reader(endTimeReader())
                .writer(endTimeWriter())
                .build();
    }

    @Bean
    public ItemReader<ScheduleRedisDto> endTimeReader() {
        return new ItemReader<>() {
            private List<ScheduleRedisDto> dtoList = null;
            private int nextIndex = 0;

            @Override
            public ScheduleRedisDto read() throws Exception {

                LocalTime time = LocalTime.now();
                String redisKey = "schedules:" + time.toString().substring(0, 5);
                String jsonArray = redisTemplate.opsForValue().get(redisKey);
                log.info("redisKey: {}", redisKey);

                if(jsonArray != null){
                    dtoList = objectMapper.readValue(jsonArray, new TypeReference<>() {
                    });
                    redisTemplate.delete(redisKey);
                }
                log.info("dtoList: {}", dtoList);

                if(dtoList != null && nextIndex < dtoList.size()){
                    return dtoList.get(nextIndex++);
                }
                return null;
            }

        };
    }


    @Bean
    public ItemWriter<ScheduleRedisDto> endTimeWriter() {
        return items -> {
            for(ScheduleRedisDto dto : items){
                String jsonData = """
                {
                    "commands": [
                        {
                            "component": "main",
                            "capability": "windowShade",
                            "command": "close"
                        }
                    ]
                }
                """;
                String deviceId = dto.getDeviceId();
                Mono<String> data =  webClient.post()
                        .uri("/" + deviceId + "/commands") // API의 경로
                        .header("Content-Type", "application/json")
                        .headers(headers -> headers.setBearerAuth(smartThingsSecret))
                        .bodyValue(jsonData)  // JSON 데이터 설정
                        .retrieve()
                        .bodyToMono(String.class);  // 응답을 처리하지 않음 (응답 본문을 무시)

                data.subscribe(json -> {
                    log.info("close command: {}", data);
                });
            }

        };
    }

}
