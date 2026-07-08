import { useState, useEffect } from 'react';

import { useUser } from '@/store';
import { loadDistrictDataFromCSV } from '@/lib/csvLoader';
import { FarmsAPI, type Farm } from '@/lib/api/farms';
import { cropRecommender } from '@/lib/ai/cropRecommender';
import { SeasonAdvisoryCard } from '@/components/farm/SeasonAdvisoryCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/components/ui/animations';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { useDistrict } from '@/store';
import { useLanguage } from '@/contexts/LanguageContext';
import { DISTRICTS } from '@/data/masterData';
import { Plus, Sprout, MapPin,  Droplet, Trash2,     Shield, Activity, Database,  Sparkles, Pencil } from 'lucide-react';
import FertilizerAnalysisModule from '@/components/features/FertilizerAnalysisModule';
import { SoilAnalysisContent } from '@/pages/SoilAnalysis';
import { EmptyState } from '@/components/ui/EmptyState';

// Local types for UI specific state if needed, but we use the API Farm type



interface CropRecommendation {
  cropName: string;
  reason: string;
  season: string;
  expectedYield: string;
}

export default function MyFarm() {
  const { user, profile } = useUser();
  const { toast } = useToast();
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { language } = useLanguage();
  const _isKannada = language === 'kn';
  const { selectedDistrict, setSelectedDistrict } = useDistrict();
  const [_districts, setDistricts] = useState<string[]>([]);
  const [_districtData, setDistrictData] = useState<any[]>([]);

  const [cropRecommendations, setCropRecommendations] = useState<CropRecommendation[]>([]);
  const [selectedFarmForAnalysis, setSelectedFarmForAnalysis] = useState<Farm | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [activeTab, setActiveTab] = useState<'farms' | 'soil-ai'>('farms');
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    area_acres: '',
    soil_type: '',
    irrigation_type: '',
    current_crop: '',
  });
  const [editingFarmId, setEditingFarmId] = useState<string | null>(null);

  const handleOpenAddDialog = () => {
    setEditingFarmId(null);
    setFormData({
      name: '',
      location: '',
      area_acres: '',
      soil_type: '',
      irrigation_type: '',
      current_crop: '',
    });
    setDialogOpen(true);
  };

  const handleEditClick = (farm: Farm) => {
    setEditingFarmId(farm.id);
    setFormData({
      name: farm.name,
      location: farm.location,
      area_acres: String(farm.area_acres),
      soil_type: farm.soil_type || 'General',
      irrigation_type: farm.irrigation_type || 'Standard',
      current_crop: farm.current_crop || 'Rice',
    });
    setDialogOpen(true);
  };

  useEffect(() => {
    if (user) {
      initializePage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }
  }, [user]);

  useEffect(() => {
    if (selectedDistrict) {
      loadDistrictData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }
  }, [selectedDistrict]);

  // loadDistrictDataFromCSV is imported from @/lib/csvLoader

  const initializePage = async () => {
    try {
      setLoading(true);
      const [loadedDistrictData] = await Promise.all([
        loadDistrictDataFromCSV().then(data => {
          setDistrictData(data);
          setDistricts(data.map(d => d.district));
          return data;
        }),
        loadFarms()
      ]);
      
      if (!selectedDistrict) {
        const defaultDistrict = profile?.location || profile?.district || loadedDistrictData[0]?.district || '';
        setSelectedDistrict(defaultDistrict);
      }
    } catch (error) {
      console.error('Error initializing page:', error);
    } finally {
      setLoading(false);
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
        title: 'Connection error',
        description: err.message ?? 'Could not load farm details.',
        variant: 'destructive',
      });
    }
    // Removed finally { setLoading(false) } since initializePage handles it
  };

  const loadDistrictData = async () => {
    if (!selectedDistrict) return;
    try {
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
        toast({ title: 'Invalid Area', description: 'Please enter a numeric value for farm size.', variant: 'destructive' });
        return;
      }

      const farmPayload = {
        user_id: user.id,
        name: formData.name,
        location: formData.location || selectedDistrict,
        area_acres: areaAcres,
        soil_type: formData.soil_type || 'General',
        irrigation_type: formData.irrigation_type || 'Standard',
        current_crop: formData.current_crop || 'Rice',
      };

      if (editingFarmId) {
        await FarmsAPI.updateFarm(editingFarmId, farmPayload);
        toast({
          title: 'Farm Updated',
          description: 'Your farm details have been updated.',
        });
      } else {
        await FarmsAPI.createFarm(farmPayload);
        toast({
          title: 'Farm added',
          description: 'New farm has been added to your profile.',
        });
      }

      setDialogOpen(false);
      setEditingFarmId(null);
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
        title: editingFarmId ? 'Update Failed' : 'Could not add farm',
        description: err.message ?? 'Connection error.',
        variant: 'destructive',
      });
    }
  };



  const handleDelete = async (farmId: string) => {
    if (!confirm('Are you sure you want to remove this farm?')) return;
    try {
      await FarmsAPI.deleteFarm(farmId);
      toast({
        title: 'Farm removed',
        description: 'Farm has been removed.',
      });
      loadFarms();
    } catch (error) {
      const err = error as { message?: string };
      toast({
        title: 'Could not remove farm',
        description: err.message ?? 'Could not remove farm. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (!user) {
    return (
      <div className="pt-24 px-4 sm:px-6 lg:px-8 pb-12 max-w-7xl mx-auto animate-fade-in">
        <div className="text-center py-24">
          <p className="text-gold-100/40 font-medium italic">Please sign in to access your farms.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 px-4 sm:px-6 lg:px-8 pb-12 w-full mx-auto animate-fade-in">
      <div className="space-y-12 pb-12 w-full mx-auto">
        <ScrollReveal>
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <h1 className="text-4xl font-black text-gold-100 tracking-tight">My Farms</h1>
              <p className="text-gold-100/40 text-sm font-bold uppercase tracking-[0.2em] mt-1">Manage your farms and soil details</p>
            </div>

            {activeTab === 'farms' && (
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-3 bg-earth-elevated/50 p-2 px-4 rounded-2xl border border-earth-border">
                  <MapPin className="h-4 w-4 text-gold-400/60" />
                  <span className="text-gold-100 font-bold text-sm tracking-widest uppercase">{selectedDistrict || 'NO DISTRICT SELECTED'}</span>
                </div>

                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <Button onClick={handleOpenAddDialog} className="btn-gold h-12 px-8 shadow-gold-glow">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Farm
                  </Button>
                  <DialogContent className="bg-earth-elevated border-earth-border text-gold-100 max-w-md">
                    <DialogHeader>
                      <DialogTitle className="text-2xl font-black">
                        {editingFarmId ? 'Edit Farm Details' : 'Add New Farm'}
                      </DialogTitle>
                      <DialogDescription className="text-gold-100/40 font-bold uppercase text-[10px] tracking-widest mt-2">
                        {editingFarmId ? 'Modify land details and crop information' : 'Enter land details and crop information'}
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-gold-100/40">Farm Name</Label>
                        <Input
                          placeholder="e.g. Uttara Farm"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="bg-earth-main border-earth-border focus-visible:ring-gold-400 text-gold-100 rounded-xl h-11"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-gold-100/40">Location / District</Label>
                         <Select
                           value={formData.location}
                           onValueChange={(val) => setFormData({ ...formData, location: val })}
                         >
                           <SelectTrigger className="bg-earth-main border-earth-border focus:ring-gold-400 text-gold-100 rounded-xl h-11 uppercase text-[11px] font-bold tracking-widest notranslate" translate="no">
                             <SelectValue placeholder="Select District" />
                           </SelectTrigger>
                           <SelectContent className="bg-earth-elevated border-earth-border max-h-[300px] notranslate" translate="no">
                             {Object.keys(DISTRICTS).map((d) => (
                               <SelectItem key={d} value={d}>
                                 {d}
                               </SelectItem>
                             ))}
                           </SelectContent>
                         </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-gold-100/40">Farm Size (Acres)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="10.00"
                          value={formData.area_acres}
                          onChange={(e) => setFormData({ ...formData, area_acres: e.target.value })}
                          className="bg-earth-main border-earth-border focus-visible:ring-gold-400 text-gold-100 rounded-xl h-11"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-gold-100/40">Current Crop</Label>
                        <Select value={formData.current_crop} onValueChange={(v) => setFormData({ ...formData, current_crop: v })}>
                          <SelectTrigger className="bg-earth-main border-earth-border text-gold-100 rounded-xl h-11">
                            <SelectValue placeholder="Select Crop" />
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
                          <Label className="text-[10px] font-black uppercase tracking-widest text-gold-100/40">Soil Type</Label>
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
                          <Label className="text-[10px] font-black uppercase tracking-widest text-gold-100/40">Irrigation Type</Label>
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
                          Cancel
                        </Button>
                        <Button type="submit" className="btn-gold px-8">
                          {editingFarmId ? 'Save Changes' : 'Add Farm'}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </div>
        </ScrollReveal>

        {/* Navigation Tabs */}
        <div className="flex border-b border-earth-border/60 gap-8 mb-8 no-print">
          <button
            onClick={() => setActiveTab('farms')}
            className={`pb-4 text-sm font-black uppercase tracking-widest border-b-2 transition-all relative ${
              activeTab === 'farms' ? 'text-gold-400 border-gold-400' : 'text-gold-100/40 border-transparent hover:text-gold-100'
            }`}
          >
            <div className="flex items-center gap-2">
              <Sprout className="h-4 w-4" />
              Farm Details
            </div>
          </button>
          <button
            onClick={() => setActiveTab('soil-ai')}
            className={`pb-4 text-sm font-black uppercase tracking-widest border-b-2 transition-all relative ${
              activeTab === 'soil-ai' ? 'text-gold-400 border-gold-400' : 'text-gold-100/40 border-transparent hover:text-gold-100'
            }`}
          >
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Soil AI Diagnostics
            </div>
          </button>
        </div>

        {activeTab === 'farms' ? (
          loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => <div key={i} className="h-64 bg-earth-elevated/40 rounded-[2rem] animate-pulse border border-earth-border" />)}
            </div>
          ) : farms.length === 0 ? (
            <ScrollReveal direction="up">
              <EmptyState
                icon={Sprout}
                title="No Farms Found"
                description="You haven't added any farms yet. Add your first farm to manage soil details and recommendations."
                action={{
                  label: "Add Farm",
                  onClick: handleOpenAddDialog
                }}
              />
            </ScrollReveal>
          ) : (
            <div className="space-y-16">
              {/* Environmental Intelligence Section */}
              {selectedDistrict && (
                <ScrollReveal direction="up" delay={0.1}>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <SeasonAdvisoryCard district={selectedDistrict} />

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
                                className={`p-6 md:p-7 bg-earth-main/30 rounded-[2rem] border border-earth-border group hover:border-gold-400/30 transition-all duration-500 min-h-[12rem] ${cropRecommendations.length === 1 ? 'md:col-span-2' : ''}`}
                              >
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-5">
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

                                <div className="grid grid-cols-2 gap-5 pt-5 pb-1 border-t border-earth-border/50">
                                  <div className="min-w-0">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-gold-100/30 block mb-2">Target Yield</span>
                                    <p className="text-sm font-black text-gold-400 break-words leading-snug">{rec.expectedYield}</p>
                                  </div>
                                  <div>
                                    <span className="text-[9px] font-black uppercase tracking-widest text-gold-100/30">District Compatibility</span>
                                    <div className="flex gap-1 mt-1.5">
                                      {[1, 2, 3, 4, 5].map(i => <div key={i} className={`h-1 flex-1 rounded-full ${i <= 4 ? 'bg-gold-400' : 'bg-gold-400/10'}`} />)}
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            ))}

                            <div className="md:col-span-2 p-6 bg-gold-400/5 rounded-[2rem] border border-gold-400/10 flex items-center gap-4">
                              <div className="p-3 bg-earth-main rounded-2xl border border-gold-400/20">
                                <Database className="text-gold-400 h-5 w-5" />
                              </div>
                              <div>
                                <h5 className="font-black text-gold-100 uppercase tracking-tight text-sm">District Metadata</h5>
                                <p className="text-[10px] text-gold-100/40 font-bold uppercase tracking-widest">Active Region: {selectedDistrict}</p>
                              </div>
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
                      <Activity className="h-5 w-5 mr-3 text-gold-400" /> My Farms
                    </h2>
                    <span className="text-[10px] font-black text-gold-100/30 uppercase tracking-[0.2em]">{farms.length} Farms</span>
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
                                    <Badge className="bg-gold-400/10 text-gold-400 border-none text-[8px] uppercase font-black">Active</Badge>
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
                                    onClick={() => handleEditClick(farm)}
                                    className="h-8 w-8 text-gold-100/20 hover:text-gold-400 hover:bg-gold-400/5 rounded-xl transition-all"
                                  >
                                    <Pencil className="h-4 w-4" />
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
                                  <span className="text-[8px] font-black text-gold-100/20 uppercase tracking-widest block mb-1">Size</span>
                                  <div className="flex items-baseline gap-1">
                                    <span className="text-lg font-black text-gold-100 tracking-tighter">{farm.area_acres || 0}</span>
                                    <span className="text-[9px] font-bold text-gold-100/40 uppercase">Acres</span>
                                  </div>
                                </div>
                                <div className="p-3 bg-earth-main/50 rounded-2xl border border-earth-border">
                                  <span className="text-[8px] font-black text-gold-100/20 uppercase tracking-widest block mb-1">Soil Type</span>
                                  <div className="flex items-baseline gap-1">
                                    <span className="text-xs font-black text-gold-100 uppercase tracking-tight">{farm.soil_type || 'General'}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center justify-between p-3 px-4 bg-gold-400/5 rounded-2xl border border-gold-400/10 group-hover:border-gold-400/30 transition-all">
                                <div className="flex items-center gap-3">
                                  <Droplet className="h-4 w-4 text-gold-400/40" />
                                  <span className="text-[10px] font-black text-gold-100 uppercase tracking-widest">{farm.irrigation_type || 'Rain Fed'}</span>
                                </div>
                                <Button
                                  variant="link"
                                  className="p-0 h-auto text-[9px] font-black text-gold-400 uppercase tracking-widest no-underline hover:text-gold-100"
                                  onClick={() => {
                                    setSelectedFarmForAnalysis(farm);
                                    setShowAnalysis(true);
                                  }}
                                >
                                  AI Soil Advisory
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
          )
        ) : (
          <SoilAnalysisContent />
        )}

        <Dialog open={showAnalysis} onOpenChange={setShowAnalysis}>
          <DialogContent className="bg-earth-main border-earth-border text-gold-100 max-w-5xl h-[90vh] overflow-y-auto custom-scrollbar">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black flex items-center">
                <Shield className="mr-2 text-gold-400" />
                AI Soil Advisory: {selectedFarmForAnalysis?.name}
              </DialogTitle>
              <DialogDescription className="text-gold-100/40 font-bold uppercase text-[10px] tracking-widest mt-2">
                Soil details and crop advice for {selectedFarmForAnalysis?.location}
              </DialogDescription>
            </DialogHeader>
            <div className="mt-6">
              <FertilizerAnalysisModule
                farmId={selectedFarmForAnalysis?.id}
                initialCrop={selectedFarmForAnalysis?.current_crop || undefined}
                initialSoilType={selectedFarmForAnalysis?.soil_type || undefined}
                onSaveSuccess={() => {
                  toast({ title: 'Analysis Saved', description: 'Data committed to farm ledger.' });
                  loadFarms();
                }}
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

