import React, { useState, useMemo } from 'react';
import { lalKitabRepository, LAL_KITAB_COUNT, LalKitabRemedy } from '../data/lalKitabRepository';
import { useLanguage } from '../i18n';
import { trPlanet } from '../i18n/vedicTranslate';
import {
  Search,
  X,
  BookOpen,
  Sparkles,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
} from 'lucide-react';

export const LalKitabUpayListView: React.FC<{
  onAskUma?: (query: string) => void;
}> = ({ onAskUma }) => {
  const { language } = useLanguage();
  const lang = (language || 'hi').slice(0, 2).toLowerCase();
  const pick = (hi: string, en: string, gu: string) => (lang === 'en' ? en : lang === 'gu' ? gu : hi);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('सभी (All)');
  const [selectedPlanet, setSelectedPlanet] = useState<string>('सभी ग्रह');
  const [expandedId, setExpandedId] = useState<number | null>(1);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const categories = useMemo(() => lalKitabRepository.getCategories(), []);
  const planets = useMemo(() => lalKitabRepository.getPlanets(), []);

  const filteredRemedies = useMemo(() => {
    return lalKitabRepository.searchRemedies(searchQuery, selectedCategory, selectedPlanet);
  }, [searchQuery, selectedCategory, selectedPlanet]);

  const trCat = (cat: string) => {
    if (cat === 'सभी (All)') return pick('सभी (All)', 'All Categories', 'બધું (All)');
    if (cat === 'सर्वग्रह उपाय') return pick('सर्वग्रह उपाय', 'All Planets Remedies', 'સર્વગ્રહ ઉપાય');
    if (cat.endsWith(' उपाय')) {
      const pl = cat.replace(' उपाय', '').trim();
      return `${trPlanet(pl, lang)} ${pick('उपाय', 'Remedies', 'ઉપાય')}`;
    }
    return cat;
  };

  const trPlFilter = (pl: string) => {
    if (pl === 'सभी ग्रह') return pick('सभी ग्रह', 'All Planets', 'બધા ગ્રહો');
    if (pl === 'सर्वग्रह') return pick('सर्वग्रह', 'All Planets', 'સર્વગ્રહ');
    return trPlanet(pl, lang);
  };

  const handleCopyRemedy = (e: React.MouseEvent, r: LalKitabRemedy) => {
    e.stopPropagation();
    let text = `${pick('📕 लाल किताब उपाय', '📕 Lal Kitab Remedy', '📕 લાલ કિતાબ ઉપાય')} (${r.code}): ${r.title}\n• ${pick('ग्रह:', 'Planet:', 'ગ્રહ:')} ${trPlFilter(r.planet)}\n• ${pick('समस्या:', 'Problem:', 'સમસ્યા:')} ${r.problemStatement}\n• ${pick('उपाय विधि:', 'Procedure:', 'ઉપાય વિધિ:')} ${r.remedyProcedure}\n• ${pick('सामग्री:', 'Materials:', 'સામગ્રી:')} ${r.materialsRequired.join(', ')}\n• ${pick('अवधि:', 'Duration:', 'સમયગાળો:')} ${r.durationDays} (${r.bestDayAndTime})\n• ${pick('सावधानी:', 'Precaution:', 'સાવધાની:')} ${r.precaution}`;
    if (r.mantra) {
      text += `\n• ${pick('मंत्र/प्रार्थना:', 'Mantra/Prayer:', 'મંત્ર/પ્રાર્થના:')} ${r.mantra}`;
    }
    if (r.sourceNote) {
      text += `\n• ${pick('संदर्भ:', 'Reference:', 'સંદર્ભ:')} ${r.sourceNote}`;
    }
    navigator.clipboard.writeText(text);
    setCopiedId(r.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Lal Kitab Crimson Header Card */}
      <div className="rounded-2xl bg-gradient-to-r from-[#4A0E17] via-[#7F1D1D] to-[#4A0E17] text-amber-100 p-4 sm:p-5 border-2 border-amber-500/40 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-xl">
              📕
            </div>
            <div>
              <h3 className="font-granth font-black text-base sm:text-lg text-amber-200">
                {pick(
                  'लाल किताब 501 प्रामाणिक एवं पारंपरिक उपाय',
                  'Lal Kitab 501 Authentic Traditional Remedies',
                  'લાલ કિતાબ ૫૦૧ પ્રામાણિક અને પરંપરાગત ઉપાયો'
                )}
              </h3>
              <p className="text-xs text-amber-100/80">
                {pick(
                  'मूल परंपरा (1939-1952) पर आधारित 501 प्रामाणिक, परखे हुए एवं अहानिकर उपाय।',
                  '501 time-tested, non-harmful traditional remedies rooted in the classical (1939–1952) tradition.',
                  'મૂળ પરંપરા (૧૯૩૯-૧૯૫૨) પર આધારિત ૫૦૧ પ્રામાણિક, અનુભૂત અને અહાનિકારક ઉપાયો.'
                )}
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-300/40 text-xs font-bold text-amber-200">
            {filteredRemedies.length} / {LAL_KITAB_COUNT} {pick('उपाय उपलब्ध', 'Remedies', 'ઉપાય ઉપલબ્ધ')}
          </span>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="rounded-2xl bg-[#FAF2E4] border border-[#8C6239]/35 p-3.5 space-y-3 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-[#7F1D1D] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={pick(
              'ग्रह, खाना नंबर, समस्या या उपाय खोजें (जैसे: शनि, कर्ज, खाना 8, तांबा)...',
              'Search by planet, house number, issue or remedy...',
              'ગ્રહ, ખાના નંબર, સમસ્યા કે ઉપાય શોધો...'
            )}
            className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-white border border-[#8C6239]/40 text-xs sm:text-sm font-semibold text-[#3E2714] outline-none focus:border-[#7F1D1D]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C6239] hover:text-[#3E2714] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => {
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                  active
                    ? 'bg-[#7F1D1D] text-amber-100 shadow-xs'
                    : 'bg-[#F4E8D1] text-[#5C3A21] hover:bg-[#EAD8B8]'
                }`}
              >
                {trCat(cat)}
              </button>
            );
          })}
        </div>

        {/* Planet Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {planets.map((pl) => {
            const active = selectedPlanet === pl;
            return (
              <button
                key={pl}
                type="button"
                onClick={() => setSelectedPlanet(pl)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition cursor-pointer border ${
                  active
                    ? 'bg-[#B56A00] text-white border-[#B56A00]'
                    : 'bg-white text-[#5C3A21] border-[#8C6239]/30 hover:bg-[#F4E8D1]'
                }`}
              >
                {trPlFilter(pl)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Remedies Card List */}
      <div className="space-y-3">
        {filteredRemedies.map((remedy) => {
          const isExpanded = expandedId === remedy.id;
          return (
            <article
              key={remedy.id}
              onClick={() => setExpandedId(isExpanded ? null : remedy.id)}
              className={`rounded-2xl border transition cursor-pointer p-4 ${
                isExpanded
                  ? 'bg-[#FFFBF4] border-2 border-[#7F1D1D] shadow-md'
                  : 'bg-[#FAF2E4] border-[#8C6239]/35 hover:border-[#7F1D1D]/60'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-md bg-[#7F1D1D] text-amber-200 text-[10px] font-extrabold">
                      #{remedy.id}{remedy.houseNumber ? ` • ${pick('खाना नं.', 'House #', 'ખાના નં.')} ${remedy.houseNumber}` : ""} • {remedy.code}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-amber-100 border border-amber-400/50 text-[#5C3A21] text-[10px] font-bold">
                      {trPlFilter(remedy.planet)}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-[#F4E8D1] text-[#8C6239] text-[10px] font-bold">
                      {trCat(remedy.category)}
                    </span>
                  </div>
                  <h4 className="font-granth font-bold text-sm sm:text-base text-[#3E2714] pt-0.5">
                    {remedy.title}
                  </h4>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => handleCopyRemedy(e, remedy)}
                    className="p-1.5 rounded-lg bg-[#F4E8D1] hover:bg-[#EAD8B8] text-[#5C3A21] cursor-pointer"
                    title={pick('उपाय कॉपी करें', 'Copy Remedy', 'ઉપાય કોપી કરો')}
                  >
                    {copiedId === remedy.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-700" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-[#7F1D1D]" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#8C6239]" />
                  )}
                </div>
              </div>

              <p className="text-xs text-[#5C3A21] mt-1.5 leading-relaxed">
                <strong className="text-[#7F1D1D]">{pick('समस्या / लक्षण: ', 'Problem / Symptoms: ', 'સમસ્યા / લક્ષણો: ')}</strong>
                {remedy.problemStatement}
              </p>

              {isExpanded && (
                <div className="mt-3 pt-3 border-t border-[#8C6239]/25 space-y-3 text-xs">
                  <div className="p-3 rounded-xl bg-rose-50/90 border border-rose-200 space-y-1">
                    <div className="font-bold text-[#7F1D1D] flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>{pick('लाल किताब उपाय विधि (Procedure):', 'Lal Kitab Remedy Procedure:', 'લાલ કિતાબ ઉપાય વિધિ:')}</span>
                    </div>
                    <p className="text-[#3E2714] leading-relaxed">{remedy.remedyProcedure}</p>
                  </div>

                  {remedy.mantra && (
                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-400/40 space-y-0.5">
                      <div className="text-[10px] font-bold text-[#8C6239] flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-600" />
                        <span>{pick('मंत्र / प्रार्थना / जप:', 'Mantra / Prayer:', 'મંત્ર / પ્રાર્થના / જપ:')}</span>
                      </div>
                      <p className="text-xs font-semibold text-[#7F1D1D]">{remedy.mantra}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="p-2.5 rounded-xl bg-[#F4E8D1] border border-[#8C6239]/25">
                      <div className="text-[10px] font-bold text-[#8C6239]">{pick('आवश्यक सामग्री', 'Materials Required', 'આવશ્યક સામગ્રી')}</div>
                      <div className="font-bold text-[#3E2714] mt-0.5">
                        {remedy.materialsRequired.join(' • ')}
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#F4E8D1] border border-[#8C6239]/25">
                      <div className="text-[10px] font-bold text-[#8C6239]">{pick('अवधि एवं श्रेष्ठ समय', 'Duration & Best Timing', 'સમયગાળો અને શ્રેષ્ઠ સમય')}</div>
                      <div className="font-bold text-[#3E2714] mt-0.5">
                        {remedy.durationDays} ({remedy.bestDayAndTime})
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start justify-between gap-2 p-2.5 rounded-xl bg-amber-50 border border-amber-300/70 text-[#7F1D1D]">
                    <div className="flex items-start gap-1.5">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>
                        <strong>{pick('विशेष सावधानी / परहेज: ', 'Precaution: ', 'વિશેષ સાવધાની / પરેજી: ')}</strong>
                        {remedy.precaution}
                      </span>
                    </div>
                    {onAskUma && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAskUma(
                            pick(
                              `लाल किताब उपाय: ${remedy.title} मेरे लिए कैसा रहेगा?`,
                              `How suitable is this Lal Kitab remedy for me: ${remedy.title}?`,
                              `લાલ કિતાબ ઉપાય: ${remedy.title} મારા માટે કેવો રહેશે?`
                            )
                          );
                        }}
                        className="px-2.5 py-1 rounded-lg bg-[#7F1D1D] text-amber-100 text-[11px] font-bold shrink-0 flex items-center gap-1 cursor-pointer"
                      >
                        <Sparkles className="w-3 h-3" /> {pick('उमा से पूछें', 'Ask Uma', 'ઉમાને પૂછો')}
                      </button>
                    )}
                  </div>

                  {remedy.sourceNote && (
                    <div className="text-[10px] text-[#8C6239] px-1 italic">
                      {pick('स्रोत / संदर्भ:', 'Source / Reference:', 'સંદર્ભ:')} {remedy.sourceNote}
                    </div>
                  )}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
};
