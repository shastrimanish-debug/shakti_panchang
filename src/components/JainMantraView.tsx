import React, { useState, useMemo, useEffect } from 'react';
import {
  JAIN_MANTRAS,
  JAIN_MANTRA_CATEGORIES,
  JainMantra,
} from '../data/jainMantras';
import {
  Search,
  Sparkles,
  Volume2,
  VolumeX,
  Share2,
  Copy,
  Check,
  Bookmark,
  BookmarkCheck,
  ChevronRight,
  ChevronLeft,
  BookOpen,
  Award,
  RotateCcw,
  Flame,
  X,
  Compass,
  Clock,
  Shirt,
  ShieldCheck,
  Zap,
  CircleDot,
  Gift,
} from 'lucide-react';
import { speakUma, stopUmaSpeech } from '../lib/umaSpeech';
import { ZeroScrollPager } from './ZeroScrollPager';

interface JainMantraViewProps {
  onBackToPanchang?: () => void;
}

export const JainMantraView: React.FC<JainMantraViewProps> = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('सभी 100 मंत्र');
  const [activeMantraIndex, setActiveMantraIndex] = useState(0);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [speakingId, setSpeakingId] = useState<number | null>(null);
  const [bookmarks, setBookmarks] = useState<Record<number, boolean>>(() => {
    try {
      const saved = localStorage.getItem('shakti_jain_mantra_bookmarks_v1');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Japa Mala Counter state for current active mantra
  const [japaCount, setJapaCount] = useState(0);
  const [japaMalaCount, setJapaMalaCount] = useState(0);

  // Save bookmarks
  useEffect(() => {
    try {
      localStorage.setItem('shakti_jain_mantra_bookmarks_v1', JSON.stringify(bookmarks));
    } catch {
      // Ignore
    }
  }, [bookmarks]);

  const toggleBookmark = (id: number) => {
    setBookmarks((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Filter mantras
  const filteredMantras = useMemo(() => {
    return JAIN_MANTRAS.filter((m) => {
      const matchesCategory =
        selectedCategory === 'सभी 100 मंत्र' || m.category === selectedCategory;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        m.title.toLowerCase().includes(q) ||
        m.mantra.toLowerCase().includes(q) ||
        m.vidhi.toLowerCase().includes(q) ||
        m.phala.toLowerCase().includes(q) ||
        `मंत्र ${m.id}`.includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  // Ensure active index is within bounds
  const currentMantra: JainMantra | undefined = filteredMantras[activeMantraIndex] || filteredMantras[0];

  useEffect(() => {
    setActiveMantraIndex(0);
    setJapaCount(0);
    setJapaMalaCount(0);
  }, [selectedCategory, searchQuery]);

  const handleSpeech = (mantra: JainMantra) => {
    if (speakingId === mantra.id) {
      stopUmaSpeech();
      setSpeakingId(null);
      return;
    }
    stopUmaSpeech();
    setSpeakingId(mantra.id);
    const speechText = `${mantra.title}। मंत्र: ${mantra.mantra}। आवश्यक जाप संख्या: ${mantra.japSankhya}। माला: ${mantra.mala}। साधना विधि: ${mantra.vidhi}। फल: ${mantra.phala}`;
    speakUma(speechText, {
      onEnd: () => setSpeakingId(null),
      onError: () => setSpeakingId(null),
    });
  };

  const handleCopy = (mantra: JainMantra) => {
    const txt = `॥ ${mantra.title} ॥\n\nमंत्र:\n${mantra.mantra}\n\nजाप संख्या: ${mantra.japSankhya}\nमाला: ${mantra.mala}\nदिशा व समय: ${mantra.disha}, ${mantra.samay}\nवस्त्र: ${mantra.vastra}\n\nसम्पूर्ण साधना विधि:\n${mantra.vidhi}\n\nचमत्कारिक फल:\n${mantra.phala}\n\n— सनातन शक्ति पंचांग (100 जैन मंत्र संग्रह)`;
    navigator.clipboard.writeText(txt);
    setCopiedId(mantra.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleShare = (mantra: JainMantra) => {
    const txt = `*॥ ${mantra.title} ॥*\n\n*मंत्र:*\n${mantra.mantra}\n\n*जाप संख्या:* ${mantra.japSankhya}\n*माला:* ${mantra.mala}\n*दिशा:* ${mantra.disha} | *समय:* ${mantra.samay}\n*वस्त्र:* ${mantra.vastra}\n\n*सम्पूर्ण साधना विधि:*\n${mantra.vidhi}\n\n*चमत्कारिक फल:*\n${mantra.phala}\n\n_सनातन शक्ति पंचांग_`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(txt)}`;
    window.open(url, '_blank');
  };

  const incrementJapa = () => {
    setJapaCount((prev) => {
      const next = prev + 1;
      if (next >= 108) {
        setJapaMalaCount((m) => m + 1);
        return 0;
      }
      return next;
    });
  };

  return (
    <div className="flex-1 min-h-0 w-full flex flex-col bg-[#FCF8EC] text-[#3E2714] relative overflow-hidden font-sans">
      {/* Top Banner Header */}
      <div className="p-3 sm:p-4 bg-gradient-to-r from-[#5C3A21] via-[#462B17] to-[#5C3A21] text-[#FAF2E4] border-b-2 border-[#B56A00] shadow-md shrink-0">
        <div className="flex flex-wrap items-center justify-between gap-2 max-w-5xl mx-auto">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#B56A00] to-[#8B1E1E] border-2 border-[#FFD88A] flex items-center justify-center text-[#FFD88A] font-black text-lg shadow-md shrink-0">
              ☸
            </div>
            <div>
              <h2 className="font-granth font-bold text-base sm:text-lg text-[#FAF2E4] flex items-center gap-2">
                <span>100 चमत्कारिक जैन मंत्र व संपूर्ण साधना विधि</span>
                <span className="text-[10px] bg-[#B56A00] text-white px-2 py-0.5 rounded-full font-black">
                  100/100
                </span>
              </h2>
              <p className="text-[11px] text-[#FFD88A]">
                नवकार महामंत्र • भक्तामर 48 ऋद्धि-सिद्धि • पार्श्वनाथ, पद्मावती व 100 प्रामाणिक साधनाएं
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#FFD88A] bg-[#2C180C]/80 px-3 py-1 rounded-lg border border-[#B56A00]/50">
              कुल उपलब्ध: {filteredMantras.length} मंत्र
            </span>
          </div>
        </div>
      </div>

      {/* Zero Scroll Container for smooth layout */}
      <ZeroScrollPager className="flex-1 min-h-0 overflow-hidden sm:p-4" contentClassName="p-2 sm:p-3 space-y-3">
        <div className="max-w-5xl mx-auto space-y-3">
          {/* Search Bar & Category Selector */}
          <div className="bg-[#FAF2E4] border border-[#8C6239]/40 rounded-xl p-3 shadow-xs space-y-2.5">
            <div className="relative">
              <Search className="w-4 h-4 text-[#8C6239] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="मंत्र, विधि, फल या मंत्र संख्या खोजें (जैसे: नवकार, पद्मावती, ऋद्धि, लक्ष्मी, 59...)"
                className="w-full pl-9 pr-8 py-2 bg-[#FFFDF8] border border-[#8C6239]/40 rounded-lg text-xs sm:text-sm text-[#3E2714] placeholder-[#8C6239]/60 focus:outline-hidden focus:ring-2 focus:ring-[#B56A00]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8C6239] hover:text-[#5C3A21]"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar select-none">
              {JAIN_MANTRA_CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition cursor-pointer shrink-0 ${
                      isSelected
                        ? 'bg-[#5C3A21] text-[#FFD88A] shadow-xs border border-[#B56A00]'
                        : 'bg-[#F4E8D1] text-[#5C3A21] hover:bg-[#E5D2B8] border border-[#8C6239]/30'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Jump List & Active Card View */}
          {filteredMantras.length === 0 ? (
            <div className="p-8 text-center bg-[#FAF2E4] border border-[#8C6239]/40 rounded-xl space-y-2">
              <p className="text-sm font-bold text-[#5C3A21]">कोई मंत्र नहीं मिला।</p>
              <p className="text-xs text-[#735133]">कृपया खोज शब्द बदलें या श्रेणी चयन बदलें।</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
              {/* Left Column: List of Filtered Mantras (Scrollable list with badges) */}
              <div className="lg:col-span-4 bg-[#FAF2E4] border border-[#8C6239]/40 rounded-xl p-2.5 shadow-xs max-h-[280px] lg:max-h-[580px] overflow-y-auto space-y-1.5">
                <div className="text-xs font-bold text-[#8C6239] border-b border-[#8C6239]/20 pb-1.5 px-1 flex items-center justify-between">
                  <span>मंत्र सूची (१ से १००)</span>
                  <span className="text-[10px] text-[#B56A00] font-black">
                    {activeMantraIndex + 1} / {filteredMantras.length}
                  </span>
                </div>

                {filteredMantras.map((m, idx) => {
                  const isActive = currentMantra?.id === m.id;
                  const isBookmarked = !!bookmarks[m.id];
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        setActiveMantraIndex(idx);
                        setJapaCount(0);
                        setJapaMalaCount(0);
                      }}
                      className={`w-full text-left p-2.5 rounded-lg border transition flex items-center justify-between gap-2 cursor-pointer ${
                        isActive
                          ? 'bg-[#5C3A21] text-[#FAF2E4] border-[#B56A00] shadow-xs'
                          : 'bg-[#F4E8D1]/60 hover:bg-[#F4E8D1] text-[#5C3A21] border-[#8C6239]/30'
                      }`}
                    >
                      <div className="min-w-0 flex items-center gap-2">
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                            isActive
                              ? 'bg-[#B56A00] text-white'
                              : 'bg-[#8C6239]/20 text-[#5C3A21]'
                          }`}
                        >
                          {m.id}
                        </span>
                        <div className="truncate">
                          <div className="font-bold text-xs truncate">{m.title}</div>
                          <div className={`text-[10px] truncate ${isActive ? 'text-[#FFD88A]' : 'text-[#735133]'}`}>
                            {m.category}
                          </div>
                        </div>
                      </div>

                      {isBookmarked && (
                        <BookmarkCheck className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[#FFD88A]' : 'text-[#B56A00]'}`} />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Right Column: Active Mantra Detailed Card & Japa Counter */}
              {currentMantra && (
                <div className="lg:col-span-8 space-y-3.5">
                  {/* Detailed Mantra Display Card */}
                  <div className="bg-[#FAF2E4] border-2 border-[#B56A00]/60 rounded-2xl p-4 sm:p-5 shadow-md space-y-4 relative">
                    {/* Card Top Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#8C6239]/30 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 bg-[#B56A00] text-white rounded-md font-black text-xs">
                          मंत्र #{currentMantra.id}
                        </span>
                        <span className="px-2.5 py-1 bg-[#F4E8D1] text-[#5C3A21] rounded-md font-bold text-xs border border-[#8C6239]/30">
                          {currentMantra.category}
                        </span>
                      </div>

                      {/* Action Icon Controls */}
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleSpeech(currentMantra)}
                          className={`p-2 rounded-lg border transition cursor-pointer ${
                            speakingId === currentMantra.id
                              ? 'bg-[#8B1E1E] text-white border-[#8B1E1E] animate-pulse'
                              : 'bg-[#F4E8D1] hover:bg-[#E5D2B8] text-[#5C3A21] border-[#8C6239]/40'
                          }`}
                          title={speakingId === currentMantra.id ? 'ऑडियो रोकें' : 'मंत्र व विधि सुनें'}
                        >
                          {speakingId === currentMantra.id ? (
                            <VolumeX className="w-4 h-4" />
                          ) : (
                            <Volume2 className="w-4 h-4" />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleCopy(currentMantra)}
                          className="p-2 bg-[#F4E8D1] hover:bg-[#E5D2B8] text-[#5C3A21] border border-[#8C6239]/40 rounded-lg transition cursor-pointer"
                          title="मंत्र एवं विधि कॉपी करें"
                        >
                          {copiedId === currentMantra.id ? (
                            <Check className="w-4 h-4 text-emerald-700" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleShare(currentMantra)}
                          className="p-2 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-lg shadow-xs transition cursor-pointer"
                          title="व्हाट्सएप पर शेयर करें"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => toggleBookmark(currentMantra.id)}
                          className={`p-2 rounded-lg border transition cursor-pointer ${
                            bookmarks[currentMantra.id]
                              ? 'bg-[#B56A00] text-white border-[#B56A00]'
                              : 'bg-[#F4E8D1] hover:bg-[#E5D2B8] text-[#5C3A21] border-[#8C6239]/40'
                          }`}
                          title="पसंदीदा में जोड़ें/हटाएं"
                        >
                          {bookmarks[currentMantra.id] ? (
                            <BookmarkCheck className="w-4 h-4 text-white" />
                          ) : (
                            <Bookmark className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Title & Beej / Riddhi */}
                    <div className="space-y-1">
                      <h3 className="font-bold font-granth text-lg sm:text-xl text-[#5C3A21] flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-[#B56A00] shrink-0" />
                        <span>{currentMantra.title}</span>
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 pt-0.5">
                        {currentMantra.beej && (
                          <span className="px-2.5 py-0.5 bg-[#5C3A21] text-[#FFD88A] rounded-full text-[11px] font-bold border border-[#B56A00]/50 flex items-center gap-1">
                            <Zap className="w-3 h-3 text-amber-300" />
                            बीज मंत्र: {currentMantra.beej}
                          </span>
                        )}
                        {currentMantra.riddhi && (
                          <span className="px-2.5 py-0.5 bg-[#8B1E1E]/10 text-[#8B1E1E] rounded-full text-[11px] font-bold border border-[#8B1E1E]/30">
                            ऋद्धि: {currentMantra.riddhi}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Mantra Main Box */}
                    <div className="p-4 bg-[#FFFBF2] border-2 border-[#B56A00]/50 rounded-xl shadow-inner text-center space-y-2">
                      <div className="text-[10px] font-black text-[#8C6239] uppercase tracking-wider">
                        ॥ पावन चमत्कारिक जैन मंत्र ॥
                      </div>
                      <div className="font-granth font-bold text-base sm:text-xl text-[#3E2714] leading-relaxed whitespace-pre-line selection:bg-[#B56A00] selection:text-white">
                        {currentMantra.mantra}
                      </div>
                    </div>

                    {/* Structured Mantra Details Grid (जाप संख्या, माला, दिशा, समय, वस्त्र, नैवेद्य, नियम) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {/* Jap Count */}
                      <div className="p-2.5 bg-[#F4E8D1] border border-[#8C6239]/30 rounded-xl space-y-0.5">
                        <div className="text-[11px] font-bold text-[#8C6239] flex items-center gap-1.5">
                          <Flame className="w-3.5 h-3.5 text-[#B56A00]" />
                          <span>आवश्यक जाप संख्या:</span>
                        </div>
                        <div className="text-xs font-black text-[#5C3A21]">{currentMantra.japSankhya}</div>
                      </div>

                      {/* Mala */}
                      <div className="p-2.5 bg-[#F4E8D1] border border-[#8C6239]/30 rounded-xl space-y-0.5">
                        <div className="text-[11px] font-bold text-[#8C6239] flex items-center gap-1.5">
                          <CircleDot className="w-3.5 h-3.5 text-[#B56A00]" />
                          <span>उपयुक्त जप माला:</span>
                        </div>
                        <div className="text-xs font-bold text-[#5C3A21]">{currentMantra.mala}</div>
                      </div>

                      {/* Disha */}
                      <div className="p-2.5 bg-[#F4E8D1] border border-[#8C6239]/30 rounded-xl space-y-0.5">
                        <div className="text-[11px] font-bold text-[#8C6239] flex items-center gap-1.5">
                          <Compass className="w-3.5 h-3.5 text-[#B56A00]" />
                          <span>साधना दिशा:</span>
                        </div>
                        <div className="text-xs font-bold text-[#5C3A21]">{currentMantra.disha}</div>
                      </div>

                      {/* Samay */}
                      <div className="p-2.5 bg-[#F4E8D1] border border-[#8C6239]/30 rounded-xl space-y-0.5">
                        <div className="text-[11px] font-bold text-[#8C6239] flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-[#B56A00]" />
                          <span>शुभ समय:</span>
                        </div>
                        <div className="text-xs font-bold text-[#5C3A21]">{currentMantra.samay}</div>
                      </div>

                      {/* Vastra */}
                      <div className="p-2.5 bg-[#F4E8D1] border border-[#8C6239]/30 rounded-xl space-y-0.5">
                        <div className="text-[11px] font-bold text-[#8C6239] flex items-center gap-1.5">
                          <Shirt className="w-3.5 h-3.5 text-[#B56A00]" />
                          <span>वस्त्र व आसन:</span>
                        </div>
                        <div className="text-xs font-bold text-[#5C3A21]">{currentMantra.vastra}</div>
                      </div>

                      {/* Naivedya */}
                      <div className="p-2.5 bg-[#F4E8D1] border border-[#8C6239]/30 rounded-xl space-y-0.5">
                        <div className="text-[11px] font-bold text-[#8C6239] flex items-center gap-1.5">
                          <Gift className="w-3.5 h-3.5 text-[#B56A00]" />
                          <span>भोग व नैवेद्य:</span>
                        </div>
                        <div className="text-xs font-bold text-[#5C3A21]">{currentMantra.naivedya}</div>
                      </div>
                    </div>

                    {/* Niyam */}
                    <div className="p-3 bg-[#FAF2E4] border border-[#B56A00]/40 rounded-xl space-y-1">
                      <div className="text-xs font-bold text-[#8B1E1E] flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-[#8B1E1E]" />
                        <span>साधना नियम व परहेज:</span>
                      </div>
                      <p className="text-xs text-[#5C3A21] font-semibold">{currentMantra.niyam}</p>
                    </div>

                    {/* Step-by-Step Vidhi (सम्पूर्ण साधना विधि) */}
                    <div className="p-3.5 bg-[#F4E8D1]/80 border border-[#8C6239]/40 rounded-xl space-y-1.5 text-xs">
                      <div className="font-bold text-[#5C3A21] flex items-center gap-1.5 border-b border-[#8C6239]/20 pb-1">
                        <BookOpen className="w-4 h-4 text-[#B56A00]" />
                        <span>सम्पूर्ण चरणबद्ध साधना विधि:</span>
                      </div>
                      <p className="text-[#3E2714] leading-relaxed font-medium whitespace-pre-line">
                        {currentMantra.vidhi}
                      </p>
                    </div>

                    {/* Cham चमत्कारिक फल (Phala) */}
                    <div className="p-3.5 bg-[#FFF9EE] border border-[#B56A00]/40 rounded-xl space-y-1.5 text-xs">
                      <div className="font-bold text-[#8B1E1E] flex items-center gap-1.5 border-b border-[#B56A00]/20 pb-1">
                        <Award className="w-4 h-4 text-[#B56A00]" />
                        <span>चमत्कारिक फल एवं लाभ (Phala):</span>
                      </div>
                      <p className="text-[#5C3A21] leading-relaxed font-semibold">
                        {currentMantra.phala}
                      </p>
                    </div>

                    {/* Integrated Digital Japa Counter (जाप काउंटर) */}
                    <div className="p-3.5 bg-gradient-to-r from-[#5C3A21] to-[#462B17] text-[#FAF2E4] rounded-xl border border-[#B56A00] shadow-xs flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={incrementJapa}
                          className="w-14 h-14 rounded-full bg-gradient-to-br from-[#B56A00] to-[#8B1E1E] text-white border-2 border-[#FFD88A] flex flex-col items-center justify-center shadow-md cursor-pointer active:scale-90 transition"
                          title="जाप गिनने के लिए टैप करें"
                        >
                          <Flame className="w-4 h-4 text-[#FFD88A]" />
                          <span className="font-black text-xs">जाप</span>
                        </button>
                        <div>
                          <div className="text-[11px] text-[#FFD88A] font-bold">108 डिजिटल जाप माला</div>
                          <div className="font-black text-xl font-granth text-white">
                            {japaCount} <span className="text-xs text-[#FFD88A]">/ 108 मनके</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-[10px] text-[#FFD88A]">पूर्ण माला संख्या:</div>
                          <div className="font-black text-base text-amber-300">{japaMalaCount} माला</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setJapaCount(0);
                            setJapaMalaCount(0);
                          }}
                          className="p-1.5 bg-[#FAF2E4]/20 hover:bg-[#FAF2E4]/30 text-white rounded-lg transition cursor-pointer"
                          title="जाप काउंटर रीसेट करें"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Navigation Buttons for Next/Previous Mantra */}
                    <div className="flex items-center justify-between pt-2 border-t border-[#8C6239]/20">
                      <button
                        type="button"
                        disabled={activeMantraIndex === 0}
                        onClick={() => {
                          setActiveMantraIndex((prev) => Math.max(0, prev - 1));
                          setJapaCount(0);
                          setJapaMalaCount(0);
                        }}
                        className="px-3 py-1.5 bg-[#F4E8D1] hover:bg-[#E5D2B8] disabled:opacity-40 text-[#5C3A21] border border-[#8C6239]/40 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span>पिछला मंत्र</span>
                      </button>

                      <div className="text-xs font-bold text-[#8C6239]">
                        {activeMantraIndex + 1} / {filteredMantras.length}
                      </div>

                      <button
                        type="button"
                        disabled={activeMantraIndex >= filteredMantras.length - 1}
                        onClick={() => {
                          setActiveMantraIndex((prev) => Math.min(filteredMantras.length - 1, prev + 1));
                          setJapaCount(0);
                          setJapaMalaCount(0);
                        }}
                        className="px-3 py-1.5 bg-[#5C3A21] hover:bg-[#462B17] disabled:opacity-40 text-[#FAF2E4] rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                      >
                        <span>अगला मंत्र</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </ZeroScrollPager>
    </div>
  );
};
