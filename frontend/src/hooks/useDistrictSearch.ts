/**
 * useDistrictSearch Hook
 * Provides fuzzy search functionality for Karnataka districts
 * Uses Fuse.js for fast, lightweight fuzzy searching
 */

import { useState, useMemo, useCallback } from 'react';
import Fuse from 'fuse.js';

export interface DistrictData {
  district: string;
  recommended_crops: string;
  soil_type: string;
  avg_rainfall: string;
  weather_pattern: string;
}

interface UseDistrictSearchOptions {
  threshold?: number; // 0.0 = exact match, 1.0 = match anything
  keys?: string[];
  limit?: number;
  initialDistrict?: string;
}

export function useDistrictSearch(
  districts: DistrictData[],
  options: UseDistrictSearchOptions = {}
) {
  const {
    threshold = 0.3, // Good balance for fuzzy matching
    keys = ['district', 'recommended_crops', 'soil_type'],
    limit = 10,
    initialDistrict = '',
  } = options;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>(initialDistrict);
  const [isOpen, setIsOpen] = useState(false);

  // Configure Fuse.js
  const fuse = useMemo(() => {
    return new Fuse(districts, {
      keys,
      threshold,
      includeScore: true,
      minMatchCharLength: 1,
      shouldSort: true,
      findAllMatches: false,
    });
  }, [districts, threshold, keys]);

  // Perform fuzzy search
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) {
      return districts.slice(0, limit);
    }

    const results = fuse.search(searchQuery);
    return results.slice(0, limit).map(result => result.item);
  }, [searchQuery, fuse, districts, limit]);

  // Get all district names
  const districtNames = useMemo(() => {
    return districts.map(d => d.district).sort();
  }, [districts]);

  // Get selected district data
  const selectedDistrictData = useMemo(() => {
    return districts.find(d => d.district === selectedDistrict) || null;
  }, [selectedDistrict, districts]);

  // Handle search input change
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    setIsOpen(true);
  }, []);

  // Handle district selection
  const handleSelectDistrict = useCallback((district: string) => {
    setSelectedDistrict(district);
    setSearchQuery('');
    setIsOpen(false);
  }, []);

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setSelectedDistrict('');
  }, []);

  // Reset to initial
  const reset = useCallback(() => {
    setSearchQuery('');
    setSelectedDistrict(initialDistrict);
    setIsOpen(false);
  }, [initialDistrict]);

  return {
    // State
    searchQuery,
    selectedDistrict,
    selectedDistrictData,
    isOpen,
    
    // Data
    searchResults,
    districtNames,
    allDistricts: districts,
    
    // Handlers
    setSearchQuery: handleSearchChange,
    setSelectedDistrict: handleSelectDistrict,
    setIsOpen,
    clearSearch,
    reset,
  };
}

import Papa from 'papaparse';

/**
 * Load districts from CSV file
 */
export async function loadDistrictsFromCSV(csvPath: string = '/districts.csv'): Promise<DistrictData[]> {
  try {
    const response = await fetch(csvPath);
    const csvText = await response.text();
    
    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          resolve(results.data as DistrictData[]);
        },
        error: (error: any) => {
          console.error('Error parsing CSV:', error);
          reject(error);
        }
      });
    });
  } catch (error) {
    console.error('Error loading districts:', error);
    return [];
  }
}

/**
 * Parse CSV data directly
 */
export function parseDistrictCSV(csvContent: string): DistrictData[] {
  try {
    const results = Papa.parse(csvContent, {
      header: true,
      skipEmptyLines: true
    });
    return results.data as DistrictData[];
  } catch (error) {
    console.error('Error parsing CSV:', error);
    return [];
  }
}
