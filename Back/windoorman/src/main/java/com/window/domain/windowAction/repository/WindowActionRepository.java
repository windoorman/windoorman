package com.window.domain.windowAction.repository;

import com.window.domain.windowAction.entity.WindowAction;
import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface WindowActionRepository extends JpaRepository<WindowAction, Long> {

    @Query("SELECT wa " +
            "FROM WindowAction wa " +
            "WHERE wa.windows.id = :windowsId " +
            "AND wa.openTime >= :startOfDay " +
            "AND wa.openTime < :endOfDay")
    Optional<List<WindowAction>> findByWindowsIdAndDate(
            @Param("windowsId") Long windowsId,
            @Param("startOfDay") LocalDateTime startOfDay,
            @Param("endOfDay") LocalDateTime endOfDay);

    @Query("SELECT COUNT(wa) " +
            "FROM WindowAction wa " +
            "INNER JOIN wa.windows w " +
            "WHERE w.place.id = :placeId " +
            "AND wa.openTime >= :startOfDay " +
            "AND wa.openTime < :endOfDay")
    Long countByCountAction(
            @Param("placeId") Long placeId,
            @Param("startOfDay") LocalDateTime startOfDay,
            @Param("endOfDay") LocalDateTime endOfDay
    );

}