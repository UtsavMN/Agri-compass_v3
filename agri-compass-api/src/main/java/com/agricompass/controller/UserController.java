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

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(UserController.class);

    private final UserService userService;
    private final UserProfileRepository userProfileRepository;
    private final PostRepository postRepository;
    private final FollowRepository followRepository;
    private final com.agricompass.repository.FarmRepository farmRepository;

    public UserController(UserService userService, UserProfileRepository userProfileRepository, PostRepository postRepository, FollowRepository followRepository, com.agricompass.repository.FarmRepository farmRepository) {
        this.userService = userService;
        this.userProfileRepository = userProfileRepository;
        this.postRepository = postRepository;
        this.followRepository = followRepository;
        this.farmRepository = farmRepository;
    }

    @GetMapping("/onboarding-status")
    public ResponseEntity<Map<String, Boolean>> getOnboardingStatus(@org.springframework.security.core.annotation.AuthenticationPrincipal org.springframework.security.oauth2.jwt.Jwt jwt) {
        if (jwt == null) {
            return ResponseEntity.status(401).build();
        }
        
        String clerkUserId = jwt.getSubject();
        java.util.Optional<UserProfile> profileOpt = userProfileRepository.findById(clerkUserId);

        if (profileOpt.isEmpty()) {
            // New user — needs onboarding
            return ResponseEntity.ok(Map.of("completed", false));
        }

        UserProfile profile = profileOpt.get();
        // IMPORTANT: if profile exists, treat as completed
        // even if the onboarding_completed flag is not set
        // This handles existing users who were created before onboarding was added
        boolean completed = profile.getOnboardingCompleted() != null
            ? profile.getOnboardingCompleted() == 1
            : true; // existing profile = treat as complete

        Map<String, Boolean> response = new java.util.HashMap<>();
        response.put("completed", completed);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/check-handle")
    public ResponseEntity<Map<String, Boolean>> checkHandle(@RequestParam("handle") String handle) {
        boolean available = userProfileRepository.findByUsernameHandle(handle).isEmpty();
        return ResponseEntity.ok(Map.of("available", available));
    }

    @PostMapping("/onboarding")
    public ResponseEntity<Map<String, Object>> completeOnboarding(@RequestBody Map<String, Object> body) {
        try {
            UserProfile profile = userService.syncUserProfile(null);
            if (profile == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }

            profile.setFullName((String) body.get("fullName"));
            profile.setUsernameHandle((String) body.get("usernameHandle"));
            profile.setPhone((String) body.get("phone"));
            profile.setDistrict((String) body.get("district"));
            profile.setLanguage((String) body.get("language"));
            profile.setProfilePictureUrl((String) body.get("profilePictureUrl"));
            profile.setOnboardingCompleted(1);

            userProfileRepository.save(profile);

            if (body.containsKey("farm") && body.get("farm") != null) {
                Map<String, Object> farmData = (Map<String, Object>) body.get("farm");
                com.agricompass.entity.Farm farm = new com.agricompass.entity.Farm();
                farm.setClerkUserId(profile.getClerkUserId());
                farm.setFarmName((String) farmData.get("farmName"));
                
                Object acresObj = farmData.get("acres");
                if (acresObj != null) {
                    farm.setAcres(Double.valueOf(acresObj.toString()));
                }
                
                farm.setCurrentCrop((String) farmData.get("currentCrop"));
                farm.setSoilType((String) farmData.get("soilType"));
                farm.setDistrict(profile.getDistrict());
                farmRepository.save(farm);
            }

            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            log.error("Error during onboarding", e);
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage() != null ? e.getMessage() : e.toString()));
        }
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
        UserProfile profile = userProfileRepository.findByIdIgnoreCase(userId).orElse(null);
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
            log.error("Failed to fetch posts for user: {}", userId, e);
        }

        int followerCount = 0;
        int followingCount = 0;
        try {
            followerCount = followRepository.countByFollowingId(userId);
            followingCount = followRepository.countByFollowerId(userId);
        } catch (Exception e) {
            log.error("Failed to fetch follower counts for user: {}", userId, e);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("profile", profileMap);
        response.put("posts", postsList);
        response.put("followerCount", followerCount);
        response.put("followingCount", followingCount);

        return ResponseEntity.ok(response);
    }
}
