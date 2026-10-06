import i18n from 'i18next';
import { initReactI18next, useTranslation } from 'react-i18next';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { en } from './locales/en';
import { hi } from './locales/hi';
import { gu } from './locales/gu';
import { mr } from './locales/mr';
import { bn, ta, te, kn, ml, pa, or } from './locales/regional';

export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  script: string;
  region: string;
  flag?: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', script: 'Devanagari', region: 'India / Global', flag: '🇮🇳' },
  { code: 'en', name: 'English', nativeName: 'English', script: 'Latin', region: 'Global / NRI', flag: '🌐' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', script: 'Gujarati', region: 'Gujarat / NRI', flag: '🇮🇳' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', script: 'Devanagari', region: 'Maharashtra', flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', script: 'Bengali', region: 'West Bengal / BD', flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', script: 'Tamil', region: 'Tamil Nadu / SG / MY', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', script: 'Telugu', region: 'Andhra / Telangana / USA', flag: '🇮🇳' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', script: 'Kannada', region: 'Karnataka', flag: '🇮🇳' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', script: 'Malayalam', region: 'Kerala / Gulf', flag: '🇮🇳' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', script: 'Gurmukhi', region: 'Punjab / Canada / UK', flag: '🇮🇳' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼િଆ', script: 'Odia', region: 'Odisha', flag: '🇮🇳' },
];

const STORAGE_KEY = 'shakti_app_language';

// Detect initial language: saved preference > default to 'hi' (Hindi)
export const getInitialLanguage = (): string => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && SUPPORTED_LANGUAGES.some((l) => l.code === saved)) {
      return saved;
    }
  }
  return 'hi';
};

const resources = {
  hi: { translation: hi },
  en: { translation: en },
  gu: { translation: gu },
  mr: { translation: mr },
  bn: { translation: bn },
  ta: { translation: ta },
  te: { translation: te },
  kn: { translation: kn },
  ml: { translation: ml },
  pa: { translation: pa },
  or: { translation: or },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getInitialLanguage(),
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already does escaping
    },
    react: {
      useSuspense: false,
    },
  });

export const setAppLanguage = async (langCode: string): Promise<void> => {
  if (SUPPORTED_LANGUAGES.some((l) => l.code === langCode)) {
    await i18n.changeLanguage(langCode);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, langCode);
      document.documentElement.lang = langCode;
      window.dispatchEvent(new CustomEvent('shakti_language_change', { detail: langCode }));
    }
  }
};

export const getCurrentLanguage = (): LanguageOption => {
  const currentCode = i18n.language || 'hi';
  return (
    SUPPORTED_LANGUAGES.find((l) => l.code === currentCode) ||
    SUPPORTED_LANGUAGES[0]
  );
};

export function useAppLanguage() {
  const { t } = useTranslation();
  const [langCode, setLangCode] = useState<string>(() => i18n.language || getInitialLanguage());

  useEffect(() => {
    const handleLangChange = (lng: string) => {
      setLangCode(lng);
    };
    const handleCustomEvent = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail) setLangCode(detail);
    };
    i18n.on('languageChanged', handleLangChange);
    window.addEventListener('shakti_language_change', handleCustomEvent);
    return () => {
      i18n.off('languageChanged', handleLangChange);
      window.removeEventListener('shakti_language_change', handleCustomEvent);
    };
  }, []);

  const changeLanguage = useCallback(async (code: string) => {
    await setAppLanguage(code);
    setLangCode(code);
  }, []);

  const currentOption = useMemo(() => {
    return SUPPORTED_LANGUAGES.find((l) => l.code === langCode) || SUPPORTED_LANGUAGES[0];
  }, [langCode]);

  return {
    t,
    i18n,
    language: langCode,
    currentOption,
    changeLanguage,
  };
}

export { LanguageProvider, useLanguage } from './LanguageContext';
export { useTranslation };
export default i18n;
