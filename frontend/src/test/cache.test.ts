import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { CacheManager } from '../lib/cache';

describe('CacheManager - White-Box Caching, TTL and Eviction Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    localStorage.clear();
    vi.useRealTimers();
  });

  it('stores and retrieves cached items accurately', () => {
    const data = { crop: 'Ragi', nitrogenReq: 40 };
    CacheManager.set('crop_ragi', data);

    const retrieved = CacheManager.get<typeof data>('crop_ragi');
    expect(retrieved).toEqual(data);
  });

  it('respects custom TTL and expires items once TTL passes', () => {
    const data = { temperature: 29.5 };
    // 2 seconds TTL
    CacheManager.set('weather_live', data, { ttl: 2000 });

    // Immediately available
    expect(CacheManager.get('weather_live')).toEqual(data);

    // Fast-forward 1.5 seconds -> still valid
    vi.advanceTimersByTime(1500);
    expect(CacheManager.get('weather_live')).toEqual(data);

    // Fast-forward another 1 second (total 2.5s > 2s TTL) -> expired!
    vi.advanceTimersByTime(1000);
    expect(CacheManager.get('weather_live')).toBeNull();
  });

  it('deletes specific keys correctly', () => {
    CacheManager.set('item_1', 'value_1');
    CacheManager.set('item_2', 'value_2');

    CacheManager.delete('item_1');

    expect(CacheManager.get('item_1')).toBeNull();
    expect(CacheManager.get('item_2')).toBe('value_2');
  });

  it('clears all agri_compass cache keys without touching other localStorage items', () => {
    // Non-agri item
    localStorage.setItem('user_auth_token', 'secret123');

    CacheManager.set('mandi_rice', { price: 2100 });
    CacheManager.set('mandi_wheat', { price: 2350 });

    CacheManager.clear();

    expect(CacheManager.get('mandi_rice')).toBeNull();
    expect(CacheManager.get('mandi_wheat')).toBeNull();
    // Non-agri item remains safe
    expect(localStorage.getItem('user_auth_token')).toBe('secret123');
  });

  it('clears items matching a specific key prefix', () => {
    CacheManager.set('mandi_mandya_rice', 2100);
    CacheManager.set('mandi_mysuru_rice', 2150);
    CacheManager.set('weather_mandya', { temp: 28 });

    CacheManager.clearByPrefix('mandi_');

    expect(CacheManager.get('mandi_mandya_rice')).toBeNull();
    expect(CacheManager.get('mandi_mysuru_rice')).toBeNull();
    expect(CacheManager.get('weather_mandya')).toEqual({ temp: 28 });
  });

  it('getOrSet returns cached value when available, otherwise computes and caches it', async () => {
    const fetcher = vi.fn().mockResolvedValue('computed_data');

    // First call -> invokes fetcher
    const res1 = await CacheManager.getOrSet('test_key', fetcher);
    expect(res1).toBe('computed_data');
    expect(fetcher).toHaveBeenCalledTimes(1);

    // Second call -> returns from cache, fetcher NOT invoked again
    const res2 = await CacheManager.getOrSet('test_key', fetcher);
    expect(res2).toBe('computed_data');
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
});
