package com.agricompass.component;

import com.agricompass.entity.*;
import com.agricompass.repository.*;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.io.InputStream;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    private final CropRepository cropRepo;
    private final CropSoilRequirementRepository soilRepo;
    private final CropNutrientRepository nutrientRepo;
    private final CropDiseaseRepository diseaseRepo;
    private final CropIrrigationRepository irrigationRepo;
    private final CropMarketInfoRepository marketRepo;
    private final CropYieldInfoRepository yieldRepo;
    private final CropPostHarvestRepository postHarvestRepo;
    private final CropAiScoreRepository aiScoreRepo;
    private final CropGrowingStepRepository stepRepo;
    private final CropDistrictRepository districtRepo;

    public DatabaseSeeder(
            CropRepository cropRepo,
            CropSoilRequirementRepository soilRepo,
            CropNutrientRepository nutrientRepo,
            CropDiseaseRepository diseaseRepo,
            CropIrrigationRepository irrigationRepo,
            CropMarketInfoRepository marketRepo,
            CropYieldInfoRepository yieldRepo,
            CropPostHarvestRepository postHarvestRepo,
            CropAiScoreRepository aiScoreRepo,
            CropGrowingStepRepository stepRepo,
            CropDistrictRepository districtRepo) {
        this.cropRepo = cropRepo;
        this.soilRepo = soilRepo;
        this.nutrientRepo = nutrientRepo;
        this.diseaseRepo = diseaseRepo;
        this.irrigationRepo = irrigationRepo;
        this.marketRepo = marketRepo;
        this.yieldRepo = yieldRepo;
        this.postHarvestRepo = postHarvestRepo;
        this.aiScoreRepo = aiScoreRepo;
        this.stepRepo = stepRepo;
        this.districtRepo = districtRepo;
    }

    @SuppressWarnings("unchecked")
    @Override
    public void run(String... args) throws Exception {
        ObjectMapper mapper = new ObjectMapper();
        TypeReference<List<Map<String, Object>>> typeRef = new TypeReference<>() {};
        
        try (InputStream inputStream = new ClassPathResource("dataset/Crops_data.json").getInputStream()) {
            List<Map<String, Object>> cropsList = mapper.readValue(inputStream, typeRef);
            
            for (Map<String, Object> data : cropsList) {
                String name = (String) data.get("name");
                if (name == null || name.trim().isEmpty()) continue;
                
                Optional<Crop> optCrop = cropRepo.findByNameIgnoreCase(name);
                Crop crop = optCrop.orElseGet(Crop::new);
                
                crop.setName(name);
                
                List<String> seasonList = (List<String>) data.get("season");
                crop.setSeason(seasonList != null ? String.join(", ", seasonList) : "Annual");
                
                crop.setDurationDays(parseDurationDays(data.get("duration_days")));
                
                Map<String, Object> growingGuide = (Map<String, Object>) data.get("growing_guide");
                Map<String, Object> profitability = growingGuide != null ? (Map<String, Object>) growingGuide.get("profitability") : null;
                
                double cost = Math.round(parseCost(profitability, "input_cost_per_ha", 15000.0));
                double profit = Math.round(parseCost(profitability, "net_profit", 30000.0));
                
                crop.setInvestmentPerAcre(cost);
                crop.setExpectedReturns(cost + profit);
                crop.setBreakevenMonths(crop.getDurationDays() / 30);
                
                Map<String, Object> soil = (Map<String, Object>) data.get("soil");
                crop.setSoilType(soil != null ? (String) soil.get("texture") : "Loam");
                
                Map<String, Object> climate = (Map<String, Object>) data.get("climate");
                crop.setRainfallMm(climate != null ? (String) climate.get("rainfall_mm") : "500-1000");
                crop.setWeatherPattern(climate != null ? (String) climate.get("humidity_percent") : "Moderate");
                
                Map<String, Object> recommendationFactors = (Map<String, Object>) data.get("recommendation_factors");
                crop.setWaterRequirement(recommendationFactors != null ? (String) recommendationFactors.get("water_requirement_level") : "Moderate");
                
                crop.setTemperatureRange(climate != null ? (String) climate.get("temperature_C") : "15-35");
                crop.setGuidelines((String) data.get("summary"));
                crop.setImageUrl((String) data.get("image_url"));
                crop.setScientificName((String) data.get("scientific_name"));
                crop.setDifficultyLevel((String) data.get("difficulty_level"));
                
                crop = cropRepo.save(crop);

                // Soil Requirements
                CropSoilRequirement soilReq = soilRepo.findByCropId(crop.getId()).orElseGet(CropSoilRequirement::new);
                soilReq.setCrop(crop);
                soilReq.setPhRange(soil != null ? (String) soil.get("ideal_pH") : "6.0-7.5");
                soilReq.setOrganicCarbon(soil != null ? (String) soil.get("organic_matter") : "Medium");
                soilReq.setGreenManure(true);
                soilReq.setCropRotation("Recommended");
                soilReq.setMulching(true);
                soilRepo.save(soilReq);

                // Nutrients
                Map<String, Object> npk = (Map<String, Object>) data.get("npk_requirement_kg_per_ha");
                CropNutrient nutrient = nutrientRepo.findByCropId(crop.getId()).orElseGet(CropNutrient::new);
                nutrient.setCrop(crop);
                
                int n = 40;
                int p = 20;
                int k = 20;
                if (npk != null) {
                    if (npk.get("N") != null) n = (int) Math.round(((Number) npk.get("N")).doubleValue() / 2.471);
                    if (npk.get("P") != null) p = (int) Math.round(((Number) npk.get("P")).doubleValue() / 2.471);
                    if (npk.get("K") != null) k = (int) Math.round(((Number) npk.get("K")).doubleValue() / 2.471);
                }
                nutrient.setNitrogenKg(n);
                nutrient.setPhosphorusKg(p);
                nutrient.setPotassiumKg(k);
                nutrientRepo.save(nutrient);

                // Market Info
                CropMarketInfo market = marketRepo.findByCropId(crop.getId()).orElseGet(CropMarketInfo::new);
                market.setCrop(crop);
                market.setAverageMsp(2500.0);
                market.setMarketDemand(profitability != null ? (String) profitability.get("market_demand") : "High");
                market.setExportPotential("Medium");
                market.setPriceVolatility("Moderate");
                marketRepo.save(market);

                // Yield Info
                Map<String, Object> harvest = growingGuide != null ? (Map<String, Object>) growingGuide.get("harvest") : null;
                CropYieldInfo yield = yieldRepo.findByCropId(crop.getId()).orElseGet(CropYieldInfo::new);
                yield.setCrop(crop);
                
                double minQ = 10;
                double avgQ = 15;
                double maxQ = 20;
                if (harvest != null && harvest.get("yield_per_ha") != null) {
                    String yieldStr = (String) harvest.get("yield_per_ha");
                    yieldStr = yieldStr.replaceAll("[^0-9.–-]", "");
                    String[] parts = yieldStr.split("[–-]");
                    try {
                        double minHa = Double.parseDouble(parts[0]) * 10;
                        double maxHa = (parts.length == 2 ? Double.parseDouble(parts[1]) : Double.parseDouble(parts[0])) * 10;
                        double avgHa = (minHa + maxHa) / 2.0;
                        minQ = Math.round(minHa / 2.471);
                        avgQ = Math.round(avgHa / 2.471);
                        maxQ = Math.round(maxHa / 2.471);
                    } catch (Exception e) {}
                }
                yield.setMinimumQuintals(minQ);
                yield.setAverageQuintals(avgQ);
                yield.setBestPracticeQuintals(maxQ);
                yieldRepo.save(yield);

                // Post Harvest
                CropPostHarvest post = postHarvestRepo.findByCropId(crop.getId()).orElseGet(CropPostHarvest::new);
                post.setCrop(crop);
                post.setStorageMethod(harvest != null ? (String) harvest.get("post_harvest") : "Standard agricultural storage");
                post.setStorageDurationMonths(6);
                post.setProcessingRequired(true);
                postHarvestRepo.save(post);

                // AI Scores
                CropAiScore aiScore = aiScoreRepo.findByCropId(crop.getId()).orElseGet(CropAiScore::new);
                aiScore.setCrop(crop);
                aiScore.setClimateSuitabilityScore(85);
                aiScore.setSoilSuitabilityScore(85);
                aiScore.setProfitabilityScore(85);
                aiScore.setWaterEfficiencyScore(80);
                aiScore.setSustainabilityRating(8.0);
                aiScoreRepo.save(aiScore);

                // Diseases
                diseaseRepo.deleteAll(diseaseRepo.findByCropId(crop.getId()));
                Map<String, Object> pestDisease = growingGuide != null ? (Map<String, Object>) growingGuide.get("pest_disease") : null;
                List<Map<String, Object>> diseasesData = pestDisease != null ? (List<Map<String, Object>>) pestDisease.get("diseases") : null;
                if (diseasesData != null) {
                    for (Map<String, Object> d : diseasesData) {
                        CropDisease disease = new CropDisease();
                        disease.setCrop(crop);
                        disease.setName((String) d.get("name"));
                        disease.setSymptoms("Common disease symptom");
                        disease.setManagement((String) d.get("control"));
                        diseaseRepo.save(disease);
                    }
                }

                // Irrigation
                irrigationRepo.deleteAll(irrigationRepo.findByCropId(crop.getId()));
                Map<String, Object> irrigationMap = growingGuide != null ? (Map<String, Object>) growingGuide.get("irrigation") : null;
                List<String> irrigationData = irrigationMap != null ? (List<String>) irrigationMap.get("critical_stages") : null;
                if (irrigationData != null) {
                    for (String method : irrigationData) {
                        CropIrrigation irrigation = new CropIrrigation();
                        irrigation.setCrop(crop);
                        irrigation.setMethod(method);
                        irrigationRepo.save(irrigation);
                    }
                }

                // Districts
                districtRepo.deleteAll(districtRepo.findByCropId(crop.getId()));
                List<String> districtsList = (List<String>) data.get("recommended_districts_karnataka");
                if (districtsList != null) {
                    for (String dName : districtsList) {
                        CropDistrict district = new CropDistrict();
                        district.setCrop(crop);
                        district.setDistrictName(dName);
                        districtRepo.save(district);
                    }
                }

                // Growing Steps
                stepRepo.deleteAll(stepRepo.findByCropId(crop.getId()));
                List<String> soilPrep = growingGuide != null ? (List<String>) growingGuide.get("soil_preparation") : null;
                if (soilPrep != null) {
                    int idx = 1;
                    for (String stepStr : soilPrep) {
                        CropGrowingStep step = new CropGrowingStep();
                        step.setCrop(crop);
                        step.setStepNumber(idx++);
                        step.setTitle("Soil Preparation Step " + step.getStepNumber());
                        step.setDetails(stepStr);
                        stepRepo.save(step);
                    }
                }
            }
            System.out.println("✅ Production-grade Agricultural Dataset (Crops_data.json) Seeded Successfully!");
        } catch (Exception e) {
            System.err.println("❌ Error seeding dataset: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private Integer parseDurationDays(Object o) {
        if (o instanceof Integer) return (Integer) o;
        if (o instanceof String) {
            String s = (String) o;
            if (s.contains("-")) {
                String[] parts = s.split("-");
                try {
                    return (Integer.parseInt(parts[0].replaceAll("[^0-9]", "")) + 
                            Integer.parseInt(parts[1].replaceAll("[^0-9]", ""))) / 2;
                } catch (Exception e) {}
            }
            try {
                java.util.regex.Matcher m = java.util.regex.Pattern.compile("\\d+").matcher(s);
                if (m.find()) {
                    return Integer.parseInt(m.group());
                }
            } catch (Exception e) {}
        }
        return 120;
    }

    private Double parseCost(Map<String, Object> profitability, String key, Double defaultVal) {
        if (profitability == null) return defaultVal;
        Object val = profitability.get(key);
        if (val instanceof Number) return ((Number) val).doubleValue();
        if (val instanceof String) {
            String s = (String) val;
            s = s.replaceAll("[^0-9–-]", "");
            String[] parts = s.split("[–-]");
            try {
                double averageHa;
                if (parts.length == 2) {
                    averageHa = (Double.parseDouble(parts[0]) + Double.parseDouble(parts[1])) / 2.0;
                } else {
                    averageHa = Double.parseDouble(parts[0]);
                }
                return averageHa / 2.471;
            } catch (Exception e) {}
        }
        return defaultVal;
    }
}
