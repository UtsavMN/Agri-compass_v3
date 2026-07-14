import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useUser } from '@/store';
import { useDistrict } from '@/store';
import { loadDistrictDataFromCSV } from '@/lib/csvLoader';
import { apiGet } from '@/lib/httpClient';
import { cropRecommender } from '@/lib/ai/cropRecommender';

import { Card, CardContent,  CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { CardShimmer, CropCardShimmer } from '@/components/ui/loading-shimmer';
import { CropCardPremium, Crop } from '@/components/ui/crop-card-premium';
import { AnimatedSection } from '@/components/ui/AnimatedSection';
import { StaggerContainer, StaggerItem, TiltCard } from '@/components/ui/animations';
import { LottieEmptyState } from '@/components/ui/lottie-loading';
import {  Post } from '@/lib/api/posts';
import {    FileText,  Leaf, MapPin, Zap } from 'lucide-react';
import { useScroll, useTransform } from 'framer-motion';
import { MarketTrendCard } from '@/components/dashboard/MarketTrendCard';

import { HeroCarousel } from '@/components/dashboard/HeroCarousel';


interface CropRecommendation {
  cropName: string;
  reason: string;
  season: string;
  expectedYield: string;
}

interface _WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  description: string;
  forecast: Array<{
    date: string;
    temp_max: number;
    temp_min: number;
    description: string;
    precipitation: number;
  }>;
}

interface HeroStatCardProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  sub: string;
  onClick?: () => void;
}

const _HeroStatCard = ({ icon, label, value, sub, onClick }: HeroStatCardProps) => (
  <TiltCard className="h-full animate-fade-in" onClick={onClick}>
    <div className="card-premium bg-[#12120e]/85 backdrop-blur-md border-t-2 border-gold-400/80 p-6 min-h-[5.5rem] flex items-center gap-4 hover:shadow-[0_0_25px_rgba(196,154,42,0.25)] hover:border-gold-400 transition-all cursor-pointer h-full">
      <div className="w-10 h-10 rounded-xl bg-gold-400/10 flex items-center justify-center flex-shrink-0">
        <span className="text-gold-400">{icon}</span>
      </div>
      <div>
        <p className="text-[10px] font-black text-gold-100/50 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-[20px] font-black text-[#f0ece0] leading-tight">{value}</p>
        <p className="text-[11px] text-[#a09880] mt-0.5 font-bold uppercase tracking-wider">{sub}</p>
      </div>
    </div>
  </TiltCard>
);

export default function Dashboard() {
  const { user } = useUser();
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  const _yBg = useTransform(scrollY, [0, 600], [0, 180]);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);
  const { selectedDistrict, _setSelectedDistrict } = useDistrict();
  const [_districts, setDistricts] = useState<string[]>([]);
  const [districtData, setDistrictData] = useState<any[]>([]);
  const [cropRecommendations, setCropRecommendations] = useState<CropRecommendation[]>([]);

  const [newsItems, setNewsItems] = useState<any[]>([]);
  const [communityPosts, setCommunityPosts] = useState<Post[]>([]);
  const [_mobileNavOpen, _setMobileNavOpen] = useState(false);
  const [userCount, setUserCount] = useState(0);


  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    initializeDashboard();
  }, [user, navigate]);

  useEffect(() => {
    if (selectedDistrict) {
      loadDistrictData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }
  }, [selectedDistrict]);

  // loadDistrictDataFromCSV is imported from @/lib/csvLoader

  const initializeDashboard = async () => {
    try {
      const [_loadedDistrictData] = await Promise.all([
        loadDistrictDataFromCSV().then(data => {
          setDistrictData(data);
          setDistricts(data.map(d => d.district));
          return data;
        })
      ]);
      // Fetch dashboard summary and news in parallel to speed up load
      const [summaryData, newsRes] = await Promise.all([
        apiGet('/api/dashboard/summary').catch(() => null),
        apiGet('/api/news/agriculture').catch(() => ({ articles: [] }))
      ]);

      if (summaryData) {
        if (!selectedDistrict) {
          setCrops(summaryData.crops || []);
        }
        setCommunityPosts(summaryData.posts || []);
        setUserCount(summaryData.userCount || 0);
      }

      if (newsRes && newsRes.articles) {
        setNewsItems(newsRes.articles.slice(0, 4));
      }

    } catch (error) {
      console.error('Error initializing dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDistrictData = async () => {
    if (!selectedDistrict) return;

    try {
      setLoading(true);
      
      const recommendationsPromise = cropRecommender.getRecommendations(selectedDistrict).catch(() => []);
      const dataPromise = apiGet(`/api/crops/recommendations/${encodeURIComponent(selectedDistrict)}`).catch(() => []);
      
      const [recommendations, data] = await Promise.all([recommendationsPromise, dataPromise]);
      setCropRecommendations(recommendations);

      // Fallback to all crops if no recommendations found for this district
      if (!data || data.length === 0) {
        const fallback = await apiGet('/api/crops?page=0&size=6&sortBy=name').catch(() => ({ content: [] }));
        setCrops(fallback?.content || []);
      } else {
        setCrops(data || []);
      }
    } catch (error) {
      console.error('Error loading district data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="w-full relative animate-fade-in">
      <div className="min-h-screen">

        {/* ===== HERO CAROUSEL (FULL BLEED) ===== */}
        <HeroCarousel 
          temp={28} 
          condition="Clear" 
          userCount={userCount} 
          newsItems={newsItems} 
        />

        {/* ===== MAIN CONTENT GRID ===== */}
        <div className="relative w-full">
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-20">
          {/* Popular crops grid */}
          <AnimatedSection delay={0.15}>
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gold-100">Popular Crops</h2>
                <Button
                  variant="ghost"
                  className="text-gold-400 hover:text-gold-300 hover:bg-gold-400/5 font-bold uppercase tracking-widest text-[10px]"
                  onClick={() => navigate('/crops')}
                >
                  View All
                </Button>
              </div>

              {loading ? (
                <CropCardShimmer count={6} />
              ) : crops.length > 0 ? (
                <StaggerContainer staggerDelay={0.05}>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {crops.map((crop) => (
                      <StaggerItem key={crop.id}>
                        <TiltCard className="h-full">
                          <CropCardPremium crop={crop} />
                        </TiltCard>
                      </StaggerItem>
                    ))}
                  </div>
                </StaggerContainer>
              ) : (
                <LottieEmptyState message="No crops available at the moment" />
              )}
            </div>
          </AnimatedSection>

          {/* ══════════════════════════════════════════
              ZONE 4 — MARKET NEWS + COMMUNITY SNIPPET
              Two columns, market news left, community right
          ══════════════════════════════════════════ */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
            
            {/* Market News Card (1fr) */}
            <div className="glass-panel rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <span className="text-[11px] text-[#6a6050] uppercase tracking-wider font-bold">
                  MARKET INTELLIGENCE
                </span>
                <h3 className="text-[14px] font-medium text-[#f0ece0] mt-1 mb-6">
                  Agricultural News & Trade Bulletins
                </h3>
                
                <div className="space-y-4">
                  {newsItems.map((news, _index) => (
                    <div 
                      key={typeof news === 'string' ? news : news.title} 
                      className="flex items-start gap-4 p-4 rounded-lg bg-[#12120e] border border-[rgba(255,255,255,0.03)] hover:border-gold-400/20 transition-all cursor-pointer group"
                      onClick={() => news.url && news.url !== '#' ? window.open(news.url, '_blank') : navigate('/market-prices')}
                    >
                      <div className="w-8 h-8 rounded-lg bg-[rgba(196,154,42,0.08)] flex items-center justify-center text-[#c49a2a] shrink-0">
                        <FileText size={16} />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-[#a09880] group-hover:text-[#f0ece0] transition-colors leading-relaxed font-medium line-clamp-2" title={typeof news === 'string' ? news : news.title}>
                          {typeof news === 'string' ? news : news.title}
                        </p>
                        <span className="text-[10px] text-[#6a6050] mt-1 block">
                          {typeof news === 'string' ? 'Live APMC Bulletins' : (news.source?.name || 'Agri News')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <button 
                onClick={() => navigate('/market-prices')} 
                className="mt-6 text-[11px] text-[#c49a2a] hover:text-[#d4aa3a] text-left transition-colors uppercase tracking-widest font-bold"
              >
                Go to Market Prices →
              </button>
            </div>

            {/* Community Snippet Card (320px) */}
            <div className="glass-panel rounded-2xl p-6 flex flex-col justify-between w-full">
              <div>
                <span className="text-[11px] text-[#6a6050] uppercase tracking-wider font-bold">
                  COMMUNITY DISCUSSION
                </span>
                <h3 className="text-[14px] font-medium text-[#f0ece0] mt-1 mb-6">
                  Kisan Feed Highlights
                </h3>
                
                <div className="space-y-4">
                  {communityPosts.length > 0 ? (
                    communityPosts.map((post) => (
                      <div 
                        key={post.id} 
                        className="p-3.5 rounded-lg bg-[#12120e] border border-[rgba(255,255,255,0.03)] hover:border-gold-400/20 transition-all cursor-pointer group"
                        onClick={() => navigate(`/post/${post.id}`)}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-5 h-5 rounded-full bg-[#c49a2a]/20 flex items-center justify-center text-[10px] text-[#c49a2a] font-bold">
                            {post.user?.full_name?.[0] || post.user?.username?.[0] || 'K'}
                          </div>
                          <span className="text-[11px] font-bold text-[#e2dcd0] truncate max-w-[120px]">
                            {post.user?.full_name || post.user?.username || 'Farmer'}
                          </span>
                          {post.location && (
                            <span className="text-[9px] text-[#6a6050] flex items-center gap-0.5 ml-auto">
                              <MapPin size={8} /> {post.location}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#a09880] group-hover:text-[#f0ece0] transition-colors line-clamp-2 leading-relaxed">
                          {post.body || post.content || ''}
                        </p>
                        <div className="flex items-center gap-3 mt-2 text-[10px] text-[#6a6050] font-bold">
                          <span className="flex items-center gap-1">👍 {post._count?.likes || 0}</span>
                          <span className="flex items-center gap-1">💬 {post._count?.comments || 0}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-xs text-[#6a6050]">
                      No recent community posts
                    </div>
                  )}
                </div>
              </div>
              
              <button 
                onClick={() => navigate('/community')} 
                className="mt-6 text-[11px] text-[#c49a2a] hover:text-[#d4aa3a] text-left transition-colors uppercase tracking-widest font-bold"
              >
                Open Kisan Feed →
              </button>
            </div>

          </div>

        </div>
        </div>
      </div>
    </div>
  );
}
