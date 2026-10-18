import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { apiGet, apiPost } from '@/lib/httpClient';
import {
  generateScientificSoilRecommendation,
  SoilAnalysisPayload,
  RecommendationResponse,
  isCropYetToBeGrown,
  ActiveCropOptimization,
} from '@/lib/ai/soilDiagnosticEngine';
import { formatDate } from '@/lib/dateUtils';
import { Button } from '@/components/ui/button';
import {
  History,
  Sparkles,
  Sprout,
  Thermometer,
  Droplets,
  Wind,
  FlaskConical,
  AlertTriangle,
  TrendingUp,
  CheckCircle,
  Printer,
  Info,
  MapPin,
  X,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  Scale,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CropAutocomplete } from '@/components/farm/CropAutocomplete';

const safeGetAmendmentRecommendations = (report: any): string => {
  if (!report) return "No detailed report.";
  try {
    const parsed = typeof report === "string" ? JSON.parse(report) : report;
    if (typeof parsed === "string") return parsed;
    const rec = parsed?.soil_health_report?.soil_amendment_recommendations 
      || parsed?.soil_amendment_recommendations 
      || parsed?.recommendations 
      || parsed?.summary;
    if (typeof rec === "string") return rec;
    if (Array.isArray(rec)) return rec.join(", ");
    if (rec && typeof rec === "object") return JSON.stringify(rec);
    return "Diagnostic recorded successfully.";
  } catch {
    return typeof report === "string" ? report : "Diagnostic recorded successfully.";
  }
};

interface SoilData {
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  pH: number;
  moisture: number;
  temperature_C: number;
  humidity_percent: number;
}

const getSoilColor = (value: number, ideal: [number, number]) => {
  if (value < ideal[0]) return 'rgba(196,90,74,0.3)';   // deficient — red
  if (value > ideal[1]) return 'rgba(74,122,196,0.3)';  // excess — blue
  return 'rgba(74,154,106,0.3)';                          // ideal — green
};

export function SoilAnalysisContent({ initialFarmId }: { initialFarmId?: string } = {}) {
  const { toast } = useToast();
  const [farms, setFarms] = useState<any[]>([]);
  const [selectedFarmId, setSelectedFarmId] = useState<string>(initialFarmId || '');
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  // Crop status: true = crop yet to be grown (suggest recommended crops), false = crop already being grown (optimize current crop)
  const [cropYetToBeGrown, setCropYetToBeGrown] = useState<boolean>(true);
  const [activeCropName, setActiveCropName] = useState<string>('');
  
  useEffect(() => {
    const fetchFarms = async () => {
      try {
        const res = await apiGet('/api/farms');
        setFarms(res || []);
        if (res && res.length > 0) {
          const farmToSelect = (initialFarmId && res.some((f: any) => f.id === initialFarmId))
            ? initialFarmId
            : (selectedFarmId || res[0].id);
          setSelectedFarmId(farmToSelect);
          const sel = res.find((f: any) => f.id === farmToSelect);
          if (sel) {
            const rawCrop = sel.current_crop || sel.currentCrop || sel.cropFocus || '';
            const isFallow = isCropYetToBeGrown(rawCrop);
            setCropYetToBeGrown(isFallow);
            setActiveCropName(isFallow ? '' : rawCrop);
            if (sel.soil_type?.toLowerCase().includes('red')) setSoil(prev => ({...prev, pH: 5.8}));
            if (sel.soil_type?.toLowerCase().includes('black')) setSoil(prev => ({...prev, pH: 7.2}));
          }
        }
      } catch (err) {
        console.error('Failed to load farms', err);
      }
    };
    fetchFarms();
  }, [initialFarmId]);

  useEffect(() => {
    if (selectedFarmId && farms.length > 0) {
      const selected = farms.find(f => f.id === selectedFarmId);
      if (selected) {
        if (selected.soil_type && selected.soil_type.toLowerCase().includes('red')) setSoil(prev => ({...prev, pH: 5.8}));
        if (selected.soil_type && selected.soil_type.toLowerCase().includes('black')) setSoil(prev => ({...prev, pH: 7.2}));

        const rawCrop = selected.current_crop || (selected as any)?.currentCrop || (selected as any)?.cropFocus || '';
        const isFallow = isCropYetToBeGrown(rawCrop);
        setCropYetToBeGrown(isFallow);
        setActiveCropName(isFallow ? '' : rawCrop);
      }
    }
  }, [selectedFarmId, farms]);

  const [soil, setSoil] = useState<SoilData>({
    nitrogen: 65,
    phosphorus: 35,
    potassium: 45,
    pH: 6.2,
    moisture: 45,
    temperature_C: 28,
    humidity_percent: 75,
  });

  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [results, setResults] = useState<RecommendationResponse | null>(null);
  const [expandedCrop, setExpandedCrop] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'crops' | 'optimization' | 'protocol' | 'health'>('crops');

  const isOptimizationMode = results?.mode === 'active_crop_optimization' || Boolean(results?.active_crop_optimization);
  const currentTab = isOptimizationMode
    ? (activeTab === 'crops' ? 'optimization' : activeTab)
    : (activeTab === 'optimization' || activeTab === 'protocol' ? 'crops' : activeTab);

  const loadingSteps = [
    'Initializing AgriSense AI Analyzer...',
    'Assessing Soil NPK Ratios & Compiling Chemistry Profiles...',
    'Checking Farm Crop Cultivation Status & Soil Deficits...',
    'Calculating Unit-Based Fertilizer & Water Adjustments...',
    'Formatting Premium Diagnostic Report...',
  ];

  const handleSoilChange = (key: keyof SoilData, value: number) => {
    setSoil((prev) => ({ ...prev, [key]: value }));
  };

  const runAnalysis = async () => {
    setLoading(true);
    setLoadingStep(0);
    setResults(null);

    const stepInterval = setInterval(() => {
      setLoadingStep((prev) => {
        if (prev < loadingSteps.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 400);

    try {
      const selected = farms.find(f => f.id === selectedFarmId);
      const effectiveCrop = cropYetToBeGrown ? null : (activeCropName || selected?.current_crop || (selected as any)?.currentCrop || null);

      const payload: SoilAnalysisPayload = {
        farmer_name: selected?.name || 'Farmer Partner',
        location: selected?.location || 'Karnataka Region',
        date: new Date().toISOString().split('T')[0],
        soil_data: {
          nitrogen: soil.nitrogen,
          phosphorus: soil.phosphorus,
          potassium: soil.potassium,
          pH: soil.pH,
          moisture: soil.moisture,
          temperature_C: soil.temperature_C,
          humidity_percent: soil.humidity_percent,
        },
        preferred_crop: effectiveCrop,
        crop_status: cropYetToBeGrown ? 'yet_to_be_grown' : 'growing',
        field_size_acres: Number(selected?.area_acres ?? (selected as any)?.areaAcres ?? 1) || 1,
        water_source: selected?.irrigation_type || (selected as any)?.irrigationType || 'Borewell / Canal',
        season: 'Current',
      };

      // 1. Calculate local scientific recommendation FIRST to guarantee units and full protocol
      const localDiagnostic = generateScientificSoilRecommendation(payload);
      let data: RecommendationResponse = localDiagnostic;

      try {
        const res = await apiPost('/api/ai/soil-recommendation', payload);
        if (res) {
          const isFallow = cropYetToBeGrown || !effectiveCrop;
          if (isFallow) {
            data = {
              ...localDiagnostic,
              ...res,
              mode: 'crop_recommendation',
              current_crop: null,
              recommended_crops: (res.recommended_crops && res.recommended_crops.length > 0)
                ? res.recommended_crops
                : localDiagnostic.recommended_crops,
              soil_health_report: res.soil_health_report || localDiagnostic.soil_health_report,
              warnings: (res.warnings && res.warnings.length > 0) ? res.warnings : localDiagnostic.warnings,
              confidence_level: res.confidence_level || localDiagnostic.confidence_level,
            };
          } else {
            data = {
              ...localDiagnostic,
              ...res,
              mode: 'active_crop_optimization',
              current_crop: effectiveCrop,
              active_crop_optimization: res.active_crop_optimization || localDiagnostic.active_crop_optimization,
              recommended_crops: (res.recommended_crops && res.recommended_crops.length > 0)
                ? res.recommended_crops
                : localDiagnostic.recommended_crops,
              soil_health_report: res.soil_health_report || localDiagnostic.soil_health_report,
              warnings: (res.warnings && res.warnings.length > 0) ? res.warnings : localDiagnostic.warnings,
              confidence_level: res.confidence_level || localDiagnostic.confidence_level,
            };
          }
        }
      } catch (apiErr) {
        console.warn('Backend AI endpoint returned error, computing via regional agronomic engine:', apiErr);
      }

      setResults(data);

      if (data.mode === 'active_crop_optimization' || Boolean(data.active_crop_optimization)) {
        setActiveTab('optimization');
      } else {
        setActiveTab('crops');
        if (data.recommended_crops && data.recommended_crops.length > 0) {
          setExpandedCrop(data.recommended_crops[0].crop_name);
        }
      }

      toast({
        title: (data.mode === 'active_crop_optimization' || Boolean(data.active_crop_optimization))
          ? "Active Crop Diagnostics Ready"
          : "Crop Recommendations Ready",
        description: (data.mode === 'active_crop_optimization' || Boolean(data.active_crop_optimization))
          ? `Field improvements and exact units calculated for ${data.current_crop || effectiveCrop || 'Active Crop'}.`
          : `Top recommended crops synthesized with ${data.confidence_level}% diagnostic confidence.`,
      });

      if (selectedFarmId && data) {
        try {
          await apiPost(`/api/farms/${selectedFarmId}/diagnostics`, {
            nitrogen: soil.nitrogen,
            phosphorus: soil.phosphorus,
            potassium: soil.potassium,
            ph: soil.pH,
            moisture: soil.moisture,
            temperature: soil.temperature_C,
            humidity: soil.humidity_percent,
            healthStatus: data.soil_health_report.status,
            aiReport: JSON.stringify(data)
          });
        } catch (diagErr) {
          console.warn('Could not record diagnostic entry to backend:', diagErr);
        }
      }
    } catch (error) {
      console.error('Soil recommendation error:', error);
      const fallback = generateScientificSoilRecommendation({
        soil_data: soil,
        crop_status: cropYetToBeGrown ? 'yet_to_be_grown' : 'growing',
        preferred_crop: cropYetToBeGrown ? null : activeCropName,
        field_size_acres: 1,
      });
      setResults(fallback);
      if (fallback.mode === 'active_crop_optimization' || Boolean(fallback.active_crop_optimization)) {
        setActiveTab('optimization');
      } else {
        setActiveTab('crops');
        if (fallback.recommended_crops && fallback.recommended_crops.length > 0) {
          setExpandedCrop(fallback.recommended_crops[0].crop_name);
        }
      }
    } finally {
      clearInterval(stepInterval);
      setLoading(false);
    }
  };

  const printReport = () => {
    window.print();
  };

  return (
    <>
      <div className="space-y-8 no-print">
        {/* Header section with Premium Gold gradient */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-subtle pb-6" style={{ borderColor: 'var(--border-subtle)' }}>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
              <FlaskConical className="h-8 w-8 text-gradient-gold" style={{ color: 'var(--accent)' }} />
              <span className="text-gradient-gold">AgriSense AI™ Soil Diagnostic</span>
            </h1>
            <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
              Assesses soil NPK & chemistry against regional crop baselines, providing tailored crop recommendations for fallow land or detailed unit-based fertilizer & water adjustments for actively cultivated fields.
            </p>
          </div>
          {results && (
            <Button onClick={printReport} variant="outline" className="flex items-center gap-2 self-start md:self-auto border-medium" style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)', borderColor: 'var(--border-medium)' }}>
              <Printer className="h-4 w-4" />
              Print Diagnostic Report
            </Button>
          )}
        </div>

        {/* Loading / Processing State */}
        <AnimatePresence mode="wait">
          {loading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center p-12 card-premium text-center min-h-[450px]"
            >
              <div className="relative mb-8">
                <div className="w-24 h-24 rounded-full border-4 border-t-accent animate-spin" style={{ borderColor: 'var(--border-subtle)', borderTopColor: 'var(--accent)' }} />
                <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-8 w-8 animate-pulse text-gradient-gold animate-bounce" style={{ color: 'var(--accent)' }} />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gradient-gold">Processing Soil Data</h3>
              <p className="text-sm font-medium animate-pulse" style={{ color: 'var(--accent)' }}>
                {loadingSteps[loadingStep]}
              </p>
              <div className="w-64 bg-surface h-1.5 rounded-full overflow-hidden mt-6" style={{ background: 'var(--bg-elevated)' }}>
                <motion.div
                  className="h-full"
                  style={{ background: 'linear-gradient(90deg, var(--accent), var(--accent-hover))' }}
                  animate={{ width: `${((loadingStep + 1) / loadingSteps.length) * 100}%` }}
                  transition={{ duration: 0.8 }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input Form & Parameters */}
        {!loading && !results && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: General & Farm Config */}
            <div className="lg:col-span-1 space-y-6 flex flex-col justify-between">
              <div className="card-premium p-6 space-y-5 h-full flex flex-col justify-between">
                <div>
                  <h3 className="text-md font-bold mb-4 pb-2 border-b border-subtle flex items-center gap-2" style={{ color: 'var(--text-primary)', borderColor: 'var(--border-subtle)' }}>
                    <Sprout className="h-4.5 w-4.5" style={{ color: 'var(--accent)' }} />
                    Farm & Crop Settings
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>Select Target Farm</label>
                      <select
                        value={selectedFarmId}
                        onChange={(e) => setSelectedFarmId(e.target.value)}
                        className="w-full input-dark"
                      >
                        <option value="" disabled>Select a farm...</option>
                        {farms.map(f => (
                          <option key={f.id} value={f.id}>{f.name} ({f.location})</option>
                        ))}
                      </select>
                    </div>

                    {/* Crop Cultivation Status Toggle */}
                    <div className="p-3.5 rounded-xl border border-earth-border bg-earth-main/50 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gold-100 flex items-center gap-1.5">
                          <Activity className="h-3.5 w-3.5 text-gold-400" />
                          Field Cultivation Status
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          cropYetToBeGrown
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {cropYetToBeGrown ? 'Yet To Be Grown' : 'Crop Growing'}
                        </span>
                      </div>

                      <label className="flex items-start gap-2.5 cursor-pointer pt-1">
                        <input
                          type="checkbox"
                          checked={cropYetToBeGrown}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setCropYetToBeGrown(checked);
                            if (checked) {
                              setActiveCropName('');
                            } else {
                              const sel = farms.find(f => f.id === selectedFarmId);
                              setActiveCropName(sel?.current_crop || 'Paddy (Rice)');
                            }
                          }}
                          className="mt-0.5 rounded border-earth-border text-gold-500 focus:ring-gold-400 h-4 w-4 accent-[#d9a838]"
                        />
                        <div className="text-xs">
                          <span className="font-semibold text-gold-100/90 block">Crop is yet to be grown in this field</span>
                          <span className="text-[10px] text-gold-100/40 block mt-0.5 leading-snug">
                            Suggests top recommended crops to plant based on soil analysis.
                          </span>
                        </div>
                      </label>

                      {!cropYetToBeGrown && (
                        <div className="pt-2 border-t border-earth-border/50">
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-gold-100/50 mb-1">
                            Currently Cultivated Crop
                          </label>
                          <CropAutocomplete
                            value={activeCropName}
                            onChange={setActiveCropName}
                            placeholder="e.g. Paddy (Rice), Ragi, Cotton..."
                          />
                        </div>
                      )}
                    </div>
                    
                    {selectedFarmId && (
                      <div className="p-4 rounded-xl border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.02)]">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs text-[var(--text-secondary)] uppercase font-semibold tracking-wider">Farm Snapshot</span>
                          <button onClick={async () => {
                            try {
                              const data = await apiGet(`/api/farms/${selectedFarmId}/diagnostics`);
                              setHistory(Array.isArray(data) ? data : []);
                            } catch (err) {
                              console.error('Failed to load diagnostics history:', err);
                              setHistory([]);
                            } finally {
                              setShowHistory(true);
                            }
                          }} className="text-xs text-[var(--accent)] hover:underline flex items-center gap-1">
                            <History size={12} /> History
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm text-[var(--text-primary)]">
                          <div><span className="text-[var(--text-muted)]">Size:</span> {farms.find(f => f.id === selectedFarmId)?.area_acres || 1} ac</div>
                          <div>
                            <span className="text-[var(--text-muted)]">Crop:</span>{' '}
                            {cropYetToBeGrown ? (
                              <span className="text-emerald-400 font-medium">Yet to be grown</span>
                            ) : (
                              <span className="text-gold-400 font-medium">{activeCropName || farms.find(f => f.id === selectedFarmId)?.current_crop || 'Specified crop'}</span>
                            )}
                          </div>
                          <div><span className="text-[var(--text-muted)]">Soil:</span> {farms.find(f => f.id === selectedFarmId)?.soil_type || 'Loam'}</div>
                          <div><span className="text-[var(--text-muted)]">Water:</span> {farms.find(f => f.id === selectedFarmId)?.irrigation_type || 'Borewell'}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-6">
                  <Button
                    onClick={runAnalysis}
                    className="w-full btn-gold h-12 flex items-center justify-center gap-2 font-bold text-sm tracking-wide shadow-md"
                  >
                    <Sparkles className="h-4.5 w-4.5" />
                    RUN DIAGNOSTIC AI
                  </Button>
                </div>
              </div>
            </div>

            {/* Right: Chemistry Parameters */}
            <div className="lg:col-span-2 card-premium p-6 space-y-6">
              <h3 className="text-md font-bold pb-2 border-b border-subtle flex items-center gap-2" style={{ color: 'var(--text-primary)', borderColor: 'var(--border-subtle)' }}>
                <FlaskConical className="h-4.5 w-4.5" style={{ color: 'var(--accent)' }} />
                Soil Chemistry Inputs
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nitrogen */}
                <div className="space-y-2.5 p-4 rounded-xl border bg-earth-main/20 transition-all duration-200" style={{ borderColor: getSoilColor(soil.nitrogen, [60, 90]) }}>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
                      Nitrogen (N) - kg/ha
                    </span>
                    <span className="text-sm font-bold text-gradient-gold">{soil.nitrogen} kg/ha</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="140"
                    value={soil.nitrogen}
                    onChange={(e) => handleSoilChange('nitrogen', parseInt(e.target.value))}
                    className="soil-slider cursor-pointer"
                    style={{ '--pct': `${(soil.nitrogen / 140) * 100}%` } as React.CSSProperties}
                  />
                  <div className="flex justify-between text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    <span>0 kg/ha</span>
                    <span>Ideal (60-90 kg/ha)</span>
                    <span>140 kg/ha</span>
                  </div>
                </div>

                {/* Phosphorus */}
                <div className="space-y-2.5 p-4 rounded-xl border bg-earth-main/20 transition-all duration-200" style={{ borderColor: getSoilColor(soil.phosphorus, [30, 60]) }}>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
                      Phosphorus (P) - kg/ha
                    </span>
                    <span className="text-sm font-bold text-gradient-gold">{soil.phosphorus} kg/ha</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="90"
                    value={soil.phosphorus}
                    onChange={(e) => handleSoilChange('phosphorus', parseInt(e.target.value))}
                    className="soil-slider cursor-pointer"
                    style={{ '--pct': `${(soil.phosphorus / 90) * 100}%` } as React.CSSProperties}
                  />
                  <div className="flex justify-between text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    <span>0 kg/ha</span>
                    <span>Ideal (30-60 kg/ha)</span>
                    <span>90 kg/ha</span>
                  </div>
                </div>

                {/* Potassium */}
                <div className="space-y-2.5 p-4 rounded-xl border bg-earth-main/20 transition-all duration-200" style={{ borderColor: getSoilColor(soil.potassium, [40, 80]) }}>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                      Potassium (K) - kg/ha
                    </span>
                    <span className="text-sm font-bold text-gradient-gold">{soil.potassium} kg/ha</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="120"
                    value={soil.potassium}
                    onChange={(e) => handleSoilChange('potassium', parseInt(e.target.value))}
                    className="soil-slider cursor-pointer"
                    style={{ '--pct': `${(soil.potassium / 120) * 100}%` } as React.CSSProperties}
                  />
                  <div className="flex justify-between text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    <span>0 kg/ha</span>
                    <span>Ideal (40-80 kg/ha)</span>
                    <span>120 kg/ha</span>
                  </div>
                </div>

                {/* pH */}
                <div className="space-y-2.5 p-4 rounded-xl border bg-earth-main/20 transition-all duration-200" style={{ borderColor: getSoilColor(soil.pH, [6.0, 7.5]) }}>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
                      <Scale className="h-3.5 w-3.5 text-yellow-400" />
                      Acidity / Alkalinity (pH)
                    </span>
                    <span className="text-sm font-bold text-gradient-gold">{soil.pH.toFixed(1)}</span>
                  </div>
                  <input
                    type="range"
                    min="4.0"
                    max="9.5"
                    step="0.1"
                    value={soil.pH}
                    onChange={(e) => handleSoilChange('pH', parseFloat(e.target.value))}
                    className="soil-slider cursor-pointer"
                    style={{ '--pct': `${((soil.pH - 4.0) / 5.5) * 100}%` } as React.CSSProperties}
                  />
                  <div className="flex justify-between text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    <span>Acidic (&lt;6.0)</span>
                    <span>Neutral (6.5-7.2)</span>
                    <span>Alkaline (&gt;7.8)</span>
                  </div>
                </div>

                {/* Moisture */}
                <div className="space-y-2.5 p-4 rounded-xl border bg-earth-main/20 transition-all duration-200" style={{ borderColor: getSoilColor(soil.moisture, [40, 70]) }}>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
                      <Droplets className="h-3.5 w-3.5 text-blue-400" />
                      Soil Moisture Level (%)
                    </span>
                    <span className="text-sm font-bold text-gradient-gold">{soil.moisture}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="95"
                    value={soil.moisture}
                    onChange={(e) => handleSoilChange('moisture', parseInt(e.target.value))}
                    className="soil-slider cursor-pointer"
                    style={{ '--pct': `${((soil.moisture - 10) / 85) * 100}%` } as React.CSSProperties}
                  />
                  <div className="flex justify-between text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    <span>Dry (&lt;30%)</span>
                    <span>Optimal (40-70%)</span>
                    <span>Saturated (&gt;85%)</span>
                  </div>
                </div>

                {/* Temperature */}
                <div className="space-y-2.5 p-4 rounded-xl border bg-earth-main/20 transition-all duration-200" style={{ borderColor: getSoilColor(soil.temperature_C, [22, 32]) }}>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
                      <Thermometer className="h-3.5 w-3.5 text-red-400" />
                      Soil Temperature (°C)
                    </span>
                    <span className="text-sm font-bold text-gradient-gold">{soil.temperature_C}°C</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="45"
                    value={soil.temperature_C}
                    onChange={(e) => handleSoilChange('temperature_C', parseInt(e.target.value))}
                    className="soil-slider cursor-pointer"
                    style={{ '--pct': `${((soil.temperature_C - 10) / 35) * 100}%` } as React.CSSProperties}
                  />
                  <div className="flex justify-between text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    <span>Cold (10°C)</span>
                    <span>Warm (25-32°C)</span>
                    <span>Extreme Heat (45°C)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Interactive Analysis Output */}
        {results && !loading && (
          <div className="space-y-8">
            {/* Field Status Callout Banner */}
            {isOptimizationMode && results.active_crop_optimization ? (
              <div className="bg-gradient-to-r from-amber-500/15 via-gold-400/10 to-transparent p-5 rounded-2xl border border-amber-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400">
                    <Activity className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-gold-100 flex items-center gap-2">
                      <span>Currently Cultivating:</span>
                      <span className="text-gradient-gold uppercase">{results.current_crop || activeCropName || 'Active Crop'}</span>
                      <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-full uppercase">Active Crop Optimization</span>
                    </h3>
                    <p className="text-xs text-gold-100/70 mt-0.5">
                      A crop is already being grown in this field. Detailed changes required for fertilizer use and water are compiled in units below along with ideal growing practices.
                    </p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="text-[10px] uppercase font-bold text-gold-100/40 block">Expected Yield Target</span>
                  <span className="text-sm font-black text-emerald-400">{results.active_crop_optimization.expected_yield_with_improvements.split('(')[0]}</span>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-r from-emerald-500/15 via-gold-400/10 to-transparent p-5 rounded-2xl border border-emerald-500/30 flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Sprout className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-gold-100 flex items-center gap-2">
                    <span>Field Status:</span>
                    <span className="text-emerald-400 uppercase">Crop Yet to be Grown (Fallow Field)</span>
                  </h3>
                  <p className="text-xs text-gold-100/70 mt-0.5">
                    No crop is currently planted on this farm. Below are the top recommended crops best suited for cultivation under your soil chemistry profile.
                  </p>
                </div>
              </div>
            )}

            {/* Top diagnostic metadata grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="card-premium p-4 flex flex-col justify-center">
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Farmer & Farm Area</span>
                <span className="text-md font-bold mt-1" style={{ color: 'var(--text-primary)' }}>{farms.find(f => f.id === selectedFarmId)?.name || 'Farmer Partner'}</span>
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{farms.find(f => f.id === selectedFarmId)?.area_acres || 1} Acres</span>
              </div>
              <div className="card-premium p-4 flex flex-col justify-center">
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Diagnostic Location</span>
                <span className="text-md font-bold mt-1 flex items-center gap-1" style={{ color: 'var(--text-primary)' }}>
                  <MapPin className="h-4 w-4" style={{ color: 'var(--accent)' }} />
                  {farms.find(f => f.id === selectedFarmId)?.location || 'Karnataka Region'}
                </span>
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Season: Current</span>
              </div>
              <div className="card-premium p-4 flex flex-col justify-center">
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Soil Status</span>
                <span className="text-md font-bold mt-1 flex items-center gap-1.5" style={{ color: 'var(--accent)' }}>
                  <CheckCircle className="h-4 w-4" />
                  {results.soil_health_report.status}
                </span>
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Confidence: {results.confidence_level}%</span>
              </div>
              <div className="card-premium p-4 flex flex-col justify-center">
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Water Source</span>
                <span className="text-md font-bold mt-1" style={{ color: 'var(--text-primary)' }}>{farms.find(f => f.id === selectedFarmId)?.irrigation_type || 'Borewell / Canal'}</span>
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Chemistry Balance: Evaluated</span>
              </div>
            </div>

            {/* Warnings Alert Callout */}
            {results.warnings && results.warnings.length > 0 && (
              <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-amber-500">Critical Agronomic Alerts</h4>
                  <ul className="text-xs list-disc pl-4 mt-1 space-y-1" style={{ color: 'var(--text-secondary)' }}>
                    {results.warnings.map((warn, i) => (
                      <li key={i}>{warn}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Main Segment Tabs */}
            <div className="flex border-b border-subtle gap-4" style={{ borderColor: 'var(--border-subtle)' }}>
              {isOptimizationMode ? (
                <>
                  <button
                    onClick={() => setActiveTab('optimization')}
                    className={`pb-3 font-bold text-sm border-b-2 transition-all duration-200 ${
                      currentTab === 'optimization' ? 'border-accent text-accent' : 'border-transparent'
                    }`}
                    style={{
                      color: currentTab === 'optimization' ? 'var(--accent)' : 'var(--text-secondary)',
                      borderBottomColor: currentTab === 'optimization' ? 'var(--accent)' : 'transparent',
                    }}
                  >
                    Field Improvement & Nutrient Adjustments (in Units)
                  </button>
                  <button
                    onClick={() => setActiveTab('protocol')}
                    className={`pb-3 font-bold text-sm border-b-2 transition-all duration-200 ${
                      currentTab === 'protocol' ? 'border-accent text-accent' : 'border-transparent'
                    }`}
                    style={{
                      color: currentTab === 'protocol' ? 'var(--accent)' : 'var(--text-secondary)',
                      borderBottomColor: currentTab === 'protocol' ? 'var(--accent)' : 'transparent',
                    }}
                  >
                    Ideal Growing Protocol & Field Care
                  </button>
                  <button
                    onClick={() => setActiveTab('health')}
                    className={`pb-3 font-bold text-sm border-b-2 transition-all duration-200 ${
                      currentTab === 'health' ? 'border-accent text-accent' : 'border-transparent'
                    }`}
                    style={{
                      color: currentTab === 'health' ? 'var(--accent)' : 'var(--text-secondary)',
                      borderBottomColor: currentTab === 'health' ? 'var(--accent)' : 'transparent',
                    }}
                  >
                    Soil Health & Amendment Report
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setActiveTab('crops')}
                    className={`pb-3 font-bold text-sm border-b-2 transition-all duration-200 ${
                      currentTab === 'crops' ? 'border-accent text-accent' : 'border-transparent'
                    }`}
                    style={{
                      color: currentTab === 'crops' ? 'var(--accent)' : 'var(--text-secondary)',
                      borderBottomColor: currentTab === 'crops' ? 'var(--accent)' : 'transparent',
                    }}
                  >
                    Recommended Crop Guides (To Plant)
                  </button>
                  <button
                    onClick={() => setActiveTab('health')}
                    className={`pb-3 font-bold text-sm border-b-2 transition-all duration-200 ${
                      currentTab === 'health' ? 'border-accent text-accent' : 'border-transparent'
                    }`}
                    style={{
                      color: currentTab === 'health' ? 'var(--accent)' : 'var(--text-secondary)',
                      borderBottomColor: currentTab === 'health' ? 'var(--accent)' : 'transparent',
                    }}
                  >
                    Soil Health & Amendment Report
                  </button>
                </>
              )}
            </div>

            {/* TAB CONTENT 1: Active Crop Optimization (Field Improvement & Nutrient Adjustments in Units) */}
            {isOptimizationMode && results.active_crop_optimization && currentTab === 'optimization' && (
              <div className="space-y-8">
                {/* Section A: Commercial Fertilizer & Nutrient Changes in Units */}
                <div className="card-premium p-6 space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-subtle gap-2" style={{ borderColor: 'var(--border-subtle)' }}>
                    <div>
                      <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                        <Scale className="h-5 w-5 text-gold-400" />
                        Soil Nutrient Adjustments & Fertilizer Dosage (in Units)
                      </h3>
                      <p className="text-xs mt-1 text-gold-100/60">
                        Exact units of fertilizers required (more or less) based on the laboratory deficit between current soil readings and {results.current_crop}&apos;s optimal growth demands.
                      </p>
                    </div>
                    <span className="text-xs px-3 py-1 bg-gold-400/10 border border-gold-400/20 text-gold-400 rounded-full font-bold self-start md:self-auto">
                      Calibrated for {farms.find(f => f.id === selectedFarmId)?.area_acres || 1} Acre(s)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {results.active_crop_optimization.nutrient_adjustments.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-5 rounded-2xl border bg-earth-main/30 space-y-3.5 transition-all hover:border-gold-400/40"
                        style={{ borderColor: 'var(--border-subtle)' }}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-gold-100/40 block">Nutrient Parameter</span>
                            <h4 className="text-base font-extrabold text-gold-100 mt-0.5">{item.nutrient}</h4>
                          </div>
                          <span
                            className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 uppercase tracking-wider ${
                              item.action === 'increase'
                                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                                : item.action === 'decrease'
                                ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                                : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            }`}
                          >
                            {item.action === 'increase' ? (
                              <><ArrowUpRight className="h-3 w-3" /> + More Required</>
                            ) : item.action === 'decrease' ? (
                              <><ArrowDownRight className="h-3 w-3" /> - Reduce / Less</>
                            ) : (
                              <><CheckCircle className="h-3 w-3" /> Balanced</>
                            )}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 p-3 bg-earth-elevated/40 rounded-xl text-xs border border-earth-border/40">
                          <div>
                            <span className="text-gold-100/40 block text-[9px] uppercase font-bold">Tested Soil Level</span>
                            <span className="font-bold text-gold-100">{item.current_level}</span>
                          </div>
                          <div>
                            <span className="text-gold-100/40 block text-[9px] uppercase font-bold">Target Requirement</span>
                            <span className="font-bold text-gold-400">{item.target_level}</span>
                          </div>
                          <div className="col-span-2 pt-1 border-t border-earth-border/30">
                            <span className="text-gold-100/40 block text-[9px] uppercase font-bold">Nutrient Delta</span>
                            <span className="font-bold text-gold-100/90">{item.difference}</span>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400/90 block">
                            Recommended Dosage in Units:
                          </span>
                          <p className="text-xs font-extrabold text-gold-100 leading-snug p-2.5 rounded-xl bg-gold-400/5 border border-gold-400/15">
                            {item.commercial_fertilizer_dosage}
                          </p>
                          <p className="text-[11px] text-gold-100/60 leading-relaxed italic pl-1">
                            {item.unit_recommendation}
                          </p>
                        </div>

                        <p className="text-[11px] text-gold-100/50 leading-relaxed border-t border-earth-border/30 pt-2.5">
                          <strong>Agronomic Impact:</strong> {item.rationale}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section B: Water & Irrigation Adjustments in Units */}
                <div className="card-premium p-6 space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-subtle gap-2" style={{ borderColor: 'var(--border-subtle)' }}>
                    <div>
                      <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                        <Droplets className="h-5 w-5 text-blue-400" />
                        Water & Irrigation Changes in Units
                      </h3>
                      <p className="text-xs mt-1 text-gold-100/60">
                        Exact water volume and schedule modifications required based on current root-zone moisture versus {results.current_crop} tolerance.
                      </p>
                    </div>
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider self-start md:self-auto ${
                        results.active_crop_optimization.water_adjustments.action === 'increase'
                          ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                          : results.active_crop_optimization.water_adjustments.action === 'decrease'
                          ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                          : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {results.active_crop_optimization.water_adjustments.action === 'increase'
                        ? '+ Increase Irrigation Volume'
                        : results.active_crop_optimization.water_adjustments.action === 'decrease'
                        ? '- Reduce Water / Open Drains'
                        : '✓ Moisture Status Optimal'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-4 rounded-xl bg-earth-main/30 border border-earth-border space-y-2">
                      <span className="text-[10px] font-bold uppercase text-gold-100/40">Tested Moisture vs Target</span>
                      <div className="text-lg font-black text-gold-100">
                        {results.active_crop_optimization.water_adjustments.current_moisture}{' '}
                        <span className="text-xs text-gold-100/40 font-normal">
                          (Target: {results.active_crop_optimization.water_adjustments.ideal_moisture})
                        </span>
                      </div>
                      <p className="text-xs text-gold-400 font-medium">
                        {results.active_crop_optimization.water_adjustments.difference}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-earth-main/30 border border-earth-border space-y-2 md:col-span-2">
                      <span className="text-[10px] font-bold uppercase text-gold-100/40">Unit Adjustment Recommendation</span>
                      <p className="text-sm font-bold text-gold-100 leading-snug">
                        {results.active_crop_optimization.water_adjustments.unit_recommendation}
                      </p>
                      <p className="text-xs text-gold-100/60 pt-1 border-t border-earth-border/30">
                        <strong>Irrigation Scheduling:</strong> {results.active_crop_optimization.water_adjustments.frequency_and_schedule}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Section C: Field Condition & Soil Improvements */}
                <div className="card-premium p-6 space-y-6">
                  <div className="pb-4 border-b border-subtle" style={{ borderColor: 'var(--border-subtle)' }}>
                    <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                      <ShieldCheck className="h-5 w-5 text-emerald-400" />
                      Field Improvement & Soil Condition Remediation
                    </h3>
                    <p className="text-xs mt-1 text-gold-100/60">
                      Physical and biological amendments in metric units to elevate root health, nutrient uptake, and total harvest potential.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {results.active_crop_optimization.soil_condition_improvements.map((item, idx) => (
                      <div key={idx} className="p-4 rounded-2xl bg-earth-main/30 border border-earth-border space-y-3">
                        <div>
                          <span className="text-[9px] font-black uppercase tracking-widest text-gold-100/40 block">Soil Condition</span>
                          <h4 className="text-sm font-bold text-gold-100 mt-0.5">{item.parameter}</h4>
                        </div>
                        <div className="p-2.5 rounded-lg bg-earth-elevated/40 text-xs text-gold-100/80 space-y-1">
                          <div><span className="text-gold-100/40">Current:</span> {item.current_value}</div>
                          <div><span className="text-gold-100/40">Target:</span> <strong className="text-gold-400">{item.ideal_target}</strong></div>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold uppercase text-amber-400 block mb-1">Remediation in Units:</span>
                          <p className="text-xs font-bold text-gold-100 leading-snug">{item.remediation_in_units}</p>
                        </div>
                        <p className="text-[11px] text-gold-100/50 leading-relaxed pt-2 border-t border-earth-border/30">
                          {item.practical_steps}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-emerald-400 block tracking-wider">Estimated Harvest Yield Output</span>
                      <p className="text-sm font-bold text-gold-100 mt-0.5">
                        {results.active_crop_optimization.expected_yield_with_improvements}
                      </p>
                    </div>
                    <Button onClick={() => setResults(null)} variant="outline" className="border-subtle text-xs font-semibold h-10 px-6 self-start sm:self-auto">
                      Analyze Another Plot
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT 2: Ideal Growing Protocol (When Crop is Cultivated) */}
            {isOptimizationMode && results.active_crop_optimization && currentTab === 'protocol' && (
              <div className="card-premium p-6 space-y-6">
                <div className="border-b border-subtle pb-4" style={{ borderColor: 'var(--border-subtle)' }}>
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                      <Sprout className="h-5.5 w-5.5 text-gold-400" />
                      Ideal Way of Growing {results.current_crop || activeCropName || 'Active Crop'}
                    </h3>
                    <span className="text-xs font-bold px-3 py-1 bg-gold-400/10 text-gold-400 rounded-full border border-gold-400/20">
                      Customized to Soil Diagnostics
                    </span>
                  </div>
                  <p className="text-xs mt-1 text-gold-100/60">
                    Comprehensive stage-by-stage agronomic growing guide adjusted for current soil test levels.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Stage 1: Field Prep */}
                  <div className="p-4 rounded-xl bg-earth-main/30 border border-subtle space-y-2">
                    <h4 className="text-sm font-bold flex items-center gap-2 text-gold-100">
                      <span className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold bg-gold-400/20 text-gold-400">1</span>
                      Field Preparation & Current Stage Management
                    </h4>
                    <p className="text-xs pl-8 text-gold-100/70 leading-relaxed">
                      {results.active_crop_optimization.ideal_growing_protocol.field_preparation_and_current_care}
                    </p>
                  </div>

                  {/* Stage 2: Nutrient Schedule */}
                  <div className="p-4 rounded-xl bg-earth-main/30 border border-subtle space-y-2">
                    <h4 className="text-sm font-bold flex items-center gap-2 text-gold-100">
                      <span className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold bg-gold-400/20 text-gold-400">2</span>
                      Commercial Fertilizer Split Schedule (Basal & Top-Dressing)
                    </h4>
                    <p className="text-xs pl-8 leading-relaxed text-gold-100/70 whitespace-pre-line">
                      {results.active_crop_optimization.ideal_growing_protocol.fertilizer_npk_schedule_per_acre}
                    </p>
                  </div>

                  {/* Stage 3: Irrigation Plan */}
                  <div className="p-4 rounded-xl bg-earth-main/30 border border-subtle space-y-2">
                    <h4 className="text-sm font-bold flex items-center gap-2 text-gold-100">
                      <span className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold bg-gold-400/20 text-gold-400">3</span>
                      Custom Irrigation & Water Management
                    </h4>
                    <p className="text-xs pl-8 text-gold-100/70 leading-relaxed">
                      {results.active_crop_optimization.ideal_growing_protocol.irrigation_plan}
                    </p>
                  </div>

                  {/* Stage 4: Pest & Pathogen Control */}
                  <div className="p-4 rounded-xl bg-earth-main/30 border border-subtle space-y-2">
                    <h4 className="text-sm font-bold flex items-center gap-2 text-gold-100">
                      <span className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold bg-gold-400/20 text-gold-400">4</span>
                      Pathogen / Pest Control & Crop Protection
                    </h4>
                    <p className="text-xs pl-8 text-gold-100/70 leading-relaxed">
                      {results.active_crop_optimization.ideal_growing_protocol.pest_disease_management}
                    </p>
                  </div>

                  {/* Stage 5: Harvest & Storage */}
                  <div className="p-4 rounded-xl bg-earth-main/30 border border-subtle space-y-2">
                    <h4 className="text-sm font-bold flex items-center gap-2 text-gold-100">
                      <span className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold bg-gold-400/20 text-gold-400">5</span>
                      Harvesting & Post-Harvest Storage Tips
                    </h4>
                    <p className="text-xs pl-8 text-gold-100/70 leading-relaxed">
                      {results.active_crop_optimization.ideal_growing_protocol.harvesting_tips}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT 3: Recommended Crops (ONLY when crop is YET TO BE GROWN) */}
            {!isOptimizationMode && currentTab === 'crops' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Recommended Crops List */}
                <div className="lg:col-span-1 space-y-4">
                  {(results.recommended_crops || []).map((crop) => {
                    const isSelected = expandedCrop
                      ? expandedCrop === crop.crop_name
                      : (results.recommended_crops?.[0]?.crop_name === crop.crop_name);
                    return (
                      <div
                        key={crop.crop_name}
                        onClick={() => setExpandedCrop(crop.crop_name)}
                        className={`p-5 rounded-xl border transition-all duration-300 cursor-pointer ${
                          isSelected
                            ? 'bg-surface-alt border-accent'
                            : 'bg-surface border-subtle hover:border-medium'
                        }`}
                        style={{
                          backgroundColor: isSelected ? 'var(--bg-elevated)' : 'var(--bg-card)',
                          borderColor: isSelected ? 'var(--accent)' : 'var(--border-subtle)',
                        }}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-md" style={{ color: 'var(--text-primary)' }}>{crop.crop_name}</h4>
                            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                              Est. Yield: <strong style={{ color: 'var(--text-primary)' }}>{crop.expected_yield_per_acre_tons} Tons/Acre</strong>
                            </p>
                          </div>
                          <span
                            className="text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1"
                            style={{
                              background: 'var(--accent-soft)',
                              color: 'var(--accent)',
                            }}
                          >
                            <TrendingUp className="h-3 w-3" />
                            {crop.suitability_score}% Match
                          </span>
                        </div>
                      </div>
                    );
                  })}

                  <Button
                    onClick={() => setResults(null)}
                    variant="outline"
                    className="w-full border-subtle mt-4 h-11 flex items-center justify-center gap-1 text-xs font-semibold"
                    style={{ background: 'var(--bg-card)', color: 'var(--text-secondary)', borderColor: 'var(--border-subtle)' }}
                  >
                    Analyze New Soil Chemistry
                  </Button>
                </div>

                {/* Right: Detailed Stage-by-Stage Growing Guide */}
                <div className="lg:col-span-2 card-premium p-6 space-y-6">
                  {(() => {
                    const cropList = results.recommended_crops || [];
                    const crop = cropList.find((c) => c.crop_name === expandedCrop) || cropList[0];
                    if (!crop) return (
                      <div className="p-8 text-center text-xs text-gold-100/50">
                        Select a crop from the left to view its complete growing guide.
                      </div>
                    );

                    return (
                      <div className="space-y-6">
                        <div className="border-b border-subtle pb-4" style={{ borderColor: 'var(--border-subtle)' }}>
                          <div className="flex justify-between items-center">
                            <h3 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                              <Sprout className="h-5.5 w-5.5" style={{ color: 'var(--accent)' }} />
                              {crop.crop_name} Growing Protocol
                            </h3>
                            <span className="text-sm font-semibold" style={{ color: 'var(--accent)' }}>
                              {crop.suitability_score}% Soil Suitability Rating
                            </span>
                          </div>
                          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                            Tailored specifically based on {soil.nitrogen}-{soil.phosphorus}-{soil.potassium} NPK levels & {soil.pH} pH profile.
                          </p>
                        </div>

                        {/* 4-Stage Accordion Guide Card */}
                        <div className="space-y-4">
                          <div className="p-4 rounded-xl border border-subtle space-y-2" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}>
                            <h4 className="text-sm font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                              <span className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>1</span>
                              Sowing & Field Soil Preparation
                            </h4>
                            <p className="text-xs pl-8" style={{ color: 'var(--text-secondary)' }}>
                              {crop.growing_guide.sowing_details}
                            </p>
                          </div>

                          <div className="p-4 rounded-xl border border-subtle space-y-2" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}>
                            <h4 className="text-sm font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                              <span className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>2</span>
                              AI Recommended Commercial Fertilizer Split Schedule
                            </h4>
                            <p className="text-xs pl-8 leading-relaxed whitespace-pre-line" style={{ color: 'var(--text-secondary)' }}>
                              {crop.growing_guide.fertilizer_npk_schedule_per_acre}
                            </p>
                          </div>

                          <div className="p-4 rounded-xl border border-subtle space-y-2" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}>
                            <h4 className="text-sm font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                              <span className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>3</span>
                              Custom Water Irrigation Schedule
                            </h4>
                            <p className="text-xs pl-8" style={{ color: 'var(--text-secondary)' }}>
                              {crop.growing_guide.irrigation_plan}
                            </p>
                          </div>

                          <div className="p-4 rounded-xl border border-subtle space-y-2" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}>
                            <h4 className="text-sm font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                              <span className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>4</span>
                              Pathogen / Pest Control & Yield Management
                            </h4>
                            <p className="text-xs pl-8" style={{ color: 'var(--text-secondary)' }}>
                              {crop.growing_guide.pest_disease_management}
                            </p>
                          </div>

                          <div className="p-4 rounded-xl border border-subtle space-y-2" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}>
                            <h4 className="text-sm font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                              <span className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>5</span>
                              Harvest & Post-Harvest Storage Tips
                            </h4>
                            <p className="text-xs pl-8" style={{ color: 'var(--text-secondary)' }}>
                              {crop.growing_guide.harvesting_tips}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}

            {/* TAB CONTENT: Soil Health & Amendments */}
            {currentTab === 'health' && (
              <div className="card-premium p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-bold flex items-center gap-2 mb-2" style={{ color: 'var(--text-primary)' }}>
                    <FlaskConical className="h-5 w-5" style={{ color: 'var(--accent)' }} />
                    Comprehensive Chemistry Diagnostic & Limiting Factors
                  </h3>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    Summary of agricultural chemical elements that are currently limiting maximum crop productivity on your acreage.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Elements Status */}
                  <div className="p-5 rounded-xl border border-subtle space-y-4" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}>
                    <h4 className="text-sm font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                      <Info className="h-4.5 w-4.5" style={{ color: 'var(--accent)' }} />
                      Identified Nutrients Status
                    </h4>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <span style={{ color: 'var(--text-secondary)' }}>Nitrogen Concentration</span>
                        <span className={soil.nitrogen < 50 ? 'text-red-400 font-semibold' : 'text-green-400 font-semibold'}>
                          {soil.nitrogen < 50 ? 'Highly Deficient' : 'Optimal'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span style={{ color: 'var(--text-secondary)' }}>Phosphorus Concentration</span>
                        <span className={soil.phosphorus < 20 ? 'text-red-400 font-semibold' : 'text-green-400 font-semibold'}>
                          {soil.phosphorus < 20 ? 'Deficient' : 'Optimal'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span style={{ color: 'var(--text-secondary)' }}>Potassium Concentration</span>
                        <span className={soil.potassium < 40 ? 'text-red-400 font-semibold' : 'text-green-400 font-semibold'}>
                          {soil.potassium < 40 ? 'Deficient' : 'Optimal'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span style={{ color: 'var(--text-secondary)' }}>Alkalinity / Acidity pH</span>
                        <span className={soil.pH < 6.0 || soil.pH > 8.0 ? 'text-amber-400 font-semibold' : 'text-green-400 font-semibold'}>
                          {soil.pH < 6.0 ? 'Moderately Acidic' : soil.pH > 8.0 ? 'Alkaline' : 'Excellent Neutral'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Amendments recommendation */}
                  <div className="p-5 rounded-xl border border-subtle space-y-4" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}>
                    <h4 className="text-sm font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                      <Sparkles className="h-4.5 w-4.5" style={{ color: 'var(--accent)' }} />
                      Recommended Chemical Amendments
                    </h4>
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                      {results.soil_health_report.soil_amendment_recommendations}
                    </p>
                    <div className="border-t border-subtle pt-3" style={{ borderColor: 'var(--border-subtle)' }}>
                      <span className="text-[10px] uppercase font-bold tracking-wider" style={{ color: 'var(--text-muted)' }}>Limiting Chemistry Factors:</span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {results.soil_health_report.limiting_factors.map((item) => (
                          <span key={item} className="text-[10px] px-2.5 py-1 rounded-full font-medium" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => setResults(null)}
                  className="btn-gold h-10 w-full md:w-auto font-bold px-6 text-xs mt-4"
                >
                  Close Diagnostic
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ===== STRICTLY PRINT LAYOUT STYLING AND HTML ===== */}
      {results && (
        <div className="hidden print:block font-serif text-black p-8 max-w-5xl mx-auto space-y-6">
          <div className="text-center border-b-2 border-black pb-4">
            <h1 className="text-2xl font-bold uppercase tracking-wider">AgriSense AI™ Soil Diagnostic Report</h1>
            <p className="text-sm mt-1">Smart Agriculture Platform - Karnataka State Farming Partner</p>
            <p className="text-xs mt-0.5">Date: {new Date().toISOString().split('T')[0]}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm border-b border-black pb-4">
            <div>
              <p><strong>Farmer Name:</strong> {farms.find(f => f.id === selectedFarmId)?.name || 'Farmer Partner'}</p>
              <p><strong>Location:</strong> {farms.find(f => f.id === selectedFarmId)?.location || 'Karnataka'}</p>
              <p><strong>Acreage Size:</strong> {farms.find(f => f.id === selectedFarmId)?.area_acres || 1} Acres</p>
            </div>
            <div>
              <p><strong>Water Irrigation:</strong> {farms.find(f => f.id === selectedFarmId)?.irrigation_type || 'Unknown'}</p>
              <p><strong>Field Status:</strong> {results.mode === 'active_crop_optimization' ? `Cultivating ${results.current_crop}` : 'Crop Yet to be Grown'}</p>
              <p><strong>AI Diagnostics:</strong> Status {results.soil_health_report.status} ({results.confidence_level}% Confidence)</p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-md font-bold uppercase underline">1. Soil Chemistry Laboratory Reading</h3>
            <table className="w-full text-left text-xs border border-collapse border-black">
              <thead>
                <tr className="bg-gray-100 border-b border-black">
                  <th className="p-2 border-r border-black">Nutrient Component</th>
                  <th className="p-2 border-r border-black">Value</th>
                  <th className="p-2">Diagnostic Reading</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-black">
                  <td className="p-2 border-r border-black">Nitrogen (N)</td>
                  <td className="p-2 border-r border-black">{soil.nitrogen} kg/ha</td>
                  <td className="p-2">{soil.nitrogen < 50 ? 'Deficient' : 'Optimal'}</td>
                </tr>
                <tr className="border-b border-black">
                  <td className="p-2 border-r border-black">Phosphorus (P)</td>
                  <td className="p-2 border-r border-black">{soil.phosphorus} kg/ha</td>
                  <td className="p-2">{soil.phosphorus < 20 ? 'Deficient' : 'Optimal'}</td>
                </tr>
                <tr className="border-b border-black">
                  <td className="p-2 border-r border-black">Potassium (K)</td>
                  <td className="p-2 border-r border-black">{soil.potassium} kg/ha</td>
                  <td className="p-2">{soil.potassium < 40 ? 'Deficient' : 'Optimal'}</td>
                </tr>
                <tr>
                  <td className="p-2 border-r border-black">pH Acidity Balance</td>
                  <td className="p-2 border-r border-black">{soil.pH} pH</td>
                  <td className="p-2">{soil.pH < 6.0 ? 'Acidic' : soil.pH > 8.0 ? 'Alkaline' : 'Excellent Neutral'}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {results.mode === 'active_crop_optimization' && results.active_crop_optimization ? (
            <div className="space-y-4 pt-4">
              <h3 className="text-md font-bold uppercase underline">2. Unit-Based Fertilizer & Water Adjustments for {results.current_crop}</h3>
              <table className="w-full text-left text-xs border border-collapse border-black">
                <thead>
                  <tr className="bg-gray-100 border-b border-black">
                    <th className="p-2 border-r border-black">Nutrient</th>
                    <th className="p-2 border-r border-black">Action</th>
                    <th className="p-2 border-r border-black">Dosage in Units</th>
                    <th className="p-2">Rationale</th>
                  </tr>
                </thead>
                <tbody>
                  {results.active_crop_optimization.nutrient_adjustments.map((adj, i) => (
                    <tr key={i} className="border-b border-black">
                      <td className="p-2 border-r border-black font-bold">{adj.nutrient}</td>
                      <td className="p-2 border-r border-black uppercase">{adj.action}</td>
                      <td className="p-2 border-r border-black font-semibold">{adj.commercial_fertilizer_dosage}</td>
                      <td className="p-2">{adj.rationale}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="p-2 border border-black text-xs">
                <p><strong>Water Adjustment:</strong> {results.active_crop_optimization.water_adjustments.unit_recommendation}</p>
                <p><strong>Irrigation Schedule:</strong> {results.active_crop_optimization.water_adjustments.frequency_and_schedule}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4 pt-4">
              <h3 className="text-md font-bold uppercase underline">2. High Suitability Crops Selection (To Plant)</h3>
              {results.recommended_crops.map((crop, idx) => (
                <div key={idx} className="border border-black p-4 rounded space-y-2 text-xs">
                  <div className="flex justify-between items-center border-b border-black pb-1">
                    <span className="font-bold text-sm">{idx + 1}. {crop.crop_name}</span>
                    <span>Suitability: {crop.suitability_score}% | Est. Yield: {crop.expected_yield_per_acre_tons} Tons/Acre</span>
                  </div>
                  <p><strong>Stage 1: Sowing:</strong> {crop.growing_guide.sowing_details}</p>
                  <p><strong>Stage 2: Fertilizers splits:</strong> {crop.growing_guide.fertilizer_npk_schedule_per_acre}</p>
                  <p><strong>Stage 3: Water Irrigation:</strong> {crop.growing_guide.irrigation_plan}</p>
                  <p><strong>Stage 4: Pest & Harvest Tips:</strong> {crop.growing_guide.pest_disease_management} {crop.growing_guide.harvesting_tips}</p>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-2 pt-4 text-xs border-t border-black">
            <p><strong>Recommended Amendments:</strong> {results.soil_health_report.soil_amendment_recommendations}</p>
            <p><strong>Agronomic Warnings:</strong> {results.warnings.join(', ')}</p>
          </div>

          <div className="text-center pt-8 text-[10px] text-gray-500">
            Report dynamically generated by AgriSense AI™ Soil Diagnostic Engine. All schedules are calibrated for Karnataka agro-climatic conditions.
          </div>
        </div>
      )}

      {showHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#1a1a1a] border border-[#333] rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-[#f0ece0] flex items-center gap-2">
                <History className="text-[#c49a2a]" /> Soil Diagnostics History
              </h2>
              <button 
                onClick={() => setShowHistory(false)} 
                className="text-[#a09880] hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              {history.length === 0 ? (
                <p className="text-center text-[#a09880] py-8">No past diagnostics found for this farm.</p>
              ) : (
                history.map((h, i) => (
                  <div key={h.id || i} className="bg-[#12120e] p-4 rounded-xl border border-[rgba(255,255,255,0.05)]">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-bold text-[#c49a2a]">{formatDate(h.createdAt || h.created_at || Date.now())}</span>
                      <span className="text-xs px-2 py-1 rounded bg-[#222] font-semibold">{h.healthStatus || h.health_status || "Optimal"}</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-xs text-[#a09880] mb-3">
                      <div>N: {h.nitrogen ?? '-'}</div><div>P: {h.phosphorus ?? '-'}</div><div>K: {h.potassium ?? '-'}</div><div>pH: {h.ph ?? '-'}</div>
                    </div>
                    <p className="text-xs text-[#f0ece0] line-clamp-3 bg-black/20 p-2 rounded italic">
                      {safeGetAmendmentRecommendations(h.aiReport || h.ai_report)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function SoilAnalysis() {
  return (
    <div className="pt-24 px-4 sm:px-6 lg:px-8 pb-12 max-w-7xl mx-auto animate-fade-in">
      <SoilAnalysisContent />
    </div>
  );
}
