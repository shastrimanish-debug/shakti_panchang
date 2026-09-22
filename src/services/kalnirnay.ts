import { getSunMoonSidereal, RASHIS, NAKSHATRAS, TITHIS } from './astronomy';
import { getFestivalsForYear } from './festivals';
import { FestivalItem } from '../types';

export interface KalnirnayDayData {
  date: Date;
  dayNumber: number;
  weekdayIndex: number; // 0 = Sun, 1 = Mon ... 6 = Sat
  weekdayName: string;
  tithiNumber: number; // 1 to 15
  tithiName: string;
  paksha: 'शुक्ल पक्ष' | 'कृष्ण पक्ष';
  nakshatra: string;
  moonRashi: string;
  sunRashi: string;
  isToday: boolean;
  isSunday: boolean;
  isEkadashi: boolean;
  isPradosh: boolean;
  isPurnima: boolean;
  isAmavasya: boolean;
  isChaturthi: boolean;
  isShivratri: boolean;
  festivals: FestivalItem[];
  primaryBadge?: {
    text: string;
    type: 'ekadashi' | 'pradosh' | 'purnima' | 'amavasya' | 'festival' | 'chaturthi';
  };
}

export interface KalnirnayMonthResult {
  year: number;
  monthIndex: number; // 0 to 11
  monthNameEnglish: string;
  monthNameHindi: string;
  approxMasa: string;
  vikramSamvat: number;
  days: KalnirnayDayData[];
  firstDayWeekday: number; // 0 to 6
  totalDays: number;
  allMonthFestivals: {
    date: Date;
    dayNumber: number;
    weekdayName: string;
    tithiName: string;
    paksha: string;
    festivals: FestivalItem[];
  }[];
}

const MONTH_NAMES_HINDI = [
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

const MONTH_NAMES_ENGLISH = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const WEEKDAY_NAMES_HINDI = [
  'रविवार', 'सोमवार', 'मंगलवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'
];

// In-memory cache for month calculations
const MONTH_CACHE = new Map<string, KalnirnayMonthResult>();

export function getKalnirnayMonthData(year: number, monthIndex: number): KalnirnayMonthResult {
  const cacheKey = `${year}-${monthIndex}`;
  if (MONTH_CACHE.has(cacheKey)) {
    return MONTH_CACHE.get(cacheKey)!;
  }

  const today = new Date();
  const todayY = today.getFullYear();
  const todayM = today.getMonth();
  const todayD = today.getDate();

  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const firstDayDate = new Date(year, monthIndex, 1);
  const firstDayWeekday = firstDayDate.getDay(); // 0 = Sunday

  // Get all festivals for this year
  const yearFests = getFestivalsForYear(year);

  // Filter festivals for this month
  const monthFests = yearFests.filter(
    (f) => f.date.getFullYear() === year && f.date.getMonth() === monthIndex
  );

  const days: KalnirnayDayData[] = [];
  let detectedMasa = '';

  for (let d = 1; d <= daysInMonth; d++) {
    // 06:00 AM local time for sunrise sidereal state
    const dDate = new Date(year, monthIndex, d, 6, 0, 0);
    const { sunSidereal, moonSidereal } = getSunMoonSidereal(dDate);

    // Tithi calculation
    const diff = (moonSidereal - sunSidereal + 360) % 360;
    const tithiIndex = Math.floor(diff / 12);
    const paksha: 'शुक्ल पक्ष' | 'कृष्ण पक्ष' = tithiIndex < 15 ? 'शुक्ल पक्ष' : 'कृष्ण पक्ष';
    const tithiNumber = (tithiIndex % 15) + 1;

    let tithiName = TITHIS[tithiIndex % 15] || 'प्रतिपदा';
    if (tithiIndex === 14) tithiName = 'पूर्णिमा';
    if (tithiIndex === 29) tithiName = 'अमावस्या';

    // Nakshatra & Rashis
    const nakIdx = Math.floor(moonSidereal / (360 / 27)) % 27;
    const nakshatra = NAKSHATRAS[nakIdx] || 'अश्विनी';
    const moonRashiIdx = Math.floor(moonSidereal / 30) % 12;
    const moonRashi = RASHIS[moonRashiIdx] || 'मेष';
    const sunRashiIdx = Math.floor(sunSidereal / 30) % 12;
    const sunRashi = RASHIS[sunRashiIdx] || 'सिंह';

    const weekdayIndex = dDate.getDay();
    const isSunday = weekdayIndex === 0;
    const isToday = year === todayY && monthIndex === todayM && d === todayD;

    const isEkadashi = tithiName === 'एकादशी';
    const isPradosh = tithiName === 'त्रयोदशी';
    const isPurnima = tithiName === 'पूर्णिमा';
    const isAmavasya = tithiName === 'अमावस्या';
    const isChaturthi = tithiName === 'चतुर्थी';
    const isShivratri = tithiName === 'चतुर्दशी' && paksha === 'कृष्ण पक्ष';

    // Festivals on this specific day
    const dayFests = monthFests.filter((f) => f.date.getDate() === d);

    // Primary badge selection for Kalnirnay visual grid
    let primaryBadge: KalnirnayDayData['primaryBadge'] = undefined;
    if (dayFests.length > 0) {
      primaryBadge = {
        text: dayFests[0].hindiName,
        type: 'festival',
      };
    } else if (isPurnima) {
      primaryBadge = { text: 'पूर्णिमा व्रत', type: 'purnima' };
    } else if (isAmavasya) {
      primaryBadge = { text: 'अमावस्या', type: 'amavasya' };
    } else if (isEkadashi) {
      primaryBadge = { text: `${paksha === 'शुक्ल पक्ष' ? 'शुक्ल' : 'कृष्ण'} एकादशी`, type: 'ekadashi' };
    } else if (isPradosh) {
      primaryBadge = { text: 'प्रदोष व्रत', type: 'pradosh' };
    } else if (isChaturthi) {
      primaryBadge = { text: paksha === 'कृष्ण पक्ष' ? 'संकष्टी चतुर्थी' : 'विनायक चतुर्थी', type: 'chaturthi' };
    }

    if (d === 15) {
      // Sample masa around middle of month
      const HINDI_MASAS = [
        'चैत्र', 'वैशाख', 'ज्येष्ठ', 'आषाढ़', 'श्रावण', 'भाद्रपद',
        'आश्विन', 'कार्तिक', 'मार्गशीर्ष', 'पौष', 'माघ', 'फाल्गुन'
      ];
      detectedMasa = HINDI_MASAS[(sunRashiIdx + 11) % 12] || 'भाद्रपद';
    }

    days.push({
      date: dDate,
      dayNumber: d,
      weekdayIndex,
      weekdayName: WEEKDAY_NAMES_HINDI[weekdayIndex],
      tithiNumber,
      tithiName,
      paksha,
      nakshatra,
      moonRashi,
      sunRashi,
      isToday,
      isSunday,
      isEkadashi,
      isPradosh,
      isPurnima,
      isAmavasya,
      isChaturthi,
      isShivratri,
      festivals: dayFests,
      primaryBadge,
    });
  }

  // Summary list of all events in this month
  const allMonthFestivals = days
    .filter((d) => d.festivals.length > 0 || d.isEkadashi || d.isPradosh || d.isPurnima || d.isAmavasya)
    .map((d) => ({
      date: d.date,
      dayNumber: d.dayNumber,
      weekdayName: d.weekdayName,
      tithiName: d.tithiName,
      paksha: d.paksha,
      festivals: d.festivals.length > 0 ? d.festivals : [
        {
          id: `auto-${d.dayNumber}`,
          date: d.date,
          name: d.primaryBadge?.text || d.tithiName,
          hindiName: d.primaryBadge?.text || d.tithiName,
          type: d.isEkadashi ? 'एकादशी' : d.isPradosh ? 'प्रदोष' : d.isPurnima ? 'पूर्णिमा' : 'अमावस्या',
          description: `${d.paksha} की ${d.tithiName} तिथि का पावन व्रत व पूजन।`,
        },
      ],
    }));

  const vikramSamvat = year + (monthIndex >= 3 ? 57 : 56);

  const result: KalnirnayMonthResult = {
    year,
    monthIndex,
    monthNameEnglish: MONTH_NAMES_ENGLISH[monthIndex],
    monthNameHindi: MONTH_NAMES_HINDI[monthIndex],
    approxMasa: detectedMasa || 'भाद्रपद - आश्विन',
    vikramSamvat,
    days,
    firstDayWeekday,
    totalDays: daysInMonth,
    allMonthFestivals,
  };

  MONTH_CACHE.set(cacheKey, result);
  return result;
}
