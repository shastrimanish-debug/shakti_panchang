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
  mr: ['जानेवारी', 'फेब्रुवारी', 'मार्च', 'एप्रिल', 'मे', 'जून', 'जुलै', 'ऑगस्ट', 'सप्टेंबर', 'ऑक्टोबर', 'नोव्हेंबर', 'डಿಸेंबर'],
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
  const [viewMode, setViewMode] = useState<'calendar' | 'yearPicker'>('calendar');

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

        {/* Year & Month Control Bar */}
        <div className="p-3 space-y-3">
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
              className="p-1.5 rounded-lg border border-stone-300 bg-stone-100 hover:bg-stone-200 cursor-pointer text-stone-700"
              title="पिछला माह"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Month Dropdown */}
            <select
              value={selectedM}
              onChange={(e) => setSelectedM(Number(e.target.value))}
              className="flex-1 py-1 px-2 rounded-lg border border-[#8C6239]/40 bg-[#FFF8F0] font-bold text-xs text-[#5C3A21] focus:ring-1 focus:ring-amber-600 outline-none cursor-pointer"
            >
              {months.map((m, idx) => (
                <option key={idx} value={idx}>
                  {m}
                </option>
              ))}
            </select>

            {/* Year Dropdown / Picker Toggle */}
            <select
              value={selectedY}
              onChange={(e) => setSelectedY(Number(e.target.value))}
              className="w-24 py-1 px-2 rounded-lg border border-[#8C6239]/40 bg-[#FFF8F0] font-bold text-xs text-[#5C3A21] focus:ring-1 focus:ring-amber-600 outline-none cursor-pointer"
            >
              {yearsList.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>

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
              className="p-1.5 rounded-lg border border-stone-300 bg-stone-100 hover:bg-stone-200 cursor-pointer text-stone-700"
              title="अगला माह"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Decade Jump Chips */}
          <div className="flex items-center justify-between gap-1 overflow-x-auto py-0.5">
            {[1980, 1990, 1995, 2000, 2005, 2010, 2020].map((quickYear) => (
              <button
                key={quickYear}
                type="button"
                onClick={() => setSelectedY(quickYear)}
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition cursor-pointer shrink-0 ${
                  selectedY === quickYear
                    ? 'bg-[#8C4A00] text-white shadow-2xs'
                    : 'bg-stone-200/80 hover:bg-stone-300 text-stone-800'
                }`}
              >
                {quickYear}
              </button>
            ))}
          </div>

          {/* Days Grid (1 to 31) */}
          <div className="grid grid-cols-7 gap-1.5 pt-1">
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => {
              const isSelected = d === safeDay;
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => setSelectedD(d)}
                  className={`py-2 rounded-lg font-bold text-xs flex items-center justify-center transition cursor-pointer active:scale-95 ${
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
