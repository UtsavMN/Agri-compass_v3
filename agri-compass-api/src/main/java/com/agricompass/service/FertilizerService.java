package com.agricompass.service;

import com.agricompass.entity.FertilizerAnalysis;
import com.agricompass.repository.FertilizerAnalysisRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class FertilizerService {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(FertilizerService.class);

    private final FertilizerAnalysisRepository analysisRepository;
    private final ObjectMapper objectMapper;
    private Map<String, Object> cropDataMap = java.util.Collections.emptyMap();

    public FertilizerService(FertilizerAnalysisRepository analysisRepository) {
        this.analysisRepository = analysisRepository;
        this.objectMapper = new ObjectMapper();
    }

    @PostConstruct
    public void init() {
        try {
            ClassPathResource resource = new ClassPathResource("dataset/Crops_data.json");
            InputStream inputStream = resource.getInputStream();
            List<Map<String, Object>> cropsList = objectMapper.readValue(inputStream, new TypeReference<List<Map<String, Object>>>() {});
            
            Map<String, Object> tempMap = new HashMap<>();
            
            for (Map<String, Object> data : cropsList) {
                String name = (String) data.get("name");
                if (name == null || name.trim().isEmpty()) continue;
                
                String slug = (String) data.get("slug");
                
                // Adapt to legacy structure
                Map<String, Object> adapted = new HashMap<>();
                adapted.put("name", name);
                
                // Nutrients
                Map<String, Object> npk = (Map<String, Object>) data.get("npk_requirement_kg_per_ha");
                Map<String, Object> nutrientReq = new HashMap<>();
                double n = 40.0;
                double p = 20.0;
                double k = 20.0;
                if (npk != null) {
                    if (npk.get("N") != null) n = ((Number) npk.get("N")).doubleValue() / 2.471;
                    if (npk.get("P") != null) p = ((Number) npk.get("P")).doubleValue() / 2.471;
                    if (npk.get("K") != null) k = ((Number) npk.get("K")).doubleValue() / 2.471;
                }
                nutrientReq.put("nitrogen_kg", n);
                nutrientReq.put("phosphorus_kg", p);
                nutrientReq.put("potassium_kg", k);
                adapted.put("nutrient_requirement_per_acre", nutrientReq);
                
                // Soil requirements
                Map<String, Object> soil = (Map<String, Object>) data.get("soil");
                Map<String, Object> soilReqs = new HashMap<>();
                soilReqs.put("ph_range", soil != null ? soil.get("ideal_pH") : "6.0-7.5");
                soilReqs.put("organic_carbon", soil != null ? soil.get("organic_matter") : "Medium");
                adapted.put("soil_requirements", soilReqs);
                
                // Growing steps
                Map<String, Object> growingGuide = (Map<String, Object>) data.get("growing_guide");
                List<String> soilPrep = growingGuide != null ? (List<String>) growingGuide.get("soil_preparation") : null;
                List<Map<String, Object>> stepsList = new ArrayList<>();
                if (soilPrep != null) {
                    int idx = 1;
                    for (String stepStr : soilPrep) {
                        Map<String, Object> step = new HashMap<>();
                        step.put("step_number", idx);
                        step.put("title", "Soil Preparation Step " + idx);
                        step.put("details", stepStr);
                        stepsList.add(step);
                        idx++;
                    }
                }
                adapted.put("growing_steps", stepsList);
                
                // Deficiency symptoms
                List<String> symptoms = new ArrayList<>();
                symptoms.add("Stunted growth and pale yellow leaves (Nitrogen Deficiency)");
                symptoms.add("Purplish leaves and poor root development (Phosphorus Deficiency)");
                symptoms.add("Burnt leaf margins and weak stems (Potassium Deficiency)");
                adapted.put("deficiency_symptoms", symptoms);
                
                // Add to map under different key representations
                String nameLower = name.toLowerCase();
                tempMap.put(nameLower, adapted);
                
                if (slug != null) {
                    tempMap.put(slug.toLowerCase(), adapted);
                }
                
                String simpleName = nameLower.split("\\s+")[0].replaceAll("[^a-zA-Z]", "");
                if (!simpleName.isEmpty() && !tempMap.containsKey(simpleName)) {
                    tempMap.put(simpleName, adapted);
                }
            }
            this.cropDataMap = java.util.Collections.unmodifiableMap(tempMap);
            log.info("Loaded master crop dataset for {} crops adapted from Crops_data.json.", cropDataMap.size());
        } catch (IOException e) {
            log.error("Failed to load Crops_data.json", e);
        }
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> calculateRecommendation(String crop, double soilN, double soilP, double soilK) {
        String cropKey = crop != null ? crop.toLowerCase() : "generic";
        Map<String, Object> nutrientReq;
        Map<String, Object> cropData = null;

        if (cropDataMap.containsKey(cropKey)) {
            cropData = (Map<String, Object>) cropDataMap.get(cropKey);
            nutrientReq = (Map<String, Object>) cropData.get("nutrient_requirement_per_acre");
        } else {
            nutrientReq = new HashMap<>();
            nutrientReq.put("nitrogen_kg", 50.0);
            nutrientReq.put("phosphorus_kg", 25.0);
            nutrientReq.put("potassium_kg", 20.0);
        }

        double reqN = ((Number) nutrientReq.get("nitrogen_kg")).doubleValue();
        double reqP = ((Number) nutrientReq.get("phosphorus_kg")).doubleValue();
        double reqK = ((Number) nutrientReq.get("potassium_kg")).doubleValue();

        double deficitN = Math.max(0, reqN - soilN);
        double deficitP = Math.max(0, reqP - soilP);
        double deficitK = Math.max(0, reqK - soilK);

        double recommendedDAP = deficitP / 0.46;
        double nFromDAP = recommendedDAP * 0.18;
        double remainingN = Math.max(0, deficitN - nFromDAP);
        double recommendedUrea = remainingN / 0.46;
        double recommendedMOP = deficitK / 0.60;

        List<String> plan = new ArrayList<>();
        List<String> warnings = new ArrayList<>();

        if (soilN > reqN) warnings.add("Soil Nitrogen is higher than required. Avoid nitrogen fertilizers.");
        if (soilP > reqP) warnings.add("Soil Phosphorus is high. Skipping DAP recommended.");
        if (soilK > reqK) warnings.add("Soil Potassium is high. No MOP required.");

        if (recommendedUrea > 0) plan.add(String.format("Apply %.1f kg Urea per acre", recommendedUrea));
        if (recommendedDAP > 0) plan.add(String.format("Apply %.1f kg DAP per acre", recommendedDAP));
        if (recommendedMOP > 0) plan.add(String.format("Apply %.1f kg MOP per acre", recommendedMOP));

        if (plan.isEmpty() && warnings.isEmpty()) {
            plan.add("Soil nutrients are balanced for this crop.");
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
            result.put("deficiency_symptoms", cropData.get("deficiency_symptoms"));
            result.put("soil_requirements", cropData.get("soil_requirements"));
        }

        return result;
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> advancedAnalysis(String crop, double soilN, double soilP, double soilK, 
                                               String soilLevel, String soilPh, String growthStage) {
        String cropKey = crop != null ? crop.toLowerCase() : "generic";
        Map<String, Object> nutrientReq;
        boolean isGeneric = false;

        if (cropDataMap.containsKey(cropKey)) {
            Map<String, Object> cropData = (Map<String, Object>) cropDataMap.get(cropKey);
            nutrientReq = (Map<String, Object>) cropData.get("nutrient_requirement_per_acre");
        } else {
            nutrientReq = new HashMap<>();
            nutrientReq.put("nitrogen_kg", 50.0);
            nutrientReq.put("phosphorus_kg", 25.0);
            nutrientReq.put("potassium_kg", 20.0);
            isGeneric = true;
        }

        double reqN = ((Number) nutrientReq.get("nitrogen_kg")).doubleValue();
        double reqP = ((Number) nutrientReq.get("phosphorus_kg")).doubleValue();
        double reqK = ((Number) nutrientReq.get("potassium_kg")).doubleValue();

        double deficitN = Math.max(0, reqN - soilN);
        double deficitP = Math.max(0, reqP - soilP);
        double deficitK = Math.max(0, reqK - soilK);

        double soilAdj = 1.0;
        if ("low".equalsIgnoreCase(soilLevel)) soilAdj = 1.2;
        else if ("high".equalsIgnoreCase(soilLevel)) soilAdj = 0.7;
        
        deficitN *= soilAdj;
        deficitP *= soilAdj;
        deficitK *= soilAdj;

        double phAdj = 1.0;
        if ("acidic".equalsIgnoreCase(soilPh)) phAdj = 0.9;
        else if ("alkaline".equalsIgnoreCase(soilPh)) phAdj = 1.1;

        deficitN *= phAdj;
        deficitP *= phAdj;
        deficitK *= phAdj;

        double stageWeight = 1.0;
        if ("basal".equalsIgnoreCase(growthStage)) stageWeight = 0.4;
        else if ("tillering".equalsIgnoreCase(growthStage)) stageWeight = 0.3;
        else if ("flowering".equalsIgnoreCase(growthStage)) stageWeight = 0.3;

        double stageN = deficitN * stageWeight;
        double stageP = deficitP * stageWeight;
        double stageK = deficitK * stageWeight;

        double recDap = stageP / 0.46;
        double nFromDap = recDap * 0.18;
        double recUrea = Math.max(0, stageN - nFromDap) / 0.46;
        double recMop = stageK / 0.60;

        int score = 100;
        if (deficitN > 20) score -= 10;
        if (deficitP > 10) score -= 10;
        if (deficitK > 10) score -= 10;
        if (!"neutral".equalsIgnoreCase(soilPh)) score -= 15;
        if ("low".equalsIgnoreCase(soilLevel)) score -= 10;
        score = Math.max(10, score);

        List<String> warnings = new ArrayList<>();
        List<String> explanations = new ArrayList<>();

        if (soilAdj > 1.0) explanations.add("Needs increased due to low soil fertility.");
        if (phAdj > 1.0) explanations.add("Nutrient availability reduced due to pH.");
        if (isGeneric) explanations.add("Using general requirements for '" + crop + "'.");

        Map<String, Object> result = new HashMap<>();
        result.put("nutrient_deficit", Map.of("nitrogen", deficitN, "phosphorus", deficitP, "potassium", deficitK));
        result.put("stage_application", Map.of("nitrogen", stageN, "phosphorus", stageP, "potassium", stageK));
        result.put("fertilizer_recommendation", Map.of(
            "urea", Math.round(recUrea * 10.0) / 10.0,
            "dap", Math.round(recDap * 10.0) / 10.0,
            "mop", Math.round(recMop * 10.0) / 10.0
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
            return (Map<String, Object>) cropDataMap.get("rice");
        }
        return (Map<String, Object>) cropDataMap.get(cropKey);
    }

    private double parseDoubleSafe(Object obj) {
        if (obj == null) return 0.0;
        if (obj instanceof Number) return ((Number) obj).doubleValue();
        if (obj instanceof String) {
            try {
                return Double.parseDouble((String) obj);
            } catch (NumberFormatException e) {
                return 0.0;
            }
        }
        return 0.0;
    }

    @SuppressWarnings("unchecked")
    public FertilizerAnalysis saveAnalysis(Map<String, Object> body) throws IOException {
        String farmId = (String) body.get("farmId");
        String crop = (String) body.get("crop");
        double soilN = parseDoubleSafe(body.get("soil_n"));
        double soilP = parseDoubleSafe(body.get("soil_p"));
        double soilK = parseDoubleSafe(body.get("soil_k"));
        String soilLevel = (String) body.get("soil_level");
        String soilPh = (String) body.get("soil_ph");
        String growthStage = (String) body.get("growth_stage");
        Map<String, Object> result = (Map<String, Object>) body.get("result");

        FertilizerAnalysis analysis = new FertilizerAnalysis();
        analysis.setFarmId(farmId);
        analysis.setCrop(crop);
        analysis.setSoilN(soilN);
        analysis.setSoilP(soilP);
        analysis.setSoilK(soilK);
        analysis.setSoilLevel(soilLevel);
        analysis.setSoilPh(soilPh);
        analysis.setGrowthStage(growthStage);
        analysis.setResultJson(objectMapper.writeValueAsString(result));

        return analysisRepository.save(analysis);
    }

    public List<FertilizerAnalysis> getAnalysisHistory(String farmId) {
        return analysisRepository.findByFarmIdOrderByCreatedAtDesc(farmId);
    }
}
