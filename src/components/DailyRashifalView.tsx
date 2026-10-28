import React, { useState, useEffect } from 'react';
import {
  Sun,
  Share2,
  Sparkles,
  HeartHandshake,
  Volume2,
  VolumeX,
  ChevronLeft,
  ChevronRight,
  Compass,
  ShieldCheck,
  Briefcase,
  Coins,
  Flame,
} from 'lucide-react';
import { openWhatsAppShare } from '../services/umaConsultationPdf';
import { getStoredLocation } from '../services/storage';
import { buildDailyRashifal, RASHI_META, RashiMetaItem } from '../services/dailyRashifal';
import { speakUma, stopUmaSpeech } from '../lib/umaSpeech';
import { triggerHapticSelection } from '../utils/haptics';

interface DailyRashifalViewProps {
  personName?: string;
  lagnaRashi?: string;
  onOpenUmaModal?: (query?: string) => void;
  onPrevChapter?: () => void;
  onNextChapter?: () => void;
}

interface ElementTheme {
  badgeBg: string;
  badgeText: string;
  medallionGradient: string;
  medallionBorder: string;
  iconStroke: string;
  iconAccent: string;
  glowColor: string;
}

function getElementTheme(element: string): ElementTheme {
  if (element.includes('अग्नि')) {
    return {
      badgeBg: 'bg-red-900/15 border-red-800/35',
      badgeText: 'text-[#8B1E1E]',
      medallionGradient: 'from-[#7A1616] via-[#9E2418] to-[#540D0D]',
      medallionBorder: 'border-[#E6A145]',
      iconStroke: '#FFE599',
      iconAccent: '#FF9E44',
      glowColor: 'rgba(181, 106, 0, 0.35)',
    };
  }
  if (element.includes('पृथ्वी')) {
    return {
      badgeBg: 'bg-amber-900/15 border-amber-800/35',
      badgeText: 'text-[#6B421B]',
      medallionGradient: 'from-[#5C3A21] via-[#7A4E2D] to-[#3D2514]',
      medallionBorder: 'border-[#D99B3C]',
      iconStroke: '#FFF0B8',
      iconAccent: '#E2A03F',
      glowColor: 'rgba(140, 98, 57, 0.35)',
    };
  }
  if (element.includes('वायु')) {
    return {
      badgeBg: 'bg-emerald-900/15 border-emerald-800/35',
      badgeText: 'text-emerald-900',
      medallionGradient: 'from-[#1B4D3E] via-[#256B56] to-[#103329]',
      medallionBorder: 'border-[#D4AF37]',
      iconStroke: '#F9E79F',
      iconAccent: '#68D391',
      glowColor: 'rgba(27, 77, 62, 0.35)',
    };
  }
  // जल तत्व
  return {
    badgeBg: 'bg-sky-900/15 border-sky-800/35',
    badgeText: 'text-sky-950',
    medallionGradient: 'from-[#1E3A5F] via-[#2B5282] to-[#12243B]',
    medallionBorder: 'border-[#E2B857]',
    iconStroke: '#FFF3C4',
    iconAccent: '#76E4F7',
    glowColor: 'rgba(30, 58, 95, 0.35)',
  };
}

/**
 * Bespoke, high-precision Vedic SVG Iconography for all 12 Rashis (मेष से मीन)
 */
export const RashiSvgIcon: React.FC<{
  rashiId: string;
  size?: number;
  strokeColor?: string;
  accentColor?: string;
  className?: string;
}> = ({
  rashiId,
  size = 28,
  strokeColor = '#FFE599',
  accentColor = '#F59E0B',
  className = '',
}) => {
  const id = rashiId.toLowerCase();

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Subtle sacred outer halo ring */}
      <circle
        cx="32"
        cy="32"
        r="29"
        stroke={accentColor}
        strokeOpacity="0.32"
        strokeWidth="1.2"
        strokeDasharray="3 2"
      />

      {id === 'mesh' && (
        /* 1. मेष (Aries) — Royal Curled Ram Horns + Agni Tilak */
        <g>
          <path
            d="M32 50V26"
            stroke={strokeColor}
            strokeWidth="3.2"
            strokeLinecap="round"
          />
          <path
            d="M32 28C32 17 20 12 13 19C7 25 9 36 17 38C22 39 25 35 23 30C22 27 18 27 17 30"
            stroke={strokeColor}
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M32 28C32 17 44 12 51 19C57 25 55 36 47 38C42 39 39 35 41 30C42 27 46 27 47 30"
            stroke={strokeColor}
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M26 44L32 51L38 44"
            stroke={accentColor}
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="32" cy="14" r="3" fill={accentColor} />
        </g>
      )}

      {id === 'vrishabh' && (
        /* 2. वृषभ (Taurus) — Sacred Nandi Bull Crest + Crescent Horns */
        <g>
          <path
            d="M14 15C14 25 22 30 32 30C42 30 50 25 50 15"
            stroke={strokeColor}
            strokeWidth="3.4"
            strokeLinecap="round"
          />
          <path
            d="M19 28L23 45C25 50 28 52 32 52C36 52 39 50 41 45L45 28"
            stroke={strokeColor}
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <circle
            cx="32"
            cy="39"
            r="9.5"
            stroke={accentColor}
            strokeWidth="2.2"
          />
          <circle cx="28" cy="37" r="1.6" fill={strokeColor} />
          <circle cx="36" cy="37" r="1.6" fill={strokeColor} />
          <path
            d="M28 45C30 47 34 47 36 45"
            stroke={strokeColor}
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="32" cy="20" r="2.6" fill={accentColor} />
        </g>
      )}

      {id === 'mithun' && (
        /* 3. मिथुन (Gemini) — Twin Vedic Pillars + Veena/Gada Arch */
        <g>
          <path
            d="M16 17C24 21 40 21 48 17"
            stroke={strokeColor}
            strokeWidth="3.4"
            strokeLinecap="round"
          />
          <path
            d="M16 47C24 43 40 43 48 47"
            stroke={strokeColor}
            strokeWidth="3.4"
            strokeLinecap="round"
          />
          <path
            d="M25 20V44M39 20V44"
            stroke={strokeColor}
            strokeWidth="3.2"
            strokeLinecap="round"
          />
          <circle cx="25" cy="14" r="2.5" fill={accentColor} />
          <circle cx="39" cy="14" r="2.5" fill={accentColor} />
          <path
            d="M32 25L35 32L32 39L29 32L32 25Z"
            fill={accentColor}
            fillOpacity="0.85"
          />
        </g>
      )}

      {id === 'kark' && (
        /* 4. कर्क (Cancer) — Vedic Karkata (Crab) + Twin Lunar Spirals */
        <g>
          <ellipse
            cx="32"
            cy="35"
            rx="11"
            ry="8.5"
            stroke={strokeColor}
            strokeWidth="3"
          />
          {/* Raised Claws */}
          <path
            d="M23 29C17 25 16 17 22 14C25 13 27 16 25 19"
            stroke={strokeColor}
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M41 29C47 25 48 17 42 14C39 13 37 16 39 19"
            stroke={strokeColor}
            strokeWidth="3"
            strokeLinecap="round"
          />
          {/* Symmetrical Legs */}
          <path
            d="M21 34L13 32M21 38L13 40M23 41L16 47"
            stroke={accentColor}
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <path
            d="M43 34L51 32M43 38L51 40M41 41L48 47"
            stroke={accentColor}
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <circle cx="29" cy="33" r="1.6" fill={strokeColor} />
          <circle cx="35" cy="33" r="1.6" fill={strokeColor} />
        </g>
      )}

      {id === 'simh' && (
        /* 5. सिंह (Leo) — Kesari Lion Mane Crest + Solar Loop */
        <g>
          {/* Outer Solar Mane */}
          <path
            d="M32 11L36 16L42 13L43 19L49 19L47 25L52 29L48 34L51 40L45 42L44 48L38 47L32 52L26 47L20 48L19 42L13 40L16 34L12 29L17 25L15 19L21 19L22 13L28 16L32 11Z"
            stroke={accentColor}
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          {/* Traditional Leo Emblem inside */}
          <circle
            cx="26"
            cy="35"
            r="6.5"
            stroke={strokeColor}
            strokeWidth="3.2"
          />
          <path
            d="M31 31C33 21 43 21 44 31C45 39 39 44 45 47"
            stroke={strokeColor}
            strokeWidth="3.2"
            strokeLinecap="round"
          />
        </g>
      )}

      {id === 'kanya' && (
        /* 6. कन्या (Virgo) — Sacred Lotus & Grain Sheaf (धान्य मंजरी) */
        <g>
          {/* Central Lotus Blossom */}
          <path
            d="M32 16C27 23 26 32 32 40C38 32 37 23 32 16Z"
            stroke={strokeColor}
            strokeWidth="2.8"
            strokeLinejoin="round"
          />
          <path
            d="M32 40C23 38 17 31 18 23C24 25 28 31 32 40Z"
            stroke={strokeColor}
            strokeWidth="2.6"
            strokeLinejoin="round"
          />
          <path
            d="M32 40C41 38 47 31 46 23C40 25 36 31 32 40Z"
            stroke={strokeColor}
            strokeWidth="2.6"
            strokeLinejoin="round"
          />
          {/* Sacred Boat / Kalash Pedestal */}
          <path
            d="M16 44C23 50 41 50 48 44"
            stroke={accentColor}
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle cx="32" cy="12" r="2.2" fill={accentColor} />
        </g>
      )}

      {id === 'tula' && (
        /* 7. तुला (Libra) — Royal Dharma Tula (Balance Scales) */
        <g>
          {/* Central Pillar & Fulcrum */}
          <path
            d="M32 13V49M23 49H41"
            stroke={strokeColor}
            strokeWidth="3"
            strokeLinecap="round"
          />
          {/* Balance Beam */}
          <path
            d="M14 23H50"
            stroke={strokeColor}
            strokeWidth="3"
            strokeLinecap="round"
          />
          {/* Left Scale Pan */}
          <path
            d="M16 23L12 35H22L18 23"
            stroke={accentColor}
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
          <path
            d="M11 35C11 39 23 39 23 35"
            stroke={strokeColor}
            strokeWidth="2.6"
            strokeLinecap="round"
          />
          {/* Right Scale Pan */}
          <path
            d="M46 23L42 35H52L48 23"
            stroke={accentColor}
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
          <path
            d="M41 35C41 39 53 39 53 35"
            stroke={strokeColor}
            strokeWidth="2.6"
            strokeLinecap="round"
          />
          <circle cx="32" cy="19" r="3" fill={accentColor} />
        </g>
      )}

      {id === 'vrishchik' && (
        /* 8. वृश्चिक (Scorpio) — Vedic Vrishchik Crest + Raised Arrow Stinger */
        <g>
          <path
            d="M15 22V39C15 43 18 45 21 45C24 45 26 43 26 39V22"
            stroke={strokeColor}
            strokeWidth="3.2"
            strokeLinecap="round"
          />
          <path
            d="M26 25C26 21 29 20 32 22V39C32 43 35 45 38 45C41 45 44 43 44 38V30"
            stroke={strokeColor}
            strokeWidth="3.2"
            strokeLinecap="round"
          />
          {/* Raised Stinger Tail */}
          <path
            d="M44 38C44 45 51 44 51 35V18"
            stroke={accentColor}
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M46 23L51 16L56 23"
            stroke={strokeColor}
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      )}

      {id === 'dhanu' && (
        /* 9. धनु (Sagittarius) — Drawn Vedic Kodanda Bow & Aimed Arrow */
        <g>
          {/* Curved Bow */}
          <path
            d="M20 14C39 16 48 25 50 44"
            stroke={strokeColor}
            strokeWidth="3.4"
            strokeLinecap="round"
          />
          {/* Bowstring */}
          <path
            d="M20 14L16 32L50 44"
            stroke={accentColor}
            strokeWidth="2"
            strokeLinejoin="round"
          />
          {/* Arrow Shaft */}
          <path
            d="M15 49L49 15"
            stroke={strokeColor}
            strokeWidth="3.2"
            strokeLinecap="round"
          />
          {/* Arrowhead */}
          <path
            d="M39 15H49V25"
            stroke={strokeColor}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Feather Fletching */}
          <path
            d="M14 44L20 50"
            stroke={accentColor}
            strokeWidth="2.6"
            strokeLinecap="round"
          />
        </g>
      )}

      {id === 'makar' && (
        /* 10. मकर (Capricorn) — Sacred Makara Sea-Goat Crest + Spiraled Tail */
        <g>
          <path
            d="M15 20L24 44L32 25L39 42C41 47 47 49 50 44C53 39 49 33 44 35C40 37 41 44 47 47"
            stroke={strokeColor}
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M15 20C19 14 26 14 29 19"
            stroke={accentColor}
            strokeWidth="2.6"
            strokeLinecap="round"
          />
          <circle cx="32" cy="15" r="2.5" fill={accentColor} />
        </g>
      )}

      {id === 'kumbh' && (
        /* 11. कुंभ (Aquarius) — Sacred Purna Kumbha (Amrit Kalash) + Nectar Waves */
        <g>
          {/* Kalash Rim & Neck */}
          <path
            d="M23 19H41M26 19L24 25H40L38 19"
            stroke={strokeColor}
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Kalash Body */}
          <path
            d="M24 25C17 29 17 41 25 45H39C47 41 47 29 40 25"
            stroke={strokeColor}
            strokeWidth="3"
            strokeLinejoin="round"
          />
          {/* Sacred Coconut & Mango Leaves on top */}
          <circle cx="32" cy="14" r="3.2" fill={accentColor} />
          {/* Flowing Amrit Waves below */}
          <path
            d="M15 51C20 48 24 54 29 51C34 48 38 54 43 51C46 49 48 50 50 51"
            stroke={accentColor}
            strokeWidth="2.6"
            strokeLinecap="round"
          />
        </g>
      )}

      {id === 'meen' && (
        /* 12. मीन (Pisces) — Twin Golden Matsya (Fishes) in Sacred Mandala */
        <g>
          {/* Left Curved Fish */}
          <path
            d="M22 14C13 23 13 41 22 50"
            stroke={strokeColor}
            strokeWidth="3.6"
            strokeLinecap="round"
          />
          <path
            d="M18 17L25 14L23 21"
            stroke={accentColor}
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Right Curved Fish */}
          <path
            d="M42 14C51 23 51 41 42 50"
            stroke={strokeColor}
            strokeWidth="3.6"
            strokeLinecap="round"
          />
          <path
            d="M46 47L39 50L41 43"
            stroke={accentColor}
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Sacred Cord / Bandhan */}
          <path
            d="M14 32H50"
            stroke={strokeColor}
            strokeWidth="2.8"
            strokeLinecap="round"
          />
          <circle cx="32" cy="32" r="3.2" fill={accentColor} />
        </g>
      )}
    </svg>
  );
};

export const DailyRashifalView: React.FC<DailyRashifalViewProps> = ({
  lagnaRashi,
  onOpenUmaModal,
}) => {
  const [selectedRashiIdx, setSelectedRashiIdx] = useState<number>(() => {
    if (!lagnaRashi) return 0;
    const idx = RASHI_META.findIndex(
      (r) =>
        r.name === lagnaRashi.trim() ||
        r.id === lagnaRashi.trim().toLowerCase()
    );
    return idx >= 0 ? idx : 0;
  });

  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  useEffect(() => {
    if (!lagnaRashi) return;
    const idx = RASHI_META.findIndex(
      (r) =>
        r.name === lagnaRashi.trim() ||
        r.id === lagnaRashi.trim().toLowerCase()
    );
    if (idx >= 0) {
      setSelectedRashiIdx(idx);
    }
  }, [lagnaRashi]);

  useEffect(() => {
    stopUmaSpeech();
    setIsSpeaking(false);
  }, [selectedRashiIdx]);

  const location = getStoredLocation();
  const activeMeta: RashiMetaItem = RASHI_META[selectedRashiIdx] || RASHI_META[0];
  const elemTheme = getElementTheme(activeMeta.element);

  const live = buildDailyRashifal(
    activeMeta.id,
    new Date(),
    location.latitude,
    location.longitude
  );

  const handleSelectRashi = (idx: number) => {
    triggerHapticSelection();
    setSelectedRashiIdx(idx);
  };

  const handlePrevRashi = () => {
    triggerHapticSelection();
    setSelectedRashiIdx((prev) => (prev - 1 + RASHI_META.length) % RASHI_META.length);
  };

  const handleNextRashi = () => {
    triggerHapticSelection();
    setSelectedRashiIdx((prev) => (prev + 1) % RASHI_META.length);
  };

  const handleToggleVoice = async () => {
    triggerHapticSelection();
    if (isSpeaking) {
      stopUmaSpeech();
      setIsSpeaking(false);
      return;
    }
    const voiceScript = `${activeMeta.name} राशि का आज का दैनिक राशिफल। ${live.chandraBal}। ${live.general} कार्यक्षेत्र में: ${live.career} धन एवं लाभ: ${live.wealth} परिवार एवं प्रेम: ${live.love} आज का विशेष वैदिक उपाय: ${live.remedy}`;
    setIsSpeaking(true);
    try {
      await speakUma(voiceScript);
    } finally {
      setIsSpeaking(false);
    }
  };

  const handleShare = () => {
    triggerHapticSelection();
    const text =
      `🌸 *दैनिक राशिफल - ${activeMeta.name} राशि (${activeMeta.symbol})* 🌸\n` +
      `📅 ${live.dateLabel} | ${live.chandraBal}\n` +
      `🪐 ${live.rashiLordStatus}\n\n` +
      `✨ *गोचर फलादेश:* ${live.general}\n\n` +
      `💼 *कार्यक्षेत्र:* ${live.career}\n\n` +
      `💰 *धन व लाभ:* ${live.wealth}\n\n` +
      `❤️ *परिवार व प्रेम:* ${live.love}\n\n` +
      `🌿 *स्वास्थ्य:* ${live.health}\n\n` +
      `🎨 *शुभ रंग:* ${live.luckyColor} | 🔢 *शुभ अंक:* ${live.luckyNumber}\n` +
      `🪔 *अचूक उपाय:* ${live.remedy}\n\n` +
      `📖 *शक्ति पंचांग - वैदिक मार्गदर्शन*`;
    openWhatsAppShare(text);
  };

  return (
    <div className="bx-sheet flex-1 min-h-0 w-full h-full max-h-full flex flex-col overflow-y-auto overscroll-contain p-2.5 sm:p-3 space-y-2.5 pb-20">
      {/* 1. 12-Rashi Visual Iconography Grid (दैनिक राशिफल — १२ राशियाँ) */}
      <section
        className="bg-[#FAF2E4] border border-[#8C6239]/40 rounded-2xl p-2 sm:p-2.5 shadow-xs"
        aria-label="१२ राशियाँ चुनें"
      >
        <div className="flex items-center justify-between gap-2 mb-2 px-1">
          <div className="flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-[#8B1E1E]" />
            <span className="text-xs font-black text-[#5C3A21] tracking-wide">
              अपनी राशि चुनें (१२ राशियाँ)
            </span>
          </div>
          <span className="text-[10.5px] font-bold text-[#8C6239]">
            📅 {live.dateLabel}
          </span>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5">
          {RASHI_META.map((r, idx) => {
            const isSelected = idx === selectedRashiIdx;
            const rTheme = getElementTheme(r.element);
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => handleSelectRashi(idx)}
                aria-pressed={isSelected}
                className={`group relative rounded-xl p-1.5 flex flex-col items-center justify-center gap-1 border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-b from-[#6E1409] to-[#4A0E0E] text-[#FAF2E4] border-[#E6A145] shadow-md -translate-y-0.5'
                    : 'bg-[#F4E8D1]/90 hover:bg-[#EAD8B8] text-[#462B17] border-[#8C6239]/35'
                }`}
              >
                {/* 3D Mini Medallion with Custom SVG Rashi Icon */}
                <span
                  className={`w-9 h-9 rounded-xl flex items-center justify-center border bg-gradient-to-br ${rTheme.medallionGradient} ${rTheme.medallionBorder} shadow-xs transition-transform group-hover:scale-105`}
                >
                  <RashiSvgIcon
                    rashiId={r.id}
                    size={24}
                    strokeColor={rTheme.iconStroke}
                    accentColor={rTheme.iconAccent}
                  />
                </span>

                <div className="flex items-center gap-0.5 leading-none mt-0.5">
                  <span
                    className={`text-[11px] font-extrabold ${
                      isSelected ? 'text-[#FFE599]' : 'text-[#462B17]'
                    }`}
                  >
                    {r.name}
                  </span>
                </div>

                <span
                  className={`text-[9px] leading-none font-semibold ${
                    isSelected ? 'text-amber-200/90' : 'text-[#8C6239]'
                  }`}
                >
                  स्वामी: {r.lord}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 2. Selected Rashi Hero 3D Medallion Banner */}
      <section className="bx-verse relative overflow-hidden p-3 sm:p-3.5">
        <div className="flex items-center justify-between gap-2.5">
          {/* Left Prev Rashi Button */}
          <button
            type="button"
            onClick={handlePrevRashi}
            className="bx-iconbtn shrink-0 cursor-pointer"
            title="पिछली राशि"
            aria-label="पिछली राशि"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Center Hero Medallion & Title */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div
              style={{ boxShadow: `0 6px 16px ${elemTheme.glowColor}, inset 0 1px 1px rgba(255,255,255,0.45)` }}
              className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl shrink-0 flex items-center justify-center border-2 bg-gradient-to-br ${elemTheme.medallionGradient} ${elemTheme.medallionBorder}`}
            >
              <RashiSvgIcon
                rashiId={activeMeta.id}
                size={42}
                strokeColor={elemTheme.iconStroke}
                accentColor={elemTheme.iconAccent}
              />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <h2 className="font-granth font-black text-base sm:text-lg text-[#4A0E0E] leading-tight">
                  {activeMeta.name} राशिफल ({activeMeta.symbol})
                </h2>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-md border font-extrabold ${elemTheme.badgeBg} ${elemTheme.badgeText}`}
                >
                  {activeMeta.element} • {activeMeta.nature}
                </span>
              </div>

              <p className="text-[11px] font-bold text-[#6B421B] mt-0.5 truncate">
                🪐 {live.rashiLordStatus}
              </p>

              <div className="flex flex-wrap items-center gap-1.5 mt-1">
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-100/90 border border-amber-300 text-[#5C3A21] font-bold">
                  🌙 {live.chandraBal}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-100/80 border border-emerald-300 text-emerald-950 font-bold">
                  🎨 शुभ रंग: {live.luckyColor}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-purple-100/80 border border-purple-300 text-purple-950 font-bold">
                  🔢 शुभ अंक: {live.luckyNumber}
                </span>
              </div>
            </div>
          </div>

          {/* Right Next Rashi Button */}
          <button
            type="button"
            onClick={handleNextRashi}
            className="bx-iconbtn shrink-0 cursor-pointer"
            title="अगली राशि"
            aria-label="अगली राशि"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Action Strip: Voice Readout, Ask Uma, WhatsApp Share */}
        <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-2.5 border-t border-[#8C6239]/25">
          <div className="text-[10.5px] text-[#6B421B] font-semibold">
            चंद्र गोचर: <strong className="text-[#4A0E0E]">{live.moonTransit}</strong>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleToggleVoice}
              className="px-2.5 py-1 rounded-xl bg-[#5C3A21] text-[#FAF2E4] text-[11px] font-bold flex items-center gap-1 cursor-pointer"
            >
              {isSpeaking ? (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-amber-300" />
                  <span>रोकें</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-amber-300" />
                  <span>उमा के स्वर में सुनें</span>
                </>
              )}
            </button>

            {onOpenUmaModal && (
              <button
                type="button"
                onClick={() => {
                  triggerHapticSelection();
                  onOpenUmaModal(
                    `आज ${activeMeta.name} राशि के गोचर (${live.chandraBal}) और मेरे करियर व धन के लिए विशेष मार्गदर्शन दें।`
                  );
                }}
                className="px-2.5 py-1 rounded-xl bg-[#8B1E1E] text-[#FAF2E4] text-[11px] font-bold flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                <span>उमा से पूछें</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleShare}
              className="px-2.5 py-1 rounded-xl bg-emerald-800 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>शेयर</span>
            </button>
          </div>
        </div>
      </section>

      {/* 3. Detailed Gochar Predictions Grid */}
      <section className="space-y-2">
        {/* General Planetary Transit Forecast */}
        <div className="bx-fact bx-glass p-3 space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 font-extrabold text-xs text-[#4A0E0E]">
              <Sun className="w-4 h-4 text-[#B56A00] shrink-0" />
              <span>{activeMeta.name} राशि — आज का ग्रह गोचर फलादेश</span>
            </div>
            <span className="text-[10px] font-bold text-[#8C6239]">
              इष्ट: {activeMeta.ishtaDevta}
            </span>
          </div>
          <p className="text-xs text-[#3A2210] leading-relaxed font-medium">
            {live.general}
          </p>
        </div>

        {/* Career & Wealth 2-Column Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="bx-fact bx-glass p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-extrabold text-emerald-900">
              <Briefcase className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              <span>कार्यक्षेत्र एवं आजीविका (Career)</span>
            </div>
            <p className="text-[11.5px] text-[#3A2210] leading-snug font-medium">
              {live.career}
            </p>
          </div>

          <div className="bx-fact bx-glass p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-extrabold text-amber-900">
              <Coins className="w-3.5 h-3.5 text-amber-700 shrink-0" />
              <span>धन, व्यापार एवं लाभ (Wealth)</span>
            </div>
            <p className="text-[11.5px] text-[#3A2210] leading-snug font-medium">
              {live.wealth}
            </p>
          </div>
        </div>

        {/* Family/Love & Health 2-Column Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="bx-fact bx-glass p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-extrabold text-rose-900">
              <HeartHandshake className="w-3.5 h-3.5 text-rose-700 shrink-0" />
              <span>परिवार, दांपत्य एवं प्रेम (Family & Love)</span>
            </div>
            <p className="text-[11.5px] text-[#3A2210] leading-snug font-medium">
              {live.love}
            </p>
          </div>

          <div className="bx-fact bx-glass p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-extrabold text-sky-900">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-700 shrink-0" />
              <span>स्वास्थ्य एवं प्राण-ऊर्जा (Health)</span>
            </div>
            <p className="text-[11.5px] text-[#3A2210] leading-snug font-medium">
              {live.health}
            </p>
          </div>
        </div>

        {/* Rashi-Specific Vedic Upay Card */}
        <div className="bx-verse p-3 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#6E1409]">
            <Flame className="w-4 h-4 text-[#B56A00] shrink-0" />
            <span>{activeMeta.name} राशि विशेष अचूक वैदिक उपाय</span>
          </div>
          <p className="text-xs text-[#3A2210] leading-relaxed font-semibold">
            {live.remedy}
          </p>
        </div>

        {/* 9-Planet House Transit Summary Strip from Selected Rashi */}
        <div className="bx-fact bx-glass p-2.5">
          <div className="text-[10.5px] font-extrabold text-[#5C3A21] mb-1.5">
            🪐 आज {activeMeta.name} राशि से नवग्रहों की भाव स्थिति (Gochar Chakra):
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-9 gap-1">
            {live.rows.map((row) => (
              <div
                key={row.planet}
                className="px-1.5 py-1 rounded-lg bg-[#F4E8D1]/90 border border-[#8C6239]/30 text-center"
              >
                <div className="text-[10px] font-black text-[#4A0E0E]">
                  {row.planet} {row.retrograde ? '(व)' : ''}
                </div>
                <div className="text-[9.5px] font-bold text-[#6B421B]">
                  {row.house}वाँ भाव
                </div>
                <div className="text-[9px] text-[#8C6239] truncate">{row.rashi}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
