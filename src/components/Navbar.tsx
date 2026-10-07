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
  Globe,
} from 'lucide-react';
import { AppTheme } from '../services/storage';
import { useTranslation, useLanguage } from '../i18n';

interface NavbarProps {
  currentLocation: SavedLocation;
  currentDate: Date;
  onDateChange: (newDate: Date) => void;
  onOpenLocationModal: () => void;
  onOpenUmaModal: () => void;
  onOpenLanguageModal?: () => void;
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
  onOpenThemeModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentLocation,
  currentDate,
  onDateChange,
  onOpenLocationModal,
  onOpenUmaModal,
  onOpenLanguageModal,
  activeTab,
  setActiveTab,
  isAudioEnabled,
  setIsAudioEnabled,
  theme,
  onToggleTheme,
  onOpenThemeModal,
}) => {
  const { t } = useTranslation();
  const { language, currentOption } = useLanguage();

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

  // Dynamic user date using TypeScript new Date() formatted per active language (Hindi, Gujarati, English)
  const activeDate = currentDate instanceof Date && !isNaN(currentDate.getTime()) ? currentDate : new Date();
  const dateLocale = language === 'en' ? 'en-US' : language === 'gu' ? 'gu-IN' : 'hi-IN';
  const formattedDate = activeDate.toLocaleDateString(dateLocale, {
    day: 'numeric',
    month: 'short',
  });

  return (
    <header
      className="bg-[#FFFDF9]/98 backdrop-blur-2xl text-[#2C180C] border-b border-[#E8DCCB] shadow-xs w-full max-w-full overflow-hidden"
      style={{ paddingTop: 'max(env(safe-area-inset-top, 0px), 0px)' }}
    >
      <div className="w-full max-w-4xl mx-auto px-2.5 sm:px-4 py-2 flex items-center justify-between gap-1.5 sm:gap-2">
        {/* Left: Brand Identity */}
        <div
          className="flex items-center gap-1.5 sm:gap-2 cursor-pointer shrink-0 select-none group min-w-0"
          onClick={() => setActiveTab('panchang')}
          title={t('common.appName', 'Shakti Panchang')}
        >
          <div className="p-1 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-500 shadow-xs group-hover:scale-105 transition shrink-0">
            <ShaktiLogo size={22} className="shrink-0 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm sm:text-base font-black font-granth tracking-wide text-[#2C180C] leading-tight truncate">
              {t('common.appName', 'शक्ति पंचांग')}
            </h1>
            <p className="text-[9px] text-[#8C4A00] font-semibold tracking-wider leading-none hidden xs:block truncate">
              {t('common.appSubtitle', 'वैदिक ज्योतिष व मुहूर्त')}
            </p>
          </div>
        </div>

        {/* Center / Right: Controls Cluster */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Language Selector Trigger */}
          {onOpenLanguageModal && (
            <button
              type="button"
              onClick={onOpenLanguageModal}
              className="flex items-center gap-1 px-2 py-1 bg-[#F5ECE0] hover:bg-[#EADBCE] text-[#462B17] rounded-xl border border-[#DFCBB5] transition cursor-pointer shadow-xs active:scale-95 text-xs font-bold"
              title={t('common.selectLanguage', 'Choose Language')}
            >
              <Globe className="w-3.5 h-3.5 text-[#8C4A00]" />
              <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider">
                {currentOption.code}
              </span>
            </button>
          )}

          {/* Day Stepper Capsule */}
          <div className="flex items-center bg-[#F5ECE0] rounded-xl p-0.5 border border-[#DFCBB5] shadow-xs">
            <button
              type="button"
              onClick={handlePrevDay}
              title={t('common.prev', 'Previous Day')}
              className="p-1 hover:bg-[#EADBCE] rounded-lg text-[#5C3A21] transition cursor-pointer active:scale-90"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleToday}
              title={t('common.today', 'Today')}
              className="px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-[11px] font-black text-[#2C180C] hover:text-[#8C4A00] transition cursor-pointer whitespace-nowrap"
            >
              {formattedDate}
            </button>
            <button
              type="button"
              onClick={handleNextDay}
              title={t('common.next', 'Next Day')}
              className="p-1 hover:bg-[#EADBCE] rounded-lg text-[#5C3A21] transition cursor-pointer active:scale-90"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Location Chip */}
          <button
            type="button"
            onClick={onOpenLocationModal}
            className="flex items-center gap-1 px-2 py-1 bg-[#F5ECE0] hover:bg-[#EADBCE] text-[#462B17] rounded-xl border border-[#DFCBB5] transition cursor-pointer truncate max-w-[80px] sm:max-w-[130px] shadow-xs active:scale-95 text-xs font-bold"
            title={`Location: ${currentLocation.name}`}
          >
            <MapPin className="w-3 h-3 shrink-0 text-[#8C4A00]" />
            <span className="text-[10px] sm:text-[11px] truncate">
              {currentLocation.name}
            </span>
          </button>

          {/* Theme Toggle & Palette Selector Icon (Mobile & Desktop) */}
          <button
            type="button"
            onClick={onOpenThemeModal || onToggleTheme}
            className="p-1.5 rounded-xl bg-[#F5ECE0] hover:bg-[#EADBCE] border border-[#DFCBB5] text-[#5C3A21] transition cursor-pointer active:scale-90 flex items-center justify-center shadow-xs"
            title="पावन भक्तिमय थीम चयन (Devotional Themes)"
          >
            {theme === 'tamra' ? (
              <Moon className="w-3.5 h-3.5 text-amber-500" />
            ) : theme === 'kesariya' ? (
              <span className="text-xs leading-none">🚩</span>
            ) : theme === 'chandan' ? (
              <span className="text-xs leading-none">🪵</span>
            ) : theme === 'peetambari' ? (
              <span className="text-xs leading-none">💛</span>
            ) : theme === 'gangajal' ? (
              <span className="text-xs leading-none">🌊</span>
            ) : theme === 'tulsi' ? (
              <span className="text-xs leading-none">🌿</span>
            ) : theme === 'sindoor' ? (
              <span className="text-xs leading-none">🌺</span>
            ) : theme === 'swarna' ? (
              <span className="text-xs leading-none">✨</span>
            ) : theme === 'shvet' ? (
              <span className="text-xs leading-none">🕊️</span>
            ) : (
              <Sun className="w-3.5 h-3.5 text-[#8C4A00]" />
            )}
          </button>

          {/* Sound Toggle (Desktop / Tablet) */}
          <button
            type="button"
            onClick={() => setIsAudioEnabled(!isAudioEnabled)}
            className="p-1.5 rounded-xl bg-[#F5ECE0] hover:bg-[#EADBCE] border border-[#DFCBB5] text-[#5C3A21] transition cursor-pointer active:scale-90 hidden sm:flex"
            title={isAudioEnabled ? t('more.audioOn', 'Audio On') : t('more.audioOff', 'Audio Off')}
          >
            {isAudioEnabled ? <Volume2 className="w-3.5 h-3.5 text-[#8C4A00]" /> : <VolumeX className="w-3.5 h-3.5 text-stone-400" />}
          </button>

          {/* UMA AI Action Button */}
          <button
            type="button"
            onClick={onOpenUmaModal}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-500 hover:to-yellow-500 text-stone-950 rounded-xl text-xs font-black shadow-sm transition transform active:scale-95 cursor-pointer shrink-0 border border-amber-300 m3-touch"
            title={t('uma.title', 'Uma Vedic Consultation')}
          >
            <Sparkles className="w-3.5 h-3.5 fill-stone-950 text-stone-950" />
            <span className="font-extrabold">{t('nav.uma', 'Uma')} ✨</span>
          </button>
        </div>
      </div>

      {/* Horizontal Quick-Access Chapter Navigation Strip */}
      <div className="w-full max-w-4xl mx-auto px-2 pb-1.5 flex items-center gap-1 overflow-x-auto scrollbar-none text-[11px] font-bold">
        {[
          { id: 'panchang', label: `📜 ${t('nav.panchang', 'पंचांग')}` },
          { id: 'kundali', label: `🪐 ${t('nav.kundali', 'कुण्डली')}` },
          { id: 'durga', label: `🔱 ${t('nav.durga', 'दुर्गा सप्तशती')}`, badge: t('common.newBadge', 'नया') },
          { id: 'upay', label: `🔮 ${t('nav.upay', 'चमत्कारी उपाय')}`, badge: t('common.newBadge', 'नया') },
          { id: 'vastu', label: `🏡 ${t('nav.vastu', 'वास्तु शास्त्र')}`, badge: t('common.newBadge', 'नया') },
          { id: 'choghadiya', label: `✨ ${t('nav.choghadiya', 'चौघड़िया')}` },
          { id: 'muhurat', label: `⏰ ${t('nav.muhurat', 'शुभ मुहूर्त')}` },
          { id: 'yatra', label: `🚗 ${t('nav.yatra', 'यात्रा')}` },
          { id: 'milan', label: `💍 ${t('nav.milan', 'गुण मिलान')}` },
          { id: 'vratkatha', label: `📖 ${t('nav.vratkatha', 'व्रत कथा')}` },
          { id: 'festivals', label: `📅 ${t('nav.festivals', 'पर्व/त्योहार')}` },
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setActiveTab(item.id)}
            className={`px-2.5 py-1 rounded-full whitespace-nowrap transition cursor-pointer flex items-center gap-1 shrink-0 ${
              activeTab === item.id
                ? 'bg-[#5C3A21] text-[#FFD88A] shadow-xs'
                : 'bg-[#F5ECE0] text-[#5C3A21] hover:bg-[#EADBCE]'
            }`}
          >
            <span>{item.label}</span>
            {item.badge && (
              <span className="text-[9px] px-1 py-0.2 rounded-full bg-rose-600 text-white font-extrabold">
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </div>
    </header>
  );
};
