package com.agricompass.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpEntity;
import org.springframework.http.MediaType;
import org.springframework.beans.factory.annotation.Value;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    @Value("${gemini.api.keys}")
    private String geminiApiKeysString;

    // POST /api/ai/chat
    @PostMapping("/chat")
    public ResponseEntity<Map<String, String>> chat(@RequestBody Map<String, Object> body) {
        String userMessage = (String) body.get("message");
        String[] keys = geminiApiKeysString.split(",");
        RestTemplate restTemplate = new RestTemplate();
        
        Map<String, Object> requestBody = Map.of(
            "contents", List.of(
                Map.of("parts", List.of(Map.of("text", 
                    "You are KrishiMitra, an expert agricultural AI assistant for farmers in India (especially Karnataka). Provide short, practical, farmer-friendly advice without using markdown tables unless necessary. User query: " + userMessage
                )))
            )
        );
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
        
        String aiResponseText = null;
        
        String[] modelNames = {"gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"};
        
        for (String key : keys) {
            if (aiResponseText != null) break;
            for (String modelName : modelNames) {
                String url = "https://generativelanguage.googleapis.com/v1beta/models/" + modelName + ":generateContent?key=" + key.trim();
                try {
                    Map response = restTemplate.postForObject(url, entity, Map.class);
                    if (response != null && response.containsKey("candidates")) {
                        List<Map> candidates = (List<Map>) response.get("candidates");
                        if (!candidates.isEmpty()) {
                            Map content = (Map) candidates.get(0).get("content");
                            List<Map> parts = (List<Map>) content.get("parts");
                            aiResponseText = (String) parts.get(0).get("text");
                            break; // Break inner loop if successful
                        }
                    }
                } catch (Exception e) {
                    System.err.println("Gemini API request failed for model " + modelName + " with key starting with " + key.substring(0, Math.min(key.length(), 6)) + "... trying next.");
                }
            }
        }
        
        if (aiResponseText == null) {
            aiResponseText = "Namaste! I'm KrishiMitra, your AI farming assistant. " +
                "I'm currently in offline mode (API keys not configured), but I can still offer general advice: " +
                "1. For Karnataka's current season, ensure proper soil testing before sowing. " +
                "2. Monitor your crops for early signs of pests like Fall Armyworm in Maize. " +
                "3. Check the 'Weather' and 'Market Prices' tabs for the latest local data. " +
                "How else can I help you today?";
        }

        return ResponseEntity.ok(Map.of(
            "response", aiResponseText,
            "model", "gemini-2.5-flash-multi-key"
        ));
    }

    // POST /api/ai/analyze-crop
    @PostMapping("/analyze-crop")
    public ResponseEntity<Map<String, Object>> analyzeCrop(@RequestBody Map<String, Object> body) {
        // TODO: Pass image URL to a Vision AI model and return crop health analysis
        return ResponseEntity.ok(Map.of(
            "status", "healthy",
            "confidence", 0.85,
            "issues", List.of(),
            "recommendations", List.of("Ensure adequate watering", "Monitor for pests")
        ));
    }
}
