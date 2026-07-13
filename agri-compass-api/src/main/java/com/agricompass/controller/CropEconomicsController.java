package com.agricompass.controller;

import com.agricompass.entity.Crop;
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
                
                Optional<com.agricompass.entity.CropEconomics> optEco = economicsRepository.findByCropId(crop.getId());
                if (optEco.isPresent()) {
                    populateEconomics(map, optEco.get());
                } else {
                    populateDefaultEconomics(map);
                }
                
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
        
        Optional<com.agricompass.entity.CropEconomics> optEco = economicsRepository.findByCropId(crop.getId());
        if (optEco.isPresent()) {
            populateEconomics(map, optEco.get());
        } else {
            populateDefaultEconomics(map);
        }
        
        return ResponseEntity.ok(map);
    }

    private void populateEconomics(Map<String, Object> map, com.agricompass.entity.CropEconomics eco) {
        map.put("investmentPerAcre", eco.getInvestmentPerAcre() != null ? eco.getInvestmentPerAcre() : 0.0);
        map.put("yieldQuintal", eco.getYieldQuintal() != null ? eco.getYieldQuintal() : 0.0);
        map.put("marketPrice", eco.getMarketPrice() != null ? eco.getMarketPrice() : 0.0);
        map.put("expectedReturn", eco.getExpectedReturn() != null ? eco.getExpectedReturn() : 0.0);
        map.put("profitMargin", eco.getProfitMargin() != null ? eco.getProfitMargin() : 0.0);
        map.put("mspPerQuintal", eco.getMarketPrice() != null ? eco.getMarketPrice() : 0.0);
    }

    private void populateDefaultEconomics(Map<String, Object> map) {
        map.put("investmentPerAcre", 0.0);
        map.put("yieldQuintal", 0.0);
        map.put("marketPrice", 0.0);
        map.put("expectedReturn", 0.0);
        map.put("profitMargin", 0.0);
        map.put("mspPerQuintal", 0.0);
    }
}
