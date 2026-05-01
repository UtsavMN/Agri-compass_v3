package com.agricompass.controller;

import com.agricompass.entity.UserProfile;
import com.agricompass.repository.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/profiles")
@RequiredArgsConstructor
public class ProfileController {

    private final UserProfileRepository profileRepository;

    // GET /api/profiles/:id
    @GetMapping("/{id}")
    public ResponseEntity<UserProfile> getProfile(@PathVariable String id) {
        return profileRepository.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    // PUT /api/profiles/:id
    @PutMapping("/{id}")
    public ResponseEntity<UserProfile> updateProfile(@PathVariable String id,
                                                      @RequestBody Map<String, String> body) {
        // Disabled Auth check for development

        UserProfile profile = profileRepository.findById(id).orElseGet(() ->
            UserProfile.builder().id(id).build()
        );

        if (body.containsKey("username")) profile.setUsername(body.get("username"));
        if (body.containsKey("full_name")) profile.setFullName(body.get("full_name"));
        if (body.containsKey("phone")) profile.setPhone(body.get("phone"));
        if (body.containsKey("location")) profile.setLocation(body.get("location"));
        if (body.containsKey("language_preference")) profile.setLanguagePreference(body.get("language_preference"));
        if (body.containsKey("avatar_url")) profile.setAvatarUrl(body.get("avatar_url"));

        return ResponseEntity.ok(profileRepository.save(profile));
    }
}
