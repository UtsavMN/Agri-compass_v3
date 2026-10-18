package com.agricompass.controller;

import com.agricompass.entity.UserProfile;
import com.agricompass.repository.UserProfileRepository;
import com.agricompass.service.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.Map;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class ProfileControllerTest {

    private MockMvc mockMvc;

    @Mock
    private UserService userService;

    @Mock
    private UserProfileRepository userProfileRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        ProfileController controller = new ProfileController(userService, userProfileRepository);
        mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
    }

    @Test
    @DisplayName("GET /api/profile/me returns existing profile for authenticated user")
    void getMyProfile_existingUser_returnsProfile() throws Exception {
        UserProfile profile = new UserProfile();
        profile.setClerkUserId("user_123");
        profile.setFullName("Kavita Rao");
        profile.setUsernameHandle("kavita_r");
        profile.setDistrict("Mandya");

        when(userProfileRepository.findById("user_123")).thenReturn(Optional.of(profile));

        mockMvc.perform(get("/api/profile/me")
                        .header("X-User-Id", "user_123"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.clerkUserId").value("user_123"))
                .andExpect(jsonPath("$.fullName").value("Kavita Rao"))
                .andExpect(jsonPath("$.district").value("Mandya"));
    }

    @Test
    @DisplayName("GET /api/profile/me auto-initializes profile if user does not exist yet")
    void getMyProfile_newUser_createsAndReturnsDefault() throws Exception {
        when(userProfileRepository.findById("user_new_456")).thenReturn(Optional.empty());
        when(userProfileRepository.findByIdIgnoreCase("user_new_456")).thenReturn(Optional.empty());
        when(userProfileRepository.save(any(UserProfile.class))).thenAnswer(inv -> inv.getArgument(0));

        mockMvc.perform(get("/api/profile/me")
                        .header("X-User-Id", "user_new_456"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.clerkUserId").value("user_new_456"))
                .andExpect(jsonPath("$.fullName").value("Farmer"))
                .andExpect(jsonPath("$.state").value("Karnataka"));

        verify(userProfileRepository).save(any(UserProfile.class));
    }

    @Test
    @DisplayName("PUT /api/profiles updates profile fields correctly")
    void updateProfile_updatesFieldsAndPersists() throws Exception {
        UserProfile existing = new UserProfile();
        existing.setClerkUserId("user_123");
        existing.setFullName("Old Name");
        existing.setDistrict("Old District");

        when(userProfileRepository.findById("user_123")).thenReturn(Optional.of(existing));
        when(userProfileRepository.save(any(UserProfile.class))).thenAnswer(inv -> inv.getArgument(0));

        Map<String, Object> updates = Map.of(
                "fullName", "Suresh Kumar",
                "district", "Belagavi",
                "bio", "Passionate sugarcane grower",
                "phone", "9876543210"
        );

        mockMvc.perform(put("/api/profiles")
                        .header("X-User-Id", "user_123")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updates)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fullName").value("Suresh Kumar"))
                .andExpect(jsonPath("$.district").value("Belagavi"))
                .andExpect(jsonPath("$.bio").value("Passionate sugarcane grower"))
                .andExpect(jsonPath("$.phone").value("9876543210"));

        verify(userProfileRepository).save(existing);
    }

    @Test
    @DisplayName("PUT /api/profiles/{id} returns 403 Forbidden when user attempts to update another user's profile")
    void updateProfileById_crossUser_returns403() throws Exception {
        mockMvc.perform(put("/api/profiles/user_victim")
                        .header("X-User-Id", "user_attacker")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("fullName", "Hacked"))))
                .andExpect(status().isForbidden());

        verify(userProfileRepository, never()).save(any());
    }

    @Test
    @DisplayName("PUT /api/profiles/{id} succeeds when authorized user updates their own profile")
    void updateProfileById_owner_succeeds() throws Exception {
        UserProfile p = new UserProfile();
        p.setClerkUserId("user_owner");
        p.setFullName("Original Owner");

        when(userProfileRepository.findById("user_owner")).thenReturn(Optional.of(p));
        when(userProfileRepository.save(any(UserProfile.class))).thenAnswer(inv -> inv.getArgument(0));

        mockMvc.perform(put("/api/profiles/user_owner")
                        .header("X-User-Id", "user_owner")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("fullName", "Updated Owner"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fullName").value("Updated Owner"));

        verify(userProfileRepository).save(p);
    }

    @Test
    @DisplayName("POST /api/profile/setup marks onboarding completed as 1")
    void setupProfile_marksOnboardingCompleted() throws Exception {
        UserProfile p = new UserProfile();
        p.setClerkUserId("user_setup");
        p.setOnboardingCompleted(0);

        when(userProfileRepository.findById("user_setup")).thenReturn(Optional.of(p));
        when(userProfileRepository.save(any(UserProfile.class))).thenAnswer(inv -> inv.getArgument(0));

        Map<String, Object> req = Map.of(
                "fullName", "Farmer Onboarded",
                "district", "Mysuru"
        );

        mockMvc.perform(post("/api/profile/setup")
                        .header("X-User-Id", "user_setup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.onboardingCompleted").value(1))
                .andExpect(jsonPath("$.fullName").value("Farmer Onboarded"))
                .andExpect(jsonPath("$.district").value("Mysuru"));
    }

    @Test
    @DisplayName("GET /api/profiles/count returns total registered farmer profiles")
    void getUserCount_returnsCount() throws Exception {
        when(userProfileRepository.count()).thenReturn(142L);

        mockMvc.perform(get("/api/profiles/count"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.count").value(142));
    }
}
