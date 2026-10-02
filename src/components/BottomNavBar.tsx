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
      className="fixed bottom-0 left-0 right-0 w-full z-40 bg-[#FFFDF9]/98 backdrop-blur-xl border-t border-[#E8DCCB] shadow-[0_-4px_25px_rgba(92,58,33,0.08)] select-none"
      style={{
        paddingBottom: 'max(1.125rem, calc(env(safe-area-inset-bottom, 0px) + 0.65rem))',
      }}
    >
      <div className="max-w-md mx-auto flex items-center justify-between px-2 pt-1.5 h-14">
        {/* Tab 1: पंचांग */}
        <button
          type="button"
          onClick={() => onSelectTab('panchang')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition cursor-pointer select-none m3-touch ${
            activeTab === 'panchang'
              ? 'text-[#8C4A00] font-black'
              : 'text-[#6B4E36] hover:text-[#2C180C]'
          }`}
        >
          <div
            className={`p-1.5 rounded-xl transition-all ${
              activeTab === 'panchang' ? 'bg-[#FBF0DD] scale-110 shadow-xs' : ''
            }`}
          >
            <Sun className={`w-4 h-4 ${activeTab === 'panchang' ? 'text-[#8C4A00]' : 'text-[#735133]'}`} />
          </div>
          <span className="text-[10px] leading-tight mt-0.5 tracking-wide">पंचांग</span>
        </button>

        {/* Tab 2: चौघड़िया */}
        <button
          type="button"
          onClick={() => onSelectTab('choghadiya')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition cursor-pointer select-none m3-touch ${
            activeTab === 'choghadiya'
              ? 'text-[#8C4A00] font-black'
              : 'text-[#6B4E36] hover:text-[#2C180C]'
          }`}
        >
          <div
            className={`p-1.5 rounded-xl transition-all ${
              activeTab === 'choghadiya' ? 'bg-[#FBF0DD] scale-110 shadow-xs' : ''
            }`}
          >
            <Clock className={`w-4 h-4 ${activeTab === 'choghadiya' ? 'text-[#8C4A00]' : 'text-[#735133]'}`} />
          </div>
          <span className="text-[10px] leading-tight mt-0.5 tracking-wide">चौघड़िया</span>
        </button>

        {/* Center Floating Action Jewel: UMA AI */}
        {onOpenUma && (
          <div className="flex-1 flex flex-col items-center justify-center -mt-6">
            <button
              type="button"
              onClick={onOpenUma}
              className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 text-stone-950 flex items-center justify-center shadow-[0_4px_18px_rgba(245,158,11,0.55)] border-2 border-white transition-all cursor-pointer active:scale-90 hover:scale-105 uma-glow-badge"
              title="उमा AI - प्राचीन सनातन ज्योतिषीय परामर्श"
            >
              <Sparkles className="w-5 h-5 text-stone-950 fill-stone-950" />
            </button>
            <span className="text-[9px] font-black text-[#5C3A21] mt-1 tracking-wider leading-none">
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
              ? 'text-[#8C4A00] font-black'
              : 'text-[#6B4E36] hover:text-[#2C180C]'
          }`}
        >
          <div
            className={`p-1.5 rounded-xl transition-all ${
              activeTab === 'kundali' ? 'bg-[#FBF0DD] scale-110 shadow-xs' : ''
            }`}
          >
            <User className={`w-4 h-4 ${activeTab === 'kundali' ? 'text-[#8C4A00]' : 'text-[#735133]'}`} />
          </div>
          <span className="text-[10px] leading-tight mt-0.5 tracking-wide">कुण्डली</span>
        </button>

        {/* Tab 4: अधिक (More) */}
        <button
          type="button"
          onClick={onOpenMore}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition cursor-pointer select-none m3-touch ${
            ['muhurat', 'yatra', 'milan', 'festivals', 'reminders', 'vratkatha'].includes(activeTab)
              ? 'text-[#8C4A00] font-black'
              : 'text-[#6B4E36] hover:text-[#2C180C]'
          }`}
        >
          <div
            className={`p-1.5 rounded-xl transition-all ${
              ['muhurat', 'yatra', 'milan', 'festivals', 'reminders', 'vratkatha'].includes(activeTab)
                ? 'bg-[#FBF0DD] scale-110 shadow-xs'
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
