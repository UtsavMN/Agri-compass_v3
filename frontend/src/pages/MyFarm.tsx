import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { FarmsAPI } from '@/lib/api/farms';
import { WeatherAPI } from '@/lib/api/weather';
import { cropRecommender } from '@/lib/ai/cropRecommender';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/components/ui/animations';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { useDistrictContext } from '@/contexts/DistrictContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Plus, Sprout, MapPin, Ruler, Droplet, Trash2, Cloud, Thermometer, Wind, CloudRain, Shield, Activity, Database, Clock } from 'lucide-react';
import FertilizerAnalysisModule from '@/components/features/FertilizerAnalysisModule';

interface Farm {
  id: string;
  name: string;
  location: string;
  areaAcres: number;
  area_acres?: number; // Fallback
  soilType: string | null;
  soil_type?: string | null; // Fallback
  irrigationType: string | null;
  irrigation_type?: string | null; // Fallback
  createdAt: string;
  created_at?: string; // Fallback
  currentCrop: string | null;
  current_crop?: string | null;
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

interface CropRecommendation {
  cropName: string;
  reason: string;
  season: string;
  expectedYield: string;
}

export default function MyFarm() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { language } = useLanguage();
  const isKannada = language === 'kn';
  const { selectedDistrict, setSelectedDistrict } = useDistrictContext();
  const [districts, setDistricts] = useState<string[]>([]);
  const [districtData, setDistrictData] = useState<any[]>([]);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [cropRecommendations, setCropRecommendations] = useState<CropRecommendation[]>([]);
  const [selectedFarmForAnalysis, setSelectedFarmForAnalysis] = useState<Farm | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    area_acres: '',
    soil_type: '',
    irrigation_type: '',
    current_crop: '',
  });

  useEffect(() => {
    if (user) {
      initializePage();
    }
  }, [user]);

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
    } catch (error) {
      console.error('Error loading district data:', error);
    }
  };

  const initializePage = async () => {
    try {
      await loadDistrictDataFromCSV();
      const defaultDistrict = profile?.location || districts[0] || '';
      setSelectedDistrict(defaultDistrict);
      await loadFarms();
    } catch (error) {
      console.error('Error initializing page:', error);
    }
  };

  const loadFarms = async () => {
    try {
      if (!user?.id) return;
      const data = await FarmsAPI.getFarms(user.id);
      setFarms(data || []);
    } catch (error) {
      const err = error as { message?: string };
      toast({
        title: 'Registry Access Failed',
        description: err.message ?? 'Could not retrieve farm data.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadDistrictData = async () => {
    if (!selectedDistrict) return;
    try {
      const weatherRes = await WeatherAPI.getWeatherForDistrict(selectedDistrict);
      if (weatherRes) {
        setWeatherData(weatherRes.weather);
      }
      const recommendations = await cropRecommender.getRecommendations(selectedDistrict);
      setCropRecommendations(recommendations);
    } catch (error) {
      console.error('Error loading district data:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!user?.id) return;
      const areaAcres = parseFloat(formData.area_acres);
      if (isNaN(areaAcres)) {
        toast({ title: 'Invalid Area', description: 'Please enter a numeric value for surface area.', variant: 'destructive' });
        return;
      }

      await FarmsAPI.createFarm({
        user_id: user.id,
        name: formData.name,
        location: formData.location || selectedDistrict,
        area_acres: areaAcres,
        soil_type: formData.soil_type || 'General',
        irrigation_type: formData.irrigation_type || 'Standard',
        current_crop: formData.current_crop || 'Rice',
      });

      toast({
        title: 'Asset Registered',
        description: 'New agricultural land asset has been added to your protocol.',
      });

      setDialogOpen(false);
      setFormData({
        name: '',
        location: '',
        area_acres: '',
        soil_type: '',
        irrigation_type: '',
        current_crop: '',
      });
      loadFarms();
    } catch (error) {
      const err = error as { message?: string };
      toast({
        title: 'Registration Failed',
        description: err.message ?? 'Internal server synchronization error.',
        variant: 'destructive',
      });
    }
  };

  const handleLogWeather = async (farmId: string) => {
    if (!weatherData || !selectedDistrict || !user) return;
    try {
      await WeatherAPI.logWeatherForFarm(farmId, selectedDistrict, weatherData, user.id);
      toast({ title: 'Atmospheric Log Saved', description: 'Environmental data committed to history.' });
    } catch (error) {
      toast({ title: 'Data Logging Failed', variant: 'destructive' });
    }
  };

  const handleDelete = async (farmId: string) => {
    if (!confirm('Are you sure you want to decommission this farm asset?')) return;
    try {
      await FarmsAPI.deleteFarm(farmId);
      toast({
        title: 'Asset Decommissioned',
        description: 'The farm registry entry has been purged.',
      });
      loadFarms();
    } catch (error) {
      const err = error as { message?: string };
      toast({
        title: 'Purge Failed',
        description: err.message ?? 'Could not remove entry from registry.',
        variant: 'destructive',
      });
    }
  };

  if (!user) {
    return (
      <Layout>
        <div className="text-center py-24">
          <p className="text-gold-100/40 font-medium italic">Please authenticate to access the Land Registry.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-12 pb-12 max-w-7xl mx-auto">
        <ScrollReveal>
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <h1 className="text-4xl font-black text-gold-100 tracking-tight">Land Registry</h1>
              <p className="text-gold-100/40 text-sm font-bold uppercase tracking-[0.2em] mt-1">Asset & Resource Management</p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-3 bg-earth-elevated/50 p-2 pl-4 rounded-2xl border border-earth-border">
                <MapPin className="h-4 w-4 text-gold-400/60" />
                <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
                  <SelectTrigger className="w-48 bg-transparent border-none text-gold-100 font-bold focus:ring-0 notranslate" translate="no">
                    <SelectValue placeholder="District Protocol" />
                  </SelectTrigger>
                  <SelectContent className="bg-earth-elevated border-earth-border notranslate" translate="no">
                    {districts.sort().map((district) => (
                      <SelectItem key={district} value={district} className="text-gold-100 uppercase text-xs font-bold">
                        {district}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="btn-gold h-12 px-8 shadow-gold-glow">
                    <Plus className="mr-2 h-4 w-4" />
                    Register Asset
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-earth-elevated border-earth-border text-gold-100 max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-black">Initialize New Asset</DialogTitle>
                    <DialogDescription className="text-gold-100/40 font-bold uppercase text-[10px] tracking-widest mt-2">
                      Input land coordinate and metadata parameters
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-gold-100/40">Asset Identifier</Label>
                      <Input
                        placeholder="e.g. Northern Sector A1"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="bg-earth-main border-earth-border focus:border-gold-400 text-gold-100 rounded-xl h-11"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-gold-100/40">Geo-Location</Label>
                      <Input
                        placeholder="District, Region"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="bg-earth-main border-earth-border focus:border-gold-400 text-gold-100 rounded-xl h-11"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-gold-100/40">Surface Area (Acres)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="10.00"
                        value={formData.area_acres}
                        onChange={(e) => setFormData({ ...formData, area_acres: e.target.value })}
                        className="bg-earth-main border-earth-border focus:border-gold-400 text-gold-100 rounded-xl h-11"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-gold-100/40">Current Crop Protocol</Label>
                      <Select value={formData.current_crop} onValueChange={(v) => setFormData({ ...formData, current_crop: v })}>
                        <SelectTrigger className="bg-earth-main border-earth-border text-gold-100 rounded-xl h-11">
                          <SelectValue placeholder="Target Crop" />
                        </SelectTrigger>
                        <SelectContent className="bg-earth-elevated border-earth-border">
                          {['Rice', 'Maize', 'Tomato', 'Wheat', 'Cotton', 'Sugarcane', 'Coffee'].map(t => (
                            <SelectItem key={t} value={t} className="text-gold-100 uppercase text-[10px] font-bold">{t}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-gold-100/40">Soil Composition</Label>
                          <Select value={formData.soil_type} onValueChange={(v) => setFormData({ ...formData, soil_type: v })}>
                             <SelectTrigger className="bg-earth-main border-earth-border text-gold-100 rounded-xl h-11">
                                <SelectValue placeholder="Type" />
                             </SelectTrigger>
                             <SelectContent className="bg-earth-elevated border-earth-border">
                                {['Alluvial', 'Black', 'Red', 'Laterite', 'Desert', 'Clay', 'Sandy', 'Loamy'].map(t => (
                                   <SelectItem key={t} value={t} className="text-gold-100 uppercase text-[10px] font-bold">{t}</SelectItem>
                                ))}
                             </SelectContent>
                          </Select>
                       </div>
                       <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-gold-100/40">Irrigation Protocol</Label>
                          <Select value={formData.irrigation_type} onValueChange={(v) => setFormData({ ...formData, irrigation_type: v })}>
                             <SelectTrigger className="bg-earth-main border-earth-border text-gold-100 rounded-xl h-11">
                                <SelectValue placeholder="System" />
                             </SelectTrigger>
                             <SelectContent className="bg-earth-elevated border-earth-border">
                                {['Drip', 'Sprinkler', 'Canal', 'Tube Well', 'Rain Fed', 'Mixed'].map(t => (
                                   <SelectItem key={t} value={t} className="text-gold-100 uppercase text-[10px] font-bold">{t}</SelectItem>
                                ))}
                             </SelectContent>
                          </Select>
                       </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                      <Button type="button" variant="ghost" className="text-gold-100/40 font-bold uppercase text-xs" onClick={() => setDialogOpen(false)}>
                        Abort
                      </Button>
                      <Button type="submit" className="btn-gold px-8">
                        Commit Asset
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </ScrollReveal>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
             {[1,2,3].map(i => <div key={i} className="h-64 bg-earth-elevated/40 rounded-[2rem] animate-pulse border border-earth-border" />)}
          </div>
        ) : farms.length === 0 ? (
          <ScrollReveal direction="up">
            <Card className="card-premium py-24 text-center border-none shadow-premium bg-earth-elevated/20">
              <CardContent>
                <Sprout className="h-20 w-20 text-gold-400/20 mx-auto mb-6" />
                <h3 className="text-2xl font-black text-gold-100">No Asset Data Detected</h3>
                <p className="text-gold-100/40 font-medium max-w-sm mx-auto mt-2 italic">Your agricultural asset registry is currently empty. Initialize your first farm to begin resource tracking.</p>
                <Button
                  onClick={() => setDialogOpen(true)}
                  className="btn-gold mt-10 px-10 h-14"
                >
                  <Plus className="mr-2 h-5 w-5" />
                  Initialize Registry
                </Button>
              </CardContent>
            </Card>
          </ScrollReveal>
        ) : (
          <div className="space-y-16">
            {/* Environmental Intelligence Section */}
            {selectedDistrict && (
              <ScrollReveal direction="up" delay={0.1}>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Atmospheric Data */}
                <Card className="card-premium bg-gold-400/5 border-gold-400/10">
                  <CardHeader>
                    <CardTitle className="text-gold-100 font-black tracking-tight flex items-center text-lg">
                      <Cloud className="h-5 w-5 mr-3 text-gold-400" />
                      Atmospheric Log: {selectedDistrict}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {weatherData ? (
                      <>
                        <div className="flex items-center justify-between p-4 bg-earth-main/50 rounded-[1.5rem] border border-earth-border">
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-gold-400/10 rounded-2xl">
                               <Thermometer className="h-6 w-6 text-gold-400" />
                            </div>
                            <div>
                               <span className="text-3xl font-black text-gold-100">{weatherData.temperature}°C</span>
                               <p className="text-[10px] font-black uppercase tracking-widest text-gold-400 mt-1">{weatherData.description}</p>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 bg-earth-main/50 rounded-2xl border border-earth-border flex flex-col items-center">
                            <Wind className="h-4 w-4 text-gold-400/60 mb-2" />
                            <span className="text-sm font-black text-gold-100">{weatherData.windSpeed} km/h</span>
                            <span className="text-[9px] font-bold text-gold-100/30 uppercase mt-1">Velocity</span>
                          </div>
                          <div className="p-4 bg-earth-main/50 rounded-2xl border border-earth-border flex flex-col items-center">
                            <CloudRain className="h-4 w-4 text-gold-400/60 mb-2" />
                            <span className="text-sm font-black text-gold-100">{weatherData.humidity}%</span>
                            <span className="text-[9px] font-bold text-gold-100/30 uppercase mt-1">Saturation</span>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-gold-400/10">
                          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gold-400 mb-4 flex items-center">
                             <Clock className="h-3 w-3 mr-2" /> 5-Day Projection
                          </h4>
                          <div className="space-y-3">
                            {weatherData.forecast.slice(0, 5).map((day, index) => (
                              <div key={index} className="flex justify-between items-center text-[11px] font-bold">
                                <span className="text-gold-100 uppercase w-12">{new Date(day.date).toLocaleDateString('en-IN', { weekday: 'short' })}</span>
                                <div className="flex-1 mx-4 h-px bg-gold-400/10"></div>
                                <span className="text-gold-400">{day.temp_max}°</span>
                                <span className="text-gold-100/20 mx-2">/</span>
                                <span className="text-gold-100/40">{day.temp_min}°</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="h-64 flex items-center justify-center italic text-gold-100/20 text-xs">Awaiting satellite sync...</div>
                    )}
                  </CardContent>
                </Card>

                {/* Cultivation Optimization */}
                <Card className="card-premium lg:col-span-2 overflow-hidden border-none shadow-premium bg-earth-elevated/40">
                  <CardHeader className="bg-gold-400/5 p-6 border-b border-gold-400/10">
                    <CardTitle className="text-gold-100 font-black tracking-tight flex items-center text-lg">
                      <Shield className="h-5 w-5 mr-3 text-gold-400" />
                      Yield Optimization Protocols
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    {cropRecommendations.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {cropRecommendations.slice(0, 2).map((rec, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="p-5 bg-earth-main/30 rounded-[2rem] border border-earth-border group hover:border-gold-400/30 transition-all duration-500"
                          >
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h4 className="font-black text-xl text-gold-100 tracking-tighter uppercase group-hover:text-gold-400 transition-colors">{rec.cropName}</h4>
                                <Badge className="bg-gold-400/10 text-gold-400 border-none text-[9px] uppercase tracking-widest mt-1">
                                  {rec.season} Protocol
                                </Badge>
                              </div>
                              <div className="p-2 bg-gold-400/5 rounded-full">
                                 <Sprout size={16} className="text-gold-400/40" />
                              </div>
                            </div>
                            <p className="text-xs text-gold-100/40 leading-relaxed italic mb-6">"{rec.reason}"</p>
                            
                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-earth-border/50">
                               <div>
                                  <span className="text-[9px] font-black uppercase tracking-widest text-gold-100/30">Target Yield</span>
                                  <p className="text-sm font-black text-gold-400 mt-1">{rec.expectedYield}</p>
                               </div>
                               <div>
                                  <span className="text-[9px] font-black uppercase tracking-widest text-gold-100/30">District Compatibility</span>
                                  <div className="flex gap-1 mt-1.5">
                                     {[1,2,3,4,5].map(i => <div key={i} className={`h-1 flex-1 rounded-full ${i <= 4 ? 'bg-gold-400' : 'bg-gold-400/10'}`} />)}
                                  </div>
                               </div>
                            </div>
                          </motion.div>
                        ))}
                        
                        <div className="md:col-span-2 p-6 bg-gold-400/5 rounded-[2rem] border border-gold-400/10 flex items-center justify-between">
                           <div className="flex items-center gap-4">
                              <div className="p-3 bg-earth-main rounded-2xl border border-gold-400/20">
                                 <Database className="text-gold-400 h-5 w-5" />
                              </div>
                              <div>
                                 <h5 className="font-black text-gold-100 uppercase tracking-tight text-sm">District Metadata</h5>
                                 <p className="text-[10px] text-gold-100/40 font-bold uppercase tracking-widest">Active Region: {selectedDistrict}</p>
                              </div>
                           </div>
                           <Button variant="outline" className="border-gold-400/20 text-gold-400 text-[10px] font-black uppercase tracking-widest hover:bg-gold-400/5" onClick={() => window.open('/districts.csv')}>Export Dataset</Button>
                        </div>
                      </div>
                    ) : (
                      <div className="h-64 flex items-center justify-center italic text-gold-100/20 text-xs font-bold uppercase tracking-widest">Generating optimal cultivation paths...</div>
                    )}
                  </CardContent>
                </Card>
              </div>
              </ScrollReveal>
            )}

            {/* Asset Ledger Grid */}
            <ScrollReveal direction="up" delay={0.2}>
            <div>
              <div className="flex items-center justify-between mb-8">
                 <h2 className="text-2xl font-black text-gold-100 tracking-tight flex items-center uppercase">
                    <Activity className="h-5 w-5 mr-3 text-gold-400" /> Active Asset Ledger
                 </h2>
                 <span className="text-[10px] font-black text-gold-100/30 uppercase tracking-[0.2em]">{farms.length} Registers Detected</span>
              </div>

              <StaggerContainer staggerDelay={0.1}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {farms.map((farm) => (
                  <StaggerItem key={farm.id}>
                    <Card className="card-premium group hover:scale-[1.02] transition-all duration-500 border-earth-border/50 bg-earth-elevated/30">
                      <CardHeader className="pb-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                               <h3 className="text-xl font-black text-gold-100 uppercase tracking-tighter group-hover:text-gold-400 transition-colors">{farm.name}</h3>
                               <Badge className="bg-gold-400/10 text-gold-400 border-none text-[8px] uppercase font-black">Online</Badge>
                            </div>
                            <CardDescription className="flex items-center text-[10px] font-bold text-gold-100/30 uppercase tracking-widest">
                              <MapPin className="h-3 w-3 mr-2 text-gold-400/40" />
                              {farm.location}
                            </CardDescription>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleLogWeather(farm.id)}
                              className="h-8 w-8 text-gold-100/20 hover:text-gold-400 hover:bg-gold-400/5 rounded-xl transition-all"
                            >
                              <Cloud className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(farm.id)}
                              className="h-8 w-8 text-gold-100/20 hover:text-red-400 hover:bg-red-400/5 rounded-xl transition-all"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                           <div className="p-3 bg-earth-main/50 rounded-2xl border border-earth-border">
                              <span className="text-[8px] font-black text-gold-100/20 uppercase tracking-widest block mb-1">Total Scale</span>
                              <div className="flex items-baseline gap-1">
                                 <span className="text-lg font-black text-gold-100 tracking-tighter">{farm.areaAcres || farm.area_acres || 0}</span>
                                 <span className="text-[9px] font-bold text-gold-100/40 uppercase">Acres</span>
                              </div>
                           </div>
                           <div className="p-3 bg-earth-main/50 rounded-2xl border border-earth-border">
                              <span className="text-[8px] font-black text-gold-100/20 uppercase tracking-widest block mb-1">Environment</span>
                              <div className="flex items-baseline gap-1">
                                 <span className="text-xs font-black text-gold-100 uppercase tracking-tight">{farm.soilType || farm.soil_type || 'Unknown'}</span>
                              </div>
                           </div>
                        </div>

                        <div className="flex items-center justify-between p-3 px-4 bg-gold-400/5 rounded-2xl border border-gold-400/10 group-hover:border-gold-400/30 transition-all">
                           <div className="flex items-center gap-3">
                              <Droplet className="h-4 w-4 text-gold-400/40" />
                              <span className="text-[10px] font-black text-gold-100 uppercase tracking-widest">{farm.irrigationType || farm.irrigation_type || 'Manual Protocol'}</span>
                           </div>
                           <Button 
                              variant="link" 
                              className="p-0 h-auto text-[9px] font-black text-gold-400 uppercase tracking-widest no-underline hover:text-gold-100" 
                              onClick={() => {
                                 setSelectedFarmForAnalysis(farm);
                                 setShowAnalysis(true);
                              }}
                           >
                              Initialize Intelligence
                           </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </StaggerItem>
                ))}
              </div>
              </StaggerContainer>
            </div>
            </ScrollReveal>
          </div>
        )}

        <Dialog open={showAnalysis} onOpenChange={setShowAnalysis}>
          <DialogContent className="bg-earth-main border-earth-border text-gold-100 max-w-5xl h-[90vh] overflow-y-auto custom-scrollbar">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black flex items-center">
                <Shield className="mr-2 text-gold-400" />
                Intelligence Protocol: {selectedFarmForAnalysis?.name}
              </DialogTitle>
              <DialogDescription className="text-gold-100/40 font-bold uppercase text-[10px] tracking-widest mt-2">
                Running nutrient optimization for {selectedFarmForAnalysis?.location}
              </DialogDescription>
            </DialogHeader>
            <div className="mt-6">
              <FertilizerAnalysisModule 
                farmId={selectedFarmForAnalysis?.id} 
                initialCrop={selectedFarmForAnalysis?.currentCrop || undefined}
                initialSoilType={selectedFarmForAnalysis?.soilType || undefined}
                onSaveSuccess={() => {
                  toast({ title: 'Analysis Saved', description: 'Data committed to farm ledger.' });
                  loadFarms();
                }}
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
