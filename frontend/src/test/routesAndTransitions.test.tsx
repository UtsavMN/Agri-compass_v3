import React, { Suspense } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter, Routes, Route, Link, Outlet } from 'react-router-dom';
import { PageTransition } from '../components/layout/PageTransition';
import { ErrorBoundary } from '../components/ErrorBoundary';

// Mock sub-feature components
const MockDashboard = () => <div>Mock Dashboard Page Content</div>;
const MockCrops = () => <div>Mock Crops Page Content</div>;
const MockWeather = () => <div>Mock Weather Page Content</div>;
const MockMarket = () => <div>Mock Market Prices Content</div>;

const MockShellLayout = () => {
  return (
    <div data-testid="app-shell">
      <nav data-testid="app-nav">
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/crops">Crops</Link>
        <Link to="/weather">Weather</Link>
        <Link to="/market">Market</Link>
      </nav>
      <main data-testid="app-content">
        <ErrorBoundary variant="inline">
          <Suspense fallback={<div>Loading Sub-Feature...</div>}>
            <PageTransition>
              <Outlet />
            </PageTransition>
          </Suspense>
        </ErrorBoundary>
      </main>
    </div>
  );
};

describe('Route Transitions & Shell Architecture - Integration Tests', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('renders initial route within shell without crashing', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route element={<MockShellLayout />}>
            <Route path="/dashboard" element={<MockDashboard />} />
            <Route path="/crops" element={<MockCrops />} />
            <Route path="/weather" element={<MockWeather />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByTestId('app-shell')).toBeInTheDocument();
    expect(screen.getByTestId('app-nav')).toBeInTheDocument();
    expect(screen.getByText('Mock Dashboard Page Content')).toBeInTheDocument();
  });

  it('transitions smoothly to another feature when route changes', async () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route element={<MockShellLayout />}>
            <Route path="/dashboard" element={<MockDashboard />} />
            <Route path="/crops" element={<MockCrops />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Mock Dashboard Page Content')).toBeInTheDocument();

    // User clicks navigation link to change feature
    fireEvent.click(screen.getByRole('link', { name: 'Crops' }));

    expect(screen.getByText('Mock Crops Page Content')).toBeInTheDocument();
    expect(screen.getByTestId('app-nav')).toBeInTheDocument();
  });

  it('isolates sub-feature error to content area while keeping shell navbar mounted and active', () => {
    const CrashFeature = () => {
      throw new Error('Crashing feature in isolation');
    };

    render(
      <MemoryRouter initialEntries={['/broken-feature']}>
        <Routes>
          <Route element={<MockShellLayout />}>
            <Route path="/broken-feature" element={<CrashFeature />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    // Shell and Nav MUST remain completely mounted and functional!
    expect(screen.getByTestId('app-shell')).toBeInTheDocument();
    expect(screen.getByTestId('app-nav')).toBeInTheDocument();

    // Content area shows inline error rather than taking down the entire app
    expect(screen.getByText('Feature Temporarily Unavailable')).toBeInTheDocument();
  });
});
