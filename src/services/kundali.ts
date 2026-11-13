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
import { timezoneHoursFor } from './engine/time';
import { searchGlobalCities } from './globalCities';
import { getSyncedNow, getSyncedLocationDateTime } from '../hooks/useUserDateTime';

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
    // 1. Direct YYYY-MM-DD or ISO midnight/noon UTC (e.g. from <input type="date"> or new Date("YYYY-MM-DD"))
    const ymdPrefix = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})(?:$|T00:00:00|T12:00:00)/);
    if (ymdPrefix) {
      return {
        y: parseInt(ymdPrefix[1], 10),
        m: parseInt(ymdPrefix[2], 10) - 1,
        d: parseInt(ymdPrefix[3], 10),
      };
    }
    // 2. Specifically handle legacy IST midnight serialized to UTC (T18:30:00.000Z)
    if (/T18:30:00(?:\.000)?Z$/.test(trimmed)) {
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
    const parsed = new Date(trimmed);
    if (!Number.isNaN(parsed.getTime())) {
      return {
        y: parsed.getFullYear(),
        m: parsed.getMonth(),
        d: parsed.getDate(),
      };
    }
  }
  const dateObj = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(dateObj.getTime())) {
    const now = getSyncedNow();
    return { y: now.getFullYear(), m: now.getMonth(), d: now.getDate() };
  }
  // If Date was created from new Date("YYYY-MM-DD"), its UTC time is exactly 00:00:00.000Z.
  // In Western Hemisphere browsers (USA/Canada), .getDate() would be the previous day!
  if (
    dateObj.getUTCHours() === 0 &&
    dateObj.getUTCMinutes() === 0 &&
    dateObj.getUTCSeconds() === 0 &&
    dateObj.getUTCMilliseconds() === 0
  ) {
    return {
      y: dateObj.getUTCFullYear(),
      m: dateObj.getUTCMonth(),
      d: dateObj.getUTCDate(),
    };
  }
  return {
    y: dateObj.getFullYear(),
    m: dateObj.getMonth(),
    d: dateObj.getDate(),
  };
}

function inferIanaTimezone(lat: number, lon: number, explicitIana?: string): string | null {
  if (explicitIana && explicitIana.includes('/')) return explicitIana;
  // Nepal
  if (lon >= 80 && lon <= 88.5 && lat >= 26.3 && lat <= 30.5) return 'Asia/Kathmandu';
  // India & Sri Lanka
  if (lon >= 67 && lon <= 97.6 && lat >= 5.5 && lat <= 37.6) return 'Asia/Kolkata';
  // USA & Canada
  if (lat >= 24 && lat <= 65 && lon >= -160 && lon <= -52) {
    // Arizona (no DST)
    if (lat >= 31.3 && lat <= 37 && lon >= -114.8 && lon <= -109.05) return 'America/Phoenix';
    if (lon < -114) return 'America/Los_Angeles';
    if (lon < -102) return 'America/Denver';
    if (lon < -85) return 'America/Chicago';
    return 'America/New_York';
  }
  // UK & Ireland
  if (lat >= 50 && lat <= 60 && lon >= -10.5 && lon <= 2) return 'Europe/London';
  // Western & Central Europe
  if (lat >= 35 && lat <= 65 && lon > 2 && lon <= 25) return 'Europe/Berlin';
  // UAE & Oman
  if (lat >= 15 && lat <= 30 && lon >= 51.5 && lon <= 60) return 'Asia/Dubai';
  // Saudi Arabia, Qatar, Kuwait, Bahrain
  if (lat >= 15 && lat <= 33 && lon >= 34 && lon < 51.5) return 'Asia/Riyadh';
  // Singapore & Malaysia
  if (lat >= -10 && lat <= 7 && lon >= 99 && lon <= 120) return 'Asia/Singapore';
  // Japan
  if (lat >= 30 && lat <= 46 && lon >= 128 && lon <= 146) return 'Asia/Tokyo';
  // Australia
  if (lat >= -45 && lat <= -10 && lon >= 110 && lon <= 160) {
    if (lon < 129) return 'Australia/Perth';
    if (lon < 140) return 'Australia/Adelaide';
    if (lat > -29 && lon >= 138) return 'Australia/Brisbane';
    return 'Australia/Sydney';
  }
  // New Zealand
  if (lat >= -50 && lat <= -30 && lon >= 165 && lon <= 180) return 'Pacific/Auckland';
  return null;
}

function getIanaOffsetHours(
  ianaZone: string,
  y: number,
  m: number,
  d: number,
  hours: number,
  minutes: number
): number | null {
  try {
    const approxUtc = Date.UTC(y, m, d, hours, minutes, 0);
    const dtf = new Intl.DateTimeFormat('en-US', {
      timeZone: ianaZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
    let guessUtc = approxUtc;
    for (let pass = 0; pass < 2; pass++) {
      const parts = dtf.formatToParts(new Date(guessUtc));
      const map: Record<string, number> = {};
      for (const p of parts) {
        if (p.type !== 'literal') map[p.type] = parseInt(p.value, 10);
      }
      const hr = map.hour === 24 ? 0 : map.hour;
      const zonedAsUtc = Date.UTC(
        map.year,
        (map.month || 1) - 1,
        map.day || 1,
        hr || 0,
        map.minute || 0,
        map.second || 0
      );
      const offsetMs = zonedAsUtc - guessUtc;
      guessUtc = approxUtc - offsetMs;
    }
    return Math.round(((approxUtc - guessUtc) / 3600000) * 4) / 4;
  } catch {
    return null;
  }
}

export function formatUtcOffsetLabel(tzHours: number): string {
  const sign = tzHours >= 0 ? '+' : '-';
  const abs = Math.abs(tzHours);
  const hh = Math.floor(abs);
  const mm = Math.round((abs - hh) * 60);
  const base = `UTC${sign}${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
  if (tzHours === 5.5) return `${base} (IST)`;
  if (tzHours === 5.75) return `${base} (NPT)`;
  if (tzHours === -4) return `${base} (EDT)`;
  if (tzHours === -5) return `${base} (EST/CDT)`;
  if (tzHours === -6) return `${base} (CST/MDT)`;
  if (tzHours === -7) return `${base} (MST/PDT)`;
  if (tzHours === -8) return `${base} (PST)`;
  if (tzHours === 0) return `${base} (GMT)`;
  if (tzHours === 1) return `${base} (BST/CET)`;
  return base;
}

export function formatCoordLabel(lat: number, lon: number): string {
  const latDir = lat >= 0 ? 'N' : 'S';
  const lonDir = lon >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(2)}°${latDir}, ${Math.abs(lon).toFixed(2)}°${lonDir}`;
}

export function resolveBirthCoordinates(
  birthPlace: string,
  latitude?: number,
  longitude?: number,
  timezoneHours?: number,
  birthMomentHint?: { y: number; m: number; d: number; hours: number; minutes: number } | Date
): { latitude: number; longitude: number; timezoneHours: number; ianaTimeZone?: string } {
  const hasValidCoords =
    typeof latitude === 'number' &&
    typeof longitude === 'number' &&
    !Number.isNaN(latitude) &&
    !Number.isNaN(longitude) &&
    !(Math.abs(latitude) < 0.01 && Math.abs(longitude) < 0.01);

  let matchedIana: string | undefined;
  let resolvedLat = 23.1765;
  let resolvedLon = 75.7885;
  let baseTz: number | undefined =
    typeof timezoneHours === 'number' && !Number.isNaN(timezoneHours) ? timezoneHours : undefined;

  if (birthPlace && birthPlace.trim()) {
    const q = birthPlace.trim().replace(/^[^\p{L}\p{N}]+/u, '').split('(')[0].trim();
    const matches = searchGlobalCities(q, 1);
    if (matches.length > 0) {
      matchedIana = matches[0].timezone;
      if (!hasValidCoords) {
        resolvedLat = matches[0].latitude;
        resolvedLon = matches[0].longitude;
        baseTz = matches[0].timezoneHours;
      }
    }
  }

  if (hasValidCoords) {
    resolvedLat = latitude!;
    resolvedLon = longitude!;
  }

  // If coordinates are outside India/Sri Lanka (67°E..98°E) but baseTz was defaulted to 5.5, recompute!
  const isOutsideIstBelt = resolvedLon < 65 || resolvedLon > 98 || resolvedLat < 5 || resolvedLat > 38;
  if (baseTz === undefined || (isOutsideIstBelt && baseTz === 5.5)) {
    baseTz = timezoneHoursFor(resolvedLat, resolvedLon);
  }

  // Apply exact historical/DST offset for the birth date & time if IANA timezone is known/inferred
  const iana = inferIanaTimezone(resolvedLat, resolvedLon, matchedIana);
  if (iana && birthMomentHint) {
    const hintObj =
      birthMomentHint instanceof Date
        ? {
            y: birthMomentHint.getUTCFullYear(),
            m: birthMomentHint.getUTCMonth(),
            d: birthMomentHint.getUTCDate(),
            hours: birthMomentHint.getUTCHours(),
            minutes: birthMomentHint.getUTCMinutes(),
          }
        : birthMomentHint;
    const dstAwareTz = getIanaOffsetHours(
      iana,
      hintObj.y,
      hintObj.m,
      hintObj.d,
      hintObj.hours,
      hintObj.minutes
    );
    if (dstAwareTz !== null) {
      baseTz = dstAwareTz;
    }
  }

  return {
    latitude: resolvedLat,
    longitude: resolvedLon,
    timezoneHours: baseTz ?? 5.5,
    ianaTimeZone: iana ?? undefined,
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
  timezoneHours?: number,
  gotra?: string
): KundaliData {
  const { hours, minutes, seconds } = parseTimeString(birthTime);
  const { y, m, d } = extractCalendarYMD(birthDate);
  const resolved = resolveBirthCoordinates(birthPlace, latitude, longitude, timezoneHours, {
    y,
    m,
    d,
    hours,
    minutes,
  });
  const safeLat = resolved.latitude;
  const safeLon = resolved.longitude;
  const safeTz = resolved.timezoneHours;

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
  const now = getSyncedNow();

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
    calculatedAt: getSyncedNow(),
    gotra: gotra || 'kashyapa',
  };
}

export function checkManglik(kundali: KundaliData, lang: string = 'hi'): { isManglik: boolean; houses: number[]; note: string } {
  const c = (lang || 'hi').slice(0, 2).toLowerCase();
  const mars = kundali.planets.find((p) => p.planet === 'मंगल');
  if (!mars) {
    return {
      isManglik: false,
      houses: [],
      note: c === 'en' ? 'Mars placement is normal' : c === 'gu' ? 'મંગળની સ્થિતિ સામાન્ય છે' : 'मंगल स्थिति सामान्य',
    };
  }

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
    note =
      c === 'en'
        ? `Mars placed in house(s) ${houses.join(', ')} from Lagna/Moon forms Manglik Yoga.`
        : c === 'gu'
          ? `લગ્ન/ચંદ્રથી ${houses.join(', ')} ભાવમાં મંગળ સ્થિત હોવાથી માંગલિક યોગ.`
          : `लग्न/चंद्र से ${houses.join(', ')} भाव में मंगल स्थित होने से मांगलिक योग।`;
  } else {
    note =
      c === 'en'
        ? 'Horoscope is free from Manglik Dosha.'
        : c === 'gu'
          ? 'માંગલિક દોષ રહિત કુંડળી.'
          : 'मांगलिक दोष रहित कुंडली।';
  }

  return { isManglik, houses, note };
}

import { evaluateKundaliMilan } from './milan';

export function calculateAshtakootMilan(boy: KundaliData, girl: KundaliData, lang: string = 'hi') {
  return evaluateKundaliMilan(boy, girl, lang);
}

export function generatePrashnaKundali(
  question: string,
  latitude: number = 23.1765,
  longitude: number = 75.7885,
  lang: string = 'hi'
): KundaliData {
  const c = (lang || 'hi').slice(0, 2).toLowerCase();
  const placeName = c === 'en' ? 'Current Location' : c === 'gu' ? 'તાત્કાલિક સ્થાન' : 'तात्कालिक स्थान';
  const locNow = getSyncedLocationDateTime({
    name: placeName,
    latitude,
    longitude,
  });
  const prefix = c === 'en' ? 'Prashna' : c === 'gu' ? 'પ્રશ્ન' : 'प्रश्न';
  const fallbackTitle = c === 'en' ? 'Prashna Chart' : c === 'gu' ? 'પ્રશ્ન ચક્ર' : 'प्रश्न चक्र';
  const title = question ? `${prefix}: ${question}` : fallbackTitle;
  return calculateKundali(
    title,
    locNow.localNoonDate,
    locNow.timeStr,
    placeName,
    latitude,
    longitude,
    locNow.timezoneHours
  );
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

const VEDIC_REMEDIES_EN: Record<string, { gemstone: string; devata: string; color: string; remedies: string[] }> = {
  मेष: {
    gemstone: 'Red Coral (Moonga)',
    devata: 'Lord Shri Hanuman Ji',
    color: 'Red & Vermilion',
    remedies: [
      'Recite Hanuman Chalisa on Tuesdays.',
      'Drink water from a copper vessel and offer red flowers.',
      'Donate red lentils (masoor dal) and jaggery.',
    ],
  },
  वृषभ: {
    gemstone: 'Diamond or Opal (Heera)',
    devata: 'Goddess Mahalakshmi Ji',
    color: 'White & Luminous Pearl',
    remedies: [
      'Recite Shri Sukta or Kanakadhara Stotra on Fridays.',
      'Donate white sandalwood, rock sugar, or kheer.',
      'Serve cows and feed them green fodder.',
    ],
  },
  मिथुन: {
    gemstone: 'Emerald (Panna)',
    devata: 'Lord Shri Ganesha Ji',
    color: 'Green',
    remedies: [
      'Offer 21 Durva grass blades to Lord Ganesha on Wednesdays.',
      'Donate green moong lentils or fresh green vegetables.',
      'Offer water daily to a sacred Tulsi plant.',
    ],
  },
  कर्क: {
    gemstone: 'Pearl (Moti)',
    devata: 'Lord Mahadeva Shiva',
    color: 'Milk White',
    remedies: [
      'Perform Abhisheka on Shivalinga with raw milk and water on Mondays.',
      'Offer Arghya and gaze at the Moon on Purnima.',
      'Seek blessings by touching your mother’s feet daily.',
    ],
  },
  सिंह: {
    gemstone: 'Ruby (Manikya)',
    devata: 'Lord Surya Narayana',
    color: 'Saffron & Gold/Orange',
    remedies: [
      'Offer Arghya to the rising Sun using a copper vessel with water, roli, and rice.',
      'Recite Aditya Hridayam Stotra daily.',
      'Respect your father and donate wheat and jaggery.',
    ],
  },
  कन्या: {
    gemstone: 'Emerald (Panna)',
    devata: 'Lord Vishnu & Lord Ganesha',
    color: 'Green & Light Yellow',
    remedies: [
      'Recite Ganapati Atharvashirsha on Wednesdays.',
      'Feed grains to birds and green fodder to cows.',
      'Listen to or recite Vishnu Sahasranama.',
    ],
  },
  तुला: {
    gemstone: 'Diamond or Opal (Heera)',
    devata: 'Maa Durga & Maa Mahalakshmi',
    color: 'White, Pink & Cream',
    remedies: [
      'Serve sweet meals or donate fruits to young girls on Fridays.',
      'Use natural sandalwood and gentle fragrances.',
      'Recite Argala Stotra from Durga Saptashati.',
    ],
  },
  वृश्चिक: {
    gemstone: 'Red Coral (Moonga)',
    devata: 'Lord Kartikeya & Shri Hanuman Ji',
    color: 'Deep Red & Orange',
    remedies: [
      'Offer sindoor and jasmine oil to Hanuman Ji on Tuesdays.',
      'Recite Rinamochaka Mangala Stotra.',
      'Support and maintain harmony with younger siblings.',
    ],
  },
  धनु: {
    gemstone: 'Yellow Sapphire (Pukhraj)',
    devata: 'Lord Shri Hari Vishnu',
    color: 'Yellow',
    remedies: [
      'Donate chana dal, besan sweets, and turmeric on Thursdays.',
      'Water the roots of a banana tree and light a ghee lamp.',
      'Honor gurus, teachers, and learned scholars.',
    ],
  },
  मकर: {
    gemstone: 'Blue Sapphire (Neelam) or Amethyst',
    devata: 'Lord Shanideva & Lord Shiva',
    color: 'Blue & Black',
    remedies: [
      'Light a mustard oil lamp beneath a Peepal tree on Saturday evenings.',
      'Recite Shani Chalisa or Dasharatha-krita Shani Stotra.',
      'Donate black sesame seeds, urad dal, or blankets.',
    ],
  },
  कुंभ: {
    gemstone: 'Blue Sapphire (Neelam) or Amethyst',
    devata: 'Lord Rudra & Lord Shanideva',
    color: 'Sky Blue & Deep Blue',
    remedies: [
      'Perform Chhaya-daan (see reflection in mustard oil in a bowl and donate it) on Saturdays.',
      'Recite Hanuman Bahuka.',
      'Serve laborers and those in need with humility.',
    ],
  },
  मीन: {
    gemstone: 'Yellow Sapphire (Pukhraj)',
    devata: 'Lord Shri Narayana & Dattatreya',
    color: 'Turmeric Yellow & Saffron',
    remedies: [
      'Listen to Satyanarayana Katha or recite Vishnu Sahasranama on Thursdays.',
      'Apply saffron tilak and wear sacred gold ornaments.',
      'Gift books or study materials to deserving students.',
    ],
  },
};

const VEDIC_REMEDIES_GU: Record<string, { gemstone: string; devata: string; color: string; remedies: string[] }> = {
  मेष: {
    gemstone: 'પરવાળું / મૂંગા (Red Coral)',
    devata: 'ભગવાન શ્રી હનુમાનજી',
    color: 'લાલ અને સિંદૂરી',
    remedies: [
      'મંગળવારે હનુમાન ચાલીસાનો પાઠ કરો.',
      'તાંબાના પાત્રમાં જળ પીઓ અને લાલ પુષ્પ અર્પણ કરો.',
      'મસૂર દાળ અને ગોળનું દાન કરો.',
    ],
  },
  वृषभ: {
    gemstone: 'હીરો અથવા ઓપલ (Diamond / Opal)',
    devata: 'ભગવતી મહાલક્ષ્મીજી',
    color: 'શ્વેત અને ચમકીલો',
    remedies: [
      'શુક્રવારે શ્રીસૂક્ત અથવા કનકધારા સ્તોત્રનો પાઠ કરો.',
      'સફેદ ચંદન, સાકર અથવા ખીરનું દાન કરો.',
      'ગૌમાતાની સેવા કરો અને લીલો ચારો ખવડાવો.',
    ],
  },
  मिथुन: {
    gemstone: 'પન્ના (Emerald)',
    devata: 'ભગવાન શ્રી ગણેશજી',
    color: 'લીલો (Green)',
    remedies: [
      'બુધવારે ગણેશજીને ૨૧ દૂર્વા દળ અર્પણ કરો.',
      'મગની દાળ અથવા લીલા શાકભાજીનું દાન કરો.',
      'તુલસીજીના છોડને નિત્ય જળ અર્પણ કરો.',
    ],
  },
  कर्क: {
    gemstone: 'મોતી (Pearl)',
    devata: 'દેવાધિદેવ મહાદેવ શિવ',
    color: 'દૂધિયા સફેદ',
    remedies: [
      'સોમવારે શિવલિંગ પર કાચું દૂધ અને જળથી અભિષેક કરો.',
      'પૂનમના દિવસે ચંદ્ર દર્શન અને અર્ઘ્ય આપો.',
      'માતાજીના ચરણ સ્પર્શ કરી આશીર્વાદ લો.',
    ],
  },
  सिंह: {
    gemstone: 'માણેક (Ruby)',
    devata: 'ભગવાન ભુવન ભાસ્કર સૂર્યનારાયણ',
    color: 'કેસરી અને સોનેરી',
    remedies: [
      'સવારે તાંબાના લોટામાં જળ, રોલી અને અક્ષત નાખી સૂર્યને અર્ઘ્ય આપો.',
      'આદિત્ય હૃદય સ્તોત્રનો નિત્ય પાઠ કરો.',
      'પિતાનું સન્માન કરો અને ઘઉં-ગોળનું દાન કરો.',
    ],
  },
  कन्या: {
    gemstone: 'પન્ના (Emerald)',
    devata: 'ભગવાન શ્રી વિષ્ણુ અને ગણેશજી',
    color: 'લીલો અને આછો પીળો',
    remedies: [
      'બુધવારે ગણપતિ અથર્વશીર્ષનો પાઠ કરો.',
      'પક્ષીઓને ચણ નાખો અને ગાયને લીલો ચારો ખવડાવો.',
      'વિષ્ણુ સહસ્રનામનું શ્રવણ અથવા પાઠ કરો.',
    ],
  },
  तुला: {
    gemstone: 'હીરો અથવા ઓપલ (Diamond / Opal)',
    devata: 'માતા દુર્ગા અને મહાલક્ષ્મી',
    color: 'સફેદ, ગુલાબી અને ક્રીમ',
    remedies: [
      'શુક્રવારે કન્યાઓને મીઠું ભોજન અથવા ફળ દાન કરો.',
      'સુગંધિત અત્તર અને ચંદનનો ઉપયોગ કરો.',
      'દુર્ગા સપ્તશતીનો અર્ગલા સ્તોત્ર પાઠ કરો.',
    ],
  },
  वृश्चिक: {
    gemstone: 'પરવાળું / મૂંગા (Red Coral)',
    devata: 'શ્રી કાર્તિકેય અને હનુમાનજી',
    color: 'ઘેરો લાલ અને નારંગી',
    remedies: [
      'મંગળવારે હનુમાનજીને સિંદૂર અને ચમેલીનું તેલ અર્પણ કરો.',
      'ઋણમોચક મંગળ સ્તોત્રનો પાઠ કરો.',
      'નાના ભાઈઓને સહયોગ કરો.',
    ],
  },
  धनु: {
    gemstone: 'પોખરાજ (Yellow Sapphire)',
    devata: 'ભગવાન શ્રી હરિ વિષ્ણુ',
    color: 'પીળો (Yellow)',
    remedies: [
      'ગુરુવારે ચણાની દાળ, બેસનના લાડુ અને હળદરનું દાન કરો.',
      'કેળાના વૃક્ષના મૂળમાં જળ અર્પણ કરી દીવો પ્રગટાવો.',
      'ગુરુજનો અને બ્રાહ્મણોનો આદર-સત્કાર કરો.',
    ],
  },
  मकर: {
    gemstone: 'નીલમ (Blue Sapphire) અથવા જમુનિયા',
    devata: 'ભગવાન શનિદેવ અને શિવજી',
    color: 'વાદળી અને કાળો',
    remedies: [
      'શનિવારે પીપળાના વૃક્ષ નીચે સરસવના તેલનો દીવો પ્રગટાવો.',
      'શનિ ચાલીસા અથવા દશરથકૃત શનિ સ્તોત્રનો પાઠ કરો.',
      'કાળા તલ, અડદની દાળ અથવા ધાબળાનું દાન કરો.',
    ],
  },
  कुंभ: {
    gemstone: 'નીલમ (Blue Sapphire) અથવા કટૈલા',
    devata: 'ભગવાન રુદ્ર અને શનિદેવ',
    color: 'આસમાની અને ઘેરો વાદળી',
    remedies: [
      'શનિવારે છાયા દાન (વાટકીમાં તેલ લઈ પોતાનો ચહેરો જોઈને દાન) કરો.',
      'હનુમાન બાહુકનો પાઠ કરો.',
      'શ્રમિકો અને જરૂરિયાતમંદોની સેવા કરો.',
    ],
  },
  मीन: {
    gemstone: 'પોખરાજ (Yellow Sapphire)',
    devata: 'ભગવાન શ્રી નારાયણ અને દત્તાત્રેય',
    color: 'હળદર પીળો અને કેસરી',
    remedies: [
      'ગુરુવારે સત્યનારાયણ કથા અથવા વિષ્ણુ સહસ્રનામ પાઠ કરો.',
      'કેસરનું તિલક લગાવો અને સોનાના આભૂષણ ધારણ કરો.',
      'વિદ્યાર્થીઓને પુસ્તકો કે અભ્યાસ સામગ્રી ભેટ આપો.',
    ],
  },
};

export function getVedicRemedies(kundali: KundaliData, lang: string = 'hi') {
  const c = (lang || 'hi').slice(0, 2).toLowerCase();
  const rashi = kundali.moonRashi || 'मेष';
  const hiData = VEDIC_REMEDIES_BY_RASHI[rashi] || VEDIC_REMEDIES_BY_RASHI['मेष'];
  const loc = c === 'en' ? VEDIC_REMEDIES_EN[rashi] || VEDIC_REMEDIES_EN['मेष'] : c === 'gu' ? VEDIC_REMEDIES_GU[rashi] || VEDIC_REMEDIES_GU['मेष'] : null;

  return {
    luckyGemstone: loc ? loc.gemstone : hiData.gemstone,
    ishtaDevata: loc ? loc.devata : hiData.devata,
    luckyColor: loc ? loc.color : hiData.color,
    mantra: hiData.mantra, // Keep authentic Sanskrit mantra verbatim
    remedies: loc ? loc.remedies : hiData.remedies,
  };
}
