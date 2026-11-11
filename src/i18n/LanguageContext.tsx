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
  const { t, i18n: i18nInstance } = useTranslation();
  const [language, setLanguageState] = useState<string>(() => {
    return i18n.language || getInitialLanguage();
  });
  const [version, setVersion] = useState<number>(0);

  useEffect(() => {
    const handleLangChange = (lng: string) => {
      setLanguageState(lng);
      setVersion((v) => v + 1);
    };
    const handleCustomEvent = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail && typeof detail === 'string') {
        setLanguageState(detail);
        setVersion((v) => v + 1);
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
    // 1. Await full i18n change first so dictionary is loaded & i18n.language is set
    await setAppLanguage(code);
    // 2. Update React state and bump version to trigger full re-mount of child components
    setLanguageState(code);
    setVersion((v) => v + 1);
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
      t: (key: string, fallback?: string) => i18nInstance.t(key, fallback || key),
    }),
    [language, currentOption, setLanguage, i18nInstance, version]
  );

  return (
    <LanguageContext.Provider value={value}>
      <div key={`lang-root-${language}-${version}`} className="w-full h-full">
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
