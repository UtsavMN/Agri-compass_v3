import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import {
  Sun,
  Bell,
  MapPin,
  Database,
  Ruler,
  Save,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Volume2,
  Globe,
  Sliders,
  Compass,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useDistrict, useUser } from '@/store';
import { useLanguage } from '@/contexts/LanguageContext';
import { KARNATAKA_DISTRICT_COORDINATES, findNearestDistrict } from '@/lib/ai/weatherAdvisor';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export interface QuietHours {
  enabled: boolean;
  start: string;
  end: string;
}

export interface SettingsData {
  highContrastMode: boolean;
  landUnit: 'Acre' | 'Hectare' | 'Bigha' | 'Gunta';
  weightUnit: 'Quintal' | 'Kg' | 'Tonne';
  language: 'en' | 'kn';
  voiceReadout: boolean;
  pushNotifications: boolean;
  smsAlertLevel: 'All' | 'Critical Weather Only' | 'Off';
  weatherAlerts: boolean;
  marketPriceAlerts: boolean;
  quietHours: QuietHours;
  offlineDataSaver: boolean;
  location: {
    district: string;
    lat: number;
    lng: number;
    distanceKm?: number;
    gpsAcquired?: boolean;
  };
}

const DEFAULT_SETTINGS: SettingsData = {
  highContrastMode: false,
  landUnit: 'Acre',
  weightUnit: 'Quintal',
  language: 'en',
  voiceReadout: false,
  pushNotifications: true,
  smsAlertLevel: 'Critical Weather Only',
  weatherAlerts: true,
  marketPriceAlerts: true,
  quietHours: {
    enabled: false,
    start: '22:00',
    end: '06:00',
  },
  offlineDataSaver: false,
  location: {
    district: 'Bengaluru Urban',
    lat: 12.9716,
    lng: 77.5946,
  },
};

export function SettingsDashboard() {
  const { selectedDistrict, setSelectedDistrict } = useDistrict();
  const { profile } = useUser();
  const { language, setLanguage } = useLanguage();
  const { toast } = useToast();

  const [districts, setDistricts] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Derive initial district candidate from profile (onboarding) -> store -> fallback
  const onboardingDistrict = (profile?.district && profile.district !== 'Unknown')
    ? profile.district
    : (profile?.location && profile.location !== 'Unknown' ? profile.location : (selectedDistrict || 'Bengaluru Urban'));

  const [settings, setSettings] = useState<SettingsData>(() => {
    try {
      const saved = localStorage.getItem('agri_compass_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        const resolvedDistrict = (parsed.location?.district && parsed.location.district !== 'Bengaluru Urban')
          ? parsed.location.district
          : onboardingDistrict;
        const coords = KARNATAKA_DISTRICT_COORDINATES[resolvedDistrict] || { lat: 12.9716, lon: 77.5946 };
        return {
          ...DEFAULT_SETTINGS,
          ...parsed,
          location: {
            ...DEFAULT_SETTINGS.location,
            ...(parsed.location || {}),
            district: resolvedDistrict,
            lat: parsed.location?.lat ?? coords.lat,
            lng: parsed.location?.lng ?? coords.lon,
          }
        };
      }
    } catch (e) {
      console.warn('Could not read cached settings', e);
    }

    const coords = KARNATAKA_DISTRICT_COORDINATES[onboardingDistrict] || { lat: 12.9716, lon: 77.5946 };
    return {
      ...DEFAULT_SETTINGS,
      location: {
        district: onboardingDistrict,
        lat: coords.lat,
        lng: coords.lon,
      }
    };
  });

  useEffect(() => {
    loadDistricts();
    fetchRemoteSettings();
  }, []);

  const loadDistricts = async () => {
    try {
      const response = await fetch('/districts.csv');
      const text = await response.text();
      Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const list = results.data
            .map((row: any) => row.district?.trim())
            .filter(Boolean)
            .sort();
          if (list.length > 0) {
            setDistricts(list as string[]);
          }
        }
      });
    } catch (e) {
      console.error('Error loading districts:', e);
    }
  };

  const fetchRemoteSettings = async () => {
    try {
      setLoading(true);
      const { apiGet } = await import('@/lib/httpClient');
      const res = await apiGet('/api/profile/me');

      if (res) {
        const profileDistrict = (res.district && res.district !== 'Unknown')
          ? res.district
          : (res.location && res.location !== 'Unknown' ? res.location : '');

        let remoteData: any = {};
        if (res.preferences) {
          try {
            remoteData = typeof res.preferences === 'string' ? JSON.parse(res.preferences) : res.preferences;
          } catch (pe) {
            console.warn('Could not parse remote preferences, using defaults', pe);
          }
        }

        setSettings(prev => {
          // Priority for district: remote preferences district -> onboarding profile district -> prev.location.district -> fallback
          const targetDistrict = remoteData.location?.district || profileDistrict || prev.location.district || 'Bengaluru Urban';
          const coords = KARNATAKA_DISTRICT_COORDINATES[targetDistrict] || { lat: 12.9716, lon: 77.5946 };

          return {
            ...DEFAULT_SETTINGS,
            ...prev,
            ...remoteData,
            language: remoteData.language || res.language || prev.language || 'en',
            location: {
              ...DEFAULT_SETTINGS.location,
              ...(prev?.location || {}),
              ...(remoteData?.location || {}),
              district: targetDistrict,
              lat: remoteData.location?.lat ?? prev.location.lat ?? coords.lat,
              lng: remoteData.location?.lng ?? prev.location.lng ?? coords.lon,
            },
            quietHours: {
              ...DEFAULT_SETTINGS.quietHours,
              ...(prev?.quietHours || {}),
              ...(remoteData?.quietHours || {})
            }
          };
        });
      }
    } catch (err) {
      console.info('Operating in client/offline settings mode');
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = <K extends keyof SettingsData>(key: K, value: SettingsData[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // 1. Immediately cache in localStorage
      localStorage.setItem('agri_compass_settings', JSON.stringify(settings));
      localStorage.setItem('agri_compass_voice_readout', String(settings.voiceReadout));
      localStorage.setItem('agri_compass_land_unit', settings.landUnit);
      localStorage.setItem('agri_compass_weight_unit', settings.weightUnit);
      localStorage.setItem('agri_compass_offline_saver', String(settings.offlineDataSaver));

      // 2. Apply theme & language side effects ONLY ON SAVE
      if (settings.highContrastMode) {
        document.body.classList.add('outdoor-mode-active');
      } else {
        document.body.classList.remove('outdoor-mode-active');
      }

      if (settings.language && settings.language !== language) {
        setLanguage(settings.language);
      }

      if (settings.location.district) {
        setSelectedDistrict(settings.location.district);
      }

      // 3. Sync to backend API if available
      try {
        const { apiPut } = await import('@/lib/httpClient');
        await apiPut('/api/profile/me', {
          district: settings.location.district,
          language: settings.language,
          preferences: JSON.stringify(settings)
        });
        toast({
          title: "Settings Saved",
          description: `Preferences and district (${settings.location.district}) have been synced across cloud and device.`,
        });
      } catch (backendError) {
        console.warn('Backend sync failed, saved locally:', backendError);
        toast({
          title: "Settings Saved (Offline)",
          description: `Preferences saved locally to this device with ${settings.location.district}.`,
        });
      }

      setHasUnsavedChanges(false);

    } catch (err) {
      console.error('Save settings error:', err);
      toast({
        title: 'Error',
        description: 'Failed to update preferences.',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const getGpsLocation = () => {
    if (!('geolocation' in navigator)) {
      toast({
        title: "Not Supported",
        description: "Geolocation is not supported by your browser.",
        variant: 'destructive'
      });
      return;
    }

    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = Number(position.coords.latitude.toFixed(4));
        const lng = Number(position.coords.longitude.toFixed(4));

        // Haversine exact nearest district calculation against all 31 Karnataka headquarters
        const nearest = findNearestDistrict(lat, lng);

        // Update local draft ONLY — do NOT mutate global store until user clicks Save Changes
        updateSetting('location', {
          district: nearest.district,
          lat,
          lng,
          distanceKm: nearest.distanceKm,
          gpsAcquired: true,
        });

        setGpsLoading(false);

        toast({
          title: "GPS Location Detected",
          description: `Coordinates locked (${lat}° N, ${lng}° E) · Nearest District: ${nearest.district} (${nearest.distanceKm} km away). Click "Save Changes" to apply.`,
        });
      },
      (error) => {
        setGpsLoading(false);
        toast({
          title: "Location Access Denied",
          description: error.message || 'Please enable GPS location permissions.',
          variant: 'destructive'
        });
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  return (
    <div className="space-y-8 animate-fade-in text-gold-100">
      {/* Title & Save Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-earth-border/40">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-400/10 border border-gold-400/30 text-gold-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Sliders className="h-3 w-3" /> System Preferences
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-gold-100 tracking-tight">
            Settings & Farm Configuration
          </h2>
          <p className="text-xs sm:text-sm text-gold-100/60 mt-1">
            Configure units, microclimate district, offline caching, and agricultural alerts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {hasUnsavedChanges && (
            <span className="text-xs font-bold text-amber-400 bg-amber-400/10 px-3 py-1.5 rounded-xl border border-amber-400/30 flex items-center gap-1.5 animate-pulse">
              <AlertTriangle className="w-3.5 h-3.5" /> Unsaved Changes
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-gold-400 hover:bg-gold-300 text-earth-main font-black py-2.5 px-6 rounded-xl flex items-center gap-2 transition-all shadow-lg hover:shadow-gold-400/20 active:scale-95 disabled:opacity-50 text-sm"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving Preferences...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="space-y-8">
        {/* Section 1: Location & Microclimate District */}
        <section className="bg-earth-elevated/40 border border-earth-border/60 rounded-3xl p-6 backdrop-blur-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-earth-border/30">
            <h3 className="text-sm font-black text-gold-400 uppercase tracking-widest flex items-center gap-2">
              <MapPin className="w-4 h-4" /> Primary Farming District & GPS
            </h3>
            <span className="text-[11px] text-gold-100/50">Used for weather & advisory sync</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold text-gold-200 uppercase tracking-wider">
                Karnataka District
              </label>
              <Select
                value={settings.location.district}
                onValueChange={(val) => {
                  const coords = KARNATAKA_DISTRICT_COORDINATES[val] || { lat: 12.9716, lon: 77.5946 };
                  updateSetting('location', {
                    ...settings.location,
                    district: val,
                    lat: coords.lat,
                    lng: coords.lon,
                    gpsAcquired: false,
                    distanceKm: undefined
                  });
                  // NOTE: Does NOT call setSelectedDistrict until user clicks "Save Changes"
                }}
              >
                <SelectTrigger className="bg-earth-main border-earth-border text-white h-12 rounded-xl text-sm font-semibold focus:border-gold-400">
                  <SelectValue placeholder="Select Karnataka District..." />
                </SelectTrigger>
                <SelectContent className="bg-earth-elevated text-white border-earth-border max-h-72">
                  {districts.map(d => (
                    <SelectItem key={d} value={d} className="hover:bg-earth-border/40 cursor-pointer">
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 flex flex-col justify-end">
              <button
                type="button"
                onClick={getGpsLocation}
                disabled={gpsLoading}
                className="h-12 px-4 rounded-xl bg-earth-main hover:bg-earth-border/40 border border-earth-border text-gold-100 font-bold text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                <Compass className={`w-4 h-4 text-gold-400 ${gpsLoading ? 'animate-spin' : ''}`} />
                {gpsLoading ? 'Acquiring GPS...' : 'Auto-Detect via GPS'}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-gold-100/60 pt-1">
            <span>Coordinates: <strong className="text-gold-300">{settings.location.lat}° N, {settings.location.lng}° E</strong></span>
            <span>·</span>
            <span>District: <strong className="text-gold-200">{settings.location.district}</strong></span>
            {settings.location.distanceKm !== undefined && (
              <>
                <span>·</span>
                <span>Offset: <strong className="text-sky-300">{settings.location.distanceKm} km from HQ</strong></span>
              </>
            )}
            {settings.location.gpsAcquired && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 className="w-3 h-3" /> GPS Pinpoint
              </span>
            )}
          </div>
        </section>

        {/* Section 2: Display & Agronomic Units */}
        <section className="bg-earth-elevated/40 border border-earth-border/60 rounded-3xl p-6 backdrop-blur-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-earth-border/30">
            <h3 className="text-sm font-black text-gold-400 uppercase tracking-widest flex items-center gap-2">
              <Ruler className="w-4 h-4" /> Units of Measurement & Language
            </h3>
            <span className="text-[11px] text-gold-100/50">Customized for regional trade</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Land Unit */}
            <div className="p-4 bg-earth-main/60 rounded-2xl border border-earth-border/40 space-y-2">
              <label className="text-xs font-bold text-gold-200 uppercase tracking-wider block">
                Land Area Unit
              </label>
              <select
                value={settings.landUnit}
                onChange={(e) => updateSetting('landUnit', e.target.value as any)}
                className="w-full bg-earth-elevated border border-earth-border/60 rounded-xl py-2 px-3 text-xs font-bold text-gold-100 focus:border-gold-400 outline-none"
              >
                <option value="Acre">Acre (ಎಕರೆ)</option>
                <option value="Gunta">Gunta (ಗುಂಟೆ)</option>
                <option value="Hectare">Hectare (ಹೆಕ್ಟೇರ್)</option>
                <option value="Bigha">Bigha (ಬೀಘಾ)</option>
              </select>
            </div>

            {/* Weight Unit */}
            <div className="p-4 bg-earth-main/60 rounded-2xl border border-earth-border/40 space-y-2">
              <label className="text-xs font-bold text-gold-200 uppercase tracking-wider block">
                Crop Weight Unit
              </label>
              <select
                value={settings.weightUnit}
                onChange={(e) => updateSetting('weightUnit', e.target.value as any)}
                className="w-full bg-earth-elevated border border-earth-border/60 rounded-xl py-2 px-3 text-xs font-bold text-gold-100 focus:border-gold-400 outline-none"
              >
                <option value="Quintal">Quintal (100 kg / ಕ್ವಿಂಟಾಲ್)</option>
                <option value="Kg">Kilogram (kg / ಕಿಲೋಗ್ರಾಂ)</option>
                <option value="Tonne">Metric Tonne (1,000 kg)</option>
              </select>
            </div>

            {/* Language Selection */}
            <div className="p-4 bg-earth-main/60 rounded-2xl border border-earth-border/40 space-y-2">
              <label className="text-xs font-bold text-gold-200 uppercase tracking-wider flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-gold-400" /> Interface Language
              </label>
              <select
                value={settings.language}
                onChange={(e) => {
                  const val = e.target.value as 'en' | 'kn';
                  updateSetting('language', val);
                  // NOTE: Does NOT call setLanguage until user clicks "Save Changes"
                }}
                className="w-full bg-earth-elevated border border-earth-border/60 rounded-xl py-2 px-3 text-xs font-bold text-gold-100 focus:border-gold-400 outline-none"
              >
                <option value="en">English (US/IN)</option>
                <option value="kn">ಕನ್ನಡ (Kannada)</option>
              </select>
            </div>

            {/* High Contrast Mode */}
            <div className="p-4 bg-earth-main/60 rounded-2xl border border-earth-border/40 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gold-200 uppercase tracking-wider">Outdoor Sun Mode</p>
                <p className="text-[10px] text-gold-100/50 mt-0.5">High-contrast for direct sunlight</p>
              </div>
              <button
                type="button"
                onClick={() => updateSetting('highContrastMode', !settings.highContrastMode)}
                className={`w-11 h-6 rounded-full relative transition-colors ${
                  settings.highContrastMode ? 'bg-gold-400' : 'bg-earth-border'
                }`}
              >
                <div
                  className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-earth-main transition-transform ${
                    settings.highContrastMode ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </section>

        {/* Section 3: Notifications & Audio Assistance */}
        <section className="bg-earth-elevated/40 border border-earth-border/60 rounded-3xl p-6 backdrop-blur-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-earth-border/30">
            <h3 className="text-sm font-black text-gold-400 uppercase tracking-widest flex items-center gap-2">
              <Bell className="w-4 h-4" /> Notifications & Voice Assistance
            </h3>
            <span className="text-[11px] text-gold-100/50">Manage alerts & speech</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Push Notifications */}
            <div className="p-4 bg-earth-main/60 rounded-2xl border border-earth-border/40 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gold-200 uppercase tracking-wider">Browser Push Alerts</p>
                <p className="text-[10px] text-gold-100/50 mt-0.5">Receive immediate notifications for mandi price swings</p>
              </div>
              <button
                type="button"
                onClick={() => updateSetting('pushNotifications', !settings.pushNotifications)}
                className={`w-11 h-6 rounded-full relative transition-colors ${
                  settings.pushNotifications ? 'bg-gold-400' : 'bg-earth-border'
                }`}
              >
                <div
                  className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-earth-main transition-transform ${
                    settings.pushNotifications ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Voice Readout */}
            <div className="p-4 bg-earth-main/60 rounded-2xl border border-earth-border/40 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gold-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5 text-gold-400" /> Voice Readout Assistance
                </p>
                <p className="text-[10px] text-gold-100/50 mt-0.5">Audible speech output for advisories and bot chat</p>
              </div>
              <button
                type="button"
                onClick={() => updateSetting('voiceReadout', !settings.voiceReadout)}
                className={`w-11 h-6 rounded-full relative transition-colors ${
                  settings.voiceReadout ? 'bg-gold-400' : 'bg-earth-border'
                }`}
              >
                <div
                  className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-earth-main transition-transform ${
                    settings.voiceReadout ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* SMS Alert Level */}
            <div className="p-4 bg-earth-main/60 rounded-2xl border border-earth-border/40 space-y-2">
              <label className="text-xs font-bold text-gold-200 uppercase tracking-wider block">
                SMS Weather Alert Level
              </label>
              <div className="flex flex-wrap gap-3 pt-1">
                {(['Critical Weather Only', 'All', 'Off'] as const).map((level) => (
                  <label key={level} className="flex items-center gap-2 text-xs font-medium cursor-pointer hover:text-gold-300">
                    <input
                      type="radio"
                      name="smsAlertLevel"
                      checked={settings.smsAlertLevel === level}
                      onChange={() => updateSetting('smsAlertLevel', level)}
                      className="accent-[#C9A84C]"
                    />
                    <span>{level}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Offline Data Saver */}
            <div className="p-4 bg-earth-main/60 rounded-2xl border border-earth-border/40 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gold-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-gold-400" /> Offline Data Saver
                </p>
                <p className="text-[10px] text-gold-100/50 mt-0.5">Pre-cache mandi prices & weather forecasts locally</p>
              </div>
              <button
                type="button"
                onClick={() => updateSetting('offlineDataSaver', !settings.offlineDataSaver)}
                className={`w-11 h-6 rounded-full relative transition-colors ${
                  settings.offlineDataSaver ? 'bg-gold-400' : 'bg-earth-border'
                }`}
              >
                <div
                  className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-earth-main transition-transform ${
                    settings.offlineDataSaver ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default SettingsDashboard;
