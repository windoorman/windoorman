package com.window.domain.windowAction.service;

import com.window.domain.windowAction.dto.response.AvgActionResponseDto;
import com.window.domain.windowAction.dto.request.WindowActionRequestDto;
import com.window.domain.windowAction.entity.WindowAction;
import com.window.domain.windowAction.repository.WindowActionRepository;
import com.window.domain.windows.entity.Windows;
import com.window.domain.windows.model.repository.WindowsRepository;
import com.window.global.exception.CustomException;
import com.window.global.exception.ExceptionResponse;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class WindowActionService {

    private static final Logger log = LoggerFactory.getLogger(WindowActionService.class);
    private final WindowActionRepository windowActionRepository;
    private final WindowsRepository windowsRepository;

    @Transactional
    public Long registerWindowAction(WindowActionRequestDto dto) {

        Windows windows = windowsRepository.findById(dto.getWindowsId())
                .orElseThrow(() -> new ExceptionResponse(CustomException.NOT_FOUND_WINDOWS_EXCEPTION));

        WindowAction windowAction = WindowAction.builder()
                .windows(windows)
                .open(dto.getOpen())
                .openTime(dto.getOpenTime())
                .reason(dto.getReason())
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
