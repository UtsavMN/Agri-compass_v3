package com.agricompass.controller;

import com.agricompass.entity.UserProfile;
import com.agricompass.repository.PostRepository;
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
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final UserProfileRepository userProfileRepository;
    private final PostRepository postRepository;
    private final FollowRepository followRepository;

    public UserController(UserService userService, UserProfileRepository userProfileRepository, PostRepository postRepository, FollowRepository followRepository) {
        this.userService = userService;
        this.userProfileRepository = userProfileRepository;
        this.postRepository = postRepository;
        this.followRepository = followRepository;
    }

    @GetMapping("/onboarding-status")
    public ResponseEntity<Map<String, Boolean>> getOnboardingStatus() {
        UserProfile profile = userService.syncUserProfile(null);
        boolean completed = false;

        if (profile != null) {
            boolean hasValidHandle = profile.getUsernameHandle() != null && !profile.getUsernameHandle().equals(profile.getClerkUserId());
            boolean flagSet = profile.getOnboardingCompleted() != null && profile.getOnboardingCompleted() == 1;
            completed = hasValidHandle && flagSet;
        }

        Map<String, Boolean> response = new HashMap<>();
        response.put("completed", completed);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/search")
    public ResponseEntity<Map<String, Object>> searchUsers(@RequestParam("q") String query) {
        List<UserProfile> users = userProfileRepository.searchUsers(query);
        List<Map<String, String>> results = users.stream().map(u -> {
            Map<String, String> map = new HashMap<>();
            map.put("clerkUserId", u.getClerkUserId());
            map.put("fullName", u.getFullName());
            map.put("usernameHandle", u.getUsernameHandle());
            map.put("district", u.getDistrict());
            map.put("profilePictureUrl", u.getAvatarUrl());
            return map;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(Map.of("users", results));
    }

    @GetMapping("/{userId}/public")
    public ResponseEntity<Map<String, Object>> getPublicProfile(@PathVariable String userId) {
        userId = userId.trim();
        UserProfile profile = userProfileRepository.findById(userId).orElse(null);
        if (profile == null) {
            return ResponseEntity.notFound().build();
        }

        Map<String, Object> profileMap = new HashMap<>();
        profileMap.put("clerkUserId", profile.getClerkUserId());
        profileMap.put("fullName", profile.getFullName() != null ? profile.getFullName() : profile.getUsername());
        profileMap.put("usernameHandle", profile.getUsernameHandle() != null ? profile.getUsernameHandle() : profile.getUsername());
        profileMap.put("district", profile.getDistrict());
        profileMap.put("profilePictureUrl", profile.getAvatarUrl());
        profileMap.put("bio", profile.getBio());

        List<Map<String, Object>> postsList = new java.util.ArrayList<>();
        try {
            List<com.agricompass.entity.Post> posts = postRepository.findByClerkUserId(userId);
            postsList = posts.stream().map(p -> {
                Map<String, Object> pMap = new HashMap<>();
                pMap.put("id", p.getId());
                pMap.put("content", p.getBody());
                return pMap;
            }).collect(Collectors.toList());
        } catch (Exception e) {
            e.printStackTrace();
        }

        int followerCount = 0;
        int followingCount = 0;
        try {
            followerCount = followRepository.countByFollowingId(userId);
            followingCount = followRepository.countByFollowerId(userId);
        } catch (Exception e) {
            e.printStackTrace();
        }

        Map<String, Object> response = new HashMap<>();
        response.put("profile", profileMap);
        response.put("posts", postsList);
        response.put("followerCount", followerCount);
        response.put("followingCount", followingCount);

        return ResponseEntity.ok(response);
    }
}
