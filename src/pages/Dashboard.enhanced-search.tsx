/**
 * Enhanced Dashboard with Improved District Search
 * Integration example showing how to use the new district search
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useDistrictContext } from '@/contexts/DistrictContext';
import { apiGet } from '@/lib/httpClient';
import { cropRecommender } from '@/lib/ai/cropRecommender';
import { weatherAdvisor } from '@/lib/ai/weatherAdvisor';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DistrictSearch } from '@/components/ui/district-search';
import { useDistrictSearch, loadDistrictsFromCSV, type DistrictData } from '@/hooks/useDistrictSearch';
import { CardShimmer, CropCardShimmer } from '@/components/ui/loading-shimmer';
import { Sprout, TrendingUp, Users, FileText, Cloud, Leaf, MapPin, Zap, Droplets, Thermometer } from 'lucide-react';
import { motion } from 'framer-motion';

interface Crop {
  id: string;
  name: string;
  category: string;
  image_url: string | null;
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

export default function EnhancedDashboard() {
  const { user, profile } = useAuth();
  const { selectedDistrict: selectedDistrictContext, setSelectedDistrict: setGlobalDistrict } = useDistrictContext();
  const navigate = useNavigate();
  
  // State
  const [crops, setCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);
  const [districts, setDistricts] = useState<DistrictData[]>([]);
  const [cropRecommendations, setCropRecommendations] = useState<CropRecommendation[]>([]);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [newsItems] = useState<string[]>([
    'New subsidy scheme announced for organic farming',
    'Weather alert: Heavy rainfall expected in coastal districts',
    'New pest-resistant rice variety released',
    'Farmers training program starting next month'
  ]);

  // Enhanced district search hook
  const {
    searchQuery,
    selectedDistrict,
    selectedDistrictData,
    searchResults,
    setSearchQuery,
    setSelectedDistrict,
    allDistricts,
  } = useDistrictSearch(districts, {
    threshold: 0.3,
    keys: ['district', 'recommended_crops', 'soil_type'],
    limit: 32, // Show all districts
    initialDistrict: selectedDistrictContext || profile?.location || '',
  });

  // Load districts from CSV
  useEffect(() => {
    const loadDistricts = async () => {
      const districtData = await loadDistrictsFromCSV('/districts.csv');
      setDistricts(districtData);
    };
    loadDistricts();
  }, []);

  // Initialize dashboard
  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    initializeDashboard();
  }, [user, navigate]);

  // Load district-specific data when district changes
  useEffect(() => {
    if (selectedDistrict) {
      loadDistrictData();
    }
  }, [selectedDistrict]);

  useEffect(() => {
    if (selectedDistrictContext && selectedDistrictContext !== selectedDistrict) {
      setSelectedDistrict(selectedDistrictContext);
    }
  }, [selectedDistrictContext, selectedDistrict, setSelectedDistrict]);

  useEffect(() => {
    if (selectedDistrict && selectedDistrict !== selectedDistrictContext) {
      setGlobalDistrict(selectedDistrict);
    }
  }, [selectedDistrict, selectedDistrictContext, setGlobalDistrict]);

  const initializeDashboard = async () => {
    try {
      // Load crops
      const data = await apiGet('/api/crops?limit=6');
      setCrops(data || []);
    } catch (error) {
      console.error('Error initializing dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDistrictData = async () => {
    if (!selectedDistrict) return;

    try {
      // Load crop recommendations
      const recommendations = await cropRecommender.getRecommendations(selectedDistrict);
      setCropRecommendations(recommendations);

      // Load weather data
      const weather = await weatherAdvisor.getWeatherData(selectedDistrict);
      setWeatherData(weather);
    } catch (error) {
      console.error('Error loading district data:', error);
    }
  };

  const quickActions = [
    {
      title: 'Market Prices',
      description: 'Check latest crop prices',
      icon: TrendingUp,
      color: 'bg-blue-500',
      path: '/market-prices',
    },
    {
      title: 'My Farm',
      description: 'Manage your farms',
      icon: Sprout,
      color: 'bg-green-500',
      path: '/my-farm',
    },
    {
      title: 'Community',
      description: 'Connect with farmers',
      icon: Users,
      color: 'bg-purple-500',
      path: '/community',
    },
    {
      title: 'Gov Schemes',
      description: 'Explore subsidies',
      icon: FileText,
      color: 'bg-orange-500',
      path: '/schemes',
    },
    {
      title: 'AI Agent',
      description: 'AI farming assistant',
      icon: Zap,
      color: 'bg-cyan-500',
      path: '/air-agent',
    },
  ];

  if (!user) return null;

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Welcome back, {profile?.full_name || profile?.username || 'Farmer'}!
            </h1>
            <p className="text-gray-600 mt-2">
              {selectedDistrict
                ? `Farming insights for ${selectedDistrict}`
                : 'Select a district to see personalized farming insights'}
            </p>
          </div>

          {/* Enhanced District Search */}
          <div className="w-full lg:w-96">
            <DistrictSearch
              districts={allDistricts}
              selectedDistrict={selectedDistrict}
              onSelectDistrict={setSelectedDistrict}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              searchResults={searchResults}
              placeholder="Search districts..."
              className="w-full"
            />
          </div>
        </div>

        {/* Selected District Info Card */}
        {selectedDistrictData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-gradient-to-br from-leaf-50 to-leaf-100/50 border-leaf-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-leaf-700" />
                  {selectedDistrictData.district} District
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium text-slate-600 mb-1">Recommended Crops</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedDistrictData.recommended_crops.split(',').map((crop, i) => (
                        <Badge key={i} variant="default" className="bg-leaf-600">
                          {crop.trim()}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600 mb-1">Soil Type</p>
                    <Badge variant="secondary">{selectedDistrictData.soil_type}</Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600 mb-1">Weather & Rainfall</p>
                    <div className="flex gap-2">
                      <Badge variant="outline">{selectedDistrictData.weather_pattern}</Badge>
                      <Badge variant="outline">{selectedDistrictData.avg_rainfall}</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card
                  className="card-hover cursor-pointer"
                  onClick={() => navigate(action.path)}
                >
                  <CardContent className="p-6 text-center">
                    <div className={`${action.color} p-3 rounded-full w-fit mx-auto mb-3`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-sm mb-1">{action.title}</h3>
                    <p className="text-xs text-gray-600">{action.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Weather & Crop Recommendations (show only when district selected) */}
        {selectedDistrict && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Weather Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Cloud className="h-5 w-5 mr-2 text-blue-600" />
                  Weather in {selectedDistrict}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {weatherData ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Thermometer className="h-4 w-4 text-red-500" />
                        <span className="text-2xl font-bold">{weatherData.temperature}°C</span>
                      </div>
                      <Badge variant="secondary">{weatherData.description}</Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Droplets className="h-4 w-4 text-blue-500" />
                        <span>Humidity: {weatherData.humidity}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Cloud className="h-4 w-4 text-gray-500" />
                        <span>Wind: {weatherData.windSpeed} km/h</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <CardShimmer />
                )}
              </CardContent>
            </Card>

            {/* Crop Recommendations Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Leaf className="h-5 w-5 mr-2 text-green-600" />
                  Recommended Crops
                </CardTitle>
              </CardHeader>
              <CardContent>
                {cropRecommendations.length > 0 ? (
                  <div className="space-y-3">
                    {cropRecommendations.slice(0, 3).map((rec, index) => (
                      <div key={index} className="border rounded-lg p-3 bg-green-50/50">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-green-800">{rec.cropName}</h4>
                          <Badge variant="outline">{rec.season}</Badge>
                        </div>
                        <p className="text-sm text-gray-600">{rec.reason}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <CardShimmer />
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Popular Crops Section */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Popular Crops</h2>
          {loading ? (
            <CropCardShimmer count={6} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {crops.map((crop) => (
                <Card
                  key={crop.id}
                  className="card-hover cursor-pointer overflow-hidden group"
                  onClick={() => navigate(`/crop/${crop.name.toLowerCase()}`)}
                >
                  {crop.image_url && (
                    <div className="h-48 overflow-hidden">
                      <img
                        src={crop.image_url}
                        alt={crop.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Leaf className="h-5 w-5 mr-2 text-green-600" />
                      {crop.name}
                    </CardTitle>
                    <CardDescription>{crop.category}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full btn-primary">
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* News Section */}
        <Card>
          <CardHeader>
            <CardTitle>Latest Agricultural News</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {newsItems.map((news, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm">{news}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
