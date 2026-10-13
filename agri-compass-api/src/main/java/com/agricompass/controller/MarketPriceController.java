package com.agricompass.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/market-prices")
public class MarketPriceController {

    @Value("${data.gov.in.api.key}")
    private String apiKey;

    private final RestTemplate restTemplate;

    public MarketPriceController(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @GetMapping("/live")
    @SuppressWarnings("null")
    public ResponseEntity<Map<String, Object>> getLiveMarketPrices(
            @RequestParam(name = "commodity", defaultValue = "Tomato") String commodity,
            @RequestParam(name = "state", defaultValue = "Karnataka") String state,
            @RequestParam(name = "district", required = false) String district,
            @RequestParam(name = "limit", defaultValue = "10") int limit) {
        
        // If apiKey is empty or default, return empty records instead of synthetic mock data
        if (apiKey == null || apiKey.trim().isEmpty() || apiKey.contains("your-") || apiKey.contains("api_key")) {
            return ResponseEntity.ok(buildEmptyResponse(commodity, district, limit));
        }

        String url = String.format(
            "https://api.data.gov.in/resource/9ef273ef-98d9-411b-8470-4319191b1a72?api-key=%s&format=json&filters[commodity]=%s&filters[state]=%s&limit=%d",
            apiKey, commodity, state, limit
        );

        if (district != null && !district.trim().isEmpty() && !"all".equalsIgnoreCase(district)) {
            url += "&filters[district]=" + district.trim();
        }

        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            if (response != null && !"error".equalsIgnoreCase((String) response.get("status"))) {
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> records = (List<Map<String, Object>>) response.get("records");
                if (records != null && !records.isEmpty()) {
                    return ResponseEntity.ok(response);
                }
            }
            return ResponseEntity.ok(buildEmptyResponse(commodity, district, limit));
        } catch (Exception e) {
            return ResponseEntity.ok(buildEmptyResponse(commodity, district, limit));
        }
    }

    @GetMapping("/latest")
    public ResponseEntity<Map<String, Object>> getLatestPrices() {
        return getLiveMarketPrices("Tomato", "Karnataka", null, 5);
    }

    private Map<String, Object> buildEmptyResponse(String commodity, String district, int limit) {
        Map<String, Object> response = new HashMap<>();
        response.put("records", List.of());
        response.put("total", 0);
        response.put("count", 0);
        response.put("limit", limit);
        response.put("status", "ok");
        response.put("message", "No market records found for " + commodity + (district != null ? " in " + district : ""));
        return response;
    }
}
