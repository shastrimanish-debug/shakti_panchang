import React, { useState, useMemo, useEffect, useCallback, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Sparkles } from 'lucide-react';
import { OfflineIndicator } from './components/OfflineIndicator';
import { getStoredLocation, getSavedKundaliProfiles, getStoredTheme, setStoredTheme, AppTheme, DEVOTIONAL_THEMES, getStoredFontSize, setStoredFontSize, AppFontSize } from './services/storage';
import { calculateVedicPanchang } from './services/astronomy';
import { scheduleMorningBriefs } from './services/morningBrief';
import { SavedLocation, KundaliData } from './types';
import { BOOK_PAGES, getLocalizedBookPage } from './constants/bookPages';
import { BoardDrawer, BoardMenuButton, DrawerHostContext, ModuleBoard, TabMenuContext, TodayBoard } from './components/BoardShell';
import { SubscriptionModal } from './components/SubscriptionModal';
import { FrontPage } from './components/FrontPage';
import { useLicense } from './lib/license-client';
import { useTranslation, useLanguage } from './i18n';
import { triggerHapticSelection } from './utils/haptics';

const KalnirnayMonthView = React.lazy(() => import('./components/KalnirnayMonthView').then((m) => ({ default: m.KalnirnayMonthView })));
const DevotionalAudioPlayerView = React.lazy(() => import('./components/DevotionalAudioPlayerView').then((m) => ({ default: m.DevotionalAudioPlayerView })));
const ChoghadiyaView = React.lazy(() => import('./components/ChoghadiyaView').then((m) => ({ default: m.ChoghadiyaView })));
const MuhuratView = React.lazy(() => import('./components/MuhuratView').then((m) => ({ default: m.MuhuratView })));
const YatraView = React.lazy(() => import('./components/YatraView').then((m) => ({ default: m.YatraView })));
const KundaliView = React.lazy(() => import('./components/KundaliView').then((m) => ({ default: m.KundaliView })));
const FestivalsView = React.lazy(() => import('./components/FestivalsView').then((m) => ({ default: m.FestivalsView })));
const RemindersView = React.lazy(() => import('./components/RemindersView').then((m) => ({ default: m.RemindersView })));
const VratKathaView = React.lazy(() => import('./components/VratKathaView').then((m) => ({ default: m.VratKathaView })));
const DurgaSaptashatiView = React.lazy(() => import('./components/DurgaSaptashatiView').then((m) => ({ default: m.DurgaSaptashatiView })));
const VastuView = React.lazy(() => import('./components/VastuView').then((m) => ({ default: m.VastuView })));
const UpayView = React.lazy(() => import('./components/UpayView').then((m) => ({ default: m.UpayView })));
const SaralUpayPanel = React.lazy(() => import('./components/SaralUpayPanel').then((m) => ({ default: m.SaralUpayPanel })));
const SabarMantraView = React.lazy(() => import('./components/SabarMantraView').then((m) => ({ default: m.SabarMantraView })));
const ShastroktUpayView = React.lazy(() => import('./components/ShastroktUpayView').then((m) => ({ default: m.ShastroktUpayView })));
const JainMantraView = React.lazy(() => import('./components/JainMantraView').then((m) => ({ default: m.JainMantraView })));
const NumerologyView = React.lazy(() => import('./components/NumerologyView').then((m) => ({ default: m.NumerologyView })));
const PalmistryView = React.lazy(() => import('./components/PalmistryView').then((m) => ({ default: m.PalmistryView })));
const TarotView = React.lazy(() => import('./components/TarotView').then((m) => ({ default: m.TarotView })));
const GemologyView = React.lazy(() => import('./components/GemologyView').then((m) => ({ default: m.GemologyView })));
const FaceReadingView = React.lazy(() => import('./components/FaceReadingView').then((m) => ({ default: m.FaceReadingView })));
const IChingView = React.lazy(() => import('./components/IChingView').then((m) => ({ default: m.IChingView })));
const DevtaArpanView = React.lazy(() => import('./components/DevtaArpanView').then((m) => ({ default: m.DevtaArpanView })));
const DailyRashifalView = React.lazy(() => import('./components/DailyRashifalView').then((m) => ({ default: m.DailyRashifalView })));
const DailyGitaShlokaView = React.lazy(() => import('./components/DailyGitaShlokaView').then((m) => ({ default: m.DailyGitaShlokaView })));
const GranthPuranView = React.lazy(() => import('./components/GranthPuranView').then((m) => ({ default: m.GranthPuranView })));
const WhatsAppPanchangModal = React.lazy(() => import('./components/WhatsAppPanchangModal').then((m) => ({ default: m.WhatsAppPanchangModal })));
const AstrologerBrandingModal = React.lazy(() => import('./components/AstrologerBrandingModal').then((m) => ({ default: m.AstrologerBrandingModal })));
const UmaAssistantModal = React.lazy(() => import('./components/UmaAssistantModal').then((m) => ({ default: m.UmaAssistantModal })));
const LocationModal = React.lazy(() => import('./components/LocationModal').then((m) => ({ default: m.LocationModal })));
const SavedProfilesModal = React.lazy(() => import('./components/SavedProfilesModal').then((m) => ({ default: m.SavedProfilesModal })));
const MoreMenuModal = React.lazy(() => import('./components/MoreMenuModal').then((m) => ({ default: m.MoreMenuModal })));
const ThemeSelectorModal = React.lazy(() => import('./components/ThemeSelectorModal').then((m) => ({ default: m.ThemeSelectorModal })));
const LanguageSelectorModal = React.lazy(() => import('./components/LanguageSelectorModal').then((m) => ({ default: m.LanguageSelectorModal })));
const ReleaseNotesModal = React.lazy(() => import('./components/ReleaseNotesModal').then((m) => ({ default: m.ReleaseNotesModal })));

const HanumanChalisaPathView = React.lazy(async () => {
  const [{ ScripturePathView }, { HANUMAN_CHALISA }] = await Promise.all([
    import('./components/ScripturePathView'),
    import('./data/hanumanChalisa'),
  ]);
  return {
    default: () => <ScripturePathView title="श्री हनुमान चालीसा" verses={HANUMAN_CHALISA} />,
  };
});

const SundarkandPathView = React.lazy(async () => {
  const [{ ScripturePathView }, { default: sundarkandRaw }] = await Promise.all([
    import('./components/ScripturePathView'),
    import('./data/sundarkand.json'),
  ]);
  return {
    default: () => (
      <ScripturePathView
        title="श्री रामचरितमानस · संपूर्ण सुंदरकांड"
        verses={sundarkandRaw as { n: number; kind?: string; text: string }[]}
      />
    ),
  };
});

const VishnuSahasranamaPathView = React.lazy(async () => {
  const [{ ScripturePathView }, { VISHNU_SAHASRANAMA_VERSES }] = await Promise.all([
    import('./components/ScripturePathView'),
    import('./data/vishnuSahasranama'),
  ]);
  return {
    default: () => (
      <ScripturePathView
        title="श्री विष्णु सहस्रनाम स्तोत्रम् सम्पूर्ण पाठ"
        verses={VISHNU_SAHASRANAMA_VERSES}
      />
    ),
  };
});

/**
 * Play a gentle tactile paper flip sound when turning the Granth book page
 */
function playTactilePageTurnSound() {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const duration = 0.09;
    const bufferSize = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.35));
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1400;
    filter.Q.value = 1.8;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    whiteNoise.start();
  } catch {
    // Ignore audio policy restrictions
  }
}

export function App() {
  const [currentLocation, setCurrentLocation] = useState<SavedLocation>(() => getStoredLocation());
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());
  const [activeTab, setActiveTab] = useState<string>('panchang');
  const [turnDirection, setTurnDirection] = useState<'forward' | 'backward'>('forward');
  const [pageTurnNotice, setPageTurnNotice] = useState<string | null>(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState<boolean>(true);
  const [theme, setTheme] = useState<AppTheme>(() => getStoredTheme());
  // Book open/closed state (true: showing Panchang content directly on startup)
  const [isBookOpen, setIsBookOpen] = useState<boolean>(true);
  const [entered, setEntered] = useState(false);
  const [isMoreModalOpen, setIsMoreModalOpen] = useState<boolean>(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState<boolean>(false);
  const [appFontSize, setAppFontSize] = useState<AppFontSize>(() => getStoredFontSize());
  const handleCycleFontSize = useCallback(() => {
    triggerHapticSelection();
    setAppFontSize((prev) => {
      const next: AppFontSize = prev === 'normal' ? 'large' : prev === 'large' ? 'xlarge' : 'normal';
      setStoredFontSize(next);
      return next;
    });
  }, []);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerHost, setDrawerHost] = useState<HTMLElement | null>(null);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);
  const bindDrawerHost = useCallback((el: HTMLDivElement | null) => setDrawerHost(el), []);
  const drawerApi = useMemo(() => ({ host: drawerHost, close: closeDrawer }), [drawerHost, closeDrawer]);

  // Apply Devotional Light Theme or Ratri Dark Theme across document
  useEffect(() => {
    setStoredTheme(theme);
    if (typeof document !== 'undefined') {
      const allThemeClasses = [
        'kesariya-theme',
        'chandan-theme',
        'peetambari-theme',
        'gangajal-theme',
        'tulsi-theme',
        'sindoor-theme',
        'swarna-theme',
        'shvet-theme',
        'bhojpatra-theme',
        'tamra-theme',
        'dark',
      ];
      document.body.classList.remove(...allThemeClasses);
      document.documentElement.classList.remove('dark');

      const themeClass = `${theme}-theme`;
      document.body.classList.add(themeClass);

      if (theme === 'tamra') {
        document.documentElement.classList.add('dark');
        document.body.classList.add('dark');
      }
      const swatch = DEVOTIONAL_THEMES.find((item) => item.id === theme);
      const meta = document.querySelector('meta[name="theme-color"]');
      if (swatch && meta) meta.setAttribute('content', swatch.accentHex);
    }
  }, [theme]);

  const handleToggleTheme = () => {
    setIsThemeModalOpen(true);
  };

  // Modals state
  const [isLocationModalOpen, setIsLocationModalOpen] = useState<boolean>(false);
  const [isUmaModalOpen, setIsUmaModalOpen] = useState<boolean>(false);
  const [umaInitialPrompt, setUmaInitialPrompt] = useState<string | null>(null);
  const [isSavedProfilesModalOpen, setIsSavedProfilesModalOpen] = useState<boolean>(false);
  const [isWhatsAppPanchangOpen, setIsWhatsAppPanchangOpen] = useState<boolean>(false);
  const [isBrandingModalOpen, setIsBrandingModalOpen] = useState<boolean>(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState<boolean>(false);
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState<boolean>(false);
  const [isReleaseNotesOpen, setIsReleaseNotesOpen] = useState<boolean>(false);
  const [subscriptionReason, setSubscriptionReason] = useState<string>('');
  const { t } = useTranslation();
  const { language: currentLang, setLanguage } = useLanguage();

  // Strict Subscription & Anti-Mod State
  const { status: licenseStatus } = useLicense();
  const isEntitled = licenseStatus.entitled;

  const triggerSubscriptionModal = useCallback((reason?: string) => {
    setSubscriptionReason(
      reason ||
        "७-दिवसीय निःशुल्क परीक्षण पूर्ण हो चुका है। अब केवल पंचांग का मुख्य पृष्ठ निःशुल्क उपलब्ध है। अन्य सुविधाओं के लिए कृपया वार्षिक सदस्यता सक्रिय करें।"
    );
    setIsSubscriptionModalOpen(true);
  }, []);

  useEffect(() => {
    const open = () => triggerSubscriptionModal();
    window.addEventListener('shakti-open-subscription', open);
    return () => window.removeEventListener('shakti-open-subscription', open);
  }, [triggerSubscriptionModal]);

  // Guard Effect: If trial is expired or revoked while on another tab, immediately snap back to 'panchang'
  useEffect(() => {
    if (!isEntitled && activeTab !== 'panchang' && activeTab !== 'services') {
      setActiveTab('panchang');
    }
  }, [isEntitled, activeTab]);

  // Active Kundali Profile - clean profile state without hardcoded defaults
  const [activeKundali, setActiveKundali] = useState<KundaliData | null>(() => {
    const saved = getSavedKundaliProfiles();
    return saved.length > 0 ? saved[0] : null;
  });

  // Calculate high-precision Vedic Panchang based on current Date and Geo-coordinates
  const panchang = useMemo(() => {
    return calculateVedicPanchang(
      currentDate,
      currentLocation.latitude,
      currentLocation.longitude,
      currentLocation.timezoneHours
    );
  }, [currentDate, currentLocation]);

  useEffect(() => {
    scheduleMorningBriefs(
      currentLocation.latitude,
      currentLocation.longitude,
      currentLocation.timezoneHours,
      currentLocation.name,
      activeKundali?.name,
      activeKundali?.lagnaRashi,
    );
  }, [currentLocation, activeKundali?.name, activeKundali?.lagnaRashi]);

  // Current page book meta
  const currentIndex = BOOK_PAGES.findIndex((p) => p.id === activeTab);
  const currentTabMeta = getLocalizedBookPage(BOOK_PAGES[currentIndex] || BOOK_PAGES[0], currentLang);
  const prevIndex = (currentIndex - 1 + BOOK_PAGES.length) % BOOK_PAGES.length;
  const nextIndex = (currentIndex + 1) % BOOK_PAGES.length;
  const prevTabMeta = getLocalizedBookPage(BOOK_PAGES[prevIndex], currentLang);
  const nextTabMeta = getLocalizedBookPage(BOOK_PAGES[nextIndex], currentLang);

  // Show temporary toast notice when turning pages
  const notifyPageTurn = useCallback((pageTitle: string, pageNum: number) => {
    setPageTurnNotice(`📖 ${t('book.page', 'पृष्ठ')} ${pageNum} : ${pageTitle}`);
    const timer = setTimeout(() => setPageTurnNotice(null), 2000);
    return () => clearTimeout(timer);
  }, [t]);

  // Navigate to previous page
  const handlePrevPage = useCallback(() => {
    if (!isEntitled) {
      triggerSubscriptionModal("७-दिवसीय निःशुल्क परीक्षण पूर्ण हो चुका है। केवल पंचांग का मुख्य पृष्ठ उपलब्ध है।");
      return;
    }
    triggerHapticSelection();
    setTurnDirection('backward');
    const prev = getLocalizedBookPage(BOOK_PAGES[prevIndex], currentLang);
    setActiveTab(prev.id);
    if (isAudioEnabled) playTactilePageTurnSound();
    notifyPageTurn(prev.label, prev.pageNumber);
  }, [prevIndex, isAudioEnabled, notifyPageTurn, isEntitled, triggerSubscriptionModal, currentLang]);

  // Navigate to next page
  const handleNextPage = useCallback(() => {
    if (!isEntitled) {
      triggerSubscriptionModal("७-दिवसीय निःशुल्क परीक्षण पूर्ण हो चुका है। केवल पंचांग का मुख्य पृष्ठ उपलब्ध है।");
      return;
    }
    triggerHapticSelection();
    setTurnDirection('forward');
    const next = getLocalizedBookPage(BOOK_PAGES[nextIndex], currentLang);
    setActiveTab(next.id);
    if (isAudioEnabled) playTactilePageTurnSound();
    notifyPageTurn(next.label, next.pageNumber);
  }, [nextIndex, isAudioEnabled, notifyPageTurn, isEntitled, triggerSubscriptionModal, currentLang]);

  // Navigate directly to a tab
  const handleSelectTab = useCallback(
    (tabId: string) => {
      triggerHapticSelection();
      setIsBookOpen(true);
      // STRICT ANTI-MOD & SUBSCRIPTION ENFORCEMENT:
      // If trial has expired and user is not subscribed, ONLY 'panchang' and 'services' tabs are accessible!
      if (!isEntitled && tabId !== 'panchang' && tabId !== 'services') {
        const featureNames: Record<string, string> = {
          choghadiya: 'चौघड़िया चक्र',
          muhurat: 'शुभ मुहूर्त',
          yatra: 'यात्रा दिशाशूल',
          kundali: 'जन्म कुण्डली व फलादेश',
          milan: 'अष्टकूट गुण मिलान',
          festivals: 'पर्व व त्योहार सूची',
          reminders: 'दैनिक स्मृति व संकल्प',
          vratkatha: 'व्रत कथा व आरती',
          durga: 'श्री दुर्गा सप्तशती',
          kalnirnay: 'मासिक सनातन पंचांग',
          audio_player: 'सुरीला भक्ति संगीत व स्वर पाठ',
          upay: 'ग्रह शांति व चमत्कारी उपाय',
          lal_kitab: 'लाल किताब के 501 उपाय',
          vastu: 'वैदिक वास्तु शास्त्र',
          rashifal: 'दैनिक राशिफल',
          gita: 'श्रीमद्भगवद्गीता श्लोक',
          vishnu_sahasranama: 'श्री विष्णु सहस्रनाम स्तोत्रम्',
          granth_puran: 'प्राचीन ग्रन्थ, उपनिषद् एवं महापुराण स्वाध्याय',
          hanuman: 'श्री हनुमान चालीसा',
          sundarkand: 'संपूर्ण सुंदरकांड पाठ',
          sabar: '501 शाबर मंत्र',
          jain_mantras: '201 जैन पाठ',
          saral: '501 सरल उपाय',
          shastrokt: '501 मंत्र और विस्तृत विधि',
          numerology: 'वैदिक अंक ज्योतिष एवं लो-शू चक्र',
          palmistry: 'सामुद्रिक हस्तरेखा शास्त्र',
          tarot: 'दिव्य टैरो कार्ड मार्गदर्शन',
          gemology: 'वैदिक रत्न विज्ञान',
          face_reading: 'समुद्रशास्त्र मुख आकृति विज्ञान',
          iching: 'प्राचीन आई-चिंग दिव्य प्रश्न',
        };
        const name = featureNames[tabId] || 'यह अध्याय';
        triggerSubscriptionModal(
          `७-दिवसीय निःशुल्क परीक्षण पूर्ण हो चुका है। केवल पंचांग मुख्य पृष्ठ फ्री है। ${name} देखने के लिए आजीवन VIP सदस्यता (₹99 / $1) सक्रिय करें।`
        );
        return;
      }

      const targetIdx = BOOK_PAGES.findIndex((p) => p.id === tabId);
      if (tabId === 'services' || tabId === 'index') {
        setTurnDirection('backward');
        setActiveTab(tabId);
      } else if (targetIdx !== -1) {
        setTurnDirection(targetIdx >= (currentIndex === -1 ? 0 : currentIndex) ? 'forward' : 'backward');
        const target = BOOK_PAGES[targetIdx];
        setActiveTab(target.id);
        if (isAudioEnabled) playTactilePageTurnSound();
        notifyPageTurn(target.label, target.pageNumber);
      } else {
        setTurnDirection('forward');
        setActiveTab(tabId);
      }
    },
    [currentIndex, isAudioEnabled, notifyPageTurn, isEntitled, triggerSubscriptionModal]
  );

  // Global tab navigation event listener for deep links & modals
  useEffect(() => {
    const handleTabNav = (e: Event) => {
      const custom = e as CustomEvent<{ tab: string }>;
      if (custom.detail?.tab) {
        handleSelectTab(custom.detail.tab);
      }
    };
    window.addEventListener('navigate-to-tab', handleTabNav);
    return () => window.removeEventListener('navigate-to-tab', handleTabNav);
  }, [handleSelectTab]);

  // Keyboard navigation (Arrow keys)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT'
      ) {
        return;
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrevPage();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNextPage();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePrevPage, handleNextPage]);

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDrawerOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawerOpen]);

  const tabMenu = useMemo(() => {
    let current: (() => boolean) | null = null;
    return {
      register(fn: () => boolean) {
        current = fn;
        return () => {
          if (current === fn) current = null;
        };
      },
      go() {
        if (current?.()) return;
        handleSelectTab("services");
      },
    };
  }, [handleSelectTab]);

  const pageMeta = BOOK_PAGES.find((p) => p.id === activeTab);
  const pageTitle =
    activeTab === "services" || activeTab === "index" || !pageMeta
      ? t("nav.allServices", "सभी सेवाएँ")
      : getLocalizedBookPage(pageMeta, currentLang).label;
  const openFromDrawer = (fn: () => void) => {
    setDrawerOpen(false);
    fn();
  };

  if (!entered || !isEntitled) {
    return (
      <>
        <FrontPage
          language={currentLang}
          daysRemaining={licenseStatus.daysRemaining}
          locked={!isEntitled}
          onLanguage={(code) => {
            void setLanguage(code);
          }}
          onEnter={() => {
            if (!isEntitled) {
              triggerSubscriptionModal("सात दिन का निःशुल्क परीक्षण समाप्त। ₹99 आजीवन या $1 सदस्यता के बिना ऐप बंद है।");
              return;
            }
            setEntered(true);
          }}
        />
        <SubscriptionModal
          isOpen={isSubscriptionModalOpen}
          onClose={() => setIsSubscriptionModalOpen(false)}
          reason={subscriptionReason}
          locked={!isEntitled}
        />
      </>
    );
  }

  return (
    <DrawerHostContext.Provider value={drawerApi}>
    <TabMenuContext.Provider value={tabMenu}>
    <div key={`app-root-${currentLang}`} data-font-size={appFontSize} className="board bx-bento h-dvh w-screen overflow-hidden relative flex flex-col font-sans">
      {/* PWA Network Offline Status Bar */}
      <OfflineIndicator />
      <div className="bx-rail shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <BoardMenuButton
            open={drawerOpen}
            onClick={() => {
              triggerHapticSelection();
              setDrawerOpen((open) => !open);
            }}
          />
          {activeTab !== "services" && activeTab !== "index" && (
            <motion.button
              type="button"
              initial={{ opacity: 0, x: -8, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 450, damping: 28 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              className="bx-tabmenu cursor-pointer"
              onClick={() => {
                triggerHapticSelection();
                tabMenu.go();
              }}
            >
              मुख्य मेनू
            </motion.button>
          )}
        </div>

        {/* Right: Persistent City Selector ("शहर चुनें"), Font Scale & Uma AI Button */}
        <div className="flex items-center gap-1.5 min-w-0 ml-auto">
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 450, damping: 26 }}
            className="bx-tabmenu max-w-[190px] sm:max-w-[260px] cursor-pointer"
            style={{
              backgroundColor: '#5C3A21',
              color: '#FAF2E4',
              borderColor: '#B56A00',
            }}
            onClick={() => {
              triggerHapticSelection();
              setIsLocationModalOpen(true);
            }}
            title="शहर / स्थान बदलें (Select City)"
          >
            <MapPin className="w-3.5 h-3.5 shrink-0" style={{ color: '#FFD88A' }} />
            <span className="truncate">{currentLocation.name}</span>
            <span
              style={{ backgroundColor: '#B56A00', color: '#FFFFFF' }}
              className="text-[10px] px-1.5 py-0.2 rounded-full font-black shrink-0"
            >
              शहर चुनें ▾
            </span>
          </motion.button>

          {/* Senior Citizen / Elder Friendly Font Size Scaler */}
          <motion.button
            type="button"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.94 }}
            transition={{ type: "spring", stiffness: 450, damping: 26 }}
            className="bx-tabmenu cursor-pointer"
            style={{
              backgroundColor: appFontSize !== 'normal' ? '#8B1E1E' : '#FAF2E4',
              color: appFontSize !== 'normal' ? '#FFD88A' : '#5C3A21',
              borderColor: appFontSize !== 'normal' ? '#FFD88A' : '#8C6239',
            }}
            onClick={handleCycleFontSize}
            title={`अक्षर का आकार बदलें (वर्तमान: ${appFontSize === 'xlarge' ? 'अति-विशाल (वृद्धजन)' : appFontSize === 'large' ? 'बड़ा' : 'सामान्य'})`}
          >
            <span className="font-bold text-xs">
              {appFontSize === 'xlarge' ? 'अ++' : appFontSize === 'large' ? 'अ+' : 'अ'}
            </span>
            <span className="hidden sm:inline text-[11px] font-semibold">
              {appFontSize === 'xlarge' ? 'अति-विशाल' : appFontSize === 'large' ? 'बड़ा' : 'अक्षर'}
            </span>
          </motion.button>

          <motion.button
            type="button"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 450, damping: 26 }}
            className="bx-tabmenu cursor-pointer"
            style={{
              backgroundColor: '#FFF7E6',
              color: '#7A1D1D',
              borderColor: '#D4A048',
            }}
            onClick={() => {
              triggerHapticSelection();
              setIsUmaModalOpen(true);
            }}
            title="उमा वैदिक दैवज्ञ"
          >
            <Sparkles className="w-3.5 h-3.5 shrink-0" style={{ color: '#B56A00' }} />
            <span className="hidden xs:inline">उमा</span>
          </motion.button>
        </div>
      </div>

      {/* Floating Page Turn Toast Notice */}
      {false && pageTurnNotice && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-in fade-in zoom-in-95 duration-200">
          <div className="px-3 py-1 bg-[#2C180C]/95 text-[#FAF2E4] border border-amber-500/50 rounded-full shadow-2xl text-xs font-bold font-granth flex items-center gap-1.5 backdrop-blur-md">
            <span className="text-amber-300">✦</span>
            <span>{pageTurnNotice}</span>
            <span className="text-amber-300">✦</span>
          </div>
        </div>
      )}

      {/* Main Responsive View Container with Spring-Based Tactile Board Navigation */}
      <main className="flex-1 min-h-0 w-full relative flex flex-col overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={`${activeTab}-${currentLang}`}
            initial={{
              opacity: 0,
              y: turnDirection === 'forward' ? 10 : -10,
              scale: 0.992,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: turnDirection === 'forward' ? -8 : 8,
              scale: 0.992,
            }}
            transition={{
              type: 'spring',
              stiffness: 420,
              damping: 32,
              mass: 0.7,
            }}
            className="flex-1 min-h-0 w-full flex flex-col overflow-hidden"
          >
          <Suspense
            fallback={
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center gap-2">
                <div className="text-2xl">🕉️</div>
                <div className="text-sm font-bold text-[#5C3A21]">अध्याय खुल रहा है...</div>
              </div>
            }
          >
            {(activeTab === 'services' || activeTab === 'index') && (
              <ModuleBoard language={currentLang} onOpen={handleSelectTab} />
            )}

            {(activeTab === 'dashboard' || activeTab === 'panchang') && (
              <TodayBoard
                panchang={panchang}
                place={currentLocation}
                currentDate={currentDate}
                onDateChange={setCurrentDate}
                onPlace={() => setIsLocationModalOpen(true)}
                onWhatsApp={() => setIsWhatsAppPanchangOpen(true)}
                onOpen={handleSelectTab}
              />
            )}

            {activeTab === 'kalnirnay' && (
              <div className="flex-1 min-h-0 w-full overflow-y-auto overscroll-contain">
                <KalnirnayMonthView
                  currentDate={currentDate}
                  currentLocation={currentLocation}
                  onOpenLocationModal={() => setIsLocationModalOpen(true)}
                  onDateSelect={(d) => {
                    setCurrentDate(d);
                    handleSelectTab('panchang');
                  }}
                  onNavigateToReminders={() => handleSelectTab('reminders')}
                />
              </div>
            )}

            {activeTab === 'audio_player' && (
              <DevotionalAudioPlayerView
                onOpenUmaModal={(query?: string) => {
                  if (query) setUmaInitialPrompt(query);
                  setIsUmaModalOpen(true);
                }}
                onBackToPanchang={() => handleSelectTab('panchang')}
              />
            )}

            {activeTab === 'choghadiya' && (
              <ChoghadiyaView
                panchang={panchang}
                onOpenUmaModal={(query?: string) => {
                  if (query) setUmaInitialPrompt(query);
                  setIsUmaModalOpen(true);
                }}
                onPrevChapter={handlePrevPage}
                onNextChapter={handleNextPage}
              />
            )}

            {activeTab === 'muhurat' && (
              <MuhuratView
                panchang={panchang}
                onOpenUmaModal={(query?: string) => {
                  if (query) setUmaInitialPrompt(query);
                  setIsUmaModalOpen(true);
                }}
                onPrevChapter={handlePrevPage}
                onNextChapter={handleNextPage}
              />
            )}

            {activeTab === 'yatra' && (
              <YatraView
                panchang={panchang}
                currentLocation={currentLocation}
                onOpenUmaModal={(query?: string) => {
                  if (query) setUmaInitialPrompt(query);
                  setIsUmaModalOpen(true);
                }}
                onPrevChapter={handlePrevPage}
                onNextChapter={handleNextPage}
              />
            )}

            {(activeTab === 'kundali' || activeTab === 'milan' || activeTab === 'prashna') && (
              <div className="flex-1 min-h-0 w-full overflow-y-auto overscroll-contain">
                <div className="w-full px-2 pb-8">
                <KundaliView
                  activeKundali={activeKundali}
                  setActiveKundali={setActiveKundali}
                  currentLocation={currentLocation}
                  initialSubTab={activeTab === 'milan' ? 'milan' : activeTab === 'prashna' ? 'prashna' : undefined}
                  onOpenSavedModal={() => setIsSavedProfilesModalOpen(true)}
                  onOpenUmaModal={() => setIsUmaModalOpen(true)}
                  onOpenBrandingModal={() => setIsBrandingModalOpen(true)}
                  onNavigateTab={handleSelectTab}
                />
                </div>
              </div>
            )}

            {activeTab === 'festivals' && (
              <FestivalsView
                currentDate={currentDate}
                onNavigateToReminders={() => handleSelectTab('reminders')}
                onDateSelect={(d) => {
                  setCurrentDate(d);
                  handleSelectTab('panchang');
                }}
                onOpenUmaModal={(query?: string) => {
                  if (query) setUmaInitialPrompt(query);
                  setIsUmaModalOpen(true);
                }}
                onPrevChapter={handlePrevPage}
                onNextChapter={handleNextPage}
              />
            )}

            {activeTab === 'reminders' && (
              <RemindersView
                onOpenUmaModal={(query?: string) => {
                  if (query) setUmaInitialPrompt(query);
                  setIsUmaModalOpen(true);
                }}
                onPrevChapter={handlePrevPage}
                onNextChapter={handleNextPage}
              />
            )}

            {activeTab === 'vratkatha' && (
              <VratKathaView
                onBackToPanchang={() => handleSelectTab('panchang')}
                onOpenUmaModal={(query?: string) => {
                  if (query) setUmaInitialPrompt(query);
                  setIsUmaModalOpen(true);
                }}
                onPrevChapter={handlePrevPage}
                onNextChapter={handleNextPage}
              />
            )}

            {activeTab === 'rashifal' && (
              <DailyRashifalView
                personName={activeKundali?.name}
                lagnaRashi={activeKundali?.lagnaRashi}
                onOpenUmaModal={(query?: string) => {
                  if (query) setUmaInitialPrompt(query);
                  setIsUmaModalOpen(true);
                }}
                onPrevChapter={handlePrevPage}
                onNextChapter={handleNextPage}
              />
            )}

            {activeTab === 'gita' && (
              <DailyGitaShlokaView
                onBackToPanchang={() => handleSelectTab('panchang')}
                onOpenUmaModal={(query?: string) => {
                  if (query) setUmaInitialPrompt(query);
                  setIsUmaModalOpen(true);
                }}
                onPrevChapter={handlePrevPage}
                onNextChapter={handleNextPage}
              />
            )}

            {activeTab === 'granth_puran' && (
              <GranthPuranView
                onBackToPanchang={() => handleSelectTab('panchang')}
                onSelectTab={handleSelectTab}
                onOpenUmaModal={(query?: string) => {
                  if (query) setUmaInitialPrompt(query);
                  setIsUmaModalOpen(true);
                }}
                onPrevChapter={handlePrevPage}
                onNextChapter={handleNextPage}
              />
            )}

            {activeTab === 'vastu' && (
              <VastuView
                onOpenUmaModal={(query?: string) => {
                  if (query) setUmaInitialPrompt(query);
                  setIsUmaModalOpen(true);
                }}
                onPrevChapter={handlePrevPage}
                onNextChapter={handleNextPage}
              />
            )}

            {activeTab === 'durga' && (
              <DurgaSaptashatiView
                onBackToPanchang={() => handleSelectTab('panchang')}
                onOpenUmaModal={(query?: string) => {
                  if (query) setUmaInitialPrompt(query);
                  setIsUmaModalOpen(true);
                }}
                onPrevChapter={handlePrevPage}
                onNextChapter={handleNextPage}
              />
            )}

            {activeTab === 'hanuman' && <HanumanChalisaPathView />}

            {activeTab === 'sundarkand' && <SundarkandPathView />}

            {activeTab === 'vishnu_sahasranama' && <VishnuSahasranamaPathView />}

            {activeTab === 'sabar' && <SabarMantraView />}

            {activeTab === 'jain_mantras' && <JainMantraView />}

            {activeTab === 'saral' && (
              <div className="flex-1 min-h-0 flex flex-col w-full overflow-y-auto overscroll-contain p-2 pb-16">
                <div className="shrink-0 px-1 pb-2 text-[13px] font-semibold text-[#5C3A21]">सरल उपाय · 501 पाठ</div>
                <SaralUpayPanel />
              </div>
            )}

            {activeTab === 'shastrokt' && <ShastroktUpayView />}

            {(activeTab === 'upay' || activeTab === 'lal_kitab') && (
              <div className="flex-1 min-h-0 w-full overflow-y-auto overscroll-contain p-2.5 sm:p-4 pb-20">
                <UpayView
                  activeKundali={activeKundali}
                  onOpenKundaliTab={() => handleSelectTab('kundali')}
                  onOpenUmaWithQuery={(query) => {
                    setUmaInitialPrompt(query);
                    setIsUmaModalOpen(true);
                  }}
                  onPrevChapter={handlePrevPage}
                  onNextChapter={handleNextPage}
                />
              </div>
            )}

            {activeTab === 'numerology' && (
              <NumerologyView
                activeKundali={activeKundali}
                onOpenKundaliTab={() => handleSelectTab('kundali')}
                onOpenUmaWithQuery={(query) => {
                  setUmaInitialPrompt(query);
                  setIsUmaModalOpen(true);
                }}
                onPrevChapter={handlePrevPage}
                onNextChapter={handleNextPage}
              />
            )}

            {activeTab === 'palmistry' && (
              <PalmistryView
                onOpenUmaWithQuery={(query) => {
                  setUmaInitialPrompt(query);
                  setIsUmaModalOpen(true);
                }}
                onPrevChapter={handlePrevPage}
                onNextChapter={handleNextPage}
              />
            )}

            {activeTab === 'tarot' && (
              <TarotView
                onOpenUmaWithQuery={(query) => {
                  setUmaInitialPrompt(query);
                  setIsUmaModalOpen(true);
                }}
                onPrevChapter={handlePrevPage}
                onNextChapter={handleNextPage}
              />
            )}

            {activeTab === 'gemology' && (
              <GemologyView
                onOpenUmaWithQuery={(query) => {
                  setUmaInitialPrompt(query);
                  setIsUmaModalOpen(true);
                }}
                onPrevChapter={handlePrevPage}
                onNextChapter={handleNextPage}
              />
            )}

            {activeTab === 'face_reading' && (
              <FaceReadingView
                onOpenUmaWithQuery={(query) => {
                  setUmaInitialPrompt(query);
                  setIsUmaModalOpen(true);
                }}
                onPrevChapter={handlePrevPage}
                onNextChapter={handleNextPage}
              />
            )}

            {activeTab === 'iching' && (
              <IChingView
                onOpenUmaWithQuery={(query) => {
                  setUmaInitialPrompt(query);
                  setIsUmaModalOpen(true);
                }}
                onPrevChapter={handlePrevPage}
                onNextChapter={handleNextPage}
              />
            )}

            {activeTab === 'devta_arpan' && (
              <DevtaArpanView
                onSelectTab={handleSelectTab}
                onOpenUmaWithPrompt={(prompt) => {
                  setUmaInitialPrompt(prompt);
                  setIsUmaModalOpen(true);
                }}
              />
            )}
          </Suspense>
          </motion.div>
        </AnimatePresence>
      </main>

      {drawerOpen && (
        <BoardDrawer
          title={pageTitle}
          place={currentLocation.name}
          showBack={activeTab !== "services"}
          trialText={
            licenseStatus.kind === "trial"
              ? t("trial.banner", {
                  days: licenseStatus.daysRemaining,
                  defaultValue: `परीक्षण: ${licenseStatus.daysRemaining} दिन शेष`,
                })
              : null
          }
          active={activeTab}
          onClose={() => setDrawerOpen(false)}
          onBack={() => openFromDrawer(() => {
            setTurnDirection('backward');
            setActiveTab("services");
          })}
          onPlace={() => openFromDrawer(() => setIsLocationModalOpen(true))}
          onLanguage={() => openFromDrawer(() => setIsLanguageModalOpen(true))}
          onTheme={() => openFromDrawer(() => setIsThemeModalOpen(true))}
          onServices={() => openFromDrawer(() => {
            setTurnDirection('backward');
            setActiveTab("services");
          })}
          onPanchang={() => openFromDrawer(() => handleSelectTab("panchang"))}
          onKundali={() => openFromDrawer(() => handleSelectTab("kundali"))}
          onUma={() => openFromDrawer(() => setIsUmaModalOpen(true))}
          onMore={() => openFromDrawer(() => setIsMoreModalOpen(true))}
          onHost={bindDrawerHost}
        />
      )}

      <Suspense fallback={null}>
        {isMoreModalOpen && (
          <MoreMenuModal
            isOpen={isMoreModalOpen}
            onClose={() => setIsMoreModalOpen(false)}
            onSelectTab={handleSelectTab}
            onOpenLocationModal={() => setIsLocationModalOpen(true)}
            onOpenUmaModal={() => {
              setIsUmaModalOpen(true);
            }}
            onOpenLanguageModal={() => setIsLanguageModalOpen(true)}
            onToggleBookCover={() => setIsBookOpen(false)}
            onOpenWhatsAppPanchang={() => {
              if (!isEntitled) {
                triggerSubscriptionModal("व्हाट्सएप सुप्रभात पंचांग कार्ड हेतु आजीवन VIP सदस्यता (₹99 / $1) सक्रिय करें।");
                return;
              }
              setIsWhatsAppPanchangOpen(true);
            }}
            onOpenBrandingModal={() => setIsBrandingModalOpen(true)}
            onOpenSubscriptionModal={triggerSubscriptionModal}
            currentLocation={currentLocation}
            theme={theme}
            onToggleTheme={handleToggleTheme}
            onSetTheme={setTheme}
            onOpenThemeModal={() => setIsThemeModalOpen(true)}
            isAudioEnabled={isAudioEnabled}
            onToggleAudio={() => setIsAudioEnabled(!isAudioEnabled)}
            onOpenReleaseNotes={() => setIsReleaseNotesOpen(true)}
          />
        )}

        {isThemeModalOpen && (
          <ThemeSelectorModal
            isOpen={isThemeModalOpen}
            onClose={() => setIsThemeModalOpen(false)}
            activeTheme={theme}
            onSelectTheme={(newTheme) => {
              setTheme(newTheme);
              setIsThemeModalOpen(false);
            }}
          />
        )}

        {isLanguageModalOpen && (
          <LanguageSelectorModal
            isOpen={isLanguageModalOpen}
            onClose={() => setIsLanguageModalOpen(false)}
            onLanguageSelected={async (lang) => {
              await setLanguage(lang.code);
            }}
          />
        )}

        {isSubscriptionModalOpen && (
          <SubscriptionModal
            isOpen={isSubscriptionModalOpen}
            onClose={() => setIsSubscriptionModalOpen(false)}
            reason={subscriptionReason}
          />
        )}

        {isWhatsAppPanchangOpen && (
          <WhatsAppPanchangModal
            isOpen={isWhatsAppPanchangOpen}
            onClose={() => setIsWhatsAppPanchangOpen(false)}
            panchang={panchang}
            location={currentLocation}
            currentDate={currentDate}
            personName={activeKundali?.name}
            onOpenBrandingModal={() => setIsBrandingModalOpen(true)}
          />
        )}

        {isBrandingModalOpen && (
          <AstrologerBrandingModal
            isOpen={isBrandingModalOpen}
            onClose={() => setIsBrandingModalOpen(false)}
          />
        )}

        {isUmaModalOpen && (
          <UmaAssistantModal
            isOpen={isUmaModalOpen}
            onClose={() => {
              setIsUmaModalOpen(false);
              setUmaInitialPrompt(null);
            }}
            panchang={panchang}
            activeKundali={activeKundali}
            onSelectKundali={(k) => setActiveKundali(k)}
            onNavigateTab={handleSelectTab}
            isAudioEnabled={isAudioEnabled}
            locationName={currentLocation.name}
            initialPrompt={umaInitialPrompt}
          />
        )}

        {isLocationModalOpen && (
          <LocationModal
            isOpen={isLocationModalOpen}
            onClose={() => setIsLocationModalOpen(false)}
            currentLocation={currentLocation}
            onSelectLocation={setCurrentLocation}
          />
        )}

        {isSavedProfilesModalOpen && (
          <SavedProfilesModal
            isOpen={isSavedProfilesModalOpen}
            onClose={() => setIsSavedProfilesModalOpen(false)}
            onSelectProfile={setActiveKundali}
          />
        )}

        {isReleaseNotesOpen && (
          <ReleaseNotesModal
            isOpen={isReleaseNotesOpen}
            onClose={() => setIsReleaseNotesOpen(false)}
            onNavigateTab={handleSelectTab}
            onOpenUma={() => setIsUmaModalOpen(true)}
          />
        )}
      </Suspense>
    </div>
    </TabMenuContext.Provider>
    </DrawerHostContext.Provider>
  );
}
export default App;

