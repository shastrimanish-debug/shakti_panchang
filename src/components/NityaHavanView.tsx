import React, { useEffect, useMemo, useState } from 'react';
import {
  Flame,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Sparkles,
  Clock,
  AlertTriangle,
  CheckCircle2,
  RotateCcw,
  BookOpen,
  Compass,
  ShieldCheck,
} from 'lucide-react';
import { SavedLocation, VedicPanchangData } from '../types';
import {
  buildDailySankalpaText,
  calculateAgnivasa,
  getBestHavanTiming,
  getDailyHavanGuide,
  getNityaHavanMantras,
  getNityaHavanSteps,
} from '../services/havan';
import { useLanguage } from '../i18n';
import { trVedic } from '../i18n/vedicTranslate';
import { speakUma, stopUmaSpeech } from '../lib/umaSpeech';
import { triggerHapticSelection } from '../utils/haptics';

interface NityaHavanViewProps {
  panchang: VedicPanchangData | null;
  currentLocation: SavedLocation;
  onOpenUmaWithQuery?: (query: string) => void;
  onBackToPanchang?: () => void;
}

function playSacredHavanBell() {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const oscOver = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    oscOver.type = 'triangle';
    osc.frequency.setValueAtTime(528, now);
    oscOver.frequency.setValueAtTime(1056, now);
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.12, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
    osc.connect(gain);
    oscOver.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    oscOver.start(now);
    osc.stop(now + 1.25);
    oscOver.stop(now + 1.25);
  } catch {
    // Ignore WebAudio autoplay restrictions
  }
}

export const NityaHavanView: React.FC<NityaHavanViewProps> = ({
  panchang,
  currentLocation,
  onOpenUmaWithQuery,
  onBackToPanchang,
}) => {
  const { language } = useLanguage();
  const cLang = (language || 'hi').slice(0, 2).toLowerCase();
  const L = <T,>(hi: T, en: T, gu: T): T => (cLang === 'en' ? en : cLang === 'gu' ? gu : hi);

  const dateKey = useMemo(() => {
    const d = panchang?.date || new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `shakti_havan_ahuti_${y}-${m}-${day}`;
  }, [panchang?.date]);

  const [ahutiCount, setAhutiCount] = useState<number>(0);
  const [targetAhuti, setTargetAhuti] = useState<number>(11);
  const [selectedMantraId, setSelectedMantraId] = useState<string>('gayatri');
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showFormula, setShowFormula] = useState<boolean>(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(dateKey);
      setAhutiCount(saved ? Math.max(0, parseInt(saved, 10) || 0) : 0);
    } catch {
      setAhutiCount(0);
    }
  }, [dateKey]);

  useEffect(() => {
    return () => {
      stopUmaSpeech();
    };
  }, []);

  if (!panchang) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 text-sm font-semibold" style={{ color: 'var(--bx-ink)' }}>
        {L('अग्निवास एवं पञ्चाङ्ग गणना हो रही है...', 'Calculating Agnivasa and Panchang...', 'અગ્નિવાસ અને પંચાંગ ગણતરી થઈ રહી છે...')}
      </div>
    );
  }

  const agnivasa = calculateAgnivasa(panchang, cLang);
  const varaGuide = getDailyHavanGuide(panchang, cLang);
  const timing = getBestHavanTiming(panchang, cLang);
  const baseMantras = getNityaHavanMantras(cLang);
  const steps = getNityaHavanSteps(cLang);
  const sankalpaText = buildDailySankalpaText(panchang, currentLocation.name, cLang);

  const allMantras = [
    ...baseMantras.slice(0, 2),
    {
      id: 'vara_special',
      deity: L(`आज का वार विशेष — ${varaGuide.planet}`, `Today's Vara Special — ${varaGuide.planet}`, `આજનો વાર વિશેષ — ${varaGuide.planet}`),
      focusTag: varaGuide.deity,
      sanskrit: varaGuide.varaMantra,
      transliteration: varaGuide.planet,
      meaning: varaGuide.benefit,
      recommendedCount: 5,
    },
    ...baseMantras.slice(2),
  ];

  const activeMantra = allMantras.find((m) => m.id === selectedMantraId) || allMantras[0];

  const handleToggleSpeech = (id: string, text: string, sanskritOnly: boolean) => {
    triggerHapticSelection();
    if (speakingId === id) {
      stopUmaSpeech();
      setSpeakingId(null);
      return;
    }
    stopUmaSpeech();
    setSpeakingId(id);
    void speakUma(text, {
      sanskritOnly,
      rate: sanskritOnly ? 0.88 : 0.96,
      onEnd: () => setSpeakingId((curr) => (curr === id ? null : curr)),
      onError: () => setSpeakingId((curr) => (curr === id ? null : curr)),
    });
  };

  const handleCopyText = async (id: string, text: string) => {
    triggerHapticSelection();
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId((curr) => (curr === id ? null : curr)), 1800);
    } catch {
      // Clipboard blocked in restricted webview
    }
  };

  const handleOfferAhuti = () => {
    triggerHapticSelection();
    const next = ahutiCount + 1;
    setAhutiCount(next);
    try {
      localStorage.setItem(dateKey, String(next));
    } catch {
      // Ignore storage quota issues
    }
    if (next === targetAhuti) {
      playSacredHavanBell();
    }
  };

  const handleResetAhuti = () => {
    triggerHapticSelection();
    setAhutiCount(0);
    try {
      localStorage.removeItem(dateKey);
    } catch {
      // Ignore
    }
  };

  const progressRatio = Math.min(1, ahutiCount / Math.max(1, targetAhuti));
  const ringRadius = 32;
  const ringCirc = 2 * Math.PI * ringRadius;
  const ringOffset = ringCirc * (1 - progressRatio);

  const formattedPlace =
    cLang === 'en'
      ? currentLocation.name.match(/\(([^)]+)\)/)?.[1] || currentLocation.name
      : currentLocation.name;

  return (
    <div className="flex-1 min-h-0 w-full bx-home overflow-y-auto overscroll-contain p-3 sm:p-5 pb-28">
      <div className="max-w-6xl mx-auto space-y-4">
        {/* Top Context Header Strip */}
        <section
          className="rounded-3xl border p-4 sm:p-5 shadow-xs"
          style={{
            backgroundColor: 'var(--bx-panel)',
            borderColor: 'var(--bx-gold)',
            color: 'var(--bx-ink)',
          }}
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--bx-header)' }}>
                <Flame className="w-4 h-4 shrink-0" style={{ color: 'var(--bx-gold)' }} />
                <span>
                  {L('अग्निवास एवं नित्य हवन विधि', 'Agnivasa & Daily Nitya Havan Vidhi', 'અગ્નિવાસ અને નિત્ય હવન વિધિ')}
                </span>
              </div>
              <h1 className="font-granth text-xl sm:text-2xl font-black mt-1 leading-tight" style={{ color: 'var(--bx-header)' }}>
                {agnivasa.title}
              </h1>
              <p className="text-xs font-medium opacity-85 mt-1">
                {trVedic(panchang.weekday, cLang)} · {trVedic(panchang.paksha, cLang)} {trVedic(panchang.tithi, cLang)} · {trVedic(panchang.nakshatra, cLang)} · {formattedPlace}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {onOpenUmaWithQuery && (
                <button
                  type="button"
                  onClick={() => {
                    triggerHapticSelection();
                    onOpenUmaWithQuery(
                      L(
                        `आज ${panchang.weekday}, ${panchang.paksha} ${panchang.tithi} को अग्निवास (${agnivasa.residence === 'prithvi' ? 'पृथ्वी' : agnivasa.residence === 'akasha' ? 'आकाश' : 'पाताल'}) की स्थिति व मेरे नित्य हवन हेतु सरल विधि व सामग्री बताएं।`,
                        `Explain today's Agnivasa (${agnivasa.residence}) on ${trVedic(panchang.weekday, 'en')}, ${trVedic(panchang.tithi, 'en')} and guide a simple daily Nitya Havan ritual and samagri for my home.`,
                        `આજે ${trVedic(panchang.weekday, 'gu')}, ${trVedic(panchang.tithi, 'gu')} ના રોજ અગ્નિવાસ અને નિત્ય હવનની સરળ વિધિ તથા સામગ્રી જણાવો.`
                      )
                    );
                  }}
                  className="min-h-[44px] px-3.5 py-2 rounded-2xl text-xs font-bold flex items-center gap-1.5 border shadow-xs cursor-pointer active:scale-95 transition"
                  style={{
                    backgroundColor: 'var(--bx-header)',
                    color: '#FFFFFF',
                    borderColor: 'var(--bx-gold)',
                  }}
                >
                  <Sparkles className="w-4 h-4 shrink-0" style={{ color: 'var(--bx-mark-soft)' }} />
                  <span>{L('उमा से विधि पूछें', 'Ask Uma Vidhi', 'ઉમાને વિધિ પૂછો')}</span>
                </button>
              )}
              {onBackToPanchang && (
                <button
                  type="button"
                  onClick={() => {
                    triggerHapticSelection();
                    onBackToPanchang();
                  }}
                  className="min-h-[44px] px-3 py-2 rounded-2xl text-xs font-bold border cursor-pointer active:scale-95 transition"
                  style={{
                    backgroundColor: 'var(--bx-cream)',
                    color: 'var(--bx-header)',
                    borderColor: 'var(--bx-line)',
                  }}
                >
                  {L('पंचांग पर लौटें', 'Back to Panchang', 'પંચાંગ પર પાછા')}
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Responsive 12-Col Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* LEFT COLUMN (7 Cols): Agnivasa Nirnaya + Samidha/Timing + Sankalpa */}
          <div className="lg:col-span-7 space-y-4">
            {/* 1. Agnivasa Calculation & Verdict */}
            <section
              className="rounded-3xl border p-4 sm:p-5 space-y-3 shadow-xs"
              style={{
                backgroundColor: 'var(--bx-panel)',
                borderColor: 'var(--bx-line)',
                color: 'var(--bx-ink)',
              }}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b" style={{ borderColor: 'var(--bx-line)' }}>
                <div className="flex items-center gap-2">
                  {agnivasa.isAuspicious ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                  )}
                  <h2 className="font-granth text-base sm:text-lg font-black" style={{ color: 'var(--bx-header)' }}>
                    {L('दैनिक अग्निवास निर्णय', 'Daily Agnivasa Decision', 'દૈનિક અગ્નિવાસ નિર્ણય')}
                  </h2>
                </div>
                <span
                  className={`text-xs font-black px-2.5 py-1 rounded-xl border ${
                    agnivasa.isAuspicious
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-200 dark:border-emerald-700'
                      : 'bg-amber-50 text-amber-900 border-amber-300 dark:bg-amber-950/50 dark:text-amber-200 dark:border-amber-700'
                  }`}
                >
                  {agnivasa.badgeText}
                </span>
              </div>

              <p className="text-sm leading-relaxed font-medium">
                {agnivasa.fruitDescription}
              </p>
              <p className="text-xs leading-relaxed opacity-90">
                <strong style={{ color: 'var(--bx-header)' }}>
                  {L('व्यावहारिक मार्गदर्शन: ', 'Practical Guidance: ', 'વ્યાવહારિક માર્ગદર્શન: ')}
                </strong>
                {agnivasa.practicalGuidance}
              </p>

              {/* Exception Info */}
              <div
                className="rounded-2xl p-3 border text-xs leading-relaxed flex items-start gap-2"
                style={{
                  backgroundColor: 'var(--bx-cream)',
                  borderColor: 'var(--bx-line)',
                }}
              >
                <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--bx-gold)' }} />
                <div>
                  <strong style={{ color: 'var(--bx-header)' }}>
                    {L('नित्य कर्म अपवाद: ', 'Daily Exception: ', 'નિત્ય કર્મ અપવાદ: ')}
                  </strong>
                  <span>{agnivasa.nityaExceptionNote}</span>
                </div>
              </div>

              {/* Shastric Formula Toggle */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => {
                    triggerHapticSelection();
                    setShowFormula((prev) => !prev);
                  }}
                  className="min-h-[44px] px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-2 cursor-pointer transition"
                  style={{
                    backgroundColor: 'var(--bx-cream)',
                    borderColor: 'var(--bx-line)',
                    color: 'var(--bx-header)',
                  }}
                >
                  <Compass className="w-3.5 h-3.5" style={{ color: 'var(--bx-gold)' }} />
                  <span className="tabular-nums">{agnivasa.formulaDisplay}</span>
                  <span className="opacity-70">{showFormula ? '▴' : '▾'}</span>
                </button>
                {showFormula && (
                  <div
                    className="mt-2 p-3 rounded-2xl border text-xs space-y-1.5"
                    style={{
                      backgroundColor: 'var(--bx-cream)',
                      borderColor: 'var(--bx-line)',
                    }}
                  >
                    <div className="font-granth italic text-center" style={{ color: 'var(--bx-header)' }}>
                      &ldquo;{agnivasa.shastricVerse}&rdquo;
                    </div>
                    <div className="text-[11px] opacity-85 leading-relaxed">
                      {L(
                        'नियम: (शुक्ल/कृष्ण क्रम तिथि १–३० + वार १(रवि)–७(शनि) + १) को ४ से भाग दें। शेष ० या ३ = पृथ्वी (शुभ), १ = आकाश (अशुभ), २ = पाताल (अशुभ)।',
                        'Rule: (Continuous Lunar Tithi 1–30 + Weekday Sun=1..Sat=7 + 1) mod 4. Remainder 0 or 3 = Earth (Auspicious), 1 = Sky (Avoid), 2 = Netherworld (Avoid).',
                        'નિયમ: (શુક્લ/કૃષ્ણ તિથિ ૧–૩૦ + વાર ૧(રવિ)–૭(શનિ) + ૧) ÷ ૪. શેષ ૦ કે ૩ = પૃથ્વી (શુભ), ૧ = આકાશ (વર્જિત), ૨ = પાતાળ (વર્જિત).'
                      )}
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* 2. Today's Havan Timing, Samidha & Samagri */}
            <section
              className="rounded-3xl border p-4 sm:p-5 space-y-3 shadow-xs"
              style={{
                backgroundColor: 'var(--bx-panel)',
                borderColor: 'var(--bx-line)',
                color: 'var(--bx-ink)',
              }}
            >
              <div className="flex items-center justify-between gap-2 pb-2 border-b" style={{ borderColor: 'var(--bx-line)' }}>
                <h2 className="font-granth text-base sm:text-lg font-black flex items-center gap-2" style={{ color: 'var(--bx-header)' }}>
                  <Clock className="w-4 h-4" style={{ color: 'var(--bx-gold)' }} />
                  <span>{L('आज की समिधा, सामग्री व हवन काल', "Today's Samidha, Samagri & Timing", 'આજની સમિધા, સામગ્રી અને હવન કાળ')}</span>
                </h2>
                <span className="text-xs font-bold opacity-80">{varaGuide.planet}</span>
              </div>

              {/* Timing Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="p-3 rounded-2xl border bg-emerald-50/80 border-emerald-200 text-emerald-950 dark:bg-emerald-950/35 dark:border-emerald-800 dark:text-emerald-100">
                  <div className="text-[11px] font-bold opacity-80">{timing.bestWindowLabel}</div>
                  <div className="text-sm font-black tabular-nums mt-0.5">{timing.bestWindowTime}</div>
                </div>
                <div className="p-3 rounded-2xl border bg-rose-50/80 border-rose-200 text-rose-950 dark:bg-rose-950/35 dark:border-rose-800 dark:text-rose-100">
                  <div className="text-[11px] font-bold opacity-80">{timing.avoidLabel}</div>
                  <div className="text-sm font-black tabular-nums mt-0.5">{timing.avoidTime}</div>
                </div>
              </div>

              {/* Samidha & Samagri Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                <div className="p-3 rounded-2xl border" style={{ backgroundColor: 'var(--bx-cream)', borderColor: 'var(--bx-line)' }}>
                  <div className="font-bold opacity-75">{L('विहित समिधा (पवित्र काष्ठ)', 'Sacred Wood (Samidha)', 'શાસ્ત્રોક્ત સમિધા')}</div>
                  <div className="font-bold mt-1 leading-snug" style={{ color: 'var(--bx-header)' }}>{varaGuide.samidha}</div>
                </div>
                <div className="p-3 rounded-2xl border" style={{ backgroundColor: 'var(--bx-cream)', borderColor: 'var(--bx-line)' }}>
                  <div className="font-bold opacity-75">{L('आहुति माध्यम व देवता', 'Offering Base & Deity', 'આહુતિ માધ્યમ અને દેવતા')}</div>
                  <div className="font-bold mt-1 leading-snug" style={{ color: 'var(--bx-header)' }}>
                    {varaGuide.deity} · {varaGuide.ahutiOilOrGhee}
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-2xl border text-xs leading-relaxed" style={{ backgroundColor: 'var(--bx-cream)', borderColor: 'var(--bx-line)' }}>
                <div>
                  <strong style={{ color: 'var(--bx-header)' }}>{L('हवन सामग्री: ', 'Samagri: ', 'હવન સામગ્રી: ')}</strong>
                  <span>{varaGuide.samagri}</span>
                </div>
                <div className="mt-1 opacity-90">
                  <strong style={{ color: 'var(--bx-header)' }}>{L('फलश्रुति: ', 'Benefit: ', 'ફળશ્રુતિ: ')}</strong>
                  <span>{varaGuide.benefit}</span>
                </div>
              </div>
            </section>

            {/* 3. Dynamic Live Panchang Sankalpa */}
            <section
              className="rounded-3xl border p-4 sm:p-5 space-y-2.5 shadow-xs"
              style={{
                backgroundColor: 'var(--bx-panel)',
                borderColor: 'var(--bx-line)',
                color: 'var(--bx-ink)',
              }}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-granth text-base font-black" style={{ color: 'var(--bx-header)' }}>
                  {L('आज का पञ्चाङ्ग हवन संकल्प', "Today's Dynamic Panchang Sankalpa", 'આજનો પંચાંગ હવન સંકલ્પ')}
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleSpeech('sankalpa', sankalpaText, false)}
                    className="min-h-[44px] px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer transition"
                    style={{
                      backgroundColor: speakingId === 'sankalpa' ? 'var(--bx-gold)' : 'var(--bx-cream)',
                      color: speakingId === 'sankalpa' ? '#FFFFFF' : 'var(--bx-header)',
                      borderColor: 'var(--bx-line)',
                    }}
                  >
                    {speakingId === 'sankalpa' ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    <span>{speakingId === 'sankalpa' ? L('रोकें', 'Stop', 'રોકો') : L('सुनें', 'Listen', 'સાંભળો')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleCopyText('sankalpa', sankalpaText)}
                    className="min-h-[44px] px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer transition"
                    style={{
                      backgroundColor: 'var(--bx-cream)',
                      color: 'var(--bx-header)',
                      borderColor: 'var(--bx-line)',
                    }}
                  >
                    {copiedId === 'sankalpa' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedId === 'sankalpa' ? L('कॉपी हुआ', 'Copied', 'કોપી થયું') : L('कॉपी', 'Copy', 'કોપી')}</span>
                  </button>
                </div>
              </div>
              <p
                className="p-3 rounded-2xl border font-granth text-sm leading-relaxed"
                style={{
                  backgroundColor: 'var(--bx-cream)',
                  borderColor: 'var(--bx-line)',
                  color: 'var(--bx-header)',
                }}
              >
                {sankalpaText}
              </p>
            </section>
          </div>

          {/* RIGHT COLUMN (5 Cols): Interactive Ahuti Counter + Mantras + 5 Steps */}
          <div className="lg:col-span-5 space-y-4">
            {/* 4. Interactive Swaha Ahuti Studio */}
            <section
              className="rounded-3xl border p-4 sm:p-5 space-y-3.5 shadow-xs"
              style={{
                backgroundColor: 'var(--bx-panel)',
                borderColor: 'var(--bx-gold)',
                color: 'var(--bx-ink)',
              }}
            >
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-granth text-base sm:text-lg font-black" style={{ color: 'var(--bx-header)' }}>
                  {L('आहुति मन्त्र व स्वाहा काउंटर', 'Ahuti Mantra & Swaha Counter', 'આહુતિ મંત્ર અને સ્વાહા કાઉન્ટર')}
                </h2>
                <div className="flex items-center gap-1">
                  {[5, 11, 21, 108].map((goal) => (
                    <button
                      key={goal}
                      type="button"
                      onClick={() => {
                        triggerHapticSelection();
                        setTargetAhuti(goal);
                      }}
                      className="min-h-[36px] min-w-[36px] px-2 rounded-lg border text-xs font-black tabular-nums cursor-pointer transition"
                      style={{
                        backgroundColor: targetAhuti === goal ? 'var(--bx-header)' : 'var(--bx-cream)',
                        color: targetAhuti === goal ? '#FFFFFF' : 'var(--bx-ink)',
                        borderColor: targetAhuti === goal ? 'var(--bx-gold)' : 'var(--bx-line)',
                      }}
                    >
                      {goal}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mantra Selector */}
              <div className="flex flex-wrap gap-1.5">
                {allMantras.map((m) => {
                  const selected = m.id === activeMantra.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        triggerHapticSelection();
                        setSelectedMantraId(m.id);
                      }}
                      className="min-h-[40px] px-2.5 py-1.5 rounded-xl border text-xs font-bold cursor-pointer transition"
                      style={{
                        backgroundColor: selected ? 'var(--bx-header)' : 'var(--bx-cream)',
                        color: selected ? '#FFFFFF' : 'var(--bx-ink)',
                        borderColor: selected ? 'var(--bx-gold)' : 'var(--bx-line)',
                      }}
                    >
                      {m.focusTag}
                    </button>
                  );
                })}
              </div>

              {/* Active Mantra Card */}
              <div
                className="p-3.5 rounded-2xl border space-y-2"
                style={{
                  backgroundColor: 'var(--bx-cream)',
                  borderColor: 'var(--bx-line)',
                }}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-black" style={{ color: 'var(--bx-header)' }}>
                    {activeMantra.deity}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleToggleSpeech(activeMantra.id, activeMantra.sanskrit, true)}
                      className="min-h-[44px] min-w-[44px] px-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1 cursor-pointer transition"
                      style={{
                        backgroundColor: speakingId === activeMantra.id ? 'var(--bx-gold)' : 'var(--bx-panel)',
                        color: speakingId === activeMantra.id ? '#FFFFFF' : 'var(--bx-header)',
                        borderColor: 'var(--bx-line)',
                      }}
                      aria-label={L('मंत्र सुनें', 'Listen Mantra', 'મંત્ર સાંભળો')}
                    >
                      {speakingId === activeMantra.id ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                      <span>{speakingId === activeMantra.id ? L('रोकें', 'Stop', 'રોકો') : L('उच्चारण', 'Chant', 'ઉચ્ચાર')}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleCopyText(activeMantra.id, activeMantra.sanskrit)}
                      className="min-h-[44px] min-w-[44px] rounded-xl border flex items-center justify-center cursor-pointer transition"
                      style={{
                        backgroundColor: 'var(--bx-panel)',
                        color: 'var(--bx-header)',
                        borderColor: 'var(--bx-line)',
                      }}
                      aria-label={L('मंत्र कॉपी करें', 'Copy Mantra', 'મંત્ર કોપી કરો')}
                    >
                      {copiedId === activeMantra.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <p className="font-granth text-base font-black leading-relaxed" style={{ color: 'var(--bx-header)' }}>
                  {activeMantra.sanskrit}
                </p>
                {cLang === 'en' && (
                  <p className="text-xs italic opacity-80">{activeMantra.transliteration}</p>
                )}
                <p className="text-xs leading-relaxed opacity-90">{activeMantra.meaning}</p>
              </div>

              {/* Tactile Progress Ring + Swaha Action Button */}
              <div className="flex items-center gap-3.5 pt-1">
                <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
                  <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80" aria-hidden="true">
                    <circle
                      cx="40"
                      cy="40"
                      r={ringRadius}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="6"
                      className="opacity-15"
                    />
                    <circle
                      cx="40"
                      cy="40"
                      r={ringRadius}
                      fill="none"
                      stroke="var(--bx-gold)"
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray={ringCirc}
                      strokeDashoffset={ringOffset}
                      style={{ transition: 'stroke-dashoffset 180ms ease-out' }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
                    <span className="text-lg font-black tabular-nums" style={{ color: 'var(--bx-header)' }}>
                      {ahutiCount}
                    </span>
                    <span className="text-[10px] font-bold opacity-70 tabular-nums">/ {targetAhuti}</span>
                  </div>
                </div>

                <div className="flex-1 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={handleOfferAhuti}
                    className="w-full min-h-[50px] px-4 py-2.5 rounded-2xl text-sm font-black flex items-center justify-center gap-2 shadow-sm cursor-pointer active:scale-[0.98] transition"
                    style={{
                      backgroundColor: 'var(--bx-header)',
                      color: '#FFFFFF',
                      border: '1px solid var(--bx-gold)',
                    }}
                  >
                    <Flame className="w-4 h-4 shrink-0" style={{ color: 'var(--bx-mark-soft)' }} />
                    <span>{L('स्वाहा — आहुति अर्पित करें', 'Swaha — Offer Ahuti', 'સ્વાહા — આહુતિ અર્પણ કરો')}</span>
                  </button>

                  <div className="flex items-center justify-between text-xs px-1">
                    <span className="opacity-80 font-medium">
                      {ahutiCount >= targetAhuti
                        ? L('✨ संकल्प पूर्ण — पूर्णाहुति अर्पित करें', '✨ Goal Complete — Offer Purnahuti', '✨ સંકલ્પ પૂર્ણ — પૂર્ણાહુતિ અર્પણ કરો')
                        : L(`लक्ष्य से ${targetAhuti - ahutiCount} आहुति शेष`, `${targetAhuti - ahutiCount} ahutis remaining`, `લક્ષ્યથી ${targetAhuti - ahutiCount} આહુતિ બાકી`)}
                    </span>
                    <button
                      type="button"
                      onClick={handleResetAhuti}
                      className="min-h-[36px] px-2 rounded-lg flex items-center gap-1 font-bold opacity-75 hover:opacity-100 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>{L('शून्य', 'Reset', 'રીસેટ')}</span>
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* 5. Concise 5-Step Nitya Havan Vidhi */}
            <section
              className="rounded-3xl border p-4 sm:p-5 space-y-2.5 shadow-xs"
              style={{
                backgroundColor: 'var(--bx-panel)',
                borderColor: 'var(--bx-line)',
                color: 'var(--bx-ink)',
              }}
            >
              <h2 className="font-granth text-base font-black flex items-center gap-2 pb-1.5 border-b" style={{ borderColor: 'var(--bx-line)', color: 'var(--bx-header)' }}>
                <BookOpen className="w-4 h-4" style={{ color: 'var(--bx-gold)' }} />
                <span>{L('सरल ५-चरणीय नित्य हवन विधि', 'Simple 5-Step Nitya Havan Vidhi', 'સરળ ૫-ચરણીય નિત્ય હવન વિધિ')}</span>
              </h2>

              <div className="space-y-2">
                {steps.map((st) => (
                  <div
                    key={st.step}
                    className="p-3 rounded-2xl border space-y-1"
                    style={{
                      backgroundColor: 'var(--bx-cream)',
                      borderColor: 'var(--bx-line)',
                    }}
                  >
                    <div className="text-xs font-black" style={{ color: 'var(--bx-header)' }}>
                      {st.title}
                    </div>
                    <p className="text-xs leading-relaxed opacity-90">{st.instruction}</p>
                    {st.mantra && (
                      <p className="text-[11px] font-granth font-bold pt-0.5" style={{ color: 'var(--bx-header)' }}>
                        {st.mantra}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NityaHavanView;
