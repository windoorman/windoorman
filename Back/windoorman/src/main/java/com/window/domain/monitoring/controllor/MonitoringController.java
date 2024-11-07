package com.window.domain.monitoring.controllor;

import com.window.domain.monitoring.service.MonitoringService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequestMapping("/sensors")
@RequiredArgsConstructor
public class MonitoringController {

    private final MonitoringService monitoringService;
    @GetMapping(produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter getSensorData(@PathVariable("windowId") Long windowId) {
        return monitoringService.subscribe(windowId);

    }

}
