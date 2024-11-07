package com.window.domain.monitoring.service;

import co.elastic.clients.elasticsearch.ElasticsearchClient;
import co.elastic.clients.elasticsearch._types.aggregations.AggregationBuilders;
import co.elastic.clients.elasticsearch.core.SearchRequest;
import com.window.domain.monitoring.dto.WindowData;
import com.window.domain.monitoring.repository.EmitterRepository;
import com.window.domain.windows.dto.SensorDataDto;
import com.window.global.exception.CustomException;
import com.window.global.exception.ExceptionResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class MonitoringService {

    private final EmitterRepository emitterRepository;

    public SseEmitter subscribe(Authentication authentication, Long windowId) {
        SseEmitter sseEmitter = new SseEmitter(Long.MAX_VALUE);
        emitterRepository.save(windowId, sseEmitter);

        System.out.println("subscribe: " + windowId);
        System.out.println(emitterRepository.size());
        System.out.println(emitterRepository.get(windowId));
        System.out.println("======================");

        sseEmitter.onCompletion(()-> {
            emitterRepository.deleteById(windowId);
            System.out.println("complete: " + windowId);
        });
        sseEmitter.onTimeout(() -> {
            emitterRepository.deleteById(windowId);
            System.out.println("timeout: " + windowId);
        });
        sseEmitter.onError((e) -> {
            emitterRepository.deleteById(windowId);
            System.out.println("error: " + windowId);
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


    public void processSensorData(Long windowId, String payload) {

        System.out.println("Processing data for windowId " + windowId + ": " + payload);
        //MQTT DATA TO DTO

        SensorDataDto sensorDataDto = new SensorDataDto();
        

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
