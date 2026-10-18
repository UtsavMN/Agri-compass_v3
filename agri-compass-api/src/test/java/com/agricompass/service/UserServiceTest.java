package com.agricompass.service;

import com.agricompass.entity.UserProfile;
import com.agricompass.repository.UserProfileRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;

import java.util.Collections;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserProfileRepository userProfileRepository;

    private UserService userService;

    @BeforeEach
    void setUp() {
        userService = new UserService(userProfileRepository);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("White-box: syncUserProfile creates new profile when user does not exist")
    void syncUserProfile_whenNewUser_shouldCreateAndSaveProfile() {
        Jwt jwt = Jwt.withTokenValue("mock-token")
                .header("alg", "none")
                .subject("user_clerk_123")
                .claim("username", "farmer_ramesh")
                .claim("name", "Ramesh Kumar")
                .build();

        when(userProfileRepository.findById("user_clerk_123")).thenReturn(Optional.empty());
        when(userProfileRepository.save(any(UserProfile.class))).thenAnswer(inv -> inv.getArgument(0));

        UserProfile profile = userService.syncUserProfile(jwt);

        assertThat(profile).isNotNull();
        assertThat(profile.getClerkUserId()).isEqualTo("user_clerk_123");
        assertThat(profile.getUsernameHandle()).isEqualTo("farmer_ramesh");
        assertThat(profile.getFullName()).isEqualTo("Ramesh Kumar");
        assertThat(profile.getDistrict()).isEqualTo("Unknown");
        verify(userProfileRepository).save(any(UserProfile.class));
    }

    @Test
    @DisplayName("White-box: syncUserProfile returns existing profile when already in database")
    void syncUserProfile_whenExistingUser_shouldReturnExisting() {
        Jwt jwt = Jwt.withTokenValue("mock-token")
                .header("alg", "none")
                .subject("user_clerk_existing")
                .claim("username", "existing_farmer")
                .build();

        UserProfile existing = new UserProfile();
        existing.setClerkUserId("user_clerk_existing");
        existing.setFullName("Existing Farmer");

        when(userProfileRepository.findById("user_clerk_existing")).thenReturn(Optional.of(existing));

        UserProfile profile = userService.syncUserProfile(jwt);

        assertThat(profile).isNotNull();
        assertThat(profile.getClerkUserId()).isEqualTo("user_clerk_existing");
        assertThat(profile.getFullName()).isEqualTo("Existing Farmer");
        verify(userProfileRepository, never()).save(any(UserProfile.class));
    }

    @Test
    @DisplayName("White-box: syncUserProfile falls back to clerkId when username claim is absent")
    void syncUserProfile_whenUsernameClaimMissing_shouldDefaultToClerkId() {
        Jwt jwt = Jwt.withTokenValue("mock-token")
                .header("alg", "none")
                .subject("user_no_username")
                .build();

        when(userProfileRepository.findById("user_no_username")).thenReturn(Optional.empty());
        when(userProfileRepository.save(any(UserProfile.class))).thenAnswer(inv -> inv.getArgument(0));

        UserProfile profile = userService.syncUserProfile(jwt);

        assertThat(profile.getUsernameHandle()).isEqualTo("user_no_username");
        assertThat(profile.getFullName()).isEqualTo("New User");
    }

    @Test
    @DisplayName("White-box: syncUserProfile extracts JWT from SecurityContextHolder when passed null")
    void syncUserProfile_withNullJwt_shouldExtractFromSecurityContext() {
        Jwt jwt = Jwt.withTokenValue("context-token")
                .header("alg", "none")
                .subject("context_user")
                .claim("name", "Context Farmer")
                .build();

        var auth = new UsernamePasswordAuthenticationToken(jwt, null, Collections.emptyList());
        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(auth);
        SecurityContextHolder.setContext(context);

        when(userProfileRepository.findById("context_user")).thenReturn(Optional.empty());
        when(userProfileRepository.save(any(UserProfile.class))).thenAnswer(inv -> inv.getArgument(0));

        UserProfile profile = userService.syncUserProfile(null);

        assertThat(profile).isNotNull();
        assertThat(profile.getClerkUserId()).isEqualTo("context_user");
        assertThat(profile.getFullName()).isEqualTo("Context Farmer");
    }

    @Test
    @DisplayName("White-box: syncUserProfile falls back to auth name when principal is not Jwt")
    void syncUserProfile_withNonJwtAuthentication_shouldUseAuthName() {
        var auth = new UsernamePasswordAuthenticationToken("clerk_auth_name_only", "credentials");
        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(auth);
        SecurityContextHolder.setContext(context);

        when(userProfileRepository.findById("clerk_auth_name_only")).thenReturn(Optional.empty());
        when(userProfileRepository.save(any(UserProfile.class))).thenAnswer(inv -> inv.getArgument(0));

        UserProfile profile = userService.syncUserProfile(null);

        assertThat(profile).isNotNull();
        assertThat(profile.getClerkUserId()).isEqualTo("clerk_auth_name_only");
        assertThat(profile.getFullName()).isEqualTo("New User");
    }

    @Test
    @DisplayName("Unit test: syncUserProfile returns null when no authentication exists")
    void syncUserProfile_withoutAnyAuth_shouldReturnNull() {
        SecurityContextHolder.clearContext();
        UserProfile profile = userService.syncUserProfile(null);
        assertThat(profile).isNull();
    }

    @Test
    @DisplayName("White-box: updateProfileForUser updates all provided fields correctly")
    void updateProfileForUser_shouldUpdateProvidedFields() {
        UserProfile existing = new UserProfile();
        existing.setClerkUserId("user-update-1");
        existing.setFullName("Old Name");
        existing.setDistrict("Old District");

        when(userProfileRepository.findById("user-update-1")).thenReturn(Optional.of(existing));
        when(userProfileRepository.save(any(UserProfile.class))).thenAnswer(inv -> inv.getArgument(0));

        UserProfile updated = userService.updateProfileForUser(
                "user-update-1",
                "New Name",
                "https://avatar.url/img.png",
                "Mysuru",
                "+919876543210",
                "kn",
                "Dharwad",
                "new_handle",
                "Organic Ragi Farmer"
        );

        assertThat(updated.getFullName()).isEqualTo("New Name");
        assertThat(updated.getProfilePictureUrl()).isEqualTo("https://avatar.url/img.png");
        assertThat(updated.getPhone()).isEqualTo("+919876543210");
        assertThat(updated.getLanguage()).isEqualTo("kn");
        assertThat(updated.getDistrict()).isEqualTo("Dharwad");
        assertThat(updated.getUsernameHandle()).isEqualTo("new_handle");
        assertThat(updated.getBio()).isEqualTo("Organic Ragi Farmer");
    }

    @Test
    @DisplayName("Unit test: updateProfileForUser throws RuntimeException when profile does not exist")
    void updateProfileForUser_whenProfileNotFound_shouldThrow() {
        when(userProfileRepository.findById("non-existent")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.updateProfileForUser("non-existent", "Name", null, null, null, null, null, null, null))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Profile not found for id: non-existent");
    }

    @Test
    @DisplayName("Unit test: getProfileById and countUsers delegate to repository")
    void repositoryDelegations_shouldWork() {
        UserProfile sample = new UserProfile();
        sample.setClerkUserId("id-789");
        when(userProfileRepository.findById("id-789")).thenReturn(Optional.of(sample));
        when(userProfileRepository.count()).thenReturn(42L);

        assertThat(userService.getProfileById("id-789")).isEqualTo(sample);
        assertThat(userService.countUsers()).isEqualTo(42L);
    }
}
