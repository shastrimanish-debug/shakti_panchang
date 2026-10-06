import React, { useState, useEffect } from 'react';
import { Lock, Unlock, Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useTranslation } from '../i18n';
import { useLicense } from '../lib/license-client';

interface PremiumModuleLockProps {
  moduleId: string;
  titleKey: string;
  descKey: string;
  featureKeys: string[];
  children: React.ReactNode;
  onOpenSubscriptionModal?: () => void;
}

export const PremiumModuleLock: React.FC<PremiumModuleLockProps> = ({
  moduleId,
  titleKey,
  descKey,
  featureKeys,
  children,
  onOpenSubscriptionModal,
}) => {
  const { t } = useTranslation();
  const { status } = useLicense();

  const storageKey = `sp_spiritual_unlocked_${moduleId}`;
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    // If user has trial/annual license, or has explicitly unlocked this module
    if (status.entitled) return true;
    if (typeof window !== 'undefined') {
      return localStorage.getItem(storageKey) === 'true';
    }
    return false;
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (status.entitled) {
      setIsUnlocked(true);
    }
  }, [status.entitled]);

  const handleUnlockForDollar = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, 'true');
    }
    setIsUnlocked(true);
    setToastMessage(t('spiritual.unlockSuccess', 'Premium Unlocked Successfully!'));
    setTimeout(() => setToastMessage(null), 3500);

    if (onOpenSubscriptionModal) {
      // Also notify license modal if applicable
    }
  };

  const handleToggleLockForTest = () => {
    const nextState = !isUnlocked;
    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, String(nextState));
    }
    setIsUnlocked(nextState);
    setToastMessage(nextState ? t('spiritual.testUnlocked', 'Unlocked for Preview') : t('spiritual.testLocked', 'Locked State Activated'));
    setTimeout(() => setToastMessage(null), 2500);
  };

  if (isUnlocked) {
    return (
      <div className="w-full relative">
        {toastMessage && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-in fade-in zoom-in-95 duration-200">
            <div className="px-4 py-2 bg-emerald-900/95 text-emerald-100 border border-emerald-400 rounded-full shadow-2xl text-xs font-bold flex items-center gap-2 backdrop-blur-md">
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              <span>{toastMessage}</span>
            </div>
          </div>
        )}

        {/* Small top banner indicating unlocked status with a toggle for testing */}
        <div className="mb-3 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/10 via-yellow-400/15 to-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-amber-800 dark:text-amber-200 font-bold">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>{t('spiritual.unlockedBadge', 'VIP Premium Module Active')}</span>
          </div>
          <button
            type="button"
            onClick={handleToggleLockForTest}
            className="text-[10px] text-[#8C6239] hover:underline flex items-center gap-1 cursor-pointer font-medium"
            title="Toggle locked state to test locked UI"
          >
            <Lock className="w-3 h-3" />
            <span>{t('spiritual.previewLockState', 'View Lock Screen')}</span>
          </button>
        </div>

        {children}
      </div>
    );
  }

  // Locked State UI
  return (
    <div className="w-full space-y-4 animate-in fade-in duration-200">
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-in fade-in zoom-in-95 duration-200">
          <div className="px-4 py-2 bg-stone-900/95 text-stone-100 border border-amber-400 rounded-full shadow-2xl text-xs font-bold flex items-center gap-2 backdrop-blur-md">
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      <div className="p-5 sm:p-7 rounded-3xl bg-gradient-to-br from-[#2D1609] via-[#4A2612] to-[#2D1609] text-[#FAF2E4] border-2 border-amber-500/50 shadow-2xl relative overflow-hidden text-center">
        {/* Decorative background glow */}
        <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-amber-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-yellow-500/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-md mx-auto space-y-4">
          {/* Lock Icon Jewel */}
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-500 text-stone-950 flex items-center justify-center mx-auto shadow-[0_8px_25px_rgba(245,158,11,0.4)] border-2 border-white/40">
            <Lock className="w-8 h-8" />
          </div>

          <div>
            <span className="px-3 py-1 rounded-full text-[11px] font-black bg-amber-400/20 text-amber-300 border border-amber-400/40 uppercase tracking-widest inline-flex items-center gap-1.5 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t('spiritual.premiumOnly', 'Exclusive Spiritual Feature')}</span>
            </span>
            <h3 className="text-xl sm:text-2xl font-black font-granth text-[#FFD88A]">
              {t(titleKey, 'Premium Spiritual Wisdom')}
            </h3>
            <p className="text-xs text-[#FAF2E4]/85 mt-1 leading-relaxed">
              {t(descKey, 'Unlock high-accuracy divine insights and personalized spiritual guidance.')}
            </p>
          </div>

          {/* Benefits Checklist */}
          <div className="p-3.5 rounded-2xl bg-black/30 border border-amber-500/30 text-left space-y-2">
            <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider block">
              {t('spiritual.includedInModule', 'What you get inside:')}
            </span>
            <div className="space-y-1.5 text-xs text-[#FAF2E4]/90">
              {featureKeys.map((fKey, i) => (
                <div key={i} className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{t(fKey, fKey)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Monetization Hook Call To Action (Strict Requirement: "Unlock Premium for $1") */}
          <div className="pt-2 space-y-2">
            <button
              type="button"
              onClick={handleUnlockForDollar}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 hover:from-amber-600 hover:to-yellow-500 text-stone-950 font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-[0_6px_22px_rgba(245,158,11,0.5)] border border-amber-200 transition-all cursor-pointer active:scale-95 uma-glow-badge"
            >
              <Unlock className="w-4 h-4 text-stone-950" />
              <span>{t('spiritual.unlockCTA', 'Unlock Premium for $1')}</span>
            </button>

            <div className="flex items-center justify-center gap-3 text-[11px] text-[#FAF2E4]/70 pt-1">
              <span>{t('spiritual.oneTimeOrVip', 'Instant 1-Click Access • 100% Satisfaction Guarantee')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
