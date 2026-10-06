import React, { useState } from 'react';
import { VedicPanchangData } from '../types';
import { MUHURAT_ACTIVITIES, getMuhuratGuidance, getDailyMuhuratDetails } from '../services/muhurat';
import { DISHASHOOL_MAP } from '../services/disha';
import { AnnualMuhuratTableView } from './AnnualMuhuratTableView';
import { useTranslation } from '../i18n';
import { trVedic, trWeekday } from '../i18n/vedicTranslate';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  Clock,
  BookOpen,
  Calendar,
} from 'lucide-react';

interface MuhuratViewProps {
  panchang: VedicPanchangData;
}

export const MuhuratView: React.FC<MuhuratViewProps> = ({ panchang }) => {
  const { t } = useTranslation();
  const [selectedActivity, setSelectedActivity] = useState(MUHURAT_ACTIVITIES[0]);
  const [subPage, setSubPage] = useState<'annual_table' | 'today' | 'windows' | 'guidance'>('annual_table');
  const weekday = panchang.date.getDay();
  const shoolDirection = DISHASHOOL_MAP[weekday];
  const guidance = getMuhuratGuidance(selectedActivity, panchang, shoolDirection);
  const dailyRows = getDailyMuhuratDetails(panchang);

  return (
    <div className="space-y-2 sm:space-y-3 animate-in fade-in duration-200">
      {/* Flutter-style Segmented Chips */}
      <div className="flex items-center gap-1 p-0.5 sm:p-1 bg-[#FAF2E4] border border-[#8C6239]/30 rounded-xl shadow-xs overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setSubPage('annual_table')}
          className={`flex-1 py-1 px-1.5 text-center text-[11px] sm:text-xs font-black rounded-lg transition flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap ${
            subPage === 'annual_table'
              ? 'bg-[#5C3A21] text-white shadow-xs'
              : 'bg-[#F4E8D1] text-[#5C3A21] hover:bg-[#EBDDC1]'
          }`}
        >
          <Calendar className="w-3.5 h-3.5 text-amber-300" />
          <span>{t('muhurat.annualTableTab', 'विवाह/गृहप्रवेश सारणी')}</span>
        </button>
        <button
          type="button"
          onClick={() => setSubPage('today')}
          className={`flex-1 py-1 px-1.5 text-center text-[11px] sm:text-xs font-black rounded-lg transition flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap ${
            subPage === 'today'
              ? 'bg-[#5C3A21] text-white shadow-xs'
              : 'bg-[#F4E8D1] text-[#5C3A21] hover:bg-[#EBDDC1]'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>{t('muhurat.todayTab', 'आज के मुहूर्त')}</span>
        </button>
        <button
          type="button"
          onClick={() => setSubPage('windows')}
          className={`flex-1 py-1 px-1.5 text-center text-[11px] sm:text-xs font-black rounded-lg transition flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap ${
            subPage === 'windows'
              ? 'bg-[#5C3A21] text-white shadow-xs'
              : 'bg-[#F4E8D1] text-[#5C3A21] hover:bg-[#EBDDC1]'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{t('muhurat.byActivityTab', 'कार्य अनुसार')}</span>
        </button>
        <button
          type="button"
          onClick={() => setSubPage('guidance')}
          className={`flex-1 py-1 px-1.5 text-center text-[11px] sm:text-xs font-black rounded-lg transition flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap ${
            subPage === 'guidance'
              ? 'bg-[#5C3A21] text-white shadow-xs'
              : 'bg-[#F4E8D1] text-[#5C3A21] hover:bg-[#EBDDC1]'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>{t('muhurat.vedicRulesTab', 'वैदिक नियम')}</span>
        </button>
      </div>

      {/* When Annual Table is selected */}
      {subPage === 'annual_table' && <AnnualMuhuratTableView />}

      {/* When other sub-pages are selected */}
      {subPage !== 'annual_table' && (
        <div className="space-y-4">
          {/* Activity Selector */}
          <div className="bg-[#FAF2E4] border border-[#8C6239]/30 rounded-xl p-3 sm:p-4 shadow-xs">
            <label className="block text-xs font-bold text-[#8C6239] uppercase tracking-wider mb-2">
              {t('muhurat.selectActivity', 'कार्य का चयन करें')}
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
                    {trVedic(act)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Guidance Card */}
          <div className="bg-[#FAF2E4] border-2 border-[#8C6239]/40 rounded-xl p-4 sm:p-5 shadow-sm space-y-4">
            {/* Header Status */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#8C6239]/20 pb-3">
              <div>
                <div className="text-xs font-bold text-[#8C6239]">{t('muhurat.selectedActivity', 'चयनित कार्य')}</div>
                <h2 className="text-xl sm:text-2xl font-black font-granth text-[#5C3A21]">
                  {trVedic(guidance.activity)} {t('muhurat.title', 'मुहूर्त')}
                </h2>
              </div>
              <div className={`px-3 py-1 rounded-lg border font-black text-xs sm:text-sm ${guidance.statusColor}`}>
                {guidance.gradeText}
              </div>
            </div>

        {subPage === 'today' && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              {[
                [t('panchang.weekday', 'वार'), trWeekday(panchang.weekday)],
                [t('panchang.tithi', 'तिथि'), `${trVedic(panchang.paksha)} ${trVedic(panchang.tithi)}`],
                [t('panchang.nakshatra', 'नक्षत्र'), trVedic(panchang.nakshatra)],
                [t('panchang.yoga', 'योग') + ' / ' + t('panchang.karana', 'करण'), `${trVedic(panchang.yoga)} · ${trVedic(panchang.karana)}`],
              ].map(([k, v]) => (
                <div key={k} className="bg-[#F4E8D1] border border-[#8C6239]/25 rounded-lg p-2">
                  <div className="text-[10px] font-bold text-[#8C6239] uppercase">{k}</div>
                  <div className="font-black text-[#5C3A21] leading-tight">{v}</div>
                </div>
              ))}
            </div>
            <div className="text-[11px] font-bold text-[#8C6239]">
              {t('yatra.shoolDirection', 'दिशाशूल')}: {trVedic(shoolDirection)}
            </div>
            <div className="divide-y divide-[#8C6239]/15 border border-[#8C6239]/25 rounded-xl overflow-hidden">
              {dailyRows.map((row) => (
                <div
                  key={row.title + row.start}
                  className={`flex items-start justify-between gap-2 px-3 py-2 text-xs ${
                    row.kind === 'shubh' ? 'bg-emerald-50/80' : 'bg-rose-50/70'
                  }`}
                >
                  <div>
                    <div className="font-black text-[#3E2714]">{trVedic(row.title)}</div>
                    <div className="text-[11px] text-[#735133]">{row.note}</div>
                  </div>
                  <div
                    className={`shrink-0 font-black px-2 py-0.5 rounded ${
                      row.kind === 'shubh' ? 'bg-emerald-100 text-emerald-900' : 'bg-rose-100 text-rose-900'
                    }`}
                  >
                    {row.start === row.end ? row.start : `${row.start}–${row.end}`}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sub-Page 1: Suitable & Avoid Windows */}
        {subPage === 'windows' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4">
                <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs uppercase tracking-wider mb-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  {t('muhurat.suitableWindowsTitle', 'ઉપલબ્ધ શુભ સમય વિન્ડો (Suitable Windows)')}
                </div>
                {guidance.suitableWindows.length > 0 ? (
                  <div className="space-y-2">
                    {guidance.suitableWindows.map((w, idx) => (
                      <div
                        key={idx}
                        className="bg-white/80 p-2.5 rounded-lg border border-emerald-200 flex justify-between items-center text-xs"
                      >
                        <span className="font-semibold text-emerald-950">{trVedic(w.title)}</span>
                        <span className="font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                          {w.start} - {w.end}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-emerald-800 italic">{t('muhurat.limitedSuitableWindows', 'આજે વિશેષ શુભ વિન્ડો મર્યાદિત છે.')}</p>
                )}
              </div>

              <div className="bg-rose-50/70 border border-rose-200 rounded-xl p-4">
                <div className="flex items-center gap-2 text-rose-900 font-bold text-xs uppercase tracking-wider mb-2.5">
                  <AlertTriangle className="w-4 h-4 text-rose-700" />
                  {t('muhurat.avoidWindowsTitle', 'ત્યાજ્ય સમય (Avoid Windows)')}
                </div>
                <div className="space-y-2">
                  {guidance.avoidWindows.map((w, idx) => (
                    <div
                      key={idx}
                      className="bg-white/80 p-2.5 rounded-lg border border-rose-200 flex justify-between items-center text-xs"
                    >
                      <span className="font-semibold text-rose-950">{trVedic(w.title)}</span>
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
              <span className="text-xs font-bold text-[#8C6239]">{t('muhurat.page1of2', 'પૃષ્ઠ ૧ / ૨ (શુભ-અશુભ સમય)')}</span>
              <button
                type="button"
                onClick={() => setSubPage('guidance')}
                className="px-3 py-1 bg-[#5C3A21] hover:bg-[#462B17] text-[#FAF2E4] text-xs font-bold rounded-lg transition flex items-center gap-1 cursor-pointer"
              >
                <span>{t('muhurat.nextVedicRules', 'આગળ: ૨. વૈદિક નિયમો અને વિચાર')}</span>
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
                {t('muhurat.astrologyFactorsTitle', 'પંચાંગ અને જ્યોતિષીય વિચાર (Panchang Astrological Factors)')}
              </h4>
              <ul className="space-y-1.5 text-xs sm:text-sm text-[#5C3A21]">
                {guidance.reasons.map((r, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-[#B56A00] font-bold">•</span>
                    <span>{trVedic(r)}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Guidelines */}
            <div className="bg-[#F4E8D1]/70 border border-[#8C6239]/30 rounded-xl p-4">
              <h4 className="text-xs font-bold text-[#8C6239] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                {t('muhurat.guidelinesTitle', 'શુભ ફળ હેતુ આવશ્યક વૈદિક સૂચનો (Guidelines)')}
              </h4>
              <ul className="space-y-1.5 text-xs sm:text-sm text-[#5C3A21]">
                {guidance.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-[#8C6239] font-bold">✓</span>
                    <span>{trVedic(rec)}</span>
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
                <span>{t('muhurat.prevSuitableWindows', 'પાછળ: ૧. શુભ અને ત્યાજ્ય સમય')}</span>
              </button>
              <span className="text-xs font-bold text-[#8C6239]">{t('muhurat.page2of2', 'પૃષ્ઠ ૨ / ૨')}</span>
            </div>
          </div>
        )}
      </div>
      </div>
      )}
    </div>
  );
};
