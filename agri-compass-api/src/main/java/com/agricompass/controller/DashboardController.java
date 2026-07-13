package com.agricompass.controller;

import com.agricompass.entity.UserProfile;
import com.agricompass.repository.UserProfileRepository;
import com.agricompass.repository.PostRepository;
import com.agricompass.repository.CropRepository;
import com.agricompass.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.HashMap;
import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private UserProfileRepository userProfileRepository;
    
    @Autowired
    private PostRepository postRepository;
    
    @Autowired
    private CropRepository cropRepository;

    @Autowired
    private UserService userService;

    @GetMapping("/summary")
    public ResponseEntity<?> getDashboardSummary() {
        // Since we are mocking the missing services based on what exists in the project:
        String currentUserId = userService.syncUser(null).getId();
        UserProfile profile = userProfileRepository.findByIdIgnoreCase(currentUserId).orElse(null);
        
        long userCount = userProfileRepository.count();
        // Just return some basic data to fulfill the frontend's single-call requirement
        Map<String, Object> summary = new HashMap<>();
        summary.put("profile", profile);
        summary.put("posts", postRepository.findAll().stream().limit(3).toList());
        summary.put("userCount", userCount);
        summary.put("crops", cropRepository.findAll().stream().limit(6).toList());
        
        return ResponseEntity.ok(summary);
    }
}
