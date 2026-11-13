import React, { useState } from 'react';
import { VedicPanchangData, SavedLocation } from '../types';
import { COMMON_INDIAN_CITIES, calculateYatraShool, type IndianCity } from '../services/disha';
import { CheckCircle2, ShieldAlert, Search, X } from 'lucide-react';
import { DigitalCompass } from './DigitalCompass';
import { useTranslation, useLanguage } from '../i18n';
import { trVedic, trWeekday } from '../i18n/vedicTranslate';
import { UniversalStoryDeck, StorySlideItem } from './UniversalStoryDeck';
import { triggerHapticSelection } from '../utils/haptics';

interface YatraViewProps {
  panchang: VedicPanchangData;
  currentLocation: SavedLocation;
  onOpenUmaModal?: (query?: string) => void;
  onPrevChapter?: () => void;
  onNextChapter?: () => void;
}

const REGION_FILTERS = [
  { id: 'all', hi: 'सभी', en: 'All', gu: 'બધા' },
  { id: 'pilgrimage', hi: '🚩 तीर्थ व धाम', en: '🚩 Tirtha & Dham', gu: '🚩 તીર્થ અને ધામ' },
  { id: 'मध्य प्रदेश', hi: 'मध्य प्रदेश', en: 'Madhya Pradesh', gu: 'મધ્ય પ્રદેશ' },
  { id: 'उत्तर प्रदेश', hi: 'उत्तर प्रदेश', en: 'Uttar Pradesh', gu: 'ઉત્તર પ્રદેશ' },
  { id: 'गुजरात', hi: 'गुजरात', en: 'Gujarat', gu: 'ગુજરાત' },
  { id: 'उत्तराखंड', hi: 'उत्तराखंड', en: 'Uttarakhand', gu: 'ઉત્તરાખંડ' },
  { id: 'राजस्थान', hi: 'राजस्थान', en: 'Rajasthan', gu: 'રાજસ્થાન' },
  { id: 'महाराष्ट्र', hi: 'महाराष्ट्र', en: 'Maharashtra', gu: 'મહારાષ્ટ્ર' },
  { id: 'हरियाणा', hi: 'हरियाणा', en: 'Haryana', gu: 'હરિયાણા' },
  { id: 'पंजाब', hi: 'पंजाब', en: 'Punjab', gu: 'પંજાબ' },
  { id: 'बिहार', hi: 'बिहार', en: 'Bihar', gu: 'બિહાર' },
];

interface YatraCityPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  selectedCityName: string;
  onSelectCity: (city: IndianCity) => void;
}

function YatraCityPickerModal({
  isOpen,
  onClose,
  title,
  selectedCityName,
  onSelectCity,
}: YatraCityPickerModalProps) {
  const { language } = useLanguage();
  const cLang = (language || 'hi').slice(0, 2).toLowerCase();
  const L = <T,>(hi: T, en: T, gu: T): T => (cLang === 'en' ? en : cLang === 'gu' ? gu : hi);

  const [search, setSearch] = useState('');
  const [regionFilter, setRegionFilter] = useState('all');

  if (!isOpen) return null;

  const needle = search.trim().toLowerCase();
  const filtered = COMMON_INDIAN_CITIES.filter((c) => {
    if (regionFilter === 'pilgrimage' && c.type !== 'pilgrimage') return false;
    if (regionFilter !== 'all' && regionFilter !== 'pilgrimage' && c.state !== regionFilter) return false;
    if (!needle) return true;
    return `${c.name} ${c.state}`.toLowerCase().includes(needle);
  });

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-md max-h-[85vh] sm:max-h-[80vh] h-[540px] flex flex-col rounded-t-3xl sm:rounded-3xl border-2 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200"
        style={{
          background: "linear-gradient(180deg, var(--bx-panel) 0%, color-mix(in srgb, var(--bx-panel) 92%, var(--bx-cream)) 100%)",
          borderColor: "var(--bx-gold)",
          color: "var(--bx-ink)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          className="shrink-0 p-3 sm:p-4 border-b flex items-center justify-between"
          style={{ borderColor: "var(--bx-line)" }}
        >
          <div className="flex items-center gap-2">
            <span className="text-xl">🧭</span>
            <div>
              <h3 className="text-sm sm:text-base font-black font-granth" style={{ color: "var(--bx-header)" }}>
                {title}
              </h3>
              <p className="text-[10px] text-[#8C6239] font-medium">
                {L(`${filtered.length} नगर/तीर्थ उपलब्ध`, `${filtered.length} cities/tirthas available`, `${filtered.length} નગર/તીર્થ ઉપલબ્ધ`)}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center border cursor-pointer transition hover:opacity-80 active:scale-95"
            style={{
              backgroundColor: "var(--bx-cream)",
              borderColor: "var(--bx-line)",
              color: "var(--bx-ink)",
            }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="shrink-0 p-2.5 pb-1 space-y-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-amber-800/60" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={L(
                'नगर या तीर्थ खोजें (उदा: काशी, उज्जैन, अयोध्या, दिल्ली)...',
                'Search city or tirtha (e.g., Kashi, Ujjain, Ayodhya, Delhi)...',
                'નગર કે તીર્થ શોધો (દા.ત. કાશી, ઉજ્જૈન, અયોધ્યા, દિલ્હી)...'
              )}
              className="w-full rounded-xl pl-9 pr-8 py-2 text-xs sm:text-sm font-semibold outline-none border"
              style={{
                backgroundColor: "var(--bx-panel)",
                borderColor: "var(--bx-line)",
                color: "var(--bx-ink)",
              }}
              autoFocus
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8C6239] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Region Chips */}
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {REGION_FILTERS.map((r) => {
              const active = regionFilter === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => {
                    triggerHapticSelection();
                    setRegionFilter(r.id);
                  }}
                  className={`shrink-0 px-2.5 py-1 rounded-full text-[11px] font-bold border transition cursor-pointer ${
                    active ? 'shadow-xs scale-102' : 'opacity-85'
                  }`}
                  style={{
                    backgroundColor: active ? "var(--bx-header)" : "var(--bx-cream)",
                    color: active ? "#FFFFFF" : "var(--bx-ink)",
                    borderColor: active ? "var(--bx-gold)" : "var(--bx-line)",
                  }}
                >
                  {L(r.hi, r.en, r.gu)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Scrollable City List */}
        <div
          className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain p-2.5 space-y-1.5"
          style={{
            WebkitOverflowScrolling: "touch",
            touchAction: "pan-y",
          }}
        >
          {filtered.length === 0 ? (
            <div className="text-center py-8 text-xs font-semibold text-[#8C6239]">
              {L('कोई नगर या तीर्थ नहीं मिला।', 'No city or tirtha found.', 'કોઈ નગર કે તીર્થ મળ્યું નથી.')}
            </div>
          ) : (
            filtered.map((c) => {
              const isSelected = c.name === selectedCityName;
              const matchedRegion = REGION_FILTERS.find((rf) => rf.id === c.state);
              const stateLabel = matchedRegion ? L(matchedRegion.hi, matchedRegion.en, matchedRegion.gu) : c.state;
              return (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => {
                    triggerHapticSelection();
                    onSelectCity(c);
                    onClose();
                  }}
                  className={`w-full text-left p-2.5 rounded-xl border transition flex items-center justify-between cursor-pointer ${
                    isSelected ? 'shadow-xs border-2' : 'hover:opacity-95'
                  }`}
                  style={{
                    backgroundColor: isSelected ? "var(--bx-cream)" : "var(--bx-panel)",
                    borderColor: isSelected ? "var(--bx-gold)" : "var(--bx-line)",
                    color: "var(--bx-ink)",
                    touchAction: "pan-y",
                  }}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-base shrink-0">
                      {c.type === 'pilgrimage' ? '🚩' : '📍'}
                    </span>
                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm font-bold truncate">
                        {c.name}
                      </div>
                      <div className="text-[10px] text-[#8C6239] font-medium flex items-center gap-1.5">
                        <span>{stateLabel}</span>
                        {c.type === 'pilgrimage' && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded-full font-bold bg-amber-500/15 text-amber-900 border border-amber-400/40">
                            {L('तीर्थ क्षेत्र', 'Tirtha Kshetra', 'તીર્થ ક્ષેત્ર')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {isSelected && (
                    <span
                      className="shrink-0 text-[11px] font-black px-2 py-0.5 rounded-md border flex items-center gap-1"
                      style={{
                        backgroundColor: "var(--bx-header)",
                        color: "#FFFFFF",
                        borderColor: "var(--bx-gold)",
                      }}
                    >
                      {L('✓ चयनित', '✓ Selected', '✓ પસંદ કરેલ')}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export const YatraView: React.FC<YatraViewProps> = ({
  panchang,
  currentLocation,
  onOpenUmaModal,
  onPrevChapter,
  onNextChapter,
}) => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const cLang = (language || 'hi').slice(0, 2).toLowerCase();
  const L = <T,>(hi: T, en: T, gu: T): T => (cLang === 'en' ? en : cLang === 'gu' ? gu : hi);

  const [origin, setOrigin] = useState<SavedLocation>(currentLocation);
  const defaultDest =
    COMMON_INDIAN_CITIES.find((c) => c.name.includes('Varanasi')) ||
    COMMON_INDIAN_CITIES[1] || {
      name: 'वाराणसी (Varanasi / Kashi)',
      latitude: 25.3176,
      longitude: 82.9739,
      state: 'उत्तर प्रदेश',
    };
  const [destination, setDestination] = useState<SavedLocation>(defaultDest);
  const [pickerTarget, setPickerTarget] = useState<'origin' | 'destination' | null>(null);

  const result = calculateYatraShool(
    origin.name,
    origin.latitude,
    origin.longitude,
    destination.name,
    destination.latitude,
    destination.longitude,
    panchang.date,
    cLang
  );

  const slides: StorySlideItem[] = [
    // Slide 1: Today's Disha Shool
    {
      id: 'disha-shool',
      title: L('आज का दिशाशूल एवं परिहार', "Today's Dishashool & Parihar", 'આજનો દિશાશૂળ અને પરિહાર'),
      subtitle: `${trWeekday(panchang.weekday, cLang)} • ${trVedic(result.shoolDirection, cLang)} ${L('दिशा', 'Direction', 'દિશા')}`,
      badge: L('सावधानी', 'Caution', 'સાવચેતી'),
      icon: '🧭',
      voiceText: L(
        `आज ${trWeekday(panchang.weekday, 'hi')} है। आज का दिशाशूल ${result.shoolDirection} दिशा में है। परिहार: ${result.remedy}।`,
        `Today is ${trWeekday(panchang.weekday, 'en')}. Dishashool is in the ${trVedic(result.shoolDirection, 'en')} direction. Remedy: ${result.remedy}.`,
        `આજે ${trWeekday(panchang.weekday, 'gu')} છે. આજનો દિશાશૂળ ${trVedic(result.shoolDirection, 'gu')} દિશામાં છે. પરિહાર: ${result.remedy}.`
      ),
      content: (
        <div className="h-full flex flex-col justify-between py-1 space-y-2">
          <div className="p-4 rounded-2xl bg-amber-50/90 border-2 border-amber-400 shadow-sm space-y-2.5 my-auto">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#8C6239] uppercase">{L('दिशाशूल वेला', 'DISHASHOOL PERIOD', 'દિશાશૂળ વેળા')}</span>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-900 font-black text-[10px]">
                {L('वर्जित दिशा', 'Avoid Direction', 'વર્જિત દિશા')}
              </span>
            </div>

            <div className="text-center py-2">
              <div className="text-2xl sm:text-3xl font-black font-granth text-[#462B17]">
                {trVedic(result.shoolDirection, cLang)} {L('दिशा', 'Direction', 'દિશા')}
              </div>
              <p className="text-xs text-[#735133] mt-1">
                {L(
                  `आज ${trVedic(result.shoolDirection, 'hi')} दिशा में अनावश्यक यात्रा से बचना चाहिए।`,
                  `Avoid non-essential travel towards ${trVedic(result.shoolDirection, 'en')} today.`,
                  `આજે ${trVedic(result.shoolDirection, 'gu')} દિશામાં બિનજરૂરી મુસાફરી ટાળવી જોઈએ.`
                )}
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-white border border-amber-200 text-xs">
              <span className="font-bold text-[#B56A00]">{L('🛡️ आवश्यक यात्रा परिहार: ', '🛡️ Essential Travel Remedy: ', '🛡️ આવશ્યક યાત્રા પરિહાર: ')}</span>
              <span className="text-[#5C3A21] font-medium">{result.remedy}</span>
            </div>
          </div>

          <div className="text-[10px] text-center text-[#8C6239]">
            {L(
              'यदि यात्रा अनिवार्य हो तो परिहार ग्रहण कर व इष्टदेव का स्मरण कर निकलें।',
              'If travel is urgent, take the prescribed Parihar and remember your Ishta Devata before departing.',
              'જો યાત્રા અનિવાર્ય હોય તો પરિહાર ગ્રહણ કરી અને ઇષ્ટદેવનું સ્મરણ કરીને પ્રસ્થાન કરો.'
            )}
          </div>
        </div>
      ),
    },

    // Slide 2: Digital Compass
    {
      id: 'compass',
      title: L('वैदिक यात्रा दिशा चक्र', 'Vedic Travel Direction Compass', 'વૈદિક યાત્રા દિશા ચક્ર'),
      subtitle: L('दिशाशूल व यात्रा कोण', 'Dishashool & Bearing Angle', 'દિશાશૂળ અને યાત્રા ખૂણો'),
      badge: L('दिशा ज्ञान', 'Direction Guide', 'દિશા જ્ઞાન'),
      icon: '🧭',
      voiceText: L('वैदिक यात्रा दिशा चक्र।', 'Vedic travel direction compass.', 'વૈદિક યાત્રા દિશા ચક્ર.'),
      content: (
        <div className="h-full flex flex-col justify-center items-center py-1">
          <div className="w-full max-w-xs scale-90 sm:scale-100">
            <DigitalCompass
              shoolDirectionName={result.shoolDirection}
              targetBearing={result.bearing}
              targetDirectionName={result.direction}
              isDirectionBlocked={result.isDirectionBlocked}
            />
          </div>
        </div>
      ),
    },

    // Slide 3: Route Calculator
    {
      id: 'route-calc',
      title: L('यात्रा मार्ग एवं अनुकूलता', 'Travel Route & Suitability', 'યાત્રા માર્ગ અને અનુકૂળતા'),
      subtitle: `${origin.name.split(' ')[0]} ➔ ${destination.name.split(' ')[0]}`,
      badge: result.isDirectionBlocked
        ? L('दिशाशूल प्रभावित', 'Dishashool Affected', 'દિશાશૂળ પ્રભાવિત')
        : L('यात्रा अनुकूल', 'Travel Favorable', 'યાત્રા અનુકૂળ'),
      icon: '📍',
      voiceText: L(
        `यात्रा मार्ग: ${origin.name} से ${destination.name}।`,
        `Travel route: ${origin.name} to ${destination.name}.`,
        `યાત્રા માર્ગ: ${origin.name} થી ${destination.name}.`
      ),
      content: (
        <div className="h-full flex flex-col justify-between py-1 space-y-2">
          {/* Origin / Dest Selectors with Dedicated Devotional Picker */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                triggerHapticSelection();
                setPickerTarget('origin');
              }}
              className="flex-1 rounded-xl p-2 text-left border shadow-xs transition cursor-pointer hover:border-[#B56A00] active:scale-98"
              style={{
                backgroundColor: "var(--bx-panel)",
                borderColor: "var(--bx-line)",
                color: "var(--bx-ink)",
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#8C6239]">{L('प्रस्थान (Origin)', 'Origin', 'પ્રસ્થાન (Origin)')}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500/15 text-amber-900 font-bold">{L('बदलें ▾', 'Change ▾', 'બદલો ▾')}</span>
              </div>
              <div className="text-xs font-black truncate mt-0.5 flex items-center gap-1" style={{ color: "var(--bx-header)" }}>
                <span>🚩</span>
                <span className="truncate">{origin.name}</span>
              </div>
            </button>

            <button
              type="button"
              title={L('स्थान आपस में बदलें (Swap)', 'Swap Origin & Destination', 'સ્થાન અદલાબદલી કરો (Swap)')}
              onClick={() => {
                triggerHapticSelection();
                const temp = origin;
                setOrigin(destination);
                setDestination(temp);
              }}
              className="w-8 h-8 rounded-full border flex items-center justify-center text-xs font-bold shadow-xs shrink-0 cursor-pointer transition hover:scale-105 active:scale-95"
              style={{
                backgroundColor: "var(--bx-cream)",
                borderColor: "var(--bx-gold)",
                color: "var(--bx-header)",
              }}
            >
              ⇄
            </button>

            <button
              type="button"
              onClick={() => {
                triggerHapticSelection();
                setPickerTarget('destination');
              }}
              className="flex-1 rounded-xl p-2 text-left border shadow-xs transition cursor-pointer hover:border-[#B56A00] active:scale-98"
              style={{
                backgroundColor: "var(--bx-panel)",
                borderColor: "var(--bx-line)",
                color: "var(--bx-ink)",
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#8C6239]">{L('गंतव्य (Destination)', 'Destination', 'ગંતવ્ય (Destination)')}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500/15 text-amber-900 font-bold">{L('बदलें ▾', 'Change ▾', 'બદલો ▾')}</span>
              </div>
              <div className="text-xs font-black truncate mt-0.5 flex items-center gap-1" style={{ color: "var(--bx-header)" }}>
                <span>🎯</span>
                <span className="truncate">{destination.name}</span>
              </div>
            </button>
          </div>

          <div className={`p-3 rounded-xl border-2 my-auto ${
            result.isDirectionBlocked
              ? 'bg-rose-50 border-rose-300 text-rose-950'
              : 'bg-emerald-50 border-emerald-300 text-emerald-950'
          }`}>
            <div className="flex items-center gap-1.5 text-xs font-black mb-1">
              {result.isDirectionBlocked ? (
                <ShieldAlert className="w-4 h-4 text-rose-600" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              )}
              <span>
                {result.isDirectionBlocked
                  ? L('दिशाशूल सम्मुख है', 'Dishashool Lies Ahead', 'દિશાશૂળ સંમુખ છે')
                  : L('मार्ग निर्विघ्न व अनुकूल है', 'Route is Smooth & Favorable', 'માર્ગ નિર્વિઘ્ન અને અનુકૂળ છે')}
              </span>
            </div>
            <p className="text-xs font-medium">
              {L('दिशा:', 'Direction:', 'દિશા:')} {trVedic(result.direction, cLang)} ({Math.round(result.bearing)}°) • {L('दूरी:', 'Distance:', 'અંતર:')} ~{Math.round(result.distanceKm)} {L('किमी', 'km', 'કિમી')}
            </p>
          </div>

          <div className="text-[10px] text-center text-[#8C6239]">
            {L(
              'मार्ग शुद्धि हेतु शुभ चौघड़िया समय में प्रस्थान करें।',
              'Depart during an auspicious Choghadiya period for a blessed journey.',
              'માર્ગ શુદ્ધિ માટે શુભ ચોઘડિયા સમયમાં પ્રસ્થાન કરો.'
            )}
          </div>
        </div>
      ),
    },

    // Slide 4: Yatra Mantra (Keep Chaupai Verbatim!)
    {
      id: 'yatra-mantra',
      title: L('पावन मंगल यात्रा मन्त्र', 'Sacred Auspicious Yatra Mantra', 'પાવન મંગળ યાત્રા મંત્ર'),
      subtitle: L('यात्रा निर्विघ्न सिद्धि', 'Obstacle-Free Journey', 'યાત્રા નિર્વિઘ્ન સિદ્ધિ'),
      badge: L('महामंत्र', 'Mahamantra', 'મહામંત્ર'),
      icon: '🕉️',
      voiceText: 'प्रबिसि नगर कीजै सब काजा। हृदयँ राखि कोसलपुर राजा॥',
      content: (
        <div className="h-full flex flex-col justify-between py-1 space-y-2">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#FFF9EE] to-[#FFEEC9] border-2 border-amber-400 text-center my-auto space-y-2">
            <div className="text-xs font-black text-[#B56A00] tracking-widest">
              ॥ श्री रामचरितमानस ॥
            </div>
            <div className="text-sm sm:text-base font-black font-granth text-[#462B17] leading-relaxed">
              प्रबिसि नगर कीजै सब काजा।<br />
              हृदयँ राखि कोसलपुर राजा॥
            </div>
            <p className="text-xs text-[#735133] pt-1 border-t border-amber-300/60 font-medium">
              {L(
                'भगवान श्री राम व श्री हनुमान जी का स्मरण कर प्रारम्भ की गई यात्रा सदा कल्याणकारी और सिद्धिकारक होती है।',
                'A journey begun by remembering Lord Sri Rama and Sri Hanuman is always auspicious, protected, and successful.',
                'ભગવાન શ્રી રામ અને શ્રી હનુમાનજીનું સ્મરણ કરીને શરૂ કરાયેલી યાત્રા હંમેશા કલ્યાણકારી અને સિદ્ધિકારક હોય છે.'
              )}
            </p>
          </div>
          <div className="text-[10px] text-center text-[#8C6239]">
            {L(
              'शुभमस्तु • यात्रा सफल व मंगलमय हो',
              'Shubhamastu • May your journey be safe and auspicious',
              'શુભમસ્તુ • આપની યાત્રા સફળ અને મંગળમય થાય'
            )}
          </div>
        </div>
      ),
    },
  ];

  return (
    <>
      <UniversalStoryDeck
        slides={slides}
        headerTitle={t('nav.yatra', L('यात्रा दिशाशूल', 'Yatra Dishashool', 'યાત્રા દિશાશૂળ'))}
        headerIcon="🧭"
        chapterNumber={4}
        currentDate={panchang.date}
        onOpenUma={onOpenUmaModal ? () => onOpenUmaModal(L('यात्रा दिशाशूल परामर्श', 'Yatra Dishashool Consultation', 'યાત્રા દિશાશૂળ પરામર્શ')) : undefined}
        onPrevChapter={onPrevChapter}
        onNextChapter={onNextChapter}
        prevChapterLabel={t('nav.muhurat', L('शुभ मुहूर्त', 'Auspicious Muhurat', 'શુભ મુહૂર્ત'))}
        nextChapterLabel={t('nav.kundali', L('कुण्डली', 'Kundali', 'કુંડળી'))}
      />

      {pickerTarget && (
        <YatraCityPickerModal
          isOpen={pickerTarget !== null}
          onClose={() => setPickerTarget(null)}
          title={pickerTarget === 'origin'
            ? L('🚩 प्रस्थान नगर चुनें (Origin)', '🚩 Select Origin City', '🚩 પ્રસ્થાન નગર પસંદ કરો')
            : L('🎯 गंतव्य नगर चुनें (Destination)', '🎯 Select Destination City', '🎯 ગંતવ્ય નગર પસંદ કરો')}
          selectedCityName={pickerTarget === 'origin' ? origin.name : destination.name}
          onSelectCity={(city) => {
            if (pickerTarget === 'origin') {
              setOrigin(city);
            } else {
              setDestination(city);
            }
          }}
        />
      )}
    </>
  );
};

export default YatraView;
