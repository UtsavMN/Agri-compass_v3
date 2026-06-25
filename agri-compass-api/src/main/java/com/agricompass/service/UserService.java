package com.agricompass.service;

import com.agricompass.entity.UserProfile;
import com.agricompass.repository.UserProfileRepository;
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
            return null;
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
}
