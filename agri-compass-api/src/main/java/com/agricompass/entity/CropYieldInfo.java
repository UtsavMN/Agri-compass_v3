package com.agricompass.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "crop_yield_info")
public class CropYieldInfo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "crop_id", referencedColumnName = "id", nullable = false)
    private Crop crop;

    @Column(name = "minimum_quintals")
    private Double minimumQuintals;

    @Column(name = "average_quintals")
    private Double averageQuintals;

    @Column(name = "best_practice_quintals")
    private Double bestPracticeQuintals;

    public CropYieldInfo() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Crop getCrop() { return crop; }
    public void setCrop(Crop crop) { this.crop = crop; }

    public Double getMinimumQuintals() { return minimumQuintals; }
    public void setMinimumQuintals(Double minimumQuintals) { this.minimumQuintals = minimumQuintals; }

    public Double getAverageQuintals() { return averageQuintals; }
    public void setAverageQuintals(Double averageQuintals) { this.averageQuintals = averageQuintals; }

    public Double getBestPracticeQuintals() { return bestPracticeQuintals; }
    public void setBestPracticeQuintals(Double bestPracticeQuintals) { this.bestPracticeQuintals = bestPracticeQuintals; }
}
