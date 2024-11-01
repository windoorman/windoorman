package com.window.domain.schedule.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor
public class ScheduleGroup {

    public ScheduleGroup(LocalDateTime createTime) {
        this.createTime = createTime;
    }

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "create_time", nullable = false, updatable = false)
    private LocalDateTime createTime;

}
