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
  ShastricRule,
  formatFestivalDisplayName,
  formatConflictLabel,
  formatTithiTiming,
  formatKarmaKala,
  formatDecisionReason,
  formatAlternateNote,
  getDailyFestivalDecision,
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
  const dailyDecision = useMemo(() => getDailyFestivalDecision(panchang?.date || new Date(), panchang, lang), [panchang, lang]);

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
        <div
          style={{ backgroundColor: '#5C2D11', color: '#FFFFFF' }}
          className="bx-modal-dark-head p-3.5 sm:p-4 border-b border-amber-200/90 bg-gradient-to-r from-[#5C2D11] via-[#7A3E18] to-[#5C2D11] flex items-center justify-between shrink-0"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-white/10 border border-amber-300/40 flex items-center justify-center shadow-inner">
              <Scale className="w-5 h-5" style={{ color: '#FDE68A' }} />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black font-granth tracking-wide flex items-center gap-1.5" style={{ color: '#FFFDF5' }}>
                <span style={{ color: '#FFFDF5' }}>
                  {lang === 'en' ? 'Shastric Tithi & Festival Decision' : lang === 'gu' ? 'શાસ્ત્રોક્ત તિથિ અને પર્વ નિર્ણય' : 'शास्त्रोक्त तिथि व पर्व निर्णय प्रमाण'}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/30 font-sans font-bold" style={{ color: '#FDE68A' }}>
                  {lang === 'en' ? '10-Yr Engine' : lang === 'gu' ? '૧૦-વર્ષીય એન્જિન' : '१०-वर्षीय दिग्दर्शिका'}
                </span>
              </h3>
              <p className="text-[10px] sm:text-[11px] line-clamp-1" style={{ color: '#FEF08A' }}>
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
            style={{ color: '#FFFFFF' }}
            className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition cursor-pointer"
            aria-label={lang === 'en' ? 'Close' : 'बंद करें'}
          >
            <X className="w-4 h-4" style={{ color: '#FFFFFF' }} />
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
                          {dailyDecision?.isFestivalToday && dailyDecision.festivalName && (
                            <span className="text-amber-800 ml-1.5 font-sans text-xs sm:text-sm font-bold block sm:inline">
                              ({dailyDecision.festivalName})
                            </span>
                          )}
                        </>
                      ) : (
                        dailyDecision?.festivalName || (lang === 'en' ? 'Vedic Panchang' : 'सनातन पंचांग')
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

                {/* Shastric Proof: Dynamic by Festival / Tithi */}
                <div className="p-3 bg-[#4A2610] text-amber-100 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center gap-1.5 text-amber-300 font-bold">
                    <Scale className="w-4 h-4" />
                    <span>
                      {dailyDecision.proofTitle}
                    </span>
                  </div>

                  <blockquote className="italic border-l-2 border-amber-400 pl-2.5 py-1 text-amber-200 text-xs font-serif bg-black/20 rounded-r-md">
                    <span dangerouslySetInnerHTML={{ __html: dailyDecision.shlokQuote.replace(/\n/g, '<br />') }} />
                    <br />
                    <span className="text-[10px] not-italic text-amber-300 font-sans font-bold">
                      {dailyDecision.shlokSource}
                    </span>
                  </blockquote>

                  <p className="text-[11px] text-amber-100/90 leading-relaxed">
                    {dailyDecision.explanation}
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
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200/80">
                    <span className="font-bold text-[#7A2B0A] block mb-0.5">
                      {lang === 'en'
                        ? '1. Pradosha Karma-Kala (Evening)'
                        : lang === 'gu'
                        ? '૧. પ્રદોષ કર્મકાળ (સાંજ)'
                        : '१. प्रदोष कर्मकाल (संध्या)'}
                    </span>
                    <p className="text-stone-700 leading-relaxed">
                      {lang === 'en'
                        ? 'Dhanteras, Diwali, Pradosha Vrata: Observed on the day when the tithi touches Pradosha (2h 24m after sunset).'
                        : lang === 'gu'
                        ? 'ધનતેરસ, દીપાવલી, પ્રદોષ વ્રત: જે દિવસે સૂર્યાસ્ત પછીના પ્રદોષ કાળમાં તિથિ હોય, તે જ દિવસે ઉજવાય.'
                        : 'धनतेरस, दीपावली, प्रदोष व्रत जिस दिन सूर्यास्त के बाद प्रदोष में आएं, उसी दिन मनाएं।'}
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200/80">
                    <span className="font-bold text-[#7A2B0A] block mb-0.5">
                      {lang === 'en'
                        ? '2. Nishita Karma-Kala (Midnight)'
                        : lang === 'gu'
                        ? '૨. નિશીથ કર્મકાળ (મધ્યરાત્રિ)'
                        : '२. निशीथ कर्मकाल (अर्धरात्रि)'}
                    </span>
                    <p className="text-stone-700 leading-relaxed">
                      {lang === 'en'
                        ? 'Maha Shivratri and Krishna Janmashtami: Must be celebrated when the tithi prevails at local midnight (Nishita).'
                        : lang === 'gu'
                        ? 'મહાશિવરાત્રિ અને શ્રીકૃષ્ણ જન્માષ્ટમી: જે દિવસે મધ્યરાત્રિએ નિશીથ કાળમાં તિથિ હોય, તે જ દિવસે માન્ય છે.'
                        : 'महाशिवरात्रि और जन्माष्टमी जिस दिन अर्धरात्रि में व्याप्त हों, उसी दिन मान्य हैं।'}
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200/80">
                    <span className="font-bold text-[#7A2B0A] block mb-0.5">
                      {lang === 'en'
                        ? '3. Madhyahna Karma-Kala (Noon)'
                        : lang === 'gu'
                        ? '૩. મધ્યાહ્ન કર્મકાળ (બપોર)'
                        : '३. मध्याह्न कर्मकाल (दोपहर)'}
                    </span>
                    <p className="text-stone-700 leading-relaxed">
                      {lang === 'en'
                        ? 'Ganesh Chaturthi and Shri Rama Navami: Accepted only during solar midday (Madhyahna, ~11am–1:30pm).'
                        : lang === 'gu'
                        ? 'શ્રી ગણેશ ચતુર્થી અને શ્રી રામ નવમી: બપોરે ૧૨ વાગ્યાની મધ્યાહ્ન વ્યાપિની તિથિમાં જ ગ્રાહ્ય છે.'
                        : 'गणेश चतुर्थी व श्री राम नवमी दोपहर १२ बजे की मध्याह्न व्यापिनी तिथि में ही ग्राह्य हैं।'}
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200/80">
                    <span className="font-bold text-[#7A2B0A] block mb-0.5">
                      {lang === 'en'
                        ? '4. Udaya Tithi Karma-Kala (Sunrise)'
                        : lang === 'gu'
                        ? '૪. ઉદયા તિથિ કર્મકાળ (સૂર્યોદય)'
                        : '४. उदया तिथि कर्मकाल (सूर्योदय)'}
                    </span>
                    <p className="text-stone-700 leading-relaxed">
                      {lang === 'en'
                        ? 'Ekadashi, Ananta Chaturdashi, and Smartha Vratas: Observed when the tithi is present at local sunrise.'
                        : lang === 'gu'
                        ? 'એકાદશી, અનંત ચતુર્દશી અને સ્માર્ત વ્રતો: સૂર્યોદય-કાલિક ઉદયા તિથિમાં જ ઉજવાય છે.'
                        : 'एकादशी, अनंत चतुर्दशी व सार्वत्रिक स्मार्त व्रत सूर्योदय-कालिक तिथि में मनाए जाते हैं।'}
                    </p>
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
                    <option value="all">{lang === 'en' ? 'All Festivals' : lang === 'gu' ? 'તમામ પર્વો' : 'समस्त महापर्व'}</option>
                    <option value="dhanteras">{lang === 'en' ? 'Dhanteras' : lang === 'gu' ? 'ધનતેરસ' : 'धनतेरस (Dhanteras)'}</option>
                    <option value="narak-chaturdashi">{lang === 'en' ? 'Narak Chaturdashi / Roop Chaudas' : lang === 'gu' ? 'રૂપ ચૌદશ / કાળી ચૌદશ' : 'नरक चतुर्दशी (रूप चौदस)'}</option>
                    <option value="diwali">{lang === 'en' ? 'Diwali (Lakshmi Puja)' : lang === 'gu' ? 'દિવાળી (મહાલક્ષ્મી પૂજન)' : 'दीपावली (Diwali)'}</option>
                    <option value="shivratri">{lang === 'en' ? 'Maha Shivratri' : lang === 'gu' ? 'મહાશિવરાત્રિ' : 'महाशिवरात्रि (Maha Shivratri)'}</option>
                    <option value="janmashtami">{lang === 'en' ? 'Krishna Janmashtami' : lang === 'gu' ? 'શ્રીકૃષ્ણ જન્માષ્ટમી' : 'श्री कृष्ण जन्माष्टमी'}</option>
                    <option value="rakshabandhan">{lang === 'en' ? 'Raksha Bandhan' : lang === 'gu' ? 'રક્ષાબંધન' : 'रक्षाबंधन'}</option>
                  </select>
                </div>

                {/* Search */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-stone-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={lang === 'en' ? 'Search festival, shloka, or conflict...' : lang === 'gu' ? 'પર્વ, શ્લોક કે તિથિ સંશય શોધો...' : 'त्योहार, श्लोक या तिथि संशय खोजें...'}
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
                                {formatFestivalDisplayName(rec, lang)}
                              </h4>
                              {rec.hasConflict && (
                                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1">
                                  <AlertTriangle className="w-2.5 h-2.5" />
                                  <span>{formatConflictLabel(rec.conflictType, lang)}</span>
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
                              <span>• {trVedic(rec.tithiName, lang)}</span>
                              <span>• {lang === 'en' ? 'Karma-Kala:' : lang === 'gu' ? 'કર્મકાળ:' : 'कर्मकाल:'} {formatKarmaKala(rec.karmaKala, lang)}</span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => setExpandedRecordId(isExpanded ? null : `${rec.year}-${rec.festivalId}`)}
                            className="px-2 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 text-[10px] font-bold transition shrink-0 cursor-pointer"
                          >
                            {isExpanded ? (lang === 'en' ? 'Hide Proof' : lang === 'gu' ? 'સંક્ષિપ્ત કરો' : 'संक्षिप्त करें') : (lang === 'en' ? 'Shastric Proof' : lang === 'gu' ? 'શાસ્ત્રોક્ત પ્રમાણ' : 'शास्त्रोक्त प्रमाण देखें')}
                          </button>
                        </div>

                        {/* Tithi Span */}
                        <div className="text-[11px] text-stone-600 bg-amber-50/70 p-2 rounded-xl border border-amber-100 flex items-center justify-between gap-2 flex-wrap">
                          <span>
                            <strong>{lang === 'en' ? 'Starts:' : lang === 'gu' ? 'પ્રારંભ:' : 'प्रारंभ:'}</strong> {formatTithiTiming(rec.tithiStart, lang)}
                          </span>
                          <span>
                            <strong>{lang === 'en' ? 'Ends:' : lang === 'gu' ? 'સમાપ્તિ:' : 'समाप्ति:'}</strong> {formatTithiTiming(rec.tithiEnd, lang)}
                          </span>
                        </div>

                        {/* Decision Reason */}
                        <div className="text-xs text-stone-800 leading-relaxed">
                          <strong>{lang === 'en' ? 'Decision & Why This Day:' : lang === 'gu' ? 'નિર્ણય અને આ જ દિવસ કેમ:' : 'निर्णय एवं यही दिन क्यों:'}</strong> {formatDecisionReason(rec, lang)}
                        </div>

                        {/* Expanded Shastric Shloka & Proof */}
                        {isExpanded && (
                          <div className="mt-2 p-2.5 rounded-xl bg-[#4A2610] text-amber-100 text-xs space-y-1.5 animate-in fade-in duration-150">
                            <span className="text-[10px] font-bold text-amber-300 block">
                              📜 {lang === 'en' ? 'Dharmasindhu / Nirnayasindhu Shloka Proof:' : lang === 'gu' ? 'ધર્મસિંધુ / નિર્ણયસિંધુ શ્લોક પ્રમાણ:' : 'धर्मसिन्धु / निर्णयसिन्धु श्लोक प्रमाण:'}
                            </span>
                            <p className="font-serif italic text-amber-200 text-[11px] border-l-2 border-amber-400 pl-2">
                              {rec.shastricPramana}
                            </p>
                            {rec.alternateDateNote && (
                              <p className="text-[10px] text-amber-300/80 pt-0.5">
                                ⚠️ <strong>{lang === 'en' ? 'Why other day is rejected:' : lang === 'gu' ? 'અન્ય દિવસ કેમ ત્યાજ્ય છે:' : 'अन्य दिन क्यों त्याज्य है:'}</strong> {formatAlternateNote(rec, lang)}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-xs text-stone-500">
                    {lang === 'en' ? 'No festival records found. Please adjust filters.' : lang === 'gu' ? 'કોઈ પર્વ રેકોર્ડ મળ્યો નથી.' : 'कोई पर्व रिकॉर्ड नहीं मिला। कृपया फ़िल्टर बदलें।'}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: SHASTRIC RULES */}
          {activeTab === 'rules' && (
            <div className="space-y-3">
              <div className="text-xs text-stone-700 bg-amber-50 p-3 rounded-2xl border border-amber-200 leading-relaxed">
                {lang === 'en'
                  ? "According to Sanatan Dharmashastra (Dharmasindhu, Nirnayasindhu, Hemadri), the 'Kala-Vyapti Siddhanta' (Time-Span Doctrine) is the supreme authority for deciding festival dates when dual tithis occur. Below are the 7 primary Shastric Kala-Vyapti rules:"
                  : lang === 'gu'
                  ? "સનાતન ધર્મશાસ્ત્ર (ધર્મસિંધુ, નિર્ણયસિંધુ, હેમાદ્રિ) અનુસાર વ્રત કે પર્વના નિર્ણયમાં 'કાલ-વ્યાપ્તિ સિદ્ધાંત' જ સર્વોચ્ચ પ્રમાણ છે. નીચે ૭ મુખ્ય કાલ-વ્યાપ્તિ નિયમો આપેલા છે:"
                  : "सनातन धर्मशास्त्र (धर्मसिन्धु, निर्णयसिन्धु, हेमाद्रि) के अनुसार किसी भी व्रत अथवा पर्व के निर्णय में 'काल-व्याप्ति सिद्धांत' ही सर्वोपरि प्रमाण है। नीचे ७ प्रमुख काल-व्याप्ति नियम दिए गए हैं:"}
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
                          {lang === 'en' ? rule.name : lang === 'gu' ? (rule.guName || rule.hindiName) : rule.hindiName}
                        </h4>
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full inline-block">
                          {lang === 'en' ? 'Karma-Kala:' : lang === 'gu' ? 'કર્મકાળ:' : 'कर्मकाल:'} {lang === 'en' ? (rule.karmaKalaEn || rule.karmaKala) : lang === 'gu' ? (rule.karmaKalaGu || rule.karmaKala) : rule.karmaKala}
                        </span>
                      </div>
                      <span className="text-[10px] text-stone-500 font-bold">
                        {lang === 'en' ? 'Source:' : lang === 'gu' ? 'સ્રોત:' : 'स्रोत:'} {lang === 'en' ? (rule.sourceEn || rule.source) : lang === 'gu' ? (rule.sourceGu || rule.source) : rule.source}
                      </span>
                    </div>

                    <p className="text-xs text-stone-700 leading-relaxed">
                      <strong>{lang === 'en' ? 'Core Principle:' : lang === 'gu' ? 'મૂળ સિદ્ધાંત:' : 'मूल सिद्धांत:'}</strong> {lang === 'en' ? (rule.principleEn || rule.principle) : lang === 'gu' ? (rule.principleGu || rule.principle) : rule.principle}
                    </p>

                    <div className="p-2.5 rounded-xl bg-[#4A2610] text-amber-100 text-xs space-y-1">
                      <span className="text-[10px] font-bold text-amber-300 block">
                        {lang === 'en' ? 'Sanskrit Shloka Proof:' : lang === 'gu' ? 'સંસ્કૃત શ્લોક પ્રમાણ:' : 'संस्कृत श्लोक प्रमाण:'}
                      </span>
                      <p className="font-serif italic text-amber-200 text-xs border-l-2 border-amber-400 pl-2">
                        {rule.sanskritShloka}
                      </p>
                    </div>

                    <div className="p-2 rounded-xl bg-orange-50 border border-orange-200/70 text-xs text-orange-950">
                      <strong>{lang === 'en' ? 'Dual-Tithi Resolution:' : lang === 'gu' ? 'દ્વિ-તિથિ સમાધાન:' : 'द्वि-तिथि संशय समाधान:'}</strong> {lang === 'en' ? (rule.dualTithiRuleEn || rule.dualTithiRule) : lang === 'gu' ? (rule.dualTithiRuleGu || rule.dualTithiRule) : rule.dualTithiRule}
                    </div>

                    <div className="text-[11px] text-stone-600 flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-stone-800">{lang === 'en' ? 'Key Examples:' : lang === 'gu' ? 'મુખ્ય ઉદાહરણ:' : 'प्रमुख उदाहरण:'}</span>
                      {(lang === 'en' && rule.examplesEn ? rule.examplesEn : lang === 'gu' && rule.examplesGu ? rule.examplesGu : rule.examples).map((ex, i) => (
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
                  {lang === 'en' ? 'Astronomical Formula (Siddhanta)' : lang === 'gu' ? 'ખગોળીય સૂત્ર' : 'खगोलीय सूत्र (Astronomical Formula)'}
                </span>
                <h4 className="text-base sm:text-lg font-black font-mono text-amber-200 tracking-wider">
                  {lang === 'en' ? 'Tithi = ⌊ (λ_Moon - λ_Sun) mod 360° / 12° ⌋ + 1' : 'तिथि = ⌊ (λ_Moon - λ_Sun) mod 360° / 12° ⌋ + 1'}
                </h4>
                <p className="text-xs text-amber-100/80 leading-relaxed">
                  {lang === 'en'
                    ? 'A tithi is defined as the 12° angular advance of the Moon relative to the Sun. When the Moon is conjunct with the Sun (0° elongation), it is Amavasya (New Moon). When directly opposite (180°), it is Purnima (Full Moon).'
                    : lang === 'gu'
                    ? 'ચંદ્ર સૂર્યથી ૧૨ અંશ આગળ વધે તેને એક તિથિ કહે છે. જ્યારે ચંદ્ર અને સૂર્ય એક જ અંશ (૦°) પર હોય ત્યારે અમાસ, અને ૧૮૦° પર સામસામે હોય ત્યારે પૂર્ણિમા થાય છે.'
                    : 'चन्द्रमा द्वारा सूर्य से सापेक्ष १२ अंश (12°) आगे निकलना एक तिथि कहलाता है। जब चन्द्रमा सूर्य के साथ ०° पर होता है तो अमावस्या, और १८०° पर होता है तो पूर्णिमा होती है।'}
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
        <div className="p-3 border-t border-amber-200 bg-amber-100/50 flex items-center justify-between text-xs shrink-0">
          <span style={{ color: '#5C3A21' }} className="font-bold">
            {lang === 'en'
              ? 'Dharma Protects Those Who Uphold It • Dharmasindhu & Nirnayasindhu Certified'
              : lang === 'gu'
              ? 'ધર્મો રક્ષતિ રક્ષિતઃ • નિર્ણયસિંધુ અને ધર્મસિંધુ સંમત'
              : 'धर्मो रक्षति रक्षितः • निर्णयसिन्धु व धर्मसिन्धु सम्मत'}
          </span>
          <button
            type="button"
            onClick={onClose}
            style={{ backgroundColor: '#6D3414', color: '#FFFFFF' }}
            className="bx-dark-btn px-4 py-1.5 rounded-xl bg-[#6D3414] hover:bg-[#5C2D11] text-white font-bold transition cursor-pointer shadow-xs"
          >
            <span style={{ color: '#FFFFFF' }}>{lang === 'en' ? 'Close' : lang === 'gu' ? 'બંધ કરો' : 'बंद करें'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TithiNirnayaModal;
