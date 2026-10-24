import { Capacitor, registerPlugin } from "@capacitor/core";
import { extractPureSanskritVerse } from "./sanskritPhonetics";
import { umaVoice } from "../services/UmaVoiceService";

export interface UmaVoicePlugin {
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

export const UmaVoice = registerPlugin<UmaVoicePlugin>("UmaVoice");

let bed: HTMLAudioElement | null = null;
let bedFade: ReturnType<typeof setInterval> | null = null;

function startPathBed() {
  if (Capacitor.isNativePlatform() || typeof Audio === "undefined") return;
  if (!bed) {
    bed = new Audio("/sitar-path.ogg");
    bed.loop = true;
    bed.preload = "auto";
  }
  if (bedFade) clearInterval(bedFade);
  bed.volume = 0.05;
  void bed.play().catch(() => {});
  bedFade = setInterval(() => {
    if (!bed) return;
    bed.volume = Math.min(0.28, bed.volume + 0.03);
    if (bed.volume >= 0.28 && bedFade) {
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
let activeSpeakToken = 0;

export type UmaPart = { text: string; rate: number; pitch: number };

function stripMarkup(text: string): string {
  return text
    .replace(/Grah Dasha Analysis/gi, "ग्रह दशा विश्लेषण")
    .replace(/Past Insights/gi, "अतीत का विश्लेषण")
    .replace(/Future Trajectory/gi, "भविष्य कालखंड")
    .replace(/Vedic Upay/gi, "वैदिक सात्विक उपाय")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/#{1,6}\s?/g, "")
    .replace(/[•▪●]/g, ", ")
    .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, "")
    .replace(/॥\s*[\u0966-\u096F\d]+\s*॥/g, "।")
    .replace(/॥\s*॥/g, "।")
    .replace(/[\(\[\{]\s*[\u0966-\u096F\d]+\s*[\)\]\}]/g, "")
    .replace(/श्लोक\s*[\u0966-\u096F\d]+[\:\-\s]*/gi, "")
    .replace(/चौपाई\s*[\u0966-\u096F\d]+[\:\-\s]*/gi, "")
    .replace(/दोहा\s*[\u0966-\u096F\d]+[\:\-\s]*/gi, "")
    .replace(/सोरठा\s*[\u0966-\u096F\d]+[\:\-\s]*/gi, "")
    .replace(/सोराठा\s*[\u0966-\u096F\d]+[\:\-\s]*/gi, "")
    .replace(/पद\s*#?\s*[\u0966-\u096F\d]+[\:\-\s]*/gi, "")
    .replace(/संख्या\s*[\u0966-\u096F\d]+[\:\-\s]*/gi, "")
    .replace(/[ \t]+/g, " ")
    .trim();
}

function isSanskritPath(chunk: string): boolean {
  if (/[॥ॐःऽ]/.test(chunk)) return true;
  if (/(महिम्न|ताण्डव|स्तोत्र|शिवाय|महेश्वराय|दिगम्बराय|धीमहि|प्रचोदयात्|यजामहे|पुष्टिवर्धनम्|माङ्गल्ये|नमोऽस्तु|तस्मै|सर्वभूतेषु)/.test(chunk)) {
    return true;
  }
  const hindi = /(है|हैं|था|थी|का |की |के |में |और |यह |आप |लिए |करें|बता|नहीं|होता|होती|भावार्थ)/;
  const letters = (chunk.match(/[\u0900-\u097F]/g) || []).length;
  return letters > 10 && !hindi.test(chunk);
}

/** Speak the shloka as written. Rewriting visarga was making the words wrong. */
function dakshinPath(text: string): string {
  return text
    .replace(/॥\s*[\u0966-\u096F\d]+\s*॥/g, "। ")
    .replace(/[ \t]+/g, " ")
    .trim();
}

function naturalHindi(text: string): string {
  return text.replace(/[ \t]+/g, " ").trim();
}

export function buildUmaParts(
  text: string,
  options?: { sanskritOnly?: boolean; rate?: number; pitch?: number }
): UmaPart[] {
  const sourceText = options?.sanskritOnly ? extractPureSanskritVerse(text) : text;
  const clean = stripMarkup(sourceText);
  if (!clean) return [];
  const lines = clean
    .split(/\n+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const parts: UmaPart[] = [];

  const yaman = [0.96, 1.0, 1.06, 1.1, 1.06, 1.0, 0.96];
  let swara = 0;

  for (const line of lines) {
    const isSanskrit = isSanskritPath(line);
    if (isSanskrit) {
      const padas = line
        .split(/(?<=[।॥,])\s+/)
        .map((s) => s.trim())
        .filter(Boolean);

      for (const pada of padas) {
        const spoken = dakshinPath(pada).slice(0, 500);
        if (!spoken) continue;

        parts.push({
          text: spoken,
          rate: options?.rate ?? 0.82,
          pitch: options?.pitch ?? yaman[swara++ % yaman.length],
        });
      }
    } else {
      const spoken = naturalHindi(line).slice(0, 700);
      if (spoken) {
        parts.push({
          text: spoken,
          rate: options?.rate ?? 0.9,
          pitch: options?.pitch ?? 1.02,
        });
      }
    }
  }

  return parts.slice(0, 60);
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
  const female = /female|hia|hfc|hfd|neural|wavenet-a|wavenet-d|woman|swara/i;
  const male = /male|hid|hie|wavenet-b|wavenet-c|madhur/i;
  return (
    // 1. Prefer dedicated Sanskrit (sa-IN) voice if installed on device
    voices.find((v) => v.lang.toLowerCase().startsWith("sa")) ||
    // 2. High-quality Neural Hindi voice
    voices.find((v) => v.lang.toLowerCase().startsWith("hi") && female.test(v.name) && !male.test(v.name)) ||
    voices.find((v) => v.lang.toLowerCase() === "hi-in" && !male.test(v.name)) ||
    voices.find((v) => v.lang.toLowerCase().startsWith("hi")) ||
    voices.find((v) => /sanskrit|संस्कृत|hindi|हिन्दी/i.test(v.name)) ||
    null
  );
}

export function unlockUmaSpeech() {
  unlocked = true;
  umaVoice.unlockAudio();
}

export interface SpeakOptions {
  rate?: number;
  pitch?: number;
  sanskritOnly?: boolean;
  voiceStyle?: "pandit" | "uma";
  raga?: string;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err?: any) => void;
}

export async function speakUma(text: string, options?: SpeakOptions): Promise<void> {
  const pandit = options?.voiceStyle === "pandit" || options?.sanskritOnly === true;
  if (pandit) {
    startPathBed();
  }

  isCurrentlySpeaking = true;
  return umaVoice.speak(text, {
    rate: options?.rate ?? (pandit ? 0.88 : 0.94),
    pitch: options?.pitch ?? (pandit ? 1.0 : 1.04),
    voiceStyle: options?.voiceStyle ?? (pandit ? "pandit" : "uma"),
    sanskritOnly: options?.sanskritOnly,
    onStart: () => {
      isCurrentlySpeaking = true;
      options?.onStart?.();
    },
    onEnd: () => {
      stopPathBed();
      isCurrentlySpeaking = false;
      options?.onEnd?.();
    },
    onError: (err) => {
      stopPathBed();
      isCurrentlySpeaking = false;
      options?.onError?.(err);
    },
  });
}

export function stopUmaSpeech() {
  activeSpeakToken += 1;
  stopPathBed();
  isCurrentlySpeaking = false;
  umaVoice.stop();
  if (Capacitor.isNativePlatform()) {
    UmaVoice.stopSpeaking().catch(() => {});
  }
}

export function isUmaSpeaking(): boolean {
  return umaVoice.isSpeaking() || isCurrentlySpeaking;
}

