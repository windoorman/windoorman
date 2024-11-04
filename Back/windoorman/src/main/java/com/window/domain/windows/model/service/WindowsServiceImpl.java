package com.window.domain.windows.model.service;

import com.window.domain.member.entity.Member;
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
import com.window.global.util.MemberInfo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class WindowsServiceImpl implements WindowsService {

    private final WindowsRepository windowsRepository;
    private final PlaceRepository placeRepository;

    @Override
    public Map<String, Object> getWindows(Long placeId) {
        Place place = placeRepository.findById(placeId).
                orElseThrow(() -> new ExceptionResponse(CustomException.NOT_FOUND_PLACE_EXCEPTION));

        List<Windows> windows = windowsRepository.findAllByPlaceId(placeId);
        List<WindowsResponseDto> dtoList = new ArrayList<>();

        for (Windows window : windows) {
            dtoList.add(WindowsResponseDto.createResponseDto(window));
        }
        Map<String, Object> map = new HashMap<>();
        map.put("placeName", "우리집");
        map.put("windows", dtoList);


        return map;
    }

    @Override
    public WindowsDetailResponseDto getWindowInfo(Long windowsId) {
        Windows window = windowsRepository.findById(windowsId)
                .orElseThrow(() -> new ExceptionResponse(CustomException.NOT_FOUND_WINDOWS_EXCEPTION));

        // 실제로 센서에서 데이터 가져오면 그 데이터를 넣기
        SensorDataDto sensorDataDto = new SensorDataDto(25.0, 30.0, 22.8);

        return WindowsDetailResponseDto.builder()
                .placeName("우리집")
                .windowsId(windowsId)
                .name(window.getName())
                .sensorData(sensorDataDto).build();
    }

    @Override
    public void registerWindow(WindowsRequestDto dto, Authentication authentication) {

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

        try{
            windowsRepository.save(windows);
        }
        catch (Exception e){
            e.printStackTrace();
        }

        // 등록된 라즈베리파이에 wifi 정보와 raspberryId 보내기

        // 라즈베리파이에 페어링을 하고나서 창문 등록이 가능하게 할지
        // 이렇게 하면 wifi 정보를 바로 보내면 된다.
        
        // 창문을 등록하고 나서 라즈베리파이에 페어링하게 할지
        // 이렇게 하면 wifi 정보를 db에 저장해놔야함

    }

    @Override
    public void updateWindow(WindowsUpdateRequestDto dto) {
        Windows windows = windowsRepository.findById(dto.getWindowsId())
                .orElseThrow(() -> new ExceptionResponse(CustomException.NOT_FOUND_WINDOWS_EXCEPTION));


        windows.updateWindow(dto);

        try{
            windowsRepository.save(windows);
        } catch (Exception e){
            e.printStackTrace();
        }


        // wifi 정보가 바뀌면 wifi 정보를 라즈베리파이에 update

    }

    @Override
    public void deleteWindow(Long windowsId) {
        Windows window = windowsRepository.findById(windowsId)
                .orElseThrow(() -> new ExceptionResponse(CustomException.NOT_FOUND_WINDOWS_EXCEPTION));

        windowsRepository.deleteById(windowsId);

    }

    @Override
    public void changeToggle(WindowsToggleRequestDto dto) {
        Windows window = windowsRepository.findById(dto.getWindowsId())
                .orElseThrow(() -> new ExceptionResponse(CustomException.NOT_FOUND_WINDOWS_EXCEPTION));
        log.info("isAuto: {}", dto.getIsAuto());
        window.autoUpdateWindow(dto);

        windowsRepository.save(window);
    }

}
