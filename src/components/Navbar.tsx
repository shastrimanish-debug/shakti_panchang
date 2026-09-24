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
      className="sticky top-0 z-40 bg-[#FFFDF9]/95 backdrop-blur-2xl text-[#2C180C] border-b border-[#E8DCCB] shadow-xs transition-all w-full max-w-full overflow-hidden"
      style={{ paddingTop: 'max(env(safe-area-inset-top, 0px), 0px)' }}
    >
      <div className="w-full max-w-4xl mx-auto px-2.5 sm:px-4 py-2 flex items-center justify-between gap-1.5 sm:gap-2">
        {/* Left: Brand Identity */}
        <div
          className="flex items-center gap-1.5 sm:gap-2 cursor-pointer shrink-0 select-none group min-w-0"
          onClick={() => setActiveTab('panchang')}
          title="शक्ति पंचांग मुख्य पृष्ठ"
        >
          <div className="p-1 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-500 shadow-xs group-hover:scale-105 transition shrink-0">
            <ShaktiLogo size={22} className="shrink-0 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm sm:text-base font-black font-granth tracking-wide text-[#2C180C] leading-tight truncate">
              शक्ति पंचांग
            </h1>
            <p className="text-[9px] text-[#8C4A00] font-semibold tracking-wider leading-none hidden xs:block truncate">
              वैदिक ज्योतिष व मुहूर्त
            </p>
          </div>
        </div>

        {/* Center / Right: Flutter Controls Cluster */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Day Stepper Capsule */}
          <div className="flex items-center bg-[#F5ECE0] rounded-xl p-0.5 border border-[#DFCBB5] shadow-xs">
            <button
              type="button"
              onClick={handlePrevDay}
              title="पिछला दिन"
              className="p-1 hover:bg-[#EADBCE] rounded-lg text-[#5C3A21] transition cursor-pointer active:scale-90"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleToday}
              title="आज की तिथि"
              className="px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-[11px] font-black text-[#2C180C] hover:text-[#8C4A00] transition cursor-pointer whitespace-nowrap"
            >
              {formattedDate}
            </button>
            <button
              type="button"
              onClick={handleNextDay}
              title="अगला दिन"
              className="p-1 hover:bg-[#EADBCE] rounded-lg text-[#5C3A21] transition cursor-pointer active:scale-90"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Location Chip */}
          <button
            type="button"
            onClick={onOpenLocationModal}
            className="flex items-center gap-1 px-2 py-1 bg-[#F5ECE0] hover:bg-[#EADBCE] text-[#462B17] rounded-xl border border-[#DFCBB5] transition cursor-pointer truncate max-w-[85px] sm:max-w-[130px] shadow-xs active:scale-95 text-xs font-bold"
            title={`वर्तमान स्थान: ${currentLocation.name}`}
          >
            <MapPin className="w-3 h-3 shrink-0 text-[#8C4A00]" />
            <span className="text-[10px] sm:text-[11px] truncate">
              {currentLocation.name}
            </span>
          </button>

          {/* Theme Toggle Icon (Desktop / Tablet) */}
          <button
            type="button"
            onClick={onToggleTheme}
            className="p-1.5 rounded-xl bg-[#F5ECE0] hover:bg-[#EADBCE] border border-[#DFCBB5] text-[#5C3A21] transition cursor-pointer active:scale-90 hidden sm:flex"
            title={theme === 'tamra' ? 'लाइट थीम' : 'डार्क थीम'}
          >
            {theme === 'tamra' ? <Sun className="w-3.5 h-3.5 text-amber-500" /> : <Moon className="w-3.5 h-3.5 text-[#5C3A21]" />}
          </button>

          {/* Sound Toggle (Desktop / Tablet) */}
          <button
            type="button"
            onClick={() => setIsAudioEnabled(!isAudioEnabled)}
            className="p-1.5 rounded-xl bg-[#F5ECE0] hover:bg-[#EADBCE] border border-[#DFCBB5] text-[#5C3A21] transition cursor-pointer active:scale-90 hidden sm:flex"
            title={isAudioEnabled ? 'ध्वनि चालू' : 'ध्वनि बंद'}
          >
            {isAudioEnabled ? <Volume2 className="w-3.5 h-3.5 text-[#8C4A00]" /> : <VolumeX className="w-3.5 h-3.5 text-stone-400" />}
          </button>

          {/* UMA AI Jewel Action Button (Desktop only - mobile already has it in center of BottomNavBar) */}
          <button
            type="button"
            onClick={onOpenUmaModal}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-500 hover:to-yellow-500 text-stone-950 rounded-xl text-xs font-black shadow-sm transition transform active:scale-95 cursor-pointer shrink-0 border border-amber-300 m3-touch"
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
