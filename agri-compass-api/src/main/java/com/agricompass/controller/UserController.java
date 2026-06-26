package com.agricompass.controller;

import com.agricompass.entity.UserProfile;
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

    public UserController(UserService userService, UserProfileRepository userProfileRepository) {
        this.userService = userService;
        this.userProfileRepository = userProfileRepository;
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
    public ResponseEntity<List<Map<String, String>>> searchUsers(@RequestParam("q") String query) {
        List<UserProfile> users = userProfileRepository.searchUsers(query);
        List<Map<String, String>> results = users.stream().map(u -> {
            Map<String, String> map = new HashMap<>();
            map.put("clerkUserId", u.getClerkUserId());
            map.put("fullName", u.getFullName());
            map.put("usernameHandle", u.getUsernameHandle());
            map.put("profilePictureUrl", u.getProfilePictureUrl());
            return map;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(results);
    }
}
