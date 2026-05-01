package com.agricompass.controller;

import com.agricompass.entity.Crop;
import com.agricompass.entity.CropRecommendation;
import com.agricompass.repository.CropRecommendationRepository;
import com.agricompass.repository.CropRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/crops")
public class CropController {

    @Autowired
    private CropRepository cropRepository;

    @Autowired
    private CropRecommendationRepository cropRecommendationRepository;

    @GetMapping
    public ResponseEntity<List<Crop>> getAllCrops(@RequestParam(required = false) Integer limit) {
        List<Crop> crops = cropRepository.findAll();
        if (limit != null && limit > 0 && crops.size() > limit) {
            return ResponseEntity.ok(crops.subList(0, limit));
        }
        return ResponseEntity.ok(crops);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Crop> getCropById(@PathVariable Long id) {
        return cropRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/recommendations/{district}")
    public ResponseEntity<List<Crop>> getRecommendationsByDistrict(@PathVariable String district) {
        List<CropRecommendation> recommendations = cropRecommendationRepository.findByDistrictIgnoreCase(district);
        
        List<Crop> crops = recommendations.stream()
                .map(CropRecommendation::getCrop)
                .collect(Collectors.toList());
                
        // Fallback: If no recommendations, try returning crops that match district directly
        if (crops.isEmpty()) {
            return ResponseEntity.ok(cropRepository.findAll().stream()
                    .filter(c -> c.getDistrict() != null && c.getDistrict().equalsIgnoreCase(district))
                    .collect(Collectors.toList()));
        }
                
        return ResponseEntity.ok(crops);
    }
}
