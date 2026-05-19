package com.agricompass.repository;

import com.agricompass.entity.CropSoilRequirement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface CropSoilRequirementRepository extends JpaRepository<CropSoilRequirement, Long> {
    Optional<CropSoilRequirement> findByCropId(Long cropId);
}
