import React, { useState } from 'react';
import { useLanguage, SUPPORTED_LANGUAGES, LanguageOption } from '../i18n';
import { Globe, Check, Search, X, Sparkles } from 'lucide-react';

interface LanguageSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLanguageSelected?: (lang: LanguageOption) => void;
}

export const LanguageSelectorModal: React.FC<LanguageSelectorModalProps> = ({
  isOpen,
  onClose,
  onLanguageSelected,
}) => {
  const { language: currentLangCode, setLanguage, t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filteredLanguages = SUPPORTED_LANGUAGES.filter(
    (l) =>
      l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.nativeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.region.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = async (lang: LanguageOption) => {
    await setLanguage(lang.code);
    onLanguageSelected?.(lang);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-[#FFFDF9]/98 dark:bg-[#23140C]/98 backdrop-blur-2xl text-[#3E2714] dark:text-[#FAF2E4] rounded-t-3xl sm:rounded-3xl border-t-2 sm:border border-[#DFCBB5] shadow-[0_20px_60px_rgba(0,0,0,0.5)] p-4 sm:p-6 max-h-[88vh] flex flex-col animate-in slide-in-from-bottom duration-200"
        style={{
          paddingBottom: 'max(1.75rem, calc(env(safe-area-inset-bottom, 0px) + 1.25rem))',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#8C6239]/20">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-800 dark:text-amber-300">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-granth font-black text-base sm:text-lg text-[#5C3A21] dark:text-[#FFD88A] leading-tight">
                {t('common.selectLanguageModalTitle', 'Choose Language / भाषा चुनें')}
              </h3>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">
                {t('common.selectLanguageModalSubtitle', '10+ Regional & Global NRI Languages Supported')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-[#F4E8D1] dark:hover:bg-stone-800 rounded-full text-[#8C6239] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="mt-3 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('common.searchLangPlaceholder', 'Search language or script...')}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl bg-[#F5ECE0] dark:bg-stone-900 border border-[#DFCBB5] dark:border-stone-800 text-[#2C180C] dark:text-[#FAF2E4] placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
          />
        </div>

        {/* Language Grid / List */}
        <div className="mt-3.5 space-y-2 overflow-y-auto max-h-[55vh] pr-1 scrollbar-thin">
          {filteredLanguages.map((lang) => {
            const isSelected = currentLangCode === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => handleSelect(lang)}
                className={`w-full p-3 rounded-2xl border transition cursor-pointer flex items-center justify-between text-left group active:scale-[0.99] ${
                  isSelected
                    ? 'bg-gradient-to-r from-amber-500/20 via-amber-400/15 to-transparent border-amber-500 shadow-xs'
                    : 'bg-[#FAF5ED]/80 dark:bg-stone-900/60 hover:bg-[#F4E8D1] dark:hover:bg-stone-800/80 border-[#DFCBB5]/70 dark:border-stone-800'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-base shadow-xs shrink-0 ${
                      isSelected
                        ? 'bg-amber-600 text-white'
                        : 'bg-[#EBDDC8] dark:bg-stone-800 text-[#5C3A21] dark:text-amber-200'
                    }`}
                  >
                    {lang.flag || '🌐'}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-[#2C180C] dark:text-[#FAF2E4] truncate">
                        {lang.nativeName}
                      </span>
                      <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">
                        ({lang.name})
                      </span>
                    </div>
                    <div className="text-[10px] text-[#8C4A00] dark:text-amber-400 font-semibold tracking-wide">
                      {lang.region} • {lang.script}
                    </div>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  {isSelected && (
                    <div className="p-1.5 rounded-full bg-amber-600 text-white shadow-xs animate-in zoom-in-50">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="mt-3 pt-2.5 border-t border-[#8C6239]/20 flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            {t('common.syncNote', 'Automatic synchronization with Panchang and PDF export')}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 bg-[#EBDDC8] dark:bg-stone-800 hover:bg-[#dfceb5] text-[#5C3A21] dark:text-amber-200 font-bold rounded-lg transition"
          >
            {t('common.close', 'Close')}
          </button>
        </div>
      </div>
    </div>
  );
};

