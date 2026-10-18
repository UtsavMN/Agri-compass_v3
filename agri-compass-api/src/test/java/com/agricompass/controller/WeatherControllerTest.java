package com.agricompass.controller;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

@ExtendWith(MockitoExtension.class)
class WeatherControllerTest {

    @Mock
    private RestTemplate restTemplate;

    @Test
    @DisplayName("White-box: findNearestDistrict accurately matches district coordinates using Haversine formula")
    void findNearestDistrict_shouldReturnClosestDistrict() {
        // Coords near Dharwad (15.46, 75.01)
        String dharwad = WeatherController.findNearestDistrict(15.45, 75.02);
        assertThat(dharwad).isEqualTo("Dharwad");

        // Coords near Bengaluru Urban (12.97, 77.59)
        String blr = WeatherController.findNearestDistrict(12.98, 77.60);
        assertThat(blr).isEqualTo("Bengaluru Urban");

        // Coords near Mysuru (12.30, 76.66)
        String mysuru = WeatherController.findNearestDistrict(12.29, 76.65);
        assertThat(mysuru).isEqualTo("Mysuru");

        // Coords near Kalaburagi (17.33, 76.83)
        String kalaburagi = WeatherController.findNearestDistrict(17.32, 76.84);
        assertThat(kalaburagi).isEqualTo("Kalaburagi");
    }

    @Test
    @DisplayName("White-box: degreesToCardinal converts azimuth bearings to 16 cardinal points")
    void degreesToCardinal_shouldMapCorrectly() {
        assertThat(WeatherController.degreesToCardinal(0)).isEqualTo("N");
        assertThat(WeatherController.degreesToCardinal(360)).isEqualTo("N");
        assertThat(WeatherController.degreesToCardinal(90)).isEqualTo("E");
        assertThat(WeatherController.degreesToCardinal(180)).isEqualTo("S");
        assertThat(WeatherController.degreesToCardinal(270)).isEqualTo("W");
        assertThat(WeatherController.degreesToCardinal(45)).isEqualTo("NE");
        assertThat(WeatherController.degreesToCardinal(135)).isEqualTo("SE");
        assertThat(WeatherController.degreesToCardinal(225)).isEqualTo("SW");
        assertThat(WeatherController.degreesToCardinal(315)).isEqualTo("NW");
    }

    @Test
    @DisplayName("White-box: wmoCodeToDescription maps standard meteorological codes to human-readable strings")
    void wmoCodeToDescription_shouldMapCodes() {
        assertThat(WeatherController.wmoCodeToDescription(0)).isEqualTo("Clear Sky");
        assertThat(WeatherController.wmoCodeToDescription(3)).isEqualTo("Overcast");
        assertThat(WeatherController.wmoCodeToDescription(45)).isEqualTo("Foggy");
        assertThat(WeatherController.wmoCodeToDescription(61)).isEqualTo("Slight Rain");
        assertThat(WeatherController.wmoCodeToDescription(65)).isEqualTo("Heavy Rain");
        assertThat(WeatherController.wmoCodeToDescription(80)).isEqualTo("Light Rain Showers");
        assertThat(WeatherController.wmoCodeToDescription(95)).isEqualTo("Thunderstorm");
        assertThat(WeatherController.wmoCodeToDescription(999)).isEqualTo("Clear Sky"); // Default fallback
    }

    @Test
    @DisplayName("White-box: evaluateSprayingSuitability accurately flags washout and wind drift hazards")
    void evaluateSprayingSuitability_boundaryConditions() {
        // High rain probability -> Washout hazard (Unfavorable)
        Map<String, String> washout = WeatherController.evaluateSprayingSuitability(5.0, 70, 0.0);
        assertThat(washout.get("suitability")).isEqualTo("Unfavorable");
        assertThat(washout.get("reason")).contains("Washout Hazard");

        // High rain volume (> 4mm) -> Washout hazard (Unfavorable)
        Map<String, String> heavyRain = WeatherController.evaluateSprayingSuitability(5.0, 20, 6.5);
        assertThat(heavyRain.get("suitability")).isEqualTo("Unfavorable");
        assertThat(heavyRain.get("reason")).contains("Washout Hazard");

        // High wind speed (> 20 km/h) -> Wind drift hazard (Unfavorable)
        Map<String, String> highWind = WeatherController.evaluateSprayingSuitability(24.0, 10, 0.0);
        assertThat(highWind.get("suitability")).isEqualTo("Unfavorable");
        assertThat(highWind.get("reason")).contains("Wind Drift Hazard");

        // Moderate wind or rain (e.g. 15 km/h) -> Caution
        Map<String, String> moderate = WeatherController.evaluateSprayingSuitability(15.0, 10, 0.0);
        assertThat(moderate.get("suitability")).isEqualTo("Caution");

        // Optimal low wind (<13 km/h) and minimal rain risk (<25%) -> Favorable
        Map<String, String> optimal = WeatherController.evaluateSprayingSuitability(8.0, 10, 0.0);
        assertThat(optimal.get("suitability")).isEqualTo("Favorable");
        assertThat(optimal.get("reason")).contains("Optimal conditions");
    }
}
