import React, { useState } from 'react';
import {
  MUHURAT_CATEGORIES,
  MuhuratCategory,
  AnnualMuhuratItem,
  getAnnualMuhurats,
  HINDI_MONTHS_NAMES,
} from '../services/muhuratTable';
import {
  Calendar,
  Clock,
  Sparkles,
  Share2,
  Copy,
  Check,
  Compass,
  CheckCircle2,
  Star,
} from 'lucide-react';

export const AnnualMuhuratTableView: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<MuhuratCategory>('vivah');
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedMonth, setSelectedMonth] = useState<number>(-1); // -1 = all months
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const activeCategoryMeta =
    MUHURAT_CATEGORIES.find((c) => c.id === selectedCategory) || MUHURAT_CATEGORIES[0];

  const muhuratList: AnnualMuhuratItem[] = getAnnualMuhurats(
    selectedCategory,
    selectedYear,
    selectedMonth
  );

  const handleShareWhatsApp = () => {
    let text = `🕉️ *सनातन शक्ति पंचांग — ${activeCategoryMeta.title} (${selectedYear})*\n\n`;
    text += `📌 *श्रेणी:* ${activeCategoryMeta.shortTitle}\n`;
    if (selectedMonth >= 0) {
      text += `📅 *माह:* ${HINDI_MONTHS_NAMES[selectedMonth + 1]}\n`;
    }
    text += `✨ *कुल शुभ मुहूर्त:* ${muhuratList.length}\n`;
    text += `═════════════════════\n\n`;

    muhuratList.forEach((m, idx) => {
      text += `*${idx + 1}. ${m.dateStr} (${m.weekdayHindi})*\n`;
      text += `   ⏳ *समय:* ${m.timeWindowHindi}\n`;
      text += `   🌙 *तिथि:* ${m.tithiHindi}\n`;
      text += `   ⭐ *नक्षत्र:* ${m.nakshatraHindi}\n`;
      if (m.lagnaHindi) text += `   🏛️ *लग्न:* ${m.lagnaHindi}\n`;
      if (m.specialYoga) text += `   ✨ *योग:* ${m.specialYoga}\n`;
      text += `   📖 ${m.vedicGuidance}\n\n`;
    });

    text += `═════════════════════\n`;
    text += `🪔 *सटीक वैदिक पंचांग एवं मुहूर्त दर्शन हेतु:* शक्ति पंचांग\n`;

    const encoded = encodeURIComponent(text);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  const handleCopyList = () => {
    let text = `सनातन शक्ति पंचांग — ${activeCategoryMeta.title} (${selectedYear})\n\n`;
    muhuratList.forEach((m, idx) => {
      text += `${idx + 1}. ${m.dateStr} (${m.weekdayHindi}) - ${m.timeWindowHindi} | तिथि: ${m.tithiHindi} | नक्षत्र: ${m.nakshatraHindi}\n`;
    });
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="space-y-3.5 animate-in fade-in duration-200">
      {/* Category Horizontal Selector */}
      <div className="bg-[#FAF2E4] border border-[#8C6239]/30 rounded-xl p-2.5 shadow-xs">
        <div className="text-[11px] font-bold text-[#8C6239] uppercase tracking-wider mb-1.5 flex items-center justify-between">
          <span>मुहूर्त सारणी श्रेणी चुनें</span>
          <span className="text-[10px] text-[#5C3A21] font-semibold">शास्त्रोक्त निर्णय</span>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
          {MUHURAT_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`py-2 px-1 rounded-lg text-center transition cursor-pointer flex flex-col items-center justify-center gap-0.5 border ${
                  isSelected
                    ? 'bg-[#5C3A21] text-white border-[#5C3A21] shadow-xs scale-[1.02]'
                    : 'bg-[#F4E8D1] text-[#5C3A21] hover:bg-[#EBD8BD] border-[#8C6239]/20'
                }`}
              >
                <span className="text-base leading-none">{cat.icon}</span>
                <span className="text-[11px] font-bold leading-tight line-clamp-1">
                  {cat.shortTitle}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Year & Month Filter Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 bg-[#FAF2E4] border border-[#8C6239]/30 rounded-xl p-2.5 shadow-xs">
        {/* Year Toggle */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-[#8C6239]">वर्ष:</span>
          <div className="inline-flex rounded-lg border border-[#8C6239]/30 p-0.5 bg-[#F4E8D1]">
            {[2026, 2027].map((yr) => (
              <button
                key={yr}
                type="button"
                onClick={() => setSelectedYear(yr)}
                className={`px-3 py-1 text-xs font-black rounded-md transition cursor-pointer ${
                  selectedYear === yr
                    ? 'bg-[#5C3A21] text-white shadow-xs'
                    : 'text-[#5C3A21] hover:bg-[#FAF2E4]'
                }`}
              >
                {yr}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons: WhatsApp Share & Copy */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyList}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-2.5 py-1.5 bg-[#F4E8D1] hover:bg-[#EBD8BD] text-[#5C3A21] border border-[#8C6239]/30 rounded-lg text-xs font-bold transition cursor-pointer active:scale-95"
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{isCopied ? 'कॉपी हो गया' : 'कॉपी सूची'}</span>
          </button>
          <button
            type="button"
            onClick={handleShareWhatsApp}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition cursor-pointer shadow-xs active:scale-95"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>व्हाट्सएप शेयर</span>
          </button>
        </div>
      </div>

      {/* Month Scroll Bar */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar">
        {HINDI_MONTHS_NAMES.map((name, idx) => {
          const mIndex = idx === 0 ? -1 : idx - 1;
          const isSelected = selectedMonth === mIndex;
          return (
            <button
              key={name}
              type="button"
              onClick={() => setSelectedMonth(mIndex)}
              className={`px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                isSelected
                  ? 'bg-[#5C3A21] text-white shadow-xs'
                  : 'bg-[#FAF2E4] text-[#8C6239] border border-[#8C6239]/30 hover:bg-[#F4E8D1]'
              }`}
            >
              {name}
            </button>
          );
        })}
      </div>

      {/* Category Banner with Counts */}
      <div className="bg-gradient-to-r from-[#FAF2E4] via-[#F4E8D1] to-[#FAF2E4] border-2 border-[#8C6239]/40 rounded-xl p-3 sm:p-4 shadow-xs">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{activeCategoryMeta.icon}</span>
            <div>
              <h3 className="text-base font-black font-granth text-[#5C3A21]">
                {activeCategoryMeta.title} ({selectedYear})
              </h3>
              <p className="text-[11px] text-[#735133] leading-tight">
                {activeCategoryMeta.desc}
              </p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <span className="bg-[#B56A00] text-white text-[11px] font-black px-2.5 py-1 rounded-full shadow-xs">
              {muhuratList.length} शुभ तिथियाँ
            </span>
          </div>
        </div>
      </div>

      {/* Muhurat Cards List */}
      {muhuratList.length === 0 ? (
        <div className="bg-[#FAF2E4] border border-[#8C6239]/30 rounded-xl p-6 text-center text-[#8C6239]">
          <p className="text-sm font-bold">चयनित अवधि में कोई शुभ मुहूर्त नहीं है।</p>
          <p className="text-xs text-[#735133] mt-1">
            कृपया अन्य माह अथवा वर्ष 2026/2027 का चयन करें।
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {muhuratList.map((item, idx) => (
            <div
              key={item.id}
              className="bg-[#FAF2E4] hover:bg-[#FDF9F0] border-2 border-[#8C6239]/30 rounded-xl p-3 sm:p-4 transition shadow-xs space-y-2"
            >
              {/* Card Top: Date, Day & Special Badge */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#8C6239]/20 pb-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#5C3A21] text-amber-200 text-xs font-black flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <div>
                    <h4 className="text-sm sm:text-base font-black text-[#5C3A21]">
                      {item.dateStr}
                    </h4>
                    <span className="text-xs text-[#8C6239] font-bold">
                      ({item.weekdayHindi})
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  {item.specialYoga && (
                    <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-700" />
                      <span>{item.specialYoga}</span>
                    </span>
                  )}
                  <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                    <span>उत्तम मुहूर्त</span>
                  </span>
                </div>
              </div>

              {/* Grid Details: Time Window, Tithi, Nakshatra, Lagna */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {/* Time Window */}
                <div className="bg-[#F4E8D1] p-2 rounded-lg border border-[#8C6239]/20">
                  <span className="text-[10px] text-[#8C6239] font-bold uppercase flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#B56A00]" />
                    <span>शुभ मुहूर्त समय (Time Window)</span>
                  </span>
                  <div className="text-xs sm:text-sm font-black text-[#5C3A21] mt-0.5">
                    {item.timeWindowHindi}
                  </div>
                </div>

                {/* Tithi & Nakshatra */}
                <div className="bg-[#F4E8D1] p-2 rounded-lg border border-[#8C6239]/20">
                  <span className="text-[10px] text-[#8C6239] font-bold uppercase flex items-center gap-1">
                    <Star className="w-3 h-3 text-[#B56A00]" />
                    <span>तिथि एवं नक्षत्र</span>
                  </span>
                  <div className="text-xs font-bold text-[#5C3A21] mt-0.5">
                    {item.tithiHindi} • {item.nakshatraHindi}
                  </div>
                </div>
              </div>

              {/* Shubh Lagna if present */}
              {item.lagnaHindi && (
                <div className="flex items-center gap-1 text-[11px] text-[#5C3A21]">
                  <span className="font-bold text-[#8C6239]">🏛️ प्रशस्त लग्न:</span>
                  <span className="font-semibold">{item.lagnaHindi}</span>
                </div>
              )}

              {/* Guidance / Remark */}
              <p className="text-[11px] text-[#735133] leading-relaxed pt-1 border-t border-[#8C6239]/15">
                <span className="font-bold text-[#5C3A21]">शास्त्रोक्त परामर्श: </span>
                {item.vedicGuidance}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
