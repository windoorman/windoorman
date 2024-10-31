package com.window.domain.member.entity;

import jakarta.persistence.*;
import lombok.Getter;
import org.hibernate.annotations.ColumnDefault;

@Entity
@Getter
public class Member {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @Column(name = "email", nullable = false, length = 50)
    private String email;

    @Column(name = "nickname", nullable = false,  length = 100)
    private String nickname;

    @ColumnDefault("false")
    @Column(name = "is_delete", nullable = false, columnDefinition = "TINYINT(1)")
    private boolean isDelete;

}
