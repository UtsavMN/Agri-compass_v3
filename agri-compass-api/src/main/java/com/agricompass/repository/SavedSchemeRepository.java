package com.agricompass.repository;

import com.agricompass.entity.SavedScheme;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SavedSchemeRepository extends JpaRepository<SavedScheme, String> {
    List<SavedScheme> findByClerkUserIdOrderByCreatedAtDesc(String clerkUserId);
    Optional<SavedScheme> findByClerkUserIdAndSchemeId(String clerkUserId, String schemeId);
    void deleteByClerkUserIdAndSchemeId(String clerkUserId, String schemeId);
}
