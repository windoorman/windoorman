package com.window.domain.windows.dto.request;

import lombok.Getter;

@Getter
public class WindowsUpdateRequestDto {
    private Long windowsId;
    private String name;
    private String wifiName;
    private String wifiPassword;
}
