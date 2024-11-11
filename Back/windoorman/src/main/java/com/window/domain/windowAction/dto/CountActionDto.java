package com.window.domain.windowAction.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Builder
@AllArgsConstructor
@Getter
public class CountActionDto{
    Long windowsCount;
    Long openCount;
}
