import React, { useState, useEffect } from 'react';
import { VedicPanchangData, ChoghadiyaItem } from '../types';
import {
  getDayChoghadiya,
  getNightChoghadiya,
  getCurrentChoghadiya,
  getInauspiciousWindows,
  getAuspiciousWindows,
} from '../services/choghadiya';
import {
  Clock,
  Sun,
  Moon,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  Award,
} from 'lucide-react';

interface ChoghadiyaViewProps {
  panchang: VedicPanchangData;
}

type ChoghadiyaSubPage = 'table' | 'windows';

export const ChoghadiyaView: React.FC<ChoghadiyaViewProps> = ({ panchang }) => {
  const [subPage, setSubPage] = useState<ChoghadiyaSubPage>('table');
  const [period, setPeriod] = useState<'day' | 'night'>('day');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  const weekday = panchang.date.getDay();
  const dayChoghadiyas = getDayChoghadiya(panchang.solar, weekday);
  const nightChoghadiyas = getNightChoghadiya(panchang.solar, weekday);
  const activeList = period === 'day' ? dayChoghadiyas : nightChoghadiyas;

  const { current, remainingMinutes } = getCurrentChoghadiya(activeList, currentTime);
  const inauspiciousWindows = getInauspiciousWindows(panchang.solar, weekday);
  const auspiciousWindows = getAuspiciousWindows(panchang.solar);

  const formatTime = (d: Date) =>
    d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

  const getBadgeStyle = (nature: ChoghadiyaItem['nature']) => {
    switch (nature) {
      case 'auspicious':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'neutral':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      default:
        return 'bg-rose-100 text-rose-800 border-rose-300';
    }
  };

  const getNatureText = (nature: ChoghadiyaItem['nature']) => {
    switch (nature) {
      case 'auspicious':
        return 'शुभ';
      case 'neutral':
        return 'मध्यम (चल)';
      default:
        return 'अशुभ (त्याज्य)';
    }
  };

  return (
    <div className="space-y-3 sm:space-y-4 animate-in fade-in duration-200">
      {/* Screen-Fit Sub-Page Segmented Bar */}
      <div className="flex items-center justify-between gap-1 p-1 bg-[#FAF2E4] border border-[#8C6239]/30 rounded-xl shadow-xs">
        <button
          type="button"
          onClick={() => setSubPage('table')}
          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
            subPage === 'table'
              ? 'bg-[#5C3A21] text-[#FAF2E4] shadow-xs'
              : 'text-[#8C6239] hover:bg-[#F4E8D1]'
          }`}
        >
          <Clock className={`w-3.5 h-3.5 ${subPage === 'table' ? 'text-[#FFD88A]' : 'text-[#8C6239]'}`} />
          <span>पृष्ठ १: चौघड़िया तालिका</span>
        </button>
        <button
          type="button"
          onClick={() => setSubPage('windows')}
          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
            subPage === 'windows'
              ? 'bg-[#5C3A21] text-[#FAF2E4] shadow-xs'
              : 'text-[#8C6239] hover:bg-[#F4E8D1]'
          }`}
        >
          <Sparkles className={`w-3.5 h-3.5 ${subPage === 'windows' ? 'text-[#FFD88A]' : 'text-[#8C6239]'}`} />
          <span>पृष्ठ २: शुभाशुभ मुहूर्त</span>
        </button>
      </div>

      {/* SUB-PAGE 1: ACTIVE CHOGHADIYA & 8 CHOGHADIYAS TABLE */}
      {subPage === 'table' && (
        <div className="space-y-3 animate-in fade-in duration-150">
          {/* Current Active Choghadiya Banner */}
          {current && (
            <div className="bg-gradient-to-r from-[#FAF2E4] to-[#F4E8D1] border-2 border-[#B56A00] rounded-xl p-3 sm:p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-[#B56A00] text-white shadow-xs shrink-0">
                  <Clock className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
                  </span>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-[#8C6239] uppercase tracking-wider">
                    वर्तमान चालू चौघड़िया
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-lg sm:text-xl font-black font-granth text-[#5C3A21]">
                      {current.hindiName}
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold border ${getBadgeStyle(current.nature)}`}>
                      {getNatureText(current.nature)}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#735133] mt-0.2">{current.meaning}</p>
                </div>
              </div>

              <div className="bg-[#FAF2E4] px-3 py-1.5 rounded-lg border border-[#8C6239]/30 text-right">
                <div className="text-[10px] font-semibold text-[#8C6239]">समय सीमा</div>
                <div className="text-xs sm:text-sm font-black text-[#5C3A21]">
                  {formatTime(current.start)} - {formatTime(current.end)}
                </div>
                <div className="text-[11px] font-bold text-[#B56A00]">
                  लगभग {remainingMinutes} मिनट शेष
                </div>
              </div>
            </div>
          )}

          {/* Day / Night Toggle */}
          <div className="flex items-center justify-between border-b border-[#8C6239]/20 pb-2">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setPeriod('day')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  period === 'day'
                    ? 'bg-[#5C3A21] text-[#FAF2E4] shadow-xs'
                    : 'bg-[#FAF2E4] text-[#5C3A21] hover:bg-[#F4E8D1] border border-[#8C6239]/30'
                }`}
              >
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span>दिन (Day)</span>
              </button>
              <button
                type="button"
                onClick={() => setPeriod('night')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  period === 'night'
                    ? 'bg-[#5C3A21] text-[#FAF2E4] shadow-xs'
                    : 'bg-[#FAF2E4] text-[#5C3A21] hover:bg-[#F4E8D1] border border-[#8C6239]/30'
                }`}
              >
                <Moon className="w-3.5 h-3.5 text-indigo-400" />
                <span>रात (Night)</span>
              </button>
            </div>
            <span className="text-[11px] text-[#735133]">
              {panchang.weekday} • {period === 'day' ? 'सूर्योदय से सूर्यास्त' : 'सूर्यास्त से सूर्योदय'}
            </span>
          </div>

          {/* Choghadiya Table */}
          <div className="bg-[#FAF2E4] border border-[#8C6239]/40 rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#5C3A21] text-[#FAF2E4] text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3">चौघड़िया</th>
                    <th className="py-2.5 px-3">प्रकृति</th>
                    <th className="py-2.5 px-3">समय अवधि</th>
                    <th className="py-2.5 px-3">स्वामी</th>
                    <th className="py-2.5 px-3">फल व प्रभाव</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#8C6239]/20">
                  {activeList.map((item, idx) => {
                    const isActive = currentTime >= item.start && currentTime < item.end;
                    return (
                      <tr
                        key={idx}
                        className={`transition-colors ${
                          isActive
                            ? 'bg-amber-100/80 font-semibold'
                            : idx % 2 === 0
                            ? 'bg-[#FAF2E4]'
                            : 'bg-[#F4E8D1]/50'
                        }`}
                      >
                        <td className="py-2 px-3 font-bold text-[#5C3A21]">
                          <div className="flex items-center gap-1.5">
                            {isActive && (
                              <span className="w-2 h-2 rounded-full bg-[#B56A00] animate-ping" />
                            )}
                            <span>{item.hindiName}</span>
                          </div>
                        </td>
                        <td className="py-2 px-3">
                          <span
                            className={`inline-block px-1.5 py-0.2 rounded text-[10px] font-bold border ${getBadgeStyle(
                              item.nature
                            )}`}
                          >
                            {getNatureText(item.nature)}
                          </span>
                        </td>
                        <td className="py-2 px-3 whitespace-nowrap text-[#5C3A21] font-medium text-[11px]">
                          {formatTime(item.start)} - {formatTime(item.end)}
                        </td>
                        <td className="py-2 px-3 text-[#735133]">{item.ruler}</td>
                        <td className="py-2 px-3 text-[#5C3A21]">{item.meaning}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-PAGE 2: AUSPICIOUS & INAUSPICIOUS WINDOWS */}
      {subPage === 'windows' && (
        <div className="space-y-3.5 animate-in fade-in duration-150">
          {/* Auspicious Windows */}
          <div className="bg-[#FAF2E4] border border-[#8C6239]/30 rounded-xl p-3.5 shadow-xs">
            <h3 className="text-sm font-bold font-granth text-[#5C3A21] mb-2.5 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#B56A00]" />
              <span>दैनिक शुभ मुहूर्त (Auspicious Windows)</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {auspiciousWindows.map((item, idx) => (
                <div key={idx} className="bg-[#F4E8D1] p-2.5 rounded-lg border border-[#8C6239]/20">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-bold text-xs text-[#5C3A21]">{item.title}</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                  </div>
                  <div className="text-xs font-black text-[#B56A00]">
                    {formatTime(item.start)} - {formatTime(item.end)}
                  </div>
                  <p className="text-[10px] text-[#735133] mt-0.5">{item.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Inauspicious Windows */}
          <div className="bg-[#FAF2E4] border border-[#8C6239]/30 rounded-xl p-3.5 shadow-xs">
            <h3 className="text-sm font-bold font-granth text-[#5C3A21] mb-2.5 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-700" />
              <span>दैनिक वर्जित समय (Inauspicious Windows - त्याज्य काल)</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {inauspiciousWindows.map((item, idx) => (
                <div key={idx} className="bg-rose-50/70 p-2.5 rounded-lg border border-rose-200">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-bold text-xs text-rose-900">{item.title}</span>
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                  </div>
                  <div className="text-xs font-black text-rose-800">
                    {formatTime(item.start)} - {formatTime(item.end)}
                  </div>
                  <p className="text-[10px] text-rose-700 mt-0.5">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Screen-Fit Sub-Page Bottom Navigation Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-[#8C6239]/25 text-xs">
        <button
          type="button"
          onClick={() => setSubPage(subPage === 'table' ? 'windows' : 'table')}
          className="flex items-center gap-1 px-2.5 py-1.5 bg-[#FAF2E4] hover:bg-[#F4E8D1] text-[#5C3A21] border border-[#8C6239]/30 rounded-lg font-bold transition cursor-pointer active:scale-95 shadow-xs"
        >
          <ChevronLeft className="w-3.5 h-3.5 text-[#B56A00]" />
          <span>{subPage === 'table' ? 'शुभ मुहूर्त' : 'चौघड़िया तालिका'}</span>
        </button>

        <span className="font-granth text-xs font-bold text-[#8C6239]">
          {subPage === 'table' ? 'पृष्ठ १ / २' : 'पृष्ठ २ / २'}
        </span>

        <button
          type="button"
          onClick={() => setSubPage(subPage === 'table' ? 'windows' : 'table')}
          className="flex items-center gap-1 px-2.5 py-1.5 bg-[#FAF2E4] hover:bg-[#F4E8D1] text-[#5C3A21] border border-[#8C6239]/30 rounded-lg font-bold transition cursor-pointer active:scale-95 shadow-xs"
        >
          <span>{subPage === 'table' ? 'शुभ मुहूर्त' : 'चौघड़िया तालिका'}</span>
          <ChevronRight className="w-3.5 h-3.5 text-[#B56A00]" />
        </button>
      </div>
    </div>
  );
};

