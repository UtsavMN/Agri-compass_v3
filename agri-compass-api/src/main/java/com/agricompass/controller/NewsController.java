package com.agricompass.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import java.util.Map;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/news")
@Slf4j
public class NewsController {

    @Value("${NEWS_API_KEY:demo}")
    private String newsApiKey;

    @GetMapping("/agriculture")
    public ResponseEntity<?> getAgriNews() {
        try {
            if ("demo".equals(newsApiKey) || newsApiKey.trim().isEmpty()) {
                log.warn("News API key is not configured (using demo). Returning fallback news.");
                return ResponseEntity.ok(Map.of("articles", getFallbackNews()));
            }

            String url = "https://newsapi.org/v2/everything" +
                "?qInTitle=agriculture+OR+farming+OR+Karnataka" +
                "&language=en&sortBy=publishedAt&pageSize=4" +
                "&apiKey=" + newsApiKey;

            RestTemplate restTemplate = new RestTemplate();
            ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
            return ResponseEntity.ok(response.getBody());
        } catch (Exception e) {
            log.error("Failed to fetch news: {}", e.getMessage(), e);
            return ResponseEntity.ok(Map.of("articles", getFallbackNews()));
        }
    }

    private java.util.List<Map<String, String>> getFallbackNews() {
        return java.util.List.of(
            Map.of(
                "title", "Karnataka Government Announces New Subsidies for Drip Irrigation",
                "description", "To combat changing climate patterns, new subsidies aim to help farmers adopt water-efficient technologies.",
                "url", "https://agricoop.nic.in/",
                "publishedAt", java.time.LocalDateTime.now().minusDays(1).toString() + "Z",
                "urlToImage", "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?q=80&w=600&auto=format&fit=crop"
            ),
            Map.of(
                "title", "Areca Nut Prices Hit Record Highs in Shivamogga Markets",
                "description", "High demand and recent weather conditions have pushed Areca nut prices to new highs this week.",
                "url", "https://krishimaratavahini.kar.nic.in/",
                "publishedAt", java.time.LocalDateTime.now().minusDays(2).toString() + "Z",
                "urlToImage", "https://images.unsplash.com/photo-1599839619722-39751411ea63?q=80&w=600&auto=format&fit=crop"
            )
        );
    }
}
