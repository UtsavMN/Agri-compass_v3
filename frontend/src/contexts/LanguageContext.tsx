import React, { createContext, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

type Language = 'en' | 'kn';

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  setLanguage: (language: Language) => void;
  t: (key: string, options?: any) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const { i18n, t } = useTranslation();
  const [attempts, setAttempts] = useState(0);
  const [language, setLanguageState] = useState<Language>(() => {
    // Check localStorage first
    const stored = localStorage.getItem('language');
    if (stored === 'en' || stored === 'kn') {
      return stored;
    }
    // Check i18n language detector
    return (i18n.language as Language) || 'en';
  });

  useEffect(() => {
    // Sync with i18n
    if (i18n.language !== language) {
      i18n.changeLanguage(language);
    }
    
    // Update HTML lang attribute
    document.documentElement.lang = language;

    // Trigger Google Translate
    const triggerGoogleTranslate = () => {
      const selectField = document.querySelector('.goog-te-combo') as HTMLSelectElement;
      if (selectField) {
        if (selectField.value !== language) {
          selectField.value = language;
          selectField.dispatchEvent(new Event('change'));
        }
      } else if (attempts < 10) {
        // Retry if the widget hasn't loaded yet
        setTimeout(() => {
          setAttempts(a => a + 1);
          triggerGoogleTranslate();
        }, 500);
      }
    };

    triggerGoogleTranslate();

  }, [language, i18n]);

  useEffect(() => {
    const handleLanguageChange = (lng: string) => {
      if (lng !== language) {
        setLanguageState(lng as Language);
      }
    };

    i18n.on('languageChanged', handleLanguageChange);
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [language, i18n]);

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
