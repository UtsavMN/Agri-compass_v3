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
}
