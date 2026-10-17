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
});
