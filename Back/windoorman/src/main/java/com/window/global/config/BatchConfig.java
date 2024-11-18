package com.window.global.config;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.window.domain.schedule.dto.ScheduleRedisDto;
import com.window.domain.schedule.entity.Schedule;
import com.window.domain.windows.entity.Windows;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.Step;
import org.springframework.batch.core.configuration.annotation.EnableBatchProcessing;
import org.springframework.batch.core.configuration.annotation.StepScope;
import org.springframework.batch.core.job.builder.JobBuilder;
import org.springframework.batch.core.launch.support.RunIdIncrementer;
import org.springframework.batch.core.repository.JobRepository;
import org.springframework.batch.core.step.builder.StepBuilder;
import org.springframework.batch.item.ItemReader;
import org.springframework.batch.item.ItemWriter;
import org.springframework.batch.item.database.JdbcPagingItemReader;
import org.springframework.batch.item.database.Order;
import org.springframework.batch.item.database.builder.JdbcPagingItemReaderBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import javax.sql.DataSource;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.format.TextStyle;
import java.util.*;
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
    private final RedisTemplate<String, ScheduleRedisDto> scheduleRedisTemplate;
    private final ThreadPoolTaskExecutor asyncExecutor;


    @Value("${smartthings.secret}")
    private String smartThingsSecret;

    @Value("${spring.redis.set.key}")
    private String redisSetKey;



    @Bean
    public Job startTimeJob() {
        return new JobBuilder("startTimeJob", jobRepository)
                .incrementer(new RunIdIncrementer())
                .start(startTimeStep())
                .build();
    }

    @Bean
    public Step startTimeStep() {
        return new StepBuilder("startTimeStep", jobRepository)
                .<Schedule, Schedule>chunk(100, transactionManager)
                .reader(startTimeReader())
                .writer(startTimeWriter())
                .taskExecutor(asyncExecutor)
                .allowStartIfComplete(true) // 재실행 허용
                .build();
    }


    @Bean
    @StepScope
    public JdbcPagingItemReader<Schedule> startTimeReader() {
        Map<String, Order> sortKeys = new HashMap<>();
        sortKeys.put("s.id", Order.ASCENDING); // 기본 정렬 키
        log.info("수행");
        return new JdbcPagingItemReaderBuilder<Schedule>()
                .name("jdbcPagingItemReader")
                .dataSource(dataSource)
                .fetchSize(100) // 한 번에 읽을 데이터 크기
                .selectClause("SELECT s.id, s.start_time, s.end_time, w.id AS windows_id, w.device_id")
                .fromClause("FROM schedule s LEFT JOIN windows w ON s.windows_id = w.id " +
                        "JOIN schedule_group sg ON s.group_id = sg.id")
                .whereClause("WHERE sg.is_activate = true AND DATE_FORMAT(s.start_time, '%H:%i') = :currentTime AND s.day = :day")
                .sortKeys(sortKeys)
                .parameterValues(parameterValues()) // 파라미터 전달
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
                .build();
    }

    private Map<String, Object> parameterValues() {
        String currentTime = LocalTime.now().format(DateTimeFormatter.ofPattern("HH:mm"));
        String day = LocalDate.now().getDayOfWeek().getDisplayName(TextStyle.NARROW, Locale.KOREAN);
        log.info("currentTime: {}", currentTime);
        log.info("day: {}", day);
        Map<String, Object> params = new HashMap<>();
        params.put("currentTime", currentTime);
        params.put("day", day);

        return params;
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
                log.info("scheduleId: {}",schedule.getId());
                Windows window = schedule.getWindows();
                redisTemplate.opsForSet().add(redisSetKey, String.valueOf(window.getId()));
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
                DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH:mm");

                String redisKey = "schedules:" + endTime.format(formatter);

                List<ScheduleRedisDto> redisDtos = schedules.stream()
                        .map(schedule -> {
                            Long windowsId = schedule.getWindows().getId();
                            String deviceId = schedule.getWindows().getDeviceId();
                            return new ScheduleRedisDto(windowsId, endTime, deviceId);
                        })
                        .toList();

                redisDtos.forEach(dto -> {
                    try{
                        String json = objectMapper.writeValueAsString(dto);
                        log.info("jsonss: {}", json);
                        scheduleRedisTemplate.opsForSet().add(redisKey, dto);
                    } catch (JsonProcessingException e) {
                        e.printStackTrace();
                    }
                });
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
                .taskExecutor(asyncExecutor)
                .build();
    }

    @Bean
    public ItemReader<ScheduleRedisDto> endTimeReader() {
        return new ItemReader<>() {
            private List<ScheduleRedisDto> dtoList = null;
            private int nextIndex = 0;

            @Override
            public ScheduleRedisDto read() throws Exception {

                DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH:mm");
                LocalTime time = LocalTime.now().withSecond(0).withNano(0);

//                String redisKey = "schedules:" + time.toString().substring(0, 5);
                String redisKey = "schedules:" + time.format(formatter);
                log.info("redisKey: {}", redisKey);
                Set<ScheduleRedisDto> jsonDtos = scheduleRedisTemplate.opsForSet().members(redisKey);

                if(jsonDtos != null && !jsonDtos.isEmpty()){
                    dtoList = new ArrayList<>(jsonDtos);
                    scheduleRedisTemplate.delete(redisKey);
                }

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
                redisTemplate.opsForSet().remove(redisSetKey, String.valueOf(dto.getWindowsId()));
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
