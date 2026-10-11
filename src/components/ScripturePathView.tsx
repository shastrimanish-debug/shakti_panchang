import React, { useState, useMemo } from "react";
import { ZeroScrollPager } from "./ZeroScrollPager";
import { Search, ZoomIn, ZoomOut, BookOpen, Sparkles, Filter, X } from "lucide-react";

export type PathVerse = { n: number; kind?: string; text: string };

export function ScripturePathView({ title, verses }: { title: string; verses: PathVerse[] }) {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [fontSizeClass, setFontSizeClass] = useState<"text-sm" | "text-base" | "text-lg" | "text-xl">("text-base");
  const [selectedDohaJump, setSelectedDohaJump] = useState<string>("");

  // Extract dohas for quick navigation
  const dohaMilestones = useMemo(() => {
    return verses
      .filter((v) => v.kind?.includes("दोहा") || v.kind?.includes("सोरठा"))
      .map((v) => {
        const match = v.text.match(/॥(\d+)॥/);
        const num = match ? match[1] : `${v.n}`;
        return { index: v.n, label: `दोहा ${num}` };
      });
  }, [verses]);

  // Filtered verses according to search query or doha jump
  const filteredVerses = useMemo(() => {
    let list = verses;
    if (selectedDohaJump) {
      const startIndex = parseInt(selectedDohaJump, 10);
      list = list.slice(startIndex - 1);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((v) => v.text.toLowerCase().includes(q));
    }
    return list;
  }, [verses, searchQuery, selectedDohaJump]);

  const toggleFontSize = () => {
    if (fontSizeClass === "text-sm") setFontSizeClass("text-base");
    else if (fontSizeClass === "text-base") setFontSizeClass("text-lg");
    else if (fontSizeClass === "text-lg") setFontSizeClass("text-xl");
    else setFontSizeClass("text-sm");
  };

  return (
    <div className="w-full h-full min-h-0 flex flex-col overflow-hidden bg-[#FAF6EE]">
      {/* Top Controls Header */}
      <div className="shrink-0 p-2 sm:p-3 bg-white border-b border-amber-200/80 shadow-xs flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xl shrink-0">📖</span>
            <h1 className="text-sm sm:text-base font-black text-[#5C3A21] font-granth truncate">
              {title}
            </h1>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={toggleFontSize}
              className="p-1.5 rounded-lg bg-amber-50 border border-amber-200 text-[#5C3A21] hover:bg-amber-100 text-xs font-bold flex items-center gap-1 cursor-pointer"
              title="अक्षर का आकार बदलें"
            >
              <ZoomIn className="w-3.5 h-3.5" />
              <span>अक्षर</span>
            </button>
          </div>
        </div>

        {/* Search & Quick Jump Bar */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-amber-700 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="चौपाई या शब्द खोजें (उदा: हनुमान, अशोक, सीता)..."
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
              onChange={(e) => setSelectedDohaJump(e.target.value)}
              className="text-xs py-1 px-2 rounded-lg border border-amber-300 bg-white text-[#5C3A21] font-bold focus:outline-none cursor-pointer max-w-[120px]"
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

        {(searchQuery || selectedDohaJump) && (
          <div className="flex items-center justify-between text-[11px] text-[#8C6239] pt-0.5 border-t border-amber-100">
            <span>
              कुल परिणाम: <strong>{filteredVerses.length}</strong> / {verses.length}
            </span>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSelectedDohaJump("");
              }}
              className="text-amber-800 underline font-semibold"
            >
              सभी देखें
            </button>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <ZeroScrollPager
        className="flex-1 min-h-0"
        contentClassName="px-2 pt-2 pb-1 flex flex-col gap-2"
        resetKey={`${title}-${filteredVerses.length}-${selectedDohaJump}-${fontSizeClass}`}
      >
        {filteredVerses.length === 0 ? (
          <div className="p-8 text-center text-[#8C6239]">
            <p className="text-sm font-semibold">कोई चौपाई या दोहा नहीं मिला।</p>
            <p className="text-xs mt-1 text-stone-500">कृपया भिन्न खोज शब्द दर्ज करें।</p>
          </div>
        ) : (
          filteredVerses.map((verse) => (
            <article
              key={`${verse.kind || "v"}-${verse.n}`}
              className="p-3 sm:p-4 rounded-xl bg-white border border-amber-200/90 shadow-2xs space-y-1.5 hover:border-amber-400 transition"
            >
              <div className="flex items-center justify-between text-[11px] font-bold text-amber-800">
                <span className="px-2 py-0.5 rounded-md bg-amber-100/80 text-amber-900 font-mono">
                  {verse.kind || "पद"} #{verse.n}
                </span>
                <span className="text-amber-700/80 text-[10px]">
                  {verse.n} / {verses.length}
                </span>
              </div>
              <p className={`bx-sans font-granth leading-relaxed text-[#3E2714] whitespace-pre-wrap ${fontSizeClass}`}>
                {verse.text}
              </p>
            </article>
          ))
        )}
      </ZeroScrollPager>
    </div>
  );
}

export default ScripturePathView;

