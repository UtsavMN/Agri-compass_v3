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
            String url = "https://newsapi.org/v2/everything" +
                "?qInTitle=agriculture+OR+farming+OR+Karnataka" +
                "&language=en&sortBy=publishedAt&pageSize=4" +
                "&apiKey=" + newsApiKey;

            RestTemplate restTemplate = new RestTemplate();
            ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
            return ResponseEntity.ok(response.getBody());
        } catch (Exception e) {
            log.error("Failed to fetch news: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }
}
