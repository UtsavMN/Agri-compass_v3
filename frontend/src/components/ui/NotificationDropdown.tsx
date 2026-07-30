import React, { useState, useEffect, useRef } from 'react';
import { Bell, CloudLightning, FileText, Sprout } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiGet } from '@/lib/httpClient';
import { useOnClickOutside } from '@/hooks/useOnClickOutside';

interface Notification {
  id: string;
  type: 'POST' | 'FARM_UPDATE' | 'WEATHER_ALERT';
  message: string;
  timestamp: string;
  link: string;
  authorName?: string;
  authorAvatar?: string;
  alertData?: string; // Stored JSON of weather alert
}

export const NotificationDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasUnread, setHasUnread] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useOnClickOutside(dropdownRef, () => setIsOpen(false));

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        // Load local history
        const localHistoryStr = localStorage.getItem('agri_compass_notification_history');
        const localHistory: Notification[] = localHistoryStr ? JSON.parse(localHistoryStr) : [];

        // Fetch from Java Backend
        const backendRes = await apiGet('/api/notifications').catch(() => ({ notifications: [] }));
        let backendNotifs = backendRes?.notifications || [];

        // Fetch from Node Weather Service
        const weatherRes = await fetch('http://localhost:5000/api/weather-alerts?lat=19.0760&lon=72.8777')
          .then(res => res.json())
          .catch(() => ({ alerts: [] }));
        
        const weatherNotifs: Notification[] = (weatherRes.alerts || [])
          .filter((alert: any) => {
            const currentTime = Math.floor(Date.now() / 1000);
            return currentTime >= alert.start && currentTime <= alert.end;
          })
          .map((alert: any) => ({
          id: alert.alert_id,
          type: 'WEATHER_ALERT',
          message: `Severe Weather: ${alert.event_type} - ${alert.description}`,
          timestamp: new Date(alert.start * 1000).toISOString(),
          link: `?alertId=${alert.alert_id}`,
          authorName: 'Weather Advisor',
          alertData: JSON.stringify(alert)
        }));

        // Merge all sources
        const combined = [...localHistory, ...backendNotifs, ...weatherNotifs];
        
        // Remove duplicates by ID
        const uniqueMap = new Map();
        combined.forEach(n => {
          if (!uniqueMap.has(n.id)) {
            uniqueMap.set(n.id, n);
          }
        });
        const allNotifications = Array.from(uniqueMap.values());

        // Sort by timestamp descending
        allNotifications.sort((a, b) => {
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        });

        // Limit to 100 notifications to prevent unbounded growth
        const limitedNotifications = allNotifications.slice(0, 100);

        // Save back to localStorage
        localStorage.setItem('agri_compass_notification_history', JSON.stringify(limitedNotifications));
        
        // Calculate unread status
        const lastRead = localStorage.getItem('agri_compass_last_read_notifications');
        const lastReadTimestamp = lastRead ? parseInt(lastRead, 10) : 0;
        
        const unreadExists = limitedNotifications.some(n => new Date(n.timestamp).getTime() > lastReadTimestamp);
        setHasUnread(unreadExists);

        setNotifications(limitedNotifications);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // refresh every minute
    return () => clearInterval(interval);
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'WEATHER_ALERT': return <CloudLightning className="text-amber-400 w-4 h-4" />;
      case 'POST': return <FileText className="text-blue-400 w-4 h-4" />;
      case 'FARM_UPDATE': return <Sprout className="text-green-400 w-4 h-4" />;
      default: return <Bell className="text-gold-400 w-4 h-4" />;
    }
  };

  const handleNotificationClick = (link: string) => {
    setIsOpen(false);
    navigate(link);
  };

  const handleToggleOpen = () => {
    const nextIsOpen = !isOpen;
    setIsOpen(nextIsOpen);
    if (nextIsOpen) {
      setHasUnread(false);
      localStorage.setItem('agri_compass_last_read_notifications', Date.now().toString());
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleToggleOpen}
        className="relative p-2 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 flex items-center justify-center rounded-lg hover:bg-[#C9A84C]/5 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5 text-[#F5F0E8]" />
        {hasUnread && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#12120e]" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 max-h-[400px] overflow-y-auto bg-[#1a1a14] border border-earth-border/40 rounded-xl shadow-xl z-50 animate-in fade-in slide-in-from-top-2">
          <div className="p-3 border-b border-earth-border/40 flex justify-between items-center bg-[#12120e] rounded-t-xl">
            <h3 className="text-[#f0ece0] font-bold text-sm tracking-wider uppercase">Notifications</h3>
            <span className="text-xs bg-[#c49a2a]/20 text-[#c49a2a] px-2 py-0.5 rounded-full font-bold">
              {notifications.length}
            </span>
          </div>

          <div className="divide-y divide-earth-border/20">
            {loading && notifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-gold-100/50">Loading notifications...</div>
            ) : notifications.length > 0 ? (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif.link)}
                  className="p-3 hover:bg-[#c49a2a]/5 cursor-pointer transition-colors flex gap-3 items-start"
                >
                  <div className="w-8 h-8 rounded-full bg-[#12120e] border border-earth-border/40 flex items-center justify-center shrink-0 overflow-hidden">
                    {notif.authorAvatar ? (
                      <img src={notif.authorAvatar} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                      getIcon(notif.type)
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-[#e2dcd0] leading-snug">
                      {notif.authorName && <span className="font-bold text-[#c49a2a] mr-1">{notif.authorName}</span>}
                      {notif.type === 'WEATHER_ALERT' ? notif.message : `posted: ${notif.message.substring(0, 50)}${notif.message.length > 50 ? '...' : ''}`}
                    </p>
                    <span className="text-[10px] text-gold-100/40 mt-1 block">
                      {new Date(notif.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-xs text-gold-100/50">
                <Bell className="w-6 h-6 mx-auto mb-2 opacity-20" />
                No new notifications
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
