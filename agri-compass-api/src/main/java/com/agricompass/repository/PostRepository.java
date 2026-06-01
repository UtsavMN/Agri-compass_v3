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
    List<Post> findByUserId(String userId);

    @EntityGraph(attributePaths = {"userProfile", "comments", "comments.userProfile"})
    @Query("SELECT p FROM Post p WHERE " +
           "(:q IS NULL OR LOWER(p.body) LIKE LOWER(CONCAT('%', :q, '%'))) AND " +
           "(:location IS NULL OR LOWER(p.location) LIKE LOWER(CONCAT('%', :location, '%'))) AND " +
           "(:userId IS NULL OR p.userId = :userId) " +
           "ORDER BY p.createdAt DESC")
    Page<Post> findWithFilters(@Param("q") String q,
                               @Param("location") String location,
                               @Param("userId") String userId,
                               Pageable pageable);
}
