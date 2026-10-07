import React, { useState } from 'react';
import { DURGA_CHAPTERS, DURGA_ANGAS } from '../data/durgaSaptashatiData';
import { localizeAnga, localizeChapter, saptUi } from '../data/saptashatiLocale';
import { Sparkles, Share2, Volume2, VolumeX, BookOpen, Scroll, ChevronLeft, ChevronRight, ShieldCheck } from 'lucide-react';
import { openWhatsAppShare } from '../services/umaConsultationPdf';
import { useLanguage } from '../i18n';
import { speakUma, stopUmaSpeech } from '../lib/umaSpeech';

export const DurgaSaptashatiView: React.FC<{
  onOpenUmaModal?: (query?: string) => void;
  onPrevChapter?: () => void;
  onNextChapter?: () => void;
}> = ({ onOpenUmaModal, onPrevChapter, onNextChapter }) => {
  const { language } = useLanguage();
  const ui = saptUi(language);
  const [activeTab, setActiveTab] = useState<'angas' | 'chapters'>('chapters');
  const [selectedAngaIndex, setSelectedAngaIndex] = useState<number>(0);
  const [selectedChapterIndex, setSelectedChapterIndex] = useState<number>(0);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg'>('base');

  const activeAnga = DURGA_ANGAS[selectedAngaIndex] || DURGA_ANGAS[0];
  const activeChapter = DURGA_CHAPTERS[selectedChapterIndex] || DURGA_CHAPTERS[0];

  const localizedAnga = localizeAnga(activeAnga, language);
  const localizedChapter = localizeChapter(activeChapter, language);

  const handleSpeakText = (text: string) => {
    if (isSpeaking) {
      stopUmaSpeech();
      setIsSpeaking(false);
      return;
    }
    setIsSpeaking(true);
    void speakUma(text, {
      rate: 0.88,
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };

  const handleShareAnga = () => {
    const text = `॥ ${localizedAnga.name} ॥\n\n${localizedAnga.desc}\n\nमाहात्म्य: ${localizedAnga.significance}\n\n(शक्ति पंचांग - श्री दुर्गा सप्तशती)`;
    openWhatsAppShare(text);
  };

  const handleShareChapter = () => {
    const text = `॥ श्री दुर्गा सप्तशती - अध्याय ${activeChapter.id} ॥\n${localizedChapter.heading}\n\n${localizedChapter.summary}\n\nपाठ फल: ${localizedChapter.phala}\n\n(शक्ति पंचांग)`;
    openWhatsAppShare(text);
  };

  return (
    <div className="w-full h-full min-h-0 flex flex-col bg-[#FAF2E4] text-[#2C180C] overflow-hidden select-none">
      {/* Header Bar */}
      <header className="shrink-0 bg-gradient-to-r from-[#462B17] via-[#5C3A21] to-[#3E2714] text-[#FAF2E4] px-3 py-2.5 shadow-md flex items-center justify-between border-b border-[#B56A00]/40">
        <div className="flex items-center gap-2">
          <span className="text-xl">🌺</span>
          <div>
            <h2 className="text-xs sm:text-sm font-black font-granth tracking-wide text-[#FFD88A] flex items-center gap-1.5">
              <span>{ui.title}</span>
              <span className="text-[10px] bg-amber-500/20 text-amber-200 px-1.5 py-0.5 rounded-full border border-amber-400/30">
                ७०० श्लोक • १३ अध्याय
              </span>
            </h2>
            <p className="text-[10px] text-[#E5D2B8] truncate">
              {ui.subtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Font size toggle */}
          <button
            type="button"
            onClick={() => setFontSize(fontSize === 'sm' ? 'base' : fontSize === 'base' ? 'lg' : 'sm')}
            className="px-2 py-1 rounded-lg bg-[#3E2714] border border-amber-500/30 text-[10px] text-amber-200 font-bold hover:bg-amber-900/40"
            title="फॉन्ट आकार बदलें"
          >
            {fontSize === 'sm' ? 'अ (छोटा)' : fontSize === 'base' ? 'अ (मध्यम)' : 'अ (बड़ा)'}
          </button>

          {/* Ask Uma FAB */}
          {onOpenUmaModal && (
            <button
              type="button"
              onClick={() => onOpenUmaModal('दुर्गा सप्तशती के इस अध्याय का गूढ़ रहस्य और पाठ विधि समझाइए।')}
              className="px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-stone-950 text-xs font-black flex items-center gap-1 shadow-sm hover:scale-105 active:scale-95 transition"
            >
              <Sparkles className="w-3 h-3 fill-stone-950" />
              <span>उमा</span>
            </button>
          )}
        </div>
      </header>

      {/* Primary Section Tabs: [१३ अध्याय (Chapters)] vs [अंग पाठ (Angas)] */}
      <div className="shrink-0 bg-[#FFFDF9] border-b border-[#E8DCCB] px-2 py-1.5 flex items-center justify-between gap-2 shadow-2xs">
        <div className="flex items-center gap-1 bg-[#F4E8D1] p-1 rounded-xl w-full max-w-sm mx-auto">
          <button
            type="button"
            onClick={() => setActiveTab('chapters')}
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
            onClick={() => setActiveTab('angas')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'angas'
                ? 'bg-[#5C3A21] text-[#FFF6E5] shadow-xs'
                : 'text-[#6B4E36] hover:text-[#2C180C]'
            }`}
          >
            <Scroll className="w-3.5 h-3.5" />
            <span>अंग पाठ (कवच/कुंजिका)</span>
          </button>
        </div>
      </div>

      {/* Main Content Body */}
      <div className="flex-1 min-h-0 overflow-y-auto p-2 sm:p-4 space-y-3">
        {activeTab === 'chapters' ? (
          <>
            {/* Horizontal Chapter Selector Carousel */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 no-scrollbar select-none">
              {DURGA_CHAPTERS.map((ch, idx) => (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => {
                    setSelectedChapterIndex(idx);
                    if (isSpeaking) {
                      stopUmaSpeech();
                      setIsSpeaking(false);
                    }
                  }}
                  className={`shrink-0 px-3 py-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    selectedChapterIndex === idx
                      ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white border-amber-800 shadow-sm'
                      : 'bg-[#FFFDF9] text-[#5C3A21] border-[#E2D2BE] hover:bg-[#FFEEC9]'
                  }`}
                >
                  <span className="text-[10px] opacity-80">अध्याय</span>
                  <span className="font-black text-xs">{ch.id}</span>
                </button>
              ))}
            </div>

            {/* Active Chapter Card Header */}
            <div className="bg-[#FFFDF9] border-2 border-amber-300 rounded-2xl p-3.5 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-amber-100 text-[#8C4A00] font-black text-xs border border-amber-300">
                    अध्याय {activeChapter.id}
                  </span>
                  <span className="text-[11px] font-bold text-[#8B1E1E]">
                    {localizedChapter.charitra}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      handleSpeakText(
                        `श्री दुर्गा सप्तशती अध्याय ${activeChapter.id}। ${localizedChapter.heading}। ${localizedChapter.summary}`
                      )
                    }
                    className="p-1.5 rounded-lg bg-amber-100 text-[#5C3A21] hover:bg-amber-200 transition"
                    title="ध्वनि पाठ"
                  >
                    {isSpeaking ? <VolumeX className="w-4 h-4 text-rose-600" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={handleShareChapter}
                    className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800 hover:bg-emerald-200 transition"
                    title="व्हाट्सएप साझा करें"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h1 className="text-sm sm:text-base font-black font-granth text-[#462B17]">
                {localizedChapter.heading}
              </h1>

              <div className="flex items-center gap-3 text-xs text-[#735133] pt-1 border-t border-amber-100">
                <span>श्लोक संख्या: <strong>{activeChapter.shlokaCount}</strong></span>
                <span>•</span>
                <span>पाठ फल: <strong className="text-[#8B1E1E]">{localizedChapter.phala}</strong></span>
              </div>
            </div>

            {/* Chapter Summary & Phala */}
            <div className="bg-[#FFF8EE] border border-amber-200 rounded-xl p-3 space-y-1.5 text-xs text-[#3E2714]">
              <div className="font-bold text-[#8C6239] flex items-center gap-1">
                <span>📌</span>
                <span>अध्याय कथा सार (Summary)</span>
              </div>
              <p className="leading-relaxed text-[11px] sm:text-xs">
                {localizedChapter.summary}
              </p>
            </div>

            {/* Sanskrit Shlokas & Meanings */}
            <div className="space-y-2.5">
              <h3 className="text-xs font-black font-granth text-[#5C3A21] uppercase tracking-wider flex items-center gap-1.5">
                <span>🌸</span>
                <span>प्रमुख श्लोक एवं भावार्थ (Key Verses)</span>
              </h3>

              {activeChapter.sanskritHighlights && activeChapter.sanskritHighlights.length > 0 ? (
                activeChapter.sanskritHighlights.map((sh, sIdx) => (
                  <div
                    key={sIdx}
                    className="bg-white/95 border border-amber-300 rounded-xl p-3 space-y-2 shadow-2xs"
                  >
                    <div className="text-[10px] font-bold text-[#B56A00] uppercase">
                      श्लोक {sIdx + 1}
                    </div>
                    <p
                      className={`font-granth font-black text-[#462B17] leading-relaxed whitespace-pre-line ${
                        fontSize === 'sm' ? 'text-xs' : fontSize === 'lg' ? 'text-base' : 'text-sm'
                      }`}
                    >
                      {sh.shloka}
                    </p>
                    <div className="p-2 rounded-lg bg-[#FFF9EE] border border-amber-200 text-xs text-[#3E2714]">
                      <div className="text-[10px] font-bold text-[#8C6239] mb-0.5">हिंदी भावार्थ:</div>
                      <p className="leading-relaxed text-[11px] sm:text-xs">{sh.meaning}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-center text-[#8C6239] py-2">
                  इस अध्याय के श्लोक उपलब्ध हैं।
                </div>
              )}
            </div>

            {/* Detailed Verse Narrative */}
            {localizedChapter.details && localizedChapter.details.length > 0 && (
              <div className="bg-[#FFFDF9] border border-amber-200 rounded-xl p-3 space-y-2">
                <h4 className="text-xs font-bold text-[#5C3A21] flex items-center gap-1">
                  <span>📖</span>
                  <span>विस्तृत अध्याय व्याख्या</span>
                </h4>
                {localizedChapter.details.map((desc, dIdx) => (
                  <p key={dIdx} className="text-xs text-[#3E2714] leading-relaxed">
                    {desc}
                  </p>
                ))}
              </div>
            )}

            {/* Navigation Footer for Chapters */}
            <div className="flex items-center justify-between pt-2 pb-6">
              <button
                type="button"
                onClick={() => {
                  if (selectedChapterIndex > 0) {
                    setSelectedChapterIndex(selectedChapterIndex - 1);
                  } else if (onPrevChapter) {
                    onPrevChapter();
                  }
                }}
                className="px-3 py-1.5 rounded-xl bg-[#FFFDF9] border border-[#E2D2BE] text-xs font-bold text-[#5C3A21] flex items-center gap-1 hover:bg-[#FFEEC9]"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>पिछला अध्याय</span>
              </button>

              <span className="text-xs font-bold text-[#8C6239]">
                {selectedChapterIndex + 1} / {DURGA_CHAPTERS.length}
              </span>

              <button
                type="button"
                onClick={() => {
                  if (selectedChapterIndex < DURGA_CHAPTERS.length - 1) {
                    setSelectedChapterIndex(selectedChapterIndex + 1);
                  } else if (onNextChapter) {
                    onNextChapter();
                  }
                }}
                className="px-3 py-1.5 rounded-xl bg-[#5C3A21] text-[#FFF6E5] text-xs font-bold flex items-center gap-1 hover:bg-[#462B17]"
              >
                <span>अगला अध्याय</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Angas Tab: Kavach, Argala, Keelak, Kunjika */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pb-1">
              {DURGA_ANGAS.map((anga, idx) => (
                <button
                  key={anga.id}
                  type="button"
                  onClick={() => {
                    setSelectedAngaIndex(idx);
                    if (isSpeaking) {
                      stopUmaSpeech();
                      setIsSpeaking(false);
                    }
                  }}
                  className={`p-2 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
                    selectedAngaIndex === idx
                      ? 'bg-[#5C3A21] text-[#FFF6E5] border-[#3E2714] shadow-xs'
                      : 'bg-[#FFFDF9] text-[#5C3A21] border-[#E2D2BE] hover:bg-[#FFEEC9]'
                  }`}
                >
                  <span className="text-[10px] opacity-75 font-bold">अंग पाठ {idx + 1}</span>
                  <span className="text-xs font-black truncate mt-0.5">{anga.name}</span>
                </button>
              ))}
            </div>

            {/* Active Anga Main Card */}
            <div className="bg-[#FFFDF9] border-2 border-amber-300 rounded-2xl p-3.5 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  <span className="text-xs font-black text-[#8C4A00]">
                    {localizedAnga.name}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      handleSpeakText(
                        `${localizedAnga.name}। ${localizedAnga.desc}। ${localizedAnga.verses.map((v) => v.sanskrit).join(' ')}`
                      )
                    }
                    className="p-1.5 rounded-lg bg-amber-100 text-[#5C3A21] hover:bg-amber-200 transition"
                    title="पाठ सुनें"
                  >
                    {isSpeaking ? <VolumeX className="w-4 h-4 text-rose-600" /> : <Volume2 className="w-4 h-4" />}
                  </button>

                  <button
                    type="button"
                    onClick={handleShareAnga}
                    className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800 hover:bg-emerald-200 transition"
                    title="साझा करें"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h2 className="text-sm font-black font-granth text-[#462B17]">
                {localizedAnga.name}
              </h2>
              <p className="text-xs text-[#735133] leading-relaxed">
                {localizedAnga.desc}
              </p>

              <div className="p-2 rounded-xl bg-[#FFF8EE] border border-amber-200 text-xs text-[#8B1E1E] font-bold">
                🛡️ माहात्म्य: {localizedAnga.significance}
              </div>
            </div>

            {/* Verses / Shlokas */}
            <div className="space-y-3">
              <h3 className="text-xs font-black font-granth text-[#5C3A21] uppercase tracking-wider flex items-center gap-1.5">
                <span>🕉️</span>
                <span>मूल मन्त्र एवं संस्कृत पाठ</span>
              </h3>

              {localizedAnga.verses.map((v, vIdx) => (
                <div
                  key={vIdx}
                  className="bg-white/95 border border-amber-300 rounded-2xl p-3.5 space-y-2 shadow-2xs"
                >
                  <div className="text-[10px] font-bold text-[#B56A00] uppercase">
                    श्लोक {vIdx + 1}
                  </div>
                  <p
                    className={`font-granth font-black text-[#462B17] leading-relaxed whitespace-pre-line ${
                      fontSize === 'sm' ? 'text-xs' : fontSize === 'lg' ? 'text-base' : 'text-sm'
                    }`}
                  >
                    {v.sanskrit}
                  </p>

                  <div className="p-2.5 rounded-xl bg-[#FFF9EE] border border-amber-200 text-xs text-[#3E2714]">
                    <div className="text-[10px] font-bold text-[#8C6239] mb-0.5">हिंदी अनुवाद:</div>
                    <p className="leading-relaxed text-[11px] sm:text-xs">{v.meaning}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DurgaSaptashatiView;
