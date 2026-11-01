import { useState, useEffect } from 'react';

export type LandUnit = 'Acre' | 'Hectare' | 'Bigha' | 'Gunta';
export type WeightUnit = 'Quintal' | 'Kg' | 'Tonne';

export const LAND_UNIT_LABELS: Record<LandUnit, { en: string; kn: string; symbol: string }> = {
  'Acre': { en: 'Acre', kn: 'ಎಕರೆ', symbol: 'ac' },
  'Hectare': { en: 'Hectare', kn: 'ಹೆಕ್ಟೇರ್', symbol: 'ha' },
  'Bigha': { en: 'Bigha', kn: 'ಬಿಘಾ', symbol: 'bigha' },
  'Gunta': { en: 'Gunta', kn: 'ಗುಂಟೆ', symbol: 'gunta' },
};

export const WEIGHT_UNIT_LABELS: Record<WeightUnit, { en: string; kn: string; symbol: string }> = {
  'Quintal': { en: 'Quintal', kn: 'ಕ್ವಿಂಟಾಲ್', symbol: 'q' },
  'Kg': { en: 'Kilogram', kn: 'ಕಿಲೋಗ್ರಾಂ', symbol: 'kg' },
  'Tonne': { en: 'Metric Tonne', kn: 'ಮೆಟ್ರಿಕ್ ಟನ್', symbol: 't' },
};

/**
 * Standard Karnataka & Indian agricultural conversion ratios relative to 1 Acre
 * - 1 Acre = 40 Gunta (exact legal standard: 1 gunta = 1,089 sq ft, 1 acre = 43,560 sq ft)
 * - 1 Acre = 0.404686 Hectare (1 Hectare = 2.47105 Acres)
 * - 1 Acre = 1.6 Bigha (Karnataka revenue standard)
 */
export const ACRE_TO_LAND_UNIT: Record<LandUnit, number> = {
  'Acre': 1,
  'Gunta': 40,
  'Hectare': 0.404686,
  'Bigha': 1.6,
};

/**
 * Conversion ratios relative to 1 Hectare for application rates (e.g., kg/ha)
 * - 1 Hectare = 2.47105 Acres = 98.842 Guntas = 3.95368 Bighas
 */
export const HECTARE_TO_LAND_UNIT: Record<LandUnit, number> = {
  'Hectare': 1,
  'Acre': 2.47105,
  'Gunta': 98.842,
  'Bigha': 3.95368,
};

/**
 * Convert an area in Acres to target land unit
 */
export function convertArea(
  acres: number,
  targetUnit: LandUnit
): { value: number; unit: string; formatted: string } {
  if (isNaN(acres) || acres === null || acres === undefined) {
    return { value: 0, unit: targetUnit, formatted: '0' };
  }

  const factor = ACRE_TO_LAND_UNIT[targetUnit] || 1;
  const rawValue = acres * factor;
  
  // Format cleanly: integer if whole number, otherwise up to 2 decimal places
  const value = Math.round(rawValue * 100) / 100;
  const formatted = value % 1 === 0 ? value.toString() : value.toFixed(2);

  return {
    value,
    unit: targetUnit,
    formatted: `${formatted} ${targetUnit}${value !== 1 && targetUnit !== 'Bigha' ? 's' : ''}`,
  };
}

/**
 * Convert standard fertilizer rate from kg/ha to target land unit
 * Example: 30 kg/ha -> 12.1 kg/acre -> 0.3 kg/gunta
 */
export function convertDosage(
  kgPerHa: number,
  targetUnit: LandUnit
): { value: number; unitLabel: string; formattedValue: string } {
  if (!kgPerHa || kgPerHa === 0) {
    return {
      value: 0,
      unitLabel: targetUnit === 'Hectare' ? 'kg/ha' : targetUnit === 'Acre' ? 'kg/acre' : `kg/${targetUnit.toLowerCase()}`,
      formattedValue: '0',
    };
  }

  const divider = HECTARE_TO_LAND_UNIT[targetUnit] || 1;
  const rawValue = kgPerHa / divider;
  
  // High precision for small units like gunta
  const value = targetUnit === 'Gunta' 
    ? Math.round(rawValue * 10) / 10 
    : Math.round(rawValue * 10) / 10;

  const unitLabel = targetUnit === 'Hectare' ? 'kg/ha' : targetUnit === 'Acre' ? 'kg/acre' : `kg/${targetUnit.toLowerCase()}`;
  const formattedValue = value % 1 === 0 ? value.toString() : value.toFixed(1);

  return { value, unitLabel, formattedValue };
}

/**
 * Convert APMC price per quintal (₹/quintal) to target weight unit
 * - Quintal: ₹P / quintal
 * - Kg: ₹(P / 100) / kg
 * - Tonne: ₹(P * 10) / tonne
 */
export function convertPricePerWeight(
  pricePerQuintal: number,
  targetUnit: WeightUnit
): { price: number; value: number; unitLabel: string; formatted: string } {
  if (isNaN(pricePerQuintal) || pricePerQuintal === null || pricePerQuintal === undefined || pricePerQuintal <= 0) {
    return { price: 0, value: 0, unitLabel: '/quintal', formatted: '₹0' };
  }

  let price: number;
  let unitLabel: string;

  switch (targetUnit) {
    case 'Kg':
      // 1 quintal = 100 kg
      price = Math.round((pricePerQuintal / 100) * 10) / 10;
      unitLabel = '/kg';
      break;
    case 'Tonne':
      // 1 tonne = 10 quintals
      price = Math.round(pricePerQuintal * 10);
      unitLabel = '/tonne';
      break;
    case 'Quintal':
    default:
      price = pricePerQuintal;
      unitLabel = '/quintal';
      break;
  }

  const formatted = `₹${price.toLocaleString('en-IN')}`;
  return { price, value: price, unitLabel, formatted };
}

/**
 * Hook to access and reactively observe user's unit settings
 */
export function useUnits(): { landUnit: LandUnit; weightUnit: WeightUnit } {
  const getStoredUnits = (): { landUnit: LandUnit; weightUnit: WeightUnit } => {
    try {
      const explicitLand = localStorage.getItem('agri_compass_land_unit') as LandUnit;
      const explicitWeight = localStorage.getItem('agri_compass_weight_unit') as WeightUnit;
      
      const saved = localStorage.getItem('agri_compass_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          landUnit: explicitLand || parsed.landUnit || 'Acre',
          weightUnit: explicitWeight || parsed.weightUnit || 'Quintal',
        };
      }
      return {
        landUnit: explicitLand || 'Acre',
        weightUnit: explicitWeight || 'Quintal',
      };
    } catch {
      return { landUnit: 'Acre', weightUnit: 'Quintal' };
    }
  };

  const [units, setUnits] = useState(getStoredUnits);

  useEffect(() => {
    const handleUpdate = () => {
      setUnits(getStoredUnits());
    };

    window.addEventListener('storage', handleUpdate);
    window.addEventListener('agri_compass_settings_updated', handleUpdate);

    return () => {
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('agri_compass_settings_updated', handleUpdate);
    };
  }, []);

  return units;
}
