import { describe, it, expect } from 'vitest';
import { mapToCropCard, mapToCropDetail } from '../hooks/useCropGuides';

describe('useCropGuides - White-Box DTO Mapping & Agronomic Formulas', () => {
  it('mapToCropCard calculates capital and return boundaries with scaling factors', () => {
    const dto = {
      id: 101,
      name: 'Finger Millet (Ragi)',
      slug: 'ragi',
      investmentPerAcre: 10000,
      expectedReturns: 30000,
      durationDays: 120,
      nutrient: { nitrogenKg: 40, phosphorusKg: 20, potassiumKg: 20 },
      aiScore: { profitabilityScore: 85 },
    };

    const card = mapToCropCard(dto);

    expect(card.id).toBe('101');
    expect(card.nameEnglish).toBe('Finger Millet (Ragi)');
    expect(card.capitalMin).toBe(10000);
    // capitalMax = round(10000 * 1.3) = 13000
    expect(card.capitalMax).toBe(13000);
    expect(card.returnsMin).toBe(30000);
    // returnsMax = round(30000 * 1.4) = 42000
    expect(card.returnsMax).toBe(42000);
    expect(card.nKgAcre).toBe(40);
    expect(card.pKgAcre).toBe(20);
    expect(card.kKgAcre).toBe(20);
    expect(card.aiScore).toBe(85);
  });

  it('mapToCropCard converts per-hectare NPK from raw dataset to per-acre', () => {
    const rawDto = {
      name: 'Test Crop',
      rawJson: JSON.stringify({
        duration_days: '90-105 days',
        npk_requirement_kg_per_ha: { N: 120, P: 60, K: 60 },
      }),
    };

    const card = mapToCropCard(rawDto);
    // 120 / 2.471 =~ 48.56 -> round to 49
    expect(card.nKgAcre).toBe(Math.round(120 / 2.471));
    expect(card.pKgAcre).toBe(Math.round(60 / 2.471));
    expect(card.kKgAcre).toBe(Math.round(60 / 2.471));
    expect(card.durationDays).toBe(90105); // extracted digits
  });

  it('mapToCropDetail parses pH boundaries and handles missing values gracefully', () => {
    const dto = {
      name: 'Exotic Dragonfruit',
      slug: 'exotic-dragonfruit',
      soilRequirement: { phRange: '6.5–8.0' },
    };

    const detail = mapToCropDetail(dto);
    expect(detail.soil.ph_min).toBe(6.5);
    expect(detail.soil.ph_max).toBe(8.0);
  });

  it('mapToCropDetail attaches canonical pest and disease guidance for rice-paddy', () => {
    const dto = {
      name: 'Rice (Paddy)',
      slug: 'rice-paddy',
    };

    const detail = mapToCropDetail(dto);
    expect(detail.pestDisease).toBeDefined();
    expect(detail.overview).toBeDefined();
    expect(detail.soil.land_prep_steps).toBeDefined();
  });
});
