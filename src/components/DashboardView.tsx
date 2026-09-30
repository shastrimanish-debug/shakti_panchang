import React from 'react';
import { Sun, Moon, Calendar, Sparkles, Clock, BookOpen, Heart, ArrowRight, Shield } from 'lucide-react';
import { PanchangData, ActiveTab } from '../types';

interface DashboardViewProps {
  panchang: PanchangData;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenUma: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ panchang, setActiveTab, onOpenUma }) => {
  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-amber-700 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <span className="bg-white/20 text-xs px-3.5 py-1 rounded-full font-bold tracking-wide">
              सनातन वैदिक पंचांग • {panchang.date}
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              {panchang.masa} {panchang.paksha}, {panchang.tithi.name}
            </h2>
            <p className="text-amber-100 text-sm">
              विक्रम संवत {panchang.vikramSamvat} • {panchang.ayana} • सूर्योदय: {panchang.sunrise} | सूर्यास्त: {panchang.sunset}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setActiveTab('panchang')}
              className="bg-white text-orange-700 hover:bg-amber-50 font-bold px-5 py-3 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm"
            >
              संपूर्ण पंचांग देखें <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenUma}
              className="bg-amber-800/80 hover:bg-amber-900 text-white font-bold px-5 py-3 rounded-2xl shadow-lg transition-all border border-amber-400/30 flex items-center justify-center gap-2 text-sm backdrop-blur-md"
            >
              <Sparkles className="w-4 h-4 text-amber-300" /> उमा AI से पूछें
            </button>
          </div>
        </div>
      </div>

      {/* Quick Access Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {[
          { id: 'panchang', label: 'दैनिक पंचांग', icon: Sun, color: 'bg-orange-500 text-white' },
          { id: 'festivals', label: 'व्रत व त्यौहार', icon: Calendar, color: 'bg-amber-600 text-white' },
          { id: 'kundali', label: 'जन्म कुंडली', icon: Shield, color: 'bg-red-600 text-white' },
          { id: 'milan', label: 'गुण मिलान', icon: Heart, color: 'bg-pink-600 text-white' },
          { id: 'muhurat', label: 'शुभ मुहूर्त', icon: Clock, color: 'bg-emerald-600 text-white' },
          { id: 'vrat', label: 'व्रत कथाएँ', icon: BookOpen, color: 'bg-indigo-600 text-white' },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as ActiveTab)}
              className="bg-white hover:bg-amber-50/80 p-5 rounded-2xl shadow-md border border-amber-200/60 flex flex-col items-center text-center gap-3 transition-all hover:scale-[1.02] cursor-pointer"
            >
              <div className={`w-12 h-12 rounded-2xl ${item.color} flex items-center justify-center shadow-md`}>
                <Icon className="w-6 h-6" />
              </div>
              <span className="font-bold text-stone-800 text-sm">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Today's Key Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-md border border-amber-200/80 space-y-4">
          <h3 className="font-bold text-stone-900 flex items-center gap-2 text-lg border-b border-stone-100 pb-3">
            <Sun className="w-5 h-5 text-amber-600" /> सूर्य & चंद्र स्थिति
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-stone-500">सूर्योदय</span>
              <span className="font-bold text-stone-800">{panchang.sunrise}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">सूर्यास्त</span>
              <span className="font-bold text-stone-800">{panchang.sunset}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">चंद्रोदय</span>
              <span className="font-bold text-stone-800">{panchang.moonrise}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">नक्षत्र</span>
              <span className="font-bold text-stone-800">{panchang.nakshatra.name}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-md border border-amber-200/80 space-y-4">
          <h3 className="font-bold text-stone-900 flex items-center gap-2 text-lg border-b border-stone-100 pb-3">
            <Clock className="w-5 h-5 text-red-600" /> अशुभ समय (राहुकाल)
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-stone-500">राहुकाल</span>
              <span className="font-bold text-red-600">{panchang.rahuKaal}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">यमगण्ड काल</span>
              <span className="font-bold text-stone-800">{panchang.yamgand}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">गुलिक काल</span>
              <span className="font-bold text-stone-800">{panchang.gulikKaal}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">दिशा शूल</span>
              <span className="font-bold text-stone-800">पश्चिम दिशा</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-md border border-amber-200/80 space-y-4">
          <h3 className="font-bold text-stone-900 flex items-center gap-2 text-lg border-b border-stone-100 pb-3">
            <Sparkles className="w-5 h-5 text-emerald-600" /> शुभ मुहूर्त (अभिजित)
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-stone-500">अभिजित मुहूर्त</span>
              <span className="font-bold text-emerald-700">{panchang.abhijitMuhurat}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">अमृत काल</span>
              <span className="font-bold text-stone-800">02:15 PM - 03:50 PM</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">ब्रह्म मुहूर्त</span>
              <span className="font-bold text-stone-800">04:20 AM - 05:08 AM</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">योग</span>
              <span className="font-bold text-stone-800">{panchang.yoga.name}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
