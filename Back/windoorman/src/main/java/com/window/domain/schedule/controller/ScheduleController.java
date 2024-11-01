package com.window.domain.schedule.controller;

import com.window.domain.schedule.dto.request.ScheduleActivateRequestDto;
import com.window.domain.schedule.dto.request.ScheduleRequestDto;
import com.window.domain.schedule.dto.request.ScheduleUpdateRequestDto;
import com.window.domain.schedule.model.service.ScheduleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@Controller
@RequestMapping("/schedules")
@RequiredArgsConstructor
@Slf4j
@Validated
public class ScheduleController {

    private final ScheduleService scheduleService;

    @PostMapping
    public ResponseEntity<?> registerSchedule(@Valid @RequestBody ScheduleRequestDto dto) {
        scheduleService.registerSchedule(dto);

        return ResponseEntity.status(201).body("스케줄 등록");
    }

    @GetMapping
    public ResponseEntity<?> getSchedules() {
        return ResponseEntity.status(200).body(scheduleService.getSchedules());
    }

    @PatchMapping
    public ResponseEntity<?> updateSchedule(@Valid @RequestBody ScheduleUpdateRequestDto dto) {
        scheduleService.updateSchedule(dto);

        return ResponseEntity.status(200).body("스케줄 수정");

    }

    @PatchMapping("/toggle")
    public ResponseEntity<?> updateScheduleActivated(@Valid @RequestBody ScheduleActivateRequestDto dto) {
        scheduleService.updateScheduleActivate(dto);

        return ResponseEntity.status(200).body("활성화 수정");
    }

    @DeleteMapping("/{scheduleId}")
    public ResponseEntity<?> deleteSchedule(@PathVariable("scheduleId") Long scheduleId) {
        scheduleService.deleteSchedule(scheduleId);

        return ResponseEntity.status(200).body("스케줄 삭제");
    }
}
