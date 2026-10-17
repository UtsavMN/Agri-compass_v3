import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import FertilizerAnalysisModule from '../components/features/FertilizerAnalysisModule';
import * as httpClient from '../lib/httpClient';

vi.mock('../lib/httpClient', () => ({
  apiGet: vi.fn(),
  apiPost: vi.fn(),
}));

describe('FertilizerAnalysisModule - Integration and Regression Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders Fertilizer Intelligence System title and form inputs', () => {
    vi.mocked(httpClient.apiGet).mockResolvedValue([]);

    render(
      <FertilizerAnalysisModule
        farmId="farm-456"
        initialCrop="rice"
      />
    );

    expect(screen.getByText(/Fertilizer Intelligence System/i)).toBeInTheDocument();
    expect(screen.getByText(/Nitrogen \(N\)/i)).toBeInTheDocument();
  });

  it('safely renders historical ledger items even if resultJson is malformed or already parsed', async () => {
    vi.mocked(httpClient.apiGet).mockImplementation(async (url: string) => {
      if (url.includes('/api/fertilizer/history/')) {
        return [
          {
            id: 'fa-1',
            farmId: 'farm-456',
            crop: 'maize',
            soilN: 20,
            soilP: 15,
            soilK: 15,
            soilLevel: 'medium',
            soilPh: '6.5',
            growthStage: 'basal',
            createdAt: '2026-10-17T10:00:00Z',
            resultJson: '{ invalid json }', // Malformed JSON regression test!
          },
          {
            id: 'fa-2',
            farmId: 'farm-456',
            crop: 'rice',
            soilN: 25,
            soilP: 20,
            soilK: 20,
            soilLevel: 'high',
            soilPh: '7.0',
            growthStage: 'tillering',
            createdAt: '2026-10-17T11:00:00Z',
            resultJson: JSON.stringify({ soil_health_score: 92 }),
          },
        ];
      }
      return [];
    });

    render(
      <FertilizerAnalysisModule
        farmId="farm-456"
        initialCrop="rice"
      />
    );

    // Wait for history button to appear
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /View Ledger/i })).toBeInTheDocument();
    });

    // Click View Ledger
    const ledgerBtn = screen.getByRole('button', { name: /View Ledger/i });
    fireEvent.click(ledgerBtn);

    // Both history cards should render without throwing SyntaxError
    await waitFor(() => {
      expect(screen.getByText('Historical Data Ledger')).toBeInTheDocument();
      expect(screen.getByText('maize')).toBeInTheDocument();
      expect(screen.getByText('rice')).toBeInTheDocument();
      expect(screen.getByText('92')).toBeInTheDocument();
    });
  });
});
