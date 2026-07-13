package com.agricompass.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "farms")
public class Farm {

    @Id
    private String id;

    @Column(name = "clerk_user_id", nullable = false)
    private String clerkUserId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "clerk_user_id", insertable = false, updatable = false)
    private UserProfile userProfile;

    @Column(name = "farm_name", nullable = false)
    private String farmName;

    private Double acres;

    private String district;

    @Column(name = "soil_type")
    private String soilType;

    @Column(name = "current_crop")
    private String currentCrop;

    @Column(name = "npk_n")
    private Double npkN;

    @Column(name = "npk_p")
    private Double npkP;

    @Column(name = "npk_k")
    private Double npkK;

    @Column(name = "created_at", insertable = false, updatable = false)
    private String createdAt;

    public Farm() {}

    @PrePersist
    public void generateId() {
        if (this.id == null) {
            this.id = java.util.UUID.randomUUID().toString();
        }
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getClerkUserId() { return clerkUserId; }
    public void setClerkUserId(String clerkUserId) { this.clerkUserId = clerkUserId; }

    public UserProfile getUserProfile() { return userProfile; }
    public void setUserProfile(UserProfile userProfile) { this.userProfile = userProfile; }

    public String getFarmName() { return farmName; }
    public void setFarmName(String farmName) { this.farmName = farmName; }

    public Double getAcres() { return acres; }
    public void setAcres(Double acres) { this.acres = acres; }

    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }

    public String getSoilType() { return soilType; }
    public void setSoilType(String soilType) { this.soilType = soilType; }

    public String getCurrentCrop() { return currentCrop; }
    public void setCurrentCrop(String currentCrop) { this.currentCrop = currentCrop; }

    public Double getNpkN() { return npkN; }
    public void setNpkN(Double npkN) { this.npkN = npkN; }

    public Double getNpkP() { return npkP; }
    public void setNpkP(Double npkP) { this.npkP = npkP; }

    public Double getNpkK() { return npkK; }
    public void setNpkK(Double npkK) { this.npkK = npkK; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    // --- Alias convenience methods for controller layer ---
    public String getUserId() { return clerkUserId; }
    public void setUserId(String userId) { this.clerkUserId = userId; }

    public String getName() { return farmName; }
    public void setName(String name) { this.farmName = name; }

    public String getLocation() { return district; }
    public void setLocation(String location) { this.district = location; }

    public Double getAreaAcres() { return acres; }
    public void setAreaAcres(Double areaAcres) { this.acres = areaAcres; }

    public String getIrrigationType() { return null; }
    public void setIrrigationType(String type) { }

    public java.util.List<?> getWeatherLogs() { return java.util.Collections.emptyList(); }
    public java.util.List<?> getImages() { return java.util.Collections.emptyList(); }

    // --- Builder ---
    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private String userId;
        private String name;
        private String location;
        private Double areaAcres;
        private String soilType;
        private String irrigationType;
        private String currentCrop;

        public Builder userId(String userId) { this.userId = userId; return this; }
        public Builder name(String name) { this.name = name; return this; }
        public Builder location(String location) { this.location = location; return this; }
        public Builder areaAcres(Double areaAcres) { this.areaAcres = areaAcres; return this; }
        public Builder soilType(String soilType) { this.soilType = soilType; return this; }
        public Builder irrigationType(String irrigationType) { this.irrigationType = irrigationType; return this; }
        public Builder currentCrop(String currentCrop) { this.currentCrop = currentCrop; return this; }

        public Farm build() {
            Farm farm = new Farm();
            farm.clerkUserId = this.userId;
            farm.farmName = this.name;
            farm.district = this.location;
            farm.acres = this.areaAcres;
            farm.soilType = this.soilType;
            farm.currentCrop = this.currentCrop;
            return farm;
        }
    }
}
