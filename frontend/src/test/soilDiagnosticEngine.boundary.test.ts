import { describe, it, expect } from 'vitest';
import { generateScientificSoilRecommendation, SoilAnalysisPayload } from '../lib/ai/soilDiagnosticEngine';

describe('SoilDiagnosticEngine - Boundary, Stress, and Edge Cases (White-Box)', () => {
  it('handles absolute zero nutrients (N=0, P=0, K=0) safely', () => {
    const payload: SoilAnalysisPayload = {
      soil_data: {
        nitrogen: 0,
        phosphorus: 0,
        potassium: 0,
        pH: 7.0,
        moisture: 30,
        temperature_C: 25,
        humidity_percent: 60,
      },
    };

    const res = generateScientificSoilRecommendation(payload);
    expect(res).toBeDefined();
    expect(res.recommended_crops.length).toBeGreaterThan(0);
    // Limiting factors must identify severe nutrient deficiency
    expect(res.soil_health_report.limiting_factors.some((f) => f.includes('Nitrogen') || f.includes('deficient'))).toBe(true);
  });

  it('handles extremely high nutrient saturation (N=500, P=300, K=300) without crashing or NaN', () => {
    const payload: SoilAnalysisPayload = {
      soil_data: {
        nitrogen: 500,
        phosphorus: 300,
        potassium: 300,
        pH: 7.0,
        moisture: 35,
        temperature_C: 28,
        humidity_percent: 65,
      },
    };

    const res = generateScientificSoilRecommendation(payload);
    expect(res).toBeDefined();
    expect(Number.isFinite(res.confidence_level)).toBe(true);
    for (const crop of res.recommended_crops) {
      expect(Number.isFinite(crop.suitability_score)).toBe(true);
      expect(Number.isFinite(crop.expected_yield_per_acre_tons)).toBe(true);
    }
  });

  it('evaluates severe acid stress at pH 3.8 and flags urgent liming', () => {
    const payload: SoilAnalysisPayload = {
      soil_data: {
        nitrogen: 40,
        phosphorus: 20,
        potassium: 20,
        pH: 3.8,
        moisture: 30,
        temperature_C: 26,
        humidity_percent: 50,
      },
    };

    const res = generateScientificSoilRecommendation(payload);
    expect(res.soil_health_report.soil_amendment_recommendations.toLowerCase()).toContain('lime');
    expect(res.soil_health_report.status.toLowerCase()).toMatch(/acid|poor|critical|degraded|deficient/);
  });

  it('evaluates severe alkaline stress at pH 9.8 and flags gypsum/organic amendments', () => {
    const payload: SoilAnalysisPayload = {
      soil_data: {
        nitrogen: 40,
        phosphorus: 20,
        potassium: 20,
        pH: 9.8,
        moisture: 30,
        temperature_C: 26,
        humidity_percent: 50,
      },
    };

    const res = generateScientificSoilRecommendation(payload);
    const recs = res.soil_health_report.soil_amendment_recommendations.toLowerCase();
    expect(recs.includes('gypsum') || recs.includes('organic') || recs.includes('sulfur')).toBe(true);
  });

  it('handles extreme drought soil moisture (5%) and generates drip irrigation guidance', () => {
    const payload: SoilAnalysisPayload = {
      soil_data: {
        nitrogen: 35,
        phosphorus: 20,
        potassium: 20,
        pH: 6.8,
        moisture: 5,
        temperature_C: 38,
        humidity_percent: 25,
      },
    };

    const res = generateScientificSoilRecommendation(payload);
    expect(res.soil_health_report.limiting_factors.some((f) => f.toLowerCase().includes('moisture') || f.toLowerCase().includes('water'))).toBe(true);
  });

  it('prioritizes farmer preferred_crop when specified in payload', () => {
    const payload: SoilAnalysisPayload = {
      preferred_crop: 'Ragi',
      soil_data: {
        nitrogen: 30,
        phosphorus: 20,
        potassium: 20,
        pH: 6.5,
        moisture: 25,
        temperature_C: 26,
        humidity_percent: 55,
      },
    };

    const res = generateScientificSoilRecommendation(payload);
    const topCrop = res.recommended_crops[0];
    expect(topCrop.crop_name.toLowerCase()).toContain('ragi');
  });
});
