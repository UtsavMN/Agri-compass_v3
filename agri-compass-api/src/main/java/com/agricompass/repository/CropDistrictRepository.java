package com.agricompass.repository;

import com.agricompass.entity.CropDistrict;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CropDistrictRepository extends JpaRepository<CropDistrict, Long> {
    List<CropDistrict> findByCropId(Long cropId);
    List<CropDistrict> findByDistrictNameIgnoreCase(String districtName);
}
