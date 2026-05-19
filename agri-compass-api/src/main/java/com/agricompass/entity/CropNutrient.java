package com.agricompass.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "crop_nutrients")
public class CropNutrient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "crop_id", referencedColumnName = "id", nullable = false)
    private Crop crop;

    @Column(name = "nitrogen_kg")
    private Integer nitrogenKg;

    @Column(name = "phosphorus_kg")
    private Integer phosphorusKg;

    @Column(name = "potassium_kg")
    private Integer potassiumKg;

    public CropNutrient() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Crop getCrop() { return crop; }
    public void setCrop(Crop crop) { this.crop = crop; }

    public Integer getNitrogenKg() { return nitrogenKg; }
    public void setNitrogenKg(Integer nitrogenKg) { this.nitrogenKg = nitrogenKg; }

    public Integer getPhosphorusKg() { return phosphorusKg; }
    public void setPhosphorusKg(Integer phosphorusKg) { this.phosphorusKg = phosphorusKg; }

    public Integer getPotassiumKg() { return potassiumKg; }
    public void setPotassiumKg(Integer potassiumKg) { this.potassiumKg = potassiumKg; }
}
