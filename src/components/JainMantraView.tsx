import React, { useState, useMemo, useEffect } from 'react';
import {
  JAIN_ALL,
  JAIN_MANTRAS,
  JAIN_MANTRA_CATEGORIES,
  JainMantra,
} from '../data/jainMantras';
import { shareTextContent } from '../lib/shareHelper';
import { useLanguage } from '../i18n';
import { trVedic } from '../i18n/vedicTranslate';
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
import { ShlokaPosterModal, ShlokaPosterData } from './ShlokaPosterModal';

interface JainMantraViewProps {
  onBackToPanchang?: () => void;
}

const JAIN_CAT_MAP: Record<string, { en: string; gu: string }> = {
  [JAIN_ALL]: { en: `All ${JAIN_MANTRAS.length} Paths`, gu: `બધા ${JAIN_MANTRAS.length} પાઠ` },
  'णमोकार महामंत्र': { en: 'Namokar Mahamantra', gu: 'ણમોકાર મહામંત્ર' },
  'उवसग्गहरं सूत्र': { en: 'Uvasaggaharam Sutra', gu: 'ઉવસગ્ગહરં સૂત્ર' },
  'लोगस्स / चतुर्विंशति-स्तव': { en: 'Logassa / Chaturvimshati-Stava', gu: 'લોગસ્સ / ચતુર્વિંશતિ-સ્તવ' },
  'जैन सूत्र / मंगल-पाठ': { en: 'Jain Sutra / Mangal Path', gu: 'જૈન સૂત્ર / મંગલ-પાઠ' },
  'तीर्थंकर नाम-स्मरण': { en: 'Tirthankara Nama-Smaran', gu: 'તીર્થંકર નામ-સ્મરણ' },
  'मौलिक जैन भाव-स्मरण': { en: 'Jain Bhava-Smaran', gu: 'મૌલિક જૈન ભાવ-સ્મરણ' },
};

function trJainCat(cat: string, cLang: string): string {
  if (cLang === 'en') return JAIN_CAT_MAP[cat]?.en || trVedic(cat, 'en');
  if (cLang === 'gu') return JAIN_CAT_MAP[cat]?.gu || trVedic(cat, 'gu');
  return cat;
}

export const JainMantraView: React.FC<JainMantraViewProps> = () => {
  const { language } = useLanguage();
  const cLang = (language || 'hi').slice(0, 2).toLowerCase();
  const L = <T,>(hi: T, en: T, gu: T): T => (cLang === 'en' ? en : cLang === 'gu' ? gu : hi);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(JAIN_ALL);
  const [activeMantraIndex, setActiveMantraIndex] = useState(0);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [posterData, setPosterData] = useState<ShlokaPosterData | null>(null);
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
        selectedCategory === JAIN_ALL || m.category === selectedCategory;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        m.title.toLowerCase().includes(q) ||
        m.mantra.toLowerCase().includes(q) ||
        m.vidhi.toLowerCase().includes(q) ||
        m.phala.toLowerCase().includes(q) ||
        `मंत्र ${m.id}`.includes(q) ||
        `mantra ${m.id}`.includes(q);
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
    const speechText = L(
      `${mantra.title}। मंत्र: ${mantra.mantra}। आवश्यक जाप संख्या: ${mantra.japSankhya}। माला: ${mantra.mala}। साधना विधि: ${mantra.vidhi}। फल: ${mantra.phala}`,
      `${mantra.title}. Mantra: ${mantra.mantra}. Required Japa count: ${mantra.japSankhya}. Deity: ${mantra.mala}. Method: ${mantra.vidhi}. Benefit: ${mantra.phala}`,
      `${mantra.title}. મંત્ર: ${mantra.mantra}. આવશ્યક જપ સંખ્યા: ${mantra.japSankhya}. દેવ: ${mantra.mala}. સાધના વિધિ: ${mantra.vidhi}. ફળ: ${mantra.phala}`
    );
    speakUma(speechText, {
      voiceStyle: 'uma',
      raga: 'bhairav',
      onEnd: () => setSpeakingId(null),
      onError: () => setSpeakingId(null),
    });
  };

  const handleCopy = (mantra: JainMantra) => {
    const txt = `॥ ${mantra.title} ॥\n\n${L('पाठ:', 'Path:', 'પાઠ:')}\n${mantra.mantra}\n\n${L('जाप संख्या:', 'Japa Count:', 'જપ સંખ્યા:')} ${mantra.japSankhya}\n${L('देव:', 'Deity:', 'દેવ:')} ${mantra.mala}\n${L('परंपरा:', 'Tradition:', 'પરંપરા:')} ${mantra.disha}\n${L('समय:', 'Time:', 'સમય:')} ${mantra.samay}\n${L('प्रकार:', 'Type:', 'પ્રકાર:')} ${mantra.vastra}\n\n${L('विधि:', 'Method:', 'વિધિ:')}\n${mantra.vidhi}\n\n${L('भाव:', 'Essence:', 'ભાવ:')}\n${mantra.phala}\n\n${mantra.niyam}\n\n— ${L('शक्ति पंचांग', 'Shakti Panchang', 'શક્તિ પંચાંગ')}`;
    navigator.clipboard.writeText(txt);
    setCopiedId(mantra.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleShare = async (mantra: JainMantra) => {
    const txt = `*॥ ${mantra.title} ॥*\n\n*${L('पाठ:', 'Path:', 'પાઠ:')}*\n${mantra.mantra}\n\n*${L('जाप संख्या:', 'Japa Count:', 'જપ સંખ્યા:')}* ${mantra.japSankhya}\n*${L('देव:', 'Deity:', 'દેવ:')}* ${mantra.mala}\n*${L('समय:', 'Time:', 'સમય:')}* ${mantra.samay}\n\n*${L('विधि:', 'Method:', 'વિધિ:')}*\n${mantra.vidhi}\n\n*${L('भाव:', 'Essence:', 'ભાવ:')}*\n${mantra.phala}\n\n_${mantra.niyam}_\n_${L('शक्ति पंचांग', 'Shakti Panchang', 'શક્તિ પંચાંગ')}_`;

    await shareTextContent({
      title: mantra.title,
      text: txt,
    });
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
      <div
        className="p-3 sm:p-4 border-b-2 shadow-xs shrink-0"
        style={{ backgroundColor: '#FFF9EE', borderColor: '#D6B485', color: '#2A1004' }}
      >
        <div className="flex flex-wrap items-center justify-between gap-2 max-w-5xl mx-auto">
          <div className="flex items-center gap-2.5">
            <div
              className="w-10 h-10 rounded-full border-2 flex items-center justify-center font-black text-lg shadow-xs shrink-0"
              style={{ backgroundColor: '#6E1409', borderColor: '#D97706', color: '#FFD88A' }}
            >
              ☸
            </div>
            <div>
              <h2 className="font-granth font-bold text-base sm:text-lg flex items-center gap-2" style={{ color: '#6E1409' }}>
                <span>
                  {L(
                    '201 जैन पाठ, सूत्र और स्तोत्र',
                    '201 Jain Paths, Sutras & Stotras',
                    '૨૦૧ જૈન પાઠ, સૂત્ર અને સ્તોત્ર'
                  )}
                </span>
                <span className="text-[10px] bg-[#B56A00] text-white px-2 py-0.5 rounded-full font-black">
                  {JAIN_MANTRAS.length}
                </span>
              </h2>
              <p className="text-[11px] font-semibold" style={{ color: '#4A2511' }}>
                {L(
                  'णमोकार महामंत्र, कल्याण मंदिर स्तोत्र, भक्तामर स्तोत्र एवं भाव-स्मरण',
                  'Namokar Mahamantra, Kalyan Mandir Stotra, Bhaktamar Stotra & Sacred Remembrance',
                  'ણમોકાર મહામંત્ર, કલ્યાણ મંદિર સ્તોત્ર, ભક્તામર સ્તોત્ર અને ભાવ-સ્મરણ'
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className="text-xs font-bold px-3 py-1 rounded-lg border"
              style={{ backgroundColor: '#FFF2DC', color: '#4A1805', borderColor: '#C89656' }}
            >
              {selectedCategory === JAIN_ALL
                ? L(
                    `कुल ${JAIN_MANTRAS.length} पाठ उपलब्ध`,
                    `Total ${JAIN_MANTRAS.length} Paths Available`,
                    `કુલ ${JAIN_MANTRAS.length} પાઠ ઉપલબ્ધ`
                  )
                : L(
                    `श्रेणी परिणाम: ${filteredMantras.length} / ${JAIN_MANTRAS.length}`,
                    `Category Results: ${filteredMantras.length} / ${JAIN_MANTRAS.length}`,
                    `શ્રેણી પરિણામ: ${filteredMantras.length} / ${JAIN_MANTRAS.length}`
                  )}
            </span>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 min-h-0 w-full overflow-y-auto overscroll-contain p-2 sm:p-4">
        <div className="max-w-5xl mx-auto space-y-3.5 pb-16">
          {/* Search Bar & Category Selector */}
          <div className="bg-[#FAF2E4] border border-[#8C6239]/40 rounded-xl p-3 shadow-xs space-y-2.5">
            <div className="relative">
              <Search className="w-4 h-4 text-[#8C6239] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={L(
                  'मंत्र, विधि, फल या मंत्र संख्या खोजें (जैसे: नवकार, पद्मावती, ऋद्धि, लक्ष्मी, 59...)',
                  'Search mantra, method, benefit or number (e.g., Navkar, Padmavati, Riddhi, Lakshmi, 59)...',
                  'મંત્ર, વિધિ, ફળ અથવા મંત્ર સંખ્યા શોધો (જેમ કે: નવકાર, પદ્માવતી, ઋદ્ધિ, લક્ષ્મી, ૫૯)...'
                )}
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
                    {trJainCat(cat, cLang)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Jump List & Active Card View */}
          {filteredMantras.length === 0 ? (
            <div className="p-8 text-center bg-[#FAF2E4] border border-[#8C6239]/40 rounded-xl space-y-2">
              <p className="text-sm font-bold text-[#5C3A21]">
                {L('कोई मंत्र नहीं मिला।', 'No mantras found.', 'કોઈ મંત્ર મળ્યો નથી.')}
              </p>
              <p className="text-xs text-[#735133]">
                {L(
                  'कृपया खोज शब्द बदलें या श्रेणी चयन बदलें।',
                  'Please try another search term or category.',
                  'કૃપા કરીને શોધ શબ્દ અથવા શ્રેણી બદલો.'
                )}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
              {/* Left Column: List of Filtered Mantras */}
              <div className="lg:col-span-4 bg-[#FAF2E4] border border-[#8C6239]/40 rounded-xl p-2.5 shadow-xs max-h-[280px] lg:max-h-[580px] overflow-y-auto space-y-1.5">
                <div className="text-xs font-bold text-[#8C6239] border-b border-[#8C6239]/20 pb-1.5 px-1 flex items-center justify-between">
                  <span>{L(`पाठ सूची (${JAIN_MANTRAS.length})`, `Path List (${JAIN_MANTRAS.length})`, `પાઠ સૂચિ (${JAIN_MANTRAS.length})`)}</span>
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
                            {trJainCat(m.category, cLang)}
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
                          {L('मंत्र', 'Mantra', 'મંત્ર')} #{currentMantra.id}
                        </span>
                        <span className="px-2.5 py-1 bg-[#F4E8D1] text-[#5C3A21] rounded-md font-bold text-xs border border-[#8C6239]/30">
                          {trJainCat(currentMantra.category, cLang)}
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
                          title={
                            speakingId === currentMantra.id
                              ? L('ऑडियो रोकें', 'Stop Audio', 'ઓડિયો રોકો')
                              : L('मंत्र व विधि सुनें', 'Listen to Mantra & Vidhi', 'મંત્ર અને વિધિ સાંભળો')
                          }
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
                          title={L('मंत्र एवं विधि कॉपी करें', 'Copy Mantra & Method', 'મંત્ર અને વિધિ કૉપિ કરો')}
                        >
                          {copiedId === currentMantra.id ? (
                            <Check className="w-4 h-4 text-emerald-700" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setPosterData({
                              title: currentMantra.title,
                              reference: `${L('जैन पाठ', 'Jain Path', 'જૈન પાઠ')} #${currentMantra.id} • ${trJainCat(currentMantra.category, cLang)}`,
                              sanskrit: currentMantra.mantra,
                              meaning: `${currentMantra.phala}\n\n${L('विधि:', 'Method:', 'વિધિ:')} ${currentMantra.vidhi}`,
                              accentTag: L(
                                '☸ श्री जिनवाणी एवं जैन स्तोत्र',
                                '☸ Shri Jinavani & Jain Stotra',
                                '☸ શ્રી જિનવાણી અને જૈન સ્તોત્ર'
                              ),
                            })
                          }
                          style={{ backgroundColor: '#6E1409', color: '#FFFFFF' }}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer"
                          title={L('HD स्टेटस कार्ड बनाएं', 'Create HD Status Card', 'HD સ્ટેટસ કાર્ડ બનાવો')}
                        >
                          {L('📸 स्टेटस कार्ड', '📸 Status Card', '📸 સ્ટેટસ કાર્ડ')}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleShare(currentMantra)}
                          className="p-2 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-lg shadow-xs transition cursor-pointer"
                          title={L('व्हाट्सएप पर शेयर करें', 'Share on WhatsApp', 'WhatsApp પર શેર કરો')}
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
                          title={L('पसंदीदा में जोड़ें/हटाएं', 'Toggle Bookmark', 'મનપસંદમાં ઉમેરો/દૂર કરો')}
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
                            {L('बीज मंत्र:', 'Beej Mantra:', 'બીજ મંત્ર:')} {currentMantra.beej}
                          </span>
                        )}
                        {currentMantra.riddhi && (
                          <span className="px-2.5 py-0.5 bg-[#8B1E1E]/10 text-[#8B1E1E] rounded-full text-[11px] font-bold border border-[#8B1E1E]/30">
                            {L('ऋद्धि:', 'Riddhi:', 'ઋદ્ધિ:')} {currentMantra.riddhi}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Mantra Main Box */}
                    <div className="p-4 bg-[#FFFBF2] border-2 border-[#B56A00]/50 rounded-xl shadow-inner text-center space-y-2">
                      <div className="text-[10px] font-black text-[#8C6239] uppercase tracking-wider">
                        {L('॥ जैन पाठ ॥', '॥ JAIN PATH ॥', '॥ જૈન પાઠ ॥')}
                      </div>
                      <div className="font-granth font-bold text-base sm:text-xl text-[#3E2714] leading-relaxed whitespace-pre-line selection:bg-[#B56A00] selection:text-white">
                        {currentMantra.mantra}
                      </div>
                    </div>

                    {/* Structured Mantra Details Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div className="p-2.5 bg-[#F4E8D1] border border-[#8C6239]/30 rounded-xl space-y-0.5">
                        <div className="text-[11px] font-bold text-[#8C6239] flex items-center gap-1.5">
                          <Flame className="w-3.5 h-3.5 text-[#B56A00]" />
                          <span>{L('आवश्यक जाप संख्या:', 'Required Japa Count:', 'આવશ્યક જપ સંખ્યા:')}</span>
                        </div>
                        <div className="text-xs font-black text-[#5C3A21]">{currentMantra.japSankhya}</div>
                      </div>

                      <div className="p-2.5 bg-[#F4E8D1] border border-[#8C6239]/30 rounded-xl space-y-0.5">
                        <div className="text-[11px] font-bold text-[#8C6239] flex items-center gap-1.5">
                          <CircleDot className="w-3.5 h-3.5 text-[#B56A00]" />
                          <span>{L('देव / स्मरण:', 'Deity / Remembrance:', 'દેવ / સ્મરણ:')}</span>
                        </div>
                        <div className="text-xs font-bold text-[#5C3A21]">{currentMantra.mala}</div>
                      </div>

                      <div className="p-2.5 bg-[#F4E8D1] border border-[#8C6239]/30 rounded-xl space-y-0.5">
                        <div className="text-[11px] font-bold text-[#8C6239] flex items-center gap-1.5">
                          <Compass className="w-3.5 h-3.5 text-[#B56A00]" />
                          <span>{L('परंपरा:', 'Tradition:', 'પરંપરા:')}</span>
                        </div>
                        <div className="text-xs font-bold text-[#5C3A21]">{currentMantra.disha}</div>
                      </div>

                      <div className="p-2.5 bg-[#F4E8D1] border border-[#8C6239]/30 rounded-xl space-y-0.5">
                        <div className="text-[11px] font-bold text-[#8C6239] flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-[#B56A00]" />
                          <span>{L('शुभ समय:', 'Auspicious Time:', 'શુભ સમય:')}</span>
                        </div>
                        <div className="text-xs font-bold text-[#5C3A21]">{currentMantra.samay}</div>
                      </div>

                      <div className="p-2.5 bg-[#F4E8D1] border border-[#8C6239]/30 rounded-xl space-y-0.5">
                        <div className="text-[11px] font-bold text-[#8C6239] flex items-center gap-1.5">
                          <Shirt className="w-3.5 h-3.5 text-[#B56A00]" />
                          <span>{L('पाठ का प्रकार:', 'Path Type:', 'પાઠનો પ્રકાર:')}</span>
                        </div>
                        <div className="text-xs font-bold text-[#5C3A21]">{currentMantra.vastra}</div>
                      </div>

                      <div className="p-2.5 bg-[#F4E8D1] border border-[#8C6239]/30 rounded-xl space-y-0.5">
                        <div className="text-[11px] font-bold text-[#8C6239] flex items-center gap-1.5">
                          <Gift className="w-3.5 h-3.5 text-[#B56A00]" />
                          <span>{L('नैवेद्य:', 'Offering (Naivedya):', 'નૈવેદ્ય:')}</span>
                        </div>
                        <div className="text-xs font-bold text-[#5C3A21]">{currentMantra.naivedya}</div>
                      </div>
                    </div>

                    {/* Niyam */}
                    <div className="p-3 bg-[#FAF2E4] border border-[#B56A00]/40 rounded-xl space-y-1">
                      <div className="text-xs font-bold text-[#8B1E1E] flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-[#8B1E1E]" />
                        <span>{L('साधना नियम व परहेज:', 'Sadhana Rules & Discipline:', 'સાધના નિયમો અને પરેજી:')}</span>
                      </div>
                      <p className="text-xs text-[#5C3A21] font-semibold">{currentMantra.niyam}</p>
                    </div>

                    {/* Step-by-Step Vidhi */}
                    <div className="p-3.5 bg-[#F4E8D1]/80 border border-[#8C6239]/40 rounded-xl space-y-1.5 text-xs">
                      <div className="font-bold text-[#5C3A21] flex items-center gap-1.5 border-b border-[#8C6239]/20 pb-1">
                        <BookOpen className="w-4 h-4 text-[#B56A00]" />
                        <span>{L('सम्पूर्ण चरणबद्ध साधना विधि:', 'Complete Step-by-Step Sadhana Method:', 'સંપૂર્ણ ચરણબદ્ધ સાધના વિધિ:')}</span>
                      </div>
                      <p className="text-[#3E2714] leading-relaxed font-medium whitespace-pre-line">
                        {currentMantra.vidhi}
                      </p>
                    </div>

                    {/* Phala */}
                    <div className="p-3.5 bg-[#FFF9EE] border border-[#B56A00]/40 rounded-xl space-y-1.5 text-xs">
                      <div className="font-bold text-[#8B1E1E] flex items-center gap-1.5 border-b border-[#B56A00]/20 pb-1">
                        <Award className="w-4 h-4 text-[#B56A00]" />
                        <span>{L('भाव और अर्थ:', 'Meaning & Inner Essence:', 'ભાવ અને અર્થ:')}</span>
                      </div>
                      <p className="text-[#5C3A21] leading-relaxed font-semibold">
                        {currentMantra.phala}
                      </p>
                    </div>

                    {/* Integrated Digital Japa Counter */}
                    <div className="p-3.5 bg-gradient-to-r from-[#5C3A21] to-[#462B17] text-[#FAF2E4] rounded-xl border border-[#B56A00] shadow-xs flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={incrementJapa}
                          className="w-14 h-14 rounded-full bg-gradient-to-br from-[#B56A00] to-[#8B1E1E] text-white border-2 border-[#FFD88A] flex flex-col items-center justify-center shadow-md cursor-pointer active:scale-90 transition"
                          title={L('जाप गिनने के लिए टैप करें', 'Tap to count Japa', 'જપ ગણવા માટે ટેપ કરો')}
                        >
                          <Flame className="w-4 h-4 text-[#FFD88A]" />
                          <span className="font-black text-xs">{L('जाप', 'Japa', 'જપ')}</span>
                        </button>
                        <div>
                          <div className="text-[11px] text-[#FFD88A] font-bold">
                            {L('108 डिजिटल जाप माला', '108 Digital Japa Mala', '૧૦૮ ડિજિટલ જપ માળા')}
                          </div>
                          <div className="font-black text-xl font-granth text-white">
                            {japaCount} <span className="text-xs text-[#FFD88A]">/ 108 {L('मनके', 'Beads', 'મણકા')}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-[10px] text-[#FFD88A]">{L('पूर्ण माला संख्या:', 'Completed Malas:', 'પૂર્ણ માળા સંખ્યા:')}</div>
                          <div className="font-black text-base text-amber-300">
                            {japaMalaCount} {L('माला', 'Mala', 'માળા')}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setJapaCount(0);
                            setJapaMalaCount(0);
                          }}
                          className="p-1.5 bg-[#FAF2E4]/20 hover:bg-[#FAF2E4]/30 text-white rounded-lg transition cursor-pointer"
                          title={L('जाप काउंटर रीसेट करें', 'Reset Japa Counter', 'જપ કાઉન્ટર રીસેટ કરો')}
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Navigation Buttons */}
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
                        <span>{L('पिछला मंत्र', 'Previous', 'પાછલો મંત્ર')}</span>
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
                        <span>{L('अगला मंत्र', 'Next', 'આગળનો મંત્ર')}</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Floating Sticky Audio Player Bar */}
      {speakingId !== null && currentMantra && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-md bg-stone-900/95 backdrop-blur-md text-amber-100 p-2.5 rounded-2xl border-2 border-amber-500 shadow-2xl flex items-center justify-between gap-2 animate-in slide-in-from-bottom-3 duration-200">
          <div className="min-w-0 flex-1 flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-400/50 flex items-center justify-center shrink-0">
              <Volume2 className="w-4 h-4 text-amber-400 animate-pulse" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-bold text-amber-300 truncate">
                {L('मंत्र वाचन चालू:', 'Recitation Playing:', 'મંત્ર વાંચન ચાલુ:')} {currentMantra.title}
              </div>
              <div className="text-[10px] text-amber-200/80 truncate">
                {L('मंत्र', 'Mantra', 'મંત્ર')} #{currentMantra.id} • {trJainCat(currentMantra.category, cLang)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                stopUmaSpeech();
                setSpeakingId(null);
              }}
              className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1 shadow-md cursor-pointer"
              title={L('मंत्र वाचन बंद करें', 'Stop Mantra Recitation', 'મંત્ર વાંચન બંધ કરો')}
            >
              <VolumeX className="w-4 h-4" />
              <span>{L('रुकें', 'Stop', 'રોકો')}</span>
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
