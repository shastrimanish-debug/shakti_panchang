import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  AudioLines,
  Repeat,
  Clock,
} from 'lucide-react';
import agniSthapanaImg from '../assets/images/havan_agni_sthaapana_1794822292095.jpg';
import samidhaOfferingImg from '../assets/images/havan_samidha_offering_1794822293615.jpg';
import gayatriDhyanaImg from '../assets/images/havan_gayatri_dhyana_1794822294126.jpg';
import purnahutiAartiImg from '../assets/images/havan_purnahuti_aarti_1794822294524.jpg';
import { speakUma, stopUmaSpeech } from '../lib/umaSpeech';
import { triggerHapticSelection } from '../utils/haptics';

export type HavanExperienceMode = 'video' | 'soundscape';
export type HavanMediaCategory = 'all' | 'agnisthapana' | 'ahuti' | 'dhyana' | 'purnahuti';
export type SoundscapeTrackId = 'vedic_om_tanpura' | 'temple_sitar' | 'agni_chant_loop';

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

export interface SoundscapeTrack {
  id: SoundscapeTrackId;
  frequencyTag: string;
  defaultChantLoop: boolean;
  title: { hi: string; en: string; gu: string };
  subtitle: { hi: string; en: string; gu: string };
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

export const SOUNDSCAPE_TRACKS: SoundscapeTrack[] = [
  {
    id: 'vedic_om_tanpura',
    frequencyTag: '136.1 Hz · Sa-Pa Drone',
    defaultChantLoop: false,
    title: {
      hi: 'वैदिक तानपुरा व ॐ नाद',
      en: 'Vedic Tanpura & Sacred Om',
      gu: 'વૈદિક તાનપુરા અને ૐ નાદ',
    },
    subtitle: {
      hi: 'अविरल स्वर ध्यान',
      en: 'Continuous Harmonic Drone',
      gu: 'અવિરત સ્વર ધ્યાન',
    },
    description: {
      hi: 'षड्ज-पञ्चम (136.1 Hz) के शांत तानपुरा नाद के साथ एकाग्र प्राणायाम और मौन हवन ध्यान।',
      en: 'Steady 136.1 Hz Sa-Pa tanpura resonance tuned for deep pranayama and serene fire contemplation.',
      gu: 'ષડ્જ-પંચમ (136.1 Hz) ના શાંત તાનપુરા નાદ સાથે એકાગ્ર પ્રાણાયામ અને હવન ધ્યાન.',
    },
  },
  {
    id: 'temple_sitar',
    frequencyTag: 'Raga Acoustic Loop',
    defaultChantLoop: false,
    title: {
      hi: 'मन्दिर सितार ध्यान चक्र',
      en: 'Temple Sitar Meditation Loop',
      gu: 'મંદિર સિતાર ધ્યાન ચક્ર',
    },
    subtitle: {
      hi: 'शास्त्रीय वाद्य वातावरण',
      en: 'Soothing Instrumental Loop',
      gu: 'શાસ્ત્રીય વાદ્ય વાતાવરણ',
    },
    description: {
      hi: 'मन्दिर प्रांगण जैसा मधुर सितार वादन जो आहुति एवं ध्यान सत्र को शान्त लय प्रदान करता है।',
      en: 'Gentle continuous temple sitar strings creating a peaceful sanctuary atmosphere throughout your ritual.',
      gu: 'મંદિર પ્રાંગણ જેવું મધુર સિતાર વાદન જે આહુતિ અને ધ્યાન સત્રને શાંત લય આપે છે.',
    },
  },
  {
    id: 'agni_chant_loop',
    frequencyTag: 'Embers · Mantra Loop',
    defaultChantLoop: true,
    title: {
      hi: 'अग्नि ध्वनि व वैदिक मन्त्र आवृत्ति',
      en: 'Hearth Embers & Mantra Loop',
      gu: 'અગ્નિ ધ્વનિ અને વૈદિક મંત્ર આવૃત્તિ',
    },
    subtitle: {
      hi: 'लयबद्ध संस्कृत उच्चारण',
      en: 'Timed Vedic Chanting Loop',
      gu: 'લયબદ્ધ સંસ્કૃત ઉચ્ચારણ',
    },
    description: {
      hi: 'समिधा की कोमल ऊष्मा ध्वनि के साथ वर्तमान हवन चरण के संस्कृत मन्त्र का आवृत्तिमय जप।',
      en: 'Soft glowing ember warmth paired with calm periodic Vedic Sanskrit recitation for the active ritual step.',
      gu: 'સમિધાના કોમળ નાદ સાથે વર્તમાન હવન ચરણના સંસ્કૃત મંત્રનું આવૃત્તિમય પઠન.',
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

function playSoftTempleChime() {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const harmonic = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    harmonic.type = 'triangle';
    osc.frequency.setValueAtTime(528, now);
    harmonic.frequency.setValueAtTime(1056, now);
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.11, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);
    osc.connect(gain);
    harmonic.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    harmonic.start(now);
    osc.stop(now + 1.85);
    harmonic.stop(now + 1.85);
  } catch {
    // Ignore autoplay blocks
  }
}

export const HavanMediaGallery: React.FC<HavanMediaGalleryProps> = ({
  lang,
  activeStep,
  onSelectStep,
}) => {
  const cLang = (lang || 'hi').slice(0, 2).toLowerCase() as 'hi' | 'en' | 'gu';
  const L = <T,>(hi: T, en: T, gu: T): T => (cLang === 'en' ? en : cLang === 'gu' ? gu : hi);
  const prefersReducedMotion = useReducedMotion();

  const [experienceMode, setExperienceMode] = useState<HavanExperienceMode>('video');
  const [category, setCategory] = useState<HavanMediaCategory>('all');
  const [selectedId, setSelectedId] = useState<string>(HAVAN_MEDIA_LIBRARY[0].id);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [elapsedSec, setElapsedSec] = useState<number>(0);
  const [ambientAudioOn, setAmbientAudioOn] = useState<boolean>(false);
  const [isChantingMantra, setIsChantingMantra] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [videoAvailableMap, setVideoAvailableMap] = useState<Record<string, boolean>>({});
  const [brokenImageMap, setBrokenImageMap] = useState<Record<string, boolean>>({});

  // Soothing Background Soundscape State
  const [soundscapeTrackId, setSoundscapeTrackId] =
    useState<SoundscapeTrackId>('vedic_om_tanpura');
  const [isSoundscapePlaying, setIsSoundscapePlaying] = useState<boolean>(false);
  const [soundscapeVolume, setSoundscapeVolume] = useState<number>(0.45);
  const [chantLoopEnabled, setChantLoopEnabled] = useState<boolean>(false);
  const [sessionMinutes, setSessionMinutes] = useState<number>(0); // 0 = continuous
  const [sessionRemainingSec, setSessionRemainingSec] = useState<number | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const sitarAudioRef = useRef<HTMLAudioElement | null>(null);
  const webAudioCleanupRef = useRef<(() => void) | null>(null);
  const webAudioMasterGainRef = useRef<GainNode | null>(null);
  const webAudioCtxRef = useRef<AudioContext | null>(null);

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

  const activeSoundscapeTrack = useMemo(() => {
    return (
      SOUNDSCAPE_TRACKS.find((t) => t.id === soundscapeTrackId) || SOUNDSCAPE_TRACKS[0]
    );
  }, [soundscapeTrackId]);

  const stopSyntheticSoundscape = useCallback(() => {
    if (webAudioCleanupRef.current) {
      webAudioCleanupRef.current();
      webAudioCleanupRef.current = null;
    }
    webAudioMasterGainRef.current = null;
  }, []);

  const startSyntheticSoundscape = useCallback(
    (kind: 'vedic_om_tanpura' | 'agni_chant_loop', initialVol: number) => {
      stopSyntheticSoundscape();
      try {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!AudioCtx) return;

        const ctx = webAudioCtxRef.current && webAudioCtxRef.current.state !== 'closed'
          ? webAudioCtxRef.current
          : new AudioCtx();
        webAudioCtxRef.current = ctx;

        if (ctx.state === 'suspended') {
          void ctx.resume();
        }

        const masterGain = ctx.createGain();
        const scaledGain = Math.max(0.0001, Math.min(0.45, initialVol * 0.42));
        masterGain.gain.setValueAtTime(0.0001, ctx.currentTime);
        masterGain.gain.exponentialRampToValueAtTime(scaledGain, ctx.currentTime + 0.9);
        masterGain.connect(ctx.destination);
        webAudioMasterGainRef.current = masterGain;

        const stopCallbacks: (() => void)[] = [];

        if (kind === 'vedic_om_tanpura') {
          const breathGain = ctx.createGain();
          breathGain.gain.setValueAtTime(0.85, ctx.currentTime);
          breathGain.connect(masterGain);

          const filter = ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(420, ctx.currentTime);
          filter.connect(breathGain);

          // 136.1 Hz Cosmic Om fundamental + Fifth (204.15 Hz) + Octave (272.2 Hz)
          const freqs = [
            { f: 136.1, type: 'sine' as OscillatorType, g: 0.42 },
            { f: 204.15, type: 'triangle' as OscillatorType, g: 0.16 },
            { f: 272.2, type: 'sine' as OscillatorType, g: 0.14 },
          ];

          const lfo = ctx.createOscillator();
          const lfoGain = ctx.createGain();
          lfo.frequency.setValueAtTime(0.16, ctx.currentTime);
          lfoGain.gain.setValueAtTime(0.1, ctx.currentTime);
          lfo.connect(lfoGain);
          lfoGain.connect(breathGain.gain);
          lfo.start();
          stopCallbacks.push(() => {
            try {
              lfo.stop();
            } catch {
              // Ignore
            }
          });

          freqs.forEach(({ f, type, g }) => {
            const osc = ctx.createOscillator();
            const gNode = ctx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(f, ctx.currentTime);
            gNode.gain.setValueAtTime(g, ctx.currentTime);
            osc.connect(gNode);
            gNode.connect(filter);
            osc.start();
            stopCallbacks.push(() => {
              try {
                osc.stop();
              } catch {
                // Ignore
              }
            });
          });
        } else {
          // Soft Hearth Ember Warmth (Brownian filtered noise + gentle low drone)
          const bufferSize = ctx.sampleRate * 3;
          const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
          const output = noiseBuffer.getChannelData(0);
          let lastOut = 0.0;
          for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            output[i] = (lastOut + 0.02 * white) / 1.02;
            lastOut = output[i];
            output[i] *= 2.4;
          }
          const whiteNoise = ctx.createBufferSource();
          whiteNoise.buffer = noiseBuffer;
          whiteNoise.loop = true;

          const lowpass = ctx.createBiquadFilter();
          lowpass.type = 'lowpass';
          lowpass.frequency.setValueAtTime(340, ctx.currentTime);

          const noiseGain = ctx.createGain();
          noiseGain.gain.setValueAtTime(0.32, ctx.currentTime);

          whiteNoise.connect(lowpass);
          lowpass.connect(noiseGain);
          noiseGain.connect(masterGain);
          whiteNoise.start();

          // Subtle grounding 108 Hz Om hum underneath
          const hum = ctx.createOscillator();
          const humGain = ctx.createGain();
          hum.type = 'sine';
          hum.frequency.setValueAtTime(136.1, ctx.currentTime);
          humGain.gain.setValueAtTime(0.14, ctx.currentTime);
          hum.connect(humGain);
          humGain.connect(masterGain);
          hum.start();

          stopCallbacks.push(() => {
            try {
              whiteNoise.stop();
              hum.stop();
            } catch {
              // Ignore
            }
          });
        }

        webAudioCleanupRef.current = () => {
          stopCallbacks.forEach((fn) => fn());
          try {
            masterGain.disconnect();
          } catch {
            // Ignore
          }
        };
      } catch {
        // Ignore restricted audio environments
      }
    },
    [stopSyntheticSoundscape]
  );

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

  // Meditative playback timer when playing in flame-still video mode
  const hasPlayableVideo = Boolean(activeClip.localVideoPath && videoAvailableMap[activeClip.id]);

  useEffect(() => {
    if (experienceMode !== 'video' || !isPlaying || hasPlayableVideo) return;
    const id = window.setInterval(() => {
      setElapsedSec((prev) => {
        if (prev + 1 >= activeClip.durationSec) {
          return 0;
        }
        return prev + 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [experienceMode, isPlaying, hasPlayableVideo, activeClip.durationSec]);

  // Keep optional local HTML5 video synced if present
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid || !hasPlayableVideo) return;
    if (experienceMode === 'video' && isPlaying) {
      void vid.play().catch(() => {
        // Autoplay restriction handled gracefully
      });
    } else {
      vid.pause();
    }
  }, [experienceMode, isPlaying, hasPlayableVideo, activeClip.id]);

  // Unified Audio Engine across Video ambient sitar & Soundscape mode
  useEffect(() => {
    const shouldPlaySitarInVideo =
      experienceMode === 'video' && ambientAudioOn && isPlaying;
    const shouldPlaySitarInSoundscape =
      experienceMode === 'soundscape' &&
      isSoundscapePlaying &&
      soundscapeTrackId === 'temple_sitar';

    if (shouldPlaySitarInVideo || shouldPlaySitarInSoundscape) {
      if (!sitarAudioRef.current) {
        const audio = new Audio('/sitar-path.ogg');
        audio.loop = true;
        sitarAudioRef.current = audio;
      }
      sitarAudioRef.current.volume =
        experienceMode === 'soundscape' ? soundscapeVolume : 0.32;
      void sitarAudioRef.current.play().catch(() => {
        if (experienceMode === 'video') setAmbientAudioOn(false);
        else setIsSoundscapePlaying(false);
      });
    } else if (sitarAudioRef.current) {
      sitarAudioRef.current.pause();
    }

    const shouldPlaySynthSoundscape =
      experienceMode === 'soundscape' &&
      isSoundscapePlaying &&
      (soundscapeTrackId === 'vedic_om_tanpura' ||
        soundscapeTrackId === 'agni_chant_loop');

    if (shouldPlaySynthSoundscape) {
      startSyntheticSoundscape(
        soundscapeTrackId as 'vedic_om_tanpura' | 'agni_chant_loop',
        soundscapeVolume
      );
    } else {
      stopSyntheticSoundscape();
    }
  }, [
    experienceMode,
    ambientAudioOn,
    isPlaying,
    isSoundscapePlaying,
    soundscapeTrackId,
    startSyntheticSoundscape,
    stopSyntheticSoundscape,
  ]);

  // Live volume adjustment without restarting audio generators
  useEffect(() => {
    if (sitarAudioRef.current) {
      sitarAudioRef.current.volume =
        experienceMode === 'soundscape' ? soundscapeVolume : 0.32;
    }
    if (webAudioMasterGainRef.current && webAudioCtxRef.current) {
      try {
        const nextGain = Math.max(0.0001, Math.min(0.45, soundscapeVolume * 0.42));
        webAudioMasterGainRef.current.gain.setTargetAtTime(
          nextGain,
          webAudioCtxRef.current.currentTime,
          0.08
        );
      } catch {
        // Ignore
      }
    }
  }, [soundscapeVolume, experienceMode]);

  // Periodic Vedic Chanting Loop when Soundscape + Chant Loop are active
  useEffect(() => {
    if (experienceMode !== 'soundscape' || !isSoundscapePlaying || !chantLoopEnabled) {
      return;
    }

    let cancelled = false;
    let loopTimer: number | undefined;

    const triggerMantraCycle = () => {
      if (cancelled) return;
      const chantLine = `${activeClip.mantra} ॐ शान्तिः शान्तिः शान्तिः।`;
      setIsChantingMantra(true);
      void speakUma(chantLine, {
        sanskritOnly: true,
        rate: 0.84,
        onEnd: () => {
          if (cancelled) return;
          setIsChantingMantra(false);
          loopTimer = window.setTimeout(triggerMantraCycle, 6500);
        },
        onError: () => {
          if (cancelled) return;
          setIsChantingMantra(false);
        },
      });
    };

    triggerMantraCycle();

    return () => {
      cancelled = true;
      if (loopTimer !== undefined) {
        window.clearTimeout(loopTimer);
      }
      stopUmaSpeech();
      setIsChantingMantra(false);
    };
  }, [experienceMode, isSoundscapePlaying, chantLoopEnabled, activeClip.mantra]);

  // Meditation Session Timer Countdown inside Soundscape Mode
  useEffect(() => {
    if (
      experienceMode !== 'soundscape' ||
      !isSoundscapePlaying ||
      sessionMinutes <= 0
    ) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setSessionRemainingSec((prev) => {
        if (prev === null) return sessionMinutes * 60;
        if (prev <= 1) {
          setIsSoundscapePlaying(false);
          playSoftTempleChime();
          return sessionMinutes * 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [experienceMode, isSoundscapePlaying, sessionMinutes]);

  // Cleanup everything on unmount
  useEffect(() => {
    return () => {
      if (sitarAudioRef.current) {
        sitarAudioRef.current.pause();
        sitarAudioRef.current = null;
      }
      stopSyntheticSoundscape();
      if (webAudioCtxRef.current && webAudioCtxRef.current.state !== 'closed') {
        void webAudioCtxRef.current.close().catch(() => {});
      }
      stopUmaSpeech();
    };
  }, [stopSyntheticSoundscape]);

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

  const handleSelectMode = (mode: HavanExperienceMode) => {
    triggerHapticSelection();
    if (mode === experienceMode) return;
    if (mode === 'soundscape') {
      setIsPlaying(false);
      if (ambientAudioOn) {
        setSoundscapeTrackId('temple_sitar');
        setIsSoundscapePlaying(true);
      }
    } else {
      setIsSoundscapePlaying(false);
      stopUmaSpeech();
      setIsChantingMantra(false);
    }
    setExperienceMode(mode);
  };

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

  const handleSelectSoundscapeTrack = (track: SoundscapeTrack) => {
    triggerHapticSelection();
    setSoundscapeTrackId(track.id);
    setChantLoopEnabled(track.defaultChantLoop);
    setIsSoundscapePlaying(true);
    if (sessionMinutes > 0 && sessionRemainingSec === null) {
      setSessionRemainingSec(sessionMinutes * 60);
    }
  };

  const handleSelectTimer = (minutes: number) => {
    triggerHapticSelection();
    setSessionMinutes(minutes);
    setSessionRemainingSec(minutes > 0 ? minutes * 60 : null);
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

            {!prefersReducedMotion && (
              <motion.div
                aria-hidden="true"
                className="absolute inset-0 pointer-events-none"
                animate={
                  isPlaying ? { opacity: [0.18, 0.36, 0.22] } : { opacity: 0.14 }
                }
                transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                  background:
                    'radial-gradient(circle at 50% 62%, rgba(251, 146, 60, 0.38), transparent 60%)',
                }}
              />
            )}

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

  const renderSoundscapeStage = () => {
    const isImageBroken = Boolean(brokenImageMap[activeClip.id]);
    const volumePct = Math.round(soundscapeVolume * 100);

    return (
      <div className="space-y-3">
        {/* Serene Acoustic Sanctuary Stage */}
        <div
          className="relative w-full min-h-[260px] sm:aspect-video rounded-2xl overflow-hidden border bg-stone-950 flex flex-col justify-between p-4 sm:p-5"
          style={{ borderColor: 'var(--bx-line)' }}
        >
          {/* Dimmed Sacred Agni Backdrop */}
          {!isImageBroken && (
            <img
              src={activeClip.posterSrc}
              alt={activeSoundscapeTrack.title[cLang]}
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover opacity-35"
            />
          )}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-stone-950/95 via-stone-950/65 to-stone-950/70"
          />

          {/* Top Soundscape Metadata Strip (Zero-Pill Clean Text) */}
          <div className="relative flex flex-wrap items-center justify-between gap-2 text-xs text-amber-100/90">
            <div className="truncate">
              <span>{activeSoundscapeTrack.subtitle[cLang]}</span>
              <span aria-hidden="true" className="mx-1.5 opacity-60">·</span>
              <span className="tabular-nums">{activeSoundscapeTrack.frequencyTag}</span>
            </div>
            <div className="flex items-center gap-1.5 tabular-nums shrink-0 text-amber-200 font-semibold">
              <Clock className="w-3.5 h-3.5" />
              <span>
                {sessionMinutes === 0
                  ? L('अविरल लय', 'Continuous Loop', 'અવિરત લય')
                  : formatTime(sessionRemainingSec ?? sessionMinutes * 60)}
              </span>
            </div>
          </div>

          {/* Center Harmonic Bars & Play Control */}
          <div className="relative my-3 flex flex-col items-center text-center space-y-3">
            {/* Subtle Harmonic Resonance Bars (Compositor-Only scaleY) */}
            <div className="flex items-end justify-center gap-1.5 h-9" aria-hidden="true">
              {[0.55, 0.9, 1, 0.8, 0.5].map((baseHeight, idx) => (
                <motion.span
                  key={idx}
                  className="w-1.5 h-8 rounded-full bg-amber-300/85 origin-bottom"
                  animate={
                    isSoundscapePlaying && !prefersReducedMotion
                      ? {
                          scaleY: [baseHeight * 0.45, baseHeight, baseHeight * 0.55],
                          opacity: [0.55, 0.95, 0.65],
                        }
                      : { scaleY: baseHeight * 0.4, opacity: 0.45 }
                  }
                  transition={
                    isSoundscapePlaying && !prefersReducedMotion
                      ? {
                          duration: 1.5 + idx * 0.22,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }
                      : { duration: 0.2 }
                  }
                />
              ))}
            </div>

            <div className="space-y-1 max-w-md">
              <h3 className="font-granth text-base sm:text-lg font-black text-white leading-snug">
                {activeSoundscapeTrack.title[cLang]}
              </h3>
              <p className="text-xs text-amber-100/85 leading-relaxed">
                {activeSoundscapeTrack.description[cLang]}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2.5">
              <button
                type="button"
                onClick={() => {
                  triggerHapticSelection();
                  setIsSoundscapePlaying((prev) => !prev);
                }}
                className="min-h-[44px] px-5 py-2 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-black flex items-center gap-2 shadow-sm cursor-pointer active:scale-[0.98] transition whitespace-nowrap shrink-0"
              >
                {isSoundscapePlaying ? (
                  <>
                    <Pause className="w-4 h-4 fill-current" />
                    <span>{L('नाद विराम दें', 'Pause Soundscape', 'નાદ રોકો')}</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>{L('शान्त नाद आरम्भ करें', 'Start Soundscape', 'શાંત નાદ શરૂ કરો')}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  triggerHapticSelection();
                  setChantLoopEnabled((prev) => !prev);
                }}
                aria-pressed={chantLoopEnabled}
                className={`min-h-[44px] px-3.5 py-2 rounded-2xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer transition whitespace-nowrap shrink-0 ${
                  chantLoopEnabled
                    ? 'bg-white/20 text-amber-200 border-amber-300/60'
                    : 'bg-black/45 text-white/85 border-white/20 hover:bg-black/65'
                }`}
              >
                <Repeat className="w-3.5 h-3.5 shrink-0" />
                <span>
                  {chantLoopEnabled
                    ? L('मन्त्र आवृत्ति चालू', 'Mantra Loop On', 'મંત્ર આવૃત્તિ ચાલુ')
                    : L('मन्त्र आवृत्ति जोड़ें', 'Add Mantra Loop', 'મંત્ર આવૃત્તિ ઉમેરો')}
                </span>
              </button>
            </div>
          </div>

          {/* Bottom Volume & Timer Strip */}
          <div className="relative flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/15">
            <div className="flex items-center gap-2 min-w-[160px] flex-1">
              <Volume2 className="w-4 h-4 text-amber-200 shrink-0" />
              <input
                type="range"
                min={0.05}
                max={1}
                step={0.05}
                value={soundscapeVolume}
                onChange={(e) => setSoundscapeVolume(Number(e.target.value))}
                aria-label={L('नाद ध्वनि स्तर', 'Soundscape volume', 'નાદ ધ્વનિ સ્તર')}
                className="w-full max-w-[180px] accent-amber-400 cursor-pointer"
              />
              <span className="text-[11px] text-amber-100/85 font-semibold tabular-nums w-9">
                {volumePct}%
              </span>
            </div>

            <div className="flex items-center gap-1" role="group" aria-label={L('ध्यान अवधि', 'Meditation timer', 'ધ્યાન સમય')}>
              {[
                { m: 0, label: L('अविरल', 'Loop', 'અવિરત') },
                { m: 5, label: '5m' },
                { m: 11, label: '11m' },
                { m: 21, label: '21m' },
              ].map((opt) => {
                const selected = sessionMinutes === opt.m;
                return (
                  <button
                    key={opt.m}
                    type="button"
                    onClick={() => handleSelectTimer(opt.m)}
                    className={`min-h-[40px] px-2.5 rounded-xl border text-[11px] font-bold tabular-nums cursor-pointer transition whitespace-nowrap shrink-0 ${
                      selected
                        ? 'bg-amber-400 text-stone-950 border-amber-300'
                        : 'bg-black/45 text-white/80 border-white/20 hover:text-white'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Curated Soundscape Selector Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {SOUNDSCAPE_TRACKS.map((track) => {
            const isSelected = track.id === soundscapeTrackId;
            return (
              <button
                key={track.id}
                type="button"
                onClick={() => handleSelectSoundscapeTrack(track)}
                className="min-h-[68px] p-3 rounded-2xl border text-left flex flex-col justify-between gap-1 cursor-pointer transition"
                style={{
                  backgroundColor: isSelected ? 'var(--bx-header)' : 'var(--bx-cream)',
                  color: isSelected ? '#FFFFFF' : 'var(--bx-ink)',
                  borderColor: isSelected ? 'var(--bx-gold)' : 'var(--bx-line)',
                }}
              >
                <div
                  className="text-xs font-black leading-snug"
                  style={{ color: isSelected ? '#FFFFFF' : 'var(--bx-header)' }}
                >
                  {track.title[cLang]}
                </div>
                <div
                  className={`text-[11px] font-medium truncate ${
                    isSelected ? 'text-amber-100/90' : 'opacity-75'
                  }`}
                >
                  {track.subtitle[cLang]}
                </div>
              </button>
            );
          })}
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
        {/* Header Row with Experience Mode Segmented Toggle */}
        <div
          className="flex flex-wrap items-center justify-between gap-3 pb-2.5 border-b"
          style={{ borderColor: 'var(--bx-line)' }}
        >
          <div className="min-w-0">
            <h2
              className="font-granth text-base sm:text-lg font-black flex items-center gap-2"
              style={{ color: 'var(--bx-header)' }}
            >
              {experienceMode === 'video' ? (
                <Film className="w-4 h-4 shrink-0" style={{ color: 'var(--bx-gold)' }} />
              ) : (
                <AudioLines className="w-4 h-4 shrink-0" style={{ color: 'var(--bx-gold)' }} />
              )}
              <span>
                {L(
                  'हवन ध्यान व विधि चलचित्र दीर्घा',
                  'Meditative Havan Ceremony Gallery',
                  'હવન ધ્યાન અને વિધિ ચલચિત્ર ગેલેરી'
                )}
              </span>
            </h2>
            <p className="text-xs opacity-80 mt-0.5">
              {experienceMode === 'video'
                ? L(
                    'पाँच चरणीय हवन विधि के साथ लयबद्ध अग्नि-ध्यान दृश्य एवं मन्त्र श्रवण',
                    'Guided fire contemplation clips synchronized with your 5-step Havan Vidhi',
                    'પાંચ ચરણીય હવન વિધિ સાથે અગ્નિ-ધ્યાન દ્રશ્યો અને મંત્ર શ્રવણ'
                  )
                : L(
                    'वैदिक तानपुरा, सितार एवं आवृत्तिमय संस्कृत मन्त्र नाद के साथ एकाग्र हवन ध्यान',
                    'Immersive Vedic drone, temple sitar, and looped Sanskrit mantra audio environment',
                    'વૈદિક તાનપુરા, સિતાર અને સંસ્કૃત મંત્ર નાદ સાથે એકાગ્ર હવન ધ્યાન'
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

        {/* Segmented Mode Toggle: Guided Video vs Soothing Background Soundscape */}
        <div
          className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl border"
          style={{
            backgroundColor: 'var(--bx-cream)',
            borderColor: 'var(--bx-line)',
          }}
          role="tablist"
          aria-label={L('हवन अनुभव माध्यम', 'Havan experience mode', 'હવન અનુભવ માધ્યમ')}
        >
          <button
            type="button"
            role="tab"
            aria-selected={experienceMode === 'video'}
            onClick={() => handleSelectMode('video')}
            className="min-h-[44px] px-3 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-2 cursor-pointer transition whitespace-nowrap"
            style={{
              backgroundColor: experienceMode === 'video' ? 'var(--bx-header)' : 'transparent',
              color: experienceMode === 'video' ? '#FFFFFF' : 'var(--bx-header)',
            }}
          >
            <Film className="w-4 h-4 shrink-0" />
            <span className="truncate">
              {L('निर्देशित चलचित्र', 'Guided Video', 'માર્ગદર્શિત ચલચિત્ર')}
            </span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={experienceMode === 'soundscape'}
            onClick={() => handleSelectMode('soundscape')}
            className="min-h-[44px] px-3 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-2 cursor-pointer transition whitespace-nowrap"
            style={{
              backgroundColor:
                experienceMode === 'soundscape' ? 'var(--bx-header)' : 'transparent',
              color: experienceMode === 'soundscape' ? '#FFFFFF' : 'var(--bx-header)',
            }}
          >
            <AudioLines className="w-4 h-4 shrink-0" />
            <span className="truncate">
              {L('शान्त नाद-ध्यान', 'Soothing Soundscape', 'શાંત નાદ-ધ્યાન')}
            </span>
          </button>
        </div>

        {experienceMode === 'video' ? (
          <>
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

            {/* Active Clip Description */}
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
          </>
        ) : (
          renderSoundscapeStage()
        )}
      </section>

      {/* Cinema / Meditative Focus Overlay Modal (Guided Video Mode) */}
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
