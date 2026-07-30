import React, { useState, useEffect } from 'react';
import { AlertTriangle, X, Clock, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface WeatherAlertBannerProps {
  lat?: number;
  lon?: number;
}

interface Alert {
  alert_id: string;
  event_type: string;
  description: string;
  start: number;
  end: number;
  is_active: boolean;
}

export const WeatherAlertBanner: React.FC<WeatherAlertBannerProps> = ({ lat = 19.0760, lon = 72.8777 }) => {
  const [alert, setAlert] = useState<Alert | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setLoading(true);
        // Using explicit localhost port 5000 for the new Node.js microservice
        const response = await fetch(`http://localhost:5000/api/weather-alerts?lat=${lat}&lon=${lon}`);
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        
        if (data.alerts && data.alerts.length > 0) {
          // Find the first alert that hasn't ended
          const currentTime = Math.floor(Date.now() / 1000);
          const validAlert = data.alerts.find((a: Alert) => {
            const isHappening = currentTime >= a.start && currentTime <= a.end;
            return isHappening;
          });
          
          if (validAlert) {
            setAlert(validAlert);
          }
        }
      } catch (err) {
        console.error('Error fetching weather alerts:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
    
    // Refresh every 15 mins to check if alert has ended or new ones appeared
    const interval = setInterval(fetchAlerts, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, [lat, lon]);

  // Periodic check to auto-hide if time expires
  useEffect(() => {
    if (!alert) return;
    
    const checkExpiry = () => {
      const currentTime = Math.floor(Date.now() / 1000);
      if (currentTime > alert.end) {
        setAlert(null); // Unmount
      }
    };
    
    const interval = setInterval(checkExpiry, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [alert]);

  if (loading || error || !alert) return null;

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Only dismisses from current view. Refreshing will bring it back.
    setAlert(null);
  };

  const handleBannerClick = () => {
    navigate(`?alertId=${alert.alert_id}`);
  };

  const isUpcoming = Math.floor(Date.now() / 1000) < alert.start;

  const formatTime = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="relative animate-fade-in z-40 px-4 py-3 sm:px-6 lg:px-8 max-w-7xl mx-auto my-4 cursor-pointer" onClick={handleBannerClick}>
      <div className={`p-4 rounded-xl shadow-lg border-l-4 ${isUpcoming ? 'bg-amber-500/10 border-amber-500 text-amber-100 hover:bg-amber-500/20' : 'bg-red-500/10 border-red-500 text-red-100 hover:bg-red-500/20'} backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center gap-4 transition-colors`}>
        <div className={`p-2 rounded-full ${isUpcoming ? 'bg-amber-500/20 text-amber-500' : 'bg-red-500/20 text-red-500'} shrink-0`}>
          <AlertTriangle size={24} className="animate-pulse" />
        </div>
        
        <div className="flex-1 pr-0 sm:pr-24">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h3 className={`font-bold text-base sm:text-lg ${isUpcoming ? 'text-amber-400' : 'text-red-400'}`}>
              {isUpcoming ? 'Upcoming Severe Weather:' : 'Active Severe Weather:'} {alert.event_type}
            </h3>
            {isUpcoming && (
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                Warning
              </span>
            )}
            {!isUpcoming && (
              <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider animate-pulse">
                Critical
              </span>
            )}
          </div>
          
          <p className="text-xs sm:text-sm opacity-90 leading-relaxed mb-3 max-w-3xl line-clamp-3 sm:line-clamp-none">
            {alert.description}
          </p>
          
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs font-medium opacity-75">
            <div className="flex items-center gap-1.5">
              <Clock size={14} />
              <span>Starts: {formatTime(alert.start)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock size={14} />
              <span>Ends: {formatTime(alert.end)}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto mt-2 sm:mt-0 sm:absolute sm:top-4 sm:right-4 opacity-70 hover:opacity-100 shrink-0 border-t border-earth-border/20 sm:border-0 pt-3 sm:pt-0">
          <div className="flex items-center gap-1 text-xs font-semibold">
            <span>View Details</span>
            <ChevronRight size={16} />
          </div>
          <button 
            onClick={handleDismiss}
            className="p-1.5 sm:p-2 rounded-lg hover:bg-white/10 transition-colors ml-2"
            aria-label="Dismiss alert"
          >
            <X size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};
