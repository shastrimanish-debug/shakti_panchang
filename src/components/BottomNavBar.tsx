import React from 'react';
import {
  Sun,
  Clock,
  Compass,
  User,
  MoreHorizontal,
  Sparkles,
} from 'lucide-react';

interface BottomNavBarProps {
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  onOpenMore: () => void;
  onOpenUma?: () => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  onSelectTab,
  onOpenMore,
  onOpenUma,
}) => {
  return (
    <nav
      aria-label="Mobile Navigation Bar"
      className="fixed bottom-2 sm:bottom-4 left-3 right-3 sm:left-1/2 sm:-translate-x-1/2 z-40 max-w-lg w-[calc(100%-1.5rem)] sm:w-full bg-[#2A1508]/92 backdrop-blur-2xl text-[#FAF2E4] border border-amber-500/30 rounded-3xl shadow-[0_12px_40px_rgba(0,0,0,0.55)] px-2 py-1.5 select-none"
    >
      <div className="flex items-center justify-between h-13 px-1">
        {/* Tab 1: पंचांग */}
        <button
          type="button"
          onClick={() => onSelectTab('panchang')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition cursor-pointer select-none m3-touch ${
            activeTab === 'panchang'
              ? 'text-amber-300 font-black'
              : 'text-stone-300 hover:text-white'
          }`}
        >
          <div
            className={`p-1.5 rounded-2xl transition-all ${
              activeTab === 'panchang' ? 'bg-amber-500/25 scale-110 shadow-sm' : ''
            }`}
          >
            <Sun className={`w-4 h-4 ${activeTab === 'panchang' ? 'text-amber-300' : 'text-stone-400'}`} />
          </div>
          <span className="text-[10px] leading-tight mt-0.5 tracking-wide">पंचांग</span>
        </button>

        {/* Tab 2: चौघड़िया */}
        <button
          type="button"
          onClick={() => onSelectTab('choghadiya')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition cursor-pointer select-none m3-touch ${
            activeTab === 'choghadiya'
              ? 'text-amber-300 font-black'
              : 'text-stone-300 hover:text-white'
          }`}
        >
          <div
            className={`p-1.5 rounded-2xl transition-all ${
              activeTab === 'choghadiya' ? 'bg-amber-500/25 scale-110 shadow-sm' : ''
            }`}
          >
            <Clock className={`w-4 h-4 ${activeTab === 'choghadiya' ? 'text-amber-300' : 'text-stone-400'}`} />
          </div>
          <span className="text-[10px] leading-tight mt-0.5 tracking-wide">चौघड़िया</span>
        </button>

        {/* Center Floating Action Jewel: UMA AI */}
        {onOpenUma && (
          <div className="flex-1 flex flex-col items-center justify-center -mt-6">
            <button
              type="button"
              onClick={onOpenUma}
              className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 text-stone-950 flex items-center justify-center shadow-[0_6px_25px_rgba(245,158,11,0.65)] border-2 border-white/80 transition-all cursor-pointer active:scale-90 hover:scale-105 uma-glow-badge"
              title="उमा AI - प्राचीन सनातन ज्योतिषीय परामर्श"
            >
              <Sparkles className="w-6 h-6 text-stone-950 fill-stone-950" />
            </button>
            <span className="text-[9px] font-black text-amber-300 mt-1 tracking-wider leading-none">
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
              ? 'text-amber-300 font-black'
              : 'text-stone-300 hover:text-white'
          }`}
        >
          <div
            className={`p-1.5 rounded-2xl transition-all ${
              activeTab === 'kundali' ? 'bg-amber-500/25 scale-110 shadow-sm' : ''
            }`}
          >
            <User className={`w-4 h-4 ${activeTab === 'kundali' ? 'text-amber-300' : 'text-stone-400'}`} />
          </div>
          <span className="text-[10px] leading-tight mt-0.5 tracking-wide">कुण्डली</span>
        </button>

        {/* Tab 4: अधिक (More) */}
        <button
          type="button"
          onClick={onOpenMore}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition cursor-pointer select-none m3-touch ${
            ['muhurat', 'yatra', 'milan', 'festivals', 'reminders', 'vratkatha'].includes(activeTab)
              ? 'text-amber-300 font-black'
              : 'text-stone-300 hover:text-white'
          }`}
        >
          <div
            className={`p-1.5 rounded-2xl transition-all ${
              ['muhurat', 'yatra', 'milan', 'festivals', 'reminders', 'vratkatha'].includes(activeTab)
                ? 'bg-amber-500/25 scale-110 shadow-sm'
                : ''
            }`}
          >
            <MoreHorizontal className="w-4 h-4" />
          </div>
          <span className="text-[10px] leading-tight mt-0.5 font-medium tracking-wide">अधिक</span>
        </button>
      </div>
    </nav>
  );
};
