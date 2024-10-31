package com.window.domain.windows.model.repository;

import com.window.domain.windows.entity.Windows;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WindowsRepository extends JpaRepository<Windows, Long> {

    List<Windows> findAllByPlaceId(Long placeId);

    Windows findByRaspberryId(String raspberryId);
}
