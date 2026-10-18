import { describe, it, expect } from 'vitest';
import { WeatherAdvisor, findNearestDistrict } from '../lib/ai/weatherAdvisor';

describe('WeatherAdvisor - White-Box, Algorithmic & Boundary Tests', () => {
  // Test private static evaluateSprayingCondition via reflection or direct logic test
  // Since evaluateSprayingCondition is private, we can access it using WeatherAdvisor as any
  const evaluateSpraying = (WeatherAdvisor as any).evaluateSprayingCondition;
  const degreesToCardinal = (WeatherAdvisor as any).degreesToCardinal;
  const wmoToDesc = (WeatherAdvisor as any).wmoCodeToDescription;

  describe('Chemical Spraying Condition Boundary Testing (White-Box)', () => {
    it('returns Unfavorable when precipitation probability > 50%', () => {
      const res51 = evaluateSpraying(10, 51, 0);
      expect(res51.suitability).toBe('Unfavorable');
      expect(res51.reason).toContain('Wash-off hazard');

      const res100 = evaluateSpraying(5, 100, 2);
      expect(res100.suitability).toBe('Unfavorable');
    });

    it('returns Unfavorable when precipitation > 4mm regardless of probability', () => {
      const res4_1 = evaluateSpraying(5, 10, 4.1);
      expect(res4_1.suitability).toBe('Unfavorable');
      expect(res4_1.reason).toContain('Wash-off hazard');
    });

    it('boundary check on precipitation mm: 4.0mm vs 4.1mm', () => {
      const res4_0 = evaluateSpraying(10, 20, 4.0);
      expect(res4_0.suitability).not.toBe('Unfavorable');

      const res4_1 = evaluateSpraying(10, 20, 4.1);
      expect(res4_1.suitability).toBe('Unfavorable');
    });

    it('returns Unfavorable when wind speed > 20 km/h', () => {
      const res21 = evaluateSpraying(21, 10, 0);
      expect(res21.suitability).toBe('Unfavorable');
      expect(res21.reason).toContain('Severe wind drift hazard');
    });

    it('boundary check on wind speed: 19.9 vs 20.0 vs 20.1 km/h', () => {
      const res19_9 = evaluateSpraying(19.9, 10, 0);
      expect(res19_9.suitability).toBe('Caution');

      const res20_0 = evaluateSpraying(20.0, 10, 0);
      expect(res20_0.suitability).toBe('Caution');

      const res20_1 = evaluateSpraying(20.1, 10, 0);
      expect(res20_1.suitability).toBe('Unfavorable');
    });

    it('returns Caution when wind is between 13 and 20 km/h', () => {
      const res15 = evaluateSpraying(15, 10, 0);
      expect(res15.suitability).toBe('Caution');
      expect(res15.reason).toContain('Moderate drift risk');
    });

    it('returns Caution when rain probability is between 25% and 50%', () => {
      const res30 = evaluateSpraying(10, 30, 0);
      expect(res30.suitability).toBe('Caution');
    });

    it('boundary check on rain probability: 24.9% vs 25.0% vs 25.1%', () => {
      const res24_9 = evaluateSpraying(10, 24.9, 0);
      expect(res24_9.suitability).toBe('Favorable');

      const res25_0 = evaluateSpraying(10, 25.0, 0);
      expect(res25_0.suitability).toBe('Favorable');

      const res25_1 = evaluateSpraying(10, 25.1, 0);
      expect(res25_1.suitability).toBe('Caution');
    });

    it('returns Favorable for ideal calm spraying conditions (wind <= 13 km/h and rain prob <= 25%)', () => {
      const res = evaluateSpraying(8, 10, 0);
      expect(res.suitability).toBe('Favorable');
      expect(res.reason).toContain('Optimal window');
    });
  });

  describe('Compass Degrees to Cardinal Direction Algorithm', () => {
    it('accurately resolves North around 0 and 360 degrees', () => {
      expect(degreesToCardinal(0)).toBe('N');
      expect(degreesToCardinal(360)).toBe('N');
      expect(degreesToCardinal(10)).toBe('N');
      expect(degreesToCardinal(355)).toBe('N');
    });

    it('accurately maps key compass points', () => {
      expect(degreesToCardinal(90)).toBe('E');
      expect(degreesToCardinal(180)).toBe('S');
      expect(degreesToCardinal(270)).toBe('W');
      expect(degreesToCardinal(45)).toBe('NE');
      expect(degreesToCardinal(135)).toBe('SE');
      expect(degreesToCardinal(225)).toBe('SW');
      expect(degreesToCardinal(315)).toBe('NW');
    });

    it('handles overflow angles correctly (> 360)', () => {
      expect(degreesToCardinal(450)).toBe('E'); // 450 % 360 = 90
      expect(degreesToCardinal(720)).toBe('N'); // 720 % 360 = 0
    });
  });

  describe('WMO Weather Code Description Mapping', () => {
    it('maps standard clear, overcast, and fog codes', () => {
      expect(wmoToDesc(0)).toBe('Clear Sky');
      expect(wmoToDesc(1)).toBe('Mainly Clear');
      expect(wmoToDesc(2)).toBe('Partly Cloudy');
      expect(wmoToDesc(3)).toBe('Overcast');
      expect(wmoToDesc(45)).toBe('Foggy');
    });

    it('maps rain and thunderstorm codes', () => {
      expect(wmoToDesc(61)).toBe('Slight Rain');
      expect(wmoToDesc(63)).toBe('Moderate Rain');
      expect(wmoToDesc(65)).toBe('Heavy Rain');
      expect(wmoToDesc(95)).toBe('Thunderstorm');
      expect(wmoToDesc(99)).toBe('Severe Thunderstorm with Hail');
    });

    it('falls back to Clear Sky for unrecognized codes', () => {
      expect(wmoToDesc(9999)).toBe('Clear Sky');
    });
  });

  describe('Haversine Geolocation Algorithm (findNearestDistrict)', () => {
    it('locates Bengaluru Urban correctly for coordinates near Bengaluru', () => {
      const nearest = findNearestDistrict(12.9716, 77.5946);
      expect(nearest.district).toBe('Bengaluru Urban');
    });

    it('locates Mysuru for coordinates near Mysuru palace', () => {
      const nearest = findNearestDistrict(12.3051, 76.6551);
      expect(nearest.district).toBe('Mysuru');
    });

    it('locates Mandya for coordinates in Mandya district', () => {
      const nearest = findNearestDistrict(12.5222, 76.8976);
      expect(nearest.district).toBe('Mandya');
    });

    it('locates Belagavi for North Karnataka coordinates', () => {
      const nearest = findNearestDistrict(15.8497, 74.4977);
      expect(nearest.district).toBe('Belagavi');
    });

    it('locates Dakshina Kannada for coastal Mangaluru coordinates', () => {
      const nearest = findNearestDistrict(12.9141, 74.8560);
      expect(nearest.district).toBe('Dakshina Kannada');
    });
  });
});
