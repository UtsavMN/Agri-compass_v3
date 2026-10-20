import React from 'react';
import { MandiPrice } from '../types/market';

interface MandiPriceTableProps {
  records: MandiPrice[];
}

export const MandiPriceTable: React.FC<MandiPriceTableProps> = ({ records }) => {
  if (records.length === 0) {
    return (
      <div className="bg-[#171410] border border-[#2b241c] rounded-2xl p-12 text-center text-[#8c806f]">
        No mandi prices found matching the selected criteria.
      </div>
    );
  }

  return (
    <div className="bg-[#171410] border border-[#2b241c] rounded-2xl overflow-hidden shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-[#2b241c] bg-[#1a1612] text-xs uppercase tracking-wider text-[#a89b88]">
              <th className="py-3.5 px-4 font-semibold">Commodity</th>
              <th className="py-3.5 px-4 font-semibold">APMC Market</th>
              <th className="py-3.5 px-4 font-semibold">District</th>
              <th className="py-3.5 px-4 font-semibold">Variety / Grade</th>
              <th className="py-3.5 px-4 font-semibold text-right">Arrivals</th>
              <th className="py-3.5 px-4 font-semibold text-right">Min (₹)</th>
              <th className="py-3.5 px-4 font-semibold text-right">Modal (₹)</th>
              <th className="py-3.5 px-4 font-semibold text-right">Max (₹)</th>
              <th className="py-3.5 px-4 font-semibold text-center">Report Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#231e17] text-[#dcd2be]">
            {records.map((item) => (
              <tr key={item.id} className="hover:bg-[#1f1a14]/60 transition-colors">
                <td className="py-3 px-4 font-bold text-[#faf6ee]">
                  {item.commodity}
                </td>
                <td className="py-3 px-4">
                  <span className="font-medium text-[#faf6ee]">{item.market}</span>
                </td>
                <td className="py-3 px-4 text-[#a89b88]">
                  {item.district}
                </td>
                <td className="py-3 px-4 text-xs">
                  <span className="text-[#e5a93c]">{item.variety}</span>
                  <span className="text-[#8c806f] mx-1">•</span>
                  <span className="text-[#a89b88]">{item.grade}</span>
                </td>
                <td className="py-3 px-4 text-right font-mono">
                  {item.arrivalQuantity ? `${item.arrivalQuantity.toLocaleString('en-IN')} ${item.arrivalUnit || 'Qtl'}` : '—'}
                </td>
                <td className="py-3 px-4 text-right font-mono text-blue-400">
                  ₹{item.minPrice.toLocaleString('en-IN')}
                </td>
                <td className="py-3 px-4 text-right font-mono font-bold text-[#e5a93c] text-base">
                  ₹{item.modalPrice.toLocaleString('en-IN')}
                </td>
                <td className="py-3 px-4 text-right font-mono text-emerald-400">
                  ₹{item.maxPrice.toLocaleString('en-IN')}
                </td>
                <td className="py-3 px-4 text-center text-xs text-[#8c806f] font-mono">
                  {item.date}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
