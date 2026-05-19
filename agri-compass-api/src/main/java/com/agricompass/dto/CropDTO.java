package com.agricompass.dto;

import java.util.List;

public class CropDTO {
    private Long id;
    private String name;
    private String district;
    private String season;
    private Integer durationDays;
    private Double investmentPerAcre;
    private Double expectedReturns;
    private Integer breakevenMonths;
    private String soilType;
    private String rainfallMm;
    private String weatherPattern;
    private String waterRequirement;
    private String temperatureRange;
    private String guidelines;
    private String imageUrl;
    private String scientificName;
    private String difficultyLevel;
    
    private SoilRequirementDTO soilRequirement;
    private NutrientDTO nutrient;
    private List<DiseaseDTO> diseases;
    private List<String> irrigations;
    private MarketInfoDTO marketInfo;
    private YieldInfoDTO yieldInfo;
    private PostHarvestDTO postHarvest;
    private AiScoreDTO aiScore;
    private List<GrowingStepDTO> growingSteps;
    private List<String> recommendedDistricts;

    public static class SoilRequirementDTO {
        public String phRange;
        public String organicCarbon;
        public Boolean greenManure;
        public String cropRotation;
        public Boolean mulching;
    }

    public static class NutrientDTO {
        public Integer nitrogenKg;
        public Integer phosphorusKg;
        public Integer potassiumKg;
    }

    public static class DiseaseDTO {
        public String name;
        public String symptoms;
        public String management;
    }

    public static class MarketInfoDTO {
        public Double averageMsp;
        public String marketDemand;
        public String exportPotential;
        public String priceVolatility;
    }

    public static class YieldInfoDTO {
        public Double minimumQuintals;
        public Double averageQuintals;
        public Double bestPracticeQuintals;
    }

    public static class PostHarvestDTO {
        public String storageMethod;
        public Integer storageDurationMonths;
        public Boolean processingRequired;
    }

    public static class AiScoreDTO {
        public Integer climateSuitabilityScore;
        public Integer soilSuitabilityScore;
        public Integer profitabilityScore;
        public Integer waterEfficiencyScore;
        public Double sustainabilityRating;
    }

    public static class GrowingStepDTO {
        public Integer stepNumber;
        public String title;
        public String details;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }
    public String getSeason() { return season; }
    public void setSeason(String season) { this.season = season; }
    public Integer getDurationDays() { return durationDays; }
    public void setDurationDays(Integer durationDays) { this.durationDays = durationDays; }
    public Double getInvestmentPerAcre() { return investmentPerAcre; }
    public void setInvestmentPerAcre(Double investmentPerAcre) { this.investmentPerAcre = investmentPerAcre; }
    public Double getExpectedReturns() { return expectedReturns; }
    public void setExpectedReturns(Double expectedReturns) { this.expectedReturns = expectedReturns; }
    public Integer getBreakevenMonths() { return breakevenMonths; }
    public void setBreakevenMonths(Integer breakevenMonths) { this.breakevenMonths = breakevenMonths; }
    public String getSoilType() { return soilType; }
    public void setSoilType(String soilType) { this.soilType = soilType; }
    public String getRainfallMm() { return rainfallMm; }
    public void setRainfallMm(String rainfallMm) { this.rainfallMm = rainfallMm; }
    public String getWeatherPattern() { return weatherPattern; }
    public void setWeatherPattern(String weatherPattern) { this.weatherPattern = weatherPattern; }
    public String getWaterRequirement() { return waterRequirement; }
    public void setWaterRequirement(String waterRequirement) { this.waterRequirement = waterRequirement; }
    public String getTemperatureRange() { return temperatureRange; }
    public void setTemperatureRange(String temperatureRange) { this.temperatureRange = temperatureRange; }
    public String getGuidelines() { return guidelines; }
    public void setGuidelines(String guidelines) { this.guidelines = guidelines; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public SoilRequirementDTO getSoilRequirement() { return soilRequirement; }
    public void setSoilRequirement(SoilRequirementDTO soilRequirement) { this.soilRequirement = soilRequirement; }
    public NutrientDTO getNutrient() { return nutrient; }
    public void setNutrient(NutrientDTO nutrient) { this.nutrient = nutrient; }
    public List<DiseaseDTO> getDiseases() { return diseases; }
    public void setDiseases(List<DiseaseDTO> diseases) { this.diseases = diseases; }
    public List<String> getIrrigations() { return irrigations; }
    public void setIrrigations(List<String> irrigations) { this.irrigations = irrigations; }
    public MarketInfoDTO getMarketInfo() { return marketInfo; }
    public void setMarketInfo(MarketInfoDTO marketInfo) { this.marketInfo = marketInfo; }
    public YieldInfoDTO getYieldInfo() { return yieldInfo; }
    public void setYieldInfo(YieldInfoDTO yieldInfo) { this.yieldInfo = yieldInfo; }
    public PostHarvestDTO getPostHarvest() { return postHarvest; }
    public void setPostHarvest(PostHarvestDTO postHarvest) { this.postHarvest = postHarvest; }
    public AiScoreDTO getAiScore() { return aiScore; }
    public void setAiScore(AiScoreDTO aiScore) { this.aiScore = aiScore; }
    public List<GrowingStepDTO> getGrowingSteps() { return growingSteps; }
    public void setGrowingSteps(List<GrowingStepDTO> growingSteps) { this.growingSteps = growingSteps; }
    public List<String> getRecommendedDistricts() { return recommendedDistricts; }
    public void setRecommendedDistricts(List<String> recommendedDistricts) { this.recommendedDistricts = recommendedDistricts; }
    public String getScientificName() { return scientificName; }
    public void setScientificName(String scientificName) { this.scientificName = scientificName; }
    public String getDifficultyLevel() { return difficultyLevel; }
    public void setDifficultyLevel(String difficultyLevel) { this.difficultyLevel = difficultyLevel; }
}
