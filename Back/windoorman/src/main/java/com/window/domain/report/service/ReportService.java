package com.window.domain.report.service;

import com.window.domain.place.repository.PlaceRepository;
import com.window.domain.report.dto.*;
import com.window.domain.report.entity.Graph;
import com.window.domain.report.entity.Report;
import com.window.domain.report.repository.ReportRepository;
import com.window.domain.windowAction.entity.WindowAction;
import com.window.domain.windowAction.repository.WindowActionRepository;
import com.window.domain.windows.entity.Windows;
import com.window.domain.windows.model.repository.WindowsRepository;
import com.window.global.exception.CustomException;
import com.window.global.exception.ExceptionResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
import org.springframework.data.elasticsearch.core.SearchHit;
import org.springframework.data.elasticsearch.core.mapping.IndexCoordinates;
import org.springframework.data.elasticsearch.core.query.Criteria;
import org.springframework.data.elasticsearch.core.query.CriteriaQuery;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class ReportService {

    private final ReportRepository reportRepository;
    private final PlaceRepository placeRepository;
    private final WindowActionRepository windowActionRepository;
    private final WindowsRepository windowsRepository;
    private final ElasticsearchOperations operations;

    public ReportResponseDto findAirReport(Long placeId, LocalDate reportDate) {
        Report report = reportRepository.findByPlaceIdAndReportDate(placeId, reportDate)
                .orElseThrow(() -> new ExceptionResponse(CustomException.NOT_FOUND_REPORT_EXCEPTION));

        AirReportDto airReport = AirReportDto.builder()
                .reportId(report.getId())
                .lowTemperature(report.getLowTemperature())
                .highTemperature(report.getHighTemperature())
                .humidity(report.getHumidity())
                .airCondition(report.getAirCondition())
                .build();

        List<WindowsDto> windowsDto = findWindows(placeId);

        Long windowId = windowsDto.get(0).windowsId();
        List<ActionsReportResponseDto> actionsReport = findWindowActions(windowId, reportDate);

        return ReportResponseDto.builder()
                .airReport(airReport)
                .windows(windowsDto)
                .actionsReport(actionsReport)
                .build();
    }

    public List<ActionsReportResponseDto> findActionsReport(Long windowId, LocalDate reportDate) {
        return findWindowActions(windowId, reportDate);
    }

    public List<WindowsDto> findWindows(Long placeId) {
        List<Windows> windows = windowsRepository.findAllByPlaceId(placeId)
                .orElseThrow(() -> new ExceptionResponse(CustomException.NOT_FOUND_WINDOWS_EXCEPTION));

        List<WindowsDto> responses = new ArrayList<>();
        for (Windows window : windows) {
            responses.add(WindowsDto.builder()
                    .windowsId(window.getId())
                    .name(window.getName())
                    .build());
        }
        return responses;
    }

    public List<ActionsReportResponseDto> findWindowActions(Long windowId, LocalDate reportDate) {
        LocalDateTime startOfDay = reportDate.atStartOfDay();
        LocalDateTime endOfDay = startOfDay.plusDays(1);
        List<WindowAction> windowActions = windowActionRepository.findByWindowsIdAndDate(windowId, startOfDay, endOfDay)
                .orElseThrow(() -> new ExceptionResponse(CustomException.NOT_FOUND_REPORT_EXCEPTION));

        List<ActionsReportResponseDto> responses = new ArrayList<>();
        for (WindowAction windowAction : windowActions) {
            responses.add(ActionsReportResponseDto.builder()
                    .actionReportId(windowAction.getId())
                    .open(windowAction.getOpen().toString().equals("open") ? "열림" : "닫힘")
                    .openTime(windowAction.getOpenTime())
                    .build());
        }
        return responses;
    }

    public Map<String, Object> getLogs(Long actionId) {
        WindowAction action = windowActionRepository.findById(actionId)
                .orElseThrow(() -> new ExceptionResponse(CustomException.NOT_FOUNT_WINDOWACTION_EXCEPTION));

        Windows windows = windowsRepository.findById(action.getWindows().getId())
                .orElseThrow(() -> new ExceptionResponse(CustomException.NOT_FOUND_WINDOWS_EXCEPTION));


        LocalDateTime openTime = action.getOpenTime();

        boolean isPreviousDate = !openTime.toLocalDate().equals(openTime.minusHours(1).toLocalDate());
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy.MM.dd");

        String formattedDate = openTime.format(formatter);
        String prevFormattedDate = null;
        if (isPreviousDate)
            prevFormattedDate = openTime.minusDays(1).toLocalDate().format(formatter);

        openTime = openTime.minusHours(9);

        // 엘라스틱 서치 조회
        String indexName = windows.getId() + "-" + windows.getPlace().getId() + "-" + formattedDate;
        String preIndexName = windows.getId() + "-" + windows.getPlace().getId() + "-" + prevFormattedDate;
        if (isPreviousDate && operations.indexOps(IndexCoordinates.of(preIndexName)).exists()) {
            indexName += "," + preIndexName;
        }

        log.info("indexName: {}", indexName);


        String start = openTime.minusHours(1).toString();
        String end = openTime.toString();
        log.info("Start: {}", start);
        log.info("end: {}", end);

        Criteria criteria = new Criteria("@timestamp").between(start, end);
        CriteriaQuery query = new CriteriaQuery(criteria);

        query.addSort(Sort.by(Sort.Order.asc("@timestamp")));

        List<Graph> elasticList = new ArrayList<>(operations.search(query, Graph.class, IndexCoordinates.of(indexName))
                .getSearchHits().stream()
                .map(SearchHit::getContent)
                .toList());
        log.info("elasticList: {}", elasticList.size());

        List<GraphResponseDto> dtos = new ArrayList<>();
        for (Graph e : elasticList) {
            GraphResponseDto dto = GraphResponseDto.builder()
                    .pm10(e.getPm10())
                    .pm25(e.getPm25())
                    .humid(e.getHumid())
                    .temp(e.getTemp())
                    .co2(e.getCo2())
                    .tvoc(e.getTvoc())
                    .timestamp(e.getTimestamp())
                    .build();
            dtos.add(dto);
        }

        // 이상센서 넣기
        String[] reasonArray = action.getReason().split(",");
        String reason = reasonArray[0];

        Map<String, Object> responseMap = new HashMap<>();

        responseMap.put("reason", reason.split("_")[0]);
        responseMap.put("data", dtos);

        return responseMap;

    }


}
