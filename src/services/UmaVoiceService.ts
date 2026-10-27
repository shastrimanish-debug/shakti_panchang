/**
 * UmaVoiceService.ts — Shakti Panchang Global Neural Female TTS (NTTS) Engine
 *
 * Provides a 100% natural, melodious Hindi & Sanskrit female voice ("Vidushi Uma" / Devi Swara)
 * across both Web and Capacitor Native (Android) environments.
 *
 * Architectural Hierarchy:
 * 1. Tier 1: Cloud Neural Female Synthesizer (/api/tts/uma - Google Cloud hi-IN-Neural2-A Female / Gemini Kore Female)
 *    with persistent unlocked HTMLAudioElement & background verse pre-fetching (zero mobile autoplay drops).
 * 2. Tier 2: Capacitor Native High-Definition Female Neural Engine (hi-IN-SwaraNeural)
 * 3. Tier 3: Browser Neural Female Voice Engine (Microsoft Swara Online / Google हिन्दी Female)
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
  rate: number;
  pitch: number;
  pitchSemis: number;
  emphasis: 'reduced' | 'moderate' | 'strong';
  stylePrompt: string;
  samplePhrase: string;
}

export const UMA_TONES: Record<UmaVoiceTone, ToneConfig> = {
  calm: {
    id: 'calm',
    label: 'Calm',
    labelHindi: 'शांत व मधुर (महिला स्वर)',
    badge: '🧘‍♀️',
    description: 'कोमल, ध्यानमयी व शुद्ध वैदिक उच्चारण से परिपूर्ण मधुर महिला स्वर',
    rate: 0.90,
    pitch: 1.08,
    pitchSemis: 1.2,
    emphasis: 'moderate',
    stylePrompt:
      'Sweet, melodious, serene Indian female devotional voice (Devi Swara) chanting sacred Sanskrit shlokas and Hindi with 100% pure Devanagari pronunciation, clear visarga and anusvara resonance, and peaceful temple cadence',
    samplePhrase:
      '॥ ॐ नमः शिवाय ॥ मधुर महिला वैदिक स्वर सक्रिय है। शुद्ध संस्कृत उच्चारण के साथ स्तोत्र पाठ सुनें।',
  },
  enthusiastic: {
    id: 'enthusiastic',
    label: 'Enthusiastic',
    labelHindi: 'उत्साही व ओजस्वी',
    badge: '✨',
    description: 'ऊर्जावान, आनंदमय, प्रेरणादायी व भाग्योदय सूचक महिला स्वर',
    rate: 0.96,
    pitch: 1.14,
    pitchSemis: 2.0,
    emphasis: 'strong',
    stylePrompt:
      'Bright, melodious, uplifting Indian female voice reciting sacred Sanskrit and Hindi with joyful devotion, crystal-clear Devanagari pronunciation, and warm resonance',
    samplePhrase:
      '॥ जय श्री राधे ॥ उत्साही व ओजस्वी महिला वाणी सक्रिय है! आपके जीवन में शुभ योगों का संचार हो!',
  },
  formal: {
    id: 'formal',
    label: 'Formal',
    labelHindi: 'शास्त्रीय विदुषी स्वर',
    badge: '📜',
    description: 'स्पष्ट, प्रामाणिक, विदुषी आचार्या का गरिमामय महिला स्वर',
    rate: 0.92,
    pitch: 1.06,
    pitchSemis: 1.0,
    emphasis: 'moderate',
    stylePrompt:
      'Clear, articulate, serene Indian female Vedic scholar (Vidushi) speaking with classical Sanskrit precision (shuddha uchcharana), complete vowel articulation, and graceful cadence',
    samplePhrase:
      '॥ ॐ श्री गणेशाय नमः ॥ शास्त्रीय विदुषी महिला वाणी स्थापित। सूक्ष्म गणित एवं शुद्ध संस्कृत उच्चारण।',
  },
};

export interface UmaVoiceOptions {
  /** Voice identifier (default: "hi-IN-Neural2-A") */
  voice?: string;
  /** Emotional tone of voice: 'calm' | 'enthusiastic' | 'formal' */
  tone?: UmaVoiceTone;
  /** Speaking speed: 0.75 to 1.25 */
  rate?: number;
  /** Pitch: 0.95 to 1.3 */
  pitch?: number;
  /** Volume: 0.0 to 1.0 (default: 1.0) */
  volume?: number;
  /** Voice persona style (always female NTTS) */
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
    activeVoiceName: 'NTTS • उमा दिव्य महिला स्वर (शुद्ध संस्कृत)',
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

  /**
   * Returns a single persistent HTMLAudioElement so mobile browsers (Android Chrome / iOS Safari / WebView)
   * never block sequential verse playback after async fetch calls.
   */
  private getOrCreateSharedAudioElement(): HTMLAudioElement | null {
    if (typeof Audio === 'undefined') return null;
    if (!this.sharedAudioElement) {
      this.sharedAudioElement = new Audio();
      this.sharedAudioElement.preload = 'auto';
    }
    return this.sharedAudioElement;
  }

  /**
   * Pre-loads browser voice list and listens for changes
   */
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

  /**
   * Unlock audio context and shared HTMLAudioElement on user interaction
   */
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

  /**
   * Subscribe to real-time voice state changes
   */
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
   * Pure Vedic Sanskrit & Astrological text pre-processor:
   * 1. Runs `toVedicPhoneticSpeech` (Samasa Padaccheda, Paniniya Shiksha Visarga,
   *    Panchama-Varna conjuncts, Anusvara-to-Makara, and strips verse numbers).
   * 2. Converts astrological degrees & abbreviations into natural spoken Hindi.
   * 3. Segments text into natural breath pauses.
   */
  public sanitizeAndSegmentText(
    rawText: string,
    options?: { sanskritOnly?: boolean }
  ): string[] {
    if (!rawText || !rawText.trim()) return [];

    // Step 1: Apply full Vedic Shiksha & Sanskrit Padaccheda Phonetics
    let text = toVedicPhoneticSpeech(rawText, { sanskritOnly: options?.sanskritOnly });

    text = text
      // Strip follow-up question suggestions and trailing disclaimer sections
      .replace(/---+[\s\S]*?\[?अगले\s*प्रश्न\]?[\s\S]*$/gi, '')
      .replace(/\[अगले\s*(सम्भावित\s*)?प्रश्न\]:?[\s\S]*$/gi, '')
      .replace(/अगले\s*सम्भावित\s*प्रश्न:?[\s\S]*$/gi, '')
      // Remove any remaining markdown symbols
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/_{1,2}(.*?)_{1,2}/g, '$1')
      .replace(/#{1,6}\s?/g, '')
      .replace(/`{1,3}(.*?)`{1,3}/g, '$1')
      // Clean bullet points into natural breath commas
      .replace(/^[•▪●-]\s+/gm, '')
      .replace(/[•▪●]/g, ', ')
      // Vedic astrological abbreviations into natural spoken Hindi
      .replace(/\bKP\b/g, 'कृष्णमूर्ति पद्धति')
      .replace(/\bSAV\b/g, 'सर्वाष्टकवर्ग')
      .replace(/\bBAV\b/g, 'भिन्नाष्टकवर्ग')
      .replace(/\bD-1\b/g, 'डी वन लग्न कुण्डली')
      .replace(/\bD-9\b/g, 'डी नाइन नवमांश कुण्डली')
      .replace(/\bD-10\b/g, 'डी टेन दशमांश कुण्डली')
      .replace(/\bD-60\b/g, 'डी सिक्स्टी षष्ट्यंश')
      .replace(/\bAK\b/g, 'आत्मकारक')
      .replace(/\bAmK\b/g, 'अमात्यकारक')
      .replace(/\bDK\b/g, 'दाराकारक')
      .replace(/\bAL\b/g, 'आरूढ़ लग्न')
      .replace(/\bUL\b/g, 'उपपद लग्न')
      // Planetary degree symbols to spoken Hindi
      .replace(/(\d+)\s*°\s*(\d+)\s*['′]\s*(\d+)\s*["″]/g, '$1 अंश $2 कला $3 विकला')
      .replace(/(\d+)\s*°\s*(\d+)\s*['′]/g, '$1 अंश $2 कला')
      .replace(/(\d+)\s*°/g, '$1 अंश')
      .replace(/[ \t]+/g, ' ')
      .trim();

    // Segment text by natural breath stops: '।', '.', '?', '!', '\n'
    const rawChunks = text.split(/(?<=[।!?\n])\s+/);
    const chunks: string[] = [];
    let currentChunk = '';

    for (const piece of rawChunks) {
      const cleanPiece = piece.trim();
      if (!cleanPiece) continue;

      if ((currentChunk + ' ' + cleanPiece).trim().length <= 180) {
        currentChunk = (currentChunk + ' ' + cleanPiece).trim();
      } else {
        if (currentChunk) chunks.push(currentChunk);
        if (cleanPiece.length <= 180) {
          currentChunk = cleanPiece;
        } else {
          const subPieces = cleanPiece.split(/(?<=[,;])\s+/);
          currentChunk = '';
          for (const sub of subPieces) {
            if ((currentChunk + ' ' + sub).trim().length <= 180) {
              currentChunk = (currentChunk + ' ' + sub).trim();
            } else {
              if (currentChunk) chunks.push(currentChunk);
              currentChunk = sub.trim();
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
    fullSpokenText: string
  ): string {
    return `ntts_v3:${voiceName}:${toneId}:${rate.toFixed(2)}:${fullSpokenText.slice(0, 450)}`;
  }

  /**
   * Fetches or returns cached Neural Female TTS audio data URI from `/api/tts/uma`
   */
  private async fetchNeuralAudioUri(
    fullSpokenText: string,
    voiceName: string,
    toneCfg: ToneConfig,
    rate: number,
    pitch: number
  ): Promise<string | null> {
    const cacheKey = this.buildCacheKey(voiceName, toneCfg.id, rate, fullSpokenText);
    const cached = this.audioBlobCache.get(cacheKey);
    if (cached) return cached;

    const existingPromise = this.inFlightRequests.get(cacheKey);
    if (existingPromise) return existingPromise;

    const requestPromise = (async (): Promise<string | null> => {
      try {
        const resp = await fetch('/api/tts/uma', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: fullSpokenText.slice(0, 2500),
            voice: voiceName,
            tone: toneCfg.id,
            rate,
            pitch,
            pitchSemis: toneCfg.pitchSemis,
            emphasis: toneCfg.emphasis,
            stylePrompt: toneCfg.stylePrompt,
            persona: 'uma',
          }),
          signal: AbortSignal.timeout(9000),
        });

        if (resp.ok) {
          const data = await resp.json();
          if (data?.ok && data?.audioBase64) {
            const mime = data.mimeType || 'audio/mp3';
            const audioSrc = `data:${mime};base64,${data.audioBase64}`;
            if (this.audioBlobCache.size > 180) {
              const firstKey = this.audioBlobCache.keys().next().value;
              if (firstKey) this.audioBlobCache.delete(firstKey);
            }
            this.audioBlobCache.set(cacheKey, audioSrc);
            return audioSrc;
          }
        }
      } catch {
        /* ignore network error */
      } finally {
        this.inFlightRequests.delete(cacheKey);
      }
      return null;
    })();

    this.inFlightRequests.set(cacheKey, requestPromise);
    return requestPromise;
  }

  /**
   * Pre-fetches the next verse's Neural Female TTS audio in the background
   * so sequential stotra recitation transitions instantaneously with zero delay.
   */
  public async prefetch(text: string, options?: UmaVoiceOptions): Promise<void> {
    if (!text || !text.trim()) return;
    const chunks = this.sanitizeAndSegmentText(text, { sanskritOnly: options?.sanskritOnly });
    if (chunks.length === 0) return;
    const fullSpokenText = chunks.join(' । ');
    const tone = options?.tone || this.currentTone;
    const toneCfg = UMA_TONES[tone] || UMA_TONES.calm;
    const rate = options?.rate ?? toneCfg.rate;
    const pitch = options?.pitch ?? toneCfg.pitch;
    const voiceName = options?.voice ?? 'hi-IN-Neural2-A';
    await this.fetchNeuralAudioUri(fullSpokenText, voiceName, toneCfg, rate, pitch);
  }

  /**
   * Primary Speak Method:
   * Coordinates high-quality Female Neural TTS (NTTS) playback with automatic fallbacks.
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

    const fullSpokenText = chunks.join(' । ');
    const tone = options?.tone || this.currentTone;
    const toneCfg = UMA_TONES[tone] || UMA_TONES.calm;
    const rate = options?.rate ?? toneCfg.rate;
    const pitch = options?.pitch ?? toneCfg.pitch;
    const volume = options?.volume ?? 1.0;
    const voiceName = options?.voice ?? 'hi-IN-Neural2-A';

    this.updateState({
      isSpeaking: true,
      isPaused: false,
      currentText: fullSpokenText,
      activeTone: toneCfg.id,
    });

    options?.onStart?.();

    // -------------------------------------------------------------
    // Tier 1 (Cloud NTTS): Studio Female Neural Synthesizer (/api/tts/uma)
    // Uses Google Cloud hi-IN-Neural2-A (Female) / Gemini Kore (Female)
    // Reuses unlocked sharedAudioElement so mobile browsers never block playback
    // -------------------------------------------------------------
    const tryCloudNeural = async (): Promise<boolean> => {
      try {
        const audioSrc = await this.fetchNeuralAudioUri(
          fullSpokenText,
          voiceName,
          toneCfg,
          rate,
          pitch
        );

        if (token !== this.activeToken) return false;

        const audio = this.getOrCreateSharedAudioElement();
        if (audioSrc && audio) {
          return new Promise<boolean>((resolve) => {
            this.currentAudioElement = audio;
            audio.pause();
            audio.src = audioSrc;
            audio.volume = Math.max(0, Math.min(1, volume));
            audio.playbackRate = 1.0; // Speed is already baked into neural synthesis

            audio.onplay = () => {
              if (token !== this.activeToken) return;
              this.updateState({
                provider: 'neural-api',
                activeVoiceName: `NTTS • उमा दिव्य महिला स्वर (शुद्ध संस्कृत)`,
                activeTone: toneCfg.id,
              });
            };

            audio.onended = () => {
              if (token !== this.activeToken) return;
              this.currentAudioElement = null;
              this.updateState({ isSpeaking: false, provider: 'idle', currentText: null });
              options?.onEnd?.();
              resolve(true);
            };

            audio.onerror = () => {
              if (token !== this.activeToken) return;
              this.currentAudioElement = null;
              resolve(false);
            };

            void audio.play().catch(() => resolve(false));
          });
        }
      } catch {
        /* Network error or offline - fallback to next tier */
      }
      return false;
    };

    const cloudSucceeded = await tryCloudNeural();
    if (cloudSucceeded || token !== this.activeToken) return;

    // -------------------------------------------------------------
    // Tier 2 (Native Platform): Capacitor Native Uma Voice Plugin
    // Uses Microsoft Edge hi-IN-SwaraNeural (Female Neural) directly on device
    // -------------------------------------------------------------
    if (Capacitor.isNativePlatform()) {
      try {
        this.updateState({
          provider: 'capacitor-native',
          activeVoiceName: `NTTS • उमा महिला स्वर (${toneCfg.labelHindi})`,
          activeTone: toneCfg.id,
        });

        const parts = chunks.map((c) => ({
          text: c,
          rate: Math.max(0.82, Math.min(1.12, rate)),
          pitch: Math.max(1.02, Math.min(1.18, pitch)),
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
    // Tier 3: Browser Neural Female Voice Engine (Prosody-Tuned)
    // -------------------------------------------------------------
    this.speakViaBrowserEngine(chunks, token, rate, pitch, volume, toneCfg, options);
  }

  /**
   * Tier 3 Engine: Browser Web Speech API
   * Strictly selects female Hindi/Sanskrit voice with sweet female soprano/alto register.
   */
  private speakViaBrowserEngine(
    chunks: string[],
    token: number,
    rate: number,
    pitch: number,
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
    const isExplicitFemale = matchedVoice
      ? /female|swara|kalpana|kavita|lekha|ananya|shruti|priya|geeta|sangeeta|hia|hic|hie|hfc|hfe|woman/i.test(
          matchedVoice.name
        )
      : false;
    const voiceDisplayName = matchedVoice ? matchedVoice.name : 'उमा दिव्य स्वर (महिला)';

    const effectivePitch = isExplicitFemale ? Math.max(1.12, pitch * 1.05) : 1.24;
    const effectiveRate = Math.min(0.92, Math.max(0.84, rate * 0.95));

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
        setTimeout(playNextChunk, 110);
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
   * Scans browser voices and strictly selects the most natural Hindi FEMALE voice.
   * Completely filters out any male engines (Madhur, Hemant, hid, hib, hif, etc.)
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

    // 6. Female Sanskrit voice if installed
    const sanskritVoice = nonMaleVoices.find((v) => v.lang.toLowerCase().startsWith('sa'));
    if (sanskritVoice) return sanskritVoice;

    // 7. General non-male Hindi voice
    const anyNonMaleHindi = nonMaleVoices.find((v) => v.lang.toLowerCase().startsWith('hi'));
    if (anyNonMaleHindi) return anyNonMaleHindi;

    return null;
  }

  /**
   * Stops all active speech across cloud audio, native Capacitor, and browser engine immediately.
   */
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
