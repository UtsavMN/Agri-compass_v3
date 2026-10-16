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

    // PUT /api/profile/me - update own profile, preferences and district
    @PutMapping("/profile/me")
    public ResponseEntity<UserProfile> updateMyProfile(@RequestBody Map<String, Object> body) {
        UserProfile current = userService.syncUserProfile(null);
        if (current == null) {
            return ResponseEntity.status(401).build();
        }
        if (body.containsKey("preferences")) {
            Object prefs = body.get("preferences");
            current.setPreferences(prefs != null ? prefs.toString() : "{}");
        }
        if (body.containsKey("district") && body.get("district") != null) {
            current.setDistrict((String) body.get("district"));
        } else if (body.containsKey("location") && body.get("location") != null) {
            current.setDistrict((String) body.get("location"));
        }
        if (body.containsKey("language") && body.get("language") != null) {
            current.setLanguage((String) body.get("language"));
        }
        if (body.containsKey("fullName") && body.get("fullName") != null) {
            current.setFullName((String) body.get("fullName"));
        } else if (body.containsKey("full_name") && body.get("full_name") != null) {
            current.setFullName((String) body.get("full_name"));
        }
        if (body.containsKey("avatarUrl") && body.get("avatarUrl") != null) {
            current.setProfilePictureUrl((String) body.get("avatarUrl"));
        } else if (body.containsKey("avatar_url") && body.get("avatar_url") != null) {
            current.setProfilePictureUrl((String) body.get("avatar_url"));
        } else if (body.containsKey("profile_picture_url") && body.get("profile_picture_url") != null) {
            current.setProfilePictureUrl((String) body.get("profile_picture_url"));
        } else if (body.containsKey("profilePictureUrl") && body.get("profilePictureUrl") != null) {
            current.setProfilePictureUrl((String) body.get("profilePictureUrl"));
        }
        if (body.containsKey("bio") && body.get("bio") != null) {
            current.setBio((String) body.get("bio"));
        }
        if (body.containsKey("phone") && body.get("phone") != null) {
            current.setPhone((String) body.get("phone"));
        }
        UserProfile saved = userService.updateProfile(current);
        return ResponseEntity.ok(saved);
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
        if (profilePictureUrl == null) profilePictureUrl = (String) body.get("avatarUrl");
        if (profilePictureUrl == null) profilePictureUrl = (String) body.get("avatar_url");
        
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
            district,
            usernameHandle,
            null // bio
        );
        
        // Mark onboarding as completed
        updated.setOnboardingCompleted(1);
        updated = userService.updateProfile(updated);
        
        return ResponseEntity.ok(updated);
    }

    // PUT /api/profiles/{id} - update profile by ID
    @PutMapping("/profiles/{id}")
    public ResponseEntity<UserProfile> updateProfile(@PathVariable String id, @RequestBody Map<String, Object> body) {
        UserProfile currentProfile = userService.syncUserProfile(null);
        if (!currentProfile.getClerkUserId().equals(id)) {
            throw new RuntimeException("Unauthorized to update this profile");
        }
        
        String fullName = (String) body.get("fullName");
        if (fullName == null) fullName = (String) body.get("full_name");
        
        String avatarUrl = (String) body.get("avatarUrl");
        if (avatarUrl == null) avatarUrl = (String) body.get("avatar_url");
        if (avatarUrl == null) avatarUrl = (String) body.get("profile_picture_url");
        if (avatarUrl == null) avatarUrl = (String) body.get("profilePictureUrl");
        
        String location = (String) body.get("location");
        String phone = (String) body.get("phone");
        String languagePreference = (String) body.get("language_preference");
        if (languagePreference == null) languagePreference = (String) body.get("languagePreference");
        String district = (String) body.get("district");
        if (district == null) district = location;
        
        String usernameHandle = (String) body.get("usernameHandle");
        if (usernameHandle == null) usernameHandle = (String) body.get("username_handle");
        String bio = (String) body.get("bio");
        
        UserProfile profile = userService.updateProfileForUser(id, fullName, avatarUrl, location, phone, languagePreference, district, usernameHandle, bio);
        return ResponseEntity.ok(profile);
    }
    
    // PUT /api/profiles - update own profile
    @PutMapping("/profiles")
    public ResponseEntity<UserProfile> updateProfile(@RequestBody Map<String, Object> body) {
        String fullName = (String) body.get("fullName");
        if (fullName == null) fullName = (String) body.get("full_name");
        
        String avatarUrl = (String) body.get("avatarUrl");
        if (avatarUrl == null) avatarUrl = (String) body.get("avatar_url");
        if (avatarUrl == null) avatarUrl = (String) body.get("profile_picture_url");
        if (avatarUrl == null) avatarUrl = (String) body.get("profilePictureUrl");
        
        String location = (String) body.get("location");
        String phone = (String) body.get("phone");
        String languagePreference = (String) body.get("language_preference");
        if (languagePreference == null) languagePreference = (String) body.get("languagePreference");
        String district = (String) body.get("district");
        if (district == null) district = location;
        
        String usernameHandle = (String) body.get("usernameHandle");
        if (usernameHandle == null) usernameHandle = (String) body.get("username_handle");
        String bio = (String) body.get("bio");
        
        UserProfile profile = userService.updateProfile(fullName, avatarUrl, location, phone, languagePreference, district, usernameHandle, bio);
        return ResponseEntity.ok(profile);
    }

    // GET /api/profiles/count - get total number of users
    @GetMapping("/profiles/count")
    public ResponseEntity<Map<String, Long>> getUserCount() {
        return ResponseEntity.ok(Map.of("count", userService.countUsers()));
    }
}
