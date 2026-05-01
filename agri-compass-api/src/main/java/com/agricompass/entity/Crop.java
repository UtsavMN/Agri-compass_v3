package com.agricompass.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(
    name = "crops",
    indexes = {
        @Index(name = "idx_crop_name", columnList = "name"),
        @Index(name = "idx_crop_district", columnList = "district")
    }
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Crop {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Basic Info
    @Column(nullable = false)
    private String name;

    @Column
    private String district;

    @Column
    private String season;

    // Duration & Economics
    @Column(name = "duration_days")
    private Integer durationDays;

    @Column(name = "investment_per_acre")
    private Double investmentPerAcre;

    @Column(name = "expected_returns")
    private Double expectedReturns;

    @Column(name = "breakeven_months")
    private Integer breakevenMonths;

    // Environmental Conditions
    @Column(name = "soil_type")
    private String soilType;

    @Column(name = "rainfall_mm")
    private String rainfallMm;

    @Column(name = "weather_pattern")
    private String weatherPattern;

    // ✅ FIXED (Required by your code)
    @Column(name = "water_requirement")
    private String waterRequirement;

    @Column(name = "temperature_range")
    private String temperatureRange;

    // Guidelines (large text)
    @Column(columnDefinition = "TEXT")
    private String guidelines;

    // Image
    @Column(name = "image_url")
    private String imageUrl;
}
