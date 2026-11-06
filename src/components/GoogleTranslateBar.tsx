import React, { useEffect, useState } from 'react';
import {
  initGoogleTranslate,
  applyGoogleTranslate,
  clearGoogleTranslate,
  isGoogleTranslateEnabled,
  setGoogleTranslateEnabled,
  getSavedGoogleTranslateLang,
} from '../services/googleTranslate';
import { Globe, Sparkles, CheckCircle2, RotateCcw } from 'lucide-react';

interface GoogleTranslateBarProps {
  currentLang?: string;
  compact?: boolean;
}

const POPULAR_LANGUAGES = [
  { code: 'en', name: 'English (US / Global)', flag: '🌐' },
  { code: 'gu', name: 'ગુજરાતી (Gujarati)', flag: '🇮🇳' },
  { code: 'hi', name: 'हिन्दी (Hindi)', flag: '🇮🇳' },
  { code: 'mr', name: 'मराठी (Marathi)', flag: '🇮🇳' },
  { code: 'bn', name: 'বাংলা (Bengali)', flag: '🇮🇳' },
  { code: 'ta', name: 'தமிழ் (Tamil)', flag: '🇮🇳' },
  { code: 'te', name: 'తెలుగు (Telugu)', flag: '🇮🇳' },
  { code: 'kn', name: 'ಕನ್ನಡ (Kannada)', flag: '🇮🇳' },
  { code: 'ml', name: 'മലയാളം (Malayalam)', flag: '🇮🇳' },
  { code: 'pa', name: 'ਪੰਜਾਬੀ (Punjabi)', flag: '🇮🇳' },
  { code: 'or', name: 'ଓଡ଼ିଆ (Odia)', flag: '🇮🇳' },
  { code: 'es', name: 'Español (Spanish)', flag: '🇪🇸' },
  { code: 'fr', name: 'Français (French)', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch (German)', flag: '🇩🇪' },
  { code: 'ne', name: 'नेपाली (Nepali)', flag: '🇳🇵' },
  { code: 'sa', name: 'संस्कृतम् (Sanskrit)', flag: '🕉️' },
];

export const GoogleTranslateBar: React.FC<GoogleTranslateBarProps> = ({
  currentLang = 'hi',
  compact = false,
}) => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [targetLang, setTargetLang] = useState('en');

  useEffect(() => {
    initGoogleTranslate();
    const enabled = isGoogleTranslateEnabled();
    setIsEnabled(enabled);
    setTargetLang(getSavedGoogleTranslateLang());
  }, []);

  const handleToggle = (active: boolean) => {
    setIsEnabled(active);
    setGoogleTranslateEnabled(active);
    if (active) {
      applyGoogleTranslate(targetLang);
    } else {
      clearGoogleTranslate();
    }
  };

  const handleLangChange = (code: string) => {
    setTargetLang(code);
    if (isEnabled) {
      applyGoogleTranslate(code);
    }
  };

  const handleApplyNow = (code: string) => {
    setTargetLang(code);
    setIsEnabled(true);
    setGoogleTranslateEnabled(true);
    applyGoogleTranslate(code);
  };

  return (
    <div className="w-full rounded-2xl border border-amber-300/80 bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-amber-500/10 p-3 sm:p-3.5 space-y-2.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs font-black text-sm shrink-0">
            G
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-black text-xs sm:text-sm text-[#5C2D11] dark:text-amber-200">
              <span>Google Translate</span>
              <span className="text-[10px] px-2 py-0.2 rounded-full bg-amber-500/20 text-amber-900 dark:text-amber-300 font-bold border border-amber-400/40">
                100+ Languages
              </span>
            </div>
            <div className="text-[10px] text-stone-600 dark:text-stone-400">
              संपूर्ण पृष्ठ का स्वतः अनुवाद • Auto-translates every section for global users
            </div>
          </div>
        </div>

        {/* Toggle Button */}
        <label className="flex items-center gap-1.5 cursor-pointer shrink-0">
          <span className="text-[10px] font-bold text-stone-600 dark:text-stone-300">
            {isEnabled ? 'सक्रिय' : 'बंद'}
          </span>
          <div
            onClick={() => handleToggle(!isEnabled)}
            className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ${
              isEnabled ? 'bg-amber-600' : 'bg-stone-300 dark:bg-stone-700'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                isEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </div>
        </label>
      </div>

      {/* Language Selector Dropdown & Quick Badges */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-amber-200/60 dark:border-stone-800">
        <span className="text-[10px] font-bold text-stone-600 dark:text-stone-400 shrink-0">
          अनुवाद भाषा:
        </span>
        <select
          value={targetLang}
          onChange={(e) => handleLangChange(e.target.value)}
          className="text-xs font-bold px-2 py-1 rounded-lg border border-amber-300 bg-white dark:bg-stone-900 text-[#3E2714] dark:text-[#FAF2E4] cursor-pointer"
        >
          {POPULAR_LANGUAGES.map((item) => (
            <option key={item.code} value={item.code}>
              {item.flag} {item.name}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={() => handleApplyNow(targetLang)}
          className="px-2.5 py-1 rounded-lg bg-amber-600 text-white text-[11px] font-bold hover:bg-amber-700 transition cursor-pointer flex items-center gap-1 shrink-0 ml-auto"
        >
          <Sparkles className="w-3 h-3" />
          <span>Translate Page</span>
        </button>

        {isEnabled && (
          <button
            type="button"
            onClick={() => handleToggle(false)}
            className="p-1 rounded-lg text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 transition cursor-pointer"
            title="Reset to Original"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Hidden Mount Point for Official Google Translate Widget */}
      <div id="google_translate_element" className="hidden" />
    </div>
  );
};
