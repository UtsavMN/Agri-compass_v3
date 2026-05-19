package com.agricompass.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "weather_logs")
public class WeatherLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "farm_id", nullable = false)
    private Farm farm;

    @Column(name = "user_id", nullable = false)
    private String userId;

    private String notes;

    private Double temperature;

    private Double humidity;

    private String conditions;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public WeatherLog() {}

    public WeatherLog(String id, Farm farm, String userId, String notes, Double temperature, Double humidity, String conditions, LocalDateTime createdAt) {
        this.id = id;
        this.farm = farm;
        this.userId = userId;
        this.notes = notes;
        this.temperature = temperature;
        this.humidity = humidity;
        this.conditions = conditions;
        this.createdAt = createdAt;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public Farm getFarm() { return farm; }
    public void setFarm(Farm farm) { this.farm = farm; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public Double getTemperature() { return temperature; }
    public void setTemperature(Double temperature) { this.temperature = temperature; }

    public Double getHumidity() { return humidity; }
    public void setHumidity(Double humidity) { this.humidity = humidity; }

    public String getConditions() { return conditions; }
    public void setConditions(String conditions) { this.conditions = conditions; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public static WeatherLogBuilder builder() {
        return new WeatherLogBuilder();
    }

    public static class WeatherLogBuilder {
        private String id;
        private Farm farm;
        private String userId;
        private String notes;
        private Double temperature;
        private Double humidity;
        private String conditions;
        private LocalDateTime createdAt;

        WeatherLogBuilder() {}

        public WeatherLogBuilder id(String id) { this.id = id; return this; }
        public WeatherLogBuilder farm(Farm farm) { this.farm = farm; return this; }
        public WeatherLogBuilder userId(String userId) { this.userId = userId; return this; }
        public WeatherLogBuilder notes(String notes) { this.notes = notes; return this; }
        public WeatherLogBuilder temperature(Double temperature) { this.temperature = temperature; return this; }
        public WeatherLogBuilder humidity(Double humidity) { this.humidity = humidity; return this; }
        public WeatherLogBuilder conditions(String conditions) { this.conditions = conditions; return this; }
        public WeatherLogBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public WeatherLog build() {
            return new WeatherLog(id, farm, userId, notes, temperature, humidity, conditions, createdAt);
        }
    }
}
