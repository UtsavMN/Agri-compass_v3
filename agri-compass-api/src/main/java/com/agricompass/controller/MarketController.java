package com.agricompass.controller;

import com.agricompass.entity.KrishiMandiPrice;
import com.agricompass.service.KrishiMandiService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@RestController
@RequestMapping("/api/market")
@CrossOrigin(origins = "*")
@Slf4j
public class MarketController {

    @Value("${kmv.ingest.key:internal_dev_secret_key}")
    private String ingestKey;

    @Value("${data.gov.in.api.key:default}")
    private String dataGovApiKey;

    private final RestTemplate restTemplate;
    private final KrishiMandiService krishiMandiService;

    public MarketController(RestTemplate restTemplate) {
        this(restTemplate, null);
    }

    @Autowired
    public MarketController(RestTemplate restTemplate, @Autowired(required = false) KrishiMandiService krishiMandiService) {
        this.restTemplate = restTemplate;
        this.krishiMandiService = krishiMandiService;
    }

    public ResponseEntity<?> getMarketPrices(String district, int limit) {
        return getMarketPrices(district, null, null, null, 1, limit);
    }

    @GetMapping("/prices")
    public ResponseEntity<?> getMarketPrices(
            @RequestParam(required = false) String district,
            @RequestParam(required = false) String commodity,
            @RequestParam(required = false) String market,
            @RequestParam(required = false) String reportDate,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "500") int limit) {

        String effDistrict = (district != null && !district.isBlank() && !"all".equalsIgnoreCase(district.trim()))
                ? district.trim() : null;
        String effCommodity = (commodity != null && !commodity.isBlank() && !"all".equalsIgnoreCase(commodity.trim()))
                ? commodity.trim() : null;
        String effMarket = (market != null && !market.isBlank() && !"all".equalsIgnoreCase(market.trim()))
                ? market.trim() : null;
        String effDate = (reportDate != null && !reportDate.isBlank() && !"all".equalsIgnoreCase(reportDate.trim()))
                ? reportDate.trim() : null;

        // 1. Fetch from verified Krishi Marata Vahini store
        if (krishiMandiService != null) {
            List<KrishiMandiPrice> list;
            if (effMarket != null || effDate != null) {
                list = krishiMandiService.getPrices(effDistrict, effCommodity, effMarket, effDate);
            } else {
                list = krishiMandiService.getPrices(effDistrict, effCommodity);
            }

            if (list != null && !list.isEmpty()) {
                int totalMatches = list.size();
                int safePage = Math.max(1, page);
                int fromIndex = Math.min((safePage - 1) * limit, totalMatches);
                int toIndex = Math.min(fromIndex + limit, totalMatches);

                var pagedList = list.subList(fromIndex, toIndex);

                var mapped = pagedList.stream().map(p -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("id", p.getId());
                    m.put("commodity", p.getCommodity());
                    m.put("market", p.getMarket());
                    m.put("district", p.getDistrict());
                    m.put("variety", p.getVariety());
                    m.put("grade", p.getGrade());
                    m.put("minPrice", p.getMinPrice());
                    m.put("maxPrice", p.getMaxPrice());
                    m.put("modalPrice", p.getModalPrice());
                    m.put("arrivalQuantity", p.getArrivalQuantity());
                    m.put("arrivalUnit", p.getArrivalUnit());
                    m.put("priceUnit", p.getPriceUnit());
                    m.put("date", p.getReportDate());
                    m.put("source", p.getSource());
                    return m;
                }).toList();

                Map<String, Object> response = new LinkedHashMap<>();
                response.put("prices", mapped);
                response.put("district", district != null ? district : "All Districts");
                response.put("commodity", commodity != null ? commodity : "All Commodities");
                response.put("totalCount", totalMatches);
                response.put("page", safePage);
                response.put("pageSize", limit);
                response.put("count", mapped.size());
                response.put("fetchedAt", java.time.Instant.now().toString());
                response.put("source", "KRISHI_MARATA_VAHINI");
                return ResponseEntity.ok(response);
            }
        }

        // Fallback for Data.gov.in (if testing or if KMV store is unseeded)
        String fallbackDistrict = district != null ? district : "All Districts";
        if (dataGovApiKey == null || dataGovApiKey.equals("default") || dataGovApiKey.trim().isEmpty() || dataGovApiKey.contains("your-")) {
            return ResponseEntity.ok(Map.of(
                "prices", List.of(),
                "district", fallbackDistrict,
                "commodity", commodity != null ? commodity : "All Commodities",
                "totalCount", 0,
                "page", page,
                "pageSize", limit,
                "count", 0,
                "fetchedAt", java.time.Instant.now().toString(),
                "source", "DATA_GOV_IN",
                "message", "Market API key not configured"
            ));
        }

        Map<String, String> districtMap = Map.of(
            "Shivamogga", "Shimoga",
            "Bengaluru Urban", "Bangalore",
            "Bengaluru Rural", "Bangalore Rural",
            "Belagavi", "Belgaum",
            "Kalaburagi", "Gulbarga",
            "Vijayapura", "Bijapur",
            "Ballari", "Bellary",
            "Chikkamagaluru", "Chikmagalur",
            "Dakshina Kannada", "Dakshina Kannada"
        );

        String apiDistrict = districtMap.getOrDefault(district, district);
        List<Map<String, Object>> allParsedPrices = new ArrayList<>();

        if (restTemplate != null) {
            String url = "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070" +
                    "?api-key=" + dataGovApiKey +
                    "&format=json" +
                    "&limit=" + limit +
                    "&filters[state]=Karnataka" +
                    "&filters[district]=" + apiDistrict;

            try {
                @SuppressWarnings("unchecked")
                Map<String, Object> resp = restTemplate.getForObject(url, Map.class);
                if (resp != null && resp.containsKey("records")) {
                    @SuppressWarnings("unchecked")
                    List<Map<String, Object>> records = (List<Map<String, Object>>) resp.get("records");
                    for (Map<String, Object> record : records) {
                        Map<String, Object> price = new LinkedHashMap<>();
                        price.put("commodity", record.get("commodity"));
                        price.put("market", record.get("market"));
                        price.put("district", record.get("district"));
                        try {
                            price.put("minPrice", Double.parseDouble(String.valueOf(record.get("min_price"))));
                            price.put("maxPrice", Double.parseDouble(String.valueOf(record.get("max_price"))));
                            price.put("modalPrice", Double.parseDouble(String.valueOf(record.get("modal_price"))));
                        } catch (Exception e) {
                            price.put("minPrice", 0.0);
                            price.put("maxPrice", 0.0);
                            price.put("modalPrice", 0.0);
                        }
                        price.put("date", record.get("arrival_date"));
                        allParsedPrices.add(price);
                    }
                }
            } catch (Exception e) {
                log.error("Failed to fetch market prices from data.gov.in: {}", e.getMessage());
            }
        }

        return ResponseEntity.ok(Map.of(
            "prices", allParsedPrices,
            "district", fallbackDistrict,
            "commodity", commodity != null ? commodity : "All Commodities",
            "totalCount", allParsedPrices.size(),
            "page", page,
            "pageSize", limit,
            "count", allParsedPrices.size(),
            "fetchedAt", java.time.Instant.now().toString(),
            "source", "DATA_GOV_IN"
        ));
    }

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getSummary() {
        if (krishiMandiService != null) {
            try {
                var sum = krishiMandiService.getSummary();
                if (sum != null && ((Number) sum.getOrDefault("totalRecords", 0)).intValue() > 0) {
                    return ResponseEntity.ok(sum);
                }
            } catch (Exception ignored) {}

            try {
                var allPrices = krishiMandiService.getPrices(null, null);
                if (allPrices != null && !allPrices.isEmpty()) {
                    long mandiCount = allPrices.stream().map(KrishiMandiPrice::getMarket).distinct().count();
                    long commCount = allPrices.stream().map(KrishiMandiPrice::getCommodity).distinct().count();
                    long districtCount = allPrices.stream().map(KrishiMandiPrice::getDistrict).distinct().count();
                    double avgModal = allPrices.stream().mapToDouble(KrishiMandiPrice::getModalPrice).average().orElse(0.0);
                    String latestDate = allPrices.stream().map(KrishiMandiPrice::getReportDate).max(String::compareTo).orElse("");

                    return ResponseEntity.ok(Map.of(
                        "totalMandis", mandiCount,
                        "totalCommodities", commCount,
                        "totalDistricts", districtCount,
                        "totalRecords", allPrices.size(),
                        "avgModalPrice", Math.round(avgModal * 100.0) / 100.0,
                        "latestReportDate", latestDate,
                        "source", "KRISHI_MARATA_VAHINI"
                    ));
                }
            } catch (Exception ignored) {}
        }
        return ResponseEntity.ok(Map.of(
            "totalMandis", 0,
            "totalCommodities", 0,
            "totalDistricts", 0,
            "totalRecords", 0,
            "avgModalPrice", 0.0,
            "latestReportDate", "",
            "source", "KRISHI_MARATA_VAHINI"
        ));
    }

    @GetMapping("/commodities")
    public ResponseEntity<List<String>> getCommodities() {
        if (krishiMandiService != null) {
            return ResponseEntity.ok(krishiMandiService.getDistinctCommodities());
        }
        return ResponseEntity.ok(List.of());
    }

    @GetMapping("/districts")
    public ResponseEntity<List<String>> getDistricts() {
        if (krishiMandiService != null) {
            return ResponseEntity.ok(krishiMandiService.getDistinctDistricts());
        }
        return ResponseEntity.ok(List.of());
    }

    @GetMapping("/markets")
    public ResponseEntity<List<String>> getMarkets() {
        if (krishiMandiService != null) {
            return ResponseEntity.ok(krishiMandiService.getDistinctMarkets());
        }
        return ResponseEntity.ok(List.of());
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getStatus() {
        if (krishiMandiService != null) {
            return ResponseEntity.ok(krishiMandiService.getStatus());
        }
        return ResponseEntity.ok(Map.of("source", "KRISHI_MARATA_VAHINI", "lastRunStatus", "NO_RUNS_RECORDED"));
    }

    @PostMapping({"/snapshot", "/ingest"})
    public ResponseEntity<?> ingestSnapshot(
            @RequestHeader(value = "X-Ingest-Key", required = false) String headerKey,
            @RequestBody List<Map<String, Object>> records) {

        if (ingestKey == null || !ingestKey.equals(headerKey)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid or missing X-Ingest-Key"));
        }
        if (records == null || records.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Snapshot payload cannot be empty."));
        }
        try {
            return ResponseEntity.ok(krishiMandiService.ingestSnapshot(records));
        } catch (IllegalArgumentException iae) {
            return ResponseEntity.badRequest().body(Map.of("error", iae.getMessage()));
        } catch (IllegalStateException ise) {
            return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body(Map.of("error", ise.getMessage()));
        }
    }

    @PostMapping("/dev/reset")
    public ResponseEntity<?> resetDatabase(@RequestHeader(value = "X-Ingest-Key", required = false) String headerKey) {
        if (ingestKey == null || !ingestKey.equals(headerKey)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid or missing X-Ingest-Key"));
        }
        if (krishiMandiService != null) {
            krishiMandiService.resetDatabase();
        }
        return ResponseEntity.ok(Map.of("status", "SUCCESS", "message", "Database successfully reset"));
    }

    @PostMapping("/sync-live")
    public ResponseEntity<Map<String, Object>> syncLive(@RequestParam(required = false) String date) {
        if (krishiMandiService != null) {
            return ResponseEntity.ok(krishiMandiService.syncLiveKMV(date));
        }
        return ResponseEntity.ok(Map.of("status", "NO_SERVICE", "message", "Krishi Mandi service is unavailable"));
    }
}
