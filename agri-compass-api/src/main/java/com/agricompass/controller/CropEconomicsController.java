package com.agricompass.controller;

import com.agricompass.entity.Crop;
import com.agricompass.entity.CropEconomics;
import com.agricompass.repository.CropRepository;
import com.agricompass.repository.CropEconomicsRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/economics")
public class CropEconomicsController {

    private final CropRepository cropRepository;
    private final CropEconomicsRepository economicsRepository;

    public CropEconomicsController(CropRepository cropRepository, CropEconomicsRepository economicsRepository) {
        this.cropRepository = cropRepository;
        this.economicsRepository = economicsRepository;
    }

    @GetMapping("/all")
    public ResponseEntity<List<Map<String, Object>>> getAllEconomics() {
        return ResponseEntity.ok(
            cropRepository.findAll().stream().map(crop -> {
                Map<String, Object> map = new HashMap<>();
                map.put("id", crop.getId());
                map.put("name", crop.getName());
                map.put("season", crop.getSeason());
                map.put("durationDays", crop.getDurationDays());
                
                economicsRepository.findByCropId(crop.getId()).ifPresent(eco -> {
                    map.put("investmentPerAcre", eco.getInvestmentPerAcre());
                    map.put("yieldQuintal", eco.getYieldQuintal());
                    map.put("marketPrice", eco.getMarketPrice());
                    map.put("expectedReturn", eco.getExpectedReturn());
                    map.put("profitMargin", eco.getProfitMargin());
                });
                
                return map;
            }).toList()
        );
    }
    
    @GetMapping("/{cropName}")
    public ResponseEntity<Map<String, Object>> getEconomicsByCrop(@PathVariable String cropName) {
        Optional<Crop> optCrop = cropRepository.findByNameIgnoreCase(cropName);
        if (optCrop.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        Crop crop = optCrop.get();
        Map<String, Object> map = new HashMap<>();
        map.put("id", crop.getId());
        map.put("name", crop.getName());
        map.put("season", crop.getSeason());
        map.put("durationDays", crop.getDurationDays());
        map.put("soilType", crop.getSoilType());
        map.put("waterRequirement", crop.getWaterRequirement());
        map.put("temperatureRange", crop.getTemperatureRange());
        
        economicsRepository.findByCropId(crop.getId()).ifPresent(eco -> {
            map.put("investmentPerAcre", eco.getInvestmentPerAcre());
            map.put("yieldQuintal", eco.getYieldQuintal());
            map.put("marketPrice", eco.getMarketPrice());
            map.put("expectedReturn", eco.getExpectedReturn());
            map.put("profitMargin", eco.getProfitMargin());
        });
        
        return ResponseEntity.ok(map);
    }
}
