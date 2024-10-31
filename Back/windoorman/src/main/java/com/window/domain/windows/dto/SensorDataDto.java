package com.window.domain.windows.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class SensorDataDto {
    private double humidity;
    private double airCondition;
    private double temperature;
}
