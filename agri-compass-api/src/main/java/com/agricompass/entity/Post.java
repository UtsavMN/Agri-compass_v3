package com.agricompass.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "community_posts")
public class Post {

    @Id
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
}
