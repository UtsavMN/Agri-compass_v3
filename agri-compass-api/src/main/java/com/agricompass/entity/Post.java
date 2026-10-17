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

    @Column(name = "images_json", columnDefinition = "TEXT")
    private String imagesJson = "[]";

    @Column(name = "created_at", updatable = false)
    private String createdAt;

    public Post() {}

    @PrePersist
    public void generateId() {
        if (this.id == null) {
            this.id = java.util.UUID.randomUUID().toString();
        }
        if (this.createdAt == null) {
            this.createdAt = java.time.Instant.now().toString();
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

    public java.util.List<String> getImages() {
        if (imagesJson == null || imagesJson.trim().isEmpty() || imagesJson.equals("[]")) {
            return java.util.Collections.emptyList();
        }
        try {
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            return mapper.readValue(imagesJson, new com.fasterxml.jackson.core.type.TypeReference<java.util.List<String>>() {});
        } catch (Exception e) {
            String[] parts = imagesJson.split(",");
            java.util.List<String> res = new java.util.ArrayList<>();
            for (String p : parts) {
                if (!p.trim().isEmpty()) res.add(p.trim().replace("\"", "").replace("[", "").replace("]", ""));
            }
            return res;
        }
    }

    public void setImages(java.util.List<String> images) {
        if (images == null || images.isEmpty()) {
            this.imagesJson = "[]";
            return;
        }
        try {
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            this.imagesJson = mapper.writeValueAsString(images);
        } catch (Exception e) {
            this.imagesJson = "[\"" + String.join("\",\"", images) + "\"]";
        }
    }

    public String getImagesJson() { return imagesJson; }
    public void setImagesJson(String json) { this.imagesJson = json; }

    public String getVideoUrl() { return null; }
    public String getKnCaption() { return null; }

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(Post.class);

    public java.time.LocalDateTime getUpdatedAt() {
        if (createdAt != null) {
            try {
                String clean = createdAt.replace(" ", "T");
                if (clean.endsWith("Z")) {
                    return java.time.Instant.parse(clean).atZone(java.time.ZoneId.of("Asia/Kolkata")).toLocalDateTime();
                }
                return java.time.LocalDateTime.parse(clean);
            }
            catch (Exception e) { 
                log.error("Failed to parse createdAt date ({}): {}", createdAt, e.getMessage());
                return java.time.LocalDateTime.now(); 
            }
        }
        return java.time.LocalDateTime.now();
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
            if (this.images != null && !this.images.isEmpty()) {
                post.setImages(this.images);
            }
            return post;
        }
    }
}
