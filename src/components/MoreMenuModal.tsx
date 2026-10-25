import React from 'react';
import { ShaktiLogo } from './ShaktiLogo';
import {
  Compass,
  Heart,
  Bell,
  BookOpen,
  MapPin,
  Sparkles,
  Sun,
  Moon,
  X,
  Volume2,
  VolumeX,
  Share2,
  Award,
  Crown,
  Flame,
  Home,
  Globe,
  Hand,
  Coins,
  Eye,
  Lock,
  Calendar,
  HelpCircle,
} from 'lucide-react';
import { SavedLocation } from '../types';
import { AppTheme, DEVOTIONAL_THEMES, getAstrologerBranding } from '../services/storage';
import { useLicense } from '../lib/license-client';
import { useLanguage } from '../i18n';
import { triggerHapticSelection } from '../utils/haptics';
import { ZeroScrollPager } from './ZeroScrollPager';

interface MoreMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tabId: string) => void;
  onOpenLocationModal: () => void;
  onOpenUmaModal: () => void;
  onOpenLanguageModal?: () => void;
  onToggleBookCover: () => void;
  onOpenWhatsAppPanchang?: () => void;
  onOpenBrandingModal?: () => void;
  onOpenSubscriptionModal?: (reason?: string) => void;
  currentLocation: SavedLocation;
  theme: AppTheme;
  onToggleTheme: () => void;
  onSetTheme?: (theme: AppTheme) => void;
  onOpenThemeModal?: () => void;
  isAudioEnabled: boolean;
  onToggleAudio: () => void;
  onOpenReleaseNotes?: () => void;
}

export const MoreMenuModal: React.FC<MoreMenuModalProps> = ({
  isOpen,
  onClose,
  onSelectTab,
  onOpenLocationModal,
  onOpenUmaModal,
  onOpenLanguageModal,
  onToggleBookCover,
  onOpenWhatsAppPanchang,
  onOpenBrandingModal,
  onOpenSubscriptionModal,
  currentLocation,
  theme,
  onToggleTheme,
  onSetTheme,
  onOpenThemeModal,
  isAudioEnabled,
  onToggleAudio,
  onOpenReleaseNotes,
}) => {
  const { t, currentOption, language } = useLanguage();
  const currentLang = currentOption;
  const { status } = useLicense();
  const isEntitled = status.entitled;

  if (!isOpen) return null;

  const branding = getAstrologerBranding();

  const handleAction = (cb?: () => void) => {
    triggerHapticSelection();
    if (cb) cb();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-md" onClick={onClose}>
      <div className="bx-more w-full max-w-md h-[100dvh] sm:h-[86dvh] max-h-[100dvh] bg-[#FFFDF9]/98 dark:bg-[#23140C]/98 text-[#3E2714] dark:text-[#FAF2E4] rounded-t-3xl sm:rounded-3xl border-t-2 sm:border border-[#DFCBB5] shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden min-h-0 flex flex-col" onClick={(event) => event.stopPropagation()}>
        <div className="shrink-0 flex items-center justify-between gap-2 px-4 pt-4 pb-3 border-b border-[#8C6239]/30">
          <div className="flex items-center gap-2 min-w-0">
            <ShaktiLogo size={24} className="shrink-0" />
            <h3 className="font-granth font-black text-base text-[#5C3A21] dark:text-[#FFD88A] truncate">
              {t('more.title', 'अतिरिक्त सेवाएँ व विकल्प')}
            </h3>
          </div>
          <button
            type="button"
            onClick={() => {
              triggerHapticSelection();
              onClose();
            }}
            className="bx-iconbtn shrink-0"
            aria-label={t('common.close', 'बंद करें')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      <ZeroScrollPager className="flex-1 min-h-0 w-full" contentClassName="bx-more-flow px-3 pt-2 pb-1">

        <div className="mt-3.5">
          <button
            type="button"
            onClick={() => handleAction(onOpenUmaModal)}
            className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 hover:from-amber-600 hover:to-yellow-500 text-stone-950 font-black flex items-center justify-between shadow-lg border border-amber-300 transition cursor-pointer active:scale-95 uma-glow-badge m3-touch"
          >
            <div className="flex items-center gap-3 text-left min-w-0 flex-1">
              <div className="w-10 h-10 rounded-full bg-stone-950 text-amber-400 flex items-center justify-center shadow-md shrink-0">
                <Sparkles className="w-5 h-5 fill-amber-400 text-amber-400" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-black tracking-wide text-stone-950 leading-snug">
                  {t('more.umaCardTitle', 'उमा वैदिक दैवज्ञ परामर्श')}
                </div>
                <div className="text-[11px] text-stone-900 font-medium leading-snug mt-0.5">
                  {t('more.umaCardDesc', 'कुंडली, मुहूर्त, गोचर, उपाय व प्रश्न विचार 100% सक्रिय')}
                </div>
              </div>
            </div>
            <span className="text-[11px] bg-stone-950 text-amber-300 px-3 py-1 rounded-full font-black shrink-0">
              {t('more.consultNow', 'परामर्श')}
            </span>
          </button>
        </div>

        {/* Devta Arpan Fal Dedicated Card */}
        <div className="mt-2.5">
          <button
            type="button"
            onClick={() => handleAction(() => onSelectTab('devta_arpan'))}
            className="w-full p-3 rounded-2xl border flex items-center justify-between transition cursor-pointer shadow-xs active:scale-95 bg-gradient-to-r from-amber-600 via-orange-600 to-red-700 text-[#FAF2E4] border-[#D4AF37]"
          >
            <div className="flex items-center gap-2.5 text-left min-w-0 flex-1">
              <div className="p-2 bg-[#2C0A0A] rounded-xl text-amber-300 shrink-0 text-lg">
                🪔
              </div>
              <div className="min-w-0">
                <div className="text-xs sm:text-sm font-black text-[#FFD88A] leading-snug flex items-center gap-1.5">
                  <span>देवता अर्पण फल व पूजन सामग्री</span>
                  <span className="text-[9px] bg-red-950 text-amber-300 px-1.5 py-0.2 rounded font-bold">नया</span>
                </div>
                <div className="text-[10px] text-[#F5ECE0]/90 leading-snug mt-0.5">
                  १४+ देवता, ५०+ अर्पण सामग्री, प्रत्यक्ष फल, निषेध व मंत्र
                </div>
              </div>
            </div>
            <span className="text-[11px] bg-[#2C0A0A] text-[#FFD88A] px-2.5 py-1 rounded-lg font-bold shrink-0">
              खोलें →
            </span>
          </button>
        </div>

        {/* Ancient Granth, Upanishads & Puranas Card */}
        <div className="mt-2.5">
          <button
            type="button"
            onClick={() => handleAction(() => onSelectTab('granth_puran'))}
            className="w-full p-3 rounded-2xl border flex items-center justify-between transition cursor-pointer shadow-xs active:scale-95 bg-[#FAF2E4] dark:bg-[#341F14] text-[#3E2714] dark:text-[#FAF2E4] border-[#B56A00]"
          >
            <div className="flex items-center gap-2.5 text-left min-w-0 flex-1">
              <div className="p-2 bg-[#5C3A21] rounded-xl text-[#FFD88A] shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs sm:text-sm font-black text-[#5C3A21] dark:text-[#FFD88A] leading-snug">
                  प्राचीन ग्रन्थ, उपनिषद् व महापुराण स्वाध्याय
                </div>
                <div className="text-[10px] text-[#735133] dark:text-[#D9C4A9] leading-snug mt-0.5">
                  श्रीमद्भगवद्गीता, ईश-कठ-मुण्डक उपनिषद्, अष्टादश पुराण व वेद-सूक्त
                </div>
              </div>
            </div>
            <span className="text-[11px] bg-[#5C3A21] text-[#FFD88A] px-2.5 py-1 rounded-lg font-bold shrink-0">
              पढ़ें →
            </span>
          </button>
        </div>

        {/* Subscription / VIP Status Card */}
        <div className="mt-2.5">
          <button
            type="button"
            onClick={() => handleAction(() => onOpenSubscriptionModal?.())}
            className="w-full p-3 rounded-2xl border flex items-center justify-between transition cursor-pointer shadow-xs active:scale-95 bg-gradient-to-r from-[#5C3A21] to-[#462B17] text-[#FAF2E4] border-[#B56A00]"
          >
            <div className="flex items-center gap-2.5 text-left min-w-0 flex-1">
              <div className="p-2 bg-[#B56A00] rounded-xl text-white shrink-0">
                <Crown className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <div className="text-xs sm:text-sm font-bold text-[#FFD88A] leading-snug">
                  {t('more.vipCardTitle', 'सदस्यता: VIP आजीवन • ७ दिन फ्री ट्रायल')}
                </div>
                <div className="text-[10px] text-[#D9C4A9] leading-snug mt-0.5">
                  {t('more.vipCardDesc', '₹99 (भारत) / $1 (Global) — समस्त कुण्डली, विवाह मिलान व पंचांग PDF आजीवन अनलॉक')}
                </div>
              </div>
            </div>
            <span className="text-[11px] bg-[#B56A00] text-white px-2.5 py-1 rounded-lg font-bold shrink-0">
              {t('common.active', 'सक्रिय')}
            </span>
          </button>
        </div>

        {/* Language Selection Card (Prominent) */}
        {onOpenLanguageModal && (
          <div className="mt-2.5">
            <button
              type="button"
              onClick={() => handleAction(onOpenLanguageModal)}
              className="w-full p-2.5 bg-[#FAF5ED] dark:bg-[#341F14] hover:bg-[#F4E8D1] dark:hover:bg-[#3E2519] border border-[#8C6239]/40 rounded-2xl flex items-center justify-between text-left transition cursor-pointer active:scale-95 m3-touch shadow-2xs"
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className="p-2 bg-gradient-to-tr from-amber-600 to-amber-500 rounded-xl text-white shrink-0">
                  <Globe className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-[#5C3A21] dark:text-[#FFD88A] leading-snug">
                    {t('more.languageSection', 'ऐप की भाषा')}
                  </div>
                  <div className="text-[10px] text-[#735133] dark:text-[#D9C4A9] leading-snug mt-0.5">
                    {currentLang.nativeName} · English, हिन्दी, ગુજરાતી, मराठी
                  </div>
                </div>
              </div>
              <span className="text-xs text-amber-700 dark:text-amber-300 font-bold shrink-0 rounded-full px-2.5 py-1">
                {t('common.select', 'चुनें')}
              </span>
            </button>
          </div>
        )}

        {/* Highlight Banner: 1-Click WhatsApp Daily Panchang Card */}
        {onOpenWhatsAppPanchang && (
          <div className="mt-2.5">
            <button
              type="button"
              onClick={() => handleAction(onOpenWhatsAppPanchang)}
              className="w-full p-2.5 bg-gradient-to-r from-[#25D366] to-[#1EBE5D] hover:from-[#20bd5a] hover:to-[#1aa852] text-white rounded-2xl shadow-xs flex items-center justify-between transition cursor-pointer active:scale-95 m3-touch"
            >
              <div className="flex items-center gap-2.5 text-left min-w-0 flex-1">
                <div className="p-2 bg-white/20 rounded-xl text-white shrink-0">
                  <Share2 className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold leading-snug">
                    {t('more.whatsappCardTitle', 'व्हाट्सएप सुप्रभात पंचांग कार्ड')}
                  </div>
                  <div className="text-[10px] text-white/90 leading-snug mt-0.5">
                    {t('more.whatsappCardDesc', 'आज का पंचांग व सुविचार 1-क्लिक में शेयर करें')}
                  </div>
                </div>
              </div>
              <span className="text-[11px] bg-white text-[#1EBE5D] px-2.5 py-1 rounded-lg font-bold">
                {t('common.share', 'शेयर करें')}
              </span>
            </button>
          </div>
        )}

        {/* Astrologer Custom Branding Badge */}
        {onOpenBrandingModal && (
          <div className="mt-2.5">
            <button
              type="button"
              onClick={() => handleAction(onOpenBrandingModal)}
              className="w-full p-2.5 bg-[#F4E8D1] dark:bg-[#341F14] hover:bg-[#EBD8BD] border border-[#8C6239]/40 rounded-2xl flex items-center justify-between text-left transition cursor-pointer active:scale-95 m3-touch"
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className="p-2 bg-[#5C3A21] rounded-xl text-[#FFD88A] shrink-0">
                  <Award className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-[#5C3A21] dark:text-[#FFD88A] leading-snug">
                    {t('more.astrologerBranding', 'ज्योतिषी विज़िटिंग कार्ड')}
                    {branding.enabled ? ` · ${t('common.active', 'सक्रिय')}` : ''}
                  </div>
                  <div className="text-[10px] text-[#735133] dark:text-[#D9C4A9] leading-snug mt-0.5">
                    {branding.enabled
                      ? `${branding.name} • ${branding.phone || branding.city}`
                      : t('more.brandingDefaultDesc', 'पंचांग कार्ड व कुंडली पर अपना नाम/नंबर जोड़ें')}
                  </div>
                </div>
              </div>
              <span className="text-xs text-[#B56A00] font-bold shrink-0 rounded-full px-2.5 py-1">{t('more.setBtn', 'सेट')}</span>
            </button>
          </div>
        )}


        {/* Quick Settings Bar */}
        <div className="bg-[#F4E8D1] dark:bg-[#341F14] p-3 rounded-2xl border border-[#8C6239]/30 space-y-2">
          <div className="text-[11px] font-bold text-[#8C6239] dark:text-[#FFD88A] uppercase tracking-wider">
            {t('common.settings', 'सेटिंग्स व प्राथमिकताएँ')}
          </div>

          <div className="flex items-center justify-between text-xs py-1">
            <span className="flex items-center gap-1.5 font-medium text-[#5C3A21] dark:text-[#FAF2E4]">
              <MapPin className="w-3.5 h-3.5 text-[#B56A00]" />
              {t('more.locationPrefix', 'स्थान')}: {currentLocation.name}
            </span>
            <button
              type="button"
              onClick={() => handleAction(onOpenLocationModal)}
              className="px-2.5 py-1 bg-[#FAF2E4] dark:bg-stone-800 border border-[#8C6239]/40 rounded-lg font-bold text-[#5C3A21] dark:text-[#FAF2E4] cursor-pointer m3-touch"
            >
              {t('more.changeBtn', 'बदलें')}
            </button>
          </div>

          <div className="py-2.5 border-t border-[#8C6239]/20">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="flex items-center gap-1.5 font-bold text-[#5C3A21] dark:text-[#FAF2E4]">
                <Sun className="w-3.5 h-3.5 text-amber-600" />
                <span>{t('more.themeSection', 'पावन भक्तिमय प्रकाश थीम (8+ Themes)')}:</span>
              </span>
              {onOpenThemeModal && (
                <button
                  type="button"
                  onClick={() => handleAction(onOpenThemeModal)}
                  className="text-[11px] font-black text-[#B56A00] dark:text-amber-400 hover:underline cursor-pointer flex items-center gap-0.5"
                >
                  <span>{t('themes.allThemesBtn', 'सभी थीम देखें')} →</span>
                </button>
              )}
            </div>

            {/* Quick 8 Devotional Light Themes Horizontal / Grid Swatches */}
            <div className="grid grid-cols-4 gap-1.5 mb-2">
              {DEVOTIONAL_THEMES.filter((t) => t.isLight).slice(0, 8).map((thm) => {
                const isSelected = theme === thm.id;
                return (
                  <button
                    key={thm.id}
                    type="button"
                    onClick={() => onSetTheme?.(thm.id)}
                    className={`p-1.5 rounded-xl border text-center transition cursor-pointer flex flex-col items-center justify-center gap-0.5 relative active:scale-95 ${
                      isSelected
                        ? 'ring-2 ring-amber-500 shadow-xs font-black'
                        : 'border-[#8C6239]/30 hover:border-amber-400 opacity-90'
                    }`}
                    style={{
                      backgroundColor: thm.bgHex,
                      borderColor: isSelected ? thm.accentHex : thm.borderHex,
                    }}
                    title={`${thm.name} (${thm.deity})`}
                  >
                    <span className="text-sm leading-none">{thm.icon}</span>
                    <span
                      className="text-[9px] font-bold truncate max-w-full leading-tight"
                      style={{ color: thm.accentHex }}
                    >
                      {thm.name.split(' ')[0]}
                    </span>
                    {isSelected && (
                      <span
                        className="w-1.5 h-1.5 rounded-full absolute top-1 right-1"
                        style={{ backgroundColor: thm.accentHex }}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Quick 2-button row: Full Theme Palette + Night Mode */}
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => handleAction(onOpenThemeModal)}
                className="py-1.5 px-2.5 rounded-xl text-center text-[11px] font-black transition border cursor-pointer bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-[#8C4A00] dark:text-amber-300 border-amber-400/50 hover:bg-amber-500/30 flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>{t('themes.customizeThemes', '८ पावन रंग चयन')}</span>
              </button>

              <button
                type="button"
                onClick={() => (onSetTheme ? onSetTheme(theme === 'tamra' ? 'kesariya' : 'tamra') : onToggleTheme())}
                className={`py-1.5 px-2.5 rounded-xl text-center text-[11px] font-bold transition border cursor-pointer flex items-center justify-center gap-1.5 ${
                  theme === 'tamra'
                    ? 'bg-[#B45309] text-white border-[#78350F] shadow-xs'
                    : 'bg-[#FAF2E4] dark:bg-stone-800 text-[#5C3A21] dark:text-[#FAF2E4] border-[#8C6239]/30 hover:border-amber-500'
                }`}
              >
                <Moon className="w-3.5 h-3.5 text-amber-500" />
                <span>{theme === 'tamra' ? t('more.themeTamraActive', 'ताम्र-डार्क सक्रिय') : t('more.themeTamra', 'ताम्र-डार्क')}</span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs py-1 border-t border-[#8C6239]/20">
            <span className="flex items-center gap-1.5 font-medium text-[#5C3A21] dark:text-[#FAF2E4]">
              {isAudioEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-600" /> : <VolumeX className="w-3.5 h-3.5 text-stone-500" />}
              {t('more.audioSettings', 'ध्वनि')}: {isAudioEnabled ? t('more.audioOn', 'चालू') : t('more.audioOff', 'बंद')}
            </span>
            <button
              type="button"
              onClick={onToggleAudio}
              className="px-2.5 py-1 bg-[#FAF2E4] dark:bg-stone-800 border border-[#8C6239]/40 rounded-lg font-bold text-[#5C3A21] dark:text-[#FAF2E4] cursor-pointer m3-touch"
            >
              {isAudioEnabled ? t('more.turnOff', 'बंद करें') : t('more.turnOn', 'चालू करें')}
            </button>
          </div>
        </div>

        {/* Release Notes v1.0.30 (Code 30) Trigger */}
        <div className="mt-2.5">
          <button
            type="button"
            onClick={() => handleAction(onOpenReleaseNotes)}
            className="w-full p-2.5 bg-[#FAF5ED] dark:bg-[#341F14] hover:bg-[#F4E8D1] border border-[#8C6239]/40 rounded-2xl flex items-center justify-between text-left transition cursor-pointer active:scale-95 shadow-2xs"
          >
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="p-2 bg-[#7A1D1D] rounded-xl text-[#FFD88A] shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-[#5C3A21] dark:text-[#FFD88A] leading-snug flex items-center gap-1.5">
                  <span>नवीनतम रिलीज़ नोट्स (Release Notes)</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 font-black">
                    v1.0.30 (Code 30)
                  </span>
                </div>
                <div className="text-[10px] text-[#735133] dark:text-[#D9C4A9] leading-snug mt-0.5">
                  उमा 5.0 सूक्ष्म गणित (KP उपनक्षत्र, षोडशवर्ग, सूक्ष्म दशा, प्रश्न-कुण्डली व अंक-युग्म)
                </div>
              </div>
            </div>
            <span className="text-xs text-[#B56A00] dark:text-amber-300 font-bold shrink-0">
              देखें →
            </span>
          </button>
        </div>

        {/* Sacred Brand Footer */}
        <div className="flex items-center justify-center gap-2 pt-3 mt-3 border-t border-[#8C6239]/20 text-center">
          <ShaktiLogo size={20} className="shrink-0" />
          <span className="text-[11px] font-bold text-[#8C6239] font-granth">
            {t('common.appName', 'शक्ति पंचांग')} • {t('common.poweredBy', 'Powered by Shiv Shakti Astro')}
          </span>
        </div>
        <a
          href="#privacy"
          onClick={(e) => {
            e.preventDefault();
            alert('सनातन शक्ति पंचांग आपकी गोपनीयता का पूर्ण सम्मान करता है। आपकी जन्म कुंडली व व्यक्तिगत विवरण केवल आपके उपकरण (लोकल स्टोरेज) में सुरक्षित रहते हैं।');
          }}
          className="block text-center text-[11px] font-bold text-[#8C6239] underline pt-2"
        >
          {t('more.privacyPolicy', 'गोपनीयता नीति')}
        </a>
      </ZeroScrollPager>
      </div>
    </div>
  );
};
