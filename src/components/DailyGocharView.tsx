import React, { useState } from 'react';
import { calculateDailyGochar, DailyGocharData, GocharPlanetDetail } from '../services/gochar';
import { KundaliChart } from './KundaliChart';
import { Sparkles, Share2, Compass, AlertCircle, CheckCircle2, ChevronRight, Moon, Sun } from 'lucide-react';

interface DailyGocharViewProps {
  date: Date;
  locationName?: string;
  lat?: number;
  lon?: number;
  tzHours?: number;
  onOpenUmaModal?: (query?: string) => void;
}

export const DailyGocharView: React.FC<DailyGocharViewProps> = ({
  date,
  locationName = 'वाराणसी/उज्जैन',
  lat = 23.1765,
  lon = 75.7885,
  tzHours = 5.5,
  onOpenUmaModal,
}) => {
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');
  const [referenceFrame, setReferenceFrame] = useState<'lagna' | 'moon'>('lagna');
  const [copiedNotice, setCopiedNotice] = useState<string | null>(null);

  const gocharData: DailyGocharData = calculateDailyGochar(date, lat, lon, tzHours);

  // If viewing from Moon sign, adjust lagnaDegree to start of Moon's sign so 1st house is Moon
  const activeLagnaDegree =
    referenceFrame === 'lagna'
      ? gocharData.lagnaDegree
      : (gocharData.moonRashiNumber - 1) * 30 + 0.1;

  const chartTitle =
    referenceFrame === 'lagna'
      ? `दैनिक गोचर चक्र (लग्न: ${gocharData.lagnaRashi})`
      : `चंद्र गोचर चक्र (चंद्र राशि: ${gocharData.moonRashi})`;

  const handleShareGochar = () => {
    const lines = [
      `🪐 *दैनिक नवग्रह गोचर चक्र • शक्ति सनातन पंचांग*`,
      `📅 दिनांक: ${date.toLocaleDateString('hi-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`,
      `📍 स्थान: ${locationName}`,
      `🌅 गोचर लग्न: ${gocharData.lagnaRashi} | चंद्र: ${gocharData.moonRashi}`,
      ``,
      `*नवग्रह वास्तविक स्थिति:*`,
      ...gocharData.planets.map(
        (p) =>
          `• ${p.symbol} ${p.planet}: ${p.rashi} (${p.degFormatted}) - ${p.nakshatra} (च.${p.pada}) [${p.statusText}]`
      ),
    ];

    if (gocharData.transitYogas.length > 0) {
      lines.push(``);
      lines.push(`✨ *सक्रिय शुभ गोचर योग:*`);
      gocharData.transitYogas.forEach((y) => {
        lines.push(`• ${y.name}: ${y.description}`);
      });
    }

    if (gocharData.retrogradePlanets.length > 0) {
      lines.push(``);
      lines.push(`⚠️ वक्री ग्रह: ${gocharData.retrogradePlanets.map((p) => p.planet).join(', ')}`);
    }

    lines.push(``);
    lines.push(`🌙 चंद्र का अगला राशि परिवर्तन: ~${gocharData.moonHoursToNextSign} घंटे में (${gocharData.nextMoonRashi} राशि में)`);
    lines.push(`॥ शुभम् भवतु • शक्ति पंचांग ॥`);

    const text = lines.join('\n');
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleCopyGochar = () => {
    const lines = [
      `🪐 दैनिक नवग्रह गोचर चक्र (${date.toLocaleDateString('hi-IN')}) - ${locationName}`,
      ...gocharData.planets.map(
        (p) => `${p.planet}: ${p.rashi} ${p.degFormatted} | ${p.nakshatra} (${p.statusText})`
      ),
    ];
    navigator.clipboard.writeText(lines.join('\n'));
    setCopiedNotice('गोचर विवरण कॉपी हो गया!');
    setTimeout(() => setCopiedNotice(null), 2500);
  };

  return (
    <div className="space-y-2.5 animate-in fade-in duration-150">
      {/* 1. Hero Snapshot Card */}
      <div className="bg-gradient-to-r from-[#FAF2E4] to-[#F5E7D0] border border-[#8C6239]/35 rounded-xl p-3 shadow-xs">
        <div className="flex items-center justify-between text-xs text-[#8C6239] font-bold">
          <span className="flex items-center gap-1">
            <Compass className="w-3.5 h-3.5 text-[#B56A00]" />
            <span>दैनिक प्रत्यक्ष नवग्रह गोचर (Live Planetary Transit)</span>
          </span>
          <span className="font-mono text-[10px] bg-[#8C6239]/15 text-[#5C3A21] px-1.5 py-0.5 rounded">
            {locationName}
          </span>
        </div>

        {/* 3 Quick Badges Ribbon */}
        <div className="grid grid-cols-3 gap-1.5 mt-2 text-center">
          {/* Sun */}
          <div className="bg-white/80 border border-[#8C6239]/20 rounded-lg p-1.5">
            <div className="text-[10px] font-bold text-[#8C6239] flex items-center justify-center gap-0.5">
              <Sun className="w-3 h-3 text-amber-600" />
              <span>सूर्य गोचर</span>
            </div>
            <div className="text-xs font-black text-[#5C3A21] mt-0.5">
              {gocharData.planets.find((p) => p.planet === 'सूर्य')?.rashi}
            </div>
            <div className="text-[9px] text-[#735133]">
              {gocharData.planets.find((p) => p.planet === 'सूर्य')?.degFormatted}
            </div>
          </div>

          {/* Moon */}
          <div className="bg-white/80 border border-[#8C6239]/20 rounded-lg p-1.5">
            <div className="text-[10px] font-bold text-[#8C6239] flex items-center justify-center gap-0.5">
              <Moon className="w-3 h-3 text-indigo-600" />
              <span>चंद्र गोचर</span>
            </div>
            <div className="text-xs font-black text-[#5C3A21] mt-0.5">
              {gocharData.moonRashi}
            </div>
            <div className="text-[9px] text-emerald-800 font-bold">
              ~{gocharData.moonHoursToNextSign} घं शेष
            </div>
          </div>

          {/* Retrograde planets */}
          <div className="bg-white/80 border border-[#8C6239]/20 rounded-lg p-1.5">
            <div className="text-[10px] font-bold text-[#8C6239]">
              वक्री ग्रह ({gocharData.retrogradePlanets.length})
            </div>
            <div className="text-xs font-black text-rose-800 mt-0.5 truncate">
              {gocharData.retrogradePlanets.length > 0
                ? gocharData.retrogradePlanets.map((p) => p.planet).join(', ')
                : 'सभी मार्गी'}
            </div>
            <div className="text-[9px] text-[#735133]">
              {gocharData.combustPlanets.length > 0
                ? `${gocharData.combustPlanets.map((p) => p.planet).join(', ')} अस्त`
                : 'कोई अस्त नहीं'}
            </div>
          </div>
        </div>

        {/* Moon Ingress notice */}
        <div className="mt-2 text-[11px] text-[#735133] bg-[#8C6239]/10 rounded-lg p-1.5 flex items-center justify-between">
          <span>
            🌙 चंद्र देव वर्तमान में <strong className="text-[#5C3A21]">{gocharData.moonRashi}</strong> में हैं,
            अगला प्रवेश <strong className="text-[#5C3A21]">{gocharData.nextMoonRashi}</strong> राशि में होगा।
          </span>
        </div>
      </div>

      {/* 2. Active Transit Yogas (if any) */}
      {gocharData.transitYogas.length > 0 && (
        <div className="space-y-1.5">
          {gocharData.transitYogas.map((yoga, idx) => (
            <div
              key={idx}
              className="bg-gradient-to-r from-[#FFF8E1] to-[#FFE082] border border-[#FFE082] rounded-xl p-2.5 shadow-2xs flex items-start justify-between gap-2"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 font-black text-xs text-[#5C3A21]">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>{yoga.name}</span>
                  <span className="text-[9px] px-1.5 py-0.2 bg-amber-600/20 text-[#5C3A21] rounded">
                    सक्रिय गोचर योग
                  </span>
                </div>
                <p className="text-[11px] text-[#735133] leading-snug">{yoga.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 3. View Mode Switcher (Chart vs Table & Lagna vs Moon) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-1.5 bg-[#FAF2E4] border border-[#8C6239]/30 p-1.5 rounded-xl shadow-2xs">
        {/* Chart vs Table */}
        <div className="flex items-center gap-1 flex-1">
          <button
            type="button"
            onClick={() => setViewMode('chart')}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-black transition cursor-pointer flex items-center justify-center gap-1 ${
              viewMode === 'chart'
                ? 'bg-[#5C3A21] text-white shadow-xs'
                : 'text-[#5C3A21] hover:bg-[#F4E8D1]'
            }`}
          >
            <span>🎯 गोचर चक्र (Kundali)</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('table')}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-black transition cursor-pointer flex items-center justify-center gap-1 ${
              viewMode === 'table'
                ? 'bg-[#5C3A21] text-white shadow-xs'
                : 'text-[#5C3A21] hover:bg-[#F4E8D1]'
            }`}
          >
            <span>📋 विस्तृत ग्रह सारणी</span>
          </button>
        </div>

        {/* Lagna vs Moon Reference */}
        {viewMode === 'chart' && (
          <div className="flex items-center gap-1 border-t sm:border-t-0 sm:border-l border-[#8C6239]/25 pt-1 sm:pt-0 sm:pl-1.5 text-[11px]">
            <span className="text-[10px] font-bold text-[#8C6239] mr-0.5">आधार:</span>
            <button
              type="button"
              onClick={() => setReferenceFrame('lagna')}
              className={`py-1 px-2 rounded-md font-bold transition cursor-pointer ${
                referenceFrame === 'lagna'
                  ? 'bg-[#B56A00] text-white'
                  : 'bg-white/80 text-[#5C3A21] hover:bg-white'
              }`}
            >
              लग्न से
            </button>
            <button
              type="button"
              onClick={() => setReferenceFrame('moon')}
              className={`py-1 px-2 rounded-md font-bold transition cursor-pointer ${
                referenceFrame === 'moon'
                  ? 'bg-[#B56A00] text-white'
                  : 'bg-white/80 text-[#5C3A21] hover:bg-white'
              }`}
            >
              चंद्र राशि से
            </button>
          </div>
        )}
      </div>

      {/* 4. Display Content: Chart or Table */}
      {viewMode === 'chart' ? (
        <div className="space-y-2">
          {/* North/South Kundali Chart */}
          <div className="bg-white border border-[#8C6239]/30 rounded-xl p-2 sm:p-3 shadow-2xs">
            <KundaliChart
              lagnaDegree={activeLagnaDegree}
              planets={gocharData.planets}
              chartTitle={chartTitle}
              allowToggleStyle={true}
            />
          </div>

          {/* Quick Guidance */}
          <div className="text-[11px] text-[#735133] bg-[#FAF2E4] border border-[#8C6239]/25 rounded-lg p-2 text-center">
            💡 <strong>सुझाव:</strong> ज्योतिष में वर्तमान दैनिक गोचर को <strong>चंद्र राशि</strong> से देखने पर दैनिक मानसिक शांति, लाभ व स्वास्थ्य का अत्यंत सटीक फल प्राप्त होता है।
          </div>
        </div>
      ) : (
        /* Detailed Planet Transit Table */
        <div className="bg-white border border-[#8C6239]/30 rounded-xl overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF2E4] text-[#5C3A21] border-b border-[#8C6239]/20 text-[11px]">
                <tr>
                  <th className="py-2 px-2.5 font-black">ग्रह</th>
                  <th className="py-2 px-2.5 font-black">राशि</th>
                  <th className="py-2 px-2.5 font-black">भोगांश</th>
                  <th className="py-2 px-2.5 font-black">नक्षत्र (चरण)</th>
                  <th className="py-2 px-2.5 font-black">अवस्था</th>
                  <th className="py-2 px-2.5 font-black">भाव (L/M)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#8C6239]/15">
                {gocharData.planets.map((p, idx) => (
                  <tr key={idx} className="hover:bg-[#FAF2E4]/50">
                    <td className="py-2 px-2.5 font-bold text-[#5C3A21] flex items-center gap-1.5 whitespace-nowrap">
                      <span>{p.symbol}</span>
                      <span>{p.planet}</span>
                    </td>
                    <td className="py-2 px-2.5 font-semibold text-[#5C3A21] whitespace-nowrap">
                      {p.rashi}
                    </td>
                    <td className="py-2 px-2.5 font-mono text-[11px] text-[#735133] whitespace-nowrap">
                      {p.dms}
                    </td>
                    <td className="py-2 px-2.5 text-[#5C3A21] whitespace-nowrap">
                      <div>{p.nakshatra}</div>
                      <div className="text-[10px] text-[#8C6239]">
                        चरण {p.pada} • {p.nakshatraLord}
                      </div>
                    </td>
                    <td className="py-2 px-2.5 whitespace-nowrap">
                      <div className="flex flex-col gap-0.5">
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded text-center border ${
                            p.isRetrograde
                              ? 'bg-rose-100 text-rose-800 border-rose-300 font-bold'
                              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          }`}
                        >
                          {p.isRetrograde ? 'वक्री (R)' : 'मार्गी'}
                        </span>
                        {p.isCombust && (
                          <span className="text-[9px] px-1 py-0.2 rounded text-center bg-amber-100 text-amber-900 border border-amber-300 font-bold">
                            अस्त
                          </span>
                        )}
                        {p.dignity !== 'सम' && (
                          <span className={`text-[9px] px-1 py-0.2 rounded text-center border ${p.dignityClass}`}>
                            {p.dignity}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-2 px-2.5 text-[11px] font-mono text-[#5C3A21] whitespace-nowrap">
                      {p.houseFromLagna}L / {p.houseFromMoon}M
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-2 bg-[#FAF2E4]/60 border-t border-[#8C6239]/15 text-[10px] text-[#735133] flex items-center justify-between">
            <span>* L = लग्न से भाव, M = चंद्र राशि से भाव</span>
            <span>अयन: लाहिरी (चित्रापक्षीय)</span>
          </div>
        </div>
      )}

      {/* 5. 1-Click WhatsApp Share & Uma AI Action Bar */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        <button
          type="button"
          onClick={handleShareGochar}
          className="py-2 px-3 bg-gradient-to-r from-[#25D366] to-[#1EBE5D] hover:from-[#20bd5a] hover:to-[#1aa852] text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-98"
          title="आज का ग्रह गोचर व्हाट्सएप पर साझा करें"
        >
          <Share2 className="w-3.5 h-3.5 text-white" />
          <span>व्हाट्सएप पर शेयर करें</span>
        </button>

        {onOpenUmaModal && (
          <button
            type="button"
            onClick={() => onOpenUmaModal(`आज का नवग्रह गोचर (सूर्य ${gocharData.planets.find((p) => p.planet === 'सूर्य')?.rashi} में, चंद्र ${gocharData.moonRashi} में) का संपूर्ण फलित प्रभाव और सात्विक उपाय बताएं।`)}
            className="py-2 px-3 bg-gradient-to-r from-[#B56A00] to-[#8C6239] hover:from-[#9c5a00] hover:to-[#734f2d] text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-98"
            title="उमा AI से आज के गोचर का फल पूछें"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-200" />
            <span>उमा से गोचर फल पूछें</span>
          </button>
        )}
      </div>

      {copiedNotice && (
        <div className="p-2 bg-emerald-800 text-white text-xs font-bold rounded-lg text-center shadow-xs">
          {copiedNotice}
        </div>
      )}
    </div>
  );
};
