package com.agricompass.service;

import com.agricompass.dto.CropDTO;
import com.agricompass.entity.*;
import com.agricompass.repository.CropDistrictRepository;
import com.agricompass.repository.CropRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class CropService {

    private final CropRepository cropRepository;
    private final CropDistrictRepository districtRepository;

    public CropService(CropRepository cropRepository, CropDistrictRepository districtRepository) {
        this.cropRepository = cropRepository;
        this.districtRepository = districtRepository;
    }

    public Page<CropDTO> getAllCrops(Pageable pageable) {
        return cropRepository.findAll(pageable).map(this::convertToDTO);
    }

    public CropDTO getCropById(Long id) {
        return cropRepository.findById(id)
                .map(this::convertToDTO)
                .orElse(null);
    }

    public List<CropDTO> searchCrops(String query) {
        return cropRepository.findAll().stream()
                .filter(c -> c.getName().toLowerCase().contains(query.toLowerCase()) || 
                            (c.getSeason() != null && c.getSeason().toLowerCase().contains(query.toLowerCase())))
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<CropDTO> getRecommendations(String district) {
        List<CropDistrict> districtCrops = districtRepository.findByDistrictNameIgnoreCase(district);
        if (districtCrops.isEmpty()) {
            // Fallback: return top rated crops generally
            return cropRepository.findAll().stream()
                    .filter(c -> c.getAiScore() != null)
                    .sorted((c1, c2) -> c2.getAiScore().getProfitabilityScore().compareTo(c1.getAiScore().getProfitabilityScore()))
                    .limit(3)
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
        }
        
        return districtCrops.stream()
                .map(CropDistrict::getCrop)
                .distinct()
                .filter(c -> c.getAiScore() != null)
                .sorted((c1, c2) -> {
                    // Weighted score: 60% profitability, 40% climate suitability
                    double score1 = c1.getAiScore().getProfitabilityScore() * 0.6 + c1.getAiScore().getClimateSuitabilityScore() * 0.4;
                    double score2 = c2.getAiScore().getProfitabilityScore() * 0.6 + c2.getAiScore().getClimateSuitabilityScore() * 0.4;
                    return Double.compare(score2, score1);
                })
                .limit(3)
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<CropDTO> getCropsByDistrict(String district) {
        return districtRepository.findByDistrictNameIgnoreCase(district).stream()
                .map(CropDistrict::getCrop)
                .distinct()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<CropDTO> getCropsBySeason(String season) {
        return cropRepository.findAll().stream()
                .filter(c -> c.getSeason() != null && c.getSeason().equalsIgnoreCase(season))
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<CropDTO> getHighProfitCrops() {
        return cropRepository.findAll().stream()
                .filter(c -> c.getAiScore() != null && c.getAiScore().getProfitabilityScore() >= 90)
                .sorted((c1, c2) -> c2.getAiScore().getProfitabilityScore().compareTo(c1.getAiScore().getProfitabilityScore()))
                .limit(10)
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<CropDTO> getLowWaterCrops() {
        return cropRepository.findAll().stream()
                .filter(c -> c.getAiScore() != null && c.getAiScore().getWaterEfficiencyScore() >= 90)
                .sorted((c1, c2) -> c2.getAiScore().getWaterEfficiencyScore().compareTo(c1.getAiScore().getWaterEfficiencyScore()))
                .limit(10)
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private CropDTO convertToDTO(Crop crop) {
        CropDTO dto = new CropDTO();
        dto.setId(crop.getId());
        dto.setName(crop.getName());
        dto.setDistrict(crop.getDistrict());
        dto.setSeason(crop.getSeason());
        dto.setDurationDays(crop.getDurationDays());
        dto.setInvestmentPerAcre(crop.getInvestmentPerAcre());
        dto.setExpectedReturns(crop.getExpectedReturns());
        dto.setBreakevenMonths(crop.getBreakevenMonths());
        dto.setSoilType(crop.getSoilType());
        dto.setRainfallMm(crop.getRainfallMm());
        dto.setWeatherPattern(crop.getWeatherPattern());
        dto.setWaterRequirement(crop.getWaterRequirement());
        dto.setTemperatureRange(crop.getTemperatureRange());
        dto.setGuidelines(crop.getGuidelines());
        dto.setImageUrl(crop.getImageUrl());
        dto.setScientificName(crop.getScientificName());
        dto.setDifficultyLevel(crop.getDifficultyLevel());

        if (crop.getSoilRequirement() != null) {
            CropDTO.SoilRequirementDTO s = new CropDTO.SoilRequirementDTO();
            s.phRange = crop.getSoilRequirement().getPhRange();
            s.organicCarbon = crop.getSoilRequirement().getOrganicCarbon();
            s.greenManure = crop.getSoilRequirement().getGreenManure();
            s.cropRotation = crop.getSoilRequirement().getCropRotation();
            s.mulching = crop.getSoilRequirement().getMulching();
            dto.setSoilRequirement(s);
        }

        if (crop.getNutrient() != null) {
            CropDTO.NutrientDTO n = new CropDTO.NutrientDTO();
            n.nitrogenKg = crop.getNutrient().getNitrogenKg();
            n.phosphorusKg = crop.getNutrient().getPhosphorusKg();
            n.potassiumKg = crop.getNutrient().getPotassiumKg();
            dto.setNutrient(n);
        }

        if (crop.getMarketInfo() != null) {
            CropDTO.MarketInfoDTO m = new CropDTO.MarketInfoDTO();
            m.averageMsp = crop.getMarketInfo().getAverageMsp();
            m.marketDemand = crop.getMarketInfo().getMarketDemand();
            m.exportPotential = crop.getMarketInfo().getExportPotential();
            m.priceVolatility = crop.getMarketInfo().getPriceVolatility();
            dto.setMarketInfo(m);
        }

        if (crop.getYieldInfo() != null) {
            CropDTO.YieldInfoDTO y = new CropDTO.YieldInfoDTO();
            y.minimumQuintals = crop.getYieldInfo().getMinimumQuintals();
            y.averageQuintals = crop.getYieldInfo().getAverageQuintals();
            y.bestPracticeQuintals = crop.getYieldInfo().getBestPracticeQuintals();
            dto.setYieldInfo(y);
        }

        if (crop.getPostHarvest() != null) {
            CropDTO.PostHarvestDTO p = new CropDTO.PostHarvestDTO();
            p.storageMethod = crop.getPostHarvest().getStorageMethod();
            p.storageDurationMonths = crop.getPostHarvest().getStorageDurationMonths();
            p.processingRequired = crop.getPostHarvest().getProcessingRequired();
            dto.setPostHarvest(p);
        }

        if (crop.getAiScore() != null) {
            CropDTO.AiScoreDTO a = new CropDTO.AiScoreDTO();
            a.climateSuitabilityScore = crop.getAiScore().getClimateSuitabilityScore();
            a.soilSuitabilityScore = crop.getAiScore().getSoilSuitabilityScore();
            a.profitabilityScore = crop.getAiScore().getProfitabilityScore();
            a.waterEfficiencyScore = crop.getAiScore().getWaterEfficiencyScore();
            a.sustainabilityRating = crop.getAiScore().getSustainabilityRating();
            dto.setAiScore(a);
        }

        if (crop.getDiseases() != null) {
            dto.setDiseases(crop.getDiseases().stream().map(d -> {
                CropDTO.DiseaseDTO dd = new CropDTO.DiseaseDTO();
                dd.name = d.getName();
                dd.symptoms = d.getSymptoms();
                dd.management = d.getManagement();
                return dd;
            }).collect(Collectors.toList()));
        }

        if (crop.getIrrigations() != null) {
            dto.setIrrigations(crop.getIrrigations().stream()
                .map(CropIrrigation::getMethod)
                .collect(Collectors.toList()));
        }

        if (crop.getRecommendedDistricts() != null) {
            dto.setRecommendedDistricts(crop.getRecommendedDistricts().stream()
                .map(CropDistrict::getDistrictName)
                .collect(Collectors.toList()));
        }

        if (crop.getGrowingSteps() != null) {
            dto.setGrowingSteps(crop.getGrowingSteps().stream().map(s -> {
                CropDTO.GrowingStepDTO gs = new CropDTO.GrowingStepDTO();
                gs.stepNumber = s.getStepNumber();
                gs.title = s.getTitle();
                gs.details = s.getDetails();
                return gs;
            }).collect(Collectors.toList()));
        }

        return dto;
    }
}
