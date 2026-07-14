// src/components/Layout.tsx
import { ReactNode, useState, useEffect } from 'react';
import { KrishiMitraFloat } from '@/components/ai/KrishiMitraFloat';
import { VoiceCommandModal } from '@/components/ai/VoiceCommandModal';
import { HelpModal } from '@/components/layout/HelpModal';
import { SettingsModal } from '@/components/layout/SettingsModal';
import { FallingLeaves } from '@/components/ui/animations/FallingLeaves';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useClerk } from '@clerk/clerk-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useDistrict, useUser } from '@/store';
import { apiGet } from '@/lib/httpClient';
import { cn } from '@/lib/utils';
import { useOnboardingGate } from '@/hooks/useOnboardingGate';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Home,
  Sprout,
  TrendingUp,
  FileText,
  _User,
  _LogOut,
  Menu,
  _Cloud,
  X,
  Languages,
  Settings,
  MessageSquare,
  Leaf,
  MapPin,
  Mic,
  MoreVertical,
  HelpCircle,
  Info,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';


interface LayoutProps {
  children: ReactNode;
  fullBleed?: boolean;
  hideHeader?: boolean;
  hideSidebar?: boolean; // Kept for interface compatibility, unused visually now
}


import { WeatherChip } from '@/components/layout/WeatherChip';

export default function Layout({
  children,
  _fullBleed = false,
  hideHeader = false,
}: LayoutProps) {
  const { user, _profile, signOut } = useUser();
  const { openUserProfile } = useClerk();
  const { language, toggleLanguage, t } = useLanguage();
  const { selectedDistrict, _setSelectedDistrict } = useDistrict();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useOnboardingGate();

  useEffect(() => {
    if (!user) return;
    let timeoutId: number;
    let isMounted = true;

    const fetchUnread = () => {
      if (!isMounted) return;
      apiGet('/api/conversations/unread-count', null)
        .then((res: any) => {
          if (!isMounted) return;
          if (res && typeof res.count === 'number') {
            setUnreadCount(res.count);
          }
        })
        .catch((err) => {
          if (isMounted) console.error(err);
        })
        .finally(() => {
          if (isMounted) {
            timeoutId = window.setTimeout(fetchUnread, 15000); // Poll every 15s
          }
        });
    };

    fetchUnread();

    return () => {
      isMounted = false;
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const navItems = [
    { path: '/dashboard', label: t('nav.dashboard', 'Dashboard'), icon: Home },
    { path: '/crops', label: t('nav.crops', 'Crops'), icon: Leaf },
    { path: '/community', label: t('nav.community', 'Community'), icon: MessageSquare },
    { path: '/my-farm', label: t('nav.myFarm', 'My Farm'), icon: Sprout },
    { path: '/market-prices', label: t('nav.marketPrices', 'Market Prices'), icon: TrendingUp },
    { path: '/schemes', label: t('nav.schemes', 'Gov Schemes'), icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-earth-main flex flex-col text-[#e2dcd0] relative overflow-hidden">
      {/* Global Background */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: "url('/plant-background-mh4y9mexexlv960o.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.25,
          filter: 'brightness(0.8) sepia(0.6) hue-rotate(10deg) saturate(1.2)'
        }}
      />
      {/* ===== FLOATING GLASS NAVBAR ===== */}
      {!hideHeader && (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-earth-main/80 backdrop-blur-xl border-b border-earth-border/40 px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between transition-all duration-300">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5 cursor-pointer animate-fade-in" onClick={() => navigate('/dashboard')}>
              <Sprout className="h-6.5 w-6.5 text-gold-400" />
              <span className="font-bold text-gradient-gold text-base tracking-widest font-sans hidden sm:block">AGRI COMPASS</span>
            </div>
            {/* Top-Left Weather Widget */}
            <div className="animate-fade-in" style={{ animationDelay: '100ms' }}>
              <WeatherChip district={selectedDistrict} />
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden xl:flex items-center gap-8 text-[11px] font-bold tracking-widest">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "transition-all pb-1 uppercase font-black border-b-2",
                    isActive
                      ? "text-gold-400 border-gold-400"
                      : "text-gold-100/50 border-transparent hover:text-gold-200 hover:border-gold-400/20"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Actions & Widgets */}
          <div className="flex items-center gap-3">
            {/* Language Toggle Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLanguage}
              className="hidden sm:flex h-8 px-2 rounded-full border border-earth-border/40 text-gold-100/60 hover:text-gold-200 items-center gap-1.5 bg-[#1a1a14]/60 hover:bg-[#1a1a14]/90 transition-colors"
              title="Toggle Language / ಭಾಷೆಯನ್ನು ಬದಲಾಯಿಸಿ"
            >
              <Languages className="h-3.5 w-3.5 text-gold-400" />
              <span className="text-[10px] font-bold uppercase">{language === 'en' ? 'EN' : 'KN'}</span>
            </Button>

            {/* Voice Command Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVoiceOpen(true)}
              className="hidden sm:flex h-8 px-2.5 rounded-full border border-earth-border/40 text-gold-100/60 hover:text-gold-200 items-center gap-1.5 bg-[#1a1a14]/60 hover:bg-[#1a1a14]/90 transition-colors animate-pulse"
              title="Voice Commands / ಧ್ವನಿ ಆಜ್ಞೆಗಳು"
            >
              <Mic className="h-3.5 w-3.5 text-gold-400" />
              <span className="text-[10px] font-bold uppercase">ಧ್ವನಿ</span>
            </Button>

            {/* District Display (Read-Only) */}
            <div className="hidden sm:flex items-center h-8 px-3 border border-earth-border/40 bg-[#1a1a14]/60 text-gold-100/90 text-[11px] font-bold tracking-widest uppercase rounded-xl">
              <MapPin className="w-3.5 h-3.5 mr-2 text-gold-400" />
              {selectedDistrict || 'NO DISTRICT'}
            </div>            {/* Messages Button */}
            {user && (
              <button
                onClick={() => navigate('/messages')}
                className="relative p-2 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 flex items-center justify-center rounded-lg hover:bg-[#C9A84C]/5 transition-colors"
                aria-label="Messages">
                <MessageSquare className="h-5 w-5 text-[#F5F0E8]" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-[#C9A84C] rounded-full text-[#0A0A0A] text-[10px] font-bold flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
            )}

            {/* Profile Avatar Button */}
            {user && (
              <button
                onClick={() => navigate('/profile')}
                className="min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 sm:h-8 sm:w-8 flex items-center justify-center rounded-full overflow-hidden border border-earth-border/60 hover:border-gold-400/50 transition-colors focus:outline-none"
              >
                <img src={user.imageUrl} alt="Profile" className="h-8 w-8 rounded-full object-cover" />
              </button>
            )}

            {/* Options Menu (Kebab) */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 sm:h-8 sm:w-8 rounded-full border border-earth-border/40 hover:border-gold-400/50 text-gold-100/60 hover:text-gold-200 bg-[#1a1a14]/60 hover:bg-[#1a1a14]/90 transition-colors flex items-center justify-center focus:outline-none">
                  <MoreVertical className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-[#12120e] border border-earth-border/40 text-gold-100">
                <DropdownMenuLabel className="text-gold-400">Options</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-earth-border/40" />
                <DropdownMenuItem className="hover:bg-earth-elevated/20 cursor-pointer focus:bg-earth-elevated/20" onSelect={() => setIsSettingsOpen(true)}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-earth-elevated/20 cursor-pointer focus:bg-earth-elevated/20" onSelect={() => setIsHelpOpen(true)}>
                  <HelpCircle className="mr-2 h-4 w-4" />
                  <span>Help</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-earth-elevated/20 cursor-pointer focus:bg-earth-elevated/20" onSelect={() => window.open('https://agri-compass-dashboard.vercel.app/', '_blank')}>
                  <Info className="mr-2 h-4 w-4" />
                  <span>About Us</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </nav>
      )}

      {/* ===== MOBILE NAV DRAWER ===== */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black xl:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            {/* Drawer Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-[280px] z-50 bg-[#0f0f0b] border-l border-earth-border/40 shadow-premium flex flex-col p-6 xl:hidden"
            >
              {/* Header inside drawer */}
              <div className="flex items-center justify-between pb-6 border-b border-earth-border/40 mb-6">
                <div className="flex items-center gap-2">
                  <Sprout className="h-5 w-5 text-gold-400" />
                  <span className="font-bold text-gradient-gold text-sm tracking-widest font-sans">AGRI COMPASS</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-gold-100/60 hover:text-gold-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Navigation links removed from drawer (now in bottom nav) */}
              <div className="flex-1 overflow-y-auto py-2">
                {/* Reserved for future drawer items */}
              </div>

              {/* Bottom Info / Action Drawer Area */}
              <div className="border-t border-earth-border/40 pt-6 mt-auto space-y-4">
                {/* Language Toggle Selection */}
                <div className="flex items-center justify-between p-3.5 bg-[#1a1a14]/60 border border-earth-border/40 rounded-xl">
                  <span className="text-[10px] text-gold-100/40 font-bold uppercase tracking-widest">Language</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      toggleLanguage();
                      setMobileMenuOpen(false);
                    }}
                    className="min-h-[44px] border-gold-400/30 text-gold-400 hover:bg-gold-400/10 text-[10px] font-bold uppercase rounded-lg"
                  >
                    {language === 'en' ? 'English (ಕನ್ನಡ)' : 'ಕನ್ನಡ (English)'}
                  </Button>
                </div>

                {/* Voice Navigation Selection */}
                <div className="flex items-center justify-between p-3.5 bg-[#1a1a14]/60 border border-earth-border/40 rounded-xl">
                  <span className="text-[10px] text-gold-100/40 font-bold uppercase tracking-widest">Voice Control</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsVoiceOpen(true);
                      setMobileMenuOpen(false);
                    }}
                    className="min-h-[44px] border-gold-400/30 text-gold-400 hover:bg-gold-400/10 text-[10px] font-bold uppercase rounded-lg flex items-center gap-1.5"
                  >
                    <Mic className="h-3.5 w-3.5 text-gold-400" />
                    ಮಾತನಾಡಿ / Speak
                  </Button>
                </div>



                {/* Profile Link and Sign Out */}
                <div className="flex flex-col gap-2 pt-2">
                  <Button
                    onClick={() => {
                      navigate('/profile');
                      setMobileMenuOpen(false);
                    }}
                    className="min-h-[44px] w-full bg-[#1a1a14] border border-earth-border/60 hover:bg-earth-card text-gold-100 text-xs font-black uppercase tracking-widest py-3 rounded-xl"
                  >
                    Profile Settings
                  </Button>
                  <Button
                    onClick={() => {
                      openUserProfile();
                      setMobileMenuOpen(false);
                    }}
                    className="min-h-[44px] w-full bg-[#1a1a14] border border-earth-border/60 hover:bg-earth-card text-gold-100 text-xs font-black uppercase tracking-widest py-3 rounded-xl"
                  >
                    Manage Account (Clerk)
                  </Button>
                  <Button
                    onClick={handleSignOut}
                    className="min-h-[44px] w-full bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 text-xs font-black uppercase tracking-widest py-3 rounded-xl"
                  >
                    Sign Out
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ===== MAIN CONTENT ===== */}
      <main className="flex-1 w-full z-10 relative pb-24 xl:pb-0">
        {children}
      </main>

      {/* ===== MOBILE BOTTOM NAVIGATION BAR ===== */}
      {!hideHeader && (
        <div className="xl:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0A0A0A]/95 backdrop-blur-xl border-t border-earth-border/40 pb-2 pt-2 px-2 flex items-center justify-start sm:justify-around overflow-x-auto snap-x shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "snap-center shrink-0 min-h-[48px] min-w-[64px] flex flex-col items-center justify-center p-2 rounded-xl transition-all",
                  isActive ? "text-gold-400" : "text-gold-100/50 hover:text-gold-100"
                )}
              >
                <Icon className={cn("h-5 w-5 mb-1", isActive ? "scale-110 drop-shadow-[0_0_8px_rgba(201,168,76,0.5)]" : "")} />
                <span className="text-[9px] font-bold uppercase tracking-wider">{item.label}</span>
              </Link>
            );
          })}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="snap-center shrink-0 min-h-[48px] min-w-[64px] flex flex-col items-center justify-center p-2 rounded-xl text-gold-100/50 hover:text-gold-100 transition-all ml-auto"
          >
            <Menu className="h-5 w-5 mb-1" />
            <span className="text-[9px] font-bold uppercase tracking-wider">Menu</span>
          </button>
        </div>
      )}

      {/* Floating KrishiMitra Assistant */}
      <KrishiMitraFloat />

      {/* Voice Command Dialog Overlay */}
      <VoiceCommandModal isOpen={isVoiceOpen} onClose={() => setIsVoiceOpen(false)} />

      {/* Help Modal Overlay */}
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

      {/* Settings Modal Overlay */}
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

      {/* Global Ambient Animation */}
      <FallingLeaves />
    </div>
  );
}

