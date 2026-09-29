package com.agricompass.repository;

import com.agricompass.entity.FarmDiagnostic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FarmDiagnosticRepository extends JpaRepository<FarmDiagnostic, String> {
    List<FarmDiagnostic> findByFarmIdOrderByCreatedAtDesc(String farmId);
}
