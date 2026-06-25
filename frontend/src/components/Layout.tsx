// src/components/Layout.tsx
import { ReactNode, useState, useEffect } from 'react';
import { KrishiMitraFloat } from '@/components/ai/KrishiMitraFloat';
import { VoiceCommandModal } from '@/components/ai/VoiceCommandModal';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useUser, UserButton } from '@clerk/clerk-react';
import { DMPanel } from '@/components/DMPanel';
import { useLanguage } from '@/contexts/LanguageContext';
import { useDistrict } from '@/store';
import { apiGet } from '@/lib/httpClient';
import { cn } from '@/lib/utils';
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
  User,
  LogOut,
  Menu,
  Cloud,
  X,
  Languages,
  Settings,
  MessageSquare,
  Leaf,
  MapPin,
  Mic,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface LayoutProps {
  children: ReactNode;
  fullBleed?: boolean;
  hideHeader?: boolean;
  hideSidebar?: boolean; // Kept for interface compatibility, unused visually now
}

import { DISTRICTS } from '@/data/masterData';
import { WeatherChip } from '@/components/layout/WeatherChip';

export default function Layout({
  children,
  fullBleed = false,
  hideHeader = false,
}: LayoutProps) {
  const { user, profile, signOut } = useUser();
  const { language, toggleLanguage, t } = useLanguage();
  const { selectedDistrict, setSelectedDistrict } = useDistrict();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);


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
    <div className="min-h-screen bg-[#0f0f0b] flex flex-col text-[#e2dcd0]">
      {/* ===== FLOATING GLASS NAVBAR ===== */}
      {!hideHeader && (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0f0f0b]/80 backdrop-blur-md border-b border-earth-border/40 px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between transition-all duration-300">
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
              className="h-8 px-2 rounded-full border border-earth-border/40 text-gold-100/60 hover:text-gold-200 flex items-center gap-1.5 bg-[#1a1a14]/60 hover:bg-[#1a1a14]/90 transition-colors"
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
              className="h-8 px-2.5 rounded-full border border-earth-border/40 text-gold-100/60 hover:text-gold-200 flex items-center gap-1.5 bg-[#1a1a14]/60 hover:bg-[#1a1a14]/90 transition-colors animate-pulse"
              title="Voice Commands / ಧ್ವನಿ ಆಜ್ಞೆಗಳು"
            >
              <Mic className="h-3.5 w-3.5 text-gold-400" />
              <span className="text-[10px] font-bold uppercase">ಧ್ವನಿ</span>
            </Button>

            {/* Global District Selector */}
            <div className="flex items-center gap-1.5 bg-[#1a1a14]/90 border border-earth-border/80 rounded-full px-2.5 py-1 text-[10px] font-bold text-gold-100 transition-all hover:border-gold-400/40">
              <MapPin className="h-3.5 w-3.5 text-gold-400 animate-pulse" />
              <Select value={selectedDistrict || 'Bengaluru Urban'} onValueChange={setSelectedDistrict}>
                <SelectTrigger className="w-24 bg-transparent border-none focus:ring-0 h-auto p-0 text-[10px] font-bold text-gold-100 uppercase notranslate" translate="no">
                  <SelectValue placeholder="Select District" />
                </SelectTrigger>
                <SelectContent className="bg-earth-elevated border-earth-border notranslate" translate="no">
                  {Object.keys(DISTRICTS).sort().map((d) => (
                    <SelectItem key={d} value={d} className="text-gold-100 hover:bg-earth-card text-[10px]">
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>



            {/* DMPanel */}
            {user && <DMPanel />}

            {/* Profile Avatar Button (Clerk) */}
            {user && (
              <div className="h-8 w-8 flex items-center justify-center">
                <UserButton afterSignOutUrl="/auth" />
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <button 
              className="xl:hidden p-1.5 rounded-lg text-gold-100/70 hover:text-gold-100 hover:bg-earth-card/50 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </button>
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
                  className="p-1 rounded-lg text-gold-100/60 hover:text-gold-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Navigation links */}
              <div className="flex-1 overflow-y-auto space-y-1 py-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-bold tracking-widest uppercase transition-all duration-200",
                        isActive 
                          ? "bg-gold-400/10 text-gold-400 border border-gold-400/20" 
                          : "text-gold-100/60 hover:text-gold-200 hover:bg-earth-elevated/20"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  );
                })}
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
                    className="border-gold-400/30 text-gold-400 hover:bg-gold-400/10 text-[10px] font-bold uppercase rounded-lg"
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
                    className="border-gold-400/30 text-gold-400 hover:bg-gold-400/10 text-[10px] font-bold uppercase rounded-lg flex items-center gap-1.5"
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
                    className="w-full bg-[#1a1a14] border border-earth-border/60 hover:bg-earth-card text-gold-100 text-xs font-black uppercase tracking-widest py-3 rounded-xl"
                  >
                    Profile Settings
                  </Button>
                  <Button
                    onClick={handleSignOut}
                    className="w-full bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 text-xs font-black uppercase tracking-widest py-3 rounded-xl"
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
      <main className="flex-1 w-full z-10 relative">
        {children}
      </main>

      {/* Floating KrishiMitra Assistant */}
      <KrishiMitraFloat />

      {/* Voice Command Dialog Overlay */}
      <VoiceCommandModal isOpen={isVoiceOpen} onClose={() => setIsVoiceOpen(false)} />
    </div>
  );
}

