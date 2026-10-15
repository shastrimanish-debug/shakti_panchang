import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import i18n, { SUPPORTED_LANGUAGES, LanguageOption, setAppLanguage, getInitialLanguage, getCurrentLanguage } from './index';
import { useTranslation } from 'react-i18next';

interface LanguageContextType {
  language: string;
  currentOption: LanguageOption;
  setLanguage: (code: string) => Promise<void>;
  supportedLanguages: LanguageOption[];
  t: (key: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { t } = useTranslation();
  const [language, setLanguageState] = useState<string>(() => {
    return i18n.language || getInitialLanguage();
  });

  useEffect(() => {
    const handleLangChange = (lng: string) => {
      setLanguageState(lng);
    };
    const handleCustomEvent = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail && typeof detail === 'string') {
        setLanguageState(detail);
      }
    };

    i18n.on('languageChanged', handleLangChange);
    window.addEventListener('shakti_language_change', handleCustomEvent);

    return () => {
      i18n.off('languageChanged', handleLangChange);
      window.removeEventListener('shakti_language_change', handleCustomEvent);
    };
  }, []);

  const setLanguage = useCallback(async (code: string) => {
    // 1. Immediately update React state so UI re-renders synchronously
    setLanguageState(code);
    // 2. Update i18n instance and persistence
    await setAppLanguage(code);
  }, []);

  const currentOption = useMemo(() => {
    return SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];
  }, [language]);

  const value = useMemo(
    () => ({
      language,
      currentOption,
      setLanguage,
      supportedLanguages: SUPPORTED_LANGUAGES,
      t: (key: string, fallback?: string) => t(key, fallback || key),
    }),
    [language, currentOption, setLanguage, t]
  );

  return (
    <LanguageContext.Provider value={value}>
      <div key={`lang-root-${language}`} className="w-full h-full">
        {children}
      </div>
    </LanguageContext.Provider>
  );
};

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    const currentCode = i18n.language || getInitialLanguage();
    const currentOpt = SUPPORTED_LANGUAGES.find((l) => l.code === currentCode) || SUPPORTED_LANGUAGES[0];
    return {
      language: currentCode,
      currentOption: currentOpt,
      setLanguage: async (code: string) => {
        await setAppLanguage(code);
      },
      supportedLanguages: SUPPORTED_LANGUAGES,
      t: (key: string, fallback?: string) => i18n.t(key, fallback || key),
    };
  }
  return context;
}
