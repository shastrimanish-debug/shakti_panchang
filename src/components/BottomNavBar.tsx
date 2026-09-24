import React from 'react';
import {
  Sun,
  Clock,
  Compass,
  User,
  Gift,
  MoreHorizontal,
  Lock,
} from 'lucide-react';
import { useLicense } from '../lib/license-client';

interface BottomNavBarProps {
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  onOpenMore: () => void;
}

export const BOTTOM_TABS = [
  { id: 'panchang', label: 'पंचांग', icon: Sun },
  { id: 'choghadiya', label: 'चौघड़िया', icon: Clock },
  { id: 'muhurat', label: 'मुहूर्त', icon: Compass },
  { id: 'kundali', label: 'कुण्डली', icon: User },
  { id: 'festivals', label: 'त्योहार', icon: Gift },
];

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  onSelectTab,
  onOpenMore,
}) => {
  const { status } = useLicense();
  const isEntitled = status.entitled;

  return (
    <nav
      aria-label="Mobile Navigation Bar"
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#462B17]/98 backdrop-blur-md text-[#FAF2E4] border-t border-[#8C6239] shadow-[0_-4px_16px_rgba(0,0,0,0.25)] pb-[max(0.5rem,env(safe-area-inset-bottom))] w-full max-w-full overflow-hidden"
    >
      <div className="max-w-md sm:max-w-lg md:max-w-xl mx-auto px-1 flex items-center justify-around h-14">
        {BOTTOM_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const isLocked = !isEntitled && tab.id !== 'panchang';

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectTab(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center py-1 px-0.5 transition cursor-pointer select-none relative ${
                isActive
                  ? 'text-[#FFD88A] font-black'
                  : 'text-[#D9C4A9] hover:text-[#FAF2E4]'
              }`}
            >
              {isActive && (
                <span className="absolute -top-1 w-6 h-0.5 bg-[#FFD88A] rounded-full shadow-[0_0_8px_#FFD88A]" />
              )}
              <div
                className={`p-1 rounded-full transition-transform relative ${
                  isActive ? 'bg-[#5C3A21] scale-110 shadow-xs' : ''
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#FFD88A]' : 'text-[#D9C4A9]'}`} />
                {isLocked && (
                  <span className="absolute -top-0.5 -right-0.5 bg-[#B56A00] text-white rounded-full p-0.5 shadow-2xs">
                    <Lock className="w-2.5 h-2.5 text-white" />
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] sm:text-[11px] leading-tight mt-0.5 whitespace-nowrap flex items-center gap-0.5 ${
                  isActive ? 'font-bold text-[#FFD88A]' : 'font-medium'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}

        {/* 6th Tab: अधिक (More) */}
        <button
          type="button"
          onClick={onOpenMore}
          className={`flex-1 flex flex-col items-center justify-center py-1 px-0.5 transition cursor-pointer select-none relative ${
            ['yatra', 'milan', 'reminders'].includes(activeTab)
              ? 'text-[#FFD88A] font-black'
              : 'text-[#D9C4A9] hover:text-[#FAF2E4]'
          }`}
        >
          {['yatra', 'milan', 'reminders'].includes(activeTab) && (
            <span className="absolute -top-1 w-6 h-0.5 bg-[#FFD88A] rounded-full shadow-[0_0_8px_#FFD88A]" />
          )}
          <div className="p-1 rounded-full">
            <MoreHorizontal className="w-4 h-4" />
          </div>
          <span className="text-[10px] sm:text-[11px] leading-tight mt-0.5 font-medium whitespace-nowrap">
            अधिक
          </span>
        </button>
      </div>
    </nav>
  );
};
