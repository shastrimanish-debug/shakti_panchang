import { PlanetPosition } from '../types';
import {
  calculatePlanetPositions,
  calculateLagnaDegree,
  RASHIS,
  NAKSHATRAS,
  NAKSHATRA_LORDS,
  normalize360,
} from './astronomy';

export interface GocharPlanetDetail extends PlanetPosition {
  symbol: string;
  dms: string;
  degFormatted: string;
  houseFromLagna: number;
  houseFromMoon: number;
  nakshatraLord: string;
  isCombust: boolean;
  dignity: 'उच्च' | 'नीच' | 'स्वराशि' | 'मित्र' | 'सम' | 'शत्रु';
  dignityClass: string;
  statusText: string;
}

export interface TransitYoga {
  name: string;
  planets: string[];
  description: string;
  type: 'auspicious' | 'neutral' | 'inauspicious';
}

export interface DailyGocharData {
  date: Date;
  lat: number;
  lon: number;
  lagnaDegree: number;
  lagnaRashi: string;
  lagnaRashiNumber: number;
  moonRashi: string;
  moonRashiNumber: number;
  planets: GocharPlanetDetail[];
  retrogradePlanets: GocharPlanetDetail[];
  combustPlanets: GocharPlanetDetail[];
  transitYogas: TransitYoga[];
  moonRemainingDegrees: number;
  moonHoursToNextSign: number;
  nextMoonRashi: string;
}

const PLANET_SYMBOLS: Record<string, string> = {
  सूर्य: '☀️',
  चंद्र: '🌙',
  मंगल: '♂️',
  बुध: '☿️',
  गुरु: '♃',
  शुक्र: '♀️',
  शनि: '♄',
  राहु: '☊',
  केतु: '☋',
};

const EXALTATION_SIGNS: Record<string, number> = {
  सूर्य: 0, // मेष
  चंद्र: 1, // वृषभ
  मंगल: 9, // मकर
  बुध: 5, // कन्या
  गुरु: 3, // कर्क
  शुक्र: 11, // मीन
  शनि: 6, // तुला
  राहु: 1, // वृषभ / मिथुन
  केतु: 7, // वृश्चिक / धनु
};

const DEBILITATION_SIGNS: Record<string, number> = {
  सूर्य: 6, // तुला
  चंद्र: 7, // वृश्चिक
  मंगल: 3, // कर्क
  बुध: 11, // मीन
  गुरु: 9, // मकर
  शुक्र: 5, // कन्या
  शनि: 0, // मेष
  राहु: 7, // वृश्चिक
  केतु: 1, // वृषभ
};

const OWN_SIGNS: Record<string, number[]> = {
  सूर्य: [4], // सिंह
  चंद्र: [3], // कर्क
  मंगल: [0, 7], // मेष, वृश्चिक
  बुध: [2, 5], // मिथुन, कन्या
  गुरु: [8, 11], // धनु, मीन
  शुक्र: [1, 6], // वृषभ, तुला
  शनि: [9, 10], // मकर, कुंभ
};

const COMBUST_ORBS: Record<string, number> = {
  चंद्र: 12,
  मंगल: 17,
  बुध: 14,
  गुरु: 11,
  शुक्र: 10,
  शनि: 15,
};

function formatDMS(degInRashi: number): string {
  const d = Math.floor(degInRashi);
  const minFloat = (degInRashi - d) * 60;
  const m = Math.floor(minFloat);
  const s = Math.floor((minFloat - m) * 60);
  return `${d}° ${m.toString().padStart(2, '0')}' ${s.toString().padStart(2, '0')}"`;
}

export function calculateDailyGochar(
  date: Date,
  lat: number = 23.1765,
  lon: number = 75.7885,
  tzHours: number = 5.5
): DailyGocharData {
  const lagnaDeg = calculateLagnaDegree(date, lat, lon, tzHours);
  const lagnaRashiIdx = Math.floor(lagnaDeg / 30) % 12;
  const rawPlanets = calculatePlanetPositions(date, lat, lon, tzHours);

  const sun = rawPlanets.find((p) => p.planet === 'सूर्य');
  const moon = rawPlanets.find((p) => p.planet === 'चंद्र');
  const sunLon = sun ? sun.degree : 0;
  const moonRashiIdx = moon ? moon.rashiNumber - 1 : 0;

  const detailedPlanets: GocharPlanetDetail[] = rawPlanets.map((p) => {
    const rashiIdx = p.rashiNumber - 1;
    const symbol = PLANET_SYMBOLS[p.planet] || '🪐';
    const dms = formatDMS(p.degreeInRashi);
    const degFormatted = `${Math.floor(p.degreeInRashi)}° ${(
      (p.degreeInRashi - Math.floor(p.degreeInRashi)) *
      60
    ).toFixed(0)}'`;

    // House from Lagna
    const houseFromLagna = ((rashiIdx - lagnaRashiIdx + 12) % 12) + 1;
    // House from Moon
    const houseFromMoon = ((rashiIdx - moonRashiIdx + 12) % 12) + 1;

    // Nakshatra Lord (27 nakshatras mapped to 9 planetary lords)
    const nakIdx = NAKSHATRAS.indexOf(p.nakshatra);
    const nakLord = nakIdx >= 0 ? NAKSHATRA_LORDS[nakIdx % 9] : '';

    // Combustion with Sun
    let isCombust = false;
    if (p.planet !== 'सूर्य' && p.planet !== 'राहु' && p.planet !== 'केतु') {
      const orbLimit = COMBUST_ORBS[p.planet] || 10;
      let diff = Math.abs(p.degree - sunLon);
      if (diff > 180) diff = 360 - diff;
      if (diff <= orbLimit) {
        isCombust = true;
      }
    }

    // Dignity
    let dignity: 'उच्च' | 'नीच' | 'स्वराशि' | 'मित्र' | 'सम' | 'शत्रु' = 'सम';
    let dignityClass = 'bg-stone-100 text-stone-700 border-stone-200';

    if (EXALTATION_SIGNS[p.planet] === rashiIdx) {
      dignity = 'उच्च';
      dignityClass = 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold';
    } else if (DEBILITATION_SIGNS[p.planet] === rashiIdx) {
      dignity = 'नीच';
      dignityClass = 'bg-rose-100 text-rose-800 border-rose-300 font-bold';
    } else if (OWN_SIGNS[p.planet]?.includes(rashiIdx)) {
      dignity = 'स्वराशि';
      dignityClass = 'bg-amber-100 text-amber-900 border-amber-300 font-bold';
    }

    let statusText = p.isRetrograde ? 'वक्री (R)' : 'मार्गी';
    if (isCombust) statusText += ' • अस्त';

    return {
      ...p,
      symbol,
      dms,
      degFormatted,
      houseFromLagna,
      houseFromMoon,
      nakshatraLord: nakLord,
      isCombust,
      dignity,
      dignityClass,
      statusText,
    };
  });

  const retrogradePlanets = detailedPlanets.filter((p) => p.isRetrograde);
  const combustPlanets = detailedPlanets.filter((p) => p.isCombust);

  // Transit Yogas
  const yogas: TransitYoga[] = [];

  // Budhaditya Yoga (Sun + Mercury in same sign)
  const mercury = detailedPlanets.find((p) => p.planet === 'बुध');
  if (sun && mercury && sun.rashiNumber === mercury.rashiNumber) {
    yogas.push({
      name: 'बुधादित्य राजयोग',
      planets: ['सूर्य', 'बुध'],
      description: `${sun.rashi} राशि में सूर्य एवं बुध की शुभ युति से तीव्र बुद्धि, वाणी कौशल व प्रतिष्ठा में वृद्धि।`,
      type: 'auspicious',
    });
  }

  // Gajakesari Yoga (Moon & Jupiter in Kendra 1, 4, 7, 10 to each other)
  const jupiter = detailedPlanets.find((p) => p.planet === 'गुरु');
  if (moon && jupiter) {
    const diffHouses = ((moon.rashiNumber - jupiter.rashiNumber + 12) % 12) + 1;
    if ([1, 4, 7, 10].includes(diffHouses)) {
      yogas.push({
        name: 'गजकेसरी महायोग',
        planets: ['चंद्र', 'गुरु'],
        description: `चंद्र से गुरु ${diffHouses}वें भाव (केंद्र) में होने से शुभ गजकेसरी योग, जो ज्ञान, ऐश्वर्य व कार्य सिद्धि प्रदान करता है।`,
        type: 'auspicious',
      });
    }
  }

  // Shasha Yoga (Saturn in Kendra in Libra, Capricorn, Aquarius)
  const saturn = detailedPlanets.find((p) => p.planet === 'शनि');
  if (saturn && [0, 6, 9, 10].includes(saturn.rashiNumber - 1) && [1, 4, 7, 10].includes(saturn.houseFromLagna)) {
    yogas.push({
      name: 'शश पंचमहापुरुष योग',
      planets: ['शनि'],
      description: `शनि देव अपनी स्वराशि/उच्च राशि में केंद्र भाव में स्थित हैं, जो अधिकार, धैर्य व दीर्घकालिक सफलता देते हैं।`,
      type: 'auspicious',
    });
  }

  // Chandra-Mangal Yoga (Moon + Mars in same sign)
  const mars = detailedPlanets.find((p) => p.planet === 'मंगल');
  if (moon && mars && moon.rashiNumber === mars.rashiNumber) {
    yogas.push({
      name: 'चंद्र-मंगल महालक्ष्मी योग',
      planets: ['चंद्र', 'मंगल'],
      description: `${moon.rashi} राशि में चंद्र-मंगल की युति से धन आगमन, पराक्रम व व्यापारिक लाभ का सुयोग।`,
      type: 'auspicious',
    });
  }

  // Guru-Shukra Sambandha
  const venus = detailedPlanets.find((p) => p.planet === 'शुक्र');
  if (jupiter && venus && jupiter.rashiNumber === venus.rashiNumber) {
    yogas.push({
      name: 'गुरु-शुक्र युति',
      planets: ['गुरु', 'शुक्र'],
      description: `${jupiter.rashi} राशि में दो शुभ गुरुओं की युति से ज्ञान, वैभव व मांगलिक कार्यों में शुभता।`,
      type: 'auspicious',
    });
  }

  // Moon Ingress
  const moonDegInRashi = moon ? moon.degreeInRashi : 0;
  const moonRemainingDeg = Math.max(0, 30 - moonDegInRashi);
  const moonDailySpeed = moon?.speed && moon.speed > 5 ? moon.speed : 13.176;
  const moonHoursRemaining = (moonRemainingDeg / moonDailySpeed) * 24;
  const nextMoonRashiIdx = (moonRashiIdx + 1) % 12;

  return {
    date,
    lat,
    lon,
    lagnaDegree: lagnaDeg,
    lagnaRashi: RASHIS[lagnaRashiIdx],
    lagnaRashiNumber: lagnaRashiIdx + 1,
    moonRashi: RASHIS[moonRashiIdx],
    moonRashiNumber: moonRashiIdx + 1,
    planets: detailedPlanets,
    retrogradePlanets,
    combustPlanets,
    transitYogas: yogas,
    moonRemainingDegrees: moonRemainingDeg,
    moonHoursToNextSign: Math.round(moonHoursRemaining * 10) / 10,
    nextMoonRashi: RASHIS[nextMoonRashiIdx],
  };
}
