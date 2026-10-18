import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Bell, 
  CloudLightning, 
  FileText, 
  Sprout, 
  ShoppingCart, 
  Heart, 
  MessageCircle, 
  UserPlus, 
  CheckCheck,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useUser } from '@clerk/clerk-react';
import { apiGet, apiPost, buildUrl } from '@/lib/httpClient';
import { useOnClickOutside } from '@/hooks/useOnClickOutside';
import { formatRelativeTime } from '@/lib/dateUtils';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export interface NotificationItem {
  id: string;
  type: 'LIKE' | 'COMMENT' | 'FOLLOW' | 'FOLLOW_REQUEST' | 'MARKETPLACE_INTEREST' | 'WEATHER_ALERT' | 'POST' | 'FARM_UPDATE' | string;
  message: string;
  timestamp: string;
  link: string;
  authorName?: string;
  authorAvatar?: string;
  senderUserId?: string;
  isRead?: boolean;
}

export const NotificationDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasUnread, setHasUnread] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const stompRef = useRef<Client | null>(null);
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { user } = useUser();

  useOnClickOutside(dropdownRef, () => setIsOpen(false));

  const fetchNotifications = useCallback(async () => {
    try {
      const token = await getToken();
      
      // 1. Fetch Java Backend notifications & unread count
      const backendRes = await apiGet('/api/notifications', token).catch(() => ({ notifications: [], unreadCount: 0 }));
      const backendNotifs: NotificationItem[] = backendRes?.notifications || [];

      // 2. Fetch real weather alerts from Spring Boot WeatherController
      const weatherRes = await apiGet('/api/weather/Bengaluru', token).catch(() => ({ alerts: [] }));
      let readWeatherAlerts = new Set<string>();
      try {
        readWeatherAlerts = new Set<string>(JSON.parse(localStorage.getItem('agri_read_weather_alerts') || '[]'));
      } catch (e) {}

      const weatherNotifs: NotificationItem[] = (weatherRes?.alerts || []).map((alert: any, index: number) => {
        const rawKey = alert.id || alert.effective || `${alert.event || 'alert'}-${alert.headline || index}`;
        const alertId = `weather-alert-${String(rawKey).replace(/\s+/g, '_')}`;
        return {
          id: alertId,
          type: 'WEATHER_ALERT',
          message: `Severe Weather: ${alert.event || alert.headline || 'Alert'} - ${alert.desc || alert.description || 'Check local weather advisory'}`,
          timestamp: alert.effective ? new Date(alert.effective).toISOString() : new Date().toISOString(),
          link: '/weather',
          authorName: 'Weather Alert',
          isRead: readWeatherAlerts.has(alertId),
        };
      });

      // Combine and deduplicate
      const combined = [...backendNotifs, ...weatherNotifs];
      const uniqueMap = new Map<string, NotificationItem>();
      combined.forEach((n) => {
        if (!uniqueMap.has(n.id)) {
          uniqueMap.set(n.id, n);
        }
      });
      const allNotifications = Array.from(uniqueMap.values());

      allNotifications.sort((a, b) => {
        const timeA = new Date(a.timestamp || 0).getTime();
        const timeB = new Date(b.timestamp || 0).getTime();
        return timeB - timeA;
      });

      const limited = allNotifications.slice(0, 50);
      setNotifications(limited);

      // Compute unread state
      const unreadCount = Number(backendRes?.unreadCount ?? 0);
      const anyUnreadInList = limited.some((n) => n.isRead === false);
      const hasAnyUnread = unreadCount > 0 || anyUnreadInList;
      setHasUnread(hasAnyUnread);

    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  // Initial fetch and polling every 20s
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 20000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // WebSocket real-time notification push
  useEffect(() => {
    if (!user?.id) return;

    const client = new Client({
      webSocketFactory: () => new SockJS(buildUrl('/ws')),
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe(`/topic/notifications.${user.id}`, (frame) => {
          try {
            const newNotif: NotificationItem = JSON.parse(frame.body);
            setNotifications((prev) => {
              const filtered = prev.filter((p) => p.id !== newNotif.id);
              return [{ ...newNotif, isRead: false }, ...filtered];
            });
            setHasUnread(true);
          } catch (e) {
            console.error('Failed to parse incoming notification frame', e);
          }
        });
      },
    });

    client.activate();
    stompRef.current = client;

    return () => {
      client.deactivate();
    };
  }, [user?.id]);

  // Listen to custom global update event
  useEffect(() => {
    const handleUpdate = (e: any) => {
      if (e.detail?.count === 0) {
        setHasUnread(false);
      } else if (e.detail?.count > 0) {
        setHasUnread(true);
      } else {
        fetchNotifications();
      }
    };
    window.addEventListener('agri_unread_notifications_updated', handleUpdate);
    return () => window.removeEventListener('agri_unread_notifications_updated', handleUpdate);
  }, [fetchNotifications]);

  const markAllAsRead = async () => {
    setHasUnread(false);
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, isRead: true }));
      try {
        const readAlerts = new Set<string>(JSON.parse(localStorage.getItem('agri_read_weather_alerts') || '[]'));
        updated.forEach((n) => {
          if (n.type === 'WEATHER_ALERT') {
            readAlerts.add(n.id);
          }
        });
        localStorage.setItem('agri_read_weather_alerts', JSON.stringify(Array.from(readAlerts)));
      } catch (e) {}
      return updated;
    });
    try {
      const token = await getToken();
      await apiPost('/api/notifications/read-all', {}, token);
      window.dispatchEvent(new CustomEvent('agri_unread_notifications_updated', { detail: { count: 0 } }));
    } catch (err) {
      console.error('Failed to mark notifications read on server', err);
    }
  };

  const handleToggleOpen = () => {
    const nextIsOpen = !isOpen;
    setIsOpen(nextIsOpen);
    if (nextIsOpen && hasUnread) {
      // Mark all as read immediately when user views the notifications
      markAllAsRead();
    }
  };

  const handleNotificationClick = async (notif: NotificationItem) => {
    setIsOpen(false);
    if (!notif.isRead) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
      );
      if (notif.type === 'WEATHER_ALERT') {
        try {
          const readAlerts = new Set<string>(JSON.parse(localStorage.getItem('agri_read_weather_alerts') || '[]'));
          readAlerts.add(notif.id);
          localStorage.setItem('agri_read_weather_alerts', JSON.stringify(Array.from(readAlerts)));
        } catch (e) {}
      } else {
        try {
          const token = await getToken();
          await apiPost(`/api/notifications/${notif.id}/read`, {}, token);
        } catch (e) {
          // non-blocking
        }
      }
    }
    if (notif.link) {
      navigate(notif.link);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'LIKE':
        return <Heart className="text-rose-500 fill-rose-500/20 w-4 h-4" />;
      case 'COMMENT':
        return <MessageCircle className="text-sky-400 fill-sky-400/20 w-4 h-4" />;
      case 'FOLLOW':
      case 'FOLLOW_REQUEST':
        return <UserPlus className="text-emerald-400 w-4 h-4" />;
      case 'MARKETPLACE_INTEREST':
        return <ShoppingCart className="text-[#c49a2a] w-4 h-4" />;
      case 'WEATHER_ALERT':
        return <CloudLightning className="text-amber-400 w-4 h-4" />;
      case 'FARM_UPDATE':
        return <Sprout className="text-green-400 w-4 h-4" />;
      case 'POST':
        return <FileText className="text-blue-400 w-4 h-4" />;
      default:
        return <Bell className="text-gold-400 w-4 h-4" />;
    }
  };

  const renderNotificationText = (notif: NotificationItem) => {
    const author = notif.authorName || 'A farmer';

    switch (notif.type) {
      case 'LIKE':
        return (
          <>
            <span className="font-semibold text-[#f0ece0]">{author}</span>{' '}
            <span className="text-[#e2dcd0]/80">liked your post.</span>
          </>
        );
      case 'COMMENT':
        return (
          <>
            <span className="font-semibold text-[#f0ece0]">{author}</span>{' '}
            <span className="text-[#e2dcd0]/80">commented:</span>{' '}
            <span className="italic text-[#c49a2a]/90">
              "{notif.message.replace(/^[^\"]*\"?|\"?$/g, '')}"
            </span>
          </>
        );
      case 'FOLLOW':
        return (
          <>
            <span className="font-semibold text-[#f0ece0]">{author}</span>{' '}
            <span className="text-[#e2dcd0]/80">started following you.</span>
          </>
        );
      case 'FOLLOW_REQUEST':
        return (
          <>
            <span className="font-semibold text-[#f0ece0]">{author}</span>{' '}
            <span className="text-[#e2dcd0]/80">requested to follow you.</span>
          </>
        );
      case 'MARKETPLACE_INTEREST':
        return (
          <span className="text-[#e2dcd0]/90">
            {notif.message}
          </span>
        );
      case 'WEATHER_ALERT':
        return (
          <span className="text-amber-300 font-medium">
            {notif.message}
          </span>
        );
      default:
        return (
          <>
            {notif.authorName && (
              <span className="font-semibold text-[#f0ece0] mr-1">{notif.authorName}</span>
            )}
            <span className="text-[#e2dcd0]/80">{notif.message}</span>
          </>
        );
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={handleToggleOpen}
        className="relative p-2 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 flex items-center justify-center rounded-lg hover:bg-[#C9A84C]/5 transition-colors focus:outline-none"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5 text-[#F5F0E8] transition-transform hover:scale-105" />
        
        {/* Red Dot (disappears immediately once read) */}
        {hasUnread && (
          <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 border border-[#12120e] shadow-sm" />
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-84 sm:w-96 max-h-[460px] overflow-hidden bg-[#141410] border border-earth-border/50 rounded-2xl shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 flex flex-col">
          {/* Header */}
          <div className="px-4 py-3.5 border-b border-earth-border/40 flex justify-between items-center bg-[#0d0d09]/90 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <span className="text-[#f0ece0] font-bold text-xs tracking-wider uppercase">Notifications</span>
              {notifications.filter((n) => !n.isRead).length > 0 && (
                <span className="text-[10px] bg-red-500/20 text-red-400 border border-red-500/30 px-1.5 py-0.2 rounded-full font-bold">
                  {notifications.filter((n) => !n.isRead).length} new
                </span>
              )}
            </div>
            
            {notifications.some((n) => !n.isRead) && (
              <button
                onClick={markAllAsRead}
                className="text-[11px] text-[#c49a2a] hover:text-[#e4b73b] transition-colors flex items-center gap-1 font-medium focus:outline-none"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto divide-y divide-earth-border/20">
            {loading && notifications.length === 0 ? (
              <div className="py-12 text-center text-xs text-gold-100/50 flex flex-col items-center gap-2">
                <div className="w-5 h-5 border-2 border-[#c49a2a] border-t-transparent rounded-full animate-spin" />
                <span>Loading notifications...</span>
              </div>
            ) : notifications.length > 0 ? (
              notifications.map((notif) => {
                const isUnread = notif.isRead === false;
                return (
                  <div
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`p-3.5 cursor-pointer transition-colors flex gap-3 items-start group ${
                      isUnread 
                        ? 'bg-[#c49a2a]/10 hover:bg-[#c49a2a]/15 border-l-2 border-[#c49a2a]' 
                        : 'hover:bg-white/[0.04]'
                    }`}
                  >
                    {/* Avatar or Icon */}
                    <div className="relative w-9 h-9 rounded-full bg-[#1c1c16] border border-earth-border/50 flex items-center justify-center shrink-0 overflow-hidden shadow-inner">
                      {notif.authorAvatar ? (
                        <img src={notif.authorAvatar} alt="avatar" className="w-full h-full object-cover" />
                      ) : (
                        getIcon(notif.type)
                      )}
                      {/* Secondary badge for type icon if avatar is shown */}
                      {notif.authorAvatar && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#12120e] border border-earth-border/60 flex items-center justify-center">
                          {getIcon(notif.type)}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs leading-relaxed line-clamp-2">
                        {renderNotificationText(notif)}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[10px] text-gold-100/40">
                          {formatRelativeTime(notif.timestamp)}
                        </span>
                        {isUnread && (
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                        )}
                      </div>
                    </div>

                    {/* Arrow */}
                    <ChevronRight className="w-3.5 h-3.5 text-gold-100/30 group-hover:text-gold-100/70 transition-colors shrink-0 mt-1" />
                  </div>
                );
              })
            ) : (
              <div className="py-14 text-center px-4">
                <div className="w-12 h-12 rounded-full bg-earth-elevated/20 border border-earth-border/40 flex items-center justify-center mx-auto mb-3 text-gold-400/40">
                  <Sparkles className="w-5 h-5" />
                </div>
                <p className="text-xs font-semibold text-[#f0ece0]/70">No notifications yet</p>
                <p className="text-[11px] text-gold-100/40 mt-1 max-w-[200px] mx-auto">
                  Likes, comments, marketplace inquiries, and follows will appear here.
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-2 border-t border-earth-border/30 bg-[#0d0d09]/60 text-center">
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate('/community');
                }}
                className="text-[11px] text-gold-100/60 hover:text-gold-100 py-1 transition-colors font-medium"
              >
                View Community Feed
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
