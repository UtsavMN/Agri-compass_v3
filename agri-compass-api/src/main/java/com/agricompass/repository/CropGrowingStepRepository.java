package com.agricompass.repository;

import com.agricompass.entity.CropGrowingStep;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CropGrowingStepRepository extends JpaRepository<CropGrowingStep, Long> {
    List<CropGrowingStep> findByCropId(Long cropId);
}
