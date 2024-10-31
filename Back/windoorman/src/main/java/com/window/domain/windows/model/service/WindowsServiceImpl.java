package com.window.domain.windows.model.service;

import com.window.domain.member.entity.Member;
import com.window.domain.place.entity.Place;
import com.window.domain.windows.dto.SensorDataDto;
import com.window.domain.windows.dto.request.WindowsRequestDto;
import com.window.domain.windows.dto.request.WindowsToggleRequestDto;
import com.window.domain.windows.dto.request.WindowsUpdateRequestDto;
import com.window.domain.windows.dto.response.WindowsDetailResponseDto;
import com.window.domain.windows.dto.response.WindowsResponseDto;
import com.window.domain.windows.entity.Windows;
import com.window.domain.windows.model.repository.WindowsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class WindowsServiceImpl implements WindowsService {

    private final WindowsRepository windowsRepository;

    @Override
    public Map<String, Object> getWindows(Long placeId) {
        // place 예외처리

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
    public WindowsDetailResponseDto getWindowInfo(Long windowId) {
        Windows window = windowsRepository.findById(windowId)
                .orElseThrow(() -> new NoSuchElementException("창문이 존재하지 않습니다"));

        // 실제로 센서에서 데이터 가져오면 그 데이터를 넣기
        SensorDataDto sensorDataDto = new SensorDataDto(25.0, 30.0, 22.8);

        return WindowsDetailResponseDto.builder()
                .placeName("우리집")
                .windowId(windowId)
                .name(window.getName())
                .sensorData(sensorDataDto).build();
    }

    @Override
    public void registerWindow(WindowsRequestDto dto) {

        Member member = new Member(1L, "jml6534@naver.com", "이재민", false);
        // dto의 placeId로 Place 불러오기
        Place place = new Place(1L, member, "대전광역시 유성구 궁동 486-3", "자취방");
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
        Windows windows = windowsRepository.findById(dto.getWindowId())
                .orElseThrow(() -> new NoSuchElementException("창문이 존재하지 않습니다."));


        windows.updateWindow(dto);

        try{
            windowsRepository.save(windows);
        } catch (Exception e){
            e.printStackTrace();
        }


        // wifi 정보가 바뀌면 wifi 정보를 라즈베리파이에 update

    }

    @Override
    public void deleteWindow(Long windowId) {
        Windows window = windowsRepository.findById(windowId)
                .orElseThrow(() -> new NoSuchElementException("창문이 존재하지 않습니다."));

        windowsRepository.deleteById(windowId);

    }

    @Override
    public void changeToggle(WindowsToggleRequestDto dto) {
        Windows window = windowsRepository.findById(dto.getWindowId())
                .orElseThrow(() -> new NoSuchElementException("창문이 존재하지 않습니다."));
        log.info("isAuto: {}", dto.getIsAuto());
        window.autoUpdateWindow(dto);

        windowsRepository.save(window);
    }

}
