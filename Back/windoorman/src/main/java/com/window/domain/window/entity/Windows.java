package com.window.domain.window.entity;

import com.window.domain.place.entity.Place;
import jakarta.persistence.*;
import org.hibernate.annotations.ColumnDefault;

@Entity
public class Windows {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "place_id")
    private Place place;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "raspberry_id", nullable = false, length = 100)
    private String raspberryId;

    @ColumnDefault("false")
    @Column(name = "is_auto", nullable = false, columnDefinition = "TINYINT(1)")
    private boolean isAuto;

}
