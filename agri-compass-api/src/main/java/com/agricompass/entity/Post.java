package com.agricompass.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "posts")
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "user_id", nullable = false)
    private String userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private UserProfile userProfile;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String body;

    @Column(name = "crop_tags")
    private String cropTags; // Stored as comma-separated string

    private String location;

    @Column(name = "images", columnDefinition = "TEXT")
    private String images; // Stored as JSON array string

    @Column(name = "video_url")
    private String videoUrl;

    @Column(name = "kn_caption", columnDefinition = "TEXT")
    private String knCaption;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @JsonIgnore
    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<PostLike> likes = new ArrayList<>();

    @JsonIgnore
    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Comment> comments = new ArrayList<>();

    public Post() {}

    public Post(String id, String userId, String title, String body, String cropTags, String location, String images, String videoUrl, String knCaption, LocalDateTime createdAt, LocalDateTime updatedAt, List<PostLike> likes, List<Comment> comments) {
        this.id = id;
        this.userId = userId;
        this.title = title;
        this.body = body;
        this.cropTags = cropTags;
        this.location = location;
        this.images = images;
        this.videoUrl = videoUrl;
        this.knCaption = knCaption;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.likes = likes != null ? likes : new ArrayList<>();
        this.comments = comments != null ? comments : new ArrayList<>();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public UserProfile getUserProfile() { return userProfile; }
    public void setUserProfile(UserProfile userProfile) { this.userProfile = userProfile; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getBody() { return body; }
    public void setBody(String body) { this.body = body; }

    public String getCropTags() { return cropTags; }
    public void setCropTags(String cropTags) { this.cropTags = cropTags; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getImages() { return images; }
    public void setImages(String images) { this.images = images; }

    public String getVideoUrl() { return videoUrl; }
    public void setVideoUrl(String videoUrl) { this.videoUrl = videoUrl; }

    public String getKnCaption() { return knCaption; }
    public void setKnCaption(String knCaption) { this.knCaption = knCaption; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public List<PostLike> getLikes() { return likes; }
    public void setLikes(List<PostLike> likes) { this.likes = likes; }

    public List<Comment> getComments() { return comments; }
    public void setComments(List<Comment> comments) { this.comments = comments; }

    public static PostBuilder builder() {
        return new PostBuilder();
    }

    public static class PostBuilder {
        private String id;
        private String userId;
        private String title;
        private String body;
        private String cropTags;
        private String location;
        private String images;
        private String videoUrl;
        private String knCaption;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private List<PostLike> likes;
        private List<Comment> comments;

        PostBuilder() {}

        public PostBuilder id(String id) { this.id = id; return this; }
        public PostBuilder userId(String userId) { this.userId = userId; return this; }
        public PostBuilder title(String title) { this.title = title; return this; }
        public PostBuilder body(String body) { this.body = body; return this; }
        public PostBuilder cropTags(String cropTags) { this.cropTags = cropTags; return this; }
        public PostBuilder location(String location) { this.location = location; return this; }
        public PostBuilder images(String images) { this.images = images; return this; }
        public PostBuilder videoUrl(String videoUrl) { this.videoUrl = videoUrl; return this; }
        public PostBuilder knCaption(String knCaption) { this.knCaption = knCaption; return this; }
        public PostBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public PostBuilder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }
        public PostBuilder likes(List<PostLike> likes) { this.likes = likes; return this; }
        public PostBuilder comments(List<Comment> comments) { this.comments = comments; return this; }

        public Post build() {
            return new Post(id, userId, title, body, cropTags, location, images, videoUrl, knCaption, createdAt, updatedAt, likes, comments);
        }
    }
}
