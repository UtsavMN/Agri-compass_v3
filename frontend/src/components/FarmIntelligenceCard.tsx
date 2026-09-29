import { motion, AnimatePresence } from "framer-motion";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { useEffect, useState } from "react";
import { apiGet } from "@/lib/httpClient";
import { History } from "lucide-react";

interface FarmIntelligenceProps {
  farmId?: string;
  farmName: string;
  acres: number;
  district: string;
  crop?: string;
  npk?: { n: number; p: number; k: number };
  latestSoilHealth?: string;
}

export const FarmIntelligenceCard = ({ farmId, farmName, acres, district, crop, npk, latestSoilHealth }: FarmIntelligenceProps) => {
  const [marketPrice, setMarketPrice] = useState<number | null>(null);
  const [advisory, setAdvisory] = useState("Fetching AI advisory...");
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

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

  const npkStatus = latestSoilHealth || (npk
    ? npk.n < 30 ? "Low Nitrogen" : npk.p < 25 ? "Low Phosphorus" : npk.k < 20 ? "Low Potassium" : "Healthy"
    : "Not analysed");

  const openHistory = async () => {
    if (!farmId) return;
    const data = await apiGet(`/api/farms/${farmId}/diagnostics`);
    setHistory(data || []);
    setShowHistory(true);
  };

  return (
    <>
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
            <p className="text-[#F5F0E8]/40 text-xs mt-0.5 font-medium tracking-wider uppercase">{acres} acres • {district}</p>
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
        <div className="bg-[#111] p-4 relative group">
          <div className="flex justify-between items-center mb-1.5">
            <p className="text-[#F5F0E8]/40 text-[10px] font-black uppercase tracking-widest">Soil Health</p>
            {farmId && (
              <button onClick={openHistory} className="text-[10px] text-[#C9A84C] hover:underline flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <History size={10} /> History
              </button>
            )}
          </div>
          <p className={`text-sm font-bold ${
            npkStatus.includes("Excellent") || npkStatus === "Healthy" ? "text-green-400" : (npkStatus === "Not analysed" ? "text-yellow-500" : "text-yellow-400")
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
      {showHistory && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#1a1a1a] border border-[#333] rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-[#f0ece0] flex items-center gap-2">
                <History className="text-[#c49a2a]" /> Soil Diagnostics History
              </h2>
              <button onClick={() => setShowHistory(false)} className="text-[#a09880] hover:text-white">?</button>
            </div>
            <div className="space-y-4">
              {history.length === 0 ? (
                <p className="text-center text-[#a09880] py-8">No past diagnostics found for this farm.</p>
              ) : (
                history.map((h, i) => (
                  <div key={i} className="bg-[#12120e] p-4 rounded-xl border border-[rgba(255,255,255,0.05)]">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-bold text-[#c49a2a]">{new Date(h.createdAt || Date.now()).toLocaleDateString()}</span>
                      <span className="text-xs px-2 py-1 rounded bg-[#222] font-semibold">{h.healthStatus || "Unknown"}</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-xs text-[#a09880] mb-3">
                      <div>N: {h.nitrogen}</div><div>P: {h.phosphorus}</div><div>K: {h.potassium}</div><div>pH: {h.ph}</div>
                    </div>
                    <p className="text-xs text-[#f0ece0] line-clamp-3 bg-black/20 p-2 rounded italic">
                      {h.aiReport ? JSON.parse(h.aiReport).soil_health_report?.soil_amendment_recommendations : "No detailed report."}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

