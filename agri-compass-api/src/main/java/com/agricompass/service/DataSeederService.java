package com.agricompass.service;

import com.agricompass.entity.Crop;
import com.agricompass.entity.CropEconomics;
import com.agricompass.repository.CropEconomicsRepository;
import com.agricompass.repository.CropRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@Transactional
public class DataSeederService {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(DataSeederService.class);

    private final CropRepository cropRepository;
    private final CropEconomicsRepository cropEconomicsRepository;
    private final ObjectMapper objectMapper;

    public DataSeederService(CropRepository cropRepository, 
                            CropEconomicsRepository cropEconomicsRepository) {
        this.cropRepository = cropRepository;
        this.cropEconomicsRepository = cropEconomicsRepository;
        this.objectMapper = new ObjectMapper();
    }

    // @PostConstruct -- Disabled: DatabaseSeeder (CommandLineRunner) handles all seeding
    public void seedData() {
        try {
            log.info("Starting data seeding process...");
            ClassPathResource resource = new ClassPathResource("dataset/Crops_data.json");
            InputStream inputStream = resource.getInputStream();
            List<Map<String, Object>> cropsList = objectMapper.readValue(inputStream, 
                new TypeReference<List<Map<String, Object>>>() {});

            for (Map<String, Object> data : cropsList) {
                String displayName = (String) data.get("name");
                if (displayName == null || displayName.trim().isEmpty()) continue;
                
                Optional<Crop> existingCrop = cropRepository.findByNameIgnoreCase(displayName);
                
                Crop crop;
                if (existingCrop.isEmpty()) {
                    log.info("Seeding new crop: {}", displayName);
                    crop = new Crop();
                    crop.setName(displayName);
                    populateCropData(crop, data);
                    crop = cropRepository.save(crop);
                } else {
                    crop = existingCrop.get();
                    log.debug("Updating existing crop: {}", displayName);
                    populateCropData(crop, data);
                    crop = cropRepository.save(crop);
                }
                
                seedEconomics(crop, data);
            }
            log.info("Data seeding completed successfully. Total crops: {}", cropsList.size());
        } catch (Exception e) {
            log.error("Failed to seed crop data", e);
        }
    }

    private void populateCropData(Crop crop, Map<String, Object> data) {
        List<String> seasonList = (List<String>) data.get("season");
        crop.setSeason(seasonList != null ? String.join(", ", seasonList) : "Annual");
        
        crop.setDurationDays(parseDurationDays(data.get("duration_days")));
        
        Map<String, Object> growingGuide = (Map<String, Object>) data.get("growing_guide");
        Map<String, Object> profitability = growingGuide != null ? (Map<String, Object>) growingGuide.get("profitability") : null;
        
        double cost = parseCost(profitability, "input_cost_per_ha", 15000.0);
        double profit = parseCost(profitability, "net_profit", 30000.0);
        
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
    }

    private void seedEconomics(Crop crop, Map<String, Object> data) {
        Optional<CropEconomics> existingEco = cropEconomicsRepository.findByCropId(crop.getId());
        CropEconomics eco = existingEco.orElse(new CropEconomics());
        
        eco.setCrop(crop);
        
        double cost = crop.getInvestmentPerAcre();
        double returns = crop.getExpectedReturns();
        
        eco.setInvestmentPerAcre(cost);
        eco.setExpectedReturn(returns);
        
        if (eco.getMarketPrice() == null) eco.setMarketPrice(2500.0); 
        if (eco.getYieldQuintal() == null) eco.setYieldQuintal(returns / 2500.0);
        if (eco.getProfitMargin() == null) eco.setProfitMargin(returns - cost);
        
        cropEconomicsRepository.save(eco);
    }

    private Integer parseDurationDays(Object o) {
        if (o instanceof Integer) return (Integer) o;
        if (o instanceof String) {
            String s = (String) o;
            if (s.contains("-")) {
                String[] parts = s.split("-");
                try {
                    return (Integer.parseInt(parts[0].trim()) + Integer.parseInt(parts[1].trim())) / 2;
                } catch (Exception e) {}
            }
            try {
                return Integer.parseInt(s.replaceAll("[^0-9]", ""));
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
