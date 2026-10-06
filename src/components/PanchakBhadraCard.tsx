import React from 'react';
import { PanchakStatus, BhadraStatus } from '../services/horaPanchakYogas';
import { ShieldAlert, CheckCircle2, AlertTriangle, Sparkles, Compass } from 'lucide-react';

interface PanchakBhadraCardProps {
  panchak: PanchakStatus;
  bhadra: BhadraStatus;
}

export const PanchakBhadraCard: React.FC<PanchakBhadraCardProps> = ({ panchak, bhadra }) => {
  return (
    <div className="space-y-2.5 animate-in fade-in duration-150">
      {/* 1. Panchak Card */}
      <div
        className={`border rounded-xl p-3 shadow-2xs space-y-2 ${
          panchak.isActive
            ? panchak.nature === 'auspicious'
              ? 'bg-[#F1F8E9] border-[#C8E6C9]'
              : 'bg-[#FFF8E1] border-[#FFE082]'
            : 'bg-white border-[#8C6239]/20'
        }`}
      >
        <div className="flex items-center justify-between border-b border-black/10 pb-1.5">
          <div className="flex items-center gap-1.5">
            <span className="text-base">⚡</span>
            <div>
              <span className="text-xs font-black text-[#5C3A21]">पञ्चक विचार</span>
              <span className="text-[10px] text-[#8C6239] ml-1.5 font-bold">
                ({panchak.rashi} • {panchak.nakshatra})
              </span>
            </div>
          </div>
          <span
            className={`px-2 py-0.5 text-[10px] font-black rounded-full ${
              panchak.isActive
                ? panchak.nature === 'auspicious'
                  ? 'bg-emerald-700 text-white'
                  : 'bg-amber-700 text-white'
                : 'bg-emerald-100 text-emerald-800'
            }`}
          >
            {panchak.isActive ? panchak.typeNameHindi : 'पञ्चक रहित (सामान्य)'}
          </span>
        </div>

        <div className="text-xs text-[#5C3A21] leading-relaxed">
          {panchak.description}
        </div>

        {panchak.isActive && (
          <div className="bg-white/80 border border-[#8C6239]/20 rounded-lg p-2 space-y-1">
            <div className="text-[10px] font-bold text-[#B71C1C] flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-[#B71C1C]" />
              <span>पञ्चक में शास्त्रोक्त ५ वर्जित कार्य:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[10px] text-[#735133]">
              {panchak.forbiddenActs.map((act, i) => (
                <div key={i} className="leading-snug">
                  {act}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 2. Bhadra Card */}
      <div
        className={`border rounded-xl p-3 shadow-2xs space-y-2 ${
          bhadra.isActive
            ? bhadra.nature === 'varjya'
              ? 'bg-[#FFEBEE] border-[#FFCDD2]'
              : 'bg-[#E8F5E9] border-[#C8E6C9]'
            : 'bg-white border-[#8C6239]/20'
        }`}
      >
        <div className="flex items-center justify-between border-b border-black/10 pb-1.5">
          <div className="flex items-center gap-1.5">
            <span className="text-base">🛡️</span>
            <div>
              <span className="text-xs font-black text-[#5C3A21]">भद्रा विचार (विष्टि करण)</span>
              <span className="text-[10px] text-[#8C6239] ml-1.5 font-bold">
                वास: {bhadra.vas}
              </span>
            </div>
          </div>
          <span
            className={`px-2 py-0.5 text-[10px] font-black rounded-full ${
              bhadra.isActive
                ? bhadra.nature === 'varjya'
                  ? 'bg-rose-700 text-white'
                  : 'bg-emerald-700 text-white'
                : 'bg-emerald-100 text-emerald-800'
            }`}
          >
            {bhadra.isActive ? `${bhadra.vas} भद्रा` : 'भद्रा मुक्त'}
          </span>
        </div>

        <div className="text-xs text-[#5C3A21] leading-relaxed">
          {bhadra.impactDescription}
        </div>

        <div className="p-2 bg-white/80 border border-[#8C6239]/20 rounded-lg text-xs leading-relaxed text-[#735133]">
          <strong className="text-[#5C3A21]">शास्त्रीय फल: </strong>
          {bhadra.guidance}
        </div>

        {/* Classical Shloka on Bhadra Residence */}
        <div className="p-2 bg-[#FAF2E4] rounded-lg border border-[#8C6239]/15 text-[10px] text-[#8C6239] italic text-center">
          "स्वर्गे भद्रा शुभं कुर्यात् पाताले च धनागमा। मृत्युलोके यदा भद्रा सर्वकार्य विनाशिनी॥"
        </div>
      </div>
    </div>
  );
};
