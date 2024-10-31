package com.window.domain.place.entity;

import com.window.domain.member.entity.Member;
import jakarta.persistence.*;
import lombok.Getter;

@Entity
@Getter
public class Place {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id")
    private Member member;

    @Column(name = "place", nullable = false, length = 50)
    private String place;

    @Column(name = "name", nullable = false, length = 100)
    private String name;
}
