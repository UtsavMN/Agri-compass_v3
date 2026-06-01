import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Beaker, 
  Droplets, 
  Zap, 
  AlertTriangle, 
  Sprout, 
  CheckCircle2, 
  ArrowRight,
  Info,
  ChevronDown,
  Activity,
  History as HistoryIcon,
  Leaf,
  Plus,
  Database
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer,
} from 'recharts';
import { apiPost, apiGet } from '@/lib/httpClient';

interface AnalysisResult {
  nutrient_deficit: {
    nitrogen: number;
    phosphorus: number;
    potassium: number;
  };
  stage_application: {
    nitrogen: number;
    phosphorus: number;
    potassium: number;
  };
  fertilizer_recommendation: {
    urea: number;
    dap: number;
    mop: number;
  };
  soil_health_score: number;
  warnings: string[];
  explanations: string[];
  stage_weights: Record<string, number>;
}

export default function FertilizerAnalysisModule({ 
  farmId, 
  initialCrop, 
  initialSoilType,
  onSaveSuccess
}: { 
  farmId?: string; 
  initialCrop?: string; 
  initialSoilType?: string;
  onSaveSuccess?: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [crops, setCrops] = useState<string[]>(['Rice', 'Maize', 'Tomato', 'Wheat', 'Cotton']);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  
  const [history, setHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const [formData, setFormData] = useState({
    crop: initialCrop?.toLowerCase() || 'rice',
    soil_n: 20,
    soil_p: 15,
    soil_k: 15,
    soil_level: 'medium',
    soil_ph: 'neutral',
    growth_stage: 'basal'
  });

  useEffect(() => {
    if (farmId) fetchHistory();
  }, [farmId]);

  const fetchHistory = async () => {
    try {
      const data = await apiGet(`/api/fertilizer/history/${farmId}`);
      setHistory(data || []);
    } catch (e) {
      console.error('History fetch failed');
    }
  };

  const handleReset = () => {
    setResult(null);
    setFormData({
      crop: initialCrop?.toLowerCase() || 'rice',
      soil_n: 20,
      soil_p: 15,
      soil_k: 15,
      soil_level: 'medium',
      soil_ph: 'neutral',
      growth_stage: 'basal'
    });
  };

  useEffect(() => {
    const fetchCrops = async () => {
        try {
            const data = await apiGet('/api/crops');
            if (data && data.length > 0) {
                setCrops(data.map((c: any) => c.name));
            }
        } catch (e) {
            console.warn('Using fallback crop list');
        }
    };
    fetchCrops();
  }, []);

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const response = await apiPost('/api/fertilizer/analyze', formData);
      setResult(response);
    } catch (error) {
      console.error('Analysis failed', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!farmId || !result) return;
    setSaving(true);
    try {
      await apiPost('/api/fertilizer/save', {
        ...formData,
        farmId,
        result
      });
      fetchHistory();
      if (onSaveSuccess) onSaveSuccess();
    } catch (error) {
      console.error('Save failed', error);
    } finally {
      setSaving(false);
    }
  };

  const scoreData = result ? [
    { name: 'Health', value: result.soil_health_score ?? 100 },
    { name: 'Deficit', value: 100 - (result.soil_health_score ?? 100) }
  ] : [];

  const COLORS = ['#C6A96B', '#1B211F'];

  return (
    <div className="space-y-8">
      <Card className="card-premium overflow-hidden border-none shadow-premium bg-earth-elevated/40">
        <CardHeader className="bg-gold-400/5 p-6 border-b border-gold-400/10">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-gold-100 font-black tracking-tight flex items-center text-xl uppercase">
                <Beaker className="h-5 w-5 mr-3 text-gold-400" />
                Fertilizer Intelligence System
              </CardTitle>
              <CardDescription className="text-gold-100/40 font-bold uppercase text-[10px] tracking-widest mt-1">
                Advanced Nutrient Optimization & Soil Health Analytics
              </CardDescription>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleReset}
                className="text-gold-100/40 hover:text-gold-100 text-[10px] font-black uppercase tracking-widest"
              >
                <Plus className="h-4 w-4 mr-2" /> Add New Test
              </Button>
              {history.length > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowHistory(!showHistory)}
                  className={`text-[10px] font-black uppercase tracking-widest ${showHistory ? 'text-gold-400' : 'text-gold-400/60 hover:text-gold-400'}`}
                >
                  <HistoryIcon className="h-4 w-4 mr-2" /> {showHistory ? 'Close History' : 'View Ledger'}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <AnimatePresence>
            {showHistory && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden mb-8 border-b border-earth-border pb-8"
              >
                <h6 className="text-[10px] font-black uppercase tracking-widest text-gold-100/40 mb-4">Historical Data Ledger</h6>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {history.map((h, i) => {
                    const res = JSON.parse(h.resultJson);
                    return (
                      <div 
                        key={i} 
                        className="p-4 bg-earth-main/50 rounded-2xl border border-earth-border cursor-pointer hover:border-gold-400/30 transition-all"
                        onClick={() => {
                          setResult(res);
                          setFormData({
                            crop: h.crop,
                            soil_n: h.soilN,
                            soil_p: h.soilP,
                            soil_k: h.soilK,
                            soil_level: h.soilLevel,
                            soil_ph: h.soilPh,
                            growth_stage: h.growthStage
                          });
                          setShowHistory(false);
                        }}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-xs font-black text-gold-100 uppercase tracking-tight">{h.crop}</span>
                          <span className="text-[8px] font-bold text-gold-100/30 uppercase">{new Date(h.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex gap-4">
                           <div className="text-center flex-1">
                              <div className="text-sm font-black text-gold-400">{res.soil_health_score}</div>
                              <div className="text-[8px] font-black text-gold-100/20 uppercase">Score</div>
                           </div>
                           <div className="text-center flex-1">
                              <div className="text-sm font-black text-gold-100">{h.soilPh}</div>
                              <div className="text-[8px] font-black text-gold-100/20 uppercase">pH</div>
                           </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-gold-100/40">Select Crop Protocol</Label>
                <Select 
                  value={formData.crop} 
                  onValueChange={(v) => setFormData({ ...formData, crop: v })}
                >
                  <SelectTrigger className="bg-earth-main border-earth-border text-gold-100 rounded-xl h-12">
                    <SelectValue placeholder="Crop" />
                  </SelectTrigger>
                  <SelectContent className="bg-earth-elevated border-earth-border">
                    {crops.map(c => (
                      <SelectItem key={c} value={c.toLowerCase()} className="text-gold-100 uppercase text-[10px] font-bold">{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-gold-100/40">Growth Stage</Label>
                <Select 
                  value={formData.growth_stage} 
                  onValueChange={(v) => setFormData({ ...formData, growth_stage: v })}
                >
                  <SelectTrigger className="bg-earth-main border-earth-border text-gold-100 rounded-xl h-12">
                    <SelectValue placeholder="Stage" />
                  </SelectTrigger>
                  <SelectContent className="bg-earth-elevated border-earth-border">
                    <SelectItem value="basal" className="text-gold-100 uppercase text-[10px] font-bold">Basal (Planting)</SelectItem>
                    <SelectItem value="tillering" className="text-gold-100 uppercase text-[10px] font-bold">Tillering / Vegetative</SelectItem>
                    <SelectItem value="flowering" className="text-gold-100 uppercase text-[10px] font-bold">Flowering / Reprod.</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="lg:col-span-2 grid grid-cols-3 gap-4">
               <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-gold-100/40">Nitrogen (N)</Label>
                  <div className="relative">
                    <Input 
                      type="number" 
                      value={formData.soil_n} 
                      onChange={(e) => setFormData({...formData, soil_n: Number(e.target.value)})}
                      className="bg-earth-main border-earth-border focus:border-gold-400 text-gold-100 rounded-xl h-12 pl-4 pr-10"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-black text-gold-400 opacity-40">KG/A</span>
                  </div>
               </div>
               <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-gold-100/40">Phosphorus (P)</Label>
                  <div className="relative">
                    <Input 
                      type="number" 
                      value={formData.soil_p} 
                      onChange={(e) => setFormData({...formData, soil_p: Number(e.target.value)})}
                      className="bg-earth-main border-earth-border focus:border-gold-400 text-gold-100 rounded-xl h-12 pl-4 pr-10"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-black text-gold-400 opacity-40">KG/A</span>
                  </div>
               </div>
               <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-gold-100/40">Potassium (K)</Label>
                  <div className="relative">
                    <Input 
                      type="number" 
                      value={formData.soil_k} 
                      onChange={(e) => setFormData({...formData, soil_k: Number(e.target.value)})}
                      className="bg-earth-main border-earth-border focus:border-gold-400 text-gold-100 rounded-xl h-12 pl-4 pr-10"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-black text-gold-400 opacity-40">KG/A</span>
                  </div>
               </div>
            </div>

            <div className="space-y-6">
               <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-gold-100/40">Soil Fertility</Label>
                  <Select value={formData.soil_level} onValueChange={(v) => setFormData({ ...formData, soil_level: v })}>
                    <SelectTrigger className="bg-earth-main border-earth-border text-gold-100 rounded-xl h-12">
                      <SelectValue placeholder="Level" />
                    </SelectTrigger>
                    <SelectContent className="bg-earth-elevated border-earth-border">
                      <SelectItem value="low" className="text-gold-100 uppercase text-[10px] font-bold">Low Fertility</SelectItem>
                      <SelectItem value="medium" className="text-gold-100 uppercase text-[10px] font-bold">Medium Fertility</SelectItem>
                      <SelectItem value="high" className="text-gold-100 uppercase text-[10px] font-bold">High Fertility</SelectItem>
                    </SelectContent>
                  </Select>
               </div>
               <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-gold-100/40">pH Level</Label>
                  <Select value={formData.soil_ph} onValueChange={(v) => setFormData({ ...formData, soil_ph: v })}>
                    <SelectTrigger className="bg-earth-main border-earth-border text-gold-100 rounded-xl h-12">
                      <SelectValue placeholder="pH" />
                    </SelectTrigger>
                    <SelectContent className="bg-earth-elevated border-earth-border">
                      <SelectItem value="acidic" className="text-gold-100 uppercase text-[10px] font-bold">Acidic (&lt; 6.5)</SelectItem>
                      <SelectItem value="neutral" className="text-gold-100 uppercase text-[10px] font-bold">Neutral (6.5 - 7.5)</SelectItem>
                      <SelectItem value="alkaline" className="text-gold-100 uppercase text-[10px] font-bold">Alkaline (&gt; 7.5)</SelectItem>
                    </SelectContent>
                  </Select>
               </div>
            </div>
          </div>

          <Button 
            onClick={handleAnalyze} 
            disabled={loading}
            className="btn-gold w-full h-16 mt-12 text-xs font-black uppercase tracking-[0.3em] shadow-gold-glow group"
          >
            {loading ? (
              <Activity className="h-5 w-5 animate-spin" />
            ) : (
              <>
                Initialize Optimization Sequence
                <ArrowRight className="ml-3 h-4 w-4 group-hover:translate-x-2 transition-transform" />
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            <div className="lg:col-span-2 space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {[
                  { label: 'Nitrogen', value: result.nutrient_deficit?.nitrogen ?? 0, color: 'text-blue-400', symbol: 'N' },
                  { label: 'Phosphorus', value: result.nutrient_deficit?.phosphorus ?? 0, color: 'text-purple-400', symbol: 'P' },
                  { label: 'Potassium', value: result.nutrient_deficit?.potassium ?? 0, color: 'text-orange-400', symbol: 'K' },
                ].map((item, idx) => (
                  <Card key={idx} className="bg-earth-elevated/40 border-earth-border/50 overflow-hidden relative group hover:border-gold-400/30 transition-all">
                    <div className="absolute -right-4 -top-4 text-6xl font-black text-gold-100/5 group-hover:text-gold-100/10 transition-colors select-none">{item.symbol}</div>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-[10px] font-black uppercase tracking-widest text-gold-100/40">{item.label} Deficit</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-baseline gap-2">
                        <span className={`text-4xl font-black tracking-tighter ${item.color}`}>{Math.round(item.value)}</span>
                        <span className="text-xs font-bold text-gold-100/30 uppercase">kg/acre</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="bg-gold-400/5 border-gold-400/20">
                <CardHeader>
                  <CardTitle className="text-gold-100 font-black tracking-tight flex items-center text-lg uppercase">
                    <Zap className="h-5 w-5 mr-3 text-gold-400" />
                    Recommended Fertilizer Quantities
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                    {[
                      { name: 'Urea', val: result.fertilizer_recommendation?.urea ?? 0, desc: 'Nitrogen Source' },
                      { name: 'DAP', val: result.fertilizer_recommendation?.dap ?? 0, desc: 'Phosphorus Source' },
                      { name: 'MOP', val: result.fertilizer_recommendation?.mop ?? 0, desc: 'Potassium Source' },
                    ].map((f, i) => (
                      <div key={i} className="flex flex-col items-center text-center p-6 bg-earth-main/50 rounded-[2rem] border border-earth-border">
                        <span className="text-3xl font-black text-gold-100 tracking-tighter">{f.val} <span className="text-sm font-normal text-gold-100/40">kg</span></span>
                        <h5 className="text-xs font-black uppercase tracking-widest text-gold-400 mt-2">{f.name}</h5>
                        <p className="text-[10px] text-gold-100/30 uppercase mt-1 font-bold">{f.desc}</p>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 bg-gold-400/10 rounded-2xl border border-gold-400/20 flex items-start gap-4">
                    <Info className="h-5 w-5 text-gold-400 shrink-0 mt-0.5" />
                    <div>
                      <h6 className="text-xs font-black text-gold-400 uppercase tracking-widest mb-2">Strategy Insights</h6>
                      <ul className="space-y-2">
                        {(result.explanations || []).map((exp, i) => (
                          <li key={i} className="text-xs text-gold-100/70 italic flex items-center gap-2">
                            <div className="w-1 h-1 bg-gold-400 rounded-full" />
                            {exp}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {farmId && (
                    <Button 
                      onClick={handleSave} 
                      disabled={saving}
                      className="w-full bg-gold-400/20 border border-gold-400/30 text-gold-400 hover:bg-gold-400/30 h-12 rounded-xl font-bold uppercase tracking-widest text-[10px]"
                    >
                      {saving ? <Activity className="h-4 w-4 animate-spin mr-2" /> : <Database className="h-4 w-4 mr-2" />}
                      Save to Farm Ledger
                    </Button>
                  )}
                </CardContent>
              </Card>

              {result.warnings && result.warnings.length > 0 && (
                <div className="grid grid-cols-1 gap-4">
                  {result.warnings.map((w, i) => (
                    <div key={i} className="p-4 bg-red-400/5 border border-red-400/20 rounded-2xl flex items-center gap-4">
                      <AlertTriangle className="h-5 w-5 text-red-400" />
                      <span className="text-sm text-red-400/80 font-medium italic">"{w}"</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-8">
              <Card className="card-premium border-none shadow-premium bg-earth-elevated/40 flex flex-col items-center p-8">
                <CardHeader className="text-center p-0 mb-6">
                  <CardTitle className="text-[10px] font-black uppercase tracking-widest text-gold-100/40">Soil Health Vitality Score</CardTitle>
                </CardHeader>
                <div className="relative w-48 h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={scoreData}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        startAngle={90}
                        endAngle={-270}
                      >
                        {scoreData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-5xl font-black text-gold-100 tracking-tighter">{result.soil_health_score ?? 100}</span>
                    <span className="text-[10px] font-black text-gold-400 uppercase tracking-widest">Index</span>
                  </div>
                </div>
                <div className="mt-8 grid grid-cols-2 gap-8 w-full border-t border-earth-border pt-6">
                   <div className="text-center">
                      <div className="text-lg font-bold text-gold-100">72%</div>
                      <div className="text-[9px] font-black text-gold-100/30 uppercase tracking-widest">Balance</div>
                   </div>
                   <div className="text-center">
                      <div className="text-lg font-bold text-gold-100">Good</div>
                      <div className="text-[9px] font-black text-gold-100/30 uppercase tracking-widest">Condition</div>
                   </div>
                </div>
              </Card>

              <Card className="card-premium border-none shadow-premium bg-earth-elevated/40 p-8">
                 <CardHeader className="p-0 mb-8">
                    <CardTitle className="text-[10px] font-black uppercase tracking-widest text-gold-100/40 flex items-center">
                       <HistoryIcon className="h-4 w-4 mr-2" /> Application Timeline
                    </CardTitle>
                 </CardHeader>
                 <div className="space-y-8 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[1px] before:bg-earth-border/50">
                    {[
                      { stage: 'Basal', weight: result.stage_weights?.basal ?? 0.4, current: formData.growth_stage === 'basal' },
                      { stage: 'Tillering', weight: result.stage_weights?.tillering ?? 0.3, current: formData.growth_stage === 'tillering' },
                      { stage: 'Flowering', weight: result.stage_weights?.flowering ?? 0.3, current: formData.growth_stage === 'flowering' },
                    ].map((s, i) => (
                      <div key={i} className={`flex gap-6 relative transition-all duration-500 ${s.current ? 'translate-x-2' : 'opacity-40'}`}>
                        <div className={`w-6 h-6 rounded-full border-2 z-10 flex items-center justify-center shrink-0 ${s.current ? 'bg-gold-400 border-gold-400 text-earth-main' : 'bg-earth-main border-earth-border text-gold-100/20'}`}>
                           {s.current ? <CheckCircle2 className="h-3 w-3" strokeWidth={4} /> : <div className="w-1.5 h-1.5 bg-current rounded-full" />}
                        </div>
                        <div>
                           <h6 className={`text-xs font-black uppercase tracking-widest ${s.current ? 'text-gold-100' : 'text-gold-100/40'}`}>{s.stage} Stage</h6>
                           <p className="text-[10px] font-bold text-gold-400 mt-1">{((s.weight) || 0) * 100}% Allocation</p>
                        </div>
                      </div>
                    ))}
                 </div>
              </Card>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
