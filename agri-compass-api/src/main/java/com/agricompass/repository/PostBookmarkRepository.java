package com.agricompass.repository;

import com.agricompass.entity.PostBookmark;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PostBookmarkRepository extends JpaRepository<PostBookmark, PostBookmark.PostBookmarkId> {
    Optional<PostBookmark> findByPostIdAndClerkUserId(String postId, String clerkUserId);
    void deleteByPostIdAndClerkUserId(String postId, String clerkUserId);

    @Query("SELECT p.postId FROM PostBookmark p WHERE p.postId IN :postIds AND p.clerkUserId = :userId")
    List<String> findBookmarkedPostIds(@Param("postIds") List<String> postIds, @Param("userId") String userId);

    @Query("SELECT p.postId FROM PostBookmark p WHERE p.clerkUserId = :userId ORDER BY p.createdAt DESC")
    List<String> findPostIdsByClerkUserId(@Param("userId") String userId);

    @org.springframework.transaction.annotation.Transactional
    void deleteByPostId(String postId);
}
