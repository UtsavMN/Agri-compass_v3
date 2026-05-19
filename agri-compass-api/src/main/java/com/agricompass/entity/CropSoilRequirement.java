package com.agricompass.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "crop_soil_requirements")
public class CropSoilRequirement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "crop_id", referencedColumnName = "id", nullable = false)
    private Crop crop;

    @Column(name = "ph_range")
    private String phRange;

    @Column(name = "organic_carbon")
    private String organicCarbon;

    @Column(name = "green_manure")
    private Boolean greenManure;

    @Column(name = "crop_rotation")
    private String cropRotation;

    @Column(name = "mulching")
    private Boolean mulching;

    public CropSoilRequirement() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Crop getCrop() { return crop; }
    public void setCrop(Crop crop) { this.crop = crop; }

    public String getPhRange() { return phRange; }
    public void setPhRange(String phRange) { this.phRange = phRange; }

    public String getOrganicCarbon() { return organicCarbon; }
    public void setOrganicCarbon(String organicCarbon) { this.organicCarbon = organicCarbon; }

    public Boolean getGreenManure() { return greenManure; }
    public void setGreenManure(Boolean greenManure) { this.greenManure = greenManure; }

    public String getCropRotation() { return cropRotation; }
    public void setCropRotation(String cropRotation) { this.cropRotation = cropRotation; }

    public Boolean getMulching() { return mulching; }
    public void setMulching(Boolean mulching) { this.mulching = mulching; }
}
