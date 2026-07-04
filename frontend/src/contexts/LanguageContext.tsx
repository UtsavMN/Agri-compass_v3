import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

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
  const location = useLocation();
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

  // Drive the hidden Google Translate combo whenever language or route changes.
  // Uses window.__triggerGTranslate (defined in index.html) with backoff retry
  // because the GT script loads asynchronously after React mounts.
  useEffect(() => {
    // Keep i18n in sync
    if (i18n.language !== language) {
      i18n.changeLanguage(language);
    }
    document.documentElement.lang = language;

    // Direct cookie control to keep Google Translate from getting out of sync.
    // If the language is English, clear Google Translate cookies.
    // Otherwise, set the translation to the selected language.
    if (language === 'en') {
      document.body.removeAttribute('translate');
      const domains = [
        window.location.hostname,
        '.' + window.location.hostname,
        '.google.com',
        'google.com'
      ];
      const hasCookie = document.cookie.includes('googtrans');
      if (hasCookie) {
        domains.forEach(domain => {
          document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${domain}`;
          document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        });
        // Force a page reload once if the cookie was present when it shouldn't be
        if (!sessionStorage.getItem('googtrans_cleared')) {
          sessionStorage.setItem('googtrans_cleared', 'true');
          window.location.reload();
        }
        return;
      } else {
        sessionStorage.removeItem('googtrans_cleared');
      }
    } else {
      document.body.removeAttribute('translate');
      document.cookie = `googtrans=/en/${language}; path=/; domain=${window.location.hostname};`;
      document.cookie = `googtrans=/en/${language}; path=/;`;
    }

    // Cancel any in-flight retry from a previous language change or navigation
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
          const targetValue = language === 'en' ? '' : language;
          if (sel.value !== targetValue) {
            sel.value = targetValue;
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
  }, [language, i18n, location.pathname]);


  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'kn' : 'en';
    sessionStorage.removeItem('googtrans_cleared');
    setLanguageState(newLang);
    localStorage.setItem('language', newLang);
    document.documentElement.lang = newLang;
    window.location.reload();
  };

  const setLanguage = (newLanguage: Language) => {
    sessionStorage.removeItem('googtrans_cleared');
    setLanguageState(newLanguage);
    localStorage.setItem('language', newLanguage);
    document.documentElement.lang = newLanguage;
    window.location.reload();
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
