import React from 'react';
import { MandiPrice } from '../types/market';
import { MapPin, Calendar } from 'lucide-react';

export const MandiPriceCard: React.FC<{ item: MandiPrice }> = ({ item }) => {
  const spread = item.maxPrice - item.minPrice;
  const modalPercent = spread > 0 ? Math.min(100, Math.max(0, ((item.modalPrice - item.minPrice) / spread) * 100)) : 50;

  return (
    <div className="bg-[#171410] border border-[#2b241c] hover:border-[#e5a93c]/50 transition-all duration-200 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
      <div>
        {/* Top Header */}
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-xl font-bold text-[#faf6ee] leading-tight">{item.commodity}</h3>
            <span className="text-xs text-[#a89b88] uppercase tracking-wider">{item.variety} • {item.grade}</span>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-[#e5a93c]">₹{item.modalPrice.toLocaleString('en-IN')}</span>
            <div className="text-[10px] text-[#a89b88] uppercase font-semibold">Modal Rate / {item.arrivalUnit || 'Qtl'}</div>
          </div>
        </div>

        {/* Location Badges */}
        <div className="flex items-center gap-2 text-xs text-[#dcd2be] mb-4">
          <span className="flex items-center gap-1 bg-[#231e17] px-2.5 py-1 rounded-md border border-[#3b3225]">
            <MapPin className="h-3 w-3 text-[#e5a93c]" />
            <strong className="text-[#faf6ee]">{item.market}</strong>, {item.district}
          </span>
          <span className="flex items-center gap-1 text-[#8c806f]">
            <Calendar className="h-3 w-3" />
            {item.date}
          </span>
        </div>

        {/* Visual Price Spread Range Bar */}
        <div className="space-y-1.5 my-4 bg-[#1f1a14] p-3 rounded-xl border border-[#2b241c]">
          <div className="flex justify-between text-[11px] font-semibold">
            <span className="text-blue-400">Min: ₹{item.minPrice.toLocaleString('en-IN')}</span>
            <span className="text-emerald-400">Max: ₹{item.maxPrice.toLocaleString('en-IN')}</span>
          </div>
          <div className="relative h-2 w-full bg-[#120f0c] rounded-full overflow-visible">
            <div className="absolute inset-y-0 bg-gradient-to-r from-blue-500 via-amber-400 to-emerald-500 rounded-full w-full opacity-70" />
            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-4 w-4 bg-[#faf6ee] border-2 border-[#e5a93c] rounded-full shadow-md transition-all duration-300"
              style={{ left: `${modalPercent}%` }}
              title={`Modal Price: ₹${item.modalPrice}`}
            />
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-3 border-t border-[#2b241c] flex justify-between items-center text-xs text-[#a89b88]">
        <span>Arrivals: <strong className="text-[#faf6ee]">{item.arrivalQuantity?.toLocaleString('en-IN') ?? '—'} {item.arrivalUnit || 'Quintal'}</strong></span>
        <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-mono font-bold">KMV VERIFIED</span>
      </div>
    </div>
  );
};
