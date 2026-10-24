/**
 * UmaVoiceService.ts — Shakti Panchang Global Neural TTS Engine
 * 
 * Provides a 100% natural, human-like Hindi female voice for AI Assistant "Vidushi Uma"
 * across both Capacitor Native (Android) and Web environments.
 * 
 * Architectural Hierarchy:
 * 1. Tier 1: Cloud Neural Synthesizer (/api/tts/uma - Google Cloud Neural2 / Journey / Gemini Flash Lite TTS)
 * 2. Tier 2: Capacitor Native High-Definition TTS (@capacitor-community/text-to-speech)
 * 3. Tier 3: Browser Neural Voice Engine (Microsoft Swara Online / Google हिन्दी with prosody smoothing)
 */

import { Capacitor } from '@capacitor/core';
import { TextToSpeech } from '@capacitor-community/text-to-speech';

export interface UmaVoiceOptions {
  /** Voice identifier (default: "hi-IN-Neural2-A") */
  voice?: string;
  /** Speaking speed: 0.7 to 1.3 (default: 0.94 for calm, respectful Acharya cadence) */
  rate?: number;
  /** Pitch: 0.8 to 1.3 (default: 1.04 for warm female timbre) */
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
}

export type UmaVoiceListener = (state: UmaVoiceState) => void;

class UmaVoiceService {
  private static instance: UmaVoiceService;

  // Active state
  private activeToken: number = 0;
  private currentAudioElement: HTMLAudioElement | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private keepAliveTimer: any = null;
  private listeners: Set<UmaVoiceListener> = new Set();
  private isUnlocked: boolean = false;

  // LRU audio blob cache (client-side) to eliminate network latency for common phrases
  private audioBlobCache: Map<string, string> = new Map();

  // Cached voice list from Web Speech API
  private browserVoices: SpeechSynthesisVoice[] = [];

  private state: UmaVoiceState = {
    isSpeaking: false,
    isPaused: false,
    currentText: null,
    provider: 'idle',
    activeVoiceName: 'hi-IN-Neural2-A (उमा स्वर)',
  };

  private constructor() {
    this.initBrowserVoices();
  }

  public static getInstance(): UmaVoiceService {
    if (!UmaVoiceService.instance) {
      UmaVoiceService.instance = new UmaVoiceService();
    }
    return UmaVoiceService.instance;
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
   * Unlock audio context on user interaction (required by mobile browsers & iOS/Android WebViews)
   */
  public unlockAudio(): void {
    if (this.isUnlocked) return;
    this.isUnlocked = true;

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.getVoices();
        window.speechSynthesis.cancel();
      } catch {
        /* ignore */
      }
    }

    if (typeof Audio !== 'undefined') {
      try {
        const silentAudio = new Audio(
          'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA'
        );
        silentAudio.volume = 0.01;
        void silentAudio.play().catch(() => {});
      } catch {
        /* ignore */
      }
    }
  }

  /**
   * Subscribe to real-time voice state changes (e.g. for speaking waveforms, icons)
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

  public isSpeaking(): boolean {
    if (this.currentAudioElement && !this.currentAudioElement.paused) return true;
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      if (window.speechSynthesis.speaking) return true;
    }
    return this.state.isSpeaking;
  }

  /**
   * Natural Vedic & Astrological text pre-processor:
   * Strips markdown symbols, converts astrological degrees into words,
   * normalizes Sanskrit punctuation, and segments text into natural breath pauses.
   */
  public sanitizeAndSegmentText(rawText: string): string[] {
    if (!rawText || !rawText.trim()) return [];

    let text = rawText
      // Remove markdown bold, italic, headings
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/_{1,2}(.*?)_{1,2}/g, '$1')
      .replace(/#{1,6}\s?/g, '')
      .replace(/`{1,3}(.*?)`{1,3}/g, '$1')
      // Clean bullet points into natural breath commas
      .replace(/^[•▪●-]\s+/gm, '')
      .replace(/[•▪●]/g, ', ')
      // Strip emojis
      .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1FA00}-\u{1FAFF}]/gu, '')
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
      // Clean shloka numbers
      .replace(/॥\s*[\u0966-\u096F\d]+\s*॥/g, '।')
      .replace(/॥/g, '।')
      .replace(/[\(\[\{]\s*[\u0966-\u096F\d]+\s*[\)\]\}]/g, '')
      .replace(/श्लोक\s*[\u0966-\u096F\d]+[\:\-\s]*/gi, '')
      .replace(/[ \t]+/g, ' ')
      .trim();

    // Segment text by natural breath stops: '।', '.', '?', '!', '\n'
    const rawChunks = text.split(/(?<=[।!?\n])\s+/);
    const chunks: string[] = [];
    let currentChunk = '';

    for (const piece of rawChunks) {
      const cleanPiece = piece.trim();
      if (!cleanPiece) continue;

      if ((currentChunk + ' ' + cleanPiece).trim().length <= 160) {
        currentChunk = (currentChunk + ' ' + cleanPiece).trim();
      } else {
        if (currentChunk) chunks.push(currentChunk);
        if (cleanPiece.length <= 160) {
          currentChunk = cleanPiece;
        } else {
          // If a single sentence is extra long, split at commas or whitespace
          const subPieces = cleanPiece.split(/(?<=[,;])\s+/);
          currentChunk = '';
          for (const sub of subPieces) {
            if ((currentChunk + ' ' + sub).trim().length <= 160) {
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

  /**
   * Primary Speak Method:
   * Coordinates high-quality Hindi female voice playback with automatic fallbacks.
   */
  public async speak(text: string, options?: UmaVoiceOptions): Promise<void> {
    if (!text || !text.trim()) {
      options?.onEnd?.();
      return;
    }

    // Step 1: Interrupt any previous active speech smoothly
    this.stop();
    const token = ++this.activeToken;
    this.unlockAudio();

    const chunks = this.sanitizeAndSegmentText(text);
    if (chunks.length === 0) {
      options?.onEnd?.();
      return;
    }

    const fullSpokenText = chunks.join(' । ');
    const rate = options?.rate ?? 0.94;
    const pitch = options?.pitch ?? 1.04;
    const volume = options?.volume ?? 1.0;
    const voiceName = options?.voice ?? 'hi-IN-Neural2-A';
    const voiceStyle = options?.voiceStyle ?? 'uma';

    this.updateState({
      isSpeaking: true,
      isPaused: false,
      currentText: fullSpokenText,
    });

    options?.onStart?.();

    // -------------------------------------------------------------
    // Tier 1: Cloud Neural Synthesizer (/api/tts/uma)
    // -------------------------------------------------------------
    const tryCloudNeural = async (): Promise<boolean> => {
      try {
        const cacheKey = `${voiceName}:${rate}:${fullSpokenText.slice(0, 300)}`;
        let audioSrc = this.audioBlobCache.get(cacheKey);

        if (!audioSrc) {
          const resp = await fetch('/api/tts/uma', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text: fullSpokenText.slice(0, 2500),
              voice: voiceName,
              rate,
              pitch: 0.0,
              persona: voiceStyle,
            }),
            signal: AbortSignal.timeout(8500),
          });

          if (resp.ok) {
            const data = await resp.json();
            if (data?.ok && data?.audioBase64) {
              const mime = data.mimeType || 'audio/mp3';
              audioSrc = `data:${mime};base64,${data.audioBase64}`;
              if (this.audioBlobCache.size > 150) {
                const firstKey = this.audioBlobCache.keys().next().value;
                if (firstKey) this.audioBlobCache.delete(firstKey);
              }
              this.audioBlobCache.set(cacheKey, audioSrc);
            }
          }
        }

        if (token !== this.activeToken) return false;

        if (audioSrc && typeof Audio !== 'undefined') {
          return new Promise<boolean>((resolve) => {
            const audio = new Audio(audioSrc);
            this.currentAudioElement = audio;
            audio.volume = Math.max(0, Math.min(1, volume));

            audio.onplay = () => {
              if (token !== this.activeToken) return;
              this.updateState({
                provider: 'neural-api',
                activeVoiceName: `Google Neural2 / Journey (${voiceName})`,
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
    // Tier 2: Capacitor Native Android High-Definition TTS
    // -------------------------------------------------------------
    if (Capacitor.isNativePlatform()) {
      try {
        this.updateState({
          provider: 'capacitor-native',
          activeVoiceName: 'Capacitor Android Neural (hi-IN)',
        });

        // Use native Capacitor TextToSpeech plugin
        await TextToSpeech.speak({
          text: fullSpokenText,
          lang: 'hi-IN',
          rate: Math.max(0.7, Math.min(1.2, rate)),
          pitch: Math.max(0.8, Math.min(1.3, pitch)),
          volume,
          category: 'ambient',
        });

        if (token === this.activeToken) {
          this.updateState({ isSpeaking: false, provider: 'idle', currentText: null });
          options?.onEnd?.();
          return;
        }
      } catch {
        /* Native speak failed or rejected - fallback to Tier 3 Web Speech */
      }
    }

    if (token !== this.activeToken) return;

    // -------------------------------------------------------------
    // Tier 3: Browser Neural Voice Engine (Prosody-Tuned)
    // -------------------------------------------------------------
    this.speakViaBrowserEngine(chunks, token, rate, pitch, volume, options);
  }

  /**
   * Tier 3 Engine: Browser Web Speech API
   * Uses high-fidelity online Hindi voice matching and sequential chunking
   * to eliminate robotic monotone and prevent browser audio truncation bugs.
   */
  private speakViaBrowserEngine(
    chunks: string[],
    token: number,
    rate: number,
    pitch: number,
    volume: number,
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
    const voiceDisplayName = matchedVoice ? matchedVoice.name : 'Browser Default Hindi';

    this.updateState({
      provider: 'web-neural',
      activeVoiceName: voiceDisplayName,
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
      utterance.rate = rate;
      utterance.pitch = pitch;
      utterance.volume = volume;
      if (matchedVoice) utterance.voice = matchedVoice;

      utterance.onend = () => {
        if (token !== this.activeToken) return;
        chunkIndex++;
        // Natural human breath pause between sentences (60ms)
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

    // Chrome/Android Workaround: Keep synthesis alive for long passages
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
   * Scans browser voices and ranks them to pick the most natural, human-sounding Hindi female voice.
   */
  public pickBestBrowserHindiVoice(): SpeechSynthesisVoice | null {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;

    const voices = this.browserVoices.length > 0 ? this.browserVoices : window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return null;

    const femaleKeywords = /female|swara|natural|online|wavenet-a|wavenet-d|neural|woman|kavita|kalpana/i;
    const maleKeywords = /male|madhur|wavenet-b|wavenet-c|man|boy/i;

    // 1. Gold standard: Microsoft Swara Natural (Hindi)
    const swaraVoice = voices.find((v) => /swara/i.test(v.name) && v.lang.toLowerCase().startsWith('hi'));
    if (swaraVoice) return swaraVoice;

    // 2. High-Quality Online Natural / Neural Hindi Female voices
    const neuralFemale = voices.find(
      (v) =>
        v.lang.toLowerCase().startsWith('hi') &&
        femaleKeywords.test(v.name) &&
        !maleKeywords.test(v.name)
    );
    if (neuralFemale) return neuralFemale;

    // 3. Google हिन्दी (Chrome's online high-def Hindi voice)
    const googleHindi = voices.find((v) => /google.*(हिन्दी|hindi)/i.test(v.name));
    if (googleHindi) return googleHindi;

    // 4. Any Hindi-India voice that is not explicitly marked male
    const hiInNeutral = voices.find(
      (v) => v.lang.toLowerCase() === 'hi-in' && !maleKeywords.test(v.name)
    );
    if (hiInNeutral) return hiInNeutral;

    // 5. Any generic Hindi voice
    const anyHindi = voices.find((v) => v.lang.toLowerCase().startsWith('hi'));
    if (anyHindi) return anyHindi;

    // 6. Sanskrit voice if installed (great for shlokas)
    const sanskritVoice = voices.find((v) => v.lang.toLowerCase().startsWith('sa'));
    if (sanskritVoice) return sanskritVoice;

    return null;
  }

  /**
   * Stops all active speech across cloud audio, native Capacitor, and browser engine immediately.
   */
  public stop(): void {
    this.activeToken++;
    this.clearKeepAlive();

    // 1. Stop Cloud Audio
    if (this.currentAudioElement) {
      try {
        this.currentAudioElement.pause();
        this.currentAudioElement.src = '';
      } catch {
        /* ignore */
      }
      this.currentAudioElement = null;
    }

    // 2. Stop Capacitor Native TTS
    if (Capacitor.isNativePlatform()) {
      try {
        void TextToSpeech.stop().catch(() => {});
      } catch {
        /* ignore */
      }
    }

    // 3. Stop Browser Web Speech
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        /* ignore */
      }
    }

    this.currentUtterance = null;
    this.updateState({
      isSpeaking: false,
      isPaused: false,
      currentText: null,
      provider: 'idle',
    });
  }

  /**
   * Pauses active speech
   */
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

  /**
   * Resumes paused speech
   */
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
export const speakUmaVoice = (text: string, options?: UmaVoiceOptions) => umaVoice.speak(text, options);
export const stopUmaVoice = () => umaVoice.stop();
export const isUmaVoiceSpeaking = () => umaVoice.isSpeaking();
export const pauseUmaVoice = () => umaVoice.pause();
export const resumeUmaVoice = () => umaVoice.resume();
