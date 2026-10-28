/**
 * UmaVoiceService.ts — Shakti Panchang Natural Indian Woman Neural TTS (Chirp 3 HD) Engine
 *
 * Provides a 100% natural, warm, human-sounding Indian female voice ("Vidushi Uma")
 * across both Web and Capacitor Native (Android) environments.
 *
 * Architectural Hierarchy:
 * 1. Tier 1: Cloud Chirp 3 HD Natural Indian Female Synthesizer (/api/tts/uma - hi-IN-Chirp3-HD-Kore / Aoede / Leda)
 *    with progressive sentence-chunk streaming & parallel background pre-fetching (starts in ~1s, zero timeout).
 * 2. Tier 2: Capacitor Native High-Definition Female Neural Engine (IndianVoice + Android Network Female TTS)
 * 3. Tier 3: Browser Natural Female Voice Engine (Microsoft Swara Natural / Google हिन्दी Female at natural 1.0 pitch)
 */

import { Capacitor, registerPlugin } from '@capacitor/core';
import { toVedicPhoneticSpeech } from '../lib/sanskritPhonetics';

export interface UmaVoiceNativePlugin {
  speak(options: {
    text?: string;
    music?: boolean;
    raga?: string;
    parts?: { text: string; rate: number; pitch: number }[];
  }): Promise<void>;
  stopSpeaking(): Promise<void>;
  listen(): Promise<{ text: string }>;
  stop(): Promise<void>;
}

export const UmaVoiceNative = registerPlugin<UmaVoiceNativePlugin>('UmaVoice');

export type UmaVoiceTone = 'calm' | 'enthusiastic' | 'formal';

export interface ToneConfig {
  id: UmaVoiceTone;
  label: string;
  labelHindi: string;
  badge: string;
  description: string;
  voiceName: string;
  rate: number;
  pitch: number;
  pitchSemis: number;
  emphasis: 'reduced' | 'moderate' | 'strong';
  stylePrompt: string;
  samplePhrase: string;
}

const CLOUD_BACKEND_ORIGINS = [
  'https://ais-pre-yltck7of4bz54fytkvtlmd-88514486913.asia-east1.run.app',
  'https://ais-dev-yltck7of4bz54fytkvtlmd-88514486913.asia-east1.run.app',
];

export function getUmaApiEndpoints(path: string): string[] {
  if (typeof window === 'undefined') return [path];
  const isCapacitorLocal =
    Capacitor.isNativePlatform() ||
    window.location.protocol === 'capacitor:' ||
    (window.location.hostname === 'localhost' && !window.location.port);

  if (isCapacitorLocal) {
    return CLOUD_BACKEND_ORIGINS.map((origin) => `${origin}${path}`);
  }
  return [path, ...CLOUD_BACKEND_ORIGINS.map((origin) => `${origin}${path}`)];
}

export const UMA_TONES: Record<UmaVoiceTone, ToneConfig> = {
  calm: {
    id: 'calm',
    label: 'Calm',
    labelHindi: 'शांत व मधुर (महिला स्वर)',
    badge: '🧘‍♀️',
    description: 'स्वाभाविक, कोमल व आत्मीय भारतीय महिला स्वर (Chirp 3 HD Kore)',
    voiceName: 'hi-IN-Chirp3-HD-Kore',
    rate: 0.97,
    pitch: 1.0,
    pitchSemis: 0,
    emphasis: 'moderate',
    stylePrompt:
      'Warm, gentle, natural Indian woman speaking conversational Hindi like a caring family astrologer with smooth, human cadence',
    samplePhrase:
      'नमस्कार जी! मैं उमा हूँ। अब मेरी आवाज़ बिल्कुल स्वाभाविक भारतीय महिला स्वर में सक्रिय है। आप मुझसे अपने मन का कोई भी प्रश्न पूछ सकते हैं।',
  },
  enthusiastic: {
    id: 'enthusiastic',
    label: 'Enthusiastic',
    labelHindi: 'उत्साही व ओजस्वी',
    badge: '✨',
    description: 'प्रसन्न, ऊर्जावान व प्रेरणादायी भारतीय महिला स्वर (Chirp 3 HD Aoede)',
    voiceName: 'hi-IN-Chirp3-HD-Aoede',
    rate: 1.0,
    pitch: 1.0,
    pitchSemis: 0,
    emphasis: 'strong',
    stylePrompt:
      'Natural, warm, cheerful Indian woman speaking conversational Hindi with authentic Indian accent and friendly warmth',
    samplePhrase:
      'जय श्री राधे! उत्साही और मधुर भारतीय महिला वाणी सक्रिय है। आपके सभी कार्य शुभ और मंगलमय हों!',
  },
  formal: {
    id: 'formal',
    label: 'Formal',
    labelHindi: 'शास्त्रीय विदुषी स्वर',
    badge: '📜',
    description: 'स्पष्ट, सौम्य व गरिमामय भारतीय विदुषी महिला स्वर (Chirp 3 HD Leda)',
    voiceName: 'hi-IN-Chirp3-HD-Leda',
    rate: 0.96,
    pitch: 1.0,
    pitchSemis: 0,
    emphasis: 'moderate',
    stylePrompt:
      'Natural, composed, articulate Indian woman speaking clear Hindi and Sanskrit with graceful human intonation',
    samplePhrase:
      'प्रणाम यजमान! शास्त्रीय विदुषी महिला वाणी सक्रिय है। आइए आपकी पत्रिका और पंचांग का सहज विश्लेषण करें।',
  },
};

export interface UmaVoiceOptions {
  /** Voice identifier (default: Chirp3-HD female voice for active tone) */
  voice?: string;
  /** Emotional tone of voice: 'calm' | 'enthusiastic' | 'formal' */
  tone?: UmaVoiceTone;
  /** Speaking speed: 0.90 to 1.15 */
  rate?: number;
  /** Pitch: 0.95 to 1.05 */
  pitch?: number;
  /** Volume: 0.0 to 1.0 (default: 1.0) */
  volume?: number;
  /** Voice persona style */
  voiceStyle?: 'uma' | 'pandit';
  /** Flag if text is exclusively Sanskrit shlokas/mantras */
  sanskritOnly?: boolean;
  /** Callback fired when speech starts */
  onStart?: () => void;
  /** Callback fired when speech finishes completely */
  onEnd?: () => void;
  /** Callback fired on error or interruption */
  onError?: (err?: any) => void;
  /** Progress callback per chunk for long readings */
  onProgress?: (progress: { currentChunk: number; totalChunks: number; chunkText: string }) => void;
}

export interface UmaVoiceState {
  isSpeaking: boolean;
  isPaused: boolean;
  currentText: string | null;
  provider: 'neural-api' | 'capacitor-native' | 'web-neural' | 'idle';
  activeVoiceName: string;
  activeTone: UmaVoiceTone;
}

export type UmaVoiceListener = (state: UmaVoiceState) => void;

const SILENT_WAV_DATA_URI =
  'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';

class UmaVoiceService {
  private static instance: UmaVoiceService;

  // Active state
  private activeToken: number = 0;
  private sharedAudioElement: HTMLAudioElement | null = null;
  private currentAudioElement: HTMLAudioElement | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private keepAliveTimer: any = null;
  private listeners: Set<UmaVoiceListener> = new Set();
  private isUnlocked: boolean = false;
  private currentTone: UmaVoiceTone = 'calm';

  // LRU audio blob cache (client-side) to eliminate network latency for verses & phrases
  private audioBlobCache: Map<string, string> = new Map();
  private inFlightRequests: Map<string, Promise<string | null>> = new Map();

  // Cached voice list from Web Speech API
  private browserVoices: SpeechSynthesisVoice[] = [];

  private state: UmaVoiceState = {
    isSpeaking: false,
    isPaused: false,
    currentText: null,
    provider: 'idle',
    activeVoiceName: 'उमा स्वाभाविक भारतीय महिला स्वर (Chirp 3 HD)',
    activeTone: 'calm',
  };

  private constructor() {
    try {
      if (typeof localStorage !== 'undefined') {
        const saved = localStorage.getItem('shakti_uma_voice_tone') as UmaVoiceTone;
        if (saved && UMA_TONES[saved]) {
          this.currentTone = saved;
          this.state.activeTone = saved;
        }
      }
    } catch {
      /* ignore */
    }
    this.initBrowserVoices();
    this.setupAutoUnlockOnFirstInteraction();
  }

  public static getInstance(): UmaVoiceService {
    if (!UmaVoiceService.instance) {
      UmaVoiceService.instance = new UmaVoiceService();
    }
    return UmaVoiceService.instance;
  }

  private setupAutoUnlockOnFirstInteraction(): void {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    const handleFirstGesture = () => {
      this.unlockAudio();
      window.removeEventListener('pointerdown', handleFirstGesture, true);
      window.removeEventListener('touchstart', handleFirstGesture, true);
      window.removeEventListener('click', handleFirstGesture, true);
    };
    window.addEventListener('pointerdown', handleFirstGesture, true);
    window.addEventListener('touchstart', handleFirstGesture, true);
    window.addEventListener('click', handleFirstGesture, true);
  }

  private getOrCreateSharedAudioElement(): HTMLAudioElement | null {
    if (typeof Audio === 'undefined') return null;
    if (!this.sharedAudioElement) {
      this.sharedAudioElement = new Audio();
      this.sharedAudioElement.preload = 'auto';
    }
    return this.sharedAudioElement;
  }

  private initBrowserVoices(): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const loadVoices = () => {
      try {
        const voices = window.speechSynthesis.getVoices();
        if (voices && voices.length > 0) {
          this.browserVoices = voices;
        }
      } catch {
        /* ignore */
      }
    };

    loadVoices();
    try {
      window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
    } catch {
      /* ignore */
    }
  }

  public unlockAudio(): void {
    if (typeof window !== 'undefined' && 'AudioContext' in window) {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioCtx();
        if (ctx.state === 'suspended') {
          void ctx.resume();
        }
      } catch {
        /* ignore */
      }
    }

    if (!this.isUnlocked) {
      this.isUnlocked = true;

      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        try {
          window.speechSynthesis.getVoices();
        } catch {
          /* ignore */
        }
      }

      const sharedAudio = this.getOrCreateSharedAudioElement();
      if (sharedAudio && (!this.currentAudioElement || this.currentAudioElement.paused)) {
        try {
          sharedAudio.src = SILENT_WAV_DATA_URI;
          sharedAudio.volume = 0.01;
          void sharedAudio.play().catch(() => {});
        } catch {
          /* ignore */
        }
      }
    }
  }

  public subscribe(listener: UmaVoiceListener): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => this.listeners.delete(listener);
  }

  private updateState(partial: Partial<UmaVoiceState>): void {
    this.state = { ...this.state, ...partial };
    for (const listener of this.listeners) {
      try {
        listener(this.state);
      } catch {
        /* ignore */
      }
    }
  }

  public getState(): UmaVoiceState {
    return { ...this.state };
  }

  public setTone(tone: UmaVoiceTone): void {
    if (!UMA_TONES[tone]) return;
    this.currentTone = tone;
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('shakti_uma_voice_tone', tone);
      }
    } catch {
      /* ignore */
    }
    this.updateState({ activeTone: tone });
  }

  public getTone(): UmaVoiceTone {
    return this.currentTone;
  }

  public getToneConfig(tone?: UmaVoiceTone): ToneConfig {
    return UMA_TONES[tone || this.currentTone] || UMA_TONES.calm;
  }

  public getToneConfigs(): ToneConfig[] {
    return Object.values(UMA_TONES);
  }

  public isSpeaking(): boolean {
    if (this.currentAudioElement && !this.currentAudioElement.paused) return true;
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      if (window.speechSynthesis.speaking) return true;
    }
    return this.state.isSpeaking;
  }

  /**
   * Natural Conversational Hindi & Vedic Sanskrit text pre-processor:
   * 1. Cleans markdown, decorative headers, and follow-up question blocks.
   * 2. Preserves natural Hindi words without artificial Sanskrit suffixes.
   * 3. Segments text into ~240-char natural conversational sentences so Chunk 0 starts playing in ~1 second.
   */
  public sanitizeAndSegmentText(
    rawText: string,
    options?: { sanskritOnly?: boolean }
  ): string[] {
    if (!rawText || !rawText.trim()) return [];

    // Strip follow-up questions & UI hints BEFORE phonetic processing
    let cleanedInput = rawText
      .replace(/---+[\s\S]*?\[?अगले\s*प्रश्न\]?[\s\S]*$/gi, '')
      .replace(/\[अगले\s*(सम्भावित\s*)?प्रश्न\]:?[\s\S]*$/gi, '')
      .replace(/अगले\s*सम्भावित\s*प्रश्न:?[\s\S]*$/gi, '')
      .replace(/\(💡[^)]*\)/g, '');

    let text = toVedicPhoneticSpeech(cleanedInput, { sanskritOnly: options?.sanskritOnly });

    text = text
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/_{1,2}(.*?)_{1,2}/g, '$1')
      .replace(/#{1,6}\s?/g, '')
      .replace(/`{1,3}(.*?)`{1,3}/g, '$1')
      .replace(/^[•▪●-]\s+/gm, '')
      .replace(/[•▪●]/g, ', ')
      // Vedic astrological abbreviations into natural spoken Hindi
      .replace(/\bKP\b/g, 'कृष्णमूर्ति पद्धति')
      .replace(/\bSAV\b/g, 'सर्वाष्टकवर्ग')
      .replace(/\bBAV\b/g, 'भिन्नाष्टकवर्ग')
      .replace(/\bD-1\b/g, 'लग्न कुण्डली')
      .replace(/\bD-9\b/g, 'नवमांश कुण्डली')
      .replace(/\bD-10\b/g, 'दशमांश कुण्डली')
      .replace(/\bD-60\b/g, 'षष्ट्यंश')
      .replace(/\bAK\b/g, 'आत्मकारक')
      .replace(/\bAmK\b/g, 'अमात्यकारक')
      .replace(/\bDK\b/g, 'दाराकारक')
      .replace(/\bAL\b/g, 'आरूढ़ लग्न')
      .replace(/\bUL\b/g, 'उपपद लग्न')
      // Planetary degree symbols to spoken Hindi
      .replace(/(\d+)\s*°\s*(\d+)\s*['′]\s*(\d+)\s*["″]/g, '$1 अंश $2 कला $3 विकला')
      .replace(/(\d+)\s*°\s*(\d+)\s*['′]/g, '$1 अंश $2 कला')
      .replace(/(\d+)\s*°/g, '$1 अंश')
      .replace(/।\s*।+/g, '।')
      .replace(/[ \t]+/g, ' ')
      .trim();

    // Segment text by natural sentence boundaries ('।', '.', '?', '!', '\n') into ~240 char conversational chunks
    const MAX_CHUNK_LEN = 240;
    const rawSentences = text.split(/(?<=[।!?\n])\s+/);
    const chunks: string[] = [];
    let currentChunk = '';

    for (const sentence of rawSentences) {
      const cleanSentence = sentence.trim();
      if (!cleanSentence) continue;

      if ((currentChunk + ' ' + cleanSentence).trim().length <= MAX_CHUNK_LEN) {
        currentChunk = (currentChunk + ' ' + cleanSentence).trim();
      } else {
        if (currentChunk) chunks.push(currentChunk);
        if (cleanSentence.length <= MAX_CHUNK_LEN) {
          currentChunk = cleanSentence;
        } else {
          const clauses = cleanSentence.split(/(?<=[,;:])\s+/);
          currentChunk = '';
          for (const clause of clauses) {
            if ((currentChunk + ' ' + clause).trim().length <= MAX_CHUNK_LEN) {
              currentChunk = (currentChunk + ' ' + clause).trim();
            } else {
              if (currentChunk) chunks.push(currentChunk);
              currentChunk = clause.trim();
            }
          }
        }
      }
    }
    if (currentChunk) chunks.push(currentChunk);

    return chunks.length > 0 ? chunks : [text];
  }

  private buildCacheKey(
    voiceName: string,
    toneId: string,
    rate: number,
    chunkText: string
  ): string {
    return `chirp3_v4:${voiceName}:${toneId}:${rate.toFixed(2)}:${chunkText}`;
  }

  /**
   * Fetches or returns cached Natural Indian Female TTS audio data URI from `/api/tts/uma`
   * Supports both Web relative endpoint and Capacitor Android Cloud Run endpoints.
   */
  private async fetchNeuralAudioUri(
    chunkText: string,
    voiceName: string,
    toneCfg: ToneConfig,
    rate: number
  ): Promise<string | null> {
    const cacheKey = this.buildCacheKey(voiceName, toneCfg.id, rate, chunkText);
    const cached = this.audioBlobCache.get(cacheKey);
    if (cached) return cached;

    const existingPromise = this.inFlightRequests.get(cacheKey);
    if (existingPromise) return existingPromise;

    const requestPromise = (async (): Promise<string | null> => {
      try {
        const endpoints = getUmaApiEndpoints('/api/tts/uma');
        for (const endpoint of endpoints) {
          try {
            const resp = await fetch(endpoint, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                text: chunkText.slice(0, 1200),
                voice: voiceName,
                tone: toneCfg.id,
                rate,
                stylePrompt: toneCfg.stylePrompt,
                persona: 'uma',
              }),
              signal: AbortSignal.timeout(10000),
            });

            if (resp.ok) {
              const data = await resp.json().catch(() => null);
              if (data?.ok && data?.audioBase64) {
                const mime = data.mimeType || 'audio/mp3';
                const audioSrc = `data:${mime};base64,${data.audioBase64}`;
                if (this.audioBlobCache.size > 200) {
                  const firstKey = this.audioBlobCache.keys().next().value;
                  if (firstKey) this.audioBlobCache.delete(firstKey);
                }
                this.audioBlobCache.set(cacheKey, audioSrc);
                return audioSrc;
              }
            }
          } catch {
            /* try next endpoint */
          }
        }
      } finally {
        this.inFlightRequests.delete(cacheKey);
      }
      return null;
    })();

    this.inFlightRequests.set(cacheKey, requestPromise);
    return requestPromise;
  }

  /**
   * Pre-fetches the next verse's or paragraph's Neural Female TTS audio in the background.
   */
  public async prefetch(text: string, options?: UmaVoiceOptions): Promise<void> {
    if (!text || !text.trim()) return;
    const chunks = this.sanitizeAndSegmentText(text, { sanskritOnly: options?.sanskritOnly });
    if (chunks.length === 0) return;
    const tone = options?.tone || this.currentTone;
    const toneCfg = UMA_TONES[tone] || UMA_TONES.calm;
    const rate = options?.rate && options.rate >= 0.92 ? options.rate : toneCfg.rate;
    const voiceName = options?.voice ?? toneCfg.voiceName;
    await Promise.all(
      chunks.slice(0, 3).map((chunk) => this.fetchNeuralAudioUri(chunk, voiceName, toneCfg, rate))
    );
  }

  /**
   * Primary Speak Method:
   * Coordinates Progressive Chirp 3 HD Natural Indian Female TTS playback with instant first-sentence start.
   */
  public async speak(text: string, options?: UmaVoiceOptions): Promise<void> {
    if (!text || !text.trim()) {
      options?.onEnd?.();
      return;
    }

    // Step 1: Interrupt any previous active speech smoothly
    this.stop(false);
    const token = ++this.activeToken;
    this.unlockAudio();

    const chunks = this.sanitizeAndSegmentText(text, {
      sanskritOnly: options?.sanskritOnly,
    });
    if (chunks.length === 0) {
      options?.onEnd?.();
      return;
    }

    const fullSpokenText = chunks.join(' ');
    const tone = options?.tone || this.currentTone;
    const toneCfg = UMA_TONES[tone] || UMA_TONES.calm;
    const rate = options?.rate && options.rate >= 0.92 ? options.rate : toneCfg.rate;
    const pitch = 1.0;
    const volume = options?.volume ?? 1.0;
    const voiceName = options?.voice ?? toneCfg.voiceName;

    this.updateState({
      isSpeaking: true,
      isPaused: false,
      currentText: fullSpokenText,
      activeTone: toneCfg.id,
    });

    options?.onStart?.();

    // -------------------------------------------------------------
    // Tier 1 (Cloud Chirp 3 HD): Progressive Sentence-by-Sentence Playback
    // Synthesizes Chunk 0 in ~1s while pre-fetching subsequent chunks in parallel!
    // -------------------------------------------------------------
    const tryCloudNeuralProgressive = async (): Promise<boolean> => {
      try {
        const audio = this.getOrCreateSharedAudioElement();
        if (!audio) return false;

        // Kick off Chunk 0 immediately, and start prefetching Chunk 1 & 2 in parallel
        const firstAudioPromise = this.fetchNeuralAudioUri(chunks[0], voiceName, toneCfg, rate);
        for (let preIdx = 1; preIdx < Math.min(chunks.length, 3); preIdx++) {
          void this.fetchNeuralAudioUri(chunks[preIdx], voiceName, toneCfg, rate);
        }

        const firstSrc = await firstAudioPromise;
        if (!firstSrc || token !== this.activeToken) return false;

        for (let i = 0; i < chunks.length; i++) {
          if (token !== this.activeToken) return true;

          // Pre-fetch 2 chunks ahead while current chunk plays
          if (i + 2 < chunks.length) {
            void this.fetchNeuralAudioUri(chunks[i + 2], voiceName, toneCfg, rate);
          }

          const chunkSrc =
            i === 0
              ? firstSrc
              : await this.fetchNeuralAudioUri(chunks[i], voiceName, toneCfg, rate);

          if (!chunkSrc || token !== this.activeToken) {
            return i > 0;
          }

          options?.onProgress?.({
            currentChunk: i + 1,
            totalChunks: chunks.length,
            chunkText: chunks[i],
          });

          const played = await new Promise<boolean>((resolve) => {
            if (token !== this.activeToken) {
              resolve(false);
              return;
            }
            this.currentAudioElement = audio;
            audio.pause();
            audio.src = chunkSrc;
            audio.volume = Math.max(0, Math.min(1, volume));
            audio.playbackRate = 1.0;

            audio.onplay = () => {
              if (token !== this.activeToken) return;
              this.updateState({
                provider: 'neural-api',
                activeVoiceName: `उमा स्वाभाविक भारतीय महिला स्वर (${toneCfg.labelHindi})`,
                activeTone: toneCfg.id,
              });
            };

            audio.onended = () => {
              if (token !== this.activeToken) {
                resolve(false);
                return;
              }
              resolve(true);
            };

            audio.onerror = () => {
              resolve(false);
            };

            void audio.play().catch(() => resolve(false));
          });

          if (!played && token === this.activeToken) {
            return i > 0;
          }
        }

        if (token === this.activeToken) {
          this.currentAudioElement = null;
          this.updateState({ isSpeaking: false, provider: 'idle', currentText: null });
          options?.onEnd?.();
        }
        return true;
      } catch {
        return false;
      }
    };

    const cloudSucceeded = await tryCloudNeuralProgressive();
    if (cloudSucceeded || token !== this.activeToken) return;

    // -------------------------------------------------------------
    // Tier 2 (Native Platform): Capacitor Native Uma Voice Plugin
    // -------------------------------------------------------------
    if (Capacitor.isNativePlatform()) {
      try {
        this.updateState({
          provider: 'capacitor-native',
          activeVoiceName: `उमा भारतीय महिला स्वर (${toneCfg.labelHindi})`,
          activeTone: toneCfg.id,
        });

        const parts = chunks.map((c) => ({
          text: c,
          rate: 0.98,
          pitch: 1.0,
        }));

        await UmaVoiceNative.speak({
          parts,
          text: fullSpokenText,
          music: options?.sanskritOnly === true,
          raga: 'yaman',
        });

        if (token === this.activeToken) {
          this.updateState({ isSpeaking: false, provider: 'idle', currentText: null });
          options?.onEnd?.();
          return;
        }
      } catch (nativeErr) {
        console.warn('Native UmaVoice plugin speak failed, falling back:', nativeErr);
      }
    }

    if (token !== this.activeToken) return;

    // -------------------------------------------------------------
    // Tier 3: Browser Natural Female Voice Engine (Zero Pitch Distortion)
    // -------------------------------------------------------------
    this.speakViaBrowserEngine(chunks, token, rate, pitch, volume, toneCfg, options);
  }

  /**
   * Tier 3 Engine: Browser Web Speech API at natural human 1.0 pitch and 0.97 rate
   */
  private speakViaBrowserEngine(
    chunks: string[],
    token: number,
    rate: number,
    _pitch: number,
    volume: number,
    toneCfg: ToneConfig,
    options?: UmaVoiceOptions
  ): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      this.updateState({ isSpeaking: false, provider: 'idle' });
      options?.onError?.(new Error('SpeechSynthesis not supported'));
      options?.onEnd?.();
      return;
    }

    const synth = window.speechSynthesis;
    this.clearKeepAlive();

    try {
      synth.cancel();
      synth.resume();
    } catch {
      /* ignore */
    }

    const matchedVoice = this.pickBestBrowserHindiVoice();
    const voiceDisplayName = matchedVoice ? matchedVoice.name : 'उमा भारतीय महिला स्वर';

    // Natural human pitch (1.0) and natural conversational speed (0.97) — never artificial pitch-shifting!
    const effectivePitch = 1.0;
    const effectiveRate = Math.min(1.02, Math.max(0.95, rate));

    this.updateState({
      provider: 'web-neural',
      activeVoiceName: `${voiceDisplayName} (महिला स्वर)`,
      activeTone: toneCfg.id,
    });

    let chunkIndex = 0;

    const playNextChunk = () => {
      if (token !== this.activeToken) return;

      if (chunkIndex >= chunks.length) {
        this.clearKeepAlive();
        this.currentUtterance = null;
        this.updateState({ isSpeaking: false, provider: 'idle', currentText: null });
        options?.onEnd?.();
        return;
      }

      const currentText = chunks[chunkIndex];
      options?.onProgress?.({
        currentChunk: chunkIndex + 1,
        totalChunks: chunks.length,
        chunkText: currentText,
      });

      const utterance = new SpeechSynthesisUtterance(currentText);
      this.currentUtterance = utterance;

      utterance.lang = matchedVoice?.lang || 'hi-IN';
      utterance.rate = effectiveRate;
      utterance.pitch = effectivePitch;
      utterance.volume = volume;
      if (matchedVoice) utterance.voice = matchedVoice;

      utterance.onend = () => {
        if (token !== this.activeToken) return;
        chunkIndex++;
        setTimeout(playNextChunk, 60);
      };

      utterance.onerror = (e) => {
        if (token !== this.activeToken) return;
        this.clearKeepAlive();
        this.currentUtterance = null;
        this.updateState({ isSpeaking: false, provider: 'idle', currentText: null });
        options?.onError?.(e);
        options?.onEnd?.();
      };

      synth.speak(utterance);
    };

    this.keepAliveTimer = setInterval(() => {
      if (token !== this.activeToken) {
        this.clearKeepAlive();
        return;
      }
      if (synth.speaking && !synth.paused) {
        synth.pause();
        synth.resume();
      }
    }, 12000);

    playNextChunk();
  }

  /**
   * Scans browser voices and strictly selects the most natural Hindi FEMALE voice (hi-IN).
   * Never selects synthetic Sanskrit (sa-IN) or male engines for Uma's voice.
   */
  public pickBestBrowserHindiVoice(): SpeechSynthesisVoice | null {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;

    const voices =
      this.browserVoices.length > 0 ? this.browserVoices : window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return null;

    const femaleKeywords =
      /female|swara|kalpana|kavita|lekha|ananya|shruti|priya|geeta|sangeeta|hia|hic|hie|hfc|hfe|neural|woman|girl/i;
    const maleKeywords = /male|madhur|hemant|hib|hid|hif|man|boy|puck|charon/i;

    const nonMaleVoices = voices.filter((v) => !maleKeywords.test(v.name));

    // 1. Gold standard: Microsoft Swara Natural (Hindi Female)
    const swaraVoice = nonMaleVoices.find(
      (v) => /swara/i.test(v.name) && v.lang.toLowerCase().startsWith('hi')
    );
    if (swaraVoice) return swaraVoice;

    // 2. Microsoft Kalpana Online (Hindi Female)
    const kalpanaVoice = nonMaleVoices.find(
      (v) => /kalpana/i.test(v.name) && v.lang.toLowerCase().startsWith('hi')
    );
    if (kalpanaVoice) return kalpanaVoice;

    // 3. Apple Siri Hindi Female (Lekha)
    const lekhaVoice = nonMaleVoices.find((v) => /lekha/i.test(v.name));
    if (lekhaVoice) return lekhaVoice;

    // 4. Android Google High-Definition Female Voices (hie, hia, hic, hfc)
    const googleFemale = nonMaleVoices.find(
      (v) =>
        v.lang.toLowerCase().startsWith('hi') && /(hia|hic|hie|hfc|hfe|female)/i.test(v.name)
    );
    if (googleFemale) return googleFemale;

    // 5. Any other confirmed Female Hindi voice
    const anyFemaleHindi = nonMaleVoices.find(
      (v) => v.lang.toLowerCase().startsWith('hi') && femaleKeywords.test(v.name)
    );
    if (anyFemaleHindi) return anyFemaleHindi;

    // 6. General non-male Hindi voice
    const anyNonMaleHindi = nonMaleVoices.find((v) => v.lang.toLowerCase().startsWith('hi'));
    if (anyNonMaleHindi) return anyNonMaleHindi;

    return null;
  }

  public stop(notify: boolean = true): void {
    this.activeToken++;
    this.clearKeepAlive();

    if (this.currentAudioElement) {
      try {
        this.currentAudioElement.onplay = null;
        this.currentAudioElement.onended = null;
        this.currentAudioElement.onerror = null;
        this.currentAudioElement.pause();
      } catch {
        /* ignore */
      }
      this.currentAudioElement = null;
    }

    if (Capacitor.isNativePlatform()) {
      try {
        void UmaVoiceNative.stopSpeaking().catch(() => {});
      } catch {
        /* ignore */
      }
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        /* ignore */
      }
    }

    this.currentUtterance = null;
    if (notify) {
      this.updateState({
        isSpeaking: false,
        isPaused: false,
        currentText: null,
        provider: 'idle',
      });
    }
  }

  public pause(): void {
    if (this.currentAudioElement && !this.currentAudioElement.paused) {
      this.currentAudioElement.pause();
      this.updateState({ isPaused: true });
      return;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
        window.speechSynthesis.pause();
        this.updateState({ isPaused: true });
      }
    }
  }

  public resume(): void {
    if (this.currentAudioElement && this.currentAudioElement.paused) {
      void this.currentAudioElement.play().catch(() => {});
      this.updateState({ isPaused: false });
      return;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
        this.updateState({ isPaused: false });
      }
    }
  }

  private clearKeepAlive(): void {
    if (this.keepAliveTimer) {
      clearInterval(this.keepAliveTimer);
      this.keepAliveTimer = null;
    }
  }
}

// Global Singleton Instance
export const umaVoice = UmaVoiceService.getInstance();
export default umaVoice;

// Functional Exports for Direct Import & Seamless Integration
export const speakUmaVoice = (text: string, options?: UmaVoiceOptions) =>
  umaVoice.speak(text, options);
export const prefetchUmaVoice = (text: string, options?: UmaVoiceOptions) =>
  umaVoice.prefetch(text, options);
export const stopUmaVoice = () => umaVoice.stop();
export const isUmaVoiceSpeaking = () => umaVoice.isSpeaking();
export const pauseUmaVoice = () => umaVoice.pause();
export const resumeUmaVoice = () => umaVoice.resume();
export const setUmaVoiceTone = (tone: UmaVoiceTone) => umaVoice.setTone(tone);
export const getUmaVoiceTone = () => umaVoice.getTone();
export const getUmaVoiceTones = () => umaVoice.getToneConfigs();
