package com.agricompass.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "post_comments", indexes = {
    @Index(name = "idx_comments_post", columnList = "post_id")
})
public class Comment {

    @Id
    private String id;

    @Column(name = "post_id", nullable = false)
    private String postId;

    @Column(name = "clerk_user_id", nullable = false)
    private String clerkUserId;

    @Column(nullable = false)
    private String content;

    @Column(name = "created_at", insertable = false, updatable = false)
    private String createdAt;

    public Comment() {}

    @PrePersist
    public void generateId() {
        if (this.id == null) {
            this.id = java.util.UUID.randomUUID().toString();
        }
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getPostId() { return postId; }
    public void setPostId(String postId) { this.postId = postId; }

    public String getClerkUserId() { return clerkUserId; }
    public void setClerkUserId(String clerkUserId) { this.clerkUserId = clerkUserId; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    // --- Alias convenience methods for controller layer ---
    public String getUserId() { return clerkUserId; }
    public void setUserId(String userId) { this.clerkUserId = userId; }

    public UserProfile getUserProfile() { return null; }

    // --- Builder ---
    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long postId;
        private String userId;
        private String content;

        public Builder postId(Long postId) { this.postId = postId; return this; }
        public Builder userId(String userId) { this.userId = userId; return this; }
        public Builder content(String content) { this.content = content; return this; }

        public Comment build() {
            Comment comment = new Comment();
            comment.postId = this.postId != null ? String.valueOf(this.postId) : null;
            comment.clerkUserId = this.userId;
            comment.content = this.content;
            return comment;
        }
    }
}
