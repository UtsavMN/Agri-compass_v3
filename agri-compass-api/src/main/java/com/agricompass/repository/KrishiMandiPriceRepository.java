package com.agricompass.repository;

import com.agricompass.entity.KrishiMandiPrice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface KrishiMandiPriceRepository extends JpaRepository<KrishiMandiPrice, String> {

    List<KrishiMandiPrice> findByDistrictIgnoreCaseOrderByReportDateDesc(String district);

    List<KrishiMandiPrice> findByCommodityIgnoreCaseOrderByReportDateDesc(String commodity);

    List<KrishiMandiPrice> findByDistrictIgnoreCaseAndCommodityIgnoreCaseOrderByReportDateDesc(String district, String commodity);

    Optional<KrishiMandiPrice> findByMarketIgnoreCaseAndCommodityIgnoreCaseAndVarietyIgnoreCase(
            String market, String commodity, String variety);

    @Query("SELECT p FROM KrishiMandiPrice p ORDER BY p.reportDate DESC")
    List<KrishiMandiPrice> findAllOrderByReportDateDesc();

    @Modifying
    @Query("DELETE FROM KrishiMandiPrice p WHERE p.reportDate < :cutoffDate")
    int deleteByReportDateBefore(@Param("cutoffDate") String cutoffDate);

    @Query("SELECT COUNT(p) FROM KrishiMandiPrice p WHERE p.reportDate < :cutoffDate")
    long countByReportDateBefore(@Param("cutoffDate") String cutoffDate);
}
