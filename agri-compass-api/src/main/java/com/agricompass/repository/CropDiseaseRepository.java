package com.agricompass.repository;

import com.agricompass.entity.CropDisease;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CropDiseaseRepository extends JpaRepository<CropDisease, Long> {
    List<CropDisease> findByCropId(Long cropId);
}
