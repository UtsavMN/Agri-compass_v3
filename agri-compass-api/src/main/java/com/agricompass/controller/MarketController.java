package com.agricompass.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/market")
@Slf4j
public class MarketController {

    @Value("${data.gov.in.api.key:default}")
    private String dataGovApiKey;

    private final RestTemplate restTemplate;
    private final com.agricompass.service.KrishiMandiService krishiMandiService;

    public MarketController(RestTemplate restTemplate) {
        this(restTemplate, null);
    }

    public MarketController(RestTemplate restTemplate, com.agricompass.service.KrishiMandiService krishiMandiService) {
        this.restTemplate = restTemplate;
        this.krishiMandiService = krishiMandiService;
    }

    @GetMapping("/prices")
    public ResponseEntity<?> getMarketPrices(
            @RequestParam String district,
            @RequestParam(defaultValue = "20") int limit) {

        // 1. Check local verified Krishi Marata Vahini snapshot first
        if (krishiMandiService != null) {
            var kmvPrices = krishiMandiService.getPricesByDistrict(district);
            if (kmvPrices != null && !kmvPrices.isEmpty()) {
                var mapped = kmvPrices.stream().limit(limit).map(p -> {
                    Map<String, Object> m = new HashMap<>();
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

                return ResponseEntity.ok(Map.of(
                    "prices", mapped,
                    "district", district,
                    "fetchedAt", java.time.Instant.now().toString(),
                    "source", "KRISHI_MARATA_VAHINI"
                ));
            }
        }

        if (dataGovApiKey == null || dataGovApiKey.equals("default") || dataGovApiKey.trim().isEmpty() || dataGovApiKey.contains("your-")) {
            return ResponseEntity.ok(Map.of(
                "prices", List.of(),
                "district", district,
                "fetchedAt", java.time.Instant.now().toString(),
                "message", "Market API key not configured"
            ));
        }

        // Map modern district names to Data.gov.in spellings
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
        log.info("Fetching mandi prices for district: {}", apiDistrict);

        List<Map<String, Object>> allParsedPrices = new ArrayList<>();

        String url = "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070" +
            "?api-key=" + dataGovApiKey +
            "&format=json" +
            "&limit=" + limit +
            "&filters[state]=Karnataka" +
            "&filters[district]=" + apiDistrict;

        log.info("API URL: {}", url);

        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            List<Map<String, Object>> parsed = parseMandiData(response);
            if (parsed != null && !parsed.isEmpty()) {
                allParsedPrices.addAll(parsed);
            }
        } catch (Exception e) {
            log.error("Failed to fetch market prices: {}", e.getMessage());
        }

        return ResponseEntity.ok(Map.of(
            "prices", allParsedPrices,
            "district", district,
            "fetchedAt", java.time.Instant.now().toString()
        ));
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> parseMandiData(Map<String, Object> body) {
        List<Map<String, Object>> parsedPrices = new ArrayList<>();
        if (body != null && body.containsKey("records")) {
            List<Map<String, Object>> records = (List<Map<String, Object>>) body.get("records");
            for (Map<String, Object> record : records) {
                Map<String, Object> price = new HashMap<>();
                price.put("commodity", record.get("commodity"));
                price.put("market", record.get("market"));
                price.put("district", record.get("district"));
                
                try {
                    price.put("minPrice", Double.parseDouble(String.valueOf(record.get("min_price"))));
                    price.put("maxPrice", Double.parseDouble(String.valueOf(record.get("max_price"))));
                    price.put("modalPrice", Double.parseDouble(String.valueOf(record.get("modal_price"))));
                } catch (Exception e) {
                    price.put("minPrice", 0);
                    price.put("maxPrice", 0);
                    price.put("modalPrice", 0);
                }
                
                price.put("date", record.get("arrival_date"));
                parsedPrices.add(price);
            }
        }
        return parsedPrices;
    }
}
