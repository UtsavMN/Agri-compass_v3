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

    @Value("${kmv.ingest.key:kmv_internal_secret_key_2026}")
    private String ingestKey;

    private final KrishiMandiService krishiMandiService;

    public KrishiMandiController(KrishiMandiService krishiMandiService) {
        this.krishiMandiService = krishiMandiService;
    }

    /**
     * Internal secured snapshot ingestion endpoint.
     * Requires X-Ingest-Key header matching kmv.ingest.key.
     */
    @PostMapping("/snapshot")
    public ResponseEntity<?> ingestSnapshot(
            @RequestHeader(value = "X-Ingest-Key", required = false) String headerKey,
            @RequestBody List<Map<String, Object>> records) {

        if (headerKey == null || !headerKey.equals(ingestKey)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "error", "Unauthorized: Invalid or missing X-Ingest-Key header"
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

        if (headerKey == null || !headerKey.equals(ingestKey)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "error", "Unauthorized: Invalid or missing X-Ingest-Key header"
            ));
        }

        int purged = krishiMandiService.purgeExpiredRecords(days);
        return ResponseEntity.ok(Map.of("status", "SUCCESS", "purgedCount", purged, "cutoffDays", days));
    }
}
