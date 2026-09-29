package com.agricompass.controller;

import com.agricompass.entity.SavedScheme;
import com.agricompass.repository.SavedSchemeRepository;
import com.agricompass.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/schemes")
public class SchemeController {

    private final SavedSchemeRepository savedSchemeRepository;
    private final UserService userService;

    public SchemeController(SavedSchemeRepository savedSchemeRepository, UserService userService) {
        this.savedSchemeRepository = savedSchemeRepository;
        this.userService = userService;
    }

    @GetMapping("/saved")
    public ResponseEntity<List<SavedScheme>> getSavedSchemes() {
        String userId = userService.syncUser(null).getId();
        return ResponseEntity.ok(savedSchemeRepository.findByClerkUserIdOrderByCreatedAtDesc(userId));
    }

    @PostMapping("/save")
    public ResponseEntity<SavedScheme> saveScheme(@RequestBody Map<String, String> body) {
        String userId = userService.syncUser(null).getId();
        String schemeId = body.get("schemeId");
        
        Optional<SavedScheme> existing = savedSchemeRepository.findByClerkUserIdAndSchemeId(userId, schemeId);
        if (existing.isPresent()) {
            return ResponseEntity.ok(existing.get());
        }

        SavedScheme saved = new SavedScheme();
        saved.setClerkUserId(userId);
        saved.setSchemeId(schemeId);
        return ResponseEntity.ok(savedSchemeRepository.save(saved));
    }

    @DeleteMapping("/save/{schemeId}")
    @Transactional
    public ResponseEntity<Void> removeScheme(@PathVariable String schemeId) {
        String userId = userService.syncUser(null).getId();
        savedSchemeRepository.deleteByClerkUserIdAndSchemeId(userId, schemeId);
        return ResponseEntity.noContent().build();
    }
}
