package com.window.domain.schedule.entity;

import com.window.domain.member.entity.Member;
import com.window.domain.window.entity.Windows;
import jakarta.persistence.*;
import lombok.Getter;
import org.hibernate.annotations.ColumnDefault;

import java.time.LocalTime;

@Entity
@Getter
public class Schedule {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "windows_id")
    private Windows windows;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id")
    private Member member;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;
    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Day day;

    @ColumnDefault("false")
    @Column(name = "is_activate", nullable = false, columnDefinition = "TINYINT(1)")
    private boolean isActivate;

}
