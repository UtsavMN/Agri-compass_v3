import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { FarmIntelligenceCard } from '../components/FarmIntelligenceCard';
import * as httpClient from '../lib/httpClient';

// Mock httpClient apiGet
vi.mock('../lib/httpClient', () => ({
  apiGet: vi.fn(),
  apiPost: vi.fn(),
}));

describe('FarmIntelligenceCard - Component Integration and Regression Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders farm name, acres, and district correctly', async () => {
    vi.mocked(httpClient.apiGet).mockImplementation(async (url: string) => {
      if (url.includes('/api/market/prices')) {
        return { prices: [{ modalPrice: 2200 }] };
      }
      if (url.includes('/api/farms/')) {
        return [];
      }
      return null;
    });

    render(
      <FarmIntelligenceCard
        farmId="farm-123"
        farmName="Sunrise Organic Farm"
        acres={5}
        district="Hassan"
        crop="Coffee"
      />
    );

    expect(screen.getByText('Sunrise Organic Farm')).toBeInTheDocument();
    expect(screen.getByText(/5 acres • Hassan/i)).toBeInTheDocument();
    expect(screen.getByText('Coffee')).toBeInTheDocument();
  });

  it('safely extracts recommendations from unstructured/plain-text report without throwing JSON.parse error', async () => {
    const rawPlainReport = "Ensure consistent mulching and irrigation during flowering.";
    vi.mocked(httpClient.apiGet).mockImplementation(async (url: string) => {
      if (url.includes('/api/farms/')) {
        return [
          {
            id: 'diag-1',
            createdAt: '2026-10-17T12:00:00Z',
            healthStatus: 'Moderate',
            nitrogen: 30,
            phosphorus: 20,
            potassium: 15,
            ph: 6.5,
            aiReport: rawPlainReport, // NOT valid JSON!
          },
        ];
      }
      return null;
    });

    render(
      <FarmIntelligenceCard
        farmId="farm-123"
        farmName="Mandya Paddy Fields"
        acres={3}
        district="Mandya"
        crop="Rice"
      />
    );

    // Advisory should safely display the plain text report without crashing
    await waitFor(() => {
      expect(screen.getByText(rawPlainReport)).toBeInTheDocument();
    });

    // Open History modal
    const historyButton = screen.getByRole('button', { name: /History/i });
    fireEvent.click(historyButton);

    // Modal should be visible with diagnostic history item
    await waitFor(() => {
      expect(screen.getByText('Soil Diagnostics History')).toBeInTheDocument();
      expect(screen.getByText('Moderate')).toBeInTheDocument();
    });

    // Close button should close the modal
    const closeBtn = screen.getByRole('button', { name: /Close/i });
    fireEvent.click(closeBtn);

    await waitFor(() => {
      expect(screen.queryByText('Soil Diagnostics History')).not.toBeInTheDocument();
    });
  });
});
