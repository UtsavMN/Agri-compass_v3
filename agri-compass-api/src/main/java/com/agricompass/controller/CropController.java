package com.agricompass.controller;

import com.agricompass.dto.CropDTO;
import com.agricompass.service.CropService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/crops")
public class CropController {

    private final CropService cropService;

    public CropController(CropService cropService) {
        this.cropService = cropService;
    }

    @GetMapping
    public ResponseEntity<Page<CropDTO>> getAllCrops(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String direction) {
        
        Sort sort = direction.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(cropService.getAllCrops(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CropDTO> getCropById(@PathVariable Long id) {
        CropDTO crop = cropService.getCropById(id);
        return crop != null ? ResponseEntity.ok(crop) : ResponseEntity.notFound().build();
    }

    @GetMapping("/search")
    public ResponseEntity<List<CropDTO>> searchCrops(@RequestParam String query) {
        return ResponseEntity.ok(cropService.searchCrops(query));
    }

    @GetMapping("/recommendations")
    public ResponseEntity<List<CropDTO>> getRecommendations(@RequestParam String district) {
        return ResponseEntity.ok(cropService.getRecommendations(district));
    }

    @GetMapping("/recommendations/{district}")
    public ResponseEntity<List<CropDTO>> getRecommendationsByPath(@PathVariable String district) {
        return ResponseEntity.ok(cropService.getRecommendations(district));
    }

    @GetMapping("/district/{district}")
    public ResponseEntity<List<CropDTO>> getCropsByDistrict(@PathVariable String district) {
        return ResponseEntity.ok(cropService.getCropsByDistrict(district));
    }

    @GetMapping("/season/{season}")
    public ResponseEntity<List<CropDTO>> getCropsBySeason(@PathVariable String season) {
        return ResponseEntity.ok(cropService.getCropsBySeason(season));
    }

    @GetMapping("/high-profit")
    public ResponseEntity<List<CropDTO>> getHighProfitCrops() {
        return ResponseEntity.ok(cropService.getHighProfitCrops());
    }

    @GetMapping("/low-water")
    public ResponseEntity<List<CropDTO>> getLowWaterCrops() {
        return ResponseEntity.ok(cropService.getLowWaterCrops());
    }
}
