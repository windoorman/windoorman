package com.window.domain.windowAction.service;

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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class WindowActionService {

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
        CountActionDto countActions = windowActionRepository.findByCountAction(placeId)
                .orElseThrow();
        return AvgActionResponseDto.builder()
                .avgActions((double) countActions.getOpenCount()/countActions.getWindowsCount())
                .build();
    }
}
