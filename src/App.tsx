import { useState, useMemo, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { PanchangView } from './components/PanchangView';
import { ChoghadiyaView } from './components/ChoghadiyaView';
import { MuhuratView } from './components/MuhuratView';
import { YatraView } from './components/YatraView';
import { KundaliView } from './components/KundaliView';
import { FestivalsView } from './components/FestivalsView';
import { RemindersView } from './components/RemindersView';
import { UmaAssistantModal } from './components/UmaAssistantModal';
import { LocationModal } from './components/LocationModal';
import { SavedProfilesModal } from './components/SavedProfilesModal';
import { InstallAppModal } from './components/InstallAppModal';
import { SubscriptionModal } from './components/SubscriptionModal';
import { BookCover } from './components/BookCover';
import { PageFlipBook } from './components/PageFlipBook';
import { BookChapterPage, BookBackCover } from './components/BookChapterPage';
import { DEFAULT_LOCATION, getStoredLocation, purgePackagedDummyProfiles } from './services/storage';
import { calculateVedicPanchang } from './services/astronomy';
import { SavedLocation, KundaliData } from './types';
import { BOOK_PAGES, FLIP_BOOK_CHAPTERS } from './constants/bookPages';
import { Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';

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
    /* audio policy */
  }
}

export function App() {
  const [currentLocation, setCurrentLocation] = useState<SavedLocation>(DEFAULT_LOCATION);
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());
  const [activeTab, setActiveTab] = useState<string>('panchang');
  const [turnDirection, setTurnDirection] = useState<'forward' | 'backward'>('forward');
  const [pageTurnNotice, setPageTurnNotice] = useState<string | null>(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState<boolean>(true);
  const [isBookOpen, setIsBookOpen] = useState<boolean>(false);
  const [bookIndex, setBookIndex] = useState<number>(0);

  const [isLocationModalOpen, setIsLocationModalOpen] = useState<boolean>(false);
  const [isUmaModalOpen, setIsUmaModalOpen] = useState<boolean>(false);
  const [isSavedProfilesModalOpen, setIsSavedProfilesModalOpen] = useState<boolean>(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState<boolean>(false);
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState<boolean>(false);
  const [premiumReason, setPremiumReason] = useState<string>('');
  const [activeKundali, setActiveKundali] = useState<KundaliData | null>(null);
  const [calcRev, setCalcRev] = useState(0);

  useEffect(() => {
    setCurrentLocation(getStoredLocation());
    purgePackagedDummyProfiles();
  }, []);

  useEffect(() => {
    const bump = () => setCalcRev((n) => n + 1);
    window.addEventListener("shakti-calc-settings", bump);
    return () => window.removeEventListener("shakti-calc-settings", bump);
  }, []);

  const panchang = useMemo(
    () => calculateVedicPanchang(currentDate, currentLocation.latitude, currentLocation.longitude),
    [currentDate, currentLocation, calcRev]
  );

  const currentIndex = BOOK_PAGES.findIndex((p) => p.id === activeTab);
  const currentTabMeta = BOOK_PAGES[currentIndex] || BOOK_PAGES[0];
  const prevIndex = (currentIndex - 1 + BOOK_PAGES.length) % BOOK_PAGES.length;
  const nextIndex = (currentIndex + 1) % BOOK_PAGES.length;
  const prevTabMeta = BOOK_PAGES[prevIndex];
  const nextTabMeta = BOOK_PAGES[nextIndex];

  const notifyPageTurn = useCallback((pageTitle: string, pageNum: number) => {
    setPageTurnNotice(`📖 पृष्ठ ${pageNum} : ${pageTitle}`);
    const timer = setTimeout(() => setPageTurnNotice(null), 2000);
    return () => clearTimeout(timer);
  }, []);

  const handlePrevPage = useCallback(() => {
    setTurnDirection('backward');
    const prev = BOOK_PAGES[prevIndex];
    setActiveTab(prev.id);
    if (isAudioEnabled) playTactilePageTurnSound();
    notifyPageTurn(prev.label, prev.pageNumber);
  }, [prevIndex, isAudioEnabled, notifyPageTurn]);

  const handleNextPage = useCallback(() => {
    setTurnDirection('forward');
    const next = BOOK_PAGES[nextIndex];
    setActiveTab(next.id);
    if (isAudioEnabled) playTactilePageTurnSound();
    notifyPageTurn(next.label, next.pageNumber);
  }, [nextIndex, isAudioEnabled, notifyPageTurn]);

  const handleSelectTab = useCallback(
    (tabId: string) => {
      const targetIdx = BOOK_PAGES.findIndex((p) => p.id === tabId);
      if (targetIdx !== -1) {
        setTurnDirection(targetIdx >= currentIndex ? 'forward' : 'backward');
        const target = BOOK_PAGES[targetIdx];
        setActiveTab(target.id);
        setIsBookOpen(true);
        const flipIdx = FLIP_BOOK_CHAPTERS.findIndex((p) => p.id === tabId);
        setBookIndex(flipIdx >= 0 ? flipIdx + 1 : 1);
        if (isAudioEnabled) playTactilePageTurnSound();
        notifyPageTurn(target.label, target.pageNumber);
      } else {
        setActiveTab(tabId);
      }
    },
    [currentIndex, isAudioEnabled, notifyPageTurn]
  );

  const bookPages = useMemo(
    () => [
      <BookCover
        key="cover"
        onOpenBook={(targetTabId) => {
          if (targetTabId) {
            handleSelectTab(targetTabId);
            return;
          }
          setBookIndex(1);
          if (isAudioEnabled) playTactilePageTurnSound();
        }}
        currentLocationName={currentLocation.name}
        onOpenLocation={() => setIsLocationModalOpen(true)}
        onOpenUma={() => setIsUmaModalOpen(true)}
        onOpenPremium={() => {
          setPremiumReason('');
          setIsPremiumModalOpen(true);
        }}
      />,
      ...FLIP_BOOK_CHAPTERS.map((page) => (
        <BookChapterPage
          key={page.id}
          page={page}
          onOpenChapter={() => handleSelectTab(page.id)}
          onOpenUma={() => setIsUmaModalOpen(true)}
        />
      )),
      <BookBackCover key="back" onOpenUma={() => setIsUmaModalOpen(true)} />,
    ],
    [currentLocation.name, handleSelectTab, isAudioEnabled]
  );

  return (
    <div className="h-dvh max-h-dvh bg-[#F4E8D1] text-[#3E2714] flex flex-col font-sans selection:bg-[#B56A00] selection:text-white overflow-hidden">
      <Navbar
        currentLocation={currentLocation}
        currentDate={currentDate}
        onDateChange={setCurrentDate}
        onOpenLocationModal={() => setIsLocationModalOpen(true)}
        onOpenUmaModal={() => setIsUmaModalOpen(true)}
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
        onOpenPremium={() => {
          setPremiumReason('');
          setIsPremiumModalOpen(true);
        }}
        activeTab={activeTab}
        setActiveTab={handleSelectTab}
        isAudioEnabled={isAudioEnabled}
        setIsAudioEnabled={setIsAudioEnabled}
        onPrevPage={handlePrevPage}
        onNextPage={handleNextPage}
        isBookOpen={isBookOpen}
        onToggleBookOpen={() => {
          if (isBookOpen) {
            setIsBookOpen(false);
          } else {
            setBookIndex(1);
          }
          if (isAudioEnabled) playTactilePageTurnSound();
        }}
      />

      {pageTurnNotice && (
        <div className="fixed top-14 sm:top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-in fade-in zoom-in-95 duration-200">
          <div className="px-4 py-2 bg-[#2C180C]/95 text-[#FAF2E4] border-2 border-[#B56A00] rounded-full shadow-2xl text-xs sm:text-sm font-bold font-granth flex items-center gap-2">
            <span className="text-[#FFD88A]">✦</span>
            <span>{pageTurnNotice}</span>
            <span className="text-[#FFD88A]">✦</span>
          </div>
        </div>
      )}

      <main className="flex-1 min-h-0 w-full max-w-7xl mx-auto flex flex-col overflow-hidden">
        {!isBookOpen ? (
          <PageFlipBook
            pages={bookPages}
            index={bookIndex}
            onIndexChange={setBookIndex}
            onTurn={() => {
              if (isAudioEnabled) playTactilePageTurnSound();
            }}
          />
        ) : (
          <div className="flex-1 min-h-0 flex flex-col bg-[#FFFBF4]">
            <div className="shrink-0 flex items-center gap-2 px-3 py-2.5 bg-[#5C3A21] text-white">
              <button
                type="button"
                onClick={() => {
                  setIsBookOpen(false);
                  if (isAudioEnabled) playTactilePageTurnSound();
                }}
                className="min-h-10 min-w-10 rounded-full flex items-center justify-center hover:bg-white/10"
                aria-label="ग्रंथ में लौटें"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <h2 className="font-black text-base sm:text-lg truncate">
                {currentTabMeta.screenTitle || currentTabMeta.label}
              </h2>
            </div>
            <div key={activeTab} className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-4">
              {activeTab === 'panchang' && (
                <PanchangView
                  panchang={panchang}
                  onNavigateTab={handleSelectTab}
                  onOpenUmaModal={() => setIsUmaModalOpen(true)}
                  onOpenPremium={(reason) => {
                    setPremiumReason(reason || '');
                    setIsPremiumModalOpen(true);
                  }}
                  locationName={currentLocation.name}
                />
              )}
              {activeTab === 'choghadiya' && <ChoghadiyaView panchang={panchang} />}
              {activeTab === 'muhurat' && <MuhuratView panchang={panchang} />}
              {activeTab === 'yatra' && <YatraView panchang={panchang} currentLocation={currentLocation} />}
              {(activeTab === 'kundali' || activeTab === 'milan') && (
                <KundaliView
                  activeKundali={activeKundali}
                  setActiveKundali={setActiveKundali}
                  currentLocation={currentLocation}
                  initialSubTab={activeTab === 'milan' ? 'milan' : undefined}
                  onOpenSavedModal={() => setIsSavedProfilesModalOpen(true)}
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
              {activeTab === 'reminders' && <RemindersView />}
            </div>
          </div>
        )}
      </main>

      {isBookOpen && (
        <aside aria-label="Floating Vedic Assistant" className="hidden sm:block fixed bottom-3 right-3 z-30">
          <button
            onClick={() => setIsUmaModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-temple hover:bg-temple-deep text-parchment border border-gold rounded-full shadow-lg"
          >
            <Sparkles className="w-4 h-4 text-gold-bright" />
            <span className="text-xs font-bold font-granth">उमा</span>
          </button>
        </aside>
      )}

      <UmaAssistantModal
        isOpen={isUmaModalOpen}
        onClose={() => setIsUmaModalOpen(false)}
        panchang={panchang}
        activeKundali={activeKundali}
        onNavigateTab={handleSelectTab}
        isAudioEnabled={isAudioEnabled}
        locationName={currentLocation.name}
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
      <InstallAppModal isOpen={isInstallModalOpen} onClose={() => setIsInstallModalOpen(false)} />
      <SubscriptionModal
        isOpen={isPremiumModalOpen}
        onClose={() => setIsPremiumModalOpen(false)}
        reason={premiumReason}
      />
    </div>
  );
}

export default App;
