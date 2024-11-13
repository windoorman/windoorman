package com.window.domain.report.service;

import co.elastic.clients.elasticsearch.ElasticsearchClient;
import co.elastic.clients.elasticsearch._types.aggregations.*;
import co.elastic.clients.elasticsearch.core.SearchRequest;
import co.elastic.clients.elasticsearch.core.SearchResponse;
import com.window.domain.place.entity.Place;
import com.window.domain.place.repository.PlaceRepository;
import com.window.domain.report.entity.Report;
import com.window.domain.report.repository.ReportRepository;
import com.window.global.exception.CustomException;
import com.window.global.exception.ExceptionResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Map;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
@Slf4j
public class ElasticReportService {

    private final ElasticsearchClient elasticsearchClient;
    private final PlaceRepository placeRepository;
    private final ReportRepository reportRepository;

    @Transactional
    public void saveDailyAirReport() throws IOException {
        LocalDate localDate = LocalDate.now().minusDays(1);
        String date = localDate.format(DateTimeFormatter.ofPattern("yyyy.MM.dd"));
        String indexPattern = "*-" + date;

        SearchRequest searchRequest = new SearchRequest.Builder()
                .index(indexPattern)
                .aggregations("byPlaceIdAgg",
                        Aggregation.of(a -> a.terms(t -> t.field("placeId"))
                                .aggregations("maxTemp", Aggregation.of(max -> max.max(m -> m.field("temp"))))
                                .aggregations("minTemp", Aggregation.of(min -> min.min(m -> m.field("temp"))))
                                .aggregations("avgHumid", Aggregation.of(avg -> avg.avg(h -> h.field("humid"))))
                                .aggregations("avgPm10", Aggregation.of(avg -> avg.avg(p -> p.field("pm10"))))
                        )
                )
                .build();

        SearchResponse<Map> response = elasticsearchClient.search(searchRequest, Map.class);
        Aggregate byPlaceIdAgg = response.aggregations().get("byPlaceIdAgg");

        if(!byPlaceIdAgg.isLterms()){
            throw new ExceptionResponse(CustomException.NOT_EXISTS_DATA_EXCEPTION);
        }

        LongTermsAggregate byPlaceIdTerms = byPlaceIdAgg.lterms();
        for (LongTermsBucket bucket : byPlaceIdTerms.buckets().array()) {
            Long byPlaceId = bucket.key();
            float maxTemp = (float) bucket.aggregations().get("maxTemp").max().value();
            float minTemp = (float) bucket.aggregations().get("minTemp").min().value();
            float avgHumid = (float) bucket.aggregations().get("avgHumid").avg().value();
            float avgPm10 = (float) bucket.aggregations().get("avgPm10").avg().value();

            log.info("byPlaceId: {}, MaxTemp: {}, MinTemp: {}, AvgHumid: {}, AvgPm10: {}", byPlaceId, maxTemp, minTemp, avgHumid, avgPm10);

            Place place = placeRepository.findById(byPlaceId)
                    .orElseThrow(() -> new ExceptionResponse(CustomException.NOT_FOUND_PLACE_EXCEPTION));

            Report report = Report.builder()
                    .place(place)
                    .highTemperature(maxTemp)
                    .lowTemperature(minTemp)
                    .humidity(avgHumid)
                    .airCondition(avgPm10)
                    .reportDate(localDate)
                    .build();
            reportRepository.save(report);
        }
    }
}
