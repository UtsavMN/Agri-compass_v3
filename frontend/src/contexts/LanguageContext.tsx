import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

type Language = 'en' | 'kn';

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  setLanguage: (language: Language) => void;
  t: (key: string, options?: any) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Retry delays in ms — grows up to 1 s, 20 attempts total
const RETRY_DELAYS = [300, 400, 500, 600, 700, 800, 900,
                      1000, 1000, 1000, 1000, 1000, 1000,
                      1000, 1000, 1000, 1000, 1000, 1000, 1000];

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const { i18n, t } = useTranslation();
  // Track the retry timer in a ref so clearing it doesn't cause re-renders
  const retryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [language, setLanguageState] = useState<Language>(() => {
    // Default to English on first visit; only restore Kannada if the user
    // explicitly chose it in a previous session.
    const stored = localStorage.getItem('language');
    if (stored === 'kn') return 'kn';
    localStorage.setItem('language', 'en');
    return 'en';
  });

  // Drive the hidden Google Translate combo whenever language changes.
  // Uses window.__triggerGTranslate (defined in index.html) with backoff retry
  // because the GT script loads asynchronously after React mounts.
  useEffect(() => {
    // Keep i18n in sync
    if (i18n.language !== language) {
      i18n.changeLanguage(language);
    }
    document.documentElement.lang = language;

    // Cancel any in-flight retry from a previous language change
    if (retryTimer.current) clearTimeout(retryTimer.current);

    let attempt = 0;

    const tryTrigger = () => {
      // Prefer the global helper exposed by index.html; fall back to direct DOM
      const globalFn = (window as any).__triggerGTranslate as
        ((lang: string) => boolean) | undefined;

      let success = false;

      if (globalFn) {
        success = globalFn(language);
      } else {
        const sel = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
        if (sel) {
          if (sel.value !== language) {
            sel.value = language;
            sel.dispatchEvent(new Event('change', { bubbles: true }));
            sel.dispatchEvent(new Event('input',  { bubbles: true }));
          }
          success = true;
        }
      }

      if (!success && attempt < RETRY_DELAYS.length - 1) {
        retryTimer.current = setTimeout(tryTrigger, RETRY_DELAYS[attempt]);
        attempt++;
      }
    };

    tryTrigger();

    return () => {
      if (retryTimer.current) clearTimeout(retryTimer.current);
    };
  }, [language, i18n]);

  // Keep state in sync if i18n changes language externally (e.g. language detector)
  useEffect(() => {
    const handleLanguageChange = (lng: string) => {
      if (lng === 'en' || lng === 'kn') {
        setLanguageState(lng as Language);
      }
    };
    i18n.on('languageChanged', handleLanguageChange);
    return () => { i18n.off('languageChanged', handleLanguageChange); };
  }, [i18n]);

  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'kn' : 'en';
    setLanguageState(newLang);
    localStorage.setItem('language', newLang);
    document.documentElement.lang = newLang;
  };

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
    localStorage.setItem('language', newLanguage);
    document.documentElement.lang = newLanguage;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
