package com.window.domain.test;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/elastic")
public class ElasticController {

    private final ElasticService elasticService;

    @GetMapping
    public ResponseEntity<?> getElastic(@RequestParam("windowsId") Long windowsId,
                                        @RequestParam("openTime") LocalDateTime openTime,
                                        @RequestParam("actionId") Long actionId) {
        List<Elastic> data = elasticService.getLogs(windowsId, openTime, actionId);

        return ResponseEntity.ok(data);
    }
}
