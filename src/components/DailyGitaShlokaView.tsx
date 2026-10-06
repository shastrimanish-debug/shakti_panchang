import React, { useState } from 'react';
import { GITA_SHLOKAS, getLocalizedGitaShloka } from '../data/gitaShlokas';
import { shlokaChrome } from '../constants/shlokas';
import { BookOpen, Sparkles, Volume2, Share2 } from 'lucide-react';
import { openWhatsAppShare } from '../services/umaConsultationPdf';
import { speakUma } from '../lib/umaSpeech';
import { useLanguage } from '../i18n';

export const DailyGitaShlokaView: React.FC = () => {
  const { language, t } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const shloka = GITA_SHLOKAS[currentIndex];
  const localized = getLocalizedGitaShloka(shloka, language);
  const chrome = shlokaChrome(language);

  const handleShare = () => {
    const text = `*${chrome.gitaTitle} (${chrome.chapter} ${shloka.chapter}, ${chrome.verse} ${shloka.verse})*\n\n${shloka.sanskrit}\n\n*${chrome.meaningWord}:* ${localized.meaning}\n\n(${t('common.appName', 'शक्ति पंचांग')})`;
    openWhatsAppShare(text);
  };

  const handleSpeak = () => {
    void speakUma(`${shloka.sanskrit}। ${localized.meaning}`, { rate: 0.8 });
  };

  return (
    <div className="w-full space-y-4 animate-in fade-in duration-200">
      {/* Header */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#5C3A21] via-[#8C6239] to-[#5C3A21] text-[#FAF2E4] shadow-md border border-[#FFD88A]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#FAF2E4]/10 border border-[#FFD88A]/40 flex items-center justify-center shrink-0">
            <BookOpen className="w-6 h-6 text-[#FFD88A]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold font-granth text-[#FFD88A]">
                {chrome.gitaTitle}
              </h2>
              <span className="text-[10px] bg-[#B56A00] text-white px-2 py-0.5 rounded-full font-bold">
                {chrome.gitaBadge}
              </span>
            </div>
            <p className="text-xs text-[#FAF2E4]/80 mt-0.5">
              {chrome.gitaSub}
            </p>
          </div>
        </div>
      </div>

      {/* Shloka Card */}
      <div className="p-5 sm:p-7 rounded-2xl bg-[#FAF2E4] border border-[#8C6239]/25 shadow-xs space-y-4 text-center">
        <div className="inline-block px-3 py-1 rounded-full bg-[#B56A00] text-white text-xs font-bold">
          {`${chrome.chapter} ${shloka.chapter} • ${chrome.verse} ${shloka.verse}`}
        </div>

        <p className="font-granth text-lg sm:text-xl font-bold text-[#5C3A21] leading-relaxed whitespace-pre-line py-2">
          {shloka.sanskrit}
        </p>

        <p className="text-xs italic text-[#735133]">
          {shloka.transliteration}
        </p>

        <div className="p-4 rounded-xl bg-white border border-[#8C6239]/20 text-left space-y-2">
          <h4 className="text-xs font-bold text-[#8C6239] uppercase tracking-wider">
            {chrome.meaningHead}
          </h4>
          <p className="text-xs sm:text-sm text-[#3E2714] leading-relaxed">
            {localized.meaning}
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-[#FBF0DD] border border-[#B56A00]/30 text-left space-y-1 text-xs">
          <h4 className="font-bold text-[#5C3A21] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#B56A00]" />
            <span>
              {chrome.reflectHead}
            </span>
          </h4>
          <p className="text-[#735133] leading-relaxed">{localized.reflection}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleSpeak}
            className="px-4 py-2 rounded-xl bg-[#5C3A21] text-[#FAF2E4] text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Volume2 className="w-4 h-4 text-[#FFD88A]" />
            <span>{chrome.listen}</span>
          </button>

          <button
            type="button"
            onClick={handleShare}
            className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>
              {{
                hi: "साझा करें",
                en: "Share",
                gu: "શેર કરો",
                mr: "शेअर करा",
                bn: "শেয়ার",
                ta: "பகிர்",
                te: "పంచుకోండి",
                kn: "ಹಂಚಿ",
                ml: "പങ്കിടുക",
                pa: "ਸਾਂਝਾ ਕਰੋ",
                or: "ସେୟାର",
              }[language] ?? "Share"}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentIndex((idx) => (idx + 1) % GITA_SHLOKAS.length)}
            className="px-4 py-2 rounded-xl bg-[#EADBCC] hover:bg-[#D9C4A9] text-[#5C3A21] text-xs font-bold cursor-pointer"
          >
            <span>{chrome.next}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

