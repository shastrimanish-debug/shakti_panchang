import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Share2,
  Sparkles,
  MapPin,
  Calendar,
  Layers,
} from 'lucide-react';
import { useLanguage } from '../i18n';
import { speakUma, stopUmaSpeech } from '../lib/umaSpeech';

export interface StorySlideItem {
  id: string | number;
  title: string;
  subtitle?: string;
  badge?: string;
  icon?: string | React.ReactNode;
  content: React.ReactNode;
  voiceText?: string;
}

export interface UniversalStoryDeckProps {
  slides: StorySlideItem[];
  currentSlideIndex?: number;
  onSlideIndexChange?: (index: number) => void;
  headerTitle: string;
  headerIcon?: string | React.ReactNode;
  chapterNumber?: number | string;
  locationName?: string;
  currentDate?: Date;
  onDateChange?: (d: Date) => void;
  onOpenLocation?: () => void;
  onOpenUma?: (query?: string) => void;
  onShare?: () => void;
  extraHeaderActions?: React.ReactNode;
  durationMs?: number;
  autoPlay?: boolean;
  onPrevChapter?: () => void;
  onNextChapter?: () => void;
  prevChapterLabel?: string;
  nextChapterLabel?: string;
}

export const UniversalStoryDeck: React.FC<UniversalStoryDeckProps> = ({
  slides,
  currentSlideIndex,
  onSlideIndexChange,
  headerTitle,
  headerIcon = '🕉️',
  chapterNumber,
  locationName,
  currentDate,
  onDateChange,
  onOpenLocation,
  onOpenUma,
  onShare,
  extraHeaderActions,
  durationMs = 7500,
  autoPlay = true,
  onPrevChapter,
  onNextChapter,
  prevChapterLabel,
  nextChapterLabel,
}) => {
  const { t, language } = useLanguage();
  const [internalSlide, setInternalSlide] = useState<number>(0);
  const activeSlideIndex = currentSlideIndex !== undefined ? currentSlideIndex : internalSlide;

  const [progress, setProgress] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(!autoPlay);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  const totalSlides = Math.max(slides.length, 1);
  const currentSlideSafe = Math.min(Math.max(activeSlideIndex, 0), totalSlides - 1);
  const currentSlideData = slides[currentSlideSafe] || slides[0];

  const setSlideSafe = useCallback((newIdx: number) => {
    if (onSlideIndexChange) {
      onSlideIndexChange(newIdx);
    } else {
      setInternalSlide(newIdx);
    }
    setProgress(0);
  }, [onSlideIndexChange]);

  const handleNextSlide = useCallback(() => {
    if (currentSlideSafe < totalSlides - 1) {
      setSlideSafe(currentSlideSafe + 1);
    } else if (onNextChapter) {
      onNextChapter();
    } else {
      setSlideSafe(0);
    }
  }, [currentSlideSafe, totalSlides, setSlideSafe, onNextChapter]);

  const handlePrevSlide = useCallback(() => {
    if (currentSlideSafe > 0) {
      setSlideSafe(currentSlideSafe - 1);
    } else if (onPrevChapter) {
      onPrevChapter();
    } else {
      setSlideSafe(totalSlides - 1);
    }
  }, [currentSlideSafe, totalSlides, setSlideSafe, onPrevChapter]);

  // Story Progress Timer
  useEffect(() => {
    if (isPaused) return;

    const intervalMs = 50;
    const step = (intervalMs / durationMs) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          handleNextSlide();
          return 0;
        }
        return prev + step;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [currentSlideSafe, isPaused, durationMs, handleNextSlide]);

  // Touch & Swipe handlers (horizontal swipe flips, vertical scroll allowed)
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
    setIsPaused(!autoPlay);
    if (touchStartXRef.current === null) return;

    const clientX = 'changedTouches' in e ? e.changedTouches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'changedTouches' in e ? e.changedTouches[0].clientY : (e as React.MouseEvent).clientY;
    const diffX = clientX - touchStartXRef.current;
    const diffY = touchStartYRef.current !== null ? clientY - touchStartYRef.current : 0;
    const elapsed = Date.now() - touchStartTimeRef.current;

    // If user scrolled vertically, strictly do NOT change slides
    if (Math.abs(diffY) > 25) {
      touchStartXRef.current = null;
      touchStartYRef.current = null;
      return;
    }

    // Swipe horizontal detection - must be dominant horizontal motion
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
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNextSlide();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrevSlide();
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsPaused((p) => !p);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNextSlide, handlePrevSlide]);

  // Voice narration toggle
  const handleToggleVoice = async () => {
    if (isSpeaking) {
      stopUmaSpeech();
      setIsSpeaking(false);
      return;
    }

    const textToSpeak = currentSlideData?.voiceText || `${headerTitle}। ${currentSlideData?.title || ''}। ${currentSlideData?.subtitle || ''}`;
    setIsSpeaking(true);
    await speakUma(textToSpeak);
    setIsSpeaking(false);
  };

  // Stop speech when slide changes
  useEffect(() => {
    stopUmaSpeech();
    setIsSpeaking(false);
  }, [currentSlideSafe]);

  const dateLocale = language === 'en' ? 'en-US' : language === 'gu' ? 'gu-IN' : 'hi-IN';
  const formattedDateStr = currentDate
    ? currentDate.toLocaleDateString(dateLocale, { weekday: 'short', day: 'numeric', month: 'short' })
    : '';

  return (
    <div
      className="w-full h-full max-h-full flex flex-col justify-between overflow-hidden select-none bg-gradient-to-b from-[#FFFDF9] to-[#FBF3E6] text-[#2C180C] relative"
      onMouseDown={handleTouchStart}
      onMouseUp={handleTouchEnd}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top Segmented Story Progress Bar */}
      <div className="w-full px-2.5 pt-2 pb-1.5 flex items-center gap-1 z-30 shrink-0">
        {slides.map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setSlideSafe(idx);
            }}
            className="flex-1 h-1.5 rounded-full bg-[#E5D5C0] overflow-hidden cursor-pointer transition-all hover:h-2"
            title={`Slide ${idx + 1} / ${totalSlides}`}
          >
            <div
              className="h-full bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-400 rounded-full transition-all duration-75"
              style={{
                width:
                  idx < currentSlideSafe
                    ? '100%'
                    : idx === currentSlideSafe
                    ? `${progress}%`
                    : '0%',
              }}
            />
          </button>
        ))}
      </div>

      {/* Story Compact Header Ribbon */}
      <div className="w-full px-3 py-1 flex items-center justify-between gap-2 z-30 shrink-0 border-b border-[#E8DCCB]/60 bg-[#FFFDF9]/90 backdrop-blur-md">
        {/* Left: Chapter / Title with Icon */}
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="w-6 h-6 rounded-lg bg-[#FAF0DD] border border-[#E0CEB5] flex items-center justify-center text-xs shrink-0 shadow-2xs">
            {typeof headerIcon === 'string' ? <span>{headerIcon}</span> : headerIcon}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1 leading-none">
              {chapterNumber !== undefined && (
                <span className="text-[10px] font-black text-[#B56A00] uppercase tracking-wider">
                  #{chapterNumber}
                </span>
              )}
              <h2 className="text-xs sm:text-sm font-black font-granth text-[#2C180C] truncate">
                {headerTitle}
              </h2>
            </div>
            {currentSlideData?.subtitle && (
              <p className="text-[10px] text-[#735133] truncate font-medium mt-0.5">
                {currentSlideData.subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Center: Slide Index Badge & Location/Date Pill */}
        <div className="flex items-center gap-1 shrink-0">
          {locationName && onOpenLocation && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenLocation();
              }}
              className="px-2 py-0.5 rounded-full bg-[#FAF2E4] border border-[#DFCBB5] text-[10px] font-bold text-[#6E472A] hover:bg-[#EEDDC4] transition flex items-center gap-0.5 shadow-2xs"
            >
              <MapPin className="w-2.5 h-2.5 text-[#B56A00]" />
              <span className="max-w-[60px] truncate">{locationName}</span>
            </button>
          )}

          {formattedDateStr && (
            <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-[#FAF2E4] border border-[#DFCBB5] text-[10px] font-bold text-[#6E472A]">
              {formattedDateStr}
            </span>
          )}

          <div className="px-2 py-0.5 rounded-full bg-[#5C3A21] text-[#FAF2E4] text-[10px] font-black font-mono shadow-2xs">
            {currentSlideSafe + 1}/{totalSlides}
          </div>
        </div>

        {/* Right: Actions (Voice, Play/Pause, Share, Uma) */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleToggleVoice();
            }}
            className={`p-1.5 rounded-lg border transition cursor-pointer shadow-2xs ${
              isSpeaking
                ? 'bg-amber-500 text-stone-950 border-amber-600 animate-pulse'
                : 'bg-[#FAF0DD] text-[#5C3A21] border-[#E0CEB5] hover:bg-[#EEDDC4]'
            }`}
            title={isSpeaking ? 'उमा वाणी रोकें' : 'उमा वाणी सुनें'}
          >
            {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsPaused((p) => !p);
            }}
            className="p-1.5 rounded-lg bg-[#FAF0DD] text-[#5C3A21] border border-[#E0CEB5] hover:bg-[#EEDDC4] transition cursor-pointer shadow-2xs"
            title={isPaused ? 'चलाएं (Play)' : 'रोकें (Pause)'}
          >
            {isPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5 fill-current" />}
          </button>

          {onShare && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onShare();
              }}
              className="p-1.5 rounded-lg bg-[#FAF0DD] text-[#5C3A21] border border-[#E0CEB5] hover:bg-[#EEDDC4] transition cursor-pointer shadow-2xs"
              title="साझा करें (Share)"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
          )}

          {onOpenUma && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenUma();
              }}
              className="p-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-400 text-stone-950 border border-amber-600 font-bold transition hover:scale-105 cursor-pointer shadow-2xs"
              title="उमा परामर्श"
            >
              <Sparkles className="w-3.5 h-3.5 fill-stone-950" />
            </button>
          )}

          {extraHeaderActions}
        </div>
      </div>

      {/* Main Slide Body: Responsive, Smooth Scrolling without clipping */}
      <div className="flex-1 w-full max-w-2xl mx-auto px-2.5 sm:px-4 py-2 flex flex-col min-h-0 overflow-hidden relative z-20">
        <div
          key={`slide-${currentSlideSafe}`}
          className="w-full h-full min-h-0 flex flex-col animate-in fade-in zoom-in-95 duration-200 overflow-hidden"
        >
          {/* Slide Title & Subtitle Badge */}
          {currentSlideData?.title && (
            <div className="flex items-center justify-between gap-2 mb-2 shrink-0">
              <div className="flex items-center gap-1.5 min-w-0">
                {currentSlideData.icon && (
                  <span className="text-base shrink-0">{currentSlideData.icon}</span>
                )}
                <h3 className="text-xs sm:text-sm font-black font-granth text-[#2C180C] truncate">
                  {currentSlideData.title}
                </h3>
              </div>
              {currentSlideData.badge && (
                <span className="px-2 py-0.5 rounded-full bg-[#FAF0DD] border border-[#DFCBB5] text-[10px] font-bold text-[#8C4A00] shrink-0">
                  {currentSlideData.badge}
                </span>
              )}
            </div>
          )}

          {/* Slide Content Slot: Scrollable to read 100% of the content without truncation */}
          <div className="flex-1 w-full min-h-0 overflow-y-auto overscroll-contain pr-0.5 space-y-2 select-text">
            {currentSlideData?.content}
          </div>
        </div>
      </div>

      {/* Interactive Floating Tap Helpers & Stepper Footer */}
      <div className="w-full px-3 py-1.5 flex items-center justify-between gap-2 shrink-0 z-30 border-t border-[#E8DCCB]/60 bg-[#FFFDF9]/90 backdrop-blur-md">
        {/* Previous button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handlePrevSlide();
          }}
          className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#FAF0DD] hover:bg-[#EEDDC4] text-[#5C3A21] border border-[#DFCBB5] text-xs font-bold transition active:scale-95 cursor-pointer shadow-2xs"
        >
          <ChevronLeft className="w-3.5 h-3.5 text-[#B56A00]" />
          <span>{currentSlideSafe === 0 && prevChapterLabel ? prevChapterLabel : t('common.prev', 'पिछला')}</span>
        </button>

        {/* Center Tap Hint */}
        <div className="text-[10px] text-[#8C6239] font-medium tracking-tight text-center truncate select-none opacity-80">
          👈 {t('story.tapLeft', 'पिछला')} • {t('story.holdPause', 'दबाकर रोकें')} • {t('story.tapRight', 'अगला')} 👉
        </div>

        {/* Next button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleNextSlide();
          }}
          className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#5C3A21] hover:bg-[#462B17] text-[#FAF2E4] border border-[#B56A00] text-xs font-bold transition active:scale-95 cursor-pointer shadow-2xs"
        >
          <span>{currentSlideSafe === totalSlides - 1 && nextChapterLabel ? nextChapterLabel : t('common.next', 'अगला')}</span>
          <ChevronRight className="w-3.5 h-3.5 text-[#FFD88A]" />
        </button>
      </div>
    </div>
  );
};
export default UniversalStoryDeck;
