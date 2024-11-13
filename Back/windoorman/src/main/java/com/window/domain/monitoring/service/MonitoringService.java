package com.window.domain.monitoring.service;

import co.elastic.clients.elasticsearch.ElasticsearchClient;
import co.elastic.clients.elasticsearch._types.Time;
import co.elastic.clients.elasticsearch._types.aggregations.DateHistogramAggregate;
import co.elastic.clients.elasticsearch.core.SearchResponse;
import co.elastic.clients.json.JsonData;
import com.window.domain.member.entity.Member;
import com.window.domain.monitoring.dto.GraphDataResponse;
import com.window.domain.monitoring.repository.EmitterRepository;
import com.window.domain.windows.dto.SensorDataDto;
import com.window.global.exception.CustomException;
import com.window.global.exception.ExceptionResponse;
import com.window.global.util.MemberInfo;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;


@Service
@Slf4j
public class MonitoringService {
    private final Map<Long, Object> latestDataMap = new ConcurrentHashMap<>();
    private final RedisTemplate<String, Object> redisTemplate;
    private final EmitterRepository emitterRepository;
    private final ElasticsearchClient esClient;

    public MonitoringService(RedisTemplate<String, Object> redisTemplate, EmitterRepository emitterRepository, ElasticsearchClient esClient) {
        this.redisTemplate = redisTemplate;
        this.emitterRepository = emitterRepository;
        this.esClient = esClient;
    }

    public SseEmitter subscribe(Long windowId) {
        SseEmitter sseEmitter = new SseEmitter(Long.MAX_VALUE);
        emitterRepository.save(windowId, sseEmitter);

        log.info("subscribe: " + windowId);
        log.info(String.valueOf(emitterRepository.size()));
        log.info(String.valueOf(emitterRepository.get(windowId)));
        log.info("======================");

        sseEmitter.onCompletion(()-> {
            emitterRepository.deleteById(windowId);
            saveLastSensorDataToRedis(windowId);
            log.info("complete: " + windowId);
        });
        sseEmitter.onTimeout(() -> {
            emitterRepository.deleteById(windowId);
            saveLastSensorDataToRedis(windowId);
            log.info("timeout: " + windowId);
        });
        sseEmitter.onError((e) -> {
            emitterRepository.deleteById(windowId);
            saveLastSensorDataToRedis(windowId);
            log.info("error: " + windowId);
        });


        try {
            sseEmitter.send(SseEmitter.event()
                    .id(String.valueOf(windowId))
                    .name("test")
                    .data("test")
                    .comment("test"));
        } catch (IOException e) {
            emitterRepository.deleteById(windowId);
            sseEmitter.completeWithError(e);
            throw new ExceptionResponse(CustomException.FAIL_CONNECT_SSE_EXCEPTION);
        }


        return sseEmitter;

    }

    public void onMessageReceived(Long windowId, Object sensorData) {
        // Cache the latest data locally
        latestDataMap.put(windowId, sensorData);

    }
    public Object getLastSensorData(Long windowId) {
        return latestDataMap.get(windowId);
    }
    private void saveLastSensorDataToRedis(Long windowId) {
        // Fetch the last known sensor data, perhaps from an in-memory cache or a service method

        Object lastSensorData = getLastSensorData(windowId);
        redisTemplate.opsForValue().set("lastSensorData:" + windowId, lastSensorData);
        log.info("Stored last sensor data for windowId " + windowId);

    }


    public void processSensorData(Long windowId, String payload) {

        log.info("Processing data for windowId " + payload);
        //TODO: MQTT DATA TO DTO

        String[] pairs = payload.split(":"); // 숫자와 문자 경계에서 split
        List<String> values = new ArrayList<>();

        for (int i = 1; i < pairs.length; i++) { // 값만 추출
            String value = pairs[i].trim().split(" ")[0]; // 공백 이후 문자를 제거하여 값만 남기기
            values.add(value);
        }
        System.out.println(values);
        SensorDataDto sensorDataDto =setDto(values);

        // store last data to redis
        onMessageReceived(windowId, sensorDataDto);

        // send dto to client
        sendToClient(windowId, sensorDataDto);
    }
    private SensorDataDto setDto(List<String> values) {
        Long windowId = Long.parseLong(values.get(1));
        Double co2 = Double.parseDouble(values.get(2));
        Double voc = Double.parseDouble(values.get(3));
        Double pm25 = Double.parseDouble(values.get(4));
        Double pm10 = Double.parseDouble(values.get(5));
        Double humidity = Double.parseDouble(values.get(6));
        Double temperature = Double.parseDouble(values.get(7));

        return new SensorDataDto(windowId, co2, voc, pm25, pm10, humidity, temperature);
    }


    public void sendToClient(long windowId, Object data) {
        SseEmitter emitter = emitterRepository.get(windowId);
        if (emitter != null) {
            try {
                emitter.send(SseEmitter.event()
                        .id(String.valueOf(windowId))
                        .name("sensors")
                        .data(data));

            } catch (IOException e) {
                emitterRepository.deleteById(windowId);
                emitter.completeWithError(e);
                throw new ExceptionResponse(CustomException.FAIL_SEND_SENSORS_EXCEPTION);
            }
        }
    }

    public List<GraphDataResponse> getGraphData(Authentication authentication, Long windowId, int category) {
        List<GraphDataResponse> responses = new ArrayList<>();
        Member member = MemberInfo.getMemberInfo(authentication);
        LocalDate now = LocalDateTime.now(ZoneOffset.UTC).toLocalDate();
        String indexName = "1-" + windowId+"-2024.11.12";
        try {
            SearchResponse<Void> search = esClient.search(s -> s
                            .index(indexName) // Replace with your actual index name
                            .size(0) // Adjust size based on expected results; you can use pagination if necessary
                            .aggregations("hourly_avg_humidity", a -> a
                                    .dateHistogram(h -> h
                                            .field("@timestamp")
                                            .fixedInterval(Time.of(t->t.time("1h"))) // Group by hour
                                            .format("yyyy-MM-dd HH:mm:ss")
                                    )           
                                    .aggregations("avg_humidity", subAgg -> subAgg
                                            .avg(avg -> avg.field("humid")) // Calculate average of humidity
                                    )
                            ),
                    Void.class
            );

            DateHistogramAggregate histogram = search.aggregations()
                    .get("hourly_avg_humidity")
                    .dateHistogram();

            for (var bucket : histogram.buckets().array()) {
                String dateStr = bucket.keyAsString();
                assert dateStr != null;
                LocalDateTime dateTime = LocalDateTime.parse(dateStr, DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));

                double avgHumidity = bucket.aggregations().get("avg_humidity").avg().value();
                responses.add(new GraphDataResponse(dateTime, avgHumidity));
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        return responses;
    }




}
