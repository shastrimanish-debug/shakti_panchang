import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, RotateCcw, Volume2, VolumeX, Sparkles, CheckCircle2, Award, Flame, Bell, ChevronDown } from 'lucide-react';
import { triggerHapticSelection } from '../utils/haptics';

export interface JapaMalaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface MantraOption {
  id: string;
  name: string;
  mantra: string;
  deity: string;
  meaning: string;
}

const DEFAULT_MANTRAS: MantraOption[] = [
  {
    id: 'gayatri',
    name: 'गायत्री महामंत्र',
    mantra: 'ॐ भूर्भुवः स्वः तत्सवितुर्वरेण्यं भर्गो देवस्य धीमहि धियो यो नः प्रचोदयात् ॥',
    deity: 'सविता (सूर्य देव / माँ गायत्री)',
    meaning: 'हम उस प्राणस्वरूप, दुःखनाशक, सुखस्वरूप, श्रेष्ठ, तेजस्वी, पापनाशक, देवस्वरूप परमात्मा को अंतःकरण में धारण करें, जो हमारी बुद्धि को सन्मार्ग में प्रेरित करे।',
  },
  {
    id: 'mahamrityunjaya',
    name: 'महामृत्युंजय मंत्र',
    mantra: 'ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम्। उर्वारुकमिव बन्धनान्मृत्य pushyीक्षीय माऽमृतात् ॥',
    deity: 'भगवान शिव',
    meaning: 'हम त्रि-नेत्रधारी शिव की आराधना करते हैं जो सुगंधित हैं और सभी प्राणियों का पोषण करते हैं। जैसे पका हुआ खरबूजा बेल से मुक्त होता है, वैसे ही हम मृत्यु से मुक्त होकर अमरता प्राप्त करें।',
  },
  {
    id: 'panchakshara',
    name: 'शिव पंचाक्षर मंत्र',
    mantra: 'ॐ नमः शिवाय',
    deity: 'देवाधिदेव महादेव',
    meaning: 'सर्वकल्याणकारी, मंगलकारी देवाधिदेव भगवान शिव को मेरा बारम्बार प्रणाम।',
  },
  {
    id: 'hare_krishna',
    name: 'हरे कृष्ण महामंत्र',
    mantra: 'हरे कृष्ण हरे कृष्ण कृष्ण कृष्ण हरे हरे। हरे राम हरे राम राम राम हरे हरे॥',
    deity: 'श्री राधा-कृष्ण / श्री सीताराम',
    meaning: 'हे भगवान! हे भगवान की पराशक्ति (हरा)! कृपया मुझे अपनी दिव्य प्रेमामृत सेवा में नियुक्त कीजिए।',
  },
  {
    id: 'om_namo_bhagavate',
    name: 'द्वादशाक्षर वासुदेव मंत्र',
    mantra: 'ॐ नमो भगवते वासुदेवाय',
    deity: 'भगवान श्री विष्णु / श्रीकृष्ण',
    meaning: 'सर्वव्यापक, परम ऐश्वर्यशाली, घट-घट वासी भगवान वासुदेव को मेरा सादर नमन।',
  },
  {
    id: 'ganesh',
    name: 'श्री गणेश बीज मंत्र',
    mantra: 'ॐ गं गणपतये नमः',
    deity: 'प्रथम पूज्य श्री गणेश',
    meaning: 'समस्त विघ्नों के हर्ता और मंगल के दाता भगवान श्री गणेश को कोटिशः नमन।',
  },
  {
    id: 'navarna',
    name: 'माँ दुर्गा नवार्ण मंत्र',
    mantra: 'ॐ ऐं ह्रीं क्लीं चामुण्डायै विच्चे',
    deity: 'माँ महाकाली, महालक्ष्मी, महासरस्वती',
    meaning: 'ज्ञान, समृद्धि और शक्ति की अधिष्ठात्री परमेश्वरी भगवती चामुण्डा मेरी रक्षा करें।',
  },
  {
    id: 'shree_ram',
    name: 'तारक राम मंत्र',
    mantra: 'श्री राम जय राम जय जय राम',
    deity: 'मर्यादा पुरुषोत्तम श्री राम',
    meaning: 'प्रभु श्री राम की विजय हो, सर्वत्र उनके मंगलमय नाम की जयकार हो।',
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

    // Fundamental temple bell frequencies (A4 harmonics)
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
  const [selectedMantra, setSelectedMantra] = useState<MantraOption>(DEFAULT_MANTRAS[0]);
  const [customMantraText, setCustomMantraText] = useState('');
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

  // Load stats from localStorage
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

  // Handle advancing a bead
  const advanceBead = () => {
    triggerHapticSelection();

    const nextBead = currentBead + 1;
    const nextTotal = totalMantrasToday + 1;
    setTotalMantrasToday(nextTotal);

    if (nextBead >= 108) {
      // 108 beads completed!
      if (isSoundEnabled) {
        playTempleChime();
      }
      const nextMalas = completedMalas + 1;
      setCompletedMalas(nextMalas);
      setCurrentBead(0);
      setLastCompletionNotice(`॥ शुभम् ॥ ${nextMalas} माला (१०८ मनके) पूर्ण!`);
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
                १०८ डिजिटल रुद्राक्ष जप माला
              </h3>
              <p className="text-[10px] text-amber-100/80">
                सात्विक साधना • स्पर्श कम्पन (Haptic) • नित्य संकल्प
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
              title={isSoundEnabled ? 'ध्वनि चालू' : 'ध्वनि मूक'}
            >
              {isSoundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="shrink-0 bg-[#FFF8EB] border-b border-[#E2D2BE] px-3 py-2 flex items-center justify-around text-center text-xs">
          <div>
            <div className="text-[10px] font-bold text-[#8C6239] uppercase">माला पूर्ण</div>
            <div className="font-granth font-black text-base text-[#6E1409]">
              {completedMalas} <span className="text-[10px] font-normal text-stone-600">/ {targetMalas}</span>
            </div>
          </div>
          <div className="w-px h-6 bg-[#E2D2BE]" />
          <div>
            <div className="text-[10px] font-bold text-[#8C6239] uppercase">आज कुल जप</div>
            <div className="font-granth font-black text-base text-[#8C4A00]">
              {totalMantrasToday}
            </div>
          </div>
          <div className="w-px h-6 bg-[#E2D2BE]" />
          <div>
            <div className="text-[10px] font-bold text-[#8C6239] uppercase flex items-center justify-center gap-0.5">
              <Flame className="w-3 h-3 text-amber-600" />
              <span>साधना स्ट्रीक</span>
            </div>
            <div className="font-granth font-black text-base text-emerald-800">
              {streakDays} दिन
            </div>
          </div>
        </div>

        {/* Mantra Selector Bar */}
        <div className="shrink-0 bg-[#FFFDF9] border-b border-[#E8DCCB] px-3 py-2 relative">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold text-[#8C6239] shrink-0">जप मंत्र:</span>
            <button
              type="button"
              onClick={() => setIsMantraMenuOpen(!isMantraMenuOpen)}
              className="flex-1 flex items-center justify-between gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#FAF2E4] border border-[#D6B892] text-xs font-bold text-[#4A1805] text-left truncate cursor-pointer hover:bg-[#F4E8D1]"
            >
              <span className="truncate">{selectedMantra.name}</span>
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
                  <span className="font-black">{m.name}</span>
                  <span className="text-[10px] opacity-75 truncate">{m.mantra}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Main Interactive Rosary Body */}
        <div className="flex-1 min-h-0 flex flex-col items-center justify-between p-3 overflow-y-auto space-y-3">
          {/* Active Mantra Sacred Text Box */}
          <div className="w-full bg-[#FFFDF9] border border-amber-300 rounded-2xl p-3 shadow-xs text-center space-y-1.5">
            <div className="text-[10px] font-bold text-amber-800 uppercase tracking-wider flex items-center justify-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-600" />
              <span>{selectedMantra.deity}</span>
            </div>
            <p className="font-granth font-black text-sm sm:text-base text-[#462B17] leading-relaxed">
              {currentMantraText}
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
            {/* Outer Bead Ring Simulation */}
            <div className="absolute inset-2 rounded-full border-4 border-dashed border-[#B56A00]/50 animate-[spin_60s_linear_infinite]" />

            {/* Top Sumeru (Guru) Bead indicator */}
            <div
              className="absolute -top-3 w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-700 border-2 border-yellow-200 shadow-md flex items-center justify-center text-xs font-black text-stone-950"
              title="सुमेरु पर्वत (गुरु मनका)"
            >
              ॐ
            </div>

            {/* Inner Center Display */}
            <div className="text-center space-y-1 z-10">
              <div className="text-[11px] font-bold text-amber-900 uppercase tracking-widest">
                मनका संख्या
              </div>
              <div className="font-granth font-black text-4xl sm:text-5xl text-[#6E1409] tracking-tight tabular-nums">
                {currentBead}
                <span className="text-base text-stone-500 font-normal"> / १०८</span>
              </div>
              <div className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full inline-block">
                {progressPercent}% पूर्ण
              </div>
              <div className="text-[10px] text-stone-600 font-medium pt-1">
                (स्पर्श या क्लिक करके आगे बढ़ें)
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
            <span className="font-bold text-[#5C3A21] text-[11px] shrink-0">जप संकल्प लक्ष्य:</span>
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
                  {t} माला
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
            title="वर्तमान माला ० से पुनः आरम्भ करें"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#8C4A00]" />
            <span>पुनः आरम्भ</span>
          </button>

          <button
            type="button"
            onClick={advanceBead}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 hover:brightness-110 text-white font-granth font-black text-sm flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition active:scale-98"
          >
            <span>📿 जप करें (+1 मनका)</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default JapaMalaModal;
