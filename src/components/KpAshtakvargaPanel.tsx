import React, { useState, useMemo } from 'react';
import { KundaliData } from '../types';
import {
  calculateKpSystem,
  calculateAshtakvarga,
  calculateJaiminiKarakas,
  calculateJaiminiCharaDasha,
  KpPlanetInfo,
  KpCuspInfo,
  AshtakvargaResult,
} from '../services/kpAshtakvarga';
import { RASHIS } from '../services/astronomy';
import {
  Layers,
  Sparkles,
  Grid,
  Zap,
  Info,
  ChevronRight,
  ShieldCheck,
  Star,
  Award,
  Compass,
} from 'lucide-react';

export const KpAshtakvargaPanel: React.FC<{
  kundali: KundaliData;
}> = ({ kundali }) => {
  const [activeTab, setActiveTab] = useState<'kp' | 'ashtakvarga' | 'jaimini'>('kp');

  // Compute KP, Ashtakvarga, and Jaimini data
  const kpData = useMemo(() => calculateKpSystem(kundali), [kundali]);
  const avData: AshtakvargaResult = useMemo(() => calculateAshtakvarga(kundali), [kundali]);
  const jaiminiData = useMemo(() => calculateJaiminiKarakas(kundali), [kundali]);
  const charaDashaData = useMemo(() => calculateJaiminiCharaDasha(kundali), [kundali]);

  const MAIN_PLANETS = ['सूर्य', 'चंद्र', 'मंगल', 'बुध', 'गुरु', 'शुक्र', 'शनि'];

  return (
    <div className="bg-[#FAF2E4] border border-[#8C6239]/40 rounded-2xl p-4 sm:p-6 shadow-sm space-y-5 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#8C6239]/30 pb-3">
        <div>
          <h3 className="font-granth font-black text-base sm:text-xl text-[#5C3A21] flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#B56A00]" />
            <span>केपी पद्धति, अष्टकवर्ग एवं जैमिनी चर दशा</span>
          </h3>
          <p className="text-xs text-[#735133] mt-0.5">
            कृष्णमूर्ति पद्धति (KP Cusp & Sub Lords), सर्वाष्टकवर्ग (SAV Grid) व जैमिनी 7 चर कारक तालिका
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
            १. KP कृष्णमूर्ति पद्धति
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ashtakvarga')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === 'ashtakvarga' ? 'bg-[#5C3A21] text-[#FAF2E4] shadow-xs' : 'text-[#8C6239] hover:bg-[#FAF2E4]'
            }`}
          >
            २. अष्टकवर्ग (SAV/BAV)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('jaimini')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === 'jaimini' ? 'bg-[#5C3A21] text-[#FAF2E4] shadow-xs' : 'text-[#8C6239] hover:bg-[#FAF2E4]'
            }`}
          >
            ३. जैमिनी कारक व चर दशा
          </button>
        </div>
      </div>

      {/* TAB 1: KP SYSTEM (Krishnamurti Paddhati) */}
      {activeTab === 'kp' && (
        <div className="space-y-5">
          {/* Planets KP Table */}
          <div className="bg-white border border-[#8C6239]/30 rounded-xl overflow-hidden shadow-xs">
            <div className="p-3 bg-[#5C3A21] text-[#FAF2E4] font-bold text-xs uppercase tracking-wider flex items-center justify-between">
              <span>ग्रह केपी स्वामी, नक्षत्र स्वामी व उपस्वामी तालिका (KP Planet Star/Sub Lords)</span>
              <span className="text-[10px] text-[#FFD88A]">9 ग्रह विवरण</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F4E8D1] text-[#5C3A21] border-b border-[#8C6239]/30 font-bold">
                  <tr>
                    <th className="py-2.5 px-3">ग्रह</th>
                    <th className="py-2.5 px-3">राशि व भाव</th>
                    <th className="py-2.5 px-3">अंश (Deg)</th>
                    <th className="py-2.5 px-3">राशि स्वामी (Sign)</th>
                    <th className="py-2.5 px-3">नक्षत्र स्वामी (Star)</th>
                    <th className="py-2.5 px-3 text-[#B56A00]">उपस्वामी (Sub Lord)</th>
                    <th className="py-2.5 px-3">उप-उपस्वामी (Sub-Sub)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#8C6239]/20 font-medium">
                  {kpData.planets.map((p) => (
                    <tr key={p.planet} className="hover:bg-[#F4E8D1]/50">
                      <td className="py-2 px-3 font-bold text-[#5C3A21]">
                        {p.planet} ({p.englishName})
                      </td>
                      <td className="py-2 px-3 text-[#5C3A21]">
                        {p.rashi} (भाव {p.house})
                      </td>
                      <td className="py-2 px-3 font-semibold text-[#8C6239]">
                        {p.formattedDegree}
                      </td>
                      <td className="py-2 px-3 text-[#5C3A21]">{p.signLord}</td>
                      <td className="py-2 px-3 font-bold text-[#5C3A21]">{p.starLord}</td>
                      <td className="py-2 px-3 font-black text-[#B56A00] bg-amber-50">
                        {p.subLord}
                      </td>
                      <td className="py-2 px-3 text-[#735133]">{p.subSubLord}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 12 House Cusps KP Table */}
          <div className="bg-white border border-[#8C6239]/30 rounded-xl overflow-hidden shadow-xs">
            <div className="p-3 bg-[#462B17] text-[#FAF2E4] font-bold text-xs uppercase tracking-wider flex items-center justify-between">
              <span>१२ भाव संधि / स्पन्द केपी स्वामी (12 House Cusp Star & Sub Lords)</span>
              <span className="text-[10px] text-[#FFD88A]">12 Cusp Positions</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F4E8D1] text-[#5C3A21] border-b border-[#8C6239]/30 font-bold">
                  <tr>
                    <th className="py-2.5 px-3">भाव (Cusp)</th>
                    <th className="py-2.5 px-3">राशि</th>
                    <th className="py-2.5 px-3">अंश (Cusp Deg)</th>
                    <th className="py-2.5 px-3">राशि स्वामी</th>
                    <th className="py-2.5 px-3">नक्षत्र स्वामी</th>
                    <th className="py-2.5 px-3 text-[#B56A00]">Cusp Sub Lord</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#8C6239]/20 font-medium">
                  {kpData.cusps.map((c) => (
                    <tr key={c.house} className="hover:bg-[#F4E8D1]/50">
                      <td className="py-2 px-3 font-bold text-[#B56A00]">
                        भाव {c.house}
                      </td>
                      <td className="py-2 px-3 text-[#5C3A21]">{c.rashi}</td>
                      <td className="py-2 px-3 font-semibold text-[#8C6239]">
                        {c.formattedDegree}
                      </td>
                      <td className="py-2 px-3 text-[#5C3A21]">{c.signLord}</td>
                      <td className="py-2 px-3 font-bold text-[#5C3A21]">{c.starLord}</td>
                      <td className="py-2 px-3 font-black text-[#B56A00] bg-amber-50">
                        {c.subLord}
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
                कुल सर्वाष्टकवर्ग अंक
              </span>
              <div className="text-xl font-black text-[#5C3A21]">{avData.totalPoints} / 337</div>
              <span className="text-[10px] text-[#735133]">शास्त्रीय मानक 337 अंक</span>
            </div>

            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-center space-y-1">
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                सर्वश्रेष्ठ शुभ राशि (Strongest)
              </span>
              <div className="text-xl font-black text-emerald-950">
                {avData.strongestRashi.rashi} ({avData.strongestRashi.points} Pts)
              </div>
              <span className="text-[10px] text-emerald-700">सर्वाधिक शुभ फल प्रदाता</span>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-center space-y-1">
              <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
                संवेदनशील राशि (Sensitive)
              </span>
              <div className="text-xl font-black text-amber-950">
                {avData.weakestRashi.rashi} ({avData.weakestRashi.points} Pts)
              </div>
              <span className="text-[10px] text-amber-700">गोचर में विशेष सावधानी आवश्यक</span>
            </div>
          </div>

          {/* Binnashtakvarga & Sarvashtakvarga Grid Table */}
          <div className="bg-white border border-[#8C6239]/30 rounded-xl overflow-hidden shadow-xs">
            <div className="p-3 bg-[#5C3A21] text-[#FAF2E4] font-bold text-xs uppercase tracking-wider flex items-center justify-between">
              <span>भिन्नाष्टकवर्ग एवं सर्वाष्टकवर्ग चक्र (BAV & SAV 12 Rashis Grid)</span>
              <span className="text-[10px] text-[#FFD88A]">28+ अंक = अति शुभ</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-center text-xs">
                <thead className="bg-[#F4E8D1] text-[#5C3A21] border-b border-[#8C6239]/30 font-bold">
                  <tr>
                    <th className="py-2.5 px-2 text-left">ग्रह (Planet)</th>
                    {RASHIS.map((r) => (
                      <th key={r} className="py-2.5 px-1 min-w-[36px]">
                        {r.substring(0, 3)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#8C6239]/20 font-medium">
                  {MAIN_PLANETS.map((p) => {
                    const bav = avData.planetBav[p] || Array(12).fill(0);
                    return (
                      <tr key={p} className="hover:bg-[#F4E8D1]/40">
                        <td className="py-2 px-2 text-left font-bold text-[#5C3A21]">{p}</td>
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
                    <td className="py-2.5 px-2 text-left text-[#FFD88A]">SAV कुल</td>
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
                <span>आत्मकारक (Atmakaraka): {jaiminiData.atmakaraka.planet} ({jaiminiData.atmakaraka.formattedDegree})</span>
              </div>
              <div className="text-xs text-[#FAF2E4] mt-1">
                कारकांश राशि: <strong className="text-amber-300">{jaiminiData.karakamshaRashi}</strong> (आध्यात्मिक एवं जीवन का मूल कारक)
              </div>
            </div>

            <div className="text-xs text-[#FFD88A] bg-[#2A1508] px-3 py-1.5 rounded-lg border border-[#8C6239]">
              अमात्यकारक: <strong>{jaiminiData.amatyakaraka.planet}</strong> ({jaiminiData.amatyakaraka.formattedDegree})
            </div>
          </div>

          {/* 7 Jaimini Chara Karakas Table */}
          <div className="bg-white border border-[#8C6239]/30 rounded-xl overflow-hidden shadow-xs">
            <div className="p-3 bg-[#5C3A21] text-[#FAF2E4] font-bold text-xs uppercase tracking-wider flex items-center justify-between">
              <span>जैमिनी ७ चर कारक तालिका (7 Chara Karaka Positions)</span>
              <span className="text-[10px] text-[#FFD88A]">अंशानुसार क्रम</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F4E8D1] text-[#5C3A21] border-b border-[#8C6239]/30 font-bold">
                  <tr>
                    <th className="py-2.5 px-3">कारक कोड</th>
                    <th className="py-2.5 px-3">कारक नाम</th>
                    <th className="py-2.5 px-3">ग्रह</th>
                    <th className="py-2.5 px-3">राशि</th>
                    <th className="py-2.5 px-3">अंश (Deg)</th>
                    <th className="py-2.5 px-3">कारकत्व व महत्त्व</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#8C6239]/20 font-medium">
                  {jaiminiData.karakas.map((k, idx) => (
                    <tr key={k.code} className="hover:bg-[#F4E8D1]/50">
                      <td className="py-2 px-3 font-black text-[#B56A00]">{k.code}</td>
                      <td className="py-2 px-3 font-bold text-[#5C3A21]">{k.title}</td>
                      <td className="py-2 px-3 font-black text-[#5C3A21]">{k.planet}</td>
                      <td className="py-2 px-3 text-[#5C3A21]">{k.rashi}</td>
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
              <span>जैमिनी चर दशा कालचक्र (Jaimini Chara Dasha Periods)</span>
              <span className="text-[10px] text-[#FFD88A]">12 राशियाँ</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F4E8D1] text-[#5C3A21] border-b border-[#8C6239]/30 font-bold">
                  <tr>
                    <th className="py-2.5 px-3">दशा राशि</th>
                    <th className="py-2.5 px-3">वर्ष अवधि</th>
                    <th className="py-2.5 px-3">प्रारंभ तिथि</th>
                    <th className="py-2.5 px-3">समाप्ति तिथि</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#8C6239]/20 font-medium">
                  {charaDashaData.map((d, i) => (
                    <tr key={i} className="hover:bg-[#F4E8D1]/50">
                      <td className="py-2 px-3 font-bold text-[#5C3A21]">
                        {d.rashi} (राशि {d.rashiNum})
                      </td>
                      <td className="py-2 px-3 font-black text-[#B56A00]">{d.years} वर्ष</td>
                      <td className="py-2 px-3 text-[#735133]">
                        {d.startDate.toLocaleDateString('hi-IN', { year: 'numeric', month: 'short' })}
                      </td>
                      <td className="py-2 px-3 text-[#735133]">
                        {d.endDate.toLocaleDateString('hi-IN', { year: 'numeric', month: 'short' })}
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
