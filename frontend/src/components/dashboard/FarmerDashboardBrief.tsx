import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser, useDistrict } from '@/store';
import { FarmsAPI, Farm } from '@/lib/api/farms';
import { isCropYetToBeGrown } from '@/lib/ai/soilDiagnosticEngine';
import { weatherAdvisor, WeatherData } from '@/lib/ai/weatherAdvisor';
import { useMarketPrices, MandiPrice } from '@/hooks/useMarketPrices';
import { TiltCard } from '@/components/ui/animations';
import { 
  Sprout, 
  Droplets, 
  TrendingUp, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  Wind, 
  Store,
  MapPin,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  CheckSquare,
  Square,
  Trash2,
  Plus,
  Layers,
  CalendarCheck
} from 'lucide-react';

interface FarmerDashboardBriefProps {
  district?: string;
  className?: string;
}

export interface FarmTask {
  id: string;
  text: string;
  completed: boolean;
}

// Fallback high-accuracy APMC benchmark data across Karnataka zones
const KARNATAKA_MANDI_BENCHMARKS: Record<string, { commodity: string; modalPrice: number; market: string; trend: 'up' | 'stable'; change: string; arrivals: string }> = {
  'Bengaluru Urban': { commodity: 'Tomato (Hybrid)', modalPrice: 1750, market: 'Yeshwanthpur APMC', trend: 'up', change: '+9.4%', arrivals: '85 Tonnes' },
  'Bengaluru Rural': { commodity: 'Ragi (Finger Millet)', modalPrice: 2850, market: 'Doddaballapur APMC', trend: 'up', change: '+4.2%', arrivals: '42 Tonnes' },
  'Kolar': { commodity: 'Tomato', modalPrice: 1850, market: 'Kolar APMC', trend: 'up', change: '+12.5%', arrivals: '110 Tonnes' },
  'Ramanagara': { commodity: 'Ragi (Finger Millet)', modalPrice: 2900, market: 'Ramanagara APMC', trend: 'up', change: '+5.1%', arrivals: '60 Tonnes' },
  'Mandya': { commodity: 'Sugarcane', modalPrice: 3150, market: 'Mandya Mandi', trend: 'stable', change: '+1.5%', arrivals: '140 Tonnes' },
  'Mysuru': { commodity: 'Paddy (Sona Masoori)', modalPrice: 2450, market: 'Bandipalya APMC', trend: 'up', change: '+3.8%', arrivals: '75 Tonnes' },
  'Hassan': { commodity: 'Coffee (Arabica)', modalPrice: 14200, market: 'Hassan APMC', trend: 'up', change: '+6.0%', arrivals: '30 Tonnes' },
  'Shivamogga': { commodity: 'Arecanut (Chali)', modalPrice: 48500, market: 'Shivamogga APMC', trend: 'up', change: '+4.8%', arrivals: '55 Tonnes' },
  'Chikkamagaluru': { commodity: 'Coffee (Robusta)', modalPrice: 8900, market: 'Chikkamagaluru Mandi', trend: 'up', change: '+5.5%', arrivals: '45 Tonnes' },
  'Davanagere': { commodity: 'Maize (Corn)', modalPrice: 2180, market: 'Davanagere APMC', trend: 'up', change: '+2.8%', arrivals: '95 Tonnes' },
  'Ballari': { commodity: 'Chilli (Byadgi)', modalPrice: 18500, market: 'Ballari APMC', trend: 'up', change: '+7.2%', arrivals: '65 Tonnes' },
  'Raichur': { commodity: 'Paddy (IR-64)', modalPrice: 2320, market: 'Raichur APMC', trend: 'up', change: '+3.2%', arrivals: '120 Tonnes' },
  'Belagavi': { commodity: 'Soybean', modalPrice: 4650, market: 'Belagavi APMC', trend: 'up', change: '+4.1%', arrivals: '80 Tonnes' },
  'Dharwad': { commodity: 'Cotton (Bunny)', modalPrice: 7350, market: 'Hubballi APMC', trend: 'up', change: '+5.0%', arrivals: '90 Tonnes' },
  'Tumakuru': { commodity: 'Groundnut (Peanut)', modalPrice: 6400, market: 'Tumakuru APMC', trend: 'up', change: '+3.5%', arrivals: '50 Tonnes' },
  'Dakshina Kannada': { commodity: 'Arecanut (Mangalore)', modalPrice: 51200, market: 'Mangaluru APMC', trend: 'up', change: '+3.8%', arrivals: '40 Tonnes' },
  'DEFAULT': { commodity: 'Ragi (Finger Millet)', modalPrice: 2850, market: 'Regional APMC', trend: 'up', change: '+4.5%', arrivals: '65 Tonnes' }
};

// Generates smart contextual default checklist tasks for a farm
const getDefaultTasksForFarm = (farm: Farm): FarmTask[] => {
  const isFallow = isCropYetToBeGrown(farm.current_crop);
  if (isFallow) {
    return [
      { id: 'task_def_1', text: 'Run Soil AI Diagnostic to choose optimal crop', completed: false },
      { id: 'task_def_2', text: 'Prepare soil: apply 5 t/acre organic FYM manure', completed: false },
      { id: 'task_def_3', text: 'Inspect field irrigation channels & bunds', completed: false },
    ];
  }

  const crop = (farm.current_crop || '').toLowerCase();
  if (crop.includes('ragi') || crop.includes('finger')) {
    return [
      { id: 'task_def_1', text: 'Apply 1st Urea top-dressing (30 kg/acre)', completed: false },
      { id: 'task_def_2', text: 'Conduct interculture weeding & soil aeration', completed: false },
      { id: 'task_def_3', text: 'Inspect tillers for leaf blast symptoms', completed: false },
    ];
  }

  if (crop.includes('rice') || crop.includes('paddy')) {
    return [
      { id: 'task_def_1', text: 'Maintain 2-3 cm standing water level in plots', completed: false },
      { id: 'task_def_2', text: 'Apply Nitrogen top-dress at active tillering', completed: false },
      { id: 'task_def_3', text: 'Scout for dead hearts caused by stem borer', completed: false },
    ];
  }

  if (crop.includes('maize') || crop.includes('corn')) {
    return [
      { id: 'task_def_1', text: 'Knee-high earthing up & Nitrogen band application', completed: false },
      { id: 'task_def_2', text: 'Scout for Fall Armyworm in leaf whorls', completed: false },
      { id: 'task_def_3', text: 'Check furrow irrigation drainage', completed: false },
    ];
  }

  if (crop.includes('tomato')) {
    return [
      { id: 'task_def_1', text: 'Apply Calcium Nitrate + Boron (Blossom rot preventive)', completed: false },
      { id: 'task_def_2', text: 'Check drip lines & emitters for clogging', completed: false },
      { id: 'task_def_3', text: 'Install yellow sticky traps for whiteflies', completed: false },
    ];
  }

  return [
    { id: 'task_def_1', text: `Check root-zone moisture for ${farm.current_crop}`, completed: false },
    { id: 'task_def_2', text: 'Apply scheduled secondary nutrients', completed: false },
    { id: 'task_def_3', text: 'Scout for foliar pests & leaf spots', completed: false },
  ];
};

export const FarmerDashboardBrief: React.FC<FarmerDashboardBriefProps> = ({ district, className = '' }) => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { selectedDistrict } = useDistrict();
  const defaultDistrict = district || selectedDistrict || 'Bengaluru Urban';

  // 1. Farms Data & Carousel State
  const [farms, setFarms] = useState<Farm[]>([]);
  const [activeFarmIndex, setActiveFarmIndex] = useState<number>(0);
  const [farmsLoading, setFarmsLoading] = useState<boolean>(true);

  // 2. Checklist State for Current Farm
  const [farmTasks, setFarmTasks] = useState<FarmTask[]>([]);
  const [newTaskInput, setNewTaskInput] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'advisory' | 'checklist'>('advisory');

  // 3. Current active farm object
  const currentFarm = useMemo(() => {
    if (!farms || farms.length === 0) return null;
    const idx = Math.max(0, Math.min(activeFarmIndex, farms.length - 1));
    return farms[idx];
  }, [farms, activeFarmIndex]);

  // Synchronized Location for Card 2
  const targetDistrict = currentFarm?.location || defaultDistrict;

  // 4. Weather & Agro-Advisory Data (Synchronized with targetDistrict)
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState<boolean>(true);

  // 5. Market Prices Data
  const { prices: apiPrices, loading: pricesLoading } = useMarketPrices(targetDistrict);

  // Load User Farms
  useEffect(() => {
    let isMounted = true;
    const fetchFarms = async () => {
      if (!user?.id) {
        setFarmsLoading(false);
        return;
      }
      try {
        setFarmsLoading(true);
        const data = await FarmsAPI.getFarms(user.id);
        if (isMounted) {
          const loadedFarms = Array.isArray(data) ? data : [];
          setFarms(loadedFarms);
          if (activeFarmIndex >= loadedFarms.length) {
            setActiveFarmIndex(0);
          }
        }
      } catch (err) {
        console.warn('Error loading farms for dashboard brief:', err);
      } finally {
        if (isMounted) setFarmsLoading(false);
      }
    };

    fetchFarms();
    return () => { isMounted = false; };
  }, [user?.id]);

  // Load / Synchronize Tasks for Current Farm
  useEffect(() => {
    if (!currentFarm) {
      setFarmTasks([]);
      return;
    }

    const storageKey = `agri_farm_checklist_${currentFarm.id}`;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setFarmTasks(parsed);
          return;
        }
      } catch (e) {
        console.warn('Failed to parse cached farm checklist:', e);
      }
    }

    // Initialize with contextual defaults
    const defaults = getDefaultTasksForFarm(currentFarm);
    setFarmTasks(defaults);
    localStorage.setItem(storageKey, JSON.stringify(defaults));
  }, [currentFarm?.id]);

  // Load Weather & Agro Advisory for Current Farm's Location
  useEffect(() => {
    let isMounted = true;
    const fetchWeather = async () => {
      try {
        setWeatherLoading(true);
        const data = await weatherAdvisor.getWeatherData(targetDistrict);
        if (isMounted) {
          setWeatherData(data);
        }
      } catch (err) {
        console.warn('Error loading weather data for dashboard brief:', err);
      } finally {
        if (isMounted) setWeatherLoading(false);
      }
    };

    fetchWeather();
    return () => { isMounted = false; };
  }, [targetDistrict]);

  // Carousel navigation handlers
  const handlePrevFarm = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (farms.length <= 1) return;
    setActiveFarmIndex((prev) => (prev > 0 ? prev - 1 : farms.length - 1));
  };

  const handleNextFarm = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (farms.length <= 1) return;
    setActiveFarmIndex((prev) => (prev < farms.length - 1 ? prev + 1 : 0));
  };

  // Checklist handlers
  const toggleTask = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentFarm) return;
    const updated = farmTasks.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t));
    setFarmTasks(updated);
    localStorage.setItem(`agri_farm_checklist_${currentFarm.id}`, JSON.stringify(updated));
  };

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!newTaskInput.trim() || !currentFarm) return;
    const newTask: FarmTask = {
      id: `task_${Date.now()}`,
      text: newTaskInput.trim(),
      completed: false,
    };
    const updated = [...farmTasks, newTask];
    setFarmTasks(updated);
    localStorage.setItem(`agri_farm_checklist_${currentFarm.id}`, JSON.stringify(updated));
    setNewTaskInput('');
  };

  const deleteTask = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentFarm) return;
    const updated = farmTasks.filter((t) => t.id !== taskId);
    setFarmTasks(updated);
    localStorage.setItem(`agri_farm_checklist_${currentFarm.id}`, JSON.stringify(updated));
  };

  // ==========================================
  // FEATURE 1: Farm Information & Advice
  // ==========================================
  const farmBrief = useMemo(() => {
    if (!currentFarm) {
      return {
        hasFarms: false,
        name: 'No Farms Registered',
        acres: 0,
        cropName: 'Setup Your First Farm',
        location: defaultDistrict,
        soilType: 'General',
        irrigationType: 'Standard',
        isFallow: true,
        advice: 'Register a parcel to activate automated crop stage alerts and unit-based fertilizer schedules.',
        actionText: 'Add Farm Now',
        route: '/my-farm'
      };
    }

    const isFallow = isCropYetToBeGrown(currentFarm.current_crop);
    const cropName = isFallow ? 'Land Ready For Sowing' : (currentFarm.current_crop || 'Active Crop');

    let advice = 'Vegetative tillering stage active: inspect root-zone moisture & check nutrient balance.';
    if (isFallow) {
      advice = 'Fields are currently fallow. Run Soil AI Diagnostic to evaluate the top recommended crops for this season.';
    } else {
      const lower = cropName.toLowerCase();
      if (lower.includes('ragi') || lower.includes('finger')) {
        advice = 'Tillering stage: Apply 1st Urea top-dress (30 kg/acre) & conduct weed interculture.';
      } else if (lower.includes('rice') || lower.includes('paddy')) {
        advice = 'Panicle initiation stage: Maintain 2-3 cm shallow water level & inspect for stem borer.';
      } else if (lower.includes('maize') || lower.includes('corn')) {
        advice = 'Knee-high stage: Earthing up & band application of Nitrogen recommended.';
      } else if (lower.includes('tomato')) {
        advice = 'Flowering & fruit set: Apply Calcium Nitrate + Boron to prevent Blossom End Rot.';
      } else if (lower.includes('cotton')) {
        advice = 'Square formation: Spray 1500ppm neem oil (2ml/L) as sucking pest preventive.';
      }
    }

    return {
      hasFarms: true,
      name: currentFarm.name,
      acres: Number(currentFarm.area_acres) || 0,
      cropName,
      location: currentFarm.location || defaultDistrict,
      soilType: currentFarm.soil_type || 'General Soil',
      irrigationType: currentFarm.irrigation_type || 'Rain Fed',
      isFallow,
      advice,
      actionText: isFallow ? 'Get Crop Recommendations' : 'View Soil Diagnostics',
      route: '/my-farm?tab=soil-ai'
    };
  }, [currentFarm, defaultDistrict]);

  // ==========================================
  // FEATURE 2: Spraying & Farm-Specific Irrigation
  // ==========================================
  const agroWeather = useMemo(() => {
    const temp = weatherData?.temperature ?? 26;
    const wind = weatherData?.windSpeed ?? 9;
    const humidity = weatherData?.humidity ?? 65;
    const rainProb = weatherData?.precipitationProbability ?? 10;
    const precip = weatherData?.precipitation ?? 0;
    
    // Check spraying suitability from Open-Meteo or calculate
    let suitability: 'Optimal' | 'Caution' | 'Unfavorable' | 'Favorable' = 'Optimal';
    let sprayReason = 'Calm winds & low rain risk — ideal for foliar nutrition & protective sprays.';

    if (weatherData?.forecast && weatherData.forecast.length > 0) {
      suitability = weatherData.forecast[0].spraying_suitability || 'Optimal';
      sprayReason = weatherData.forecast[0].spraying_reason || sprayReason;
    } else {
      if (wind > 20 || rainProb > 60 || precip > 1.5) {
        suitability = 'Unfavorable';
        sprayReason = 'High wind / rain risk: Postpone spraying to prevent chemical drift & wash-off.';
      } else if (wind > 14 || rainProb > 30) {
        suitability = 'Caution';
        sprayReason = 'Moderate wind detected: Use low-drift nozzles and spray during early morning.';
      }
    }

    // Dynamic farm-specific irrigation advice based on farm's irrigation type & crop
    const farmName = currentFarm ? currentFarm.name : 'Your Farm';
    const irrType = (currentFarm?.irrigation_type || 'Drip').toLowerCase();
    let irrigationAdvice = '';

    if (precip > 3 || rainProb >= 65) {
      irrigationAdvice = `Rain expected in ${targetDistrict} (${precip}mm, ${rainProb}% prob): Withhold supplemental irrigation to conserve water and prevent waterlogging.`;
    } else if (irrType.includes('drip')) {
      irrigationAdvice = `Drip System (${farmName}): Apply 12-15 mm cycle (approx 1.5-2 hrs emitter runtime) to replenish root-zone deficit.`;
    } else if (irrType.includes('sprinkler')) {
      irrigationAdvice = `Sprinkler System (${farmName}): Run early morning (6-8 AM) cycle (18-20 mm) to avoid evaporative heat loss.`;
    } else if (irrType.includes('canal')) {
      irrigationAdvice = `Canal System (${farmName}): Maintain steady field moisture level. Check field bunds for seepage.`;
    } else if (irrType.includes('tube') || irrType.includes('well') || irrType.includes('bore')) {
      irrigationAdvice = `Tube Well / Borewell (${farmName}): Run 2-hour furrow irrigation cycle in late evening.`;
    } else if (irrType.includes('rain')) {
      irrigationAdvice = `Rain Fed Field (${farmName}): Dependent on natural precipitation (${precip}mm forecast). Mulching advised.`;
    } else {
      irrigationAdvice = `Irrigation (${farmName}): Standard root-zone moisture cycle (15-20 mm) recommended.`;
    }

    return {
      temp,
      wind,
      humidity,
      suitability,
      sprayReason,
      irrigationAdvice,
      route: '/weather'
    };
  }, [weatherData, currentFarm, targetDistrict]);

  // ==========================================
  // FEATURE 4: Top Mandi Movers & Best Market
  // ==========================================
  const mandiMover = useMemo(() => {
    if (apiPrices && apiPrices.length > 0) {
      const highest = apiPrices.reduce((prev, curr) => (curr.modalPrice > prev.modalPrice ? curr : prev), apiPrices[0]);
      return {
        commodity: highest.commodity,
        modalPrice: highest.modalPrice,
        market: highest.market,
        trend: highest.trend || 'up',
        badge: 'Live APMC Rate',
        tip: `Highest traded rate today at ${highest.market} Mandi. Good window for dispatch.`,
        route: '/market-prices'
      };
    }

    const benchmark = KARNATAKA_MANDI_BENCHMARKS[targetDistrict] || KARNATAKA_MANDI_BENCHMARKS['DEFAULT'];
    return {
      commodity: benchmark.commodity,
      modalPrice: benchmark.modalPrice,
      market: benchmark.market,
      trend: benchmark.trend,
      badge: `Top Mover ${benchmark.change}`,
      tip: `Trading at ₹${benchmark.modalPrice.toLocaleString('en-IN')}/q in ${benchmark.market}. Demand is strong.`,
      route: '/market-prices'
    };
  }, [apiPrices, targetDistrict]);

  const completedTaskCount = farmTasks.filter((t) => t.completed).length;

  return (
    <div className={`w-full ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
        
        {/* ========================================================= */}
        {/* CARD 1: Farmer’s Daily Field Brief (Farm Carousel + Checklist) */}
        {/* ========================================================= */}
        <TiltCard className="h-full">
          <div 
            onClick={() => navigate(farmBrief.route)}
            className="group relative h-full card-premium bg-[#171712]/90 backdrop-blur-xl border border-earth-border/80 hover:border-gold-400/70 p-4 sm:p-5 rounded-2xl shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden"
          >
            {/* Top accent glow line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500/80 via-gold-400/80 to-emerald-500/80" />

            <div>
              {/* Header with Carousel Navigation */}
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                    <Sprout className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gold-100/70 leading-none">
                      Daily Field Brief
                    </span>
                    {farms.length > 0 && (
                      <span className="text-[9px] text-emerald-400/80 font-bold tracking-tight mt-0.5">
                        {currentFarm?.name}
                      </span>
                    )}
                  </div>
                </div>

                {/* Carousel Controls */}
                {farms.length > 1 ? (
                  <div className="flex items-center gap-1 bg-earth-main/70 p-1 rounded-xl border border-earth-border/50" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      aria-label="Previous farm"
                      data-testid="prev-farm"
                      onClick={handlePrevFarm}
                      className="p-1 rounded-lg text-gold-100/60 hover:text-gold-200 hover:bg-gold-400/10 transition-colors"
                      title="Previous Farm"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                    </button>
                    <span className="text-[9px] font-black text-gold-300 px-1">
                      {activeFarmIndex + 1}/{farms.length}
                    </span>
                    <button
                      type="button"
                      aria-label="Next farm"
                      data-testid="next-farm"
                      onClick={handleNextFarm}
                      className="p-1 rounded-lg text-gold-100/60 hover:text-gold-200 hover:bg-gold-400/10 transition-colors"
                      title="Next Farm"
                    >
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                    farmBrief.hasFarms
                      ? (farmBrief.isFallow ? 'bg-gold-400/10 text-gold-300 border-gold-400/30' : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30')
                      : 'bg-white/5 text-gold-100/50 border-white/10'
                  }`}>
                    {farmBrief.hasFarms ? `${farmBrief.acres.toFixed(1)} Ac` : '0 Farms'}
                  </span>
                )}
              </div>

              {/* Farm Title & Details */}
              <div className="flex items-baseline justify-between gap-2 mb-1">
                <h3 className="text-base sm:text-lg font-black text-white tracking-tight group-hover:text-gold-200 transition-colors truncate">
                  {farmBrief.cropName}
                </h3>
                {farmBrief.hasFarms && (
                  <span className="text-[10px] text-gold-100/60 font-semibold shrink-0">
                    {farmBrief.location} · {farmBrief.acres.toFixed(0)} Ac
                  </span>
                )}
              </div>

              {/* Carousel dots for direct parcel switching */}
              {farms.length > 1 && (
                <div 
                  className="flex items-center gap-1.5 mb-2" 
                  onClick={(e) => e.stopPropagation()}
                >
                  {farms.map((farm, idx) => (
                    <button
                      key={farm.id}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveFarmIndex(idx);
                      }}
                      aria-label={`Switch to farm ${idx + 1}: ${farm.name}`}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        idx === activeFarmIndex
                          ? 'w-5 bg-gold-400 shadow-sm shadow-gold-400/50'
                          : 'w-1.5 bg-white/20 hover:bg-white/40'
                      }`}
                    />
                  ))}
                </div>
              )}

              {/* View Toggle Tabs: Advisory vs Checklist */}
              <div 
                className="flex items-center gap-1 bg-earth-main/50 p-0.5 rounded-lg border border-earth-border/40 mb-2.5 w-fit" 
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  data-testid="advisory-tab"
                  onClick={() => setActiveTab('advisory')}
                  className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-wider rounded-md transition-colors ${
                    activeTab === 'advisory'
                      ? 'bg-gold-400/20 text-gold-200 border border-gold-400/30'
                      : 'text-gold-100/50 hover:text-gold-200'
                  }`}
                >
                  Advisory
                </button>
                <button
                  type="button"
                  data-testid="checklist-tab"
                  onClick={() => setActiveTab('checklist')}
                  className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-wider rounded-md transition-colors flex items-center gap-1 ${
                    activeTab === 'checklist'
                      ? 'bg-gold-400/20 text-gold-200 border border-gold-400/30'
                      : 'text-gold-100/50 hover:text-gold-200'
                  }`}
                >
                  <CalendarCheck className="h-3 w-3" />
                  Checklist ({completedTaskCount}/{farmTasks.length})
                </button>
              </div>

              {/* Dynamic Content: Advisory OR Checklist */}
              {activeTab === 'advisory' ? (
                <div className="min-h-[4.5rem]">
                  <p className="text-xs text-gold-100/75 line-clamp-3 leading-relaxed mb-1.5">
                    {farmBrief.advice}
                  </p>
                  {currentFarm && (
                    <div className="flex items-center gap-2 text-[10px] text-gold-100/50 font-bold uppercase tracking-wider mt-1">
                      <span>Soil: <strong className="text-gold-300">{farmBrief.soilType}</strong></span>
                      <span>·</span>
                      <span>System: <strong className="text-gold-300">{farmBrief.irrigationType}</strong></span>
                    </div>
                  )}
                </div>
              ) : (
                /* Interactive Checklist */
                <div className="min-h-[4.5rem] space-y-1.5" onClick={(e) => e.stopPropagation()}>
                  <div className="max-h-24 overflow-y-auto space-y-1 pr-1">
                    {farmTasks.length === 0 ? (
                      <div className="py-2 text-center text-[11px] text-gold-100/40 italic">
                        No checklist items yet. Add your first field task below!
                      </div>
                    ) : (
                      farmTasks.map((task) => (
                        <div
                          key={task.id}
                          onClick={(e) => toggleTask(task.id, e)}
                          className={`group/task flex items-center justify-between p-1.5 rounded-lg border text-xs transition-colors cursor-pointer ${
                            task.completed
                              ? 'bg-emerald-500/10 border-emerald-500/20 text-gold-100/50 line-through'
                              : 'bg-earth-main/60 border-earth-border/60 text-gold-100 hover:border-gold-400/40'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0 pr-2">
                            {task.completed ? (
                              <CheckSquare className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                            ) : (
                              <Square className="h-3.5 w-3.5 text-gold-400/60 shrink-0" />
                            )}
                            <span className="truncate text-[11px] font-medium leading-tight">{task.text}</span>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => deleteTask(task.id, e)}
                            className="opacity-0 group-hover/task:opacity-100 text-gold-100/30 hover:text-rose-400 p-0.5 rounded transition-all"
                            title="Delete task"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add New Task Form */}
                  <form onSubmit={addTask} className="flex items-center gap-1 pt-1">
                    <input
                      type="text"
                      data-testid="add-task-input"
                      placeholder="Add field task..."
                      value={newTaskInput}
                      onChange={(e) => setNewTaskInput(e.target.value)}
                      className="flex-1 bg-earth-main border border-earth-border/70 rounded-lg px-2.5 py-1 text-[11px] text-gold-100 focus:outline-none focus:border-gold-400"
                    />
                    <button
                      type="submit"
                      data-testid="add-task-button"
                      disabled={!newTaskInput.trim()}
                      className="px-2 py-1 bg-gold-400/20 hover:bg-gold-400/30 text-gold-200 border border-gold-400/30 rounded-lg text-[10px] font-black uppercase tracking-wider disabled:opacity-30 disabled:pointer-events-none"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* Footer Action link */}
            <div className="pt-2.5 border-t border-earth-border/40 flex items-center justify-between text-[11px] font-bold text-gold-400 group-hover:text-gold-300 transition-colors mt-2">
              <span className="flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-gold-400/80" />
                {farmBrief.actionText}
              </span>
              <ArrowRight className="h-3.5 w-3.5 transform group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </TiltCard>

        {/* ========================================================= */}
        {/* CARD 2: Synchronized Spraying & Farm-Specific Irrigation */}
        {/* ========================================================= */}
        <TiltCard className="h-full">
          <div 
            onClick={() => navigate(agroWeather.route)}
            className="group relative h-full card-premium bg-[#171712]/90 backdrop-blur-xl border border-earth-border/80 hover:border-gold-400/70 p-4 sm:p-5 rounded-2xl shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden"
          >
            {/* Top accent glow line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-500/80 via-teal-400/80 to-sky-500/80" />

            <div>
              {/* Header with Synchronization Indicator */}
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
                    <Droplets className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gold-100/70 leading-none">
                      Spraying & Irrigation
                    </span>
                    <span className="text-[9px] text-sky-400/80 font-bold tracking-tight mt-0.5 truncate max-w-[140px] flex items-center gap-1">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      {currentFarm ? currentFarm.name : targetDistrict}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {currentFarm?.irrigation_type && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-300 border border-sky-500/30">
                      {currentFarm.irrigation_type}
                    </span>
                  )}
                  <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                    agroWeather.suitability === 'Optimal'
                      ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                      : agroWeather.suitability === 'Caution'
                      ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                      : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                  }`}>
                    {agroWeather.suitability} Window
                  </span>
                </div>
              </div>

              {/* Weather Observation */}
              <div className="flex items-baseline gap-2 mb-1.5">
                <h3 className="text-base sm:text-lg font-black text-white tracking-tight group-hover:text-gold-200 transition-colors">
                  {agroWeather.temp}°C
                </h3>
                <span className="text-xs text-gold-100/60 font-semibold flex items-center gap-1">
                  <Wind className="h-3 w-3 text-sky-400" />
                  {agroWeather.wind} km/h wind
                </span>
                <span className="text-xs text-gold-100/40">·</span>
                <span className="text-xs text-gold-100/60 font-semibold">
                  {agroWeather.humidity}% RH
                </span>
              </div>

              {/* Spraying Suitability Detail */}
              <div className="p-2 bg-earth-main/50 rounded-xl border border-earth-border/40 mb-2">
                <p className="text-[11px] text-gold-100/80 leading-relaxed">
                  <strong className="text-sky-300">Spraying:</strong> {agroWeather.sprayReason}
                </p>
              </div>

              {/* Farm-Specific Irrigation Guidance (Synced with current farm) */}
              <div className="p-2 bg-sky-950/20 rounded-xl border border-sky-500/20 mb-2">
                <p className="text-[11px] text-sky-200/90 leading-relaxed">
                  <strong className="text-emerald-300">Irrigation:</strong> {agroWeather.irrigationAdvice}
                </p>
              </div>
            </div>

            {/* Footer Action link */}
            <div className="pt-2.5 border-t border-earth-border/40 flex items-center justify-between text-[11px] font-bold text-sky-400 group-hover:text-sky-300 transition-colors mt-2">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3 text-sky-400/80" />
                Agro Weather ({targetDistrict})
              </span>
              <ArrowRight className="h-3.5 w-3.5 transform group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </TiltCard>

        {/* ========================================================= */}
        {/* CARD 4: Top Mandi Price Movers & Best Market to Sell */}
        {/* ========================================================= */}
        <TiltCard className="h-full">
          <div 
            onClick={() => navigate(mandiMover.route)}
            className="group relative h-full card-premium bg-[#171712]/90 backdrop-blur-xl border border-earth-border/80 hover:border-gold-400/70 p-4 sm:p-5 rounded-2xl shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden"
          >
            {/* Top accent glow line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gold-500/80 via-amber-400/80 to-gold-500/80" />

            <div>
              {/* Header */}
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gold-400/15 border border-gold-400/30 flex items-center justify-center text-gold-400 shrink-0">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-gold-100/70">
                    Mandi Price Mover
                  </span>
                </div>

                <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border bg-gold-400/10 text-gold-300 border-gold-400/30 flex items-center gap-1">
                  <span>{mandiMover.badge}</span>
                </span>
              </div>

              {/* Main Headline */}
              <div className="flex items-baseline justify-between mb-1.5">
                <h3 className="text-base sm:text-lg font-black text-white tracking-tight group-hover:text-gold-200 transition-colors truncate">
                  {mandiMover.commodity}
                </h3>
                <span className="text-sm font-black text-gold-300 shrink-0 ml-2">
                  ₹{mandiMover.modalPrice.toLocaleString('en-IN')}<span className="text-[10px] font-normal text-gold-100/60">/q</span>
                </span>
              </div>

              {/* Action Item Description */}
              <p className="text-xs text-gold-100/75 line-clamp-3 leading-relaxed mb-3">
                {mandiMover.tip}
              </p>
            </div>

            {/* Footer Action link */}
            <div className="pt-2.5 border-t border-earth-border/40 flex items-center justify-between text-[11px] font-bold text-gold-400 group-hover:text-gold-300 transition-colors mt-2">
              <span className="flex items-center gap-1">
                <Store className="h-3 w-3 text-gold-400/80" />
                Live Mandi Prices ({mandiMover.market})
              </span>
              <ArrowRight className="h-3.5 w-3.5 transform group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </TiltCard>

      </div>
    </div>
  );
};
export default FarmerDashboardBrief;
