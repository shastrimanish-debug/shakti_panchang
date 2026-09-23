import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Search,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Share2,
  Copy,
  Check,
  Type,
  Flame,
  Sun,
  Award,
} from 'lucide-react';
import {
  VRAT_KATHA_DATA,
  VRAT_KATHA_CATEGORIES,
  VratKathaItem,
} from '../data/vratKathaData';

interface VratKathaViewProps {
  onBackToPanchang?: () => void;
}

export const VratKathaView: React.FC<VratKathaViewProps> = ({ onBackToPanchang }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedKathaId, setSelectedKathaId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'katha' | 'vidhi' | 'aarti'>('katha');
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg' | 'xl'>('base');
  const [copied, setCopied] = useState<boolean>(false);

  // Filtered Kathas
  const filteredKathas = useMemo(() => {
    return VRAT_KATHA_DATA.filter((item) => {
      const matchCat = selectedCategory === 'all' || item.category === selectedCategory;
      const matchQuery =
        !searchQuery.trim() ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.deity.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [selectedCategory, searchQuery]);

  const activeKatha = useMemo(() => {
    if (!selectedKathaId) return null;
    return VRAT_KATHA_DATA.find((k) => k.id === selectedKathaId) || null;
  }, [selectedKathaId]);

  const handleShareKatha = (katha: VratKathaItem) => {
    let text = `*॥ ${katha.title} ॥*\n`;
    text += `🌸 *इष्टदेव:* ${katha.deity}\n`;
    text += `📅 *मुहूर्त/तिथि:* ${katha.tithiInfo}\n\n`;
    text += `✨ *माहात्म्य:* ${katha.significance}\n\n`;
    if (katha.mantra) {
      text += `🕉️ *सिद्ध मन्त्र:* ${katha.mantra}\n\n`;
    }
    text += `सनातन शक्ति पंचांग — प्रामाणिक व्रत कथा एवं नित्य स्तोत्र संग्रह`;

    if (navigator.share) {
      navigator.share({
        title: katha.title,
        text: text,
      }).catch(() => {});
    } else {
      const encoded = encodeURIComponent(text);
      window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
    }
  };

  const handleCopyText = (textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getFontSizeClass = () => {
    switch (fontSize) {
      case 'sm':
        return 'text-xs leading-relaxed';
      case 'base':
        return 'text-sm leading-relaxed';
      case 'lg':
        return 'text-base leading-loose';
      case 'xl':
        return 'text-lg leading-loose';
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4 pb-16">
      {/* View Header */}
      <div className="bg-[#FAF2E4] border-2 border-[#8C6239] rounded-2xl p-4 shadow-sm text-[#3E2714]">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#5C3A21] text-[#FFD88A] rounded-xl shadow-xs">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-granth font-bold text-lg sm:text-xl text-[#5C3A21]">
                व्रत कथा, पूजा विधि एवं आरती संग्रह
              </h2>
              <p className="text-xs text-[#735133]">
                एकादशी, प्रदोष, सत्यनारायण कथा, नित्य स्तोत्र एवं पावन आरतियाँ (100% ऑफ़लाइन)
              </p>
            </div>
          </div>

          {onBackToPanchang && (
            <button
              type="button"
              onClick={onBackToPanchang}
              className="text-xs px-3 py-1.5 bg-[#FAF2E4] hover:bg-[#EBD8BD] border border-[#8C6239] text-[#5C3A21] font-bold rounded-xl cursor-pointer"
            >
              ← पंचांग पर लौटें
            </button>
          )}
        </div>
      </div>

      {/* Detail View Mode (Single Katha Reader) */}
      {activeKatha ? (
        <div className="bg-[#FAF2E4] border-2 border-[#8C6239] rounded-2xl shadow-md overflow-hidden animate-in fade-in duration-200">
          {/* Reader Top Bar */}
          <div className="p-3.5 bg-gradient-to-r from-[#5C3A21] to-[#735133] text-[#FAF2E4] flex items-center justify-between flex-wrap gap-2 border-b border-[#8C6239]">
            <button
              type="button"
              onClick={() => setSelectedKathaId(null)}
              className="flex items-center gap-1.5 text-xs font-bold text-[#FFD88A] hover:text-white cursor-pointer px-2 py-1 rounded-lg hover:bg-white/10"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>सूची पर लौटें</span>
            </button>

            {/* Font size adjuster */}
            <div className="flex items-center gap-1 bg-black/20 p-1 rounded-lg">
              <Type className="w-3.5 h-3.5 text-[#FFD88A] mx-1" />
              <button
                type="button"
                onClick={() => setFontSize('sm')}
                className={`text-[10px] px-2 py-0.5 rounded font-bold cursor-pointer ${
                  fontSize === 'sm' ? 'bg-[#FFD88A] text-[#3E2714]' : 'text-[#FAF2E4]'
                }`}
              >
                अ-
              </button>
              <button
                type="button"
                onClick={() => setFontSize('base')}
                className={`text-[11px] px-2 py-0.5 rounded font-bold cursor-pointer ${
                  fontSize === 'base' ? 'bg-[#FFD88A] text-[#3E2714]' : 'text-[#FAF2E4]'
                }`}
              >
                अ
              </button>
              <button
                type="button"
                onClick={() => setFontSize('lg')}
                className={`text-xs px-2 py-0.5 rounded font-bold cursor-pointer ${
                  fontSize === 'lg' ? 'bg-[#FFD88A] text-[#3E2714]' : 'text-[#FAF2E4]'
                }`}
              >
                अ+
              </button>
              <button
                type="button"
                onClick={() => setFontSize('xl')}
                className={`text-sm px-2 py-0.5 rounded font-bold cursor-pointer ${
                  fontSize === 'xl' ? 'bg-[#FFD88A] text-[#3E2714]' : 'text-[#FAF2E4]'
                }`}
              >
                अ++
              </button>
            </div>

            {/* Share / Copy buttons */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleShareKatha(activeKatha)}
                className="flex items-center gap-1 text-xs px-2.5 py-1 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold rounded-lg cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>शेयर</span>
              </button>
            </div>
          </div>

          {/* Katha Header Banner */}
          <div className="p-4 bg-[#F4E8D1] border-b border-[#8C6239]/30">
            <div className="inline-block px-2.5 py-0.5 bg-[#B56A00] text-white rounded-full text-[10px] font-bold tracking-wide uppercase mb-1.5">
              {activeKatha.deity}
            </div>
            <h1 className="font-granth font-bold text-xl sm:text-2xl text-[#5C3A21]">
              {activeKatha.title}
            </h1>
            <p className="text-xs text-[#735133] mt-0.5">{activeKatha.subtitle}</p>

            <div className="mt-3 p-2.5 bg-[#FAF2E4] border border-[#8C6239]/30 rounded-xl text-xs space-y-1">
              <div className="text-[#B56A00] font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>तिथि व समय: {activeKatha.tithiInfo}</span>
              </div>
              <p className="text-[#3E2714] text-[11px] leading-relaxed">
                <span className="font-bold">माहात्म्य:</span> {activeKatha.significance}
              </p>
            </div>

            {/* Navigation Tabs (कथा, विधि, आरती) */}
            <div className="flex items-center gap-2 mt-4">
              <button
                type="button"
                onClick={() => setActiveTab('katha')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'katha'
                    ? 'bg-[#5C3A21] text-[#FFD88A] shadow-xs'
                    : 'bg-[#FAF2E4] text-[#735133] hover:bg-[#EBD8BD]'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>सम्पूर्ण कथा / पाठ</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('vidhi')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'vidhi'
                    ? 'bg-[#5C3A21] text-[#FFD88A] shadow-xs'
                    : 'bg-[#FAF2E4] text-[#735133] hover:bg-[#EBD8BD]'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>पूजन विधि एवं नियम</span>
              </button>

              {activeKatha.aartiText && (
                <button
                  type="button"
                  onClick={() => setActiveTab('aarti')}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
                    activeTab === 'aarti'
                      ? 'bg-[#5C3A21] text-[#FFD88A] shadow-xs'
                      : 'bg-[#FAF2E4] text-[#735133] hover:bg-[#EBD8BD]'
                  }`}
                >
                  <Flame className="w-3.5 h-3.5" />
                  <span>आरती एवं स्तुति</span>
                </button>
              )}
            </div>
          </div>

          {/* Reader Body Content */}
          <div className="p-4 sm:p-6 bg-[#FAF2E4] text-[#3E2714]">
            {activeTab === 'katha' && (
              <div className="space-y-6">
                {activeKatha.mantra && (
                  <div className="p-3 bg-[#F4E8D1] border border-[#B56A00] rounded-xl text-center space-y-1 shadow-xs">
                    <span className="text-[10px] uppercase tracking-wider text-[#B56A00] font-bold">
                      ॥ ध्यान एवं सिद्ध मन्त्र ॥
                    </span>
                    <p className="font-granth font-bold text-sm sm:text-base text-[#5C3A21]">
                      {activeKatha.mantra}
                    </p>
                  </div>
                )}

                {/* If multi-chapter (like Satyanarayan) */}
                {activeKatha.kathaChapters && activeKatha.kathaChapters.length > 0 ? (
                  <div className="space-y-6">
                    {activeKatha.kathaChapters.map((ch, idx) => (
                      <div key={idx} className="p-4 bg-[#F4E8D1]/60 border border-[#8C6239]/30 rounded-xl space-y-2">
                        <h3 className="font-granth font-bold text-sm sm:text-base text-[#5C3A21] border-b border-[#8C6239]/20 pb-1.5">
                          {ch.title}
                        </h3>
                        <div className={`font-serif whitespace-pre-line text-[#3E2714] ${getFontSizeClass()}`}>
                          {ch.content}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={`font-serif whitespace-pre-line text-[#3E2714] ${getFontSizeClass()}`}>
                    {activeKatha.fullText}
                  </div>
                )}

                <div className="p-3 bg-[#F4E8D1] border-t border-[#8C6239]/30 text-center text-xs text-[#8C6239] font-granth font-bold">
                  ॥ इति श्री {activeKatha.title} सम्पूर्णम् ॥
                </div>
              </div>
            )}

            {activeTab === 'vidhi' && (
              <div className="space-y-4">
                <h3 className="font-granth font-bold text-base text-[#5C3A21] flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#B56A00]" />
                  <span>शास्त्रोक्त व्रत संकल्प एवं पूजन विधि</span>
                </h3>

                <div className="space-y-2.5">
                  {activeKatha.poojaVidhi.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-[#F4E8D1] border border-[#8C6239]/30 rounded-xl">
                      <div className="w-6 h-6 rounded-full bg-[#5C3A21] text-[#FFD88A] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                      <p className={`text-[#3E2714] font-medium ${getFontSizeClass()}`}>
                        {step}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'aarti' && activeKatha.aartiText && (
              <div className="space-y-4 text-center">
                <div className="inline-block p-2 bg-[#F4E8D1] border border-[#B56A00] rounded-full">
                  <Flame className="w-6 h-6 text-[#B56A00]" />
                </div>
                <h3 className="font-granth font-bold text-lg text-[#5C3A21]">
                  ॥ पावन आरती ॥
                </h3>
                <div className={`font-serif whitespace-pre-line text-[#3E2714] font-medium leading-loose ${getFontSizeClass()}`}>
                  {activeKatha.aartiText}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* List Mode: Categories & Search */
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#8C6239] absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="व्रत, कथा, चालीसा या आरती खोजें (उदा. सत्यनारायण, हनुमान, एकादशी)..."
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-[#FAF2E4] border-2 border-[#8C6239]/40 rounded-xl text-[#3E2714] focus:outline-hidden focus:border-[#B56A00] shadow-xs placeholder-[#8C6239]/60"
            />
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {VRAT_KATHA_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition cursor-pointer shrink-0 ${
                  selectedCategory === cat.id
                    ? 'bg-[#5C3A21] text-[#FFD88A] shadow-xs'
                    : 'bg-[#FAF2E4] text-[#735133] hover:bg-[#EBD8BD] border border-[#8C6239]/30'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Katha Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredKathas.map((katha) => (
              <div
                key={katha.id}
                onClick={() => {
                  setSelectedKathaId(katha.id);
                  setActiveTab('katha');
                }}
                className="p-4 bg-[#FAF2E4] hover:bg-[#F4E8D1] border-2 border-[#8C6239]/50 hover:border-[#B56A00] rounded-2xl shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-[#B56A00] text-white rounded-full">
                      {katha.deity}
                    </span>
                    <span className="text-[10px] text-[#8C6239] font-medium">
                      {katha.tithiInfo.split(',')[0]}
                    </span>
                  </div>

                  <h3 className="font-granth font-bold text-base text-[#5C3A21] group-hover:text-[#B56A00] transition">
                    {katha.title}
                  </h3>
                  <p className="text-xs text-[#735133] mt-0.5 line-clamp-1">{katha.subtitle}</p>

                  <p className="text-xs text-[#3E2714]/80 mt-2 line-clamp-2 leading-relaxed">
                    {katha.significance}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-[#8C6239]/20 flex items-center justify-between text-xs text-[#B56A00] font-bold">
                  <span className="flex items-center gap-1 group-hover:translate-x-0.5 transition">
                    सम्पूर्ण पाठ व आरती पढ़ें <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShareKatha(katha);
                    }}
                    className="p-1 hover:bg-[#8C6239]/10 rounded-lg text-emerald-600 hover:text-emerald-700"
                    title="व्हाट्सएप पर शेयर करें"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredKathas.length === 0 && (
            <div className="p-8 text-center bg-[#FAF2E4] border border-[#8C6239]/30 rounded-2xl">
              <BookOpen className="w-8 h-8 text-[#8C6239] mx-auto mb-2 opacity-50" />
              <p className="text-sm font-bold text-[#5C3A21]">कोई कथा या आरती नहीं मिली</p>
              <p className="text-xs text-[#735133] mt-0.5">कृपया अन्य शब्द से खोजें या श्रेणी बदलें</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
