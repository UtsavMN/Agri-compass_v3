package com.agricompass.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "community_posts")
public class Post {

    @Id
    @Column(nullable = false)
    private String id;

    @Column(name = "clerk_user_id", nullable = false)
    private String clerkUserId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "clerk_user_id", insertable = false, updatable = false)
    private UserProfile userProfile;

    @Column(nullable = false)
    private String content;

    private String category = "GENERAL";

    private String district;

    @Column(name = "likes_count")
    private Integer likesCount = 0;

    @Column(name = "created_at", insertable = false, updatable = false)
    private String createdAt;

    public Post() {}

    @PrePersist
    public void generateId() {
        if (this.id == null) {
            this.id = java.util.UUID.randomUUID().toString();
        }
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getClerkUserId() { return clerkUserId; }
    public void setClerkUserId(String clerkUserId) { this.clerkUserId = clerkUserId; }

    public UserProfile getUserProfile() { return userProfile; }
    public void setUserProfile(UserProfile userProfile) { this.userProfile = userProfile; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }

    public Integer getLikesCount() { return likesCount; }
    public void setLikesCount(Integer likesCount) { this.likesCount = likesCount; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    // --- Alias convenience methods for controller layer ---
    public String getUserId() { return clerkUserId; }
    public void setUserId(String userId) { this.clerkUserId = userId; }

    public String getTitle() { return null; }

    public String getBody() { return content; }
    public void setBody(String body) { this.content = body; }

    public String getLocation() { return district; }
    public void setLocation(String loc) { this.district = loc; }

    public java.util.List<String> getImages() { return java.util.Collections.emptyList(); }
    public String getVideoUrl() { return null; }
    public String getKnCaption() { return null; }

    public java.time.LocalDateTime getUpdatedAt() {
        if (createdAt != null) {
            try { return java.time.LocalDateTime.parse(createdAt.replace(" ", "T")); }
            catch (Exception e) { return null; }
        }
        return null;
    }

    public java.util.List<String> getCropTags() {
        return category != null ? java.util.List.of(category) : java.util.Collections.emptyList();
    }

    public java.util.List<?> getComments() { return java.util.Collections.emptyList(); }

    // --- Builder ---
    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private String userId;
        private String title;
        private String body;
        private String location;
        private java.util.List<String> images;
        private String videoUrl;
        private String knCaption;
        private java.util.List<String> cropTags;

        public Builder userId(String userId) { this.userId = userId; return this; }
        public Builder title(String title) { this.title = title; return this; }
        public Builder body(String body) { this.body = body; return this; }
        public Builder location(String location) { this.location = location; return this; }
        public Builder images(java.util.List<String> images) { this.images = images; return this; }
        public Builder videoUrl(String videoUrl) { this.videoUrl = videoUrl; return this; }
        public Builder knCaption(String knCaption) { this.knCaption = knCaption; return this; }
        public Builder cropTags(java.util.List<String> cropTags) { this.cropTags = cropTags; return this; }

        public Post build() {
            Post post = new Post();
            post.id = java.util.UUID.randomUUID().toString();
            post.clerkUserId = this.userId;
            post.content = this.body;
            post.district = this.location;
            if (this.cropTags != null && !this.cropTags.isEmpty()) {
                post.category = this.cropTags.get(0);
            }
            return post;
        }
    }
}
