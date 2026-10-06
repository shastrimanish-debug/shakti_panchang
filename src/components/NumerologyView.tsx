import React, { useState, useMemo } from 'react';
import { KundaliData } from '../types';
import {
  NUMBER_DATA,
  calculateMulank,
  calculateBhagyank,
  calculateNamank,
  calculateKuaNumber,
  calculatePersonalYear,
  calculateLoshuGrid,
  MISSING_NUMBER_REMEDIES,
  analyzeNumberCompatibility,
  NAVAGRAHA_YANTRAS,
  suggestNameCorrections,
  generateNumerologyWhatsAppText,
} from '../services/numerology';
import { openWhatsAppShare } from '../services/umaConsultationPdf';
import { speakUma, stopUmaSpeech } from '../lib/umaSpeech';
import { useLanguage } from '../i18n';
import {
  Sparkles,
  Share2,
  Copy,
  Check,
  Volume2,
  VolumeX,
  Compass,
  Calendar,
  User,
  Heart,
  ShieldCheck,
  AlertTriangle,
  Lightbulb,
  Phone,
  RefreshCw,
  Hash,
  Flame,
  Award,
  Zap,
} from 'lucide-react';

interface NumerologyViewProps {
  activeKundali?: KundaliData | null;
  onOpenKundaliTab?: () => void;
  onOpenUmaWithQuery?: (query: string) => void;
}

type SubTab = 'profile' | 'loshu' | 'upay' | 'checker' | 'matrix';

export const NumerologyView: React.FC<NumerologyViewProps> = ({
  activeKundali,
  onOpenKundaliTab,
  onOpenUmaWithQuery,
}) => {
  const { language } = useLanguage();

  // Initial State derived from activeKundali if available
  const defaultDate = useMemo(() => {
    if (activeKundali?.birthDate) {
      const d = new Date(activeKundali.birthDate);
      if (!isNaN(d.getTime())) return d;
    }
    return new Date(1995, 9, 28); // Default fallback: 28 Oct 1995
  }, [activeKundali]);

  const [name, setName] = useState<string>(activeKundali?.name || 'राहुल शर्मा');
  const [day, setDay] = useState<number>(defaultDate.getDate());
  const [month, setMonth] = useState<number>(defaultDate.getMonth() + 1);
  const [year, setYear] = useState<number>(defaultDate.getFullYear());
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [activeTab, setActiveTab] = useState<SubTab>('profile');
  const [namankSystem, setNamankSystem] = useState<'chaldean' | 'pythagorean'>('chaldean');
  const [targetForecastYear, setTargetForecastYear] = useState<number>(new Date().getFullYear());
  const [selectedYantraNum, setSelectedYantraNum] = useState<number>(1);

  // Checker Tool state
  const [checkInput, setCheckInput] = useState<string>('9876543210');
  const [copiedNotice, setCopiedNotice] = useState<string | null>(null);
  const [isSpeakingMantra, setIsSpeakingMantra] = useState<boolean>(false);

  // Core Calculations
  const mulank = useMemo(() => calculateMulank(day), [day]);
  const bhagyank = useMemo(() => calculateBhagyank(day, month, year), [day, month, year]);
  const namank = useMemo(() => calculateNamank(name, namankSystem), [name, namankSystem]);
  const kua = useMemo(() => calculateKuaNumber(year, gender), [year, gender]);
  const personalYear = useMemo(
    () => calculatePersonalYear(day, month, targetForecastYear),
    [day, month, targetForecastYear]
  );
  const loshu = useMemo(() => calculateLoshuGrid(day, month, year), [day, month, year]);
  const mulankData = NUMBER_DATA[mulank] || NUMBER_DATA[1];
  const bhagyankData = NUMBER_DATA[bhagyank] || NUMBER_DATA[1];

  // Compatibility Analysis
  const compatibilityResult = useMemo(
    () => analyzeNumberCompatibility(checkInput, mulank, bhagyank),
    [checkInput, mulank, bhagyank]
  );

  // Name Correction Analysis
  const nameCorrections = useMemo(
    () => suggestNameCorrections(name, mulank, bhagyank, namankSystem),
    [name, mulank, bhagyank, namankSystem]
  );

  // Sync with Kundali when activeKundali changes
  const handleSyncWithKundali = () => {
    if (activeKundali) {
      if (activeKundali.name) setName(activeKundali.name);
      if (activeKundali.birthDate) {
        const d = new Date(activeKundali.birthDate);
        if (!isNaN(d.getTime())) {
          setDay(d.getDate());
          setMonth(d.getMonth() + 1);
          setYear(d.getFullYear());
        }
      }
      showToast(language === 'en' ? 'Synced from Kundali!' : language === 'gu' ? 'કુંડળી માંથી અપડેટ થયું!' : 'कुंडली से विवरण लोड किया गया!');
    } else if (onOpenKundaliTab) {
      onOpenKundaliTab();
    }
  };

  const showToast = (msg: string) => {
    setCopiedNotice(msg);
    setTimeout(() => setCopiedNotice(null), 3000);
  };

  const handleShareWhatsApp = () => {
    const text = generateNumerologyWhatsAppText({
      name,
      day,
      month,
      year,
      gender,
      language: (language as 'hi' | 'gu' | 'en') || 'hi',
    });
    openWhatsAppShare(text);
  };

  const handleCopySummary = () => {
    const text = generateNumerologyWhatsAppText({
      name,
      day,
      month,
      year,
      gender,
      language: (language as 'hi' | 'gu' | 'en') || 'hi',
    });
    navigator.clipboard.writeText(text);
    showToast(language === 'en' ? 'Report copied to clipboard!' : language === 'gu' ? 'રિપોર્ટ કોપી થઈ ગયો!' : 'अंक ज्योतिष रिपोर्ट कॉपी हो गई!');
  };

  const handleToggleSpeakMantra = (mantraText: string) => {
    if (isSpeakingMantra) {
      stopUmaSpeech();
      setIsSpeakingMantra(false);
    } else {
      setIsSpeakingMantra(true);
      void speakUma(`${mantraText}। ${mantraText}। ${mantraText}।`, {
        rate: 0.85,
        onEnd: () => setIsSpeakingMantra(false),
      });
    }
  };

  // Translations
  const tTitle = language === 'en' ? 'Vedic Numerology & Lo Shu Grid' : language === 'gu' ? 'વૈદિક અંક જ્યોતિષ અને લો-શૂ ચક્ર' : 'वैदिक अंक ज्योतिष एवं लो शू चक्र';
  const tSubtitle = language === 'en' ? 'Root, Destiny & Name Numbers, 3x3 Lo Shu Planes, Raj Yogas & Scriptural Remedies' : language === 'gu' ? 'મૂળાંક, ભાગ્યાંક, નામાંક, લો-શૂ ગ્રીડ, રાજયોગ અને સચોટ ઉપાયો' : 'मूलांक, भाग्यांक, नामांक, कुआ अंक, लो शू ग्रिड, राजयोग व सम्पूर्ण अंक उपाय';

  return (
    <div className="w-full space-y-4 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {copiedNotice && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-in fade-in zoom-in-95 duration-200">
          <div className="px-4 py-2 bg-[#2C180C]/95 text-[#FAF2E4] border border-amber-500/50 rounded-full shadow-2xl text-xs sm:text-sm font-bold flex items-center gap-2 backdrop-blur-md">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{copiedNotice}</span>
          </div>
        </div>
      )}

      {/* Hero Header Banner */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-[#5C3A21] via-[#8C6239] to-[#5C3A21] text-[#FAF2E4] shadow-md border border-[#FFD88A]/30 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FFD88A]/20 text-[#FFD88A] border border-[#FFD88A]/40 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#FFD88A]" />
                {language === 'en' ? 'Authentic Vedic Numerology' : language === 'gu' ? 'શાસ્ત્રોક્ત અંક ગણતરી' : '१००% शास्त्रोक्त अंक शास्त्र'}
              </span>
              <span className="text-[10px] text-amber-200/80 font-medium">
                {activeKundali ? `(जातक: ${activeKundali.name})` : ''}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-granth text-[#FFD88A]">
              {tTitle}
            </h2>
            <p className="text-xs text-[#FAF2E4]/90 mt-0.5 max-w-xl leading-relaxed">
              {tSubtitle}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="px-3 py-1.5 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
              title="Share on WhatsApp"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{language === 'en' ? 'Share' : language === 'gu' ? 'શેર' : 'व्हाट्सएप शेयर'}</span>
            </button>
            <button
              type="button"
              onClick={handleCopySummary}
              className="px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition flex items-center gap-1.5 border border-white/30 cursor-pointer active:scale-95"
              title="Copy Report"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{language === 'en' ? 'Copy' : language === 'gu' ? 'કોપી' : 'कॉपी'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Birth & Name Input Card */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-[#FAF5ED] dark:bg-[#2A1508]/60 border border-[#8C6239]/25 shadow-xs space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#5C3A21] dark:text-[#FFD88A]">
            <Calendar className="w-4 h-4 text-[#B56A00]" />
            <span>{language === 'en' ? 'Birth Details for Numerology Calculation' : language === 'gu' ? 'જન્મ વિગત અને નામ' : 'जन्म विवरण एवं नाम प्रविष्टि'}</span>
          </div>

          <div className="flex items-center gap-2">
            {activeKundali && (
              <button
                type="button"
                onClick={handleSyncWithKundali}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-amber-600/15 text-amber-800 dark:text-amber-200 hover:bg-amber-600/25 border border-amber-600/30 font-bold transition flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3 text-amber-600" />
                <span>{language === 'en' ? 'Sync Kundali' : language === 'gu' ? 'કુંડળીથી લોડ' : 'कुंडली से लोड करें'}</span>
              </button>
            )}
            <div className="flex rounded-lg border border-[#8C6239]/30 overflow-hidden text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setGender('male')}
                className={`px-2 py-0.5 transition cursor-pointer ${gender === 'male' ? 'bg-[#5C3A21] text-white' : 'bg-white dark:bg-[#351D0C] text-[#5C3A21] dark:text-stone-300'}`}
              >
                {language === 'en' ? 'Male' : language === 'gu' ? 'પુરુષ' : 'पुरुष'}
              </button>
              <button
                type="button"
                onClick={() => setGender('female')}
                className={`px-2 py-0.5 transition cursor-pointer ${gender === 'female' ? 'bg-[#5C3A21] text-white' : 'bg-white dark:bg-[#351D0C] text-[#5C3A21] dark:text-stone-300'}`}
              >
                {language === 'en' ? 'Female' : language === 'gu' ? 'મહિલા' : 'महिला'}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 text-xs">
          {/* Name Field */}
          <div className="sm:col-span-1">
            <label className="block text-[10px] font-bold text-[#8C6239] uppercase tracking-wider mb-1">
              {language === 'en' ? 'Full Name (in English)' : language === 'gu' ? 'પૂરું નામ (અંગ્રેજીમાં)' : 'पूर्ण नाम (अंग्रेजी में)'}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Rahul Sharma"
              className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-[#1E0F07] border border-[#8C6239]/30 text-[#3E2714] dark:text-[#FAF2E4] font-medium focus:outline-hidden focus:border-[#B56A00]"
            />
          </div>

          {/* Day */}
          <div>
            <label className="block text-[10px] font-bold text-[#8C6239] uppercase tracking-wider mb-1">
              {language === 'en' ? 'Birth Day' : language === 'gu' ? 'જન્મ તારીખ' : 'जन्म तारीख (दिन)'}
            </label>
            <select
              value={day}
              onChange={(e) => setDay(parseInt(e.target.value, 10))}
              className="w-full px-2.5 py-1.5 rounded-xl bg-white dark:bg-[#1E0F07] border border-[#8C6239]/30 text-[#3E2714] dark:text-[#FAF2E4] font-medium focus:outline-hidden"
            >
              {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Month */}
          <div>
            <label className="block text-[10px] font-bold text-[#8C6239] uppercase tracking-wider mb-1">
              {language === 'en' ? 'Birth Month' : language === 'gu' ? 'જન્મ મહિનો' : 'जन्म माह'}
            </label>
            <select
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value, 10))}
              className="w-full px-2.5 py-1.5 rounded-xl bg-white dark:bg-[#1E0F07] border border-[#8C6239]/30 text-[#3E2714] dark:text-[#FAF2E4] font-medium focus:outline-hidden"
            >
              {[
                '01 - जनवरी (Jan)',
                '02 - फरवरी (Feb)',
                '03 - मार्च (Mar)',
                '04 - अप्रैल (Apr)',
                '05 - मई (May)',
                '06 - जून (Jun)',
                '07 - जुलाई (Jul)',
                '08 - अगस्त (Aug)',
                '09 - सितम्बर (Sep)',
                '10 - अक्टूबर (Oct)',
                '11 - नवम्बर (Nov)',
                '12 - दिसम्बर (Dec)',
              ].map((mName, idx) => (
                <option key={idx + 1} value={idx + 1}>
                  {mName}
                </option>
              ))}
            </select>
          </div>

          {/* Year */}
          <div>
            <label className="block text-[10px] font-bold text-[#8C6239] uppercase tracking-wider mb-1">
              {language === 'en' ? 'Birth Year' : language === 'gu' ? 'જન્મ વર્ષ' : 'जन्म वर्ष'}
            </label>
            <input
              type="number"
              min={1920}
              max={2035}
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value, 10) || 1995)}
              className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-[#1E0F07] border border-[#8C6239]/30 text-[#3E2714] dark:text-[#FAF2E4] font-medium focus:outline-hidden"
            />
          </div>
        </div>

        {/* Quick Calculations Bar */}
        <div className="pt-2 border-t border-[#8C6239]/15 flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-900 dark:text-amber-200 font-bold">
              मूलांक: <strong className="text-sm font-black text-[#8C4A00]">{mulank}</strong> ({mulankData.planetEn})
            </span>
            <span className="px-2 py-0.5 rounded-md bg-purple-500/15 text-purple-900 dark:text-purple-200 font-bold">
              भाग्यांक: <strong className="text-sm font-black text-purple-700 dark:text-purple-300">{bhagyank}</strong> ({bhagyankData.planetEn})
            </span>
            <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-900 dark:text-emerald-200 font-bold">
              नामांक: <strong className="text-sm font-black text-emerald-700 dark:text-emerald-300">{namank.single}</strong> (योग: {namank.compound})
            </span>
            <span className="px-2 py-0.5 rounded-md bg-blue-500/15 text-blue-900 dark:text-blue-200 font-bold">
              कुआ अंक: <strong className="text-sm font-black text-blue-700 dark:text-blue-300">{kua}</strong>
            </span>
          </div>

          <div className="text-[11px] text-[#735133] dark:text-stone-300 font-semibold">
            DOB: {String(day).padStart(2, '0')}/{String(month).padStart(2, '0')}/{year}
          </div>
        </div>
      </div>

      {/* Modern Sub-Tab Pill Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'profile', label: language === 'en' ? 'Core Numbers' : language === 'gu' ? 'મુખ્ય અંકો' : 'अंक विश्लेषण', icon: Hash },
          { id: 'loshu', label: language === 'en' ? 'Lo Shu Grid' : language === 'gu' ? 'લો-શૂ ચક્ર' : 'लो शू ग्रिड', icon: Compass },
          { id: 'upay', label: language === 'en' ? 'Upay & Yantra' : language === 'gu' ? 'ઉપાય અને યંત્ર' : 'अंक उपाय व यंत्र', icon: Sparkles },
          { id: 'checker', label: language === 'en' ? 'Compatibility Tool' : language === 'gu' ? 'નંબર ચેકર' : 'मोबाइल/वाहन मिलान', icon: Phone },
          { id: 'matrix', label: language === 'en' ? 'Friendship Matrix' : language === 'gu' ? 'મૈત્રી ચક્ર' : 'मैत्री व लकी चक्र', icon: Heart },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as SubTab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer shrink-0 ${
                isActive
                  ? 'bg-[#5C3A21] text-[#FAF2E4] shadow-xs'
                  : 'bg-white/80 dark:bg-[#2A1508] text-[#5C3A21] dark:text-[#FFD88A] hover:bg-[#FAF2E4] border border-[#8C6239]/20'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ======================================================== */}
      {/* SUB-TAB 1: CORE NUMBERS & PROFILE (अंक चक्र) */}
      {/* ======================================================== */}
      {activeTab === 'profile' && (
        <div className="space-y-4">
          {/* 4 Pillars of Vedic Numerology */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Card 1: मूलांक (Driver / Root Number) */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#2A1508]/80 border border-[#8C6239]/25 shadow-xs space-y-2.5">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">
                    {language === 'en' ? 'Driver / Root Number' : language === 'gu' ? 'ડ્રાઈવર / રૂટ નંબર' : 'मूलांक (जन्म तारीख)'}
                  </span>
                  <h3 className="text-base font-bold font-granth text-[#5C3A21] dark:text-[#FFD88A]">
                    {language === 'en' ? `Root Number ${mulank}` : language === 'gu' ? `મૂળાંક ${mulank}` : `मूलांक ${mulank} (${mulankData.planet})`}
                  </h3>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-500 text-white flex items-center justify-center text-xl font-black shadow-xs">
                  {mulank}
                </div>
              </div>

              {/* Step by step calculation */}
              <div className="p-2 rounded-xl bg-[#FAF5ED] dark:bg-[#1E0F07] text-[11px] text-[#735133] dark:text-stone-300 border border-[#8C6239]/15">
                <span className="font-bold text-[#8C4A00]">
                  {language === 'en' ? 'Calculation Method:' : language === 'gu' ? 'ગણતરી પદ્ધતિ:' : 'गणना विधि:'}
                </span>{' '}
                जन्म तिथि {day} ➔ {day > 9 ? `${Math.floor(day / 10)} + ${day % 10} = ` : ''}
                <strong>{mulank}</strong>
              </div>

              <div className="space-y-1.5 text-xs text-[#5C3A21] dark:text-stone-200">
                <div className="flex justify-between py-1 border-b border-[#8C6239]/10">
                  <span className="text-[#8C6239] font-medium">{language === 'en' ? 'Ruling Planet:' : 'स्वामी ग्रह:'}</span>
                  <span className="font-bold">{mulankData.planet}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#8C6239]/10">
                  <span className="text-[#8C6239] font-medium">{language === 'en' ? 'Ruling Deity:' : 'इष्ट देवता:'}</span>
                  <span className="font-bold">{mulankData.deity}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#8C6239]/10">
                  <span className="text-[#8C6239] font-medium">{language === 'en' ? 'Element / Nature:' : 'तत्व व स्वभाव:'}</span>
                  <span className="font-bold">{mulankData.element}</span>
                </div>
                <div className="pt-1">
                  <span className="text-[#8C6239] font-medium block mb-1">{language === 'en' ? 'Key Traits:' : 'मूल स्वभाव:'}</span>
                  <div className="flex flex-wrap gap-1">
                    {mulankData.traits.map((tr, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-md bg-[#FAF2E4] dark:bg-stone-800 text-[#5C3A21] dark:text-amber-200 text-[11px] font-semibold">
                        • {tr}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: भाग्यांक (Conductor / Destiny Number) */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#2A1508]/80 border border-[#8C6239]/25 shadow-xs space-y-2.5">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider">
                    {language === 'en' ? 'Conductor / Life Path Number' : language === 'gu' ? 'ભાગ્યાંક / જીવન પથ નંબર' : 'भाग्यांक (सम्पूर्ण जन्म तिथि योग)'}
                  </span>
                  <h3 className="text-base font-bold font-granth text-[#5C3A21] dark:text-[#FFD88A]">
                    {language === 'en' ? `Destiny Number ${bhagyank}` : language === 'gu' ? `ભાગ્યાંક ${bhagyank}` : `भाग्यांक ${bhagyank} (${bhagyankData.planet})`}
                  </h3>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-700 to-purple-500 text-white flex items-center justify-center text-xl font-black shadow-xs">
                  {bhagyank}
                </div>
              </div>

              {/* Step by step calculation */}
              <div className="p-2 rounded-xl bg-[#FAF5ED] dark:bg-[#1E0F07] text-[11px] text-[#735133] dark:text-stone-300 border border-[#8C6239]/15">
                <span className="font-bold text-purple-800 dark:text-purple-300">
                  {language === 'en' ? 'Calculation Method:' : language === 'gu' ? 'ગણતરી પદ્ધતિ:' : 'गणना विधि:'}
                </span>{' '}
                {day} + {month} + {year} = {day + month + year} ➔ <strong>{bhagyank}</strong>
              </div>

              <div className="space-y-1.5 text-xs text-[#5C3A21] dark:text-stone-200">
                <div className="flex justify-between py-1 border-b border-[#8C6239]/10">
                  <span className="text-[#8C6239] font-medium">{language === 'en' ? 'Ruling Planet:' : 'स्वामी ग्रह:'}</span>
                  <span className="font-bold">{bhagyankData.planet}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#8C6239]/10">
                  <span className="text-[#8C6239] font-medium">{language === 'en' ? 'Life Mission:' : 'जीवन उद्देश्य:'}</span>
                  <span className="font-bold">{bhagyankData.nature.split(',')[0] || 'उन्नति व सिद्धि'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#8C6239]/10">
                  <span className="text-[#8C6239] font-medium">{language === 'en' ? 'Auspicious Gem:' : 'शुभ रत्न:'}</span>
                  <span className="font-bold">{bhagyankData.luckyGem}</span>
                </div>
                <div className="pt-1">
                  <span className="text-[#8C6239] font-medium block mb-1">{language === 'en' ? 'Favorable Careers:' : 'अनुकूल कार्यक्षेत्र:'}</span>
                  <p className="text-[11px] leading-relaxed text-[#735133] dark:text-stone-300">
                    {bhagyankData.careers.join(', ')}
                  </p>
                </div>
              </div>
            </div>

            {/* Card 3: नामांक (Name Number Vibration) */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#2A1508]/80 border border-[#8C6239]/25 shadow-xs space-y-2.5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                      {language === 'en' ? 'Name Vibration Number' : language === 'gu' ? 'નામાંક (નામ કંપન)' : 'नामांक (नाम स्पंदन अंक)'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setNamankSystem(namankSystem === 'chaldean' ? 'pythagorean' : 'chaldean')}
                      className="px-1.5 py-0.2 rounded bg-stone-200 dark:bg-stone-700 text-[10px] font-bold text-stone-800 dark:text-stone-200 cursor-pointer"
                    >
                      {namankSystem === 'chaldean' ? 'Chaldean' : 'Pythagorean'} ⇄
                    </button>
                  </div>
                  <h3 className="text-base font-bold font-granth text-[#5C3A21] dark:text-[#FFD88A]">
                    {language === 'en' ? `Name Number ${namank.single}` : language === 'gu' ? `નામાંક ${namank.single}` : `नामांक ${namank.single} (${NUMBER_DATA[namank.single]?.planet || 'बुध'})`}
                  </h3>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center text-xl font-black shadow-xs">
                  {namank.single}
                </div>
              </div>

              {/* Letter Breakdown Chips */}
              <div className="p-2 rounded-xl bg-[#FAF5ED] dark:bg-[#1E0F07] border border-[#8C6239]/15">
                <div className="text-[10px] font-bold text-[#8C6239] mb-1">
                  {name.toUpperCase() || 'NAME'} अक्षर मूल्य ({namankSystem}):
                </div>
                <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto">
                  {namank.breakdown.map((item, idx) => (
                    <span key={idx} className="px-1.5 py-0.5 rounded bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-[10px] font-bold">
                      {item.char}={item.val}
                    </span>
                  ))}
                </div>
                <div className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 mt-1.5">
                  कुल योग: {namank.compound} ➔ एकल नामांक: <strong>{namank.single}</strong>
                </div>
              </div>

              {/* Harmony check with Mulank & Bhagyank */}
              <div className="text-xs space-y-1">
                <div className="flex items-center gap-1.5">
                  {mulankData.friendlyNumbers.includes(namank.single) || namank.single === mulank ? (
                    <span className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      मूलांक {mulank} के साथ पूर्ण मैत्री (शुभ व फलदायी)
                    </span>
                  ) : mulankData.enemyNumbers.includes(namank.single) ? (
                    <span className="text-rose-600 font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      मूलांक {mulank} से शत्रुता (नाम वर्तनी सुधार सुझाव देखें)
                    </span>
                  ) : (
                    <span className="text-amber-700 dark:text-amber-400 font-medium">
                      मूलांक {mulank} के साथ सम/तटस्थ संबंध
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Card 4: कुआ अंक (Kua Number - Vastu & Directions) */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#2A1508]/80 border border-[#8C6239]/25 shadow-xs space-y-2.5">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">
                    {language === 'en' ? 'Kua Number (Feng Shui / Vastu)' : language === 'gu' ? 'કુઆ અંક (વાસ્તુ/દિશા)' : 'कुआ अंक (वास्तु व अनुकूल दिशा)'}
                  </span>
                  <h3 className="text-base font-bold font-granth text-[#5C3A21] dark:text-[#FFD88A]">
                    {language === 'en' ? `Kua Number ${kua}` : language === 'gu' ? `કુઆ અંક ${kua}` : `कुआ अंक ${kua} (${gender === 'male' ? 'पुरुष' : 'महिला'})`}
                  </h3>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center text-xl font-black shadow-xs">
                  {kua}
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-[#5C3A21] dark:text-stone-200">
                <div className="p-2 rounded-xl bg-[#FAF5ED] dark:bg-[#1E0F07] border border-[#8C6239]/15">
                  <span className="text-[#8C6239] font-bold text-[11px] block mb-1">
                    {language === 'en' ? 'Auspicious Facing Directions (Success & Prosperity):' : 'अति शुभ मुख दिशाएं (सफलता व कार्यसिद्धि):'}
                  </span>
                  <p className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                    {[1, 3, 4, 9].includes(kua)
                      ? 'पूर्व समूह (East Group): उत्तर (North), दक्षिण (South), पूर्व (East), दक्षिण-पूर्व (South-East)'
                      : 'पश्चिम समूह (West Group): उत्तर-पूर्व (NE), दक्षिण-पश्चिम (SW), उत्तर-पश्चिम (NW), पश्चिम (West)'}
                  </p>
                </div>

                <div className="text-[11px] text-[#735133] dark:text-stone-300">
                  • अध्ययन, कार्य अथवा शयन के समय अपना मुख उपरोक्त शुभ दिशाओं की ओर रखने से एकाग्रता और भाग्य में वृद्धि होती है।
                </div>
              </div>
            </div>
          </div>

          {/* Personal Year Forecast Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-[#FAF2E4] to-[#FBF0DD] dark:bg-[#2A1508] border border-[#B56A00]/30 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-[#B56A00] text-white">
                  <Flame className="w-4 h-4 text-amber-200" />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-[#8C4A00] uppercase tracking-wider">
                    {language === 'en' ? 'Annual Cycle Forecast' : language === 'gu' ? 'વાર્ષિક ચક્ર ફળ' : 'व्यक्तिगत वर्ष चक्र फलादेश'}
                  </div>
                  <h3 className="text-sm sm:text-base font-bold font-granth text-[#5C3A21] dark:text-[#FFD88A]">
                    {language === 'en'
                      ? `Personal Year ${personalYear.yearNum} (${targetForecastYear})`
                      : language === 'gu'
                      ? `વ્યક્તિગત વર્ષ ${personalYear.yearNum} (${targetForecastYear})`
                      : `व्यक्तिगत वर्ष ${personalYear.yearNum} — वर्ष ${targetForecastYear}`}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-[11px] text-[#8C6239] font-medium">{language === 'en' ? 'Year:' : 'वर्ष:'}</span>
                <select
                  value={targetForecastYear}
                  onChange={(e) => setTargetForecastYear(parseInt(e.target.value, 10))}
                  className="px-2 py-1 rounded-lg bg-white dark:bg-stone-800 border border-[#8C6239]/30 text-xs font-bold"
                >
                  {[2024, 2025, 2026, 2027, 2028, 2029, 2030].map((yr) => (
                    <option key={yr} value={yr}>
                      {yr}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white/80 dark:bg-[#1E0F07]/80 border border-[#8C6239]/15 space-y-1.5">
              <div className="text-xs font-bold text-[#5C3A21] dark:text-[#FFD88A] flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-600" />
                <span>
                  {language === 'gu' ? personalYear.themeGu : personalYear.theme}
                </span>
              </div>
              <p className="text-xs text-[#735133] dark:text-stone-300 leading-relaxed">
                {language === 'gu' ? personalYear.adviceGu : personalYear.advice}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SUB-TAB 2: LO SHU GRID & PLANES (लो शू चक्र) */}
      {/* ======================================================== */}
      {activeTab === 'loshu' && (
        <div className="space-y-4">
          {/* Lo Shu Grid Visual Display */}
          <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#2A1508]/80 border border-[#8C6239]/25 shadow-xs space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="text-base sm:text-lg font-bold font-granth text-[#5C3A21] dark:text-[#FFD88A] flex items-center gap-2">
                  <span>🧭</span>
                  <span>{language === 'en' ? 'Vedic Lo Shu Magic Matrix (3x3)' : language === 'gu' ? 'વૈદિક લો-શૂ ચક્ર (૩x૩)' : 'वैदिक लो शू चक्र (३×३ चक्र)'}</span>
                </h3>
                <p className="text-xs text-[#735133] dark:text-stone-300">
                  {language === 'en'
                    ? 'Populated with birth date + Mulank + Bhagyank digits'
                    : 'जन्म तारीख, माह, वर्ष, मूलांक व भाग्यांक के अंकों का समुच्चय'}
                </p>
              </div>

              {/* Raj Yoga Badges */}
              <div className="flex items-center gap-2">
                {loshu.goldenRajYoga && (
                  <span className="px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-stone-950 font-black text-[11px] shadow-xs flex items-center gap-1">
                    <Award className="w-3.5 h-3.5" />
                    स्वर्ण राजयोग (4-5-6)
                  </span>
                )}
                {loshu.silverRajYoga && (
                  <span className="px-2.5 py-1 rounded-full bg-gradient-to-r from-stone-300 to-slate-200 text-stone-900 font-black text-[11px] shadow-xs flex items-center gap-1">
                    <Award className="w-3.5 h-3.5" />
                    सिल्वर राजयोग (2-5-8)
                  </span>
                )}
              </div>
            </div>

            {/* Classical Lo Shu Grid */}
            <div className="max-w-xs sm:max-w-sm mx-auto aspect-square grid grid-cols-3 gap-2.5 p-3 rounded-2xl bg-[#FAF5ED] dark:bg-[#1E0F07] border-2 border-[#8C6239]/40 shadow-inner">
              {/* Canonical layout:
                  [4, 9, 2]
                  [3, 5, 7]
                  [8, 1, 6]
              */}
              {[
                { num: 4, name: 'राहु', dir: 'आग्नेय (SE)' },
                { num: 9, name: 'मंगल', dir: 'दक्षिण (S)' },
                { num: 2, name: 'चन्द्र', dir: 'नैऋत्य (SW)' },
                { num: 3, name: 'गुरु', dir: 'पूर्व (E)' },
                { num: 5, name: 'बुध', dir: 'ब्रह्म (Center)' },
                { num: 7, name: 'केतु', dir: 'पश्चिम (W)' },
                { num: 8, name: 'शनि', dir: 'ईशान (NE)' },
                { num: 1, name: 'सूर्य', dir: 'उत्तर (N)' },
                { num: 6, name: 'शुक्र', dir: 'वायव्य (NW)' },
              ].map((cell) => {
                const count = loshu.counts[cell.num] || 0;
                const isPresent = count > 0;

                return (
                  <div
                    key={cell.num}
                    className={`rounded-2xl p-2 flex flex-col items-center justify-center transition-all relative select-none ${
                      isPresent
                        ? 'bg-gradient-to-br from-[#FFFDF9] to-[#FBF0DD] dark:from-[#351D0C] dark:to-[#2A1508] border-2 border-[#B56A00] shadow-sm'
                        : 'bg-white/40 dark:bg-[#150A05]/40 border border-dashed border-[#8C6239]/30 opacity-60'
                    }`}
                  >
                    <span className="text-[9px] font-bold text-[#8C6239] dark:text-stone-400 leading-none">
                      {cell.dir}
                    </span>

                    <div className="my-1 flex items-center justify-center gap-1">
                      {isPresent ? (
                        <span className="text-xl sm:text-2xl font-black text-[#5C3A21] dark:text-[#FFD88A] tracking-wider">
                          {Array(count).fill(cell.num).join('')}
                        </span>
                      ) : (
                        <span className="text-sm font-bold text-stone-400 dark:text-stone-600">
                          —
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <span className="text-[10px] font-bold text-[#735133] dark:text-stone-300">
                        {cell.name} ({cell.num})
                      </span>
                      {isPresent && (
                        <span className="w-3.5 h-3.5 rounded-full bg-[#B56A00] text-white text-[9px] font-bold flex items-center justify-center">
                          {count}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Missing Numbers Summary Bar */}
            <div className="p-3 rounded-2xl bg-[#FAF5ED] dark:bg-[#1E0F07] border border-[#8C6239]/20 flex items-center justify-between flex-wrap gap-2 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-[#5C3A21] dark:text-[#FFD88A]">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>
                  {language === 'en' ? 'Missing Numbers in Birth Grid:' : 'ग्रिड में अनुपस्थित (मिसिंग) अंक:'}
                </span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {loshu.missingNumbers.length > 0 ? (
                  loshu.missingNumbers.map((mNum) => (
                    <button
                      key={mNum}
                      type="button"
                      onClick={() => setActiveTab('upay')}
                      className="px-2.5 py-1 rounded-lg bg-rose-500/15 text-rose-800 dark:text-rose-300 border border-rose-500/30 text-xs font-bold hover:bg-rose-500/25 cursor-pointer"
                      title="उपाय देखें"
                    >
                      अंक {mNum} (उपाय देखें →)
                    </button>
                  ))
                ) : (
                  <span className="text-emerald-700 dark:text-emerald-300 font-bold">
                    अति दुर्लभ! कोई भी अंक अनुपस्थित नहीं है (पूर्ण चक्र)
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Complete Analysis of 8 Lo Shu Planes */}
          <div className="space-y-2.5">
            <h3 className="text-sm font-bold font-granth text-[#5C3A21] dark:text-[#FFD88A] uppercase tracking-wider flex items-center gap-1.5">
              <span>✦</span>
              <span>{language === 'en' ? '8 Life Planes Detailed Analysis' : 'लो शू चक्र के ८ तलों का शास्त्रीय विश्लेषण'}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[...loshu.completedPlanes, ...loshu.incompletePlanes].map((plane, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-2xl border transition-all ${
                    plane.isComplete
                      ? 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-500/40 shadow-xs'
                      : 'bg-white dark:bg-[#2A1508]/60 border-[#8C6239]/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-[#5C3A21] dark:text-[#FAF2E4]">
                        {language === 'gu' ? plane.nameGu : plane.name}
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                        plane.isComplete
                          ? 'bg-emerald-600 text-white'
                          : 'bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                      }`}
                    >
                      {plane.isComplete
                        ? 'पूर्ण (100%)'
                        : `${plane.presentCount}/${plane.numbers.length} अंक उपस्थित`}
                    </span>
                  </div>

                  <div className="text-[11px] font-semibold text-[#8C6239] mb-1">
                    अंक संयोजन: {plane.numbers.join(' - ')}
                  </div>

                  <p className="text-[11px] text-[#735133] dark:text-stone-300 leading-relaxed">
                    {language === 'gu' ? plane.significanceGu : plane.significance}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SUB-TAB 3: REMEDIES & YANTRAS (अंक उपाय व टोटके) */}
      {/* ======================================================== */}
      {activeTab === 'upay' && (
        <div className="space-y-4">
          {/* Section 1: मूलांक व भाग्यांक के दिव्य वैदिक उपाय */}
          <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#2A1508]/80 border border-[#8C6239]/25 shadow-xs space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="text-base sm:text-lg font-bold font-granth text-[#5C3A21] dark:text-[#FFD88A] flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-600" />
                  <span>
                    {language === 'en'
                      ? `Vedic Remedies for Root No. ${mulank} (${mulankData.planetEn})`
                      : `मूलांक ${mulank} (${mulankData.planet}) के वैदिक व लाल किताब उपाय`}
                  </span>
                </h3>
                <p className="text-xs text-[#735133] dark:text-stone-300">
                  नित्य जीवन में इन उपायों को अपनाने से ग्रह दोष शांत होते हैं व भाग्य वृद्धि होती है
                </p>
              </div>

              {/* Mantra Audio Listen Button */}
              <button
                type="button"
                onClick={() => handleToggleSpeakMantra(mulankData.mantra)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 ${
                  isSpeakingMantra
                    ? 'bg-rose-600 text-white animate-pulse'
                    : 'bg-[#5C3A21] text-[#FAF2E4] hover:bg-[#462B17]'
                }`}
              >
                {isSpeakingMantra ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                <span>{isSpeakingMantra ? 'मंत्र पाठ रोकें' : 'मंत्र ध्वनि सुनें'}</span>
              </button>
            </div>

            {/* Sacred Beej Mantra Banner */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-yellow-400/10 to-amber-500/15 border border-amber-500/40 space-y-1.5 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C4A00]">
                वैदिक सिद्ध बीज मंत्र (नित्य जप संख्या: {mulankData.japaCount.toLocaleString()} बार)
              </span>
              <div className="text-base sm:text-lg font-black font-granth text-[#5C3A21] dark:text-[#FFD88A]">
                {mulankData.mantra}
              </div>
              <p className="text-[11px] text-[#735133] dark:text-stone-300">
                प्रातः स्नान उपरांत पूर्व दिशा की ओर मुख करके रुद्राक्ष अथवा तुलसी माला से जप करें।
              </p>
            </div>

            {/* Remedies Detail Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Gemstone & Rudraksha */}
              <div className="p-3 rounded-2xl bg-[#FAF5ED] dark:bg-[#1E0F07] border border-[#8C6239]/15 space-y-2">
                <span className="font-bold text-[#8C4A00] block text-xs">
                  💎 शुभ रत्न व रुद्राक्ष परामर्श
                </span>
                <div className="space-y-1 text-[#5C3A21] dark:text-stone-200">
                  <div>
                    <strong className="text-[#8C6239]">मुख्य रत्न:</strong> {mulankData.luckyGem}
                  </div>
                  <div>
                    <strong className="text-[#8C6239]">उपरत्न:</strong> {mulankData.subGem}
                  </div>
                  <div>
                    <strong className="text-[#8C6239]">रुद्राक्ष:</strong> {mulankData.rudraksha}
                  </div>
                </div>
              </div>

              {/* Charity & Water Energization */}
              <div className="p-3 rounded-2xl bg-[#FAF5ED] dark:bg-[#1E0F07] border border-[#8C6239]/15 space-y-2">
                <span className="font-bold text-[#8C4A00] block text-xs">
                  🙏 दान सामग्री एवं जल उपाय
                </span>
                <div className="space-y-1 text-[#5C3A21] dark:text-stone-200">
                  <div>
                    <strong className="text-[#8C6239]">दान वस्तुएं:</strong> {mulankData.charity.join(', ')}
                  </div>
                  <div>
                    <strong className="text-[#8C6239]">जल पात्र सुझाव:</strong> {mulankData.waterBottleColor}
                  </div>
                  <div>
                    <strong className="text-[#8C6239]">स्वास्थ्य सावधानी:</strong> {mulankData.healthAdvice[0]}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Missing Numbers Remedies from Lo Shu Grid */}
          <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#2A1508]/80 border border-[#8C6239]/25 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-rose-600 text-white">
                <AlertTriangle className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-base font-bold font-granth text-[#5C3A21] dark:text-[#FFD88A]">
                  {language === 'en'
                    ? 'Specific Remedies for Missing Numbers in your Lo Shu Grid'
                    : 'लो शू ग्रिड के अनुपस्थित (Missing) अंकों के अचूक उपाय'}
                </h3>
                <p className="text-xs text-[#735133] dark:text-stone-300">
                  {loshu.missingNumbers.length > 0
                    ? `आपकी जन्म तारीख में अंक [ ${loshu.missingNumbers.join(', ')} ] का अभाव है:`
                    : 'आपकी ग्रिड में कोई अंक अनुपस्थित नहीं है। नीचे संपूर्ण सूची दी गई है:'}
                </p>
              </div>
            </div>

            <div className="space-y-2.5">
              {(loshu.missingNumbers.length > 0 ? loshu.missingNumbers : [1, 2, 3, 4, 5, 6, 7, 8, 9]).map((num) => {
                const rem = MISSING_NUMBER_REMEDIES[num];
                if (!rem) return null;
                const isUserMissing = loshu.missingNumbers.includes(num);

                return (
                  <div
                    key={num}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      isUserMissing
                        ? 'bg-rose-50/70 dark:bg-rose-950/25 border-rose-400/50 shadow-xs'
                        : 'bg-[#FAF5ED] dark:bg-[#1E0F07] border-[#8C6239]/15'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-[#5C3A21] text-[#FAF2E4] font-black text-xs flex items-center justify-center">
                          {num}
                        </span>
                        <h4 className="text-xs sm:text-sm font-bold text-[#5C3A21] dark:text-[#FFD88A]">
                          {language === 'gu' ? rem.titleGu : rem.title}
                        </h4>
                      </div>
                      {isUserMissing && (
                        <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-bold">
                          आपके लिए आवश्यक
                        </span>
                      )}
                    </div>

                    <ul className="space-y-1 text-xs text-[#735133] dark:text-stone-200">
                      {(language === 'gu' ? rem.remediesGu : rem.remedies).map((rLine, rIdx) => (
                        <li key={rIdx} className="flex items-start gap-1.5 leading-relaxed">
                          <span className="text-[#B56A00] font-black mt-0.5">✦</span>
                          <span>{rLine}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 3: Sacred Navagraha Planetary Number Yantras (३x३ अंक यंत्र) */}
          <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#2A1508]/80 border border-[#8C6239]/25 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="text-base font-bold font-granth text-[#5C3A21] dark:text-[#FFD88A] flex items-center gap-2">
                  <Compass className="w-5 h-5 text-amber-600" />
                  <span>शास्त्रोक्त नवग्रह अंक यंत्र (Sacred Number Yantra)</span>
                </h3>
                <p className="text-xs text-[#735133] dark:text-stone-300">
                  प्रत्येक पंक्ति, स्तंभ व विकर्ण का योग समान होता है — भोजपत्र या तांबे पर प्रतिष्ठा करने योग्य
                </p>
              </div>

              {/* Selector for Planet Yantra */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((pNum) => (
                  <button
                    key={pNum}
                    type="button"
                    onClick={() => setSelectedYantraNum(pNum)}
                    className={`px-2 py-1 rounded-lg text-xs font-bold transition cursor-pointer shrink-0 ${
                      selectedYantraNum === pNum
                        ? 'bg-[#B56A00] text-white shadow-xs'
                        : 'bg-[#FAF5ED] dark:bg-stone-800 text-[#5C3A21] dark:text-stone-300 border border-[#8C6239]/20'
                    }`}
                  >
                    अंक {pNum}
                  </button>
                ))}
              </div>
            </div>

            {(() => {
              const yantra = NAVAGRAHA_YANTRAS[selectedYantraNum] || NAVAGRAHA_YANTRAS[1];
              return (
                <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-[#FAF5ED] dark:bg-[#1E0F07] border border-[#8C6239]/20">
                  {/* Visual 3x3 Yantra Grid */}
                  <div className="w-44 h-44 aspect-square grid grid-cols-3 gap-1.5 p-2 rounded-2xl bg-white dark:bg-[#2A1508] border-2 border-[#B56A00] shadow-md shrink-0">
                    {yantra.grid.flat().map((val, cellIdx) => (
                      <div
                        key={cellIdx}
                        className="rounded-xl bg-[#FAF2E4] dark:bg-stone-800 border border-[#8C6239]/30 flex items-center justify-center text-base sm:text-lg font-black text-[#5C3A21] dark:text-amber-200"
                      >
                        {val}
                      </div>
                    ))}
                  </div>

                  {/* Yantra Details & Puja Guidelines */}
                  <div className="space-y-2 text-xs text-[#5C3A21] dark:text-stone-200">
                    <div>
                      <span className="text-[10px] font-bold text-[#8C6239] uppercase tracking-wider block">
                        यंत्र नाम एवं सिद्धि योग:
                      </span>
                      <h4 className="text-base font-bold font-granth text-[#8C4A00] dark:text-[#FFD88A]">
                        {yantra.name}
                      </h4>
                      <p className="text-[11px] text-[#735133] dark:text-stone-400 font-bold">
                        सभी पंक्तियों एवं विकर्णों का कुल योग = {yantra.total}
                      </p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white dark:bg-stone-900 border border-[#8C6239]/15 space-y-1 text-[11px] leading-relaxed">
                      <strong className="text-[#8C6239]">यंत्र निर्माण एवं पूजा विधि:</strong>
                      <p>
                        • शुक्ल पक्ष के शुभ वार को प्रातःकाल अनार की कलम व अष्टगंध/केसर की स्याही से श्वेत पत्र या भोजपत्र पर बनाएं।
                      </p>
                      <p>
                        • धूप, दीप, लाल चंदन व पुष्प अर्पित कर संबंधित ग्रह के बीज मंत्र की १ माला जपें। तत्पश्चात अपने पूजा स्थल या पर्स में रखें।
                      </p>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SUB-TAB 4: COMPATIBILITY TOOL & NAME CORRECTION */}
      {/* ======================================================== */}
      {activeTab === 'checker' && (
        <div className="space-y-4">
          {/* Mobile / Vehicle / Flat Number Evaluator */}
          <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#2A1508]/80 border border-[#8C6239]/25 shadow-xs space-y-3.5">
            <div>
              <span className="text-[10px] font-bold text-[#8C4A00] uppercase tracking-wider">
                {language === 'en' ? 'Live Compatibility Checker' : 'अंक मिलान टूल'}
              </span>
              <h3 className="text-base sm:text-lg font-bold font-granth text-[#5C3A21] dark:text-[#FFD88A] flex items-center gap-2">
                <Phone className="w-5 h-5 text-amber-600" />
                <span>
                  {language === 'en'
                    ? 'Mobile, Vehicle & House Number Compatibility'
                    : 'मोबाइल नंबर, वाहन नंबर व मकान अंक अनुकूलता'}
                </span>
              </h3>
              <p className="text-xs text-[#735133] dark:text-stone-300">
                संख्या दर्ज करें — यह टूल कुल योग निकालकर आपके मूलांक {mulank} व भाग्यांक {bhagyank} से अनुकूलता जाँचेगा
              </p>
            </div>

            {/* Input Row */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={checkInput}
                onChange={(e) => setCheckInput(e.target.value)}
                placeholder="उदा. 9876543210 या GJ01AB1234"
                className="flex-1 px-3.5 py-2 rounded-xl bg-[#FAF5ED] dark:bg-[#1E0F07] border border-[#8C6239]/30 text-sm font-bold text-[#3E2714] dark:text-[#FAF2E4] focus:outline-hidden focus:border-[#B56A00]"
              />
              <button
                type="button"
                onClick={() => setCheckInput('')}
                className="px-3 py-2 rounded-xl bg-stone-200 dark:bg-stone-800 text-xs font-bold text-stone-700 dark:text-stone-300 hover:bg-stone-300 cursor-pointer"
              >
                साफ करें
              </button>
            </div>

            {/* Live Result Card */}
            <div className="p-4 rounded-2xl bg-[#FAF5ED] dark:bg-[#1E0F07] border border-[#8C6239]/20 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#5C3A21] text-[#FFD88A] flex items-center justify-center text-xl font-black shadow-xs">
                    {compatibilityResult.singleDigit || '—'}
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-[#8C6239]">
                      कुल योग: {compatibilityResult.totalSum} ➔ एकल अंक: {compatibilityResult.singleDigit}
                    </div>
                    <div
                      className={`text-sm sm:text-base font-bold font-granth ${
                        compatibilityResult.verdict === 'excellent'
                          ? 'text-emerald-700 dark:text-emerald-400'
                          : compatibilityResult.verdict === 'favorable'
                          ? 'text-teal-700 dark:text-teal-400'
                          : compatibilityResult.verdict === 'avoid'
                          ? 'text-rose-600'
                          : 'text-amber-700'
                      }`}
                    >
                      {language === 'gu'
                        ? compatibilityResult.verdictGu
                        : compatibilityResult.verdictHi}
                    </div>
                  </div>
                </div>

                {/* Score badge */}
                <div className="text-right">
                  <span className="text-[10px] font-bold text-[#8C6239] uppercase tracking-wider block">
                    अनुकूलता स्कोर
                  </span>
                  <span className="text-xl font-black text-[#5C3A21] dark:text-[#FFD88A]">
                    {compatibilityResult.rating}%
                  </span>
                </div>
              </div>

              <p className="text-xs text-[#735133] dark:text-stone-300 leading-relaxed pt-2 border-t border-[#8C6239]/15">
                {language === 'gu' ? compatibilityResult.adviceGu : compatibilityResult.advice}
              </p>
            </div>
          </div>

          {/* Name Spelling Correction & Harmonization Advisor */}
          <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#2A1508]/80 border border-[#8C6239]/25 shadow-xs space-y-3.5">
            <div>
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                {language === 'en' ? 'Vibrational Optimization' : 'नाम संतुलन परामर्श'}
              </span>
              <h3 className="text-base sm:text-lg font-bold font-granth text-[#5C3A21] dark:text-[#FFD88A] flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-amber-500" />
                <span>नाम वर्तनी सुधार व अंक सामंजस्य (Name Correction Advisor)</span>
              </h3>
              <p className="text-xs text-[#735133] dark:text-stone-300">
                वर्तमान नाम: <strong>{name}</strong> ➔ नामांक: <strong>{nameCorrections.currentSingle}</strong> (योग: {nameCorrections.currentCompound})
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#FAF5ED] dark:bg-[#1E0F07] border border-[#8C6239]/20 space-y-2">
              <div className="flex items-center gap-2">
                {nameCorrections.isHarmonious ? (
                  <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    <span>आपका वर्तमान नामांक पहले से ही अनुकूल व शुभ है!</span>
                  </div>
                ) : (
                  <div className="text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    <span>वर्तमान नामांक को और अधिक भाग्यशाली बनाने के विकल्प:</span>
                  </div>
                )}
              </div>

              <div className="space-y-2 pt-1">
                {nameCorrections.suggestions.length > 0 ? (
                  nameCorrections.suggestions.map((sug, sIdx) => (
                    <div
                      key={sIdx}
                      className="p-2.5 rounded-xl bg-white dark:bg-stone-900 border border-[#8C6239]/15 flex items-center justify-between flex-wrap gap-2 text-xs"
                    >
                      <div>
                        <strong className="text-sm font-bold text-[#5C3A21] dark:text-[#FFD88A]">
                          {sug.modifiedName}
                        </strong>
                        <span className="ml-2 text-[11px] text-[#8C6239] font-semibold">
                          (योग: {sug.compound} ➔ नामांक: {sug.single})
                        </span>
                        <p className="text-[11px] text-[#735133] dark:text-stone-300 mt-0.5">
                          {language === 'gu' ? sug.notesGu : sug.notes}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setName(sug.modifiedName);
                          showToast(`नाम बदलकर '${sug.modifiedName}' किया गया!`);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 cursor-pointer"
                      >
                        यह नाम चुनें
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-[#735133] dark:text-stone-300">
                    आपकी वर्तमान नाम वर्तनी श्रेष्ठ अंक संतुलन में है।
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SUB-TAB 5: FRIENDSHIP & LUCKY MATRIX (मैत्री चक्र) */}
      {/* ======================================================== */}
      {activeTab === 'matrix' && (
        <div className="space-y-4">
          <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#2A1508]/80 border border-[#8C6239]/25 shadow-xs space-y-4">
            <div>
              <span className="text-[10px] font-bold text-[#8C4A00] uppercase tracking-wider">
                {language === 'en' ? 'Planetary Numerological Relations' : 'ग्रह अंक मैत्री चक्र'}
              </span>
              <h3 className="text-base sm:text-lg font-bold font-granth text-[#5C3A21] dark:text-[#FFD88A] flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-600" />
                <span>
                  मूलांक {mulank} ({mulankData.planet}) के मित्र, सम एवं शत्रु अंक
                </span>
              </h3>
              <p className="text-xs text-[#735133] dark:text-stone-300">
                साझेदारी, विवाह, नवीन कार्य व महत्वपूर्ण निर्णयों में इन अंकों का विचार करें
              </p>
            </div>

            {/* 3 Categories Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Friendly */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/25 border border-emerald-500/40 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>मित्र अंक (अति शुभ व फलदायी)</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {mulankData.friendlyNumbers.map((fn) => (
                    <span
                      key={fn}
                      className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-black text-sm flex items-center justify-center shadow-xs"
                      title={NUMBER_DATA[fn]?.planet}
                    >
                      {fn}
                    </span>
                  ))}
                </div>
                <p className="text-[11px] text-emerald-900/80 dark:text-emerald-200/80">
                  व्यापार, मित्रता व विवाह के लिए सर्वश्रेष्ठ।
                </p>
              </div>

              {/* Neutral */}
              <div className="p-3.5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/25 border border-amber-500/40 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-300">
                  <span>✦</span>
                  <span>सम अंक (तटस्थ / सामान्य)</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {mulankData.neutralNumbers.map((nn) => (
                    <span
                      key={nn}
                      className="w-8 h-8 rounded-xl bg-amber-600 text-white font-black text-sm flex items-center justify-center shadow-xs"
                      title={NUMBER_DATA[nn]?.planet}
                    >
                      {nn}
                    </span>
                  ))}
                </div>
                <p className="text-[11px] text-amber-900/80 dark:text-amber-200/80">
                  दैनिक जीवन में सामान्य व निष्पक्ष परिणाम।
                </p>
              </div>

              {/* Enemy */}
              <div className="p-3.5 rounded-2xl bg-rose-50/80 dark:bg-rose-950/25 border border-rose-500/40 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-rose-800 dark:text-rose-300">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>शत्रु अंक (सावधानी आवश्यक)</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {mulankData.enemyNumbers.length > 0 ? (
                    mulankData.enemyNumbers.map((en) => (
                      <span
                        key={en}
                        className="w-8 h-8 rounded-xl bg-rose-600 text-white font-black text-sm flex items-center justify-center shadow-xs"
                        title={NUMBER_DATA[en]?.planet}
                      >
                        {en}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-rose-700 font-bold">कोई प्रत्यक्ष शत्रु अंक नहीं</span>
                  )}
                </div>
                <p className="text-[11px] text-rose-900/80 dark:text-rose-200/80">
                  महत्वपूर्ण अनुबंधों व साझेदारी में सावधानी रखें।
                </p>
              </div>
            </div>

            {/* Comprehensive Lucky Parameters Table */}
            <div className="p-4 rounded-2xl bg-[#FAF5ED] dark:bg-[#1E0F07] border border-[#8C6239]/20 space-y-3">
              <h4 className="text-xs font-bold font-granth text-[#8C4A00] uppercase tracking-wider">
                🌟 मूलांक {mulank} के सम्पूर्ण लकी पैरामीटर्स:
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="flex justify-between py-1 border-b border-[#8C6239]/15">
                  <span className="text-[#8C6239] font-medium">शुभ रंग (Lucky Colors):</span>
                  <span className="font-bold text-[#5C3A21] dark:text-[#FFD88A]">{mulankData.luckyColors.join(', ')}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#8C6239]/15">
                  <span className="text-[#8C6239] font-medium">शुभ वार (Lucky Days):</span>
                  <span className="font-bold text-[#5C3A21] dark:text-[#FFD88A]">{mulankData.luckyDays.join(', ')}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#8C6239]/15">
                  <span className="text-[#8C6239] font-medium">शुभ तारीखें (Auspicious Dates):</span>
                  <span className="font-bold text-[#5C3A21] dark:text-[#FFD88A]">प्रत्येक माह की {mulankData.luckyDates.join(', ')}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#8C6239]/15">
                  <span className="text-[#8C6239] font-medium">शुभ रत्न (Gemstone):</span>
                  <span className="font-bold text-[#5C3A21] dark:text-[#FFD88A]">{mulankData.luckyGem} ({mulankData.subGem})</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#8C6239]/15">
                  <span className="text-[#8C6239] font-medium">शुभ रुद्राक्ष:</span>
                  <span className="font-bold text-[#5C3A21] dark:text-[#FFD88A]">{mulankData.rudraksha}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#8C6239]/15">
                  <span className="text-[#8C6239] font-medium">अनुकूल जल पात्र:</span>
                  <span className="font-bold text-[#5C3A21] dark:text-[#FFD88A]">{mulankData.waterBottleColor}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Consultation Assistance Banner */}
      {onOpenUmaWithQuery && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-yellow-400/10 to-amber-500/15 border border-amber-500/30 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-stone-900 text-amber-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 fill-amber-400" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#5C3A21] dark:text-[#FFD88A]">
                अंक ज्योतिष पर विशेष प्रश्न पूछना चाहते हैं?
              </h4>
              <p className="text-[10px] text-[#735133] dark:text-stone-300">
                उमा AI से अपने मूलांक {mulank} और भाग्यांक {bhagyank} के आधार पर व्यक्तिगत परामर्श लें
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onOpenUmaWithQuery(`मेरे मूलांक ${mulank} और भाग्यांक ${bhagyank} के अनुसार मेरे लिए करियर और विवाह के सर्वश्रेष्ठ उपाय बताएं।`)}
            className="px-3 py-1.5 rounded-xl bg-[#5C3A21] hover:bg-[#462B17] text-[#FAF2E4] text-xs font-bold transition cursor-pointer shadow-xs active:scale-95"
          >
            उमा से पूछें →
          </button>
        </div>
      )}
    </div>
  );
};
