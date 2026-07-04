package com.agricompass.repository;

import com.agricompass.entity.Crop;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CropRepository extends JpaRepository<Crop, Long> {
    Optional<Crop> findByNameIgnoreCase(String name);

    @org.springframework.data.jpa.repository.Query("SELECT c FROM Crop c WHERE LOWER(c.name) LIKE LOWER(CONCAT('%', :query, '%'))")
    java.util.List<Crop> searchByName(@org.springframework.data.repository.query.Param("query") String query);

    @org.springframework.data.jpa.repository.Query("SELECT c FROM Crop c WHERE c.season = :season")
    java.util.List<Crop> findBySeason(@org.springframework.data.repository.query.Param("season") String season);

    @org.springframework.data.jpa.repository.Query("SELECT c FROM Crop c ORDER BY c.expectedReturns DESC")
    java.util.List<Crop> findHighProfitCrops(org.springframework.data.domain.Pageable pageable);

    @org.springframework.data.jpa.repository.Query("SELECT c FROM Crop c ORDER BY c.waterRequirement ASC")
    java.util.List<Crop> findLowWaterCrops(org.springframework.data.domain.Pageable pageable);

    @org.springframework.data.jpa.repository.Query("SELECT c FROM Crop c WHERE c.district = :district")
    java.util.List<Crop> findByDistrict(@org.springframework.data.repository.query.Param("district") String district);
}
