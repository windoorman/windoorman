package com.window.domain.windowAction.repository;

import com.window.domain.windowAction.entity.WindowAction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WindowActionRepository extends JpaRepository<WindowAction, Long> {

    Optional<List<WindowAction>> findByWindowsId(Long windowsId);
}
