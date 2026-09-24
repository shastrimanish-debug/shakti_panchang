import React from 'react';
import { ShaktiLogo } from './ShaktiLogo';
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
  Moon,
  Clock,
  Gift,
  Lock,
} from 'lucide-react';
import { SavedLocation } from '../types';
import { AppTheme } from '../services/storage';
import { useLicense } from '../lib/license-client';

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
  isBookOpen?: boolean;
  onToggleBookOpen?: () => void;
  onPrevPage: () => void;
  onNextPage: () => void;
  theme?: AppTheme;
  onToggleTheme?: () => void;
}

export const BOOK_PAGES = [
  { id: 'panchang', label: 'दैनिक पंचांग', chapter: 'प्रथम अध्याय', pageNumber: 1, icon: Sun },
  { id: 'choghadiya', label: 'चौघड़िया चक्र', chapter: 'द्वितीय अध्याय', pageNumber: 2, icon: Clock },
  { id: 'muhurat', label: 'शुभ मुहूर्त', chapter: 'तृतीय अध्याय', pageNumber: 3, icon: Compass },
  { id: 'yatra', label: 'यात्रा दिशाशूल', chapter: 'चतुर्थ अध्याय', pageNumber: 4, icon: Compass },
  { id: 'kundali', label: 'जन्म कुंडली', chapter: 'पंचम अध्याय', pageNumber: 5, icon: User },
  { id: 'milan', label: 'कुंडली मिलान', chapter: 'षष्ठ अध्याय', pageNumber: 6, icon: Heart },
  { id: 'festivals', label: 'पर्व व व्रत', chapter: 'सप्तम अध्याय', pageNumber: 7, icon: Gift },
  { id: 'reminders', label: 'स्मृति व उपाय', chapter: 'अष्टम अध्याय', pageNumber: 8, icon: Bell },
  { id: 'vratkatha', label: 'व्रत कथा व आरती', chapter: 'नवम अध्याय', pageNumber: 9, icon: BookOpen },
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
  isBookOpen = true,
  onToggleBookOpen,
  onPrevPage,
  onNextPage,
  theme = 'bhojpatra',
  onToggleTheme,
}) => {
  const { status } = useLicense();
  const isEntitled = status.entitled;

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

  return (
    <header
      className="sticky top-0 z-40 bg-[#5C3A21] text-[#FAF2E4] shadow-md border-b border-[#8C6239] transition-all w-full max-w-full overflow-hidden"
      style={{ paddingTop: 'max(env(safe-area-inset-top, 0px), 0px)' }}
    >
      {/* 1. Ultra-Compact Top Bar with Safe-Area clearance */}
      <div className="w-full max-w-7xl mx-auto px-1.5 sm:px-3 pt-1.5 pb-1.5 sm:py-1.5 flex items-center justify-between gap-1 sm:gap-2">
        {/* Left: App Title & Sacred Motif */}
        <div
          className="flex items-center gap-1 sm:gap-1.5 cursor-pointer shrink-0"
          onClick={() => setActiveTab('panchang')}
          title="शक्ति पंचांग मुख्य पृष्ठ"
        >
          <ShaktiLogo size={20} className="shrink-0 sm:w-6 sm:h-6" />
          <h1 className="text-xs sm:text-sm font-black font-granth tracking-wide text-[#FAF2E4] leading-none whitespace-nowrap">
            शक्ति पंचांग
          </h1>
        </div>

        {/* Center/Right: Date, Location, & Controls fitted for mobile */}
        <div className="flex items-center gap-1 sm:gap-1.5 text-xs shrink-0">
          {/* Date Navigator */}
          <div className="flex items-center bg-[#462B17] rounded p-0.5 border border-[#8C6239]/60">
            <button
              type="button"
              onClick={handlePrevDay}
              title="पिछला दिन"
              className="p-0.5 hover:bg-[#5C3A21] rounded text-[#FAF2E4] transition cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleToday}
              title="आज की तिथि"
              className="px-1 sm:px-1.5 py-0.5 text-[10px] sm:text-[11px] font-bold text-[#F4E8D1] hover:text-white transition cursor-pointer whitespace-nowrap"
            >
              {formattedDate}
            </button>
            <button
              type="button"
              onClick={handleNextDay}
              title="अगला दिन"
              className="p-0.5 hover:bg-[#5C3A21] rounded text-[#FAF2E4] transition cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Location Badge */}
          <button
            type="button"
            onClick={onOpenLocationModal}
            className="flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 bg-[#462B17] hover:bg-[#382010] text-[#FFD88A] rounded border border-[#8C6239]/60 transition cursor-pointer truncate max-w-[90px] sm:max-w-[130px]"
            title={`वर्तमान स्थान: ${currentLocation.name}`}
          >
            <MapPin className="w-3 h-3 shrink-0 text-[#E5A93C]" />
            <span className="text-[10px] sm:text-[11px] font-semibold truncate">
              {currentLocation.name}
            </span>
          </button>

          {/* Sound Toggle */}
          <button
            type="button"
            onClick={() => setIsAudioEnabled(!isAudioEnabled)}
            className={`p-1 rounded border transition cursor-pointer ${
              isAudioEnabled
                ? 'bg-[#462B17] text-[#FFD88A] border-[#8C6239]'
                : 'bg-[#382010] text-[#A89279] border-transparent'
            }`}
            title={isAudioEnabled ? 'ध्वनि चालू' : 'ध्वनि बंद'}
          >
            {isAudioEnabled ? (
              <Volume2 className="w-3.5 h-3.5" />
            ) : (
              <VolumeX className="w-3.5 h-3.5" />
            )}
          </button>

          {/* Book Cover Toggle Button - Tablet/Desktop */}
          {onToggleBookOpen && (
            <button
              type="button"
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

          {/* UMA Assistant Button - Always accessible */}
          <button
            type="button"
            onClick={onOpenUmaModal}
            className="flex items-center gap-1 px-1.5 sm:px-2 py-0.5 bg-gradient-to-r from-[#B56A00] to-[#C67D24] hover:from-[#A25E00] hover:to-[#B56A00] text-white rounded text-[10px] sm:text-[11px] font-bold shadow-xs transition transform active:scale-95 cursor-pointer shrink-0"
          >
            <Sparkles className="w-3 h-3 text-[#FFD88A]" />
            <span>उमा AI {!isEntitled && '🔒'}</span>
          </button>
        </div>
      </div>

      {/* 2. Streamlined Chapter Tabs Bar - Clean & Breathable on Tablet/Desktop, hidden on mobile */}
      <div className="hidden sm:block bg-[#462B17] border-t border-[#8C6239]/60 px-2 sm:px-3 overflow-hidden">
        {/* Scrollable Chapter Tabs */}
        <nav className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar py-1.5 px-0.5">
          {BOOK_PAGES.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const isLocked = !isEntitled && tab.id !== 'panchang';

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs rounded-lg transition cursor-pointer select-none whitespace-nowrap shrink-0 relative ${
                  isActive
                    ? 'bg-[#FAF2E4] text-[#5C3A21] shadow-sm font-black ring-1 ring-[#FFD88A]'
                    : 'text-[#D9C4A9] hover:text-[#FAF2E4] hover:bg-[#5C3A21]/50'
                }`}
              >
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                    isActive ? 'bg-[#5C3A21] text-[#FAF2E4]' : 'bg-[#331C0C] text-[#D9C4A9]'
                  }`}
                >
                  {tab.pageNumber}
                </span>
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#B56A00]' : 'text-[#A89279]'}`} />
                <span>{tab.label}</span>
                {isLocked && <Lock className="w-3 h-3 text-[#FFD88A] ml-0.5 shrink-0" />}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
