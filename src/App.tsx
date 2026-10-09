import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
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
import { ZeroScrollPager } from './components/ZeroScrollPager';
import { MoreMenuModal } from './components/MoreMenuModal';
import { ThemeSelectorModal } from './components/ThemeSelectorModal';
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
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [turnDirection, setTurnDirection] = useState<'forward' | 'backward'>('forward');
  const [pageTurnNotice, setPageTurnNotice] = useState<string | null>(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState<boolean>(true);
  const [theme, setTheme] = useState<AppTheme>(() => getStoredTheme());
  // Book open/closed state (true: showing Panchang content directly on startup)
  const [isBookOpen, setIsBookOpen] = useState<boolean>(true);
  const [isMoreModalOpen, setIsMoreModalOpen] = useState<boolean>(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState<boolean>(false);

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
          `७-दिवसीय निःशुल्क परीक्षण पूर्ण हो चुका है। केवल पंचांग मुख्य पृष्ठ फ्री है। ${name} देखने के लिए आजीवन VIP सदस्यता (₹99 / $1) सक्रिय करें।`
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
        reason="७ दिन का निःशुल्क परीक्षण समाप्त। ₹99 / $1 की आजीवन सदस्यता के बिना यह ऐप बंद है।"
      />
    );
  }

  return (
    <div key={`app-root-${currentLang}`} className="h-dvh w-screen overflow-hidden relative flutter-scaffold-bg text-[#3E2714] flex flex-col font-sans selection:bg-[#B56A00] selection:text-white">
      {/* PWA Network Offline Status Bar */}
      <OfflineIndicator />
      {/* Compact Header Group: Navbar + Trial Banner */}
      <div className="shrink-0 z-40 w-full bg-[#FFFDF9]/98 shadow-2xs">
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
          onOpenThemeModal={() => setIsThemeModalOpen(true)}
        />

        {licenseStatus.kind === "trial" && (
          <div className="bg-[#B56A00] text-white text-center text-[10px] font-bold py-0.5 px-2 shadow-2xs select-none">
            {t('trial.banner', { days: licenseStatus.daysRemaining, defaultValue: `परीक्षण: ${licenseStatus.daysRemaining} दिन शेष।` })}
          </div>
        )}
      </div>

      {/* Floating Page Turn Toast Notice */}
      {pageTurnNotice && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-in fade-in zoom-in-95 duration-200">
          <div className="px-3 py-1 bg-[#2C180C]/95 text-[#FAF2E4] border border-amber-500/50 rounded-full shadow-2xl text-xs font-bold font-granth flex items-center gap-1.5 backdrop-blur-md">
            <span className="text-amber-300">✦</span>
            <span>{pageTurnNotice}</span>
            <span className="text-amber-300">✦</span>
          </div>
        </div>
      )}

      {/* Main Responsive View Container with Smooth Vertical Scrolling */}
      <main className="flex-1 min-h-0 w-full relative flex flex-col overflow-hidden bg-[#FCF8EC]">
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
          <div
            key={`${activeTab}-${currentLang}`}
            className="flex-1 min-h-0 w-full flex flex-col overflow-hidden bg-[#FCF8EC]"
          >
            {activeTab === 'index' && (
              <div className="flex-1 min-h-0 w-full flex flex-col overflow-hidden bg-[#FCF8EC]">
                <GranthIndexView
                  onSelectTab={handleSelectTab}
                  onReturnToCover={() => setIsBookOpen(false)}
                />
              </div>
            )}

            {activeTab === 'dashboard' && (
              <ZeroScrollPager className="flex-1 min-h-0 w-full bg-[#FCF8EC]" resetKey={`dashboard-${currentLang}`}>
                <DashboardView
                  panchang={panchang}
                  currentLocation={currentLocation}
                  currentDate={currentDate}
                  onDateChange={setCurrentDate}
                  onNavigateTab={handleSelectTab}
                  onOpenUma={(query?: string) => {
                    if (query) setUmaInitialPrompt(query);
                    setIsUmaModalOpen(true);
                  }}
                  onOpenConnect={() => setIsBrandingModalOpen(true)}
                  onOpenLocationModal={() => setIsLocationModalOpen(true)}
                  onOpenWhatsAppPanchang={() => setIsWhatsAppPanchangOpen(true)}
                />
              </ZeroScrollPager>
            )}

            {activeTab === 'panchang' && (
              <div className="flex-1 min-h-0 w-full flex flex-col overflow-hidden bg-[#FCF8EC]">
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
                  onPrevChapter={handlePrevPage}
                  onNextChapter={handleNextPage}
                />
              </div>
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

            {(activeTab === 'kundali' || activeTab === 'milan') && (
              <ZeroScrollPager className="flex-1 min-h-0 w-full bg-[#FCF8EC]" resetKey={`${activeTab}-${currentLang}`}>
                <div className="w-full px-1 sm:px-2">
                <KundaliView
                  activeKundali={activeKundali}
                  setActiveKundali={setActiveKundali}
                  currentLocation={currentLocation}
                  initialSubTab={activeTab === 'milan' ? 'milan' : undefined}
                  onOpenSavedModal={() => setIsSavedProfilesModalOpen(true)}
                  onOpenUmaModal={() => setIsUmaModalOpen(true)}
                  onOpenBrandingModal={() => setIsBrandingModalOpen(true)}
                />
                </div>
              </ZeroScrollPager>
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

            {activeTab === 'upay' && (
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
          </div>
        )}
      </main>

      {/* Floating UMA Assistant FAB */}
      <aside aria-label="Floating Vedic Assistant" className="hidden sm:block fixed bottom-14 right-6 z-30">
        <button
          onClick={() => {
            setIsUmaModalOpen(true);
          }}
          className="flex items-center gap-2 px-3.5 py-2.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 hover:from-amber-600 hover:to-yellow-500 text-stone-950 font-black rounded-full shadow-[0_4px_20px_rgba(245,158,11,0.5)] transition transform hover:scale-105 active:scale-95 group cursor-pointer uma-glow-badge m3-touch border-2 border-white/60"
        >
          <div className="relative flex items-center justify-center w-5 h-5 rounded-full bg-stone-950 text-amber-400">
            <Sparkles className="w-3 h-3 fill-amber-400 group-hover:rotate-12 transition-transform" />
          </div>
          <span className="text-xs font-black tracking-wide pr-1">
            {t('uma.title', 'उमा')} ✨
          </span>
        </button>
      </aside>

      {/* Flutter-style Mobile Bottom Navigation Bar (Docked at Bottom) */}
      <div className="shrink-0 z-40 w-full">
        <BottomNavBar
          activeTab={activeTab}
          onSelectTab={handleSelectTab}
          onOpenMore={() => setIsMoreModalOpen(true)}
          onOpenUma={() => setIsUmaModalOpen(true)}
          currentDate={currentDate}
        />
      </div>

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
      />

      {/* Devotional Light & Ratri Theme Selector Modal (8+ Themes) */}
      <ThemeSelectorModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
        activeTheme={theme}
        onSelectTheme={(newTheme) => {
          setTheme(newTheme);
          setIsThemeModalOpen(false);
        }}
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

