import React, { useState, useMemo } from 'react';
import {
  X,
  BookOpen,
  Calendar,
  Sparkles,
  Info,
  ChevronRight,
  Search,
  Scale,
  Sun,
  Moon,
  Clock,
  HelpCircle,
  ShieldCheck,
  Flame,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import {
  SHASTRIC_RULES,
  TEN_YEAR_FESTIVAL_DECISIONS,
  getTithiCalculationExplanation,
  TenYearFestivalRecord,
  ShastricRule
} from '../services/tithiNirnaya';
import { VedicPanchangData } from '../types';
import { trVedic } from '../i18n/vedicTranslate';
import { useTranslation } from '../i18n';

interface TithiNirnayaModalProps {
  isOpen: boolean;
  onClose: () => void;
  panchang?: VedicPanchangData;
  initialTab?: 'today' | 'rules' | '10year' | 'math';
  onDateSelect?: (date: Date) => void;
}

export const TithiNirnayaModal: React.FC<TithiNirnayaModalProps> = ({
  isOpen,
  onClose,
  panchang,
  initialTab = 'today',
  onDateSelect,
}) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language ? i18n.language.slice(0, 2).toLowerCase() : 'hi';

  const [activeTab, setActiveTab] = useState<'today' | 'rules' | '10year' | 'math'>(initialTab);
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedFestivalFilter, setSelectedFestivalFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedRecordId, setExpandedRecordId] = useState<string | null>(null);

  const mathExplanation = useMemo(() => getTithiCalculationExplanation(lang), [lang]);

  // Filter 10-year records
  const filteredRecords = useMemo(() => {
    return TEN_YEAR_FESTIVAL_DECISIONS.filter((rec) => {
      if (selectedYear !== 0 && rec.year !== selectedYear) return false;
      if (selectedFestivalFilter !== 'all' && rec.festivalId !== selectedFestivalFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = rec.hindiName.toLowerCase().includes(q) || rec.festivalName.toLowerCase().includes(q);
        const matchesReason = rec.decisionReason.toLowerCase().includes(q) || rec.shastricPramana.toLowerCase().includes(q);
        const matchesTithi = rec.tithiName.toLowerCase().includes(q);
        if (!matchesName && !matchesReason && !matchesTithi) return false;
      }
      return true;
    }).sort((a, b) => a.year - b.year || a.observedDate.localeCompare(b.observedDate));
  }, [selectedYear, selectedFestivalFilter, searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-3xl max-h-[92vh] flex flex-col rounded-3xl overflow-hidden shadow-2xl border border-amber-300/80 bg-gradient-to-b from-[#FFFDF8] via-[#FFF9EE] to-[#FFF4DE]"
        style={{ color: '#3A2010' }}
      >
        {/* Modal Header */}
        <div className="p-3.5 sm:p-4 border-b border-amber-200/90 bg-gradient-to-r from-[#5C2D11] via-[#7A3E18] to-[#5C2D11] text-amber-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-amber-500/20 border border-amber-300/40 flex items-center justify-center shadow-inner">
              <Scale className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black font-granth tracking-wide text-amber-100 flex items-center gap-1.5">
                <span>{lang === 'en' ? 'Shastric Tithi & Festival Decision' : lang === 'gu' ? 'શાસ્ત્રોક્ત તિથિ અને પર્વ નિર્ણય' : 'शास्त्रोक्त तिथि व पर्व निर्णय प्रमाण'}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-200 border border-amber-400/30 font-sans font-bold">
                  {lang === 'en' ? '10-Yr Engine' : '१०-वर्षीय दिग्दर्शिका'}
                </span>
              </h3>
              <p className="text-[10px] sm:text-[11px] text-amber-200/80 line-clamp-1">
                {lang === 'en'
                  ? 'Dharmasindhu & Nirnayasindhu Shastric Proofs for Dual-Tithis & Festivals'
                  : lang === 'gu'
                  ? 'ધર્મસિંધુ, નિર્ણયસિંધુ અને સ્કંદ પુરાણ આધારિત શાસ્ત્રોક્ત પ્રમાણ અને ૧૦-વર્ષીય સમાધાન'
                  : 'धर्मसिन्धु, निर्णयसिन्धु व स्कन्द पुराण आधारित शास्त्रोक्त प्रमाण व १०-वर्षीय संशय समाधान'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-amber-100 flex items-center justify-center transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-amber-200/80 bg-amber-100/60 p-1.5 gap-1 shrink-0 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('today')}
            className={`flex-1 py-1.5 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 whitespace-nowrap ${
              activeTab === 'today'
                ? 'bg-[#6D3414] text-white shadow-xs'
                : 'text-[#6D3414] hover:bg-amber-200/70'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{lang === 'en' ? "Today's Tithi & Proof" : lang === 'gu' ? 'આજની તિથિ અને નિર્ણય' : 'आज की तिथि व प्रमाण'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('10year')}
            className={`flex-1 py-1.5 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 whitespace-nowrap ${
              activeTab === '10year'
                ? 'bg-[#6D3414] text-white shadow-xs'
                : 'text-[#6D3414] hover:bg-amber-200/70'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>{lang === 'en' ? '10-Year Conflict Resolver' : lang === 'gu' ? '૧૦-વર્ષીય પર્વ નિર્ણય' : '१०-वर्षीय पर्व निर्णय (2025-35)'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('rules')}
            className={`flex-1 py-1.5 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 whitespace-nowrap ${
              activeTab === 'rules'
                ? 'bg-[#6D3414] text-white shadow-xs'
                : 'text-[#6D3414] hover:bg-amber-200/70'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>{lang === 'en' ? 'Shastric Rules' : lang === 'gu' ? 'શાસ્ત્રોક્ત નિયમો' : 'काल-व्याप्ति नियम'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('math')}
            className={`flex-1 py-1.5 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 whitespace-nowrap ${
              activeTab === 'math'
                ? 'bg-[#6D3414] text-white shadow-xs'
                : 'text-[#6D3414] hover:bg-amber-200/70'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{lang === 'en' ? 'How Tithi Is Calculated' : lang === 'gu' ? 'તિથિ ગણતરી પદ્ધતિ' : 'तिथि की गणितीय गणना'}</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-4">
          {/* TAB 1: TODAY'S TITHI & DHANTERAS / FESTIVAL PROOF */}
          {activeTab === 'today' && (
            <div className="space-y-4">
              {/* Highlight Card */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-amber-500/15 via-orange-500/10 to-amber-200/40 border border-amber-300 shadow-xs space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <span className="inline-block px-2 py-0.5 rounded-md bg-amber-600 text-white text-[10px] font-black tracking-wider uppercase">
                      {lang === 'en' ? 'Astronomical & Shastric Status' : lang === 'gu' ? 'ખગોળીય અને શાસ્ત્રોક્ત સ્થિતિ' : 'खगोलीय व शास्त्रोक्त स्थिति'}
                    </span>
                    <h4 className="text-base sm:text-lg font-black font-granth text-[#4A2610]">
                      {panchang ? (
                        <>
                          {trVedic(panchang.paksha, lang)} · {trVedic(panchang.tithi, lang)}
                        </>
                      ) : (
                        'कार्तिक कृष्ण त्रयोदशी (धनतेरस)'
                      )}
                    </h4>
                  </div>
                  <div className="p-2 rounded-xl bg-amber-200/60 border border-amber-300/80 text-amber-900 shrink-0">
                    <Flame className="w-5 h-5 text-amber-700 animate-pulse" />
                  </div>
                </div>

                {/* Tithi Span Times */}
                {panchang?.tithiSpan && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-white/90 p-3 rounded-xl border border-amber-200">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold text-[#8C6239] block">
                        {lang === 'en' ? 'Tithi Commenced At' : lang === 'gu' ? 'તિથિ પ્રારંભ કાળ' : 'तिथि प्रारंभ काल:'}
                      </span>
                      <span className="font-bold text-[#4A2610]">
                        {panchang.tithiSpan.start.toLocaleDateString(lang === 'en' ? 'en-US' : lang === 'gu' ? 'gu-IN' : 'hi-IN', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short',
                        })}{' '}
                        {panchang.tithiSpan.start.toLocaleTimeString(lang === 'en' ? 'en-US' : lang === 'gu' ? 'gu-IN' : 'hi-IN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold text-[#8C6239] block">
                        {lang === 'en' ? 'Tithi Concludes At' : lang === 'gu' ? 'તિથિ સમાપ્તિ કાળ' : 'तिथि समाप्ति काल:'}
                      </span>
                      <span className="font-bold text-rose-800">
                        {panchang.tithiSpan.end.toLocaleDateString(lang === 'en' ? 'en-US' : lang === 'gu' ? 'gu-IN' : 'hi-IN', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short',
                        })}{' '}
                        {panchang.tithiSpan.end.toLocaleTimeString(lang === 'en' ? 'en-US' : lang === 'gu' ? 'gu-IN' : 'hi-IN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}{' '}
                        <span className="text-[10px] text-stone-600">
                          ({lang === 'en' ? 'Followed by' : lang === 'gu' ? 'ત્યારબાદ' : 'तदोपरांत'} {trVedic(panchang.tithiSpan.nextName, lang)})
                        </span>
                      </span>
                    </div>
                  </div>
                )}

                {/* Shastric Proof: Dhanteras / Festival Rule */}
                <div className="p-3 bg-[#4A2610] text-amber-100 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center gap-1.5 text-amber-300 font-bold">
                    <Scale className="w-4 h-4" />
                    <span>
                      {lang === 'en'
                        ? 'Why Dhanteras Is Observed Today (Shastric Proof)'
                        : lang === 'gu'
                        ? 'આજે જ ધનતેરસ કેમ ઉજવવી? (શાસ્ત્રોક્ત પ્રમાણ)'
                        : 'आज ही धनतेरस क्यों करें? (शास्त्रोक्त प्रमाण)'}
                    </span>
                  </div>

                  <blockquote className="italic border-l-2 border-amber-400 pl-2.5 py-1 text-amber-200 text-xs font-serif bg-black/20 rounded-r-md">
                    "कार्तिकस्यासिते पक्षे त्रयोदश्यां निशामुखे।<br />
                    यमदीपं बहिर्दद्यादपमृत्युर्विनश्यति॥"<br />
                    <span className="text-[10px] not-italic text-amber-300 font-sans font-bold">
                      — स्कन्द पुराण (काशी/प्रभास खण्ड) एवं निर्णयसिन्धु
                    </span>
                  </blockquote>

                  <p className="text-[11px] text-amber-100/90 leading-relaxed">
                    <strong>{lang === 'en' ? 'The Rule of Pradosha-Vyapti:' : lang === 'gu' ? 'પ્રદોષ વ્યાપ્તિનો નિયમ:' : 'प्रदोष काल व्याप्ति का अटल नियम:'}</strong>{' '}
                    {lang === 'en'
                      ? 'Dhanteras (Dhanatrayodashi) and Yama Deepam must be observed on the day Kartik Krishna Trayodashi prevails during Pradosha Kaala (the 2 hours and 24 minutes following sunset). Even if Trayodashi begins midday, its presence in Pradosha gives it complete religious authority over the next day where Trayodashi ends shortly after sunrise.'
                      : lang === 'gu'
                      ? 'ધનતેરસ અને યમ દીપદાનનો મુખ્ય કર્મકાળ સૂર્યાસ્ત પછીના આશરે ૨ કલાક ૨૪ મિનિટ (પ્રદોષ કાળ) છે. ભલે તેરસ બપોરે લાગી હોય, પરંતુ સંધ્યાકાળે પ્રદોષ કાળમાં તેરસ હોવાને કારણે આજે જ ધનતેરસ શાસ્ત્રસંમત છે.'
                      : 'धनतेरस एवं यम-दीपदान का मुख्य कर्मकाल सूर्यास्त के बाद के २ घण्टे २४ मिनट (प्रदोष काल) में होता है। भले ही त्रयोदशी दिन में किसी भी समय शुरू हुई हो, परन्तु सूर्यास्त के बाद प्रदोष काल में त्रयोदशी होने के कारण आज ही धनतेरस और यम दीपदान शास्त्रसम्मत है। अगले दिन केवल उदया तिथि होगी पर प्रदोष में चतुर्दशी आ जाएगी, अतः आज का दिन ही निर्विवाद है।'}
                  </p>
                </div>
              </div>

              {/* What if 2 Tithis in 1 day? */}
              <div className="p-3.5 rounded-2xl bg-white/90 border border-amber-200/90 shadow-xs space-y-2">
                <h5 className="font-bold text-xs sm:text-sm text-[#4A2610] flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>
                    {lang === 'en'
                      ? 'What if there are 2 Tithis in a Single Day (Tithi Kshaya or Vriddhi)?'
                      : lang === 'gu'
                      ? 'જો એક દિવસમાં ૨ તિથિઓ આવે તો કયા દિવસે પર્વ મનાવવું?'
                      : 'जब एक दिन में २ तिथियां हों (तिथि क्षय या वृद्धि), तो त्योहार कब मनाएं?'}
                  </span>
                </h5>
                <p className="text-xs text-stone-700 leading-relaxed">
                  {lang === 'en'
                    ? 'When a tithi does not touch any sunrise, it is called Tithi Kshaya (two tithis in one civil day). Sanatan Dharmashastra resolves this using Karma-Kala (the specific muhurta required for that vrata):'
                    : lang === 'gu'
                    ? 'જ્યારે કોઈ તિથિ સૂર્યોદયને સ્પર્શ્યા વિના જ સમાપ્ત થઈ જાય તેને તિથિ ક્ષય કહેવાય છે. ધર્મશાસ્ત્રમાં દરેક વ્રતનો ચોક્કસ કર્મકાળ હોય છે:'
                    : 'जब कोई तिथि सूर्योदय के बाद शुरू होकर अगले सूर्योदय से पहले ही समाप्त हो जाए, तो उसे तिथि क्षय कहते हैं और एक ही दिन में दो तिथियां आ जाती हैं। धर्मशास्त्र के अनुसार व्रत का निर्णय उदया तिथि से नहीं, बल्कि उस व्रत के विशिष्ट कर्मकाल से होता है:'}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px]">
                  <div className="p-2 rounded-xl bg-amber-50 border border-amber-200/70">
                    <span className="font-bold text-[#8C4A00] block mb-0.5">१. प्रदोष कर्मकाल (Evening)</span>
                    <p className="text-stone-600">धनतेरस, दीपावली, प्रदोष व्रत जिस दिन सूर्यास्त के बाद प्रदोष में आएं, उसी दिन मनाएं।</p>
                  </div>
                  <div className="p-2 rounded-xl bg-amber-50 border border-amber-200/70">
                    <span className="font-bold text-[#8C4A00] block mb-0.5">२. निशीथ कर्मकाल (Midnight)</span>
                    <p className="text-stone-600">महाशिवरात्रि और जन्माष्टमी जिस दिन अर्धरात्रि में व्याप्त हों, उसी दिन मान्य हैं।</p>
                  </div>
                  <div className="p-2 rounded-xl bg-amber-50 border border-amber-200/70">
                    <span className="font-bold text-[#8C4A00] block mb-0.5">३. मध्याह्न कर्मकाल (Noon)</span>
                    <p className="text-stone-600">गणेश चतुर्थी व श्री राम नवमी दोपहर १२ बजे की मध्याह्न व्यापिनी तिथि में ही ग्राह्य हैं।</p>
                  </div>
                  <div className="p-2 rounded-xl bg-amber-50 border border-amber-200/70">
                    <span className="font-bold text-[#8C4A00] block mb-0.5">४. उदया तिथि कर्मकाल (Sunrise)</span>
                    <p className="text-stone-600">एकादशी, अनंत चतुर्दशी व सार्वत्रिक स्मार्त व्रत सूर्योदय-कालिक तिथि में मनाए जाते हैं।</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: 10-YEAR FESTIVAL CONFLICT RESOLVER */}
          {activeTab === '10year' && (
            <div className="space-y-3">
              {/* Year & Festival Selector */}
              <div className="p-3 rounded-2xl bg-white/90 border border-amber-200 space-y-2">
                <div className="flex items-center gap-2 flex-wrap justify-between">
                  {/* Year Tabs */}
                  <div className="flex items-center gap-1 overflow-x-auto py-1 max-w-full">
                    {[2025, 2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033, 2034, 2035].map((yr) => (
                      <button
                        key={yr}
                        type="button"
                        onClick={() => setSelectedYear(yr)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition shrink-0 ${
                          selectedYear === yr
                            ? 'bg-amber-700 text-white shadow-xs'
                            : 'bg-amber-100/70 text-amber-900 hover:bg-amber-200'
                        }`}
                      >
                        {yr}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setSelectedYear(0)}
                      className={`px-2 py-1 rounded-lg text-xs font-bold transition shrink-0 ${
                        selectedYear === 0 ? 'bg-amber-700 text-white' : 'bg-stone-200 text-stone-700'
                      }`}
                    >
                      {lang === 'en' ? 'All 10 Yrs' : 'सभी १० वर्ष'}
                    </button>
                  </div>

                  {/* Festival Filter */}
                  <select
                    value={selectedFestivalFilter}
                    onChange={(e) => setSelectedFestivalFilter(e.target.value)}
                    className="text-xs font-bold px-2.5 py-1 rounded-lg border border-amber-300 bg-amber-50 text-amber-950 focus:outline-none"
                  >
                    <option value="all">{lang === 'en' ? 'All Festivals' : 'समस्त महापर्व'}</option>
                    <option value="dhanteras">धनतेरस (Dhanteras)</option>
                    <option value="diwali">दीपावली (Diwali)</option>
                    <option value="shivratri">महाशिवरात्रि (Maha Shivratri)</option>
                    <option value="janmashtami">श्री कृष्ण जन्माष्टमी</option>
                    <option value="rakshabandhan">रक्षाबंधन</option>
                  </select>
                </div>

                {/* Search */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-stone-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={lang === 'en' ? 'Search festival, shloka, or conflict...' : 'त्योहार, श्लोक या तिथि संशय खोजें...'}
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-amber-200 bg-amber-50/50 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Records List */}
              <div className="space-y-2.5">
                {filteredRecords.length > 0 ? (
                  filteredRecords.map((rec, idx) => {
                    const isExpanded = expandedRecordId === `${rec.year}-${rec.festivalId}`;
                    return (
                      <div
                        key={idx}
                        className="p-3 sm:p-3.5 rounded-2xl bg-white border border-amber-200/90 shadow-xs hover:border-amber-400 transition space-y-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-xs font-black text-amber-800 px-1.5 py-0.2 rounded bg-amber-100 border border-amber-300">
                                {rec.year}
                              </span>
                              <h4 className="font-black font-granth text-sm text-[#4A2610]">
                                {rec.hindiName}
                              </h4>
                              {rec.hasConflict && (
                                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1">
                                  <AlertTriangle className="w-2.5 h-2.5" />
                                  <span>{rec.conflictType?.replace(/_/g, ' ') || 'द्वि-तिथि संशय'}</span>
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-[#8C6239] font-bold flex items-center gap-2 flex-wrap">
                              <span className="text-emerald-800 font-black">
                                ✓ {new Date(rec.observedDate + 'T12:00:00').toLocaleDateString(lang === 'en' ? 'en-US' : lang === 'gu' ? 'gu-IN' : 'hi-IN', {
                                  weekday: 'short',
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric',
                                })}
                              </span>
                              <span>• {rec.tithiName}</span>
                              <span>• कर्मकाल: {rec.karmaKala}</span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => setExpandedRecordId(isExpanded ? null : `${rec.year}-${rec.festivalId}`)}
                            className="px-2 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 text-[10px] font-bold transition shrink-0 cursor-pointer"
                          >
                            {isExpanded ? (lang === 'en' ? 'Hide Proof' : 'संक्षिप्त करें') : (lang === 'en' ? 'Shastric Proof' : 'शास्त्रोक्त प्रमाण देखें')}
                          </button>
                        </div>

                        {/* Tithi Span */}
                        <div className="text-[11px] text-stone-600 bg-amber-50/70 p-2 rounded-xl border border-amber-100 flex items-center justify-between gap-2 flex-wrap">
                          <span>
                            <strong>प्रारंभ:</strong> {rec.tithiStart}
                          </span>
                          <span>
                            <strong>समाप्ति:</strong> {rec.tithiEnd}
                          </span>
                        </div>

                        {/* Decision Reason */}
                        <div className="text-xs text-stone-800 leading-relaxed">
                          <strong>{lang === 'en' ? 'Decision & Why This Day:' : 'निर्णय एवं यही दिन क्यों:'}</strong> {rec.decisionReason}
                        </div>

                        {/* Expanded Shastric Shloka & Proof */}
                        {isExpanded && (
                          <div className="mt-2 p-2.5 rounded-xl bg-[#4A2610] text-amber-100 text-xs space-y-1.5 animate-in fade-in duration-150">
                            <span className="text-[10px] font-bold text-amber-300 block">
                              📜 धर्मसिन्धु / निर्णयसिन्धु श्लोक प्रमाण:
                            </span>
                            <p className="font-serif italic text-amber-200 text-[11px] border-l-2 border-amber-400 pl-2">
                              {rec.shastricPramana}
                            </p>
                            {rec.alternateDateNote && (
                              <p className="text-[10px] text-amber-300/80 pt-0.5">
                                ⚠️ <strong>अन्य दिन क्यों त्याज्य है:</strong> {rec.alternateDateNote}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-xs text-stone-500">
                    कोई पर्व रिकॉर्ड नहीं मिला। कृपया फ़िल्टर बदलें।
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: SHASTRIC RULES */}
          {activeTab === 'rules' && (
            <div className="space-y-3">
              <div className="text-xs text-stone-700 bg-amber-50 p-3 rounded-2xl border border-amber-200 leading-relaxed">
                सनातन धर्मशास्त्र (धर्मसिन्धु, निर्णयसिन्धु, हेमाद्रि) के अनुसार किसी भी व्रत अथवा पर्व के निर्णय में <strong>'काल-व्याप्ति सिद्धांत'</strong> ही सर्वोपरि प्रमाण है। नीचे ६ प्रमुख काल-व्याप्ति नियम दिए गए हैं:
              </div>

              <div className="grid grid-cols-1 gap-3">
                {SHASTRIC_RULES.map((rule) => (
                  <div
                    key={rule.id}
                    className="p-3.5 rounded-2xl bg-white border border-amber-200/90 shadow-xs space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <h4 className="font-black font-granth text-sm text-[#4A2610]">
                          {rule.hindiName}
                        </h4>
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full inline-block">
                          कर्मकाल: {rule.karmaKala}
                        </span>
                      </div>
                      <span className="text-[10px] text-stone-500 font-bold">
                        स्रोत: {rule.source}
                      </span>
                    </div>

                    <p className="text-xs text-stone-700 leading-relaxed">
                      <strong>मूल सिद्धांत:</strong> {rule.principle}
                    </p>

                    <div className="p-2.5 rounded-xl bg-[#4A2610] text-amber-100 text-xs space-y-1">
                      <span className="text-[10px] font-bold text-amber-300 block">
                        संस्कृत श्लोक प्रमाण:
                      </span>
                      <p className="font-serif italic text-amber-200 text-xs border-l-2 border-amber-400 pl-2">
                        {rule.sanskritShloka}
                      </p>
                    </div>

                    <div className="p-2 rounded-xl bg-orange-50 border border-orange-200/70 text-xs text-orange-950">
                      <strong>द्वि-तिथि संशय समाधान:</strong> {rule.dualTithiRule}
                    </div>

                    <div className="text-[11px] text-stone-600 flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-stone-800">प्रमुख उदाहरण:</span>
                      {rule.examples.map((ex, i) => (
                        <span key={i} className="px-1.5 py-0.5 rounded bg-stone-100 text-stone-700 border border-stone-200">
                          {ex}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: MATHEMATICAL TITHI CALCULATION */}
          {activeTab === 'math' && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#4A2610] to-[#6A3716] text-amber-100 space-y-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-300 border border-amber-400/30 uppercase">
                  खगोलीय सूत्र (Astronomical Formula)
                </span>
                <h4 className="text-base sm:text-lg font-black font-mono text-amber-200 tracking-wider">
                  तिथि = ⌊ (λ_Moon - λ_Sun) mod 360° / 12° ⌋ + 1
                </h4>
                <p className="text-xs text-amber-100/80 leading-relaxed">
                  चन्द्रमा द्वारा सूर्य से सापेक्ष १२ अंश (12°) आगे निकलना एक तिथि कहलाता है। जब चन्द्रमा सूर्य के साथ ०° पर होता है तो अमावस्या, और १८०° पर होता है तो पूर्णिमा होती है।
                </p>
              </div>

              <div className="space-y-2.5">
                {mathExplanation.steps.map((st) => (
                  <div
                    key={st.step}
                    className="p-3 rounded-2xl bg-white border border-amber-200 shadow-xs flex items-start gap-3"
                  >
                    <div className="w-7 h-7 rounded-xl bg-amber-100 text-amber-900 border border-amber-300 font-black text-xs flex items-center justify-center shrink-0">
                      {st.step}
                    </div>
                    <div className="space-y-0.5">
                      <h5 className="font-black text-xs sm:text-sm text-[#4A2610]">
                        {st.title}
                      </h5>
                      <p className="text-xs text-stone-700 leading-relaxed">
                        {st.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 border-t border-amber-200 bg-amber-100/50 flex items-center justify-between text-xs text-[#8C6239] shrink-0">
          <span>धर्मो रक्षति रक्षितः • निर्णयसिन्धु व धर्मसिन्धु सम्मत</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[#6D3414] hover:bg-[#5C2D11] text-amber-100 font-bold transition cursor-pointer"
          >
            {lang === 'en' ? 'Close' : 'बंद करें'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TithiNirnayaModal;
