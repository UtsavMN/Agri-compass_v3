import { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { useUser, useDistrict } from '@/store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ScrollReveal } from '@/components/ui/animations';
import { WeatherAPI } from '@/lib/api/weather';
import { WeatherData, WeatherAdvice } from '@/lib/ai/weatherAdvisor';
import {
  Cloud,
  CloudRain,
  Sun,
  Wind,
  Droplets,
  Eye,
  Gauge,
  MapPin,
  TrendingUp,
  Info,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Sparkles,
  Sprout,
  Compass,
  Calendar,
  Zap,
  Activity,
  Layers,
  Thermometer,
  Waves
} from 'lucide-react';

const SKY_GRADIENTS: Record<string, string> = {
  'clear sky': 'linear-gradient(180deg, #1b2838 0%, #111008 70%)',
  'overcast clouds': 'linear-gradient(180deg, #1e242b 0%, #111008 70%)',
  'light rain': 'linear-gradient(180deg, #142230 0%, #111008 70%)',
  'thunderstorm': 'linear-gradient(180deg, #241a2e 0%, #111008 70%)',
  'few clouds': 'linear-gradient(180deg, #1e281e 0%, #111008 70%)',
};

const getSkyGradient = (condition: string = '') => {
  const c = condition.toLowerCase();
  if (c.includes('thunder') || c.includes('storm')) return SKY_GRADIENTS['thunderstorm'];
  if (c.includes('rain') || c.includes('drizzle') || c.includes('shower')) return SKY_GRADIENTS['light rain'];
  if (c.includes('cloud') || c.includes('overcast') || c.includes('mist') || c.includes('fog')) {
    return SKY_GRADIENTS['overcast clouds'];
  }
  if (c.includes('few clouds') || c.includes('scattered')) return SKY_GRADIENTS['few clouds'];
  return SKY_GRADIENTS['clear sky'];
};

const getDayGradient = (desc: string = '') => {
  const d = desc.toLowerCase();
  if (d.includes('thunder') || d.includes('storm')) {
    return 'linear-gradient(90deg, #a855f7, #ec4899)';
  }
  if (d.includes('rain') || d.includes('drizzle') || d.includes('shower')) {
    return 'linear-gradient(90deg, #3b82f6, #60a5fa)';
  }
  if (d.includes('cloud') || d.includes('overcast') || d.includes('mist') || d.includes('fog')) {
    return 'linear-gradient(90deg, #6b7280, #9ca3af)';
  }
  return 'linear-gradient(90deg, #eab308, #fbbf24)';
};

function WeatherIcon({ condition, size = 24, className }: { condition: string; size?: number; className?: string }) {
  const c = condition.toLowerCase();
  if (c.includes('thunder') || c.includes('storm') || c.includes('lightning')) {
    return <Zap size={size} className={`text-amber-400 animate-pulse ${className || ''}`} />;
  }
  if (c.includes('rain') || c.includes('drizzle') || c.includes('shower')) {
    return <CloudRain size={size} className={`text-sky-400 ${className || ''}`} />;
  }
  if (c.includes('cloud') || c.includes('overcast') || c.includes('mist') || c.includes('fog')) {
    return <Cloud size={size} className={`text-gold-100/70 ${className || ''}`} />;
  }
  return <Sun size={size} className={`text-amber-400 animate-spin-slow ${className || ''}`} />;
}

export default function Weather() {
  const { profile } = useUser();
  const { toast } = useToast();
  const { selectedDistrict: globalDistrict } = useDistrict();
  const [localDistrict, setLocalDistrict] = useState<string>('');
  const [districts, setDistricts] = useState<string[]>([]);
  const [districtDetails, setDistrictDetails] = useState<Record<string, any>>({});
  const [weatherInfo, setWeatherInfo] = useState<{ weather: WeatherData; advisory: WeatherAdvice; timestamp?: string } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDistricts();
  }, []);

  useEffect(() => {
    if (!localDistrict) {
      if (globalDistrict) {
        setLocalDistrict(globalDistrict);
      } else if (profile?.location) {
        setLocalDistrict(profile.location);
      } else if (districts.length > 0) {
        setLocalDistrict('Bengaluru Urban');
      }
    }
  }, [profile?.location, globalDistrict, localDistrict, districts]);

  useEffect(() => {
    if (localDistrict) {
      loadWeatherData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localDistrict]);

  const loadDistricts = async () => {
    try {
      const response = await fetch('/districts.csv');
      const text = await response.text();
      Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const map: Record<string, any> = {};
          const districtList = results.data
            .map((row: any) => {
              const name = row.district?.trim();
              if (name) {
                map[name] = row;
                return name;
              }
              return null;
            })
            .filter(Boolean)
            .sort();
          setDistricts(districtList as string[]);
          setDistrictDetails(map);
        }
      });
    } catch (error) {
      console.error('Error loading districts:', error);
    }
  };

  const loadWeatherData = async () => {
    if (!localDistrict) return;
    setLoading(true);
    try {
      const result = await WeatherAPI.getWeatherForDistrict(localDistrict);
      if (result) {
        setWeatherInfo({
          weather: result.weather,
          advisory: result.advisory,
          timestamp: result.timestamp
        });
      } else {
        toast({
          title: 'Meteorology Offline',
          description: 'Could not fetch weather data from satellite or network stations.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error loading weather:', error);
      toast({
        title: 'Error loading weather',
        description: 'Failed to load weather data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const formatForecastDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const getSpraySuitabilityPill = (suitability?: string) => {
    if (suitability === 'Favorable') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
          <CheckCircle2 className="w-2.5 h-2.5" /> Spray: Safe
        </span>
      );
    }
    if (suitability === 'Caution') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
          <AlertTriangle className="w-2.5 h-2.5" /> Spray: Caution
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
        <AlertCircle className="w-2.5 h-2.5" /> Spray: Avoid
      </span>
    );
  };

  const getStatusBadge = (status: string, label: string) => {
    if (status === 'critical') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/15 text-rose-300 border border-rose-500/40">
          <AlertCircle className="w-3 h-3 text-rose-400" /> {label}
        </span>
      );
    }
    if (status === 'caution') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/40">
          <AlertTriangle className="w-3 h-3 text-amber-400" /> {label}
        </span>
      );
    }
    if (status === 'favorable') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/40">
          <CheckCircle2 className="w-3 h-3 text-emerald-400" /> {label}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-sky-500/15 text-sky-300 border border-sky-500/40">
        <Activity className="w-3 h-3 text-sky-400" /> {label}
      </span>
    );
  };

  const currentDistrictMeta = districtDetails[localDistrict];

  return (
    <div className="pt-24 px-4 sm:px-6 lg:px-8 pb-16 max-w-7xl mx-auto animate-fade-in text-gold-100">
      <div className="space-y-8">
        {/* Header Bar */}
        <ScrollReveal>
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 pb-6 border-b border-earth-border/40">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-400/10 border border-gold-400/30 text-gold-400 text-xs font-bold uppercase tracking-wider mb-2">
                <Sparkles className="h-3 w-3" /> Agricultural Weather Intelligence
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-gold-100 tracking-tight leading-tight">
                Weather & Agronomic Advisory
              </h1>
              <p className="text-gold-100/60 text-sm mt-1 max-w-2xl leading-relaxed">
                7-day precision microclimate forecasting, FAO-56 Penman-Monteith evapotranspiration, and operational farming directives.
              </p>
            </div>

            {/* Location Selector & Sync Indicator */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
              <div className="relative w-full sm:w-64">
                <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gold-400 z-10 pointer-events-none" />
                <Select value={localDistrict} onValueChange={setLocalDistrict}>
                  <SelectTrigger className="pl-11 bg-earth-elevated/80 border-earth-border !text-white font-medium focus:border-gold-400 h-12 rounded-xl text-sm shadow-sm relative z-0">
                    <SelectValue placeholder="Select Karnataka District..." />
                  </SelectTrigger>
                  <SelectContent className="bg-earth-elevated !text-white border-earth-border max-h-80">
                    {districts.map((district) => (
                      <SelectItem key={district} value={district} className="hover:bg-earth-border/40 focus:bg-earth-border/40 cursor-pointer">
                        {district}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-earth-elevated/40 border border-earth-border/50 text-xs text-gold-100/70">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="font-semibold">Live Station Sync</span>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {loading ? (
          /* Skeletons */
          <div className="space-y-8">
            <Card className="card-premium h-72 animate-pulse relative overflow-hidden bg-earth-elevated/20 border-earth-border/40">
              <div className="absolute inset-0 bg-gradient-to-r from-earth-elevated/5 via-earth-elevated/30 to-earth-elevated/5 animate-shimmer" />
              <CardContent className="h-full flex items-center justify-between p-8">
                <div className="space-y-4">
                  <div className="h-4 w-48 bg-earth-border/60 rounded" />
                  <div className="h-16 w-56 bg-earth-border/60 rounded" />
                  <div className="h-4 w-32 bg-earth-border/60 rounded" />
                </div>
                <div className="h-24 w-24 rounded-full bg-earth-border/60" />
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {[...Array(7)].map((_, i) => (
                <Card key={i} className="card-premium h-44 animate-pulse bg-earth-elevated/20 border-earth-border/40">
                  <CardContent className="h-full flex flex-col justify-center items-center gap-3 p-4">
                    <div className="h-3 w-16 bg-earth-border/60 rounded" />
                    <div className="h-8 w-8 rounded-full bg-earth-border/60" />
                    <div className="h-4 w-12 bg-earth-border/60 rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : weatherInfo ? (
          <div className="space-y-8">
            {/* Current Agro-Meteorology Card */}
            <ScrollReveal delay={0.1}>
              <div
                className="rounded-3xl p-6 sm:p-8 relative overflow-hidden border border-earth-border/60 shadow-2xl backdrop-blur-md"
                style={{ background: getSkyGradient(weatherInfo.weather.description) }}
              >
                {/* Large Background Icon */}
                <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-10 pointer-events-none">
                  <WeatherIcon condition={weatherInfo.weather.description} size={180} />
                </div>

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[11px] font-bold text-gold-400 uppercase tracking-widest bg-gold-400/10 px-2.5 py-0.5 rounded-full border border-gold-400/30">
                        {localDistrict}, Karnataka
                      </span>
                      {weatherInfo.timestamp && (
                        <span className="text-[11px] text-gold-100/40">
                          Updated {new Date(weatherInfo.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>

                    <div className="flex items-baseline gap-4">
                      <span className="text-6xl sm:text-7xl font-black text-gold-100 tracking-tighter leading-none">
                        {weatherInfo.weather.temperature}°C
                      </span>
                      {weatherInfo.weather.feelsLike !== undefined && (
                        <span className="text-sm font-semibold text-gold-100/60 bg-earth-main/50 px-3 py-1.5 rounded-xl border border-earth-border/40">
                          Feels like <strong className="text-gold-200">{weatherInfo.weather.feelsLike}°C</strong>
                        </span>
                      )}
                    </div>

                    <p className="text-gold-300 text-lg sm:text-xl font-bold capitalize mt-2 flex items-center gap-2">
                      <WeatherIcon condition={weatherInfo.weather.description} size={22} />
                      {weatherInfo.weather.description}
                    </p>
                  </div>

                  {/* Summary Metric Pill */}
                  <div className="bg-earth-main/60 border border-gold-400/20 backdrop-blur-md p-4 rounded-2xl flex flex-col gap-2 min-w-[220px]">
                    <div className="flex items-center justify-between text-xs text-gold-100/60">
                      <span>Today's ET₀ Evaporation</span>
                      <strong className="text-gold-300">{weatherInfo.weather.et0 ?? 3.5} mm/day</strong>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gold-100/60">
                      <span>Rain Probability</span>
                      <strong className="text-sky-300">{weatherInfo.weather.precipitationProbability ?? 0}%</strong>
                    </div>
                    <div className="pt-2 border-t border-earth-border/40 flex items-center justify-between">
                      <span className="text-[11px] uppercase tracking-wider text-gold-100/50 font-semibold">Today's Spraying</span>
                      {getSpraySuitabilityPill(weatherInfo.weather.forecast?.[0]?.spraying_suitability || 'Caution')}
                    </div>
                  </div>
                </div>

                {/* 8-Metric Precision Agricultural Parameters Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mt-8 pt-6 border-t border-earth-border/30 relative z-10">
                  {/* 1. Humidity */}
                  <div className="p-3 bg-earth-main/60 rounded-2xl border border-earth-border/40 backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-gold-100/50 font-bold uppercase tracking-wider">Humidity</span>
                      <Droplets className="h-4 w-4 text-blue-400" />
                    </div>
                    <div className="text-base font-black text-gold-100">{weatherInfo.weather.humidity}%</div>
                    <div className="text-[10px] text-gold-100/40">
                      {weatherInfo.weather.humidity > 80 ? 'High / Saturated' : weatherInfo.weather.humidity < 40 ? 'Dry' : 'Optimal'}
                    </div>
                  </div>

                  {/* 2. Wind Speed & Dir */}
                  <div className="p-3 bg-earth-main/60 rounded-2xl border border-earth-border/40 backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-gold-100/50 font-bold uppercase tracking-wider">Wind</span>
                      <Wind className="h-4 w-4 text-amber-400" />
                    </div>
                    <div className="text-base font-black text-gold-100">{weatherInfo.weather.windSpeed} km/h</div>
                    <div className="text-[10px] text-gold-100/40 flex items-center gap-1">
                      <Compass className="h-3 w-3" /> {weatherInfo.weather.windDirection || 'N'}
                    </div>
                  </div>

                  {/* 3. Precipitation */}
                  <div className="p-3 bg-earth-main/60 rounded-2xl border border-earth-border/40 backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-gold-100/50 font-bold uppercase tracking-wider">Precip</span>
                      <CloudRain className="h-4 w-4 text-cyan-400" />
                    </div>
                    <div className="text-base font-black text-gold-100">{weatherInfo.weather.precipitation ?? 0} mm</div>
                    <div className="text-[10px] text-cyan-400/80 font-semibold">{weatherInfo.weather.precipitationProbability ?? 0}% chance</div>
                  </div>

                  {/* 4. FAO-56 ET0 */}
                  <div className="p-3 bg-earth-main/60 rounded-2xl border border-earth-border/40 backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-gold-100/50 font-bold uppercase tracking-wider">FAO-56 ET₀</span>
                      <Waves className="h-4 w-4 text-emerald-400" />
                    </div>
                    <div className="text-base font-black text-gold-100">{weatherInfo.weather.et0 ?? 3.5} mm</div>
                    <div className="text-[10px] text-gold-100/40">Water Demand</div>
                  </div>

                  {/* 5. Surface Pressure */}
                  <div className="p-3 bg-earth-main/60 rounded-2xl border border-earth-border/40 backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-gold-100/50 font-bold uppercase tracking-wider">Pressure</span>
                      <Gauge className="h-4 w-4 text-sky-400" />
                    </div>
                    <div className="text-base font-black text-gold-100">{weatherInfo.weather.pressure ?? 1013} mb</div>
                    <div className="text-[10px] text-gold-100/40">Barometric</div>
                  </div>

                  {/* 6. UV Index */}
                  <div className="p-3 bg-earth-main/60 rounded-2xl border border-earth-border/40 backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-gold-100/50 font-bold uppercase tracking-wider">UV Index</span>
                      <Sun className="h-4 w-4 text-orange-400" />
                    </div>
                    <div className="text-base font-black text-gold-100">{weatherInfo.weather.uv ?? 5}</div>
                    <div className="text-[10px] text-gold-100/40">
                      {(weatherInfo.weather.uv ?? 5) > 8 ? 'Very High' : (weatherInfo.weather.uv ?? 5) > 5 ? 'Moderate' : 'Low'}
                    </div>
                  </div>

                  {/* 7. Visibility */}
                  <div className="p-3 bg-earth-main/60 rounded-2xl border border-earth-border/40 backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-gold-100/50 font-bold uppercase tracking-wider">Visibility</span>
                      <Eye className="h-4 w-4 text-teal-400" />
                    </div>
                    <div className="text-base font-black text-gold-100">{weatherInfo.weather.visibility ?? 10} km</div>
                    <div className="text-[10px] text-gold-100/40">Clear Horizon</div>
                  </div>

                  {/* 8. Dew Point / Thermal */}
                  <div className="p-3 bg-earth-main/60 rounded-2xl border border-earth-border/40 backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-gold-100/50 font-bold uppercase tracking-wider">Apparent</span>
                      <Thermometer className="h-4 w-4 text-rose-400" />
                    </div>
                    <div className="text-base font-black text-gold-100">{weatherInfo.weather.feelsLike ?? weatherInfo.weather.temperature}°C</div>
                    <div className="text-[10px] text-gold-100/40">Thermal Index</div>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* 3-Day Precision Agricultural Forecast Grid */}
            {weatherInfo.weather.forecast && weatherInfo.weather.forecast.length > 0 && (
              <ScrollReveal delay={0.2}>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-gold-400" />
                    <h2 className="text-base font-black text-gold-100 tracking-wide uppercase">
                      3-Day Precision Agricultural Forecast
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {weatherInfo.weather.forecast.slice(0, 3).map((day, idx) => {
                      const dayTitle = idx === 0 ? 'Today' : idx === 1 ? 'Tomorrow' : new Date(day.date).toLocaleDateString('en-US', { weekday: 'long' });
                      return (
                        <div
                          key={idx}
                          className="bg-earth-elevated/40 border border-earth-border/60 hover:border-gold-400/40 rounded-2xl p-5 text-center relative overflow-hidden flex flex-col justify-between transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group backdrop-blur-sm"
                        >
                          {/* Day indicator line */}
                          <div
                            className="absolute top-0 left-0 right-0 h-[3px]"
                            style={{ background: getDayGradient(day.description) }}
                          />

                          {/* Top: Day Name & Date */}
                          <div className="pt-1">
                            <div className="text-base font-black text-gold-100 flex items-center justify-center gap-1">
                              {dayTitle}
                            </div>
                            <div className="text-xs text-gold-100/50 mt-0.5">
                              {formatForecastDate(day.date)}
                            </div>
                          </div>

                          {/* Center: Weather Icon & Condition */}
                          <div className="my-4 flex flex-col items-center">
                            <div className="p-3.5 rounded-2xl bg-earth-main/50 border border-earth-border/30 group-hover:scale-110 transition-transform">
                              <WeatherIcon condition={day.description} size={42} />
                            </div>
                            <span className="text-xs font-bold text-gold-200 mt-2.5 line-clamp-1 capitalize">
                              {day.description}
                            </span>
                          </div>

                          {/* Temp Range */}
                          <div className="bg-earth-main/50 rounded-xl p-2.5 border border-earth-border/30 mb-3.5">
                            <div className="flex items-center justify-center gap-2">
                              <span className="text-xl font-black text-gold-100">{day.temp_max}°</span>
                              <span className="text-sm text-gold-100/40 font-semibold">/ {day.temp_min}°C</span>
                            </div>
                          </div>

                          {/* Agricultural Metrics Micro-Grid */}
                          <div className="space-y-2 text-xs text-gold-100/70 text-left pt-2.5 border-t border-earth-border/40">
                            {/* Rain chance & mm */}
                            <div className="flex items-center justify-between">
                              <span className="text-gold-100/50 flex items-center gap-1.5">
                                <CloudRain className="w-3.5 h-3.5 text-sky-400" /> Rain
                              </span>
                              <span className="font-bold text-sky-300">
                                {day.precipitation_probability ?? 0}% ({day.precipitation}mm)
                              </span>
                            </div>

                            {/* ET0 */}
                            {day.et0 !== undefined && (
                              <div className="flex items-center justify-between">
                                <span className="text-gold-100/50 flex items-center gap-1.5">
                                  <Waves className="w-3.5 h-3.5 text-emerald-400" /> ET₀ Evap
                                </span>
                                <span className="font-bold text-emerald-300">
                                  {day.et0} mm/d
                                </span>
                              </div>
                            )}

                            {/* Max Wind */}
                            <div className="flex items-center justify-between">
                              <span className="text-gold-100/50 flex items-center gap-1.5">
                                <Wind className="w-3.5 h-3.5 text-amber-400" /> Wind
                              </span>
                              <span className="font-bold text-gold-200">
                                {day.wind_speed_max ?? 10} km/h
                              </span>
                            </div>
                          </div>

                          {/* Spraying Suitability Pill */}
                          <div className="mt-3.5 pt-2.5 border-t border-earth-border/30 flex justify-center">
                            {getSpraySuitabilityPill(day.spraying_suitability)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </ScrollReveal>
            )}

            {/* Localized Agronomic Advisory Center */}
            {weatherInfo.advisory && (
              <ScrollReveal delay={0.3}>
                <div className="space-y-6">
                  {/* Executive Header Box */}
                  <Card className="card-premium border-gold-400/30 bg-gradient-to-br from-earth-elevated/70 via-earth-main/60 to-earth-elevated/70 backdrop-blur-md">
                    <CardHeader className="pb-3 border-b border-earth-border/40">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                          <CardTitle className="text-base text-gold-400 font-black uppercase tracking-wider flex items-center gap-2">
                            <Info className="h-5 w-5 text-gold-400" />
                            Localized Agronomic Advisory Suite
                          </CardTitle>
                          <CardDescription className="text-gold-100/60 text-xs mt-1">
                            Compiled against ICAR & IMD Agromet Advisory Service standards for {localDistrict}
                          </CardDescription>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs px-3 py-1 rounded-full bg-gold-400/10 text-gold-300 border border-gold-400/30 font-semibold">
                            Zone: {currentDistrictMeta?.weather_pattern || 'Semi-arid / Deccan'}
                          </span>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="pt-5 space-y-6">
                      {/* Summary Statement Banner */}
                      <div className="bg-earth-main/80 border border-gold-400/25 p-5 rounded-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 bottom-0 w-1 bg-gradient-to-b from-gold-400 via-amber-300 to-gold-500" />
                        <div className="pl-2">
                          <p className="text-xs font-bold uppercase tracking-wider text-gold-400 mb-1 flex items-center gap-1.5">
                            <Activity className="w-3.5 h-3.5" /> 48-Hour Agromet Outlook
                          </p>
                          <p className="text-sm text-gold-100/90 leading-relaxed font-medium">
                            "{weatherInfo.advisory.summary}"
                          </p>
                        </div>
                      </div>

                      {/* Severe Alerts (If Any) */}
                      {weatherInfo.advisory.riskAlerts && weatherInfo.advisory.riskAlerts.length > 0 && (
                        <div className="space-y-2">
                          {weatherInfo.advisory.riskAlerts.map((alert, i) => (
                            <div key={i} className="flex items-start gap-3 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs font-medium">
                              <ShieldAlert className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                              <span>{alert}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* 5 Domain Action Cards */}
                      {weatherInfo.advisory.domains && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                          {/* Domain 1: Spraying Window */}
                          <div className="bg-earth-main/50 border border-earth-border/50 rounded-2xl p-5 flex flex-col justify-between hover:border-gold-400/30 transition-all">
                            <div>
                              <div className="flex items-center justify-between mb-3">
                                <span className="text-xs font-bold uppercase text-gold-300 flex items-center gap-1.5">
                                  <Sprout className="w-4 h-4 text-emerald-400" /> Spraying Feasibility
                                </span>
                                {getStatusBadge(
                                  weatherInfo.advisory.domains.spraying.status,
                                  weatherInfo.advisory.domains.spraying.statusLabel
                                )}
                              </div>
                              <p className="text-xs text-gold-100/70 leading-relaxed mb-4">
                                {weatherInfo.advisory.domains.spraying.description}
                              </p>
                            </div>
                            <div className="space-y-2 pt-3 border-t border-earth-border/40">
                              {weatherInfo.advisory.domains.spraying.actionItems.map((item, idx) => (
                                <div key={idx} className="flex items-start gap-2 text-xs text-gold-100/80">
                                  <div className="w-1.5 h-1.5 rounded-full bg-gold-400 mt-1.5 flex-shrink-0" />
                                  <span>{item}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Domain 2: Precision Irrigation & ET0 */}
                          <div className="bg-earth-main/50 border border-earth-border/50 rounded-2xl p-5 flex flex-col justify-between hover:border-gold-400/30 transition-all">
                            <div>
                              <div className="flex items-center justify-between mb-3">
                                <span className="text-xs font-bold uppercase text-gold-300 flex items-center gap-1.5">
                                  <Waves className="w-4 h-4 text-cyan-400" /> Water Budget (ET₀)
                                </span>
                                {getStatusBadge(
                                  weatherInfo.advisory.domains.irrigation.status,
                                  weatherInfo.advisory.domains.irrigation.statusLabel
                                )}
                              </div>
                              <p className="text-xs text-gold-100/70 leading-relaxed mb-4">
                                {weatherInfo.advisory.domains.irrigation.description}
                              </p>
                            </div>
                            <div className="space-y-2 pt-3 border-t border-earth-border/40">
                              {weatherInfo.advisory.domains.irrigation.actionItems.map((item, idx) => (
                                <div key={idx} className="flex items-start gap-2 text-xs text-gold-100/80">
                                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 flex-shrink-0" />
                                  <span>{item}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Domain 3: Soil & Fertilizer Timing */}
                          <div className="bg-earth-main/50 border border-earth-border/50 rounded-2xl p-5 flex flex-col justify-between hover:border-gold-400/30 transition-all">
                            <div>
                              <div className="flex items-center justify-between mb-3">
                                <span className="text-xs font-bold uppercase text-gold-300 flex items-center gap-1.5">
                                  <Layers className="w-4 h-4 text-amber-400" /> Fertilizer Timing
                                </span>
                                {getStatusBadge(
                                  weatherInfo.advisory.domains.fertilizer.status,
                                  weatherInfo.advisory.domains.fertilizer.statusLabel
                                )}
                              </div>
                              <p className="text-xs text-gold-100/70 leading-relaxed mb-4">
                                {weatherInfo.advisory.domains.fertilizer.description}
                              </p>
                            </div>
                            <div className="space-y-2 pt-3 border-t border-earth-border/40">
                              {weatherInfo.advisory.domains.fertilizer.actionItems.map((item, idx) => (
                                <div key={idx} className="flex items-start gap-2 text-xs text-gold-100/80">
                                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                                  <span>{item}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Domain 4: Crop Pathogen & Pest Alert */}
                          <div className="bg-earth-main/50 border border-earth-border/50 rounded-2xl p-5 flex flex-col justify-between hover:border-gold-400/30 transition-all">
                            <div>
                              <div className="flex items-center justify-between mb-3">
                                <span className="text-xs font-bold uppercase text-gold-300 flex items-center gap-1.5">
                                  <ShieldAlert className="w-4 h-4 text-rose-400" /> Pathogen Risk
                                </span>
                                {getStatusBadge(
                                  weatherInfo.advisory.domains.diseaseRisk.status,
                                  weatherInfo.advisory.domains.diseaseRisk.statusLabel
                                )}
                              </div>
                              <p className="text-xs text-gold-100/70 leading-relaxed mb-4">
                                {weatherInfo.advisory.domains.diseaseRisk.description}
                              </p>
                            </div>
                            <div className="space-y-2 pt-3 border-t border-earth-border/40">
                              {weatherInfo.advisory.domains.diseaseRisk.actionItems.map((item, idx) => (
                                <div key={idx} className="flex items-start gap-2 text-xs text-gold-100/80">
                                  <div className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 flex-shrink-0" />
                                  <span>{item}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Domain 5: Harvest & Trafficability */}
                          <div className="bg-earth-main/50 border border-earth-border/50 rounded-2xl p-5 flex flex-col justify-between hover:border-gold-400/30 transition-all md:col-span-2 lg:col-span-2">
                            <div>
                              <div className="flex items-center justify-between mb-3">
                                <span className="text-xs font-bold uppercase text-gold-300 flex items-center gap-1.5">
                                  <Calendar className="w-4 h-4 text-purple-400" /> Harvest & Field Operations
                                </span>
                                {getStatusBadge(
                                  weatherInfo.advisory.domains.harvestField.status,
                                  weatherInfo.advisory.domains.harvestField.statusLabel
                                )}
                              </div>
                              <p className="text-xs text-gold-100/70 leading-relaxed mb-4">
                                {weatherInfo.advisory.domains.harvestField.description}
                              </p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-3 border-t border-earth-border/40">
                              {weatherInfo.advisory.domains.harvestField.actionItems.map((item, idx) => (
                                <div key={idx} className="flex items-start gap-2 text-xs text-gold-100/80">
                                  <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 flex-shrink-0" />
                                  <span>{item}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Actionable Field Checklist */}
                      <div className="space-y-3 pt-4 border-t border-earth-border/40">
                        <span className="text-xs font-black text-gold-400 uppercase tracking-widest flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-gold-400" /> Agronomic Field Directives (Today)
                        </span>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                          {weatherInfo.advisory.farmingTips?.map((tip, i) => (
                            <div key={i} className="flex gap-3 items-start p-3 bg-earth-elevated/40 border border-earth-border/50 rounded-xl">
                              <div className="w-2 h-2 rounded-full bg-gold-400 mt-1.5 flex-shrink-0" />
                              <p className="text-xs text-gold-100/90 leading-relaxed font-medium">{tip}</p>
                            </div>
                          )) || (
                            <p className="text-xs text-gold-100/40">No specific advisory tips for current conditions.</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* District Microclimate & Soil Profile Card */}
                  {currentDistrictMeta && (
                    <div className="bg-earth-elevated/30 border border-earth-border/40 rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs">
                      <div>
                        <span className="text-gold-400 font-bold uppercase tracking-wider text-[11px] block">
                          District Agronomic Profile · {localDistrict}
                        </span>
                        <p className="text-gold-100/80 mt-1">
                          <strong>Recommended Crops:</strong> {currentDistrictMeta.recommended_crops}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-4 text-gold-100/60">
                        <div>
                          <span className="text-gold-100/40 block text-[10px] uppercase">Soil Type</span>
                          <span className="font-semibold text-gold-200">{currentDistrictMeta.soil_type}</span>
                        </div>
                        <div>
                          <span className="text-gold-100/40 block text-[10px] uppercase">Normal Rainfall</span>
                          <span className="font-semibold text-gold-200">{currentDistrictMeta.avg_rainfall}</span>
                        </div>
                        <div>
                          <span className="text-gold-100/40 block text-[10px] uppercase">Climate Zone</span>
                          <span className="font-semibold text-gold-200">{currentDistrictMeta.weather_pattern}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollReveal>
            )}
          </div>
        ) : (
          <div className="text-center py-24 bg-earth-elevated/10 rounded-3xl border border-earth-border/40">
            <Cloud className="h-16 w-16 text-gold-400/20 mx-auto mb-4" />
            <h3 className="text-lg font-black text-gold-100">No Weather Data Available</h3>
            <p className="text-gold-100/40 text-xs uppercase tracking-widest mt-1">
              Select a district to initialize precision weather sync
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
