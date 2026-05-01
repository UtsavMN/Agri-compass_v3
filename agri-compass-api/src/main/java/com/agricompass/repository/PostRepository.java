package com.agricompass.repository;

import com.agricompass.entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PostRepository extends JpaRepository<Post, String> {
    List<Post> findByUserId(String userId);

    @Query("SELECT p FROM Post p WHERE " +
           "(:q IS NULL OR LOWER(p.body) LIKE LOWER(CONCAT('%', :q, '%'))) AND " +
           "(:location IS NULL OR LOWER(p.location) LIKE LOWER(CONCAT('%', :location, '%'))) AND " +
           "(:userId IS NULL OR p.userId = :userId) " +
           "ORDER BY p.createdAt DESC")
    List<Post> findWithFilters(@Param("q") String q,
                               @Param("location") String location,
                               @Param("userId") String userId);
}
