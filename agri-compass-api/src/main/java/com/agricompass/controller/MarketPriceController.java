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

    @GetMapping("/live")
    @SuppressWarnings("null")
    public ResponseEntity<Map<String, Object>> getLiveMarketPrices(
            @RequestParam(name = "commodity", defaultValue = "Tomato") String commodity,
            @RequestParam(name = "state", defaultValue = "Karnataka") String state,
            @RequestParam(name = "limit", defaultValue = "10") int limit) {
        
        String url = String.format(
            "https://api.data.gov.in/resource/9ef273ef-98d9-411b-8470-4319191b1a72?api-key=%s&format=json&filters[commodity]=%s&filters[state]=%s&limit=%d",
            apiKey, commodity, state, limit
        );

        RestTemplate restTemplate = new RestTemplate();
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            return ResponseEntity.ok(response != null ? response : new HashMap<>());
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of("records", List.of(), "error", e.getMessage()));
        }
    }

    @GetMapping("/latest")
    public ResponseEntity<Map<String, Object>> getLatestPrices() {
        return getLiveMarketPrices("Tomato", "Karnataka", 5);
    }
}
