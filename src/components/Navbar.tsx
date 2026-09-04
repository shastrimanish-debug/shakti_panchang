import React from 'react';
import {
  BookOpen,
  Calendar,
  Sparkles,
  MapPin,
  Volume2,
  VolumeX,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  User,
  Heart,
  HelpCircle,
  Shield,
  Compass,
  Bell,
  Sun,
  Download,
} from 'lucide-react';
import { SavedLocation } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentDate: Date;
  onDateChange: (date: Date) => void;
  currentLocation: SavedLocation;
  onOpenLocationModal: () => void;
  isAudioEnabled: boolean;
  setIsAudioEnabled: (enabled: boolean) => void;
  onOpenUmaModal: () => void;
  onOpenInstallModal?: () => void;
  isBookOpen?: boolean;
  onToggleBookOpen?: () => void;
  onPrevPage: () => void;
  onNextPage: () => void;
}

export const BOOK_PAGES = [
  { id: 'panchang', label: 'दैनिक पंचांग', chapter: 'प्रथम अध्याय', pageNumber: 1, icon: Sun },
  { id: 'kundali', label: 'जन्म कुंडली', chapter: 'द्वितीय अध्याय', pageNumber: 2, icon: User },
  { id: 'milan', label: 'कुंडली मिलान', chapter: 'तृतीय अध्याय', pageNumber: 3, icon: Heart },
  { id: 'muhurat', label: 'शुभ मुहूर्त', chapter: 'चतुर्थ अध्याय', pageNumber: 4, icon: Compass },
  { id: 'choghadiya', label: 'चौघड़िया चक्र', chapter: 'पंचम अध्याय', pageNumber: 5, icon: Calendar },
  { id: 'horoscope', label: 'राशिफल', chapter: 'षष्ठ अध्याय', pageNumber: 6, icon: Sparkles },
  { id: 'festivals', label: 'पर्व व व्रत', chapter: 'सप्तम अध्याय', pageNumber: 7, icon: Calendar },
  { id: 'reminders', label: 'स्मृति व उपाय', chapter: 'अष्टम अध्याय', pageNumber: 8, icon: Bell },
];

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentDate,
  onDateChange,
  currentLocation,
  onOpenLocationModal,
  isAudioEnabled,
  setIsAudioEnabled,
  onOpenUmaModal,
  onOpenInstallModal,
  isBookOpen = true,
  onToggleBookOpen,
  onPrevPage,
  onNextPage,
}) => {
  const handlePrevDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 1);
    onDateChange(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 1);
    onDateChange(newDate);
  };

  const handleToday = () => {
    onDateChange(new Date());
  };

  const formattedDate = currentDate.toLocaleDateString('hi-IN', {
    day: 'numeric',
    month: 'short',
  });

  const currentIndex = BOOK_PAGES.findIndex((p) => p.id === activeTab);
  const currentTabMeta = BOOK_PAGES[currentIndex >= 0 ? currentIndex : 0];
  const prevIndex = (currentIndex - 1 + BOOK_PAGES.length) % BOOK_PAGES.length;
  const nextIndex = (currentIndex + 1) % BOOK_PAGES.length;
  const prevTabMeta = BOOK_PAGES[prevIndex];
  const nextTabMeta = BOOK_PAGES[nextIndex];

  return (
    <header className="sticky top-0 z-40 bg-[#5C3A21] text-[#FAF2E4] shadow-md border-b border-[#8C6239]">
      {/* 1. Ultra-Compact Top Bar (Height ~38px) */}
      <div className="max-w-7xl mx-auto px-2 sm:px-3 py-1 flex items-center justify-between gap-1 sm:gap-2">
        {/* Left: App Title & Sacred Motif */}
        <div
          className="flex items-center gap-1.5 cursor-pointer shrink-0"
          onClick={() => setActiveTab('panchang')}
        >
          <div className="w-6 h-6 rounded-full bg-[#B56A00] flex items-center justify-center border border-[#F4E8D1] shadow-inner text-xs font-bold text-white shrink-0">
            ॐ
          </div>
          <h1 className="text-xs sm:text-sm font-black font-granth tracking-wide text-[#FAF2E4] leading-none whitespace-nowrap">
            शक्ति पंचांग
          </h1>
        </div>

        {/* Center/Right: Date, Location, Audio & Uma AI Controls in single compact line */}
        <div className="flex items-center gap-1 sm:gap-1.5 text-xs shrink-0">
          {/* Date Navigator */}
          <div className="flex items-center bg-[#462B17] rounded p-0.5 border border-[#8C6239]/60">
            <button
              onClick={handlePrevDay}
              title="पिछला दिन"
              className="p-0.5 hover:bg-[#5C3A21] rounded text-[#FAF2E4] transition cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleToday}
              title="आज की तिथि"
              className="px-1.5 py-0.5 text-[11px] font-bold text-[#F4E8D1] hover:text-white transition cursor-pointer whitespace-nowrap"
            >
              {formattedDate}
            </button>
            <button
              onClick={handleNextDay}
              title="अगला दिन"
              className="p-0.5 hover:bg-[#5C3A21] rounded text-[#FAF2E4] transition cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Location Picker Button */}
          <button
            onClick={onOpenLocationModal}
            className="flex items-center gap-0.5 px-1.5 py-0.5 bg-[#462B17] hover:bg-[#3B2211] border border-[#8C6239]/60 rounded text-[11px] font-medium text-[#FAF2E4] transition cursor-pointer"
            title="स्थान बदलें"
          >
            <MapPin className="w-3 h-3 text-[#E69A33] shrink-0" />
            <span className="truncate max-w-[55px] xs:max-w-[75px] sm:max-w-[110px]">
              {currentLocation.name.split('(')[0].trim()}
            </span>
          </button>

          {/* Audio speech toggle */}
          <button
            onClick={() => setIsAudioEnabled(!isAudioEnabled)}
            className="p-1 bg-[#462B17] hover:bg-[#3B2211] border border-[#8C6239]/60 rounded transition cursor-pointer"
            title={isAudioEnabled ? 'ध्वनि चालू' : 'ध्वनि बंद'}
          >
            {isAudioEnabled ? (
              <Volume2 className="w-3 h-3 text-[#E69A33]" />
            ) : (
              <VolumeX className="w-3 h-3 text-[#A89279]" />
            )}
          </button>

          {/* Book Cover Toggle Button */}
          {onToggleBookOpen && (
            <button
              onClick={onToggleBookOpen}
              className={`hidden md:flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-bold border transition cursor-pointer ${
                !isBookOpen
                  ? 'bg-gradient-to-r from-[#B58738] to-[#D4A548] text-[#2C0A0A] border-[#FFD88A]'
                  : 'bg-[#462B17] hover:bg-[#382010] text-[#FFD88A] border-[#8C6239]'
              }`}
              title={isBookOpen ? 'मुखपृष्ठ' : 'ग्रंथ खोलें'}
            >
              <BookOpen className="w-3 h-3" />
              <span>{isBookOpen ? 'मुखपृष्ठ' : 'ग्रंथ'}</span>
            </button>
          )}

          {/* APK & App Install Button */}
          {onOpenInstallModal && (
            <button
              onClick={onOpenInstallModal}
              className="flex items-center gap-1 px-2 py-0.5 bg-[#5C3A21] hover:bg-[#462B17] border border-[#8C6239] text-[#FFD88A] hover:text-white rounded text-[11px] font-bold shadow-xs transition transform active:scale-95 cursor-pointer shrink-0"
              title="ऐप डाउनलोड व APK"
            >
              <Download className="w-3 h-3 text-[#FFD88A]" />
              <span className="hidden xs:inline">APK</span>
            </button>
          )}

          {/* UMA Assistant Button */}
          <button
            onClick={onOpenUmaModal}
            className="flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-[#B56A00] to-[#C67D24] hover:from-[#A25E00] hover:to-[#B56A00] text-white rounded text-[11px] font-bold shadow-xs transition transform active:scale-95 cursor-pointer shrink-0"
          >
            <Sparkles className="w-3 h-3 text-[#FFD88A]" />
            <span>उमा AI</span>
          </button>
        </div>
      </div>

      {/* 2. Compact Combined Navigation & Chapter Tabs Bar (Height ~32px) */}
      <div className="bg-[#462B17] border-t border-[#8C6239]/60 px-1 sm:px-2 flex items-center justify-between gap-1 overflow-hidden">
        {/* Left Arrow: Previous Page */}
        <button
          type="button"
          onClick={onPrevPage}
          className="px-2 py-1 bg-[#382010] hover:bg-[#5C3A21] text-[#FFD88A] rounded text-xs font-bold transition shrink-0 cursor-pointer flex items-center gap-1 border border-[#8C6239]/60 active:scale-95"
          title={`पिछला पृष्ठ: ${prevTabMeta.label}`}
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#FFD88A]" />
          <span className="text-[11px] font-bold">‹ पिछला</span>
        </button>

        {/* Scrollable Chapter Tabs */}
        <nav className="flex-1 flex items-center space-x-1 overflow-x-auto no-scrollbar py-0.5 px-1">
          {BOOK_PAGES.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded transition cursor-pointer select-none whitespace-nowrap ${
                  isActive
                    ? 'bg-[#FAF2E4] text-[#5C3A21] shadow-sm font-black ring-1 ring-[#FFD88A]'
                    : 'text-[#D9C4A9] hover:text-[#FAF2E4] hover:bg-[#5C3A21]/50'
                }`}
              >
                <span
                  className={`text-[10px] font-bold px-1 rounded ${
                    isActive ? 'bg-[#5C3A21] text-[#FAF2E4]' : 'bg-[#331C0C] text-[#D9C4A9]'
                  }`}
                >
                  {tab.pageNumber}
                </span>
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#B56A00]' : 'text-[#A89279]'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Arrow: Next Page */}
        <button
          type="button"
          onClick={onNextPage}
          className="px-2 py-1 bg-gradient-to-r from-[#B56A00] to-[#C67D24] hover:brightness-110 text-white rounded text-xs font-bold transition shrink-0 cursor-pointer flex items-center gap-1 border border-[#FFD88A]/60 shadow-xs active:scale-95"
          title={`अगला पृष्ठ: ${nextTabMeta.label}`}
        >
          <span className="text-[11px] font-bold">अगला ›</span>
          <ArrowRight className="w-3.5 h-3.5 text-white" />
        </button>
      </div>
    </header>
  );
};
