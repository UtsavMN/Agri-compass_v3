import React, { useState, useEffect } from 'react';
import { Sun, Bell, Shield, MapPin, Database, Ruler, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useDistrict } from '@/store';
interface QuietHours {
  enabled: boolean;
  start: string;
  end: string;
}

interface Location {
  district: string;
  lat: number;
  lng: number;
}

interface SettingsData {
  highContrastMode: boolean;
  landUnit: 'Acre' | 'Hectare' | 'Bigha';
  weightUnit: 'Quintal' | 'Kg' | 'Tonne' | 'Bushel';
  voiceReadout: boolean;
  pushNotifications: boolean;
  smsAlertLevel: 'All' | 'Critical Weather Only' | 'Off';
  quietHours: QuietHours;
  offlineDataSaver: boolean;
  location: Location;
}

export function SettingsDashboard() {
  const { setSelectedDistrict } = useDistrict();
  const { toast } = useToast();
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:5000/api/settings');
      if (!res.ok) throw new Error('Failed to fetch settings');
      const data = await res.json();
      setSettings(data);
    } catch (err) {
      console.error(err);
      toast({ title: 'Error', description: 'Failed to load settings', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;
    try {
      setSaving(true);
      const res = await fetch('http://localhost:5000/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error('Failed to save settings');
      
      toast({
        title: "Settings Saved",
        description: "Your preferences have been updated successfully.",
      });

      // Apply side effects
      if (settings.highContrastMode) {
        document.body.classList.add('outdoor-mode-active');
      } else {
        document.body.classList.remove('outdoor-mode-active');
      }

      if (settings.location.district) {
        setSelectedDistrict(settings.location.district);
      }

      localStorage.setItem('agri_compass_voice_readout', String(settings.voiceReadout));
      localStorage.setItem('agri_compass_land_unit', settings.landUnit);
      localStorage.setItem('agri_compass_weight_unit', settings.weightUnit);
      localStorage.setItem('agri_compass_offline_saver', String(settings.offlineDataSaver));

    } catch (err) {
      console.error(err);
      toast({ title: 'Error', description: 'Failed to save settings', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const getGpsLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          let districtName = 'Auto-detected Location';
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            if (res.ok) {
              const data = await res.json();
              districtName = data.address?.state_district || data.address?.county || data.address?.city || data.address?.state || 'Auto-detected Location';
            }
          } catch (e) {
            console.error('Geocoding failed', e);
          }
          
          setSettings(prev => prev ? {
            ...prev,
            location: { ...prev.location, lat, lng, district: districtName }
          } : null);
          
          toast({ title: "Location Updated", description: "Successfully fetched GPS coordinates." });
        },
        (error) => {
          toast({ title: "Location Error", description: error.message, variant: 'destructive' });
        }
      );
    } else {
      toast({ title: "Not Supported", description: "Geolocation is not supported by your browser.", variant: 'destructive' });
    }
  };

  if (loading || !settings) {
    return <div className="p-8 text-center text-gold-100/50">Loading settings...</div>;
  }

  const updateSetting = <K extends keyof SettingsData>(key: K, value: SettingsData[K]) => {
    setSettings(prev => prev ? { ...prev, [key]: value } : null);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 bg-[#12120e] p-6 rounded-xl border border-earth-border/40 text-gold-100/90">
      
      <div className="flex justify-between items-center pb-4 border-b border-earth-border/40">
        <div>
          <h2 className="text-2xl font-bold text-[#f0ece0]">Settings Dashboard</h2>
          <p className="text-sm text-gold-100/60 mt-1">Manage your farming preferences and app behavior.</p>
        </div>
        <button 
          onClick={handleSave} 
          disabled={saving}
          className="bg-[#C9A84C] hover:bg-[#b0923b] text-[#0A0A0A] font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="space-y-10">
        
        {/* Display & Units */}
        <section className="space-y-5">
          <h3 className="text-sm font-bold text-[#C9A84C] uppercase tracking-wider flex items-center gap-2">
            <Sun className="w-4 h-4" /> Display & Units
          </h3>
          
          <div className="grid md:grid-cols-2 gap-6 bg-[#1a1a14]/60 p-4 rounded-lg border border-earth-border/20">
            {/* High Contrast */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#f0ece0]">High-Contrast Outdoor Mode</p>
                <p className="text-xs text-gold-100/50">Improves visibility in bright sunlight</p>
              </div>
              <button onClick={() => updateSetting('highContrastMode', !settings.highContrastMode)}
                className={`w-10 h-5 rounded-full relative transition-colors ${settings.highContrastMode ? 'bg-[#C9A84C]' : 'bg-earth-border/60'}`}>
                <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-[#12120e] transition-transform ${settings.highContrastMode ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>

            {/* Voice Readout */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#f0ece0]">Voice Readout</p>
                <p className="text-xs text-gold-100/50">Read important alerts aloud</p>
              </div>
              <button onClick={() => updateSetting('voiceReadout', !settings.voiceReadout)}
                className={`w-10 h-5 rounded-full relative transition-colors ${settings.voiceReadout ? 'bg-[#C9A84C]' : 'bg-earth-border/60'}`}>
                <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-[#12120e] transition-transform ${settings.voiceReadout ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>

            {/* Units */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#f0ece0] flex items-center gap-2"><Ruler className="w-3 h-3"/> Land Unit</label>
              <select 
                value={settings.landUnit} 
                onChange={(e) => updateSetting('landUnit', e.target.value as any)}
                className="w-full bg-[#12120e] border border-earth-border/40 rounded-md py-2 px-3 text-sm focus:border-[#C9A84C] outline-none"
              >
                <option value="Acre">Acre</option>
                <option value="Hectare">Hectare</option>
                <option value="Bigha">Bigha</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[#f0ece0]">Weight Unit</label>
              <select 
                value={settings.weightUnit} 
                onChange={(e) => updateSetting('weightUnit', e.target.value as any)}
                className="w-full bg-[#12120e] border border-earth-border/40 rounded-md py-2 px-3 text-sm focus:border-[#C9A84C] outline-none"
              >
                <option value="Quintal">Quintal</option>
                <option value="Kg">Kilogram (Kg)</option>
                <option value="Tonne">Tonne</option>
                <option value="Bushel">Bushel</option>
              </select>
            </div>
          </div>
        </section>

        {/* Notifications & Alerts */}
        <section className="space-y-5">
          <h3 className="text-sm font-bold text-[#C9A84C] uppercase tracking-wider flex items-center gap-2">
            <Bell className="w-4 h-4" /> Notifications & Alerts
          </h3>
          
          <div className="space-y-6 bg-[#1a1a14]/60 p-4 rounded-lg border border-earth-border/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#f0ece0]">Push Notifications</p>
                <p className="text-xs text-gold-100/50">Allow Agri-Compass to send push alerts</p>
              </div>
              <button onClick={() => updateSetting('pushNotifications', !settings.pushNotifications)}
                className={`w-10 h-5 rounded-full relative transition-colors ${settings.pushNotifications ? 'bg-[#C9A84C]' : 'bg-earth-border/60'}`}>
                <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-[#12120e] transition-transform ${settings.pushNotifications ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium text-[#f0ece0]">SMS Alert Level</p>
              <div className="flex gap-4">
                {['All', 'Critical Weather Only', 'Off'].map(level => (
                  <label key={level} className="flex items-center gap-2 text-sm cursor-pointer hover:text-[#C9A84C]">
                    <input 
                      type="radio" 
                      name="smsAlertLevel" 
                      checked={settings.smsAlertLevel === level}
                      onChange={() => updateSetting('smsAlertLevel', level as any)}
                      className="accent-[#C9A84C]"
                    />
                    {level}
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-earth-border/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#f0ece0]">Quiet Hours</p>
                  <p className="text-xs text-gold-100/50">Mute all non-critical notifications during this time</p>
                </div>
                <button onClick={() => updateSetting('quietHours', { ...settings.quietHours, enabled: !settings.quietHours.enabled })}
                  className={`w-10 h-5 rounded-full relative transition-colors ${settings.quietHours.enabled ? 'bg-[#C9A84C]' : 'bg-earth-border/60'}`}>
                  <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-[#12120e] transition-transform ${settings.quietHours.enabled ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
              
              {settings.quietHours.enabled && (
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs">Start:</span>
                    <input type="time" value={settings.quietHours.start} onChange={(e) => updateSetting('quietHours', { ...settings.quietHours, start: e.target.value })}
                      className="bg-[#12120e] border border-earth-border/40 rounded px-2 py-1 text-sm outline-none" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs">End:</span>
                    <input type="time" value={settings.quietHours.end} onChange={(e) => updateSetting('quietHours', { ...settings.quietHours, end: e.target.value })}
                      className="bg-[#12120e] border border-earth-border/40 rounded px-2 py-1 text-sm outline-none" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Data & Offline */}
        <section className="space-y-5">
          <h3 className="text-sm font-bold text-[#C9A84C] uppercase tracking-wider flex items-center gap-2">
            <Database className="w-4 h-4" /> Data & Offline
          </h3>
          <div className="bg-[#1a1a14]/60 p-4 rounded-lg border border-earth-border/20 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#f0ece0]">Offline Data Saver</p>
              <p className="text-xs text-gold-100/50">Pre-cache weather and market prices when on Wi-Fi</p>
            </div>
            <button onClick={() => updateSetting('offlineDataSaver', !settings.offlineDataSaver)}
              className={`w-10 h-5 rounded-full relative transition-colors ${settings.offlineDataSaver ? 'bg-[#C9A84C]' : 'bg-earth-border/60'}`}>
              <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-[#12120e] transition-transform ${settings.offlineDataSaver ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>
        </section>

        {/* Location */}
        <section className="space-y-5">
          <h3 className="text-sm font-bold text-[#C9A84C] uppercase tracking-wider flex items-center gap-2">
            <MapPin className="w-4 h-4" /> Location Settings
          </h3>
          <div className="bg-[#1a1a14]/60 p-4 rounded-lg border border-earth-border/20 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#f0ece0]">Primary Farming District</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={settings.location.district} 
                  onChange={(e) => updateSetting('location', { ...settings.location, district: e.target.value })}
                  placeholder="e.g. Pune, Maharashtra"
                  className="flex-1 bg-[#12120e] border border-earth-border/40 rounded-md py-2 px-3 text-sm focus:border-[#C9A84C] outline-none"
                />
                <button onClick={getGpsLocation} className="bg-earth-elevated hover:bg-earth-elevated/80 border border-earth-border/40 text-[#f0ece0] px-4 rounded-md text-sm transition-colors flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> Use Current GPS
                </button>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
