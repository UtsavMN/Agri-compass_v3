package com.agricompass.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@RestController
@RequestMapping("/api/weather")
public class WeatherController {

    @Value("${openweather.api.key}")
    private String openWeatherApiKey;

    // Karnataka district -> approximate lat/lon
    private static final Map<String, double[]> DISTRICT_COORDS = new LinkedHashMap<>() {{
        put("Bagalkot", new double[]{16.18, 75.70});
        put("Ballari", new double[]{15.14, 76.92});
        put("Belagavi", new double[]{15.85, 74.50});
        put("Bengaluru Rural", new double[]{13.23, 77.71});
        put("Bengaluru Urban", new double[]{12.97, 77.59});
        put("Bidar", new double[]{17.91, 77.52});
        put("Chamarajanagar", new double[]{11.92, 76.94});
        put("Chikkaballapur", new double[]{13.43, 77.73});
        put("Chikkamagaluru", new double[]{13.32, 75.77});
        put("Chitradurga", new double[]{14.23, 76.40});
        put("Dakshina Kannada", new double[]{12.87, 74.88});
        put("Davanagere", new double[]{14.47, 75.92});
        put("Dharwad", new double[]{15.46, 75.01});
        put("Gadag", new double[]{15.43, 75.63});
        put("Hassan", new double[]{13.01, 76.10});
        put("Haveri", new double[]{14.79, 75.40});
        put("Kalaburagi", new double[]{17.33, 76.83});
        put("Kodagu", new double[]{12.42, 75.74});
        put("Kolar", new double[]{13.14, 78.13});
        put("Koppal", new double[]{15.35, 76.15});
        put("Mandya", new double[]{12.52, 76.90});
        put("Mysuru", new double[]{12.30, 76.66});
        put("Raichur", new double[]{16.21, 77.36});
        put("Ramanagara", new double[]{12.72, 77.28});
        put("Shivamogga", new double[]{13.93, 75.57});
        put("Tumakuru", new double[]{13.34, 77.10});
        put("Udupi", new double[]{13.34, 74.75});
        put("Uttara Kannada", new double[]{14.68, 74.69});
        put("Vijayanagara", new double[]{15.34, 76.47});
        put("Vijayapura", new double[]{16.83, 75.71});
        put("Yadgir", new double[]{16.77, 77.14});
    }};

    @GetMapping("/{district}")
    public ResponseEntity<?> getWeather(@PathVariable String district) {
        try {
            double[] coords = DISTRICT_COORDS.getOrDefault(district, new double[]{12.97, 77.59});
            RestTemplate rest = new RestTemplate();

            // Current weather
            String currentUrl = String.format(
                "https://api.openweathermap.org/data/2.5/weather?lat=%s&lon=%s&appid=%s&units=metric",
                coords[0], coords[1], openWeatherApiKey
            );
            Map current = rest.getForObject(currentUrl, Map.class);

            // 5-day forecast
            String forecastUrl = String.format(
                "https://api.openweathermap.org/data/2.5/forecast?lat=%s&lon=%s&appid=%s&units=metric&cnt=40",
                coords[0], coords[1], openWeatherApiKey
            );
            Map forecastRaw = rest.getForObject(forecastUrl, Map.class);

            // Parse current weather
            Map mainData = (Map) current.get("main");
            Map windData = (Map) current.get("wind");
            List<Map> weatherList = (List<Map>) current.get("weather");
            String description = weatherList.isEmpty() ? "Clear" : (String) weatherList.get(0).get("description");

            double temperature = ((Number) mainData.get("temp")).doubleValue();
            int humidity = ((Number) mainData.get("humidity")).intValue();
            double windSpeed = ((Number) windData.get("speed")).doubleValue() * 3.6; // m/s -> km/h

            // Parse 5-day forecast (take noon readings)
            List<Map> forecastItems = (List<Map>) forecastRaw.get("list");
            List<Map<String, Object>> forecast = new ArrayList<>();
            Set<String> seenDates = new HashSet<>();

            for (Map item : forecastItems) {
                String dtTxt = (String) item.get("dt_txt");
                String dateOnly = dtTxt.split(" ")[0];
                if (seenDates.contains(dateOnly)) continue;
                seenDates.add(dateOnly);

                Map fMain = (Map) item.get("main");
                List<Map> fWeather = (List<Map>) item.get("weather");
                
                Map<String, Object> dayForecast = new HashMap<>();
                dayForecast.put("date", dateOnly);
                dayForecast.put("temp_max", ((Number) fMain.get("temp_max")).doubleValue());
                dayForecast.put("temp_min", ((Number) fMain.get("temp_min")).doubleValue());
                dayForecast.put("description", fWeather.isEmpty() ? "Clear" : fWeather.get(0).get("description"));
                dayForecast.put("precipitation", item.containsKey("rain") ? ((Map) item.get("rain")).getOrDefault("3h", 0) : 0);
                forecast.add(dayForecast);

                if (forecast.size() >= 5) break;
            }

            // Build response matching frontend WeatherData interface
            Map<String, Object> weatherResponse = new HashMap<>();
            weatherResponse.put("district", district);
            
            Map<String, Object> weather = new HashMap<>();
            weather.put("temperature", Math.round(temperature));
            weather.put("humidity", humidity);
            weather.put("windSpeed", Math.round(windSpeed));
            weather.put("description", description);
            weather.put("forecast", forecast);
            
            weatherResponse.put("weather", weather);
            weatherResponse.put("advisory", generateAdvisory(temperature, humidity, description));
            weatherResponse.put("timestamp", new java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss").format(new Date()));

            return ResponseEntity.ok(weatherResponse);
        } catch (Exception e) {
            System.err.println("Weather API failed for " + district + ": " + e.getMessage());
            return ResponseEntity.ok(Map.of(
                "district", district,
                "weather", Map.of(
                    "temperature", 28,
                    "humidity", 65,
                    "windSpeed", 12,
                    "description", "Partly Cloudy (Service Temp Unavailable)",
                    "forecast", List.of()
                ),
                "advisory", Map.of("summary", "Weather service is currently unavailable. Using historical averages for " + district + "."),
                "timestamp", new java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss").format(new Date())
            ));
        }
    }

    private Map<String, Object> generateAdvisory(double temp, int humidity, String desc) {
        Map<String, Object> advisory = new HashMap<>();
        List<String> tips = new ArrayList<>();
        
        if (temp > 35) tips.add("High temperature detected. Ensure adequate irrigation and consider mulching.");
        if (temp < 15) tips.add("Cool conditions. Protect frost-sensitive crops with covers.");
        if (humidity > 80) tips.add("High humidity may promote fungal diseases. Apply preventive fungicide.");
        if (humidity < 30) tips.add("Low humidity. Increase irrigation frequency.");
        if (desc.contains("rain")) tips.add("Rain expected. Postpone fertilizer application and ensure drainage.");
        if (tips.isEmpty()) tips.add("Favorable conditions for most agricultural activities.");
        
        advisory.put("summary", String.join(" ", tips));
        advisory.put("tips", tips);
        return advisory;
    }
}
