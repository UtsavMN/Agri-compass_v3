import { useEffect, useState } from 'react';
import { apiGet } from '@/lib/httpClient';
import { DISTRICTS } from '@/data/masterData';
import { CropCardPremium } from '@/components/ui/crop-card-premium';

import { ScrollReveal, StaggerContainer, StaggerItem } from '@/components/ui/animations';

import { Search, Filter, Leaf, MapPin, SortAsc } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';


export default function Crops() {
  const [crops, setCrops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [seasonFilter, setSeasonFilter] = useState('all');
  const [districtFilter, setDistrictFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    loadCrops();
  }, [page, seasonFilter, districtFilter, sortBy]);

  const loadCrops = async () => {
    try {
      setLoading(true);
      
      let cropList: any[] = [];
      let calculatedTotalPages = 1;
      
      if (searchTerm) {
        cropList = await apiGet(`/api/crops/search?query=${encodeURIComponent(searchTerm)}`);
        calculatedTotalPages = 1;
      } else if (districtFilter !== 'all') {
        cropList = await apiGet(`/api/crops/district/${encodeURIComponent(districtFilter)}`);
        calculatedTotalPages = 1;
      } else if (seasonFilter !== 'all') {
        cropList = await apiGet(`/api/crops/season/${encodeURIComponent(seasonFilter)}`);
        calculatedTotalPages = 1;
      } else {
        const data = await apiGet(`/api/crops?page=${page}&size=12&sortBy=${sortBy}`);
        cropList = data.content || [];
        calculatedTotalPages = data.totalPages ?? data.total_pages ?? 1;
      }

      // Apply client-side intersection filters if both are active
      let filtered = [...cropList];
      if (districtFilter !== 'all' && seasonFilter !== 'all') {
        filtered = filtered.filter(crop => 
          crop.season && crop.season.toLowerCase().includes(seasonFilter.toLowerCase())
        );
      }
      
      setCrops(filtered);
      setTotalPages(calculatedTotalPages);
    } catch (error) {
      console.error('Error loading crops:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadCrops();
  };

  const seasons = ['Kharif', 'Rabi', 'Zaid', 'Summer', 'Pre-Monsoon', 'Year-round'];
  const districts = DISTRICTS;

  return (
    <div className="pt-24 px-4 sm:px-6 lg:px-8 pb-12 max-w-7xl mx-auto animate-fade-in">
      <div className="space-y-8 pb-12">
        <ScrollReveal direction="down">
          <div className="relative overflow-hidden rounded-3xl border border-earth-border/40 bg-earth-elevated/10 mb-6">
            {/* Subtle crop field photo strip — 200px tall */}
            <div className="absolute inset-0 h-[200px]">
              <img
                src="https://images.unsplash.com/photo-1574943320219-553eb213f72d?fit=crop&w=1600&h=200&q=60"
                className="w-full h-full object-cover opacity-25"
                alt=""
              />
              <div className="absolute inset-0 bg-gradient-to-b from-[#0f0f0b]/60 to-[#0f0f0b]" />
            </div>

            <div className="relative z-10 px-8 pt-10 pb-6">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <p className="text-[11px] text-[#c49a2a] uppercase tracking-widest mb-2 font-semibold">
                    Production-grade agricultural intelligence
                  </p>
                  <h1 className="font-serif text-4xl font-bold text-[#f0ece0] tracking-tight">
                    Crop Registry
                  </h1>
                </div>
                <span className="text-[12px] text-[#a09880] border border-[rgba(255,255,255,0.08)] bg-earth-main/50 px-4 py-1.5 rounded-full font-medium shrink-0">
                  {crops.length} crops loaded
                </span>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Search & Filters */}
        <ScrollReveal delay={0.1}>
          <div className="bg-earth-elevated/30 p-6 rounded-3xl border border-earth-border backdrop-blur-xl shadow-2xl">
            <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gold-400" />
                <Input
                  placeholder="Neural search crops..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 bg-earth-main/50 border-earth-border text-gold-100 focus:ring-gold-400/20 h-12 rounded-xl text-sm font-medium"
                />
              </div>

              <div className="flex items-center gap-3 bg-earth-main/50 px-4 rounded-xl border border-earth-border h-12">
                <MapPin className="h-4 w-4 text-gold-400 flex-shrink-0" />
                <Select value={districtFilter} onValueChange={setDistrictFilter}>
                  <SelectTrigger className="bg-transparent border-none focus:ring-0 h-full text-xs font-black text-gold-100 uppercase tracking-widest">
                    <SelectValue placeholder="DISTRICT" />
                  </SelectTrigger>
                  <SelectContent className="bg-earth-elevated border-earth-border">
                    <SelectItem value="all" className="text-gold-100 font-bold">ALL REGIONS</SelectItem>
                    {Object.keys(districts).map((d) => (
                      <SelectItem key={d} value={d} className="text-gold-100 font-bold">{d.toUpperCase()}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-3 bg-earth-main/50 px-4 rounded-xl border border-earth-border h-12">
                <Filter className="h-4 w-4 text-gold-400 flex-shrink-0" />
                <Select value={seasonFilter} onValueChange={setSeasonFilter}>
                  <SelectTrigger className="bg-transparent border-none focus:ring-0 h-full text-xs font-black text-gold-100 uppercase tracking-widest">
                    <SelectValue placeholder="SEASON" />
                  </SelectTrigger>
                  <SelectContent className="bg-earth-elevated border-earth-border">
                    <SelectItem value="all" className="text-gold-100 font-bold">ALL SEASONS</SelectItem>
                    {seasons.map((s) => (
                      <SelectItem key={s} value={s} className="text-gold-100 font-bold">{s.toUpperCase()}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-3 bg-earth-main/50 px-4 rounded-xl border border-earth-border h-12">
                <SortAsc className="h-4 w-4 text-gold-400 flex-shrink-0" />
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="bg-transparent border-none focus:ring-0 h-full text-xs font-black text-gold-100 uppercase tracking-widest">
                    <SelectValue placeholder="SORT BY" />
                  </SelectTrigger>
                  <SelectContent className="bg-earth-elevated border-earth-border">
                    <SelectItem value="name" className="text-gold-100 font-bold">ALPHABETICAL</SelectItem>
                    <SelectItem value="investmentPerAcre" className="text-gold-100 font-bold">INVESTMENT</SelectItem>
                    <SelectItem value="expectedReturns" className="text-gold-100 font-bold">RETURNS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </form>
          </div>
        </ScrollReveal>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {[...Array(12)].map((_, i) => (
               <div key={i} className="h-64 sm:h-96 rounded-3xl bg-earth-elevated/20 animate-pulse border border-earth-border" />
            ))}
          </div>
        ) : crops.length > 0 ? (
          <div className="space-y-8 sm:space-y-12">
            <StaggerContainer staggerDelay={0.05}>
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {crops.map((crop) => (
                  <StaggerItem key={crop.id}>
                    <CropCardPremium crop={crop} />
                  </StaggerItem>
                ))}
              </div>
            </StaggerContainer>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 pt-8">
                <Button 
                  variant="outline" 
                  disabled={page === 0}
                  onClick={() => setPage(page - 1)}
                  className="border-earth-border text-gold-100 hover:bg-gold-400 hover:text-earth-main rounded-xl px-6"
                >
                  Previous
                </Button>
                <span className="text-sm font-black text-gold-400 uppercase tracking-widest">
                  Page {page + 1} of {totalPages}
                </span>
                <Button 
                  variant="outline" 
                  disabled={page === totalPages - 1}
                  onClick={() => setPage(page + 1)}
                  className="border-earth-border text-gold-100 hover:bg-gold-400 hover:text-earth-main rounded-xl px-6"
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="py-24 text-center bg-earth-elevated/20 rounded-3xl border border-earth-border border-dashed">
            <Leaf className="h-16 w-16 text-gold-400/20 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gold-100">No Intelligence Matches</h3>
            <p className="text-gold-100/40 text-sm mt-2">Adjust your filters to explore other agricultural profiles</p>
            <Button 
              variant="link" 
              onClick={() => {
                setSearchTerm('');
                setSeasonFilter('all');
                setDistrictFilter('all');
                setPage(0);
              }}
              className="text-gold-400 mt-4"
            >
              Reset All Registry Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

