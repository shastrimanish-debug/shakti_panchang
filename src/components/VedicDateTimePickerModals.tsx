import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../i18n';

interface VedicDatePickerModalProps {
  isOpen: boolean;
  value: string; // YYYY-MM-DD
  onChange: (val: string) => void;
  onClose: () => void;
  title?: string;
}

const MONTH_NAMES: Record<string, string[]> = {
  hi: ['जनवरी', 'फरवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'],
  gu: ['જાન્યુઆરી', 'ફેબ્રુઆરી', 'માર્ચ', 'એપ્રિલ', 'મે', 'જૂન', 'જુલાઈ', 'ઑગસ્ટ', 'સપ્ટેમ્બર', 'ઑક્ટોબર', 'નવેમ્બર', 'ડિસેમ્બર'],
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  mr: ['जानेवारी', 'फेब्रुवारी', 'मार्च', 'एप्रिल', 'मे', 'जून', 'जुलै', 'ऑगस्ट', 'सप्टेंबर', 'ऑक्टोबर', 'नोव्हेंबर', 'डिसेंबर'],
  bn: ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'],
  ta: ['ஜனவரி', 'பிப்ரவரி', 'மார்ச்', 'ஏப்ரல்', 'மே', 'ஜூன்', 'ஜூலை', 'ஆகஸ்ட்', 'செப்டம்பர்', 'அக்டோபர்', 'நவம்பர்', 'டிசம்பர்'],
  te: ['జనవరి', 'ఫిబ్రవరి', 'మార్చి', 'ఏప్రిల్', 'మే', 'జూన్', 'జూలై', 'ఆగస్టు', 'సెప్టెంబర్', 'అక్టోబర్', 'నవంబర్', 'డిసెంబర్'],
  kn: ['ಜನವರಿ', 'ಫೆಬ್ರವರಿ', 'ಮಾರ್ಚ್', 'ಏಪ್ರಿಲ್', 'ಮೇ', 'ಜೂನ್', 'ಜುಲೈ', 'ಆಗಸ್ಟ್', 'ಸೆಪ್ಟೆಂಬರ್', 'ಅಕ್ಟೋಬರ್', 'ನವೆಂಬರ್', 'ಡಿಸೆಂಬರ್'],
  ml: ['ജനുവരി', 'ഫെബ്രുവരി', 'മാർച്ച്', 'ഏപ്രിൽ', 'മെയ്', 'ജൂൺ', 'ജൂലൈ', 'ഓഗസ്റ്റ്', 'സെപ്റ്റംബർ', 'ഒക്ടോബർ', 'നവംബർ', 'ഡിസംബർ'],
  pa: ['ਜਨਵਰੀ', 'ਫ਼ਰਵਰੀ', 'ਮਾਰਚ', 'ਅਪ੍ਰੈਲ', 'ਮਈ', 'ਜੂਨ', 'ਜੁਲਾਈ', 'ਅਗਸਤ', 'ਸਤੰਬਰ', 'ਅਕਤੂਬਰ', 'ਨਵੰਬਰ', 'ਦਸੰਬਰ'],
  or: ['ଜାନୁଆରୀ', 'ଫେବୃଆରୀ', 'ମାର୍ଚ୍ଚ', 'ଏପ୍ରିଲ', 'ମେ', 'ଜୁନ', 'ଜୁଲାଇ', 'ଅଗଷ୍ଟ', 'ସେପ୍ଟେମ୍ବର', 'ଅକ୍ଟୋବର', 'ନଭେମ୍ବର', 'ଡିସେମ୍ବର'],
};

const WEEKDAY_NAMES: Record<string, string[]> = {
  hi: ['रवि', 'सोम', 'मंगल', 'बुध', 'गुरु', 'शुक्र', 'शनि'],
  gu: ['રવિ', 'સોમ', 'મંગળ', 'બુધ', 'ગુરુ', 'શુક્ર', 'શનિ'],
  en: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
  mr: ['रवि', 'सोम', 'मंगळ', 'बुध', 'गुरु', 'शुक्र', 'शनि'],
  bn: ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহ', 'শুক্র', 'শনি'],
  ta: ['ஞாயி', 'திங்', 'செவ்', 'புத', 'வியா', 'வெள்', 'சனி'],
  te: ['ఆది', 'సోమ', 'మంగళ', 'బుధ', 'గురు', 'శుక్ర', 'శని'],
  kn: ['ಭಾನು', 'ಸೋಮ', 'ಮಂಗಳ', 'ಬುಧ', 'ಗುರು', 'ಶುಕ್ರ', 'ಶನಿ'],
  ml: ['ഞായർ', 'തിങ്കൾ', 'ചൊവ്വ', 'ബുധൻ', 'വ്യാഴം', 'വെള്ളി', 'ശനി'],
  pa: ['ਐਤ', 'ਸੋਮ', 'ਮੰਗਲ', 'ਬੁੱਧ', 'ਵੀਰ', 'ਸ਼ੁੱਕਰ', 'ਸ਼ਨੀ'],
  or: ['ରବି', 'ସୋମ', 'ମଙ୍ଗଳ', 'ବୁଧ', 'ଗୁରୁ', 'ଶୁକ୍ର', 'ଶନି'],
};

export const VedicDatePickerModal: React.FC<VedicDatePickerModalProps> = ({
  isOpen,
  value,
  onChange,
  onClose,
  title,
}) => {
  const { language } = useLanguage();
  const months = MONTH_NAMES[language] || MONTH_NAMES.hi;
  const weekdays = WEEKDAY_NAMES[language] || WEEKDAY_NAMES.hi;

  const getInitialYMD = () => {
    if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const [y, m, d] = value.split('-').map(Number);
      return { y, m: m - 1, d };
    }
    const now = new Date();
    return { y: now.getFullYear(), m: now.getMonth(), d: now.getDate() };
  };

  const [selectedY, setSelectedY] = useState<number>(() => getInitialYMD().y);
  const [selectedM, setSelectedM] = useState<number>(() => getInitialYMD().m);
  const [selectedD, setSelectedD] = useState<number>(() => getInitialYMD().d);
  const [viewMode, setViewMode] = useState<'calendar' | 'months' | 'years'>('calendar');

  useEffect(() => {
    if (isOpen) {
      const init = getInitialYMD();
      setSelectedY(init.y);
      setSelectedM(init.m);
      setSelectedD(init.d);
      setViewMode('calendar');
    }
  }, [isOpen, value]);

  if (!isOpen) return null;

  const daysInMonth = new Date(selectedY, selectedM + 1, 0).getDate();
  const firstDayOfWeek = new Date(selectedY, selectedM, 1).getDay();
  const safeDay = Math.min(selectedD, daysInMonth);

  const handleApply = () => {
    const mm = String(selectedM + 1).padStart(2, '0');
    const dd = String(safeDay).padStart(2, '0');
    onChange(`${selectedY}-${mm}-${dd}`);
    onClose();
  };

  const handleSetToday = () => {
    const now = new Date();
    setSelectedY(now.getFullYear());
    setSelectedM(now.getMonth());
    setSelectedD(now.getDate());
    setViewMode('calendar');
  };

  const yearsList: number[] = [];
  for (let y = 2035; y >= 1920; y--) {
    yearsList.push(y);
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 bg-black/65 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        style={{
          backgroundColor: '#FFFDF9',
          borderColor: '#8C6239',
        }}
        className="w-full max-w-sm rounded-2xl border-2 shadow-2xl overflow-hidden flex flex-col text-[#3E2714]"
      >
        {/* Header */}
        <div className="bg-[#5C2612] text-[#FFF6E8] p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-300" />
            <h3 className="font-bold text-sm font-granth">
              {title || (language === 'gu' ? 'જન્મ તારીખ પસંદ કરો' : language === 'en' ? 'Select Date of Birth' : 'जन्म तिथि चुनें')}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-white/80 hover:text-white rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Date Summary Display */}
        <div className="bg-[#FAF2E4] border-b border-[#DFCBB5] p-2.5 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">
              {language === 'gu' ? 'પસંદ કરેલ તારીખ' : language === 'en' ? 'Selected Date' : 'चयनित तिथि'}
            </div>
            <div className="font-granth font-black text-base text-[#78350F]">
              {safeDay} {months[selectedM]} {selectedY}
            </div>
          </div>
          <button
            type="button"
            onClick={handleSetToday}
            className="px-2.5 py-1 text-xs font-bold rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 cursor-pointer transition"
          >
            {language === 'gu' ? '📅 આજ' : language === 'en' ? '📅 Today' : '📅 आज'}
          </button>
        </div>

        {/* Month Selector Grid View */}
        {viewMode === 'months' && (
          <div className="p-3 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#8C6239]">
                {language === 'gu' ? 'માસ પસંદ કરો' : language === 'en' ? 'Select Month' : 'माह चुनें'}
              </span>
              <button
                type="button"
                onClick={() => setViewMode('calendar')}
                className="text-xs font-bold text-amber-800 hover:underline cursor-pointer"
              >
                ✕ {language === 'gu' ? 'કેલેન્ડર' : language === 'en' ? 'Calendar' : 'कैलेंडर'}
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {months.map((m, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setSelectedM(idx);
                    setViewMode('calendar');
                  }}
                  className={`py-2 px-1 rounded-xl text-xs font-bold transition cursor-pointer active:scale-95 ${
                    selectedM === idx
                      ? 'bg-[#C2410C] text-white shadow-sm ring-1 ring-amber-400 font-black'
                      : 'bg-[#FAF5ED] hover:bg-amber-100 text-[#4A2810] border border-amber-900/15'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Year Selector View */}
        {viewMode === 'years' && (
          <div className="p-3 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#8C6239]">
                {language === 'gu' ? 'વર્ષ પસંદ કરો' : language === 'en' ? 'Select Year' : 'वर्ष चुनें'}
              </span>
              <button
                type="button"
                onClick={() => setViewMode('calendar')}
                className="text-xs font-bold text-amber-800 hover:underline cursor-pointer"
              >
                ✕ {language === 'gu' ? 'કેલેન્ડર' : language === 'en' ? 'Calendar' : 'कैलेंडर'}
              </button>
            </div>

            {/* Quick +/- Stepper */}
            <div className="flex items-center justify-center gap-1.5 bg-[#FAF2E4] p-1.5 rounded-xl border border-[#DFCBB5]">
              <button
                type="button"
                onClick={() => setSelectedY((y) => Math.max(1920, y - 10))}
                className="px-2 py-1 rounded bg-stone-200 hover:bg-stone-300 text-stone-800 text-[11px] font-bold cursor-pointer"
                title="-10 वर्ष"
              >
                -10
              </button>
              <button
                type="button"
                onClick={() => setSelectedY((y) => Math.max(1920, y - 1))}
                className="px-2 py-1 rounded bg-stone-200 hover:bg-stone-300 text-stone-800 text-[11px] font-bold cursor-pointer"
                title="-1 वर्ष"
              >
                -1
              </button>
              <span className="font-granth font-black text-lg text-[#78350F] px-3">
                {selectedY}
              </span>
              <button
                type="button"
                onClick={() => setSelectedY((y) => Math.min(2035, y + 1))}
                className="px-2 py-1 rounded bg-stone-200 hover:bg-stone-300 text-stone-800 text-[11px] font-bold cursor-pointer"
                title="+1 वर्ष"
              >
                +1
              </button>
              <button
                type="button"
                onClick={() => setSelectedY((y) => Math.min(2035, y + 10))}
                className="px-2 py-1 rounded bg-stone-200 hover:bg-stone-300 text-stone-800 text-[11px] font-bold cursor-pointer"
                title="+10 वर्ष"
              >
                +10
              </button>
            </div>

            {/* Decade Chips */}
            <div className="flex flex-wrap gap-1 justify-center py-0.5">
              {[1950, 1960, 1970, 1980, 1985, 1990, 1995, 2000, 2005, 2010, 2015, 2020, 2025].map((quickYear) => (
                <button
                  key={quickYear}
                  type="button"
                  onClick={() => setSelectedY(quickYear)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                    selectedY === quickYear
                      ? 'bg-[#8C4A00] text-white shadow-2xs font-black'
                      : 'bg-stone-200 hover:bg-stone-300 text-stone-800'
                  }`}
                >
                  {quickYear}
                </button>
              ))}
            </div>

            {/* Scrollable Years Grid */}
            <div className="max-h-48 overflow-y-auto grid grid-cols-4 gap-1.5 p-1 bg-stone-100/60 rounded-xl border border-stone-200">
              {yearsList.map((y) => (
                <button
                  key={y}
                  type="button"
                  onClick={() => {
                    setSelectedY(y);
                    setViewMode('calendar');
                  }}
                  className={`py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    selectedY === y
                      ? 'bg-[#C2410C] text-white shadow-sm ring-1 ring-amber-400 font-black'
                      : 'bg-white hover:bg-amber-50 text-[#4A2810] border border-stone-200'
                  }`}
                >
                  {y}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Default Calendar View */}
        {viewMode === 'calendar' && (
          <div className="p-3 space-y-2.5">
            {/* Year & Month Control Bar */}
            <div className="flex items-center justify-between gap-1">
              <button
                type="button"
                onClick={() => {
                  if (selectedM === 0) {
                    setSelectedM(11);
                    setSelectedY((y) => Math.max(1920, y - 1));
                  } else {
                    setSelectedM((m) => m - 1);
                  }
                }}
                className="p-1.5 rounded-lg border border-stone-300 bg-stone-100 hover:bg-stone-200 cursor-pointer text-stone-700 active:scale-95"
                title="पिछला माह"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Month Toggle Button */}
              <button
                type="button"
                onClick={() => setViewMode('months')}
                className="flex-1 py-1.5 px-2 rounded-lg border border-[#8C6239]/40 bg-[#FFF8F0] hover:bg-amber-100/60 font-bold text-xs text-[#5C3A21] flex items-center justify-center gap-1 cursor-pointer transition"
              >
                <span>{months[selectedM]}</span>
                <span className="text-[10px] text-amber-700">▾</span>
              </button>

              {/* Year Toggle Button */}
              <button
                type="button"
                onClick={() => setViewMode('years')}
                className="w-24 py-1.5 px-2 rounded-lg border border-[#8C6239]/40 bg-[#FFF8F0] hover:bg-amber-100/60 font-bold text-xs text-[#5C3A21] flex items-center justify-center gap-1 cursor-pointer transition"
              >
                <span>{selectedY}</span>
                <span className="text-[10px] text-amber-700">▾</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (selectedM === 11) {
                    setSelectedM(0);
                    setSelectedY((y) => Math.min(2035, y + 1));
                  } else {
                    setSelectedM((m) => m + 1);
                  }
                }}
                className="p-1.5 rounded-lg border border-stone-300 bg-stone-100 hover:bg-stone-200 cursor-pointer text-stone-700 active:scale-95"
                title="अगला माह"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Decade Jump Chips */}
            <div className="flex items-center justify-between gap-1 overflow-x-auto py-0.5">
              {[1970, 1980, 1990, 1995, 2000, 2005, 2010, 2020].map((quickYear) => (
                <button
                  key={quickYear}
                  type="button"
                  onClick={() => setSelectedY(quickYear)}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition cursor-pointer shrink-0 ${
                    selectedY === quickYear
                      ? 'bg-[#8C4A00] text-white shadow-2xs font-black'
                      : 'bg-stone-200/80 hover:bg-stone-300 text-stone-800'
                  }`}
                >
                  {quickYear}
                </button>
              ))}
            </div>

            {/* Weekday Names Row */}
            <div className="grid grid-cols-7 gap-1 text-center font-bold text-[10px] text-[#8C6239] pb-0.5 border-b border-stone-200">
              {weekdays.map((w, idx) => (
                <div key={idx} className={idx === 0 ? 'text-red-700' : ''}>
                  {w}
                </div>
              ))}
            </div>

            {/* Days Grid (1 to 31 with first day offset) */}
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                <div key={`empty-${i}`} className="py-2" />
              ))}
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => {
                const isSelected = d === safeDay;
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setSelectedD(d)}
                    className={`py-1.5 rounded-lg font-bold text-xs flex items-center justify-center transition cursor-pointer active:scale-95 ${
                      isSelected
                        ? 'bg-[#C2410C] text-white shadow-sm ring-2 ring-amber-400 font-black'
                        : 'bg-[#FAF5ED] hover:bg-amber-100 text-[#4A2810] border border-amber-900/15'
                    }`}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="p-3 bg-[#FAF2E4] border-t border-[#DFCBB5] flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 px-3 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-200 font-bold text-xs transition cursor-pointer"
          >
            {language === 'gu' ? 'રદ કરો' : language === 'en' ? 'Cancel' : 'रद्द करें'}
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="flex-1 py-2 px-3 rounded-xl bg-[#8C4A00] hover:bg-[#6e3700] text-white font-bold text-xs transition shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>{language === 'gu' ? 'તારીખ સેટ કરો' : language === 'en' ? 'Set Date' : 'तिथि सेट करें'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

interface VedicTimePickerModalProps {
  isOpen: boolean;
  value: string; // HH:MM 24h format
  onChange: (val: string) => void;
  onClose: () => void;
  title?: string;
}

export const VedicTimePickerModal: React.FC<VedicTimePickerModalProps> = ({
  isOpen,
  value,
  onChange,
  onClose,
  title,
}) => {
  const { language } = useLanguage();

  const getInitialTime = () => {
    if (value && /^\d{1,2}:\d{2}/.test(value)) {
      const [hStr, mStr] = value.split(':');
      let h = parseInt(hStr, 10);
      const m = parseInt(mStr, 10);
      if (!isNaN(h) && !isNaN(m)) {
        const isPm = h >= 12;
        let h12 = h % 12;
        if (h12 === 0) h12 = 12;
        return { h12, m, isPm };
      }
    }
    const now = new Date();
    const h = now.getHours();
    const isPm = h >= 12;
    let h12 = h % 12;
    if (h12 === 0) h12 = 12;
    return { h12, m: now.getMinutes(), isPm };
  };

  const [hour12, setHour12] = useState<number>(() => getInitialTime().h12);
  const [minute, setMinute] = useState<number>(() => getInitialTime().m);
  const [isPm, setIsPm] = useState<boolean>(() => getInitialTime().isPm);

  useEffect(() => {
    if (isOpen) {
      const init = getInitialTime();
      setHour12(init.h12);
      setMinute(init.m);
      setIsPm(init.isPm);
    }
  }, [isOpen, value]);

  if (!isOpen) return null;

  const handleApply = () => {
    let h24 = hour12;
    if (isPm) {
      if (h24 < 12) h24 += 12;
    } else {
      if (h24 === 12) h24 = 0;
    }
    const hh = String(h24).padStart(2, '0');
    const mm = String(minute).padStart(2, '0');
    onChange(`${hh}:${mm}`);
    onClose();
  };

  const handleSetNow = () => {
    const now = new Date();
    const h = now.getHours();
    setIsPm(h >= 12);
    let h12 = h % 12;
    if (h12 === 0) h12 = 12;
    setHour12(h12);
    setMinute(now.getMinutes());
  };

  const displayTime = `${String(hour12).padStart(2, '0')}:${String(minute).padStart(2, '0')} ${
    isPm ? (language === 'gu' ? 'બપોર પછી (PM)' : 'सायं/दोपहर (PM)') : (language === 'gu' ? 'સવાર (AM)' : 'प्रातः (AM)')
  }`;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 bg-black/65 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        style={{
          backgroundColor: '#FFFDF9',
          borderColor: '#8C6239',
        }}
        className="w-full max-w-sm rounded-2xl border-2 shadow-2xl overflow-hidden flex flex-col text-[#3E2714]"
      >
        {/* Header */}
        <div className="bg-[#5C2612] text-[#FFF6E8] p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-300" />
            <h3 className="font-bold text-sm font-granth">
              {title || (language === 'gu' ? 'જન્મ સમય પસંદ કરો' : language === 'en' ? 'Select Birth Time' : 'जन्म समय चुनें')}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-white/80 hover:text-white rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Time Big Display */}
        <div className="bg-[#FAF2E4] border-b border-[#DFCBB5] p-3 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">
              {language === 'gu' ? 'પસંદ કરેલ સમય' : language === 'en' ? 'Selected Time' : 'चयनित समय'}
            </div>
            <div className="font-granth font-black text-xl text-[#78350F]">
              {displayTime}
            </div>
          </div>
          <button
            type="button"
            onClick={handleSetNow}
            className="px-2.5 py-1 text-xs font-bold rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 cursor-pointer transition"
          >
            {language === 'gu' ? '⏰ હમણાં' : language === 'en' ? '⏰ Now' : '⏰ अभी'}
          </button>
        </div>

        <div className="p-3.5 space-y-3.5">
          {/* AM / PM Toggle */}
          <div className="grid grid-cols-2 gap-2 bg-stone-200/80 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setIsPm(false)}
              className={`py-1.5 rounded-lg font-bold text-xs transition cursor-pointer ${
                !isPm
                  ? 'bg-amber-700 text-white shadow-xs'
                  : 'text-stone-700 hover:text-stone-900'
              }`}
            >
              {language === 'gu' ? 'સવાર (AM)' : language === 'en' ? 'AM (Morning)' : 'प्रातः (AM)'}
            </button>
            <button
              type="button"
              onClick={() => setIsPm(true)}
              className={`py-1.5 rounded-lg font-bold text-xs transition cursor-pointer ${
                isPm
                  ? 'bg-amber-700 text-white shadow-xs'
                  : 'text-stone-700 hover:text-stone-900'
              }`}
            >
              {language === 'gu' ? 'બપોર/સાંજ (PM)' : language === 'en' ? 'PM (Evening)' : 'दोपहर/सायं (PM)'}
            </button>
          </div>

          {/* Hour Selector (1 to 12) */}
          <div>
            <label className="text-[11px] font-bold text-stone-600 block mb-1">
              {language === 'gu' ? 'કલાક (Hour):' : language === 'en' ? 'Hour:' : 'घंटा (Hour):'}
            </label>
            <div className="grid grid-cols-6 gap-1.5">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((h) => {
                const isSelected = h === hour12;
                return (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setHour12(h)}
                    className={`py-1.5 rounded-lg font-bold text-xs flex items-center justify-center transition cursor-pointer ${
                      isSelected
                        ? 'bg-[#C2410C] text-white shadow-sm ring-1 ring-amber-400 font-black'
                        : 'bg-[#FAF5ED] hover:bg-amber-100 text-[#4A2810] border border-amber-900/15'
                    }`}
                  >
                    {String(h).padStart(2, '0')}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Minute Chips */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-bold text-stone-600">
                {language === 'gu' ? 'મિનિટ (Minute):' : language === 'en' ? 'Minute:' : 'मिनट (Minute):'}
              </label>
              <span className="font-mono text-xs font-black text-amber-800">
                :{String(minute).padStart(2, '0')}
              </span>
            </div>
            <div className="grid grid-cols-6 gap-1 mb-2">
              {[0, 15, 30, 45, 50, 55].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMinute(m)}
                  className={`py-1 rounded text-[11px] font-bold transition cursor-pointer ${
                    minute === m
                      ? 'bg-[#8C4A00] text-white shadow-2xs'
                      : 'bg-stone-200 hover:bg-stone-300 text-stone-800'
                  }`}
                >
                  :{String(m).padStart(2, '0')}
                </button>
              ))}
            </div>

            {/* Minute Slider for 0-59 precision */}
            <input
              type="range"
              min={0}
              max={59}
              value={minute}
              onChange={(e) => setMinute(Number(e.target.value))}
              className="w-full accent-[#C2410C] cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-stone-400 font-mono mt-0.5">
              <span>:00</span>
              <span>:15</span>
              <span>:30</span>
              <span>:45</span>
              <span>:59</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-3 bg-[#FAF2E4] border-t border-[#DFCBB5] flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 px-3 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-200 font-bold text-xs transition cursor-pointer"
          >
            {language === 'gu' ? 'રદ કરો' : language === 'en' ? 'Cancel' : 'रद्द करें'}
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="flex-1 py-2 px-3 rounded-xl bg-[#8C4A00] hover:bg-[#6e3700] text-white font-bold text-xs transition shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>{language === 'gu' ? 'સમય સેટ કરો' : language === 'en' ? 'Set Time' : 'समय सेट करें'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
