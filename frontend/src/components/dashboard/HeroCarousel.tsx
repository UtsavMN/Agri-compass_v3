import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Cloud, Leaf as Wheat, TrendingUp } from 'lucide-react';
import { KarnatakaMap } from './KarnatakaMap';
import { TiltCard } from '@/components/ui/animations';

const HEROES = [
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
    image: 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?fit=crop&w=1600&h=600&q=80',
    headline: 'Know Your Market',
    headlineGold: 'Before You Harvest.',
    subtext: 'Live APMC mandi prices. MSP vs market comparison. Sell at the right time.',
    badge: 'LIVE MARKET INTELLIGENCE · UPDATED DAILY',
    ctaPrimary: { label: 'View Market Prices', href: '/market-prices' },
    ctaSecondary: { label: 'See Schemes', href: '/schemes' },
  },
  {
    id: 'rain',
    image: 'https://images.unsplash.com/photo-1561731216-c3a4d99437d5?fit=crop&w=1600&h=600&q=80',
    headline: 'Plan Around',
    headlineGold: 'The Monsoon.',
    subtext: '5-day precision forecast. Advisory checklist. Season-specific crop recommendations.',
    badge: 'WEATHER INTELLIGENCE · POWERED BY OPENWEATHER',
    ctaPrimary: { label: 'Check Weather', href: '/weather' },
    ctaSecondary: { label: 'Crop Calendar', href: '/crops' },
  },
  {
    id: 'scheme',
    image: 'https://images.unsplash.com/photo-1605000797499-95a51c7769ae?fit=crop&w=1600&h=600&q=80',
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
}

const HeroStatCard = ({ icon, label, value, sub }: HeroStatCardProps) => (
  <TiltCard className="h-full">
    <div className="card-premium bg-[#12120e]/85 backdrop-blur-md border-t-2 border-gold-400/80 p-5 flex items-center gap-4 hover:shadow-[0_0_25px_rgba(196,154,42,0.25)] hover:border-gold-400 transition-all cursor-pointer h-full">
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

export const HeroCarousel = ({ 
  temp, 
  condition, 
  cropsCount, 
  newsCount 
}: { 
  temp: number; 
  condition: string; 
  cropsCount: number; 
  newsCount: number; 
}) => {
  const [current, setCurrent] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Auto-rotate every 15 minutes (15 * 60 * 1000)
  useEffect(() => {
    const ROTATE_MS = 15 * 60 * 1000;
    const timer = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrent(prev => (prev + 1) % HEROES.length);
        setIsTransitioning(false);
      }, 600);
    }, ROTATE_MS);
    return () => clearInterval(timer);
  }, []);

  const hero = HEROES[current];

  return (
    <div className="relative w-full pt-28 pb-32 overflow-hidden flex flex-col justify-center items-center">
      {/* Background image with crossfade */}
      <div className={`absolute inset-0 transition-opacity duration-700 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
        <img src={hero.image} alt="" className="w-full h-full object-cover object-center" />
        {/* Hardware-accelerated overlay to darken and ensure high readability */}
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0f0f0b]/95 via-[#0f0f0b]/70 to-[#0f0f0b]/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0b] via-transparent to-[#0f0f0b]/40" />
      </div>

      {/* Hero content - constrained width to match layout */}
      <div className={`relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-8 transition-[opacity,transform] duration-500 ${isTransitioning ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* LEFT - cols 7 */}
          <div className="lg:col-span-7 text-left">
            <span className="inline-block bg-gold-400/10 border border-gold-400/30 text-gold-400 text-[10px] font-black uppercase tracking-[0.25em] px-3.5 py-1.5 rounded-full mb-8 backdrop-blur-sm">
              {hero.badge}
            </span>

            <div className="relative mb-4 max-w-3xl">
              <span className="absolute -top-4 left-0 text-6xl md:text-8xl font-black text-gold-400/5 select-none font-serif tracking-tight uppercase leading-none hidden sm:block">
                KARNATAKA FIELDS
              </span>
              <h1 className="relative text-4xl md:text-5xl lg:text-6xl font-serif font-black text-gradient-gold tracking-tight leading-none z-10">
                {hero.headline}<br />
                <span className="text-[#c49a2a]">{hero.headlineGold}</span>
              </h1>
            </div>

            <p className="text-sm md:text-base text-gold-100/60 max-w-xl mb-8 leading-relaxed font-medium">
              {hero.subtext}
            </p>

            <div className="flex flex-wrap gap-4">
              <Link to={hero.ctaPrimary.href}
                className="btn-gold btn-shimmer bg-gradient-to-r from-gold-400 to-gold-500 hover:from-gold-300 hover:to-gold-400 text-earth-main font-bold rounded-xl px-8 h-12 flex items-center justify-center text-xs font-black uppercase tracking-widest transition-all shadow-lg hover:shadow-[0_0_20px_rgba(196,154,42,0.3)]">
                {hero.ctaPrimary.label}
              </Link>
              <Link to={hero.ctaSecondary.href}
                className="bg-transparent border border-gold-400/30 hover:border-gold-400/60 text-gold-200 hover:text-gold-100 font-bold rounded-xl px-8 h-12 flex items-center justify-center text-xs font-black uppercase tracking-widest hover:bg-gold-400/5 transition-all">
                {hero.ctaSecondary.label}
              </Link>
            </div>
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
          {HEROES.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setIsTransitioning(true);
                setTimeout(() => {
                  setCurrent(i);
                  setIsTransitioning(false);
                }, 150);
              }}
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
            <HeroStatCard icon={<Wheat size={18} />} label="Tracked Crops" value={String(cropsCount)} sub="Optimized suggestions" />
            <HeroStatCard icon={<TrendingUp size={18} />} label="Market Updates" value={`${newsCount} Active`} sub="Recent trade tariffs" />
          </div>
        </div>
      </div>
    </div>
  );
};
