package com.agricompass.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "farms")
public class Farm {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "user_id", nullable = false)
    private String userId;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String location;

    @Column(name = "area_acres")
    private Double areaAcres;

    @Column(name = "soil_type")
    private String soilType;

    @Column(name = "irrigation_type")
    private String irrigationType;

    @Column(name = "current_crop")
    private String currentCrop;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @JsonIgnore
    @OneToMany(mappedBy = "farm", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<WeatherLog> weatherLogs = new ArrayList<>();

    @JsonIgnore
    @OneToMany(mappedBy = "farm", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<FarmImage> images = new ArrayList<>();

    public Farm() {}

    public Farm(String id, String userId, String name, String location, Double areaAcres, String soilType, String irrigationType, String currentCrop, LocalDateTime createdAt, LocalDateTime updatedAt, List<WeatherLog> weatherLogs, List<FarmImage> images) {
        this.id = id;
        this.userId = userId;
        this.name = name;
        this.location = location;
        this.areaAcres = areaAcres;
        this.soilType = soilType;
        this.irrigationType = irrigationType;
        this.currentCrop = currentCrop;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.weatherLogs = weatherLogs != null ? weatherLogs : new ArrayList<>();
        this.images = images != null ? images : new ArrayList<>();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public Double getAreaAcres() { return areaAcres; }
    public void setAreaAcres(Double areaAcres) { this.areaAcres = areaAcres; }

    public String getSoilType() { return soilType; }
    public void setSoilType(String soilType) { this.soilType = soilType; }

    public String getIrrigationType() { return irrigationType; }
    public void setIrrigationType(String irrigationType) { this.irrigationType = irrigationType; }

    public String getCurrentCrop() { return currentCrop; }
    public void setCurrentCrop(String currentCrop) { this.currentCrop = currentCrop; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public List<WeatherLog> getWeatherLogs() { return weatherLogs; }
    public void setWeatherLogs(List<WeatherLog> weatherLogs) { this.weatherLogs = weatherLogs; }

    public List<FarmImage> getImages() { return images; }
    public void setImages(List<FarmImage> images) { this.images = images; }

    public static FarmBuilder builder() {
        return new FarmBuilder();
    }

    public static class FarmBuilder {
        private String id;
        private String userId;
        private String name;
        private String location;
        private Double areaAcres;
        private String soilType;
        private String irrigationType;
        private String currentCrop;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private List<WeatherLog> weatherLogs;
        private List<FarmImage> images;

        FarmBuilder() {}

        public FarmBuilder id(String id) { this.id = id; return this; }
        public FarmBuilder userId(String userId) { this.userId = userId; return this; }
        public FarmBuilder name(String name) { this.name = name; return this; }
        public FarmBuilder location(String location) { this.location = location; return this; }
        public FarmBuilder areaAcres(Double areaAcres) { this.areaAcres = areaAcres; return this; }
        public FarmBuilder soilType(String soilType) { this.soilType = soilType; return this; }
        public FarmBuilder irrigationType(String irrigationType) { this.irrigationType = irrigationType; return this; }
        public FarmBuilder currentCrop(String currentCrop) { this.currentCrop = currentCrop; return this; }
        public FarmBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public FarmBuilder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }
        public FarmBuilder weatherLogs(List<WeatherLog> weatherLogs) { this.weatherLogs = weatherLogs; return this; }
        public FarmBuilder images(List<FarmImage> images) { this.images = images; return this; }

        public Farm build() {
            return new Farm(id, userId, name, location, areaAcres, soilType, irrigationType, currentCrop, createdAt, updatedAt, weatherLogs, images);
        }
    }
}
