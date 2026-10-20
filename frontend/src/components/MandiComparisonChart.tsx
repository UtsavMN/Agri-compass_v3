import React, { useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';
import { MandiPrice } from '../types/market';
import { Store, Info } from 'lucide-react';

interface MandiComparisonChartProps {
  records: MandiPrice[];
  selectedCrop: string;
}

export const MandiComparisonChart: React.FC<MandiComparisonChartProps> = ({ records, selectedCrop }) => {
  // 1. Filter records by commodity
  const cropRecords = useMemo(() => {
    return records.filter(r => r.commodity.toLowerCase() === selectedCrop.toLowerCase());
  }, [records, selectedCrop]);

  // 2. Identify the dominant unit and latest report date to enforce unit and date comparability
  const { comparableRecords, activeDate, activeUnit } = useMemo(() => {
    if (cropRecords.length === 0) {
      return { comparableRecords: [], activeDate: '', activeUnit: '' };
    }

    // Find the latest report date among records for this crop
    const latestDate = cropRecords.reduce((max, r) => (r.date > max ? r.date : max), cropRecords[0].date);

    // Filter only records that match this latest date
    const dateFiltered = cropRecords.filter(r => r.date === latestDate);

    // Identify the dominant unit among date-matched records
    const unitCounts: Record<string, number> = {};
    for (const r of dateFiltered) {
      const u = r.priceUnit || 'Rs/Quintal';
      unitCounts[u] = (unitCounts[u] || 0) + 1;
    }
    const dominantUnit = Object.entries(unitCounts).sort((a, b) => b[1] - a[1])[0][0];

    // Filter for unit-compatible records
    const unitAndDateMatched = dateFiltered.filter(r => (r.priceUnit || 'Rs/Quintal') === dominantUnit);

    return {
      comparableRecords: unitAndDateMatched,
      activeDate: latestDate,
      activeUnit: dominantUnit,
    };
  }, [cropRecords]);

  // Case A: No records found for the selected commodity
  if (cropRecords.length === 0) {
    return null;
  }

  // Case B: Exactly ONE market is reporting for this commodity
  if (comparableRecords.length === 1) {
    const single = comparableRecords[0];
    return (
      <div className="bg-[#171410] border border-[#2b241c] rounded-2xl p-6 shadow-xl my-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-start mb-4 gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs bg-[#231e17] text-[#e5a93c] border border-[#3b3225] px-2.5 py-0.5 rounded font-mono font-semibold">
                SINGLE MARKET OBSERVATION
              </span>
              <span className="text-xs text-[#8c806f]">Date: {single.date}</span>
            </div>
            <h3 className="text-lg font-bold text-[#faf6ee]">
              Market Observation: <span className="text-[#e5a93c]">{selectedCrop}</span>
            </h3>
            <p className="text-xs text-[#a89b88] mt-0.5">
              Only 1 APMC yard is currently represented in the local dataset for this crop. Multi-market comparison is unavailable.
            </p>
          </div>
        </div>

        {/* Single Market Spotlight Box */}
        <div className="bg-[#1f1a14] border border-[#2b241c] rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm font-bold text-[#faf6ee]">
              <Store className="h-4 w-4 text-[#e5a93c]" />
              {single.market} APMC
              <span className="text-xs font-normal text-[#a89b88]">({single.district} District)</span>
            </div>
            <div className="text-xs text-[#8c806f]">
              Variety: <strong className="text-[#dcd2be]">{single.variety}</strong> • Grade: <strong className="text-[#dcd2be]">{single.grade}</strong>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
            <div className="bg-[#171410] px-3 py-2 rounded-lg border border-[#2b241c]">
              <span className="text-[#8c806f] block text-[10px]">MIN RATE</span>
              <span className="text-blue-400 font-bold">₹{single.minPrice.toLocaleString('en-IN')}</span>
            </div>
            <div className="bg-[#231e17] px-4 py-2 rounded-lg border border-[#3b3225]">
              <span className="text-[#e5a93c] block text-[10px] font-bold">MODAL RATE</span>
              <span className="text-2xl font-black text-[#e5a93c]">₹{single.modalPrice.toLocaleString('en-IN')}</span>
            </div>
            <div className="bg-[#171410] px-3 py-2 rounded-lg border border-[#2b241c]">
              <span className="text-[#8c806f] block text-[10px]">MAX RATE</span>
              <span className="text-emerald-400 font-bold">₹{single.maxPrice.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 text-xs text-[#8c806f]">
          <Info className="h-4 w-4 text-[#e5a93c] flex-shrink-0" />
          <span>
            To view an inter-mandi price spread chart, at least two APMC markets must have reporting quotes for {selectedCrop} on the same observation date ({single.date}).
          </span>
        </div>
      </div>
    );
  }

  // Case C: MULTIPLE (2+) markets reporting — Render inter-mandi comparison chart
  const chartData = comparableRecords.slice(0, 12).map(r => ({
    market: r.market,
    district: r.district,
    modalPrice: r.modalPrice,
    minPrice: r.minPrice,
    maxPrice: r.maxPrice,
  }));

  return (
    <div className="bg-[#171410] border border-[#2b241c] rounded-2xl p-6 shadow-xl my-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs bg-[#231e17] text-[#e5a93c] border border-[#3b3225] px-2.5 py-0.5 rounded font-mono font-semibold">
              INTER-MANDI COMPARISON ({chartData.length} MARKETS)
            </span>
            <span className="text-xs text-[#8c806f]">Date: {activeDate}</span>
          </div>
          <h3 className="text-lg font-bold text-[#faf6ee]">
            Cross-Mandi Modal Price Spread: <span className="text-[#e5a93c]">{selectedCrop}</span>
          </h3>
          <p className="text-xs text-[#a89b88]">
            Comparing modal transaction rates ({activeUnit}) across reporting APMC yards in Karnataka.
          </p>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 25 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2b241c" vertical={false} />
            <XAxis dataKey="market" stroke="#8c806f" fontSize={11} tickLine={false} interval={0} angle={-15} textAnchor="end" />
            <YAxis stroke="#8c806f" fontSize={11} tickLine={false} tickFormatter={(v) => `₹${v}`} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1f1a14', borderColor: '#3b3225', borderRadius: '12px', color: '#faf6ee' }}
              formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Modal Price']}
              labelFormatter={(label, payload) => {
                const item = payload && payload[0] && payload[0].payload;
                return item ? `${label} APMC (${item.district})` : `${label} APMC`;
              }}
            />
            <Bar dataKey="modalPrice" radius={[6, 6, 0, 0]}>
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={index === 0 ? '#e5a93c' : '#c9922e'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-[#8c806f] pt-3 border-t border-[#2b241c]">
        <span>Only compatible quotes matching unit ({activeUnit}) and observation date ({activeDate}) are compared.</span>
        <span className="font-mono text-[10px] text-[#e5a93c]">PARITY AUDITED</span>
      </div>
    </div>
  );
};
