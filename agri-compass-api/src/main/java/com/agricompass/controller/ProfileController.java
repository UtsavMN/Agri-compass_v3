package com.agricompass.controller;

import com.agricompass.entity.UserProfile;
import com.agricompass.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class ProfileController {

    private final UserService userService;

    public ProfileController(UserService userService) {
        this.userService = userService;
    }

    // GET /api/profiles - get own profile (legacy)
    @GetMapping("/profiles")
    public ResponseEntity<UserProfile> getProfile() {
        return ResponseEntity.ok(userService.syncUserProfile(null));
    }

    // GET /api/profile/me - get own profile (used by onboarding check)
    @GetMapping("/profile/me")
    public ResponseEntity<UserProfile> getMyProfile() {
        return ResponseEntity.ok(userService.syncUserProfile(null));
    }

    // GET /api/profiles/{id} - get profile by ID
    @GetMapping("/profiles/{id}")
    public ResponseEntity<UserProfile> getProfileById(@PathVariable String id) {
        return ResponseEntity.ok(userService.getProfileById(id));
    }

    // POST /api/profile/setup - onboarding setup
    @PostMapping("/profile/setup")
    public ResponseEntity<UserProfile> setupProfile(@RequestBody Map<String, Object> body) {
        // First sync (create) the user profile from JWT
        UserProfile profile = userService.syncUserProfile(null);
        
        String fullName = (String) body.get("full_name");
        if (fullName == null) fullName = (String) body.get("fullName");
        
        String district = (String) body.get("district");
        String profilePictureUrl = (String) body.get("profile_picture_url");
        if (profilePictureUrl == null) profilePictureUrl = (String) body.get("profilePictureUrl");
        
        String usernameHandle = (String) body.get("username_handle");
        if (usernameHandle == null) usernameHandle = (String) body.get("usernameHandle");
        
        // Update the profile fields
        UserProfile updated = userService.updateProfileForUser(
            profile.getClerkUserId(),
            fullName,
            profilePictureUrl,
            null, // location
            null, // phone
            null, // language
            district
        );
        
        // Mark onboarding as completed
        updated.setOnboardingCompleted(1);
        updated = userService.updateProfile(updated);
        
        return ResponseEntity.ok(updated);
    }

    // PUT /api/profiles/{id} - update profile by ID
    @PutMapping("/profiles/{id}")
    public ResponseEntity<UserProfile> updateProfile(@PathVariable String id, @RequestBody Map<String, Object> body) {
        String fullName = (String) body.get("fullName");
        if (fullName == null) fullName = (String) body.get("full_name");
        
        String avatarUrl = (String) body.get("avatarUrl");
        if (avatarUrl == null) avatarUrl = (String) body.get("avatar_url");
        
        String location = (String) body.get("location");
        String phone = (String) body.get("phone");
        String languagePreference = (String) body.get("language_preference");
        if (languagePreference == null) languagePreference = (String) body.get("languagePreference");
        String district = (String) body.get("district");
        
        UserProfile profile = userService.updateProfileForUser(id, fullName, avatarUrl, location, phone, languagePreference, district);
        return ResponseEntity.ok(profile);
    }
    
    // PUT /api/profiles - update own profile
    @PutMapping("/profiles")
    public ResponseEntity<UserProfile> updateProfile(@RequestBody Map<String, Object> body) {
        String fullName = (String) body.get("fullName");
        if (fullName == null) fullName = (String) body.get("full_name");
        
        String avatarUrl = (String) body.get("avatarUrl");
        if (avatarUrl == null) avatarUrl = (String) body.get("avatar_url");
        
        String location = (String) body.get("location");
        String phone = (String) body.get("phone");
        String languagePreference = (String) body.get("language_preference");
        if (languagePreference == null) languagePreference = (String) body.get("languagePreference");
        String district = (String) body.get("district");
        
        UserProfile profile = userService.updateProfile(fullName, avatarUrl, location, phone, languagePreference, district);
        return ResponseEntity.ok(profile);
    }
}
