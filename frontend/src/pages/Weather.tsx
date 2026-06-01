import { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { useUser, MOCK_USERS } from '@/store';
import { useDistrict } from '@/store';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ScrollReveal, FadeIn, StaggerContainer, StaggerItem } from '@/components/ui/animations';
import { WeatherAPI } from '@/lib/api/weather';
import { WeatherData, WeatherAdvice } from '@/lib/ai/weatherAdvisor';
import { Cloud, CloudRain, Sun, Wind, Droplets, Eye, Gauge, MapPin, TrendingUp, Thermometer, Info, HelpCircle } from 'lucide-react';

const SKY_GRADIENTS: Record<string, string> = {
  'clear sky':      'linear-gradient(180deg, #1a2a3a 0%, #0f0f0b 60%)',
  'overcast clouds':'linear-gradient(180deg, #1a1e24 0%, #0f0f0b 60%)',
  'light rain':     'linear-gradient(180deg, #141e28 0%, #0f0f0b 60%)',
  'few clouds':     'linear-gradient(180deg, #1e2a1a 0%, #0f0f0b 60%)',
};

const getSkyGradient = (condition: string = '') => {
  const c = condition.toLowerCase();
  if (c.includes('clear')) return SKY_GRADIENTS['clear sky'];
  if (c.includes('rain') || c.includes('drizzle') || c.includes('shower')) return SKY_GRADIENTS['light rain'];
  if (c.includes('few clouds') || c.includes('scattered')) return SKY_GRADIENTS['few clouds'];
  if (c.includes('cloud') || c.includes('overcast') || c.includes('mist') || c.includes('fog')) {
    return SKY_GRADIENTS['overcast clouds'];
  }
  return SKY_GRADIENTS['clear sky'];
};

const getDayGradient = (desc: string = '') => {
  const d = desc.toLowerCase();
  if (d.includes('rain') || d.includes('drizzle') || d.includes('shower')) {
    return 'linear-gradient(90deg, #3b82f6, #60a5fa)';
  }
  if (d.includes('cloud') || d.includes('overcast') || d.includes('mist') || d.includes('fog')) {
    return 'linear-gradient(90deg, #6b7280, #9ca3af)';
  }
  return 'linear-gradient(90deg, #f59e0b, #fbbf24)';
};

function WeatherIcon({ condition, size = 24, className, ...props }: { condition: string; size?: number; className?: string }) {
  const c = condition.toLowerCase();
  if (c.includes('rain') || c.includes('drizzle') || c.includes('shower')) {
    return <CloudRain size={size} className={className} {...props} />;
  }
  if (c.includes('cloud') || c.includes('overcast') || c.includes('mist') || c.includes('fog')) {
    return <Cloud size={size} className={className} {...props} />;
  }
  return <Sun size={size} className={className} {...props} />;
}

export default function Weather() {
  const { profile } = useUser();
  const { toast } = useToast();
  const { selectedDistrict, setSelectedDistrict } = useDistrict();
  const [districts, setDistricts] = useState<string[]>([]);
  const [weatherInfo, setWeatherInfo] = useState<{ weather: WeatherData; advisory: WeatherAdvice } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDistricts();
  }, []);

  useEffect(() => {
    if (!selectedDistrict) {
      if (profile?.location) {
        setSelectedDistrict(profile.location);
      } else if (districts.length > 0) {
        setSelectedDistrict('Bengaluru Urban');
      }
    }
  }, [profile?.location, selectedDistrict, setSelectedDistrict, districts]);

  useEffect(() => {
    if (selectedDistrict) {
      loadWeatherData();
    }
  }, [selectedDistrict]);

  const loadDistricts = async () => {
    try {
      const response = await fetch('/districts.csv');
      const text = await response.text();
      Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const districtList = results.data
            .map((row: any) => row.district?.trim())
            .filter(Boolean)
            .sort();
          setDistricts(districtList);
        }
      });
    } catch (error) {
      console.error('Error loading districts:', error);
    }
  };

  const loadWeatherData = async () => {
    if (!selectedDistrict) return;
    setLoading(true);
    try {
      const result = await WeatherAPI.getWeatherForDistrict(selectedDistrict);
      if (result) {
        setWeatherInfo({
          weather: result.weather,
          advisory: result.advisory
        });
      } else {
        toast({
          title: 'Weather Offline',
          description: 'Could not fetch weather data from local registry or network.',
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

  const getWeatherIcon = (desc: string = '') => {
    const d = desc.toLowerCase();
    if (d.includes('rain') || d.includes('drizzle') || d.includes('shower')) {
      return <CloudRain className="h-20 w-20 text-sky-400 animate-pulse-soft" />;
    }
    if (d.includes('cloud') || d.includes('overcast') || d.includes('mist') || d.includes('fog')) {
      return <Cloud className="h-20 w-20 text-gold-100/40 animate-pulse-soft" />;
    }
    return <Sun className="h-20 w-20 text-gold-400 animate-spin-slow" />;
  };

  const formatForecastDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <Layout>
      <div className="space-y-8 pb-12">
        {/* Header */}
        <ScrollReveal>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-earth-border/40">
            <div>
              <h1 className="text-4xl font-black text-gold-100 tracking-tight leading-none mb-2">
                Weather & Farming Advisory
              </h1>
              <p className="text-gold-100/50 text-sm">
                Real-time meteorology and localized agronomic advisories for precision scheduling.
              </p>
            </div>
            
            {/* Location Selector */}
            <div className="relative w-full md:w-64">
              <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gold-400" />
              <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
                <SelectTrigger className="pl-12 bg-earth-elevated/40 border-earth-border text-gold-100 focus:border-gold-400 h-12 rounded-xl text-xs">
                  <SelectValue placeholder="Select your district..." />
                </SelectTrigger>
                <SelectContent className="bg-earth-card border-earth-border text-gold-100">
                  {districts.map((district) => (
                    <SelectItem key={district} value={district}>
                      {district}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </ScrollReveal>

        {loading ? (
          /* Premium Loading Skeletons */
          <div className="space-y-8">
            <Card className="card-premium h-64 animate-pulse relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-earth-elevated/10 via-earth-elevated/40 to-earth-elevated/10 animate-shimmer" />
              <CardContent className="h-full flex items-center justify-between p-8">
                <div className="space-y-4">
                  <div className="h-4 w-32 bg-earth-border rounded" />
                  <div className="h-12 w-48 bg-earth-border rounded" />
                  <div className="h-4 w-24 bg-earth-border rounded" />
                </div>
                <div className="h-20 w-20 rounded-full bg-earth-border" />
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[...Array(5)].map((_, i) => (
                <Card key={i} className="card-premium h-40 animate-pulse relative overflow-hidden">
                  <CardContent className="h-full flex flex-col justify-center items-center gap-4">
                    <div className="h-3 w-16 bg-earth-border rounded" />
                    <div className="h-8 w-8 rounded-full bg-earth-border" />
                    <div className="h-4 w-12 bg-earth-border rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : weatherInfo ? (
          <div className="space-y-8">
            {/* Current Weather Card */}
            <ScrollReveal delay={0.1}>
              <div 
                className="rounded-2xl p-8 relative overflow-hidden border border-earth-border/40 shadow-premium"
                style={{ background: getSkyGradient(weatherInfo.weather.description) }}
              >
                {/* Animated weather icon — large, right side */}
                <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-15 pointer-events-none">
                  <WeatherIcon condition={weatherInfo.weather.description} size={140} />
                </div>

                <div className="relative z-10">
                  <p className="text-[11px] text-[#a09880] uppercase tracking-widest mb-2 font-semibold">
                    Current Meteorology · {selectedDistrict}, Karnataka
                  </p>
                  <div className="text-[72px] font-bold text-[#f0ece0] leading-none mb-1 tracking-tighter">
                    {weatherInfo.weather.temperature}°C
                  </div>
                  <p className="text-[#c49a2a] text-lg font-medium capitalize tracking-tight font-serif">
                    {weatherInfo.weather.description}
                  </p>
                </div>

                {/* Core Metrics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-earth-border/20 relative z-10">
                  <div className="flex items-center space-x-3 p-3 bg-earth-main/50 rounded-2xl border border-earth-border/20 backdrop-blur-sm">
                    <div className="p-2.5 bg-blue-500/10 rounded-xl"><Droplets className="h-5 w-5 text-blue-400" /></div>
                    <div>
                      <div className="text-[10px] text-gold-100/30 font-black uppercase">Humidity</div>
                      <div className="text-sm font-black text-gold-100">{weatherInfo.weather.humidity}%</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-earth-main/50 rounded-2xl border border-earth-border/20 backdrop-blur-sm">
                    <div className="p-2.5 bg-amber-500/10 rounded-xl"><Wind className="h-5 w-5 text-amber-400 animate-pulse-soft" /></div>
                    <div>
                      <div className="text-[10px] text-gold-100/30 font-black uppercase">Wind Speed</div>
                      <div className="text-sm font-black text-gold-100">{weatherInfo.weather.windSpeed} km/h</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-earth-main/50 rounded-2xl border border-earth-border/20 backdrop-blur-sm">
                    <div className="p-2.5 bg-green-500/10 rounded-xl"><Eye className="h-5 w-5 text-green-400" /></div>
                    <div>
                      <div className="text-[10px] text-gold-100/30 font-black uppercase">Visibility</div>
                      <div className="text-sm font-black text-gold-100">10 km</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-earth-main/50 rounded-2xl border border-earth-border/20 backdrop-blur-sm">
                    <div className="p-2.5 bg-sky-500/10 rounded-xl"><Gauge className="h-5 w-5 text-sky-400" /></div>
                    <div>
                      <div className="text-[10px] text-gold-100/30 font-black uppercase">Pressure</div>
                      <div className="text-sm font-black text-gold-100">1013 mb</div>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* 5-Day Forecast Grid */}
            {weatherInfo.weather.forecast && weatherInfo.weather.forecast.length > 0 && (
              <ScrollReveal delay={0.2}>
                <div className="space-y-4">
                  <h2 className="text-xs text-gold-400 font-black uppercase tracking-widest flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" /> 5-Day Timeline Forecast
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {weatherInfo.weather.forecast.slice(0, 5).map((day, idx) => (
                      <div key={idx} className="card-base p-4 text-center relative overflow-hidden flex flex-col justify-between py-5 hover:border-gold-400/20 transition-all duration-300 card-hover">
                        <div className="absolute top-0 left-0 right-0 h-[2px]"
                          style={{ background: getDayGradient(day.description) }} />
                        <div className="text-xs font-black text-gold-100/80">
                          {formatForecastDate(day.date)}
                        </div>
                        <div className="flex justify-center my-3">
                          <WeatherIcon condition={day.description} size={40} />
                        </div>
                        <div className="space-y-1">
                          <div className="text-xl font-black text-gold-100">{day.temp_max}°</div>
                          <div className="text-gold-100/40 text-xs">{day.temp_min}°</div>
                          <div className="text-[10px] text-gold-300 font-bold uppercase tracking-wide mt-2 capitalize">{day.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            )}

            {/* Advisory Tips Section */}
            {weatherInfo.advisory && (
              <ScrollReveal delay={0.3}>
                <Card className="card-premium border-gold-400/20 bg-gold-400/5">
                  <CardHeader>
                    <CardTitle className="text-sm text-gold-400 font-black uppercase tracking-widest flex items-center gap-2">
                      <Info className="h-4 w-4 animate-bounce-gentle" /> Localized Agronomic Advisory
                    </CardTitle>
                    <CardDescription className="text-gold-100/40">Farming directives compiled specifically for {selectedDistrict}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <div className="bg-earth-main/40 border border-earth-border/40 p-5 rounded-2xl mb-6">
                      <p className="text-sm text-gold-100 font-bold tracking-tight">Summary Statement</p>
                      <p className="text-xs text-gold-100/70 leading-relaxed mt-1 italic">"{weatherInfo.advisory.summary || 'Conditions are stable for scheduled farming operations.'}"</p>
                    </div>

                    <div className="space-y-3">
                      <span className="text-[10px] font-black text-gold-400 uppercase tracking-widest block">Actionable Checklist</span>
                      {weatherInfo.advisory.farmingTips?.map((tip, i) => (
                        <div key={i} className="flex gap-3 items-start p-3 bg-earth-elevated/20 border border-earth-border/40 rounded-xl">
                          <div className="w-1.5 h-1.5 rounded-full bg-gold-400 mt-1.5 flex-shrink-0" />
                          <p className="text-xs text-gold-100/80 leading-relaxed">{tip}</p>
                        </div>
                      )) || (
                        <p className="text-xs text-gold-100/40">No specific advisory tips for current conditions.</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </ScrollReveal>
            )}
          </div>
        ) : (
          <div className="text-center py-24 bg-earth-elevated/10 rounded-3xl border border-earth-border/40">
            <Cloud className="h-16 w-16 text-gold-400/20 mx-auto mb-4" />
            <h3 className="text-lg font-black text-gold-100">No Weather Data Available</h3>
            <p className="text-gold-100/40 text-xs uppercase tracking-widest mt-1">Select a district to initialize precision weather sync</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
