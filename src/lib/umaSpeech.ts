import { Capacitor, registerPlugin } from "@capacitor/core";

interface UmaVoicePlugin {
  speak(options: { text?: string; parts?: { text: string; rate: number; pitch: number }[] }): Promise<void>;
  stopSpeaking(): Promise<void>;
}

const UmaVoice = registerPlugin<UmaVoicePlugin>("UmaVoice");

/** Path is dakshin style. Everyday answers stay natural Hindi. */

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

type UmaPart = { text: string; rate: number; pitch: number };

function stripMarkup(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/#{1,6}\s?/g, "")
    .replace(/[•▪●]/g, ", ")
    .replace(/[ \t]+/g, " ")
    .trim();
}

function isSanskritPath(chunk: string): boolean {
  if (/[॥ॐ]/.test(chunk)) return true;
  const visarga = (chunk.match(/ः/g) || []).length;
  if (visarga >= 2) return true;
  if (visarga >= 1 && /[।॥]/.test(chunk)) return true;
  const hindi = /(है|हैं|था|थी|का |की |के |में |और |यह |आप |लिए |करें|बता|नहीं|होता|होती)/;
  const letters = (chunk.match(/[\u0900-\u097F]/g) || []).length;
  return letters > 24 && !hindi.test(chunk);
}

/** Dakshin pathashala: same Indian words, one flowing line, breath only at the danda. */
function dakshinPath(text: string): string {
  return text
    .replace(/ॐ/g, "ओम्")
    .replace(/॥+/g, ". ")
    .replace(/।/g, ", ")
    .replace(/ऽ/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function naturalHindi(text: string): string {
  return text
    .replace(/॥+/g, ". ")
    .replace(/।/g, ", ")
    .replace(/\s+/g, " ")
    .trim();
}

export function buildUmaParts(text: string): UmaPart[] {
  const clean = stripMarkup(text);
  if (!clean) return [];
  const chunks = clean
    .split(/\n+|(?<=[।॥])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const parts: UmaPart[] = [];
  for (const chunk of chunks) {
    const path = isSanskritPath(chunk);
    const spoken = (path ? dakshinPath(chunk) : naturalHindi(chunk)).slice(0, 700);
    if (!spoken) continue;
    parts.push({
      text: spoken,
      rate: path ? 0.82 : 1,
      pitch: 1,
    });
  }
  return parts.slice(0, 28);
}

export function prepareUmaUtterance(text: string): string {
  return buildUmaParts(text)
    .map((p) => p.text)
    .join(" ")
    .slice(0, 3500);
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
  const parts = buildUmaParts(text);
  if (!parts.length) {
    options?.onEnd?.();
    return;
  }

  if (Capacitor.isNativePlatform()) {
    try {
      isCurrentlySpeaking = true;
      options?.onStart?.();
      await UmaVoice.speak({ parts });
      isCurrentlySpeaking = false;
      options?.onEnd?.();
      return;
    } catch {
      isCurrentlySpeaking = false;
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
  const voice = pickHindiVoice();
  let index = 0;

  const speakNext = () => {
    const part = parts[index];
    if (!part) {
      clearKeepAlive();
      isCurrentlySpeaking = false;
      currentUtterance = null;
      options?.onEnd?.();
      return;
    }
    const utter = new SpeechSynthesisUtterance(part.text);
    currentUtterance = utter;
    utter.lang = "hi-IN";
    utter.rate = part.rate;
    utter.pitch = part.pitch;
    if (voice) utter.voice = voice;
    utter.onstart = () => {
      if (index === 0) {
        isCurrentlySpeaking = true;
        options?.onStart?.();
      }
    };
    utter.onend = () => {
      index += 1;
      speakNext();
    };
    utter.onerror = (e) => {
      clearKeepAlive();
      isCurrentlySpeaking = false;
      currentUtterance = null;
      options?.onError?.(e);
      options?.onEnd?.();
    };
    synth.speak(utter);
  };

  if (!unlocked) unlockUmaSpeech();
  speakNext();
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
