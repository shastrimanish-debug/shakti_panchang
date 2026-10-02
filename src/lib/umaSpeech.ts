import { Capacitor, registerPlugin } from "@capacitor/core";

interface UmaVoicePlugin {
  speak(options: { text: string }): Promise<void>;
  stopSpeaking(): Promise<void>;
}

const UmaVoice = registerPlugin<UmaVoicePlugin>("UmaVoice");

/** Uma speaks as a 40-year-old Indian आचार्या: clear Sanskrit, unhurried Hindi. */

let unlocked = false;
let isCurrentlySpeaking = false;
let currentUtterance: SpeechSynthesisUtterance | null = null;
let keepAliveTimer: any = null;

function clearKeepAlive() {
  if (keepAliveTimer) {
    clearInterval(keepAliveTimer);
    keepAliveTimer = null;
  }
}

/** Turn markdown and dandas into the pauses a Sanskrit scholar actually leaves. */
export function prepareUmaUtterance(text: string): string {
  const clean = text
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/#{1,6}\s?/g, "")
    .replace(/[•▪●]/g, ", ")
    .replace(/ॐ/g, "ओम्, ")
    .replace(/॥+/g, ". ")
    .replace(/।/g, ", ")
    .replace(/ऽ/g, ", ")
    // Visarga must be heard, otherwise the shloka loses its svara.
    .replace(/ः/g, "ह् ")
    .replace(/\n+/g, ", ")
    .replace(/\s+/g, " ")
    .trim();

  // A short breath after a long compound, the way path is recited.
  const paced = clean.replace(/([\u0900-\u097F]{16,})/g, "$1,");
  return paced.slice(0, 3500);
}

export function pickHindiVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;
  const female = /female|hia|hfc|hfd|neural|wavenet-a|wavenet-d|woman/i;
  const male = /male|hid|hie|wavenet-b|wavenet-c/i;
  return (
    voices.find((v) => v.lang.toLowerCase().startsWith("hi") && female.test(v.name) && !male.test(v.name)) ||
    voices.find((v) => v.lang.toLowerCase() === "hi-in" && !male.test(v.name)) ||
    voices.find((v) => v.lang.toLowerCase().startsWith("hi")) ||
    voices.find((v) => /hindi|हिन्दी/i.test(v.name)) ||
    null
  );
}

export function unlockUmaSpeech() {
  unlocked = true;
  if (Capacitor.isNativePlatform()) return;
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  try {
    window.speechSynthesis.getVoices();
    window.speechSynthesis.cancel();
  } catch {
    /* ignore */
  }
}

export interface SpeakOptions {
  rate?: number;
  pitch?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err?: any) => void;
}

export async function speakUma(text: string, options?: SpeakOptions): Promise<void> {
  const clean = prepareUmaUtterance(text);

  if (!clean) {
    options?.onEnd?.();
    return;
  }

  // Android WebView has no working speechSynthesis. Use the native TTS engine.
  if (Capacitor.isNativePlatform()) {
    try {
      isCurrentlySpeaking = true;
      options?.onStart?.();
      await UmaVoice.speak({ text: clean });
      isCurrentlySpeaking = false;
      options?.onEnd?.();
      return;
    } catch {
      isCurrentlySpeaking = false;
      /* fall through to browser TTS */
    }
  }

  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    options?.onEnd?.();
    return;
  }

  const synth = window.speechSynthesis;
  clearKeepAlive();
  synth.cancel();
  synth.resume();

  const utter = new SpeechSynthesisUtterance(clean);
  currentUtterance = utter; // Retain reference to prevent garbage collection in Chrome
  utter.lang = "hi-IN";
  utter.rate = options?.rate ?? 0.78;
  utter.pitch = options?.pitch ?? 0.92;

  const voice = pickHindiVoice();
  if (voice) utter.voice = voice;

  utter.onstart = () => {
    isCurrentlySpeaking = true;
    options?.onStart?.();
    // Keep alive for long speeches in Chromium
    clearKeepAlive();
    keepAliveTimer = setInterval(() => {
      if (synth.speaking && !synth.paused) {
        synth.pause();
        synth.resume();
      }
    }, 10000);
  };

  utter.onend = () => {
    clearKeepAlive();
    isCurrentlySpeaking = false;
    currentUtterance = null;
    options?.onEnd?.();
  };

  utter.onerror = (e) => {
    clearKeepAlive();
    isCurrentlySpeaking = false;
    currentUtterance = null;
    options?.onError?.(e);
    options?.onEnd?.();
  };

  if (!unlocked) unlockUmaSpeech();
  synth.speak(utter);
}

export function stopUmaSpeech() {
  clearKeepAlive();
  isCurrentlySpeaking = false;
  currentUtterance = null;
  if (Capacitor.isNativePlatform()) {
    UmaVoice.stopSpeaking().catch(() => {});
  }
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

export function isUmaSpeaking(): boolean {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    return window.speechSynthesis.speaking || isCurrentlySpeaking;
  }
  return isCurrentlySpeaking;
}
