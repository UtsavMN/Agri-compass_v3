package com.agricompass.repository;

import com.agricompass.entity.UserProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserProfileRepository extends JpaRepository<UserProfile, String> {
    Optional<UserProfile> findByUsernameHandle(String usernameHandle);

    @org.springframework.data.jpa.repository.Query("SELECT u FROM UserProfile u WHERE LOWER(u.clerkUserId) = LOWER(:userId)")
    Optional<UserProfile> findByIdIgnoreCase(@org.springframework.data.repository.query.Param("userId") String userId);

    @org.springframework.data.jpa.repository.Query("SELECT u FROM UserProfile u WHERE LOWER(u.usernameHandle) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :query, '%'))")
    java.util.List<UserProfile> searchUsers(String query);
}
