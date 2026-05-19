package com.agricompass.repository;

import com.agricompass.entity.CropIrrigation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CropIrrigationRepository extends JpaRepository<CropIrrigation, Long> {
    List<CropIrrigation> findByCropId(Long cropId);
}
