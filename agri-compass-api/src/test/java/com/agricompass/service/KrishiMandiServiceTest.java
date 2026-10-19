package com.agricompass.service;

import com.agricompass.entity.KrishiMandiPrice;
import com.agricompass.repository.KrishiMandiPriceRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class KrishiMandiServiceTest {

    @Mock
    private KrishiMandiPriceRepository repository;

    private KrishiMandiService service;

    @BeforeEach
    void setUp() {
        service = new KrishiMandiService(repository);
    }

    @Test
    @DisplayName("ingestSnapshot validates and persists valid Krishi Marata Vahini records")
    void ingestSnapshot_validRecords_succeeds() {
        Map<String, Object> record1 = Map.of(
                "market", "Haveri",
                "commodity", "Maize",
                "variety", "Local",
                "district", "Haveri",
                "reportDate", "2026-10-18",
                "minPrice", 2350.0,
                "maxPrice", 2600.0,
                "modalPrice", 2500.0,
                "arrivalQuantity", 8832.0,
                "arrivalUnit", "Quintal"
        );

        when(repository.findByMarketIgnoreCaseAndCommodityIgnoreCaseAndVarietyIgnoreCaseAndGradeIgnoreCase(anyString(), anyString(), anyString(), anyString()))
                .thenReturn(Optional.empty());
        when(repository.saveAll(any())).thenAnswer(inv -> inv.getArgument(0));

        Map<String, Object> result = service.ingestSnapshot(List.of(record1));

        assertEquals("SUCCESS", result.get("status"));
        assertEquals(1, result.get("ingestedCount"));
        assertEquals(0, result.get("rejectedCount"));

        @SuppressWarnings("unchecked")
        ArgumentCaptor<List<KrishiMandiPrice>> captor = ArgumentCaptor.forClass(List.class);
        verify(repository).saveAll(captor.capture());

        KrishiMandiPrice saved = captor.getValue().get(0);
        assertEquals("KRISHI_MARATA_VAHINI", saved.getSource());
        assertEquals("Haveri", saved.getMarket());
        assertEquals("Maize", saved.getCommodity());
        assertEquals("LOCAL", saved.getVariety());
        assertEquals("2026-10-18", saved.getReportDate());
        assertEquals(2500.0, saved.getModalPrice());
    }

    @Test
    @DisplayName("ingestSnapshot throws IllegalArgumentException on null or empty payload without touching DB")
    void ingestSnapshot_emptyPayload_throws() {
        assertThrows(IllegalArgumentException.class, () -> service.ingestSnapshot(List.of()));
        assertThrows(IllegalArgumentException.class, () -> service.ingestSnapshot(null));
        verify(repository, never()).saveAll(any());
    }

    @Test
    @DisplayName("ingestSnapshot rejects rows with invalid prices (min > max or modal outside range)")
    void ingestSnapshot_invalidPrices_rejectsMalformedRows() {
        Map<String, Object> invalidMinMax = Map.of(
                "market", "Shimoga",
                "commodity", "Tomato",
                "reportDate", "2026-10-18",
                "minPrice", 3000.0,
                "maxPrice", 2000.0, // min > max
                "modalPrice", 2500.0
        );

        Map<String, Object> invalidModal = Map.of(
                "market", "Shimoga",
                "commodity", "Tomato",
                "reportDate", "2026-10-18",
                "minPrice", 2000.0,
                "maxPrice", 3000.0,
                "modalPrice", 4500.0 // modal > max
        );

        assertThrows(IllegalStateException.class, () -> service.ingestSnapshot(List.of(invalidMinMax, invalidModal)));
        verify(repository, never()).saveAll(any());
    }

    @Test
    @DisplayName("ingestSnapshot rejects rows with missing mandatory fields or invalid dates")
    void ingestSnapshot_missingFieldsOrMalformedDate_rejects() {
        Map<String, Object> missingMarket = Map.of(
                "commodity", "Ragi",
                "reportDate", "2026-10-18",
                "minPrice", 2000.0, "maxPrice", 2500.0, "modalPrice", 2200.0
        );

        Map<String, Object> invalidDate = Map.of(
                "market", "Mysuru",
                "commodity", "Ragi",
                "reportDate", "not-a-date",
                "minPrice", 2000.0, "maxPrice", 2500.0, "modalPrice", 2200.0
        );

        assertThrows(IllegalStateException.class, () -> service.ingestSnapshot(List.of(missingMarket, invalidDate)));
        verify(repository, never()).saveAll(any());
    }

    @Test
    @DisplayName("ingestSnapshot does not overwrite an existing newer report with an older report date")
    void ingestSnapshot_existingNewerReport_preservesNewer() {
        KrishiMandiPrice existingNewer = new KrishiMandiPrice();
        existingNewer.setId("kmv-1");
        existingNewer.setMarket("Haveri");
        existingNewer.setCommodity("Maize");
        existingNewer.setVariety("LOCAL");
        existingNewer.setReportDate("2026-10-18");
        existingNewer.setModalPrice(2600.0);

        when(repository.findByMarketIgnoreCaseAndCommodityIgnoreCaseAndVarietyIgnoreCaseAndGradeIgnoreCase(eq("Haveri"), eq("Maize"), eq("LOCAL"), anyString()))
                .thenReturn(Optional.of(existingNewer));

        // Incoming is older (2026-10-10)
        Map<String, Object> olderRecord = Map.of(
                "market", "Haveri",
                "commodity", "Maize",
                "variety", "Local",
                "district", "Haveri",
                "reportDate", "2026-10-10",
                "minPrice", 2200.0,
                "maxPrice", 2500.0,
                "modalPrice", 2300.0
        );

        assertThrows(IllegalStateException.class, () -> service.ingestSnapshot(List.of(olderRecord)));
        verify(repository, never()).saveAll(any());
    }

    @Test
    @DisplayName("purgeExpiredRecords deletes records older than 30 days based on Asia/Kolkata timezone")
    void purgeExpiredRecords_deletesPast30Days() {
        LocalDate todayKolkata = LocalDate.now(ZoneId.of("Asia/Kolkata"));
        LocalDate cutoff = todayKolkata.minusDays(30);

        when(repository.deleteByReportDateBefore(cutoff.toString())).thenReturn(14);

        int count = service.purgeExpiredRecords(30);
        assertEquals(14, count);
        verify(repository).deleteByReportDateBefore(cutoff.toString());
    }

    @Test
    @DisplayName("getPricesByDistrict returns district records or all when district is all")
    void getPricesByDistrict_queriesCorrectly() {
        KrishiMandiPrice p = new KrishiMandiPrice();
        p.setMarket("Shimoga");
        p.setDistrict("Shivamogga");

        when(repository.findByDistrictIgnoreCaseOrderByReportDateDesc("Shivamogga")).thenReturn(List.of(p));
        when(repository.findAllOrderByReportDateDesc()).thenReturn(List.of(p));

        List<KrishiMandiPrice> byDistrict = service.getPricesByDistrict("Shivamogga");
        assertEquals(1, byDistrict.size());

        List<KrishiMandiPrice> all = service.getPricesByDistrict("all");
        assertEquals(1, all.size());
    }
}
