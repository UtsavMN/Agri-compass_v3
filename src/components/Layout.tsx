import { ReactNode } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
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
  Sun,
  Moon,
  X,
  Languages,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, profile, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { toggleLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const navItems = [
    { path: '/', label: t('nav.community'), icon: Home },
    { path: '/dashboard', label: t('nav.dashboard'), icon: Home },
    { path: '/my-farm', label: t('nav.myFarm'), icon: Sprout },
    { path: '/market-prices', label: t('nav.marketPrices'), icon: TrendingUp },
    { path: '/schemes', label: t('nav.govSchemes'), icon: FileText },
    { path: '/air-agent', label: t('nav.aiAgent'), icon: HelpCircle },
    { path: '/weather', label: t('nav.weather'), icon: Cloud },
  ];

  // Removed the strict return so the layout wraps the app beautifully even when logged out.

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      theme === 'dark'
        ? 'bg-surface text-white'
        : 'bg-surface-alt text-body'
    }`}>
      <ScrollReveal>
        <nav className={`glass-effect border-b transition-colors duration-300 ${
          theme === 'dark'
            ? 'border-surface bg-surface-alt'
            : 'border-surface bg-surface'
        } sticky top-0 z-50 shadow-soft`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link to="/" className="flex items-center space-x-2 group">
                <Sprout className={`h-8 w-8 transition-all duration-300 ${
                  theme === 'dark' ? 'text-green-400' : 'text-leaf-600'
                } group-hover:scale-110 group-hover:rotate-12`} />
                <span className={`text-xl font-bold transition-colors duration-300 ${
                  theme === 'dark'
                    ? 'text-white'
                    : 'bg-gradient-to-r from-leaf-600 to-emerald-600 bg-clip-text text-transparent'
                }`}>
                  Agri Compass
                </span>
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link key={item.path} to={item.path}>
                      <Button
                        variant={isActive ? 'default' : 'ghost'}
                        size="sm"
                        className={`transition-all duration-200 mobile-touch-target ${
                          isActive
                            ? 'btn-primary'
                            : theme === 'dark'
                                ? 'hover:bg-surface-alt text-secondary'
                                : 'hover:bg-surface-soft'
                        }`}
                      >
                        <Icon className="h-4 w-4 mr-2" />
                        {item.label}
                      </Button>
                    </Link>
                  );
                })}
              </div>

              <div className="flex items-center space-x-2">
                {/* Language Toggle */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleLanguage}
                  className={`rounded-full transition-all duration-200 mobile-touch-target ${
                    theme === 'dark' ? 'hover:bg-surface-alt' : 'hover:bg-surface-soft'
                  }`}
                  title={t('common.languageToggle')}
                >
                  <Languages className="h-5 w-5" />
                </Button>

                {/* Theme Toggle - Made more prominent with enhanced styling */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleTheme}
                  className={`rounded-full transition-all duration-300 mobile-touch-target border-2 ${
                    theme === 'dark'
                      ? 'hover:bg-surface-alt border-surface'
                      : 'hover:bg-surface-soft border-surface'
                  }`}
                  title={theme === 'dark' ? t('common.switchToLight') : t('common.switchToDark')}
                >
                  {theme === 'dark' ? (
                    <Sun className="h-5 w-5 text-leaf-300 animate-pulse-soft" />
                  ) : (
                    <Moon className="h-5 w-5 text-leaf-700 animate-bounce-gentle" />
                  )}
                </Button>

                {/* User Menu / Sign In */}
                {user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="rounded-full">
                        <User className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium">
                            {profile?.full_name || profile?.username || 'User'}
                          </p>
                          <p className="text-xs text-secondary">{user.email}</p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => navigate('/profile')}>
                        <User className="mr-2 h-4 w-4" />
                        {t('nav.profile')}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleSignOut}>
                        <LogOut className="mr-2 h-4 w-4" />
                        {t('auth.signOut')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Button onClick={() => navigate('/auth')} className="btn-primary">
                    Sign In
                  </Button>
                )}

                {/* Mobile Menu Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileMenuOpen(true)}
                  className="md:hidden"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </nav>
      </ScrollReveal>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed right-0 top-0 h-full w-80 bg-surface shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b border-surface">
                <h2 className="text-lg font-semibold">{t('nav.community')}</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="p-4 space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Button
                      key={item.path}
                      variant={isActive ? 'default' : 'ghost'}
                      className={`w-full justify-start transition-all duration-200 ${
                        isActive
                          ? 'btn-primary'
                          : theme === 'dark'
                            ? 'hover:bg-surface-alt text-secondary'
                            : 'hover:bg-surface-soft'
                      }`}
                      onClick={() => {
                        navigate(item.path);
                        setMobileMenuOpen(false);
                      }}
                    >
                      <Icon className="h-4 w-4 mr-3" />
                      {item.label}
                    </Button>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
