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
} from 'lucide-react';
import { SavedLocation } from '../types';
import { AppTheme, getAstrologerBranding } from '../services/storage';
import { useLicense } from '../lib/license-client';

interface MoreMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tabId: string) => void;
  onOpenLocationModal: () => void;
  onOpenUmaModal: () => void;
  onToggleBookCover: () => void;
  onOpenWhatsAppPanchang?: () => void;
  onOpenBrandingModal?: () => void;
  onOpenSubscriptionModal?: (reason?: string) => void;
  currentLocation: SavedLocation;
  theme: AppTheme;
  onToggleTheme: () => void;
  isAudioEnabled: boolean;
  onToggleAudio: () => void;
}

export const MoreMenuModal: React.FC<MoreMenuModalProps> = ({
  isOpen,
  onClose,
  onSelectTab,
  onOpenLocationModal,
  onOpenUmaModal,
  onToggleBookCover,
  onOpenWhatsAppPanchang,
  onOpenBrandingModal,
  onOpenSubscriptionModal,
  currentLocation,
  theme,
  onToggleTheme,
  isAudioEnabled,
  onToggleAudio,
}) => {
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
              अतिरिक्त सेवाएँ व विकल्प
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
                  उमा AI वैदिक दैवज्ञ परामर्श ✨
                </div>
                <div className="text-[11px] text-stone-900 font-medium">
                  कुंडली, मुहूर्त, गोचर, उपाय व प्रश्न विचार 100% सक्रिय
                </div>
              </div>
            </div>
            <span className="text-[11px] bg-stone-950 text-amber-300 px-3 py-1 rounded-full font-black shrink-0 shadow-xs">
              परामर्श लें →
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
                  <span>सदस्यता स्थिति: VIP आजीवन सक्रिय</span>
                </div>
                <div className="text-[10px] text-[#D9C4A9]">
                  समस्त 59-पृष्ठीय कुण्डली, विवाह मिलान, पंचांग PDF एवं उमा AI अनलॉक हैं
                </div>
              </div>
            </div>
            <span className="text-[11px] bg-[#B56A00] text-white px-2.5 py-1 rounded-lg font-bold shrink-0">
              सक्रिय
            </span>
          </button>
        </div>

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
                    <span>📲 व्हाट्सएप सुप्रभात पंचांग कार्ड</span>
                  </div>
                  <div className="text-[10px] text-white/90">
                    आज का पंचांग व सुविचार 1-क्लिक में शेयर करें
                  </div>
                </div>
              </div>
              <span className="text-[11px] bg-white text-[#1EBE5D] px-2.5 py-1 rounded-lg font-bold">
                शेयर करें
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
                    <span>📇 ज्योतिषी विज़िटिंग कार्ड व ब्रांडिंग</span>
                    {branding.enabled && (
                      <span className="text-[9px] bg-[#B56A00] text-white px-1.5 py-0.2 rounded font-medium">
                        सक्रिय
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-[#735133] dark:text-[#D9C4A9]">
                    {branding.enabled
                      ? `${branding.name} • ${branding.phone || branding.city}`
                      : 'पंचांग कार्ड व कुंडली पर अपना नाम/नंबर जोड़ें'}
                  </div>
                </div>
              </div>
              <span className="text-xs text-[#B56A00] font-bold">सेट करें →</span>
            </button>
          </div>
        )}

        {/* Grid Options */}
        <div className="grid grid-cols-2 gap-2 my-3">
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
                <span>📖 व्रत कथा, पूजा विधि व आरती संग्रह</span>
              </div>
              <div className="text-[10px] text-[#735133] dark:text-[#D9C4A9]">सत्यनारायण, एकादशी, प्रदोष कथा व नित्य स्तोत्र</div>
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
                <span>यात्रा दिशाशूल</span>
              </div>
              <div className="text-[10px] text-[#735133] dark:text-[#D9C4A9]">निवारण व उपाय</div>
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
                <span>कुंडली मिलान</span>
              </div>
              <div className="text-[10px] text-[#735133] dark:text-[#D9C4A9]">अष्टकूट ३६ गुण</div>
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
                <span>दैनिक स्मृति व उपाय</span>
              </div>
              <div className="text-[10px] text-[#735133] dark:text-[#D9C4A9]">व्रत-पर्व सूचना</div>
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
              <div className="text-xs font-bold text-[#5C3A21] dark:text-[#FFD88A]">ग्रंथ मुखपृष्ठ</div>
              <div className="text-[10px] text-[#735133] dark:text-[#D9C4A9]">पारंपरिक परिचय</div>
            </div>
          </button>
        </div>

        {/* Quick Settings Bar */}
        <div className="bg-[#F4E8D1] dark:bg-[#341F14] p-3 rounded-2xl border border-[#8C6239]/30 space-y-2">
          <div className="text-[11px] font-bold text-[#8C6239] dark:text-[#FFD88A] uppercase tracking-wider">
            सेटिंग्स व प्राथमिकताएँ
          </div>

          <div className="flex items-center justify-between text-xs py-1">
            <span className="flex items-center gap-1.5 font-medium text-[#5C3A21] dark:text-[#FAF2E4]">
              <MapPin className="w-3.5 h-3.5 text-[#B56A00]" />
              स्थान: {currentLocation.name}
            </span>
            <button
              type="button"
              onClick={() => handleAction(onOpenLocationModal)}
              className="px-2.5 py-1 bg-[#FAF2E4] dark:bg-stone-800 border border-[#8C6239]/40 rounded-lg font-bold text-[#5C3A21] dark:text-[#FAF2E4] cursor-pointer m3-touch"
            >
              बदलें
            </button>
          </div>

          <div className="flex items-center justify-between text-xs py-1 border-t border-[#8C6239]/20">
            <span className="flex items-center gap-1.5 font-medium text-[#5C3A21] dark:text-[#FAF2E4]">
              {theme === 'tamra' ? <Moon className="w-3.5 h-3.5 text-amber-500" /> : <Sun className="w-3.5 h-3.5 text-amber-600" />}
              थीम: {theme === 'tamra' ? 'ताम्र-रात्रि (डार्क)' : 'भोजपत्र (लाइट)'}
            </span>
            <button
              type="button"
              onClick={onToggleTheme}
              className="px-2.5 py-1 bg-[#FAF2E4] dark:bg-stone-800 border border-[#8C6239]/40 rounded-lg font-bold text-[#5C3A21] dark:text-[#FAF2E4] cursor-pointer m3-touch"
            >
              टॉगल करें
            </button>
          </div>

          <div className="flex items-center justify-between text-xs py-1 border-t border-[#8C6239]/20">
            <span className="flex items-center gap-1.5 font-medium text-[#5C3A21] dark:text-[#FAF2E4]">
              {isAudioEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-600" /> : <VolumeX className="w-3.5 h-3.5 text-stone-500" />}
              पृष्ठ पलटने की ध्वनि: {isAudioEnabled ? 'चालू' : 'बंद'}
            </span>
            <button
              type="button"
              onClick={onToggleAudio}
              className="px-2.5 py-1 bg-[#FAF2E4] dark:bg-stone-800 border border-[#8C6239]/40 rounded-lg font-bold text-[#5C3A21] dark:text-[#FAF2E4] cursor-pointer m3-touch"
            >
              {isAudioEnabled ? 'बंद करें' : 'चालू करें'}
            </button>
          </div>
        </div>

        {/* Sacred Brand Footer */}
        <div className="flex items-center justify-center gap-2 pt-3 mt-3 border-t border-[#8C6239]/20 text-center">
          <ShaktiLogo size={20} className="shrink-0" />
          <span className="text-[11px] font-bold text-[#8C6239] font-granth">
            सनातन शक्ति पंचांग • अचूक वैदिक गणना
          </span>
        </div>
      </div>
    </div>
  );
};
