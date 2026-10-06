import React from 'react';
import { BOOK_PAGES, getLocalizedBookPages } from '../constants/bookPages';
import { BookOpen, Sparkles, ChevronRight, ArrowLeft, Calendar, Flame, Home, Clock, Compass, Heart, Gift, Bell } from 'lucide-react';
import { ShaktiLogo } from './ShaktiLogo';
import { useTranslation } from '../i18n';

interface GranthIndexViewProps {
  onSelectTab: (tabId: string) => void;
  onReturnToCover: () => void;
}

export const GranthIndexView: React.FC<GranthIndexViewProps> = ({
  onSelectTab,
  onReturnToCover,
}) => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || 'hi';
  const localizedPages = getLocalizedBookPages(BOOK_PAGES, currentLang);

  return (
    <div className="w-full space-y-5 animate-in fade-in zoom-in-95 duration-200">
      {/* Top Grand Granth Header */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-[#5C3A21] via-[#8C6239] to-[#5C3A21] text-[#FAF2E4] shadow-lg border border-[#FFD88A]/40 text-center relative overflow-hidden">
        <div className="absolute -right-6 -bottom-6 opacity-10 pointer-events-none">
          <ShaktiLogo size={180} />
        </div>

        <p className="text-xs sm:text-sm font-black tracking-widest text-[#FFD88A] uppercase">
          {t('book.heading', '॥ श्री गणेशाय नमः ॥ • काशी-उज्जैन परंपरा')}
        </p>
        <h2 className="text-2xl sm:text-3xl font-bold font-granth text-[#FFD88A] mt-1">
          {t('granth.title', 'सनातन शक्ति पंचांग – ग्रंथ अनुक्रमणिका')}
        </h2>
        <p className="text-xs sm:text-sm text-[#FAF2E4]/90 mt-1 max-w-lg mx-auto">
          {t('granth.subtitle', 'वैदिक पंचांग, जन्म कुण्डली, दुर्गा सप्तशती, वास्तु शास्त्र, ग्रह शांति व समस्त अध्यायों की सूची। अपनी रुचि का अध्याय चुनें:')}
        </p>

        <div className="mt-4 flex items-center justify-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={onReturnToCover}
            className="px-4 py-2 bg-[#FAF2E4]/15 hover:bg-[#FAF2E4]/25 text-[#FAF2E4] border border-[#FFD88A]/40 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <ArrowLeft className="w-4 h-4 text-[#FFD88A]" />
            <span>{t('granth.returnToCover', '📕 ग्रंथ मुखपृष्ठ पर लौटें')}</span>
          </button>
        </div>
      </div>

      {/* Chapters Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {localizedPages.map((page) => {
          const Icon = page.icon || BookOpen;
          const isNew = ['durga', 'upay', 'vastu'].includes(page.id);

          return (
            <button
              key={page.id}
              type="button"
              onClick={() => onSelectTab(page.id)}
              className="p-4 rounded-2xl bg-white/90 dark:bg-[#2A1508]/90 hover:bg-white dark:hover:bg-[#351D0C] border border-[#8C6239]/25 hover:border-[#B56A00] transition-all text-left flex items-center justify-between group cursor-pointer shadow-xs active:scale-97 m3-touch"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#B56A00] to-[#8C6239] text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                  <Icon className="w-5 h-5 text-amber-200" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-[#B56A00] uppercase tracking-wider">
                      {page.chapter} • {t('book.page', 'पृष्ठ')} {page.pageNumber}
                    </span>
                    {isNew && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-600 text-white font-black">
                        {t('granth.specialNew', 'विशेष नया')}
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm sm:text-base font-bold font-granth text-[#5C3A21] dark:text-[#FFD88A] truncate mt-0.5">
                    {page.title}
                  </h3>
                  <p className="text-[11px] text-[#735133] dark:text-stone-300 truncate">
                    {page.desc}
                  </p>
                </div>
              </div>

              <div className="p-2 rounded-xl bg-[#FAF2E4] dark:bg-stone-800 text-[#5C3A21] dark:text-amber-200 group-hover:translate-x-1 transition-transform shrink-0 ml-2">
                <ChevronRight className="w-4 h-4" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Return footer */}
      <div className="p-4 rounded-2xl bg-[#FAF2E4] border border-[#8C6239]/20 text-center flex items-center justify-between">
        <span className="text-xs text-[#735133] font-bold">
          {t('granth.allRights', '✦ सनातन शक्ति पंचांग ग्रंथ • सर्वाधिकार सुरक्षित ✦')}
        </span>
        <button
          type="button"
          onClick={onReturnToCover}
          className="px-3.5 py-1.5 bg-[#5C3A21] text-[#FAF2E4] rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1 shadow-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{t('granth.coverBtn', 'मुखपृष्ठ')}</span>
        </button>
      </div>
    </div>
  );
};
