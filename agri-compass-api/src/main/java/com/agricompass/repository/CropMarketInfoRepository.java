package com.agricompass.repository;

import com.agricompass.entity.CropMarketInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface CropMarketInfoRepository extends JpaRepository<CropMarketInfo, Long> {
    Optional<CropMarketInfo> findByCropId(Long cropId);
}
