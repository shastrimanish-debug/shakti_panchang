import React, { useState, useMemo } from 'react';
import { PlanetPosition } from '../types';
import { KundaliChart } from './KundaliChart';
import { useLanguage } from '../i18n';
import { trPlanet, trRashi } from '../i18n/vedicTranslate';
import {
  analyzeD10Dashamsha,
  analyzeD7Saptamsha,
  analyzeD3Drekkana,
  calculateVaisheshikamshaSummary,
  SHODASH_DIVISIONS,
} from '../services/vargaAnalysis';
import {
  Briefcase,
  Baby,
  Shield,
  Award,
  Sparkles,
  Compass,
  CheckCircle2,
  BookOpen,
  Layers,
} from 'lucide-react';

interface VargaAnalysisPanelProps {
  lagnaDegree: number;
  planets: PlanetPosition[];
  nativeName: string;
  selectedVarga: number;
  onSelectVarga: (division: number) => void;
}

export const VargaAnalysisPanel: React.FC<VargaAnalysisPanelProps> = ({
  lagnaDegree,
  planets,
  nativeName,
  selectedVarga,
  onSelectVarga,
}) => {
  const { language } = useLanguage();
  const L = (hi: string, en: string, gu: string) =>
    language === 'en' ? en : language === 'gu' ? gu : hi;

  // Focus Mode: 'd10' (Career) | 'd7' (Progeny) | 'd3' (Valor) | 'grid' (16-Varga Vaisheshikamsha)
  const [activeAnalysisTab, setActiveAnalysisTab] = useState<'d10' | 'd7' | 'd3' | 'grid'>(() => {
    if (selectedVarga === 7) return 'd7';
    if (selectedVarga === 3) return 'd3';
    return 'd10';
  });

  const d10Analysis = useMemo(
    () => analyzeD10Dashamsha(lagnaDegree, planets, language),
    [lagnaDegree, planets, language]
  );
  const d7Analysis = useMemo(
    () => analyzeD7Saptamsha(lagnaDegree, planets, language),
    [lagnaDegree, planets, language]
  );
  const d3Analysis = useMemo(
    () => analyzeD3Drekkana(lagnaDegree, planets, language),
    [lagnaDegree, planets, language]
  );
  const vaisheshikamshaList = useMemo(
    () => calculateVaisheshikamshaSummary(lagnaDegree, planets, language),
    [lagnaDegree, planets, language]
  );

  const vargaColumnHeaders: Record<number, string> = {
    1: L('D1 लग्न', 'D1 Lagna', 'D1 લગ્ન'),
    2: L('D2 होरा', 'D2 Hora', 'D2 હોરા'),
    3: L('D3 द्रेष्काण', 'D3 Drekkana', 'D3 દ્રેષ્કાણ'),
    4: L('D4 चतुर्थांश', 'D4 Chaturth', 'D4 ચતુર્થાંશ'),
    7: L('D7 सप्तांश', 'D7 Saptamsha', 'D7 સપ્તમાંશ'),
    9: L('D9 नवमांश', 'D9 Navamsha', 'D9 નવમાંશ'),
    10: L('D10 दशमांश', 'D10 Dashamsha', 'D10 દશમાંશ'),
    12: L('D12 द्वादशांश', 'D12 Dwadash', 'D12 દ્વાદશાંશ'),
    16: L('D16 षोडशांश', 'D16 Shodash', 'D16 ષોડશાંશ'),
    20: L('D20 विंशांश', 'D20 Vimshamsh', 'D20 વિંશાંશ'),
    24: L('D24 चतुर्विंशांश', 'D24 Chaturvim', 'D24 ચતુર્વિંશાંશ'),
    27: L('D27 भांश', 'D27 Bhamsha', 'D27 ભાંશ'),
    30: L('D30 त्रिंशांश', 'D30 Trimshamsh', 'D30 ત્રિંશાંશ'),
    40: L('D40 खवेदांश', 'D40 Khaved', 'D40 ખવેદાંશ'),
    45: L('D45 अक्षवेदांश', 'D45 Akshaved', 'D45 અક્ષવેદાંશ'),
    60: L('D60 षष्ट्यंश', 'D60 Shashti', 'D60 ષષ્ટ્યંશ'),
  };

  return (
    <div className="space-y-4">
      {/* Priority Varga Navigation Bar */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#462B17] rounded-xl border border-[#8C6239]/60">
        <button
          type="button"
          onClick={() => {
            setActiveAnalysisTab('d10');
            onSelectVarga(10);
          }}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer min-w-[150px] ${
            activeAnalysisTab === 'd10'
              ? 'bg-[#FAF2E4] text-[#5C3A21] shadow-md font-black ring-1 ring-[#B56A00]'
              : 'text-[#E5D2B8] hover:text-white'
          }`}
        >
          <Briefcase className="w-4 h-4 text-[#B56A00]" />
          <span>{L('D10 दशमांश (करियर व आजीविका)', 'D10 Dashamsha (Career)', 'D10 દશમાંશ (કારકિર્દી અને આજીવિકા)')}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveAnalysisTab('d7');
            onSelectVarga(7);
          }}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer min-w-[150px] ${
            activeAnalysisTab === 'd7'
              ? 'bg-[#FAF2E4] text-[#5C3A21] shadow-md font-black ring-1 ring-[#B56A00]'
              : 'text-[#E5D2B8] hover:text-white'
          }`}
        >
          <Baby className="w-4 h-4 text-[#B56A00]" />
          <span>{L('D7 सप्तांश (संतान व संतति सुख)', 'D7 Saptamsha (Progeny)', 'D7 સપ્તમાંશ (સંતાન સુખ)')}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveAnalysisTab('d3');
            onSelectVarga(3);
          }}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer min-w-[150px] ${
            activeAnalysisTab === 'd3'
              ? 'bg-[#FAF2E4] text-[#5C3A21] shadow-md font-black ring-1 ring-[#B56A00]'
              : 'text-[#E5D2B8] hover:text-white'
          }`}
        >
          <Shield className="w-4 h-4 text-[#B56A00]" />
          <span>{L('D3 द्रेष्काण (पराक्रम व सहोदर)', 'D3 Drekkana (Courage & Siblings)', 'D3 દ્રેષ્કાણ (પરાક્રમ અને સહોદર)')}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveAnalysisTab('grid')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer min-w-[150px] ${
            activeAnalysisTab === 'grid'
              ? 'bg-[#FAF2E4] text-[#5C3A21] shadow-md font-black ring-1 ring-[#B56A00]'
              : 'text-[#E5D2B8] hover:text-white'
          }`}
        >
          <Award className="w-4 h-4 text-[#B56A00]" />
          <span>{L('षोडशवर्ग वैशेषिकांश महा-तालिका', '16-Varga Master Dignity Grid', 'ષોડશવર્ગ વૈશેષિકાંશ મહા-તાલિકા')}</span>
        </button>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 1. D10 DASHAMSHA (CAREER & PROFESSION)                        */}
      {/* ------------------------------------------------------------- */}
      {activeAnalysisTab === 'd10' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* D10 Chart */}
            <div className="lg:col-span-5 space-y-3">
              <div className="bg-[#FAF2E4] border border-[#8C6239]/40 rounded-xl p-3 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black text-[#5C3A21] flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5 text-[#B56A00]" />
                    <span>{L('दशमांश चक्र (D10 Chart)', 'Dashamsha Chart (D10)', 'દશમાંશ ચક્ર (D10 Chart)')}</span>
                  </span>
                  <span className="text-[10px] font-black bg-[#B56A00] text-[#FAF2E4] px-2 py-0.5 rounded">
                    {L('कर्म व आजीविका सूक्ष्म दर्पण', 'Career & Profession Mirror', 'કર્મ અને આજીવિકા સૂક્ષ્મ દર્પણ')}
                  </span>
                </div>
                <KundaliChart
                  lagnaDegree={lagnaDegree}
                  planets={planets}
                  vargaDivision={10}
                  chartTitle={`${nativeName} — ${L('दशमांश चक्र (D10)', 'Dashamsha Chart (D10)', 'દશમાંશ ચક્ર (D10)')}`}
                />
              </div>

              {/* Quick Dignity Highlights */}
              <div className="bg-[#FAF2E4] border border-[#8C6239]/30 rounded-xl p-3 space-y-2 text-xs">
                <div className="font-bold text-[#5C3A21] flex items-center gap-1.5 border-b border-[#8C6239]/20 pb-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#B56A00]" />
                  <span>{L('दशमांश ग्रह स्थिति सारांश', 'D10 Planetary Summary', 'દશમાંશ ગ્રહ સ્થિતિ સારાંશ')}</span>
                </div>
                <div className="space-y-1.5 text-[#735133]">
                  <p>
                    <strong className="text-[#5C3A21]">{L('दशमेश स्थिति:', '10th Lord Placement:', 'દશમેશ સ્થિતિ:')}</strong>{' '}
                    {d10Analysis.tenthHouseLordPlacement}
                  </p>
                  <p>
                    <strong className="text-[#5C3A21]">{L('लग्न स्वामी:', 'Lagna Lord:', 'લગ્ન સ્વામી:')}</strong>{' '}
                    {d10Analysis.lagnaLordPlacement}
                  </p>
                  <p>
                    <strong className="text-[#5C3A21]">{L('सूर्य (सत्ता कारक):', 'Sun (Authority):', 'સૂર્ય (સત્તા કારક):')}</strong>{' '}
                    {d10Analysis.sunStatus}
                  </p>
                  <p>
                    <strong className="text-[#5C3A21]">{L('शनि (कर्म कारक):', 'Saturn (Karma):', 'શનિ (કર્મ કારક):')}</strong>{' '}
                    {d10Analysis.saturnStatus}
                  </p>
                </div>
              </div>
            </div>

            {/* Career Analysis & Field Suitability */}
            <div className="lg:col-span-7 space-y-3.5">
              {/* Shastric Verdict Card */}
              <div className="bg-[#FAF2E4] border-2 border-[#B56A00]/40 rounded-xl p-4 shadow-xs space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-1">
                  <h4 className="font-bold font-granth text-base text-[#5C3A21] flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-[#B56A00]" />
                    <span>{L('दशमांश पराशरीय फलादेश निष्कर्ष', 'D10 Parashari Prediction Verdict', 'દશમાંશ પરાશરીય ફળાદેશ નિષ્કર્ષ')}</span>
                  </h4>
                  <span className="text-[11px] font-bold text-[#8C6239]">
                    {L('केंद्र ग्रह:', 'Kendra Planets:', 'કેન્દ્ર ગ્રહ:')}{' '}
                    {d10Analysis.kendraPlanets.map((pl) => trPlanet(pl, language)).join(', ') || L('कोई नहीं', 'None', 'કોઈ નહીં')}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[#5C3A21] font-medium leading-relaxed bg-[#F4E8D1]/80 p-3 rounded-lg border border-[#8C6239]/20">
                  {d10Analysis.verdict}
                </p>
              </div>

              {/* Career Field Suitability Matrix */}
              <div className="bg-[#FAF2E4] border border-[#8C6239]/40 rounded-xl p-4 shadow-xs space-y-2.5">
                <div className="flex items-center justify-between border-b border-[#8C6239]/20 pb-2">
                  <h4 className="font-bold text-xs sm:text-sm text-[#5C3A21] flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-[#B56A00]" />
                    <span>{L('करियर क्षेत्र एवं अनुकूलता', 'Career Fields & Suitability Analysis', 'કારકિર્દી ક્ષેત્ર અને અનુકૂળતા')}</span>
                  </h4>
                  <span className="text-[10px] text-[#8C6239] font-semibold">
                    {L('D10 सूक्ष्म ग्रहों पर आधारित', 'Based on D10 Micro Placements', 'D10 સૂક્ષ્મ ગ્રહો પર આધારિત')}
                  </span>
                </div>

                <div className="space-y-2">
                  {d10Analysis.careerFields.map((f, i) => {
                    const isTop = f.isTop ?? /सर्वोत्तम|Excellent|સર્વોત્તમ/i.test(f.suitability);
                    return (
                      <div
                        key={i}
                        className={`p-2.5 rounded-lg border text-xs transition ${
                          isTop
                            ? 'bg-[#FFF9EE] border-[#B56A00] ring-1 ring-[#B56A00]/20'
                            : 'bg-[#F4E8D1]/60 border-[#8C6239]/30'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-[#5C3A21]">{f.title}</span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-black shrink-0 ${
                              isTop
                                ? 'bg-emerald-700 text-white'
                                : 'bg-[#B56A00]/20 text-[#5C3A21]'
                            }`}
                          >
                            {f.suitability}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#735133] mt-1 leading-normal">
                          {f.reason}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Career Acceleration Remedies */}
              <div className="bg-[#FAF2E4] border border-[#8C6239]/40 rounded-xl p-4 shadow-xs space-y-2">
                <div className="font-bold text-xs text-[#5C3A21] flex items-center gap-1.5 border-b border-[#8C6239]/20 pb-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>{L('करियर उन्नति एवं बाधा निवारण वैदिक उपाय', 'Vedic Remedies for Career Growth', 'કારકિર્દી ઉન્નતિ અને વિઘ્ન નિવારણ વૈદિક ઉપાય')}</span>
                </div>
                <ul className="space-y-1.5 text-xs text-[#5C3A21]">
                  {d10Analysis.careerRemedies.map((rem, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-[#B56A00] font-black shrink-0">•</span>
                      <span className="leading-snug">{rem}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. D7 SAPTAMSHA (PROGENY & OFFSPRING BLISS)                   */}
      {/* ------------------------------------------------------------- */}
      {activeAnalysisTab === 'd7' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* D7 Chart */}
            <div className="lg:col-span-5 space-y-3">
              <div className="bg-[#FAF2E4] border border-[#8C6239]/40 rounded-xl p-3 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black text-[#5C3A21] flex items-center gap-1">
                    <Baby className="w-3.5 h-3.5 text-[#B56A00]" />
                    <span>{L('सप्तमांश चक्र (D7 Saptamsha)', 'Saptamsha Chart (D7)', 'સપ્તમાંશ ચક્ર (D7 Saptamsha)')}</span>
                  </span>
                  <span className="text-[10px] font-black bg-[#B56A00] text-[#FAF2E4] px-2 py-0.5 rounded">
                    {L('संतान व संतति सूक्ष्म चक्र', 'Progeny & Lineage Chart', 'સંતાન અને સંતતિ સૂક્ષ્મ ચક્ર')}
                  </span>
                </div>
                <KundaliChart
                  lagnaDegree={lagnaDegree}
                  planets={planets}
                  vargaDivision={7}
                  chartTitle={`${nativeName} — ${L('सप्तमांश चक्र (D7)', 'Saptamsha Chart (D7)', 'સપ્તમાંશ ચક્ર (D7)')}`}
                />
              </div>

              {/* Saptamsha Score Card */}
              <div className="bg-[#FAF2E4] border-2 border-[#B56A00] rounded-xl p-3.5 text-center space-y-2 shadow-xs">
                <div className="text-xs font-bold text-[#8C6239]">
                  {L('संतान सुख सूचकांक (Progeny Bliss Index)', 'Progeny Bliss Index', 'સંતાન સુખ સૂચકાંક (Progeny Bliss Index)')}
                </div>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-2xl font-black font-granth text-[#5C3A21]">
                    {d7Analysis.progenyBlissScore} / 10
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-black ${
                      d7Analysis.progenyBlissScore >= 8
                        ? 'bg-emerald-700 text-white'
                        : d7Analysis.progenyBlissScore >= 6
                        ? 'bg-[#B56A00] text-white'
                        : 'bg-amber-700 text-white'
                    }`}
                  >
                    {d7Analysis.progenyBlissScore >= 8
                      ? L('अति शुभ', 'Highly Auspicious', 'અતિ શુભ')
                      : d7Analysis.progenyBlissScore >= 6
                      ? L('शुभ एवं संतुलित', 'Balanced & Good', 'શુભ અને સંતુલિત')
                      : L('उपाय अपेक्षित', 'Remedies Advised', 'ઉપાય અપેક્ષિત')}
                  </span>
                </div>
                <div className="w-full bg-[#E5D2B8] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#B56A00] h-full rounded-full transition-all duration-300"
                    style={{ width: `${d7Analysis.progenyBlissScore * 10}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Analysis & Guidance */}
            <div className="lg:col-span-7 space-y-3.5">
              {/* Shastric Verdict Card */}
              <div className="bg-[#FAF2E4] border-2 border-[#B56A00]/40 rounded-xl p-4 shadow-xs space-y-2">
                <h4 className="font-bold font-granth text-base text-[#5C3A21] flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-[#B56A00]" />
                  <span>{L('सप्तमांश फलादेश एवं निष्कर्ष', 'D7 Saptamsha Verdict', 'સપ્તમાંશ ફળાદેશ અને નિષ્કર્ષ')}</span>
                </h4>
                <p className="text-xs sm:text-sm text-[#5C3A21] font-medium leading-relaxed bg-[#F4E8D1]/80 p-3 rounded-lg border border-[#8C6239]/20">
                  {d7Analysis.verdict}
                </p>
              </div>

              {/* Key House Analysis */}
              <div className="bg-[#FAF2E4] border border-[#8C6239]/40 rounded-xl p-4 shadow-xs space-y-2.5">
                <h4 className="font-bold text-xs sm:text-sm text-[#5C3A21] flex items-center gap-1.5 border-b border-[#8C6239]/20 pb-2">
                  <BookOpen className="w-4 h-4 text-[#B56A00]" />
                  <span>{L('सप्तमांश भाव एवं कारक विश्लेषण', 'Saptamsha House & Karaka Analysis', 'સપ્તમાંશ ભાવ અને કારક વિશ્લેષણ')}</span>
                </h4>

                <div className="space-y-2 text-xs">
                  <div className="bg-[#F4E8D1]/60 p-2.5 rounded-lg border border-[#8C6239]/20">
                    <strong className="text-[#5C3A21]">{L('पंचम भाव (प्रथम संतान व विद्या):', '5th House (First Child & Intellect):', 'પંચમ ભાવ (પ્રથમ સંતાન અને વિદ્યા):')}</strong>{' '}
                    <span className="text-[#735133]">{d7Analysis.fifthHousePlacement}</span>
                    {d7Analysis.fifthHouseOccupants.length > 0 && (
                      <span className="block text-[#5C3A21] font-bold mt-1">
                        {L('पंचम भाव स्थित ग्रह:', 'Planets in 5th House:', 'પંચમ ભાવ સ્થિત ગ્રહ:')}{' '}
                        {d7Analysis.fifthHouseOccupants.map((pl) => trPlanet(pl, language)).join(', ')}
                      </span>
                    )}
                  </div>

                  <div className="bg-[#F4E8D1]/60 p-2.5 rounded-lg border border-[#8C6239]/20">
                    <strong className="text-[#5C3A21]">{L('गुरु स्थिति (नैसर्गिक संतान कारक):', 'Jupiter Status (Progeny Karaka):', 'ગુરુ સ્થિતિ (નૈસર્ગિક સંતાન કારક):')}</strong>{' '}
                    <span className="text-[#735133]">{d7Analysis.jupiterStatus}</span>
                  </div>

                  <div className="bg-[#F4E8D1]/60 p-2.5 rounded-lg border border-[#8C6239]/20">
                    <strong className="text-[#5C3A21]">{L('सप्तम भाव (द्वितीय संतान व संतति विस्तार):', '7th House (Family Expansion):', 'સપ્તમ ભાવ (સંતતિ વિસ્તાર):')}</strong>{' '}
                    <span className="text-[#735133]">
                      {L('सप्तमेश:', '7th Lord:', 'સપ્તમેશ:')} {trPlanet(d7Analysis.seventhHouseLord, language)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Santana Gopala Mantra & Remedies (Sanskrit mantra preserved) */}
              <div className="bg-[#FAF2E4] border border-[#8C6239]/40 rounded-xl p-4 shadow-xs space-y-2">
                <div className="font-bold text-xs text-[#5C3A21] flex items-center gap-1.5 border-b border-[#8C6239]/20 pb-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>{L('संतान सुख एवं वंश संवर्धन वैदिक उपाय व मंत्र', 'Vedic Progeny Remedies & Mantra', 'સંતાન સુખ અને વંશ સંવર્ધન વૈદિક ઉપાય અને મંત્ર')}</span>
                </div>
                <div className="p-3 bg-[#FFFBF0] border border-[#B56A00]/40 rounded-lg text-xs space-y-1">
                  <div className="font-black text-[#8B1E1E]">
                    {L('॥ संतान गोपाल महामंत्र ॥', '॥ Santana Gopala Mahamantra ॥', '॥ સંતાન ગોપાલ મહામંત્ર ॥')}
                  </div>
                  <div className="font-granth text-sm text-[#5C3A21] font-bold">
                    ॐ देवकीसुत गोविन्द वासुदेव जगत्पते । देहि मे तनयं कृष्ण त्वामहं शरणं गतः ॥
                  </div>
                </div>
                <ul className="space-y-1.5 text-xs text-[#5C3A21] pt-1">
                  {d7Analysis.remedies.map((rem, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-[#B56A00] font-black shrink-0">•</span>
                      <span className="leading-snug">{rem}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 3. D3 DREKKANA (VALOUR & SIBLINGS)                             */}
      {/* ------------------------------------------------------------- */}
      {activeAnalysisTab === 'd3' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* D3 Chart */}
            <div className="lg:col-span-5 space-y-3">
              <div className="bg-[#FAF2E4] border border-[#8C6239]/40 rounded-xl p-3 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black text-[#5C3A21] flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5 text-[#B56A00]" />
                    <span>{L('द्रेष्काण चक्र (D3 Drekkana)', 'Drekkana Chart (D3)', 'દ્રેષ્કાણ ચક્ર (D3 Drekkana)')}</span>
                  </span>
                  <span className="text-[10px] font-black bg-[#B56A00] text-[#FAF2E4] px-2 py-0.5 rounded">
                    {L('पराक्रम व सहोदर सूक्ष्म चक्र', 'Courage & Siblings Chart', 'પરાક્રમ અને સહોદર સૂક્ષ્મ ચક્ર')}
                  </span>
                </div>
                <KundaliChart
                  lagnaDegree={lagnaDegree}
                  planets={planets}
                  vargaDivision={3}
                  chartTitle={`${nativeName} — ${L('द्रेष्काण चक्र (D3)', 'Drekkana Chart (D3)', 'દ્રેષ્કાણ ચક્ર (D3)')}`}
                />
              </div>

              {/* Valor Meter */}
              <div className="bg-[#FAF2E4] border-2 border-[#B56A00] rounded-xl p-3.5 text-center space-y-2 shadow-xs">
                <div className="text-xs font-bold text-[#8C6239]">
                  {L('पराक्रम एवं आत्मबल स्कोर (Courage Score)', 'Courage & Willpower Score', 'પરાક્રમ અને આત્મબળ સ્કોર (Courage Score)')}
                </div>
                <div className="text-2xl font-black font-granth text-[#5C3A21]">
                  {d3Analysis.valourScore} / 10
                </div>
                <div className="w-full bg-[#E5D2B8] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#B56A00] h-full rounded-full transition-all duration-300"
                    style={{ width: `${d3Analysis.valourScore * 10}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Analysis */}
            <div className="lg:col-span-7 space-y-3.5">
              <div className="bg-[#FAF2E4] border-2 border-[#B56A00]/40 rounded-xl p-4 shadow-xs space-y-2">
                <h4 className="font-bold font-granth text-base text-[#5C3A21] flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-[#B56A00]" />
                  <span>{L('द्रेष्काण फलादेश निष्कर्ष', 'D3 Drekkana Verdict', 'દ્રેષ્કાણ ફળાદેશ નિષ્કર્ષ')}</span>
                </h4>
                <p className="text-xs sm:text-sm text-[#5C3A21] font-medium leading-relaxed bg-[#F4E8D1]/80 p-3 rounded-lg border border-[#8C6239]/20">
                  {d3Analysis.verdict}
                </p>
              </div>

              <div className="bg-[#FAF2E4] border border-[#8C6239]/40 rounded-xl p-4 shadow-xs space-y-2.5">
                <h4 className="font-bold text-xs sm:text-sm text-[#5C3A21] flex items-center gap-1.5 border-b border-[#8C6239]/20 pb-2">
                  <BookOpen className="w-4 h-4 text-[#B56A00]" />
                  <span>{L('तृतीय भाव एवं भ्रातृ कारक मंगल', '3rd House & Sibling Karaka Mars', 'તૃતીય ભાવ અને ભ્રાતૃ કારક મંગળ')}</span>
                </h4>
                <div className="space-y-2 text-xs text-[#735133]">
                  <p>
                    <strong className="text-[#5C3A21]">{L('तृतीयेश स्थिति:', '3rd Lord Placement:', 'તૃતીયેશ સ્થિતિ:')}</strong> {d3Analysis.thirdHousePlacement}
                  </p>
                  <p>
                    <strong className="text-[#5C3A21]">{L('मंगल (भ्रातृ कारक):', 'Mars (Courage & Siblings):', 'મંગળ (ભ્રાતૃ કારક):')}</strong> {d3Analysis.marsStatus}
                  </p>
                  <p>
                    <strong className="text-[#5C3A21]">{L('एकादशेश (ज्येष्ठ भ्राता/भगिनी):', '11th Lord (Elder Siblings):', 'એકાદશેશ (જ્યેષ્ઠ ભાઈ/બહેન):')}</strong>{' '}
                    {trPlanet(d3Analysis.eleventhHouseLord, language)}
                  </p>
                </div>
              </div>

              <div className="bg-[#FAF2E4] border border-[#8C6239]/40 rounded-xl p-4 shadow-xs space-y-2">
                <div className="font-bold text-xs text-[#5C3A21] flex items-center gap-1.5 border-b border-[#8C6239]/20 pb-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>{L('पराक्रम वृद्धि एवं सहोदर सौहार्द उपाय', 'Remedies for Valor & Sibling Harmony', 'પરાક્રમ વૃદ્ધિ અને સહોદર સૌહાર્દ ઉપાય')}</span>
                </div>
                <ul className="space-y-1.5 text-xs text-[#5C3A21]">
                  {d3Analysis.remedies.map((rem, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-[#B56A00] font-black shrink-0">•</span>
                      <span className="leading-snug">{rem}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 4. MASTER 16-VARGA VAISHESHIKAMSHA GRID TABLE                 */}
      {/* ------------------------------------------------------------- */}
      {activeAnalysisTab === 'grid' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="bg-[#FAF2E4] border border-[#8C6239]/40 rounded-xl p-4 shadow-xs space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#8C6239]/20 pb-3">
              <div>
                <h3 className="font-bold font-granth text-base sm:text-lg text-[#5C3A21] flex items-center gap-2">
                  <Award className="w-5 h-5 text-[#B56A00]" />
                  <span>{L('षोडशवर्ग वैशेषिकांश महा-तालिका (16-Varga Master Dignity Grid)', '16-Varga Vaisheshikamsha Master Dignity Grid', 'ષોડશવર્ગ વૈશેષિકાંશ મહા-તાલિકા (16-Varga Grid)')}</span>
                </h3>
                <p className="text-xs text-[#735133] mt-0.5">
                  {L(
                    'महर्षि पराशर अनुसार समस्त 16 मुख्य वर्गों में ग्रहों की राशि, उच्च/स्वराशि गणना एवं वैशेषिकांश बल',
                    'Sign placements across all 16 Parashari Shodashvarga divisions, own/exaltation count, and Vaisheshikamsha strength',
                    'મહર્ષિ પરાશર અનુસાર સમસ્ત ૧૬ મુખ્ય વર્ગોમાં ગ્રહોની રાશિ, ઉચ્ચ/સ્વરાશિ ગણતરી અને વૈશેષિકાંશ બળ'
                  )}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] px-2 py-1 bg-emerald-100 text-emerald-800 rounded font-bold border border-emerald-300">
                  {L('वर्गोत्तम = D1 व D9 समान', 'Vargottama = Same Sign in D1 & D9', 'વર્ગોત્તમ = D1 અને D9 સમાન')}
                </span>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead>
                  <tr className="bg-[#5C3A21] text-[#FAF2E4]">
                    <th className="py-2 px-3 font-bold sticky left-0 bg-[#5C3A21] z-10">
                      {L('ग्रह', 'Planet', 'ગ્રહ')}
                    </th>
                    {SHODASH_DIVISIONS.map((div) => {
                      const isD9 = div === 9;
                      const isD10 = div === 10;
                      const isD60 = div === 60;
                      return (
                        <th
                          key={div}
                          className={`py-2 px-2.5 font-bold text-center ${
                            isD9 ? 'bg-[#8B1E1E]' : isD10 ? 'bg-[#B56A00]' : isD60 ? 'bg-[#462B17]' : ''
                          }`}
                        >
                          {vargaColumnHeaders[div] || `D${div}`}
                        </th>
                      );
                    })}
                    <th className="py-2 px-3 font-bold text-center">{L('उच्च/स्व संख्या', 'Own/Exalt Count', 'ઉચ્ચ/સ્વ સંખ્યા')}</th>
                    <th className="py-2 px-3 font-bold text-center">{L('वैशेषिकांश उपाधि', 'Vaisheshikamsha Title', 'વૈશેષિકાંશ ઉપાધિ')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#8C6239]/20 bg-white">
                  {vaisheshikamshaList.map((row, idx) => {
                    const pName = trPlanet(row.planet, language);
                    return (
                      <tr
                        key={row.planet}
                        className={`hover:bg-[#FAF2E4]/80 transition ${
                          idx % 2 === 0 ? 'bg-white' : 'bg-[#FAF2E4]/40'
                        }`}
                      >
                        <td className="py-2 px-3 font-bold text-[#5C3A21] sticky left-0 bg-inherit z-10 flex items-center gap-1.5">
                          <span>{pName}</span>
                          {row.isD9Vargottama && (
                            <span
                              className="px-1.5 py-0.2 rounded text-[9px] font-black bg-emerald-600 text-white"
                              title={L('वर्गोत्तम (D1 और D9 में एक ही राशि)', 'Vargottama (Same sign in D1 and D9)', 'વર્ગોત્તમ (D1 અને D9 માં સમાન રાશિ)')}
                            >
                              {L('वर्गोत्तम', 'Vargottama', 'વર્ગોત્તમ')}
                            </span>
                          )}
                        </td>
                        {SHODASH_DIVISIONS.map((div) => {
                          const rashi = row.vargaRashis[div];
                          const rashiLoc = trRashi(rashi, language);
                          const isD9 = div === 9;
                          const isD10 = div === 10;
                          return (
                            <td
                              key={div}
                              onClick={() => onSelectVarga(div)}
                              className={`py-2 px-2.5 text-center text-[11px] font-semibold cursor-pointer hover:bg-[#B56A00]/20 transition ${
                                isD9
                                  ? 'bg-amber-50 font-bold text-[#8B1E1E]'
                                  : isD10
                                  ? 'bg-orange-50 font-bold text-[#B56A00]'
                                  : 'text-[#5C3A21]'
                              }`}
                              title={L(
                                `D${div} में ${pName} ${rashiLoc} राशि में है (क्लिक कर D${div} देखें)`,
                                `${pName} is in ${rashiLoc} in D${div} (Click to view D${div})`,
                                `D${div} માં ${pName} ${rashiLoc} રાશિમાં છે (D${div} જોવા ક્લિક કરો)`
                              )}
                            >
                              {rashiLoc}
                            </td>
                          );
                        })}
                        <td className="py-2 px-3 text-center font-black text-[#5C3A21]">
                          <span className="px-2 py-0.5 bg-[#FAF2E4] border border-[#8C6239]/30 rounded">
                            {row.ownExaltedCount}/16
                          </span>
                        </td>
                        <td className="py-2 px-3 text-center font-bold text-xs">
                          <span
                            className={`px-2.5 py-0.5 rounded-md font-bold ${
                              row.ownExaltedCount >= 4
                                ? 'bg-[#B56A00] text-white shadow-2xs'
                                : row.ownExaltedCount >= 2
                                ? 'bg-[#FAF2E4] text-[#8B1E1E] border border-[#8B1E1E]/30'
                                : 'text-[#8C6239]'
                            }`}
                          >
                            {row.vaisheshikamshaTitle}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Parashara Vaisheshikamsha Legend */}
            <div className="bg-[#F4E8D1] border border-[#8C6239]/30 rounded-xl p-3 text-xs text-[#735133] space-y-1.5">
              <div className="font-bold text-[#5C3A21] flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-[#B56A00]" />
                <span>{L('महर्षि पराशर वैशेषिकांश सूत्र (16 वर्गों में शुभ राशि स्थिति का फल):', 'Maharishi Parashara Vaisheshikamsha Formula (Auspicious Count in 16 Vargas):', 'મહર્ષિ પરાશર વૈશેષિકાંશ સૂત્ર (૧૬ વર્ગોમાં શુભ રાશિ સ્થિતિનું ફળ):')}</span>
              </div>
              <p className="leading-relaxed">
                {language === 'en' ? (
                  <>
                    2 vargas = <strong>Parijata</strong>, 3 = <strong>Uttama</strong>, 4 = <strong>Gopura</strong>, 5 = <strong>Simhasana</strong>, 6 = <strong>Paravata</strong>, 7 = <strong>Devaloka</strong>, 8 = <strong>Brahmaloka</strong>, 9+ = <strong>Sridhama / Shakra</strong>. Planets attaining higher Vaisheshikamsha dignity bestow immense Rajayoga and prosperity during their Mahadasha.
                  </>
                ) : language === 'gu' ? (
                  <>
                    ૨ વર્ગોમાં શુભ = <strong>પારિજાત</strong>, ૩ વર્ગોમાં = <strong>ઉત્તમ</strong>, ૪ વર્ગોમાં = <strong>ગોપુર</strong>, ૫ વર્ગોમાં = <strong>સિંહાસન</strong>, ૬ વર્ગોમાં = <strong>પારાવત</strong>, ૭ વર્ગોમાં = <strong>દેવલોક</strong>, ૮ વર્ગોમાં = <strong>બ્રહ્મલોક</strong>, ૯ કે તેથી વધુ વર્ગોમાં = <strong>શ્રીધામ / શક્રવાહન</strong>. વૈશેષિકાંશ પ્રાપ્ત ગ્રહ પોતાની મહાદશામાં અપાર રાજયોગ અને સમૃદ્ધિ આપે છે.
                  </>
                ) : (
                  <>
                    २ वर्गों में शुभ = <strong>पारिजात</strong>, ३ वर्गों में = <strong>उत्तम</strong>, ४ वर्गों में = <strong>गोपुर</strong>, ५ वर्गों में = <strong>सिंहासन</strong>, ६ वर्गों में = <strong>पारावत</strong>, ७ वर्गों में = <strong>देवलोक</strong>, ८ वर्गों में = <strong>ब्रह्मलोक</strong>, ९ या अधिक वर्गों में = <strong>श्रीधाम / शक्रवाहन</strong>। वैशेषिकांश प्राप्त ग्रह अपनी महादशा में अपार राजयोग व समृद्धि प्रदान करते हैं।
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
