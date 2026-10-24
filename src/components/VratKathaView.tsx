import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Share2, Volume2, VolumeX, Search, Copy, Check, Sparkles, BookOpen } from 'lucide-react';
import { VRAT_KATHA_DATA, VRAT_KATHA_CATEGORIES, VratKathaItem } from '../data/vratKathaData';
import { getLocalizedVratKathaItem } from '../services/vratKathaMultilingual';
import { shareTextContent } from '../lib/shareHelper';
import { useLanguage } from '../i18n';
import { speakUma, stopUmaSpeech } from '../lib/umaSpeech';
import { ZeroScrollPager } from './ZeroScrollPager';
import { DrawerHostContext, useTabMenu } from './BoardShell';
import { ShlokaPosterModal, ShlokaPosterData } from './ShlokaPosterModal';

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
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [shareToast, setShareToast] = useState<string | null>(null);
  const [posterData, setPosterData] = useState<ShlokaPosterData | null>(null);
  const [atMenu, setAtMenu] = useState(false);

  useTabMenu(() => {
    if (atMenu) return false;
    setAtMenu(true);
    return true;
  });

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
    const currentChapterText = (currentKatha.katha && currentKatha.katha[activeChapterIndex]) || currentKatha.description;
    const speechContent = `${currentKatha.title}। ${currentKatha.subtitle}। ${currentChapterText}`;
    setIsSpeaking(true);
    const raga = /महिम्न|शिव/.test(currentKatha.title)
      ? "yaman"
      : /दुर्गा|सप्त|चण्डी|कवच/.test(currentKatha.title)
        ? "bhairavi"
        : /हनुमान|राम/.test(currentKatha.title)
          ? "desh"
          : "kafi";
    void speakUma(speechContent, {
      rate: 0.86,
      voiceStyle: "pandit",
      sanskritOnly: true,
      raga,
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };

  const handleShareKatha = async () => {
    const chapterText = (currentKatha.katha && currentKatha.katha[activeChapterIndex]) || currentKatha.description;
    const shareText = `॥ ${currentKatha.title} ॥\n(अध्याय ${activeChapterIndex + 1})\n\n${currentKatha.subtitle}\n\n${chapterText.slice(0, 800)}...\n\n(श्री शक्ति सनातन वैदिक पंचांग • व्रत कथा संग्रह)`;
    
    const res = await shareTextContent({
      title: currentKatha.title,
      text: shareText,
    });

    if (res === 'copied') {
      setShareToast('कथा का अंश कॉपी हो गया!');
      setTimeout(() => setShareToast(null), 2500);
    } else if (res === 'shared' || res === 'whatsapp') {
      setShareToast('शेयरिंग विंडो खोली गई!');
      setTimeout(() => setShareToast(null), 2000);
    }
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const drawer = React.useContext(DrawerHostContext);
  const host = drawer.host;
  const body = (currentKatha.katha && currentKatha.katha[activeChapterIndex]) || currentKatha.description || "";
  const blocks = body.split(/\n\n+/).map((line) => line.trim()).filter(Boolean);
  const size = fontSize === "sm" ? "text-[15px]" : fontSize === "lg" ? "text-[19px]" : "text-[17px]";

  const tools = (
    <div className="flex flex-col gap-2 text-sm p-1">
      <div className="flex flex-wrap gap-1.5">
        {VRAT_KATHA_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            className="bx-iconbtn h-auto px-2 py-1 text-xs font-semibold"
            style={{
              background: selectedCategory === cat.id ? 'var(--bx-mark)' : 'transparent',
              color: selectedCategory === cat.id ? 'var(--bx-cream)' : 'inherit',
            }}
            onClick={() => {
              setSelectedCategory(cat.id);
              setSelectedIndex(0);
              setActiveChapterIndex(0);
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <label className="flex items-center gap-2 bg-stone-100/80 px-2.5 py-1.5 rounded-lg border border-amber-900/20">
        <Search className="w-4 h-4 shrink-0 text-[#B56A00]" />
        <input
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setSelectedIndex(0);
            setActiveChapterIndex(0);
          }}
          placeholder="कथा या श्लोक खोजें..."
          className="w-full bg-transparent outline-none text-xs"
        />
      </label>

      <div className="flex flex-wrap items-center gap-1.5 pt-1">
        <button
          type="button"
          className="bx-iconbtn flex items-center gap-1 text-xs px-2 py-1"
          onClick={() => setFontSize(fontSize === "sm" ? "base" : fontSize === "base" ? "lg" : "sm")}
        >
          <span>अ</span>
          <span className="text-[10px] opacity-70">({fontSize})</span>
        </button>

        <button
          type="button"
          className="bx-iconbtn flex items-center gap-1 text-xs px-2 py-1"
          onClick={handleSpeakKatha}
        >
          {isSpeaking ? <VolumeX className="w-4 h-4 text-red-600" /> : <Volume2 className="w-4 h-4 text-[#B56A00]" />}
          <span>{isSpeaking ? 'रुकें' : 'वाचन'}</span>
        </button>

        <button
          type="button"
          className="bx-iconbtn flex items-center gap-1 text-xs px-2 py-1"
          onClick={() => handleCopyText(currentKatha.id, `${currentKatha.title}\n${body}`)}
        >
          {copiedId ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-[#B56A00]" />}
          <span>{copiedId ? 'कॉपी हुआ' : 'कॉपी'}</span>
        </button>

        <button
          type="button"
          className="bx-iconbtn flex items-center gap-1 text-xs px-2 py-1 bg-[#25D366] text-white font-bold"
          onClick={handleShareKatha}
        >
          <Share2 className="w-4 h-4" />
          <span>शेयर करें</span>
        </button>

        {onOpenUmaModal && (
          <button
            type="button"
            className="bx-iconbtn flex items-center gap-1 text-xs px-2 py-1 bg-[#B56A00] text-white font-bold"
            onClick={() => onOpenUmaModal(currentKatha.title)}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>उमा AI</span>
          </button>
        )}
      </div>

      <div className="max-h-36 overflow-y-auto flex flex-col gap-1 border-t border-amber-900/15 pt-1.5">
        {filteredKathas.map((katha, idx) => (
          <button
            key={katha.id || idx}
            type="button"
            className="text-left text-xs px-2.5 py-1.5 rounded-lg flex items-center justify-between"
            style={{
              background: idx === selectedIndex ? "var(--bx-mark)" : "transparent",
              color: idx === selectedIndex ? "var(--bx-cream)" : "inherit",
            }}
            onClick={() => {
              setSelectedIndex(idx);
              setActiveChapterIndex(0);
              setAtMenu(false);
              drawer.close();
            }}
          >
            <span className="font-bold truncate">{katha.title}</span>
            {katha.katha && (
              <span className="text-[10px] opacity-80 shrink-0 ml-2">
                {katha.katha.length} अध्याय
              </span>
            )}
          </button>
        ))}
      </div>

      {currentKatha.katha && currentKatha.katha.length > 1 && (
        <div className="flex flex-wrap gap-1 border-t border-amber-900/15 pt-1.5">
          <span className="text-xs font-bold text-[#5C3A21] w-full mb-0.5">अध्याय चुनें:</span>
          {currentKatha.katha.map((_, idx) => (
            <button
              key={idx}
              type="button"
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                activeChapterIndex === idx
                  ? 'bg-[#B56A00] text-white shadow-xs'
                  : 'bg-stone-200/80 text-[#5C3A21] hover:bg-stone-300'
              }`}
              onClick={() => setActiveChapterIndex(idx)}
            >
              अध्याय {idx + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="flex-1 min-h-0 w-full flex flex-col overflow-hidden relative bg-[#FAF2E4]">
      {shareToast && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-50 bg-[#5C3A21] text-[#FFD88A] text-xs font-bold px-3.5 py-1.5 rounded-full border border-[#B56A00] shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
          {shareToast}
        </div>
      )}

      {/* Title Bar */}
      <div className="shrink-0 px-3 py-1.5 bg-[#F4E8D1] border-b border-[#8C6239]/20 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <BookOpen className="w-4 h-4 text-[#B56A00] shrink-0" />
          <h2 className="text-[13px] font-bold text-[#5C3A21] truncate">
            {atMenu ? "व्रत कथा सूची" : currentKatha.title}
          </h2>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {!atMenu && (
            <button
              type="button"
              onClick={() =>
                setPosterData({
                  title: currentKatha.title,
                  reference: currentKatha.subtitle || 'पौराणिक व्रत कथा',
                  sanskrit:
                    currentKatha.shlok && currentKatha.shlok.trim()
                      ? currentKatha.shlok
                      : `${currentKatha.title}\n(${currentKatha.subtitle})`,
                  meaning:
                    currentKatha.shlokMeaning && currentKatha.shlokMeaning.trim()
                      ? `${currentKatha.shlokMeaning}\n\n${body.slice(0, 260)}...`
                      : `${body.slice(0, 320)}...`,
                  accentTag: '🪔 सनातन व्रत कथा एवं महात्म्य',
                })
              }
              style={{ backgroundColor: '#6E1409', color: '#FFFFFF' }}
              className="px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer"
            >
              📸 स्टेटस कार्ड
            </button>
          )}
          {currentKatha.katha && currentKatha.katha.length > 1 && !atMenu && (
            <span className="text-[11px] font-bold text-[#6E1409] bg-[#FAF2E4] px-2 py-0.5 rounded-md border border-[#B56A00]/40">
              अध्याय {activeChapterIndex + 1}/{currentKatha.katha.length}
            </span>
          )}
        </div>
      </div>

      {host ? createPortal(tools, host) : null}

      {/* Content View */}
      <div className="flex-1 min-h-0 w-full overflow-y-auto overscroll-contain px-2.5 py-2 space-y-2.5">
        {atMenu ? (
          filteredKathas.map((katha, idx) => (
            <button
              key={katha.id || idx}
              type="button"
              className="w-full text-left p-3 rounded-xl bg-[#F4E8D1] border border-[#8C6239]/30 hover:border-[#B56A00] transition space-y-1"
              onClick={() => {
                setSelectedIndex(idx);
                setActiveChapterIndex(0);
                setAtMenu(false);
              }}
            >
              <div className="text-[10px] font-bold text-[#B56A00] uppercase tracking-wider">
                {katha.category}
              </div>
              <strong className="text-sm font-extrabold text-[#5C3A21] block">
                {katha.title}
              </strong>
              <p className="text-xs text-[#735133] line-clamp-2">{katha.subtitle}</p>
            </button>
          ))
        ) : (
          <>
            {/* Introductory Shlok & Meaning (Only if present and not empty) */}
            {currentKatha.shlok && currentKatha.shlok.trim().length > 0 && (
              <article className="p-3.5 rounded-xl bg-[#F4E8D1]/90 border-2 border-[#B56A00]/40 shadow-xs space-y-1.5">
                <div className="text-[11px] font-black text-[#B56A00] flex items-center gap-1 uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" /> मंगलाचरण श्लोक
                </div>
                <p className={`font-granth font-bold text-[#5C3A21] whitespace-pre-wrap leading-relaxed ${size}`}>
                  {currentKatha.shlok}
                </p>
                {currentKatha.shlokMeaning && currentKatha.shlokMeaning.trim().length > 0 && (
                  <div className="pt-2 border-t border-[#8C6239]/20 text-[#3E2714]">
                    <span className="text-[11px] font-bold text-[#8C6239] block">हिंदी भावार्थ:</span>
                    <p className={`font-medium ${size}`}>{currentKatha.shlokMeaning}</p>
                  </div>
                )}
              </article>
            )}

            {/* Chapter Tabs inside content for quick switching */}
            {currentKatha.katha && currentKatha.katha.length > 1 && (
              <div className="flex items-center gap-1.5 overflow-x-auto py-1 px-0.5 no-scrollbar">
                {currentKatha.katha.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`px-3 py-1 rounded-lg text-xs font-extrabold shrink-0 border transition cursor-pointer ${
                      activeChapterIndex === idx
                        ? 'bg-[#5C3A21] text-[#FFD88A] border-[#B56A00] shadow-sm'
                        : 'bg-[#F4E8D1] text-[#5C3A21] border-[#8C6239]/30 hover:bg-[#EBD8BD]'
                    }`}
                    onClick={() => setActiveChapterIndex(idx)}
                  >
                    अध्याय {idx + 1}
                  </button>
                ))}
              </div>
            )}

            {/* Main Chapter Content Blocks */}
            {blocks.map((block, idx) => {
              const lines = block.split(/\n/);
              const isShlokaBlock = block.includes('श्लोक') || block.includes('संस्कृत:') || block.includes('॥');

              return (
                <article
                  key={idx}
                  className={`p-3.5 rounded-xl border transition shadow-2xs space-y-2 ${
                    isShlokaBlock
                      ? 'bg-[#F4E8D1] border-[#B56A00]/40'
                      : 'bg-[#F4E8D1]/70 border-[#8C6239]/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-[#B56A00] uppercase tracking-wider">
                      {currentKatha.katha && currentKatha.katha.length > 1
                        ? `अध्याय ${activeChapterIndex + 1} · मन्त्र ${idx + 1}`
                        : `भाग ${idx + 1}`}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {lines.map((line, lIdx) => {
                      const trimmed = line.trim();
                      if (!trimmed) return null;

                      // Chapter Header Line (e.g. ॥ अध्याय १ ॥ or 🌅 १. प्रातः उठते ही)
                      if (trimmed.startsWith('॥') || trimmed.match(/^[🌅🌍🍲🪔🌙\d]\s*[.।]/)) {
                        return (
                          <div key={lIdx} className="font-extrabold text-[#5C3A21] text-sm sm:text-base border-b border-[#8C6239]/20 pb-1 font-granth">
                            {trimmed}
                          </div>
                        );
                      }

                      // Label line 'श्लोक:'
                      if (trimmed === 'श्लोक:' || trimmed === 'संस्कृत प्रमाण:') {
                        return (
                          <div key={lIdx} className="text-[11px] font-bold text-[#B56A00] uppercase tracking-wider">
                            श्लोक:
                          </div>
                        );
                      }

                      // Hindi Translation Line or Block
                      if (trimmed.startsWith('हिंदी अनुवाद:') || trimmed.startsWith('हिंदी भावार्थ:') || trimmed.startsWith('भावार्थ:')) {
                        const contentText = trimmed.replace(/^(हिंदी अनुवाद:|हिंदी भावार्थ:|भावार्थ:)\s*/, '');
                        return (
                          <div key={lIdx} className="bg-[#FAF2E4] p-3 rounded-xl border-l-4 border-l-[#B56A00] border-[#8C6239]/20 space-y-0.5">
                            <span className="font-bold text-[#B56A00] block text-xs">हिंदी अर्थ:</span>
                            <p className="font-medium text-[#3E2714] text-xs sm:text-sm leading-relaxed">
                              {contentText}
                            </p>
                          </div>
                        );
                      }

                      // Shloka Sanskrit Verse Text
                      if (isShlokaBlock && !trimmed.startsWith('हिंदी')) {
                        return (
                          <p key={lIdx} className="font-granth font-bold text-[#5C3A21] text-base sm:text-lg leading-relaxed whitespace-pre-wrap">
                            {trimmed}
                          </p>
                        );
                      }

                      // Standard Descriptive Text
                      return (
                        <p key={lIdx} className={`whitespace-pre-wrap ${size} text-[#3E2714] leading-relaxed font-medium`}>
                          {trimmed}
                        </p>
                      );
                    })}
                  </div>
                </article>
              );
            })}

            {/* Puja Rules & Vidhi */}
            {(currentKatha.rules || []).length > 0 && (
              <div className="p-3.5 bg-[#F4E8D1] border-2 border-[#8C6239]/30 rounded-xl space-y-2 mt-3">
                <h3 className="font-bold text-xs text-[#B56A00] uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> व्रत व पूजन नियम (सम्पूर्ण विधि)
                </h3>
                <ul className="space-y-1.5 list-disc list-inside text-xs sm:text-sm font-medium text-[#3E2714]">
                  {currentKatha.rules.map((rule, idx) => (
                    <li key={idx} className="leading-relaxed">{rule}</li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>

      {/* Floating Sticky Audio Player Bar when speaking */}
      {isSpeaking && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-md bg-stone-900/95 backdrop-blur-md text-amber-100 p-2.5 rounded-2xl border-2 border-amber-500 shadow-2xl flex items-center justify-between gap-2 animate-in slide-in-from-bottom-3 duration-200">
          <div className="min-w-0 flex-1 flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-400/50 flex items-center justify-center shrink-0">
              <Volume2 className="w-4 h-4 text-amber-400 animate-pulse" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-bold text-amber-300 truncate">
                कथा वाचन चालू: {currentKatha.title}
              </div>
              <div className="text-[10px] text-amber-200/80 truncate">
                {currentKatha.katha && currentKatha.katha.length > 1
                  ? `अध्याय ${activeChapterIndex + 1} / ${currentKatha.katha.length}`
                  : 'संपूर्ण वाचन'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                stopUmaSpeech();
                setIsSpeaking(false);
              }}
              className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1 shadow-md cursor-pointer"
              title="कथा वाचन बंद करें"
            >
              <VolumeX className="w-4 h-4" />
              <span>रुकें</span>
            </button>
          </div>
        </div>
      )}
      <ShlokaPosterModal
        isOpen={posterData !== null}
        onClose={() => setPosterData(null)}
        data={posterData}
      />
    </div>
  );
};

export default VratKathaView;

