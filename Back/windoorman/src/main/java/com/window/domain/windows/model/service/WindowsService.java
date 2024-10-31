package com.window.domain.windows.model.service;

import com.window.domain.windows.dto.request.WindowsRequestDto;
import com.window.domain.windows.dto.request.WindowsToggleRequestDto;
import com.window.domain.windows.dto.request.WindowsUpdateRequestDto;
import com.window.domain.windows.dto.response.WindowsDetailResponseDto;

import java.util.Map;

public interface WindowsService {

    Map<String, Object> getWindows(Long placeId);

    WindowsDetailResponseDto getWindowInfo(Long windowId);

    void registerWindow(WindowsRequestDto dto);

    void updateWindow(WindowsUpdateRequestDto dto);

    void deleteWindow(Long windowId);

    void changeToggle(WindowsToggleRequestDto dto);
}
