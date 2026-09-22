import React, { useState, useEffect } from 'react';
import { ShaktiLogo } from './ShaktiLogo';
import { Download, Smartphone, Globe, CheckCircle2, ExternalLink, X, ShieldCheck } from 'lucide-react';
import {
  GITHUB_LATEST_RELEASE_URL,
  GITHUB_RELEASES_URL,
  GITHUB_REPO_URL,
  RELEASE_NAME,
  RELEASE_TAG,
} from '../constants/release';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({ isOpen, onClose }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  if (!isOpen) return null;

  const handleInstallPWA = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      alert('ब्राउज़र मेनू (⋮ या शेयर आइकन) पर टैप करके "Add to Home Screen" या "ऐप इंस्टॉल करें" चुनें।');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#FAF2DE] border-2 border-[#8C6239] rounded-xl shadow-2xl max-w-md w-full p-5 relative text-[#2C1810]">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 text-[#8C6239] hover:text-[#5C3A21] rounded-full hover:bg-[#F2E3C6] transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 border-b border-[#8C6239]/30 pb-3 mb-4">
          <ShaktiLogo size={46} className="shrink-0 shadow-md rounded-2xl" />
          <div>
            <h3 className="font-bold text-base sm:text-lg text-[#5C3A21] font-granth">
              शक्ति पंचांग - App & Android APK
            </h3>
            <p className="text-xs text-[#735133]">सनातन वैदिक पंचांग • फ़ोन व कंप्यूटर स्थापना</p>
          </div>
        </div>

        <div className="space-y-4 text-xs sm:text-sm">
          {/* Option 1: Instant PWA Install */}
          <div className="bg-[#F6EBD4] p-3.5 rounded-lg border border-[#8C6239]/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#5C3A21] flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-[#991B1B]" />
                1. Web App (तुरंत इंस्टॉल करें)
              </span>
              <span className="text-[10px] bg-[#991B1B]/10 text-[#991B1B] font-bold px-2 py-0.5 rounded-full">
                सिफारिश (Recommended)
              </span>
            </div>
            <p className="text-xs text-[#5C3A21]/80 leading-relaxed">
              बिना किसी APK डाउनलोड किए, सीधे अपने मोबाइल होमस्क्रीन पर ऐप की तरह चलाएँ। यह पूरी तरह ऑफलाइन भी कार्य करता है।
            </p>
            {isInstalled ? (
              <div className="flex items-center gap-1.5 text-xs text-green-800 font-bold bg-green-100 p-2 rounded border border-green-300">
                <CheckCircle2 className="w-4 h-4" />
                यह ऐप आपके डिवाइस पर पहले से इंस्टॉल है!
              </div>
            ) : (
              <button
                onClick={handleInstallPWA}
                className="w-full mt-1 py-2 px-3 bg-[#991B1B] hover:bg-[#7F1D1D] text-[#FAF2DE] font-bold text-xs rounded-md shadow-xs flex items-center justify-center gap-2 transition cursor-pointer active:scale-98"
              >
                <Download className="w-4 h-4" />
                होम स्क्रीन पर जोड़ें (Add to Home Screen)
              </button>
            )}
          </div>

          {/* Option 2: Android APK from GitHub Actions */}
          <div className="bg-[#F6EBD4] p-3.5 rounded-lg border border-[#8C6239]/40 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#5C3A21] flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-[#991B1B]" />
                2. Android APK फ़ाइल (GitHub से डाउनलोड)
              </span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                Native APK
              </span>
            </div>
            <p className="text-xs text-[#5C3A21]/80 leading-relaxed">
              रिलीज़ स्थान सेव है: <strong>{RELEASE_NAME}</strong> ({RELEASE_TAG})
            </p>
            <a
              href={GITHUB_LATEST_RELEASE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2 px-3 bg-[#991B1B] hover:bg-[#7F1D1D] text-[#FAF2DE] font-bold text-xs rounded-md shadow-xs flex items-center justify-center gap-2 transition"
            >
              <ExternalLink className="w-4 h-4" />
              GitHub से नवीनतम APK डाउनलोड करें
            </a>
            <ol className="list-decimal list-inside text-xs text-[#5C3A21]/90 space-y-1 pl-1 bg-[#FAF2DE] p-2.5 rounded border border-[#8C6239]/20">
              <li>
                रेपो:{" "}
                <a className="underline font-bold" href={GITHUB_REPO_URL} target="_blank" rel="noopener noreferrer">
                  shastrimanish-debug/shakti_panchang
                </a>
              </li>
              <li>
                रिलीज़:{" "}
                <a className="underline font-bold" href={GITHUB_RELEASES_URL} target="_blank" rel="noopener noreferrer">
                  Releases
                </a>
              </li>
              <li>Actions टैब → <strong>Build Web App and Android APK</strong></li>
              <li>Artifacts से <strong>Shakti-Panchang-APK</strong> डाउनलोड करें।</li>
            </ol>
            <div className="flex items-center gap-1 text-[11px] text-[#735133] pt-0.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span>कैपेसिटर (Capacitor Android SDK 36) द्वारा प्रमाणित</span>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-[#8C6239]/30 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#462B17] hover:bg-[#382010] text-[#FFD88A] text-xs font-bold rounded shadow-xs transition"
          >
            समझ गया (Close)
          </button>
        </div>
      </div>
    </div>
  );
};
