import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CropRecommender } from '../lib/ai/cropRecommender';

describe('CropRecommender - Algorithmic and Decision Logic Tests', () => {
  let recommender: CropRecommender;

  beforeEach(() => {
    recommender = new CropRecommender();
  });

  it('loads Karnataka districts successfully from fallback dataset', async () => {
    // In node/test environment, fetch('/districts.csv') fails, so fallback is exercised
    const districts = await recommender.getDistricts();

    expect(districts).toBeInstanceOf(Array);
    expect(districts.length).toBeGreaterThan(0);
    expect(districts).toContain('Mysuru');
    expect(districts).toContain('Mandya');
    expect(districts).toContain('Hassan');
  });

  it('provides tailored crop recommendations for Mandya (Sugarcane, Rice, Ragi)', async () => {
    const recs = await recommender.getRecommendations('Mandya');

    expect(recs.length).toBeGreaterThan(0);
    const cropNames = recs.map((r) => r.cropName);
    expect(cropNames).toContain('Sugarcane');
    expect(cropNames).toContain('Rice');
    expect(cropNames).toContain('Ragi');

    // Each recommendation has reason mentioning soil and climate
    const sugarcaneRec = recs.find((r) => r.cropName === 'Sugarcane');
    expect(sugarcaneRec?.reason).toContain('Alluvial');
    expect(sugarcaneRec?.season).toBe('Year-round');
    expect(sugarcaneRec?.expectedYield).toContain('tons/acre');
  });

  it('provides tailored crop recommendations for Hassan (Coffee, Rice, Pepper)', async () => {
    const recs = await recommender.getRecommendations('Hassan');

    const cropNames = recs.map((r) => r.cropName);
    expect(cropNames).toContain('Coffee');
    const coffee = recs.find((r) => r.cropName === 'Coffee');
    expect(coffee?.expectedYield).toBe('500-800 kg/acre');
  });

  it('calculates higher expected yield for Rice in heavy rainfall districts (>1000mm)', async () => {
    // Hassan has 1200mm rainfall
    const hassanRecs = await recommender.getRecommendations('Hassan');
    const hassanRice = hassanRecs.find((r) => r.cropName === 'Rice');
    expect(hassanRice?.expectedYield).toBe('4-5 tons/acre');

    // Mysuru has 850mm rainfall (<= 1000mm)
    const mysuruRecs = await recommender.getRecommendations('Mysuru');
    const mysuruRice = mysuruRecs.find((r) => r.cropName === 'Rice');
    expect(mysuruRice?.expectedYield).toBe('3-4 tons/acre');
  });

  it('safely handles unknown or invalid district names by returning sensible default recommendation', async () => {
    const defaultRecs = await recommender.getRecommendations('Atlantis');

    expect(defaultRecs).toHaveLength(1);
    expect(defaultRecs[0].cropName).toBe('Rice');
    expect(defaultRecs[0].reason).toContain('Default recommendation for Karnataka');
  });
});
