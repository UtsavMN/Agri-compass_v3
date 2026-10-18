import { describe, it, expect } from 'vitest';
import { GOVERNMENT_SCHEMES, Scheme } from '../data/schemesData';
import { BANK_SCHEMES, BankScheme } from '../data/bankSchemes';

describe('Government & Bank Schemes Master Data Integrity Tests', () => {
  it('contains valid and unique IDs across all government schemes', () => {
    expect(GOVERNMENT_SCHEMES.length).toBeGreaterThanOrEqual(15);

    const ids = new Set<string>();
    GOVERNMENT_SCHEMES.forEach((scheme: Scheme) => {
      expect(scheme.id).toBeTruthy();
      expect(ids.has(scheme.id)).toBe(false); // No duplicate IDs
      ids.add(scheme.id);

      expect(scheme.name).toBeTruthy();
      expect(scheme.fullName).toBeTruthy();
      expect(['National', 'Karnataka']).toContain(scheme.level);
      expect(scheme.category).toBeTruthy();
      expect(scheme.eligibility).toBeTruthy();
      expect(scheme.applyUrl).toMatch(/^https?:\/\//);
      expect(Array.isArray(scheme.tags)).toBe(true);
      expect(scheme.tags.length).toBeGreaterThan(0);
    });
  });

  it('contains valid and unique IDs across all bank agricultural schemes', () => {
    expect(BANK_SCHEMES.length).toBeGreaterThanOrEqual(8);

    const ids = new Set<string>();
    BANK_SCHEMES.forEach((scheme: BankScheme) => {
      expect(scheme.id).toBeTruthy();
      expect(ids.has(scheme.id)).toBe(false);
      ids.add(scheme.id);

      expect(scheme.bank).toBeTruthy();
      expect(scheme.schemeName).toBeTruthy();
      expect(scheme.interestRate).toBeTruthy();
      expect(scheme.eligibility).toBeTruthy();
      expect(scheme.documents.length).toBeGreaterThan(0);
      expect(scheme.applyUrl).toMatch(/^https?:\/\//);
    });
  });

  it('filters schemes by geographic level accurately (National vs Karnataka)', () => {
    const national = GOVERNMENT_SCHEMES.filter((s) => s.level === 'National');
    const karnataka = GOVERNMENT_SCHEMES.filter((s) => s.level === 'Karnataka');

    expect(national.length).toBeGreaterThan(5);
    expect(karnataka.length).toBeGreaterThan(5);
    expect(national.length + karnataka.length).toBe(GOVERNMENT_SCHEMES.length);

    expect(national.some((s) => s.id === 'pm-kisan')).toBe(true);
    expect(karnataka.some((s) => s.name.toLowerCase().includes('raitha') || s.name.toLowerCase().includes('karnataka') || s.level === 'Karnataka')).toBe(true);
  });

  it('filters schemes by keyword search across title, eligibility and benefits', () => {
    const searchSchemes = (query: string) => {
      const q = query.toLowerCase();
      return GOVERNMENT_SCHEMES.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.fullName.toLowerCase().includes(q) ||
          s.eligibility.toLowerCase().includes(q) ||
          s.benefit.toLowerCase().includes(q) ||
          s.tags.some((t) => t.toLowerCase().includes(q))
      );
    };

    const solarSchemes = searchSchemes('solar');
    expect(solarSchemes.length).toBeGreaterThan(0);
    expect(solarSchemes.some((s) => s.id === 'pm-kusum')).toBe(true);

    const insuranceSchemes = searchSchemes('insurance');
    expect(insuranceSchemes.length).toBeGreaterThan(0);
    expect(insuranceSchemes.some((s) => s.id === 'pmfby')).toBe(true);
  });
});
