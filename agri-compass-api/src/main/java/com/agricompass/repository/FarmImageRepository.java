package com.agricompass.repository;

import com.agricompass.entity.FarmImage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FarmImageRepository extends JpaRepository<FarmImage, String> {
    List<FarmImage> findByFarmIdOrderByCreatedAtDesc(String farmId);
}
