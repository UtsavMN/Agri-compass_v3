package com.agricompass.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "crop_diseases")
public class CropDisease {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "crop_id", referencedColumnName = "id", nullable = false)
    private Crop crop;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String symptoms;

    @Column(columnDefinition = "TEXT")
    private String management;

    public CropDisease() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Crop getCrop() { return crop; }
    public void setCrop(Crop crop) { this.crop = crop; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getSymptoms() { return symptoms; }
    public void setSymptoms(String symptoms) { this.symptoms = symptoms; }

    public String getManagement() { return management; }
    public void setManagement(String management) { this.management = management; }
}
