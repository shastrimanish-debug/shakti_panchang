import React, { useState } from 'react';
import { VedicPanchangData } from '../types';
import { MUHURAT_ACTIVITIES, getMuhuratGuidance } from '../services/muhurat';
import { DISHASHOOL_MAP } from '../services/disha';
import { Sparkles, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

interface MuhuratViewProps {
  panchang: VedicPanchangData;
}

export const MuhuratView: React.FC<MuhuratViewProps> = ({ panchang }) => {
  const [selectedActivity, setSelectedActivity] = useState(MUHURAT_ACTIVITIES[0]);
  const weekday = panchang.date.getDay();
  const shoolDirection = DISHASHOOL_MAP[weekday];
  const guidance = getMuhuratGuidance(selectedActivity, panchang, shoolDirection);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Activity Selector */}
      <div className="bg-[#FAF2E4] border border-[#8C6239]/30 rounded-xl p-4 shadow-xs">
        <label className="block text-xs font-bold text-[#8C6239] uppercase tracking-wider mb-2.5">
          कार्य का चयन करें (Select Activity for Muhurat Guidance)
        </label>
        <div className="flex flex-wrap gap-2">
          {MUHURAT_ACTIVITIES.map((act) => {
            const isSelected = selectedActivity === act;
            return (
              <button
                key={act}
                onClick={() => setSelectedActivity(act)}
                className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold transition ${
                  isSelected
                    ? 'bg-[#5C3A21] text-[#FAF2E4] shadow-sm'
                    : 'bg-[#F4E8D1] text-[#5C3A21] hover:bg-[#FAF2E4] border border-[#8C6239]/30'
                }`}
              >
                {act}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Guidance Card */}
      <div className="bg-[#FAF2E4] border-2 border-[#8C6239]/40 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#8C6239]/20 pb-3">
          <div>
            <div className="text-xs font-bold text-[#8C6239]">चयनित कार्य</div>
            <h2 className="text-2xl font-black font-granth text-[#5C3A21]">
              {guidance.activity} मुहूर्त
            </h2>
          </div>
          <div className={`px-3.5 py-1.5 rounded-lg border font-black text-xs sm:text-sm ${guidance.statusColor}`}>
            {guidance.gradeText}
          </div>
        </div>

        {/* Astrological Analysis */}
        <div className="bg-[#F4E8D1] p-4 rounded-lg border border-[#8C6239]/20">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#5C3A21] mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#B56A00]" />
            पंचांग एवं ज्योतिषीय विचार (Panchang Astrological Factors)
          </h4>
          <ul className="space-y-1.5 text-xs sm:text-sm text-[#5C3A21]">
            {guidance.reasons.map((r, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-[#B56A00] font-bold">•</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Suitable & Avoid Windows */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4">
            <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs uppercase tracking-wider mb-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              उपलब्ध शुभ समय विंडो (Suitable Windows)
            </div>
            {guidance.suitableWindows.length > 0 ? (
              <div className="space-y-2">
                {guidance.suitableWindows.map((w, idx) => (
                  <div
                    key={idx}
                    className="bg-white/80 p-2.5 rounded-lg border border-emerald-200 flex justify-between items-center text-xs"
                  >
                    <span className="font-semibold text-emerald-950">{w.title}</span>
                    <span className="font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                      {w.start} - {w.end}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-emerald-800 italic">आज विशेष शुभ विंडो सीमित है।</p>
            )}
          </div>

          <div className="bg-rose-50/70 border border-rose-200 rounded-xl p-4">
            <div className="flex items-center gap-2 text-rose-900 font-bold text-xs uppercase tracking-wider mb-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-700" />
              त्याज्य समय (Avoid Windows)
            </div>
            <div className="space-y-2">
              {guidance.avoidWindows.map((w, idx) => (
                <div
                  key={idx}
                  className="bg-white/80 p-2.5 rounded-lg border border-rose-200 flex justify-between items-center text-xs"
                >
                  <span className="font-semibold text-rose-950">{w.title}</span>
                  <span className="font-black text-rose-800 bg-rose-100 px-2 py-0.5 rounded">
                    {w.start} - {w.end}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Guidelines */}
        <div className="bg-[#FAF2E4] border border-[#8C6239]/30 rounded-xl p-4">
          <h4 className="text-xs font-bold text-[#8C6239] uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            शुभ फल हेतु आवश्यक वैदिक सुझाव (Guidelines)
          </h4>
          <ul className="space-y-1.5 text-xs sm:text-sm text-[#5C3A21]">
            {guidance.recommendations.map((rec, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-[#8C6239] font-bold">✓</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
