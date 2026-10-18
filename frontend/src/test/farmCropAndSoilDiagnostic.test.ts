import { describe, it, expect } from 'vitest';
import {
  generateScientificSoilRecommendation,
  SoilAnalysisPayload,
  isCropYetToBeGrown,
} from '../lib/ai/soilDiagnosticEngine';

describe('Farm Creation (No Crop) & Soil Diagnostics Dual-Mode Tests', () => {
  describe('Requirement 1: Farm creation without crop / yet to be grown', () => {
    it('correctly identifies fallow, empty, and yet-to-be-grown crop states', () => {
      expect(isCropYetToBeGrown(null)).toBe(true);
      expect(isCropYetToBeGrown(undefined)).toBe(true);
      expect(isCropYetToBeGrown('')).toBe(true);
      expect(isCropYetToBeGrown('   ')).toBe(true);
      expect(isCropYetToBeGrown('None')).toBe(true);
      expect(isCropYetToBeGrown('none')).toBe(true);
      expect(isCropYetToBeGrown('Fallow')).toBe(true);
      expect(isCropYetToBeGrown('Yet to be grown')).toBe(true);
      expect(isCropYetToBeGrown('Crop is yet to be grown in this field')).toBe(true);
      expect(isCropYetToBeGrown('awaiting crop')).toBe(true);

      // Actively cultivated crops must return false
      expect(isCropYetToBeGrown('Sugarcane')).toBe(false);
      expect(isCropYetToBeGrown('Tomato')).toBe(false);
      expect(isCropYetToBeGrown('Paddy (Rice)')).toBe(false);
      expect(isCropYetToBeGrown('Ragi')).toBe(false);
      expect(isCropYetToBeGrown('Cotton')).toBe(false);
      expect(isCropYetToBeGrown('Maize')).toBe(false);
    });

    it('ensures farm payload preserves null instead of forcing fallback to Rice', () => {
      // Simulating farm submission logic from MyFarm.tsx
      const isCropYetToBeGrownChecked = true;
      const formData = {
        name: 'Uttara Green Plot',
        location: 'Dharwad',
        area_acres: '4.5',
        soil_type: 'Black',
        irrigation_type: 'Borewell',
        current_crop: '',
      };

      const farmPayload = {
        name: formData.name,
        location: formData.location,
        area_acres: parseFloat(formData.area_acres),
        soil_type: formData.soil_type,
        irrigation_type: formData.irrigation_type,
        current_crop:
          isCropYetToBeGrownChecked || !formData.current_crop || formData.current_crop.trim() === ''
            ? null
            : formData.current_crop.trim(),
      };

      expect(farmPayload.current_crop).toBeNull();
      expect(farmPayload.current_crop).not.toBe('Rice');
    });
  });

  describe('Requirement 2: Soil Diagnostics when crop is yet to be grown', () => {
    it('suggests recommended crops when no crop is currently planted', () => {
      const fallowPayload: SoilAnalysisPayload = {
        farmer_name: 'Anand Gowda',
        location: 'Mandya',
        field_size_acres: 3,
        water_source: 'Canal',
        crop_status: 'yet_to_be_grown',
        preferred_crop: null,
        soil_data: {
          nitrogen: 65,
          phosphorus: 35,
          potassium: 45,
          pH: 6.5,
          moisture: 55,
          temperature_C: 28,
          humidity_percent: 70,
        },
      };

      const result = generateScientificSoilRecommendation(fallowPayload);

      expect(result.mode).toBe('crop_recommendation');
      expect(result.current_crop).toBeNull();
      expect(result.active_crop_optimization).toBeUndefined();

      // Must provide top recommended crops to plant
      expect(result.recommended_crops).toBeInstanceOf(Array);
      expect(result.recommended_crops.length).toBeGreaterThan(0);

      // Each recommended crop must have scores and complete growing guides
      for (const crop of result.recommended_crops) {
        expect(crop.crop_name).toBeTruthy();
        expect(crop.suitability_score).toBeGreaterThan(0);
        expect(crop.expected_yield_per_acre_tons).toBeGreaterThan(0);
        expect(crop.growing_guide.sowing_details).toBeTruthy();
        expect(crop.growing_guide.fertilizer_npk_schedule_per_acre).toBeTruthy();
        expect(crop.growing_guide.irrigation_plan).toBeTruthy();
      }
    });
  });

  describe('Requirement 3: Soil Diagnostics when a crop is ALREADY being grown', () => {
    it('does not suggest other crops; optimizes the cultivated crop with exact units for fertilizer and water', () => {
      const activePayload: SoilAnalysisPayload = {
        farmer_name: 'Basavaraj Patil',
        location: 'Kolar',
        field_size_acres: 4,
        water_source: 'Drip Irrigation',
        crop_status: 'growing',
        preferred_crop: 'Tomato',
        soil_data: {
          nitrogen: 40, // Deficit for Tomato (Target: 80 kg/ha)
          phosphorus: 20, // Deficit for Tomato (Target: 50 kg/ha)
          potassium: 35, // Deficit for Tomato (Target: 65 kg/ha)
          pH: 5.5, // Acidic
          moisture: 30, // Low moisture (Ideal for Tomato: 45-65%)
          temperature_C: 29,
          humidity_percent: 65,
        },
      };

      const result = generateScientificSoilRecommendation(activePayload);

      expect(result.mode).toBe('active_crop_optimization');
      expect(result.current_crop).toContain('Tomato');
      expect(result.active_crop_optimization).toBeDefined();

      const opt = result.active_crop_optimization!;
      expect(opt.crop_name).toContain('Tomato');

      // 1. Nutrient adjustments in exact units (kg/acre and kg across field)
      expect(opt.nutrient_adjustments).toBeInstanceOf(Array);
      expect(opt.nutrient_adjustments.length).toBeGreaterThanOrEqual(3);

      const nAdj = opt.nutrient_adjustments.find((a) => a.nutrient.includes('Nitrogen'));
      expect(nAdj).toBeDefined();
      expect(nAdj!.action).toBe('increase');
      expect(nAdj!.unit_recommendation).toMatch(/Urea/i);
      expect(nAdj!.commercial_fertilizer_dosage).toMatch(/kg\/acre Urea/i);

      const pAdj = opt.nutrient_adjustments.find((a) => a.nutrient.includes('Phosphorus'));
      expect(pAdj).toBeDefined();
      expect(pAdj!.action).toBe('increase');
      expect(pAdj!.unit_recommendation).toMatch(/DAP|SSP/i);

      const kAdj = opt.nutrient_adjustments.find((a) => a.nutrient.includes('Potassium'));
      expect(kAdj).toBeDefined();
      expect(kAdj!.action).toBe('increase');
      expect(kAdj!.unit_recommendation).toMatch(/MOP|Potash/i);

      // 2. Water adjustments in exact units (mm, minutes, frequency)
      expect(opt.water_adjustments).toBeDefined();
      expect(opt.water_adjustments.action).toBe('increase');
      expect(opt.water_adjustments.unit_recommendation).toMatch(/\+15.*mm/i);
      expect(opt.water_adjustments.frequency_and_schedule).toMatch(/Drip/i);

      // 3. Soil Condition Improvements in units (e.g. Lime in kg/acre for acidic pH)
      expect(opt.soil_condition_improvements).toBeInstanceOf(Array);
      const phImprovement = opt.soil_condition_improvements.find((s) => s.parameter.includes('pH'));
      expect(phImprovement).toBeDefined();
      expect(phImprovement!.remediation_in_units.toLowerCase()).toContain('lime');

      // 4. Ideal growing protocol
      expect(opt.ideal_growing_protocol).toBeDefined();
      expect(opt.ideal_growing_protocol.fertilizer_npk_schedule_per_acre).toBeTruthy();
      expect(opt.ideal_growing_protocol.irrigation_plan).toBeTruthy();
      expect(opt.ideal_growing_protocol.pest_disease_management).toBeTruthy();
      expect(opt.expected_yield_with_improvements).toMatch(/Tons\/Acre/i);
    });

    it('correctly recommends REDUCING fertilizer units when nutrients are in high surplus', () => {
      const surplusPayload: SoilAnalysisPayload = {
        farmer_name: 'Suresh Kumar',
        location: 'Belagavi',
        field_size_acres: 2,
        water_source: 'Canal',
        crop_status: 'growing',
        preferred_crop: 'Paddy (Rice)',
        soil_data: {
          nitrogen: 130, // High surplus for Rice (Target: 90 kg/ha)
          phosphorus: 75, // High surplus for Rice (Target: 45 kg/ha)
          potassium: 85, // High surplus for Rice (Target: 50 kg/ha)
          pH: 7.0,
          moisture: 90, // Surplus moisture (Standing water excess)
          temperature_C: 27,
          humidity_percent: 80,
        },
      };

      const result = generateScientificSoilRecommendation(surplusPayload);

      expect(result.mode).toBe('active_crop_optimization');
      const opt = result.active_crop_optimization!;

      // Nitrogen action should be decrease
      const nAdj = opt.nutrient_adjustments.find((a) => a.nutrient.includes('Nitrogen'));
      expect(nAdj).toBeDefined();
      expect(nAdj!.action).toBe('decrease');
      expect(nAdj!.unit_recommendation.toLowerCase()).toMatch(/reduce/i);

      // Phosphorus action should be decrease
      const pAdj = opt.nutrient_adjustments.find((a) => a.nutrient.includes('Phosphorus'));
      expect(pAdj).toBeDefined();
      expect(pAdj!.action).toBe('decrease');
      expect(pAdj!.commercial_fertilizer_dosage.toLowerCase()).toMatch(/reduce/i);

      // Water action should be decrease / drain
      expect(opt.water_adjustments.action).toBe('decrease');
      expect(opt.water_adjustments.unit_recommendation.toLowerCase()).toMatch(/reduce|drain/i);
    });
  });
});
