package com.agricompass.entity;

import jakarta.persistence.*;
import java.io.Serializable;
import java.util.Objects;

@Entity
@Table(name = "post_bookmarks", indexes = {
    @Index(name = "idx_post_bookmarks_user", columnList = "clerk_user_id"),
    @Index(name = "idx_post_bookmarks_post", columnList = "post_id")
})
@IdClass(PostBookmark.PostBookmarkId.class)
public class PostBookmark {

    @Id
    @Column(name = "post_id")
    private String postId;

    @Id
    @Column(name = "clerk_user_id")
    private String clerkUserId;

    @Column(name = "created_at")
    private String createdAt;

    public PostBookmark() {}

    public PostBookmark(String postId, String clerkUserId) {
        this.postId = postId;
        this.clerkUserId = clerkUserId;
        this.createdAt = java.time.Instant.now().toString();
    }

    public String getPostId() { return postId; }
    public void setPostId(String postId) { this.postId = postId; }

    public String getClerkUserId() { return clerkUserId; }
    public void setClerkUserId(String clerkUserId) { this.clerkUserId = clerkUserId; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public static class PostBookmarkId implements Serializable {
        private String postId;
        private String clerkUserId;

        public PostBookmarkId() {}

        public PostBookmarkId(String postId, String clerkUserId) {
            this.postId = postId;
            this.clerkUserId = clerkUserId;
        }

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (o == null || getClass() != o.getClass()) return false;
            PostBookmarkId that = (PostBookmarkId) o;
            return Objects.equals(postId, that.postId) && Objects.equals(clerkUserId, that.clerkUserId);
        }

        @Override
        public int hashCode() {
            return Objects.hash(postId, clerkUserId);
        }
    }
}
