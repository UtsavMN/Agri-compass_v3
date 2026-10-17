import { describe, it, expect } from 'vitest';
import { generateScientificSoilRecommendation, SoilAnalysisPayload } from '../lib/ai/soilDiagnosticEngine';

describe('SoilDiagnosticEngine - White-box and Unit Tests', () => {
  const basePayload: SoilAnalysisPayload = {
    farmer_name: 'Basavaraj Gowda',
    location: 'Mandya, Karnataka',
    field_size_acres: 2.5,
    soil_data: {
      nitrogen: 45,
      phosphorus: 25,
      potassium: 22,
      pH: 6.8,
      moisture: 35,
      temperature_C: 28,
      humidity_percent: 65,
    },
  };

  it('generates recommendations with valid crop list and health report', () => {
    const response = generateScientificSoilRecommendation(basePayload);

    expect(response).toBeDefined();
    expect(response.recommended_crops).toBeInstanceOf(Array);
    expect(response.recommended_crops.length).toBeGreaterThan(0);
    expect(response.soil_health_report).toBeDefined();
    expect(response.confidence_level).toBeGreaterThanOrEqual(50);
    expect(response.confidence_level).toBeLessThanOrEqual(100);
  });

  it('ranks crops by suitability score in descending order', () => {
    const response = generateScientificSoilRecommendation(basePayload);
    const scores = response.recommended_crops.map((c) => c.suitability_score);

    for (let i = 0; i < scores.length - 1; i++) {
      expect(scores[i]).toBeGreaterThanOrEqual(scores[i + 1]);
    }
  });

  it('identifies acidic soil when pH < 6.0 and flags it in limiting factors', () => {
    const acidicPayload: SoilAnalysisPayload = {
      ...basePayload,
      soil_data: {
        ...basePayload.soil_data,
        pH: 5.2,
      },
    };

    const response = generateScientificSoilRecommendation(acidicPayload);
    const hasPhWarning = response.soil_health_report.limiting_factors.some(
      (factor) => factor.toLowerCase().includes('ph') || factor.toLowerCase().includes('acid')
    );

    expect(hasPhWarning).toBe(true);
    expect(response.soil_health_report.soil_amendment_recommendations.toLowerCase()).toContain('lime');
  });

  it('identifies alkaline soil when pH > 7.8 and recommends gypsum or organic matter', () => {
    const alkalinePayload: SoilAnalysisPayload = {
      ...basePayload,
      soil_data: {
        ...basePayload.soil_data,
        pH: 8.4,
      },
    };

    const response = generateScientificSoilRecommendation(alkalinePayload);
    const recs = response.soil_health_report.soil_amendment_recommendations.toLowerCase();
    expect(recs.includes('gypsum') || recs.includes('organic') || recs.includes('sulfur')).toBe(true);
  });

  it('flags severely depleted nitrogen and recommends basal urea application', () => {
    const lowNitrogenPayload: SoilAnalysisPayload = {
      ...basePayload,
      soil_data: {
        ...basePayload.soil_data,
        nitrogen: 8,
      },
    };

    const response = generateScientificSoilRecommendation(lowNitrogenPayload);
    const hasNWarning = response.soil_health_report.limiting_factors.some(
      (f) => f.toLowerCase().includes('nitrogen') || f.toLowerCase().includes('deficient')
    );

    expect(hasNWarning).toBe(true);
  });

  it('each recommended crop includes comprehensive growing guides', () => {
    const response = generateScientificSoilRecommendation(basePayload);
    const topCrop = response.recommended_crops[0];

    expect(topCrop.growing_guide).toBeDefined();
    expect(topCrop.growing_guide.fertilizer_npk_schedule_per_acre).toBeTruthy();
    expect(topCrop.growing_guide.irrigation_plan).toBeTruthy();
    expect(topCrop.growing_guide.pest_disease_management).toBeTruthy();
    expect(topCrop.growing_guide.sowing_details).toBeTruthy();
  });
});
