package com.agricompass.repository;

import com.agricompass.entity.FertilizerAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FertilizerAnalysisRepository extends JpaRepository<FertilizerAnalysis, String> {
    List<FertilizerAnalysis> findByFarmIdOrderByCreatedAtDesc(String farmId);
}
