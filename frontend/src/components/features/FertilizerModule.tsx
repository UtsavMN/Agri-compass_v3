import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiPost } from '@/lib/httpClient';
import { Activity, AlertTriangle, CheckCircle, Sprout, TestTube, ThermometerSun, Zap, Beaker } from 'lucide-react';
import { ScrollReveal } from '@/components/ui/animations';
import { Badge } from '@/components/ui/badge';

interface FertilizerModuleProps {
  cropName: string;
}

export default function FertilizerModule({ cropName }: FertilizerModuleProps) {
  const [soilN, setSoilN] = useState<string>('');
  const [soilP, setSoilP] = useState<string>('');
  const [soilK, setSoilK] = useState<string>('');
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!soilN || !soilP || !soilK) {
      setError("Please fill all soil test values.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await apiPost('/api/fertilizer/recommend', {
        crop: cropName,
        soil_n: parseFloat(soilN),
        soil_p: parseFloat(soilP),
        soil_k: parseFloat(soilK)
      });
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Could not calculate recommendations for this crop. Data might not be available in the dataset.");
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 mt-12 pb-8">
      <Card className="card-premium overflow-hidden border-none shadow-premium">
        <CardHeader className="bg-earth-elevated/50 border-b border-earth-border px-8 py-6">
          <CardTitle className="flex items-center text-2xl text-gold-100 font-black tracking-tight">
            <TestTube className="mr-3 h-7 w-7 text-gold-400" /> Fertilizer Optimization AI
          </CardTitle>
          <CardDescription className="text-gold-100/40 font-medium">
            Enter your soil test results (kg/acre) to generate a mathematically optimized fertilization strategy for {cropName}.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handleCalculate} className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
            <div className="space-y-3">
              <Label htmlFor="soil_n" className="text-gold-100/60 font-bold uppercase tracking-widest text-[10px]">Soil Nitrogen (N)</Label>
              <Input 
                id="soil_n" 
                type="number" 
                step="0.1" 
                placeholder="kg/acre" 
                value={soilN} 
                onChange={(e) => setSoilN(e.target.value)} 
                className="bg-earth-main border-earth-border focus:border-gold-400 text-gold-100 h-12 rounded-xl"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="soil_p" className="text-gold-100/60 font-bold uppercase tracking-widest text-[10px]">Soil Phosphorus (P)</Label>
              <Input 
                id="soil_p" 
                type="number" 
                step="0.1" 
                placeholder="kg/acre" 
                value={soilP} 
                onChange={(e) => setSoilP(e.target.value)} 
                className="bg-earth-main border-earth-border focus:border-gold-400 text-gold-100 h-12 rounded-xl"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="soil_k" className="text-gold-100/60 font-bold uppercase tracking-widest text-[10px]">Soil Potassium (K)</Label>
              <Input 
                id="soil_k" 
                type="number" 
                step="0.1" 
                placeholder="kg/acre" 
                value={soilK} 
                onChange={(e) => setSoilK(e.target.value)} 
                className="bg-earth-main border-earth-border focus:border-gold-400 text-gold-100 h-12 rounded-xl"
              />
            </div>
            <Button type="submit" disabled={loading} className="btn-gold w-full h-12 shadow-gold-glow">
              {loading ? (
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 animate-spin" />
                  Processing...
                </div>
              ) : 'Optimize Yield'}
            </Button>
          </form>

          {error && (
            <div className="p-4 bg-red-400/10 text-red-400 rounded-xl flex items-start mt-6 border border-red-400/20">
              <AlertTriangle className="h-5 w-5 mr-3 shrink-0 mt-0.5" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {result && (
        <ScrollReveal>
          <div className="space-y-8">
            {/* Warnings */}
            {result.warnings && result.warnings.length > 0 && (
              <div className="p-5 bg-gold-400/5 text-gold-400 rounded-2xl border border-gold-400/10">
                <h4 className="font-black uppercase tracking-widest text-xs flex items-center mb-3">
                  <AlertTriangle className="h-4 w-4 mr-2" /> Nutrient Alerts
                </h4>
                <ul className="space-y-2">
                  {result.warnings.map((w: string, idx: number) => (
                    <li key={idx} className="text-sm font-medium italic opacity-80 flex items-center gap-2">
                       <span className="w-1 h-1 bg-gold-400 rounded-full"></span>
                       {w}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Nutrient Deficits */}
              <Card className="card-premium">
                <CardHeader className="border-b border-earth-border/50">
                  <CardTitle className="text-lg flex items-center text-gold-100 font-black tracking-tight">
                    <Activity className="h-5 w-5 mr-3 text-gold-400" /> Physiological Deficits
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-8 space-y-4">
                  {[
                    { label: 'Nitrogen (N)', val: result.recommended_n, icon: 'N' },
                    { label: 'Phosphorus (P)', val: result.recommended_p, icon: 'P' },
                    { label: 'Potassium (K)', val: result.recommended_k, icon: 'K' }
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between items-center p-4 bg-earth-elevated rounded-2xl border border-earth-border">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gold-400/5 flex items-center justify-center text-gold-400 font-black text-xs border border-gold-400/10">{item.icon}</div>
                        <span className="font-bold text-gold-100/70 text-sm tracking-tight">{item.label}</span>
                      </div>
                      <span className="text-2xl font-black text-red-400 tracking-tighter">{item.val} <span className="text-[10px] font-medium text-gold-100/30 ml-0.5">kg</span></span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Fertilizer Recommendation */}
              <Card className="bg-gradient-to-br from-gold-400 to-gold-600 text-earth-main border-none shadow-gold-glow flex flex-col h-full">
                <CardHeader className="border-b border-earth-main/10">
                  <CardTitle className="text-lg flex items-center font-black tracking-tight text-earth-main">
                    <CheckCircle className="h-5 w-5 mr-3" /> Input Requirements
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-8 space-y-4 flex-1 flex flex-col justify-center">
                  {[
                    { label: 'Urea (46% N)', val: result.recommended_urea_kg },
                    { label: 'DAP (18% N, 46% P)', val: result.recommended_dap_kg },
                    { label: 'MOP (60% K)', val: result.recommended_mop_kg }
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between items-center p-4 bg-earth-main/5 rounded-2xl border border-earth-main/5">
                      <span className="font-black uppercase tracking-tighter text-xs opacity-70">{item.label}</span>
                      <span className="text-2xl font-black tracking-tighter">{item.val} <span className="text-xs">kg</span></span>
                    </div>
                  ))}
                  <p className="text-[10px] mt-4 opacity-50 font-bold uppercase tracking-widest text-center">
                    Precision calculated for 1.0 Acre
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Growing Steps */}
            {result.growing_steps && result.growing_steps.length > 0 && (
              <Card className="card-premium">
                <CardHeader className="border-b border-earth-border/50">
                  <CardTitle className="text-xl flex items-center text-gold-100 font-black tracking-tight">
                    <Sprout className="h-6 w-6 mr-3 text-gold-400" /> Agronomic Pipeline
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 divide-y divide-earth-border">
                  {result.growing_steps.map((step: any, idx: number) => (
                    <div key={idx} className="flex gap-6 p-6 hover:bg-earth-elevated/30 transition-colors group">
                      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-earth-elevated text-gold-400 border border-earth-border flex items-center justify-center font-black shadow-lg group-hover:bg-gold-400 group-hover:text-earth-main transition-all duration-300">
                        {step.step_number}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-black text-gold-100 text-lg uppercase tracking-tight group-hover:text-gold-400 transition-colors">{step.title}</h4>
                        <p className="text-gold-100/60 mt-1 leading-relaxed text-sm">{step.details}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Fertilizer Schedule */}
            {result.fertilizer_schedule && result.fertilizer_schedule.length > 0 && (
              <Card className="card-premium">
                <CardHeader className="border-b border-earth-border/50">
                  <CardTitle className="text-xl flex items-center text-gold-100 font-black tracking-tight">
                    <ThermometerSun className="h-6 w-6 mr-3 text-gold-400" /> Phased Application Protocol
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-earth-elevated/50 border-b border-earth-border">
                        <th className="px-8 py-4 font-black uppercase tracking-widest text-[10px] text-gold-100/40">Growth Stage</th>
                        <th className="px-8 py-4 font-black uppercase tracking-widest text-[10px] text-gold-100/40">Temporal Delta</th>
                        <th className="px-8 py-4 font-black uppercase tracking-widest text-[10px] text-gold-100/40">Input Application</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-earth-border">
                      {result.fertilizer_schedule.map((stage: any, idx: number) => (
                        <tr key={idx} className="hover:bg-earth-elevated/20 transition-colors">
                          <td className="px-8 py-6 font-black text-gold-100 uppercase tracking-tight text-sm">{stage.stage}</td>
                          <td className="px-8 py-6 text-gold-100/60 font-medium text-sm">
                            {stage.days_after_sowing !== undefined ? `Day ${stage.days_after_sowing}` : `Day ${stage.days_after_transplant} (Transplant)`}
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex flex-wrap gap-2">
                              {stage.application.urea_kg && <Badge className="bg-gold-400/10 text-gold-400 border border-gold-400/20 font-bold">{stage.application.urea_kg} kg Urea</Badge>}
                              {stage.application.dap_kg && <Badge className="bg-gold-400/10 text-gold-400 border border-gold-400/20 font-bold">{stage.application.dap_kg} kg DAP</Badge>}
                              {stage.application.mop_kg && <Badge className="bg-gold-400/10 text-gold-400 border border-gold-400/20 font-bold">{stage.application.mop_kg} kg MOP</Badge>}
                              {stage.application.farmyard_manure && <Badge className="bg-gold-100/10 text-gold-100/80 border border-gold-100/20 font-bold">{stage.application.farmyard_manure} FYM</Badge>}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollReveal>
      )}
    </div>
  );
}
