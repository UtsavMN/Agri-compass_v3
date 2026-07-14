package com.agricompass.controller;

import com.agricompass.entity.FarmUpdate;
import com.agricompass.repository.FarmUpdateRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api")
public class FarmUpdateController {

    private final FarmUpdateRepository farmUpdateRepository;

    public FarmUpdateController(FarmUpdateRepository farmUpdateRepository) {
        this.farmUpdateRepository = farmUpdateRepository;
    }

    @GetMapping("/farms/{farmId}/updates")
    public ResponseEntity<List<FarmUpdate>> getUpdatesByFarm(@PathVariable String farmId) {
        List<FarmUpdate> updates = farmUpdateRepository.findByFarmIdOrderByCreatedAtDesc(farmId);
        return ResponseEntity.ok(updates);
    }

    @PostMapping("/farms/{farmId}/updates")
    public ResponseEntity<FarmUpdate> createUpdate(@PathVariable String farmId, @RequestBody FarmUpdate update) {
        update.setFarmId(farmId);
        FarmUpdate savedUpdate = farmUpdateRepository.save(update);
        return ResponseEntity.ok(savedUpdate);
    }

    @PutMapping("/farm-updates/{id}")
    public ResponseEntity<FarmUpdate> updateFarmUpdate(@PathVariable String id, @RequestBody FarmUpdate updateRequest) {
        Optional<FarmUpdate> existingOpt = farmUpdateRepository.findById(id);
        if (existingOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        FarmUpdate existingUpdate = existingOpt.get();
        // Only allow updating text as per requirements
        existingUpdate.setPostText(updateRequest.getPostText());
        
        FarmUpdate savedUpdate = farmUpdateRepository.save(existingUpdate);
        return ResponseEntity.ok(savedUpdate);
    }
}
