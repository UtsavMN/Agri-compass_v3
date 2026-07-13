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

    @Query("SELECT p FROM Post p WHERE " +
           "(:q = '' OR LOWER(p.content) LIKE LOWER('%' || :q || '%')) AND " +
           "(:district = '' OR LOWER(p.district) LIKE LOWER('%' || :district || '%')) AND " +
           "(:authorId = '' OR p.clerkUserId = :authorId) " +
           "ORDER BY p.createdAt DESC")
    Page<Post> findWithFilters(@Param("q") String q,
                               @Param("district") String district,
                               @Param("authorId") String authorId,
                               Pageable pageable);
}
