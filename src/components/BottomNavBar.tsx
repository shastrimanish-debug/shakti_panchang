import React from 'react';
import {
  Sun,
  Clock,
  Compass,
  User,
  MoreHorizontal,
  Sparkles,
} from 'lucide-react';
import { useLicense } from '../lib/license-client';

interface BottomNavBarProps {
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  onOpenMore: () => void;
  onOpenUma?: () => void;
}

export const BOTTOM_TABS = [
  { id: 'panchang', label: 'पंचांग', icon: Sun },
  { id: 'choghadiya', label: 'चौघड़िया', icon: Clock },
  { id: 'kundali', label: 'कुण्डली', icon: User },
  { id: 'muhurat', label: 'मुहूर्त', icon: Compass },
];

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  onSelectTab,
  onOpenMore,
  onOpenUma,
}) => {
  const { status } = useLicense();
  const isEntitled = status.entitled;

  return (
    <nav
      aria-label="Mobile Navigation Bar"
      className="fixed bottom-1.5 sm:bottom-3 left-2 right-2 sm:left-auto sm:right-auto sm:left-1/2 sm:-translate-x-1/2 z-40 max-w-md w-[calc(100%-1rem)] sm:w-full bg-[#2C180C]/95 backdrop-blur-xl text-[#FAF2E4] border border-[#8C6239]/50 rounded-2xl sm:rounded-full shadow-[0_10px_35px_rgba(0,0,0,0.45)] px-1.5 py-1 select-none"
    >
      <div className="flex items-center justify-between h-13 px-1">
        {/* Tab 1: पंचांग */}
        <button
          type="button"
          onClick={() => onSelectTab('panchang')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition cursor-pointer select-none m3-touch ${
            activeTab === 'panchang'
              ? 'text-[#FFD88A] font-black'
              : 'text-[#D9C4A9] hover:text-[#FAF2E4]'
          }`}
        >
          <div
            className={`p-1.5 rounded-full transition-all ${
              activeTab === 'panchang' ? 'bg-[#5C3A21] scale-110 shadow-xs' : ''
            }`}
          >
            <Sun className={`w-4 h-4 ${activeTab === 'panchang' ? 'text-[#FFD88A]' : 'text-[#D9C4A9]'}`} />
          </div>
          <span className="text-[10px] leading-tight mt-0.5">पंचांग</span>
        </button>

        {/* Tab 2: चौघड़िया */}
        <button
          type="button"
          onClick={() => onSelectTab('choghadiya')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition cursor-pointer select-none m3-touch ${
            activeTab === 'choghadiya'
              ? 'text-[#FFD88A] font-black'
              : 'text-[#D9C4A9] hover:text-[#FAF2E4]'
          }`}
        >
          <div
            className={`p-1.5 rounded-full transition-all ${
              activeTab === 'choghadiya' ? 'bg-[#5C3A21] scale-110 shadow-xs' : ''
            }`}
          >
            <Clock className={`w-4 h-4 ${activeTab === 'choghadiya' ? 'text-[#FFD88A]' : 'text-[#D9C4A9]'}`} />
          </div>
          <span className="text-[10px] leading-tight mt-0.5">चौघड़िया</span>
        </button>

        {/* Center Prominent Jewel: उमा AI (Always 100% Active) */}
        {onOpenUma && (
          <div className="flex-1 flex flex-col items-center justify-center -mt-4">
            <button
              type="button"
              onClick={onOpenUma}
              className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 text-stone-950 flex items-center justify-center shadow-[0_4px_20px_rgba(245,158,11,0.55)] border-2 border-amber-200 transition-all cursor-pointer active:scale-90 hover:scale-105 uma-glow-badge"
              title="उमा AI - प्राचीन सनातन ज्योतिषीय परामर्श"
            >
              <Sparkles className="w-6 h-6 text-stone-950 fill-stone-950" />
            </button>
            <span className="text-[9px] font-black text-amber-300 mt-1 tracking-wide leading-none">
              उमा AI
            </span>
          </div>
        )}

        {/* Tab 3: कुण्डली */}
        <button
          type="button"
          onClick={() => onSelectTab('kundali')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition cursor-pointer select-none m3-touch ${
            activeTab === 'kundali'
              ? 'text-[#FFD88A] font-black'
              : 'text-[#D9C4A9] hover:text-[#FAF2E4]'
          }`}
        >
          <div
            className={`p-1.5 rounded-full transition-all ${
              activeTab === 'kundali' ? 'bg-[#5C3A21] scale-110 shadow-xs' : ''
            }`}
          >
            <User className={`w-4 h-4 ${activeTab === 'kundali' ? 'text-[#FFD88A]' : 'text-[#D9C4A9]'}`} />
          </div>
          <span className="text-[10px] leading-tight mt-0.5">कुण्डली</span>
        </button>

        {/* Tab 4: अधिक (More options - Muhurat, Festivals, Yatra, Milan, Reminders) */}
        <button
          type="button"
          onClick={onOpenMore}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition cursor-pointer select-none m3-touch ${
            ['muhurat', 'yatra', 'milan', 'festivals', 'reminders', 'vratkatha'].includes(activeTab)
              ? 'text-[#FFD88A] font-black'
              : 'text-[#D9C4A9] hover:text-[#FAF2E4]'
          }`}
        >
          <div
            className={`p-1.5 rounded-full transition-all ${
              ['muhurat', 'yatra', 'milan', 'festivals', 'reminders', 'vratkatha'].includes(activeTab)
                ? 'bg-[#5C3A21] scale-110 shadow-xs'
                : ''
            }`}
          >
            <MoreHorizontal className="w-4 h-4" />
          </div>
          <span className="text-[10px] leading-tight mt-0.5 font-medium">अधिक</span>
        </button>
      </div>
    </nav>
  );
};
