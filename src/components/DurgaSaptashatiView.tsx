import React, { useState, useMemo } from 'react';
import { DURGA_CHAPTERS, DURGA_ANGAS } from '../data/durgaSaptashatiData';
import { localizeAnga, localizeChapter, saptUi } from '../data/saptashatiLocale';
import durgaPathRaw from '../data/durgaPath.json';
import {
  Sparkles,
  Share2,
  Volume2,
  VolumeX,
  BookOpen,
  Scroll,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Search,
  Copy,
  Check,
  Bookmark,
  Layers,
  Menu,
  X,
  ArrowLeft,
} from 'lucide-react';
import { openWhatsAppShare } from '../services/umaConsultationPdf';
import { useLanguage } from '../i18n';
import { speakUma, stopUmaSpeech } from '../lib/umaSpeech';

interface RawChapterShloka {
  n: number;
  text: string;
}

const durgaPath = durgaPathRaw as unknown as {
  chapters: Record<string, RawChapterShloka[]>;
};

export const DurgaSaptashatiView: React.FC<{
  onBackToPanchang?: () => void;
  onOpenUmaModal?: (query?: string) => void;
  onPrevChapter?: () => void;
  onNextChapter?: () => void;
}> = ({ onBackToPanchang, onOpenUmaModal, onPrevChapter, onNextChapter }) => {
  const { language } = useLanguage();
  const ui = saptUi(language);

  // Section & Selector States
  const [activeTab, setActiveTab] = useState<'angas' | 'chapters'>('chapters');
  const [selectedAngaIndex, setSelectedAngaIndex] = useState<number>(0);
  const [selectedChapterIndex, setSelectedChapterIndex] = useState<number>(0);

  // Reader Settings States
  const [viewMode, setViewMode] = useState<'list' | 'paged'>('list');
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg'>('base');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [bookmarks, setBookmarks] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isTocOpen, setIsTocOpen] = useState<boolean>(false);

  // Audio Speech States
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [currentSpeakingId, setCurrentSpeakingId] = useState<string | null>(null);

  // Current active data resolution
  const activeAnga = DURGA_ANGAS[selectedAngaIndex] || DURGA_ANGAS[0];
  const activeChapter = DURGA_CHAPTERS[selectedChapterIndex] || DURGA_CHAPTERS[0];

  const localizedAnga = localizeAnga(activeAnga, language);
  const localizedChapter = localizeChapter(activeChapter, language);

  // Complete Verses resolution from durgaPath.json for ALL 700 Shlokas!
  const currentVerses = useMemo(() => {
    if (activeTab === 'angas') {
      return localizedAnga.verses.map((v, idx) => ({
        id: `anga_${activeAnga.id}_${idx + 1}`,
        number: idx + 1,
        sanskrit: v.sanskrit,
        hindi: v.meaning,
      }));
    } else {
      const chapterKey = String(activeChapter.id);
      const rawShlokas = durgaPath.chapters[chapterKey] || [];

      if (rawShlokas.length > 0) {
        // Map highlight meanings if available, else render clean authentic chapter translation
        const highlightsMap = new Map<number, string>();
        if (activeChapter.sanskritHighlights) {
          activeChapter.sanskritHighlights.forEach((sh, hIdx) => {
            highlightsMap.set(hIdx + 1, sh.meaning);
          });
        }

        return rawShlokas.map((s) => {
          const matchedHighlight = highlightsMap.get(s.n);
          const defaultMeaning = matchedHighlight
            ? matchedHighlight
            : `अध्याय ${activeChapter.id} • श्लोक ${s.n}: ${localizedChapter.summary}`;

          return {
            id: `chap_${activeChapter.id}_${s.n}`,
            number: s.n,
            sanskrit: s.text,
            hindi: defaultMeaning,
          };
        });
      }

      // Fallback if raw JSON missing
      if (activeChapter.sanskritHighlights && activeChapter.sanskritHighlights.length > 0) {
        return activeChapter.sanskritHighlights.map((sh, idx) => ({
          id: `chap_${activeChapter.id}_${idx + 1}`,
          number: idx + 1,
          sanskrit: sh.shloka,
          hindi: sh.meaning,
        }));
      }

      return [
        {
          id: `chap_${activeChapter.id}_1`,
          number: 1,
          sanskrit: `${localizedChapter.heading}\n\n${localizedChapter.summary}`,
          hindi: localizedChapter.phala,
        },
      ];
    }
  }, [activeTab, activeAnga, activeChapter, localizedAnga, localizedChapter]);

  // Filtered Verses by search query
  const filteredVerses = useMemo(() => {
    if (!searchQuery.trim()) return currentVerses;
    const q = searchQuery.toLowerCase();
    return currentVerses.filter(
      (v) => v.sanskrit.toLowerCase().includes(q) || v.hindi.toLowerCase().includes(q)
    );
  }, [currentVerses, searchQuery]);

  // Paginated Verses
  const totalPages = Math.ceil(filteredVerses.length / pageSize) || 1;
  const safePage = Math.min(Math.max(currentPage, 1), totalPages);
  const paginatedVerses = useMemo(() => {
    if (viewMode === 'list') return filteredVerses;
    const start = (safePage - 1) * pageSize;
    return filteredVerses.slice(start, start + pageSize);
  }, [filteredVerses, viewMode, safePage, pageSize]);

  // Audio Speech Handler
  const handleSpeakVerse = (id: string, text: string) => {
    if (isSpeaking && currentSpeakingId === id) {
      stopUmaSpeech();
      setIsSpeaking(false);
      setCurrentSpeakingId(null);
      return;
    }

    stopUmaSpeech();
    setIsSpeaking(true);
    setCurrentSpeakingId(id);

    void speakUma(text, {
      rate: 0.88,
      onStart: () => {
        setIsSpeaking(true);
        setCurrentSpeakingId(id);
      },
      onEnd: () => {
        setIsSpeaking(false);
        setCurrentSpeakingId(null);
      },
      onError: () => {
        setIsSpeaking(false);
        setCurrentSpeakingId(null);
      },
    });
  };

  const handleSpeakAllSection = () => {
    const title = activeTab === 'angas' ? localizedAnga.name : localizedChapter.heading;
    const fullText = `${title}। ${currentVerses.slice(0, 10).map((v) => `श्लोक ${v.number}: ${v.sanskrit}`).join('। ')}`;
    handleSpeakVerse(`section_full`, fullText);
  };

  // Copy Handler
  const handleCopy = (id: string, sanskrit: string, hindi: string) => {
    const text = `${sanskrit}\n\nभावार्थ: ${hindi}\n(शक्ति पंचांग - श्री दुर्गा सप्तशती)`;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Share Handler
  const handleShareVerse = (number: number, sanskrit: string, hindi: string) => {
    const sectionTitle = activeTab === 'angas' ? localizedAnga.name : `अध्याय ${activeChapter.id}`;
    const text = `॥ ${sectionTitle} - श्लोक ${number} ॥\n\n${sanskrit}\n\nभावार्थ:\n${hindi}\n\n(शक्ति पंचांग - श्री दुर्गा सप्तशती)`;
    openWhatsAppShare(text);
  };

  // Bookmark Toggle
  const toggleBookmark = (id: string) => {
    setBookmarks((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="w-full h-full min-h-0 flex flex-col bg-[#FCF8EC] text-[#2C180C] overflow-hidden select-none relative">
      {/* Royal Header Bar */}
      <header className="shrink-0 bg-gradient-to-r from-[#462B17] via-[#5C3A21] to-[#3E2714] text-[#FAF2E4] px-3 py-2.5 shadow-md flex items-center justify-between border-b border-[#B56A00]/40 z-20">
        <div className="flex items-center gap-2">
          {/* Back to Panchang Button */}
          {onBackToPanchang && (
            <button
              type="button"
              onClick={onBackToPanchang}
              className="px-2 py-1 rounded-xl bg-[#2C180C] border border-amber-500/40 text-amber-300 hover:bg-amber-900/40 transition cursor-pointer flex items-center gap-1 text-xs font-bold shrink-0"
              title="पंचांग पर वापस जाएं"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">पंचांग</span>
            </button>
          )}

          {/* TOC Index Button */}
          <button
            type="button"
            onClick={() => setIsTocOpen(!isTocOpen)}
            className="p-1.5 rounded-xl bg-[#2C180C] border border-amber-500/40 text-amber-300 hover:bg-amber-900/40 transition cursor-pointer flex items-center gap-1"
            title="अनुक्रमणिका (TOC)"
          >
            <Menu className="w-4 h-4" />
            <span className="text-[10px] font-bold hidden sm:inline">अनुसूची</span>
          </button>

          <div>
            <h2 className="text-xs sm:text-sm font-black font-granth tracking-wide text-[#FFD88A] flex items-center gap-1.5">
              <span>{ui.title}</span>
              <span className="text-[9px] bg-amber-500/20 text-amber-200 px-1.5 py-0.5 rounded-full border border-amber-400/30">
                ७०० श्लोक • १३ अध्याय
              </span>
            </h2>
            <p className="text-[10px] text-[#E5D2B8] truncate max-w-[180px] sm:max-w-md">
              {activeTab === 'angas'
                ? localizedAnga.name
                : `अध्याय ${activeChapter.id}: ${localizedChapter.heading}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* View Mode Toggle */}
          <button
            type="button"
            onClick={() => setViewMode(viewMode === 'list' ? 'paged' : 'list')}
            className={`px-2 py-1 rounded-lg border text-[10px] font-bold transition flex items-center gap-1 cursor-pointer ${
              viewMode === 'paged'
                ? 'bg-amber-500 text-stone-950 border-amber-400 font-black'
                : 'bg-[#3E2714] border-amber-500/30 text-amber-200'
            }`}
            title="स्वाध्याय मोड बदलें"
          >
            <Layers className="w-3 h-3" />
            <span className="hidden sm:inline">{viewMode === 'list' ? 'सतत मोड' : 'पृष्ठ मोड'}</span>
          </button>

          {/* Font Size Toggle */}
          <button
            type="button"
            onClick={() => setFontSize(fontSize === 'sm' ? 'base' : fontSize === 'base' ? 'lg' : 'sm')}
            className="px-2 py-1 rounded-lg bg-[#3E2714] border border-amber-500/30 text-[10px] text-amber-200 font-bold hover:bg-amber-900/40 cursor-pointer"
            title="अक्षर आकार"
          >
            {fontSize === 'sm' ? 'अ (छोटा)' : fontSize === 'base' ? 'अ (मध्यम)' : 'अ (बड़ा)'}
          </button>

          {/* Ask Uma FAB */}
          {onOpenUmaModal && (
            <button
              type="button"
              onClick={() => onOpenUmaModal('दुर्गा सप्तशती के इस पाठ का गूढ़ आध्यात्मिक रहस्य समझाइए।')}
              className="px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-stone-950 text-xs font-black flex items-center gap-1 shadow-sm hover:scale-105 active:scale-95 transition cursor-pointer"
            >
              <Sparkles className="w-3 h-3 fill-stone-950" />
              <span>उमा</span>
            </button>
          )}
        </div>
      </header>

      {/* Slide-out Interactive TOC / Index Drawer Overlay */}
      {isTocOpen && (
        <div className="absolute inset-0 z-30 bg-black/60 backdrop-blur-xs flex justify-start animate-in fade-in duration-200">
          <div className="w-4/5 max-w-xs h-full bg-[#FAF2E4] border-r-2 border-amber-600 shadow-2xl flex flex-col p-3 space-y-3 overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-[#E2D2BE]">
              <div className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-[#8C4A00]" />
                <h3 className="font-granth font-black text-sm text-[#462B17]">
                  अनुक्रमणिका एवं सूची
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsTocOpen(false)}
                className="p-1 rounded-lg bg-[#E2D2BE] text-[#462B17] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* TOC Category 1: Angas */}
            <div className="space-y-1">
              <div className="text-[10px] font-black text-[#8C6239] uppercase tracking-wider">
                ॥ अंग संग्रह पाठ (कवच व कुंजिका) ॥
              </div>
              <div className="space-y-1">
                {DURGA_ANGAS.map((anga, idx) => (
                  <button
                    key={anga.id}
                    type="button"
                    onClick={() => {
                      setActiveTab('angas');
                      setSelectedAngaIndex(idx);
                      setIsTocOpen(false);
                      setCurrentPage(1);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                      activeTab === 'angas' && selectedAngaIndex === idx
                        ? 'bg-[#5C3A21] text-[#FFF6E5]'
                        : 'bg-white/80 text-[#3E2714] hover:bg-[#FFEEC9]'
                    }`}
                  >
                    <span>{anga.name}</span>
                    <span className="text-[9px] opacity-75">{anga.verses.length} श्लोक</span>
                  </button>
                ))}
              </div>
            </div>

            {/* TOC Category 2: 13 Chapters */}
            <div className="space-y-1 pt-2 border-t border-[#E2D2BE]">
              <div className="text-[10px] font-black text-[#8C6239] uppercase tracking-wider">
                ॥ सप्तशती १३ संपूर्ण अध्याय ॥
              </div>
              <div className="space-y-1">
                {DURGA_CHAPTERS.map((ch, idx) => (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => {
                      setActiveTab('chapters');
                      setSelectedChapterIndex(idx);
                      setIsTocOpen(false);
                      setCurrentPage(1);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                      activeTab === 'chapters' && selectedChapterIndex === idx
                        ? 'bg-[#5C3A21] text-[#FFF6E5]'
                        : 'bg-white/80 text-[#3E2714] hover:bg-[#FFEEC9]'
                    }`}
                  >
                    <div className="truncate pr-1">
                      <span className="text-[#B56A00] font-black mr-1">अध्याय {ch.id}:</span>
                      <span>{ch.title}</span>
                    </div>
                    <span className="text-[9px] opacity-75 shrink-0">{ch.shlokaCount} श्लोक</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Section Navigation Bar */}
      <div className="shrink-0 bg-[#FFFDF9] border-b border-[#E8DCCB] px-2 py-1.5 flex items-center justify-between gap-2 shadow-2xs">
        {/* Section Tabs */}
        <div className="flex items-center gap-1 bg-[#F4E8D1] p-1 rounded-xl w-full max-w-sm mx-auto">
          <button
            type="button"
            onClick={() => {
              setActiveTab('chapters');
              setCurrentPage(1);
            }}
            className={`flex-1 py-1.5 rounded-lg text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'chapters'
                ? 'bg-[#5C3A21] text-[#FFF6E5] shadow-xs'
                : 'text-[#6B4E36] hover:text-[#2C180C]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>सप्तशती १३ अध्याय</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('angas');
              setCurrentPage(1);
            }}
            className={`flex-1 py-1.5 rounded-lg text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'angas'
                ? 'bg-[#5C3A21] text-[#FFF6E5] shadow-xs'
                : 'text-[#6B4E36] hover:text-[#2C180C]'
            }`}
          >
            <Scroll className="w-3.5 h-3.5" />
            <span>अंग संग्रह (कवच/कुंजिका)</span>
          </button>
        </div>
      </div>

      {/* Carousel Selector & Controls Bar */}
      <div className="shrink-0 bg-[#FFF8EE] border-b border-amber-200 px-2 py-1.5 space-y-1.5">
        {/* Sub-item Carousel */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar select-none">
          {activeTab === 'chapters'
            ? DURGA_CHAPTERS.map((ch, idx) => (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => {
                    setSelectedChapterIndex(idx);
                    setCurrentPage(1);
                  }}
                  className={`shrink-0 px-3 py-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    selectedChapterIndex === idx
                      ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white border-amber-800 shadow-sm font-black'
                      : 'bg-white text-[#5C3A21] border-[#E2D2BE] hover:bg-[#FFEEC9]'
                  }`}
                >
                  <span className="text-[10px] opacity-80">अध्याय</span>
                  <span>{ch.id}</span>
                </button>
              ))
            : DURGA_ANGAS.map((anga, idx) => (
                <button
                  key={anga.id}
                  type="button"
                  onClick={() => {
                    setSelectedAngaIndex(idx);
                    setCurrentPage(1);
                  }}
                  className={`shrink-0 px-3 py-1.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                    selectedAngaIndex === idx
                      ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white border-amber-800 shadow-sm font-black'
                      : 'bg-white text-[#5C3A21] border-[#E2D2BE] hover:bg-[#FFEEC9]'
                  }`}
                >
                  {anga.name}
                </button>
              ))}
        </div>

        {/* Search Bar & Full Recite Control */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8C6239]" />
            <input
              type="text"
              placeholder="श्लोक खोजें (उदा. सावर्णिः, महिषासुर, या देवी)..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-8 pr-3 py-1 bg-white border border-[#E2D2BE] rounded-xl text-xs text-[#3E2714] focus:outline-none focus:border-amber-500"
            />
          </div>

          <button
            type="button"
            onClick={handleSpeakAllSection}
            className="px-2.5 py-1 rounded-xl bg-amber-100 text-[#5C3A21] border border-amber-300 text-xs font-bold flex items-center gap-1 hover:bg-amber-200 transition shrink-0 cursor-pointer"
            title="पाठ वाचन"
          >
            {isSpeaking && currentSpeakingId === 'section_full' ? (
              <>
                <VolumeX className="w-3.5 h-3.5 text-rose-600" />
                <span className="text-rose-600">रोकें</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-[#8C4A00]" />
                <span>पाठ सुनें</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Reader Scroll Body */}
      <div className="flex-1 min-h-0 overflow-y-auto p-2 sm:p-4 space-y-3">
        {/* Active Header Banner Card */}
        <div className="bg-[#FFFDF9] border-2 border-amber-300 rounded-2xl p-3.5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-amber-100 text-[#8C4A00] font-black text-xs border border-amber-300">
                {activeTab === 'angas' ? localizedAnga.name : `अध्याय ${activeChapter.id}`}
              </span>
              <span className="text-[11px] font-bold text-[#8B1E1E]">
                {activeTab === 'angas' ? 'मार्कण्डेय पुराण / रुद्रयामल' : localizedChapter.charitra}
              </span>
            </div>

            <div className="text-xs font-bold text-[#8C6239]">
              कुल श्लोक: <strong className="text-[#8B1E1E] text-sm">{currentVerses.length}</strong>
            </div>
          </div>

          <h1 className="text-sm sm:text-base font-black font-granth text-[#462B17]">
            {activeTab === 'angas' ? localizedAnga.name : localizedChapter.heading}
          </h1>

          <p className="text-xs text-[#735133] leading-relaxed">
            {activeTab === 'angas' ? localizedAnga.desc : localizedChapter.summary}
          </p>

          <div className="p-2 rounded-xl bg-[#FFF8EE] border border-amber-200 text-xs text-[#8B1E1E] font-bold flex items-center justify-between">
            <span>🛡️ पाठ फल: {activeTab === 'angas' ? localizedAnga.significance : localizedChapter.phala}</span>
          </div>
        </div>

        {/* Verses Render Container - ALL SHLOKAS 1 to END */}
        {paginatedVerses.length > 0 ? (
          <div className="space-y-3">
            {paginatedVerses.map((verse) => (
              <div
                key={verse.id}
                className={`bg-white/95 border-2 rounded-2xl p-3.5 space-y-2 shadow-2xs transition-all ${
                  bookmarks[verse.id]
                    ? 'border-amber-500 bg-amber-50/40 shadow-sm'
                    : 'border-[#E2D2BE] hover:border-amber-300'
                }`}
              >
                {/* Verse Header Toolbar */}
                <div className="flex items-center justify-between pb-1 border-b border-amber-100 text-xs">
                  <span className="font-black text-[#B56A00] tracking-wider uppercase">
                    ॥ श्लोक {verse.number} / {currentVerses.length} ॥
                  </span>

                  <div className="flex items-center gap-2">
                    {/* Speak Verse */}
                    <button
                      type="button"
                      onClick={() => handleSpeakVerse(verse.id, `${verse.sanskrit}। अर्थ: ${verse.hindi}`)}
                      className={`p-1.5 rounded-lg transition cursor-pointer ${
                        isSpeaking && currentSpeakingId === verse.id
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-amber-50 text-[#8C6239] hover:bg-amber-100'
                      }`}
                      title="यह श्लोक सुनें"
                    >
                      {isSpeaking && currentSpeakingId === verse.id ? (
                        <VolumeX className="w-3.5 h-3.5" />
                      ) : (
                        <Volume2 className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {/* Copy Verse */}
                    <button
                      type="button"
                      onClick={() => handleCopy(verse.id, verse.sanskrit, verse.hindi)}
                      className="p-1.5 rounded-lg bg-amber-50 text-[#8C6239] hover:bg-amber-100 transition cursor-pointer"
                      title="प्रतिलिपि बनाएँ"
                    >
                      {copiedId === verse.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {/* Share Verse */}
                    <button
                      type="button"
                      onClick={() => handleShareVerse(verse.number, verse.sanskrit, verse.hindi)}
                      className="p-1.5 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition cursor-pointer"
                      title="व्हाट्सएप साझा करें"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Bookmark Verse */}
                    <button
                      type="button"
                      onClick={() => toggleBookmark(verse.id)}
                      className={`p-1.5 rounded-lg transition cursor-pointer ${
                        bookmarks[verse.id]
                          ? 'bg-amber-500 text-stone-950 font-black'
                          : 'bg-amber-50 text-[#8C6239] hover:bg-amber-100'
                      }`}
                      title="बुकमार्क करें"
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Sanskrit Verse Devanagari */}
                <p
                  className={`font-granth font-black text-[#462B17] leading-relaxed whitespace-pre-line ${
                    fontSize === 'sm' ? 'text-xs' : fontSize === 'lg' ? 'text-base sm:text-lg' : 'text-sm sm:text-base'
                  }`}
                >
                  {verse.sanskrit}
                </p>

                {/* Hindi Meaning / Bhavarth */}
                <div className="p-2.5 rounded-xl bg-[#FFF9EE] border border-amber-200 text-xs text-[#3E2714]">
                  <div className="text-[10px] font-bold text-[#8C6239] uppercase tracking-wider mb-0.5">
                    हिंदी भावार्थ:
                  </div>
                  <p className="leading-relaxed text-[11px] sm:text-xs font-medium">
                    {verse.hindi}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-xs text-[#8C6239]">
            कोई श्लोक प्राप्त नहीं हुआ। कृपया खोज शब्द बदलें।
          </div>
        )}

        {/* Detailed Chapter Commentary Narrative */}
        {activeTab === 'chapters' && localizedChapter.details && localizedChapter.details.length > 0 && (
          <div className="bg-[#FFFDF9] border border-amber-200 rounded-2xl p-3.5 space-y-2">
            <h4 className="text-xs font-bold text-[#5C3A21] flex items-center gap-1">
              <span>📖</span>
              <span>अध्याय विस्तृत व्याख्या एवं पौराणिक प्रसंग</span>
            </h4>
            {localizedChapter.details.map((desc, dIdx) => (
              <p key={dIdx} className="text-xs text-[#3E2714] leading-relaxed">
                {desc}
              </p>
            ))}
          </div>
        )}

        {/* Paged Mode Pagination Controls */}
        {viewMode === 'paged' && totalPages > 1 && (
          <div className="flex items-center justify-between p-2 bg-[#FFFDF9] border border-amber-200 rounded-2xl shadow-xs">
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => setCurrentPage(safePage - 1)}
              className="px-3 py-1.5 rounded-xl bg-amber-100 text-[#5C3A21] font-bold text-xs flex items-center gap-1 disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>पिछला पृष्ठ</span>
            </button>

            <span className="text-xs font-bold text-[#8C6239]">
              पृष्ठ {safePage} / {totalPages}
            </span>

            <button
              type="button"
              disabled={safePage >= totalPages}
              onClick={() => setCurrentPage(safePage + 1)}
              className="px-3 py-1.5 rounded-xl bg-[#5C3A21] text-[#FFF6E5] font-bold text-xs flex items-center gap-1 disabled:opacity-40 cursor-pointer"
            >
              <span>अगला पृष्ठ</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Bottom Section Chapter Navigation Footer */}
        <div className="flex items-center justify-between pt-3 pb-8 border-t border-amber-200/60">
          <button
            type="button"
            onClick={() => {
              if (activeTab === 'chapters') {
                if (selectedChapterIndex > 0) {
                  setSelectedChapterIndex(selectedChapterIndex - 1);
                  setCurrentPage(1);
                } else if (onPrevChapter) {
                  onPrevChapter();
                }
              } else {
                if (selectedAngaIndex > 0) {
                  setSelectedAngaIndex(selectedAngaIndex - 1);
                  setCurrentPage(1);
                }
              }
            }}
            className="px-3 py-1.5 rounded-xl bg-[#FFFDF9] border border-[#E2D2BE] text-xs font-bold text-[#5C3A21] flex items-center gap-1 hover:bg-[#FFEEC9] cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>पिछला पाठ/अध्याय</span>
          </button>

          <button
            type="button"
            onClick={() => setIsTocOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-amber-100 text-[#8C4A00] text-xs font-black border border-amber-300 hover:bg-amber-200 cursor-pointer"
          >
            अनुक्रम सूचकांक
          </button>

          <button
            type="button"
            onClick={() => {
              if (activeTab === 'chapters') {
                if (selectedChapterIndex < DURGA_CHAPTERS.length - 1) {
                  setSelectedChapterIndex(selectedChapterIndex + 1);
                  setCurrentPage(1);
                } else if (onNextChapter) {
                  onNextChapter();
                }
              } else {
                if (selectedAngaIndex < DURGA_ANGAS.length - 1) {
                  setSelectedAngaIndex(selectedAngaIndex + 1);
                  setCurrentPage(1);
                }
              }
            }}
            className="px-3 py-1.5 rounded-xl bg-[#5C3A21] text-[#FFF6E5] text-xs font-bold flex items-center gap-1 hover:bg-[#462B17] cursor-pointer"
          >
            <span>अगला पाठ/अध्याय</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DurgaSaptashatiView;
