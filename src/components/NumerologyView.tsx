import React, { useState, useMemo } from 'react';
import { KundaliData } from '../types';
import {
  calculateMulank,
  calculateBhagyank,
  calculateNamank,
  calculateKuaNumber,
  calculatePersonalYear,
  calculateLoshuGrid,
  getLocalizedNumberInfo,
  getLocalizedMissingRemedy,
  reduceToSingleDigit,
} from '../services/numerology';
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
  MessageSquare,
} from 'lucide-react';
import { useLanguage } from '../i18n';
import { UniversalStoryDeck, StorySlideItem } from './UniversalStoryDeck';
import { AnkChatRoom } from './AnkChatRoom';

interface NumerologyViewProps {
  activeKundali?: KundaliData | null;
  onOpenKundaliTab?: () => void;
  onOpenUmaWithQuery?: (query: string) => void;
  onPrevChapter?: () => void;
  onNextChapter?: () => void;
}

type NumerologyTab = 'profile' | 'name_calc' | 'loshu' | 'vehicle_mobile' | 'yearly' | 'uma_ank' | 'stories';

export const NumerologyView: React.FC<NumerologyViewProps> = ({
  activeKundali,
  onOpenUmaWithQuery,
  onPrevChapter,
  onNextChapter,
}) => {
  const { language } = useLanguage();
  const cLang = (language || 'hi').slice(0, 2).toLowerCase();
  const pickL = <T,>(hi: T, en: T, gu: T): T => (cLang === 'en' ? en : cLang === 'gu' ? gu : hi);

  const [activeTab, setActiveTab] = useState<NumerologyTab>('profile');
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);

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

  const [calcName, setCalcName] = useState<string>(activeKundali?.name || '');
  const [calcSystem, setCalcSystem] = useState<'chaldean' | 'pythagorean'>('chaldean');

  const [mobileNum, setMobileNum] = useState<string>('9876543210');
  const [vehicleNum, setVehicleNum] = useState<string>('MH01AB1234');

  const mulankNum = calculateMulank(inputDay);
  const bhagyankNum = calculateBhagyank(inputDay, inputMonth, inputYear);
  const namankData = calculateNamank(inputName, 'chaldean');
  const kuaNum = calculateKuaNumber(inputYear, gender);
  const personalYear = calculatePersonalYear(inputDay, inputMonth, new Date().getFullYear());
  const loshu = calculateLoshuGrid(inputDay, inputMonth, inputYear);

  const mulank = getLocalizedNumberInfo(mulankNum, cLang);
  const bhagyank = getLocalizedNumberInfo(bhagyankNum, cLang);
  const namank = getLocalizedNumberInfo(namankData.single, cLang);

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

  const buildFullNumerologyPrompt = (extraQuestion?: string) => {
    const dobFormatted = `${String(inputDay).padStart(2, '0')}/${String(inputMonth).padStart(2, '0')}/${inputYear}`;
    const genderLabel = gender === 'male' ? pickL('पुरुष', 'Male', 'પુરુષ') : pickL('स्त्री', 'Female', 'સ્ત્રી');
    const base = pickL(
      `अंक ज्योतिष परामर्श: मेरा नाम ${inputName}, जन्म तिथि ${dobFormatted} (${genderLabel}), मूलांक ${mulankNum} (${mulank.planet}), भाग्यांक ${bhagyankNum} (${bhagyank.planet}), नामांक ${namankData.single} (संयुक्त अंक ${namankData.compound}), कुआं अंक ${kuaNum}, मोबाइल नंबर ${mobileNum}, वाहन नंबर ${vehicleNum} है।`,
      `Numerology consultation: Name ${inputName || 'Seeker'}, DOB ${dobFormatted} (${genderLabel}), Root Number ${mulankNum} (${mulank.planet}), Destiny Number ${bhagyankNum} (${bhagyank.planet}), Name Number ${namankData.single} (Compound ${namankData.compound}), Kua Number ${kuaNum}, Mobile ${mobileNum}, Vehicle ${vehicleNum}.`,
      `અંક જ્યોતિષ પરામર્શ: મારું નામ ${inputName}, જન્મ તારીખ ${dobFormatted} (${genderLabel}), મૂળાંક ${mulankNum} (${mulank.planet}), ભાગ્યાંક ${bhagyankNum} (${bhagyank.planet}), નામાંક ${namankData.single} (સંયુક્ત અંક ${namankData.compound}), કુઆ અંક ${kuaNum}, મોબાઇલ ${mobileNum}, વાહન ${vehicleNum} છે.`
    );
    return extraQuestion
      ? `${base} ${pickL('प्रश्न', 'Question', 'પ્રશ્ન')}: ${extraQuestion}`
      : `${base} ${pickL(
          'मेरे मूलांक, भाग्यांक, नामांक स्पेलिंग सुधार, लो-शू चक्र राजयोग व अनुपस्थित अंकों के उपाय का पूर्ण फलादेश बताएं।',
          'Please provide complete predictions for my Root, Destiny, Name spelling optimization, Lo Shu Raj Yogas and missing number remedies.',
          'મારા મૂળાંક, ભાગ્યાંક, નામ સ્પેલિંગ સુધારણા, લો-શૂ ચક્ર રાજયોગ અને ગેરહાજર અંકોના ઉપાય જણાવો.'
        )}`;
  };

  const slides: StorySlideItem[] = [
    {
      id: 'core-numbers',
      title: `${inputName || pickL('यजमान', 'Seeker', 'યજમાન')} — ${pickL('वैदिक अंक शास्त्र', 'Vedic Numerology', 'વૈદિક અંક શાસ્ત્ર')}`,
      subtitle: `${pickL('जन्म', 'DOB', 'જન્મ')}: ${inputDay}/${inputMonth}/${inputYear}`,
      badge: `${pickL('मूलांक', 'Root', 'મૂળાંક')} ${mulank.number} • ${pickL('भाग्यांक', 'Destiny', 'ભાગ્યાંક')} ${bhagyank.number}`,
      icon: '🔢',
      voiceText: pickL(
        `आपका मूलांक ${mulank.number} और भाग्यांक ${bhagyank.number} है। स्वामी ग्रह: ${mulank.planet}।`,
        `Your Root Number is ${mulank.number} and Destiny Number is ${bhagyank.number}. Ruling planet: ${mulank.planet}.`,
        `તમારો મૂળાંક ${mulank.number} અને ભાગ્યાંક ${bhagyank.number} છે. સ્વામી ગ્રહ: ${mulank.planet}.`
      ),
      content: (
        <div className="h-full flex flex-col justify-between py-1 space-y-2">
          <div className="p-3.5 rounded-2xl bg-amber-50/90 border-2 border-amber-300 shadow-xs space-y-2 my-auto text-xs">
            <div className="grid grid-cols-3 gap-1.5 text-center">
              <div className="p-2 rounded-xl bg-white border border-amber-200">
                <div className="text-[10px] text-[#8C6239] font-bold">{pickL('मूलांक (Driver)', 'Root (Driver)', 'મૂળાંક (Driver)')}</div>
                <div className="text-xl font-black text-[#5C3A21]">{mulank.number}</div>
                <div className="text-[9px] text-amber-800">{mulank.planet.split(' ')[0]}</div>
              </div>
              <div className="p-2 rounded-xl bg-white border border-amber-200">
                <div className="text-[10px] text-[#8C6239] font-bold">{pickL('भाग्यांक (Conductor)', 'Destiny (Conductor)', 'ભાગ્યાંક (Conductor)')}</div>
                <div className="text-xl font-black text-[#5C3A21]">{bhagyank.number}</div>
                <div className="text-[9px] text-amber-800">{bhagyank.planet.split(' ')[0]}</div>
              </div>
              <div className="p-2 rounded-xl bg-white border border-amber-200">
                <div className="text-[10px] text-[#8C6239] font-bold">{pickL('नामांक (Name)', 'Name No.', 'નામાંક (Name)')}</div>
                <div className="text-xl font-black text-[#5C3A21]">{namankData.single}</div>
                <div className="text-[9px] text-amber-800">{namank.planet.split(' ')[0]}</div>
              </div>
            </div>

            <div className="p-2 rounded-xl bg-white border border-amber-200">
              <div className="font-bold text-[#5C3A21]">{pickL('🌟 स्वभाव एवं विशेषताएँ:', '🌟 Nature & Key Traits:', '🌟 સ્વભાવ અને વિશેષતાઓ:')}</div>
              <p className="text-[11px] text-[#6E472A] mt-0.5 leading-snug">
                {mulank.nature}
              </p>
            </div>
          </div>
          <div className="text-[10px] text-center text-[#8C6239]">
            {pickL('शुभ अंक:', 'Lucky Numbers:', 'શુભ અંકો:')} {mulank.friendlyNumbers.join(', ')} • {pickL('शुभ रंग:', 'Lucky Colors:', 'શુભ રંગ:')} {mulank.luckyColors.join(', ')}
          </div>
        </div>
      ),
    },
    {
      id: 'loshu-grid',
      title: pickL('लो-शू ग्रिड (Lo Shu Magic Grid)', 'Lo Shu Magic Grid', 'લો-શૂ ગ્રીડ (Lo Shu Magic Grid)'),
      subtitle: pickL('3x3 वैदिक अंक चक्र व तत्व विश्लेषण', '3x3 Vedic Number Grid & Element Analysis', '3x3 વૈદિક અંક ચક્ર અને તત્વ વિશ્લેષણ'),
      badge: pickL('ऊर्जा चक्र', 'Energy Grid', 'ઊર્જા ચક્ર'),
      icon: '📐',
      voiceText: pickL('लो-शू ग्रिड 3x3 अंक चक्र।', 'Lo Shu 3 by 3 energy grid.', 'લો-શૂ ગ્રીડ 3x3 અંક ચક્ર.'),
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
            {pickL(
              'लो-शू ग्रिड आपके जीवन के विचार, इच्छा और कर्म शक्ति का प्रतिनिधित्व करता है।',
              'The Lo Shu Grid represents your planes of thought, willpower, and action.',
              'લો-શૂ ગ્રીડ તમારા જીવનની વિચાર, ઇચ્છા અને કર્મ શક્તિનું પ્રતિનિધિત્વ કરે છે.'
            )}
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
            ← {pickL('अंक ज्योतिष मुख्य पृष्ठ', 'Numerology Home', 'અંક જ્યોતિષ મુખ્ય પૃષ્ઠ')}
          </button>
          <span className="text-xs font-black text-[#5C3A21]">{pickL('स्टोरी व्यू', 'Story View', 'સ્ટોરી વ્યૂ')}</span>
        </div>
        <div className="flex-1 min-h-0">
          <UniversalStoryDeck
            slides={slides}
            currentSlideIndex={activeSlideIndex}
            onSlideIndexChange={setActiveSlideIndex}
            headerTitle={pickL('अंक ज्योतिष (Numerology)', 'Vedic Numerology', 'અંક જ્યોતિષ (Numerology)')}
            headerIcon="🔢"
            chapterNumber={14}
            onOpenUma={() => setActiveTab('uma_ank')}
            onPrevChapter={onPrevChapter}
            onNextChapter={onNextChapter}
            prevChapterLabel={pickL('ग्रह उपाय', 'Planetary Remedies', 'ગ્રહ ઉપાય')}
            nextChapterLabel={pickL('हस्तरेखा', 'Palmistry', 'હસ્તરેખા')}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-0 flex flex-col bg-[#FAF6EE] text-[#3E2714] overflow-hidden">
      {/* Top Header Controls */}
      <div className="shrink-0 px-2.5 py-2 bg-white border-b border-amber-200 shadow-xs flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-lg sm:text-xl shrink-0">🔢</span>
            <div className="min-w-0">
              <h1 className="text-xs sm:text-base font-black text-[#5C3A21] font-granth leading-tight truncate">
                {pickL('वैदिक अंक ज्योतिष एवं लो-शू चक्र', 'Vedic Numerology & Lo Shu Grid', 'વૈદિક અંક જ્યોતિષ અને લો-શૂ ચક્ર')}
              </h1>
              <p className="text-[10px] text-[#8C6239] font-medium truncate">
                {inputName || pickL('यजमान', 'Seeker', 'યજમાન')} ({inputDay}/{inputMonth}/{inputYear}) • {pickL('मूलांक', 'Root', 'મૂળાંક')} {mulankNum} • {pickL('भाग्यांक', 'Destiny', 'ભાગ્યાંક')} {bhagyankNum}
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
              <span>{pickL('उमा अंक निर्णय', 'Uma Reading', 'ઉમા અંક નિર્ણય')}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('stories')}
              className="px-2 py-1 rounded-lg bg-amber-500 text-white text-[11px] font-bold flex items-center gap-1 shadow-xs hover:bg-amber-600 transition cursor-pointer"
            >
              <BookOpen className="w-3 h-3" />
              <span className="text-[11px] font-bold">{pickL('स्टोरी व्यू', 'Stories', 'સ્ટોરી વ્યૂ')}</span>
            </button>
          </div>
        </div>

        {/* Compact Input Bar */}
        <div className="grid grid-cols-12 gap-1.5 bg-amber-50/80 px-2 py-1.5 rounded-xl border border-amber-200/80 text-xs items-end">
          <div className="col-span-7 sm:col-span-4">
            <label className="block text-[9px] font-bold text-[#8C6239] leading-none mb-0.5">{pickL('नाम (Name):', 'Full Name:', 'નામ (Name):')}</label>
            <input
              type="text"
              value={inputName}
              onChange={(e) => setInputName(e.target.value)}
              placeholder={pickL('नाम लिखें...', 'Enter name...', 'નામ લખો...')}
              className="w-full px-2 py-1 rounded-lg border border-amber-300 bg-white font-bold text-[#5C3A21] uppercase focus:outline-none text-[11px]"
            />
          </div>

          <div className="col-span-5 sm:col-span-2 flex items-center gap-1">
            <button
              type="button"
              onClick={() => setGender('male')}
              style={
                gender === 'male'
                  ? { backgroundColor: '#5C3A21', color: '#FFD88A', borderColor: '#3E2714' }
                  : { backgroundColor: '#FFFDF9', color: '#5C3A21', borderColor: '#DFCBB5' }
              }
              className="flex-1 py-1 rounded-lg text-[10px] font-bold border transition cursor-pointer shadow-xs"
            >
              {pickL('पुरुष', 'Male', 'પુરુષ')}
            </button>
            <button
              type="button"
              onClick={() => setGender('female')}
              style={
                gender === 'female'
                  ? { backgroundColor: '#5C3A21', color: '#FFD88A', borderColor: '#3E2714' }
                  : { backgroundColor: '#FFFDF9', color: '#5C3A21', borderColor: '#DFCBB5' }
              }
              className="flex-1 py-1 rounded-lg text-[10px] font-bold border transition cursor-pointer shadow-xs"
            >
              {pickL('स्त्री', 'Female', 'સ્ત્રી')}
            </button>
          </div>

          <div className="col-span-12 sm:col-span-6 grid grid-cols-3 gap-1.5">
            <div>
              <label className="block text-[9px] font-bold text-[#8C6239] leading-none mb-0.5">{pickL('दिन:', 'Day:', 'દિવસ:')}</label>
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
              <label className="block text-[9px] font-bold text-[#8C6239] leading-none mb-0.5">{pickL('माह:', 'Month:', 'માસ:')}</label>
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
              <label className="block text-[9px] font-bold text-[#8C6239] leading-none mb-0.5">{pickL('वर्ष:', 'Year:', 'વર્ષ:')}</label>
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
            <span>{pickL('अंक फलादेश', 'Number Profile', 'અંક ફળાદેશ')}</span>
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
            <span>{pickL('🔮 उमा अंक परामर्श', '🔮 Uma Numerology Chat', '🔮 ઉમા અંક પરામર્શ')}</span>
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
            <span>{pickL('नामांक कैलकुलेटर', 'Name Calculator', 'નામાંક કેલ્ક્યુલેટર')}</span>
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
            <span>{pickL('लो-शू चक्र व राजयोग', 'Lo Shu & Raj Yoga', 'લો-શૂ ચક્ર અને રાજયોગ')}</span>
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
            <span>{pickL('मोबाइल व वाहन अंक', 'Mobile & Vehicle', 'મોબાઇલ અને વાહન અંક')}</span>
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
            <span>{pickL('व्यक्तिगत वर्ष', 'Personal Year', 'વ્યક્તિગત વર્ષ')}</span>
          </button>
        </div>
      </div>

      {/* Main View Area */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-3 space-y-4">
        {/* TAB 1: CORE NUMBERS PROFILE */}
        {activeTab === 'profile' && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="p-3 rounded-2xl bg-white border-2 border-amber-300 shadow-xs text-center">
                <span className="text-[10px] text-[#8C6239] font-bold uppercase">{pickL('मूलांक (Driver)', 'Root (Driver)', 'મૂળાંક (Driver)')}</span>
                <div className="text-2xl font-black text-[#5C3A21]">{mulankNum}</div>
                <span className="text-[10px] text-amber-800 font-bold">{mulank.planet.split(' ')[0]}</span>
              </div>

              <div className="p-3 rounded-2xl bg-white border-2 border-amber-300 shadow-xs text-center">
                <span className="text-[10px] text-[#8C6239] font-bold uppercase">{pickL('भाग्यांक (Conductor)', 'Destiny (Conductor)', 'ભાગ્યાંક (Conductor)')}</span>
                <div className="text-2xl font-black text-[#5C3A21]">{bhagyankNum}</div>
                <span className="text-[10px] text-amber-800 font-bold">{bhagyank.planet.split(' ')[0]}</span>
              </div>

              <div className="p-3 rounded-2xl bg-white border-2 border-amber-300 shadow-xs text-center">
                <span className="text-[10px] text-[#8C6239] font-bold uppercase">{pickL('नामांक (Name)', 'Name Number', 'નામાંક (Name)')}</span>
                <div className="text-2xl font-black text-[#5C3A21]">{namankData.single}</div>
                <span className="text-[10px] text-amber-800 font-bold">{namank.planet.split(' ')[0]}</span>
              </div>

              <div className="p-3 rounded-2xl bg-white border-2 border-amber-300 shadow-xs text-center">
                <span className="text-[10px] text-[#8C6239] font-bold uppercase">{pickL('कुआं अंक (Kua)', 'Kua Number', 'કુઆ અંક (Kua)')}</span>
                <div className="text-2xl font-black text-[#5C3A21]">{kuaNum}</div>
                <span className="text-[10px] text-amber-800 font-bold">{pickL('ऊर्जा अंक', 'Energy Number', 'ઊર્જા અંક')}</span>
              </div>
            </div>

            {/* Detailed Moolank Breakdown */}
            <div className="p-4 rounded-2xl bg-white border border-amber-200/90 shadow-xs space-y-3">
              <div className="border-b border-amber-100 pb-2 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-black text-[#5C3A21] font-granth">
                    {pickL(`मूलांक ${mulankNum} फलादेश — ${mulank.planet}`, `Root Number ${mulankNum} Analysis — ${mulank.planet}`, `મૂળાંક ${mulankNum} ફળાદેશ — ${mulank.planet}`)}
                  </h2>
                  <p className="text-xs text-[#8C6239]">
                    {pickL('देवता:', 'Deity:', 'દેવતા:')} <strong>{mulank.deity}</strong> • {pickL('तत्व:', 'Element:', 'તત્વ:')} <strong>{mulank.element}</strong>
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold">
                  {pickL('जप:', 'Japa:', 'જપ:')} {mulank.japaCount}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 space-y-1">
                  <div className="font-bold text-[#5C3A21]">{pickL('🌟 स्वभाव एवं प्रकृति:', '🌟 Temperament & Nature:', '🌟 સ્વભાવ અને પ્રકૃતિ:')}</div>
                  <p className="text-[11px] text-[#6E472A] leading-relaxed">{mulank.nature}</p>
                </div>

                <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200 space-y-1">
                  <div className="font-bold text-emerald-900">{pickL('💼 उपयुक्त आजीविका/करियर:', '💼 Ideal Career & Vocation:', '💼 યોગ્ય કારકિર્દી/વ્યવસાય:')}</div>
                  <p className="text-[11px] text-emerald-950">{mulank.careers.join(', ')}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200">
                  <span className="font-bold text-[#8C6239]">{pickL('मित्र व शत्रु अंक:', 'Friendly & Challenging Numbers:', 'મિત્ર અને શત્રુ અંકો:')}</span>
                  <div className="text-[11px] text-[#3E2714] mt-0.5">
                    {pickL('मित्र:', 'Friendly:', 'મિત્ર:')} <strong>{mulank.friendlyNumbers.join(', ')}</strong> <br />
                    {pickL('शत्रु:', 'Enemy:', 'શત્રુ:')} <strong>{mulank.enemyNumbers.length > 0 ? mulank.enemyNumbers.join(', ') : pickL('कोई नहीं', 'None', 'કોઈ નહીં')}</strong>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200">
                  <span className="font-bold text-[#8C6239]">{pickL('शुभ रंग व दिन:', 'Lucky Colors & Days:', 'શુભ રંગ અને વાર:')}</span>
                  <div className="text-[11px] text-[#3E2714] mt-0.5">
                    {pickL('रंग:', 'Colors:', 'રંગ:')} {mulank.luckyColors.join(', ')} <br />
                    {pickL('दिन:', 'Days:', 'વાર:')} {mulank.luckyDays.join(', ')}
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200">
                  <span className="font-bold text-[#8C6239]">{pickL('रत्न व रुद्राक्ष:', 'Gemstone & Rudraksha:', 'રત્ન અને રુદ્રાક્ષ:')}</span>
                  <div className="text-[11px] text-[#3E2714] mt-0.5">
                    {pickL('रत्न:', 'Gemstone:', 'રત્ન:')} {mulank.luckyGem} <br />
                    {pickL('रुद्राक्ष:', 'Rudraksha:', 'રુદ્રાક્ષ:')} {mulank.rudraksha}
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#5C3A21] text-amber-200 text-xs space-y-1">
                <div className="font-bold flex items-center gap-1 text-amber-300">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{pickL('वैदिक सिद्ध मंत्र:', 'Vedic Sacred Mantra:', 'વૈદિક સિદ્ધ મંત્ર:')}</span>
                </div>
                <p className="font-granth text-sm font-black text-white">{mulank.mantra}</p>
                <p className="text-[10px] text-amber-200/80">
                  {pickL(
                    `जल चिकित्सा: ${mulank.waterBottleColor} में जल भरकर सूर्य स्नान कराएं व सेवन करें।`,
                    `Water Therapy: Keep water in a ${mulank.waterBottleColor} under morning sunlight and drink daily.`,
                    `જળ ચિકિત્સા: ${mulank.waterBottleColor} માં પાણી ભરીને સૂર્યપ્રકાશમાં રાખીને સેવન કરો.`
                  )}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB: UMA ANK JYOTISH CHAT */}
        {activeTab === 'uma_ank' && (
          <div className="h-full min-h-[460px] pb-2">
            <AnkChatRoom
              inputName={inputName}
              inputDay={inputDay}
              inputMonth={inputMonth}
              inputYear={inputYear}
              gender={gender}
              mobileNum={mobileNum}
              vehicleNum={vehicleNum}
              mulankNum={mulankNum}
              bhagyankNum={bhagyankNum}
              namankData={namankData}
              kuaNum={kuaNum}
              personalYear={personalYear}
              loshu={loshu}
              mulank={mulank}
              bhagyank={bhagyank}
              namank={namank}
              onOpenUmaWithQuery={onOpenUmaWithQuery}
            />
          </div>
        )}

        {/* TAB 2: NAME NUMEROLOGY CALCULATOR */}
        {activeTab === 'name_calc' && (
          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-white border-2 border-amber-300 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-amber-100 pb-2">
                <div className="flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-amber-600" />
                  <h2 className="text-sm font-black text-[#5C3A21]">
                    {pickL('अंक विज्ञान नामांक कैलकुलेटर', 'Name Numerology Calculator', 'અંક વિજ્ઞાન નામાંક કેલ્ક્યુલેટર')}
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
                    {pickL('कीरो/कॉल्डियन', 'Chaldean', 'કોલ્ડિયન')}
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
                    {pickL('पाइथागोरियन', 'Pythagorean', 'પાયથાગોરિયન')}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#8C6239] mb-1">
                  {pickL('जांच हेतु कोई भी नाम टाइप करें (अंग्रेजी अक्षरों में):', 'Type any name to evaluate (English letters):', 'તપાસ માટે કોઈ પણ નામ લખો (અંગ્રેજીમાં):')}
                </label>
                <input
                  type="text"
                  value={calcName}
                  onChange={(e) => {
                    setCalcName(e.target.value);
                    setInputName(e.target.value);
                  }}
                  placeholder={pickL('उदा: RAJESH SHARMA...', 'e.g., RAJESH SHARMA...', 'દા.ત. RAJESH SHARMA...')}
                  className="w-full p-2.5 rounded-xl border border-amber-300 bg-amber-50/50 text-sm font-black text-[#5C3A21] uppercase focus:outline-none"
                />
              </div>

              {(() => {
                const res = calculateNamank(calcName, calcSystem);
                const resPlanet = getLocalizedNumberInfo(res.single, cLang).planet;
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
                      <div className="text-xs text-[#8C6239] font-bold">
                        {pickL('संयुक्त अंक (Compound) =', 'Compound Total =', 'સંયુક્ત અંક (Compound) =')} {res.compound}
                      </div>
                      <div className="text-2xl font-black font-granth text-[#5C3A21]">
                        {pickL('नामांक अंक:', 'Name Number:', 'નામાંક અંક:')} {res.single} ({resPlanet})
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
                            <span>
                              {pickL(
                                `यह नामांक आपके मूलांक ${mulankNum} के लिए अत्यंत शुभ व अनुकूल है!`,
                                `This Name Number is highly auspicious and harmonious with your Root Number ${mulankNum}!`,
                                `આ નામાંક તમારા મૂળાંક ${mulankNum} માટે અત્યંત શુભ અને અનુકૂળ છે!`
                              )}
                            </span>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="flex items-center justify-center gap-1">
                              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                              <span>
                                {pickL(
                                  `ध्यान दें: यह नामांक मूलांक ${mulankNum} से थोड़ा प्रतिकूल है।`,
                                  `Note: This Name Number is mildly incompatible with your Root Number ${mulankNum}.`,
                                  `ધ્યાન આપો: આ નામાંક મૂળાંક ${mulankNum} સાથે થોડો પ્રતિકૂળ છે.`
                                )}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setInputName(calcName);
                                setActiveTab('uma_ank');
                              }}
                              className="px-3 py-1.5 rounded-lg bg-[#7A1D1D] text-[#FFD88A] text-xs font-bold inline-flex items-center gap-1 cursor-pointer hover:bg-[#5C1414]"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>
                                {pickL(
                                  'उमा से शुभ नाम स्पेलिंग विकल्प देखें',
                                  'View harmonious spelling suggestions with Uma',
                                  'ઉમા સાથે શુભ નામ સ્પેલિંગ વિકલ્પો જુઓ'
                                )}
                              </span>
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
                  {pickL('लो-शू चक्र (Lo Shu Grid 3x3 Matrix)', 'Lo Shu Grid 3x3 Matrix', 'લો-શૂ ચક્ર (Lo Shu Grid 3x3 Matrix)')}
                </h2>
                <p className="text-xs text-[#8C6239]">
                  {pickL(
                    'जन्म तिथि अंक + मूलांक + भाग्यांक से निर्मित 3x3 दैवीय चक्र',
                    '3x3 Sacred Matrix built from Birth Date Digits + Root + Destiny Number',
                    'જન્મ તારીખ અંકો + મૂળાંક + ભાગ્યાંકથી નિર્મિત 3x3 દૈવી ચક્ર'
                  )}
                </p>
              </div>

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
                            {pickL('संख्या:', 'Count:', 'સંખ્યા:')} {count}
                          </span>
                        ) : (
                          <span className="text-[8px] text-stone-400 font-sans">{pickL('अनुपस्थित', 'Missing', 'ગેરહાજર')}</span>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div
                  className={`p-3 rounded-xl border ${
                    loshu.goldenRajYoga
                      ? 'bg-amber-100 border-amber-400 text-amber-950 font-bold'
                      : 'bg-stone-50 border-stone-200 text-stone-500'
                  }`}
                >
                  <div className="font-bold text-sm">{pickL('✨ स्वर्ण राजयोग (4-5-6)', '✨ Golden Raj Yoga (4-5-6)', '✨ સ્વર્ણ રાજયોગ (4-5-6)')}</div>
                  <p className="text-[11px] mt-0.5">
                    {loshu.goldenRajYoga
                      ? pickL(
                          'बधाई हो! आपकी जन्मतिथि में स्वर्ण राजयोग है। अकूत धन, संपत्ति व प्रतिष्ठा प्राप्त होगी।',
                          'Congratulations! Golden Raj Yoga is active in your grid, granting lasting wealth and prestige.',
                          'અભિનંદન! તમારી જન્મ તારીખમાં સ્વર્ણ રાજયોગ છે. અખૂટ ધન-સંપત્તિ અને પ્રતિષ્ઠા મળશે.'
                        )
                      : pickL(
                          'अंक 4, 5 या 6 में से अनुपस्थिति के कारण यह राजयोग अधूरा है।',
                          'Incomplete due to absence of one or more digits from 4, 5, or 6.',
                          'અંક 4, 5 કે 6 માંથી કોઈ અંક ગેરહાજર હોવાથી આ રાજયોગ અધૂરો છે.'
                        )}
                  </p>
                </div>

                <div
                  className={`p-3 rounded-xl border ${
                    loshu.silverRajYoga
                      ? 'bg-amber-100 border-amber-400 text-amber-950 font-bold'
                      : 'bg-stone-50 border-stone-200 text-stone-500'
                  }`}
                >
                  <div className="font-bold text-sm">{pickL('🥈 सिल्वर राजयोग (2-5-8)', '🥈 Silver Raj Yoga (2-5-8)', '🥈 સિલ્વર રાજયોગ (2-5-8)')}</div>
                  <p className="text-[11px] mt-0.5">
                    {loshu.silverRajYoga
                      ? pickL(
                          'बधाई हो! आपकी जन्मतिथि में पृथ्वी तत्व राजयोग है। भूमि, भवन व अचल संपत्ति प्राप्त होगी।',
                          'Congratulations! Silver Earth Raj Yoga is active, blessing you with property and fixed assets.',
                          'અભિનંદન! પૃથ્વી તત્વ રાજયોગ સક્રિય છે, જે જમીન-મકાન અને સ્થાયી મિલકત આપે છે.'
                        )
                      : pickL(
                          'अंक 2, 5 या 8 में से अनुपस्थिति के कारण यह योग अधूरा है।',
                          'Incomplete due to absence of one or more digits from 2, 5, or 8.',
                          'અંક 2, 5 કે 8 માંથી કોઈ અંક ગેરહાજર હોવાથી આ યોગ અધૂરો છે.'
                        )}
                  </p>
                </div>
              </div>

              {loshu.missingNumbers.length > 0 && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 space-y-2 text-xs">
                  <div className="font-bold text-[#5C3A21] flex items-center gap-1">
                    <ShieldAlert className="w-4 h-4 text-amber-600" />
                    <span>
                      {pickL(
                        `अनुपस्थित अंक (${loshu.missingNumbers.join(', ')}) के अचूक निवारण उपाय:`,
                        `Remedies for Missing Numbers (${loshu.missingNumbers.join(', ')}):`,
                        `ગેરહાજર અંકો (${loshu.missingNumbers.join(', ')}) ના નિવારણ ઉપાય:`
                      )}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {loshu.missingNumbers.map((mNum) => {
                      const rem = getLocalizedMissingRemedy(mNum, cLang);
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
                  {pickL('मोबाइल व वाहन नंबर अनुकूलता परीक्षण', 'Mobile & Vehicle Number Compatibility', 'મોબાઇલ અને વાહન નંબર અનુકૂળતા પરીક્ષણ')}
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-2 text-xs">
                  <div className="font-bold text-[#5C3A21]">{pickL('📱 १. मोबाइल नंबर जांच:', '📱 1. Mobile Number Check:', '📱 ૧. મોબાઇલ નંબર તપાસ:')}</div>
                  <input
                    type="text"
                    value={mobileNum}
                    onChange={(e) => setMobileNum(e.target.value)}
                    placeholder={pickL('१० अंकों का मोबाइल नंबर...', '10-digit mobile number...', '૧૦ અંકનો મોબાઇલ નંબર...')}
                    className="w-full p-2 rounded-xl border border-amber-300 bg-white font-mono font-bold text-[#5C3A21]"
                  />
                  <div className="p-2 rounded-xl bg-white border border-amber-200 text-center">
                    <span className="text-[10px] text-stone-500">{pickL('कुल योग अंक:', 'Total Digit:', 'કુલ યોગ અંક:')} </span>
                    <span className="text-lg font-black text-[#5C3A21]">{mobileDigitsSum}</span>
                    <p className={`text-[11px] font-bold mt-0.5 ${isMobileFriendly ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {isMobileFriendly
                        ? pickL('✓ आपके मूलांक के अनुकूल शुभ नंबर!', '✓ Harmonious with your Root Number!', '✓ તમારા મૂળાંકને અનુકૂળ શુભ નંબર!')
                        : pickL('⚠️ सामान्य / प्रतिकूल नंबर।', '⚠️ Neutral / Challenging number.', '⚠️ સામાન્ય / પ્રતિકૂળ નંબર.')}
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-2 text-xs">
                  <div className="font-bold text-[#5C3A21]">{pickL('🚗 २. वाहन प्लेट नंबर जांच:', '🚗 2. Vehicle Plate Check:', '🚗 ૨. વાહન પ્લેટ નંબર તપાસ:')}</div>
                  <input
                    type="text"
                    value={vehicleNum}
                    onChange={(e) => setVehicleNum(e.target.value)}
                    placeholder={pickL('उदा: DL 01 AB 1234...', 'e.g., DL 01 AB 1234...', 'દા.ત. DL 01 AB 1234...')}
                    className="w-full p-2 rounded-xl border border-amber-300 bg-white font-mono font-bold text-[#5C3A21] uppercase"
                  />
                  <div className="p-2 rounded-xl bg-white border border-amber-200 text-center">
                    <span className="text-[10px] text-stone-500">{pickL('कुल योग अंक:', 'Total Digit:', 'કુલ યોગ અંક:')} </span>
                    <span className="text-lg font-black text-[#5C3A21]">{vehicleDigitsSum}</span>
                    <p className={`text-[11px] font-bold mt-0.5 ${isVehicleFriendly ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {isVehicleFriendly
                        ? pickL('✓ आपके मूलांक के अनुकूल शुभ वाहन नंबर!', '✓ Auspicious vehicle number for you!', '✓ તમારા મૂળાંકને અનુકૂળ શુભ વાહન નંબર!')
                        : pickL('⚠️ सामान्य / प्रतिकूल वाहन नंबर।', '⚠️ Neutral / Challenging vehicle number.', '⚠️ સામાન્ય / પ્રતિકૂળ વાહન નંબર.')}
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
                  {pickL(
                    `व्यक्तिगत वर्ष ${new Date().getFullYear()} फलादेश`,
                    `Personal Year ${new Date().getFullYear()} Forecast`,
                    `વ્યક્તિગત વર્ષ ${new Date().getFullYear()} ફળાદેશ`
                  )}
                </h2>
                <p className="text-xs text-[#8C6239]">
                  {pickL('Personal Year Number:', 'Personal Year Number:', 'વ્યક્તિગત વર્ષ અંક:')} <strong>{pickL(`अंक ${personalYear.yearNum}`, `Number ${personalYear.yearNum}`, `અંક ${personalYear.yearNum}`)}</strong>
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 space-y-2 text-xs">
                <div className="text-base font-black text-[#5C3A21] font-granth">
                  {pickL(personalYear.theme, personalYear.themeEn, personalYear.themeGu)}
                </div>
                <p className="text-xs text-[#3E2714] leading-relaxed">
                  {pickL(personalYear.advice, personalYear.adviceEn, personalYear.adviceGu)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Ask Uma Bar */}
      <div className="p-2.5 bg-white border-t border-amber-200 shrink-0 flex items-center justify-between gap-2">
        <span className="text-xs text-[#8C6239] font-medium truncate">
          {pickL(
            `मूलांक ${mulankNum} • भाग्यांक ${bhagyankNum} • नामांक ${namankData.single} के अनुसार शुभ व्यवसाय व नाम सुधार`,
            `Career & name guidance for Root ${mulankNum} • Destiny ${bhagyankNum} • Name ${namankData.single}`,
            `મૂળાંક ${mulankNum} • ભાગ્યાંક ${bhagyankNum} • નામાંક ${namankData.single} મુજબ શુભ વ્યવસાય અને નામ સુધારણા`
          )}
        </span>
        <div className="flex items-center gap-1.5 shrink-0">
          {activeTab !== 'uma_ank' && (
            <button
              type="button"
              onClick={() => setActiveTab('uma_ank')}
              className="px-3 py-1.5 rounded-xl bg-[#7A1D1D] text-[#FFD88A] text-xs font-bold flex items-center gap-1 hover:bg-[#5C1414] transition cursor-pointer shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>{pickL('उमा अंक परामर्श', 'Uma Reading', 'ઉમા અંક પરામર્શ')}</span>
            </button>
          )}
          {onOpenUmaWithQuery && (
            <button
              type="button"
              onClick={() => onOpenUmaWithQuery(buildFullNumerologyPrompt())}
              className="px-3 py-1.5 rounded-xl bg-[#5C3A21] text-amber-200 text-xs font-bold flex items-center gap-1 hover:bg-[#462B17] transition cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
              <span>{pickL('उमा संवाद', 'Ask Uma', 'ઉમા સંવાદ')}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NumerologyView;
