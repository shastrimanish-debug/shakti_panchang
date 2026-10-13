import { KundaliData, PlanetPosition } from '../types';
import { RASHIS, calculateVargaSign } from './astronomy';
import { SIGN_LORDS_ARRAY } from './vargaAnalysis';

export interface JaiminiKaraka {
  code: string;           // AK, AmK, BK, etc.
  name: string;           // आत्माकारक, अमात्यकारक, etc.
  englishCode: string;
  planet: string;         // सूर्य, चंद्र, etc.
  englishPlanet: string;
  rashi: string;
  rashiNumber: number;
  degreeInRashi: number;
  house: number;
  significance: string;
}

export interface JaiminiCharaAntardasha {
  rashi: string;
  rashiNumber: number;
  startDate: Date;
  endDate: Date;
  months: number;
}

export interface JaiminiCharaDashaPeriod {
  rashi: string;
  rashiNumber: number;
  lord: string;
  startDate: Date;
  endDate: Date;
  years: number;
  antardashas: JaiminiCharaAntardasha[];
}

export interface JaiminiAnalysis {
  karakas: JaiminiKaraka[];
  atmakaraka: JaiminiKaraka;
  amatyakaraka: JaiminiKaraka;
  karakamshaRashi: string;
  karakamshaRashiNumber: number;
  arudhaLagnaRashi: string;
  arudhaLagnaHouse: number;
  upapadaLagnaRashi: string;
  upapadaLagnaHouse: number;
  charaDashaPeriods: JaiminiCharaDashaPeriod[];
  currentCharaMaha: JaiminiCharaDashaPeriod;
  currentCharaAntar: JaiminiCharaAntardasha;
}

const KARAKA_DEFINITIONS = [
  {
    code: 'AK',
    name: 'आत्माकारक (Atmakaraka)',
    englishCode: 'Soul / Self',
    significance: 'आत्मा, देह, संपूर्ण व्यक्तित्व, मूल स्वभाव व जीवन का मुख्य उद्देश्य (सर्वाधिक अंश)',
  },
  {
    code: 'AmK',
    name: 'अमात्यकारक (Amatyakaraka)',
    englishCode: 'Career / Counsel',
    significance: 'आजीविका, पद-प्रतिष्ठा, बुद्धि, परामर्श, कर्म क्षेत्र व व्यावसायिक सफलता',
  },
  {
    code: 'BK',
    name: 'भ्रातृकारक (Bhratrukaraka)',
    englishCode: 'Siblings / Guru',
    significance: 'सहोदर (भाई-बहन), गुरु, मार्गदर्शक, पराक्रम व साहसिक निर्णय',
  },
  {
    code: 'MK',
    name: 'मातृकारक (Matrukaraka)',
    englishCode: 'Mother / Land',
    significance: 'माता, भूमि, भवन, वाहन, अचल संपत्ति, मानसिक शांति व प्राथमिक शिक्षा',
  },
  {
    code: 'PK',
    name: 'पुत्रकारक (Putrakaraka)',
    englishCode: 'Children / Intelligence',
    significance: 'संतान सुख, उच्च बुद्धि, विद्या, मंत्र सिद्धि, रचनात्मकता व पूर्व पुण्य',
  },
  {
    code: 'GK',
    name: 'ज्ञातिकारक (Gnatikaraka)',
    englishCode: 'Relatives / Competitors',
    significance: 'ज्ञाति-सम्बन्धी (रिश्तेदार), शत्रु, प्रतिस्पर्धी, रोग, ऋण व जीवन की चुनौतियाँ',
  },
  {
    code: 'DK',
    name: 'दाराकारक (Darakaraka)',
    englishCode: 'Spouse / Partner',
    significance: 'जीवनसाथी, दांपत्य जीवन, प्रेम संबंध, साझीदार व जनसंपर्क (न्यूनतम अंश)',
  },
];

// Direct (Savya) vs Reverse (Apsavya) Rashis
const DIRECT_SIGNS = [0, 1, 2, 6, 7, 8]; // मेष, वृषभ, मिथुन, तुला, वृश्चिक, धनु

/**
 * Calculates 7 Jaimini Chara Karakas (AK, AmK, BK, MK, PK, GK, DK)
 */
export function calculateJaiminiKarakas(planets: PlanetPosition[]): JaiminiKaraka[] {
  const main7Planets = ['सूर्य', 'चंद्र', 'मंगल', 'बुध', 'गुरु', 'शुक्र', 'शनि'];
  
  const filtered = planets
    .filter((p) => main7Planets.includes(p.planet))
    .sort((a, b) => b.degreeInRashi - a.degreeInRashi);

  return filtered.map((p, idx) => {
    const def = KARAKA_DEFINITIONS[idx] || KARAKA_DEFINITIONS[KARAKA_DEFINITIONS.length - 1];
    return {
      code: def.code,
      name: def.name,
      englishCode: def.englishCode,
      planet: p.planet,
      englishPlanet: p.englishName,
      rashi: p.rashi,
      rashiNumber: p.rashiNumber,
      degreeInRashi: p.degreeInRashi,
      house: p.house,
      significance: def.significance,
    };
  });
}

/**
 * Calculates Arudha Lagna (AL) and Upapada Lagna (UL)
 */
export function calculateArudhaLagnas(
  lagnaRashiIndex: number,
  planets: PlanetPosition[]
): {
  arudhaLagnaRashiIndex: number;
  arudhaLagnaHouse: number;
  upapadaLagnaRashiIndex: number;
  upapadaLagnaHouse: number;
} {
  const L = lagnaRashiIndex % 12;

  // 1. Arudha Lagna (AL)
  const lagnaLord = SIGN_LORDS_ARRAY[L];
  const lagnaLordPlanet = planets.find((p) => p.planet === lagnaLord);
  const lordSignIdx = lagnaLordPlanet ? lagnaLordPlanet.rashiNumber - 1 : L;

  const countFromLagna = ((lordSignIdx - L + 12) % 12) + 1;
  let alSignIdx = (L + 2 * (countFromLagna - 1)) % 12;

  // Exception: If AL falls in Lagna or 7th from Lagna, AL = 10th from AL position
  if (alSignIdx === L || alSignIdx === (L + 6) % 12) {
    alSignIdx = (alSignIdx + 9) % 12;
  }
  const arudhaLagnaHouse = ((alSignIdx - L + 12) % 12) + 1;

  // 2. Upapada Lagna (UL - 12th House Arudha)
  const h12Idx = (L + 11) % 12;
  const h12Lord = SIGN_LORDS_ARRAY[h12Idx];
  const h12LordPlanet = planets.find((p) => p.planet === h12Lord);
  const lord12Idx = h12LordPlanet ? h12LordPlanet.rashiNumber - 1 : h12Idx;

  const countFrom12 = ((lord12Idx - h12Idx + 12) % 12) + 1;
  let ulSignIdx = (h12Idx + 2 * (countFrom12 - 1)) % 12;

  if (ulSignIdx === h12Idx || ulSignIdx === (h12Idx + 6) % 12) {
    ulSignIdx = (ulSignIdx + 9) % 12;
  }
  const upapadaLagnaHouse = ((ulSignIdx - L + 12) % 12) + 1;

  return {
    arudhaLagnaRashiIndex: alSignIdx,
    arudhaLagnaHouse,
    upapadaLagnaRashiIndex: ulSignIdx,
    upapadaLagnaHouse,
  };
}

/**
 * Calculates Jaimini Chara Dasha Duration in years for a sign
 */
function calculateCharaDashaYears(
  signIdx: number,
  planets: PlanetPosition[]
): number {
  const lordName = SIGN_LORDS_ARRAY[signIdx];
  const lordPlanet = planets.find((p) => p.planet === lordName);
  const lordSignIdx = lordPlanet ? lordPlanet.rashiNumber - 1 : signIdx;

  if (lordSignIdx === signIdx) {
    return 12; // Lord in own sign gives 12 years
  }

  const isDirect = DIRECT_SIGNS.includes(signIdx);
  let dist = 0;

  if (isDirect) {
    dist = (lordSignIdx - signIdx + 12) % 12;
  } else {
    dist = (signIdx - lordSignIdx + 12) % 12;
  }

  const years = dist - 1;
  return years <= 0 ? 12 : years;
}

/**
 * Complete Jaimini Analysis: Karakas, Karakamsha, Arudha Lagna, Upapada Lagna, and 12-Sign Chara Dasha System
 */
export function calculateJaiminiAnalysis(kundali: KundaliData): JaiminiAnalysis {
  const karakas = calculateJaiminiKarakas(kundali.planets);
  const atmakaraka = karakas[0];
  const amatyakaraka = karakas[1];

  // Atmakaraka's Navamsha D9 Rashi = Karakamsha
  const akPlanet = kundali.planets.find((p) => p.planet === atmakaraka.planet);
  const akDegree = akPlanet ? akPlanet.degree : kundali.lagnaDegree;
  const karakamshaRashiIdx = calculateVargaSign(akDegree, 9);
  const karakamshaRashi = RASHIS[karakamshaRashiIdx];
  const karakamshaRashiNumber = karakamshaRashiIdx + 1;

  // Arudha Lagna & Upapada Lagna
  const lagnaRashiIdx = kundali.lagnaRashiNumber - 1;
  const {
    arudhaLagnaRashiIndex,
    arudhaLagnaHouse,
    upapadaLagnaRashiIndex,
    upapadaLagnaHouse,
  } = calculateArudhaLagnas(lagnaRashiIdx, kundali.planets);

  const arudhaLagnaRashi = RASHIS[arudhaLagnaRashiIndex];
  const upapadaLagnaRashi = RASHIS[upapadaLagnaRashiIndex];

  // Jaimini Chara Dasha Progression
  const isLagnaDirect = DIRECT_SIGNS.includes(lagnaRashiIdx);
  const charaSequence: number[] = [];
  
  for (let i = 0; i < 12; i++) {
    if (isLagnaDirect) {
      charaSequence.push((lagnaRashiIdx + i) % 12);
    } else {
      charaSequence.push((lagnaRashiIdx - i + 12) % 12);
    }
  }

  const birthDate = new Date(kundali.birthDate);
  let pointer = new Date(birthDate);
  const charaDashaPeriods: JaiminiCharaDashaPeriod[] = [];

  for (const sIdx of charaSequence) {
    const years = calculateCharaDashaYears(sIdx, kundali.planets);
    const endMs = pointer.getTime() + years * 365.25 * 86400000;
    const endDate = new Date(endMs);

    // Calculate 12 Chara Antardashas
    const antardashas: JaiminiCharaAntardasha[] = [];
    let aPointer = new Date(pointer);
    const isSignDirect = DIRECT_SIGNS.includes(sIdx);
    const totalDays = (endMs - pointer.getTime()) / (1000 * 3600 * 24);
    const daysPerAntar = totalDays / 12;

    for (let j = 0; j < 12; j++) {
      const aSignIdx = isSignDirect ? (sIdx + j) % 12 : (sIdx - j + 12) % 12;
      const aEndMs = j === 11 ? endDate.getTime() : aPointer.getTime() + daysPerAntar * 86400000;
      const aEndDate = new Date(aEndMs);

      antardashas.push({
        rashi: RASHIS[aSignIdx],
        rashiNumber: aSignIdx + 1,
        startDate: new Date(aPointer),
        endDate: aEndDate,
        months: Math.round(((aEndMs - aPointer.getTime()) / (1000 * 3600 * 24 * 30.4375)) * 10) / 10,
      });

      aPointer = aEndDate;
    }

    charaDashaPeriods.push({
      rashi: RASHIS[sIdx],
      rashiNumber: sIdx + 1,
      lord: SIGN_LORDS_ARRAY[sIdx],
      startDate: new Date(pointer),
      endDate,
      years,
      antardashas,
    });

    pointer = endDate;
  }

  const now = new Date();
  const currentCharaMaha =
    charaDashaPeriods.find((d) => now >= d.startDate && now < d.endDate) || charaDashaPeriods[0];

  const currentCharaAntar =
    currentCharaMaha.antardashas.find((a) => now >= a.startDate && now < a.endDate) ||
    currentCharaMaha.antardashas[0];

  return {
    karakas,
    atmakaraka,
    amatyakaraka,
    karakamshaRashi,
    karakamshaRashiNumber,
    arudhaLagnaRashi,
    arudhaLagnaHouse,
    upapadaLagnaRashi,
    upapadaLagnaHouse,
    charaDashaPeriods,
    currentCharaMaha,
    currentCharaAntar,
  };
}
