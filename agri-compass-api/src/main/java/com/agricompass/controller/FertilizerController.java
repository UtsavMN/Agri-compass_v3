package com.agricompass.controller;

import com.agricompass.entity.FertilizerAnalysis;
import com.agricompass.service.FertilizerService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/fertilizer")
public class FertilizerController {

    private final FertilizerService fertilizerService;

    public FertilizerController(FertilizerService fertilizerService) {
        this.fertilizerService = fertilizerService;
    }

    @PostMapping("/recommend")
    public ResponseEntity<Map<String, Object>> getRecommendation(@RequestBody Map<String, Object> body) {
        String crop = (String) body.get("crop");
        double soilN = body.get("soil_n") instanceof Number ? ((Number) body.get("soil_n")).doubleValue() : 0.0;
        double soilP = body.get("soil_p") instanceof Number ? ((Number) body.get("soil_p")).doubleValue() : 0.0;
        double soilK = body.get("soil_k") instanceof Number ? ((Number) body.get("soil_k")).doubleValue() : 0.0;

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
            double soilN = body.get("soil_n") instanceof Number ? ((Number) body.get("soil_n")).doubleValue() : 0.0;
            double soilP = body.get("soil_p") instanceof Number ? ((Number) body.get("soil_p")).doubleValue() : 0.0;
            double soilK = body.get("soil_k") instanceof Number ? ((Number) body.get("soil_k")).doubleValue() : 0.0;
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
