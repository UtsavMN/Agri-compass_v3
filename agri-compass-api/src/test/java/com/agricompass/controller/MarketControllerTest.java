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
class MarketControllerTest {

    private MockMvc mockMvc;

    @Mock
    private RestTemplate restTemplate;

    private MarketController controller;

    @BeforeEach
    void setUp() {
        controller = new MarketController(restTemplate);
        mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
    }

    @Test
    @DisplayName("GET /api/market/prices returns empty prices when API key is default or missing")
    void getMarketPrices_unconfiguredKey_returnsEmptyPricesGracefully() throws Exception {
        ReflectionTestUtils.setField(controller, "dataGovApiKey", "default");

        mockMvc.perform(get("/api/market/prices")
                        .param("district", "Mandya"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.prices.length()").value(0))
                .andExpect(jsonPath("$.district").value("Mandya"))
                .andExpect(jsonPath("$.message").value("Market API key not configured"));

        verifyNoInteractions(restTemplate);
    }

    @Test
    @DisplayName("GET /api/market/prices transforms district name and parses Data.gov.in records")
    void getMarketPrices_validKey_fetchesAndParsesData() throws Exception {
        ReflectionTestUtils.setField(controller, "dataGovApiKey", "valid-test-key-55");

        Map<String, Object> mockRecord = Map.of(
                "commodity", "Tomato",
                "market", "Shimoga APMC",
                "district", "Shimoga",
                "min_price", "1200",
                "max_price", "1800",
                "modal_price", "1500",
                "arrival_date", "18/10/2026"
        );
        Map<String, Object> mockResponse = Map.of("records", List.of(mockRecord));

        when(restTemplate.getForObject(anyString(), eq(Map.class))).thenReturn(mockResponse);

        mockMvc.perform(get("/api/market/prices")
                        .param("district", "Shivamogga")
                        .param("limit", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.district").value("Shivamogga"))
                .andExpect(jsonPath("$.prices[0].commodity").value("Tomato"))
                .andExpect(jsonPath("$.prices[0].market").value("Shimoga APMC"))
                .andExpect(jsonPath("$.prices[0].minPrice").value(1200.0))
                .andExpect(jsonPath("$.prices[0].maxPrice").value(1800.0))
                .andExpect(jsonPath("$.prices[0].modalPrice").value(1500.0));
    }

    @Test
    @DisplayName("GET /api/market/prices gracefully handles upstream API exceptions without 500 error")
    void getMarketPrices_apiError_returnsEmptyPricesSafely() throws Exception {
        ReflectionTestUtils.setField(controller, "dataGovApiKey", "valid-test-key-55");

        when(restTemplate.getForObject(anyString(), eq(Map.class)))
                .thenThrow(new RuntimeException("Upstream timeout"));

        mockMvc.perform(get("/api/market/prices")
                        .param("district", "Mysuru"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.prices.length()").value(0))
                .andExpect(jsonPath("$.district").value("Mysuru"));
    }
}
