import { useState } from 'react';
import { apiPost } from '@/lib/httpClient';
import { Button } from '@/components/ui/button';
import {
  Sparkles,
  Sprout,
  Thermometer,
  Droplets,
  Wind,
  FlaskConical,
  AlertTriangle,
  TrendingUp,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Printer,
  ArrowRight,
  Info,
  MapPin,
  Calendar,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SoilData {
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  pH: number;
  moisture: number;
  temperature_C: number;
  humidity_percent: number;
}

interface CropGuide {
  sowing_details: string;
  fertilizer_npk_schedule_per_acre: string;
  irrigation_plan: string;
  pest_disease_management: string;
  harvesting_tips: string;
}

interface RecommendedCrop {
  crop_name: string;
  suitability_score: number;
  expected_yield_per_acre_tons: number;
  growing_guide: CropGuide;
}

interface SoilHealthReport {
  status: string;
  limiting_factors: string[];
  soil_amendment_recommendations: string;
}

interface RecommendationResponse {
  recommended_crops: RecommendedCrop[];
  soil_health_report: SoilHealthReport;
  warnings: string[];
  confidence_level: number;
}

const getSoilColor = (value: number, ideal: [number, number]) => {
  if (value < ideal[0]) return 'rgba(196,90,74,0.3)';   // deficient — red
  if (value > ideal[1]) return 'rgba(74,122,196,0.3)';  // excess — blue
  return 'rgba(74,154,106,0.3)';                          // ideal — green
};

export function SoilAnalysisContent() {
  const [farmerName, setFarmerName] = useState('');
  const [location, setLocation] = useState('');
  const [fieldSize, setFieldSize] = useState('1');
  const [waterSource, setWaterSource] = useState('Rainfed');
  const [season, setSeason] = useState('Kharif');
  const [preferredCrop, setPreferredCrop] = useState('');

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
  const [activeTab, setActiveTab] = useState<'crops' | 'health'>('crops');

  const loadingSteps = [
    'Initializing AgriSense AI Analyzer...',
    'Assessing Soil NPK Ratios & Compiling Chemistry Profiles...',
    'Comparing to 45+ Regional Karnataka Crop Baselines...',
    'Synthesizing Stage-by-Stage Agricultural Growth Plan...',
    'Formatting Premium Diagnostic Report...',
  ];

  const handleSoilChange = (key: keyof SoilData, value: number) => {
    setSoil((prev) => ({ ...prev, [key]: value }));
  };

  const runAnalysis = async () => {
    setLoading(true);
    setLoadingStep(0);
    setResults(null);

    // Simulate loading step transitions
    const stepInterval = setInterval(() => {
      setLoadingStep((prev) => {
        if (prev < loadingSteps.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 50);

    try {
      const payload = {
        farmer_name: farmerName || 'Farmer Partner',
        location: location || 'Karnataka Region',
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
        preferred_crop: preferredCrop || undefined,
        field_size_acres: parseFloat(fieldSize) || 1,
        water_source: waterSource,
        season: season,
      };

      const data = await apiPost<RecommendationResponse>('/api/ai/soil-recommendation', payload);
      setResults(data);
      if (data.recommended_crops && data.recommended_crops.length > 0) {
        setExpandedCrop(data.recommended_crops[0].crop_name);
      }
    } catch (error) {
      console.error('Soil recommendation error:', error);
      alert("AI Soil Diagnostic Model is currently unavailable. Please connect a valid endpoint.");
      setResults(null);
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
              Enter NPK ratios & soil chemistry to synthesize custom crop growing schedules using advanced neural soil physics mapping.
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
                {/* Circular glowing neural ring */}
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
                    Farm Settings
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>Farmer Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Ramesh Gowda"
                        value={farmerName}
                        onChange={(e) => setFarmerName(e.target.value)}
                        className="w-full input-dark"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>Location / Taluk</label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="e.g. Mandya, Karnataka"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          className="w-full input-dark pl-9"
                        />
                        <MapPin className="absolute left-3 top-3.5 h-4 w-4" style={{ color: 'var(--text-muted)' }} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>Field Size (Acres)</label>
                        <input
                          type="number"
                          step="0.1"
                          placeholder="1.0"
                          value={fieldSize}
                          onChange={(e) => setFieldSize(e.target.value)}
                          className="w-full input-dark"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>Season</label>
                        <select
                          value={season}
                          onChange={(e) => setSeason(e.target.value)}
                          className="w-full input-dark cursor-pointer"
                          style={{ backgroundColor: 'var(--bg-main)', border: '1px solid rgba(255,255,255,0.08)' }}
                        >
                          <option value="Kharif">Kharif</option>
                          <option value="Rabi">Rabi</option>
                          <option value="Summer">Summer</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>Water Irrigation Source</label>
                      <select
                        value={waterSource}
                        onChange={(e) => setWaterSource(e.target.value)}
                        className="w-full input-dark cursor-pointer"
                        style={{ backgroundColor: 'var(--bg-main)', border: '1px solid rgba(255,255,255,0.08)' }}
                      >
                        <option value="Rainfed">Rainfed (Monsoon Dependent)</option>
                        <option value="Canal">Canal System</option>
                        <option value="Well">Well / Tube Well</option>
                        <option value="Drip">Micro Drip / Sprinkler</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>Preferred Crop Target (Optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. Rice, Cotton, Ragi"
                        value={preferredCrop}
                        onChange={(e) => setPreferredCrop(e.target.value)}
                        className="w-full input-dark"
                      />
                    </div>
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
                    max="200"
                    value={soil.nitrogen}
                    onChange={(e) => handleSoilChange('nitrogen', parseInt(e.target.value))}
                    className="soil-slider cursor-pointer"
                    style={{ '--pct': `${(soil.nitrogen / 200) * 100}%` } as React.CSSProperties}
                  />
                  <div className="flex justify-between text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    <span>Deficient (0)</span>
                    <span>Ideal (60-90)</span>
                    <span>Excess (200)</span>
                  </div>
                </div>

                {/* Phosphorus */}
                <div className="space-y-2.5 p-4 rounded-xl border bg-earth-main/20 transition-all duration-200" style={{ borderColor: getSoilColor(soil.phosphorus, [20, 40]) }}>
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
                    max="100"
                    value={soil.phosphorus}
                    onChange={(e) => handleSoilChange('phosphorus', parseInt(e.target.value))}
                    className="soil-slider cursor-pointer"
                    style={{ '--pct': `${(soil.phosphorus / 100) * 100}%` } as React.CSSProperties}
                  />
                  <div className="flex justify-between text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    <span>Deficient (0)</span>
                    <span>Ideal (20-40)</span>
                    <span>Excess (100)</span>
                  </div>
                </div>

                {/* Potassium */}
                <div className="space-y-2.5 p-4 rounded-xl border bg-earth-main/20 transition-all duration-200" style={{ borderColor: getSoilColor(soil.potassium, [40, 70]) }}>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
                      <span className="w-2.5 h-2.5 rounded-full bg-pink-400" />
                      Potassium (K) - kg/ha
                    </span>
                    <span className="text-sm font-bold text-gradient-gold">{soil.potassium} kg/ha</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={soil.potassium}
                    onChange={(e) => handleSoilChange('potassium', parseInt(e.target.value))}
                    className="soil-slider cursor-pointer"
                    style={{ '--pct': `${(soil.potassium / 200) * 100}%` } as React.CSSProperties}
                  />
                  <div className="flex justify-between text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    <span>Deficient (0)</span>
                    <span>Ideal (40-70)</span>
                    <span>Excess (200)</span>
                  </div>
                </div>

                {/* pH */}
                <div className="space-y-2.5 p-4 rounded-xl border bg-earth-main/20 transition-all duration-200" style={{ borderColor: getSoilColor(soil.pH, [6.0, 7.5]) }}>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                      pH Balance (Acidity / Alkalinity)
                    </span>
                    <span className="text-sm font-bold text-gradient-gold">{soil.pH} pH</span>
                  </div>
                  <input
                    type="range"
                    min="4.0"
                    max="9.0"
                    step="0.1"
                    value={soil.pH}
                    onChange={(e) => handleSoilChange('pH', parseFloat(e.target.value))}
                    className="soil-slider cursor-pointer"
                    style={{ '--pct': `${((soil.pH - 4) / 5) * 100}%` } as React.CSSProperties}
                  />
                  <div className="flex justify-between text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    <span>Highly Acidic (4)</span>
                    <span>Neutral (7)</span>
                    <span>Highly Alkaline (9)</span>
                  </div>
                </div>

                {/* Soil Moisture */}
                <div className="space-y-2.5 p-4 rounded-xl border bg-earth-main/20 transition-all duration-200" style={{ borderColor: getSoilColor(soil.moisture, [40, 60]) }}>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
                      <Droplets className="h-3.5 w-3.5 text-blue-400" />
                      Soil Moisture Level (%)
                    </span>
                    <span className="text-sm font-bold text-gradient-gold">{soil.moisture}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={soil.moisture}
                    onChange={(e) => handleSoilChange('moisture', parseInt(e.target.value))}
                    className="soil-slider cursor-pointer"
                    style={{ '--pct': `${(soil.moisture / 100) * 100}%` } as React.CSSProperties}
                  />
                  <div className="flex justify-between text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    <span>Arid/Dry (0%)</span>
                    <span>Sufficient (40-60%)</span>
                    <span>Waterlogged (100%)</span>
                  </div>
                </div>

                {/* Temperature */}
                <div className="space-y-2.5 p-4 rounded-xl border bg-earth-main/20 transition-all duration-200" style={{ borderColor: getSoilColor(soil.temperature_C, [25, 32]) }}>
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

                {/* Humidity */}
                <div className="space-y-2.5 p-4 rounded-xl border bg-earth-main/20 transition-all duration-200 md:col-span-2" style={{ borderColor: getSoilColor(soil.humidity_percent, [70, 85]) }}>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
                      <Wind className="h-3.5 w-3.5 text-emerald-400" />
                      Atmospheric Relative Humidity (%)
                    </span>
                    <span className="text-sm font-bold text-gradient-gold">{soil.humidity_percent}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={soil.humidity_percent}
                    onChange={(e) => handleSoilChange('humidity_percent', parseInt(e.target.value))}
                    className="soil-slider cursor-pointer"
                    style={{ '--pct': `${((soil.humidity_percent - 10) / 90) * 100}%` } as React.CSSProperties}
                  />
                  <div className="flex justify-between text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    <span>Dry (10%)</span>
                    <span>Subtropical (70-85%)</span>
                    <span>Saturated (100%)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Interactive Analysis Output */}
        {results && !loading && (
          <div className="space-y-8">
            {/* Top diagnostic metadata grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="card-premium p-4 flex flex-col justify-center">
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Farmer & Farm Area</span>
                <span className="text-md font-bold mt-1" style={{ color: 'var(--text-primary)' }}>{farmerName || 'Farmer Partner'}</span>
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{fieldSize} Acres</span>
              </div>
              <div className="card-premium p-4 flex flex-col justify-center">
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Diagnostic Location</span>
                <span className="text-md font-bold mt-1 flex items-center gap-1" style={{ color: 'var(--text-primary)' }}>
                  <MapPin className="h-4 w-4" style={{ color: 'var(--accent)' }} />
                  {location || 'Karnataka Region'}
                </span>
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Season: {season}</span>
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
                <span className="text-md font-bold mt-1" style={{ color: 'var(--text-primary)' }}>{waterSource}</span>
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Chemistry Balance: Stable</span>
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
              <button
                onClick={() => setActiveTab('crops')}
                className={`pb-3 font-bold text-sm border-b-2 transition-all duration-200 ${
                  activeTab === 'crops' ? 'border-accent text-accent' : 'border-transparent'
                }`}
                style={{
                  color: activeTab === 'crops' ? 'var(--accent)' : 'var(--text-secondary)',
                  borderBottomColor: activeTab === 'crops' ? 'var(--accent)' : 'transparent',
                }}
              >
                Recommended Crop Guides
              </button>
              <button
                onClick={() => setActiveTab('health')}
                className={`pb-3 font-bold text-sm border-b-2 transition-all duration-200 ${
                  activeTab === 'health' ? 'border-accent text-accent' : 'border-transparent'
                }`}
                style={{
                  color: activeTab === 'health' ? 'var(--accent)' : 'var(--text-secondary)',
                  borderBottomColor: activeTab === 'health' ? 'var(--accent)' : 'transparent',
                }}
              >
                Soil Health & Amendment Report
              </button>
            </div>

            {/* Tabs content block */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {activeTab === 'crops' && (
                <>
                  {/* Left: Recommended Crops List */}
                  <div className="lg:col-span-1 space-y-4">
                    {results.recommended_crops.map((crop) => (
                      <div
                        key={crop.crop_name}
                        onClick={() => setExpandedCrop(crop.crop_name)}
                        className={`p-5 rounded-xl border transition-all duration-300 cursor-pointer ${
                          expandedCrop === crop.crop_name
                            ? 'bg-surface-alt border-accent'
                            : 'bg-surface border-subtle hover:border-medium'
                        }`}
                        style={{
                          backgroundColor: expandedCrop === crop.crop_name ? 'var(--bg-elevated)' : 'var(--bg-card)',
                          borderColor: expandedCrop === crop.crop_name ? 'var(--accent)' : 'var(--border-subtle)',
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
                    ))}

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
                      const crop = results.recommended_crops.find((c) => c.crop_name === expandedCrop);
                      if (!crop) return null;

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
                          <div className="space-y-5">
                            {/* Stage 1: Sowing */}
                            <div className="bg-surface-alt p-4 rounded-xl border border-subtle space-y-2" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}>
                              <h4 className="text-sm font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                                <span className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>1</span>
                                Sowing & Field Soil Preparation
                              </h4>
                              <p className="text-xs pl-8" style={{ color: 'var(--text-secondary)' }}>
                                {crop.growing_guide.sowing_details}
                              </p>
                            </div>

                            {/* Stage 2: Nutrient splits */}
                            <div className="bg-surface-alt p-4 rounded-xl border border-subtle space-y-2" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}>
                              <h4 className="text-sm font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                                <span className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>2</span>
                                AI Recommended Commercial Fertilizer Split Schedule
                              </h4>
                              <p className="text-xs pl-8 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                                {crop.growing_guide.fertilizer_npk_schedule_per_acre}
                              </p>
                            </div>

                            {/* Stage 3: Irrigation */}
                            <div className="bg-surface-alt p-4 rounded-xl border border-subtle space-y-2" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}>
                              <h4 className="text-sm font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                                <span className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>3</span>
                                Custom Water Irrigation Schedule
                              </h4>
                              <p className="text-xs pl-8" style={{ color: 'var(--text-secondary)' }}>
                                {crop.growing_guide.irrigation_plan}
                              </p>
                            </div>

                            {/* Stage 4: Pest & Harvest */}
                            <div className="bg-surface-alt p-4 rounded-xl border border-subtle space-y-2" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}>
                              <h4 className="text-sm font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                                <span className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>4</span>
                                Pathogen / Pest Control & Yield Management
                              </h4>
                              <p className="text-xs pl-8" style={{ color: 'var(--text-secondary)' }}>
                                {crop.growing_guide.pest_disease_management}
                              </p>
                            </div>

                            <div className="bg-surface-alt p-4 rounded-xl border border-subtle space-y-2" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}>
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
                </>
              )}

              {activeTab === 'health' && (
                <div className="col-span-3 card-premium p-6 space-y-6">
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
                    <div className="bg-surface p-5 rounded-xl border border-subtle space-y-4" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}>
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
                    <div className="bg-surface p-5 rounded-xl border border-subtle space-y-4" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}>
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

          <div className="grid grid-cols-2 gap-4 text-sm border-b border-black pb-4">
            <div>
              <p><strong>Farmer Name:</strong> {farmerName || 'Ramesh Gowda'}</p>
              <p><strong>Location/Taluk:</strong> {location || 'Mandya, Karnataka'}</p>
              <p><strong>Acreage Size:</strong> {fieldSize} Acres</p>
            </div>
            <div>
              <p><strong>Water Irrigation:</strong> {waterSource}</p>
              <p><strong>Season Term:</strong> {season}</p>
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

          <div className="space-y-4 pt-4">
            <h3 className="text-md font-bold uppercase underline">2. High Suitability Crops Selection</h3>
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

          <div className="space-y-2 pt-4 text-xs border-t border-black">
            <p><strong>Recommended Amendments:</strong> {results.soil_health_report.soil_amendment_recommendations}</p>
            <p><strong>Agronomic Warnings:</strong> {results.warnings.join(', ')}</p>
          </div>

          <div className="text-center pt-8 text-[10px] text-gray-500">
            Report dynamically generated by AgriSense AI™ Soil Diagnostic Engine. All schedules are calibrated for Karnataka agro-climatic conditions.
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
