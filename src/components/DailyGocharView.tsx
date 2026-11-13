import React, { useState, useMemo } from 'react';
import { KundaliData, SavedLocation } from '../types';
import { calculateDailyTransits, PlanetTransitInfo } from '../services/sadesati';
import { calculateDailyGochar, DailyGocharData } from '../services/gochar';
import { RASHIS } from '../services/astronomy';
import { Sparkles, Calendar, ArrowRight, Shield, Star, Compass, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { useLanguage } from '../i18n';
import { trPlanet, trRashi, trVedic } from '../i18n/vedicTranslate';
import { triggerHapticSelection } from '../utils/haptics';

function pickL<T>(lang: string, hi: T, en: T, gu: T): T {
  const c = (lang || 'hi').slice(0, 2).toLowerCase();
  if (c === 'en') return en;
  if (c === 'gu') return gu;
  return hi;
}

interface DailyGocharViewProps {
  activeKundali: KundaliData | null;
  currentLocation: SavedLocation;
  onNavigateToKundali?: () => void;
  onPrevChapter?: () => void;
  onNextChapter?: () => void;
}

export const DailyGocharView: React.FC<DailyGocharViewProps> = ({
  activeKundali,
  currentLocation,
  onNavigateToKundali,
  onPrevChapter,
  onNextChapter,
}) => {
  const { language } = useLanguage();
  const cLang = (language || 'hi').slice(0, 2).toLowerCase();
  const [selectedDateStr, setSelectedDateStr] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });

  const selectedDate = useMemo(() => new Date(selectedDateStr), [selectedDateStr]);

  const gocharData: DailyGocharData = useMemo(() => {
    return calculateDailyGochar(
      selectedDate,
      currentLocation.latitude || 23.1765,
      currentLocation.longitude || 75.7885
    );
  }, [selectedDate, currentLocation]);

  const transitsFromMoon: PlanetTransitInfo[] = useMemo(() => {
    if (!activeKundali) return [];
    return calculateDailyTransits(activeKundali, selectedDate, cLang);
  }, [activeKundali, selectedDate, cLang]);

  return (
    <div className="w-full h-full min-h-0 flex flex-col overflow-y-auto overscroll-contain bg-[#FAF3E3] text-[#1F1006] select-none p-2.5 sm:p-4 space-y-3 pb-24">
      {/* Top Header & Date Controller */}
      <div className="bg-[#FFF8EB] border-2 border-[#D6B892] rounded-2xl p-3 shadow-xs flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8C4A00] to-[#5C3A21] text-amber-200 flex items-center justify-center text-xl shadow-xs shrink-0">
            🪐
          </div>
          <div>
            <h2 className="font-granth font-black text-sm sm:text-base text-[#5C3A21] leading-tight">
              {pickL(
                cLang,
                'दैनिक ग्रह गोचर चक्र (Live Planetary Transits)',
                'Daily Planetary Transits (Live Gochar Chakra)',
                'દૈનિક ગ્રહ ગોચર ચક્ર (Live Planetary Transits)'
              )}
            </h2>
            <p className="text-[11px] text-[#8C6239]">
              {pickL(
                cLang,
                'वर्तमान आकाश में ग्रहों की वास्तविक स्थिति एवं चंद्र राशि फल',
                'Real-time sidereal planetary positions and Moon-sign transit results',
                'વર્તમાન આકાશમાં ગ્રહોની વાસ્તવિક સ્થિતિ અને ચંદ્ર રાશિ ફળ'
              )}
            </p>
          </div>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-2 bg-[#FAF2E4] px-2.5 py-1.5 rounded-xl border border-[#D6B892]">
          <Calendar className="w-4 h-4 text-[#8C4A00]" />
          <span className="text-xs font-bold text-[#5C3A21]">
            {pickL(cLang, 'गोचर तिथि:', 'Transit Date:', 'ગોચર તિથિ:')}
          </span>
          <input
            type="date"
            value={selectedDateStr}
            onClick={(e) => {
              try {
                (e.currentTarget as any).showPicker?.();
              } catch {}
            }}
            onChange={(e) => {
              setSelectedDateStr(e.target.value);
              triggerHapticSelection();
            }}
            className="bg-white border border-[#D6B892] rounded-lg px-2 py-0.5 text-xs text-[#5C3A21] outline-none font-bold cursor-pointer"
          />
        </div>
      </div>

      {/* Active Kundali Moon Sign Alert or Prompt */}
      {activeKundali ? (
        <div className="bg-gradient-to-r from-[#FFFDF9] via-[#FFF8EB] to-[#FFFDF9] border-2 border-amber-400/80 rounded-2xl p-3 shadow-xs flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">🌙</span>
            <div>
              <span className="text-xs font-bold text-[#5C3A21]">
                {pickL(cLang, 'जातक:', 'Native:', 'જાતક:')}{' '}
                <strong className="font-black text-[#6E1409]">{activeKundali.name}</strong> •{' '}
                {pickL(cLang, 'जन्म चंद्र राशि:', 'Natal Moon Sign:', 'જન્મ ચંદ્ર રાશિ:')}{' '}
                <strong className="font-black text-[#8C4A00]">
                  {trRashi(activeKundali.moonRashi || 'मेष', cLang)}
                </strong>
              </span>
              <p className="text-[10px] text-stone-600">
                {pickL(
                  cLang,
                  '(नीचे दिए गए गोचर फल आपकी जन्म चंद्र राशि के सापेक्ष फलदीपिका के नियमानुसार हैं)',
                  '(Transit effects below are evaluated from your Natal Moon sign per Phaladeepika)',
                  '(નીચે આપેલા ગોચર ફળ તમારી જન્મ ચંદ્ર રાશિ અનુસાર ફળદીપિકાના નિયમો મુજબ છે)'
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-[#8C4A00] font-black text-xs border border-amber-300">
              {pickL(cLang, 'आकाश चंद्र:', 'Transit Moon:', 'આકાશ ચંદ્ર:')}{' '}
              {trRashi(gocharData.moonRashi, cLang)}{' '}
              {pickL(cLang, 'राशि', 'Sign', 'રાશિ')}
            </span>
          </div>
        </div>
      ) : (
        <div className="bg-[#FFF8EB] border border-amber-400 rounded-2xl p-3 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-[#5C3A21]">
            <Compass className="w-4 h-4 text-[#8C4A00] shrink-0" />
            <span>
              {pickL(
                cLang,
                'व्यक्तिगत गोचर फल देखने के लिए अपनी जन्म पत्रिका चुनें।',
                'Select your Kundali profile to view personalized Moon-sign transit predictions.',
                'વ્યક્તિગત ગોચર ફળ જોવા માટે તમારી જન્મ કુંડળી પસંદ કરો.'
              )}
            </span>
          </div>
          {onNavigateToKundali && (
            <button
              type="button"
              onClick={onNavigateToKundali}
              className="px-3 py-1 bg-[#6E1409] text-white rounded-xl font-bold text-xs shrink-0 cursor-pointer"
            >
              {pickL(cLang, 'कुंडली चुनें →', 'Select Kundali →', 'કુંડળી પસંદ કરો →')}
            </button>
          )}
        </div>
      )}

      {/* Sky Highlights Bento Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="bg-[#FFFDF9] border border-[#E2D2BE] rounded-xl p-2.5 text-center shadow-xs">
          <div className="text-[10px] font-bold text-[#8C6239] uppercase">
            {pickL(cLang, 'वर्तमान लग्न', 'Current Ascendant', 'વર્તમાન લગ્ન')}
          </div>
          <div className="font-granth font-black text-sm text-[#6E1409] mt-0.5">
            {trRashi(gocharData.lagnaRashi, cLang)} ({gocharData.lagnaDegree.toFixed(1)}°)
          </div>
        </div>

        <div className="bg-[#FFFDF9] border border-[#E2D2BE] rounded-xl p-2.5 text-center shadow-xs">
          <div className="text-[10px] font-bold text-[#8C6239] uppercase">
            {pickL(cLang, 'वक्री ग्रह', 'Retrograde Planets', 'વક્રી ગ્રહ')}
          </div>
          <div className="font-granth font-black text-sm text-rose-800 mt-0.5">
            {gocharData.retrogradePlanets.length > 0
              ? gocharData.retrogradePlanets.map((p) => trPlanet(p.planet, cLang)).join(', ')
              : pickL(cLang, 'कोई वक्री नहीं', 'None Retrograde', 'કોઈ વક્રી નથી')}
          </div>
        </div>

        <div className="bg-[#FFFDF9] border border-[#E2D2BE] rounded-xl p-2.5 text-center shadow-xs">
          <div className="text-[10px] font-bold text-[#8C6239] uppercase">
            {pickL(cLang, 'अस्त ग्रह', 'Combust Planets', 'અસ્ત ગ્રહ')}
          </div>
          <div className="font-granth font-black text-sm text-amber-800 mt-0.5">
            {gocharData.combustPlanets.length > 0
              ? gocharData.combustPlanets.map((p) => trPlanet(p.planet, cLang)).join(', ')
              : pickL(cLang, 'कोई अस्त नहीं', 'None Combust', 'કોઈ અસ્ત નથી')}
          </div>
        </div>

        <div className="bg-[#FFFDF9] border border-[#E2D2BE] rounded-xl p-2.5 text-center shadow-xs">
          <div className="text-[10px] font-bold text-[#8C6239] uppercase">
            {pickL(cLang, 'अगली चंद्र राशि', 'Next Moon Sign', 'આગામી ચંદ્ર રાશિ')}
          </div>
          <div className="font-granth font-black text-sm text-[#5C3A21] mt-0.5">
            {trRashi(gocharData.nextMoonRashi, cLang)}{' '}
            {pickL(
              cLang,
              `(लगभग ${gocharData.moonHoursToNextSign.toFixed(0)} घंटे में)`,
              `(in ~${gocharData.moonHoursToNextSign.toFixed(0)} hrs)`,
              `(અંદાજે ${gocharData.moonHoursToNextSign.toFixed(0)} કલાકમાં)`
            )}
          </div>
        </div>
      </div>

      {/* 9 Planets Real-Time Transit Cards */}
      <div className="space-y-2">
        <h3 className="font-granth font-black text-xs sm:text-sm text-[#5C3A21] flex items-center gap-1.5 px-1">
          <Sparkles className="w-4 h-4 text-amber-600" />
          <span>
            {pickL(
              cLang,
              `नवग्रह गोचर स्थिति एवं व्यक्तिगत फलदेश (${transitsFromMoon.length > 0 ? 'चंद्र राशि से' : 'आकाशीय'})`,
              `Navagraha Transit Status & Personal Effects (${transitsFromMoon.length > 0 ? 'From Moon Sign' : 'Sidereal Sky'})`,
              `નવગ્રહ ગોચર સ્થિતિ અને વ્યક્તિગત ફળાદેશ (${transitsFromMoon.length > 0 ? 'ચંદ્ર રાશિથી' : 'આકાશીય'})`
            )}
          </span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {gocharData.planets.map((p) => {
            const transitInfo = transitsFromMoon.find((t) => t.planet === p.planet);
            const isFavorable = transitInfo
              ? transitInfo.isBenefic
              : p.dignity === 'उच्च' || p.dignity === 'स्वराशि' || p.dignity === 'मित्र';
            const isUnfavorable = transitInfo
              ? !transitInfo.isBenefic && (transitInfo.nature === 'अशुभ' || transitInfo.nature === 'Challenging' || transitInfo.nature === 'અશુભ')
              : false;

            const statusLabel =
              (p.isRetrograde
                ? pickL(cLang, 'वक्री (R)', 'Retrograde (R)', 'વક્રી (R)')
                : pickL(cLang, 'मार्गी', 'Direct', 'માર્ગી')) +
              (p.isCombust ? pickL(cLang, ' • अस्त', ' • Combust', ' • અસ્ત') : '');

            return (
              <div
                key={p.planet}
                className={`bg-[#FFFDF9] border-2 rounded-2xl p-3 shadow-xs space-y-2 transition ${
                  isFavorable ? 'border-amber-300' : 'border-stone-300'
                }`}
              >
                {/* Planet Row Header */}
                <div className="flex items-center justify-between border-b border-[#E8DCCB] pb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{p.symbol}</span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-granth font-black text-sm text-[#462B17]">
                          {trPlanet(p.planet, cLang)}
                        </span>
                        {p.isRetrograde && (
                          <span className="px-1.5 py-0.2 rounded bg-rose-100 text-rose-800 text-[9px] font-black border border-rose-300">
                            {pickL(cLang, 'वक्री (R)', 'Retrograde (R)', 'વક્રી (R)')}
                          </span>
                        )}
                        {p.isCombust && (
                          <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[9px] font-black border border-amber-300">
                            {pickL(cLang, 'अस्त (Combust)', 'Combust', 'અસ્ત (Combust)')}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-stone-500">{p.englishName}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                      p.dignity === 'उच्च'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : p.dignity === 'नीच'
                        ? 'bg-rose-100 text-rose-800 border border-rose-300'
                        : 'bg-amber-100 text-[#8C4A00] border border-amber-300'
                    }`}>
                      {statusLabel}
                    </span>
                    <div className="text-[10px] text-stone-600 font-bold mt-0.5">
                      {trRashi(p.rashi, cLang)} • {p.dms}
                    </div>
                  </div>
                </div>

                {/* Transit Position & Prediction Details */}
                <div className="bg-[#FAF2E4]/80 rounded-xl p-2 text-xs space-y-1">
                  <div className="flex items-center justify-between text-[11px] flex-wrap gap-1">
                    <span className="text-[#8C6239] font-bold">
                      {pickL(cLang, 'नक्षत्र:', 'Nakshatra:', 'નક્ષત્ર:')}{' '}
                      <strong className="text-[#462B17]">
                        {trVedic(p.nakshatra, cLang)} ({pickL(cLang, `चरण ${p.pada}`, `Pada ${p.pada}`, `ચરણ ${p.pada}`)})
                      </strong>
                    </span>
                    {transitInfo && (
                      <span className={`font-black text-[10px] px-2 py-0.2 rounded ${
                        transitInfo.isBenefic
                          ? 'bg-emerald-600 text-white'
                          : isUnfavorable
                          ? 'bg-rose-700 text-white'
                          : 'bg-amber-600 text-white'
                      }`}>
                        {pickL(
                          cLang,
                          `चंद्र से ${transitInfo.houseFromMoon}वां भाव (${transitInfo.nature} फल)`,
                          `House ${transitInfo.houseFromMoon} from Moon (${transitInfo.nature})`,
                          `ચંદ્રથી ${transitInfo.houseFromMoon}મો ભાવ (${transitInfo.nature} ફળ)`
                        )}
                      </span>
                    )}
                  </div>

                  {transitInfo && (
                    <p className="text-[11px] font-medium text-[#4A1805] leading-relaxed pt-0.5">
                      {transitInfo.prediction}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DailyGocharView;
