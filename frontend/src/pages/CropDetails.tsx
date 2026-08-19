import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ArrowLeft, DollarSign, Droplets, MapPin, _ListChecks, Sprout, AlertTriangle,
  Beaker, _Zap, Calendar, Wind, Shield, BarChart3, TrendingUp, History, Info,
  Leaf, Settings, ExternalLink, Activity, Printer, Brain
} from 'lucide-react';
import { apiGet } from '@/lib/httpClient';
import { Badge } from '@/components/ui/badge';
import { ScrollReveal } from '@/components/ui/animations';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { resolveCropImage, getCropImage } from '@/lib/cropImages';
import { formatCurrency } from '@/data/masterData';
import { CropDetailsShimmer } from '@/components/ui/loading-shimmer';
import { useCropDetail } from '@/hooks/useCropGuides';
import { PdfDownloadButton } from '@/components/ui/PdfDownloadButton';
import type { CropDetail } from '@/types/cropGuide';

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
  const { crop, loading, error } = useCropDetail(cropName ?? "");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [cropName]);

  if (loading) {
    return (
      <div className="pt-24 px-4 sm:px-6 lg:px-8 pb-12 max-w-7xl mx-auto animate-fade-in">
        <CropDetailsShimmer />
      </div>
    );
  }

  if (error || !crop) {
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
          [role="tabpanel"][data-state="inactive"] {
            display: block !important;
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
                      className={`font-black px-4 py-1.5 text-[10px] uppercase tracking-widest bg-earth-main/60 backdrop-blur-md print:border-black print:text-black ${crop.difficulty?.toLowerCase() === 'easy'
                          ? 'border-green-500/30 text-green-400'
                          : crop.difficulty?.toLowerCase() === 'hard'
                            ? 'border-red-500/30 text-red-400'
                            : 'border-gold-400/30 text-gold-300'
                        }`}
                    >
                      {crop.difficulty} DIFFICULTY
                    </Badge>
                  )}
                </div>
                <h1 className="text-4xl md:text-6xl font-black text-gold-100 tracking-tighter leading-none mb-2 drop-shadow-2xl print:text-black print:text-4xl">{crop.nameEnglish}</h1>
                {crop.nameScientific && crop.nameScientific.toLowerCase() !== 'unknown' && (
                  <p className="text-xl italic text-gold-300/80 mb-3 font-medium drop-shadow-2xl print:text-black print:text-lg">{crop.nameScientific}</p>
                )}
                <p className="text-gold-400 font-bold flex items-center tracking-widest text-xs uppercase bg-earth-main/30 backdrop-blur-sm w-fit px-3 py-1 rounded-full border border-gold-400/20 print:text-black print:border-none mb-4">
                  <MapPin className="h-3 w-3 mr-1.5" /> High Compatibility: {JSON.parse(crop.districts || '[]').slice(0, 3).join(', ') || 'Global'}
                </p>
                {/* PDF Download — only show if PDF is available */}
                {crop.pdfCloudinaryUrl ? (
                  <PdfDownloadButton
                    slug={crop.slug}
                    cropName={crop.nameEnglish}
                    className="mt-4"
                  />
                ) : (
                  <div className="mt-4 flex items-center gap-2 text-[#F5F0E8]/25 text-xs font-mono">
                    <span>📄</span>
                    <span>Cultivation guide PDF coming soon</span>
                  </div>
                )}
                {/* AI Scores */}
                <div className="pt-2 flex items-center justify-between no-print">
                  <div className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-gold-400" />
                    <span className="text-xs uppercase tracking-widest font-bold text-gold-100">AI Viability Score</span>
                  </div>
                  <div className="text-4xl font-black text-gold-100 flex items-end gap-1">
                    {crop.aiScore || 85}
                    <span className="text-gold-400 text-xl">%</span>
                  </div>
                </div>
                <Progress value={crop.aiScore || 85} className="h-1.5 bg-earth-border mt-3" indicatorClassName="bg-gold-400" />
              </div>
            </div>
          </div>
        </ScrollReveal>

        <div className="space-y-8">

          {/* Calendar Row */}
          <ScrollReveal direction="up" delay={0.35}>
            <div className="bg-[#111008] border border-[#2A2720] rounded-xl p-6">
              <p className="text-[#C9A84C] text-xs font-mono uppercase tracking-wider mb-5">
                📅 Cultivation Calendar
              </p>
              <div className="space-y-4">
                {crop.calendar?.weeks?.length > 0 ? crop.calendar.weeks.map((week: any, i: number) => (
                  <div key={i} className="flex flex-col md:flex-row gap-4 p-4 rounded-xl border border-[#2A2720] bg-[#191610] transition-colors hover:bg-[#1f1b13]">
                    <div className="flex-shrink-0 w-full md:w-48 md:border-r border-[#2A2720] md:pr-4">
                      <div className="text-sm font-bold text-[#C9A84C] leading-snug">{week.period}</div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-[#F5F0E8] text-xs uppercase tracking-widest mb-3 opacity-60">{week.health_check}</h4>
                      <ul className="text-sm text-[#F5F0E8]/80 space-y-2">
                        {week.tasks.map((task: string, j: number) => (
                          <li key={j} className="flex items-start gap-2 leading-relaxed">
                            <span className="text-[#C9A84C] mt-0.5">•</span>
                            <span>{task}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )) : (
                  <div className="p-4 rounded-xl border border-[#2A2720] bg-[#191610]">
                    <p className="text-sm text-gold-100/60">Cultivation calendar data is not available for this crop.</p>
                  </div>
                )}
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
                  <Card className="card-premium h-full bg-[#111008] border-[#2A2720]">
                    <CardHeader className="border-b border-[#2A2720]">
                      <CardTitle className="text-sm text-[#C9A84C] font-mono uppercase tracking-widest flex items-center gap-2">
                        <span>🌍</span> Environmental
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-6">
                      <div>
                        <span className="text-[10px] font-bold text-[#F5F0E8]/40 uppercase tracking-widest block mb-2">Soil Type</span>
                        <p className="text-[#F5F0E8] text-lg font-semibold">{crop.soilType}</p>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-3 bg-[#191610] rounded-xl border border-[#2A2720]">
                          <span className="text-[10px] font-bold text-[#F5F0E8]/40 uppercase tracking-widest block mb-1">pH Range</span>
                          <span className="text-sm font-mono text-[#C9A84C]">{crop.soil?.ph_min} - {crop.soil?.ph_max}</span>
                        </div>
                        <div className="p-3 bg-[#191610] rounded-xl border border-[#2A2720]">
                          <span className="text-[10px] font-bold text-[#F5F0E8]/40 uppercase tracking-widest block mb-1">Temperature</span>
                          <span className="text-sm font-mono text-[#C9A84C]">{crop.temperatureRange || "N/A"}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="card-premium h-full bg-[#111008] border-[#2A2720]">
                    <CardHeader className="border-b border-[#2A2720]">
                      <CardTitle className="text-sm text-[#C9A84C] font-mono uppercase tracking-widest flex items-center gap-2">
                        <span>💧</span> Hydration
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-6">
                      <div>
                        <span className="text-[10px] font-bold text-[#F5F0E8]/40 uppercase tracking-widest block mb-2">Annual Rainfall</span>
                        <p className="text-[#F5F0E8] text-lg font-mono">{crop.rainfallMm || crop.irrigation?.annual_rainfall_mm || "N/A"}</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-[#F5F0E8]/40 uppercase tracking-widest block mb-2">Water Req.</span>
                        <p className="text-[#F5F0E8] text-sm">{crop.waterRequirement || crop.irrigation?.water_requirement || "N/A"}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="card-premium h-full bg-[#111008] border-[#2A2720]">
                    <CardHeader className="border-b border-[#2A2720]">
                      <CardTitle className="text-sm text-[#C9A84C] font-mono uppercase tracking-widest flex items-center gap-2">
                        <span>🧪</span> Nutrients (NPK)
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-2 rounded bg-[#191610]">
                          <span className="text-xs font-bold text-[#F5F0E8]/60">Nitrogen (N)</span>
                          <span className="text-sm font-mono text-[#C9A84C]">{crop.nKgAcre || 0} kg/ac</span>
                        </div>
                        <div className="flex items-center justify-between p-2 rounded bg-[#191610]">
                          <span className="text-xs font-bold text-[#F5F0E8]/60">Phosphorus (P)</span>
                          <span className="text-sm font-mono text-[#C9A84C]">{crop.pKgAcre || 0} kg/ac</span>
                        </div>
                        <div className="flex items-center justify-between p-2 rounded bg-[#191610]">
                          <span className="text-xs font-bold text-[#F5F0E8]/60">Potassium (K)</span>
                          <span className="text-sm font-mono text-[#C9A84C]">{crop.kKgAcre || 0} kg/ac</span>
                        </div>
                        <div className="pt-4 border-t border-[#2A2720]">
                          <span className="text-[10px] font-bold text-[#F5F0E8]/40 uppercase tracking-widest block mb-2">Spacing</span>
                          <p className="text-xs text-[#F5F0E8]/70 italic">{crop.seed?.row_spacing_cm ? `${crop.seed.row_spacing_cm} x ${crop.seed.plant_spacing_cm} cm` : "Not specified"}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="intelligence" className="mt-0 outline-none">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Card className="card-premium h-full bg-[#111008] border-[#2A2720]">
                    <CardHeader>
                      <CardTitle className="text-lg text-[#F5F0E8] font-bold tracking-tight flex items-center gap-2">
                        <span>🧠</span> AI Compatibility Scores
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-8">
                      <div className="space-y-3">
                        <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                          <span className="text-[#F5F0E8]/60">Overall AI Score</span>
                          <span className="text-[#C9A84C]">{crop.aiScore}%</span>
                        </div>
                        <Progress value={crop.aiScore} className="h-2 bg-[#2A2720]" indicatorClassName="bg-[#C9A84C]" />
                      </div>
                      <div className="space-y-4">
                        <span className="text-[10px] font-bold text-[#F5F0E8]/40 uppercase tracking-widest block mb-2">Supported Features</span>
                        <div className="flex flex-wrap gap-2">
                          {crop.aiFeatures?.map((feature: string, i: number) => (
                            <Badge key={i} className="bg-[#191610] text-[#C9A84C] border border-[#2A2720] hover:bg-[#2A2720]">
                              {feature.replace(/_/g, ' ')}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-4 pt-4 border-t border-[#2A2720]">
                        <span className="text-[10px] font-bold text-[#F5F0E8]/40 uppercase tracking-widest block mb-2">IoT Sensor Parameters</span>
                        <div className="flex flex-wrap gap-2">
                          {crop.iotParameters?.map((param: string, i: number) => (
                            <Badge key={i} variant="outline" className="border-[#C9A84C]/30 text-[#F5F0E8]/70">
                              {param.replace(/_/g, ' ')}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="management" className="mt-0 outline-none">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-8">
                    {crop.pestDisease?.pests_diseases && crop.pestDisease.pests_diseases.length > 0 && (
                      <Card className="card-premium border-red-500/10 bg-[#111008]">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-xs text-red-400 font-mono uppercase tracking-widest flex items-center gap-2">
                            <span>⚠️</span> Pathogen Alerts
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {crop.pestDisease.pests_diseases.map((disease: any, i: number) => (
                            <div key={i} className="p-4 bg-red-500/5 rounded-2xl border border-red-500/10">
                              <h5 className="text-sm font-bold text-red-400 uppercase tracking-tight mb-1">{disease.name}</h5>
                              <p className="text-[10px] text-[#F5F0E8]/40 mb-2 italic">"{disease.visual_symptoms}"</p>
                              <div className="text-[10px] font-mono text-[#F5F0E8]/60 leading-relaxed bg-[#0A0900]/50 p-2 rounded-lg">
                                <span className="text-red-400">TREATMENT:</span> {disease.organic_control || disease.chemical_name || "Consult local expert"}
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="economics" className="mt-0 outline-none">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Card className="card-premium h-full bg-[#111008] border-[#2A2720]">
                    <CardHeader>
                      <CardTitle className="text-lg text-[#F5F0E8] font-bold tracking-tight flex items-center gap-2">
                        <span>💰</span> Financial Projections
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="mt-2 p-6 bg-[#191610] rounded-2xl border border-[#2A2720]">
                        <div className="space-y-4">
                          <div className="flex justify-between text-sm">
                            <span className="text-[#F5F0E8]/40">Est. Capital / Acre</span>
                            <span className="font-bold text-[#F5F0E8]">₹{crop.capitalMin?.toLocaleString()} - ₹{crop.capitalMax?.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-[#F5F0E8]/40">Est. Returns / Acre</span>
                            <span className="font-bold text-[#F5F0E8]">₹{crop.returnsMin?.toLocaleString()} - ₹{crop.returnsMax?.toLocaleString()}</span>
                          </div>
                          <div className="pt-4 border-t border-[#2A2720] flex justify-between text-lg">
                            <span className="font-black text-[#F5F0E8] tracking-tight">PROFIT MARGIN</span>
                            <span className="font-black text-[#C9A84C] tracking-tight">{Math.round(((crop.returnsMax - crop.capitalMax) / (crop.capitalMax || 1)) * 100)}%</span>
                          </div>
                        </div>
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
