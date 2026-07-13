package com.agricompass.repository;

import com.agricompass.entity.PostLike;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PostLikeRepository extends JpaRepository<PostLike, PostLike.PostLikeId> {
    Optional<PostLike> findByPostIdAndClerkUserId(String postId, String clerkUserId);
    long countByPostId(String postId);
    void deleteByPostIdAndClerkUserId(String postId, String clerkUserId);
    
    @org.springframework.data.jpa.repository.Query("SELECT p.postId, COUNT(p) FROM PostLike p WHERE p.postId IN :postIds GROUP BY p.postId")
    java.util.List<Object[]> countByPostIds(@org.springframework.data.repository.query.Param("postIds") java.util.List<String> postIds);

    @org.springframework.data.jpa.repository.Query("SELECT p.postId FROM PostLike p WHERE p.postId IN :postIds AND p.clerkUserId = :userId")
    java.util.List<String> findLikedPostIds(@org.springframework.data.repository.query.Param("postIds") java.util.List<String> postIds, @org.springframework.data.repository.query.Param("userId") String userId);

    @org.springframework.transaction.annotation.Transactional
    void deleteByPostId(String postId);
}
