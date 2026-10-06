import React, { useState, useMemo } from 'react';
import { getKalnirnayMonthData, KalnirnayDayData } from '../services/kalnirnay';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Flame,
  Moon,
  Sun,
  Star,
  Bell,
  Download,
  Share2,
  CalendarPlus,
  Check,
  Filter,
  Info,
} from 'lucide-react';
import { saveAppReminder } from '../services/storage';
import { getGoogleCalendarUrl, generateSingleEventICS, downloadICSBlob } from '../services/calendarExport';
import { useLanguage } from '../i18n';
import { trVedic } from '../i18n/vedicTranslate';

interface KalnirnayMonthViewProps {
  currentDate: Date;
  onDateSelect?: (date: Date) => void;
  onNavigateToReminders?: () => void;
}

export const KalnirnayMonthView: React.FC<KalnirnayMonthViewProps> = ({
  currentDate,
  onDateSelect,
  onNavigateToReminders,
}) => {
  const { language } = useLanguage();
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear() || 2026);
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth() || 8); // 0-indexed
  const [selectedDayNumber, setSelectedDayNumber] = useState<number>(currentDate.getDate() || 1);
  const [activeFilter, setActiveFilter] = useState<'all' | 'ekadashi' | 'pradosh' | 'purnima_amavasya' | 'festivals' | 'sunday'>('all');
  const [addedReminderId, setAddedReminderId] = useState<string | null>(null);

  // Compute month data
  const monthData = useMemo(() => {
    return getKalnirnayMonthData(selectedYear, selectedMonth);
  }, [selectedYear, selectedMonth]);

  // Selected Day Data
  const selectedDay = useMemo(() => {
    return (
      monthData.days.find((d) => d.dayNumber === selectedDayNumber) ||
      monthData.days[0]
    );
  }, [monthData, selectedDayNumber]);

  // Year options (1925 to 2125)
  const yearOptions = useMemo(() => {
    const list: number[] = [];
    for (let y = 1925; y <= 2125; y++) list.push(y);
    return list;
  }, []);

  const HINDI_MONTHS = [
    'जनवरी (पौष - माघ)',
    'फरवरी (माघ - फाल्गुन)',
    'मार्च (फाल्गुन - चैत्र)',
    'अप्रैल (चैत्र - वैशाख)',
    'मई (वैशाख - ज्येष्ठ)',
    'जून (ज्येष्ठ - आषाढ़)',
    'जुलाई (आषाढ़ - श्रावण)',
    'अगस्त (श्रावण - भाद्रपद)',
    'सितम्बर (भाद्रपद - आश्विन)',
    'अक्टूबर (आश्विन - कार्तिक)',
    'नवम्बर (कार्तिक - मार्गशीर्ष)',
    'दिसम्बर (मार्गशीर्ष - पौष)',
  ];

  const GUJARATI_MONTHS = [
    'જાન્યુઆરી (પોષ - મહા)',
    'ફેબ્રુઆરી (મહા - ફાગણ)',
    'માર્ચ (ફાગણ - ચૈત્ર)',
    'એપ્રિલ (ચૈત્ર - વૈશાખ)',
    'મે (વૈશાખ - જેઠ)',
    'જૂન (જેઠ - અષાઢ)',
    'જુલાઈ (અષાઢ - શ્રાવણ)',
    'ઓગસ્ટ (શ્રાવણ - ભાદરવો)',
    'સપ્ટેમ્બર (ભાદરવો - આસો)',
    'ઓક્ટોબર (આસો - કારતક)',
    'નવેમ્બર (કારતક - માગશર)',
    'ડિસેમ્બર (માગશર - પોષ)',
  ];

  const ENGLISH_MONTHS = [
    'January (Pausha - Magha)',
    'February (Magha - Phalguna)',
    'March (Phalguna - Chaitra)',
    'April (Chaitra - Vaishakha)',
    'May (Vaishakha - Jyeshtha)',
    'June (Jyeshtha - Ashadha)',
    'July (Ashadha - Shravana)',
    'August (Shravana - Bhadrapada)',
    'September (Bhadrapada - Ashwin)',
    'October (Ashwin - Kartika)',
    'November (Kartika - Margashirsha)',
    'December (Margashirsha - Pausha)',
  ];

  const localizedMonthOptions = language === 'gu' ? GUJARATI_MONTHS : language === 'en' ? ENGLISH_MONTHS : HINDI_MONTHS;

  // Navigation handlers
  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedYear((prev) => Math.max(1925, prev - 1));
      setSelectedMonth(11);
    } else {
      setSelectedMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedYear((prev) => Math.min(2125, prev + 1));
      setSelectedMonth(0);
    } else {
      setSelectedMonth((prev) => prev + 1);
    }
  };

  const handleGoToday = () => {
    const now = new Date();
    setSelectedYear(now.getFullYear());
    setSelectedMonth(now.getMonth());
    setSelectedDayNumber(now.getDate());
  };

  const handleAddReminder = (day: KalnirnayDayData) => {
    const festName = day.festivals[0]?.hindiName || day.primaryBadge?.text || day.tithiName;
    saveAppReminder({
      id: `kalnirnay-${day.dayNumber}-${Date.now()}`,
      title: `${festName} (${day.tithiName})`,
      category: day.isEkadashi || day.isPradosh ? 'vrat' : 'festival',
      date: day.date.toISOString().split('T')[0],
      body: `${day.paksha} की ${day.tithiName} तिथि का पावन व्रत व पूजन।`,
      notes: `${day.paksha} की ${day.tithiName} तिथि का पावन व्रत व पूजन।`,
      createdAt: Date.now(),
    });
    setAddedReminderId(String(day.dayNumber));
    setTimeout(() => setAddedReminderId(null), 2500);
  };

  const handleExportICS = (day: KalnirnayDayData) => {
    const festName = day.festivals[0]?.hindiName || day.primaryBadge?.text || day.tithiName;
    const item = {
      id: `kalnirnay-${day.dayNumber}-${day.date.getTime()}`,
      name: festName,
      date: day.date.toISOString().split('T')[0],
      category: day.isEkadashi || day.isPradosh ? 'व्रत' : 'पर्व',
      description: `${day.paksha} ${day.tithiName}`,
      tithi: day.tithiName,
    };
    const icsContent = generateSingleEventICS(item);
    downloadICSBlob(icsContent, `${festName}-${day.dayNumber}.ics`);
  };

  // Filter check
  const isDayMatchingFilter = (d: KalnirnayDayData) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'ekadashi') return d.isEkadashi;
    if (activeFilter === 'pradosh') return d.isPradosh;
    if (activeFilter === 'purnima_amavasya') return d.isPurnima || d.isAmavasya;
    if (activeFilter === 'festivals') return d.festivals.length > 0;
    if (activeFilter === 'sunday') return d.isSunday;
    return true;
  };

  return (
    <div className="space-y-5">
      {/* 1. Header Bar: Month, Year, Samvat & Controls */}
      <div className="bg-[#FAF2E4] border border-[#8C6239]/40 rounded-xl p-3.5 sm:p-5 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#B56A00]" />
              <h2 className="text-base sm:text-xl font-bold font-granth text-[#5C3A21]">
                {language === 'gu'
                  ? 'માસિક પંચાંગ કેલેન્ડર'
                  : language === 'en'
                  ? 'Monthly Panchang Calendar'
                  : 'मासिक पंचांग (Monthly Calendar)'}
              </h2>
            </div>
            <p className="text-xs text-[#735133] mt-0.5">
              {trVedic(monthData.monthNameHindi)} • {language === 'gu' ? 'વિક્રમ સંવત' : language === 'en' ? 'Vikram Samvat' : 'विक्रम संवत'} {monthData.vikramSamvat} • {language === 'gu' ? 'શક સંવત' : language === 'en' ? 'Shaka Samvat' : 'शक संवत'} {selectedYear - 78}
            </p>
          </div>

          {/* Quick Month Selectors */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 sm:px-2.5 sm:py-1.5 bg-[#F4E8D1] hover:bg-[#E5D2B8] border border-[#8C6239]/40 text-[#5C3A21] text-xs font-bold rounded-lg transition flex items-center gap-1 cursor-pointer active:scale-95"
              title={language === 'gu' ? 'પાછલો માસ' : language === 'en' ? 'Previous Month' : 'पिछला माह'}
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">{language === 'gu' ? 'પાછલો માસ' : language === 'en' ? 'Prev' : 'पिछला माह'}</span>
            </button>

            <button
              type="button"
              onClick={handleGoToday}
              className="px-2.5 py-1.5 bg-[#5C3A21] hover:bg-[#462B17] text-[#FFD88A] border border-[#B56A00] text-xs font-bold rounded-lg transition shadow-xs cursor-pointer active:scale-95"
            >
              {language === 'gu' ? 'આજે' : language === 'en' ? 'Today' : 'आज'}
            </button>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 sm:px-2.5 sm:py-1.5 bg-[#F4E8D1] hover:bg-[#E5D2B8] border border-[#8C6239]/40 text-[#5C3A21] text-xs font-bold rounded-lg transition flex items-center gap-1 cursor-pointer active:scale-95"
              title={language === 'gu' ? 'આગલો માસ' : language === 'en' ? 'Next Month' : 'अगला माह'}
            >
              <span className="hidden sm:inline">{language === 'gu' ? 'આગલો માસ' : language === 'en' ? 'Next' : 'अगला माह'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Dropdowns for Year & Month Jump */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-[#8C6239]/20">
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-[#5C3A21]">{language === 'gu' ? 'માસ:' : language === 'en' ? 'Month:' : 'माह:'}</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="bg-[#F4E8D1] border border-[#8C6239]/40 text-[#5C3A21] text-xs font-bold rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-[#B56A00] outline-hidden cursor-pointer"
            >
              {localizedMonthOptions.map((mName, idx) => (
                <option key={idx} value={idx}>
                  {mName}
                </option>
              ))}
            </select>

            <label className="text-xs font-bold text-[#5C3A21] ml-1">{language === 'gu' ? 'વર્ષ:' : language === 'en' ? 'Year:' : 'वर्ष:'}</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-[#F4E8D1] border border-[#8C6239]/40 text-[#5C3A21] text-xs font-bold rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-[#B56A00] outline-hidden cursor-pointer"
            >
              {yearOptions.map((y) => (
                <option key={y} value={y}>
                  {y} {language === 'en' ? 'CE' : 'ई.'}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1 text-xs">
            <span className="text-[11px] font-bold text-[#8C6239] mr-1 hidden sm:inline">{language === 'gu' ? 'ફિલ્ટર:' : language === 'en' ? 'Filter:' : 'फ़िल्टर:'}</span>
            {[
              { id: 'all', label: language === 'gu' ? 'બધા દિવસો' : language === 'en' ? 'All Days' : 'सभी दिन' },
              { id: 'ekadashi', label: language === 'gu' ? 'એકાદશી વ્રત' : language === 'en' ? 'Ekadashi' : 'एकादशी व्रत' },
              { id: 'pradosh', label: language === 'gu' ? 'પ્રદોષ વ્રત' : language === 'en' ? 'Pradosh' : 'प्रदोष व्रत' },
              { id: 'purnima_amavasya', label: language === 'gu' ? 'પૂનમ / અમાસ' : language === 'en' ? 'Purnima / Amavasya' : 'पूर्णिमा / अमावस्या' },
              { id: 'festivals', label: language === 'gu' ? 'પર્વ અને તહેવારો' : language === 'en' ? 'Festivals' : 'पर्व व त्यौहार' },
              { id: 'sunday', label: language === 'gu' ? 'રવિવાર રજા' : language === 'en' ? 'Sundays' : 'रविवार अवकाश' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveFilter(tab.id as any)}
                className={`px-2 py-1 rounded text-[11px] font-bold transition cursor-pointer ${
                  activeFilter === tab.id
                    ? 'bg-[#8B1E1E] text-white shadow-xs'
                    : 'bg-[#F4E8D1] text-[#5C3A21] hover:bg-[#EBDCC0]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Main 7-Column Wall Calendar Grid (रविवार से शनिवार) */}
      <div className="bg-[#FAF2E4] border-2 border-[#8C6239]/50 rounded-xl overflow-hidden shadow-md">
        {/* Days Header */}
        <div className="grid grid-cols-7 border-b-2 border-[#8C6239]/40 text-center text-xs font-black">
          <div className="py-2.5 bg-[#8B1E1E] text-white border-r border-[#8C6239]/30">
            <span className="block sm:hidden">{language === 'gu' ? 'રવિ' : language === 'en' ? 'Sun' : 'रवि'}</span>
            <span className="hidden sm:block">{language === 'gu' ? 'રવિવાર (Sun)' : language === 'en' ? 'Sunday' : 'रविवार (Sun)'}</span>
          </div>
          <div className="py-2.5 bg-[#5C3A21] text-[#FFD88A] border-r border-[#8C6239]/30">
            <span className="block sm:hidden">{language === 'gu' ? 'સોમ' : language === 'en' ? 'Mon' : 'सोम'}</span>
            <span className="hidden sm:block">{language === 'gu' ? 'સોમવાર (Mon)' : language === 'en' ? 'Monday' : 'सोमवार (Mon)'}</span>
          </div>
          <div className="py-2.5 bg-[#5C3A21] text-[#FFD88A] border-r border-[#8C6239]/30">
            <span className="block sm:hidden">{language === 'gu' ? 'મંગળ' : language === 'en' ? 'Tue' : 'मंगल'}</span>
            <span className="hidden sm:block">{language === 'gu' ? 'મંગળવાર (Tue)' : language === 'en' ? 'Tuesday' : 'मंगलवार (Tue)'}</span>
          </div>
          <div className="py-2.5 bg-[#5C3A21] text-[#FFD88A] border-r border-[#8C6239]/30">
            <span className="block sm:hidden">{language === 'gu' ? 'બુધ' : language === 'en' ? 'Wed' : 'बुध'}</span>
            <span className="hidden sm:block">{language === 'gu' ? 'બુધવાર (Wed)' : language === 'en' ? 'Wednesday' : 'बुधवार (Wed)'}</span>
          </div>
          <div className="py-2.5 bg-[#5C3A21] text-[#FFD88A] border-r border-[#8C6239]/30">
            <span className="block sm:hidden">{language === 'gu' ? 'ગુરુ' : language === 'en' ? 'Thu' : 'गुरु'}</span>
            <span className="hidden sm:block">{language === 'gu' ? 'ગુરુવાર (Thu)' : language === 'en' ? 'Thursday' : 'गुरुवार (Thu)'}</span>
          </div>
          <div className="py-2.5 bg-[#5C3A21] text-[#FFD88A] border-r border-[#8C6239]/30">
            <span className="block sm:hidden">{language === 'gu' ? 'શુક્ર' : language === 'en' ? 'Fri' : 'शुक्र'}</span>
            <span className="hidden sm:block">{language === 'gu' ? 'શુક્રવાર (Fri)' : language === 'en' ? 'Friday' : 'शुक्रवार (Fri)'}</span>
          </div>
          <div className="py-2.5 bg-[#5C3A21] text-[#FFD88A]">
            <span className="block sm:hidden">{language === 'gu' ? 'શનિ' : language === 'en' ? 'Sat' : 'शनि'}</span>
            <span className="hidden sm:block">{language === 'gu' ? 'શનિવાર (Sat)' : language === 'en' ? 'Saturday' : 'शनिवार (Sat)'}</span>
          </div>
        </div>


        {/* Days Grid Cells */}
        <div className="grid grid-cols-7 divide-x divide-y divide-[#8C6239]/20 bg-[#FDFBF7]">
          {/* Empty offset days for before month start */}
          {Array.from({ length: monthData.firstDayWeekday }, (_, i) => (
            <div
              key={`empty-${i}`}
              className="bg-[#F4E8D1]/40 min-h-[85px] sm:min-h-[110px] p-1.5 opacity-40"
            />
          ))}

          {/* Active Days */}
          {monthData.days.map((day) => {
            const isSelected = day.dayNumber === selectedDayNumber;
            const matchesFilter = isDayMatchingFilter(day);

            return (
              <div
                key={day.dayNumber}
                onClick={() => setSelectedDayNumber(day.dayNumber)}
                className={`min-h-[85px] sm:min-h-[110px] p-1 sm:p-2 transition relative flex flex-col justify-between cursor-pointer ${
                  day.isSunday ? 'bg-red-50/40' : 'bg-white'
                } ${
                  isSelected
                    ? 'ring-3 ring-[#B56A00] bg-[#FFF8EB] z-10 shadow-xs'
                    : 'hover:bg-[#FAF2E4]/80'
                } ${
                  day.isToday
                    ? 'border-2 border-[#B56A00] bg-amber-50/60'
                    : ''
                } ${!matchesFilter ? 'opacity-30' : 'opacity-100'}`}
              >
                {/* Top: Day Number & Paksha indicator */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-1">
                    <span
                      className={`text-sm sm:text-base font-black ${
                        day.isSunday
                          ? 'text-[#8B1E1E]'
                          : day.isToday
                          ? 'text-[#B56A00]'
                          : 'text-[#2C1810]'
                      }`}
                    >
                      {day.dayNumber}
                    </span>
                    {day.isToday && (
                      <span className="text-[9px] font-black bg-[#B56A00] text-white px-1 py-0.2 rounded">
                        आज
                      </span>
                    )}
                  </div>

                  {/* Paksha Dot */}
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      day.paksha === 'शुक्ल पक्ष' ? 'bg-amber-400' : 'bg-[#5C3A21]'
                    }`}
                    title={day.paksha}
                  />
                </div>

                {/* Middle: Tithi Name & Nakshatra */}
                <div className="my-0.5 space-y-0.5">
                  <div
                    className={`text-[10px] sm:text-xs font-bold leading-tight ${
                      day.isEkadashi
                        ? 'text-amber-800'
                        : day.isPurnima
                        ? 'text-orange-800'
                        : day.isAmavasya
                        ? 'text-rose-900'
                        : 'text-[#5C3A21]'
                    }`}
                  >
                    {day.tithiName}
                  </div>
                  <div className="text-[9px] text-[#735133] truncate hidden sm:block">
                    {day.nakshatra} • {day.moonRashi}
                  </div>
                </div>

                {/* Bottom: Festival / Vrat Badges */}
                <div className="space-y-0.5 mt-auto">
                  {day.primaryBadge && (
                    <div
                      className={`text-[9px] sm:text-[10px] font-bold px-1 py-0.5 rounded truncate leading-none text-center ${
                        day.primaryBadge.type === 'ekadashi'
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : day.primaryBadge.type === 'pradosh'
                          ? 'bg-blue-100 text-blue-900 border border-blue-300'
                          : day.primaryBadge.type === 'purnima'
                          ? 'bg-orange-100 text-orange-900 border border-orange-300'
                          : day.primaryBadge.type === 'amavasya'
                          ? 'bg-stone-200 text-stone-900 border border-stone-400'
                          : 'bg-[#8B1E1E]/15 text-[#8B1E1E] border border-[#8B1E1E]/30 font-black'
                      }`}
                      title={day.primaryBadge.text}
                    >
                      {day.primaryBadge.text}
                    </div>
                  )}

                  {/* Additional event count pill if multiple */}
                  {day.festivals.length > 1 && (
                    <div className="text-[8px] text-[#8C6239] font-bold text-center">
                      +{day.festivals.length - 1} {language === 'gu' ? 'વધુ' : language === 'en' ? 'more' : 'और'}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Selected Day Detailed Sheet (દૈનિક વિગતવાર પત્રક) */}
      {selectedDay && (
        <div className="bg-[#FAF2E4] border border-[#8C6239]/40 rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#8C6239]/20 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black text-[#B56A00]">
                  {selectedDay.dayNumber} {localizedMonthOptions[selectedMonth].split(' ')[0]} {selectedYear}
                </span>
                <span className="text-xs font-bold px-2 py-0.5 bg-[#5C3A21] text-[#FFD88A] rounded-md">
                  {trVedic(selectedDay.weekdayName)}
                </span>
                {selectedDay.isToday && (
                  <span className="text-xs font-bold px-2 py-0.5 bg-emerald-700 text-white rounded-md">
                    {language === 'gu' ? 'આજનો દિવસ' : language === 'en' ? 'Today' : 'आज का दिन'}
                  </span>
                )}
              </div>
              <p className="text-xs text-[#735133] mt-0.5">
                {trVedic(selectedDay.paksha)} • {language === 'gu' ? 'તિથિ:' : language === 'en' ? 'Tithi:' : 'तिथि:'} <strong>{trVedic(selectedDay.tithiName)}</strong> • {language === 'gu' ? 'નક્ષત્ર:' : language === 'en' ? 'Nakshatra:' : 'नक्षत्र:'} <strong>{trVedic(selectedDay.nakshatra)}</strong> • {language === 'gu' ? 'ચંદ્ર રાશિ:' : language === 'en' ? 'Moon Sign:' : 'चंद्र राशि:'} <strong>{trVedic(selectedDay.moonRashi)}</strong>
              </p>
            </div>

            {/* Actions for Selected Day */}
            <div className="flex flex-wrap items-center gap-2">
              {onDateSelect && (
                <button
                  type="button"
                  onClick={() => onDateSelect(selectedDay.date)}
                  className="px-3 py-1.5 bg-[#8B1E1E] hover:bg-[#701515] text-white text-xs font-bold rounded-lg transition flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
                  title="View Daily Panchang"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{language === 'gu' ? 'દૈનિક પંચાંગ જુઓ' : language === 'en' ? 'View Daily Panchang' : 'दैनिक पंचांग देखें'}</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => handleAddReminder(selectedDay)}
                className="px-2.5 py-1.5 bg-[#F4E8D1] hover:bg-[#E5D2B8] border border-[#8C6239]/40 text-[#5C3A21] text-xs font-bold rounded-lg transition flex items-center gap-1 cursor-pointer active:scale-95"
                title="Add Reminder"
              >
                {addedReminderId === String(selectedDay.dayNumber) ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-700" />
                    <span className="text-emerald-700">{language === 'gu' ? 'ઉમેરાઈ ગયું!' : language === 'en' ? 'Added!' : 'जोड़ा गया!'}</span>
                  </>
                ) : (
                  <>
                    <Bell className="w-3.5 h-3.5 text-[#B56A00]" />
                    <span>{language === 'gu' ? 'રિમાઇન્ડર' : language === 'en' ? 'Reminder' : 'रिमाइंडर'}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleExportICS(selectedDay)}
                className="px-2.5 py-1.5 bg-[#F4E8D1] hover:bg-[#E5D2B8] border border-[#8C6239]/40 text-[#5C3A21] text-xs font-bold rounded-lg transition flex items-center gap-1 cursor-pointer active:scale-95"
                title="Download .ICS Calendar"
              >
                <Download className="w-3.5 h-3.5 text-[#5C3A21]" />
                <span>{language === 'gu' ? 'કેલેન્ડર (.ics)' : language === 'en' ? 'Calendar (.ics)' : 'कैलेंडर (.ics)'}</span>
              </button>
            </div>
          </div>

          {/* Festivals & Vrats details for this day */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold font-granth text-[#5C3A21] uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#B56A00]" />
              {language === 'gu'
                ? 'આ તિથિના પાવન પર્વ, વ્રત અને ધાર્મિક મહત્વ'
                : language === 'en'
                ? 'Sacred Festivals, Vrats and Significance for this Date'
                : 'इस तिथि के पावन पर्व, व्रत एवं धार्मिक महत्व'}
            </h4>


            {selectedDay.festivals.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {selectedDay.festivals.map((fest, fIdx) => (
                  <div
                    key={fIdx}
                    className="p-3 bg-[#F4E8D1] border border-[#8C6239]/30 rounded-lg space-y-1 shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-[#5C3A21] flex items-center gap-1.5">
                        <Flame className="w-4 h-4 text-[#8B1E1E]" />
                        {fest.hindiName} ({fest.name})
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-[#B56A00]/20 text-[#8B1E1E] rounded">
                        {fest.type}
                      </span>
                    </div>
                    <p className="text-xs text-[#735133] leading-relaxed">
                      {fest.description}
                    </p>
                  </div>
                ))}
              </div>
            ) : selectedDay.primaryBadge ? (
              <div className="p-3 bg-[#F4E8D1] border border-[#8C6239]/30 rounded-lg space-y-1">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-[#B56A00]" />
                  <span className="font-bold text-sm text-[#5C3A21]">
                    {selectedDay.primaryBadge.text}
                  </span>
                </div>
                <p className="text-xs text-[#735133] leading-relaxed">
                  {selectedDay.paksha} की {selectedDay.tithiName} तिथि का पावन व्रत व भगवान की आराधना का विशेष दिवस।
                </p>
              </div>
            ) : (
              <div className="p-3 bg-[#F4E8D1]/60 border border-[#8C6239]/20 rounded-lg text-xs text-[#735133]">
                इस तिथि पर कोई विशिष्ट सार्वजनिक पर्व नहीं है। नित्य कर्म, देव दर्शन व स्वाध्याय हेतु शुभ दिवस है।
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. Monthly Chronological List: "इस माह के संपूर्ण व्रत एवं त्यौहार" */}
      <div className="bg-[#FAF2E4] border border-[#8C6239]/40 rounded-xl p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-[#8C6239]/20 pb-2">
          <h3 className="text-sm sm:text-base font-bold font-granth text-[#5C3A21] flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-[#B56A00]" />
            {monthData.monthNameHindi.split(' ')[0]} {selectedYear} के समस्त व्रत एवं प्रमुख पर्व सूची
          </h3>
          <span className="text-xs font-bold text-[#8C6239]">
            कुल {monthData.allMonthFestivals.length} मुख्य व्रत व पर्व
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {monthData.allMonthFestivals.map((item, idx) => (
            <div
              key={idx}
              onClick={() => setSelectedDayNumber(item.dayNumber)}
              className={`p-2.5 rounded-lg border transition cursor-pointer flex items-start justify-between gap-2 ${
                item.dayNumber === selectedDayNumber
                  ? 'bg-[#5C3A21] text-[#FAF2E4] border-[#5C3A21] ring-2 ring-[#B56A00]'
                  : 'bg-[#F4E8D1] text-[#5C3A21] border-[#8C6239]/30 hover:bg-[#EBDCC0]'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`font-black text-xs px-2 py-0.5 rounded ${
                      item.dayNumber === selectedDayNumber
                        ? 'bg-[#FFD88A] text-[#5C3A21]'
                        : 'bg-[#5C3A21] text-[#FFD88A]'
                    }`}
                  >
                    {item.dayNumber} {monthData.monthNameHindi.split(' ')[0]}
                  </span>
                  <span className="text-[11px] font-bold">
                    ({item.weekdayName})
                  </span>
                </div>
                <div className="text-xs font-bold leading-tight">
                  {item.festivals[0]?.hindiName}
                </div>
                <div className={`text-[10px] ${item.dayNumber === selectedDayNumber ? 'text-[#FFD88A]' : 'text-[#735133]'}`}>
                  {item.paksha} • {item.tithiName}
                </div>
              </div>

              <div className="shrink-0 pt-0.5">
                <span className="text-[10px] font-bold px-1.5 py-0.5 bg-[#B56A00]/20 text-[#B56A00] rounded">
                  {item.festivals[0]?.type || 'व्रत'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
