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

const KARAKA_DEFINITIONS: Array<{
  code: string;
  name: { hi: string; en: string; gu: string };
  englishCode: string;
  significance: { hi: string; en: string; gu: string };
}> = [
  {
    code: 'AK',
    name: { hi: 'आत्माकारक (Atmakaraka)', en: 'Atmakaraka (AK)', gu: 'આત્માકારક (AK)' },
    englishCode: 'Soul / Self',
    significance: {
      hi: 'आत्मा, देह, संपूर्ण व्यक्तित्व, मूल स्वभाव व जीवन का मुख्य उद्देश्य (सर्वाधिक अंश)',
      en: 'Soul, body, complete personality, core nature and primary life purpose (highest degree)',
      gu: 'આત્મા, દેહ, સંપૂર્ણ વ્યક્તિત્વ, મૂળ સ્વભાવ અને જીવનનો મુખ્ય ઉદ્દેશ (સર્વાધિક અંશ)',
    },
  },
  {
    code: 'AmK',
    name: { hi: 'अमात्यकारक (Amatyakaraka)', en: 'Amatyakaraka (AmK)', gu: 'અમાત્યકારક (AmK)' },
    englishCode: 'Career / Counsel',
    significance: {
      hi: 'आजीविका, पद-प्रतिष्ठा, बुद्धि, परामर्श, कर्म क्षेत्र व व्यावसायिक सफलता',
      en: 'Career, rank, prestige, intellect, counsel, profession and worldly success',
      gu: 'આજીવિકા, પદ-પ્રતિષ્ઠા, બુદ્ધિ, પરામર્શ, કર્મક્ષેત્ર અને વ્યવસાયિક સફળતા',
    },
  },
  {
    code: 'BK',
    name: { hi: 'भ्रातृकारक (Bhratrukaraka)', en: 'Bhratrukaraka (BK)', gu: 'ભ્રાતૃકારક (BK)' },
    englishCode: 'Siblings / Guru',
    significance: {
      hi: 'सहोदर (भाई-बहन), गुरु, मार्गदर्शक, पराक्रम व साहसिक निर्णय',
      en: 'Siblings, Guru, mentors, courage and bold life decisions',
      gu: 'ભાઈ-બહેન, ગુરુ, માર્ગદર્શક, પરાક્રમ અને સાહસિક નિર્ણય',
    },
  },
  {
    code: 'MK',
    name: { hi: 'मातृकारक (Matrukaraka)', en: 'Matrukaraka (MK)', gu: 'માતૃકારક (MK)' },
    englishCode: 'Mother / Land',
    significance: {
      hi: 'माता, भूमि, भवन, वाहन, अचल संपत्ति, मानसिक शांति व प्राथमिक शिक्षा',
      en: 'Mother, land, property, vehicles, fixed assets, peace of mind and foundational education',
      gu: 'માતા, ભૂમિ, ભવન, વાહન, સ્થાવર મિલકત, માનસિક શાંતિ અને પ્રાથમિક શિક્ષણ',
    },
  },
  {
    code: 'PK',
    name: { hi: 'पुत्रकारक (Putrakaraka)', en: 'Putrakaraka (PK)', gu: 'પુત્રકારક (PK)' },
    englishCode: 'Children / Intelligence',
    significance: {
      hi: 'संतान सुख, उच्च बुद्धि, विद्या, मंत्र सिद्धि, रचनात्मकता व पूर्व पुण्य',
      en: 'Children, higher intellect, learning, mantra siddhi, creativity and past merit',
      gu: 'સંતાન સુખ, ઉચ્ચ બુદ્ધિ, વિદ્યા, મંત્ર સિદ્ધિ, સર્જનાત્મકતા અને પૂર્વ પુણ્ય',
    },
  },
  {
    code: 'GK',
    name: { hi: 'ज्ञातिकारक (Gnatikaraka)', en: 'Gnatikaraka (GK)', gu: 'જ્ઞાતિકારક (GK)' },
    englishCode: 'Relatives / Competitors',
    significance: {
      hi: 'ज्ञाति-सम्बन्धी (रिश्तेदार), शत्रु, प्रतिस्पर्धी, रोग, ऋण व जीवन की चुनौतियाँ',
      en: 'Relatives, competitors, opposition, ailments, debts and life challenges',
      gu: 'સગાં-સંબંધી, શત્રુ, પ્રતિસ્પર્ધી, રોગ, દેવું અને જીવનના પડકારો',
    },
  },
  {
    code: 'DK',
    name: { hi: 'दाराकारक (Darakaraka)', en: 'Darakaraka (DK)', gu: 'દારાકારક (DK)' },
    englishCode: 'Spouse / Partner',
    significance: {
      hi: 'जीवनसाथी, दांपत्य जीवन, प्रेम संबंध, साझीदार व जनसंपर्क (न्यूनतम अंश)',
      en: 'Spouse, married life, love relationships, business partner and public ties (lowest degree)',
      gu: 'જીવનસાથી, દાંપત્ય જીવન, પ્રેમ સંબંધ, ભાગીદાર અને જનસંપર્ક (લઘુત્તમ અંશ)',
    },
  },
];

// Direct (Savya) vs Reverse (Apsavya) Rashis
const DIRECT_SIGNS = [0, 1, 2, 6, 7, 8]; // मेष, वृषभ, मिथुन, तुला, वृश्चिक, धनु

function normalizeLang(lang?: string): 'hi' | 'en' | 'gu' {
  const c = (lang || 'hi').slice(0, 2).toLowerCase();
  if (c === 'en') return 'en';
  if (c === 'gu') return 'gu';
  return 'hi';
}

/**
 * Calculates 7 Jaimini Chara Karakas (AK, AmK, BK, MK, PK, GK, DK)
 */
export function calculateJaiminiKarakas(planets: PlanetPosition[], lang: string = 'hi'): JaiminiKaraka[] {
  const l = normalizeLang(lang);
  const main7Planets = ['सूर्य', 'चंद्र', 'मंगल', 'बुध', 'गुरु', 'शुक्र', 'शनि'];
  
  const filtered = planets
    .filter((p) => main7Planets.includes(p.planet))
    .sort((a, b) => b.degreeInRashi - a.degreeInRashi);

  return filtered.map((p, idx) => {
    const def = KARAKA_DEFINITIONS[idx] || KARAKA_DEFINITIONS[KARAKA_DEFINITIONS.length - 1];
    return {
      code: def.code,
      name: def.name[l],
      englishCode: def.englishCode,
      planet: p.planet,
      englishPlanet: p.englishName,
      rashi: p.rashi,
      rashiNumber: p.rashiNumber,
      degreeInRashi: p.degreeInRashi,
      house: p.house,
      significance: def.significance[l],
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
export function calculateJaiminiAnalysis(kundali: KundaliData, lang: string = 'hi'): JaiminiAnalysis {
  const karakas = calculateJaiminiKarakas(kundali.planets, lang);
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
