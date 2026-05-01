package com.agricompass.repository;

import com.agricompass.entity.CropEconomics;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CropEconomicsRepository extends JpaRepository<CropEconomics, Long> {
    Optional<CropEconomics> findByCropId(Long cropId);
}
