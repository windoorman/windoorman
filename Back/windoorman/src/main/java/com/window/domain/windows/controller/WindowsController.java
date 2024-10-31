package com.window.domain.windows.controller;

import com.window.domain.windows.dto.request.WindowsRequestDto;
import com.window.domain.windows.dto.request.WindowsToggleRequestDto;
import com.window.domain.windows.dto.request.WindowsUpdateRequestDto;
import com.window.domain.windows.dto.response.WindowsDetailResponseDto;
import com.window.domain.windows.dto.response.WindowsResponseDto;
import com.window.domain.windows.model.service.WindowsService;
import com.window.domain.windows.model.service.WindowsServiceImpl;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Controller
@RequestMapping("/windows")
@RequiredArgsConstructor
@Validated
@Slf4j
public class WindowsController {

    private final WindowsService windowService;

    @GetMapping("/{placeId}")
    public ResponseEntity<?> getWindows(@PathVariable Long placeId) {

        Map<String, Object> windows = windowService.getWindows(placeId);

        return ResponseEntity.ok(windows);
    }

    @GetMapping("/detail/{windowId}")
    public ResponseEntity<?> getWindow(@PathVariable Long windowId) {
        WindowsDetailResponseDto dto = windowService.getWindowInfo(windowId);

        return ResponseEntity.ok(dto);
    }

    @PostMapping
    public ResponseEntity<?> registerWindow(@Valid @RequestBody WindowsRequestDto dto){
        log.info("창문 등록 정보 {}", dto.getName());
        windowService.registerWindow(dto);

        return ResponseEntity.status(201).body("등록");
    }

    @PatchMapping
    public ResponseEntity<?> updateWindow(@Valid @RequestBody WindowsUpdateRequestDto dto){
        windowService.updateWindow(dto);

        return ResponseEntity.status(200).body("수정");
    }

    @DeleteMapping("/{windowId}")
    public ResponseEntity<?> deleteWindow(@PathVariable Long windowId){
        windowService.deleteWindow(windowId);

        return ResponseEntity.status(200).body("삭제");
    }

    @PatchMapping("/toggle")
    public ResponseEntity<?> toggleChange(@RequestBody WindowsToggleRequestDto dto){
        windowService.changeToggle(dto);
        log.info("{}", dto.getIsAuto());

        return ResponseEntity.status(200).body("활성화 변경");
    }

}
