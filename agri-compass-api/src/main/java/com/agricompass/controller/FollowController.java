package com.agricompass.controller;

import com.agricompass.entity.Follow;
import com.agricompass.entity.FollowId;
import com.agricompass.entity.UserProfile;
import com.agricompass.repository.FollowRepository;
import com.agricompass.repository.UserProfileRepository;
import com.agricompass.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/follows")
public class FollowController {

    private final FollowRepository followRepository;
    private final UserProfileRepository userProfileRepository;
    private final UserService userService;

    public FollowController(FollowRepository followRepository, UserProfileRepository userProfileRepository, UserService userService) {
        this.followRepository = followRepository;
        this.userProfileRepository = userProfileRepository;
        this.userService = userService;
    }

    @PostMapping("/{userId}")
    public ResponseEntity<Map<String, Object>> followUser(@PathVariable String userId) {
        String currentUserId = userService.syncUser(null).getId();
        if (currentUserId.equals(userId)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Cannot follow yourself"));
        }
        
        FollowId followId = new FollowId(currentUserId, userId);
        if (!followRepository.existsById(followId)) {
            followRepository.save(new Follow(currentUserId, userId));
        }
        return ResponseEntity.ok(Map.of("success", true));
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<Map<String, Object>> unfollowUser(@PathVariable String userId) {
        String currentUserId = userService.syncUser(null).getId();
        FollowId followId = new FollowId(currentUserId, userId);
        followRepository.findById(followId).ifPresent(followRepository::delete);
        return ResponseEntity.ok(Map.of("success", true));
    }

    @GetMapping("/{userId}/status")
    public ResponseEntity<Map<String, Object>> getFollowStatus(@PathVariable String userId) {
        String currentUserId = userService.syncUser(null).getId();
        boolean isFollowing = followRepository.existsByFollowerIdAndFollowingId(currentUserId, userId);
        return ResponseEntity.ok(Map.of("isFollowing", isFollowing));
    }

    @GetMapping("/{userId}/followers")
    public ResponseEntity<Map<String, Object>> getFollowers(@PathVariable String userId) {
        List<Follow> follows = followRepository.findByFollowingId(userId);
        List<Map<String, Object>> users = follows.stream().map(f -> getUserDto(f.getFollowerId())).collect(Collectors.toList());
        return ResponseEntity.ok(Map.of("users", users));
    }

    @GetMapping("/{userId}/following")
    public ResponseEntity<Map<String, Object>> getFollowing(@PathVariable String userId) {
        List<Follow> follows = followRepository.findByFollowerId(userId);
        List<Map<String, Object>> users = follows.stream().map(f -> getUserDto(f.getFollowingId())).collect(Collectors.toList());
        return ResponseEntity.ok(Map.of("users", users));
    }

    private Map<String, Object> getUserDto(String clerkUserId) {
        Map<String, Object> map = new HashMap<>();
        map.put("clerkUserId", clerkUserId);
        userProfileRepository.findById(clerkUserId).ifPresentOrElse(profile -> {
            map.put("fullName", profile.getFullName() != null ? profile.getFullName() : profile.getUsername());
            map.put("usernameHandle", profile.getUsername());
            map.put("district", profile.getDistrict());
            map.put("profilePictureUrl", profile.getAvatarUrl());
        }, () -> {
            map.put("fullName", "Unknown Farmer");
            map.put("usernameHandle", "unknown");
        });
        return map;
    }
}
