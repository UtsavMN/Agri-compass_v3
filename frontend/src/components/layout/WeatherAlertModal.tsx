import React, { useEffect, useState } from 'react';
import { AlertTriangle, Clock, MapPin, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface Alert {
  alert_id: string;
  event_type: string;
  description: string;
  start: number;
  end: number;
  is_active: boolean;
  sender_name?: string;
}

interface WeatherAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  alertId: string | null;
}

export function WeatherAlertModal({ isOpen, onClose, alertId }: WeatherAlertModalProps) {
  const [alert, setAlert] = useState<Alert | null>(null);

  useEffect(() => {
    if (isOpen && alertId) {
      const localHistoryStr = localStorage.getItem('agri_compass_notification_history');
      if (localHistoryStr) {
        const history = JSON.parse(localHistoryStr);
        const targetNotification = history.find((n: any) => n.id === alertId);
        
        if (targetNotification && targetNotification.alertData) {
          setAlert(JSON.parse(targetNotification.alertData));
        } else {
          setAlert(null);
        }
      } else {
        setAlert(null);
      }
    }
  }, [isOpen, alertId]);

  if (!alert) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-md bg-[#12120e] border-earth-border/40 text-gold-100/90 flex flex-col items-center p-8">
          <ShieldAlert className="w-12 h-12 text-earth-border/40 mb-2" />
          <DialogTitle className="text-xl font-bold text-gold-200">Alert Not Found</DialogTitle>
          <DialogDescription className="text-sm text-gold-100/50 mt-1 mb-4 text-center">
            This weather alert may have expired or does not exist in your local history.
          </DialogDescription>
          <Button onClick={onClose} variant="outline" className="border-[#C9A84C] text-[#C9A84C] hover:bg-[#C9A84C]/10">
            Close
          </Button>
        </DialogContent>
      </Dialog>
    );
  }

  const isUpcoming = Math.floor(Date.now() / 1000) < alert.start;
  const isExpired = Math.floor(Date.now() / 1000) > alert.end;

  const formatTime = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString([], { 
      weekday: 'short', month: 'short', day: 'numeric', 
      hour: '2-digit', minute: '2-digit' 
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[95vw] sm:max-w-2xl bg-[#1a1a14] border-earth-border/40 text-gold-100/90 p-0 overflow-hidden shadow-2xl rounded-xl max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className={`p-4 sm:p-6 ${isUpcoming ? 'bg-amber-500/10' : 'bg-red-500/10'} border-b ${isUpcoming ? 'border-amber-500/20' : 'border-red-500/20'} flex items-start gap-3 sm:gap-4 shrink-0`}>
          <div className={`p-3 rounded-full ${isUpcoming ? 'bg-amber-500/20 text-amber-500' : 'bg-red-500/20 text-red-500'} shrink-0`}>
            <AlertTriangle size={32} className={!isExpired ? "animate-pulse" : ""} />
          </div>
          
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                isExpired ? 'bg-earth-border/40 text-earth-elevated' :
                isUpcoming ? 'bg-amber-500 text-[#12120e]' : 'bg-red-500 text-white animate-pulse'
              }`}>
                {isExpired ? 'Expired' : isUpcoming ? 'Warning' : 'Critical Emergency'}
              </span>
              <span className="text-[10px] text-gold-100/50 uppercase tracking-widest font-semibold">
                {alert.sender_name || 'National Weather Service'}
              </span>
            </div>
            <DialogTitle className={`text-xl md:text-2xl font-black tracking-tight ${isUpcoming ? 'text-amber-400' : 'text-red-500'}`}>
              {alert.event_type}
            </DialogTitle>
          </div>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto">
          
          <div className="flex flex-col sm:flex-row gap-4 bg-[#12120e] p-4 rounded-xl border border-earth-border/40">
            <div className="flex-1 flex gap-3 items-start">
              <Clock className="w-4 h-4 text-[#C9A84C] mt-0.5" />
              <div>
                <p className="text-[10px] text-gold-100/50 uppercase tracking-wider font-bold mb-1">Effective Time</p>
                <p className="text-xs font-medium text-[#f0ece0]">{formatTime(alert.start)}</p>
                <p className="text-[10px] text-gold-100/70 mt-0.5">To: {formatTime(alert.end)}</p>
              </div>
            </div>
            
            <div className="hidden sm:block w-px bg-earth-border/40" />
            
            <div className="flex-1 flex gap-3 items-start">
              <MapPin className="w-4 h-4 text-[#C9A84C] mt-0.5" />
              <div>
                <p className="text-[10px] text-gold-100/50 uppercase tracking-wider font-bold mb-1">Impact Area</p>
                <p className="text-xs font-medium text-[#f0ece0]">Your Registered Farm Location</p>
                <p className="text-[10px] text-gold-100/70 mt-0.5">Based on GPS / District</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold text-[#C9A84C] uppercase tracking-wider mb-3 border-b border-earth-border/30 pb-1">
              Emergency Details & Description
            </h3>
            <div className="prose prose-invert prose-p:text-gold-100/80 prose-p:leading-relaxed max-w-none text-xs">
              {alert.description.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-2">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          {!isExpired && (
            <div className={`p-3 rounded-lg border ${isUpcoming ? 'bg-amber-500/5 border-amber-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
              <h4 className={`text-xs font-bold flex items-center gap-1.5 mb-1.5 ${isUpcoming ? 'text-amber-500' : 'text-red-500'}`}>
                <ShieldAlert className="w-3.5 h-3.5" /> Farmer Advisory
              </h4>
              <p className="text-[10px] text-gold-100/70 leading-relaxed">
                Please take necessary precautions to protect your crops, livestock, and equipment. 
                Secure loose items, delay scheduled chemical applications if heavy rain or wind is expected, 
                and ensure adequate drainage in low-lying fields. Safety of personnel is the highest priority.
              </p>
            </div>
          )}
          
        </div>
        
        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-earth-border/40 flex justify-end bg-[#12120e] shrink-0">
          <Button onClick={onClose} variant="outline" className="border-[#C9A84C] text-[#C9A84C] hover:bg-[#C9A84C]/10 text-xs h-8 px-4">
            Acknowledge & Close
          </Button>
        </div>

      </DialogContent>
    </Dialog>
  );
}
