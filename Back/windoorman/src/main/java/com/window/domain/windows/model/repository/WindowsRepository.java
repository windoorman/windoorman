package com.window.domain.windows.model.repository;

import com.window.domain.windows.entity.Windows;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WindowsRepository extends JpaRepository<Windows, Long> {

    Optional<List<Windows>> findAllByPlaceId(Long placeId);

    Windows findByDeviceId(String deviceId);

    boolean existsByDeviceId(String deviceId);
}
