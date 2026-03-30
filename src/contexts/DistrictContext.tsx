import React, { createContext, useContext, useEffect, useState } from 'react';

type DistrictContextType = {
  selectedDistrict: string;
  setSelectedDistrict: (district: string) => void;
  clearDistrict: () => void;
};

const DistrictContext = createContext<DistrictContextType | undefined>(undefined);
const DISTRICT_STORAGE_KEY = 'agri-compass-selected-district';

export function DistrictProvider({ children }: { children: React.ReactNode }) {
  const [selectedDistrict, setSelectedDistrictState] = useState<string>(() => {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem(DISTRICT_STORAGE_KEY) ?? '';
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (selectedDistrict) {
      localStorage.setItem(DISTRICT_STORAGE_KEY, selectedDistrict);
    } else {
      localStorage.removeItem(DISTRICT_STORAGE_KEY);
    }
  }, [selectedDistrict]);

  const setSelectedDistrict = (district: string) => {
    setSelectedDistrictState(district);
  };

  const clearDistrict = () => {
    setSelectedDistrictState('');
  };

  return (
    <DistrictContext.Provider value={{ selectedDistrict, setSelectedDistrict, clearDistrict }}>
      {children}
    </DistrictContext.Provider>
  );
}

export function useDistrictContext() {
  const context = useContext(DistrictContext);
  if (!context) {
    throw new Error('useDistrictContext must be used within a DistrictProvider');
  }
  return context;
}
