import React, { useState, useMemo } from 'react';
import { KundaliData } from '../types';
import {
  calculateMulank,
  calculateBhagyank,
  calculateNamank,
  calculateKuaNumber,
  calculatePersonalYear,
  calculateLoshuGrid,
  NUMBER_DATA,
  MISSING_NUMBER_REMEDIES,
  reduceToSingleDigit,
} from '../services/numerology';
import { synthesizeNumerologyVerdict } from '../lib/uma';
import { umaVoice } from '../services/UmaVoiceService';
import {
  Sparkles,
  Hash,
  Calculator,
  Grid,
  PhoneCall,
  Calendar,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  Volume2,
  VolumeX,
  Share2,
  Send,
  MessageSquare,
} from 'lucide-react';
import { useLanguage } from '../i18n';
import { UniversalStoryDeck, StorySlideItem } from './UniversalStoryDeck';

interface NumerologyViewProps {
  activeKundali?: KundaliData | null;
  onOpenKundaliTab?: () => void;
  onOpenUmaWithQuery?: (query: string) => void;
  onPrevChapter?: () => void;
  onNextChapter?: () => void;
}

type NumerologyTab = 'profile' | 'name_calc' | 'loshu' | 'vehicle_mobile' | 'yearly' | 'uma_ank' | 'stories';

type UmaAnkTopic = 'full' | 'spelling' | 'loshu_remedy' | 'mobile_vehicle' | 'career_wealth';

export const NumerologyView: React.FC<NumerologyViewProps> = ({
  activeKundali,
  onOpenUmaWithQuery,
  onPrevChapter,
  onNextChapter,
}) => {
  const { language, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<NumerologyTab>('profile');
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);

  // Custom User Input States
  const [inputName, setInputName] = useState<string>(activeKundali?.name || '');
  const [inputDay, setInputDay] = useState<number>(() => {
    if (activeKundali?.birthDate) {
      const d = new Date(activeKundali.birthDate);
      if (!isNaN(d.getTime())) return d.getDate();
    }
    return 28;
  });
  const [inputMonth, setInputMonth] = useState<number>(() => {
    if (activeKundali?.birthDate) {
      const d = new Date(activeKundali.birthDate);
      if (!isNaN(d.getTime())) return d.getMonth() + 1;
    }
    return 10;
  });
  const [inputYear, setInputYear] = useState<number>(() => {
    if (activeKundali?.birthDate) {
      const d = new Date(activeKundali.birthDate);
      if (!isNaN(d.getTime())) return d.getFullYear();
    }
    return 1995;
  });
  const [gender, setGender] = useState<'male' | 'female'>('male');

  // Name Calc state
  const [calcName, setCalcName] = useState<string>(activeKundali?.name || '');
  const [calcSystem, setCalcSystem] = useState<'chaldean' | 'pythagorean'>('chaldean');

  // Mobile / Vehicle Calc state
  const [mobileNum, setMobileNum] = useState<string>('9876543210');
  const [vehicleNum, setVehicleNum] = useState<string>('MH01AB1234');

  // Offline UMA Ank Paramarsh state
  const [umaTopic, setUmaTopic] = useState<UmaAnkTopic>('full');
  const [customAnkQuestion, setCustomAnkQuestion] = useState<string>('');
  const [submittedCustomQuestion, setSubmittedCustomQuestion] = useState<string>('');
  const [isSpeakingUma, setIsSpeakingUma] = useState<boolean>(false);

  // Perform Numerology calculations
  const mulankNum = calculateMulank(inputDay);
  const bhagyankNum = calculateBhagyank(inputDay, inputMonth, inputYear);
  const namankData = calculateNamank(inputName, 'chaldean');
  const kuaNum = calculateKuaNumber(inputYear, gender);
  const personalYear = calculatePersonalYear(inputDay, inputMonth, new Date().getFullYear());
  const loshu = calculateLoshuGrid(inputDay, inputMonth, inputYear);

  const mulank = NUMBER_DATA[mulankNum] || NUMBER_DATA[1];
  const bhagyank = NUMBER_DATA[bhagyankNum] || NUMBER_DATA[1];
  const namank = NUMBER_DATA[namankData.single] || NUMBER_DATA[1];

  // Mobile & Vehicle evaluation
  const mobileDigitsSum = useMemo(() => {
    const digits = mobileNum.replace(/\D/g, '');
    let sum = 0;
    for (const d of digits) sum += parseInt(d, 10) || 0;
    return reduceToSingleDigit(sum);
  }, [mobileNum]);

  const vehicleDigitsSum = useMemo(() => {
    const cleaned = vehicleNum.toUpperCase().replace(/[^A-Z0-9]/g, '');
    let sum = 0;
    for (const ch of cleaned) {
      if (/[0-9]/.test(ch)) sum += parseInt(ch, 10);
      else if (/[A-Z]/.test(ch)) {
        const val = calculateNamank(ch, 'chaldean').single;
        sum += val;
      }
    }
    return reduceToSingleDigit(sum);
  }, [vehicleNum]);

  const isMobileFriendly = mulank.friendlyNumbers.includes(mobileDigitsSum);
  const isVehicleFriendly = mulank.friendlyNumbers.includes(vehicleDigitsSum);

  // Build rich contextual query for UMA Assistant Modal
  const buildFullNumerologyPrompt = (extraQuestion?: string) => {
    const base = `अंक ज्योतिष परामर्श: मेरा नाम ${inputName}, जन्म तिथि ${String(inputDay).padStart(2, '0')}/${String(inputMonth).padStart(2, '0')}/${inputYear} (${gender === 'male' ? 'पुरुष' : 'स्त्री'}), मूलांक ${mulankNum} (${mulank.planet}), भाग्यांक ${bhagyankNum} (${bhagyank.planet}), नामांक ${namankData.single} (संयुक्त अंक ${namankData.compound}), कुआं अंक ${kuaNum}, मोबाइल नंबर ${mobileNum}, वाहन नंबर ${vehicleNum} है।`;
    return extraQuestion
      ? `${base} प्रश्न: ${extraQuestion}`
      : `${base} मेरे मूलांक, भाग्यांक, नामांक स्पेलिंग सुधार, लो-शू चक्र राजयोग व अनुपस्थित अंकों के उपाय का पूर्ण फलादेश बताएं।`;
  };

  // Offline deterministic UMA Ank-Jyotish consultation report
  const offlineUmaReport = useMemo(() => {
    const targetName = activeTab === 'name_calc' && calcName.trim() ? calcName.trim() : inputName.trim() || 'YAJAMAN';
    const baseQuery = `नाम: ${targetName}, जन्म: ${String(inputDay).padStart(2, '0')}/${String(inputMonth).padStart(2, '0')}/${inputYear}, ${gender === 'male' ? 'पुरुष' : 'स्त्री'}, मोबाइल: ${mobileNum}, वाहन: ${vehicleNum}। ${submittedCustomQuestion || ''}`;
    const fullVerdict = synthesizeNumerologyVerdict(baseQuery, activeKundali);
    return fullVerdict.text.split('---')[0].trim();
  }, [inputName, calcName, activeTab, inputDay, inputMonth, inputYear, gender, mobileNum, vehicleNum, submittedCustomQuestion, activeKundali]);

  // Topic-focused quick insights on Top of the Offline UMA Report
  const topicQuickCard = useMemo(() => {
    const targetName = inputName.trim() || 'YAJAMAN';
    const cRes = calculateNamank(targetName, 'chaldean');
    const isNameFriendly = mulank.friendlyNumbers.includes(cRes.single) || bhagyank.friendlyNumbers.includes(cRes.single);

    if (umaTopic === 'spelling') {
      return {
        title: `🔤 नाम स्पेलिंग एवं हस्ताक्षर निर्णय (${targetName})`,
        summary: `कॉल्डियन संयुक्त अंक: ${cRes.compound} → एकल नामांक: ${cRes.single} (${NUMBER_DATA[cRes.single]?.planet})`,
        detail: isNameFriendly
          ? `बधाई हो! आपका वर्तमान नामांक (${cRes.single}) आपके मूलांक ${mulankNum} व भाग्यांक ${bhagyankNum} के पूर्णतः अनुकूल है। हस्ताक्षर में पहला अक्षर बड़ा रखें, नीचे बाएं से दाएं ऊपर उठती हुई रेखा खींचें और अंत में एक बिंदु (.) लगाएं।`
          : `आपका वर्तमान नामांक (${cRes.single}) आपके मूलांक ${mulankNum} के मित्र अंकों (${mulank.friendlyNumbers.join(', ')}) से भिन्न है। नीचे दिए गए उमा के ५वें बिंदु में सुझाए गए शुभ अक्षर (A, I, E, N, S) जोड़कर अपने नामांक को मित्र अंक पर स्थापित करें।`,
      };
    }
    if (umaTopic === 'loshu_remedy') {
      return {
        title: `📐 लो-शू चक्र राजयोग एवं अनुपस्थित अंक निवारण`,
        summary: `उपस्थित अंक: ${[1, 2, 3, 4, 5, 6, 7, 8, 9].filter((n) => (loshu.counts[n] || 0) > 0).join(', ')} | अनुपस्थित: ${loshu.missingNumbers.join(', ') || 'कोई नहीं'}`,
        detail: `${loshu.goldenRajYoga ? '✨ आपकी जन्मतिथि में स्वर्ण राजयोग (4-5-6) पूर्ण है! ' : ''}${loshu.silverRajYoga ? '🥈 आपकी जन्मतिथि में रजत राजयोग (2-5-8) पूर्ण है! ' : ''}अनुपस्थित अंकों की ऊर्जा पूर्ति हेतु कुआं अंक ${kuaNum} को बाएं हाथ की कलाई पर लिखें और नीचे दिए गए तत्व-उपाय अपनाएं।`,
      };
    }
    if (umaTopic === 'mobile_vehicle') {
      return {
        title: `📱 मोबाइल (${mobileNum}) एवं 🚗 वाहन (${vehicleNum}) अनुकूलता`,
        summary: `मोबाइल एकल अंक: ${mobileDigitsSum} (${isMobileFriendly ? 'शुभ ✓' : 'सामान्य ⚠️'}) | वाहन एकल अंक: ${vehicleDigitsSum} (${isVehicleFriendly ? 'शुभ ✓' : 'सामान्य ⚠️'})`,
        detail: `मूलांक ${mulankNum} व भाग्यांक ${bhagyankNum} के जातकों के लिए मोबाइल व वाहन के अंतिम ४ अंकों या कुल योग का ${mulank.friendlyNumbers.join(', ')} होना सर्वाधिक भाग्योदयकारी होता है। शत्रु अंक (${mulank.enemyNumbers.join(', ') || '8'}) के कुल योग से बचें।`,
      };
    }
    if (umaTopic === 'career_wealth') {
      return {
        title: `💼 करियर, धन कोष एवं व्यक्तिगत वर्ष (${new Date().getFullYear()})`,
        summary: `व्यक्तिगत वर्ष अंक: ${personalYear.yearNum} — ${personalYear.theme}`,
        detail: `आपके मूलांक ${mulankNum} (${mulank.planet}) व भाग्यांक ${bhagyankNum} (${bhagyank.planet}) के अनुसार ${mulank.careers.concat(bhagyank.careers).slice(0, 6).join(', ')} में उच्च सफलता के योग हैं। ${personalYear.advice}`,
      };
    }
    return {
      title: `✨ विदुषी उमा का पंच-स्तरीय अंक-ज्योतिष निर्णय`,
      summary: `मूलांक ${mulankNum} (${mulank.planet.split(' ')[0]}) • भाग्यांक ${bhagyankNum} (${bhagyank.planet.split(' ')[0]}) • नामांक ${namankData.single} • कुआं अंक ${kuaNum}`,
      detail: `जन्म तिथि ${inputDay}/${inputMonth}/${inputYear} एवं नाम «${targetName}» की १००% ऑफ़लाइन वैदिक व कीरो अंक-गणना नीचे प्रस्तुत है:`,
    };
  }, [umaTopic, inputName, inputDay, inputMonth, inputYear, mulankNum, bhagyankNum, mulank, bhagyank, namankData, kuaNum, loshu, mobileNum, vehicleNum, mobileDigitsSum, vehicleDigitsSum, isMobileFriendly, isVehicleFriendly, personalYear]);

  const handleToggleSpeakUma = async () => {
    if (isSpeakingUma) {
      umaVoice.stop();
      setIsSpeakingUma(false);
      return;
    }
    setIsSpeakingUma(true);
    try {
      await umaVoice.speak(`${topicQuickCard.title}। ${topicQuickCard.detail}। ${offlineUmaReport}`, {
        voiceStyle: 'uma',
        rate: 0.94,
        pitch: 1.04,
        onStart: () => setIsSpeakingUma(true),
        onEnd: () => setIsSpeakingUma(false),
        onError: () => setIsSpeakingUma(false),
      });
    } finally {
      setIsSpeakingUma(false);
    }
  };

  const handleShareAnkReport = () => {
    const shareText = `🔢 *सनातन शक्ति पंचांग — विदुषी उमा अंक-ज्योतिष निर्णय*\n👤 नाम: ${inputName} | जन्म तिथि: ${inputDay}/${inputMonth}/${inputYear}\n🌟 मूलांक: ${mulankNum} | भाग्यांक: ${bhagyankNum} | नामांक: ${namankData.single} | कुआं अंक: ${kuaNum}\n\n${offlineUmaReport}`;
    const url = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const slides: StorySlideItem[] = [
    {
      id: 'core-numbers',
      title: `${inputName} — वैदिक अंक शास्त्र`,
      subtitle: `जन्म: ${inputDay}/${inputMonth}/${inputYear}`,
      badge: `मूलांक ${mulank.number} • भाग्यांक ${bhagyank.number}`,
      icon: '🔢',
      voiceText: `आपका मूलांक ${mulank.number} और भाग्यांक ${bhagyank.number} है। स्वामी ग्रह: ${mulank.planet}।`,
      content: (
        <div className="h-full flex flex-col justify-between py-1 space-y-2">
          <div className="p-3.5 rounded-2xl bg-amber-50/90 border-2 border-amber-300 shadow-xs space-y-2 my-auto text-xs">
            <div className="grid grid-cols-3 gap-1.5 text-center">
              <div className="p-2 rounded-xl bg-white border border-amber-200">
                <div className="text-[10px] text-[#8C6239] font-bold">मूलांक (Driver)</div>
                <div className="text-xl font-black text-[#5C3A21]">{mulank.number}</div>
                <div className="text-[9px] text-amber-800">{mulank.planet.split(' ')[0]}</div>
              </div>
              <div className="p-2 rounded-xl bg-white border border-amber-200">
                <div className="text-[10px] text-[#8C6239] font-bold">भाग्यांक (Conductor)</div>
                <div className="text-xl font-black text-[#5C3A21]">{bhagyank.number}</div>
                <div className="text-[9px] text-amber-800">{bhagyank.planet.split(' ')[0]}</div>
              </div>
              <div className="p-2 rounded-xl bg-white border border-amber-200">
                <div className="text-[10px] text-[#8C6239] font-bold">नामांक (Name)</div>
                <div className="text-xl font-black text-[#5C3A21]">{namankData.single}</div>
                <div className="text-[9px] text-amber-800">{namank.planet.split(' ')[0]}</div>
              </div>
            </div>

            <div className="p-2 rounded-xl bg-white border border-amber-200">
              <div className="font-bold text-[#5C3A21]">🌟 स्वभाव एवं विशेषताएँ:</div>
              <p className="text-[11px] text-[#6E472A] mt-0.5 leading-snug">
                {mulank.nature}
              </p>
            </div>
          </div>
          <div className="text-[10px] text-center text-[#8C6239]">
            शुभ अंक: {mulank.friendlyNumbers.join(', ')} • शुभ रंग: {mulank.luckyColors.join(', ')}
          </div>
        </div>
      ),
    },
    {
      id: 'loshu-grid',
      title: 'लो-शू ग्रिड (Lo Shu Magic Grid)',
      subtitle: '3x3 वैदिक अंक चक्र व तत्व विश्लेषण',
      badge: 'ऊर्जा चक्र',
      icon: '📐',
      voiceText: 'लो-शू ग्रिड 3x3 अंक चक्र।',
      content: (
        <div className="h-full flex flex-col justify-between py-1 space-y-2">
          <div className="p-3 rounded-2xl bg-white/95 border border-amber-300 my-auto space-y-2">
            <div className="grid grid-cols-3 gap-1.5 max-w-[200px] mx-auto text-center font-mono text-sm font-black">
              {[4, 9, 2, 3, 5, 7, 8, 1, 6].map((num) => {
                const count = loshu.counts[num] || 0;
                return (
                  <div
                    key={num}
                    className={`h-12 rounded-xl flex flex-col items-center justify-center border ${
                      count > 0
                        ? 'bg-amber-100 border-amber-500 text-[#462B17]'
                        : 'bg-stone-50 border-stone-200 text-stone-300'
                    }`}
                  >
                    <span>{num}</span>
                    {count > 0 && <span className="text-[8px] text-amber-800">x{count}</span>}
                  </div>
                );
              })}
            </div>
          </div>
          <div className="text-[10px] text-center text-[#8C6239]">
            लो-शू ग्रिड आपके जीवन के विचार, इच्छा और कर्म शक्ति का प्रतिनिधित्व करता है।
          </div>
        </div>
      ),
    },
  ];

  if (activeTab === 'stories') {
    return (
      <div className="h-full w-full flex flex-col min-h-0 relative">
        <div className="p-2 bg-amber-50 border-b border-amber-200 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className="text-xs font-bold text-amber-900 bg-white px-3 py-1.5 rounded-lg border border-amber-300 flex items-center gap-1"
          >
            ← अंक ज्योतिष मुख्य पृष्ठ
          </button>
          <span className="text-xs font-black text-[#5C3A21]">स्टोरी व्यू</span>
        </div>
        <div className="flex-1 min-h-0">
          <UniversalStoryDeck
            slides={slides}
            currentSlideIndex={activeSlideIndex}
            onSlideIndexChange={setActiveSlideIndex}
            headerTitle="अंक ज्योतिष (Numerology)"
            headerIcon="🔢"
            chapterNumber={14}
            onOpenUma={() => setActiveTab('uma_ank')}
            onPrevChapter={onPrevChapter}
            onNextChapter={onNextChapter}
            prevChapterLabel="ग्रह उपाय"
            nextChapterLabel="हस्तरेखा"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-0 flex flex-col bg-[#FAF6EE] text-[#3E2714] overflow-hidden">
      {/* Top Header Controls (Compact on mobile to maximize prediction area) */}
      <div className="shrink-0 px-2.5 py-2 bg-white border-b border-amber-200 shadow-xs flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-lg sm:text-xl shrink-0">🔢</span>
            <div className="min-w-0">
              <h1 className="text-xs sm:text-base font-black text-[#5C3A21] font-granth leading-tight truncate">
                वैदिक अंक ज्योतिष एवं लो-शू चक्र
              </h1>
              <p className="text-[10px] text-[#8C6239] font-medium truncate">
                {inputName} ({inputDay}/{inputMonth}/{inputYear}) • मूलांक {mulankNum} • भाग्यांक {bhagyankNum}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('uma_ank')}
              className="px-2 py-1 rounded-lg bg-[#7A1D1D] text-[#FFD88A] text-[11px] font-bold flex items-center gap-1 shadow-xs hover:bg-[#5C1414] transition cursor-pointer"
            >
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>उमा अंक निर्णय</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('stories')}
              className="px-2 py-1 rounded-lg bg-amber-500 text-white text-[11px] font-bold flex items-center gap-1 shadow-xs hover:bg-amber-600 transition cursor-pointer"
            >
              <BookOpen className="w-3 h-3" />
              <span className="hidden sm:inline">स्टोरी व्यू</span>
            </button>
          </div>
        </div>

        {/* Compact Input Bar for Quick Date/Name (2 compact rows on mobile, 1 row on desktop) */}
        <div className="grid grid-cols-12 gap-1.5 bg-amber-50/80 px-2 py-1.5 rounded-xl border border-amber-200/80 text-xs items-end">
          <div className="col-span-7 sm:col-span-4">
            <label className="block text-[9px] font-bold text-[#8C6239] leading-none mb-0.5">नाम (Name):</label>
            <input
              type="text"
              value={inputName}
              onChange={(e) => setInputName(e.target.value)}
              className="w-full px-2 py-1 rounded-lg border border-amber-300 bg-white font-bold text-[#5C3A21] uppercase focus:outline-none text-[11px]"
            />
          </div>

          <div className="col-span-5 sm:col-span-2 flex items-center gap-1">
            <button
              type="button"
              onClick={() => setGender('male')}
              className={`flex-1 py-1 rounded-lg text-[10px] font-bold border transition cursor-pointer ${
                gender === 'male' ? 'bg-[#5C3A21] text-amber-200 border-[#5C3A21]' : 'bg-white text-stone-600 border-amber-200'
              }`}
            >
              पुरुष
            </button>
            <button
              type="button"
              onClick={() => setGender('female')}
              className={`flex-1 py-1 rounded-lg text-[10px] font-bold border transition cursor-pointer ${
                gender === 'female' ? 'bg-[#5C3A21] text-amber-200 border-[#5C3A21]' : 'bg-white text-stone-600 border-amber-200'
              }`}
            >
              स्त्री
            </button>
          </div>

          <div className="col-span-12 sm:col-span-6 grid grid-cols-3 gap-1.5">
            <div>
              <label className="block text-[9px] font-bold text-[#8C6239] leading-none mb-0.5">दिन:</label>
              <select
                value={inputDay}
                onChange={(e) => setInputDay(parseInt(e.target.value, 10))}
                className="w-full px-1.5 py-1 rounded-lg border border-amber-300 bg-white font-bold text-[#5C3A21] focus:outline-none text-[11px]"
              >
                {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[9px] font-bold text-[#8C6239] leading-none mb-0.5">माह:</label>
              <select
                value={inputMonth}
                onChange={(e) => setInputMonth(parseInt(e.target.value, 10))}
                className="w-full px-1.5 py-1 rounded-lg border border-amber-300 bg-white font-bold text-[#5C3A21] focus:outline-none text-[11px]"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[9px] font-bold text-[#8C6239] leading-none mb-0.5">वर्ष:</label>
              <input
                type="number"
                value={inputYear}
                onChange={(e) => setInputYear(parseInt(e.target.value, 10) || 1995)}
                className="w-full px-1.5 py-1 rounded-lg border border-amber-300 bg-white font-bold text-[#5C3A21] focus:outline-none text-[11px]"
              />
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pt-1 border-t border-amber-100">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition flex items-center gap-1 cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-[#B56A00] text-white shadow-xs'
                : 'bg-amber-50 text-[#5C3A21] hover:bg-amber-100'
            }`}
          >
            <Hash className="w-3.5 h-3.5" />
            <span>अंक फलादेश</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('uma_ank')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition flex items-center gap-1 cursor-pointer ${
              activeTab === 'uma_ank'
                ? 'bg-[#7A1D1D] text-[#FFD88A] shadow-xs'
                : 'bg-rose-50 text-[#7A1D1D] border border-[#7A1D1D]/20 hover:bg-rose-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>🔮 उमा अंक परामर्श</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('name_calc')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition flex items-center gap-1 cursor-pointer ${
              activeTab === 'name_calc'
                ? 'bg-[#B56A00] text-white shadow-xs'
                : 'bg-amber-50 text-[#5C3A21] hover:bg-amber-100'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>नामांक कैलकुलेटर</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('loshu')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition flex items-center gap-1 cursor-pointer ${
              activeTab === 'loshu'
                ? 'bg-[#B56A00] text-white shadow-xs'
                : 'bg-amber-50 text-[#5C3A21] hover:bg-amber-100'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>लो-शू चक्र व राजयोग</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('vehicle_mobile')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition flex items-center gap-1 cursor-pointer ${
              activeTab === 'vehicle_mobile'
                ? 'bg-[#B56A00] text-white shadow-xs'
                : 'bg-amber-50 text-[#5C3A21] hover:bg-amber-100'
            }`}
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>मोबाइल व वाहन अंक</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('yearly')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition flex items-center gap-1 cursor-pointer ${
              activeTab === 'yearly'
                ? 'bg-[#B56A00] text-white shadow-xs'
                : 'bg-amber-50 text-[#5C3A21] hover:bg-amber-100'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>व्यक्तिगत वर्ष</span>
          </button>
        </div>
      </div>

      {/* Main View Area */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-3 space-y-4">
        {/* TAB 1: CORE NUMBERS PROFILE */}
        {activeTab === 'profile' && (
          <div className="space-y-3">
            {/* 4 Core Numbers Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="p-3 rounded-2xl bg-white border-2 border-amber-300 shadow-xs text-center">
                <span className="text-[10px] text-[#8C6239] font-bold uppercase">मूलांक (Driver)</span>
                <div className="text-2xl font-black text-[#5C3A21]">{mulankNum}</div>
                <span className="text-[10px] text-amber-800 font-bold">{mulank.planet.split(' ')[0]}</span>
              </div>

              <div className="p-3 rounded-2xl bg-white border-2 border-amber-300 shadow-xs text-center">
                <span className="text-[10px] text-[#8C6239] font-bold uppercase">भाग्यांक (Conductor)</span>
                <div className="text-2xl font-black text-[#5C3A21]">{bhagyankNum}</div>
                <span className="text-[10px] text-amber-800 font-bold">{bhagyank.planet.split(' ')[0]}</span>
              </div>

              <div className="p-3 rounded-2xl bg-white border-2 border-amber-300 shadow-xs text-center">
                <span className="text-[10px] text-[#8C6239] font-bold uppercase">नामांक (Name)</span>
                <div className="text-2xl font-black text-[#5C3A21]">{namankData.single}</div>
                <span className="text-[10px] text-amber-800 font-bold">{namank.planet.split(' ')[0]}</span>
              </div>

              <div className="p-3 rounded-2xl bg-white border-2 border-amber-300 shadow-xs text-center">
                <span className="text-[10px] text-[#8C6239] font-bold uppercase">कुआं अंक (Kua)</span>
                <div className="text-2xl font-black text-[#5C3A21]">{kuaNum}</div>
                <span className="text-[10px] text-amber-800 font-bold">ऊर्जा अंक</span>
              </div>
            </div>

            {/* Detailed Moolank Breakdown */}
            <div className="p-4 rounded-2xl bg-white border border-amber-200/90 shadow-xs space-y-3">
              <div className="border-b border-amber-100 pb-2 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-black text-[#5C3A21] font-granth">
                    मूलांक {mulankNum} फलादेश — {mulank.planet}
                  </h2>
                  <p className="text-xs text-[#8C6239]">
                    देवता: <strong>{mulank.deity}</strong> • तत्व: <strong>{mulank.element}</strong>
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold">
                  जप: {mulank.japaCount}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 space-y-1">
                  <div className="font-bold text-[#5C3A21]">🌟 स्वभाव एवं प्रकृति:</div>
                  <p className="text-[11px] text-[#6E472A] leading-relaxed">{mulank.nature}</p>
                </div>

                <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200 space-y-1">
                  <div className="font-bold text-emerald-900">💼 उपयुक्त आजीविका/करियर:</div>
                  <p className="text-[11px] text-emerald-950">{mulank.careers.join(', ')}</p>
                </div>
              </div>

              {/* Lucky Gem, Colors, Dates & Remedies */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200">
                  <span className="font-bold text-[#8C6239]">मित्र व शत्रु अंक:</span>
                  <div className="text-[11px] text-[#3E2714] mt-0.5">
                    मित्र: <strong>{mulank.friendlyNumbers.join(', ')}</strong> <br />
                    शत्रु: <strong>{mulank.enemyNumbers.length > 0 ? mulank.enemyNumbers.join(', ') : 'कोई नहीं'}</strong>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200">
                  <span className="font-bold text-[#8C6239]">शुभ रंग व दिन:</span>
                  <div className="text-[11px] text-[#3E2714] mt-0.5">
                    रंग: {mulank.luckyColors.join(', ')} <br />
                    दिन: {mulank.luckyDays.join(', ')}
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200">
                  <span className="font-bold text-[#8C6239]">रत्न व रुद्राक्ष:</span>
                  <div className="text-[11px] text-[#3E2714] mt-0.5">
                    रत्न: {mulank.luckyGem} <br />
                    रुद्राक्ष: {mulank.rudraksha}
                  </div>
                </div>
              </div>

              {/* Mantra & Water Therapy */}
              <div className="p-3 rounded-xl bg-[#5C3A21] text-amber-200 text-xs space-y-1">
                <div className="font-bold flex items-center gap-1 text-amber-300">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>वैदिक सिद्ध मंत्र:</span>
                </div>
                <p className="font-granth text-sm font-black text-white">{mulank.mantra}</p>
                <p className="text-[10px] text-amber-200/80">
                  जल चिकित्सा: {mulank.waterBottleColor} में जल भरकर सूर्य स्नान कराएं व सेवन करें।
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB: UMA ANK JYOTISH OFFLINE + ONLINE CONSULTATION */}
        {activeTab === 'uma_ank' && (
          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#FFFDF8] via-[#FAF2E4] to-[#F4E8D1] border-2 border-[#B58738] shadow-md space-y-3">
              {/* Header */}
              <div className="flex items-center justify-between flex-wrap gap-2 border-b border-[#8C6239]/30 pb-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7A1D1D] to-[#4A1010] text-[#FFD88A] border-2 border-[#B58738] flex items-center justify-center font-black text-base shadow-sm">
                    ॐ
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-sm sm:text-base font-black text-[#7A1D1D] font-granth">
                        विदुषी उमा — सूक्ष्म अंक-ज्योतिष परामर्श
                      </h2>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-700 text-white text-[10px] font-bold">
                        100% ऑफ़लाइन + ऑनलाइन गणना सक्रिय
                      </span>
                    </div>
                    <p className="text-[11px] text-[#5C3A21] font-serif">
                      जातक: <strong>{inputName}</strong> • जन्म तिथि: <strong>{inputDay}/{inputMonth}/{inputYear}</strong> • मूलांक <strong>{mulankNum}</strong> • भाग्यांक <strong>{bhagyankNum}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleToggleSpeakUma}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 border transition cursor-pointer ${
                      isSpeakingUma
                        ? 'bg-[#7A1D1D] text-white border-[#7A1D1D]'
                        : 'bg-white text-[#5C3A21] border-amber-300 hover:bg-amber-50'
                    }`}
                  >
                    {isSpeakingUma ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                    <span>{isSpeakingUma ? 'रोकें' : 'उमा वाणी सुनें'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleShareAnkReport}
                    className="px-2.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>शेयर करें</span>
                  </button>
                </div>
              </div>

              {/* Topic Selector Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                {[
                  { id: 'full', label: '✨ सम्पूर्ण अंक फलादेश' },
                  { id: 'spelling', label: '🔤 नाम स्पेलिंग सुधार' },
                  { id: 'loshu_remedy', label: '📐 लो-शू राजयोग व उपाय' },
                  { id: 'mobile_vehicle', label: '📱 मोबाइल व वाहन अंक' },
                  { id: 'career_wealth', label: '💼 करियर व व्यक्तिगत वर्ष' },
                ].map((tItem) => (
                  <button
                    key={tItem.id}
                    type="button"
                    onClick={() => setUmaTopic(tItem.id as UmaAnkTopic)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold shrink-0 transition cursor-pointer border ${
                      umaTopic === tItem.id
                        ? 'bg-[#7A1D1D] text-[#FFD88A] border-[#7A1D1D] shadow-xs'
                        : 'bg-white text-[#5C3A21] border-amber-300 hover:bg-amber-50'
                    }`}
                  >
                    {tItem.label}
                  </button>
                ))}
              </div>

              {/* Highlighted Topic Card */}
              <div className="p-3.5 rounded-xl bg-amber-100/80 border-2 border-amber-400 space-y-1">
                <div className="text-xs sm:text-sm font-black text-[#7A1D1D] font-granth">
                  {topicQuickCard.title}
                </div>
                <div className="text-xs font-bold text-[#5C3A21]">
                  {topicQuickCard.summary}
                </div>
                <p className="text-xs text-[#3E2714] leading-relaxed font-serif">
                  {topicQuickCard.detail}
                </p>
              </div>

              {/* Ask Custom Numerology Question (Instant Offline + Online) */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (customAnkQuestion.trim()) {
                    setSubmittedCustomQuestion(customAnkQuestion.trim());
                  }
                }}
                className="flex items-center gap-2 bg-white p-2 rounded-xl border border-amber-300"
              >
                <input
                  type="text"
                  value={customAnkQuestion}
                  onChange={(e) => setCustomAnkQuestion(e.target.value)}
                  placeholder="अंक ज्योतिष प्रश्न लिखें (उदा: मेरा लकी नंबर, नाम स्पेलिंग या व्यापार अंक क्या है?)..."
                  className="flex-1 text-xs text-[#3E2714] bg-transparent focus:outline-none px-1"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg bg-[#7A1D1D] hover:bg-[#5C1414] text-[#FFD88A] text-xs font-bold flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  <Send className="w-3 h-3" />
                  <span>गणना करें</span>
                </button>
              </form>

              {/* Complete 5-Part Deterministic UMA Ank Jyotish Report */}
              <div className="p-4 rounded-xl bg-white border border-amber-200 shadow-inner font-serif text-xs sm:text-sm leading-relaxed text-[#3E2714] whitespace-pre-line">
                {offlineUmaReport}
              </div>

              {/* Optional Open Full UMA Chat Modal with Full Context */}
              {onOpenUmaWithQuery && (
                <div className="pt-1 flex items-center justify-between flex-wrap gap-2">
                  <span className="text-[11px] text-[#8C6239] font-serif">
                    क्या आप उमा के मुख्य संवाद कक्ष में वॉइस/PDF रिपोर्ट के साथ पूछना चाहते हैं?
                  </span>
                  <button
                    type="button"
                    onClick={() => onOpenUmaWithQuery(buildFullNumerologyPrompt(customAnkQuestion.trim() || undefined))}
                    className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#7A1D1D] to-[#942626] text-[#FFD88A] text-xs font-bold flex items-center gap-1.5 shadow-sm hover:from-[#5C1414] hover:to-[#7A1D1D] transition cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-amber-300" />
                    <span>उमा संवाद कक्ष में विस्तृत अंक-रिपोर्ट खोलें</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: NAME NUMEROLOGY CALCULATOR (नामांक) */}
        {activeTab === 'name_calc' && (
          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-white border-2 border-amber-300 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-amber-100 pb-2">
                <div className="flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-amber-600" />
                  <h2 className="text-sm font-black text-[#5C3A21]">
                    अंक विज्ञान नामांक कैलकुलेटर
                  </h2>
                </div>

                <div className="flex items-center gap-1 text-xs">
                  <button
                    type="button"
                    onClick={() => setCalcSystem('chaldean')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                      calcSystem === 'chaldean'
                        ? 'bg-[#5C3A21] text-amber-200'
                        : 'bg-amber-100 text-stone-700'
                    }`}
                  >
                    कीरो/कॉल्डियन
                  </button>
                  <button
                    type="button"
                    onClick={() => setCalcSystem('pythagorean')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                      calcSystem === 'pythagorean'
                        ? 'bg-[#5C3A21] text-amber-200'
                        : 'bg-amber-100 text-stone-700'
                    }`}
                  >
                    पाइथागोरियन
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#8C6239] mb-1">
                  जांच हेतु कोई भी नाम टाइप करें (अंग्रेजी में):
                </label>
                <input
                  type="text"
                  value={calcName}
                  onChange={(e) => {
                    setCalcName(e.target.value);
                    setInputName(e.target.value);
                  }}
                  placeholder="उदा: NARENDRA MODI..."
                  className="w-full p-2.5 rounded-xl border border-amber-300 bg-amber-50/50 text-sm font-black text-[#5C3A21] uppercase focus:outline-none"
                />
              </div>

              {/* Character Breakdown Result */}
              {(() => {
                const res = calculateNamank(calcName, calcSystem);
                const isHarmonious = mulank.friendlyNumbers.includes(res.single);
                return (
                  <div className="space-y-3 pt-1">
                    <div className="flex items-center justify-center gap-1.5 flex-wrap">
                      {res.breakdown.map((item, idx) => (
                        <div
                          key={idx}
                          className="w-8 h-10 rounded-lg bg-amber-100 border border-amber-300 flex flex-col items-center justify-center font-mono"
                        >
                          <span className="text-xs font-black text-[#5C3A21]">{item.char}</span>
                          <span className="text-[9px] text-amber-800 font-bold">{item.val}</span>
                        </div>
                      ))}
                    </div>

                    <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-center space-y-1">
                      <div className="text-xs text-[#8C6239] font-bold">संयुक्त अंक (Compound) = {res.compound}</div>
                      <div className="text-2xl font-black font-granth text-[#5C3A21]">
                        नामांक अंक: {res.single} ({NUMBER_DATA[res.single]?.planet})
                      </div>

                      <div
                        className={`p-2.5 rounded-xl text-xs font-bold mt-2 ${
                          isHarmonious
                            ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                            : 'bg-rose-100 text-rose-900 border border-rose-300'
                        }`}
                      >
                        {isHarmonious ? (
                          <div className="flex items-center justify-center gap-1">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>यह नामांक आपके मूलांक {mulankNum} के लिए अत्यंत शुभ व अनुकूल है!</span>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="flex items-center justify-center gap-1">
                              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                              <span>ध्यान दें: यह नामांक मूलांक {mulankNum} से थोड़ा प्रतिकूल है।</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setInputName(calcName);
                                setUmaTopic('spelling');
                                setActiveTab('uma_ank');
                              }}
                              className="px-3 py-1.5 rounded-lg bg-[#7A1D1D] text-[#FFD88A] text-xs font-bold inline-flex items-center gap-1 cursor-pointer hover:bg-[#5C1414]"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>उमा से शुभ नाम स्पेलिंग विकल्प देखें (ऑफ़लाइन गणना)</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* TAB 3: LO SHU GRID & RAJ YOGA */}
        {activeTab === 'loshu' && (
          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-white border-2 border-amber-300 shadow-xs space-y-3">
              <div className="border-b border-amber-100 pb-2">
                <h2 className="text-base font-black text-[#5C3A21] font-granth">
                  लो-शू चक्र (Lo Shu Grid 3x3 Matrix)
                </h2>
                <p className="text-xs text-[#8C6239]">
                  जन्म तिथि अंक + मूलांक + भाग्यांक से निर्मित 3x3 दैवीय चक्र
                </p>
              </div>

              {/* 3x3 Matrix UI */}
              <div className="grid grid-cols-3 gap-2 max-w-[240px] mx-auto font-mono text-center">
                {[
                  [4, 9, 2],
                  [3, 5, 7],
                  [8, 1, 6],
                ].flatMap((row) =>
                  row.map((num) => {
                    const count = loshu.counts[num] || 0;
                    return (
                      <div
                        key={num}
                        className={`h-16 rounded-xl flex flex-col items-center justify-center border-2 shadow-2xs transition ${
                          count > 0
                            ? 'bg-amber-100/90 border-amber-500 text-[#462B17]'
                            : 'bg-stone-50 border-stone-200 text-stone-300'
                        }`}
                      >
                        <span className="text-lg font-black">{num}</span>
                        {count > 0 ? (
                          <span className="text-[9px] text-amber-900 font-sans font-bold">
                            संख्या: {count}
                          </span>
                        ) : (
                          <span className="text-[8px] text-stone-400 font-sans">अनुपस्थित</span>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Raj Yogas check */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div
                  className={`p-3 rounded-xl border ${
                    loshu.goldenRajYoga
                      ? 'bg-amber-100 border-amber-400 text-amber-950 font-bold'
                      : 'bg-stone-50 border-stone-200 text-stone-500'
                  }`}
                >
                  <div className="font-bold text-sm">✨ स्वर्ण राजयोग (4-5-6)</div>
                  <p className="text-[11px] mt-0.5">
                    {loshu.goldenRajYoga
                      ? 'बधाई हो! आपकी जन्मतिथि में स्वर्ण राजयोग है। अकूत धन, संपत्ति व प्रतिष्ठा प्राप्त होगी।'
                      : 'अंक 4, 5 या 6 में से अनुपस्थिति के कारण यह राजयोग अधूरा है।'}
                  </p>
                </div>

                <div
                  className={`p-3 rounded-xl border ${
                    loshu.silverRajYoga
                      ? 'bg-amber-100 border-amber-400 text-amber-950 font-bold'
                      : 'bg-stone-50 border-stone-200 text-stone-500'
                  }`}
                >
                  <div className="font-bold text-sm">🥈 सिल्वर राजयोग (2-5-8)</div>
                  <p className="text-[11px] mt-0.5">
                    {loshu.silverRajYoga
                      ? 'बधाई हो! आपकी जन्मतिथि में पृथ्वी तत्व राजयोग है। भूमि, भवन व अचल संपत्ति प्राप्त होगी।'
                      : 'अंक 2, 5 या 8 में से अनुपस्थिति के कारण यह योग अधूरा है।'}
                  </p>
                </div>
              </div>

              {/* Missing Numbers Remedies */}
              {loshu.missingNumbers.length > 0 && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 space-y-2 text-xs">
                  <div className="font-bold text-[#5C3A21] flex items-center gap-1">
                    <ShieldAlert className="w-4 h-4 text-amber-600" />
                    <span>अनुपस्थित अंक ({loshu.missingNumbers.join(', ')}) के अचूक निवारण उपाय:</span>
                  </div>

                  <div className="space-y-2">
                    {loshu.missingNumbers.map((mNum) => {
                      const rem = MISSING_NUMBER_REMEDIES[mNum];
                      if (!rem) return null;
                      return (
                        <div key={mNum} className="p-2 rounded-lg bg-white border border-amber-200 text-[11px]">
                          <span className="font-bold text-amber-900">{rem.title}:</span>
                          <ul className="list-disc list-inside space-y-0.5 text-stone-700 mt-0.5">
                            {rem.remedies.map((r, idx) => (
                              <li key={idx}>{r}</li>
                            ))}
                          </ul>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: VEHICLE & MOBILE NUMEROLOGY */}
        {activeTab === 'vehicle_mobile' && (
          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-white border-2 border-amber-300 shadow-xs space-y-3">
              <div className="border-b border-amber-100 pb-2 flex items-center gap-2">
                <PhoneCall className="w-5 h-5 text-amber-600" />
                <h2 className="text-sm font-black text-[#5C3A21]">
                  मोबाइल व वाहन नंबर अनुकूलता परीक्षण
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Mobile Checker */}
                <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-2 text-xs">
                  <div className="font-bold text-[#5C3A21]">📱 १. मोबाइल नंबर जांच:</div>
                  <input
                    type="text"
                    value={mobileNum}
                    onChange={(e) => setMobileNum(e.target.value)}
                    placeholder="१० अंकों का मोबाइल नंबर..."
                    className="w-full p-2 rounded-xl border border-amber-300 bg-white font-mono font-bold text-[#5C3A21]"
                  />
                  <div className="p-2 rounded-xl bg-white border border-amber-200 text-center">
                    <span className="text-[10px] text-stone-500">कुल योग अंक: </span>
                    <span className="text-lg font-black text-[#5C3A21]">{mobileDigitsSum}</span>
                    <p className={`text-[11px] font-bold mt-0.5 ${isMobileFriendly ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {isMobileFriendly ? '✓ आपके मूलांक के अनुकूल शुभ नंबर!' : '⚠️ सामान्य / प्रतिकूल नंबर।'}
                    </p>
                  </div>
                </div>

                {/* Vehicle Checker */}
                <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-2 text-xs">
                  <div className="font-bold text-[#5C3A21]">🚗 २. वाहन प्लेट नंबर जांच:</div>
                  <input
                    type="text"
                    value={vehicleNum}
                    onChange={(e) => setVehicleNum(e.target.value)}
                    placeholder="उदा: DL 01 AB 1234..."
                    className="w-full p-2 rounded-xl border border-amber-300 bg-white font-mono font-bold text-[#5C3A21] uppercase"
                  />
                  <div className="p-2 rounded-xl bg-white border border-amber-200 text-center">
                    <span className="text-[10px] text-stone-500">कुल योग अंक: </span>
                    <span className="text-lg font-black text-[#5C3A21]">{vehicleDigitsSum}</span>
                    <p className={`text-[11px] font-bold mt-0.5 ${isVehicleFriendly ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {isVehicleFriendly ? '✓ आपके मूलांक के अनुकूल शुभ वाहन नंबर!' : '⚠️ सामान्य / प्रतिकूल वाहन नंबर।'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: PERSONAL YEAR FORECAST */}
        {activeTab === 'yearly' && (
          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-white border-2 border-amber-300 shadow-xs space-y-3">
              <div className="border-b border-amber-100 pb-2">
                <h2 className="text-base font-black text-[#5C3A21] font-granth">
                  व्यक्तिगत वर्ष {new Date().getFullYear()} फलादेश
                </h2>
                <p className="text-xs text-[#8C6239]">
                  Personal Year Number: <strong>अंक {personalYear.yearNum}</strong>
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 space-y-2 text-xs">
                <div className="text-base font-black text-[#5C3A21] font-granth">
                  {personalYear.theme}
                </div>
                <p className="text-xs text-[#3E2714] leading-relaxed">
                  {personalYear.advice}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Ask Uma Bar (Instant In-Page + Full Chat Modal) */}
      <div className="p-2.5 bg-white border-t border-amber-200 shrink-0 flex items-center justify-between gap-2">
        <span className="text-xs text-[#8C6239] font-medium truncate">
          मूलांक {mulankNum} • भाग्यांक {bhagyankNum} • नामांक {namankData.single} के अनुसार शुभ व्यवसाय व नाम सुधार
        </span>
        <div className="flex items-center gap-1.5 shrink-0">
          {activeTab !== 'uma_ank' && (
            <button
              type="button"
              onClick={() => setActiveTab('uma_ank')}
              className="px-3 py-1.5 rounded-xl bg-[#7A1D1D] text-[#FFD88A] text-xs font-bold flex items-center gap-1 hover:bg-[#5C1414] transition cursor-pointer shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>उमा अंक परामर्श</span>
            </button>
          )}
          {onOpenUmaWithQuery && (
            <button
              type="button"
              onClick={() => onOpenUmaWithQuery(buildFullNumerologyPrompt())}
              className="px-3 py-1.5 rounded-xl bg-[#5C3A21] text-amber-200 text-xs font-bold flex items-center gap-1 hover:bg-[#462B17] transition cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
              <span>उमा संवाद</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NumerologyView;
