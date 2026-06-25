import { useState, useEffect } from "react";

interface MandiPrice {
  commodity: string;
  market: string;
  district: string;
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
  date: string;
  trend: "up" | "down" | "stable";
}

export const useMarketPrices = (district: string) => {
  const [prices, setPrices] = useState<MandiPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    const fetchPrices = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/market/prices?district=${encodeURIComponent(district)}&limit=20`
        );

        if (!response.ok) throw new Error("Failed to fetch");

        const data = await response.json();
        setPrices(data.prices);
        setLastUpdated(new Date());

        // Cache in localStorage as fallback
        localStorage.setItem(`market_prices_${district}`, JSON.stringify({
          prices: data.prices,
          timestamp: Date.now()
        }));
      } catch (err) {
        // Load from cache if API fails
        const cached = localStorage.getItem(`market_prices_${district}`);
        if (cached) {
          const { prices: cachedPrices, timestamp } = JSON.parse(cached);
          setPrices(cachedPrices);
          setLastUpdated(new Date(timestamp));
          setError(`Using cached data from ${Math.round((Date.now() - timestamp) / 3600000)}h ago`);
        } else {
          setError("Unable to load market prices");
        }
      } finally {
        setLoading(false);
      }
    };

    if (district) fetchPrices();
  }, [district]);

  return { prices, loading, error, lastUpdated };
};
