package com.agricompass.controller;

import com.agricompass.entity.FertilizerAnalysis;
import com.agricompass.service.FertilizerService;
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

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class FertilizerControllerTest {

    private MockMvc mockMvc;

    @Mock
    private FertilizerService fertilizerService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        FertilizerController controller = new FertilizerController(fertilizerService);
        mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
    }

    @Test
    @DisplayName("Integration: POST /api/fertilizer/recommend returns recommendation")
    void getRecommendation_shouldReturnRecommendation() throws Exception {
        Map<String, Object> req = Map.of(
                "crop", "rice",
                "soil_n", 20.0,
                "soil_p", 15.0,
                "soil_k", 15.0
        );

        when(fertilizerService.calculateRecommendation("rice", 20.0, 15.0, 15.0))
                .thenReturn(Map.of("crop", "Rice", "recommended_urea_kg", 50.0));

        mockMvc.perform(post("/api/fertilizer/recommend")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.crop").value("Rice"))
                .andExpect(jsonPath("$.recommended_urea_kg").value(50.0));
    }

    @Test
    @DisplayName("Integration: POST /api/fertilizer/analyze returns advanced analysis")
    void analyzeFertilizer_shouldReturnAnalysis() throws Exception {
        Map<String, Object> req = Map.of(
                "crop", "rice",
                "soil_n", 20.0,
                "soil_p", 15.0,
                "soil_k", 15.0,
                "soil_level", "medium",
                "soil_ph", "neutral",
                "growth_stage", "basal"
        );

        when(fertilizerService.advancedAnalysis("rice", 20.0, 15.0, 15.0, "medium", "neutral", "basal"))
                .thenReturn(Map.of("soil_health_score", 85, "explanations", List.of("Healthy soil")));

        mockMvc.perform(post("/api/fertilizer/analyze")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.soil_health_score").value(85));
    }

    @Test
    @DisplayName("Integration: GET /api/fertilizer/history/{farmId} returns list of analyses")
    void getHistory_withValidFarmId_shouldReturnHistory() throws Exception {
        FertilizerAnalysis analysis = new FertilizerAnalysis();
        analysis.setFarmId("farm-101");
        analysis.setCrop("rice");
        analysis.setResultJson("{\"soil_health_score\":85}");

        when(fertilizerService.getAnalysisHistory("farm-101")).thenReturn(List.of(analysis));

        mockMvc.perform(get("/api/fertilizer/history/farm-101")
                        .header("X-User-Id", "user_123"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].farmId").value("farm-101"))
                .andExpect(jsonPath("$[0].crop").value("rice"));
    }

    @Test
    @DisplayName("Regression: GET /api/fertilizer/history/{farmId} with 'undefined' returns empty list without calling service")
    void getHistory_withUndefinedFarmId_shouldReturnEmptyList() throws Exception {
        mockMvc.perform(get("/api/fertilizer/history/undefined"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(0));

        verify(fertilizerService, never()).getAnalysisHistory(anyString());
    }

    @Test
    @DisplayName("Regression: GET /api/fertilizer/history/{farmId} with 'null' returns empty list without calling service")
    void getHistory_withNullStringFarmId_shouldReturnEmptyList() throws Exception {
        mockMvc.perform(get("/api/fertilizer/history/null"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(0));

        verify(fertilizerService, never()).getAnalysisHistory(anyString());
    }
}
