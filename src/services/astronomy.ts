import * as Astronomy from 'astronomy-engine';
import { VedicPanchangData, SolarTimes, PlanetPosition } from '../types';

export const RASHIS = [
  'मेष', 'वृषभ', 'मिथुन', 'कर्क',
  'सिंह', 'कन्या', 'तुला', 'वृश्चिक',
  'धनु', 'मकर', 'कुंभ', 'मीन'
];

export const NAKSHATRAS = [
  'अश्विनी', 'भरणी', 'कृत्तिका', 'रोहिणी', 'मृगशीर्ष', 'आर्द्रा',
  'पुनर्वसु', 'पुष्य', 'आश्लेषा', 'मघा', 'पूर्वा फाल्गुनी', 'उत्तरा फाल्गुनी',
  'हस्त', 'चित्रा', 'स्वाती', 'विशाखा', 'अनुराधा', 'ज्येष्ठा',
  'मूल', 'पूर्वाषाढ़ा', 'उत्तराषाढ़ा', 'श्रवण', 'धनिष्ठा', 'शतभिषा',
  'पूर्वाभाद्रपद', 'उत्तराभाद्रपद', 'रेवती'
];

export const NAKSHATRA_LORDS = [
  'केतु', 'शुक्र', 'सूर्य', 'चंद्र', 'मंगल', 'राहु', 'गुरु', 'शनि', 'बुध'
];

export const YOGAS = [
  'विष्कम्भ', 'प्रीति', 'आयुष्मान', 'सौभाग्य', 'शोभन', 'अतिगण्ड',
  'सुकर्मा', 'धृति', 'शूल', 'गण्ड', 'वृद्धि', 'ध्रुव',
  'व्याघात', 'हर्षण', 'वज्र', 'सिद्धि', 'व्यतीपात', 'वरीयान',
  'परिघ', 'शिव', 'सिद्ध', 'साध्य', 'शुभ', 'शुक्ल',
  'ब्रह्म', 'इन्द्र', 'वैधृति'
];

export const TITHIS = [
  'प्रतिपदा', 'द्वितीया', 'तृतीया', 'चतुर्थी', 'पंचमी', 'षष्ठी',
  'सप्तमी', 'अष्टमी', 'नवमी', 'दशमी', 'एकादशी', 'द्वादशी',
  'त्रयोदशी', 'चतुर्दशी', 'पूर्णिमा'
];

export const KARANAS = [
  'बव', 'बालव', 'कौलव', 'तैतिल', 'गर', 'वणिज', 'विष्टि (भद्रा)'
];

export const WEEKDAYS = [
  'रविवार', 'सोमवार', 'मंगलवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'
];

export const MASAS = [
  'चैत्र', 'वैशाख', 'ज्येष्ठ', 'आषाढ़', 'श्रावण', 'भाद्रपद',
  'अश्विन', 'कार्तिक', 'मार्गशीर्ष', 'पौष', 'माघ', 'फाल्गुन'
];

export function degToRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

export function radToDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}

export function normalize360(deg: number): number {
  let n = deg % 360;
  if (n < 0) n += 360;
  return n;
}

/**
 * Julian Day from Date object
 */
export function getJulianDay(date: Date): number {
  return date.getTime() / 86400000 + 2440587.5;
}

/**
 * Standard Lahiri / Chitra Paksha Ayanamsha in degrees
 */
export function getLahiriAyanamsha(jd: number): number {
  const t = (jd - 2451545.0) / 36525.0;
  return 23.856 + 1.3969 * t + 0.0003 * t * t;
}

/**
 * Approximate solar event calculation (sunrise, sunset)
 */
function calculateSolarEvent(date: Date, lat: number, lon: number, isSunrise: boolean): Date {
  const startOfYear = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const dayOfYear = Math.floor((date.getTime() - startOfYear.getTime()) / 86400000) + 1;
  const lngHour = lon / 15.0;
  const t = dayOfYear + ((isSunrise ? 6 : 18) - lngHour) / 24.0;
  const M = 0.9856 * t - 3.289;
  const L = normalize360(M + 1.916 * Math.sin(degToRad(M)) + 0.02 * Math.sin(degToRad(2 * M)) + 282.634);
  let RA = radToDeg(Math.atan(0.91764 * Math.tan(degToRad(L))));
  RA = normalize360(RA);
  const Lquadrant = Math.floor(L / 90) * 90;
  const RAquadrant = Math.floor(RA / 90) * 90;
  RA += (Lquadrant - RAquadrant);
  RA /= 15.0;

  const sinDec = 0.39782 * Math.sin(degToRad(L));
  const cosDec = Math.cos(Math.asin(sinDec));
  const cosH = (Math.cos(degToRad(90.833)) - sinDec * Math.sin(degToRad(lat))) / (cosDec * Math.cos(degToRad(lat)));

  if (cosH > 1 || cosH < -1) {
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), isSunrise ? 0 : 12));
  }

  let H = isSunrise ? (360.0 - radToDeg(Math.acos(cosH))) : radToDeg(Math.acos(cosH));
  H /= 15.0;
  let T = (H + RA - 0.06571 * t - 6.622 - lngHour) % 24.0;
  if (T < 0) T += 24.0;
  const minute = Math.round(T * 60);
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, minute));
}

/**
 * Calculate Vedic solar times for a given date and location
 */
export function calculateSolarTimes(date: Date, lat: number, lon: number, tzHours: number = 5.5): SolarTimes {
  const y = date.getFullYear();
  const m = date.getMonth();
  const d = date.getDate();

  const baseUtc = new Date(Date.UTC(y, m, d));
  const rawSunrise = calculateSolarEvent(baseUtc, lat, lon, true);
  const rawSunset = calculateSolarEvent(baseUtc, lat, lon, false);

  const nextBaseUtc = new Date(Date.UTC(y, m, d + 1));
  const rawNextSunrise = calculateSolarEvent(nextBaseUtc, lat, lon, true);

  const tzOffsetMs = tzHours * 60 * 60 * 1000;
  const sunrise = new Date(rawSunrise.getTime() + tzOffsetMs);
  const sunset = new Date(rawSunset.getTime() + tzOffsetMs);
  const nextSunrise = new Date(rawNextSunrise.getTime() + tzOffsetMs);
  const solarNoon = new Date(sunrise.getTime() + (sunset.getTime() - sunrise.getTime()) / 2);

  return { sunrise, sunset, nextSunrise, solarNoon };
}

/**
 * Returns Sidereal Sun and Moon longitudes and Lahiri ayanamsha
 */
export function getSunMoonSidereal(date: Date): { sunSidereal: number; moonSidereal: number; ayanamsa: number } {
  const jd = getJulianDay(date);
  const t = (jd - 2451545.0) / 36525.0;
  const ayanamsa = getLahiriAyanamsha(jd);

  // Mean sun
  const L0 = 280.46646 + 36000.76983 * t + 0.0003032 * t * t;
  const M_sun = 357.52911 + 35999.05029 * t - 0.0001537 * t * t;
  const C = (1.914602 - 0.004817 * t - 0.000014 * t * t) * Math.sin(degToRad(M_sun))
    + (0.019993 - 0.000101 * t) * Math.sin(degToRad(2 * M_sun))
    + 0.000289 * Math.sin(degToRad(3 * M_sun));
  const sunTrue = normalize360(L0 + C);
  const sunSidereal = normalize360(sunTrue - ayanamsa);

  // Moon perturbations
  const L_moon = 218.3164477 + 481267.88123421 * t - 0.0015786 * t * t;
  const D_moon = 297.8501921 + 445267.1114034 * t - 0.0018819 * t * t;
  const M_moon = 134.9633964 + 477198.8675055 * t + 0.0087414 * t * t;
  const F_moon = 93.272095 + 483202.0175233 * t - 0.0036539 * t * t;

  let moonLon = L_moon
    + 6.288774 * Math.sin(degToRad(M_moon))
    + 1.274027 * Math.sin(degToRad(2 * D_moon - M_moon))
    + 0.658314 * Math.sin(degToRad(2 * D_moon))
    + 0.213618 * Math.sin(degToRad(2 * M_moon))
    - 0.185116 * Math.sin(degToRad(M_sun))
    - 0.114332 * Math.sin(degToRad(2 * F_moon))
    + 0.058793 * Math.sin(degToRad(2 * D_moon - 2 * M_moon))
    + 0.057066 * Math.sin(degToRad(2 * D_moon - M_sun - M_moon))
    + 0.053320 * Math.sin(degToRad(2 * D_moon + M_moon))
    + 0.045758 * Math.sin(degToRad(2 * D_moon - M_sun))
    - 0.040923 * Math.sin(degToRad(M_sun - M_moon))
    - 0.034720 * Math.sin(degToRad(D_moon));

  moonLon = normalize360(moonLon);
  const moonSidereal = normalize360(moonLon - ayanamsa);

  return { sunSidereal, moonSidereal, ayanamsa };
}

/**
 * Calculates Lagna (Ascendant) Sidereal Degree
 */
export function calculateLagnaDegree(date: Date, lat: number, lon: number, tzHours: number = 5.5): number {
  const jd = getJulianDay(date);
  const t = (jd - 2451545.0) / 36525.0;
  const ayanamsa = getLahiriAyanamsha(jd);

  const astroTime = Astronomy.MakeTime(date);
  const gmstHours = Astronomy.SiderealTime(astroTime);
  const ramc = normalize360(gmstHours * 15.0 + lon);
  const eps = 23.4392911 - 0.0130042 * t;

  const cosRAMC = Math.cos(degToRad(ramc));
  const sinRAMC = Math.sin(degToRad(ramc));
  const tanLat = Math.tan(degToRad(lat));
  const cosEps = Math.cos(degToRad(eps));
  const sinEps = Math.sin(degToRad(eps));

  const y = cosRAMC;
  const x = -(sinRAMC * cosEps + tanLat * sinEps);

  const tropicalAsc = normalize360(radToDeg(Math.atan2(y, x)));
  return normalize360(tropicalAsc - ayanamsa);
}

/**
 * Calculates accurate planetary positions (including Rahu and Ketu) using astronomy-engine
 */
export function calculatePlanetPositions(
  date: Date,
  lat: number,
  lon: number,
  tzHours: number = 5.5
): PlanetPosition[] {
  const jd = getJulianDay(date);
  const t = (jd - 2451545.0) / 36525.0;
  const ayanamsa = getLahiriAyanamsha(jd);
  const lagnaDegree = calculateLagnaDegree(date, lat, lon, tzHours);
  const lagnaRashiIdx = Math.floor(lagnaDegree / 30) % 12;

  const bodies = [
    { name: 'सूर्य', en: 'Sun', body: Astronomy.Body.Sun },
    { name: 'चंद्र', en: 'Moon', body: Astronomy.Body.Moon },
    { name: 'मंगल', en: 'Mars', body: Astronomy.Body.Mars },
    { name: 'बुध', en: 'Mercury', body: Astronomy.Body.Mercury },
    { name: 'गुरु', en: 'Jupiter', body: Astronomy.Body.Jupiter },
    { name: 'शुक्र', en: 'Venus', body: Astronomy.Body.Venus },
    { name: 'शनि', en: 'Saturn', body: Astronomy.Body.Saturn },
  ];

  const positions: PlanetPosition[] = [];
  const astroTime = Astronomy.MakeTime(date);
  const astroTimeFuture = Astronomy.MakeTime(new Date(date.getTime() + 3600000));

  for (const item of bodies) {
    const geoVec = Astronomy.GeoVector(item.body, astroTime, false);
    const ecl = Astronomy.Ecliptic(geoVec);
    const siderealLon = normalize360(ecl.elon - ayanamsa);
    const latDeg = ecl.elat;

    const geoVecFuture = Astronomy.GeoVector(item.body, astroTimeFuture, false);
    const eclFuture = Astronomy.Ecliptic(geoVecFuture);
    let diff = eclFuture.elon - ecl.elon;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;

    const speed = Math.abs(diff * 24);
    const isRetrograde = diff < 0;

    const rashiIdx = Math.floor(siderealLon / 30) % 12;
    const house = ((rashiIdx - lagnaRashiIdx + 12) % 12) + 1;
    const nakIdx = Math.floor(siderealLon / (360 / 27)) % 27;
    const pada = Math.floor((siderealLon % (360 / 27)) / (360 / 108)) + 1;

    positions.push({
      planet: item.name,
      englishName: item.en,
      rashi: RASHIS[rashiIdx],
      rashiNumber: rashiIdx + 1,
      degree: siderealLon,
      degreeInRashi: siderealLon % 30,
      house,
      isRetrograde,
      latitude: latDeg,
      speed,
      nakshatra: NAKSHATRAS[nakIdx] || 'अश्विनी',
      pada,
    });
  }

  // Mean lunar node (Rahu)
  const meanNode = normalize360(125.044555 - 1934.1361849 * t + 0.0020762 * t * t);
  const rahuLon = normalize360(meanNode - ayanamsa);
  const ketuLon = normalize360(rahuLon + 180);

  const rahuRashiIdx = Math.floor(rahuLon / 30) % 12;
  const ketuRashiIdx = Math.floor(ketuLon / 30) % 12;
  const rahuNakIdx = Math.floor(rahuLon / (360 / 27)) % 27;
  const ketuNakIdx = Math.floor(ketuLon / (360 / 27)) % 27;

  positions.push({
    planet: 'राहु',
    englishName: 'Rahu',
    rashi: RASHIS[rahuRashiIdx],
    rashiNumber: rahuRashiIdx + 1,
    degree: rahuLon,
    degreeInRashi: rahuLon % 30,
    house: ((rahuRashiIdx - lagnaRashiIdx + 12) % 12) + 1,
    isRetrograde: true,
    latitude: 0,
    speed: 0.053,
    nakshatra: NAKSHATRAS[rahuNakIdx] || 'अश्विनी',
    pada: Math.floor((rahuLon % (360 / 27)) / (360 / 108)) + 1,
  });

  positions.push({
    planet: 'केतु',
    englishName: 'Ketu',
    rashi: RASHIS[ketuRashiIdx],
    rashiNumber: ketuRashiIdx + 1,
    degree: ketuLon,
    degreeInRashi: ketuLon % 30,
    house: ((ketuRashiIdx - lagnaRashiIdx + 12) % 12) + 1,
    isRetrograde: true,
    latitude: 0,
    speed: 0.053,
    nakshatra: NAKSHATRAS[ketuNakIdx] || 'अश्विनी',
    pada: Math.floor((ketuLon % (360 / 27)) / (360 / 108)) + 1,
  });

  return positions;
}

/**
 * Calculates Full Vedic Panchang Data for a given date and location
 */
export function calculateVedicPanchang(
  date: Date,
  lat: number = 23.1765,
  lon: number = 75.7885
): VedicPanchangData {
  const solar = calculateSolarTimes(date, lat, lon);
  const { sunSidereal, moonSidereal, ayanamsa } = getSunMoonSidereal(solar.sunrise);

  // Tithi calculation (each tithi is 12 degrees of Moon - Sun)
  const diff = normalize360(moonSidereal - sunSidereal);
  const tithiNum = Math.floor(diff / 12) + 1;
  const tithiInPaksha = ((tithiNum - 1) % 15) + 1;
  const paksha = tithiNum <= 15 ? 'शुक्ल पक्ष' : 'कृष्ण पक्ष';

  const tithiName =
    tithiInPaksha === 15
      ? paksha === 'शुक्ल पक्ष'
        ? 'पूर्णिमा'
        : 'अमावस्या'
      : TITHIS[tithiInPaksha - 1];
  const tithiProgress = (diff % 12) / 12;

  // Nakshatra calculation (each nakshatra is 360 / 27 = 13°20')
  const nakSpan = 360 / 27;
  const nakIdx = Math.floor(moonSidereal / nakSpan) % 27;
  const nakProgress = (moonSidereal % nakSpan) / nakSpan;
  const pada = Math.floor(nakProgress * 4) + 1;

  // Yoga calculation (each yoga is 13°20' of Moon + Sun)
  const sum = normalize360(sunSidereal + moonSidereal);
  const yogaIdx = Math.floor(sum / nakSpan) % 27;

  // Karana calculation (each karana is 6 degrees of Moon - Sun)
  const karanaNum = Math.floor(diff / 6) + 1;
  let karanaName = 'किंस्तुघ्न';
  if (karanaNum === 1) {
    karanaName = 'किंस्तुघ्न';
  } else if (karanaNum >= 2 && karanaNum <= 57) {
    karanaName = KARANAS[(karanaNum - 2) % 7];
  } else if (karanaNum === 58) {
    karanaName = 'शकुनि';
  } else if (karanaNum === 59) {
    karanaName = 'चतुष्पद';
  } else if (karanaNum === 60) {
    karanaName = 'नाग';
  }

  const sunRashiIdx = Math.floor(sunSidereal / 30) % 12;
  const moonRashiIdx = Math.floor(moonSidereal / 30) % 12;
  const weekday = WEEKDAYS[date.getDay()];

  const vikramSamvat = date.getFullYear() + 57;
  const sakaSamvat = date.getFullYear() - 78;
  const masa = MASAS[sunRashiIdx];

  return {
    date,
    weekday,
    paksha,
    tithi: tithiName,
    tithiNumber: tithiNum,
    tithiProgress,
    nakshatra: NAKSHATRAS[nakIdx],
    nakshatraNumber: nakIdx + 1,
    nakshatraProgress: nakProgress,
    pada,
    yoga: YOGAS[yogaIdx],
    yogaNumber: yogaIdx + 1,
    karana: karanaName,
    karanaNumber: karanaNum,
    samvat: `विक्रम संवत् ${vikramSamvat}`,
    sakaSamvat: `शक संवत् ${sakaSamvat}`,
    masa: `${masa} मास`,
    solarRashi: RASHIS[sunRashiIdx],
    lunarRashi: RASHIS[moonRashiIdx],
    ayanamsha: ayanamsa,
    ayanamshaName: 'लाहिरी अयनांश',
    sunLongitude: sunSidereal,
    moonLongitude: moonSidereal,
    solar,
    calculationNote:
      'सटीक खगोलीय गणना सूर्योदय आधारित। तिथि, नक्षत्र, योग और करण सूर्य-चंद्र की सायन एवं निरयण स्थिति से प्राप्त हैं।',
  };
}

/**
 * Calculates Shodashvarga sign index (0-11) for a given sidereal degree and varga divisor
 */
export function calculateVargaSign(degree: number, vargaDiv: number): number {
  const deg = normalize360(degree);
  const rashi = Math.floor(deg / 30);
  const rem = deg - rashi * 30;
  const part = Math.min(vargaDiv - 1, Math.max(0, Math.floor(rem / (30 / vargaDiv))));
  const mod12 = (val: number) => ((val % 12) + 12) % 12;

  switch (vargaDiv) {
    case 1:
      return rashi;
    case 2: // Hora
      return rashi % 2 === 0 ? (part === 0 ? 4 : 3) : (part === 0 ? 3 : 4);
    case 3: // Drekkana
      return mod12(rashi + [0, 4, 8][part]);
    case 4: // Chaturthamsha
      return mod12(rashi + [0, 3, 6, 9][part]);
    case 7: // Saptamsha
      return mod12((rashi % 2 === 0 ? rashi : rashi + 6) + part);
    case 9: { // Navamsha
      const start = rashi % 3 === 0 ? rashi : rashi % 3 === 1 ? rashi + 8 : rashi + 4;
      return mod12(start + part);
    }
    case 10: // Dashamsha
      return mod12((rashi % 2 === 0 ? rashi : rashi + 8) + part);
    case 12: // Dwadashamsha
      return mod12(rashi + part);
    case 16: { // Shodashamsha
      const start = rashi % 3 === 0 ? 0 : rashi % 3 === 1 ? 4 : 8;
      return mod12(start + part);
    }
    case 20: // Vimshamsha
      return mod12([0, 8, 4, 3][rashi % 4] + part);
    case 24: // Chaturvimshamsha
      return mod12((rashi % 2 === 0 ? 4 : 3) + part);
    case 27: // Saptavimshamsha
      return mod12([0, 3, 6, 9][rashi % 4] + part);
    case 30: // Trimshamsha
      if (rashi % 2 === 0) {
        return rem < 5 ? 0 : rem < 10 ? 10 : rem < 18 ? 8 : rem < 25 ? 2 : 6;
      } else {
        return rem < 5 ? 1 : rem < 10 ? 5 : rem < 18 ? 11 : rem < 25 ? 9 : 7;
      }
    case 40: // Khavedamsha
      return mod12((rashi % 2 === 0 ? 0 : 6) + part);
    case 45: { // Akshavedamsha
      const start = rashi % 3 === 0 ? 0 : rashi % 3 === 1 ? 4 : 8;
      return mod12(start + part);
    }
    case 60: // Shashtiamsha
      return mod12(rashi + part);
    default:
      return mod12(rashi + part);
  }
}
