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
    private final com.agricompass.repository.FarmDiagnosticRepository farmDiagnosticRepository;

    public FarmController(FarmRepository farmRepository, WeatherLogRepository weatherLogRepository, FarmImageRepository farmImageRepository, UserService userService, com.agricompass.repository.PostRepository postRepository, com.agricompass.repository.FarmDiagnosticRepository farmDiagnosticRepository) {
        this.farmRepository = farmRepository;
        this.weatherLogRepository = weatherLogRepository;
        this.farmImageRepository = farmImageRepository;
        this.userService = userService;
        this.postRepository = postRepository;
        this.farmDiagnosticRepository = farmDiagnosticRepository;
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getFarms() {
        String userId = userService.syncUser(null).getId();
        return getFarmsResponse(farmRepository.findByClerkUserId(userId));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Map<String, Object>>> getFarmsByUserId(@PathVariable String userId) {
        return getFarmsResponse(farmRepository.findByClerkUserId(userId));
    }

    private ResponseEntity<List<Map<String, Object>>> getFarmsResponse(List<Farm> farms) {
        if (farms.isEmpty()) return ResponseEntity.ok(List.of());

        List<String> farmIds = farms.stream().map(Farm::getId).toList();

        Map<String, List<WeatherLog>> weatherLogs = weatherLogRepository
            .findByFarmIdInOrderByCreatedAtDesc(farmIds)
            .stream().collect(java.util.stream.Collectors.groupingBy(log -> log.getFarm().getId()));

        Map<String, List<FarmImage>> farmImages = farmImageRepository
            .findByFarmIdInOrderByCreatedAtDesc(farmIds)
            .stream().collect(java.util.stream.Collectors.groupingBy(img -> img.getFarm().getId()));

        List<Map<String, Object>> result = farms.stream()
            .map(farm -> farmDto(farm,
                weatherLogs.getOrDefault(farm.getId(), List.of()),
                farmImages.getOrDefault(farm.getId(), List.of())))
            .toList();

        return ResponseEntity.ok(result);
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createFarm(@RequestBody Map<String, Object> body) {
        String userId = userService.syncUser(null).getId();
        
        Double areaAcres = null;
        if (body.containsKey("area_acres") && body.get("area_acres") != null) {
            Object val = body.get("area_acres");
            if (val instanceof Number) {
                areaAcres = ((Number) val).doubleValue();
            } else {
                try {
                    areaAcres = Double.parseDouble(val.toString());
                } catch (NumberFormatException e) {
                    // Ignore invalid format
                }
            }
        }
        
        Farm farm = Farm.builder()
            .userId(userId)
            .name((String) body.get("name"))
            .location((String) body.get("location"))
            .areaAcres(areaAcres)
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
        if (body.containsKey("area_acres") && body.get("area_acres") != null) {
            Object val = body.get("area_acres");
            if (val instanceof Number) {
                farm.setAreaAcres(((Number) val).doubleValue());
            } else {
                try {
                    farm.setAreaAcres(Double.parseDouble(val.toString()));
                } catch (NumberFormatException e) {
                    // Ignore invalid format
                }
            }
        }
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

    @GetMapping("/{id}/diagnostics")
    public ResponseEntity<List<com.agricompass.entity.FarmDiagnostic>> getFarmDiagnostics(@PathVariable String id) {
        Farm farm = farmRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Farm not found"));
        if (!farm.getUserId().equals(userService.syncUser(null).getId())) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(farmDiagnosticRepository.findByFarmIdOrderByCreatedAtDesc(id));
    }

    @PostMapping("/{id}/diagnostics")
    public ResponseEntity<com.agricompass.entity.FarmDiagnostic> createFarmDiagnostic(@PathVariable String id, @RequestBody Map<String, Object> body) {
        String userId = userService.syncUser(null).getId();
        Farm farm = farmRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Farm not found"));
        
        if (!farm.getUserId().equals(userId)) {
            return ResponseEntity.status(403).build();
        }

        com.agricompass.entity.FarmDiagnostic diag = new com.agricompass.entity.FarmDiagnostic();
        diag.setFarmId(farm.getId());
        diag.setClerkUserId(userId);
        
        if (body.containsKey("nitrogen") && body.get("nitrogen") != null) diag.setNitrogen(Double.parseDouble(body.get("nitrogen").toString()));
        if (body.containsKey("phosphorus") && body.get("phosphorus") != null) diag.setPhosphorus(Double.parseDouble(body.get("phosphorus").toString()));
        if (body.containsKey("potassium") && body.get("potassium") != null) diag.setPotassium(Double.parseDouble(body.get("potassium").toString()));
        if (body.containsKey("ph") && body.get("ph") != null) diag.setPh(Double.parseDouble(body.get("ph").toString()));
        if (body.containsKey("moisture") && body.get("moisture") != null) diag.setMoisture(Double.parseDouble(body.get("moisture").toString()));
        if (body.containsKey("temperature") && body.get("temperature") != null) diag.setTemperature(Double.parseDouble(body.get("temperature").toString()));
        if (body.containsKey("humidity") && body.get("humidity") != null) diag.setHumidity(Double.parseDouble(body.get("humidity").toString()));
        
        if (body.containsKey("healthStatus")) diag.setHealthStatus((String) body.get("healthStatus"));
        if (body.containsKey("aiReport")) diag.setAiReport((String) body.get("aiReport"));

        com.agricompass.entity.FarmDiagnostic saved = farmDiagnosticRepository.save(diag);
        
        // Update the Farm's latest soil health
        if (diag.getHealthStatus() != null) {
            farm.setLatestSoilHealth(diag.getHealthStatus());
            farmRepository.save(farm);
        }

        return ResponseEntity.ok(saved);
    }

    private Map<String, Object> farmDto(Farm farm) {
        return farmDto(farm, 
            weatherLogRepository.findByFarmIdOrderByCreatedAtDesc(farm.getId()),
            farmImageRepository.findByFarmIdOrderByCreatedAtDesc(farm.getId())
        );
    }

    private Map<String, Object> farmDto(Farm farm, List<WeatherLog> weatherLogList, List<FarmImage> farmImageList) {
        Map<String, Object> dto = new HashMap<>();
        dto.put("id", farm.getId());
        dto.put("name", farm.getName());
        dto.put("location", farm.getLocation());
        dto.put("area_acres", farm.getAreaAcres());
        dto.put("soil_type", farm.getSoilType());
        dto.put("irrigation_type", farm.getIrrigationType());
        dto.put("current_crop", farm.getCurrentCrop());
        dto.put("latest_soil_health", farm.getLatestSoilHealth());
        dto.put("created_at", farm.getCreatedAt() != null ? farm.getCreatedAt().toString() : null);
        List<Map<String, Object>> logs = weatherLogList.stream().map(log -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id", log.getId());
            m.put("notes", log.getNotes());
            m.put("temperature", log.getTemperature());
            m.put("humidity", log.getHumidity());
            m.put("conditions", log.getConditions());
            m.put("created_at", log.getCreatedAt() != null ? log.getCreatedAt().toString() : null);
            return m;
        }).toList();

        List<Map<String, Object>> imgs = farmImageList.stream().map(img -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id", img.getId());
            m.put("image_url", img.getImageUrl());
            m.put("caption", img.getCaption());
            m.put("created_at", img.getCreatedAt() != null ? img.getCreatedAt().toString() : null);
            return m;
        }).toList();

        dto.put("weather_logs", logs);
        dto.put("images", imgs);
        
        return dto;
    }
}
