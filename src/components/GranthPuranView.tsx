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
import { ShlokaPosterModal, ShlokaPosterData } from './ShlokaPosterModal';

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
  const [posterData, setPosterData] = useState<ShlokaPosterData | null>(null);

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
      rate: 0.88,
      voiceStyle: 'uma',
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
    <div
      className="w-full h-full min-h-0 flex flex-col overflow-hidden select-none relative"
      style={{ backgroundColor: '#FAF3E3', color: '#1F1006' }}
    >
      {/* Top Sacred Manuscript Header */}
      <header
        className="shrink-0 px-3 py-2.5 shadow-sm flex items-center justify-between border-b z-20"
        style={{
          backgroundColor: '#FFF9EE',
          borderColor: '#D6B485',
          color: '#2A1004',
        }}
      >
        <div className="flex items-center gap-2 min-w-0">
          {onBackToPanchang && (
            <button
              type="button"
              onClick={() => {
                triggerHapticSelection();
                onBackToPanchang();
              }}
              style={{
                backgroundColor: '#FFF2DC',
                color: '#4A1805',
                borderColor: '#C89656',
              }}
              className="px-2.5 py-1.5 rounded-xl border transition cursor-pointer flex items-center gap-1 text-xs font-bold shrink-0"
              title="पंचांग पर वापस जाएं"
            >
              <ArrowLeft className="w-3.5 h-3.5" style={{ color: '#7C2D12' }} />
              <span className="text-xs font-bold">
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
            style={{
              backgroundColor: '#FFF2DC',
              color: '#4A1805',
              borderColor: '#C89656',
            }}
            className="px-2.5 py-1.5 rounded-xl border transition cursor-pointer flex items-center gap-1.5 shrink-0"
            title="ग्रन्थ अनुक्रमणिका"
          >
            <Menu className="w-3.5 h-3.5" style={{ color: '#7C2D12' }} />
            <span className="text-xs font-bold">
              {langKey === 'en' ? 'Index' : langKey === 'gu' ? 'અનુક્રમણિકા' : 'अनुक्रमणिका'}
            </span>
          </button>

          <div className="min-w-0">
            <h1
              className="text-xs sm:text-sm font-bold font-granth tracking-wide truncate"
              style={{ color: '#6E1409' }}
            >
              {langKey === 'en'
                ? 'Ancient Granths, Upanishads & Puranas'
                : langKey === 'gu'
                  ? 'પ્રાચીન ગ્રંથ, ઉપનિષદ અને મહાપુરાણ સાર'
                  : 'प्राचीन ग्रन्थ, उपनिषद् एवं महापुराण स्वाध्याय'}
            </h1>
            <p
              className="text-[11px] font-semibold truncate"
              style={{ color: '#4A2511' }}
            >
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
            style={
              isSpeaking
                ? {
                    backgroundColor: '#BE123C',
                    color: '#FFFFFF',
                    borderColor: '#9F1239',
                  }
                : {
                    backgroundColor: '#FFF2DC',
                    color: '#3D1605',
                    borderColor: '#C89656',
                  }
            }
            className="px-2.5 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1 cursor-pointer transition"
            title="सस्वर संस्कृत व हिंदी पाठ सुनें"
          >
            {isSpeaking ? (
              <VolumeX className="w-3.5 h-3.5" style={{ color: '#FFFFFF' }} />
            ) : (
              <Volume2 className="w-3.5 h-3.5" style={{ color: '#9A3412' }} />
            )}
            <span className="text-xs font-bold">
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
            style={{
              backgroundColor: '#FFF2DC',
              color: '#3D1605',
              borderColor: '#C89656',
            }}
            className="px-2.5 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1 cursor-pointer"
            title="पठन मोड बदलें"
          >
            <LayoutList className="w-3.5 h-3.5" style={{ color: '#9A3412' }} />
            <span className="text-xs font-bold">
              {viewMode === 'reader'
                ? langKey === 'en'
                  ? 'All'
                  : 'सूची'
                : langKey === 'en'
                  ? 'Reader'
                  : 'पठन'}
            </span>
          </button>

          <button
            type="button"
            onClick={cycleFontSize}
            style={{
              backgroundColor: '#FFF2DC',
              color: '#3D1605',
              borderColor: '#C89656',
            }}
            className="px-2.5 py-1.5 rounded-lg border text-xs font-bold cursor-pointer"
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
              style={{
                backgroundColor: '#9A3412',
                color: '#FFFFFF',
                borderColor: '#7C2D12',
              }}
              className="px-2.5 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1 shadow-xs active:scale-95 transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" style={{ color: '#FDE68A' }} />
              <span style={{ color: '#FFFFFF' }}>
                {langKey === 'en' ? 'Ask Uma' : 'उमा भाष्य'}
              </span>
            </button>
          )}
        </div>
      </header>

      {/* Tradition Filter Bar + Search Bar */}
      <div
        className="shrink-0 border-b px-3 py-2 space-y-2"
        style={{ backgroundColor: '#F6EBD8', borderColor: '#D6B892' }}
      >
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
                style={
                  isActive
                    ? {
                        backgroundColor: '#8B1E1E',
                        color: '#FFFFFF',
                        borderColor: '#6E1409',
                      }
                    : {
                        backgroundColor: '#FFFDF8',
                        color: '#2C1206',
                        borderColor: '#C8A986',
                      }
                }
                className="px-3 py-1.5 rounded-lg border text-xs font-bold whitespace-nowrap transition cursor-pointer shrink-0"
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
                style={
                  selectedScriptureFilter === 'ALL'
                    ? {
                        backgroundColor: '#9A3412',
                        color: '#FFFFFF',
                        borderColor: '#7C2D12',
                      }
                    : {
                        backgroundColor: '#FFFDF9',
                        color: '#3A1807',
                        borderColor: '#CFAF8A',
                      }
                }
                className="px-2.5 py-1 rounded-md border text-[11px] font-bold whitespace-nowrap cursor-pointer transition"
              >
                {langKey === 'en' ? 'All Texts' : 'सभी ग्रन्थ'}
              </button>
              {availableScriptureNames.map((scr) => {
                const isSelectedScr = selectedScriptureFilter === scr.key;
                return (
                  <button
                    key={scr.key}
                    type="button"
                    onClick={() => {
                      triggerHapticSelection();
                      setSelectedScriptureFilter(scr.key);
                      setSelectedIndex(0);
                    }}
                    style={
                      isSelectedScr
                        ? {
                            backgroundColor: '#9A3412',
                            color: '#FFFFFF',
                            borderColor: '#7C2D12',
                          }
                        : {
                            backgroundColor: '#FFFDF9',
                            color: '#3A1807',
                            borderColor: '#CFAF8A',
                          }
                    }
                    className="px-2.5 py-1 rounded-md border text-[11px] font-bold whitespace-nowrap cursor-pointer transition"
                  >
                    {scr.label}
                  </button>
                );
              })}
            </div>
          )}

          <div className="relative flex-1 min-w-[200px]">
            <Search
              className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: '#6E3B16' }}
            />
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
              style={{
                backgroundColor: '#FFFFFF',
                color: '#1F1006',
                borderColor: '#C8A986',
              }}
              className="w-full pl-8 pr-7 py-1.5 rounded-lg border text-xs font-medium placeholder:text-[#6E4726] focus:outline-none focus:border-[#9A3412]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{ color: '#5C2D0C' }}
                className="absolute right-2 top-1/2 -translate-y-1/2"
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
            style={{ backgroundColor: '#FAF2E4', borderColor: '#9A3412' }}
            className="w-4/5 max-w-sm h-full border-r shadow-2xl flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="p-3 border-b flex items-center justify-between"
              style={{ backgroundColor: '#FFF8EB', borderColor: '#D6B892' }}
            >
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" style={{ color: '#8B1E1E' }} />
                <h3
                  className="font-granth font-bold text-sm"
                  style={{ color: '#3A1405' }}
                >
                  {langKey === 'en'
                    ? `Scripture Index (${filteredExcerpts.length})`
                    : `ग्रन्थ श्लोक अनुक्रमणिका (${filteredExcerpts.length})`}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsTocOpen(false)}
                style={{ backgroundColor: '#F2DFC4', color: '#3A1405' }}
                className="p-1 rounded-lg"
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
                    style={
                      isSelected
                        ? {
                            backgroundColor: '#8B1E1E',
                            color: '#FFFFFF',
                            borderColor: '#6E1409',
                          }
                        : {
                            backgroundColor: '#FFFDF9',
                            color: '#241005',
                            borderColor: '#D6B892',
                          }
                    }
                    className="w-full text-left p-2.5 rounded-xl border transition cursor-pointer flex items-start justify-between gap-2"
                  >
                    <div className="min-w-0 flex-1">
                      <div
                        className="text-xs font-bold truncate"
                        style={{ color: isSelected ? '#FFFFFF' : '#241005' }}
                      >
                        {item.scriptureName[langKey]} · {item.reference}
                      </div>
                      <div
                        className="text-[11px] truncate mt-0.5 font-medium"
                        style={{ color: isSelected ? '#FDE68A' : '#5C2D0C' }}
                      >
                        {item.sanskrit.split('\n')[0]}
                      </div>
                    </div>
                    <span
                      className="text-[11px] font-bold shrink-0"
                      style={{ color: isSelected ? '#FDE68A' : '#7C2D12' }}
                    >
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
          <div
            style={{
              backgroundColor: '#FFFDF8',
              borderColor: '#D6B892',
              color: '#241005',
            }}
            className="max-w-xl mx-auto my-8 p-6 rounded-2xl border text-center space-y-3"
          >
            <BookMarked
              className="w-8 h-8 mx-auto"
              style={{ color: '#8B1E1E' }}
            />
            <h3
              className="font-granth font-bold text-base"
              style={{ color: '#3A1405' }}
            >
              {activeTradition === 'bookmarked'
                ? langKey === 'en'
                  ? 'No Bookmarked Verses Yet'
                  : 'अभी कोई श्लोक बुकमार्क नहीं किया गया है'
                : langKey === 'en'
                  ? 'No Matching Scripture Excerpts Found'
                  : 'इस खोज से संबंधित कोई श्लोक नहीं मिला'}
            </h3>
            <p className="text-xs font-medium" style={{ color: '#4A2511' }}>
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
              style={{ backgroundColor: '#8B1E1E', color: '#FFFFFF' }}
              className="px-4 py-2 rounded-xl text-xs font-bold cursor-pointer"
            >
              {langKey === 'en' ? 'Show All Scriptures' : 'सभी ग्रन्थ देखें'}
            </button>
          </div>
        ) : viewMode === 'reader' && currentExcerpt ? (
          /* ================= FOCUSED MANUSCRIPT READER MODE ================= */
          <div className="max-w-3xl mx-auto space-y-4">
            {/* Top Excerpt Navigation & Metadata Bar */}
            <div
              style={{
                backgroundColor: '#FFF8EB',
                borderColor: '#D6B892',
              }}
              className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl border"
            >
              <button
                type="button"
                onClick={() => {
                  triggerHapticSelection();
                  setSelectedIndex(
                    (safeIndex - 1 + filteredExcerpts.length) %
                      filteredExcerpts.length
                  );
                }}
                style={{
                  backgroundColor: '#FFFFFF',
                  color: '#3A1405',
                  borderColor: '#C8A986',
                }}
                className="px-2.5 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1 cursor-pointer active:scale-95"
              >
                <ChevronLeft className="w-4 h-4" style={{ color: '#7C2D12' }} />
                <span>{langKey === 'en' ? 'Prev' : 'पूर्व श्लोक'}</span>
              </button>

              <div className="text-center min-w-0 px-2">
                <div
                  className="text-xs sm:text-sm font-bold truncate"
                  style={{ color: '#6E1409' }}
                >
                  {currentExcerpt.scriptureName[langKey]}
                </div>
                <div
                  className="text-[11px] font-semibold truncate"
                  style={{ color: '#4A2511' }}
                >
                  <span>{currentExcerpt.subSource[langKey]}</span>
                  <span aria-hidden="true"> · </span>
                  <span className="tabular-nums font-bold">
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
                style={{
                  backgroundColor: '#8B1E1E',
                  color: '#FFFFFF',
                  borderColor: '#6E1409',
                }}
                className="px-2.5 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1 cursor-pointer active:scale-95"
              >
                <span style={{ color: '#FFFFFF' }}>
                  {langKey === 'en' ? 'Next' : 'अगला श्लोक'}
                </span>
                <ChevronRight className="w-4 h-4" style={{ color: '#FFFFFF' }} />
              </button>
            </div>

            {/* Sacred Bhojpatra / Manuscript Card */}
            <article
              style={{
                backgroundColor: '#FFFDF9',
                borderColor: '#D4B083',
                color: '#1F1006',
              }}
              className="rounded-2xl border shadow-xs p-4 sm:p-6 space-y-5"
            >
              {/* Editorial Metadata Header */}
              <div
                style={{ borderColor: '#E5CFAF', color: '#4A2511' }}
                className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b text-xs font-semibold"
              >
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="font-bold" style={{ color: '#8B1E1E' }}>
                    {currentExcerpt.rishiOrSpeaker[langKey]}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span style={{ color: '#3A1807' }}>
                    {currentExcerpt.themeTag[langKey]}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span style={{ color: '#5C2D0C' }}>
                    {currentExcerpt.reference}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => toggleBookmark(currentExcerpt.id)}
                    style={
                      bookmarks[currentExcerpt.id]
                        ? {
                            backgroundColor: '#FEF3C7',
                            borderColor: '#D97706',
                            color: '#9A3412',
                          }
                        : {
                            backgroundColor: '#FFF8EB',
                            borderColor: '#CFAF8A',
                            color: '#4A2511',
                          }
                    }
                    className="p-1.5 rounded-lg border transition cursor-pointer"
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
                    style={{
                      backgroundColor: '#FFF8EB',
                      borderColor: '#CFAF8A',
                      color: '#4A2511',
                    }}
                    className="p-1.5 rounded-lg border transition cursor-pointer"
                    title="श्लोक व अर्थ कॉपी करें"
                  >
                    {copiedId === currentExcerpt.id ? (
                      <Check
                        className="w-4 h-4"
                        style={{ color: '#15803D' }}
                      />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      triggerHapticSelection();
                      setPosterData({
                        title: currentExcerpt.scriptureName[langKey] || currentExcerpt.scriptureName.hi,
                        reference: `${currentExcerpt.subSource[langKey] || currentExcerpt.subSource.hi} · ${currentExcerpt.reference}`,
                        sanskrit: currentExcerpt.sanskrit,
                        meaning: `${currentExcerpt.meaning[langKey] || currentExcerpt.meaning.hi}\n\nवेदान्त दर्शन: ${currentExcerpt.commentary[langKey] || currentExcerpt.commentary.hi}`,
                        speaker: currentExcerpt.rishiOrSpeaker[langKey] || currentExcerpt.rishiOrSpeaker.hi,
                        accentTag: `📜 ${currentExcerpt.themeTag[langKey] || currentExcerpt.themeTag.hi}`,
                      });
                    }}
                    style={{
                      backgroundColor: '#6E1409',
                      borderColor: '#4A0E0E',
                      color: '#FFFFFF',
                    }}
                    className="px-2.5 py-1 rounded-lg border text-xs font-bold flex items-center gap-1 cursor-pointer"
                    title="HD स्टेटस इमेज कार्ड डाउनलोड/शेयर करें"
                  >
                    <span>📸 स्टेटस कार्ड</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleShare(currentExcerpt)}
                    style={{
                      backgroundColor: '#DCFCE7',
                      borderColor: '#86EFAC',
                      color: '#14532D',
                    }}
                    className="px-2.5 py-1 rounded-lg border text-xs font-bold flex items-center gap-1 cursor-pointer"
                    title="व्हाट्सएप पर साझा करें"
                  >
                    <Share2 className="w-3.5 h-3.5" style={{ color: '#15803D' }} />
                    <span>{langKey === 'en' ? 'Share' : 'शेयर'}</span>
                  </button>
                </div>
              </div>

              {/* Primary Sanskrit Shloka / Mantra Display */}
              <div
                style={{
                  backgroundColor: '#FFF6E0',
                  borderColor: '#D99B4E',
                }}
                className="py-4 px-3 sm:px-5 rounded-xl border-2 text-center space-y-3"
              >
                <div
                  className="text-xs font-granth font-bold tracking-widest"
                  style={{ color: '#9A3412' }}
                >
                  ॥ श्री परमात्मने नमः ॥
                </div>
                <p
                  style={{ color: '#4A0E0E' }}
                  className={`font-granth font-bold whitespace-pre-line ${sanskritFontClass}`}
                >
                  {currentExcerpt.sanskrit}
                </p>
                <p
                  style={{ color: '#3B1D0A' }}
                  className="text-xs sm:text-sm italic font-medium max-w-2xl mx-auto leading-relaxed"
                >
                  {currentExcerpt.transliteration}
                </p>
              </div>

              {/* Padaccheda (Phonetic Syllable Guide) & Word-by-Word Breakdown */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span
                    className="text-xs sm:text-sm font-bold"
                    style={{ color: '#5C1909' }}
                  >
                    {langKey === 'en'
                      ? 'Padaccheda & Word-by-Word Meaning'
                      : langKey === 'gu'
                        ? 'પદચ્છેદ અને શબ્દાર્થ'
                        : 'पदच्छेद एवं शब्दार्थ मार्गदर्शिका'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowPadaccheda((prev) => !prev)}
                    style={{ color: '#8B1E1E' }}
                    className="text-xs font-bold underline cursor-pointer"
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
                  <div
                    style={{
                      backgroundColor: '#FAF0DC',
                      borderColor: '#D6B892',
                    }}
                    className="p-3.5 rounded-xl border space-y-3"
                  >
                    <div
                      className="text-xs sm:text-sm font-medium leading-relaxed"
                      style={{ color: '#241005' }}
                    >
                      <span
                        className="font-bold"
                        style={{ color: '#8B1E1E' }}
                      >
                        {langKey === 'en'
                          ? 'Pronunciation Guide: '
                          : 'उच्चारण पदच्छेद: '}
                      </span>
                      {formatPadacchedaGuide(currentExcerpt.sanskrit)}
                    </div>

                    {currentExcerpt.wordMeanings.length > 0 && (
                      <div
                        style={{ borderColor: '#DEC3A0' }}
                        className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2.5 border-t"
                      >
                        {currentExcerpt.wordMeanings.map((wm, idx) => (
                          <div
                            key={idx}
                            className="text-xs sm:text-sm flex items-baseline gap-1.5"
                          >
                            <span
                              className="font-granth font-bold shrink-0"
                              style={{ color: '#6E1409' }}
                            >
                              {wm.sanskritWord} :
                            </span>
                            <span
                              className="font-medium"
                              style={{ color: '#1F1006' }}
                            >
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
                <h2
                  className="text-xs sm:text-sm font-bold"
                  style={{ color: '#8B1E1E' }}
                >
                  {langKey === 'en'
                    ? 'Sacred Translation (Bhavartha)'
                    : langKey === 'gu'
                      ? 'સરળ ભાવાર્થ'
                      : 'सरल भावार्थ'}
                </h2>
                <p
                  style={{ color: '#1A0C04' }}
                  className={`font-semibold ${bodyFontClass}`}
                >
                  {currentExcerpt.meaning[langKey] || currentExcerpt.meaning.hi}
                </p>
              </div>

              {/* Philosophical Commentary (Vedanta / Purana Bhashya) */}
              <div
                style={{
                  backgroundColor: '#FBF2E1',
                  borderColor: '#D4B083',
                }}
                className="p-4 rounded-xl border space-y-1.5"
              >
                <h3
                  className="text-xs sm:text-sm font-bold"
                  style={{ color: '#6E1409' }}
                >
                  {langKey === 'en'
                    ? 'Philosophical Commentary (Tattva Chintan)'
                    : langKey === 'gu'
                      ? 'શાસ્ત્રીય ભાષ્ય અને તત્ત્વ-ચિંતન'
                      : 'शास्त्रीय भाष्य एवं तत्त्व-चिंतन'}
                </h3>
                <p
                  style={{ color: '#1F1006' }}
                  className={`font-medium ${bodyFontClass}`}
                >
                  {currentExcerpt.commentary[langKey] ||
                    currentExcerpt.commentary.hi}
                </p>
              </div>

              {/* Practical Daily Sadhana */}
              <div
                style={{
                  backgroundColor: '#FFF3D6',
                  borderColor: '#D99B4E',
                }}
                className="p-3.5 rounded-xl border space-y-1"
              >
                <h3
                  className="text-xs sm:text-sm font-bold"
                  style={{ color: '#8B1E1E' }}
                >
                  {langKey === 'en'
                    ? 'Daily Life Application (Sadhana)'
                    : langKey === 'gu'
                      ? 'દૈનિક જીવનમાં આચરણ (સાધના)'
                      : 'दैनिक जीवन में आचरण (साधना सूत्र)'}
                </h3>
                <p
                  style={{ color: '#241005' }}
                  className="text-xs sm:text-sm font-medium leading-relaxed"
                >
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
                  style={{
                    backgroundColor: '#FFFDF9',
                    borderColor: '#D6B892',
                    color: '#1F1006',
                  }}
                  className="p-4 rounded-2xl border shadow-2xs space-y-2.5"
                >
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <div
                      className="flex flex-wrap items-center gap-1.5 font-semibold"
                      style={{ color: '#4A2511' }}
                    >
                      <span
                        className="font-bold"
                        style={{ color: '#6E1409' }}
                      >
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
                        style={
                          isItemSpeaking
                            ? {
                                backgroundColor: '#BE123C',
                                color: '#FFFFFF',
                                borderColor: '#9F1239',
                              }
                            : {
                                backgroundColor: '#FFF5E1',
                                color: '#3A1405',
                                borderColor: '#C8A986',
                              }
                        }
                        className="px-2 py-1 rounded-lg border text-[11px] font-bold flex items-center gap-1 cursor-pointer"
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
                        style={{
                          backgroundColor: '#FFF8EB',
                          borderColor: '#C8A986',
                          color: '#4A2511',
                        }}
                        className="p-1.5 rounded-lg border cursor-pointer"
                        aria-label="Bookmark"
                      >
                        <Bookmark
                          className={`w-3.5 h-3.5 ${
                            bookmarks[item.id] ? 'fill-[#8B1E1E] text-[#8B1E1E]' : ''
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
                        style={{
                          backgroundColor: '#8B1E1E',
                          color: '#FFFFFF',
                        }}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer"
                      >
                        {langKey === 'en' ? 'Read Full' : 'विस्तार से पढ़ें'}
                      </button>
                    </div>
                  </div>

                  <p
                    style={{ color: '#4A0E0E' }}
                    className="font-granth font-bold text-base sm:text-lg whitespace-pre-line leading-relaxed"
                  >
                    {item.sanskrit}
                  </p>

                  <p
                    style={{ color: '#1F1006' }}
                    className="text-xs sm:text-sm font-medium leading-relaxed"
                  >
                    {item.meaning[langKey] || item.meaning.hi}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* Cross-Links to Dedicated Full-Text Paath Modules in Main Navigation */}
        {onSelectTab && (
          <section
            style={{ borderColor: '#D6B892' }}
            className="max-w-3xl mx-auto pt-3 border-t space-y-2.5"
          >
            <div className="flex items-center justify-between">
              <h3
                className="text-xs sm:text-sm font-bold"
                style={{ color: '#5C1909' }}
              >
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
                      style={{ color: '#8B1E1E' }}
                      className="font-bold hover:underline cursor-pointer"
                    >
                      ← पूर्व अध्याय
                    </button>
                  )}
                  {onNextChapter && (
                    <button
                      type="button"
                      onClick={onNextChapter}
                      style={{ color: '#8B1E1E' }}
                      className="font-bold hover:underline cursor-pointer"
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
                style={{
                  backgroundColor: '#FFFDF8',
                  borderColor: '#D6B892',
                }}
                className="p-2.5 rounded-xl border text-left hover:border-[#8B1E1E] transition cursor-pointer"
              >
                <div
                  className="text-xs font-bold"
                  style={{ color: '#6E1409' }}
                >
                  श्री दुर्गा सप्तशती
                </div>
                <div
                  className="text-[11px] font-medium mt-0.5"
                  style={{ color: '#4A2511' }}
                >
                  १३ अध्याय व कवच पाठ
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  triggerHapticSelection();
                  onSelectTab('sundarkand');
                }}
                style={{
                  backgroundColor: '#FFFDF8',
                  borderColor: '#D6B892',
                }}
                className="p-2.5 rounded-xl border text-left hover:border-[#8B1E1E] transition cursor-pointer"
              >
                <div
                  className="text-xs font-bold"
                  style={{ color: '#6E1409' }}
                >
                  संपूर्ण सुंदरकांड
                </div>
                <div
                  className="text-[11px] font-medium mt-0.5"
                  style={{ color: '#4A2511' }}
                >
                  श्री रामचरितमानस सोपान
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  triggerHapticSelection();
                  onSelectTab('hanuman');
                }}
                style={{
                  backgroundColor: '#FFFDF8',
                  borderColor: '#D6B892',
                }}
                className="p-2.5 rounded-xl border text-left hover:border-[#8B1E1E] transition cursor-pointer"
              >
                <div
                  className="text-xs font-bold"
                  style={{ color: '#6E1409' }}
                >
                  श्री हनुमान चालीसा
                </div>
                <div
                  className="text-[11px] font-medium mt-0.5"
                  style={{ color: '#4A2511' }}
                >
                  दोहा एवं ४० चौपाई
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  triggerHapticSelection();
                  onSelectTab('vratkatha');
                }}
                style={{
                  backgroundColor: '#FFFDF8',
                  borderColor: '#D6B892',
                }}
                className="p-2.5 rounded-xl border text-left hover:border-[#8B1E1E] transition cursor-pointer"
              >
                <div
                  className="text-xs font-bold"
                  style={{ color: '#6E1409' }}
                >
                  व्रत कथा व आरती
                </div>
                <div
                  className="text-[11px] font-medium mt-0.5"
                  style={{ color: '#4A2511' }}
                >
                  एकादशी व पौराणिक कथाएं
                </div>
              </button>
            </div>
          </section>
        )}
      </div>

      <ShlokaPosterModal
        isOpen={posterData !== null}
        onClose={() => setPosterData(null)}
        data={posterData}
      />
    </div>
  );
};

export default GranthPuranView;
