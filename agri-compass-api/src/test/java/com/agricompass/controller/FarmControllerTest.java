package com.agricompass.controller;

import com.agricompass.entity.Farm;
import com.agricompass.entity.FarmDiagnostic;
import com.agricompass.repository.*;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class FarmControllerTest {

    private MockMvc mockMvc;

    @Mock
    private FarmRepository farmRepository;
    @Mock
    private WeatherLogRepository weatherLogRepository;
    @Mock
    private FarmImageRepository farmImageRepository;
    @Mock
    private UserService userService;
    @Mock
    private PostRepository postRepository;
    @Mock
    private FarmDiagnosticRepository farmDiagnosticRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        FarmController controller = new FarmController(
                farmRepository,
                weatherLogRepository,
                farmImageRepository,
                userService,
                postRepository,
                farmDiagnosticRepository
        );
        mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
    }

    @Test
    @DisplayName("Integration: GET /api/farms/{id}/diagnostics with X-User-Id header succeeds")
    void getFarmDiagnostics_withMatchingHeader_shouldReturnDiagnostics() throws Exception {
        Farm farm = Farm.builder()
                .id("farm-1")
                .userId("user_abc")
                .name("Green Acres")
                .location("Mandya")
                .build();

        FarmDiagnostic diag = new FarmDiagnostic();
        diag.setId("diag-1");
        diag.setFarmId("farm-1");
        diag.setClerkUserId("user_abc");
        diag.setHealthStatus("Optimal");
        diag.setNitrogen(45.0);

        when(farmRepository.findById("farm-1")).thenReturn(Optional.of(farm));
        when(farmDiagnosticRepository.findByFarmIdOrderByCreatedAtDesc("farm-1")).thenReturn(List.of(diag));

        mockMvc.perform(get("/api/farms/farm-1/diagnostics")
                        .header("X-User-Id", "user_abc"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value("diag-1"))
                .andExpect(jsonPath("$[0].healthStatus").value("Optimal"))
                .andExpect(jsonPath("$[0].nitrogen").value(45.0));
    }

    @Test
    @DisplayName("Regression: POST /api/farms/{id}/diagnostics saves diagnostic and updates farm soil health")
    void createFarmDiagnostic_shouldSaveDiagnosticAndUpdateFarm() throws Exception {
        Farm farm = Farm.builder()
                .id("farm-1")
                .userId("user_abc")
                .name("Green Acres")
                .location("Mandya")
                .build();

        when(farmRepository.findById("farm-1")).thenReturn(Optional.of(farm));
        when(farmDiagnosticRepository.save(any(FarmDiagnostic.class))).thenAnswer(inv -> inv.getArgument(0));

        Map<String, Object> req = Map.of(
                "nitrogen", 40.0,
                "phosphorus", 25.0,
                "potassium", 20.0,
                "ph", 6.8,
                "healthStatus", "Excellent",
                "aiReport", "{\"status\":\"healthy\"}"
        );

        mockMvc.perform(post("/api/farms/farm-1/diagnostics")
                        .header("X-User-Id", "user_abc")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nitrogen").value(40.0))
                .andExpect(jsonPath("$.healthStatus").value("Excellent"));

        verify(farmDiagnosticRepository).save(any(FarmDiagnostic.class));
        verify(farmRepository).save(farm);
    }
}
