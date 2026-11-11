import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Sun,
  Share2,
  Sparkles,
  HeartHandshake,
  Volume2,
  VolumeX,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Briefcase,
  Coins,
  Flame,
  X,
  Download,
  CheckCircle2,
  Loader2,
  Menu,
  ArrowUpDown,
  Layers,
  Sparkle,
  Compass,
} from 'lucide-react';
import { openWhatsAppShare } from '../services/umaConsultationPdf';
import { getStoredLocation } from '../services/storage';
import { buildDailyRashifal, RASHI_META, RashiMetaItem, DailyRashifal } from '../services/dailyRashifal';
import { generateHdRashifalCardDataUrl } from '../services/rashifalHdCard';
import { saveImageNative } from '../lib/device';
import { shareImageFile } from '../lib/shareHelper';
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
  const id = (rashiId || 'mesh').toLowerCase();

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
        <g>
          <path d="M32 50V26" stroke={strokeColor} strokeWidth="3.2" strokeLinecap="round" />
          <path d="M32 28C32 17 20 12 13 19C7 25 9 36 17 38C22 39 25 35 23 30C22 27 18 27 17 30" stroke={strokeColor} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M32 28C32 17 44 12 51 19C57 25 55 36 47 38C42 39 39 35 41 30C42 27 46 27 47 30" stroke={strokeColor} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M26 44L32 51L38 44" stroke={accentColor} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="32" cy="14" r="3" fill={accentColor} />
        </g>
      )}

      {id === 'vrishabh' && (
        <g>
          <path d="M14 15C14 25 22 30 32 30C42 30 50 25 50 15" stroke={strokeColor} strokeWidth="3.4" strokeLinecap="round" />
          <path d="M19 28L23 45C25 50 28 52 32 52C36 52 39 50 41 45L45 28" stroke={strokeColor} strokeWidth="3" strokeLinejoin="round" />
          <circle cx="32" cy="39" r="9.5" stroke={accentColor} strokeWidth="2.2" />
          <circle cx="28" cy="37" r="1.6" fill={strokeColor} />
          <circle cx="36" cy="37" r="1.6" fill={strokeColor} />
          <path d="M28 45C30 47 34 47 36 45" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" />
          <circle cx="32" cy="20" r="2.6" fill={accentColor} />
        </g>
      )}

      {id === 'mithun' && (
        <g>
          <path d="M16 17C24 21 40 21 48 17" stroke={strokeColor} strokeWidth="3.4" strokeLinecap="round" />
          <path d="M16 47C24 43 40 43 48 47" stroke={strokeColor} strokeWidth="3.4" strokeLinecap="round" />
          <path d="M25 20V44M39 20V44" stroke={strokeColor} strokeWidth="3.2" strokeLinecap="round" />
          <circle cx="25" cy="14" r="2.5" fill={accentColor} />
          <circle cx="39" cy="14" r="2.5" fill={accentColor} />
          <path d="M32 25L35 32L32 39L29 32L32 25Z" fill={accentColor} fillOpacity="0.85" />
        </g>
      )}

      {id === 'kark' && (
        <g>
          <ellipse cx="32" cy="35" rx="11" ry="8.5" stroke={strokeColor} strokeWidth="3" />
          <path d="M23 29C17 25 16 17 22 14C25 13 27 16 25 19" stroke={strokeColor} strokeWidth="3" strokeLinecap="round" />
          <path d="M41 29C47 25 48 17 42 14C39 13 37 16 39 19" stroke={strokeColor} strokeWidth="3" strokeLinecap="round" />
          <path d="M21 34L13 32M21 38L13 40M23 41L16 47" stroke={accentColor} strokeWidth="2.4" strokeLinecap="round" />
          <path d="M43 34L51 32M43 38L51 40M41 41L48 47" stroke={accentColor} strokeWidth="2.4" strokeLinecap="round" />
          <circle cx="29" cy="33" r="1.6" fill={strokeColor} />
          <circle cx="35" cy="33" r="1.6" fill={strokeColor} />
        </g>
      )}

      {id === 'simh' && (
        <g>
          <path d="M32 11L36 16L42 13L43 19L49 19L47 25L52 29L48 34L51 40L45 42L44 48L38 47L32 52L26 47L20 48L19 42L13 40L16 34L12 29L17 25L15 19L21 19L22 13L28 16L32 11Z" stroke={accentColor} strokeWidth="1.8" strokeLinejoin="round" />
          <circle cx="26" cy="35" r="6.5" stroke={strokeColor} strokeWidth="3.2" />
          <path d="M31 31C33 21 43 21 44 31C45 39 39 44 45 47" stroke={strokeColor} strokeWidth="3.2" strokeLinecap="round" />
        </g>
      )}

      {id === 'kanya' && (
        <g>
          <path d="M32 16C27 23 26 32 32 40C38 32 37 23 32 16Z" stroke={strokeColor} strokeWidth="2.8" strokeLinejoin="round" />
          <path d="M32 40C23 38 17 31 18 23C24 25 28 31 32 40Z" stroke={strokeColor} strokeWidth="2.6" strokeLinejoin="round" />
          <path d="M32 40C41 38 47 31 46 23C40 25 36 31 32 40Z" stroke={strokeColor} strokeWidth="2.6" strokeLinejoin="round" />
          <path d="M16 44C23 50 41 50 48 44" stroke={accentColor} strokeWidth="3" strokeLinecap="round" />
          <circle cx="32" cy="12" r="2.2" fill={accentColor} />
        </g>
      )}

      {id === 'tula' && (
        <g>
          <path d="M32 13V49M23 49H41" stroke={strokeColor} strokeWidth="3" strokeLinecap="round" />
          <path d="M14 23H50" stroke={strokeColor} strokeWidth="3" strokeLinecap="round" />
          <path d="M16 23L12 35H22L18 23" stroke={accentColor} strokeWidth="2.2" strokeLinejoin="round" />
          <path d="M11 35C11 39 23 39 23 35" stroke={strokeColor} strokeWidth="2.6" strokeLinecap="round" />
          <path d="M46 23L42 35H52L48 23" stroke={accentColor} strokeWidth="2.2" strokeLinejoin="round" />
          <path d="M41 35C41 39 53 39 53 35" stroke={strokeColor} strokeWidth="2.6" strokeLinecap="round" />
          <circle cx="32" cy="19" r="3" fill={accentColor} />
        </g>
      )}

      {id === 'vrishchik' && (
        <g>
          <path d="M15 22V39C15 43 18 45 21 45C24 45 26 43 26 39V22" stroke={strokeColor} strokeWidth="3.2" strokeLinecap="round" />
          <path d="M26 25C26 21 29 20 32 22V39C32 43 35 45 38 45C41 45 44 43 44 38V30" stroke={strokeColor} strokeWidth="3.2" strokeLinecap="round" />
          <path d="M44 38C44 45 51 44 51 35V18" stroke={accentColor} strokeWidth="3" strokeLinecap="round" />
          <path d="M46 23L51 16L56 23" stroke={strokeColor} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      )}

      {id === 'dhanu' && (
        <g>
          <path d="M20 14C39 16 48 25 50 44" stroke={strokeColor} strokeWidth="3.4" strokeLinecap="round" />
          <path d="M20 14L16 32L50 44" stroke={accentColor} strokeWidth="2" strokeLinejoin="round" />
          <path d="M15 49L49 15" stroke={strokeColor} strokeWidth="3.2" strokeLinecap="round" />
          <path d="M39 15H49V25" stroke={strokeColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M14 44L20 50" stroke={accentColor} strokeWidth="2.6" strokeLinecap="round" />
        </g>
      )}

      {id === 'makar' && (
        <g>
          <path d="M15 20L24 44L32 25L39 42C41 47 47 49 50 44C53 39 49 33 44 35C40 37 41 44 47 47" stroke={strokeColor} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M15 20C19 14 26 14 29 19" stroke={accentColor} strokeWidth="2.6" strokeLinecap="round" />
          <circle cx="32" cy="15" r="2.5" fill={accentColor} />
        </g>
      )}

      {id === 'kumbh' && (
        <g>
          <path d="M23 19H41M26 19L24 25H40L38 19" stroke={strokeColor} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M24 25C17 29 17 41 25 45H39C47 41 47 29 40 25" stroke={strokeColor} strokeWidth="3" strokeLinejoin="round" />
          <circle cx="32" cy="14" r="3.2" fill={accentColor} />
          <path d="M15 51C20 48 24 54 29 51C34 48 38 54 43 51C46 49 48 50 50 51" stroke={accentColor} strokeWidth="2.6" strokeLinecap="round" />
        </g>
      )}

      {id === 'meen' && (
        <g>
          <path d="M22 14C13 23 13 41 22 50" stroke={strokeColor} strokeWidth="3.6" strokeLinecap="round" />
          <path d="M18 17L25 14L23 21" stroke={accentColor} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M42 14C51 23 51 41 42 50" stroke={strokeColor} strokeWidth="3.6" strokeLinecap="round" />
          <path d="M46 47L39 50L41 43" stroke={accentColor} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M14 32H50" stroke={strokeColor} strokeWidth="2.8" strokeLinecap="round" />
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

  // 'Sort by Rashi' / Dynamic Grouping Mode Toggle State
  const [isGroupedByRashi, setIsGroupedByRashi] = useState<boolean>(false);
  const [groupSortFilter, setGroupSortFilter] = useState<'zodiac' | 'element' | 'chandraBal'>('zodiac');

  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isSavingHd, setIsSavingHd] = useState<boolean>(false);
  const [isSharingHd, setIsSharingHd] = useState<boolean>(false);
  const [hdNotice, setHdNotice] = useState<string | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

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

  // Compute all 12 Rashis dynamically for the 'Sort by Rashi' grouped view
  const allRashifalData = useMemo(() => {
    return RASHI_META.map((meta, index) => {
      const data = buildDailyRashifal(
        meta.id,
        new Date(),
        location.latitude,
        location.longitude
      );
      return {
        meta,
        index,
        data,
      };
    });
  }, [location.latitude, location.longitude]);

  // Dynamic sorting and grouping of Rashi items
  const sortedGroupedRashis = useMemo(() => {
    const list = [...allRashifalData];
    if (groupSortFilter === 'zodiac') {
      return list; // 1 to 12 Mesh to Meen
    }
    if (groupSortFilter === 'element') {
      const elementOrder: Record<string, number> = {
        'अग्नि तत्व': 0,
        'पृथ्वी तत्व': 1,
        'वायु तत्व': 2,
        'जल तत्व': 3,
      };
      return list.sort((a, b) => {
        const ea = elementOrder[a.meta.element] ?? 4;
        const eb = elementOrder[b.meta.element] ?? 4;
        if (ea !== eb) return ea - eb;
        return a.index - b.index;
      });
    }
    if (groupSortFilter === 'chandraBal') {
      // Sort by Chandra Bal (Best / Shubh moon transit first)
      const balRank = (bal: string) => {
        if (bal.includes('श्रेष्ठ') || bal.includes('अति शुभ')) return 1;
        if (bal.includes('लाभकारी') || bal.includes('कार्यसिद्धि') || bal.includes('विजयकारी')) return 2;
        if (bal.includes('शुभ')) return 3;
        if (bal.includes('धर्म-कर्म') || bal.includes('विचारशील') || bal.includes('मध्यम')) return 4;
        return 5;
      };
      return list.sort((a, b) => balRank(a.data.chandraBal) - balRank(b.data.chandraBal));
    }
    return list;
  }, [allRashifalData, groupSortFilter]);

  const handleSelectRashi = (idx: number) => {
    triggerHapticSelection();
    setSelectedRashiIdx(idx);
    setIsSidebarOpen(false);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevRashi = () => {
    triggerHapticSelection();
    setSelectedRashiIdx((prev) => (prev - 1 + RASHI_META.length) % RASHI_META.length);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNextRashi = () => {
    triggerHapticSelection();
    setSelectedRashiIdx((prev) => (prev + 1) % RASHI_META.length);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Close sidebar on scroll so user has full focus on reading
  const handleScroll = () => {
    if (isSidebarOpen) {
      setIsSidebarOpen(false);
    }
  };

  const handleToggleVoice = async (customScript?: string) => {
    triggerHapticSelection();
    if (isSpeaking) {
      stopUmaSpeech();
      setIsSpeaking(false);
      return;
    }
    const voiceScript =
      customScript ||
      `${activeMeta.name} राशि का आज का दैनिक राशिफल। ${live.chandraBal}। ${live.general} कार्यक्षेत्र में: ${live.career} धन एवं लाभ: ${live.wealth} परिवार एवं प्रेम: ${live.love} आज का विशेष वैदिक उपाय: ${live.remedy}`;
    setIsSpeaking(true);
    try {
      await speakUma(voiceScript);
    } finally {
      setIsSpeaking(false);
    }
  };

  const handleTextShare = (meta = activeMeta, data = live) => {
    triggerHapticSelection();
    const text =
      `🌸 *दैनिक राशिफल - ${meta.name} राशि (${meta.symbol})* 🌸\n` +
      `📅 ${data.dateLabel} | ${data.chandraBal}\n` +
      `🪐 ${data.rashiLordStatus}\n\n` +
      `✨ *गोचर फलादेश:* ${data.general}\n\n` +
      `💼 *कार्यक्षेत्र:* ${data.career}\n\n` +
      `💰 *धन व लाभ:* ${data.wealth}\n\n` +
      `❤️ *परिवार व प्रेम:* ${data.love}\n\n` +
      `🌿 *स्वास्थ्य:* ${data.health}\n\n` +
      `🎨 *शुभ रंग:* ${data.luckyColor} | 🔢 *शुभ अंक:* ${data.luckyNumber}\n` +
      `🪔 *अचूक उपाय:* ${data.remedy}\n\n` +
      `📖 *शक्ति पंचांग - वैदिक मार्गदर्शन*`;
    openWhatsAppShare(text);
  };

  const handleSaveHd = async (meta = activeMeta, data = live) => {
    triggerHapticSelection();
    if (isSavingHd) return;
    setIsSavingHd(true);
    setHdNotice(null);

    try {
      const dataUri = await generateHdRashifalCardDataUrl(meta, data, location.name);
      const fileName = `shakti-rashifal-${meta.id}-${new Date().toISOString().slice(0, 10)}.png`;

      const savedNative = await saveImageNative(dataUri, fileName);
      if (!savedNative) {
        // Web fallback download
        const res = await fetch(dataUri);
        const blob = await res.blob();
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          if (document.body.contains(a)) document.body.removeChild(a);
          URL.revokeObjectURL(blobUrl);
        }, 1500);
      }

      setHdNotice(`✓ ${meta.name} राशि का Full HD कार्ड सेव हो गया!`);
      setTimeout(() => setHdNotice(null), 4000);
    } catch {
      setHdNotice('HD कार्ड सेव करने में त्रुटि हुई, पुनः प्रयास करें।');
    } finally {
      setIsSavingHd(false);
    }
  };

  const handleShareHd = async (meta = activeMeta, data = live) => {
    triggerHapticSelection();
    if (isSharingHd) return;
    setIsSharingHd(true);
    setHdNotice(null);

    try {
      const dataUri = await generateHdRashifalCardDataUrl(meta, data, location.name);
      const fileName = `shakti-rashifal-${meta.id}-${new Date().toISOString().slice(0, 10)}.png`;
      const shareCaption = [
        `🌸 *दैनिक राशिफल - ${meta.name} राशि (${meta.symbol})* 🌸`,
        `📅 ${data.dateLabel} | ${data.chandraBal}`,
        `🪐 ${data.rashiLordStatus}`,
        `✨ *सामान्य फल:* ${data.general}`,
        `💼 *कार्यक्षेत्र:* ${data.career}`,
        `💰 *धन व लाभ:* ${data.wealth}`,
        `🪔 *उपाय:* ${data.remedy}`,
        `🎨 शुभ रंग: ${data.luckyColor} | 🔢 शुभ अंक: ${data.luckyNumber}`,
        `📖 शक्ति सनातन पंचांग`,
      ].join('\n\n');

      await shareImageFile({
        imageUri: dataUri,
        fileName,
        title: `${meta.name} दैनिक राशिफल (Full HD)`,
        text: shareCaption,
      });
    } catch {
      // User dismissed share dialog
    } finally {
      setIsSharingHd(false);
    }
  };

  return (
    <div className="bx-sheet flex-1 min-h-0 w-full h-full max-h-full flex flex-col relative overflow-hidden">
      {/* 1. Top Compact Control & Navigation Bar */}
      <header className="shrink-0 z-30 bg-[#FAF2E4]/95 border-b border-[#8C6239]/35 px-2.5 py-2 flex items-center justify-between gap-2 shadow-xs backdrop-blur-xs flex-wrap">
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Left Sidebar Toggle Button */}
          <button
            type="button"
            onClick={() => {
              triggerHapticSelection();
              setIsSidebarOpen((p) => !p);
            }}
            className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-[#8B1E1E] to-[#6E1409] text-white text-xs font-black flex items-center gap-1.5 shadow-xs transition hover:brightness-110 active:scale-95 cursor-pointer"
            title="सभी १२ राशियाँ मेनू देखें"
            aria-label="१२ राशियाँ मेनू खोलें"
          >
            <Menu className="w-3.5 h-3.5 text-[#FFD88A]" />
            <span>१२ राशियाँ</span>
            <span className="px-1.5 py-0.2 rounded-md bg-[#FFE599] text-[#5C3A21] text-[10px] font-black">
              {activeMeta.symbol}
            </span>
          </button>

          {/* 'Sort by Rashi' / Dynamic Grouping Mode Toggle Button */}
          <button
            type="button"
            onClick={() => {
              triggerHapticSelection();
              setIsGroupedByRashi((p) => !p);
            }}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-black flex items-center gap-1.5 shadow-xs transition active:scale-95 cursor-pointer ${
              isGroupedByRashi
                ? 'bg-[#8B1E1E] text-[#FFE599] border-[#E6A145] ring-2 ring-amber-400/30'
                : 'bg-[#F4E8D1] hover:bg-[#EAD8B8] text-[#5C3A21] border-[#8C6239]/40'
            }`}
            title="राशिवार समूहीकरण बदलें (Sort by Rashi)"
            aria-pressed={isGroupedByRashi}
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-[#B56A00]" />
            <span className="whitespace-nowrap font-bold">
              {isGroupedByRashi ? 'एकल राशि दृश्य' : 'Sort by Rashi'}
            </span>
            <span
              className={`px-1.5 py-0.2 rounded text-[9.5px] font-black ${
                isGroupedByRashi ? 'bg-amber-400/25 text-[#FFE599]' : 'bg-[#5C3A21]/15 text-[#5C3A21]'
              }`}
            >
              {isGroupedByRashi ? 'समूह चालू' : 'राशिवार'}
            </span>
          </button>
        </div>

        {/* Center/Right Actions */}
        <div className="flex items-center gap-1.5">
          {!isGroupedByRashi && (
            /* Prev / Current Rashi / Next Switcher (Single View Mode) */
            <div className="flex items-center gap-1 bg-[#F4E8D1] px-1.5 py-0.5 rounded-xl border border-[#8C6239]/35">
              <button
                type="button"
                onClick={handlePrevRashi}
                className="p-1 rounded-lg hover:bg-[#E5D2B8] text-[#5C3A21] cursor-pointer"
                title="पिछली राशि"
                aria-label="पिछली राशि"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  triggerHapticSelection();
                  setIsSidebarOpen((p) => !p);
                }}
                className="flex items-center gap-1 px-1.5 py-0.5 rounded-md hover:bg-[#E5D2B8] cursor-pointer"
                title="राशि बदलने हेतु क्लिक करें"
              >
                <span className="text-xs font-black text-[#4A0E0E]">
                  {activeMeta.name} ({activeMeta.symbol})
                </span>
              </button>

              <button
                type="button"
                onClick={handleNextRashi}
                className="p-1 rounded-lg hover:bg-[#E5D2B8] text-[#5C3A21] cursor-pointer"
                title="अगली राशि"
                aria-label="अगली राशि"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* HD Card Save Button */}
          <button
            type="button"
            onClick={() => handleSaveHd()}
            disabled={isSavingHd}
            className="px-2.5 py-1.5 rounded-xl bg-[#5C3A21] hover:bg-[#462B17] text-[#FAF2E4] text-[11px] font-bold flex items-center gap-1 shadow-xs transition active:scale-95 cursor-pointer"
            title="Full HD (1080p) राशिफल कार्ड सेव करें"
          >
            {isSavingHd ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#FFD88A]" />
            ) : (
              <Download className="w-3.5 h-3.5 text-[#FFD88A]" />
            )}
            <span className="hidden sm:inline">HD सेव</span>
          </button>

          {/* HD Card Share Button */}
          <button
            type="button"
            onClick={() => handleShareHd()}
            disabled={isSharingHd}
            className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-[#B56A00] to-[#8B1E1E] hover:brightness-110 text-white text-[11px] font-bold flex items-center gap-1 shadow-xs transition active:scale-95 cursor-pointer"
            title="Full HD (1080p) राशिफल कार्ड शेयर करें"
          >
            {isSharingHd ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-200" />
            ) : (
              <Share2 className="w-3.5 h-3.5 text-amber-200" />
            )}
            <span>HD शेयर</span>
          </button>
        </div>
      </header>

      {/* 2. Slide-Over Left Sidebar Drawer for All 12 Rashis */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop (tap to close) */}
          <div
            className="fixed inset-0 bg-black/45 backdrop-blur-[2px] transition-opacity"
            onClick={() => setIsSidebarOpen(false)}
            aria-hidden="true"
          />

          {/* Left Drawer Panel */}
          <aside
            className="relative w-[280px] sm:w-[320px] max-w-[85vw] h-full bg-[#FAF2E4] border-r-2 border-[#8C6239]/50 shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200"
            role="dialog"
            aria-label="१२ राशियाँ सूची"
          >
            {/* Drawer Header */}
            <div className="p-3 bg-[#5C3A21] text-[#FAF2E4] flex items-center justify-between border-b border-[#8C6239]">
              <div className="flex items-center gap-2">
                <span className="text-lg">♈</span>
                <div>
                  <h3 className="font-granth font-black text-sm text-[#FFD88A] leading-tight">
                    द्वादश राशियाँ (१२ राशियाँ)
                  </h3>
                  <p className="text-[10px] text-[#E5D2B8]">अपनी राशि पर टैप करें</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSidebarOpen(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-white cursor-pointer"
                aria-label="बंद करें"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 12 Rashis Scrollable List */}
            <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5 overscroll-contain">
              {RASHI_META.map((r, idx) => {
                const isSelected = idx === selectedRashiIdx;
                const rTheme = getElementTheme(r.element);
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => handleSelectRashi(idx)}
                    className={`w-full p-2 rounded-xl flex items-center gap-2.5 border transition-all cursor-pointer text-left ${
                      isSelected
                        ? 'bg-gradient-to-r from-[#6E1409] to-[#4A0E0E] text-[#FAF2E4] border-[#E6A145] shadow-sm translate-x-1'
                        : 'bg-[#F4E8D1]/80 hover:bg-[#EAD8B8] text-[#462B17] border-[#8C6239]/30'
                    }`}
                  >
                    <span
                      className={`w-9 h-9 rounded-xl flex items-center justify-center border shrink-0 bg-gradient-to-br ${rTheme.medallionGradient} ${rTheme.medallionBorder} shadow-xs`}
                    >
                      <RashiSvgIcon
                        rashiId={r.id}
                        size={22}
                        strokeColor={rTheme.iconStroke}
                        accentColor={rTheme.iconAccent}
                      />
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span
                          className={`text-xs font-black ${
                            isSelected ? 'text-[#FFE599]' : 'text-[#4A0E0E]'
                          }`}
                        >
                          {r.name} राशि ({r.symbol})
                        </span>
                        <span
                          className={`text-[9.5px] px-1.5 py-0.2 rounded font-bold ${
                            isSelected ? 'bg-amber-400/20 text-amber-200' : 'bg-amber-200/60 text-[#5C3A21]'
                          }`}
                        >
                          {r.element.replace(' तत्व', '')}
                        </span>
                      </div>
                      <p
                        className={`text-[10px] mt-0.5 truncate ${
                          isSelected ? 'text-amber-100/80' : 'text-[#8C6239]'
                        }`}
                      >
                        स्वामी: {r.lord} • {r.nature}
                      </p>
                    </div>

                    {isSelected && (
                      <span className="text-xs font-black text-[#FFE599] shrink-0">✓</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Drawer Footer */}
            <div className="p-2.5 border-t border-[#8C6239]/35 bg-[#F4E8D1]/90 text-[10.5px] text-center text-[#5C3A21] font-bold">
              📅 {live.dateLabel}
            </div>
          </aside>
        </div>
      )}

      {/* 3. Main Reading Area */}
      <main
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 min-h-0 w-full overflow-y-auto overscroll-contain p-2.5 sm:p-3 space-y-3 pb-24"
      >
        {/* HD Notice Toast */}
        {hdNotice && (
          <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2 shadow-xs animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>{hdNotice}</span>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* MODE A: 'Sort by Rashi' / Dynamic Grouping by Individual Rashi Signs */}
        {/* ------------------------------------------------------------- */}
        {isGroupedByRashi ? (
          <div className="space-y-3 animate-in fade-in duration-200">
            {/* Sorting & Grouping Options Sub-bar */}
            <div className="bg-[#FAF2E4] border border-[#8C6239]/35 rounded-2xl p-2.5 shadow-xs space-y-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-[#8B1E1E]" />
                  <span className="text-xs font-black text-[#4A0E0E]">
                    राशिवार समूहीकरण (Sort by Rashi):
                  </span>
                </div>
                <span className="text-[10.5px] text-[#8C6239] font-bold">
                  कुल १२ राशियाँ • {live.dateLabel}
                </span>
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    triggerHapticSelection();
                    setGroupSortFilter('zodiac');
                  }}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold border transition cursor-pointer ${
                    groupSortFilter === 'zodiac'
                      ? 'bg-[#8B1E1E] text-white border-[#8B1E1E] shadow-xs'
                      : 'bg-[#F4E8D1] text-[#5C3A21] border-[#8C6239]/30 hover:bg-[#EAD8B8]'
                  }`}
                >
                  १२ राशियाँ (१-१२ मेष से मीन)
                </button>

                <button
                  type="button"
                  onClick={() => {
                    triggerHapticSelection();
                    setGroupSortFilter('element');
                  }}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold border transition cursor-pointer ${
                    groupSortFilter === 'element'
                      ? 'bg-[#8B1E1E] text-white border-[#8B1E1E] shadow-xs'
                      : 'bg-[#F4E8D1] text-[#5C3A21] border-[#8C6239]/30 hover:bg-[#EAD8B8]'
                  }`}
                >
                  तत्व अनुसार समूह (अग्नि, पृथ्वी, वायु, जल)
                </button>

                <button
                  type="button"
                  onClick={() => {
                    triggerHapticSelection();
                    setGroupSortFilter('chandraBal');
                  }}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold border transition cursor-pointer ${
                    groupSortFilter === 'chandraBal'
                      ? 'bg-[#8B1E1E] text-white border-[#8B1E1E] shadow-xs'
                      : 'bg-[#F4E8D1] text-[#5C3A21] border-[#8C6239]/30 hover:bg-[#EAD8B8]'
                  }`}
                >
                  🌙 शुभ चंद्र बल अनुसार (Best First)
                </button>
              </div>

              {/* Quick Jump 12 Rashi Chips */}
              <div className="flex items-center gap-1 overflow-x-auto py-1 overscroll-contain">
                {RASHI_META.map((r, rIdx) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => {
                      triggerHapticSelection();
                      const el = document.getElementById(`rashi-card-${r.id}`);
                      if (el) {
                        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                    }}
                    className="px-2 py-0.5 rounded-lg bg-[#F4E8D1] border border-[#8C6239]/30 text-[10.5px] font-bold text-[#5C3A21] hover:bg-[#EAD8B8] shrink-0 cursor-pointer flex items-center gap-1"
                  >
                    <span>{r.symbol}</span>
                    <span>{r.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Render Each Individual Rashi Group Card */}
            <div className="space-y-3.5">
              {sortedGroupedRashis.map(({ meta, index, data }) => {
                const rTheme = getElementTheme(meta.element);
                return (
                  <article
                    key={meta.id}
                    id={`rashi-card-${meta.id}`}
                    style={{
                      background: 'linear-gradient(180deg, #FFFDF9 0%, #FAEDDB 100%)',
                      border: '1.5px solid #D4A24A',
                      boxShadow: '0 4px 14px rgba(74, 14, 14, 0.08), inset 0 1px 1px #FFFFFF',
                    }}
                    className="rounded-2xl p-3 sm:p-4 space-y-3 transition-all"
                  >
                    {/* Header Strip with Rashi Medallion & Actions */}
                    <div className="flex items-center justify-between gap-2.5 flex-wrap">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          style={{
                            boxShadow: `0 4px 12px ${rTheme.glowColor}, inset 0 1px 1px rgba(255,255,255,0.45)`,
                          }}
                          className={`w-12 h-12 rounded-xl shrink-0 flex items-center justify-center border-2 bg-gradient-to-br ${rTheme.medallionGradient} ${rTheme.medallionBorder}`}
                        >
                          <RashiSvgIcon
                            rashiId={meta.id}
                            size={32}
                            strokeColor={rTheme.iconStroke}
                            accentColor={rTheme.iconAccent}
                          />
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h2 className="font-granth font-black text-base sm:text-lg text-[#4A0E0E] leading-tight">
                              {meta.name} राशि ({meta.symbol})
                            </h2>
                            <span
                              className={`text-[9.5px] px-1.5 py-0.2 rounded border font-bold ${rTheme.badgeBg} ${rTheme.badgeText}`}
                            >
                              {meta.element} • {meta.nature}
                            </span>
                            <span className="text-[10px] text-[#6B421B] font-bold">
                              स्वामी: {meta.lord}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100/90 border border-amber-300 text-[#5C3A21] font-bold">
                              🌙 {data.chandraBal}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100/90 border border-emerald-300 text-emerald-950 font-bold">
                              🎨 {data.luckyColor}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-100/90 border border-purple-300 text-purple-950 font-bold">
                              🔢 अंक: {data.luckyNumber}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right Quick Actions */}
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedRashiIdx(index);
                            setIsGroupedByRashi(false);
                            if (scrollContainerRef.current) {
                              scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
                            }
                          }}
                          className="px-2 py-1 rounded-lg bg-[#FAF2E4] hover:bg-[#F4E8D1] border border-[#8C6239]/40 text-[#5C3A21] text-[10.5px] font-bold cursor-pointer"
                          title="इस राशि को एकल विस्तृत दृश्य में देखें"
                        >
                          एकल दृश्य ↗
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleVoice(`${meta.name} राशि का राशिफल। ${data.general}`)}
                          className="p-1.5 rounded-lg bg-[#5C3A21] text-[#FAF2E4] hover:bg-[#462B17] cursor-pointer"
                          title="सुनें"
                        >
                          <Volume2 className="w-3.5 h-3.5 text-amber-200" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSaveHd(meta, data)}
                          className="p-1.5 rounded-lg bg-[#5C3A21] text-[#FAF2E4] hover:bg-[#462B17] cursor-pointer"
                          title="HD कार्ड सेव करें"
                        >
                          <Download className="w-3.5 h-3.5 text-[#FFD88A]" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleShareHd(meta, data)}
                          className="p-1.5 rounded-lg bg-emerald-800 text-white hover:bg-emerald-900 cursor-pointer"
                          title="HD कार्ड शेयर करें"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* General Transit Forecast for this Rashi */}
                    <div className="p-2.5 rounded-xl bg-[#FAF2E4]/90 border border-[#8C6239]/25 text-xs">
                      <div className="flex items-center gap-1 text-[#6E1409] font-bold text-[11px] mb-0.5">
                        <Sun className="w-3 h-3 text-[#B56A00]" />
                        <span>गोचर फलादेश:</span>
                      </div>
                      <p className="text-[#3A2210] leading-snug font-medium text-[11.5px]">
                        {data.general}
                      </p>
                    </div>

                    {/* Career & Wealth 2-Column Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className="p-2 rounded-xl bg-emerald-50/90 border border-emerald-200">
                        <div className="text-[10.5px] font-bold text-emerald-900 flex items-center gap-1">
                          <Briefcase className="w-3 h-3 text-emerald-700" />
                          <span>कार्यक्षेत्र (Career)</span>
                        </div>
                        <p className="text-[11px] text-[#243324] mt-0.5 leading-snug">
                          {data.career}
                        </p>
                      </div>

                      <div className="p-2 rounded-xl bg-amber-50/90 border border-amber-200">
                        <div className="text-[10.5px] font-bold text-amber-900 flex items-center gap-1">
                          <Coins className="w-3 h-3 text-amber-700" />
                          <span>धन व लाभ (Wealth)</span>
                        </div>
                        <p className="text-[11px] text-[#3d2f1f] mt-0.5 leading-snug">
                          {data.wealth}
                        </p>
                      </div>
                    </div>

                    {/* Remedy Strip */}
                    <div className="p-2 rounded-xl bg-purple-50/90 border border-purple-200 text-xs">
                      <div className="text-[10.5px] font-bold text-[#6E1409] flex items-center gap-1">
                        <Flame className="w-3 h-3 text-purple-700" />
                        <span>{meta.name} राशि अचूक उपाय:</span>
                      </div>
                      <p className="text-[11px] text-[#2F1E38] font-semibold mt-0.5 leading-snug">
                        {data.remedy}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        ) : (
          /* ------------------------------------------------------------- */
          /* MODE B: Single Focused Rashi View (Spacious & Detailed) */
          /* ------------------------------------------------------------- */
          <>
            {/* 4. Selected Rashi Hero Header Card (Spacious, No Text Clipping) */}
            <section
              style={{
                background: 'linear-gradient(180deg, #FFFDF9 0%, #FAEDDB 100%)',
                border: '1.5px solid #D4A24A',
                boxShadow: '0 4px 14px rgba(74, 14, 14, 0.08), inset 0 1px 1px #FFFFFF',
              }}
              className="rounded-2xl p-3 sm:p-4 space-y-3"
            >
              <div className="flex items-center gap-3">
                {/* Hero 3D Rashi Medallion */}
                <div
                  style={{
                    boxShadow: `0 6px 16px ${elemTheme.glowColor}, inset 0 1px 1px rgba(255,255,255,0.45)`,
                  }}
                  className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl shrink-0 flex items-center justify-center border-2 bg-gradient-to-br ${elemTheme.medallionGradient} ${elemTheme.medallionBorder}`}
                >
                  <RashiSvgIcon
                    rashiId={activeMeta.id}
                    size={42}
                    strokeColor={elemTheme.iconStroke}
                    accentColor={elemTheme.iconAccent}
                  />
                </div>

                {/* Rashi Title and Meta (Spacious leading-normal so NO letters ever cut off!) */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <h1 className="font-granth font-black text-lg sm:text-xl text-[#4A0E0E] leading-normal py-0.5">
                      {activeMeta.name} राशिफल ({activeMeta.symbol})
                    </h1>
                    <span
                      className={`text-[10.5px] px-2 py-0.5 rounded-md border font-extrabold ${elemTheme.badgeBg} ${elemTheme.badgeText}`}
                    >
                      {activeMeta.element} • {activeMeta.nature}
                    </span>
                  </div>

                  <p className="text-[11.5px] font-bold text-[#6B421B] mt-0.5 leading-normal">
                    🪐 {live.rashiLordStatus}
                  </p>

                  <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                    <span className="text-[10.5px] px-2 py-0.5 rounded-md bg-amber-100/90 border border-amber-300 text-[#5C3A21] font-bold">
                      🌙 {live.chandraBal}
                    </span>
                    <span className="text-[10.5px] px-2 py-0.5 rounded-md bg-emerald-100/90 border border-emerald-300 text-emerald-950 font-bold">
                      🎨 शुभ रंग: {live.luckyColor}
                    </span>
                    <span className="text-[10.5px] px-2 py-0.5 rounded-md bg-purple-100/90 border border-purple-300 text-purple-950 font-bold">
                      🔢 शुभ अंक: {live.luckyNumber}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Ribbon: HD Save, HD Share, Voice, Ask Uma */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-[#8C6239]/25">
                <div className="text-[11px] text-[#6B421B] font-semibold">
                  चंद्र गोचर: <strong className="text-[#4A0E0E]">{live.moonTransit}</strong>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  {/* Voice Narration Button */}
                  <button
                    type="button"
                    onClick={() => handleToggleVoice()}
                    className="px-2.5 py-1.5 rounded-xl bg-[#5C3A21] hover:bg-[#462B17] text-[#FAF2E4] text-[11px] font-bold flex items-center gap-1 cursor-pointer transition active:scale-95 shadow-xs"
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

                  {/* Ask Uma Modal Button */}
                  {onOpenUmaModal && (
                    <button
                      type="button"
                      onClick={() => {
                        triggerHapticSelection();
                        onOpenUmaModal(
                          `आज ${activeMeta.name} राशि के गोचर (${live.chandraBal}) और मेरे करियर व धन के लिए विशेष मार्गदर्शन दें।`
                        );
                      }}
                      className="px-2.5 py-1.5 rounded-xl bg-[#8B1E1E] hover:bg-[#6E1409] text-[#FAF2E4] text-[11px] font-bold flex items-center gap-1 cursor-pointer transition active:scale-95 shadow-xs"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                      <span>उमा से पूछें</span>
                    </button>
                  )}

                  {/* Text Share */}
                  <button
                    type="button"
                    onClick={() => handleTextShare()}
                    className="px-2.5 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer transition active:scale-95 shadow-xs"
                    title="व्हाट्सएप पर टेक्स्ट शेयर करें"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>शेयर</span>
                  </button>
                </div>
              </div>
            </section>

            {/* 5. Detailed Gochar Predictions Bento Cards */}
            <section className="space-y-2.5">
              {/* General Transit Forecast Card */}
              <div className="bx-fact bx-glass p-3.5 space-y-1.5">
                <div className="flex items-center justify-between gap-2 border-b border-[#8C6239]/20 pb-1.5">
                  <div className="flex items-center gap-1.5 font-extrabold text-xs text-[#4A0E0E]">
                    <Sun className="w-4 h-4 text-[#B56A00] shrink-0" />
                    <span>{activeMeta.name} राशि — आज का ग्रह गोचर फलादेश</span>
                  </div>
                  <span className="text-[10.5px] font-bold text-[#8C6239]">
                    इष्ट: {activeMeta.ishtaDevta}
                  </span>
                </div>
                <p className="text-xs text-[#3A2210] leading-relaxed font-medium pt-0.5">
                  {live.general}
                </p>
              </div>

              {/* Career & Wealth 2-Column Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="bx-fact bx-glass p-3 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-extrabold text-emerald-900 border-b border-emerald-200/60 pb-1">
                    <Briefcase className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    <span>कार्यक्षेत्र एवं आजीविका (Career)</span>
                  </div>
                  <p className="text-[11.5px] text-[#3A2210] leading-relaxed font-medium pt-0.5">
                    {live.career}
                  </p>
                </div>

                <div className="bx-fact bx-glass p-3 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-extrabold text-amber-900 border-b border-amber-200/60 pb-1">
                    <Coins className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                    <span>धन, व्यापार एवं लाभ (Wealth)</span>
                  </div>
                  <p className="text-[11.5px] text-[#3A2210] leading-relaxed font-medium pt-0.5">
                    {live.wealth}
                  </p>
                </div>
              </div>

              {/* Family/Love & Health 2-Column Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="bx-fact bx-glass p-3 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-extrabold text-rose-900 border-b border-rose-200/60 pb-1">
                    <HeartHandshake className="w-3.5 h-3.5 text-rose-700 shrink-0" />
                    <span>परिवार, दांपत्य एवं प्रेम (Family & Love)</span>
                  </div>
                  <p className="text-[11.5px] text-[#3A2210] leading-relaxed font-medium pt-0.5">
                    {live.love}
                  </p>
                </div>

                <div className="bx-fact bx-glass p-3 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-extrabold text-sky-900 border-b border-sky-200/60 pb-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-sky-700 shrink-0" />
                    <span>स्वास्थ्य एवं प्राण-ऊर्जा (Health)</span>
                  </div>
                  <p className="text-[11.5px] text-[#3A2210] leading-relaxed font-medium pt-0.5">
                    {live.health}
                  </p>
                </div>
              </div>

              {/* Rashi-Specific Vedic Upay Card */}
              <div className="bx-fact bx-glass p-3.5 space-y-1.5 border border-[#C89D66]">
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#6E1409] border-b border-[#8C6239]/20 pb-1">
                  <Flame className="w-4 h-4 text-[#B56A00] shrink-0" />
                  <span>{activeMeta.name} राशि विशेष अचूक वैदिक उपाय</span>
                </div>
                <p className="text-xs text-[#3A2210] leading-relaxed font-semibold pt-0.5">
                  {live.remedy}
                </p>
              </div>

              {/* Planetary Transits from Selected Rashi (Gochar Chakra) */}
              <div className="bx-fact bx-glass p-3 space-y-2">
                <div className="text-[11px] font-extrabold text-[#5C3A21]">
                  🪐 आज {activeMeta.name} राशि से नवग्रहों की भाव स्थिति (Gochar Chakra):
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-9 gap-1.5">
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

              {/* Bottom HD Save & Share Full Banner */}
              <div className="p-3 rounded-2xl bg-[#FAF2E4] border border-[#8C6239]/40 flex flex-wrap items-center justify-between gap-2 shadow-xs">
                <div>
                  <div className="text-xs font-black text-[#5C3A21]">
                    {activeMeta.name} राशि का सुंदर HD पंचांग कार्ड
                  </div>
                  <p className="text-[10px] text-[#8C6239] mt-0.5">
                    व्हाट्सएप स्टेटस, गैलरी में 1080p फोटो सेव व शेयर करें
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleSaveHd()}
                    disabled={isSavingHd}
                    className="px-3 py-1.5 rounded-xl bg-[#5C3A21] hover:bg-[#462B17] text-[#FAF2E4] text-xs font-bold flex items-center gap-1.5 shadow-xs transition active:scale-95 cursor-pointer"
                  >
                    {isSavingHd ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#FFD88A]" />
                    ) : (
                      <Download className="w-3.5 h-3.5 text-[#FFD88A]" />
                    )}
                    <span>HD में सेव करें</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleShareHd()}
                    disabled={isSharingHd}
                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#B56A00] to-[#8B1E1E] hover:brightness-110 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition active:scale-95 cursor-pointer"
                  >
                    {isSharingHd ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-200" />
                    ) : (
                      <Share2 className="w-3.5 h-3.5 text-amber-200" />
                    )}
                    <span>HD कार्ड शेयर</span>
                  </button>
                </div>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
};
