package com.agricompass.entity;

import jakarta.persistence.*;

@Entity
@Table(
    name = "crop_recommendations",
    indexes = {
        @Index(name = "idx_district", columnList = "district")
    }
)
public class CropRecommendation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String district;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "crop_id", nullable = false)
    private Crop crop;

    public CropRecommendation() {}

    public CropRecommendation(Long id, String district, Crop crop) {
        this.id = id;
        this.district = district;
        this.crop = crop;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }

    public Crop getCrop() { return crop; }
    public void setCrop(Crop crop) { this.crop = crop; }

    public static CropRecommendationBuilder builder() {
        return new CropRecommendationBuilder();
    }

    public static class CropRecommendationBuilder {
        private Long id;
        private String district;
        private Crop crop;

        CropRecommendationBuilder() {}

        public CropRecommendationBuilder id(Long id) { this.id = id; return this; }
        public CropRecommendationBuilder district(String district) { this.district = district; return this; }
        public CropRecommendationBuilder crop(Crop crop) { this.crop = crop; return this; }

        public CropRecommendation build() {
            return new CropRecommendation(id, district, crop);
        }
    }
}
