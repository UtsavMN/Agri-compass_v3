/**
 * Caching utilities for API responses and data
 * Provides localStorage-based caching with TTL support
 */

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

interface CacheOptions {
  ttl?: number; // Default 5 minutes
  maxSize?: number; // Maximum cache size in MB
}

class CacheManager {
  private static readonly CACHE_PREFIX = 'agri_compass_cache_';
  private static readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
  private static readonly MAX_CACHE_SIZE = 50 * 1024 * 1024; // 50MB

  private static getCacheKey(key: string): string {
    return `${this.CACHE_PREFIX}${key}`;
  }

  private static isExpired(item: CacheItem<any>): boolean {
    return Date.now() - item.timestamp > item.ttl;
  }

  private static getCacheSize(): number {
    let totalSize = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.CACHE_PREFIX)) {
        const value = localStorage.getItem(key);
        if (value) {
          totalSize += key.length + value.length;
        }
      }
    }
    return totalSize;
  }

  private static cleanupExpired(): void {
    const keysToRemove: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.CACHE_PREFIX)) {
        try {
          const item: CacheItem<any> = JSON.parse(localStorage.getItem(key)!);
          if (this.isExpired(item)) {
            keysToRemove.push(key);
          }
        } catch {
          // Invalid cache item, remove it
          keysToRemove.push(key);
        }
      }
    }

    keysToRemove.forEach(key => localStorage.removeItem(key));
  }

  private static enforceSizeLimit(): void {
    const currentSize = this.getCacheSize();
    if (currentSize > this.MAX_CACHE_SIZE) {
      // Remove oldest items first (simple LRU approximation)
      const cacheItems: Array<{ key: string; timestamp: number }> = [];

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(this.CACHE_PREFIX)) {
          try {
            const item: CacheItem<any> = JSON.parse(localStorage.getItem(key)!);
            cacheItems.push({ key, timestamp: item.timestamp });
          } catch {
            localStorage.removeItem(key);
          }
        }
      }

      // Sort by timestamp (oldest first) and remove until under limit
      cacheItems.sort((a, b) => a.timestamp - b.timestamp);

      let sizeToFree = currentSize - this.MAX_CACHE_SIZE * 0.8; // Free 80% of excess
      for (const item of cacheItems) {
        if (sizeToFree <= 0) break;
        const value = localStorage.getItem(item.key);
        if (value) {
          sizeToFree -= item.key.length + value.length;
          localStorage.removeItem(item.key);
        }
      }
    }
  }

  static set<T>(key: string, data: T, options: CacheOptions = {}): void {
    const { ttl = this.DEFAULT_TTL } = options;

    const cacheItem: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl,
    };

    try {
      localStorage.setItem(this.getCacheKey(key), JSON.stringify(cacheItem));
      this.enforceSizeLimit();
    } catch (error) {
      // localStorage is full or unavailable
      console.warn('Cache storage failed:', error);
      this.cleanupExpired();
      // Try again after cleanup
      try {
        localStorage.setItem(this.getCacheKey(key), JSON.stringify(cacheItem));
      } catch {
        // Still failed, skip caching
      }
    }
  }

  static get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(this.getCacheKey(key));
      if (!item) return null;

      const cacheItem: CacheItem<T> = JSON.parse(item);

      if (this.isExpired(cacheItem)) {
        localStorage.removeItem(this.getCacheKey(key));
        return null;
      }

      return cacheItem.data;
    } catch (error) {
      // Invalid cache data
      localStorage.removeItem(this.getCacheKey(key));
      return null;
    }
  }

  static delete(key: string): void {
    localStorage.removeItem(this.getCacheKey(key));
  }

  static clear(): void {
    const keysToRemove: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.CACHE_PREFIX)) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach(key => localStorage.removeItem(key));
  }

  static clearByPrefix(prefix: string): void {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(`${this.CACHE_PREFIX}${prefix}`)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
  }

  static has(key: string): boolean {
    const item = localStorage.getItem(this.getCacheKey(key));
    if (!item) return false;

    try {
      const cacheItem: CacheItem<any> = JSON.parse(item);
      if (this.isExpired(cacheItem)) {
        localStorage.removeItem(this.getCacheKey(key));
        return false;
      }
      return true;
    } catch {
      localStorage.removeItem(this.getCacheKey(key));
      return false;
    }
  }
}

/**
 * React hook for caching API responses
 */
export function useCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: CacheOptions & { enabled?: boolean } = {}
) {
  const { enabled = true, ...cacheOptions } = options;

  return {
    getCachedData: () => CacheManager.get<T>(key),
    setCachedData: (data: T) => CacheManager.set(key, data, cacheOptions),
    clearCache: () => CacheManager.delete(key),
    hasCache: () => CacheManager.has(key),

    fetchWithCache: async (): Promise<T> => {
      if (!enabled) {
        return await fetcher();
      }

      // Try cache first
      const cached = CacheManager.get<T>(key);
      if (cached !== null) {
        return cached;
      }

      // Fetch fresh data
      const data = await fetcher();

      // Cache the result
      CacheManager.set(key, data, cacheOptions);

      return data;
    },
  };
}

/**
 * Weather-specific caching utilities
 */
export class WeatherCache {
  private static readonly WEATHER_TTL = 30 * 60 * 1000; // 30 minutes
  private static readonly FORECAST_TTL = 2 * 60 * 60 * 1000; // 2 hours

  static setWeather(district: string, data: any): void {
    CacheManager.set(`weather_${district}`, data, { ttl: this.WEATHER_TTL });
  }

  static getWeather(district: string): any {
    return CacheManager.get(`weather_${district}`);
  }

  static setForecast(district: string, data: any): void {
    CacheManager.set(`forecast_${district}`, data, { ttl: this.FORECAST_TTL });
  }

  static getForecast(district: string): any {
    return CacheManager.get(`forecast_${district}`);
  }
}

/**
 * Posts/Feed caching utilities
 */
export class PostsCache {
  private static readonly POSTS_TTL = 10 * 60 * 1000; // 10 minutes

  static setFeed(filters: any, data: any): void {
    const key = `posts_${JSON.stringify(filters)}`;
    CacheManager.set(key, data, { ttl: this.POSTS_TTL });
  }

  static getFeed(filters: any): any {
    const key = `posts_${JSON.stringify(filters)}`;
    return CacheManager.get(key);
  }

  static invalidateFeed(): void {
    CacheManager.clearByPrefix('posts_');
  }
}

/**
 * Network status utilities
 */
export class NetworkUtils {
  static isOnline(): boolean {
    return navigator.onLine;
  }

  static async waitForConnection(timeout = 5000): Promise<boolean> {
    if (this.isOnline()) return true;

    return new Promise((resolve) => {
      const timeoutId = setTimeout(() => {
        resolve(false);
      }, timeout);

      window.addEventListener('online', () => {
        clearTimeout(timeoutId);
        resolve(true);
      }, { once: true });
    });
  }

  static async retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries = 3,
    baseDelay = 1000
  ): Promise<T> {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        if (i === maxRetries - 1) throw error;

        const delay = baseDelay * Math.pow(2, i);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw new Error('Max retries exceeded');
  }
}

export { CacheManager };
export type { CacheOptions };
