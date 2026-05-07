package com.agricompass.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "fertilizer_analyses")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FertilizerAnalysis {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "farm_id", nullable = false)
    private String farmId;

    @Column(nullable = false)
    private String crop;

    @Column(name = "soil_n")
    private Double soilN;

    @Column(name = "soil_p")
    private Double soilP;

    @Column(name = "soil_k")
    private Double soilK;

    @Column(name = "soil_level")
    private String soilLevel;

    @Column(name = "soil_ph")
    private String soilPh;

    @Column(name = "growth_stage")
    private String growthStage;

    @Column(name = "result_json", columnDefinition = "TEXT")
    private String resultJson;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
