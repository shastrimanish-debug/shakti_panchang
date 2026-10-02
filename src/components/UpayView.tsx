import React, { useState, useMemo } from 'react';
import {
  PLANETS_UPAY_DATA,
  MAJOR_DOSHAS_UPAY,
  MIRACLE_CHAMTKARI_UPAY,
  PlanetUpayDetail,
  DoshaUpay,
  MiracleProblemUpay
} from '../data/upayData';
import { KundaliData, PlanetPosition } from '../types';
import {
  Sparkles,
  ShieldAlert,
  Flame,
  Award,
  Share2,
  Copy,
  Check,
  CheckCircle2,
  AlertTriangle,
  Heart,
  Briefcase,
  HelpCircle,
  Compass,
  Sun,
  Moon
} from 'lucide-react';
import { openWhatsAppShare } from '../services/umaConsultationPdf';

interface UpayViewProps {
  activeKundali: KundaliData | null;
  onOpenKundaliTab?: () => void;
  onOpenUmaWithQuery?: (query: string) => void;
}

export const UpayView: React.FC<UpayViewProps> = ({
  activeKundali,
  onOpenKundaliTab,
  onOpenUmaWithQuery
}) => {
  const [activeTab, setActiveTab] = useState<'kundali_based' | 'all_planets' | 'doshas' | 'miracle'>('kundali_based');
  const [selectedPlanetName, setSelectedPlanetName] = useState<string>('सूर्य');
  const [selectedDoshaId, setSelectedDoshaId] = useState<string>('manglik');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Analyze active kundali planets to detect weak / afflicted planets
  const afflictedPlanetsAnalysis = useMemo(() => {
    if (!activeKundali || !activeKundali.planets) return [];

    const results: {
      name: string;
      reason: string;
      severity: 'high' | 'medium' | 'normal';
      house: number;
      sign: string;
    }[] = [];

    // Check Debilitation (नीच राशि)
    const debilitationMap: Record<string, string> = {
      'सूर्य': 'तुला',
      'चंद्र': 'वृश्चिक',
      'मंगल': 'कर्क',
      'बुध': 'मीन',
      'गुरु': 'मकर',
      'शुक्र': 'कन्या',
      'शनि': 'मेष',
    };

    activeKundali.planets.forEach((p) => {
      const pName = p.planet;
      const debSign = debilitationMap[pName];
      if (debSign && p.rashi === debSign) {
        results.push({
          name: pName,
          reason: `${pName} देव आपकी कुण्डली में ${p.rashi} राशि में स्थित होने से 'नीच' अवस्था में हैं, जिससे इस ग्रह के शुभ फलों में कमी आती है।`,
          severity: 'high',
          house: p.house,
          sign: p.rashi,
        });
      } else if (p.house === 6 || p.house === 8 || p.house === 12) {
        if (!['राहु', 'केतु'].includes(pName)) {
          results.push({
            name: pName,
            reason: `${pName} देव त्रिक भाव (${p.house}वें भाव) में स्थित हैं, अतः इनके वैदिक उपाय आवश्यक हैं।`,
            severity: 'medium',
            house: p.house,
            sign: p.rashi,
          });
        }
      }
    });

    return results;
  }, [activeKundali]);

  const currentPlanetDetail = PLANETS_UPAY_DATA[selectedPlanetName] || PLANETS_UPAY_DATA['सूर्य'];
  const currentDosha = MAJOR_DOSHAS_UPAY.find((d) => d.id === selectedDoshaId) || MAJOR_DOSHAS_UPAY[0];

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleShare = (title: string, summary: string) => {
    const shareText = `🔮 *वैदिक व चमत्कारी उपाय - ${title}* 🔮\n\n${summary}\n\nसनातन शक्ति पंचांग से साभार।`;
    openWhatsAppShare(shareText);
  };

  return (
    <div className="w-full space-y-4">
      {/* Top Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-[#5C3A21] via-[#8C6239] to-[#5C3A21] text-[#FAF2E4] shadow-md border border-[#FFD88A]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#FAF2E4]/10 border border-[#FFD88A]/40 flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6 text-[#FFD88A]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold font-granth text-[#FFD88A]">
                ग्रह शांति, लाल किताब व चमत्कारी उपाय
              </h2>
              <span className="text-[10px] bg-[#B56A00] text-white px-2 py-0.5 rounded-full font-bold">
                व्यक्तिगत ज्योतिषीय परामर्श
              </span>
            </div>
            <p className="text-xs text-[#FAF2E4]/80 mt-0.5">
              कुंडली के कमजोर ग्रहों के उपाय, वैदिक महामंत्र, दान, रत्न एवं तात्कालिक कष्ट निवारण टोटके
            </p>
          </div>
        </div>
      </div>

      {/* Main Tab Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-[#8C6239]/20 scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab('kundali_based')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'kundali_based'
              ? 'bg-[#5C3A21] text-[#FAF2E4] shadow-xs'
              : 'bg-[#F4E8D1] text-[#5C3A21] hover:bg-[#EADBCC]'
          }`}
        >
          <Award className="w-3.5 h-3.5 text-[#FFD88A]" />
          <span>मेरी कुंडली अनुसार उपाय</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('all_planets')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'all_planets'
              ? 'bg-[#5C3A21] text-[#FAF2E4] shadow-xs'
              : 'bg-[#F4E8D1] text-[#5C3A21] hover:bg-[#EADBCC]'
          }`}
        >
          <Sun className="w-3.5 h-3.5 text-[#FFD88A]" />
          <span>९ नवग्रह सम्पूर्ण उपाय</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('doshas')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'doshas'
              ? 'bg-[#5C3A21] text-[#FAF2E4] shadow-xs'
              : 'bg-[#F4E8D1] text-[#5C3A21] hover:bg-[#EADBCC]'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5 text-rose-300" />
          <span>दोष निवारण (मांगलिक/कालसर्प)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('miracle')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'miracle'
              ? 'bg-[#B56A00] text-white shadow-xs'
              : 'bg-[#F4E8D1] text-[#5C3A21] hover:bg-[#EADBCC]'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-200" />
          <span>चमत्कारी टोटके</span>
        </button>
      </div>

      {/* 1. KUNDALI-BASED TAILORED REMEDIES */}
      {activeTab === 'kundali_based' && (
        <div className="space-y-4">
          {!activeKundali ? (
            <div className="p-5 rounded-2xl bg-[#FAF2E4] border border-[#8C6239]/25 text-center space-y-3 shadow-xs">
              <div className="w-12 h-12 mx-auto rounded-full bg-[#B56A00]/15 flex items-center justify-center text-[#B56A00]">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold font-granth text-[#5C3A21]">
                अपनी जन्म कुंडली लोड करें
              </h3>
              <p className="text-xs text-[#735133] max-w-md mx-auto leading-relaxed">
                आपकी जन्म पत्रिका में कौन सा ग्रह नीच, अस्त या पीड़ित है — इसका सटीक विश्लेषण देख उस ग्रह के विशेष वैदिक व लाल किताब उपाय जानने के लिए अपनी कुंडली बनाएं।
              </p>
              {onOpenKundaliTab && (
                <button
                  type="button"
                  onClick={onOpenKundaliTab}
                  className="px-5 py-2 bg-[#5C3A21] hover:bg-[#432A16] text-[#FAF2E4] text-xs font-bold rounded-xl transition cursor-pointer shadow-xs inline-flex items-center gap-1.5"
                >
                  <span>कुंडली टैब पर जाएं व विवरण भरें</span>
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {/* Profile Bar */}
              <div className="p-3 bg-[#FAF2E4] rounded-xl border border-[#8C6239]/20 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[#8C6239] font-bold">जातक: </span>
                  <strong className="text-[#5C3A21] font-granth text-sm">{activeKundali.name}</strong>
                  <span className="ml-2 text-[#735133]">
                    (लग्न: {activeKundali.lagnaRashi}, चंद्र राशि: {activeKundali.moonRashi})
                  </span>
                </div>
                {onOpenUmaWithQuery && (
                  <button
                    type="button"
                    onClick={() =>
                      onOpenUmaWithQuery(
                        `मेरी जन्म कुंडली (${activeKundali.name}, लग्न ${activeKundali.lagnaRashi}) के अनुसार मुझे कौन सा ग्रह सबसे अधिक पीड़ित कर रहा है और उसके क्या अचूक उपाय हैं?`
                      )
                    }
                    className="px-3 py-1 bg-gradient-to-r from-[#B56A00] to-[#8C6239] text-white rounded-lg font-bold text-[11px] flex items-center gap-1 shadow-xs cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3 text-amber-200" />
                    <span>उमा से परामर्श लें</span>
                  </button>
                )}
              </div>

              {/* Afflicted list */}
              {afflictedPlanetsAnalysis.length > 0 ? (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-rose-900 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-700" />
                    <span>कुंडली में विशेष ध्यान देने योग्य ग्रह स्थितियां:</span>
                  </h4>

                  {afflictedPlanetsAnalysis.map((item, idx) => {
                    const detail = PLANETS_UPAY_DATA[item.name];
                    return (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl bg-white border border-[#8C6239]/20 space-y-3 shadow-2xs"
                      >
                        <div className="flex items-center justify-between pb-2 border-b border-[#8C6239]/15">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-900 font-bold text-xs">
                              {item.name} ग्रह
                            </span>
                            <span className="text-xs text-[#735133]">
                              भाव: {item.house} • राशि: {item.sign}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedPlanetName(item.name);
                              setActiveTab('all_planets');
                            }}
                            className="text-[11px] text-[#B56A00] font-bold hover:underline"
                          >
                            संपूर्ण उपाय देखें →
                          </button>
                        </div>

                        <p className="text-xs text-[#5C3A21] leading-relaxed">{item.reason}</p>

                        {detail && (
                          <div className="space-y-2 text-xs pt-1">
                            <div className="p-2.5 rounded-xl bg-[#FBF0DD] border border-[#B56A00]/25">
                              <span className="font-bold text-[#8C6239]">सिद्ध वैदिक मंत्र: </span>
                              <span className="font-bold text-[#5C3A21] font-granth">{detail.mantra}</span>
                              <span className="text-[10px] text-[#735133] block mt-0.5">
                                नियम: प्रतिदिन 108 बार रुद्राक्ष माला से जप करें।
                              </span>
                            </div>

                            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
                              <span className="font-bold text-emerald-900">चमत्कारी लाल किताब उपाय: </span>
                              <span className="text-emerald-800">{detail.lalKitabRemedies[0]}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>
                    आपकी कुण्डली में कोई भी ग्रह गंभीर नीच अवस्था में नहीं पाया गया है। सामान्य शुभता व उन्नति हेतु नीचे दिए गए नवग्रहों के मंत्र जप व दान कर सकते हैं।
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 2. ALL 9 PLANETS TAB */}
      {activeTab === 'all_planets' && (
        <div className="space-y-4">
          {/* Planet Selector Horizontal */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {Object.keys(PLANETS_UPAY_DATA).map((pName) => (
              <button
                key={pName}
                type="button"
                onClick={() => setSelectedPlanetName(pName)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  selectedPlanetName === pName
                    ? 'bg-[#B56A00] text-white shadow-xs'
                    : 'bg-[#FAF2E4] text-[#5C3A21] border border-[#8C6239]/20 hover:bg-[#F4E8D1]'
                }`}
              >
                {pName}
              </button>
            ))}
          </div>

          {/* Active Planet Detail Box */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF2E4] border border-[#8C6239]/25 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#8C6239]/20 gap-2">
              <div>
                <span className="text-[11px] font-bold text-[#B56A00] uppercase tracking-wider">
                  इष्टदेव: {currentPlanetDetail.rulerDeity}
                </span>
                <h3 className="text-lg font-bold font-granth text-[#5C3A21]">
                  {currentPlanetDetail.hindiName} ({currentPlanetDetail.planet}) के अचूक उपाय
                </h3>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() =>
                    handleShare(
                      currentPlanetDetail.hindiName,
                      `मंत्र: ${currentPlanetDetail.mantra}\nउपाय: ${currentPlanetDetail.vedicRemedies[0]}`
                    )
                  }
                  className="p-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs cursor-pointer"
                  title="व्हाट्सएप पर शेयर करें"
                >
                  <Share2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Mantras Box */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-xl bg-white border border-[#8C6239]/20 space-y-1">
                <span className="font-bold text-[#8C6239] block">वैदिक / पौराणिक मंत्र:</span>
                <p className="font-granth font-bold text-sm text-[#5C3A21]">
                  {currentPlanetDetail.mantra}
                </p>
                <span className="text-[10px] text-[#735133]">जप संख्या: {currentPlanetDetail.japaCount}</span>
              </div>
              <div className="p-3 rounded-xl bg-white border border-[#8C6239]/20 space-y-1">
                <span className="font-bold text-[#8C6239] block">तांत्रिक बीज मंत्र:</span>
                <p className="font-granth font-bold text-sm text-[#B56A00]">
                  {currentPlanetDetail.beejMantra}
                </p>
                <span className="text-[10px] text-[#735133]">शुभ रंग: {currentPlanetDetail.favorableColor}</span>
              </div>
            </div>

            {/* Symptoms of weakness */}
            <div className="space-y-1.5 text-xs">
              <h4 className="font-bold text-rose-900 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-700" />
                <span>ग्रह कमजोर होने के प्रमुख शास्त्रीय लक्षण:</span>
              </h4>
              <ul className="space-y-1 text-rose-800 list-disc list-inside bg-rose-50/80 p-3 rounded-xl border border-rose-200">
                {currentPlanetDetail.weakSymptoms.map((sym, idx) => (
                  <li key={idx}>{sym}</li>
                ))}
              </ul>
            </div>

            {/* Vedic Remedies */}
            <div className="space-y-1.5 text-xs">
              <h4 className="font-bold text-[#5C3A21] flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#B56A00]" />
                <span>शास्त्रोक्त वैदिक उपाय:</span>
              </h4>
              <ul className="space-y-1 text-[#3E2714] list-disc list-inside bg-white p-3 rounded-xl border border-[#8C6239]/15">
                {currentPlanetDetail.vedicRemedies.map((rem, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {rem}
                  </li>
                ))}
              </ul>
            </div>

            {/* Lal Kitab remedies */}
            <div className="space-y-1.5 text-xs">
              <h4 className="font-bold text-amber-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#B56A00]" />
                <span>लाल किताब के सिद्ध चमत्कारी टोटके:</span>
              </h4>
              <ul className="space-y-1 text-amber-950 list-disc list-inside bg-amber-50/80 p-3 rounded-xl border border-amber-200">
                {currentPlanetDetail.lalKitabRemedies.map((totka, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {totka}
                  </li>
                ))}
              </ul>
            </div>

            {/* Gemstone, Rudraksha, Charity */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-white border border-[#8C6239]/15">
                <span className="font-bold text-[#8C6239] block">दान सामग्री:</span>
                <span className="text-[#3E2714]">{currentPlanetDetail.charityItems.join(', ')}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-[#8C6239]/15">
                <span className="font-bold text-[#8C6239] block">रत्न परामर्श:</span>
                <span className="text-[#3E2714]">{currentPlanetDetail.gemstone}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-[#8C6239]/15">
                <span className="font-bold text-[#8C6239] block">रुद्राक्ष:</span>
                <span className="text-[#3E2714]">{currentPlanetDetail.rudraksha}</span>
              </div>
            </div>

            {/* Strict Prohibitions */}
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs">
              <span className="font-bold text-red-900 block mb-1">विशेष वर्जित कार्य (क्या न करें):</span>
              <ul className="space-y-0.5 text-red-800 list-disc list-inside">
                {currentPlanetDetail.strictAvoid.map((a, idx) => (
                  <li key={idx}>{a}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* 3. DOSHAS TAB */}
      {activeTab === 'doshas' && (
        <div className="space-y-4">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {MAJOR_DOSHAS_UPAY.map((dosha) => (
              <button
                key={dosha.id}
                type="button"
                onClick={() => setSelectedDoshaId(dosha.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  selectedDoshaId === dosha.id
                    ? 'bg-rose-700 text-white shadow-xs'
                    : 'bg-[#FAF2E4] text-[#5C3A21] border border-[#8C6239]/20 hover:bg-[#F4E8D1]'
                }`}
              >
                {dosha.name.split('(')[0]}
              </button>
            ))}
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF2E4] border border-[#8C6239]/25 shadow-xs space-y-4">
            <div className="pb-3 border-b border-[#8C6239]/20">
              <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider">
                दोष विश्लेषण व शांति
              </span>
              <h3 className="text-lg font-bold font-granth text-[#5C3A21] mt-0.5">
                {currentDosha.name}
              </h3>
              <p className="text-xs text-[#735133] mt-1">{currentDosha.significance}</p>
            </div>

            <div className="space-y-1.5 text-xs">
              <h4 className="font-bold text-rose-900 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-700" />
                <span>इस दोष के प्रमुख प्रभाव व लक्षण:</span>
              </h4>
              <ul className="space-y-1 text-rose-800 list-disc list-inside bg-rose-50 p-3 rounded-xl border border-rose-200">
                {currentDosha.symptoms.map((s, idx) => (
                  <li key={idx}>{s}</li>
                ))}
              </ul>
            </div>

            <div className="space-y-1.5 text-xs">
              <h4 className="font-bold text-emerald-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                <span>प्रमाणित वैदिक शांति उपाय:</span>
              </h4>
              <ul className="space-y-1.5 text-emerald-950 list-disc list-inside bg-white p-3.5 rounded-xl border border-[#8C6239]/15">
                {currentDosha.provenRemedies.map((rem, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {rem}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-1.5 text-xs">
              <h4 className="font-bold text-[#5C3A21] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#B56A00]" />
                <span>चमत्कारी टोटके व सरल उपाय:</span>
              </h4>
              <ul className="space-y-1 text-[#735133] list-disc list-inside bg-[#FBF0DD] p-3 rounded-xl border border-[#B56A00]/25">
                {currentDosha.miracleTips.map((tip, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* 4. MIRACLE PROBLEM REMEDIES TAB */}
      {activeTab === 'miracle' && (
        <div className="space-y-3">
          {MIRACLE_CHAMTKARI_UPAY.map((item) => (
            <div
              key={item.id}
              className="p-4 sm:p-5 rounded-2xl bg-[#FAF2E4] border border-[#8C6239]/25 shadow-xs space-y-3"
            >
              <div className="flex items-start justify-between gap-2 pb-2 border-b border-[#8C6239]/15">
                <div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#B56A00] text-white font-bold">
                    {item.category}
                  </span>
                  <h3 className="text-base font-bold font-granth text-[#5C3A21] mt-1">
                    {item.solutionTitle}
                  </h3>
                  <p className="text-xs text-[#735133] mt-0.5">
                    <strong>समस्या: </strong> {item.problem}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleShare(item.solutionTitle, item.problem)}
                  className="p-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs cursor-pointer shrink-0"
                >
                  <Share2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="p-2.5 rounded-lg bg-white/70 border border-[#8C6239]/15 text-xs">
                <span className="font-bold text-[#8C6239]">आवश्यक सामग्री: </span>
                <span className="text-[#3E2714]">{item.materials}</span>
              </div>

              <div className="space-y-1.5 text-xs">
                <span className="font-bold text-[#5C3A21]">विधि व प्रयोग:</span>
                <ol className="space-y-1.5 list-decimal list-inside text-[#3E2714] bg-white p-3 rounded-xl border border-[#8C6239]/15 leading-relaxed">
                  {item.procedure.map((step, idx) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ol>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
