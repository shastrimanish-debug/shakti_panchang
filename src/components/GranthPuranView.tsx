import React, { useState, useMemo, useEffect } from 'react';
import {
  ALL_GRANTH_EXCERPTS,
  TRADITION_META,
  GranthExcerpt,
  ScriptureTradition,
  localizeGranthReference,
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
    const meaningLabel =
      langKey === 'en' ? 'Meaning' : langKey === 'gu' ? 'ભાવાર્થ' : 'भावार्थ';
    const insightLabel =
      langKey === 'en' ? 'Vedanta Insight' : langKey === 'gu' ? 'તત્ત્વ-ચિંતન' : 'तत्त्व-चिंतन';
    const footerLabel =
      langKey === 'en'
        ? '— Shakti Panchang (Sanatan Granths & Upanishads)'
        : langKey === 'gu'
          ? '— શક્તિ પંચાંગ (સનાતન ગ્રંથ અને ઉપનિષદ સ્વાધ્યાય)'
          : '— शक्ति पंचांग (सनातन ग्रन्थ एवं उपनिषद् स्वाध्याय)';
    const text = `॥ ${title} (${sub}) ॥\n\n${item.sanskrit}\n\n${meaningLabel}: ${meaning}\n\n${insightLabel}: ${tika}\n${footerLabel}`;
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
    const meaningLabel =
      langKey === 'en' ? 'Meaning' : langKey === 'gu' ? 'ભાવાર્થ' : 'भावार्थ';
    const insightLabel =
      langKey === 'en' ? 'Vedanta Insight' : langKey === 'gu' ? 'વેદાંત દર્શન' : 'वेदान्त दर्शन';
    const footerLabel =
      langKey === 'en'
        ? '📲 *Shakti Panchang — Ancient Granths, Upanishads & Puranas*'
        : langKey === 'gu'
          ? '📲 *શક્તિ પંચાંગ — પ્રાચીન ગ્રંથ, ઉપનિષદ અને પુરાણ સ્વાધ્યાય*'
          : '📲 *शक्ति पंचांग — प्राचीन ग्रन्थ, उपनिषद् व पुराण स्वाध्याय*';
    const shareText = `*॥ ${title} · ${sub} ॥*\n\n${item.sanskrit}\n\n*${meaningLabel}:* ${meaning}\n\n*${insightLabel}:* ${tika}\n\n${footerLabel}`;
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
      style={{ backgroundColor: 'var(--bx-bg)', color: 'var(--bx-ink)' }}
    >
      {/* Top Sacred Manuscript Header */}
      <header
        className="shrink-0 px-2 sm:px-3 py-2 shadow-xs border-b z-20"
        style={{
          backgroundColor: 'var(--bx-panel)',
          borderColor: 'var(--bx-line)',
          color: 'var(--bx-ink)',
        }}
      >
        <div className="flex items-center justify-between gap-1 overflow-x-auto no-scrollbar">
          {/* Left Navigation Buttons */}
          <div className="flex items-center gap-1 shrink-0">
            {onBackToPanchang && (
              <button
                type="button"
                onClick={() => {
                  triggerHapticSelection();
                  onBackToPanchang();
                }}
                style={{
                  backgroundColor: 'var(--bx-cream)',
                  color: 'var(--bx-header)',
                  borderColor: 'var(--bx-line)',
                }}
                className="px-2 py-1.5 rounded-lg border transition cursor-pointer flex items-center gap-1 text-[11px] sm:text-xs font-bold shrink-0 shadow-2xs hover:opacity-90 whitespace-nowrap"
                title={langKey === 'en' ? 'Back to Panchang' : langKey === 'gu' ? 'પંચાંગ પર પાછા જાઓ' : 'पंचांग पर वापस जाएं'}
              >
                <ArrowLeft className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--bx-header)' }} />
                <span>
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
                backgroundColor: 'var(--bx-cream)',
                color: 'var(--bx-header)',
                borderColor: 'var(--bx-line)',
              }}
              className="px-2 py-1.5 rounded-lg border transition cursor-pointer flex items-center gap-1 text-[11px] sm:text-xs font-bold shrink-0 shadow-2xs hover:opacity-90 whitespace-nowrap"
              title={langKey === 'en' ? 'Scripture Index' : langKey === 'gu' ? 'ગ્રંથ અનુક્રમણિકા' : 'ग्रन्थ अनुक्रमणिका'}
            >
              <Menu className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--bx-header)' }} />
              <span>
                {langKey === 'en' ? 'Index' : langKey === 'gu' ? 'સૂચિ' : 'सूची'}
              </span>
            </button>
          </div>

          {/* Center Title (Visible on medium/large screens) */}
          <div className="min-w-0 text-center px-1 hidden md:block">
            <h1
              className="text-xs sm:text-sm font-bold font-granth tracking-wide truncate"
              style={{ color: 'var(--bx-header)' }}
            >
              {langKey === 'en'
                ? 'Ancient Granths, Upanishads & Puranas'
                : langKey === 'gu'
                  ? 'પ્રાચીન ગ્રંથ, ઉપનિષદ અને મહાપુરાણ સાર'
                  : 'प्राचीन ग्रन्थ, उपनिषद् एवं महापुराण स्वाध्याय'}
            </h1>
            <p
              className="text-[11px] font-semibold truncate"
              style={{ color: 'var(--bx-mute)' }}
            >
              {currentExcerpt
                ? `${currentExcerpt.scriptureName[langKey]} · ${localizeGranthReference(currentExcerpt.reference, langKey)}`
                : langKey === 'en'
                  ? TRADITION_META[activeTradition].subtitleEn
                  : TRADITION_META[activeTradition].subtitleHi}
            </p>
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => handleToggleSpeak()}
              disabled={!currentExcerpt}
              style={
                isSpeaking
                  ? {
                      backgroundColor: 'var(--bx-gold)',
                      color: '#FFFFFF',
                      borderColor: 'var(--bx-header)',
                    }
                  : {
                      backgroundColor: 'var(--bx-cream)',
                      color: 'var(--bx-header)',
                      borderColor: 'var(--bx-line)',
                    }
              }
              className={`px-2 py-1.5 rounded-lg border text-[11px] sm:text-xs font-bold flex items-center gap-1 cursor-pointer transition shadow-2xs hover:opacity-90 whitespace-nowrap ${
                isSpeaking ? 'animate-pulse' : ''
              }`}
              title={langKey === 'en' ? 'Listen to Sanskrit recitation' : langKey === 'gu' ? 'સસ્વર સંસ્કૃત પાઠ સાંભળો' : 'सस्वर संस्कृत व हिंदी पाठ सुनें'}
            >
              {isSpeaking ? (
                <VolumeX className="w-3.5 h-3.5 shrink-0 text-white" />
              ) : (
                <Volume2 className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--bx-header)' }} />
              )}
              <span>
                {isSpeaking
                  ? langKey === 'en'
                    ? 'Stop'
                    : langKey === 'gu'
                      ? 'રોકો'
                      : 'रुकें'
                  : langKey === 'en'
                    ? 'Recite'
                    : langKey === 'gu'
                      ? 'સ્વર'
                      : 'स्वर'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                triggerHapticSelection();
                setViewMode((m) => (m === 'reader' ? 'catalog' : 'reader'));
              }}
              style={{
                backgroundColor: 'var(--bx-cream)',
                color: 'var(--bx-header)',
                borderColor: 'var(--bx-line)',
              }}
              className="px-2 py-1.5 rounded-lg border text-[11px] sm:text-xs font-bold flex items-center gap-1 cursor-pointer shadow-2xs hover:opacity-90 whitespace-nowrap"
              title={langKey === 'en' ? 'Toggle View Mode' : langKey === 'gu' ? 'વાંચન મોડ બદલો' : 'पठन मोड बदलें'}
            >
              <LayoutList className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--bx-header)' }} />
              <span>
                {viewMode === 'reader'
                  ? langKey === 'en'
                    ? 'All'
                    : langKey === 'gu'
                      ? 'યાદી'
                      : 'सभी'
                  : langKey === 'en'
                    ? 'Reader'
                    : langKey === 'gu'
                      ? 'પાઠ'
                      : 'पठन'}
              </span>
            </button>

            <button
              type="button"
              onClick={cycleFontSize}
              style={{
                backgroundColor: 'var(--bx-cream)',
                color: 'var(--bx-header)',
                borderColor: 'var(--bx-line)',
              }}
              className="px-2 py-1.5 rounded-lg border text-[11px] sm:text-xs font-bold cursor-pointer shadow-2xs hover:opacity-90 shrink-0 whitespace-nowrap"
              title={langKey === 'en' ? 'Change Font Size' : langKey === 'gu' ? 'અક્ષરનું કદ બદલો' : 'अक्षर आकार बदलें'}
            >
              {(() => {
                const glyph = langKey === 'en' ? 'A' : langKey === 'gu' ? 'અ' : 'अ';
                return fontSize === 'sm'
                  ? `${glyph}-`
                  : fontSize === 'base'
                    ? glyph
                    : fontSize === 'lg'
                      ? `${glyph}+`
                      : `${glyph}++`;
              })()}
            </button>

            {onOpenUmaModal && currentExcerpt && (
              <button
                type="button"
                onClick={() => {
                  triggerHapticSelection();
                  onOpenUmaModal(
                    `${currentExcerpt.scriptureName[langKey] || currentExcerpt.scriptureName.hi} (${localizeGranthReference(currentExcerpt.reference, langKey)}) — "${currentExcerpt.sanskrit.split('\n')[0]}"`
                  );
                }}
                style={{
                  backgroundColor: 'var(--bx-header)',
                  color: '#FFFFFF',
                  borderColor: 'var(--bx-gold)',
                }}
                className="px-2 py-1.5 rounded-lg border text-[11px] sm:text-xs font-bold flex items-center gap-1 shadow-xs active:scale-95 transition cursor-pointer shrink-0 whitespace-nowrap"
              >
                <Sparkles className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--bx-mark-soft)' }} />
                <span style={{ color: '#FFFFFF' }}>
                  {langKey === 'en' ? 'Ask Uma' : langKey === 'gu' ? 'ઉમા' : 'उमा'}
                </span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Tradition Filter Bar + Search Bar */}
      <div
        className="shrink-0 border-b px-3 py-2 space-y-2"
        style={{ backgroundColor: 'var(--bx-cream)', borderColor: 'var(--bx-line)' }}
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
                        backgroundColor: 'var(--bx-header)',
                        color: '#FFFFFF',
                        borderColor: 'var(--bx-gold)',
                      }
                    : {
                        backgroundColor: 'var(--bx-panel)',
                        color: 'var(--bx-ink)',
                        borderColor: 'var(--bx-line)',
                      }
                }
                className="px-3 py-1.5 rounded-lg border text-xs font-bold whitespace-nowrap transition cursor-pointer shrink-0 shadow-2xs"
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
                        backgroundColor: 'var(--bx-header)',
                        color: '#FFFFFF',
                        borderColor: 'var(--bx-gold)',
                      }
                    : {
                        backgroundColor: 'var(--bx-panel)',
                        color: 'var(--bx-ink)',
                        borderColor: 'var(--bx-line)',
                      }
                }
                className="px-2.5 py-1 rounded-md border text-[11px] font-bold whitespace-nowrap cursor-pointer transition shadow-2xs"
              >
                {langKey === 'en' ? 'All Texts' : langKey === 'gu' ? 'બધા ગ્રંથો' : 'सभी ग्रन्थ'}
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
                            backgroundColor: 'var(--bx-header)',
                            color: '#FFFFFF',
                            borderColor: 'var(--bx-gold)',
                          }
                        : {
                            backgroundColor: 'var(--bx-panel)',
                            color: 'var(--bx-ink)',
                            borderColor: 'var(--bx-line)',
                          }
                    }
                    className="px-2.5 py-1 rounded-md border text-[11px] font-bold whitespace-nowrap cursor-pointer transition shadow-2xs"
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
              style={{ color: 'var(--bx-mute)' }}
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
                backgroundColor: 'var(--bx-panel)',
                color: 'var(--bx-ink)',
                borderColor: 'var(--bx-line)',
              }}
              className="w-full pl-8 pr-7 py-1.5 rounded-lg border text-xs font-medium focus:outline-none focus:border-[var(--bx-gold)]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{ color: 'var(--bx-mute)' }}
                className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer"
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
          className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xs flex justify-start animate-in fade-in duration-200"
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
                    : langKey === 'gu'
                      ? `ગ્રંથ શ્લોક અનુક્રમણિકા (${filteredExcerpts.length})`
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
                        {item.scriptureName[langKey]} · {localizeGranthReference(item.reference, langKey)}
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
                  : langKey === 'gu'
                    ? 'હજી સુધી કોઈ શ્લોક બુકમાર્ક કરેલ નથી'
                    : 'अभी कोई श्लोक बुकमार्क नहीं किया गया है'
                : langKey === 'en'
                  ? 'No Matching Scripture Excerpts Found'
                  : langKey === 'gu'
                    ? 'આ શોધ મુજબ કોઈ શ્લોક મળ્યો નથી'
                    : 'इस खोज से संबंधित कोई श्लोक नहीं मिला'}
            </h3>
            <p className="text-xs font-medium" style={{ color: '#4A2511' }}>
              {activeTradition === 'bookmarked'
                ? langKey === 'en'
                  ? 'Tap the bookmark icon on any Bhagavad Gita, Upanishad, or Purana verse to save it here for daily reflection.'
                  : langKey === 'gu'
                    ? 'સ્વાધ્યાય દરમિયાન કોઈપણ ગીતા શ્લોક, ઉપનિષદ મંત્ર કે પુરાણ વચન પર બુકમાર્ક દબાવીને અહીં સાચવો.'
                    : 'स्वाध्याय के दौरान किसी भी गीता श्लोक, उपनिषद् मन्त्र या पुराण वचन पर बुकमार्क चिह्न दबाकर यहाँ सहेजें।'
                : langKey === 'en'
                  ? 'Try clearing the search filter or selecting "All Scriptures".'
                  : langKey === 'gu'
                    ? 'કૃપા કરીને શોધ શબ્દ બદલો અથવા "સર્વ ગ્રંથો" પસંદ કરો.'
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
              {langKey === 'en' ? 'Show All Scriptures' : langKey === 'gu' ? 'બધા ગ્રંથો જુઓ' : 'सभी ग्रन्थ देखें'}
            </button>
          </div>
        ) : viewMode === 'reader' && currentExcerpt ? (
          /* ================= FOCUSED MANUSCRIPT READER MODE ================= */
          <div className="max-w-3xl mx-auto space-y-4">
            {/* Top Excerpt Navigation & Metadata Bar */}
            <div
              style={{
                backgroundColor: 'var(--bx-cream)',
                borderColor: 'var(--bx-line)',
              }}
              className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl border shadow-2xs"
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
                  backgroundColor: 'var(--bx-panel)',
                  color: 'var(--bx-header)',
                  borderColor: 'var(--bx-line)',
                }}
                className="px-2.5 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1 cursor-pointer active:scale-95 shadow-2xs hover:opacity-90 shrink-0 whitespace-nowrap"
              >
                <ChevronLeft className="w-4 h-4 shrink-0" style={{ color: 'var(--bx-header)' }} />
                <span>{langKey === 'en' ? 'Prev' : langKey === 'gu' ? 'પૂર્વ' : 'पूर्व'}</span>
              </button>

              <div className="text-center min-w-0 px-1.5 flex-1">
                <div
                  className="text-xs sm:text-sm font-bold truncate"
                  style={{ color: 'var(--bx-header)' }}
                >
                  {currentExcerpt.scriptureName[langKey]}
                </div>
                <div
                  className="text-[11px] font-semibold truncate"
                  style={{ color: 'var(--bx-ink)' }}
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
                  backgroundColor: 'var(--bx-header)',
                  color: '#FFFFFF',
                  borderColor: 'var(--bx-gold)',
                }}
                className="px-2.5 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1 cursor-pointer active:scale-95 shadow-2xs hover:opacity-90 shrink-0 whitespace-nowrap"
              >
                <span style={{ color: '#FFFFFF' }}>
                  {langKey === 'en' ? 'Next' : langKey === 'gu' ? 'આગળ' : 'अगला'}
                </span>
                <ChevronRight className="w-4 h-4 shrink-0" style={{ color: '#FFFFFF' }} />
              </button>
            </div>

            {/* Sacred Bhojpatra / Manuscript Card */}
            <article
              style={{
                backgroundColor: 'var(--bx-panel)',
                borderColor: 'var(--bx-line)',
                color: 'var(--bx-ink)',
              }}
              className="rounded-2xl border shadow-xs p-4 sm:p-6 space-y-5"
            >
              {/* Editorial Metadata Header */}
              <div
                style={{ borderColor: 'var(--bx-line)', color: 'var(--bx-ink)' }}
                className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b text-xs font-semibold"
              >
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="font-bold" style={{ color: 'var(--bx-header)' }}>
                    {currentExcerpt.rishiOrSpeaker[langKey]}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span style={{ color: 'var(--bx-mute)' }}>
                    {currentExcerpt.themeTag[langKey]}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span style={{ color: 'var(--bx-ink)' }}>
                    {localizeGranthReference(currentExcerpt.reference, langKey)}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => toggleBookmark(currentExcerpt.id)}
                    style={
                      bookmarks[currentExcerpt.id]
                        ? {
                            backgroundColor: 'var(--bx-gold)',
                            borderColor: 'var(--bx-header)',
                            color: '#FFFFFF',
                          }
                        : {
                            backgroundColor: 'var(--bx-cream)',
                            borderColor: 'var(--bx-line)',
                            color: 'var(--bx-header)',
                          }
                    }
                    className="p-1.5 rounded-lg border transition cursor-pointer shadow-2xs hover:opacity-90"
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
                      backgroundColor: 'var(--bx-cream)',
                      borderColor: 'var(--bx-line)',
                      color: 'var(--bx-header)',
                    }}
                    className="p-1.5 rounded-lg border transition cursor-pointer shadow-2xs hover:opacity-90"
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
                      const vedantaPrefix =
                        langKey === 'en'
                          ? 'Vedanta Insight'
                          : langKey === 'gu'
                            ? 'વેદાંત દર્શન'
                            : 'वेदान्त दर्शन';
                      setPosterData({
                        title: currentExcerpt.scriptureName[langKey] || currentExcerpt.scriptureName.hi,
                        reference: `${currentExcerpt.subSource[langKey] || currentExcerpt.subSource.hi} · ${localizeGranthReference(currentExcerpt.reference, langKey)}`,
                        sanskrit: currentExcerpt.sanskrit,
                        meaning: `${currentExcerpt.meaning[langKey] || currentExcerpt.meaning.hi}\n\n${vedantaPrefix}: ${currentExcerpt.commentary[langKey] || currentExcerpt.commentary.hi}`,
                        speaker: currentExcerpt.rishiOrSpeaker[langKey] || currentExcerpt.rishiOrSpeaker.hi,
                        accentTag: `📜 ${currentExcerpt.themeTag[langKey] || currentExcerpt.themeTag.hi}`,
                      });
                    }}
                    style={{
                      backgroundColor: 'var(--bx-header)',
                      borderColor: 'var(--bx-gold)',
                      color: '#FFFFFF',
                    }}
                    className="px-2.5 py-1 rounded-lg border text-xs font-bold flex items-center gap-1 cursor-pointer shadow-2xs hover:opacity-90 whitespace-nowrap"
                    title={langKey === 'en' ? 'Download/Share HD Status Card' : langKey === 'gu' ? 'HD સ્ટેટસ કાર્ડ ડાઉનલોડ/શેર કરો' : 'HD स्टेटस इमेज कार्ड डाउनलोड/शेयर करें'}
                  >
                    <span>
                      {langKey === 'en'
                        ? '📸 Status Card'
                        : langKey === 'gu'
                          ? '📸 સ્ટેટસ કાર્ડ'
                          : '📸 स्टेटस कार्ड'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleShare(currentExcerpt)}
                    style={{
                      backgroundColor: 'var(--bx-cream)',
                      borderColor: 'var(--bx-line)',
                      color: 'var(--bx-header)',
                    }}
                    className="px-2.5 py-1 rounded-lg border text-xs font-bold flex items-center gap-1 cursor-pointer shadow-2xs hover:opacity-90 whitespace-nowrap"
                    title={langKey === 'en' ? 'Share on WhatsApp' : langKey === 'gu' ? 'WhatsApp પર શેર કરો' : 'व्हाट्सएप पर साझा करें'}
                  >
                    <Share2 className="w-3.5 h-3.5" style={{ color: 'var(--bx-header)' }} />
                    <span>
                      {langKey === 'en' ? 'Share' : langKey === 'gu' ? 'શેર' : 'शेयर'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Primary Sanskrit Shloka / Mantra Display */}
              <div
                data-no-translate="true"
                style={{
                  backgroundColor: 'var(--bx-cream)',
                  borderColor: 'var(--bx-gold)',
                }}
                className="py-4 px-3 sm:px-5 rounded-xl border-2 text-center space-y-3 shadow-2xs"
              >
                <div
                  className="text-xs font-granth font-bold tracking-widest"
                  style={{ color: 'var(--bx-header)' }}
                >
                  ॥ श्री परमात्मने नमः ॥
                </div>
                <p
                  style={{ color: 'var(--bx-header)' }}
                  className={`font-granth font-bold whitespace-pre-line ${sanskritFontClass}`}
                >
                  {currentExcerpt.sanskrit}
                </p>
                <p
                  style={{ color: 'var(--bx-ink)' }}
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
                        : langKey === 'gu'
                          ? 'છુપાવો'
                          : 'छुपाएं'
                      : langKey === 'en'
                        ? 'Show'
                        : langKey === 'gu'
                          ? 'બતાવો'
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
                          : langKey === 'gu'
                            ? 'ઉચ્ચારણ પદચ્છેદ: '
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
                      <span>{localizeGranthReference(item.reference, langKey)}</span>
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
                        className="px-2 py-1 rounded-lg border text-[11px] font-bold flex items-center gap-1 cursor-pointer whitespace-nowrap"
                      >
                        {isItemSpeaking ? (
                          <VolumeX className="w-3 h-3" />
                        ) : (
                          <Volume2 className="w-3 h-3" />
                        )}
                        <span>
                          {isItemSpeaking
                            ? langKey === 'en'
                              ? 'Stop'
                              : langKey === 'gu'
                                ? 'રોકો'
                                : 'रुकें'
                            : langKey === 'en'
                              ? 'Listen'
                              : langKey === 'gu'
                                ? 'સાંભળો'
                                : 'सुनें'}
                        </span>
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
                        className="px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer whitespace-nowrap"
                      >
                        {langKey === 'en'
                          ? 'Read Full'
                          : langKey === 'gu'
                            ? 'વિગતવાર વાંચો'
                            : 'विस्तार से पढ़ें'}
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
                      {langKey === 'en' ? '← Prev Chapter' : langKey === 'gu' ? '← પૂર્વ અધ્યાય' : '← पूर्व अध्याय'}
                    </button>
                  )}
                  {onNextChapter && (
                    <button
                      type="button"
                      onClick={onNextChapter}
                      style={{ color: '#8B1E1E' }}
                      className="font-bold hover:underline cursor-pointer"
                    >
                      {langKey === 'en' ? 'Next Chapter →' : langKey === 'gu' ? 'આગળનો અધ્યાય →' : 'अगला अध्याय →'}
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
                  {langKey === 'en' ? 'Durga Saptashati' : langKey === 'gu' ? 'શ્રી દુર્ગા સપ્તશતી' : 'श्री दुर्गा सप्तशती'}
                </div>
                <div
                  className="text-[11px] font-medium mt-0.5"
                  style={{ color: '#4A2511' }}
                >
                  {langKey === 'en' ? '13 Chapters & Kavach' : langKey === 'gu' ? '૧૩ અધ્યાય અને કવચ પાઠ' : '१३ अध्याय व कवच पाठ'}
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
                  {langKey === 'en' ? 'Sampoorna Sundarkand' : langKey === 'gu' ? 'સંપૂર્ણ સુંદરકાંડ' : 'संपूर्ण सुंदरकांड'}
                </div>
                <div
                  className="text-[11px] font-medium mt-0.5"
                  style={{ color: '#4A2511' }}
                >
                  {langKey === 'en' ? 'Ramcharitmanas Chapter' : langKey === 'gu' ? 'શ્રી રામચરિતમાનસ સોપાન' : 'श्री रामचरितमानस सोपान'}
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
                  {langKey === 'en' ? 'Hanuman Chalisa' : langKey === 'gu' ? 'શ્રી હનુમાન ચાલીસા' : 'श्री हनुमान चालीसा'}
                </div>
                <div
                  className="text-[11px] font-medium mt-0.5"
                  style={{ color: '#4A2511' }}
                >
                  {langKey === 'en' ? 'Doha & 40 Chaupais' : langKey === 'gu' ? 'દોહા અને ૪૦ ચોપાઈ' : 'दोहा एवं ४० चौपाई'}
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
                  {langKey === 'en' ? 'Vrat Katha & Aarti' : langKey === 'gu' ? 'વ્રત કથા અને આરતી' : 'व्रत कथा व आरती'}
                </div>
                <div
                  className="text-[11px] font-medium mt-0.5"
                  style={{ color: '#4A2511' }}
                >
                  {langKey === 'en' ? 'Ekadashi & Sacred Stories' : langKey === 'gu' ? 'એકાદશી અને પૌરાણિક કથાઓ' : 'एकादशी व पौराणिक कथाएं'}
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
