package com.window.domain.schedule.model.service;

import com.window.domain.schedule.dto.request.ScheduleActivateRequestDto;
import com.window.domain.schedule.dto.request.ScheduleRequestDto;
import com.window.domain.schedule.dto.request.ScheduleUpdateRequestDto;
import com.window.domain.schedule.dto.response.ScheduleResponseDto;
import com.window.domain.schedule.entity.Schedule;
import org.springframework.stereotype.Service;

import java.util.List;

public interface ScheduleService {

    void registerSchedule(ScheduleRequestDto dto);

    List<ScheduleResponseDto> getSchedules();

    void updateSchedule(ScheduleUpdateRequestDto dto);

    void updateScheduleActivate(ScheduleActivateRequestDto dto);

    void deleteSchedule(Long groupId);
}
