package com.agricompass.repository;

import com.agricompass.entity.CropPostHarvest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface CropPostHarvestRepository extends JpaRepository<CropPostHarvest, Long> {
    Optional<CropPostHarvest> findByCropId(Long cropId);
}
