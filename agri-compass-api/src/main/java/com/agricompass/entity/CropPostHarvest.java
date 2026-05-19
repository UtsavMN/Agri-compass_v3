package com.agricompass.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "crop_post_harvest")
public class CropPostHarvest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "crop_id", referencedColumnName = "id", nullable = false)
    private Crop crop;

    @Column(name = "storage_method")
    private String storageMethod;

    @Column(name = "storage_duration_months")
    private Integer storageDurationMonths;

    @Column(name = "processing_required")
    private Boolean processingRequired;

    public CropPostHarvest() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Crop getCrop() { return crop; }
    public void setCrop(Crop crop) { this.crop = crop; }

    public String getStorageMethod() { return storageMethod; }
    public void setStorageMethod(String storageMethod) { this.storageMethod = storageMethod; }

    public Integer getStorageDurationMonths() { return storageDurationMonths; }
    public void setStorageDurationMonths(Integer storageDurationMonths) { this.storageDurationMonths = storageDurationMonths; }

    public Boolean getProcessingRequired() { return processingRequired; }
    public void setProcessingRequired(Boolean processingRequired) { this.processingRequired = processingRequired; }
}
