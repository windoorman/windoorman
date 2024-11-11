package com.window.domain.windowAction.service;

import com.window.domain.windowAction.dto.request.WindowActionRequestDto;
import com.window.domain.windowAction.entity.WindowAction;
import com.window.domain.windowAction.repository.WindowActionRepository;
import com.window.domain.windows.entity.Windows;
import com.window.domain.windows.model.repository.WindowsRepository;
import com.window.global.exception.CustomException;
import com.window.global.exception.ExceptionResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class WindowActionService {

    private final WindowActionRepository windowActionRepository;
    private final WindowsRepository windowsRepository;

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
}
