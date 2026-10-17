package com.agricompass.controller;

import com.agricompass.entity.UserProfile;
import com.agricompass.repository.UserProfileRepository;
import com.agricompass.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api")
public class ProfileController {

    private final UserService userService;
    private final UserProfileRepository userProfileRepository;

    public ProfileController(UserService userService, UserProfileRepository userProfileRepository) {
        this.userService = userService;
        this.userProfileRepository = userProfileRepository;
    }

    private String resolveUserId(String headerUserId, Map<String, Object> body) {
        // 1. Try SecurityContext JWT
        try {
            var auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null) {
                if (auth.getPrincipal() instanceof Jwt jwt) {
                    String sub = jwt.getSubject();
                    if (sub != null && !sub.isBlank() && !"anonymousUser".equalsIgnoreCase(sub)) {
                        return sub.trim();
                    }
                } else if (auth.getName() != null && !auth.getName().isBlank() && !"anonymousUser".equalsIgnoreCase(auth.getName())) {
                    return auth.getName().trim();
                }
            }
        } catch (Exception ignored) {}

        // 2. Try X-User-Id header
        if (headerUserId != null && !headerUserId.isBlank() && !"anonymousUser".equalsIgnoreCase(headerUserId)) {
            return headerUserId.trim();
        }

        // 3. Try body identifiers (userId, clerkUserId, clerk_user_id, id)
        if (body != null) {
            Object bId = body.get("userId");
            if (bId == null) bId = body.get("clerkUserId");
            if (bId == null) bId = body.get("clerk_user_id");
            if (bId == null) bId = body.get("id");
            if (bId instanceof String s && !s.isBlank() && !"anonymousUser".equalsIgnoreCase(s)) {
                return s.trim();
            }
        }

        // 4. Try userService sync
        try {
            UserProfile sync = userService.syncUserProfile(null);
            if (sync != null && sync.getId() != null && !"anonymousUser".equalsIgnoreCase(sync.getId())) {
                return sync.getId();
            }
        } catch (Exception ignored) {}

        // 5. Fallback: Check if any real user exists in user_profiles
        try {
            return userProfileRepository.findAll().stream()
                .map(UserProfile::getClerkUserId)
                .filter(id -> id != null && !id.startsWith("mock_") && !"anonymousUser".equalsIgnoreCase(id))
                .findFirst()
                .orElse("mock_user_1");
        } catch (Exception ignored) {}

        return "mock_user_1";
    }

    private UserProfile getOrCreateProfile(String userId) {
        if (userId == null || userId.isBlank() || "anonymousUser".equalsIgnoreCase(userId)) {
            userId = resolveUserId(null, null);
        }

        Optional<UserProfile> opt = userProfileRepository.findById(userId);
        if (opt.isPresent()) {
            return opt.get();
        }

        opt = userProfileRepository.findByIdIgnoreCase(userId);
        if (opt.isPresent()) {
            return opt.get();
        }

        UserProfile p = new UserProfile();
        p.setClerkUserId(userId);
        p.setUsernameHandle(userId.replaceAll("[^a-zA-Z0-9_]", "_"));
        p.setFullName("Farmer");
        p.setDistrict("Bengaluru Urban");
        p.setState("Karnataka");
        p.setLanguage("kn");
        p.setOnboardingCompleted(1);
        return userProfileRepository.save(p);
    }

    private UserProfile applyProfileUpdates(UserProfile profile, Map<String, Object> body) {
        if (body == null) return profile;

        // Full Name
        if (body.containsKey("fullName") && body.get("fullName") != null) {
            profile.setFullName(((String) body.get("fullName")).trim());
        } else if (body.containsKey("full_name") && body.get("full_name") != null) {
            profile.setFullName(((String) body.get("full_name")).trim());
        }

        // Username Handle
        String newHandle = null;
        if (body.containsKey("usernameHandle") && body.get("usernameHandle") != null) {
            newHandle = (String) body.get("usernameHandle");
        } else if (body.containsKey("username_handle") && body.get("username_handle") != null) {
            newHandle = (String) body.get("username_handle");
        } else if (body.containsKey("username") && body.get("username") != null) {
            newHandle = (String) body.get("username");
        }
        if (newHandle != null) {
            newHandle = newHandle.trim().replaceFirst("^@", "");
            if (!newHandle.isBlank()) {
                Optional<UserProfile> existing = userProfileRepository.findByUsernameHandle(newHandle);
                if (existing.isEmpty() || existing.get().getClerkUserId().equalsIgnoreCase(profile.getClerkUserId())) {
                    profile.setUsernameHandle(newHandle);
                }
            }
        }

        // Avatar / Profile Picture URL
        String avatar = null;
        if (body.containsKey("avatarUrl") && body.get("avatarUrl") != null) {
            avatar = (String) body.get("avatarUrl");
        } else if (body.containsKey("avatar_url") && body.get("avatar_url") != null) {
            avatar = (String) body.get("avatar_url");
        } else if (body.containsKey("profile_picture_url") && body.get("profile_picture_url") != null) {
            avatar = (String) body.get("profile_picture_url");
        } else if (body.containsKey("profilePictureUrl") && body.get("profilePictureUrl") != null) {
            avatar = (String) body.get("profilePictureUrl");
        }
        if (avatar != null && !avatar.isBlank()) {
            profile.setProfilePictureUrl(avatar.trim());
        }

        // District / Location
        if (body.containsKey("district") && body.get("district") != null) {
            profile.setDistrict(((String) body.get("district")).trim());
        } else if (body.containsKey("location") && body.get("location") != null) {
            profile.setDistrict(((String) body.get("location")).trim());
        }

        // State
        if (body.containsKey("state") && body.get("state") != null) {
            profile.setState(((String) body.get("state")).trim());
        }

        // Phone
        if (body.containsKey("phone") && body.get("phone") != null) {
            profile.setPhone(((String) body.get("phone")).trim());
        }

        // Bio
        if (body.containsKey("bio")) {
            Object bioObj = body.get("bio");
            profile.setBio(bioObj != null ? bioObj.toString().trim() : null);
        }

        // Language
        if (body.containsKey("language") && body.get("language") != null) {
            profile.setLanguage(((String) body.get("language")).trim());
        } else if (body.containsKey("languagePreference") && body.get("languagePreference") != null) {
            profile.setLanguage(((String) body.get("languagePreference")).trim());
        } else if (body.containsKey("language_preference") && body.get("language_preference") != null) {
            profile.setLanguage(((String) body.get("language_preference")).trim());
        }

        // Preferences
        if (body.containsKey("preferences") && body.get("preferences") != null) {
            profile.setPreferences(body.get("preferences").toString());
        }

        return userProfileRepository.save(profile);
    }

    // GET /api/profiles - get own profile (legacy)
    @GetMapping("/profiles")
    public ResponseEntity<UserProfile> getProfile(
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId) {
        String userId = resolveUserId(headerUserId, null);
        return ResponseEntity.ok(getOrCreateProfile(userId));
    }

    // GET /api/profile/me - get own profile
    @GetMapping("/profile/me")
    public ResponseEntity<UserProfile> getMyProfile(
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId) {
        String userId = resolveUserId(headerUserId, null);
        return ResponseEntity.ok(getOrCreateProfile(userId));
    }

    // PUT /api/profile/me - update own profile
    @PutMapping("/profile/me")
    public ResponseEntity<UserProfile> updateMyProfile(
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId,
            @RequestBody Map<String, Object> body) {
        String userId = resolveUserId(headerUserId, body);
        UserProfile current = getOrCreateProfile(userId);
        return ResponseEntity.ok(applyProfileUpdates(current, body));
    }

    // PUT /api/profiles - update own profile
    @PutMapping("/profiles")
    public ResponseEntity<UserProfile> updateProfile(
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId,
            @RequestBody Map<String, Object> body) {
        String userId = resolveUserId(headerUserId, body);
        UserProfile current = getOrCreateProfile(userId);
        return ResponseEntity.ok(applyProfileUpdates(current, body));
    }

    // GET /api/profiles/{id} - get profile by ID
    @GetMapping("/profiles/{id}")
    public ResponseEntity<UserProfile> getProfileById(@PathVariable String id) {
        return ResponseEntity.ok(getOrCreateProfile(id));
    }

    // PUT /api/profiles/{id} - update profile by ID
    @PutMapping("/profiles/{id}")
    public ResponseEntity<UserProfile> updateProfileById(
            @PathVariable String id,
            @RequestBody Map<String, Object> body) {
        UserProfile current = getOrCreateProfile(id);
        return ResponseEntity.ok(applyProfileUpdates(current, body));
    }

    // POST /api/profile/setup - onboarding setup
    @PostMapping("/profile/setup")
    public ResponseEntity<UserProfile> setupProfile(
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId,
            @RequestBody Map<String, Object> body) {
        String userId = resolveUserId(headerUserId, body);
        UserProfile current = getOrCreateProfile(userId);
        UserProfile updated = applyProfileUpdates(current, body);
        updated.setOnboardingCompleted(1);
        return ResponseEntity.ok(userProfileRepository.save(updated));
    }

    // GET /api/profiles/count - get total number of users
    @GetMapping("/profiles/count")
    public ResponseEntity<Map<String, Long>> getUserCount() {
        return ResponseEntity.ok(Map.of("count", userProfileRepository.count()));
    }
}
