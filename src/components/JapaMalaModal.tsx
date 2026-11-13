import React, { useState, useEffect, useCallback } from 'react';
import { X, RotateCcw, Volume2, VolumeX, Sparkles, CheckCircle2, Flame, ChevronDown } from 'lucide-react';
import { triggerHapticSelection } from '../utils/haptics';
import { useLanguage } from '../i18n/LanguageContext';

export interface JapaMalaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface MantraOption {
  id: string;
  name: { hi: string; en: string; gu: string };
  mantra: string;
  deity: { hi: string; en: string; gu: string };
  meaning: { hi: string; en: string; gu: string };
}

const DEFAULT_MANTRAS: MantraOption[] = [
  {
    id: 'gayatri',
    name: {
      hi: 'गायत्री महामंत्र',
      en: 'Gayatri Mahamantra',
      gu: 'ગાયત્રી મહામંત્ર',
    },
    mantra: 'ॐ भूर्भुवः स्वः तत्सवितुर्वरेण्यं भर्गो देवस्य धीमहि धियो यो नः प्रचोदयात् ॥',
    deity: {
      hi: 'सविता (सूर्य देव / माँ गायत्री)',
      en: 'Savita (Surya Dev / Maa Gayatri)',
      gu: 'સવિતા (સૂર્ય દેવ / મા ગાયત્રી)',
    },
    meaning: {
      hi: 'हम उस प्राणस्वरूप, दुःखनाशक, सुखस्वरूप, श्रेष्ठ, तेजस्वी, पापनाशक, देवस्वरूप परमात्मा को अंतःकरण में धारण करें, जो हमारी बुद्धि को सन्मार्ग में प्रेरित करे।',
      en: 'We meditate upon the divine effulgence of the Supreme Creator; may He illuminate our intellect onto the righteous path.',
      gu: 'અમે એ પ્રાણસ્વરૂપ, દુઃખનાશક, સુખસ્વરૂપ, શ્રેષ્ઠ, તેજસ્વી પરમાત્માને અંતઃકરણમાં ધારણ કરીએ, જે અમારી બુદ્ધિને સન્માર્ગ તરફ પ્રેરે.',
    },
  },
  {
    id: 'mahamrityunjaya',
    name: {
      hi: 'महामृत्युंजय मंत्र (त्र्यम्बकम्)',
      en: 'Mahamrityunjaya Mantra (Tryambakam)',
      gu: 'મહામૃત્યુંજય મંત્ર (ત્ર્યમ્બકમ્)',
    },
    mantra: 'ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम् । उर्वारुकमिव बन्धनान्मृत्योर्मुक्षीय मामृतात् ॥',
    deity: {
      hi: 'भगवान शिव',
      en: 'Lord Shiva',
      gu: 'ભગવાન શિવ',
    },
    meaning: {
      hi: 'हम त्रि-नेत्रधारी शिव की आराधना करते हैं जो सुगंधित हैं और सभी प्राणियों का पोषण करते हैं। जैसे पका हुआ खरबूजा बेल से मुक्त होता है, वैसे ही हम मृत्यु से मुक्त होकर अमरता प्राप्त करें।',
      en: 'We worship the three-eyed Lord Shiva, fragrant and nourishing all beings. May He liberate us from death to immortality just as a ripe fruit frees itself from the vine.',
      gu: 'અમે ત્રિનેત્રધારી ભગવાન શિવની આરાધના કરીએ છીએ જે સર્વ જીવોનું પોષણ કરે છે. જેમ પાકેલું ફળ વેલાથી મુક્ત થાય છે તેમ અમને મૃત્યુથી મુક્ત કરી અમૃતત્વ પ્રદાન કરો.',
    },
  },
  {
    id: 'mrityunjaya_trahimam',
    name: {
      hi: 'मृत्युंजय महादेव त्राहिमां श्लोक',
      en: 'Mrityunjaya Mahadev Trahimam Shloka',
      gu: 'મૃત્યુંજય મહાદેવ ત્રાહિમાં શ્લોક',
    },
    mantra: 'मृत्युञ्जय महादेव त्राहि मां शरणागतम् । जन्ममृत्युजरारोगैः पीडितं कर्मबन्धनैः ॥',
    deity: {
      hi: 'देवाधिदेव मृत्युंजय महादेव',
      en: 'Devadhidev Mrityunjaya Mahadev',
      gu: 'દેવાધિદેવ મૃત્યુંજય મહાદેવ',
    },
    meaning: {
      hi: 'हे मृत्युंजय महादेव! जन्म, मृत्यु, वृद्धावस्था, रोग और कर्म-बंधनों से पीड़ित मैं आपकी शरण में आया हूँ, कृपया मेरी रक्षा करें और मुझे अभय प्रदान करें।',
      en: 'O Conqueror of Death Mahadev! Afflicted by birth, death, old age, illness, and karmic bonds, I seek Your refuge; please protect me and grant fearlessness.',
      gu: 'હે મૃત્યુંજય મહાદેવ! જન્મ, મૃત્યુ, વૃદ્ધાવસ્થા, રોગ અને કર્મબંધનોથી પીડિત હું આપના શરણે આવ્યો છું, કૃપા કરી મારી રક્ષા કરો.',
    },
  },
  {
    id: 'panchakshara',
    name: {
      hi: 'शिव पंचाक्षर मंत्र',
      en: 'Shiva Panchakshara Mantra',
      gu: 'શિવ પંચાક્ષર મંત્ર',
    },
    mantra: 'ॐ नमः शिवाय',
    deity: {
      hi: 'देवाधिदेव महादेव',
      en: 'Lord Mahadev (Shiva)',
      gu: 'દેવાધિદેવ મહાદેવ',
    },
    meaning: {
      hi: 'सर्वकल्याणकारी, मंगलकारी देवाधिदेव भगवान शिव को मेरा बारम्बार प्रणाम।',
      en: 'Repeated salutations to the all-auspicious Supreme Lord Shiva.',
      gu: 'સર્વકલ્યાણકારી, મંગળકારી દેવાધિદેવ ભગવાન શિવને મારા વારંવાર પ્રણામ.',
    },
  },
  {
    id: 'hare_krishna',
    name: {
      hi: 'हरे कृष्ण महामंत्र',
      en: 'Hare Krishna Mahamantra',
      gu: 'હરે કૃષ્ણ મહામંત્ર',
    },
    mantra: 'हरे कृष्ण हरे कृष्ण कृष्ण कृष्ण हरे हरे। हरे राम हरे राम राम राम हरे हरे॥',
    deity: {
      hi: 'श्री राधा-कृष्ण / श्री सीताराम',
      en: 'Shri Radha-Krishna / Shri Sitaram',
      gu: 'શ્રી રાધા-કૃષ્ણ / શ્રી સીતારામ',
    },
    meaning: {
      hi: 'हे भगवान! हे भगवान की पराशक्ति (हरा)! कृपया मुझे अपनी दिव्य प्रेमामृत सेवा में नियुक्त कीजिए।',
      en: 'O Supreme Lord and Divine Energy (Hara)! Please engage me in Your blissful devotional service.',
      gu: 'હે ભગવાન અને દિવ્ય શક્તિ (હરા)! કૃપા કરી મને આપની દિવ્ય પ્રેમમય સેવામાં જોડો.',
    },
  },
  {
    id: 'om_namo_bhagavate',
    name: {
      hi: 'द्वादशाक्षर वासुदेव मंत्र',
      en: 'Dwadashakshara Vasudeva Mantra',
      gu: 'દ્વાદશાક્ષર વાસુદેવ મંત્ર',
    },
    mantra: 'ॐ नमो भगवते वासुदेवाय',
    deity: {
      hi: 'भगवान श्री विष्णु / श्रीकृष्ण',
      en: 'Lord Shri Vishnu / Shri Krishna',
      gu: 'ભગવાન શ્રી વિષ્ણુ / શ્રીકૃષ્ણ',
    },
    meaning: {
      hi: 'सर्वव्यापक, परम ऐश्वर्यशाली, घट-घट वासी भगवान वासुदेव को मेरा सादर नमन।',
      en: 'Humble salutations to the all-pervading Supreme Lord Vasudeva dwelling in every heart.',
      gu: 'સર્વવ્યાપક, પરમ ઐશ્વર્યશાળી, ઘટ-ઘટ વાસી ભગવાન વાસુદેવને મારા સાદર નમન.',
    },
  },
  {
    id: 'ganesh',
    name: {
      hi: 'श्री गणेश बीज मंत्र',
      en: 'Shri Ganesh Beej Mantra',
      gu: 'શ્રી ગણેશ બીજ મંત્ર',
    },
    mantra: 'ॐ गं गणपतये नमः',
    deity: {
      hi: 'प्रथम पूज्य श्री गणेश',
      en: 'Lord Shri Ganesha',
      gu: 'પ્રથમ પૂજ્ય શ્રી ગણેશ',
    },
    meaning: {
      hi: 'समस्त विघ्नों के हर्ता और मंगल के दाता भगवान श्री गणेश को कोटिशः नमन।',
      en: 'Millions of salutations to Lord Shri Ganesha, remover of obstacles and bestower of auspiciousness.',
      gu: 'સર્વ વિઘ્નોના હર્તા અને મંગળના દાતા ભગવાન શ્રી ગણેશને કોટિ-કોટિ વંદન.',
    },
  },
  {
    id: 'navarna',
    name: {
      hi: 'माँ दुर्गा नवार्ण मंत्र',
      en: 'Maa Durga Navarna Mantra',
      gu: 'મા દુર્ગા નવાર્ણ મંત્ર',
    },
    mantra: 'ॐ ऐं ह्रीं क्लीं चामुण्डायै विच्चे',
    deity: {
      hi: 'माँ महाकाली, महालक्ष्मी, महासरस्वती',
      en: 'Maa Mahakali, Mahalakshmi, Mahasaraswati',
      gu: 'મા મહાકાળી, મહાલક્ષ્મી, મહાસરસ્વતી',
    },
    meaning: {
      hi: 'ज्ञान, समृद्धि और शक्ति की अधिष्ठात्री परमेश्वरी भगवती चामुण्डा मेरी रक्षा करें।',
      en: 'May Goddess Chamunda—embodiment of wisdom, prosperity, and divine power—protect me.',
      gu: 'જ્ઞાન, સમૃદ્ધિ અને શક્તિની અધિષ્ઠાત્રી પરમેશ્વરી ભગવતી ચામુંડા મારી રક્ષા કરે.',
    },
  },
  {
    id: 'shree_ram',
    name: {
      hi: 'तारक राम मंत्र',
      en: 'Tarak Ram Mantra',
      gu: 'તારક રામ મંત્ર',
    },
    mantra: 'श्री राम जय राम जय जय राम',
    deity: {
      hi: 'मर्यादा पुरुषोत्तम श्री राम',
      en: 'Lord Shri Ram',
      gu: 'મર્યાદા પુરુષોત્તમ શ્રી રામ',
    },
    meaning: {
      hi: 'प्रभु श्री राम की विजय हो, सर्वत्र उनके मंगलमय नाम की जयकार हो।',
      en: 'Victory to Lord Shri Ram; may His auspicious holy name resonate everywhere.',
      gu: 'પ્રભુ શ્રી રામનો વિજય થાઓ, સર્વત્ર તેમના મંગળમય નામનો જયજયકાર થાઓ.',
    },
  },
];

const STORAGE_KEY_JAPA = 'shakti_panchang_japa_stats_v1';

// Web Audio API pure synthesized Tibetan Temple Bell chime
function playTempleChime() {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const freqs = [440, 880, 1320, 1760];
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = idx === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.25 / (idx + 1), now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 2.6);
    });
  } catch {
    // Ignore audio context errors if blocked by browser policy
  }
}

export const JapaMalaModal: React.FC<JapaMalaModalProps> = ({ isOpen, onClose }) => {
  const { language } = useLanguage();
  const cLang = (language || 'hi').slice(0, 2).toLowerCase();
  const pickL = <T,>(hi: T, en: T, gu: T): T => (cLang === 'en' ? en : cLang === 'gu' ? gu : hi);
  const pickLocObj = (obj: { hi: string; en: string; gu: string }) =>
    cLang === 'en' ? obj.en : cLang === 'gu' ? obj.gu : obj.hi;

  const [selectedMantra, setSelectedMantra] = useState<MantraOption>(DEFAULT_MANTRAS[0]);
  const [customMantraText] = useState('');
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [isMantraMenuOpen, setIsMantraMenuOpen] = useState(false);

  // Bead states (1 to 108)
  const [currentBead, setCurrentBead] = useState<number>(0);
  const [completedMalas, setCompletedMalas] = useState<number>(0);
  const [totalMantrasToday, setTotalMantrasToday] = useState<number>(0);
  const [targetMalas, setTargetMalas] = useState<number>(1);
  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(true);
  const [lastCompletionNotice, setLastCompletionNotice] = useState<string | null>(null);

  // Daily Streak
  const [streakDays, setStreakDays] = useState<number>(1);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_JAPA);
      if (saved) {
        const parsed = JSON.parse(saved);
        const todayStr = new Date().toISOString().split('T')[0];
        if (parsed.lastDate === todayStr) {
          setTotalMantrasToday(parsed.todayMantras || 0);
          setCompletedMalas(parsed.todayMalas || 0);
        } else {
          setTotalMantrasToday(0);
          setCompletedMalas(0);
        }
        setStreakDays(parsed.streak || 1);
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  const saveStats = useCallback((newMalas: number, newMantras: number) => {
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const payload = {
        lastDate: todayStr,
        todayMantras: newMantras,
        todayMalas: newMalas,
        streak: streakDays,
      };
      localStorage.setItem(STORAGE_KEY_JAPA, JSON.stringify(payload));
    } catch {
      // Ignore storage errors
    }
  }, [streakDays]);

  const advanceBead = () => {
    triggerHapticSelection();

    const nextBead = currentBead + 1;
    const nextTotal = totalMantrasToday + 1;
    setTotalMantrasToday(nextTotal);

    if (nextBead >= 108) {
      if (isSoundEnabled) {
        playTempleChime();
      }
      const nextMalas = completedMalas + 1;
      setCompletedMalas(nextMalas);
      setCurrentBead(0);
      setLastCompletionNotice(
        pickL(
          `॥ शुभम् ॥ ${nextMalas} माला (१०८ मनके) पूर्ण!`,
          `Shubham! ${nextMalas} Mala (108 Beads) Completed!`,
          `॥ શુભમ્ ॥ ${nextMalas} માળા (૧૦૮ મણકા) પૂર્ણ!`
        )
      );
      saveStats(nextMalas, nextTotal);
      setTimeout(() => setLastCompletionNotice(null), 3000);
    } else {
      setCurrentBead(nextBead);
      saveStats(completedMalas, nextTotal);
    }
  };

  const resetCurrentMala = () => {
    triggerHapticSelection();
    setCurrentBead(0);
  };

  if (!isOpen) return null;

  const currentMantraText = isCustomMode && customMantraText.trim()
    ? customMantraText.trim()
    : selectedMantra.mantra;

  const progressPercent = Math.round((currentBead / 108) * 100);

  return (
    <div
      className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 select-none animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md h-full max-h-[94dvh] bg-[#FAF3E3] text-[#1F1006] rounded-3xl border-2 border-amber-700 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="shrink-0 p-3 bg-gradient-to-r from-[#6E1409] via-[#8B1E1E] to-[#6E1409] text-white flex items-center justify-between border-b border-amber-500/40">
          <div className="flex items-center gap-2">
            <span className="text-xl">📿</span>
            <div>
              <h3 className="font-granth font-black text-sm sm:text-base text-amber-200 leading-tight">
                {pickL('१०८ डिजिटल रुद्राक्ष जप माला', '108 Digital Rudraksha Japa Mala', '૧૦૮ ડિજિટલ રુદ્રાક્ષ જપ માળા')}
              </h3>
              <p className="text-[10px] text-amber-100/80">
                {pickL(
                  'सात्विक साधना • स्पर्श कम्पन (Haptic) • नित्य संकल्प',
                  'Sattvik Sadhana • Haptic Touch • Daily Sankalpa',
                  'સાત્વિક સાધના • સ્પર્શ કંપન (Haptic) • નિત્ય સંકલ્પ'
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsSoundEnabled(!isSoundEnabled)}
              className={`p-1.5 rounded-xl border transition cursor-pointer ${
                isSoundEnabled
                  ? 'bg-amber-400 text-stone-950 border-amber-300'
                  : 'bg-white/10 text-amber-200 border-white/20'
              }`}
              title={isSoundEnabled ? pickL('ध्वनि चालू', 'Sound On', 'ધ્વનિ ચાલુ') : pickL('ध्वनि मूक', 'Sound Muted', 'ધ્વનિ બંધ')}
            >
              {isSoundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              aria-label={pickL('बंद करें', 'Close', 'બંધ કરો')}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="shrink-0 bg-[#FFF8EB] border-b border-[#E2D2BE] px-3 py-2 flex items-center justify-around text-center text-xs">
          <div>
            <div className="text-[10px] font-bold text-[#8C6239] uppercase">
              {pickL('माला पूर्ण', 'Malas Done', 'માળા પૂર્ણ')}
            </div>
            <div className="font-granth font-black text-base text-[#6E1409]">
              {completedMalas} <span className="text-[10px] font-normal text-stone-600">/ {targetMalas}</span>
            </div>
          </div>
          <div className="w-px h-6 bg-[#E2D2BE]" />
          <div>
            <div className="text-[10px] font-bold text-[#8C6239] uppercase">
              {pickL('आज कुल जप', "Today's Japa", 'આજનો કુલ જપ')}
            </div>
            <div className="font-granth font-black text-base text-[#8C4A00]">
              {totalMantrasToday}
            </div>
          </div>
          <div className="w-px h-6 bg-[#E2D2BE]" />
          <div>
            <div className="text-[10px] font-bold text-[#8C6239] uppercase flex items-center justify-center gap-0.5">
              <Flame className="w-3 h-3 text-amber-600" />
              <span>{pickL('साधना स्ट्रीक', 'Sadhana Streak', 'સાધના સ્ટ્રીક')}</span>
            </div>
            <div className="font-granth font-black text-base text-emerald-800">
              {streakDays} {pickL('दिन', 'Days', 'દિવસ')}
            </div>
          </div>
        </div>

        {/* Mantra Selector Bar */}
        <div className="shrink-0 bg-[#FFFDF9] border-b border-[#E8DCCB] px-3 py-2 relative">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold text-[#8C6239] shrink-0">
              {pickL('जप मंत्र:', 'Chant Mantra:', 'જપ મંત્ર:')}
            </span>
            <button
              type="button"
              onClick={() => setIsMantraMenuOpen(!isMantraMenuOpen)}
              className="flex-1 flex items-center justify-between gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#FAF2E4] border border-[#D6B892] text-xs font-bold text-[#4A1805] text-left truncate cursor-pointer hover:bg-[#F4E8D1]"
            >
              <span className="truncate">{pickLocObj(selectedMantra.name)}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-amber-800 transition ${isMantraMenuOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Mantra Dropdown */}
          {isMantraMenuOpen && (
            <div className="absolute left-3 right-3 top-full mt-1 z-30 bg-[#FFFDF9] border-2 border-amber-600 rounded-2xl shadow-xl max-h-56 overflow-y-auto p-1.5 space-y-1 animate-in fade-in duration-150">
              {DEFAULT_MANTRAS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    setSelectedMantra(m);
                    setIsCustomMode(false);
                    setIsMantraMenuOpen(false);
                    triggerHapticSelection();
                  }}
                  className={`w-full text-left p-2 rounded-xl text-xs transition cursor-pointer flex flex-col ${
                    selectedMantra.id === m.id && !isCustomMode
                      ? 'bg-[#5C3A21] text-amber-100 font-bold'
                      : 'hover:bg-amber-100 text-[#3E2714]'
                  }`}
                >
                  <span className="font-black">{pickLocObj(m.name)}</span>
                  <span className="text-[10px] opacity-75 truncate">{m.mantra}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Main Interactive Rosary Body */}
        <div className="flex-1 min-h-0 flex flex-col items-center justify-between p-3 overflow-y-auto space-y-3">
          {/* Active Mantra Sacred Text Box (Mantra remains sacred Devanagari) */}
          <div className="w-full bg-[#FFFDF9] border border-amber-300 rounded-2xl p-3 shadow-xs text-center space-y-1.5">
            <div className="text-[10px] font-bold text-amber-800 uppercase tracking-wider flex items-center justify-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-600" />
              <span>{pickLocObj(selectedMantra.deity)}</span>
            </div>
            <p className="font-granth font-black text-sm sm:text-base text-[#462B17] leading-relaxed">
              {currentMantraText}
            </p>
            <p className="text-[10.5px] text-[#6B421B] leading-snug">
              {pickLocObj(selectedMantra.meaning)}
            </p>
          </div>

          {/* Interactive Sacred Rudraksha Bead Ring */}
          <div
            onClick={advanceBead}
            className="relative w-56 h-56 sm:w-64 sm:h-64 rounded-full flex items-center justify-center cursor-pointer select-none group transition-transform active:scale-95"
            style={{
              background: 'radial-gradient(circle, #FFF6E5 40%, #EADBCC 85%, #8C6239 100%)',
              boxShadow: '0 10px 30px rgba(110, 20, 9, 0.25), inset 0 2px 10px rgba(255, 255, 255, 0.8)',
            }}
          >
            <div className="absolute inset-2 rounded-full border-4 border-dashed border-[#B56A00]/50 animate-[spin_60s_linear_infinite]" />

            <div
              className="absolute -top-3 w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-700 border-2 border-yellow-200 shadow-md flex items-center justify-center text-xs font-black text-stone-950"
              title={pickL('सुमेरु पर्वत (गुरु मनका)', 'Sumeru Mount (Guru Bead)', 'સુમેરુ પર્વત (ગુરુ મણકો)')}
            >
              ॐ
            </div>

            <div className="text-center space-y-1 z-10">
              <div className="text-[11px] font-bold text-amber-900 uppercase tracking-widest">
                {pickL('मनका संख्या', 'Bead Count', 'મણકા સંખ્યા')}
              </div>
              <div className="font-granth font-black text-4xl sm:text-5xl text-[#6E1409] tracking-tight tabular-nums">
                {currentBead}
                <span className="text-base text-stone-500 font-normal">
                  {pickL(' / १०८', ' / 108', ' / ૧૦૮')}
                </span>
              </div>
              <div className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full inline-block">
                {progressPercent}% {pickL('पूर्ण', 'Complete', 'પૂર્ણ')}
              </div>
              <div className="text-[10px] text-stone-600 font-medium pt-1">
                {pickL('(स्पर्श या क्लिक करके आगे बढ़ें)', '(Tap or click to advance)', '(સ્પર્શ કે ક્લિક કરી આગળ વધો)')}
              </div>
            </div>
          </div>

          {/* Completion Toast Banner */}
          {lastCompletionNotice && (
            <div className="w-full bg-emerald-600 text-white p-2.5 rounded-xl shadow-lg text-center text-xs font-bold animate-in zoom-in-95 duration-200 flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-amber-300" />
              <span>{lastCompletionNotice}</span>
            </div>
          )}

          {/* Target Mala Selector */}
          <div className="w-full bg-[#FFF8EB] border border-[#E2D2BE] rounded-2xl p-2.5 flex items-center justify-between gap-2 text-xs">
            <span className="font-bold text-[#5C3A21] text-[11px] shrink-0">
              {pickL('जप संकल्प लक्ष्य:', 'Target Malas:', 'જપ સંકલ્પ લક્ષ્ય:')}
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {[1, 3, 5, 11, 21, 108].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    setTargetMalas(t);
                    triggerHapticSelection();
                  }}
                  className={`px-2 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    targetMalas === t
                      ? 'bg-[#6E1409] text-white shadow-xs'
                      : 'bg-white border border-[#D6B892] text-[#4A1805] hover:bg-amber-100'
                  }`}
                >
                  {t} {pickL('माला', t === 1 ? 'Mala' : 'Malas', 'માળા')}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="shrink-0 p-3 bg-[#FFFDF9] border-t border-[#E8DCCB] flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={resetCurrentMala}
            className="px-3 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-[#5C3A21] border border-amber-300 text-xs font-bold flex items-center gap-1 cursor-pointer transition"
            title={pickL('वर्तमान माला ० से पुनः आरम्भ करें', 'Reset current mala to 0', 'વર્તમાન માળા ૦ થી ફરી શરૂ કરો')}
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#8C4A00]" />
            <span>{pickL('पुनः आरम्भ', 'Reset', 'ફરી શરૂ')}</span>
          </button>

          <button
            type="button"
            onClick={advanceBead}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 hover:brightness-110 text-white font-granth font-black text-sm flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition active:scale-98"
          >
            <span>{pickL('📿 जप करें (+1 मनका)', '📿 Chant (+1 Bead)', '📿 જપ કરો (+1 મણકો)')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default JapaMalaModal;
