package com.window.domain.report.service;

import com.window.domain.member.entity.Member;
import com.window.domain.place.repository.PlaceRepository;
import com.window.domain.report.dto.ActionsReportResponseDto;
import com.window.domain.report.dto.AirReportResponseDto;
import com.window.domain.report.entity.Report;
import com.window.domain.report.repository.ReportRepository;
import com.window.domain.windowAction.entity.WindowAction;
import com.window.domain.windowAction.repository.WindowActionRepository;
import com.window.global.exception.CustomException;
import com.window.global.exception.ExceptionResponse;
import com.window.global.util.MemberInfo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
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

    public AirReportResponseDto findAirReport(Long placeId, LocalDate reportDate, Authentication authentication) {
        Member member = MemberInfo.getMemberInfo(authentication);
        log.info("member: {}", member);
        if(!placeRepository.existsByIdAndMember(placeId, member)){
            throw new ExceptionResponse(CustomException.NOT_FOUND_PLACE_EXCEPTION);
        }

        Report report = reportRepository.findByPlaceIdAndReportDate(placeId, reportDate)
                .orElseThrow(()-> new ExceptionResponse(CustomException.NOT_FOUND_REPORT_EXCEPTION));

        return AirReportResponseDto.builder()
                .reportId(report.getId())
                .lowTemperature(report.getLowTemperature())
                .highTemperature(report.getHighTemperature())
                .humidity(report.getHumidity())
                .airCondition(report.getAirCondition())
                .build();
    }

    public List<ActionsReportResponseDto> findActionsReport(Long windowId, Authentication authentication) {
        Member member = MemberInfo.getMemberInfo(authentication);

        List<WindowAction> windowActions = windowActionRepository.findByWindowsId(windowId)
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
