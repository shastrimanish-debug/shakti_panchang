import React from 'react';
import { DEVOTIONAL_THEMES, AppTheme } from '../services/storage';
import { useLanguage } from '../i18n';
import { Sparkles, X, Check, Sun, Moon } from 'lucide-react';
import { ShaktiLogo } from './ShaktiLogo';
import { ZeroScrollPager } from './ZeroScrollPager';

interface ThemeSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTheme: AppTheme;
  onSelectTheme: (theme: AppTheme) => void;
}

export const ThemeSelectorModal: React.FC<ThemeSelectorModalProps> = ({
  isOpen,
  onClose,
  activeTheme,
  onSelectTheme,
}) => {
  const { t } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <ZeroScrollPager className="w-full max-w-lg h-[100dvh] sm:h-[86dvh] max-h-[100dvh] bg-[#FFFDF9]/98 dark:bg-[#23140C]/98 backdrop-blur-2xl text-[#3E2714] dark:text-[#FAF2E4] rounded-t-3xl sm:rounded-3xl border-t-2 sm:border border-[#DFCBB5] shadow-[0_20px_60px_rgba(0,0,0,0.5)] animate-in slide-in-from-bottom duration-200 overflow-hidden min-h-0" contentClassName="p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#8C6239]/30">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-500 text-white shadow-xs">
              <ShaktiLogo size={20} className="shrink-0 text-white" />
            </div>
            <div>
              <h3 className="font-granth font-black text-base text-[#5C3A21] dark:text-[#FFD88A] leading-tight">
                {t('themes.modalTitle', 'पावन भक्तिमय प्रकाश थीम (8 Light Themes)')}
              </h3>
              <p className="text-[10px] text-[#8C4A00] dark:text-amber-300/80 font-bold leading-none mt-0.5">
                {t('themes.modalSubtitle', 'दिव्य देवी-देवता कृपा व मंदिर प्रकाश चयन')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-stone-200/60 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300 transition cursor-pointer"
            title="बंद करें"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 8 Devotional Light Themes Grid */}
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-[#8C4A00] dark:text-amber-300 px-1">
            <span className="flex items-center gap-1">
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span>दिव्य प्रकाश थीम (Light Themes)</span>
            </span>
            <span className="text-[10px] bg-amber-500/20 text-[#8C4A00] dark:text-amber-300 px-2 py-0.5 rounded-full font-extrabold">
              {DEVOTIONAL_THEMES.filter((t) => t.isLight).length} {t('themes.sacredColorsCount', 'पावन रंग')}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {DEVOTIONAL_THEMES.filter((t) => t.isLight).map((themeItem) => {
              const isSelected = activeTheme === themeItem.id;
              return (
                <button
                  key={themeItem.id}
                  type="button"
                  onClick={() => {
                    onSelectTheme(themeItem.id);
                  }}
                  className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer relative flex items-start gap-2.5 active:scale-98 ${
                    isSelected
                      ? 'shadow-md scale-[1.01]'
                      : 'hover:border-amber-400 opacity-90 hover:opacity-100'
                  }`}
                  style={{
                    backgroundColor: themeItem.bgHex,
                    borderColor: isSelected ? themeItem.accentHex : themeItem.borderHex,
                  }}
                >
                  {/* Theme Icon & Swatch */}
                  <div
                    className="p-2 rounded-xl text-lg shrink-0 shadow-xs flex items-center justify-center"
                    style={{
                      backgroundColor: themeItem.cardBgHex,
                      border: `1px solid ${themeItem.borderHex}`,
                    }}
                  >
                    <span>{themeItem.icon}</span>
                  </div>

                  {/* Theme Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span
                        className="font-black text-xs truncate"
                        style={{ color: themeItem.accentHex }}
                      >
                        {themeItem.name}
                      </span>
                      {isSelected && (
                        <span
                          className="p-1 rounded-full text-white text-xs shadow-xs"
                          style={{ backgroundColor: themeItem.accentHex }}
                        >
                          <Check className="w-3 h-3 stroke-[3]" />
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] font-bold text-stone-700 leading-tight truncate mt-0.5">
                      {themeItem.deity}
                    </div>
                    <div className="text-[9px] text-stone-600 leading-tight line-clamp-1 mt-0.5">
                      {themeItem.desc}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Night Mode Option */}
          <div className="pt-2 border-t border-[#8C6239]/20">
            <div className="text-[11px] font-bold text-[#8C4A00] dark:text-amber-300 px-1 mb-1.5 flex items-center gap-1">
              <Moon className="w-3.5 h-3.5 text-amber-500" />
              <span>रात्रि उपासना (Night Theme)</span>
            </div>
            {DEVOTIONAL_THEMES.filter((t) => !t.isLight).map((themeItem) => {
              const isSelected = activeTheme === themeItem.id;
              return (
                <button
                  key={themeItem.id}
                  type="button"
                  onClick={() => onSelectTheme(themeItem.id)}
                  className={`w-full p-2.5 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-center gap-2.5 active:scale-98 ${
                    isSelected
                      ? 'shadow-md border-amber-500 bg-[#231710] text-[#FFD88A]'
                      : 'border-stone-700/60 bg-[#1A110B] text-stone-300 hover:border-amber-500/60'
                  }`}
                >
                  <div className="p-1.5 rounded-xl bg-stone-900 border border-stone-700 text-base">
                    <span>{themeItem.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-xs text-amber-300">{themeItem.name}</span>
                      {isSelected && (
                        <span className="p-0.5 rounded-full bg-amber-500 text-stone-950">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-stone-400 truncate">{themeItem.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-4 pt-2 border-t border-[#8C6239]/20 text-center">
          <p className="text-[10px] text-[#8C4A00] dark:text-amber-200/70 font-semibold">
            ✨ किसी भी थीम पर टैप करते ही पूरा पंचांग व कुण्डली उसी पावन रंग में रूपांतरित हो जाएगी।
          </p>
        </div>
      </ZeroScrollPager>
    </div>
  );
};
