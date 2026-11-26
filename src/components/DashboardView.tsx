import React, { useState, useMemo, useEffect } from 'react';
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
  Search,
  X,
  SlidersHorizontal,
  Layers,
  Headphones,
} from 'lucide-react';
import {
  getDayChoghadiya,
  getCurrentChoghadiya,
  getAuspiciousWindows,
  getInauspiciousWindows,
} from '../services/choghadiya';
import { calculatePanchakAndBhadra } from '../services/horaPanchakYogas';
import { getDailyShloka, getLocalizedDailyShloka } from '../constants/shlokas';
import { useLanguage } from '../i18n';
import { trVedic } from '../i18n/vedicTranslate';
import { umaVoice } from '../services/UmaVoiceService';
import { calculateMoonriseTime, calculateEkadashiParana } from '../services/astronomy';
import { calculateAgnivasa } from '../services/havan';
import {
  BOOK_PAGES,
  FLIP_BOOK_CHAPTERS,
  getLocalizedBookPage,
  type BookPageItem,
} from '../constants/bookPages';
import { getCalcSettings } from '../services/engine/calcSettings';
import { CalcSettingsPanel } from './CalcSettingsPanel';

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

type DashboardComplexity = 'simple' | 'pro';
const DASHBOARD_MODE_STORAGE_KEY = 'shakti_dashboard_complexity_v1';

const SEARCH_SYNONYMS: Record<string, string> = {
  panchang: 'panchang tithi nakshatra yoga karana आज का पंचांग तिथि नक्षत्र',
  kalnirnay: 'kalnirnay monthly calendar masik पंचांग कैलेंडर महीना',
  festivals: 'festival vrat ekadashi purnima amavasya tyohar त्योहार व्रत एकादशी दिवाली होली',
  havan: 'havan yagya agnivas agnihotra ahuti swaha हवन यज्ञ अग्निवास आहुति समिधा',
  kundali: 'kundali janam birth chart lagna dasha कुंडली जन्म पत्रिका लग्न',
  milan: 'milan marriage shadi vivah matchmaking 36 guna विवाह शादी गुण मिलान',
  choghadiya: 'choghadiya auspicious hour shubh samay चौघड़िया शुभ समय राहुकाल',
  muhurat: 'muhurat griha pravesh marriage vehicle मुहूर्त गृहप्रवेश विवाह',
  rashifal: 'rashifal horoscope zodiac daily राशिफल मेष वृषभ आज का राशिफल',
  sadesati: 'shani sadesati dhaiya saturn शनि साढ़े साती ढैया',
  gochar: 'gochar planetary transit navagraha गोचर ग्रह राशि परिवर्तन',
  japamala: 'japamala japa mantra rudraksha 108 beads माला जप रुद्राक्ष',
  durga: 'durga saptashati navratri kavach argala दुर्गा सप्तशती कवच नवरात्रि',
  hanuman: 'hanuman chalisa bajrangbali हनुमान चालीसा',
  sundarkand: 'sundarkand ramcharitmanas tulsidas सुंदरकांड रामचरितमानस',
  vishnu_sahasranama: 'vishnu sahasranama stotra 1000 names विष्णु सहस्रनाम',
  lal_kitab: 'lal kitab 501 upay remedy karz money धन कर्ज लाल किताब उपाय',
  ravan_sanhita: 'ravan sanhita 108 upay maha upay रावण संहिता उपाय',
  upay: 'upay remedy totka graha shanti उपाय टोटका ग्रह शांति',
  saral: 'saral upay simple daily remedy सरल उपाय',
  shastrokt: '501 mantra sadhana vidhi मंत्र साधना',
  sabar: 'sabar mantra gorakhnath साबर शाबर मंत्र',
  jain_mantras: 'jain navkar namokar bhaktamar जैन णमोकार मंत्र',
  vastu: 'vastu home house office direction वास्तु घर मकान दिशा',
  gita: 'gita bhagavad krishna shloka गीता श्लोक उपदेश',
  granth_puran: 'granth upanishad puran vedas scripture ग्रन्थ उपनिषद् पुराण',
  devta_arpan: 'devta arpan puja samagri bhog फूल जल देवता अर्पण पूजा',
  shiv_tantra: 'shiv tantra kashmir shaivism vigyan bhairav chakra शिव तंत्र ध्यान',
  yatra: 'yatra travel dishashool journey यात्रा दिशाशूल सफर',
  prashna: 'prashna horary instant question प्रश्न कुंडली',
  vratkatha: 'vrat katha aarti satyanarayan ekadashi व्रत कथा आरती',
  reminders: 'reminder sankalp alarm स्मृति संकल्प',
  numerology: 'numerology loshu mulank bhagyank अंक ज्योतिष मूलांक',
  palmistry: 'palmistry hand hastrekha palm scan हस्तरेखा हाथ',
  tarot: 'tarot card spread prediction टैरो कार्ड',
  gemology: 'gemology gemstone ratna pukhraj neelam रत्न विज्ञान पन्ना नीलम',
  face_reading: 'face reading samudrika mukha मुख लक्षण',
  iching: 'iching oracle hexagram coin आई चिंग',
  audio_player: 'audio music bhajan aarti sitar path संगीत भजन आरती सुनें',
  shiva: 'shiva mahimna stotra शिव महिम्न स्तोत्र',
  prarthana: 'prarthana morning night prayer प्रार्थना श्लोक',
  index: 'index chapters contents अनुक्रमणिका सूची',
};

function readInitialComplexity(): DashboardComplexity {
  try {
    const raw = localStorage.getItem(DASHBOARD_MODE_STORAGE_KEY);
    return raw === 'pro' ? 'pro' : 'simple';
  } catch {
    return 'simple';
  }
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  panchang,
  currentLocation,
  currentDate = new Date(),
  onDateChange,
  onNavigateTab,
  onOpenUma,
  onOpenLocationModal,
  onOpenWhatsAppPanchang,
  onToggleStoryMode,
}) => {
  const { language } = useLanguage();
  const cLang = (language || 'hi').slice(0, 2).toLowerCase() as 'hi' | 'en' | 'gu';
  const L = <T,>(hi: T, en: T, gu: T): T => (cLang === 'en' ? en : cLang === 'gu' ? gu : hi);

  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [complexity, setComplexity] = useState<DashboardComplexity>(readInitialComplexity);
  const [showTraditionDrawer, setShowTraditionDrawer] = useState(false);
  const [settingsRev, setSettingsRev] = useState(0);

  useEffect(() => {
    const onSettingsUpdate = () => setSettingsRev((v) => v + 1);
    window.addEventListener('shakti-calc-settings', onSettingsUpdate);
    window.addEventListener('storage', onSettingsUpdate);
    return () => {
      window.removeEventListener('shakti-calc-settings', onSettingsUpdate);
      window.removeEventListener('storage', onSettingsUpdate);
    };
  }, []);

  const calcSettings = useMemo(() => getCalcSettings(), [settingsRev]);

  const handleSetComplexity = (mode: DashboardComplexity) => {
    setComplexity(mode);
    try {
      localStorage.setItem(DASHBOARD_MODE_STORAGE_KEY, mode);
    } catch {
      // ignore storage quota errors
    }
  };

  // Deduplicated localized search catalog across all app modules
  const allModulesCatalog = useMemo<BookPageItem[]>(() => {
    const map = new Map<string, BookPageItem>();
    for (const page of [...BOOK_PAGES, ...FLIP_BOOK_CHAPTERS]) {
      if (!map.has(page.id)) {
        map.set(page.id, getLocalizedBookPage(page, language));
      }
    }
    return Array.from(map.values());
  }, [language]);

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    const tokens = q.split(/\s+/).filter(Boolean);
    return allModulesCatalog
      .filter((item) => {
        const hay = `${item.id} ${item.label} ${item.title} ${item.desc} ${SEARCH_SYNONYMS[item.id] || ''}`.toLowerCase();
        return tokens.every((tok) => hay.includes(tok));
      })
      .slice(0, 8);
  }, [searchQuery, allModulesCatalog]);

  // Dynamic astronomical & panchang calculations
  const activeDate = panchang ? panchang.date : currentDate;
  const weekdayNum = activeDate.getDay();

  const dayChoghadiyas = panchang ? getDayChoghadiya(panchang.solar, weekdayNum) : [];
  const { current: currentChoghadiya, remainingMinutes } = getCurrentChoghadiya(dayChoghadiyas);

  const auspiciousWindows = panchang ? getAuspiciousWindows(panchang.solar) : [];
  const inauspiciousWindows = panchang ? getInauspiciousWindows(panchang.solar, weekdayNum) : [];

  const abhijitWindow = auspiciousWindows.find((w) => w.title === 'अभिजित मुहूर्त');
  const rahuWindow = inauspiciousWindows.find((w) => w.title === 'राहु काल');

  const { panchak, bhadra } = panchang
    ? calculatePanchakAndBhadra(panchang)
    : {
        panchak: {
          isActive: false,
          type: '',
          typeNameHindi: '',
          nature: 'moderate' as const,
          rashi: '',
          nakshatra: '',
          description: '',
          remedy: '',
          forbiddenActs: [],
        },
        bhadra: {
          isActive: false,
          vas: 'अनुपस्थित' as const,
          vasEnglish: 'none' as const,
          nature: 'shubh' as const,
          impactDescription: '',
          guidance: '',
        },
      };

  const agnivasa = useMemo(() => {
    if (!panchang) return null;
    return calculateAgnivasa(panchang, cLang);
  }, [panchang, cLang]);

  const formatT = (d: Date) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const sunriseStr = panchang ? formatT(panchang.solar.sunrise) : '06:15 AM';
  const sunsetStr = panchang ? formatT(panchang.solar.sunset) : '06:30 PM';

  const weekdayName = panchang ? trVedic(panchang.weekday, language) : L('सोमवार', 'Monday', 'સોમવાર');
  const pakshaName = panchang ? trVedic(panchang.paksha, language) : L('कृष्ण', 'Krishna', 'કૃષ્ણ');
  const tithiName = panchang ? trVedic(panchang.tithi, language) : L('दशमी', 'Dashami', 'દશમ');
  const nakshatraName = panchang ? trVedic(panchang.nakshatra, language) : L('पुष्य', 'Pushya', 'પુષ્ય');
  const yogaName = panchang ? trVedic(panchang.yoga, language) : L('शुभ', 'Shubha', 'શુભ');
  const karanaName = panchang ? trVedic(panchang.karana, language) : L('बव', 'Bava', 'બવ');
  const masaName = panchang ? trVedic(panchang.masa, language) : L('कार्तिक मास', 'Kartika Month', 'કારતક માસ');
  const samvatName = panchang ? panchang.samvat : '२०८३';

  const baseShloka = getDailyShloka(activeDate);
  const dailyShloka = getLocalizedDailyShloka(baseShloka, language);

  const moonriseTime = useMemo(() => {
    return calculateMoonriseTime(activeDate, currentLocation.latitude || 23.1765, currentLocation.longitude || 75.7885);
  }, [activeDate, currentLocation]);

  const ekadashiParana = useMemo(() => {
    if (!panchang) return null;
    return calculateEkadashiParana(tithiName, panchang.solar.sunrise, panchang.solar.sunset);
  }, [tithiName, panchang]);

  const masaLabel =
    calcSettings.masaSystem === 'amanta'
      ? L('अमान्त', 'Amanta', 'અમાંત')
      : L('पूर्णिमान्त', 'Purnimanta', 'પૂર્ણિમાંત');
  const ekadashiLabel =
    calcSettings.ekadashiTradition === 'vaishnava'
      ? L('वैष्णव', 'Vaishnava', 'વૈષ્ણવ')
      : L('स्मार्त', 'Smarta', 'સ્માર્ત');

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
      umaVoice.stop();
      setIsPlayingAudio(false);
    } else {
      const textToSpeak = `${dailyShloka.sanskrit}। ${dailyShloka.meaning}`;
      setIsPlayingAudio(true);
      void umaVoice.speak(textToSpeak, {
        rate: 0.92,
        pitch: 1.04,
        voiceStyle: 'uma',
        onStart: () => setIsPlayingAudio(true),
        onEnd: () => setIsPlayingAudio(false),
        onError: () => setIsPlayingAudio(false),
      });
    }
  };

  const dateLocale = cLang === 'en' ? 'en-US' : cLang === 'gu' ? 'gu-IN' : 'hi-IN';
  const formattedFullDate = activeDate.toLocaleDateString(dateLocale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchResults.length > 0) {
      e.preventDefault();
      onNavigateTab(searchResults[0].id);
      setSearchQuery('');
    } else if (e.key === 'Escape') {
      setSearchQuery('');
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-5 py-4 space-y-4 pb-28 select-none">
      {/* ========================================================= */}
      {/* 1. CONTROL BAR & LOCATION HEADER                         */}
      {/* ========================================================= */}
      <div className="bg-white/85 dark:bg-[#1E110A]/85 backdrop-blur-xl rounded-3xl p-3 sm:p-4 border border-amber-500/20 shadow-md flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenLocationModal}
            className="min-h-[44px] flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-amber-50 dark:bg-stone-900 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs font-black hover:bg-amber-100 transition cursor-pointer"
            title={L('स्थान परिवर्तन करें', 'Change Location', 'સ્થળ બદલો')}
          >
            <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span className="truncate max-w-[115px] sm:max-w-[170px]">{currentLocation.name}</span>
          </button>

          <button
            type="button"
            onClick={handleTodayReset}
            className="min-h-[44px] flex items-center gap-1 px-3 py-2 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 text-xs font-black hover:brightness-105 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{L('आज', 'Today', 'આજે')}</span>
          </button>
        </div>

        {/* Center: Dynamic Date Controller */}
        <div className="flex items-center gap-1 bg-amber-100/60 dark:bg-stone-900/60 p-1 rounded-2xl border border-amber-500/20">
          <button
            type="button"
            onClick={handlePrevDay}
            className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl hover:bg-amber-200/60 dark:hover:bg-stone-800 text-amber-900 dark:text-amber-200 transition cursor-pointer"
            title={L('पिछला दिन', 'Previous Day', 'પાછલો દિવસ')}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="relative flex items-center px-2 min-h-[40px]">
            <span className="text-xs font-black text-[#5C3A21] dark:text-amber-200 tabular-nums">
              {formattedFullDate}
            </span>
            <input
              type="date"
              value={activeDate.toISOString().split('T')[0]}
              onChange={handleDateInputChange}
              aria-label={L('तिथि चुनें', 'Select Date', 'તારીખ પસંદ કરો')}
              className="absolute inset-0 opacity-0 cursor-pointer w-full"
            />
          </div>

          <button
            type="button"
            onClick={handleNextDay}
            className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl hover:bg-amber-200/60 dark:hover:bg-stone-800 text-amber-900 dark:text-amber-200 transition cursor-pointer"
            title={L('अगला दिन', 'Next Day', 'આગલો દિવસ')}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Right: Quick Action Buttons */}
        <div className="flex items-center gap-2">
          {onToggleStoryMode && (
            <button
              type="button"
              onClick={onToggleStoryMode}
              className="min-h-[44px] px-3 py-2 rounded-2xl bg-amber-100 hover:bg-amber-200 text-amber-900 dark:bg-stone-800 dark:hover:bg-stone-700 dark:text-amber-200 text-xs font-black flex items-center gap-1.5 transition border border-amber-500/30 cursor-pointer"
              title={L('ग्रन्थ स्टोरी रूप देखें', 'View Granth Story Mode', 'ગ્રંથ સ્ટોરી મોડ જુઓ')}
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span className="hidden sm:inline">{L('स्टोरी ग्रन्थ', 'Story View', 'સ્ટોરી ગ્રંથ')}</span>
            </button>
          )}

          {onOpenWhatsAppPanchang && (
            <button
              type="button"
              onClick={onOpenWhatsAppPanchang}
              className="min-h-[44px] px-3.5 py-2 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 hover:brightness-105 text-white text-xs font-black flex items-center gap-1.5 shadow-sm transition border border-emerald-400/50 cursor-pointer"
              title={L('आज का एचडी पंचांग स्टेटस कार्ड बनाएं', 'Create today’s HD Panchang Status Card', 'આજનું HD પંચાંગ સ્ટેટસ કાર્ડ બનાવો')}
            >
              <Share2 className="w-3.5 h-3.5 text-amber-200" />
              <span>{L('स्टेटस कार्ड', 'Status Card', 'સ્ટેટસ કાર્ડ')}</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. GLOBAL SEARCH + SIMPLE / PRO MODE + TRADITION BAR     */}
      {/* ========================================================= */}
      <div className="bg-white/85 dark:bg-[#1E110A]/85 backdrop-blur-xl rounded-3xl p-3 sm:p-3.5 border border-amber-500/25 shadow-sm space-y-2.5">
        <div className="flex flex-col md:flex-row md:items-center gap-2.5">
          {/* Global Quick Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-amber-700 dark:text-amber-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder={L(
                'खोजें: हवन, एकादशी, विवाह मिलान, साढ़े साती, वास्तु, गीता, जप माला...',
                'Quick Search: Havan, Ekadashi, Kundali, Vivah Milan, Vastu, Japa Mala...',
                'શોધો: હવન, એકાદશી, કુંડળી, વિવાહ મિલાન, વાસ્તુ, જપ માળા...'
              )}
              className="w-full min-h-[44px] pl-10 pr-9 py-2 rounded-2xl bg-amber-50/90 dark:bg-stone-900/90 border border-amber-400/40 text-xs sm:text-sm font-bold text-[#4A2612] dark:text-amber-100 placeholder:text-[#8C6239]/70 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-xl text-amber-800 dark:text-amber-300 hover:bg-amber-200/60 transition cursor-pointer"
                aria-label={L('खोज साफ करें', 'Clear Search', 'શોધ સાફ કરો')}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Right Controls: Tradition Pill + Simple/Pro Toggle */}
          <div className="flex items-center justify-between md:justify-end gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setShowTraditionDrawer((v) => !v)}
              className={`min-h-[44px] px-3 py-2 rounded-2xl text-[11px] font-black flex items-center gap-1.5 border transition cursor-pointer ${
                showTraditionDrawer
                  ? 'bg-[#6A3716] text-amber-50 border-[#6A3716]'
                  : 'bg-amber-50 dark:bg-stone-900 text-[#5C3A21] dark:text-amber-200 border-amber-400/40 hover:bg-amber-100'
              }`}
              title={L(
                'क्षेत्रीय पंचांग परंपरा बदलें (पूर्णिमान्त/अमान्त, स्मार्त/वैष्णव)',
                'Switch Regional Panchang Tradition (Purnimanta/Amanta, Smarta/Vaishnava)',
                'પ્રાદેશિક પંચાંગ પરંપરા બદલો (પૂર્ણિમાંત/અમાંત, સ્માર્ત/વૈષ્ણવ)'
              )}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate max-w-[165px]">
                {masaLabel.split(' ')[0]} · {ekadashiLabel.split(' ')[0]}
              </span>
            </button>

            <div
              role="group"
              aria-label={L('होम स्क्रीन मोड', 'Home View Mode', 'હોમ સ્ક્રીન મોડ')}
              className="inline-flex items-center p-1 rounded-2xl bg-amber-100/80 dark:bg-stone-900 border border-amber-400/40"
            >
              <button
                type="button"
                onClick={() => handleSetComplexity('simple')}
                className={`min-h-[36px] px-3 py-1 rounded-xl text-[11px] font-black transition cursor-pointer ${
                  complexity === 'simple'
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 shadow-xs'
                    : 'text-[#6E441F] dark:text-amber-300 hover:text-[#4A2612]'
                }`}
              >
                {L('सरल दैनिक', 'Daily Focus', 'સરળ દૈનિક')}
              </button>
              <button
                type="button"
                onClick={() => handleSetComplexity('pro')}
                className={`min-h-[36px] px-3 py-1 rounded-xl text-[11px] font-black transition cursor-pointer flex items-center gap-1 ${
                  complexity === 'pro'
                    ? 'bg-[#6A3716] text-amber-50 shadow-xs'
                    : 'text-[#6E441F] dark:text-amber-300 hover:text-[#4A2612]'
                }`}
              >
                <Layers className="w-3 h-3" />
                <span>{L('आचार्य / ग्रंथ', 'Pro Hub', 'આચાર્ય / ગ્રંથ')}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Instant Search Results Drawer */}
        {searchQuery.trim() !== '' && (
          <div className="pt-2 border-t border-amber-400/25">
            {searchResults.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                {searchResults.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        onNavigateTab(item.id);
                        setSearchQuery('');
                      }}
                      className="min-h-[48px] p-2.5 rounded-2xl bg-amber-50/95 dark:bg-stone-900 border border-amber-400/40 hover:border-amber-600 hover:bg-amber-100/80 transition flex items-center gap-2.5 text-left cursor-pointer group"
                    >
                      <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-black text-[#4A2612] dark:text-amber-100 truncate">
                          {item.label}
                        </div>
                        <div className="text-[10px] text-[#7C522E] dark:text-amber-300/80 truncate">
                          {item.desc}
                        </div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-amber-700 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="py-3 text-center text-xs font-bold text-[#7C522E] dark:text-amber-300">
                {L(
                  `"${searchQuery}" से संबंधित कोई अध्याय नहीं मिला — हवन, पंचांग, कुंडली, वास्तु या जप लिखकर खोजें।`,
                  `No module matched "${searchQuery}" — try Havan, Kundali, Ekadashi, Vastu, Gita or Japa.`,
                  `"${searchQuery}" માટે કોઈ અધ્યાય મળ્યો નથી — હવન, કુંડળી, એકાદશી, વાસ્તુ અથવા જપ લખી શોધો.`
                )}
              </div>
            )}
          </div>
        )}

        {/* Expandable Regional Panchang Tradition Panel */}
        {showTraditionDrawer && (
          <div className="pt-2 border-t border-amber-400/25">
            <CalcSettingsPanel compact panchangOnly />
          </div>
        )}
      </div>

      {/* Ekadashi Parana Muhurat Alert Banner */}
      {ekadashiParana && (
        <div className="bg-gradient-to-r from-[#FFF9EE] via-[#FEF3C7] to-[#FFF9EE] border-2 border-amber-500 rounded-3xl p-3.5 sm:p-4 shadow-sm flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-600 text-white flex items-center justify-center text-xl shrink-0">
            🔱
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-1.5">
              <h4 className="font-granth font-black text-sm sm:text-base text-[#7C2D12]">
                {ekadashiParana.title}
              </h4>
              <span className="px-3 py-1 rounded-full bg-amber-700 text-white text-[11px] font-black tracking-wide tabular-nums">
                {ekadashiParana.paranaTimeWindow}
              </span>
            </div>
            <p className="text-xs text-[#5C3A21] mt-1 font-medium leading-relaxed">
              {ekadashiParana.guidance}
            </p>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. MAIN BENTO BOX GRID                                   */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* HERO BENTO TILE: MAIN AUSPICIOUS VEDIC SUMMARY (SPAN 2) */}
        <div className="md:col-span-2 lg:col-span-2 relative overflow-hidden bg-gradient-to-br from-[#4A2612] via-[#633418] to-[#2B1408] rounded-3xl p-5 sm:p-6 text-[#FAF2E4] shadow-lg border border-amber-500/40 flex flex-col justify-between">
          <div className="flex items-start justify-between gap-2 mb-2">
            <span className="text-[11px] font-black text-amber-300 tracking-wide">
              ॥ श्री गणेशाय नमः ॥
            </span>
            <span className="text-xs font-bold text-amber-200/90 tabular-nums">
              {L('विक्रम संवत्', 'Vikram Samvat', 'વિક્રમ સંવત')} {samvatName}
            </span>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-black font-granth text-amber-100 tracking-wide">
              {weekdayName}, {pakshaName}
            </h1>
            <p className="text-base font-bold text-amber-200 mt-1 flex items-center flex-wrap gap-2">
              <span>{tithiName}</span>
              <span className="text-amber-400/60">•</span>
              <span>
                {nakshatraName} {L('नक्षत्र', 'Nakshatra', 'નક્ષત્ર')}
              </span>
            </p>

            <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-amber-100/95">
              <div className="px-2.5 py-1.5 rounded-xl bg-white/10 border border-amber-500/20">
                <span className="block text-[10px] text-amber-300/80 font-bold">
                  {L('मास', 'Masa', 'માસ')}
                </span>
                <span className="font-black truncate block">{masaName}</span>
              </div>
              <div className="px-2.5 py-1.5 rounded-xl bg-white/10 border border-amber-500/20">
                <span className="block text-[10px] text-amber-300/80 font-bold">
                  {L('योग', 'Yoga', 'યોગ')}
                </span>
                <span className="font-black truncate block">{yogaName}</span>
              </div>
              <div className="px-2.5 py-1.5 rounded-xl bg-white/10 border border-amber-500/20 col-span-2 sm:col-span-1">
                <span className="block text-[10px] text-amber-300/80 font-bold">
                  {L('करण', 'Karana', 'કરણ')}
                </span>
                <span className="font-black truncate block">{karanaName}</span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-amber-500/20 flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => onOpenUma()}
              className="min-h-[44px] px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-stone-950 font-black text-xs shadow-sm hover:brightness-105 transition flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 fill-stone-950" />
              <span>{L('उमा AI से मार्गदर्शन लें', 'Ask Uma AI', 'ઉમા AI માર્ગદર્શન')}</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigateTab('festivals')}
              className="min-h-[44px] px-3.5 py-2 rounded-2xl bg-white/10 text-amber-100 hover:bg-white/20 transition font-bold text-xs border border-amber-500/30 flex items-center gap-1.5 cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-amber-300" />
              <span>{L('आगामी व्रत व त्योहार', 'Festivals & Vrats', 'આગામી વ્રત અને પર્વ')}</span>
            </button>
          </div>
        </div>

        {/* BENTO TILE: LIVE CHOGHADIYA STATUS */}
        <div className="bg-white/85 dark:bg-[#25130A]/85 backdrop-blur-xl rounded-3xl p-5 border border-amber-500/30 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-amber-800 dark:text-amber-300 mb-3">
              <span className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-600" />
                {L('वर्तमान चौघड़िया', 'Live Choghadiya', 'વર્તમાન ચોઘડિયું')}
              </span>
              <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-300">
                {L('सक्रिय', 'ACTIVE', 'સક્રિય')}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-yellow-500/5 to-amber-500/15 border border-amber-500/30 text-center">
              <p className="text-xl font-black font-granth text-[#4A2612] dark:text-amber-100">
                {currentChoghadiya
                  ? trVedic(currentChoghadiya.hindiName, language)
                  : L('शुभ चौघड़िया', 'Shubh Choghadiya', 'શુભ ચોઘડિયું')}
              </p>
              <p className="text-xs font-black text-amber-700 dark:text-amber-300 mt-1 tabular-nums">
                {currentChoghadiya
                  ? L(`${remainingMinutes} मिनट शेष`, `${remainingMinutes} min left`, `${remainingMinutes} મિનિટ બાકી`)
                  : L('शुभ समय प्रभावी', 'Auspicious window', 'શુભ સમય પ્રભાવી')}
              </p>
              {currentChoghadiya && (
                <p className="text-[11px] text-stone-600 dark:text-stone-400 mt-1 tabular-nums">
                  {formatT(currentChoghadiya.start)} – {formatT(currentChoghadiya.end)}
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigateTab('choghadiya')}
            className="mt-4 pt-3 border-t border-amber-500/15 min-h-[36px] text-xs font-black text-amber-800 dark:text-amber-300 flex items-center justify-between hover:underline group cursor-pointer"
          >
            <span>{L('सम्पूर्ण चौघड़िया चक्र देखें', 'View Full Choghadiya', 'સંપૂર્ણ ચોઘડિયા ચક્ર જુઓ')}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* BENTO TILE: SUN & MOON ASTRONOMY */}
        <div className="bg-white/85 dark:bg-[#25130A]/85 backdrop-blur-xl rounded-3xl p-5 border border-amber-500/30 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-amber-800 dark:text-amber-300 mb-3">
              <span className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                <Sun className="w-4 h-4 text-amber-500" />
                {L('सूर्य व चन्द्र स्थिति', 'Sun & Moon', 'સૂર્ય અને ચંદ્ર')}
              </span>
              <Moon className="w-4 h-4 text-indigo-500" />
            </div>

            <div className="space-y-2 tabular-nums">
              <div className="flex items-center justify-between p-2.5 rounded-2xl bg-amber-50/70 dark:bg-stone-900/70 border border-amber-500/10">
                <span className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  {L('सूर्योदय', 'Sunrise', 'સૂર્યોદય')}
                </span>
                <span className="text-xs font-black text-[#4A2612] dark:text-amber-200">{sunriseStr}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-2xl bg-amber-50/70 dark:bg-stone-900/70 border border-amber-500/10">
                <span className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                  <Sunset className="w-3.5 h-3.5 text-orange-500" />
                  {L('सूर्यास्त', 'Sunset', 'સૂર્યાસ્ત')}
                </span>
                <span className="text-xs font-black text-[#4A2612] dark:text-amber-200">{sunsetStr}</span>
              </div>
              {moonriseTime && (
                <div className="flex items-center justify-between p-2.5 rounded-2xl bg-indigo-50/70 dark:bg-stone-900/70 border border-indigo-500/20">
                  <span className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                    <Moon className="w-3.5 h-3.5 text-indigo-500" />
                    {L('चंद्रोदय', 'Moonrise', 'ચંદ્રોદય')}
                  </span>
                  <span className="text-xs font-black text-indigo-950 dark:text-indigo-200">{moonriseTime}</span>
                </div>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigateTab('panchang')}
            className="mt-4 pt-3 border-t border-amber-500/15 min-h-[36px] text-xs font-black text-amber-800 dark:text-amber-300 flex items-center justify-between hover:underline group cursor-pointer"
          >
            <span>{L('पूर्ण पंचांग विवरण', 'Full Panchang Details', 'સંપૂર્ણ પંચાંગ વિગત')}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* BENTO TILE: ABHIJIT MUHURAT & RAHU KAAL */}
        <div className="bg-white/85 dark:bg-[#25130A]/85 backdrop-blur-xl rounded-3xl p-5 border border-amber-500/30 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-amber-800 dark:text-amber-300 mb-3">
              <span className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                <Sparkle className="w-4 h-4 text-emerald-600" />
                {L('मुहूर्त व राहुकाल', 'Muhurat & Rahu Kaal', 'મુહૂર્ત અને રાહુકાળ')}
              </span>
              <Shield className="w-4 h-4 text-amber-600" />
            </div>

            <div className="space-y-2 tabular-nums">
              <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
                <p className="text-[11px] font-black text-emerald-800 dark:text-emerald-300">
                  {L('अभिजित मुहूर्त (शुभ)', 'Abhijit Muhurat (Auspicious)', 'અભિજિત મુહૂર્ત (શુભ)')}
                </p>
                <p className="text-xs font-bold text-emerald-900 dark:text-emerald-200 mt-0.5">
                  {abhijitWindow
                    ? `${formatT(abhijitWindow.start)} – ${formatT(abhijitWindow.end)}`
                    : '11:55 AM – 12:45 PM'}
                </p>
              </div>

              <div className="p-2.5 rounded-2xl bg-rose-500/10 border border-rose-500/30">
                <p className="text-[11px] font-black text-rose-800 dark:text-rose-300">
                  {L('राहु काल (त्याज्य)', 'Rahu Kaal (Avoid)', 'રાહુ કાળ (ત્યાજ્ય)')}
                </p>
                <p className="text-xs font-bold text-rose-900 dark:text-rose-200 mt-0.5">
                  {rahuWindow
                    ? `${formatT(rahuWindow.start)} – ${formatT(rahuWindow.end)}`
                    : '04:30 PM – 06:00 PM'}
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigateTab('muhurat')}
            className="mt-4 pt-3 border-t border-amber-500/15 min-h-[36px] text-xs font-black text-amber-800 dark:text-amber-300 flex items-center justify-between hover:underline group cursor-pointer"
          >
            <span>{L('सभी मुहूर्त देखें', 'View All Muhurats', 'તમામ મુહૂર્ત જુઓ')}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* BENTO TILE: TODAY'S AGNIVASA & NITYA HAVAN ACTION STRIP */}
        {agnivasa && (
          <div className="md:col-span-2 lg:col-span-3 bg-gradient-to-br from-[#FFF8EC] via-amber-50/90 to-orange-50/70 dark:from-[#2B170B] dark:via-[#221108] dark:to-[#180A04] rounded-3xl p-4 sm:p-5 border border-amber-500/35 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0">
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                  agnivasa.isAuspicious
                    ? 'bg-gradient-to-tr from-orange-600 to-amber-500 text-white'
                    : 'bg-amber-900/90 text-amber-200'
                }`}
              >
                <Flame className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm sm:text-base font-black font-granth text-[#4A2612] dark:text-amber-100">
                    {agnivasa.title}
                  </h3>
                  <span
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-black ${
                      agnivasa.isAuspicious
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        : 'bg-amber-200/80 text-[#5C3A21] border border-amber-400/60'
                    }`}
                  >
                    {agnivasa.badgeText}
                  </span>
                </div>
                <p className="text-xs text-[#6E441F] dark:text-amber-200/90 mt-1 line-clamp-2">
                  {agnivasa.practicalGuidance}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onNavigateTab('havan')}
              className="min-h-[44px] px-4 py-2.5 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 hover:brightness-105 text-white text-xs font-black flex items-center justify-center gap-1.5 shrink-0 shadow-sm transition cursor-pointer"
            >
              <Flame className="w-4 h-4" />
              <span>{L('नित्य हवन शुरू करें', 'Start Nitya Havan', 'નિત્ય હવન શરૂ કરો')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* PRO-ONLY BENTO CARDS: DAILY GITA SHLOKA + PANCHAK & BHADRA */}
        {complexity === 'pro' && (
          <>
            <div className="md:col-span-2 bg-gradient-to-br from-amber-50/90 via-orange-50/60 to-amber-100/80 dark:from-[#2B170B] dark:via-[#201007] dark:to-[#180A04] backdrop-blur-xl rounded-3xl p-5 border border-amber-500/30 shadow-md flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-amber-600" />
                    {L('आज की श्रीमद्भगवद्गीता सीख', 'Daily Bhagavad Gita Wisdom', 'આજનો ભગવદ્ ગીતા ઉપદેશ')}
                  </span>
                  <button
                    type="button"
                    onClick={toggleSpeech}
                    className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-800 dark:text-amber-200 transition cursor-pointer"
                    title={isPlayingAudio ? L('ऑडियो रोकें', 'Stop Audio', 'ઓડિયો બંધ કરો') : L('श्लोक सुनें', 'Listen Shloka', 'શ્લોક સાંભળો')}
                  >
                    {isPlayingAudio ? (
                      <VolumeX className="w-4 h-4 text-rose-500" />
                    ) : (
                      <Volume2 className="w-4 h-4 text-amber-600" />
                    )}
                  </button>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/75 dark:bg-stone-900/70 border border-amber-500/20">
                  <p data-no-translate="true" className="text-xs sm:text-sm font-black font-granth text-[#4A2612] dark:text-amber-100 leading-relaxed italic">
                    "{dailyShloka.sanskrit}"
                  </p>
                  <p className="text-xs font-bold text-stone-700 dark:text-stone-300 mt-2 leading-relaxed">
                    {L('अर्थ:', 'Meaning:', 'અર્થ:')} {dailyShloka.meaning}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onNavigateTab('gita')}
                className="mt-3 pt-2 min-h-[36px] text-xs font-black text-amber-800 dark:text-amber-300 flex items-center gap-1 hover:underline cursor-pointer"
              >
                <span>{L('सम्पूर्ण गीता श्लोक देखें', 'Read All Gita Shlokas', 'સંપૂર્ણ ગીતા શ્લોક જુઓ')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="md:col-span-2 bg-white/85 dark:bg-[#25130A]/85 backdrop-blur-xl rounded-3xl p-5 border border-amber-500/30 shadow-md flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-amber-800 dark:text-amber-300 mb-3">
                  <span className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-amber-600" />
                    {L('विशेष योग, पञ्चक व भद्रा', 'Special Yogas, Panchak & Bhadra', 'વિશેષ યોગ, પંચક અને ભદ્રા')}
                  </span>
                  <Star className="w-4 h-4 text-amber-500" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div
                    className={`p-3 rounded-2xl border ${
                      panchak.isActive
                        ? 'bg-amber-500/10 border-amber-500/30'
                        : 'bg-emerald-500/10 border-emerald-500/30'
                    }`}
                  >
                    <p className="text-xs font-black text-stone-800 dark:text-amber-200">
                      {panchak.isActive
                        ? L(
                            `पञ्चक प्रभाव (${panchak.typeNameHindi || panchak.type})`,
                            `Panchak Active (${panchak.type})`,
                            `પંચક પ્રભાવ (${panchak.typeNameHindi || panchak.type})`
                          )
                        : L('आज पञ्चक दोष मुक्त है', 'Today is Panchak-free', 'આજે પંચક દોષ મુક્ત છે')}
                    </p>
                  </div>

                  <div
                    className={`p-3 rounded-2xl border ${
                      bhadra.isActive
                        ? 'bg-rose-500/10 border-rose-500/30'
                        : 'bg-emerald-500/10 border-emerald-500/30'
                    }`}
                  >
                    <p className="text-xs font-black text-stone-800 dark:text-amber-200">
                      {bhadra.isActive
                        ? L(`भद्रा काल सक्रिय (${bhadra.vas})`, `Bhadra Active (${bhadra.vas})`, `ભદ્રા કાળ સક્રિય (${bhadra.vas})`)
                        : L('आज भद्रा दोष मुक्त है', 'Today is Bhadra-free', 'આજે ભદ્રા દોષ મુક્ત છે')}
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onNavigateTab('panchang')}
                className="mt-4 pt-3 border-t border-amber-500/15 min-h-[36px] text-xs font-black text-amber-800 dark:text-amber-300 flex items-center justify-between hover:underline group cursor-pointer"
              >
                <span>{L('पंचांग योग जांचें', 'Inspect Panchang Yogas', 'પંચાંગ યોગ તપાસો')}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </>
        )}
      </div>

      {/* ========================================================= */}
      {/* 4. SERVICES HUB (CURATED IN SIMPLE MODE, FULL IN PRO)    */}
      {/* ========================================================= */}
      <div className="bg-white/85 dark:bg-[#1E110A]/85 backdrop-blur-xl rounded-3xl p-4 sm:p-5 border border-amber-500/30 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <h2 className="text-base font-black font-granth text-[#4A2612] dark:text-amber-100 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <span>
              {complexity === 'simple'
                ? L('दैनिक आवश्यक सेवाएं', 'Essential Daily Services', 'દૈનિક આવશ્યક સેવાઓ')
                : L('सम्पूर्ण वैदिक एवं ज्योतिष केंद्र', 'Complete Vedic & Jyotish Hub', 'સંપૂર્ણ વૈદિક અને જ્યોતિષ કેન્દ્ર')}
            </span>
          </h2>

          {complexity === 'simple' && (
            <button
              type="button"
              onClick={() => handleSetComplexity('pro')}
              className="min-h-[38px] px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-[#5C3A21] dark:text-amber-200 text-xs font-black flex items-center gap-1.5 transition cursor-pointer"
            >
              <span>{L('सभी ४०+ ग्रन्थ व सेवाएं खोलें', 'Unlock All 40+ Granths & Tools', 'તમામ ૪૦+ ગ્રંથ અને સેવાઓ ખોલો')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {complexity === 'simple' ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { id: 'kalnirnay', label: L('मासिक कैलेंडर', 'Monthly Calendar', 'માસિક કેલેન્ડર'), icon: Calendar, gradient: 'from-amber-600 to-amber-500' },
              { id: 'festivals', label: L('व्रत व त्योहार', 'Festivals & Vrats', 'વ્રત અને પર્વ'), icon: Star, gradient: 'from-orange-600 to-amber-500' },
              { id: 'havan', label: L('नित्य हवन व अग्निवास', 'Nitya Havan', 'નિત્ય હવન'), icon: Flame, gradient: 'from-red-600 to-orange-500' },
              { id: 'kundali', label: L('जन्म कुण्डली', 'Birth Kundali', 'જન્મ કુંડળી'), icon: BookOpen, gradient: 'from-amber-700 to-yellow-600' },
              { id: 'milan', label: L('विवाह गुण मिलान', 'Matchmaking', 'ગુણ મિલાન'), icon: Shield, gradient: 'from-rose-600 to-pink-500' },
              { id: 'rashifal', label: L('दैनिक राशिफल', 'Daily Horoscope', 'દૈનિક રાશિફળ'), icon: Sun, gradient: 'from-amber-500 to-yellow-500' },
              { id: 'japamala', label: L('१०८ जप माला', '108 Japa Mala', '૧૦૮ જપ માળા'), icon: Sparkles, gradient: 'from-emerald-600 to-teal-500' },
              { id: 'audio_player', label: L('भक्ति संगीत व पाठ', 'Devotional Audio', 'ભક્તિ સંગીત'), icon: Headphones, gradient: 'from-indigo-600 to-violet-500' },
            ].map((tile) => {
              const Icon = tile.icon;
              return (
                <button
                  key={tile.id}
                  type="button"
                  onClick={() => onNavigateTab(tile.id)}
                  className="min-h-[84px] p-3.5 rounded-2xl bg-amber-50/85 dark:bg-stone-900/80 border border-amber-500/20 hover:border-amber-500 hover:bg-amber-100/80 dark:hover:bg-stone-800 transition flex flex-col items-center justify-center text-center gap-2 group cursor-pointer"
                >
                  <div className={`p-2.5 rounded-2xl bg-gradient-to-tr ${tile.gradient} text-white shadow-sm group-hover:scale-105 transition-transform`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-black text-[#4A2612] dark:text-amber-200">
                    {tile.label}
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {[
              { id: 'shiv_tantra', label: L('शिव तंत्र विद्या', 'Shiv Tantra', 'શિવ તંત્ર વિદ્યા'), icon: Flame, gradient: 'from-[#7A1D1D] to-[#B56A00]' },
              { id: 'devta_arpan', label: L('देवता अर्पण फल', 'Devta Arpan', 'દેવતા અર્પણ ફળ'), icon: Sparkles, gradient: 'from-amber-600 to-red-600' },
              { id: 'havan', label: L('नित्य हवन व अग्निवास', 'Nitya Havan', 'નિત્ય હવન અને અગ્નિવાસ'), icon: Flame, gradient: 'from-orange-600 to-amber-500' },
              { id: 'kundali', label: L('जन्म कुण्डली', 'Janam Kundali', 'જન્મ કુંડળી'), icon: BookOpen, gradient: 'from-amber-600 to-amber-500' },
              { id: 'choghadiya', label: L('चौघड़िया चक्र', 'Choghadiya', 'ચોઘડિયા ચક્ર'), icon: Clock, gradient: 'from-yellow-600 to-amber-500' },
              { id: 'muhurat', label: L('शुभ मुहूर्त', 'Shubh Muhurat', 'શુભ મુહૂર્ત'), icon: Sparkles, gradient: 'from-amber-500 to-yellow-500' },
              { id: 'milan', label: L('गुण मिलान', 'Kundali Milan', 'ગુણ મિલાન'), icon: Shield, gradient: 'from-rose-600 to-pink-500' },
              { id: 'rashifal', label: L('दैनिक राशिफल', 'Rashifal', 'દૈનિક રાશિફળ'), icon: Sun, gradient: 'from-orange-600 to-amber-500' },
              { id: 'durga', label: L('दुर्गा सप्तशती', 'Durga Saptashati', 'દુર્ગા સપ્તશતી'), icon: Flame, gradient: 'from-red-600 to-orange-500' },
              { id: 'vratkatha', label: L('व्रत कथा व आरती', 'Vrat Katha', 'વ્રત કથા અને આરતી'), icon: FileText, gradient: 'from-emerald-600 to-teal-500' },
              { id: 'vastu', label: L('वास्तु शास्त्र', 'Vastu Shastra', 'વાસ્તુ શાસ્ત્ર'), icon: Compass, gradient: 'from-indigo-600 to-blue-500' },
              { id: 'upay', label: L('सरल व लाल किताब उपाय', 'Lal Kitab & Upay', 'સરળ અને લાલ કિતાબ ઉપાય'), icon: Zap, gradient: 'from-amber-600 to-yellow-500' },
              { id: 'numerology', label: L('अंक ज्योतिष', 'Numerology', 'અંક જ્યોતિષ'), icon: Star, gradient: 'from-purple-600 to-indigo-500' },
              { id: 'yatra', label: L('दिशाशूल व यात्रा', 'Yatra & Dishashool', 'દિશાશૂળ અને યાત્રા'), icon: Compass, gradient: 'from-teal-600 to-emerald-500' },
              { id: 'reminders', label: L('व्रत स्मरण', 'Reminders', 'વ્રત સ્મરણ'), icon: Calendar, gradient: 'from-amber-700 to-orange-600' },
              { id: 'sadesati', label: L('शनि साढ़े साती', 'Shani Sade Sati', 'શનિ સાડા સાતી'), icon: Award, gradient: 'from-stone-700 to-amber-700' },
              { id: 'japamala', label: L('१०८ जप माला', '108 Japa Mala', '૧૦૮ જપ માળા'), icon: Sparkles, gradient: 'from-emerald-600 to-teal-600' },
              { id: 'audio_player', label: L('भक्ति संगीत', 'Devotional Audio', 'ભક્તિ સંગીત'), icon: Headphones, gradient: 'from-indigo-600 to-violet-600' },
            ].map((tile) => {
              const Icon = tile.icon;
              return (
                <button
                  key={tile.id}
                  type="button"
                  onClick={() => onNavigateTab(tile.id)}
                  className="min-h-[84px] p-3.5 rounded-2xl bg-amber-50/80 dark:bg-stone-900/80 border border-amber-500/20 hover:border-amber-500 hover:bg-amber-100 dark:hover:bg-stone-800 transition flex flex-col items-center justify-center text-center gap-2 group cursor-pointer"
                >
                  <div className={`p-2.5 rounded-2xl bg-gradient-to-tr ${tile.gradient} text-white shadow-sm group-hover:scale-105 transition-transform`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-black text-[#4A2612] dark:text-amber-200">
                    {tile.label}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* 5. PRO MODE: UMA AI QUICK QUERIES + CALCULATION PROOF    */}
      {/* ========================================================= */}
      {complexity === 'pro' && (
        <>
          <div className="bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-amber-500/10 backdrop-blur-xl rounded-3xl p-4 border border-amber-500/30">
            <p className="text-xs font-black text-amber-900 dark:text-amber-200 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>
                {L(
                  'उमा AI से तुरंत पूछें (त्वरित वैदिक प्रश्न):',
                  'Ask Uma AI Instantly (Quick Queries):',
                  'ઉમા AI ને તરત પૂછો (ત્વરિત વૈદિક પ્રશ્નો):'
                )}
              </span>
            </p>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onOpenUma(L('आज कौन सा कार्य करना अत्यंत शुभ रहेगा?', 'Which tasks are most auspicious today?', 'આજે કયું કાર્ય કરવું અત્યંત શુભ રહેશે?'))}
                className="min-h-[40px] px-3 py-1.5 rounded-2xl bg-white/85 dark:bg-stone-900/80 border border-amber-500/30 text-stone-800 dark:text-amber-200 text-xs font-bold hover:bg-amber-100 transition cursor-pointer"
              >
                {L('आज का शुभ कार्य?', 'Best task today?', 'આજનું શુભ કાર્ય?')}
              </button>
              <button
                type="button"
                onClick={() => onOpenUma(L('मेरी कुण्डली में आज का सबसे मजबूत ग्रह कौन सा है?', 'Which planet is strongest in transit today?', 'મારી કુંડળીમાં આજનો સૌથી મજબૂત ગ્રહ કયો છે?'))}
                className="min-h-[40px] px-3.5 py-1.5 rounded-2xl bg-white/85 dark:bg-stone-900/80 border border-amber-500/30 text-stone-800 dark:text-amber-200 text-xs font-bold hover:bg-amber-100 transition cursor-pointer"
              >
                {L('आज का गोचर प्रभाव?', 'Today’s planetary transit?', 'આજનો ગોચર પ્રભાવ?')}
              </button>
              <button
                type="button"
                onClick={() => onOpenUma(L('राहुकाल के दोष से बचने का सरल उपाय क्या है?', 'How to avoid Rahu Kaal dosha simply?', 'રાહુકાળના દોષથી બચવાનો સરળ ઉપાય શું છે?'))}
                className="min-h-[40px] px-3.5 py-1.5 rounded-2xl bg-white/85 dark:bg-stone-900/80 border border-amber-500/30 text-stone-800 dark:text-amber-200 text-xs font-bold hover:bg-amber-100 transition cursor-pointer"
              >
                {L('राहुकाल शांति उपाय?', 'Rahu Kaal remedy?', 'રાહુકાળ શાંતિ ઉપાય?')}
              </button>
              <button
                type="button"
                onClick={() => onOpenUma(L('व्यापार और धन वृद्धि हेतु आज का सात्विक उपाय बताओ', 'Suggest a sattvic remedy for business & wealth today', 'વેપાર અને ધન વૃદ્ધિ માટે આજનો સાત્વિક ઉપાય જણાવો'))}
                className="min-h-[40px] px-3.5 py-1.5 rounded-2xl bg-white/85 dark:bg-stone-900/80 border border-amber-500/30 text-stone-800 dark:text-amber-200 text-xs font-bold hover:bg-amber-100 transition cursor-pointer"
              >
                {L('धन वृद्धि उपाय?', 'Wealth growth remedy?', 'ધન વૃદ્ધિ ઉપાય?')}
              </button>
            </div>
          </div>

          {panchang?.calculationNote && (
            <div className="px-4 py-2.5 rounded-2xl bg-amber-50/70 dark:bg-stone-900/60 border border-amber-500/20 text-[11px] text-[#6E441F] dark:text-amber-300/90 flex flex-wrap items-center justify-between gap-2">
              <span className="font-bold">
                {L('शास्त्रीय गणना प्रमाण:', 'Astronomical Reference:', 'શાસ્ત્રીય ગણતરી પ્રમાણ:')}{' '}
                {trVedic(panchang.ayanamshaName, language)}
              </span>
              <span className="opacity-90">{panchang.calculationNote}</span>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DashboardView;
