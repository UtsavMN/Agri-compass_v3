import { useState, useEffect } from 'react';
import { apiGet } from '@/lib/httpClient';
import Layout from '@/components/Layout';
import { useDistrict } from '@/store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Sprout, TrendingUp, Search, BarChart3, Leaf, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { ScrollReveal, FadeIn, StaggerContainer, StaggerItem } from '@/components/ui/animations';
import { EmptyState } from '@/components/ui/EmptyState';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { CropCardShimmer, TableShimmer } from '@/components/ui/loading-shimmer';

interface CropEconomic {
  id: number;
  name: string;
  season: string;
  durationDays: number;
  investmentPerAcre: number;
  yieldQuintal: number;
  marketPrice: number;
  expectedReturn: number;
  profitMargin: number;
}

interface MandiRecord {
  state: string;
  district: string;
  market: string;
  commodity: string;
  variety: string;
  arrival_date: string;
  min_price: string;
  max_price: string;
  modal_price: string;
}

export default function MarketPrices() {
  const { toast } = useToast();
  const [economics, setEconomics] = useState<CropEconomic[]>([]);
  const [mandiPrices, setMandiPrices] = useState<MandiRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [mandiLoading, setMandiLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [seasonFilter, setSeasonFilter] = useState('all');
  const [selectedCommodity, setSelectedCommodity] = useState('Tomato');
  const { selectedDistrict: globalDistrict, setSelectedDistrict: setGlobalDistrict } = useDistrict();
  const [selectedDistrict, setSelectedDistrict] = useState('all');

  useEffect(() => {
    if (globalDistrict) {
      setSelectedDistrict(globalDistrict);
    }
  }, [globalDistrict]);

  const handleDistrictChange = (value: string) => {
    setSelectedDistrict(value);
    if (value !== 'all') {
      setGlobalDistrict(value);
    }
  };
  const [viewMode, setViewMode] = useState<'economics' | 'live'>('economics');

  const commodities = [
    'Tomato', 'Onion', 'Potato', 'Rice', 'Wheat', 'Maize', 'Cotton',
    'Groundnut', 'Soyabean', 'Ragi', 'Jowar', 'Chilli', 'Turmeric',
    'Coconut', 'Arecanut', 'Banana', 'Mango', 'Grapes', 'Pomegranate'
  ];

  const districts = [
    { value: 'all', label: 'All Districts' },
    { value: 'Bagalkot', label: 'Bagalkot' },
    { value: 'Ballari', label: 'Ballari' },
    { value: 'Belagavi', label: 'Belagavi' },
    { value: 'Bengaluru Rural', label: 'Bengaluru Rural' },
    { value: 'Bengaluru Urban', label: 'Bengaluru Urban' },
    { value: 'Bidar', label: 'Bidar' },
    { value: 'Chamarajanagar', label: 'Chamarajanagar' },
    { value: 'Chikkaballapura', label: 'Chikkaballapura' },
    { value: 'Chikkamagaluru', label: 'Chikkamagaluru' },
    { value: 'Chitradurga', label: 'Chitradurga' },
    { value: 'Dakshina Kannada', label: 'Dakshina Kannada' },
    { value: 'Davangere', label: 'Davangere' },
    { value: 'Dharwad', label: 'Dharwad' },
    { value: 'Gadag', label: 'Gadag' },
    { value: 'Hassan', label: 'Hassan' },
    { value: 'Haveri', label: 'Haveri' },
    { value: 'Kalaburagi', label: 'Kalaburagi' },
    { value: 'Kodagu', label: 'Kodagu' },
    { value: 'Kolar', label: 'Kolar' },
    { value: 'Koppal', label: 'Koppal' },
    { value: 'Mandya', label: 'Mandya' },
    { value: 'Mysuru', label: 'Mysuru' },
    { value: 'Raichur', label: 'Raichur' },
    { value: 'Ramanagara', label: 'Ramanagara' },
    { value: 'Shivamogga', label: 'Shivamogga' },
    { value: 'Tumakuru', label: 'Tumakuru' },
    { value: 'Udupi', label: 'Udupi' },
    { value: 'Uttara Kannada', label: 'Uttara Kannada' },
    { value: 'Vijayapura', label: 'Vijayapura' },
    { value: 'Yadgir', label: 'Yadgir' }
  ];

  useEffect(() => {
    loadEconomics();
  }, []);

  useEffect(() => {
    if (viewMode === 'live') {
      loadMandiPrices();
    }
  }, [selectedCommodity, selectedDistrict, viewMode]);

  const loadEconomics = async () => {
    try {
      setLoading(true);
      const data = await apiGet('/api/economics/all');
      setEconomics(data || []);
    } catch (error) {
      toast({ title: 'Error loading crop economics', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const loadMandiPrices = async () => {
    setMandiLoading(true);
    try {
      const districtQuery = selectedDistrict === 'all' ? '' : `&district=${encodeURIComponent(selectedDistrict)}`;
      const data = await apiGet(`/api/market-prices/live?commodity=${selectedCommodity}&state=Karnataka${districtQuery}&limit=20`);
      setMandiPrices(data?.records || []);
    } catch (error) {
      toast({ title: 'Error loading live prices', variant: 'destructive' });
    } finally {
      setMandiLoading(false);
    }
  };

  const formatINR = (val: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  const filtered = economics
    .filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter(c => seasonFilter === 'all' || c.season?.toLowerCase().includes(seasonFilter.toLowerCase()));

  const chartData = filtered.slice(0, 12).map(c => ({
    name: c.name.length > 8 ? c.name.slice(0, 8) + '…' : c.name,
    profit: c.profitMargin,
    investment: c.investmentPerAcre,
  }));

  return (
    <Layout>
      <div className="space-y-8 pb-12">
        {/* Header */}
        <ScrollReveal>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-earth-border/40">
            <div>
              <h1 className="text-4xl font-black text-gold-100 tracking-tight leading-none mb-2">
                Market Prices & Economics
              </h1>
              <p className="text-gold-100/50 text-sm">
                Live market prices from government mandis and localized production cost analysis.
              </p>
            </div>
            
            {/* View Toggle */}
            <div className="flex bg-earth-elevated/40 p-1.5 rounded-2xl border border-earth-border w-fit">
              <button
                onClick={() => setViewMode('economics')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${
                  viewMode === 'economics' 
                    ? 'bg-gold-400 text-earth-main shadow-lg font-bold' 
                    : 'text-gold-100/60 hover:text-gold-100'
                }`}
              >
                <Sprout className="h-4 w-4" /> Economics
              </button>
              <button
                onClick={() => setViewMode('live')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${
                  viewMode === 'live' 
                    ? 'bg-gold-400 text-earth-main shadow-lg font-bold' 
                    : 'text-gold-100/60 hover:text-gold-100'
                }`}
              >
                <TrendingUp className="h-4 w-4" /> Live Mandis
              </button>
            </div>
          </div>
        </ScrollReveal>

        {viewMode === 'economics' ? (
          <>
            {/* Filters */}
            <ScrollReveal delay={0.1}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-earth-elevated/20 p-6 rounded-3xl border border-earth-border/40">
                <div className="relative md:col-span-2">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gold-400/40" />
                  <Input
                    placeholder="Search crop economics..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 bg-earth-main border-earth-border text-gold-100 focus:border-gold-400 h-12 rounded-xl text-sm"
                  />
                </div>
                <Select value={seasonFilter} onValueChange={setSeasonFilter}>
                  <SelectTrigger className="bg-earth-main border-earth-border text-gold-100 focus:border-gold-400 h-12 rounded-xl text-sm">
                    <SelectValue placeholder="Filter by Season" />
                  </SelectTrigger>
                  <SelectContent className="bg-earth-card border-earth-border text-gold-100">
                    <SelectItem value="all">All Seasons</SelectItem>
                    <SelectItem value="kharif">Kharif</SelectItem>
                    <SelectItem value="rabi">Rabi</SelectItem>
                    <SelectItem value="zaid">Zaid/Summer</SelectItem>
                    <SelectItem value="year-round">Year-Round</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </ScrollReveal>

            {/* Profit Chart */}
            <ScrollReveal delay={0.2}>
              <Card className="card-premium">
                <CardHeader>
                  <CardTitle className="text-lg text-gold-100 font-black tracking-tight flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-gold-400" /> Yield Profitability vs Investment (₹/Acre)
                  </CardTitle>
                  <CardDescription className="text-gold-100/40">Comparing input costs directly against projected returns per acre</CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} barGap={6}>
                        <CartesianGrid stroke="#1e1e18" strokeDasharray="3 3" />
                        <XAxis dataKey="name" stroke="#68685e" tick={{ fontSize: 10, fill: '#b5b5ad' }} />
                        <YAxis stroke="#68685e" tick={{ fontSize: 10, fill: '#b5b5ad' }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1a1a14', borderColor: '#333324', borderRadius: '12px' }}
                          labelStyle={{ color: '#BA7517', fontWeight: 'bold' }}
                          formatter={(value: number) => [formatINR(value)]} 
                        />
                        <Bar dataKey="investment" name="Investment" fill="#BA7517" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="profit" name="Net Profit" radius={[4, 4, 0, 0]}>
                          {chartData.map((entry, i) => (
                            <Cell key={i} fill={entry.profit > 0 ? '#10b981' : '#ef4444'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </ScrollReveal>

            {/* Crop Cards */}
            {loading ? (
              <CropCardShimmer count={3} />
            ) : filtered.length === 0 ? (
              <EmptyState
                icon={Leaf}
                title="No Economics Found"
                description="No crop economics matched your search term. Try adjusting your keyword."
                action={{
                  label: "Clear Search",
                  onClick: () => setSearchTerm('')
                }}
              />
            ) : (
              <ScrollReveal delay={0.3}>
                <StaggerContainer staggerDelay={0.05}>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filtered.map((crop) => (
                      <StaggerItem key={crop.id}>
                        <Card className="card-premium h-full flex flex-col justify-between group hover:border-gold-400/30 transition-all duration-300">
                          <CardHeader className="pb-3">
                            <div className="flex justify-between items-start gap-4">
                              <div>
                                <CardTitle className="text-lg text-gold-100 font-bold flex items-center gap-2 group-hover:text-gold-400 transition-colors">
                                  <Leaf className="h-4 w-4 text-gold-400 flex-shrink-0" />
                                  {crop.name}
                                </CardTitle>
                                <CardDescription className="text-[10px] text-gold-100/40 uppercase tracking-wider mt-1">
                                  {crop.season} Cycle • {crop.durationDays > 0 ? `${crop.durationDays} Days` : 'Perennial'}
                                </CardDescription>
                              </div>
                              <Badge
                                className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                                  crop.profitMargin > 50000 
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                    : crop.profitMargin > 0 
                                    ? 'bg-gold-400/10 text-gold-400 border border-gold-400/20' 
                                    : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                }`}
                              >
                                {crop.profitMargin > 50000 ? 'High Profit' : crop.profitMargin > 0 ? 'Moderate' : 'Low margin'}
                              </Badge>
                            </div>
                          </CardHeader>
                          
                          <CardContent className="space-y-4 pt-0">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="bg-earth-elevated/40 rounded-2xl p-4 border border-earth-border/40 text-center">
                                <p className="text-[10px] text-gold-100/30 font-black uppercase tracking-wider">Input Cost</p>
                                <p className="text-base font-black text-gold-100 mt-1">{formatINR(crop.investmentPerAcre)}</p>
                              </div>
                              <div className="bg-gold-400/5 rounded-2xl p-4 border border-gold-400/10 text-center">
                                <p className="text-[10px] text-gold-400 font-black uppercase tracking-wider">Gross Return</p>
                                <p className="text-base font-black text-gold-100 mt-1">{formatINR(crop.expectedReturn)}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between bg-earth-main/55 rounded-2xl p-4 border border-earth-border/60">
                              <div className="text-center flex-1">
                                <p className="text-[10px] text-gold-100/30 font-black uppercase">Avg Yield</p>
                                <p className="text-xs font-bold text-gold-100 mt-0.5">{crop.yieldQuintal} q/acre</p>
                              </div>
                              <div className="h-8 w-px bg-earth-border/80"></div>
                              <div className="text-center flex-1">
                                <p className="text-[10px] text-gold-100/30 font-black uppercase">Mandi MSP</p>
                                <p className="text-xs font-bold text-gold-100 mt-0.5">{formatINR(crop.marketPrice)}/q</p>
                              </div>
                              <div className="h-8 w-px bg-earth-border/80"></div>
                              <div className="text-center flex-1">
                                <p className="text-[10px] text-gold-100/30 font-black uppercase">Est. Profit</p>
                                <p className={`text-xs font-black mt-0.5 flex items-center justify-center gap-0.5 ${crop.profitMargin > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                  {crop.profitMargin > 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                                  {formatINR(Math.abs(crop.profitMargin))}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </StaggerItem>
                    ))}
                  </div>
                </StaggerContainer>
              </ScrollReveal>
            )}
          </>
        ) : (
          /* Live Mandi Prices */
          <>
            {/* Filters */}
            <ScrollReveal delay={0.1}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 bg-earth-elevated/20 p-6 rounded-3xl border border-earth-border/40 items-center">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-gold-100/40 uppercase font-black tracking-widest block">Commodity</label>
                  <Select value={selectedCommodity} onValueChange={setSelectedCommodity}>
                    <SelectTrigger className="bg-earth-main border-earth-border text-gold-100 focus:border-gold-400 h-12 rounded-xl text-sm">
                      <SelectValue placeholder="Select commodity" />
                    </SelectTrigger>
                    <SelectContent className="bg-earth-card border-earth-border text-gold-100">
                      {commodities.map(c => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-gold-100/40 uppercase font-black tracking-widest block">District</label>
                  <Select value={selectedDistrict} onValueChange={handleDistrictChange}>
                    <SelectTrigger className="bg-earth-main border-earth-border text-gold-100 focus:border-gold-400 h-12 rounded-xl text-sm">
                      <SelectValue placeholder="All Districts" />
                    </SelectTrigger>
                    <SelectContent className="bg-earth-card border-earth-border text-gold-100">
                      {districts.map(d => (
                        <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="lg:pt-6 flex justify-end">
                  <Badge variant="outline" className="text-[10px] font-black uppercase border-gold-400/20 text-gold-400 bg-gold-400/5 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                    <TrendingUp className="h-3 w-3" /> Source: data.gov.in Live API
                  </Badge>
                </div>
              </div>
            </ScrollReveal>

            {mandiLoading ? (
              <TableShimmer rows={6} />
            ) : mandiPrices.length === 0 ? (
              <EmptyState
                icon={TrendingUp}
                title="No Mandi Records"
                description={`No arrivals reported for ${selectedCommodity} in Karnataka recently.`}
              />
            ) : (
              <ScrollReveal delay={0.2}>
                <div className="overflow-x-auto rounded-2xl border border-earth-border bg-earth-card">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-earth-elevated/40 border-b border-earth-border">
                        <th className="text-left p-4 font-black uppercase tracking-widest text-[10px] text-gold-400">Market</th>
                        <th className="text-left p-4 font-black uppercase tracking-widest text-[10px] text-gold-400">District</th>
                        <th className="text-left p-4 font-black uppercase tracking-widest text-[10px] text-gold-400">Variety</th>
                        <th className="text-right p-4 font-black uppercase tracking-widest text-[10px] text-gold-400">Min Price</th>
                        <th className="text-right p-4 font-black uppercase tracking-widest text-[10px] text-gold-400">Max Price</th>
                        <th className="text-right p-4 font-black uppercase tracking-widest text-[10px] text-gold-400">Modal Price</th>
                        <th className="text-left p-4 font-black uppercase tracking-widest text-[10px] text-gold-400">Arrival Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-earth-border/60">
                      {mandiPrices.map((rec, i) => (
                        <tr key={i} className="hover:bg-earth-elevated/10 transition-colors">
                          <td className="p-4 font-bold text-gold-100">{rec.market}</td>
                          <td className="p-4 text-gold-100/70">{rec.district}</td>
                          <td className="p-4 text-gold-100/60 font-medium italic">
                            {!rec.variety || rec.variety.toLowerCase() === 'unknown' ? '-' : `"${rec.variety}"`}
                          </td>
                          <td className="p-4 text-right font-mono text-gold-100/80">{formatINR(Number(rec.min_price))}</td>
                          <td className="p-4 text-right font-mono text-gold-100/80">{formatINR(Number(rec.max_price))}</td>
                          <td className="p-4 text-right font-mono font-black text-gold-400">{formatINR(Number(rec.modal_price))}</td>
                          <td className="p-4 text-gold-100/40 text-xs">{rec.arrival_date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </ScrollReveal>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
