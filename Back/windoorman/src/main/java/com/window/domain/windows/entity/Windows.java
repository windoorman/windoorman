package com.window.domain.windows.entity;

import com.window.domain.place.entity.Place;
import com.window.domain.windows.dto.request.WindowsToggleRequestDto;
import com.window.domain.windows.dto.request.WindowsUpdateRequestDto;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.ColumnDefault;

@Entity
@Getter
@NoArgsConstructor
public class Windows {


    @Builder
    public Windows(Place place, String name, String raspberryId, boolean isAuto) {
        this.place = place;
        this.name = name;
        this.raspberryId = raspberryId;
        this.isAuto = isAuto;
    }

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

    public void updateWindow(WindowsUpdateRequestDto dto){
        if(dto.getName() != null) this.name = dto.getName();
    }

    public void autoUpdateWindow(WindowsToggleRequestDto dto){
        this.isAuto = dto.getIsAuto();
    }

}
