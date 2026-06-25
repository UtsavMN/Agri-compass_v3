package com.agricompass.repository;

import com.agricompass.entity.PostLike;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PostLikeRepository extends JpaRepository<PostLike, PostLike.PostLikeId> {
    Optional<PostLike> findByPostIdAndClerkUserId(String postId, String clerkUserId);
    long countByPostId(String postId);
    void deleteByPostIdAndClerkUserId(String postId, String clerkUserId);
}
