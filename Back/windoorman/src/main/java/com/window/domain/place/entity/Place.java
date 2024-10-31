package com.window.domain.place.entity;

import com.window.domain.member.entity.Member;
import com.window.domain.place.dto.PlaceDto;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Entity
@Getter @Builder
@RequiredArgsConstructor
@AllArgsConstructor
public class Place {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id")
    private Member member;

    @Column(name = "address", nullable = false, length = 50)
    private String address;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    public void updatePlace(PlaceDto placeDto) {
        if(placeDto.getAddress() != null) this.address = placeDto.getAddress();
        if(placeDto.getName() != null) this.name = placeDto.getName();
    }
}
