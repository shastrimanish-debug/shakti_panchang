import { Capacitor, registerPlugin } from "@capacitor/core";
import { extractPureSanskritVerse } from "./sanskritPhonetics";

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
let currentNeuralAudio: HTMLAudioElement | null = null;
const clientTtsCache = new Map<string, string>(); // cacheKey -> data URL

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
let currentUtterance: SpeechSynthesisUtterance | null = null;
let keepAliveTimer: any = null;
let activeSpeakToken = 0;

function clearKeepAlive() {
  if (keepAliveTimer) {
    clearInterval(keepAliveTimer);
    keepAliveTimer = null;
  }
}

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
  sanskritOnly?: boolean;
  voiceStyle?: "pandit" | "uma";
  raga?: string;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err?: any) => void;
}

function stopCurrentNeuralAudio() {
  if (currentNeuralAudio) {
    try {
      currentNeuralAudio.pause();
      currentNeuralAudio.src = "";
    } catch {
      /* ignore */
    }
    currentNeuralAudio = null;
  }
}

export async function speakUma(text: string, options?: SpeakOptions): Promise<void> {
  const myToken = ++activeSpeakToken;
  stopCurrentNeuralAudio();

  const parts = buildUmaParts(text, {
    sanskritOnly: options?.sanskritOnly,
    rate: options?.rate,
    pitch: options?.pitch,
  });

  if (!parts.length) {
    options?.onEnd?.();
    return;
  }

  const pandit = options?.voiceStyle === "pandit" || options?.sanskritOnly === true;

  // 1. Native Android Plugin (Uses Neural IndianVoice + Sanskrit-Phonetic Local TTS fallback)
  if (Capacitor.isNativePlatform()) {
    try {
      isCurrentlySpeaking = true;
      options?.onStart?.();
      await UmaVoice.speak({
        parts,
        music: pandit,
        raga: pandit ? options?.raga || "bhairav" : "",
      });
      if (myToken !== activeSpeakToken) return;
      isCurrentlySpeaking = false;
      options?.onEnd?.();
      return;
    } catch {
      if (myToken !== activeSpeakToken) return;
      isCurrentlySpeaking = false;
      if (pandit) startPathBed();
      // Fallback to web speech synthesis if native plugin rejects
    }
  } else if (pandit) {
    startPathBed();
  }

  // 2. Server-Side Vedic Pandit / Neural TTS (/api/tts/sanskrit) for pure Sanskrit/Hindi pronunciation
  const joinedPhoneticText = parts.map((p) => p.text).join(" । ").slice(0, 1600);
  const voiceStyle = pandit ? "pandit" : "uma";
  const cacheKey = `${voiceStyle}:${joinedPhoneticText}`;

  try {
    let audioDataUrl = clientTtsCache.get(cacheKey);
    if (!audioDataUrl) {
      const resp = await fetch("/api/tts/sanskrit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: joinedPhoneticText,
          voiceStyle,
        }),
        signal: AbortSignal.timeout(7500),
      });
      if (resp.ok) {
        const data = await resp.json();
        if (data?.ok && data?.audioBase64) {
          const mime = data.mimeType || "audio/wav";
          audioDataUrl = `data:${mime};base64,${data.audioBase64}`;
          if (clientTtsCache.size > 100) {
            const firstKey = clientTtsCache.keys().next().value;
            if (firstKey) clientTtsCache.delete(firstKey);
          }
          clientTtsCache.set(cacheKey, audioDataUrl);
        }
      }
    }

    if (myToken !== activeSpeakToken) return;

    if (audioDataUrl && typeof Audio !== "undefined") {
      const audio = new Audio(audioDataUrl);
      currentNeuralAudio = audio;
      audio.playbackRate = Math.max(0.75, Math.min(1.25, options?.rate ? options.rate / 0.88 : 1.0));
      isCurrentlySpeaking = true;
      audio.onplay = () => {
        if (myToken !== activeSpeakToken) return;
        options?.onStart?.();
      };
      audio.onended = () => {
        if (myToken !== activeSpeakToken) return;
        isCurrentlySpeaking = false;
        currentNeuralAudio = null;
        options?.onEnd?.();
      };
      audio.onerror = () => {
        if (myToken !== activeSpeakToken) return;
        isCurrentlySpeaking = false;
        currentNeuralAudio = null;
        speakWithBrowserSynth(parts, myToken, options);
      };
      await audio.play();
      return;
    }
  } catch {
    // Offline or server unreachable — fall through seamlessly to local phonetic browser TTS
  }

  if (myToken !== activeSpeakToken) return;
  speakWithBrowserSynth(parts, myToken, options);
}

function speakWithBrowserSynth(parts: UmaPart[], myToken: number, options?: SpeakOptions) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    options?.onError?.();
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
    if (myToken !== activeSpeakToken) return;
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
    utter.lang = voice?.lang || "hi-IN";
    utter.rate = part.rate;
    utter.pitch = part.pitch;
    if (voice) utter.voice = voice;
    utter.onstart = () => {
      if (myToken !== activeSpeakToken) return;
      if (index === 0) {
        isCurrentlySpeaking = true;
        options?.onStart?.();
      }
    };
    utter.onend = () => {
      if (myToken !== activeSpeakToken) return;
      index += 1;
      speakNext();
    };
    utter.onerror = (e) => {
      if (myToken !== activeSpeakToken) return;
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
  activeSpeakToken += 1;
  clearKeepAlive();
  stopPathBed();
  stopCurrentNeuralAudio();
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
  if (currentNeuralAudio && !currentNeuralAudio.paused) return true;
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    return window.speechSynthesis.speaking || isCurrentlySpeaking;
  }
  return isCurrentlySpeaking;
}
