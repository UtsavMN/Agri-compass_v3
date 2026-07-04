package com.agricompass.repository;

import com.agricompass.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, String> {
    List<Comment> findByPostIdOrderByCreatedAtAsc(String postId);
    List<Comment> findByPostIdOrderByCreatedAtDesc(String postId);
    long countByPostId(String postId);
    
    @org.springframework.data.jpa.repository.Query("SELECT c.postId, COUNT(c) FROM Comment c WHERE c.postId IN :postIds GROUP BY c.postId")
    java.util.List<Object[]> countByPostIds(@org.springframework.data.repository.query.Param("postIds") java.util.List<String> postIds);
}
