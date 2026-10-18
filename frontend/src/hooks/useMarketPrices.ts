import { useState, useEffect } from "react";
import { apiGet } from "../lib/httpClient";
import { parseSafeDate } from "@/lib/dateUtils";

export interface MandiPrice {
  commodity: string;
  market: string;
  district: string;
  variety?: string;
  grade?: string;
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
  arrivalQuantity?: number;
  arrivalUnit?: string;
  priceUnit?: string;
  date: string;
  source?: string;
  trend?: "up" | "down" | "stable";
}

export const useMarketPrices = (district: string) => {
  const [prices, setPrices] = useState<MandiPrice[]>([]);
  const [source, setSource] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    const fetchPrices = async () => {
      setLoading(true);
      try {
        const data = await apiGet(`/api/market/prices?district=${encodeURIComponent(district)}&limit=20`);

        const serverDate = parseSafeDate(data?.fetchedAt) || new Date();
        setPrices(data?.prices || []);
        setSource(data?.source || null);
        setLastUpdated(serverDate);

        // Cache in localStorage as fallback
        localStorage.setItem(`market_prices_${district}`, JSON.stringify({
          prices: data?.prices || [],
          source: data?.source || null,
          timestamp: serverDate.getTime()
        }));
      } catch (_err) {
        // Load from cache if API fails
        const cached = localStorage.getItem(`market_prices_${district}`);
        if (cached) {
          const { prices: cachedPrices, source: cachedSource, timestamp } = JSON.parse(cached);
          const serverDate = parseSafeDate(timestamp) || new Date();
          setPrices(cachedPrices);
          setSource(cachedSource || null);
          setLastUpdated(serverDate);
          const hoursAgo = Math.max(1, Math.round((Date.now() - serverDate.getTime()) / 3600000));
          setError(`Using cached data from ${hoursAgo}h ago`);
        } else {
          setError("Unable to load market prices");
        }
      } finally {
        setLoading(false);
      }
    };

    if (district) fetchPrices();
  }, [district]);

  return { prices, source, loading, error, lastUpdated };
};
