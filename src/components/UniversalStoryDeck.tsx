import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Volume2,
  VolumeX,
  Share2,
  Sparkles,
} from 'lucide-react';
import { useLanguage } from '../i18n';
import { speakUma, stopUmaSpeech } from '../lib/umaSpeech';
import { ZeroScrollPager } from './ZeroScrollPager';

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

function stripMark(value?: string) {
  if (!value) return "";
  return value.replace(/^(?:[\p{Extended_Pictographic}\uFE0F\u200D]+\s*)+/u, "").trim();
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
  autoPlay = false,
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
    if (currentSlideSafe < totalSlides - 1) setSlideSafe(currentSlideSafe + 1);
  }, [currentSlideSafe, totalSlides, setSlideSafe]);

  const handlePrevSlide = useCallback(() => {
    if (currentSlideSafe > 0) setSlideSafe(currentSlideSafe - 1);
  }, [currentSlideSafe, setSlideSafe]);

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

  // Touch & swipe: horizontal flips the story. Vertical movement never scrolls.
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const touchStartTimeRef = useRef<number>(0);

  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target?.closest?.(".zsp-frame")) {
      touchStartXRef.current = null;
      return;
    }
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

    // Vertical drags do not scroll and do not change the slide.
    if (Math.abs(diffY) > 25 && Math.abs(diffY) > Math.abs(diffX)) {
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
      className="bx-sheet flex-1 min-h-0 w-full h-full max-h-full flex flex-col overflow-hidden relative"
      onMouseDown={handleTouchStart}
      onMouseUp={handleTouchEnd}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="bx-sheetbar shrink-0 flex items-center gap-2 px-3 py-2 border-b">
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold truncate">
            {stripMark(currentSlideData?.title) || stripMark(headerTitle)}
          </div>
          {currentSlideData?.subtitle && (
            <div className="bx-kicker truncate">{stripMark(currentSlideData.subtitle)}</div>
          )}
        </div>
        {currentSlideData?.badge && (
          <span className="bx-count shrink-0">{stripMark(currentSlideData.badge)}</span>
        )}
        <span className="bx-count shrink-0 tabular-nums">
          {currentSlideSafe + 1}/{totalSlides}
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleToggleVoice();
          }}
          className="bx-iconbtn"
          aria-pressed={isSpeaking}
          title={isSpeaking ? "उमा वाणी रोकें" : "उमा वाणी सुनें"}
        >
          {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
        {onShare && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onShare();
            }}
            className="bx-iconbtn"
            title="साझा करें"
          >
            <Share2 className="w-4 h-4" />
          </button>
        )}
        {onOpenUma && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenUma();
            }}
            className="bx-iconbtn"
            title="उमा परामर्श"
          >
            <Sparkles className="w-4 h-4" />
          </button>
        )}
        {extraHeaderActions}
      </div>

      <div className="flex-1 w-full max-w-3xl mx-auto px-3 py-2 flex flex-col min-h-0 overflow-hidden">
        <ZeroScrollPager className="flex-1 w-full min-h-0" resetKey={`${headerTitle}-${currentSlideSafe}`} label={stripMark(currentSlideData?.title) || stripMark(headerTitle)}>
          {currentSlideData?.content}
        </ZeroScrollPager>
      </div>

      {totalSlides > 1 && (
        <div className="bx-sheetfoot shrink-0 flex items-center justify-between gap-2 px-3 py-1.5 border-t">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handlePrevSlide();
            }}
            disabled={currentSlideSafe === 0}
            className="bx-navbtn disabled:opacity-35"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>{t("common.prev", "पिछला")}</span>
          </button>
          <div className="bx-kicker tabular-nums">
            {currentSlideSafe + 1} / {totalSlides}
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleNextSlide();
            }}
            disabled={currentSlideSafe >= totalSlides - 1}
            className="bx-navbtn bx-navbtn-solid disabled:opacity-35"
          >
            <span>{t("common.next", "अगला")}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
export default UniversalStoryDeck;
