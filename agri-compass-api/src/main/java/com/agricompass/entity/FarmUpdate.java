package com.agricompass.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Entity
@Table(name = "farm_updates")
public class FarmUpdate {

    @Id
    private String id;

    @Column(name = "farm_id", nullable = false)
    private String farmId;

    @Column(name = "clerk_user_id", nullable = false)
    private String clerkUserId;

    @Column(name = "post_text", nullable = false, columnDefinition = "TEXT")
    private String postText;

    @Column(name = "image_urls", columnDefinition = "TEXT")
    private String imageUrls; // comma separated string or JSON array

    @Column(name = "created_at", updatable = false)
    private String createdAt;

    @Column(name = "updated_at")
    private String updatedAt;

    public FarmUpdate() {}

    @PrePersist
    public void prePersist() {
        if (this.id == null) {
            this.id = UUID.randomUUID().toString();
        }
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);
        }
        this.updatedAt = this.createdAt;
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getFarmId() { return farmId; }
    public void setFarmId(String farmId) { this.farmId = farmId; }

    public String getClerkUserId() { return clerkUserId; }
    public void setClerkUserId(String clerkUserId) { this.clerkUserId = clerkUserId; }

    public String getPostText() { return postText; }
    public void setPostText(String postText) { this.postText = postText; }

    public String getImageUrls() { return imageUrls; }
    public void setImageUrls(String imageUrls) { this.imageUrls = imageUrls; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public String getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(String updatedAt) { this.updatedAt = updatedAt; }
}
