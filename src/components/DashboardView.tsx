import React from 'react';
import { VedicPanchangData, SavedLocation } from '../types';
import { Sun, Sunset, Sparkles, Calendar, BookOpen, Clock, Compass, Shield, ArrowRight, Award } from 'lucide-react';
import { getDayChoghadiya, getCurrentChoghadiya } from '../services/choghadiya';

interface DashboardViewProps {
  panchang: VedicPanchangData | null;
  currentLocation: SavedLocation;
  onNavigateTab: (tabId: string) => void;
  onOpenUma: () => void;
  onOpenConnect: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  panchang,
  currentLocation,
  onNavigateTab,
  onOpenUma,
  onOpenConnect,
}) => {
  const weekdayNum = panchang ? panchang.date.getDay() : new Date().getDay();
  const dayChoghadiyas = panchang ? getDayChoghadiya(panchang.solar, weekdayNum) : [];
  const { current: currentChoghadiya, remainingMinutes } = getCurrentChoghadiya(dayChoghadiyas);

  const formatT = (d: Date) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const sunriseStr = panchang ? formatT(panchang.solar.sunrise) : "06:15 AM";
  const sunsetStr = panchang ? formatT(panchang.solar.sunset) : "06:30 PM";

  const weekdayName = panchang ? panchang.weekday : "सोमवार";
  const pakshaName = panchang ? panchang.paksha : "कृष्ण";
  const tithiName = panchang ? panchang.tithi : "दशमी";
  const nakshatraName = panchang ? panchang.nakshatra : "पुष्य";

  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-4 py-4 space-y-5 animate-in fade-in zoom-in-95 duration-200 pb-32">
      {/* Top Auspicious Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#5C3A21] via-[#754622] to-[#381E0C] rounded-3xl p-6 text-[#FAF2E4] shadow-xl border border-amber-500/40">
        <div className="absolute -right-6 -bottom-6 opacity-10 pointer-events-none">
          <Sparkles className="w-48 h-48 text-amber-300" />
        </div>
        <p className="text-xs font-black tracking-widest text-amber-300 uppercase mb-1">
          ॥ श्री गणेशाय नमः ॥ आज का वैदिक पंचांग डैशबोर्ड
        </p>
        <h1 className="text-2xl sm:text-3xl font-black font-granth text-amber-100">
          {weekdayName}, {pakshaName} पक्ष
        </h1>
        <p className="text-sm font-bold text-amber-200/90 mt-1">
          {tithiName} | {nakshatraName} नक्षत्र
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            onClick={onOpenUma}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-stone-950 font-black text-xs shadow-lg hover:brightness-105 transition flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>उमा से आज का मार्गदर्शन लें</span>
          </button>
          <button
            onClick={onOpenConnect}
            className="px-4 py-2.5 rounded-2xl bg-white/10 backdrop-blur-md text-amber-200 hover:bg-white/20 transition font-bold text-xs border border-amber-500/30 flex items-center gap-2"
          >
            <Award className="w-4 h-4 text-amber-300" />
            <span>आचार्य जी से परामर्श</span>
          </button>
        </div>
      </div>

      {/* Bird's Eye Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {/* Sunrise & Sunset */}
        <div className="bg-white/90 dark:bg-[#2A1508]/90 backdrop-blur-xl rounded-3xl p-5 border border-amber-500/30 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-amber-700 dark:text-amber-400 mb-3">
              <span className="text-xs font-black uppercase tracking-wider">सूर्य स्थिति</span>
              <Sun className="w-5 h-5 text-amber-500" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2.5 rounded-2xl bg-amber-50/60 dark:bg-stone-900/60">
                <span className="text-xs font-bold text-stone-600 dark:text-stone-300 flex items-center gap-1.5">
                  <Sun className="w-4 h-4 text-amber-500" /> सूर्योदय
                </span>
                <span className="text-sm font-black text-[#5C3A21] dark:text-amber-200">{sunriseStr}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-2xl bg-amber-50/60 dark:bg-stone-900/60">
                <span className="text-xs font-bold text-stone-600 dark:text-stone-300 flex items-center gap-1.5">
                  <Sunset className="w-4 h-4 text-orange-500" /> सूर्यास्त
                </span>
                <span className="text-sm font-black text-[#5C3A21] dark:text-amber-200">{sunsetStr}</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('panchang')}
            className="mt-4 text-xs font-black text-amber-700 dark:text-amber-400 flex items-center gap-1 hover:underline"
          >
            <span>सम्पूर्ण पंचांग देखें</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Current Choghadiya */}
        <div className="bg-white/90 dark:bg-[#2A1508]/90 backdrop-blur-xl rounded-3xl p-5 border border-amber-500/30 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-amber-700 dark:text-amber-400 mb-3">
              <span className="text-xs font-black uppercase tracking-wider">वर्तमान चौघड़िया</span>
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 to-yellow-500/10 border border-amber-500/30 text-center">
              <p className="text-lg font-black font-granth text-[#462B17] dark:text-amber-200">
                {currentChoghadiya ? currentChoghadiya.hindiName : "शुभ चौघड़िया"}
              </p>
              <p className="text-xs font-bold text-amber-800 dark:text-amber-300 mt-1">
                {currentChoghadiya ? `समय प्रभावी (${remainingMinutes} मि. शेष)` : "शुभ समय प्रभावी"}
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('choghadiya')}
            className="mt-4 text-xs font-black text-amber-700 dark:text-amber-400 flex items-center gap-1 hover:underline"
          >
            <span>पूरा चौघड़िया चक्र देखें</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Daily Vrat / Festival Summary */}
        <div className="bg-white/90 dark:bg-[#2A1508]/90 backdrop-blur-xl rounded-3xl p-5 border border-amber-500/30 shadow-lg flex flex-col justify-between sm:col-span-2 md:col-span-1">
          <div>
            <div className="flex items-center justify-between text-amber-700 dark:text-amber-400 mb-3">
              <span className="text-xs font-black uppercase tracking-wider">व्रत एवं पर्व</span>
              <Calendar className="w-5 h-5 text-amber-600" />
            </div>
            <div className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-stone-900/60 space-y-1">
              <p className="text-xs font-black text-[#462B17] dark:text-amber-200">
                {pakshaName === 'कृष्ण' ? 'सोमवार व्रत / प्रदोष काल' : 'विनायक चतुर्थी / एकादशी व्रत'}
              </p>
              <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                आज के दिन भगवान शिव और मां पार्वती की आराधना, व्रत तथा सफेद वस्तुओं का दान विशेष फलदायी है।
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('festivals')}
            className="mt-4 text-xs font-black text-amber-700 dark:text-amber-400 flex items-center gap-1 hover:underline"
          >
            <span>व्रत-त्योहार सूची देखें</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Quick Access Grid */}
      <div className="bg-white/90 dark:bg-[#2A1508]/90 backdrop-blur-xl rounded-3xl p-6 border border-amber-500/30 shadow-lg">
        <h2 className="text-base font-black font-granth text-[#462B17] dark:text-amber-200 mb-4">
          शीघ्र नेविगेशन (Quick Access Modules)
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => onNavigateTab('kundali')}
            className="p-4 rounded-2xl bg-amber-50/80 dark:bg-stone-900/80 border border-amber-500/30 hover:bg-amber-100/80 transition flex flex-col items-center text-center gap-2"
          >
            <div className="p-2.5 rounded-xl bg-amber-600 text-white shadow-md">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="text-xs font-black text-[#5C3A21] dark:text-amber-200">जन्म कुण्डली</span>
          </button>
          <button
            onClick={() => onNavigateTab('muhurat')}
            className="p-4 rounded-2xl bg-amber-50/80 dark:bg-stone-900/80 border border-amber-500/30 hover:bg-amber-100/80 transition flex flex-col items-center text-center gap-2"
          >
            <div className="p-2.5 rounded-xl bg-amber-600 text-white shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-xs font-black text-[#5C3A21] dark:text-amber-200">शुभ मुहूर्त</span>
          </button>
          <button
            onClick={() => onNavigateTab('milan')}
            className="p-4 rounded-2xl bg-amber-50/80 dark:bg-stone-900/80 border border-amber-500/30 hover:bg-amber-100/80 transition flex flex-col items-center text-center gap-2"
          >
            <div className="p-2.5 rounded-xl bg-amber-600 text-white shadow-md">
              <Shield className="w-5 h-5" />
            </div>
            <span className="text-xs font-black text-[#5C3A21] dark:text-amber-200">अष्टकूट मिलान</span>
          </button>
          <button
            onClick={() => onNavigateTab('yatra')}
            className="p-4 rounded-2xl bg-amber-50/80 dark:bg-stone-900/80 border border-amber-500/30 hover:bg-amber-100/80 transition flex flex-col items-center text-center gap-2"
          >
            <div className="p-2.5 rounded-xl bg-amber-600 text-white shadow-md">
              <Compass className="w-5 h-5" />
            </div>
            <span className="text-xs font-black text-[#5C3A21] dark:text-amber-200">दिशाशूल & यात्रा</span>
          </button>
        </div>
      </div>
    </div>
  );
};
