package com.window.domain.report.service;

import com.window.domain.member.entity.Member;
import com.window.domain.place.entity.Place;
import com.window.domain.place.repository.PlaceRepository;
import com.window.domain.report.dto.ActionsReportResponseDto;
import com.window.domain.report.dto.AirReportDto;
import com.window.domain.report.dto.ReportResponseDto;
import com.window.domain.report.dto.WindowsDto;
import com.window.domain.report.entity.Report;
import com.window.domain.report.repository.ReportRepository;
import com.window.domain.windowAction.entity.WindowAction;
import com.window.domain.windowAction.repository.WindowActionRepository;
import com.window.domain.windows.entity.Windows;
import com.window.domain.windows.model.repository.WindowsRepository;
import com.window.global.exception.CustomException;
import com.window.global.exception.ExceptionResponse;
import com.window.global.util.MemberInfo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class ReportService {

    private final ReportRepository reportRepository;
    private final PlaceRepository placeRepository;
    private final WindowActionRepository windowActionRepository;
    private final WindowsRepository windowsRepository;

    public ReportResponseDto findAirReport(Long placeId, LocalDate reportDate, Authentication authentication) {
        Member member = MemberInfo.getMemberInfo(authentication);
        log.info("member: {}", member);

        Place place = placeRepository.findByIdAndMember(placeId, member)
                .orElseThrow(()-> new ExceptionResponse(CustomException.NOT_FOUND_PLACE_EXCEPTION));

        Report report = reportRepository.findByPlaceIdAndReportDate(placeId, reportDate)
                .orElseThrow(()-> new ExceptionResponse(CustomException.NOT_FOUND_REPORT_EXCEPTION));

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
                .placeName(place.getName())
                .airReport(airReport)
                .windows(windowsDto)
                .actionsReport(actionsReport)
                .build();
    }

    public List<ActionsReportResponseDto> findActionsReport(Long windowId, LocalDate reportDate, Authentication authentication) {
        Member member = MemberInfo.getMemberInfo(authentication);
        return findWindowActions(windowId, reportDate);
    }

    public List<WindowsDto> findWindows(Long placeId){
        List<Windows> windows = windowsRepository.findAllByPlaceId(placeId)
                .orElseThrow(() -> new ExceptionResponse(CustomException.NOT_FOUND_WINDOWS_EXCEPTION));

        List<WindowsDto> responses = new ArrayList<>();
        for(Windows window : windows){
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
                .orElseThrow(()->new ExceptionResponse(CustomException.NOT_FOUND_REPORT_EXCEPTION));

        List<ActionsReportResponseDto> responses = new ArrayList<>();
        for(WindowAction windowAction : windowActions){
            responses.add(ActionsReportResponseDto.builder()
                    .actionReportId(windowAction.getId())
                    .open(windowAction.getOpen().toString())
                    .openTime(windowAction.getOpenTime())
                    .build());
        }
        return responses;
    }
}
