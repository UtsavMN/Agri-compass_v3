
import { GoldCard } from "@/components/ui/GoldCard";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { useMarketPrices } from "@/hooks/useMarketPrices";
import { motion } from "framer-motion";
import { staggerContainer, fadeUpVariants } from "@/lib/animations";

const PriceSkeleton = () => (
  <div className="animate-pulse bg-[#111] border border-[#1E1E1E] rounded-xl p-5 h-24" />
);

export const MarketPricesSection = ({ district }: { district: string }) => {
  const { prices, loading, error, lastUpdated } = useMarketPrices(district);

  return (
    <section className="py-10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-serif text-[#F5F0E8]">Market Prices</h2>
        {lastUpdated && (
          <span className="text-xs text-[#F5F0E8]/40">
            {error ? `⚠ ${error}` : `Updated ${lastUpdated.toLocaleTimeString()}`}
          </span>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <PriceSkeleton key={i} />)}
        </div>
      ) : prices.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-[#F5F0E8]/40">No mandi data available for {district} today.</p>
          <p className="text-[#F5F0E8]/20 text-sm mt-2">Data.gov.in updates prices daily by 5 PM.</p>
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
                    <p className="text-[#F5F0E8] font-semibold">{price.commodity}</p>
                    <p className="text-[#F5F0E8]/40 text-xs mt-0.5">{price.market}</p>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                    price.trend === "up"
                      ? "text-green-400 bg-green-400/10"
                      : price.trend === "down"
                      ? "text-red-400 bg-red-400/10"
                      : "text-[#F5F0E8]/50 bg-white/5"
                  }`}>
                    {price.trend === "up" ? "↑" : price.trend === "down" ? "↓" : "—"}
                  </span>
                </div>
                <AnimatedCounter
                  end={price.modalPrice}
                  prefix="₹"
                  suffix="/Q"
                  className="text-2xl font-bold text-[#C9A84C]"
                />
                <div className="flex gap-4 mt-2 text-xs text-[#F5F0E8]/40">
                  <span>Min: ₹{price.minPrice}</span>
                  <span>Max: ₹{price.maxPrice}</span>
                </div>
              </GoldCard>
            </motion.div>
          ))}
        </motion.div>
      )}
    </section>
  );
};
