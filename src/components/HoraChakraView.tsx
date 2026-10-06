import React, { useState } from 'react';
import { SolarTimes } from '../types';
import { calculateHoraTable, HoraItem } from '../services/horaPanchakYogas';
import { Clock, Sun, Moon, Info, Sparkles, Share2 } from 'lucide-react';
import { openWhatsAppShare } from '../services/umaConsultationPdf';

interface HoraChakraViewProps {
  solar: SolarTimes;
  date: Date;
  locationName?: string;
  onOpenUmaModal?: (query?: string) => void;
}

export const HoraChakraView: React.FC<HoraChakraViewProps> = ({
  solar,
  date,
  locationName = 'उज्जैन',
  onOpenUmaModal,
}) => {
  const [period, setPeriod] = useState<'day' | 'night'>('day');
  const { dayHoras, nightHoras, currentActiveHora } = calculateHoraTable(solar, date);

  const horas = period === 'day' ? dayHoras : nightHoras;

  const fmt = (d: Date) =>
    d.toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' });

  const handleShareHora = () => {
    const lines = [
      `⏳ *दैनिक होरा चक्र (24-Hour Hora Table) • शक्ति सनातन पंचांग*`,
      `📅 दिनांक: ${date.toLocaleDateString('hi-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`,
      `📍 स्थान: ${locationName}`,
    ];

    if (currentActiveHora) {
      lines.push(``);
      lines.push(`✨ *वर्तमान सक्रिय होरा:* ${currentActiveHora.symbol} ${currentActiveHora.planet} की होरा (${fmt(currentActiveHora.start)} से ${fmt(currentActiveHora.end)})`);
      lines.push(`• अनुकूल कार्य: ${currentActiveHora.favorableWork}`);
    }

    lines.push(``);
    lines.push(`*${period === 'day' ? 'दिन की १२ होरा' : 'रात्रि की १२ होरा'}:*`);
    horas.forEach((h) => {
      const tag = h.nature === 'auspicious' ? 'शुभ' : h.nature === 'strict' ? 'त्याज्य' : 'मध्यम';
      lines.push(`• ${h.symbol} ${h.planet} होरा: ${fmt(h.start)} - ${fmt(h.end)} [${tag}]`);
    });

    lines.push(``);
    lines.push(`॥ शुभम् भवतु • शक्ति पंचांग ॥`);

    const text = lines.join('\n');
    openWhatsAppShare(text);
  };

  return (
    <div className="space-y-2 animate-in fade-in duration-150">
      {/* Current Active Hora Banner */}
      {currentActiveHora && (
        <div className="bg-gradient-to-r from-[#FFF8E1] to-[#FFE082] border border-[#FFE082] rounded-xl p-2.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-xl">{currentActiveHora.symbol}</span>
              <div>
                <span className="text-[10px] font-bold text-[#8C6239] uppercase">वर्तमान सक्रिय होरा</span>
                <div className="text-xs sm:text-sm font-black text-[#5C3A21]">
                  {currentActiveHora.planet} की होरा ({fmt(currentActiveHora.start)} – {fmt(currentActiveHora.end)})
                </div>
              </div>
            </div>
            <span className="px-2 py-0.5 text-[10px] font-black rounded-full bg-[#B56A00] text-white animate-pulse">
              सक्रिय
            </span>
          </div>
          <div className="mt-1.5 text-[11px] text-[#735133] leading-snug">
            <strong className="text-[#5C3A21]">अनुकूल कार्य: </strong>
            {currentActiveHora.favorableWork}
          </div>
        </div>
      )}

      {/* Day / Night Hora Switcher */}
      <div className="flex items-center justify-between gap-1 bg-[#F4E8D1] border border-[#8C6239]/25 p-1 rounded-xl shadow-2xs">
        <button
          type="button"
          onClick={() => setPeriod('day')}
          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-black transition cursor-pointer flex items-center justify-center gap-1.5 ${
            period === 'day'
              ? 'bg-[#5C3A21] text-white shadow-xs'
              : 'text-[#5C3A21] hover:bg-[#EBDDC1]'
          }`}
        >
          <Sun className="w-3.5 h-3.5 text-amber-300" />
          <span>दिन होरा (१२ होरा)</span>
        </button>

        <button
          type="button"
          onClick={() => setPeriod('night')}
          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-black transition cursor-pointer flex items-center justify-center gap-1.5 ${
            period === 'night'
              ? 'bg-[#5C3A21] text-white shadow-xs'
              : 'text-[#5C3A21] hover:bg-[#EBDDC1]'
          }`}
        >
          <Moon className="w-3.5 h-3.5 text-indigo-300" />
          <span>रात्रि होरा (१२ होरा)</span>
        </button>
      </div>

      {/* Hora List (Grid / Cards) */}
      <div className="space-y-1">
        {horas.map((h) => {
          const isAuspicious = h.nature === 'auspicious';
          const isStrict = h.nature === 'strict';

          return (
            <div
              key={h.number}
              className={`rounded-xl px-2.5 py-1.5 border text-xs transition shadow-2xs flex items-center justify-between ${
                h.isActive
                  ? 'bg-[#FFF9C4] border-[#FBC02D] ring-2 ring-[#FBC02D]/40'
                  : isAuspicious
                  ? 'bg-[#F1F8E9] border-[#C8E6C9]'
                  : isStrict
                  ? 'bg-[#FFEBEE] border-[#FFCDD2]'
                  : 'bg-white border-[#8C6239]/20'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-base">{h.symbol}</span>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-[#5C3A21]">
                      {h.planet} होरा
                    </span>
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                        isAuspicious
                          ? 'bg-[#C8E6C9] text-[#1B5E20]'
                          : isStrict
                          ? 'bg-[#FFCDD2] text-[#B71C1C]'
                          : 'bg-[#FFE082] text-[#B56A00]'
                      }`}
                    >
                      {isAuspicious ? 'शुभ' : isStrict ? 'कठोर/त्याज्य' : 'मध्यम'}
                    </span>
                    {h.isActive && (
                      <span className="text-[9px] font-black text-amber-700 bg-amber-100 px-1 rounded animate-pulse">
                        अब
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-[#735133] truncate max-w-[210px] sm:max-w-md">
                    {h.favorableWork}
                  </div>
                </div>
              </div>

              <div className="font-mono font-bold text-xs text-[#5C3A21] shrink-0 text-right">
                <div>{fmt(h.start)}</div>
                <div className="text-[10px] opacity-75 text-[#8C6239]">से {fmt(h.end)}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Classical Guidance Note */}
      <div className="p-2 bg-[#FAF2E4] border border-[#8C6239]/20 rounded-xl text-[10px] text-[#735133] leading-relaxed">
        <span className="font-bold text-[#5C3A21]">शास्त्रोक्त नियम: </span>
        सूर्योदय से लेकर अगले सूर्योदय तक २४ होरा होती हैं। गुरु, शुक्र, बुध एवं चन्द्र की होरा शुभ कार्यों हेतु श्रेष्ठ होती हैं। शनि एवं मंगल की होरा में मांगलिक कार्य वर्जित हैं।
      </div>

      {/* Actions: Share & Ask Uma */}
      <div className="grid grid-cols-2 gap-2 pt-0.5">
        <button
          type="button"
          onClick={handleShareHora}
          className="py-1.5 px-3 bg-gradient-to-r from-[#25D366] to-[#1EBE5D] hover:from-[#20bd5a] hover:to-[#1aa852] text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-98"
          title="होरा चक्र व्हाट्सएप पर साझा करें"
        >
          <Share2 className="w-3.5 h-3.5 text-white" />
          <span>होरा व्हाट्सएप शेयर</span>
        </button>

        {onOpenUmaModal && (
          <button
            type="button"
            onClick={() => onOpenUmaModal(`आज की वर्तमान होरा (${currentActiveHora ? currentActiveHora.planet : 'सक्रिय'} की होरा) में कौन से कार्य करने चाहिए और क्या सावधानी रखें?`)}
            className="py-1.5 px-3 bg-gradient-to-r from-[#B56A00] to-[#8C6239] hover:from-[#9c5a00] hover:to-[#734f2d] text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-98"
            title="उमा से होरा विचार पूछें"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-200" />
            <span>उमा से होरा फल पूछें</span>
          </button>
        )}
      </div>
    </div>
  );
};
