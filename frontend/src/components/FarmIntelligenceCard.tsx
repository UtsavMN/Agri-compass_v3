import { motion } from "framer-motion";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { useEffect, useState } from "react";
import { apiGet } from "@/lib/httpClient";

interface FarmIntelligenceProps {
  farmName: string;
  acres: number;
  district: string;
  crop?: string;
  npk?: { n: number; p: number; k: number };
}

export const FarmIntelligenceCard = ({ farmName, acres, district, crop, npk }: FarmIntelligenceProps) => {
  const [marketPrice, setMarketPrice] = useState<number | null>(null);
  const [advisory, setAdvisory] = useState("Fetching AI advisory...");

  useEffect(() => {
    if (crop) {
      // Fetch live market price for this crop from your backend
      apiGet(`/api/market/prices?commodity=${crop}&district=${district}&limit=1`)
        .then((d: any) => {
          if (d.prices && d.prices.length > 0) {
            setMarketPrice(d.prices[0].modalPrice);
          } else {
            setMarketPrice(1850); // Fallback
          }
        })
        .catch(() => setMarketPrice(1850));

      // Mock AI advisory based on crop
      setTimeout(() => {
        setAdvisory(`Optimal time to apply nitrogen fertilizer for ${crop}. Keep soil moisture above 60%.`);
      }, 1500);
    } else {
      setAdvisory("Please add a crop to get AI advisory.");
    }
  }, [crop, district]);

  const estimatedYield = acres * 8; // quintals
  const estimatedEarnings = marketPrice ? estimatedYield * marketPrice : null;

  const npkStatus = npk
    ? npk.n < 30 ? "Low Nitrogen" : npk.p < 25 ? "Low Phosphorus" : npk.k < 20 ? "Low Potassium" : "Healthy"
    : "Not analysed";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#111] border border-[#1E1E1E] rounded-xl overflow-hidden hover:border-[#C9A84C]/30 transition-colors"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-[#C9A84C]/10 to-transparent px-5 py-4 border-b border-[#1E1E1E]">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-[#F5F0E8] font-semibold text-lg">{farmName}</h3>
            <p className="text-[#F5F0E8]/40 text-xs mt-0.5 font-medium tracking-wider uppercase">{acres} acres · {district}</p>
          </div>
          <span className="text-[#C9A84C] text-xs font-bold uppercase tracking-wider border border-[#C9A84C]/30 px-3 py-1.5 rounded-full bg-[#C9A84C]/5">
            {crop || "No crop set"}
          </span>
        </div>
      </div>

      {/* Intelligence Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-[#1E1E1E]">
        <div className="bg-[#111] p-4">
          <p className="text-[#F5F0E8]/40 text-[10px] font-black uppercase tracking-widest mb-1.5">Current Market Price</p>
          {marketPrice ? (
            <AnimatedCounter end={marketPrice} prefix="₹" suffix="/Q" className="text-xl font-bold text-[#C9A84C]" />
          ) : (
            <div className="h-7 w-24 bg-[#1E1E1E] rounded animate-pulse" />
          )}
        </div>
        <div className="bg-[#111] p-4">
          <p className="text-[#F5F0E8]/40 text-[10px] font-black uppercase tracking-widest mb-1.5">Est. Earnings</p>
          {estimatedEarnings ? (
            <AnimatedCounter end={estimatedEarnings} prefix="₹" className="text-xl font-bold text-green-400" />
          ) : (
            <div className="h-7 w-24 bg-[#1E1E1E] rounded animate-pulse" />
          )}
        </div>
        <div className="bg-[#111] p-4">
          <p className="text-[#F5F0E8]/40 text-[10px] font-black uppercase tracking-widest mb-1.5">Soil Health</p>
          <p className={`text-sm font-bold ${
            npkStatus === "Healthy" ? "text-green-400" : "text-yellow-400"
          }`}>
            {npkStatus}
          </p>
        </div>
        <div className="bg-[#111] p-4">
          <p className="text-[#F5F0E8]/40 text-[10px] font-black uppercase tracking-widest mb-1.5">Expected Yield</p>
          <p className="text-sm font-bold text-[#F5F0E8]">{estimatedYield} quintals</p>
        </div>
      </div>

      {/* AI Advisory */}
      <div className="px-5 py-4 flex gap-3 items-start bg-earth-elevated/30">
        <span className="text-[#C9A84C] mt-0.5">⚡</span>
        <p className="text-[#F5F0E8]/70 text-sm font-medium leading-relaxed">{advisory}</p>
      </div>
    </motion.div>
  );
};
