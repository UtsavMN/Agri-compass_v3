package com.agricompass.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "farm_images")
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

    public FarmImage() {}

    public FarmImage(String id, Farm farm, String userId, String imageUrl, String caption, LocalDateTime createdAt) {
        this.id = id;
        this.farm = farm;
        this.userId = userId;
        this.imageUrl = imageUrl;
        this.caption = caption;
        this.createdAt = createdAt;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public Farm getFarm() { return farm; }
    public void setFarm(Farm farm) { this.farm = farm; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getCaption() { return caption; }
    public void setCaption(String caption) { this.caption = caption; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public static FarmImageBuilder builder() {
        return new FarmImageBuilder();
    }

    public static class FarmImageBuilder {
        private String id;
        private Farm farm;
        private String userId;
        private String imageUrl;
        private String caption;
        private LocalDateTime createdAt;

        FarmImageBuilder() {}

        public FarmImageBuilder id(String id) { this.id = id; return this; }
        public FarmImageBuilder farm(Farm farm) { this.farm = farm; return this; }
        public FarmImageBuilder userId(String userId) { this.userId = userId; return this; }
        public FarmImageBuilder imageUrl(String imageUrl) { this.imageUrl = imageUrl; return this; }
        public FarmImageBuilder caption(String caption) { this.caption = caption; return this; }
        public FarmImageBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public FarmImage build() {
            return new FarmImage(id, farm, userId, imageUrl, caption, createdAt);
        }
    }
}
