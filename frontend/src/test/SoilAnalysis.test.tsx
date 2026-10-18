import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { SoilAnalysisContent } from '../pages/SoilAnalysis';
import * as httpClient from '../lib/httpClient';

vi.mock('../lib/httpClient', () => ({
  apiGet: vi.fn(),
  apiPost: vi.fn(),
}));

// Mock hooks
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

describe('SoilAnalysisContent - Integration and Regression Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders Soil Diagnostic engine inputs and initial values', () => {
    vi.mocked(httpClient.apiGet).mockResolvedValue([]);

    render(<SoilAnalysisContent />);

    expect(screen.getByText(/AgriSense AI™ Soil Diagnostic/i)).toBeInTheDocument();
    expect(screen.getByText(/Select Target Farm/i)).toBeInTheDocument();
  });

  it('safely handles opening diagnostics history without throwing on invalid AI reports', async () => {
    vi.mocked(httpClient.apiGet).mockImplementation(async (url: string) => {
      if (url === '/api/farms') {
        return [
          {
            id: 'farm-mandya-1',
            name: 'Mandya Sugarcane Plot',
            area_acres: 4,
            current_crop: 'Sugarcane',
            soil_type: 'Clay Loam',
            irrigation_type: 'Canal',
          },
        ];
      }
      if (url.includes('/api/farms/farm-mandya-1/diagnostics')) {
        return [
          {
            id: 'diag-99',
            createdAt: '2026-10-17T12:00:00Z',
            healthStatus: 'Balanced',
            nitrogen: 45,
            phosphorus: 25,
            potassium: 20,
            ph: 6.8,
            aiReport: 'Direct text report without JSON wrapping', // Tests safe parser
          },
        ];
      }
      return [];
    });

    render(<SoilAnalysisContent />);

    // Select the farm from the dropdown
    await waitFor(() => {
      const select = screen.getByRole('combobox');
      expect(select).toBeInTheDocument();
      fireEvent.change(select, { target: { value: 'farm-mandya-1' } });
    });

    // History button should appear
    await waitFor(() => {
      const historyBtn = screen.getByRole('button', { name: /History/i });
      expect(historyBtn).toBeInTheDocument();
      fireEvent.click(historyBtn);
    });

    // History modal should open and display the diagnosis without crashing
    await waitFor(() => {
      expect(screen.getByText('Soil Diagnostics History')).toBeInTheDocument();
      expect(screen.getByText('Balanced')).toBeInTheDocument();
      expect(screen.getByText('Direct text report without JSON wrapping')).toBeInTheDocument();
    });

    // Close button with X icon
    const closeBtn = screen.getByRole('button', { name: /Close/i });
    fireEvent.click(closeBtn);

    await waitFor(() => {
      expect(screen.queryByText('Soil Diagnostics History')).not.toBeInTheDocument();
    });
  });

  it('correctly runs diagnostics for fallow farm (crop yet to be grown) and renders recommended crop guides', async () => {
    vi.mocked(httpClient.apiGet).mockImplementation(async (url: string) => {
      if (url === '/api/farms') {
        return [
          {
            id: 'farm-fallow-1',
            name: 'Dakshina Fallow Land',
            location: 'Dakshina Kannada',
            area_acres: 5,
            current_crop: null, // Fallow
            soil_type: 'Laterite',
            irrigation_type: 'Borewell / Canal',
          },
        ];
      }
      return [];
    });

    vi.mocked(httpClient.apiPost).mockImplementation(async (url: string) => {
      if (url === '/api/ai/soil-recommendation') {
        // Return response without mode to verify robustness against legacy backend responses
        return {
          recommended_crops: [
            {
              crop_name: 'Paddy (Rice)',
              suitability_score: 92,
              expected_yield_per_acre_tons: 2.9,
              growing_guide: {
                sowing_details: 'Seed rate: 20-25 kg/acre. Spacing: 20cm x 15cm.',
                fertilizer_npk_schedule_per_acre: 'Basal: 50 kg DAP + 35 kg MOP/acre.\nTop Dressing: 35 kg Urea/acre.',
                irrigation_plan: 'Maintain 2-4 cm water layer.',
                pest_disease_management: 'Watch for Blast and Stem Borer.',
                harvesting_tips: 'Harvest when 85% grains turn golden yellow.',
              },
            },
          ],
          soil_health_report: {
            status: 'Excellent',
            limiting_factors: ['Soil nutrient balance is optimal.'],
            soil_amendment_recommendations: 'Apply 2-3 tons FYM/acre.',
          },
          warnings: [],
          confidence_level: 95,
        };
      }
      return { success: true };
    });

    render(<SoilAnalysisContent />);

    // Wait for farm to load
    await waitFor(() => {
      expect(screen.getByText(/Crop is yet to be grown in this field/i)).toBeInTheDocument();
    });

    // Run Diagnostic AI
    const runBtn = screen.getByRole('button', { name: /RUN DIAGNOSTIC AI/i });
    fireEvent.click(runBtn);

    // Should display Field Status: Crop Yet to be Grown
    await waitFor(() => {
      expect(screen.getByText(/Crop Yet to be Grown \(Fallow Field\)/i)).toBeInTheDocument();
      expect(screen.getByText(/Recommended Crop Guides \(To Plant\)/i)).toBeInTheDocument();
      // Should show the crop card with match %
      expect(screen.getByText('Paddy (Rice)')).toBeInTheDocument();
      expect(screen.getByText(/92% Match/i)).toBeInTheDocument();
      // Should show growing protocol
      expect(screen.getByText(/Paddy \(Rice\) Growing Protocol/i)).toBeInTheDocument();
      expect(screen.getByText(/Sowing & Field Soil Preparation/i)).toBeInTheDocument();
    }, { timeout: 4000 });
  });

  it('correctly runs diagnostics for cultivated farm and renders active crop optimization in units', async () => {
    vi.mocked(httpClient.apiGet).mockImplementation(async (url: string) => {
      if (url === '/api/farms') {
        return [
          {
            id: 'farm-sugarcane-1',
            name: 'Mandya Sugarcane Plot',
            location: 'Mandya',
            area_acres: 4,
            current_crop: 'Sugarcane',
            soil_type: 'Clay Loam',
            irrigation_type: 'Canal',
          },
        ];
      }
      return [];
    });

    vi.mocked(httpClient.apiPost).mockImplementation(async (url: string) => {
      if (url === '/api/ai/soil-recommendation') {
        // Return without mode to verify frontend guarantees active_crop_optimization
        return {
          recommended_crops: [],
          soil_health_report: {
            status: 'Good',
            limiting_factors: ['Moderate nitrogen deficit.'],
            soil_amendment_recommendations: 'Apply 2 tons FYM/acre.',
          },
          warnings: [],
          confidence_level: 94,
        };
      }
      return { success: true };
    });

    render(<SoilAnalysisContent />);

    // Wait for farm to load and verify cultivated status
    await waitFor(() => {
      expect(screen.getByDisplayValue('Sugarcane')).toBeInTheDocument();
    });

    // Run Diagnostic AI
    const runBtn = screen.getByRole('button', { name: /RUN DIAGNOSTIC AI/i });
    fireEvent.click(runBtn);

    // Should display Currently Cultivating & Active Crop Optimization
    await waitFor(() => {
      expect(screen.getByText(/Currently Cultivating:/i)).toBeInTheDocument();
      expect(screen.getAllByText(/Sugarcane/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Active Crop Optimization/i).length).toBeGreaterThan(0);
      // Tabs for active crop optimization
      expect(screen.getByText(/Field Improvement & Nutrient Adjustments \(in Units\)/i)).toBeInTheDocument();
      expect(screen.getByText(/Ideal Growing Protocol & Field Care/i)).toBeInTheDocument();
      // Dosage in units should be rendered
      expect(screen.getByText(/Soil Nutrient Adjustments & Fertilizer Dosage \(in Units\)/i)).toBeInTheDocument();
      expect(screen.getByText(/Water & Irrigation Changes in Units/i)).toBeInTheDocument();
    }, { timeout: 4000 });

    // Switch to Ideal Growing Protocol tab
    const protocolTab = screen.getByRole('button', { name: /Ideal Growing Protocol & Field Care/i });
    fireEvent.click(protocolTab);

    await waitFor(() => {
      expect(screen.getByText(/Ideal Way of Growing Sugarcane/i)).toBeInTheDocument();
      expect(screen.getByText(/Field Preparation & Current Stage Management/i)).toBeInTheDocument();
      expect(screen.getByText(/Commercial Fertilizer Split Schedule/i)).toBeInTheDocument();
      expect(screen.getByText(/Custom Irrigation & Water Management/i)).toBeInTheDocument();
      expect(screen.getByText(/Harvesting & Post-Harvest Storage Tips/i)).toBeInTheDocument();
    });
  });
});
