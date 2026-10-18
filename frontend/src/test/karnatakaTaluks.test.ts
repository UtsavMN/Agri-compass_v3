import { describe, it, expect } from 'vitest';
import {
  findNearestTaluk,
  getTaluksByDistrict,
  searchTaluks,
  KARNATAKA_TALUKS,
} from '../data/karnatakaTaluks';

describe('Karnataka Taluks Geo-Spatial & Search Algorithm Tests', () => {
  it('contains valid coordinate boundaries for all Karnataka taluks', () => {
    expect(KARNATAKA_TALUKS.length).toBeGreaterThan(150);

    KARNATAKA_TALUKS.forEach((taluk) => {
      expect(taluk.district).toBeTruthy();
      expect(taluk.name).toBeTruthy();
      // Latitude in Karnataka: ~11.5°N to ~18.5°N
      expect(taluk.lat).toBeGreaterThan(11.0);
      expect(taluk.lat).toBeLessThan(19.0);
      // Longitude in Karnataka: ~74.0°E to ~78.6°E
      expect(taluk.lon).toBeGreaterThan(73.5);
      expect(taluk.lon).toBeLessThan(79.0);
    });
  });

  it('finds nearest taluk using Haversine formula accurately', () => {
    // Coords near Dharwad (15.4589, 75.0078)
    const nearestDharwad = findNearestTaluk(15.46, 75.01);
    expect(nearestDharwad.taluk.name.toLowerCase()).toContain('dharwad');
    expect(nearestDharwad.taluk.district.toLowerCase()).toContain('dharwad');
    expect(nearestDharwad.isOutlier).toBe(false);

    // Coords near Mysuru (12.2958, 76.6394)
    const nearestMysuru = findNearestTaluk(12.30, 76.64);
    expect(nearestMysuru.taluk.district.toLowerCase()).toBe('mysuru');

    // Coords near Mangaluru (Dakshina Kannada) (12.9141, 74.8560)
    const nearestMangaluru = findNearestTaluk(12.91, 74.85);
    expect(nearestMangaluru.taluk.district.toLowerCase()).toContain('kannada');
  });

  it('filters taluks by district name with case insensitivity', () => {
    const dharwadTaluks = getTaluksByDistrict('Dharwad');
    expect(dharwadTaluks.length).toBeGreaterThan(0);
    dharwadTaluks.forEach((t) => expect(t.district.toLowerCase()).toBe('dharwad'));

    const lowercase = getTaluksByDistrict('dharwad');
    expect(lowercase.length).toBe(dharwadTaluks.length);

    // Non-existent district returns empty array without throwing
    const nonExistent = getTaluksByDistrict('InvalidDistrictName');
    expect(nonExistent).toEqual([]);
  });

  it('searches taluks by query string matching name or district', () => {
    const results = searchTaluks('Hubballi');
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((r) => r.name.toLowerCase().includes('hubb'))).toBe(true);

    const emptyResults = searchTaluks('xyznonexistentquery999');
    expect(emptyResults).toEqual([]);
  });
});
