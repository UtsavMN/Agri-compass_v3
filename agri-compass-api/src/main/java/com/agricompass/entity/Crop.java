package com.agricompass.entity;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(
    name = "crops",
    indexes = {
        @Index(name = "idx_crop_name", columnList = "name"),
        @Index(name = "idx_crop_district", columnList = "district")
    }
)
public class Crop {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column
    private String district;

    @Column
    private String season;

    @Column(name = "duration_days")
    private Integer durationDays;

    @Column(name = "investment_per_acre")
    private Double investmentPerAcre;

    @Column(name = "expected_returns")
    private Double expectedReturns;

    @Column(name = "breakeven_months")
    private Integer breakevenMonths;

    @Column(name = "soil_type")
    private String soilType;

    @Column(name = "rainfall_mm")
    private String rainfallMm;

    @Column(name = "weather_pattern")
    private String weatherPattern;

    @Column(name = "water_requirement")
    private String waterRequirement;

    @Column(name = "temperature_range")
    private String temperatureRange;

    @Column(columnDefinition = "TEXT")
    private String guidelines;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "scientific_name")
    private String scientificName;

    @Column(name = "difficulty_level")
    private String difficultyLevel;

    @OneToOne(mappedBy = "crop", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private CropSoilRequirement soilRequirement;

    @OneToOne(mappedBy = "crop", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private CropNutrient nutrient;

    @OneToMany(mappedBy = "crop", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<CropDisease> diseases;

    @OneToMany(mappedBy = "crop", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<CropIrrigation> irrigations;

    @OneToOne(mappedBy = "crop", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private CropMarketInfo marketInfo;

    @OneToOne(mappedBy = "crop", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private CropYieldInfo yieldInfo;

    @OneToOne(mappedBy = "crop", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private CropPostHarvest postHarvest;

    @OneToOne(mappedBy = "crop", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private CropAiScore aiScore;

    @OneToMany(mappedBy = "crop", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<CropGrowingStep> growingSteps;

    @OneToMany(mappedBy = "crop", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<CropDistrict> recommendedDistricts;

    public Crop() {}

    public Crop(Long id, String name, String district, String season, Integer durationDays, Double investmentPerAcre, Double expectedReturns, Integer breakevenMonths, String soilType, String rainfallMm, String weatherPattern, String waterRequirement, String temperatureRange, String guidelines, String imageUrl, String scientificName, String difficultyLevel) {
        this.id = id;
        this.name = name;
        this.district = district;
        this.season = season;
        this.durationDays = durationDays;
        this.investmentPerAcre = investmentPerAcre;
        this.expectedReturns = expectedReturns;
        this.breakevenMonths = breakevenMonths;
        this.soilType = soilType;
        this.rainfallMm = rainfallMm;
        this.weatherPattern = weatherPattern;
        this.waterRequirement = waterRequirement;
        this.temperatureRange = temperatureRange;
        this.guidelines = guidelines;
        this.imageUrl = imageUrl;
        this.scientificName = scientificName;
        this.difficultyLevel = difficultyLevel;
    }

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

    public String getScientificName() { return scientificName; }
    public void setScientificName(String scientificName) { this.scientificName = scientificName; }

    public String getDifficultyLevel() { return difficultyLevel; }
    public void setDifficultyLevel(String difficultyLevel) { this.difficultyLevel = difficultyLevel; }

    public CropSoilRequirement getSoilRequirement() { return soilRequirement; }
    public void setSoilRequirement(CropSoilRequirement soilRequirement) { this.soilRequirement = soilRequirement; }

    public CropNutrient getNutrient() { return nutrient; }
    public void setNutrient(CropNutrient nutrient) { this.nutrient = nutrient; }

    public List<CropDisease> getDiseases() { return diseases; }
    public void setDiseases(List<CropDisease> diseases) { this.diseases = diseases; }

    public List<CropIrrigation> getIrrigations() { return irrigations; }
    public void setIrrigations(List<CropIrrigation> irrigations) { this.irrigations = irrigations; }

    public CropMarketInfo getMarketInfo() { return marketInfo; }
    public void setMarketInfo(CropMarketInfo marketInfo) { this.marketInfo = marketInfo; }

    public CropYieldInfo getYieldInfo() { return yieldInfo; }
    public void setYieldInfo(CropYieldInfo yieldInfo) { this.yieldInfo = yieldInfo; }

    public CropPostHarvest getPostHarvest() { return postHarvest; }
    public void setPostHarvest(CropPostHarvest postHarvest) { this.postHarvest = postHarvest; }

    public CropAiScore getAiScore() { return aiScore; }
    public void setAiScore(CropAiScore aiScore) { this.aiScore = aiScore; }

    public List<CropGrowingStep> getGrowingSteps() { return growingSteps; }
    public void setGrowingSteps(List<CropGrowingStep> growingSteps) { this.growingSteps = growingSteps; }

    public List<CropDistrict> getRecommendedDistricts() { return recommendedDistricts; }
    public void setRecommendedDistricts(List<CropDistrict> recommendedDistricts) { this.recommendedDistricts = recommendedDistricts; }

    public static CropBuilder builder() {
        return new CropBuilder();
    }

    public static class CropBuilder {
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

        CropBuilder() {}

        public CropBuilder id(Long id) { this.id = id; return this; }
        public CropBuilder name(String name) { this.name = name; return this; }
        public CropBuilder district(String district) { this.district = district; return this; }
        public CropBuilder season(String season) { this.season = season; return this; }
        public CropBuilder durationDays(Integer durationDays) { this.durationDays = durationDays; return this; }
        public CropBuilder investmentPerAcre(Double investmentPerAcre) { this.investmentPerAcre = investmentPerAcre; return this; }
        public CropBuilder expectedReturns(Double expectedReturns) { this.expectedReturns = expectedReturns; return this; }
        public CropBuilder breakevenMonths(Integer breakevenMonths) { this.breakevenMonths = breakevenMonths; return this; }
        public CropBuilder soilType(String soilType) { this.soilType = soilType; return this; }
        public CropBuilder rainfallMm(String rainfallMm) { this.rainfallMm = rainfallMm; return this; }
        public CropBuilder weatherPattern(String weatherPattern) { this.weatherPattern = weatherPattern; return this; }
        public CropBuilder waterRequirement(String waterRequirement) { this.waterRequirement = waterRequirement; return this; }
        public CropBuilder temperatureRange(String temperatureRange) { this.temperatureRange = temperatureRange; return this; }
        public CropBuilder guidelines(String guidelines) { this.guidelines = guidelines; return this; }
        public CropBuilder imageUrl(String imageUrl) { this.imageUrl = imageUrl; return this; }
        public CropBuilder scientificName(String scientificName) { this.scientificName = scientificName; return this; }
        public CropBuilder difficultyLevel(String difficultyLevel) { this.difficultyLevel = difficultyLevel; return this; }

        public Crop build() {
            return new Crop(id, name, district, season, durationDays, investmentPerAcre, expectedReturns, breakevenMonths, soilType, rainfallMm, weatherPattern, waterRequirement, temperatureRange, guidelines, imageUrl, scientificName, difficultyLevel);
        }
    }
}
