import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
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
import { BookCover } from './components/BookCover';
import { getStoredLocation, getSavedKundaliProfiles } from './services/storage';
import { calculateVedicPanchang } from './services/astronomy';
import { calculateKundali } from './services/kundali';
import { SavedLocation, KundaliData } from './types';
import { BOOK_PAGES } from './constants/bookPages';
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
  // Book open/closed state (true: showing open pages; false: showing sacred hardbound book cover)
  const [isBookOpen, setIsBookOpen] = useState<boolean>(true);

  // Modals state
  const [isLocationModalOpen, setIsLocationModalOpen] = useState<boolean>(false);
  const [isUmaModalOpen, setIsUmaModalOpen] = useState<boolean>(false);
  const [isSavedProfilesModalOpen, setIsSavedProfilesModalOpen] = useState<boolean>(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState<boolean>(false);

  // Active Kundali Profile - default to Manish (29/05/1974 15:45 Burhanpur, MP)
  const [activeKundali, setActiveKundali] = useState<KundaliData | null>(() => {
    const saved = getSavedKundaliProfiles();
    const manishProfile = saved.find((p) => p.name.includes('मनीष') || p.birthPlace.includes('बुरहानपुर'));
    // If the saved profile for Manish was calculated with the older engine (e.g. Cancer Lagna or missing pratyantars), recalculate!
    if (manishProfile && manishProfile.lagnaRashi === 'तुला' && manishProfile.pratyantardasha) {
      return manishProfile;
    }
    if (saved && saved.length > 0 && !manishProfile) return saved[0];
    return calculateKundali(
      'मनीष (Manish)',
      new Date(1974, 4, 29),
      '15:45',
      'बुरहानपुर (Burhanpur)',
      21.3142,
      76.2298,
      5.5
    );
  });

  // Calculate high-precision Vedic Panchang based on current Date and Geo-coordinates
  const panchang = useMemo(() => {
    return calculateVedicPanchang(
      currentDate,
      currentLocation.latitude,
      currentLocation.longitude
    );
  }, [currentDate, currentLocation]);

  // Current page book meta
  const currentIndex = BOOK_PAGES.findIndex((p) => p.id === activeTab);
  const currentTabMeta = BOOK_PAGES[currentIndex] || BOOK_PAGES[0];
  const prevIndex = (currentIndex - 1 + BOOK_PAGES.length) % BOOK_PAGES.length;
  const nextIndex = (currentIndex + 1) % BOOK_PAGES.length;
  const prevTabMeta = BOOK_PAGES[prevIndex];
  const nextTabMeta = BOOK_PAGES[nextIndex];

  // Show temporary toast notice when turning pages
  const notifyPageTurn = useCallback((pageTitle: string, pageNum: number) => {
    setPageTurnNotice(`📖 पृष्ठ ${pageNum} : ${pageTitle}`);
    const timer = setTimeout(() => setPageTurnNotice(null), 2000);
    return () => clearTimeout(timer);
  }, []);

  // Navigate to previous page
  const handlePrevPage = useCallback(() => {
    setTurnDirection('backward');
    const prev = BOOK_PAGES[prevIndex];
    setActiveTab(prev.id);
    if (isAudioEnabled) playTactilePageTurnSound();
    notifyPageTurn(prev.label, prev.pageNumber);
  }, [prevIndex, isAudioEnabled, notifyPageTurn]);

  // Navigate to next page
  const handleNextPage = useCallback(() => {
    setTurnDirection('forward');
    const next = BOOK_PAGES[nextIndex];
    setActiveTab(next.id);
    if (isAudioEnabled) playTactilePageTurnSound();
    notifyPageTurn(next.label, next.pageNumber);
  }, [nextIndex, isAudioEnabled, notifyPageTurn]);

  // Navigate directly to a tab
  const handleSelectTab = useCallback(
    (tabId: string) => {
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
    [currentIndex, isAudioEnabled, notifyPageTurn]
  );

  // Touch Swipe Gesture detection
  // Sliding finger to Left (Right->Left) = Next Page (अगला पृष्ठ)
  // Sliding finger to Right (Left->Right) = Previous Page (पिछला पृष्ठ)
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    const target = e.target as HTMLElement;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.tagName === 'SELECT' ||
      target.closest('input') ||
      target.closest('textarea') ||
      target.closest('select') ||
      target.closest('.no-swipe')
    ) {
      touchStartRef.current = null;
      return;
    }

    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      time: Date.now(),
    };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const touchEnd = e.changedTouches[0];
    const deltaX = touchEnd.clientX - touchStartRef.current.x;
    const deltaY = touchEnd.clientY - touchStartRef.current.y;
    const elapsed = Date.now() - touchStartRef.current.time;
    touchStartRef.current = null;

    // Discard gestures that took too long
    if (elapsed > 1200) return;

    // Must be a predominantly horizontal swipe (displacement >= 40px)
    if (Math.abs(deltaX) >= 40 && Math.abs(deltaX) > Math.abs(deltaY) * 0.75) {
      if (deltaX < 0) {
        // Slid finger to LEFT -> Next Page (अगला पृष्ठ)
        handleNextPage();
      } else {
        // Slid finger to RIGHT -> Previous Page (पिछला पृष्ठ)
        handlePrevPage();
      }
    }
  };

  // Global window swipe listener to ensure swiping works everywhere across cards and views
  useEffect(() => {
    const onWinTouchStart = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.closest('input') ||
        target.closest('textarea') ||
        target.closest('select') ||
        target.closest('.no-swipe')
      ) {
        touchStartRef.current = null;
        return;
      }
      if (e.touches.length === 1) {
        touchStartRef.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
          time: Date.now(),
        };
      }
    };

    const onWinTouchEnd = (e: TouchEvent) => {
      if (!touchStartRef.current) return;
      const touchEnd = e.changedTouches[0];
      const deltaX = touchEnd.clientX - touchStartRef.current.x;
      const deltaY = touchEnd.clientY - touchStartRef.current.y;
      const elapsed = Date.now() - touchStartRef.current.time;
      touchStartRef.current = null;

      if (elapsed > 1200) return;
      if (Math.abs(deltaX) >= 45 && Math.abs(deltaX) > Math.abs(deltaY) * 0.75) {
        if (deltaX < 0) {
          handleNextPage();
        } else {
          handlePrevPage();
        }
      }
    };

    window.addEventListener('touchstart', onWinTouchStart, { passive: true });
    window.addEventListener('touchend', onWinTouchEnd, { passive: true });
    return () => {
      window.removeEventListener('touchstart', onWinTouchStart);
      window.removeEventListener('touchend', onWinTouchEnd);
    };
  }, [handleNextPage, handlePrevPage]);

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

  return (
    <div
      className="min-h-screen bg-[#F4E8D1] text-[#3E2714] flex flex-col font-sans selection:bg-[#B56A00] selection:text-white"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Heritage Top Navigation Bar with Page Flip Controls */}
      <Navbar
        currentLocation={currentLocation}
        currentDate={currentDate}
        onDateChange={setCurrentDate}
        onOpenLocationModal={() => setIsLocationModalOpen(true)}
        onOpenUmaModal={() => setIsUmaModalOpen(true)}
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
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
      />

      {/* Floating Page Turn Toast Notice */}
      {pageTurnNotice && (
        <div className="fixed top-28 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-in fade-in zoom-in-95 duration-200">
          <div className="px-4 py-2 bg-[#2C180C]/95 text-[#FAF2E4] border-2 border-[#B56A00] rounded-full shadow-2xl text-xs sm:text-sm font-bold font-granth flex items-center gap-2 backdrop-blur-xs">
            <span className="text-[#FFD88A]">✦</span>
            <span>{pageTurnNotice}</span>
            <span className="text-[#FFD88A]">✦</span>
          </div>
        </div>
      )}

      {/* Main Book-like Granth Presentation Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-2 sm:p-4 lg:p-6">
        {!isBookOpen ? (
          <BookCover
            onOpenBook={(targetTabId) => {
              setIsBookOpen(true);
              if (targetTabId) {
                handleSelectTab(targetTabId);
              }
              if (isAudioEnabled) playTactilePageTurnSound();
            }}
            currentLocationName={currentLocation.name}
            manishProfileName={activeKundali?.name || 'मनीष (Manish)'}
          />
        ) : (
          /* Sacred Vedic Book Wrapper (ग्रन्थ पट्टिका) */
          <div className="granth-book-container book-stacked-pages bhojpatra-leaf granth-leaf-stack border-3 sm:border-4 border-[#8C6239] rounded-2xl sm:rounded-3xl p-3 sm:p-6 lg:p-8 relative shadow-2xl">
            {/* Authentic Book Corner Ornaments */}
            <div className="absolute top-2 left-2 text-[#8C6239] text-xs sm:text-sm select-none pointer-events-none font-bold">
              ❖
            </div>
            <div className="absolute top-2 right-2 text-[#8C6239] text-xs sm:text-sm select-none pointer-events-none font-bold">
              ❖
            </div>
            <div className="absolute bottom-2 left-2 text-[#8C6239] text-xs sm:text-sm select-none pointer-events-none font-bold">
              ❖
            </div>
            <div className="absolute bottom-2 right-2 text-[#8C6239] text-xs sm:text-sm select-none pointer-events-none font-bold">
              ❖
            </div>

            {/* Book Top Chapter Ribbon */}
            <div className="shloka-banner py-2 px-3 sm:px-4 rounded-xl mb-4 flex items-center justify-between gap-2 text-[#5C3A21] border border-[#C27803]/40">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-base text-[#B56A00] font-black">ॐ</span>
                <div className="min-w-0">
                  <div className="text-[10px] font-granth text-[#8B1E1E] font-bold">॥ श्री शक्ति पञ्चाङ्गम् ग्रन्थ ॥</div>
                  <h2 className="font-granth font-black text-xs sm:text-base text-[#5C3A21] tracking-wide truncate">
                    {currentTabMeta.chapter} : {currentTabMeta.title}
                  </h2>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="px-2.5 py-1 bg-[#5C3A21] text-[#FFD88A] rounded-lg text-xs font-black shadow-xs">
                  📖 पृष्ठ {currentTabMeta.pageNumber} / {BOOK_PAGES.length}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setIsBookOpen(false);
                    if (isAudioEnabled) playTactilePageTurnSound();
                  }}
                  className="px-2.5 py-1 bg-[#8C6239] hover:bg-[#5C3A21] text-[#FAF2E4] rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 shadow-xs"
                  title="ग्रन्थ मुखपृष्ठ खोलें"
                >
                  <span>📕 मुखपृष्ठ</span>
                </button>
              </div>
            </div>

            {/* Book Content Container with Realistic 3D Page Turn Animation */}
            <div
              key={activeTab}
              className={`min-h-[550px] ${
                turnDirection === 'forward'
                  ? 'book-page-turn-forward'
                  : 'book-page-turn-backward'
              }`}
            >
              {activeTab === 'panchang' && (
                <PanchangView
                  panchang={panchang}
                  onNavigateTab={handleSelectTab}
                  onOpenUmaModal={() => setIsUmaModalOpen(true)}
                  locationName={currentLocation.name}
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
            </div>

            {/* Book Bottom Page Navigation Footer */}
            <div className="mt-8 pt-4 border-t-2 border-[#8C6239]/40 flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#FAF2E4]/80 p-3 sm:p-4 rounded-2xl border border-[#8C6239]/30 shadow-inner">
              {/* Bottom Prev Page */}
              <button
                type="button"
                onClick={handlePrevPage}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-[#5C3A21] hover:bg-[#462B17] text-[#FAF2E4] border border-[#B56A00]/70 rounded-xl font-bold shadow-md transition transform active:scale-95 cursor-pointer text-xs sm:text-sm"
              >
                <ChevronLeft className="w-4 h-4 text-[#FFD88A]" />
                <span>‹ पिछला पृष्ठ ({prevTabMeta.label})</span>
              </button>

              {/* Gesture Tip & Page Indicator */}
              <div className="text-center text-[#735133] order-last sm:order-none w-full sm:w-auto">
                <div className="font-granth font-black text-sm sm:text-base text-[#5C3A21] flex items-center justify-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-[#B56A00]" />
                  <span>{currentTabMeta.chapter} • पृष्ठ {currentTabMeta.pageNumber} / {BOOK_PAGES.length}</span>
                </div>
                <div className="text-[11px] sm:text-xs text-[#8C6239] font-medium mt-1 flex items-center justify-center gap-2 flex-wrap">
                  <span>👈 बाएँ स्वाइप करें = अगला पृष्ठ</span>
                  <span>•</span>
                  <span>दाएँ स्वाइप करें = पिछला पृष्ठ 👉</span>
                </div>
              </div>

              {/* Bottom Next Page */}
              <button
                type="button"
                onClick={handleNextPage}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#8B1E1E] to-[#B56A00] hover:brightness-110 text-white border border-[#FFD88A]/50 rounded-xl font-bold shadow-md transition transform active:scale-95 cursor-pointer text-xs sm:text-sm"
              >
                <span>अगला पृष्ठ ({nextTabMeta.label}) ›</span>
                <ChevronRight className="w-4 h-4 text-[#FFD88A]" />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Floating Edge Navigation Buttons (Mobile & Desktop Thumb-Friendly Controls) */}
      {isBookOpen && (
        <>
          {/* Left Screen Edge Floating Button: Previous Page */}
          <button
            type="button"
            onClick={handlePrevPage}
            className="fixed left-0 top-1/2 -translate-y-1/2 z-30 bg-[#5C3A21]/90 hover:bg-[#462B17] text-[#FFD88A] hover:text-white px-1 sm:px-2 py-3.5 sm:py-5 rounded-r-xl sm:rounded-r-2xl shadow-2xl border-y border-r border-[#B56A00] transition-all transform hover:scale-105 active:scale-95 flex flex-col items-center gap-1 group cursor-pointer backdrop-blur-xs"
            title={`पिछला पृष्ठ: ${prevTabMeta.label}`}
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-[#FFD88A] group-hover:-translate-x-0.5 transition-transform" />
            <span className="[writing-mode:vertical-rl] text-[9px] sm:text-[10px] font-bold font-granth tracking-wider">
              ‹ पिछला
            </span>
          </button>

          {/* Right Screen Edge Floating Button: Next Page */}
          <button
            type="button"
            onClick={handleNextPage}
            className="fixed right-0 top-1/2 -translate-y-1/2 z-30 bg-[#5C3A21]/90 hover:bg-[#462B17] text-[#FFD88A] hover:text-white px-1 sm:px-2 py-3.5 sm:py-5 rounded-l-xl sm:rounded-l-2xl shadow-2xl border-y border-l border-[#B56A00] transition-all transform hover:scale-105 active:scale-95 flex flex-col items-center gap-1 group cursor-pointer backdrop-blur-xs"
            title={`अगला पृष्ठ: ${nextTabMeta.label}`}
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-[#FFD88A] group-hover:translate-x-0.5 transition-transform" />
            <span className="[writing-mode:vertical-rl] text-[9px] sm:text-[10px] font-bold font-granth tracking-wider">
              अगला ›
            </span>
          </button>
        </>
      )}

      {/* Floating UMA Assistant Pill (Mobile/Desktop Quick Access) */}
      <aside aria-label="Floating Vedic Assistant" className="fixed bottom-5 right-5 z-30">
        <button
          onClick={() => setIsUmaModalOpen(true)}
          className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-[#5C3A21] to-[#735133] hover:from-[#462B17] hover:to-[#5C3A21] text-[#FAF2E4] border-2 border-[#B56A00] rounded-full shadow-2xl transition transform hover:scale-105 active:scale-95 group cursor-pointer"
        >
          <div className="relative flex items-center justify-center w-7 h-7 rounded-full bg-[#B56A00] text-white">
            <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
            <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-300 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-400"></span>
            </span>
          </div>
          <span className="text-xs sm:text-sm font-bold font-granth tracking-wide pr-1">
            उमा से पूछें
          </span>
        </button>
      </aside>

      {/* Traditional Bhojpatra Footer */}
      <footer className="bg-[#462B17] text-[#D9C4A9] border-t-2 border-[#8C6239] py-6 px-4 mt-8 text-center text-xs space-y-2">
        <div className="font-granth text-sm sm:text-base text-[#FAF2E4] tracking-wide">
          ॥ ॐ सर्वे भवन्तु सुखिनः सर्वे सन्तु निरामयाः । सर्वे भद्राणि पश्यन्तु मा कश्चिद्दुःखभाग्भवेत् ॥
        </div>
        <p className="text-[#A89279]">
          शक्ति पंचांग (Shakti Panchang) • प्रामाणिक वैदिक खगोलशास्त्र एवं ज्योतिषीय पंचांग ग्रन्थ
        </p>
        <p className="text-[11px] text-[#8C6239]">
          गणना: सूर्य सिद्धान्त एवं लाहिरी अयनांश (Lahiri Ayanamsha) • स्थान: {currentLocation.name}
        </p>
      </footer>

      {/* Dialog Modals */}
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

      <InstallAppModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
      />
    </div>
  );
}
export default App;

