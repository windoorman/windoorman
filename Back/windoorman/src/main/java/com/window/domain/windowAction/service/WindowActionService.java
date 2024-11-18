package com.window.domain.windowAction.service;

import com.window.domain.windowAction.dto.ReasonDto;
import com.window.domain.windowAction.dto.response.AvgActionResponseDto;
import com.window.domain.windowAction.dto.request.WindowActionRequestDto;
import com.window.domain.windowAction.entity.WindowAction;
import com.window.domain.windowAction.repository.WindowActionRepository;
import com.window.domain.windows.entity.Windows;
import com.window.domain.windows.model.repository.WindowsRepository;
import com.window.global.exception.CustomException;
import com.window.global.exception.ExceptionResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class WindowActionService {

    private final WindowActionRepository windowActionRepository;
    private final WindowsRepository windowsRepository;
    private final RedisTemplate<String, Object> redisTemplate;

    @Value("${spring.redis.set.key}")
    private String redisSetKey;

    @Value("${spring.redis.action.key}")
    private String actionKey;

    @Transactional
    public Long registerWindowAction(WindowActionRequestDto dto) {
        // 스케줄에 등록되어있고
        if(Boolean.TRUE.equals(redisTemplate.opsForSet().isMember(redisSetKey, String.valueOf(dto.getWindowsId())))){
            // 한번 action에 등록이 됐으면
            if(Boolean.TRUE.equals(redisTemplate.opsForSet().isMember(actionKey, String.valueOf(dto.getWindowsId())))){
                return null;
            }
            // 등록이 되지 않았다면
            redisTemplate.opsForSet().add(actionKey, String.valueOf(String.valueOf(dto.getWindowsId())));
        }
        // 만약에 스케줄이 등록되어있지 않은데
        else{
            // action에 등록이 됐다고 되어있으면
            if(Boolean.TRUE.equals(redisTemplate.opsForSet().isMember(actionKey, String.valueOf(dto.getWindowsId()))))
                redisTemplate.opsForSet().remove(actionKey, String.valueOf(dto.getWindowsId()));
        }

        Windows windows = windowsRepository.findById(dto.getWindowsId())
                .orElseThrow(() -> new ExceptionResponse(CustomException.NOT_FOUND_WINDOWS_EXCEPTION));

        String sensors = dto.getReason().stream()
                .map(ReasonDto::getSensor)
                .collect(Collectors.joining(","));

        String statuses = dto.getReason().stream()
                .map(ReasonDto::getStatus)
                .collect(Collectors.joining(","));
        log.info("sensors: {}", sensors);
        log.info("statuses: {}", statuses);

        WindowAction windowAction = WindowAction.builder()
                .windows(windows)
                .open(dto.getOpen())
                .openTime(dto.getOpenTime())
                .reason(sensors)
                .status(statuses)
                .build();

        return windowActionRepository.save(windowAction).getId();
    }

    public AvgActionResponseDto findCountAction(Long placeId) {
        LocalDateTime endOfDay = LocalDateTime.now();
        LocalDateTime startOfDay = endOfDay.minusDays(7);

        Long openCount = windowActionRepository.countByCountAction(placeId, startOfDay, endOfDay);
        Long windowsCount = windowsRepository.countByPlace_Id(placeId);
        log.info("countActions : openCount {} windowsCount {}", openCount, windowsCount);
        return AvgActionResponseDto.builder()
                .avgActions((double) openCount/windowsCount)
                .build();
    }
}
