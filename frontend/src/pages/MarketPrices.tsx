import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  fetchMarketPrices,
  fetchSummary,
  fetchStatus,
  fetchDistricts,
  fetchCommodities,
  syncLiveFeed,
} from '../services/api';
import { MandiPrice, MandiSummary, MandiStatus } from '../types/market';
import { MandiPriceCard } from '../components/MandiPriceCard';
import { MandiPriceTable } from '../components/MandiPriceTable';
import { MandiComparisonChart } from '../components/MandiComparisonChart';
import {
  Search,
  Filter,
  RefreshCw,
  TrendingUp,
  Store,
  Layers,
  Calendar,
  LayoutGrid,
  Table as TableIcon,
  AlertTriangle,
  MapPin,
} from 'lucide-react';

export const MarketPrices: React.FC = () => {
  const [prices, setPrices] = useState<MandiPrice[]>([]);
  const [summary, setSummary] = useState<MandiSummary | null>(null);
  const [status, setStatus] = useState<MandiStatus | null>(null);
  const [districts, setDistricts] = useState<string[]>([]);
  const [commodities, setCommodities] = useState<string[]>([]);

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('all');
  const [selectedCommodity, setSelectedCommodity] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);

  const isSyncingRef = useRef(false);

  const handleLiveSync = async (targetDate?: string) => {
    if (isSyncingRef.current) return;
    isSyncingRef.current = true;
    try {
      setSyncing(true);
      setSyncNotice(null);
      const res = await syncLiveFeed(targetDate);
      if (res.hasNewData) {
        setSyncNotice(`Live update received: Ingested latest prices for ${res.targetDate}.`);
      } else {
        setSyncNotice(res.message || `Krishi Marata Vahini verified: No new reports published yet for ${res.targetDate}. Retaining latest active prices.`);
      }
      await loadData();
    } catch (err: any) {
      setSyncNotice(`Live fetch notice: ${err?.message || 'Up to date'}`);
    } finally {
      setSyncing(false);
      isSyncingRef.current = false;
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [pricesRes, summaryRes, statusRes, distRes, commRes] = await Promise.all([
        fetchMarketPrices({
          district: selectedDistrict !== 'all' ? selectedDistrict : undefined,
          commodity: selectedCommodity !== 'all' ? selectedCommodity : undefined,
          limit: 1000,
        }),
        fetchSummary(),
        fetchStatus(),
        fetchDistricts(),
        fetchCommodities(),
      ]);

      setPrices(pricesRes.prices);
      setSummary(summaryRes);
      setStatus(statusRes);
      setDistricts(distRes);
      setCommodities(commRes);
    } catch (err: any) {
      console.error('Data load error:', err);
      setError(err?.message || 'Failed to communicate with Krishi Mandi backend service.');
    } finally {
      setLoading(false);
    }
  };

  // Load data when filters change
  useEffect(() => {
    loadData();
  }, [selectedDistrict, selectedCommodity]);

  // Automatically fetch recent prices from KMV when user opens the project
  useEffect(() => {
    handleLiveSync();
  }, []);

  // Auto-dismiss sync notice after 8 seconds
  useEffect(() => {
    if (syncNotice) {
      const timer = setTimeout(() => setSyncNotice(null), 8000);
      return () => clearTimeout(timer);
    }
  }, [syncNotice]);

  // Client-side text search on top of backend filtered records
  const filteredPrices = useMemo(() => {
    if (!searchQuery.trim()) return prices;
    const q = searchQuery.toLowerCase();
    return prices.filter(
      p =>
        p.commodity.toLowerCase().includes(q) ||
        p.market.toLowerCase().includes(q) ||
        p.district.toLowerCase().includes(q) ||
        p.variety.toLowerCase().includes(q)
    );
  }, [prices, searchQuery]);

  // Determine active crop for comparison chart
  const activeCropForChart = useMemo(() => {
    if (selectedCommodity !== 'all') return selectedCommodity;
    if (filteredPrices.length > 0) return filteredPrices[0].commodity;
    return '';
  }, [selectedCommodity, filteredPrices]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 min-h-screen">
      {/* Top Header & Refresh */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#2b241c] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-[#e5a93c]/10 text-[#e5a93c] border border-[#e5a93c]/20 text-xs px-2.5 py-0.5 rounded font-mono font-semibold">
              KRISHI MANDI ENGINE v1.0
            </span>
            <span className="text-xs text-[#a89b88] flex items-center gap-1">
              <MapPin className="h-3 w-3 text-[#e5a93c]" /> Karnataka APMC Network
            </span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-[#faf6ee]">
            Mandi Price Intelligence
          </h1>
          <p className="text-sm text-[#a89b88] mt-1">
            Verified spot market rates, arrivals, and price spreads from Karnataka Krishi Marata Vahini.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
          {syncing ? (
            <div className="flex items-center gap-2 bg-[#e5a93c]/10 text-[#e5a93c] border border-[#e5a93c]/30 px-3.5 py-2 rounded-xl text-xs font-semibold">
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              <span>Fetching Latest KMV Rates...</span>
            </div>
          ) : (
            <button
              onClick={() => handleLiveSync()}
              className="flex items-center gap-2 bg-[#1f1a14] hover:bg-[#28221a] text-[#faf6ee] border border-[#2b241c] hover:border-[#e5a93c]/40 px-3.5 py-2 rounded-xl text-xs font-medium transition-all shadow-sm cursor-pointer"
              title="Click to fetch live prices from Krishi Marata Vahini"
            >
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Auto-Fetched from KMV</span>
              <RefreshCw className="h-3 w-3 text-[#a89b88] ml-1" />
            </button>
          )}
        </div>
      </div>

      {/* Sync Notification Banner */}
      {syncNotice && (
        <div className="bg-[#1f1a14] border border-[#e5a93c]/40 text-[#faf6ee] rounded-xl p-3.5 flex items-center justify-between gap-3 text-xs shadow-md">
          <div className="flex items-center gap-2.5">
            <TrendingUp className="h-4 w-4 text-[#e5a93c] flex-shrink-0" />
            <span>{syncNotice}</span>
          </div>
          <button
            onClick={() => setSyncNotice(null)}
            className="text-[#8c806f] hover:text-[#faf6ee] px-2 py-0.5 rounded font-mono text-sm"
          >
            ✕
          </button>
        </div>
      )}

      {/* Provenance & Freshness Status Banner */}
      {status && (
        <div className="bg-[#171410] border border-[#2b241c] rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            {(status.recordsReceived ?? 0) > 50 ? (
              <span className="flex items-center gap-1.5 text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20 font-semibold font-mono text-[11px]">
                <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                {`Official KMV Statewide Feed (${status.validRecords || status.recordsReceived} live quotes)`}
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20 font-semibold font-mono text-[11px]">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                {status.coverageMessage || "Local dataset validated — coverage unverified"}
              </span>
            )}
            <span className="text-[#a89b88]">
              Source: <strong className="text-[#faf6ee]">{status.source}</strong> {(status.recordsReceived ?? 0) > 50 ? "(Official Live Crawl)" : "(Development Fixture)"}
            </span>
            {status.reportDate && (
              <span className="text-[#a89b88]">
                Report Date: <strong className="text-[#faf6ee]">{status.reportDate}</strong>
              </span>
            )}
          </div>
          <div className="text-[#8c806f] font-mono text-[11px]">
            Ingestion Processed: {status.lastSuccessfulIngestionTime ? new Date(status.lastSuccessfulIngestionTime).toLocaleTimeString('en-IN') : 'Latest Verified'}
          </div>
        </div>
      )}

      {/* Summary KPI Grid */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="bg-[#171410] border border-[#2b241c] p-4 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 text-xs text-[#a89b88] mb-1">
              <Layers className="h-3.5 w-3.5 text-[#e5a93c]" /> Total Quotes
            </div>
            <div className="text-2xl font-black text-[#faf6ee]">{summary.totalRecords.toLocaleString('en-IN')}</div>
          </div>
          <div className="bg-[#171410] border border-[#2b241c] p-4 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 text-xs text-[#a89b88] mb-1">
              <Store className="h-3.5 w-3.5 text-[#e5a93c]" /> APMC Mandis
            </div>
            <div className="text-2xl font-black text-[#faf6ee]">{summary.totalMandis}</div>
          </div>
          <div className="bg-[#171410] border border-[#2b241c] p-4 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 text-xs text-[#a89b88] mb-1">
              <TrendingUp className="h-3.5 w-3.5 text-[#e5a93c]" /> Commodities
            </div>
            <div className="text-2xl font-black text-[#faf6ee]">{summary.totalCommodities}</div>
          </div>
          <div className="bg-[#171410] border border-[#2b241c] p-4 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 text-xs text-[#a89b88] mb-1">
              <MapPin className="h-3.5 w-3.5 text-[#e5a93c]" /> Districts
            </div>
            <div className="text-2xl font-black text-[#faf6ee]">{summary.totalDistricts}</div>
          </div>
          <div className="bg-[#171410] border border-[#2b241c] p-4 rounded-2xl shadow-sm col-span-2 sm:col-span-1">
            <div className="flex items-center gap-2 text-xs text-[#a89b88] mb-1">
              <Calendar className="h-3.5 w-3.5 text-[#e5a93c]" /> Latest Date
            </div>
            <div className="text-xl font-black text-[#e5a93c]">{summary.latestReportDate || '—'}</div>
          </div>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="bg-[#171410] border border-[#2b241c] p-5 rounded-2xl shadow-md space-y-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8c806f]" />
            <input
              type="text"
              placeholder="Search by commodity, market, or district..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1f1a14] border border-[#2b241c] focus:border-[#e5a93c] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#faf6ee] placeholder-[#8c806f] focus:outline-none transition-colors"
            />
          </div>

          {/* Select Dropdowns & View Mode Toggle */}
          <div className="flex flex-wrap items-center gap-3">
            {/* District Filter */}
            <div className="flex items-center gap-1.5 bg-[#1f1a14] border border-[#2b241c] rounded-xl px-3 py-2 text-xs text-[#dcd2be]">
              <Filter className="h-3.5 w-3.5 text-[#e5a93c]" />
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="bg-transparent text-[#faf6ee] focus:outline-none cursor-pointer"
              >
                <option value="all" className="bg-[#1f1a14]">All Districts</option>
                {districts.map((d) => (
                  <option key={d} value={d} className="bg-[#1f1a14]">{d}</option>
                ))}
              </select>
            </div>

            {/* Commodity Filter */}
            <div className="flex items-center gap-1.5 bg-[#1f1a14] border border-[#2b241c] rounded-xl px-3 py-2 text-xs text-[#dcd2be]">
              <select
                value={selectedCommodity}
                onChange={(e) => setSelectedCommodity(e.target.value)}
                className="bg-transparent text-[#faf6ee] focus:outline-none cursor-pointer"
              >
                <option value="all" className="bg-[#1f1a14]">All Commodities</option>
                {commodities.map((c) => (
                  <option key={c} value={c} className="bg-[#1f1a14]">{c}</option>
                ))}
              </select>
            </div>

            {/* View Switcher */}
            <div className="flex items-center bg-[#1f1a14] border border-[#2b241c] rounded-xl p-1 gap-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-[#2b241c] text-[#e5a93c]' : 'text-[#8c806f] hover:text-[#faf6ee]'
                }`}
                title="Card Grid View"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'table' ? 'bg-[#2b241c] text-[#e5a93c]' : 'text-[#8c806f] hover:text-[#faf6ee]'
                }`}
                title="Table View"
              >
                <TableIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Chart */}
      {activeCropForChart && (
        <MandiComparisonChart records={filteredPrices} selectedCrop={activeCropForChart} />
      )}

      {/* Content Rendering: Loading / Error / Data */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <RefreshCw className="h-8 w-8 text-[#e5a93c] animate-spin mx-auto" />
          <p className="text-sm text-[#a89b88]">Connecting to Krishi Mandi backend...</p>
        </div>
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-6 rounded-2xl text-center space-y-2">
          <AlertTriangle className="h-6 w-6 mx-auto" />
          <p className="font-bold">{error}</p>
          <p className="text-xs text-red-300">Ensure the Spring Boot backend is reachable or check network connectivity.</p>
        </div>
      ) : filteredPrices.length === 0 ? (
        <div className="bg-[#171410] border border-[#2b241c] rounded-2xl p-12 text-center text-[#8c806f] space-y-2">
          <p className="text-base text-[#faf6ee] font-semibold">No price quotes found</p>
          <p className="text-xs text-[#a89b88]">Try changing your search term or selecting "All Districts / All Commodities".</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPrices.map((item) => (
            <MandiPriceCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <MandiPriceTable records={filteredPrices} />
      )}
    </div>
  );
};

export default MarketPrices;
