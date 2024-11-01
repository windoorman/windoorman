package com.window.domain.schedule.model.repository;

import com.window.domain.schedule.entity.Schedule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ScheduleRepository extends JpaRepository<Schedule, Long> {
    List<Schedule> findByMember_Id(Long memberId);

    List<Schedule> findByScheduleGroup_Id(Long groupId);

}
