package com.agricompass.service;

import com.agricompass.entity.UserProfile;
import com.agricompass.repository.UserProfileRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class UserService {

    private final UserProfileRepository userProfileRepository;

    public UserService(UserProfileRepository userProfileRepository) {
        this.userProfileRepository = userProfileRepository;
    }

    @Transactional
    public UserProfile syncUserProfile(Jwt jwt) {
        if (jwt == null) {
            // Try to get JWT from SecurityContext
            var auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getPrincipal() instanceof Jwt contextJwt) {
                jwt = contextJwt;
            } else if (auth != null && auth.getName() != null) {
                // Fallback: use auth name as clerk ID
                String clerkId = auth.getName();
                Optional<UserProfile> existingProfile = userProfileRepository.findById(clerkId);
                if (existingProfile.isPresent()) {
                    return existingProfile.get();
                }
                UserProfile profile = new UserProfile();
                profile.setClerkUserId(clerkId);
                profile.setUsernameHandle(clerkId);
                profile.setFullName("New User");
                profile.setDistrict("Unknown");
                return userProfileRepository.save(profile);
            } else {
                return null;
            }
        }

        String clerkId = jwt.getSubject();
        String username = jwt.getClaimAsString("username");
        if (username == null) {
            username = clerkId;
        }

        Optional<UserProfile> existingProfile = userProfileRepository.findById(clerkId);
        UserProfile profile;

        if (existingProfile.isPresent()) {
            profile = existingProfile.get();
        } else {
            profile = new UserProfile();
            profile.setClerkUserId(clerkId);
            profile.setUsernameHandle(username);
            profile.setFullName(jwt.getClaimAsString("name") != null ? jwt.getClaimAsString("name") : "New User");
            profile.setDistrict("Unknown");
            profile = userProfileRepository.save(profile);
        }

        return profile;
    }

    public UserProfile syncUser(Object ignored) {
        return syncUserProfile(null);
    }

    public UserProfile getProfileById(String id) {
        return userProfileRepository.findById(id).orElse(null);
    }

    @Transactional
    public UserProfile updateProfileForUser(String id, String fullName, String avatarUrl, String location, String phone, String languagePreference, String district, String usernameHandle, String bio) {
        UserProfile profile = userProfileRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Profile not found for id: " + id));

        if (fullName != null) profile.setFullName(fullName);
        if (avatarUrl != null) profile.setProfilePictureUrl(avatarUrl);
        if (location != null) profile.setDistrict(location);
        if (phone != null) profile.setPhone(phone);
        if (languagePreference != null) profile.setLanguage(languagePreference);
        if (district != null) profile.setDistrict(district);
        if (usernameHandle != null) profile.setUsernameHandle(usernameHandle);
        if (bio != null) profile.setBio(bio);

        return userProfileRepository.save(profile);
    }

    @Transactional
    public UserProfile updateProfile(String fullName, String avatarUrl, String location, String phone, String languagePreference, String district, String usernameHandle, String bio) {
        UserProfile current = syncUser(null);
        if (current == null) {
            throw new RuntimeException("No authenticated user found");
        }
        return updateProfileForUser(current.getId(), fullName, avatarUrl, location, phone, languagePreference, district, usernameHandle, bio);
    }

    public UserProfile updateProfile(UserProfile profile) {
        return userProfileRepository.save(profile);
    }

    public long countUsers() {
        return userProfileRepository.count();
    }
}
