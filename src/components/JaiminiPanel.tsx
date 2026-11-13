import React, { useState, useMemo } from 'react';
import { KundaliData } from '../types';
import { calculateJaiminiAnalysis } from '../services/jaimini';
import { useLanguage } from '../i18n';
import { trPlanet, trRashi } from '../i18n/vedicTranslate';
import {
  Sparkles,
  Zap,
  Crown,
  Compass,
  Award,
  ChevronRight,
  ChevronDown,
  Calendar,
  Star,
  Shield,
  Heart,
} from 'lucide-react';

interface JaiminiPanelProps {
  kundali: KundaliData;
}

export const JaiminiPanel: React.FC<JaiminiPanelProps> = ({ kundali }) => {
  const { language } = useLanguage();
  const lang = (language || 'hi').slice(0, 2).toLowerCase();
  const pick = (hi: string, en: string, gu: string) => (lang === 'en' ? en : lang === 'gu' ? gu : hi);

  const jaimini = useMemo(() => calculateJaiminiAnalysis(kundali, lang), [kundali, lang]);

  const [expandedSign, setExpandedSign] = useState<string | null>(
    jaimini.currentCharaMaha.rashi
  );

  const dateLocale = lang === 'en' ? 'en-IN' : lang === 'gu' ? 'gu-IN' : 'hi-IN';
  const fmtDate = (d: Date) => {
    return new Date(d).toLocaleDateString(dateLocale, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6 text-[#5C3A21]">
      {/* Top Banner: Active Chara Dasha & Primary Jaimini Key Pillars */}
      <div className="bg-[#FAF2E4] border-2 border-[#B56A00] rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#8C6239]/20 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#B56A00]" />
              <h3 className="text-lg font-black font-granth text-[#5C3A21]">
                {pick(
                  'जैमिनी महर्षि सिद्धान्त (Jaimini Chara Dasha & Karakas)',
                  'Maharishi Jaimini System (Chara Dasha & Karakas)',
                  'મહર્ષિ જૈમિની સિદ્ધાંત (ચર દશા અને કારક)'
                )}
              </h3>
            </div>
            <p className="text-xs text-[#735133] font-medium mt-0.5">
              {pick(
                'महर्षि जैमिनी सूत्र अनुसार ७ चर कारक, कारकांश, आरूढ़ लग्न एवं १२ राशि चर दशा चक्र',
                '7 Chara Karakas, Karakamsha, Arudha Lagna & 12-Sign Chara Dasha cycle per Jaimini Sutras',
                'મહર્ષિ જૈમિની સૂત્ર અનુસાર ૭ ચર કારક, કારકાંશ, આરૂઢ લગ્ન અને ૧૨ રાશિ ચર દશા ચક્ર'
              )}
            </p>
          </div>

          <div className="bg-gradient-to-r from-[#B56A00] to-[#8C6239] text-white px-3.5 py-1.5 rounded-xl font-bold text-xs shadow-xs flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>
              {pick('वर्तमान सक्रिय चर दशा:', 'Active Chara Dasha:', 'વર્તમાન સક્રિય ચર દશા:')}{' '}
              <strong>{trRashi(jaimini.currentCharaMaha.rashi, lang)}</strong>
            </span>
          </div>
        </div>

        {/* 4 Key Jaimini Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* 1. Atmakaraka (AK) */}
          <div className="bg-[#F4E8D1] border border-[#B56A00]/40 rounded-xl p-3 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-[11px] font-bold text-[#8C6239]">
              <span>{pick('आत्माकारक (AK)', 'Atmakaraka (AK)', 'આત્માકારક (AK)')}</span>
              <Crown className="w-3.5 h-3.5 text-[#B56A00]" />
            </div>
            <div className="text-base font-black text-[#5C3A21] flex items-center gap-1">
              <span>{trPlanet(jaimini.atmakaraka.planet, lang)}</span>
              <span className="text-xs font-bold text-[#B56A00]">({trRashi(jaimini.atmakaraka.rashi, lang)})</span>
            </div>
            <div className="text-[10px] text-[#735133] font-medium">
              {pick('अंश:', 'Deg:', 'અંશ:')} {jaimini.atmakaraka.degreeInRashi.toFixed(2)}°
            </div>
          </div>

          {/* 2. Amatyakaraka (AmK) */}
          <div className="bg-[#F4E8D1] border border-[#B56A00]/40 rounded-xl p-3 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-[11px] font-bold text-[#8C6239]">
              <span>{pick('अमात्यकारक (AmK)', 'Amatyakaraka (AmK)', 'અમાત્યકારક (AmK)')}</span>
              <Award className="w-3.5 h-3.5 text-[#B56A00]" />
            </div>
            <div className="text-base font-black text-[#5C3A21] flex items-center gap-1">
              <span>{trPlanet(jaimini.amatyakaraka.planet, lang)}</span>
              <span className="text-xs font-bold text-[#B56A00]">({trRashi(jaimini.amatyakaraka.rashi, lang)})</span>
            </div>
            <div className="text-[10px] text-[#735133] font-medium">
              {pick('अंश:', 'Deg:', 'અંશ:')} {jaimini.amatyakaraka.degreeInRashi.toFixed(2)}°
            </div>
          </div>

          {/* 3. Karakamsha (KL) */}
          <div className="bg-[#F4E8D1] border border-[#B56A00]/40 rounded-xl p-3 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-[11px] font-bold text-[#8C6239]">
              <span>{pick('कारकांश (KL)', 'Karakamsha (KL)', 'કારકાંશ (KL)')}</span>
              <Compass className="w-3.5 h-3.5 text-[#B56A00]" />
            </div>
            <div className="text-base font-black text-[#5C3A21]">
              {trRashi(jaimini.karakamshaRashi, lang)}
            </div>
            <div className="text-[10px] text-[#735133] font-medium">
              {pick('AK की D9 नवमांश राशि', 'D9 Navamsha Sign of AK', 'AK ની D9 નવમાંશ રાશિ')}
            </div>
          </div>

          {/* 4. Arudha Lagna (AL) */}
          <div className="bg-[#F4E8D1] border border-[#B56A00]/40 rounded-xl p-3 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-[11px] font-bold text-[#8C6239]">
              <span>{pick('आरूढ़ लग्न (AL)', 'Arudha Lagna (AL)', 'આરૂઢ લગ્ન (AL)')}</span>
              <Shield className="w-3.5 h-3.5 text-[#B56A00]" />
            </div>
            <div className="text-base font-black text-[#5C3A21]">
              {trRashi(jaimini.arudhaLagnaRashi, lang)}
            </div>
            <div className="text-[10px] text-[#735133] font-medium">
              {pick(
                `${jaimini.arudhaLagnaHouse}म भाव पद (सांसारिक छवि)`,
                `House ${jaimini.arudhaLagnaHouse} Pada (Public Image)`,
                `${jaimini.arudhaLagnaHouse}મું ભાવ પદ (સામાજિક છબી)`
              )}
            </div>
          </div>
        </div>

        {/* Current Active Chara Dasha Strip */}
        <div className="p-3 bg-gradient-to-r from-amber-100 via-amber-50 to-amber-100 border border-[#B56A00]/30 rounded-xl text-xs text-[#5C3A21] flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className="font-bold">{pick('सक्रिय चर महादशा:', 'Active Chara Mahadasha:', 'સક્રિય ચર મહાદશા:')} </span>
            <span className="font-black text-[#B56A00] text-sm">{trRashi(jaimini.currentCharaMaha.rashi, lang)}</span>
            <span className="ml-2 text-[#735133]">
              ({fmtDate(jaimini.currentCharaMaha.startDate)} {pick('से', 'to', 'થી')} {fmtDate(jaimini.currentCharaMaha.endDate)})
            </span>
          </div>

          <div>
            <span className="font-bold">{pick('सक्रिय सूक्ष्मान्तर्दशा:', 'Active Antardasha:', 'સક્રિય અંતર્દશા:')} </span>
            <span className="font-black text-emerald-800 text-sm bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
              {trRashi(jaimini.currentCharaAntar.rashi, lang)}
            </span>
          </div>
        </div>
      </div>

      {/* Section 1: 7 Jaimini Chara Karakas Table */}
      <div className="bg-[#FAF2E4] border border-[#8C6239]/40 rounded-2xl overflow-hidden shadow-xs space-y-0">
        <div className="p-3.5 bg-[#5C3A21] text-[#FAF2E4] font-bold text-xs uppercase tracking-wider flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-300 fill-amber-300" />
            {pick(
              '१. जैमिनी ७ चर कारक तालिका (7 Jaimini Chara Karakas Order)',
              '1. 7 Jaimini Chara Karakas Order',
              '૧. જૈમિની ૭ ચર કારક કોષ્ટક'
            )}
          </span>
          <span className="text-[10px] text-amber-200">
            {pick('अंशों के अवरोही क्रम में', 'Sorted by Degree Descending', 'અંશના ઉતરતા ક્રમમાં')}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F4E8D1] text-[#5C3A21] border-b border-[#8C6239]/30 font-bold">
              <tr>
                <th className="py-2.5 px-3">{pick('कारक कोड', 'Code', 'કોડ')}</th>
                <th className="py-2.5 px-3">{pick('कारक नाम', 'Karaka', 'કારક નામ')}</th>
                <th className="py-2.5 px-3">{pick('ग्रह', 'Planet', 'ગ્રહ')}</th>
                <th className="py-2.5 px-3">{pick('राशि', 'Sign', 'રાશિ')}</th>
                <th className="py-2.5 px-3">{pick('भाव', 'House', 'ભાવ')}</th>
                <th className="py-2.5 px-3">{pick('स्पष्ट अंश', 'Degree', 'સ્પષ્ટ અંશ')}</th>
                <th className="py-2.5 px-3">{pick('कारकत्व / महत्व', 'Significance', 'કારકત્વ / મહત્વ')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#8C6239]/20">
              {jaimini.karakas.map((k, idx) => {
                const isAK = k.code === 'AK';
                const isAmK = k.code === 'AmK';
                return (
                  <tr
                    key={idx}
                    className={`transition ${
                      isAK
                        ? 'bg-amber-100/80 font-bold'
                        : isAmK
                        ? 'bg-emerald-50/80 font-medium'
                        : 'hover:bg-[#F4E8D1]/60'
                    }`}
                  >
                    <td className="py-2.5 px-3 font-black text-[#B56A00]">
                      <span className="px-1.5 py-0.5 bg-[#FAF2E4] border border-[#8C6239]/30 rounded text-[11px]">
                        {k.code}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-bold text-[#5C3A21]">
                      {k.name}
                    </td>
                    <td className="py-2.5 px-3 font-black text-[#5C3A21]">
                      {trPlanet(k.planet, lang)}
                      {isAK && (
                        <span className="ml-1.5 text-[9px] bg-[#B56A00] text-white px-1 py-0.2 rounded font-bold">
                          {pick('आत्मा', 'Soul', 'આત્મા')}
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-[#5C3A21]">{trRashi(k.rashi, lang)}</td>
                    <td className="py-2.5 px-3 font-bold text-[#B56A00]">{k.house}</td>
                    <td className="py-2.5 px-3 text-[#5C3A21] font-mono">
                      {k.degreeInRashi.toFixed(2)}°
                    </td>
                    <td className="py-2.5 px-3 text-[#735133] leading-tight text-[11px]">
                      {k.significance}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 2: Arudha Lagna, Karakamsha & Upapada Explanation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Karakamsha Card */}
        <div className="bg-[#FAF2E4] border border-[#8C6239]/40 rounded-xl p-4 space-y-2 shadow-2xs">
          <div className="flex items-center gap-2 border-b border-[#8C6239]/20 pb-2">
            <Compass className="w-4 h-4 text-[#B56A00]" />
            <h4 className="font-bold text-sm font-granth text-[#5C3A21]">
              {pick('कारकांश (Karakamsha Lagna)', 'Karakamsha Lagna (KL)', 'કારકાંશ લગ્ન (KL)')}
            </h4>
          </div>
          <div className="text-sm font-black text-[#B56A00]">
            {trRashi(jaimini.karakamshaRashi, lang)} {pick('राशि (D9)', 'Sign (D9)', 'રાશિ (D9)')}
          </div>
          <p className="text-xs text-[#735133] leading-relaxed">
            {pick(
              `आत्माकारक ग्रह (${trPlanet(jaimini.atmakaraka.planet, lang)}) जिस नवमांश D9 राशि में स्थित होता है, उसे कारकांश कहते हैं। यह जातक के अंतरात्मा की इच्छा, आत्मिक उन्नति, प्रतिभा व जीवन के सूक्ष्म मोक्ष मार्ग को दर्शाता है।`,
              `The D9 Navamsha sign occupied by your Atmakaraka (${trPlanet(jaimini.atmakaraka.planet, lang)}) is Karakamsha. It reveals deep soul desires, spiritual evolution, innate talents and higher purpose.`,
              `આત્માકારક ગ્રહ (${trPlanet(jaimini.atmakaraka.planet, lang)}) જે નવમાંશ D9 રાશિમાં સ્થિત હોય, તેને કારકાંશ કહે છે. તે આત્મિક ઉન્નતિ, પ્રતિભા અને મોક્ષ માર્ગ દર્શાવે છે.`
            )}
          </p>
        </div>

        {/* Arudha Lagna Card */}
        <div className="bg-[#FAF2E4] border border-[#8C6239]/40 rounded-xl p-4 space-y-2 shadow-2xs">
          <div className="flex items-center gap-2 border-b border-[#8C6239]/20 pb-2">
            <Shield className="w-4 h-4 text-[#B56A00]" />
            <h4 className="font-bold text-sm font-granth text-[#5C3A21]">
              {pick('आरूढ़ लग्न (Arudha Lagna - AL)', 'Arudha Lagna (AL)', 'આરૂઢ લગ્ન (AL)')}
            </h4>
          </div>
          <div className="text-sm font-black text-[#B56A00]">
            {trRashi(jaimini.arudhaLagnaRashi, lang)} ({pick(`${jaimini.arudhaLagnaHouse} भाव पद`, `House ${jaimini.arudhaLagnaHouse} Pada`, `${jaimini.arudhaLagnaHouse}મું ભાવ પદ`)})
          </div>
          <p className="text-xs text-[#735133] leading-relaxed">
            {pick(
              'लग्न स्वामी की स्थिति से निर्मित आरूढ़ पद सांसारिक छवि, प्रतिष्ठा एवं बाह्य जगत् का दृष्टिकोण प्रदर्शित करता है। समाज में आपका प्रभाव इसी आरूढ़ पद से आकलित होता है।',
              'Derived from the Ascendant Lord’s placement, Arudha Lagna reflects worldly reputation, social image and how the world perceives your achievements.',
              'લગ્ન સ્વામીની સ્થિતિથી નિર્મિત આરૂઢ પદ સાંસારિક છબી, પ્રતિષ્ઠા અને સમાજમાં તમારો પ્રભાવ દર્શાવે છે.'
            )}
          </p>
        </div>

        {/* Upapada Lagna Card */}
        <div className="bg-[#FAF2E4] border border-[#8C6239]/40 rounded-xl p-4 space-y-2 shadow-2xs">
          <div className="flex items-center gap-2 border-b border-[#8C6239]/20 pb-2">
            <Heart className="w-4 h-4 text-rose-700" />
            <h4 className="font-bold text-sm font-granth text-[#5C3A21]">
              {pick('उपपद लग्न (Upapada Lagna - UL)', 'Upapada Lagna (UL)', 'ઉપપદ લગ્ન (UL)')}
            </h4>
          </div>
          <div className="text-sm font-black text-rose-800">
            {trRashi(jaimini.upapadaLagnaRashi, lang)} ({pick(`${jaimini.upapadaLagnaHouse} भाव पद`, `House ${jaimini.upapadaLagnaHouse} Pada`, `${jaimini.upapadaLagnaHouse}મું ભાવ પદ`)})
          </div>
          <p className="text-xs text-[#735133] leading-relaxed">
            {pick(
              '12वें भाव से व्युत्पन्न उपपद लग्न विवाह, दांपत्य जीवन का स्थायित्व, जीवनसाथी का स्वभाव व पारिवारिक सौहार्द का निर्विवाद जैमिनी संकेतक है।',
              'Derived from the 12th house, Upapada Lagna is the primary Jaimini indicator for marriage, partner’s nature, marital longevity and domestic harmony.',
              '૧૨માં ભાવ પરથી બનેલ ઉપપદ લગ્ન વિવાહ, દાંપત્ય જીવનનું સ્થાયિત્વ, જીવનસાથીનો સ્વભાવ અને પારિવારિક સુમેળનો મુખ્ય સંકેત છે.'
            )}
          </p>
        </div>
      </div>

      {/* Section 3: 12-Sign Jaimini Chara Dasha System */}
      <div className="bg-[#FAF2E4] border border-[#8C6239]/40 rounded-2xl overflow-hidden shadow-xs space-y-0">
        <div className="p-3.5 bg-[#5C3A21] text-[#FAF2E4] font-bold text-xs uppercase tracking-wider flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-300" />
            {pick(
              '२. जैमिनी १२ राशि चर महादशा एवं अंतर्दशा चक्र (Chara Dasha Sequence)',
              '2. 12-Sign Jaimini Chara Dasha & Antardasha Sequence',
              '૨. જૈમિની ૧૨ રાશિ ચર મહાદશા અને અંતર્દશા ચક્ર'
            )}
          </span>
          <span className="text-[10px] text-amber-200">
            {pick('क्लिक कर १२ अंतर्दशाएँ खोलें', 'Click to expand 12 Antardashas', 'ક્લિક કરી ૧૨ અંતર્દશા જુઓ')}
          </span>
        </div>

        <div className="divide-y divide-[#8C6239]/20">
          {jaimini.charaDashaPeriods.map((period, idx) => {
            const isNow =
              new Date() >= period.startDate && new Date() < period.endDate;
            const isExpanded = expandedSign === period.rashi;

            return (
              <div key={idx} className="transition">
                {/* Dasha Header Row */}
                <div
                  onClick={() =>
                    setExpandedSign(isExpanded ? null : period.rashi)
                  }
                  className={`p-3.5 cursor-pointer flex items-center justify-between transition ${
                    isNow
                      ? 'bg-amber-100/90 border-l-4 border-[#B56A00] font-bold'
                      : 'hover:bg-[#F4E8D1]/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#5C3A21] text-white text-xs font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>

                    <div>
                      <div className="text-sm font-bold text-[#5C3A21] flex items-center gap-2">
                        <span>
                          {trRashi(period.rashi, lang)} {pick('चर महादशा', 'Chara Mahadasha', 'ચર મહાદશા')}
                        </span>
                        {isNow && (
                          <span className="bg-[#B56A00] text-white text-[9px] px-2 py-0.5 rounded-full font-black animate-pulse">
                            {pick('वर्तमान सक्रिय', 'ACTIVE NOW', 'વર્તમાન સક્રિય')}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-[#735133] mt-0.5">
                        {pick('स्वामी:', 'Lord:', 'સ્વામી:')} {trPlanet(period.lord, lang)} | {pick('अवधि:', 'Period:', 'સમયગાળો:')} {fmtDate(period.startDate)} {pick('से', 'to', 'થી')} {fmtDate(period.endDate)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-sm font-black text-[#B56A00] bg-[#FAF2E4] px-2.5 py-1 rounded-lg border border-[#8C6239]/30">
                      {period.years} {pick('वर्ष', 'Yrs', 'વર્ષ')}
                    </span>
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-[#8C6239]" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-[#8C6239]" />
                    )}
                  </div>
                </div>

                {/* Sub-Antardashas Grid Accordion */}
                {isExpanded && (
                  <div className="p-4 bg-[#F4E8D1]/70 border-t border-b border-[#8C6239]/20 space-y-3">
                    <div className="text-xs font-bold text-[#8C6239] uppercase tracking-wider flex items-center justify-between">
                      <span>
                        {trRashi(period.rashi, lang)} {pick('चर महादशा में १२ सूक्ष्मान्तर्दशाएँ:', 'Chara Mahadasha — 12 Antardashas:', 'ચર મહાદશામાં ૧૨ સૂક્ષ્માંતર્દશાઓ:')}
                      </span>
                      <span className="text-[11px] text-[#735133]">
                        {pick('कुल अवधि:', 'Total:', 'કુલ સમય:')} {period.years} {pick('वर्ष', 'Years', 'વર્ષ')}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
                      {period.antardashas.map((antar, aIdx) => {
                        const isAntarNow =
                          new Date() >= antar.startDate &&
                          new Date() < antar.endDate;

                        return (
                          <div
                            key={aIdx}
                            className={`p-2.5 rounded-lg border transition text-xs space-y-1 ${
                              isAntarNow
                                ? 'bg-emerald-100 border-emerald-500 font-bold ring-1 ring-emerald-500'
                                : 'bg-[#FAF2E4] border-[#8C6239]/30 hover:border-[#B56A00]'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-[#5C3A21]">
                                {trRashi(antar.rashi, lang)} {pick('अंतर्दशा', 'Antardasha', 'અંતર્દશા')}
                              </span>
                              {isAntarNow && (
                                <span className="bg-emerald-700 text-white text-[8px] px-1.5 py-0.2 rounded font-black">
                                  {pick('सक्रिय', 'Active', 'સક્રિય')}
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-[#735133]">
                              {fmtDate(antar.startDate)} - {fmtDate(antar.endDate)}
                            </div>
                            <div className="text-[10px] text-[#B56A00] font-bold">
                              {antar.months} {pick('माह', 'Months', 'માસ')}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
