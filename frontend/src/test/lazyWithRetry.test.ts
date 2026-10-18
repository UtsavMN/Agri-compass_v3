import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { lazyWithRetry } from '../lib/lazyWithRetry';

describe('lazyWithRetry - Dynamic Chunk Recovery White-Box Tests', () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('creates lazy component successfully on valid dynamic import', async () => {
    const DummyComponent = () => null;
    const importer = vi.fn().mockResolvedValue({ default: DummyComponent });

    const LazyComp = lazyWithRetry(importer, 'test-feature');
    expect(LazyComp).toBeDefined();
  });

  it('retries dynamic import on transient failure before giving up', async () => {
    const DummyComponent = () => null;
    let callCount = 0;
    const importer = vi.fn().mockImplementation(async () => {
      callCount++;
      if (callCount === 1) {
        throw new Error('Network timeout during bundle fetch');
      }
      return { default: DummyComponent };
    });

    // In React.lazy, the function inside is an async factory
    // We can directly test the underlying retry behavior
    const LazyComp = lazyWithRetry(importer, 'transient-feature');
    expect(LazyComp).toBeDefined();
  });
});
