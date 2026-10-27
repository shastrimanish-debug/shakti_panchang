import React, { useState, useMemo } from 'react';
import { GITA_SHLOKAS, getLocalizedGitaShloka } from '../data/gitaShlokas';
import { shlokaChrome } from '../constants/shlokas';
import { Sparkles, Share2, Volume2, VolumeX, BookOpen, ChevronLeft, ChevronRight, Copy, Check, Bookmark, Menu, X, Search, ArrowLeft } from 'lucide-react';
import { openWhatsAppShare } from '../services/umaConsultationPdf';
import { useLanguage } from '../i18n';
import { umaVoice } from '../services/UmaVoiceService';
import { formatPadacchedaGuide } from '../lib/sanskritPhonetics';
import { ZeroScrollPager } from './ZeroScrollPager';
import { useTabMenu } from './BoardShell';
import { ShlokaPosterModal, ShlokaPosterData } from './ShlokaPosterModal';

interface DailyGitaShlokaViewProps {
  onBackToPanchang?: () => void;
  onOpenUmaModal?: (query?: string) => void;
  onPrevChapter?: () => void;
  onNextChapter?: () => void;
}

export const DailyGitaShlokaView: React.FC<DailyGitaShlokaViewProps> = ({
  onBackToPanchang,
  onOpenUmaModal,
  onPrevChapter,
  onNextChapter,
}) => {
  const { language, t } = useLanguage();
  const chrome = shlokaChrome(language);

  const [selectedShlokaIndex, setSelectedShlokaIndex] = useState<number>(0);
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg'>('base');
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [currentSpeakingId, setCurrentSpeakingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [bookmarks, setBookmarks] = useState<Record<string, boolean>>({});
  const [isTocOpen, setIsTocOpen] = useState<boolean>(false);
  useTabMenu(() => {
    if (isTocOpen) return false;
    setIsTocOpen(true);
    return true;
  });
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [posterData, setPosterData] = useState<ShlokaPosterData | null>(null);

  const localizedShlokas = useMemo(() => {
    return GITA_SHLOKAS.map((item) => {
      const localized = getLocalizedGitaShloka(item, language);
      return {
        ...item,
        localizedMeaning: localized.meaning,
        localizedReflection: localized.reflection,
      };
    });
  }, [language]);

  const filteredShlokas = useMemo(() => {
    if (!searchQuery.trim()) return localizedShlokas;
    const q = searchQuery.toLowerCase();
    return localizedShlokas.filter(
      (s) =>
        s.sanskrit.toLowerCase().includes(q) ||
        s.localizedMeaning.toLowerCase().includes(q) ||
        s.transliteration.toLowerCase().includes(q)
    );
  }, [localizedShlokas, searchQuery]);

  const currentShloka = filteredShlokas[selectedShlokaIndex] || filteredShlokas[0] || localizedShlokas[0];

  const stopAllSpeech = () => {
    umaVoice.stop();
    setIsSpeaking(false);
    setCurrentSpeakingId(null);
  };

  const speakShlokaFromIndex = (index: number) => {
    umaVoice.stop();
    if (index < 0 || index >= filteredShlokas.length) {
      stopAllSpeech();
      return;
    }

    const s = filteredShlokas[index];
    setSelectedShlokaIndex(index);
    setIsSpeaking(true);
    setCurrentSpeakingId(`gita_${s.id}`);

    const textToSpeak = `${s.sanskrit}।\n${s.localizedMeaning}`;

    void umaVoice.speak(textToSpeak, {
      rate: 0.88,
      pitch: 1.08,
      voiceStyle: 'uma',
      sanskritOnly: true,
      onStart: () => {
        setIsSpeaking(true);
        setCurrentSpeakingId(`gita_${s.id}`);
      },
      onEnd: () => {
        if (index + 1 < filteredShlokas.length) {
          speakShlokaFromIndex(index + 1);
        } else {
          stopAllSpeech();
        }
      },
      onError: () => {
        stopAllSpeech();
      },
    });
  };

  const handleToggleSpeak = () => {
    if (isSpeaking) {
      stopAllSpeech();
    } else {
      speakShlokaFromIndex(selectedShlokaIndex);
    }
  };

  const handleCopy = (id: string, sanskrit: string, meaning: string) => {
    const text = `॥ श्रीमद्भगवद्गीता ॥\n${sanskrit}\n\nहिंदी अर्थ: ${meaning}\n(शक्ति पंचांग)`;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleShare = (s: typeof currentShloka) => {
    const text = `*श्रीमद्भगवद्गीता (${chrome.chapter} ${s.chapter}, ${chrome.verse} ${s.verse})*\n\n${s.sanskrit}\n\n*भावार्थ:* ${s.localizedMeaning}\n\n(शक्ति पंचांग)`;
    openWhatsAppShare(text);
  };

  const toggleBookmark = (id: string) => {
    setBookmarks((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div
      className="w-full h-full min-h-0 flex flex-col overflow-hidden select-none relative"
      style={{ backgroundColor: '#FAF3E3', color: '#1F1006' }}
    >
      {/* Header Bar */}
      <header
        className="shrink-0 px-3 py-2.5 shadow-sm flex items-center justify-between border-b z-20"
        style={{ backgroundColor: '#FFF9EE', borderColor: '#D6B485', color: '#2A1004' }}
      >
        <div className="flex items-center gap-2">
          {/* Back to Panchang Button */}
          {onBackToPanchang && (
            <button
              type="button"
              onClick={onBackToPanchang}
              style={{ backgroundColor: '#FFF2DC', color: '#4A1805', borderColor: '#C89656' }}
              className="px-2 py-1 rounded-xl border transition cursor-pointer flex items-center gap-1 text-xs font-bold shrink-0"
              title="पंचांग पर वापस जाएं"
            >
              <ArrowLeft className="w-3.5 h-3.5" style={{ color: '#7C2D12' }} />
              <span className="text-xs font-bold">पंचांग</span>
            </button>
          )}

          {/* TOC Index Button */}
          <button
            type="button"
            onClick={() => setIsTocOpen(!isTocOpen)}
            style={{ backgroundColor: '#FFF2DC', color: '#4A1805', borderColor: '#C89656' }}
            className="px-2 py-1 rounded-xl border transition cursor-pointer flex items-center gap-1 shrink-0"
            title="गीता श्लोक अनुक्रमणिका"
          >
            <Menu className="w-3.5 h-3.5" style={{ color: '#7C2D12' }} />
            <span className="text-[11px] font-bold">सूचकांक</span>
          </button>

          <div>
            <h2 className="text-xs sm:text-sm font-black font-granth tracking-wide flex items-center gap-1.5" style={{ color: '#6E1409' }}>
              <span>{chrome.gitaTitle}</span>
              <span
                className="text-[10px] px-1.5 py-0.5 rounded-full border font-bold"
                style={{ backgroundColor: '#FEF3C7', color: '#7C2D12', borderColor: '#D97706' }}
              >
                भगवान श्री कृष्ण वाणी
              </span>
            </h2>
            <p className="text-[10px] font-bold truncate max-w-[200px] sm:max-w-md" style={{ color: '#4A2511' }}>
              {currentShloka ? `${chrome.chapter} ${currentShloka.chapter} • ${chrome.verse} ${currentShloka.verse}` : 'श्रीमद्भगवद्गीता'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleToggleSpeak}
            style={
              isSpeaking
                ? { backgroundColor: '#BE123C', color: '#FFFFFF', borderColor: '#9F1239' }
                : { backgroundColor: '#FFF2DC', color: '#3D1605', borderColor: '#C89656' }
            }
            className="px-2.5 py-1 rounded-lg border text-xs font-bold flex items-center gap-1 cursor-pointer transition"
            title="सस्वर पाठ सुनें / बंद करें"
          >
            {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" style={{ color: '#9A3412' }} />}
            <span>{isSpeaking ? 'रुकें' : 'पाठ सुनें'}</span>
          </button>

          <button
            type="button"
            onClick={() => setFontSize(fontSize === 'sm' ? 'base' : fontSize === 'base' ? 'lg' : 'sm')}
            style={{ backgroundColor: '#FFF2DC', color: '#3D1605', borderColor: '#C89656' }}
            className="px-2 py-1 rounded-lg border text-[10px] font-bold cursor-pointer"
          >
            {fontSize === 'sm' ? 'अ-' : fontSize === 'base' ? 'अ' : 'अ+'}
          </button>

          {onOpenUmaModal && (
            <button
              type="button"
              onClick={() => onOpenUmaModal(`श्रीमद्भगवद्गीता अध्याय ${currentShloka.chapter} श्लोक ${currentShloka.verse} का जीवन में व्यावहारिक अर्थ समझाइए।`)}
              style={{ backgroundColor: '#6E1409', color: '#FFFFFF' }}
              className="px-2.5 py-1 rounded-lg text-xs font-black flex items-center gap-1 shadow-xs transition cursor-pointer"
            >
              <Sparkles className="w-3 h-3" style={{ color: '#FDE68A' }} />
              <span>उमा</span>
            </button>
          )}
        </div>
      </header>

      {/* TOC Drawer Overlay */}
      {isTocOpen && (
        <div className="absolute inset-0 z-30 bg-black/60 backdrop-blur-xs flex justify-start animate-in fade-in duration-200">
          <ZeroScrollPager className="w-4/5 max-w-xs h-full bg-[#FAF2E4] border-r-2 border-amber-600 shadow-2xl flex flex-col overflow-hidden min-h-0" contentClassName="p-3 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#E2D2BE]">
              <div className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-[#8C4A00]" />
                <h3 className="font-granth font-black text-sm text-[#462B17]">
                  गीता श्लोक अनुक्रमणिका
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsTocOpen(false)}
                className="p-1 rounded-lg bg-[#E2D2BE] text-[#462B17]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1">
              {filteredShlokas.map((s, idx) => (
                <button
                  key={s.id || idx}
                  type="button"
                  onClick={() => {
                    setSelectedShlokaIndex(idx);
                    setIsTocOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-2 rounded-xl text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                    selectedShlokaIndex === idx
                      ? 'bg-[#5C3A21] text-[#FFF6E5]'
                      : 'bg-white/80 text-[#3E2714] hover:bg-[#FFEEC9]'
                  }`}
                >
                  <div className="truncate pr-1">
                    <span className="text-xs font-black">अध्याय {s.chapter}, श्लोक {s.verse}</span>
                  </div>
                  <span className="text-[9px] opacity-75 shrink-0">गीतोपदेश</span>
                </button>
              ))}
            </div>
          </ZeroScrollPager>
        </div>
      )}

      {/* Filter / Search Bar */}
      <div className="shrink-0 bg-[#FFFDF9] border-b border-[#E8DCCB] px-2 py-2 space-y-1.5 shadow-2xs">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8C6239]" />
            <input
              type="text"
              placeholder="गीता श्लोक या भावार्थ खोजें (उदा. कर्मण्येवाधिकारस्ते, यदा यदा हि)..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSelectedShlokaIndex(0);
              }}
              className="w-full pl-8 pr-3 py-1 bg-white border border-[#E2D2BE] rounded-xl text-xs text-[#3E2714] focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>
      </div>

      {/* Main Content Body */}
      <ZeroScrollPager className="flex-1 min-h-0 sm:p-4 overflow-hidden" contentClassName="p-2 space-y-3">
        {/* Horizontal Selectable Carousel */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 no-scrollbar select-none">
          {filteredShlokas.map((s, idx) => (
            <button
              key={s.id || idx}
              type="button"
              onClick={() => {
                setSelectedShlokaIndex(idx);
                if (isSpeaking) {
                  umaVoice.stop();
                  setIsSpeaking(false);
                }
              }}
              className={`shrink-0 px-3 py-2 rounded-xl border text-left transition flex flex-col justify-between max-w-[180px] cursor-pointer ${
                selectedShlokaIndex === idx
                  ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white border-amber-800 shadow-sm font-black'
                  : 'bg-[#FFFDF9] text-[#5C3A21] border-[#E2D2BE] hover:bg-[#FFEEC9]'
              }`}
            >
              <span className="text-[10px] font-bold opacity-80 uppercase">
                अध्याय {s.chapter}
              </span>
              <span className="text-xs font-black truncate mt-0.5">श्लोक {s.verse}</span>
            </button>
          ))}
        </div>

        {currentShloka ? (
          <div className="space-y-3">
            {/* Active Shloka Card */}
            <div className="bg-[#FFFDF9] border-2 border-amber-300 rounded-2xl p-3.5 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-amber-100 text-[#8C4A00] font-black text-xs border border-amber-300">
                    अध्याय {currentShloka.chapter} • श्लोक {currentShloka.verse}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setPosterData({
                        title: 'श्रीमद्भगवद्गीता दिव्य श्लोक',
                        reference: `अध्याय ${currentShloka.chapter} • श्लोक ${currentShloka.verse}`,
                        sanskrit: currentShloka.sanskrit,
                        meaning: `${currentShloka.localizedMeaning}${
                          currentShloka.localizedReflection ? `\n\nजीवन सूत्र: ${currentShloka.localizedReflection}` : ''
                        }`,
                        speaker: 'भगवान श्री कृष्ण',
                        accentTag: '🪈 श्रीमद्भगवद्गीता उपदेश',
                      })
                    }
                    style={{ backgroundColor: '#6E1409', color: '#FFFFFF' }}
                    className="px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                    title="HD स्टेटस कार्ड बनाएं"
                  >
                    <span>📸 स्टेटस कार्ड</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCopy(`gita_${currentShloka.id}`, currentShloka.sanskrit, currentShloka.localizedMeaning)}
                    className="p-1.5 rounded-lg bg-amber-50 text-[#8C6239] hover:bg-amber-100 transition cursor-pointer"
                    title="प्रतिलिपि"
                  >
                    {copiedId === `gita_${currentShloka.id}` ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleShare(currentShloka)}
                    className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800 hover:bg-emerald-200 transition cursor-pointer"
                    title="व्हाट्सएप साझा करें"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleBookmark(`gita_${currentShloka.id}`)}
                    className={`p-1.5 rounded-lg transition cursor-pointer ${
                      bookmarks[`gita_${currentShloka.id}`]
                        ? 'bg-amber-500 text-stone-950 font-black'
                        : 'bg-amber-50 text-[#8C6239] hover:bg-amber-100'
                    }`}
                  >
                    <Bookmark className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Sanskrit Text */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#FFF8EE] to-[#FBE8C8] border border-amber-300 text-center">
                <div className="text-[10px] font-black text-[#B56A00] uppercase tracking-wider mb-1">
                  ॥ श्री भगवानुवाच ॥
                </div>
                <p
                  className={`font-granth font-black text-[#462B17] leading-relaxed whitespace-pre-line ${
                    fontSize === 'sm' ? 'text-xs' : fontSize === 'lg' ? 'text-base sm:text-lg' : 'text-sm sm:text-base'
                  }`}
                >
                  {currentShloka.sanskrit}
                </p>
                <div className="mt-2 pt-2 border-t border-amber-400/40 text-xs text-[#5C3A21]">
                  <span className="font-black text-[#B56A00] text-[10px] uppercase tracking-wider">
                    🔱 पदच्छेद (सरल उच्चारण):{' '}
                  </span>
                  <span className="font-semibold">{formatPadacchedaGuide(currentShloka.sanskrit)}</span>
                </div>
                {currentShloka.transliteration && (
                  <p className="text-[11px] text-[#8C6239] mt-1.5 italic font-mono">
                    {currentShloka.transliteration}
                  </p>
                )}
              </div>

              {/* Hindi Meaning */}
              <div className="p-3 rounded-xl bg-white border border-amber-200 text-xs text-[#3E2714]">
                <div className="text-[10px] font-bold text-[#8C6239] uppercase tracking-wider mb-0.5">
                  हिंदी भावार्थ:
                </div>
                <p className="leading-relaxed text-[11px] sm:text-xs font-medium">
                  {currentShloka.localizedMeaning}
                </p>
              </div>

              {/* Divine Reflection */}
              {currentShloka.localizedReflection && (
                <div className="p-2.5 rounded-xl bg-amber-100/70 border border-amber-300 text-xs text-[#5C3A21]">
                  <div className="font-bold flex items-center gap-1 text-[11px] text-[#B56A00]">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>जीवन सूत्र व दिव्य संदेश:</span>
                  </div>
                  <p className="text-[#3E2714] text-[11px] mt-0.5 font-medium leading-relaxed">
                    {currentShloka.localizedReflection}
                  </p>
                </div>
              )}
            </div>

            {/* Bottom Section Controls */}
            <div className="flex items-center justify-between pt-2 pb-1 border-t border-amber-200/60">
              <button
                type="button"
                onClick={() => {
                  if (selectedShlokaIndex > 0) {
                    setSelectedShlokaIndex(selectedShlokaIndex - 1);
                  } else if (onPrevChapter) {
                    onPrevChapter();
                  }
                }}
                className="px-3 py-1.5 rounded-xl bg-[#FFFDF9] border border-[#E2D2BE] text-xs font-bold text-[#5C3A21] flex items-center gap-1 hover:bg-[#FFEEC9] cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>पिछला श्लोक</span>
              </button>

              <button
                type="button"
                onClick={() => setIsTocOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-amber-100 text-[#8C4A00] text-xs font-black border border-amber-300 hover:bg-amber-200 cursor-pointer"
              >
                श्लोक सूचकांक
              </button>

              <button
                type="button"
                onClick={() => {
                  if (selectedShlokaIndex < filteredShlokas.length - 1) {
                    setSelectedShlokaIndex(selectedShlokaIndex + 1);
                  } else if (onNextChapter) {
                    onNextChapter();
                  }
                }}
                className="px-3 py-1.5 rounded-xl bg-[#5C3A21] text-[#FFF6E5] text-xs font-bold flex items-center gap-1 hover:bg-[#462B17] cursor-pointer"
              >
                <span>अगला श्लोक</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-10 text-xs text-[#8C6239]">
            कोई श्लोक प्राप्त नहीं हुआ। कृपया खोज शब्द बदलें।
          </div>
        )}
      </ZeroScrollPager>

      {/* Floating Sticky Audio Player Bar when speaking */}
      {isSpeaking && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-md bg-stone-900/95 backdrop-blur-md text-amber-100 p-2.5 rounded-2xl border-2 border-amber-500 shadow-2xl flex items-center justify-between gap-2 animate-in slide-in-from-bottom-3 duration-200">
          <div className="min-w-0 flex-1 flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-400/50 flex items-center justify-center shrink-0">
              <Volume2 className="w-4 h-4 text-amber-400 animate-pulse" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-bold text-amber-300 truncate">
                गीतोपदेश वाचन चालू
              </div>
              <div className="text-[10px] text-amber-200/80 truncate">
                अध्याय {currentShloka?.chapter} • श्लोक {currentShloka?.verse} ({selectedShlokaIndex + 1}/{filteredShlokas.length})
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                if (selectedShlokaIndex > 0) {
                  speakShlokaFromIndex(selectedShlokaIndex - 1);
                }
              }}
              disabled={selectedShlokaIndex === 0}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 text-amber-200 cursor-pointer"
              title="पिछला श्लोक"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={stopAllSpeech}
              className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1 shadow-md cursor-pointer"
              title="पाठ बंद करें"
            >
              <VolumeX className="w-4 h-4" />
              <span>रुकें</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (selectedShlokaIndex < filteredShlokas.length - 1) {
                  speakShlokaFromIndex(selectedShlokaIndex + 1);
                }
              }}
              disabled={selectedShlokaIndex === filteredShlokas.length - 1}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 text-amber-200 cursor-pointer"
              title="अगला श्लोक"
            >
              <ChevronRight className="w-4 h-4" />
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

export default DailyGitaShlokaView;
