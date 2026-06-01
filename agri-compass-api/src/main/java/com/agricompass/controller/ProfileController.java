package com.agricompass.controller;

import com.agricompass.entity.UserProfile;
import com.agricompass.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/profiles")
public class ProfileController {

    private final UserService userService;

    public ProfileController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<UserProfile> getProfile() {
        return ResponseEntity.ok(userService.syncUserProfile(null));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserProfile> getProfileById(@PathVariable String id) {
        return ResponseEntity.ok(userService.getProfileById(id));
    }

    @PutMapping("/{id}")
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
    
    @PutMapping
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
