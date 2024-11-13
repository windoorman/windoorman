package com.window.domain.test;

import co.elastic.clients.elasticsearch._types.aggregations.AggregationBuilders;
import co.elastic.clients.elasticsearch._types.query_dsl.QueryBuilders;
import co.elastic.clients.elasticsearch.core.SearchRequest;
import co.elastic.clients.elasticsearch.core.SearchResponse;
import com.window.domain.windowAction.repository.WindowActionRepository;
import lombok.RequiredArgsConstructor;
import org.hibernate.query.NativeQuery;
import org.springframework.data.domain.Sort;
import org.springframework.data.elasticsearch.client.elc.Aggregation;
import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
import org.springframework.data.elasticsearch.core.SearchHit;
import org.springframework.data.elasticsearch.core.mapping.IndexCoordinates;
import org.springframework.data.elasticsearch.core.query.Criteria;
import org.springframework.data.elasticsearch.core.query.CriteriaQuery;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ElasticService {

    private final ElasticsearchOperations operations;
    private final WindowActionRepository windowActionRepository;

    public List<Elastic> getLogs(Long windowsId, LocalDateTime openTime, Long actionId) {
        // 엘라스틱 서치 조회
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy.MM.dd");
        String formattedDate  = openTime.format(formatter);
        String indexName = "1-1-" + formattedDate;
        String start = openTime.minusHours(1).toString();
        String end = openTime.toString();

        Criteria criteria = new Criteria("@timestamp").between(start, end);
        CriteriaQuery query = new CriteriaQuery(criteria);

        query.addSort(Sort.by(Sort.Order.asc("@timestamp")));

        // 창문 개폐
        


        return operations.search(query, Elastic.class, IndexCoordinates.of(indexName))
                .getSearchHits().stream()
                .map(SearchHit::getContent)
                .collect(Collectors.toList());

    }

}

