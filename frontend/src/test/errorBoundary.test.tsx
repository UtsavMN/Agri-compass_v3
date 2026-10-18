import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorBoundary } from '../components/ErrorBoundary';

const BombComponent = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Simulated runtime feature crash in Farm Intelligence');
  }
  return <div>Feature Loaded Successfully</div>;
};

describe('ErrorBoundary - White-Box Resilience & Auto-Recovery Tests', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    sessionStorage.clear();
  });

  it('renders children normally when no error occurs', () => {
    render(
      <ErrorBoundary>
        <BombComponent shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Feature Loaded Successfully')).toBeInTheDocument();
  });

  it('catches runtime component crash and displays Something went wrong modal', () => {
    render(
      <ErrorBoundary>
        <BombComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText(/An unexpected error occurred/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });

  it('displays inline variant without taking over full screen', () => {
    render(
      <ErrorBoundary variant="inline">
        <BombComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Feature Temporarily Unavailable')).toBeInTheDocument();
    expect(screen.getByText(/unexpected issue occurred while rendering this section/i)).toBeInTheDocument();
  });

  it('allows user to retry and recovers once error condition is resolved', () => {
    let shouldThrow = true;

    const DynamicComponent = () => {
      if (shouldThrow) throw new Error('Temporary glitch');
      return <div>Recovered Content</div>;
    };

    const { rerender } = render(
      <ErrorBoundary>
        <DynamicComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();

    // Condition resolves
    shouldThrow = false;
    fireEvent.click(screen.getByRole('button', { name: /try again/i }));

    rerender(
      <ErrorBoundary>
        <DynamicComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Recovered Content')).toBeInTheDocument();
  });

  it('identifies chunk loading errors and displays Loading latest version indicator', () => {
    const ChunkFailComponent = () => {
      const err = new Error('Failed to fetch dynamically imported module: /assets/CropDetails.js');
      err.name = 'ChunkLoadError';
      throw err;
    };

    render(
      <ErrorBoundary>
        <ChunkFailComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText(/loading latest version/i)).toBeInTheDocument();
  });
});
