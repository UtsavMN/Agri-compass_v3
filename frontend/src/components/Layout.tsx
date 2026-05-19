import { ReactNode } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollReveal } from '@/components/ui/animations';
import {
  Home,
  Sprout,
  TrendingUp,
  HelpCircle,
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
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, profile, signOut } = useAuth();
  const { toggleLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/crops', label: 'Crops', icon: Leaf },
    { path: '/soil-analysis', label: 'Soil AI', icon: Sparkles },
    { path: '/community', label: 'Community', icon: MessageSquare },
    { path: '/my-farm', label: 'My Farm', icon: Sprout },
    { path: '/market-prices', label: 'Market Prices', icon: TrendingUp },
    { path: '/schemes', label: 'Gov Schemes', icon: FileText },
    { path: '/air-agent', label: 'AI Agent', icon: HelpCircle },
    { path: '/weather', label: 'Weather', icon: Cloud },
  ];

  const bottomNavItems = [
    { path: '/profile', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-main)' }}>
      {/* ===== SIDEBAR (Desktop) ===== */}
      <aside className="hidden lg:flex flex-col w-60 border-r fixed h-screen z-40"
        style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}>

        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 h-16 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
          <Sprout className="h-7 w-7" style={{ color: 'var(--accent)' }} />
          <span className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
            Agri Compass
          </span>
        </div>

        {/* Scrollable Nav Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
          {/* Nav Items */}
          <nav className="flex-1 px-3 py-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path}>
                  <div
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                        ? 'text-gold-400'
                        : 'hover:text-gold-300'
                      }`}
                    style={{
                      background: isActive ? 'var(--accent-soft)' : 'transparent',
                      color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                    }}
                  >
                    <Icon className="h-4.5 w-4.5 flex-shrink-0" style={{ width: '18px', height: '18px' }} />
                    <span>{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Bottom nav items */}
          <div className="px-3 pb-4 space-y-1 border-t pt-3 mt-auto" style={{ borderColor: 'var(--border-subtle)' }}>
            {bottomNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path}>
                  <div
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200"
                    style={{
                      background: isActive ? 'var(--accent-soft)' : 'transparent',
                      color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                    }}
                  >
                    <Icon className="h-4.5 w-4.5 flex-shrink-0" style={{ width: '18px', height: '18px' }} />
                    <span>{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </aside>

      {/* ===== MAIN CONTENT ===== */}
      <div className="flex-1 lg:ml-60 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header
          className="sticky top-0 z-30 flex items-center justify-between h-14 px-4 sm:px-6 border-b"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}
        >
          {/* Mobile: hamburger + logo */}
          <div className="flex items-center gap-3 lg:hidden">
            <button onClick={() => setMobileMenuOpen(true)} className="p-1.5 rounded-lg" style={{ color: 'var(--text-secondary)' }}>
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <Sprout className="h-5 w-5" style={{ color: 'var(--accent)' }} />
              <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Agri Compass</span>
            </div>
          </div>

          {/* Desktop: top bar nav links */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.slice(0, 7).map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path}>
                  <span
                    className="text-xs font-medium px-3 py-1.5 rounded-md transition-all duration-200"
                    style={{
                      color: isActive ? 'var(--accent)' : 'var(--text-muted)',
                      background: isActive ? 'var(--accent-soft)' : 'transparent',
                    }}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleLanguage}
              className="rounded-full h-8 w-8"
              style={{ color: 'var(--text-secondary)' }}
              title="Toggle Language"
            >
              <Languages className="h-4 w-4" />
            </Button>

            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="h-8 w-8 rounded-full flex items-center justify-center transition-all"
                    style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
                  >
                    <User className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56" style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}>
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                        {profile?.full_name || profile?.username || 'User'}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{user.primaryEmailAddress?.emailAddress}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator style={{ background: 'var(--border-subtle)' }} />
                  <DropdownMenuItem onClick={() => navigate('/profile')} style={{ color: 'var(--text-secondary)' }}>
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut} style={{ color: 'var(--text-secondary)' }}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>

      {/* ===== MOBILE MENU OVERLAY ===== */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 lg:hidden"
            style={{ background: 'rgba(0,0,0,0.6)' }}
            onClick={() => setMobileMenuOpen(false)}
          >
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 h-full w-72 shadow-2xl"
              style={{ background: 'var(--bg-card)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                <div className="flex items-center gap-2">
                  <Sprout className="h-6 w-6" style={{ color: 'var(--accent)' }} />
                  <span className="font-bold" style={{ color: 'var(--text-primary)' }}>Agri Compass</span>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--text-muted)' }}>
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-3 space-y-1">
                {[...navItems, ...bottomNavItems].map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <button
                      key={item.path}
                      className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 text-left"
                      style={{
                        background: isActive ? 'var(--accent-soft)' : 'transparent',
                        color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                      }}
                      onClick={() => {
                        navigate(item.path);
                        setMobileMenuOpen(false);
                      }}
                    >
                      <Icon style={{ width: '18px', height: '18px' }} />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
