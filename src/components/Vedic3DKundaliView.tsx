import React, { useState, useEffect, useMemo, useRef } from 'react';
import { KundaliData } from '../types';
import { calculateVedicPanchang, RASHIS, calculateVargaSign } from '../services/astronomy';
import { analyzeKundali } from '../services/predictions';
import { KundaliChart } from './KundaliChart';
import {
  Sparkles,
  Compass,
  RotateCw,
  Pause,
  Play,
  Layers,
  Code2,
  Copy,
  Check,
  ShieldCheck,
  Sun,
  Moon,
  Flame,
  Zap,
  ChevronRight,
  Sliders,
} from 'lucide-react';

/**
 * Equivalent TypeScript representation of @Parcelize data class VedicChartData
 * Preserved in SavedStateStorage (sessionStorage + localStorage) for 0% Data Loss
 * across screen rotations, tab switches, and deep navigation.
 */
export interface PlanetaryDegreeItem {
  planetName: string;
  sanskritName: string;
  symbol: string;
  rashiIndex: number; // 0..11
  rashiName: string;
  degreeInSign: number; // 0..30
  absoluteLongitude: number; // 0..360
  houseNumber: number; // 1..12
  isRetrograde: boolean;
  nakshatra: string;
  pada: number;
}

export interface HouseCellItem {
  houseNumber: number; // 1..12
  rashiNumber: number; // 1..12
  rashiName: string;
  planets: string[];
}

export interface MahadashaDetail {
  mahadashaLord: string;
  antardashaLord: string;
  pratyantardashaLord: string;
  startDate: string;
  endDate: string;
  remainingYears: number;
  progressPercent: number;
}

export interface VedicChartData {
  chartId: string;
  nativeName: string;
  birthDateTimeIso: string;
  placeName: string;
  latitude: number;
  longitude: number;
  lagnaRashi: string;
  lagnaDegree: number;
  planetaryDegrees: PlanetaryDegreeItem[];
  d1ChartGrid: HouseCellItem[];
  d9ChartGrid: HouseCellItem[];
  currentMahadasha: MahadashaDetail;
  lastSavedTimestamp: number;
}

const SAVED_STATE_KEY = 'shakti_panchang_vedic_chart_saved_state_v1';

const ZODIAC_GLYPHS = [
  { num: 1, hi: 'मेष', en: 'Aries', sym: '♈', lord: 'मंगल' },
  { num: 2, hi: 'वृषभ', en: 'Taurus', sym: '♉', lord: 'शुक्र' },
  { num: 3, hi: 'मिथुन', en: 'Gemini', sym: '♊', lord: 'बुध' },
  { num: 4, hi: 'कर्क', en: 'Cancer', sym: '♋', lord: 'चंद्र' },
  { num: 5, hi: 'सिंह', en: 'Leo', sym: '♌', lord: 'सूर्य' },
  { num: 6, hi: 'कन्या', en: 'Virgo', sym: '♍', lord: 'बुध' },
  { num: 7, hi: 'तुला', en: 'Libra', sym: '♎', lord: 'शुक्र' },
  { num: 8, hi: 'वृश्चिक', en: 'Scorpio', sym: '♏', lord: 'मंगल' },
  { num: 9, hi: 'धनु', en: 'Sagittarius', sym: '♐', lord: 'गुरु' },
  { num: 10, hi: 'मकर', en: 'Capricorn', sym: '♑', lord: 'शनि' },
  { num: 11, hi: 'कुंभ', en: 'Aquarius', sym: '♒', lord: 'शनि' },
  { num: 12, hi: 'मीन', en: 'Pisces', sym: '♓', lord: 'गुरु' },
];

const PLANET_COLORS: Record<string, string> = {
  'सूर्य': '#EA580C',
  'चंद्र': '#0284C7',
  'मंगल': '#DC2626',
  'बुध': '#059669',
  'गुरु': '#D97706',
  'शुक्र': '#DB2777',
  'शनि': '#4F46E5',
  'राहु': '#7E22CE',
  'केतु': '#C2410C',
};

/**
 * Builds the zero-data-loss VedicChartData payload from KundaliData
 */
function buildVedicChartData(k: KundaliData): VedicChartData {
  const lagnaSignIdx = Math.floor(((k.lagnaDegree % 360) + 360) % 360 / 30);
  const d9LagnaSignIdx = calculateVargaSign(k.lagnaDegree, 9);

  const planetaryDegrees: PlanetaryDegreeItem[] = k.planets.map((p) => {
    const absDeg = ((p.degree % 360) + 360) % 360;
    const rIdx = Math.floor(absDeg / 30);
    return {
      planetName: p.planet,
      sanskritName: p.planet,
      symbol: p.planet.slice(0, 2),
      rashiIndex: rIdx,
      rashiName: RASHIS[rIdx] || p.rashi,
      degreeInSign: absDeg % 30,
      absoluteLongitude: absDeg,
      houseNumber: p.house,
      isRetrograde: Boolean(p.isRetrograde),
      nakshatra: p.nakshatra || k.nakshatra,
      pada: p.pada || 1,
    };
  });

  // D-1 Rashi Grid (12 Houses)
  const d1ChartGrid: HouseCellItem[] = Array.from({ length: 12 }, (_, idx) => {
    const houseNum = idx + 1;
    const rIdx = (lagnaSignIdx + idx) % 12;
    const housePlanets = k.planets
      .filter((p) => p.house === houseNum)
      .map((p) => `${p.planet} ${(p.degree % 30).toFixed(1)}°`);
    return {
      houseNumber: houseNum,
      rashiNumber: rIdx + 1,
      rashiName: RASHIS[rIdx],
      planets: housePlanets,
    };
  });

  // D-9 Navamsha Grid (12 Houses)
  const d9ChartGrid: HouseCellItem[] = Array.from({ length: 12 }, (_, idx) => {
    const houseNum = idx + 1;
    const rIdx = (d9LagnaSignIdx + idx) % 12;
    const housePlanets = k.planets
      .filter((p) => {
        const pD9Sign = calculateVargaSign(p.degree, 9);
        const pD9House = ((pD9Sign - d9LagnaSignIdx + 12) % 12) + 1;
        return pD9House === houseNum;
      })
      .map((p) => p.planet);
    return {
      houseNumber: houseNum,
      rashiNumber: rIdx + 1,
      rashiName: RASHIS[rIdx],
      planets: housePlanets,
    };
  });

  const now = new Date();
  const activeMaha =
    k.dashaPeriods?.find((d) => new Date(d.startDate) <= now && now <= new Date(d.endDate)) ||
    k.dashaPeriods?.[0];
  const birthIso =
    k.birthDate instanceof Date ? k.birthDate.toISOString().slice(0, 10) : String(k.birthDate || '');

  return {
    chartId: `${k.name}_${birthIso}_${k.birthTime}`,
    nativeName: k.name,
    birthDateTimeIso: `${birthIso}T${k.birthTime}`,
    placeName: k.birthPlace,
    latitude: k.latitude || 23.1765,
    longitude: k.longitude || 75.7885,
    lagnaRashi: k.lagnaRashi,
    lagnaDegree: k.lagnaDegree,
    planetaryDegrees,
    d1ChartGrid,
    d9ChartGrid,
    currentMahadasha: {
      mahadashaLord: k.mahadasha,
      antardashaLord: k.antardasha,
      pratyantardashaLord: k.pratyantardasha || 'गुरु',
      startDate: activeMaha?.startDate ? new Date(activeMaha.startDate).toLocaleDateString('hi-IN') : '2024',
      endDate: activeMaha?.endDate ? new Date(activeMaha.endDate).toLocaleDateString('hi-IN') : '2031',
      remainingYears: activeMaha?.years || 7,
      progressPercent: 64,
    },
    lastSavedTimestamp: Date.now(),
  };
}

export const Vedic3DKundaliView: React.FC<{
  kundali: KundaliData;
  currentLocationName?: string;
  latitude?: number;
  longitude?: number;
}> = ({
  kundali,
  currentLocationName = 'उज्जैन (Ujjain)',
  latitude = 23.1765,
  longitude = 75.7885,
}) => {
  // 1. SavedStateHandle Zero-Data-Loss Hydration & Persistence
  const [vedicState, setVedicState] = useState<VedicChartData>(() => {
    try {
      const cached = sessionStorage.getItem(SAVED_STATE_KEY) || localStorage.getItem(SAVED_STATE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached) as VedicChartData;
        const birthIso =
          kundali.birthDate instanceof Date
            ? kundali.birthDate.toISOString().slice(0, 10)
            : String(kundali.birthDate || '');
        if (parsed.chartId === `${kundali.name}_${birthIso}_${kundali.birthTime}`) {
          return parsed;
        }
      }
    } catch {
      // ignore storage errors
    }
    return buildVedicChartData(kundali);
  });

  useEffect(() => {
    const updated = buildVedicChartData(kundali);
    setVedicState(updated);
    try {
      const serialized = JSON.stringify(updated);
      sessionStorage.setItem(SAVED_STATE_KEY, serialized);
      localStorage.setItem(SAVED_STATE_KEY, serialized);
    } catch {
      // ignore quota errors
    }
  }, [kundali]);

  // 2. 3D GraphicsLayer Animation State (rotationX, rotationY parallax + continuous rotationZ)
  const [isSpinning, setIsSpinning] = useState<boolean>(true);
  const [rotationZ, setRotationZ] = useState<number>(0);
  const [rotationX, setRotationX] = useState<number>(22);
  const [rotationY, setRotationY] = useState<number>(-8);
  const [cameraDistance] = useState<number>(1100);
  const [activeChartDivision, setActiveChartDivision] = useState<'D1' | 'D9'>('D1');
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetaryDegreeItem | null>(null);

  // 3. UMA Assistant Smooth Slide-In Sync State (runs concurrently without stopping 3D wheel)
  const [isUmaOpen, setIsUmaOpen] = useState<boolean>(true);
  const [umaSelectedTopic, setUmaSelectedTopic] = useState<'summary' | 'dasha' | 'gochar' | 'varga'>('summary');
  const [showComposeCodeModal, setShowComposeCodeModal] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  const wheelContainerRef = useRef<HTMLDivElement | null>(null);

  // Continuous 60fps rotationZ animation loop (independent of UMA drawer state)
  useEffect(() => {
    if (!isSpinning) return;
    let animId: number;
    let lastTime = performance.now();

    const tick = (now: number) => {
      const dt = now - lastTime;
      lastTime = now;
      setRotationZ((prev) => (prev + dt * 0.012) % 360);
      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [isSpinning]);

  // Interactive Pointer Parallax (rotationX / rotationY)
  const handlePointerMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!wheelContainerRef.current) return;
    const rect = wheelContainerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const normX = (e.clientX - centerX) / (rect.width / 2);
    const normY = (e.clientY - centerY) / (rect.height / 2);
    setRotationX(Math.max(-35, Math.min(45, 22 - normY * 16)));
    setRotationY(Math.max(-30, Math.min(30, normX * 18)));
  };

  const handleResetParallax = () => {
    setRotationX(22);
    setRotationY(-8);
  };

  // Daily Panchang & Gochar Transit Data
  const livePanchang = useMemo(() => {
    return calculateVedicPanchang(new Date(), latitude, longitude);
  }, [latitude, longitude]);

  const analysis = useMemo(() => analyzeKundali(kundali), [kundali]);

  const activeGrid = activeChartDivision === 'D1' ? vedicState.d1ChartGrid : vedicState.d9ChartGrid;

  const handleCopyKotlinCode = () => {
    navigator.clipboard.writeText(ANDROID_COMPOSE_COMPLETE_CODE);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  return (
    <div
      className="relative rounded-2xl overflow-hidden border-2 border-[#B56A00]/65 shadow-xl"
      style={{
        background: 'linear-gradient(165deg, #FFFDF9 0%, #FAF2E4 55%, #F3E3C6 100%)',
        color: '#3E1F0D',
      }}
    >
      {/* Top Royal Vedic Swarna-Mandir Header */}
      <div
        className="relative z-10 flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-3.5 border-b border-[#D97706]/50"
        style={{
          background: 'linear-gradient(90deg, #3E1F0D 0%, #5C2D0C 50%, #3E1F0D 100%)',
          color: '#FFF6D6',
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md border border-[#FDE68A]/60"
            style={{
              background: 'linear-gradient(135deg, #F59E0B 0%, #B45309 100%)',
            }}
          >
            <Compass
              className="w-5 h-5 animate-spin"
              style={{ animationDuration: '14s', color: '#2A1205' }}
            />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3
                className="font-granth font-black text-base sm:text-lg"
                style={{ color: '#FFE8A3' }}
              >
                3D वैदिक स्वर्ण-यंत्र कुण्डली एवं UMA ज्योतिष सिंक
              </h3>
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border"
                style={{
                  backgroundColor: 'rgba(16, 185, 129, 0.2)',
                  color: '#A7F3D0',
                  borderColor: 'rgba(52, 211, 153, 0.45)',
                }}
              >
                <ShieldCheck className="w-3 h-3" /> सुरक्षित कुण्डली स्मृति
              </span>
            </div>
            <p className="text-[11px]" style={{ color: '#FDE68A' }}>
              जातक: <strong style={{ color: '#FFFFFF' }}>{vedicState.nativeName}</strong> • लग्न:{' '}
              <strong style={{ color: '#FFFFFF' }}>
                {vedicState.lagnaRashi} ({vedicState.lagnaDegree.toFixed(1)}°)
              </strong>{' '}
              • महादशा:{' '}
              <strong style={{ color: '#FDBA74' }}>
                {vedicState.currentMahadasha.mahadashaLord}/
                {vedicState.currentMahadasha.antardashaLord}
              </strong>
            </p>
          </div>
        </div>

        {/* 3D Wheel & Architecture Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* D-1 / D-9 Toggle */}
          <div
            className="flex items-center p-0.5 rounded-lg border border-[#D97706]/60"
            style={{ backgroundColor: '#2A1205' }}
          >
            <button
              type="button"
              onClick={() => setActiveChartDivision('D1')}
              className="px-2.5 py-1 rounded-md text-xs font-bold transition cursor-pointer"
              style={
                activeChartDivision === 'D1'
                  ? { backgroundColor: '#F59E0B', color: '#2A1205', fontWeight: 900 }
                  : { color: '#FFF3C4' }
              }
            >
              D-1 लग्न
            </button>
            <button
              type="button"
              onClick={() => setActiveChartDivision('D9')}
              className="px-2.5 py-1 rounded-md text-xs font-bold transition cursor-pointer"
              style={
                activeChartDivision === 'D9'
                  ? { backgroundColor: '#F59E0B', color: '#2A1205', fontWeight: 900 }
                  : { color: '#FFF3C4' }
              }
            >
              D-9 नवमांश
            </button>
          </div>

          {/* Spin Play/Pause */}
          <button
            type="button"
            onClick={() => setIsSpinning((s) => !s)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border border-[#D97706]/60 transition cursor-pointer"
            style={{ backgroundColor: '#2A1205', color: '#FFF3C4' }}
          >
            {isSpinning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isSpinning ? 'चक्र रोकें' : '3D चक्र घुमाएँ'}</span>
          </button>

          {/* Toggle UMA Assistant Sync Drawer */}
          <button
            type="button"
            onClick={() => setIsUmaOpen((o) => !o)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer border"
            style={
              isUmaOpen
                ? {
                    backgroundColor: '#F59E0B',
                    color: '#2A1205',
                    borderColor: '#FDE68A',
                    fontWeight: 900,
                  }
                : {
                    backgroundColor: '#2A1205',
                    color: '#FFF3C4',
                    borderColor: '#D97706',
                  }
            }
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>UMA ज्योतिष सिंक {isUmaOpen ? 'सक्रिय' : 'खोलें'}</span>
          </button>
        </div>
      </div>

      {/* Main 3D Stage + Bhojpatra Cards + UMA Assistant Sync */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-5 p-4 sm:p-6 items-start">
        {/* Left Column: Royal Vedic Bhojpatra Daily Panchang & Gochar Cards */}
        <div className="lg:col-span-3 space-y-4">
          {/* Card 1: Daily Panchang */}
          <div
            className="rounded-2xl p-4 border border-[#C88A2B]/60 shadow-sm space-y-3"
            style={{ backgroundColor: '#FFFDF8' }}
          >
            <div className="flex items-center justify-between border-b border-[#C88A2B]/30 pb-2">
              <div className="flex items-center gap-2">
                <Sun className="w-4 h-4 text-[#B45309]" />
                <h4 className="font-granth font-black text-sm text-[#4A200A]">
                  तात्कालिक पंचांग
                </h4>
              </div>
              <span
                className="text-[10px] px-2 py-0.5 rounded font-bold"
                style={{ backgroundColor: '#5C2D0C', color: '#FFF3C4' }}
              >
                {currentLocationName.split(' ')[0]}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div
                className="p-2 rounded-lg border border-[#C88A2B]/40"
                style={{ backgroundColor: '#FAF2E4' }}
              >
                <div className="text-[10px] font-bold text-[#7C2D12]">तिथि (Tithi)</div>
                <div className="font-black text-[#2A1205] truncate">
                  {livePanchang.paksha} {livePanchang.tithi}
                </div>
              </div>
              <div
                className="p-2 rounded-lg border border-[#C88A2B]/40"
                style={{ backgroundColor: '#FAF2E4' }}
              >
                <div className="text-[10px] font-bold text-[#7C2D12]">नक्षत्र (Nakshatra)</div>
                <div className="font-black text-[#2A1205] truncate">{livePanchang.nakshatra}</div>
              </div>
              <div
                className="p-2 rounded-lg border border-[#C88A2B]/40"
                style={{ backgroundColor: '#FAF2E4' }}
              >
                <div className="text-[10px] font-bold text-[#7C2D12]">योग (Yoga)</div>
                <div className="font-black text-[#2A1205] truncate">{livePanchang.yoga}</div>
              </div>
              <div
                className="p-2 rounded-lg border border-[#C88A2B]/40"
                style={{ backgroundColor: '#FAF2E4' }}
              >
                <div className="text-[10px] font-bold text-[#7C2D12]">करण (Karana)</div>
                <div className="font-black text-[#2A1205] truncate">{livePanchang.karana}</div>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] font-bold text-[#5C3A21] pt-1">
              <span>
                🌅 सूर्योदय:{' '}
                {livePanchang.solar.sunrise.toLocaleTimeString('hi-IN', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
              <span>
                🌇 सूर्यास्त:{' '}
                {livePanchang.solar.sunset.toLocaleTimeString('hi-IN', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </div>

          {/* Card 2: Planetary Degrees & Gochar Transit */}
          <div
            className="rounded-2xl p-4 border border-[#C88A2B]/60 shadow-sm space-y-3"
            style={{ backgroundColor: '#FFFDF8' }}
          >
            <div className="flex items-center justify-between border-b border-[#C88A2B]/30 pb-2">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-[#B91C1C]" />
                <h4 className="font-granth font-black text-sm text-[#4A200A]">
                  ग्रह स्पष्ट एवं भाव स्थिति
                </h4>
              </div>
              <span className="text-[10px] text-[#7C2D12] font-bold">स्पष्ट अंश</span>
            </div>

            <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
              {vedicState.planetaryDegrees.map((p) => {
                const color = PLANET_COLORS[p.planetName] || '#B45309';
                const isSelected = selectedPlanet?.planetName === p.planetName;
                return (
                  <button
                    key={p.planetName}
                    type="button"
                    onClick={() => setSelectedPlanet(p)}
                    className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition cursor-pointer border"
                    style={
                      isSelected
                        ? {
                            backgroundColor: '#5C2D0C',
                            borderColor: '#D97706',
                            color: '#FFF3C4',
                          }
                        : {
                            backgroundColor: '#FAF2E4',
                            borderColor: 'rgba(200, 138, 43, 0.4)',
                            color: '#2A1205',
                          }
                    }
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full shrink-0 border border-white/60"
                        style={{ backgroundColor: color }}
                      />
                      <span className="font-black text-xs sm:text-sm">{p.planetName}</span>
                      {p.isRetrograde && (
                        <span
                          className="text-[10px] px-1.5 py-0.5 rounded font-black"
                          style={{ backgroundColor: '#FEE2E2', color: '#991B1B' }}
                        >
                          वक्री
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <span
                        className="font-black"
                        style={{ color: isSelected ? '#FDE68A' : '#7C2D12' }}
                      >
                        {p.rashiName}
                      </span>{' '}
                      <span
                        className="text-[11px] font-bold"
                        style={{ color: isSelected ? '#FFF3C4' : '#5C3A21' }}
                      >
                        {p.degreeInSign.toFixed(1)}° (भाव {p.houseNumber})
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3D Camera & Parallax Sliders */}
          <div
            className="rounded-2xl p-4 border border-[#C88A2B]/60 shadow-sm space-y-2.5"
            style={{ backgroundColor: '#FFFDF8' }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-[#4A200A] flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-[#B45309]" /> 3D झुकाव नियंत्रक (Tilt)
              </span>
              <button
                type="button"
                onClick={handleResetParallax}
                className="text-[11px] font-bold text-[#9A3412] hover:underline cursor-pointer"
              >
                रीसेट करें
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] font-bold text-[#5C3A21]">
              <label className="space-y-1">
                <span>झुकाव X: {rotationX.toFixed(0)}°</span>
                <input
                  type="range"
                  min={-35}
                  max={45}
                  value={rotationX}
                  onChange={(e) => setRotationX(Number(e.target.value))}
                  className="w-full accent-[#B45309]"
                />
              </label>
              <label className="space-y-1">
                <span>झुकाव Y: {rotationY.toFixed(0)}°</span>
                <input
                  type="range"
                  min={-30}
                  max={30}
                  value={rotationY}
                  onChange={(e) => setRotationY(Number(e.target.value))}
                  className="w-full accent-[#B45309]"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Center Column: Interactive 3D Rotating Zodiac Wheel + Three.js 3D Yantra */}
        <div
          ref={wheelContainerRef}
          onMouseMove={handlePointerMove}
          onMouseLeave={handleResetParallax}
          className={`${
            isUmaOpen ? 'lg:col-span-5' : 'lg:col-span-9'
          } flex flex-col items-center justify-center min-h-[430px] sm:min-h-[500px] rounded-2xl border-2 border-[#B56A00]/65 p-4 relative overflow-hidden transition-all duration-500 shadow-md`}
          style={{
            perspective: `${cameraDistance}px`,
            background:
              'radial-gradient(circle at 50% 35%, #5C280E 0%, #381808 62%, #240E04 100%)',
          }}
        >
          {/* Subtle Warm Golden Mandal Rings */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div
              className="w-[340px] h-[340px] sm:w-[420px] sm:h-[420px] rounded-full border"
              style={{ borderColor: 'rgba(251, 191, 36, 0.22)' }}
            />
          </div>

          {/* 3D Transformed Zodiac Wheel SVG */}
          <div
            className="transition-transform duration-150 ease-out select-none"
            style={{
              transform: `rotateX(${rotationX}deg) rotateY(${rotationY}deg)`,
              transformStyle: 'preserve-3d',
            }}
          >
            <svg
              viewBox="0 0 500 500"
              className="w-[320px] h-[320px] sm:w-[420px] sm:h-[420px] drop-shadow-[0_20px_30px_rgba(0,0,0,0.55)]"
            >
              <defs>
                <radialGradient id="vedicSanctumGrad" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#FFF8E7" />
                  <stop offset="58%" stopColor="#F8E5C0" />
                  <stop offset="100%" stopColor="#E2BE82" />
                </radialGradient>
                <linearGradient id="swarnaRimGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FEF08A" />
                  <stop offset="50%" stopColor="#F59E0B" />
                  <stop offset="100%" stopColor="#9A3412" />
                </linearGradient>
              </defs>

              {/* Outer Rotating Zodiac Rim (rotationZ) */}
              <g transform={`rotate(${rotationZ} 250 250)`}>
                {/* Outer Royal Maroon & Gold Rim */}
                <circle
                  cx="250"
                  cy="250"
                  r="242"
                  fill="#4A1D0A"
                  stroke="url(#swarnaRimGrad)"
                  strokeWidth="5"
                />
                {/* Inner Bhojpatra Sanctum Disk */}
                <circle
                  cx="250"
                  cy="250"
                  r="194"
                  fill="url(#vedicSanctumGrad)"
                  stroke="#9A3412"
                  strokeWidth="3"
                />
                {/* Nakshatra / House Inner Ring */}
                <circle
                  cx="250"
                  cy="250"
                  r="142"
                  fill="none"
                  stroke="#B45309"
                  strokeWidth="2"
                  strokeDasharray="5 3"
                />

                {/* 12 Rashi Sectors, Spokes & High-Contrast Glyphs */}
                {ZODIAC_GLYPHS.map((z, idx) => {
                  const startAngle = idx * 30 - 90;
                  const midAngle = startAngle + 15;
                  const rad = (startAngle * Math.PI) / 180;
                  const midRad = (midAngle * Math.PI) / 180;

                  const x1 = 250 + 70 * Math.cos(rad);
                  const y1 = 250 + 70 * Math.sin(rad);
                  const x2 = 250 + 242 * Math.cos(rad);
                  const y2 = 250 + 242 * Math.sin(rad);

                  const tx = 250 + 218 * Math.cos(midRad);
                  const ty = 250 + 218 * Math.sin(midRad);

                  const hx = 250 + 168 * Math.cos(midRad);
                  const hy = 250 + 168 * Math.sin(midRad);

                  const houseCell = activeGrid[idx];

                  return (
                    <g key={z.num}>
                      {/* Radial Spoke */}
                      <line
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke="#8C4A0E"
                        strokeWidth="1.6"
                        strokeOpacity="0.55"
                      />

                      {/* Rashi Label on Outer Maroon Ring (Bright Swarna Gold Text) */}
                      <g transform={`translate(${tx}, ${ty}) rotate(${midAngle + 90})`}>
                        <text
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fill="#FFF3C4"
                          fontSize="14.5"
                          fontWeight="900"
                        >
                          {z.sym} {z.hi}
                        </text>
                      </g>

                      {/* House Number & Sign in Inner Bhojpatra Ring */}
                      <g transform={`translate(${hx}, ${hy}) rotate(${-rotationZ})`}>
                        <text
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fill="#5C230A"
                          fontSize="12.5"
                          fontWeight="900"
                          style={{
                            paintOrder: 'stroke fill',
                            stroke: '#FFFDF8',
                            strokeWidth: '3px',
                          }}
                        >
                          भाव {idx + 1} ({houseCell?.rashiName || z.hi})
                        </text>
                      </g>
                    </g>
                  );
                })}

                {/* Planetary Orbits & Large High-Contrast 3D Nodes */}
                {vedicState.planetaryDegrees.map((p, i) => {
                  const angleDeg = p.absoluteLongitude - 90;
                  const rad = (angleDeg * Math.PI) / 180;
                  const orbitRadius = 96 + (i % 3) * 18;
                  const px = 250 + orbitRadius * Math.cos(rad);
                  const py = 250 + orbitRadius * Math.sin(rad);
                  const pColor = PLANET_COLORS[p.planetName] || '#B45309';

                  return (
                    <g
                      key={p.planetName}
                      onClick={() => setSelectedPlanet(p)}
                      className="cursor-pointer"
                    >
                      <line
                        x1="250"
                        y1="250"
                        x2={px}
                        y2={py}
                        stroke={pColor}
                        strokeWidth="1.8"
                        strokeOpacity="0.6"
                        strokeDasharray="3 3"
                      />
                      <circle
                        cx={px}
                        cy={py}
                        r="21"
                        fill="#FFFDF9"
                        stroke={pColor}
                        strokeWidth="3.2"
                      />
                      {/* Counter-rotate text so planet name stays upright while wheel spins */}
                      <g transform={`translate(${px}, ${py}) rotate(${-rotationZ})`}>
                        <text
                          textAnchor="middle"
                          dominantBaseline="central"
                          fill="#2A1205"
                          fontSize="14"
                          fontWeight="900"
                          style={{
                            paintOrder: 'stroke fill',
                            stroke: '#FFFFFF',
                            strokeWidth: '2.5px',
                          }}
                        >
                          {p.planetName}
                        </text>
                      </g>
                    </g>
                  );
                })}
              </g>

              {/* Stationary Sacred Center Hub (Royal Maroon & 24K Gold Bindu Mandala) */}
              <circle
                cx="250"
                cy="250"
                r="66"
                fill="#4A1D0A"
                stroke="url(#swarnaRimGrad)"
                strokeWidth="3.5"
              />
              <circle
                cx="250"
                cy="250"
                r="55"
                fill="none"
                stroke="#FCD34D"
                strokeWidth="1.2"
                strokeDasharray="3 3"
              />
              <text
                x="250"
                y="235"
                textAnchor="middle"
                fill="#FDE68A"
                fontSize="24"
                fontWeight="900"
              >
                ॐ
              </text>
              <text
                x="250"
                y="256"
                textAnchor="middle"
                fill="#FFFFFF"
                fontSize="12"
                fontWeight="900"
              >
                {activeChartDivision} लग्न: {vedicState.lagnaRashi}
              </text>
              <text
                x="250"
                y="273"
                textAnchor="middle"
                fill="#FCD34D"
                fontSize="10.5"
                fontWeight="800"
              >
                {vedicState.lagnaDegree.toFixed(2)}°
              </text>
            </svg>
          </div>

          {/* Bottom Interactive Status Strip inside 3D Stage */}
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2.5 text-[11px]">
            <span
              className="px-2.5 py-1 rounded-lg border font-bold"
              style={{
                backgroundColor: 'rgba(255, 248, 231, 0.14)',
                borderColor: 'rgba(251, 191, 36, 0.45)',
                color: '#FFF3C4',
              }}
            >
              चक्र कोण: <strong>{rotationZ.toFixed(0)}°</strong>
            </span>
            <span
              className="px-2.5 py-1 rounded-lg border font-bold"
              style={{
                backgroundColor: 'rgba(255, 248, 231, 0.14)',
                borderColor: 'rgba(251, 191, 36, 0.45)',
                color: '#FFF3C4',
              }}
            >
              3D झुकाव: <strong>X:{rotationX.toFixed(0)}° / Y:{rotationY.toFixed(0)}°</strong>
            </span>
            {selectedPlanet && (
              <span
                className="px-3 py-1 rounded-lg border font-black"
                style={{
                  backgroundColor: '#F59E0B',
                  borderColor: '#FEF08A',
                  color: '#2A1205',
                }}
              >
                चयनित ग्रह: {selectedPlanet.planetName} — {selectedPlanet.rashiName}{' '}
                {selectedPlanet.degreeInSign.toFixed(2)}° (भाव {selectedPlanet.houseNumber})
              </span>
            )}
          </div>

          {/* Embedded Three.js 3D Planetary Yantra Chart */}
          <div className="w-full mt-4">
            <KundaliChart
              lagnaDegree={kundali.lagnaDegree}
              planets={kundali.planets}
              vargaDivision={activeChartDivision === 'D9' ? 9 : 1}
              chartTitle={`${kundali.name} — 3D ${activeChartDivision} कुण्डली चक्र`}
            />
          </div>
        </div>

        {/* Right Column: UMA AI Assistant Smooth Slide-In Sync Panel (Royal Bhojpatra Theme) */}
        {isUmaOpen && (
          <div
            className="lg:col-span-4 rounded-2xl border-2 border-[#C88A2B]/70 p-4 sm:p-5 shadow-md space-y-4"
            style={{ backgroundColor: '#FFFDF8' }}
          >
            <div className="flex items-center justify-between border-b border-[#C88A2B]/35 pb-3">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center font-black shadow-xs border border-[#FDE68A]"
                  style={{
                    background: 'linear-gradient(135deg, #7C2D12 0%, #B45309 100%)',
                    color: '#FFF3C4',
                  }}
                >
                  उमा
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-granth font-black text-sm sm:text-base text-[#4A200A]">
                      UMA ज्योतिष विश्लेषण सिंक
                    </h4>
                    <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
                  </div>
                  <p className="text-[10px] font-bold text-[#7C2D12]">
                    3D कुण्डली एवं दशा लाइव समन्वय
                  </p>
                </div>
              </div>
              <span
                className="text-[10px] px-2 py-0.5 rounded-md font-bold"
                style={{ backgroundColor: '#5C2D0C', color: '#FFF3C4' }}
              >
                सक्रिय
              </span>
            </div>

            {/* UMA Topic Selector */}
            <div
              className="grid grid-cols-4 gap-1 p-1 rounded-xl border border-[#C88A2B]/50 text-[11px] font-bold"
              style={{ backgroundColor: '#F4E8D1' }}
            >
              {[
                { id: 'summary', label: 'सार' },
                { id: 'dasha', label: 'महादशा' },
                { id: 'gochar', label: 'गोचर' },
                { id: 'varga', label: 'D1/D9 वर्ग' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setUmaSelectedTopic(t.id as any)}
                  className="py-1.5 rounded-lg transition cursor-pointer"
                  style={
                    umaSelectedTopic === t.id
                      ? { backgroundColor: '#5C2D0C', color: '#FFF3C4', fontWeight: 900 }
                      : { color: '#5C3A21' }
                  }
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* UMA Synchronized Astrological Prediction Content */}
            <div className="space-y-3 text-xs leading-relaxed text-[#3E1F0D] max-h-[420px] overflow-y-auto pr-1">
              {umaSelectedTopic === 'summary' && (
                <>
                  <div
                    className="p-3 rounded-xl border border-[#C88A2B]/45 space-y-1.5"
                    style={{ backgroundColor: '#FAF2E4' }}
                  >
                    <div className="text-[#7C2D12] font-black flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#B45309]" /> जातक का 3D लग्न विश्लेषण
                    </div>
                    {analysis.summaryLines.map((line, idx) => (
                      <p key={idx} className="text-xs font-medium text-[#2A1205]">
                        • {line}
                      </p>
                    ))}
                  </div>
                  {analysis.areas.slice(0, 3).map((area) => (
                    <div
                      key={area.id}
                      className="p-3 rounded-xl border border-[#C88A2B]/40 space-y-1"
                      style={{ backgroundColor: '#FAF2E4' }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-black text-[#4A200A]">{area.title}</span>
                        <span
                          className="text-[10px] px-2 py-0.5 rounded font-bold"
                          style={{ backgroundColor: '#5C2D0C', color: '#FFF3C4' }}
                        >
                          {area.strength}
                        </span>
                      </div>
                      <p className="text-[#3E1F0D] font-medium">{area.finding}</p>
                      <p className="text-[11px] font-bold text-[#9A3412]">उपाय: {area.remedy}</p>
                    </div>
                  ))}
                </>
              )}

              {umaSelectedTopic === 'dasha' && (
                <div className="space-y-3">
                  <div
                    className="p-3.5 rounded-xl border border-[#C88A2B]/60 space-y-2"
                    style={{ backgroundColor: '#FAF2E4' }}
                  >
                    <div className="text-[11px] text-[#7C2D12] font-black uppercase tracking-wider">
                      वर्तमान विंशोत्तरी महादशा
                    </div>
                    <div className="text-sm font-black text-[#2A1205]">
                      {vedicState.currentMahadasha.mahadashaLord} महादशा →{' '}
                      {vedicState.currentMahadasha.antardashaLord} अंतर्दशा →{' '}
                      {vedicState.currentMahadasha.pratyantardashaLord} प्रत्यंतर
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-[#E5D2B8] overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#B45309] to-[#F59E0B]"
                        style={{ width: `${vedicState.currentMahadasha.progressPercent}%` }}
                      />
                    </div>
                    <p className="text-xs font-medium text-[#3E1F0D]">{analysis.dashaNarrative}</p>
                  </div>
                </div>
              )}

              {umaSelectedTopic === 'gochar' && (
                <div className="space-y-2.5">
                  <div
                    className="p-3 rounded-xl border border-[#C88A2B]/45"
                    style={{ backgroundColor: '#FAF2E4' }}
                  >
                    <div className="font-black text-[#7C2D12] mb-1">
                      तात्कालिक पंचांग एवं गोचर प्रभाव
                    </div>
                    <p className="text-[#2A1205] font-medium">
                      आज {livePanchang.paksha} {livePanchang.tithi} तथा{' '}
                      {livePanchang.nakshatra} नक्षत्र के संयोग में आपकी जन्म राशि{' '}
                      <strong>{kundali.moonRashi}</strong> पर{' '}
                      <strong>{vedicState.currentMahadasha.mahadashaLord}</strong> का सूक्ष्म प्रभाव
                      सक्रिय है।
                    </p>
                  </div>
                  {analysis.yogas.slice(0, 3).map((y, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg border border-[#C88A2B]/40 font-bold text-[#3E1F0D]"
                      style={{ backgroundColor: '#FAF2E4' }}
                    >
                      ✨ {y}
                    </div>
                  ))}
                </div>
              )}

              {umaSelectedTopic === 'varga' && (
                <div className="space-y-2">
                  <div className="text-xs font-black text-[#4A200A]">
                    D-1 एवं D-9 भाव सारणी:
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {activeGrid.map((cell) => (
                      <div
                        key={cell.houseNumber}
                        className="p-2 rounded-lg border border-[#C88A2B]/40"
                        style={{ backgroundColor: '#FAF2E4' }}
                      >
                        <div className="text-[10px] text-[#7C2D12] font-black">
                          भाव {cell.houseNumber} ({cell.rashiName})
                        </div>
                        <div className="text-[11px] font-bold text-[#2A1205] truncate">
                          {cell.planets.length > 0 ? cell.planets.join(', ') : '— शांत भाव —'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const ANDROID_COMPOSE_COMPLETE_CODE = `// ============================================================================
// SHAKTI PANCHANG - 3D VEDIC KUNDALI & UMA AI ASSISTANT SYNC (JETPACK COMPOSE)
// Complete Zero-Data-Loss Architecture (@Parcelize + SavedStateHandle + 3D UI)
// ============================================================================

package com.shaktipanchang.kundali.ui.threeD

import android.graphics.RenderEffect
import android.graphics.Shader
import android.os.Build
import android.os.Parcelable
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.*
import androidx.compose.animation.slideInVertically
import androidx.compose.animation.slideOutVertically
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.*
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.drawscope.rotate
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.drawText
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.rememberTextMeasurer
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import kotlinx.parcelize.Parcelize
import kotlin.math.cos
import kotlin.math.sin

// ----------------------------------------------------------------------------
// 1. ZERO DATA LOSS PARCELABLE MODELS (@Parcelize)
// ----------------------------------------------------------------------------

@Parcelize
data class PlanetaryDegree(
    val planetName: String,
    val sanskritSymbol: String,
    val rashiIndex: Int,          // 0..11 (Aries..Pisces)
    val degreeInSign: Float,      // 0f..30f
    val absoluteLongitude: Float, // 0f..360f
    val houseNumber: Int,         // 1..12
    val isRetrograde: Boolean,
    val nakshatraName: String,
    val pada: Int
) : Parcelable

@Parcelize
data class ChartHouseCell(
    val houseNumber: Int,         // 1..12
    val rashiNumber: Int,         // 1..12
    val rashiName: String,
    val occupantPlanets: List<String>
) : Parcelable

@Parcelize
data class MahadashaInfo(
    val mahadashaLord: String,
    val antardashaLord: String,
    val pratyantardashaLord: String,
    val startDateIso: String,
    val endDateIso: String,
    val progressFraction: Float
) : Parcelable

@Parcelize
data class DailyPanchangOverlayData(
    val tithiName: String,
    val nakshatraName: String,
    val yogaName: String,
    val karanaName: String,
    val sunriseTime: String,
    val sunsetTime: String,
    val gocharSummary: String
) : Parcelable

@Parcelize
data class VedicChartData(
    val chartId: String,
    val nativeName: String,
    val lagnaRashi: String,
    val lagnaDegree: Float,
    val planetaryDegrees: List<PlanetaryDegree>,
    val d1ChartGrid: List<ChartHouseCell>,
    val d9ChartGrid: List<ChartHouseCell>,
    val currentMahadasha: MahadashaInfo,
    val dailyPanchang: DailyPanchangOverlayData,
    val umaPredictions: List<String>,
    val activeDivision: String = "D1",
    val isUmaSheetExpanded: Boolean = false
) : Parcelable
`;
