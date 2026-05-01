package com.agricompass.controller;

import com.agricompass.entity.Farm;
import com.agricompass.entity.FarmImage;
import com.agricompass.entity.WeatherLog;
import com.agricompass.repository.FarmImageRepository;
import com.agricompass.repository.FarmRepository;
import com.agricompass.repository.WeatherLogRepository;
import com.agricompass.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/farms")
@RequiredArgsConstructor
public class FarmController {

    private final FarmRepository farmRepository;
    private final WeatherLogRepository weatherLogRepository;
    private final FarmImageRepository farmImageRepository;
    private final UserService userService;

    @GetMapping
    public ResponseEntity<List<Farm>> getFarms() {
        String userId = userService.syncUser(null).getId();
        return ResponseEntity.ok(farmRepository.findByUserId(userId));
    }

    @PostMapping
    public ResponseEntity<Farm> createFarm(@RequestBody Map<String, Object> body) {
        String userId = userService.syncUser(null).getId();
        Farm farm = Farm.builder()
            .userId(userId)
            .name((String) body.get("name"))
            .location((String) body.get("location"))
            .areaAcres(body.get("area_acres") != null ? Double.parseDouble(body.get("area_acres").toString()) : null)
            .soilType((String) body.get("soil_type"))
            .irrigationType((String) body.get("irrigation_type"))
            .build();
        return ResponseEntity.ok(farmRepository.save(farm));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Farm> getFarm(@PathVariable String id) {
        Farm farm = farmRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Farm not found"));
        if (!farm.getUserId().equals(userService.syncUser(null).getId())) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(farm);
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
    public ResponseEntity<WeatherLog> addWeatherLog(@PathVariable String id,
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
            .conditions((String) body.get("conditions"))
            .temperature(body.get("temperature") != null ? Double.parseDouble(body.get("temperature").toString()) : null)
            .humidity(body.get("humidity") != null ? Double.parseDouble(body.get("humidity").toString()) : null)
            .build();

        return ResponseEntity.ok(weatherLogRepository.save(log));
    }

    @GetMapping("/{id}/weather")
    public ResponseEntity<List<WeatherLog>> getWeatherLogs(@PathVariable String id) {
        return ResponseEntity.ok(weatherLogRepository.findByFarmIdOrderByCreatedAtDesc(id));
    }

    @PostMapping("/{id}/images")
    public ResponseEntity<FarmImage> addImage(@PathVariable String id,
                                               @RequestBody Map<String, String> body) {
        String userId = userService.syncUser(null).getId();
        Farm farm = farmRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Farm not found"));

        if (!farm.getUserId().equals(userId)) {
            return ResponseEntity.status(403).build();
        }

        FarmImage image = FarmImage.builder()
            .farm(farm)
            .userId(userId)
            .imageUrl(body.get("image_url"))
            .caption(body.get("caption"))
            .build();

        return ResponseEntity.ok(farmImageRepository.save(image));
    }

    @GetMapping("/{id}/images")
    public ResponseEntity<List<FarmImage>> getImages(@PathVariable String id) {
        return ResponseEntity.ok(farmImageRepository.findByFarmIdOrderByCreatedAtDesc(id));
    }

    @PostMapping("/{id}/share")
    public ResponseEntity<Map<String, String>> shareToCommunity(@PathVariable String id,
                                                                 @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(Map.of("status", "shared", "farmId", id));
    }
}
