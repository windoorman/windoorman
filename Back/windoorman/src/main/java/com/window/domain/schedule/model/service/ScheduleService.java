package com.window.domain.schedule.model.service;

import com.window.domain.member.entity.Member;
import com.window.domain.schedule.dto.request.ScheduleActivateRequestDto;
import com.window.domain.schedule.dto.request.ScheduleRequestDto;
import com.window.domain.schedule.dto.request.ScheduleUpdateRequestDto;
import com.window.domain.schedule.dto.response.ScheduleResponseDto;
import com.window.domain.schedule.entity.Day;
import com.window.domain.schedule.entity.Schedule;
import com.window.domain.schedule.entity.ScheduleGroup;
import com.window.domain.schedule.model.repository.ScheduleGroupRepository;
import com.window.domain.schedule.model.repository.ScheduleRepository;
import com.window.domain.windows.entity.Windows;
import com.window.domain.windows.model.repository.WindowsRepository;
import com.window.global.exception.CustomException;
import com.window.global.exception.ExceptionResponse;
import com.window.global.util.MemberInfo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@RequiredArgsConstructor
@Slf4j
@Service
public class ScheduleService {

    private final WindowsRepository windowsRepository;
    private final ScheduleRepository scheduleRepository;
    private final ScheduleGroupRepository scheduleGroupRepository;

    @Transactional
    public Long registerSchedule(ScheduleRequestDto dto, Authentication authentication) {
        ScheduleGroup scheduleGroup = new ScheduleGroup(LocalDateTime.now());
        scheduleGroup = scheduleGroupRepository.save(scheduleGroup);

        Member member = MemberInfo.getMemberInfo(authentication);

        Windows windows = windowsRepository.findById(dto.getWindowsId())
                .orElseThrow(() -> new ExceptionResponse(CustomException.NOT_FOUND_SCHEDULE_EXCEPTION));
        for(Day day : dto.getDays()){
            Schedule schedule = Schedule.builder()
                    .scheduleGroup(scheduleGroup)
                    .windows(windows)
                    .member(member)
                    .startTime(dto.getStartTime())
                    .endTime(dto.getEndTime())
                    .day(day)
                    .build();
            scheduleRepository.save(schedule);
        }

        return scheduleGroup.getId();
    }

    public List<ScheduleResponseDto> getSchedules(Authentication authentication) {
        Member member = MemberInfo.getMemberInfo(authentication);
        List<Schedule> schedules = scheduleRepository.findByMember_Id(member.getId())
                .orElseThrow(() -> new ExceptionResponse(CustomException.NOT_FOUND_SCHEDULE_EXCEPTION));
        Map<Long, ScheduleResponseDto> scheduleMap = new HashMap<>();

        for(Schedule schedule : schedules){
            ScheduleResponseDto dto = scheduleMap.get(schedule.getScheduleGroup().getId());

            if(dto == null){
                dto = ScheduleResponseDto.builder()
                        .scheduleId(schedule.getId())
                        .groupId(schedule.getScheduleGroup().getId())
                        .windowsId(schedule.getWindows().getId())
                        .placeName(schedule.getWindows().getPlace().getName())
                        .windowName(schedule.getWindows().getName())
                        .startTime(schedule.getStartTime())
                        .endTime(schedule.getEndTime())
                        .days(new ArrayList<>())
                        .isActivate(schedule.getScheduleGroup().isActivate())
                        .build();
                scheduleMap.put(schedule.getScheduleGroup().getId(), dto);
            }

            dto.getDays().add(schedule.getDay());
        }


        return new ArrayList<>(scheduleMap.values());
    }

    @Transactional
    public void updateSchedule(ScheduleUpdateRequestDto dto, Authentication authentication) {
        ScheduleGroup scheduleGroup = scheduleGroupRepository.findById(dto.getGroupId())
                .orElseThrow(() -> new ExceptionResponse(CustomException.NOT_FOUND_SCHEDULEGROUP_EXCEPTION));

        scheduleGroupRepository.deleteById(dto.getGroupId());

        ScheduleGroup newScheduleGroup = new ScheduleGroup(LocalDateTime.now());
        newScheduleGroup = scheduleGroupRepository.save(newScheduleGroup);

        Windows windows = windowsRepository.findById(dto.getWindowsId())
                .orElseThrow(() -> new ExceptionResponse(CustomException.NOT_FOUND_WINDOWS_EXCEPTION));

        Member member = MemberInfo.getMemberInfo(authentication);

        for(Day day : dto.getDays()){
            log.info("day : {}", day);
            Schedule schedule = Schedule.builder()
                    .scheduleGroup(newScheduleGroup)
                    .windows(windows)
                    .member(member)
                    .startTime(dto.getStartTime())
                    .endTime(dto.getEndTime())
                    .day(day)
                    .build();
            scheduleRepository.save(schedule);
        }


    }

    public void updateScheduleActivate(ScheduleActivateRequestDto dto) {
        ScheduleGroup scheduleGroup = scheduleGroupRepository.findById(dto.getGroupId())
                        .orElseThrow(() -> new ExceptionResponse(CustomException.NOT_FOUND_SCHEDULEGROUP_EXCEPTION));
        scheduleGroup.updateActive(dto);

        scheduleGroupRepository.save(scheduleGroup);

    }

    public void deleteSchedule(Long groupId) {
        List<Schedule> schedules = scheduleRepository.findByScheduleGroup_Id(groupId)
                .orElseThrow(() -> new ExceptionResponse(CustomException.NOT_FOUND_SCHEDULE_EXCEPTION));

        scheduleGroupRepository.deleteById(groupId);

    }
}
