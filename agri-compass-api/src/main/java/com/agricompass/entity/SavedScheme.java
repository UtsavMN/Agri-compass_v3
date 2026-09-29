package com.agricompass.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "saved_schemes")
public class SavedScheme {

    @Id
    private String id;

    @Column(name = "clerk_user_id", nullable = false)
    private String clerkUserId;

    @Column(name = "scheme_id", nullable = false)
    private String schemeId;

    @Column(name = "created_at", updatable = false)
    private String createdAt;

    public SavedScheme() {}

    @PrePersist
    public void generateId() {
        if (this.id == null) {
            this.id = java.util.UUID.randomUUID().toString();
        }
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now().toString();
        }
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getClerkUserId() { return clerkUserId; }
    public void setClerkUserId(String clerkUserId) { this.clerkUserId = clerkUserId; }
    
    public String getSchemeId() { return schemeId; }
    public void setSchemeId(String schemeId) { this.schemeId = schemeId; }
    
    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}
