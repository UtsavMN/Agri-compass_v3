package com.agricompass.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "crop_ai_scores")
public class CropAiScore {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "crop_id", referencedColumnName = "id", nullable = false)
    private Crop crop;

    @Column(name = "climate_suitability_score")
    private Integer climateSuitabilityScore;

    @Column(name = "soil_suitability_score")
    private Integer soilSuitabilityScore;

    @Column(name = "profitability_score")
    private Integer profitabilityScore;

    @Column(name = "water_efficiency_score")
    private Integer waterEfficiencyScore;

    @Column(name = "sustainability_rating")
    private Double sustainabilityRating;

    public CropAiScore() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Crop getCrop() { return crop; }
    public void setCrop(Crop crop) { this.crop = crop; }

    public Integer getClimateSuitabilityScore() { return climateSuitabilityScore; }
    public void setClimateSuitabilityScore(Integer climateSuitabilityScore) { this.climateSuitabilityScore = climateSuitabilityScore; }

    public Integer getSoilSuitabilityScore() { return soilSuitabilityScore; }
    public void setSoilSuitabilityScore(Integer soilSuitabilityScore) { this.soilSuitabilityScore = soilSuitabilityScore; }

    public Integer getProfitabilityScore() { return profitabilityScore; }
    public void setProfitabilityScore(Integer profitabilityScore) { this.profitabilityScore = profitabilityScore; }

    public Integer getWaterEfficiencyScore() { return waterEfficiencyScore; }
    public void setWaterEfficiencyScore(Integer waterEfficiencyScore) { this.waterEfficiencyScore = waterEfficiencyScore; }

    public Double getSustainabilityRating() { return sustainabilityRating; }
    public void setSustainabilityRating(Double sustainabilityRating) { this.sustainabilityRating = sustainabilityRating; }
}
