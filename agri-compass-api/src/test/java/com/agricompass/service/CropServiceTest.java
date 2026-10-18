package com.agricompass.service;

import com.agricompass.dto.CropDTO;
import com.agricompass.entity.*;
import com.agricompass.repository.CropDistrictRepository;
import com.agricompass.repository.CropRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CropServiceTest {

    @Mock
    private CropRepository cropRepository;

    @Mock
    private CropDistrictRepository districtRepository;

    private CropService cropService;

    @BeforeEach
    void setUp() {
        cropService = new CropService(cropRepository, districtRepository);
    }

    private Crop createTestCrop(Long id, String name, Integer profitability, Integer climateSuitability) {
        Crop crop = new Crop();
        crop.setId(id);
        crop.setName(name);
        crop.setDistrict("Dharwad");
        crop.setSeason("Kharif");

        if (profitability != null || climateSuitability != null) {
            CropAiScore score = new CropAiScore();
            score.setProfitabilityScore(profitability != null ? profitability : 0);
            score.setClimateSuitabilityScore(climateSuitability != null ? climateSuitability : 0);
            score.setSoilSuitabilityScore(8);
            score.setWaterEfficiencyScore(7);
            score.setSustainabilityRating(9.0);
            crop.setAiScore(score);
        }

        CropSoilRequirement soil = new CropSoilRequirement();
        soil.setPhRange("6.0-7.5");
        crop.setSoilRequirement(soil);

        CropNutrient nutrient = new CropNutrient();
        nutrient.setNitrogenKg(100);
        nutrient.setPhosphorusKg(50);
        nutrient.setPotassiumKg(50);
        crop.setNutrient(nutrient);

        return crop;
    }

    private CropDistrict createCropDistrict(Crop crop, String districtName) {
        CropDistrict cd = new CropDistrict();
        cd.setCrop(crop);
        cd.setDistrictName(districtName);
        return cd;
    }

    @Test
    @DisplayName("White-box: getRecommendations calculates weighted score (60% profit, 40% climate) and ranks correctly")
    void getRecommendations_withMatchingDistrict_shouldRankByWeightedScore() {
        Crop cropA = createTestCrop(1L, "Crop A", 50, 100); // 50*0.6 + 100*0.4 = 30 + 40 = 70.0
        Crop cropB = createTestCrop(2L, "Crop B", 90, 80);   // 90*0.6 + 80*0.4 = 54 + 32 = 86.0
        Crop cropC = createTestCrop(3L, "Crop C", 80, 50);   // 80*0.6 + 50*0.4 = 48 + 20 = 68.0
        Crop cropNoScore = createTestCrop(4L, "Crop No Score", null, null);

        CropDistrict cd1 = createCropDistrict(cropA, "Dharwad");
        CropDistrict cd2 = createCropDistrict(cropB, "Dharwad");
        CropDistrict cd3 = createCropDistrict(cropC, "Dharwad");
        CropDistrict cd4 = createCropDistrict(cropNoScore, "Dharwad");

        when(districtRepository.findByDistrictNameIgnoreCase("Dharwad"))
                .thenReturn(List.of(cd1, cd2, cd3, cd4));

        List<CropDTO> recommendations = cropService.getRecommendations("Dharwad");

        // Top should be Crop B (86.0), followed by Crop A (70.0), then Crop C (68.0). Crop without score excluded.
        assertThat(recommendations).hasSize(3);
        assertThat(recommendations.get(0).getName()).isEqualTo("Crop B");
        assertThat(recommendations.get(1).getName()).isEqualTo("Crop A");
        assertThat(recommendations.get(2).getName()).isEqualTo("Crop C");
    }

    @Test
    @DisplayName("White-box: getRecommendations falls back to top profitability crops when district is empty")
    void getRecommendations_whenDistrictEmpty_shouldFallbackToAllCropsByProfitability() {
        when(districtRepository.findByDistrictNameIgnoreCase("UnknownDistrict"))
                .thenReturn(Collections.emptyList());

        Crop crop1 = createTestCrop(1L, "Low Profit", 40, 90);
        Crop crop2 = createTestCrop(2L, "High Profit", 95, 50);
        Crop crop3 = createTestCrop(3L, "Medium Profit", 70, 60);
        Crop crop4 = createTestCrop(4L, "Very High Profit", 99, 40);

        when(cropRepository.findAll()).thenReturn(List.of(crop1, crop2, crop3, crop4));

        List<CropDTO> recommendations = cropService.getRecommendations("UnknownDistrict");

        assertThat(recommendations).hasSize(3);
        // Sorted strictly by profitability: crop4 (99), crop2 (95), crop3 (70)
        assertThat(recommendations.get(0).getName()).isEqualTo("Very High Profit");
        assertThat(recommendations.get(1).getName()).isEqualTo("High Profit");
        assertThat(recommendations.get(2).getName()).isEqualTo("Medium Profit");
    }

    @Test
    @DisplayName("Unit test: getCropById returns converted DTO or null when not found")
    void getCropById_shouldReturnDTOOrNull() {
        Crop crop = createTestCrop(10L, "Cotton", 80, 75);
        when(cropRepository.findById(10L)).thenReturn(Optional.of(crop));
        when(cropRepository.findById(999L)).thenReturn(Optional.empty());

        CropDTO found = cropService.getCropById(10L);
        assertThat(found).isNotNull();
        assertThat(found.getId()).isEqualTo(10L);
        assertThat(found.getName()).isEqualTo("Cotton");
        assertThat(found.getSoilRequirement().phRange).isEqualTo("6.0-7.5");
        assertThat(found.getNutrient().nitrogenKg).isEqualTo(100);

        CropDTO notFound = cropService.getCropById(999L);
        assertThat(notFound).isNull();
    }

    @Test
    @DisplayName("Unit test: searchCrops delegates to repository searchByName")
    void searchCrops_shouldCallRepository() {
        Crop crop = createTestCrop(1L, "Ragi", 70, 80);
        when(cropRepository.searchByName("rag")).thenReturn(List.of(crop));

        List<CropDTO> results = cropService.searchCrops("rag");
        assertThat(results).hasSize(1);
        assertThat(results.get(0).getName()).isEqualTo("Ragi");
        verify(cropRepository).searchByName("rag");
    }

    @Test
    @DisplayName("White-box: getCropsByDistrict uses district repository when present, falls back to crop repository")
    void getCropsByDistrict_branchTesting() {
        Crop crop1 = createTestCrop(1L, "District Crop", 70, 70);
        CropDistrict cd = createCropDistrict(crop1, "Mysuru");
        when(districtRepository.findByDistrictNameIgnoreCase("Mysuru")).thenReturn(List.of(cd));

        List<CropDTO> results = cropService.getCropsByDistrict("Mysuru");
        assertThat(results).hasSize(1);
        assertThat(results.get(0).getName()).isEqualTo("District Crop");

        // Fallback branch
        when(districtRepository.findByDistrictNameIgnoreCase("Mandya")).thenReturn(Collections.emptyList());
        when(cropRepository.findByDistrict("Mandya")).thenReturn(List.of(createTestCrop(2L, "Fallback Crop", 60, 60)));

        List<CropDTO> fallbackResults = cropService.getCropsByDistrict("Mandya");
        assertThat(fallbackResults).hasSize(1);
        assertThat(fallbackResults.get(0).getName()).isEqualTo("Fallback Crop");
    }

    @Test
    @DisplayName("Unit test: getAllCrops returns page of CropDTOs")
    void getAllCrops_shouldReturnPage() {
        Crop crop = createTestCrop(1L, "Wheat", 80, 80);
        Pageable pageable = PageRequest.of(0, 10);
        when(cropRepository.findAll(pageable)).thenReturn(new PageImpl<>(List.of(crop)));

        Page<CropDTO> page = cropService.getAllCrops(pageable);
        assertThat(page.getTotalElements()).isEqualTo(1);
        assertThat(page.getContent().get(0).getName()).isEqualTo("Wheat");
    }

    @Test
    @DisplayName("Unit test: getHighProfitCrops and getLowWaterCrops invoke repository queries")
    void specializedQueries_shouldReturnResults() {
        Crop crop = createTestCrop(1L, "High Profit Crop", 90, 90);
        when(cropRepository.findHighProfitCrops(any())).thenReturn(List.of(crop));
        when(cropRepository.findLowWaterCrops(any())).thenReturn(List.of(crop));

        List<CropDTO> highProfit = cropService.getHighProfitCrops();
        List<CropDTO> lowWater = cropService.getLowWaterCrops();

        assertThat(highProfit).hasSize(1);
        assertThat(lowWater).hasSize(1);
        verify(cropRepository).findHighProfitCrops(any());
        verify(cropRepository).findLowWaterCrops(any());
    }
}
