import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Search,
  ZoomIn,
  ZoomOut,
  BookOpen,
  Volume2,
  VolumeX,
  Share2,
  Copy,
  Check,
  Bookmark,
  X,
  ChevronLeft,
  ChevronRight,
  ListFilter,
  Layers,
  Sparkles,
} from "lucide-react";
import { speakUma, stopUmaSpeech } from "../lib/umaSpeech";
import { openWhatsAppShare } from "../services/umaConsultationPdf";

export type PathVerse = { n: number; kind?: string; text: string; meaning?: string };

export function ScripturePathView({ title, verses }: { title: string; verses: PathVerse[] }) {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [fontSizeIndex, setFontSizeIndex] = useState<number>(1); // 0: sm, 1: base, 2: lg, 3: xl
  const [selectedDohaJump, setSelectedDohaJump] = useState<string>("");
  const [viewMode, setViewMode] = useState<"continuous" | "paged">("continuous");
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [bookmarks, setBookmarks] = useState<Record<number, boolean>>(() => {
    try {
      const stored = localStorage.getItem(`scripture_bookmarks_${title}`);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [activeSpeakingIndex, setActiveSpeakingIndex] = useState<number | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const verseRefs = useRef<Record<number, HTMLElement | null>>({});

  const fontClasses = ["text-sm leading-relaxed", "text-base leading-relaxed", "text-lg leading-loose", "text-xl leading-loose"];
  const fontLabels = ["छोटा", "सामान्य", "बड़ा", "अति बड़ा"];

  // Extract dohas for quick jump dropdown
  const dohaMilestones = useMemo(() => {
    return verses
      .filter((v) => v.kind?.includes("दोहा") || v.kind?.includes("सोरठा") || v.kind?.includes("श्लोक"))
      .map((v) => {
        const match = v.text.match(/॥(\d+)॥/);
        const num = match ? match[1] : `${v.n}`;
        return { index: v.n, label: `${v.kind || "पद"} ${num}` };
      });
  }, [verses]);

  // Filtered verses according to search query or doha jump
  const filteredVerses = useMemo(() => {
    let list = verses;
    if (selectedDohaJump) {
      const startIndex = parseInt(selectedDohaJump, 10);
      list = list.slice(Math.max(0, startIndex - 1));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((v) => v.text.toLowerCase().includes(q) || (v.kind && v.kind.toLowerCase().includes(q)));
    }
    return list;
  }, [verses, searchQuery, selectedDohaJump]);

  // Reset pagination on filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedDohaJump, viewMode, pageSize]);

  // Paged slice calculation
  const totalPages = Math.max(1, Math.ceil(filteredVerses.length / pageSize));
  const currentPagedVerses = useMemo(() => {
    if (viewMode === "continuous") return filteredVerses;
    const start = (currentPage - 1) * pageSize;
    return filteredVerses.slice(start, start + pageSize);
  }, [filteredVerses, viewMode, currentPage, pageSize]);

  const toggleBookmark = (verseN: number) => {
    setBookmarks((prev) => {
      const updated = { ...prev, [verseN]: !prev[verseN] };
      try {
        localStorage.setItem(`scripture_bookmarks_${title}`, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const handleCopy = (verse: PathVerse) => {
    const shareText = `॥ ${title} ॥\n${verse.kind || "पद"} #${verse.n}\n\n${verse.text}\n\n— शक्ति पंचांग`;
    navigator.clipboard.writeText(shareText);
    setCopiedIndex(verse.n);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleShare = (verse: PathVerse) => {
    const shareText = `*॥ ${title} ॥*\n\n*${verse.kind || "पद"} #${verse.n}*\n${verse.text}\n\n📲 *शक्ति पंचांग* से पठन करें।`;
    openWhatsAppShare(shareText);
  };

  const stopAllSpeech = () => {
    stopUmaSpeech();
    setIsSpeaking(false);
    setActiveSpeakingIndex(null);
  };

  const speakVerseFromIndex = (vIndex: number) => {
    if (vIndex < 0 || vIndex >= filteredVerses.length) {
      stopAllSpeech();
      return;
    }
    const currentVerse = filteredVerses[vIndex];
    if (!currentVerse) {
      stopAllSpeech();
      return;
    }

    stopUmaSpeech();
    setIsSpeaking(true);
    setActiveSpeakingIndex(currentVerse.n);

    // Scroll active verse into view smoothly
    const targetEl = verseRefs.current[currentVerse.n];
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    const speechText = `${currentVerse.text}`;
    void speakUma(speechText, {
      onEnd: () => {
        // Auto-advance to next verse
        if (vIndex + 1 < filteredVerses.length) {
          speakVerseFromIndex(vIndex + 1);
        } else {
          stopAllSpeech();
        }
      },
      onError: () => {
        stopAllSpeech();
      },
    });
  };

  const handleToggleMasterPlay = () => {
    if (isSpeaking) {
      stopAllSpeech();
    } else {
      const startIdx = activeSpeakingIndex !== null
        ? Math.max(0, filteredVerses.findIndex((v) => v.n === activeSpeakingIndex))
        : 0;
      speakVerseFromIndex(startIdx);
    }
  };

  const handleJumpToVerse = (vIndex: number) => {
    setSelectedDohaJump(`${vIndex}`);
    if (viewMode === "paged") {
      const versePos = filteredVerses.findIndex((v) => v.n === vIndex);
      if (versePos !== -1) {
        const pageNum = Math.floor(versePos / pageSize) + 1;
        setCurrentPage(pageNum);
      }
    }
    setTimeout(() => {
      const targetEl = verseRefs.current[vIndex];
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 150);
  };

  return (
    <div className="w-full h-full min-h-0 flex flex-col overflow-hidden bg-[#FAF6EE]">
      {/* Top Header & Search Controls */}
      <div className="shrink-0 p-2 sm:p-3 bg-white border-b border-amber-200 shadow-xs flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xl shrink-0">📖</span>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-black text-[#5C3A21] font-granth truncate">
                {title}
              </h1>
              <p className="text-[10px] text-amber-800 font-medium truncate">
                कुल {verses.length} श्लोक/चौपाई • प्रामाणिक पाठ
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {/* Master Speech Button */}
            <button
              type="button"
              onClick={handleToggleMasterPlay}
              className={`px-2.5 py-1 rounded-lg border text-xs font-bold flex items-center gap-1 cursor-pointer transition ${
                isSpeaking
                  ? "bg-amber-600 text-amber-50 border-amber-700 shadow-xs animate-pulse"
                  : "bg-amber-100/80 text-amber-900 border-amber-300 hover:bg-amber-200"
              }`}
              title="सस्वर पाठ चालू / बंद करें"
            >
              {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              <span>{isSpeaking ? "पाठ रोकें" : "सस्वर गान"}</span>
            </button>

            {/* View Mode Switcher */}
            <button
              type="button"
              onClick={() => setViewMode(viewMode === "continuous" ? "paged" : "continuous")}
              className="px-2 py-1 rounded-lg bg-amber-50 border border-amber-300 text-[#5C3A21] hover:bg-amber-100 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
              title="पठन मोड बदलें"
            >
              <Layers className="w-3.5 h-3.5 text-amber-700" />
              <span className="hidden xs:inline">{viewMode === "continuous" ? "निरंतर" : "पृष्ठ वार"}</span>
            </button>

            {/* Font Size Adjuster */}
            <button
              type="button"
              onClick={() => setFontSizeIndex((prev) => (prev + 1) % fontClasses.length)}
              className="px-2 py-1 rounded-lg bg-amber-50 border border-amber-300 text-[#5C3A21] hover:bg-amber-100 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
              title="अक्षर आकार"
            >
              <ZoomIn className="w-3.5 h-3.5 text-amber-700" />
              <span>{fontLabels[fontSizeIndex]}</span>
            </button>
          </div>
        </div>

        {/* Search & Quick Jump Dropdown */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-amber-700 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="चौपाई या शब्द खोजें (उदा: हनुमान, सीता, अशोक, सिंधु)..."
              className="w-full pl-8 pr-7 py-1 text-xs rounded-lg border border-amber-300 bg-amber-50/50 text-[#3E2714] focus:outline-none focus:ring-1 focus:ring-amber-500 font-sans"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {dohaMilestones.length > 0 && (
            <select
              value={selectedDohaJump}
              onChange={(e) => handleJumpToVerse(parseInt(e.target.value, 10))}
              className="text-xs py-1 px-2 rounded-lg border border-amber-300 bg-white text-[#5C3A21] font-bold focus:outline-none cursor-pointer max-w-[130px]"
            >
              <option value="">जाएं (दोहा)...</option>
              {dohaMilestones.map((m) => (
                <option key={m.index} value={m.index}>
                  {m.label}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Active Filter Stats */}
        {(searchQuery || selectedDohaJump) && (
          <div className="flex items-center justify-between text-[11px] text-[#8C6239] pt-0.5 border-t border-amber-100">
            <span>
              परिणाम: <strong>{filteredVerses.length}</strong> / {verses.length}
            </span>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSelectedDohaJump("");
              }}
              className="text-amber-800 underline font-bold"
            >
              सभी देखें
            </button>
          </div>
        )}
      </div>

      {/* Main Verse Reader Display */}
      <div
        ref={containerRef}
        className="flex-1 min-h-0 w-full overflow-y-auto overscroll-contain px-2.5 py-3 space-y-3"
      >
        {currentPagedVerses.length === 0 ? (
          <div className="p-8 text-center text-[#8C6239] my-auto">
            <p className="text-sm font-bold">कोई चौपाई या दोहा नहीं मिला।</p>
            <p className="text-xs mt-1 text-stone-500">कृपया अन्य खोज शब्द या दोहा चुनें।</p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSelectedDohaJump("");
              }}
              className="mt-3 px-3 py-1.5 rounded-xl bg-amber-800 text-amber-50 text-xs font-bold"
            >
              संपूर्ण पाठ देखें
            </button>
          </div>
        ) : (
          currentPagedVerses.map((verse) => {
            const isBookmarked = !!bookmarks[verse.n];
            const isAudioActive = activeSpeakingIndex === verse.n && isSpeaking;

            return (
              <article
                key={`${verse.kind || "v"}-${verse.n}`}
                ref={(el) => {
                  verseRefs.current[verse.n] = el;
                }}
                className={`p-3.5 sm:p-4 rounded-2xl transition border shadow-xs space-y-2 ${
                  isAudioActive
                    ? "bg-amber-100/90 border-amber-500 ring-2 ring-amber-400/50"
                    : "bg-white border-amber-200/90 hover:border-amber-400"
                }`}
              >
                {/* Verse Header */}
                <div className="flex items-center justify-between text-[11px] font-bold text-amber-900 border-b border-amber-100/80 pb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-950 font-mono">
                      {verse.kind || "पद"} #{verse.n}
                    </span>
                    {verse.kind?.includes("दोहा") && (
                      <span className="px-1.5 py-0.5 rounded bg-amber-200 text-amber-900 text-[10px]">
                        ✦ मुख्य दोहा
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Bookmark */}
                    <button
                      type="button"
                      onClick={() => toggleBookmark(verse.n)}
                      className={`p-1 rounded-md transition ${
                        isBookmarked ? "text-amber-600 fill-amber-500" : "hover:bg-amber-100 text-stone-400"
                      }`}
                      title="बुकमार्क"
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? "fill-amber-600 text-amber-600" : ""}`} />
                    </button>

                    {/* Copy */}
                    <button
                      type="button"
                      onClick={() => handleCopy(verse)}
                      className="p-1 rounded-md hover:bg-amber-100 text-amber-800 transition"
                      title="कॉपी करें"
                    >
                      {copiedIndex === verse.n ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>

                    {/* Share */}
                    <button
                      type="button"
                      onClick={() => handleShare(verse)}
                      className="p-1 rounded-md hover:bg-amber-100 text-amber-800 transition"
                      title="शेयर करें"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Verse Text Body */}
                <p className={`font-granth text-[#3E2714] whitespace-pre-wrap ${fontClasses[fontSizeIndex]}`}>
                  {verse.text}
                </p>

                {/* Optional Meaning */}
                {verse.meaning && (
                  <div className="pt-1.5 text-xs text-stone-700 bg-amber-50/70 p-2 rounded-xl border border-amber-200/60 font-sans leading-relaxed">
                    <span className="font-bold text-amber-900">भावार्थ: </span>
                    {verse.meaning}
                  </div>
                )}
              </article>
            );
          })
        )}
      </div>

      {/* Paged Mode Pagination Bar */}
      {viewMode === "paged" && totalPages > 1 && (
        <div className="shrink-0 p-2 bg-white border-t border-amber-200 flex items-center justify-between text-xs font-bold text-[#5C3A21]">
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-300 disabled:opacity-40 flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>पिछला</span>
          </button>

          <span>
            पृष्ठ {currentPage} / {totalPages} ({filteredVerses.length} कुल)
          </span>

          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-300 disabled:opacity-40 flex items-center gap-1"
          >
            <span>अगला</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Floating Sticky Audio Player Bar when speaking */}
      {isSpeaking && activeSpeakingIndex !== null && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-md bg-stone-900/95 backdrop-blur-md text-amber-100 p-2.5 rounded-2xl shadow-2xl border border-amber-500/50 flex items-center justify-between gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span className="p-2 rounded-xl bg-amber-500 text-stone-950 shrink-0 font-bold animate-pulse">
              <Volume2 className="w-4 h-4" />
            </span>
            <div className="min-w-0">
              <div className="text-[10px] text-amber-400 font-bold uppercase tracking-wider truncate">
                सस्वर पाठ चालू है
              </div>
              <div className="text-xs font-black text-amber-100 font-granth truncate">
                {title} — पद #{activeSpeakingIndex}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                const curPos = filteredVerses.findIndex((v) => v.n === activeSpeakingIndex);
                if (curPos > 0) speakVerseFromIndex(curPos - 1);
              }}
              className="p-1.5 rounded-lg bg-stone-800 text-amber-200 hover:bg-stone-700 active:scale-95 transition"
              title="पिछला पद"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={stopAllSpeech}
              className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 text-white font-black text-xs shadow-md flex items-center gap-1 border border-red-400/50 cursor-pointer"
              title="पाठ रोकें (Stop Audio)"
            >
              <X className="w-4 h-4" />
              <span>स्टॉप (STOP)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const curPos = filteredVerses.findIndex((v) => v.n === activeSpeakingIndex);
                if (curPos < filteredVerses.length - 1) speakVerseFromIndex(curPos + 1);
              }}
              className="p-1.5 rounded-lg bg-stone-800 text-amber-200 hover:bg-stone-700 active:scale-95 transition"
              title="अगला पद"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ScripturePathView;
