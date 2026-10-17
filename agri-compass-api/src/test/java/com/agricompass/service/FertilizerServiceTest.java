package com.agricompass.service;

import com.agricompass.entity.FertilizerAnalysis;
import com.agricompass.repository.FertilizerAnalysisRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class FertilizerServiceTest {

    @Mock
    private FertilizerAnalysisRepository analysisRepository;

    private FertilizerService fertilizerService;

    @BeforeEach
    void setUp() {
        fertilizerService = new FertilizerService(analysisRepository);
        fertilizerService.init();
    }

    @Test
    @DisplayName("White-box: init loads dataset without errors")
    void init_shouldLoadDatasetSuccessfully() {
        Map<String, Object> cropData = fertilizerService.getCropData("rice");
        assertThat(cropData).isNotNull();
    }

    @Test
    @DisplayName("Unit test: calculateRecommendation throws on null crop")
    void calculateRecommendation_shouldThrowOnNullCrop() {
        assertThatThrownBy(() -> fertilizerService.calculateRecommendation(null, 20.0, 15.0, 15.0))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Crop name cannot be empty");
    }

    @Test
    @DisplayName("Unit test: calculateRecommendation throws on empty crop")
    void calculateRecommendation_shouldThrowOnEmptyCrop() {
        assertThatThrownBy(() -> fertilizerService.calculateRecommendation("   ", 20.0, 15.0, 15.0))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    @DisplayName("White-box: calculateRecommendation returns valid nutrient requirements and deficits")
    void calculateRecommendation_withValidCrop_shouldReturnRecommendation() {
        Map<String, Object> result = fertilizerService.calculateRecommendation("rice", 20.0, 10.0, 15.0);

        assertThat(result).isNotNull();
        assertThat(result).containsKey("recommended_n");
        assertThat(result).containsKey("fertilizer_plan");
        assertThat(result).containsKey("recommended_urea_kg");
    }

    @Test
    @DisplayName("White-box: advancedAnalysis calculates nutrient deficit and non-negative values")
    @SuppressWarnings("unchecked")
    void advancedAnalysis_withLowNutrients_shouldCalculateDeficits() {
        Map<String, Object> analysis = fertilizerService.advancedAnalysis(
                "rice", 5.0, 5.0, 5.0, "medium", "neutral", "basal"
        );

        assertThat(analysis).containsKey("soil_health_score");
        int score = (int) analysis.get("soil_health_score");
        assertThat(score).isBetween(0, 100);

        Map<String, Object> deficits = (Map<String, Object>) analysis.get("nutrient_deficit");
        assertThat(deficits).isNotNull();
        assertThat((double) deficits.get("nitrogen")).isGreaterThanOrEqualTo(0.0);
        assertThat((double) deficits.get("phosphorus")).isGreaterThanOrEqualTo(0.0);
        assertThat((double) deficits.get("potassium")).isGreaterThanOrEqualTo(0.0);

        Map<String, Object> recs = (Map<String, Object>) analysis.get("fertilizer_recommendation");
        assertThat(recs).containsKey("urea");
        assertThat(recs).containsKey("dap");
        assertThat(recs).containsKey("mop");
    }

    @Test
    @DisplayName("White-box: advancedAnalysis with high soil nutrients caps deficits at 0")
    @SuppressWarnings("unchecked")
    void advancedAnalysis_withHighNutrients_shouldCapDeficitsAtZero() {
        Map<String, Object> analysis = fertilizerService.advancedAnalysis(
                "rice", 500.0, 500.0, 500.0, "high", "neutral", "basal"
        );

        Map<String, Object> deficits = (Map<String, Object>) analysis.get("nutrient_deficit");
        assertThat((double) deficits.get("nitrogen")).isEqualTo(0.0);
        assertThat((double) deficits.get("phosphorus")).isEqualTo(0.0);
        assertThat((double) deficits.get("potassium")).isEqualTo(0.0);
    }

    @Test
    @DisplayName("White-box: Acidic soil applies pH adjustment multiplier")
    @SuppressWarnings("unchecked")
    void advancedAnalysis_withAcidicSoil_shouldAddExplanation() {
        Map<String, Object> analysis = fertilizerService.advancedAnalysis(
                "rice", 20.0, 15.0, 15.0, "low", "acidic", "tillering"
        );

        List<String> explanations = (List<String>) analysis.get("explanations");
        assertThat(explanations).anyMatch(e -> e.contains("pH") || e.contains("fertility"));
    }

    @Test
    @DisplayName("Regression test: saveAnalysis preserves resultJson correctly when result is Map")
    void saveAnalysis_withMapResult_shouldSerializeJson() throws IOException {
        Map<String, Object> body = new HashMap<>();
        body.put("farmId", "farm-123");
        body.put("crop", "rice");
        body.put("soil_n", 25.0);
        body.put("soil_p", 20.0);
        body.put("soil_k", 20.0);
        body.put("soil_level", "medium");
        body.put("soil_ph", "neutral");
        body.put("growth_stage", "basal");
        body.put("result", Map.of("soil_health_score", 85));

        when(analysisRepository.save(any(FertilizerAnalysis.class))).thenAnswer(inv -> inv.getArgument(0));

        FertilizerAnalysis saved = fertilizerService.saveAnalysis(body);

        assertThat(saved.getFarmId()).isEqualTo("farm-123");
        assertThat(saved.getCrop()).isEqualTo("rice");
        assertThat(saved.getResultJson()).contains("\"soil_health_score\":85");
        verify(analysisRepository).save(any(FertilizerAnalysis.class));
    }

    @Test
    @DisplayName("Regression test: saveAnalysis preserves resultJson correctly when result is String")
    void saveAnalysis_withStringResult_shouldStoreStringDirectly() throws IOException {
        Map<String, Object> body = new HashMap<>();
        body.put("farmId", "farm-123");
        body.put("crop", "maize");
        body.put("result", "{\"soil_health_score\":90}");

        when(analysisRepository.save(any(FertilizerAnalysis.class))).thenAnswer(inv -> inv.getArgument(0));

        FertilizerAnalysis saved = fertilizerService.saveAnalysis(body);

        assertThat(saved.getResultJson()).isEqualTo("{\"soil_health_score\":90}");
    }

    @Test
    @DisplayName("Integration test: getAnalysisHistory queries repository with farmId")
    void getAnalysisHistory_shouldQueryRepository() {
        FertilizerAnalysis sample = new FertilizerAnalysis();
        sample.setFarmId("farm-456");
        when(analysisRepository.findByFarmIdOrderByCreatedAtDesc("farm-456")).thenReturn(List.of(sample));

        List<FertilizerAnalysis> history = fertilizerService.getAnalysisHistory("farm-456");

        assertThat(history).hasSize(1);
        assertThat(history.get(0).getFarmId()).isEqualTo("farm-456");
        verify(analysisRepository).findByFarmIdOrderByCreatedAtDesc("farm-456");
    }
}
