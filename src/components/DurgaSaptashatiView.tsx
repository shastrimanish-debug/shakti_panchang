import React, { useState, useMemo, useContext } from 'react';
import { createPortal } from 'react-dom';
import { DURGA_CHAPTERS, DURGA_ANGAS } from '../data/durgaSaptashatiData';
import { localizeAnga, localizeChapter, saptUi } from '../data/saptashatiLocale';
import { getDurgaVerseTranslation } from '../data/durgaChapterTranslations';
import durgaPathRaw from '../data/durgaPath.json';
import {
  Share2,
  Volume2,
  VolumeX,
  ChevronLeft,
  ChevronRight,
  Search,
  Copy,
  Check,
  Bookmark,
  Menu,
  X,
  Music2,
  Sparkles,
} from 'lucide-react';
import { openWhatsAppShare } from '../services/umaConsultationPdf';
import { useLanguage } from '../i18n';
import { speakUma, stopUmaSpeech } from '../lib/umaSpeech';
import { ZeroScrollPager } from './ZeroScrollPager';
import { DrawerHostContext, useTabMenu } from './BoardShell';

interface RawChapterShloka {
  n: number;
  text: string;
}

const durgaPath = durgaPathRaw as unknown as {
  chapters: Record<string, RawChapterShloka[]>;
};

// Complete linear Durga Saptashati sequence (Purva Angas -> 13 Chapters -> Uttar Angas)
type SectionItem =
  | { type: 'anga'; id: string; name: string; index: number }
  | { type: 'chapter'; id: number; name: string; index: number };

const FULL_SAPTASHATI_SEQUENCE: SectionItem[] = [
  { type: 'anga', id: 'kavach', name: '१. देवी कवचम्', index: 0 },
  { type: 'anga', id: 'argala', name: '२. अर्गला स्तोत्रम्', index: 1 },
  { type: 'anga', id: 'keelak', name: '३. कीलक स्तोत्रम्', index: 2 },
  ...DURGA_CHAPTERS.map((ch, idx) => ({
    type: 'chapter' as const,
    id: ch.id,
    name: `अध्याय ${ch.id}: ${ch.title}`,
    index: idx,
  })),
  { type: 'anga', id: 'kunjika', name: '१७. सिद्ध कुंजिका स्तोत्रम्', index: 3 },
  { type: 'anga', id: 'kshama', name: '१८. देवी क्षमा प्रार्थना', index: 4 },
  { type: 'anga', id: 'aarti', name: '१९. श्री दुर्गा आरती', index: 5 },
];

export const DurgaSaptashatiView: React.FC<{
  onBackToPanchang?: () => void;
  onOpenUmaModal?: (query?: string) => void;
  onPrevChapter?: () => void;
  onNextChapter?: () => void;
}> = ({ onBackToPanchang, onOpenUmaModal, onPrevChapter, onNextChapter }) => {
  const { language } = useLanguage();
  const ui = saptUi(language);
  const { host, close } = useContext(DrawerHostContext);

  // Global Sequence Index (0 to 18)
  const [seqIndex, setSeqIndex] = useState<number>(0);

  // Active section resolution from sequence
  const currentSeqItem = FULL_SAPTASHATI_SEQUENCE[seqIndex] || FULL_SAPTASHATI_SEQUENCE[0];
  const activeTab: 'angas' | 'chapters' = currentSeqItem.type === 'anga' ? 'angas' : 'chapters';
  const selectedAngaIndex = currentSeqItem.type === 'anga' ? currentSeqItem.index : 0;
  const selectedChapterIndex = currentSeqItem.type === 'chapter' ? currentSeqItem.index : 0;

  // Reader Settings States
  const [viewMode, setViewMode] = useState<'list' | 'paged'>('list');
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg'>('base');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [bookmarks, setBookmarks] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isTocOpen, setIsTocOpen] = useState<boolean>(false);
  useTabMenu(() => {
    if (isTocOpen) return false;
    setIsTocOpen(true);
    return true;
  });

  // Audio Speech States
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [currentSpeakingId, setCurrentSpeakingId] = useState<string | null>(null);

  // Current active data resolution
  const activeAnga = DURGA_ANGAS[selectedAngaIndex] || DURGA_ANGAS[0];
  const activeChapter = DURGA_CHAPTERS[selectedChapterIndex] || DURGA_CHAPTERS[0];

  const localizedAnga = localizeAnga(activeAnga, language);
  const localizedChapter = localizeChapter(activeChapter, language);

  // Complete Verses resolution with line-by-line Sanskrit + Hindi meaning for ALL 700 Shlokas & Angas!
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
        return rawShlokas.map((s) => {
          const verseMeaning = getDurgaVerseTranslation(
            activeChapter.id,
            s.n,
            s.text,
            localizedChapter.summary
          );

          return {
            id: `chap_${activeChapter.id}_${s.n}`,
            number: s.n,
            sanskrit: s.text,
            hindi: verseMeaning,
          };
        });
      }

      // Fallback
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

  const goSequenceStep = (dir: -1 | 1) => {
    const nextIdx = seqIndex + dir;
    if (nextIdx >= 0 && nextIdx < FULL_SAPTASHATI_SEQUENCE.length) {
      setSeqIndex(nextIdx);
      setCurrentPage(1);
    }
  };

  const toolbars = (
    <div className="bx-drawer-tools">
      <div className="flex items-center gap-1.5">
        <button type="button" className="bx-iconbtn" onClick={() => { setIsTocOpen(true); close(); }} aria-label={ui.summaryHead}>
          <Menu className="w-4 h-4" />
        </button>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold truncate flex items-center gap-1">
            <span>{currentSeqItem.name}</span>
          </div>
          <div className="bx-kicker truncate flex items-center gap-1 text-[11px]">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            {activeTab === "angas" ? localizedAnga.desc : localizedChapter.heading}
          </div>
        </div>
        <button type="button" className="bx-iconbtn" onClick={() => goSequenceStep(-1)} disabled={seqIndex === 0} aria-label={ui.prevChapter}>
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button type="button" className="bx-iconbtn" onClick={() => goSequenceStep(1)} disabled={seqIndex === FULL_SAPTASHATI_SEQUENCE.length - 1} aria-label={ui.nextChapter}>
          <ChevronRight className="w-4 h-4" />
        </button>
        <button type="button" className="bx-iconbtn" onClick={handleSpeakAllSection} aria-pressed={isSpeaking && currentSpeakingId === "section_full"} aria-label={ui.listen} title="सस्वर गान (Chant Melody)">
          {isSpeaking && currentSpeakingId === "section_full" ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-amber-600" />}
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

      {/* Sequence Progress Bar (1/19 to 19/19) */}
      <div className="flex items-center justify-between gap-1 mt-1.5 px-1 py-0.5 rounded-lg bg-amber-50/80 border border-amber-200/60 text-[11px] text-amber-900">
        <span className="font-semibold flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-600" />
          अनुक्रम पाठ {seqIndex + 1}/{FULL_SAPTASHATI_SEQUENCE.length}
        </span>
        <span className="truncate opacity-80 max-w-[170px] text-right">
          {currentSeqItem.name}
        </span>
      </div>

      <div className="relative mt-1.5">
        <Search className="w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2" style={{ color: "var(--bx-mute)" }} />
        <input
          type="text"
          placeholder={language === "en" ? "Search a verse" : language === "gu" ? "શ્લોક શોધો" : "श्लोक अथवा अनुवाद खोजें"}
          value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
          className="w-full pl-7 pr-2"
          style={{ height: 32, borderRadius: 10, border: "1px solid var(--bx-line)", background: "var(--bx-bg)", color: "var(--bx-ink)", fontSize: 12 }}
        />
      </div>
    </div>
  );

  return (
    <div className="w-full h-full min-h-0 flex flex-col overflow-hidden relative">
      <div className="shrink-0 px-3 pt-1 text-[13px] font-semibold truncate flex items-center justify-between">
        <span>{ui.shareTitle} · {currentSeqItem.name}</span>
        <span className="text-[10px] font-normal text-amber-700 bg-amber-100/70 px-1.5 py-0.5 rounded">
          {currentVerses.length} श्लोक • संपूर्ण पाठ
        </span>
      </div>
      {host ? createPortal(toolbars, host) : null}

      {/* Slide-out Interactive TOC / Index Drawer Overlay */}
      {isTocOpen && (
        <div className="absolute inset-0 z-50 bg-black/50 flex justify-start" onClick={() => setIsTocOpen(false)}>
          <div
            className="w-[88%] max-w-sm h-full flex flex-col border-r-2 shadow-2xl"
            style={{ background: "var(--bx-panel)", borderColor: "var(--bx-gold)", color: "var(--bx-ink)" }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="shrink-0 flex items-center justify-between gap-2 px-3 py-2 border-b" style={{ borderColor: "var(--bx-line)" }}>
              <div className="min-w-0">
                <div className="text-sm font-semibold truncate">श्री दुर्गा सप्तशती (चण्डी पाठ)</div>
                <div className="bx-kicker truncate">सम्पूर्ण १९ पाठ अनुक्रम विषय-सूची</div>
              </div>
              <button type="button" className="bx-iconbtn" onClick={() => setIsTocOpen(false)} aria-label={ui.stop}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto p-2 space-y-1.5">
              <div className="text-[11px] font-bold text-amber-800 uppercase tracking-wider px-1 pt-1">
                १. पूर्व अंग (कवच, अर्गला, कीलक)
              </div>
              {FULL_SAPTASHATI_SEQUENCE.slice(0, 3).map((item, idx) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setSeqIndex(idx);
                    setIsTocOpen(false);
                    setCurrentPage(1);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-between"
                  style={{
                    background: seqIndex === idx ? "var(--bx-mark)" : "var(--bx-bg)",
                    color: seqIndex === idx ? "var(--bx-cream)" : "var(--bx-ink)"
                  }}
                >
                  <span className="truncate">{item.name}</span>
                  <span className="text-[10px] opacity-75 shrink-0">अंग पाठ</span>
                </button>
              ))}

              <div className="text-[11px] font-bold text-amber-800 uppercase tracking-wider px-1 pt-2">
                २. सप्तशती १३ सम्पूर्ण अध्याय (७०० श्लोक)
              </div>
              {FULL_SAPTASHATI_SEQUENCE.slice(3, 16).map((item, idx) => {
                const sIdx = idx + 3;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setSeqIndex(sIdx);
                      setIsTocOpen(false);
                      setCurrentPage(1);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-between gap-2"
                    style={{
                      background: seqIndex === sIdx ? "var(--bx-mark)" : "var(--bx-bg)",
                      color: seqIndex === sIdx ? "var(--bx-cream)" : "var(--bx-ink)"
                    }}
                  >
                    <span className="truncate">{item.name}</span>
                    <span className="text-[10px] opacity-75 shrink-0">
                      {DURGA_CHAPTERS[idx]?.shlokaCount} श्लोक
                    </span>
                  </button>
                );
              })}

              <div className="text-[11px] font-bold text-amber-800 uppercase tracking-wider px-1 pt-2">
                ३. उत्तर अंग (कुंजिका, क्षमा, आरती)
              </div>
              {FULL_SAPTASHATI_SEQUENCE.slice(16).map((item, idx) => {
                const sIdx = idx + 16;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setSeqIndex(sIdx);
                      setIsTocOpen(false);
                      setCurrentPage(1);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-between"
                    style={{
                      background: seqIndex === sIdx ? "var(--bx-mark)" : "var(--bx-bg)",
                      color: seqIndex === sIdx ? "var(--bx-cream)" : "var(--bx-ink)"
                    }}
                  >
                    <span className="truncate">{item.name}</span>
                    <span className="text-[10px] opacity-75 shrink-0">उत्तर अंग</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <ZeroScrollPager className="flex-1 min-h-0" contentClassName="px-2 pt-1 pb-0.5 flex flex-col gap-1.5" resetKey={`${seqIndex}-${searchQuery}-${fontSize}`}>
        {paginatedVerses.length > 0 ? (
          paginatedVerses.map((verse) => (
            <article key={verse.id} className="bx-verse">
              <div className="flex items-center justify-between gap-2">
                <span className="bx-kicker flex items-center gap-1">
                  <Music2 className="w-3 h-3 text-amber-600 inline" />
                  {verseWord} {verse.number} / {currentVerses.length}
                </span>
                <div className="flex items-center gap-1">
                  <button type="button" className="bx-iconbtn" aria-pressed={isSpeaking && currentSpeakingId === verse.id} aria-label={ui.listen} title="सस्वर गान सुनें" onClick={() => handleSpeakVerse(verse.id, `${verse.sanskrit}। ${ui.meaning} ${verse.hindi}`)}>
                    {isSpeaking && currentSpeakingId === verse.id ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-amber-700" />}
                  </button>
                  <button type="button" className="bx-iconbtn" aria-label={ui.copy} onClick={() => handleCopy(verse.id, verse.sanskrit, verse.hindi)}>
                    {copiedId === verse.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <button type="button" className="bx-iconbtn" aria-label={ui.shareTitle} onClick={() => handleShareVerse(verse.number, verse.sanskrit, verse.hindi)}>
                    <Share2 className="w-3.5 h-3.5" />
                  </button>
                  <button type="button" className="bx-iconbtn" aria-pressed={!!bookmarks[verse.id]} aria-label="Bookmark" onClick={() => toggleBookmark(verse.id)}>
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

        {/* Bottom Navigation for Continuous Sequential Reading */}
        <div className="flex items-center justify-between gap-2 my-2 p-2 rounded-xl bg-amber-50/90 border border-amber-200">
          <button
            type="button"
            onClick={() => goSequenceStep(-1)}
            disabled={seqIndex === 0}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-amber-300 text-amber-900 disabled:opacity-40 flex items-center gap-1 shadow-xs"
          >
            <ChevronLeft className="w-4 h-4" />
            पिछला पाठ
          </button>

          <span className="text-[11px] font-medium text-amber-800">
            {seqIndex + 1} / {FULL_SAPTASHATI_SEQUENCE.length}
          </span>

          <button
            type="button"
            onClick={() => goSequenceStep(1)}
            disabled={seqIndex === FULL_SAPTASHATI_SEQUENCE.length - 1}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-600 text-white disabled:opacity-40 flex items-center gap-1 shadow-xs"
          >
            अगला पाठ
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

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
