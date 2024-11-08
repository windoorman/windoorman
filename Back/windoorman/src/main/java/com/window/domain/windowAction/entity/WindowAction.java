package com.window.domain.windowAction.entity;


import com.window.domain.windows.entity.Windows;
import jakarta.persistence.*;
import lombok.Getter;
import org.springframework.data.annotation.CreatedDate;

import java.time.LocalDateTime;

@Entity
@Getter
public class WindowAction {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "windows_id")
    private Windows windows;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Open open;

    @Column(name = "open_time", nullable = false, updatable = false)
    @CreatedDate
    private LocalDateTime openTime;

}
