import React from 'react';
import { ShaktiLogo } from './ShaktiLogo';
import { SavedLocation } from '../types';
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Volume2,
  VolumeX,
  Sparkles,
  Moon,
  Sun,
} from 'lucide-react';
import { AppTheme } from '../services/storage';

interface NavbarProps {
  currentLocation: SavedLocation;
  currentDate: Date;
  onDateChange: (newDate: Date) => void;
  onOpenLocationModal: () => void;
  onOpenUmaModal: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isAudioEnabled: boolean;
  setIsAudioEnabled: (enabled: boolean) => void;
  onPrevPage: () => void;
  onNextPage: () => void;
  isBookOpen?: boolean;
  onToggleBookOpen?: () => void;
  theme: AppTheme;
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentLocation,
  currentDate,
  onDateChange,
  onOpenLocationModal,
  onOpenUmaModal,
  setActiveTab,
  isAudioEnabled,
  setIsAudioEnabled,
  theme,
  onToggleTheme,
}) => {
  const handlePrevDay = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - 1);
    onDateChange(d);
  };

  const handleNextDay = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 1);
    onDateChange(d);
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
      className="sticky top-0 z-40 bg-[#2C180C]/90 backdrop-blur-2xl text-[#FAF2E4] border-b border-amber-500/20 shadow-[0_4px_25px_rgba(0,0,0,0.25)] transition-all w-full max-w-full"
      style={{ paddingTop: 'max(env(safe-area-inset-top, 0px), 0px)' }}
    >
      <div className="w-full max-w-4xl mx-auto px-2.5 sm:px-4 py-2 flex items-center justify-between gap-2">
        {/* Left: Brand Identity */}
        <div
          className="flex items-center gap-2 cursor-pointer shrink-0 select-none group"
          onClick={() => setActiveTab('panchang')}
          title="शक्ति पंचांग मुख्य पृष्ठ"
        >
          <div className="p-1 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 shadow-md group-hover:scale-105 transition">
            <ShaktiLogo size={22} className="shrink-0" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-black font-granth tracking-wide text-[#FAF2E4] leading-tight flex items-center gap-1">
              <span>शक्ति पंचांग</span>
            </h1>
            <p className="text-[9px] text-amber-300 font-medium tracking-wider leading-none hidden xs:block">
              वैदिक ज्योतिष व मुहूर्त
            </p>
          </div>
        </div>

        {/* Center / Right: Flutter Controls Cluster */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Day Stepper Capsule */}
          <div className="flex items-center bg-[#1E0F07]/90 rounded-xl p-0.5 border border-amber-600/30 shadow-inner">
            <button
              type="button"
              onClick={handlePrevDay}
              title="पिछला दिन"
              className="p-1 hover:bg-amber-900/40 rounded-lg text-amber-200 transition cursor-pointer active:scale-90"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleToday}
              title="आज की तिथि"
              className="px-2 py-0.5 text-[11px] font-bold text-amber-100 hover:text-white transition cursor-pointer whitespace-nowrap"
            >
              {formattedDate}
            </button>
            <button
              type="button"
              onClick={handleNextDay}
              title="अगला दिन"
              className="p-1 hover:bg-amber-900/40 rounded-lg text-amber-200 transition cursor-pointer active:scale-90"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Location Chip */}
          <button
            type="button"
            onClick={onOpenLocationModal}
            className="flex items-center gap-1 px-2.5 py-1 bg-[#1E0F07]/90 hover:bg-amber-950/80 text-amber-300 rounded-xl border border-amber-600/30 transition cursor-pointer truncate max-w-[95px] sm:max-w-[130px] shadow-sm active:scale-95 text-xs font-semibold"
            title={`वर्तमान स्थान: ${currentLocation.name}`}
          >
            <MapPin className="w-3 h-3 shrink-0 text-amber-400" />
            <span className="text-[10px] sm:text-[11px] truncate">
              {currentLocation.name}
            </span>
          </button>

          {/* Theme Toggle Icon */}
          <button
            type="button"
            onClick={onToggleTheme}
            className="p-1.5 rounded-xl bg-[#1E0F07]/80 hover:bg-amber-950 border border-amber-600/30 text-amber-300 transition cursor-pointer active:scale-90 hidden sm:flex"
            title={theme === 'tamra' ? 'लाइट थीम' : 'डार्क थीम'}
          >
            {theme === 'tamra' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-amber-300" />}
          </button>

          {/* Sound Toggle */}
          <button
            type="button"
            onClick={() => setIsAudioEnabled(!isAudioEnabled)}
            className="p-1.5 rounded-xl bg-[#1E0F07]/80 hover:bg-amber-950 border border-amber-600/30 text-amber-200 transition cursor-pointer active:scale-90 hidden sm:flex"
            title={isAudioEnabled ? 'ध्वनि चालू' : 'ध्वनि बंद'}
          >
            {isAudioEnabled ? <Volume2 className="w-3.5 h-3.5 text-amber-400" /> : <VolumeX className="w-3.5 h-3.5 text-stone-500" />}
          </button>

          {/* UMA AI Jewel Action Button */}
          <button
            type="button"
            onClick={onOpenUmaModal}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-500 hover:to-yellow-500 text-stone-950 rounded-xl text-xs font-black shadow-[0_2px_15px_rgba(245,158,11,0.5)] transition transform active:scale-95 cursor-pointer shrink-0 border border-amber-200 m3-touch"
            title="उमा AI - वैदिक दैवज्ञ परामर्श"
          >
            <Sparkles className="w-3.5 h-3.5 fill-stone-950 text-stone-950" />
            <span className="font-extrabold">उमा AI ✨</span>
          </button>
        </div>
      </div>
    </header>
  );
};
