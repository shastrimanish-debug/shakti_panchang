/**
 * Advanced Classical Astrology Engine:
 * 1. KP System (Krishnamurti Paddhati — Star Lords, Sub Lords, Cusps & Significators)
 * 2. Ashtakvarga Engine (Binnashtakvarga BAV & Sarvashtakvarga SAV Grids)
 * 3. Jaimini Chara Dasha & 7 Chara Karaka System (Atmakaraka, Amatyakaraka, etc.)
 */

import { KundaliData, PlanetPosition } from '../types';
import { RASHIS, NAKSHATRAS } from './astronomy';

// 9 Vimshottari Lords in sequence
export const KP_PLANET_LORDS = [
  'केतु', 'शुक्र', 'सूर्य', 'चंद्र', 'मंगल', 'राहु', 'गुरु', 'शनि', 'बुध'
];

// Vimshottari Dasha years for Sub-Lord proportional division (Total 120)
export const VIMSHOTTARI_YEARS: Record<string, number> = {
  केतु: 7,
  शुक्र: 20,
  सूर्य: 6,
  चंद्र: 10,
  मंगल: 7,
  राहु: 18,
  गुरु: 16,
  शनि: 19,
  बुध: 17,
};

export interface KpPlanetInfo {
  planet: string;
  englishName: string;
  rashi: string;
  rashiNum: number;
  degreeInRashi: number;
  formattedDegree: string;
  house: number;
  signLord: string;
  starLord: string;
  subLord: string;
  subSubLord: string;
}

export interface KpCuspInfo {
  house: number;
  rashi: string;
  degreeInRashi: number;
  formattedDegree: string;
  signLord: string;
  starLord: string;
  subLord: string;
}

export interface KpSignificators {
  planet: string;
  levelA: number[]; // Planets in star of occupants
  levelB: number[]; // Occupants of house
  levelC: number[]; // Planets in star of house lord
  levelD: number[]; // House lord
}

export interface AshtakvargaResult {
  planetBav: Record<string, number[]>; // 7 planets x 12 rashis
  sav: number[]; // Sarvashtakvarga total (12 rashis)
  totalPoints: number; // 337
  strongestRashi: { rashi: string; points: number };
  weakestRashi: { rashi: string; points: number };
}

export interface JaiminiKarakaInfo {
  code: string;
  title: string;
  planet: string;
  degreeInRashi: number;
  formattedDegree: string;
  rashi: string;
  significance: string;
}

export interface JaiminiCharaDashaPeriod {
  rashi: string;
  rashiNum: number;
  years: number;
  startDate: Date;
  endDate: Date;
}

/**
 * Given a total longitude in degrees (0 to 360), calculate KP Star Lord and Sub Lord
 */
export function getKpLords(totalDeg: number): {
  rashi: string;
  rashiNum: number;
  degInRashi: number;
  formattedDeg: string;
  signLord: string;
  starLord: string;
  subLord: string;
  subSubLord: string;
} {
  const normDeg = ((totalDeg % 360) + 360) % 360;
  const rashiNum = Math.floor(normDeg / 30) + 1;
  const rashi = RASHIS[rashiNum - 1] || 'मेष';
  const degInRashi = normDeg % 30;

  const degInt = Math.floor(degInRashi);
  const minInt = Math.floor((degInRashi - degInt) * 60);
  const secInt = Math.round(((degInRashi - degInt) * 60 - minInt) * 60);
  const formattedDeg = `${degInt}° ${minInt}' ${secInt}"`;

  // Rashi Sign Lords
  const SIGN_LORDS = [
    'मंगल', 'शुक्र', 'बुध', 'चंद्र', 'सूर्य', 'बुध',
    'शुक्र', 'मंगल', 'गुरु', 'शनि', 'शनि', 'गुरु'
  ];
  const signLord = SIGN_LORDS[rashiNum - 1];

  // 13° 20' = 13.333333 degrees per nakshatra
  const nakIndex = Math.floor(normDeg / (13 + 1/3));
  const starLord = KP_PLANET_LORDS[nakIndex % 9];

  // Elapsed minutes in current nakshatra (out of 800 minutes)
  const degInNak = normDeg % (13 + 1/3);
  const minInNak = degInNak * 60; // 0 to 800

  // Sub-Lord calculation: Nakshatra lord is the starting sub-lord
  const starStartIdx = KP_PLANET_LORDS.indexOf(starLord);
  let accumMin = 0;
  let subLord = starLord;
  let subSubLord = starLord;

  for (let i = 0; i < 9; i++) {
    const p = KP_PLANET_LORDS[(starStartIdx + i) % 9];
    const subSpanMin = (VIMSHOTTARI_YEARS[p] / 120) * 800; // minutes in sub
    if (minInNak >= accumMin && minInNak < accumMin + subSpanMin) {
      subLord = p;
      
      // Sub-sub lord calculation
      const minInSub = minInNak - accumMin;
      const subSubStartIdx = KP_PLANET_LORDS.indexOf(subLord);
      let subAccumMin = 0;
      for (let j = 0; j < 9; j++) {
        const ssp = KP_PLANET_LORDS[(subSubStartIdx + j) % 9];
        const subSubSpanMin = (VIMSHOTTARI_YEARS[ssp] / 120) * subSpanMin;
        if (minInSub >= subAccumMin && minInSub < subAccumMin + subSubSpanMin) {
          subSubLord = ssp;
          break;
        }
        subAccumMin += subSubSpanMin;
      }
      break;
    }
    accumMin += subSpanMin;
  }

  return {
    rashi,
    rashiNum,
    degInRashi,
    formattedDeg,
    signLord,
    starLord,
    subLord,
    subSubLord,
  };
}

/**
 * Calculate KP Planetary & Cuspal Details for Kundali
 */
export function calculateKpSystem(k: KundaliData): {
  planets: KpPlanetInfo[];
  cusps: KpCuspInfo[];
  significators: KpSignificators[];
} {
  // Planets KP details
  const planets: KpPlanetInfo[] = k.planets.map((p) => {
    const totalDeg = (p.rashiNumber - 1) * 30 + p.degreeInRashi;
    const kp = getKpLords(totalDeg);
    return {
      planet: p.planet,
      englishName: p.englishName,
      rashi: p.rashi,
      rashiNum: p.rashiNumber,
      degreeInRashi: p.degreeInRashi,
      formattedDegree: kp.formattedDeg,
      house: p.house,
      signLord: kp.signLord,
      starLord: kp.starLord,
      subLord: kp.subLord,
      subSubLord: kp.subSubLord,
    };
  });

  // 12 House Cusps
  const lagnaTotalDeg = (k.lagnaRashiNumber - 1) * 30 + k.lagnaDegree;
  const cusps: KpCuspInfo[] = [];

  for (let h = 1; h <= 12; h++) {
    // Equal/Placidus approximation for house cusp longitude
    const cuspTotalDeg = (lagnaTotalDeg + (h - 1) * 30) % 360;
    const kp = getKpLords(cuspTotalDeg);
    cusps.push({
      house: h,
      rashi: kp.rashi,
      degreeInRashi: kp.degInRashi,
      formattedDegree: kp.formattedDeg,
      signLord: kp.signLord,
      starLord: kp.starLord,
      subLord: kp.subLord,
    });
  }

  // KP House & Planet Significators
  const significators: KpSignificators[] = planets.map((p) => {
    const starLordPlanet = planets.find((pl) => pl.planet === p.starLord);
    const starLordHouse = starLordPlanet ? starLordPlanet.house : p.house;

    // Occupants of house starLordHouse
    const houseOccupants = planets
      .filter((pl) => pl.house === p.house)
      .map((pl) => pl.house);

    const levelA = [starLordHouse];
    const levelB = [p.house];
    const levelC = cusps
      .filter((c) => c.signLord === p.starLord)
      .map((c) => c.house);
    const levelD = cusps
      .filter((c) => c.signLord === p.planet)
      .map((c) => c.house);

    return {
      planet: p.planet,
      levelA: Array.from(new Set(levelA)),
      levelB: Array.from(new Set(levelB)),
      levelC: Array.from(new Set(levelC)),
      levelD: Array.from(new Set(levelD)),
    };
  });

  return { planets, cusps, significators };
}

/**
 * Classical Ashtakvarga Engine (Binnashtakvarga BAV & Sarvashtakvarga SAV)
 */
export function calculateAshtakvarga(k: KundaliData): AshtakvargaResult {
  const MAIN_PLANETS = ['सूर्य', 'चंद्र', 'मंगल', 'बुध', 'गुरु', 'शुक्र', 'शनि'];

  // Classical Binnashtakvarga rules matrices
  // Rashi offsets from planet positions where auspicious points (bindus) occur
  const BAV_RULES: Record<string, Record<string, number[]>> = {
    सूर्य: {
      सूर्य: [1, 2, 4, 7, 8, 9, 10, 11],
      चंद्र: [3, 6, 10, 11],
      मंगल: [1, 2, 4, 7, 8, 9, 10, 11],
      बुध: [3, 5, 6, 9, 10, 11, 12],
      गुरु: [5, 6, 9, 11],
      शुक्र: [6, 7, 12],
      शनि: [1, 2, 4, 7, 8, 9, 10, 11],
      लग्न: [3, 4, 6, 10, 11, 12],
    },
    चंद्र: {
      सूर्य: [3, 6, 7, 8, 10, 11],
      चंद्र: [1, 3, 6, 7, 10, 11],
      मंगल: [2, 3, 5, 6, 9, 10, 11],
      बुध: [1, 3, 4, 5, 7, 8, 10, 11],
      गुरु: [1, 4, 7, 8, 10, 11, 12],
      शुक्र: [3, 4, 5, 7, 9, 10, 11],
      शनि: [3, 5, 6, 11],
      लग्न: [3, 6, 10, 11],
    },
    मंगल: {
      सूर्य: [3, 5, 6, 10, 11],
      चंद्र: [3, 6, 11],
      मंगल: [1, 2, 4, 7, 8, 10, 11],
      बुध: [3, 5, 6, 11],
      गुरु: [6, 10, 11, 12],
      शुक्र: [6, 8, 11, 12],
      शनि: [1, 4, 7, 8, 9, 10, 11],
      लग्न: [1, 3, 6, 10, 11],
    },
    बुध: {
      सूर्य: [5, 6, 9, 11, 12],
      चंद्र: [2, 4, 6, 8, 10, 11],
      मंगल: [1, 2, 4, 7, 8, 9, 10, 11],
      बुध: [1, 3, 5, 6, 9, 10, 11, 12],
      गुरु: [6, 8, 11, 12],
      शुक्र: [1, 2, 3, 4, 5, 8, 9, 11],
      शनि: [1, 2, 4, 7, 8, 9, 10, 11],
      लग्न: [1, 2, 4, 6, 8, 10, 11],
    },
    गुरु: {
      सूर्य: [1, 2, 3, 4, 7, 8, 9, 10, 11],
      चंद्र: [2, 5, 7, 9, 11],
      मंगल: [1, 2, 4, 7, 8, 10, 11],
      बुध: [1, 2, 4, 5, 6, 9, 10, 11],
      गुरु: [1, 2, 3, 4, 7, 8, 10, 11],
      शुक्र: [2, 5, 6, 9, 10, 11],
      शनि: [3, 5, 6, 12],
      लग्न: [1, 2, 4, 5, 6, 7, 9, 10, 11],
    },
    शुक्र: {
      सूर्य: [8, 11, 12],
      चंद्र: [1, 2, 3, 4, 5, 8, 9, 11, 12],
      मंगल: [3, 5, 6, 9, 11, 12],
      बुध: [3, 5, 6, 9, 11],
      गुरु: [5, 8, 9, 10, 11],
      शुक्र: [1, 2, 3, 4, 5, 8, 9, 10, 11],
      शनि: [3, 4, 5, 8, 9, 10, 11],
      लग्न: [1, 2, 3, 4, 5, 8, 9, 11],
    },
    शनि: {
      सूर्य: [1, 2, 4, 7, 8, 10, 11],
      चंद्र: [3, 6, 11],
      मंगल: [3, 5, 6, 10, 11, 12],
      बुध: [6, 8, 9, 10, 11, 12],
      गुरु: [5, 6, 11, 12],
      शुक्र: [6, 11, 12],
      शनि: [3, 5, 6, 11],
      लग्न: [1, 3, 4, 6, 10, 11],
    },
  };

  const planetBav: Record<string, number[]> = {};
  const sav: number[] = Array(12).fill(0);

  // Map planet rashi numbers
  const planetRashiMap: Record<string, number> = {};
  k.planets.forEach((p) => {
    planetRashiMap[p.planet] = p.rashiNumber;
  });
  planetRashiMap['लग्न'] = k.lagnaRashiNumber;

  MAIN_PLANETS.forEach((targetPlanet) => {
    const bavPoints = Array(12).fill(0); // Mesha (0) to Meena (11)
    const rules = BAV_RULES[targetPlanet];

    if (rules) {
      Object.keys(rules).forEach((sourcePlanet) => {
        const sourceRashiNum = planetRashiMap[sourcePlanet] || k.lagnaRashiNumber;
        const offsets = rules[sourcePlanet];

        offsets.forEach((offset) => {
          // 1-indexed offset from source rashi
          const targetRashiIdx = (sourceRashiNum - 1 + (offset - 1)) % 12;
          bavPoints[targetRashiIdx] += 1;
        });
      });
    }

    planetBav[targetPlanet] = bavPoints;
    for (let i = 0; i < 12; i++) {
      sav[i] += bavPoints[i];
    }
  });

  // Calculate statistics
  let maxPts = -1;
  let minPts = 999;
  let maxIdx = 0;
  let minIdx = 0;

  sav.forEach((pts, idx) => {
    if (pts > maxPts) {
      maxPts = pts;
      maxIdx = idx;
    }
    if (pts < minPts) {
      minPts = pts;
      minIdx = idx;
    }
  });

  return {
    planetBav,
    sav,
    totalPoints: sav.reduce((a, b) => a + b, 0),
    strongestRashi: { rashi: RASHIS[maxIdx], points: maxPts },
    weakestRashi: { rashi: RASHIS[minIdx], points: minPts },
  };
}

/**
 * Jaimini 7 Chara Karaka Engine
 */
export function calculateJaiminiKarakas(k: KundaliData): {
  karakas: JaiminiKarakaInfo[];
  atmakaraka: JaiminiKarakaInfo;
  amatyakaraka: JaiminiKarakaInfo;
  karakamshaRashi: string;
} {
  const MAIN_PLANETS = ['सूर्य', 'चंद्र', 'मंगल', 'बुध', 'गुरु', 'शुक्र', 'शनि'];

  // Sort 7 planets by degree in rashi descending
  const sortedPlanets = k.planets
    .filter((p) => MAIN_PLANETS.includes(p.planet))
    .sort((a, b) => b.degreeInRashi - a.degreeInRashi);

  const KARAKA_ROLES = [
    { code: 'AK', title: 'आत्मकारक (Atmakaraka)', desc: 'आत्मा, जीवन का मूल उद्देश्य व आत्मिक उन्नति' },
    { code: 'AmK', title: 'अमात्यकारक (Amatyakaraka)', desc: 'करियर, आजीविका, पद, प्रतिष्ठा व बुद्धि' },
    { code: 'BK', title: 'भ्रातृकारक (Bhratrukaraka)', desc: 'सहोदर (भाई-बहन), गुरु, मार्गदर्शक व साहस' },
    { code: 'MK', title: 'मातृकारक (Matrukaraka)', desc: 'माता, गृह सुख, स्थाई संपत्ति व वाहन' },
    { code: 'PK', title: 'पुत्रकारक (Putrakaraka)', desc: 'संतान सुख, उच्च विद्या, बुद्धि व पूर्व पुण्य' },
    { code: 'GK', title: 'ज्ञातिकारक (Gnatikaraka)', desc: 'प्रतिस्पर्धा, रोग, ऋण, शत्रु व संघर्ष' },
    { code: 'DK', title: 'दारकारक (Darakaraka)', desc: 'जीवनसाथी, वैवाहिक सुख, व्यापार व साझेदारी' },
  ];

  const karakas: JaiminiKarakaInfo[] = sortedPlanets.map((p, idx) => {
    const role = KARAKA_ROLES[idx] || KARAKA_ROLES[6];
    const degInt = Math.floor(p.degreeInRashi);
    const minInt = Math.floor((p.degreeInRashi - degInt) * 60);

    return {
      code: role.code,
      title: role.title,
      planet: p.planet,
      degreeInRashi: p.degreeInRashi,
      formattedDegree: `${degInt}° ${minInt}'`,
      rashi: p.rashi,
      significance: role.desc,
    };
  });

  const atmakaraka = karakas[0] || karakas[0];
  const amatyakaraka = karakas[1] || karakas[0];

  // Karakamsha Rashi: Navamsha Rashi of Atmakaraka
  const akTotalDeg = (k.planets.find((p) => p.planet === atmakaraka.planet)?.rashiNumber || 1 - 1) * 30 + atmakaraka.degreeInRashi;
  const d9RashiNum = (Math.floor(akTotalDeg / (30 / 9)) % 12) + 1;
  const karakamshaRashi = RASHIS[d9RashiNum - 1] || k.lagnaRashi;

  return { karakas, atmakaraka, amatyakaraka, karakamshaRashi };
}

/**
 * Jaimini Chara Dasha Periods (12 Rashis Sequence)
 */
export function calculateJaiminiCharaDasha(k: KundaliData): JaiminiCharaDashaPeriod[] {
  const periods: JaiminiCharaDashaPeriod[] = [];
  const birthYear = k.birthDate instanceof Date ? k.birthDate.getFullYear() : new Date(k.birthDate).getFullYear();
  let currentStart = new Date(k.birthDate);

  // Direct vs Odd/Even Lagna direction
  const isDirectLagna = [1, 3, 5, 7, 9, 11].includes(k.lagnaRashiNumber);

  for (let i = 0; i < 12; i++) {
    const rashiIdx = isDirectLagna
      ? (k.lagnaRashiNumber - 1 + i) % 12
      : (k.lagnaRashiNumber - 1 - i + 12) % 12;

    const rashiNum = rashiIdx + 1;
    const rashiName = RASHIS[rashiIdx];

    // Classical Chara Dasha years formula
    // Years = distance from rashi to its lord rashi
    const LORD_RASHI_MAP: Record<number, number> = {
      1: 8, 2: 7, 3: 6, 4: 5, 5: 5, 6: 3,
      7: 2, 8: 1, 9: 12, 10: 11, 11: 10, 12: 9,
    };
    const lordRashiNum = LORD_RASHI_MAP[rashiNum] || rashiNum;
    let dashaYears = (lordRashiNum - rashiNum + 12) % 12;
    if (dashaYears === 0) dashaYears = 12;

    const endDate = new Date(currentStart);
    endDate.setFullYear(endDate.getFullYear() + dashaYears);

    periods.push({
      rashi: rashiName,
      rashiNum,
      years: dashaYears,
      startDate: new Date(currentStart),
      endDate: new Date(endDate),
    });

    currentStart = endDate;
  }

  return periods;
}
