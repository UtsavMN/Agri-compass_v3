import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Bell, MapPin, Shield, Smartphone, Sun, Ruler } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useUser } from '@/store';
import { apiPatch } from '@/lib/httpClient';
import { Checkbox } from '@/components/ui/checkbox';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { toast } = useToast();
  const { profile, updateProfile } = useUser();
  
  // Settings state
  const [pushNotifications, setPushNotifications] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [dataAnalytics, setDataAnalytics] = useState(true);
  const [outdoorMode, setOutdoorMode] = useState(false);
  const [unitSystem, setUnitSystem] = useState('metric');
  const [cropAlerts, setCropAlerts] = useState<string[]>([]);
  
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      let prefs: any = {};
      if (profile?.preferences) {
        try {
          prefs = JSON.parse(profile.preferences);
        } catch (e) {
          console.error("Failed to parse preferences", e);
        }
      }
      const localPrefsStr = localStorage.getItem('agri_compass_local_prefs');
      if (localPrefsStr) {
        try {
          prefs = { ...prefs, ...JSON.parse(localPrefsStr) };
        } catch (e) { }
      }
      
      setPushNotifications(prefs.pushNotifications ?? true);
      setSmsAlerts(prefs.smsAlerts ?? false);
      setDataAnalytics(prefs.dataAnalytics ?? true);
      setOutdoorMode(prefs.outdoorMode ?? false);
      setUnitSystem(prefs.unitSystem ?? 'metric');
      setCropAlerts(prefs.cropAlerts ?? []);
    }
  }, [profile, isOpen]);

  const handleSave = async () => {
    setIsSaving(true);
    const newPrefs = {
      pushNotifications,
      smsAlerts,
      dataAnalytics,
      outdoorMode,
      unitSystem,
      cropAlerts
    };
    
    try {
      try {
        await apiPatch('/api/users/preferences', newPrefs);
      } catch (patchErr) {
        console.warn('Backend preferences sync failed, saving locally:', patchErr);
        localStorage.setItem('agri_compass_local_prefs', JSON.stringify(newPrefs));
      }
      
      await updateProfile({ preferences: JSON.stringify(newPrefs) });
      toast({
        title: "Settings Saved",
        description: "Your preferences have been updated successfully.",
      });
      
      // Optionally apply outdoor mode class to body
      if (outdoorMode) {
        document.body.classList.add('outdoor-mode-active');
      } else {
        document.body.classList.remove('outdoor-mode-active');
      }
      
      onClose();
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update profile locally. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const toggleCropAlert = (crop: string) => {
    setCropAlerts(prev => 
      prev.includes(crop) ? prev.filter(c => c !== crop) : [...prev, crop]
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md bg-[#12120e] border-earth-border/40 text-gold-100/90 max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-[#f0ece0]">Settings</DialogTitle>
          <DialogDescription className="text-sm text-gold-100/60 pt-1">
            Manage your account preferences and notifications.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-6">
          {/* Display & Units Section */}
          <section className="space-y-4">
            <h3 className="text-xs font-bold text-gold-400 uppercase tracking-wider flex items-center gap-2 border-b border-earth-border/40 pb-2">
              <Sun className="w-4 h-4" />
              Display & Units
            </h3>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#f0ece0]">High-Contrast Outdoor Mode</p>
                <p className="text-xs text-gold-100/50">Increases visibility in direct sunlight</p>
              </div>
              <button 
                onClick={() => setOutdoorMode(!outdoorMode)}
                className={`w-10 h-5 rounded-full relative transition-colors ${outdoorMode ? 'bg-gold-400' : 'bg-earth-border/60'}`}
              >
                <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${outdoorMode ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#f0ece0]">Unit System</p>
                <p className="text-xs text-gold-100/50">Metric (kg, ha) vs Imperial (lbs, ac)</p>
              </div>
              <div className="flex bg-[#1a1a14]/60 rounded-lg p-1 border border-earth-border/40">
                <button
                  onClick={() => setUnitSystem('metric')}
                  className={`px-3 py-1 text-xs rounded-md transition-colors ${unitSystem === 'metric' ? 'bg-gold-400 text-[#0A0A0A] font-bold' : 'text-gold-100/60 hover:text-gold-200'}`}
                >
                  Metric
                </button>
                <button
                  onClick={() => setUnitSystem('imperial')}
                  className={`px-3 py-1 text-xs rounded-md transition-colors ${unitSystem === 'imperial' ? 'bg-gold-400 text-[#0A0A0A] font-bold' : 'text-gold-100/60 hover:text-gold-200'}`}
                >
                  Imperial
                </button>
              </div>
            </div>
          </section>

          {/* Notifications Section */}
          <section className="space-y-4">
            <h3 className="text-xs font-bold text-gold-400 uppercase tracking-wider flex items-center gap-2 border-b border-earth-border/40 pb-2">
              <Bell className="w-4 h-4" />
              Notifications
            </h3>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#f0ece0]">Push Notifications</p>
                <p className="text-xs text-gold-100/50">Get alerts for new market prices</p>
              </div>
              <button 
                onClick={() => setPushNotifications(!pushNotifications)}
                className={`w-10 h-5 rounded-full relative transition-colors ${pushNotifications ? 'bg-gold-400' : 'bg-earth-border/60'}`}
              >
                <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${pushNotifications ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#f0ece0]">SMS Alerts</p>
                <p className="text-xs text-gold-100/50">Receive weather warnings via SMS</p>
              </div>
              <button 
                onClick={() => setSmsAlerts(!smsAlerts)}
                className={`w-10 h-5 rounded-full relative transition-colors ${smsAlerts ? 'bg-gold-400' : 'bg-earth-border/60'}`}
              >
                <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${smsAlerts ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>

            <div className="pt-2">
              <p className="text-xs font-bold text-gold-100/70 mb-2">Crop Specific Alerts</p>
              <div className="flex flex-wrap gap-2">
                {['Rice', 'Wheat', 'Cotton', 'Sugarcane', 'Maize'].map(crop => (
                  <button
                    key={crop}
                    onClick={() => toggleCropAlert(crop)}
                    className={`px-3 py-1.5 text-xs rounded-full border transition-all ${
                      cropAlerts.includes(crop) 
                        ? 'bg-gold-400/20 border-gold-400 text-gold-400' 
                        : 'bg-transparent border-earth-border/60 text-gold-100/60 hover:border-gold-400/50 hover:text-gold-200'
                    }`}
                  >
                    {crop}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Location Preferences */}
          <section className="space-y-4">
            <h3 className="text-xs font-bold text-gold-400 uppercase tracking-wider flex items-center gap-2 border-b border-earth-border/40 pb-2">
              <MapPin className="w-4 h-4" />
              Location
            </h3>
            <div className="text-sm text-[#f0ece0] flex justify-between items-center bg-[#1a1a14]/60 p-3 rounded-lg border border-earth-border/40">
              <span>Change Default District</span>
              <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-gold-400 hover:text-gold-300" onClick={() => { onClose(); window.location.href = '/profile'; }}>
                Edit in Profile
              </Button>
            </div>
          </section>

          {/* Privacy & Data */}
          <section className="space-y-4">
            <h3 className="text-xs font-bold text-gold-400 uppercase tracking-wider flex items-center gap-2 border-b border-earth-border/40 pb-2">
              <Shield className="w-4 h-4" />
              Privacy & Data
            </h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#f0ece0]">Share Usage Data</p>
                <p className="text-xs text-gold-100/50">Help us improve Agri-Compass</p>
              </div>
              <button 
                onClick={() => setDataAnalytics(!dataAnalytics)}
                className={`w-10 h-5 rounded-full relative transition-colors ${dataAnalytics ? 'bg-gold-400' : 'bg-earth-border/60'}`}
              >
                <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${dataAnalytics ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
          </section>

        </div>

        <div className="mt-6 flex justify-end gap-3 border-t border-earth-border/40 pt-4">
          <Button variant="ghost" onClick={onClose} disabled={isSaving} className="text-gold-100/70 hover:text-[#f0ece0]">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving} className="bg-gold-400 hover:bg-gold-500 text-[#0A0A0A] font-bold">
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
