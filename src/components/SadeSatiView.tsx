import React, { useState } from 'react';
import { KundaliData, SavedLocation } from '../types';
import { calculateSadeSati, calculateDailyTransits, SadeSatiStatus, PlanetTransitInfo } from '../services/sadesati';
import { Shield, AlertTriangle, Sparkles, CheckCircle, Info, Clock, Calendar, ArrowRight } from 'lucide-react';

interface SadeSatiViewProps {
  activeKundali: KundaliData | null;
  currentLocation: SavedLocation;
  onNavigateToKundali?: () => void;
}

export const SadeSatiView: React.FC<SadeSatiViewProps> = ({
  activeKundali,
  currentLocation,
  onNavigateToKundali,
}) => {
  const [transitDate, setTransitDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  const selectedDate = new Date(transitDate);

  if (!activeKundali) {
    return (
      <div className="bg-[#FAF2E4] border border-[#8C6239]/40 rounded-xl p-6 text-center space-y-3 shadow-xs">
        <div className="w-12 h-12 rounded-full bg-[#5C3A21] text-[#FFD88A] flex items-center justify-center mx-auto text-xl font-bold font-granth">
          🪐
        </div>
        <h3 className="font-granth font-bold text-[#5C3A21] text-base sm:text-lg">
          शनि साढ़े साती एवं गोचर विचार
        </h3>
        <p className="text-xs sm:text-sm text-[#735133] max-w-md mx-auto leading-relaxed">
          साढ़े साती व दैनिक गोचर फल देखने के लिए पहले अपनी जन्म पत्रिका का विवरण दर्ज करें।
        </p>
        {onNavigateToKundali && (
          <button
            type="button"
            onClick={onNavigateToKundali}
            className="px-4 py-2 bg-[#5C3A21] hover:bg-[#462B17] text-[#FAF2E4] rounded-lg text-xs font-bold transition cursor-pointer shadow-xs inline-flex items-center gap-1.5"
          >
            <span>कुंडली विवरण भरें</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    );
  }

  const sadeSati = calculateSadeSati(activeKundali, selectedDate);
  const transits = calculateDailyTransits(activeKundali, selectedDate);

  return (
    <div className="space-y-4">
      {/* Header Profile Bar */}
      <div className="bg-[#FAF2E4] border border-[#8C6239]/40 rounded-xl p-3 sm:p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-full bg-[#5C3A21] text-[#FFD88A] border border-[#B56A00] flex items-center justify-center font-bold text-sm shrink-0">
            🪐
          </div>
          <div>
            <div className="font-bold text-xs sm:text-sm text-[#5C3A21] flex items-center gap-2">
              <span>{activeKundali.name}</span>
              <span className="bg-[#5C3A21] text-[#FFD88A] px-2 py-0.5 rounded text-[10px] font-bold">
                चंद्र राशि: {activeKundali.moonRashi}
              </span>
            </div>
            <div className="text-[11px] text-[#735133] mt-0.5">
              वर्तमान शनि गोचर: <strong className="text-[#5C3A21]">{sadeSati.shaniCurrentRashi} राशि</strong> (चंद्र से {sadeSati.shaniTransitHouse}वां भाव)
            </div>
          </div>
        </div>

        {/* Date Picker for Transit */}
        <div className="flex items-center gap-1.5 bg-[#F4E8D1] px-2.5 py-1.5 rounded-lg border border-[#8C6239]/30">
          <Calendar className="w-3.5 h-3.5 text-[#B56A00]" />
          <span className="text-[11px] font-bold text-[#5C3A21]">गोचर तिथि:</span>
          <input
            type="date"
            value={transitDate}
            onChange={(e) => setTransitDate(e.target.value)}
            className="bg-white border border-[#8C6239]/30 rounded px-1.5 py-0.5 text-xs text-[#5C3A21] outline-none"
          />
        </div>
      </div>

      {/* Main Sade Sati Status Card */}
      <div
        className={`border-2 rounded-xl p-4 sm:p-5 shadow-sm space-y-3 ${
          sadeSati.isUnderSadeSati
            ? 'bg-rose-50/80 border-rose-800/40 text-rose-950'
            : sadeSati.isDhaiya
            ? 'bg-amber-50/80 border-amber-800/40 text-amber-950'
            : 'bg-emerald-50/80 border-emerald-800/40 text-emerald-950'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2.5 border-current/20">
          <div className="flex items-center gap-2">
            {sadeSati.isUnderSadeSati ? (
              <AlertTriangle className="w-5 h-5 text-rose-700 shrink-0" />
            ) : sadeSati.isDhaiya ? (
              <Info className="w-5 h-5 text-amber-700 shrink-0" />
            ) : (
              <CheckCircle className="w-5 h-5 text-emerald-700 shrink-0" />
            )}
            <h3 className="font-granth font-bold text-sm sm:text-base">
              {sadeSati.isUnderSadeSati
                ? `शनि साढ़े साती सक्रिय — ${sadeSati.activePhase?.name || ''}`
                : sadeSati.isDhaiya
                ? `शनि ढैया सक्रिय — ${sadeSati.dhaiyaType}`
                : 'साढ़े साती व ढैया से पूर्णतः मुक्त!'}
            </h3>
          </div>

          <span
            className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
              sadeSati.isUnderSadeSati
                ? 'bg-rose-700 text-white shadow-xs'
                : sadeSati.isDhaiya
                ? 'bg-amber-700 text-white shadow-xs'
                : 'bg-emerald-700 text-white shadow-xs'
            }`}
          >
            {sadeSati.isUnderSadeSati ? 'साढ़े साती प्रभाव' : sadeSati.isDhaiya ? 'ढैया प्रभाव' : 'शुभ गोचर'}
          </span>
        </div>

        <p className="text-xs sm:text-sm leading-relaxed font-medium">
          {sadeSati.summary}
        </p>
      </div>

      {/* Sade Sati 3 Phases Timeline Bar */}
      <div className="bg-[#FAF2E4] border border-[#8C6239]/40 rounded-xl p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-granth font-bold text-xs sm:text-sm text-[#5C3A21] flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-[#B56A00]" />
            साढ़े साती के तीनों चरण (3 Phases Cycle for {activeKundali.moonRashi} Rashi)
          </h4>
          <span className="text-[10px] text-[#8C6239] font-bold">प्रत्येक चरण = 2.5 वर्ष</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {sadeSati.allPhases.map((phase, idx) => (
            <div
              key={idx}
              className={`p-3.5 rounded-xl border-2 transition ${
                phase.isActive
                  ? 'bg-[#F4E8D1] border-[#B56A00] shadow-xs ring-1 ring-[#B56A00]'
                  : 'bg-[#F4E8D1]/50 border-[#8C6239]/20'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-[#5C3A21]">{phase.name}</span>
                {phase.isActive && (
                  <span className="bg-rose-700 text-white px-2 py-0.5 rounded text-[9px] font-black uppercase animate-pulse">
                    वर्तमान में सक्रिय
                  </span>
                )}
              </div>
              <div className="text-[11px] text-[#B56A00] font-bold mt-1">
                शनि राशि: {phase.shaniRashi} ({phase.startApprox} से {phase.endApprox})
              </div>
              <div className="text-[10px] text-[#735133] mt-1.5 leading-relaxed">
                {phase.description}
              </div>
              <div className="text-[10px] font-bold text-[#8C6239] mt-2 pt-1 border-t border-[#8C6239]/20">
                शरीर पर प्रभाव: {phase.bodyImpact}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Planetary Transit (Gochar) Grid */}
      <div className="bg-[#FAF2E4] border border-[#8C6239]/40 rounded-xl overflow-hidden shadow-xs">
        <div className="p-3 bg-[#5C3A21] text-[#FAF2E4] font-bold text-xs sm:text-sm flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#FFD88A]" />
            <span>दैनिक ग्रह गोचर फल (Transits from Natal Moon: {activeKundali.moonRashi})</span>
          </div>
          <span className="text-[10px] text-[#FFD88A] font-bold">दिनांक: {selectedDate.toLocaleDateString('hi-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F4E8D1] text-[#5C3A21] border-b border-[#8C6239]/30">
              <tr>
                <th className="py-2.5 px-3">ग्रह (Planet)</th>
                <th className="py-2.5 px-3">वर्तमान राशि</th>
                <th className="py-2.5 px-3">चंद्र से भाव</th>
                <th className="py-2.5 px-3">प्रभाव</th>
                <th className="py-2.5 px-3">गोचर फल व शास्त्रोक्त प्रभाव</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#8C6239]/20">
              {transits.map((item, idx) => (
                <tr key={idx} className="hover:bg-[#F4E8D1]/60">
                  <td className="py-2.5 px-3 font-bold text-[#5C3A21] flex items-center gap-1.5">
                    <span>{item.planet}</span>
                    <span className="text-[10px] text-[#8C6239] font-normal">({item.englishName})</span>
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-[#5C3A21]">
                    {item.currentRashi} ({item.currentDegree.toFixed(1)}°)
                  </td>
                  <td className="py-2.5 px-3 font-bold text-[#B56A00]">
                    {item.houseFromMoon}वां भाव
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.nature === 'शुभ'
                          ? 'bg-emerald-100 text-emerald-800'
                          : item.nature === 'अशुभ'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {item.nature}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-[#5C3A21] leading-relaxed max-w-xs sm:max-w-md">
                    {item.prediction}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Classical Vedic Remedies for Shani */}
      <div className="bg-[#FAF2E4] border border-[#8C6239]/40 rounded-xl p-4 sm:p-5 shadow-xs space-y-3">
        <h4 className="font-granth font-bold text-xs sm:text-sm text-[#5C3A21] flex items-center gap-2">
          <Shield className="w-4 h-4 text-[#B56A00]" />
          शनि साढ़े साती एवं ढैया के अचूक वैदिक परिहार व उपाय
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {sadeSati.vedicRemedies.map((remedy, idx) => (
            <div
              key={idx}
              className="flex items-start gap-2 p-2.5 bg-[#F4E8D1] rounded-lg border border-[#8C6239]/20 text-xs text-[#5C3A21]"
            >
              <span className="w-5 h-5 rounded-full bg-[#5C3A21] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <span className="leading-relaxed">{remedy}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
