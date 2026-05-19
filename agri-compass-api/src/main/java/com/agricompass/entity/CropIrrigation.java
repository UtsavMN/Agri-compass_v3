package com.agricompass.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "crop_irrigation")
public class CropIrrigation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "crop_id", referencedColumnName = "id", nullable = false)
    private Crop crop;

    @Column(nullable = false)
    private String method;

    public CropIrrigation() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Crop getCrop() { return crop; }
    public void setCrop(Crop crop) { this.crop = crop; }

    public String getMethod() { return method; }
    public void setMethod(String method) { this.method = method; }
}
