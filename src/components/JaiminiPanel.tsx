import React, { useState, useMemo } from 'react';
import { KundaliData } from '../types';
import { calculateJaiminiAnalysis, JaiminiCharaDashaPeriod } from '../services/jaimini';
import {
  Sparkles,
  Zap,
  Crown,
  Compass,
  Award,
  ChevronRight,
  ChevronDown,
  Info,
  Calendar,
  Layers,
  Star,
  Shield,
  Heart,
  Activity,
} from 'lucide-react';

interface JaiminiPanelProps {
  kundali: KundaliData;
}

export const JaiminiPanel: React.FC<JaiminiPanelProps> = ({ kundali }) => {
  const jaimini = useMemo(() => calculateJaiminiAnalysis(kundali), [kundali]);

  const [expandedSign, setExpandedSign] = useState<string | null>(
    jaimini.currentCharaMaha.rashi
  );

  const fmtDate = (d: Date) => {
    return new Date(d).toLocaleDateString('hi-IN', {
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
                जैमिनी महर्षि सिद्धान्त (Jaimini Chara Dasha & Karakas)
              </h3>
            </div>
            <p className="text-xs text-[#735133] font-medium mt-0.5">
              महर्षि जैमिनी सूत्र अनुसार ७ चर कारक, कारकांश, आरूढ़ लग्न एवं १२ राशि चर दशा चक्र
            </p>
          </div>

          <div className="bg-gradient-to-r from-[#B56A00] to-[#8C6239] text-white px-3.5 py-1.5 rounded-xl font-bold text-xs shadow-xs flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>वर्तमान सक्रिय चर दशा: <strong>{jaimini.currentCharaMaha.rashi}</strong></span>
          </div>
        </div>

        {/* 4 Key Jaimini Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* 1. Atmakaraka (AK) */}
          <div className="bg-[#F4E8D1] border border-[#B56A00]/40 rounded-xl p-3 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-[11px] font-bold text-[#8C6239]">
              <span>आत्माकारक (AK)</span>
              <Crown className="w-3.5 h-3.5 text-[#B56A00]" />
            </div>
            <div className="text-base font-black text-[#5C3A21] flex items-center gap-1">
              <span>{jaimini.atmakaraka.planet}</span>
              <span className="text-xs font-bold text-[#B56A00]">({jaimini.atmakaraka.rashi})</span>
            </div>
            <div className="text-[10px] text-[#735133] font-medium">
              अंश: {jaimini.atmakaraka.degreeInRashi.toFixed(2)}°
            </div>
          </div>

          {/* 2. Amatyakaraka (AmK) */}
          <div className="bg-[#F4E8D1] border border-[#B56A00]/40 rounded-xl p-3 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-[11px] font-bold text-[#8C6239]">
              <span>अमात्यकारक (AmK)</span>
              <Award className="w-3.5 h-3.5 text-[#B56A00]" />
            </div>
            <div className="text-base font-black text-[#5C3A21] flex items-center gap-1">
              <span>{jaimini.amatyakaraka.planet}</span>
              <span className="text-xs font-bold text-[#B56A00]">({jaimini.amatyakaraka.rashi})</span>
            </div>
            <div className="text-[10px] text-[#735133] font-medium">
              अंश: {jaimini.amatyakaraka.degreeInRashi.toFixed(2)}°
            </div>
          </div>

          {/* 3. Karakamsha (KL) */}
          <div className="bg-[#F4E8D1] border border-[#B56A00]/40 rounded-xl p-3 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-[11px] font-bold text-[#8C6239]">
              <span>कारकांश (KL)</span>
              <Compass className="w-3.5 h-3.5 text-[#B56A00]" />
            </div>
            <div className="text-base font-black text-[#5C3A21]">
              {jaimini.karakamshaRashi}
            </div>
            <div className="text-[10px] text-[#735133] font-medium">
              AK की D9 नवमांश राशि
            </div>
          </div>

          {/* 4. Arudha Lagna (AL) */}
          <div className="bg-[#F4E8D1] border border-[#B56A00]/40 rounded-xl p-3 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-[11px] font-bold text-[#8C6239]">
              <span>आरूढ़ लग्न (AL)</span>
              <Shield className="w-3.5 h-3.5 text-[#B56A00]" />
            </div>
            <div className="text-base font-black text-[#5C3A21]">
              {jaimini.arudhaLagnaRashi}
            </div>
            <div className="text-[10px] text-[#735133] font-medium">
              {jaimini.arudhaLagnaHouse}म भाव पद (सांसारिक छवि)
            </div>
          </div>
        </div>

        {/* Current Active Chara Dasha Strip */}
        <div className="p-3 bg-gradient-to-r from-amber-100 via-amber-50 to-amber-100 border border-[#B56A00]/30 rounded-xl text-xs text-[#5C3A21] flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className="font-bold">सक्रिय चर महादशा: </span>
            <span className="font-black text-[#B56A00] text-sm">{jaimini.currentCharaMaha.rashi}</span>
            <span className="ml-2 text-[#735133]">
              ({fmtDate(jaimini.currentCharaMaha.startDate)} से {fmtDate(jaimini.currentCharaMaha.endDate)})
            </span>
          </div>

          <div>
            <span className="font-bold">सक्रिय सूक्ष्मान्तर्दशा: </span>
            <span className="font-black text-emerald-800 text-sm bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
              {jaimini.currentCharaAntar.rashi}
            </span>
          </div>
        </div>
      </div>

      {/* Section 1: 7 Jaimini Chara Karakas Table */}
      <div className="bg-[#FAF2E4] border border-[#8C6239]/40 rounded-2xl overflow-hidden shadow-xs space-y-0">
        <div className="p-3.5 bg-[#5C3A21] text-[#FAF2E4] font-bold text-xs uppercase tracking-wider flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-300 fill-amber-300" />
            १. जैमिनी ७ चर कारक तालिका (7 Jaimini Chara Karakas Order)
          </span>
          <span className="text-[10px] text-amber-200">अंशों के अवरोही क्रम में</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F4E8D1] text-[#5C3A21] border-b border-[#8C6239]/30 font-bold">
              <tr>
                <th className="py-2.5 px-3">कारक कोड</th>
                <th className="py-2.5 px-3">कारक नाम</th>
                <th className="py-2.5 px-3">ग्रह</th>
                <th className="py-2.5 px-3">राशि</th>
                <th className="py-2.5 px-3">भाव</th>
                <th className="py-2.5 px-3">स्पष्ट अंश</th>
                <th className="py-2.5 px-3">कारकत्व significance</th>
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
                      {k.planet}
                      {isAK && (
                        <span className="ml-1.5 text-[9px] bg-[#B56A00] text-white px-1 py-0.2 rounded font-bold">
                          आत्मा
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-[#5C3A21]">{k.rashi}</td>
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
              कारकांश (Karakamsha Lagna)
            </h4>
          </div>
          <div className="text-sm font-black text-[#B56A00]">
            {jaimini.karakamshaRashi} राशि (D9)
          </div>
          <p className="text-xs text-[#735133] leading-relaxed">
            आत्माकारक ग्रह ({jaimini.atmakaraka.planet}) जिस नवमांश D9 राशि में स्थित होता है, उसे <strong>कारकांश</strong> कहते हैं। यह जातक के अंतरात्मा की इच्छा, आत्मिक उन्नति, प्रतिभा व जीवन के सूक्ष्म मोक्ष मार्ग को दर्शाता है।
          </p>
        </div>

        {/* Arudha Lagna Card */}
        <div className="bg-[#FAF2E4] border border-[#8C6239]/40 rounded-xl p-4 space-y-2 shadow-2xs">
          <div className="flex items-center gap-2 border-b border-[#8C6239]/20 pb-2">
            <Shield className="w-4 h-4 text-[#B56A00]" />
            <h4 className="font-bold text-sm font-granth text-[#5C3A21]">
              आरूढ़ लग्न (Arudha Lagna - AL)
            </h4>
          </div>
          <div className="text-sm font-black text-[#B56A00]">
            {jaimini.arudhaLagnaRashi} ({jaimini.arudhaLagnaHouse} भाव पद)
          </div>
          <p className="text-xs text-[#735133] leading-relaxed">
            लग्न स्वामी की स्थिति से निर्मित आरूढ़ पद <strong>सांसारिक छवि, प्रतिष्ठा एवं बाह्य जगत् का दृष्टिकोण</strong> प्रदर्शित करता है। समाज में आपका प्रभाव इसी आरूढ़ पद से आकलित होता है।
          </p>
        </div>

        {/* Upapada Lagna Card */}
        <div className="bg-[#FAF2E4] border border-[#8C6239]/40 rounded-xl p-4 space-y-2 shadow-2xs">
          <div className="flex items-center gap-2 border-b border-[#8C6239]/20 pb-2">
            <Heart className="w-4 h-4 text-rose-700" />
            <h4 className="font-bold text-sm font-granth text-[#5C3A21]">
              उपपद लग्न (Upapada Lagna - UL)
            </h4>
          </div>
          <div className="text-sm font-black text-rose-800">
            {jaimini.upapadaLagnaRashi} ({jaimini.upapadaLagnaHouse} भाव पद)
          </div>
          <p className="text-xs text-[#735133] leading-relaxed">
            12वें भाव से व्युत्पन्न उपपद लग्न <strong>विवाह, दांपत्य जीवन का स्थायित्व, जीवनसाथी का स्वभाव व पारिवारिक सौहार्द</strong> का निर्विवाद जैमिनी संकेतक है।
          </p>
        </div>
      </div>

      {/* Section 3: 12-Sign Jaimini Chara Dasha System */}
      <div className="bg-[#FAF2E4] border border-[#8C6239]/40 rounded-2xl overflow-hidden shadow-xs space-y-0">
        <div className="p-3.5 bg-[#5C3A21] text-[#FAF2E4] font-bold text-xs uppercase tracking-wider flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-300" />
            २. जैमिनी १२ राशि चर महादशा एवं अंतर्दशा चक्र (Chara Dasha Sequence)
          </span>
          <span className="text-[10px] text-amber-200">क्लिक कर १२ अंतर्दशाएँ खोलें</span>
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
                        <span>{period.rashi} चर महादशा</span>
                        {isNow && (
                          <span className="bg-[#B56A00] text-white text-[9px] px-2 py-0.5 rounded-full font-black animate-pulse">
                            वर्तमान सक्रिय
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-[#735133] mt-0.5">
                        स्वामी: {period.lord} | अवधि: {fmtDate(period.startDate)} से {fmtDate(period.endDate)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-sm font-black text-[#B56A00] bg-[#FAF2E4] px-2.5 py-1 rounded-lg border border-[#8C6239]/30">
                      {period.years} वर्ष
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
                      <span>{period.rashi} चर महादशा में १२ सूक्ष्मान्तर्दशाएँ:</span>
                      <span className="text-[11px] text-[#735133]">कुल अवधि: {period.years} वर्ष</span>
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
                                {antar.rashi} अंतर्दशा
                              </span>
                              {isAntarNow && (
                                <span className="bg-emerald-700 text-white text-[8px] px-1.5 py-0.2 rounded font-black">
                                  सक्रिय
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-[#735133]">
                              {fmtDate(antar.startDate)} - {fmtDate(antar.endDate)}
                            </div>
                            <div className="text-[10px] text-[#B56A00] font-bold">
                              {antar.months} माह
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
