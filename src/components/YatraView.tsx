import React, { useEffect, useState } from 'react';
import { VedicPanchangData, SavedLocation } from '../types';
import { COMMON_INDIAN_CITIES, calculateYatraShool } from '../services/disha';
import { LocationModal } from './LocationModal';
import { Compass, MapPin, Navigation, AlertTriangle, CheckCircle2, Sparkles } from 'lucide-react';

interface YatraViewProps {
  panchang: VedicPanchangData;
  currentLocation: SavedLocation;
}

const QUICK_DESTINATIONS = [
  'वाराणसी',
  'अयोध्या',
  'हरिद्वार',
  'तिरुपति',
  'द्वारका',
  'पुरी',
  'शिरडी',
  'रामेश्वरम',
];

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
  const [picker, setPicker] = useState<'origin' | 'destination' | null>(null);

  useEffect(() => {
    setOrigin(currentLocation);
  }, [currentLocation]);

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

  const placeButton = (
    label: string,
    loc: SavedLocation,
    which: 'origin' | 'destination',
    pinClass: string
  ) => (
    <div>
      <label className="block text-xs font-bold text-[#8C6239] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
        <MapPin className={`w-3.5 h-3.5 ${pinClass}`} />
        {label}
      </label>
      <button
        type="button"
        onClick={() => setPicker(which)}
        className="w-full min-h-12 bg-[#F4E8D1] border border-[#8C6239]/40 rounded-lg px-3 py-2.5 text-left hover:bg-[#EBD8BD] transition-colors"
      >
        <span className="block text-sm font-semibold text-[#5C3A21] leading-snug">
          {loc.name}
        </span>
        <span className="block text-[11px] text-[#8C6239] mt-0.5">
          {loc.state || loc.country || 'भारत'} • खोजें / बदलें
        </span>
      </button>
    </div>
  );

  return (
    <div className="space-y-3 sm:space-y-6 animate-in fade-in duration-300">
      <LocationModal
        isOpen={picker !== null}
        onClose={() => setPicker(null)}
        currentLocation={picker === 'destination' ? destination : origin}
        persistGlobal={false}
        title={picker === 'destination' ? 'गंतव्य शहर / गाँव / तीर्थ चुनें' : 'प्रस्थान शहर / गाँव चुनें'}
        onSelectLocation={(loc) => {
          if (picker === 'destination') setDestination(loc);
          else setOrigin(loc);
        }}
      />

      <div className="bg-[#FAF2E4] border border-[#8C6239]/30 rounded-xl p-3 sm:p-5 shadow-xs">
        <h3 className="text-sm sm:text-base font-bold font-granth text-[#5C3A21] mb-3 flex items-center gap-2">
          <Compass className="w-5 h-5 text-[#B56A00]" />
          यात्रा मार्ग एवं दिशाशूल कैलकुलेटर
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {placeButton('प्रस्थान स्थल (Origin)', origin, 'origin', 'text-emerald-600')}
          {placeButton('गंतव्य स्थल (Destination)', destination, 'destination', 'text-rose-600')}
        </div>
        <div className="mt-3">
          <p className="text-[11px] font-bold text-[#8C6239] mb-1.5">तीर्थ त्वरित चयन</p>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_DESTINATIONS.map((key) => {
              const city = COMMON_INDIAN_CITIES.find((c) => c.name.includes(key));
              if (!city) return null;
              const active = destination.name === city.name;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setDestination(city)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                    active
                      ? 'bg-[#5C3A21] text-[#FAF2E4] border-[#5C3A21]'
                      : 'bg-[#F4E8D1] text-[#5C3A21] border-[#8C6239]/30'
                  }`}
                >
                  {key}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-[#FAF2E4] border-2 border-[#8C6239]/40 rounded-xl p-3 sm:p-5 shadow-sm space-y-3 sm:space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#8C6239]/20 pb-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-[#5C3A21] text-white flex items-center justify-center font-bold shrink-0">
              <Navigation className="w-5 h-5 text-amber-400" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-[#8C6239]">यात्रा दिशा</div>
              <div className="text-lg sm:text-xl font-black font-granth text-[#5C3A21]">
                {result.direction} दिशा ({result.bearing.toFixed(0)}°)
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs font-bold text-[#8C6239]">अनुमानित दूरी</div>
            <div className="text-lg sm:text-xl font-black text-[#5C3A21]">~{result.distanceKm} कि.मी.</div>
          </div>
        </div>

        <div
          className={`p-3 sm:p-4 rounded-xl border flex items-start gap-3 ${
            result.isDirectionBlocked
              ? 'bg-rose-50 border-rose-300 text-rose-900'
              : 'bg-emerald-50 border-emerald-300 text-emerald-900'
          }`}
        >
          <div className="mt-0.5 shrink-0">
            {result.isDirectionBlocked ? (
              <AlertTriangle className="w-5 h-5 text-rose-600" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            )}
          </div>
          <div className="space-y-1 min-w-0">
            <div className="text-sm font-bold leading-snug">
              {result.isDirectionBlocked
                ? `दिशाशूल बाधा: आज ${panchang.weekday} को ${result.shoolDirection} दिशा में दिशाशूल है!`
                : `दिशा अनुकूल: आज ${result.direction} दिशा यात्रा के लिए अनुकूल है।`}
            </div>
            <p className="text-xs leading-relaxed">{result.message}</p>
          </div>
        </div>

        <div className="bg-[#F4E8D1] border border-[#8C6239]/30 rounded-xl p-3 sm:p-4">
          <h4 className="text-xs font-bold text-[#5C3A21] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#B56A00]" />
            पारंपरिक दिशाशूल परिहार
          </h4>
          <p className="text-xs sm:text-sm text-[#5C3A21] font-medium leading-relaxed">
            {result.remedy}
          </p>
        </div>

        <div className="bg-[#FAF2E4] border border-[#8C6239]/30 rounded-xl p-3 sm:p-4">
          <h4 className="text-xs font-bold text-[#8C6239] uppercase tracking-wider mb-2">
            आज प्रस्थान हेतु शुभ चौघड़िया समय
          </h4>
          {result.suitablePeriods.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {result.suitablePeriods.map((p, idx) => (
                <div
                  key={idx}
                  className="bg-[#F4E8D1] p-2.5 rounded-lg border border-[#8C6239]/20 flex justify-between items-center gap-2 text-xs"
                >
                  <span className="font-bold text-[#5C3A21]">
                    {p.hindiName} ({p.name})
                  </span>
                  <span className="font-black text-[#B56A00] shrink-0">
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

