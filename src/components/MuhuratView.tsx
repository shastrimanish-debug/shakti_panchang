import React, { useState } from 'react';
import { VedicPanchangData } from '../types';
import { MUHURAT_ACTIVITIES, getMuhuratGuidance } from '../services/muhurat';
import { DISHASHOOL_MAP } from '../services/disha';
import { Sparkles, CheckCircle2, AlertTriangle, ShieldCheck, ChevronRight, ChevronLeft, Clock, BookOpen } from 'lucide-react';

interface MuhuratViewProps {
  panchang: VedicPanchangData;
}

export const MuhuratView: React.FC<MuhuratViewProps> = ({ panchang }) => {
  const [selectedActivity, setSelectedActivity] = useState(MUHURAT_ACTIVITIES[0]);
  const [subPage, setSubPage] = useState<'windows' | 'guidance'>('windows');
  const weekday = panchang.date.getDay();
  const shoolDirection = DISHASHOOL_MAP[weekday];
  const guidance = getMuhuratGuidance(selectedActivity, panchang, shoolDirection);

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Activity Selector */}
      <div className="bg-[#FAF2E4] border border-[#8C6239]/30 rounded-xl p-3 sm:p-4 shadow-xs">
        <label className="block text-xs font-bold text-[#8C6239] uppercase tracking-wider mb-2">
          कार्य का चयन करें (Select Activity for Muhurat Guidance)
        </label>
        <div className="flex flex-wrap gap-1.5">
          {MUHURAT_ACTIVITIES.map((act) => {
            const isSelected = selectedActivity === act;
            return (
              <button
                key={act}
                onClick={() => setSelectedActivity(act)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  isSelected
                    ? 'bg-[#5C3A21] text-[#FAF2E4] shadow-xs'
                    : 'bg-[#F4E8D1] text-[#5C3A21] hover:bg-[#FAF2E4] border border-[#8C6239]/30'
                }`}
              >
                {act}
              </button>
            );
          })}
        </div>
      </div>

      {/* Segmented Sub-Pages Bar */}
      <div className="flex items-center justify-between gap-1 p-1 bg-[#FAF2E4] border border-[#8C6239]/40 rounded-xl shadow-xs">
        <button
          type="button"
          onClick={() => setSubPage('windows')}
          className={`flex-1 py-2 px-2 text-center text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${
            subPage === 'windows'
              ? 'bg-[#5C3A21] text-[#FAF2E4] shadow-xs'
              : 'text-[#8C6239] hover:bg-[#F4E8D1]'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>१. शुभ व त्याज्य समय</span>
        </button>
        <button
          type="button"
          onClick={() => setSubPage('guidance')}
          className={`flex-1 py-2 px-2 text-center text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${
            subPage === 'guidance'
              ? 'bg-[#5C3A21] text-[#FAF2E4] shadow-xs'
              : 'text-[#8C6239] hover:bg-[#F4E8D1]'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>२. वैदिक विचार व नियम</span>
        </button>
      </div>

      {/* Main Guidance Card */}
      <div className="bg-[#FAF2E4] border-2 border-[#8C6239]/40 rounded-xl p-4 sm:p-5 shadow-sm space-y-4">
        {/* Header Status */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#8C6239]/20 pb-3">
          <div>
            <div className="text-xs font-bold text-[#8C6239]">चयनित कार्य</div>
            <h2 className="text-xl sm:text-2xl font-black font-granth text-[#5C3A21]">
              {guidance.activity} मुहूर्त
            </h2>
          </div>
          <div className={`px-3 py-1 rounded-lg border font-black text-xs sm:text-sm ${guidance.statusColor}`}>
            {guidance.gradeText}
          </div>
        </div>

        {/* Sub-Page 1: Suitable & Avoid Windows */}
        {subPage === 'windows' && (
          <div className="space-y-4">
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

            {/* Bottom Pagination */}
            <div className="flex items-center justify-between p-2.5 bg-[#F4E8D1] border border-[#8C6239]/30 rounded-lg">
              <span className="text-xs font-bold text-[#8C6239]">पृष्ठ 1 / 2 (शुभ-अशुभ समय)</span>
              <button
                type="button"
                onClick={() => setSubPage('guidance')}
                className="px-3 py-1 bg-[#5C3A21] hover:bg-[#462B17] text-[#FAF2E4] text-xs font-bold rounded-lg transition flex items-center gap-1 cursor-pointer"
              >
                <span>अगला: २. वैदिक नियम व विचार</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Sub-Page 2: Astrological Analysis & Recommendations */}
        {subPage === 'guidance' && (
          <div className="space-y-4">
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

            {/* Guidelines */}
            <div className="bg-[#F4E8D1]/70 border border-[#8C6239]/30 rounded-xl p-4">
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

            {/* Bottom Pagination */}
            <div className="flex items-center justify-between p-2.5 bg-[#F4E8D1] border border-[#8C6239]/30 rounded-lg">
              <button
                type="button"
                onClick={() => setSubPage('windows')}
                className="px-3 py-1 bg-[#FAF2E4] border border-[#8C6239]/40 hover:bg-white text-[#5C3A21] text-xs font-bold rounded-lg transition flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>पिछला: १. शुभ व त्याज्य समय</span>
              </button>
              <span className="text-xs font-bold text-[#8C6239]">पृष्ठ 2 / 2</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
