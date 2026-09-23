/** Speak Hindi & Sanskrit shlokas with melodious devotional tone from user action. */

let unlocked = false;
let isCurrentlySpeaking = false;

export function pickHindiVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  // Prioritize natural Hindi neural voices if present
  return (
    voices.find((v) => v.lang.toLowerCase() === "hi-in" && /natural|online|google/i.test(v.name)) ||
    voices.find((v) => v.lang.toLowerCase().startsWith("hi")) ||
    voices.find((v) => /hindi|हिन्दी/i.test(v.name)) ||
    voices.find((v) => v.lang.toLowerCase().includes("in")) ||
    null
  );
}

export function unlockUmaSpeech() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  unlocked = true;
  try {
    window.speechSynthesis.getVoices();
    window.speechSynthesis.cancel();
    window.speechSynthesis.resume();
    const u = new SpeechSynthesisUtterance("ॐ");
    u.lang = "hi-IN";
    u.volume = 0.5;
    u.rate = 1;
    const hi = pickHindiVoice();
    if (hi) u.voice = hi;
    window.speechSynthesis.speak(u);
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
  // Convert markdown and Sanskrit danda to natural rhythmic pauses
  const clean = text
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/#{1,6}\s?/g, "")
    .replace(/[•]/g, " ")
    .replace(/॥/g, "। ")
    .replace(/।/g, "। ")
    .replace(/\n+/g, "। ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 1800);

  if (!clean) {
    options?.onEnd?.();
    return;
  }

  // Native mobile Capacitor TTS fallback
  if (typeof window !== "undefined") {
    const cap = (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
    if (cap?.isNativePlatform?.()) {
      try {
        const spec = "@capacitor-community/text-to-speech";
        const mod = (await import(/* @vite-ignore */ spec)) as {
          TextToSpeech: {
            speak: (o: { text: string; lang: string; rate: number; pitch: number; volume: number }) => Promise<void>;
            stop: () => Promise<void>;
          };
        };
        isCurrentlySpeaking = true;
        options?.onStart?.();
        await mod.TextToSpeech.speak({
          text: clean,
          lang: "hi-IN",
          rate: options?.rate ?? 0.88,
          pitch: options?.pitch ?? 1.02,
          volume: 1,
        });
        isCurrentlySpeaking = false;
        options?.onEnd?.();
        return;
      } catch {
        /* fall through to browser TTS */
      }
    }
  }

  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    options?.onEnd?.();
    return;
  }

  const synth = window.speechSynthesis;
  synth.cancel();
  synth.resume();

  const utter = new SpeechSynthesisUtterance(clean);
  utter.lang = "hi-IN";
  // Calm, melodious, authoritative Vedic pace
  utter.rate = options?.rate ?? 0.88;
  utter.pitch = options?.pitch ?? 1.02;

  const voice = pickHindiVoice();
  if (voice) utter.voice = voice;

  utter.onstart = () => {
    isCurrentlySpeaking = true;
    options?.onStart?.();
  };

  utter.onend = () => {
    isCurrentlySpeaking = false;
    options?.onEnd?.();
  };

  utter.onerror = (e) => {
    isCurrentlySpeaking = false;
    options?.onError?.(e);
    options?.onEnd?.();
  };

  if (!unlocked) unlockUmaSpeech();
  synth.speak(utter);
}

export function stopUmaSpeech() {
  isCurrentlySpeaking = false;
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
