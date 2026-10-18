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
        com.agricompass.entity.UserProfile user = userService.syncUser(null);
        if (user == null || user.getId() == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(savedSchemeRepository.findByClerkUserIdOrderByCreatedAtDesc(user.getId()));
    }

    @PostMapping("/save")
    public ResponseEntity<SavedScheme> saveScheme(@RequestBody Map<String, String> body) {
        com.agricompass.entity.UserProfile user = userService.syncUser(null);
        if (user == null || user.getId() == null) {
            return ResponseEntity.status(401).build();
        }
        String userId = user.getId();
        String schemeId = body != null ? body.get("schemeId") : null;
        if (schemeId == null || schemeId.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        
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
        com.agricompass.entity.UserProfile user = userService.syncUser(null);
        if (user == null || user.getId() == null) {
            return ResponseEntity.status(401).build();
        }
        savedSchemeRepository.deleteByClerkUserIdAndSchemeId(user.getId(), schemeId);
        return ResponseEntity.noContent().build();
    }
}
