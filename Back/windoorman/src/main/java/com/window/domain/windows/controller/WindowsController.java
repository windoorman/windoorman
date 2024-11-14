package com.window.domain.windows.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.window.domain.windows.dto.request.WindowsRequestDto;
import com.window.domain.windows.dto.request.WindowsToggleRequestDto;
import com.window.domain.windows.dto.request.WindowsUpdateRequestDto;
import com.window.domain.windows.dto.response.WindowsDetailResponseDto;
import com.window.domain.windows.model.service.WindowsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/windows")
@RequiredArgsConstructor
@Validated
@Slf4j
public class WindowsController {

    private final WindowsService windowService;
    private final ObjectMapper objectMapper;

    @GetMapping("/{placeId}")
    public ResponseEntity<?> getWindows(@PathVariable Long placeId) {

        Map<String, Object> windows = windowService.getWindows(placeId);

        return ResponseEntity.ok(windows);
    }

    @GetMapping("/detail/{windowsId}")
    public ResponseEntity<?> getWindow(@PathVariable Long windowsId) {
        WindowsDetailResponseDto dto = windowService.getWindowInfo(windowsId);

        return ResponseEntity.ok(dto);
    }

    @PostMapping
    public ResponseEntity<?> registerWindow(@Valid @RequestBody WindowsRequestDto dto, Authentication authentication){
        log.info("창문 등록 정보 {}", dto.getName());
        Long windowsId = windowService.registerWindow(dto, authentication);

        return ResponseEntity.status(201).body(windowsId);
    }

    @PatchMapping
    public ResponseEntity<?> updateWindow(@RequestBody WindowsUpdateRequestDto dto){
        windowService.updateWindow(dto);

        return ResponseEntity.status(200).body("수정");
    }

    @DeleteMapping("/{windowsId}")
    public ResponseEntity<?> deleteWindow(@PathVariable Long windowsId){
        windowService.deleteWindow(windowsId);

        return ResponseEntity.status(200).body("삭제");
    }

    @PatchMapping("/toggle")
    public ResponseEntity<?> toggleChange(@RequestBody WindowsToggleRequestDto dto){
        windowService.changeToggle(dto);
        log.info("{}", dto.getIsAuto());

        return ResponseEntity.status(200).body("활성화 변경");
    }

    @GetMapping("/open/{windowsId}")
    public ResponseEntity<?> openWindow(@PathVariable("windowsId") Long windowsId) throws JsonProcessingException {
        String data = windowService.open(windowsId, false);
        JsonNode jsonData = objectMapper.readTree(data);
        return ResponseEntity.status(200).body(jsonData);
    }

    @GetMapping("/close/{windowsId}")
    public ResponseEntity<?> closeWindow(@PathVariable("windowsId") Long windowsId) throws JsonProcessingException {
        String data = windowService.close(windowsId, false);
        JsonNode jsonData = objectMapper.readTree(data);
        return ResponseEntity.status(200).body(jsonData);
    }

    @GetMapping("/open/auto/{windowsId}")
    public ResponseEntity<?> openAutoWindow(@PathVariable("windowsId") Long windowsId) throws JsonProcessingException {
        String data = windowService.open(windowsId, true);
        if(data == null)
            return ResponseEntity.status(200).build();
        JsonNode jsonData = objectMapper.readTree(data);
        return ResponseEntity.status(200).body(jsonData);
    }

    @GetMapping("/close/auto/{windowsId}")
    public ResponseEntity<?> closeAutoWindow(@PathVariable("windowsId") Long windowsId) throws JsonProcessingException {
        String data = windowService.close(windowsId, true);
        if(data == null)
            return ResponseEntity.status(200).build();
        JsonNode jsonData = objectMapper.readTree(data);
        return ResponseEntity.status(200).body(jsonData);
    }




}
