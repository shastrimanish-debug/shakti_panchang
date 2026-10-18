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
            onClick={onClose}
            className="bx-iconbtn shrink-0"
            aria-label={t('common.close', 'बंद करें')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      <ZeroScrollPager className="flex-1 min-h-0 w-full" contentClassName="bx-more-flow px-3 pt-2 pb-1">

        {/* Big Prominent Senior Citizen Audio Player Hero Card */}
        <div className="mt-2.5">
          <button
            type="button"
            onClick={() => handleAction(() => onSelectTab('audio_player'))}
            className="w-full p-3 rounded-2xl bg-gradient-to-r from-[#5C3A21] via-[#8C6239] to-[#5C3A21] text-[#FAF2E4] font-bold flex items-center justify-between shadow-md border border-amber-400/60 transition cursor-pointer active:scale-95 m3-touch"
          >
            <div className="flex items-center gap-3 text-left min-w-0 flex-1">
              <div className="w-10 h-10 rounded-full bg-amber-400 text-stone-950 flex items-center justify-center shadow-md font-black shrink-0">
                <Volume2 className="w-5 h-5 fill-current" />
              </div>
              <div className="min-w-0">
                <div className="text-xs sm:text-sm font-black text-[#FFD88A] leading-snug">
                  🎧 सुरीला भक्ति संगीत व स्वर पाठ (70+ सुगम मोड)
                </div>
                <div className="text-[10px] text-[#D9C4A9] leading-snug mt-0.5">
                  शिव महिम्न, हनुमान चालीसा, दुर्गा सप्तशती, आरतियाँ व जाप — कॉपीराइट मुक्त सुरों में
                </div>
              </div>
            </div>
            <span className="text-[10px] bg-amber-400 text-stone-950 px-2.5 py-1 rounded-full font-black shrink-0">
              सुनें ▶
            </span>
          </button>
        </div>
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

        {/* Grid Options */}
        <div className="grid grid-cols-2 gap-2 my-3">
          {/* iOS Bento Box Dashboard */}
          <button
            type="button"
            onClick={() => handleAction(() => onSelectTab('panchang'))}
            className="flex items-center gap-2.5 p-2.5 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-stone-950 rounded-2xl text-left transition cursor-pointer active:scale-95 col-span-2 relative m3-touch shadow-md border border-amber-300"
          >
            <div className="p-2 bg-stone-950 text-amber-300 rounded-xl shadow-xs">
              <Home className="w-5 h-5 text-amber-300" />
            </div>
            <div className="flex-1">
              <div className="text-xs font-black text-stone-950 flex items-start justify-between gap-2">
                <span className="min-w-0 leading-snug">📱 iOS Bento Box डैशबोर्ड</span>
                <span className="text-[10px] bg-stone-950 text-amber-300 px-2 py-0.5 rounded-full font-bold">नया</span>
              </div>
              <div className="text-[10px] text-stone-900 font-bold">
                आधुनिक विजेट लेआउट में पंचांग, मुहूर्त, चौघड़िया, गीता सीख व ज्योतिष सेवाएँ
              </div>
            </div>
          </button>
          {/* 📕 लाल किताब के १०० अचूक उपाय */}
          <button
            type="button"
            onClick={() => handleAction(() => onSelectTab('lal_kitab'))}
            className="flex items-center gap-2.5 p-3 bg-gradient-to-r from-[#4A0E17] via-[#7F1D1D] to-[#4A0E17] text-amber-100 rounded-2xl text-left transition cursor-pointer active:scale-95 col-span-2 relative m3-touch shadow-lg border-2 border-amber-400/60"
          >
            <div className="p-2 bg-amber-500/20 border border-amber-300/40 text-amber-200 rounded-xl shadow-xs text-lg leading-none">
              📕
            </div>
            <div className="flex-1">
              <div className="text-xs sm:text-sm font-black text-amber-200 flex items-center justify-between">
                <span>लाल किताब के 501 उपाय</span>
                <span className="text-[10px] bg-amber-400 text-stone-950 px-2 py-0.5 rounded-full font-black">100/100</span>
              </div>
              <div className="text-[10px] text-amber-100/85 font-semibold">
                नवग्रह व १२ भावों के सिद्ध लाल किताब टोटके, सामग्री, ४३ दिन की विधि व सावधानियां
              </div>
            </div>
          </button>
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
          <button
            type="button"
            onClick={() => handleAction(() => onSelectTab('hanuman'))}
            className="flex items-center gap-2.5 p-2.5 bg-gradient-to-r from-[#FFFDF9] to-[#FBF0DD] dark:bg-[#341F14] border border-[#B56A00]/40 rounded-2xl text-left col-span-2"
          >
            <div className="p-2 bg-gradient-to-br from-orange-700 to-amber-600 text-white rounded-xl">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="text-xs font-bold text-[#5C3A21] dark:text-[#FFD88A]">🙏 श्री हनुमान चालीसा</div>
              <div className="text-[10px] text-[#735133] dark:text-[#D9C4A9]">दोहा और चालीस चौपाई, संपूर्ण पाठ</div>
            </div>
          </button>
          <button
            type="button"
            onClick={() => handleAction(() => onSelectTab('sundarkand'))}
            className="flex items-center gap-2.5 p-2.5 bg-gradient-to-r from-[#FFFDF9] to-[#FBF0DD] dark:bg-[#341F14] border border-[#B56A00]/40 rounded-2xl text-left col-span-2"
          >
            <div className="p-2 bg-gradient-to-br from-amber-800 to-orange-700 text-white rounded-xl">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="text-xs font-bold text-[#5C3A21] dark:text-[#FFD88A]">📖 संपूर्ण सुंदरकांड</div>
              <div className="text-[10px] text-[#735133] dark:text-[#D9C4A9]">रामचरितमानस, चौपाई और दोहा</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleAction(() => onSelectTab('jain_mantras'))}
            className="flex items-center gap-2.5 p-2.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-stone-950 font-black rounded-2xl text-left col-span-2 shadow-md border border-amber-300 transition cursor-pointer active:scale-95 m3-touch"
          >
            <div className="p-2 bg-stone-950 text-amber-300 rounded-xl shadow-xs">
              <Sparkles className="w-5 h-5 fill-amber-300 text-amber-300" />
            </div>
            <div className="flex-1">
              <div className="text-xs font-black text-stone-950 flex items-center justify-between">
                <span>☸ 501 जैन अभ्यास</span>
                <span className="text-[10px] bg-stone-950 text-amber-300 px-2 py-0.5 rounded-full font-bold">100/100</span>
              </div>
              <div className="text-[10px] text-stone-900 font-bold">
                णमोकार, अहिंसा और मैत्री पर 501 अभ्यास
              </div>
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

          {/* मासिक सनातन कालनिर्णय पंचांग */}
          <button
            type="button"
            onClick={() => handleAction(() => onSelectTab('kalnirnay'))}
            className="flex items-center gap-2.5 p-2.5 bg-gradient-to-r from-[#FFFDF9] to-[#FBF0DD] dark:bg-[#341F14] border border-[#B56A00]/40 rounded-2xl text-left col-span-2 shadow-2xs cursor-pointer active:scale-95"
          >
            <div className="p-2 bg-gradient-to-br from-[#B56A00] to-[#8C6239] text-white rounded-xl shadow-xs">
              <Calendar className="w-5 h-5 text-amber-200" />
            </div>
            <div className="flex-1">
              <div className="text-xs font-bold text-[#5C3A21] dark:text-[#FFD88A] flex items-center justify-between">
                <span>📅 मासिक सनातन कालनिर्णय पंचांग</span>
                <span className="text-[10px] bg-[#B56A00] text-white px-2 py-0.5 rounded-full font-bold">12 माह</span>
              </div>
              <div className="text-[10px] text-[#735133] dark:text-[#D9C4A9]">
                संपूर्ण १२ महीनों का पंचांग, एकादशी, प्रदोष, व्रत-त्योहार व मुहूर्त कैलेंडर
              </div>
            </div>
          </button>

          {/* अष्टकूट ३६ गुण विवाह मिलान */}
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
                <span>{t('nav.milan', 'अष्टकूट विवाह मिलान')}</span>
              </div>
              <div className="text-[10px] text-[#735133] dark:text-[#D9C4A9]">{t('more.milanDesc', '३६ गुण व मांगलिक विचार')}</div>
            </div>
          </button>

          {/* तात्कालिक प्रश्न कुंडली */}
          <button
            type="button"
            onClick={() => handleAction(() => onSelectTab('prashna'))}
            className="flex items-center gap-2 p-2 bg-[#F4E8D1] dark:bg-[#341F14] hover:bg-[#EBD8BD] border border-[#8C6239]/30 rounded-2xl text-left transition cursor-pointer active:scale-95 relative m3-touch"
          >
            <div className="p-2 bg-[#5C3A21] text-[#FAF2E4] rounded-xl">
              <HelpCircle className="w-4 h-4 text-[#FFD88A]" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#5C3A21] dark:text-[#FFD88A] flex items-center gap-1">
                <span>तात्कालिक प्रश्न कुंडली</span>
              </div>
              <div className="text-[10px] text-[#735133] dark:text-[#D9C4A9]">तत्काल प्रश्न व कार्यसिद्धि</div>
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
      </ZeroScrollPager>
      </div>
    </div>
  );
};
