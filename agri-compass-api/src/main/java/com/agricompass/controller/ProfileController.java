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
        return ResponseEntity.ok(userService.syncUserProfile(null));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserProfile> updateProfile(@PathVariable String id, @RequestBody Map<String, Object> body) {
        String fullName = (String) body.get("fullName");
        if (fullName == null) fullName = (String) body.get("full_name");
        
        String avatarUrl = (String) body.get("avatarUrl");
        if (avatarUrl == null) avatarUrl = (String) body.get("avatar_url");
        
        // Also support location update which the frontend is sending
        String location = (String) body.get("location");
        
        UserProfile profile = userService.updateProfile(fullName, avatarUrl);
        return ResponseEntity.ok(profile);
    }
    
    @PutMapping
    public ResponseEntity<UserProfile> updateProfile(@RequestBody Map<String, Object> body) {
        String fullName = (String) body.get("fullName");
        if (fullName == null) fullName = (String) body.get("full_name");
        
        String avatarUrl = (String) body.get("avatarUrl");
        if (avatarUrl == null) avatarUrl = (String) body.get("avatar_url");
        
        UserProfile profile = userService.updateProfile(fullName, avatarUrl);
        return ResponseEntity.ok(profile);
    }
}
