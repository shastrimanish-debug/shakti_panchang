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
  Lock,
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

  const handlePremiumAction = (action: () => void, featureName: string) => {
    if (!isEntitled) {
      onClose();
      onOpenSubscriptionModal?.(
        `७-दिवसीय निःशुल्क परीक्षण पूर्ण हो चुका है। ${featureName} के लिए वार्षिक सदस्यता सक्रिय करें।`
      );
      return;
    }
    handleAction(action);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#FAF2E4] text-[#3E2714] rounded-t-2xl sm:rounded-2xl border-t-2 sm:border-2 border-[#8C6239] shadow-2xl p-4 sm:p-5 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#8C6239]/30">
          <div className="flex items-center gap-2">
            <ShaktiLogo size={24} className="shrink-0" />
            <h3 className="font-granth font-bold text-base text-[#5C3A21]">
              अतिरिक्त सेवाएँ व विकल्प
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-[#F4E8D1] rounded-full text-[#8C6239] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Subscription / VIP Status Card */}
        <div className="mt-3.5">
          <button
            type="button"
            onClick={() => handleAction(() => onOpenSubscriptionModal?.())}
            className={`w-full p-3 rounded-xl border flex items-center justify-between transition cursor-pointer shadow-xs active:scale-95 ${
              isEntitled
                ? 'bg-gradient-to-r from-[#5C3A21] to-[#462B17] text-[#FAF2E4] border-[#B56A00]'
                : 'bg-gradient-to-r from-amber-900 to-amber-950 text-[#FAF2E4] border-amber-500'
            }`}
          >
            <div className="flex items-center gap-2.5 text-left">
              <div className="p-2 bg-[#B56A00] rounded-lg text-white shadow-2xs">
                <Crown className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-bold flex items-center gap-1.5 text-[#FFD88A]">
                  <span>वार्षिक सदस्यता व VIP</span>
                  {!isEntitled && (
                    <span className="text-[9px] bg-red-600 text-white px-1.5 py-0.2 rounded font-bold">
                      लॉक
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-[#D9C4A9]">
                  {isEntitled
                    ? status.kind === 'lifetime'
                      ? 'आजीवन VIP सदस्यता सक्रिय'
                      : `सक्रिय (${status.daysRemaining} दिन शेष) • ₹99/वर्ष`
                    : '७ दिन समाप्त • केवल मुख्य पंचांग फ्री • ₹99/वर्ष'}
                </div>
              </div>
            </div>
            <span className="text-[11px] bg-[#B56A00] text-white px-2.5 py-1 rounded-lg font-bold shrink-0">
              {isEntitled ? 'विवरण' : 'सक्रिय करें'}
            </span>
          </button>
        </div>

        {/* Highlight Banner: 1-Click WhatsApp Daily Panchang Card */}
        {onOpenWhatsAppPanchang && (
          <div className="mt-2.5">
            <button
              type="button"
              onClick={() => handlePremiumAction(onOpenWhatsAppPanchang, 'व्हाट्सएप पंचांग कार्ड')}
              className="w-full p-2.5 bg-gradient-to-r from-[#25D366] to-[#1EBE5D] hover:from-[#20bd5a] hover:to-[#1aa852] text-white rounded-xl shadow-xs flex items-center justify-between transition cursor-pointer active:scale-95"
            >
              <div className="flex items-center gap-2.5 text-left">
                <div className="p-2 bg-white/20 rounded-lg text-white">
                  <Share2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold flex items-center gap-1">
                    <span>📲 व्हाट्सएप सुप्रभात पंचांग कार्ड</span>
                    {!isEntitled && <Lock className="w-3 h-3 text-white" />}
                  </div>
                  <div className="text-[10px] text-white/90">
                    आज का पंचांग व सुविचार 1-क्लिक में शेयर करें
                  </div>
                </div>
              </div>
              <span className="text-[11px] bg-white text-[#1EBE5D] px-2 py-0.5 rounded-lg font-bold">
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
              className="w-full p-2.5 bg-[#F4E8D1] hover:bg-[#EBD8BD] border border-[#8C6239]/40 rounded-xl flex items-center justify-between text-left transition cursor-pointer active:scale-95"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-[#5C3A21] rounded-lg text-[#FFD88A]">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#5C3A21] flex items-center gap-1.5">
                    <span>📇 पंडित जी / ज्योतिषी विज़िटिंग कार्ड</span>
                    {branding.enabled && (
                      <span className="text-[9px] bg-[#B56A00] text-white px-1.5 py-0.2 rounded font-medium">
                        सक्रिय
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-[#735133]">
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
            onClick={() => handlePremiumAction(() => onSelectTab('vratkatha'), 'व्रत कथा व आरती')}
            className="flex items-center gap-2.5 p-2.5 bg-[#F4E8D1] hover:bg-[#EBD8BD] border border-[#8C6239]/30 rounded-xl text-left transition cursor-pointer active:scale-95 col-span-2 relative"
          >
            <div className="p-2 bg-[#5C3A21] text-[#FAF2E4] rounded-lg">
              <BookOpen className="w-4 h-4 text-[#FFD88A]" />
            </div>
            <div className="flex-1">
              <div className="text-xs font-bold text-[#5C3A21] flex items-center gap-1">
                <span>📖 व्रत कथा, पूजा विधि व आरती संग्रह</span>
                {!isEntitled && <Lock className="w-3 h-3 text-[#B56A00]" />}
              </div>
              <div className="text-[10px] text-[#735133]">सत्यनारायण, एकादशी, प्रदोष कथा व नित्य स्तोत्र</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handlePremiumAction(() => onSelectTab('yatra'), 'यात्रा दिशाशूल')}
            className="flex items-center gap-2 p-2 bg-[#F4E8D1] hover:bg-[#EBD8BD] border border-[#8C6239]/30 rounded-xl text-left transition cursor-pointer active:scale-95 relative"
          >
            <div className="p-2 bg-[#5C3A21] text-[#FAF2E4] rounded-lg">
              <Compass className="w-4 h-4 text-[#FFD88A]" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#5C3A21] flex items-center gap-1">
                <span>यात्रा दिशाशूल</span>
                {!isEntitled && <Lock className="w-2.5 h-2.5 text-[#B56A00]" />}
              </div>
              <div className="text-[10px] text-[#735133]">निवारण व उपाय</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handlePremiumAction(() => onSelectTab('milan'), 'कुंडली मिलान')}
            className="flex items-center gap-2 p-2 bg-[#F4E8D1] hover:bg-[#EBD8BD] border border-[#8C6239]/30 rounded-xl text-left transition cursor-pointer active:scale-95 relative"
          >
            <div className="p-2 bg-[#5C3A21] text-[#FAF2E4] rounded-lg">
              <Heart className="w-4 h-4 text-[#FFD88A]" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#5C3A21] flex items-center gap-1">
                <span>कुंडली मिलान</span>
                {!isEntitled && <Lock className="w-2.5 h-2.5 text-[#B56A00]" />}
              </div>
              <div className="text-[10px] text-[#735133]">अष्टकूट ३६ गुण</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handlePremiumAction(() => onSelectTab('reminders'), 'दैनिक स्मृति')}
            className="flex items-center gap-2 p-2 bg-[#F4E8D1] hover:bg-[#EBD8BD] border border-[#8C6239]/30 rounded-xl text-left transition cursor-pointer active:scale-95 relative"
          >
            <div className="p-2 bg-[#5C3A21] text-[#FAF2E4] rounded-lg">
              <Bell className="w-4 h-4 text-[#FFD88A]" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#5C3A21] flex items-center gap-1">
                <span>दैनिक स्मृति व उपाय</span>
                {!isEntitled && <Lock className="w-2.5 h-2.5 text-[#B56A00]" />}
              </div>
              <div className="text-[10px] text-[#735133]">व्रत-पर्व सूचना</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleAction(onToggleBookCover)}
            className="flex items-center gap-2 p-2 bg-[#F4E8D1] hover:bg-[#EBD8BD] border border-[#8C6239]/30 rounded-xl text-left transition cursor-pointer active:scale-95"
          >
            <div className="p-2 bg-[#5C3A21] text-[#FAF2E4] rounded-lg">
              <BookOpen className="w-4 h-4 text-[#FFD88A]" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#5C3A21]">ग्रंथ मुखपृष्ठ</div>
              <div className="text-[10px] text-[#735133]">पारंपरिक परिचय</div>
            </div>
          </button>
        </div>

        {/* Quick Settings Bar */}
        <div className="bg-[#F4E8D1] p-3 rounded-xl border border-[#8C6239]/30 space-y-2">
          <div className="text-[11px] font-bold text-[#8C6239] uppercase tracking-wider">
            सेटिंग्स व प्राथमिकताएँ
          </div>

          <div className="flex items-center justify-between text-xs py-1">
            <span className="flex items-center gap-1.5 font-medium text-[#5C3A21]">
              <MapPin className="w-3.5 h-3.5 text-[#B56A00]" />
              स्थान: {currentLocation.name}
            </span>
            <button
              type="button"
              onClick={() => handleAction(onOpenLocationModal)}
              className="px-2 py-0.5 bg-[#FAF2E4] border border-[#8C6239]/40 rounded font-bold text-[#5C3A21] cursor-pointer"
            >
              बदलें
            </button>
          </div>

          <div className="flex items-center justify-between text-xs py-1 border-t border-[#8C6239]/20">
            <span className="flex items-center gap-1.5 font-medium text-[#5C3A21]">
              {theme === 'tamra' ? <Moon className="w-3.5 h-3.5 text-amber-500" /> : <Sun className="w-3.5 h-3.5 text-amber-600" />}
              थीम: {theme === 'tamra' ? 'ताम्र-रात्रि (डार्क)' : 'भोजपत्र (लाइट)'}
            </span>
            <button
              type="button"
              onClick={onToggleTheme}
              className="px-2 py-0.5 bg-[#FAF2E4] border border-[#8C6239]/40 rounded font-bold text-[#5C3A21] cursor-pointer"
            >
              टॉगल करें
            </button>
          </div>

          <div className="flex items-center justify-between text-xs py-1 border-t border-[#8C6239]/20">
            <span className="flex items-center gap-1.5 font-medium text-[#5C3A21]">
              {isAudioEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-600" /> : <VolumeX className="w-3.5 h-3.5 text-stone-500" />}
              पृष्ठ पलटने की ध्वनि: {isAudioEnabled ? 'चालू' : 'बंद'}
            </span>
            <button
              type="button"
              onClick={onToggleAudio}
              className="px-2 py-0.5 bg-[#FAF2E4] border border-[#8C6239]/40 rounded font-bold text-[#5C3A21] cursor-pointer"
            >
              {isAudioEnabled ? 'बंद करें' : 'चालू करें'}
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 mt-3.5">
          <button
            type="button"
            onClick={() => handlePremiumAction(onOpenUmaModal, 'उमा AI दैवज्ञ परामर्श')}
            className="w-full py-2.5 px-3 bg-gradient-to-r from-[#B56A00] to-[#C67D24] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-[#FFD88A]" />
            <span>उमा AI से परामर्श {!isEntitled && '🔒'}</span>
          </button>
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
