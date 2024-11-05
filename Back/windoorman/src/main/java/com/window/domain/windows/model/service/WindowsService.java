package com.window.domain.windows.model.service;

import com.window.domain.place.entity.Place;
import com.window.domain.place.repository.PlaceRepository;
import com.window.domain.windows.dto.SensorDataDto;
import com.window.domain.windows.dto.request.WindowsRequestDto;
import com.window.domain.windows.dto.request.WindowsToggleRequestDto;
import com.window.domain.windows.dto.request.WindowsUpdateRequestDto;
import com.window.domain.windows.dto.response.WindowsDetailResponseDto;
import com.window.domain.windows.dto.response.WindowsResponseDto;
import com.window.domain.windows.entity.Windows;
import com.window.domain.windows.model.repository.WindowsRepository;
import com.window.global.exception.CustomException;
import com.window.global.exception.ExceptionResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class WindowsService {

    private final WindowsRepository windowsRepository;
    private final PlaceRepository placeRepository;

    public Map<String, Object> getWindows(Long placeId) {
        Place place = placeRepository.findById(placeId).
                orElseThrow(() -> new ExceptionResponse(CustomException.NOT_FOUND_PLACE_EXCEPTION));

        List<Windows> windows = windowsRepository.findAllByPlaceId(placeId)
                .orElseThrow(() -> new ExceptionResponse(CustomException.NOT_FOUND_WINDOWS_EXCEPTION));
        List<WindowsResponseDto> dtoList = new ArrayList<>();

        for (Windows window : windows) {
            dtoList.add(WindowsResponseDto.createResponseDto(window));
        }
        Map<String, Object> map = new HashMap<>();
        map.put("placeName", place.getName());
        map.put("windows", dtoList);


        return map;
    }

    public WindowsDetailResponseDto getWindowInfo(Long windowsId) {
        Windows window = windowsRepository.findById(windowsId)
                .orElseThrow(() -> new ExceptionResponse(CustomException.NOT_FOUND_WINDOWS_EXCEPTION));

        // 실제로 센서에서 데이터 가져오면 그 데이터를 넣기
        SensorDataDto sensorDataDto = new SensorDataDto(25.0, 30.0, 22.8);

        return WindowsDetailResponseDto.builder()
                .placeName(window.getPlace().getName())
                .windowsId(windowsId)
                .name(window.getName())
                .sensorData(sensorDataDto).build();
    }

    public Long registerWindow(WindowsRequestDto dto, Authentication authentication) {

        Place place = placeRepository.findById(dto.getPlaceId())
                .orElseThrow(() -> new ExceptionResponse(CustomException.NOT_FOUND_PLACE_EXCEPTION));

        String uuid = UUID.randomUUID().toString();

        while(true){
            Windows windows = windowsRepository.findByRaspberryId(uuid);
            if(windows != null) uuid = UUID.randomUUID().toString();
            else break;
        }

        Windows windows = Windows.builder()
                .place(place)
                .name(dto.getName())
                .raspberryId(uuid)
                .build();

        return windowsRepository.save(windows).getId();

        // 등록된 라즈베리파이에 wifi 정보와 raspberryId 보내기

        // 라즈베리파이에 페어링을 하고나서 창문 등록이 가능하게 할지
        // 이렇게 하면 wifi 정보를 바로 보내면 된다.

        // 창문을 등록하고 나서 라즈베리파이에 페어링하게 할지
        // 이렇게 하면 wifi 정보를 db에 저장해놔야함

    }

    public void updateWindow(WindowsUpdateRequestDto dto) {
        Windows windows = windowsRepository.findById(dto.getWindowsId())
                .orElseThrow(() -> new ExceptionResponse(CustomException.NOT_FOUND_WINDOWS_EXCEPTION));


        windows.updateWindow(dto);

        windowsRepository.save(windows);


        // wifi 정보가 바뀌면 wifi 정보를 라즈베리파이에 update

    }

    public void deleteWindow(Long windowsId) {
        Windows window = windowsRepository.findById(windowsId)
                .orElseThrow(() -> new ExceptionResponse(CustomException.NOT_FOUND_WINDOWS_EXCEPTION));

        windowsRepository.deleteById(windowsId);

    }

    public void changeToggle(WindowsToggleRequestDto dto) {
        Windows window = windowsRepository.findById(dto.getWindowsId())
                .orElseThrow(() -> new ExceptionResponse(CustomException.NOT_FOUND_WINDOWS_EXCEPTION));
        log.info("isAuto: {}", dto.getIsAuto());
        window.autoUpdateWindow(dto);

        windowsRepository.save(window);
    }

}
