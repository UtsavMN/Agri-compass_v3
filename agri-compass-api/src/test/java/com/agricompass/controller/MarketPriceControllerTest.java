package com.agricompass.controller;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class MarketPriceControllerTest {

    private MockMvc mockMvc;

    @Mock
    private RestTemplate restTemplate;

    private MarketPriceController controller;

    @BeforeEach
    void setUp() {
        controller = new MarketPriceController(restTemplate);
        mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
    }

    @Test
    @DisplayName("GET /api/market-prices/live returns empty records response if API key is placeholder")
    void getLiveMarketPrices_placeholderKey_returnsEmptyResponse() throws Exception {
        ReflectionTestUtils.setField(controller, "apiKey", "your-api-key");

        mockMvc.perform(get("/api/market-prices/live")
                        .param("commodity", "Onion")
                        .param("district", "Kolar"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ok"))
                .andExpect(jsonPath("$.records.length()").value(0))
                .andExpect(jsonPath("$.message").value("No market records found for Onion in Kolar"));

        verifyNoInteractions(restTemplate);
    }

    @Test
    @DisplayName("GET /api/market-prices/live returns records when upstream API responds successfully")
    void getLiveMarketPrices_validKey_returnsRecords() throws Exception {
        ReflectionTestUtils.setField(controller, "apiKey", "live-key-xyz");

        Map<String, Object> upstreamPayload = Map.of(
                "status", "ok",
                "records", List.of(Map.of("commodity", "Tomato", "market", "Kolar APMC", "modal_price", "2000")),
                "total", 1,
                "count", 1
        );

        when(restTemplate.getForObject(anyString(), eq(Map.class))).thenReturn(upstreamPayload);

        mockMvc.perform(get("/api/market-prices/live")
                        .param("commodity", "Tomato")
                        .param("state", "Karnataka")
                        .param("district", "Kolar")
                        .param("limit", "5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ok"))
                .andExpect(jsonPath("$.records[0].commodity").value("Tomato"))
                .andExpect(jsonPath("$.records[0].market").value("Kolar APMC"));
    }

    @Test
    @DisplayName("GET /api/market-prices/live falls back to empty response if upstream throws exception")
    void getLiveMarketPrices_upstreamError_returnsEmptyGracefully() throws Exception {
        ReflectionTestUtils.setField(controller, "apiKey", "live-key-xyz");

        when(restTemplate.getForObject(anyString(), eq(Map.class))).thenThrow(new RuntimeException("Connection reset"));

        mockMvc.perform(get("/api/market-prices/live")
                        .param("commodity", "Tomato"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.records.length()").value(0))
                .andExpect(jsonPath("$.status").value("ok"));
    }

    @Test
    @DisplayName("GET /api/market-prices/latest delegates to default Tomato Karnataka query")
    void getLatestPrices_callsDefaultCommodity() throws Exception {
        ReflectionTestUtils.setField(controller, "apiKey", "default");

        mockMvc.perform(get("/api/market-prices/latest"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ok"))
                .andExpect(jsonPath("$.message").value("No market records found for Tomato"));
    }
}
