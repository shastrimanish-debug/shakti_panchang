import React, { useState, useMemo } from 'react';
import { FestivalItem } from '../types';
import {
  getFestivalsForYear,
  searchFestivalsAcrossCenturies,
  CenturySearchResult,
} from '../services/festivals';
import {
  Calendar,
  Search,
  Bell,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Check,
  Compass,
  History,
  Clock,
  ArrowUpDown,
  Filter,
} from 'lucide-react';
import { saveAppReminder } from '../services/storage';

interface FestivalsViewProps {
  currentDate: Date;
  onNavigateToReminders: () => void;
  onDateSelect?: (date: Date) => void;
}

export const FestivalsView: React.FC<FestivalsViewProps> = ({
  currentDate,
  onNavigateToReminders,
  onDateSelect,
}) => {
  // Selected Year for single-year view (default to currentDate's year or 2026)
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear() || 2026);

  // Active Mode: 'century' (200 वर्षों में महा-खोज) vs 'year' (वार्षिक पंचांगीय पर्व सूची)
  // Default to century search to fulfill user's direct requirement of 100 years past and future
  const [viewMode, setViewMode] = useState<'century' | 'year'>('century');

  // Single year filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');

  // Century Search state
  const [centuryQuery, setCenturyQuery] = useState('दीपावली');
  const [centuryRange, setCenturyRange] = useState<'all' | 'past100' | 'next100'>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | 'closest'>('asc');

  // Feedback state for reminders
  const [addedReminderId, setAddedReminderId] = useState<string | null>(null);

  // 1925 to 2125 year options (200 years)
  const availableYears = useMemo(() => {
    const list: number[] = [];
    for (let y = 1925; y <= 2125; y++) {
      list.push(y);
    }
    return list;
  }, []);

  // Festivals for the selected single year
  const yearFestivals = useMemo(() => {
    return getFestivalsForYear(selectedYear);
  }, [selectedYear]);

  // Filtered list for the single year view
  const filteredYearList = useMemo(() => {
    const cleanQ = searchQuery.toLowerCase().trim();
    return yearFestivals.filter((f) => {
      const matchesQ =
        !cleanQ ||
        f.name.toLowerCase().includes(cleanQ) ||
        f.hindiName.toLowerCase().includes(cleanQ) ||
        f.description.toLowerCase().includes(cleanQ);
      const matchesT = selectedType === 'all' || f.type === selectedType;
      return matchesQ && matchesT;
    });
  }, [yearFestivals, searchQuery, selectedType]);

  // Search results for 200 years search
  const centuryResults = useMemo(() => {
    if (!centuryQuery.trim()) return [];
    let start = 1925;
    let end = 2125;
    if (centuryRange === 'past100') {
      start = 1925;
      end = 2025;
    } else if (centuryRange === 'next100') {
      start = 2026;
      end = 2125;
    }
    const raw = searchFestivalsAcrossCenturies(centuryQuery, start, end);

    const currYear = currentDate.getFullYear() || 2026;

    if (sortOrder === 'desc') {
      return [...raw].sort((a, b) => b.year - a.year);
    } else if (sortOrder === 'closest') {
      return [...raw].sort(
        (a, b) => Math.abs(a.year - currYear) - Math.abs(b.year - currYear)
      );
    }
    return raw; // default asc
  }, [centuryQuery, centuryRange, sortOrder, currentDate]);

  const categories = [
    { id: 'all', label: 'सभी पर्व व व्रत' },
    { id: 'पर्व', label: 'प्रमुख पर्व' },
    { id: 'व्रत', label: 'व्रत' },
    { id: 'एकादशी', label: 'एकादशी' },
    { id: 'पूर्णिमा', label: 'पूर्णिमा' },
    { id: 'अमावस्या', label: 'अमावस्या' },
  ];

  const quickCenturyPills = [
    'दीपावली',
    'होली',
    'महाशिवरात्रि',
    'करवा चौथ',
    'श्री कृष्ण जन्माष्टमी',
    'रक्षाबंधन',
    'गणेश चतुर्थी',
    'दशहरा',
    'छठ पूजा',
    'मकर संक्रांति',
    'श्री राम नवमी',
    'अक्षय तृतीया',
    'निर्जला एकादशी',
    'देवउठनी एकादशी',
    'शरद पूर्णिमा',
  ];

  const handleSetReminder = (f: FestivalItem) => {
    saveAppReminder({
      id: `fest_${f.id}_${Date.now()}`,
      title: `${f.hindiName} (${f.type})`,
      body: f.description,
      timestamp: f.date.getTime(),
      type: 'vrat',
      createdAt: Date.now(),
    });
    setAddedReminderId(f.id);
    setTimeout(() => setAddedReminderId(null), 2500);
  };

  const fmtDate = (d: Date) =>
    d.toLocaleDateString('hi-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Top Header Card with Mode Switcher */}
      <div className="bg-[#FAF2E4] border border-[#8C6239]/40 rounded-xl p-3 sm:p-4 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg text-[#B56A00] font-bold">ॐ</span>
              <h2 className="text-base sm:text-xl font-black font-granth text-[#5C3A21]">
                सनातन पर्व, व्रत एवं उत्सव संकलन (1925 से 2125)
              </h2>
            </div>
            <p className="text-[11px] sm:text-xs text-[#735133] mt-0.5">
              खगोलीय गणना आधारित पिछले 100 वर्ष (1925 से) एवं आगामी 100 वर्ष (2125 तक) का प्रामाणिक 200-वर्षीय पंचांग संग्रह
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onNavigateToReminders}
              className="px-2.5 py-1 bg-[#F4E8D1] hover:bg-[#E5D2B8] border border-[#8C6239]/40 rounded-lg text-xs font-bold text-[#5C3A21] flex items-center gap-1.5 transition cursor-pointer"
            >
              <Bell className="w-3.5 h-3.5 text-[#B56A00]" />
              <span>रिमाइंडर</span>
            </button>
          </div>
        </div>

        {/* Primary View Mode Tabs (Clear, high-contrast toggle) */}
        <div className="flex items-center p-1 bg-[#462B17] rounded-xl text-xs font-bold border border-[#8C6239]/60">
          <button
            onClick={() => setViewMode('century')}
            className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer ${
              viewMode === 'century'
                ? 'bg-[#FAF2E4] text-[#5C3A21] shadow-md font-black ring-1 ring-[#B56A00]'
                : 'text-[#E5D2B8] hover:text-white'
            }`}
          >
            <History className="w-4 h-4 text-[#B56A00]" />
            <span>🔍 200 वर्षों में महा-खोज (100 साल पहले / आगे)</span>
          </button>

          <button
            onClick={() => setViewMode('year')}
            className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer ${
              viewMode === 'year'
                ? 'bg-[#FAF2E4] text-[#5C3A21] shadow-md font-black ring-1 ring-[#B56A00]'
                : 'text-[#E5D2B8] hover:text-white'
            }`}
          >
            <Calendar className="w-4 h-4 text-[#B56A00]" />
            <span>📅 वार्षिक पर्व सूची (वर्ष {selectedYear})</span>
          </button>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* MODE 1: 200 YEARS CENTURY SEARCH CONTROLS                     */}
        {/* ------------------------------------------------------------- */}
        {viewMode === 'century' && (
          <div className="pt-1 space-y-3">
            <div className="bg-[#5C3A21] text-[#FAF2E4] p-3 sm:p-4 rounded-xl border border-[#8C6239] space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-1 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-[#FFD88A]">
                  <Sparkles className="w-4 h-4" />
                  <span>पिछले 100 वर्ष एवं अगले 100 वर्ष में किसी भी पर्व की तिथि खोजें:</span>
                </div>
                <span className="text-[11px] text-[#E5D2B8]">1925 से 2125 तक पूर्ण समर्थित</span>
              </div>

              {/* Main Century Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-[#8C6239] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={centuryQuery}
                  onChange={(e) => setCenturyQuery(e.target.value)}
                  placeholder="त्योहार का नाम लिखें (उदा. दीपावली, होली, महाशिवरात्रि, करवा चौथ, जन्माष्टमी, छठ, रामनवमी, एकादशी)..."
                  className="w-full bg-[#FAF2E4] text-[#3E2714] border-2 border-[#B56A00] rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm font-bold placeholder:text-[#8C6239] outline-none shadow-inner"
                />
              </div>

              {/* Time Range Filter Buttons & Sort Orders */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[#E5D2B8] text-[11px] font-bold">कालखंड:</span>
                  <button
                    onClick={() => setCenturyRange('all')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      centuryRange === 'all'
                        ? 'bg-[#B56A00] text-white shadow-xs'
                        : 'bg-[#462B17] text-[#D9C4A9] hover:text-white'
                    }`}
                  >
                    समस्त 200 वर्ष (1925-2125)
                  </button>
                  <button
                    onClick={() => setCenturyRange('past100')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      centuryRange === 'past100'
                        ? 'bg-[#B56A00] text-white shadow-xs'
                        : 'bg-[#462B17] text-[#D9C4A9] hover:text-white'
                    }`}
                  >
                    पिछले 100 वर्ष (1925-2025)
                  </button>
                  <button
                    onClick={() => setCenturyRange('next100')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      centuryRange === 'next100'
                        ? 'bg-[#B56A00] text-white shadow-xs'
                        : 'bg-[#462B17] text-[#D9C4A9] hover:text-white'
                    }`}
                  >
                    अगले 100 वर्ष (2026-2125)
                  </button>
                </div>

                {/* Sort Order Selector */}
                <div className="flex items-center gap-1">
                  <ArrowUpDown className="w-3.5 h-3.5 text-[#FFD88A]" />
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as any)}
                    className="bg-[#462B17] text-[#FAF2E4] border border-[#8C6239] rounded px-2 py-0.5 text-[11px] font-bold outline-none cursor-pointer"
                  >
                    <option value="asc">वर्ष: प्राचीन से नवीन (1925 ➔ 2125)</option>
                    <option value="desc">वर्ष: नवीन से प्राचीन (2125 ➔ 1925)</option>
                    <option value="closest">वर्तमान वर्ष (2026) के निकटतम</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Quick 1-Click Search Chips */}
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#735133]">
                <Filter className="w-3 h-3 text-[#B56A00]" />
                <span>लोकप्रिय त्योहारों पर एक क्लिक से 200 वर्षों का इतिहास व भविष्य खोजें:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {quickCenturyPills.map((pill) => (
                  <button
                    key={pill}
                    onClick={() => setCenturyQuery(pill)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                      centuryQuery === pill
                        ? 'bg-[#5C3A21] text-[#FAF2E4] border-2 border-[#B56A00] shadow-xs'
                        : 'bg-[#F4E8D1] hover:bg-[#E5D2B8] text-[#5C3A21] border border-[#8C6239]/30'
                    }`}
                  >
                    {pill}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* MODE 2: ANNUAL FESTIVALS LIST CONTROLS                        */}
        {/* ------------------------------------------------------------- */}
        {viewMode === 'year' && (
          <div className="pt-1 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              {/* Year Stepper & 200-Year Dropdown */}
              <div className="flex items-center gap-1.5 bg-[#F4E8D1] p-1 rounded-xl border border-[#8C6239]/40">
                <button
                  onClick={() => setSelectedYear((prev) => Math.max(1925, prev - 1))}
                  className="px-2.5 py-1 bg-[#FAF2E4] hover:bg-white border border-[#8C6239]/30 rounded-lg text-xs font-bold text-[#5C3A21] transition cursor-pointer flex items-center gap-0.5"
                  title="पिछला वर्ष"
                >
                  <ChevronLeft className="w-4 h-4 text-[#B56A00]" />
                  <span className="hidden sm:inline">पिछला वर्ष</span>
                </button>

                {/* Dropdown for 200 years (1925 to 2125) */}
                <div className="relative">
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    aria-label="वर्ष चुनें (Select Year)"
                    className="bg-white border-2 border-[#B56A00] rounded-lg px-3 py-1 text-xs sm:text-sm font-black text-[#5C3A21] outline-none cursor-pointer shadow-xs"
                  >
                    {availableYears.map((yr) => (
                      <option key={yr} value={yr}>
                        वर्ष {yr} {yr === 1974 ? '(जातक जन्म)' : yr === 2026 ? '(वर्तमान)' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={() => setSelectedYear((prev) => Math.min(2125, prev + 1))}
                  className="px-2.5 py-1 bg-[#FAF2E4] hover:bg-white border border-[#8C6239]/30 rounded-lg text-xs font-bold text-[#5C3A21] transition cursor-pointer flex items-center gap-0.5"
                  title="अगला वर्ष"
                >
                  <span className="hidden sm:inline">अगला वर्ष</span>
                  <ChevronRight className="w-4 h-4 text-[#B56A00]" />
                </button>
              </div>

              {/* Quick Jump Milestones */}
              <div className="flex flex-wrap items-center gap-1 text-[11px] font-bold">
                <span className="text-[#8C6239] mr-1 hidden sm:inline">त्वरित वर्ष:</span>
                <button
                  onClick={() => setSelectedYear(1925)}
                  className={`px-2 py-0.5 rounded transition cursor-pointer ${
                    selectedYear === 1925
                      ? 'bg-[#B56A00] text-white'
                      : 'bg-[#F4E8D1] hover:bg-[#E8D4B4] text-[#5C3A21] border border-[#8C6239]/30'
                  }`}
                  title="100 वर्ष पूर्व (1925)"
                >
                  1925
                </button>
                <button
                  onClick={() => setSelectedYear(1974)}
                  className={`px-2 py-0.5 rounded transition cursor-pointer ${
                    selectedYear === 1974
                      ? 'bg-[#B56A00] text-white'
                      : 'bg-[#F4E8D1] hover:bg-[#E8D4B4] text-[#5C3A21] border border-[#8C6239]/30'
                  }`}
                  title="जातक जन्म 1974"
                >
                  1974 (जन्म)
                </button>
                <button
                  onClick={() => setSelectedYear(2000)}
                  className={`px-2 py-0.5 rounded transition cursor-pointer ${
                    selectedYear === 2000
                      ? 'bg-[#B56A00] text-white'
                      : 'bg-[#F4E8D1] hover:bg-[#E8D4B4] text-[#5C3A21] border border-[#8C6239]/30'
                  }`}
                >
                  2000
                </button>
                <button
                  onClick={() => setSelectedYear(2025)}
                  className={`px-2 py-0.5 rounded transition cursor-pointer ${
                    selectedYear === 2025
                      ? 'bg-[#B56A00] text-white'
                      : 'bg-[#F4E8D1] hover:bg-[#E8D4B4] text-[#5C3A21] border border-[#8C6239]/30'
                  }`}
                >
                  2025
                </button>
                <button
                  onClick={() => setSelectedYear(2026)}
                  className={`px-2 py-0.5 rounded transition cursor-pointer ${
                    selectedYear === 2026
                      ? 'bg-[#B56A00] text-white'
                      : 'bg-[#F4E8D1] hover:bg-[#E8D4B4] text-[#5C3A21] border border-[#8C6239]/30'
                  }`}
                >
                  2026 (आज)
                </button>
                <button
                  onClick={() => setSelectedYear(2030)}
                  className={`px-2 py-0.5 rounded transition cursor-pointer ${
                    selectedYear === 2030
                      ? 'bg-[#B56A00] text-white'
                      : 'bg-[#F4E8D1] hover:bg-[#E8D4B4] text-[#5C3A21] border border-[#8C6239]/30'
                  }`}
                >
                  2030
                </button>
                <button
                  onClick={() => setSelectedYear(2050)}
                  className={`px-2 py-0.5 rounded transition cursor-pointer ${
                    selectedYear === 2050
                      ? 'bg-[#B56A00] text-white'
                      : 'bg-[#F4E8D1] hover:bg-[#E8D4B4] text-[#5C3A21] border border-[#8C6239]/30'
                  }`}
                >
                  2050
                </button>
                <button
                  onClick={() => setSelectedYear(2100)}
                  className={`px-2 py-0.5 rounded transition cursor-pointer ${
                    selectedYear === 2100
                      ? 'bg-[#B56A00] text-white'
                      : 'bg-[#F4E8D1] hover:bg-[#E8D4B4] text-[#5C3A21] border border-[#8C6239]/30'
                  }`}
                >
                  2100
                </button>
                <button
                  onClick={() => setSelectedYear(2125)}
                  className={`px-2 py-0.5 rounded transition cursor-pointer ${
                    selectedYear === 2125
                      ? 'bg-[#B56A00] text-white'
                      : 'bg-[#F4E8D1] hover:bg-[#E8D4B4] text-[#5C3A21] border border-[#8C6239]/30'
                  }`}
                  title="100 वर्ष बाद (2125)"
                >
                  2125
                </button>
              </div>
            </div>

            {/* Single Year In-Page Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-[#8C6239] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`वर्ष ${selectedYear} के पर्वों में खोजें (उदा. दीपावली, होली, शिवरात्रि, एकादशी)...`}
                className="w-full bg-[#F4E8D1] border border-[#8C6239]/40 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm font-semibold text-[#5C3A21] placeholder:text-[#A89279] outline-none shadow-inner"
              />
            </div>

            {/* Category Filter Chips */}
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {categories.map((cat) => {
                const isSel = selectedType === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedType(cat.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-bold transition cursor-pointer ${
                      isSel
                        ? 'bg-[#5C3A21] text-[#FAF2E4] shadow-xs'
                        : 'bg-[#F4E8D1] text-[#5C3A21] hover:bg-[#E5D2B8] border border-[#8C6239]/30'
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* MODE 1 RESULTS: 200 YEARS CENTURY SEARCH RESULTS              */}
      {/* ------------------------------------------------------------- */}
      {viewMode === 'century' && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-[#5C3A21] px-1 bg-[#FAF2E4] p-2 rounded-lg border border-[#8C6239]/30">
            <div className="flex items-center gap-1.5">
              <span className="text-[#B56A00] font-black">✦</span>
              <span>
                &ldquo;{centuryQuery}&rdquo; के लिए कुल {centuryResults.length} परिणाम मिले
              </span>
            </div>
            <span className="text-[#8C6239] text-[11px]">
              {centuryRange === 'all'
                ? 'समस्त 200 वर्ष (1925 से 2125)'
                : centuryRange === 'past100'
                ? 'पिछले 100 वर्ष (1925 से 2025)'
                : 'आगामी 100 वर्ष (2026 से 2125)'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {centuryResults.map((res: CenturySearchResult, idx: number) => {
              const isCurrent = res.year === 2026;
              const isReminded = addedReminderId === res.festival.id;

              return (
                <div
                  key={`${res.year}_${res.festival.id}_${idx}`}
                  className={`bg-[#FAF2E4] border-2 rounded-xl p-3.5 shadow-xs transition flex flex-col justify-between ${
                    isCurrent
                      ? 'border-[#B56A00] bg-[#FFFBF0] ring-2 ring-[#B56A00]/40'
                      : 'border-[#8C6239]/40 hover:border-[#8C6239]'
                  }`}
                >
                  <div>
                    {/* Header with Year badge & Type */}
                    <div className="flex items-center justify-between gap-1.5 mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs px-2.5 py-0.5 rounded-full font-black bg-[#5C3A21] text-[#FAF2E4] shadow-xs">
                          वर्ष {res.year}
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] font-black bg-[#B56A00] text-white px-1.5 py-0.2 rounded">
                            वर्तमान
                          </span>
                        )}
                      </div>

                      <span className="text-[11px] px-2 py-0.5 rounded-md font-bold bg-[#B56A00]/15 text-[#B56A00] border border-[#B56A00]/30">
                        {res.festival.type}
                      </span>
                    </div>

                    {/* Festival Name */}
                    <h3 className="font-bold font-granth text-base sm:text-lg text-[#5C3A21] leading-snug">
                      {res.festival.hindiName}
                    </h3>

                    {/* Exact Date & Day */}
                    <div className="text-xs font-black text-[#8B1E1E] mt-1 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#B56A00] shrink-0" />
                      <span>{fmtDate(res.festival.date)}</span>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-[#735133] mt-1.5 line-clamp-3 leading-relaxed">
                      {res.festival.description}
                    </p>
                  </div>

                  {/* Actions: View Panchang & Set Reminder */}
                  <div className="mt-3 pt-2.5 border-t border-[#8C6239]/20 flex items-center justify-between gap-2">
                    <button
                      onClick={() => {
                        setSelectedYear(res.year);
                        setViewMode('year');
                      }}
                      className="text-[11px] font-bold text-[#B56A00] hover:underline cursor-pointer"
                    >
                      वर्ष {res.year} की सूची →
                    </button>

                    <div className="flex items-center gap-1">
                      {onDateSelect && (
                        <button
                          onClick={() => onDateSelect(res.festival.date)}
                          className="px-2.5 py-1 bg-[#5C3A21] hover:bg-[#462B17] text-[#FAF2E4] rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 shadow-xs"
                          title="इस ऐतिहासिक / भविष्य के दिन का पंचांग देखें"
                        >
                          <Compass className="w-3.5 h-3.5 text-[#FFD88A]" />
                          <span>पंचांग देखें</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleSetReminder(res.festival)}
                        className={`p-1.5 rounded-lg text-xs transition cursor-pointer ${
                          isReminded
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-[#F4E8D1] hover:bg-[#E5D2B8] text-[#5C3A21]'
                        }`}
                        title="रिमाइंडर लगाएँ"
                      >
                        {isReminded ? (
                          <Check className="w-3.5 h-3.5 text-emerald-700" />
                        ) : (
                          <Bell className="w-3.5 h-3.5 text-[#8C6239]" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {centuryResults.length === 0 && (
            <div className="bg-[#FAF2E4] border border-[#8C6239]/30 rounded-xl p-8 text-center text-[#735133] space-y-2">
              <History className="w-8 h-8 text-[#B56A00] mx-auto opacity-60" />
              <p className="text-sm font-bold text-[#5C3A21]">
                &ldquo;{centuryQuery}&rdquo; के लिए 200 वर्षों में कोई त्योहार नहीं मिला।
              </p>
              <p className="text-xs text-[#735133]">
                कृपया ऊपर दिए गए लोकप्रिय बटनों (जैसे दीपावली, होली, महाशिवरात्रि, करवा चौथ) में से किसी एक पर क्लिक करें।
              </p>
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODE 2 RESULTS: SINGLE YEAR FESTIVALS LIST                     */}
      {/* ------------------------------------------------------------- */}
      {viewMode === 'year' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-[#735133] px-1 bg-[#FAF2E4] p-2 rounded-lg border border-[#8C6239]/30">
            <span>
              वर्ष {selectedYear} के कुल {filteredYearList.length} पर्व एवं व्रत उपलब्ध हैं
            </span>
            <span className="text-[#B56A00]">
              विक्रम संवत् {selectedYear + 57}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredYearList.map((item: FestivalItem) => {
              const isReminded = addedReminderId === item.id;
              return (
                <div
                  key={item.id}
                  className="bg-[#FAF2E4] border border-[#8C6239]/30 rounded-xl p-3.5 sm:p-4 shadow-xs hover:border-[#B56A00] transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[11px] px-2 py-0.5 rounded-md font-bold bg-[#B56A00]/15 text-[#B56A00] border border-[#B56A00]/30">
                          {item.type}
                        </span>
                        <span className="text-xs font-bold text-[#8B1E1E]">
                          {fmtDate(item.date)}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        {onDateSelect && (
                          <button
                            onClick={() => onDateSelect(item.date)}
                            className="p-1.5 rounded-lg text-xs bg-[#F4E8D1] hover:bg-[#E5D2B8] text-[#5C3A21] transition cursor-pointer"
                            title="इस दिन का पंचांग देखें"
                          >
                            <Compass className="w-3.5 h-3.5 text-[#B56A00]" />
                          </button>
                        )}
                        <button
                          onClick={() => handleSetReminder(item)}
                          className={`p-1.5 rounded-lg text-xs transition cursor-pointer ${
                            isReminded
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-[#F4E8D1] hover:bg-[#E5D2B8] text-[#5C3A21]'
                          }`}
                          title="इस पर्व के लिए रिमाइंडर लगाएँ"
                        >
                          {isReminded ? (
                            <Check className="w-3.5 h-3.5 text-emerald-700" />
                          ) : (
                            <Bell className="w-3.5 h-3.5 text-[#8C6239]" />
                          )}
                        </button>
                      </div>
                    </div>

                    <h3 className="text-base sm:text-lg font-black font-granth text-[#5C3A21] mt-1.5">
                      {item.hindiName}
                    </h3>
                    <p className="text-xs text-[#735133] mt-1 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {isReminded && (
                    <div className="mt-2 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded">
                      ✓ रिमाइंडर सफलतापूर्वक सहेजा गया!
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {filteredYearList.length === 0 && (
            <div className="bg-[#FAF2E4] border border-[#8C6239]/30 rounded-xl p-8 text-center text-[#735133] space-y-2">
              <Calendar className="w-8 h-8 text-[#B56A00] mx-auto opacity-60" />
              <p className="text-sm font-bold text-[#5C3A21]">
                वर्ष {selectedYear} में आपके खोजे गए शब्द से कोई पर्व या व्रत नहीं मिला।
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedType('all');
                }}
                className="px-3 py-1.5 bg-[#5C3A21] text-[#FAF2E4] rounded-lg text-xs font-bold cursor-pointer"
              >
                सभी पर्व दिखाएं
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
