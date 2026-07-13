package com.agricompass.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
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
        
        // If apiKey is empty or default, skip call and directly use mock fallback to prevent API error logs
        if (apiKey == null || apiKey.trim().isEmpty() || apiKey.contains("your-") || apiKey.contains("api_key")) {
            return ResponseEntity.ok(getMockMarketPrices(commodity, district, limit));
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
            // If response is null, contains error status, or has empty records, use mock fallback
            return ResponseEntity.ok(getMockMarketPrices(commodity, district, limit));
        } catch (Exception e) {
            // Fallback on exception
            return ResponseEntity.ok(getMockMarketPrices(commodity, district, limit));
        }
    }

    @GetMapping("/latest")
    public ResponseEntity<Map<String, Object>> getLatestPrices() {
        return getLiveMarketPrices("Tomato", "Karnataka", null, 5);
    }

    private Map<String, Object> getMockMarketPrices(String commodity, String district, int limit) {
        Map<String, Object> mockResponse = new HashMap<>();
        List<Map<String, Object>> records = new ArrayList<>();
        
        // Define base prices for commodities
        int basePrice = 3000;
        String variety = "Local";
        
        if ("Tomato".equalsIgnoreCase(commodity)) { basePrice = 1500; variety = "Hybrid"; }
        else if ("Onion".equalsIgnoreCase(commodity)) { basePrice = 2200; variety = "Red"; }
        else if ("Potato".equalsIgnoreCase(commodity)) { basePrice = 1800; variety = "Jyoti"; }
        else if ("Rice".equalsIgnoreCase(commodity)) { basePrice = 3600; variety = "Sona Masuri"; }
        else if ("Wheat".equalsIgnoreCase(commodity)) { basePrice = 2600; variety = "Lokwan"; }
        else if ("Maize".equalsIgnoreCase(commodity)) { basePrice = 2000; variety = "Yellow"; }
        else if ("Cotton".equalsIgnoreCase(commodity)) { basePrice = 6800; variety = "Medium Staple"; }
        else if ("Groundnut".equalsIgnoreCase(commodity)) { basePrice = 5800; variety = "Bold"; }
        else if ("Soyabean".equalsIgnoreCase(commodity)) { basePrice = 4500; variety = "Yellow"; }
        else if ("Ragi".equalsIgnoreCase(commodity)) { basePrice = 3400; variety = "Regular"; }
        else if ("Jowar".equalsIgnoreCase(commodity)) { basePrice = 3100; variety = "White"; }
        else if ("Chilli".equalsIgnoreCase(commodity)) { basePrice = 14000; variety = "Byadagi"; }
        else if ("Turmeric".equalsIgnoreCase(commodity)) { basePrice = 8500; variety = "Finger"; }
        else if ("Coconut".equalsIgnoreCase(commodity)) { basePrice = 2500; variety = "Dry"; }
        else if ("Arecanut".equalsIgnoreCase(commodity)) { basePrice = 48000; variety = "Chali"; }
        else if ("Banana".equalsIgnoreCase(commodity)) { basePrice = 2000; variety = "Robusta"; }
        else if ("Mango".equalsIgnoreCase(commodity)) { basePrice = 4500; variety = "Alphonso"; }
        else if ("Grapes".equalsIgnoreCase(commodity)) { basePrice = 5500; variety = "Dilkhush"; }
        else if ("Pomegranate".equalsIgnoreCase(commodity)) { basePrice = 8000; variety = "Bhagwa"; }

        String[] districts = (district != null && !district.trim().isEmpty() && !"all".equalsIgnoreCase(district)) 
            ? new String[]{ district.trim() }
            : new String[]{ "Mandya", "Raichur", "Mysuru", "Hassan", "Belagavi", "Kolar" };
            
        String[] marketTypes = { "Mandi", "APMC Yard", "Sub-market", "Wholesale Market" };
        
        java.text.SimpleDateFormat sdf = new java.text.SimpleDateFormat("dd/MM/yyyy");
        String todayDate = sdf.format(new java.util.Date());
        
        int count = 0;
        for (String dist : districts) {
            // Generate 2-3 markets per district
            int numMarkets = (districts.length == 1) ? 4 : 2;
            for (int i = 1; i <= numMarkets; i++) {
                if (count >= limit) break;
                
                // Variation in price
                int variance = (int)(Math.random() * (basePrice * 0.15));
                int modal = basePrice + (i % 2 == 0 ? variance : -variance);
                int min = modal - (int)(modal * 0.08);
                int max = modal + (int)(modal * 0.10);
                
                Map<String, Object> record = new HashMap<>();
                record.put("state", "Karnataka");
                record.put("district", dist);
                record.put("market", dist + " " + marketTypes[(i + count) % marketTypes.length]);
                record.put("commodity", commodity);
                record.put("variety", variety);
                record.put("arrival_date", todayDate);
                record.put("min_price", String.valueOf(min));
                record.put("max_price", String.valueOf(max));
                record.put("modal_price", String.valueOf(modal));
                
                records.add(record);
                count++;
            }
        }
        
        mockResponse.put("records", records);
        mockResponse.put("total", records.size());
        mockResponse.put("count", records.size());
        mockResponse.put("limit", limit);
        mockResponse.put("fallback", true);
        return mockResponse;
    }
}
