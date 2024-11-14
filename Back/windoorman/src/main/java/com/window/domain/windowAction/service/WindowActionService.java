package com.window.domain.windowAction.service;

import com.window.domain.windowAction.dto.ReasonDto;
import com.window.domain.windowAction.dto.response.AvgActionResponseDto;
import com.window.domain.windowAction.dto.CountActionDto;
import com.window.domain.windowAction.dto.request.WindowActionRequestDto;
import com.window.domain.windowAction.entity.WindowAction;
import com.window.domain.windowAction.repository.WindowActionRepository;
import com.window.domain.windows.entity.Windows;
import com.window.domain.windows.model.repository.WindowsRepository;
import com.window.global.exception.CustomException;
import com.window.global.exception.ExceptionResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class WindowActionService {

    private final WindowActionRepository windowActionRepository;
    private final WindowsRepository windowsRepository;

    @Transactional
    public Long registerWindowAction(WindowActionRequestDto dto) {

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
        CountActionDto countActions = windowActionRepository.findByCountAction(placeId)
                .orElseThrow(()->new ExceptionResponse(CustomException.NOT_FOUND_COUNT_ACTION_EXCEPTION));
        return AvgActionResponseDto.builder()
                .avgActions((double) countActions.getOpenCount()/countActions.getWindowsCount())
                .build();
    }
}
