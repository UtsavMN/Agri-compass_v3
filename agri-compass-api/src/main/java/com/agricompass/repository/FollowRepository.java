package com.agricompass.repository;

import com.agricompass.entity.Follow;
import com.agricompass.entity.FollowId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FollowRepository extends JpaRepository<Follow, FollowId> {
    List<Follow> findByFollowingId(String followingId);
    List<Follow> findByFollowerId(String followerId);
    int countByFollowerId(String followerId);
    int countByFollowingId(String followingId);
    boolean existsByFollowerIdAndFollowingId(String followerId, String followingId);
}
