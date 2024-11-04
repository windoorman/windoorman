package com.window.domain.schedule.model.repository;

import com.window.domain.schedule.entity.Schedule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ScheduleRepository extends JpaRepository<Schedule, Long> {
    Optional<List<Schedule>> findByMember_Id(Long memberId);

    Optional<List<Schedule>> findByScheduleGroup_Id(Long groupId);

}
