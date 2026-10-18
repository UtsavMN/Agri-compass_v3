import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MarketPricesSection } from "../components/dashboard/MarketPricesSection";
import * as marketHook from "../hooks/useMarketPrices";

vi.mock("../hooks/useMarketPrices");

describe("MarketPricesSection - Component Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders empty state message when no prices are available", () => {
    vi.spyOn(marketHook, "useMarketPrices").mockReturnValue({
      prices: [],
      source: null,
      loading: false,
      error: null,
      lastUpdated: new Date("2026-10-18T10:00:00Z"),
    });

    render(<MarketPricesSection district="Haveri" />);

    expect(screen.getByText(/Market Prices/i)).toBeInTheDocument();
    expect(
      screen.getByText(/No recent mandi price is available for this crop or district/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Please check again when a new report is published/i)
    ).toBeInTheDocument();
  });

  it("renders Krishi Marata Vahini prices with badge, variety, arrivals, and reporting date", () => {
    vi.spyOn(marketHook, "useMarketPrices").mockReturnValue({
      prices: [
        {
          commodity: "Maize",
          market: "Haveri",
          district: "Haveri",
          variety: "Local",
          grade: "Medium",
          minPrice: 2350,
          maxPrice: 2600,
          modalPrice: 2500,
          arrivalQuantity: 8832,
          arrivalUnit: "Quintal",
          priceUnit: "Rs/Quintal",
          date: "2026-10-01",
          source: "KRISHI_MARATA_VAHINI",
          trend: "stable",
        },
      ],
      source: "KRISHI_MARATA_VAHINI",
      loading: false,
      error: null,
      lastUpdated: new Date("2026-10-18T10:00:00Z"),
    });

    render(<MarketPricesSection district="Haveri" />);

    // Official badge
    expect(
      screen.getByText(/Krishi Marata Vahini \(Govt of Karnataka APMC\)/i)
    ).toBeInTheDocument();

    // Commodity and market details
    expect(screen.getByText("Maize")).toBeInTheDocument();
    expect(screen.getByText(/Haveri • Local \(Medium\)/i)).toBeInTheDocument();

    // Prices
    expect(screen.getByText(/Min: ₹2350/i)).toBeInTheDocument();
    expect(screen.getByText(/Max: ₹2600/i)).toBeInTheDocument();

    // Arrivals
    expect(screen.getByText(/Arrivals: 8,832 Quintal/i)).toBeInTheDocument();

    // Source tag & report date
    expect(screen.getByText("KRISHI_MARATA_VAHINI")).toBeInTheDocument();
    expect(screen.getByText(/Reported:/i)).toBeInTheDocument();
  });
});
