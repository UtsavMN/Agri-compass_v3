package com.agricompass.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "fertilizer_analyses")
public class FertilizerAnalysis {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "farm_id", nullable = false)
    private String farmId;

    @Column(nullable = false)
    private String crop;

    @Column(name = "soil_n")
    private Double soilN;

    @Column(name = "soil_p")
    private Double soilP;

    @Column(name = "soil_k")
    private Double soilK;

    @Column(name = "soil_level")
    private String soilLevel;

    @Column(name = "soil_ph")
    private String soilPh;

    @Column(name = "growth_stage")
    private String growthStage;

    @Column(name = "result_json", columnDefinition = "TEXT")
    private String resultJson;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public FertilizerAnalysis() {}

    public FertilizerAnalysis(String id, String farmId, String crop, Double soilN, Double soilP, Double soilK, String soilLevel, String soilPh, String growthStage, String resultJson, LocalDateTime createdAt) {
        this.id = id;
        this.farmId = farmId;
        this.crop = crop;
        this.soilN = soilN;
        this.soilP = soilP;
        this.soilK = soilK;
        this.soilLevel = soilLevel;
        this.soilPh = soilPh;
        this.growthStage = growthStage;
        this.resultJson = resultJson;
        this.createdAt = createdAt;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getFarmId() { return farmId; }
    public void setFarmId(String farmId) { this.farmId = farmId; }

    public String getCrop() { return crop; }
    public void setCrop(String crop) { this.crop = crop; }

    public Double getSoilN() { return soilN; }
    public void setSoilN(Double soilN) { this.soilN = soilN; }

    public Double getSoilP() { return soilP; }
    public void setSoilP(Double soilP) { this.soilP = soilP; }

    public Double getSoilK() { return soilK; }
    public void setSoilK(Double soilK) { this.soilK = soilK; }

    public String getSoilLevel() { return soilLevel; }
    public void setSoilLevel(String soilLevel) { this.soilLevel = soilLevel; }

    public String getSoilPh() { return soilPh; }
    public void setSoilPh(String soilPh) { this.soilPh = soilPh; }

    public String getGrowthStage() { return growthStage; }
    public void setGrowthStage(String growthStage) { this.growthStage = growthStage; }

    public String getResultJson() { return resultJson; }
    public void setResultJson(String resultJson) { this.resultJson = resultJson; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public static FertilizerAnalysisBuilder builder() {
        return new FertilizerAnalysisBuilder();
    }

    public static class FertilizerAnalysisBuilder {
        private String id;
        private String farmId;
        private String crop;
        private Double soilN;
        private Double soilP;
        private Double soilK;
        private String soilLevel;
        private String soilPh;
        private String growthStage;
        private String resultJson;
        private LocalDateTime createdAt;

        FertilizerAnalysisBuilder() {}

        public FertilizerAnalysisBuilder id(String id) { this.id = id; return this; }
        public FertilizerAnalysisBuilder farmId(String farmId) { this.farmId = farmId; return this; }
        public FertilizerAnalysisBuilder crop(String crop) { this.crop = crop; return this; }
        public FertilizerAnalysisBuilder soilN(Double soilN) { this.soilN = soilN; return this; }
        public FertilizerAnalysisBuilder soilP(Double soilP) { this.soilP = soilP; return this; }
        public FertilizerAnalysisBuilder soilK(Double soilK) { this.soilK = soilK; return this; }
        public FertilizerAnalysisBuilder soilLevel(String soilLevel) { this.soilLevel = soilLevel; return this; }
        public FertilizerAnalysisBuilder soilPh(String soilPh) { this.soilPh = soilPh; return this; }
        public FertilizerAnalysisBuilder growthStage(String growthStage) { this.growthStage = growthStage; return this; }
        public FertilizerAnalysisBuilder resultJson(String resultJson) { this.resultJson = resultJson; return this; }
        public FertilizerAnalysisBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public FertilizerAnalysis build() {
            return new FertilizerAnalysis(id, farmId, crop, soilN, soilP, soilK, soilLevel, soilPh, growthStage, resultJson, createdAt);
        }
    }
}
