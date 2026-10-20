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

    @Mock
    private com.agricompass.service.KrishiMandiService krishiMandiService;

    private MarketController controller;

    @BeforeEach
    void setUp() {
        controller = new MarketController(restTemplate, krishiMandiService);
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

    @Test
    @DisplayName("GET /api/market/prices returns verified Krishi Marata Vahini prices when available")
    void getMarketPrices_withKmvData_returnsKmvPrices() throws Exception {
        com.agricompass.entity.KrishiMandiPrice price = new com.agricompass.entity.KrishiMandiPrice();
        price.setId("kmv-1");
        price.setCommodity("Maize");
        price.setMarket("Haveri");
        price.setDistrict("Haveri");
        price.setVariety("LOCAL");
        price.setGrade("MEDIUM");
        price.setMinPrice(2350.0);
        price.setMaxPrice(2600.0);
        price.setModalPrice(2500.0);
        price.setArrivalQuantity(8832.0);
        price.setArrivalUnit("Quintal");
        price.setPriceUnit("Rs/Quintal");
        price.setReportDate("2026-10-18");
        price.setSource("KRISHI_MARATA_VAHINI");

        when(krishiMandiService.getPrices("Haveri", "Maize")).thenReturn(List.of(price));

        mockMvc.perform(get("/api/market/prices")
                        .param("district", "Haveri")
                        .param("commodity", "Maize"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.source").value("KRISHI_MARATA_VAHINI"))
                .andExpect(jsonPath("$.district").value("Haveri"))
                .andExpect(jsonPath("$.commodity").value("Maize"))
                .andExpect(jsonPath("$.prices[0].commodity").value("Maize"))
                .andExpect(jsonPath("$.prices[0].market").value("Haveri"))
                .andExpect(jsonPath("$.prices[0].modalPrice").value(2500.0))
                .andExpect(jsonPath("$.prices[0].arrivalQuantity").value(8832.0));

        verifyNoInteractions(restTemplate);
    }

    @Test
    @DisplayName("GET /api/market/prices works statewide when district parameter is omitted")
    void getMarketPrices_statewide_returnsAllKarnataka() throws Exception {
        com.agricompass.entity.KrishiMandiPrice p1 = new com.agricompass.entity.KrishiMandiPrice();
        p1.setCommodity("Tomato");
        p1.setMarket("Kolar");
        p1.setDistrict("Kolar");
        p1.setModalPrice(1500.0);
        p1.setReportDate("2026-10-18");
        p1.setSource("KRISHI_MARATA_VAHINI");

        when(krishiMandiService.getPrices(null, null)).thenReturn(List.of(p1));

        mockMvc.perform(get("/api/market/prices"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.source").value("KRISHI_MARATA_VAHINI"))
                .andExpect(jsonPath("$.district").value("All Districts"))
                .andExpect(jsonPath("$.prices[0].commodity").value("Tomato"));
    }

    @Test
    @DisplayName("GET /api/market/commodities returns distinct commodity list")
    void getCommodities_returnsList() throws Exception {
        when(krishiMandiService.getDistinctCommodities()).thenReturn(List.of("Arecanut", "Cotton", "Maize", "Tomato"));

        mockMvc.perform(get("/api/market/commodities"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0]").value("Arecanut"))
                .andExpect(jsonPath("$[3]").value("Tomato"));
    }

    @Test
    @DisplayName("GET /api/market/districts returns distinct district list")
    void getDistricts_returnsList() throws Exception {
        when(krishiMandiService.getDistinctDistricts()).thenReturn(List.of("Belagavi", "Haveri", "Kolar", "Shivamogga"));

        mockMvc.perform(get("/api/market/districts"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0]").value("Belagavi"))
                .andExpect(jsonPath("$[1]").value("Haveri"));
    }

    @Test
    @DisplayName("GET /api/market/summary returns aggregated market statistics")
    void getSummary_returnsStatistics() throws Exception {
        com.agricompass.entity.KrishiMandiPrice p1 = new com.agricompass.entity.KrishiMandiPrice();
        p1.setMarket("Haveri");
        p1.setDistrict("Haveri");
        p1.setCommodity("Maize");
        p1.setModalPrice(2500.0);
        p1.setReportDate("2026-10-18");

        com.agricompass.entity.KrishiMandiPrice p2 = new com.agricompass.entity.KrishiMandiPrice();
        p2.setMarket("Kolar");
        p2.setDistrict("Kolar");
        p2.setCommodity("Tomato");
        p2.setModalPrice(1500.0);
        p2.setReportDate("2026-10-18");

        when(krishiMandiService.getPrices(null, null)).thenReturn(List.of(p1, p2));

        mockMvc.perform(get("/api/market/summary"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalMandis").value(2))
                .andExpect(jsonPath("$.totalCommodities").value(2))
                .andExpect(jsonPath("$.totalDistricts").value(2))
                .andExpect(jsonPath("$.totalRecords").value(2))
                .andExpect(jsonPath("$.avgModalPrice").value(2000.0))
                .andExpect(jsonPath("$.source").value("KRISHI_MARATA_VAHINI"));
    }
}
