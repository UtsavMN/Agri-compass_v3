package com.agricompass.repository;

import com.agricompass.entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;

public interface PostRepository extends JpaRepository<Post, String> {
    List<Post> findByClerkUserId(String clerkUserId);

    @EntityGraph(attributePaths = {"userProfile"})
    @Query("SELECT p FROM Post p WHERE " +
           "(:q IS NULL OR LOWER(p.content) LIKE LOWER(CONCAT('%', :q, '%'))) AND " +
           "(:district IS NULL OR LOWER(p.district) LIKE LOWER(CONCAT('%', :district, '%'))) AND " +
           "(:clerkUserId IS NULL OR p.clerkUserId = :clerkUserId) " +
           "ORDER BY p.createdAt DESC")
    Page<Post> findWithFilters(@Param("q") String q,
                               @Param("district") String district,
                               @Param("clerkUserId") String clerkUserId,
                               Pageable pageable);
}
