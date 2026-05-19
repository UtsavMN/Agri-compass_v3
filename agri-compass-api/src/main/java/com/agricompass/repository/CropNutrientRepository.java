package com.agricompass.repository;

import com.agricompass.entity.CropNutrient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface CropNutrientRepository extends JpaRepository<CropNutrient, Long> {
    Optional<CropNutrient> findByCropId(Long cropId);
}
