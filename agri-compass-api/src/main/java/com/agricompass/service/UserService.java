package com.agricompass.service;

import com.agricompass.entity.User;
import com.agricompass.entity.UserProfile;
import com.agricompass.repository.UserRepository;
import com.agricompass.repository.UserProfileRepository;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import jakarta.servlet.http.HttpServletRequest;

import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;

    public UserService(UserRepository userRepository, UserProfileRepository userProfileRepository) {
        this.userRepository = userRepository;
        this.userProfileRepository = userProfileRepository;
    }

    @Transactional
    public User syncUser(Jwt jwt) {
        if (jwt == null) {
            // Check for mock user header
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            String mockUserId = "dev_user";
            String mockName = "Dev User";
            if (attributes != null) {
                HttpServletRequest request = attributes.getRequest();
                String headerUser = request.getHeader("X-Mock-User-Id");
                if (headerUser != null && !headerUser.trim().isEmpty()) {
                    mockUserId = headerUser;
                    if (mockUserId.equals("user_a")) mockName = "Farmer A (Mock)";
                    else if (mockUserId.equals("user_b")) mockName = "Farmer B (Mock)";
                    else mockName = mockUserId;
                }
            }

            // Provide a mock user when security is disabled
            Optional<User> existingUser = userRepository.findByUsername(mockUserId);
            User user;
            if (existingUser.isPresent()) {
                user = existingUser.get();
            } else {
                user = User.builder()
                        .id(mockUserId)
                        .username(mockUserId)
                        .email(mockUserId + "@example.com")
                        .passwordHash("MOCK_AUTH")
                        .build();
                user = userRepository.save(user);
            }

            // Ensure profile exists for the mock user
            if (!userProfileRepository.existsById(mockUserId)) {
                UserProfile profile = UserProfile.builder()
                        .id(mockUserId)
                        .user(user)
                        .username(mockUserId)
                        .email(mockUserId + "@example.com")
                        .fullName(mockName)
                        .build();
                userProfileRepository.save(profile);
            }

            return user;
        }

        String clerkId = jwt.getSubject();
        String email = jwt.getClaimAsString("email");
        String username = jwt.getClaimAsString("username");
        if (username == null) {
            username = email != null ? email.split("@")[0] : clerkId;
        }

        Optional<User> existingUser = userRepository.findById(clerkId);
        User user;

        if (existingUser.isPresent()) {
            user = existingUser.get();
            // Update email if changed
            if (email != null && !email.equals(user.getEmail())) {
                user.setEmail(email);
                userRepository.save(user);
            }
            
            // Check if profile exists for existing user (self-healing)
            if (!userProfileRepository.existsById(clerkId)) {
                UserProfile profile = UserProfile.builder()
                        .id(clerkId)
                        .user(user)
                        .username(username)
                        .email(user.getEmail())
                        .fullName(jwt.getClaimAsString("name"))
                        .avatarUrl(jwt.getClaimAsString("picture"))
                        .build();
                userProfileRepository.save(profile);
            }
        } else {
            // Create new user
            user = User.builder()
                    .id(clerkId)
                    .username(username)
                    .email(email != null ? email : clerkId + "@clerk.user")
                    .passwordHash("EXTERNAL_AUTH") // Placeholder since auth is external
                    .build();
            user = userRepository.save(user);

            // Create initial profile
            UserProfile profile = UserProfile.builder()
                    .id(clerkId)
                    .user(user)
                    .username(username)
                    .email(user.getEmail())
                    .fullName(jwt.getClaimAsString("name"))
                    .avatarUrl(jwt.getClaimAsString("picture"))
                    .build();
            userProfileRepository.save(profile);
        }

        return user;
    }

    @Transactional
    public UserProfile syncUserProfile(Jwt jwt) {
        User user = syncUser(jwt);
        return userProfileRepository.findById(user.getId())
                .orElseThrow(() -> new RuntimeException("Profile not found for user: " + user.getId()));
    }

    @Transactional
    public UserProfile updateProfile(String fullName, String avatarUrl) {
        UserProfile profile = syncUserProfile(null);
        
        if (fullName != null) profile.setFullName(fullName);
        if (avatarUrl != null) profile.setAvatarUrl(avatarUrl);
        
        return userProfileRepository.save(profile);
    }
}
