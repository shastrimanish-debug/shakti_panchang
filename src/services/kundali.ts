import {
  KundaliData,
  PlanetPosition,
  DashaPeriod,
  AntarDashaPeriod,
  DashaPratyantarPeriod,
  AshtakootItem,
} from '../types';
import {
  RASHIS,
  NAKSHATRAS,
  calculatePlanetPositions,
  calculateLagnaDegree,
} from './astronomy';
import { searchGlobalCities } from './globalCities';

export const DASHA_ORDER = [
  'केतु', 'शुक्र', 'सूर्य', 'चंद्र', 'मंगल', 'राहु', 'गुरु', 'शनि', 'बुध'
];

export const DASHA_YEARS: Record<string, number> = {
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

export const NAKSHATRA_GANAS = [
  'देव', 'मनुष्य', 'राक्षस', 'मनुष्य', 'देव', 'मनुष्य', 'देव', 'देव', 'राक्षस',
  'राक्षस', 'मनुष्य', 'मनुष्य', 'देव', 'राक्षस', 'देव', 'राक्षस', 'देव', 'राक्षस',
  'राक्षस', 'मनुष्य', 'मनुष्य', 'देव', 'राक्षस', 'राक्षस', 'मनुष्य', 'मनुष्य', 'देव'
];

export const NAKSHATRA_YONIS = [
  'अश्व', 'गज', 'मेढ़ा', 'सर्प', 'सर्प', 'श्वान', 'मार्जार', 'मेढ़ा', 'मार्जार',
  'मूषक', 'मूषक', 'गौ', 'महिष', 'व्याघ्र', 'महिष', 'व्याघ्र', 'मृग', 'मृग',
  'श्वान', 'वानर', 'नकुल', 'वानर', 'सिंह', 'अश्व', 'सिंह', 'गौ', 'गज'
];

export const NAKSHATRA_NADIS = [
  'आदि', 'मध्य', 'अन्त्य', 'अन्त्य', 'मध्य', 'आदि', 'आदि', 'मध्य', 'अन्त्य',
  'अन्त्य', 'मध्य', 'आदि', 'आदि', 'मध्य', 'अन्त्य', 'अन्त्य', 'मध्य', 'आदि',
  'आदि', 'मध्य', 'अन्त्य', 'अन्त्य', 'मध्य', 'आदि', 'आदि', 'मध्य', 'अन्त्य'
];

export const RASHI_VASHYAS = [
  'चतुष्पाद', 'चतुष्पाद', 'मानव', 'जलचर', 'वनचर', 'मानव',
  'मानव', 'कीट', 'द्विपद/मानव', 'जलचर', 'मानव', 'जलचर'
];

export function getVarna(rashiIdx: number): string {
  if ([3, 7, 11].includes(rashiIdx)) return 'ब्राह्मण';
  if ([0, 4, 8].includes(rashiIdx)) return 'क्षत्रिय';
  if ([1, 5, 9].includes(rashiIdx)) return 'वैश्य';
  return 'शूद्र';
}

export function parseTimeString(timeStr: string): { hours: number; minutes: number; seconds: number } {
  if (!timeStr || typeof timeStr !== 'string') {
    return { hours: 12, minutes: 0, seconds: 0 };
  }
  let s = timeStr.trim().toUpperCase();
  const isPM = s.includes('PM') || s.includes('पीएम') || s.includes('सायं') || s.includes('दोपहर') || s.includes('रात्रि');
  const isAM = s.includes('AM') || s.includes('एएम') || s.includes('प्रातः') || s.includes('सुबह');
  s = s.replace(/[^0-9:.]/g, '').replace('.', ':');
  const parts = s.split(':').map((p) => parseInt(p, 10) || 0);
  let h = parts[0] ?? 12;
  const m = parts[1] ?? 0;
  const sec = parts[2] ?? 0;
  if (isPM && h < 12) h += 12;
  if (isAM && h === 12) h = 0;
  return {
    hours: Math.min(23, Math.max(0, h)),
    minutes: Math.min(59, Math.max(0, m)),
    seconds: Math.min(59, Math.max(0, sec)),
  };
}

export function toTimeInput24h(timeStr: string): string {
  if (!timeStr || !timeStr.trim()) return '';
  const { hours, minutes } = parseTimeString(timeStr);
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

export function formatTime12h(timeStr: string): string {
  if (!timeStr || !timeStr.trim()) return '';
  const { hours, minutes } = parseTimeString(timeStr);
  const periodEn = hours >= 12 ? 'PM' : 'AM';
  const periodHi = hours < 4 ? 'रात्रि' : hours < 12 ? 'प्रातः' : hours < 16 ? 'दोपहर' : hours < 20 ? 'सायं' : 'रात्रि';
  const h12 = hours % 12 || 12;
  return `${String(h12).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${periodEn} (${periodHi})`;
}

export function extractCalendarYMD(input: Date | string): { y: number; m: number; d: number } {
  if (typeof input === 'string') {
    const trimmed = input.trim();
    const ymdMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (ymdMatch) {
      return {
        y: parseInt(ymdMatch[1], 10),
        m: parseInt(ymdMatch[2], 10) - 1,
        d: parseInt(ymdMatch[3], 10),
      };
    }
    const parsed = new Date(trimmed);
    if (!Number.isNaN(parsed.getTime())) {
      const istAdjusted = new Date(parsed.getTime() + 5.5 * 3600000);
      return {
        y: istAdjusted.getUTCFullYear(),
        m: istAdjusted.getUTCMonth(),
        d: istAdjusted.getUTCDate(),
      };
    }
  }
  const dateObj = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(dateObj.getTime())) {
    const now = new Date();
    return { y: now.getFullYear(), m: now.getMonth(), d: now.getDate() };
  }
  return {
    y: dateObj.getFullYear(),
    m: dateObj.getMonth(),
    d: dateObj.getDate(),
  };
}

export function resolveBirthCoordinates(
  birthPlace: string,
  latitude?: number,
  longitude?: number,
  timezoneHours?: number
): { latitude: number; longitude: number; timezoneHours: number } {
  const hasValidCoords =
    typeof latitude === 'number' &&
    typeof longitude === 'number' &&
    !Number.isNaN(latitude) &&
    !Number.isNaN(longitude) &&
    !(Math.abs(latitude) < 0.01 && Math.abs(longitude) < 0.01);

  if (hasValidCoords) {
    return {
      latitude: latitude!,
      longitude: longitude!,
      timezoneHours:
        typeof timezoneHours === 'number' && !Number.isNaN(timezoneHours) ? timezoneHours : 5.5,
    };
  }

  if (birthPlace && birthPlace.trim()) {
    const q = birthPlace.trim().replace(/^[^\p{L}\p{N}]+/u, '').split('(')[0].trim();
    const matches = searchGlobalCities(q, 1);
    if (matches.length > 0) {
      return {
        latitude: matches[0].latitude,
        longitude: matches[0].longitude,
        timezoneHours: matches[0].timezoneHours ?? 5.5,
      };
    }
  }

  return {
    latitude: 23.1765,
    longitude: 75.7885,
    timezoneHours: 5.5,
  };
}

export function calculatePratyantarPeriods(
  maha: string,
  antar: string,
  startDate: Date,
  endDate: Date
): DashaPratyantarPeriod[] {
  const antarIdx = DASHA_ORDER.indexOf(antar);
  const totalDurationMs = endDate.getTime() - startDate.getTime();
  const periods: DashaPratyantarPeriod[] = [];
  let currentStart = new Date(startDate);

  for (let i = 0; i < 9; i++) {
    const pratyantar = DASHA_ORDER[(antarIdx + i) % 9];
    const weight = (DASHA_YEARS[pratyantar] || 7) / 120.0;
    const duration = totalDurationMs * weight;
    const endMs = i === 8 ? endDate.getTime() : currentStart.getTime() + duration;
    const currentEnd = new Date(endMs);
    const days = (endMs - currentStart.getTime()) / (1000 * 60 * 60 * 24);

    periods.push({
      maha,
      antar,
      pratyantar,
      startDate: new Date(currentStart),
      endDate: currentEnd,
      days: Math.round(days * 10) / 10,
    });
    currentStart = currentEnd;
  }
  return periods;
}

export function calculateKundali(
  name: string,
  birthDate: Date,
  birthTime: string,
  birthPlace: string = 'उज्जैन',
  latitude: number = 23.1765,
  longitude: number = 75.7885,
  timezoneHours: number = 5.5
): KundaliData {
  const resolved = resolveBirthCoordinates(birthPlace, latitude, longitude, timezoneHours);
  const safeLat = resolved.latitude;
  const safeLon = resolved.longitude;
  const safeTz = resolved.timezoneHours;

  const { hours, minutes, seconds } = parseTimeString(birthTime);
  const { y, m, d } = extractCalendarYMD(birthDate);
  const normalizedBirthDate = new Date(y, m, d, 12, 0, 0);
  const normalizedBirthTime = toTimeInput24h(birthTime) || birthTime;

  // UTC moment of birth
  const utcMs = Date.UTC(y, m, d, hours, minutes, seconds) - safeTz * 3600000;
  const birthMoment = new Date(utcMs);

  const planets = calculatePlanetPositions(birthMoment, safeLat, safeLon, safeTz);
  const lagnaDegree = calculateLagnaDegree(birthMoment, safeLat, safeLon, safeTz);
  const lagnaRashiIdx = Math.floor(lagnaDegree / 30) % 12;

  const moon = planets.find((p) => p.planet === 'चंद्र') || planets[1];
  const sun = planets.find((p) => p.planet === 'सूर्य') || planets[0];

  const moonRashiIdx = Math.floor(moon.degree / 30) % 12;
  const nakSpan = 360 / 27;
  const nakIdx = Math.floor(moon.degree / nakSpan) % 27;
  const pada = Math.floor((moon.degree % nakSpan) / (nakSpan / 4)) + 1;

  const varna = getVarna(moonRashiIdx);
  const vashya = RASHI_VASHYAS[moonRashiIdx] || 'मानव';
  const gana = NAKSHATRA_GANAS[nakIdx] || 'देव';
  const yoni = NAKSHATRA_YONIS[nakIdx] || 'अश्व';
  const nadi = NAKSHATRA_NADIS[nakIdx] || 'मध्य';

  // Vimshottari Mahadasha balance
  const lordCycle = DASHA_ORDER;
  const firstDashaLord = lordCycle[nakIdx % 9];
  const dashaIndex = DASHA_ORDER.indexOf(firstDashaLord);
  const nakProgress = (moon.degree % nakSpan) / nakSpan;
  const remainingFraction = 1 - nakProgress;
  const firstDashaYears = (DASHA_YEARS[firstDashaLord] || 7) * remainingFraction;

  const dashaPeriods: DashaPeriod[] = [];
  let dashaPointer = new Date(birthMoment);
  const now = new Date();

  for (let i = 0; i < 9; i++) {
    const planet = DASHA_ORDER[(dashaIndex + i) % 9];
    const durationYears = i === 0 ? firstDashaYears : DASHA_YEARS[planet] || 7;
    const endMs = dashaPointer.getTime() + durationYears * 365.25 * 86400000;
    const endDate = new Date(endMs);

    dashaPeriods.push({
      planet,
      startDate: new Date(dashaPointer),
      endDate,
      years: durationYears,
    });
    dashaPointer = endDate;
  }

  // Antardashas
  const antarPeriods: AntarDashaPeriod[] = [];
  for (const dp of dashaPeriods) {
    const mahaYears = DASHA_YEARS[dp.planet] || 7;
    const mahaIdx = DASHA_ORDER.indexOf(dp.planet);
    let antarPointer = new Date(dp.startDate);

    for (let j = 0; j < 9; j++) {
      const antarPlanet = DASHA_ORDER[(mahaIdx + j) % 9];
      const fraction = (DASHA_YEARS[antarPlanet] || 7) / 120.0;
      const antarYears = mahaYears * fraction;
      const endMs = j === 8 ? dp.endDate.getTime() : antarPointer.getTime() + antarYears * 365.25 * 86400000;
      const endAntar = new Date(endMs);

      antarPeriods.push({
        maha: dp.planet,
        antar: antarPlanet,
        startDate: new Date(antarPointer),
        endDate: endAntar,
        years: antarYears,
      });
      antarPointer = endAntar;
    }
  }

  const currentMaha = dashaPeriods.find((d) => now >= d.startDate && now < d.endDate) || dashaPeriods[0];
  const currentAntar =
    antarPeriods.find((a) => a.maha === currentMaha.planet && now >= a.startDate && now < a.endDate) ||
    antarPeriods[0];
  const pratyantars = calculatePratyantarPeriods(
    currentMaha.planet,
    currentAntar.antar,
    currentAntar.startDate,
    currentAntar.endDate
  );
  const currentPratyantar =
    pratyantars.find((p) => now >= p.startDate && now < p.endDate) || pratyantars[0];

  return {
    name,
    birthDate: normalizedBirthDate,
    birthTime: normalizedBirthTime,
    birthPlace,
    latitude: safeLat,
    longitude: safeLon,
    timezoneHours: safeTz,
    lagnaDegree,
    lagnaRashi: RASHIS[lagnaRashiIdx],
    lagnaRashiNumber: lagnaRashiIdx + 1,
    moonRashi: RASHIS[moonRashiIdx],
    sunRashi: RASHIS[Math.floor(sun.degree / 30) % 12],
    nakshatra: NAKSHATRAS[nakIdx],
    charan: `${pada}`,
    nadi,
    gana,
    yoni,
    varna,
    vashya,
    mahadasha: currentMaha.planet,
    antardasha: currentAntar.antar,
    pratyantardasha: currentPratyantar.pratyantar,
    planets,
    dashaPeriods,
    antarPeriods,
    pratyantarPeriods: pratyantars,
    calculatedAt: new Date(),
  };
}

export function checkManglik(kundali: KundaliData): { isManglik: boolean; houses: number[]; note: string } {
  const mars = kundali.planets.find((p) => p.planet === 'मंगल');
  if (!mars) return { isManglik: false, houses: [], note: 'मंगल स्थिति सामान्य' };

  const manglikHouses = [1, 4, 7, 8, 12];
  const lagnaHouse = mars.house;
  const isLagnaManglik = manglikHouses.includes(lagnaHouse);

  const moon = kundali.planets.find((p) => p.planet === 'चंद्र');
  const moonMarsHouse = moon ? ((mars.rashiNumber - moon.rashiNumber + 12) % 12) + 1 : 1;
  const isMoonManglik = manglikHouses.includes(moonMarsHouse);

  const houses: number[] = [];
  if (isLagnaManglik) houses.push(lagnaHouse);
  if (isMoonManglik && !houses.includes(moonMarsHouse)) houses.push(moonMarsHouse);

  const isManglik = isLagnaManglik || isMoonManglik;
  let note = '';
  if (isManglik) {
    note = `लग्न/चंद्र से ${houses.join(', ')} भाव में मंगल स्थित होने से मांगलिक योग।`;
  } else {
    note = 'मांगलिक दोष रहित कुंडली।';
  }

  return { isManglik, houses, note };
}

import { evaluateKundaliMilan } from './milan';

export function calculateAshtakootMilan(boy: KundaliData, girl: KundaliData) {
  return evaluateKundaliMilan(boy, girl);
}

export function generatePrashnaKundali(
  question: string,
  latitude: number = 23.1765,
  longitude: number = 75.7885
): KundaliData {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', { hour12: false });
  const title = question ? `प्रश्न: ${question}` : 'प्रश्न चक्र';
  return calculateKundali(title, now, timeStr, 'तात्कालिक स्थान', latitude, longitude, 5.5);
}

export const VEDIC_REMEDIES_BY_RASHI: Record<
  string,
  {
    gemstone: string;
    devata: string;
    color: string;
    mantra: string;
    remedies: string[];
  }
> = {
  मेष: {
    gemstone: 'मूंगा (Red Coral)',
    devata: 'भगवान श्री हनुमान जी',
    color: 'लाल एवं सिंदूरी (Red)',
    mantra: 'ॐ क्रां क्रीं क्रौं सः भौमाय नमः',
    remedies: [
      'मंगलवार को हनुमान चालीसा पढ़ें।',
      'तांबे के बर्तन में जल पिएं और लाल पुष्प अर्पित करें।',
      'मसूर दाल एवं गुड़ का दान करें।',
    ],
  },
  वृषभ: {
    gemstone: 'हीरा अथवा ओपल (Diamond / Opal)',
    devata: 'भगवती महालक्ष्मी जी',
    color: 'श्वेत एवं चमकीला',
    mantra: 'ॐ द्रां द्रीं द्रौं सः शुक्राय नमः',
    remedies: [
      'शुक्रवार को श्री सूक्त या कनकधारा स्तोत्र का पाठ करें।',
      'सफेद चंदन, मिश्री अथवा खीर का दान करें।',
      'गौमाता की सेवा करें एवं उन्हें हरा चारा खिलाएं।',
    ],
  },
  मिथुन: {
    gemstone: 'पन्ना (Emerald)',
    devata: 'भगवान श्री गणेश जी',
    color: 'हरा (Green)',
    mantra: 'ॐ ब्रां ब्रीं ब्रौं सः बुधाय नमः',
    remedies: [
      'बुधवार को गणेश जी को 21 दूर्वा दल अर्पित करें।',
      'मूंग दाल या हरी सब्जियों का दान करें।',
      'तुलसी के पौधे में नित्य जल अर्पित करें।',
    ],
  },
  कर्क: {
    gemstone: 'मोती (Pearl)',
    devata: 'देवाधिदेव महादेव शिव',
    color: 'दूधिया सफेद (Milk White)',
    mantra: 'ॐ श्रां श्रीं श्रौं सः चंद्रमसे नमः',
    remedies: [
      'सोमवार को शिवलिंग पर कच्चा दूध एवं जल से अभिषेक करें।',
      'पूर्णिमा के दिन चंद्र दर्शन एवं अर्घ्य दें।',
      'माता जी का चरण स्पर्श कर आशीर्वाद लें।',
    ],
  },
  सिंह: {
    gemstone: 'माणिक्य (Ruby)',
    devata: 'भगवान भुवन भास्कर सूर्य नारायण',
    color: 'केसरिया एवं सुनहरा (Gold/Orange)',
    mantra: 'ॐ ह्रां ह्रीं ह्रौं सः सूर्याय नमः',
    remedies: [
      'प्रातःकाल तांबे के लोटे में जल, रोली व अक्षत डालकर सूर्य को अर्घ्य दें।',
      'आदित्य हृदय स्तोत्र का नित्य पाठ करें।',
      'पिता का सम्मान करें एवं गेहूं-गुड़ का दान करें।',
    ],
  },
  कन्या: {
    gemstone: 'पन्ना (Emerald)',
    devata: 'भगवान श्री विष्णु एवं गणेश जी',
    color: 'हरा व हल्का पीला',
    mantra: 'ॐ बुं बुधाय नमः',
    remedies: [
      'बुधवार को गणेश अथर्वशीर्ष का पाठ करें।',
      'पक्षी को दाना डालें और गाय को हरा चारा खिलाएं।',
      'विष्णु सहस्रनाम का श्रवण या पाठ करें।',
    ],
  },
  तुला: {
    gemstone: 'हीरा अथवा ओपल (Diamond / Opal)',
    devata: 'माता दुर्गा एवं महालक्ष्मी',
    color: 'सफेद, गुलाबी व क्रीम',
    mantra: 'ॐ शुं शुक्राय नमः',
    remedies: [
      'शुक्रवार को कन्याओं को मीठा भोजन अथवा फल दान करें।',
      'सुगंधित इत्र एवं चंदन का प्रयोग करें।',
      'दुर्गा सप्तशती का अर्गला स्तोत्र पाठ करें।',
    ],
  },
  वृश्चिक: {
    gemstone: 'मूंगा (Red Coral)',
    devata: 'श्री कार्तिकेय एवं हनुमान जी',
    color: 'गहरा लाल व नारंगी',
    mantra: 'ॐ अं अंगारकाय नमः',
    remedies: [
      'मंगलवार को हनुमान जी को सिंदूर व चमेली का तेल अर्पित करें।',
      'ऋणमोचक मंगल स्तोत्र का पाठ करें।',
      'छोटे भाइयों का सहयोग करें।',
    ],
  },
  धनु: {
    gemstone: 'पुखराज (Yellow Sapphire)',
    devata: 'भगवान श्री हरि विष्णु',
    color: 'पीला (Yellow)',
    mantra: 'ॐ ग्रां ग्रीं ग्रौं सः गुरवे नमः',
    remedies: [
      'गुरुवार को चने की दाल, बेसन के लड्डू व हल्दी का दान करें।',
      'केले के वृक्ष की जड़ में जल अर्पित करें व दीपक जलाएं।',
      'गुरुजनों एवं ब्राह्मणों का आदर-सत्कार करें।',
    ],
  },
  मकर: {
    gemstone: 'नीलम (Blue Sapphire) अथवा जमुनिया',
    devata: 'भगवान शनिदेव एवं शिव जी',
    color: 'नीला एवं काला',
    mantra: 'ॐ प्रां प्रीं प्रौं सः शनैश्चराय नमः',
    remedies: [
      'शनिवार को पीपल के वृक्ष के नीचे सरसों के तेल का दीपक जलाएं।',
      'शनि चालीसा या दशरथकृत शनि स्तोत्र का पाठ करें।',
      'काले तिल, उड़द दाल अथवा कंबल का दान करें।',
    ],
  },
  कुंभ: {
    gemstone: 'नीलम (Blue Sapphire) अथवा कटैला',
    devata: 'भगवान रुद्र एवं शनिदेव',
    color: 'आसमानी व गहरा नीला',
    mantra: 'ॐ शं शनैश्चराय नमः',
    remedies: [
      'शनिवार को छाया दान (कटोरी में तेल लेकर अपना चेहरा देखकर दान) करें।',
      'हनुमान बाहुक का पाठ करें।',
      'श्रमिकों और जरूरतमंदों की सेवा करें।',
    ],
  },
  मीन: {
    gemstone: 'पुखराज (Yellow Sapphire)',
    devata: 'भगवान श्री नारायण एवं दत्तात्रेय',
    color: 'हल्दी पीला एवं केसरिया',
    mantra: 'ॐ बृं बृहस्पतये नमः',
    remedies: [
      'गुरुवार को सत्यनारायण कथा अथवा विष्णु सहस्रनाम पाठ करें।',
      'केसर का तिलक लगाएं और सोने के आभूषण धारण करें।',
      'विद्यार्थियों को पुस्तकें या अध्ययन सामग्री भेंट करें।',
    ],
  },
};

export function getVedicRemedies(kundali: KundaliData) {
  const rashi = kundali.moonRashi || 'मेष';
  const data = VEDIC_REMEDIES_BY_RASHI[rashi] || VEDIC_REMEDIES_BY_RASHI['मेष'];
  return {
    luckyGemstone: data.gemstone,
    ishtaDevata: data.devata,
    luckyColor: data.color,
    mantra: data.mantra,
    remedies: data.remedies,
  };
}
