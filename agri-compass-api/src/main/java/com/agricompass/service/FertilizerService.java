package com.agricompass.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class FertilizerService {

    private Map<String, Object> cropDataMap = new HashMap<>();

    @PostConstruct
    public void init() {
        try {
            ClassPathResource resource = new ClassPathResource("dataset/fertilizer_data.json");
            InputStream inputStream = resource.getInputStream();
            ObjectMapper mapper = new ObjectMapper();
            cropDataMap = mapper.readValue(inputStream, new TypeReference<Map<String, Object>>() {});
            log.info("Loaded fertilizer dataset for {} crops.", cropDataMap.size());
        } catch (IOException e) {
            log.error("Failed to load fertilizer_data.json", e);
        }
    }

    public Map<String, Object> calculateRecommendation(String crop, double soilN, double soilP, double soilK) {
        String cropKey = crop.toLowerCase();
        if (!cropDataMap.containsKey(cropKey)) {
            throw new IllegalArgumentException("Crop data not found for: " + crop);
        }

        Map<String, Object> cropData = (Map<String, Object>) cropDataMap.get(cropKey);
        Map<String, Object> nutrientReq = (Map<String, Object>) cropData.get("nutrient_requirement_per_acre");

        double reqN = ((Number) nutrientReq.get("nitrogen_kg")).doubleValue();
        double reqP = ((Number) nutrientReq.get("phosphorus_kg")).doubleValue();
        double reqK = ((Number) nutrientReq.get("potassium_kg")).doubleValue();

        double deficitN = Math.max(0, reqN - soilN);
        double deficitP = Math.max(0, reqP - soilP);
        double deficitK = Math.max(0, reqK - soilK);

        // Convert deficit to actual fertilizer quantities
        // Urea: 46% N
        // DAP: 18% N, 46% P
        // MOP: 60% K
        
        // 1. Calculate DAP for Phosphorus
        double recommendedDAP = deficitP / 0.46;
        
        // DAP also provides some Nitrogen
        double nFromDAP = recommendedDAP * 0.18;
        
        // 2. Calculate Urea for remaining Nitrogen
        double remainingN = Math.max(0, deficitN - nFromDAP);
        double recommendedUrea = remainingN / 0.46;
        
        // 3. Calculate MOP for Potassium
        double recommendedMOP = deficitK / 0.60;

        List<String> plan = new ArrayList<>();
        List<String> warnings = new ArrayList<>();

        if (soilN > reqN) warnings.add("Soil Nitrogen is higher than required. Avoid nitrogen fertilizers to prevent vegetative overgrowth.");
        if (soilP > reqP) warnings.add("Soil Phosphorus is high. Skipping DAP is recommended to avoid zinc deficiency.");
        if (soilK > reqK) warnings.add("Soil Potassium is high. No MOP required.");

        if (recommendedUrea > 0) plan.add(String.format("Apply %.1f kg Urea per acre", recommendedUrea));
        if (recommendedDAP > 0) plan.add(String.format("Apply %.1f kg DAP per acre", recommendedDAP));
        if (recommendedMOP > 0) plan.add(String.format("Apply %.1f kg MOP per acre", recommendedMOP));

        if (plan.isEmpty() && warnings.isEmpty()) {
            plan.add("Soil nutrients are perfectly balanced for this crop. No chemical fertilizers needed.");
        }

        Map<String, Object> result = new HashMap<>();
        result.put("recommended_n", Math.round(deficitN * 10.0) / 10.0);
        result.put("recommended_p", Math.round(deficitP * 10.0) / 10.0);
        result.put("recommended_k", Math.round(deficitK * 10.0) / 10.0);
        
        result.put("recommended_urea_kg", Math.round(recommendedUrea * 10.0) / 10.0);
        result.put("recommended_dap_kg", Math.round(recommendedDAP * 10.0) / 10.0);
        result.put("recommended_mop_kg", Math.round(recommendedMOP * 10.0) / 10.0);

        result.put("fertilizer_plan", plan);
        result.put("warnings", warnings);
        result.put("growing_steps", cropData.get("growing_steps"));
        result.put("fertilizer_schedule", cropData.get("fertilizer_schedule"));
        result.put("deficiency_symptoms", cropData.get("deficiency_symptoms"));
        result.put("soil_requirements", cropData.get("soil_requirements"));

        return result;
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> getCropData(String crop) {
        String cropKey = crop.toLowerCase();
        if (!cropDataMap.containsKey(cropKey)) {
            throw new IllegalArgumentException("Crop data not found for: " + crop);
        }
        return (Map<String, Object>) cropDataMap.get(cropKey);
    }
}
