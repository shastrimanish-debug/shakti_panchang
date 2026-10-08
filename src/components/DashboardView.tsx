import React, { useState } from 'react';
import { VedicPanchangData, SavedLocation } from '../types';
import {
  Sun,
  Sunset,
  Sparkles,
  Calendar,
  BookOpen,
  Clock,
  Compass,
  Shield,
  ArrowRight,
  Award,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Share2,
  Volume2,
  VolumeX,
  Zap,
  Star,
  Moon,
  Flame,
  FileText,
  RotateCcw,
  Sparkle,
} from 'lucide-react';
import { getDayChoghadiya, getCurrentChoghadiya, getAuspiciousWindows, getInauspiciousWindows } from '../services/choghadiya';
import { calculateSpecialYogas, calculatePanchakAndBhadra } from '../services/horaPanchakYogas';
import { getDailyShloka, getLocalizedDailyShloka } from '../constants/shlokas';
import { useLanguage } from '../i18n';
import { trVedic } from '../i18n/vedicTranslate';

export interface DashboardViewProps {
  panchang: VedicPanchangData | null;
  currentLocation: SavedLocation;
  currentDate?: Date;
  onDateChange?: (d: Date) => void;
  onNavigateTab: (tabId: string) => void;
  onOpenUma: (initialQuery?: string) => void;
  onOpenConnect: () => void;
  onOpenLocationModal?: () => void;
  onOpenWhatsAppPanchang?: () => void;
  onToggleStoryMode?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  panchang,
  currentLocation,
  currentDate = new Date(),
  onDateChange,
  onNavigateTab,
  onOpenUma,
  onOpenConnect,
  onOpenLocationModal,
  onOpenWhatsAppPanchang,
  onToggleStoryMode,
}) => {
  const { language } = useLanguage();
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Dynamic calculations
  const activeDate = panchang ? panchang.date : currentDate;
  const weekdayNum = activeDate.getDay();

  const dayChoghadiyas = panchang ? getDayChoghadiya(panchang.solar, weekdayNum) : [];
  const { current: currentChoghadiya, remainingMinutes } = getCurrentChoghadiya(dayChoghadiyas);

  const auspiciousWindows = panchang ? getAuspiciousWindows(panchang.solar) : [];
  const inauspiciousWindows = panchang ? getInauspiciousWindows(panchang.solar, weekdayNum) : [];

  const abhijitWindow = auspiciousWindows.find((w) => w.title === 'अभिजित मुहूर्त');
  const rahuWindow = inauspiciousWindows.find((w) => w.title === 'राहु काल');

  const specialYogas = panchang ? calculateSpecialYogas(panchang) : [];
  const { panchak, bhadra } = panchang
    ? calculatePanchakAndBhadra(panchang)
    : {
        panchak: { isActive: false, type: '', typeNameHindi: '', nature: 'moderate' as const, rashi: '', nakshatra: '', description: '', remedy: '', forbiddenActs: [] },
        bhadra: { isActive: false, vas: 'अनुपस्थित' as const, vasEnglish: 'none' as const, nature: 'shubh' as const, impactDescription: '', guidance: '' },
      };

  const formatT = (d: Date) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const sunriseStr = panchang ? formatT(panchang.solar.sunrise) : "06:15 AM";
  const sunsetStr = panchang ? formatT(panchang.solar.sunset) : "06:30 PM";

  const weekdayName = panchang ? trVedic(panchang.weekday) : "सोमवार";
  const pakshaName = panchang ? trVedic(panchang.paksha) : "कृष्ण";
  const tithiName = panchang ? trVedic(panchang.tithi) : "दशमी";
  const nakshatraName = panchang ? trVedic(panchang.nakshatra) : "पुष्य";
  const yogaName = panchang ? trVedic(panchang.yoga) : "शुभ";
  const karanaName = panchang ? trVedic(panchang.karana) : "बव";
  const masaName = panchang ? trVedic(panchang.masa) : "कार्तिक";
  const samvatName = panchang ? panchang.samvat : "२०८३";

  const baseShloka = getDailyShloka(activeDate);
  const dailyShloka = getLocalizedDailyShloka(baseShloka, language);

  // Date Navigation Handlers
  const handlePrevDay = () => {
    if (onDateChange) {
      const prev = new Date(activeDate);
      prev.setDate(prev.getDate() - 1);
      onDateChange(prev);
    }
  };

  const handleNextDay = () => {
    if (onDateChange) {
      const next = new Date(activeDate);
      next.setDate(next.getDate() + 1);
      onDateChange(next);
    }
  };

  const handleTodayReset = () => {
    if (onDateChange) {
      onDateChange(new Date());
    }
  };

  const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.valueAsDate && onDateChange) {
      onDateChange(e.target.valueAsDate);
    }
  };

  const toggleSpeech = () => {
    if (isPlayingAudio) {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
    } else {
      if ('speechSynthesis' in window) {
        const textToSpeak = `${dailyShloka.sanskrit}. ${dailyShloka.meaning}`;
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.lang = language === 'en' ? 'en-IN' : 'hi-IN';
        utterance.rate = 0.9;
        utterance.onend = () => setIsPlayingAudio(false);
        utterance.onerror = () => setIsPlayingAudio(false);
        window.speechSynthesis.speak(utterance);
        setIsPlayingAudio(true);
      }
    }
  };

  // Date locale format
  const dateLocale = language === 'en' ? 'en-US' : language === 'gu' ? 'gu-IN' : 'hi-IN';
  const formattedFullDate = activeDate.toLocaleDateString(dateLocale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-5 py-4 space-y-4 animate-in fade-in duration-300 pb-28 select-none">
      
      {/* ========================================================= */}
      {/* 1. iOS BENTO CONTAINER: CONTROL BAR & LOCATION HEADER    */}
      {/* ========================================================= */}
      <div className="bg-white/80 dark:bg-[#1E110A]/80 backdrop-blur-2xl rounded-3xl p-3 sm:p-4 border border-amber-500/20 shadow-lg flex flex-wrap items-center justify-between gap-3">
        {/* Left: Location & Today Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenLocationModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-amber-50 dark:bg-stone-900 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs font-black hover:bg-amber-100 transition shadow-xs"
            title="स्थान परिवर्तन करें"
          >
            <MapPin className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
            <span className="truncate max-w-[110px] sm:max-w-[160px]">{currentLocation.name}</span>
          </button>

          <button
            onClick={handleTodayReset}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 text-xs font-black hover:brightness-110 transition shadow-xs"
          >
            <RotateCcw className="w-3 h-3" />
            <span>आज</span>
          </button>
        </div>

        {/* Center: Dynamic Date Controller */}
        <div className="flex items-center gap-1 bg-amber-100/60 dark:bg-stone-900/60 p-1 rounded-2xl border border-amber-500/20">
          <button
            onClick={handlePrevDay}
            className="p-1.5 rounded-xl hover:bg-amber-200/60 dark:hover:bg-stone-800 text-amber-900 dark:text-amber-200 transition"
            title="पिछला दिन"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="relative flex items-center px-2">
            <span className="text-xs font-black text-[#5C3A21] dark:text-amber-200">
              {formattedFullDate}
            </span>
            <input
              type="date"
              value={activeDate.toISOString().split('T')[0]}
              onChange={handleDateInputChange}
              className="absolute inset-0 opacity-0 cursor-pointer w-full"
            />
          </div>

          <button
            onClick={handleNextDay}
            className="p-1.5 rounded-xl hover:bg-amber-200/60 dark:hover:bg-stone-800 text-amber-900 dark:text-amber-200 transition"
            title="अगला दिन"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Right: Quick Action Pill */}
        <div className="flex items-center gap-2">
          {onToggleStoryMode && (
            <button
              onClick={onToggleStoryMode}
              className="px-3 py-1.5 rounded-2xl bg-amber-100 hover:bg-amber-200 text-amber-900 dark:bg-stone-800 dark:hover:bg-stone-700 dark:text-amber-200 text-xs font-black flex items-center gap-1.5 shadow-xs transition border border-amber-500/30"
              title="ग्रन्थ स्टोरी रूप देखें"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span className="hidden sm:inline">स्टोरी ग्रन्थ</span>
            </button>
          )}

          {onOpenWhatsAppPanchang && (
            <button
              onClick={onOpenWhatsAppPanchang}
              className="px-3 py-1.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-1.5 shadow-sm transition"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">सुप्रभात पंचांग</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. MAIN BENTO BOX GRID                                   */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4">
        
        {/* HERO BENTO TILE: MAIN AUSPICIOUS VEDIC SUMMARY (SPAN 2) */}
        <div className="md:col-span-2 lg:col-span-2 relative overflow-hidden bg-gradient-to-br from-[#4A2612] via-[#633418] to-[#2B1408] rounded-3xl p-5 sm:p-6 text-[#FAF2E4] shadow-xl border border-amber-500/40 flex flex-col justify-between">
          <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none">
            <Sparkles className="w-56 h-56 text-amber-300" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-black uppercase tracking-widest border border-amber-400/30">
                ॥ श्री गणेशाय नमः ॥
              </span>
              <span className="text-xs font-bold text-amber-200/80">
                विक्रम संवत् {samvatName}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black font-granth text-amber-100 tracking-wide mt-1">
              {weekdayName}, {pakshaName} पक्ष
            </h1>
            <p className="text-base font-bold text-amber-200 mt-1 flex items-center gap-2">
              <span>{tithiName}</span>
              <span className="text-amber-400/60">•</span>
              <span>{nakshatraName} नक्षत्र</span>
            </p>

            {/* Sub details chips */}
            <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs text-amber-200/90 font-medium">
              <span className="px-2 py-0.5 rounded-xl bg-white/10 backdrop-blur-md border border-amber-500/20">
                मास: {masaName}
              </span>
              <span className="px-2 py-0.5 rounded-xl bg-white/10 backdrop-blur-md border border-amber-500/20">
                योग: {yogaName}
              </span>
              <span className="px-2 py-0.5 rounded-xl bg-white/10 backdrop-blur-md border border-amber-500/20">
                करण: {karanaName}
              </span>
            </div>
          </div>

          {/* Direct Guidance CTA */}
          <div className="mt-5 pt-4 border-t border-amber-500/20 flex flex-wrap items-center justify-between gap-2">
            <button
              onClick={() => onOpenUma()}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-stone-950 font-black text-xs shadow-lg hover:brightness-110 transition flex items-center gap-2 m3-touch"
            >
              <Sparkles className="w-4 h-4 fill-stone-950" />
              <span>उमा AI से आज का मार्गदर्शन लें</span>
            </button>
            <button
              onClick={onOpenConnect}
              className="px-3.5 py-2.5 rounded-2xl bg-white/10 backdrop-blur-md text-amber-200 hover:bg-white/20 transition font-bold text-xs border border-amber-500/30 flex items-center gap-1.5"
            >
              <Award className="w-4 h-4 text-amber-300" />
              <span>आचार्य जी से बात करें</span>
            </button>
          </div>
        </div>

        {/* BENTO TILE: LIVE CHOGHADIYA STATUS */}
        <div className="bg-white/85 dark:bg-[#25130A]/85 backdrop-blur-xl rounded-3xl p-5 border border-amber-500/30 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-amber-800 dark:text-amber-300 mb-3">
              <span className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-600" /> वर्तमान चौघड़िया
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-yellow-500/5 to-amber-500/15 border border-amber-500/30 text-center relative">
              <p className="text-xl font-black font-granth text-[#4A2612] dark:text-amber-100">
                {currentChoghadiya ? currentChoghadiya.hindiName : "शुभ चौघड़िया"}
              </p>
              <p className="text-xs font-black text-amber-700 dark:text-amber-300 mt-1">
                {currentChoghadiya ? `${remainingMinutes} मिनट शेष` : "शुभ समय प्रभावी"}
              </p>
              {currentChoghadiya && (
                <p className="text-[10px] text-stone-500 dark:text-stone-400 mt-1">
                  प्रकार: {currentChoghadiya.nature.toUpperCase()} ({formatT(currentChoghadiya.start)} - {formatT(currentChoghadiya.end)})
                </p>
              )}
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('choghadiya')}
            className="mt-4 pt-3 border-t border-amber-500/15 text-xs font-black text-amber-800 dark:text-amber-300 flex items-center justify-between hover:underline group"
          >
            <span>सम्पूर्ण चौघड़िया चक्र देखें</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* BENTO TILE: SUN & MOON ASTRONOMY */}
        <div className="bg-white/85 dark:bg-[#25130A]/85 backdrop-blur-xl rounded-3xl p-5 border border-amber-500/30 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-amber-800 dark:text-amber-300 mb-3">
              <span className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                <Sun className="w-4 h-4 text-amber-500" /> सूर्य व चन्द्र स्थिति
              </span>
              <Moon className="w-4 h-4 text-indigo-400" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between p-2.5 rounded-2xl bg-amber-50/70 dark:bg-stone-900/70 border border-amber-500/10">
                <span className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                  <Sun className="w-3.5 h-3.5 text-amber-500" /> सूर्योदय
                </span>
                <span className="text-xs font-black text-[#4A2612] dark:text-amber-200">{sunriseStr}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-2xl bg-amber-50/70 dark:bg-stone-900/70 border border-amber-500/10">
                <span className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                  <Sunset className="w-3.5 h-3.5 text-orange-500" /> सूर्यास्त
                </span>
                <span className="text-xs font-black text-[#4A2612] dark:text-amber-200">{sunsetStr}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('panchang')}
            className="mt-4 pt-3 border-t border-amber-500/15 text-xs font-black text-amber-800 dark:text-amber-300 flex items-center justify-between hover:underline group"
          >
            <span>पूर्ण पंचांग विवरण</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* BENTO TILE: ABHIJIT MUHURAT & RAHU KAAL */}
        <div className="bg-white/85 dark:bg-[#25130A]/85 backdrop-blur-xl rounded-3xl p-5 border border-amber-500/30 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-amber-800 dark:text-amber-300 mb-3">
              <span className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                <Sparkle className="w-4 h-4 text-emerald-500" /> मुहूर्त व राहूकाल
              </span>
              <Shield className="w-4 h-4 text-amber-600" />
            </div>

            <div className="space-y-2">
              <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-black text-emerald-800 dark:text-emerald-300">
                    ✨ अभिजित मुहूर्त (अति शुभ)
                  </p>
                  <p className="text-xs font-bold text-emerald-900 dark:text-emerald-200 mt-0.5">
                    {abhijitWindow ? `${formatT(abhijitWindow.start)} - ${formatT(abhijitWindow.end)}` : "11:55 AM - 12:45 PM"}
                  </p>
                </div>
              </div>

              <div className="p-2.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-black text-rose-800 dark:text-rose-300">
                    ⚠️ राहु काल (अशुभ समय)
                  </p>
                  <p className="text-xs font-bold text-rose-900 dark:text-rose-200 mt-0.5">
                    {rahuWindow ? `${formatT(rahuWindow.start)} - ${formatT(rahuWindow.end)}` : "04:30 PM - 06:00 PM"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('muhurat')}
            className="mt-4 pt-3 border-t border-amber-500/15 text-xs font-black text-amber-800 dark:text-amber-300 flex items-center justify-between hover:underline group"
          >
            <span>सभी मुहूर्त देखें</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* BENTO TILE: DAILY SHLOKA & WISDOM (SPAN 2) */}
        <div className="md:col-span-2 bg-gradient-to-br from-amber-50/90 via-orange-50/60 to-amber-100/80 dark:from-[#2B170B] dark:via-[#201007] dark:to-[#180A04] backdrop-blur-xl rounded-3xl p-5 border border-amber-500/30 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-amber-600" /> आज की पावन श्रीमद्भगवद्गीता सीख
              </span>
              <button
                onClick={toggleSpeech}
                className="p-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-800 dark:text-amber-200 transition"
                title={isPlayingAudio ? "ऑडियो रोकें" : "श्लोक सुनें"}
              >
                {isPlayingAudio ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-amber-600" />}
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/70 dark:bg-stone-900/70 border border-amber-500/20">
              <p className="text-xs sm:text-sm font-black font-granth text-[#4A2612] dark:text-amber-100 leading-relaxed italic">
                "{dailyShloka.sanskrit}"
              </p>
              <p className="text-xs font-bold text-stone-700 dark:text-stone-300 mt-2 leading-relaxed">
                अर्थ: {dailyShloka.meaning}
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('gita')}
            className="mt-3 pt-2 text-xs font-black text-amber-800 dark:text-amber-300 flex items-center gap-1 hover:underline"
          >
            <span>सम्पूर्ण गीता श्लोक देखें</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* BENTO TILE: PANCHAK & BHADRA ALERT */}
        <div className="bg-white/85 dark:bg-[#25130A]/85 backdrop-blur-xl rounded-3xl p-5 border border-amber-500/30 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-amber-800 dark:text-amber-300 mb-3">
              <span className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-600" /> विशेष योग व सतर्कता
              </span>
              <Star className="w-4 h-4 text-amber-500" />
            </div>

            <div className="space-y-2">
              <div className={`p-2.5 rounded-2xl border ${panchak.isActive ? 'bg-amber-500/10 border-amber-500/30' : 'bg-emerald-500/10 border-emerald-500/30'}`}>
                <p className="text-xs font-black text-stone-800 dark:text-amber-200">
                  {panchak.isActive ? `⚠️ पञ्चक प्रभाव (${panchak.typeNameHindi || panchak.type})` : "✅ आज पञ्चक दोष मुक्त है"}
                </p>
              </div>

              <div className={`p-2.5 rounded-2xl border ${bhadra.isActive ? 'bg-rose-500/10 border-rose-500/30' : 'bg-emerald-500/10 border-emerald-500/30'}`}>
                <p className="text-xs font-black text-stone-800 dark:text-amber-200">
                  {bhadra.isActive ? `⚠️ भद्रा काल सक्रिय (${bhadra.vas})` : "✅ आज भद्रा दोष मुक्त है"}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('panchang')}
            className="mt-4 pt-3 border-t border-amber-500/15 text-xs font-black text-amber-800 dark:text-amber-300 flex items-center justify-between hover:underline group"
          >
            <span>पंचांग योग जांचें</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

      </div>

      {/* ========================================================= */}
      {/* 3. iOS BENTO QUICK ACCESS MODULES GRID                  */}
      {/* ========================================================= */}
      <div className="bg-white/80 dark:bg-[#1E110A]/80 backdrop-blur-2xl rounded-3xl p-5 border border-amber-500/30 shadow-lg">
        <h2 className="text-base font-black font-granth text-[#4A2612] dark:text-amber-100 mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <span>ज्योतिष एवं वैदिक सेवाएं (iOS Bento Box Hub)</span>
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          
          <button
            onClick={() => onNavigateTab('kundali')}
            className="p-3.5 rounded-2xl bg-amber-50/80 dark:bg-stone-900/80 border border-amber-500/20 hover:bg-amber-100 dark:hover:bg-stone-800 transition flex flex-col items-center text-center gap-2 group shadow-xs m3-touch"
          >
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-500 text-white shadow-md group-hover:scale-110 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="text-xs font-black text-[#4A2612] dark:text-amber-200">जन्म कुण्डली</span>
          </button>

          <button
            onClick={() => onNavigateTab('choghadiya')}
            className="p-3.5 rounded-2xl bg-amber-50/80 dark:bg-stone-900/80 border border-amber-500/20 hover:bg-amber-100 dark:hover:bg-stone-800 transition flex flex-col items-center text-center gap-2 group shadow-xs m3-touch"
          >
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-yellow-600 to-amber-500 text-white shadow-md group-hover:scale-110 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-xs font-black text-[#4A2612] dark:text-amber-200">चौघड़िया चक्र</span>
          </button>

          <button
            onClick={() => onNavigateTab('muhurat')}
            className="p-3.5 rounded-2xl bg-amber-50/80 dark:bg-stone-900/80 border border-amber-500/20 hover:bg-amber-100 dark:hover:bg-stone-800 transition flex flex-col items-center text-center gap-2 group shadow-xs m3-touch"
          >
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-stone-950 shadow-md group-hover:scale-110 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-xs font-black text-[#4A2612] dark:text-amber-200">शुभ मुहूर्त</span>
          </button>

          <button
            onClick={() => onNavigateTab('milan')}
            className="p-3.5 rounded-2xl bg-amber-50/80 dark:bg-stone-900/80 border border-amber-500/20 hover:bg-amber-100 dark:hover:bg-stone-800 transition flex flex-col items-center text-center gap-2 group shadow-xs m3-touch"
          >
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-rose-600 to-pink-500 text-white shadow-md group-hover:scale-110 transition-transform">
              <Shield className="w-5 h-5" />
            </div>
            <span className="text-xs font-black text-[#4A2612] dark:text-amber-200">गुण मिलान</span>
          </button>

          <button
            onClick={() => onNavigateTab('rashifal')}
            className="p-3.5 rounded-2xl bg-amber-50/80 dark:bg-stone-900/80 border border-amber-500/20 hover:bg-amber-100 dark:hover:bg-stone-800 transition flex flex-col items-center text-center gap-2 group shadow-xs m3-touch"
          >
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 text-white shadow-md group-hover:scale-110 transition-transform">
              <Sun className="w-5 h-5" />
            </div>
            <span className="text-xs font-black text-[#4A2612] dark:text-amber-200">दैनिक राशिफल</span>
          </button>

          <button
            onClick={() => onNavigateTab('durga')}
            className="p-3.5 rounded-2xl bg-amber-50/80 dark:bg-stone-900/80 border border-amber-500/20 hover:bg-amber-100 dark:hover:bg-stone-800 transition flex flex-col items-center text-center gap-2 group shadow-xs m3-touch"
          >
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-red-600 to-orange-500 text-white shadow-md group-hover:scale-110 transition-transform">
              <Flame className="w-5 h-5" />
            </div>
            <span className="text-xs font-black text-[#4A2612] dark:text-amber-200">दुर्गा सप्तशती</span>
          </button>

          <button
            onClick={() => onNavigateTab('vratkatha')}
            className="p-3.5 rounded-2xl bg-amber-50/80 dark:bg-stone-900/80 border border-amber-500/20 hover:bg-amber-100 dark:hover:bg-stone-800 transition flex flex-col items-center text-center gap-2 group shadow-xs m3-touch"
          >
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-md group-hover:scale-110 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <span className="text-xs font-black text-[#4A2612] dark:text-amber-200">व्रत कथा व आरती</span>
          </button>

          <button
            onClick={() => onNavigateTab('vastu')}
            className="p-3.5 rounded-2xl bg-amber-50/80 dark:bg-stone-900/80 border border-amber-500/20 hover:bg-amber-100 dark:hover:bg-stone-800 transition flex flex-col items-center text-center gap-2 group shadow-xs m3-touch"
          >
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-500 text-white shadow-md group-hover:scale-110 transition-transform">
              <Compass className="w-5 h-5" />
            </div>
            <span className="text-xs font-black text-[#4A2612] dark:text-amber-200">वास्तु शास्त्र</span>
          </button>

          <button
            onClick={() => onNavigateTab('upay')}
            className="p-3.5 rounded-2xl bg-amber-50/80 dark:bg-stone-900/80 border border-amber-500/20 hover:bg-amber-100 dark:hover:bg-stone-800 transition flex flex-col items-center text-center gap-2 group shadow-xs m3-touch"
          >
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-amber-600 to-yellow-500 text-white shadow-md group-hover:scale-110 transition-transform">
              <Zap className="w-5 h-5" />
            </div>
            <span className="text-xs font-black text-[#4A2612] dark:text-amber-200">सरल उपाय</span>
          </button>

          <button
            onClick={() => onNavigateTab('numerology')}
            className="p-3.5 rounded-2xl bg-amber-50/80 dark:bg-stone-900/80 border border-amber-500/20 hover:bg-amber-100 dark:hover:bg-stone-800 transition flex flex-col items-center text-center gap-2 group shadow-xs m3-touch"
          >
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 text-white shadow-md group-hover:scale-110 transition-transform">
              <Star className="w-5 h-5" />
            </div>
            <span className="text-xs font-black text-[#4A2612] dark:text-amber-200">अंक ज्योतिष</span>
          </button>

          <button
            onClick={() => onNavigateTab('yatra')}
            className="p-3.5 rounded-2xl bg-amber-50/80 dark:bg-stone-900/80 border border-amber-500/20 hover:bg-amber-100 dark:hover:bg-stone-800 transition flex flex-col items-center text-center gap-2 group shadow-xs m3-touch"
          >
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-500 text-white shadow-md group-hover:scale-110 transition-transform">
              <Compass className="w-5 h-5" />
            </div>
            <span className="text-xs font-black text-[#4A2612] dark:text-amber-200">दिशाशूल & यात्रा</span>
          </button>

          <button
            onClick={() => onNavigateTab('reminders')}
            className="p-3.5 rounded-2xl bg-amber-50/80 dark:bg-stone-900/80 border border-amber-500/20 hover:bg-amber-100 dark:hover:bg-stone-800 transition flex flex-col items-center text-center gap-2 group shadow-xs m3-touch"
          >
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-amber-700 to-orange-600 text-white shadow-md group-hover:scale-110 transition-transform">
              <Calendar className="w-5 h-5" />
            </div>
            <span className="text-xs font-black text-[#4A2612] dark:text-amber-200">व्रत स्मरण</span>
          </button>

        </div>
      </div>

      {/* ========================================================= */}
      {/* 4. DYNAMIC UMA AI QUICK PROMPT CHIPS                     */}
      {/* ========================================================= */}
      <div className="bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-amber-500/10 backdrop-blur-xl rounded-3xl p-4 border border-amber-500/30">
        <p className="text-xs font-black text-amber-900 dark:text-amber-200 mb-2 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>उमा AI से तुरंत पूछें (Instant Astrological Queries):</span>
        </p>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onOpenUma("आज कौन सा कार्य करना अत्यंत शुभ रहेगा?")}
            className="px-3 py-1.5 rounded-2xl bg-white/80 dark:bg-stone-900/80 border border-amber-500/30 text-stone-800 dark:text-amber-200 text-xs font-bold hover:bg-amber-100 transition shadow-xs"
          >
            ✨ आज का शुभ कार्य?
          </button>
          <button
            onClick={() => onOpenUma("मेरी कुण्डली में आज का सबसे मजबूत ग्रह कौन सा है?")}
            className="px-3.5 py-1.5 rounded-2xl bg-white/80 dark:bg-stone-900/80 border border-amber-500/30 text-stone-800 dark:text-amber-200 text-xs font-bold hover:bg-amber-100 transition shadow-xs"
          >
            🪐 आज का गोचर प्रभाव?
          </button>
          <button
            onClick={() => onOpenUma("राहुकाल के दोष से बचने का सरल उपाय क्या है?")}
            className="px-3.5 py-1.5 rounded-2xl bg-white/80 dark:bg-stone-900/80 border border-amber-500/30 text-stone-800 dark:text-amber-200 text-xs font-bold hover:bg-amber-100 transition shadow-xs"
          >
            🛡️ राहुकाल शांति उपाय?
          </button>
          <button
            onClick={() => onOpenUma("व्यापार और धन वृद्धि हेतु आज का अचूक टोटका बताओ")}
            className="px-3.5 py-1.5 rounded-2xl bg-white/80 dark:bg-stone-900/80 border border-amber-500/30 text-stone-800 dark:text-amber-200 text-xs font-bold hover:bg-amber-100 transition shadow-xs"
          >
            💰 धन वृद्धि उपाय?
          </button>
        </div>
      </div>

    </div>
  );
};

export default DashboardView;
