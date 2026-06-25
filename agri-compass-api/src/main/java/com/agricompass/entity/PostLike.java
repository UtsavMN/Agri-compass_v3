package com.agricompass.entity;

import jakarta.persistence.*;
import java.io.Serializable;
import java.util.Objects;

@Entity
@Table(name = "post_likes")
@IdClass(PostLike.PostLikeId.class)
public class PostLike {

    @Id
    @Column(name = "post_id")
    private String postId;

    @Id
    @Column(name = "clerk_user_id")
    private String clerkUserId;

    public PostLike() {}

    public PostLike(String postId, String clerkUserId) {
        this.postId = postId;
        this.clerkUserId = clerkUserId;
    }

    public String getPostId() { return postId; }
    public void setPostId(String postId) { this.postId = postId; }

    public String getClerkUserId() { return clerkUserId; }
    public void setClerkUserId(String clerkUserId) { this.clerkUserId = clerkUserId; }

    public static class PostLikeId implements Serializable {
        private String postId;
        private String clerkUserId;

        public PostLikeId() {}

        public PostLikeId(String postId, String clerkUserId) {
            this.postId = postId;
            this.clerkUserId = clerkUserId;
        }

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (o == null || getClass() != o.getClass()) return false;
            PostLikeId that = (PostLikeId) o;
            return Objects.equals(postId, that.postId) && Objects.equals(clerkUserId, that.clerkUserId);
        }

        @Override
        public int hashCode() {
            return Objects.hash(postId, clerkUserId);
        }
    }
}
