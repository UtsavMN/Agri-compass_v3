package com.agricompass.controller;

import com.agricompass.entity.SavedScheme;
import com.agricompass.entity.UserProfile;
import com.agricompass.repository.SavedSchemeRepository;
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

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class SchemeControllerTest {

    private MockMvc mockMvc;

    @Mock
    private SavedSchemeRepository savedSchemeRepository;

    @Mock
    private UserService userService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        SchemeController controller = new SchemeController(savedSchemeRepository, userService);
        mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
    }

    @Test
    @DisplayName("GET /api/schemes/saved returns 401 Unauthorized when user is unauthenticated")
    void getSavedSchemes_unauthenticated_returns401() throws Exception {
        when(userService.syncUser(null)).thenReturn(null);

        mockMvc.perform(get("/api/schemes/saved"))
                .andExpect(status().isUnauthorized());

        verify(savedSchemeRepository, never()).findByClerkUserIdOrderByCreatedAtDesc(any());
    }

    @Test
    @DisplayName("GET /api/schemes/saved returns saved schemes list when authenticated")
    void getSavedSchemes_authenticated_returnsList() throws Exception {
        UserProfile user = new UserProfile();
        user.setId("user_scheme_123");
        when(userService.syncUser(null)).thenReturn(user);

        SavedScheme s1 = new SavedScheme();
        s1.setId("save-1");
        s1.setClerkUserId("user_scheme_123");
        s1.setSchemeId("pm-kisan");

        when(savedSchemeRepository.findByClerkUserIdOrderByCreatedAtDesc("user_scheme_123"))
                .thenReturn(List.of(s1));

        mockMvc.perform(get("/api/schemes/saved"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value("save-1"))
                .andExpect(jsonPath("$[0].schemeId").value("pm-kisan"));
    }

    @Test
    @DisplayName("POST /api/schemes/save returns 401 Unauthorized when unauthenticated")
    void saveScheme_unauthenticated_returns401() throws Exception {
        when(userService.syncUser(null)).thenReturn(null);

        mockMvc.perform(post("/api/schemes/save")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("schemeId", "pm-kisan"))))
                .andExpect(status().isUnauthorized());

        verify(savedSchemeRepository, never()).save(any());
    }

    @Test
    @DisplayName("POST /api/schemes/save returns 400 Bad Request when schemeId is missing or empty")
    void saveScheme_missingSchemeId_returns400() throws Exception {
        UserProfile user = new UserProfile();
        user.setId("user_scheme_123");
        when(userService.syncUser(null)).thenReturn(user);

        mockMvc.perform(post("/api/schemes/save")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("schemeId", "   "))))
                .andExpect(status().isBadRequest());

        verify(savedSchemeRepository, never()).save(any());
    }

    @Test
    @DisplayName("POST /api/schemes/save returns existing SavedScheme without re-inserting if already saved")
    void saveScheme_alreadySaved_returnsExistingIdempotently() throws Exception {
        UserProfile user = new UserProfile();
        user.setId("user_scheme_123");
        when(userService.syncUser(null)).thenReturn(user);

        SavedScheme existing = new SavedScheme();
        existing.setId("existing-id");
        existing.setClerkUserId("user_scheme_123");
        existing.setSchemeId("pm-kisan");

        when(savedSchemeRepository.findByClerkUserIdAndSchemeId("user_scheme_123", "pm-kisan"))
                .thenReturn(Optional.of(existing));

        mockMvc.perform(post("/api/schemes/save")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("schemeId", "pm-kisan"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("existing-id"))
                .andExpect(jsonPath("$.schemeId").value("pm-kisan"));

        verify(savedSchemeRepository, never()).save(any());
    }

    @Test
    @DisplayName("POST /api/schemes/save persists and returns new SavedScheme when not previously saved")
    void saveScheme_newScheme_savesAndReturns() throws Exception {
        UserProfile user = new UserProfile();
        user.setId("user_scheme_123");
        when(userService.syncUser(null)).thenReturn(user);

        when(savedSchemeRepository.findByClerkUserIdAndSchemeId("user_scheme_123", "pm-kisan"))
                .thenReturn(Optional.empty());

        when(savedSchemeRepository.save(any(SavedScheme.class))).thenAnswer(inv -> {
            SavedScheme s = inv.getArgument(0);
            s.setId("new-gen-id");
            return s;
        });

        mockMvc.perform(post("/api/schemes/save")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("schemeId", "pm-kisan"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("new-gen-id"))
                .andExpect(jsonPath("$.schemeId").value("pm-kisan"))
                .andExpect(jsonPath("$.clerkUserId").value("user_scheme_123"));

        verify(savedSchemeRepository).save(any(SavedScheme.class));
    }

    @Test
    @DisplayName("DELETE /api/schemes/save/{schemeId} returns 401 when unauthenticated")
    void removeScheme_unauthenticated_returns401() throws Exception {
        when(userService.syncUser(null)).thenReturn(null);

        mockMvc.perform(delete("/api/schemes/save/pm-kisan"))
                .andExpect(status().isUnauthorized());

        verify(savedSchemeRepository, never()).deleteByClerkUserIdAndSchemeId(any(), any());
    }

    @Test
    @DisplayName("DELETE /api/schemes/save/{schemeId} deletes mapping and returns 204 No Content")
    void removeScheme_authenticated_deletesAndReturns204() throws Exception {
        UserProfile user = new UserProfile();
        user.setId("user_scheme_123");
        when(userService.syncUser(null)).thenReturn(user);

        mockMvc.perform(delete("/api/schemes/save/pm-kisan"))
                .andExpect(status().isNoContent());

        verify(savedSchemeRepository).deleteByClerkUserIdAndSchemeId("user_scheme_123", "pm-kisan");
    }
}
