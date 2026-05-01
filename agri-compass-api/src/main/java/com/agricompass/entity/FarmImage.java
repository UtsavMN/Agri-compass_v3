package com.agricompass.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "farm_images")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FarmImage {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "farm_id", nullable = false)
    private Farm farm;

    @Column(name = "user_id", nullable = false)
    private String userId;

    @Column(name = "image_url", nullable = false)
    private String imageUrl;

    private String caption;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
