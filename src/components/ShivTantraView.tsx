import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  SHIV_TANTRA_DATA,
  DharanaSutra,
  ChakraData,
} from '../data/shivTantraData';
import {
  Sparkles,
  Search,
  Share2,
  Copy,
  Check,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Wind,
  ShieldAlert,
  CheckCircle2,
} from 'lucide-react';
import { triggerHapticSelection } from '../utils/haptics';
import { umaVoice } from '../services/UmaVoiceService';
import { useLanguage } from '../i18n';
import { openWhatsAppShare } from '../services/umaConsultationPdf';

interface ShivTantraViewProps {
  onOpenUmaWithQuery?: (query: string) => void;
  onPrevChapter?: () => void;
  onNextChapter?: () => void;
}

type TabType = 'overview' | 'trika_upaya' | 'vigyan_bhairav' | 'chakras_nadis' | 'scriptures_myths';

export const ShivTantraView: React.FC<ShivTantraViewProps> = ({
  onOpenUmaWithQuery,
  onPrevChapter,
  onNextChapter,
}) => {
  const { language } = useLanguage();
  const cLang = (language || 'hi').slice(0, 2).toLowerCase();
  const L = <T,>(hi: T, en: T, gu: T): T => (cLang === 'en' ? en : cLang === 'gu' ? gu : hi);

  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedChakraId, setSelectedChakraId] = useState<string>('muladhara');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  // Guided Meditation Timer State
  const [activeTimerSutra, setActiveTimerSutra] = useState<DharanaSutra | null>(null);
  const [timerSecondsLeft, setTimerSecondsLeft] = useState<number>(180);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [timerPhase, setTimerPhase] = useState<'inhale' | 'hold' | 'exhale' | 'pause'>('inhale');
  const [timerPhaseSec, setTimerPhaseSec] = useState<number>(4);
  const timerIntervalRef = useRef<any>(null);

  // Data references
  const {
    overview,
    three_pillars_of_tantra,
    major_scriptures,
    trika_philosophy,
    the_four_upayas,
    states_of_consciousness,
    vigyan_bhairav_112_techniques,
    dharana_sutras,
    kundalini_and_chakras,
    subtle_anatomy,
    misconceptions_cleared,
    sacred_mantras,
  } = SHIV_TANTRA_DATA;

  // Selected chakra
  const activeChakra: ChakraData = useMemo(() => {
    return (
      kundalini_and_chakras.the_7_stages.find((c) => c.id === selectedChakraId) ||
      kundalini_and_chakras.the_7_stages[0]
    );
  }, [selectedChakraId, kundalini_and_chakras]);

  // Filtered Sutras
  const filteredSutras = useMemo(() => {
    return dharana_sutras.filter((s) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        s.sutraName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.technique.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.sanskrit.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.benefits.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCat =
        selectedCategory === 'all' || s.category.toLowerCase().includes(selectedCategory.toLowerCase());

      return matchesSearch && matchesCat;
    });
  }, [dharana_sutras, searchQuery, selectedCategory]);

  // Handle Speech Recitation
  const handleToggleSpeech = (id: string, text: string) => {
    triggerHapticSelection();
    if (speakingId === id) {
      umaVoice.stop();
      setSpeakingId(null);
    } else {
      umaVoice.stop();
      setSpeakingId(id);
      umaVoice.speak(text, {
        onEnd: () => setSpeakingId(null),
        onError: () => setSpeakingId(null),
      });
    }
  };

  // Copy to clipboard
  const handleCopy = (id: string, text: string) => {
    triggerHapticSelection();
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2200);
  };

  // WhatsApp Share
  const handleWhatsAppShare = (title: string, content: string) => {
    triggerHapticSelection();
    const shareText = `🔱 *${title}* — *${L('शिव तंत्र विद्या (कश्मीर शैव दर्शन)', 'Shiva Tantra Vidya (Kashmir Shaivism)', 'શિવ તંત્ર વિદ્યા (કાશ્મીર શૈવ દર્શન)')}*\n\n${content}\n\n🕉️ _${L('साभार: शक्ति पंचांग - शिव तंत्र विद्या', 'Shared from Shakti Panchang', 'સાભાર: શક્તિ પંચાંગ - શિવ તંત્ર વિદ્યા')}_`;
    openWhatsAppShare(shareText);
  };

  // Meditation Timer Lifecycle
  useEffect(() => {
    if (isTimerRunning) {
      timerIntervalRef.current = setInterval(() => {
        setTimerSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerIntervalRef.current);
            setIsTimerRunning(false);
            if (activeTimerSutra) {
              umaVoice.speak(
                L(
                  'साधना पूर्ण हुई। शांत बैठें और अंतरंग शिव चेतना में विश्राम करें। ॐ नमः शिवाय।',
                  'Meditation complete. Sit peacefully and rest in inner Shiva consciousness. Om Namah Shivaya.',
                  'સાધના પૂર્ણ થઈ. શાંત બેસો અને અંતરંગ શિવ ચેતનામાં વિશ્રામ કરો. ૐ નમઃ શિવાય.'
                )
              );
            }
            return 0;
          }
          return prev - 1;
        });

        // 4-phase breath cycle (4s inhale, 4s hold, 4s exhale, 4s pause = 16s cycle)
        setTimerPhaseSec((p) => {
          const next = p + 1;
          if (next <= 4) setTimerPhase('inhale');
          else if (next <= 8) setTimerPhase('hold');
          else if (next <= 12) setTimerPhase('exhale');
          else if (next <= 16) setTimerPhase('pause');
          else {
            setTimerPhase('inhale');
            return 1;
          }
          return next;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isTimerRunning, activeTimerSutra]);

  const startMeditationForSutra = (sutra: DharanaSutra, minutes: number = 3) => {
    triggerHapticSelection();
    setActiveTimerSutra(sutra);
    setTimerSecondsLeft(minutes * 60);
    setTimerPhaseSec(1);
    setTimerPhase('inhale');
    setIsTimerRunning(true);
    umaVoice.speak(
      L(
        `${sutra.sutraName} साधना प्रारंभ। अपनी रीढ़ सीधी करें, आंखें कोमलता से बंद करें और श्वास के ठहराव में शिव का अनुभव करें।`,
        `Starting ${sutra.sutraName} meditation. Keep your spine upright, gently close your eyes, and experience Shiva in the stillness of breath.`,
        `${sutra.sutraName} સાધના પ્રારંભ. કરોડરજ્જુ સીધી રાખો, આંખો કોમળતાથી બંધ કરો અને શ્વાસના ઠહેરાવમાં શિવનો અનુભવ કરો.`
      )
    );
  };

  const stopMeditationTimer = () => {
    triggerHapticSelection();
    setIsTimerRunning(false);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
  };

  const resetMeditationTimer = () => {
    triggerHapticSelection();
    setIsTimerRunning(false);
    setTimerSecondsLeft(180);
    setTimerPhase('inhale');
    setTimerPhaseSec(1);
  };

  // Format time MM:SS
  const formatTimer = (totalSec: number) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className="shiv-tantra-view flex-1 min-h-0 h-full w-full overflow-y-auto overscroll-y-contain p-2.5 sm:p-4 pb-32"
      style={{
        WebkitOverflowScrolling: "touch",
        touchAction: "pan-y",
      }}
    >
      {/* Top Breadcrumb / Title Bar */}
      <div className="max-w-4xl mx-auto space-y-3">
        {/* Sacred Header Card - Uses Active Devotional Theme Variables */}
        <div
          style={{
            background: "linear-gradient(180deg, var(--bx-panel) 0%, color-mix(in srgb, var(--bx-panel) 88%, var(--bx-cream)) 100%)",
            borderColor: "var(--bx-gold)",
            color: "var(--bx-ink)",
          }}
          className="relative overflow-hidden rounded-3xl p-4 sm:p-5 border-2 shadow-md space-y-3"
        >
          {/* Subtle Decorative Trident in Top-Right Corner */}
          <div className="absolute right-2 -top-1 opacity-10 pointer-events-none text-6xl select-none">
            🔱
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span
                  style={{
                    backgroundColor: "var(--bx-mark-soft)",
                    color: "var(--bx-header)",
                    borderColor: "var(--bx-line)",
                  }}
                  className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-xs"
                >
                  {L('आगम शास्त्र v2.1 • Complete Edition', 'Agama Shastra v2.1 • Complete Edition', 'આગમ શાસ્ત્ર v2.1 • સંપૂર્ણ આવૃત્તિ')}
                </span>
                <span
                  style={{ color: "var(--bx-header)" }}
                  className="text-[11px] font-bold font-granth"
                >
                  ॥ ॐ नमः शिवाय ॥
                </span>
              </div>
              <h1
                style={{ color: "var(--bx-header)" }}
                className="text-xl sm:text-2xl font-black font-granth tracking-wide flex items-center gap-2"
              >
                <span>{L('शिव तंत्र विद्या', 'Shiva Tantra Vidya', 'શિવ તંત્ર વિદ્યા')}</span>
                <span className="text-base">🔱</span>
              </h1>
              <p
                style={{ color: "var(--bx-ink)" }}
                className="text-xs sm:text-[13px] font-medium leading-relaxed mt-1"
              >
                {L(
                  'कश्मीर शैव दर्शन • विज्ञान भैरव तंत्र ११२ ध्यान धारणाएं • त्रिक दर्शन, ४ उपाय व कुण्डलिनी नाड़ी विज्ञान',
                  'Kashmir Shaivism • Vigyan Bhairav Tantra 112 Dharanas • Trika Philosophy, 4 Upayas & Kundalini Science',
                  'કાશ્મીર શૈવ દર્શન • વિજ્ઞાન ભૈરવ તંત્ર ૧૧૨ ધ્યાન ધારણાઓ • ત્રિક દર્શન, ૪ ઉપાય અને કુંડલિની નાડી વિજ્ઞાન'
                )}
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() =>
                  handleToggleSpeech(
                    'hero_shloka',
                    `${overview.invocation_mantra} ${L('अर्थ:', 'Meaning:', 'અર્થ:')} ${overview.invocation_meaning}`
                  )
                }
                style={{
                  backgroundColor: speakingId === 'hero_shloka' ? "var(--bx-gold)" : "var(--bx-cream)",
                  color: speakingId === 'hero_shloka' ? "#FFFFFF" : "var(--bx-header)",
                  borderColor: "var(--bx-line)",
                }}
                className={`p-2.5 rounded-xl border flex items-center gap-1.5 text-xs font-bold transition cursor-pointer active:scale-95 shadow-xs ${
                  speakingId === 'hero_shloka' ? 'animate-pulse' : 'hover:opacity-90'
                }`}
                title={L('मंगलाचरण सुनें', 'Listen to Invocation', 'મંગલાચરણ સાંભળો')}
              >
                {speakingId === 'hero_shloka' ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                <span className="hidden sm:inline">{L('मंगलाचरण', 'Invocation', 'મંગલાચરણ')}</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleWhatsAppShare(
                    L('शिव तंत्र विद्या मंगलाचरण', 'Shiva Tantra Invocation', 'શિવ તંત્ર વિદ્યા મંગલાચરણ'),
                    `${overview.invocation_mantra}\n\n${L('अर्थ:', 'Meaning:', 'અર્થ:')} ${overview.invocation_meaning}\n\n${overview.core_philosophy}`
                  )
                }
                style={{
                  backgroundColor: "var(--bx-cream)",
                  color: "var(--bx-header)",
                  borderColor: "var(--bx-line)",
                }}
                className="p-2.5 rounded-xl border flex items-center gap-1.5 text-xs font-bold transition cursor-pointer active:scale-95 hover:opacity-90 shadow-xs"
                title={L('व्हाट्सएप पर शेयर करें', 'Share on WhatsApp', 'WhatsApp પર શેર કરો')}
              >
                <Share2 className="w-4 h-4" />
                <span className="hidden sm:inline">{L('शेयर', 'Share', 'શેર')}</span>
              </button>

              {onOpenUmaWithQuery && (
                <button
                  type="button"
                  onClick={() => {
                    triggerHapticSelection();
                    onOpenUmaWithQuery(
                      L(
                        'प्रणाम उमा जी! शिव तंत्र विद्या और विज्ञान भैरव तंत्र के अनुसार मेरी आध्यात्मिक साधना के लिए कौन सी ध्यान विधि और उपाय सर्वोत्तम है?',
                        'Pranam Uma Ji! Based on Shiva Tantra Vidya and Vigyan Bhairav Tantra, which meditation method and Upaya is best suited for my spiritual sadhana?',
                        'પ્રણામ ઉમા જી! શિવ તંત્ર વિદ્યા અને વિજ્ઞાન ભૈરવ તંત્ર મુજબ મારી આધ્યાત્મિક સાધના માટે કઈ ધ્યાન વિધિ અને ઉપાય શ્રેષ્ઠ છે?'
                      )
                    );
                  }}
                  style={{
                    backgroundColor: "var(--bx-header)",
                    color: "#FFFFFF",
                    borderColor: "var(--bx-gold)",
                  }}
                  className="px-3.5 py-2 rounded-xl font-black text-xs flex items-center gap-1.5 shadow-md border transition cursor-pointer active:scale-95 hover:opacity-90"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{L('उमा परामर्श', 'Ask Uma', 'ઉમા પરામર્શ')}</span>
                </button>
              )}
            </div>
          </div>

          {/* Mangalacharan Shloka Box */}
          <div
            style={{
              backgroundColor: "var(--bx-cream)",
              borderColor: "var(--bx-line)",
            }}
            className="mt-2 border rounded-2xl p-3 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-2.5 shadow-2xs"
          >
            <div className="text-xs sm:text-sm font-granth leading-snug">
              <span
                style={{ color: "var(--bx-header)" }}
                className="font-bold block mb-1 text-sm sm:text-base"
              >
                {overview.invocation_mantra}
              </span>
              <span
                style={{ color: "var(--bx-ink)" }}
                className="text-[12px] font-sans font-medium italic block"
              >
                {overview.invocation_meaning}
              </span>
            </div>
            <span
              style={{
                backgroundColor: "var(--bx-panel)",
                borderColor: "var(--bx-gold)",
                color: "var(--bx-header)",
              }}
              className="text-[10px] font-bold border px-2.5 py-1 rounded-lg shrink-0 shadow-2xs"
            >
              {L('यजुर्वेद रुद्राध्याय', 'Yajurveda Rudradhyaya', 'યજુર્વેદ રુદ્રાધ્યાય')}
            </span>
          </div>
        </div>

        {/* Horizontal Navigation Sub-Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {[
            { id: 'overview', label: L('मूल दर्शन व ३ स्तम्भ', 'Philosophy & 3 Pillars', 'મૂળ દર્શન અને ૩ સ્તંભ'), icon: '🔱' },
            { id: 'trika_upaya', label: L('त्रिक दर्शन व ४ उपाय', 'Trika & 4 Upayas', 'ત્રિક દર્શન અને ૪ ઉપાય'), icon: '✨' },
            { id: 'vigyan_bhairav', label: L('विज्ञान भैरव ११२ सूत्र', 'Vigyan Bhairav 112', 'વિજ્ઞાન ભૈરવ ૧૧૨ સૂત્ર'), icon: '🌬️' },
            { id: 'chakras_nadis', label: L('७ चक्र व ३ नाड़ी विज्ञान', '7 Chakras & 3 Nadis', '૭ ચક્ર અને ૩ નાડી વિજ્ઞાન'), icon: '🌀' },
            { id: 'scriptures_myths', label: L('शास्त्र व भ्रांति निवारण', 'Scriptures & Truths', 'શાસ્ત્ર અને ભ્રાંતિ નિવારણ'), icon: '📜' },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  triggerHapticSelection();
                  setActiveTab(tab.id as TabType);
                }}
                style={{
                  backgroundColor: isActive ? "var(--bx-header)" : "var(--bx-panel)",
                  borderColor: isActive ? "var(--bx-gold)" : "var(--bx-line)",
                  color: isActive ? "#FFFFFF" : "var(--bx-ink)",
                }}
                className="px-3 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap shrink-0 border shadow-xs"
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ============================================================== */}
        {/* TAB 1: OVERVIEW & 3 PILLARS */}
        {/* ============================================================== */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* What is Tantra Definition Card */}
            <div className="bg-[#FAF5ED] dark:bg-[#2C1810] border border-[#DFCBB5] dark:border-[#5C3A21] rounded-3xl p-4 sm:p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2 border-b border-[#DFCBB5] dark:border-[#5C3A21]/60 pb-2">
                <span className="p-1.5 bg-[#7A1D1D] text-amber-300 rounded-xl text-base">🔱</span>
                <div>
                  <h2 className="text-base font-bold font-granth text-[#5C3A21] dark:text-[#FFD88A]">
                    {L('तंत्र का वास्तविक अर्थ एवं मूल दर्शन', 'True Meaning of Tantra & Core Philosophy', 'તંત્રનો વાસ્તવિક અર્થ અને મૂળ દર્શન')}
                  </h2>
                  <p className="text-[11px] text-[#8C6239] dark:text-amber-200/70">
                    {L('आगम परंपरा एवं आदि-शैव सिद्धांत', 'Agama Tradition & Adi-Shaiva Principles', 'આગમ પરંપરા અને આદિ-શૈવ સિદ્ધાંત')}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3 bg-[#FFFDF9] dark:bg-[#381F14] rounded-2xl border border-[#DFCBB5] dark:border-[#5C3A21]/50 space-y-1">
                  <div className="text-xs font-black text-[#7A1D1D] dark:text-[#FFD88A] flex items-center gap-1.5">
                    <span>{L('📖 शाब्दिक अर्थ', '📖 Etymology', '📖 શાબ્દિક અર્થ')}</span>
                  </div>
                  <p className="text-xs text-[#5C3A21] dark:text-[#E8DCCB] leading-relaxed">
                    {overview.meaning}
                  </p>
                </div>

                <div className="p-3 bg-[#FFFDF9] dark:bg-[#381F14] rounded-2xl border border-[#DFCBB5] dark:border-[#5C3A21]/50 space-y-1">
                  <div className="text-xs font-black text-[#7A1D1D] dark:text-[#FFD88A] flex items-center gap-1.5">
                    <span>{L('🌌 आगम उत्पत्ति', '🌌 Agama Origin', '🌌 આગમ ઉત્પત્તિ')}</span>
                  </div>
                  <p className="text-xs text-[#5C3A21] dark:text-[#E8DCCB] leading-relaxed">
                    {overview.origin}
                  </p>
                </div>

                <div className="p-3 bg-[#FFFDF9] dark:bg-[#381F14] rounded-2xl border border-[#DFCBB5] dark:border-[#5C3A21]/50 space-y-1">
                  <div className="text-xs font-black text-[#7A1D1D] dark:text-[#FFD88A] flex items-center gap-1.5">
                    <span>{L('🕉️ शिव-शक्ति अद्वैत', '🕉️ Shiva-Shakti Non-Duality', '🕉️ શિવ-શક્તિ અદ્વૈત')}</span>
                  </div>
                  <p className="text-xs text-[#5C3A21] dark:text-[#E8DCCB] leading-relaxed">
                    {overview.core_philosophy}
                  </p>
                </div>
              </div>
            </div>

            {/* Three Pillars of Tantra (Mantra, Yantra, Tantra) */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-sm font-bold font-granth text-[#5C3A21] dark:text-[#FFD88A] flex items-center gap-1.5">
                  <span>{L('त्रि-स्तम्भ: मंत्र, यंत्र एवं तंत्र', 'Three Pillars: Mantra, Yantra & Tantra', 'ત્રિ-સ્તંભ: મંત્ર, યંત્ર અને તંત્ર')}</span>
                  <span className="text-xs text-[#8C6239] dark:text-amber-300 font-normal">
                    {L('(तत्व त्रयी)', '(The 3 Pillars of Tantric Science)', '(તંત્ર વિજ્ઞાનના ૩ સ્તંભ)')}
                  </span>
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {three_pillars_of_tantra.map((pillar, idx) => (
                  <div
                    key={idx}
                    className="bg-[#FAF5ED] dark:bg-[#2C1810] border border-[#DFCBB5] dark:border-[#5C3A21] rounded-2xl p-4 flex flex-col justify-between shadow-xs hover:border-amber-500 transition"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl">{pillar.icon}</span>
                        <span className="text-[10px] bg-[#5C3A21] text-amber-200 px-2 py-0.5 rounded-full font-bold">
                          {pillar.element}
                        </span>
                      </div>
                      <h4 className="text-base font-bold font-granth text-[#7A1D1D] dark:text-[#FFD88A] mb-1">
                        {pillar.name}
                      </h4>
                      <p className="text-xs text-[#5C3A21] dark:text-[#D9C4A9] leading-relaxed mb-3">
                        {pillar.description}
                      </p>
                    </div>

                    <div className="pt-2.5 border-t border-[#DFCBB5] dark:border-[#5C3A21]/50 text-[11px] text-[#8C6239] dark:text-amber-200/90 font-medium">
                      <span className="font-bold text-[#5C3A21] dark:text-amber-300">{L('दैनिक साधना: ', 'Daily Practice: ', 'દૈનિક સાધના: ')}</span>
                      {pillar.practicalApplication}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sacred Shiva Tantra Mantras Section */}
            <div className="bg-[#FAF5ED] dark:bg-[#2C1810] border border-[#DFCBB5] dark:border-[#5C3A21] rounded-3xl p-4 sm:p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-[#DFCBB5] dark:border-[#5C3A21]/60 pb-2">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-[#7A1D1D] text-amber-300 rounded-xl text-sm">🕉️</span>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold font-granth text-[#5C3A21] dark:text-[#FFD88A]">
                      {L('शिव तंत्र के सिद्ध महामंत्र एवं स्तोत्र', 'Sacred Shiva Tantra Mantras & Stotras', 'શિવ તંત્રના સિદ્ધ મહામંત્ર અને સ્તોત્ર')}
                    </h3>
                    <p className="text-[11px] text-[#8C6239] dark:text-amber-200/70">
                      {L('ध्वनि स्पंदन द्वारा ऊर्जा शोधन व चक्र जागरण', 'Energy purification & chakra awakening via sacred sound', 'ધ્વનિ સ્પંદન દ્વારા ઊર્જા શોધન અને ચક્ર જાગરણ')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {sacred_mantras.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-[#FFFDF9] dark:bg-[#381F14] rounded-2xl border border-[#DFCBB5] dark:border-[#5C3A21]/50 flex flex-col justify-between space-y-2 shadow-2xs"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1.5">
                        <span className="text-xs font-bold text-[#7A1D1D] dark:text-[#FFD88A]">
                          {item.title}
                        </span>
                        <span className="text-[10px] bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 px-2 py-0.5 rounded-full font-bold">
                          {item.count}
                        </span>
                      </div>
                      <div className="p-2.5 bg-[#FAF5ED] dark:bg-[#23140C] rounded-xl border border-amber-300/40 dark:border-amber-600/30 text-center font-granth text-xs sm:text-sm font-bold text-[#7A1D1D] dark:text-amber-200 leading-snug">
                        {item.mantra}
                      </div>
                      <p className="text-[11px] text-[#5C3A21] dark:text-[#D9C4A9] leading-relaxed mt-2">
                        <span className="font-bold">{L('अर्थ: ', 'Meaning: ', 'અર્થ: ')}</span>
                        {item.meaning}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-[#DFCBB5] dark:border-[#5C3A21]/50 flex items-center justify-between text-[11px]">
                      <span className="text-emerald-700 dark:text-emerald-400 font-semibold truncate max-w-[200px]">
                        ✨ {item.benefit}
                      </span>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleToggleSpeech(`mantra_${idx}`, `${item.mantra} अर्थ: ${item.meaning}`)}
                          className={`p-1.5 rounded-lg border text-xs cursor-pointer ${
                            speakingId === `mantra_${idx}`
                              ? 'bg-amber-500 text-stone-950 border-amber-400 animate-pulse'
                              : 'bg-white dark:bg-stone-800 text-[#5C3A21] dark:text-[#FAF2E4] border-[#8C6239]/30'
                          }`}
                          title={L('मंत्र सुनें', 'Listen to Mantra', 'મંત્ર સાંભળો')}
                        >
                          {speakingId === `mantra_${idx}` ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCopy(`mantra_${idx}`, `${item.title}\n${item.mantra}\n\n${L('अर्थ:', 'Meaning:', 'અર્થ:')} ${item.meaning}`)}
                          className="p-1.5 rounded-lg border border-[#8C6239]/30 bg-white dark:bg-stone-800 text-[#5C3A21] dark:text-[#FAF2E4] text-xs cursor-pointer"
                          title={L('कॉपी करें', 'Copy', 'કૉપી કરો')}
                        >
                          {copiedId === `mantra_${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: TRIKA PHILOSOPHY & 4 UPAYAS & 5 CONSCIOUSNESS STATES */}
        {/* ============================================================== */}
        {activeTab === 'trika_upaya' && (
          <div className="space-y-4">
            {/* Trika Concept Card */}
            <div className="bg-[#FAF5ED] dark:bg-[#2C1810] border border-[#DFCBB5] dark:border-[#5C3A21] rounded-3xl p-4 sm:p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2 border-b border-[#DFCBB5] dark:border-[#5C3A21]/60 pb-2">
                <span className="p-1.5 bg-[#7A1D1D] text-amber-300 rounded-xl text-base">🔺</span>
                <div>
                  <h2 className="text-base font-bold font-granth text-[#5C3A21] dark:text-[#FFD88A]">
                    {L('त्रिक दर्शन — शिव, शक्ति एवं अणु', 'Trika Philosophy — Shiva, Shakti & Anu', 'ત્રિક દર્શન — શિવ, શક્તિ અને અણુ')}
                  </h2>
                  <p className="text-[11px] text-[#8C6239] dark:text-amber-200/70">
                    {trika_philosophy.meaning}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {trika_philosophy.the_three_elements.map((elem, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-[#FFFDF9] dark:bg-[#381F14] rounded-2xl border border-[#DFCBB5] dark:border-[#5C3A21]/50 space-y-1.5 shadow-2xs"
                  >
                    <div className="text-sm font-black font-granth text-[#7A1D1D] dark:text-[#FFD88A]">
                      {elem.name}
                    </div>
                    <div className="text-xs font-bold text-amber-800 dark:text-amber-300">
                      {elem.nature}
                    </div>
                    <p className="text-xs text-[#5C3A21] dark:text-[#D9C4A9] leading-relaxed">
                      {elem.symbolism}
                    </p>
                    <div className="pt-2 border-t border-[#DFCBB5] dark:border-[#5C3A21]/40 text-[11px] text-[#8C6239] dark:text-amber-200/80 italic font-medium">
                      💡 {elem.realization}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* The Four Upayas (आणवोपाय, शाक्तोपाय, शाम्भवोपाय, अनुपाय) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <div>
                  <h3 className="text-sm sm:text-base font-bold font-granth text-[#5C3A21] dark:text-[#FFD88A] flex items-center gap-1.5">
                    <span>{L('मोक्ष के ४ सोपान (The 4 Upayas)', 'The 4 Upayas (Steps to Liberation)', 'મોક્ષના ૪ સોપાન (The 4 Upayas)')}</span>
                    <span className="text-xs bg-[#7A1D1D] text-amber-200 px-2 py-0.5 rounded-full font-sans font-bold">
                      {L('क्रमिक से अक्रमिक', 'Gradual to Direct', 'ક્રમિક થી અક્રમિક')}
                    </span>
                  </h3>
                  <p className="text-xs text-[#8C6239] dark:text-amber-200/70 mt-0.5">
                    {the_four_upayas.description}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {the_four_upayas.paths.map((upaya, idx) => (
                  <div
                    key={upaya.id}
                    className="bg-[#FAF5ED] dark:bg-[#2C1810] border border-[#DFCBB5] dark:border-[#5C3A21] rounded-2xl p-4 flex flex-col justify-between shadow-xs hover:border-amber-500 transition space-y-3"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-stone-200 dark:bg-stone-800 text-[#5C3A21] dark:text-[#FFD88A]">
                          {L('स्तर', 'Level', 'સ્તર')} {idx + 1}: {upaya.level}
                        </span>
                        <span className="text-[11px] text-[#8C6239] dark:text-amber-300 font-bold">
                          {upaya.subtitle}
                        </span>
                      </div>

                      <h4 className="text-base font-black font-granth text-[#7A1D1D] dark:text-[#FFD88A] mb-1">
                        {upaya.name}
                      </h4>

                      <p className="text-xs text-[#5C3A21] dark:text-[#D9C4A9] leading-relaxed mb-2">
                        <span className="font-bold">{L('साधना विधि: ', 'Method: ', 'સાધના વિધિ: ')}</span>
                        {upaya.method}
                      </p>

                      <div className="p-2.5 bg-[#FFFDF9] dark:bg-[#381F14] rounded-xl border border-amber-300/40 text-xs text-[#7A1D1D] dark:text-amber-200">
                        <span className="font-bold block mb-0.5 text-stone-900 dark:text-stone-100">
                          {L('🧘 व्यावहारिक अभ्यास:', '🧘 Practical Sadhana:', '🧘 વ્યાવહારિક અભ્યાસ:')}
                        </span>
                        {upaya.sadhanaPractice}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#DFCBB5] dark:border-[#5C3A21]/50 flex items-center justify-between text-[11px]">
                      <span className="font-granth text-amber-800 dark:text-amber-300 italic truncate max-w-[240px]">
                        {upaya.quote}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          handleToggleSpeech(
                            upaya.id,
                            `${upaya.name}। स्तर: ${upaya.level}। विधि: ${upaya.method}। व्यावहारिक अभ्यास: ${upaya.sadhanaPractice}`
                          )
                        }
                        className={`p-1.5 rounded-lg border text-xs cursor-pointer ${
                          speakingId === upaya.id
                            ? 'bg-amber-500 text-stone-950 border-amber-400 animate-pulse'
                            : 'bg-white dark:bg-stone-800 text-[#5C3A21] dark:text-[#FAF2E4] border-[#8C6239]/30'
                        }`}
                        title={L('व्याख्या सुनें', 'Listen to Explanation', 'વ્યાખ્યા સાંભળો')}
                      >
                        {speakingId === upaya.id ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 5 States of Consciousness (जाग्रत, स्वप्न, सुषुप्ति, तुरीय, तुरीयातीत) */}
            <div className="bg-[#FAF5ED] dark:bg-[#2C1810] border border-[#DFCBB5] dark:border-[#5C3A21] rounded-3xl p-4 sm:p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2 border-b border-[#DFCBB5] dark:border-[#5C3A21]/60 pb-2">
                <span className="p-1.5 bg-[#7A1D1D] text-amber-300 rounded-xl text-base">👁️</span>
                <div>
                  <h3 className="text-base font-bold font-granth text-[#5C3A21] dark:text-[#FFD88A]">
                    {L('चेतना की ५ अवस्थाएं (5 States of Consciousness)', '5 States of Consciousness', 'ચેતનાની ૫ અવસ્થાઓ')}
                  </h3>
                  <p className="text-[11px] text-[#8C6239] dark:text-amber-200/70">
                    {L('जाग्रत से तुरीयातीत शिव-अवस्था तक का आत्म-रूपांतरण', 'Self-transformation from Waking state to Turiyatita Shiva-state', 'જાગ્રતથી તુરીયાતીત શિવ-અવસ્થા સુધીનું આત્મ-રૂપાંતરણ')}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                {states_of_consciousness.map((st, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-[#FFFDF9] dark:bg-[#381F14] rounded-2xl border border-[#DFCBB5] dark:border-[#5C3A21]/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-2xs"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="w-6 h-6 rounded-full bg-[#7A1D1D] text-amber-200 text-xs font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <span className="font-bold font-granth text-sm text-[#7A1D1D] dark:text-[#FFD88A]">
                          {st.state}
                        </span>
                        <span className="text-[10px] bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 px-2 py-0.2 rounded-full font-medium">
                          {st.sanskrit}
                        </span>
                      </div>
                      <p className="text-xs text-[#5C3A21] dark:text-[#D9C4A9] leading-relaxed pl-8">
                        {st.experience}
                      </p>
                    </div>

                    <div className="sm:text-right pl-8 sm:pl-0 shrink-0">
                      <div className="text-[11px] font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1 sm:justify-end">
                        <Sparkles className="w-3 h-3 text-amber-500" />
                        <span>{L('साधना सूत्र:', 'Sadhana Key:', 'સાધના સૂત્ર:')}</span>
                      </div>
                      <p className="text-[11px] text-[#735133] dark:text-[#C5B39B] italic font-medium max-w-xs">
                        {st.meditativeKey}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: VIGYAN BHAIRAV TANTRA 112 TECHNIQUES & GUIDED SUTRAS */}
        {/* ============================================================== */}
        {activeTab === 'vigyan_bhairav' && (
          <div className="space-y-4">
            {/* Vigyan Bhairav Overview & Summary */}
            <div className="bg-[#FAF5ED] dark:bg-[#2C1810] border border-[#DFCBB5] dark:border-[#5C3A21] rounded-3xl p-4 sm:p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-[#DFCBB5] dark:border-[#5C3A21]/60 pb-2">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-[#7A1D1D] text-amber-300 rounded-xl text-base">🌬️</span>
                  <div>
                    <h2 className="text-base font-bold font-granth text-[#5C3A21] dark:text-[#FFD88A]">
                      {L('विज्ञान भैरव तंत्र — ११२ ध्यान धारणाएं', 'Vigyan Bhairav Tantra — 112 Dharanas', 'વિજ્ઞાન ભૈરવ તંત્ર — ૧૧૨ ધ્યાન ધારણાઓ')}
                    </h2>
                    <p className="text-[11px] text-[#8C6239] dark:text-amber-200/70">
                      {L('भगवान शिव और देवी भैरवी का परम संवाद', 'Sacred Dialogue of Lord Shiva & Devi Bhairavi', 'ભગવાન શિવ અને દેવી ભૈરવીનો પરમ સંવાદ')}
                    </p>
                  </div>
                </div>
                <span className="text-xs bg-[#7A1D1D] text-amber-200 px-2.5 py-1 rounded-full font-bold">
                  {L('११२ मार्ग', '112 Paths', '૧૧૨ માર્ગ')}
                </span>
              </div>

              <p className="text-xs sm:text-[13px] text-[#5C3A21] dark:text-[#E8DCCB] leading-relaxed">
                {vigyan_bhairav_112_techniques.summary}
              </p>

              {/* 5 Major Categories Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
                {vigyan_bhairav_112_techniques.major_categories.map((cat, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      triggerHapticSelection();
                      setSelectedCategory(selectedCategory === cat.category ? 'all' : cat.category);
                    }}
                    className={`p-2.5 rounded-2xl border text-center transition cursor-pointer flex flex-col items-center justify-center gap-1 ${
                      selectedCategory === cat.category
                        ? 'bg-[#7A1D1D] text-amber-100 border-[#D4AF37] shadow-xs'
                        : 'bg-[#FFFDF9] dark:bg-[#381F14] text-[#5C3A21] dark:text-[#D9C4A9] border-[#DFCBB5] dark:border-[#5C3A21]/50 hover:border-amber-400'
                    }`}
                  >
                    <span className="text-xl">{cat.icon}</span>
                    <span className="text-[11px] font-bold leading-tight">{cat.category.split(' ')[0]}</span>
                    <span className="text-[9px] text-[#8C6239] dark:text-amber-300/80 font-semibold">{cat.count}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Guided Meditation Timer Tool (Active Dhyana Instrument) */}
            <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-[#1C0F0A] via-[#35180D] to-[#140804] text-[#FAF2E4] p-4 sm:p-5 border-2 border-amber-500/50 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                    ⏱️
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold font-granth text-[#FFD88A]">
                      {L('साधना अभ्यास टाइमर (Guided Dhyana Sadhana)', 'Guided Dhyana Sadhana Timer', 'સાધના અભ્યાસ ટાઈમર (Guided Dhyana)')}
                    </h3>
                    <p className="text-[11px] text-amber-200/80">
                      {activeTimerSutra
                        ? `${activeTimerSutra.sutraName}`
                        : L('श्वास-प्रश्वास विसर्ग धारणा (The Breath Gap)', 'The Breath Gap Dharana', 'શ્વાસ-પ્રશ્વાસ વિસર્ગ ધારણા')}
                    </p>
                  </div>
                </div>

                {/* Preset Time Buttons */}
                <div className="flex items-center gap-1.5">
                  {[1, 3, 5, 10].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => {
                        triggerHapticSelection();
                        setTimerSecondsLeft(mins * 60);
                        setIsTimerRunning(false);
                      }}
                      className={`px-2 py-1 rounded-lg text-xs font-bold border transition cursor-pointer ${
                        Math.round(timerSecondsLeft / 60) === mins
                          ? 'bg-amber-500 text-stone-950 border-amber-300'
                          : 'bg-white/10 text-amber-200 border-white/20 hover:bg-white/20'
                      }`}
                    >
                      {mins}m
                    </button>
                  ))}
                </div>
              </div>

              {/* Central Breathing Ring & Timer Display */}
              <div className="flex flex-col items-center justify-center py-2 space-y-3">
                <div className="relative flex items-center justify-center">
                  {/* Outer Pulsing Aura depending on breath phase */}
                  <div
                    className={`w-36 h-36 sm:w-44 sm:h-44 rounded-full border-4 flex items-center justify-center transition-all duration-1000 ${
                      timerPhase === 'inhale'
                        ? 'scale-110 border-sky-400 shadow-[0_0_30px_rgba(56,189,248,0.5)] bg-sky-950/40'
                        : timerPhase === 'hold'
                        ? 'scale-110 border-amber-400 shadow-[0_0_35px_rgba(251,191,36,0.6)] bg-amber-950/40'
                        : timerPhase === 'exhale'
                        ? 'scale-90 border-emerald-400 shadow-[0_0_25px_rgba(52,211,153,0.4)] bg-emerald-950/40'
                        : 'scale-85 border-purple-400 shadow-[0_0_30px_rgba(192,132,252,0.5)] bg-purple-950/40'
                    }`}
                  >
                    <div className="text-center space-y-0.5">
                      <div className="text-2xl sm:text-3xl font-black font-mono text-white tracking-widest">
                        {formatTimer(timerSecondsLeft)}
                      </div>
                      <div className="text-[11px] font-black uppercase tracking-wider text-amber-300">
                        {timerPhase === 'inhale' && L('श्वास लें (Inhale)', 'Inhale', 'શ્વાસ લો (Inhale)')}
                        {timerPhase === 'hold' && L('ठहराव / शून्य (Inner Pause)', 'Inner Pause', 'ઠહેરાવ / શૂન્ય (Inner Pause)')}
                        {timerPhase === 'exhale' && L('श्वास छोड़ें (Exhale)', 'Exhale', 'શ્વાસ છોડો (Exhale)')}
                        {timerPhase === 'pause' && L('बाहरी शून्य (Outer Void)', 'Outer Void', 'બાહ્ય શૂન્ય (Outer Void)')}
                      </div>
                      <div className="text-[10px] text-stone-300 font-sans">
                        {timerPhase === 'hold' || timerPhase === 'pause'
                          ? L('✨ यही शिव है', '✨ This is Shiva', '✨ આ જ શિવ છે')
                          : L('सजगता बनाए रखें', 'Stay Mindful', 'સજાગતા જાળવો')}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      triggerHapticSelection();
                      setIsTimerRunning(!isTimerRunning);
                      if (!isTimerRunning) {
                        umaVoice.speak(
                          L(
                            'श्वास को स्वाभाविक रूप से बहने दें। ठहराव में शिव की अनुभूति करें।',
                            'Let your breath flow naturally. Experience Shiva in the stillness between breaths.',
                            'શ્વાસને સ્વાભાવિક રીતે વહેવા દો. ઠહેરાવમાં શિવની અનુભૂતિ કરો.'
                          )
                        );
                      }
                    }}
                    className={`px-5 py-2.5 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg transition cursor-pointer active:scale-95 ${
                      isTimerRunning
                        ? 'bg-amber-500 text-stone-950 hover:bg-amber-400'
                        : 'bg-gradient-to-r from-amber-500 to-yellow-500 text-stone-950 hover:from-amber-600 hover:to-yellow-600'
                    }`}
                  >
                    {isTimerRunning ? <Pause className="w-4 h-4 fill-stone-950" /> : <Play className="w-4 h-4 fill-stone-950" />}
                    <span>{isTimerRunning ? L('ठहराव (Pause)', 'Pause', 'થોભો (Pause)') : L('साधना आरंभ करें (Start)', 'Start Meditation', 'સાધના શરૂ કરો (Start)')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={resetMeditationTimer}
                    className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white transition cursor-pointer active:scale-95"
                    title={L('रीसेट करें', 'Reset', 'રીસેટ કરો')}
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Search & Filter Bar */}
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-[#8C6239] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={L('धारणा सूत्र, संस्कृत श्लोक, लाभ या विधि खोजें...', 'Search dharana sutra, sanskrit verse, benefit or method...', 'ધારણા સૂત્ર, સંસ્કૃત શ્લોક, લાભ અથવા વિધિ શોધો...')}
                  className="w-full pl-9 pr-3 py-2 bg-[#FAF5ED] dark:bg-[#2C1810] border border-[#DFCBB5] dark:border-[#5C3A21] rounded-2xl text-xs sm:text-sm text-[#3E2714] dark:text-[#FAF2E4] focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {selectedCategory !== 'all' && (
                <button
                  type="button"
                  onClick={() => setSelectedCategory('all')}
                  className="px-3 py-2 bg-[#7A1D1D] text-amber-200 rounded-2xl text-xs font-bold shrink-0 cursor-pointer"
                >
                  {L('सभी श्रेणियां दिखाएं ✕', 'Show All Categories ✕', 'બધી શ્રેણીઓ બતાવો ✕')}
                </button>
              )}
            </div>

            {/* List of 10 Core Sutras */}
            <div className="space-y-3">
              {filteredSutras.map((sutra) => (
                <div
                  key={sutra.id}
                  className="bg-[#FAF5ED] dark:bg-[#2C1810] border border-[#DFCBB5] dark:border-[#5C3A21] rounded-3xl p-4 sm:p-5 shadow-xs space-y-3 hover:border-amber-500 transition"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#DFCBB5] dark:border-[#5C3A21]/60 pb-2.5">
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-xl bg-[#7A1D1D] text-amber-200 font-bold text-xs flex items-center justify-center shrink-0">
                        {sutra.id}
                      </span>
                      <div>
                        <h4 className="text-base font-bold font-granth text-[#7A1D1D] dark:text-[#FFD88A]">
                          {sutra.sutraName}
                        </h4>
                        <span className="text-[10px] text-[#8C6239] dark:text-amber-300 font-semibold">
                          {L('श्रेणी:', 'Category:', 'શ્રેણી:')} {sutra.category} • {L('अवधि:', 'Duration:', 'સમય:')} {sutra.durationMinutes} {L('मिनट', 'min', 'મિનિટ')}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                      <button
                        type="button"
                        onClick={() => startMeditationForSutra(sutra, sutra.durationMinutes)}
                        className="px-2.5 py-1 rounded-xl bg-amber-500 text-stone-950 font-black text-xs flex items-center gap-1 hover:bg-amber-400 transition cursor-pointer active:scale-95 shadow-xs"
                      >
                        <Play className="w-3 h-3 fill-stone-950" />
                        <span>{L('साधना टाइमर', 'Start Timer', 'સાધના ટાઈમર')}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleToggleSpeech(
                            `sutra_${sutra.id}`,
                            `${sutra.sutraName}। श्लोक: ${sutra.sanskrit}। अर्थ: ${sutra.translation}। ध्यान विधि: ${sutra.technique}`
                          )
                        }
                        className={`p-1.5 rounded-xl border text-xs cursor-pointer ${
                          speakingId === `sutra_${sutra.id}`
                            ? 'bg-amber-500 text-stone-950 border-amber-400 animate-pulse'
                            : 'bg-white dark:bg-stone-800 text-[#5C3A21] dark:text-[#FAF2E4] border-[#8C6239]/30'
                        }`}
                        title={L('श्लोक व विधि सुनें', 'Listen to Verse & Method', 'શ્લોક અને વિધિ સાંભળો')}
                      >
                        {speakingId === `sutra_${sutra.id}` ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleWhatsAppShare(
                            `विज्ञान भैरव सूत्र ${sutra.id}: ${sutra.sutraName}`,
                            `${sutra.sanskrit}\n\nअर्थ: ${sutra.translation}\n\nसाधना विधि: ${sutra.technique}\n\nलाभ: ${sutra.benefits}`
                          )
                        }
                        className="p-1.5 rounded-xl border border-emerald-500/40 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs cursor-pointer"
                        title={L('व्हाट्सएप शेयर', 'Share on WhatsApp', 'WhatsApp શેર')}
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Sanskrit Sutra Box */}
                  <div className="p-3 bg-[#FFFDF9] dark:bg-[#381F14] rounded-2xl border border-amber-300/40 dark:border-amber-700/30 text-center font-granth text-xs sm:text-sm font-bold text-[#7A1D1D] dark:text-amber-200 leading-relaxed shadow-2xs">
                    {sutra.sanskrit}
                  </div>

                  {/* Hindi Translation & Core Technique */}
                  <div className="space-y-1.5 text-xs text-[#5C3A21] dark:text-[#E8DCCB] leading-relaxed">
                    <p>
                      <strong className="text-[#7A1D1D] dark:text-amber-300">{L('भावार्थ: ', 'Meaning: ', 'ભાવાર્થ: ')}</strong>
                      {sutra.translation}
                    </p>
                    <p className="p-2 bg-amber-50/60 dark:bg-amber-950/20 rounded-xl border border-amber-200/60 dark:border-amber-800/40">
                      <strong className="text-[#8C4A00] dark:text-amber-300">{L('ध्यान तकनीक: ', 'Meditation Technique: ', 'ધ્યાન તકનીક: ')}</strong>
                      {sutra.technique}
                    </p>
                  </div>

                  {/* Step by Step Sadhana Guide */}
                  <div className="space-y-1 pt-1">
                    <span className="text-[11px] font-bold text-[#8C6239] dark:text-amber-300 uppercase tracking-wider block">
                      {L('चरणबद्ध साधना अभ्यास:', 'Step-by-Step Sadhana:', 'ક્રમબદ્ધ સાધના અભ્યાસ:')}
                    </span>
                    <ol className="list-decimal list-inside space-y-1 text-xs text-[#5C3A21] dark:text-[#D9C4A9]">
                      {sutra.stepByStep.map((step, sIdx) => (
                        <li key={sIdx} className="leading-relaxed">
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* Benefits */}
                  <div className="pt-2 border-t border-[#DFCBB5] dark:border-[#5C3A21]/50 text-xs text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>{L('लाभ:', 'Benefits:', 'લાભ:')} {sutra.benefits}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 4: 7 CHAKRAS & 3 NADIS KUNDALINI ANATOMY */}
        {/* ============================================================== */}
        {activeTab === 'chakras_nadis' && (
          <div className="space-y-4">
            {/* Kundalini Concept */}
            <div className="bg-[#FAF5ED] dark:bg-[#2C1810] border border-[#DFCBB5] dark:border-[#5C3A21] rounded-3xl p-4 sm:p-5 shadow-xs space-y-2">
              <div className="flex items-center gap-2 border-b border-[#DFCBB5] dark:border-[#5C3A21]/60 pb-2">
                <span className="p-1.5 bg-[#7A1D1D] text-amber-300 rounded-xl text-base">🌀</span>
                <div>
                  <h2 className="text-base font-bold font-granth text-[#5C3A21] dark:text-[#FFD88A]">
                    {L('कुंडलिनी शक्ति एवं सप्त चक्र विज्ञान', 'Kundalini Shakti & Seven Chakras Science', 'કુંડલિની શક્તિ અને સપ્ત ચક્ર વિજ્ઞાન')}
                  </h2>
                  <p className="text-[11px] text-[#8C6239] dark:text-amber-200/70">
                    {L('मूलाधार से सहस्रार तक चेतना का ऊर्ध्वगमन', 'Ascent of consciousness from Muladhara to Sahasrara', 'મૂલાધારથી સહસ્રાર સુધી ચેતનાનું ઊર્ધ્વગમન')}
                  </p>
                </div>
              </div>
              <p className="text-xs sm:text-[13px] text-[#5C3A21] dark:text-[#E8DCCB] leading-relaxed">
                {kundalini_and_chakras.concept}
              </p>
            </div>

            {/* 7 Chakra Interactive Selector Buttons */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-[#5C3A21] dark:text-[#FFD88A] px-1 block">
                {L('चक्र का चयन करें (मूलाधार से सहस्रार):', 'Select Chakra (Muladhara to Sahasrara):', 'ચક્ર પસંદ કરો (મૂલાધારથી સહસ્રાર):')}
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-7 gap-1.5">
                {kundalini_and_chakras.the_7_stages.map((chk, idx) => {
                  const isSelected = selectedChakraId === chk.id;
                  return (
                    <button
                      key={chk.id}
                      type="button"
                      onClick={() => {
                        triggerHapticSelection();
                        setSelectedChakraId(chk.id);
                      }}
                      className={`p-2 rounded-2xl border text-center transition cursor-pointer flex flex-col items-center justify-center gap-0.5 relative active:scale-95 ${
                        isSelected
                          ? 'ring-2 ring-amber-400 font-black shadow-md'
                          : 'opacity-85 hover:opacity-100 border-[#DFCBB5] dark:border-[#5C3A21]'
                      }`}
                      style={{
                        backgroundColor: isSelected ? chk.colorHex : undefined,
                        color: isSelected ? '#FFFFFF' : undefined,
                      }}
                    >
                      <span className="text-xs font-bold">{idx + 1}. {chk.seedMantra.split(' ')[0]}</span>
                      <span className="text-[10px] truncate max-w-full font-medium">
                        {chk.name.split(' ')[0]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Selected Chakra Detail Card */}
            <div className="bg-[#FAF5ED] dark:bg-[#2C1810] border-2 border-amber-400/60 dark:border-amber-600/60 rounded-3xl p-4 sm:p-5 shadow-lg space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DFCBB5] dark:border-[#5C3A21]/60 pb-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-granth font-black text-xl shadow-md"
                    style={{ backgroundColor: activeChakra.colorHex }}
                  >
                    {activeChakra.seedMantra.split(' ')[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-black font-granth text-[#7A1D1D] dark:text-[#FFD88A]">
                        {activeChakra.sanskritName}
                      </h3>
                      <span className="text-[10px] bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-200 px-2 py-0.5 rounded-full font-bold">
                        {activeChakra.petals} {L('दल (Petals)', 'Petals', 'દળ (Petals)')}
                      </span>
                    </div>
                    <p className="text-xs text-[#8C6239] dark:text-amber-200/80">
                      {L('स्थान:', 'Location:', 'સ્થાન:')} {activeChakra.location} • {L('तत्व:', 'Element:', 'તત્વ:')} {activeChakra.element}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={() =>
                      handleToggleSpeech(
                        activeChakra.id,
                        `${activeChakra.sanskritName}। बीज मंत्र: ${activeChakra.seedMantra}। स्थान: ${activeChakra.location}। तत्व: ${activeChakra.element}। ध्यान विधि: ${activeChakra.meditationInstruction}`
                      )
                    }
                    className="px-3 py-1.5 rounded-xl bg-amber-500 text-stone-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>{L('बीज मंत्र सुनें', 'Listen Beej Mantra', 'બીજ મંત્ર સાંભળો')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleWhatsAppShare(
                        `${activeChakra.name} ${L('जागरण विधि', 'Awakening Method', 'જાગરણ વિધિ')}`,
                        `${L('बीज मंत्र:', 'Beej Mantra:', 'બીજ મંત્ર:')} ${activeChakra.seedMantra}\n${L('स्थान:', 'Location:', 'સ્થાન:')} ${activeChakra.location}\n${L('तत्व:', 'Element:', 'તત્વ:')} ${activeChakra.element}\n\n${L('ध्यान विधि:', 'Meditation:', 'ધ્યાન વિધિ:')} ${activeChakra.meditationInstruction}\n\n${L('जाग्रति के लक्षण:', 'Awakening Signs:', 'જાગૃતિના લક્ષણો:')} ${activeChakra.balancedSigns}`
                      )
                    }
                    className="p-1.5 rounded-xl border border-emerald-500/40 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Grid of properties */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-[#FFFDF9] dark:bg-[#381F14] rounded-2xl border border-[#DFCBB5] dark:border-[#5C3A21]/50 space-y-1">
                  <span className="font-bold text-[#7A1D1D] dark:text-amber-300 block">
                    {L('🎯 आध्यात्मिक प्रभाव व केंद्र:', '🎯 Spiritual Focus & Center:', '🎯 આધ્યાત્મિક પ્રભાવ અને કેન્દ્ર:')}
                  </span>
                  <p className="text-[#5C3A21] dark:text-[#E8DCCB] leading-relaxed">
                    {activeChakra.focus}
                  </p>
                  <p className="text-[11px] text-[#735133] dark:text-[#C5B39B] italic pt-1">
                    {activeChakra.spiritualMeaning}
                  </p>
                </div>

                <div className="p-3 bg-[#FFFDF9] dark:bg-[#381F14] rounded-2xl border border-[#DFCBB5] dark:border-[#5C3A21]/50 space-y-1">
                  <span className="font-bold text-emerald-700 dark:text-emerald-400 block">
                    {L('✨ चक्र संतुलन व जाग्रति के लक्षण:', '✨ Balanced & Awakening Signs:', '✨ ચક્ર સંતુલન અને જાગૃતિના લક્ષણો:')}
                  </span>
                  <p className="text-[#5C3A21] dark:text-[#E8DCCB] leading-relaxed">
                    {activeChakra.balancedSigns}
                  </p>
                </div>
              </div>

              {/* Meditation instructions */}
              <div className="p-3.5 bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-amber-500/10 rounded-2xl border border-amber-400/40 text-xs space-y-1">
                <span className="font-black text-[#8C4A00] dark:text-amber-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{L('दैनिक चक्र ध्यान निर्देश (Daily Chakra Meditation):', 'Daily Chakra Meditation Guide:', 'દૈનિક ચક્ર ધ્યાન નિર્દેશ:')}</span>
                </span>
                <p className="text-[#5C3A21] dark:text-[#FAF2E4] leading-relaxed font-medium">
                  {activeChakra.meditationInstruction}
                </p>
              </div>
            </div>

            {/* Subtle Anatomy: 3 Key Nadis (इड़ा, पिंगला, सुषुम्ना) */}
            <div className="bg-[#FAF5ED] dark:bg-[#2C1810] border border-[#DFCBB5] dark:border-[#5C3A21] rounded-3xl p-4 sm:p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2 border-b border-[#DFCBB5] dark:border-[#5C3A21]/60 pb-2">
                <span className="p-1.5 bg-[#7A1D1D] text-amber-300 rounded-xl text-base">⚡</span>
                <div>
                  <h3 className="text-base font-bold font-granth text-[#5C3A21] dark:text-[#FFD88A]">
                    {L('सूक्ष्म नाड़ी विज्ञान (७२,००० नाड़ियां व ३ प्रमुख स्वर)', 'Subtle Nadi Science (72,000 Nadis & 3 Swaras)', 'સૂક્ષ્મ નાડી વિજ્ઞાન (૭૨,૦૦૦ નાડીઓ અને ૩ સ્વર)')}
                  </h3>
                  <p className="text-[11px] text-[#8C6239] dark:text-amber-200/70">
                    {subtle_anatomy.nadis}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {subtle_anatomy.key_nadis.map((nadi) => (
                  <div
                    key={nadi.id}
                    className="p-3.5 bg-[#FFFDF9] dark:bg-[#381F14] rounded-2xl border border-[#DFCBB5] dark:border-[#5C3A21]/50 flex flex-col justify-between space-y-2 shadow-2xs"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold font-granth text-sm text-[#7A1D1D] dark:text-[#FFD88A]">
                          {nadi.name}
                        </span>
                        <span className="text-[10px] bg-stone-200 dark:bg-stone-800 text-[#5C3A21] dark:text-[#FFD88A] px-2 py-0.5 rounded-full font-bold">
                          {nadi.nostril.split(' ')[0]}
                        </span>
                      </div>
                      <div className="text-[11px] font-bold text-amber-800 dark:text-amber-300 mb-1">
                        {nadi.nature}
                      </div>
                      <p className="text-xs text-[#5C3A21] dark:text-[#D9C4A9] leading-relaxed mb-2">
                        {nadi.principle}
                      </p>
                      <div className="text-[11px] text-[#735133] dark:text-[#C5B39B] leading-snug">
                        <span className="font-semibold">{L('कार्य: ', 'Function: ', 'કાર્ય: ')}</span>{nadi.function}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#DFCBB5] dark:border-[#5C3A21]/50 text-[11px] text-amber-900 dark:text-amber-200 font-medium">
                      <span className="font-bold">{L('संतुलन विधि: ', 'Balancing Method: ', 'સંતુલન વિધિ: ')}</span>{nadi.balancingMethod}
                    </div>
                  </div>
                ))}
              </div>

              {/* Nadi Shodhana Guide Box */}
              <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/30 rounded-2xl border border-emerald-500/30 text-xs text-emerald-900 dark:text-emerald-300 flex items-center gap-2">
                <Wind className="w-5 h-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <p className="leading-relaxed">
                  <strong className="font-bold">{L('नाड़ी शोधन प्राणायाम विधि: ', 'Nadi Shodhana Pranayama Guide: ', 'નાડી શોધન પ્રાણાયામ વિધિ: ')}</strong>
                  {subtle_anatomy.nadi_shodhana_guide}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 5: SCRIPTURES & MISCONCEPTIONS CLEARED */}
        {/* ============================================================== */}
        {activeTab === 'scriptures_myths' && (
          <div className="space-y-4">
            {/* Major Tantric Scriptures */}
            <div className="bg-[#FAF5ED] dark:bg-[#2C1810] border border-[#DFCBB5] dark:border-[#5C3A21] rounded-3xl p-4 sm:p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2 border-b border-[#DFCBB5] dark:border-[#5C3A21]/60 pb-2">
                <span className="p-1.5 bg-[#7A1D1D] text-amber-300 rounded-xl text-base">📚</span>
                <div>
                  <h2 className="text-base font-bold font-granth text-[#5C3A21] dark:text-[#FFD88A]">
                    {L('शिव तंत्र के प्रमुख आधार ग्रन्थ', 'Foundational Scriptures of Shiva Tantra', 'શિવ તંત્રના મુખ્ય આધાર ગ્રંથો')}
                  </h2>
                  <p className="text-[11px] text-[#8C6239] dark:text-amber-200/70">
                    {L('कश्मीर शैव आगम एवं आचार्य अभिनवगुप्त की अमूल्य धरोहर', 'Kashmir Shaiva Agamas & Legacy of Acharya Abhinavagupta', 'કાશ્મીર શૈવ આગમ અને આચાર્ય અભિનવગુપ્તનો વારસો')}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {major_scriptures.map((scr, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-[#FFFDF9] dark:bg-[#381F14] rounded-2xl border border-[#DFCBB5] dark:border-[#5C3A21]/50 space-y-2 shadow-2xs"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <h4 className="text-sm sm:text-base font-black font-granth text-[#7A1D1D] dark:text-[#FFD88A]">
                        {scr.title}
                      </h4>
                      <div className="flex items-center gap-1.5 text-[10px] text-[#8C6239] dark:text-amber-300 font-bold">
                        {scr.author && <span>{L('रचयिता:', 'Author:', 'રચયિતા:')} {scr.author}</span>}
                        {scr.period && <span>• {L('काल:', 'Period:', 'કાળ:')} {scr.period}</span>}
                      </div>
                    </div>

                    <p className="text-xs text-[#5C3A21] dark:text-[#E8DCCB] leading-relaxed">
                      {scr.significance}
                    </p>

                    <div className="pt-2 border-t border-[#DFCBB5] dark:border-[#5C3A21]/40">
                      <span className="text-[11px] font-bold text-[#8C6239] dark:text-amber-300 block mb-1">
                        {L('प्रमुख शिक्षाएं:', 'Key Teachings:', 'મુખ્ય શિક્ષાઓ:')}
                      </span>
                      <ul className="list-disc list-inside space-y-0.5 text-xs text-[#5C3A21] dark:text-[#D9C4A9]">
                        {scr.keyTeachings.map((kt, kIdx) => (
                          <li key={kIdx}>{kt}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Misconceptions Cleared (भ्रांति निवारण एवं सत्य) */}
            <div className="bg-[#FAF5ED] dark:bg-[#2C1810] border border-[#DFCBB5] dark:border-[#5C3A21] rounded-3xl p-4 sm:p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2 border-b border-[#DFCBB5] dark:border-[#5C3A21]/60 pb-2">
                <span className="p-1.5 bg-[#7A1D1D] text-amber-300 rounded-xl text-base">🛡️</span>
                <div>
                  <h3 className="text-base font-bold font-granth text-[#5C3A21] dark:text-[#FFD88A]">
                    {L('तंत्र से जुड़ी भ्रांतियां एवं प्रामाणिक सत्य', 'Tantra Misconceptions & Authentic Truths', 'તંત્ર અંગેની ભ્રાંતિઓ અને પ્રામાણિક સત્ય')}
                  </h3>
                  <p className="text-[11px] text-[#8C6239] dark:text-amber-200/70">
                    {L('काला जादू बनाम आत्म-साक्षात्कार का सर्वोच्च विज्ञान', 'Superstition vs Supreme Science of Self-Realization', 'અંધશ્રદ્ધા વિરુદ્ધ આત્મ-સાક્ષાત્કારનું સર્વોચ્ચ વિજ્ઞાન')}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {misconceptions_cleared.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-[#FFFDF9] dark:bg-[#381F14] rounded-2xl border border-[#DFCBB5] dark:border-[#5C3A21]/50 space-y-2 shadow-2xs"
                  >
                    <div className="flex items-start gap-2 text-xs font-bold text-red-700 dark:text-red-400">
                      <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{item.myth}</span>
                    </div>

                    <div className="pl-6 text-xs text-[#5C3A21] dark:text-[#E8DCCB] leading-relaxed">
                      {item.reality}
                    </div>

                    <div className="pl-6 pt-1 text-[11px] text-amber-800 dark:text-amber-300 font-semibold italic">
                      {L('📜 शास्त्रीय प्रमाण:', '📜 Scriptural Basis:', '📜 શાસ્ત્રીય પ્રમાણ:')} {item.scripturalBasis}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Bottom Consultation & Next Chapter Card */}
        <div className="mt-4 p-4 rounded-3xl bg-gradient-to-r from-[#FAF5ED] to-[#F4E8D1] dark:from-[#341F14] dark:to-[#2A180E] border border-[#DFCBB5] dark:border-[#5C3A21] flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="w-10 h-10 rounded-2xl bg-[#7A1D1D] text-amber-300 flex items-center justify-center font-bold text-lg shrink-0">
              🔱
            </div>
            <div>
              <div className="text-sm font-black font-granth text-[#5C3A21] dark:text-[#FFD88A]">
                {L('शिव तंत्र साधना व प्रश्न विचार', 'Shiva Tantra Sadhana & Guidance', 'શિવ તંત્ર સાધના અને પ્રશ્ન વિચાર')}
              </div>
              <div className="text-xs text-[#8C6239] dark:text-[#D9C4A9]">
                {L(
                  'उमा वैदिक दैवज्ञ से अपनी राशि, लग्न व चक्र अनुसार ध्यान मार्गदर्शन प्राप्त करें',
                  'Receive personalized meditation guidance based on your Rashi, Lagna & Chakras from Uma',
                  'ઉમા વૈદિક દૈવજ્ઞ પાસેથી તમારી રાશિ, લગ્ન અને ચક્ર મુજબ ધ્યાન માર્ગદર્શન મેળવો'
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onPrevChapter && (
              <button
                type="button"
                onClick={onPrevChapter}
                className="px-3 py-2 bg-white dark:bg-stone-800 text-[#5C3A21] dark:text-[#FAF2E4] border border-[#8C6239]/30 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                {L('← पूर्व अध्याय', '← Prev Chapter', '← પૂર્વ અધ્યાય')}
              </button>
            )}

            {onOpenUmaWithQuery && (
              <button
                type="button"
                onClick={() => {
                  triggerHapticSelection();
                  onOpenUmaWithQuery(
                    L(
                      'उमा जी! कृपया मुझे विज्ञान भैरव तंत्र के अनुसार श्वास-प्रश्वास विसर्ग धारणा का अभ्यास दैनिक जीवन में कैसे करना चाहिए, विस्तार से बताएं।',
                      'Uma Ji! Please explain in detail how I should practice the breath-gap Dharana from Vigyan Bhairav Tantra in daily life.',
                      'ઉમા જી! કૃપા કરીને વિજ્ઞાન ભૈરવ તંત્ર મુજબ શ્વાસ-પ્રશ્વાસ વિસર્ગ ધારણાનો અભ્યાસ દૈનિક જીવનમાં કેવી રીતે કરવો તે વિસ્તારથી જણાવો.'
                    )
                  );
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-stone-950 font-black text-xs flex items-center gap-1.5 shadow-md border border-amber-300 transition cursor-pointer active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{L('उमा से पूछें', 'Ask Uma', 'ઉમાને પૂછો')}</span>
              </button>
            )}

            {onNextChapter && (
              <button
                type="button"
                onClick={onNextChapter}
                className="px-3 py-2 bg-[#7A1D1D] text-amber-100 rounded-xl text-xs font-bold transition cursor-pointer shadow-xs"
              >
                {L('अगला अध्याय →', 'Next Chapter →', 'આગળનો અધ્યાય →')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
