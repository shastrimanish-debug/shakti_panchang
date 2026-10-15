import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  DEVOTIONAL_AUDIO_TRACKS,
  DevotionalTrack,
} from '../data/devotionalAudioTracks';
import {
  Play,
  Pause,
  Volume2,
  Music,
  Sparkles,
  Sun,
  Bell,
  Disc,
} from 'lucide-react';
import { devotionalAudioEngine } from '../services/devotionalAudioEngine';
import { speakUma, stopUmaSpeech } from '../lib/umaSpeech';
import { ZeroScrollPager } from './ZeroScrollPager';

export const DevotionalAudioPlayerView: React.FC<{
  onOpenUmaModal?: (query?: string) => void;
  onBackToPanchang?: () => void;
}> = () => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedTrackIndex, setSelectedTrackIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [audioSource, setAudioSource] = useState<'stream' | 'speech'>('stream');
  const [playError, setPlayError] = useState<string | null>(null);

  // Sequential Verse Queue States (Android / iOS WebView Compliant)
  const [activeVerseIndex, setActiveVerseIndex] = useState<number>(-1);
  const isPlayingRef = useRef<boolean>(false);
  const nextTimerRef = useRef<any>(null);
  const playGen = useRef(0);
  const continuePath = useRef(false);

  // Stream HTML5 Audio states
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [duration, setDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);

  // Senior Citizens Mode Options (70+ Elderly Friendly)
  const [seniorFontSize, setSeniorFontSize] = useState<'normal' | 'xl' | 'xxl'>('xl');

  // Filtered Tracks
  const filteredTracks = useMemo(() => {
    return DEVOTIONAL_AUDIO_TRACKS.filter((t) => {
      if (activeCategory === 'all') return true;
      return t.category === activeCategory;
    });
  }, [activeCategory]);

  const currentTrack: DevotionalTrack =
    filteredTracks[selectedTrackIndex] || DEVOTIONAL_AUDIO_TRACKS[0];

  // Split current track into individual short verses/paragraphs (under 150 chars per chunk for Android TTS)
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

  // Cleanup on unmount or track change
  useEffect(() => {
    return () => {
      stopAllPlayback();
    };
  }, [stopAllPlayback]);

  // Sequential Verse-by-Verse Speech Reciter (Android / iOS WebView Compliant)
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
      }, 100);

      const rawVerse = verses[index] || '';
      void speakUma(rawVerse, {
        rate: Math.max(0.75, playbackRate * 0.9),
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
          }, 350);
        },
        onError: () => {
          if (playGen.current !== generation) return;
          stopAllPlayback();
        },
      });
    },
    [verses, playbackRate, stopAllPlayback]
  );

  // Play / Pause Toggle
  const playMusic = () => {
    stopUmaSpeech();
    const audio = audioRef.current;
    if (!audio || !currentTrack.audioUrl) {
      setPlayError('इस पाठ की गायन फ़ाइल नहीं मिली।');
      return;
    }
    setPlayError(null);
    setAudioSource('stream');
    if (audio.ended) audio.currentTime = 0;
    audio.playbackRate = playbackRate;
    isPlayingRef.current = true;
    setIsPlaying(true);
    void audio.play().catch(() => {
      isPlayingRef.current = false;
      setIsPlaying(false);
      setPlayError('गायन नहीं खुला। इंटरनेट चालू रखें, फिर प्ले दबाएँ।');
    });
  };

  const handleTogglePlay = () => {
    if (isPlaying) {
      stopAllPlayback();
      return;
    }
    if (audioSource === 'speech') {
      isPlayingRef.current = true;
      setIsPlaying(true);
      setPlayError(null);
      speakVerseAtIndex(0);
      return;
    }
    playMusic();
  };

  // Play Specific Verse
  const handlePlaySpecificVerse = (_idx: number) => {
    stopAllPlayback();
    window.setTimeout(() => playMusic(), 60);
  };

  // Switch Track
  const handleSelectTrack = (idx: number) => {
    stopAllPlayback();

    setSelectedTrackIndex(idx);
    setCurrentTime(0);
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
      isPlayingRef.current = false;
      setIsPlaying(false);
      setPlayError('अगला भाग नहीं खुला। इंटरनेट चालू रखें।');
    });
  }, [currentTrack.audioUrl]);

  // Adjust Playback Speed
  const handleRateChange = (newRate: number) => {
    setPlaybackRate(newRate);
    if (audioRef.current) audioRef.current.playbackRate = newRate;
  };

  // Format Time (MM:SS)
  const formatTime = (secs: number) => {
    if (!secs || isNaN(secs)) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="flex-1 min-h-0 w-full h-full bg-[#3E2714] text-[#FAF2E4] flex flex-col overflow-hidden font-sans">
      {/* Hidden Audio Element */}
      <audio ref={audioRef} src={currentTrack.audioUrl} preload="metadata" />

      {/* Header Banner for Seniors */}
      <div className="p-3 bg-gradient-to-r from-[#2A1508] via-[#462B17] to-[#2A1508] border-b border-[#B56A00]/50 flex items-center justify-between shrink-0 shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-full bg-[#B56A00] text-white flex items-center justify-center font-black shadow-md shrink-0">
            <Music className="w-5 h-5 text-amber-200" />
          </div>
          <div>
            <h2 className="font-granth font-black text-sm sm:text-base text-[#FFD88A] flex items-center gap-1.5">
              <span>॥ सुरीला भक्ति संगीत व दिव्य स्वर पाठ ॥</span>
              <span className="text-[10px] bg-[#B56A00] text-white px-2 py-0.5 rounded-full font-bold">
                70+ सुगम मोड
              </span>
            </h2>
            <p className="text-[11px] text-[#D9C4A9]">
              दुर्गा सप्तशती पूरी — कवच, अर्गला, कीलक, १३ अध्याय, कुंजिका • मंत्र, स्तोत्र व आरती
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Senior Citizen Font Size Selector */}
          <div className="flex items-center gap-1 bg-[#23140C] border border-[#8C6239] rounded-xl p-1 text-xs">
            <span className="text-[10px] text-[#D9C4A9] px-1 hidden sm:inline">
              अक्षर आकार:
            </span>
            <button
              type="button"
              onClick={() => setSeniorFontSize('normal')}
              className={`px-2 py-0.5 rounded font-bold transition ${
                seniorFontSize === 'normal'
                  ? 'bg-[#B56A00] text-white'
                  : 'text-[#D9C4A9]'
              }`}
            >
              अ
            </button>
            <button
              type="button"
              onClick={() => setSeniorFontSize('xl')}
              className={`px-2 py-0.5 rounded font-black transition ${
                seniorFontSize === 'xl'
                  ? 'bg-[#B56A00] text-white'
                  : 'text-[#D9C4A9]'
              }`}
            >
              अ+
            </button>
            <button
              type="button"
              onClick={() => setSeniorFontSize('xxl')}
              className={`px-2 py-0.5 rounded font-black text-sm transition ${
                seniorFontSize === 'xxl'
                  ? 'bg-[#B56A00] text-white'
                  : 'text-[#D9C4A9]'
              }`}
            >
              अ++
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="shrink-0 px-3 pt-3 space-y-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {[
            { id: 'all', label: '🌸 समस्त भक्ति पाठ' },
            { id: 'stotra', label: '🔱 शिव महिम्न व स्तोत्र' },
            { id: 'saptashati', label: '🔱 दुर्गा सप्तशती' },
            { id: 'aarti', label: '🪔 आरती संग्रह' },
            { id: 'mantra', label: '☸ महामंत्र (गायत्री/मृत्युंजय)' },
            { id: 'bhajan', label: '🙏 हनुमान चालीसा व भजन' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                setActiveCategory(cat.id);
                setSelectedTrackIndex(0);
                stopAllPlayback();
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer shrink-0 ${
                activeCategory === cat.id
                  ? 'bg-gradient-to-r from-[#B56A00] to-[#8C6239] text-white shadow-md border border-amber-300'
                  : 'bg-[#23140C] text-[#D9C4A9] hover:bg-[#341F14] border border-[#8C6239]/40'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Hero Audio Player Card */}
        <div className="bg-gradient-to-b from-[#2A1508] to-[#1E110A] border-2 border-[#B56A00] rounded-3xl p-4 sm:p-6 shadow-2xl space-y-4 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Spinning Disc / Sacred Icon */}
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div
                className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-amber-600 to-yellow-500 text-stone-950 flex items-center justify-center font-black shadow-xl shrink-0 border-2 border-amber-300 relative ${
                  isPlaying ? 'animate-spin' : ''
                }`}
                style={{ animationDuration: '8s' }}
              >
                <Disc className="w-10 h-10 text-stone-950" />
                <div className="w-4 h-4 rounded-full bg-stone-950 absolute inset-0 m-auto" />
              </div>

              <div>
                <div className="text-xs font-bold text-amber-400 uppercase tracking-widest flex items-center justify-center sm:justify-start gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>
                    {currentTrack.deity} • {currentTrack.category.toUpperCase()}
                  </span>
                </div>
                <h3 className="font-granth font-black text-lg sm:text-2xl text-[#FFD88A] mt-0.5">
                  {currentTrack.title}
                </h3>
                <p className="text-xs text-[#D9C4A9] mt-1 max-w-xl">
                  {currentTrack.description}
                </p>
              </div>
            </div>

            {/* Giant Play/Pause Control Button for Senior Citizens */}
            <button
              type="button"
              onClick={handleTogglePlay}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 hover:from-amber-600 hover:to-yellow-500 text-stone-950 font-black text-base sm:text-lg rounded-2xl shadow-2xl border-2 border-amber-300 transition cursor-pointer active:scale-95 flex items-center justify-center gap-3 shrink-0 m3-touch"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-7 h-7 fill-stone-950" />
                  <span>पाठ रोकें (Pause)</span>
                </>
              ) : (
                <>
                  <Play className="w-7 h-7 fill-stone-950" />
                  <span>▶ गायन सुनें (Play)</span>
                </>
              )}
            </button>
          </div>
          {playError && (
            <p className="text-xs font-bold text-rose-200">{playError}</p>
          )}

          {/* Mode Switcher: Stream vs Speech Reciter */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#8C6239]/40 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-[#D9C4A9] font-bold">ध्वनि स्रोत:</span>
              <button
                type="button"
                onClick={() => {
                  stopAllPlayback();
                  setAudioSource('stream');
                }}
                className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                  audioSource === 'stream'
                    ? 'bg-[#B56A00] text-white'
                    : 'bg-[#23140C] text-[#D9C4A9]'
                }`}
              >
                🎵 गायन, यूट्यूब जैसा
              </button>
              <button
                type="button"
                onClick={() => {
                  stopAllPlayback();
                  setAudioSource('speech');
                }}
                className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                  audioSource === 'speech'
                    ? 'bg-[#B56A00] text-white'
                    : 'bg-[#23140C] text-[#D9C4A9]'
                }`}
              >
                🗣 फोन से पढ़वाएँ
              </button>
            </div>

            {/* Speed Control */}
            <div className="flex items-center gap-1.5">
              <span className="text-[#D9C4A9] text-[11px]">गति (Speed):</span>
              {[0.8, 1.0, 1.2].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => handleRateChange(r)}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    playbackRate === r
                      ? 'bg-amber-500 text-stone-950'
                      : 'bg-[#23140C] text-[#D9C4A9]'
                  }`}
                >
                  {r}x
                </button>
              ))}
            </div>
          </div>

          {/* Audio Seek Progress Bar for Stream */}
          {audioSource === 'stream' && (
            <div className="space-y-1 pt-1">
              <div className="flex justify-between text-[11px] text-[#FFD88A] font-bold px-1">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
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
                className="w-full accent-amber-400 bg-[#23140C] h-2 rounded-lg cursor-pointer"
              />
            </div>
          )}

          {/* Live Playing Status Indicator Banner */}
          {isPlaying && (
            <div className="p-2.5 bg-gradient-to-r from-amber-500/20 via-yellow-400/30 to-amber-500/20 border border-amber-400/50 rounded-xl flex items-center justify-between text-xs text-amber-200 font-bold animate-pulse">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-amber-300" />
                <span>
                  🔊 भक्ति गायन चल रहा है...
                  {activeVerseIndex >= 0 &&
                    ` (श्लोक ${activeVerseIndex + 1} / ${verses.length})`}
                </span>
              </div>
              <button
                type="button"
                onClick={stopAllPlayback}
                className="px-2.5 py-0.5 bg-amber-500 text-stone-950 rounded font-black text-[11px]"
              >
                रोकें
              </button>
            </div>
          )}
        </div>
      </div>

      <ZeroScrollPager className="flex-1 min-h-0 w-full" contentClassName="px-3 pt-3 pb-4 space-y-3" resetKey={currentTrack.id}>
        <div className="rounded-2xl border border-[#E7C27A]/70 bg-[#FFF8EC] px-3.5 py-3 text-[#3E2714] shadow-sm">
          <p className="text-[13px] font-semibold leading-relaxed">
            गान इंटरनेट से जुड़ते हैं। कॉपीराइट उनके स्वामियों का है। नेट धीमा हो तो आवाज़ रुक सकती है या न आए।
          </p>
        </div>

        {/* Text Verses & Meaning Display for Senior Citizens */}
        <div className="bg-[#FAF2E4] text-[#3E2714] rounded-3xl p-5 sm:p-7 border-2 border-[#8C6239] shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-[#8C6239]/30 pb-3">
            <h4 className="font-granth font-black text-base sm:text-xl text-[#5C3A21] flex items-center gap-2">
              <Sun className="w-5 h-5 text-[#B56A00]" />
              <span>मंत्र / स्तोत्र पाठ (High-Contrast Large Text)</span>
            </h4>
            <button
              type="button"
              onClick={() => devotionalAudioEngine.playTempleBell(880)}
              className="px-3 py-1 bg-[#5C3A21] hover:bg-[#462B17] text-[#FFD88A] rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
            >
              <Bell className="w-4 h-4 text-amber-300" />
              <span>मन्दिर घण्टी बजाएं</span>
            </button>
          </div>

          {/* Verses Container with Senior Citizen Font Sizing and Active Verse Highlighting */}
          <div className="space-y-4">
            {verses.map((versePara, pIdx) => {
              const isActive = activeVerseIndex === pIdx && isPlaying;
              return (
                <div
                  key={pIdx}
                  id={`verse-card-${pIdx}`}
                  className={`p-4 rounded-2xl space-y-2 relative transition duration-300 ${
                    isActive
                      ? 'bg-amber-100 border-2 border-[#B56A00] shadow-md ring-2 ring-amber-400/60'
                      : 'bg-[#FAF2E4] border border-[#8C6239]/40 hover:border-[#B56A00]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 flex-1">
                      {isActive && (
                        <div className="flex items-center gap-1.5 text-xs font-black text-[#B56A00] uppercase tracking-wider bg-amber-200/90 px-2.5 py-0.5 rounded-full w-fit animate-pulse mb-1">
                          <Volume2 className="w-3.5 h-3.5 text-[#B56A00]" />
                          <span>
                            🔊 पाठ चल रहा है — श्लोक {pIdx + 1} / {verses.length}
                          </span>
                        </div>
                      )}
                      <div
                        className={`font-serif leading-relaxed tracking-wide text-stone-950 font-bold whitespace-pre-line ${
                          seniorFontSize === 'normal'
                            ? 'text-base sm:text-lg'
                            : seniorFontSize === 'xl'
                            ? 'text-xl sm:text-2xl'
                            : 'text-2xl sm:text-3xl'
                        }`}
                      >
                        {versePara}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handlePlaySpecificVerse(pIdx)}
                      className={`p-2.5 rounded-xl text-xs font-bold shrink-0 cursor-pointer shadow-xs flex items-center gap-1.5 transition active:scale-95 ${
                        isActive
                          ? 'bg-[#B56A00] text-white font-black'
                          : 'bg-[#5C3A21] hover:bg-[#462B17] text-[#FFD88A]'
                      }`}
                      title="यहाँ से श्लोक पाठ शुरू करें"
                    >
                      <Volume2 className="w-4 h-4 text-amber-300" />
                      <span className="hidden sm:inline">
                        {isActive ? 'चल रहा है' : 'यहाँ से सुनें'}
                      </span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Meaning / Translation */}
          {currentTrack.meaningText && (
            <div className="p-4 bg-[#F4E8D1] border-l-4 border-[#B56A00] rounded-r-2xl space-y-1">
              <span className="text-xs font-black text-[#B56A00] uppercase tracking-wider block">
                भावार्थ एवं महिमा:
              </span>
              <p className="text-xs sm:text-sm text-[#5C3A21] font-semibold leading-relaxed">
                {currentTrack.meaningText}
              </p>
            </div>
          )}
        </div>

        {/* Playlist Items Grid */}
        <div className="space-y-2 pt-2">
          <h4 className="text-xs font-black text-[#FFD88A] uppercase tracking-wider flex items-center gap-1.5">
            <Disc className="w-4 h-4 text-amber-400" />
            <span>अन्य भक्ति पाठ एवं आरती सूची ({filteredTracks.length}):</span>
          </h4>

          <div className="flex flex-col gap-2">
            {filteredTracks.map((track, idx) => {
              const isSelected = selectedTrackIndex === idx;
              return (
                <div
                  key={track.id}
                  onClick={() => handleSelectTrack(idx)}
                  className={`p-3 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-gradient-to-r from-[#B56A00] to-[#8C6239] text-white border-amber-300 shadow-md font-bold'
                      : 'bg-[#23140C] text-[#D9C4A9] hover:bg-[#341F14] border-[#8C6239]/40'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold flex items-center gap-1.5">
                      <span>{track.title}</span>
                    </div>
                    <div className="text-[10px] opacity-80">
                      {track.deity} • {track.duration}
                    </div>
                  </div>

                  <div className="p-2 rounded-xl bg-white/10 shrink-0">
                    <Play className="w-4 h-4 text-amber-300 fill-current" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </ZeroScrollPager>
    </div>
  );
};
