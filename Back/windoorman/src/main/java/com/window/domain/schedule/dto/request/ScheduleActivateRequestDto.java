package com.window.domain.schedule.dto.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;

@Getter
public class ScheduleActivateRequestDto {

    @NotNull
    private Long scheduleId;

    @NotNull
    private Boolean isActivate;
}
