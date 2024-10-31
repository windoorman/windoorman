package com.window.domain.report.entity;

import com.window.domain.place.entity.Place;
import jakarta.persistence.*;
import lombok.Getter;
import org.springframework.data.annotation.CreatedDate;

import java.time.LocalDate;

@Entity
@Getter
public class Report {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "place_id")
    private Place place;

    @Column(name = "low_temperature", nullable = false)
    private double lowTemperature;

    @Column(name = "high_temperature", nullable = false)
    private double highTemperature;

    @Column(name = "humidity", nullable = false)
    private double humidity;

    @Column(name = "air_condition", nullable = false)
    private double airCondition;

    @CreatedDate
    @Column(name = "report_date", nullable = false, updatable = false)
    private LocalDate reportDate;
}
