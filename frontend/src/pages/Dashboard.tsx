import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { apiGet } from '@/lib/httpClient';
import { cropRecommender } from '@/lib/ai/cropRecommender';
import { WeatherAPI } from '@/lib/api/weather';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { CardShimmer, CropCardShimmer } from '@/components/ui/loading-shimmer';
import { CropCardPremium } from '@/components/ui/crop-card-premium';
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/components/ui/animations';
import { LottieEmptyState } from '@/components/ui/lottie-loading';
import { Sprout, TrendingUp, Users, FileText, Cloud, Leaf, MapPin, Zap, Droplets, Thermometer, MessageSquare } from 'lucide-react';

interface Crop {
  id: string;
  name: string;
  category: string;
  image_url: string | null;
  investmentPerAcre?: number;
  expectedReturns?: number;
  breakevenMonths?: number;
  durationDays?: number;
  season?: string;
  weatherPattern?: string;
}

interface CropRecommendation {
  cropName: string;
  reason: string;
  season: string;
  expectedYield: string;
}

interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  description: string;
  forecast: Array<{
    date: string;
    temp_max: number;
    temp_min: number;
    description: string;
    precipitation: number;
  }>;
}

export default function Dashboard() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [crops, setCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [districts, setDistricts] = useState<string[]>([]);
  const [districtData, setDistrictData] = useState<any[]>([]);
  const [cropRecommendations, setCropRecommendations] = useState<CropRecommendation[]>([]);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [newsItems, setNewsItems] = useState<string[]>([]);


  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    initializeDashboard();
  }, [user, navigate]);

  useEffect(() => {
    if (selectedDistrict) {
      loadDistrictData();
    }
  }, [selectedDistrict]);

  const loadDistrictDataFromCSV = async () => {
    try {
      const response = await fetch('/districts.csv');
      const csvText = await response.text();
      const lines = csvText.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',');
      const data = lines.slice(1).map(line => {
        const values = line.split(',');
        const obj: any = {};
        headers.forEach((header, index) => {
          obj[header.trim()] = values[index]?.trim();
        });
        return obj;
      });
      setDistrictData(data);
      setDistricts(data.map(d => d.district));
      return data;
    } catch (error) {
      console.error('Error loading district data:', error);
      return [];
    }
  };

  const initializeDashboard = async () => {
    try {
      // Load districts from CSV before choosing a default district.
      const loadedDistrictData = await loadDistrictDataFromCSV();

      // Set default district from profile or first available
      const defaultDistrict = profile?.location || profile?.district || loadedDistrictData[0]?.district || '';
      setSelectedDistrict(defaultDistrict);

      // Load crops — API returns Spring Page object with .content
      const data = await apiGet('/api/crops?page=0&size=6&sortBy=name');
      setCrops(data?.content || []);



      // Load news items (mock for now)
      setNewsItems([
        'New subsidy scheme announced for organic farming',
        'Weather alert: Heavy rainfall expected in coastal districts',
        'New pest-resistant rice variety released',
        'Farmers training program starting next month'
      ]);
    } catch (error) {
      console.error('Error initializing dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDistrictData = async () => {
    if (!selectedDistrict) return;

    try {
      // Load crop recommendations from AI
      const recommendations = await cropRecommender.getRecommendations(selectedDistrict);
      setCropRecommendations(recommendations);

      // Load specific crop details for the district (Recommended Crops)
      setLoading(true);
      let data = await apiGet(`/api/crops/recommendations/${encodeURIComponent(selectedDistrict)}`);

      // Fallback to all crops if no recommendations found for this district
      if (!data || data.length === 0) {
        const fallback = await apiGet('/api/crops?page=0&size=6&sortBy=name');
        data = fallback?.content || [];
      }

      setCrops(data || []);

      // Load weather data
      const weatherRes = await WeatherAPI.getWeatherForDistrict(selectedDistrict);
      if (weatherRes) {
        setWeatherData(weatherRes.weather);
      }
    } catch (error) {
      console.error('Error loading district data:', error);
    } finally {
      setLoading(false);
    }
  };



  if (!user) return null;

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gradient-gold">
              Welcome back, {profile?.full_name || profile?.username || 'Farmer'}!
            </h1>
            <p className="text-gold-100/60 mt-1">
              {profile?.location
                ? `Farming from ${profile.location}`
                : 'Manage your farming activities and stay updated'}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-earth-elevated px-3 py-1.5 rounded-lg border border-earth-border">
              <MapPin className="h-4 w-4 text-gold-400" />
              <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
                <SelectTrigger className="w-40 bg-transparent border-none focus:ring-0 h-auto p-0 text-sm font-medium text-gold-100 notranslate" translate="no">
                  <SelectValue placeholder="Select district" />
                </SelectTrigger>
                <SelectContent className="bg-earth-elevated border-earth-border notranslate" translate="no">
                  {districts.sort().map((district) => (
                    <SelectItem key={district} value={district} className="text-gold-100 hover:bg-earth-card">
                      {district}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>



        {selectedDistrict && (
          <ScrollReveal direction="up" delay={0.1}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Weather Card */}
              <Card className="card-premium overflow-hidden">
                <CardHeader className="pb-2 border-b border-earth-border/50">
                  <CardTitle className="flex items-center text-gold-100">
                    <Cloud className="h-5 w-5 mr-2 text-gold-400" />
                    Weather in {selectedDistrict}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  {weatherData ? (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-3 bg-gold-400/10 rounded-xl">
                            <Thermometer className="h-6 w-6 text-gold-400" />
                          </div>
                          <div>
                            <span className="text-3xl font-bold text-gold-100">{weatherData.temperature}°C</span>
                            <p className="text-xs text-gold-100/50">Current Temperature</p>
                          </div>
                        </div>
                        <Badge className="bg-gold-400/20 text-gold-400 border-none px-3 py-1">{weatherData.description}</Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 p-3 bg-earth-elevated rounded-xl border border-earth-border">
                          <Droplets className="h-4 w-4 text-gold-300" />
                          <div>
                            <p className="text-xs text-gold-100/50 uppercase tracking-wider font-bold">Humidity</p>
                            <p className="text-sm font-bold text-gold-100">{weatherData.humidity}%</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-earth-elevated rounded-xl border border-earth-border">
                          <Cloud className="h-4 w-4 text-gold-300" />
                          <div>
                            <p className="text-xs text-gold-100/50 uppercase tracking-wider font-bold">Wind Speed</p>
                            <p className="text-sm font-bold text-gold-100">{weatherData.windSpeed} km/h</p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-xs font-bold text-gold-100/50 uppercase tracking-widest mb-3">5-Day Forecast</h4>
                        <div className="space-y-3">
                          {weatherData.forecast.slice(0, 3).map((day, index) => (
                            <div key={index} className="flex justify-between items-center text-sm p-2 hover:bg-earth-elevated rounded-lg transition-colors">
                              <span className="font-medium text-gold-100">{new Date(day.date).toLocaleDateString('en-IN', { weekday: 'short' })}</span>
                              <div className="flex items-center gap-4">
                                <span className="text-gold-100/70">{day.temp_min}° - {day.temp_max}°</span>
                                <span className="text-xs bg-earth-elevated px-2 py-0.5 rounded text-gold-300">{day.description}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <CardShimmer />
                  )}
                </CardContent>
              </Card>

              {/* Crop Recommendations Card */}
              <Card className="card-premium overflow-hidden">
                <CardHeader className="pb-2 border-b border-earth-border/50">
                  <CardTitle className="flex items-center text-gold-100">
                    <Leaf className="h-5 w-5 mr-2 text-gold-400" />
                    Recommended Crops for {selectedDistrict}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  {cropRecommendations.length > 0 ? (
                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                      {cropRecommendations.slice(0, 4).map((rec, index) => {
                        const districtInfo = districtData.find(d => d.district === selectedDistrict);
                        const recommendedCrops = districtInfo?.recommended_crops?.split(' / ') || [];
                        const isRecommended = recommendedCrops.includes(rec.cropName);

                        return (
                          <div key={index} className="border border-earth-border rounded-xl p-4 bg-earth-elevated hover:border-gold-400/30 transition-all">
                            <div className="flex justify-between items-start mb-3">
                              <h4 className="font-bold text-gold-200 text-lg">{rec.cropName}</h4>
                              <div className="flex gap-2">
                                {isRecommended && <Badge className="bg-gold-400 text-earth-main font-bold">Recommended</Badge>}
                                <Badge variant="outline" className="border-gold-400/30 text-gold-400">{rec.season}</Badge>
                              </div>
                            </div>
                            <p className="text-sm text-gold-100/60 mb-3 leading-relaxed">{rec.reason}</p>

                            <div className="flex items-center gap-2 mb-3 text-xs font-bold text-gold-400 uppercase tracking-wider">
                              <Zap className="h-3 w-3" />
                              <span>Expected: {rec.expectedYield}</span>
                            </div>

                            {/* District-specific information from CSV */}
                            {districtInfo && (
                              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-earth-border/50 text-[11px]">
                                <div>
                                  <span className="text-gold-100/40 uppercase tracking-tighter">Soil Type</span>
                                  <p className="text-gold-100/80 truncate">{districtInfo.soil_type}</p>
                                </div>
                                <div>
                                  <span className="text-gold-100/40 uppercase tracking-tighter">Weather Pattern</span>
                                  <p className="text-gold-100/80 truncate">{districtInfo.weather_pattern}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <CardShimmer />
                  )}
                </CardContent>
              </Card>
            </div>
          </ScrollReveal>
        )}



        <ScrollReveal direction="up" delay={0.2}>
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gold-100">Popular Crops</h2>
              <Button
                variant="ghost"
                className="text-gold-400 hover:text-gold-300 hover:bg-gold-400/5"
                onClick={() => navigate('/crops')}
              >
                View All
              </Button>
            </div>

            {loading ? (
              <CropCardShimmer count={6} />
            ) : crops.length > 0 ? (
              <StaggerContainer staggerDelay={0.05}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {crops.map((crop) => (
                    <StaggerItem key={crop.id}>
                      <CropCardPremium crop={crop} />
                    </StaggerItem>
                  ))}
                </div>
              </StaggerContainer>
            ) : (
              <LottieEmptyState message="No crops available at the moment" />
            )}
          </div>
        </ScrollReveal>




        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* District-wise Crop Recommendations */}
          <Card className="lg:col-span-2 card-premium">
            <CardHeader className="border-b border-earth-border/50">
              <CardTitle className="text-gold-100 flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-gold-400" />
                Regional Crop Recommendations
              </CardTitle>
              <CardDescription className="text-gold-100/40">
                Detailed overview for districts in Karnataka
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {districtData.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                  {districtData.map((district, index) => (
                    <div key={index} className="border border-earth-border rounded-xl p-4 bg-earth-elevated hover:bg-earth-elevated/80 transition-colors">
                      <h4 className="font-bold text-gold-400 mb-3 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-gold-400 rounded-full"></span>
                        {district.district}
                      </h4>
                      <div className="space-y-3 text-xs leading-relaxed">
                        <div>
                          <span className="text-gold-100/40 uppercase tracking-tighter block mb-1">Recommended Crops</span>
                          <p className="text-gold-100/80 font-medium">{district.recommended_crops}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="text-gold-100/40 uppercase tracking-tighter block mb-1">Soil Type</span>
                            <p className="text-gold-100/80">{district.soil_type}</p>
                          </div>
                          <div>
                            <span className="text-gold-100/40 uppercase tracking-tighter block mb-1">Rainfall</span>
                            <p className="text-gold-100/80">{district.avg_rainfall}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <CardShimmer />
              )}
            </CardContent>
          </Card>

          <div className="space-y-8">
            {/* News Section */}
            <Card className="card-premium">
              <CardHeader className="border-b border-earth-border/50">
                <CardTitle className="text-gold-100 flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-gold-400" />
                  Market News
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {newsItems.map((news, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-earth-elevated/50 rounded-xl border border-earth-border group hover:border-gold-400/20 transition-all cursor-pointer">
                      <div className="w-1.5 h-1.5 bg-gold-400 rounded-full mt-1.5 flex-shrink-0 group-hover:scale-150 transition-transform"></div>
                      <p className="text-xs text-gold-100/70 group-hover:text-gold-100 leading-relaxed">{news}</p>
                    </div>
                  ))}
                </div>
                <Button variant="link" className="w-full text-gold-400 mt-4 text-xs font-bold uppercase tracking-widest">Read More Updates</Button>
              </CardContent>
            </Card>

            {/* Help Section */}
            <ScrollReveal direction="up" delay={0.3}>
              <Card className="bg-gradient-to-br from-gold-400 to-gold-600 text-earth-main border-none shadow-gold-glow relative overflow-hidden group">
                <div className="absolute -right-8 -bottom-8 opacity-10 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-700">
                  <Zap size={160} />
                </div>
                <CardHeader>
                  <CardTitle className="text-earth-main font-black">Need Expert Advice?</CardTitle>
                  <CardDescription className="text-earth-main/70 font-medium">
                    Our AI assistant and agricultural experts are ready to help you optimize your yield.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => navigate('/air-agent')}
                    className="w-full bg-earth-main text-gold-400 hover:bg-earth-main/90 font-bold rounded-xl h-12 shadow-lg"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Chat with KrishiMitra
                  </Button>
                </CardContent>
              </Card>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </Layout>
  );
}
