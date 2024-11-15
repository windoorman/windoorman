package com.window.domain.windows.model.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
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
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
@RequiredArgsConstructor
public class WindowsService {



    private final RedisTemplate<String, Object> redisTemplate;
    private final WindowsRepository windowsRepository;
    private final PlaceRepository placeRepository;
    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    @Value("${smartthings.secret}")
    private String smartThingsSecret;

    @Value("${spring.redis.set.key}")
    private String redisSetKey;


    public Map<String, Object> getWindows(Long placeId) {
        Place place = placeRepository.findById(placeId).
                orElseThrow(() -> new ExceptionResponse(CustomException.NOT_FOUND_PLACE_EXCEPTION));

        List<Windows> windows = windowsRepository.findAllByPlaceId(placeId)
                .orElseThrow(() -> new ExceptionResponse(CustomException.NOT_FOUND_WINDOWS_EXCEPTION));
        List<WindowsResponseDto> dtoList = new ArrayList<>();

        for (Windows window : windows) {
            String deviceId = window.getDeviceId();
            String state = "";
            String json = webClient.get()
                    .uri("/" + deviceId + "/status") // API의 경로
                    .header("Content-Type", "application/json")
                    .headers(headers -> headers.setBearerAuth(smartThingsSecret))
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();// 응답을 처리하지 않음 (응답 본문을 무시)

            try {
                JsonNode jsonNode = new ObjectMapper().readTree(json);
                state = jsonNode.at("/components/main/windowShade/windowShade/value").asText();
                if (state.contains("open")) {
                    state = "open";
                } else if (state.contains("close")) {
                    state = "close";
                }

            } catch (JsonProcessingException e) {
                e.printStackTrace();
            }

            dtoList.add(WindowsResponseDto.createResponseDto(window, state));

        }
        Map<String, Object> map = new HashMap<>();
        map.put("placeName", place.getName());
        map.put("windows", dtoList);


        return map;
    }

    public WindowsDetailResponseDto getWindowInfo(Long windowsId) {
        Windows window = windowsRepository.findById(windowsId)
                .orElseThrow(() -> new ExceptionResponse(CustomException.NOT_FOUND_WINDOWS_EXCEPTION));

        // 레디스에서 불러온 마지막 센서 데이터 응답
        String redisKey = "lastSensorData:" + windowsId;
        Object cachedResult = redisTemplate.opsForValue().get(redisKey);


        SensorDataDto sensorDataDto;

        if (cachedResult instanceof SensorDataDto) {
            sensorDataDto = (SensorDataDto) cachedResult;
        } else {
            sensorDataDto = new SensorDataDto(null, null, null, null, null, null, null);
        }

        return WindowsDetailResponseDto.builder()
                .placeName(window.getPlace().getName())
                .windowsId(windowsId)
                .name(window.getName())
                .sensorData(sensorDataDto).build();
    }

    public Long registerWindow(WindowsRequestDto dto, Authentication authentication) {

        Place place = placeRepository.findById(dto.getPlaceId())
                .orElseThrow(() -> new ExceptionResponse(CustomException.NOT_FOUND_PLACE_EXCEPTION));

        // 이미 등록된 디바이스인지 체킹
        Windows window = windowsRepository.findByDeviceId(dto.getDeviceId());
        if(window != null) {
            throw new ExceptionResponse(CustomException.DUPLICATE_DEVICEID_EXCEPTION);
        }

        Windows windows = Windows.builder()
                .place(place)
                .name(dto.getName())
                .deviceId(dto.getDeviceId())
                .build();

        return windowsRepository.save(windows).getId();



    }

    public void updateWindow(WindowsUpdateRequestDto dto) {
        Windows windows = windowsRepository.findById(dto.getWindowsId())
                .orElseThrow(() -> new ExceptionResponse(CustomException.NOT_FOUND_WINDOWS_EXCEPTION));

        // 이미 등록된 디바이스인지 체킹
        Windows window = windowsRepository.findByDeviceId(dto.getDeviceId());
        if(window != null) {
            throw new ExceptionResponse(CustomException.DUPLICATE_DEVICEID_EXCEPTION);
        }

        windows.updateWindow(dto);

        windowsRepository.save(windows);

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

    public List<Map<String, Object>> getDevices(){
        return webClient.get()
                .header("Content-Type", "application/json")
                .headers(headers -> headers.setBearerAuth(smartThingsSecret))
                .retrieve()
                .bodyToMono(String.class)
                .map(this::paresData)
                .block();

    }

    private List<Map<String, Object>> paresData(String json) {
        List<Map<String, Object>> parseList = new ArrayList<>();

        try{
            JsonNode root = objectMapper.readTree(json);
            JsonNode items = root.path("items");

            for(JsonNode item : items) {
                Map<String, Object> map = new HashMap<>();
                String deviceId = item.path("deviceId").asText();

                map.put("deviceId", item.path("deviceId").asText());
                map.put("label", item.path("label").asText());

                boolean isRegistered = windowsRepository.existsByDeviceId(deviceId);
                map.put("isRegistered", isRegistered);

                parseList.add(map);
            }
        } catch (Exception e){
            e.printStackTrace();
        }

        return parseList;
    }

    public String open(Long windowsId, boolean python){
        if(python){
            Windows windows = windowsRepository.findById(windowsId)
                    .orElseThrow(() -> new ExceptionResponse(CustomException.NOT_FOUND_WINDOWS_EXCEPTION));
            if(checkActiveSchedule(windowsId)) return null;
            if(!windows.isAuto()) return null;
        }

        String jsonData = """
        {
            "commands": [
                {
                    "component": "main",
                    "capability": "windowShade",
                    "command": "open"
                }
            ]
        }
        """;
        String deviceId = getDeviceId(windowsId);
        String data = webClient.post()
                .uri("/" + deviceId + "/commands") // API의 경로
                .header("Content-Type", "application/json")
                .headers(headers -> headers.setBearerAuth(smartThingsSecret))
                .bodyValue(jsonData)  // JSON 데이터 설정
                .retrieve()
                .bodyToMono(String.class)
                .block();// 응답을 처리하지 않음 (응답 본문을 무시)

        dataSubscribe(data);
        return data;
    }

    public String close(Long windowsId, boolean python){
        if(python){
            Windows windows = windowsRepository.findById(windowsId)
                    .orElseThrow(() -> new ExceptionResponse(CustomException.NOT_FOUND_WINDOWS_EXCEPTION));
            if(!windows.isAuto()) return null;
            if(checkActiveSchedule(windowsId)) return null;
        }
        String jsonData = """
        {
            "commands": [
                {
                    "component": "main",
                    "capability": "windowShade",
                    "command": "close"
                }
            ]
        }
        """;
        String deviceId = getDeviceId(windowsId);
        String data = webClient.post()
                .uri("/" + deviceId + "/commands") // API의 경로
                .header("Content-Type", "application/json")
                .headers(headers -> headers.setBearerAuth(smartThingsSecret))
                .bodyValue(jsonData)  // JSON 데이터 설정
                .retrieve()
                .bodyToMono(String.class)  // 응답을 처리하지 않음 (응답 본문을 무시)
                .block();
        dataSubscribe(data);
        return data;
    }

    public void dataSubscribe(String data){
        log.info("open command: {}", data);
    }

    public String getDeviceId(Long windowsId){
        return windowsRepository.findById(windowsId)
                .orElseThrow(() -> new ExceptionResponse(CustomException.NOT_FOUND_WINDOWS_EXCEPTION))
                .getDeviceId();
    }

    // 스케줄에 의해 창문이 열려있는지 판단
    public boolean checkActiveSchedule(Long windowsId) {
        return Boolean.TRUE.equals(redisTemplate.opsForSet().isMember(redisSetKey, String.valueOf(windowsId)));
    }

}
