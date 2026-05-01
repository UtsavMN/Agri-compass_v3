package com.agricompass.repository;

import com.agricompass.entity.WeatherLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WeatherLogRepository extends JpaRepository<WeatherLog, String> {
    List<WeatherLog> findByFarmIdOrderByCreatedAtDesc(String farmId);
}
