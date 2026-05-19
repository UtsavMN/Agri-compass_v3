package com.agricompass.repository;

import com.agricompass.entity.CropYieldInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface CropYieldInfoRepository extends JpaRepository<CropYieldInfo, Long> {
    Optional<CropYieldInfo> findByCropId(Long cropId);
}
