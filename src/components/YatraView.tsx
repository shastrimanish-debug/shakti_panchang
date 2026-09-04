import React, { useState } from 'react';
import { VedicPanchangData, SavedLocation } from '../types';
import { COMMON_INDIAN_CITIES, calculateYatraShool } from '../services/disha';
import { Compass, MapPin, Navigation, AlertTriangle, CheckCircle2, Sparkles } from 'lucide-react';

interface YatraViewProps {
  panchang: VedicPanchangData;
  currentLocation: SavedLocation;
}

export const YatraView: React.FC<YatraViewProps> = ({ panchang, currentLocation }) => {
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

  const result = calculateYatraShool(
    origin.name,
    origin.latitude,
    origin.longitude,
    destination.name,
    destination.latitude,
    destination.longitude,
    panchang.date
  );

  const formatTime = (d: Date) =>
    d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Route Selector */}
      <div className="bg-[#FAF2E4] border border-[#8C6239]/30 rounded-xl p-5 shadow-xs">
        <h3 className="text-base font-bold font-granth text-[#5C3A21] mb-4 flex items-center gap-2">
          <Compass className="w-5 h-5 text-[#B56A00]" />
          यात्रा मार्ग एवं दिशाशूल कैलकुलेटर
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#8C6239] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              प्रस्थान स्थल (Origin)
            </label>
            <select
              value={origin.name}
              onChange={(e) => {
                const found = COMMON_INDIAN_CITIES.find((c) => c.name === e.target.value);
                if (found) setOrigin(found);
              }}
              className="w-full bg-[#F4E8D1] border border-[#8C6239]/40 rounded-lg p-2.5 text-xs sm:text-sm font-semibold text-[#5C3A21] focus:ring-1 focus:ring-[#B56A00] outline-none"
            >
              {COMMON_INDIAN_CITIES.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name} ({c.state})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#8C6239] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-rose-600" />
              गंतव्य स्थल (Destination)
            </label>
            <select
              value={destination.name}
              onChange={(e) => {
                const found = COMMON_INDIAN_CITIES.find((c) => c.name === e.target.value);
                if (found) setDestination(found);
              }}
              className="w-full bg-[#F4E8D1] border border-[#8C6239]/40 rounded-lg p-2.5 text-xs sm:text-sm font-semibold text-[#5C3A21] focus:ring-1 focus:ring-[#B56A00] outline-none"
            >
              {COMMON_INDIAN_CITIES.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name} ({c.state})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Analysis Result Card */}
      <div className="bg-[#FAF2E4] border-2 border-[#8C6239]/40 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#8C6239]/20 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#5C3A21] text-white flex items-center justify-center font-bold">
              <Navigation className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#8C6239]">यात्रा दिशा</div>
              <div className="text-xl font-black font-granth text-[#5C3A21]">
                {result.direction} दिशा ({result.bearing.toFixed(0)}°)
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs font-bold text-[#8C6239]">अनुमानित दूरी</div>
            <div className="text-xl font-black text-[#5C3A21]">~{result.distanceKm} कि.मी.</div>
          </div>
        </div>

        {/* Shool Warning or Green State */}
        <div
          className={`p-4 rounded-xl border flex items-start gap-3.5 ${
            result.isDirectionBlocked
              ? 'bg-rose-50 border-rose-300 text-rose-900'
              : 'bg-emerald-50 border-emerald-300 text-emerald-900'
          }`}
        >
          <div className="mt-0.5">
            {result.isDirectionBlocked ? (
              <AlertTriangle className="w-5 h-5 text-rose-600" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            )}
          </div>
          <div className="space-y-1">
            <div className="text-sm font-bold">
              {result.isDirectionBlocked
                ? `दिशाशूल बाधा: आज ${panchang.weekday} को ${result.shoolDirection} दिशा में दिशाशूल है!`
                : `दिशा अनुकूल: आज ${result.direction} दिशा यात्रा के लिए अनुकूल है।`}
            </div>
            <p className="text-xs">{result.message}</p>
          </div>
        </div>

        {/* Traditional Remedy */}
        <div className="bg-[#F4E8D1] border border-[#8C6239]/30 rounded-xl p-4">
          <h4 className="text-xs font-bold text-[#5C3A21] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#B56A00]" />
            पारंपरिक दिशाशूल परिहार (Vedic Travel Remedy)
          </h4>
          <p className="text-xs sm:text-sm text-[#5C3A21] font-medium leading-relaxed">
            {result.remedy}
          </p>
        </div>

        {/* Safe Travel Windows (Choghadiya) */}
        <div className="bg-[#FAF2E4] border border-[#8C6239]/30 rounded-xl p-4">
          <h4 className="text-xs font-bold text-[#8C6239] uppercase tracking-wider mb-2">
            आज प्रस्थान हेतु शुभ चौघड़िया समय (Safe Travel Windows)
          </h4>
          {result.suitablePeriods.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {result.suitablePeriods.map((p, idx) => (
                <div
                  key={idx}
                  className="bg-[#F4E8D1] p-2.5 rounded-lg border border-[#8C6239]/20 flex justify-between items-center text-xs"
                >
                  <span className="font-bold text-[#5C3A21]">
                    {p.hindiName} ({p.name})
                  </span>
                  <span className="font-black text-[#B56A00]">
                    {formatTime(p.start)} - {formatTime(p.end)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#735133] italic">आज उपयुक्त समय सीमा सीमित है।</p>
          )}
        </div>
      </div>
    </div>
  );
};
