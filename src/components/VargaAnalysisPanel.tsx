import React, { useState, useMemo } from 'react';
import { PlanetPosition } from '../types';
import { KundaliChart } from './KundaliChart';
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
  // Focus Mode: 'd10' (Career) | 'd7' (Progeny) | 'd3' (Valor) | 'grid' (16-Varga Vaisheshikamsha) | 'custom' (Other)
  const [activeAnalysisTab, setActiveAnalysisTab] = useState<'d10' | 'd7' | 'd3' | 'grid'>(() => {
    if (selectedVarga === 7) return 'd7';
    if (selectedVarga === 3) return 'd3';
    return 'd10';
  });

  const d10Analysis = useMemo(
    () => analyzeD10Dashamsha(lagnaDegree, planets),
    [lagnaDegree, planets]
  );
  const d7Analysis = useMemo(
    () => analyzeD7Saptamsha(lagnaDegree, planets),
    [lagnaDegree, planets]
  );
  const d3Analysis = useMemo(
    () => analyzeD3Drekkana(lagnaDegree, planets),
    [lagnaDegree, planets]
  );
  const vaisheshikamshaList = useMemo(
    () => calculateVaisheshikamshaSummary(lagnaDegree, planets),
    [lagnaDegree, planets]
  );

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
          <span>D10 दशमांश (करियर व आजीविका)</span>
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
          <span>D7 सप्तांश (संतान व संतति सुख)</span>
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
          <span>D3 द्रेष्काण (पराक्रम व सहोदर)</span>
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
          <span>षोडशवर्ग वैशेषिकांश महा-तालिका</span>
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
                    <span>दशमांश चक्र (D10 Chart)</span>
                  </span>
                  <span className="text-[10px] font-black bg-[#B56A00] text-[#FAF2E4] px-2 py-0.5 rounded">
                    कर्म व आजीविका सूक्ष्म दर्पण
                  </span>
                </div>
                <KundaliChart
                  lagnaDegree={lagnaDegree}
                  planets={planets}
                  vargaDivision={10}
                  chartTitle={`${nativeName} — दशमांश चक्र (D10)`}
                />
              </div>

              {/* Quick Dignity Highlights */}
              <div className="bg-[#FAF2E4] border border-[#8C6239]/30 rounded-xl p-3 space-y-2 text-xs">
                <div className="font-bold text-[#5C3A21] flex items-center gap-1.5 border-b border-[#8C6239]/20 pb-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#B56A00]" />
                  <span>दशमांश ग्रह स्थिति सारांश</span>
                </div>
                <div className="space-y-1.5 text-[#735133]">
                  <p>
                    <strong className="text-[#5C3A21]">दशमेश स्थिति:</strong> {d10Analysis.tenthHouseLordPlacement}
                  </p>
                  <p>
                    <strong className="text-[#5C3A21]">लग्न स्वामी:</strong> {d10Analysis.lagnaLordPlacement}
                  </p>
                  <p>
                    <strong className="text-[#5C3A21]">सूर्य (सत्ता कारक):</strong> {d10Analysis.sunStatus}
                  </p>
                  <p>
                    <strong className="text-[#5C3A21]">शनि (कर्म कारक):</strong> {d10Analysis.saturnStatus}
                  </p>
                </div>
              </div>
            </div>

            {/* Career Analysis & Field Suitability */}
            <div className="lg:col-span-7 space-y-3.5">
              {/* Shastric Verdict Card */}
              <div className="bg-[#FAF2E4] border-2 border-[#B56A00]/40 rounded-xl p-4 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold font-granth text-base text-[#5C3A21] flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-[#B56A00]" />
                    <span>दशमांश पराशरीय फलादेश निष्कर्ष</span>
                  </h4>
                  <span className="text-[11px] font-bold text-[#8C6239]">
                    केंद्र ग्रह: {d10Analysis.kendraPlanets.join(', ') || 'कोई नहीं'}
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
                    <span>करियर क्षेत्र एवं अनुकूलता (Suitability Analysis)</span>
                  </h4>
                  <span className="text-[10px] text-[#8C6239] font-semibold">D10 सूक्ष्म ग्रहों पर आधारित</span>
                </div>

                <div className="space-y-2">
                  {d10Analysis.careerFields.map((f, i) => {
                    const isTop = f.suitability.includes('सर्वोत्तम');
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
                  <span>करियर उन्नति एवं बाधा निवारण वैदिक उपाय</span>
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
                    <span>सप्तमांश चक्र (D7 Saptamsha)</span>
                  </span>
                  <span className="text-[10px] font-black bg-[#B56A00] text-[#FAF2E4] px-2 py-0.5 rounded">
                    संतान व संतति सूक्ष्म चक्र
                  </span>
                </div>
                <KundaliChart
                  lagnaDegree={lagnaDegree}
                  planets={planets}
                  vargaDivision={7}
                  chartTitle={`${nativeName} — सप्तमांश चक्र (D7)`}
                />
              </div>

              {/* Saptamsha Score Card */}
              <div className="bg-[#FAF2E4] border-2 border-[#B56A00] rounded-xl p-3.5 text-center space-y-2 shadow-xs">
                <div className="text-xs font-bold text-[#8C6239]">संतान सुख सूचकांक (Progeny Bliss Index)</div>
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
                    {d7Analysis.progenyBlissScore >= 8 ? 'अति शुभ' : d7Analysis.progenyBlissScore >= 6 ? 'शुभ एवं संतुलित' : 'उपाय अपेक्षित'}
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
                  <span>सप्तमांश फलादेश एवं निष्कर्ष</span>
                </h4>
                <p className="text-xs sm:text-sm text-[#5C3A21] font-medium leading-relaxed bg-[#F4E8D1]/80 p-3 rounded-lg border border-[#8C6239]/20">
                  {d7Analysis.verdict}
                </p>
              </div>

              {/* Key House Analysis */}
              <div className="bg-[#FAF2E4] border border-[#8C6239]/40 rounded-xl p-4 shadow-xs space-y-2.5">
                <h4 className="font-bold text-xs sm:text-sm text-[#5C3A21] flex items-center gap-1.5 border-b border-[#8C6239]/20 pb-2">
                  <BookOpen className="w-4 h-4 text-[#B56A00]" />
                  <span>सप्तमांश भाव एवं कारक विश्लेषण</span>
                </h4>

                <div className="space-y-2 text-xs">
                  <div className="bg-[#F4E8D1]/60 p-2.5 rounded-lg border border-[#8C6239]/20">
                    <strong className="text-[#5C3A21]">पंचम भाव (प्रथम संतान व विद्या):</strong>{' '}
                    <span className="text-[#735133]">{d7Analysis.fifthHousePlacement}</span>
                    {d7Analysis.fifthHouseOccupants.length > 0 && (
                      <span className="block text-[#5C3A21] font-bold mt-1">
                        पंचम भाव स्थित ग्रह: {d7Analysis.fifthHouseOccupants.join(', ')}
                      </span>
                    )}
                  </div>

                  <div className="bg-[#F4E8D1]/60 p-2.5 rounded-lg border border-[#8C6239]/20">
                    <strong className="text-[#5C3A21]">गुरु स्थिति (नैसर्गिक संतान कारक):</strong>{' '}
                    <span className="text-[#735133]">{d7Analysis.jupiterStatus}</span>
                  </div>

                  <div className="bg-[#F4E8D1]/60 p-2.5 rounded-lg border border-[#8C6239]/20">
                    <strong className="text-[#5C3A21]">सप्तम भाव (द्वितीय संतान व संतति विस्तार):</strong>{' '}
                    <span className="text-[#735133]">सप्तमेश: {d7Analysis.seventhHouseLord}</span>
                  </div>
                </div>
              </div>

              {/* Santana Gopala Mantra & Remedies */}
              <div className="bg-[#FAF2E4] border border-[#8C6239]/40 rounded-xl p-4 shadow-xs space-y-2">
                <div className="font-bold text-xs text-[#5C3A21] flex items-center gap-1.5 border-b border-[#8C6239]/20 pb-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>संतान सुख एवं वंश संवर्धन वैदिक उपाय व मंत्र</span>
                </div>
                <div className="p-3 bg-[#FFFBF0] border border-[#B56A00]/40 rounded-lg text-xs space-y-1">
                  <div className="font-black text-[#8B1E1E]">॥ संतान गोपाल महामंत्र ॥</div>
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
                    <span>द्रेष्काण चक्र (D3 Drekkana)</span>
                  </span>
                  <span className="text-[10px] font-black bg-[#B56A00] text-[#FAF2E4] px-2 py-0.5 rounded">
                    पराक्रम व सहोदर सूक्ष्म चक्र
                  </span>
                </div>
                <KundaliChart
                  lagnaDegree={lagnaDegree}
                  planets={planets}
                  vargaDivision={3}
                  chartTitle={`${nativeName} — द्रेष्काण चक्र (D3)`}
                />
              </div>

              {/* Valor Meter */}
              <div className="bg-[#FAF2E4] border-2 border-[#B56A00] rounded-xl p-3.5 text-center space-y-2 shadow-xs">
                <div className="text-xs font-bold text-[#8C6239]">पराक्रम एवं आत्मबल स्कोर (Courage Score)</div>
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
                  <span>द्रेष्काण फलादेश निष्कर्ष</span>
                </h4>
                <p className="text-xs sm:text-sm text-[#5C3A21] font-medium leading-relaxed bg-[#F4E8D1]/80 p-3 rounded-lg border border-[#8C6239]/20">
                  {d3Analysis.verdict}
                </p>
              </div>

              <div className="bg-[#FAF2E4] border border-[#8C6239]/40 rounded-xl p-4 shadow-xs space-y-2.5">
                <h4 className="font-bold text-xs sm:text-sm text-[#5C3A21] flex items-center gap-1.5 border-b border-[#8C6239]/20 pb-2">
                  <BookOpen className="w-4 h-4 text-[#B56A00]" />
                  <span>तृतीय भाव एवं भ्रातृ कारक मंगल</span>
                </h4>
                <div className="space-y-2 text-xs text-[#735133]">
                  <p>
                    <strong className="text-[#5C3A21]">तृतीयेश स्थिति:</strong> {d3Analysis.thirdHousePlacement}
                  </p>
                  <p>
                    <strong className="text-[#5C3A21]">मंगल (भ्रातृ कारक):</strong> {d3Analysis.marsStatus}
                  </p>
                  <p>
                    <strong className="text-[#5C3A21]">एकादशेश (ज्येष्ठ भ्राता/भगिनी):</strong> {d3Analysis.eleventhHouseLord}
                  </p>
                </div>
              </div>

              <div className="bg-[#FAF2E4] border border-[#8C6239]/40 rounded-xl p-4 shadow-xs space-y-2">
                <div className="font-bold text-xs text-[#5C3A21] flex items-center gap-1.5 border-b border-[#8C6239]/20 pb-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>पराक्रम वृद्धि एवं सहोदर सौहार्द उपाय</span>
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
                  <span>षोडशवर्ग वैशेषिकांश महा-तालिका (16-Varga Master Dignity Grid)</span>
                </h3>
                <p className="text-xs text-[#735133] mt-0.5">
                  महर्षि पराशर अनुसार समस्त 16 मुख्य वर्गों में ग्रहों की राशि, उच्च/स्वराशि गणना एवं वैशेषिकांश बल
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] px-2 py-1 bg-emerald-100 text-emerald-800 rounded font-bold border border-emerald-300">
                  वर्गोत्तम = D1 व D9 समान
                </span>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead>
                  <tr className="bg-[#5C3A21] text-[#FAF2E4]">
                    <th className="py-2 px-3 font-bold sticky left-0 bg-[#5C3A21] z-10">ग्रह</th>
                    <th className="py-2 px-2.5 font-bold text-center">D1 लग्न</th>
                    <th className="py-2 px-2.5 font-bold text-center">D2 होरा</th>
                    <th className="py-2 px-2.5 font-bold text-center">D3 द्रेष्काण</th>
                    <th className="py-2 px-2.5 font-bold text-center">D4 चतुर्थांश</th>
                    <th className="py-2 px-2.5 font-bold text-center">D7 सप्तांश</th>
                    <th className="py-2 px-2.5 font-bold text-center bg-[#8B1E1E]">D9 नवमांश</th>
                    <th className="py-2 px-2.5 font-bold text-center bg-[#B56A00]">D10 दशमांश</th>
                    <th className="py-2 px-2.5 font-bold text-center">D12 द्वादशांश</th>
                    <th className="py-2 px-2.5 font-bold text-center">D16 षोडशांश</th>
                    <th className="py-2 px-2.5 font-bold text-center">D20 विंशांश</th>
                    <th className="py-2 px-2.5 font-bold text-center">D24 चतुर्विंशांश</th>
                    <th className="py-2 px-2.5 font-bold text-center">D27 भ Sapta</th>
                    <th className="py-2 px-2.5 font-bold text-center">D30 त्रिंशांश</th>
                    <th className="py-2 px-2.5 font-bold text-center">D40 खवेदांश</th>
                    <th className="py-2 px-2.5 font-bold text-center">D45 अक्षवेदांश</th>
                    <th className="py-2 px-2.5 font-bold text-center bg-[#462B17]">D60 षष्ट्यंश</th>
                    <th className="py-2 px-3 font-bold text-center">उच्च/स्व संख्या</th>
                    <th className="py-2 px-3 font-bold text-center">वैशेषिकांश उपाधि</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#8C6239]/20 bg-white">
                  {vaisheshikamshaList.map((row, idx) => (
                    <tr
                      key={row.planet}
                      className={`hover:bg-[#FAF2E4]/80 transition ${
                        idx % 2 === 0 ? 'bg-white' : 'bg-[#FAF2E4]/40'
                      }`}
                    >
                      <td className="py-2 px-3 font-bold text-[#5C3A21] sticky left-0 bg-inherit z-10 flex items-center gap-1.5">
                        <span>{row.planet}</span>
                        {row.isD9Vargottama && (
                          <span
                            className="px-1.5 py-0.2 rounded text-[9px] font-black bg-emerald-600 text-white"
                            title="वर्गोत्तम (D1 और D9 में एक ही राशि)"
                          >
                            वर्गोत्तम
                          </span>
                        )}
                      </td>
                      {SHODASH_DIVISIONS.map((div) => {
                        const rashi = row.vargaRashis[div];
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
                            title={`D${div} में ${row.planet} ${rashi} राशि में है (क्लिक कर D${div} देखें)`}
                          >
                            {rashi}
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
                  ))}
                </tbody>
              </table>
            </div>

            {/* Parashara Vaisheshikamsha Legend */}
            <div className="bg-[#F4E8D1] border border-[#8C6239]/30 rounded-xl p-3 text-xs text-[#735133] space-y-1.5">
              <div className="font-bold text-[#5C3A21] flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-[#B56A00]" />
                <span>महर्षि पराशर वैशेषिकांश सूत्र (16 वर्गों में शुभ राशि स्थिति का फल):</span>
              </div>
              <p className="leading-relaxed">
                २ वर्गों में शुभ = <strong>पारिजात</strong>, ३ वर्गों में = <strong>उत्तम</strong>, ४ वर्गों में = <strong>गोपुर</strong>, ५ वर्गों में = <strong>सिंहासन</strong>, ६ वर्गों में = <strong>पारावत</strong>, ७ वर्गों में = <strong>देवलोक</strong>, ८ वर्गों में = <strong>ब्रह्मलोक</strong>, ९ या अधिक वर्गों में = <strong>श्रीधाम / शक्रवाहन</strong>। वैशेषिकांश प्राप्त ग्रह अपनी महादशा में अपार राजयोग व समृद्धि प्रदान करते हैं।
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
