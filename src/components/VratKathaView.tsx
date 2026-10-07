import React, { useState, useMemo } from 'react';
import { Sparkles, Share2, Volume2, VolumeX, BookOpen, Scroll, ChevronLeft, ChevronRight, Search, CheckCircle2 } from 'lucide-react';
import { VRAT_KATHA_DATA, VRAT_KATHA_CATEGORIES, VratKathaItem } from '../data/vratKathaData';
import { getLocalizedVratKathaItem } from '../services/vratKathaMultilingual';
import { openWhatsAppShare } from '../services/umaConsultationPdf';
import { useLanguage } from '../i18n';
import { speakUma, stopUmaSpeech } from '../lib/umaSpeech';

interface VratKathaViewProps {
  onBackToPanchang?: () => void;
  onOpenUmaModal?: (query?: string) => void;
  onPrevChapter?: () => void;
  onNextChapter?: () => void;
}

export const VratKathaView: React.FC<VratKathaViewProps> = ({
  onBackToPanchang,
  onOpenUmaModal,
  onPrevChapter,
  onNextChapter,
}) => {
  const { language } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [activeChapterIndex, setActiveChapterIndex] = useState<number>(0);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg'>('base');

  const localizedKathas = useMemo(() => {
    return VRAT_KATHA_DATA.map((item) => getLocalizedVratKathaItem(item, language));
  }, [language]);

  const filteredKathas = useMemo(() => {
    return localizedKathas.filter((katha) => {
      const matchesCat = selectedCategory === 'all' || katha.category === selectedCategory;
      const matchesSearch =
        !searchQuery.trim() ||
        katha.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        katha.subtitle.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [localizedKathas, selectedCategory, searchQuery]);

  const currentKatha: VratKathaItem = filteredKathas[selectedIndex] || filteredKathas[0] || localizedKathas[0];

  const handleSpeakKatha = () => {
    if (isSpeaking) {
      stopUmaSpeech();
      setIsSpeaking(false);
      return;
    }
    const currentChapterText = currentKatha.katha[activeChapterIndex] || currentKatha.description;
    const speechContent = `${currentKatha.title}। ${currentKatha.subtitle}। श्लोक: ${currentKatha.shlok}। भावार्थ: ${currentKatha.shlokMeaning}। ${currentChapterText}`;
    setIsSpeaking(true);
    void speakUma(speechContent, {
      rate: 0.88,
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };

  const handleShareKatha = () => {
    const text = `॥ ${currentKatha.title} ॥\n\n${currentKatha.subtitle}\n\nश्लोक:\n${currentKatha.shlok}\n\nभावार्थ: ${currentKatha.shlokMeaning}\n\n(शक्ति पंचांग - व्रत कथा संग्रह)`;
    openWhatsAppShare(text);
  };

  return (
    <div className="w-full h-full min-h-0 flex flex-col bg-[#FAF2E4] text-[#2C180C] overflow-hidden select-none">
      {/* Header Bar */}
      <header className="shrink-0 bg-gradient-to-r from-[#462B17] via-[#5C3A21] to-[#3E2714] text-[#FAF2E4] px-3 py-2.5 shadow-md flex items-center justify-between border-b border-[#B56A00]/40">
        <div className="flex items-center gap-2">
          <span className="text-xl">📜</span>
          <div>
            <h2 className="text-xs sm:text-sm font-black font-granth tracking-wide text-[#FFD88A] flex items-center gap-1.5">
              <span>पावन व्रत कथा एवं आरती संग्रह</span>
              <span className="text-[10px] bg-amber-500/20 text-amber-200 px-1.5 py-0.5 rounded-full border border-amber-400/30">
                शास्त्रोक्त प्रामाणिक
              </span>
            </h2>
            <p className="text-[10px] text-[#E5D2B8] truncate">
              स्कन्दपुराण, पद्मपुराण व वेद सम्मत सम्पूर्ण व्रत-विधान व कथा
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setFontSize(fontSize === 'sm' ? 'base' : fontSize === 'base' ? 'lg' : 'sm')}
            className="px-2 py-1 rounded-lg bg-[#3E2714] border border-amber-500/30 text-[10px] text-amber-200 font-bold hover:bg-amber-900/40"
          >
            {fontSize === 'sm' ? 'अ (छोटा)' : fontSize === 'base' ? 'अ (मध्यम)' : 'अ (बड़ा)'}
          </button>

          {onOpenUmaModal && (
            <button
              type="button"
              onClick={() => onOpenUmaModal(`${currentKatha.title} की कथा का पाठ विधान और विशेष फल बताइए।`)}
              className="px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-stone-950 text-xs font-black flex items-center gap-1 shadow-sm hover:scale-105 active:scale-95 transition"
            >
              <Sparkles className="w-3 h-3 fill-stone-950" />
              <span>उमा</span>
            </button>
          )}
        </div>
      </header>

      {/* Filter Categories Bar */}
      <div className="shrink-0 bg-[#FFFDF9] border-b border-[#E8DCCB] px-2 py-2 space-y-1.5 shadow-2xs">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {VRAT_KATHA_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                setSelectedCategory(cat.id);
                setSelectedIndex(0);
                setActiveChapterIndex(0);
              }}
              className={`shrink-0 px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-[#5C3A21] text-[#FFF6E5] shadow-xs'
                  : 'bg-[#F4E8D1] text-[#6B4E36] hover:bg-[#FFEEC9]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Input & Katha selector */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8C6239]" />
            <input
              type="text"
              placeholder="कथा खोजें (उदा. सत्यनारायण, एकादशी, प्रदोष)..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSelectedIndex(0);
                setActiveChapterIndex(0);
              }}
              className="w-full pl-8 pr-3 py-1 bg-white border border-[#E2D2BE] rounded-xl text-xs text-[#3E2714] focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>
      </div>

      {/* Main Content Scroll Body */}
      <div className="flex-1 min-h-0 overflow-y-auto p-2 sm:p-4 space-y-3">
        {/* Horizontal Selectable Story Carousel */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 no-scrollbar select-none">
          {filteredKathas.map((katha, idx) => (
            <button
              key={katha.id || idx}
              type="button"
              onClick={() => {
                setSelectedIndex(idx);
                setActiveChapterIndex(0);
                if (isSpeaking) {
                  stopUmaSpeech();
                  setIsSpeaking(false);
                }
              }}
              className={`shrink-0 px-3 py-2 rounded-xl border text-left transition flex flex-col justify-between max-w-[180px] cursor-pointer ${
                selectedIndex === idx
                  ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white border-amber-800 shadow-sm'
                  : 'bg-[#FFFDF9] text-[#5C3A21] border-[#E2D2BE] hover:bg-[#FFEEC9]'
              }`}
            >
              <span className="text-[10px] font-bold opacity-80 uppercase">
                {katha.category === 'ekadashi' ? 'एकादशी' : katha.category === 'aarti' ? 'आरती' : 'व्रत कथा'}
              </span>
              <span className="text-xs font-black truncate mt-0.5">{katha.title}</span>
            </button>
          ))}
        </div>

        {currentKatha ? (
          <>
            {/* Active Katha Banner */}
            <div className="bg-[#FFFDF9] border-2 border-amber-300 rounded-2xl p-3.5 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-amber-100 text-[#8C4A00] font-black text-xs border border-amber-300">
                    {currentKatha.vedaSource}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSpeakKatha}
                    className="p-1.5 rounded-lg bg-amber-100 text-[#5C3A21] hover:bg-amber-200 transition"
                    title="ध्वनि वाचन"
                  >
                    {isSpeaking ? <VolumeX className="w-4 h-4 text-rose-600" /> : <Volume2 className="w-4 h-4" />}
                  </button>

                  <button
                    type="button"
                    onClick={handleShareKatha}
                    className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800 hover:bg-emerald-200 transition"
                    title="व्हाट्सएप साझा करें"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h1 className="text-sm sm:text-base font-black font-granth text-[#462B17]">
                {currentKatha.title}
              </h1>

              <p className="text-xs text-[#735133] font-medium leading-relaxed">
                {currentKatha.subtitle}
              </p>
            </div>

            {/* Shloka Box */}
            {currentKatha.shlok && (
              <div className="bg-[#FFF8EE] border border-amber-300 rounded-2xl p-3.5 space-y-2 shadow-2xs">
                <div className="text-[10px] font-black text-[#B56A00] uppercase tracking-wider">
                  ॥ मुख्य मंगलाचरण / संकल्प मन्त्र ॥
                </div>
                <p
                  className={`font-granth font-black text-[#462B17] leading-relaxed whitespace-pre-line ${
                    fontSize === 'sm' ? 'text-xs' : fontSize === 'lg' ? 'text-base' : 'text-sm'
                  }`}
                >
                  {currentKatha.shlok}
                </p>
                <div className="p-2.5 rounded-xl bg-white/90 border border-amber-200 text-xs text-[#3E2714]">
                  <div className="text-[10px] font-bold text-[#8C6239] mb-0.5">हिंदी भावार्थ:</div>
                  <p className="leading-relaxed text-[11px] sm:text-xs">{currentKatha.shlokMeaning}</p>
                </div>
              </div>
            )}

            {/* Chapter Selection if multi-chapter (e.g. Satyanarayan 7 chapters) */}
            {currentKatha.katha && currentKatha.katha.length > 1 && (
              <div className="space-y-2">
                <div className="text-xs font-black text-[#5C3A21] flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-amber-600" />
                  <span>अध्याय चयन ({currentKatha.katha.length} अध्याय):</span>
                </div>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                  {currentKatha.katha.map((_, cIdx) => (
                    <button
                      key={cIdx}
                      type="button"
                      onClick={() => setActiveChapterIndex(cIdx)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                        activeChapterIndex === cIdx
                          ? 'bg-[#5C3A21] text-[#FFF6E5] border-[#3E2714]'
                          : 'bg-[#FFFDF9] text-[#5C3A21] border-[#E2D2BE]'
                      }`}
                    >
                      अध्याय {cIdx + 1}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Full Katha Text */}
            <div className="bg-[#FFFDF9] border border-amber-200 rounded-2xl p-3.5 space-y-2 shadow-2xs">
              <h3 className="text-xs font-black font-granth text-[#5C3A21] uppercase tracking-wider flex items-center gap-1.5">
                <span>📖</span>
                <span>
                  {currentKatha.katha && currentKatha.katha.length > 1
                    ? `सम्पूर्ण कथा पाठ • अध्याय ${activeChapterIndex + 1}`
                    : 'सम्पूर्ण कथा पाठ'}
                </span>
              </h3>

              <div
                className={`text-[#3E2714] leading-relaxed whitespace-pre-line space-y-2 ${
                  fontSize === 'sm' ? 'text-xs' : fontSize === 'lg' ? 'text-base' : 'text-sm'
                }`}
              >
                {currentKatha.katha && currentKatha.katha.length > 0
                  ? currentKatha.katha[activeChapterIndex] || currentKatha.katha[0]
                  : currentKatha.description}
              </div>
            </div>

            {/* Vrat Rules & Vidhi */}
            {currentKatha.rules && currentKatha.rules.length > 0 && (
              <div className="bg-[#FFF8EE] border border-amber-200 rounded-2xl p-3.5 space-y-2">
                <h4 className="text-xs font-bold text-[#8C6239] flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>शास्त्रोक्त पूजा विधि व नियम</span>
                </h4>
                <ul className="space-y-1.5 text-xs text-[#3E2714]">
                  {currentKatha.rules.map((rule, rIdx) => (
                    <li key={rIdx} className="flex items-start gap-2">
                      <span className="text-amber-600 font-bold">•</span>
                      <span className="leading-relaxed">{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Pagination Controls */}
            <div className="flex items-center justify-between pt-2 pb-6">
              <button
                type="button"
                onClick={() => {
                  if (activeChapterIndex > 0) {
                    setActiveChapterIndex(activeChapterIndex - 1);
                  } else if (selectedIndex > 0) {
                    setSelectedIndex(selectedIndex - 1);
                    setActiveChapterIndex(0);
                  } else if (onPrevChapter) {
                    onPrevChapter();
                  }
                }}
                className="px-3 py-1.5 rounded-xl bg-[#FFFDF9] border border-[#E2D2BE] text-xs font-bold text-[#5C3A21] flex items-center gap-1 hover:bg-[#FFEEC9]"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>पिछली कथा/अध्याय</span>
              </button>

              <span className="text-xs font-bold text-[#8C6239]">
                {selectedIndex + 1} / {filteredKathas.length}
              </span>

              <button
                type="button"
                onClick={() => {
                  if (currentKatha.katha && activeChapterIndex < currentKatha.katha.length - 1) {
                    setActiveChapterIndex(activeChapterIndex + 1);
                  } else if (selectedIndex < filteredKathas.length - 1) {
                    setSelectedIndex(selectedIndex + 1);
                    setActiveChapterIndex(0);
                  } else if (onNextChapter) {
                    onNextChapter();
                  }
                }}
                className="px-3 py-1.5 rounded-xl bg-[#5C3A21] text-[#FFF6E5] text-xs font-bold flex items-center gap-1 hover:bg-[#462B17]"
              >
                <span>अगली कथा/अध्याय</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-10 text-xs text-[#8C6239]">
            कोई कथा प्राप्त नहीं हुई। कृपया खोज शब्द बदलें।
          </div>
        )}
      </div>
    </div>
  );
};

export default VratKathaView;
