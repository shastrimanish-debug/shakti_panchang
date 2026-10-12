import { Capacitor, registerPlugin } from "@capacitor/core";

interface UmaVoicePlugin {
  speak(options: { text?: string; music?: boolean; parts?: { text: string; rate: number; pitch: number }[] }): Promise<void>;
  stopSpeaking(): Promise<void>;
}

const UmaVoice = registerPlugin<UmaVoicePlugin>("UmaVoice");

/** Path is dakshin style. Everyday answers stay natural Hindi. */

let bed: HTMLAudioElement | null = null;
let bedFade: ReturnType<typeof setInterval> | null = null;

function wantsPathMusic(parts: { rate: number }[]): boolean {
  return parts.some((part) => part.rate < 0.95);
}

function startPathBed() {
  if (Capacitor.isNativePlatform() || typeof Audio === "undefined") return;
  if (!bed) {
    bed = new Audio("/sitar-path.ogg");
    bed.loop = true;
    bed.preload = "auto";
  }
  if (bedFade) clearInterval(bedFade);
  bed.volume = 0.04;
  void bed.play().catch(() => {});
  bedFade = setInterval(() => {
    if (!bed) return;
    bed.volume = Math.min(0.22, bed.volume + 0.03);
    if (bed.volume >= 0.22 && bedFade) {
      clearInterval(bedFade);
      bedFade = null;
    }
  }, 90);
}

function stopPathBed() {
  if (!bed) return;
  if (bedFade) clearInterval(bedFade);
  bedFade = setInterval(() => {
    if (!bed) return;
    bed.volume = Math.max(0, bed.volume - 0.04);
    if (bed.volume <= 0) {
      bed.pause();
      bed.currentTime = 0;
      if (bedFade) clearInterval(bedFade);
      bedFade = null;
    }
  }, 70);
}
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
  if (/[॥ॐः।]/.test(chunk)) return true;
  const hindi = /(है|हैं|था|थी|का |की |के |में |और |यह |आप |लिए |करें|बता|नहीं|होता|होती)/;
  const letters = (chunk.match(/[\u0900-\u097F]/g) || []).length;
  return letters > 10 && !hindi.test(chunk);
}

/** Dakshin pathashala: same Indian words, one flowing line, breath only at the danda. */
function dakshinPath(text: string): string {
  return text
    .replace(/ॐ/g, "ओ३म्...")
    .replace(/॥+/g, "..... ")
    .replace(/।/g, "... ")
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
  const lines = clean
    .split(/\n+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const parts: UmaPart[] = [];

  for (const line of lines) {
    const isSanskrit = isSanskritPath(line);
    if (isSanskrit) {
      // Split by danda (।) and double danda (॥) or commas to isolate quarters/padas
      const padas = line
        .split(/(?<=[।॥,])\s+/)
        .map((s) => s.trim())
        .filter(Boolean);

      let quarterIdx = 0;
      for (const pada of padas) {
        const spoken = dakshinPath(pada).slice(0, 500);
        if (!spoken) continue;

        // Rhythmic Chanting Pitch & Rate Cadence (सस्वर गान लय)
        // 0: Udatt (High pitch 1.10, rate 0.68)
        // 1: Anudatt (Low pitch 0.88, rate 0.64)
        // 2: Swarit (High melodious pitch 1.16, rate 0.70)
        // 3: Nyasa (Deep concluding pause pitch 0.82, rate 0.60)
        const pitchSequence = [1.10, 0.88, 1.16, 0.82];
        const rateSequence = [0.68, 0.64, 0.70, 0.60];
        const pIdx = quarterIdx % 4;

        parts.push({
          text: spoken,
          rate: rateSequence[pIdx],
          pitch: pitchSequence[pIdx],
        });
        quarterIdx++;
      }
    } else {
      const spoken = naturalHindi(line).slice(0, 700);
      if (spoken) {
        parts.push({
          text: spoken,
          rate: 0.96,
          pitch: 1.05,
        });
      }
    }
  }

  return parts.slice(0, 50);
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

  const withMusic = wantsPathMusic(parts);

  if (Capacitor.isNativePlatform()) {
    try {
      isCurrentlySpeaking = true;
      options?.onStart?.();
      await UmaVoice.speak({ parts, music: withMusic });
      isCurrentlySpeaking = false;
      options?.onEnd?.();
      return;
    } catch (err) {
      isCurrentlySpeaking = false;
      options?.onError?.(err);
      return;
    }
  }

  if (withMusic) startPathBed();

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
      stopPathBed();
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
      stopPathBed();
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
  stopPathBed();
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
