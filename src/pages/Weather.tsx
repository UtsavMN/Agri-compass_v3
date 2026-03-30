import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useDistrictContext } from '@/contexts/DistrictContext';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ScrollReveal, FadeIn } from '@/components/ui/animations';
import { weatherAdvisor } from '@/lib/ai/weatherAdvisor';
import { Cloud, CloudRain, Sun, Wind, Droplets, Eye, Gauge, Search, MapPin, TrendingUp, Thermometer, Droplet } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

import { WeatherData } from '@/lib/ai/weatherAdvisor';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

export default function Weather() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const { selectedDistrict, setSelectedDistrict } = useDistrictContext();
  const [districts, setDistricts] = useState<string[]>([]);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDistricts();
  }, []);

  useEffect(() => {
    if (!selectedDistrict && profile?.location) {
      setSelectedDistrict(profile.location);
    }
  }, [profile?.location, selectedDistrict, setSelectedDistrict]);

  useEffect(() => {
    if (selectedDistrict) {
      loadWeatherData();
    }
  }, [selectedDistrict]);

  const loadDistricts = async () => {
    try {
      const response = await fetch('/districts.csv');
      const text = await response.text();
      const lines = text.split('\n').slice(1); // Skip header
      const districtList = lines
        .map(line => line.split(',')[0]?.trim())
        .filter(Boolean)
        .sort();
      setDistricts(districtList);
    } catch (error) {
      console.error('Error loading districts:', error);
    }
  };

  const loadWeatherData = async () => {
    if (!selectedDistrict) return;
    setLoading(true);
    try {
      const weather = await weatherAdvisor.getWeatherData(selectedDistrict);
      setWeatherData(weather);
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



  return (
    <Layout>
      <div className="space-y-6">
        <ScrollReveal>
          <div>
            <h1 className="text-gradient">
              Weather Forecast
            </h1>
            <p className="text-gray-600 mt-2">Stay updated with weather conditions for better farming decisions</p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
                <SelectTrigger className="pl-10 input-field">
                  <SelectValue placeholder="Select your district..." />
                </SelectTrigger>
                <SelectContent>
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
          <ScrollReveal delay={0.4}>
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white card-hover">
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Cloud className="h-16 w-16 mx-auto mb-4 animate-pulse" />
                  <div className="loading-shimmer h-6 w-32 rounded mb-2"></div>
                  <p className="text-xl">Loading weather data...</p>
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>
        ) : weatherData ? (
          <ScrollReveal delay={0.4}>
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white card-hover">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Thermometer className="h-6 w-6" />
                  Current Weather
                </CardTitle>
                <CardDescription className="text-blue-100">{selectedDistrict}, Karnataka</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-6xl font-bold">{weatherData.temperature}°C</div>
                    <div className="text-xl mt-2 capitalize">{weatherData.description}</div>
                  </div>
                  <Cloud className="h-24 w-24 text-blue-100 animate-bounce-gentle" />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-blue-400">
                  <FadeIn delay={0.1}>
                    <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-blue-400/20 transition-colors">
                      <Droplets className="h-5 w-5 text-blue-100" />
                      <div>
                        <div className="text-sm text-blue-100">Humidity</div>
                        <div className="font-semibold">{weatherData.humidity}%</div>
                      </div>
                    </div>
                  </FadeIn>
                  <FadeIn delay={0.2}>
                    <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-blue-400/20 transition-colors">
                      <Wind className="h-5 w-5 text-blue-100" />
                      <div>
                        <div className="text-sm text-blue-100">Wind</div>
                        <div className="font-semibold">{weatherData.windSpeed} km/h</div>
                      </div>
                    </div>
                  </FadeIn>
                  <FadeIn delay={0.3}>
                    <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-blue-400/20 transition-colors">
                      <Eye className="h-5 w-5 text-blue-100" />
                      <div>
                        <div className="text-sm text-blue-100">Visibility</div>
                        <div className="font-semibold">10 km</div>
                      </div>
                    </div>
                  </FadeIn>
                  <FadeIn delay={0.4}>
                    <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-blue-400/20 transition-colors">
                      <Gauge className="h-5 w-5 text-blue-100" />
                      <div>
                        <div className="text-sm text-blue-100">Pressure</div>
                        <div className="font-semibold">1013 mb</div>
                      </div>
                    </div>
                  </FadeIn>
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>
        ) : (
          <ScrollReveal delay={0.4}>
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white card-hover">
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Cloud className="h-16 w-16 mx-auto mb-4" />
                  <p className="text-xl">Select a district to view weather</p>
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>
        )}

        {weatherData && weatherData.forecast && weatherData.forecast.length > 0 && (
          <ScrollReveal delay={0.6}>
            <div>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-leaf-600" />
                5-Day Forecast
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {weatherData.forecast.slice(0, 5).map((day, index) => (
                  <FadeIn key={index} delay={index * 0.1}>
                    <Card className="text-center card-hover">
                      <CardHeader>
                        <CardTitle className="text-lg">
                          {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Cloud className="h-12 w-12 mx-auto mb-3 text-blue-500 animate-pulse-soft" />
                        <div className="space-y-1">
                          <div className="text-2xl font-bold">{day.temp_max}°</div>
                          <div className="text-gray-500 text-sm">{day.temp_min}°</div>
                          <div className="text-sm text-gray-600 mt-2 capitalize">{day.description}</div>
                        </div>
                      </CardContent>
                    </Card>
                  </FadeIn>
                ))}
              </div>
            </div>
          </ScrollReveal>
        )}

        {weatherData && (
          <ScrollReveal delay={0.8}>
            <Card className="bg-green-50 border-green-200 card-hover">
              <CardHeader>
                <CardTitle className="flex items-center text-green-700">
                  <Sun className="h-5 w-5 mr-2 animate-bounce-gentle" />
                  Farming Advisory
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-gray-700">
                <FadeIn delay={0.1}>
                  <p>• Weather conditions suitable for field activities in {selectedDistrict}</p>
                </FadeIn>
                <FadeIn delay={0.2}>
                  <p>• Monitor humidity levels for crop health</p>
                </FadeIn>
                <FadeIn delay={0.3}>
                  <p>• Wind speeds are favorable for agricultural operations</p>
                </FadeIn>
                <FadeIn delay={0.4}>
                  <p>• Plan irrigation based on forecast and soil moisture</p>
                </FadeIn>
              </CardContent>
            </Card>
          </ScrollReveal>
        )}
      </div>
    </Layout>
  );
}
