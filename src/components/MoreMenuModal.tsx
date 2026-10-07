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
} from 'lucide-react';
import { SavedLocation } from '../types';
import { AppTheme, DEVOTIONAL_THEMES, getAstrologerBranding } from '../services/storage';
import { useLicense } from '../lib/license-client';
import { useLanguage } from '../i18n';

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
}) => {
  const { t, currentOption, language } = useLanguage();
  const currentLang = currentOption;
  const { status } = useLicense();
  const isEntitled = status.entitled;

  if (!isOpen) return null;

  const branding = getAstrologerBranding();

  const handleAction = (cb?: () => void) => {
    if (cb) cb();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-[#FFFDF9]/98 dark:bg-[#23140C]/98 backdrop-blur-2xl text-[#3E2714] dark:text-[#FAF2E4] rounded-t-3xl sm:rounded-3xl border-t-2 sm:border border-[#DFCBB5] shadow-[0_20px_60px_rgba(0,0,0,0.5)] p-4 sm:p-6 max-h-[88vh] overflow-y-auto animate-in slide-in-from-bottom duration-200"
        style={{
          paddingBottom: 'max(1.75rem, calc(env(safe-area-inset-bottom, 0px) + 1.25rem))',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#8C6239]/30">
          <div className="flex items-center gap-2">
            <ShaktiLogo size={24} className="shrink-0" />
            <h3 className="font-granth font-black text-base text-[#5C3A21] dark:text-[#FFD88A]">
              {t('more.title', 'अतिरिक्त सेवाएँ व विकल्प')}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-[#F4E8D1] dark:hover:bg-stone-800 rounded-full text-[#8C6239] transition cursor-pointer m3-touch"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Big Prominent UMA AI Hero Card */}
        <div className="mt-3.5">
          <button
            type="button"
            onClick={() => handleAction(onOpenUmaModal)}
            className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 hover:from-amber-600 hover:to-yellow-500 text-stone-950 font-black flex items-center justify-between shadow-lg border border-amber-300 transition cursor-pointer active:scale-95 uma-glow-badge m3-touch"
          >
            <div className="flex items-center gap-3 text-left">
              <div className="w-10 h-10 rounded-full bg-stone-950 text-amber-400 flex items-center justify-center shadow-md">
                <Sparkles className="w-5 h-5 fill-amber-400 text-amber-400" />
              </div>
              <div>
                <div className="text-sm font-black tracking-wide text-stone-950">
                  {t('more.umaCardTitle', 'उमा वैदिक दैवज्ञ परामर्श ✨')}
                </div>
                <div className="text-[11px] text-stone-900 font-medium">
                  {t('more.umaCardDesc', 'कुंडली, मुहूर्त, गोचर, उपाय व प्रश्न विचार 100% सक्रिय')}
                </div>
              </div>
            </div>
            <span className="text-[11px] bg-stone-950 text-amber-300 px-3 py-1 rounded-full font-black shrink-0 shadow-xs">
              {t('more.consultNow', 'परामर्श लें →')}
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
            <div className="flex items-center gap-2.5 text-left">
              <div className="p-2 bg-[#B56A00] rounded-xl text-white shadow-2xs">
                <Crown className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-bold flex items-center gap-1.5 text-[#FFD88A]">
                  <span>{t('more.vipCardTitle', 'सदस्यता: VIP आजीवन (Lifetime) • ७ दिन फ्री ट्रायल')}</span>
                </div>
                <div className="text-[10px] text-[#D9C4A9]">
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
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-gradient-to-tr from-amber-600 to-amber-500 rounded-xl text-white shadow-xs">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#5C3A21] dark:text-[#FFD88A] flex items-center gap-1.5">
                    <span>{t('more.languageSection', 'ऐप की भाषा (App Language)')}</span>
                    <span className="text-[9px] bg-amber-600 text-white px-2 py-0.2 rounded-full font-bold">
                      {currentLang.nativeName} ({currentLang.name})
                    </span>
                  </div>
                  <div className="text-[10px] text-[#735133] dark:text-[#D9C4A9]">
                    English, हिन्दी, ગુજરાતી, मराठी, தமிழ், తెలుగు & 10+ languages
                  </div>
                </div>
              </div>
              <span className="text-xs text-amber-700 dark:text-amber-300 font-bold">
                {t('common.select', 'चुनें')} →
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
              <div className="flex items-center gap-2.5 text-left">
                <div className="p-2 bg-white/20 rounded-xl text-white">
                  <Share2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold flex items-center gap-1">
                    <span>📲 {t('more.whatsappCardTitle', 'व्हाट्सएप सुप्रभात पंचांग कार्ड')}</span>
                  </div>
                  <div className="text-[10px] text-white/90">
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
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-[#5C3A21] rounded-xl text-[#FFD88A]">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#5C3A21] dark:text-[#FFD88A] flex items-center gap-1.5">
                    <span>📇 {t('more.astrologerBranding', 'ज्योतिषी विज़िटिंग कार्ड व ब्रांडिंग')}</span>
                    {branding.enabled && (
                      <span className="text-[9px] bg-[#B56A00] text-white px-1.5 py-0.2 rounded font-medium">
                        {t('common.active', 'सक्रिय')}
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-[#735133] dark:text-[#D9C4A9]">
                    {branding.enabled
                      ? `${branding.name} • ${branding.phone || branding.city}`
                      : t('more.brandingDefaultDesc', 'पंचांग कार्ड व कुंडली पर अपना नाम/नंबर जोड़ें')}
                  </div>
                </div>
              </div>
              <span className="text-xs text-[#B56A00] font-bold">{t('more.setBtn', 'सेट करें')} →</span>
            </button>
          </div>
        )}

        {/* Grid Options */}
        <div className="grid grid-cols-2 gap-2 my-3">
          {/* श्री दुर्गा सप्तशती सम्पूर्ण */}
          <button
            type="button"
            onClick={() => handleAction(() => onSelectTab('durga'))}
            className="flex items-center gap-2.5 p-2.5 bg-gradient-to-r from-[#FFFDF9] to-[#FBF0DD] dark:bg-[#341F14] hover:bg-[#EBD8BD] border border-[#B56A00]/40 rounded-2xl text-left transition cursor-pointer active:scale-95 col-span-2 relative m3-touch shadow-2xs"
          >
            <div className="p-2 bg-gradient-to-br from-rose-700 to-amber-700 text-white rounded-xl shadow-xs">
              <Flame className="w-5 h-5 text-amber-200" />
            </div>
            <div className="flex-1">
              <div className="text-xs font-bold text-[#5C3A21] dark:text-[#FFD88A] flex items-center justify-between">
                <span>🔱 {t('nav.durga', 'श्री दुर्गा सप्तशती (सम्पूर्ण १३ अध्याय)')}</span>
                <span className="text-[10px] bg-[#B56A00] text-white px-2 py-0.5 rounded-full font-bold">{t('common.newBadge', 'नया')}</span>
              </div>
              <div className="text-[10px] text-[#735133] dark:text-[#D9C4A9]">{t('more.durgaDesc', 'कवच, अर्गला, कीलक, सिद्ध कुंजिका स्तोत्र व आरती सहित')}</div>
            </div>
          </button>

          {/* वैदिक अंक ज्योतिष व लो शू चक्र */}
          <button
            type="button"
            onClick={() => handleAction(() => onSelectTab('numerology'))}
            className="flex items-center gap-2.5 p-2.5 bg-gradient-to-r from-[#FAF2E4] to-[#FBF0DD] dark:bg-[#341F14] hover:bg-[#EBD8BD] border border-[#B56A00]/40 rounded-2xl text-left transition cursor-pointer active:scale-95 col-span-2 relative m3-touch shadow-2xs"
          >
            <div className="p-2 bg-gradient-to-br from-amber-600 to-amber-700 text-white rounded-xl shadow-xs">
              <Sparkles className="w-5 h-5 text-amber-200" />
            </div>
            <div className="flex-1">
              <div className="text-xs font-bold text-[#5C3A21] dark:text-[#FFD88A] flex items-center justify-between">
                <span>🔢 {language === 'en' ? 'Vedic Numerology & Lo Shu Grid' : language === 'gu' ? 'વૈદિક અંક જ્યોતિષ અને લો-શૂ' : 'वैदिक अंक ज्योतिष व लो शू चक्र'}</span>
                <span className="text-[10px] bg-[#B56A00] text-white px-2 py-0.5 rounded-full font-bold">100% सक्रिय</span>
              </div>
              <div className="text-[10px] text-[#735133] dark:text-[#D9C4A9]">
                {language === 'en' ? 'Mulank, Bhagyank, Namank, Lo Shu Matrix & Upays' : language === 'gu' ? 'મૂળાંક, ભાગ્યાંક, નામાંક, લો-શૂ અને સચોટ ઉપાય' : 'मूलांक, भाग्यांक, नामांक, कुआ अंक, लो शू ग्रिड व सम्पूर्ण अंक उपाय'}
              </div>
            </div>
          </button>

          {/* ग्रह शांति व चमत्कारी उपाय */}
          <button
            type="button"
            onClick={() => handleAction(() => onSelectTab('upay'))}
            className="flex items-center gap-2 p-2.5 bg-[#F4E8D1] dark:bg-[#341F14] hover:bg-[#EBD8BD] border border-[#8C6239]/30 rounded-2xl text-left transition cursor-pointer active:scale-95 relative m3-touch"
          >
            <div className="p-2 bg-[#5C3A21] text-[#FAF2E4] rounded-xl">
              <Sparkles className="w-4 h-4 text-[#FFD88A]" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#5C3A21] dark:text-[#FFD88A] flex items-center gap-1">
                <span>{t('nav.upay', 'चमत्कारी उपाय')}</span>
              </div>
              <div className="text-[10px] text-[#735133] dark:text-[#D9C4A9]">{t('more.upayDesc', 'ग्रह शांति व लाल किताब')}</div>
            </div>
          </button>

          {/* वैदिक वास्तु शास्त्र */}
          <button
            type="button"
            onClick={() => handleAction(() => onSelectTab('vastu'))}
            className="flex items-center gap-2 p-2.5 bg-[#F4E8D1] dark:bg-[#341F14] hover:bg-[#EBD8BD] border border-[#8C6239]/30 rounded-2xl text-left transition cursor-pointer active:scale-95 relative m3-touch"
          >
            <div className="p-2 bg-[#5C3A21] text-[#FAF2E4] rounded-xl">
              <Home className="w-4 h-4 text-[#FFD88A]" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#5C3A21] dark:text-[#FFD88A] flex items-center gap-1">
                <span>{t('nav.vastu', 'वास्तु शास्त्र')}</span>
              </div>
              <div className="text-[10px] text-[#735133] dark:text-[#D9C4A9]">{t('more.vastuDesc', '८ दिशाएं व बिना तोड़-फोड़ टिप्स')}</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleAction(() => onSelectTab('vratkatha'))}
            className="flex items-center gap-2.5 p-2.5 bg-[#F4E8D1] dark:bg-[#341F14] hover:bg-[#EBD8BD] border border-[#8C6239]/30 rounded-2xl text-left transition cursor-pointer active:scale-95 col-span-2 relative m3-touch"
          >
            <div className="p-2 bg-[#5C3A21] text-[#FAF2E4] rounded-xl">
              <BookOpen className="w-4 h-4 text-[#FFD88A]" />
            </div>
            <div className="flex-1">
              <div className="text-xs font-bold text-[#5C3A21] dark:text-[#FFD88A] flex items-center gap-1">
                <span>📖 {t('nav.vratkatha', 'व्रत कथा, पूजा विधि व आरती संग्रह')}</span>
              </div>
              <div className="text-[10px] text-[#735133] dark:text-[#D9C4A9]">{t('more.vratkathaDesc', 'सत्यनारायण, एकादशी, प्रदोष कथा व नित्य स्तोत्र')}</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleAction(() => onSelectTab('yatra'))}
            className="flex items-center gap-2 p-2 bg-[#F4E8D1] dark:bg-[#341F14] hover:bg-[#EBD8BD] border border-[#8C6239]/30 rounded-2xl text-left transition cursor-pointer active:scale-95 relative m3-touch"
          >
            <div className="p-2 bg-[#5C3A21] text-[#FAF2E4] rounded-xl">
              <Compass className="w-4 h-4 text-[#FFD88A]" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#5C3A21] dark:text-[#FFD88A] flex items-center gap-1">
                <span>{t('nav.yatra', 'यात्रा दिशाशूल')}</span>
              </div>
              <div className="text-[10px] text-[#735133] dark:text-[#D9C4A9]">{t('more.yatraDesc', 'निवारण व उपाय')}</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleAction(() => onSelectTab('milan'))}
            className="flex items-center gap-2 p-2 bg-[#F4E8D1] dark:bg-[#341F14] hover:bg-[#EBD8BD] border border-[#8C6239]/30 rounded-2xl text-left transition cursor-pointer active:scale-95 relative m3-touch"
          >
            <div className="p-2 bg-[#5C3A21] text-[#FAF2E4] rounded-xl">
              <Heart className="w-4 h-4 text-[#FFD88A]" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#5C3A21] dark:text-[#FFD88A] flex items-center gap-1">
                <span>{t('nav.milan', 'कुंडली मिलान')}</span>
              </div>
              <div className="text-[10px] text-[#735133] dark:text-[#D9C4A9]">{t('more.milanDesc', 'अष्टकूट ३६ गुण')}</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleAction(() => onSelectTab('reminders'))}
            className="flex items-center gap-2 p-2 bg-[#F4E8D1] dark:bg-[#341F14] hover:bg-[#EBD8BD] border border-[#8C6239]/30 rounded-2xl text-left transition cursor-pointer active:scale-95 relative m3-touch"
          >
            <div className="p-2 bg-[#5C3A21] text-[#FAF2E4] rounded-xl">
              <Bell className="w-4 h-4 text-[#FFD88A]" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#5C3A21] dark:text-[#FFD88A] flex items-center gap-1">
                <span>{t('nav.reminders', 'दैनिक स्मृति व उपाय')}</span>
              </div>
              <div className="text-[10px] text-[#735133] dark:text-[#D9C4A9]">{t('more.remindersDesc', 'व्रत-पर्व सूचना')}</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleAction(onToggleBookCover)}
            className="flex items-center gap-2 p-2 bg-[#F4E8D1] dark:bg-[#341F14] hover:bg-[#EBD8BD] border border-[#8C6239]/30 rounded-2xl text-left transition cursor-pointer active:scale-95 m3-touch"
          >
            <div className="p-2 bg-[#5C3A21] text-[#FAF2E4] rounded-xl">
              <BookOpen className="w-4 h-4 text-[#FFD88A]" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#5C3A21] dark:text-[#FFD88A]">{t('more.granthaIndex', 'ग्रंथ मुखपृष्ठ')}</div>
              <div className="text-[10px] text-[#735133] dark:text-[#D9C4A9]">{t('more.granthDesc', 'पारंपरिक परिचय')}</div>
            </div>
          </button>
        </div>

        {/* VIP Spiritual Modules Section */}
        <div className="my-3 space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-black text-amber-800 dark:text-amber-300 uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>{t('spiritual.vipSectionTitle', 'प्रीमियम दिव्य विधाएं (Spiritual Modules)')}</span>
            </span>
            <span className="text-[10px] bg-gradient-to-r from-amber-600 to-yellow-500 text-stone-950 px-2 py-0.5 rounded-full font-black uppercase tracking-wider shadow-2xs">
              {t('spiritual.vipBadge', 'VIP $1')}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {/* 1. Palmistry */}
            <button
              type="button"
              onClick={() => handleAction(() => onSelectTab('palmistry'))}
              className="flex items-center gap-2 p-2.5 bg-[#FAF2E4] dark:bg-[#2A1508] hover:bg-[#EBD8BD] border border-amber-600/30 rounded-2xl text-left transition cursor-pointer active:scale-95 relative m3-touch shadow-2xs"
            >
              <div className="p-2 bg-gradient-to-br from-[#5C3A21] to-[#8C6239] text-[#FAF2E4] rounded-xl shadow-xs shrink-0">
                <Hand className="w-4 h-4 text-[#FFD88A]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-[#5C3A21] dark:text-[#FFD88A] truncate">
                  {t('palmistry.title', 'हस्तरेखा दर्शन')}
                </div>
                <div className="text-[10px] text-[#735133] dark:text-[#D9C4A9] truncate">
                  {t('palmistry.subtitleShort', 'कैमरा स्कैन व रेखा विचार')}
                </div>
              </div>
            </button>

            {/* 2. Tarot Card Reading */}
            <button
              type="button"
              onClick={() => handleAction(() => onSelectTab('tarot'))}
              className="flex items-center gap-2 p-2.5 bg-[#FAF2E4] dark:bg-[#2A1508] hover:bg-[#EBD8BD] border border-purple-500/30 rounded-2xl text-left transition cursor-pointer active:scale-95 relative m3-touch shadow-2xs"
            >
              <div className="p-2 bg-gradient-to-br from-[#311847] to-[#5C2B72] text-[#FAF2E4] rounded-xl shadow-xs shrink-0">
                <Sparkles className="w-4 h-4 text-purple-200" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-[#5C3A21] dark:text-[#FFD88A] truncate">
                  {t('tarot.title', 'टैरो कार्ड रीडिंग')}
                </div>
                <div className="text-[10px] text-[#735133] dark:text-[#D9C4A9] truncate">
                  {t('tarot.subtitleShort', '२२ मेजर अरकाना फलादेश')}
                </div>
              </div>
            </button>

            {/* 3. Gemology */}
            <button
              type="button"
              onClick={() => handleAction(() => onSelectTab('gemology'))}
              className="flex items-center gap-2 p-2.5 bg-[#FAF2E4] dark:bg-[#2A1508] hover:bg-[#EBD8BD] border border-emerald-500/30 rounded-2xl text-left transition cursor-pointer active:scale-95 relative m3-touch shadow-2xs"
            >
              <div className="p-2 bg-gradient-to-br from-[#1C3A27] to-[#2D5A3E] text-[#FAF2E4] rounded-xl shadow-xs shrink-0">
                <Award className="w-4 h-4 text-emerald-200" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-[#5C3A21] dark:text-[#FFD88A] truncate">
                  {t('gemology.title', 'वैदिक रत्न विज्ञान')}
                </div>
                <div className="text-[10px] text-[#735133] dark:text-[#D9C4A9] truncate">
                  {t('gemology.subtitleShort', '९ रत्न, उपरत्न व धातु')}
                </div>
              </div>
            </button>

            {/* 4. Face Reading */}
            <button
              type="button"
              onClick={() => handleAction(() => onSelectTab('face_reading'))}
              className="flex items-center gap-2 p-2.5 bg-[#FAF2E4] dark:bg-[#2A1508] hover:bg-[#EBD8BD] border border-amber-600/30 rounded-2xl text-left transition cursor-pointer active:scale-95 relative m3-touch shadow-2xs"
            >
              <div className="p-2 bg-gradient-to-br from-[#5C3A21] to-[#8C6239] text-[#FAF2E4] rounded-xl shadow-xs shrink-0">
                <Eye className="w-4 h-4 text-[#FFD88A]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-[#5C3A21] dark:text-[#FFD88A] truncate">
                  {t('faceReading.title', 'सामुद्रिक मुख लक्षण')}
                </div>
                <div className="text-[10px] text-[#735133] dark:text-[#D9C4A9] truncate">
                  {t('faceReading.subtitleShort', 'मुख आकृति व प्राण ओजस')}
                </div>
              </div>
            </button>

            {/* 5. I-Ching */}
            <button
              type="button"
              onClick={() => handleAction(() => onSelectTab('iching'))}
              className="flex items-center gap-2 p-2.5 bg-[#FAF2E4] dark:bg-[#2A1508] hover:bg-[#EBD8BD] border border-purple-500/30 rounded-2xl text-left transition cursor-pointer active:scale-95 col-span-2 relative m3-touch shadow-2xs"
            >
              <div className="p-2 bg-gradient-to-br from-[#20152B] to-[#3B2252] text-[#FAF2E4] rounded-xl shadow-xs shrink-0">
                <Coins className="w-4 h-4 text-purple-200" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-[#5C3A21] dark:text-[#FFD88A] flex items-center justify-between">
                  <span>{t('iching.title', 'आई-चिंग दैवज्ञ परामर्श (I-Ching Oracle)')}</span>
                  <span className="text-[10px] font-normal text-amber-600 dark:text-amber-400">☯️ ६४ षट्कोण</span>
                </div>
                <div className="text-[10px] text-[#735133] dark:text-[#D9C4A9] truncate">
                  {t('iching.subtitleShort', 'प्राचीन ३ कांस्य मुद्रा उछाल द्वारा दिव्य निर्णय व मार्गदर्शन')}
                </div>
              </div>
            </button>
          </div>
        </div>

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

        {/* Sacred Brand Footer */}
        <div className="flex items-center justify-center gap-2 pt-3 mt-3 border-t border-[#8C6239]/20 text-center">
          <ShaktiLogo size={20} className="shrink-0" />
          <span className="text-[11px] font-bold text-[#8C6239] font-granth">
            {t('common.appName', 'शक्ति पंचांग')} • {t('common.poweredBy', 'Powered by Shiv Shakti Astro')}
          </span>
        </div>
        <a
          href="https://shastrimanish-debug.github.io/shakti_panchang/privacy.html"
          target="_blank"
          rel="noopener noreferrer"
          className="block text-center text-[11px] font-bold text-[#8C6239] underline pt-2"
        >
          {t('more.privacyPolicy', 'गोपनीयता नीति')}
        </a>
      </div>
    </div>
  );
};
