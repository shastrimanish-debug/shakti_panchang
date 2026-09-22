import React from 'react';
import {
  Sun,
  Clock,
  Compass,
  User,
  Gift,
  MoreHorizontal,
} from 'lucide-react';

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
  return (
    <nav
      aria-label="Mobile Navigation Bar"
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#462B17]/98 backdrop-blur-md text-[#FAF2E4] border-t border-[#8C6239] shadow-[0_-4px_16px_rgba(0,0,0,0.25)] pb-[max(0.5rem,env(safe-area-inset-bottom))]"
    >
      <div className="max-w-md sm:max-w-lg md:max-w-xl mx-auto px-1 flex items-center justify-around h-14">
        {BOTTOM_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
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
                className={`p-1 rounded-full transition-transform ${
                  isActive ? 'bg-[#5C3A21] scale-110 shadow-xs' : ''
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#FFD88A]' : 'text-[#D9C4A9]'}`} />
              </div>
              <span className={`text-[10px] sm:text-[11px] leading-tight mt-0.5 whitespace-nowrap ${
                isActive ? 'font-bold text-[#FFD88A]' : 'font-medium'
              }`}>
                {tab.label}
              </span>
            </button>
          );
        })}

        {/* 6th Tab: अधिक (More) */}
        <button
          type="button"
          onClick={onOpenMore}
          className={`flex-1 flex flex-col items-center justify-center py-1 px-0.5 transition cursor-pointer select-none ${
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
