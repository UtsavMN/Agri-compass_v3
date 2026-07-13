import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Bell, MapPin, Shield, Smartphone } from 'lucide-react';
import { useState } from 'react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { toast } = useToast();
  
  // Mock settings state
  const [pushNotifications, setPushNotifications] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [dataAnalytics, setDataAnalytics] = useState(true);

  const handleSave = () => {
    toast({
      title: "Settings Saved",
      description: "Your preferences have been updated successfully.",
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md bg-[#12120e] border-earth-border/40 text-gold-100/90">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-[#f0ece0]">Settings</DialogTitle>
          <DialogDescription className="text-sm text-gold-100/60 pt-1">
            Manage your account preferences and notifications.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-6">
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
          <Button variant="ghost" onClick={onClose} className="text-gold-100/70 hover:text-[#f0ece0]">
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-gold-400 hover:bg-gold-500 text-[#0A0A0A] font-bold">
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
