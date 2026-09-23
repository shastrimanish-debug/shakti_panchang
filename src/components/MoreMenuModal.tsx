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
} from 'lucide-react';
import { SavedLocation } from '../types';
import { AppTheme, getAstrologerBranding } from '../services/storage';

interface MoreMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tabId: string) => void;
  onOpenLocationModal: () => void;
  onOpenUmaModal: () => void;
  onToggleBookCover: () => void;
  onOpenWhatsAppPanchang?: () => void;
  onOpenBrandingModal?: () => void;
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
  currentLocation,
  theme,
  onToggleTheme,
  isAudioEnabled,
  onToggleAudio,
}) => {
  if (!isOpen) return null;

  const branding = getAstrologerBranding();

  const handleAction = (cb?: () => void) => {
    if (cb) cb();
    onClose();
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

        {/* Highlight Banner: 1-Click WhatsApp Daily Panchang Card */}
        {onOpenWhatsAppPanchang && (
          <div className="mt-3.5">
            <button
              type="button"
              onClick={() => handleAction(onOpenWhatsAppPanchang)}
              className="w-full p-3 bg-gradient-to-r from-[#25D366] to-[#1EBE5D] hover:from-[#20bd5a] hover:to-[#1aa852] text-white rounded-xl shadow-sm flex items-center justify-between transition cursor-pointer active:scale-95"
            >
              <div className="flex items-center gap-2.5 text-left">
                <div className="p-2 bg-white/20 rounded-lg text-white">
                  <Share2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-bold">
                    📲 व्हाट्सएप सुप्रभात पंचांग कार्ड
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
              className="w-full p-2.5 bg-[#F4E8D1] hover:bg-[#EBD8BD] border-2 border-[#8C6239]/40 rounded-xl flex items-center justify-between text-left transition cursor-pointer active:scale-95"
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
        <div className="grid grid-cols-2 gap-2.5 my-3.5">
          <button
            type="button"
            onClick={() => handleAction(() => onSelectTab('vratkatha'))}
            className="flex items-center gap-2.5 p-3 bg-[#F4E8D1] hover:bg-[#EBD8BD] border border-[#8C6239]/30 rounded-xl text-left transition cursor-pointer active:scale-95 col-span-2 bg-gradient-to-r from-[#F4E8D1] to-[#EBD8BD]"
          >
            <div className="p-2 bg-[#5C3A21] text-[#FAF2E4] rounded-lg">
              <BookOpen className="w-4 h-4 text-[#FFD88A]" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#5C3A21] flex items-center gap-1">
                <span>📖 व्रत कथा, पूजा विधि व आरती संग्रह</span>
                <span className="text-[9px] bg-[#B56A00] text-white px-1.5 rounded font-bold">नया</span>
              </div>
              <div className="text-[10px] text-[#735133]">सत्यनारायण, एकादशी, प्रदोष कथा व नित्य स्तोत्र</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleAction(() => onSelectTab('yatra'))}
            className="flex items-center gap-2.5 p-3 bg-[#F4E8D1] hover:bg-[#EBD8BD] border border-[#8C6239]/30 rounded-xl text-left transition cursor-pointer active:scale-95"
          >
            <div className="p-2 bg-[#5C3A21] text-[#FAF2E4] rounded-lg">
              <Compass className="w-4 h-4 text-[#FFD88A]" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#5C3A21]">यात्रा दिशाशूल</div>
              <div className="text-[10px] text-[#735133]">निवारण व उपाय</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleAction(() => onSelectTab('milan'))}
            className="flex items-center gap-2.5 p-3 bg-[#F4E8D1] hover:bg-[#EBD8BD] border border-[#8C6239]/30 rounded-xl text-left transition cursor-pointer active:scale-95"
          >
            <div className="p-2 bg-[#5C3A21] text-[#FAF2E4] rounded-lg">
              <Heart className="w-4 h-4 text-[#FFD88A]" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#5C3A21]">कुंडली मिलान</div>
              <div className="text-[10px] text-[#735133]">अष्टकूट गुण मिलान</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleAction(() => onSelectTab('reminders'))}
            className="flex items-center gap-2.5 p-3 bg-[#F4E8D1] hover:bg-[#EBD8BD] border border-[#8C6239]/30 rounded-xl text-left transition cursor-pointer active:scale-95"
          >
            <div className="p-2 bg-[#5C3A21] text-[#FAF2E4] rounded-lg">
              <Bell className="w-4 h-4 text-[#FFD88A]" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#5C3A21]">दैनिक स्मृति व उपाय</div>
              <div className="text-[10px] text-[#735133]">व्रत-पर्व सूचना</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleAction(onToggleBookCover)}
            className="flex items-center gap-2.5 p-3 bg-[#F4E8D1] hover:bg-[#EBD8BD] border border-[#8C6239]/30 rounded-xl text-left transition cursor-pointer active:scale-95"
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
            त्वरित सेटिंग्स
          </div>

          <div className="flex items-center justify-between text-xs py-1">
            <span className="flex items-center gap-1.5 font-medium text-[#5C3A21]">
              <MapPin className="w-3.5 h-3.5 text-[#B56A00]" />
              वर्तमान स्थान: <b className="font-bold">{currentLocation.name.split('(')[0].trim()}</b>
            </span>
            <button
              type="button"
              onClick={() => handleAction(onOpenLocationModal)}
              className="text-[#B56A00] font-bold hover:underline cursor-pointer"
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
            onClick={() => handleAction(onOpenUmaModal)}
            className="w-full py-2.5 px-3 bg-gradient-to-r from-[#B56A00] to-[#C67D24] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-[#FFD88A]" />
            <span>उमा AI से परामर्श</span>
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

