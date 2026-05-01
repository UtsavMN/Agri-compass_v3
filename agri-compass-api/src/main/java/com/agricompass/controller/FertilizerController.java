package com.agricompass.controller;

import com.agricompass.service.FertilizerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/fertilizer")
@RequiredArgsConstructor
public class FertilizerController {

    private final FertilizerService fertilizerService;

    @PostMapping("/recommend")
    public ResponseEntity<Map<String, Object>> getRecommendation(@RequestBody Map<String, Object> body) {
        String crop = (String) body.get("crop");
        double soilN = ((Number) body.get("soil_n")).doubleValue();
        double soilP = ((Number) body.get("soil_p")).doubleValue();
        double soilK = ((Number) body.get("soil_k")).doubleValue();

        try {
            Map<String, Object> result = fertilizerService.calculateRecommendation(crop, soilN, soilP, soilK);
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/crop-info")
    public ResponseEntity<Map<String, Object>> getCropInfo(@RequestParam String crop) {
        try {
            Map<String, Object> data = fertilizerService.getCropData(crop);
            return ResponseEntity.ok(data);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
