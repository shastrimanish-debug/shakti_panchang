import React, { useState, useMemo, useEffect } from 'react';
import {
  ALL_GRANTH_EXCERPTS,
  TRADITION_META,
  GranthExcerpt,
  ScriptureTradition,
} from '../data/granthPuranData';
import {
  BookOpen,
  Search,
  Volume2,
  VolumeX,
  Share2,
  Copy,
  Check,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Menu,
  X,
  ArrowLeft,
  LayoutList,
  BookMarked,
} from 'lucide-react';
import { useLanguage } from '../i18n';
import { speakUma, stopUmaSpeech } from '../lib/umaSpeech';
import { formatPadacchedaGuide } from '../lib/sanskritPhonetics';
import { openWhatsAppShare } from '../services/umaConsultationPdf';
import { triggerHapticSelection } from '../utils/haptics';
import { useTabMenu } from './BoardShell';

export interface GranthPuranViewProps {
  onBackToPanchang?: () => void;
  onSelectTab?: (tabId: string) => void;
  onOpenUmaModal?: (query?: string) => void;
  onPrevChapter?: () => void;
  onNextChapter?: () => void;
  initialTradition?: ScriptureTradition | 'all';
}

const BOOKMARK_STORAGE_KEY = 'shakti_granth_puran_bookmarks_v1';

export const GranthPuranView: React.FC<GranthPuranViewProps> = ({
  onBackToPanchang,
  onSelectTab,
  onOpenUmaModal,
  onPrevChapter,
  onNextChapter,
  initialTradition = 'all',
}) => {
  const { language } = useLanguage();
  const langKey: 'hi' | 'en' | 'gu' =
    language === 'en' ? 'en' : language === 'gu' ? 'gu' : 'hi';

  const [activeTradition, setActiveTradition] = useState<
    ScriptureTradition | 'all' | 'bookmarked'
  >(initialTradition);
  const [selectedScriptureFilter, setSelectedScriptureFilter] =
    useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'reader' | 'catalog'>('reader');
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg' | 'xl'>('base');
  const [showPadaccheda, setShowPadaccheda] = useState<boolean>(true);
  const [isTocOpen, setIsTocOpen] = useState<boolean>(false);

  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [speakingExcerptId, setSpeakingExcerptId] = useState<string | null>(
    null
  );
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [bookmarks, setBookmarks] = useState<Record<string, boolean>>(() => {
    try {
      const raw = localStorage.getItem(BOOKMARK_STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  useTabMenu(() => {
    if (isTocOpen) {
      setIsTocOpen(false);
      return true;
    }
    return false;
  });

  useEffect(() => {
    return () => {
      stopUmaSpeech();
    };
  }, []);

  // Distinct scripture names within the selected tradition
  const availableScriptureNames = useMemo(() => {
    const base =
      activeTradition === 'all'
        ? ALL_GRANTH_EXCERPTS
        : activeTradition === 'bookmarked'
          ? ALL_GRANTH_EXCERPTS.filter((item) => bookmarks[item.id])
          : ALL_GRANTH_EXCERPTS.filter(
              (item) => item.tradition === activeTradition
            );
    const seen = new Set<string>();
    const list: { key: string; label: string }[] = [];
    for (const item of base) {
      const key = item.scriptureName.hi;
      if (!seen.has(key)) {
        seen.add(key);
        list.push({
          key,
          label: item.scriptureName[langKey] || item.scriptureName.hi,
        });
      }
    }
    return list;
  }, [activeTradition, bookmarks, langKey]);

  // Reset sub-scripture filter if tradition changes
  useEffect(() => {
    setSelectedScriptureFilter('ALL');
    setSelectedIndex(0);
  }, [activeTradition]);

  const filteredExcerpts = useMemo(() => {
    let list = ALL_GRANTH_EXCERPTS;

    if (activeTradition === 'bookmarked') {
      list = list.filter((item) => Boolean(bookmarks[item.id]));
    } else if (activeTradition !== 'all') {
      list = list.filter((item) => item.tradition === activeTradition);
    }

    if (selectedScriptureFilter !== 'ALL') {
      list = list.filter(
        (item) => item.scriptureName.hi === selectedScriptureFilter
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(
        (item) =>
          item.sanskrit.toLowerCase().includes(q) ||
          item.transliteration.toLowerCase().includes(q) ||
          item.reference.toLowerCase().includes(q) ||
          item.scriptureName.hi.toLowerCase().includes(q) ||
          item.scriptureName.en.toLowerCase().includes(q) ||
          item.meaning.hi.toLowerCase().includes(q) ||
          item.meaning.en.toLowerCase().includes(q) ||
          item.meaning.gu.toLowerCase().includes(q) ||
          item.themeTag.hi.toLowerCase().includes(q) ||
          item.themeTag.en.toLowerCase().includes(q)
      );
    }

    return list;
  }, [activeTradition, selectedScriptureFilter, searchQuery, bookmarks]);

  const safeIndex =
    selectedIndex >= 0 && selectedIndex < filteredExcerpts.length
      ? selectedIndex
      : 0;
  const currentExcerpt: GranthExcerpt | undefined =
    filteredExcerpts[safeIndex] || filteredExcerpts[0];

  const toggleBookmark = (id: string) => {
    triggerHapticSelection();
    setBookmarks((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      try {
        localStorage.setItem(BOOKMARK_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore storage quota errors
      }
      return next;
    });
  };

  const stopAllSpeech = () => {
    stopUmaSpeech();
    setIsSpeaking(false);
    setSpeakingExcerptId(null);
  };

  const speakExcerptAtIndex = (index: number) => {
    stopUmaSpeech();
    if (index < 0 || index >= filteredExcerpts.length) {
      stopAllSpeech();
      return;
    }
    const item = filteredExcerpts[index];
    setSelectedIndex(index);
    setIsSpeaking(true);
    setSpeakingExcerptId(item.id);

    const textToSpeak = `${item.sanskrit}।\n${item.meaning[langKey] || item.meaning.hi}`;
    void speakUma(textToSpeak, {
      rate: 0.86,
      voiceStyle: 'pandit',
      sanskritOnly: false,
      raga: item.raga || 'bhairavi',
      onStart: () => {
        setIsSpeaking(true);
        setSpeakingExcerptId(item.id);
      },
      onEnd: () => {
        if (index + 1 < filteredExcerpts.length) {
          speakExcerptAtIndex(index + 1);
        } else {
          stopAllSpeech();
        }
      },
      onError: () => {
        stopAllSpeech();
      },
    });
  };

  const handleToggleSpeak = (excerpt?: GranthExcerpt, idx?: number) => {
    triggerHapticSelection();
    const targetItem = excerpt || currentExcerpt;
    if (!targetItem) return;

    if (isSpeaking && speakingExcerptId === targetItem.id) {
      stopAllSpeech();
    } else {
      const targetIndex =
        typeof idx === 'number'
          ? idx
          : filteredExcerpts.findIndex((e) => e.id === targetItem.id);
      speakExcerptAtIndex(targetIndex >= 0 ? targetIndex : 0);
    }
  };

  const handleCopy = (item: GranthExcerpt) => {
    triggerHapticSelection();
    const title = item.scriptureName[langKey] || item.scriptureName.hi;
    const sub = item.subSource[langKey] || item.subSource.hi;
    const meaning = item.meaning[langKey] || item.meaning.hi;
    const tika = item.commentary[langKey] || item.commentary.hi;
    const text = `॥ ${title} (${sub}) ॥\n\n${item.sanskrit}\n\nभावार्थ: ${meaning}\n\nतत्त्व-चिंतन: ${tika}\n— शक्ति पंचांग (सनातन ग्रन्थ एवं उपनिषद् स्वाध्याय)`;
    navigator.clipboard.writeText(text);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleShare = (item: GranthExcerpt) => {
    triggerHapticSelection();
    const title = item.scriptureName[langKey] || item.scriptureName.hi;
    const sub = item.subSource[langKey] || item.subSource.hi;
    const meaning = item.meaning[langKey] || item.meaning.hi;
    const tika = item.commentary[langKey] || item.commentary.hi;
    const shareText = `*॥ ${title} · ${sub} ॥*\n\n${item.sanskrit}\n\n*भावार्थ:* ${meaning}\n\n*वेदान्त दर्शन:* ${tika}\n\n📲 *शक्ति पंचांग — प्राचीन ग्रन्थ, उपनिषद् व पुराण स्वाध्याय*`;
    openWhatsAppShare(shareText);
  };

  const cycleFontSize = () => {
    triggerHapticSelection();
    setFontSize((prev) =>
      prev === 'sm'
        ? 'base'
        : prev === 'base'
          ? 'lg'
          : prev === 'lg'
            ? 'xl'
            : 'sm'
    );
  };

  const sanskritFontClass =
    fontSize === 'sm'
      ? 'text-base sm:text-lg leading-relaxed'
      : fontSize === 'base'
        ? 'text-lg sm:text-xl leading-relaxed'
        : fontSize === 'lg'
          ? 'text-xl sm:text-2xl leading-loose'
          : 'text-2xl sm:text-3xl leading-loose';

  const bodyFontClass =
    fontSize === 'sm'
      ? 'text-xs sm:text-sm leading-relaxed'
      : fontSize === 'base'
        ? 'text-sm sm:text-base leading-relaxed'
        : fontSize === 'lg'
          ? 'text-base sm:text-lg leading-relaxed'
          : 'text-lg sm:text-xl leading-relaxed';

  const traditionTabs: (ScriptureTradition | 'all' | 'bookmarked')[] = [
    'all',
    'upanishad',
    'gita',
    'purana',
    'veda',
    'bookmarked',
  ];

  const bookmarkedCount = useMemo(
    () => Object.values(bookmarks).filter(Boolean).length,
    [bookmarks]
  );

  return (
    <div className="w-full h-full min-h-0 flex flex-col bg-[#FCF8EC] dark:bg-[#1E120A] text-[#2C180C] dark:text-[#FAF2E4] overflow-hidden select-none relative">
      {/* Top Sacred Manuscript Header */}
      <header className="shrink-0 bg-gradient-to-r from-[#462B17] via-[#5C3A21] to-[#3E2714] text-[#FAF2E4] px-3 py-2.5 shadow-sm flex items-center justify-between border-b border-[#B56A00]/40 z-20">
        <div className="flex items-center gap-2 min-w-0">
          {onBackToPanchang && (
            <button
              type="button"
              onClick={() => {
                triggerHapticSelection();
                onBackToPanchang();
              }}
              className="px-2.5 py-1.5 rounded-xl bg-[#2C180C] border border-amber-500/40 text-amber-300 hover:bg-amber-900/40 transition cursor-pointer flex items-center gap-1 text-xs font-semibold shrink-0"
              title="पंचांग पर वापस जाएं"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">
                {langKey === 'en' ? 'Panchang' : langKey === 'gu' ? 'પંચાંગ' : 'पंचांग'}
              </span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              triggerHapticSelection();
              setIsTocOpen(!isTocOpen);
            }}
            className="px-2.5 py-1.5 rounded-xl bg-[#2C180C] border border-amber-500/40 text-amber-300 hover:bg-amber-900/40 transition cursor-pointer flex items-center gap-1.5 shrink-0"
            title="ग्रन्थ अनुक्रमणिका"
          >
            <Menu className="w-4 h-4" />
            <span className="text-xs font-semibold hidden sm:inline">
              {langKey === 'en' ? 'Index' : langKey === 'gu' ? 'અનુક્રમણિકા' : 'अनुक्रमणिका'}
            </span>
          </button>

          <div className="min-w-0">
            <h1 className="text-xs sm:text-sm font-bold font-granth tracking-wide text-[#FFD88A] truncate">
              {langKey === 'en'
                ? 'Ancient Granths, Upanishads & Puranas'
                : langKey === 'gu'
                  ? 'પ્રાચીન ગ્રંથ, ઉપનિષદ અને મહાપુરાણ સાર'
                  : 'प्राचीन ग्रन्थ, उपनिषद् एवं महापुराण स्वाध्याय'}
            </h1>
            <p className="text-[11px] text-[#E5D2B8] truncate">
              {currentExcerpt
                ? `${currentExcerpt.scriptureName[langKey]} · ${currentExcerpt.reference}`
                : TRADITION_META[activeTradition].subtitleHi}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => handleToggleSpeak()}
            disabled={!currentExcerpt}
            className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 cursor-pointer transition ${
              isSpeaking
                ? 'bg-rose-700 text-white border-rose-500'
                : 'bg-[#3E2714] text-amber-200 border-amber-500/30 hover:bg-amber-900/40'
            }`}
            title="सस्वर संस्कृत व हिंदी पाठ सुनें"
          >
            {isSpeaking ? (
              <VolumeX className="w-3.5 h-3.5" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span className="hidden xs:inline">
              {isSpeaking
                ? langKey === 'en'
                  ? 'Stop'
                  : 'रुकें'
                : langKey === 'en'
                  ? 'Recite'
                  : 'स्वर पाठ'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              triggerHapticSelection();
              setViewMode((m) => (m === 'reader' ? 'catalog' : 'reader'));
            }}
            className="px-2.5 py-1.5 rounded-lg bg-[#3E2714] border border-amber-500/30 text-xs text-amber-200 font-semibold hover:bg-amber-900/40 flex items-center gap-1 cursor-pointer"
            title="पठन मोड बदलें"
          >
            <LayoutList className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden sm:inline">
              {viewMode === 'reader'
                ? langKey === 'en'
                  ? 'All Verses'
                  : 'सूची मोड'
                : langKey === 'en'
                  ? 'Reader'
                  : 'पठन मोड'}
            </span>
          </button>

          <button
            type="button"
            onClick={cycleFontSize}
            className="px-2.5 py-1.5 rounded-lg bg-[#3E2714] border border-amber-500/30 text-xs text-amber-200 font-semibold hover:bg-amber-900/40 cursor-pointer"
            title="अक्षर आकार बदलें"
          >
            {fontSize === 'sm'
              ? 'अ-'
              : fontSize === 'base'
                ? 'अ'
                : fontSize === 'lg'
                  ? 'अ+'
                  : 'अ++'}
          </button>

          {onOpenUmaModal && currentExcerpt && (
            <button
              type="button"
              onClick={() => {
                triggerHapticSelection();
                onOpenUmaModal(
                  `${currentExcerpt.scriptureName.hi} (${currentExcerpt.reference}) के श्लोक "${currentExcerpt.sanskrit.split('\n')[0]}" का गहरा वेदान्त रहस्य और दैनिक जीवन में प्रयोग समझाइए।`
                );
              }}
              className="px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-400 text-stone-950 text-xs font-bold flex items-center gap-1 shadow-xs hover:brightness-105 active:scale-95 transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 fill-stone-950" />
              <span>{langKey === 'en' ? 'Ask Uma' : 'उमा भाष्य'}</span>
            </button>
          )}
        </div>
      </header>

      {/* Tradition Filter Bar + Search Bar */}
      <div className="shrink-0 bg-[#FAF2E4] dark:bg-[#28180E] border-b border-[#DFCBB5] dark:border-[#4A2E1B] px-3 py-2 space-y-2">
        {/* Segmented Tradition Selector */}
        <div
          className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5"
          role="tablist"
          aria-label="Scripture Traditions"
        >
          {traditionTabs.map((tabId) => {
            const meta = TRADITION_META[tabId];
            const isActive = activeTradition === tabId;
            const label =
              langKey === 'en'
                ? meta.labelEn
                : langKey === 'gu'
                  ? meta.labelGu
                  : meta.labelHi;
            return (
              <button
                key={tabId}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => {
                  triggerHapticSelection();
                  setActiveTradition(tabId);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-[#5C3A21] text-[#FFD88A] shadow-2xs'
                    : 'bg-[#F2E5CF] dark:bg-[#362013] text-[#5C3A21] dark:text-[#E5D2B8] hover:bg-[#E6D3B3]'
                }`}
              >
                {label}
                {tabId === 'bookmarked' && bookmarkedCount > 0
                  ? ` (${bookmarkedCount})`
                  : ''}
              </button>
            );
          })}
        </div>

        {/* Sub-Scripture Filter + Search Input Row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {availableScriptureNames.length > 1 && (
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar shrink-0">
              <button
                type="button"
                onClick={() => {
                  triggerHapticSelection();
                  setSelectedScriptureFilter('ALL');
                  setSelectedIndex(0);
                }}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold whitespace-nowrap cursor-pointer transition ${
                  selectedScriptureFilter === 'ALL'
                    ? 'bg-[#8C4A00] text-white'
                    : 'bg-white/80 dark:bg-[#1E120A] text-[#5C3A21] dark:text-[#D9C4A9] border border-[#DFCBB5]/70'
                }`}
              >
                {langKey === 'en' ? 'All Texts' : 'सभी ग्रन्थ'}
              </button>
              {availableScriptureNames.map((scr) => (
                <button
                  key={scr.key}
                  type="button"
                  onClick={() => {
                    triggerHapticSelection();
                    setSelectedScriptureFilter(scr.key);
                    setSelectedIndex(0);
                  }}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold whitespace-nowrap cursor-pointer transition ${
                    selectedScriptureFilter === scr.key
                      ? 'bg-[#8C4A00] text-white'
                      : 'bg-white/80 dark:bg-[#1E120A] text-[#5C3A21] dark:text-[#D9C4A9] border border-[#DFCBB5]/70'
                  }`}
                >
                  {scr.label}
                </button>
              ))}
            </div>
          )}

          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-[#8C6239] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSelectedIndex(0);
              }}
              placeholder={
                langKey === 'en'
                  ? 'Search shloka, Upanishad, Gita chapter, or theme...'
                  : langKey === 'gu'
                    ? 'શ્લોક, ઉપનિષદ, ગીતા અધ્યાય કે વિષય શોધો...'
                    : 'श्लोक, उपनिषद्, गीता अध्याय, पुराण या विषय खोजें...'
              }
              className="w-full pl-8 pr-7 py-1.5 rounded-lg bg-white dark:bg-[#1E120A] border border-[#DFCBB5] dark:border-[#5C3A21] text-xs text-[#2C180C] dark:text-[#FAF2E4] placeholder:text-[#8C6239]/70 focus:outline-none focus:border-[#B56A00]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[#8C6239] hover:text-[#2C180C]"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table of Contents Drawer Overlay */}
      {isTocOpen && (
        <div
          className="absolute inset-0 z-30 bg-black/60 backdrop-blur-xs flex justify-start"
          onClick={() => setIsTocOpen(false)}
        >
          <aside
            className="w-4/5 max-w-sm h-full bg-[#FAF2E4] dark:bg-[#23140C] border-r border-[#B56A00] shadow-2xl flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3 border-b border-[#DFCBB5] dark:border-[#4A2E1B] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#8C4A00] dark:text-amber-400" />
                <h3 className="font-granth font-bold text-sm text-[#462B17] dark:text-[#FFD88A]">
                  {langKey === 'en'
                    ? `Scripture Index (${filteredExcerpts.length})`
                    : `ग्रन्थ श्लोक अनुक्रमणिका (${filteredExcerpts.length})`}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsTocOpen(false)}
                className="p-1 rounded-lg bg-[#E6D3B3] dark:bg-[#3A2214] text-[#462B17] dark:text-[#FAF2E4]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5">
              {filteredExcerpts.map((item, idx) => {
                const isSelected = idx === safeIndex;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      triggerHapticSelection();
                      setSelectedIndex(idx);
                      setViewMode('reader');
                      setIsTocOpen(false);
                    }}
                    className={`w-full text-left p-2.5 rounded-xl border transition cursor-pointer flex items-start justify-between gap-2 ${
                      isSelected
                        ? 'bg-[#5C3A21] text-[#FFF6E5] border-[#B56A00]'
                        : 'bg-white/90 dark:bg-[#2C190F] text-[#3E2714] dark:text-[#FAF2E4] border-[#DFCBB5]/60 hover:bg-[#F4E8D1]'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold truncate">
                        {item.scriptureName[langKey]} · {item.reference}
                      </div>
                      <div
                        className={`text-[11px] truncate mt-0.5 ${
                          isSelected
                            ? 'text-amber-200'
                            : 'text-[#735133] dark:text-[#D9C4A9]'
                        }`}
                      >
                        {item.sanskrit.split('\n')[0]}
                      </div>
                    </div>
                    <span className="text-[11px] opacity-80 shrink-0">
                      #{idx + 1}
                    </span>
                  </button>
                );
              })}
            </div>
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-3 py-3 sm:px-5 sm:py-4 space-y-4 pb-20">
        {filteredExcerpts.length === 0 ? (
          <div className="max-w-xl mx-auto my-8 p-6 rounded-2xl bg-[#FAF2E4] dark:bg-[#2A180E] border border-[#DFCBB5] text-center space-y-3">
            <BookMarked className="w-8 h-8 text-[#8C4A00] mx-auto" />
            <h3 className="font-granth font-bold text-base text-[#462B17] dark:text-[#FFD88A]">
              {activeTradition === 'bookmarked'
                ? langKey === 'en'
                  ? 'No Bookmarked Verses Yet'
                  : 'अभी कोई श्लोक बुकमार्क नहीं किया गया है'
                : langKey === 'en'
                  ? 'No Matching Scripture Excerpts Found'
                  : 'इस खोज से संबंधित कोई श्लोक नहीं मिला'}
            </h3>
            <p className="text-xs text-[#6B4E36] dark:text-[#D9C4A9]">
              {activeTradition === 'bookmarked'
                ? langKey === 'en'
                  ? 'Tap the bookmark icon on any Bhagavad Gita, Upanishad, or Purana verse to save it here for daily reflection.'
                  : 'स्वाध्याय के दौरान किसी भी गीता श्लोक, उपनिषद् मन्त्र या पुराण वचन पर बुकमार्क चिह्न दबाकर यहाँ सहेजें।'
                : langKey === 'en'
                  ? 'Try clearing the search filter or selecting "All Scriptures".'
                  : 'कृपया खोज शब्द बदलें या "सभी ग्रन्थ" विकल्प चुनें।'}
            </p>
            <button
              type="button"
              onClick={() => {
                setActiveTradition('all');
                setSelectedScriptureFilter('ALL');
                setSearchQuery('');
              }}
              className="px-4 py-2 rounded-xl bg-[#5C3A21] text-[#FFD88A] text-xs font-semibold cursor-pointer"
            >
              {langKey === 'en' ? 'Show All Scriptures' : 'सभी ग्रन्थ देखें'}
            </button>
          </div>
        ) : viewMode === 'reader' && currentExcerpt ? (
          /* ================= FOCUSED MANUSCRIPT READER MODE ================= */
          <div className="max-w-3xl mx-auto space-y-4">
            {/* Top Excerpt Navigation & Metadata Bar */}
            <div className="flex items-center justify-between gap-2 bg-[#FAF2E4] dark:bg-[#28180E] px-3 py-2 rounded-xl border border-[#DFCBB5] dark:border-[#4A2E1B]">
              <button
                type="button"
                onClick={() => {
                  triggerHapticSelection();
                  setSelectedIndex(
                    (safeIndex - 1 + filteredExcerpts.length) %
                      filteredExcerpts.length
                  );
                }}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#1E120A] border border-[#DFCBB5] dark:border-[#5C3A21] text-xs font-semibold text-[#5C3A21] dark:text-[#FFD88A] flex items-center gap-1 cursor-pointer active:scale-95"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>{langKey === 'en' ? 'Prev' : 'पूर्व श्लोक'}</span>
              </button>

              <div className="text-center min-w-0 px-2">
                <div className="text-xs font-bold text-[#5C3A21] dark:text-[#FFD88A] truncate">
                  {currentExcerpt.scriptureName[langKey]}
                </div>
                <div className="text-[11px] text-[#735133] dark:text-[#D9C4A9] truncate">
                  <span>{currentExcerpt.subSource[langKey]}</span>
                  <span aria-hidden="true"> · </span>
                  <span className="tabular-nums">
                    {safeIndex + 1} / {filteredExcerpts.length}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  triggerHapticSelection();
                  setSelectedIndex((safeIndex + 1) % filteredExcerpts.length);
                }}
                className="px-2.5 py-1 rounded-lg bg-[#5C3A21] text-[#FFD88A] text-xs font-semibold flex items-center gap-1 cursor-pointer active:scale-95"
              >
                <span>{langKey === 'en' ? 'Next' : 'अगला श्लोक'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Sacred Bhojpatra / Manuscript Card */}
            <article className="rounded-2xl bg-[#FFFDF8] dark:bg-[#24150C] border border-[#D5BC9D] dark:border-[#5C3A21] shadow-xs p-4 sm:p-6 space-y-5">
              {/* Quiet Unboxed Editorial Metadata Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#E8DCCB] dark:border-[#3E2714] text-xs text-[#735133] dark:text-[#D9C4A9]">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="font-semibold text-[#8C4A00] dark:text-amber-300">
                    {currentExcerpt.rishiOrSpeaker[langKey]}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{currentExcerpt.themeTag[langKey]}</span>
                  <span aria-hidden="true">·</span>
                  <span>{currentExcerpt.reference}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => toggleBookmark(currentExcerpt.id)}
                    className={`p-1.5 rounded-lg border transition cursor-pointer ${
                      bookmarks[currentExcerpt.id]
                        ? 'bg-amber-100 dark:bg-amber-900/40 border-amber-500 text-[#8C4A00] dark:text-amber-300'
                        : 'bg-transparent border-[#DFCBB5] text-[#735133] hover:text-[#2C180C]'
                    }`}
                    title={
                      bookmarks[currentExcerpt.id]
                        ? 'बुकमार्क हटाएँ'
                        : 'स्वाध्याय हेतु बुकमार्क करें'
                    }
                  >
                    <Bookmark
                      className={`w-4 h-4 ${
                        bookmarks[currentExcerpt.id] ? 'fill-current' : ''
                      }`}
                    />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCopy(currentExcerpt)}
                    className="p-1.5 rounded-lg border border-[#DFCBB5] text-[#735133] dark:text-[#D9C4A9] hover:text-[#2C180C] transition cursor-pointer"
                    title="श्लोक व अर्थ कॉपी करें"
                  >
                    {copiedId === currentExcerpt.id ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleShare(currentExcerpt)}
                    className="px-2.5 py-1 rounded-lg bg-[#25D366]/15 border border-[#25D366]/40 text-[#15803D] dark:text-emerald-300 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    title="व्हाट्सएप पर साझा करें"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>{langKey === 'en' ? 'Share' : 'शेयर'}</span>
                  </button>
                </div>
              </div>

              {/* Primary Sanskrit Shloka / Mantra Display */}
              <div className="py-3 px-3 sm:px-5 rounded-xl bg-[#FAF2E4]/75 dark:bg-[#1A0F08] border border-[#E2CFAF] dark:border-[#4A2E1B] text-center space-y-3">
                <div className="text-xs font-granth text-[#8C4A00] dark:text-amber-400 tracking-widest">
                  ॥ श्री परमात्मने नमः ॥
                </div>
                <p
                  className={`font-granth font-bold text-[#3E1F0D] dark:text-[#FFD88A] whitespace-pre-line ${sanskritFontClass}`}
                >
                  {currentExcerpt.sanskrit}
                </p>
                <p className="text-xs sm:text-sm italic text-[#6B4E36] dark:text-[#C9B398] max-w-2xl mx-auto leading-relaxed">
                  {currentExcerpt.transliteration}
                </p>
              </div>

              {/* Padaccheda (Phonetic Syllable Guide) & Word-by-Word Breakdown */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#5C3A21] dark:text-[#FFD88A]">
                    {langKey === 'en'
                      ? 'Padaccheda & Word-by-Word Meaning'
                      : langKey === 'gu'
                        ? 'પદચ્છેદ અને શબ્દાર્થ'
                        : 'पदच्छेद एवं शब्दार्थ मार्गदर्शिका'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowPadaccheda((prev) => !prev)}
                    className="text-xs font-semibold text-[#8C4A00] dark:text-amber-400 underline cursor-pointer"
                  >
                    {showPadaccheda
                      ? langKey === 'en'
                        ? 'Hide'
                        : 'छुपाएं'
                      : langKey === 'en'
                        ? 'Show'
                        : 'दिखाएं'}
                  </button>
                </div>

                {showPadaccheda && (
                  <div className="p-3.5 rounded-xl bg-[#F8EFE0]/70 dark:bg-[#2B190E] border border-[#E2D2BE] dark:border-[#4A2E1B] space-y-3">
                    <div className="text-xs text-[#5C3A21] dark:text-[#E5D2B8] leading-relaxed">
                      <span className="font-semibold text-[#8C4A00] dark:text-amber-300">
                        {langKey === 'en' ? 'Pronunciation Guide: ' : 'उच्चारण पदच्छेद: '}
                      </span>
                      {formatPadacchedaGuide(currentExcerpt.sanskrit)}
                    </div>

                    {currentExcerpt.wordMeanings.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-[#E2D2BE]/70 dark:border-[#4A2E1B]">
                        {currentExcerpt.wordMeanings.map((wm, idx) => (
                          <div
                            key={idx}
                            className="text-xs flex items-baseline gap-1.5"
                          >
                            <span className="font-granth font-bold text-[#462B17] dark:text-[#FFD88A]">
                              {wm.sanskritWord} :
                            </span>
                            <span className="text-[#5C3A21] dark:text-[#D9C4A9]">
                              {langKey === 'en' ? wm.meaningEn : wm.meaningHi}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Translation (Bhavartha) */}
              <div className="space-y-1.5 pt-1">
                <h2 className="text-xs font-bold text-[#8C4A00] dark:text-amber-400">
                  {langKey === 'en'
                    ? 'Sacred Translation (Bhavartha)'
                    : langKey === 'gu'
                      ? 'સરળ ભાવાર્થ'
                      : 'सरल भावार्थ'}
                </h2>
                <p
                  className={`text-[#2C180C] dark:text-[#FAF2E4] font-medium ${bodyFontClass}`}
                >
                  {currentExcerpt.meaning[langKey] || currentExcerpt.meaning.hi}
                </p>
              </div>

              {/* Philosophical Commentary (Vedanta / Purana Bhashya) */}
              <div className="p-4 rounded-xl bg-[#FAF2E4] dark:bg-[#2D1A0E] border border-[#DFCBB5] dark:border-[#5C3A21] space-y-1.5">
                <h3 className="text-xs font-bold text-[#5C3A21] dark:text-[#FFD88A]">
                  {langKey === 'en'
                    ? 'Philosophical Commentary (Tattva Chintan)'
                    : langKey === 'gu'
                      ? 'શાસ્ત્રીય ભાષ્ય અને તત્ત્વ-ચિંતન'
                      : 'शास्त्रीय भाष्य एवं तत्त्व-चिंतन'}
                </h3>
                <p
                  className={`text-[#3E2714] dark:text-[#E5D2B8] ${bodyFontClass}`}
                >
                  {currentExcerpt.commentary[langKey] ||
                    currentExcerpt.commentary.hi}
                </p>
              </div>

              {/* Practical Daily Sadhana */}
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-600/30 space-y-1">
                <h3 className="text-xs font-bold text-[#8C4A00] dark:text-amber-300">
                  {langKey === 'en'
                    ? 'Daily Life Application (Sadhana)'
                    : langKey === 'gu'
                      ? 'દૈનિક જીવનમાં આચરણ (સાધના)'
                      : 'दैनिक जीवन में आचरण (साधना सूत्र)'}
                </h3>
                <p className="text-xs sm:text-sm text-[#462B17] dark:text-[#FAF2E4] leading-relaxed">
                  {currentExcerpt.practicalApplication[langKey] ||
                    currentExcerpt.practicalApplication.hi}
                </p>
              </div>
            </article>
          </div>
        ) : (
          /* ================= CATALOG / LIST STUDY MODE ================= */
          <div className="max-w-3xl mx-auto space-y-3">
            {filteredExcerpts.map((item, idx) => {
              const isItemSpeaking =
                isSpeaking && speakingExcerptId === item.id;
              return (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-[#FFFDF8] dark:bg-[#24150C] border border-[#DFCBB5] dark:border-[#4A2E1B] shadow-2xs space-y-2.5"
                >
                  <div className="flex items-center justify-between gap-2 text-xs text-[#735133] dark:text-[#D9C4A9]">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="font-bold text-[#5C3A21] dark:text-[#FFD88A]">
                        {item.scriptureName[langKey]}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{item.reference}</span>
                      <span aria-hidden="true">·</span>
                      <span>{item.themeTag[langKey]}</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleToggleSpeak(item, idx)}
                        className={`px-2 py-1 rounded-lg border text-[11px] font-semibold flex items-center gap-1 cursor-pointer ${
                          isItemSpeaking
                            ? 'bg-rose-700 text-white border-rose-600'
                            : 'bg-[#FAF2E4] dark:bg-[#341F14] text-[#5C3A21] dark:text-[#FFD88A] border-[#DFCBB5]'
                        }`}
                      >
                        {isItemSpeaking ? (
                          <VolumeX className="w-3 h-3" />
                        ) : (
                          <Volume2 className="w-3 h-3" />
                        )}
                        <span>{isItemSpeaking ? 'रुकें' : 'सुनें'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleBookmark(item.id)}
                        className="p-1.5 rounded-lg border border-[#DFCBB5] text-[#735133] dark:text-[#D9C4A9] cursor-pointer"
                        aria-label="Bookmark"
                      >
                        <Bookmark
                          className={`w-3.5 h-3.5 ${
                            bookmarks[item.id]
                              ? 'fill-[#8C4A00] text-[#8C4A00] dark:fill-amber-400 dark:text-amber-400'
                              : ''
                          }`}
                        />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          triggerHapticSelection();
                          setSelectedIndex(idx);
                          setViewMode('reader');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-[#5C3A21] text-[#FFD88A] text-[11px] font-semibold cursor-pointer"
                      >
                        {langKey === 'en' ? 'Read Full' : 'विस्तार से पढ़ें'}
                      </button>
                    </div>
                  </div>

                  <p className="font-granth font-bold text-base sm:text-lg text-[#3E1F0D] dark:text-[#FFD88A] whitespace-pre-line leading-relaxed">
                    {item.sanskrit}
                  </p>

                  <p className="text-xs sm:text-sm text-[#2C180C] dark:text-[#FAF2E4] leading-relaxed">
                    {item.meaning[langKey] || item.meaning.hi}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* Cross-Links to Dedicated Full-Text Paath Modules in Main Navigation */}
        {onSelectTab && (
          <section className="max-w-3xl mx-auto pt-3 border-t border-[#DFCBB5] dark:border-[#4A2E1B] space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-[#5C3A21] dark:text-[#FFD88A]">
                {langKey === 'en'
                  ? 'Complete Devotional Paath & Stotra Modules'
                  : langKey === 'gu'
                    ? 'સંપૂર્ણ પાઠ અને સ્તોત્ર ગ્રંથો'
                    : 'सम्पूर्ण पारायण एवं नित्य पाठ ग्रन्थ'}
              </h3>
              {(onPrevChapter || onNextChapter) && (
                <div className="flex items-center gap-2 text-xs">
                  {onPrevChapter && (
                    <button
                      type="button"
                      onClick={onPrevChapter}
                      className="text-[#8C4A00] dark:text-amber-300 font-semibold hover:underline cursor-pointer"
                    >
                      ← पूर्व अध्याय
                    </button>
                  )}
                  {onNextChapter && (
                    <button
                      type="button"
                      onClick={onNextChapter}
                      className="text-[#8C4A00] dark:text-amber-300 font-semibold hover:underline cursor-pointer"
                    >
                      अगला अध्याय →
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => {
                  triggerHapticSelection();
                  onSelectTab('durga');
                }}
                className="p-2.5 rounded-xl bg-[#FAF2E4] dark:bg-[#28180E] border border-[#DFCBB5] dark:border-[#4A2E1B] text-left hover:border-[#B56A00] transition cursor-pointer"
              >
                <div className="text-xs font-bold text-[#462B17] dark:text-[#FFD88A]">
                  श्री दुर्गा सप्तशती
                </div>
                <div className="text-[11px] text-[#735133] dark:text-[#D9C4A9] mt-0.5">
                  १३ अध्याय व कवच पाठ
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  triggerHapticSelection();
                  onSelectTab('sundarkand');
                }}
                className="p-2.5 rounded-xl bg-[#FAF2E4] dark:bg-[#28180E] border border-[#DFCBB5] dark:border-[#4A2E1B] text-left hover:border-[#B56A00] transition cursor-pointer"
              >
                <div className="text-xs font-bold text-[#462B17] dark:text-[#FFD88A]">
                  संपूर्ण सुंदरकांड
                </div>
                <div className="text-[11px] text-[#735133] dark:text-[#D9C4A9] mt-0.5">
                  श्री रामचरितमानस सोपान
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  triggerHapticSelection();
                  onSelectTab('hanuman');
                }}
                className="p-2.5 rounded-xl bg-[#FAF2E4] dark:bg-[#28180E] border border-[#DFCBB5] dark:border-[#4A2E1B] text-left hover:border-[#B56A00] transition cursor-pointer"
              >
                <div className="text-xs font-bold text-[#462B17] dark:text-[#FFD88A]">
                  श्री हनुमान चालीसा
                </div>
                <div className="text-[11px] text-[#735133] dark:text-[#D9C4A9] mt-0.5">
                  दोहा एवं ४० चौपाई
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  triggerHapticSelection();
                  onSelectTab('vratkatha');
                }}
                className="p-2.5 rounded-xl bg-[#FAF2E4] dark:bg-[#28180E] border border-[#DFCBB5] dark:border-[#4A2E1B] text-left hover:border-[#B56A00] transition cursor-pointer"
              >
                <div className="text-xs font-bold text-[#462B17] dark:text-[#FFD88A]">
                  व्रत कथा व आरती
                </div>
                <div className="text-[11px] text-[#735133] dark:text-[#D9C4A9] mt-0.5">
                  एकादशी व पौराणिक कथाएं
                </div>
              </button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default GranthPuranView;
