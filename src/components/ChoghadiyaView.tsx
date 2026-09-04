import React, { useState, useEffect } from 'react';
import { VedicPanchangData, ChoghadiyaItem } from '../types';
import {
  getDayChoghadiya,
  getNightChoghadiya,
  getCurrentChoghadiya,
  getInauspiciousWindows,
  getAuspiciousWindows,
} from '../services/choghadiya';
import { Clock, Sun, Moon, Sparkles, CheckCircle2, AlertTriangle, ShieldAlert } from 'lucide-react';

interface ChoghadiyaViewProps {
  panchang: VedicPanchangData;
}

export const ChoghadiyaView: React.FC<ChoghadiyaViewProps> = ({ panchang }) => {
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
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Current Active Choghadiya Banner */}
      {current && (
        <div className="bg-gradient-to-r from-[#FAF2E4] to-[#F4E8D1] border-2 border-[#B56A00] rounded-xl p-4.5 shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="relative flex items-center justify-center w-12 h-12 rounded-full bg-[#B56A00] text-white shadow-md">
              <Clock className="w-6 h-6 animate-spin-slow" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500" />
              </span>
            </div>
            <div>
              <div className="text-xs font-bold text-[#8C6239] uppercase tracking-wider">
                वर्तमान चालू चौघड़िया
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-black font-granth text-[#5C3A21]">
                  {current.hindiName} चौघड़िया
                </span>
                <span className={`text-xs px-2 py-0.5 rounded font-bold border ${getBadgeStyle(current.nature)}`}>
                  {getNatureText(current.nature)}
                </span>
              </div>
              <p className="text-xs text-[#735133] mt-0.5">{current.meaning}</p>
            </div>
          </div>

          <div className="bg-[#FAF2E4] px-4 py-2 rounded-lg border border-[#8C6239]/30 text-right">
            <div className="text-[11px] font-semibold text-[#8C6239]">समय सीमा</div>
            <div className="text-sm font-black text-[#5C3A21]">
              {formatTime(current.start)} - {formatTime(current.end)}
            </div>
            <div className="text-xs font-bold text-[#B56A00]">
              लगभग {remainingMinutes} मिनट शेष
            </div>
          </div>
        </div>
      )}

      {/* Day / Night Toggle */}
      <div className="flex items-center justify-between border-b border-[#8C6239]/30 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPeriod('day')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition ${
              period === 'day'
                ? 'bg-[#5C3A21] text-[#FAF2E4] shadow-sm'
                : 'bg-[#FAF2E4] text-[#5C3A21] hover:bg-[#F4E8D1] border border-[#8C6239]/30'
            }`}
          >
            <Sun className="w-4 h-4 text-amber-500" />
            दिन का चौघड़िया (Day)
          </button>
          <button
            onClick={() => setPeriod('night')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition ${
              period === 'night'
                ? 'bg-[#5C3A21] text-[#FAF2E4] shadow-sm'
                : 'bg-[#FAF2E4] text-[#5C3A21] hover:bg-[#F4E8D1] border border-[#8C6239]/30'
            }`}
          >
            <Moon className="w-4 h-4 text-indigo-400" />
            रात का चौघड़िया (Night)
          </button>
        </div>
        <span className="text-xs text-[#735133] hidden sm:inline">
          {panchang.weekday} • {period === 'day' ? 'सूर्योदय से सूर्यास्त' : 'सूर्यास्त से अगला सूर्योदय'}
        </span>
      </div>

      {/* Choghadiya Table */}
      <div className="bg-[#FAF2E4] border border-[#8C6239]/40 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-[#5C3A21] text-[#FAF2E4] text-xs uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">चौघड़िया</th>
                <th className="py-3 px-4">प्रकृति</th>
                <th className="py-3 px-4">समय अवधि</th>
                <th className="py-3 px-4">स्वामी ग्रह</th>
                <th className="py-3 px-4">फल व प्रभाव</th>
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
                        ? 'bg-amber-100/70 font-semibold'
                        : idx % 2 === 0
                        ? 'bg-[#FAF2E4]'
                        : 'bg-[#F4E8D1]/60'
                    }`}
                  >
                    <td className="py-3 px-4 font-bold text-[#5C3A21]">
                      <div className="flex items-center gap-2">
                        {isActive && (
                          <span className="w-2 h-2 rounded-full bg-[#B56A00] animate-ping" />
                        )}
                        <span>{item.hindiName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold border ${getBadgeStyle(
                          item.nature
                        )}`}
                      >
                        {getNatureText(item.nature)}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-[#5C3A21] font-medium">
                      {formatTime(item.start)} - {formatTime(item.end)}
                    </td>
                    <td className="py-3 px-4 text-[#735133]">{item.ruler}</td>
                    <td className="py-3 px-4 text-[#5C3A21]">{item.meaning}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Auspicious Windows */}
      <div className="bg-[#FAF2E4] border border-[#8C6239]/30 rounded-xl p-5 shadow-xs">
        <h3 className="text-base font-bold font-granth text-[#5C3A21] mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#B56A00]" />
          दैनिक शुभ मुहूर्त (Auspicious Windows)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {auspiciousWindows.map((item, idx) => (
            <div key={idx} className="bg-[#F4E8D1] p-3.5 rounded-lg border border-[#8C6239]/20">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-xs text-[#5C3A21]">{item.title}</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
              </div>
              <div className="text-sm font-black text-[#B56A00]">
                {formatTime(item.start)} - {formatTime(item.end)}
              </div>
              <p className="text-[11px] text-[#735133] mt-1">{item.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Inauspicious Windows */}
      <div className="bg-[#FAF2E4] border border-[#8C6239]/30 rounded-xl p-5 shadow-xs">
        <h3 className="text-base font-bold font-granth text-[#5C3A21] mb-3 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-700" />
          दैनिक वर्जित समय (Inauspicious Windows - त्याज्य काल)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {inauspiciousWindows.map((item, idx) => (
            <div key={idx} className="bg-rose-50/70 p-3.5 rounded-lg border border-rose-200">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-xs text-rose-900">{item.title}</span>
                <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
              </div>
              <div className="text-sm font-black text-rose-800">
                {formatTime(item.start)} - {formatTime(item.end)}
              </div>
              <p className="text-[11px] text-rose-700 mt-1">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
