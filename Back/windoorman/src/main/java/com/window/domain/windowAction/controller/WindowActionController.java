package com.window.domain.windowAction.controller;

import com.window.domain.windowAction.dto.request.WindowActionRequestDto;
import com.window.domain.windowAction.service.WindowActionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/action")
public class WindowActionController {

    private final WindowActionService windowActionService;

    @PostMapping
    public ResponseEntity<?> registerWindowAction(@RequestBody WindowActionRequestDto windowAction) {
        Long id = windowActionService.registerWindowAction(windowAction);
        return ResponseEntity.ok(id);
    }
}
