import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Maximize2,
  X,
  Film,
  Flame,
  Music2,
} from 'lucide-react';
import agniSthapanaImg from '../assets/images/havan_agni_sthaapana_1794822292095.jpg';
import samidhaOfferingImg from '../assets/images/havan_samidha_offering_1794822293615.jpg';
import gayatriDhyanaImg from '../assets/images/havan_gayatri_dhyana_1794822294126.jpg';
import purnahutiAartiImg from '../assets/images/havan_purnahuti_aarti_1794822294524.jpg';
import { speakUma, stopUmaSpeech } from '../lib/umaSpeech';
import { triggerHapticSelection } from '../utils/haptics';

export type HavanMediaCategory = 'all' | 'agnisthapana' | 'ahuti' | 'dhyana' | 'purnahuti';

export interface HavanMediaClip {
  id: string;
  category: Exclude<HavanMediaCategory, 'all'>;
  linkedSteps: number[];
  primaryStep: number;
  durationSec: number;
  posterSrc: string;
  /** Optional local MP4/WebM asset reference under public/media when bundled */
  localVideoPath?: string;
  mantra: string;
  title: { hi: string; en: string; gu: string };
  stageLabel: { hi: string; en: string; gu: string };
  description: { hi: string; en: string; gu: string };
}

export const HAVAN_MEDIA_LIBRARY: HavanMediaClip[] = [
  {
    id: 'agni-sthapana',
    category: 'agnisthapana',
    linkedSteps: [1, 2],
    primaryStep: 1,
    durationSec: 135,
    posterSrc: agniSthapanaImg,
    localVideoPath: '/media/havan-agni-sthapana.mp4',
    mantra: 'ॐ भूर्भुवः स्वः अग्नये नमः।',
    title: {
      hi: 'अग्नि स्थापना व समिधा प्रज्वलन',
      en: 'Agni Sthapana & Sacred Kindling',
      gu: 'અગ્નિ સ્થાપના અને સમિધા પ્રજ્વલન',
    },
    stageLabel: {
      hi: 'चरण १–२ · प्रातः संध्या',
      en: 'Step 1–2 · Dawn Rite',
      gu: 'ચરણ ૧–૨ · પ્રાતઃ સંધ્યા',
    },
    description: {
      hi: 'ताम्र कुण्ड में शुद्धि, आचमन और कपूर-समिधा द्वारा शांत दिव्य अग्नि का आवाहन।',
      en: 'Purification around the copper kund, Achamana, and kindling steady sacred fire with camphor and samidha.',
      gu: 'તાંબાના કુંડમાં શુદ્ધિ, આચમન અને કપૂર-સમિધા દ્વારા દિવ્ય અગ્નિનું આવાહન.',
    },
  },
  {
    id: 'samidha-ghrita-ahuti',
    category: 'ahuti',
    linkedSteps: [3],
    primaryStep: 3,
    durationSec: 180,
    posterSrc: samidhaOfferingImg,
    localVideoPath: '/media/havan-samidha-ahuti.mp4',
    mantra: 'ॐ प्रजापतये स्वाहा। इदं प्रजापतये न मम॥',
    title: {
      hi: 'स्रुवा घृत व समिधा आहुति ध्यान',
      en: 'Sruva Ghee & Samagri Offerings',
      gu: 'સ્રુવા ઘૃત અને સામગ્રી આહુતિ ધ્યાન',
    },
    stageLabel: {
      hi: 'चरण ३ · मुख्य आहुति',
      en: 'Step 3 · Core Offerings',
      gu: 'ચરણ ૩ · મુખ્ય આહુતિ',
    },
    description: {
      hi: 'प्रत्येक स्वाहा उच्चारण के साथ स्रुवा से शुद्ध गौघृत और हवन सामग्री की लयबद्ध आहुति।',
      en: 'Measured ladle offerings of pure cow ghee and sacred herbs synchronized with calm Swaha chanting.',
      gu: 'દરેક સ્વાહા ઉચ્ચાર સાથે સ્રુવાથી શુદ્ધ ગૌઘૃત અને હવન સામગ્રીની લયબદ્ધ આહુતિ.',
    },
  },
  {
    id: 'gayatri-agni-dhyana',
    category: 'dhyana',
    linkedSteps: [4],
    primaryStep: 4,
    durationSec: 300,
    posterSrc: gayatriDhyanaImg,
    localVideoPath: '/media/havan-agni-dhyana.mp4',
    mantra: 'ॐ भूर्भुवः स्वः तत्सवितुर्वरेण्यं भर्गो देवस्य धीमहि।',
    title: {
      hi: 'गायत्री अग्नि त्राटक व मौन ध्यान',
      en: 'Steady Kund Flame & Gayatri Dhyana',
      gu: 'ગાયત્રી અગ્નિ ત્રાટક અને મૌન ધ્યાન',
    },
    stageLabel: {
      hi: 'चरण ४ · ध्यान सत्र',
      en: 'Step 4 · Meditative Gaze',
      gu: 'ચરણ ૪ · ધ્યાન સત્ર',
    },
    description: {
      hi: 'शांत प्रज्वलित अग्निशिखा के समक्ष बैठकर श्वास-प्रश्वास व गायत्री मन्त्र का मानसिक जप।',
      en: 'Quiet contemplation before serene glowing embers with gentle breath awareness and silent Gayatri japa.',
      gu: 'શાંત પ્રજ્વલિત અગ્નિશિખા સમક્ષ બેસીને શ્વાસ અને ગાયત્રી મંત્રનું માનસિક જપ.',
    },
  },
  {
    id: 'purnahuti-shanti-aarti',
    category: 'purnahuti',
    linkedSteps: [5],
    primaryStep: 5,
    durationSec: 165,
    posterSrc: purnahutiAartiImg,
    localVideoPath: '/media/havan-purnahuti.mp4',
    mantra: 'ॐ पूर्णमदः पूर्णमिदं पूर्णात्पूर्णमुदच्यते स्वाहा।',
    title: {
      hi: 'पूर्णाहुति, भस्म धारण व शान्ति पाठ',
      en: 'Purnahuti Finale & Peace Blessing',
      gu: 'પૂર્ણાહુતિ, ભસ્મ ધારણ અને શાંતિ પાઠ',
    },
    stageLabel: {
      hi: 'चरण ५ · पूर्णाहुति',
      en: 'Step 5 · Completion',
      gu: 'ચરણ ૫ · પૂર્ણાહુતિ',
    },
    description: {
      hi: 'श्रीफल-हवि के साथ पूर्णाहुति अर्पण, अग्नि प्रदक्षिणा और कल्याणकारी भस्म तिलक की विधि।',
      en: 'Offering the final Purnahuti coconut with herbs, quiet circumambulation, and applying sacred vibhuti tilak.',
      gu: 'શ્રીફળ સાથે પૂર્ણાહુતિ અર્પણ, અગ્નિ પ્રદક્ષિણા અને કલ્યાણકારી ભસ્મ તિલકની વિધિ.',
    },
  },
];

interface HavanMediaGalleryProps {
  lang: string;
  activeStep?: number | null;
  onSelectStep?: (step: number) => void;
}

function formatTime(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export const HavanMediaGallery: React.FC<HavanMediaGalleryProps> = ({
  lang,
  activeStep,
  onSelectStep,
}) => {
  const cLang = (lang || 'hi').slice(0, 2).toLowerCase() as 'hi' | 'en' | 'gu';
  const L = <T,>(hi: T, en: T, gu: T): T => (cLang === 'en' ? en : cLang === 'gu' ? gu : hi);
  const prefersReducedMotion = useReducedMotion();

  const [category, setCategory] = useState<HavanMediaCategory>('all');
  const [selectedId, setSelectedId] = useState<string>(HAVAN_MEDIA_LIBRARY[0].id);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [elapsedSec, setElapsedSec] = useState<number>(0);
  const [ambientAudioOn, setAmbientAudioOn] = useState<boolean>(false);
  const [isChantingMantra, setIsChantingMantra] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [videoAvailableMap, setVideoAvailableMap] = useState<Record<string, boolean>>({});
  const [brokenImageMap, setBrokenImageMap] = useState<Record<string, boolean>>({});

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const filteredClips = useMemo(() => {
    if (category === 'all') return HAVAN_MEDIA_LIBRARY;
    return HAVAN_MEDIA_LIBRARY.filter((clip) => clip.category === category);
  }, [category]);

  const activeClip = useMemo(() => {
    return (
      HAVAN_MEDIA_LIBRARY.find((c) => c.id === selectedId) ||
      filteredClips[0] ||
      HAVAN_MEDIA_LIBRARY[0]
    );
  }, [selectedId, filteredClips]);

  // Sync clip selection when user clicks a specific ritual step in NityaHavanView
  useEffect(() => {
    if (!activeStep) return;
    const matched = HAVAN_MEDIA_LIBRARY.find((clip) => clip.linkedSteps.includes(activeStep));
    if (matched && matched.id !== selectedId) {
      setCategory('all');
      setSelectedId(matched.id);
      setElapsedSec(0);
    }
  }, [activeStep]);

  // Meditative playback timer when playing in flame-still / ambient mode
  const hasPlayableVideo = Boolean(activeClip.localVideoPath && videoAvailableMap[activeClip.id]);

  useEffect(() => {
    if (!isPlaying || hasPlayableVideo) return;
    const id = window.setInterval(() => {
      setElapsedSec((prev) => {
        if (prev + 1 >= activeClip.durationSec) {
          return 0;
        }
        return prev + 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [isPlaying, hasPlayableVideo, activeClip.durationSec]);

  // Keep optional local HTML5 video synced if present
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid || !hasPlayableVideo) return;
    if (isPlaying) {
      void vid.play().catch(() => {
        // Autoplay restriction handled gracefully
      });
    } else {
      vid.pause();
    }
  }, [isPlaying, hasPlayableVideo, activeClip.id]);

  // Optional soothing sitar meditation audio (/sitar-path.ogg in /public)
  useEffect(() => {
    if (!ambientAudioOn || !isPlaying) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      return;
    }

    if (!audioRef.current) {
      const audio = new Audio('/sitar-path.ogg');
      audio.loop = true;
      audio.volume = 0.32;
      audioRef.current = audio;
    }

    void audioRef.current.play().catch(() => {
      setAmbientAudioOn(false);
    });
  }, [ambientAudioOn, isPlaying]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      stopUmaSpeech();
    };
  }, []);

  // Close expanded cinema dialog on Escape key
  useEffect(() => {
    if (!isExpanded) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsExpanded(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isExpanded]);

  const handleSelectClip = (clip: HavanMediaClip) => {
    triggerHapticSelection();
    setSelectedId(clip.id);
    setElapsedSec(0);
    setIsPlaying(true);
    onSelectStep?.(clip.primaryStep);
  };

  const handleStepNavigation = (direction: -1 | 1) => {
    triggerHapticSelection();
    const list = filteredClips.length > 0 ? filteredClips : HAVAN_MEDIA_LIBRARY;
    const currentIndex = list.findIndex((c) => c.id === activeClip.id);
    const nextIndex = (currentIndex + direction + list.length) % list.length;
    handleSelectClip(list[nextIndex]);
  };

  const handleTogglePlay = () => {
    triggerHapticSelection();
    setIsPlaying((prev) => !prev);
  };

  const handleToggleAmbientAudio = () => {
    triggerHapticSelection();
    setAmbientAudioOn((prev) => {
      const next = !prev;
      if (next && !isPlaying) {
        setIsPlaying(true);
      }
      return next;
    });
  };

  const handleSpeakStageMantra = () => {
    triggerHapticSelection();
    if (isChantingMantra) {
      stopUmaSpeech();
      setIsChantingMantra(false);
      return;
    }
    stopUmaSpeech();
    setIsChantingMantra(true);
    void speakUma(activeClip.mantra, {
      sanskritOnly: true,
      rate: 0.86,
      onEnd: () => setIsChantingMantra(false),
      onError: () => setIsChantingMantra(false),
    });
  };

  const handleScrub = (nextSec: number) => {
    setElapsedSec(nextSec);
    if (videoRef.current && hasPlayableVideo) {
      videoRef.current.currentTime = nextSec;
    }
  };

  const progressPercent = Math.min(
    100,
    Math.max(0, (elapsedSec / Math.max(1, activeClip.durationSec)) * 100)
  );

  const filterTabs: { id: HavanMediaCategory; label: string }[] = [
    { id: 'all', label: L('सभी', 'All', 'બધા') },
    { id: 'agnisthapana', label: L('प्रज्वलन', 'Kindling', 'પ્રજ્વલન') },
    { id: 'ahuti', label: L('आहुति', 'Offerings', 'આહુતિ') },
    { id: 'dhyana', label: L('ध्यान', 'Meditation', 'ધ્યાન') },
    { id: 'purnahuti', label: L('पूर्णाहुति', 'Finale', 'પૂર્ણાહુતિ') },
  ];

  const renderPlayerStage = (cinemaMode: boolean) => {
    const isImageBroken = Boolean(brokenImageMap[activeClip.id]);

    return (
      <div
        className={`relative w-full overflow-hidden bg-stone-950 ${
          cinemaMode ? 'aspect-video rounded-2xl' : 'aspect-video rounded-2xl border'
        }`}
        style={cinemaMode ? undefined : { borderColor: 'var(--bx-line)' }}
      >
        {/* Optional local MP4/WebM source if placed in public/media; smoothly falls back to meditative fire canvas */}
        {activeClip.localVideoPath && videoAvailableMap[activeClip.id] !== false && (
          <video
            ref={cinemaMode ? undefined : videoRef}
            key={activeClip.localVideoPath}
            src={activeClip.localVideoPath}
            poster={activeClip.posterSrc}
            playsInline
            loop
            muted
            onLoadedMetadata={() =>
              setVideoAvailableMap((prev) => ({ ...prev, [activeClip.id]: true }))
            }
            onTimeUpdate={(e) => setElapsedSec(Math.floor(e.currentTarget.currentTime))}
            onError={() =>
              setVideoAvailableMap((prev) => ({ ...prev, [activeClip.id]: false }))
            }
            className={`absolute inset-0 w-full h-full object-cover ${
              hasPlayableVideo ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          />
        )}

        {/* Meditative Fire Visual Backdrop (guaranteed zero broken frame) */}
        {!hasPlayableVideo && (
          <div className="absolute inset-0">
            {!isImageBroken ? (
              <motion.img
                key={activeClip.id}
                src={activeClip.posterSrc}
                alt={activeClip.title[cLang]}
                referrerPolicy="no-referrer"
                onError={() =>
                  setBrokenImageMap((prev) => ({ ...prev, [activeClip.id]: true }))
                }
                animate={
                  isPlaying && !prefersReducedMotion
                    ? { scale: [1, 1.045, 1.015] }
                    : { scale: 1 }
                }
                transition={
                  isPlaying && !prefersReducedMotion
                    ? { duration: 12, repeat: Infinity, ease: 'easeInOut' }
                    : { duration: 0.3 }
                }
                className="w-full h-full object-cover will-change-transform"
              />
            ) : (
              <div
                className="w-full h-full flex flex-col items-center justify-center gap-2 p-6 text-amber-100"
                style={{
                  background:
                    'radial-gradient(circle at 50% 60%, rgba(180,83,9,0.55), rgba(28,25,23,0.96) 72%)',
                }}
              >
                <Flame className="w-10 h-10 text-amber-400" />
                <span className="font-granth text-sm font-bold text-center">
                  {activeClip.title[cLang]}
                </span>
              </div>
            )}

            {/* Subtle Sacred Agni Luminance Breathing Glow */}
            {!prefersReducedMotion && (
              <motion.div
                aria-hidden="true"
                className="absolute inset-0 pointer-events-none"
                animate={
                  isPlaying
                    ? { opacity: [0.18, 0.36, 0.22] }
                    : { opacity: 0.14 }
                }
                transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                  background:
                    'radial-gradient(circle at 50% 62%, rgba(251, 146, 60, 0.38), transparent 60%)',
                }}
              />
            )}

            {/* Gentle Rising Ember Motes when actively meditating */}
            {isPlaying && !prefersReducedMotion && (
              <div aria-hidden="true" className="absolute inset-0 pointer-events-none overflow-hidden">
                {[0, 1, 2, 3, 4].map((idx) => (
                  <motion.span
                    key={idx}
                    className="absolute bottom-8 w-1.5 h-1.5 rounded-full bg-amber-300/75"
                    style={{ left: `${42 + idx * 4}%` }}
                    initial={{ opacity: 0, y: 0, scale: 0.7 }}
                    animate={{
                      opacity: [0, 0.85, 0],
                      y: [-8, -110 - idx * 14],
                      x: [0, idx % 2 === 0 ? 12 : -12],
                      scale: [0.7, 1, 0.4],
                    }}
                    transition={{
                      duration: 3.2 + idx * 0.45,
                      repeat: Infinity,
                      delay: idx * 0.55,
                      ease: 'easeOut',
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Measured Contrast Scrim for Overlaid Typography */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/25 pointer-events-none"
        />

        {/* Top Bar Inside Stage */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
          <div className="text-[11px] font-semibold text-amber-100/95 tracking-wide truncate drop-shadow-xs">
            <span>{activeClip.stageLabel[cLang]}</span>
            <span aria-hidden="true" className="mx-1.5 opacity-65">·</span>
            <span className="tabular-nums">{formatTime(activeClip.durationSec)}</span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleToggleAmbientAudio}
              className="min-h-[44px] min-w-[44px] px-2.5 rounded-xl bg-black/55 hover:bg-black/75 text-white border border-white/20 flex items-center justify-center gap-1.5 text-xs font-semibold backdrop-blur-xs cursor-pointer transition"
              aria-label={
                ambientAudioOn
                  ? L('पार्श्व संगीत बंद करें', 'Mute ambient sitar', 'પાર્શ્વ સંગીત બંધ કરો')
                  : L('ध्यान संगीत सुनें', 'Play ambient sitar', 'ધ્યાન સંગીત ચલાવો')
              }
              title={L('ध्यान सितार ध्वनि', 'Meditative Sitar Audio', 'ધ્યાન સિતાર ધ્વનિ')}
            >
              {ambientAudioOn ? (
                <Volume2 className="w-4 h-4 text-amber-300" />
              ) : (
                <VolumeX className="w-4 h-4 text-white/80" />
              )}
              <span className="hidden sm:inline whitespace-nowrap">
                {ambientAudioOn ? L('ध्वनि चालू', 'Sitar On', 'સિતાર ચાલુ') : L('ध्वनि', 'Audio', 'ધ્વનિ')}
              </span>
            </button>

            {!cinemaMode ? (
              <button
                type="button"
                onClick={() => {
                  triggerHapticSelection();
                  setIsExpanded(true);
                }}
                className="min-h-[44px] min-w-[44px] rounded-xl bg-black/55 hover:bg-black/75 text-white border border-white/20 flex items-center justify-center backdrop-blur-xs cursor-pointer transition"
                aria-label={L('बड़े पर्दे में देखें', 'Expand meditative view', 'મોટા પડદામાં જુઓ')}
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  triggerHapticSelection();
                  setIsExpanded(false);
                }}
                className="min-h-[44px] min-w-[44px] rounded-xl bg-black/60 hover:bg-black/80 text-white border border-white/20 flex items-center justify-center backdrop-blur-xs cursor-pointer transition"
                aria-label={L('बंद करें', 'Close cinema view', 'બંધ કરો')}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Center Play/Pause Tap Target */}
        <button
          type="button"
          onClick={handleTogglePlay}
          className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-black/55 hover:bg-amber-600/85 text-white border border-amber-200/45 flex items-center justify-center backdrop-blur-xs cursor-pointer transition active:scale-95 focus-visible:outline-2 focus-visible:outline-amber-300"
          aria-label={
            isPlaying
              ? L('विराम दें', 'Pause ceremony view', 'રોકો')
              : L('ध्यान चलचित्र आरंभ करें', 'Play ceremony view', 'ધ્યાન ચલાવો')
          }
        >
          {isPlaying ? (
            <Pause className="w-6 h-6 fill-current" />
          ) : (
            <Play className="w-6 h-6 fill-current ml-0.5" />
          )}
        </button>

        {/* Bottom Caption & Transport Controls */}
        <div className="absolute bottom-0 inset-x-0 p-3 sm:p-4 space-y-2">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="font-granth text-sm sm:text-base font-black text-white leading-snug truncate">
                {activeClip.title[cLang]}
              </h3>
              <p className="text-xs text-amber-100/90 line-clamp-1 mt-0.5">
                {activeClip.mantra}
              </p>
            </div>
            <span className="text-[11px] font-semibold text-white/85 tabular-nums shrink-0">
              {formatTime(elapsedSec)} / {formatTime(activeClip.durationSec)}
            </span>
          </div>

          {/* Interactive Scrubber */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleStepNavigation(-1)}
              className="min-h-[44px] min-w-[44px] -ml-1.5 rounded-xl text-white/85 hover:text-white flex items-center justify-center cursor-pointer transition"
              aria-label={L('पिछला दृश्य', 'Previous ceremony clip', 'પાછલું દ્રશ્ય')}
            >
              <SkipBack className="w-4 h-4" />
            </button>

            <div className="relative flex-1 flex items-center">
              <div className="w-full h-1.5 rounded-full bg-white/25 overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full transition-[width] duration-300 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <input
                type="range"
                min={0}
                max={activeClip.durationSec}
                value={elapsedSec}
                onChange={(e) => handleScrub(Number(e.target.value))}
                aria-label={L('सत्र समय स्लाइडर', 'Ceremony playback progress', 'સત્ર સમય સ્લાઇડર')}
                className="absolute inset-0 w-full h-8 opacity-0 cursor-pointer"
              />
            </div>

            <button
              type="button"
              onClick={() => handleStepNavigation(1)}
              className="min-h-[44px] min-w-[44px] -mr-1.5 rounded-xl text-white/85 hover:text-white flex items-center justify-center cursor-pointer transition"
              aria-label={L('अगला दृश्य', 'Next ceremony clip', 'આગળનું દ્રશ્ય')}
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <section
        className="rounded-3xl border p-4 sm:p-5 space-y-3.5 shadow-xs"
        style={{
          backgroundColor: 'var(--bx-panel)',
          borderColor: 'var(--bx-line)',
          color: 'var(--bx-ink)',
        }}
      >
        {/* Header Row */}
        <div
          className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b"
          style={{ borderColor: 'var(--bx-line)' }}
        >
          <div>
            <h2
              className="font-granth text-base sm:text-lg font-black flex items-center gap-2"
              style={{ color: 'var(--bx-header)' }}
            >
              <Film className="w-4 h-4 shrink-0" style={{ color: 'var(--bx-gold)' }} />
              <span>
                {L(
                  'हवन ध्यान व विधि चलचित्र दीर्घा',
                  'Meditative Havan Ceremony Gallery',
                  'હવન ધ્યાન અને વિધિ ચલચિત્ર ગેલેરી'
                )}
              </span>
            </h2>
            <p className="text-xs opacity-80 mt-0.5">
              {L(
                'पाँच चरणीय हवन विधि के साथ लयबद्ध अग्नि-ध्यान दृश्य एवं मन्त्र श्रवण',
                'Guided fire contemplation clips synchronized with your 5-step Havan Vidhi',
                'પાંચ ચરણીય હવન વિધિ સાથે અગ્નિ-ધ્યાન દ્રશ્યો અને મંત્ર શ્રવણ'
              )}
            </p>
          </div>

          <button
            type="button"
            onClick={handleSpeakStageMantra}
            className="min-h-[44px] px-3.5 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer transition whitespace-nowrap shrink-0"
            style={{
              backgroundColor: isChantingMantra ? 'var(--bx-gold)' : 'var(--bx-cream)',
              color: isChantingMantra ? '#FFFFFF' : 'var(--bx-header)',
              borderColor: 'var(--bx-line)',
            }}
          >
            <Music2 className="w-4 h-4 shrink-0" />
            <span>
              {isChantingMantra
                ? L('मन्त्र विराम', 'Stop Chant', 'મંત્ર રોકો')
                : L('चरण मन्त्र सुनें', 'Chant Stage Mantra', 'ચરણ મંત્ર સાંભળો')}
            </span>
          </button>
        </div>

        {/* Category Segmented Filter Bar */}
        <div
          className="flex items-center gap-1.5 overflow-x-auto pb-0.5"
          role="tablist"
          aria-label={L('हवन दृश्य श्रेणी', 'Havan video categories', 'હવન દ્રશ્ય શ્રેણી')}
        >
          {filterTabs.map((tab) => {
            const active = category === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => {
                  triggerHapticSelection();
                  setCategory(tab.id);
                  const firstMatch =
                    tab.id === 'all'
                      ? HAVAN_MEDIA_LIBRARY[0]
                      : HAVAN_MEDIA_LIBRARY.find((c) => c.category === tab.id);
                  if (firstMatch) {
                    setSelectedId(firstMatch.id);
                    setElapsedSec(0);
                    onSelectStep?.(firstMatch.primaryStep);
                  }
                }}
                className="min-h-[40px] px-3 py-1.5 rounded-xl border text-xs font-bold whitespace-nowrap shrink-0 cursor-pointer transition"
                style={{
                  backgroundColor: active ? 'var(--bx-header)' : 'var(--bx-cream)',
                  color: active ? '#FFFFFF' : 'var(--bx-ink)',
                  borderColor: active ? 'var(--bx-gold)' : 'var(--bx-line)',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Primary 16:9 Meditative Video / Fire Stage */}
        {renderPlayerStage(false)}

        {/* Active Clip Description (Clean Unboxed Prose) */}
        <div className="px-1 space-y-1">
          <div className="text-xs font-medium leading-relaxed opacity-90">
            {activeClip.description[cLang]}
          </div>
        </div>

        {/* Curated Library Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          {filteredClips.map((clip) => {
            const isSelected = clip.id === activeClip.id;
            const thumbBroken = Boolean(brokenImageMap[clip.id]);

            return (
              <button
                key={clip.id}
                type="button"
                onClick={() => handleSelectClip(clip)}
                className="group min-h-[68px] p-2 rounded-2xl border text-left flex items-center gap-3 cursor-pointer transition focus-visible:outline-2"
                style={{
                  backgroundColor: isSelected ? 'var(--bx-header)' : 'var(--bx-cream)',
                  color: isSelected ? '#FFFFFF' : 'var(--bx-ink)',
                  borderColor: isSelected ? 'var(--bx-gold)' : 'var(--bx-line)',
                }}
              >
                <div className="relative w-20 aspect-video rounded-xl overflow-hidden shrink-0 bg-stone-900">
                  {!thumbBroken ? (
                    <img
                      src={clip.posterSrc}
                      alt={clip.title[cLang]}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-amber-950 text-amber-300">
                      <Flame className="w-4 h-4" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                    {isSelected && isPlaying ? (
                      <Pause className="w-4 h-4 text-white fill-current drop-shadow" />
                    ) : (
                      <Play className="w-4 h-4 text-white fill-current drop-shadow ml-0.5" />
                    )}
                  </div>
                </div>

                <div className="min-w-0 flex-1 space-y-0.5">
                  <div
                    className="text-xs font-black truncate"
                    style={{ color: isSelected ? '#FFFFFF' : 'var(--bx-header)' }}
                  >
                    {clip.title[cLang]}
                  </div>
                  <div
                    className={`text-[11px] font-medium truncate ${
                      isSelected ? 'text-amber-100/90' : 'opacity-75'
                    }`}
                  >
                    <span>{clip.stageLabel[cLang]}</span>
                    <span aria-hidden="true" className="mx-1">·</span>
                    <span className="tabular-nums">{formatTime(clip.durationSec)}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Cinema / Meditative Focus Overlay Modal */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setIsExpanded(false)}
          >
            <motion.div
              initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-4xl space-y-3"
              onClick={(e) => e.stopPropagation()}
            >
              {renderPlayerStage(true)}
              <p className="text-center text-xs text-amber-100/85 px-2 leading-relaxed">
                {activeClip.description[cLang]}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default HavanMediaGallery;
