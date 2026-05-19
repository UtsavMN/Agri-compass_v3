import { useEffect, useState } from 'react';
import { apiGet } from '@/lib/httpClient';
import Layout from '@/components/Layout';
import { CropCardPremium } from '@/components/ui/crop-card-premium';
import { CropCardShimmer } from '@/components/ui/loading-shimmer';
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/components/ui/animations';
import { LottieEmptyState } from '@/components/ui/lottie-loading';
import { Search, Filter, Leaf, MapPin, SortAsc, Activity, Droplets, TrendingUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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
    loadCrops();
  }, [page, seasonFilter, districtFilter, sortBy]);

  const loadCrops = async () => {
    try {
      setLoading(true);
      let url = `/api/crops?page=${page}&size=12&sortBy=${sortBy}`;
      
      // If we have search, use search endpoint (simplified for this demo, usually handled by backend)
      if (searchTerm) {
        const searchResults = await apiGet(`/api/crops/search?query=${encodeURIComponent(searchTerm)}`);
        setCrops(searchResults || []);
        setTotalPages(1);
      } else {
        const data = await apiGet(url);
        setCrops(data.content || []);
        setTotalPages(data.totalPages || 1);
      }
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
  const districts = ['Mandya', 'Raichur', 'Mysuru', 'Davanagere', 'Shimoga', 'Hassan', 'Tumkur', 'Belgaum', 'Gulbarga'];

  return (
    <Layout>
      <div className="space-y-8 pb-12">
        <ScrollReveal direction="down">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-5xl font-black text-gold-100 tracking-tighter">CROP REGISTRY</h1>
              <p className="text-gold-100/40 mt-1 uppercase tracking-widest text-[10px] font-black">Production-grade Agricultural Intelligence Database</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-gold-400/10 text-gold-400 border border-gold-400/20 px-3 py-1 font-black text-[10px] uppercase">
                {crops.length} ENTRIES LOADED
              </Badge>
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
                    {districts.map((d) => (
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
               <div key={i} className="h-96 rounded-3xl bg-earth-elevated/20 animate-pulse border border-earth-border" />
            ))}
          </div>
        ) : crops.length > 0 ? (
          <div className="space-y-12">
            <StaggerContainer staggerDelay={0.05}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
    </Layout>
  );
}
