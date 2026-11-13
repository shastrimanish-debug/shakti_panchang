import React, { useState, useMemo } from 'react';
import { KundaliData } from '../types';
import {
  calculateKpSystem,
  calculateAshtakvarga,
  calculateJaiminiKarakas,
  calculateJaiminiCharaDasha,
  AshtakvargaResult,
} from '../services/kpAshtakvarga';
import { RASHIS } from '../services/astronomy';
import { useLanguage } from '../i18n';
import { trPlanet, trRashi } from '../i18n/vedicTranslate';
import {
  Sparkles,
  Award,
} from 'lucide-react';

export const KpAshtakvargaPanel: React.FC<{
  kundali: KundaliData;
}> = ({ kundali }) => {
  const { language } = useLanguage();
  const lang = (language || 'hi').slice(0, 2).toLowerCase();
  const pick = (hi: string, en: string, gu: string) => (lang === 'en' ? en : lang === 'gu' ? gu : hi);
  const dateLocale = lang === 'en' ? 'en-IN' : lang === 'gu' ? 'gu-IN' : 'hi-IN';

  const [activeTab, setActiveTab] = useState<'kp' | 'ashtakvarga' | 'jaimini'>('kp');

  // Compute KP, Ashtakvarga, and Jaimini data
  const kpData = useMemo(() => calculateKpSystem(kundali), [kundali]);
  const avData: AshtakvargaResult = useMemo(() => calculateAshtakvarga(kundali), [kundali]);
  const jaiminiData = useMemo(() => calculateJaiminiKarakas(kundali, lang), [kundali, lang]);
  const charaDashaData = useMemo(() => calculateJaiminiCharaDasha(kundali), [kundali]);

  const MAIN_PLANETS = ['सूर्य', 'चंद्र', 'मंगल', 'बुध', 'गुरु', 'शुक्र', 'शनि'];

  return (
    <div className="bg-[#FAF2E4] border border-[#8C6239]/40 rounded-2xl p-4 sm:p-6 shadow-sm space-y-5 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#8C6239]/30 pb-3">
        <div>
          <h3 className="font-granth font-black text-base sm:text-xl text-[#5C3A21] flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#B56A00]" />
            <span>
              {pick(
                'केपी पद्धति, अष्टकवर्ग एवं जैमिनी चर दशा',
                'KP System, Ashtakvarga & Jaimini Chara Dasha',
                'કેપી પદ્ધતિ, અષ્ટકવર્ગ અને જૈમિની ચર દશા'
              )}
            </span>
          </h3>
          <p className="text-xs text-[#735133] font-medium mt-0.5">
            {pick(
              'कृष्णमूर्ति पद्धति (KP Cusp & Sub Lords), सर्वाष्टकवर्ग (SAV Grid) व जैमिनी 7 चर कारक तालिका',
              'Krishnamurti Paddhati (KP Cusp & Sub Lords), Sarvashtakvarga (SAV Grid) & Jaimini 7 Chara Karakas',
              'કૃષ્ણમૂર્તિ પદ્ધતિ (KP Cusp & Sub Lords), સર્વાષ્ટકવર્ગ (SAV Grid) અને જૈમિની ૭ ચર કારક'
            )}
          </p>
        </div>

        {/* Tab Selector Buttons */}
        <div className="flex items-center gap-1 bg-[#F4E8D1] p-1 border border-[#8C6239]/40 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab('kp')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === 'kp' ? 'bg-[#5C3A21] text-[#FAF2E4] shadow-xs' : 'text-[#8C6239] hover:bg-[#FAF2E4]'
            }`}
          >
            {pick('१. KP कृष्णमूर्ति पद्धति', '1. KP System', '૧. KP કૃષ્ણમૂર્તિ પદ્ધતિ')}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ashtakvarga')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === 'ashtakvarga' ? 'bg-[#5C3A21] text-[#FAF2E4] shadow-xs' : 'text-[#8C6239] hover:bg-[#FAF2E4]'
            }`}
          >
            {pick('२. अष्टकवर्ग (SAV/BAV)', '2. Ashtakvarga (SAV/BAV)', '૨. અષ્ટકવર્ગ (SAV/BAV)')}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('jaimini')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === 'jaimini' ? 'bg-[#5C3A21] text-[#FAF2E4] shadow-xs' : 'text-[#8C6239] hover:bg-[#FAF2E4]'
            }`}
          >
            {pick('३. जैमिनी कारक व चर दशा', '3. Jaimini & Chara Dasha', '૩. જૈમિની કારક અને ચર દશા')}
          </button>
        </div>
      </div>

      {/* TAB 1: KP SYSTEM (Krishnamurti Paddhati) */}
      {activeTab === 'kp' && (
        <div className="space-y-5">
          {/* Planets KP Table */}
          <div className="bg-white border border-[#8C6239]/30 rounded-xl overflow-hidden shadow-xs">
            <div className="p-3 bg-[#5C3A21] text-[#FAF2E4] font-bold text-xs uppercase tracking-wider flex items-center justify-between">
              <span>
                {pick(
                  'ग्रह केपी स्वामी, नक्षत्र स्वामी व उपस्वामी तालिका (KP Planet Star/Sub Lords)',
                  'KP Planetary Sign Lord, Star Lord & Sub Lord Table',
                  'ગ્રહ કેપી સ્વામી, નક્ષત્ર સ્વામી અને ઉપસ્વામી કોષ્ટક'
                )}
              </span>
              <span className="text-[10px] text-[#FFD88A]">{pick('9 ग्रह विवरण', '9 Planets', '૯ ગ્રહ વિગત')}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F4E8D1] text-[#5C3A21] border-b border-[#8C6239]/30 font-bold">
                  <tr>
                    <th className="py-2.5 px-3">{pick('ग्रह', 'Planet', 'ગ્રહ')}</th>
                    <th className="py-2.5 px-3">{pick('राशि व भाव', 'Sign & House', 'રાશિ અને ભાવ')}</th>
                    <th className="py-2.5 px-3">{pick('अंश (Deg)', 'Degree', 'અંશ (Deg)')}</th>
                    <th className="py-2.5 px-3">{pick('राशि स्वामी', 'Sign Lord', 'રાશિ સ્વામી')}</th>
                    <th className="py-2.5 px-3">{pick('नक्षत्र स्वामी', 'Star Lord', 'નક્ષત્ર સ્વામી')}</th>
                    <th className="py-2.5 px-3 text-[#B56A00]">{pick('उपस्वामी (Sub Lord)', 'Sub Lord', 'ઉપસ્વામી (Sub)')}</th>
                    <th className="py-2.5 px-3">{pick('उप-उपस्वामी', 'Sub-Sub Lord', 'ઉપ-ઉપસ્વામી')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#8C6239]/20 font-medium">
                  {kpData.planets.map((p) => (
                    <tr key={p.planet} className="hover:bg-[#F4E8D1]/50">
                      <td className="py-2 px-3 font-bold text-[#5C3A21]">
                        {trPlanet(p.planet, lang)}
                      </td>
                      <td className="py-2 px-3 text-[#5C3A21]">
                        {trRashi(p.rashi, lang)} ({pick(`भाव ${p.house}`, `H-${p.house}`, `ભાવ ${p.house}`)})
                      </td>
                      <td className="py-2 px-3 font-semibold text-[#8C6239]">
                        {p.formattedDegree}
                      </td>
                      <td className="py-2 px-3 text-[#5C3A21]">{trPlanet(p.signLord, lang)}</td>
                      <td className="py-2 px-3 font-bold text-[#5C3A21]">{trPlanet(p.starLord, lang)}</td>
                      <td className="py-2 px-3 font-black text-[#B56A00] bg-amber-50">
                        {trPlanet(p.subLord, lang)}
                      </td>
                      <td className="py-2 px-3 text-[#735133]">{trPlanet(p.subSubLord, lang)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 12 House Cusps KP Table */}
          <div className="bg-white border border-[#8C6239]/30 rounded-xl overflow-hidden shadow-xs">
            <div className="p-3 bg-[#462B17] text-[#FAF2E4] font-bold text-xs uppercase tracking-wider flex items-center justify-between">
              <span>
                {pick(
                  '१२ भाव संधि / स्पन्द केपी स्वामी (12 House Cusp Star & Sub Lords)',
                  '12 House Cusps — Sign, Star & Sub Lords',
                  '૧૨ ભાવ સંધિ કેપી સ્વામી (12 House Cusps)'
                )}
              </span>
              <span className="text-[10px] text-[#FFD88A]">{pick('12 भाव संधि', '12 Cusp Positions', '૧૨ ભાવ સંધિ')}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F4E8D1] text-[#5C3A21] border-b border-[#8C6239]/30 font-bold">
                  <tr>
                    <th className="py-2.5 px-3">{pick('भाव (Cusp)', 'House Cusp', 'ભાવ (Cusp)')}</th>
                    <th className="py-2.5 px-3">{pick('राशि', 'Sign', 'રાશિ')}</th>
                    <th className="py-2.5 px-3">{pick('अंश (Cusp Deg)', 'Cusp Deg', 'અંશ (Cusp Deg)')}</th>
                    <th className="py-2.5 px-3">{pick('राशि स्वामी', 'Sign Lord', 'રાશિ સ્વામી')}</th>
                    <th className="py-2.5 px-3">{pick('नक्षत्र स्वामी', 'Star Lord', 'નક્ષત્ર સ્વામી')}</th>
                    <th className="py-2.5 px-3 text-[#B56A00]">{pick('उपस्वामी (Sub Lord)', 'Cusp Sub Lord', 'ઉપસ્વામી (Sub Lord)')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#8C6239]/20 font-medium">
                  {kpData.cusps.map((c) => (
                    <tr key={c.house} className="hover:bg-[#F4E8D1]/50">
                      <td className="py-2 px-3 font-bold text-[#B56A00]">
                        {pick(`भाव ${c.house}`, `House ${c.house}`, `ભાવ ${c.house}`)}
                      </td>
                      <td className="py-2 px-3 text-[#5C3A21]">{trRashi(c.rashi, lang)}</td>
                      <td className="py-2 px-3 font-semibold text-[#8C6239]">
                        {c.formattedDegree}
                      </td>
                      <td className="py-2 px-3 text-[#5C3A21]">{trPlanet(c.signLord, lang)}</td>
                      <td className="py-2 px-3 font-bold text-[#5C3A21]">{trPlanet(c.starLord, lang)}</td>
                      <td className="py-2 px-3 font-black text-[#B56A00] bg-amber-50">
                        {trPlanet(c.subLord, lang)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ASHTAKVARGA (BAV & SAV) */}
      {activeTab === 'ashtakvarga' && (
        <div className="space-y-5">
          {/* Summary Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-[#FAF2E4] border border-[#8C6239]/40 rounded-xl text-center space-y-1">
              <span className="text-[10px] font-bold text-[#8C6239] uppercase tracking-wider block">
                {pick('कुल सर्वाष्टकवर्ग अंक', 'Total Sarvashtakvarga Points', 'કુલ સર્વાષ્ટકવર્ગ અંક')}
              </span>
              <div className="text-xl font-black text-[#5C3A21]">{avData.totalPoints} / 337</div>
              <span className="text-[10px] text-[#735133]">
                {pick('शास्त्रीय मानक 337 अंक', 'Classical Standard: 337 Bindus', 'શાસ્ત્રીય માનક ૩૩૭ અંક')}
              </span>
            </div>

            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-center space-y-1">
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                {pick('सर्वश्रेष्ठ शुभ राशि (Strongest)', 'Strongest Auspicious Sign', 'સર્વશ્રેષ્ઠ શુભ રાશિ (Strongest)')}
              </span>
              <div className="text-xl font-black text-emerald-950">
                {trRashi(avData.strongestRashi.rashi, lang)} ({avData.strongestRashi.points} {pick('अंक', 'Pts', 'અંક')})
              </div>
              <span className="text-[10px] text-emerald-700">
                {pick('सर्वाधिक शुभ फल प्रदाता', 'Highest Benefic Strength', 'સર્વાધિક શુભ ફળદાયી')}
              </span>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-center space-y-1">
              <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
                {pick('संवेदनशील राशि (Sensitive)', 'Sensitive Sign', 'સંવેદનશીલ રાશિ (Sensitive)')}
              </span>
              <div className="text-xl font-black text-amber-950">
                {trRashi(avData.weakestRashi.rashi, lang)} ({avData.weakestRashi.points} {pick('अंक', 'Pts', 'અંક')})
              </div>
              <span className="text-[10px] text-amber-700">
                {pick('गोचर में विशेष सावधानी आवश्यक', 'Caution Needed During Transits', 'ગોચરમાં વિશેષ સાવધાની આવશ્યક')}
              </span>
            </div>
          </div>

          {/* Binnashtakvarga & Sarvashtakvarga Grid Table */}
          <div className="bg-white border border-[#8C6239]/30 rounded-xl overflow-hidden shadow-xs">
            <div className="p-3 bg-[#5C3A21] text-[#FAF2E4] font-bold text-xs uppercase tracking-wider flex items-center justify-between">
              <span>
                {pick(
                  'भिन्नाष्टकवर्ग एवं सर्वाष्टकवर्ग चक्र (BAV & SAV 12 Rashis Grid)',
                  'Binnashtakvarga & Sarvashtakvarga (BAV & SAV 12-Sign Grid)',
                  'ભિન્નાષ્ટકવર્ગ અને સર્વાષ્ટકવર્ગ ચક્ર (BAV & SAV 12 રાશિ)'
                )}
              </span>
              <span className="text-[10px] text-[#FFD88A]">{pick('28+ अंक = अति शुभ', '28+ Pts = Very Auspicious', '૨૮+ અંક = અતિ શુભ')}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-center text-xs">
                <thead className="bg-[#F4E8D1] text-[#5C3A21] border-b border-[#8C6239]/30 font-bold">
                  <tr>
                    <th className="py-2.5 px-2 text-left">{pick('ग्रह', 'Planet', 'ગ્રહ')}</th>
                    {RASHIS.map((r) => (
                      <th key={r} className="py-2.5 px-1 min-w-[36px]">
                        {trRashi(r, lang).substring(0, 3)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#8C6239]/20 font-medium">
                  {MAIN_PLANETS.map((p) => {
                    const bav = avData.planetBav[p] || Array(12).fill(0);
                    return (
                      <tr key={p} className="hover:bg-[#F4E8D1]/40">
                        <td className="py-2 px-2 text-left font-bold text-[#5C3A21]">{trPlanet(p, lang)}</td>
                        {bav.map((pts, i) => (
                          <td
                            key={i}
                            className={`py-2 px-1 ${
                              pts >= 5
                                ? 'font-black text-emerald-800 bg-emerald-50'
                                : pts <= 2
                                ? 'text-amber-800 bg-amber-50'
                                : 'text-[#5C3A21]'
                            }`}
                          >
                            {pts}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                  {/* SAV Total Row */}
                  <tr className="bg-[#5C3A21] text-[#FAF2E4] font-black">
                    <td className="py-2.5 px-2 text-left text-[#FFD88A]">{pick('SAV कुल', 'SAV Total', 'SAV કુલ')}</td>
                    {avData.sav.map((pts, i) => (
                      <td
                        key={i}
                        className={`py-2.5 px-1 ${
                          pts >= 28 ? 'text-amber-300 font-black' : 'text-rose-200'
                        }`}
                      >
                        {pts}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: JAIMINI KARAKAS & CHARA DASHA */}
      {activeTab === 'jaimini' && (
        <div className="space-y-5">
          {/* Atmakaraka & Karakamsha Banner */}
          <div className="p-4 bg-gradient-to-r from-[#5C3A21] via-[#462B17] to-[#5C3A21] text-[#FAF2E4] rounded-xl shadow-xs flex flex-wrap items-center justify-between gap-3 border border-[#B56A00]">
            <div>
              <div className="text-xs font-bold text-[#FFD88A] flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-300" />
                <span>
                  {pick('आत्मकारक (Atmakaraka):', 'Atmakaraka (AK):', 'આત્મકારક (AK):')} {trPlanet(jaiminiData.atmakaraka.planet, lang)} ({jaiminiData.atmakaraka.formattedDegree})
                </span>
              </div>
              <div className="text-xs text-[#FAF2E4] mt-1">
                {pick('कारकांश राशि:', 'Karakamsha Sign:', 'કારકાંશ રાશિ:')}{' '}
                <strong className="text-amber-300">{trRashi(jaiminiData.karakamshaRashi, lang)}</strong>{' '}
                {pick('(आध्यात्मिक एवं जीवन का मूल कारक)', '(Spiritual & Core Life Indicator)', '(આધ્યાત્મિક અને જીવનનો મૂળ કારક)')}
              </div>
            </div>

            <div className="text-xs text-[#FFD88A] bg-[#2A1508] px-3 py-1.5 rounded-lg border border-[#8C6239]">
              {pick('अमात्यकारक:', 'Amatyakaraka:', 'અમાત્યકારક:')} <strong>{trPlanet(jaiminiData.amatyakaraka.planet, lang)}</strong> ({jaiminiData.amatyakaraka.formattedDegree})
            </div>
          </div>

          {/* 7 Jaimini Chara Karakas Table */}
          <div className="bg-white border border-[#8C6239]/30 rounded-xl overflow-hidden shadow-xs">
            <div className="p-3 bg-[#5C3A21] text-[#FAF2E4] font-bold text-xs uppercase tracking-wider flex items-center justify-between">
              <span>{pick('जैमिनी ७ चर कारक तालिका (7 Chara Karaka Positions)', 'Jaimini 7 Chara Karaka Positions', 'જૈમિની ૭ ચર કારક કોષ્ટક')}</span>
              <span className="text-[10px] text-[#FFD88A]">{pick('अंशानुसार क्रम', 'Ordered by Degree', 'અંશ મુજબ ક્રમ')}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F4E8D1] text-[#5C3A21] border-b border-[#8C6239]/30 font-bold">
                  <tr>
                    <th className="py-2.5 px-3">{pick('कारक कोड', 'Code', 'કોડ')}</th>
                    <th className="py-2.5 px-3">{pick('कारक नाम', 'Karaka', 'કારક નામ')}</th>
                    <th className="py-2.5 px-3">{pick('ग्रह', 'Planet', 'ગ્રહ')}</th>
                    <th className="py-2.5 px-3">{pick('राशि', 'Sign', 'રાશિ')}</th>
                    <th className="py-2.5 px-3">{pick('अंश (Deg)', 'Degree', 'અંશ')}</th>
                    <th className="py-2.5 px-3">{pick('कारकत्व व महत्त्व', 'Significance', 'કારકત્વ અને મહત્વ')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#8C6239]/20 font-medium">
                  {jaiminiData.karakas.map((k) => (
                    <tr key={k.code} className="hover:bg-[#F4E8D1]/50">
                      <td className="py-2 px-3 font-black text-[#B56A00]">{k.code}</td>
                      <td className="py-2 px-3 font-bold text-[#5C3A21]">{k.title}</td>
                      <td className="py-2 px-3 font-black text-[#5C3A21]">{trPlanet(k.planet, lang)}</td>
                      <td className="py-2 px-3 text-[#5C3A21]">{trRashi(k.rashi, lang)}</td>
                      <td className="py-2 px-3 font-semibold text-[#8C6239]">{k.formattedDegree}</td>
                      <td className="py-2 px-3 text-[#735133]">{k.significance}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Jaimini Chara Dasha Table */}
          <div className="bg-white border border-[#8C6239]/30 rounded-xl overflow-hidden shadow-xs">
            <div className="p-3 bg-[#462B17] text-[#FAF2E4] font-bold text-xs uppercase tracking-wider flex items-center justify-between">
              <span>{pick('जैमिनी चर दशा कालचक्र (Jaimini Chara Dasha Periods)', 'Jaimini Chara Dasha Periods', 'જૈમિની ચર દશા કાળચક્ર')}</span>
              <span className="text-[10px] text-[#FFD88A]">{pick('12 राशियाँ', '12 Signs', '૧૨ રાશિઓ')}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F4E8D1] text-[#5C3A21] border-b border-[#8C6239]/30 font-bold">
                  <tr>
                    <th className="py-2.5 px-3">{pick('दशा राशि', 'Dasha Sign', 'દશા રાશિ')}</th>
                    <th className="py-2.5 px-3">{pick('वर्ष अवधि', 'Duration', 'વર્ષ સમયગાળો')}</th>
                    <th className="py-2.5 px-3">{pick('प्रारंभ तिथि', 'Start Date', 'પ્રારંભ તારીખ')}</th>
                    <th className="py-2.5 px-3">{pick('समाप्ति तिथि', 'End Date', 'સમાપ્તિ તારીખ')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#8C6239]/20 font-medium">
                  {charaDashaData.map((d, i) => (
                    <tr key={i} className="hover:bg-[#F4E8D1]/50">
                      <td className="py-2 px-3 font-bold text-[#5C3A21]">
                        {trRashi(d.rashi, lang)} ({pick(`राशि ${d.rashiNum}`, `Sign ${d.rashiNum}`, `રાશિ ${d.rashiNum}`)})
                      </td>
                      <td className="py-2 px-3 font-black text-[#B56A00]">{d.years} {pick('वर्ष', 'Yrs', 'વર્ષ')}</td>
                      <td className="py-2 px-3 text-[#735133]">
                        {d.startDate.toLocaleDateString(dateLocale, { year: 'numeric', month: 'short' })}
                      </td>
                      <td className="py-2 px-3 text-[#735133]">
                        {d.endDate.toLocaleDateString(dateLocale, { year: 'numeric', month: 'short' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
