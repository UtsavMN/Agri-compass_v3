
import { GoldCard } from "@/components/ui/GoldCard";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { useMarketPrices } from "@/hooks/useMarketPrices";
import { motion } from "framer-motion";
import { staggerContainer, fadeUpVariants } from "@/lib/animations";
import { formatTime } from "@/lib/dateUtils";

const PriceSkeleton = () => (
  <div className="animate-pulse bg-[#111] border border-[#1E1E1E] rounded-xl p-5 h-24" />
);

export const MarketPricesSection = ({ district }: { district: string }) => {
  const { prices, source, loading, error, lastUpdated } = useMarketPrices(district);

  const formatReportDate = (dateStr?: string) => {
    if (!dateStr) return null;
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
    } catch {
      return dateStr;
    }
  };

  return (
    <section className="py-10">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-6">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-2xl font-serif text-[#F5F0E8]">Market Prices</h2>
            {source === "KRISHI_MARATA_VAHINI" && (
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                Krishi Marata Vahini (Govt of Karnataka APMC)
              </span>
            )}
          </div>
          <p className="text-xs text-[#F5F0E8]/50 mt-1">
            Official mandi arrivals and price benchmarks for {district}
          </p>
        </div>
        {lastUpdated && (
          <span className="text-xs text-[#F5F0E8]/40">
            {error ? `⚠ ${error}` : `Updated ${formatTime(lastUpdated)}`}
          </span>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <PriceSkeleton key={i} />)}
        </div>
      ) : prices.length === 0 ? (
        <div className="text-center py-16 bg-[#111]/40 rounded-2xl border border-dashed border-[#222]">
          <p className="text-[#F5F0E8]/70 text-base font-medium">
            No recent mandi price is available for this crop or district.
          </p>
          <p className="text-[#F5F0E8]/40 text-xs mt-2 max-w-md mx-auto">
            Please check again when a new report is published by the Krishi Marata Vahini portal.
          </p>
        </div>
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {prices.map((price, i) => (
            <motion.div key={i} variants={fadeUpVariants} custom={i}>
              <GoldCard>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-[#F5F0E8] font-semibold text-lg">{price.commodity}</p>
                    <p className="text-[#F5F0E8]/60 text-xs mt-0.5">
                      {price.market}{price.variety ? ` • ${price.variety}` : ""}{price.grade ? ` (${price.grade})` : ""}
                    </p>
                  </div>
                  {price.trend && (
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                      price.trend === "up"
                        ? "text-green-400 bg-green-400/10"
                        : price.trend === "down"
                        ? "text-red-400 bg-red-400/10"
                        : "text-[#F5F0E8]/50 bg-white/5"
                    }`}>
                      {price.trend === "up" ? "↑" : price.trend === "down" ? "↓" : "—"}
                    </span>
                  )}
                </div>

                <div className="flex items-baseline gap-1.5">
                  <AnimatedCounter
                    end={price.modalPrice}
                    prefix="₹"
                    suffix={price.priceUnit ? ` / ${price.priceUnit.replace("Rs/", "")}` : "/Q"}
                    className="text-2xl font-bold text-[#C9A84C]"
                  />
                  <span className="text-[11px] text-[#F5F0E8]/40 font-medium">Modal Price</span>
                </div>

                <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-white/5 text-xs text-[#F5F0E8]/50">
                  <div className="flex gap-3">
                    <span>Min: ₹{price.minPrice}</span>
                    <span>Max: ₹{price.maxPrice}</span>
                  </div>
                  {price.arrivalQuantity != null && price.arrivalQuantity > 0 && (
                    <span className="text-[#F5F0E8]/60">
                      Arrivals: {Number(price.arrivalQuantity).toLocaleString("en-IN")} {price.arrivalUnit || "Q"}
                    </span>
                  )}
                </div>

                {price.date && (
                  <div className="mt-2 text-[11px] text-[#F5F0E8]/40 flex items-center justify-between">
                    <span>Reported: <span className="text-[#F5F0E8]/70 font-medium">{formatReportDate(price.date)}</span></span>
                    {price.source && (
                      <span className="text-[10px] text-[#C9A84C]/80 font-mono tracking-tight">{price.source}</span>
                    )}
                  </div>
                )}
              </GoldCard>
            </motion.div>
          ))}
        </motion.div>
      )}
    </section>
  );
};
