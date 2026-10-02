import React, { useEffect, useMemo, useState } from 'react';
import { Sparkles, Sun, Award, Share2, Star } from 'lucide-react';
import { openWhatsAppShare } from '../services/umaConsultationPdf';
import { getStoredLocation } from '../services/storage';
import { buildDailyRashifal, RASHI_META } from '../services/dailyRashifal';

export const DailyRashifalView: React.FC<{ personName?: string; lagnaRashi?: string }> = ({
  personName,
  lagnaRashi,
}) => {
  const matched = RASHI_META.find((r) => lagnaRashi?.startsWith(r.name));
  const [selectedRashiId, setSelectedRashiId] = useState<string>(matched?.id || 'mesh');
  useEffect(() => {
    if (matched) setSelectedRashiId(matched.id);
  }, [matched?.id]);
  const currentRashi = RASHI_META.find((r) => r.id === selectedRashiId) || RASHI_META[0];
  const live = useMemo(() => {
    const place = getStoredLocation();
    return buildDailyRashifal(
      currentRashi.id,
      new Date(),
      place.latitude,
      place.longitude,
      place.timezoneHours,
    );
  }, [currentRashi.id]);

  const handleShare = () => {
    const text = `🌟 *${live.dateLabel} का राशिफल — ${currentRashi.name}* 🌟\nचंद्र गोचर: ${live.moonTransit}\n\nसामान्य: ${live.general}\nकरियर: ${live.career}\nधन: ${live.wealth}\nउपाय: ${live.remedy}\n\nग्रह स्थिति आज की गणना से। शक्ति पंचांग।`;
    openWhatsAppShare(text);
  };

  return (
    <div className="w-full space-y-4 animate-in fade-in duration-200">
      {/* Header */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#5C3A21] via-[#8C6239] to-[#5C3A21] text-[#FAF2E4] shadow-md border border-[#FFD88A]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#FAF2E4]/10 border border-[#FFD88A]/40 flex items-center justify-center shrink-0">
            <Sun className="w-6 h-6 text-[#FFD88A]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold font-granth text-[#FFD88A]">
                दैनिक राशिफल (Daily Horoscope)
              </h2>
              <span className="text-[10px] bg-[#B56A00] text-white px-2 py-0.5 rounded-full font-bold">
                ग्रह गोचर फलित
              </span>
            </div>
            <p className="text-xs text-[#FAF2E4]/80 mt-0.5">
              चंद्र राशि के अनुसार आज का दिन, करियर, धन, स्वास्थ्य एवं विशेष उपाय
            </p>
          </div>
        </div>
      </div>

      {/* Rashi Selector Horizontal */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {RASHI_META.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => setSelectedRashiId(r.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              selectedRashiId === r.id
                ? 'bg-[#B56A00] text-white shadow-xs'
                : 'bg-[#FAF2E4] text-[#5C3A21] border border-[#8C6239]/20 hover:bg-[#F4E8D1]'
            }`}
          >
            <span>{r.symbol}</span>
            <span>{r.name.split(' ')[0]}</span>
          </button>
        ))}
      </div>

      {/* Active Rashi Horoscope Card */}
      <div className="p-4 sm:p-6 rounded-2xl bg-[#FAF2E4] border border-[#8C6239]/25 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#8C6239]/20">
          <div className="flex items-center gap-3">
            <span className="text-3xl p-2 rounded-2xl bg-[#5C3A21] text-[#FFD88A] shadow-inner font-granth">
              {currentRashi.symbol}
            </span>
            <div>
              <h3 className="text-lg sm:text-xl font-bold font-granth text-[#5C3A21]">
                {personName ? `${personName} — लग्न ${lagnaRashi}` : currentRashi.name} राशि फल
              </h3>
              <p className="text-xs text-[#735133]">
                {live.dateLabel} • चंद्र गोचर: {live.moonTransit} • स्वामी {currentRashi.lord}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleShare}
            className="p-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">शेयर</span>
          </button>
        </div>

        {/* Lucky info badges */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 rounded-xl bg-white border border-[#8C6239]/15">
            <span className="font-bold text-[#8C6239]">स्वामी: </span>
            <span className="text-[#3E2714]">{currentRashi.lord}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-white border border-[#8C6239]/15">
            <span className="font-bold text-[#8C6239]">आधार: </span>
            <span className="text-[#3E2714]">{personName ? `${personName} का लग्न` : "चुनी हुई राशि"}</span>
          </div>
        </div>

        {/* Predictions Sections */}
        <div className="space-y-3 text-xs">
          <div className="p-3.5 rounded-xl bg-white border border-[#8C6239]/15 space-y-1">
            <h4 className="font-bold text-[#B56A00] flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5" />
              <span>सामान्य फलादेश</span>
            </h4>
            <p className="text-[#3E2714] leading-relaxed">{live.general}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-white border border-[#8C6239]/15 space-y-1">
              <h4 className="font-bold text-[#5C3A21]">💼 करियर व व्यापार</h4>
              <p className="text-[#3E2714] leading-relaxed">{live.career}</p>
            </div>
            <div className="p-3 rounded-xl bg-white border border-[#8C6239]/15 space-y-1">
              <h4 className="font-bold text-[#5C3A21]">💰 धन व आर्थिक स्थिति</h4>
              <p className="text-[#3E2714] leading-relaxed">{live.wealth}</p>
            </div>
            <div className="p-3 rounded-xl bg-white border border-[#8C6239]/15 space-y-1">
              <h4 className="font-bold text-[#5C3A21]">❤️ प्रेम व परिवार</h4>
              <p className="text-[#3E2714] leading-relaxed">{live.love}</p>
            </div>
            <div className="p-3 rounded-xl bg-white border border-[#8C6239]/15 space-y-1">
              <h4 className="font-bold text-[#5C3A21]">🩺 स्वास्थ्य रक्षा</h4>
              <p className="text-[#3E2714] leading-relaxed">{live.health}</p>
            </div>
          </div>

          {/* Remedy */}
          <div className="p-3.5 rounded-xl bg-[#FBF0DD] border border-[#B56A00]/30 space-y-1">
            <h4 className="font-bold text-[#5C3A21] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#B56A00]" />
              <span>आज का विशेष अचूक उपाय</span>
            </h4>
            <p className="text-[#735133] leading-relaxed">{live.remedy}</p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-[#8C6239]/20">
            <table className="w-full text-xs text-[#3E2714]">
              <thead className="bg-[#5C3A21] text-[#FAF2E4]">
                <tr>
                  <th className="text-left p-2">ग्रह</th>
                  <th className="text-left p-2">आज की राशि</th>
                  <th className="text-left p-2">आपकी राशि से भाव</th>
                </tr>
              </thead>
              <tbody>
                {live.rows.map((row) => (
                  <tr key={row.planet} className="border-t border-[#8C6239]/15 bg-white">
                    <td className="p-2 font-bold">{row.planet}{row.retrograde ? " वक्री" : ""}</td>
                    <td className="p-2">{row.rashi}</td>
                    <td className="p-2">{row.house}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
