import { KundaliData, PlanetPosition, VedicPanchangData } from '../types';
import { RASHIS, NAKSHATRAS, NAKSHATRA_LORDS } from './astronomy';
import { SIGN_LORDS } from './predictions';
import { calculateSadeSati, calculateDailyTransits } from './sadesati';
import { calculateKpSystem, calculateAshtakvarga } from './kpAshtakvarga';
import { calculateJaiminiAnalysis } from './jaimini';
import { getVargaChartData } from './vargaAnalysis';
import { calculateKundali, DASHA_ORDER, DASHA_YEARS } from './kundali';
import { calculateHoraTable } from './horaPanchakYogas';
import { calculateTriveniGemology } from './triveniGemology';
import { trPlanet, trRashi, trVedic, trWeekday } from '../i18n/vedicTranslate';

export interface MicroHouseLordInfo {
  house: number;
  houseName: string;
  sign: string;
  lord: string;
  lordPlacementHouse: number;
  lordDignity: 'उच्च' | 'नीच' | 'स्वक्षेत्र' | 'मित्र' | 'सम' | 'शत्रु';
  isLordRetrograde: boolean;
  occupants: string[];
  savBindus: number;
  kpCuspSubLord: string;
  kpCuspStarLord: string;
}

export interface MicroPlanetDetail {
  planet: string;
  house: number;
  rashi: string;
  degree: number;
  formattedDMS: string;
  isRetrograde: boolean;
  isCombust: boolean;
  isVargottama: boolean;
  avastha: string;
  nakshatra: string;
  pada: number;
  nakshatraLord: string;
  kpSubLord: string;
  kpSubSubLord: string;
  navamshaRashi: string; // D9
  dashamshaRashi: string; // D10
  horaRashi: string; // D2
  drekkanaRashi: string; // D3
  saptamshaRashi: string; // D7
  dwadashamshaRashi: string; // D12
  trimshamshaRashi: string; // D30
  shashtiamshaRashi: string; // D60
  dignity: 'उच्च' | 'नीच' | 'स्वक्षेत्र' | 'सामान्य';
  bavBindusInOwnSign: number;
}

export interface SookshmaDashaPeriod {
  maha: string;
  antar: string;
  pratyantar: string;
  sookshma: string;
  startDate: Date;
  endDate: Date;
  days: number;
}

export interface MicroAstrologyProfile {
  name: string;
  lagnaRashi: string;
  lagnaDMS: string;
  lagnaLord: string;
  lagnaLordHouse: number;
  moonRashi: string;
  moonDMS: string;
  moonNakshatra: string;
  moonPada: string;
  mahadasha: string;
  mahaStart: string;
  mahaEnd: string;
  antardasha: string;
  antarStart: string;
  antarEnd: string;
  pratyantardasha: string;
  pratyantarStart: string;
  pratyantarEnd: string;
  sookshmadasha: string;
  sookshmaStart: string;
  sookshmaEnd: string;
  houseLords: MicroHouseLordInfo[];
  planets: Record<string, MicroPlanetDetail>;
  sadeSatiSummary: string;
  manglikStatus: string;
  keyAfflictions: string[];
  keyStrengths: string[];
  jaiminiSummary: {
    atmakaraka: string;
    amatyakaraka: string;
    darakaraka: string;
    gnatikaraka: string;
    karakamshaRashi: string;
    arudhaLagna: string;
    upapadaLagna: string;
    charaMaha: string;
    charaAntar: string;
  };
  ashtakvargaSummary: {
    totalSav: number;
    strongestRashi: string;
    strongestPts: number;
    weakestRashi: string;
    weakestPts: number;
    houseSav: Record<number, number>;
  };
  taraBala: {
    taraName: string;
    taraNumber: number;
    isAuspicious: boolean;
    verdict: string;
  };
  chandraBala: {
    houseFromNatalMoon: number;
    isAuspicious: boolean;
    verdict: string;
  };
}

export const HINDI_MONTHS = [
  'जनवरी', 'फ़रवरी', 'मार्च', 'अप्रैल', 'मई', 'जून',
  'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'
];

export const VEDIC_MASAS = [
  'चैत्र', 'वैशाख', 'ज्येष्ठ', 'आषाढ़', 'श्रावण', 'भाद्रपद',
  'अश्विन', 'कार्तिक', 'मार्गशीर्ष', 'पौष', 'माघ', 'फाल्गुन'
];

const HOUSE_NAMES: Record<number, string> = {
  1: 'तनु भाव (प्रथम - व्यक्तित्व, देह व आत्मबल)',
  2: 'धन भाव (द्वितीय - संचित कोष, वाणी व कुटुम्ब)',
  3: 'सहज भाव (तृतीय - पराक्रम, भ्राता व संवाद)',
  4: 'सुख भाव (चतुर्थ - माता, भूमि, भवन व वाहन)',
  5: 'सुत भाव (पंचम - प्रखर बुद्धि, विद्या, संतान व पूर्वपुण्य)',
  6: 'रिपु/ऋण भाव (षष्ठ - रोग, ऋण, शत्रु व प्रतियोगी सिद्धि)',
  7: 'जाया भाव (सप्तम - विवाह, दांपत्य व व्यापारिक साझेदारी)',
  8: 'आयु भाव (अष्टम - आयुष्य, आकस्मिक परिवर्तन व गुप्त विद्या)',
  9: 'धर्म/भाग्य भाव (नवम - भाग्योदय, धर्म, गुरु व उच्च यात्रा)',
  10: 'कर्म भाव (दशम - आजीविका, पदोन्नति, यश व राजयोग)',
  11: 'आय/लाभ भाव (एकादश - धन लाभ, इच्छापूर्ति व सिद्धि)',
  12: 'व्यय/विदेश भाव (द्वादश - व्यय, विदेश प्रवास व मोक्ष)',
};

const EXALTATION_MAP: Record<string, string> = {
  सूर्य: 'मेष', चंद्र: 'वृषभ', मंगल: 'मकर', बुध: 'कन्या',
  गुरु: 'कर्क', शुक्र: 'मीन', शनि: 'तुला', राहु: 'वृषभ', केतु: 'वृश्चिक'
};

const DEBILITATION_MAP: Record<string, string> = {
  सूर्य: 'तुला', चंद्र: 'वृश्चिक', मंगल: 'कर्क', बुध: 'मीन',
  गुरु: 'मकर', शुक्र: 'कन्या', शनि: 'मेष', राहु: 'वृश्चिक', केतु: 'वृषभ'
};

const OWN_SIGNS_MAP: Record<string, string[]> = {
  सूर्य: ['सिंह'],
  चंद्र: ['कर्क'],
  मंगल: ['मेष', 'वृश्चिक'],
  बुध: ['मिथुन', 'कन्या'],
  गुरु: ['धनु', 'मीन'],
  शुक्र: ['वृषभ', 'तुला'],
  शनि: ['मकर', 'कुंभ'],
  राहु: ['कुंभ'],
  केतु: ['वृश्चिक']
};

/**
 * Formats decimal degrees (0-30) into exact अंश° कला' विकला" (DMS)
 */
export function formatExactDMS(degInRashi: number): string {
  const safeDeg = Math.max(0, Math.min(29.9999, Number(degInRashi) || 0));
  const d = Math.floor(safeDeg);
  const remMin = (safeDeg - d) * 60;
  const m = Math.floor(remMin);
  const s = Math.round((remMin - m) * 60);
  return `${String(d).padStart(2, '0')}° ${String(m).padStart(2, '0')}' ${String(s).padStart(2, '0')}"`;
}

/**
 * Computes Baladi Avastha (बाल, कुमार, युवा, वृद्ध, मृत) based on odd/even sign and degree
 */
export function getPlanetBaladiAvastha(rashiNumber: number, degInRashi: number): string {
  const isOdd = rashiNumber % 2 === 1;
  const slot = Math.min(4, Math.floor((degInRashi % 30) / 6)); // 0..4 (each 6 degrees)
  const oddStates = ['बाल अवस्था (२५% फल)', 'कुमार अवस्था (५०% फल)', 'युवा अवस्था (१००% पूर्ण बली)', 'वृद्ध अवस्था (सामान्य फल)', 'मृत अवस्था (न्यून बल)'];
  const evenStates = ['मृत अवस्था (न्यून बल)', 'वृद्ध अवस्था (सामान्य फल)', 'युवा अवस्था (१००% पूर्ण बली)', 'कुमार अवस्था (५०% फल)', 'बाल अवस्था (२५% फल)'];
  return isOdd ? oddStates[slot] : evenStates[slot];
}

/**
 * Checks whether a planet is Combust (अस्त) due to proximity to Sun
 */
export function isPlanetCombust(planetName: string, planetTotalDeg: number, sunTotalDeg: number): boolean {
  if (planetName === 'सूर्य' || planetName === 'राहु' || planetName === 'केतु') return false;
  let diff = Math.abs(planetTotalDeg - sunTotalDeg) % 360;
  if (diff > 180) diff = 360 - diff;
  const orbs: Record<string, number> = {
    चंद्र: 12,
    मंगल: 17,
    बुध: 14,
    गुरु: 11,
    शुक्र: 10,
    शनि: 15,
  };
  return diff <= (orbs[planetName] || 12);
}

/**
 * Calculates Sookshma Dasha (4th level Vimshottari sub-sub-sub period) inside the active Pratyantardasha
 */
export function calculateSookshmaPeriods(
  maha: string,
  antar: string,
  pratyantar: string,
  startDate: Date,
  endDate: Date
): SookshmaDashaPeriod[] {
  const startIdx = Math.max(0, DASHA_ORDER.indexOf(pratyantar));
  const totalMs = Math.max(1, endDate.getTime() - startDate.getTime());
  const periods: SookshmaDashaPeriod[] = [];
  let ptr = new Date(startDate);

  for (let i = 0; i < 9; i++) {
    const sookshma = DASHA_ORDER[(startIdx + i) % 9];
    const weight = (DASHA_YEARS[sookshma] || 7) / 120.0;
    const durMs = totalMs * weight;
    const endMs = i === 8 ? endDate.getTime() : ptr.getTime() + durMs;
    const curEnd = new Date(endMs);
    periods.push({
      maha,
      antar,
      pratyantar,
      sookshma,
      startDate: new Date(ptr),
      endDate: curEnd,
      days: Math.max(0.5, Math.round(((endMs - ptr.getTime()) / 86400000) * 10) / 10),
    });
    ptr = curEnd;
  }
  return periods;
}

/**
 * Calculates dynamic consultation timelines based on a target reference date.
 */
export function getDynamicTimeWindows(baseDate: Date = new Date()) {
  const currentYear = baseDate.getFullYear();
  const currentMonthIdx = baseDate.getMonth();

  const addMonths = (offset: number) => {
    const d = new Date(baseDate);
    d.setMonth(d.getMonth() + offset);
    return {
      monthIdx: d.getMonth(),
      monthName: HINDI_MONTHS[d.getMonth()],
      year: d.getFullYear(),
    };
  };

  const nearStart = addMonths(1);
  const nearEnd = addMonths(4);
  const peakMonth = addMonths(3);
  const mediumStart = addMonths(4);
  const mediumEnd = addMonths(8);
  const longStart = addMonths(6);
  const longEnd = addMonths(11);

  const pastStartYear = currentYear - 3;
  const pastEndYear = currentYear - 1;

  return {
    currentYear,
    currentMonthName: HINDI_MONTHS[currentMonthIdx],
    nearTimeline: `${nearStart.monthName} ${nearStart.year} से ${nearEnd.monthName} ${nearEnd.year}`,
    peakMonth: `${peakMonth.monthName} ${peakMonth.year}`,
    mediumTimeline: `${mediumStart.monthName} ${mediumStart.year} से ${mediumEnd.monthName} ${mediumEnd.year}`,
    longTimeline: `${longStart.monthName} ${longStart.year} से ${longEnd.monthName} ${longEnd.year}`,
    pastSpan: `वर्ष ${pastStartYear} से ${pastEndYear}`,
  };
}

/**
 * Calculate Navamsha Rashi (D9) micro position
 */
export function calculateNavamshaRashi(rashiIndex: number, degree: number): string {
  const totalMinutes = degree * 60;
  const navamshaPart = Math.floor(totalMinutes / 200) % 9; // 3°20' = 200 minutes
  let startIdx = 0;
  if ([0, 4, 8].includes(rashiIndex)) startIdx = 0; // Fire
  else if ([1, 5, 9].includes(rashiIndex)) startIdx = 9; // Earth
  else if ([2, 6, 10].includes(rashiIndex)) startIdx = 6; // Air
  else startIdx = 3; // Water

  const navIdx = (startIdx + navamshaPart) % 12;
  return RASHIS[navIdx];
}

/**
 * Calculate Dashamsha Rashi (D10) micro position for career
 */
export function calculateDashamshaRashi(rashiIndex: number, degree: number): string {
  const totalMinutes = degree * 60;
  const dashamshaPart = Math.floor(totalMinutes / 180) % 10; // 3°0' = 180 minutes
  const isOdd = rashiIndex % 2 === 0;
  const startIdx = isOdd ? rashiIndex : (rashiIndex + 9) % 12;
  const d10Idx = (startIdx + dashamshaPart) % 12;
  return RASHIS[d10Idx];
}

function fmtDateHindi(d?: Date | string): string {
  if (!d) return 'सक्रिय';
  const dt = d instanceof Date ? d : new Date(d);
  if (isNaN(dt.getTime())) return 'सक्रिय';
  return dt.toLocaleDateString('hi-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

/**
 * Calculates Tara Bala (तारा बल) & Chandra Bala (चंद्र बल) between Natal Chart and Today's Transit
 */
export function calculateTaraAndChandraBala(
  natalNakName: string,
  natalMoonRashi: string,
  panchang?: VedicPanchangData | null
): {
  taraBala: MicroAstrologyProfile['taraBala'];
  chandraBala: MicroAstrologyProfile['chandraBala'];
} {
  const TARA_NAMES = [
    'जन्म तारा (शारीरिक सतर्कता)',
    'संपत तारा (धन व समृद्धि कारक — अति शुभ)',
    'विपत तारा (कार्य बाधा — सावधानी आवश्यक)',
    'क्षेम तारा (कल्याण व आरोग्य प्रद — शुभ)',
    'प्रत्यरि तारा (प्रतिस्पर्धा व अवरोध)',
    'साधक तारा (कठिन कार्य सिद्धि — अति शुभ)',
    'वध तारा (तीव्र विघ्न — महामृत्युंजय स्मरण करें)',
    'मित्र तारा (सहयोग व सफलता प्रद — शुभ)',
    'अतिमित्र तारा (सर्वोच्च भाग्योदय व सिद्धि — परम शुभ)',
  ];

  const natalNakIdx = Math.max(0, NAKSHATRAS.indexOf(natalNakName));
  const todayNakName = panchang?.nakshatra || NAKSHATRAS[(natalNakIdx + 1) % 27];
  const todayNakIdx = Math.max(0, NAKSHATRAS.indexOf(todayNakName));

  const countNak = ((todayNakIdx - natalNakIdx + 27) % 27) + 1;
  const taraRem = ((countNak - 1) % 9);
  const isTaraShubh = [1, 3, 5, 7, 8].includes(taraRem); // 2nd, 4th, 6th, 8th, 9th Taras are auspicious

  const natalMoonIdx = Math.max(0, RASHIS.indexOf(natalMoonRashi));
  const todayMoonRashi = panchang?.lunarRashi || RASHIS[(natalMoonIdx + 2) % 12];
  const todayMoonIdx = Math.max(0, RASHIS.indexOf(todayMoonRashi));
  const houseFromMoon = ((todayMoonIdx - natalMoonIdx + 12) % 12) + 1;
  const isChandraShubh = [1, 3, 6, 7, 10, 11].includes(houseFromMoon);

  return {
    taraBala: {
      taraName: TARA_NAMES[taraRem],
      taraNumber: taraRem + 1,
      isAuspicious: isTaraShubh,
      verdict: `जन्म नक्षत्र (${natalNakName}) से आज का गोचर नक्षत्र (${todayNakName}) ${countNak}वां होकर **${TARA_NAMES[taraRem]}** बना रहा है (${isTaraShubh ? 'तारा बल शुभ ✓' : 'तारा बल मध्यम ⚠️'})।`,
    },
    chandraBala: {
      houseFromNatalMoon: houseFromMoon,
      isAuspicious: isChandraShubh,
      verdict: `जन्म राशि (${natalMoonRashi}) से आज गोचर का चंद्रमा (${todayMoonRashi}) **${houseFromMoon}वें भाव** में संचरण कर रहा है (${isChandraShubh ? 'चंद्र बल पूर्ण शुभ व मनोबल प्रदाता ✓' : houseFromMoon === 8 ? 'अष्टम चंद्र — मानसिक धैर्य रखें ⚠️' : 'सामान्य चंद्र बल'})।`,
    },
  };
}

/**
 * Perform complete micro-astrological calculation for a Kundali
 * Integrates: D1..D60 Shodashvarga, KP Star/Sub/Sub-Sub Lords, Sarvashtakavarga SAV/BAV,
 * Jaimini 7 Karakas + Arudha + Chara Dasha, and 4-Level Vimshottari Sookshma Dasha!
 */
export function buildMicroAstrologyProfile(
  k: KundaliData,
  panchang?: VedicPanchangData | null
): MicroAstrologyProfile {
  const lagnaIdx = (k.lagnaRashiNumber - 1 + 12) % 12;
  const lagnaDegInRashi = k.lagnaDegree % 30;
  const lagnaDMS = formatExactDMS(lagnaDegInRashi);

  // Run KP, Ashtakavarga, Jaimini & Shodashvarga engines
  const kpData = calculateKpSystem(k);
  const ashtakData = calculateAshtakvarga(k);
  const jaiminiData = calculateJaiminiAnalysis(k);

  const d2Chart = getVargaChartData(k.lagnaDegree, k.planets, 2, 'D2');
  const d3Chart = getVargaChartData(k.lagnaDegree, k.planets, 3, 'D3');
  const d7Chart = getVargaChartData(k.lagnaDegree, k.planets, 7, 'D7');
  const d9Chart = getVargaChartData(k.lagnaDegree, k.planets, 9, 'D9');
  const d10Chart = getVargaChartData(k.lagnaDegree, k.planets, 10, 'D10');
  const d12Chart = getVargaChartData(k.lagnaDegree, k.planets, 12, 'D12');
  const d30Chart = getVargaChartData(k.lagnaDegree, k.planets, 30, 'D30');
  const d60Chart = getVargaChartData(k.lagnaDegree, k.planets, 60, 'D60');

  const sunObj = k.planets.find((p) => p.planet === 'सूर्य');
  const sunTotalDeg = sunObj ? (sunObj.rashiNumber - 1) * 30 + sunObj.degreeInRashi : 0;

  const planetsMap: Record<string, MicroPlanetDetail> = {};
  const houseOccupants: Record<number, string[]> = {};
  for (let i = 1; i <= 12; i++) houseOccupants[i] = [];

  for (const p of k.planets) {
    const pRashiIdx = Math.max(0, RASHIS.indexOf(p.rashi));
    const degInSign = typeof p.degreeInRashi === 'number' ? p.degreeInRashi : (p.degree % 30);
    const totalDeg = pRashiIdx * 30 + degInSign;

    const navD9 = d9Chart.planets.find((vp) => vp.planet === p.planet)?.rashi || calculateNavamshaRashi(pRashiIdx, degInSign);
    const d10 = d10Chart.planets.find((vp) => vp.planet === p.planet)?.rashi || calculateDashamshaRashi(pRashiIdx, degInSign);
    const d2 = d2Chart.planets.find((vp) => vp.planet === p.planet)?.rashi || p.rashi;
    const d3 = d3Chart.planets.find((vp) => vp.planet === p.planet)?.rashi || p.rashi;
    const d7 = d7Chart.planets.find((vp) => vp.planet === p.planet)?.rashi || p.rashi;
    const d12 = d12Chart.planets.find((vp) => vp.planet === p.planet)?.rashi || p.rashi;
    const d30 = d30Chart.planets.find((vp) => vp.planet === p.planet)?.rashi || p.rashi;
    const d60 = d60Chart.planets.find((vp) => vp.planet === p.planet)?.rashi || p.rashi;

    let dig: 'उच्च' | 'नीच' | 'स्वक्षेत्र' | 'सामान्य' = 'सामान्य';
    if (EXALTATION_MAP[p.planet] === p.rashi) dig = 'उच्च';
    else if (DEBILITATION_MAP[p.planet] === p.rashi) dig = 'नीच';
    else if (OWN_SIGNS_MAP[p.planet]?.includes(p.rashi)) dig = 'स्वक्षेत्र';

    const nakshatraIdx = NAKSHATRAS.indexOf(p.nakshatra);
    const nakLord = nakshatraIdx >= 0 ? NAKSHATRA_LORDS[nakshatraIdx % 9] : 'गुरु';
    const kpPlanet = kpData.planets.find((kp) => kp.planet === p.planet);
    const bavArr = ashtakData.planetBav[p.planet];
    const bavInSign = bavArr ? (bavArr[pRashiIdx] ?? 4) : 4;

    const isVargottama = p.rashi === navD9;
    const combust = isPlanetCombust(p.planet, totalDeg, sunTotalDeg);
    const avastha = getPlanetBaladiAvastha(pRashiIdx + 1, degInSign);

    planetsMap[p.planet] = {
      planet: p.planet,
      house: p.house,
      rashi: p.rashi,
      degree: degInSign,
      formattedDMS: formatExactDMS(degInSign),
      isRetrograde: !!p.isRetrograde,
      isCombust: combust,
      isVargottama,
      avastha,
      nakshatra: p.nakshatra,
      pada: p.pada || 1,
      nakshatraLord: nakLord,
      kpSubLord: kpPlanet?.subLord || nakLord,
      kpSubSubLord: kpPlanet?.subSubLord || nakLord,
      navamshaRashi: navD9,
      dashamshaRashi: d10,
      horaRashi: d2,
      drekkanaRashi: d3,
      saptamshaRashi: d7,
      dwadashamshaRashi: d12,
      trimshamshaRashi: d30,
      shashtiamshaRashi: d60,
      dignity: dig,
      bavBindusInOwnSign: bavInSign,
    };

    if (p.house >= 1 && p.house <= 12) {
      houseOccupants[p.house].push(p.planet);
    }
  }

  // Calculate House Lords (1 to 12) + SAV Bindus + KP Cuspal Sub-Lords
  const houseLords: MicroHouseLordInfo[] = [];
  const keyAfflictions: string[] = [];
  const keyStrengths: string[] = [];
  const houseSav: Record<number, number> = {};

  for (let h = 1; h <= 12; h++) {
    const signIdx = (lagnaIdx + h - 1) % 12;
    const signName = RASHIS[signIdx];
    const lordPlanetName = SIGN_LORDS[signName] || 'गुरु';
    const lordDetail = planetsMap[lordPlanetName];
    const savPts = ashtakData.sav[signIdx] || 28;
    houseSav[h] = savPts;

    const kpCusp = kpData.cusps.find((c) => c.house === h);

    let lordDignity: 'उच्च' | 'नीच' | 'स्वक्षेत्र' | 'मित्र' | 'सम' | 'शत्रु' = 'सम';
    if (lordDetail) {
      if (lordDetail.dignity === 'उच्च') lordDignity = 'उच्च';
      else if (lordDetail.dignity === 'नीच') lordDignity = 'नीच';
      else if (lordDetail.dignity === 'स्वक्षेत्र') lordDignity = 'स्वक्षेत्र';
    }

    const houseInfo: MicroHouseLordInfo = {
      house: h,
      houseName: HOUSE_NAMES[h] || `भाव ${h}`,
      sign: signName,
      lord: lordPlanetName,
      lordPlacementHouse: lordDetail ? lordDetail.house : 1,
      lordDignity,
      isLordRetrograde: lordDetail ? lordDetail.isRetrograde : false,
      occupants: houseOccupants[h] || [],
      savBindus: savPts,
      kpCuspSubLord: kpCusp?.subLord || lordPlanetName,
      kpCuspStarLord: kpCusp?.starLord || lordPlanetName,
    };
    houseLords.push(houseInfo);

    if (lordDetail && [6, 8, 12].includes(lordDetail.house)) {
      keyAfflictions.push(`${h}वें भाव का स्वामी ${lordPlanetName} ${lordDetail.house}वें (त्रिक/दुस्थान) भाव में (${lordDetail.formattedDMS}) स्थित है`);
    }
    if (lordDetail && lordDetail.isCombust) {
      keyAfflictions.push(`${h}वें भावेश ${lordPlanetName} सूर्य के समीप होने से अस्त अवस्था में है`);
    }
    if (lordDetail && lordDetail.dignity === 'उच्च') {
      keyStrengths.push(`${h}वें भाव का स्वामी ${lordPlanetName} उच्च राशि (${lordDetail.rashi} ${lordDetail.formattedDMS}) में विराजित है`);
    }
    if (lordDetail && lordDetail.dignity === 'स्वक्षेत्र') {
      keyStrengths.push(`${h}वें भावेश ${lordPlanetName} स्वक्षेत्री (${lordDetail.rashi}) होकर पूर्ण बली है`);
    }
    if (lordDetail && lordDetail.isVargottama) {
      keyStrengths.push(`${lordPlanetName} D-1 व D-9 नवमांश दोनों में ${lordDetail.rashi} राशि में **वर्गोत्तम** होकर दोगुना शुभ फलदाता है`);
    }
  }

  let sadeSatiSummary = 'साढ़ेसाती नहीं है।';
  try {
    const sade = calculateSadeSati(k);
    sadeSatiSummary = sade.isUnderSadeSati
      ? `शनि की साढ़ेसाती प्रभावी (${sade.summary})`
      : sade.isDhaiya
        ? `शनि की ढैया प्रभावी (${sade.dhaiyaType || 'गोचर ढैया'})`
        : `साढ़ेसाती/ढैया से मुक्त (शनि वर्तमान में ${sade.shaniCurrentRashi} राशि में गोचररत)`;
  } catch {
    /* fallback */
  }

  // Extract exact Vimshottari Mahadasha, Antardasha, Pratyantardasha & Sookshma Dasha dates
  const now = new Date();
  const activeMahaObj =
    (k.dashaPeriods || []).find((d) => now >= new Date(d.startDate) && now < new Date(d.endDate)) ||
    (k.dashaPeriods || [])[0];
  const activeAntarObj =
    (k.antarPeriods || []).find(
      (a) => a.maha === (activeMahaObj?.planet || k.mahadasha) && now >= new Date(a.startDate) && now < new Date(a.endDate)
    ) || (k.antarPeriods || [])[0];
  const activePratyantarObj =
    (k.pratyantarPeriods || []).find(
      (p) => now >= new Date(p.startDate) && now < new Date(p.endDate)
    ) || (k.pratyantarPeriods || [])[0];

  let sookshmaName = k.pratyantardasha || 'गुरु';
  let sookshmaStartStr = fmtDateHindi(now);
  let sookshmaEndStr = fmtDateHindi(new Date(now.getTime() + 12 * 86400000));

  if (activePratyantarObj) {
    const sookshmas = calculateSookshmaPeriods(
      activePratyantarObj.maha,
      activePratyantarObj.antar,
      activePratyantarObj.pratyantar,
      new Date(activePratyantarObj.startDate),
      new Date(activePratyantarObj.endDate)
    );
    const curSookshma =
      sookshmas.find((s) => now >= s.startDate && now < s.endDate) || sookshmas[0];
    if (curSookshma) {
      sookshmaName = curSookshma.sookshma;
      sookshmaStartStr = fmtDateHindi(curSookshma.startDate);
      sookshmaEndStr = fmtDateHindi(curSookshma.endDate);
    }
  }

  const lagnaLordName = SIGN_LORDS[k.lagnaRashi] || 'गुरु';
  const lagnaLordDetail = planetsMap[lagnaLordName];
  const moonDetail = planetsMap['चंद्र'];

  const dkKaraka = jaiminiData.karakas.find((jk) => jk.code === 'DK') || jaiminiData.karakas[jaiminiData.karakas.length - 1];
  const gkKaraka = jaiminiData.karakas.find((jk) => jk.code === 'GK') || jaiminiData.karakas[Math.max(0, jaiminiData.karakas.length - 2)];

  const { taraBala, chandraBala } = calculateTaraAndChandraBala(k.nakshatra, k.moonRashi, panchang);

  return {
    name: k.name || 'यजमान',
    lagnaRashi: k.lagnaRashi,
    lagnaDMS,
    lagnaLord: lagnaLordName,
    lagnaLordHouse: lagnaLordDetail ? lagnaLordDetail.house : 1,
    moonRashi: k.moonRashi,
    moonDMS: moonDetail?.formattedDMS || '15° 00\' 00"',
    moonNakshatra: k.nakshatra,
    moonPada: k.charan || '1',
    mahadasha: activeMahaObj?.planet || k.mahadasha || 'गुरु',
    mahaStart: fmtDateHindi(activeMahaObj?.startDate),
    mahaEnd: fmtDateHindi(activeMahaObj?.endDate),
    antardasha: activeAntarObj?.antar || k.antardasha || 'शनि',
    antarStart: fmtDateHindi(activeAntarObj?.startDate),
    antarEnd: fmtDateHindi(activeAntarObj?.endDate),
    pratyantardasha: activePratyantarObj?.pratyantar || k.pratyantardasha || 'बुध',
    pratyantarStart: fmtDateHindi(activePratyantarObj?.startDate),
    pratyantarEnd: fmtDateHindi(activePratyantarObj?.endDate),
    sookshmadasha: sookshmaName,
    sookshmaStart: sookshmaStartStr,
    sookshmaEnd: sookshmaEndStr,
    houseLords,
    planets: planetsMap,
    sadeSatiSummary,
    manglikStatus: k.isManglik ? `मांगलिक योग (${k.manglikDescription || 'मंगल प्रभाव'})` : 'मांगलिक दोष रहित (अमंगलकारी नहीं)',
    keyAfflictions: Array.from(new Set(keyAfflictions)),
    keyStrengths: Array.from(new Set(keyStrengths)),
    jaiminiSummary: {
      atmakaraka: jaiminiData.atmakaraka ? `${jaiminiData.atmakaraka.planet} (${jaiminiData.atmakaraka.rashi} ${formatExactDMS(jaiminiData.atmakaraka.degreeInRashi)}, भाव ${jaiminiData.atmakaraka.house})` : 'सूर्य (लग्न)',
      amatyakaraka: jaiminiData.amatyakaraka ? `${jaiminiData.amatyakaraka.planet} (${jaiminiData.amatyakaraka.rashi} ${formatExactDMS(jaiminiData.amatyakaraka.degreeInRashi)}, भाव ${jaiminiData.amatyakaraka.house})` : 'गुरु (कर्म)',
      darakaraka: dkKaraka ? `${dkKaraka.planet} (${dkKaraka.rashi} ${formatExactDMS(dkKaraka.degreeInRashi)}, भाव ${dkKaraka.house})` : 'शुक्र',
      gnatikaraka: gkKaraka ? `${gkKaraka.planet} (${gkKaraka.rashi}, भाव ${gkKaraka.house})` : 'मंगल',
      karakamshaRashi: jaiminiData.karakamshaRashi || k.lagnaRashi || 'मेष',
      arudhaLagna: `${jaiminiData.arudhaLagnaRashi || k.lagnaRashi || 'मेष'} (भाव ${jaiminiData.arudhaLagnaHouse || 1})`,
      upapadaLagna: `${jaiminiData.upapadaLagnaRashi || 'तुला'} (भाव ${jaiminiData.upapadaLagnaHouse || 7})`,
      charaMaha: jaiminiData.currentCharaMaha ? `${jaiminiData.currentCharaMaha.rashi} (${fmtDateHindi(jaiminiData.currentCharaMaha.startDate)} – ${fmtDateHindi(jaiminiData.currentCharaMaha.endDate)})` : 'मेष',
      charaAntar: jaiminiData.currentCharaAntar ? `${jaiminiData.currentCharaAntar.rashi} (${fmtDateHindi(jaiminiData.currentCharaAntar.startDate)} – ${fmtDateHindi(jaiminiData.currentCharaAntar.endDate)})` : 'सिंह',
    },
    ashtakvargaSummary: {
      totalSav: ashtakData.totalPoints,
      strongestRashi: ashtakData.strongestRashi.rashi,
      strongestPts: ashtakData.strongestRashi.points,
      weakestRashi: ashtakData.weakestRashi.rashi,
      weakestPts: ashtakData.weakestRashi.points,
      houseSav,
    },
    taraBala,
    chandraBala,
  };
}

/**
 * Build rich micro-astrology context formatted string for Gemini AI Prompt
 */
export function buildMicroAstrologyContextPrompt(k: KundaliData, panchang?: VedicPanchangData | null): string {
  const profile = buildMicroAstrologyProfile(k, panchang);

  const houseDetails = profile.houseLords
    .map((h) => {
      const occStr = h.occupants.length ? `[स्थित ग्रह: ${h.occupants.join(', ')}]` : '[रिक्त भाव]';
      return `भाव ${h.house} (${h.sign}): भावेश=${h.lord} (भाव ${h.lordPlacementHouse} में, ${h.lordDignity}${h.isLordRetrograde ? ', वक्री' : ''}) | KP कस्प उपनक्षत्र(Sub-Lord)=${h.kpCuspSubLord} | सर्वाष्टकवर्ग बिंदु=${h.savBindus} ${occStr}`;
    })
    .join('\n');

  const planetDetails = Object.values(profile.planets)
    .map((p) => {
      return `${p.planet}: ${p.rashi} (${p.formattedDMS}), भाव ${p.house}, नक्षत्र=${p.nakshatra}(चरण ${p.pada}, स्वामी ${p.nakshatraLord}), KP Sub-Lord=${p.kpSubLord}/${p.kpSubSubLord}, D9=${p.navamshaRashi}${p.isVargottama ? '[वर्गोत्तम]' : ''}, D10=${p.dashamshaRashi}, D60=${p.shashtiamshaRashi}, अवस्था=${p.dignity}/${p.avastha}${p.isRetrograde ? '[वक्री]' : ''}${p.isCombust ? '[अस्त]' : ''}, BAV बिंदु=${p.bavBindusInOwnSign}`;
    })
    .join('\n');

  return `========================================================
सूक्ष्म ज्योतिषीय गणना, KP, षोडशवर्ग, अष्टकवर्ग एवं जैमिनी डेटा (SOOKSHMA GANIT DOSSIER):
========================================================
जातक नाम: ${profile.name}
लग्न स्पष्ट: ${profile.lagnaRashi} (${profile.lagnaDMS}) | लग्नेश: ${profile.lagnaLord} (भाव ${profile.lagnaLordHouse} में)
चंद्र स्पष्ट: ${profile.moonRashi} (${profile.moonDMS}) | नक्षत्र: ${profile.moonNakshatra} (चरण ${profile.moonPada})
विंशोत्तरी ४-स्तरीय सूक्ष्म दशा:
• महादशा: ${profile.mahadasha} (${profile.mahaStart} से ${profile.mahaEnd})
• अंतर्दशा: ${profile.antardasha} (${profile.antarStart} से ${profile.antarEnd})
• प्रत्यंतर दशा: ${profile.pratyantardasha} (${profile.pratyantarStart} से ${profile.pratyantarEnd})
• सूक्ष्म दशा (Sookshma): ${profile.sookshmadasha} (${profile.sookshmaStart} से ${profile.sookshmaEnd})

जैमिनी सूत्र सूक्ष्म कारक:
• आत्मकारक (AK): ${profile.jaiminiSummary.atmakaraka} | कारकांश लग्न: ${profile.jaiminiSummary.karakamshaRashi}
• अमात्यकारक (AmK): ${profile.jaiminiSummary.amatyakaraka} | दाराकारक (DK): ${profile.jaiminiSummary.darakaraka}
• आरूढ़ लग्न (AL): ${profile.jaiminiSummary.arudhaLagna} | उपपद लग्न (UL): ${profile.jaiminiSummary.upapadaLagna}
• जैमिनी चर महादशा: ${profile.jaiminiSummary.charaMaha} | चर अंतर्दशा: ${profile.jaiminiSummary.charaAntar}

तात्कालिक तारा बल व चंद्र बल:
• ${profile.taraBala.verdict}
• ${profile.chandraBala.verdict}
• शनि गोचर/साढ़ेसाती: ${profile.sadeSatiSummary} | मांगलिक: ${profile.manglikStatus}

द्वादश भाव, भावेश, KP कस्प सब-लॉर्ड व सर्वाष्टकवर्ग (SAV) बिंदु:
${houseDetails}

नवग्रह स्पष्ट (DMS), KP उपनक्षत्र एवं षोडशवर्ग (D1, D9, D10, D60):
${planetDetails}
========================================================`;
}

const PLANET_REMEDY: Record<string, { mantra: string; japaCount: string; daan: string; habit: string }> = {
  सूर्य: {
    mantra: '॥ ॐ ह्रां ह्रीं ह्रौं सः सूर्याय नमः ॥ अथवा ॥ ॐ घृणिः सूर्याय नमः ॥',
    japaCount: '१०८ बार नित्य प्रातः (सूर्योदय से १ घंटे के भीतर)',
    daan: 'रविवार को ताँबे का पात्र, गुड़, गेहूँ या लाल चंदन किसी सुपात्र या मंदिर में दान करें।',
    habit: 'नित्य प्रातः उगते सूर्य को तांबे के लोटे से रोली-अक्षत-लाल पुष्प मिश्रित जल का अर्घ्य दें एवं आदित्य हृदय स्तोत्र का पाठ करें।',
  },
  चंद्र: {
    mantra: '॥ ॐ श्रां श्रीं श्रौं सः चंद्रमसे नमः ॥ अथवा ॥ ॐ सों सोमाय नमः ॥',
    japaCount: '१०८ बार सोमवार संध्याकाल',
    daan: 'सोमवार को दूध, दही, बासमती चावल, श्वेत वस्त्र या मिश्री का दान करें।',
    habit: 'प्रति सोमवार शिवलिंग पर कच्चा दूध व गंगाजल से अभिषेक करें, चांदी के गिलास में जल पिएं व माता का आशीर्वाद लें।',
  },
  मंगल: {
    mantra: '॥ ॐ क्रां क्रीं क्रौं सः भौमाय नमः ॥ अथवा ॥ ॐ अं अंगारकाय नमः ॥',
    japaCount: '१०८ बार मंगलवार प्रातः',
    daan: 'मंगलवार को लाल मसूर की दाल, गुड़, लाल वस्त्र या ताँबा दान करें।',
    habit: 'नित्य श्री हनुमान चालीसा व ऋणमोचक मंगल स्तोत्र का पाठ करें तथा मंगलवार को हनुमान जी को चमेली के तेल व सिंदूर का चोला अर्पित करें।',
  },
  बुध: {
    mantra: '॥ ॐ ब्रां ब्रीं ब्रौं सः बुधाय नमः ॥ अथवा ॥ ॐ बुं बुधाय नमः ॥',
    japaCount: '१०८ बार बुधवार प्रातः',
    daan: 'बुधवार को साबुत हरी मूंग, हरा धनिया, पालक या काँसे का पात्र दान करें।',
    habit: 'बुधवार को श्रीगणेश जी को २१ दूर्वा दल की गांठ अर्पित करें, श्री गणेश अथर्वशीर्ष का पाठ करें और गौ माता को हरा चारा खिलाएं।',
  },
  गुरु: {
    mantra: '॥ ॐ ग्रां ग्रीं ग्रौं सः गुरवे नमः ॥ अथवा ॥ ॐ बृं बृहस्पतये नमः ॥',
    japaCount: '१०८ बार गुरुवार प्रातः',
    daan: 'गुरुवार को चने की दाल, पीला वस्त्र, पके केले, केसर, हल्दी या धार्मिक ग्रंथ का दान करें।',
    habit: 'नित्य मस्तक, कंठ व नाभि पर केसर/हल्दी का तिलक लगाएं, गुरुवार को केले व पीपल के वृक्ष का पूजन करें और विष्णु सहस्रनाम पढ़ें।',
  },
  शुक्र: {
    mantra: '॥ ॐ द्रां द्रीं द्रौं सः शुक्राय नमः ॥ अथवा ॥ ॐ शुं शुक्राय नमः ॥',
    japaCount: '१०८ बार शुक्रवार संध्या',
    daan: 'शुक्रवार को श्वेत रेशमी वस्त्र, खीर, चावल, देशी घी, कपूर या दही का दान करें।',
    habit: 'शुक्रवार को श्रीसूक्त व कनकधारा स्तोत्र का पाठ करें, घर के पूजा स्थान में शुद्ध गाय के घी का दीपक जलाएं एवं प्राकृतिक इत्र लगाएं।',
  },
  शनि: {
    mantra: '॥ ॐ प्रां प्रीं प्रौं सः शनैश्चराय नमः ॥ अथवा ॥ ॐ शं शनैश्चराय नमः ॥',
    japaCount: '१०८ बार शनिवार संध्याकाल',
    daan: 'शनिवार को सरसों का तेल, काले तिल, साबुत उड़द, काला कंबल या लोहे का पात्र दान करें।',
    habit: 'शनिवार संध्या पीपल के वृक्ष के नीचे चौमुखी सरसों के तेल का दीपक जलाकर ७ परिक्रमा करें, दशरथ कृत शनि स्तोत्र पढ़ें व श्रमिकों की सहायता करें।',
  },
  राहु: {
    mantra: '॥ ॐ भ्रां भ्रीं भ्रौं सः राहवे नमः ॥ अथवा ॥ ॐ रां राहवे नमः ॥',
    japaCount: '१०८ बार रात्रि अथवा संध्या काल',
    daan: 'शनिवार या बुधवार को जटा वाला नारियल, काले तिल, सप्तधान्य या नीला वस्त्र दान करें।',
    habit: 'दुर्गा सप्तशती के कवच-अर्गला-कीलक का पाठ करें, पक्षियों को सात प्रकार का अनाज (सप्तधान्य) डालें और इलेक्ट्रॉनिक कचरा घर में जमा न रखें।',
  },
  केतु: {
    mantra: '॥ ॐ स्रां स्रीं स्रौं सः केतवे नमः ॥ अथवा ॥ ॐ कें केतवे नमः ॥',
    japaCount: '१०८ बार प्रातः अथवा संध्या',
    daan: 'काला-सफेद दो-रंगा कंबल, तिल के लड्डू, केला या ध्वजा मंदिर में अर्पित करें।',
    habit: 'दो-रंगे श्वान (कुत्ते) को दूध-रोटी खिलाएं, श्री गणेश संकटनाशन स्तोत्र का नित्य पाठ करें व मस्तक पर भस्म/चंदन तिलक लगाएं।',
  },
};

export interface GrahanShantiDeepDive {
  doshCategory?: 'grahan' | 'kaalsarp' | 'manglik' | 'guru_chandal' | 'angarak' | 'vish_yog' | 'shapit' | 'pitra_dosh' | 'neecha' | 'mahadasha_navgrah';
  doshName: string;
  grahanType?: 'surya_rahu' | 'surya_ketu' | 'chandra_rahu' | 'chandra_ketu' | 'other';
  grahanTypeLabel?: string;
  typeLabel?: string;
  houseNum?: number;
  houseName?: string;
  rashi?: string;
  degreeDiff?: number;
  severity: 'अत्यधिक तीव्र' | 'तीव्र' | 'मध्यम' | 'सौम्य / अनुकूल';
  severityDesc: string;
  whyReason: string;
  whatBenefits: string[];
  lifeImpact: string[];
  sixStepVidhi: {
    stepNo: number;
    stepName: string;
    stepVidhi: string;
  }[];
  recommendedJapa: {
    planet: string;
    count: string;
    mantra: string;
  }[];
}

export type ShantiDeepDive = GrahanShantiDeepDive;

export interface UpayParchiDetailedItem {
  index: number;
  bullet: string; // '①', '②', '③', etc.
  title: string;
  category: 'ratna' | 'upvas' | 'path' | 'daan' | 'seva' | 'shanti' | 'general';
  categoryLabel: string;
  whyReason: string; // क्यों करना है (शास्त्रीय व कुण्डली कारण)
  benefits: string[]; // इस उपाय से क्या लाभ होगा (प्रत्यक्ष फल)
  vidhi: string; // शास्त्रीय विधि
  mantra?: string; // सिद्ध मंत्र
  japaCount?: string; // जप संख्या (कलियुग विधान)
  samagri?: string; // आवश्यक सामग्री
  precautions?: string; // सावधानियां / परहेज
  shantiDeepDive?: GrahanShantiDeepDive;
}

export interface TraditionalUpayParchiData {
  salutation: string;
  serialNo: string;
  dateStr: string;
  lagnaInfo: string;
  detectedDoshaYoga: string;
  points: string[];
  formattedTextBlock: string;
  detailedItems: UpayParchiDetailedItem[];
  grahanSpecialAnalysis?: GrahanShantiDeepDive;
  formattedDetailedGuide: string;
  astrologicalCalculationSummary?: {
    lagnaLord: string;
    lagnaLordHouse: number;
    lagnaLordDignity: string;
    fifthLord: string;
    fifthLordHouse: number;
    ninthLord: string;
    ninthLordHouse: number;
    yogakaraka?: string;
    beneficPlanets: string[];
    afflictedPlanets: string[];
    combustPlanets: string[];
    debilitatedPlanets: string[];
    ishtaDevta: string;
    dashaSummary: string;
    keyYogaOrDosha: string;
    reasons: {
      gemstoneReason: string;
      upvasReason: string;
      stotraReason: string;
      daanReason: string;
      sevaReason: string;
      shantiReason: string;
    };
  };
}

const LAGNA_RATNA_YUGMA: Record<string, { ratnaLine: string; upvasDay: string }> = {
  मेष: { ratnaLine: 'मूंगा + माणिक्य रत्न धारण करें।', upvasDay: 'मंगलवार का उपवास करें।' },
  वृषभ: { ratnaLine: 'ओपल (या हीरा) + पन्ना रत्न धारण करें।', upvasDay: 'शुक्रवार का उपवास करें।' },
  मिथुन: { ratnaLine: 'पन्ना + ओपल रत्न धारण करें।', upvasDay: 'बुधवार का उपवास करें।' },
  कर्क: { ratnaLine: 'मोती + माणिक रत्न धारण करें।', upvasDay: 'रविवार (या सोमवार) का उपवास करें।' },
  सिंह: { ratnaLine: 'माणिक + पुखराज (या मूंगा) रत्न धारण करें।', upvasDay: 'रविवार का उपवास करें।' },
  कन्या: { ratnaLine: 'पन्ना + ओपल रत्न धारण करें।', upvasDay: 'बुधवार का उपवास करें।' },
  तुला: { ratnaLine: 'ओपल (या हीरा) + पन्ना रत्न धारण करें।', upvasDay: 'शुक्रवार का उपवास करें।' },
  वृश्चिक: { ratnaLine: 'मूंगा + मोती (या पुखराज) रत्न धारण करें।', upvasDay: 'मंगलवार (या गुरुवार) का उपवास करें।' },
  धनु: { ratnaLine: 'पुखराज + माणिक रत्न धारण करें।', upvasDay: 'गुरुवार का उपवास करें।' },
  मकर: { ratnaLine: 'नीलम (या नीली) + ओपल रत्न धारण करें।', upvasDay: 'शनिवार (या शुक्रवार) का उपवास करें।' },
  कुंभ: { ratnaLine: 'नीलम (या ओपल) + पन्ना रत्न धारण करें।', upvasDay: 'शनिवार का उपवास करें।' },
  मीन: { ratnaLine: 'पुखराज + मोती रत्न धारण करें।', upvasDay: 'गुरुवार का उपवास करें।' },
};

const PLANET_STOTRA_PATH: Record<string, string> = {
  सूर्य: 'श्री आदित्यहृदय स्तोत्र का पाठ करें।',
  चंद्र: 'श्री शिव सहस्रनाम (या रुद्राष्टक) का पाठ करें।',
  मंगल: 'श्री सुन्दरकाण्ड (या ऋणमोचक मंगल स्तोत्र) का पाठ करें।',
  बुध: 'श्रीविष्णुसहस्रनाम का पाठ करें।',
  गुरु: 'श्रीविष्णुसहस्रनाम का पाठ करें।',
  शुक्र: 'श्रीसूक्त (या दुर्गा सप्तशती कवच) का पाठ करें।',
  शनि: 'श्री हनुमान चालीसा व दशरथ कृत शनि स्तोत्र का पाठ करें।',
  राहु: 'श्री दुर्गा सप्तशती (कवच, अर्गला, कीलक) का पाठ करें।',
  केतु: 'श्री गणेश संकटनाशन स्तोत्र व विष्णुसहस्रनाम का पाठ करें।',
};

const PLANET_PARCHI_DAAN: Record<string, string> = {
  गुरु: 'पीला कपड़ा, चने की दाल, गुड़, हल्दी, दक्षिणा (गुरुवार - 1 बार)',
  सूर्य: 'लाल कपड़ा, गेहूँ, गुड़, तांबा, लाल चंदन, दक्षिणा (रविवार - 1 बार)',
  चंद्र: 'सफेद कपड़ा, बासमती चावल, मिश्री, दूध, कपूर, दक्षिणा (सोमवार - 1 बार)',
  मंगल: 'लाल कपड़ा, लाल मसूर की दाल, गुड़, तांबा, सिंदूर, दक्षिणा (मंगलवार - 1 बार)',
  बुध: 'हरा कपड़ा, साबुत हरी मूंग, काँसा, हरी इलायची, दक्षिणा (बुधवार - 1 बार)',
  शुक्र: 'सफेद रेशमी कपड़ा, चावल, देशी घी, मिश्री, दही, दक्षिणा (शुक्रवार - 1 बार)',
  शनि: 'काला कपड़ा, काली उड़द, काले तिल, सरसों का तेल, लोहा, दक्षिणा (शनिवार - 1 बार)',
  राहु: 'नीला कपड़ा, सप्तधान्य, जटा नारियल, काले तिल, दक्षिणा (शनिवार - 1 बार)',
  केतु: 'दो-रंगा कंबल, तिल के लड्डू, केला, ध्वजा, दक्षिणा (मंगलवार - 1 बार)',
};

/**
 * Universal Parser that provides authentic Vedic reason, benefits, and vidhi
 * for ANY remedy string shown on the Upay Parchi.
 */
export function getRemedyDeepDetail(
  pointText: string,
  index: number = 0,
  k?: KundaliData | null,
  lang: string = 'hi'
): UpayParchiDetailedItem {
  const currentLang = (lang || 'hi').slice(0, 2).toLowerCase();
  const circled = ['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨', '⑩'];
  const bullet = circled[index] || `(${index + 1})`;
  const p = pointText.trim();

  // 1. Gemstones (रत्न)
  if (p.includes('रत्न') || p.includes('धारण') || p.includes('पन्ना') || p.includes('ओपल') || p.includes('मोती') || p.includes('माणिक') || p.includes('पुखराज') || p.includes('मूंगा') || p.includes('नीलम') || p.includes('हीरा')) {
    const isPanna = p.includes('पन्ना');
    const isOpal = p.includes('ओपल') || p.includes('हीरा');
    const isManik = p.includes('माणिक');
    const isMoti = p.includes('मोती');
    const isPukhraj = p.includes('पुखराज');
    const isMunga = p.includes('मूंगा');
    const isNeelam = p.includes('नीलम') || p.includes('नीली');

    const ratnaNames: string[] = [];
    if (isPanna) ratnaNames.push('पन्ना (Emerald)');
    if (isOpal) ratnaNames.push('ओपल (Opal)');
    if (isManik) ratnaNames.push('माणिक्य (Ruby)');
    if (isMoti) ratnaNames.push('मोती (Pearl)');
    if (isPukhraj) ratnaNames.push('पुखराज (Yellow Sapphire)');
    if (isMunga) ratnaNames.push('मूंगा (Red Coral)');
    if (isNeelam) ratnaNames.push('नीलम (Blue Sapphire)');

    const whyParts: string[] = [];
    const benefitsList: string[] = [];
    const vidhiParts: string[] = [];

    if (isPanna) {
      whyParts.push('• **पन्ना (बुध ग्रह):** आपकी पत्रिका में बुध बुद्धि, वाणी, व्यापार, संचार और निर्णय क्षमता के स्वामी हैं। पन्ना धारण करने से बुध का कॉस्मिक रश्मि-बल जागृत होता है और कमजोर या अस्त बुध बलिष्ठ होता है।');
      benefitsList.push('तीक्ष्ण स्मरण शक्ति, तीव्र निर्णय क्षमता एवं परीक्षा/प्रतियोगिता में सफलता');
      benefitsList.push('व्यापार में लाभ, सौदेबाजी व वित्तीय बातचीत में सम्मोहन');
      benefitsList.push('वाणी में स्पष्टता, हकलाहट/घबराहट का शमन एवं तार्किक सोच');
      vidhiParts.push('पन्ना: ५.२५ से ७.२५ रत्ती, सोने, चांदी या पंचधातु में, कनिष्ठिका (सबसे छोटी उंगली) में बुधवार प्रातः शुक्ल पक्ष में "ॐ ब्रां ब्रीं ब्रौं सः बुधाय नमः" (१०८ बार) जप कर धारण करें।');
    }

    if (isOpal) {
      whyParts.push('• **ओपल (शुक्र ग्रह):** शुक्र वैवाहिक सुख, आकर्षण, ऐश्वर्य, भोग, विलासिता, वाहन एवं कलात्मक प्रतिभा का नैसर्गिक कारक है। ओपल धारण करने से शुक्र की शुभ ऊर्जा आकर्षित होती है।');
      benefitsList.push('वैवाहिक जीवन में प्रेम, सामंजस्य एवं गृहस्थ सुख की वृद्धि');
      benefitsList.push('व्यक्तित्व में चुंबकीय आकर्षण, सौम्यता एवं सामाजिक प्रतिष्ठा');
      benefitsList.push('धन का निरंतर प्रवाह, वाहन व भौतिक सुख-साधनों की प्राप्ति');
      vidhiParts.push('ओपल: ६ से ८.२५ रत्ती, चांदी या सफेद सोने में, अनामिका (Ring Finger) अथवा तर्जनी में शुक्रवार प्रातः शुक्ल पक्ष में "ॐ शुं शुक्राय नमः" (१०८ बार) जप कर धारण करें।');
    }

    if (isManik) {
      whyParts.push('• **माणिक्य (सूर्य ग्रह):** सूर्य आत्मा, पिता, मान-सम्मान एवं सरकारी/प्रशासनिक पद का स्वामी है। माणिक्य धारण करने से सूर्य का तेज प्राप्त होता है।');
      benefitsList.push('सरकारी कार्यों, पदोन्नति एवं प्रशासनिक साख में विजय');
      benefitsList.push('अदम्य आत्मविश्वास, नेत्र व हृदय स्वास्थ्य एवं ओजस्वी आभा');
      vidhiParts.push('माणिक्य: ५ से ७ रत्ती, तांबे या सोने में, अनामिका उंगली में रविवार प्रातः "ॐ घृणिः सूर्याय नमः" बोलकर पहनें।');
    }

    if (isMoti) {
      whyParts.push('• **मोती (चंद्र ग्रह):** चंद्र मन, भावना एवं मानसिक शांति का अधिपति है। मोती धारण से मन के उद्वेग शांत होते हैं।');
      benefitsList.push('मानसिक अशांति, अनिद्रा एवं अवसाद से स्थायी मुक्ति');
      benefitsList.push('क्रोध पर नियंत्रण एवं शीतलता की प्राप्ति');
      vidhiParts.push('मोती: ६ से ८.२५ रत्ती, शुद्ध चांदी में, कनिष्ठिका उंगली में सोमवार प्रातः/संध्या "ॐ सों सोमाय नमः" बोलकर पहनें।');
    }

    if (isPukhraj) {
      whyParts.push('• **पुखराज (गुरु ग्रह):** देवगुरु बृहस्पति ज्ञान, संतान, धर्म व समृद्धि के कारक हैं।');
      benefitsList.push('संतान सुख, उच्च विद्या एवं ईश्वरीय अनुकंपा की प्राप्ति');
      benefitsList.push('विवाह बाधा निवारण एवं स्थायी आर्थिक समृद्धि');
      vidhiParts.push('पुखराज: ४.२५ से ६.२५ रत्ती, सोने या पीतल में, तर्जनी उंगली में गुरुवार प्रातः "ॐ ग्रां ग्रीं ग्रौं सः गुरवे नमः" जप कर पहनें।');
    }

    if (isMunga) {
      whyParts.push('• **मूंगा (मंगल ग्रह):** मंगल साहस, पराक्रम, भूमि व रक्त का स्वामी है।');
      benefitsList.push('साहस व पराक्रम में वृद्धि, अचल संपत्ति का लाभ एवं रक्त विकार निवारण');
      vidhiParts.push('मूंगा: ६ से ८ रत्ती, तांबे या सोने में, अनामिका उंगली में मंगलवार प्रातः "ॐ क्रां क्रीं क्रौं सः भौमाय नमः" बोलकर पहनें।');
    }

    if (isNeelam) {
      whyParts.push('• **नीलम (शनि ग्रह):** शनि कर्म, न्याय व परिश्रम का फल देने वाले कर्मफलदाता हैं।');
      benefitsList.push('कार्यक्षेत्र में स्थायित्व, तुरंत भाग्योदय एवं श्रम का उचित फल');
      vidhiParts.push('नीलम: ५ से ७ रत्ती, पंचधातु या चांदी में, मध्यमा उंगली में शनिवार संध्या "ॐ शं शनैश्चराय नमः" बोलकर पहनें। (पहनने से पूर्व ३ दिन परीक्षण अवश्य करें)');
    }

    if (benefitsList.length === 0) {
      benefitsList.push('संबंधित ग्रह की शुभ रश्मियों का आभामंडल में प्रवेश');
      benefitsList.push('कार्यक्षेत्र व जीवन में आ रहे अकारण अवरोधों का शमन');
    }

    const ratnaCat = currentLang === 'en' ? 'Gemstone Prescription' : currentLang === 'gu' ? 'રત્ન ધારણ વિધાન' : 'रत्न धारण विधान';
    return {
      index,
      bullet,
      title: p,
      category: 'ratna',
      categoryLabel: ratnaCat,
      whyReason: whyParts.length > 0
        ? whyParts.join('\n\n')
        : (currentLang === 'en'
            ? 'This Vedic gemstone is prescribed to strengthen your Lagna Lord and Fortune/5th house lords, drawing positive cosmic energies into your aura.'
            : currentLang === 'gu'
            ? 'તમારી જન્મપત્રિકાના લગ્નેશ અને ભાગ્યેશ/પંચમેશને બળવાન બનાવવા આ શાસ્ત્રીય રત્ન ધારણ આવશ્યક છે.'
            : `आपकी जन्मपत्रिका के लग्नेश एवं भाग्येश/पंचमेश को बलवान बनाने हेतु यह शास्त्रीय रत्न धारण आवश्यक है। इससे जातक के आभामंडल में सकारात्मक कॉस्मिक रश्मियां प्रवेश करती हैं।`),
      benefits: benefitsList.length > 0 ? benefitsList : (currentLang === 'en' ? ['Enhanced mental focus and vitality', 'Financial and personal growth'] : ['માનસિક તેજ અને આત્મબળમાં વૃદ્ધિ', 'આર્થિક અને વ્યક્તિગત ઉન્નતિ']),
      vidhi: vidhiParts.length > 0 ? vidhiParts.join('\n\n') : (currentLang === 'en' ? 'Purify in raw cow milk and Gangajal on the prescribed weekday morning of Shukla Paksha and wear after chanting planetary mantra 108 times.' : currentLang === 'gu' ? 'શુક્લ પક્ષના શુભ વારે પ્રાતઃ સ્નાન બાદ કાચા દૂધ અને ગંગાજળથી શુદ્ધિ કરી ગ્રહ મંત્રના ૧૦૮ જપ કરી ધારણ કરો.' : 'शुक्ल पक्ष के शुभ वार को प्रातः स्नान उपरांत कच्चे दूध व गंगाजल से शोधन कर संबंधित ग्रह मंत्र का १०८ बार जप कर धारण करें।'),
      samagri: currentLang === 'en' ? 'Gangajal, raw cow milk, Tulsi leaves, ring in prescribed metal, incense and flowers.' : currentLang === 'gu' ? 'ગંગાજળ, ગાયનું કાચું દૂધ, તુલસી દલ, નિર્ધારિત ધાતુની વીંટી, ધૂપ-દીપ અને પુષ્પ.' : 'गंगाजल, कच्चा गाय का दूध, तुलसी दल, संबंधित धातु की अंगूठी, धूप-दीप व पुष्प।',
      precautions: currentLang === 'en' ? 'The gemstone must be natural, unheated, free from cracks and touching the skin.' : currentLang === 'gu' ? 'રત્ન પૂર્ણતઃ પ્રાકૃતિક, દોષરહિત અને ત્વચાને સ્પર્શતું હોવું જોઈએ.' : 'रत्न पूर्णतः प्राकृतिक, दोषरहित, बिना टूटा-फूटा व त्वचा को स्पर्श करने वाला होना चाहिए। खंडित या कृत्रिम कांच का रत्न न पहनें।',
    };
  }

  // 2. Fasting (उपवास / व्रत)
  if (p.includes('उपवास') || p.includes('व्रत')) {
    const isRavivar = p.includes('रविवार');
    const isBudhwar = p.includes('बुधवार');
    const isShukrawar = p.includes('शुक्रवार');
    const isGuruwar = p.includes('गुरुवार');
    const isMangalwar = p.includes('मंगलवार');
    const isSomwar = p.includes('सोमवार');
    const isShaniwar = p.includes('शनिवार');

    let planetName = 'ग्रह';
    let fastWhy = '';
    let fastBenefits: string[] = [];

    if (isRavivar) {
      planetName = 'सूर्य देव';
      fastWhy = 'सूर्य आत्मबल, जीवन ऊर्जा, पिता और मान-प्रतिष्ठा के अधिपति हैं। रविवार का उपवास करने से सूर्य ग्रह की ऊर्जा शरीर के मणिपुर चक्र (Solar Plexus) को सक्रिय करती है।';
      fastBenefits = [
        'आत्मविश्वास में भारी वृद्धि एवं सामाजिक यश-कीर्ति की प्राप्ति',
        'सरकारी, प्रशासनिक एवं उच्च अधिकारियों से संबंधित कार्यों में निर्विघ्न सफलता',
        'नेत्र, त्वचा, सिरदर्द व अस्थि जनित दुर्बलता का निवारण',
        'पिता के स्वास्थ्य व पैतृक संबंधों में सुखद सुधार',
      ];
    } else if (isBudhwar) {
      planetName = 'बुध देव';
      fastWhy = 'बुध बुद्धि, व्यापार, तर्क, संवाद एवं नसों (Nervous system) के नियंत्रक हैं। बुधवार का उपवास बुध की सौम्य ऊर्जा को संतुलित करता है।';
      fastBenefits = [
        'व्यापारिक सौदों में लाभ व नए ग्राहकों का आकर्षण',
        'अध्ययन, एकाग्रता व बौद्धिक कार्यों में असाधारण दक्षता',
        'त्वचा रोग, एलर्जी एवं वाणी की झिझक का अंत',
      ];
    } else if (isShukrawar) {
      planetName = 'शुक्र देव व मां लक्ष्मी';
      fastWhy = 'शुक्र भौतिक ऐश्वर्य, दांपत्य प्रेम, आकर्षण व सौंदर्य के देवता हैं। शुक्रवार का व्रत जीवन में आकर्षण व समृद्धि लाता है।';
      fastBenefits = [
        'दांपत्य जीवन में मधुरता एवं प्रेम संबंधों में प्रगाढ़ता',
        'आर्थिक तंगी व कर्ज से मुक्ति, धन संपदा का आगमन',
        'कला, संगीत, डिजाइन एवं मीडिया क्षेत्र में ख्याति',
      ];
    } else if (isGuruwar) {
      planetName = 'बृहस्पति देव व भगवान विष्णु';
      fastWhy = 'देवगुरु बृहस्पति ज्ञान, संतान, धर्म एवं ईश्वरीय कृपा के स्वामी हैं। गुरुवार का व्रत ज्ञान व वंश वृद्धि कराता है।';
      fastBenefits = [
        'संतान संबंधी चिंताओं का निवारण एवं योग्य संतान की प्राप्ति',
        'शीघ्र विवाह एवं दांपत्य में गुरु कृपा का संचार',
        'व्यापार में स्थायी विस्तार एवं सम्मानजनक आजीविका',
      ];
    } else if (isMangalwar) {
      planetName = 'श्री हनुमान जी व मंगल देव';
      fastWhy = 'मंगल साहस, रक्त, भूमि व पराक्रम के स्वामी हैं। मंगलवार का व्रत भय और शत्रु बाधा को समाप्त करता है।';
      fastBenefits = [
        'कर्ज व ऋण से मुक्ति एवं अचल संपत्ति (मकान/भूमि) के योग',
        'शत्रु, भय, कोर्ट-कचहरी एवं आकस्मिक संकटों का शमन',
        'रक्त विकार व आलस्य का पूर्ण निवारण',
      ];
    } else if (isSomwar) {
      planetName = 'भगवान शिव व चंद्र देव';
      fastWhy = 'चंद्रमा मन का कारक है। सोमवार का व्रत मानसिक शांति व शिव कृपा प्रदान करता है।';
      fastBenefits = [
        'मानसिक तनाव, ओवरथिंकिंग व अनिद्रा से मुक्ति',
        'मन की एकाग्रता व अंतःकरण में आध्यात्मिक शांति',
      ];
    } else {
      planetName = 'शनि देव';
      fastWhy = 'शनि कर्मफलदाता हैं। शनिवार का व्रत प्रारब्ध के कठिन कर्मों का क्षरण करता है।';
      fastBenefits = [
        'साढ़ेसाती, ढैय्या एवं शनि दोषों का तत्काल शमन',
        'रोजगार में स्थिरता एवं आकस्मिक रुकावटों का अंत',
      ];
    }

    const upvasCat = currentLang === 'en' ? 'Sattvic Fasting Method' : currentLang === 'gu' ? 'સાત્વિક ઉપવાસ વિધાન' : 'सात्विक उपवास विधान';
    return {
      index,
      bullet,
      title: p,
      category: 'upvas',
      categoryLabel: upvasCat,
      whyReason: fastWhy,
      benefits: fastBenefits,
      vidhi: currentLang === 'en'
        ? `Bathe in the morning and wear clean clothes. Meditate upon ${planetName} and take a fasting vow. Consume only water or fruits during the day. After sunset, take a single salt-free meal. Avoid anger, untruth and tamasic food.`
        : currentLang === 'gu'
        ? `પ્રાતઃ સ્નાન કરી સ્વચ્છ વસ્ત્રો પહેરો. ${planetName}નું ધ્યાન કરી વ્રતનો સંકલ્પ લો. આખો દિવસ માત્ર જળાહાર અથવા ફળાહાર કરો. સૂર્યાસ્ત પછી એક ટાણું મીઠું (નમક) વગરનું સાત્વિક ભોજન લો. ક્રોધ અને અસત્યથી બચો.`
        : `प्रातः स्नान कर स्वच्छ वस्त्र पहनें। ${planetName} का ध्यान कर व्रत का संकल्प लें। दिनभर केवल जलाहार अथवा फलाहार करें। सूर्यास्त के बाद एक समय बिना नमक का सात्विक भोजन (जैसे मीठी खीर, हलवा या फल) ग्रहण करें। तामसिक भोजन, क्रोध व झूठ से बचें।`,
      samagri: currentLang === 'en' ? 'Yellow/red/white cloth (per weekday), incense, pure ghee lamp, fruits, rock sugar, copper or brass pot.' : currentLang === 'gu' ? 'પીળું/લાલ/સફેદ વસ્ત્ર (વાર મુજબ), ધૂપ, ઘીનો દીવો, ફળ, સાકર, તાંબાનો લોટો.' : 'पीला/लाल/सफेद वस्त्र (वार अनुसार), धूप, शुद्ध घी का दीपक, फल, मिश्री, तांबे या पीतल का लोटा।',
      precautions: currentLang === 'en' ? 'Strictly abstain from salt, onion, garlic and alcohol on fast days. Keep the mind peaceful and engaged in divine prayer.' : currentLang === 'gu' ? 'વ્રતના દિવસે મીઠું, ડુંગળી, લસણ અને દારૂનો પૂર્ણ ત્યાગ કરો. શાંત ચિત્તે ઇષ્ટદેવનું સ્મરણ કરો.' : 'व्रत के दिन नमक, प्याज, लहसुन व मद्यपान का पूर्ण त्याग रखें। शांत चित्त से ईष्ट का स्मरण करें।',
    };
  }

  // 3. Stotra / Path (स्तोत्र / पाठ)
  if (p.includes('पाठ') || p.includes('स्तोत्र') || p.includes('सहस्रनाम') || p.includes('सुन्दरकाण्ड') || p.includes('चालीसा')) {
    let why = '';
    let benefits: string[] = [];
    let vidhi = '';

    if (p.includes('विष्णुसहस्रनाम')) {
      why = 'महाभारत के अनुशासन पर्व में भीष्म पितामह द्वारा युधिष्ठिर को उपदिष्ट श्रीविष्णुसहस्रनाम समस्त ग्रहों की पीड़ा शांत करने वाला अचूक महामंत्र है। भगवान विष्णु सृष्टि के पालनकर्ता हैं।';
      benefits = [
        'नवग्रहों की अशुभ रश्मियों का तत्काल शमन एवं सर्वग्रह शांति',
        'असाध्य रोगों, ऋण, शत्रु एवं अकाल भय से मुक्ति',
        'घर में साक्षात श्री महालक्ष्मी एवं नारायण का स्थायी वास',
        'बुद्धि में दिव्यता, चित्त की शुद्धि एवं मोक्ष मार्ग प्रशस्त',
      ];
      vidhi = 'नित्य प्रातः स्नान के उपरांत पूर्व या उत्तर दिशा की ओर मुख कर घी का दीपक प्रज्वलित करें और भक्तिपूर्वक पाठ करें। यदि समय कम हो तो एक बार पाठ या श्रवण अवश्य करें।';
    } else if (p.includes('आदित्यहृदय')) {
      why = 'वाल्मीकि रामायण के युद्धकांड में महर्षि अगस्त्य ने भगवान श्रीराम को रावण पर विजय प्राप्त करने हेतु आदित्यहृदय स्तोत्र प्रदान किया था। यह सूर्य के परम तेज का प्रत्यक्ष आह्वान है।';
      benefits = [
        'कार्यक्षेत्र में असंभव लगने वाली विजय एवं मुकदमों में सफलता',
        'मान-सम्मान, पद-प्रतिष्ठा, नेतृत्व एवं उच्च अधिकारियों की कृपा',
        'आत्मविश्वास का सूर्यवत प्रस्फुटन, नेत्र व हृदय विकारों का नाश',
      ];
      vidhi = 'रविवार से प्रारंभ कर प्रतिदिन प्रातः सूर्योदय के समय तांबे के लोटे में जल, लाल चंदन, गुड़ व लाल पुष्प डालकर सूर्य को अर्घ्य दें और पूर्व दिशा की ओर मुख करके ३ बार पाठ करें।';
    } else if (p.includes('सुन्दरकाण्ड')) {
      why = 'श्रीरामचरितमानस का पंचम सोपान सुन्दरकाण्ड भक्तों के समस्त अमंगल को मंगल में बदलने वाला सिद्ध काव्य है। श्री हनुमान जी की कृपा से काल भी नतमस्तक होता है।';
      benefits = [
        'मंगल दोष, राहु-केतु का कुचक्र, शनि की साढ़ेसाती एवं भूत-प्रेत बाधा का विनाश',
        'असाध्य कार्यों में चमत्कारी सफलता एवं मनोकामना पूर्ति',
        'पारिवारिक कलह का अंत एवं साहस व पराक्रम का संचार',
      ];
      vidhi = 'मंगलवार या शनिवार को संध्याकाल में चमेली के तेल या घी का दीपक जलाकर, हनुमान जी को सिंदूर व लड्डू अर्पित कर श्रद्धापूर्वक सम्पूर्ण सुन्दरकाण्ड का पाठ करें।';
    } else {
      why = 'वैदिक स्तोत्रों की परा-ध्वनि तरंगे जातक के सूक्ष्म शरीर (Aura) को नकारात्मक तरंगों से मुक्त कर सुरक्षा कवच (कवच) प्रदान करती हैं।';
      benefits = [
        'मानसिक एकाग्रता व अंतःकरण में असीम शांति',
        'प्रारब्ध कर्मों के अशुभ फलों का क्षरण एवं मनोवांछित फल प्राप्ति',
      ];
      vidhi = 'नित्य प्रातः या सायंकाल शुद्ध चित्त से दीपक जलाकर एकाग्रतापूर्वक पाठ करें।';
    }

    return {
      index,
      bullet,
      title: p,
      category: 'path',
      categoryLabel: 'शास्त्रीय स्तोत्र पाठ',
      whyReason: why,
      benefits,
      vidhi,
      samagri: 'शुद्ध घी का दीपक, तांबे का पात्र, गंगाजल, अगरबत्ती, पुष्प एवं आसान।',
      precautions: 'उच्चारण स्पष्ट व शुद्ध होना चाहिए। अशुद्ध अवस्था में या बिस्तर पर बैठकर पाठ न करें।',
    };
  }

  // 4. Daan (दान)
  if (p.includes('दान') || p.includes('कपड़ा') || p.includes('दाल') || p.includes('तिल') || p.includes('गुड़') || p.includes('दक्षिणा')) {
    let planetDaan = 'ग्रह';
    if (p.includes('पीला') || p.includes('चने की दाल')) planetDaan = 'बृहस्पति (गुरु)';
    else if (p.includes('काला') || p.includes('उड़द') || p.includes('लोहा')) planetDaan = 'शनि';
    else if (p.includes('हरा') || p.includes('मूंग')) planetDaan = 'बुध';
    else if (p.includes('लाल') || p.includes('मसूर')) planetDaan = 'मंगल / सूर्य';
    else if (p.includes('नीला') || p.includes('सप्तधान्य')) planetDaan = 'राहु';
    else if (p.includes('सफेद') || p.includes('चावल')) planetDaan = 'शुक्र / चंद्र';
    else if (p.includes('कंबल')) planetDaan = 'केतु';

    const daanCat = currentLang === 'en' ? 'Vedic Charity & Daan' : currentLang === 'gu' ? 'ગ્રહ દોષ નિવારક દાન' : 'ग्रह दोष निवारक दान';
    return {
      index,
      bullet,
      title: p,
      category: 'daan',
      categoryLabel: daanCat,
      whyReason: currentLang === 'en'
        ? `According to Vedic Shastras, charity is performed for malefic or obstructing planets. Donating items of ${planetDaan} pacifies harmful cosmic vibrations.`
        : currentLang === 'gu'
        ? `જ્યારે કોઈ ગ્રહ કુંડળીમાં અશુભ સ્થાનમાં હોય કે તેની દશામાં કષ્ટ આવતા હોય, ત્યારે તે ગ્રહની પ્રિય વસ્તુઓનું દાન કરવાથી અશુભ રશ્મિઓ શાંત થાય છે.`
        : `जब कोई ग्रह कुण्डली में अशुभ स्थान (६, ८, १२ भाव) में हो, नीच का हो, या उसकी दशा/अंतर्दशा में कष्ट आ रहे हों, तो उस ग्रह की प्रिय वस्तुओं का दान करने से उसकी तामसिक रश्मियां जातक से दूर होकर शांत हो जाती हैं। यह ${planetDaan} का शास्त्रीय परिहार है।`,
      benefits: currentLang === 'en' ? [
        'Immediate relief from unexpected hurdles and delays in active endeavors',
        'Effective control over debts, diseases, hidden enemies and wasteful expenditures',
        'Freedom from unknown fears, anxiety and heavy mental burdens',
        'Dissolution of past karmic debts and harmony in family life',
      ] : currentLang === 'gu' ? [
        'ચાલી રહેલા કાર્યોમાં આવતા અણધાર્યા વિઘ્નોનું તાત્કાલિક નિવારણ',
        'ઋણ, રોગ, શત્રુ અને બિનજરૂરી આર્થિક ખર્ચ પર નિયંત્રણ',
        'અજ્ઞાત ભય અને માનસિક ચિંતામાંથી મુક્તિ',
        'પૂર્વ જન્મકૃત પાપ કર્મોનો ક્ષય અને પારિવારિક શાંતિ',
      ] : [
        'चल रहे कार्यों में आ रहे अप्रत्याशित विघ्नों व रुकावटों का तत्काल निवारण',
        'ऋण, रोग, गुप्त शत्रु एवं अनावश्यक आर्थिक व्यय पर प्रभावी नियंत्रण',
        'मन पर छाए अज्ञात भय व भारीपन से मुक्ति तथा चित्त की शांति',
        'पूर्व जन्मकृत पाप कर्मों का क्षय एवं परिवार में सौहार्द',
      ],
      vidhi: currentLang === 'en'
        ? `Arrange charity items on a clean cloth or plate. Make a resolution to offer these for the pleasure of ${planetDaan} and relief of afflictions, then offer respectfully with Dakshina to a deserving priest or needy person.`
        : currentLang === 'gu'
        ? `દાન સામગ્રી નવીન વસ્ત્ર કે થાળમાં ગોઠવો. જમણા હાથમાં જળ-અક્ષત લઈ સંકલ્પ કરો અને યોગ્ય વિપ્ર કે જરૂરિયાતમંદને સન્માનપૂર્વક દક્ષિણા સહિત અર્પણ કરો.`
        : `दान सामग्री को एक नवीन कपड़े या थाल में सुव्यवस्थित रखें। दाहिने हाथ में जल व अक्षत लेकर संकल्प करें: "हे ${planetDaan} देव! मैं आपकी प्रसन्नता एवं अपने कष्ट निवारणार्थ यह वस्तुएं अर्पित कर रहा हूँ, मुझ पर कृपा करें।" इसके बाद यह दान किसी योग्य विप्र, जरूरतमंद, भिक्षुक अथवा संबंधित मंदिर में ससम्मान दक्षिणा सहित दें।`,
      samagri: p,
      precautions: currentLang === 'en' ? 'Charity must be given with a joyful heart, without ego and without public display. Never donate stale or useless items.' : currentLang === 'gu' ? 'દાન સદૈવ પ્રસન્ન મને, અહંકાર વગર અને ગુપ્ત રીતે કરવું જોઈએ. વાસી વસ્તુનું દાન કદાપિ ન કરવું.' : 'दान सदैव प्रसन्न मन से, बिना अहंकार और बिना किसी को जताए (गुप्त रीति से) करना चाहिए। बासी या अनुपयोगी वस्तु का दान कभी न करें।',
    };
  }

  // 5. Gau & Shwan Seva (गौ व श्वान सेवा)
  if (p.includes('गाय') || p.includes('कुत्ते') || p.includes('रोटी') || p.includes('सेवा') || p.includes('cow') || p.includes('dog')) {
    const sevaCat = currentLang === 'en' ? 'Living Being & Cow Service' : currentLang === 'gu' ? 'જીવ સેવા અને પંચ મહાયજ્ઞ' : 'जीव सेवा एवं पंच महायज्ञ';
    return {
      index,
      bullet,
      title: p,
      category: 'seva',
      categoryLabel: sevaCat,
      whyReason: currentLang === 'en'
        ? `In Sanatana Dharma, Bhuta Yajna (service to living beings) is paramount:\n• Cow: Abode of 33 crore divine deities and Kamadhenu; feeding cow pacifies Venus and Jupiter.\n• Dog: Vehicle of Lord Bhairava; absorbs negative malefic energies of Rahu, Ketu and Saturn.`
        : currentLang === 'gu'
        ? `સનાતન ધર્મના પંચ મહાયજ્ઞોમાં 'ભૂત યજ્ઞ' (જીવ સેવા) સર્વોચ્ચ છે:\n• ગૌમાતા: ગાયમાં ૩૩ કોટિ દેવી-દેવતાઓનો વાસ છે; ગાયને રોટલી આપવાથી શુક્ર અને ગુરુ તૃપ્ત થાય છે.\n• શ્વાન (કૂતરો): ભગવાન ભૈરવનાથનું વાહન છે; રાહુ, કેતુ અને શનિની નકારાત્મક તરંગોનું શમન કરે છે.`
        : `सनातन धर्म के पंच महायज्ञों में 'भूत यज्ञ' (जीव सेवा) सर्वोच्च है:\n• **गौ माता:** गाय के शरीर में ३३ कोटि देवी-देवताओं, मां लक्ष्मी एवं कामधेनु का साक्षात वास है। गाय को पहली रोटी देने से शुक्र व गुरु दोनों ग्रह तृप्त होते हैं।\n• **श्वान (कुत्ता):** कुत्ता भगवान भैरवनाथ का वाहन है और यमदूतों का मार्गदर्शक है। यह राहु, केतु एवं शनि की समस्त तामसिक व तांत्रिक नकारात्मक तरंगों को अपने ऊपर सोख लेता है।`,
      benefits: currentLang === 'en' ? [
        'Protection against untimely mishaps, accidents and negative forces',
        'Removal of financial hardships and lasting abundance',
        'Natural pacification of Rahu-Ketu, Kaal Sarp and Pitra doshas',
        'Mental peace, harmony in family and resolution of hidden crises',
      ] : currentLang === 'gu' ? [
        'અકસ્માત અને નકારાત્મક ઊર્જા સામે સુરક્ષા કવચ',
        'દરિદ્રતાનો નાશ અને અન્નપૂર્ણાની સ્થાયી બરકત',
        'રાહુ-કેતુ, કાલસર્પ અને પિતૃ દોષનું સ્વાભાવિક શમન',
        'પરિવારમાં માનસિક શાંતિ અને સુખ-સમૃદ્ધિ',
      ] : [
        'अकाल मृत्यु, मार्ग दुर्घटना एवं तांत्रिक कुचक्रों से सुरक्षा कवच',
        'घर में दरिद्रता का नाश, धन-धान्य एवं अन्नपूर्णा की स्थायी बरकत',
        'राहु-केतु की कुदृष्टि, कालसर्प एवं पितृ दोष का स्वाभाविक शमन',
        'परिवार में मानसिक शांति, सौहार्द एवं आने वाले गुप्त संकटों का निवारण',
      ],
      vidhi: currentLang === 'en'
        ? 'Offer the first fresh roti of the day with a little ghee and jaggery to the sacred cow. Offer the last roti with a little mustard oil respectfully to a dog.'
        : currentLang === 'gu'
        ? 'દરરોજ ઘરના ભોજનની પ્રથમ રોટલીમાં થોડું ઘી-ગોળ લગાવી ગૌમાતાને ખવડાવો. છેલ્લી રોટલીમાં થોડું સરસવનું તેલ લગાવી શ્વાનને આદરપૂર્વક ખવડાવો.'
        : 'प्रतिदिन घर में बनने वाले भोजन की सबसे पहली रोटी (गौ-ग्रास) में थोड़ा घी व गुड़ लगाकर गाय को अपने हाथों से खिलाएं। भोजन की अंतिम रोटी में थोड़ा सरसों का तेल लगाकर किसी काले या चितकबरे कुत्ते को आदरपूर्वक खिलाएं।',
      samagri: currentLang === 'en' ? 'Fresh wheat roti, pure desi ghee, jaggery and mustard oil.' : currentLang === 'gu' ? 'ઘઉંની તાજી રોટલી, શુદ્ધ દેશી ઘી, થોડો ગોળ અને સરસવનું તેલ.' : 'गेहूं की ताजी रोटी, शुद्ध देसी घी, थोड़ा गुड़ एवं सरसों का तेल।',
      precautions: currentLang === 'en' ? 'Never offer burnt, stale or leftover food. Never hit or frighten the animal.' : currentLang === 'gu' ? 'રોટલી ક્યારેય બળેલી કે વાસી ન આપવી. કૂતરાને ક્યારેય લાત ન મારવી.' : 'रोटी कभी भी जली हुई, बासी या जूठी न दें। कुत्ते को रोटी देते समय लात न मारें और न ही डराएं।',
    };
  }

  // 6. Shanti (विशिष्ट ग्रह दोष / दशा शान्ति — शास्त्रीय विस्तृत निर्णय)
  const isGrahan = p.includes('ग्रहण');
  const isKaalsarp = p.includes('कालसर्प');
  const isMangal = p.includes('मंगल') || p.includes('मांगलिक');
  const isChandal = p.includes('चाण्डाल');
  const isVish = p.includes('विष');
  const isAngarak = p.includes('अंगारक');
  const isShapit = p.includes('शापित');
  const isPitra = p.includes('पितृ');
  const isNeecha = p.includes('नीच');

  const sunPlanet = k?.planets?.find((pl) => pl.planet === 'सूर्य');
  const moonPlanet = k?.planets?.find((pl) => pl.planet === 'चंद्र');
  const marsPlanet = k?.planets?.find((pl) => pl.planet === 'मंगल');
  const jupPlanet = k?.planets?.find((pl) => pl.planet === 'गुरु');
  const satPlanet = k?.planets?.find((pl) => pl.planet === 'शनि');
  const rahuPlanet = k?.planets?.find((pl) => pl.planet === 'राहु');
  const ketuPlanet = k?.planets?.find((pl) => pl.planet === 'केतु');

  const sunH = sunPlanet?.house ?? -1;
  const moonH = moonPlanet?.house ?? -1;
  const marsH = marsPlanet?.house ?? -1;
  const jupH = jupPlanet?.house ?? -1;
  const satH = satPlanet?.house ?? -1;
  const rahuH = rahuPlanet?.house ?? -1;
  const ketuH = ketuPlanet?.house ?? -1;

  let shantiDeep: ShantiDeepDive | undefined = undefined;

  if (isGrahan) {
    const angDist = (d1?: number, d2?: number) => {
      if (d1 === undefined || d2 === undefined) return 999;
      const d = Math.abs(d1 - d2) % 360;
      return d > 180 ? 360 - d : d;
    };

    const sunDistRahu = angDist(sunPlanet?.degree, rahuPlanet?.degree);
    const sunDistKetu = angDist(sunPlanet?.degree, ketuPlanet?.degree);
    const moonDistRahu = angDist(moonPlanet?.degree, rahuPlanet?.degree);
    const moonDistKetu = angDist(moonPlanet?.degree, ketuPlanet?.degree);

    const hasSunRahu = Boolean(
      (sunH > 0 && sunH === rahuH) ||
      (sunPlanet && rahuPlanet && sunPlanet.rashi === rahuPlanet.rashi) ||
      sunDistRahu <= 15.0 ||
      p.includes('सूर्य-राहु')
    );
    const hasSunKetu = Boolean(
      (sunH > 0 && sunH === ketuH) ||
      (sunPlanet && ketuPlanet && sunPlanet.rashi === ketuPlanet.rashi) ||
      sunDistKetu <= 15.0 ||
      p.includes('सूर्य-केतु')
    );
    const hasMoonRahu = Boolean(
      (moonH > 0 && moonH === rahuH) ||
      (moonPlanet && rahuPlanet && moonPlanet.rashi === rahuPlanet.rashi) ||
      moonDistRahu <= 15.0 ||
      p.includes('चंद्र-राहु') || p.includes('कपालिका')
    );
    const hasMoonKetu = Boolean(
      (moonH > 0 && moonH === ketuH) ||
      (moonPlanet && ketuPlanet && moonPlanet.rashi === ketuPlanet.rashi) ||
      moonDistKetu <= 15.0 ||
      p.includes('चंद्र-केतु')
    );

    let type: 'surya_rahu' | 'surya_ketu' | 'chandra_rahu' | 'chandra_ketu' | 'other' = 'surya_rahu';
    let typeLabel = 'सूर्य-राहु ग्रहण योग (Surya Grahan Yog)';
    let houseNum = sunH > 0 ? sunH : moonH > 0 ? moonH : 1;
    let rashi = sunPlanet?.rashi || moonPlanet?.rashi || k?.lagnaRashi || 'मेष';
    let degreeDiff: number | undefined = undefined;

    if (hasSunRahu) {
      type = 'surya_rahu';
      typeLabel = 'सूर्य-राहु ग्रहण योग (आत्मबल, पिता व प्रतिष्ठा ग्रहण)';
      houseNum = sunH > 0 ? sunH : rahuH > 0 ? rahuH : 1;
      rashi = sunPlanet?.rashi || rahuPlanet?.rashi || '';
      degreeDiff = sunDistRahu < 180 ? sunDistRahu : Math.abs((sunPlanet?.degreeInRashi || 10) - (rahuPlanet?.degreeInRashi || 15));
    } else if (hasSunKetu) {
      type = 'surya_ketu';
      typeLabel = 'सूर्य-केतु ग्रहण योग (आत्म-संशय व आजीविका अवरोध)';
      houseNum = sunH > 0 ? sunH : ketuH > 0 ? ketuH : 1;
      rashi = sunPlanet?.rashi || ketuPlanet?.rashi || '';
      degreeDiff = sunDistKetu < 180 ? sunDistKetu : Math.abs((sunPlanet?.degreeInRashi || 10) - (ketuPlanet?.degreeInRashi || 15));
    } else if (hasMoonRahu) {
      type = 'chandra_rahu';
      typeLabel = 'चंद्र-राहु ग्रहण योग (कपालिका दोष — मानसिक तनाव व भ्रम)';
      houseNum = moonH > 0 ? moonH : rahuH > 0 ? rahuH : 1;
      rashi = moonPlanet?.rashi || rahuPlanet?.rashi || '';
      degreeDiff = moonDistRahu < 180 ? moonDistRahu : Math.abs((moonPlanet?.degreeInRashi || 12) - (rahuPlanet?.degreeInRashi || 16));
    } else if (hasMoonKetu) {
      type = 'chandra_ketu';
      typeLabel = 'चंद्र-केतु ग्रहण योग (मानसिक विषाद व वैराग्य-भ्रम)';
      houseNum = moonH > 0 ? moonH : ketuH > 0 ? ketuH : 1;
      rashi = moonPlanet?.rashi || ketuPlanet?.rashi || '';
      degreeDiff = moonDistKetu < 180 ? moonDistKetu : Math.abs((moonPlanet?.degreeInRashi || 12) - (ketuPlanet?.degreeInRashi || 18));
    } else {
      type = 'other';
      typeLabel = 'छाया ग्रह ग्रहण दोष शान्ति संकल्प';
      houseNum = sunH > 0 ? sunH : moonH > 0 ? moonH : 1;
      rashi = sunPlanet?.rashi || moonPlanet?.rashi || k?.lagnaRashi || '';
      degreeDiff = undefined;
    }

    const diffVal = degreeDiff !== undefined ? Math.abs(degreeDiff) : 8.0;
    let severity: 'अत्यधिक तीव्र' | 'तीव्र' | 'मध्यम' = 'तीव्र';
    let severityDesc = '';

    if (degreeDiff !== undefined && diffVal <= 5.0) {
      severity = 'अत्यधिक तीव्र';
      severityDesc = `ग्रह और छाया ग्रह केवल ${diffVal.toFixed(1)}° के अति-सूक्ष्म अंतर पर हैं। यह ९०%+ पूर्ण ग्रहण का रूप है, जिससे जीवन के इस भाव में तीव्र ऊर्जा अवरोध उत्पन्न होता है।`;
    } else if (degreeDiff !== undefined && diffVal <= 10.0) {
      severity = 'तीव्र';
      severityDesc = `ग्रह और छाया ग्रह ${diffVal.toFixed(1)}° की शास्त्रीय दीप्तांश युति में हैं। इसके प्रभाव से मानसिक तनाव अथवा कार्यक्षेत्र में बार-बार बनते काम अटकने का योग बनता है।`;
    } else if (degreeDiff !== undefined && diffVal <= 15.0) {
      severity = 'मध्यम';
      severityDesc = `ग्रह और छाया ग्रह ${diffVal.toFixed(1)}° के दीप्तांश प्रभाव मंडल में हैं। इसके प्रभाव से जीवन के संबंधित क्षेत्रों में उतार-चढ़ाव रहता है।`;
    } else {
      severity = 'मध्यम';
      severityDesc = `ग्रह और छाया ग्रह एक ही ${rashi ? `${rashi} राशि/भाव` : 'भाव'} में स्थित होकर ग्रहण योग निर्मित कर रहे हैं।`;
    }

    const isSurya = type.startsWith('surya');
    const whyReason = isSurya
      ? `आपकी जन्मपत्रिका के ${houseNum}वें भाव (${HOUSE_NAMES[houseNum] || `${houseNum}वां भाव`}) में सूर्य देव के साथ छाया ग्रह राहु/केतु की युति से यह **${typeLabel}** बन रहा है।\n• **ज्योतिषीय कारण:** सूर्य आत्मा, पिता, आरोग्य, राज-सम्मान एवं नेतृत्व के कारक हैं। जब तमोगुणी राहु/केतु सूर्य के साथ युति करते हैं, तो सूर्य की प्राण ऊर्जा पर ग्रहण लग जाता है। इससे व्यक्ति के मान-सम्मान में अकारण ठेस, सरकारी व उच्चाधिकारियों से मतभेद, पिता के स्वास्थ्य की चिंता तथा निर्णय लेने में संशय उत्पन्न होता है।`
      : `आपकी जन्मपत्रिका के ${houseNum}वें भाव (${HOUSE_NAMES[houseNum] || `${houseNum}वां भाव`}) में चंद्रमा के साथ छाया ग्रह राहु/केतु की युति से यह **${typeLabel}** बन रहा है।\n• **ज्योतिषीय कारण:** चंद्रमा मन, भावना, माता, मानसिक शांति एवं जल/रक्त तत्व के स्वामी हैं। जब राहु या केतु चंद्र के साथ बैठते हैं, तो इसे 'कपालिका' अथवा चंद्र ग्रहण योग कहा जाता है। इससे व्यक्ति अत्यधिक ओवरथिंकिंग, अनिद्रा, भय, घबराहट, नकारात्मक विचारों और माता के स्वास्थ्य की परेशानी से जूझता है।`;

    const whatBenefits = isSurya
      ? [
          'अदम्य आत्मविश्वास, तीक्ष्ण निर्णय क्षमता एवं आत्मबल का पुनर्जागरण',
          'नौकरी, व्यापार, प्रशासनिक कार्यों एवं सरकारी अनुमतियों में आ रही बाधाओं का अंत',
          'पिता के स्वास्थ्य में चमत्कारिक सुधार एवं पैतृक संपत्ति के मार्ग प्रशस्त',
          'सिरदर्द, नेत्र ज्योति, अस्थि दुर्बलता एवं हृदय रोगों से सुरक्षा',
          'समाज में खोई हुई प्रतिष्ठा, यश, पदोन्नति एवं नेतृत्व की पुनर्प्राप्ति',
        ]
      : [
          'मानसिक अशांति, ओवरथिंकिंग, अनिद्रा (Insomnia) व बेचैनी से पूर्ण मुक्ति',
          'मन में दिव्य शांति, एकाग्रता एवं अंतःप्रेरणा (Intuition) का विकास',
          'माता के स्वास्थ्य में सुधार एवं पारिवारिक जीवन में आनंद का संचार',
          'रक्त विकार, कफ, तनाव एवं हार्मोनल असंतुलन का शमन',
          'भविष्य को लेकर बैठा अज्ञात भय व डिप्रेशन पूरी तरह समाप्त',
        ];

    const lifeImpact = isSurya
      ? [
          'पिता के साथ विचारों में असमानता या पिता को शारीरिक कष्ट',
          'जितनी मेहनत की जाए, उसका पूरा श्रेय स्वयं को न मिलकर दूसरों को मिलना',
          'सरकारी या कानूनी मामलों में बेवजह अड़चनें पैदा होना',
        ]
      : [
          'रात को सोते समय मन में विचारों की बाढ़ आना या बुरे सपने देखना',
          'छोटी-छोटी बातों पर अत्यधिक भावुक या विचलित हो जाना',
          'माता के स्वास्थ्य में बार-बार उतार-चढ़ाव रहना',
        ];

    const sixStepVidhi = [
      {
        stepNo: 1,
        stepName: 'संकल्प (Sankalp)',
        stepVidhi: 'शुभ मुहूर्त (ग्रहण काल, अमावस्या, पूर्णिमा, या रविवार/सोमवार) में गंगाजल हाथ में लेकर यजमान का नाम, गोत्र, स्थान बोलकर दोष निवारण एवं सुख-शांति हेतु विधिवत संकल्प किया जाता है।',
      },
      {
        stepNo: 2,
        stepName: 'नवग्रह एवं अधिदेवता पूजन (Navgrah Pujan)',
        stepVidhi: 'सूर्य/चंद्र मंडल, राहु/केतु मंडल का विशेष स्थापन। गणेश-अंबिका पूजन, षोडश मातृका एवं वास्तु पीठ का अर्चन किया जाता है।',
      },
      {
        stepNo: 3,
        stepName: 'एकादशवार रुद्राभिषेक (Rudrabhishek)',
        stepVidhi: 'भगवान शिव काल और राहु-केतु के परम नियंता हैं। शिवलिंग पर गाय के कच्चे दूध, गंगाजल, गन्ने के रस व शहद से नमक-चमक युक्त रुद्राष्टाध्यायी के ११ पाठों द्वारा महाभिषेक संपन्न होता है।',
      },
      {
        stepNo: 4,
        stepName: 'मंत्र जप संख्या (कलियुग चतुर्गुण विधान)',
        stepVidhi: isSurya
          ? 'सूर्य वैदिक/बीज मंत्र का २८,००० जप (७,००० × ४) एवं राहु/केतु मंत्र का ७२,०००/६८,००० जप + महामृत्युंजय मंत्र का संपुट जप विद्वान ब्राह्मणों द्वारा पूर्ण कराया जाता है।'
          : 'चंद्र वैदिक/बीज मंत्र का ४४,००० जप (११,००० × ४) एवं राहु/केतु मंत्र का ७२,०००/६८,००० जप + महामृत्युंजय मंत्र जप संपन्न होता है।',
      },
      {
        stepNo: 5,
        stepName: 'दशांश हवन (Vedic Havan)',
        stepVidhi: 'मंत्र जप के उपरांत जप संख्या का दशांश (१०%) हवन किया जाता है। इसमें सूर्य हेतु मदार, चंद्र हेतु पलाश, राहु हेतु दूर्वा एवं केतु हेतु कुश समिधा, शुद्ध घृत, तिल व खीर की आहुतियां दी जाती हैं।',
      },
      {
        stepNo: 6,
        stepName: 'छाया दान, गोदान व विसर्जन (Chhaya Daan)',
        stepVidhi: 'कांस्य पात्र में सरसों का तेल भरकर यजमान अपना मुख देखकर छाया दान करता है। इसके साथ सप्तधान्य, काला-सफेद कंबल, दक्षिणा अर्पण एवं ब्राह्मण भोजन कराकर पूर्णाहूति होती है।',
      },
    ];

    const recommendedJapa = isSurya
      ? [
          { planet: 'सूर्य देव', count: '२८,००० जप (कलियुग विधान)', mantra: 'ॐ ह्रां ह्रीं ह्रौं सः सूर्याय नमः' },
          { planet: 'राहु देव', count: '७२,००० जप (कलियुग विधान)', mantra: 'ॐ भ्रां भ्रीं भ्रौं सः राहवे नमः' },
          { planet: 'केतु देव', count: '६८,००० जप (कलियुग विधान)', mantra: 'ॐ स्रां स्रीं स्रौं सः केतवे नमः' },
          { planet: 'महामृत्युंजय', count: '१,२५,००० (सवा लाख) जप', mantra: 'ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम्। उर्वारुकमिव बन्धनान्मृत्योर्मुक्षीय माऽमृतात्॥' },
        ]
      : [
          { planet: 'चंद्र देव', count: '४४,००० जप (कलियुग विधान)', mantra: 'ॐ श्रां श्रीं श्रौं सः चंद्रमसे नमः' },
          { planet: 'राहु देव', count: '७२,००० जप (कलियुग विधान)', mantra: 'ॐ भ्रां भ्रीं भ्रौं सः राहवे नमः' },
          { planet: 'केतु देव', count: '६८,००० जप (कलियुग विधान)', mantra: 'ॐ स्रां स्रीं स्रौं सः केतवे नमः' },
          { planet: 'महामृत्युंजय', count: '१,२५,००० (सवा लाख) जप', mantra: 'ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम्। उर्वारुकमिव बन्धनान्मृत्योर्मुक्षीय माऽमृतात्॥' },
        ];

    shantiDeep = {
      doshCategory: 'grahan',
      doshName: typeLabel,
      grahanType: type,
      grahanTypeLabel: typeLabel,
      houseNum,
      houseName: HOUSE_NAMES[houseNum] || `${houseNum}वां भाव`,
      rashi,
      degreeDiff,
      severity,
      severityDesc,
      whyReason,
      whatBenefits,
      lifeImpact,
      sixStepVidhi,
      recommendedJapa,
    };
  } else if (isKaalsarp) {
    const rHouse = rahuH > 0 ? rahuH : 1;
    const kHouse = ketuH > 0 ? ketuH : 7;
    const KS_TITLES: Record<number, string> = {
      1: 'अनन्त कालसर्प योग (१-७ अक्ष)',
      2: 'कुलिक कालसर्प योग (२-८ अक्ष)',
      3: 'वासुकि कालसर्प योग (३-९ अक्ष)',
      4: 'शंखपाल कालसर्प योग (४-१० अक्ष)',
      5: 'पद्म कालसर्प योग (५-११ अक्ष)',
      6: 'महापद्म कालसर्प योग (६-१२ अक्ष)',
      7: 'तक्षक कालसर्प योग (७-१ अक्ष)',
      8: 'कर्कोटक कालसर्प योग (८-२ अक्ष)',
      9: 'शंखचूड़ कालसर्प योग (९-३ अक्ष)',
      10: 'घातक कालसर्प योग (१०-४ अक्ष)',
      11: 'विषधर कालसर्प योग (११-५ अक्ष)',
      12: 'शेषनाग कालसर्प योग (१२-६ अक्ष)',
    };
    const ksName = KS_TITLES[rHouse] || 'कालसर्प योग (राहु-केतु अक्ष बंधन)';

    shantiDeep = {
      doshCategory: 'kaalsarp',
      doshName: ksName,
      typeLabel: ksName,
      houseNum: rHouse,
      houseName: `${rHouse}वें से ${kHouse}वें भाव अक्ष`,
      rashi: rahuPlanet?.rashi || '',
      severity: 'तीव्र',
      severityDesc: `कुंडली के समस्त ग्रह राहु (${rHouse}वें भाव) और केतु (${kHouse}वें भाव) के मध्य बंधे होने से भाग्योदय व प्रगति में निरंतर रुकावटें आती हैं।`,
      whyReason: `आपकी जन्मपत्रिका में समस्त शुभ ग्रह राहु और केतु की परिधि में आ जाने से कालसर्प योग बन रहा है। इसके प्रभाव से व्यक्ति अथक परिश्रम के उपरांत भी अपेक्षित फल से वंचित रहता है, विद्या, व्यापार अथवा वैवाहिक जीवन में अनपेक्षित विलंब होता है तथा मानसिक तनाव बना रहता है।`,
      whatBenefits: [
        'भाग्योदय की समस्त गुप्त व प्रत्यक्ष बाधाओं का स्थायी निवारण',
        'व्यापार, आजीविका व धन संचय में निरंतर वृद्धि एवं स्थिरता',
        'संतान सुख, विद्या लाभ एवं मानसिक शांति की प्राप्ति',
        'अज्ञात भय, बुरे स्वप्न एवं सर्प भय से पूर्ण मुक्ति',
        'पारिवारिक जीवन में सद्भाव व सुख-शांति का स्थायी वास',
      ],
      lifeImpact: [
        'सफलता के ऐन वक्त पर काम का बिगड़ जाना',
        'कड़ी मेहनत के बाद भी उचित मान-सम्मान न मिलना',
        'समय-समय पर भारी आर्थिक अस्थिरता या कर्ज़ की स्थिति',
      ],
      sixStepVidhi: [
        { stepNo: 1, stepName: 'प्रायश्चित संकल्प व तीर्थ स्नान', stepVidhi: 'त्र्यंबकेश्वर, उज्जैन अथवा गंगा तट पर यजमान द्वारा नाम, गोत्र व कालसर्प मुक्ति का वैदिक संकल्प।' },
        { stepNo: 2, stepName: 'नागबलि व नारायण पूजन', stepVidhi: 'स्वर्ण/चांदी के नाग-नागिन का निर्माण, प्राण-प्रतिष्ठा एवं षोडशोपचार विधिवत पूजन।' },
        { stepNo: 3, stepName: 'एकादशवार रुद्राभिषेक', stepVidhi: 'काल के नियंता देवाधिदेव महादेव का पंचामृत, गन्ने के रस व भस्म से रुद्राष्टाध्यायी युक्त महाभिषेक।' },
        { stepNo: 4, stepName: 'राहु-केतु वैदिक मंत्र अनुष्ठान', stepVidhi: 'राहु का ७२,००० जप एवं केतु का ६८,००० जप कलियुग चतुर्गुण विधान से विद्वान आचार्यों द्वारा संपन्न।' },
        { stepNo: 5, stepName: 'दशांश हवन एवं आहुति', stepVidhi: 'दूर्वा, कुश, काले तिल, जौ व शुद्ध घृत से राहु-केतु एवं नवग्रह समिधा हवन।' },
        { stepNo: 6, stepName: 'चांदी के नाग-नागिन विसर्जन व गोदान', stepVidhi: 'पूजित नाग-नागिन को पवित्र नदी/कुंड में विसर्जन, ब्राह्मण भोजन, वस्त्र व दक्षिणा अर्पण।' },
      ],
      recommendedJapa: [
        { planet: 'राहु देव', count: '७२,००० जप', mantra: 'ॐ भ्रां भ्रीं भ्रौं सः राहवे नमः' },
        { planet: 'केतु देव', count: '६८,००० जप', mantra: 'ॐ स्रां स्रीं स्रौं सः केतवे नमः' },
        { planet: 'महामृत्युंजय', count: '१,२५,००० जप', mantra: 'ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम्। उर्वारुकमिव बन्धनान्मृत्योर्मुक्षीय माऽमृतात्॥' },
      ],
    };
  } else if (isMangal) {
    const mHouse = marsH > 0 ? marsH : 1;
    shantiDeep = {
      doshCategory: 'manglik',
      doshName: `मांगलिक दोष शान्ति (${mHouse}वें भाव भौम प्रभाव)`,
      typeLabel: `मांगलिक दोष शान्ति एवं मंगल भात पूजा`,
      houseNum: mHouse,
      houseName: HOUSE_NAMES[mHouse] || `${mHouse}वां भाव`,
      rashi: marsPlanet?.rashi || '',
      severity: 'तीव्र',
      severityDesc: `कुंडली के ${mHouse}वें भाव में मंगल की स्थिति से दांपत्य, स्वभाव व रक्त-उग्रता में प्रतिकूल प्रभाव रहता है।`,
      whyReason: `आपकी जन्मपत्रिका के ${mHouse}वें भाव में मंगल देव स्थित होने से मांगलिक योग बन रहा है। मंगल तेज, पराक्रम व अग्नि तत्व के अधिपति हैं। जब यह लग्न, चतुर्थ, सप्तम, अष्टम या द्वादश भाव में होते हैं, तो दांपत्य जीवन में वैचारिक मतभेद, विवाह में विलंब, क्रोध व रक्त विकार की संभावना बनती है।`,
      whatBenefits: [
        'विवाह में आ रही समस्त अड़चनों, विलंब व दोषों का शमन',
        'दांपत्य जीवन में प्रेम, मधुरता एवं दीर्घायु की प्राप्ति',
        'उग्र स्वभाव, क्रोध एवं मानसिक उत्तेजना में शांति',
        'भूमि, भवन, वाहन एवं अचल संपत्ति की प्राप्ति में सुगमता',
        'रक्त विकार, दुर्घटना एवं शल्य-चिकित्सा (Surgery) भय से सुरक्षा',
      ],
      lifeImpact: [
        'छोटी-छोटी बातों पर उग्र विवाद या क्रोध आना',
        'विवाह योग्य आयु में योग्य रिश्ते मिलने में बाधा',
        'रक्तचाप अथवा बार-बार चोट-चपेट लगना',
      ],
      sixStepVidhi: [
        { stepNo: 1, stepName: 'संकल्प एवं भौम पूजन', stepVidhi: 'मंगलवार के दिन लाल पुष्प, कुमकुम, अक्षत लेकर मंगल देव की प्रसन्नता व विवाह सुख हेतु संकल्प।' },
        { stepNo: 2, stepName: 'मंगल भात पूजा (अंगारेश्वर/उज्जैन विधान)', stepVidhi: 'शिवलिंग स्वरूप मंगल देव पर पके हुए चावल (भात) से शीतलीकरण अभिषेक, दही-दूध अर्पण।' },
        { stepNo: 3, stepName: 'ऋणमोचक मंगल स्तोत्र पाठ', stepVidhi: 'भगवान कार्तिकेय एवं मंगल देव के २१ पाठों द्वारा मंगल दोष व कर्ज बाधा का निवारण।' },
        { stepNo: 4, stepName: 'मंगल बीज मंत्र जप (४०,००० संख्या)', stepVidhi: 'ॐ क्रां क्रीं क्रौं सः भौमाय नमः मंत्र का कलियुग विधान अनुसार चालीस हजार जप।' },
        { stepNo: 5, stepName: 'खदिर समिधा दशांश हवन', stepVidhi: 'खैर (खदिर) की समिधा, लाल चंदन, घृत, गुड़ व तिल से दशांश हवन संपन्न करना।' },
        { stepNo: 6, stepName: 'ताम्र पात्र, मसूर व लाल वस्त्र दान', stepVidhi: 'तांबे का लोटा, सवा किलो लाल मसूर दाल, गुड़, लाल वस्त्र व दक्षिणा ब्राह्मण को अर्पण।' },
      ],
      recommendedJapa: [
        { planet: 'मंगल देव (वैदिक)', count: '४०,००० जप', mantra: 'ॐ क्रां क्रीं क्रौं सः भौमाय नमः' },
        { planet: 'अंगारक गायत्री', count: '१०,००० जप', mantra: 'ॐ अंगारकाय विद्महे शक्तिहस्ताय धीमहि तन्नो भौमः प्रचोदयात्॥' },
        { planet: 'हनुमान साधना', count: 'नित्य पाठ', mantra: 'श्री सुन्दरकाण्ड एवं हनुमान चालीसा' },
      ],
    };
  } else if (isChandal) {
    const jHouse = jupH > 0 ? jupH : 1;
    shantiDeep = {
      doshCategory: 'guru_chandal',
      doshName: 'गुरु-चाण्डाल योग शान्ति (बृहस्पति-राहु युति)',
      typeLabel: 'गुरु-चाण्डाल योग शान्ति एवं श्री हरि पूजन',
      houseNum: jHouse,
      houseName: HOUSE_NAMES[jHouse] || `${jHouse}वां भाव`,
      rashi: jupPlanet?.rashi || '',
      severity: 'तीव्र',
      severityDesc: `कुंडली के ${jHouse}वें भाव में देवगुरु बृहस्पति के साथ छाया ग्रह राहु की युति से ज्ञान, विवेक व संतान सुख पर ग्रहण लगता है।`,
      whyReason: `आपकी कुंडली में देवगुरु बृहस्पति के साथ राहु की युति होने से चाण्डाल योग बन रहा है। गुरु धर्म, विवेक, ज्ञान, संतान व समृद्धि के कारक हैं। राहु के प्रभाव से व्यक्ति के निर्णयों में भ्रम, बड़े-बुजुर्गों से मतभेद, विद्या व संतान प्राप्ति में अड़चनें आती हैं।`,
      whatBenefits: [
        'सटीक निर्णय क्षमता, प्रज्ञा व बौद्धिक स्पष्टता की पुनर्प्राप्ति',
        'संतान सुख, उच्च शिक्षा एवं प्रतियोगी परीक्षाओं में सफलता',
        'समाज में मान-सम्मान, पद-प्रतिष्ठा एवं गुरुजनों का आशीर्वाद',
        'आर्थिक हानियों व व्यर्थ के निवेशों पर पूर्ण रोक',
        'धार्मिक कार्यों में रुचि एवं आध्यात्मिक शांति का उदय',
      ],
      lifeImpact: [
        'ज्ञान होने के बावजूद गलत निर्णय ले लेना',
        'संतान से चिंता या विद्या में बार-बार भटकाव',
        'बड़ों के प्रति कभी-कभी अनादर का भाव उत्पन्न होना',
      ],
      sixStepVidhi: [
        { stepNo: 1, stepName: 'गुरु-राहु शुद्धि संकल्प', stepVidhi: 'गुरुवार को पीले पुष्प व गंगाजल लेकर चाण्डाल दोष शमन एवं सात्विक विवेक हेतु संकल्प।' },
        { stepNo: 2, stepName: 'श्री हरि विष्णु व देवगुरु पूजन', stepVidhi: 'शालिग्राम जी अथवा विष्णु प्रतिमा का पंचामृत अभिषेक, तुलसी दल व पीले वस्त्र अर्पण।' },
        { stepNo: 3, stepName: 'श्रीविष्णुसहस्रनाम पारायण', stepVidhi: 'विद्वान ब्राह्मणों द्वारा विष्णुसहस्रनाम एवं पुरुषसूक्त के ११ सस्वर पाठ।' },
        { stepNo: 4, stepName: 'गुरु व राहु मंत्र जप', stepVidhi: 'गुरु बीज मंत्र का ७६,००० जप एवं राहु मंत्र का ७२,००० जप कलियुग चतुर्गुण विधान से।' },
        { stepNo: 5, stepName: 'पीपल समिधा दशांश हवन', stepVidhi: 'पीपल की समिधा, चने की दाल, हल्दी, शुद्ध घृत व खीर से दशांश हवन संपन्न करना।' },
        { stepNo: 6, stepName: 'पीत वस्त्र, चने की दाल व स्वर्ण दान', stepVidhi: 'पीले वस्त्र, चना दाल, गुड़, हल्दी, पञ्चरत्न/स्वर्ण दक्षिणा योग्य वेदपाठी विप्र को अर्पण।' },
      ],
      recommendedJapa: [
        { planet: 'गुरु देव', count: '७६,००० जप', mantra: 'ॐ ग्रां ग्रीं ग्रौं सः गुरवे नमः' },
        { planet: 'राहु देव', count: '७२,००० जप', mantra: 'ॐ भ्रां भ्रीं भ्रौं सः राहवे नमः' },
        { planet: 'विष्णु स्तुति', count: '११ पाठ', mantra: 'ॐ नमो भगवते वासुदेवाय' },
      ],
    };
  } else if (isVish) {
    const vHouse = moonH > 0 ? moonH : 1;
    shantiDeep = {
      doshCategory: 'vish_yog',
      doshName: 'विष योग शान्ति (शनि-चंद्र युति)',
      typeLabel: 'विष योग शान्ति एवं एकादशवार रुद्राभिषेक',
      houseNum: vHouse,
      houseName: HOUSE_NAMES[vHouse] || `${vHouse}वां भाव`,
      rashi: moonPlanet?.rashi || '',
      severity: 'तीव्र',
      severityDesc: `कुंडली के ${vHouse}वें भाव में शनि और चंद्रमा की युति से मन में अवसाद, निराशावाद व विलंब का योग बनता है।`,
      whyReason: `चंद्रमा मन के स्वामी हैं और शनि अंधकार, मंदता व वैराग्य के कारक हैं। जब दोनों एक साथ बैठते हैं तो इसे 'विष योग' कहा जाता है। इससे व्यक्ति अत्यधिक ओवरथिंकिंग, निराशा, अकेलापन, माता को कष्ट एवं बनते हुए कार्यों में ऐन वक्त पर विलंब का सामना करता है।`,
      whatBenefits: [
        'मानसिक अवसाद (Depression), नकारात्मक विचारों व घबराहट से स्थायी मुक्ति',
        'मन में अपार शांति, सकारात्मकता, उत्साह एवं एकाग्रता का संचार',
        'माता के स्वास्थ्य में सुधार व माता से सुख-आशीर्वाद की प्राप्ति',
        'कार्यक्षेत्र में निरंतर हो रहे विलंब व रुकावटों का अंत',
        'पारिवारिक व व्यक्तिगत जीवन में स्थायित्व एवं आत्मविश्वास',
      ],
      lifeImpact: [
        'बिना कारण मन उदास रहना या अकेले रहने की इच्छा होना',
        'रात में देर तक नींद न आना और नकारात्मक विचार चलना',
        'किसी भी काम में बार-बार अंतिम क्षणों में रुकावट आना',
      ],
      sixStepVidhi: [
        { stepNo: 1, stepName: 'विष योग मुक्ति संकल्प', stepVidhi: 'सोमवार या शनिवार को गंगाजल हाथ में लेकर शिव-पार्वती सम्मुख मानसिक शांति व विष योग निवारण संकल्प।' },
        { stepNo: 2, stepName: 'महादेव का एकादशवार रुद्राभिषेक', stepVidhi: 'कच्चे गाय के दूध, गंगाजल, शहद व गन्ने के रस से नमक-चमक युक्त रुद्राष्टाध्यायी के ११ पाठों द्वारा अभिषेक।' },
        { stepNo: 3, stepName: 'शिव सहस्रनाम व मृत्युंजय जप', stepVidhi: 'भगवान भोलेनाथ के सहस्रनाम पाठ एवं महामृत्युंजय मंत्र का संपुट जप विद्वान आचार्यों द्वारा।' },
        { stepNo: 4, stepName: 'शनि व चंद्र मंत्र जप संख्या', stepVidhi: 'शनि देव का ९२,००० जप एवं चंद्र देव का ४४,००० जप कलियुग चतुर्गुण विधान अनुसार संपन्न करना।' },
        { stepNo: 5, stepName: 'शमी व पलाश समिधा हवन', stepVidhi: 'शनि हेतु शमी व चंद्र हेतु पलाश समिधा, काले तिल, चावल, घृत व खीर से दशांश हवन।' },
        { stepNo: 6, stepName: 'छाया दान व विप्र सेवा', stepVidhi: 'कांस्य पात्र में सरसों तेल छाया दान, काला व सफेद वस्त्र दान, खीर का प्रसाद वितरण।' },
      ],
      recommendedJapa: [
        { planet: 'शनि देव', count: '९२,००० जप', mantra: 'ॐ शं शनैश्चराय नमः' },
        { planet: 'चंद्र देव', count: '४४,००० जप', mantra: 'ॐ सों सोमाय नमः' },
        { planet: 'महामृत्युंजय', count: '१,२५,००० जप', mantra: 'ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम्। उर्वारुकमिव बन्धनान्मृत्योर्मुक्षीय माऽमृतात्॥' },
      ],
    };
  } else {
    // Default Authentic Vedic Remedy: Mahadasha & Navagraha Shanti
    const mahaLord = k?.mahadasha || 'नवग्रह';
    const mahaSpec = PLANET_REMEDY[mahaLord] || PLANET_REMEDY['गुरु'];
    shantiDeep = {
      doshCategory: 'mahadasha_navgrah',
      doshName: `${mahaLord} महादशा एवं नवग्रह शान्ति`,
      typeLabel: `${mahaLord} महादशा अनुकूलन एवं नवग्रह मंडल हवन`,
      houseNum: 1,
      houseName: 'समस्त भाव व कुण्डली आधार',
      rashi: k?.lagnaRashi || 'मेष',
      severity: 'सौम्य / अनुकूल',
      severityDesc: `कुंडली में वर्तमान चल रही ${mahaLord} महादशा के अनुकूल फल प्राप्त करने एवं नवग्रहों की शुभ रश्मियां जाग्रत करने हेतु शास्त्रीय विधान।`,
      whyReason: `जन्मपत्रिका में दशा काल का सर्वोपरि महत्व है। वर्तमान में आपकी पत्रिका में **${mahaLord} की महादशा** सक्रिय है। जातक के जीवन की समस्त घटनाएं, सुख-दुःख, आरोग्य व धन लाभ वर्तमान दशा स्वामी ग्रह के आधीन होते हैं। अतः दशा नाथ की अनुकूलता एवं नवग्रहों के सामंजस्य हेतु यह शान्ति अनुष्ठान सर्वश्रेष्ठ है।`,
      whatBenefits: [
        `वर्तमान ${mahaLord} महादशा के अनिष्ट फलों का शमन एवं शुभ परिणामों में चमत्कारिक वृद्धि`,
        'समस्त नवग्रहों की अनुकूलता से जीवन के सभी क्षेत्रों में स्थिरता व शांति',
        'आरोग्य लाभ, मानसिक तनाव व पारिवारिक कलह से पूर्ण मुक्ति',
        'आजीविका, नौकरी, पदोन्नति एवं व्यापारिक लेन-देन में निरंतर प्रगति',
        'घर में मांगलिक कार्यों का मार्ग प्रशस्त एवं इष्टदेव की कृपा प्राप्ति',
      ],
      lifeImpact: [
        'वर्तमान समय में बनते कार्यों में अप्रत्याशित विलंब या बाधाएं',
        'दशा स्वामी ग्रह की निर्बलता के कारण मन में चिंता या स्वास्थ्य उतार-चढ़ाव',
        'पारिवारिक या आर्थिक मामलों में अनावश्यक खर्च व तनाव',
      ],
      sixStepVidhi: [
        { stepNo: 1, stepName: 'वैदिक संकल्प (Sankalp)', stepVidhi: 'शुभ दिन (दशा स्वामी वार अथवा पूर्णिमा/अमावस्या) पर हाथ में जल, अक्षत व पुष्प लेकर यजमान का नाम, गोत्र व दशा-शांति संकल्प।' },
        { stepNo: 2, stepName: 'नवग्रह मंडल व पीठ स्थापन', stepVidhi: 'सप्तधान्य पर नवग्रह मंडल, अधिदेवता, प्रत्यधिदेवता, पंचलोकपाल एवं वास्तु पीठ का प्रामाणिक पूजन।' },
        { stepNo: 3, stepName: 'एकादशवार रुद्राष्टाध्यायी अभिषेक', stepVidhi: 'समस्त ग्रहों के अधिपति भगवान शिव का गाय के दूध, गंगाजल, शहद व गन्ने के रस से महाभिषेक।' },
        { stepNo: 4, stepName: `${mahaLord} महादशा नाथ वैदिक मंत्र जप`, stepVidhi: `${mahaLord} के वैदिक/बीज मंत्र का कलियुग चतुर्गुण संख्या में विद्वान ब्राह्मणों द्वारा जप अनुष्ठान।` },
        { stepNo: 5, stepName: 'नवग्रह समिधा दशांश हवन', stepVidhi: 'नवग्रहों की ९ समिधाओं (मदार, पलाश, खदिर, अपामार्ग, पीपल, गूलर, शमी, दूर्वा, कुश) से दशांश आहुति व पूर्णाहूति।' },
        { stepNo: 6, stepName: 'ब्राह्मण भोजन, गोसेवा व दक्षिणा', stepVidhi: 'योग्य वेदपाठी ब्राह्मणों को भोजन, वस्त्र, दक्षिणा अर्पण एवं गौमाता को गुड़-रोटी खिलाकर आशीर्वाद ग्रहण।' },
      ],
      recommendedJapa: [
        { planet: `${mahaLord} (दशा नाथ)`, count: `${mahaSpec.japaCount}`, mantra: mahaSpec.mantra },
        { planet: 'नवग्रह एकाक्षरी', count: '२१,००० जप', mantra: 'ॐ ब्रह्मा मुरारिस्त्रिपुरान्तकारी भानुः शशी भूमिसुतो बुधश्च। गुरुश्च शुक्रः शनिराहुकेतवः सर्वे ग्रहाः शान्तिकरा भवन्तु॥' },
        { planet: 'महामृत्युंजय', count: '२१,००० जप', mantra: 'ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम्। उर्वारुकमिव बन्धनान्मृत्योर्मुक्षीय माऽमृतात्॥' },
      ],
    };
  }

  return {
    index,
    bullet,
    title: p,
    category: 'shanti',
    categoryLabel: 'विशिष्ट दोष व ग्रह शान्ति विधान',
    whyReason: shantiDeep!.whyReason,
    benefits: shantiDeep!.whatBenefits,
    vidhi: 'यह अनुष्ठान किसी सिद्ध तीर्थ (काशी, उज्जैन, त्र्यंबकेश्वर) या घर पर विद्वान आचार्यों द्वारा विधिपूर्वक ६ चरणों में संपन्न कराया जाता है।',
    mantra: shantiDeep!.recommendedJapa[0]?.mantra || 'ॐ नमो भगवते वासुदेवाय',
    japaCount: shantiDeep!.recommendedJapa.map((j) => `${j.planet}: ${j.count}`).join(' | '),
    samagri: 'कांस्य पात्र, सरसों का तेल/तिल, नवग्रह समिधा (मदार/पलाश/शमी/दूर्वा/कुश), हवन सामग्री, पंचामृत, गंगाजल, रुद्राक्ष माला।',
    precautions: 'अनुष्ठान के दौरान पूर्ण ब्रह्मचर्य, भूमि शयन अथवा सात्विक आहार का पालन करें। मद्य-मांस का पूर्ण त्याग रखें।',
    shantiDeepDive: shantiDeep,
  };
}

/**
 * Builds a comprehensive, human-like detailed guide for the entire Upay Parchi.
 */
export function buildDetailedParchiGuideText(
  salutation: string,
  serialNo: string,
  dateStr: string,
  lagnaInfo: string,
  detailedItems: UpayParchiDetailedItem[],
  grahanDeep?: GrahanShantiDeepDive,
  lang: string = 'hi'
): string {
  const currentLang = (lang || 'hi').slice(0, 2).toLowerCase();
  const lines: string[] = [
    `॥ ॐ श्री गणेशाय नमः ॥`,
    currentLang === 'en'
      ? `📋 **Astrological Remedies Slip — Yajman Comprehensive Guidance & Fruits**`
      : currentLang === 'gu'
      ? `📋 **જ્યોતિષીય ઉપાય પર્ચી — યજમાન વિસ્તૃત માર્ગદર્શન અને ફળ**`
      : `📋 **ज्योतिषीय उपाय पर्ची — यजमान विस्तृत मार्गदर्शन एवं फल**`,
    currentLang === 'en'
      ? `Sr. No.: ${serialNo} | Date: ${dateStr}`
      : currentLang === 'gu'
      ? `ક્રમાંક: ${serialNo} | તારીખ: ${dateStr}`
      : `क्रमांक: ${serialNo} | दिनांक: ${dateStr}`,
    currentLang === 'en'
      ? `Yajman: **${salutation}**`
      : currentLang === 'gu'
      ? `યજમાન: **${salutation}**`
      : `यजमान: **${salutation}**`,
    currentLang === 'en'
      ? `Horoscope Basis: ${lagnaInfo}`
      : currentLang === 'gu'
      ? `કુંડળી આધાર: ${lagnaInfo}`
      : `कुण्डली आधार: ${lagnaInfo}`,
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    ``,
    currentLang === 'en'
      ? `Dear Yajman, this prescription slip has been meticulously prepared based on the micro planetary strengths, house positions, and vimshottari dasha in your birth chart. Below are the Shastric rationale (why to perform), tangible benefits, and detailed procedures for each remedy:`
      : currentLang === 'gu'
      ? `પ્રિય યજમાન, તમારી જન્મપત્રિકાના સૂક્ષ્મ ગ્રહ બળ, ભાવ સ્થિતિ અને દશાના આધારે આ ઉપાય પર્ચી તૈયાર કરવામાં આવી છે. નીચે પર્ચીમાં લખેલ પ્રત્યેક ઉપાયનું શાસ્ત્રીય કારણ (શા માટે કરવું), પ્રત્યક્ષ લાભ (શું ફળ મળશે) અને વિસ્તૃત વિધિ આપેલ છે:`
      : `प्रिय यजमान, आपकी जन्मपत्रिका के सूक्ष्म ग्रह बल, भाव स्थिति एवं दशा के आधार पर यह उपाय पर्ची तैयार की गई है। नीचे पर्ची में लिखे प्रत्येक उपाय का **शास्त्रीय कारण (क्यों करना है)**, **प्रत्यक्ष लाभ (क्या फल मिलेगा)** एवं **विस्तृत विधि** दी जा रही है:`,
    ``,
  ];

  detailedItems.forEach((item) => {
    lines.push(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    lines.push(`### ${item.bullet} ${item.title} (${item.categoryLabel})`);
    lines.push(``);
    lines.push(`❓ **यह उपाय क्यों करें? (शास्त्रीय कारण):**`);
    lines.push(item.whyReason);
    lines.push(``);
    lines.push(`🌟 **इस उपाय से क्या-क्या लाभ होगा? (प्रत्यक्ष फल):**`);
    item.benefits.forEach((b) => lines.push(`  ✓ ${b}`));
    lines.push(``);
    lines.push(`📿 **प्रामाणिक शास्त्रीय विधि एवं नियम:**`);
    lines.push(item.vidhi);

    if (item.mantra) {
      lines.push(`• **सिद्ध मंत्र:** \`${item.mantra}\``);
    }
    if (item.japaCount) {
      lines.push(`• **जप संख्या:** ${item.japaCount}`);
    }
    if (item.samagri) {
      lines.push(`• **आवश्यक सामग्री:** ${item.samagri}`);
    }
    if (item.precautions) {
      lines.push(`• **विशेष सावधानी:** ${item.precautions}`);
    }

    if (item.shantiDeepDive) {
      const g = item.shantiDeepDive;
      lines.push(``);
      lines.push(`🔱 **${g.doshName} — सूक्ष्म निर्णय एवं ६-चरणीय शान्ति विधान:**`);
      lines.push(`• **दोष / योग का स्वरूप:** ${g.typeLabel || g.grahanTypeLabel || g.doshName}`);
      if (g.houseName) {
        lines.push(`• **भाव व स्थिति:** ${g.houseName} ${g.rashi ? `(${g.rashi} राशि)` : ''}`);
      }
      lines.push(`• **तीव्रता व प्रभाव:** **${g.severity}** (${g.severityDesc})`);
      lines.push(`• **६-चरणीय पूर्ण शान्ति विधि:**`);
      g.sixStepVidhi.forEach((s) => {
        lines.push(`  ${s.stepNo}. **${s.stepName}:** ${s.stepVidhi}`);
      });
      lines.push(`• **कलियुग चतुर्गुण मंत्र जप संख्या तालिका:**`);
      g.recommendedJapa.forEach((rj) => {
        lines.push(`  - ${rj.planet}: **${rj.count}** (मंत्र: ${rj.mantra})`);
      });
    }

    lines.push(``);
  });

  lines.push(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  lines.push(`॥ शुभम् भवतू • श्री उमा वैदिक ज्योतिष पीठ ॥`);

  return lines.join('\n');
}

/**
 * Generates an authentic 6-point Vedic Astrologer Prescription Slip ("परामर्श पर्ची / उपाय पत्रक")
 * modeled directly after traditional Kashi/Ujjain/Burhanpur Jyotishacharya letterheads,
 * enriched with complete astrological reasoning, benefits, and vidhi for the yajman.
 */
export function translateGemString(str: string, lang: string): string {
  if (lang === 'en') {
    return str
      .replace(/नीलम/g, 'Blue Sapphire')
      .replace(/जमुनिया/g, 'Amethyst')
      .replace(/ओपल/g, 'Opal')
      .replace(/हीरा/g, 'Diamond')
      .replace(/पन्ना/g, 'Emerald')
      .replace(/पुखराज/g, 'Yellow Sapphire')
      .replace(/सच्चा मोती|मोती/g, 'Natural Pearl')
      .replace(/माणिक्य|माणिक/g, 'Ruby')
      .replace(/मूँगा|मूंगा/g, 'Red Coral')
      .replace(/अथवा|या/g, 'or')
      .replace(/स्वर्ण \(Gold\)/g, 'Gold')
      .replace(/स्वर्ण/g, 'Gold')
      .replace(/पंचधातु/g, 'Panchadhatu')
      .replace(/चांदी/g, 'Silver')
      .replace(/तांबे|तांबा/g, 'Copper')
      .replace(/में/g, 'in')
      .replace(/रत्ती/g, 'Ratti')
      .replace(/से/g, 'to')
      .replace(/धारण करें।?/g, 'wear')
      .replace(/[०-९]/g, (d) => String('०१२३४५६७८९'.indexOf(d)));
  }
  if (lang === 'gu') {
    return str
      .replace(/नीलम/g, 'નીલમ')
      .replace(/जमुनिया/g, 'જમુનિયા')
      .replace(/ओपल/g, 'ઓપલ')
      .replace(/हीरा/g, 'હીરો')
      .replace(/पन्ना/g, 'પન્ના')
      .replace(/पुखराज/g, 'પોખરાજ')
      .replace(/सच्चा मोती|मोती/g, 'મોતી')
      .replace(/माणिक्य|माणिक/g, 'માણેક')
      .replace(/मूँगा|मूंगा/g, 'પરવાળું')
      .replace(/अथवा|या/g, 'અથવા')
      .replace(/स्वर्ण \(Gold\)/g, 'સુવર્ણ')
      .replace(/स्वर्ण/g, 'સુવર્ણ')
      .replace(/पंचधातु/g, 'પંચધાતુ')
      .replace(/चांदी/g, 'ચાંદી')
      .replace(/तांबे|तांबा/g, 'તાંબા')
      .replace(/में/g, 'માં')
      .replace(/रत्ती/g, 'રત્તી')
      .replace(/से/g, 'થી')
      .replace(/धारण करें।?/g, 'ધારણ કરો.');
  }
  return str;
}

function localizeGemstonePoint(
  primaryGem: any,
  secondaryGem: any,
  triveni: any,
  lang: string
): { point1: string; gemReason: string } {
  const currentLang = (lang || 'hi').slice(0, 2).toLowerCase();
  const hasTwo = secondaryGem && secondaryGem.gem !== primaryGem.gem;

  if (currentLang === 'en') {
    const gem1 = translateGemString(primaryGem.gem, 'en');
    const gem2 = hasTwo ? translateGemString(secondaryGem.gem, 'en') : '';
    const metal1 = translateGemString(primaryGem.metal, 'en');
    const role1 = primaryGem.planetRole === 'लग्नेश' ? 'Lagna Lord' : primaryGem.planetRole === 'भाग्येश' ? 'Fortune Lord' : 'Yogakaraka';
    const role2 = hasTwo ? (secondaryGem.planetRole === 'लग्नेश' ? 'Lagna Lord' : secondaryGem.planetRole === 'भाग्येश' ? 'Fortune Lord' : 'Yogakaraka') : '';
    const pl1 = trPlanet(primaryGem.planet, 'en');
    const pl2 = hasTwo ? trPlanet(secondaryGem.planet, 'en') : '';
    const day = trWeekday(primaryGem.day, 'en');

    const point1 = hasTwo
      ? `Wear ${gem1} + ${gem2} (${primaryGem.weightRatti}, in ${metal1}).`
      : `Wear ${gem1} (${primaryGem.weightRatti}, in ${metal1}).`;

    let gemReason = hasTwo
      ? `[Triveni Gemology: Horoscope + Numerology (Life Path ${triveni.mulank}, Destiny ${triveni.bhagyank}) + Gotra (${triveni.gotra.nameEn || triveni.gotra.name})] In your chart, ${role1} ${pl1} and ${role2} ${pl2} are most auspicious Yogakaraka planets. Wearing in gotra-aligned metal (${metal1}) on ${day} brings excellent strength and prosperity. Beej Mantra: ${primaryGem.beejMantra}.`
      : `[Triveni Gemology: Horoscope + Numerology (Life Path ${triveni.mulank}, Destiny ${triveni.bhagyank}) + Gotra (${triveni.gotra.nameEn || triveni.gotra.name})] To awaken the benefic rays of ${role1} ${pl1}, this gemstone is fully aligned with Vedic Shastras. Wear on ${day}. Beej Mantra: ${primaryGem.beejMantra}.`;

    if (triveni.forbiddenGems && triveni.forbiddenGems.length > 0) {
      const forbiddenNames = triveni.forbiddenGems.map((f: any) => translateGemString(f.gem, 'en')).join(', ');
      gemReason += ` (Caution: Never wear ${forbiddenNames} due to malefic/trik house afflictions).`;
    }
    return { point1, gemReason };
  }

  if (currentLang === 'gu') {
    const gem1 = translateGemString(primaryGem.gem, 'gu');
    const gem2 = hasTwo ? translateGemString(secondaryGem.gem, 'gu') : '';
    const metal1 = translateGemString(primaryGem.metal, 'gu');
    const role1 = primaryGem.planetRole === 'लग्नेश' ? 'લગ્નેશ' : primaryGem.planetRole === 'भाग्येश' ? 'ભાગ્યેશ' : 'યોગકારક';
    const role2 = hasTwo ? (secondaryGem.planetRole === 'लग्नेश' ? 'લગ્નેશ' : secondaryGem.planetRole === 'भाग्येश' ? 'ભાગ્યેશ' : 'યોગકારક') : '';
    const pl1 = trPlanet(primaryGem.planet, 'gu');
    const pl2 = hasTwo ? trPlanet(secondaryGem.planet, 'gu') : '';
    const day = trWeekday(primaryGem.day, 'gu');

    const point1 = hasTwo
      ? `${gem1} + ${gem2} (${primaryGem.weightRatti}, ${metal1}) ધારણ કરો.`
      : `${gem1} ${primaryGem.weightRatti} (${metal1}) ધારણ કરો.`;

    let gemReason = hasTwo
      ? `[ત્રિવેણી રત્ન શોધન: કુંડળી + અંક જ્યોતિષ (મૂળાંક ${triveni.mulank}, ભાગ્યાંક ${triveni.bhagyank}) + ગોત્ર (${triveni.gotra.name})] તમારી કુંડળીમાં ${role1} ${pl1} અને ${role2} ${pl2} સર્વાધિક યોગકારક છે. ગોત્રાનુકૂળ ધાતુ (${metal1})માં ${day}ના રોજ ધારણ કરવું શ્રેષ્ઠ ફળપ્રદ છે. બીજ મંત્ર: ${primaryGem.beejMantra}.`
      : `[ત્રિવેણી રત્ન શોધન: કુંડળી + અંક જ્યોતિષ (મૂળાંક ${triveni.mulank}, ભાગ્યાંક ${triveni.bhagyank}) + ગોત્ર (${triveni.gotra.name})] ${role1} ${pl1}ના રશ્મિ-બળને જાગ્રત કરવા માટે આ રત્ન પૂર્ણપણે શાસ્ત્રીય અને શુભપ્રદ છે. ધારણ વાર: ${day}, બીજ મંત્ર: ${primaryGem.beejMantra}.`;

    if (triveni.forbiddenGems && triveni.forbiddenGems.length > 0) {
      const forbiddenNames = triveni.forbiddenGems.map((f: any) => translateGemString(f.gem, 'gu')).join(', ');
      gemReason += ` (સાવચેતી: મારક/ત્રિક ભાવ પ્રભાવના કારણે ${forbiddenNames} કદાપિ ધારણ ન કરો).`;
    }
    return { point1, gemReason };
  }

  // Hindi default
  let point1 = '';
  let gemReason = '';
  if (hasTwo) {
    point1 = `${primaryGem.gem} + ${secondaryGem.gem} (${primaryGem.weightRatti}, ${primaryGem.metal}) धारण करें।`;
    gemReason = `[त्रिवेणी रत्न शोधन: कुण्डली + अंक ज्योतिष (मूलांक ${triveni.mulank}, भाग्यांक ${triveni.bhagyank}) + गोत्र (${triveni.gotra.name})] आपकी कुण्डली में ${primaryGem.planetRole} ${primaryGem.planet} एवं ${secondaryGem.planetRole} ${secondaryGem.planet} सर्वाधिक योगकारक हैं। गोत्र अनुकूल धातु (${primaryGem.metal}) में ${primaryGem.finger} में ${primaryGem.day} को ${primaryGem.choghadiya} में धारण करना श्रेष्ठ फलप्रद है। बीज मंत्र: ${primaryGem.beejMantra}।`;
  } else {
    point1 = `${primaryGem.gem} ${primaryGem.weightRatti} (${primaryGem.metal}, ${primaryGem.finger} में) धारण करें।`;
    gemReason = `[त्रिवेणी रत्न शोधन: कुण्डली + अंक ज्योतिष (मूलांक ${triveni.mulank}, भाग्यांक ${triveni.bhagyank}) + गोत्र (${triveni.gotra.name})] ${primaryGem.planetRole} ${primaryGem.planet} के रश्मि-बल को जाग्रत करने हेतु यह रत्न पूर्णतः शास्त्रीय, गोत्रानुकूल एवं शुभप्रद है। धारण वार: ${primaryGem.day} (${primaryGem.choghadiya}), बीज मंत्र: ${primaryGem.beejMantra}।`;
  }
  if (triveni.forbiddenGems && triveni.forbiddenGems.length > 0) {
    const forbiddenNames = triveni.forbiddenGems.map((f: any) => f.gem).join(', ');
    gemReason += ` (सावधानी: मारक/त्रिक भाव प्रभाव के कारण ${forbiddenNames} कदापि धारण न करें)।`;
  }
  return { point1, gemReason };
}

function getPlanetParchiDaan(planet: string, lang: string): string {
  const currentLang = (lang || 'hi').slice(0, 2).toLowerCase();
  if (currentLang === 'en') {
    const enMap: Record<string, string> = {
      गुरु: 'Yellow cloth, chana dal, jaggery, turmeric, Dakshina (Thursday - 1 time)',
      सूर्य: 'Red cloth, wheat, jaggery, copper, red sandalwood, Dakshina (Sunday - 1 time)',
      चंद्र: 'White cloth, Basmati rice, sugar candy (mishri), milk, camphor, Dakshina (Monday - 1 time)',
      मंगल: 'Red cloth, red lentils (masoor dal), jaggery, copper, vermillion, Dakshina (Tuesday - 1 time)',
      बुध: 'Green cloth, whole green moong, bronze, green cardamom, Dakshina (Wednesday - 1 time)',
      शुक्र: 'White silk cloth, rice, pure desi ghee, mishri, curd, Dakshina (Friday - 1 time)',
      शनि: 'Black cloth, black urad dal, black sesame seeds, mustard oil, iron, Dakshina (Saturday - 1 time)',
      राहु: 'Blue cloth, seven grains (saptdhanya), brown coconut, black sesame seeds, Dakshina (Saturday - 1 time)',
      केतु: 'Two-toned blanket, sesame laddu, bananas, temple flag, Dakshina (Tuesday - 1 time)',
    };
    return enMap[planet] || enMap['शनि'];
  }
  if (currentLang === 'gu') {
    const guMap: Record<string, string> = {
      गुरु: 'પીળું વસ્ત્ર, ચણાની દાળ, ગોળ, હળદર, દક્ષિણા (ગુરુવાર - ૧ વાર)',
      सूर्य: 'લાલ વસ્ત્ર, ઘઉં, ગોળ, તાંબુ, લાલ ચંદન, દક્ષિણા (રવિવાર - ૧ વાર)',
      चंद्र: 'સફેદ વસ્ત્ર, બાસમતી ચોખા, સાકર, દૂધ, કપૂર, દક્ષિણા (સોમવાર - ૧ વાર)',
      मंगल: 'લાલ વસ્ત્ર, મસૂરની દાળ, ગોળ, તાંબુ, સિંદૂર, દક્ષિણા (મંગળવાર - ૧ વાર)',
      बुध: 'લીલું વસ્ત્ર, આખા લીલા મગ, કાંસુ, લીલી એલચી, દક્ષિણા (બુધવાર - ૧ વાર)',
      शुक्र: 'શ્વેત રેશમી વસ્ત્ર, ચોખા, દેશી ઘી, સાકર, દહીં, દક્ષિણા (શુક્રવાર - ૧ વાર)',
      शनि: 'કાળું વસ્ત્ર, અડદ, કાળા તલ, સરસવનું તેલ, લોખંડ, દક્ષિણા (શનિવાર - ૧ વાર)',
      राहु: 'વાદળી વસ્ત્ર, સપ્તધાન્ય, શ્રીફળ (નાળિયેર), કાળા તલ, દક્ષિણા (શનિવાર - ૧ વાર)',
      केतु: 'બે રંગી ધાબળો, તલના લાડુ, કેળાં, ધજા, દક્ષિણા (મંગળવાર - ૧ વાર)',
    };
    return guMap[planet] || guMap['शनि'];
  }
  return PLANET_PARCHI_DAAN[planet] || PLANET_PARCHI_DAAN['शनि'];
}

/**
 * Generates an authentic 6-point Vedic Astrologer Prescription Slip ("परामर्श पर्ची / उपाय पत्रक")
 * modeled directly after traditional Kashi/Ujjain/Burhanpur Jyotishacharya letterheads,
 * enriched with complete astrological reasoning, benefits, and vidhi for the yajman.
 */
export function generateTraditionalUpayParchi(
  k?: KundaliData | null,
  panchang?: VedicPanchangData | null,
  lang: string = 'hi'
): TraditionalUpayParchiData {
  const currentLang = (lang || 'hi').slice(0, 2).toLowerCase();
  const now = panchang?.date || new Date();
  const dateStr = now.toLocaleDateString(currentLang === 'en' ? 'en-US' : currentLang === 'gu' ? 'gu-IN' : 'hi-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  if (!k) {
    const defaultPoints = currentLang === 'en' ? [
      'Wear Yellow Sapphire or Ruby (according to horoscope consultation).',
      'Observe Sattvic Fasting on Thursday or your Ishta day.',
      'Recite Sri Vishnu Sahasranama daily.',
      'Yellow cloth, chana dal, jaggery, turmeric, Dakshina (Thursday - 1 time)',
      'Feed sacred cow and dog with roti.',
      'Perform Navagraha Shanti and Rudrabhishek.',
    ] : currentLang === 'gu' ? [
      'પોખરાજ અથવા માણેક રત્ન (કુંડળી પરામર્શ મુજબ) ધારણ કરો.',
      'ગુરુવાર અથવા ઇષ્ટ વારનું સાત્વિક ઉપવાસ કરો.',
      'શ્રીવિષ્ણુસહસ્રનામનો પાઠ કરો.',
      'પીળું વસ્ત્ર, ચણાની દાળ, ગોળ, હળદર, દક્ષિણા (ગુરુવાર - ૧ વાર)',
      'ગાય અને કૂતરાને રોટલી ખવડાવો.',
      'નવગ્રહ શાંતિ અને રુદ્રાભિષેક કરાવો.',
    ] : [
      'पुखराज अथवा माणिक रत्न (कुण्डली परामर्श अनुसार) धारण करें।',
      'गुरुवार अथवा इष्ट वार का सात्विक उपवास करें।',
      'श्रीविष्णुसहस्रनाम का पाठ करें।',
      'पीला कपड़ा, चने की दाल, गुड़, हल्दी, दक्षिणा (गुरुवार - 1 बार)',
      'गाय और कुत्ते को रोटी खिलावें।',
      'नवग्रह शान्ति एवं रुद्राभिषेक करावें।',
    ];
    const circled = ['①', '②', '③', '④', '⑤', '⑥'];
    const formattedTextBlock = [
      `॥ श्री ॥`,
      currentLang === 'en' ? 'Shri Yajman' : currentLang === 'gu' ? 'શ્રી યજમાન જી' : 'श्री यजमान जी',
      ...defaultPoints.map((pt, i) => `${circled[i]} ${pt}`),
      `                                          ॥ शुभम् ॥`,
    ].join('\n');

    const detailedItems = defaultPoints.map((pt, idx) => getRemedyDeepDetail(pt, idx, null, currentLang));
    const grahanItem = detailedItems.find((it) => it.shantiDeepDive);
    const formattedDetailedGuide = buildDetailedParchiGuideText(
      currentLang === 'en' ? 'Shri Yajman' : currentLang === 'gu' ? 'શ્રી યજમાન જી' : 'श्री यजमान जी',
      '108',
      dateStr,
      currentLang === 'en' ? 'Prashna Ascendant' : currentLang === 'gu' ? 'તાત્કાલિક પ્રશ્ન લગ્ન' : 'तात्कालिक प्रश्न लग्न',
      detailedItems,
      grahanItem?.shantiDeepDive,
      currentLang
    );

    return {
      salutation: currentLang === 'en' ? 'Shri Yajman' : currentLang === 'gu' ? 'શ્રી યજમાન જી' : 'श्री यजमान जी',
      serialNo: '108',
      dateStr,
      lagnaInfo: currentLang === 'en' ? 'Prashna Ascendant' : currentLang === 'gu' ? 'તાત્કાલિક પ્રશ્ન લગ્ન' : 'तात्कालिक प्रश्न लग्न',
      detectedDoshaYoga: currentLang === 'en' ? 'Navagraha & Mahadasha Shanti' : currentLang === 'gu' ? 'નવગ્રહ અને મહાદશા શાંતિ' : 'नवग्रह एवं महादशा शान्ति',
      points: defaultPoints,
      formattedTextBlock,
      detailedItems,
      grahanSpecialAnalysis: grahanItem?.shantiDeepDive,
      formattedDetailedGuide,
    };
  }

  const rawName = (k.name || (currentLang === 'en' ? 'Yajman' : currentLang === 'gu' ? 'યજમાન' : 'यजमान')).trim();
  const hasHonorific = /^(श्री|श्रीमती|सुश्री|कु\.|डॉ\.|पं\.|Shri|Smt\.|Mr\.|Mrs\.|Dr\.|શ્રી)/i.test(rawName);
  const salutation = hasHonorific ? rawName : currentLang === 'en' ? `Shri ${rawName}` : currentLang === 'gu' ? `શ્રી ${rawName} જી` : `श्री ${rawName} जी`;

  // =========================================================================
  // 100% DYNAMIC GRAHA-CALCULATION ENGINE (ग्रह स्पष्ट, बलाबल, भाव व योग विश्लेषण)
  // =========================================================================
  const planets = k.planets || [];
  const pMap: Record<string, PlanetPosition> = {};
  planets.forEach((p) => {
    for (const g of ['सूर्य', 'चंद्र', 'मंगल', 'बुध', 'गुरु', 'शुक्र', 'शनि', 'राहु', 'केतु']) {
      if (p.planet.includes(g)) {
        pMap[g] = p;
        break;
      }
    }
  });

  const getHouse = (pName: string) => pMap[pName]?.house ?? -1;
  const getDegInRashi = (pName: string) => pMap[pName]?.degreeInRashi ?? 15;
  const sunP = pMap['सूर्य'];
  const moonP = pMap['चंद्र'];
  const marsP = pMap['मंगल'];
  const mercP = pMap['बुध'];
  const jupP = pMap['गुरु'];
  const venP = pMap['शुक्र'];
  const satP = pMap['शनि'];
  const rahuP = pMap['राहु'];
  const ketuP = pMap['केतु'];

  // House Signs and Lords
  const lagnaRashiNum = k.lagnaRashiNumber || 1;
  const lagnaSignIdx = (lagnaRashiNum - 1) % 12;
  const lagnaSign = k.lagnaRashi || RASHIS[lagnaSignIdx];
  const lagnaLord = SIGN_LORDS[lagnaSign] || 'सूर्य';

  const getHouseLord = (h: number) => {
    const signIdx = ((lagnaSignIdx + h - 1) % 12);
    const signName = RASHIS[signIdx];
    return SIGN_LORDS[signName] || 'सूर्य';
  };

  const h5Lord = getHouseLord(5); // पंचमेश (इष्ट देव व बुद्धि)
  const h9Lord = getHouseLord(9); // भाग्येश (धर्म व भाग्य)
  const h10Lord = getHouseLord(10); // दशमेश (कर्म व यश)
  const h2Lord = getHouseLord(2); // द्वितीयेश (मारक)
  const h7Lord = getHouseLord(7); // सप्तमेश (मारक)
  const h6Lord = getHouseLord(6); // षष्ठेश (रोग, रिपु, ऋण)
  const h8Lord = getHouseLord(8); // अष्टमेश (आयु व आकस्मिक संकट)
  const h12Lord = getHouseLord(12); // द्वादशेश (व्यय व हानि)

  // Yogakaraka Planet
  let yogakaraka: string | undefined = undefined;
  if (lagnaSign === 'वृषभ') yogakaraka = 'शनि';
  else if (lagnaSign === 'कर्क') yogakaraka = 'मंगल';
  else if (lagnaSign === 'सिंह') yogakaraka = 'मंगल';
  else if (lagnaSign === 'तुला') yogakaraka = 'शनि';
  else if (lagnaSign === 'मकर') yogakaraka = 'शुक्र';
  else if (lagnaSign === 'कुंभ') yogakaraka = 'शुक्र';

  // Dignity helpers
  const EXALT_MAP: Record<string, string> = {
    सूर्य: 'मेष', चंद्र: 'वृषभ', मंगल: 'मकर', बुध: 'कन्या',
    गुरु: 'कर्क', शुक्र: 'मीन', शनि: 'तुला', राहु: 'वृषभ', केतु: 'वृश्चिक',
  };
  const DEBIL_MAP: Record<string, string> = {
    सूर्य: 'तुला', चंद्र: 'वृश्चिक', मंगल: 'कर्क', बुध: 'मीन',
    गुरु: 'मकर', शुक्र: 'कन्या', शनि: 'मेष', राहु: 'वृश्चिक', केतु: 'वृषभ',
  };
  const OWN_MAP: Record<string, string[]> = {
    सूर्य: ['सिंह'], चंद्र: ['कर्क'], मंगल: ['मेष', 'वृश्चिक'],
    बुध: ['मिथुन', 'कन्या'], गुरु: ['धनु', 'मीन'],
    शुक्र: ['वृषभ', 'तुला'], शनि: ['मकर', 'कुंभ'],
  };

  const isDebil = (pName: string) => pMap[pName]?.rashi === DEBIL_MAP[pName];
  const isExalt = (pName: string) => pMap[pName]?.rashi === EXALT_MAP[pName];
  const isOwn = (pName: string) => OWN_MAP[pName]?.includes(pMap[pName]?.rashi || '');

  // Combustion (अस्त)
  const isCombust = (pName: string): boolean => {
    if (!sunP || !pMap[pName] || pName === 'सूर्य' || pName === 'राहु' || pName === 'केतु') return false;
    let d = Math.abs(pMap[pName].degree - sunP.degree);
    if (d > 180) d = 360 - d;
    const isRetro = pMap[pName].isRetrograde;
    if (pName === 'चंद्र') return d <= 12;
    if (pName === 'मंगल') return d <= 17;
    if (pName === 'बुध') return d <= (isRetro ? 12 : 14);
    if (pName === 'गुरु') return d <= 11;
    if (pName === 'शुक्र') return d <= (isRetro ? 8 : 10);
    if (pName === 'शनि') return d <= 15;
    return false;
  };

  const combustList: string[] = [];
  const debilList: string[] = [];
  const exaltList: string[] = [];

  ['सूर्य', 'चंद्र', 'मंगल', 'बुध', 'गुरु', 'शुक्र', 'शनि', 'राहु', 'केतु'].forEach((g) => {
    if (isCombust(g)) combustList.push(`${g} (अस्त)`);
    if (isDebil(g)) debilList.push(`${g} (${pMap[g]?.rashi} में नीच)`);
    if (isExalt(g)) exaltList.push(`${g} (${pMap[g]?.rashi} में उच्च)`);
  });

  // =========================================================================
  // POINT 1: शास्त्रीय रत्न परामर्श (Calculated Benefic Strengthening)
  // =========================================================================
  interface GemInfo {
    gem: string;
    weight: string;
    metal: string;
    finger: string;
    day: string;
  }
  const GEM_CATALOG: Record<string, GemInfo> = {
    सूर्य: { gem: 'माणिक्य (Ruby)', weight: '५.२५ से ६.२५ रत्ती', metal: 'तांबे या सोने में', finger: 'अनामिका', day: 'रविवार' },
    चंद्र: { gem: 'सच्चा मोती (Natural Pearl)', weight: '६.२५ से ८.२५ रत्ती', metal: 'शुद्ध चांदी में', finger: 'कनिष्ठिका', day: 'सोमवार' },
    मंगल: { gem: 'मूँगा (Italian Red Coral)', weight: '६.२५ से ८.२५ रत्ती', metal: 'तांबे या सोने में', finger: 'अनामिका', day: 'मंगलवार' },
    बुध: { gem: 'पन्ना (Zambian Emerald)', weight: '५.२५ से ७.२५ रत्ती', metal: 'चांदी या पंचधातु में', finger: 'कनिष्ठिका', day: 'बुधवार' },
    गुरु: { gem: 'पीला पुखराज (Yellow Sapphire)', weight: '४.२५ से ६.२५ रत्ती', metal: 'सोने या पीतल में', finger: 'तर्जनी', day: 'गुरुवार' },
    शुक्र: { gem: 'ओपल अथवा हीरा (Opal/Diamond)', weight: '६.२५ से ८.२५ रत्ती', metal: 'चांदी में', finger: 'अनामिका अथवा तर्जनी', day: 'शुक्रवार' },
    शनि: { gem: 'नीलम अथवा जमुनिया (Blue Sapphire/Amethyst)', weight: '५.२५ से ७.२५ रत्ती', metal: 'पंचधातु या चांदी में', finger: 'मध्यमा', day: 'शनिवार' },
  };

  // Score candidate benefic planets (Lagna lord, 9th lord, 5th lord, Yogakaraka)
  const scoreBenefic = (planet: string, isLagna = false, isBhagya = false, isYog = false) => {
    const p = pMap[planet];
    if (!p) return -100;
    // Strict Shastra rule: never wear debilitated planet directly without caution
    if (isDebil(planet)) return -40;
    // Pure Maraka / Trik lord without trikona lordship
    if (!isLagna && !isBhagya && !isYog && [h6Lord, h8Lord, h12Lord, h2Lord, h7Lord].includes(planet)) return -30;

    let score = 20;
    if (isYog) score += 25;
    if (isLagna) score += 22;
    if (isBhagya) score += 18;
    if (isCombust(planet)) score += 15; // Combust benefic urgently needs light rekindling
    if ([1, 4, 5, 7, 9, 10].includes(p.house)) score += 12; // Kendra / Trikona
    if (p.degreeInRashi < 3.5 || p.degreeInRashi > 26.5) score += 10; // Bal / Mrita avastha needs strength
    if ([6, 8, 12].includes(p.house)) score -= isLagna ? 6 : 16;
    if (isExalt(planet)) score += 8;
    if (isOwn(planet)) score += 6;
    return score;
  };

  const candidates = [
    { planet: lagnaLord, role: 'लग्नेश', isLagna: true, isBhagya: false, isYog: yogakaraka === lagnaLord },
    { planet: h9Lord, role: 'भाग्येश', isLagna: false, isBhagya: true, isYog: yogakaraka === h9Lord },
    { planet: h5Lord, role: 'पंचमेश', isLagna: false, isBhagya: false, isYog: yogakaraka === h5Lord },
  ];
  if (yogakaraka && !candidates.some((c) => c.planet === yogakaraka)) {
    candidates.push({ planet: yogakaraka, role: 'योगकारक', isLagna: false, isBhagya: false, isYog: true });
  }

  // Deduplicate and score
  const uniqueCandidates = Array.from(new Set(candidates.map((c) => c.planet))).map((pl) => {
    const meta = candidates.find((c) => c.planet === pl)!;
    return {
      planet: pl,
      role: meta.role,
      score: scoreBenefic(pl, meta.isLagna, meta.isBhagya, meta.isYog),
      info: GEM_CATALOG[pl],
    };
  }).filter((c) => c.score > 0 && !!c.info);

  uniqueCandidates.sort((a, b) => b.score - a.score);

  // =========================================================================
  // POINT 1: त्रिवेणी रत्न शोधन (कुण्डली + अंक ज्योतिष + गोत्र का त्रि-स्तरीय संगम)
  // =========================================================================
  const triveni = calculateTriveniGemology(k, k.gotra);
  const primaryGem = triveni.primaryLifeStone;
  const secondaryGem = triveni.secondaryBhagyaStone;

  const { point1, gemReason } = localizeGemstonePoint(primaryGem, secondaryGem, triveni, currentLang);

  // =========================================================================
  // POINT 2 & 4: बाधक / पीड़ित ग्रह निर्धारण (Fasting & Daan Calculation)
  // =========================================================================
  interface AfflictionScore {
    planet: string;
    score: number;
    reason: string;
  }
  const afflictionScores: AfflictionScore[] = [];

  ['सूर्य', 'चंद्र', 'मंगल', 'बुध', 'गुरु', 'शुक्र', 'शनि', 'राहु', 'केतु'].forEach((g) => {
    const p = pMap[g];
    if (!p) return;
    let sc = 0;
    const reasons: string[] = [];

    if (isDebil(g)) {
      sc += 14;
      reasons.push(`${p.rashi} राशि में नीच`);
    }
    if ([6, 8, 12].includes(p.house)) {
      sc += 9;
      reasons.push(`${p.house}वें दुःस्थान में`);
    }
    if (isCombust(g)) {
      sc += 8;
      reasons.push('सूर्य के निकट अस्त');
    }
    // Conjunction with Rahu / Ketu
    if (g !== 'राहु' && g !== 'केतु') {
      const rahuH = getHouse('राहु');
      const ketuH = getHouse('केतु');
      if (p.house === rahuH) {
        sc += 11;
        reasons.push('राहु के साथ युति');
      } else if (p.house === ketuH) {
        sc += 10;
        reasons.push('केतु के साथ युति');
      }
    }
    // Saturn-Moon Vish Yog
    if (g === 'चंद्र' && getHouse('शनि') === p.house) {
      sc += 13;
      reasons.push('शनि-चंद्र विष योग');
    }
    // Manglik / Kuja
    if (g === 'मंगल' && [1, 4, 7, 8, 12].includes(p.house)) {
      sc += 9;
      reasons.push(`${p.house}वें भाव में मांगलिक स्थिति`);
    }
    // Current Mahadasha / Antardasha impact
    if (k.mahadasha === g) {
      sc += 6;
      reasons.push('वर्तमान महादशा स्वामी');
    } else if (k.antardasha === g) {
      sc += 4;
      reasons.push('वर्तमान अंतर्दशा स्वामी');
    }

    if (sc > 0) {
      afflictionScores.push({ planet: g, score: sc, reason: reasons.join(', ') });
    }
  });

  afflictionScores.sort((a, b) => b.score - a.score);

  // Angular distance and conjunction calculation helpers
  const getAngularDistance = (deg1: number, deg2: number): number => {
    const diff = Math.abs(deg1 - deg2) % 360;
    return diff > 180 ? 360 - diff : diff;
  };

  const areConjunct = (
    p1?: PlanetPosition,
    p2?: PlanetPosition,
    maxOrb = 15.0
  ): { conjunct: boolean; diff: number; sameRashi: boolean; sameHouse: boolean } => {
    if (!p1 || !p2) return { conjunct: false, diff: 999, sameRashi: false, sameHouse: false };
    const sameRashi = Boolean(p1.rashi && p2.rashi && p1.rashi === p2.rashi);
    const sameHouse = Boolean(p1.house > 0 && p2.house > 0 && p1.house === p2.house);
    const diff = getAngularDistance(p1.degree, p2.degree);
    const conjunct = sameRashi || sameHouse || diff <= maxOrb;
    return { conjunct, diff, sameRashi, sameHouse };
  };

  const sunH = getHouse('सूर्य');
  const moonH = getHouse('चंद्र');
  const marsH = getHouse('मंगल');
  const jupH = getHouse('गुरु');
  const satH = getHouse('शनि');
  const rahuH = getHouse('राहु');
  const ketuH = getHouse('केतु');

  // Classical Parashari Grahan Yoga Checks (Same Sign, Same House, or Angular Distance <= 15°)
  const suryaRahuCheck = areConjunct(sunP, rahuP, 15.0);
  const suryaKetuCheck = areConjunct(sunP, ketuP, 15.0);
  const chandraRahuCheck = areConjunct(moonP, rahuP, 15.0);
  const chandraKetuCheck = areConjunct(moonP, ketuP, 15.0);

  const isSuryaRahuGrahan = suryaRahuCheck.conjunct;
  const isSuryaKetuGrahan = suryaKetuCheck.conjunct;
  const isChandraRahuGrahan = chandraRahuCheck.conjunct;
  const isChandraKetuGrahan = chandraKetuCheck.conjunct;

  const hasSuryaGrahan = isSuryaRahuGrahan || isSuryaKetuGrahan;
  const hasChandraGrahan = isChandraRahuGrahan || isChandraKetuGrahan;

  // Check Kaal Sarp Yoga: All 7 non-node planets strictly between Rahu & Ketu
  let isKaalSarp = false;
  if (rahuP && ketuP) {
    const nonNodes = planets.filter((p) => !p.planet.includes('राहु') && !p.planet.includes('केतु'));
    const rDeg = rahuP.degree;
    const kDeg = ketuP.degree;
    const arc = ((kDeg - rDeg) % 360 + 360) % 360;
    const onArc = nonNodes.map((p) => (((p.degree - rDeg) % 360 + 360) % 360) <= arc);
    if (nonNodes.length >= 7 && (onArc.every(Boolean) || onArc.every((x) => !x))) {
      isKaalSarp = true;
    }
  }

  // Top afflicted planet for Fasting (Point 2)
  const topAfflictedForFast = afflictionScores.find((a) => a.planet !== 'राहु' && a.planet !== 'केतु') || {
    planet: k.mahadasha || 'गुरु',
    score: 10,
    reason: 'महादशा स्वामी',
  };

  const FAST_WEEKDAY_MAP: Record<string, { day: string; deity: string }> = {
    सूर्य: { day: 'रविवार', deity: 'भगवान सूर्य नारायण' },
    चंद्र: { day: 'सोमवार', deity: 'भगवान शिव शंकर' },
    मंगल: { day: 'मंगलवार', deity: 'श्री हनुमान जी व मंगल देव' },
    बुध: { day: 'बुधवार', deity: 'भगवान श्री गणेश' },
    गुरु: { day: 'गुरुवार', deity: 'देवगुरु बृहस्पति व श्री हरि विष्णु' },
    शुक्र: { day: 'शुक्रवार', deity: 'माँ महालक्ष्मी' },
    शनि: { day: 'शनिवार', deity: 'भगवान शनिदेव व हनुमान जी' },
  };

  const fastInfo = FAST_WEEKDAY_MAP[topAfflictedForFast.planet] || FAST_WEEKDAY_MAP['गुरु'];
  const dayName = trWeekday(fastInfo.day, currentLang);
  const planetName = trPlanet(topAfflictedForFast.planet, currentLang);

  let point2 = '';
  let upvasReason = '';

  if (currentLang === 'en') {
    if (hasSuryaGrahan) {
      point2 = 'Observe Sattvic Fasting on Sunday (for Surya Grahan Shanti).';
      upvasReason = 'Due to shadow planet Rahu/Ketu eclipse on Sun in your horoscope, fasting on Sunday is excellent for soul power, father\'s health and removing royal/career obstacles.';
    } else if (hasChandraGrahan) {
      point2 = 'Observe Sattvic Fasting on Monday (for Chandra Kapalika Grahan Shanti).';
      upvasReason = 'Due to Rahu/Ketu eclipse on Moon (Kapalika Dosha) in your horoscope, fasting on Monday is like nectar for mental serenity, sound sleep and removing fear.';
    } else {
      point2 = `Observe Sattvic Fasting on ${dayName} (for ${planetName} Shanti).`;
      upvasReason = `Fasting on ${dayName} is most beneficial to remove hardships and obstacles caused by ${planetName} in your horoscope.`;
    }
  } else if (currentLang === 'gu') {
    if (hasSuryaGrahan) {
      point2 = 'રવિવારનું સાત્વિક ઉપવાસ કરો (સૂર્ય ગ્રહણ શાંતિ માટે).';
      upvasReason = 'તમારી કુંડળીમાં સૂર્ય પર રાહુ/કેતુ ગ્રહણ હોવાથી આત્મબળ, પિતાના સ્વાસ્થ્ય અને રાજકીય બાધા નિવારણ માટે રવિવારનું ઉપવાસ શ્રેષ્ઠ છે.';
    } else if (hasChandraGrahan) {
      point2 = 'સોમવારનું સાત્વિક ઉપવાસ કરો (ચંદ્ર કપાલીકા ગ્રહણ શાંતિ માટે).';
      upvasReason = 'તમારી કુંડળીમાં ચંદ્ર પર રાહુ/કેતુ ગ્રહણ (કપાલીકા દોષ) હોવાથી માનસિક શાંતિ, અનિદ્રા અને ભય નિવારણ માટે સોમવારનું ઉપવાસ અમૃતતુલ્ય છે.';
    } else {
      point2 = `${dayName}નું સાત્વિક ઉપવાસ કરો (${planetName} શાંતિ માટે).`;
      upvasReason = `તમારી જન્મકુંડળીમાં ${planetName}ના કારણે આવતી અડચણો અને કષ્ટોના નિવારણ માટે ${dayName}નું ઉપવાસ શ્રેષ્ઠ છે.`;
    }
  } else {
    // Hindi
    if (hasSuryaGrahan) {
      point2 = 'रविवार का सात्विक उपवास करें (सूर्य ग्रहण शान्ति हेतु)।';
      upvasReason = 'आपकी पत्रिका में सूर्य पर छाया ग्रह राहु/केतु का ग्रहण होने से आत्मबल, पिता के स्वास्थ्य एवं राजकीय बाधा निवारण हेतु रविवार का उपवास श्रेष्ठ है।';
    } else if (hasChandraGrahan) {
      point2 = 'सोमवार का सात्विक उपवास करें (चंद्रमा कपालिका ग्रहण शान्ति हेतु)।';
      upvasReason = 'आपकी पत्रिका में चंद्रमा पर छाया ग्रह राहु/केतु का ग्रहण (कपालिका दोष) होने से मानसिक शांति, अनिद्रा व भय निवारण हेतु सोमवार का उपवास अमृततुल्य है।';
    } else {
      point2 = `${fastInfo.day} का सात्विक उपवास करें (${topAfflictedForFast.planet} शान्ति हेतु)।`;
      upvasReason = `आपकी जन्मपत्रिका में ${topAfflictedForFast.planet} (${topAfflictedForFast.reason}) के कारण आ रही अड़चनों एवं कष्टों के निवारण हेतु ${fastInfo.day} का उपवास श्रेष्ठ है।`;
    }
  }

  // Top afflicted planet for Daan (Point 4)
  const topAfflictedForDaan = afflictionScores[0] || {
    planet: k.mahadasha || 'शनि',
    score: 10,
    reason: 'महादशा काल',
  };

  const daanPlanet = topAfflictedForDaan.planet;
  const daanPlanetTr = trPlanet(daanPlanet, currentLang);
  let point4 = getPlanetParchiDaan(daanPlanet, currentLang);
  let daanReason = '';

  if (currentLang === 'en') {
    daanReason = `According to Shastras, charity is offered for afflicted and obstructing planets. Donating for ${daanPlanetTr} neutralizes the adverse impact of its malefic rays.`;
    if (hasSuryaGrahan) {
      point4 = 'Fill mustard oil in a bronze bowl, see reflection and donate (Chhaya Daan), 7 grains, coconut, Dakshina (Sunday/Amavasya - 1 time)';
      daanReason = 'Chhaya Daan and Saptdhanya charity are scripturally ordained to remove solar eclipse afflictions caused by Rahu/Ketu.';
    } else if (hasChandraGrahan) {
      point4 = 'White cloth, raw milk, silver, rice, coconut, 7 grains, Dakshina (Monday/Purnima - 1 time)';
      daanReason = 'Donating white articles and milk is prescribed to pacify lunar Kapalika eclipse dosha.';
    }
  } else if (currentLang === 'gu') {
    daanReason = `શાસ્ત્રાનુસાર દાન અનિષ્ટ અને બાધક ગ્રહનું કરવામાં આવે છે. કુંડળીમાં ${daanPlanetTr}નું દાન કરવાથી તેના અશુભ પ્રભાવો નષ્ટ થાય છે.`;
    if (hasSuryaGrahan) {
      point4 = 'કાંસાના પાત્રમાં સરસવનું તેલ ભરી મુખ જોઈને છાયા દાન, સપ્તધાન્ય, શ્રીફળ, દક્ષિણા (રવિવાર/અમાસ - ૧ વાર)';
      daanReason = 'સૂર્ય પર રાહુ/કેતુ ગ્રહણથી ઉત્પન્ન અનિષ્ટ દૂર કરવા છાયા દાન અને સપ્તધાન્ય દાન શાસ્ત્રોક્ત મહાદાન છે.';
    } else if (hasChandraGrahan) {
      point4 = 'શ્વેત વસ્ત્ર, કાચું દૂધ, ચાંદી, ચોખા, શ્રીફળ, સપ્તધાન્ય, દક્ષિણા (સોમવાર/પૂનમ - ૧ વાર)';
      daanReason = 'ચંદ્ર પર રાહુ/કેતુ ગ્રહણ જનિત કપાલીકા દોષની શાંતિ માટે શ્વેત વસ્તુઓ અને છાયા દાનનું વિધાન છે.';
    }
  } else {
    // Hindi
    daanReason = `शास्त्रानुसार दान अनिष्ट एवं मारक-बाधक ग्रह का किया जाता है। कुंडली में ${daanPlanet} (${topAfflictedForDaan.reason}) का दान करने से उसकी अशुभ रश्मियों का दुष्प्रभाव नष्ट होता है।`;
    if (hasSuryaGrahan) {
      point4 = 'कांस्य पात्र में सरसों तेल भरकर मुख देखकर छाया दान, सप्तधान्य, नारियल, दक्षिणा (रविवार/अमावस्या - 1 बार)';
      daanReason = 'सूर्य पर छाया ग्रह राहु/केतु के ग्रहण जनित अनिष्ट को दूर करने हेतु छाया दान एवं सप्तधान्य दान शास्त्रोक्त महा-दान है।';
    } else if (hasChandraGrahan) {
      point4 = 'सफेद वस्त्र, कच्चा दूध, चांदी, चावल, नारियल, सप्तधान्य, दक्षिणा (सोमवार/पूर्णिमा - 1 बार)';
      daanReason = 'चंद्रमा पर राहु/केतु के ग्रहण जनित कपालिका दोष की शांति हेतु श्वेत वस्तुओं एवं छाया दान का विधान विहित है।';
    }
  }

  // =========================================================================
  // POINT 3: नित्य स्तोत्र / मंत्र पाठ (Ishta & Dasha Harmonization)
  // =========================================================================
  let point3 = '';
  let stotraReason = '';

  const maha = k.mahadasha || 'गुरु';

  if (currentLang === 'en') {
    if (hasSuryaGrahan) {
      point3 = 'Recite Sri Aditya Hridaya Stotram and Mahamrityunjaya Mantra daily.';
      stotraReason = 'Aditya Hridaya Stotram is unfailing to pacify Rahu/Ketu eclipse effects on Sun and awaken confidence and vitality.';
    } else if (hasChandraGrahan) {
      point3 = 'Recite Sri Shiva Rudrashtakam, Chandra Kavacham and Mahamrityunjaya Mantra daily.';
      stotraReason = 'Praising Lord Shiva is supreme for mental stability, sound sleep and peace during lunar eclipse.';
    } else if (maha === 'राहु') {
      point3 = 'Recite Sri Durga Saptashati (Argala, Keelaka, Kavacha) and Siddha Kunjika Stotram daily.';
      stotraReason = 'Devi Kavacham and Durga Saptashati are like nectar to dissolve illusions and mental agitation in Rahu Mahadasha.';
    } else if (maha === 'केतु') {
      point3 = 'Recite Sri Ganesha Sankata Nashana Stotram and Ganapati Atharvashirsha daily.';
      stotraReason = 'Worship of Lord Ganesha is paramount for removing obstacles and spiritual peace during Ketu Mahadasha.';
    } else if (maha === 'शनि' || getHouse('शनि') === getHouse('चंद्र')) {
      point3 = 'Recite Dasharatha Kruta Shani Stotram and Sri Hanuman Chalisa daily.';
      stotraReason = 'Dasharatha Kruta Shani Stotram is a sovereign remedy for karma purification and relief from Saturn hardships.';
    } else if (h5Lord === 'सूर्य' || maha === 'सूर्य') {
      point3 = 'Recite Sri Aditya Hridaya Stotram every morning.';
      stotraReason = 'Prescribed for enhancing solar strength, father\'s well-being and success in public life.';
    } else if (h5Lord === 'चंद्र' || maha === 'चंद्र') {
      point3 = 'Recite Sri Shiva Rudrashtakam or Daridrya Dahana Shiva Stotram daily.';
      stotraReason = 'Praise of Lord Shiva is ideal for Moon\'s grace, emotional peace and freedom from stress.';
    } else if (h5Lord === 'मंगल' || maha === 'मंगल' || k.isManglik) {
      point3 = 'Recite Rina Mochaka Mangala Stotram or Sri Sundarkand.';
      stotraReason = 'Sundarkand and Mangala Stotram are unfailing for neutralizing Manglik dosha and resolving debts.';
    } else if (h5Lord === 'शुक्र' || maha === 'शुक्र') {
      point3 = 'Recite Sri Suktam or Kanakadhara Stotram daily.';
      stotraReason = 'Sri Suktam brings Venus grace, marital happiness and enduring financial prosperity.';
    } else {
      point3 = 'Recite Sri Vishnu Sahasranama daily.';
      stotraReason = 'Vishnu Sahasranama is the supreme remedy to overcome all life obstacles by Jupiter\'s grace.';
    }
  } else if (currentLang === 'gu') {
    if (hasSuryaGrahan) {
      point3 = 'શ્રી આદિત્યહૃદય સ્તોત્ર અને મહામૃત્યુંજય મંત્રનો નિત્ય પાઠ કરો.';
      stotraReason = 'સૂર્ય પર રાહુ/કેતુના ગ્રહણ પ્રભાવને શાંત કરી આત્મવિશ્વાસ તથા આરોગ્ય જાગૃત કરવા આદિત્યહૃદય સ્તોત્ર અચૂક છે.';
    } else if (hasChandraGrahan) {
      point3 = 'શ્રી શિવ રુદ્રાષ્ટકમ્, ચંદ્ર કવચ અને મહામૃત્યુંજય મંત્રનો પાઠ કરો.';
      stotraReason = 'કપાલીકા ચંદ્ર ગ્રહણમાં મનની સ્થિરતા, કલેશ અને ભય નિવારણ માટે ભગવાન શિવની સ્તુતિ સર્વોત્તમ છે.';
    } else if (maha === 'राहु') {
      point3 = 'શ્રી દુર્ગા સપ્તશતી (અર્ગલા, કીલક, કવચ) તથા સિદ્ધ કુંજિકા સ્તોત્રનો પાઠ કરો.';
      stotraReason = 'રાહુ મહાદશામાં ભ્રમ અને માનસિક અશાંતિ શમન માટે દેવી કવચ અને દુર્ગા સપ્તશતી અમૃતતુલ્ય છે.';
    } else if (maha === 'केतु') {
      point3 = 'શ્રી ગણેશ સંકટનાશન સ્તોત્ર તથા ગણેશ અથર્વશીર્ષનો નિત્ય પાઠ કરો.';
      stotraReason = 'કેતુ મહાદશામાં વિઘ્નોના નિવારણ અને મોક્ષ-શાંતિ માટે ભગવાન ગણપતિની સાધના સર્વોપરી છે.';
    } else if (maha === 'शनि' || getHouse('शनि') === getHouse('चंद्र')) {
      point3 = 'દશરથ કૃત શનિ સ્તોત્ર અને શ્રી હનુમાન ચાલીસાનો નિત્ય પાઠ કરો.';
      stotraReason = 'શનિની દશા/પ્રભાવમાં કર્મ ફળ શુદ્ધિ અને કષ્ટ નિવારણ માટે દશરથ કૃત શનિ સ્તોત્ર રામબાણ છે.';
    } else if (h5Lord === 'सूर्य' || maha === 'सूर्य') {
      point3 = 'શ્રી આદિત્યહૃદય સ્તોત્રનો નિત્ય પ્રાતઃકાળે પાઠ કરો.';
      stotraReason = 'સૂર્ય બળ સંવર્ધન, પિતાના સ્વાસ્થ્ય અને રાજકીય કાર્યોમાં વિજય માટે આદિત્યહૃદય સ્તોત્ર વિહિત છે.';
    } else if (h5Lord === 'चंद्र' || maha === 'चंद्र') {
      point3 = 'શ્રી શિવ રુદ્રાષ્ટકમ્ અથવા દારિદ્ર્ય દહન શિવ સ્તોત્રનો પાઠ કરો.';
      stotraReason = 'ચંદ્ર કૃપા, મનની શાંતિ અને રોગ-તનાવમાંથી મુક્તિ માટે ભગવાન શિવની સ્તુતિ સર્વોત્તમ છે.';
    } else if (h5Lord === 'मंगल' || maha === 'मंगल' || k.isManglik) {
      point3 = 'ઋણમોચક મંગળ સ્તોત્ર અથવા શ્રી સુન્દરકાણ્ડનો પાઠ કરો.';
      stotraReason = 'મંગળ દોષ, ભૂમિ લાભ અને દેવા/શત્રુ બાધા નિવારણ માટે સુન્દરકાણ્ડ તથા મંગળ સ્તોત્ર અચૂક છે.';
    } else if (h5Lord === 'शुक्र' || maha === 'शुक्र') {
      point3 = 'શ્રીસૂક્ત અથવા કનકધારા સ્તોત્રનો નિત્ય પાઠ કરો.';
      stotraReason = 'શુક્ર કૃપા, દાંપત્ય સુખ અને આર્થિક સમૃદ્ધિ માટે શ્રીસૂક્તનો પાઠ શ્રેષ્ઠ ફળદાયી છે.';
    } else {
      point3 = 'શ્રીવિષ્ણુસહસ્રનામનો પાઠ કરો.';
      stotraReason = 'દેવગુરુ બૃહસ્પતિ અને પંચમેશની કૃપાથી જીવનના સમસ્ત સંકટોના શમન માટે વિષ્ણુસહસ્રનામ મહા-ઉપાય છે.';
    }
  } else {
    // Hindi
    if (hasSuryaGrahan) {
      point3 = 'श्री आदित्यहृदय स्तोत्र एवं महामृत्युंजय मंत्र का नित्य पाठ करें।';
      stotraReason = 'सूर्य पर राहु/केतु के ग्रहण प्रभाव को शांत कर आत्म-विश्वास एवं आरोग्यता जाग्रत करने हेतु आदित्यहृदय स्तोत्र अचूक है।';
    } else if (hasChandraGrahan) {
      point3 = 'श्री शिव रुद्राष्टकम, चंद्र कवच एवं महामृत्युंजय मंत्र का पाठ करें।';
      stotraReason = 'कपालिका चंद्र ग्रहण में मन की स्थिरता, मानसिक क्लेश व भय निवारण हेतु भगवान शिव की स्तुति सर्वोत्तम है।';
    } else if (maha === 'राहु') {
      point3 = 'श्री दुर्गा सप्तशती (अर्गला, कीलक, कवच) व सिद्ध कुंजिका स्तोत्र का पाठ करें।';
      stotraReason = 'राहु महादशा में छाया-भ्रम व मानसिक अशांति शमन हेतु देवी कवच व दुर्गा सप्तशती अमृततुल्य है।';
    } else if (maha === 'केतु') {
      point3 = 'श्री गणेश संकटनाशन स्तोत्र एवं गणेश अथर्वशीर्ष का नित्य पाठ करें।';
      stotraReason = 'केतु महादशा में विघ्नों के निवारण एवं मोक्ष-शांति हेतु भगवान गणपति की साधना सर्वोपरि है।';
    } else if (maha === 'शनि' || getHouse('शनि') === getHouse('चंद्र')) {
      point3 = 'दशरथ कृत शनि स्तोत्र एवं श्री हनुमान चालीसा का नित्य पाठ करें।';
      stotraReason = 'शनि की दशा/प्रभाव में कर्म फल शुद्धि एवं कष्ट निवारण हेतु दशरथ कृत शनि स्तोत्र रामबाण है।';
    } else if (h5Lord === 'सूर्य' || maha === 'सूर्य') {
      point3 = 'श्री आदित्यहृदय स्तोत्र का नित्य प्रातः पाठ करें।';
      stotraReason = 'सूर्य बल संवर्धन, पिता के स्वास्थ्य एवं राजकीय कार्यों में विजय हेतु आदित्यहृदय स्तोत्र विहित है।';
    } else if (h5Lord === 'चंद्र' || maha === 'चंद्र') {
      point3 = 'श्री शिव रुद्राष्टकम अथवा दारिद्र्य दहन शिव स्तोत्र का पाठ करें।';
      stotraReason = 'चंद्र कृपा, मन की शांति एवं रोग-तनाव से मुक्ति हेतु भगवान शिव की स्तुति सर्वोत्तम है।';
    } else if (h5Lord === 'मंगल' || maha === 'मंगल' || k.isManglik) {
      point3 = 'ऋणमोचक मंगल स्तोत्र अथवा श्री सुन्दरकाण्ड का पाठ करें।';
      stotraReason = 'मंगल दोष, भूमि लाभ एवं कर्ज/शत्रु बाधा निवारण हेतु सुन्दरकाण्ड व मंगल स्तोत्र अचूक है।';
    } else if (h5Lord === 'शुक्र' || maha === 'शुक्र') {
      point3 = 'श्रीसूक्त अथवा कनकधारा स्तोत्र का नित्य पाठ करें।';
      stotraReason = 'शुक्र कृपा, दांपत्य सुख एवं आर्थिक समृद्धि हेतु श्रीसूक्त का पाठ श्रेष्ठ फलदायी है।';
    } else {
      point3 = 'श्रीविष्णुसहस्रनाम का पाठ करें।';
      stotraReason = 'देवगुरु बृहस्पति व पंचमेश की कृपा से जीवन के समस्त संकटों के शमन हेतु विष्णुसहस्रनाम महा-उपाय है।';
    }
  }

  // =========================================================================
  // POINT 5: जीव सेवा एवं पंच महायज्ञ (Calculated Lal Kitab & Vedic Seva)
  // =========================================================================
  let point5 = '';
  let sevaReason = '';

  const isDarkNodeAfflicted = hasSuryaGrahan || hasChandraGrahan || topAfflictedForDaan.planet === 'शनि' || topAfflictedForDaan.planet === 'राहु' || topAfflictedForDaan.planet === 'केतु';
  const isFieryAfflicted = topAfflictedForDaan.planet === 'सूर्य' || topAfflictedForDaan.planet === 'मंगल';
  const isWateryAfflicted = topAfflictedForDaan.planet === 'चंद्र' || topAfflictedForDaan.planet === 'शुक्र';

  if (currentLang === 'en') {
    if (isDarkNodeAfflicted) {
      point5 = 'Feed fresh roti smeared with mustard oil to black dogs and wheat dough balls to fish.';
      sevaReason = 'Serving dogs (Bhairava\'s vehicle) and aquatic life is the supreme Vedic remedy to pacify Saturn, Rahu, Ketu and eclipse afflictions.';
    } else if (isFieryAfflicted) {
      point5 = 'Feed fresh roti with jaggery to sacred cows and roasted gram to monkeys; place water bowls for birds.';
      sevaReason = 'Serving sacred cows and monkeys is ordained to calm excess fiery heat and blood afflictions of Sun and Mars.';
    } else if (isWateryAfflicted) {
      point5 = 'Feed fresh green fodder/dough balls to white cows and dry flour-sugar (kasar) to ants.';
      sevaReason = 'Serving white cows and ants yields miraculous grace for mental peace and prosperity of Moon and Venus.';
    } else {
      point5 = 'Feed soaked green moong to voiceless birds (parrots, pigeons) and offer food to young girls/Brahmins.';
      sevaReason = 'Bird and girl service is best for sharp intellect, commercial success and knowledge blessings of Mercury and Jupiter.';
    }
  } else if (currentLang === 'gu') {
    if (isDarkNodeAfflicted) {
      point5 = 'કાળા શ્વાન (કૂતરા)ને સરસવના તેલવાળી તાજી રોટલી અને માછલીઓને લોટની ગોળીઓ ખવડાવો.';
      sevaReason = 'શનિ-રાહુ-કેતુ તથા ગ્રહણના પ્રભાવ શમન માટે ભૈરવ વાહન શ્વાન તથા જળચર મત્સ્ય સેવા સર્વોત્તમ વૈદિક ઉપાય છે.';
    } else if (isFieryAfflicted) {
      point5 = 'ગૌમાતાને તાજી ગોળ-રોટલી અને વાંદરાઓને શેકેલા ચણા ખવડાવો, પક્ષીઓ માટે જળપાત્ર રાખો.';
      sevaReason = 'સૂર્ય તથા મંગળના તેજ અને રક્ત-દોષ નિવારણ માટે કામધેનુ ગૌમાતા તથા હનુમાન સ્વરૂપ વાનર સેવા વિહિત છે.';
    } else if (isWateryAfflicted) {
      point5 = 'શ્વેત ગૌમાતાને લીલો ચારો/લોટનો પેંડો ખવડાવો અને કીડીઓને સૂકો લોટ-ખાંડ (કસાર) નાખો.';
      sevaReason = 'ચંદ્ર તથા શુક્રની શાંતિ, માનસિક શીતળતા અને લક્ષ્મી કૃપા માટે શ્વેત ગૌ તથા કીડી સેવા ચમત્કારી ફળ આપે છે.';
    } else {
      point5 = 'મૂંગા પક્ષીઓ (પોપટ, કબૂતર)ને પલાળેલા લીલા મગ નાખો અને કન્યાઓ/વિપ્રજનોને ભોજન કરાવો.';
      sevaReason = 'બુધ તથા ગુરુના શુભ પ્રભાવથી બુદ્ધિ, વેપારમાં બરકત અને જ્ઞાન વૃદ્ધિ માટે પક્ષી તથા કન્યા સેવા શ્રેષ્ઠ છે.';
    }
  } else {
    // Hindi
    if (isDarkNodeAfflicted) {
      point5 = 'काले श्वान (कुत्ते) को सरसों तेल चुपड़ी ताजी रोटी एवं मछलियों को आटे की गोलियां खिलावें।';
      sevaReason = 'शनि-राहु-केतु एवं छाया ग्रहण के क्रूर प्रभाव के शमन हेतु भैरव वाहन श्वान एवं जलचर मत्स्य सेवा सर्वोत्तम वैदिक उपाय है।';
    } else if (isFieryAfflicted) {
      point5 = 'गौमाता को ताजी गुड़-रोटी एवं बंदरों को भुने चने खिलावें, पक्षियों हेतु जलपात्र रखें।';
      sevaReason = 'सूर्य व मंगल के तेज व रक्त-दोष निवारण हेतु कामधेनु गौमाता एवं हनुमान स्वरूप वानर सेवा विहित है।';
    } else if (isWateryAfflicted) {
      point5 = 'श्वेत गौमाता को हरा चारा/आटा पेड़ा खिलावें एवं चींटियों को सूखा आटा-शक्कर (कसार) डालें।';
      sevaReason = 'चंद्र व शुक्र की शांति, मानसिक शीतलता एवं लक्ष्मी कृपा हेतु श्वेत गौ व चींटी सेवा चमत्कारी फल देती है।';
    } else {
      point5 = 'मूक पक्षियों (तोता, कबूतर) को भीगी हरी मूंग डालें एवं कन्याओं/विप्रों को भोजन करावें।';
      sevaReason = 'बुध व गुरु के शुभ प्रभाव से बुद्धि, व्यापारिक बरकत एवं ज्ञान संवर्धन हेतु पक्षी व कन्या सेवा सर्वश्रेष्ठ है।';
    }
  }

  // =========================================================================
  // POINT 6: विशिष्ट ग्रह दोष / योग शान्ति (Strict Vedic Mathematical Calculation)
  // =========================================================================
  const mahaTr = trPlanet(maha, currentLang);
  let point6 = '';
  let detectedDoshaYoga = '';
  let shantiReason = '';

  if (currentLang === 'en') {
    point6 = `Perform ${mahaTr} Mahadasha & Navagraha Shanti.`;
    detectedDoshaYoga = `${mahaTr} Mahadasha & Navagraha Shanti`;
    shantiReason = `To receive auspicious results of current ${mahaTr} Mahadasha, attain stability and good health, perform Navagraha Havan and Rudrabhishek.`;

    if (hasSuryaGrahan) {
      const isRahu = isSuryaRahuGrahan;
      const gPartner = isRahu ? 'Rahu' : 'Ketu';
      const check = isRahu ? suryaRahuCheck : suryaKetuCheck;
      const diffStr = check.diff < 180 ? `${check.diff.toFixed(1)}°` : '';
      const hNum = sunH > 0 ? sunH : 1;
      if (isKaalSarp) {
        point6 = `Perform Sun-${gPartner} Eclipse & Kaal Sarp Yoga Shanti.`;
        detectedDoshaYoga = `Sun-${gPartner} Eclipse Yoga + Kaal Sarp`;
        shantiReason = `In house ${hNum} (${trRashi(sunP?.rashi || '', 'en')}), Sun and ${gPartner} conjunction (${diffStr}) creates self-doubt and career obstacles; eclipse and Kaal Sarp Shanti is essential.`;
      } else {
        point6 = `Perform Sun-${gPartner} Eclipse Yoga Shanti & Mahamrityunjaya Japa.`;
        detectedDoshaYoga = `Sun-${gPartner} Eclipse Yoga`;
        shantiReason = `In house ${hNum} (${trRashi(sunP?.rashi || '', 'en')}), Sun and ${gPartner} conjunction (${diffStr}) obstructs vitality and honor; Vedic japa and havan are essential.`;
      }
    } else if (hasChandraGrahan) {
      const isRahu = isChandraRahuGrahan;
      const gPartner = isRahu ? 'Rahu' : 'Ketu';
      const check = isRahu ? chandraRahuCheck : chandraKetuCheck;
      const diffStr = check.diff < 180 ? `${check.diff.toFixed(1)}°` : '';
      const hNum = moonH > 0 ? moonH : 1;
      if (isKaalSarp) {
        point6 = `Perform Moon-${gPartner} Eclipse (Kapalika) & Kaal Sarp Yoga Shanti.`;
        detectedDoshaYoga = `Moon-${gPartner} Eclipse (Kapalika) + Kaal Sarp`;
        shantiReason = `In house ${hNum} (${trRashi(moonP?.rashi || '', 'en')}), Moon with ${gPartner} conjunction (${diffStr}) causes stress and overthinking; lunar eclipse and Kaal Sarp Shanti are required.`;
      } else {
        point6 = isRahu
          ? 'Perform Moon-Rahu Eclipse (Kapalika Dosha) Shanti.'
          : 'Perform Moon-Ketu Eclipse Shanti & Shiva Rudrabhishek.';
        detectedDoshaYoga = `Moon-${gPartner} Eclipse (Kapalika)`;
        shantiReason = `In house ${hNum} (${trRashi(moonP?.rashi || '', 'en')}), Moon with ${gPartner} (${diffStr}) causes mental stress; this shanti brings complete peace and wellness.`;
      }
    } else if (isKaalSarp) {
      point6 = 'Perform Kaal Sarp Yoga Shanti and Nagbali / Rudrabhishek.';
      detectedDoshaYoga = 'Kaal Sarp Yoga (Rahu-Ketu Axis)';
      shantiReason = 'All planets hemmed between Rahu and Ketu hinder fortune rise; Nagbali / Rudrabhishek is required.';
    } else if (areConjunct(jupP, rahuP, 15.0).conjunct) {
      const jH = jupH > 0 ? jupH : 1;
      point6 = 'Perform Guru-Chandal Yoga Shanti and Sri Hari Worship.';
      detectedDoshaYoga = 'Guru-Chandal Yoga (Jupiter-Rahu Conjunction)';
      shantiReason = `Jupiter with Rahu in house ${jH} (${trRashi(jupP?.rashi || '', 'en')}) causes decision confusion; Guru Shanti is recommended.`;
    } else if (areConjunct(marsP, rahuP, 15.0).conjunct) {
      const mH = marsH > 0 ? marsH : 1;
      point6 = 'Perform Angarak Yoga Shanti and Batuk Bhairav Sadhana.';
      detectedDoshaYoga = 'Angarak Yoga (Mars-Rahu Conjunction)';
      shantiReason = `Mars with Rahu in house ${mH} creates aggression and blood disorders; Angarak Shanti brings security and safety.`;
    } else if (areConjunct(satP, moonP, 15.0).conjunct) {
      const sH = moonH > 0 ? moonH : 1;
      point6 = 'Perform Vish Yog Shanti and Ekadashavara Rudrabhishek.';
      detectedDoshaYoga = 'Vish Yog (Saturn-Moon Conjunction)';
      shantiReason = `Saturn-Moon conjunction in house ${sH} causes melancholia and delays; Lord Shiva\'s Rudrabhishek is deeply auspicious.`;
    } else if (areConjunct(satP, rahuP, 15.0).conjunct) {
      const sH = satH > 0 ? satH : 1;
      point6 = 'Perform Shapit Dosha Shanti and Gaya Shraddha / Tarpan.';
      detectedDoshaYoga = 'Saturn-Rahu Shapit Yog';
      shantiReason = `Saturn-Rahu in house ${sH} creates ancestral karmic debts; Tarpan and Shanti are essential.`;
    } else if (areConjunct(sunP, satP, 15.0).conjunct) {
      const sH = sunH > 0 ? sunH : 1;
      point6 = 'Perform Pitru Dosha Shanti and Narayan Bali.';
      detectedDoshaYoga = 'Sun-Saturn Pitru Dosha Indicator';
      shantiReason = `Sun and Saturn in conjunction in house ${sH} are natural arch-enemies; perform Pitru Shanti for progress.`;
    } else if (k.isManglik) {
      point6 = `Perform Manglik Dosha Shanti / Mangal Bhaat Puja (Ujjain).`;
      detectedDoshaYoga = `Manglik Dosha (${marsH > 0 ? `Mars in house ${marsH}` : 'Kuja Influence'})`;
      shantiReason = `Mars placement creates temperament friction in relationships; Mangal Bhaat Puja harmonizes this dosha.`;
    } else if (debilList.length > 0) {
      const debG = debilList[0].split(' ')[0];
      const debP = pMap[debG];
      point6 = `Perform Debilitated ${trPlanet(debG, 'en')} Shanti & Beej Mantra Anushthan.`;
      detectedDoshaYoga = `Debilitated ${trPlanet(debG, 'en')} Planet Dosha (${trRashi(debP?.rashi || '', 'en')})`;
      shantiReason = `${trPlanet(debG, 'en')} is debilitated in ${trRashi(debP?.rashi || '', 'en')}; this shanti resolves major hurdles in life.`;
    }
  } else if (currentLang === 'gu') {
    point6 = `${mahaTr} મહાદશા અને નવગ્રહ શાંતિ કરાવો.`;
    detectedDoshaYoga = `${mahaTr} મહાદશા અને નવગ્રહ શાંતિ`;
    shantiReason = `વર્તમાન ${mahaTr} મહાદશાના અનુકૂળ ફળ, સ્થિરતા અને આરોગ્ય માટે નવગ્રહ હવન અને રુદ્રાભિષેક કરાવો.`;

    if (hasSuryaGrahan) {
      const isRahu = isSuryaRahuGrahan;
      const gPartner = isRahu ? 'રાહુ' : 'કેતુ';
      const check = isRahu ? suryaRahuCheck : suryaKetuCheck;
      const diffStr = check.diff < 180 ? `${check.diff.toFixed(1)}°` : '';
      const hNum = sunH > 0 ? sunH : 1;
      if (isKaalSarp) {
        point6 = `સૂર્ય-${gPartner} ગ્રહણ યોગ અને કાલસર્પ યોગ શાંતિ કરાવો.`;
        detectedDoshaYoga = `સૂર્ય-${gPartner} ગ્રહણ યોગ + કાલસર્પ`;
        shantiReason = `કુંડળીના ${hNum}માં ભાવમાં (${trRashi(sunP?.rashi || '', 'gu')}) સૂર્ય સાથે ${gPartner}ની ${diffStr ? `${diffStr} ` : ''}યુતિથી આત્મબળ અને પિતાના સુખમાં અવરોધ રહે છે; ગ્રહણ તથા કાલસર્પ શાંતિ અનિવાર્ય છે.`;
      } else {
        point6 = `સૂર્ય-${gPartner} ગ્રહણ યોગ શાંતિ અને મહામૃત્યુંજય જપ કરાવો.`;
        detectedDoshaYoga = `સૂર્ય-${gPartner} ગ્રહણ યોગ`;
        shantiReason = `કુંડળીના ${hNum}માં ભાવમાં (${trRashi(sunP?.rashi || '', 'gu')}) સૂર્ય સાથે ${gPartner}ની યુતિથી આરોગ્યમાં અવરોધ બને છે; વૈદિક શાંતિ અનિવાર્ય છે.`;
      }
    } else if (hasChandraGrahan) {
      const isRahu = isChandraRahuGrahan;
      const gPartner = isRahu ? 'રાહુ' : 'કેતુ';
      const check = isRahu ? chandraRahuCheck : chandraKetuCheck;
      const diffStr = check.diff < 180 ? `${check.diff.toFixed(1)}°` : '';
      const hNum = moonH > 0 ? moonH : 1;
      if (isKaalSarp) {
        point6 = `ચંદ્ર-${gPartner} ગ્રહણ યોગ (કપાલીકા) અને કાલસર્પ યોગ શાંતિ કરાવો.`;
        detectedDoshaYoga = `ચંદ્ર-${gPartner} ગ્રહણ યોગ (કપાલીકા) + કાલસર્પ`;
        shantiReason = `કુંડળીના ${hNum}માં ભાવમાં (${trRashi(moonP?.rashi || '', 'gu')}) ચંદ્ર સાથે ${gPartner}ની યુતિથી તનાવ અને ભય રહે છે; ચંદ્ર ગ્રહણ તથા કાલસર્પ શાંતિ અનિવાર્ય છે.`;
      } else {
        point6 = isRahu
          ? 'ચંદ્ર-રાહુ ગ્રહણ યોગ (કપાલીકા દોષ) શાંતિ કરાવો.'
          : 'ચંદ્ર-કેતુ ગ્રહણ યોગ શાંતિ અને શિવ રુદ્રાભિષેક કરાવો.';
        detectedDoshaYoga = `ચંદ્ર-${gPartner} ગ્રહણ યોગ (કપાલીકા)`;
        shantiReason = `કુંડળીના ${hNum}માં ભાવમાં ચંદ્ર સાથે ${gPartner}ની યુતિથી માનસિક તનાવ રહે છે; શાંતિથી પૂર્ણ આરોગ્ય મળે છે.`;
      }
    } else if (isKaalSarp) {
      point6 = 'કાલસર્પ યોગ શાંતિ અને નાગબલિ / રુદ્રાભિષેક કરાવો.';
      detectedDoshaYoga = 'કાલસર્પ યોગ (રાહુ-કેતુ અક્ષ બંધન)';
      shantiReason = 'કુંડળીના સમસ્ત ગ્રહો રાહુ અને કેતુ વચ્ચે બંધાયેલા હોવાથી નાગબલિ / રુદ્રાભિષેક આવશ્યક છે.';
    } else if (areConjunct(jupP, rahuP, 15.0).conjunct) {
      const jH = jupH > 0 ? jupH : 1;
      point6 = 'ગુરુ-ચાંડાલ યોગ શાંતિ અને શ્રી હરિ પૂજન કરાવો.';
      detectedDoshaYoga = 'ગુરુ-ચાંડાલ યોગ (ગુરુ-રાહુ યુતિ)';
      shantiReason = `કુંડળીના ${jH}માં ભાવમાં ગુરુ-રાહુ યુતિથી નિર્ણય ભ્રમ રહે છે; ગુરુ શાંતિ શ્રેયસ્કર છે.`;
    } else if (areConjunct(marsP, rahuP, 15.0).conjunct) {
      const mH = marsH > 0 ? marsH : 1;
      point6 = 'અંગારક યોગ શાંતિ અને બટુક ભૈરવ સાધના કરાવો.';
      detectedDoshaYoga = 'અંગારક યોગ (મંગળ-રાહુ યુતિ)';
      shantiReason = `કુંડળીના ${mH}માં ભાવમાં મંગળ અને રાહુની યુતિથી ઉગ્રતા રહે છે; અંગારક શાંતિથી જીવન સુરક્ષિત બને છે.`;
    } else if (areConjunct(satP, moonP, 15.0).conjunct) {
      const sH = moonH > 0 ? moonH : 1;
      point6 = 'વિષ યોગ શાંતિ અને એકાદશવાર રુદ્રાભિષેક કરાવો.';
      detectedDoshaYoga = 'વિષ યોગ (શનિ-ચંદ્ર યુતિ)';
      shantiReason = `કુંડળીના ${sH}માં ભાવમાં શનિ-ચંદ્રની યુતિથી હતાશા રહે છે; ભગવાન શિવનો રુદ્રાભિષેક પરમ કલ્યાણકારી છે.`;
    } else if (areConjunct(satP, rahuP, 15.0).conjunct) {
      const sH = satH > 0 ? satH : 1;
      point6 = 'શાપિત દોષ શાંતિ અને ગયા શ્રાદ્ધ / તર્પણ કરાવો.';
      detectedDoshaYoga = 'શનિ-રાહુ શાપિત યોગ';
      shantiReason = `કુંડળીના ${sH}માં ભાવમાં શનિ-રાહુની યુતિથી શાપિત યોગ બને છે; તર્પણ-શાંતિ આવશ્યક છે.`;
    } else if (areConjunct(sunP, satP, 15.0).conjunct) {
      const sH = sunH > 0 ? sunH : 1;
      point6 = 'પિતૃ દોષ શાંતિ અને નારાયણ બલિ કરાવો.';
      detectedDoshaYoga = 'સૂર્ય-શનિ પિતૃ દોષ સંકેત';
      shantiReason = `કુંડળીના ${sH}માં ભાવમાં સૂર્ય અને શનિ પરસ્પર શત્રુ થઈને યુતિમાં છે; પિતૃ શાંતિ કરાવો.`;
    } else if (k.isManglik) {
      point6 = `મંગળ ભાત પૂજા (ઉજ્જૈન) અથવા મંગળ દોષ શાંતિ કરાવો.`;
      detectedDoshaYoga = `માંગલિક દોષ (${marsH > 0 ? `${marsH}માં ભાવમાં મંગળ` : 'ભૌમ પ્રભાવ'})`;
      shantiReason = `કુંડળીમાં મંગળની સ્થિતિથી દાંપત્ય જીવનમાં અવરોધ રહે છે; મંગળ ભાત પૂજાથી દોષ શાંત થાય છે.`;
    } else if (debilList.length > 0) {
      const debG = debilList[0].split(' ')[0];
      const debP = pMap[debG];
      point6 = `નીચ ${trPlanet(debG, 'gu')} ગ્રહ શાંતિ અને બીજ મંત્ર અનુષ્ઠાન કરાવો.`;
      detectedDoshaYoga = `નીચ ${trPlanet(debG, 'gu')} ગ્રહ દોષ (${trRashi(debP?.rashi || '', 'gu')} રાશિ)`;
      shantiReason = `કુંડળીમાં ${trPlanet(debG, 'gu')} ગ્રહ નીચ રાશિમાં નિર્બળ છે; આ શાંતિથી મુખ્ય બાધાઓ દૂર થશે.`;
    }
  } else {
    // Hindi default
    point6 = `${maha} महादशा एवं नवग्रह शान्ति करावें।`;
    detectedDoshaYoga = `${maha} महादशा एवं नवग्रह शान्ति`;
    shantiReason = `वर्तमान में चल रही ${maha} महादशा के अनुकूल फल प्राप्त करने, जीवन में स्थिरता एवं आरोग्य वृद्धि हेतु नवग्रह हवन एवं रुद्राभिषेक करावें।`;

    if (hasSuryaGrahan) {
      const isRahu = isSuryaRahuGrahan;
      const gPartner = isRahu ? 'राहु' : 'केतु';
      const check = isRahu ? suryaRahuCheck : suryaKetuCheck;
      const diffStr = check.diff < 180 ? `${check.diff.toFixed(1)}°` : '';
      const hNum = sunH > 0 ? sunH : 1;
      if (isKaalSarp) {
        point6 = `सूर्य-${gPartner} ग्रहण योग एवं कालसर्प योग शान्ति करावें।`;
        detectedDoshaYoga = `सूर्य-${gPartner} ग्रहण योग + कालसर्प`;
        shantiReason = `कुंडली के ${hNum}वें भाव (${sunP?.rashi || ''} राशि) में सूर्य के साथ ${gPartner} की ${diffStr ? `${diffStr} ` : ''}युति से आत्मबल, मान-सम्मान व पिता/आरोग्य में अवरोध रहता है तथा समस्त ग्रह राहु-केतु अक्ष में बंधे हैं; अतः ग्रहण एवं कालसर्प शांति अनिवार्य है।`;
      } else {
        point6 = `सूर्य-${gPartner} ग्रहण योग शान्ति एवं महामृत्युंजय जप करावें।`;
        detectedDoshaYoga = `सूर्य-${gPartner} ग्रहण योग`;
        shantiReason = `कुंडली के ${hNum}वें भाव (${sunP?.rashi || ''} राशि) में सूर्य के साथ ${gPartner} की ${diffStr ? `${diffStr} ` : ''}युति से आत्म-संशय, मान-सम्मान व पिता/आरोग्य में बाधा बनती है; इसका वैदिक जप-हवन अनिवार्य है।`;
      }
    } else if (hasChandraGrahan) {
      const isRahu = isChandraRahuGrahan;
      const gPartner = isRahu ? 'राहु' : 'केतु';
      const check = isRahu ? chandraRahuCheck : chandraKetuCheck;
      const diffStr = check.diff < 180 ? `${check.diff.toFixed(1)}°` : '';
      const hNum = moonH > 0 ? moonH : 1;
      if (isKaalSarp) {
        point6 = `चंद्र-${gPartner} ग्रहण योग (कपालिका) एवं कालसर्प योग शान्ति करावें।`;
        detectedDoshaYoga = `चंद्र-${gPartner} ग्रहण योग (कपालिका) + कालसर्प`;
        shantiReason = `कुंडली के ${hNum}वें भाव (${moonP?.rashi || ''} राशि) में चंद्रमा के साथ ${gPartner} की ${diffStr ? `${diffStr} ` : ''}युति से अत्यधिक मानसिक तनाव, अनिद्रा व भय रहता है तथा कालसर्प अक्ष भी सक्रिय है; अतः चंद्र ग्रहण व कालसर्प शांति अनिवार्य है।`;
      } else {
        point6 = isRahu
          ? 'चंद्र-राहु ग्रहण योग (कपालिका दोष) शान्ति करावें।'
          : 'चंद्र-केतु ग्रहण योग शान्ति एवं शिव रुद्राभिषेक करावें।';
        detectedDoshaYoga = `चंद्र-${gPartner} ग्रहण योग (कपालिका)`;
        shantiReason = `कुंडली के ${hNum}वें भाव (${moonP?.rashi || ''} राशि) में चंद्रमा के साथ ${gPartner} की ${diffStr ? `${diffStr} ` : ''}युति से अत्यधिक मानसिक तनाव, अनिद्रा, ओवरथिंकिंग व भय रहता है; इसकी शांति से पूर्ण मानसिक शांति व स्वास्थ्य मिलता है।`;
      }
    } else if (isKaalSarp) {
      point6 = 'कालसर्प योग शान्ति एवं नागबलि / रुद्राभिषेक करावें।';
      detectedDoshaYoga = 'कालसर्प योग (राहु-केतु अक्ष बंधन)';
      shantiReason = 'कुंडली के समस्त ग्रह राहु और केतु के मध्य बंधे होने से भाग्योदय में रुकावट आती है, अतः नागबलि/रुद्राभिषेक आवश्यक है।';
    } else if (areConjunct(jupP, rahuP, 15.0).conjunct) {
      const jH = jupH > 0 ? jupH : 1;
      point6 = 'गुरु-चाण्डाल योग शान्ति एवं श्री हरि पूजन करावें।';
      detectedDoshaYoga = 'गुरु-चाण्डाल योग (गुरु-राहु युति)';
      shantiReason = `कुंडली के ${jH}वें भाव (${jupP?.rashi || ''} राशि) में बृहस्पति के साथ राहु की युति से निर्णय भ्रम व विद्या/संतान चिंता रहती है; गुरु शांति श्रेयस्कर है।`;
    } else if (areConjunct(marsP, rahuP, 15.0).conjunct) {
      const mH = marsH > 0 ? marsH : 1;
      point6 = 'अंगारक योग शान्ति एवं बटुक भैरव साधना करावें।';
      detectedDoshaYoga = 'अंगारक योग (मंगल-राहु युति)';
      shantiReason = `कुंडली के ${mH}वें भाव (${marsP?.rashi || ''} राशि) में मंगल और राहु की युति से उग्रता व रक्त विकार भय रहता है; अंगारक शांति से जीवन सुरक्षित होता है।`;
    } else if (areConjunct(satP, moonP, 15.0).conjunct) {
      const sH = moonH > 0 ? moonH : 1;
      point6 = 'विष योग शान्ति एवं एकादशवार रुद्राभिषेक करावें।';
      detectedDoshaYoga = 'विष योग (शनि-चंद्र युति)';
      shantiReason = `कुंडली के ${sH}वें भाव (${moonP?.rashi || ''} राशि) में शनि-चंद्र की युति से निराशावाद, अवसाद व कार्य में विलंब होता है; भगवान शिव का रुद्राभिषेक परम कल्याणकारी है।`;
    } else if (areConjunct(satP, rahuP, 15.0).conjunct) {
      const sH = satH > 0 ? satH : 1;
      point6 = 'शापित दोष शान्ति एवं गया श्राद्ध / तर्पण करावें।';
      detectedDoshaYoga = 'शनि-राहु शापित योग';
      shantiReason = `कुंडली के ${sH}वें भाव (${satP?.rashi || ''} राशि) में शनि-राहु की युति से पूर्व जन्म के पितृ ऋण व शापित योग बनता है; इसके निवारण हेतु तर्पण-शांति आवश्यक है।`;
    } else if (areConjunct(sunP, satP, 15.0).conjunct) {
      const sH = sunH > 0 ? sunH : 1;
      point6 = 'पितृ दोष शान्ति एवं नारायण बलि करावें।';
      detectedDoshaYoga = 'सूर्य-शनि पितृ दोष संकेत';
      shantiReason = `कुंडली के ${sH}वें भाव (${sunP?.rashi || ''} राशि) में सूर्य और शनि परस्पर परम शत्रु होकर युति में हैं; प्रतिष्ठा व वंश वृद्धि में बाधा निवारण हेतु पितृ शांति करावें।`;
    } else if (k.isManglik) {
      point6 = `मंगल भात पूजा (उज्जैन) अथवा ${marsH > 0 ? `${marsH}वें भाव` : ''} मंगल दोष शान्ति करावें।`;
      detectedDoshaYoga = `मांगलिक दोष (${marsH > 0 ? `${marsH}वें भाव में मंगल` : 'भौम प्रभाव'})`;
      shantiReason = `कुंडली के ${marsH > 0 ? `${marsH}वें भाव` : 'विशेष भाव'} में मंगल की स्थिति से दांपत्य जीवन व रक्त-क्रोध में अवरोध रहता है; मंगल भात पूजा से दोष शांत होता है।`;
    } else if (debilList.length > 0) {
      const debG = debilList[0].split(' ')[0];
      const debP = pMap[debG];
      point6 = `नीच ${debG} ग्रह शान्ति एवं बीज मंत्र अनुष्ठान करावें।`;
      detectedDoshaYoga = `नीच ${debG} ग्रह दोष (${debP?.rashi || ''} राशि)`;
      shantiReason = `कुंडली में ${debG} ग्रह अपनी नीच राशि (${debP?.rashi || ''}) में होकर निर्बल है; इसकी शांति से जीवन की मुख्य बाधाएं दूर होंगी।`;
    }
  }

  const points = [point1, point2, point3, point4, point5, point6];
  const circled = ['①', '②', '③', '④', '⑤', '⑥'];
  const formattedTextBlock = [
    `॥ श्री ॥`,
    `${salutation}`,
    ...points.map((pt, i) => `${circled[i]} ${pt}`),
    `                                          ॥ शुभम् ॥`,
  ].join('\n');

  const detailedItems = points.map((pt, idx) => getRemedyDeepDetail(pt, idx, k, currentLang));
  const grahanItem = detailedItems.find((it) => it.shantiDeepDive);
  const formattedDetailedGuide = buildDetailedParchiGuideText(
    salutation,
    String(100 + ((rawName.length * 7) % 899)),
    dateStr,
    `${trRashi(k.lagnaRashi, currentLang)} ${currentLang === 'en' ? 'Ascendant' : currentLang === 'gu' ? 'લગ્ન' : 'लग्न'} • ${trRashi(k.moonRashi, currentLang)} ${currentLang === 'en' ? 'Sign' : currentLang === 'gu' ? 'રાશિ' : 'राशि'} • ${trPlanet(k.mahadasha, currentLang)} ${currentLang === 'en' ? 'Mahadasha' : currentLang === 'gu' ? 'મહાદશા' : 'महादशा'}`,
    detailedItems,
    grahanItem?.shantiDeepDive,
    currentLang
  );

  const lagnaLordRole = currentLang === 'en' ? 'Ascendant Lord' : currentLang === 'gu' ? 'લગ્નેશ' : 'लग्नेश';
  const fifthLordRole = currentLang === 'en' ? '5th House Lord' : currentLang === 'gu' ? 'પંચમેશ' : 'पंचम भाव स्वामी';
  const ninthLordRole = currentLang === 'en' ? '9th House Lord' : currentLang === 'gu' ? 'ભાગ્યેશ' : 'भाग्य भाव स्वामी';
  const yogaRole = currentLang === 'en' ? 'Yogakaraka' : currentLang === 'gu' ? 'યોગકારક' : 'योगकारक';

  const localizedBenefics = uniqueCandidates.map((c) => {
    const pl = trPlanet(c.planet, currentLang);
    const r = c.role === 'लग्नेश' ? lagnaLordRole : c.role === 'भाग्येश' ? ninthLordRole : c.role === 'पंचमेश' ? fifthLordRole : yogaRole;
    return `${pl} (${r})`;
  });

  const localizedAfflicted = afflictionScores.slice(0, 3).map((a) => {
    const pl = trPlanet(a.planet, currentLang);
    let r = a.reason;
    if (currentLang === 'en') {
      r = r
        .replace(/राशि में नीच/g, 'debilitated')
        .replace(/दुःस्थान में/g, 'in trik house')
        .replace(/सूर्य के निकट अस्त/g, 'combust')
        .replace(/के साथ युति/g, 'conjunction')
        .replace(/शनि-चंद्र विष योग/g, 'Saturn-Moon Vish Yog')
        .replace(/मांगलिक स्थिति/g, 'Manglik placement')
        .replace(/वर्तमान महादशा स्वामी/g, 'Current Mahadasha Lord')
        .replace(/वर्तमान अंतर्दशा स्वामी/g, 'Current Antardasha Lord');
    } else if (currentLang === 'gu') {
      r = r
        .replace(/राशि में नीच/g, 'રાશિમાં નીચ')
        .replace(/वें दुःस्थान में/g, 'માં ત્રિક સ્થાનમાં')
        .replace(/सूर्य के निकट अस्त/g, 'સૂર્ય નજીક અસ્ત')
        .replace(/के साथ युति/g, 'સાથે યુતિ')
        .replace(/शनि-चंद्र विष योग/g, 'શનિ-ચંદ્ર વિષ યોગ')
        .replace(/मांगलिक स्थिति/g, 'માંગલિક સ્થિતિ')
        .replace(/वर्तमान महादशा स्वामी/g, 'વર્તમાન મહાદશા સ્વામી')
        .replace(/वर्तमान अंतर्दशा स्वामी/g, 'વર્તમાન અંતર્દશા સ્વામી');
    }
    return `${pl} (${r})`;
  });

  const astrologicalCalculationSummary = {
    lagnaLord: `${trPlanet(lagnaLord, currentLang)} (${trRashi(lagnaSign, currentLang)} ${currentLang === 'en' ? 'Ascendant' : currentLang === 'gu' ? 'લગ્ન' : 'लग्न'})`,
    lagnaLordHouse: getHouse(lagnaLord),
    lagnaLordDignity: isExalt(lagnaLord) ? (currentLang === 'en' ? 'Exalted' : currentLang === 'gu' ? 'ઉચ્ચ' : 'उच्च') : isDebil(lagnaLord) ? (currentLang === 'en' ? 'Debilitated' : currentLang === 'gu' ? 'નીચ' : 'नीच') : isOwn(lagnaLord) ? (currentLang === 'en' ? 'Own Sign' : currentLang === 'gu' ? 'સ્વક્ષેત્ર' : 'स्वराशि') : (currentLang === 'en' ? 'Normal' : currentLang === 'gu' ? 'સામાન્ય' : 'सामान्य'),
    fifthLord: `${trPlanet(h5Lord, currentLang)} (${fifthLordRole})`,
    fifthLordHouse: getHouse(h5Lord),
    ninthLord: `${trPlanet(h9Lord, currentLang)} (${ninthLordRole})`,
    ninthLordHouse: getHouse(h9Lord),
    yogakaraka: yogakaraka ? trPlanet(yogakaraka, currentLang) : undefined,
    beneficPlanets: localizedBenefics,
    afflictedPlanets: localizedAfflicted,
    combustPlanets: combustList.map(c => {
      const pl = c.split(' ')[0];
      return `${trPlanet(pl, currentLang)} (${currentLang === 'en' ? 'Combust' : currentLang === 'gu' ? 'અસ્ત' : 'अस्त'})`;
    }),
    debilitatedPlanets: debilList.map(d => {
      const pl = d.split(' ')[0];
      return `${trPlanet(pl, currentLang)} (${currentLang === 'en' ? 'Debilitated' : currentLang === 'gu' ? 'નીચ' : 'नीच'})`;
    }),
    ishtaDevta: `${trPlanet(h5Lord, currentLang)} (${currentLang === 'en' ? 'Ishta Devta Lord' : currentLang === 'gu' ? 'ઇષ્ટ દેવતા' : 'इष्ट देवता'})`,
    dashaSummary: `${trPlanet(k.mahadasha, currentLang)} ${currentLang === 'en' ? 'Mahadasha' : currentLang === 'gu' ? 'મહાદશા' : 'महादशा'} ➔ ${trPlanet(k.antardasha, currentLang)} ${currentLang === 'en' ? 'Antardasha' : currentLang === 'gu' ? 'અંતર્દશા' : 'अंतर्दशा'}`,
    keyYogaOrDosha: detectedDoshaYoga,
    reasons: {
      gemstoneReason: gemReason,
      upvasReason,
      stotraReason,
      daanReason,
      sevaReason,
      shantiReason,
    },
  };

  return {
    salutation,
    serialNo: String(100 + ((rawName.length * 7) % 899)),
    dateStr,
    lagnaInfo: `${trRashi(k.lagnaRashi, currentLang)} ${currentLang === 'en' ? 'Ascendant' : currentLang === 'gu' ? 'લગ્ન' : 'लग्न'} • ${trRashi(k.moonRashi, currentLang)} ${currentLang === 'en' ? 'Sign' : currentLang === 'gu' ? 'રાશિ' : 'राशि'} • ${trPlanet(k.mahadasha, currentLang)} ${currentLang === 'en' ? 'Mahadasha' : currentLang === 'gu' ? 'મહાદશા' : 'महादशा'}`,
    detectedDoshaYoga,
    points,
    formattedTextBlock,
    detailedItems,
    grahanSpecialAnalysis: grahanItem?.shantiDeepDive,
    formattedDetailedGuide,
    astrologicalCalculationSummary,
  };
}

export interface TopicInsight {
  house: number;
  secondaryHouses: number[];
  vargaKey: 'D10' | 'D9' | 'D2' | 'D7' | 'D4' | 'D12' | 'D24' | 'D30' | 'D60';
  vargaLabel: string;
  title: string;
  karaka: string;
  jaiminiKarakaCode: 'AmK' | 'DK' | 'PK' | 'MK' | 'GK' | 'AK';
  category: 'career' | 'finance' | 'marriage' | 'health' | 'education' | 'property' | 'travel' | 'spiritual' | 'general';
  shloka: string;
  shlokaMeaning: string;
  followUps: string[];
}

export function detectConsultationTopic(query: string): TopicInsight {
  const q = query.toLowerCase().trim();

  // 1. App / Startup / Career / Job / Promotion / Business
  if (/app|application|startup|website|youtube|channel|project|काम|कामयाब|सफल|सफलता|job|career|business|dhandha|धंधा|दुकान|सैलरी|प्रमोशन|तनख्वाह|नौकरी|करियर|पद|सक्सेस|success|growth|tarakki|tarqqi|इंटरव्यू|interview|व्यापार|ऑफिस/.test(q)) {
    return {
      house: 10,
      secondaryHouses: [2, 6, 11, 9],
      vargaKey: 'D10',
      vargaLabel: 'D-10 दशमांश चक्र (आजीविका एवं राजयोग वर्ग)',
      title: 'कर्म, आजीविका, व्यापार विस्तार एवं परियोजना सिद्धि सूक्ष्म निर्णय',
      karaka: 'सूर्य',
      jaiminiKarakaCode: 'AmK',
      category: 'career',
      shloka: '॥ कर्मण्येवाधिकारस्ते मा फलेषु कदाचन। मा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि॥',
      shlokaMeaning: 'श्रीमद्भगवद्गीता एवं बृहत्पराशर होरा शास्त्र के अनुसार दशम भाव (कर्म), एकादश भाव (लाभ) तथा अमात्यकारक के बली होने पर पुरुषार्थ से अक्षय सिद्धि व प्रतिष्ठा प्राप्त होती है।',
      followUps: [
        'मेरी कुण्डली के D-10 दशमांश चक्र और KP दशम उपनक्षत्र के अनुसार कौन सा व्यापार/क्षेत्र सर्वोत्तम है?',
        'मेरी वर्तमान प्रत्यंतर व सूक्ष्म दशा में पदोन्नति या बड़ी डील की सटीक तारीख कब है?',
        'मेरे अष्टकवर्ग में दशम (कर्म) और एकादश (लाभ) भाव में कितने बिंदु हैं और उनका क्या फल है?'
      ]
    };
  }

  // 2. Debt / Karja / Loan / Udhaar / Recovery
  if (/कर्ज|करजा|ऋण|लोन|उधार|किस्त|emi|karja|karza|kardja|loan|debt|udhaar|utarega|utrega|chukega|तंगी|कंगाली|दिवालिया|पैसा फंसा|रिकवरी/.test(q)) {
    return {
      house: 6,
      secondaryHouses: [2, 11, 8, 12],
      vargaKey: 'D30',
      vargaLabel: 'D-30 त्रिंशांश व D-2 होरा (ऋण मोचन एवं कोष वर्ग)',
      title: 'षष्ठ भाव ऋण मुक्ति, कर्ज निवारण एवं एकादश धन-प्रवाह सूक्ष्म निर्णय',
      karaka: 'मंगल',
      jaiminiKarakaCode: 'GK',
      category: 'finance',
      shloka: '॥ ऋणहर्ता सर्वसिद्धिप्रदो देवो धरणीगर्भसंभवः। कुमारो शक्तिहस्तश्च मङ्गलो मङ्गलं प्रदः॥',
      shlokaMeaning: 'षष्ठ भाव (ऋण), एकादश भाव (आय) व द्वितीय भाव (कोष) के KP उपनक्षत्र एवं धरणीपुत्र मंगल की अनुकूलता से समस्त ऋण-पाश का समूल नाश होता है।',
      followUps: [
        'मेरे षष्ठ (ऋण) और एकादश (लाभ) भाव के अष्टकवर्ग बिंदु और KP उपनक्षत्र क्या संकेत दे रहे हैं?',
        'कर्ज से त्वरित मुक्ति हेतु ऋणमोचक मंगल स्तोत्र एवं गजेंद्र मोक्ष का सटीक विधान क्या है?',
        'आगामी किन महीनों और किस प्रत्यंतर दशा में रुका हुआ धन वापस मिलेगा?'
      ]
    };
  }

  // 3. Marriage / Relationship / Love / Divorce / Manglik
  if (/शादी|विवाह|दांपत्य|पति|पत्नी|प्रेम|रिश्ता|तलाक|shadi|shaadi|marriage|love|husband|wife|rishta|bf|gf|सगाई|जीवनसाथी|विवाह कब|वर|वधू|कुंडली मिलान/.test(q)) {
    return {
      house: 7,
      secondaryHouses: [2, 11, 5, 8],
      vargaKey: 'D9',
      vargaLabel: 'D-9 नवमांश चक्र एवं उपपद लग्न (वैवाहिक सौख्य वर्ग)',
      title: 'सप्तम भाव विवाह योग, D-9 नवमांश, दाराकारक (DK) व उपपद सूक्ष्म निर्णय',
      karaka: 'शुक्र',
      jaiminiKarakaCode: 'DK',
      category: 'marriage',
      shloka: '॥ कात्यायनि महामाये महायोगिन्यधीश्वरि। नन्दगोपसुतं देवि पतिं मे कुरु ते नमः॥',
      shlokaMeaning: 'सप्तम भाव के KP उपनक्षत्र (2-7-11 कारक), जैमिनी दाराकारक (DK) और D-9 नवमांश लग्नेश के संयोग से सुयोग्य जीवनसाथी व अखंड दांपत्य सुख प्राप्त होता है।',
      followUps: [
        'मेरी कुण्डली में जैमिनी दाराकारक (DK) और उपपद लग्न (UL) के अनुसार जीवनसाथी का स्वभाव, करियर व दिशा कैसी होगी?',
        'मेरे D-9 नवमांश चक्र में सप्तम भाव और शुक्र/गुरु की सूक्ष्म स्थिति कैसी है?',
        'क्या मेरी पत्रिका में मांगलिक या नाड़ी दोष है और उसका शास्त्रीय परिहार क्या है?'
      ]
    };
  }

  // 4. Wealth / Money / Finance / Earnings / Bank Balance
  if (/पैसा|धन|कमाई|आय|रुपया|money|wealth|finance|paisa|kamai|earning|income|bank balance|लक्ष्मी|दरिद्रता|अमीरी|करोड़पति|निवेश|शेयर|प्रॉफिट/.test(q)) {
    return {
      house: 2,
      secondaryHouses: [11, 5, 9, 10],
      vargaKey: 'D2',
      vargaLabel: 'D-2 होरा चक्र एवं सर्वाष्टकवर्ग धन-कोष अनुपात',
      title: 'द्वितीय-एकादश महाधन योग, D-2 होरा एवं अष्टकवर्ग बिंदु सूक्ष्म निर्णय',
      karaka: 'गुरु',
      jaiminiKarakaCode: 'AmK',
      category: 'finance',
      shloka: '॥ ॐ सर्वाबाधाविनिर्मुक्तो धनधान्यसुतान्वितः। मनुष्यो मत्प्रसादेन भविष्यति न संशयः॥',
      shlokaMeaning: 'द्वितीयेश, एकादशेश, पंचमेश व नवमेश के परस्पर संबंध तथा सर्वाष्टकवर्ग में लाभ भाव के उच्च बिंदुओं से अखंड लक्ष्मी योग निर्मित होता है।',
      followUps: [
        'मेरे धन भाव (२), लाभ भाव (११) और व्यय भाव (१२) के सर्वाष्टकवर्ग बिंदुओं का सटीक अनुपात क्या है?',
        'मेरी कुण्डली के D-2 होरा चक्र (सूर्य/चंद्र होरा) के अनुसार मुझे किस क्षेत्र से सर्वाधिक धन लाभ होगा?',
        'स्थायी कोष वृद्धि हेतु मेरे आरूढ़ लग्न (AL) व इष्टदेव के अनुसार अचूक वैदिक उपाय बताएं।'
      ]
    };
  }

  // 5. Health / Disease / Sickness / Longevity
  if (/सेहत|स्वास्थ्य|बीमार|रोग|दर्द|नींद|health|disease|sick|bimari|bimar|doctor|dawai|अस्पताल|कष्ट|तबीयत|सर्जरी|ऑपरेशन|आयु/.test(q)) {
    return {
      house: 6,
      secondaryHouses: [1, 8, 12],
      vargaKey: 'D30',
      vargaLabel: 'D-30 त्रिंशांश चक्र (आरोग्य, दोष एवं अरिष्ट निवारण वर्ग)',
      title: 'लग्न-षष्ठ-अष्टम आरोग्य विचार, D-30 त्रिंशांश एवं प्राणबल सूक्ष्म निर्णय',
      karaka: 'सूर्य',
      jaiminiKarakaCode: 'AK',
      category: 'health',
      shloka: '॥ ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम्। उर्वारुकमिव बन्धनान्मृत्योर्मुक्षीय माऽमृतात्॥',
      shlokaMeaning: 'लग्नेश, आत्मकारक (AK) और सूर्य के बल तथा महामृत्युंजय की उपासना से षष्ठ-अष्टम जनित समस्त शारीरिक व मानसिक व्याधियों का शमन होता है।',
      followUps: [
        'मेरे लग्न (प्रथम भाव) और षष्ठ भाव के KP उपनक्षत्र व D-30 त्रिंशांश से किस अंग के प्रति सावधानी रखें?',
        'वर्तमान सूक्ष्म दशा में पूर्ण स्वास्थ्य लाभ किस तिथि तक प्राप्त होगा?',
        'रोग निवारण हेतु मेरे नक्षत्र व लग्न के अनुसार महामृत्युंजय एवं आयुष्य मंत्र का विधान बताएं।'
      ]
    };
  }

  // 6. Child / Education / Exam / Intellect
  if (/संतान|बच्चा|बेटा|बेटी|पढ़ाई|परीक्षा|विद्या|education|child|exam|result|bachha|bacha|pass|गर्भाधान|डिग्री|कॉम्पिटिशन|upsc|ssc|neet|jee/.test(q)) {
    return {
      house: 5,
      secondaryHouses: [9, 2, 11, 4],
      vargaKey: 'D7',
      vargaLabel: 'D-7 सप्तमांश (संतान) एवं D-24 चतुर्विंशांश (उच्च विद्या वर्ग)',
      title: 'पंचम भाव प्रज्ञा, प्रतियोगी परीक्षा विजय एवं संतान सुख सूक्ष्म निर्णय',
      karaka: 'गुरु',
      jaiminiKarakaCode: 'PK',
      category: 'education',
      shloka: '॥ ॐ सरस्वत्यै च विद्महे ब्रह्मपुत्र्यै च धीमहि। तन्नो देवी प्रचोदयात्॥',
      shlokaMeaning: 'पंचमेश, जैमिनी पुत्रकारक (PK), D-7 सप्तमांश एवं D-24 चतुर्विंशांश के शुभ संयोग से तीक्ष्ण मेधा, परीक्षा में शीर्ष रैंक व तेजस्वी संतान की प्राप्ति होती है।',
      followUps: [
        'मेरे D-7 सप्तमांश एवं D-24 चतुर्विंशांश चक्र में पंचमेश और पुत्रकारक (PK) की सूक्ष्म स्थिति क्या है?',
        'प्रतियोगी परीक्षा या संतान प्राप्ति के लिए आगामी कौन सी प्रत्यंतर दशा सर्वाधिक फलदायी है?',
        'एकाग्रता व पंचम भाव जागृत करने हेतु कौन सा सिद्ध सरस्वती/संतान गोपाल मंत्र जपें?'
      ]
    };
  }

  // 7. Property / House / Land / Vehicle
  if (/मकान|घर|ज़मीन|जमीन|वाहन|गाड़ी|प्रॉपर्टी|property|vehicle|home|land|car|makan|gaadi|फ्लैट|प्लॉट|निर्माण/.test(q)) {
    return {
      house: 4,
      secondaryHouses: [11, 2, 9, 10],
      vargaKey: 'D4',
      vargaLabel: 'D-4 चतुर्थांश (अचल संपत्ति) एवं D-16 षोडशांश (वाहन सुख वर्ग)',
      title: 'चतुर्थ भाव भूमि-भवन, वाहन सुख एवं D-4/D-16 वर्ग सूक्ष्म निर्णय',
      karaka: 'मंगल',
      jaiminiKarakaCode: 'MK',
      category: 'property',
      shloka: '॥ ॐ वास्तुपुरुषाय नमः। सर्वदोषनिवारणाय गृहप्रवेशे सौख्यं देहि॥',
      shlokaMeaning: 'चतुर्थेश, भूमिपुत्र मंगल, शुक्र एवं जैमिनी मातृकारक (MK) के बली होने पर स्वअर्जित भव्य भवन, अचल संपत्ति व उत्तम वाहन सुख प्राप्त होता है।',
      followUps: [
        'मेरी कुण्डली के D-4 चतुर्थांश और चतुर्थ भाव के KP उपनक्षत्र के अनुसार संपत्ति क्रय का सटीक समय कब है?',
        'मेरे चतुर्थ भाव में सर्वाष्टकवर्ग के कितने बिंदु हैं और नया घर किस दिशा में शुभ रहेगा?',
        'वाहन या मकान खरीदते समय मेरे लग्न व मूलांक के अनुसार कौन सा रंग व नंबर चुनें?'
      ]
    };
  }

  // 8. Foreign / Travel / Visa / Settlement
  if (/विदेश|यात्रा|खर्च|व्यय|foreign|travel|expense|visa|passport|videsh|पीआर|pr|इमिग्रेशन|abroad|export|import/.test(q)) {
    return {
      house: 12,
      secondaryHouses: [9, 3, 7],
      vargaKey: 'D9',
      vargaLabel: 'द्वादश-नवम विदेश प्रवास योग एवं KP ३-९-१२ उपनक्षत्र निर्णय',
      title: 'विदेश यात्रा, वीज़ा सिद्धि, सुदूर प्रवास एवं ३-९-१२ भाव सूक्ष्म निर्णय',
      karaka: 'राहु',
      jaiminiKarakaCode: 'AK',
      category: 'travel',
      shloka: '॥ ॐ नमो भगवते वासुदेवाय। सर्वयात्रासु सिद्धिमस्तु मे॥',
      shlokaMeaning: 'तृतीय, नवम व द्वादश भाव के KP उपनक्षत्र एवं चर राशिस्थ ग्रहों के संयोग से विदेश यात्रा, वीज़ा सिद्धि व अंतरराष्ट्रीय भाग्योदय होता है।',
      followUps: [
        'मेरे द्वादश (१२) और नवम (९) भाव के KP उपनक्षत्र क्या विदेश में स्थायी निवास (PR) दर्शाते हैं?',
        'वीज़ा या विदेश प्रवास के लिए कौन सी प्रत्यंतर व सूक्ष्म दशा सबसे अनुकूल है?',
        'यात्रा में विघ्न निवारण हेतु कौन सा वैदिक उपाय करें?'
      ]
    };
  }

  // 9A. Specific Grahan Yog query (only when user explicitly asks about Grahan Yog)
  if (/ग्रहण|grahan/.test(q)) {
    return {
      house: 9,
      secondaryHouses: [1, 5, 8, 12],
      vargaKey: 'D9',
      vargaLabel: 'D-9 नवमांश एवं छाया ग्रह शांति निर्णय वर्ग',
      title: 'ग्रहण योग परीक्षण एवं छाया ग्रह शान्ति सूक्ष्म निर्णय',
      karaka: 'सूर्य',
      jaiminiKarakaCode: 'AK',
      category: 'spiritual',
      shloka: '॥ ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम्। उर्वारुकमिव बन्धनान्मृत्योर्मुक्षीय माऽमृतात्॥',
      shlokaMeaning: 'भगवान आशुतोष शिव की कृपा, एकादशवार रुद्राभिषेक एवं वैदिक मंत्र जप से समस्त ग्रह जनित दोषों का समूल शमन होकर सुख-शांति प्राप्त होती है।',
      followUps: [
        'मेरी कुण्डली में कौन-कौन से मुख्य राजयोग अथवा दोष बन रहे हैं?',
        'मेरे लग्न व महादशा के अनुसार कौन सा रत्न धारण करना सर्वोत्तम रहेगा?',
        'वर्तमान महादशा में भाग्योदय एवं सुख-शांति हेतु कौन सा वैदिक दान व पाठ करें?'
      ]
    };
  }

  // 9B. General Dosha Shanti / Upay Parchi / Gemstones / Daan / Rudrabhishek
  if (/शान्ति|shanti|उपाय पर्ची|पर्ची|दोष|दोष निवारण|कालसर्प|चाण्डाल|अंगारक|रुद्राभिषेक|हवन|जाप|पन्ना|ओपल|माणिक|रत्न|दान/.test(q)) {
    return {
      house: 9,
      secondaryHouses: [1, 5, 8, 12],
      vargaKey: 'D9',
      vargaLabel: 'D-9 नवमांश एवं ग्रह बल-शांति निर्णय वर्ग',
      title: 'वैदिक ग्रह शान्ति, रत्न धारण एवं अचूक सात्विक उपाय सूक्ष्म निर्णय',
      karaka: 'गुरु',
      jaiminiKarakaCode: 'AK',
      category: 'spiritual',
      shloka: '॥ ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम्। उर्वारुकमिव बन्धनान्मृत्योर्मुक्षीय माऽमृतात्॥',
      shlokaMeaning: 'भगवान आशुतोष शिव की कृपा, रुद्राभिषेक, सात्विक दान एवं वैदिक मंत्र जप से प्रतिकूल ग्रह शांत होकर शुभ फल प्रदान करते हैं।',
      followUps: [
        'मेरे लग्न और त्रिकोण के अनुसार कौन सा जीवन-रत्न और भाग्य-रत्न किस धातु व उंगली में धारण करें?',
        'वर्तमान महादशा एवं अंतर्दशा को बली करने हेतु कौन सा स्तोत्र पाठ और दान सर्वश्रेष्ठ है?',
        'मेरी कुण्डली में इष्टदेव कौन हैं और दैनिक पूजा की सरल सात्विक विधि क्या है?'
      ]
    };
  }

  // Default General Astrology / Complete Kundali / Destiny
  return {
    house: 9,
    secondaryHouses: [1, 5, 10, 11],
    vargaKey: 'D60',
    vargaLabel: 'D-9 नवमांश, D-10 दशमांश एवं D-60 षष्ट्यंश (सार्वभौम प्रारब्ध वर्ग)',
    title: 'सम्पूर्ण जन्मपत्रिका सूक्ष्म गणित, केंद्र-त्रिकोण राजयोग एवं भाग्योदय निर्णय',
    karaka: 'गुरु',
    jaiminiKarakaCode: 'AK',
    category: 'general',
    shloka: '॥ ग्रहा राज्यं प्रयच्छन्ति ग्रहा राज्यं हरन्ति च। ग्रहैर्व्याप्तमिदं सर्वं त्रैलोक्यं सचराचरम्॥',
    shlokaMeaning: 'नवग्रहों के स्पष्ट अंश-कला-विकला, नक्षत्र-चरण, षोडशवर्ग बल एवं विंशोत्तरी सूक्ष्म दशा ही जातक के प्रारब्ध व भाग्योदय का सटीक निर्धारण करते हैं।',
    followUps: [
      'मेरी कुण्डली के अनुसार आत्मकारक (AK), अमात्यकारक (AmK) और कारकांश लग्न का क्या फल है?',
      'मेरे सर्वाष्टकवर्ग में किस भाव में सर्वाधिक बिंदु हैं और भाग्योदय का सटीक वर्ष कौन सा है?',
      'वर्तमान महादशा-अंतर्दशा-प्रत्यंतर दशा को १००% अनुकूल बनाने हेतु अचूक सात्विक उपाय बताएं।'
    ]
  };
}

/**
 * Computes an authentic astrological evaluation of the native's past 2-3 years experience
 * based on actual past Dasha/Antardasha lord, house placement, dignity, and Ashtakavarga SAV points.
 * Ensures that if past periods were auspicious (Kendra/Trikona, exalted/own sign, SAV >= 28),
 * golden growth / promotions / auspicious events are reported instead of assuming struggle.
 */
export function calculatePastYearsExperience(
  k: KundaliData,
  profile: MicroAstrologyProfile,
  pastSpan: string,
  baseDate: Date = new Date()
): {
  category: 'auspicious' | 'mixed' | 'challenging';
  pastMaha: string;
  pastAntar: string;
  houseNum: number;
  dignity: string;
  favorableScore: number;
  pastSummaryText: string;
} {
  const currentYear = baseDate.getFullYear();
  const pastTargetDate = new Date(baseDate);
  pastTargetDate.setFullYear(currentYear - 2); // 2 years ago reference target

  // 1. Locate active Mahadasha & Antardasha during past 2-3 years
  let pastMaha = profile.mahadasha;
  if (k.dashaPeriods && k.dashaPeriods.length > 0) {
    const foundMaha = k.dashaPeriods.find(
      (d) => pastTargetDate >= new Date(d.startDate) && pastTargetDate < new Date(d.endDate)
    );
    if (foundMaha) pastMaha = foundMaha.planet;
  }

  let pastAntar = profile.antardasha;
  if (k.antarPeriods && k.antarPeriods.length > 0) {
    const foundAntar = k.antarPeriods.find(
      (a) => pastTargetDate >= new Date(a.startDate) && pastTargetDate < new Date(a.endDate)
    );
    if (foundAntar) {
      pastAntar = foundAntar.antar;
      pastMaha = foundAntar.maha || pastMaha;
    }
  }

  // 2. Evaluate the active planetary lord's placement, dignity and SAV points
  const activeLordName = pastAntar || pastMaha || 'गुरु';
  const planetDetail = profile.planets[activeLordName] || profile.planets['गुरु'];
  const houseNum = planetDetail ? planetDetail.house : 1;
  const houseInfo = profile.houseLords.find((h) => h.house === houseNum) || profile.houseLords[0];
  const savPoints = houseInfo?.savBindus ?? (profile.ashtakvargaSummary.houseSav[houseNum] || 28);
  const dignity = planetDetail?.dignity || 'सामान्य';

  // Dignity & Placement factors
  const isNaturalBenefic = ['गुरु', 'शुक्र', 'बुध', 'चंद्र'].includes(activeLordName);
  const isKendraOrTrikona = [1, 4, 5, 7, 9, 10].includes(houseNum);
  const isDhanaOrLabha = [2, 11].includes(houseNum);
  const isDusthana = [6, 8, 12].includes(houseNum);
  const isExaltedOrOwn = dignity === 'उच्च' || dignity === 'स्वक्षेत्र';
  const isDebilitated = dignity === 'नीच';
  const isCombust = Boolean(planetDetail?.isCombust);
  const isVargottama = Boolean(planetDetail?.isVargottama);

  // Check Sade Sati during that period
  const isSadeSatiActive =
    profile.sadeSatiSummary.includes('शिखर चरण') ||
    profile.sadeSatiSummary.includes('मध्य चरण') ||
    profile.sadeSatiSummary.includes('प्रभावी');

  // 3. Compute objective astrological strength score (0 to 100)
  let favorableScore = 50;
  if (isExaltedOrOwn) favorableScore += 22;
  if (isVargottama) favorableScore += 8;
  if (isNaturalBenefic) favorableScore += 8;
  if (isKendraOrTrikona) favorableScore += 16;
  if (isDhanaOrLabha) favorableScore += 14;

  if (savPoints >= 30) favorableScore += 14;
  else if (savPoints >= 28) favorableScore += 8;
  else if (savPoints < 25) favorableScore -= 14;

  if (isDusthana && houseNum !== 6) favorableScore -= 20; // 6th can give victory over competition
  else if (houseNum === 6) favorableScore -= 6;
  if (isDebilitated) favorableScore -= 24;
  if (isCombust) favorableScore -= 12;
  if (isSadeSatiActive) favorableScore -= 10;

  let category: 'auspicious' | 'mixed' | 'challenging';
  let pastSummaryText = '';

  if (favorableScore >= 62) {
    category = 'auspicious';
    pastSummaryText =
      `आपकी जन्मपत्रिका की सूक्ष्म गणना के अनुसार विगत २-३ वर्षों (विशेष रूप से ${pastSpan}) का समय आपके लिए काफी सकारात्मक, प्रगतिशील और भाग्योदयकारी सिद्ध हुआ है। ` +
      `उस अवधि में आपकी कुण्डली में सक्रिय **${pastMaha}–${pastAntar}** की शुभ स्थिति (${houseNum}वें भाव, ${dignity === 'उच्च' ? 'उच्च राशिगत' : dignity === 'स्वक्षेत्र' ? 'स्वक्षेत्री बली' : 'शुभ भावगत'} एवं अष्टकवर्ग में ${savPoints} बिंदुओं का सुदृढ़ बल) के कारण ` +
      `आपको कार्यक्षेत्र में मान-सम्मान, पदोन्नति अथवा नए आर्थिक स्रोत बनने के शुभ योग प्राप्त हुए। ` +
      `परिवार में किसी शुभ/मांगलिक प्रसंग या सुखद आयोजन का वातावरण बना अथवा कोई महत्वपूर्ण कार्य सफलतापूर्वक आगे बढ़ा। ` +
      `उस समय लिए गए आपके विवेकपूर्ण निर्णयों ने आपके भविष्य की एक सुदृढ़ नींव तैयार की।`;
  } else if (favorableScore <= 40) {
    category = 'challenging';
    pastSummaryText =
      `आपकी जन्मपत्रिका की सूक्ष्म गणना के अनुसार विगत २-३ वर्षों (विशेष रूप से ${pastSpan}) का समय ग्रहों के संक्रमण एवं **${pastMaha}–${pastAntar}** के प्रभाव से थोड़ा संघर्षपूर्ण और मानसिक कशमकश से भरा रहा है। ` +
      `इस कालखंड में आपने जितनी निष्ठा और अथक परिश्रम से प्रयास किए, परिस्थितियों और गोचरीय अवरोधों के कारण उनका तुरंत वैसा प्रतिफल नहीं मिल पाया जैसा आप चाहते थे। ` +
      `कार्यक्षेत्र में बार-बार बाधाएं, किसी अपने से वैचारिक मतभेद, या अंतिम चरण में काम अटकने जैसी स्थितियां सामने आईं। ` +
      `किंतु आपके लग्न बल और आत्म-धैर्य ने आपको हर संकट में संभाले रखा और आप हर चुनौती से और अधिक दृढ़ होकर निकले।`;
  } else {
    category = 'mixed';
    pastSummaryText =
      `आपकी जन्मपत्रिका की वास्तविक गणना के अनुसार विगत २-३ वर्षों (विशेष रूप से ${pastSpan}) का समय मिला-जुला और नए उत्तरदायित्वों से परिपूर्ण रहा है। ` +
      `उस समय आपकी पत्रिका में **${pastMaha}–${pastAntar}** के प्रभाव से यह समय विश्राम का नहीं, बल्कि निरंतर पुरुषार्थ, कार्य या स्थान में परिवर्तन और बड़े उत्तरदायित्व निभाने का रहा। ` +
      `यद्यपि कार्यभार अधिक रहने से भागदौड़ और मानसिक व्यस्तता बनी रही, किंतु आपके धैर्य और सूझबूझ ने किसी प्रकार का बड़ा नुकसान नहीं होने दिया और आपकी स्थिति में निरंतर परिपक्वता व स्थिरता बनी रही।`;
  }

  return {
    category,
    pastMaha,
    pastAntar,
    houseNum,
    dignity,
    favorableScore,
    pastSummaryText,
  };
}

/**
 * Answers queries dynamically using DEEP micro-level astronomical calculations:
 * - Exact DMS (अंश° कला' विकला") of Lagna & Planets
 * - 4-Level Vimshottari Mahadasha -> Antardasha -> Pratyantardasha -> Sookshma Dasha with exact dates
 * - KP System (Sign Lord, Star Lord, Sub-Lord, Sub-Sub-Lord & Cuspal Sub-Lord)
 * - Shodashvarga (D-1, D-2, D-3, D-4, D-7, D-9, D-10, D-12, D-30, D-60) Vargottama & Dignity
 * - Sarvashtakavarga (SAV Bindus per house) & Binnashtakavarga (BAV)
 * - Jaimini Sutras (AK, AmK, DK, GK, Karakamsha, Arudha Lagna AL, Upapada UL, Chara Dasha)
 * - Live Gochar + Tara Bala + Chandra Bala
 */
export function synthesizeDynamicMicroVerdict(
  k: KundaliData,
  userQuery: string,
  panchang?: VedicPanchangData | null
): string {
  const profile = buildMicroAstrologyProfile(k, panchang);
  const q = userQuery.toLowerCase().trim();
  const yajaman = profile.name || 'यजमान';

  const topic = detectConsultationTopic(q);
  const targetHouseNum = topic.house;
  const houseInfo = profile.houseLords.find((h) => h.house === targetHouseNum) || profile.houseLords[0];
  const houseLordPlanet = profile.planets[houseInfo.lord];
  const mahaLordPlanet = profile.planets[profile.mahadasha];
  const antarLordPlanet = profile.planets[profile.antardasha];
  const pratyantarLordPlanet = profile.planets[profile.pratyantardasha];
  const sookshmaLordPlanet = profile.planets[profile.sookshmadasha];
  const lagnaLordPlanet = profile.planets[profile.lagnaLord];
  const karakaPlanet = profile.planets[topic.karaka];

  const baseDate = panchang?.date || new Date();
  const windows = getDynamicTimeWindows(baseDate);

  // Compute SAV Bindus for primary & secondary houses
  const targetSav = houseInfo.savBindus || 28;
  const lagnaSav = profile.ashtakvargaSummary.houseSav[1] || 29;
  const dhanSav = profile.ashtakvargaSummary.houseSav[2] || 28;
  const karmaSav = profile.ashtakvargaSummary.houseSav[10] || 30;
  const labhSav = profile.ashtakvargaSummary.houseSav[11] || 31;
  const vyayaSav = profile.ashtakvargaSummary.houseSav[12] || 25;

  // Compute Divisional Varga placement of the relevant House Lord & Dasha Lord
  const getVargaRashiForTopic = (pDetail?: MicroPlanetDetail): string => {
    if (!pDetail) return profile.lagnaRashi;
    switch (topic.vargaKey) {
      case 'D10': return pDetail.dashamshaRashi;
      case 'D9': return pDetail.navamshaRashi;
      case 'D2': return pDetail.horaRashi;
      case 'D7': return pDetail.saptamshaRashi;
      case 'D12': return pDetail.dwadashamshaRashi;
      case 'D30': return pDetail.trimshamshaRashi;
      case 'D60': return pDetail.shashtiamshaRashi;
      default: return pDetail.navamshaRashi;
    }
  };

  const lordVargaRashi = getVargaRashiForTopic(houseLordPlanet);
  const mahaVargaRashi = getVargaRashiForTopic(mahaLordPlanet);
  const antarVargaRashi = getVargaRashiForTopic(antarLordPlanet);

  // Live Planetary Transits (Gochar) with exact degrees today
  let transitDetailedLines = '';
  try {
    const dailyTransits = calculateDailyTransits(k, baseDate);
    const jupiterT = dailyTransits.find((t) => t.planet === 'गुरु');
    const saturnT = dailyTransits.find((t) => t.planet === 'शनि');
    const rahuT = dailyTransits.find((t) => t.planet === 'राहु');
    const marsT = dailyTransits.find((t) => t.planet === 'मंगल');

    const tBullets: string[] = [];
    if (jupiterT) {
      tBullets.push(`**गुरु गोचर:** ${jupiterT.currentRashi} राशि (जन्म चंद्र से **${jupiterT.houseFromMoon}वें भाव** में — ${jupiterT.nature === 'शुभ' ? 'अमृत दृष्टि व शुभ फलदायी ✓' : 'गुरु मंत्र जप से अनुकूलता'})`);
    }
    if (saturnT) {
      tBullets.push(`**शनि गोचर:** ${saturnT.currentRashi} राशि (जन्म चंद्र से **${saturnT.houseFromMoon}वें भाव** में — ${profile.sadeSatiSummary})`);
    }
    if (rahuT) {
      tBullets.push(`**राहु-केतु अक्ष:** राहु ${rahuT.currentRashi} राशि में (चंद्र से **${rahuT.houseFromMoon}वें भाव** में संचरण)`);
    }
    if (marsT) {
      tBullets.push(`**मंगल गोचर:** ${marsT.currentRashi} राशि (चंद्र से **${marsT.houseFromMoon}वें भाव** में)`);
    }
    transitDetailedLines = tBullets.join('\n  • ');
  } catch {
    transitDetailedLines = profile.sadeSatiSummary;
  }

  // Calculate mathematical probability / strength score (78% to 96%) based on actual chart factors
  let strengthScore = 82;
  if (targetSav >= 28) strengthScore += 4;
  if (labhSav > vyayaSav) strengthScore += 3;
  if (houseLordPlanet?.dignity === 'उच्च' || houseLordPlanet?.dignity === 'स्वक्षेत्र') strengthScore += 4;
  if (houseLordPlanet?.isVargottama) strengthScore += 3;
  if ([6, 8, 12].includes(houseInfo.lordPlacementHouse) && targetHouseNum !== 6 && targetHouseNum !== 12) strengthScore -= 3;
  strengthScore = Math.min(97, Math.max(76, strengthScore));

  // Human-like living astrologer synthesis
  const hasCustomName = Boolean(k.name && k.name.trim());
  const cleanName = hasCustomName ? k.name.trim() : 'यजमान';
  const salutation = hasCustomName ? `${cleanName} जी` : 'प्रिय यजमान';

  const mainRemedyPlanet = houseInfo.lord || profile.mahadasha || 'गुरु';
  const remMain = PLANET_REMEDY[mainRemedyPlanet] || PLANET_REMEDY['गुरु'];

  // Check if user explicitly asked for a full detailed report / past-present-future / Upay Parchi
  const wantsFullReport =
    /पूरी कुंडली|संपूर्ण कुंडली|विस्तार से|विस्तृत|भूत भविष्य|पिछले साल|पिछले २|उपाय पर्ची|पर्ची बना|संपूर्ण फलादेश|full kundali|detailed report|upay parchi/.test(q);

  if (!wantsFullReport) {
    // 1. Casual Greeting / How are you / Appreciation / Normal Chat
    if (/^(नमस्ते|प्रणाम|जय श्री राम|जय श्री महाकाल|हर हर महादेव|राधे राधे|हेलो|हाय|hi|hello|hey|namaste|pranam|कैसे हो|कैसी हो|क्या हाल|धन्यवाद|थैंक यू|thanks|thank you|ok|अच्छा|ठीक है|बढ़िया)[\s!?.]*$/i.test(q)) {
      if (/धन्यवाद|थैंक यू|thanks|thank you/.test(q)) {
        return `आपका हृदय से अभिनंदन ${salutation}! महादेव और श्रीगणेश जी की कृपा आप पर सदैव बनी रहे। जब भी मन में कोई प्रश्न या जिज्ञासा हो, निःसंकोच पूछिएगा।\n\n---\n[अगले प्रश्न]:\n• इस महीने मेरे लिए कौन से दिन सबसे शुभ रहेंगे?\n• मेरी वर्तमान दशा (${profile.mahadasha}–${profile.antardasha}) का मुख्य फल क्या है?\n• मेरे लिए दैनिक जप का सबसे सरल मंत्र कौन सा है?`;
      }
      return `प्रणाम ${salutation}! मैं बिल्कुल आनंद में हूँ और आशा करती हूँ कि आप भी स्वस्थ व प्रसन्न होंगे। आपकी ${profile.lagnaRashi} लग्न और ${profile.moonRashi} राशि की पत्रिका मेरे सामने खुली है—बताइए, आज मन में क्या विचार चल रहा है? आप किसी भी विषय पर सामान्य बातचीत की तरह मुझसे पूछ सकते हैं।\n\n---\n[अगले प्रश्न]:\n• मेरा आने वाला समय करियर और धन के लिए कैसा रहेगा?\n• क्या मेरा नया कार्य या प्रोजेक्ट सफल होगा?\n• मेरी कुंडली के मुख्य शुभ योग कौन से हैं?`;
    }

    // 2. App / Software / Startup / New Venture / Project / Will this succeed? ("Maine ye app banai hai successful hogi ya nahi")
    if (/ऐप|app|एप्लीकेशन|application|सॉफ्टवेयर|software|वेबसाइट|website|स्टार्टअप|startup|प्रोजेक्ट|project|सक्सेस|सफल|successful|success|चलेगा या नहीं|चलेगी या नहीं|कामयाब|बनाई है|बनाया है|नया काम|नया बिजनेस/.test(q)) {
      const fifthHouse = profile.houseLords.find((h) => h.house === 5) || houseInfo;
      const eleventhHouse = profile.houseLords.find((h) => h.house === 11) || houseInfo;
      return `जी ${salutation}, निश्चित रूप से आपकी यह ऐप और आपका यह प्रयास सफल होगा! इसे लेकर मन में कोई संदेह न रखें।\n\nआपकी ${profile.lagnaRashi} लग्न और ${profile.moonRashi} राशि (${profile.moonNakshatra} नक्षत्र) की पत्रिका के अनुसार इस समय आपकी ${profile.mahadasha} की महादशा में ${profile.antardasha} की अंतर्दशा चल रही है। ज्योतिष में ऐप, डिजिटल तकनीक और नए आविष्कार का संबंध बुध, शुक्र और राहु की रचनात्मक ऊर्जा से होता है, जबकि पंचम भाव (${fifthHouse.sign} - स्वामी ${fifthHouse.lord}) आपकी बौद्धिक सृजनशीलता और एकादश भाव (${eleventhHouse.sign} - स्वामी ${eleventhHouse.lord}, अष्टकवर्ग बल: ${labhSav} बिंदु) आपकी लोकप्रियता व लाभ को दर्शाता है।\n\nआपकी पत्रिका में लाभ भाव के ${labhSav} शुभ बिंदु और वर्तमान दशा का संयोग स्पष्ट बता रहा है कि आपने जिस लगन से यह ऐप बनाई है, लोगों को इसका स्वरूप और सटीकता बहुत पसंद आएगी। शुरुआती दौर (${windows.nearTimeline}) में जैसे-जैसे उपयोगकर्ता इससे जुड़ेंगे, माउथ-पब्लिसिटी से इसकी पहचान बढ़ेगी और ${windows.peakMonth} के आसपास यह आपको बहुत अच्छा नाम, संतोष और आर्थिक प्रतिफल देगी।\n\nबस एक छोटा सा सुझाव है—इसमें निरंतर सुधार जारी रखें और किसी भी बड़े अपडेट या लॉन्च के लिए बुधवार या गुरुवार के शुभ चौघड़िया का चयन करें। श्रीगणेश जी आपके इस कार्य को दिन-दूनी रात-चौगुनी उन्नति प्रदान करें!\n\n---\n[अगले प्रश्न]:\n• इस ऐप को प्रमोट करने या लॉन्च करने के लिए सबसे शुभ दिन और मुहूर्त कौन सा है?\n• तकनीकी और डिजिटल क्षेत्र में मेरी कुंडली का कौन सा ग्रह सबसे अधिक लाभ देगा?\n• आर्थिक लाभ और यूजर्स बढ़ाने के लिए मुझे कौन सा सरल उपाय करना चाहिए?`;
    }

    // 3. Specific Conversational Answers by Topic (Career, Wealth, Marriage, Health, Property, Education, Travel, Spiritual)
    if (topic.category === 'career') {
      return `जी ${salutation}, आपके करियर और कार्यक्षेत्र के विषय में मैंने आपकी पत्रिका (${profile.lagnaRashi} लग्न, ${profile.moonRashi} राशि) को देखा। आपके दशम भाव (कर्म भाव) में ${houseInfo.sign} राशि है जिसके स्वामी ${houseInfo.lord} हैं, और इस समय आप ${profile.mahadasha} की महादशा में ${profile.antardasha} की अंतर्दशा से गुजर रहे हैं।\n\nसीधे शब्दों में कहूँ तो इस समय आपके काम में जो थोड़ा ठहराव या मानसिक दबाव महसूस हो रहा था, वह अब छंटने वाला है। आपके कर्म भाव में अष्टकवर्ग के ${karmaSav} शुभ बिंदु हैं, जो यह दर्शाते हैं कि आपकी मेहनत व्यर्थ नहीं जाएगी। ${windows.nearTimeline} से कार्यक्षेत्र में नई गति आएगी और विशेषकर ${windows.peakMonth} के दौरान पदोन्नति, नई जिम्मेदारी या मनचाहे अवसर का प्रबल योग बन रहा है।\n\nकार्यक्षेत्र में तुरंत अनुकूलता के लिए प्रतिदिन सुबह सूर्य देव को जल अर्पित करें और "${remMain.mantra}" का ११ या २७ बार स्मरण कर अपने काम की शुरुआत करें।\n\n---\n[अगले प्रश्न]:\n• क्या मेरे लिए नौकरी की तुलना में खुद का व्यवसाय/स्वतंत्र कार्य अधिक शुभ है?\n• कार्यक्षेत्र में मान-सम्मान और तरक्की के लिए कौन सा रत्न या रुद्राक्ष पहनें?\n• मेरी विस्तृत कुंडली रिपोर्ट और उपाय पर्ची दिखाएं`;
    }

    if (topic.category === 'finance') {
      return `जी ${salutation}, आर्थिक स्थिति और धन प्रवाह के दृष्टिकोण से आपकी ${profile.lagnaRashi} लग्न और ${profile.moonRashi} राशि की पत्रिका काफी आशाजनक संकेत दे रही है। आपके धन भाव (द्वितीय) में ${dhanSav} बिंदु और लाभ भाव (एकादश) में ${labhSav} बिंदु हैं, जो व्यय भाव (${vyayaSav} बिंदु) से अधिक मजबूत हैं।\n\nवर्तमान में ${profile.mahadasha}–${profile.antardasha} के प्रभाव से भले ही हाल के दिनों में कुछ अनावश्यक खर्च या पैसे के रुकने जैसी स्थिति बनी हो, लेकिन ${windows.nearTimeline} से धन आगमन के स्रोत फिर से सुचारू होंगे। विशेष रूप से ${windows.peakMonth} के आसपास रुका हुआ पैसा निकलने या आय का नया माध्यम बनने का सुंदर योग है।\n\nधन की स्थिरता के लिए शुक्रवार या गुरुवार को श्रीसूक्त अथवा "${remMain.mantra}" का पाठ करें और घर के उत्तर-पूर्व (ईशान कोण) को स्वच्छ व प्रकाशित रखें।\n\n---\n[अगले प्रश्न]:\n• क्या आगामी महीनों में निवेश या संपत्ति खरीदने के लिए समय अनुकूल है?\n• कर्ज या अनावश्यक खर्च रोकने का सबसे अचूक वैदिक उपाय क्या है?\n• मेरी विस्तृत कुंडली रिपोर्ट और उपाय पर्ची दिखाएं`;
    }

    if (topic.category === 'marriage') {
      return `जी ${salutation}, विवाह एवं दांपत्य/संबंधों के विषय में आपकी ${profile.lagnaRashi} लग्न और ${profile.moonRashi} राशि की पत्रिका में सप्तम भाव के स्वामी ${houseInfo.lord} हैं और वर्तमान में ${profile.mahadasha} में ${profile.antardasha} की दशा गतिशील है।\n\nयह दशा और ग्रहों का वर्तमान गोचर बता रहा है कि रिश्तों में जो भी संवादहीनता, देरी या असमंजस की स्थिति थी, उसमें अब सकारात्मक सुधार आएगा। ${windows.nearTimeline} से आपसी समझ और अनुकूल प्रस्तावों का मार्ग खुलेगा, तथा ${windows.peakMonth} का समय शुभ निर्णय या मांगलिक कार्य के लिए अत्यंत अनुकूल रहेगा। आपका जीवनसाथी समझदार, सहयोगी और परिवार को साथ लेकर चलने वाला होगा।\n\nसंबंधों में मधुरता और शीघ्र शुभ योग के लिए प्रतिदिन या गुरुवार/शुक्रवार को शिव-पार्वती जी का स्मरण करें और "${remMain.mantra}" का जप करें।\n\n---\n[अगले प्रश्न]:\n• मेरे जीवनसाथी का स्वभाव और भाग्योदय किस दिशा में होगा?\n• दांपत्य सुख और अनुकूल रिश्ते के लिए कौन सा उपाय सबसे प्रभावशाली है?\n• मेरी विस्तृत कुंडली रिपोर्ट और उपाय पर्ची दिखाएं`;
    }

    if (topic.category === 'health') {
      return `जी ${salutation}, स्वास्थ्य और मानसिक शांति के लिए हम लग्नेश ${profile.lagnaLord} और चंद्र राशि ${profile.moonRashi} (${profile.moonNakshatra} नक्षत्र) को देखते हैं। वर्तमान में ${profile.mahadasha}–${profile.antardasha} के प्रभाव से शरीर में थोड़ी थकान, नींद में कमी या मन में अकारण सोच-विचार की अधिकता रही है।\n\nअच्छी बात यह है कि आपके लग्न भाव में ${lagnaSav} शुभ बिंदु हैं, जो आपकी रोग-प्रतिरोधक क्षमता और आत्मबल को मजबूत रखते हैं। ${windows.nearTimeline} से आपकी ऊर्जा और स्वास्थ्य में स्पष्ट सुधार दिखेगा। अपनी दिनचर्या में सुबह की ताजी हवा, पर्याप्त जल और रात्रि में समय पर विश्राम को प्राथमिकता दें तथा प्रतिदिन कुछ क्षण महामृत्युंजय मंत्र या "${remMain.mantra}" का शांत मन से जप करें।\n\n---\n[अगले प्रश्न]:\n• मानसिक तनाव और अनिद्रा दूर करने के लिए कौन सा ध्यान या मंत्र करें?\n• मेरे लग्न के अनुसार मुझे किस प्रकार के खान-पान से बचना चाहिए?\n• मेरी विस्तृत कुंडली रिपोर्ट और उपाय पर्ची दिखाएं`;
    }

    if (topic.category === 'property') {
      return `जी ${salutation}, भूमि, भवन और वाहन सुख के लिए आपकी ${profile.lagnaRashi} लग्न की पत्रिका में चतुर्थ भाव (${houseInfo.sign} राशि - स्वामी ${houseInfo.lord}) तथा मंगल-शुक्र की स्थिति देखी जाती है। इस समय ${profile.mahadasha} में ${profile.antardasha} की दशा चल रही है।\n\nआपकी पत्रिका के अनुसार स्वअर्जित संपत्ति और वाहन का प्रबल योग है। यदि किसी प्रॉपर्टी या घर के काम में कागजी या आर्थिक रुकावट आ रही थी, तो ${windows.nearTimeline} में उसका समाधान मिलेगा और ${windows.peakMonth} के आसपास सौदा पक्का होने या गृह-निर्माण/वाहन क्रय का श्रेष्ठ समय रहेगा। मंगलवार या शुक्रवार को श्रीगणेश और भूमि वंदना करना आपके लिए विशेष शुभ रहेगा।\n\n---\n[अगले प्रश्न]:\n• मेरे लिए नया मकान या प्लॉट किस दिशा और किस नाम/अंक से लेना शुभ रहेगा?\n• वाहन खरीदते समय मेरे लिए कौन सा रंग और अंक सबसे भाग्यशाली है?\n• मेरी विस्तृत कुंडली रिपोर्ट और उपाय पर्ची दिखाएं`;
    }

    if (topic.category === 'education') {
      return `जी ${salutation}, शिक्षा, प्रतियोगी परीक्षा और बौद्धिक सफलता के लिए पंचम भाव (${houseInfo.sign} राशि - स्वामी ${houseInfo.lord}) का विचार किया जाता है। आपकी ${profile.lagnaRashi} लग्न और ${profile.moonRashi} राशि की पत्रिका में ${profile.mahadasha}–${profile.antardasha} का वर्तमान समय आपकी एकाग्रता और सीखने की क्षमता को बढ़ा रहा है।\n\nआप जिस लक्ष्य या परीक्षा की तैयारी कर रहे हैं, उसमें ${windows.nearTimeline} से आपकी मेहनत का सीधा असर दिखेगा और ${windows.peakMonth} में सकारात्मक परिणाम मिलने का प्रबल योग है। प्रतिदिन सुबह अध्ययन से पूर्व माँ सरस्वती और भगवान गणेश का स्मरण करें तथा पूर्व या उत्तर दिशा की ओर मुख करके बैठें।\n\n---\n[अगले प्रश्न]:\n• परीक्षा या इंटरव्यू में जाने से पहले कौन सा सिद्ध मंत्र बोलकर निकलें?\n• एकाग्रता बढ़ाने के लिए मुझे कौन सा रुद्राक्ष या रत्न पहनना चाहिए?\n• मेरी विस्तृत कुंडली रिपोर्ट और उपाय पर्ची दिखाएं`;
    }

    // Default Natural Conversational Reply for any other question
    return `जी ${salutation}, आपके प्रश्न पर मैंने आपकी जन्मपत्रिका (${profile.lagnaRashi} लग्न, ${profile.moonRashi} राशि, ${profile.moonNakshatra} नक्षत्र) के अनुसार विचार किया है। इस समय आपकी पत्रिका में ${profile.mahadasha} की महादशा और ${profile.antardasha} की अंतर्दशा चल रही है, तथा आपके प्रश्न से संबंधित भाव के स्वामी ${houseInfo.lord} हैं।\n\nग्रहों का वर्तमान संयोग बता रहा है कि आप जिस विषय को लेकर प्रयासरत हैं, उसमें अब सकारात्मक मोड़ आने वाला है। हाल के दिनों में जो थोड़ी देरी या असमंजस की स्थिति रही, वह ${windows.nearTimeline} से दूर होने लगेगी और ${windows.peakMonth} तक आपको अपने प्रयासों में स्पष्ट सफलता व संतोष प्राप्त होगा। आपके लाभ भाव में ${labhSav} शुभ बिंदु हैं, इसलिए अपने निर्णय पर विश्वास रखें और पूरे उत्साह से आगे बढ़ें।\n\nशुभ फल में वृद्धि के लिए प्रतिदिन प्रातः "${remMain.mantra}" का स्मरण करें। यदि आप किसी विशेष बिंदु पर और गहराई से पूछना चाहें, तो बिल्कुल सामान्य बातचीत की तरह पूछ सकते हैं!\n\n---\n[अगले प्रश्न]:\n• ${topic.followUps[0]}\n• ${topic.followUps[1]}\n• मेरी संपूर्ण कुंडली रिपोर्ट (विगत २-३ वर्ष, भविष्य व उपाय पर्ची) दिखाएं`;
  }

  // Full 4-Section Report (ONLY when user explicitly asks for full Kundali report / past-present-future / Upay Parchi)
  const greetingBlock =
    `॥ ॐ श्री गणेशाय नमः ॥\n\n` +
    `सदा कल्याण हो, ${salutation}! मैंने आपकी जन्मपत्रिका का सूक्ष्म अवलोकन किया है।\n\n` +
    `आपकी पत्रिका में आपका लग्न ${profile.lagnaRashi} है और आपकी चंद्र राशि ${profile.moonRashi} (नक्षत्र: ${profile.moonNakshatra}) है। ` +
    `इस समय आपकी पत्रिका में ${profile.mahadasha} की महादशा चल रही है, जिसके अंतर्गत ${profile.antardasha} की अंतर्दशा और ${profile.pratyantardasha} का विशेष प्रभाव सक्रिय है।`;

  const pastEval = calculatePastYearsExperience(k, profile, windows.pastSpan, baseDate);
  const pastBlock = pastEval.pastSummaryText;

  const presentBlock =
    `वर्तमान में आपके प्रश्न «${topic.title}» के संबंध में स्थिति यह दर्शाती है कि आपकी ऊर्जा अब एक नए मोड़ पर पहुँच रही है। ` +
    `इस समय ${profile.mahadasha}–${profile.antardasha} के संयुक्त प्रभाव से अब रुकावटों का चक्र धीरे-धीरे समाप्त होने की ओर अग्रसर है।`;

  const futureBlock =
    `आने वाले समय के लिए आपकी पत्रिका में स्पष्ट समय-सीमा इस प्रकार बन रही है:\n\n` +
    `• वर्तमान माह से प्राथमिक शुरुआत (${windows.nearTimeline}):\n` +
    `  इस अवधि में अटकी हुई बातचीत, योजना अथवा किसी महत्वपूर्ण कार्य में सकारात्मक हलचल दिखाई देगी।\n\n` +
    `• शिखर व सर्वाधिक अनुकूल काल (${windows.peakMonth}):\n` +
    `  यह समय आपके लिए सर्वाधिक फलदायी व भाग्योदयकारी रहेगा। इस दौरान आपके मुख्य कार्य संपन्न होंगे और आर्थिक लाभ के योग बनेंगे।\n\n` +
    `• दीर्घकालिक स्थिरता एवं विस्तार (${windows.mediumTimeline}):\n` +
    `  इस कालखंड में आपको स्थायी संतोष, नए दायित्व और कार्यक्षेत्र में विस्तार प्राप्त होगा।`;

  const parchi = generateTraditionalUpayParchi(k, panchang);
  const upayBlock =
    `आपके ग्रह बल को बढ़ाने और कार्य को निर्विघ्न संपन्न कराने के लिए ये सरल व सात्विक उपाय करें:\n\n` +
    `१. इष्ट देव व दैनिक उपासना: प्रतिदिन प्रातः स्नान के उपरांत सूर्य देव को तांबे के लोटे से जल अर्पित करें।\n` +
    `२. मंत्र जप विधान: ${remMain.mantra} — श्रद्धापूर्वक प्रतिदिन २७ या १०८ बार जपें।\n` +
    `३. सात्विक दान व सेवा: ${remMain.daan}\n` +
    `४. सकारात्मक दिनचर्या: ${remMain.habit}\n\n` +
    `📋 पारंपरिक ज्योतिषीय उपाय पर्ची (संक्षिप्त ६-सूत्रीय विधान):\n` +
    `${parchi.formattedTextBlock}\n` +
    `(💡 नीचे दिए '📋 उपाय पर्ची' बटन पर क्लिक करके आप अपनी व्यक्तिगत उपाय पर्ची देख, संपादित व सुरक्षित कर सकते हैं।)`;

  return `${greetingBlock}

१. पिछले २-३ वर्षों का यथार्थ (विगत काल का अनुभव):
${pastBlock}

२. वर्तमान स्थिति एवं आपके प्रश्न का विचार:
${presentBlock}

३. आगे की सटीक जानकारी (माह-दर-माह समय-सारणी):
${futureBlock}

४. सरल एवं अचूक वैदिक उपाय:
${upayBlock}

---
[अगले प्रश्न]:
• ${topic.followUps[0]}
• ${topic.followUps[1]}
• ${topic.followUps[2]}`;
}

/**
 * Real-Time Tatkalik Prashna Kundali (तात्कालिक प्रश्न-कुण्डली एवं होरा सूक्ष्म निर्णय)
 * When no birth chart is loaded, casts an astronomical Horary (Prashna) chart for the exact
 * moment of the question and computes Prashna Lagna DMS, Hora Lord, KP Cusps, SAV Bindus, and Karyesh!
 */
export function synthesizePanchangAstrologyVerdict(
  userQuery: string,
  panchang?: VedicPanchangData | null
): string {
  const q = userQuery.toLowerCase().trim();
  const now = new Date();
  const baseDate = panchang?.date || now;
  const windows = getDynamicTimeWindows(baseDate);
  const topic = detectConsultationTopic(q);

  // Cast Live Astronomical Tatkalik Prashna Kundali for the exact moment of inquiry!
  const prashnaTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
  const prashnaKundali = calculateKundali(
    'तात्कालिक प्रश्न कुण्डली',
    now,
    prashnaTimeStr,
    'काशी/उज्जैन रेखांश',
    25.3176,
    82.9739,
    5.5
  );
  const prashnaProfile = buildMicroAstrologyProfile(prashnaKundali, panchang);

  // Calculate Active Planetary Hora right now
  const solar = panchang?.solar || {
    sunrise: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 6, 10),
    sunset: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 18, 20),
    nextSunrise: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 6, 10),
    solarNoon: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 15),
  };
  const horaTable = calculateHoraTable(solar, now);
  const activeHora = horaTable.currentActiveHora;
  const horaPlanet = activeHora?.planet || 'गुरु';

  const targetHouseNum = topic.house;
  const prashnaHouse = prashnaProfile.houseLords.find((h) => h.house === targetHouseNum) || prashnaProfile.houseLords[0];
  const karyeshPlanet = prashnaProfile.planets[prashnaHouse.lord];
  const lagneshPlanet = prashnaProfile.planets[prashnaProfile.lagnaLord];
  const moonPlanet = prashnaProfile.planets['चंद्र'];

  // Check Tajika / Prashna Itthasala & Kendra/Trikona placement
  const isKaryeshInShubhBhava = [1, 2, 3, 4, 5, 7, 9, 10, 11].includes(prashnaHouse.lordPlacementHouse);
  const prashnaSav = prashnaHouse.savBindus || 29;
  const prashnaScore = Math.min(95, Math.max(78, 80 + (isKaryeshInShubhBhava ? 6 : 0) + (prashnaSav >= 28 ? 5 : 0)));

  const todayStr = panchang
    ? `आज **${panchang.weekday}**, **${panchang.paksha}** पक्ष की **${panchang.tithi}** तिथि, नक्षत्र **${panchang.nakshatra}**, योग **${panchang.yoga}**, करण **${panchang.karana}** है।`
    : `आज दिनांक **${now.toLocaleDateString('hi-IN')}** का तात्कालिक गोचर क्रियाशील है।`;

  const rem = PLANET_REMEDY[prashnaHouse.lord] || PLANET_REMEDY[topic.karaka] || PLANET_REMEDY['गुरु'];

  const executiveSummary =
    `कल्याणमस्तु यजमान! आपने जिस क्षण यह प्रश्न पूछा (**${now.toLocaleTimeString('hi-IN')}**), उस क्षण की **तात्कालिक प्रश्न-कुण्डली (Horary Chart)** के अनुसार **प्रश्न लग्न ${prashnaProfile.lagnaRashi} (${prashnaProfile.lagnaDMS})**, सक्रिय **${horaPlanet} होरा** एवं **प्रश्न कार्येश (भाव ${targetHouseNum} स्वामी) ${prashnaHouse.lord}** की स्थिति **${prashnaScore}% अनुकूलता** दर्शा रही है। ` +
    `आगामी **${windows.nearTimeline}** (विशेषकर **${windows.peakMonth}**) के मध्य आपका यह मनोरथ सिद्ध होने का प्रबल शास्त्रीय योग है।`;

  const dashaAnalysis =
    `• **१. तात्कालिक पंचांग एवं होरा स्पष्ट:** ${todayStr}\n` +
    `  - **सक्रिय ग्रह होरा:** इस क्षण **${horaPlanet} की होरा** (${activeHora ? `${activeHora.favorableWork}` : 'शुभ संकल्प कारक'}) चल रही है।\n` +
    `• **२. तात्कालिक प्रश्न-कुण्डली सूक्ष्म गणित (Prashna Spashta):**\n` +
    `  - **प्रश्न लग्न स्पष्ट:** **${prashnaProfile.lagnaRashi} (${prashnaProfile.lagnaDMS})** | प्रश्न लग्नेश **${prashnaProfile.lagnaLord}** भाव ${prashnaProfile.lagnaLordHouse} (${lagneshPlanet?.rashi || ''} ${lagneshPlanet?.formattedDMS || ''}) में स्थित है।\n` +
    `  - **प्रश्न चंद्र स्पष्ट:** **${prashnaProfile.moonRashi} (${prashnaProfile.moonDMS})** | नक्षत्र: **${prashnaProfile.moonNakshatra} (चरण ${prashnaProfile.moonPada})** — भाव ${moonPlanet?.house || 1} में।\n` +
    `• **३. कार्येश (भाव ${targetHouseNum} - ${prashnaHouse.sign}) एवं KP प्रश्न कस्प निर्णय:**\n` +
    `  - आपके प्रश्न का विचार **भाव ${targetHouseNum}** से होता है जिसके स्वामी (कार्येश) **${prashnaHouse.lord}** प्रश्न कुण्डली के **${prashnaHouse.lordPlacementHouse}वें भाव** (${karyeshPlanet?.rashi || ''} ${karyeshPlanet?.formattedDMS || ''}, नक्षत्र: ${karyeshPlanet?.nakshatra || ''} चरण ${karyeshPlanet?.pada || 1}) में विराजमान हैं।\n` +
    `  - **KP प्रश्न उपनक्षत्र (Sub-Lord):** भाव ${targetHouseNum} का कस्प उपनक्षत्र स्वामी **${prashnaHouse.kpCuspSubLord}** तथा नक्षत्र स्वामी **${prashnaHouse.kpCuspStarLord}** है।\n` +
    `  - **प्रश्न सर्वाष्टकवर्ग बल:** प्रश्न के ${targetHouseNum}वें भाव में **${prashnaSav} बिंदु** तथा एकादश (लाभ/सिद्धि) भाव में **${prashnaProfile.ashtakvargaSummary.houseSav[11] || 30} बिंदु** प्राप्त हो रहे हैं जो कार्य सिद्धि (इत्थशाल योग) की पुष्टि करते हैं।`;

  const pastInsights =
    `• **तात्कालिक ग्रह-दृष्टि संकेत:** प्रश्न लग्नेश **${prashnaProfile.lagnaLord}** एवं चंद्रमा की स्थिति दर्शाती है कि विगत **${windows.pastSpan}** के दौरान आपने इस विषय में गहन प्रयास किया, किंतु गोचरीय अवरोधों से परिणाम अपेक्षा के अनुरूप तेज़ नहीं रहा।\n` +
    `• **वर्तमान मनोदशा:** प्रश्न चंद्र के **${prashnaProfile.moonNakshatra}** नक्षत्र में होने से अब आपके संकल्प में स्पष्टता व दैवीय सहायता जुड़ चुकी है।`;

  const futureTrajectory =
    `• **प्रथम चरण (तात्कालिक १५ से ४५ दिन):** प्रश्न नक्षत्र स्वामी **${moonPlanet?.nakshatraLord || 'गुरु'}** और होरा स्वामी **${horaPlanet}** के प्रभाव से आपके कार्य की प्राथमिक अड़चनें दूर होंगी।\n` +
    `• **मुख्य सिद्धि काल (${windows.nearTimeline}):** कार्येश **${prashnaHouse.lord}** जब गोचर में शुभ अंशों पर आएगा, तब विशेषतः **${windows.peakMonth}** में **${prashnaScore}% सफलता** के साथ आपका कार्य पूर्णता को प्राप्त करेगा।\n` +
    `• **दीर्घकालिक फल (${windows.mediumTimeline}):** लाभेश एवं भाग्येश के सहयोग से इस कार्य से स्थायी यश व आर्थिक समृद्धि प्राप्त होगी।`;

  const notice = `\n\n*(💡 सूक्ष्म परामर्श टिप: यह फलादेश **तात्कालिक प्रश्न-कुण्डली (${prashnaTimeStr})** के सूक्ष्म गणित पर आधारित है। अपनी जन्म-कुण्डली के D-1, D-9, D-10, D-60 व विंशोत्तरी सूक्ष्म दशा हेतु ऊपर दिए **'जन्म विवरण भरें'** बटन से अपनी जन्म तिथि व समय जोड़ें।)*`;

  return `॥ ॐ श्री गणेशाय नमः • तात्कालिक प्रश्न-कुण्डली एवं होरा सूक्ष्म निर्णय ॥

**१. त्वरित फलादेश (Executive Prashna Verdict)**
${executiveSummary}

**२. सूक्ष्म प्रश्न-कुण्डली, होरा, KP कस्प एवं अष्टकवर्ग विश्लेषण**
${dashaAnalysis}

**३. अतीत के दृढ संकेत (Past Planetary Indicators)**
${pastInsights}

**४. भविष्य की सटीक कालावधि (Pinpoint Future Trajectory)**
${futureTrajectory}

**५. सात्विक वैदिक उपाय (Targeted Vedic Upay)**
${topic.shloka}
*शास्त्रीय भावार्थ:* ${topic.shlokaMeaning}

• **कार्येश (${prashnaHouse.lord}) सिद्ध बीज मंत्र:** नित्य प्रातः *${rem.mantra}* (${rem.japaCount})
• **शास्त्रीय दान:** ${rem.daan}
• **दैनिक नियम:** ${rem.habit}

📋 **पारंपरिक ज्योतिषीय उपाय पर्ची (उपाय पत्रक):**
${generateTraditionalUpayParchi(prashnaKundali, panchang).formattedTextBlock}${notice}

---
[अगले प्रश्न]:
• ${topic.followUps[0]}
• ${topic.followUps[1]}
• ${topic.followUps[2]}`;
}
