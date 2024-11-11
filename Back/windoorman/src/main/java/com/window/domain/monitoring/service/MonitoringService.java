package com.window.domain.monitoring.service;

import com.window.domain.monitoring.repository.EmitterRepository;
import com.window.domain.windows.dto.SensorDataDto;
import com.window.global.exception.CustomException;
import com.window.global.exception.ExceptionResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.Console;
import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;


@Service
@Slf4j
public class MonitoringService {
    private final Map<Long, Object> latestDataMap = new ConcurrentHashMap<>();
    private final RedisTemplate<String, Object> redisTemplate;
    private final EmitterRepository emitterRepository;

    public MonitoringService(RedisTemplate<String, Object> redisTemplate, EmitterRepository emitterRepository) {
        this.redisTemplate = redisTemplate;
        this.emitterRepository = emitterRepository;
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

        System.out.println("Processing data for windowId " + windowId + ": " + payload);
        //TODO: MQTT DATA TO DTO
        SensorDataDto sensorDataDto = new SensorDataDto();

        // store last data to redis
        onMessageReceived(windowId, sensorDataDto);

        // send dto to client
        sendToClient(windowId, sensorDataDto);
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


}