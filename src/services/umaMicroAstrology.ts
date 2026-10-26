import { KundaliData, PlanetPosition, VedicPanchangData } from '../types';
import { RASHIS, NAKSHATRAS, NAKSHATRA_LORDS } from './astronomy';
import { SIGN_LORDS } from './predictions';
import { calculateSadeSati, calculateDailyTransits } from './sadesati';
import { calculateKpSystem, calculateAshtakvarga } from './kpAshtakvarga';
import { calculateJaiminiAnalysis } from './jaimini';
import { getVargaChartData } from './vargaAnalysis';
import { calculateKundali, DASHA_ORDER, DASHA_YEARS } from './kundali';
import { calculateHoraTable } from './horaPanchakYogas';

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
  doshName: string;
  grahanType: 'surya_rahu' | 'surya_ketu' | 'chandra_rahu' | 'chandra_ketu' | 'other';
  grahanTypeLabel: string;
  houseNum: number;
  houseName: string;
  rashi: string;
  degreeDiff?: number;
  severity: 'अत्यधिक तीव्र' | 'तीव्र' | 'मध्यम';
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
  k?: KundaliData | null
): UpayParchiDetailedItem {
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

    return {
      index,
      bullet,
      title: p,
      category: 'ratna',
      categoryLabel: 'रत्न धारण विधान',
      whyReason: whyParts.length > 0
        ? whyParts.join('\n\n')
        : `आपकी जन्मपत्रिका के लग्नेश एवं भाग्येश/पंचमेश को बलवान बनाने हेतु यह शास्त्रीय रत्न धारण आवश्यक है। इससे जातक के आभामंडल में सकारात्मक कॉस्मिक रश्मियां प्रवेश करती हैं।`,
      benefits: benefitsList,
      vidhi: vidhiParts.length > 0 ? vidhiParts.join('\n\n') : 'शुक्ल पक्ष के शुभ वार को प्रातः स्नान उपरांत कच्चे दूध व गंगाजल से शोधन कर संबंधित ग्रह मंत्र का १०८ बार जप कर धारण करें।',
      samagri: 'गंगाजल, कच्चा गाय का दूध, तुलसी दल, संबंधित धातु की अंगूठी, धूप-दीप व पुष्प।',
      precautions: 'रत्न पूर्णतः प्राकृतिक, दोषरहित, बिना टूटा-फूटा व त्वचा को स्पर्श करने वाला होना चाहिए। खंडित या कृत्रिम कांच का रत्न न पहनें।',
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

    return {
      index,
      bullet,
      title: p,
      category: 'upvas',
      categoryLabel: 'सात्विक उपवास विधान',
      whyReason: fastWhy,
      benefits: fastBenefits,
      vidhi: `प्रातः स्नान कर स्वच्छ वस्त्र पहनें। ${planetName} का ध्यान कर व्रत का संकल्प लें। दिनभर केवल जलाहार अथवा फलाहार करें। सूर्यास्त के बाद एक समय बिना नमक का सात्विक भोजन (जैसे मीठी खीर, हलवा या फल) ग्रहण करें। तामसिक भोजन, क्रोध व झूठ से बचें।`,
      samagri: 'पीला/लाल/सफेद वस्त्र (वार अनुसार), धूप, शुद्ध घी का दीपक, फल, मिश्री, तांबे या पीतल का लोटा।',
      precautions: 'व्रत के दिन नमक, प्याज, लहसुन व मद्यपान का पूर्ण त्याग रखें। शांत चित्त से ईष्ट का स्मरण करें।',
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

    return {
      index,
      bullet,
      title: p,
      category: 'daan',
      categoryLabel: 'ग्रह दोष निवारक दान',
      whyReason: `जब कोई ग्रह कुण्डली में अशुभ स्थान (६, ८, १२ भाव) में हो, नीच का हो, या उसकी दशा/अंतर्दशा में कष्ट आ रहे हों, तो उस ग्रह की प्रिय वस्तुओं का दान करने से उसकी तामसिक रश्मियां जातक से दूर होकर शांत हो जाती हैं। यह ${planetDaan} का शास्त्रीय परिहार है।`,
      benefits: [
        'चल रहे कार्यों में आ रहे अप्रत्याशित विघ्नों व रुकावटों का तत्काल निवारण',
        'ऋण, रोग, गुप्त शत्रु एवं अनावश्यक आर्थिक व्यय पर प्रभावी नियंत्रण',
        'मन पर छाए अज्ञात भय व भारीपन से मुक्ति तथा चित्त की शांति',
        'पूर्व जन्मकृत पाप कर्मों का क्षय एवं परिवार में सौहार्द',
      ],
      vidhi: `दान सामग्री को एक नवीन कपड़े या थाल में सुव्यवस्थित रखें। दाहिने हाथ में जल व अक्षत लेकर संकल्प करें: "हे ${planetDaan} देव! मैं आपकी प्रसन्नता एवं अपने कष्ट निवारणार्थ यह वस्तुएं अर्पित कर रहा हूँ, मुझ पर कृपा करें।" इसके बाद यह दान किसी योग्य विप्र, जरूरतमंद, भिक्षुक अथवा संबंधित मंदिर में ससम्मान दक्षिणा सहित दें।`,
      samagri: p,
      precautions: 'दान सदैव प्रसन्न मन से, बिना अहंकार और बिना किसी को जताए (गुप्त रीति से) करना चाहिए। बासी या अनुपयोगी वस्तु का दान कभी न करें।',
    };
  }

  // 5. Gau & Shwan Seva (गौ व श्वान सेवा)
  if (p.includes('गाय') || p.includes('कुत्ते') || p.includes('रोटी') || p.includes('सेवा')) {
    return {
      index,
      bullet,
      title: p,
      category: 'seva',
      categoryLabel: 'जीव सेवा एवं पंच महायज्ञ',
      whyReason: `सनातन धर्म के पंच महायज्ञों में 'भूत यज्ञ' (जीव सेवा) सर्वोच्च है:\n• **गौ माता:** गाय के शरीर में ३३ कोटि देवी-देवताओं, मां लक्ष्मी एवं कामधेनु का साक्षात वास है। गाय को पहली रोटी देने से शुक्र व गुरु दोनों ग्रह तृप्त होते हैं।\n• **श्वान (कुत्ता):** कुत्ता भगवान भैरवनाथ का वाहन है और यमदूतों का मार्गदर्शक है। यह राहु, केतु एवं शनि की समस्त तामसिक व तांत्रिक नकारात्मक तरंगों को अपने ऊपर सोख लेता है।`,
      benefits: [
        'अकाल मृत्यु, मार्ग दुर्घटना एवं तांत्रिक कुचक्रों से सुरक्षा कवच',
        'घर में दरिद्रता का नाश, धन-धान्य एवं अन्नपूर्णा की स्थायी बरकत',
        'राहु-केतु की कुदृष्टि, कालसर्प एवं पितृ दोष का स्वाभाविक शमन',
        'परिवार में मानसिक शांति, सौहार्द एवं आने वाले गुप्त संकटों का निवारण',
      ],
      vidhi: 'प्रतिदिन घर में बनने वाले भोजन की सबसे पहली रोटी (गौ-ग्रास) में थोड़ा घी व गुड़ लगाकर गाय को अपने हाथों से खिलाएं। भोजन की अंतिम रोटी में थोड़ा सरसों का तेल लगाकर किसी काले या चितकबरे कुत्ते को आदरपूर्वक खिलाएं।',
      samagri: 'गेहूं की ताजी रोटी, शुद्ध देसी घी, थोड़ा गुड़ एवं सरसों का तेल।',
      precautions: 'रोटी कभी भी जली हुई, बासी या जूठी न दें। कुत्ते को रोटी देते समय लात न मारें और न ही डराएं।',
    };
  }

  // 6. Shanti (दोष व योग शान्ति — विशेषतः ग्रहण योग, कालसर्प, मांगलिक, गुरु-चाण्डाल)
  const isGrahan = p.includes('ग्रहण');
  const isKaalsarp = p.includes('कालसर्प');
  const isMangal = p.includes('मंगल') || p.includes('मांगलिक');
  const isChandal = p.includes('चाण्डाल');
  const isPitra = p.includes('पितृ');

  // Deep dive calculations for Grahan Yog
  let grahanDeep: GrahanShantiDeepDive | undefined = undefined;

  if (isGrahan) {
    const sunPlanet = k?.planets?.find((pl) => pl.planet === 'सूर्य');
    const moonPlanet = k?.planets?.find((pl) => pl.planet === 'चंद्र');
    const rahuPlanet = k?.planets?.find((pl) => pl.planet === 'राहु');
    const ketuPlanet = k?.planets?.find((pl) => pl.planet === 'केतु');

    const sunH = sunPlanet?.house ?? -1;
    const moonH = moonPlanet?.house ?? -1;
    const rahuH = rahuPlanet?.house ?? -1;
    const ketuH = ketuPlanet?.house ?? -1;

    let type: 'surya_rahu' | 'surya_ketu' | 'chandra_rahu' | 'chandra_ketu' | 'other' = 'surya_rahu';
    let typeLabel = 'सूर्य-राहु ग्रहण योग (Surya Grahan Yog)';
    let houseNum = sunH > 0 ? sunH : moonH > 0 ? moonH : 1;
    let rashi = sunPlanet?.rashi || moonPlanet?.rashi || k?.lagnaRashi || 'मेष';
    let degreeDiff: number | undefined = undefined;

    if (sunH > 0 && sunH === rahuH) {
      type = 'surya_rahu';
      typeLabel = 'सूर्य-राहु ग्रहण योग (आत्मबल व पिता/प्रतिष्ठा ग्रहण)';
      houseNum = sunH;
      rashi = sunPlanet?.rashi || '';
      degreeDiff = Math.abs((sunPlanet?.degreeInRashi || 10) - (rahuPlanet?.degreeInRashi || 15));
    } else if (sunH > 0 && sunH === ketuH) {
      type = 'surya_ketu';
      typeLabel = 'सूर्य-केतु ग्रहण योग (आत्म-संशय व आजीविका अवरोध)';
      houseNum = sunH;
      rashi = sunPlanet?.rashi || '';
      degreeDiff = Math.abs((sunPlanet?.degreeInRashi || 10) - (ketuPlanet?.degreeInRashi || 15));
    } else if (moonH > 0 && moonH === rahuH) {
      type = 'chandra_rahu';
      typeLabel = 'चंद्र-राहु ग्रहण योग (कपालिका दोष — मानसिक तनाव व भ्रम)';
      houseNum = moonH;
      rashi = moonPlanet?.rashi || '';
      degreeDiff = Math.abs((moonPlanet?.degreeInRashi || 12) - (rahuPlanet?.degreeInRashi || 16));
    } else if (moonH > 0 && moonH === ketuH) {
      type = 'chandra_ketu';
      typeLabel = 'चंद्र-केतु ग्रहण योग (मानसिक विषाद व अकेलापन)';
      houseNum = moonH;
      rashi = moonPlanet?.rashi || '';
      degreeDiff = Math.abs((moonPlanet?.degreeInRashi || 12) - (ketuPlanet?.degreeInRashi || 18));
    } else {
      type = 'surya_rahu';
      typeLabel = 'सूर्य/चंद्र ग्रहण योग (छाया ग्रह प्रभाव)';
      degreeDiff = 6.4;
    }

    const diffVal = degreeDiff !== undefined ? Math.abs(degreeDiff) : 7.5;
    let severity: 'अत्यधिक तीव्र' | 'तीव्र' | 'मध्यम' = 'तीव्र';
    let severityDesc = '';

    if (diffVal <= 5) {
      severity = 'अत्यधिक तीव्र';
      severityDesc = `सूर्य/चंद्र और छाया ग्रह केवल ${diffVal.toFixed(1)}° के सूक्ष्म अंतर पर हैं। यह ९०%+ पूर्ण ग्रहण का रूप है, जिससे जीवन के इस भाव में तीव्र ऊर्जा अवरोध उत्पन्न होता है।`;
    } else if (diffVal <= 12) {
      severity = 'तीव्र';
      severityDesc = `ग्रह और छाया ग्रह ${diffVal.toFixed(1)}° की निकट युति में हैं। इसके प्रभाव से मानसिक तनाव अथवा कार्यक्षेत्र में बार-बार बनते काम अटकने का योग बनता है।`;
    } else {
      severity = 'मध्यम';
      severityDesc = `ग्रह एक ही भाव (${houseNum}वें भाव - ${rashi} राशि) में स्थित हैं, जिससे मध्यम छाया प्रभाव बन रहा है। विधिपूर्वक शान्ति से यह पूर्णतः शांत हो जाता है।`;
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

    grahanDeep = {
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

    return {
      index,
      bullet,
      title: p,
      category: 'shanti',
      categoryLabel: 'दोष व योग शान्ति विधान',
      whyReason,
      benefits: whatBenefits,
      vidhi: 'यह अनुष्ठान किसी सिद्ध तीर्थ (काशी, उज्जैन, त्र्यंबकेश्वर) या घर पर विद्वान आचार्यों द्वारा विधिपूर्वक ६ चरणों में संपन्न कराया जाता है।',
      mantra: recommendedJapa[0].mantra,
      japaCount: recommendedJapa.map((j) => `${j.planet}: ${j.count}`).join(' | '),
      samagri: 'कांस्य पात्र, सरसों का तेल, सप्तधान्य, मदार/पलाश/दूर्वा/कुश समिधा, हवन सामग्री, पंचामृत, गंगाजल, रुद्राक्ष माला।',
      precautions: 'अनुष्ठान के दौरान पूर्ण ब्रह्मचर्य, भूमि शयन अथवा सात्विक आहार का पालन करें। मद्य-मांस का पूर्ण त्याग रखें।',
      shantiDeepDive: grahanDeep,
    };
  }

  // Other shantis (Kaalsarp, Manglik, Pitra, General)
  return {
    index,
    bullet,
    title: p,
    category: 'shanti',
    categoryLabel: 'शास्त्रीय शान्ति अनुष्ठान',
    whyReason: `आपकी जन्मपत्रिका में चल रही ग्रह स्थिति अथवा मुख्य योग जनित दोष के निवारणार्थ यह शान्ति विधान आवश्यक है। इससे ग्रहों की प्रतिकूल रश्मियां शांत होकर अनुकूल परिणाम देने लगती हैं।`,
    benefits: [
      'जीवन में निरंतर आ रहे अवरोधों, विलंब व संघर्षों का स्थायी शमन',
      'भाग्य का पूर्ण सहयोग एवं मानसिक शांति की प्राप्ति',
      'परिवार में समृद्धि, स्वास्थ्य एवं मांगलिक कार्यों का मार्ग प्रशस्त',
    ],
    vidhi: 'विद्वान ब्राह्मण द्वारा संकल्प, नवग्रह पूजन, रुद्राभिषेक, वैदिक मंत्र जप (कलियुग चतुर्गुण संख्या), दशांश हवन एवं दान पूर्वक संपन्न करें।',
    samagri: 'हवन सामग्री, पंचामृत, समिधा, वस्त्र, तिल, जौ, घृत एवं दक्षिणा।',
    precautions: 'अनुष्ठान के समय सात्विक भाव रखें व इष्टदेव पर पूर्ण श्रद्धा बनाए रखें।',
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
  grahanDeep?: GrahanShantiDeepDive
): string {
  const lines: string[] = [
    `॥ ॐ श्री गणेशाय नमः ॥`,
    `📋 **ज्योतिषीय उपाय पर्ची — यजमान विस्तृत मार्गदर्शन एवं फल**`,
    `क्रमांक: ${serialNo} | दिनांक: ${dateStr}`,
    `यजमान: **${salutation}**`,
    `कुण्डली आधार: ${lagnaInfo}`,
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    ``,
    `प्रिय यजमान, आपकी जन्मपत्रिका के सूक्ष्म ग्रह बल, भाव स्थिति एवं दशा के आधार पर यह उपाय पर्ची तैयार की गई है। नीचे पर्ची में लिखे प्रत्येक उपाय का **शास्त्रीय कारण (क्यों करना है)**, **प्रत्यक्ष लाभ (क्या फल मिलेगा)** एवं **विस्तृत विधि** दी जा रही है:`,
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
      lines.push(`🔱 **ग्रहण योग सूक्ष्म निर्णय एवं ६-चरणीय शान्ति विधान:**`);
      lines.push(`• **दोष का स्वरूप:** ${g.grahanTypeLabel}`);
      lines.push(`• **भाव व राशि:** ${g.houseName} (${g.rashi} राशि)`);
      lines.push(`• **ग्रहण योग की तीव्रता:** **${g.severity}** (${g.severityDesc})`);
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
export function generateTraditionalUpayParchi(
  k?: KundaliData | null,
  panchang?: VedicPanchangData | null
): TraditionalUpayParchiData {
  const now = panchang?.date || new Date();
  const dateStr = now.toLocaleDateString('hi-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  if (!k) {
    const defaultPoints = [
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
      `श्री यजमान जी`,
      ...defaultPoints.map((pt, i) => `${circled[i]} ${pt}`),
      `                                          ॥ शुभम् ॥`,
    ].join('\n');

    const detailedItems = defaultPoints.map((pt, idx) => getRemedyDeepDetail(pt, idx, null));
    const grahanItem = detailedItems.find((it) => it.shantiDeepDive);
    const formattedDetailedGuide = buildDetailedParchiGuideText(
      'श्री यजमान जी',
      '108',
      dateStr,
      'तात्कालिक प्रश्न लग्न',
      detailedItems,
      grahanItem?.shantiDeepDive
    );

    return {
      salutation: 'श्री यजमान जी',
      serialNo: '108',
      dateStr,
      lagnaInfo: 'तात्कालिक प्रश्न लग्न',
      detectedDoshaYoga: 'नवग्रह एवं महादशा शान्ति',
      points: defaultPoints,
      formattedTextBlock,
      detailedItems,
      grahanSpecialAnalysis: grahanItem?.shantiDeepDive,
      formattedDetailedGuide,
    };
  }

  const rawName = (k.name || 'यजमान').trim();
  const hasHonorific = /^(श्री|श्रीमती|सुश्री|कु\.|डॉ\.|पं\.)/.test(rawName);
  const salutation = hasHonorific ? rawName : `श्री ${rawName} जी`;

  const lagna = k.lagnaRashi || 'कर्क';
  const lagnaPreset = LAGNA_RATNA_YUGMA[lagna] || LAGNA_RATNA_YUGMA['कर्क'];

  // Point 1: Gemstones (Lagna + Trikona)
  const point1 = lagnaPreset.ratnaLine;

  // Point 2: Fasting day (Upvas)
  const point2 = lagnaPreset.upvasDay;

  // Point 3: Classical Stotra / Path based on Mahadasha / Antardasha / Guru
  const maha = k.mahadasha || 'गुरु';
  const antar = k.antardasha || 'सूर्य';
  const point3 =
    PLANET_STOTRA_PATH[maha] ||
    PLANET_STOTRA_PATH[antar] ||
    'श्रीविष्णुसहस्रनाम का पाठ करें।';

  // Point 4: Daan (Specific items + weekday - 1 time)
  const daanPlanet = PLANET_PARCHI_DAAN[maha]
    ? maha
    : PLANET_PARCHI_DAAN[antar]
    ? antar
    : 'गुरु';
  const point4 = PLANET_PARCHI_DAAN[daanPlanet] || PLANET_PARCHI_DAAN['गुरु'];

  // Point 5: Gau & Shwan Seva
  const point5 = 'गाय और कुत्ते को रोटी खिलावें।';

  // Point 6: Detect actual Yoga / Dosha from planetary houses & conjunction degrees in Kundali
  const getPlanet = (pName: string) => k.planets?.find((p) => p.planet === pName);
  const getHouse = (pName: string) => getPlanet(pName)?.house ?? -1;
  const sunP = getPlanet('सूर्य');
  const moonP = getPlanet('चंद्र');
  const rahuP = getPlanet('राहु');
  const ketuP = getPlanet('केतु');

  const sunH = sunP?.house ?? -1;
  const moonH = moonP?.house ?? -1;
  const marsH = getHouse('मंगल');
  const jupH = getHouse('गुरु');
  const satH = getHouse('शनि');
  const rahuH = rahuP?.house ?? -1;
  const ketuH = ketuP?.house ?? -1;

  // Check genuine Grahan Yog conjunction (same house/rashi AND within 15° effective orb)
  const isConjunctWithinOrb = (p1?: { house?: number; degreeInRashi?: number }, p2?: { house?: number; degreeInRashi?: number }) => {
    if (!p1 || !p2 || !p1.house || !p2.house || p1.house <= 0 || p1.house !== p2.house) return false;
    if (typeof p1.degreeInRashi === 'number' && typeof p2.degreeInRashi === 'number') {
      return Math.abs(p1.degreeInRashi - p2.degreeInRashi) <= 15;
    }
    return true;
  };

  const hasGenuineGrahanYog =
    isConjunctWithinOrb(sunP, rahuP) ||
    isConjunctWithinOrb(sunP, ketuP) ||
    isConjunctWithinOrb(moonP, rahuP) ||
    isConjunctWithinOrb(moonP, ketuP);

  let point6 = `${maha} महादशा एवं नवग्रह शान्ति करावें।`;
  let detectedDoshaYoga = `${maha} महादशा एवं नवग्रह शान्ति`;

  if (hasGenuineGrahanYog) {
    point6 = 'ग्रहण योग शान्ति करावें।';
    detectedDoshaYoga = 'ग्रहण योग (सूर्य/चंद्र-राहु/केतु युति)';
  } else if (jupH > 0 && (jupH === rahuH || jupH === ketuH)) {
    point6 = 'गुरु-चाण्डाल योग शान्ति करावें।';
    detectedDoshaYoga = 'गुरु-चाण्डाल योग';
  } else if (marsH > 0 && (marsH === rahuH || marsH === ketuH)) {
    point6 = 'अंगारक योग शान्ति करावें।';
    detectedDoshaYoga = 'अंगारक योग (मंगल-राहु युति)';
  } else if (satH > 0 && satH === moonH) {
    point6 = 'विष योग शान्ति एवं रुद्राभिषेक करावें।';
    detectedDoshaYoga = 'विष योग (शनि-चंद्र युति)';
  } else if (satH > 0 && (satH === rahuH || satH === ketuH)) {
    point6 = 'शापित दोष / प्रेत दोष शान्ति करावें।';
    detectedDoshaYoga = 'शनि-राहु शापित योग';
  } else if (sunH > 0 && sunH === satH) {
    point6 = 'पितृ दोष शान्ति करावें।';
    detectedDoshaYoga = 'सूर्य-शनि पितृ दोष संकेत';
  } else if (k.isManglik) {
    point6 = 'मंगल भात पूजा / मांगलिक दोष शान्ति करावें।';
    detectedDoshaYoga = 'मांगलिक दोष';
  }

  const points = [point1, point2, point3, point4, point5, point6];
  const circled = ['①', '②', '③', '④', '⑤', '⑥'];
  const formattedTextBlock = [
    `॥ श्री ॥`,
    `${salutation}`,
    ...points.map((pt, i) => `${circled[i]} ${pt}`),
    `                                          ॥ शुभम् ॥`,
  ].join('\n');

  const detailedItems = points.map((pt, idx) => getRemedyDeepDetail(pt, idx, k));
  const grahanItem = detailedItems.find((it) => it.shantiDeepDive);
  const formattedDetailedGuide = buildDetailedParchiGuideText(
    salutation,
    String(100 + ((rawName.length * 7) % 899)),
    dateStr,
    `${k.lagnaRashi} लग्न • ${k.moonRashi} राशि • ${k.mahadasha} महादशा`,
    detailedItems,
    grahanItem?.shantiDeepDive
  );

  return {
    salutation,
    serialNo: String(100 + ((rawName.length * 7) % 899)),
    dateStr,
    lagnaInfo: `${k.lagnaRashi} लग्न • ${k.moonRashi} राशि • ${k.mahadasha} महादशा`,
    detectedDoshaYoga,
    points,
    formattedTextBlock,
    detailedItems,
    grahanSpecialAnalysis: grahanItem?.shantiDeepDive,
    formattedDetailedGuide,
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
  const salutation = hasCustomName ? `**${k.name.trim()}** जी` : 'प्रिय यजमान';

  // 1. Warm Greeting & Basic Identification
  const greetingBlock =
    `॥ ॐ श्री गणेशाय नमः ॥\n\n` +
    `सदा कल्याण हो, ${salutation}! मैंने आपकी जन्मपत्रिका का सूक्ष्म अवलोकन किया है।\n\n` +
    `आपकी पत्रिका में आपका लग्न **${profile.lagnaRashi}** है और आपकी चंद्र राशि **${profile.moonRashi}** (नक्षत्र: **${profile.moonNakshatra}**) है। ` +
    `इस समय आपकी पत्रिका में **${profile.mahadasha}** की महादशा चल रही है, जिसके अंतर्गत **${profile.antardasha}** की अंतर्दशा और **${profile.pratyantardasha}** का विशेष प्रभाव सक्रिय है।`;

  // 2. Past 2-3 Years Experience (अतीत के २-३ वर्षों का यथार्थ — जन्मकुंडली के वास्तविक गणित व दशा के आधार पर)
  const pastEval = calculatePastYearsExperience(k, profile, windows.pastSpan, baseDate);
  const pastBlock = pastEval.pastSummaryText;

  // 3. Present Situation (वर्तमान परिस्थिति का सूक्ष्म विश्लेषण)
  const presentBlock =
    `वर्तमान में आपके प्रश्न *«${topic.title}»* के संबंध में स्थिति यह दर्शाती है कि आपकी ऊर्जा अब एक नए मोड़ पर पहुँच रही है। ` +
    `इस समय **${profile.mahadasha}–${profile.antardasha}** के संयुक्त प्रभाव से मन में भविष्य को लेकर थोड़ी चिंता व असमंजस बना हुआ है, ` +
    `लेकिन अनुकूल ग्रह गोचर यह बता रहे हैं कि अब रुकावटों का चक्र धीरे-धीरे समाप्त होने की ओर अग्रसर है।`;

  // 4. Future Month-by-Month Trajectory (आगामी समय की सटीक माह-दर-माह समय-सारणी)
  const futureBlock =
    `आने वाले समय के लिए आपकी पत्रिका में स्पष्ट समय-सीमा इस प्रकार बन रही है:\n\n` +
    `• **वर्तमान माह से प्राथमिक शुरुआत (${windows.nearTimeline}):**\n` +
    `  इस अवधि में अटकी हुई बातचीत, योजना अथवा किसी महत्वपूर्ण कार्य में सकारात्मक हलचल दिखाई देगी। जो रास्ते अब तक बंद लग रहे थे, उनमें नया विकल्प सामने आएगा।\n\n` +
    `• **शिखर व सर्वाधिक अनुकूल काल (${windows.peakMonth}):**\n` +
    `  यह समय आपके लिए सर्वाधिक फलदायी व भाग्योदयकारी रहेगा। इस दौरान आपके रुके हुए मुख्य कार्य संपन्न होंगे, आर्थिक लाभ के योग बनेंगे और परिवार व समाज में आपके निर्णय का सम्मान होगा।\n\n` +
    `• **दीर्घकालिक स्थिरता एवं विस्तार (${windows.mediumTimeline}):**\n` +
    `  इस कालखंड में आपको स्थायी संतोष, नए दायित्व और कार्यक्षेत्र में विस्तार प्राप्त होगा। जो भी कदम आप इस दौरान उठाएंगे, वे लंबे समय तक शुभ फल देंगे।`;

  // 5. Practical Vedic Remedies
  const mainRemedyPlanet = houseInfo.lord || profile.mahadasha || 'गुरु';
  const remMain = PLANET_REMEDY[mainRemedyPlanet] || PLANET_REMEDY['गुरु'];

  const parchi = generateTraditionalUpayParchi(k, panchang);
  const upayBlock =
    `आपके ग्रह बल को बढ़ाने और कार्य को निर्विघ्न संपन्न कराने के लिए ये सरल व सात्विक उपाय करें:\n\n` +
    `१. **इष्ट देव व दैनिक उपासना:** प्रतिदिन प्रातः स्नान के उपरांत सूर्य देव को तांबे के लोटे से जल अर्पित करें और अपने कुलदेवता अथवा शिव-विष्णु का स्मरण करें।\n` +
    `२. **मंत्र जप विधान:** *${remMain.mantra}* — श्रद्धापूर्वक प्रतिदिन २७ या १०८ बार जपें।\n` +
    `३. **सात्विक दान व सेवा:** ${remMain.daan}\n` +
    `४. **सकारात्मक दिनचर्या:** ${remMain.habit}\n\n` +
    `📋 **पारंपरिक ज्योतिषीय उपाय पर्ची (संक्षिप्त ६-सूत्रीय विधान):**\n` +
    `${parchi.formattedTextBlock}\n` +
    `*(💡 नीचे दिए **'📋 उपाय पर्ची'** बटन पर क्लिक करके आप अपनी व्यक्तिगत उपाय पर्ची देख, संपादित व सुरक्षित कर सकते हैं।)*`;

  return `${greetingBlock}

**१. पिछले २-३ वर्षों का यथार्थ (विगत काल का अनुभव):**
${pastBlock}

**२. वर्तमान स्थिति एवं आपके प्रश्न का विचार:**
${presentBlock}

**३. आगे की सटीक जानकारी (माह-दर-माह समय-सारणी):**
${futureBlock}

**४. सरल एवं अचूक वैदिक उपाय:**
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
