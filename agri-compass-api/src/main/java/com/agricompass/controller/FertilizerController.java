package com.agricompass.controller;

import com.agricompass.entity.FertilizerAnalysis;
import com.agricompass.service.FertilizerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
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

    @PostMapping("/analyze")
    public ResponseEntity<Map<String, Object>> analyzeFertilizer(@RequestBody Map<String, Object> body) {
        try {
            String crop = (String) body.get("crop");
            double soilN = ((Number) body.get("soil_n")).doubleValue();
            double soilP = ((Number) body.get("soil_p")).doubleValue();
            double soilK = ((Number) body.get("soil_k")).doubleValue();
            String soilLevel = (String) body.getOrDefault("soil_level", "medium");
            String soilPh = (String) body.getOrDefault("soil_ph", "neutral");
            String growthStage = (String) body.getOrDefault("growth_stage", "basal");

            Map<String, Object> result = fertilizerService.advancedAnalysis(crop, soilN, soilP, soilK, soilLevel, soilPh, growthStage);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
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

    @PostMapping("/save")
    public ResponseEntity<FertilizerAnalysis> saveAnalysis(@RequestBody Map<String, Object> body) {
        try {
            FertilizerAnalysis analysis = fertilizerService.saveAnalysis(body);
            return ResponseEntity.ok(analysis);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/history/{farmId}")
    public ResponseEntity<List<FertilizerAnalysis>> getHistory(@PathVariable String farmId) {
        List<FertilizerAnalysis> history = fertilizerService.getAnalysisHistory(farmId);
        return ResponseEntity.ok(history);
    }
}
