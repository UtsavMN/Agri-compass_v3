package com.agricompass.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

@RestController
@RequestMapping("/api/weather")
public class WeatherController {
    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(WeatherController.class);

    @Value("${openweather.api.key:9445b4364af44639b9875034262207}")
    private String openWeatherApiKey;

    private final RestTemplate restTemplate;

    public WeatherController(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

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

    @GetMapping("/current")
    public ResponseEntity<?> getCurrentWeather(@RequestParam(name = "district") String district) {
        return getWeather(district);
    }

    @GetMapping("/{district}")
    public ResponseEntity<?> getWeather(@PathVariable String district) {
        // Normalize district to official Title Case names in Karnataka
        String officialDistrictName = "Bengaluru Urban";
        double[] coords = new double[]{12.97, 77.59};

        if (district != null && !district.trim().isEmpty()) {
            String clean = district.trim().toLowerCase();
            for (Map.Entry<String, double[]> entry : DISTRICT_COORDS.entrySet()) {
                if (entry.getKey().toLowerCase().equals(clean)) {
                    officialDistrictName = entry.getKey();
                    coords = entry.getValue();
                    break;
                }
            }
        }

        final String targetDistrict = officialDistrictName;
        final double[] targetCoords = coords;

        try {
            // 1. Fetch Open-Meteo High-Resolution 7-Day Agricultural Forecast
            String openMeteoUrl = String.format(
                Locale.US,
                "https://api.open-meteo.com/v1/forecast?latitude=%.4f&longitude=%.4f&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,wind_direction_10m_dominant,et0_fao_evapotranspiration,uv_index_max&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m&timezone=Asia%%2FKolkata",
                targetCoords[0], targetCoords[1]
            );

            @SuppressWarnings("unchecked")
            Map<String, Object> omResponse = null;
            try {
                omResponse = restTemplate.getForObject(openMeteoUrl, Map.class);
            } catch (Exception e) {
                log.warn("Open-Meteo fetch failed for {}: {}", targetDistrict, e.getMessage());
            }

            // 2. Fetch WeatherAPI for alerts and live station text condition
            @SuppressWarnings("unchecked")
            Map<String, Object> waResponse = null;
            List<Map<String, Object>> alertList = new ArrayList<>();

            if (openWeatherApiKey != null && !openWeatherApiKey.trim().isEmpty() && !openWeatherApiKey.contains("your-")) {
                try {
                    String forecastUrl = String.format(
                        Locale.US,
                        "https://api.weatherapi.com/v1/forecast.json?key=%s&q=%.4f,%.4f&days=3&alerts=yes",
                        openWeatherApiKey, targetCoords[0], targetCoords[1]
                    );
                    waResponse = restTemplate.getForObject(forecastUrl, Map.class);
                    if (waResponse != null && waResponse.containsKey("alerts")) {
                        @SuppressWarnings("unchecked")
                        Map<String, Object> alertsObj = (Map<String, Object>) waResponse.get("alerts");
                        if (alertsObj != null && alertsObj.containsKey("alert")) {
                            @SuppressWarnings("unchecked")
                            List<Map<String, Object>> parsedAlerts = (List<Map<String, Object>>) alertsObj.get("alert");
                            if (parsedAlerts != null) alertList = parsedAlerts;
                        }
                    }
                } catch (Exception e) {
                    log.warn("WeatherAPI fetch failed for {}: {}", targetDistrict, e.getMessage());
                }
            }

            if (omResponse == null && waResponse == null) {
                throw new RuntimeException("Both Open-Meteo and WeatherAPI failed to return meteorological data");
            }

            // Extract current meteorological observations
            double currentTemp = 25.0;
            int currentHumidity = 65;
            double currentWindSpeed = 10.0;
            String currentWindDir = "N";
            String currentDescription = "Partly Cloudy";
            double currentPrecip = 0.0;
            int currentPrecipProb = 0;
            double currentPressure = 1013.0;
            double currentFeelsLike = 25.0;
            double currentUv = 5.0;
            double currentVisKm = 10.0;
            double todayEt0 = 3.5;

            // Priority: Open-Meteo for physical metrics, WeatherAPI for text/visibility
            if (omResponse != null && omResponse.containsKey("current")) {
                @SuppressWarnings("unchecked")
                Map<String, Object> omCur = (Map<String, Object>) omResponse.get("current");
                if (omCur != null) {
                    currentTemp = getDouble(omCur, "temperature_2m", 25.0);
                    currentHumidity = (int) Math.round(getDouble(omCur, "relative_humidity_2m", 65.0));
                    currentWindSpeed = getDouble(omCur, "wind_speed_10m", 10.0);
                    int windDeg = (int) Math.round(getDouble(omCur, "wind_direction_10m", 0.0));
                    currentWindDir = degreesToCardinal(windDeg);
                    currentPrecip = getDouble(omCur, "precipitation", 0.0);
                    currentPressure = getDouble(omCur, "surface_pressure", 1013.0);
                    currentFeelsLike = getDouble(omCur, "apparent_temperature", currentTemp);
                    int wCode = (int) Math.round(getDouble(omCur, "weather_code", 0.0));
                    currentDescription = wmoCodeToDescription(wCode);
                }
            }

            if (waResponse != null && waResponse.containsKey("current")) {
                @SuppressWarnings("unchecked")
                Map<String, Object> waCur = (Map<String, Object>) waResponse.get("current");
                if (waCur != null) {
                    if (waCur.containsKey("condition")) {
                        @SuppressWarnings("unchecked")
                        Map<String, Object> cond = (Map<String, Object>) waCur.get("condition");
                        if (cond != null && cond.containsKey("text")) {
                            currentDescription = (String) cond.get("text");
                        }
                    }
                    currentUv = getDouble(waCur, "uv", currentUv);
                    currentVisKm = getDouble(waCur, "vis_km", 10.0);
                }
            }

            // Build 7-day timeline forecast
            List<Map<String, Object>> forecast = new ArrayList<>();

            if (omResponse != null && omResponse.containsKey("daily")) {
                @SuppressWarnings("unchecked")
                Map<String, Object> daily = (Map<String, Object>) omResponse.get("daily");
                @SuppressWarnings("unchecked")
                List<String> times = (List<String>) daily.get("time");
                @SuppressWarnings("unchecked")
                List<Number> wCodes = (List<Number>) daily.get("weather_code");
                @SuppressWarnings("unchecked")
                List<Number> maxTemps = (List<Number>) daily.get("temperature_2m_max");
                @SuppressWarnings("unchecked")
                List<Number> minTemps = (List<Number>) daily.get("temperature_2m_min");
                @SuppressWarnings("unchecked")
                List<Number> appMaxTemps = (List<Number>) daily.get("apparent_temperature_max");
                @SuppressWarnings("unchecked")
                List<Number> precipSums = (List<Number>) daily.get("precipitation_sum");
                @SuppressWarnings("unchecked")
                List<Number> precipProbs = (List<Number>) daily.get("precipitation_probability_max");
                @SuppressWarnings("unchecked")
                List<Number> windMaxes = (List<Number>) daily.get("wind_speed_10m_max");
                @SuppressWarnings("unchecked")
                List<Number> windDegs = (List<Number>) daily.get("wind_direction_10m_dominant");
                @SuppressWarnings("unchecked")
                List<Number> et0s = (List<Number>) daily.get("et0_fao_evapotranspiration");
                @SuppressWarnings("unchecked")
                List<Number> uvs = (List<Number>) daily.get("uv_index_max");

                if (times != null) {
                    for (int i = 0; i < times.size(); i++) {
                        String dateStr = times.get(i);
                        int wCode = wCodes != null && i < wCodes.size() ? wCodes.get(i).intValue() : 0;
                        double maxT = maxTemps != null && i < maxTemps.size() ? maxTemps.get(i).doubleValue() : 30.0;
                        double minT = minTemps != null && i < minTemps.size() ? minTemps.get(i).doubleValue() : 20.0;
                        double appMax = appMaxTemps != null && i < appMaxTemps.size() ? appMaxTemps.get(i).doubleValue() : maxT;
                        double precip = precipSums != null && i < precipSums.size() ? precipSums.get(i).doubleValue() : 0.0;
                        int precipProb = precipProbs != null && i < precipProbs.size() ? precipProbs.get(i).intValue() : 0;
                        double windSpeed = windMaxes != null && i < windMaxes.size() ? windMaxes.get(i).doubleValue() : 10.0;
                        int windDeg = windDegs != null && i < windDegs.size() ? windDegs.get(i).intValue() : 0;
                        double et0 = et0s != null && i < et0s.size() ? et0s.get(i).doubleValue() : 3.5;
                        double uvVal = uvs != null && i < uvs.size() ? uvs.get(i).doubleValue() : 6.0;

                        if (i == 0) {
                            currentPrecipProb = precipProb;
                            todayEt0 = et0;
                            currentUv = uvVal;
                        }

                        Map<String, String> spraySuitability = evaluateSprayingSuitability(windSpeed, precipProb, precip);

                        String dayName = "Day";
                        try {
                            LocalDate ld = LocalDate.parse(dateStr);
                            if (i == 0) dayName = "Today";
                            else if (i == 1) dayName = "Tomorrow";
                            else dayName = ld.format(DateTimeFormatter.ofPattern("EEE", Locale.US));
                        } catch (Exception ignored) {}

                        Map<String, Object> dayForecast = new LinkedHashMap<>();
                        dayForecast.put("date", dateStr);
                        dayForecast.put("day_name", dayName);
                        dayForecast.put("temp_max", Math.round(maxT));
                        dayForecast.put("temp_min", Math.round(minT));
                        dayForecast.put("apparent_temp_max", Math.round(appMax));
                        dayForecast.put("description", wmoCodeToDescription(wCode));
                        dayForecast.put("precipitation", Math.round(precip * 10.0) / 10.0);
                        dayForecast.put("precipitation_probability", precipProb);
                        dayForecast.put("et0", Math.round(et0 * 100.0) / 100.0);
                        dayForecast.put("wind_speed_max", Math.round(windSpeed));
                        dayForecast.put("wind_direction", degreesToCardinal(windDeg));
                        dayForecast.put("uv_index", Math.round(uvVal * 10.0) / 10.0);
                        dayForecast.put("spraying_suitability", spraySuitability.get("suitability"));
                        dayForecast.put("spraying_reason", spraySuitability.get("reason"));

                        forecast.add(dayForecast);
                    }
                }
            } else if (waResponse != null && waResponse.containsKey("forecast")) {
                // Fallback to WeatherAPI forecast
                @SuppressWarnings("unchecked")
                Map<String, Object> forecastObj = (Map<String, Object>) waResponse.get("forecast");
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> forecastday = forecastObj != null ? (List<Map<String, Object>>) forecastObj.get("forecastday") : new ArrayList<>();
                if (forecastday != null) {
                    for (int i = 0; i < forecastday.size(); i++) {
                        Map<String, Object> dayItem = forecastday.get(i);
                        String dateStr = (String) dayItem.get("date");
                        @SuppressWarnings("unchecked")
                        Map<String, Object> dayInfo = (Map<String, Object>) dayItem.get("day");
                        if (dayInfo == null) continue;

                        @SuppressWarnings("unchecked")
                        Map<String, Object> dayCond = (Map<String, Object>) dayInfo.get("condition");
                        double maxT = getDouble(dayInfo, "maxtemp_c", 30.0);
                        double minT = getDouble(dayInfo, "mintemp_c", 20.0);
                        double precip = getDouble(dayInfo, "totalprecip_mm", 0.0);
                        double windSpeed = getDouble(dayInfo, "maxwind_kph", 10.0);
                        int rainProb = (int) Math.round(getDouble(dayInfo, "daily_chance_of_rain", 0.0));
                        String desc = dayCond != null && dayCond.containsKey("text") ? (String) dayCond.get("text") : "Clear";

                        Map<String, String> spray = evaluateSprayingSuitability(windSpeed, rainProb, precip);

                        String dayName = i == 0 ? "Today" : i == 1 ? "Tomorrow" : "Day";
                        try {
                            LocalDate ld = LocalDate.parse(dateStr);
                            dayName = ld.format(DateTimeFormatter.ofPattern("EEE", Locale.US));
                        } catch (Exception ignored) {}

                        Map<String, Object> dayForecast = new LinkedHashMap<>();
                        dayForecast.put("date", dateStr);
                        dayForecast.put("day_name", dayName);
                        dayForecast.put("temp_max", Math.round(maxT));
                        dayForecast.put("temp_min", Math.round(minT));
                        dayForecast.put("description", desc);
                        dayForecast.put("precipitation", precip);
                        dayForecast.put("precipitation_probability", rainProb);
                        dayForecast.put("wind_speed_max", Math.round(windSpeed));
                        dayForecast.put("spraying_suitability", spray.get("suitability"));
                        dayForecast.put("spraying_reason", spray.get("reason"));

                        forecast.add(dayForecast);
                    }
                }
            }

            // Construct Full Weather Payload
            Map<String, Object> weather = new LinkedHashMap<>();
            weather.put("temperature", Math.round(currentTemp));
            weather.put("humidity", currentHumidity);
            weather.put("windSpeed", Math.round(currentWindSpeed));
            weather.put("windDirection", currentWindDir);
            weather.put("description", currentDescription);
            weather.put("uv", Math.round(currentUv * 10.0) / 10.0);
            weather.put("precipitation", Math.round(currentPrecip * 10.0) / 10.0);
            weather.put("precipitationProbability", currentPrecipProb);
            weather.put("visibility", Math.round(currentVisKm));
            weather.put("pressure", Math.round(currentPressure));
            weather.put("feelsLike", Math.round(currentFeelsLike));
            weather.put("et0", Math.round(todayEt0 * 100.0) / 100.0);
            weather.put("forecast", forecast);

            // Construct 6-Domain Agronomic Advisory
            Map<String, Object> advisory = generateEnterpriseAdvisory(targetDistrict, currentTemp, currentHumidity, currentWindSpeed, currentPrecip, currentPrecipProb, todayEt0, currentDescription, forecast);

            Map<String, Object> weatherResponse = new LinkedHashMap<>();
            weatherResponse.put("district", targetDistrict);
            weatherResponse.put("weather", weather);
            weatherResponse.put("advisory", advisory);
            weatherResponse.put("alerts", alertList);
            weatherResponse.put("timestamp", new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss").format(new Date()));

            return ResponseEntity.ok(weatherResponse);

        } catch (Exception e) {
            log.error("Failed to fetch weather for {}: {}", targetDistrict, e.getMessage(), e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Weather data currently unavailable for " + targetDistrict);
            errorResponse.put("district", targetDistrict);
            return ResponseEntity.status(org.springframework.http.HttpStatus.SERVICE_UNAVAILABLE).body(errorResponse);
        }
    }

    private static double getDouble(Map<String, Object> map, String key, double defaultVal) {
        if (map == null || !map.containsKey(key) || map.get(key) == null) return defaultVal;
        Object val = map.get(key);
        if (val instanceof Number) return ((Number) val).doubleValue();
        try {
            return Double.parseDouble(val.toString());
        } catch (Exception e) {
            return defaultVal;
        }
    }

    private static String degreesToCardinal(int deg) {
        String[] directions = {"N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"};
        int idx = (int) Math.round((deg % 360) / 22.5) % 16;
        return directions[idx];
    }

    private static String wmoCodeToDescription(int code) {
        switch (code) {
            case 0: return "Clear Sky";
            case 1: return "Mainly Clear";
            case 2: return "Partly Cloudy";
            case 3: return "Overcast";
            case 45: return "Foggy";
            case 48: return "Depositing Rime Fog";
            case 51: return "Light Drizzle";
            case 53: return "Moderate Drizzle";
            case 55: return "Dense Drizzle";
            case 56: case 57: return "Freezing Drizzle";
            case 61: return "Slight Rain";
            case 63: return "Moderate Rain";
            case 65: return "Heavy Rain";
            case 66: case 67: return "Freezing Rain";
            case 71: return "Slight Snow";
            case 73: return "Moderate Snow";
            case 75: return "Heavy Snow";
            case 77: return "Snow Grains";
            case 80: return "Light Rain Showers";
            case 81: return "Moderate Rain Showers";
            case 82: return "Violent Rain Showers";
            case 85: case 86: return "Snow Showers";
            case 95: return "Thunderstorm";
            case 96: return "Thunderstorm with Hail";
            case 99: return "Severe Thunderstorm with Hail";
            default: return "Clear Sky";
        }
    }

    private static Map<String, String> evaluateSprayingSuitability(double windKph, int precipProb, double precipMm) {
        Map<String, String> result = new HashMap<>();
        if (precipProb > 50 || precipMm > 4.0) {
            result.put("suitability", "Unfavorable");
            result.put("reason", "Washout Hazard: High rain probability (" + precipProb + "%) or rain > 4mm.");
        } else if (windKph > 20.0) {
            result.put("suitability", "Unfavorable");
            result.put("reason", "Wind Drift Hazard: Wind speed exceeds 20 km/h, causing off-target chemical drift.");
        } else if (windKph > 13.0 || precipProb > 25) {
            result.put("suitability", "Caution");
            result.put("reason", "Moderate drift/shower risk. Limit to early morning (06:00–08:30) with anti-drift nozzles.");
        } else {
            result.put("suitability", "Favorable");
            result.put("reason", "Optimal conditions: Low wind (<13 km/h) and minimal rain risk (<25%).");
        }
        return result;
    }

    private Map<String, Object> generateEnterpriseAdvisory(
            String district, double temp, int humidity, double wind, double precip,
            int rainProb, double et0, String desc, List<Map<String, Object>> forecast) {

        double precip48h = precip;
        double maxWind48h = wind;
        int maxRainProb48h = rainProb;

        if (forecast != null && !forecast.isEmpty()) {
            precip48h = 0;
            for (int i = 0; i < Math.min(2, forecast.size()); i++) {
                Map<String, Object> day = forecast.get(i);
                precip48h += getDouble(day, "precipitation", 0.0);
                maxWind48h = Math.max(maxWind48h, getDouble(day, "wind_speed_max", wind));
                maxRainProb48h = Math.max(maxRainProb48h, (int) Math.round(getDouble(day, "precipitation_probability", (double) rainProb)));
            }
        }

        // Domain 1: Spraying
        Map<String, Object> spraying = new LinkedHashMap<>();
        spraying.put("title", "Chemical & Foliar Spraying Window");
        List<String> sprayActions = new ArrayList<>();
        if (maxRainProb48h > 50 || precip48h > 5.0) {
            spraying.put("status", "critical");
            spraying.put("statusLabel", "Unfavorable — Washout Risk");
            spraying.put("description", String.format(Locale.US, "Heavy rain chance (%d%%) or precipitation (%.1fmm) will wash off chemical active ingredients.", maxRainProb48h, precip48h));
            sprayActions.add("Postpone all fungicide, herbicide, and foliar fertilizer sprays.");
            sprayActions.add("If emergency pest spraying is essential, combine with an approved organosilicone sticker.");
        } else if (maxWind48h > 18.0) {
            spraying.put("status", "caution");
            spraying.put("statusLabel", "Caution — Drift Hazard");
            spraying.put("description", String.format(Locale.US, "Wind gusts up to %.0f km/h risk chemical loss and non-target drift.", maxWind48h));
            sprayActions.add("Schedule spraying strictly in early morning (06:00 to 08:30 AM).");
            sprayActions.add("Use low-drift venturi or twin-fan nozzles with boom positioned close to canopy.");
        } else {
            spraying.put("status", "favorable");
            spraying.put("statusLabel", "Favorable Spray Window");
            spraying.put("description", "Optimal conditions for foliar nutrient sprays, bio-pesticides, and systemic treatments.");
            sprayActions.add("Safe window for scheduled foliar sprays and biological pest control.");
            sprayActions.add("Maintain nozzle pressure between 2.0 to 2.5 bar for uniform droplet size.");
        }
        spraying.put("actionItems", sprayActions);
        List<Map<String, String>> sprayMetrics = new ArrayList<>();
        sprayMetrics.add(Map.of("label", "Wind Speed", "value", String.format(Locale.US, "%.0f km/h", wind)));
        sprayMetrics.add(Map.of("label", "Rain Probability", "value", rainProb + "%"));
        spraying.put("metrics", sprayMetrics);

        // Domain 2: Irrigation & Water Budgeting (ET0)
        Map<String, Object> irrigation = new LinkedHashMap<>();
        irrigation.put("title", "Precision Irrigation & Water Budget (ET₀)");
        List<String> irrigActions = new ArrayList<>();
        if (precip48h >= 15.0 || precip > 10.0) {
            irrigation.put("status", "favorable");
            irrigation.put("statusLabel", "Suspend Irrigation");
            irrigation.put("description", String.format(Locale.US, "Forecast precipitation (%.1f mm) exceeds crop evapotranspiration (ET₀: %.1f mm/d). Soil moisture replenishment active.", precip48h, et0));
            irrigActions.add("Turn off automated drip and sprinkler systems for the next 48 hours.");
            irrigActions.add("Clear field drainage channels and border ditches to prevent root hypoxia.");
        } else if (et0 > 4.2 && precip48h < 2.0) {
            irrigation.put("status", "caution");
            irrigation.put("statusLabel", "High Moisture Depletion");
            irrigation.put("description", String.format(Locale.US, "Elevated evaporative demand (ET₀: %.1f mm/d) with minimal rain will deplete root-zone water.", et0));
            irrigActions.add("Schedule drip irrigation during low evaporative hours (05:30–08:00 AM or late evening).");
            irrigActions.add("Apply organic mulch (straw/biomass) to reduce direct soil surface evaporation.");
        } else {
            irrigation.put("status", "info");
            irrigation.put("statusLabel", "Balanced Water Budget");
            irrigation.put("description", String.format(Locale.US, "Reference ET₀ is %.1f mm/day against %.1f mm rain. Normal soil moisture balance.", et0, precip48h));
            irrigActions.add("Continue standard deficit irrigation cycle suited for current crop phenology.");
            irrigActions.add("Maintain soil moisture around 60–70% field capacity.");
        }
        irrigation.put("actionItems", irrigActions);
        List<Map<String, String>> irrigMetrics = new ArrayList<>();
        irrigMetrics.add(Map.of("label", "FAO-56 ET₀", "value", String.format(Locale.US, "%.1f mm/d", et0)));
        irrigMetrics.add(Map.of("label", "48h Forecast Rain", "value", String.format(Locale.US, "%.1f mm", precip48h)));
        irrigation.put("metrics", irrigMetrics);

        // Domain 3: Fertilizer Timing
        Map<String, Object> fertilizer = new LinkedHashMap<>();
        fertilizer.put("title", "Soil & Fertilizer Timing");
        List<String> fertActions = new ArrayList<>();
        if (precip48h > 20.0) {
            fertilizer.put("status", "critical");
            fertilizer.put("statusLabel", "Postpone Nitrogen Broadcasting");
            fertilizer.put("description", "Heavy runoff will cause severe nitrate leaching and gaseous denitrification.");
            fertActions.add("Do NOT broadcast urea or water-soluble NPK before heavy rainfall.");
            fertActions.add("Resume top-dressing 24–36 hours after rain once standing surface water drains.");
        } else if (precip48h > 3.0 && precip48h <= 15.0) {
            fertilizer.put("status", "favorable");
            fertilizer.put("statusLabel", "Prime Soil Incorporation");
            fertilizer.put("description", "Moist soil conditions ensure rapid fertilizer granule dissolution and root uptake.");
            fertActions.add("Excellent window for split urea, muriate of potash (MOP), and micronutrient application.");
            fertActions.add("Incorporate compost or neem cake into moist seedbeds.");
        } else {
            fertilizer.put("status", "favorable");
            fertilizer.put("statusLabel", "Normal Nutrient Timing");
            fertilizer.put("description", "Stable soil conditions for planned basal and fertigation feeding.");
            fertActions.add("In dry soils, irrigate immediately following fertilizer broadcasting to prevent ammonia volatilization.");
            fertActions.add("Foliar feeding with 19-19-19 or chelated zinc is suitable under moderate temperatures.");
        }
        fertilizer.put("actionItems", fertActions);
        List<Map<String, String>> fertMetrics = new ArrayList<>();
        fertMetrics.add(Map.of("label", "Surface Runoff Risk", "value", precip48h > 15.0 ? "High" : "Low"));
        fertMetrics.add(Map.of("label", "Nitrogen Loss Risk", "value", precip48h > 15.0 ? "Critical" : "Minimal"));
        fertilizer.put("metrics", fertMetrics);

        // Domain 4: Disease & Pathogen Risk
        Map<String, Object> disease = new LinkedHashMap<>();
        disease.put("title", "Crop Pathogen & Pest Alert");
        List<String> disActions = new ArrayList<>();
        if (humidity > 78 && temp >= 20.0 && temp <= 30.0) {
            disease.put("status", "critical");
            disease.put("statusLabel", "High Fungal Pathogen Risk");
            disease.put("description", String.format(Locale.US, "Warm temperatures (%.0f°C) and elevated humidity (%d%%) accelerate fungal spore germination.", temp, humidity));
            disActions.add("Elevated vulnerability for Blast, Sheath Blight, Downy Mildew, and Anthracnose.");
            disActions.add("Scout lower plant canopy and leaf sheaths for early lesion development.");
            disActions.add("Prepare preventive bio-fungicide (Trichoderma viride or Pseudomonas) application once foliage dries.");
        } else if (temp > 34.0 && humidity < 50) {
            disease.put("status", "caution");
            disease.put("statusLabel", "Sucking Pest Risk (Thrips & Mites)");
            disease.put("description", "Warm, dry microclimates trigger exponential reproduction of sap-sucking insects.");
            disActions.add("Inspect undersides of young leaves for thrips, aphids, and yellow mite curling.");
            disActions.add("Deploy yellow and blue sticky traps in field boundaries.");
        } else {
            disease.put("status", "favorable");
            disease.put("statusLabel", "Low Pathogen Pressure");
            disease.put("description", "Current environmental parameters do not trigger pathogen outbreaks.");
            disActions.add("Maintain regular scouting protocol; sanitize irrigation bunds of weed hosts.");
        }
        disease.put("actionItems", disActions);
        List<Map<String, String>> disMetrics = new ArrayList<>();
        disMetrics.add(Map.of("label", "Relative Humidity", "value", humidity + "%"));
        disMetrics.add(Map.of("label", "Canopy Disease Risk", "value", "critical".equals(disease.get("status")) ? "High" : "Low"));
        disease.put("metrics", disMetrics);

        // Domain 5: Harvest & Trafficability
        Map<String, Object> harvest = new LinkedHashMap<>();
        harvest.put("title", "Harvest & Field Trafficability");
        List<String> harvActions = new ArrayList<>();
        if (precip48h > 10.0 || precip > 5.0) {
            harvest.put("status", "critical");
            harvest.put("statusLabel", "Harvesting & Drying Alert");
            harvest.put("description", "Muddy soil limits machinery access; high humidity endangers harvested grain.");
            harvActions.add("Halt open-air sun drying of harvested paddy, maize, and pulses; cover with waterproof tarpaulins.");
            harvActions.add("Delay combine harvester operations to avoid deep wheel ruts and severe soil compaction.");
            harvActions.add("Ensure grain storage moisture stays below 12% to prevent mold and mycotoxin formation.");
        } else {
            harvest.put("status", "favorable");
            harvest.put("statusLabel", "Optimal Field Trafficability");
            harvest.put("description", "Dry, firm ground allows tractors, combines, and labor teams to operate unhindered.");
            harvActions.add("Favorable window for threshing, mechanical harvesting, and sun drying.");
            harvActions.add("Ideal soil condition for land preparation, deep disc plowing, and ridge making.");
        }
        harvest.put("actionItems", harvActions);
        List<Map<String, String>> harvMetrics = new ArrayList<>();
        harvMetrics.add(Map.of("label", "Soil Trafficability", "value", "critical".equals(harvest.get("status")) ? "Poor / Muddy" : "Optimal"));
        harvMetrics.add(Map.of("label", "Sun Drying Suitability", "value", "critical".equals(harvest.get("status")) ? "Unsuitable" : "Favorable"));
        harvest.put("metrics", harvMetrics);

        // Actionable Checklist
        List<String> tips = new ArrayList<>();
        if (!sprayActions.isEmpty()) tips.add(sprayActions.get(0));
        if (!irrigActions.isEmpty()) tips.add(irrigActions.get(0));
        if (!fertActions.isEmpty()) tips.add(fertActions.get(0));
        if (!disActions.isEmpty()) tips.add(disActions.get(0));
        if (!harvActions.isEmpty()) tips.add(harvActions.get(0));

        // Summary statement
        String summary;
        if (precip48h > 15.0) {
            summary = String.format(Locale.US, "Active rainfall alert for %s: %.1fmm precipitation expected over 48 hours. Suspend field spraying, open-air drying, and nitrogen broadcasting. Clear field drainage ditches.", district, precip48h);
        } else if (temp > 35.0) {
            summary = String.format(Locale.US, "Thermal heat stress in %s with highs around %.0f°C. Increase irrigation frequency and apply mulching to minimize canopy heat stress.", district, temp);
        } else if (maxWind48h > 20.0) {
            summary = String.format(Locale.US, "Gusty wind conditions in %s (up to %.0f km/h). Avoid foliar spraying and inspect tall crops (maize, banana, sugarcane) for lodging support.", district, maxWind48h);
        } else {
            summary = String.format(Locale.US, "Favorable agro-climatic conditions prevailing across %s. Safe operational window for field operations, pest scouting, and precision nutrient application.", district);
        }

        List<String> riskAlerts = new ArrayList<>();
        if (precip48h > 25.0) riskAlerts.add(String.format(Locale.US, "Heavy Rainfall Warning: %.1fmm expected. Risk of localized waterlogging and root hypoxia.", precip48h));
        if (temp > 36.0) riskAlerts.add(String.format(Locale.US, "Extreme Heat Stress: Temperatures approaching %.0f°C. Protect nursery beds and sensitive blossoms.", temp));
        if (maxWind48h > 25.0) riskAlerts.add(String.format(Locale.US, "High Wind Gusts: Speeds up to %.0f km/h may cause lodging in sugarcane and banana.", maxWind48h));
        if (humidity > 85 && temp > 22.0) riskAlerts.add(String.format(Locale.US, "Severe Fungal Incubation Alert: Relative humidity %d%%. High risk for blast, sheath blight, and mildew.", humidity));

        Map<String, Object> advisory = new LinkedHashMap<>();
        advisory.put("summary", summary);
        advisory.put("tips", tips);
        advisory.put("farmingTips", tips);
        advisory.put("riskAlerts", riskAlerts);
        advisory.put("recommendations", tips);

        Map<String, Object> domains = new LinkedHashMap<>();
        domains.put("spraying", spraying);
        domains.put("irrigation", irrigation);
        domains.put("fertilizer", fertilizer);
        domains.put("diseaseRisk", disease);
        domains.put("harvestField", harvest);
        advisory.put("domains", domains);

        return advisory;
    }
}
