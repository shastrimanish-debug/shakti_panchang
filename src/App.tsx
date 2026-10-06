import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { PanchangView } from './components/PanchangView';
import { ChoghadiyaView } from './components/ChoghadiyaView';
import { MuhuratView } from './components/MuhuratView';
import { YatraView } from './components/YatraView';
import { KundaliView } from './components/KundaliView';
import { FestivalsView } from './components/FestivalsView';
import { RemindersView } from './components/RemindersView';
import { VratKathaView } from './components/VratKathaView';
import { DurgaSaptashatiView } from './components/DurgaSaptashatiView';
import { VastuView } from './components/VastuView';
import { UpayView } from './components/UpayView';
import { NumerologyView } from './components/NumerologyView';
import { PalmistryView } from './components/PalmistryView';
import { TarotView } from './components/TarotView';
import { GemologyView } from './components/GemologyView';
import { FaceReadingView } from './components/FaceReadingView';
import { IChingView } from './components/IChingView';
import { GranthIndexView } from './components/GranthIndexView';
import { DailyRashifalView } from './components/DailyRashifalView';
import { DailyGitaShlokaView } from './components/DailyGitaShlokaView';
import { WhatsAppPanchangModal } from './components/WhatsAppPanchangModal';
import { AstrologerBrandingModal } from './components/AstrologerBrandingModal';
import { UmaAssistantModal } from './components/UmaAssistantModal';
import { LocationModal } from './components/LocationModal';
import { SavedProfilesModal } from './components/SavedProfilesModal';
import { BookCover } from './components/BookCover';
import { OfflineIndicator } from './components/OfflineIndicator';
import { getStoredLocation, getSavedKundaliProfiles, getStoredTheme, setStoredTheme, AppTheme } from './services/storage';
import { calculateVedicPanchang } from './services/astronomy';
import { scheduleMorningBriefs } from './services/morningBrief';
import { calculateKundali } from './services/kundali';
import { SavedLocation, KundaliData } from './types';
import { BOOK_PAGES, getLocalizedBookPage } from './constants/bookPages';
import { BottomNavBar } from './components/BottomNavBar';
import { MoreMenuModal } from './components/MoreMenuModal';
import { SubscriptionModal } from './components/SubscriptionModal';
import { LanguageSelectorModal } from './components/LanguageSelectorModal';
import { useLicense } from './lib/license-client';
import { useTranslation, useLanguage } from './i18n';
import { getLocalizedDailyShloka, SHLOKAS } from './constants/shlokas';
import {
  Sparkles,
  BookOpen,
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

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
  const [isMoreModalOpen, setIsMoreModalOpen] = useState<boolean>(false);

  // Apply Theme (Shvet-Clean Light, Tamra-Ratri Dark, or Bhojpatra Parchment)
  useEffect(() => {
    setStoredTheme(theme);
    if (typeof document !== 'undefined') {
      document.body.classList.remove('tamra-theme', 'shvet-theme');
      if (theme === 'tamra') {
        document.body.classList.add('tamra-theme');
      } else if (theme === 'shvet') {
        document.body.classList.add('shvet-theme');
      }
    }
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) => {
      if (prev === 'shvet') return 'tamra';
      if (prev === 'tamra') return 'bhojpatra';
      return 'shvet';
    });
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
  const [subscriptionReason, setSubscriptionReason] = useState<string>('');
  const { t } = useTranslation();
  const { language: currentLang, setLanguage } = useLanguage();

  // Strict Subscription & Anti-Mod State
  const { status: licenseStatus } = useLicense();
  const isEntitled = licenseStatus.entitled;

  // Purge any demo or default profiles (Akshita, Manish, etc.) on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem('shakti_saved_kundali_profiles_v1');
      if (raw) {
        const arr = JSON.parse(raw);
        const clean = arr.filter(
          (p: any) => 
            !p.name?.includes('मनीष') && 
            !p.name?.includes('Manish') && 
            !p.name?.includes('अक्षिता') && 
            !p.name?.includes('Akshita') && 
            !p.birthPlace?.includes('बुरहानपुर')
        );
        if (clean.length !== arr.length) {
          localStorage.setItem('shakti_saved_kundali_profiles_v1', JSON.stringify(clean));
        }
      }
    } catch {}
  }, []);

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
    if (!isEntitled && activeTab !== 'panchang') {
      setActiveTab('panchang');
    }
  }, [isEntitled, activeTab]);

  // Active Kundali Profile - clean profile state without hardcoded defaults
  const [activeKundali, setActiveKundali] = useState<KundaliData | null>(() => {
    const saved = getSavedKundaliProfiles();
    const cleanSaved = saved.filter(
      (p) => 
        !p.name.includes('मनीष') && 
        !p.name.includes('Manish') && 
        !p.name.includes('अक्षिता') && 
        !p.name.includes('Akshita') && 
        !p.birthPlace.includes('बुरहानपुर')
    );
    return cleanSaved.length > 0 ? cleanSaved[0] : null;
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
    setTurnDirection('forward');
    const next = getLocalizedBookPage(BOOK_PAGES[nextIndex], currentLang);
    setActiveTab(next.id);
    if (isAudioEnabled) playTactilePageTurnSound();
    notifyPageTurn(next.label, next.pageNumber);
  }, [nextIndex, isAudioEnabled, notifyPageTurn, isEntitled, triggerSubscriptionModal, currentLang]);

  // Navigate directly to a tab
  const handleSelectTab = useCallback(
    (tabId: string) => {
      setIsBookOpen(true);
      // STRICT ANTI-MOD & SUBSCRIPTION ENFORCEMENT:
      // If trial has expired and user is not subscribed, ONLY 'panchang' tab is accessible!
      if (!isEntitled && tabId !== 'panchang') {
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
          upay: 'ग्रह शांति व चमत्कारी उपाय',
          vastu: 'वैदिक वास्तु शास्त्र',
        };
        const name = featureNames[tabId] || 'यह अध्याय';
        triggerSubscriptionModal(
          `७-दिवसीय निःशुल्क परीक्षण पूर्ण हो चुका है। केवल पंचांग मुख्य पृष्ठ फ्री है। ${name} देखने के लिए वार्षिक सदस्यता (₹99/वर्ष) सक्रिय करें।`
        );
        return;
      }

      const targetIdx = BOOK_PAGES.findIndex((p) => p.id === tabId);
      if (targetIdx !== -1) {
        setTurnDirection(targetIdx >= currentIndex ? 'forward' : 'backward');
        const target = BOOK_PAGES[targetIdx];
        setActiveTab(target.id);
        if (isAudioEnabled) playTactilePageTurnSound();
        notifyPageTurn(target.label, target.pageNumber);
      } else {
        setActiveTab(tabId);
      }
    },
    [currentIndex, isAudioEnabled, notifyPageTurn, isEntitled, triggerSubscriptionModal]
  );

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

  if (!isEntitled) {
    return (
      <SubscriptionModal
        isOpen
        locked
        onClose={() => {}}
        reason="७ दिन का परीक्षण समाप्त। ₹99 की सदस्यता के बिना यह ऐप बंद है।"
      />
    );
  }

  return (
    <div key={`app-root-${currentLang}`} className="min-h-screen w-full max-w-full overflow-x-hidden relative flutter-scaffold-bg text-[#3E2714] flex flex-col font-sans selection:bg-[#B56A00] selection:text-white">
      {/* PWA Network Offline Status Bar */}
      <OfflineIndicator />
      {/* Heritage Top Navigation Bar with Page Flip Controls */}
      <Navbar
        key={`navbar-${currentLang}`}
        currentLocation={currentLocation}
        currentDate={currentDate}
        onDateChange={setCurrentDate}
        onOpenLocationModal={() => setIsLocationModalOpen(true)}
        onOpenUmaModal={() => setIsUmaModalOpen(true)}
        onOpenLanguageModal={() => setIsLanguageModalOpen(true)}
        activeTab={activeTab}
        setActiveTab={handleSelectTab}
        isAudioEnabled={isAudioEnabled}
        setIsAudioEnabled={setIsAudioEnabled}
        onPrevPage={handlePrevPage}
        onNextPage={handleNextPage}
        isBookOpen={isBookOpen}
        onToggleBookOpen={() => {
          setIsBookOpen(!isBookOpen);
          if (isAudioEnabled) playTactilePageTurnSound();
        }}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {licenseStatus.kind === "trial" && (
        <div className="bg-[#B56A00] text-white text-center text-xs font-bold py-1.5 px-3 shadow-xs select-none">
          {t('trial.banner', { days: licenseStatus.daysRemaining, defaultValue: `परीक्षण: ${licenseStatus.daysRemaining} दिन शेष।` })}
        </div>
      )}

      {/* Floating Page Turn Toast Notice */}
      {pageTurnNotice && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-in fade-in zoom-in-95 duration-200">
          <div className="px-4 py-2 bg-[#2C180C]/95 text-[#FAF2E4] border border-amber-500/50 rounded-full shadow-2xl text-xs sm:text-sm font-bold font-granth flex items-center gap-2 backdrop-blur-md">
            <span className="text-amber-300">✦</span>
            <span>{pageTurnNotice}</span>
            <span className="text-amber-300">✦</span>
          </div>
        </div>
      )}

      {/* Main Vedic Content Presentation Area (Mobile Fit & Responsive) */}
      <main className="flex-1 w-full max-w-md sm:max-w-xl md:max-w-4xl mx-auto px-2 sm:px-4 py-2 pb-40 sm:pb-36 min-w-0 overflow-x-hidden">
        {!isBookOpen ? (
          <BookCover
            onOpenIndex={() => {
              setIsBookOpen(true);
              setActiveTab('index');
              if (isAudioEnabled) playTactilePageTurnSound();
            }}
            onOpenBook={(targetTabId) => {
              setIsBookOpen(true);
              if (targetTabId) {
                handleSelectTab(targetTabId);
              }
              if (isAudioEnabled) playTactilePageTurnSound();
            }}
            currentLocationName={currentLocation.name}
            onOpenLocation={() => setIsLocationModalOpen(true)}
            onOpenUma={() => {
              setIsUmaModalOpen(true);
            }}
            onOpenPremium={() => {
              triggerSubscriptionModal();
            }}
          />
        ) : (
          /* Modern Material 3 Glassmorphic Card Container */
          <div className="w-full min-w-0 overflow-x-hidden flutter-card p-3 sm:p-5 relative shadow-xs border border-[#EADBCC]">
            {/* Desktop Chapter Title Ribbon (Hidden on mobile to maximize screen fit) */}
            <div className="hidden sm:flex items-center justify-between gap-2 pb-2 mb-2 border-b border-[#8C6239]/20 text-[#5C3A21] text-xs">
              <div className="flex items-center gap-1.5 font-bold">
                <span className="text-sm text-[#B56A00] font-black">ॐ</span>
                <span className="font-granth">{currentTabMeta.chapter}: {currentTabMeta.title}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-[#8C6239]">
                  📖 {t('book.page', 'पृष्ठ')} {currentTabMeta.pageNumber} / {BOOK_PAGES.length}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setIsBookOpen(false);
                    if (isAudioEnabled) playTactilePageTurnSound();
                  }}
                  className="px-2 py-0.5 bg-[#8C6239] hover:bg-[#5C3A21] text-[#FAF2E4] rounded text-[11px] font-bold transition cursor-pointer flex items-center gap-1 shadow-xs"
                  title={t('book.openCoverTitle', 'ग्रन्थ मुखपृष्ठ खोलें')}
                >
                  <span>📕 {t('book.coverBtn', 'मुखपृष्ठ')}</span>
                </button>
              </div>
            </div>

            {/* Main Active Page View */}
            <div
              key={`${activeTab}-${currentLang}`}
              className={`w-full min-w-0 overflow-x-hidden ${
                turnDirection === 'forward'
                  ? 'book-page-turn-forward'
                  : 'book-page-turn-backward'
              }`}
            >
              {activeTab === 'index' && (
                <GranthIndexView
                  onSelectTab={handleSelectTab}
                  onReturnToCover={() => setIsBookOpen(false)}
                />
              )}

              {activeTab === 'panchang' && (
                <PanchangView
                  panchang={panchang}
                  onNavigateTab={handleSelectTab}
                  onOpenUmaModal={(query?: string) => {
                    if (query) setUmaInitialPrompt(query);
                    setIsUmaModalOpen(true);
                  }}
                  onOpenWhatsAppPanchang={() => {
                    setIsWhatsAppPanchangOpen(true);
                  }}
                  onOpenSubscriptionModal={triggerSubscriptionModal}
                  locationName={currentLocation.name}
                  currentDate={currentDate}
                  onDateChange={setCurrentDate}
                  onOpenLocationModal={() => setIsLocationModalOpen(true)}
                  latitude={currentLocation.latitude}
                  longitude={currentLocation.longitude}
                  timezoneHours={currentLocation.timezoneHours}
                />
              )}

              {activeTab === 'choghadiya' && (
                <ChoghadiyaView panchang={panchang} />
              )}

              {activeTab === 'muhurat' && (
                <MuhuratView panchang={panchang} />
              )}

              {activeTab === 'yatra' && (
                <YatraView panchang={panchang} currentLocation={currentLocation} />
              )}

              {(activeTab === 'kundali' || activeTab === 'milan') && (
                <KundaliView
                  activeKundali={activeKundali}
                  setActiveKundali={setActiveKundali}
                  currentLocation={currentLocation}
                  initialSubTab={activeTab === 'milan' ? 'milan' : undefined}
                  onOpenSavedModal={() => setIsSavedProfilesModalOpen(true)}
                  onOpenUmaModal={() => setIsUmaModalOpen(true)}
                  onOpenBrandingModal={() => setIsBrandingModalOpen(true)}
                />
              )}

              {activeTab === 'festivals' && (
                <FestivalsView
                  currentDate={currentDate}
                  onNavigateToReminders={() => handleSelectTab('reminders')}
                  onDateSelect={(d) => {
                    setCurrentDate(d);
                    handleSelectTab('panchang');
                  }}
                />
              )}

              {activeTab === 'reminders' && (
                <RemindersView />
              )}

              {activeTab === 'vratkatha' && (
                <VratKathaView onBackToPanchang={() => handleSelectTab('panchang')} />
              )}

              {activeTab === 'rashifal' && (
                <DailyRashifalView
                  personName={activeKundali?.name}
                  lagnaRashi={activeKundali?.lagnaRashi}
                />
              )}

              {activeTab === 'gita' && (
                <DailyGitaShlokaView />
              )}

              {activeTab === 'vastu' && (
                <VastuView />
              )}

              {activeTab === 'durga' && (
                <DurgaSaptashatiView />
              )}

              {activeTab === 'upay' && (
                <UpayView
                  activeKundali={activeKundali}
                  onOpenKundaliTab={() => handleSelectTab('kundali')}
                  onOpenUmaWithQuery={(query) => {
                    setUmaInitialPrompt(query);
                    setIsUmaModalOpen(true);
                  }}
                />
              )}

              {activeTab === 'numerology' && (
                <NumerologyView
                  activeKundali={activeKundali}
                  onOpenKundaliTab={() => handleSelectTab('kundali')}
                  onOpenUmaWithQuery={(query) => {
                    setUmaInitialPrompt(query);
                    setIsUmaModalOpen(true);
                  }}
                />
              )}

              {activeTab === 'palmistry' && (
                <PalmistryView
                  onOpenUmaWithQuery={(query) => {
                    setUmaInitialPrompt(query);
                    setIsUmaModalOpen(true);
                  }}
                />
              )}

              {activeTab === 'tarot' && (
                <TarotView
                  onOpenUmaWithQuery={(query) => {
                    setUmaInitialPrompt(query);
                    setIsUmaModalOpen(true);
                  }}
                />
              )}

              {activeTab === 'gemology' && (
                <GemologyView
                  onOpenUmaWithQuery={(query) => {
                    setUmaInitialPrompt(query);
                    setIsUmaModalOpen(true);
                  }}
                />
              )}

              {activeTab === 'face_reading' && (
                <FaceReadingView
                  onOpenUmaWithQuery={(query) => {
                    setUmaInitialPrompt(query);
                    setIsUmaModalOpen(true);
                  }}
                />
              )}

              {activeTab === 'iching' && (
                <IChingView
                  onOpenUmaWithQuery={(query) => {
                    setUmaInitialPrompt(query);
                    setIsUmaModalOpen(true);
                  }}
                />
              )}
            </div>

            {/* Sacred Granth Page Navigation Footer (Visible on both Mobile and Desktop) */}
            <div className="flex mt-5 pt-3 border-t border-[#8C6239]/30 items-center justify-between text-xs select-none">
              <button
                type="button"
                onClick={handlePrevPage}
                className="flex items-center gap-1 px-3 py-1.5 bg-[#FAF2E4] hover:bg-[#EBD8BD] text-[#2C1810] border border-[#8C6239]/40 rounded-xl font-bold transition cursor-pointer text-xs active:scale-95 shadow-xs m3-touch"
                title={`${t('common.prev', 'पिछला')}: ${prevTabMeta.label}`}
              >
                <ChevronLeft className="w-4 h-4 text-[#B56A00]" />
                <span>‹ {t('common.prev', 'पिछला')} ({prevTabMeta.label})</span>
              </button>

              <div className="font-granth text-xs font-bold text-[#8C6239] text-center px-1">
                <span>{t('book.page', 'पृष्ठ')} {currentTabMeta.pageNumber} / {BOOK_PAGES.length}</span>
                <span className="text-[#B56A00] font-normal block sm:inline sm:ml-1.5">• {currentTabMeta.label}</span>
              </div>

              <button
                type="button"
                onClick={handleNextPage}
                className="flex items-center gap-1 px-3 py-1.5 bg-[#5C3A21] hover:bg-[#462B17] text-[#FAF2E4] border border-[#B56A00] rounded-xl font-bold transition cursor-pointer text-xs active:scale-95 shadow-xs m3-touch"
                title={`${t('common.next', 'अगला')}: ${nextTabMeta.label}`}
              >
                <span>{t('common.next', 'अगला')} ({nextTabMeta.label}) ›</span>
                <ChevronRight className="w-4 h-4 text-[#FFD88A]" />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Floating UMA Assistant FAB */}
      <aside aria-label="Floating Vedic Assistant" className="hidden sm:block fixed bottom-8 right-8 z-30">
        <button
          onClick={() => {
            setIsUmaModalOpen(true);
          }}
          className="flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 hover:from-amber-600 hover:to-yellow-500 text-stone-950 font-black rounded-full shadow-[0_6px_25px_rgba(245,158,11,0.5)] transition transform hover:scale-105 active:scale-95 group cursor-pointer uma-glow-badge m3-touch border-2 border-white/60"
        >
          <div className="relative flex items-center justify-center w-6 h-6 rounded-full bg-stone-950 text-amber-400">
            <Sparkles className="w-3.5 h-3.5 fill-amber-400 group-hover:rotate-12 transition-transform" />
          </div>
          <span className="text-xs font-black tracking-wide pr-1">
            {t('uma.title', 'उमा परामर्श')} ✨
          </span>
        </button>
      </aside>

      {/* Traditional Bhojpatra Footer (Compact with bottom padding for mobile navigation bar) */}
      <footer className="bg-[#F5ECE0] text-[#5C3A21] border-t border-[#DFCBB5] py-4 px-3 mb-24 sm:mb-8 text-center text-xs space-y-1 select-none">
        <div className="font-granth text-xs sm:text-sm text-[#2C180C] font-black tracking-wide">
          {t('footer.shloka', '॥ ॐ सर्वे भवन्तु सुखिनः सर्वे सन्तु निरामयाः ॥')}
        </div>
        <p className="text-[11px] text-[#6E472A] font-medium max-w-xl mx-auto">
          {getLocalizedDailyShloka(SHLOKAS.find((item) => item.id === 6) ?? SHLOKAS[0], currentLang).meaning}
        </p>
        <p className="text-[11px] text-[#6E472A] font-medium">
          {t('footer.tagline', 'शक्ति पंचांग • प्रामाणिक वैदिक खगोलशास्त्र एवं ज्योतिषीय पंचांग ग्रन्थ')}
        </p>
        <p className="text-[10px] text-[#8C4A00] font-semibold">
          {t('footer.calcMethod', 'गणना: सूर्य सिद्धान्त एवं लाहिरी अयनांश')} • {t('panchang.location', 'स्थान')}: {currentLocation.name}
        </p>
      </footer>

      {/* Flutter-style Mobile Bottom Navigation Bar */}
      <BottomNavBar
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        onOpenMore={() => setIsMoreModalOpen(true)}
        onOpenUma={() => setIsUmaModalOpen(true)}
      />

      {/* More Options Sheet / Modal */}
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
            triggerSubscriptionModal("व्हाट्सएप सुप्रभात पंचांग कार्ड हेतु वार्षिक सदस्यता सक्रिय करें।");
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
        isAudioEnabled={isAudioEnabled}
        onToggleAudio={() => setIsAudioEnabled(!isAudioEnabled)}
      />

      {/* Language Selector Modal (10+ Languages) */}
      <LanguageSelectorModal
        isOpen={isLanguageModalOpen}
        onClose={() => setIsLanguageModalOpen(false)}
        onLanguageSelected={async (lang) => {
          await setLanguage(lang.code);
        }}
      />

      {/* Subscription & VIP Activation Modal */}
      <SubscriptionModal
        isOpen={isSubscriptionModalOpen}
        onClose={() => setIsSubscriptionModalOpen(false)}
        reason={subscriptionReason}
      />

      {/* WhatsApp Daily Panchang Card Generator Modal */}
      <WhatsAppPanchangModal
        isOpen={isWhatsAppPanchangOpen}
        onClose={() => setIsWhatsAppPanchangOpen(false)}
        panchang={panchang}
        location={currentLocation}
        currentDate={currentDate}
        personName={activeKundali?.name}
        onOpenBrandingModal={() => setIsBrandingModalOpen(true)}
      />

      {/* Astrologer / Pandit Custom Visiting Card Branding Modal */}
      <AstrologerBrandingModal
        isOpen={isBrandingModalOpen}
        onClose={() => setIsBrandingModalOpen(false)}
      />

      {/* Dialog Modals */}
      <UmaAssistantModal
        isOpen={isUmaModalOpen}
        onClose={() => {
          setIsUmaModalOpen(false);
          setUmaInitialPrompt(null);
        }}
        panchang={panchang}
        activeKundali={activeKundali}
        onNavigateTab={handleSelectTab}
        isAudioEnabled={isAudioEnabled}
        locationName={currentLocation.name}
        initialPrompt={umaInitialPrompt}
      />

      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        currentLocation={currentLocation}
        onSelectLocation={setCurrentLocation}
      />

      <SavedProfilesModal
        isOpen={isSavedProfilesModalOpen}
        onClose={() => setIsSavedProfilesModalOpen(false)}
        onSelectProfile={setActiveKundali}
      />
    </div>
  );
}
export default App;

