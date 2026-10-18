package com.agricompass.controller;

import com.agricompass.entity.KrishiMandiPrice;
import com.agricompass.service.KrishiMandiService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class KrishiMandiControllerTest {

    private MockMvc mockMvc;

    @Mock
    private KrishiMandiService krishiMandiService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        KrishiMandiController controller = new KrishiMandiController(krishiMandiService);
        ReflectionTestUtils.setField(controller, "ingestKey", "test-secret-key-123");
        mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
    }

    @Test
    @DisplayName("POST /api/market/kmv/snapshot returns 401 Unauthorized when X-Ingest-Key is missing or invalid")
    void ingestSnapshot_missingOrInvalidKey_returns401() throws Exception {
        mockMvc.perform(post("/api/market/kmv/snapshot")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("[]"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(post("/api/market/kmv/snapshot")
                        .header("X-Ingest-Key", "wrong-key")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("[]"))
                .andExpect(status().isUnauthorized());

        verify(krishiMandiService, never()).ingestSnapshot(any());
    }

    @Test
    @DisplayName("POST /api/market/kmv/snapshot succeeds and returns ingested count with valid key")
    void ingestSnapshot_validKey_succeeds() throws Exception {
        Map<String, Object> reqRecord = Map.of(
                "market", "Haveri",
                "commodity", "Maize",
                "reportDate", "2026-10-18",
                "minPrice", 2350.0,
                "maxPrice", 2600.0,
                "modalPrice", 2500.0
        );

        when(krishiMandiService.ingestSnapshot(any())).thenReturn(Map.of(
                "status", "SUCCESS",
                "ingestedCount", 1,
                "rejectedCount", 0
        ));

        mockMvc.perform(post("/api/market/kmv/snapshot")
                        .header("X-Ingest-Key", "test-secret-key-123")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(List.of(reqRecord))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"))
                .andExpect(jsonPath("$.ingestedCount").value(1))
                .andExpect(jsonPath("$.rejectedCount").value(0));

        verify(krishiMandiService).ingestSnapshot(any());
    }

    @Test
    @DisplayName("GET /api/market/kmv/prices is publicly accessible without authentication")
    void getPrices_publiclyAccessible_returnsPrices() throws Exception {
        KrishiMandiPrice p = new KrishiMandiPrice();
        p.setId("p-1");
        p.setCommodity("Maize");
        p.setMarket("Haveri");
        p.setDistrict("Haveri");
        p.setReportDate("2026-10-18");
        p.setModalPrice(2500.0);

        when(krishiMandiService.getPrices("Haveri", "Maize")).thenReturn(List.of(p));

        mockMvc.perform(get("/api/market/kmv/prices")
                        .param("district", "Haveri")
                        .param("commodity", "Maize"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value("p-1"))
                .andExpect(jsonPath("$[0].commodity").value("Maize"))
                .andExpect(jsonPath("$[0].modalPrice").value(2500.0))
                .andExpect(jsonPath("$[0].reportDate").value("2026-10-18"));
    }

    @Test
    @DisplayName("POST /api/market/kmv/purge rejects unauthorized callers and purges with valid key")
    void purgeExpired_validatesKey() throws Exception {
        mockMvc.perform(post("/api/market/kmv/purge"))
                .andExpect(status().isUnauthorized());

        when(krishiMandiService.purgeExpiredRecords(30)).thenReturn(5);

        mockMvc.perform(post("/api/market/kmv/purge")
                        .header("X-Ingest-Key", "test-secret-key-123")
                        .param("days", "30"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"))
                .andExpect(jsonPath("$.purgedCount").value(5));
    }
}
