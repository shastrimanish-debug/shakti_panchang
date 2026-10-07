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
import { speakUma, stopUmaSpeech, isUmaSpeaking } from '../lib/umaSpeech';
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
  Moon,
  Compass,
  Clock,
  Shield,
  ShieldCheck,
  AlertTriangle,
  Flame,
  Star,
  Check,
  Download,
  Calendar,
  Layers,
  Zap,
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
}

const TOTAL_SLIDES = 6;
const SLIDE_DURATION_MS = 6500; // 6.5s per slide

export const PanchangStoryView: React.FC<PanchangStoryViewProps> = ({
  panchang,
  locationName = 'उज्जैन',
  currentDate,
  onDateChange,
  onOpenLocationModal,
  onOpenUmaModal,
  onOpenWhatsAppPanchang,
  onSwitchToClassicView,
  latitude = 23.1765,
  longitude = 75.7885,
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

  // Day & Night duration
  const dayMinutes = Math.round((solar.sunset.getTime() - solar.sunrise.getTime()) / 60000);
  const nightMinutes = Math.round((solar.nextSunrise.getTime() - solar.sunset.getTime()) / 60000);
  const dayHoursStr = `${Math.floor(dayMinutes / 60)}h ${dayMinutes % 60}m`;
  const nightHoursStr = `${Math.floor(nightMinutes / 60)}h ${nightMinutes % 60}m`;

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

  // Story Titles & Icons for tabs
  const SLIDE_META = [
    { id: 0, titleKey: 'panchang.storyTithi', label: t('panchang.tithi', 'तिथि'), icon: '🪔' },
    { id: 1, titleKey: 'panchang.storyNakshatra', label: t('panchang.nakshatra', 'नक्षत्र'), icon: '🌟' },
    { id: 2, titleKey: 'panchang.storyYoga', label: t('panchang.yoga', 'योग व करण'), icon: '☯️' },
    { id: 3, titleKey: 'panchang.storyMuhurat', label: t('panchang.muhurat', 'मुहूर्त'), icon: '✨' },
    { id: 4, titleKey: 'panchang.storyKhagol', label: t('panchang.khagol', 'खगोल'), icon: '🌅' },
    { id: 5, titleKey: 'panchang.storyPanchak', label: t('panchang.panchak', 'पञ्चक व भद्रा'), icon: '🛡️' },
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

    const interval = 50; // update every 50ms
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
  const touchStartTimeRef = useRef<number>(0);

  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    setIsPaused(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    touchStartXRef.current = clientX;
    touchStartTimeRef.current = Date.now();
  };

  const handleTouchEnd = (e: React.TouchEvent | React.MouseEvent) => {
    setIsPaused(false);
    if (touchStartXRef.current === null) return;

    const clientX = 'changedTouches' in e ? e.changedTouches[0].clientX : (e as React.MouseEvent).clientX;
    const diffX = clientX - touchStartXRef.current;
    const elapsed = Date.now() - touchStartTimeRef.current;

    // Swipe detection
    if (Math.abs(diffX) > 40 && elapsed < 400) {
      if (diffX < 0) {
        handleNextSlide();
      } else {
        handlePrevSlide();
      }
      touchStartXRef.current = null;
      return;
    }

    // Tap detection (left 35% -> prev, right 65% -> next)
    if (elapsed < 300) {
      const screenWidth = window.innerWidth || 360;
      if (clientX < screenWidth * 0.35) {
        handlePrevSlide();
      } else {
        handleNextSlide();
      }
    }
    touchStartXRef.current = null;
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

  // Voice narration for current slide
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
      speechText = `आज का नक्षत्र ${panchang.nakshatra}, चरण ${panchang.pada}। नक्षत्र समाप्ति ${panchang.nakshatraSpan ? fmt(panchang.nakshatraSpan.end) : ''}।`;
    } else if (currentSlide === 2) {
      speechText = `आज का योग ${panchang.yoga}, और करण ${panchang.karana} है।`;
    } else if (currentSlide === 3) {
      speechText = `आज का शुभ अभिजित मुहूर्त ${abhijitWindow ? `${fmt(abhijitWindow.start)} से ${fmt(abhijitWindow.end)} तक` : 'आज नहीं है'}। राहुकाल ${rahuWindow ? `${fmt(rahuWindow.start)} से ${fmt(rahuWindow.end)} तक` : 'नहीं है'}।`;
    } else if (currentSlide === 4) {
      speechText = `सूर्योदय ${fmt(solar.sunrise)}, सूर्यास्त ${fmt(solar.sunset)}। चन्द्र राशि ${panchang.lunarRashi}, सूर्य राशि ${panchang.solarRashi}। आज का दिशाशूल ${dishaInfo.dirHindi} दिशा में है।`;
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

  const formattedDate = panchang.date.toLocaleDateString(
    language === 'en' ? 'en-US' : language === 'gu' ? 'gu-IN' : 'hi-IN',
    { day: 'numeric', month: 'short' }
  );

  return (
    <div
      className="relative w-full h-[100dvh] max-h-[100dvh] flex flex-col justify-between overflow-hidden select-none bg-gradient-to-b from-[#1C0F08] via-[#2D160C] to-[#140804] text-[#FAF2E4] font-sans touch-manipulation"
      style={{
        paddingTop: 'max(0.5rem, env(safe-area-inset-top, 0px))',
        paddingBottom: 'max(4.5rem, calc(env(safe-area-inset-bottom, 0px) + 3.8rem))',
      }}
    >
      <PdfSuccessModal info={pdfSuccessInfo} onClose={() => setPdfSuccessInfo(null)} />

      {/* Ambient background divine glow rings */}
      <div className="absolute top-1/4 -left-20 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 -right-20 w-80 h-80 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* ========================================================================= */}
      {/* 1. TOP STATUS / INSTAGRAM STORY PROGRESS BARS */}
      {/* ========================================================================= */}
      <div className="relative z-30 px-3 pt-1 pb-1.5 shrink-0">
        <div className="flex items-center gap-1.5 w-full max-w-lg mx-auto">
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

        {/* Top Floating Control Bar */}
        <div className="flex items-center justify-between gap-1.5 mt-2 max-w-lg mx-auto">
          {/* Left: Day & Location Badge */}
          <div className="flex items-center gap-1.5 min-w-0">
            <div className="flex items-center bg-white/10 backdrop-blur-md rounded-full px-2.5 py-1 border border-white/15 text-xs font-bold shadow-xs">
              <span className="text-amber-400 mr-1">✦</span>
              <span className="font-extrabold text-[#FFF6E5] truncate">
                {trWeekday(panchang.weekday)}
              </span>
              <span className="text-stone-400 mx-1">•</span>
              <span className="text-amber-300 font-mono text-[11px] font-black">{formattedDate}</span>
            </div>

            {onOpenLocationModal && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenLocationModal();
                }}
                className="px-2 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/15 text-[11px] font-bold text-amber-200 hover:bg-white/20 transition truncate max-w-[100px] cursor-pointer"
                title={`Location: ${locationName}`}
              >
                📍 {locationName}
              </button>
            )}
          </div>

          {/* Right Action Icons (Voice, Pause/Play, Share, Classic Mode Switch) */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Audio Voice Narration */}
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

            {/* Pause / Play Toggle */}
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

            {/* 1-Click WhatsApp Story Share */}
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

            {/* Switch to Detailed Classic View */}
            {onSwitchToClassicView && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSwitchToClassicView();
                }}
                className="px-2 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-[#FFD88A] hover:bg-amber-500/30 text-[10px] font-black tracking-wide transition cursor-pointer flex items-center gap-1"
                title="विस्तृत ग्रन्थ व्यू देखें"
              >
                <Layers className="w-3 h-3 text-amber-300" />
                <span>ग्रन्थ व्यू</span>
              </button>
            )}
          </div>
        </div>
      </div>

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
      {/* 2. MAIN STORY SLIDE CANVAS (Interactive Tap Navigation & Zero-Scroll Fit) */}
      {/* ========================================================================= */}
      <div
        className="relative z-20 flex-1 w-full max-w-lg mx-auto px-3 py-1 flex flex-col justify-center overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleTouchStart}
        onMouseUp={handleTouchEnd}
      >
        {/* Visual Tap Indicator Pill Guides */}
        <div className="absolute inset-y-0 left-0 w-1/4 pointer-events-none z-10 flex items-center justify-start pl-2 opacity-0 hover:opacity-40 transition">
          <div className="p-2 rounded-full bg-black/40 text-white/70">
            <ChevronLeft className="w-5 h-5" />
          </div>
        </div>
        <div className="absolute inset-y-0 right-0 w-1/4 pointer-events-none z-10 flex items-center justify-end pr-2 opacity-0 hover:opacity-40 transition">
          <div className="p-2 rounded-full bg-black/40 text-white/70">
            <ChevronRight className="w-5 h-5" />
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SLIDE 0: 🪔 TITHI & VEDIC ESSENCE */}
        {/* ========================================================================= */}
        {currentSlide === 0 && (
          <div className="h-full flex flex-col justify-between py-1 animate-in fade-in zoom-in-95 duration-200">
            {/* Top Badge: Samvat & Paksha */}
            <div className="flex items-center justify-between gap-2">
              <span className="px-3 py-1 rounded-full text-[11px] font-black bg-amber-500/20 text-amber-300 border border-amber-400/40 uppercase tracking-widest inline-flex items-center gap-1.5 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{trVedic(panchang.samvat)}</span>
              </span>
              <span className="text-xs font-black text-amber-200/90 font-mono tracking-wider">
                {trVedic(panchang.paksha)} • {trVedic(panchang.masa)}
              </span>
            </div>

            {/* Centerpiece Tithi Master Glass Card */}
            <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-[#2D1609]/95 via-[#44220E]/90 to-[#2A1407]/95 border-2 border-amber-500/40 shadow-[0_8px_32px_rgba(0,0,0,0.6)] text-center relative overflow-hidden backdrop-blur-xl my-auto">
              <div className="absolute -top-12 -right-12 w-40 h-40 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-orange-500/20 rounded-full blur-2xl pointer-events-none" />

              <div className="relative z-10 space-y-3">
                <div className="text-xs font-black uppercase tracking-widest text-amber-300/80 font-sans">
                  ॥ {t('panchang.tithi', 'तिथि')} ॥
                </div>

                <h2 className="text-3xl sm:text-4xl font-black font-granth text-[#FFE6B3] tracking-wide drop-shadow-md">
                  {trVedic(panchang.tithi)}
                </h2>

                {panchang.tithiSpan && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-amber-200 text-xs font-bold border border-white/10">
                    <Clock className="w-3.5 h-3.5 text-amber-300" />
                    <span>{t('panchang.endsAt', 'समाप्ति')}: {fmt(panchang.tithiSpan.end)}</span>
                  </div>
                )}

                {/* Progress bar gauge */}
                <div className="space-y-1 pt-1">
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
            </div>

            {/* Bottom Shloka / Blessing Strip */}
            <div className="p-3 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md text-center space-y-1">
              <div className="text-amber-300 font-black text-xs font-granth tracking-wide">
                ॥ ॐ श्री गणेशाय नमः • शुभं करोति कल्याणम् ॥
              </div>
              <p className="text-[11px] text-[#FAF2E4]/80 leading-snug">
                {t('panchang.storyBlessing', 'आज का दिन आपके जीवन में धर्म, अर्थ, काम और मोक्ष के संतुलन को प्रदीप्त करे।')}
              </p>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SLIDE 1: 🌟 NAKSHATRA & PADA */}
        {/* ========================================================================= */}
        {currentSlide === 1 && (
          <div className="h-full flex flex-col justify-between py-1 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full text-[11px] font-black bg-amber-500/20 text-amber-300 border border-amber-400/40 uppercase tracking-widest inline-flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-amber-400" />
                <span>{t('panchang.nakshatra', 'नक्षत्र विज्ञान')}</span>
              </span>
              <span className="text-xs font-black text-amber-200/90 font-mono">
                {t('panchang.pada', 'चरण')} {panchang.pada} / 4
              </span>
            </div>

            {/* Master Nakshatra Card */}
            <div className="p-5 rounded-3xl bg-gradient-to-br from-[#2D1609]/95 via-[#44220E]/90 to-[#2A1407]/95 border-2 border-amber-500/40 shadow-[0_8px_32px_rgba(0,0,0,0.6)] text-center relative overflow-hidden backdrop-blur-xl my-auto">
              <div className="relative z-10 space-y-3">
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

                {/* 4 Padas Indicator Ribbon */}
                <div className="pt-2">
                  <div className="text-[11px] font-bold text-amber-300/80 mb-1.5 text-left">
                    {t('panchang.activePada', 'सक्रिय चरण')}:
                  </div>
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
            </div>

            {/* Quick Astrological Nakshatra Attributes */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md">
                <div className="text-amber-300/80 font-bold text-[10px] uppercase">{t('panchang.moonSign', 'चन्द्र राशि')}</div>
                <div className="text-sm font-black text-white mt-0.5">{trRashi(panchang.lunarRashi)}</div>
              </div>
              <div className="p-3 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md">
                <div className="text-amber-300/80 font-bold text-[10px] uppercase">{t('panchang.sunSign', 'सूर्य राशि')}</div>
                <div className="text-sm font-black text-white mt-0.5">{trRashi(panchang.solarRashi)}</div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SLIDE 2: ☯️ YOGA & KARANA */}
        {/* ========================================================================= */}
        {currentSlide === 2 && (
          <div className="h-full flex flex-col justify-between py-1 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full text-[11px] font-black bg-amber-500/20 text-amber-300 border border-amber-400/40 uppercase tracking-widest inline-flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>{t('panchang.yoga', 'योग व करण')}</span>
              </span>
              <span className="text-xs font-bold text-amber-200 font-mono">
                27 योग • 11 करण
              </span>
            </div>

            {/* Dual Cards: Yoga & Karana */}
            <div className="space-y-3 my-auto">
              {/* Yoga Card */}
              <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-[#2D1609]/95 via-[#44220E]/90 to-[#2A1407]/95 border-2 border-amber-500/40 shadow-xl backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">☯️</span>
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-amber-300/80">
                        {t('panchang.yoga', 'दैनिक योग')}
                      </div>
                      <h3 className="text-2xl font-black font-granth text-[#FFE6B3]">
                        {trVedic(panchang.yoga)}
                      </h3>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-xs font-mono font-bold">
                    {panchang.yogaNumber}/27
                  </span>
                </div>
                {panchang.yogaSpan && (
                  <div className="mt-2 text-xs text-amber-200/80 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-400" />
                    <span>{t('panchang.endsAt', 'समाप्ति')}: {fmt(panchang.yogaSpan.end)}</span>
                  </div>
                )}
              </div>

              {/* Karana Card */}
              <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-[#2D1609]/95 via-[#44220E]/90 to-[#2A1407]/95 border-2 border-amber-500/40 shadow-xl backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">⚡</span>
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-amber-300/80">
                        {t('panchang.karana', 'सक्रिय करण (आधा तिथि मान)')}
                      </div>
                      <h3 className="text-2xl font-black font-granth text-[#FFE6B3]">
                        {trVedic(panchang.karana)}
                      </h3>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-xs font-mono font-bold">
                    करण {panchang.karanaNumber}
                  </span>
                </div>
                {panchang.karanaSpan && (
                  <div className="mt-2 text-xs text-amber-200/80 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-400" />
                    <span>{t('panchang.endsAt', 'समाप्ति')}: {fmt(panchang.karanaSpan.end)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Significance Pill */}
            <div className="p-3 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md text-center text-xs text-amber-200/90">
              <span className="font-bold text-amber-300">💡 वैदिक रहस्य: </span>
              <span>योग सूर्य-चन्द्र के परस्पर सामंजस्य को और करण संकल्प सिद्धि के वेग को दर्शाता है।</span>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SLIDE 3: ✨ SHUBH MUHURAT & RAHU KAAL */}
        {/* ========================================================================= */}
        {currentSlide === 3 && (
          <div className="h-full flex flex-col justify-between py-1 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full text-[11px] font-black bg-amber-500/20 text-amber-300 border border-amber-400/40 uppercase tracking-widest inline-flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{t('panchang.muhurat', 'काल निर्णय व मुहूर्त')}</span>
              </span>
              <span className="text-xs font-bold text-amber-200 font-mono">
                {trWeekday(panchang.weekday)}
              </span>
            </div>

            {/* Dual Master Cards: Abhijit vs Rahu Kaal */}
            <div className="space-y-3 my-auto">
              {/* Abhijit Muhurat (Auspicious) */}
              <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-emerald-950/90 via-emerald-900/80 to-[#1A3320]/90 border-2 border-emerald-400/50 shadow-xl backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🌟</span>
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                        {t('panchang.abhijit', 'सर्वश्रेष्ठ अभिजित मुहूर्त')}
                      </div>
                      <div className="text-xl sm:text-2xl font-black font-mono text-emerald-100 mt-0.5">
                        {abhijitWindow && weekdayNum !== 3 ? (
                          `${fmt(abhijitWindow.start)} - ${fmt(abhijitWindow.end)}`
                        ) : (
                          t('panchang.notToday', 'बुधवार होने से आज वर्जित')
                        )}
                      </div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-400/20 text-emerald-200 border border-emerald-400/40 text-[11px] font-black">
                    अति शुभ
                  </span>
                </div>
                <div className="mt-2 text-[11px] text-emerald-200/80">
                  समस्त नवीन कार्य, यात्रा, क्रय-विक्रय व मांगलिक कार्यों के लिए सिद्धिप्रद काल।
                </div>
              </div>

              {/* Rahu Kaal (Caution) */}
              <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-rose-950/90 via-rose-900/80 to-[#331515]/90 border-2 border-rose-400/50 shadow-xl backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">⚠️</span>
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-rose-300">
                        {t('panchang.rahuKaal', 'अशुभ राहुकाल (सावधानी)')}
                      </div>
                      <div className="text-xl sm:text-2xl font-black font-mono text-rose-100 mt-0.5">
                        {rahuWindow ? `${fmt(rahuWindow.start)} - ${fmt(rahuWindow.end)}` : '—'}
                      </div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-rose-400/20 text-rose-200 border border-rose-400/40 text-[11px] font-black">
                    वर्जित काल
                  </span>
                </div>
                <div className="mt-2 text-[11px] text-rose-200/80">
                  इस समय नए कार्य का आरंभ, धन निवेश व यात्रा प्रारंभ करने से बचें।
                </div>
              </div>
            </div>

            {/* Secondary Timings Pill Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md flex items-center justify-between">
                <span className="text-amber-200 font-bold">🌅 {t('panchang.brahmaMuhurat', 'ब्रह्म मुहूर्त')}:</span>
                <span className="font-mono font-black text-white">
                  {brahmaWindow ? `${fmt(brahmaWindow.start)} - ${fmt(brahmaWindow.end)}` : '04:45 - 05:35'}
                </span>
              </div>
              <div className="p-2.5 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md flex items-center justify-between">
                <span className="text-amber-200 font-bold">🏺 {t('panchang.amritKaal', 'अमृत काल')}:</span>
                <span className="font-mono font-black text-white">
                  {amritWindow ? `${fmt(amritWindow.start)} - ${fmt(amritWindow.end)}` : 'शुभ योग'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SLIDE 4: 🌅 SUN, MOON & COSMIC DISHA SHOOL */}
        {/* ========================================================================= */}
        {currentSlide === 4 && (
          <div className="h-full flex flex-col justify-between py-1 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full text-[11px] font-black bg-amber-500/20 text-amber-300 border border-amber-400/40 uppercase tracking-widest inline-flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span>{t('panchang.solarLunar', 'सूर्य-चन्द्र व दिशाशूल')}</span>
              </span>
              <span className="text-xs font-bold text-amber-200 font-mono">
                {dayHoursStr} दिनमान
              </span>
            </div>

            {/* 4-Box Astronomical Timings */}
            <div className="space-y-3 my-auto">
              <div className="grid grid-cols-2 gap-2">
                {/* Sunrise */}
                <div className="p-4 rounded-3xl bg-gradient-to-br from-[#2D1609]/95 via-[#44220E]/90 to-[#2A1407]/95 border-2 border-amber-500/40 text-center backdrop-blur-xl">
                  <div className="text-xs font-bold text-amber-300">🌅 {t('panchang.sunrise', 'सूर्योदय')}</div>
                  <div className="text-2xl font-black font-mono text-white mt-1">{fmt(solar.sunrise)}</div>
                  <div className="text-[10px] text-amber-200/70 mt-1">उदित लग्न समय</div>
                </div>

                {/* Sunset */}
                <div className="p-4 rounded-3xl bg-gradient-to-br from-[#2D1609]/95 via-[#44220E]/90 to-[#2A1407]/95 border-2 border-amber-500/40 text-center backdrop-blur-xl">
                  <div className="text-xs font-bold text-amber-300">🌇 {t('panchang.sunset', 'सूर्यास्त')}</div>
                  <div className="text-2xl font-black font-mono text-white mt-1">{fmt(solar.sunset)}</div>
                  <div className="text-[10px] text-amber-200/70 mt-1">संध्या पूजन वेला</div>
                </div>
              </div>

              {/* Disha Shool Alert Card */}
              <div className="p-4 rounded-3xl bg-gradient-to-br from-amber-950/90 via-[#44220E]/90 to-[#2A1407]/95 border-2 border-amber-400/50 backdrop-blur-xl">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Compass className="w-5 h-5 text-amber-400" />
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
                        {t('panchang.dishaShool', 'आज का दिशाशूल')}
                      </span>
                      <h4 className="text-lg font-black text-[#FFE6B3]">
                        {dishaInfo.dirHindi} दिशा ({dishaInfo.dirEnglish})
                      </h4>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-400/40 text-[10px] font-black">
                    यात्रा में सावधानी
                  </span>
                </div>
                <div className="p-2.5 rounded-2xl bg-black/40 text-[11px] text-amber-200/90 border border-amber-500/20">
                  <span className="font-bold text-amber-300">🛡️ दोष परिहार: </span>
                  <span>{dishaInfo.remedyHindi}।</span>
                </div>
              </div>
            </div>

            {/* Bottom Solar / Lunar Signs */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md text-center">
                <span className="text-amber-200 text-[10px] uppercase font-bold">🌙 {t('panchang.moonSign', 'चन्द्र राशि')}: </span>
                <span className="font-black text-white ml-1">{trRashi(panchang.lunarRashi)}</span>
              </div>
              <div className="p-2.5 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md text-center">
                <span className="text-amber-200 text-[10px] uppercase font-bold">☀️ {t('panchang.sunSign', 'सूर्य राशि')}: </span>
                <span className="font-black text-white ml-1">{trRashi(panchang.solarRashi)}</span>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SLIDE 5: 🛡️ PANCHAK, BHADRA & SPECIAL YOGAS */}
        {/* ========================================================================= */}
        {currentSlide === 5 && (
          <div className="h-full flex flex-col justify-between py-1 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full text-[11px] font-black bg-amber-500/20 text-amber-300 border border-amber-400/40 uppercase tracking-widest inline-flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>{t('panchang.panchakBhadra', 'पञ्चक, भद्रा व शुभ योग')}</span>
              </span>
              <span className="text-xs font-bold text-amber-200">
                विशेष योग
              </span>
            </div>

            {/* Panchak & Bhadra Display */}
            <div className="space-y-3 my-auto">
              {/* Panchak Card */}
              <div className={`p-4 rounded-3xl border-2 backdrop-blur-xl ${
                panchak.isActive
                  ? 'bg-gradient-to-br from-amber-950/95 via-amber-900/80 to-[#2A1407]/95 border-amber-400/60 shadow-xl'
                  : 'bg-gradient-to-br from-emerald-950/90 via-emerald-900/80 to-[#142B1A]/90 border-emerald-400/50 shadow-xl'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">⚡</span>
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
                        {t('panchang.panchak', 'पञ्चक निर्णय')}
                      </div>
                      <h4 className="text-xl font-black font-granth text-white">
                        {panchak.isActive ? trVedic(panchak.typeNameHindi) : t('panchang.noPanchak', 'पञ्चक मुक्त')}
                      </h4>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-black border ${
                    panchak.isActive
                      ? 'bg-amber-500/20 text-amber-300 border-amber-400/40'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
                  }`}>
                    {panchak.isActive ? 'पञ्चक प्रभावी' : 'सर्वकार्य सिद्धि'}
                  </span>
                </div>
                <p className="text-[11px] text-[#FAF2E4]/80 mt-2 leading-relaxed">
                  {panchak.isActive
                    ? 'छत ढालना, चारपाई बुनना, दक्षिण दिशा यात्रा व तृण काष्ठ संग्रह में सावधानी बरतें।'
                    : 'आज कोई पञ्चक दोष नहीं है। सभी गृह निर्माण व मांगलिक कार्य निर्बाध संपन्न किए जा सकते हैं।'}
                </p>
              </div>

              {/* Bhadra Card */}
              <div className={`p-4 rounded-3xl border-2 backdrop-blur-xl ${
                bhadra.isActive && bhadra.nature === 'varjya'
                  ? 'bg-gradient-to-br from-rose-950/95 via-rose-900/80 to-[#2A0C0C]/95 border-rose-400/60 shadow-xl'
                  : 'bg-gradient-to-br from-emerald-950/90 via-emerald-900/80 to-[#142B1A]/90 border-emerald-400/50 shadow-xl'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🛡️</span>
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
                        {t('panchang.bhadra', 'भद्रा वास निर्णय')}
                      </div>
                      <h4 className="text-xl font-black font-granth text-white">
                        {bhadra.isActive ? `${trVedic(bhadra.vas)}` : t('panchang.noBhadra', 'भद्रा मुक्त')}
                      </h4>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-black border ${
                    bhadra.isActive && bhadra.nature === 'varjya'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-400/40'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
                  }`}>
                    {bhadra.isActive ? (bhadra.nature === 'varjya' ? 'पृथ्वी वास (वर्जित)' : 'पाताल/स्वर्ग (शुभ)') : 'भद्रा रहित'}
                  </span>
                </div>
                <p className="text-[11px] text-[#FAF2E4]/80 mt-2 leading-relaxed">
                  {bhadra.isActive
                    ? bhadra.nature === 'varjya'
                      ? 'पृथ्वी लोक में भद्रा होने से विवाह, मुंडन व गृहप्रवेश जैसे मंगल कार्य वर्जित हैं।'
                      : 'स्वर्ग या पाताल में भद्रा वास होने से धन धान्य और कल्याण की वृद्धि होती है।'
                    : 'आज भद्रा का कोई प्रभाव नहीं है। शुभ व मांगलिक कार्य संपन्न करें।'}
                </p>
              </div>

              {/* Special Yogas Ribbon */}
              {specialYogas.length > 0 && (
                <div className="p-3 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-200 text-xs flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-1.5 font-black text-[#FFE6B3]">
                    <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>{specialYogas.map((y) => trVedic(y.name)).join(' • ')}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-amber-400 text-stone-950 font-black text-[10px]">
                    अति दुर्लभ
                  </span>
                </div>
              )}
            </div>

            {/* Bottom Bhojpatra PDF Action Button */}
            <div className="pt-1">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownloadTodayBhojpatra();
                }}
                disabled={isDownloadingPdf}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-[#8f2121] via-[#A82828] to-[#8f2121] hover:from-[#7a1b1b] hover:to-[#7a1b1b] text-[#fdf8eb] font-black text-xs rounded-2xl transition flex items-center justify-center gap-2 shadow-lg cursor-pointer active:scale-97 border border-amber-500/40"
              >
                <Download className="w-4 h-4 text-amber-300" />
                <span>{isDownloadingPdf ? t('common.loading', 'भोजपत्र तैयार हो रहा है…') : t('panchang.bhojpatraPdfBtn', '📥 संपूर्ण पंचांग भोजपत्र PDF डाउनलोड करें')}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 3. BOTTOM INSTAGRAM STORY QUICK-SWITCH STRIP */}
      {/* ========================================================================= */}
      <div className="relative z-30 px-3 pb-2 shrink-0 max-w-lg mx-auto w-full">
        {/* Quick Icon Selector Pills */}
        <div className="flex items-center justify-between gap-1 p-1 bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 shadow-lg">
          {SLIDE_META.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => handleSelectSlide(s.id)}
              className={`flex-1 py-1.5 px-1 rounded-xl text-[10px] font-black transition-all flex flex-col items-center justify-center cursor-pointer active:scale-95 ${
                currentSlide === s.id
                  ? 'bg-gradient-to-tr from-amber-500 to-yellow-400 text-stone-950 font-extrabold shadow-md scale-105'
                  : 'text-stone-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <span className="text-sm leading-none">{s.icon}</span>
              <span className="mt-0.5 truncate tracking-tighter text-[9px]">{s.label}</span>
            </button>
          ))}
        </div>

        {/* Story Navigation Hint Bar */}
        <div className="flex items-center justify-between text-[10px] font-semibold text-amber-200/60 mt-1.5 px-1">
          <div className="flex items-center gap-1 cursor-pointer hover:text-amber-200" onClick={handlePrevDay}>
            <span>◀ {t('common.prev', 'पिछला दिन')}</span>
          </div>
          <div className="flex items-center gap-2">
            <span>👈 पिछला • {currentSlide + 1}/{TOTAL_SLIDES} • अगला 👉</span>
          </div>
          <div className="flex items-center gap-1 cursor-pointer hover:text-amber-200" onClick={handleNextDay}>
            <span>{t('common.next', 'अगला दिन')} ▶</span>
          </div>
        </div>
      </div>
    </div>
  );
};
