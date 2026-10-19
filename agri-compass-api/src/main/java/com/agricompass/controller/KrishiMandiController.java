package com.agricompass.controller;

import com.agricompass.entity.KrishiMandiPrice;
import com.agricompass.service.KrishiMandiService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/market/kmv")
public class KrishiMandiController {

    @Value("${kmv.ingest.key:}")
    private String ingestKey;

    private final KrishiMandiService krishiMandiService;

    public KrishiMandiController(KrishiMandiService krishiMandiService) {
        this.krishiMandiService = krishiMandiService;
    }

    private boolean isAuthorized(String headerKey) {
        return ingestKey != null && !ingestKey.isBlank() && ingestKey.equals(headerKey);
    }

    /**
     * Internal secured snapshot ingestion endpoint.
     * Requires X-Ingest-Key header matching kmv.ingest.key.
     */
    @PostMapping("/snapshot")
    public ResponseEntity<?> ingestSnapshot(
            @RequestHeader(value = "X-Ingest-Key", required = false) String headerKey,
            @RequestBody List<Map<String, Object>> records) {

        if (!isAuthorized(headerKey)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "error", "Unauthorized: Ingestion key is not configured or X-Ingest-Key is invalid"
            ));
        }

        try {
            Map<String, Object> result = krishiMandiService.ingestSnapshot(records);
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "error", "Snapshot ingestion failed: " + e.getMessage()
            ));
        }
    }

    /**
     * Public API endpoint to fetch verified Krishi Marata Vahini mandi prices.
     */
    @GetMapping("/prices")
    public ResponseEntity<List<KrishiMandiPrice>> getPrices(
            @RequestParam(required = false) String district,
            @RequestParam(required = false) String commodity) {
        return ResponseEntity.ok(krishiMandiService.getPrices(district, commodity));
    }

    /**
     * Internal secured manual expiry purge.
     */
    @PostMapping("/purge")
    public ResponseEntity<?> purgeExpired(
            @RequestHeader(value = "X-Ingest-Key", required = false) String headerKey,
            @RequestParam(defaultValue = "30") int days) {

        if (!isAuthorized(headerKey)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "error", "Unauthorized: Ingestion key is not configured or X-Ingest-Key is invalid"
            ));
        }

        int purged = krishiMandiService.purgeExpiredRecords(days);
        return ResponseEntity.ok(Map.of("status", "SUCCESS", "purgedCount", purged, "cutoffDays", days));
    }
}
