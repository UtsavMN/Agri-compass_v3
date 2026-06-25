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

@RestController
@RequestMapping("/api/market")
public class MarketController {

    @Value("${data.gov.in.api.key:default}")
    private String dataGovApiKey;

    @GetMapping("/prices")
    public ResponseEntity<?> getMarketPrices(
            @RequestParam String district,
            @RequestParam(defaultValue = "20") int limit) {

        if (dataGovApiKey == null || dataGovApiKey.equals("default") || dataGovApiKey.trim().isEmpty() || dataGovApiKey.contains("your-")) {
            return ResponseEntity.ok(Map.of(
                "prices", getMockData(district),
                "district", district,
                "fetchedAt", LocalDateTime.now()
            ));
        }

        String url = "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070" +
            "?api-key=" + dataGovApiKey +
            "&format=json" +
            "&limit=" + limit +
            "&filters[state]=Karnataka" +
            "&filters[district]=" + district;

        try {
            RestTemplate restTemplate = new RestTemplate();
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            return ResponseEntity.ok(Map.of(
                "prices", parseMandiData(response),
                "district", district,
                "fetchedAt", LocalDateTime.now()
            ));
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of(
                "prices", getMockData(district),
                "district", district,
                "fetchedAt", LocalDateTime.now()
            ));
        }
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
                price.put("trend", Math.random() > 0.5 ? "up" : "down");
                parsedPrices.add(price);
            }
        }
        return parsedPrices;
    }

    private List<Map<String, Object>> getMockData(String district) {
        List<Map<String, Object>> mock = new ArrayList<>();
        String[] commodities = {"Tomato", "Onion", "Potato", "Cotton", "Maize"};
        for (String c : commodities) {
            Map<String, Object> m = new HashMap<>();
            m.put("commodity", c);
            m.put("market", district + " APMC");
            m.put("district", district);
            int basePrice = 1500 + (int)(Math.random() * 3000);
            m.put("minPrice", basePrice - 200);
            m.put("maxPrice", basePrice + 300);
            m.put("modalPrice", basePrice);
            m.put("date", LocalDateTime.now().toString());
            m.put("trend", Math.random() > 0.5 ? "up" : "down");
            mock.add(m);
        }
        return mock;
    }
}
