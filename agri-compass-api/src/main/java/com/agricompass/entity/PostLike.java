package com.agricompass.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "post_likes", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"post_id", "user_id"})
})
public class PostLike {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    private Post post;

    @Column(name = "user_id", nullable = false)
    private String userId;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public PostLike() {}

    public PostLike(String id, Post post, String userId, LocalDateTime createdAt) {
        this.id = id;
        this.post = post;
        this.userId = userId;
        this.createdAt = createdAt;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public Post getPost() { return post; }
    public void setPost(Post post) { this.post = post; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public static PostLikeBuilder builder() {
        return new PostLikeBuilder();
    }

    public static class PostLikeBuilder {
        private String id;
        private Post post;
        private String userId;
        private LocalDateTime createdAt;

        PostLikeBuilder() {}

        public PostLikeBuilder id(String id) { this.id = id; return this; }
        public PostLikeBuilder post(Post post) { this.post = post; return this; }
        public PostLikeBuilder userId(String userId) { this.userId = userId; return this; }
        public PostLikeBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public PostLike build() {
            return new PostLike(id, post, userId, createdAt);
        }
    }
}
