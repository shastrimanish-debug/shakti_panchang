import React, { useState, useMemo, useContext } from 'react';
import { createPortal } from 'react-dom';
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
import { ZeroScrollPager } from './ZeroScrollPager';
import { DrawerHostContext } from './BoardShell';

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
  const { host, close } = useContext(DrawerHostContext);

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
    const sectionTitle = activeTab === "angas" ? localizedAnga.name : ui.chapter(activeChapter.id);
    const text = `॥ ${sectionTitle} — ${verseWord} ${number} ॥\n\n${sanskrit}\n\n${ui.meaning}\n${hindi}\n\n(${ui.shareTitle})`;
    openWhatsAppShare(text);
  };

  // Bookmark Toggle
  const toggleBookmark = (id: string) => {
    setBookmarks((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const verseWord = language === "en" ? "Verse" : language === "gu" ? "શ્લોક" : language === "mr" ? "श्लोक" : "श्लोक";
  const goSection = (dir: -1 | 1) => {
    if (activeTab === "chapters") {
      const next = selectedChapterIndex + dir;
      if (next >= 0 && next < DURGA_CHAPTERS.length) {
        setSelectedChapterIndex(next);
        setCurrentPage(1);
      }
    } else {
      const next = selectedAngaIndex + dir;
      if (next >= 0 && next < DURGA_ANGAS.length) {
        setSelectedAngaIndex(next);
        setCurrentPage(1);
      }
    }
  };

  const toolbars = (
    <div className="bx-drawer-tools">
      <div className="flex items-center gap-1.5">
        <button type="button" className="bx-iconbtn" onClick={() => { setIsTocOpen(true); close(); }} aria-label={ui.summaryHead}>
          <Menu className="w-4 h-4" />
        </button>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold truncate">
            {activeTab === "angas" ? localizedAnga.name : ui.chapter(activeChapter.id)}
          </div>
          <div className="bx-kicker truncate">
            {activeTab === "angas" ? localizedAnga.desc : localizedChapter.heading}
          </div>
        </div>
        <button type="button" className="bx-iconbtn" onClick={() => goSection(-1)} aria-label={ui.prevChapter}>
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button type="button" className="bx-iconbtn" onClick={() => goSection(1)} aria-label={ui.nextChapter}>
          <ChevronRight className="w-4 h-4" />
        </button>
        <button type="button" className="bx-iconbtn" onClick={handleSpeakAllSection} aria-pressed={isSpeaking && currentSpeakingId === "section_full"} aria-label={ui.listen}>
          {isSpeaking && currentSpeakingId === "section_full" ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
        <button
          type="button"
          className="bx-navbtn"
          onClick={() => setFontSize(fontSize === "sm" ? "base" : fontSize === "base" ? "lg" : "sm")}
          aria-label={fontSize === "lg" ? ui.zoomOut : ui.zoomIn}
        >
          {fontSize === "sm" ? "A−" : fontSize === "lg" ? "A+" : "A"}
        </button>
      </div>
      <div className="flex items-center gap-1.5 mt-2">
        <button
          type="button"
          onClick={() => { setActiveTab("chapters"); setCurrentPage(1); }}
          className={`${activeTab === "chapters" ? "bx-navbtn bx-navbtn-solid" : "bx-navbtn"} min-w-0`}
        >
          <span className="truncate">{ui.tabChapters}</span>
        </button>
        <button
          type="button"
          onClick={() => { setActiveTab("angas"); setCurrentPage(1); }}
          className={`${activeTab === "angas" ? "bx-navbtn bx-navbtn-solid" : "bx-navbtn"} min-w-0`}
        >
          <span className="truncate">{ui.tabAngas}</span>
        </button>
      </div>
      <div className="relative mt-2">
        <Search className="w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2" style={{ color: "var(--bx-mute)" }} />
        <input
          type="text"
          placeholder={language === "en" ? "Search a verse" : language === "gu" ? "શ્લોક શોધો" : "श्लोक खोजें"}
          value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
          className="w-full pl-7 pr-2"
          style={{ height: 34, borderRadius: 10, border: "1px solid var(--bx-line)", background: "var(--bx-bg)", color: "var(--bx-ink)", fontSize: 12 }}
        />
      </div>
    </div>
  );

  return (
    <div className="w-full h-full min-h-0 flex flex-col overflow-hidden relative">
      <div className="shrink-0 px-3 pt-1 text-[13px] font-semibold truncate">
        {activeTab === "angas" ? localizedAnga.name : `${ui.chapter(activeChapter.id)} · ${localizedChapter.heading}`}
      </div>
      {host ? createPortal(toolbars, host) : null}

      {/* Slide-out Interactive TOC / Index Drawer Overlay */}
      {isTocOpen && (
        <div className="absolute inset-0 z-30 bg-black/60 backdrop-blur-xs flex justify-start animate-in fade-in duration-200">
          <ZeroScrollPager className="w-4/5 max-w-xs h-full bg-[#FAF2E4] border-r-2 border-amber-600 shadow-2xl flex flex-col overflow-hidden min-h-0" contentClassName="p-3 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#E2D2BE]">
              <div className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-[#8C4A00]" />
                <h3 className="font-granth font-black text-sm text-[#462B17]">
                  {ui.summaryHead}
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
                {ui.tabAngas}
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
                    <span className="text-[9px] opacity-75">{anga.verses.length} {verseWord}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* TOC Category 2: 13 Chapters */}
            <div className="space-y-1 pt-2 border-t border-[#E2D2BE]">
              <div className="text-[10px] font-black text-[#8C6239] uppercase tracking-wider">
                {ui.tabChapters}
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
                      <span className="text-[#B56A00] font-black mr-1">{ui.chapter(ch.id)}</span>
                      <span>{ch.title}</span>
                    </div>
                    <span className="text-[9px] opacity-75 shrink-0">{ch.shlokaCount} {verseWord}</span>
                  </button>
                ))}
              </div>
            </div>
          </ZeroScrollPager>
        </div>
      )}

      <ZeroScrollPager className="flex-1 min-h-0" contentClassName="px-2 pt-1 pb-0.5 flex flex-col gap-1.5" resetKey={`${activeTab}-${selectedChapterIndex}-${selectedAngaIndex}-${searchQuery}-${fontSize}`}>
        {paginatedVerses.length > 0 ? (
          paginatedVerses.map((verse) => (
            <article key={verse.id} className="bx-verse">
              <div className="flex items-center justify-between gap-2">
                <span className="bx-kicker">{verseWord} {verse.number} / {currentVerses.length}</span>
                <div className="flex items-center gap-1">
                  <button type="button" className="bx-iconbtn" aria-pressed={isSpeaking && currentSpeakingId === verse.id} aria-label={ui.listen} onClick={() => handleSpeakVerse(verse.id, `${verse.sanskrit}। ${ui.meaning} ${verse.hindi}`)}>
                    {isSpeaking && currentSpeakingId === verse.id ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                  </button>
                  <button type="button" className="bx-iconbtn" aria-label={ui.copy} onClick={() => handleCopy(verse.id, verse.sanskrit, verse.hindi)}>
                    {copiedId === verse.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <button type="button" className="bx-iconbtn" aria-label={ui.shareTitle} onClick={() => handleShareVerse(verse.number, verse.sanskrit, verse.hindi)}>
                    <Share2 className="w-3.5 h-3.5" />
                  </button>
                  <button type="button" className="bx-iconbtn" aria-pressed={!!bookmarks[verse.id]} aria-label={ui.copy} onClick={() => toggleBookmark(verse.id)}>
                    <Bookmark className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <p className={`bx-sans font-granth ${fontSize === "sm" ? "text-[13px]" : fontSize === "lg" ? "text-base" : "text-[15px]"}`}>{verse.sanskrit}</p>
              <p className="bx-mean"><b style={{ color: "var(--bx-ink)" }}>{ui.meaning}</b> {verse.hindi}</p>
            </article>
          ))
        ) : (
          <div className="bx-fact text-sm">{language === "en" ? "No verse matches that search." : "कोई श्लोक नहीं मिला।"}</div>
        )}
        {activeTab === "chapters" && localizedChapter.details && localizedChapter.details.length > 0 && (
          <div className="bx-verse">
            <div className="bx-kicker">{ui.points}</div>
            {localizedChapter.details.map((desc, dIdx) => (
              <p key={dIdx} className="bx-mean" style={{ color: "var(--bx-ink)" }}>{desc}</p>
            ))}
          </div>
        )}
      </ZeroScrollPager>
    </div>
  );
};

export default DurgaSaptashatiView;
