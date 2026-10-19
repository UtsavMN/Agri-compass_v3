package com.agricompass.service;

import com.agricompass.entity.KrishiMandiPrice;
import com.agricompass.repository.KrishiMandiPriceRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeParseException;
import java.util.*;

@Service
public class KrishiMandiService {

    private static final Logger log = LoggerFactory.getLogger(KrishiMandiService.class);
    private static final ZoneId KOLKATA_ZONE = ZoneId.of("Asia/Kolkata");

    private final KrishiMandiPriceRepository repository;

    public KrishiMandiService(KrishiMandiPriceRepository repository) {
        this.repository = repository;
    }

    /**
     * Atomically validates, normalizes, and upserts a snapshot of market prices.
     * Preserves existing snapshot if input is invalid or transaction rolls back.
     */
    @Transactional
    public Map<String, Object> ingestSnapshot(List<Map<String, Object>> rawRecords) {
        if (rawRecords == null || rawRecords.isEmpty()) {
            throw new IllegalArgumentException("Cannot ingest an empty or null snapshot payload.");
        }

        LocalDate today = LocalDate.now(KOLKATA_ZONE);
        List<KrishiMandiPrice> validEntities = new ArrayList<>();
        List<String> rejectionReasons = new ArrayList<>();

        for (int i = 0; i < rawRecords.size(); i++) {
            Map<String, Object> r = rawRecords.get(i);
            try {
                // 1. Mandatory field checks
                String market = getString(r, "market");
                String commodity = getString(r, "commodity");
                String reportDateStr = getString(r, "reportDate", "report_date", "date");

                if (market == null || market.isBlank()) {
                    rejectionReasons.add("Row " + i + ": Missing market name");
                    continue;
                }
                if (commodity == null || commodity.isBlank()) {
                    rejectionReasons.add("Row " + i + ": Missing commodity name");
                    continue;
                }
                if (reportDateStr == null || reportDateStr.isBlank()) {
                    rejectionReasons.add("Row " + i + ": Missing report date");
                    continue;
                }

                // 2. Strict Date Parsing
                LocalDate reportDate;
                try {
                    reportDate = LocalDate.parse(reportDateStr.trim());
                } catch (DateTimeParseException e) {
                    rejectionReasons.add("Row " + i + ": Invalid date format '" + reportDateStr + "', expected YYYY-MM-DD");
                    continue;
                }

                if (reportDate.isAfter(today.plusDays(1))) {
                    rejectionReasons.add("Row " + i + ": Report date is in the future (" + reportDate + ")");
                    continue;
                }

                // 3. Price Validation
                Double minPrice = getDouble(r, "minPrice", "min_price", "min");
                Double maxPrice = getDouble(r, "maxPrice", "max_price", "max");
                Double modalPrice = getDouble(r, "modalPrice", "modal_price", "modal");

                if (minPrice == null || maxPrice == null || modalPrice == null) {
                    rejectionReasons.add("Row " + i + ": Missing price values");
                    continue;
                }
                if (minPrice < 0 || maxPrice < 0 || modalPrice < 0) {
                    rejectionReasons.add("Row " + i + ": Negative price values");
                    continue;
                }
                if (minPrice > maxPrice) {
                    rejectionReasons.add("Row " + i + ": minPrice (" + minPrice + ") > maxPrice (" + maxPrice + ")");
                    continue;
                }
                if (modalPrice < minPrice || modalPrice > maxPrice) {
                    rejectionReasons.add("Row " + i + ": modalPrice (" + modalPrice + ") outside [" + minPrice + ", " + maxPrice + "]");
                    continue;
                }

                // 4. Construct entity
                String variety = getString(r, "variety");
                variety = (variety != null && !variety.isBlank()) ? variety.trim().toUpperCase() : "COMMON";

                String district = getString(r, "district");
                district = (district != null && !district.isBlank()) ? district.trim() : "Karnataka";

                String grade = getString(r, "grade");
                grade = (grade != null && !grade.isBlank()) ? grade.trim().toUpperCase() : "STANDARD";

                Double arrivals = getDouble(r, "arrivalQuantity", "arrival_quantity", "arrivals");
                String arrivalUnit = getString(r, "arrivalUnit", "arrival_unit", "unit");
                String priceUnit = getString(r, "priceUnit", "price_unit");

                // Check for existing record to replace or update safely
                Optional<KrishiMandiPrice> existingOpt = repository.findByMarketIgnoreCaseAndCommodityIgnoreCaseAndVarietyIgnoreCaseAndGradeIgnoreCase(
                        market.trim(), commodity.trim(), variety, grade
                );

                KrishiMandiPrice entity = existingOpt.orElseGet(KrishiMandiPrice::new);

                // If existing record has newer date, do NOT overwrite with older report
                if (entity.getReportDate() != null) {
                    LocalDate existingDate = LocalDate.parse(entity.getReportDate());
                    if (existingDate.isAfter(reportDate)) {
                        continue; // Keep existing newer report
                    }
                }

                entity.setSource("KRISHI_MARATA_VAHINI");
                entity.setMarket(market.trim());
                entity.setCommodity(commodity.trim());
                entity.setVariety(variety);
                entity.setDistrict(district);
                entity.setReportDate(reportDate.toString());
                entity.setMinPrice(minPrice);
                entity.setMaxPrice(maxPrice);
                entity.setModalPrice(modalPrice);
                entity.setGrade(grade);
                if (arrivals != null) entity.setArrivalQuantity(arrivals);
                if (arrivalUnit != null && !arrivalUnit.isBlank()) entity.setArrivalUnit(arrivalUnit.trim());
                if (priceUnit != null && !priceUnit.isBlank()) entity.setPriceUnit(priceUnit.trim());

                validEntities.add(entity);

            } catch (Exception e) {
                rejectionReasons.add("Row " + i + ": " + e.getMessage());
            }
        }

        if (validEntities.isEmpty()) {
            throw new IllegalStateException("Snapshot rejected: 0 valid records found out of " + rawRecords.size() + " incoming entries.");
        }

        List<KrishiMandiPrice> saved = repository.saveAll(validEntities);
        log.info("Successfully ingested {} Krishi Marata Vahini records. Rejected {} rows.", saved.size(), rejectionReasons.size());

        Map<String, Object> result = new HashMap<>();
        result.put("status", "SUCCESS");
        result.put("ingestedCount", saved.size());
        result.put("rejectedCount", rejectionReasons.size());
        result.put("rejectionSamples", rejectionReasons.stream().limit(10).toList());
        return result;
    }

    /**
     * Purges records where CURRENT_DATE - report_date >= 30 days.
     * Scheduled to execute daily at 02:00 AM IST.
     */
    @Scheduled(cron = "0 0 2 * * ?", zone = "Asia/Kolkata")
    @Transactional
    public int purgeExpiredRecords() {
        return purgeExpiredRecords(30);
    }

    @Transactional
    public int purgeExpiredRecords(int expiryDays) {
        LocalDate cutoffDate = LocalDate.now(KOLKATA_ZONE).minusDays(expiryDays);
        int deleted = repository.deleteByReportDateBefore(cutoffDate.toString());
        log.info("Purged {} expired Krishi Marata Vahini records older than {} (cutoff: {} days)", deleted, cutoffDate, expiryDays);
        return deleted;
    }

    @Transactional(readOnly = true)
    public List<KrishiMandiPrice> getPricesByDistrict(String district) {
        if (district == null || district.isBlank() || "all".equalsIgnoreCase(district.trim())) {
            return repository.findAllOrderByReportDateDesc();
        }
        return repository.findByDistrictIgnoreCaseOrderByReportDateDesc(district.trim());
    }

    @Transactional(readOnly = true)
    public List<KrishiMandiPrice> getPricesByCommodity(String commodity) {
        if (commodity == null || commodity.isBlank()) {
            return repository.findAllOrderByReportDateDesc();
        }
        return repository.findByCommodityIgnoreCaseOrderByReportDateDesc(commodity.trim());
    }

    @Transactional(readOnly = true)
    public List<KrishiMandiPrice> getPrices(String district, String commodity) {
        boolean hasDistrict = district != null && !district.isBlank() && !"all".equalsIgnoreCase(district.trim());
        boolean hasCommodity = commodity != null && !commodity.isBlank() && !"all".equalsIgnoreCase(commodity.trim());

        if (hasDistrict && hasCommodity) {
            return repository.findByDistrictIgnoreCaseAndCommodityIgnoreCaseOrderByReportDateDesc(district.trim(), commodity.trim());
        } else if (hasDistrict) {
            return repository.findByDistrictIgnoreCaseOrderByReportDateDesc(district.trim());
        } else if (hasCommodity) {
            return repository.findByCommodityIgnoreCaseOrderByReportDateDesc(commodity.trim());
        }
        return repository.findAllOrderByReportDateDesc();
    }

    private String getString(Map<String, Object> map, String... keys) {
        for (String k : keys) {
            if (map.containsKey(k) && map.get(k) != null) {
                return String.valueOf(map.get(k));
            }
        }
        return null;
    }

    private Double getDouble(Map<String, Object> map, String... keys) {
        for (String k : keys) {
            if (map.containsKey(k) && map.get(k) != null) {
                try {
                    return Double.parseDouble(String.valueOf(map.get(k)));
                } catch (NumberFormatException ignored) {}
            }
        }
        return null;
    }
}
