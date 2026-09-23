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
  Activity,
} from 'lucide-react';
import { SavedLocation } from '../types';
import { AppTheme } from '../services/storage';

interface MoreMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tabId: string) => void;
  onOpenLocationModal: () => void;
  onOpenUmaModal: () => void;
  onOpenAccuracyModal?: () => void;
  onToggleBookCover: () => void;
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
  onOpenAccuracyModal,
  onToggleBookCover,
  currentLocation,
  theme,
  onToggleTheme,
  isAudioEnabled,
  onToggleAudio,
}) => {
  if (!isOpen) return null;

  const handleAction = (cb: () => void) => {
    cb();
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

        {/* Grid Options */}
        <div className="grid grid-cols-2 gap-2.5 my-4">
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

          {onOpenAccuracyModal && (
            <button
              type="button"
              onClick={() => handleAction(onOpenAccuracyModal)}
              className="flex items-center gap-2.5 p-3 bg-[#F4E8D1] hover:bg-[#EBD8BD] border border-[#8C6239]/30 rounded-xl text-left transition cursor-pointer active:scale-95 col-span-2"
            >
              <div className="p-2 bg-[#5C3A21] text-[#FAF2E4] rounded-lg">
                <Activity className="w-4 h-4 text-[#FFD88A]" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#5C3A21]">खगोलीय गणना जाँच (Engine Accuracy)</div>
                <div className="text-[10px] text-[#735133]">XALEN व मीयस शुद्धता तुलना एवं अयनांश विवरण</div>
              </div>
            </button>
          )}
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
        <div className="flex items-center gap-2 mt-4">
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
