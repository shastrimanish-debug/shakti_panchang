import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  DEVOTIONAL_AUDIO_TRACKS,
  DevotionalTrack,
  ragaForTrack,
} from '../data/devotionalAudioTracks';
import {
  Play,
  Pause,
  Volume2,
  Music,
  Bell,
  ShieldCheck,
  SkipBack,
  SkipForward,
} from 'lucide-react';
import { devotionalAudioEngine } from '../services/devotionalAudioEngine';
import { speakUma, stopUmaSpeech } from '../lib/umaSpeech';
import { formatPadacchedaGuide } from '../lib/sanskritPhonetics';

/**
 * Formats any Sanskrit/Hindi verse paragraph so every चरण (half-verse ending in ।)
 * renders on its own dedicated line instead of cramming into 1 single line.
 */
function formatMultiLineShloka(raw: string): string[] {
  const withBreaks = raw
    .replace(/।\s*(?!\n)/g, '।\n')
    .replace(/॥\s*(?!\n|$)/g, '॥\n');
  return withBreaks
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

export const DevotionalAudioPlayerView: React.FC<{
  onOpenUmaModal?: (query?: string) => void;
  onBackToPanchang?: () => void;
}> = () => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedTrackIndex, setSelectedTrackIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [audioSource, setAudioSource] = useState<'stream' | 'speech'>('stream');
  const [sanskritOnly, setSanskritOnly] = useState<boolean>(true);
  const [showPadaccheda, setShowPadaccheda] = useState<boolean>(true);
  const [playError, setPlayError] = useState<string | null>(null);

  // Sequential Verse Queue States (Android / iOS WebView Compliant)
  const [activeVerseIndex, setActiveVerseIndex] = useState<number>(-1);
  const isPlayingRef = useRef<boolean>(false);
  const nextTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const playGen = useRef(0);
  const continuePath = useRef(false);

  // Stream HTML5 Audio states
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [duration, setDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);

  // Font Size Selector
  const [seniorFontSize, setSeniorFontSize] = useState<'normal' | 'xl' | 'xxl'>('normal');

  // Filtered Tracks
  const filteredTracks = useMemo(() => {
    return DEVOTIONAL_AUDIO_TRACKS.filter((t) => {
      if (activeCategory === 'all') return true;
      return t.category === activeCategory;
    });
  }, [activeCategory]);

  const currentTrack: DevotionalTrack =
    filteredTracks[selectedTrackIndex] || DEVOTIONAL_AUDIO_TRACKS[0];

  // Split current track into individual stanzas/shlokas
  const verses = useMemo(() => {
    return currentTrack.lyricsText
      .split(/\n\s*\n/)
      .map((v) => v.trim())
      .filter((v) => v.length > 0);
  }, [currentTrack]);

  // Completely Stop Playback
  const stopAllPlayback = useCallback(() => {
    isPlayingRef.current = false;
    setIsPlaying(false);
    setActiveVerseIndex(-1);
    playGen.current += 1;
    continuePath.current = false;

    if (nextTimerRef.current) {
      clearTimeout(nextTimerRef.current);
      nextTimerRef.current = null;
    }

    devotionalAudioEngine.stopTanpuraDrone();
    stopUmaSpeech();

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // Ignore
      }
    }

    if (audioRef.current) {
      audioRef.current.pause();
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAllPlayback();
    };
  }, [stopAllPlayback]);

  // Sequential Verse-by-Verse Speech Reciter (100% Copyright-Free & Pure Vedic Phonetics)
  const speakVerseAtIndex = useCallback(
    (index: number) => {
      if (!isPlayingRef.current || index >= verses.length) {
        stopAllPlayback();
        return;
      }

      setActiveVerseIndex(index);
      const generation = playGen.current;

      setTimeout(() => {
        const elem = document.getElementById(`verse-card-${index}`);
        if (elem) {
          elem.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 80);

      const rawVerse = verses[index] || '';
      void speakUma(rawVerse, {
        rate: Math.max(0.76, playbackRate * 0.88),
        sanskritOnly,
        voiceStyle: 'pandit',
        raga: ragaForTrack(currentTrack.id),
        onStart: () => {
          if (playGen.current !== generation) return;
          setActiveVerseIndex(index);
        },
        onEnd: () => {
          if (playGen.current !== generation || !isPlayingRef.current) return;
          nextTimerRef.current = setTimeout(() => {
            if (playGen.current === generation && isPlayingRef.current) {
              speakVerseAtIndex(index + 1);
            }
          }, 320);
        },
        onError: () => {
          if (playGen.current !== generation) return;
          stopAllPlayback();
        },
      });
    },
    [verses, playbackRate, sanskritOnly, stopAllPlayback, currentTrack.id]
  );

  // Start Speech Recitation with Soft Tanpura Drone
  const startSpeechRecitation = useCallback(
    (startIndex = 0) => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setPlayError(null);
      setAudioSource('speech');
      isPlayingRef.current = true;
      setIsPlaying(true);
      devotionalAudioEngine.startTanpuraDrone();
      speakVerseAtIndex(startIndex);
    },
    [speakVerseAtIndex]
  );

  // Play Stream or Fallback Automatically to In-App Vedic Reciter
  const handleTogglePlay = () => {
    if (isPlaying) {
      stopAllPlayback();
      return;
    }
    startSpeechRecitation(activeVerseIndex >= 0 ? activeVerseIndex : 0);
  };

  // Play Specific Verse when user clicks a Shloka card
  const handlePlaySpecificVerse = (idx: number) => {
    stopAllPlayback();
    window.setTimeout(() => {
      startSpeechRecitation(idx);
    }, 60);
  };

  // Switch Track
  const handleSelectTrack = (idx: number) => {
    stopAllPlayback();
    setSelectedTrackIndex(idx);
    setCurrentTime(0);
    setAudioSource('speech');
  };

  // Update Audio Element listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration || 0);
    const handleEnded = () => {
      const nextIndex = selectedTrackIndex + 1;
      const nextTrack = filteredTracks[nextIndex];
      if (
        isPlayingRef.current &&
        audioSource === 'stream' &&
        nextTrack &&
        nextTrack.category === currentTrack.category &&
        nextTrack.audioUrl
      ) {
        continuePath.current = true;
        setSelectedTrackIndex(nextIndex);
        setCurrentTime(0);
        return;
      }
      stopAllPlayback();
    };

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentTrack, stopAllPlayback, selectedTrackIndex, filteredTracks, audioSource]);

  useEffect(() => {
    if (!continuePath.current) return;
    const audio = audioRef.current;
    const url = currentTrack.audioUrl;
    if (!audio || !url) {
      continuePath.current = false;
      return;
    }
    continuePath.current = false;
    audio.src = url;
    audio.load();
    isPlayingRef.current = true;
    setIsPlaying(true);
    void audio.play().catch(() => {
      startSpeechRecitation(0);
    });
  }, [currentTrack.audioUrl, startSpeechRecitation]);

  const handleRateChange = (newRate: number) => {
    setPlaybackRate(newRate);
    if (audioRef.current) audioRef.current.playbackRate = newRate;
  };

  const formatTime = (secs: number) => {
    if (!secs || isNaN(secs)) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="flex-1 min-h-0 w-full h-full bg-[#FAF2E4] text-[#3E2714] flex flex-col overflow-hidden font-sans">
      {/* Hidden Audio Element */}
      <audio ref={audioRef} preload="none" />

      {/* =================================================================== */}
      {/* 1. COMPACT STICKY AUDIO CONTROLLER & CATEGORY/TRACK SELECTOR        */}
      {/* =================================================================== */}
      <div className="shrink-0 bg-gradient-to-b from-[#2A1508] to-[#1E110A] text-[#FAF2E4] border-b-2 border-[#B56A00] px-3 py-2 space-y-2 shadow-md z-20">
        {/* Row 1: Category Pills + Font Size + Copyright Safe Badge */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
            {[
              { id: 'all', label: '🌸 सभी' },
              { id: 'stotra', label: '🔱 स्तोत्र' },
              { id: 'saptashati', label: '🔱 सप्तशती' },
              { id: 'bhajan', label: '🙏 चालीसा' },
              { id: 'mantra', label: '☸ महामंत्र' },
              { id: 'aarti', label: '🪔 आरती' },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setActiveCategory(cat.id);
                  setSelectedTrackIndex(0);
                  stopAllPlayback();
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition cursor-pointer shrink-0 ${
                  activeCategory === cat.id
                    ? 'bg-[#B56A00] text-white border border-amber-300'
                    : 'bg-[#2B180D] text-[#D9C4A9] border border-[#8C6239]/40'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span className="hidden md:inline-flex items-center gap-1 bg-emerald-950/90 border border-emerald-500/40 text-emerald-300 text-[10px] px-2 py-0.5 rounded-full font-bold">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>Copyright-Free</span>
            </span>

            {/* Compact Font Size Toggle */}
            <div className="flex items-center bg-[#23140C] border border-[#8C6239]/60 rounded-lg p-0.5 text-[11px]">
              {(
                [
                  ['normal', 'अ'],
                  ['xl', 'अ+'],
                  ['xxl', 'अ++'],
                ] as const
              ).map(([sz, lbl]) => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => setSeniorFontSize(sz)}
                  className={`px-1.5 py-0.5 rounded font-bold cursor-pointer ${
                    seniorFontSize === sz
                      ? 'bg-[#B56A00] text-white'
                      : 'text-[#D9C4A9]'
                  }`}
                >
                  {lbl}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Row 2: Horizontal Track Selector Strip */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {filteredTracks.map((t, idx) => {
            const isSel = idx === selectedTrackIndex;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => handleSelectTrack(idx)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition cursor-pointer shrink-0 flex items-center gap-1 ${
                  isSel
                    ? 'bg-amber-400 text-stone-950 shadow-xs'
                    : 'bg-[#341F14] text-[#FAF2E4]/85 hover:bg-[#462B17]'
                }`}
              >
                <Music className="w-3 h-3 shrink-0" />
                <span>{t.title}</span>
              </button>
            );
          })}
        </div>

        {/* Row 3: Ultra-Compact Audio Player Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 bg-[#160B06]/90 border border-[#8C6239]/50 rounded-xl px-2.5 py-1.5">
          {/* Play / Prev / Next + Active Track Info */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <button
              type="button"
              onClick={() =>
                handleSelectTrack(
                  (selectedTrackIndex - 1 + filteredTracks.length) %
                    filteredTracks.length
                )
              }
              className="p-1.5 rounded-lg bg-[#2B180D] text-amber-200 hover:bg-[#3E2714] cursor-pointer shrink-0"
              title="पिछला पाठ"
            >
              <SkipBack className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={handleTogglePlay}
              className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-stone-950 font-black text-xs rounded-xl shadow-md border border-amber-200 flex items-center gap-1.5 cursor-pointer active:scale-95 shrink-0"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4 fill-stone-950" />
                  <span>रोकें</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-stone-950" />
                  <span>सुनें (Play)</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() =>
                handleSelectTrack((selectedTrackIndex + 1) % filteredTracks.length)
              }
              className="p-1.5 rounded-lg bg-[#2B180D] text-amber-200 hover:bg-[#3E2714] cursor-pointer shrink-0"
              title="अगला पाठ"
            >
              <SkipForward className="w-3.5 h-3.5" />
            </button>

            <div className="min-w-0 flex-1">
              <div className="text-xs font-black text-[#FFD88A] truncate">
                {currentTrack.title}
              </div>
              <div className="text-[10px] text-[#D9C4A9] truncate">
                {isPlaying
                  ? activeVerseIndex >= 0
                    ? `🔊 श्लोक ${activeVerseIndex + 1} / ${verses.length} का पाठ चल रहा है...`
                    : '🔊 वैदिक गायन चल रहा है...'
                  : `${verses.length} श्लोक / छन्द • ${currentTrack.deity}`}
              </div>
            </div>
          </div>

          {/* Mode Toggle + Speed + Bell */}
          <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
            <div className="flex items-center bg-[#23140C] rounded-lg p-0.5 border border-[#8C6239]/50 text-[10px] font-bold">
              {currentTrack.audioUrl && (
                <button
                  type="button"
                  onClick={() => {
                    stopAllPlayback();
                    setAudioSource('stream');
                  }}
                  className={`px-2 py-0.5 rounded cursor-pointer ${
                    audioSource === 'stream'
                      ? 'bg-[#B56A00] text-white'
                      : 'text-[#D9C4A9]'
                  }`}
                  title="पारंपरिक वैदिक पण्डित गायन (Original Chanting)"
                >
                  🎵 वैदिक गायन
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  stopAllPlayback();
                  setAudioSource('speech');
                }}
                className={`px-2 py-0.5 rounded cursor-pointer ${
                  audioSource === 'speech' || !currentTrack.audioUrl
                    ? 'bg-[#B56A00] text-white'
                    : 'text-[#D9C4A9]'
                }`}
                title="शुद्ध संस्कृत पदच्छेद उच्चारण + तानपुरा"
              >
                🗣 शुद्ध श्लोक उच्चारण
              </button>
            </div>

            <button
              type="button"
              onClick={() => setSanskritOnly((v) => !v)}
              className={`px-2 py-1 rounded-lg border text-[10px] font-bold cursor-pointer transition ${
                sanskritOnly
                  ? 'bg-amber-500/20 text-amber-200 border-amber-400/50'
                  : 'bg-[#23140C] text-[#D9C4A9] border-[#8C6239]/40'
              }`}
              title="केवल मूल संस्कृत श्लोक बोलें या हिंदी भावार्थ सहित"
            >
              {sanskritOnly ? '🕉 केवल श्लोक' : '📖 श्लोक + अर्थ'}
            </button>

            <button
              type="button"
              onClick={() => setShowPadaccheda((v) => !v)}
              className={`px-2 py-1 rounded-lg border text-[10px] font-bold cursor-pointer transition ${
                showPadaccheda
                  ? 'bg-emerald-900/60 text-emerald-200 border-emerald-500/50'
                  : 'bg-[#23140C] text-[#D9C4A9] border-[#8C6239]/40'
              }`}
              title="कठिन संस्कृत शब्दों को तोड़कर (पदच्छेद) सरल उच्चारण दिखाएं"
            >
              पदच्छेद {showPadaccheda ? 'ON' : 'OFF'}
            </button>

            <div className="hidden sm:flex items-center gap-0.5 bg-[#23140C] rounded-lg p-0.5 border border-[#8C6239]/40">
              {[0.8, 1.0, 1.2].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => handleRateChange(r)}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                    playbackRate === r
                      ? 'bg-amber-500 text-stone-950'
                      : 'text-[#D9C4A9]'
                  }`}
                >
                  {r}x
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => devotionalAudioEngine.playTempleBell(880)}
              className="p-1.5 bg-[#5C3A21] hover:bg-[#462B17] text-[#FFD88A] rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer border border-amber-500/30"
              title="मन्दिर घण्टी बजाएं"
            >
              <Bell className="w-3.5 h-3.5 text-amber-300" />
            </button>
          </div>
        </div>

        {/* Compact Seek Bar (only when stream is selected and playing/loaded) */}
        {audioSource === 'stream' && duration > 0 && (
          <div className="flex items-center gap-2 text-[10px] text-[#FFD88A] font-bold px-1">
            <span>{formatTime(currentTime)}</span>
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={(e) => {
                const val = Number(e.target.value);
                setCurrentTime(val);
                if (audioRef.current) audioRef.current.currentTime = val;
              }}
              className="flex-1 accent-amber-400 bg-[#23140C] h-1.5 rounded-lg cursor-pointer"
            />
            <span>{formatTime(duration)}</span>
          </div>
        )}

        {playError && (
          <p className="text-[11px] font-bold text-rose-300 px-1">{playError}</p>
        )}
      </div>

      {/* =================================================================== */}
      {/* 2. FULL-SCREEN SCROLLABLE MULTI-LINE SHLOKA READER (80%+ HEIGHT)    */}
      {/* =================================================================== */}
      <div className="flex-1 min-h-0 w-full overflow-y-auto overscroll-contain px-3 sm:px-5 py-3 pb-24">
        <div className="max-w-3xl mx-auto space-y-3">
          {/* Meaning / Intro Header Card */}
          {currentTrack.meaningText && (
            <div className="px-3.5 py-2.5 bg-[#F4E8D1] border-l-4 border-[#B56A00] rounded-r-xl text-xs sm:text-sm text-[#4A2E1B] font-medium leading-relaxed">
              <strong className="text-[#7F1D1D]">महात्म्य: </strong>
              {currentTrack.meaningText}
            </div>
          )}

          {/* Multi-Line Shloka Cards */}
          {verses.map((versePara, pIdx) => {
            const isActive = activeVerseIndex === pIdx && isPlaying;
            const lines = formatMultiLineShloka(versePara);
            const padacchedaText = showPadaccheda ? formatPadacchedaGuide(versePara) : '';

            return (
              <div
                key={pIdx}
                id={`verse-card-${pIdx}`}
                onClick={() => handlePlaySpecificVerse(pIdx)}
                className={`p-3.5 sm:p-4 rounded-2xl transition duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-amber-100/95 border-2 border-[#B56A00] shadow-md ring-2 ring-amber-400/50'
                    : 'bg-[#FFFDF9] border border-[#8C6239]/35 hover:border-[#B56A00]'
                }`}
              >
                <div className="flex items-start justify-between gap-2.5">
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded-md bg-[#5C3A21] text-[#FFD88A] text-[10px] font-bold">
                        श्लोक / छन्द {pIdx + 1}
                      </span>
                      {isActive && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-black text-[#B56A00] bg-amber-200 px-2 py-0.5 rounded-full animate-pulse">
                          <Volume2 className="w-3 h-3" /> शुद्ध उच्चारण चल रहा है
                        </span>
                      )}
                    </div>

                    {/* Multi-line Sanskrit/Hindi Verse Stanza */}
                    <div
                      className={`font-serif font-bold text-[#2C180C] space-y-1 ${
                        seniorFontSize === 'normal'
                          ? 'text-base sm:text-lg leading-relaxed'
                          : seniorFontSize === 'xl'
                          ? 'text-lg sm:text-xl leading-relaxed'
                          : 'text-xl sm:text-2xl leading-loose'
                      }`}
                    >
                      {lines.map((line, lIdx) => {
                        const isBhavarth = line.startsWith('भावार्थ:');
                        return (
                          <div
                            key={lIdx}
                            className={
                              isBhavarth
                                ? 'text-xs sm:text-sm font-sans font-semibold text-[#735133] pt-1.5 mt-1.5 border-t border-[#8C6239]/20'
                                : 'block'
                            }
                          >
                            {line}
                          </div>
                        );
                      })}
                    </div>

                    {/* Padaccheda (Sandhi-Split Easy Pronunciation Guide) */}
                    {showPadaccheda && padacchedaText && (
                      <div className="mt-2 pt-2 border-t border-amber-700/15 bg-[#FAF3E6] rounded-xl px-2.5 py-1.5 text-xs text-[#5C3A21]">
                        <span className="font-black text-[#B56A00] text-[10px] uppercase tracking-wider block mb-0.5">
                          🔱 पदच्छेद (सरल शुद्ध उच्चारण):
                        </span>
                        <span className="font-medium leading-relaxed whitespace-pre-line">
                          {padacchedaText}
                        </span>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlaySpecificVerse(pIdx);
                    }}
                    className={`p-2 rounded-xl text-xs font-bold shrink-0 cursor-pointer flex items-center gap-1 transition active:scale-95 ${
                      isActive
                        ? 'bg-[#B56A00] text-white'
                        : 'bg-[#F4E8D1] hover:bg-[#EAD8B8] text-[#5C3A21]'
                    }`}
                    title="यह श्लोक शुद्ध उच्चारण में सुनें"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
