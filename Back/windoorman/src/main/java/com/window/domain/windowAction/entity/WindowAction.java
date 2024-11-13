package com.window.domain.windowAction.entity;


import com.window.domain.windows.entity.Windows;
import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;

import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor
public class WindowAction {

    @Builder
    public WindowAction(Windows windows, Open open, LocalDateTime openTime, String reason) {
        this.windows = windows;
        this.open = open;
        this.openTime = openTime;
        this.reason = reason;
    }

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

    @Column(name = "reason", nullable = false, length = 300)
    private String reason;

}
