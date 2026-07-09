import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Cloud, Leaf as  TrendingUp, Users } from 'lucide-react';
import { KarnatakaMap } from './KarnatakaMap';
import { TiltCard } from '@/components/ui/animations';

const BASE_HEROES = [
  {
    id: 'fields',
    image: '/karnataka_farmland_hero.png',
    headline: 'Empowering',
    headlineGold: "Karnataka's Fields",
    subtext: 'Make data-driven agricultural decisions with AI-powered crop intelligence.',
    badge: 'AGRI COMPASS · GOVERNMENT OF KARNATAKA SCHEME SUPPORT',
    ctaPrimary: { label: 'Analyze Soil', href: '/my-farm' },
    ctaSecondary: { label: 'Explore Crops', href: '/crops' },
  },
  {
    id: 'harvest',
    image: '/hero_image_4.jpg',
    headline: 'Know Your Market',
    headlineGold: 'Before You Harvest.',
    subtext: 'Live APMC mandi prices. MSP vs market comparison. Sell at the right time.',
    badge: 'LIVE MARKET INTELLIGENCE · UPDATED DAILY',
    ctaPrimary: { label: 'View Market Prices', href: '/market-prices' },
    ctaSecondary: { label: 'See Schemes', href: '/schemes' },
  },
  {
    id: 'rain',
    image: '/hero_image_3.jpg',
    headline: 'Plan Around',
    headlineGold: 'The Monsoon.',
    subtext: '5-day precision forecast. Advisory checklist. Season-specific crop recommendations.',
    badge: 'WEATHER INTELLIGENCE · POWERED BY OPENWEATHER',
    ctaPrimary: { label: 'Check Weather', href: '/weather' },
    ctaSecondary: { label: 'Crop Calendar', href: '/crops' },
  },
  {
    id: 'scheme',
    image: '/hero_image_2.jpg',
    headline: '₹6,000 a Year',
    headlineGold: 'You May Be Missing.',
    subtext: 'PM-KISAN, PMFBY, Krishi Bhagya, and 15 more schemes. Check your eligibility now.',
    badge: 'GOVERNMENT SCHEMES · 17 ACTIVE SCHEMES',
    ctaPrimary: { label: 'Check Eligibility', href: '/schemes' },
    ctaSecondary: { label: 'Bank Benefits', href: '/schemes?tab=banks' },
  },
];

interface HeroStatCardProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  sub: string;
  onClick?: () => void;
}

const HeroStatCard = ({ icon, label, value, sub, onClick }: HeroStatCardProps) => (
  <TiltCard className="h-full">
    <div onClick={onClick} className="card-premium bg-[#1a1a14]/90 backdrop-blur-xl border-t-2 border-gold-400/80 p-6 min-h-[5.5rem] flex items-center gap-4 hover:shadow-[0_0_25px_rgba(196,154,42,0.25)] hover:border-gold-400 transition-all cursor-pointer h-full">
      <div className="w-10 h-10 rounded-xl bg-gold-400/20 flex items-center justify-center flex-shrink-0">
        <span className="text-gold-400">{icon}</span>
      </div>
      <div>
        <p className="text-[10px] font-black text-gold-100/90 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-[20px] font-black text-white leading-tight">{value}</p>
        <p className="text-[11px] text-gold-100/70 mt-0.5 font-bold uppercase tracking-wider">{sub}</p>
      </div>
    </div>
  </TiltCard>
);

import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useRef } from "react";
import { ParticleField } from "@/components/ui/ParticleField";
import { useDistrict } from "@/store";
import { useMarketPrices } from "@/hooks/useMarketPrices";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { MarketPricesSection } from "./MarketPricesSection";

export const HeroCarousel = ({ 
  temp, 
  condition, 
  userCount, 
  newsItems = []
}: { 
  temp: number; 
  condition: string; 
  userCount: number; 
  newsItems?: any[]; 
}) => {
  const [current, setCurrent] = useState(0);
  const [newsIndex, setNewsIndex] = useState(0);
  const [marketModalOpen, setMarketModalOpen] = useState(false);
  
  const { selectedDistrict } = useDistrict();
  const { prices, loading: pricesLoading } = useMarketPrices(selectedDistrict);

  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  let trendLabel = "Market Trends";
  let trendValue = pricesLoading ? "Loading..." : "No Data";
  let trendSub = "Recent mandi prices";
  
  if (!pricesLoading && prices && prices.length > 0) {
    const showcase = prices[0];
    const trendIcon = showcase.trend === 'up' ? '↑' : showcase.trend === 'down' ? '↓' : '-';
    trendLabel = `${showcase.commodity}`;
    trendValue = `₹${showcase.modal_price || showcase.modalPrice || 0}/q ${trendIcon}`;
    trendSub = `${showcase.market} Mandi`;
  }

  const currentNews = newsItems[newsIndex];
  const dynamicNewsText = currentNews ? (typeof currentNews === 'string' ? currentNews : currentNews.title) : 'Stay updated with the latest agricultural news and trade tariffs.';
  
  const heroes = [
    ...BASE_HEROES,
    {
      id: 'news',
      image: '/hero_image_4.jpg',
      headline: 'Latest',
      headlineGold: 'Market Intelligence',
      subtext: dynamicNewsText,
      badge: 'LIVE NEWS UPDATES',
      ctaPrimary: { label: 'Read More', href: currentNews?.url || '/market-prices' },
      ctaSecondary: { label: 'All Updates', href: '/market-prices' },
    }
  ];

  // Auto-rotate heroes every 15 seconds
  useEffect(() => {
    const ROTATE_MS = 15000;
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % heroes.length);
    }, ROTATE_MS);
    return () => clearInterval(timer);
  }, [heroes.length]);

  // Auto-rotate dynamic news every 20 seconds
  useEffect(() => {
    if (!newsItems.length) return;
    const NEWS_ROTATE_MS = 20000;
    const timer = setInterval(() => {
      setNewsIndex(prev => (prev + 1) % newsItems.length);
    }, NEWS_ROTATE_MS);
    return () => clearInterval(timer);
  }, [newsItems.length]);

  const hero = heroes[current];

  return (
    <section ref={ref} className="relative w-full pt-28 pb-32 overflow-hidden flex flex-col justify-center items-center">
      {/* Background image with smooth crossfade and Parallax */}
      <motion.div style={{ y }} className="absolute inset-0">
        <AnimatePresence mode="popLayout">
          <motion.img
            key={current}
            src={hero.image}
            alt=""
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
        </AnimatePresence>
        {/* Hardware-accelerated overlay to darken and ensure high readability */}
        <div className="absolute inset-0 bg-black/40 z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A] via-[#0A0A0A]/80 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0b] via-transparent to-[#0f0f0b]/40 z-10" />
      </motion.div>

      {/* Particles */}
      <div className="absolute inset-0 z-10">
        <ParticleField />
      </div>

      {/* Hero content - constrained width to match layout */}
      <motion.div style={{ opacity }} className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* LEFT - cols 7 */}
          <div className="lg:col-span-7 text-left min-h-[300px] flex flex-col justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <span className="inline-block bg-gold-400/10 border border-gold-400/30 text-gold-400 text-[10px] font-black uppercase tracking-[0.25em] px-3.5 py-1.5 rounded-full mb-8 backdrop-blur-sm">
                  {hero.badge}
                </span>

                <div className="relative mb-4 max-w-3xl">

                  <h1 className="relative text-4xl md:text-5xl lg:text-6xl font-serif font-black text-[#F5F0E8] tracking-tight leading-none z-10">
                    {hero.headline}<br />
                    <span className="text-[#c49a2a]">{hero.headlineGold}</span>
                  </h1>
                </div>

                <p className="text-sm md:text-base text-[#F5F0E8]/60 max-w-xl mb-8 leading-relaxed font-medium">
                  {hero.subtext}
                </p>

                <div className="flex flex-wrap gap-4">
                  <Link to={hero.ctaPrimary.href}
                    className="bg-gradient-to-r from-[#C9A84C] to-[#D4B86A] text-[#0A0A0A] font-bold rounded-xl px-8 h-12 flex items-center justify-center text-xs uppercase tracking-widest transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(201,168,76,0.4)]">
                    {hero.ctaPrimary.label}
                  </Link>
                  <Link to={hero.ctaSecondary.href}
                    className="bg-transparent border border-[#C9A84C]/40 text-[#C9A84C] hover:text-[#D4B86A] font-bold rounded-xl px-8 h-12 flex items-center justify-center text-xs uppercase tracking-widest hover:bg-[#C9A84C]/10 transition-all">
                    {hero.ctaSecondary.label}
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* RIGHT — Karnataka map - cols 5 */}
          <div className="lg:col-span-5 w-full flex justify-center lg:justify-end">
            <div className="w-full max-w-[450px]">
              <KarnatakaMap />
            </div>
          </div>
        </div>

        {/* Carousel dots */}
        <div className="flex items-center gap-2 mt-12 pb-6 border-b border-earth-border/20">
          {heroes.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`transition-all duration-300 rounded-full ${
                i === current
                  ? 'w-6 h-1.5 bg-[#c49a2a]'
                  : 'w-1.5 h-1.5 bg-white/20 hover:bg-white/40'
              }`}
            />
          ))}
        </div>

        {/* Bottom stat cards - floating overlay pattern */}
        <div className="-mb-24 mt-8 relative z-20 w-full">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <HeroStatCard icon={<Cloud size={18} />} label="Current Weather" value={`${temp}°C`} sub={condition} />
            <HeroStatCard icon={<Users size={18} />} label="Active Users" value={String(userCount)} sub="Farmers connected" />
            <HeroStatCard 
              icon={<TrendingUp size={18} />} 
              label={trendLabel} 
              value={trendValue} 
              sub={trendSub} 
              onClick={() => setMarketModalOpen(true)}
            />
          </div>
        </div>
      </motion.div>
      
      <Dialog open={marketModalOpen} onOpenChange={setMarketModalOpen}>
        <DialogContent className="max-w-4xl bg-[#0f0f0b] border-[#C9A84C]/20 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl text-[#F5F0E8] font-serif">Market Trends</DialogTitle>
            <DialogDescription className="text-[#F5F0E8]/60">
              Live mandi prices and trends for {selectedDistrict}.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <MarketPricesSection district={selectedDistrict} />
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};
