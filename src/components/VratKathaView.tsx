import React, { useState } from 'react';
import { 
  BookOpen, Sparkles, Share2, ArrowLeft, Search, CheckCircle2, Scroll 
} from 'lucide-react';
import { 
  VRAT_KATHA_DATA, 
  VRAT_KATHA_CATEGORIES, 
  VratKathaItem 
} from '../data/vratKathaData';

interface VratKathaViewProps {
  onBackToPanchang: () => void;
}

export const VratKathaView: React.FC<VratKathaViewProps> = ({ onBackToPanchang }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedKathaId, setSelectedKathaId] = useState<string | null>(null);

  const filteredKatha = VRAT_KATHA_DATA.filter((item) => {
    const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.shlok.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const activeKatha = VRAT_KATHA_DATA.find((k) => k.id === selectedKathaId) || null;

  const handleShareKatha = (katha: VratKathaItem) => {
    const text = `॥ ${katha.title} ॥\n\n${katha.subtitle}\n\nश्लोक:\n${katha.shlok}\n\nअर्थ: ${katha.shlokMeaning}\n\n(शक्ति पंचांग ऐप से साभार)`;
    if (navigator.share) {
      navigator.share({ title: katha.title, text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      alert('व्रत कथा एवं श्लोक क्लिपबोर्ड पर कॉपी हो गया है!');
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-4 py-4 space-y-5 animate-in fade-in zoom-in-95 duration-200 pb-32">
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#5C3A21] via-[#754622] to-[#381E0C] rounded-3xl p-6 text-[#FAF2E4] shadow-xl border border-amber-500/40 flex items-center justify-between">
        <div>
          <button 
            onClick={onBackToPanchang}
            className="mb-3 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-xs font-bold transition flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>पंचांग पर लौटें</span>
          </button>
          <p className="text-xs font-black tracking-widest text-amber-300 uppercase mb-1">
            ॥ सनातन ग्रंथ एवं शास्त्र प्रमाण ॥
          </p>
          <h1 className="text-2xl sm:text-3xl font-black font-granth text-amber-100">
            व्रत कथाएँ, श्लोक एवं आरतियाँ
          </h1>
          <p className="text-xs sm:text-sm text-amber-200/90 mt-1">
            स्कन्द पुराण, शिव पुराण, पद्म पुराण एवं वेदों से प्रमाणित पवित्र कथाएँ व संस्कृत श्लोक।
          </p>
        </div>
        <div className="hidden sm:flex p-4 bg-amber-600/30 rounded-2xl border border-amber-500/40 text-amber-200 items-center justify-center">
          <Scroll className="w-12 h-12 text-amber-300" />
        </div>
      </div>

      {activeKatha ? (
        <div className="bg-white/95 dark:bg-[#2A1508]/95 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-amber-500/30 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-amber-500/20 pb-4">
            <button
              onClick={() => setSelectedKathaId(null)}
              className="px-4 py-2 rounded-2xl bg-amber-500/20 text-[#5C3A21] dark:text-amber-300 font-bold text-xs hover:bg-amber-500/30 transition flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>सभी कथाओं की सूची पर जाएं</span>
            </button>
            <button
              onClick={() => handleShareKatha(activeKatha)}
              className="p-2.5 rounded-2xl bg-amber-600 text-white shadow-md hover:bg-amber-700 transition"
              title="कथा साझा करें"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2 text-center">
            <span className="inline-block px-3 py-1 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-300 text-xs font-bold uppercase tracking-wider">
              {activeKatha.vedaSource}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black font-granth text-[#462B17] dark:text-amber-200">
              {activeKatha.title}
            </h2>
            <p className="text-xs font-semibold text-stone-600 dark:text-stone-300">
              {activeKatha.subtitle}
            </p>
          </div>

          {/* Sanskrit Shlok Box */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-amber-500/10 via-yellow-500/10 to-amber-600/15 border-2 border-amber-500/40 text-center space-y-3 shadow-inner">
            <div className="flex items-center justify-center gap-2 text-amber-700 dark:text-amber-400 text-xs font-black uppercase">
              <Sparkles className="w-4 h-4" />
              <span>शास्त्रोक्त संस्कृत श्लोक (प्रमाण)</span>
            </div>
            <p className="text-base sm:text-lg font-bold font-granth text-[#462B17] dark:text-amber-100 leading-relaxed">
              &quot;{activeKatha.shlok}&quot;
            </p>
            <div className="pt-2 border-t border-amber-500/30">
              <p className="text-xs sm:text-sm font-semibold text-[#5C3A21] dark:text-amber-200 italic">
                <b>भावार्थ:</b> {activeKatha.shlokMeaning}
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-stone-900/60 border border-amber-500/30">
            <p className="text-xs font-black uppercase text-amber-800 dark:text-amber-300 mb-1">व्रत का महत्व व परिचय:</p>
            <p className="text-sm text-stone-700 dark:text-stone-200 leading-relaxed">
              {activeKatha.description}
            </p>
          </div>

          {/* Rules / Vidhi */}
          {activeKatha.rules && activeKatha.rules.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-base font-black font-granth text-[#462B17] dark:text-amber-200 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-amber-600" />
                <span>पूजन विधि एवं नियम:</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {activeKatha.rules.map((rule, idx) => (
                  <div key={idx} className="p-3 rounded-2xl bg-amber-50/80 dark:bg-stone-900/80 border border-amber-500/20 flex items-start gap-2.5 text-xs font-bold text-[#5C3A21] dark:text-amber-200">
                    <span className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{rule}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Katha Paragraphs */}
          <div className="space-y-4 pt-2">
            <h3 className="text-base font-black font-granth text-[#462B17] dark:text-amber-200 flex items-center gap-2 border-b border-amber-500/20 pb-2">
              <BookOpen className="w-5 h-5 text-amber-600" />
              <span>संपूर्ण पावन कथा:</span>
            </h3>
            <div className="space-y-3 text-stone-800 dark:text-stone-200 leading-relaxed text-sm sm:text-base font-serif">
              {activeKatha.katha.map((paragraph, index) => (
                <p key={index} className="p-4 rounded-2xl bg-white dark:bg-stone-900/90 border border-amber-500/25 shadow-sm whitespace-pre-line">
                  {activeKatha.category === 'aarti' ? null : (
                    <span className="font-bold text-amber-700 dark:text-amber-400 mr-2">अध्याय {index + 1}:</span>
                  )}
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-600" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="कथा, श्लोक या पर्व का नाम खोजें..."
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white/90 dark:bg-[#2A1508]/90 border border-amber-500/40 text-sm font-semibold text-[#5C3A21] dark:text-[#FAF2E4] focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-md"
            />
          </div>

          {/* Categories Pill Selector */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {VRAT_KATHA_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-2xl font-bold text-xs whitespace-nowrap transition shadow-sm ${
                  selectedCategory === cat.id
                    ? 'bg-amber-600 text-white shadow-md border border-amber-700'
                    : 'bg-white/80 dark:bg-stone-900/80 text-[#5C3A21] dark:text-amber-200 border border-amber-500/30 hover:bg-amber-100/80'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Katha Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredKatha.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedKathaId(item.id)}
                className="group cursor-pointer bg-white/90 dark:bg-[#2A1508]/90 backdrop-blur-xl rounded-3xl p-5 border border-amber-500/30 shadow-lg hover:border-amber-500 transition hover:shadow-2xl flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-300 text-[10px] font-black uppercase leading-snug">
                      {item.vedaSource}
                    </span>
                    <span className="shrink-0 text-amber-600 dark:text-amber-400 group-hover:translate-x-1 transition text-xs font-bold">
                      पढ़ें →
                    </span>
                  </div>
                  <h3 className="text-lg font-black font-granth text-[#462B17] dark:text-amber-200 group-hover:text-amber-700 transition">
                    {item.title}
                  </h3>
                  <p className="text-xs text-stone-600 dark:text-stone-300 font-semibold line-clamp-1">
                    {item.subtitle}
                  </p>
                  {/* Shlok preview */}
                  <div className="p-3 rounded-2xl bg-[#FFF8EC] dark:bg-[#1A0E06] border border-amber-500/40 text-[13px] font-granth font-bold text-[#3E2714] dark:text-[#FFE7B0] leading-relaxed whitespace-pre-line">
                    {item.shlok.replace(/।\s*/g, '।\n')}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-amber-500/20 flex items-center justify-between text-xs font-bold text-stone-500 dark:text-stone-400">
                  <span>संपूर्ण व्रत विधि सहित</span>
                  <span className="text-amber-700 dark:text-amber-300 font-black">शास्त्र प्रमाण</span>
                </div>
              </div>
            ))}
            {filteredKatha.length === 0 && (
              <div className="col-span-full py-12 text-center text-stone-500 dark:text-stone-400 font-semibold">
                कोई कथा या श्लोक नहीं मिला। कृपया दूसरा शब्द खोजें।
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
