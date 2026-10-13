import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  DEVOTIONAL_AUDIO_TRACKS,
  DevotionalTrack,
  SHIV_MAHIMNA_STOTRAM_TEXT,
} from '../data/devotionalAudioTracks';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Music,
  Sparkles,
  Sun,
  Bell,
  Sliders,
  Type,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Disc,
} from 'lucide-react';
import { ZeroScrollPager } from './ZeroScrollPager';
import { devotionalAudioEngine } from '../services/devotionalAudioEngine';

// Web Audio API Temple Sound Synthesizer (Temple Bell & Shankh)
function playTempleBellSound() {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 Bell
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 2.5);

    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.5);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 2.5);
  } catch {
    // Ignore audio policies
  }
}

export const DevotionalAudioPlayerView: React.FC<{
  onOpenUmaModal?: (query?: string) => void;
  onBackToPanchang?: () => void;
}> = ({ onOpenUmaModal, onBackToPanchang }) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedTrackIndex, setSelectedTrackIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [audioSource, setAudioSource] = useState<'stream' | 'speech'>('speech');
  
  // Stream HTML5 Audio states
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [duration, setDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [volume, setVolume] = useState<number>(1.0);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Senior Citizens Mode Options (70+ Elderly Friendly)
  const [seniorFontSize, setSeniorFontSize] = useState<'normal' | 'xl' | 'xxl'>('xl');
  const [isAutoScrollEnabled, setIsAutoScrollEnabled] = useState<boolean>(true);

  // Filtered Tracks
  const filteredTracks = DEVOTIONAL_AUDIO_TRACKS.filter((t) => {
    if (activeCategory === 'all') return true;
    return t.category === activeCategory;
  });

  const currentTrack: DevotionalTrack = filteredTracks[selectedTrackIndex] || DEVOTIONAL_AUDIO_TRACKS[0];

  // Speech Synthesis Reciter for Verse Reading
  const speakTextWithSpeech = useCallback((text: string) => {
    devotionalAudioEngine.playTempleBell(880);
    devotionalAudioEngine.startTanpuraDrone();

    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    try {
      window.speechSynthesis.cancel();
      window.speechSynthesis.resume();

      const cleanText = text.replace(/[*#॥|_]/g, ' ');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'hi-IN';
      utterance.rate = playbackRate * 0.85; // Calmer pace for senior citizens
      utterance.pitch = 0.95; // Warm, resonant voice pitch

      const voices = window.speechSynthesis.getVoices();
      const hindiVoice = voices.find(
        (v) => v.lang.includes('hi') || v.name.toLowerCase().includes('hindi')
      );
      if (hindiVoice) {
        utterance.voice = hindiVoice;
      }

      utterance.onend = () => {
        setIsPlaying(false);
        devotionalAudioEngine.stopTanpuraDrone();
      };
      utterance.onerror = () => {
        setIsPlaying(false);
        devotionalAudioEngine.stopTanpuraDrone();
      };

      window.speechSynthesis.speak(utterance);
      setIsPlaying(true);
    } catch {
      setIsPlaying(true);
    }
  }, [playbackRate]);

  const stopSpeech = useCallback(() => {
    devotionalAudioEngine.stopTanpuraDrone();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  // Handle Play/Pause
  const handleTogglePlay = () => {
    devotionalAudioEngine.playTempleBell(880);

    if (isPlaying) {
      if (audioRef.current) audioRef.current.pause();
      stopSpeech();
      devotionalAudioEngine.stopTanpuraDrone();
      setIsPlaying(false);
    } else {
      devotionalAudioEngine.startTanpuraDrone();

      if (audioSource === 'stream' && audioRef.current && currentTrack.audioUrl) {
        audioRef.current
          .play()
          .then(() => setIsPlaying(true))
          .catch(() => {
            // Fallback to speech + Tanpura if stream is blocked by CORS/network
            setAudioSource('speech');
            speakTextWithSpeech(currentTrack.lyricsText);
          });
      } else {
        speakTextWithSpeech(currentTrack.lyricsText);
      }
    }
  };

  // Switch Track
  const handleSelectTrack = (idx: number) => {
    devotionalAudioEngine.playTempleBell(880);
    devotionalAudioEngine.stopTanpuraDrone();
    stopSpeech();
    if (audioRef.current) audioRef.current.pause();

    setSelectedTrackIndex(idx);
    setIsPlaying(false);
    setCurrentTime(0);
  };

  // Update Audio Element when source or track changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration || 0);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentTrack]);

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
      {/* Hidden Audio Element for Streaming Royalty-Free Tracks */}
      <audio
        ref={audioRef}
        src={currentTrack.audioUrl}
        preload="metadata"
      />

      {/* Header Banner for Seniors */}
      <div className="p-3 bg-gradient-to-r from-[#2A1508] via-[#462B17] to-[#2A1508] border-b border-[#B56A00]/50 flex items-center justify-between shrink-0 shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-full bg-[#B56A00] text-white flex items-center justify-center font-black shadow-md shrink-0">
            <Music className="w-5 h-5 text-amber-200" />
          </div>
          <div>
            <h2 className="font-granth font-black text-sm sm:text-base text-[#FFD88A] flex items-center gap-1.5">
              <span>॥ सुरीला भक्ति संगीत व दिव्य स्वर पाठ ॥</span>
              <span className="text-[10px] bg-[#B56A00] text-white px-2 py-0.5 rounded-full font-bold">70+ सुगम मोड</span>
            </h2>
            <p className="text-[11px] text-[#D9C4A9]">
              दुर्गा सप्तशती, शिव महिम्न स्तोत्र, हनुमान चालीसा व आरतियाँ • 100% कॉपीराइट मुक्त
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Copyright Safe Badge */}
          <div className="hidden sm:flex items-center gap-1 bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-[10px] px-2.5 py-1 rounded-full font-bold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>100% सुरक्षित (No Copyright)</span>
          </div>

          {/* Senior Citizen Font Size Selector */}
          <div className="flex items-center gap-1 bg-[#23140C] border border-[#8C6239] rounded-xl p-1 text-xs">
            <span className="text-[10px] text-[#D9C4A9] px-1 hidden sm:inline">अक्षर आकार:</span>
            <button
              type="button"
              onClick={() => setSeniorFontSize('normal')}
              className={`px-2 py-0.5 rounded font-bold transition ${seniorFontSize === 'normal' ? 'bg-[#B56A00] text-white' : 'text-[#D9C4A9]'}`}
            >
              अ
            </button>
            <button
              type="button"
              onClick={() => setSeniorFontSize('xl')}
              className={`px-2 py-0.5 rounded font-black transition ${seniorFontSize === 'xl' ? 'bg-[#B56A00] text-white' : 'text-[#D9C4A9]'}`}
            >
              अ+
            </button>
            <button
              type="button"
              onClick={() => setSeniorFontSize('xxl')}
              className={`px-2 py-0.5 rounded font-black text-sm transition ${seniorFontSize === 'xxl' ? 'bg-[#B56A00] text-white' : 'text-[#D9C4A9]'}`}
            >
              अ++
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <ZeroScrollPager className="flex-1 min-h-0 w-full overflow-hidden" contentClassName="p-3 space-y-4 max-w-4xl mx-auto">
        {/* Category Tabs Bar */}
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
              <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-amber-600 to-yellow-500 text-stone-950 flex items-center justify-center font-black shadow-xl shrink-0 border-2 border-amber-300 relative ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '8s' }}>
                <Disc className="w-10 h-10 text-stone-950" />
                <div className="w-4 h-4 rounded-full bg-stone-950 absolute inset-0 m-auto" />
              </div>

              <div>
                <div className="text-xs font-bold text-amber-400 uppercase tracking-widest flex items-center justify-center sm:justify-start gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{currentTrack.deity} • {currentTrack.category.toUpperCase()}</span>
                </div>
                <h3 className="font-granth font-black text-lg sm:text-2xl text-[#FFD88A] mt-0.5">
                  {currentTrack.title}
                </h3>
                <p className="text-xs text-[#D9C4A9] mt-1 max-w-xl">
                  {currentTrack.description}
                </p>
              </div>
            </div>

            {/* Giant Play/Pause Control Button for Senior Citizens (70+ Elderly) */}
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
                  <span>▶ पाठ/संगीत सुनें (Play)</span>
                </>
              )}
            </button>
          </div>

          {/* Mode Switcher: Stream vs Speech Reciter */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#8C6239]/40 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-[#D9C4A9] font-bold">ध्वनि स्रोत:</span>
              <button
                type="button"
                onClick={() => {
                  stopSpeech();
                  setAudioSource('stream');
                }}
                className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${audioSource === 'stream' ? 'bg-[#B56A00] text-white' : 'bg-[#23140C] text-[#D9C4A9]'}`}
              >
                🎵 सुरीला भक्ति संगीत (Music Stream)
              </button>
              <button
                type="button"
                onClick={() => {
                  if (audioRef.current) audioRef.current.pause();
                  setAudioSource('speech');
                }}
                className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${audioSource === 'speech' ? 'bg-[#B56A00] text-white' : 'bg-[#23140C] text-[#D9C4A9]'}`}
              >
                🗣 देववाणी स्पष्ट उच्चारण पाठ (Vedic Speech)
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
                  className={`px-2 py-0.5 rounded text-[11px] font-bold ${playbackRate === r ? 'bg-amber-500 text-stone-950' : 'bg-[#23140C] text-[#D9C4A9]'}`}
                >
                  {r}x
                </button>
              ))}
            </div>
          </div>

          {/* Audio Seek Progress Bar */}
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

          {/* Verses Container with Senior Citizen Font Sizing */}
          <div className="space-y-4">
            {currentTrack.lyricsText.split(/\n\s*\n/).map((versePara, pIdx) => (
              <div
                key={pIdx}
                className="p-3.5 bg-[#FAF2E4] border border-[#8C6239]/40 rounded-2xl space-y-2 relative group hover:border-[#B56A00] transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <div
                    className={`font-serif leading-relaxed tracking-wide text-stone-950 font-bold whitespace-pre-line flex-1 ${
                      seniorFontSize === 'normal'
                        ? 'text-base sm:text-lg'
                        : seniorFontSize === 'xl'
                        ? 'text-xl sm:text-2xl'
                        : 'text-2xl sm:text-3xl'
                    }`}
                  >
                    {versePara}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      playTempleBellSound();
                      speakTextWithSpeech(versePara);
                    }}
                    className="p-2 bg-[#5C3A21] hover:bg-[#462B17] text-[#FFD88A] rounded-xl text-xs font-bold shrink-0 cursor-pointer shadow-xs flex items-center gap-1 active:scale-95"
                    title="इस श्लोक को स्पष्ट स्वर में सुनें"
                  >
                    <Volume2 className="w-4 h-4 text-amber-300" />
                    <span className="hidden sm:inline">सुनाएं</span>
                  </button>
                </div>
              </div>
            ))}
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
            <span>अन्य उपलब्ध भक्ति पाठ सूची (Royalty Free Devotional Tracks)</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {filteredTracks.map((tr, idx) => {
              const isSel = idx === selectedTrackIndex;
              return (
                <button
                  key={tr.id}
                  type="button"
                  onClick={() => handleSelectTrack(idx)}
                  className={`p-3 rounded-2xl border text-left transition cursor-pointer flex items-center justify-between gap-3 ${
                    isSel
                      ? 'bg-gradient-to-r from-[#5C3A21] to-[#462B17] border-amber-400 text-white shadow-md'
                      : 'bg-[#23140C] border-[#8C6239]/40 text-[#D9C4A9] hover:bg-[#341F14]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold shrink-0 ${isSel ? 'bg-amber-400 text-stone-950' : 'bg-[#3E2714] text-amber-300'}`}>
                      {isSel && isPlaying ? <Pause className="w-4 h-4 fill-stone-950" /> : <Play className="w-4 h-4 ml-0.5" />}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold truncate text-[#FFD88A]">
                        {tr.title}
                      </div>
                      <div className="text-[10px] text-[#D9C4A9] truncate">
                        {tr.deity} • {tr.duration}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] bg-[#B56A00]/40 text-amber-200 px-2 py-0.5 rounded-full shrink-0 font-bold">
                    {isSel ? 'चयनित' : 'सुनें →'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </ZeroScrollPager>
    </div>
  );
};
