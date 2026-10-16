import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ArrowLeft, Droplets, MapPin, Sprout, AlertTriangle,
  Beaker, Calendar, Shield, BarChart3, Settings,
  Activity, Printer, Brain, Layers, Clock, CheckCircle2,
  Bug, FlaskConical, Sparkles
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollReveal } from '@/components/ui/animations';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { resolveCropImage, getCropImage } from '@/lib/cropImages';
import { formatCurrency } from '@/data/masterData';
import { CropDetailsShimmer } from '@/components/ui/loading-shimmer';
import { useCropDetail } from '@/hooks/useCropGuides';
import { PdfDownloadButton } from '@/components/ui/PdfDownloadButton';

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
          <h2 className="text-3xl font-black text-gold-100 mb-4 tracking-tighter">INTELLIGENCE REGISTRY SEARCH</h2>
          <p className="text-gold-100/60 mb-10 max-w-md mx-auto text-sm leading-relaxed uppercase tracking-wide">
            Could not locate localized crop intelligence for <span className="text-gold-400 font-bold">{cropName}</span>.
          </p>
          <Button onClick={() => navigate('/crops')} className="btn-gold px-10 py-6 text-sm font-black uppercase tracking-widest h-auto">
            Explore All Crops
          </Button>
        </div>
      </div>
    );
  }

  const displayImage = resolveCropImage(crop);

  return (
    <div className="pt-24 px-4 sm:px-6 lg:px-8 pb-12 max-w-7xl mx-auto animate-fade-in">
      {/* High-fidelity Print Stylesheet */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @media print {
          body, html {
            background: #ffffff !important;
            color: #000000 !important;
            font-size: 11pt !important;
          }
          .no-print, header, aside, button, nav, .btn-gold, [role="tablist"] {
            display: none !important;
          }
          .print-only {
            display: block !important;
          }
          .print-container {
            color: #111111 !important;
            padding: 10px !important;
          }
          .card-premium, .card {
            border: 1px solid #cccccc !important;
            background: #ffffff !important;
            box-shadow: none !important;
            color: #000000 !important;
            page-break-inside: avoid !important;
            margin-bottom: 12px !important;
          }
          .text-gold-100, .text-gold-400, .text-gold-300, .text-[#F5F0E8], .text-[#C9A84C] {
            color: #1a4d2e !important;
          }
          .bg-earth-main, .bg-earth-elevated, .bg-[#111008], .bg-[#191610] {
            background: #fcfcfc !important;
            border-color: #e5e5e5 !important;
          }
          [role="tabpanel"] {
            display: block !important;
          }
          .print-break {
            page-break-before: always !important;
          }
        }
      `}} />

      <div className="space-y-8 pb-12 print-container">
        {/* Navigation & Print Actions */}
        <div className="flex justify-between items-center no-print">
          <ScrollReveal direction="left" delay={0.1}>
            <Button
              variant="ghost"
              onClick={() => navigate('/crops')}
              className="group text-gold-100/60 hover:text-gold-400 hover:bg-gold-400/5 transition-all"
            >
              <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Crop Registry
            </Button>
          </ScrollReveal>
          <ScrollReveal direction="right" delay={0.1}>
            <Button
              onClick={() => window.print()}
              className="btn-gold flex items-center gap-2 py-4 px-6 rounded-2xl text-xs font-bold uppercase tracking-wider"
            >
              <Printer className="h-4 w-4" />
              Print Technical Sheet
            </Button>
          </ScrollReveal>
        </div>

        {/* Print Only Header */}
        <div className="hidden print:block border-b-2 border-emerald-900 pb-3 mb-6">
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-emerald-900 uppercase">AGRICOMPASS PRECISION AGRONOMIC REPORT</h1>
              <p className="text-xs uppercase tracking-widest font-semibold text-gray-600">Standardized Crop Cultivation & Input Specification Sheet</p>
            </div>
            <div className="text-right text-xs text-gray-500 font-mono">
              Published: {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <ScrollReveal direction="up" delay={0.15}>
          <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-earth-border/60 bg-[#111008] mb-8 w-full">
            <div className="h-[280px] sm:h-[340px] overflow-hidden relative">
              {displayImage ? (
                <img
                  src={displayImage}
                  alt={crop.nameEnglish}
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
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0900] via-[#0A0900]/70 to-transparent print:hidden" />
              
              <div className="absolute bottom-6 left-6 right-6 sm:bottom-8 sm:left-10 sm:right-10 flex flex-col md:flex-row md:items-end justify-between gap-6 print:relative print:bottom-0 print:left-0 print:right-0 print:text-black">
                <div className="max-w-3xl">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <Badge className="bg-gold-400 text-earth-main font-black px-3.5 py-1 text-[10px] uppercase tracking-widest shadow-md">
                      {crop.season} SEEDING
                    </Badge>
                    <Badge variant="outline" className="border-gold-400/40 text-gold-400 font-black px-3.5 py-1 text-[10px] uppercase tracking-widest bg-earth-main/80 backdrop-blur-md">
                      {crop.durationDays} DAY DURATION
                    </Badge>
                    {crop.difficulty && (
                      <Badge
                        variant="outline"
                        className={`font-black px-3.5 py-1 text-[10px] uppercase tracking-widest bg-earth-main/80 backdrop-blur-md ${
                          crop.difficulty?.toLowerCase() === 'easy'
                            ? 'border-emerald-500/40 text-emerald-400'
                            : crop.difficulty?.toLowerCase() === 'hard'
                              ? 'border-red-500/40 text-red-400'
                              : 'border-gold-400/40 text-gold-300'
                        }`}
                      >
                        {crop.difficulty} DIFFICULTY
                      </Badge>
                    )}
                  </div>

                  <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-gold-100 tracking-tight leading-tight mb-1 drop-shadow-xl print:text-black">
                    {crop.nameEnglish}
                  </h1>

                  {crop.nameCommonAlt && (
                    <p className="text-sm font-medium text-gold-300/80 mb-2">
                      Local Names: <span className="font-semibold text-gold-200">{crop.nameCommonAlt}</span>
                    </p>
                  )}

                  {crop.nameScientific && crop.nameScientific.toLowerCase() !== 'unknown' && (
                    <p className="text-sm sm:text-base italic text-gold-400/90 mb-3 font-mono print:text-black">
                      Botanical: {crop.nameScientific}
                    </p>
                  )}

                  <p className="text-gold-400 font-bold flex items-center tracking-wider text-xs uppercase bg-[#191610]/80 backdrop-blur-sm w-fit px-3 py-1.5 rounded-full border border-gold-400/30 print:text-black print:border-none mb-4">
                    <MapPin className="h-3 w-3 mr-1.5 shrink-0" /> Recommended: {JSON.parse(crop.districts || '[]').slice(0, 4).join(', ') || 'Karnataka Statewide'}
                  </p>

                  {/* Dual Download Center */}
                  <div className="no-print pt-1">
                    <PdfDownloadButton
                      slug={crop.slug}
                      cropName={crop.nameEnglish}
                      crop={crop}
                      showDatasetButton={true}
                    />
                  </div>
                </div>

                {/* AI Score Badge */}
                <div className="bg-[#191610]/90 backdrop-blur-md border border-[#2A2720] p-4 rounded-2xl min-w-[160px] no-print shrink-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Brain className="h-4 w-4 text-gold-400" />
                    <span className="text-[10px] uppercase tracking-widest font-bold text-gold-100/70">AI Suitability</span>
                  </div>
                  <div className="text-3xl font-black text-gold-100 flex items-baseline gap-1">
                    {crop.aiScore || 88}
                    <span className="text-gold-400 text-lg">%</span>
                  </div>
                  <Progress value={crop.aiScore || 88} className="h-1.5 bg-earth-border mt-2" indicatorClassName="bg-gold-400" />
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Intelligence Tabs & Matrices */}
        <ScrollReveal direction="up" delay={0.25}>
          <Tabs defaultValue="agronomics" className="w-full">
            <TabsList className="bg-[#111008] p-1.5 rounded-2xl border border-[#2A2720] w-full justify-start h-auto gap-2 mb-8 overflow-x-auto no-print">
              <TabsTrigger value="agronomics" className="rounded-xl px-5 py-2.5 data-[state=active]:bg-gold-400 data-[state=active]:text-earth-main font-black text-xs uppercase tracking-wider transition-all">
                <Sprout className="h-4 w-4 mr-2" /> Soil & Nutrients
              </TabsTrigger>
              <TabsTrigger value="cultivation" className="rounded-xl px-5 py-2.5 data-[state=active]:bg-gold-400 data-[state=active]:text-earth-main font-black text-xs uppercase tracking-wider transition-all">
                <Layers className="h-4 w-4 mr-2" /> Seeds & Sowing
              </TabsTrigger>
              <TabsTrigger value="protection" className="rounded-xl px-5 py-2.5 data-[state=active]:bg-gold-400 data-[state=active]:text-earth-main font-black text-xs uppercase tracking-wider transition-all">
                <Shield className="h-4 w-4 mr-2" /> Pests & Weeds
              </TabsTrigger>
              <TabsTrigger value="timeline" className="rounded-xl px-5 py-2.5 data-[state=active]:bg-gold-400 data-[state=active]:text-earth-main font-black text-xs uppercase tracking-wider transition-all">
                <Clock className="h-4 w-4 mr-2" /> Growth Stages
              </TabsTrigger>
              <TabsTrigger value="economics" className="rounded-xl px-5 py-2.5 data-[state=active]:bg-gold-400 data-[state=active]:text-earth-main font-black text-xs uppercase tracking-wider transition-all">
                <BarChart3 className="h-4 w-4 mr-2" /> Financials & Market
              </TabsTrigger>
              <TabsTrigger value="intelligence" className="rounded-xl px-5 py-2.5 data-[state=active]:bg-gold-400 data-[state=active]:text-earth-main font-black text-xs uppercase tracking-wider transition-all">
                <Activity className="h-4 w-4 mr-2" /> AI & IoT Specs
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: AGRONOMICS, SOIL & HYDRATION */}
            <TabsContent value="agronomics" className="space-y-8 mt-0 outline-none">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Environmental Card */}
                <Card className="card-premium h-full bg-[#111008] border-[#2A2720]">
                  <CardHeader className="border-b border-[#2A2720] pb-3">
                    <CardTitle className="text-xs text-[#C9A84C] font-mono uppercase tracking-widest flex items-center gap-2">
                      <Sprout className="w-4 h-4" /> Soil & Land Suitability
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-5 space-y-4">
                    <div>
                      <span className="text-[10px] font-bold text-[#F5F0E8]/40 uppercase tracking-widest block mb-1">Soil Texture</span>
                      <p className="text-[#F5F0E8] text-sm font-semibold">{crop.soilType}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-[#191610] rounded-xl border border-[#2A2720]">
                        <span className="text-[10px] font-bold text-[#F5F0E8]/40 uppercase tracking-widest block mb-0.5">Ideal pH</span>
                        <span className="text-sm font-mono text-[#C9A84C]">{crop.soil?.ph_min} - {crop.soil?.ph_max}</span>
                      </div>
                      <div className="p-3 bg-[#191610] rounded-xl border border-[#2A2720]">
                        <span className="text-[10px] font-bold text-[#F5F0E8]/40 uppercase tracking-widest block mb-0.5">Temperature</span>
                        <span className="text-sm font-mono text-[#C9A84C]">{(crop as any).temperatureRange || "20–35°C"}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-[#F5F0E8]/40 uppercase tracking-widest block mb-1">Drainage Requirement</span>
                      <p className="text-xs text-[#F5F0E8]/70">{crop.soil?.drainage_requirement || "Well-drained soil free from stagnant waterlogging"}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Hydration Card */}
                <Card className="card-premium h-full bg-[#111008] border-[#2A2720]">
                  <CardHeader className="border-b border-[#2A2720] pb-3">
                    <CardTitle className="text-xs text-[#C9A84C] font-mono uppercase tracking-widest flex items-center gap-2">
                      <Droplets className="w-4 h-4" /> Hydration & Irrigation
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-5 space-y-4">
                    <div>
                      <span className="text-[10px] font-bold text-[#F5F0E8]/40 uppercase tracking-widest block mb-1">Annual Rainfall Range</span>
                      <p className="text-[#F5F0E8] text-base font-mono font-semibold">{crop.rainfallMm || "700–1200 mm"}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-[#F5F0E8]/40 uppercase tracking-widest block mb-1">Water Demand Level</span>
                      <p className="text-[#F5F0E8] text-sm">{crop.irrigation?.water_requirement || "Moderate Water Demand"}</p>
                    </div>
                    <div className="p-3 bg-[#191610] rounded-xl border border-[#2A2720]">
                      <span className="text-[10px] font-bold text-[#F5F0E8]/40 uppercase tracking-widest block mb-1">Critical Irrigation Stage</span>
                      <p className="text-xs text-[#C9A84C] font-semibold">{crop.irrigation?.critical_stage || "Flowering and grain development"}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Nutrients (NPK) Card */}
                <Card className="card-premium h-full bg-[#111008] border-[#2A2720]">
                  <CardHeader className="border-b border-[#2A2720] pb-3">
                    <CardTitle className="text-xs text-[#C9A84C] font-mono uppercase tracking-widest flex items-center gap-2">
                      <FlaskConical className="w-4 h-4" /> Macronutrient Dosage (NPK)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-5 space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="p-2.5 rounded-xl bg-[#191610] border border-[#2A2720] text-center">
                        <span className="text-[10px] font-bold text-[#F5F0E8]/50 block">Nitrogen (N)</span>
                        <span className="text-sm font-mono text-[#C9A84C] font-bold">{crop.nKgAcre || 40}</span>
                        <span className="text-[9px] text-[#F5F0E8]/40 block">kg/acre</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-[#191610] border border-[#2A2720] text-center">
                        <span className="text-[10px] font-bold text-[#F5F0E8]/50 block">Phosphorus (P)</span>
                        <span className="text-sm font-mono text-[#C9A84C] font-bold">{crop.pKgAcre || 20}</span>
                        <span className="text-[9px] text-[#F5F0E8]/40 block">kg/acre</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-[#191610] border border-[#2A2720] text-center">
                        <span className="text-[10px] font-bold text-[#F5F0E8]/50 block">Potassium (K)</span>
                        <span className="text-sm font-mono text-[#C9A84C] font-bold">{crop.kKgAcre || 20}</span>
                        <span className="text-[9px] text-[#F5F0E8]/40 block">kg/acre</span>
                      </div>
                    </div>

                    <div className="p-3 bg-[#191610] rounded-xl border border-[#2A2720]">
                      <span className="text-[10px] font-bold text-[#F5F0E8]/40 uppercase tracking-widest block mb-1">Organic Manuring</span>
                      <p className="text-xs text-[#F5F0E8]/80">{crop.fertilizer?.organic_type || "10 tonnes FYM or 5 tonnes vermicompost / ha"}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Stage-by-Stage NPK Schedule Table (if available) */}
              {crop.npkSchedule && crop.npkSchedule.length > 0 && (
                <div className="bg-[#111008] border border-[#2A2720] rounded-2xl p-6">
                  <h3 className="text-sm font-mono uppercase tracking-wider text-[#C9A84C] mb-4 flex items-center gap-2">
                    <FlaskConical className="w-4 h-4" /> Stage-by-Stage Fertilizer Schedule
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-[#F5F0E8]">
                      <thead className="bg-[#191610] text-[#C9A84C] uppercase font-mono tracking-wider border-b border-[#2A2720]">
                        <tr>
                          <th className="py-3 px-4">Application Stage</th>
                          <th className="py-3 px-4">Timing (DAS)</th>
                          <th className="py-3 px-4">N (kg/ha)</th>
                          <th className="py-3 px-4">P (kg/ha)</th>
                          <th className="py-3 px-4">K (kg/ha)</th>
                          <th className="py-3 px-4">Commercial Fertilizers & Method</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#2A2720]">
                        {crop.npkSchedule.map((row, idx) => (
                          <tr key={idx} className="hover:bg-[#191610]/50 transition-colors">
                            <td className="py-3 px-4 font-bold text-gold-200">{row.stage}</td>
                            <td className="py-3 px-4 font-mono text-[#F5F0E8]/70">{row.days_after_sowing || "At planting"}</td>
                            <td className="py-3 px-4 font-mono text-[#C9A84C]">{row.N_kg_ha ?? "-"}</td>
                            <td className="py-3 px-4 font-mono text-[#C9A84C]">{row.P_kg_ha ?? "-"}</td>
                            <td className="py-3 px-4 font-mono text-[#C9A84C]">{row.K_kg_ha ?? "-"}</td>
                            <td className="py-3 px-4 text-[#F5F0E8]/80">{row.fertilizers} ({row.method || "Basal"})</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* TAB 2: SEED SELECTION & SOWING */}
            <TabsContent value="cultivation" className="space-y-8 mt-0 outline-none">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Sowing Specifications */}
                <Card className="card-premium bg-[#111008] border-[#2A2720]">
                  <CardHeader className="border-b border-[#2A2720] pb-3">
                    <CardTitle className="text-xs text-[#C9A84C] font-mono uppercase tracking-widest flex items-center gap-2">
                      <Layers className="w-4 h-4" /> Sowing Protocol & Geometry
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-5 space-y-4">
                    <div>
                      <span className="text-[10px] font-bold text-[#F5F0E8]/40 uppercase tracking-widest block mb-1">Sowing Method</span>
                      <p className="text-[#F5F0E8] text-sm font-semibold">{crop.seed?.sowing_method || crop.seedDetails?.sowing_method || "Direct line sowing"}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-[#191610] rounded-xl border border-[#2A2720]">
                        <span className="text-[10px] font-bold text-[#F5F0E8]/40 uppercase tracking-widest block mb-1">Recommended Spacing</span>
                        <span className="text-sm font-mono text-[#C9A84C]">
                          {crop.seedDetails?.spacing_cm || (crop.seed?.row_spacing_cm ? `${crop.seed.row_spacing_cm} x ${crop.seed.plant_spacing_cm} cm` : "Standard spacing")}
                        </span>
                      </div>
                      <div className="p-3 bg-[#191610] rounded-xl border border-[#2A2720]">
                        <span className="text-[10px] font-bold text-[#F5F0E8]/40 uppercase tracking-widest block mb-1">Sowing Depth</span>
                        <span className="text-sm font-mono text-[#C9A84C]">{crop.seedDetails?.depth_cm || "2–4 cm"}</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-[#F5F0E8]/40 uppercase tracking-widest block mb-1">Seed Rate</span>
                      <p className="text-xs text-[#F5F0E8]/80">{crop.seedDetails?.seed_rate || "As per certified package of practices"}</p>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-[#F5F0E8]/40 uppercase tracking-widest block mb-1">Seed Treatment</span>
                      <p className="text-xs text-[#F5F0E8]/80">{crop.seed?.treatment_chemical || crop.seedDetails?.seed_treatment || "Carbendazim @ 2g/kg or Trichoderma @ 4g/kg seed"}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Recommended Varieties */}
                <Card className="card-premium bg-[#111008] border-[#2A2720]">
                  <CardHeader className="border-b border-[#2A2720] pb-3">
                    <CardTitle className="text-xs text-[#C9A84C] font-mono uppercase tracking-widest flex items-center gap-2">
                      <Sparkles className="w-4 h-4" /> Recommended Regional Varieties
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-5 space-y-4">
                    <p className="text-xs text-[#F5F0E8]/60">
                      Certified cultivars developed and validated by ICAR and University of Agricultural Sciences (UAS) for Karnataka:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {crop.seed?.varieties && crop.seed.varieties.length > 0 ? (
                        crop.seed.varieties.map((v, i) => (
                          <div key={i} className="px-3 py-1.5 rounded-lg bg-[#191610] border border-[#C9A84C]/30 text-xs font-semibold text-gold-200">
                            {v.name}
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-gold-100/50">Consult local KVK for certified hybrid cultivars.</p>
                      )}
                    </div>
                    {crop.seedDetails?.best_time && (
                      <div className="p-3 bg-[#191610] rounded-xl border border-[#2A2720] mt-4">
                        <span className="text-[10px] font-bold text-[#F5F0E8]/40 uppercase tracking-widest block mb-1">Best Sowing Period</span>
                        <p className="text-xs text-[#C9A84C] font-semibold">{crop.seedDetails.best_time}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Step-by-Step Land & Soil Preparation Guide */}
              <div className="bg-[#111008] border border-[#2A2720] rounded-2xl p-6">
                <h3 className="text-sm font-mono uppercase tracking-wider text-[#C9A84C] mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Land & Soil Preparation Sequence
                </h3>
                <div className="space-y-3">
                  {crop.soil?.land_prep_steps?.map((step: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-3 p-3.5 rounded-xl bg-[#191610] border border-[#2A2720]">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#C9A84C]/10 border border-[#C9A84C]/40 text-[#C9A84C] text-xs font-mono font-bold shrink-0">
                        {idx + 1}
                      </span>
                      <p className="text-xs text-[#F5F0E8]/90 leading-relaxed pt-0.5">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* TAB 3: PESTS, DISEASES & WEED MANAGEMENT */}
            <TabsContent value="protection" className="space-y-8 mt-0 outline-none">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pests & Diseases List */}
                <div className="space-y-4">
                  <h3 className="text-xs font-mono uppercase tracking-widest text-red-400 flex items-center gap-2">
                    <Bug className="w-4 h-4" /> Integrated Pest & Disease Management
                  </h3>
                  {crop.pestDisease?.pests_diseases && crop.pestDisease.pests_diseases.length > 0 ? (
                    crop.pestDisease.pests_diseases.map((item, i) => (
                      <div key={i} className="p-4 bg-[#111008] rounded-2xl border border-red-500/20 hover:border-red-500/40 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="text-sm font-bold text-red-300 uppercase tracking-tight">{item.name}</h5>
                          <Badge variant="outline" className="text-[9px] uppercase border-red-500/30 text-red-400">
                            {item.type}
                          </Badge>
                        </div>
                        <p className="text-xs text-[#F5F0E8]/60 mb-2 italic">"{item.visual_symptoms}"</p>
                        <div className="text-xs font-mono text-[#F5F0E8]/80 leading-relaxed bg-[#191610] p-2.5 rounded-xl border border-[#2A2720]">
                          <span className="text-[#C9A84C] font-bold">CONTROL / TREATMENT:</span> {item.chemical_name || item.organic_control || "Consult local KVK agronomist"}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-[#F5F0E8]/60">Standard prophylactic pest management protocols apply.</p>
                  )}
                </div>

                {/* Weed Management */}
                <div className="space-y-4">
                  <h3 className="text-xs font-mono uppercase tracking-widest text-[#C9A84C] flex items-center gap-2">
                    <Shield className="w-4 h-4" /> Weed Management Strategy
                  </h3>
                  <Card className="card-premium bg-[#111008] border-[#2A2720]">
                    <CardContent className="pt-5 space-y-4">
                      <div>
                        <span className="text-[10px] font-bold text-[#F5F0E8]/40 uppercase tracking-widest block mb-1">Critical Weed-Free Window</span>
                        <p className="text-[#F5F0E8] text-sm font-semibold">{crop.weed?.critical_period || "First 30–45 days after sowing"}</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-[#F5F0E8]/40 uppercase tracking-widest block mb-1">Manual Weeding Practice</span>
                        <p className="text-xs text-[#F5F0E8]/80">{crop.weed?.manual_frequency || "Two manual weedings at 20 and 40 DAS"}</p>
                      </div>

                      {crop.weed?.weedicides && crop.weed.weedicides.length > 0 && (
                        <div>
                          <span className="text-[10px] font-bold text-[#F5F0E8]/40 uppercase tracking-widest block mb-2">Recommended Herbicide Application</span>
                          <div className="space-y-2">
                            {crop.weed.weedicides.map((h, idx) => (
                              <div key={idx} className="p-3 bg-[#191610] rounded-xl border border-[#2A2720] text-xs">
                                <div className="flex justify-between font-bold text-gold-200 mb-0.5">
                                  <span>{h.name}</span>
                                  <span className="font-mono text-[#C9A84C]">{h.dosage_per_litre_water}</span>
                                </div>
                                <div className="text-[10px] text-[#F5F0E8]/50">
                                  Timing: {h.timing} | Target: {h.target_weeds}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* TAB 4: GROWTH TIMELINE & HARVEST */}
            <TabsContent value="timeline" className="space-y-8 mt-0 outline-none">
              {/* Growth Timeline */}
              {crop.growthTimeline && crop.growthTimeline.length > 0 && (
                <div className="bg-[#111008] border border-[#2A2720] rounded-2xl p-6">
                  <h3 className="text-sm font-mono uppercase tracking-wider text-[#C9A84C] mb-4 flex items-center gap-2">
                    <Clock className="w-4 h-4" /> Phenological Growth Timeline
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    {crop.growthTimeline.map((item, idx) => (
                      <div key={idx} className="p-3.5 bg-[#191610] rounded-xl border border-[#2A2720] text-center">
                        <span className="text-[10px] font-mono text-[#C9A84C] font-bold block mb-1">STAGE {idx + 1}</span>
                        <h5 className="text-xs font-bold text-[#F5F0E8] mb-1">{item.stage}</h5>
                        <span className="text-[10px] font-mono text-[#F5F0E8]/50 block">{item.days} DAS</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cultivation Calendar Tasks */}
              <div className="bg-[#111008] border border-[#2A2720] rounded-2xl p-6">
                <h3 className="text-sm font-mono uppercase tracking-wider text-[#C9A84C] mb-4 flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> Operational Cultivation Calendar
                </h3>
                <div className="space-y-3">
                  {crop.calendar?.weeks?.map((week, idx) => (
                    <div key={idx} className="flex flex-col md:flex-row gap-3 p-3.5 rounded-xl bg-[#191610] border border-[#2A2720]">
                      <div className="w-full md:w-56 font-bold text-xs text-[#C9A84C] shrink-0 font-mono">
                        {week.period}
                      </div>
                      <div className="flex-1">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-[#F5F0E8]/40 block mb-1">
                          Focus: {week.health_check}
                        </span>
                        <ul className="text-xs text-[#F5F0E8]/80 space-y-1">
                          {week.tasks.map((task, j) => (
                            <li key={j} className="flex items-start gap-2">
                              <span className="text-[#C9A84C]">•</span>
                              <span>{task}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Harvest & Storage */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="card-premium bg-[#111008] border-[#2A2720]">
                  <CardHeader className="border-b border-[#2A2720] pb-3">
                    <CardTitle className="text-xs text-[#C9A84C] font-mono uppercase tracking-widest">
                      Harvesting Guidelines
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-3 text-xs text-[#F5F0E8]">
                    <div>
                      <span className="text-[10px] font-bold text-[#F5F0E8]/40 uppercase tracking-widest block mb-1">Maturity Days</span>
                      <p className="font-mono text-sm text-[#C9A84C] font-bold">{crop.harvestDetails?.maturity_days || crop.durationDays} Days</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-[#F5F0E8]/40 uppercase tracking-widest block mb-1">Expected Yield Potential</span>
                      <p>{crop.harvestDetails?.yield_per_ha || `${crop.yieldInfo?.averageQuintals || 18} Quintals / Acre`}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="card-premium bg-[#111008] border-[#2A2720]">
                  <CardHeader className="border-b border-[#2A2720] pb-3">
                    <CardTitle className="text-xs text-[#C9A84C] font-mono uppercase tracking-widest">
                      Post-Harvest & Storage Protocol
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-3 text-xs text-[#F5F0E8]">
                    <div>
                      <span className="text-[10px] font-bold text-[#F5F0E8]/40 uppercase tracking-widest block mb-1">Drying & Safe Moisture</span>
                      <p>{crop.harvestDetails?.post_harvest || crop.postHarvest?.storage_conditions || "Sun dry to <12% moisture before storage."}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-[#F5F0E8]/40 uppercase tracking-widest block mb-1">Storage Life</span>
                      <p>{crop.postHarvest?.storage_duration || "6–12 months in aerated dry storage"}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* TAB 5: FINANCIALS & MARKET */}
            <TabsContent value="economics" className="space-y-8 mt-0 outline-none">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="card-premium bg-[#111008] border-[#2A2720]">
                  <CardHeader className="border-b border-[#2A2720] pb-3">
                    <CardTitle className="text-xs text-[#C9A84C] font-mono uppercase tracking-widest">
                      Financial Projections (Per Acre)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-5 space-y-4">
                    <div className="p-4 bg-[#191610] rounded-xl border border-[#2A2720] space-y-3">
                      <div className="flex justify-between text-xs">
                        <span className="text-[#F5F0E8]/50">Est. Input Capital / Acre</span>
                        <span className="font-mono font-bold text-[#F5F0E8]">{formatCurrency(crop.capitalMin || 25000)}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-[#F5F0E8]/50">Est. Gross Returns / Acre</span>
                        <span className="font-mono font-bold text-[#C9A84C]">{formatCurrency(crop.returnsMin || 55000)}</span>
                      </div>
                      <div className="pt-3 border-t border-[#2A2720] flex justify-between text-sm">
                        <span className="font-bold text-[#F5F0E8]">Net Profit Margin</span>
                        <span className="font-mono font-bold text-emerald-400">
                          {Math.round(((crop.returnsMin - crop.capitalMin) / (crop.capitalMin || 1)) * 100)}%
                        </span>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-[#F5F0E8]/40 uppercase tracking-widest block mb-1">Statewide Demand Index</span>
                      <p className="text-xs text-[#F5F0E8] font-semibold">{crop.profitabilityDetails?.market_demand || "High — steady wholesale mandi absorption"}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="card-premium bg-[#111008] border-[#2A2720]">
                  <CardHeader className="border-b border-[#2A2720] pb-3">
                    <CardTitle className="text-xs text-[#C9A84C] font-mono uppercase tracking-widest">
                      Market Discovery & Selling Intelligence
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-5 space-y-4 text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-[#F5F0E8]/40 uppercase tracking-widest block mb-1">Reference Minimum Support Price (MSP)</span>
                      <p className="text-sm font-mono text-[#C9A84C] font-bold">
                        {crop.selling?.msp_amount ? `₹${crop.selling.msp_amount.toLocaleString()} / Quintal` : "Market determined auction price"}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-[#F5F0E8]/40 uppercase tracking-widest block mb-1">Primary APMC Wholesale Hubs</span>
                      <p className="text-[#F5F0E8]/80">{crop.selling?.apmc_mandis?.join(", ") || "District APMC Mandis, e-NAM integrated yards"}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-[#F5F0E8]/40 uppercase tracking-widest block mb-1">Post-Harvest Selling Strategy</span>
                      <p className="text-[#F5F0E8]/70">Grade into uniform sizes and check live Agmarknet prices before dispatching consignments.</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* TAB 6: AI & IOT SPECIFICATIONS */}
            <TabsContent value="intelligence" className="space-y-8 mt-0 outline-none">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="card-premium bg-[#111008] border-[#2A2720]">
                  <CardHeader className="border-b border-[#2A2720] pb-3">
                    <CardTitle className="text-xs text-[#C9A84C] font-mono uppercase tracking-widest flex items-center gap-2">
                      <Brain className="w-4 h-4" /> AI Models & Predictive Capabilities
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-5 space-y-4">
                    <span className="text-[10px] font-bold text-[#F5F0E8]/40 uppercase tracking-widest block mb-2">Supported Feature Workflows</span>
                    <div className="flex flex-wrap gap-2">
                      {crop.aiFeatures?.map((feature: string, i: number) => (
                        <Badge key={i} className="bg-[#191610] text-[#C9A84C] border border-[#2A2720] text-xs">
                          {feature.replace(/_/g, ' ')}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="card-premium bg-[#111008] border-[#2A2720]">
                  <CardHeader className="border-b border-[#2A2720] pb-3">
                    <CardTitle className="text-xs text-[#C9A84C] font-mono uppercase tracking-widest flex items-center gap-2">
                      <Activity className="w-4 h-4" /> IoT Sensor Telemetry Parameters
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-5 space-y-4">
                    <span className="text-[10px] font-bold text-[#F5F0E8]/40 uppercase tracking-widest block mb-2">Target Sensor Probes</span>
                    <div className="flex flex-wrap gap-2">
                      {crop.iotParameters?.map((param: string, i: number) => (
                        <Badge key={i} variant="outline" className="border-[#C9A84C]/30 text-[#F5F0E8]/80 text-xs">
                          {param.replace(/_/g, ' ')}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </ScrollReveal>
      </div>
    </div>
  );
}
