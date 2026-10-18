package com.agricompass.service;

import com.agricompass.controller.MarketController;
import com.agricompass.entity.KrishiMandiPrice;
import com.agricompass.repository.KrishiMandiPriceRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@DisplayName("Krishi Marata Vahini - 7-Step End-to-End Ingestion & Verification Suite")
public class KrishiMandiEndToEndIntegrationTest {

    @Autowired
    private KrishiMandiService krishiMandiService;

    @Autowired
    private KrishiMandiPriceRepository krishiMandiPriceRepository;

    @MockBean
    private RestTemplate restTemplate;

    private MarketController marketController;

    @BeforeEach
    void setUp() {
        krishiMandiPriceRepository.deleteAll();
        marketController = new MarketController(restTemplate, krishiMandiService);
    }

    private Map<String, Object> createValidKmvRecord(String market, String district, String commodity, String variety,
                                                     double min, double modal, double max, double arrivals, String date) {
        Map<String, Object> map = new java.util.HashMap<>();
        map.put("market", market);
        map.put("district", district);
        map.put("commodity", commodity);
        map.put("variety", variety);
        map.put("grade", "MEDIUM");
        map.put("minPrice", min);
        map.put("modalPrice", modal);
        map.put("maxPrice", max);
        map.put("arrivalQuantity", arrivals);
        map.put("arrivalUnit", "Quintal");
        map.put("priceUnit", "Rs/Quintal");
        map.put("reportDate", date);
        map.put("source", "KRISHI_MARATA_VAHINI");
        map.put("state", "Karnataka");
        return map;
    }

    @Test
    @DisplayName("Step 1 & 2: Import known KMV report and confirm records appear in database and market API")
    void testStep1And2_ImportAndConfirmInDbAndApi() {
        var record1 = createValidKmvRecord("Haveri", "Haveri", "MAIZE", "LOCAL", 2350, 2500, 2600, 8832, "2026-10-01");
        var record2 = createValidKmvRecord("Ranebennur", "Haveri", "MAIZE", "LOCAL", 2300, 2480, 2550, 4120, "2026-10-01");

        // 1. Import
        var result = krishiMandiService.ingestSnapshot(List.of(record1, record2));
        assertEquals(2, result.get("ingestedCount"));
        assertEquals(0, result.get("rejectedCount"));

        // 2. Confirm in DB
        List<KrishiMandiPrice> dbRecords = krishiMandiPriceRepository.findByDistrictIgnoreCaseOrderByReportDateDesc("Haveri");
        assertEquals(2, dbRecords.size());
        assertEquals(2500.0, dbRecords.stream().filter(r -> r.getMarket().equals("Haveri")).findFirst().get().getModalPrice());

        // Confirm in Market API (Frontend endpoint)
        ResponseEntity<?> response = marketController.getMarketPrices("Haveri", 20);
        assertNotNull(response.getBody());
        @SuppressWarnings("unchecked")
        Map<String, Object> body = (Map<String, Object>) response.getBody();
        assertEquals("KRISHI_MARATA_VAHINI", body.get("source"));
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> prices = (List<Map<String, Object>>) body.get("prices");
        assertEquals(2, prices.size());
        assertEquals("MAIZE", prices.get(0).get("commodity"));
        assertEquals("2026-10-01", prices.get(0).get("date"));
        assertEquals("KRISHI_MARATA_VAHINI", prices.get(0).get("source"));
    }

    @Test
    @DisplayName("Step 3: Re-import same report and confirm zero duplicates (idempotency)")
    void testStep3_ReImportNoDuplicates() {
        var record1 = createValidKmvRecord("Haveri", "Haveri", "MAIZE", "LOCAL", 2350, 2500, 2600, 8832, "2026-10-01");

        // First import
        krishiMandiService.ingestSnapshot(List.of(record1));
        assertEquals(1, krishiMandiPriceRepository.count());

        // Re-import exact same report
        var reimportResult = krishiMandiService.ingestSnapshot(List.of(record1));
        assertEquals(1, reimportResult.get("ingestedCount"));

        // Confirm DB count remains 1 - zero duplicates created!
        assertEquals(1, krishiMandiPriceRepository.count());
    }

    @Test
    @DisplayName("Step 4: Simulate failed/malformed import and confirm existing snapshot remains intact")
    void testStep4_SimulateFailedImportSnapshotPreserved() {
        // Valid snapshot initially
        var valid = createValidKmvRecord("Haveri", "Haveri", "MAIZE", "LOCAL", 2350, 2500, 2600, 8832, "2026-10-01");
        krishiMandiService.ingestSnapshot(List.of(valid));
        assertEquals(1, krishiMandiPriceRepository.count());

        // Incomplete / invalid payload: min > max, negative prices, missing market
        Map<String, Object> invalidRow1 = Map.of(
                "market", "Haveri",
                "district", "Haveri",
                "commodity", "MAIZE",
                "minPrice", 3000.0,
                "maxPrice", 2000.0, // Invalid: min > max
                "modalPrice", 2500.0,
                "reportDate", "2026-10-02"
        );
        Map<String, Object> invalidRow2 = Map.of(
                "district", "Haveri",
                "commodity", "MAIZE", // Missing market
                "minPrice", 1000.0,
                "maxPrice", 2000.0,
                "modalPrice", 1500.0,
                "reportDate", "2026-10-02"
        );

        assertThrows(IllegalStateException.class, () -> {
            krishiMandiService.ingestSnapshot(List.of(invalidRow1, invalidRow2));
        });

        // Confirm existing snapshot was NOT deleted or corrupted
        List<KrishiMandiPrice> after = krishiMandiPriceRepository.findByDistrictIgnoreCaseOrderByReportDateDesc("Haveri");
        assertEquals(1, after.size());
        assertEquals("Haveri", after.get(0).getMarket());
        assertEquals(2500.0, after.get(0).getModalPrice());
        assertEquals("2026-10-01", after.get(0).getReportDate());
    }

    @Test
    @DisplayName("Step 5: Verify correct source and exact report date formatting")
    void testStep5_VerifySourceAndReportDate() {
        String reportDate = "2026-10-05";
        var record = createValidKmvRecord("Dharwad", "Dharwad", "SOYABEAN", "YELLOW", 4100, 4250, 4400, 1500, reportDate);
        krishiMandiService.ingestSnapshot(List.of(record));

        ResponseEntity<?> response = marketController.getMarketPrices("Dharwad", 10);
        @SuppressWarnings("unchecked")
        Map<String, Object> body = (Map<String, Object>) response.getBody();
        assertNotNull(body);
        assertEquals("KRISHI_MARATA_VAHINI", body.get("source"));

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> prices = (List<Map<String, Object>>) body.get("prices");
        assertFalse(prices.isEmpty());
        Map<String, Object> item = prices.get(0);
        assertEquals("2026-10-05", item.get("date"));
        assertEquals("KRISHI_MARATA_VAHINI", item.get("source"));
        assertNotEquals(LocalDate.now().toString(), item.get("date")); // Never mislabeled as today
    }

    @Test
    @DisplayName("Step 6: Test 30-day cutoff expiry and reappearance upon new report")
    void testStep6_ExpiryAt30DaysAndReappearance() {
        // Record reported 35 days ago
        String expiredDate = LocalDate.now().minusDays(35).toString();
        var oldRecord = createValidKmvRecord("Shimoga", "Shimoga", "PADDY", "FINE", 2000, 2150, 2200, 500, expiredDate);
        krishiMandiService.ingestSnapshot(List.of(oldRecord));
        assertEquals(1, krishiMandiPriceRepository.count());

        // Run automated 30-day purge
        int purged = krishiMandiService.purgeExpiredRecords();
        assertEquals(1, purged);
        assertEquals(0, krishiMandiPriceRepository.count());

        // API now returns empty list for KMV
        ResponseEntity<?> emptyResp = marketController.getMarketPrices("Shimoga", 10);
        @SuppressWarnings("unchecked")
        Map<String, Object> emptyBody = (Map<String, Object>) emptyResp.getBody();
        // Since no DataGov key is set in test, falls back cleanly with empty prices
        @SuppressWarnings("unchecked")
        List<?> emptyPrices = (List<?>) emptyBody.get("prices");
        assertTrue(emptyPrices.isEmpty());

        // Now a newly published record arrives
        String freshDate = LocalDate.now().minusDays(2).toString();
        var freshRecord = createValidKmvRecord("Shimoga", "Shimoga", "PADDY", "FINE", 2200, 2300, 2400, 650, freshDate);
        krishiMandiService.ingestSnapshot(List.of(freshRecord));

        // It reappears in database and API
        assertEquals(1, krishiMandiPriceRepository.count());
        ResponseEntity<?> freshResp = marketController.getMarketPrices("Shimoga", 10);
        @SuppressWarnings("unchecked")
        Map<String, Object> freshBody = (Map<String, Object>) freshResp.getBody();
        assertEquals("KRISHI_MARATA_VAHINI", freshBody.get("source"));
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> reappearedPrices = (List<Map<String, Object>>) freshBody.get("prices");
        assertEquals(1, reappearedPrices.size());
        assertEquals(2300.0, reappearedPrices.get(0).get("modalPrice"));
    }

    @Test
    @DisplayName("Step 7: Test fallback behavior when no KMV snapshot exists")
    void testStep7_FallbackBehavior() {
        // For a district with NO KMV data (e.g. Bangalore)
        ResponseEntity<?> response = marketController.getMarketPrices("Bangalore", 10);
        assertNotNull(response.getBody());
        @SuppressWarnings("unchecked")
        Map<String, Object> body = (Map<String, Object>) response.getBody();

        // Source is NOT KRISHI_MARATA_VAHINI
        assertNotEquals("KRISHI_MARATA_VAHINI", body.get("source"));
        // API handled request gracefully without error
        assertEquals(200, response.getStatusCode().value());
    }
}
