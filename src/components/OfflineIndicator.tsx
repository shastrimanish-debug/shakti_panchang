import React from 'react';
import { useOnlineStatus } from '../services/onlineStatus';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-[#5C3A21] border border-[#FFD88A]/60 px-3.5 py-2 text-xs font-bold text-[#FAF2E4] shadow-2xl backdrop-blur-xs animate-in slide-in-from-bottom-2 duration-300"
    >
      <WifiOff className="w-4 h-4 text-[#FFD88A] animate-pulse shrink-0" />
      <div>
        <span className="text-[#FFD88A]">🕉️ 100% ऑफ़लाइन मोड:</span>
        <span className="ml-1 text-[11px] opacity-90">सभी पंचांग व कुण्डली गणनाएँ बिना इंटरनेट के उपलब्ध हैं</span>
      </div>
    </div>
  );
};
