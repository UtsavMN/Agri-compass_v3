package com.agricompass.controller;

import com.agricompass.entity.Farm;
import com.agricompass.entity.FarmImage;
import com.agricompass.entity.WeatherLog;
import com.agricompass.repository.FarmImageRepository;
import com.agricompass.repository.FarmRepository;
import com.agricompass.repository.WeatherLogRepository;
import com.agricompass.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/farms")
@SuppressWarnings("null")
public class FarmController {

    private final FarmRepository farmRepository;
    private final WeatherLogRepository weatherLogRepository;
    private final FarmImageRepository farmImageRepository;
    private final UserService userService;
    private final com.agricompass.repository.PostRepository postRepository;

    public FarmController(FarmRepository farmRepository, WeatherLogRepository weatherLogRepository, FarmImageRepository farmImageRepository, UserService userService, com.agricompass.repository.PostRepository postRepository) {
        this.farmRepository = farmRepository;
        this.weatherLogRepository = weatherLogRepository;
        this.farmImageRepository = farmImageRepository;
        this.userService = userService;
        this.postRepository = postRepository;
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getFarms() {
        String userId = userService.syncUser(null).getId();
        return ResponseEntity.ok(farmRepository.findByClerkUserId(userId).stream().map(this::farmDto).toList());
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createFarm(@RequestBody Map<String, Object> body) {
        String userId = userService.syncUser(null).getId();
        Farm farm = Farm.builder()
            .userId(userId)
            .name((String) body.get("name"))
            .location((String) body.get("location"))
            .areaAcres(body.get("area_acres") != null ? ((Number) body.get("area_acres")).doubleValue() : null)
            .soilType((String) body.get("soil_type"))
            .irrigationType((String) body.get("irrigation_type"))
            .currentCrop((String) body.get("current_crop"))
            .build();
        return ResponseEntity.ok(farmDto(farmRepository.save(farm)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateFarm(@PathVariable String id, @RequestBody Map<String, Object> body) {
        String userId = userService.syncUser(null).getId();
        Farm farm = farmRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Farm not found"));

        if (!farm.getUserId().equals(userId)) {
            return ResponseEntity.status(403).build();
        }

        if (body.containsKey("name")) farm.setName((String) body.get("name"));
        if (body.containsKey("location")) farm.setLocation((String) body.get("location"));
        if (body.containsKey("area_acres")) farm.setAreaAcres(((Number) body.get("area_acres")).doubleValue());
        if (body.containsKey("soil_type")) farm.setSoilType((String) body.get("soil_type"));
        if (body.containsKey("irrigation_type")) farm.setIrrigationType((String) body.get("irrigation_type"));
        if (body.containsKey("current_crop")) farm.setCurrentCrop((String) body.get("current_crop"));

        return ResponseEntity.ok(farmDto(farmRepository.save(farm)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getFarm(@PathVariable String id) {
        Farm farm = farmRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Farm not found"));
        if (!farm.getUserId().equals(userService.syncUser(null).getId())) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(farmDto(farm));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFarm(@PathVariable String id) {
        Farm farm = farmRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Farm not found"));
        if (!farm.getUserId().equals(userService.syncUser(null).getId())) {
            return ResponseEntity.status(403).build();
        }
        farmRepository.delete(farm);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/weather")
    public ResponseEntity<Map<String, Object>> addWeatherLog(@PathVariable String id,
                                                       @RequestBody Map<String, Object> body) {
        String userId = userService.syncUser(null).getId();
        Farm farm = farmRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Farm not found"));

        if (!farm.getUserId().equals(userId)) {
            return ResponseEntity.status(403).build();
        }

        WeatherLog log = WeatherLog.builder()
            .farm(farm)
            .userId(userId)
            .notes((String) body.get("notes"))
            .temperature(body.get("temperature") != null ? ((Number) body.get("temperature")).doubleValue() : null)
            .humidity(body.get("humidity") != null ? ((Number) body.get("humidity")).doubleValue() : null)
            .conditions((String) body.get("conditions"))
            .build();
        weatherLogRepository.save(log);
        return ResponseEntity.ok(farmDto(farm));
    }

    @PostMapping("/{id}/images")
    public ResponseEntity<Map<String, Object>> addFarmImage(@PathVariable String id,
                                                     @RequestBody Map<String, Object> body) {
        String userId = userService.syncUser(null).getId();
        Farm farm = farmRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Farm not found"));

        if (!farm.getUserId().equals(userId)) {
            return ResponseEntity.status(403).build();
        }

        FarmImage img = FarmImage.builder()
            .farm(farm)
            .userId(userId)
            .imageUrl((String) body.get("image_url"))
            .caption((String) body.get("caption"))
            .build();
        farmImageRepository.save(img);
        return ResponseEntity.ok(farmDto(farm));
    }

    @GetMapping("/{id}/weather")
    public ResponseEntity<List<Map<String, Object>>> getWeatherLogs(@PathVariable String id) {
        String userId = userService.syncUser(null).getId();
        Farm farm = farmRepository.findById(id).orElseThrow(() -> new RuntimeException("Farm not found"));
        if (!farm.getUserId().equals(userId)) {
            return ResponseEntity.status(403).build();
        }
        List<Map<String, Object>> logs = weatherLogRepository.findByFarmIdOrderByCreatedAtDesc(id).stream().map(log -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id", log.getId());
            m.put("notes", log.getNotes());
            m.put("temperature", log.getTemperature());
            m.put("humidity", log.getHumidity());
            m.put("conditions", log.getConditions());
            m.put("created_at", log.getCreatedAt() != null ? log.getCreatedAt().toString() : null);
            return m;
        }).toList();
        return ResponseEntity.ok(logs);
    }

    @GetMapping("/{id}/images")
    public ResponseEntity<List<Map<String, Object>>> getFarmImages(@PathVariable String id) {
        String userId = userService.syncUser(null).getId();
        Farm farm = farmRepository.findById(id).orElseThrow(() -> new RuntimeException("Farm not found"));
        if (!farm.getUserId().equals(userId)) {
            return ResponseEntity.status(403).build();
        }
        List<Map<String, Object>> imgs = farmImageRepository.findByFarmIdOrderByCreatedAtDesc(id).stream().map(img -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id", img.getId());
            m.put("image_url", img.getImageUrl());
            m.put("caption", img.getCaption());
            m.put("created_at", img.getCreatedAt() != null ? img.getCreatedAt().toString() : null);
            return m;
        }).toList();
        return ResponseEntity.ok(imgs);
    }

    @PostMapping("/{id}/share")
    public ResponseEntity<com.agricompass.entity.Post> shareFarmToCommunity(@PathVariable String id, @RequestBody Map<String, Object> body) {
        String userId = userService.syncUser(null).getId();
        Farm farm = farmRepository.findById(id).orElseThrow(() -> new RuntimeException("Farm not found"));
        if (!farm.getUserId().equals(userId)) {
            return ResponseEntity.status(403).build();
        }
        
        String content = (String) body.get("content");
        String postBody = content + "\n\n(Shared from my farm in " + farm.getLocation() + ")";
        
        com.agricompass.entity.Post post = com.agricompass.entity.Post.builder()
            .userId(userId)
            .body(postBody)
            .location(farm.getLocation())
            .build();
        post = postRepository.save(post);
        
        return ResponseEntity.ok(post);
    }

    private Map<String, Object> farmDto(Farm farm) {
        Map<String, Object> dto = new HashMap<>();
        dto.put("id", farm.getId());
        dto.put("name", farm.getName());
        dto.put("location", farm.getLocation());
        dto.put("area_acres", farm.getAreaAcres());
        dto.put("soil_type", farm.getSoilType());
        dto.put("irrigation_type", farm.getIrrigationType());
        dto.put("current_crop", farm.getCurrentCrop());
        dto.put("created_at", farm.getCreatedAt() != null ? farm.getCreatedAt().toString() : null);
        
        // Weather logs and images are fetched separately via repository
        // Farm.getWeatherLogs() and Farm.getImages() return empty lists as stubs
        dto.put("weather_logs", java.util.Collections.emptyList());
        dto.put("images", java.util.Collections.emptyList());
        
        return dto;
    }
}
