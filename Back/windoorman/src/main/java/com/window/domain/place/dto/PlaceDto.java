package com.window.domain.place.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

@Getter @Setter
@AllArgsConstructor
public class PlaceDto {
    private Long id;
    private String address;
    private String name;
    private Boolean isDefault;
}
