import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  VedicPanchangData,
} from '../types';
import {
  formatPlaceTime,
} from '../services/engine/time';
import {
  calculateSpecialYogas,
  calculatePanchakAndBhadra,
} from '../services/horaPanchakYogas';
import {
  getAuspiciousWindows,
  getInauspiciousWindows,
} from '../services/choghadiya';
import { downloadBhojpatraPdf } from '../services/bhojpatraPdf';
import { PdfSuccessModal } from './PdfSuccessModal';
import { useLanguage } from '../i18n';
import { trVedic, trRashi, trWeekday } from '../i18n/vedicTranslate';
import { speakUma, stopUmaSpeech } from '../lib/umaSpeech';
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Share2,
  Sparkles,
  Sun,
  Compass,
  Clock,
  ShieldCheck,
  Star,
  Check,
  Download,
  Layers,
  Zap,
  BookOpen,
} from 'lucide-react';

export interface PanchangStoryViewProps {
  panchang: VedicPanchangData;
  locationName?: string;
  currentDate?: Date;
  onDateChange?: (d: Date) => void;
  onOpenLocationModal?: () => void;
  onOpenUmaModal?: (query?: string) => void;
  onOpenWhatsAppPanchang?: () => void;
  onSwitchToClassicView?: () => void;
  latitude?: number;
  longitude?: number;
  onPrevChapter?: () => void;
  onNextChapter?: () => void;
}

const TOTAL_SLIDES = 8;
const SLIDE_DURATION_MS = 6500; // 6.5s per chunk

export const PanchangStoryView: React.FC<PanchangStoryViewProps> = ({
  panchang,
  locationName = 'उज्जैन',
  currentDate,
  onDateChange,
  onOpenLocationModal,
  onOpenUmaModal,
  onOpenWhatsAppPanchang,
  onSwitchToClassicView,
}) => {
  const { t, language } = useLanguage();
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [shareNotice, setShareNotice] = useState<string | null>(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [pdfSuccessInfo, setPdfSuccessInfo] = useState<{
    isOpen: boolean;
    fileName: string;
    blobUrl: string;
    blob: Blob;
    pageCount: number;
    title: string;
  } | null>(null);

  const solar = panchang.solar;
  const fmt = (d: Date) => formatPlaceTime(d);
  const weekdayNum = panchang.date.getDay();

  const auspiciousWindows = getAuspiciousWindows(solar);
  const inauspiciousWindows = getInauspiciousWindows(solar, weekdayNum);
  const abhijitWindow = auspiciousWindows.find((w) => w.title === 'अभिजित मुहूर्त');
  const rahuWindow = inauspiciousWindows.find((w) => w.title === 'राहु काल');
  const amritWindow = auspiciousWindows.find((w) => w.title === 'अमृत काल');
  const brahmaWindow = auspiciousWindows.find((w) => w.title === 'ब्रह्म मुहूर्त');
  const yamagandaWindow = inauspiciousWindows.find((w) => w.title === 'यमगण्ड काल' || w.title === 'यमगण्ड');
  const gulikaWindow = inauspiciousWindows.find((w) => w.title === 'गुलिक काल' || w.title === 'गुलिक');

  const specialYogas = calculateSpecialYogas(panchang);
  const { panchak, bhadra } = calculatePanchakAndBhadra(panchang);

  // Day duration
  const dayMinutes = Math.round((solar.sunset.getTime() - solar.sunrise.getTime()) / 60000);
  const dayHoursStr = `${Math.floor(dayMinutes / 60)}h ${dayMinutes % 60}m`;

  // Disha Shool based on weekday
  const DISHA_SHOOL_MAP: Record<number, { dirHindi: string; dirEnglish: string; remedyHindi: string; remedyEnglish: string }> = {
    0: { dirHindi: 'पश्चिम', dirEnglish: 'West', remedyHindi: 'दल या पान खाकर यात्रा करें', remedyEnglish: 'Consume betel leaf or cardamom before departure' },
    1: { dirHindi: 'पूर्व', dirEnglish: 'East', remedyHindi: 'दर्पण देखकर या घी खाकर निकलें', remedyEnglish: 'Look into a mirror or consume ghee before travel' },
    2: { dirHindi: 'उत्तर', dirEnglish: 'North', remedyHindi: 'गुड़ खाकर यात्रा प्रारंभ करें', remedyEnglish: 'Consume jaggery before starting journey' },
    3: { dirHindi: 'उत्तर', dirEnglish: 'North', remedyHindi: 'तिल या धनिया खाकर प्रस्थान करें', remedyEnglish: 'Consume coriander seeds or sesame before travel' },
    4: { dirHindi: 'दक्षिण', dirEnglish: 'South', remedyHindi: 'दही खाकर यात्रा करें', remedyEnglish: 'Consume curd/yogurt before journey' },
    5: { dirHindi: 'पश्चिम', dirEnglish: 'West', remedyHindi: 'जौ खाकर या राई का दान कर निकलें', remedyEnglish: 'Consume barley or donate mustard before departure' },
    6: { dirHindi: 'पूर्व', dirEnglish: 'East', remedyHindi: 'अदरक या उड़द खाकर यात्रा करें', remedyEnglish: 'Consume ginger or black gram before travel' },
  };
  const dishaInfo = DISHA_SHOOL_MAP[weekdayNum] || DISHA_SHOOL_MAP[1];

  // 8 Chunked Slides Metadata
  const SLIDES_META = [
    { id: 0, title: `${t('panchang.tithi', 'तिथि')} (1/2)`, subtitle: t('panchang.shareTithi', 'मुख्य तिथि'), icon: '🪔' },
    { id: 1, title: `${t('panchang.tithi', 'तिथि')} (2/2)`, subtitle: t('panchang.storyBlessingShort', 'संकल्प व मंत्र'), icon: '🕉️' },
    { id: 2, title: `${t('panchang.nakshatra', 'नक्षत्र')} (1/2)`, subtitle: t('panchang.pada', 'सक्रिय नक्षत्र'), icon: '🌟' },
    { id: 3, title: `${t('panchang.nakshatra', 'नक्षत्र')} (2/2)`, subtitle: t('panchang.moonSign', 'स्वामी व राशि'), icon: '♈' },
    { id: 4, title: t('panchang.yoga', 'योग व करण'), subtitle: t('panchang.dailyYoga', 'दैनिक प्रभाव'), icon: '☯️' },
    { id: 5, title: t('panchang.muhurat', 'शुभ मुहूर्त'), subtitle: t('panchang.abhijit', 'अभिजित काल'), icon: '✨' },
    { id: 6, title: t('panchang.rahuKaal', 'अशुभ व दिशाशूल'), subtitle: t('panchang.dishaShool', 'सावधानी'), icon: '⚠️' },
    { id: 7, title: t('panchang.panchakBhadra', 'पञ्चक व भद्रा'), subtitle: t('panchang.activeYoga', 'विशेष योग'), icon: '🛡️' },
  ];

  // Navigation handlers
  const handleNextSlide = useCallback(() => {
    setCurrentSlide((prev) => {
      if (prev < TOTAL_SLIDES - 1) {
        setProgress(0);
        return prev + 1;
      }
      setProgress(100);
      return prev;
    });
  }, []);

  const handlePrevSlide = useCallback(() => {
    setCurrentSlide((prev) => {
      if (prev > 0) {
        setProgress(0);
        return prev - 1;
      }
      setProgress(0);
      return 0;
    });
  }, []);

  const handleSelectSlide = (idx: number) => {
    setCurrentSlide(idx);
    setProgress(0);
  };

  // Timer progression for Story
  useEffect(() => {
    if (isPaused) return;

    const interval = 50;
    const step = (interval / SLIDE_DURATION_MS) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          if (currentSlide < TOTAL_SLIDES - 1) {
            setCurrentSlide((curr) => curr + 1);
            return 0;
          }
          return 100;
        }
        return prev + step;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [currentSlide, isPaused]);

  // Touch & Mouse tap navigation
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const touchStartTimeRef = useRef<number>(0);

  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    setIsPaused(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    touchStartXRef.current = clientX;
    touchStartYRef.current = clientY;
    touchStartTimeRef.current = Date.now();
  };

  const handleTouchEnd = (e: React.TouchEvent | React.MouseEvent) => {
    setIsPaused(false);
    if (touchStartXRef.current === null) return;

    const clientX = 'changedTouches' in e ? e.changedTouches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'changedTouches' in e ? e.changedTouches[0].clientY : (e as React.MouseEvent).clientY;
    const diffX = clientX - touchStartXRef.current;
    const diffY = touchStartYRef.current !== null ? clientY - touchStartYRef.current : 0;
    const elapsed = Date.now() - touchStartTimeRef.current;

    // If user scrolled vertically, allow smooth scrolling without flipping slides
    if (Math.abs(diffY) > 25) {
      touchStartXRef.current = null;
      touchStartYRef.current = null;
      return;
    }

    // Swipe horizontal detection
    if (Math.abs(diffX) > 48 && Math.abs(diffX) > Math.abs(diffY) * 1.5 && elapsed < 450) {
      if (diffX < 0) {
        handleNextSlide();
      } else {
        handlePrevSlide();
      }
    }
    touchStartXRef.current = null;
    touchStartYRef.current = null;
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleNextSlide();
      if (e.key === 'ArrowLeft') handlePrevSlide();
      if (e.key === ' ') {
        e.preventDefault();
        setIsPaused((p) => !p);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNextSlide, handlePrevSlide]);

  // Date Steppers
  const handlePrevDay = () => {
    if (!currentDate || !onDateChange) return;
    const d = new Date(currentDate);
    d.setDate(d.getDate() - 1);
    onDateChange(d);
    setProgress(0);
  };

  const handleNextDay = () => {
    if (!currentDate || !onDateChange) return;
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 1);
    onDateChange(d);
    setProgress(0);
  };

  // Voice narration for current chunk
  const handleToggleVoice = async () => {
    if (isSpeaking) {
      stopUmaSpeech();
      setIsSpeaking(false);
      return;
    }

    let speechText = '';
    const loc = locationName ? ` स्थान ${locationName}।` : '';
    const dateStr = panchang.date.toLocaleDateString('hi-IN', { day: 'numeric', month: 'long', year: 'numeric' });

    if (currentSlide === 0) {
      speechText = `आज का पंचांग। ${trWeekday(panchang.weekday)}, ${dateStr}। संवत् ${panchang.samvat}। ${panchang.paksha}, ${panchang.tithi}। ${loc}`;
    } else if (currentSlide === 1) {
      speechText = `आज की तिथि ${panchang.tithi}। श्री गणेशाय नमः। शुभं करोति कल्याणम्।`;
    } else if (currentSlide === 2) {
      speechText = `आज का नक्षत्र ${panchang.nakshatra}, चरण ${panchang.pada}। नक्षत्र समाप्ति ${panchang.nakshatraSpan ? fmt(panchang.nakshatraSpan.end) : ''}।`;
    } else if (currentSlide === 3) {
      speechText = `चन्द्र राशि ${panchang.lunarRashi}, सूर्य राशि ${panchang.solarRashi}।`;
    } else if (currentSlide === 4) {
      speechText = `आज का योग ${panchang.yoga}, और करण ${panchang.karana} है।`;
    } else if (currentSlide === 5) {
      speechText = `आज का शुभ अभिजित मुहूर्त ${abhijitWindow && weekdayNum !== 3 ? `${fmt(abhijitWindow.start)} से ${fmt(abhijitWindow.end)} तक` : 'आज नहीं है'}। ब्रह्म मुहूर्त ${brahmaWindow ? fmt(brahmaWindow.start) : 'प्रातःकाल'}।`;
    } else if (currentSlide === 6) {
      speechText = `राहुकाल ${rahuWindow ? `${fmt(rahuWindow.start)} से ${fmt(rahuWindow.end)} तक` : 'नहीं है'}। आज का दिशाशूल ${dishaInfo.dirHindi} दिशा में है।`;
    } else {
      speechText = `पञ्चक स्थिति: ${panchak.isActive ? panchak.typeNameHindi : 'पञ्चक मुक्त'}। भद्रा: ${bhadra.isActive ? bhadra.vas : 'भद्रा मुक्त'}।`;
    }

    setIsSpeaking(true);
    await speakUma(speechText);
    setIsSpeaking(false);
  };

  // Share text builder
  const buildPanchangShareText = () => {
    const loc = locationName ? ` (${locationName})` : '';
    const dateLocale = language === 'en' ? 'en-US' : language === 'gu' ? 'gu-IN' : 'hi-IN';
    const dateStr = panchang.date.toLocaleDateString(dateLocale, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    return `${t('panchang.shlokaGanesh', '॥ श्री गणेशाय नमः ॥')}
🕉️ ${t('panchang.shareHeader', 'सनातन शक्ति पंचांग')}${loc}
📅 ${t('panchang.shareDate', 'दिनांक')}: ${dateStr}, ${trWeekday(panchang.weekday)}
🚩 ${t('panchang.shareSamvat', 'संवत्')}: ${trVedic(panchang.samvat)}
🌕 ${t('panchang.shareMasaPaksha', 'मास/पक्ष')}: ${trVedic(panchang.paksha)} • ${trVedic(panchang.masa)}

१. ${t('panchang.shareTithi', 'तिथि')}: ${trVedic(panchang.tithi)} (${panchang.tithiSpan ? fmt(panchang.tithiSpan.end) + ' ' + t('panchang.endsAt', 'तक') : ''})
२. ${t('panchang.shareNakshatra', 'नक्षत्र')}: ${trVedic(panchang.nakshatra)} (${t('panchang.pada', 'चरण')} ${panchang.pada})
३. ${t('panchang.shareYoga', 'योग')}: ${trVedic(panchang.yoga)}
४. ${t('panchang.shareKarana', 'करण')}: ${trVedic(panchang.karana)}
५. ${t('panchang.shareWeekday', 'वार')}: ${trWeekday(panchang.weekday)}

🌅 ${t('panchang.sunrise', 'सूर्योदय')}: ${fmt(solar.sunrise)} | ${t('panchang.sunset', 'सूर्यास्त')}: ${fmt(solar.sunset)}
🌙 ${t('panchang.moonSign', 'चंद्र राशि')}: ${trRashi(panchang.lunarRashi)} | ${t('panchang.sunSign', 'सूर्य राशि')}: ${trRashi(panchang.solarRashi)}
✨ ${t('panchang.shareAbhijit', 'अभिजित मुहूर्त')}: ${abhijitWindow && weekdayNum !== 3 ? `${fmt(abhijitWindow.start)} - ${fmt(abhijitWindow.end)}` : t('panchang.notToday', 'आज नहीं')}
⚠️ ${t('panchang.shareRahuKaal', 'राहुकाल')}: ${rahuWindow ? `${fmt(rahuWindow.start)} - ${fmt(rahuWindow.end)}` : '—'}

🌸 ${t('panchang.shareFooter', 'शक्ति वैदिक पंचांग द्वारा प्रामाणिक गणना')}`;
  };

  const handleShare = async () => {
    const text = buildPanchangShareText();
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${t('panchang.shareHeader', 'सनातन शक्ति पंचांग')} - ${trWeekday(panchang.weekday)}`,
          text,
        });
        return;
      } catch {}
    }
    try {
      await navigator.clipboard.writeText(text);
      setShareNotice(t('panchang.shareCopiedToast', 'पंचांग विवरण कॉपी किया गया!'));
      setTimeout(() => setShareNotice(null), 3000);
    } catch {}
  };

  const handleDownloadTodayBhojpatra = async () => {
    try {
      setIsDownloadingPdf(true);
      const res = await downloadBhojpatraPdf({
        title: `Panchang_${panchang.weekday}`,
        panchang,
        query: `${t('panchang.pdfQuery', 'दैनिक पंचांग')} — ${trWeekday(panchang.weekday)}, ${trVedic(panchang.tithi)}`,
        answer: buildPanchangShareText(),
        locationName,
        date: panchang.date,
      });

      setPdfSuccessInfo({
        isOpen: true,
        fileName: res.fileName,
        blobUrl: res.blobUrl,
        blob: res.blob,
        pageCount: res.pageCount,
        title: `${t('panchang.pdfSuccessTitle', 'दैनिक भोजपत्र पंचांग')} (${trWeekday(panchang.weekday)}, ${trVedic(panchang.tithi)})`,
      });
    } catch (err) {
      console.error('Bhojpatra PDF generation error:', err);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  // Dynamic user date using TypeScript new Date() formatted per active language (Hindi, Gujarati, English)
  const activeStoryDate = currentDate instanceof Date && !isNaN(currentDate.getTime())
    ? currentDate
    : panchang?.date instanceof Date && !isNaN(panchang.date.getTime())
      ? panchang.date
      : new Date();

  const formattedDate = activeStoryDate.toLocaleDateString(
    language === 'en' ? 'en-US' : language === 'gu' ? 'gu-IN' : 'hi-IN',
    { day: 'numeric', month: 'short' }
  );

  return (
    <div
      className="instagram-story-wrapper select-none bg-gradient-to-b from-[#1C0F08] via-[#2D160C] to-[#140804] text-[#FAF2E4] font-sans flex flex-col justify-between"
      style={{
        height: '100%',
        width: '100%',
        maxHeight: '100%',
        maxWidth: '100%',
        overflow: 'hidden',
        overflowY: 'hidden',
        overflowX: 'hidden',
        touchAction: 'pan-x',
        paddingTop: 'max(0.4rem, env(safe-area-inset-top, 0px))',
        paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom, 0px))',
      }}
    >
      <PdfSuccessModal info={pdfSuccessInfo} onClose={() => setPdfSuccessInfo(null)} />

      {/* Ambient background divine glow rings */}
      <div className="absolute top-1/4 -left-20 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 -right-20 w-80 h-80 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* ========================================================================= */}
      {/* 1. TOP SEGMENTED PROGRESS BARS & CONTROLS */}
      {/* ========================================================================= */}
      <header className="relative z-30 px-3 pt-1 pb-1 shrink-0 w-full max-w-lg mx-auto">
        {/* 8 Segmented Progress Bars */}
        <div className="flex items-center gap-1 w-full">
          {Array.from({ length: TOTAL_SLIDES }).map((_, idx) => {
            let widthPct = 0;
            if (idx < currentSlide) widthPct = 100;
            else if (idx === currentSlide) widthPct = progress;

            return (
              <div
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectSlide(idx);
                }}
                className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden cursor-pointer hover:bg-white/30 transition backdrop-blur-xs relative"
              >
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-yellow-300 rounded-full transition-all duration-75"
                  style={{ width: `${widthPct}%` }}
                />
              </div>
            );
          })}
        </div>

        {/* Top Control Bar with Slide Title Counter */}
        <div className="flex items-center justify-between gap-1.5 mt-2">
          {/* Left: Day, Date & Slide Label */}
          <div className="flex items-center gap-1.5 min-w-0">
            <div className="flex items-center bg-white/10 backdrop-blur-md rounded-full px-2.5 py-0.5 border border-white/15 text-xs font-bold shadow-xs">
              <span className="text-amber-400 mr-1">{SLIDES_META[currentSlide]?.icon}</span>
              <span className="font-extrabold text-[#FFF6E5] truncate">
                {SLIDES_META[currentSlide]?.title}
              </span>
              <span className="text-stone-400 mx-1">•</span>
              <span className="text-amber-300 font-mono text-[11px] font-black">{currentSlide + 1}/{TOTAL_SLIDES}</span>
            </div>

            {onOpenLocationModal && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenLocationModal();
                }}
                className="px-2 py-0.5 bg-white/10 backdrop-blur-md rounded-full border border-white/15 text-[11px] font-bold text-amber-200 hover:bg-white/20 transition truncate max-w-[90px] cursor-pointer"
                title={`Location: ${locationName}`}
              >
                📍 {locationName}
              </button>
            )}
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleToggleVoice();
              }}
              className={`p-1.5 rounded-full border transition cursor-pointer ${
                isSpeaking
                  ? 'bg-amber-500 text-stone-950 border-amber-300 shadow-md animate-pulse'
                  : 'bg-white/10 border-white/15 text-white hover:bg-white/20'
              }`}
              title={isSpeaking ? 'ध्वनि रोकें' : 'पंचांग वाणी सुनें'}
            >
              {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsPaused(!isPaused);
              }}
              className="p-1.5 rounded-full bg-white/10 border border-white/15 text-white hover:bg-white/20 transition cursor-pointer"
              title={isPaused ? 'कहानी जारी रखें' : 'रोकें'}
            >
              {isPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5" />}
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleShare();
              }}
              className="p-1.5 rounded-full bg-emerald-600/90 border border-emerald-400/50 text-white hover:bg-emerald-600 transition cursor-pointer shadow-xs"
              title="व्हाट्सएप पर शेयर करें"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Share Toast Banner */}
      {shareNotice && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 animate-in fade-in zoom-in-95 duration-200 pointer-events-none">
          <div className="px-4 py-1.5 bg-emerald-900/95 text-emerald-100 border border-emerald-400 rounded-full shadow-2xl text-xs font-bold flex items-center gap-2 backdrop-blur-md">
            <Check className="w-4 h-4 text-emerald-300" />
            <span>{shareNotice}</span>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. CHUNKED STORY SLIDE CANVAS (Zero Scroll, 100% Guaranteed Fit) */}
      {/* ========================================================================= */}
      <main
        className="relative z-20 flex-1 w-full max-w-lg mx-auto px-2 sm:px-3 py-1 flex flex-col min-h-0 overflow-hidden"
        style={{
          touchAction: 'pan-x',
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleTouchStart}
        onMouseUp={handleTouchEnd}
      >
        {/* Visual Tap Indicators */}
        <div className="absolute inset-y-0 left-0 w-1/4 pointer-events-none z-10 flex items-center justify-start pl-2 opacity-0 hover:opacity-30 transition">
          <div className="p-2 rounded-full bg-black/40 text-white/70">
            <ChevronLeft className="w-5 h-5" />
          </div>
        </div>
        <div className="absolute inset-y-0 right-0 w-1/4 pointer-events-none z-10 flex items-center justify-end pr-2 opacity-0 hover:opacity-30 transition">
          <div className="p-2 rounded-full bg-black/40 text-white/70">
            <ChevronRight className="w-5 h-5" />
          </div>
        </div>

        {/* ===================================================================== */}
        {/* SLIDE 0: 🪔 TITHI (Part 1/2) — MAIN TITHI & SAMVAT */}
        {/* ===================================================================== */}
        {currentSlide === 0 && (
          <div className="h-full flex flex-col justify-between py-2 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
            <div className="flex items-center justify-between gap-2">
              <span className="px-3 py-1 rounded-full text-[11px] font-black bg-amber-500/20 text-amber-300 border border-amber-400/40 uppercase tracking-widest inline-flex items-center gap-1.5 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{trVedic(panchang.samvat)}</span>
              </span>
              <span className="text-xs font-black text-amber-200/90 font-mono tracking-wider">
                {trVedic(panchang.paksha)} • {trVedic(panchang.masa)}
              </span>
            </div>

            <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-[#2D1609]/95 via-[#44220E]/90 to-[#2A1407]/95 border-2 border-amber-500/40 shadow-2xl text-center relative overflow-hidden backdrop-blur-xl my-auto">
              <div className="text-xs font-black uppercase tracking-widest text-amber-300/80 font-sans mb-2">
                ॥ {t('panchang.tithi', 'तिथि')} ॥
              </div>

              <h2 className="text-3xl sm:text-4xl font-black font-granth text-[#FFE6B3] tracking-wide drop-shadow-md">
                {trVedic(panchang.tithi)}
              </h2>

              {panchang.tithiSpan && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 mt-3 rounded-full bg-white/10 text-amber-200 text-xs font-bold border border-white/10">
                  <Clock className="w-3.5 h-3.5 text-amber-300" />
                  <span>{t('panchang.endsAt', 'समाप्ति')}: {fmt(panchang.tithiSpan.end)}</span>
                </div>
              )}

              <div className="space-y-1 pt-3">
                <div className="flex items-center justify-between text-[11px] font-bold text-amber-200/80">
                  <span>{t('panchang.elapsed', 'व्यतीत मान')}</span>
                  <span className="font-mono text-amber-300 font-extrabold">
                    {(panchang.tithiProgress * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden p-0.5 border border-amber-500/30">
                  <div
                    className="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300 h-full rounded-full transition-all duration-500 shadow-xs"
                    style={{ width: `${Math.min(100, Math.max(5, panchang.tithiProgress * 100))}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="p-2.5 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md text-center text-xs text-amber-200 font-bold">
              <span>📅 {trWeekday(panchang.weekday)}, {formattedDate}</span>
            </div>
          </div>
        )}

        {/* ===================================================================== */}
        {/* SLIDE 1: 🕉️ TITHI (Part 2/2) — BLESSINGS & MANTRA */}
        {/* ===================================================================== */}
        {currentSlide === 1 && (
          <div className="h-full flex flex-col justify-between py-2 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full text-[11px] font-black bg-amber-500/20 text-amber-300 border border-amber-400/40 uppercase tracking-widest inline-flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{t('panchang.tithi', 'तिथि संकल्प')}</span>
              </span>
              <span className="text-xs font-mono text-amber-200 font-bold">
                भाग २ / २
              </span>
            </div>

            <div className="p-5 rounded-3xl bg-gradient-to-br from-[#2D1609]/95 via-[#44220E]/90 to-[#2A1407]/95 border-2 border-amber-500/40 shadow-2xl text-center relative overflow-hidden backdrop-blur-xl my-auto space-y-4">
              <div className="text-amber-300 font-black text-sm font-granth tracking-wide border-b border-amber-500/30 pb-2">
                ॥ ॐ श्री गणेशाय नमः ॥
              </div>

              <p className="text-sm font-serif text-[#FFE6B3] italic leading-relaxed">
                "शुभं करोति कल्याणमारोग्यं धनसंपदा।<br />शत्रुबुद्धिविनाशाय दीपज्योतिर्नमोऽस्तुते॥"
              </p>

              <div className="p-3 rounded-2xl bg-black/40 border border-amber-500/30 text-left space-y-1 text-xs">
                <div className="font-bold text-amber-300">🌸 दैनिक साधना मार्गदर्शन:</div>
                <div className="text-[#FAF2E4]/85 leading-snug">
                  {t('panchang.storyBlessing', 'आज का दिन आपके जीवन में धर्म, अर्थ, काम और मोक्ष के संतुलन को प्रदीप्त करे।')}
                </div>
              </div>
            </div>

            <div className="p-2.5 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md text-center text-xs text-amber-300 font-bold">
              <span>सर्व मंगल मांगल्ये शिवे सर्वार्थ साधिके</span>
            </div>
          </div>
        )}

        {/* ===================================================================== */}
        {/* SLIDE 2: 🌟 NAKSHATRA (Part 1/2) — NAKSHATRA & PADA */}
        {/* ===================================================================== */}
        {currentSlide === 2 && (
          <div className="h-full flex flex-col justify-between py-2 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full text-[11px] font-black bg-amber-500/20 text-amber-300 border border-amber-400/40 uppercase tracking-widest inline-flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-amber-400" />
                <span>{t('panchang.nakshatra', 'नक्षत्र')} (1/2)</span>
              </span>
              <span className="text-xs font-black text-amber-200/90 font-mono">
                {t('panchang.pada', 'चरण')} {panchang.pada} / 4
              </span>
            </div>

            <div className="p-5 rounded-3xl bg-gradient-to-br from-[#2D1609]/95 via-[#44220E]/90 to-[#2A1407]/95 border-2 border-amber-500/40 shadow-2xl text-center relative overflow-hidden backdrop-blur-xl my-auto space-y-3">
              <div className="text-xs font-black uppercase tracking-widest text-amber-300/80 font-sans">
                ॥ {t('panchang.nakshatra', 'नक्षत्र')} ॥
              </div>

              <h2 className="text-3xl sm:text-4xl font-black font-granth text-[#FFE6B3] tracking-wide">
                {trVedic(panchang.nakshatra)}
              </h2>

              {panchang.nakshatraSpan && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-amber-200 text-xs font-bold border border-white/10">
                  <Clock className="w-3.5 h-3.5 text-amber-300" />
                  <span>{t('panchang.endsAt', 'समाप्ति')}: {fmt(panchang.nakshatraSpan.end)}</span>
                </div>
              )}

              <div className="pt-2">
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 4].map((p) => (
                    <div
                      key={p}
                      className={`py-2 rounded-xl text-xs font-black text-center transition-all ${
                        panchang.pada === p
                          ? 'bg-gradient-to-tr from-amber-500 to-yellow-400 text-stone-950 shadow-md scale-105 border-2 border-white'
                          : 'bg-black/30 text-stone-400 border border-white/10'
                      }`}
                    >
                      चरण {p}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-2.5 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md text-center text-xs text-amber-200/90">
              <span>{panchang.nakshatraNumber}/27 वैदिक नक्षत्र मंडल</span>
            </div>
          </div>
        )}

        {/* ===================================================================== */}
        {/* SLIDE 3: ♈ NAKSHATRA (Part 2/2) — RASHI & LORDS */}
        {/* ===================================================================== */}
        {currentSlide === 3 && (
          <div className="h-full flex flex-col justify-between py-2 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full text-[11px] font-black bg-amber-500/20 text-amber-300 border border-amber-400/40 uppercase tracking-widest inline-flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span>{t('panchang.moonAndSunSign', 'राशि व खगोल')} (2/2)</span>
              </span>
              <span className="text-xs font-mono text-amber-200 font-bold">
                भाग २ / २
              </span>
            </div>

            <div className="space-y-3 my-auto">
              <div className="p-4 rounded-3xl bg-gradient-to-br from-[#2D1609]/95 via-[#44220E]/90 to-[#2A1407]/95 border-2 border-amber-500/40 shadow-xl backdrop-blur-xl">
                <div className="text-[11px] font-bold text-amber-300 uppercase">🌙 {t('panchang.moonSign', 'चन्द्र राशि (जन्म राशि आधार)')}</div>
                <div className="text-2xl font-black font-granth text-white mt-1">{trRashi(panchang.lunarRashi)}</div>
                <div className="text-xs text-amber-200/70 mt-1">मन, भावना एवं मानसिक तरंगों का नियामक</div>
              </div>

              <div className="p-4 rounded-3xl bg-gradient-to-br from-[#2D1609]/95 via-[#44220E]/90 to-[#2A1407]/95 border-2 border-amber-500/40 shadow-xl backdrop-blur-xl">
                <div className="text-[11px] font-bold text-amber-300 uppercase">☀️ {t('panchang.sunSign', 'सूर्य राशि (सौर संक्रान्ति)')}</div>
                <div className="text-2xl font-black font-granth text-white mt-1">{trRashi(panchang.solarRashi)}</div>
                <div className="text-xs text-amber-200/70 mt-1">आत्मा, ऊर्जा, स्वास्थ्य व यश का कारक</div>
              </div>
            </div>

            <div className="p-2.5 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md text-center text-xs text-amber-200 font-bold">
              <span>🌅 सूर्योदय {fmt(solar.sunrise)} • 🌇 सूर्यास्त {fmt(solar.sunset)}</span>
            </div>
          </div>
        )}

        {/* ===================================================================== */}
        {/* SLIDE 4: ☯️ YOGA & KARANA */}
        {/* ===================================================================== */}
        {currentSlide === 4 && (
          <div className="h-full flex flex-col justify-between py-2 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full text-[11px] font-black bg-amber-500/20 text-amber-300 border border-amber-400/40 uppercase tracking-widest inline-flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>{t('panchang.yoga', 'योग एवं करण')}</span>
              </span>
              <span className="text-xs font-bold text-amber-200 font-mono">
                27 योग • 11 करण
              </span>
            </div>

            <div className="space-y-3 my-auto">
              <div className="p-4 rounded-3xl bg-gradient-to-br from-[#2D1609]/95 via-[#44220E]/90 to-[#2A1407]/95 border-2 border-amber-500/40 shadow-xl backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-amber-300/80">
                    ☯️ {t('panchang.yoga', 'दैनिक योग')}
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-mono font-bold">
                    {panchang.yogaNumber}/27
                  </span>
                </div>
                <h3 className="text-2xl font-black font-granth text-[#FFE6B3] mt-1">
                  {trVedic(panchang.yoga)}
                </h3>
                {panchang.yogaSpan && (
                  <div className="mt-1.5 text-xs text-amber-200/80 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-400" />
                    <span>{t('panchang.endsAt', 'समाप्ति')}: {fmt(panchang.yogaSpan.end)}</span>
                  </div>
                )}
              </div>

              <div className="p-4 rounded-3xl bg-gradient-to-br from-[#2D1609]/95 via-[#44220E]/90 to-[#2A1407]/95 border-2 border-amber-500/40 shadow-xl backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-amber-300/80">
                    ⚡ {t('panchang.karana', 'सक्रिय करण (आधा तिथि मान)')}
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-mono font-bold">
                    करण {panchang.karanaNumber}
                  </span>
                </div>
                <h3 className="text-2xl font-black font-granth text-[#FFE6B3] mt-1">
                  {trVedic(panchang.karana)}
                </h3>
                {panchang.karanaSpan && (
                  <div className="mt-1.5 text-xs text-amber-200/80 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-400" />
                    <span>{t('panchang.endsAt', 'समाप्ति')}: {fmt(panchang.karanaSpan.end)}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="p-2.5 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md text-center text-xs text-amber-200">
              <span>योग और करण दैनिक कार्यों में सिद्धि का निर्धारण करते हैं</span>
            </div>
          </div>
        )}

        {/* ===================================================================== */}
        {/* SLIDE 5: ✨ SHUBH MUHURAT (ABHIJIT & BRAHMA) */}
        {/* ===================================================================== */}
        {currentSlide === 5 && (
          <div className="h-full flex flex-col justify-between py-2 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full text-[11px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 uppercase tracking-widest inline-flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>{t('panchang.muhurat', 'शुभ मुहूर्त काल')}</span>
              </span>
              <span className="text-xs font-bold text-emerald-200">
                मांगलिक वेला
              </span>
            </div>

            <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-950/90 via-emerald-900/80 to-[#1A3320]/90 border-2 border-emerald-400/50 shadow-2xl backdrop-blur-xl my-auto space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">
                  🌟 {t('panchang.abhijit', 'सर्वश्रेष्ठ अभिजित मुहूर्त')}
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-200 border border-emerald-400/40 text-[11px] font-black">
                  अति शुभ
                </span>
              </div>

              <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-100">
                {abhijitWindow && weekdayNum !== 3 ? (
                  `${fmt(abhijitWindow.start)} - ${fmt(abhijitWindow.end)}`
                ) : (
                  t('panchang.notToday', 'बुधवार होने से आज वर्जित')
                )}
              </div>

              <p className="text-xs text-emerald-200/85 leading-snug">
                समस्त नवीन कार्य, व्यापार, यात्रा व अनुबंध हेतु सर्वोत्तम मुहूर्त काल।
              </p>

              <div className="pt-2 border-t border-emerald-500/30 flex items-center justify-between text-xs text-emerald-200">
                <span className="font-bold">🌅 {t('panchang.brahmaMuhurat', 'ब्रह्म मुहूर्त')}:</span>
                <span className="font-mono font-black text-white">
                  {brahmaWindow ? `${fmt(brahmaWindow.start)} - ${fmt(brahmaWindow.end)}` : '04:45 - 05:35'}
                </span>
              </div>
            </div>

            <div className="p-2.5 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md text-center text-xs text-emerald-300 font-bold">
              <span>शुभ कार्य सदैव अभिजित व शुभ चौघड़िया में प्रारंभ करें</span>
            </div>
          </div>
        )}

        {/* ===================================================================== */}
        {/* SLIDE 6: ⚠️ ASHUBH KAAL & DISHA SHOOL */}
        {/* ===================================================================== */}
        {currentSlide === 6 && (
          <div className="h-full flex flex-col justify-between py-2 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full text-[11px] font-black bg-rose-500/20 text-rose-300 border border-rose-400/40 uppercase tracking-widest inline-flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-rose-400" />
                <span>{t('panchang.rahuKaal', 'राहुकाल व दिशाशूल')}</span>
              </span>
              <span className="text-xs font-bold text-rose-200">
                सावधानी वेला
              </span>
            </div>

            <div className="space-y-3 my-auto">
              <div className="p-4 rounded-3xl bg-gradient-to-br from-rose-950/90 via-rose-900/80 to-[#331515]/90 border-2 border-rose-400/50 shadow-xl backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-rose-300">
                    ⚠️ {t('panchang.rahuKaal', 'अशुभ राहुकाल')}
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-rose-400/20 text-rose-200 border border-rose-400/40 text-[10px] font-black">
                    वर्जित काल
                  </span>
                </div>
                <div className="text-xl sm:text-2xl font-black font-mono text-rose-100 mt-1">
                  {rahuWindow ? `${fmt(rahuWindow.start)} - ${fmt(rahuWindow.end)}` : '—'}
                </div>
                <div className="text-[11px] text-rose-200/80 mt-1">
                  इस समय नया निवेश, अनुबंध व यात्रा प्रारंभ करने से बचें।
                </div>
              </div>

              <div className="p-4 rounded-3xl bg-gradient-to-br from-amber-950/90 via-[#44220E]/90 to-[#2A1407]/95 border-2 border-amber-400/50 backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <div className="text-[11px] font-bold text-amber-300">
                    🧭 {t('panchang.dishaShool', 'आज का दिशाशूल')}: <span className="text-white font-black">{dishaInfo.dirHindi} ({dishaInfo.dirEnglish})</span>
                  </div>
                </div>
                <div className="mt-2 p-2 rounded-xl bg-black/40 text-[11px] text-amber-200/90 border border-amber-500/20">
                  <span className="font-bold text-amber-300">🛡️ परिहार: </span>
                  <span>{dishaInfo.remedyHindi}।</span>
                </div>
              </div>
            </div>

            <div className="p-2.5 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md text-center text-xs text-rose-300 font-bold">
              <span>राहुकाल में केवल नित्य कर्म व मंत्र जप हितकारी होते हैं</span>
            </div>
          </div>
        )}

        {/* ===================================================================== */}
        {/* SLIDE 7: 🛡️ PANCHAK, BHADRA & SPECIAL YOGAS */}
        {/* ===================================================================== */}
        {currentSlide === 7 && (
          <div className="h-full flex flex-col justify-between py-2 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full text-[11px] font-black bg-amber-500/20 text-amber-300 border border-amber-400/40 uppercase tracking-widest inline-flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>{t('panchang.panchakBhadra', 'पञ्चक, भद्रा व विशेष योग')}</span>
              </span>
              <span className="text-xs font-bold text-amber-200">
                ८ / ८
              </span>
            </div>

            <div className="space-y-2.5 my-auto">
              <div className={`p-3.5 rounded-2xl border-2 backdrop-blur-xl ${
                panchak.isActive
                  ? 'bg-amber-950/90 border-amber-400/60'
                  : 'bg-emerald-950/90 border-emerald-400/50'
              }`}>
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-amber-300">⚡ {t('panchang.panchak', 'पञ्चक')}: {panchak.isActive ? trVedic(panchak.typeNameHindi) : t('panchang.noPanchak', 'पञ्चक मुक्त')}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white">{panchak.isActive ? 'सक्रिय' : 'शुभ'}</span>
                </div>
                <p className="text-[11px] text-[#FAF2E4]/80 mt-1 leading-tight">
                  {panchak.isActive ? 'काष्ठ संग्रह, दक्षिण यात्रा व छत ढालने में सावधानी।' : 'आज कोई पञ्चक दोष नहीं है।'}
                </p>
              </div>

              <div className={`p-3.5 rounded-2xl border-2 backdrop-blur-xl ${
                bhadra.isActive && bhadra.nature === 'varjya'
                  ? 'bg-rose-950/90 border-rose-400/60'
                  : 'bg-emerald-950/90 border-emerald-400/50'
              }`}>
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-amber-300">🛡️ {t('panchang.bhadra', 'भद्रा')}: {bhadra.isActive ? trVedic(bhadra.vas) : t('panchang.noBhadra', 'भद्रा मुक्त')}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white">{bhadra.isActive ? (bhadra.nature === 'varjya' ? 'वर्जित' : 'कल्याणकारी') : 'रहित'}</span>
                </div>
              </div>

              {specialYogas.length > 0 && (
                <div className="p-2.5 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-200 text-xs flex items-center justify-between">
                  <span className="font-bold">✨ {specialYogas.map((y) => trVedic(y.name)).join(' • ')}</span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-400 text-stone-950 font-black text-[10px]">शुभ योग</span>
                </div>
              )}
            </div>

            <div className="pt-1">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownloadTodayBhojpatra();
                }}
                disabled={isDownloadingPdf}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-[#8f2121] via-[#A82828] to-[#8f2121] text-[#fdf8eb] font-black text-xs rounded-2xl transition flex items-center justify-center gap-2 shadow-lg cursor-pointer active:scale-97 border border-amber-500/40"
              >
                <Download className="w-4 h-4 text-amber-300" />
                <span>{isDownloadingPdf ? t('common.loading', 'तैयार…') : t('panchang.bhojpatraPdfBtn', '📥 भोजपत्र PDF डाउनलोड')}</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* ========================================================================= */}
      {/* 3. BOTTOM STORY SELECTOR STRIP & CONTROLS */}
      {/* ========================================================================= */}
      <footer className="relative z-30 px-3 pb-1 shrink-0 max-w-lg mx-auto w-full">
        {/* Quick Icon Selector Pills */}
        <div className="flex items-center justify-between gap-1 p-1 bg-black/50 backdrop-blur-xl rounded-2xl border border-white/10 shadow-lg">
          {SLIDES_META.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => handleSelectSlide(s.id)}
              className={`flex-1 py-1 px-0.5 rounded-xl text-[10px] font-black transition-all flex flex-col items-center justify-center cursor-pointer active:scale-95 ${
                currentSlide === s.id
                  ? 'bg-gradient-to-tr from-amber-500 to-yellow-400 text-stone-950 font-extrabold shadow-md scale-105'
                  : 'text-stone-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <span className="text-xs leading-none">{s.icon}</span>
              <span className="mt-0.5 truncate tracking-tighter text-[8px] font-sans">{s.id + 1}</span>
            </button>
          ))}
        </div>

        {/* Date Stepper Hint */}
        <div className="flex items-center justify-between text-[10px] font-semibold text-amber-200/70 mt-1 px-1">
          <div className="flex items-center gap-1 cursor-pointer hover:text-amber-200" onClick={handlePrevDay}>
            <span>◀ {t('common.prev', 'पिछला दिन')}</span>
          </div>
          <div className="flex items-center gap-1">
            <span>👈 टैप या स्वाइप करें 👉</span>
          </div>
          <div className="flex items-center gap-1 cursor-pointer hover:text-amber-200" onClick={handleNextDay}>
            <span>{t('common.next', 'अगला दिन')} ▶</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
