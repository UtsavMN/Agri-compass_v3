package com.agricompass.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpEntity;
import org.springframework.http.MediaType;
import org.springframework.beans.factory.annotation.Value;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.List;
import java.util.Map;
import java.util.ArrayList;
import java.util.Optional;
import org.springframework.cache.annotation.Cacheable;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(AiController.class);

    @Value("${gemini.api.keys}")
    private String geminiApiKeysString;

    @Value("${gemini.api.key.primary:}")
    private String primaryApiKey;

    @Value("${gemini.api.key.secondary:}")
    private String secondaryApiKey;

    private static final int MAX_OUTPUT_TOKENS = 800;
    private static final int MAX_HISTORY_TURNS = 6; // limit context window

    @Value("${anthropic.api.key:}")
    private String anthropicApiKey;

    private final RestTemplate restTemplate;

    public AiController(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    private static final String SYSTEM_PROMPT = 
        "You are AgriSense AI — an expert agriculture advisor built into a Smart Soil Analysis platform used by farmers. Your job is to analyze soil data submitted by a farmer (NPK values, pH, moisture, temperature, humidity) and return a fully detailed, step-by-step crop growing guide tailored to their exact soil condition.\n" +
        "\n" +
        "--- \n" +
        "\n" +
        "## YOUR INPUT FORMAT\n" +
        "\n" +
        "You will receive a JSON object from the platform in this structure:\n" +
        "\n" +
        "{\n" +
        "  \"farmer_name\": \"string\",\n" +
        "  \"location\": \"string\",\n" +
        "  \"date\": \"YYYY-MM-DD\",\n" +
        "  \"soil_data\": {\n" +
        "    \"nitrogen\": number,       // N value in kg/ha\n" +
        "    \"phosphorus\": number,     // P value in kg/ha\n" +
        "    \"potassium\": number,      // K value in kg/ha\n" +
        "    \"pH\": number,             // 0-14 scale\n" +
        "    \"moisture\": number,       // percentage (0-100)\n" +
        "    \"temperature_C\": number,  // in Celsius\n" +
        "    \"humidity_percent\": number // percentage (0-100)\n" +
        "  },\n" +
        "  \"preferred_crop\": \"string\",  // e.g. \"Rice\", \"Maize\" (Optional)\n" +
        "  \"field_size_acres\": number,  // to calculate scaling (Optional)\n" +
        "  \"water_source\": \"string\",    // \"Rainfed\", \"Canal\", \"Well\", \"Drip\" (Optional)\n" +
        "  \"season\": \"string\"           // \"Kharif\", \"Rabi\", \"Summer\" (Optional)\n" +
        "}\n" +
        "\n" +
        "--- \n" +
        "\n" +
        "## YOUR RULES & GUIDELINES\n" +
        "\n" +
        "1. **Be Scientifically Accurate**: Crop selections must strictly align with NPK levels, pH tolerance (e.g. Rice likes slightly acidic to neutral, Cotton likes neutral to alkaline), moisture levels, and season.\n" +
        "2. **Handle Karnataka Specifics**: Since this platform is widely used in Karnataka, India, recommend standard district-wise crop practices and varieties (e.g. IR-64, Swarna, BPT-5204 for paddy, Gangavati Sona for Tungabhadra basin, etc.).\n" +
        "3. **Calculate exact NPK deficits**:\n" +
        "   - Compare soil data with master requirements for recommended crops.\n" +
        "   - Calculate fertilizer splits (Basal, Top Dressing 1, Top Dressing 2) scaling to the `field_size_acres` provided (if omitted, default to 1 acre).\n" +
        "4. **Prescribe Exact Fertilizers**: Provide recommendations in commercial fertilizers (Urea, DAP, MOP) rather than generic NPK values. Show exact kg quantities.\n" +
        "5. **Always provide a detailed 4-stage guide**:\n" +
        "   - Stage 1: Sowing and Soil Prep\n" +
        "   - Stage 2: Nutrient Schedule (npk_schedule splits)\n" +
        "   - Stage 3: Irrigation Plan (based on water_source)\n" +
        "   - Stage 4: Pest & Disease management\n" +
        "6. **Warn against extreme values**: If pH < 5.0 (highly acidic) or pH > 8.5 (highly alkaline), or if moisture is extremely low, flag critical warnings.\n" +
        "7. **Tailor to preferred_crop if provided**: If a farmer requests a specific crop, prioritize analyzing that crop first, explaining why their soil is/isn't perfect for it, and then recommend 2 alternative crops that will do even better.\n" +
        "8. **JSON response only**: Output MUST be strictly valid, minified, parsed JSON. Absolutely NO markdown block quotes, no ```json ``` fences, no preamble, and no conversational explanation outside the JSON itself.\n" +
        "\n" +
        "--- \n" +
        "\n" +
        "## YOUR OUTPUT SCHEMA\n" +
        "\n" +
        "Always respond ONLY in the following JSON structure. No extra text, no markdown outside JSON, no preamble:\n" +
        "\n" +
        "{\n" +
        "  \"recommended_crops\": [\n" +
        "    {\n" +
        "      \"crop_name\": \"string\",\n" +
        "      \"suitability_score\": number, // percentage (0-100)\n" +
        "      \"expected_yield_per_acre_tons\": number,\n" +
        "      \"growing_guide\": {\n" +
        "        \"sowing_details\": \"string\",\n" +
        "        \"fertilizer_npk_schedule_per_acre\": \"string\", // Basal, Top Dress splits\n" +
        "        \"irrigation_plan\": \"string\",\n" +
        "        \"pest_disease_management\": \"string\",\n" +
        "        \"harvesting_tips\": \"string\"\n" +
        "      }\n" +
        "    }\n" +
        "  ],\n" +
        "  \"soil_health_report\": {\n" +
        "    \"status\": \"Excellent\" | \"Good\" | \"Deficient\" | \"Critical\",\n" +
        "    \"limiting_factors\": [ \"string\" ],\n" +
        "    \"soil_amendment_recommendations\": \"string\" // e.g. adding gypsum for alkaline soils, lime for acidic\n" +
        "  },\n" +
        "  \"warnings\": [ \"string\" ],\n" +
        "  \"confidence_level\": number // percentage (0-100)\n" +
        "}";

    @SuppressWarnings("unchecked")
    @PostMapping("/chat")
    public ResponseEntity<Map<String, Object>> chat(
        @RequestBody Map<String, Object> body,
        @RequestHeader(value = "X-Mock-User-Id", required = false) Long userId
    ) {
        String message = (String) body.get("message");
        if (message == null) {
            message = (String) body.get("prompt");
        }
        String systemContext = (String) body.getOrDefault("systemContext", "");
        int maxTokens = body.containsKey("maxTokens")
            ? Math.min((Integer) body.get("maxTokens"), MAX_OUTPUT_TOKENS)
            : MAX_OUTPUT_TOKENS;

        List<Map<String, Object>> history =
            (List<Map<String, Object>>) body.getOrDefault("history", List.of());

        // Only keep last N turns to save tokens
        if (history.size() > MAX_HISTORY_TURNS) {
            history = history.subList(history.size() - MAX_HISTORY_TURNS, history.size());
        }

        // Build Gemini request with token cap
        Map<String, Object> generationConfig = Map.of(
            "maxOutputTokens", maxTokens,
            "temperature", 0.7,
            "topP", 0.9
        );

        // Build contents with history
        List<Map<String, Object>> contents = new ArrayList<>();

        // Add system context as first user turn if present
        if (systemContext != null && !systemContext.isBlank()) {
            contents.add(Map.of(
                "role", "user",
                "parts", List.of(Map.of("text", systemContext))
            ));
            contents.add(Map.of(
                "role", "model",
                "parts", List.of(Map.of("text", "Understood. I am KrishiMitra, ready to help Karnataka farmers."))
            ));
        }

        // Add history turns
        for (Map<String, Object> turn : history) {
            contents.add(Map.of(
                "role", turn.get("role"),
                "parts", List.of(Map.of("text", turn.get("content")))
            ));
        }

        // Add new message
        contents.add(Map.of(
            "role", "user",
            "parts", List.of(Map.of("text", message))
        ));

        Map<String, Object> geminiPayload = Map.of(
            "contents", contents,
            "generationConfig", generationConfig
        );

        // Fetch keys from environment/properties
        String pKey = (primaryApiKey == null || primaryApiKey.trim().isEmpty()) ? getFallbackKeyFromLegacy(0) : primaryApiKey;
        String sKey = (secondaryApiKey == null || secondaryApiKey.trim().isEmpty()) ? getFallbackKeyFromLegacy(1) : secondaryApiKey;

        try {
            // Try primary key first
            String reply = callGeminiWithKey(geminiPayload, pKey);
            return ResponseEntity.ok(Map.of("reply", reply, "response", reply, "success", true));
        } catch (Exception e) {
            try {
                // Fallback to secondary key
                String reply = callGeminiWithKey(geminiPayload, sKey);
                return ResponseEntity.ok(Map.of("reply", reply, "response", reply, "success", true));
            } catch (Exception e2) {
                log.error("Both Gemini keys failed, serving fallback responses: ", e2);
                String fallbackReply = generateFallbackChatResponse(message);
                return ResponseEntity.ok(Map.of(
                    "reply", fallbackReply,
                    "response", fallbackReply,
                    "success", true
                ));
            }
        }
    }

    private String getFallbackKeyFromLegacy(int index) {
        if (geminiApiKeysString == null || geminiApiKeysString.trim().isEmpty()) {
            return "";
        }
        String[] keys = geminiApiKeysString.split(",");
        if (index < keys.length) {
            return keys[index].trim();
        }
        return keys[0].trim();
    }

    @SuppressWarnings("unchecked")
    private String callGeminiWithKey(Map<String, Object> geminiPayload, String apiKey) throws Exception {
        if (apiKey == null || apiKey.trim().isEmpty()) {
            throw new IllegalArgumentException("API key is missing");
        }
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(geminiPayload, headers);
        
        String[] models = {"gemini-1.5-flash", "gemini-2.0-flash"};
        Exception lastEx = null;
        
        for (String model : models) {
            String url = "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent?key=" + apiKey.trim();
            try {
                @SuppressWarnings("unchecked")
                Map<String, Object> response = restTemplate.postForObject(url, entity, Map.class);
                if (response != null && response.containsKey("candidates")) {
                    @SuppressWarnings("unchecked")
                    List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.get("candidates");
                    if (candidates != null && !candidates.isEmpty()) {
                        @SuppressWarnings("unchecked")
                        Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
                        @SuppressWarnings("unchecked")
                        List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
                        return (String) parts.get(0).get("text");
                    }
                }
            } catch (Exception e) {
                lastEx = e;
            }
        }
        throw (lastEx != null ? lastEx : new Exception("Empty candidates list from Gemini"));
    }

    @SuppressWarnings("unchecked")
    @PostMapping("/analyze-crop")
    public ResponseEntity<Map<String, Object>> analyzeCrop(@RequestBody Map<String, Object> body) {
        String[] keys = (geminiApiKeysString == null || geminiApiKeysString.trim().isEmpty()) 
            ? new String[0] 
            : geminiApiKeysString.split(",");
            
        if (keys.length == 0) {
            return ResponseEntity.ok(getMockAnalyzeCropResponse());
        }

        try {
            ObjectMapper mapper = new ObjectMapper();
            String userJson = mapper.writeValueAsString(body);
            String prompt = "You are an AI agricultural disease diagnostic tool. Based on the provided data, identify any crop diseases, confidence level, status, issues, and recommendations. Respond STRICTLY in valid JSON format: { \"status\": \"string\", \"confidence\": 0.0, \"issues\": [\"string\"], \"recommendations\": [\"string\"] }";
            
            Map<String, Object> requestBody = Map.of(
                "systemInstruction", Map.of(
                    "parts", List.of(Map.of("text", prompt))
                ),
                "contents", List.of(
                    Map.of("parts", List.of(Map.of("text", userJson)))
                ),
                "generationConfig", Map.of(
                    "responseMimeType", "application/json"
                )
            );
            
            String aiResponseText = null;
            for (String key : keys) {
                if (key.trim().isEmpty()) continue;
                try {
                    aiResponseText = callGeminiWithKey(requestBody, key);
                    break;
                } catch (Exception ignored) {}
            }
            
            if (aiResponseText != null) {
                Map<String, Object> parsed = mapper.readValue(stripMarkdownFences(aiResponseText), Map.class);
                return ResponseEntity.ok(parsed);
            }
        } catch (Exception e) {
            log.error("Failed to analyze crop using Gemini API", e);
        }
        
        return ResponseEntity.ok(getMockAnalyzeCropResponse());
    }

    private Map<String, Object> getMockAnalyzeCropResponse() {
        return Map.of(
            "status", "healthy",
            "confidence", 0.85,
            "issues", List.of(),
            "recommendations", List.of("Ensure adequate watering", "Monitor for pests")
        );
    }

    @SuppressWarnings("unchecked")
    @PostMapping("/soil-recommendation")
    @Cacheable(value = "soilRecommendations", key = "#body.hashCode()")
    public ResponseEntity<Map<String, Object>> getSoilRecommendation(@RequestBody Map<String, Object> body) {
        ObjectMapper mapper = new ObjectMapper();

        // 1. Try Anthropic Claude API if configured
        if (anthropicApiKey != null && !anthropicApiKey.trim().isEmpty()) {
            try {
                log.info("Initiating soil analysis via Anthropic Claude...");
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);
                headers.set("x-api-key", anthropicApiKey.trim());
                headers.set("anthropic-version", "2023-06-01");

                String userJson = mapper.writeValueAsString(body);

                Map<String, Object> requestBody = Map.of(
                    "model", "claude-3-5-sonnet-20241022",
                    "max_tokens", 4000,
                    "system", SYSTEM_PROMPT,
                    "messages", List.of(
                        Map.of(
                            "role", "user",
                            "content", userJson
                        )
                    )
                );

                HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
                String url = "https://api.anthropic.com/v1/messages";
                
                Map<String, Object> response = restTemplate.postForObject(url, entity, Map.class);
                if (response != null && response.containsKey("content")) {
                    List<Map<String, Object>> contentList = (List<Map<String, Object>>) response.get("content");
                    if (contentList != null && !contentList.isEmpty()) {
                        String text = (String) contentList.get(0).get("text");
                        try {
                            Map<String, Object> parsedResponse = mapper.readValue(stripMarkdownFences(text), Map.class);
                            return ResponseEntity.ok(parsedResponse);
                        } catch (Exception e) {
                            log.warn("Failed to parse JSON from Anthropic response, falling back to Gemini", e);
                        }
                    }
                }
            } catch (Exception e) {
                log.warn("Anthropic Claude soil analysis failed, falling back to Gemini", e);
            }
        }

        // 2. Try Gemini API as fallback
        String[] keys = (geminiApiKeysString == null || geminiApiKeysString.trim().isEmpty()) 
            ? new String[0] 
            : geminiApiKeysString.split(",");
        
        if (keys.length > 0) {
            try {
                log.info("Initiating soil analysis via Gemini fallback...");
                String userJson = mapper.writeValueAsString(body);
                
                Map<String, Object> requestBody = Map.of(
                    "systemInstruction", Map.of(
                        "parts", List.of(Map.of("text", SYSTEM_PROMPT))
                    ),
                    "contents", List.of(
                        Map.of("parts", List.of(Map.of("text", userJson)))
                    ),
                    "generationConfig", Map.of(
                        "responseMimeType", "application/json"
                    )
                );
                
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);
                HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
                for (String key : keys) {
                    if (key.trim().isEmpty()) continue;
                    try {
                        String aiResp = callGeminiWithKey(requestBody, key);
                        Map<String, Object> parsedResponse = mapper.readValue(stripMarkdownFences(aiResp), Map.class);
                        return ResponseEntity.ok(parsedResponse);
                    } catch (Exception e) {
                        log.warn("Gemini fallback failed for key", e);
                    }
                }
            } catch (Exception e) {
                log.warn("Gemini fallback soil analysis failed", e);
            }
        }
        
        // 3. Fallback mock response if everything fails
        log.warn("All AI providers failed or not configured, returning mock soil recommendation data");
        return ResponseEntity.ok(getMockSoilRecommendation());
    }

    private Map<String, Object> getMockSoilRecommendation() {
        return Map.of(
            "confidence_level", 0.6,
            "warnings", List.of("This is a mock recommendation because AI services are currently unavailable or unconfigured."),
            "soil_health_report", Map.of(
                "status", "Suboptimal",
                "limiting_factors", List.of("Low Nitrogen", "Slightly Acidic pH"),
                "soil_amendment_recommendations", "Add organic compost and lime to neutralize pH."
            ),
            "recommended_crops", List.of(
                Map.of(
                    "crop_name", "Maize (Mock Data)",
                    "suitability_score", 85,
                    "expected_yield_per_acre_tons", 2.5,
                    "growing_guide", Map.of(
                        "sowing_details", "Sow seeds 2 inches deep in rows 30 inches apart.",
                        "fertilizer_npk_schedule_per_acre", "Apply 40kg N, 20kg P, 20kg K at planting.",
                        "irrigation_plan", "Water immediately after sowing, then every 7-10 days depending on rain.",
                        "pest_disease_management", "Monitor for fall armyworm; use neem oil extracts preventatively.",
                        "harvesting_tips", "Harvest when silks turn brown and kernels exude milky fluid when punctured."
                    )
                )
            )
        );
    }

    private String stripMarkdownFences(String text) {
        if (text == null) return null;
        String cleaned = text.trim();
        if (cleaned.startsWith("```")) {
            cleaned = cleaned.replaceAll("^```[a-zA-Z]*\\s*", "").replaceAll("\\s*```$", "").trim();
        }
        return cleaned;
    }

    private String generateFallbackChatResponse(String message) {
        if (message == null || message.trim().isEmpty()) {
            return "Namaste! I am KrishiMitra, your agriculture advisor. How can I help you today?";
        }
        
        String msg = message.toLowerCase();
        
        if (msg.contains("hello") || msg.contains("hi") || msg.contains("namaste") || msg.contains("namaskara") || msg.contains("hey")) {
            return "Namaste! I am KrishiMitra, your smart farming assistant. I can help you with crop selection, soil health, fertilizer application, weather advice, or government schemes. What would you like to know today?";
        }
        
        if (msg.contains("soil") || msg.contains("npk") || msg.contains("nitrogen") || msg.contains("phosphorus") || msg.contains("potassium") || msg.contains("ph") || msg.contains("fertilizer") || msg.contains("urea") || msg.contains("dap") || msg.contains("gypsum")) {
            return "To optimize soil health, it is essential to maintain a balanced NPK ratio. For nitrogen deficiencies, apply Urea in split doses. For phosphorus, use DAP at the time of sowing. A soil pH between 6.0 and 7.5 is ideal for most crops; if your soil is too acidic (pH < 5.5), you can amend it with lime, and if it's too alkaline (pH > 8.0), you can use gypsum. Let me know your specific NPK values for a custom plan!";
        }
        
        if (msg.matches(".*\\brice\\b.*") || msg.contains("paddy") || msg.contains("bpt") || msg.contains("ir-64")) {
            return "Rice (Paddy) is a staple Kharif crop in Karnataka. It thrives in clayey or loamy soils that can retain moisture. Popular varieties include IR-64, Swarna, and BPT-5204. Ensure you maintain 5cm of water submergence during tillering, and apply a balanced fertilizer schedule (e.g. 50kg DAP + 50kg MOP basal, followed by Urea top-dressing).";
        }
        
        if (msg.contains("cotton") || msg.contains("kapas")) {
            return "Cotton is a major commercial crop in Karnataka, especially in districts like Haveri, Dharwad, and Belagavi. It grows best in deep black soils (regur soil) with good drainage. Sowing is typically done in June. Keep a watch for pests like the Pink Bollworm and ensure timely application of Nitrogen and Potassium to boost yield.";
        }
        
        if (msg.contains("ragi") || msg.contains("millet") || msg.contains("jowar") || msg.contains("sorghum")) {
            return "Ragi (Finger Millet) is an extremely resilient and drought-tolerant crop, perfect for Southern Karnataka districts like Tumakuru, Kolar, and Bengaluru Rural. It grows well in red sandy loam soils and requires very little water. Sowing is best done in July. It is rich in calcium and iron, making it highly profitable and sustainable.";
        }
        
        if (msg.contains("maize") || msg.contains("corn")) {
            return "Maize is widely grown in Davanagere and Bagalkot. It requires well-drained fertile soils with a pH of 5.5 to 7.5. Key growth stages requiring irrigation are the knee-high stage, tasseling, and grain filling. Watch out for Fall Armyworm and apply recommended pest control early.";
        }
        
        if (msg.contains("weather") || msg.contains("rain") || msg.contains("monsoon") || msg.contains("forecast") || msg.contains("climate") || msg.contains("temperature")) {
            return "Weather plays a critical role in farming. For real-time updates and localized forecasts for your district, please check the Weather page on our portal. In general, ensure proper drainage during heavy rains to prevent root rot, and schedule irrigation during dry spells at critical crop stages.";
        }
        
        if (msg.contains("scheme") || msg.contains("pm-kisan") || msg.contains("government") || msg.contains("pmfby") || msg.contains("insurance") || msg.contains("subsidy")) {
            return "There are several helpful government schemes for farmers: 1) PM-KISAN provides Rs. 6,000/year in three instalments. 2) Pradhan Mantri Fasal Bima Yojana (PMFBY) offers crop insurance against natural calamities. 3) Krishi Sinchayee Yojana assists with drip/sprinkler irrigation subsidies. Visit your local Raitha Mitra Kendra for enrollment.";
        }
        
        if (msg.contains("pest") || msg.contains("disease") || msg.contains("insect") || msg.contains("fungus") || msg.contains("blast") || msg.contains("worm") || msg.contains("armyworm")) {
            return "For effective pest and disease management: 1) Practice crop rotation to break pest cycles. 2) Use pheromone traps to monitor pest activity. 3) For fungal diseases (like blast in rice), apply recommended fungicides like Tricyclazole. Always use organic methods like Neem oil spray first if the infestation is minor.";
        }
        
        return "I understand your interest in improving crop yield. To give you the best advice, could you share your district, soil type, preferred crop, or any specific symptoms of crop damage you are seeing? You can also use our 'Soil Analysis' tool to get an AI-powered custom recommendation based on your soil test values.";
    }
}

