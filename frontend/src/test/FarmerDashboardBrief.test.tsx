import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { FarmerDashboardBrief } from '@/components/dashboard/FarmerDashboardBrief';
import { FarmsAPI } from '@/lib/api/farms';
import { weatherAdvisor } from '@/lib/ai/weatherAdvisor';
import * as httpClient from '@/lib/httpClient';

// Mock navigation
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock httpClient apiGet & apiPost
vi.mock('@/lib/httpClient', () => ({
  apiGet: vi.fn(),
  apiPost: vi.fn(),
}));

// Mock user and district store
vi.mock('@/store', () => ({
  useUser: () => ({
    user: { id: 'farmer_123', name: 'Basavaraj' },
  }),
  useDistrict: () => ({
    selectedDistrict: 'Kolar',
  }),
}));

const mockFarms = [
  {
    id: 'farm_1',
    user_id: 'farmer_123',
    name: 'Kolar Green Acres',
    location: 'Kolar',
    area_acres: 15,
    soil_type: 'Red Sandy Loam',
    irrigation_type: 'Drip',
    current_crop: 'Tomato',
    created_at: new Date().toISOString(),
  },
  {
    id: 'farm_2',
    user_id: 'farmer_123',
    name: 'Mandya Paddy Fields',
    location: 'Mandya',
    area_acres: 28,
    soil_type: 'Clay Loam',
    irrigation_type: 'Canal',
    current_crop: 'Rice (Paddy)',
    created_at: new Date().toISOString(),
  },
];

describe('FarmerDashboardBrief Component (Carousel, Checklist & Synced Irrigation)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();

    vi.mocked(httpClient.apiGet).mockImplementation(async (url: string) => {
      if (url.includes('/api/market/prices')) {
        return {
          prices: [
            {
              commodity: 'Tomato',
              market: 'Kolar APMC',
              district: 'Kolar',
              modalPrice: 1850,
              minPrice: 1400,
              maxPrice: 2100,
              trend: 'up',
              date: '2026-10-19',
            },
          ],
          source: 'Agmarknet',
          fetchedAt: new Date().toISOString(),
        };
      }
      return [];
    });

    vi.spyOn(weatherAdvisor, 'getWeatherData').mockImplementation(async (district: string) => {
      return {
        temperature: district === 'Mandya' ? 31 : 28,
        humidity: 60,
        windSpeed: 8,
        windDirection: 'NE',
        description: 'Sunny',
        precipitation: 0,
        precipitationProbability: 10,
        forecast: [
          {
            date: '2026-10-19',
            day_name: 'Today',
            temp_max: 31,
            temp_min: 20,
            description: 'Sunny',
            precipitation: 0,
            precipitation_probability: 10,
            wind_speed_max: 9,
            wind_direction: 'NE',
            spraying_suitability: 'Optimal',
            spraying_reason: 'Calm winds & low rain risk — ideal for foliar nutrition & protective sprays.',
          },
        ],
      } as any;
    });
  });

  it('renders farm carousel and navigates between registered farms freely', async () => {
    vi.spyOn(FarmsAPI, 'getFarms').mockResolvedValue(mockFarms);

    render(
      <MemoryRouter>
        <FarmerDashboardBrief district="Kolar" />
      </MemoryRouter>
    );

    // Initial render displays Farm 1 in Card 1 & Card 2
    await waitFor(() => {
      expect(screen.getByText('Daily Field Brief')).toBeInTheDocument();
      expect(screen.getAllByText('Kolar Green Acres').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('1/2')).toBeInTheDocument();
    });

    // Feature 2 is synchronized with Farm 1
    expect(screen.getByText(/Spraying & Irrigation/)).toBeInTheDocument();
    expect(screen.getByText(/Drip System \(Kolar Green Acres\)/)).toBeInTheDocument();

    // Click Next Farm button to navigate to Farm 2
    const nextBtn = screen.getByTestId('next-farm');
    fireEvent.click(nextBtn);

    // Verify Farm 2 is now displayed in Feature 1
    await waitFor(() => {
      expect(screen.getAllByText('Mandya Paddy Fields').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('Rice (Paddy)')).toBeInTheDocument();
      expect(screen.getByText('2/2')).toBeInTheDocument();
    });

    // Verify Feature 2 synchronized to Farm 2 (Canal System, Mandya Paddy Fields)
    await waitFor(() => {
      expect(screen.getByText(/Canal System \(Mandya Paddy Fields\)/)).toBeInTheDocument();
      expect(screen.getByText(/Agro Weather \(Mandya\)/)).toBeInTheDocument();
    });

    // Click Prev Farm button to navigate back to Farm 1
    const prevBtn = screen.getByTestId('prev-farm');
    fireEvent.click(prevBtn);

    await waitFor(() => {
      expect(screen.getAllByText('Kolar Green Acres').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('1/2')).toBeInTheDocument();
      expect(screen.getByText(/Drip System \(Kolar Green Acres\)/)).toBeInTheDocument();
    });
  });

  it('allows user to manage and add custom checklist items inside their farm', async () => {
    vi.spyOn(FarmsAPI, 'getFarms').mockResolvedValue(mockFarms);

    render(
      <MemoryRouter>
        <FarmerDashboardBrief district="Kolar" />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getAllByText('Kolar Green Acres').length).toBeGreaterThanOrEqual(1);
    });

    // Switch to Checklist tab
    const checklistTab = screen.getByTestId('checklist-tab');
    fireEvent.click(checklistTab);

    // Contextual tasks for tomato should be present
    await waitFor(() => {
      expect(screen.getByText(/Apply Calcium Nitrate \+ Boron/)).toBeInTheDocument();
    });

    // Add a custom task for this farm
    const taskInput = screen.getByTestId('add-task-input');
    const addButton = screen.getByTestId('add-task-button');

    fireEvent.change(taskInput, { target: { value: 'Inspect trellising ropes & stakes' } });
    fireEvent.click(addButton);

    // The newly added task should appear in the checklist
    await waitFor(() => {
      expect(screen.getByText('Inspect trellising ropes & stakes')).toBeInTheDocument();
    });

    // Toggle the newly added task to mark it as completed
    const newTaskItem = screen.getByText('Inspect trellising ropes & stakes');
    fireEvent.click(newTaskItem);

    // Verify the checklist counter updated
    await waitFor(() => {
      expect(screen.getByText(/Checklist \(1\//)).toBeInTheDocument();
    });
  });

  it('handles fallow parcels and links to Soil AI crop recommendations', async () => {
    vi.spyOn(FarmsAPI, 'getFarms').mockResolvedValue([
      {
        id: 'farm_fallow',
        user_id: 'farmer_123',
        name: 'Hulimavu Plot',
        location: 'Kolar',
        area_acres: 8,
        soil_type: 'Sandy Loam',
        irrigation_type: 'Borewell',
        current_crop: null,
        created_at: new Date().toISOString(),
      },
    ]);

    render(
      <MemoryRouter>
        <FarmerDashboardBrief district="Kolar" />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Land Ready For Sowing')).toBeInTheDocument();
      expect(screen.getByText('Get Crop Recommendations')).toBeInTheDocument();
    });

    // Clicking footer action navigates to soil-ai tab
    const actionBtn = screen.getByText('Get Crop Recommendations');
    fireEvent.click(actionBtn);
    expect(mockNavigate).toHaveBeenCalledWith('/my-farm?tab=soil-ai');
  });

  it('renders Feature 4: Mandi Price Movers with live APMC rates', async () => {
    vi.spyOn(FarmsAPI, 'getFarms').mockResolvedValue(mockFarms);

    render(
      <MemoryRouter>
        <FarmerDashboardBrief district="Kolar" />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Mandi Price Mover')).toBeInTheDocument();
      expect(screen.getAllByText(/Tomato/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText(/₹1,850/)).toBeInTheDocument();
    });

    // Clicking navigates to market prices
    const mandiHeader = screen.getByText('Mandi Price Mover');
    fireEvent.click(mandiHeader);
    expect(mockNavigate).toHaveBeenCalledWith('/market-prices');
  });
});
