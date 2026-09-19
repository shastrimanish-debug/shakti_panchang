/** Speak Hindi from a user tap. Chrome blocks TTS after setTimeout. */

let unlocked = false;

function pickHindiVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  return (
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
    u.volume = 1;
    u.rate = 1;
    const hi = pickHindiVoice();
    if (hi) u.voice = hi;
    window.speechSynthesis.speak(u);
  } catch {
    /* ignore */
  }
}

export async function speakUma(text: string): Promise<void> {
  const clean = text
    .replace(/[*_#•॥]/g, " ")
    .replace(/\n+/g, "। ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 1400);
  if (!clean) return;

  if (typeof window !== "undefined") {
    const cap = (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
    if (cap?.isNativePlatform?.()) {
      try {
        const spec = "@capacitor-community/text-to-speech";
        const mod = (await import(/* @vite-ignore */ spec)) as {
          TextToSpeech: {
            speak: (o: { text: string; lang: string; rate: number; pitch: number; volume: number }) => Promise<void>;
          };
        };
        await mod.TextToSpeech.speak({
          text: clean,
          lang: "hi-IN",
          rate: 0.9,
          pitch: 1,
          volume: 1,
        });
        return;
      } catch {
        /* fall through to browser TTS */
      }
    }
  }

  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  const synth = window.speechSynthesis;
  synth.cancel();
  synth.resume();
  const utter = new SpeechSynthesisUtterance(clean);
  utter.lang = "hi-IN";
  utter.rate = 0.92;
  const voice = pickHindiVoice();
  if (voice) utter.voice = voice;
  if (!unlocked) unlockUmaSpeech();
  synth.speak(utter);
}

export function stopUmaSpeech() {
  window.speechSynthesis?.cancel();
}
