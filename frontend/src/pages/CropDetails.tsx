import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ArrowLeft, DollarSign, Droplets, MapPin, _ListChecks, Sprout, AlertTriangle,
  Beaker, _Zap, Calendar, Wind, Shield, BarChart3, TrendingUp, History, Info,
  Leaf, Settings, ExternalLink, Activity, Printer
} from 'lucide-react';
import { apiGet } from '@/lib/httpClient';
import { Badge } from '@/components/ui/badge';
import { ScrollReveal } from '@/components/ui/animations';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { resolveCropImage, getCropImage } from '@/lib/cropImages';
import { formatCurrency } from '@/data/masterData';
import { CropDetailsShimmer } from '@/components/ui/loading-shimmer';

const slugify = (text: string) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')     // Remove special characters
    .replace(/[\s/]+/g, '-')       // Replace spaces and slashes with a single dash
    .replace(/-+/g, '-')           // Replace multiple consecutive dashes with a single dash
    .replace(/^-+|-+$/g, '');      // Remove leading and trailing dashes
};

const getSeasonCalendar = (seasonStr: string, cropName: string = '') => {
  const normalized = (seasonStr || '').toLowerCase();
  const name = (cropName || '').toLowerCase();
  const months = [
    { name: 'Jan' }, { name: 'Feb' }, { name: 'Mar' }, { name: 'Apr' },
    { name: 'May' }, { name: 'Jun' }, { name: 'Jul' }, { name: 'Aug' },
    { name: 'Sep' }, { name: 'Oct' }, { name: 'Nov' }, { name: 'Dec' }
  ];

  const isPerennial = normalized.includes('perennial') || normalized.includes('year-round');

  return months.map((m, idx) => {
    let isSowing = false;
    let isHarvest = false;

    if (isPerennial) {
      // Perennial crops are sown/planted ONCE (one-time sowing),
      // so we do not show a recurring annual sowing window. Only the harvest window is shown.
      isSowing = false;

      // Specific harvesting windows for perennial crops in India/Karnataka
      if (name.includes('coconut')) {
        isHarvest = true; // Year-round harvest
      } else if (name.includes('arecanut') || name.includes('areca')) {
        isHarvest = idx >= 9 || idx <= 2; // Oct to Mar
      } else if (name.includes('coffee')) {
        isHarvest = idx >= 10 || idx <= 2; // Nov to Mar
      } else if (name.includes('mango')) {
        isHarvest = idx >= 3 && idx <= 6; // Apr to Jul
      } else if (name.includes('grapes') || name.includes('grape')) {
        isHarvest = idx >= 0 && idx <= 3; // Jan to Apr
      } else if (name.includes('pepper')) {
        isHarvest = idx >= 11 || idx <= 2; // Dec to Mar
      } else if (name.includes('cardamom')) {
        isHarvest = idx >= 7 || idx <= 1; // Aug to Feb
      } else if (name.includes('cocoa')) {
        isHarvest = true; // Year-round
      } else if (name.includes('rubber')) {
        isHarvest = idx !== 5 && idx !== 6; // Aug to May (exclude heavy monsoon Jun-Jul)
      } else if (name.includes('tea')) {
        isHarvest = idx >= 2 && idx <= 10; // Mar to Nov
      } else {
        isHarvest = true; // Default to year-round harvest for other perennial crops
      }
    } else if (normalized.includes('kharif')) {
      // Sowing: June - Aug (indices 5, 6, 7)
      // Harvest: Oct - Dec (indices 9, 10, 11)
      if (idx >= 5 && idx <= 7) isSowing = true;
      if (idx >= 9 && idx <= 11) isHarvest = true;
    } else if (normalized.includes('rabi')) {
      // Sowing: Oct - Nov (indices 9, 10)
      // Harvest: Feb - Apr (indices 1, 2, 3)
      if (idx >= 9 && idx <= 10) isSowing = true;
      if (idx >= 1 && idx <= 3) isHarvest = true;
    } else if (normalized.includes('summer') || normalized.includes('zaid')) {
      // Sowing: Jan - Feb (indices 0, 1)
      // Harvest: May - Jun (indices 4, 5)
      if (idx >= 0 && idx <= 1) isSowing = true;
      if (idx >= 4 && idx <= 5) isHarvest = true;
    } else if (normalized.includes('pre-monsoon')) {
      // Sowing: Mar - Apr (indices 2, 3)
      // Harvest: Jul - Aug (indices 6, 7)
      if (idx >= 2 && idx <= 3) isSowing = true;
      if (idx >= 6 && idx <= 7) isHarvest = true;
    } else {
      // Standard annual crop fallback (Kharif-like)
      if (idx >= 5 && idx <= 7) isSowing = true;
      if (idx >= 9 && idx <= 11) isHarvest = true;
    }

    return { ...m, isSowing, isHarvest };
  });
};

export default function CropDetails() {
  const { cropName } = useParams<{ cropName: string }>();
  const navigate = useNavigate();
  const [crop, setCrop] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchCropDetails = async () => {
      try {
        setLoading(true);
        const decodedParam = decodeURIComponent(cropName || '').toLowerCase().trim();

        // Fetch all crops to find an exact or fuzzy match
        const allData = await apiGet('/api/crops?page=0&size=100&sortBy=name');
        const allCrops = allData?.content || [];

        const found = allCrops.find((c: any) => {
          const name = c.name.toLowerCase().trim();
          const slugName = slugify(c.name);
          return name === decodedParam ||
            slugName === decodedParam ||
            name.includes(decodedParam) ||
            decodedParam.includes(name) ||
            slugName.includes(decodedParam) ||
            decodedParam.includes(slugName);
        });

        if (found) {
          const fullDetails = await apiGet(`/api/crops/${found.id}`);
          setCrop(fullDetails);
        } else {
          // Fallback: search endpoint
          const results = await apiGet(`/api/crops/search?query=${encodeURIComponent(cropName || '')}`);
          if (results && results.length > 0) {
            const fullDetails = await apiGet(`/api/crops/${results[0].id}`);
            setCrop(fullDetails);
          }
        }
      } catch (error) {
        console.error('Failed to fetch crop details:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCropDetails();
  }, [cropName]);

  if (loading) {
    return (
      <div className="pt-24 px-4 sm:px-6 lg:px-8 pb-12 max-w-7xl mx-auto animate-fade-in">
        <CropDetailsShimmer />
      </div>
    );
  }

  if (!crop) {
    return (
      <div className="pt-24 px-4 sm:px-6 lg:px-8 pb-12 max-w-7xl mx-auto animate-fade-in">
        <div className="text-center py-24 bg-earth-card rounded-2xl border border-earth-border shadow-2xl">
          <AlertTriangle className="h-20 w-20 text-gold-400 mx-auto mb-6 opacity-20" />
          <h2 className="text-3xl font-black text-gold-100 mb-4 tracking-tighter">ANALYTICS UNAVAILABLE</h2>
          <p className="text-gold-100/60 mb-10 max-w-md mx-auto text-sm leading-relaxed uppercase tracking-wide">
            Our neural network couldn't find localized intelligence for <span className="text-gold-400 font-bold">{cropName}</span>.
            The system may be updating its database for this region.
          </p>
          <Button onClick={() => navigate('/crops')} className="btn-gold px-10 py-6 text-sm font-black uppercase tracking-widest h-auto">
            Explore Registry
          </Button>
        </div>
      </div>
    );
  }

  const displayImage = resolveCropImage(crop);

  return (
    <div className="pt-24 px-4 sm:px-6 lg:px-8 pb-12 max-w-7xl mx-auto animate-fade-in">
      {/* Stylesheet for print report */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @media print {
          body, html {
            background: white !important;
            color: black !important;
          }
          .no-print, header, aside, button, nav, .btn-gold, [role="tablist"] {
            display: none !important;
          }
          .print-only {
            display: block !important;
          }
          .print-container {
            color: black !important;
            padding: 20px !important;
          }
          .card-premium {
            border: 1px solid #ddd !important;
            background: transparent !important;
            box-shadow: none !important;
            color: black !important;
          }
          .text-gold-100, .text-gold-400, .text-gold-300 {
            color: black !important;
          }
          .bg-earth-main, .bg-earth-elevated {
            background: #f9f9f9 !important;
            border-color: #eee !important;
          }
          .print-badge {
            border: 1px solid #333 !important;
            color: black !important;
            background: transparent !important;
          }
        }
      `}} />

      <div className="space-y-8 pb-12 print-container">
        {/* Navigation & Print Actions */}
        <div className="flex justify-between items-center no-print">
          <ScrollReveal direction="left" delay={0.1}>
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="group text-gold-100/60 hover:text-gold-400 hover:bg-gold-400/5 transition-all"
            >
              <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              My Farms
            </Button>
          </ScrollReveal>
          <ScrollReveal direction="right" delay={0.1}>
            <Button
              onClick={() => window.print()}
              className="btn-gold flex items-center gap-2 py-5 px-6 rounded-2xl"
            >
              <Printer className="h-4 w-4" />
              Print Precision Report
            </Button>
          </ScrollReveal>
        </div>

        {/* Print Only Header */}
        <div className="hidden print:block border-b-2 border-black pb-4 mb-6">
          <h1 className="text-3xl font-black tracking-tight">AGRI COMPASS PRECISION REPORT</h1>
          <p className="text-xs uppercase tracking-widest font-bold">Crop Technical Sheet & Agronomic Advisory</p>
        </div>

        {/* Hero Section */}
        <ScrollReveal direction="up" delay={0.2}>
          <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-border h-[320px] mb-8 w-full">
            {displayImage ? (
              <img
                src={displayImage}
                alt={crop.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.src = getCropImage('default');
                }}
              />
            ) : (
              <div className="w-full h-full bg-surface flex items-center justify-center">
                <Sprout className="h-24 w-24 text-gold-primary/20" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent print:hidden" />
            <div className="absolute bottom-8 left-10 right-10 flex flex-col md:flex-row md:items-end justify-between gap-6 print:relative print:bottom-0 print:left-0 print:right-0 print:text-black">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Badge className="bg-gold-400 text-earth-main font-black px-4 py-1.5 text-[10px] uppercase tracking-widest shadow-lg print:border print:border-black print:text-black print:bg-transparent">
                    {crop.season} SEEDING
                  </Badge>
                  <Badge variant="outline" className="border-gold-400/30 text-gold-400 font-black px-4 py-1.5 text-[10px] uppercase tracking-widest bg-earth-main/60 backdrop-blur-md print:border-black print:text-black">
                    {crop.durationDays} DAY CYCLE
                  </Badge>
                  {crop.difficultyLevel && (
                    <Badge
                      variant="outline"
                      className={`font-black px-4 py-1.5 text-[10px] uppercase tracking-widest bg-earth-main/60 backdrop-blur-md print:border-black print:text-black ${crop.difficultyLevel.toLowerCase() === 'easy'
                          ? 'border-green-500/30 text-green-400'
                          : crop.difficultyLevel.toLowerCase() === 'hard'
                            ? 'border-red-500/30 text-red-400'
                            : 'border-gold-400/30 text-gold-300'
                        }`}
                    >
                      {crop.difficultyLevel} DIFFICULTY
                    </Badge>
                  )}
                </div>
                <h1 className="text-6xl font-black text-gold-100 tracking-tighter leading-none mb-2 drop-shadow-2xl print:text-black print:text-4xl">{crop.name}</h1>
                {crop.scientificName && crop.scientificName.toLowerCase() !== 'unknown' && (
                  <p className="text-xl italic text-gold-300/80 mb-3 font-medium drop-shadow-2xl print:text-black print:text-lg">{crop.scientificName}</p>
                )}
                <p className="text-gold-400 font-bold flex items-center tracking-widest text-xs uppercase bg-earth-main/30 backdrop-blur-sm w-fit px-3 py-1 rounded-full border border-gold-400/20 print:text-black print:border-none">
                  <MapPin className="h-3 w-3 mr-1.5" /> High Compatibility: {crop.recommendedDistricts?.slice(0, 3).join(', ') || 'Global'}
                </p>
              </div>
              <div className="bg-earth-main/60 backdrop-blur-xl p-6 rounded-3xl border border-gold-400/20 shadow-2xl min-w-[200px] print:hidden">
                <div className="text-[10px] text-gold-100/40 uppercase tracking-widest font-black mb-1">Climate Suitability</div>
                <div className="text-4xl font-black text-gold-100 flex items-end gap-1">
                  {crop.aiScore?.climateSuitabilityScore || 85}<span className="text-gold-400 text-xl">%</span>
                </div>
                <Progress value={crop.aiScore?.climateSuitabilityScore || 85} className="h-1.5 bg-earth-border mt-3" indicatorClassName="bg-gold-400" />
              </div>
            </div>
          </div>
        </ScrollReveal>

        <div className="space-y-8">

          {/* Calendar and Core Requirements Row */}
          <ScrollReveal direction="up" delay={0.35}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-3">
                <Card className="card-premium h-full">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-xs text-gold-400 font-black uppercase tracking-widest flex items-center">
                      <Calendar className="mr-2 h-4 w-4" /> Sowing & Harvesting Calendar
                    </CardTitle>
                    <CardDescription className="text-gold-100/40">Optimal months for the {crop.season || 'Annual'} cropping cycle in Karnataka</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <div className="grid grid-cols-12 gap-1 text-center">
                      {getSeasonCalendar(crop.season, crop.name).map((month, idx) => (
                        <div key={idx} className="flex flex-col items-center">
                          <span className="text-[10px] font-black text-gold-100/40 mb-2 uppercase">{month.name}</span>
                          <div
                            className={`w-full h-8 rounded-md flex items-center justify-center text-[10px] font-black transition-all ${month.isSowing
                                ? 'bg-gold-400 text-earth-main shadow-[0_0_8px_rgba(186,117,23,0.4)] font-bold'
                                : month.isHarvest
                                  ? 'bg-green-500 text-earth-main shadow-[0_0_8px_rgba(34,197,94,0.4)] font-bold'
                                  : 'bg-earth-elevated/40 text-gold-100/20 border border-earth-border/40'
                              }`}
                          >
                            {month.isSowing ? 'SOW' : month.isHarvest ? 'HARV' : '-'}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 mt-4 justify-between items-start sm:items-center text-[10px] font-black tracking-widest uppercase">
                      <div className="flex gap-4">
                        {!(crop.season || '').toLowerCase().includes('perennial') && !(crop.season || '').toLowerCase().includes('year-round') && (
                          <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded bg-gold-400" />
                            <span className="text-gold-100/60">Sowing Window</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5">
                          <div className="w-3 h-3 rounded bg-green-500" />
                          <span className="text-gold-100/60">Harvesting Window</span>
                        </div>
                      </div>
                      {((crop.season || '').toLowerCase().includes('perennial') || (crop.season || '').toLowerCase().includes('year-round')) && (
                        <span className="text-gold-400/80 font-bold normal-case text-[10px] italic">
                          * Perennial crop: One-time planting/sowing, recurring harvests.
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </ScrollReveal>

          {/* Intelligence Tabs */}
          <ScrollReveal direction="up" delay={0.4}>
            <Tabs defaultValue="agronomics" className="w-full">
              <TabsList className="bg-earth-elevated/50 p-1.5 rounded-2xl border border-earth-border w-full justify-start h-auto gap-2 mb-8 overflow-x-auto">
                <TabsTrigger value="agronomics" className="rounded-xl px-6 py-3 data-[state=active]:bg-gold-400 data-[state=active]:text-earth-main font-black text-xs uppercase tracking-widest transition-all">
                  <Sprout className="h-4 w-4 mr-2" /> Agronomics
                </TabsTrigger>
                <TabsTrigger value="intelligence" className="rounded-xl px-6 py-3 data-[state=active]:bg-gold-400 data-[state=active]:text-earth-main font-black text-xs uppercase tracking-widest transition-all">
                  <Activity className="h-4 w-4 mr-2" /> AI Intelligence
                </TabsTrigger>
                <TabsTrigger value="management" className="rounded-xl px-6 py-3 data-[state=active]:bg-gold-400 data-[state=active]:text-earth-main font-black text-xs uppercase tracking-widest transition-all">
                  <Settings className="h-4 w-4 mr-2" /> Management
                </TabsTrigger>
                <TabsTrigger value="economics" className="rounded-xl px-6 py-3 data-[state=active]:bg-gold-400 data-[state=active]:text-earth-main font-black text-xs uppercase tracking-widest transition-all">
                  <BarChart3 className="h-4 w-4 mr-2" /> Financials
                </TabsTrigger>
              </TabsList>

              <TabsContent value="agronomics" className="space-y-8 mt-0 outline-none">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <Card className="card-premium h-full">
                    <CardHeader className="border-b border-earth-border/30">
                      <CardTitle className="text-sm text-gold-400 font-black uppercase tracking-widest flex items-center">
                        <Wind className="mr-2 h-4 w-4" /> Environmental
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-6">
                      <div>
                        <span className="text-[10px] font-black text-gold-100/30 uppercase tracking-widest block mb-2">Soil Type</span>
                        <p className="text-gold-100 text-lg font-bold">{crop.soilType}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-earth-elevated rounded-xl border border-earth-border">
                          <span className="text-[10px] font-black text-gold-100/30 uppercase tracking-widest block mb-1">pH Range</span>
                          <span className="text-sm font-bold text-gold-400">{crop.soilRequirement?.phRange || '6.0-7.5'}</span>
                        </div>
                        <div className="p-3 bg-earth-elevated rounded-xl border border-earth-border">
                          <span className="text-[10px] font-black text-gold-100/30 uppercase tracking-widest block mb-1">Organic C</span>
                          <span className="text-sm font-bold text-gold-400">{crop.soilRequirement?.organicCarbon || 'Medium'}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="card-premium h-full">
                    <CardHeader className="border-b border-earth-border/30">
                      <CardTitle className="text-sm text-gold-400 font-black uppercase tracking-widest flex items-center">
                        <Droplets className="mr-2 h-4 w-4" /> Hydration
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-6">
                      <div>
                        <span className="text-[10px] font-black text-gold-100/30 uppercase tracking-widest block mb-2">Annual Rainfall</span>
                        <p className="text-gold-100 text-lg font-bold">{crop.rainfallMm} mm</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-black text-gold-100/30 uppercase tracking-widest block mb-2">Recommended Methods</span>
                        <div className="flex flex-wrap gap-2">
                          {crop.irrigations?.map((method: string, i: number) => (
                            <Badge key={i} className="bg-earth-elevated text-gold-100/60 border-earth-border px-3 py-1 text-[10px] uppercase font-black">
                              {method}
                            </Badge>
                          )) || <Badge className="bg-earth-elevated text-gold-100/60 border-earth-border px-3 py-1 text-[10px] uppercase font-black">Standard</Badge>}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="card-premium h-full">
                    <CardHeader className="border-b border-earth-border/30">
                      <CardTitle className="text-sm text-gold-400 font-black uppercase tracking-widest flex items-center">
                        <Beaker className="mr-2 h-4 w-4" /> Nutrients
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-gold-100/40">Nitrogen (N)</span>
                          <span className="text-sm font-black text-gold-100">{crop.nutrient?.nitrogenKg || 0} kg/acre</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-gold-100/40">Phosphorus (P)</span>
                          <span className="text-sm font-black text-gold-100">{crop.nutrient?.phosphorusKg || 0} kg/acre</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-gold-100/40">Potassium (K)</span>
                          <span className="text-sm font-black text-gold-100">{crop.nutrient?.potassiumKg || 0} kg/acre</span>
                        </div>
                        <div className="pt-4 border-t border-earth-border/30">
                          <span className="text-[10px] font-black text-gold-100/30 uppercase tracking-widest block mb-2">Crop Rotation</span>
                          <p className="text-xs text-gold-100/70 italic">"{crop.soilRequirement?.cropRotation || 'Standard seasonal rotation recommended.'}"</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="intelligence" className="mt-0 outline-none">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Card className="card-premium h-full">
                    <CardHeader>
                      <CardTitle className="text-lg text-gold-100 font-black tracking-tight flex items-center">
                        <Activity className="mr-2 h-5 w-5 text-gold-400" /> AI Compatibility Scores
                      </CardTitle>
                      <CardDescription className="text-gold-100/40">Neural network analysis based on regional variables</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8">
                      <div className="space-y-3">
                        <div className="flex justify-between text-xs font-black uppercase tracking-widest">
                          <span className="text-gold-100/60">Profitability</span>
                          <span className="text-gold-400">{crop.aiScore?.profitabilityScore || 0}%</span>
                        </div>
                        <Progress value={crop.aiScore?.profitabilityScore || 0} className="h-2 bg-earth-border" indicatorClassName="bg-gold-400 shadow-[0_0_10px_rgba(212,175,55,0.5)]" />
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between text-xs font-black uppercase tracking-widest">
                          <span className="text-gold-100/60">Soil Suitability</span>
                          <span className="text-gold-400">{crop.aiScore?.soilSuitabilityScore || 0}%</span>
                        </div>
                        <Progress value={crop.aiScore?.soilSuitabilityScore || 0} className="h-2 bg-earth-border" indicatorClassName="bg-gold-400" />
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between text-xs font-black uppercase tracking-widest">
                          <span className="text-gold-100/60">Water Efficiency</span>
                          <span className="text-gold-400">{crop.aiScore?.waterEfficiencyScore || 0}%</span>
                        </div>
                        <Progress value={crop.aiScore?.waterEfficiencyScore || 0} className="h-2 bg-earth-border" indicatorClassName="bg-gold-400" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="card-premium h-full">
                    <CardHeader>
                      <CardTitle className="text-lg text-gold-100 font-black tracking-tight flex items-center">
                        <Leaf className="mr-2 h-5 w-5 text-gold-400" /> Environmental Impact
                      </CardTitle>
                      <CardDescription className="text-gold-100/40">Sustainability and ecological footprint analysis</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-center justify-between p-4 bg-earth-elevated rounded-2xl border border-earth-border">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-500/10 rounded-lg"><Wind className="h-4 w-4 text-green-500" /></div>
                          <span className="text-xs font-bold text-gold-100/70">Carbon Footprint</span>
                        </div>
                        <span className="text-sm font-black text-gold-100 uppercase tracking-widest">LOW</span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-earth-elevated rounded-2xl border border-earth-border">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-500/10 rounded-lg"><Droplets className="h-4 w-4 text-blue-500" /></div>
                          <span className="text-xs font-bold text-gold-100/70">Water Consumption</span>
                        </div>
                        <span className="text-sm font-black text-gold-100 uppercase tracking-widest">MODERATE</span>
                      </div>
                      <div className="flex flex-col items-center justify-center p-8 bg-earth-main/50 rounded-2xl border border-gold-400/20 mt-4">
                        <div className="text-[10px] text-gold-400 uppercase tracking-[0.2em] font-black mb-2">Sustainability Rating</div>
                        <div className="text-5xl font-black text-gold-100">{crop.aiScore?.sustainabilityRating || 8.5}<span className="text-gold-400 text-xl">/10</span></div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="management" className="mt-0 outline-none">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-8">
                    {crop.growingSteps && crop.growingSteps.length > 0 && (
                      <Card className="card-premium">
                        <CardHeader className="border-b border-earth-border/30">
                          <CardTitle className="text-lg text-gold-100 font-black tracking-tight">Cultivation Architecture</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                          <div className="divide-y divide-earth-border">
                            {crop.growingSteps.map((step: any, idx: number) => (
                              <div key={idx} className="flex gap-6 p-6 hover:bg-earth-elevated/20 transition-colors group">
                                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-earth-elevated text-gold-400 border border-earth-border flex items-center justify-center font-black shadow-lg group-hover:bg-gold-400 group-hover:text-earth-main transition-all">
                                  {step.stepNumber}
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-bold text-gold-100 uppercase tracking-tight text-sm">{step.title}</h4>
                                  <p className="text-gold-100/50 mt-1 text-xs leading-relaxed">{step.details}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>

                  <div className="space-y-8">
                    {crop.diseases && crop.diseases.length > 0 && (
                      <Card className="card-premium border-red-500/10">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-xs text-red-400 font-black uppercase tracking-widest flex items-center">
                            <AlertTriangle className="mr-2 h-4 w-4" /> Pathogen Alerts
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {crop.diseases.map((disease: any, i: number) => (
                            <div key={i} className="p-4 bg-red-500/5 rounded-2xl border border-red-500/10">
                              <h5 className="text-sm font-bold text-red-400 uppercase tracking-tight mb-1">{disease.name}</h5>
                              <p className="text-[10px] text-gold-100/40 mb-2 italic">"{disease.symptoms}"</p>
                              <div className="text-[10px] font-black text-gold-100/60 leading-relaxed bg-earth-main/50 p-2 rounded-lg">
                                <span className="text-red-400">MANAGEMENT:</span> {disease.management}
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    )}

                    {crop.postHarvest && (
                      <Card className="card-premium">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-xs text-gold-400 font-black uppercase tracking-widest flex items-center">
                            <History className="mr-2 h-4 w-4" /> Post-Harvest
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-gold-100/40">Storage Mode</span>
                            <span className="font-bold text-gold-100">{crop.postHarvest.storageMethod || 'Dry'}</span>
                          </div>
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-gold-100/40">Duration</span>
                            <span className="font-bold text-gold-100">{crop.postHarvest.storageDurationMonths || 6} Months</span>
                          </div>
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-gold-100/40">Processing</span>
                            <span className="font-bold text-gold-400">{crop.postHarvest.processingRequired ? 'Required' : 'None'}</span>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="economics" className="mt-0 outline-none">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <Card className="card-premium h-full">
                    <CardHeader>
                      <CardTitle className="text-lg text-gold-100 font-black tracking-tight flex items-center">
                        <DollarSign className="mr-2 h-5 w-5 text-gold-400" /> Yield Projections
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="p-5 bg-earth-elevated rounded-2xl border border-earth-border text-center">
                          <div className="text-[10px] text-gold-100/30 uppercase tracking-widest font-black mb-1">Minimum</div>
                          <div className="text-3xl font-black text-gold-100">{Math.round(crop.yieldInfo?.minimumQuintals || 0)}</div>
                          <div className="text-[10px] text-gold-400 font-bold">Quintals</div>
                        </div>
                        <div className="p-5 bg-gold-400/5 rounded-2xl border border-gold-400/20 text-center">
                          <div className="text-[10px] text-gold-400 uppercase tracking-widest font-black mb-1">Average</div>
                          <div className="text-3xl font-black text-gold-100">{Math.round(crop.yieldInfo?.averageQuintals || 0)}</div>
                          <div className="text-[10px] text-gold-400 font-bold">Quintals</div>
                        </div>
                        <div className="p-5 bg-earth-elevated rounded-2xl border border-earth-border text-center">
                          <div className="text-[10px] text-gold-100/30 uppercase tracking-widest font-black mb-1">Best Practice</div>
                          <div className="text-3xl font-black text-gold-100">{Math.round(crop.yieldInfo?.bestPracticeQuintals || 0)}</div>
                          <div className="text-[10px] text-gold-400 font-bold">Quintals</div>
                        </div>
                      </div>
                      <div className="mt-8 p-6 bg-earth-main/50 rounded-2xl border border-earth-border">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 bg-gold-400/10 rounded-lg"><TrendingUp className="h-4 w-4 text-gold-400" /></div>
                          <h4 className="text-xs font-black uppercase tracking-widest text-gold-100">Economic Breakdown</h4>
                        </div>
                        <div className="space-y-4">
                          <div className="flex justify-between text-sm">
                            <span className="text-gold-100/40">Production Cost</span>
                            <span className="font-bold text-gold-100">{formatCurrency(crop.investmentPerAcre || 0)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gold-100/40">Market Potential</span>
                            <span className="font-bold text-gold-100">{formatCurrency(crop.expectedReturns || 0)}</span>
                          </div>
                          <div className="pt-4 border-t border-earth-border flex justify-between text-lg">
                            <span className="font-black text-gold-100 tracking-tight">NET PROFIT</span>
                            <span className="font-black text-gold-400 tracking-tight">{formatCurrency((crop.expectedReturns || 0) - (crop.investmentPerAcre || 0))}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="card-premium h-full overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                      <DollarSign className="h-64 w-64" />
                    </div>
                    <CardHeader>
                      <CardTitle className="text-lg text-gold-100 font-black tracking-tight">Strategic Guidance</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <p className="text-gold-100/70 text-sm leading-relaxed italic">
                        "{crop.guidelines}"
                      </p>
                      <div className="space-y-4 pt-4">
                        <div className="flex items-center gap-3 text-xs font-bold text-gold-400">
                          <Info className="h-4 w-4" /> Export Potential: {crop.marketInfo?.exportPotential}
                        </div>
                        <div className="flex items-center gap-3 text-xs font-bold text-gold-100/60">
                          <Calendar className="h-4 w-4" /> Sowing Window: {crop.recommendedDistricts?.length > 0 ? 'Localized Optimal' : 'Seasonal Standard'}
                        </div>
                        <Button className="w-full btn-gold py-6 rounded-2xl group mt-4">
                          Download Precision Guide <ExternalLink className="ml-2 h-4 w-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-gold-400 to-gold-600 text-earth-main border-none shadow-gold-glow h-full flex flex-col group hover:scale-[1.02] transition-transform duration-500 rounded-3xl overflow-hidden">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-earth-main font-black flex items-center uppercase tracking-tighter text-xl">
                        <TrendingUp className="mr-2 h-6 w-6" /> Market Intel
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 flex-1 flex flex-col justify-center">
                      <div className="bg-earth-main/10 p-5 rounded-2xl border border-earth-main/5 backdrop-blur-sm">
                        <div className="text-[10px] text-earth-main/60 uppercase tracking-widest font-black mb-1">Average MSP</div>
                        <div className="text-4xl font-black tracking-tighter">{formatCurrency(crop.marketInfo?.averageMsp || 0)}</div>
                      </div>
                      <div className="bg-earth-main/10 p-5 rounded-2xl border border-earth-main/5 backdrop-blur-sm">
                        <div className="text-[10px] text-earth-main/60 uppercase tracking-widest font-black mb-1">Projected Returns</div>
                        <div className="text-4xl font-black tracking-tighter">{formatCurrency(crop.expectedReturns || 0)}</div>
                      </div>
                      <div className="flex items-center justify-between px-2 pt-2">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          <span className="text-xs font-bold uppercase tracking-tight">Demand: {crop.marketInfo?.marketDemand || 'High'}</span>
                        </div>
                        <div className="h-2 w-2 rounded-full bg-earth-main animate-pulse" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </ScrollReveal>
        </div>
      </div>
    </div>
  );
}
