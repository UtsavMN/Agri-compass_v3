package com.agricompass.service;

import com.agricompass.entity.FertilizerAnalysis;
import com.agricompass.repository.FertilizerAnalysisRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
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
@RequiredArgsConstructor
public class FertilizerService {

    private final FertilizerAnalysisRepository analysisRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();
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
        String cropKey = crop != null ? crop.toLowerCase() : "generic";
        Map<String, Object> nutrientReq;
        Map<String, Object> cropData = null;

        if (cropDataMap.containsKey(cropKey)) {
            cropData = (Map<String, Object>) cropDataMap.get(cropKey);
            nutrientReq = (Map<String, Object>) cropData.get("nutrient_requirement_per_acre");
        } else {
            nutrientReq = Map.of(
                "nitrogen_kg", 50.0,
                "phosphorus_kg", 25.0,
                "potassium_kg", 20.0
            );
        }

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
        
        if (cropData != null) {
            result.put("growing_steps", cropData.get("growing_steps"));
            result.put("fertilizer_schedule", cropData.get("fertilizer_schedule"));
            result.put("deficiency_symptoms", cropData.get("deficiency_symptoms"));
            result.put("soil_requirements", cropData.get("soil_requirements"));
        } else {
            result.put("growing_steps", new ArrayList<>());
            result.put("fertilizer_schedule", new ArrayList<>());
            result.put("deficiency_symptoms", new HashMap<>());
            result.put("soil_requirements", new HashMap<>());
        }

        return result;
    }

    public Map<String, Object> advancedAnalysis(String crop, double soilN, double soilP, double soilK, 
                                               String soilLevel, String soilPh, String growthStage) {
        String cropKey = crop != null ? crop.toLowerCase() : "generic";
        Map<String, Object> nutrientReq;
        boolean isGeneric = false;

        if (cropDataMap.containsKey(cropKey)) {
            Map<String, Object> cropData = (Map<String, Object>) cropDataMap.get(cropKey);
            nutrientReq = (Map<String, Object>) cropData.get("nutrient_requirement_per_acre");
        } else {
            // Fallback for unknown crops
            nutrientReq = new HashMap<>();
            nutrientReq.put("nitrogen_kg", 50.0);
            nutrientReq.put("phosphorus_kg", 25.0);
            nutrientReq.put("potassium_kg", 20.0);
            isGeneric = true;
        }

        double reqN = ((Number) nutrientReq.get("nitrogen_kg")).doubleValue();
        double reqP = ((Number) nutrientReq.get("phosphorus_kg")).doubleValue();
        double reqK = ((Number) nutrientReq.get("potassium_kg")).doubleValue();

        // 1. Initial Deficit
        double deficitN = Math.max(0, reqN - soilN);
        double deficitP = Math.max(0, reqP - soilP);
        double deficitK = Math.max(0, reqK - soilK);

        // 2. Soil Fertility Adjustment
        double soilAdj = 1.0;
        if ("low".equalsIgnoreCase(soilLevel)) soilAdj = 1.2;
        else if ("high".equalsIgnoreCase(soilLevel)) soilAdj = 0.7;
        
        deficitN *= soilAdj;
        deficitP *= soilAdj;
        deficitK *= soilAdj;

        // 3. pH Adjustment
        double phAdj = 1.0;
        if ("acidic".equalsIgnoreCase(soilPh)) phAdj = 0.9;
        else if ("alkaline".equalsIgnoreCase(soilPh)) phAdj = 1.1;

        deficitN *= phAdj;
        deficitP *= phAdj;
        deficitK *= phAdj;

        // 4. Growth Stage Distribution
        double stageWeight = 1.0;
        if ("basal".equalsIgnoreCase(growthStage)) stageWeight = 0.4;
        else if ("tillering".equalsIgnoreCase(growthStage)) stageWeight = 0.3;
        else if ("flowering".equalsIgnoreCase(growthStage)) stageWeight = 0.3;

        double stageN = deficitN * stageWeight;
        double stageP = deficitP * stageWeight;
        double stageK = deficitK * stageWeight;

        // 5. Fertilizer Conversion
        // Urea (46% N), DAP (18% N, 46% P), MOP (60% K)
        double recDap = stageP / 0.46;
        double nFromDap = recDap * 0.18;
        double recUrea = Math.max(0, stageN - nFromDap) / 0.46;
        double recMop = stageK / 0.60;

        // 6. Soil Health Score (Simulated)
        int score = 100;
        if (deficitN > 20) score -= 10;
        if (deficitP > 10) score -= 10;
        if (deficitK > 10) score -= 10;
        if (!"neutral".equalsIgnoreCase(soilPh)) score -= 15;
        if ("low".equalsIgnoreCase(soilLevel)) score -= 10;
        score = Math.max(10, score);

        // 7. Explanations & Warnings
        List<String> warnings = new ArrayList<>();
        List<String> explanations = new ArrayList<>();

        if (soilAdj > 1.0) explanations.add("Nutrient needs increased due to low soil fertility.");
        if (phAdj > 1.0) explanations.add("Nutrient availability is reduced due to alkaline pH.");
        if (isGeneric) explanations.add("Using general nutrient requirements as specific data for '" + crop + "' is pending.");
        if (deficitN > 30) warnings.add("High nitrogen deficit detected. Split applications recommended to prevent leaching.");
        if ("alkaline".equalsIgnoreCase(soilPh)) warnings.add("High pH might cause micronutrient deficiencies.");

        Map<String, Object> result = new HashMap<>();
        result.put("nutrient_deficit", Map.of("nitrogen", deficitN, "phosphorus", deficitP, "potassium", deficitK));
        result.put("stage_application", Map.of("nitrogen", stageN, "phosphorus", stageP, "potassium", stageK));
        result.put("fertilizer_recommendation", Map.of(
            "urea", Math.round(recUrea * 100.0) / 100.0,
            "dap", Math.round(recDap * 100.0) / 100.0,
            "mop", Math.round(recMop * 100.0) / 100.0
        ));
        result.put("soil_health_score", score);
        result.put("warnings", warnings);
        result.put("explanations", explanations);
        result.put("stage_weights", Map.of("basal", 0.4, "tillering", 0.3, "flowering", 0.3));

        return result;
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> getCropData(String crop) {
        String cropKey = crop != null ? crop.toLowerCase() : "generic";
        if (!cropDataMap.containsKey(cropKey)) {
            return (Map<String, Object>) cropDataMap.get("rice"); // Return rice as default instead of failing
        }
        return (Map<String, Object>) cropDataMap.get(cropKey);
    }

    public FertilizerAnalysis saveAnalysis(Map<String, Object> body) throws IOException {
        String farmId = (String) body.get("farmId");
        String crop = (String) body.get("crop");
        double soilN = ((Number) body.get("soil_n")).doubleValue();
        double soilP = ((Number) body.get("soil_p")).doubleValue();
        double soilK = ((Number) body.get("soil_k")).doubleValue();
        String soilLevel = (String) body.get("soil_level");
        String soilPh = (String) body.get("soil_ph");
        String growthStage = (String) body.get("growth_stage");
        Map<String, Object> result = (Map<String, Object>) body.get("result");

        FertilizerAnalysis analysis = FertilizerAnalysis.builder()
                .farmId(farmId)
                .crop(crop)
                .soilN(soilN)
                .soilP(soilP)
                .soilK(soilK)
                .soilLevel(soilLevel)
                .soilPh(soilPh)
                .growthStage(growthStage)
                .resultJson(objectMapper.writeValueAsString(result))
                .build();

        return analysisRepository.save(analysis);
    }

    public List<FertilizerAnalysis> getAnalysisHistory(String farmId) {
        return analysisRepository.findByFarmIdOrderByCreatedAtDesc(farmId);
    }
}
