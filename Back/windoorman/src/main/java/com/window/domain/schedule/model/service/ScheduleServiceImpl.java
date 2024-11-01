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
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@RequiredArgsConstructor
@Slf4j
@Service
public class ScheduleServiceImpl implements ScheduleService{

    private final WindowsRepository windowsRepository;
    private final ScheduleRepository scheduleRepository;
    private final ScheduleGroupRepository scheduleGroupRepository;

    private final Member member = new Member(1L, "jml6534@naver.com", "이재민", false);

    @Transactional
    @Override
    public void registerSchedule(ScheduleRequestDto dto) {
        ScheduleGroup scheduleGroup = new ScheduleGroup(LocalDateTime.now());
        scheduleGroup = scheduleGroupRepository.save(scheduleGroup);

        for(Day day : dto.getDays()){
            Windows windows = windowsRepository.findById(dto.getWindowId())
                    .orElseThrow(NoSuchElementException::new);

            Schedule schedule = new Schedule(scheduleGroup, windows, member, dto.getStartTime(), dto.getEndTime(), day);
            scheduleRepository.save(schedule);
        }
    }

    @Override
    public List<ScheduleResponseDto> getSchedules() {
        List<Schedule> schedules = scheduleRepository.findByMember_Id(member.getId());
        if(schedules.isEmpty()){
            throw new NoSuchElementException();
        }
        Map<Long, ScheduleResponseDto> scheduleMap = new HashMap<>();

        for(Schedule schedule : schedules){
            ScheduleResponseDto dto = scheduleMap.get(schedule.getScheduleGroup().getId());

            if(dto == null){
                dto = ScheduleResponseDto.builder()
                        .scheduleId(schedule.getId())
                        .groupId(schedule.getScheduleGroup().getId())
                        .placeName(schedule.getWindows().getPlace().getName())
                        .windowName(schedule.getWindows().getName())
                        .startTime(schedule.getStartTime())
                        .endTime(schedule.getEndTime())
                        .days(new ArrayList<>())
                        .isActivate(schedule.isActivate())
                        .build();
                scheduleMap.put(schedule.getScheduleGroup().getId(), dto);
            }

            dto.getDays().add(schedule.getDay());
        }


        return new ArrayList<>(scheduleMap.values());
    }

    @Transactional
    @Override
    public void updateSchedule(ScheduleUpdateRequestDto dto) {
        ScheduleGroup scheduleGroup = scheduleGroupRepository.findById(dto.getGroupId())
                .orElseThrow(() -> new NoSuchElementException());

        scheduleGroupRepository.deleteById(dto.getGroupId());

        ScheduleGroup newScheduleGroup = new ScheduleGroup(LocalDateTime.now());
        newScheduleGroup = scheduleGroupRepository.save(newScheduleGroup);

        Windows windows = windowsRepository.findById(dto.getWindowId())
                .orElseThrow(NoSuchElementException::new);

        for(Day day : dto.getDays()){
            log.info("day : {}", day);
            Schedule schedule = new Schedule(newScheduleGroup, windows, member, dto.getStartTime(), dto.getEndTime(), day);
            scheduleRepository.save(schedule);
        }


    }

    @Override
    public void updateScheduleActivate(ScheduleActivateRequestDto dto) {
        Schedule schedule = scheduleRepository.findById(dto.getScheduleId())
                .orElseThrow(() -> new NoSuchElementException("스케줄이 존재하지 않습니다."));

        schedule.updateActivate(dto);
        try{
            scheduleRepository.save(schedule);
        }
        catch(Exception e){
            e.printStackTrace();
        }

    }

    @Override
    public void deleteSchedule(Long groupId) {
        List<Schedule> schedules = scheduleRepository.findByScheduleGroup_Id(groupId);
        if(schedules == null || schedules.isEmpty()) throw new NoSuchElementException();

        scheduleGroupRepository.deleteById(groupId);
        try{
            scheduleRepository.deleteById(groupId);
        } catch (Exception e){
            e.printStackTrace();
        }

    }
}
