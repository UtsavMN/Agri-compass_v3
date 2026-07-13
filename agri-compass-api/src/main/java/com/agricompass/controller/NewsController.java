package com.agricompass.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
            String rssUrl = "https://news.google.com/rss/search?q=agriculture+Karnataka&hl=en-IN&gl=IN&ceid=IN:en";
            
            javax.xml.parsers.DocumentBuilderFactory factory = javax.xml.parsers.DocumentBuilderFactory.newInstance();
            javax.xml.parsers.DocumentBuilder builder = factory.newDocumentBuilder();
            org.w3c.dom.Document doc = builder.parse(new java.net.URL(rssUrl).openStream());
            
            org.w3c.dom.NodeList items = doc.getElementsByTagName("item");
            
            java.util.List<Map<String, Object>> articles = new java.util.ArrayList<>();
            int count = Math.min(items.getLength(), 4);
            
            for (int i = 0; i < count; i++) {
                org.w3c.dom.Element item = (org.w3c.dom.Element) items.item(i);
                
                String title = getTagValue(item, "title");
                String link = getTagValue(item, "link");
                String pubDate = getTagValue(item, "pubDate");
                String sourceName = getTagValue(item, "source");
                
                Map<String, Object> article = new java.util.HashMap<>();
                article.put("title", title != null ? title : "Agricultural Update");
                article.put("url", link != null ? link : "#");
                article.put("publishedAt", pubDate);
                article.put("urlToImage", "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?q=80&w=600&auto=format&fit=crop");
                
                Map<String, String> source = new java.util.HashMap<>();
                source.put("name", sourceName != null ? sourceName : "Google News");
                article.put("source", source);
                
                articles.add(article);
            }
            
            if (articles.isEmpty()) {
                return ResponseEntity.ok(Map.of("articles", getFallbackNews()));
            }
            return ResponseEntity.ok(Map.of("articles", articles));
        } catch (Exception e) {
            log.error("Failed to fetch news from Google RSS: {}", e.getMessage(), e);
            return ResponseEntity.ok(Map.of("articles", getFallbackNews()));
        }
    }

    private String getTagValue(org.w3c.dom.Element element, String tagName) {
        org.w3c.dom.NodeList nodeList = element.getElementsByTagName(tagName);
        if (nodeList != null && nodeList.getLength() > 0) {
            org.w3c.dom.Node node = nodeList.item(0);
            if (node != null && node.getTextContent() != null) {
                return node.getTextContent().trim();
            }
        }
        return null;
    }

    private java.util.List<Map<String, Object>> getFallbackNews() {
        return java.util.List.of(
            Map.of(
                "title", "Karnataka Government Announces New Subsidies for Drip Irrigation",
                "description", "To combat changing climate patterns, new subsidies aim to help farmers adopt water-efficient technologies.",
                "url", "https://agricoop.nic.in/",
                "publishedAt", java.time.LocalDateTime.now().minusDays(1).toString() + "Z",
                "urlToImage", "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?q=80&w=600&auto=format&fit=crop",
                "source", Map.of("name", "Agri News")
            ),
            Map.of(
                "title", "Areca Nut Prices Hit Record Highs in Shivamogga Markets",
                "description", "High demand and recent weather conditions have pushed Areca nut prices to new highs this week.",
                "url", "https://krishimaratavahini.kar.nic.in/",
                "publishedAt", java.time.LocalDateTime.now().minusDays(2).toString() + "Z",
                "urlToImage", "https://images.unsplash.com/photo-1599839619722-39751411ea63?q=80&w=600&auto=format&fit=crop",
                "source", Map.of("name", "Agri News")
            )
        );
    }
}
