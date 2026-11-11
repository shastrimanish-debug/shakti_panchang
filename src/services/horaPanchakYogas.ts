/**
 * Vedic Hora, Panchak, Bhadra & Special Auspicious Yogas Calculation Engine
 * -------------------------------------------------------------------------
 * Implements classical principles from Brihat Parashara Hora Shastra,
 * Muhurat Chintamani, and Narada Samhita.
 */

import { SolarTimes, VedicPanchangData } from '../types';

export interface HoraItem {
  number: number;
  period: 'day' | 'night';
  planet: string;
  planetEnglish: string;
  symbol: string;
  start: Date;
  end: Date;
  nature: 'auspicious' | 'moderate' | 'strict';
  favorableWork: string;
  unfavorableWork: string;
  isActive: boolean;
}

export interface SpecialYogaItem {
  id: string;
  name: string;
  type: 'auspicious' | 'rare' | 'cautious';
  badgeColor: string;
  description: string;
  guidance: string;
}

export interface PanchakStatus {
  isActive: boolean;
  type: string;
  typeNameHindi: string;
  nature: 'auspicious' | 'moderate' | 'inauspicious';
  rashi: string;
  nakshatra: string;
  description: string;
  remedy: string;
  forbiddenActs: string[];
}

export interface BhadraStatus {
  isActive: boolean;
  vas: 'स्वर्गलोक' | 'पाताललोक' | 'मृत्युलोक' | 'अनुपस्थित';
  vasEnglish: 'heaven' | 'netherworld' | 'earth' | 'none';
  nature: 'shubh' | 'neutral' | 'varjya';
  impactDescription: string;
  guidance: string;
  tithiPhase?: string;
}

// Chaldean planetary order descending: Saturn -> Jupiter -> Mars -> Sun -> Venus -> Mercury -> Moon
const CHALDEAN_ORDER = ['शनि', 'गुरु', 'मंगल', 'सूर्य', 'शुक्र', 'बुध', 'चन्द्र'];

const PLANET_INFO: Record<string, {
  english: string;
  symbol: string;
  nature: 'auspicious' | 'moderate' | 'strict';
  favorable: string;
  unfavorable: string;
}> = {
  'सूर्य': {
    english: 'Sun',
    symbol: '☀️',
    nature: 'moderate',
    favorable: 'राजकीय कार्य, पदभार ग्रहण, चिकित्सा, नेत्र उपचार, माणिक्य धारण, टेंडर आवेदन',
    unfavorable: 'विवाह, गृहप्रवेश, नवीन साझेदारी',
  },
  'शुक्र': {
    english: 'Venus',
    symbol: '✨',
    nature: 'auspicious',
    favorable: 'विवाह, कला, संगीत, आभूषण व वस्त्र क्रय, सौंदर्य प्रसाधन, नवीन वाहन क्रय',
    unfavorable: 'कटु वाद-विवाद, कठोर श्रम, मुकद्दमा',
  },
  'बुध': {
    english: 'Mercury',
    symbol: '☿',
    nature: 'auspicious',
    favorable: 'व्यापार, बहीखाता, अध्ययन, लेखन, शेयर/बैंकिंग, संचार, नवीन अनुबंध',
    unfavorable: 'शस्त्र प्रयोग, कलह, झगड़ा',
  },
  'चन्द्र': {
    english: 'Moon',
    symbol: '🌙',
    nature: 'auspicious',
    favorable: 'जल कार्य, गृह प्रवेश, माता की सेवा, चांदी क्रय, डेयरी व्यवसाय, सात्विक अनुष्ठान',
    unfavorable: 'शल्य चिकित्सा, अग्निकार्य, कठोर विवाद',
  },
  'शनि': {
    english: 'Saturn',
    symbol: '🪐',
    nature: 'strict',
    favorable: 'लोहा, मशीनरी, तेल, मुकद्दमा, पुरानी भूमि क्रय, गुप्त साधना, श्रम',
    unfavorable: 'विवाह, गृहप्रवेश, नवीन व्यापार, मंगल कार्य (सख्त वर्जित)',
  },
  'गुरु': {
    english: 'Jupiter',
    symbol: '♃',
    nature: 'auspicious',
    favorable: 'यज्ञ-पूजन, विद्यारम्भ, गुरु दीक्षा, स्वर्ण क्रय, बैंक निवेश, विवाह सम्बंध, न्याय',
    unfavorable: 'अनैतिक कार्य, असत्य भाषण',
  },
  'मंगल': {
    english: 'Mars',
    symbol: '♂',
    nature: 'strict',
    favorable: 'भूमि क्रय-विक्रय, कोर्ट-कचहरी, खेलकूद, सर्जरी, शस्त्र क्रय, कर्ज मुक्ति प्रयास',
    unfavorable: 'शांति वार्ता, विवाह, दक्षिण यात्रा',
  },
};

// Day 1st Hora Ruler by Weekday (0 = Sunday to 6 = Saturday)
const WEEKDAY_FIRST_HORA = ['सूर्य', 'चन्द्र', 'मंगल', 'बुध', 'गुरु', 'शुक्र', 'शनि'];

/**
 * Calculates 24 Horas (12 Day Horas + 12 Night Horas) for the selected day.
 */
export function calculateHoraTable(solar: SolarTimes, date: Date): {
  dayHoras: HoraItem[];
  nightHoras: HoraItem[];
  currentActiveHora: HoraItem | null;
} {
  const weekday = date.getDay();
  const firstPlanet = WEEKDAY_FIRST_HORA[weekday];
  const firstIdx = CHALDEAN_ORDER.indexOf(firstPlanet);

  const sunrise = solar.sunrise.getTime();
  const sunset = solar.sunset.getTime();
  const nextSunrise = solar.nextSunrise ? solar.nextSunrise.getTime() : sunrise + 86400000;

  const dayDurationMs = Math.max(1, sunset - sunrise);
  const nightDurationMs = Math.max(1, nextSunrise - sunset);

  const dayHoraLength = dayDurationMs / 12;
  const nightHoraLength = nightDurationMs / 12;

  const now = new Date().getTime();
  let currentActiveHora: HoraItem | null = null;

  const dayHoras: HoraItem[] = [];
  for (let i = 0; i < 12; i++) {
    const planetName = CHALDEAN_ORDER[(firstIdx + i) % 7];
    const info = PLANET_INFO[planetName];
    const hStart = new Date(sunrise + i * dayHoraLength);
    const hEnd = new Date(sunrise + (i + 1) * dayHoraLength);
    const isActive = now >= hStart.getTime() && now < hEnd.getTime();

    const hora: HoraItem = {
      number: i + 1,
      period: 'day',
      planet: planetName,
      planetEnglish: info.english,
      symbol: info.symbol,
      start: hStart,
      end: hEnd,
      nature: info.nature,
      favorableWork: info.favorable,
      unfavorableWork: info.unfavorable,
      isActive,
    };
    dayHoras.push(hora);
    if (isActive) currentActiveHora = hora;
  }

  const nightHoras: HoraItem[] = [];
  for (let j = 0; j < 12; j++) {
    const planetName = CHALDEAN_ORDER[(firstIdx + 12 + j) % 7];
    const info = PLANET_INFO[planetName];
    const hStart = new Date(sunset + j * nightHoraLength);
    const hEnd = new Date(sunset + (j + 1) * nightHoraLength);
    const isActive = now >= hStart.getTime() && now < hEnd.getTime();

    const hora: HoraItem = {
      number: j + 13,
      period: 'night',
      planet: planetName,
      planetEnglish: info.english,
      symbol: info.symbol,
      start: hStart,
      end: hEnd,
      nature: info.nature,
      favorableWork: info.favorable,
      unfavorableWork: info.unfavorable,
      isActive,
    };
    nightHoras.push(hora);
    if (isActive) currentActiveHora = hora;
  }

  return { dayHoras, nightHoras, currentActiveHora };
}

/**
 * Calculates Special Vedic Yogas:
 * - Sarvartha Siddhi Yoga (सर्वार्थ सिद्धि योग)
 * - Amrita Siddhi Yoga (अमृत सिद्धि योग)
 * - Guru Pushya Yoga (गुरु पुष्य योग)
 * - Ravi Pushya Yoga (रवि पुष्य योग)
 * - Ravi Yoga (रवि योग)
 * - Dwipushkar / Tripushkar Yoga (द्विपुष्कर / त्रिपुष्कर योग)
 */
export function calculateSpecialYogas(panchang: VedicPanchangData): SpecialYogaItem[] {
  const yogas: SpecialYogaItem[] = [];
  const weekday = panchang.date.getDay(); // 0 = Sun, 1 = Mon ... 6 = Sat
  const nakNum = panchang.nakshatraNumber; // 1 to 27
  const tithiNum = panchang.tithiNumber; // 1 to 15 (1 to 30)

  // 1. Sarvartha Siddhi Yoga (सर्वार्थ सिद्धि योग)
  // Sunday: 13, 19, 12, 21, 26, 1, 8
  // Monday: 22, 4, 5, 8, 17
  // Tuesday: 1, 3
  // Wednesday: 4, 17, 13, 3, 5
  // Thursday: 27, 17, 1, 7, 8
  // Friday: 27, 17, 1, 7
  // Saturday: 4, 15, 22
  const ssyMap: Record<number, number[]> = {
    0: [13, 19, 12, 21, 26, 1, 8],
    1: [22, 4, 5, 8, 17],
    2: [1, 3],
    3: [4, 17, 13, 3, 5],
    4: [27, 17, 1, 7, 8],
    5: [27, 17, 1, 7],
    6: [4, 15, 22],
  };

  if (ssyMap[weekday]?.includes(nakNum)) {
    yogas.push({
      id: 'sarvartha_siddhi',
      name: 'सर्वार्थ सिद्धि योग',
      type: 'auspicious',
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
      description: 'सभी मनोकामनाओं एवं नए कार्यों को सिद्ध करने वाला महायोग।',
      guidance: 'नवीन कार्य, व्यापार, अनुबंध, स्वर्ण क्रय व मांगलिक कार्य आरंभ करने हेतु अत्यंत शुभ फलदायी।',
    });
  }

  // 2. Amrita Siddhi Yoga (अमृत सिद्धि योग)
  // Sun+13 (Hasta), Mon+5 (Mrigashira), Tue+1 (Ashwini), Wed+17 (Anuradha), Thu+8 (Pushya), Fri+27 (Revati), Sat+4 (Rohini)
  const asyMap: Record<number, number> = {
    0: 13,
    1: 5,
    2: 1,
    3: 17,
    4: 8,
    5: 27,
    6: 4,
  };

  if (asyMap[weekday] === nakNum) {
    let caution = '';
    if (weekday === 2 && nakNum === 1) caution = ' (मंगल-अश्विनी: गृहप्रवेश त्याज्य रखें)';
    if (weekday === 6 && nakNum === 4) caution = ' (शनि-रोहिणी: यात्रा त्याज्य रखें)';

    yogas.push({
      id: 'amrita_siddhi',
      name: `अमृत सिद्धि योग${caution}`,
      type: 'auspicious',
      badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      description: 'अमृत के समान अमर फल देने वाला दुर्लभ योग।',
      guidance: 'दीर्घकालीन सफलता, मंत्र साधना, चिकित्सा व शुभ प्रतिष्ठानों हेतु अमृत फलदायी।',
    });
  }

  // 3. Guru Pushya Yoga (गुरु पुष्य योग)
  if (weekday === 4 && nakNum === 8) {
    yogas.push({
      id: 'guru_pushya',
      name: '👑 गुरु पुष्य अमृत महायोग',
      type: 'rare',
      badgeColor: 'bg-yellow-200 text-yellow-950 border-yellow-400 font-black',
      description: 'वर्ष का सबसे श्रेष्ठ व दुर्लभ नक्षत्र योग। देवगुरु बृहस्पति व पुष्य नक्षत्र का साक्षात संगम।',
      guidance: 'स्वर्ण, संपत्ति, वाहन, नवीन व्यापार, विद्या व देव प्रतिष्ठा हेतु साक्षात अक्षय फलदायी।',
    });
  }

  // 4. Ravi Pushya Yoga (रवि पुष्य योग)
  if (weekday === 0 && nakNum === 8) {
    yogas.push({
      id: 'ravi_pushya',
      name: '☀️ रवि पुष्य महायोग',
      type: 'rare',
      badgeColor: 'bg-orange-100 text-orange-950 border-orange-400 font-black',
      description: 'भगवान सूर्यनारायण एवं पुष्य नक्षत्र का तेजस्वी संयोग।',
      guidance: 'आरोग्य लाभ, प्रशासनिक कार्य, तंत्र-मंत्र सिद्धि एवं आभूषण क्रय हेतु विशेष शुभ।',
    });
  }

  // 5. Dwipushkar / Tripushkar Yoga (द्विपुष्कर एवं त्रिपुष्कर योग)
  // Bhadra tithis: 2 (Dwitiya), 7 (Saptami), 12 (Dwadashi)
  const isBhadraTithi = [2, 7, 12, 17, 22, 27].includes(tithiNum);
  const isPushkarDay = [0, 2, 6].includes(weekday); // Sunday, Tuesday, Saturday

  if (isPushkarDay && isBhadraTithi) {
    // Dwipushkar nakshatras (Dvipāda): Mrigashirsha (5), Chitra (14), Dhanishta (23)
    if ([5, 14, 23].includes(nakNum)) {
      yogas.push({
        id: 'dwipushkar',
        name: 'द्विपुष्कर योग',
        type: 'cautious',
        badgeColor: 'bg-indigo-100 text-indigo-900 border-indigo-300',
        description: 'इस योग में किए गए कार्य का फल दोगुना (दो बार) प्राप्त होता है।',
        guidance: 'लाभ, संपत्ति क्रय, दान व शुभ कार्य अति उत्तम। भूलकर भी कर्ज न लें और विवाद से बचें।',
      });
    }

    // Tripushkar nakshatras (Tripāda): Krittika (3), Punarvasu (7), Uttara Phalguni (12), Vishakha (16), Uttara Ashadha (21), Purva Bhadrapada (25)
    if ([3, 7, 12, 16, 21, 25].includes(nakNum)) {
      yogas.push({
        id: 'tripushkar',
        name: 'त्रिपुष्कर योग',
        type: 'cautious',
        badgeColor: 'bg-purple-100 text-purple-900 border-purple-300',
        description: 'इस योग में किए गए कार्य का परिणाम तीन गुना (तीन बार) होता है।',
        guidance: 'भूमि, मकान, वाहन क्रय व आभूषण निर्माण शुभ। ऋण देना या लेना और मृत्यु/अशुभ कार्य वर्जित।',
      });
    }
  }

  return yogas;
}

/**
 * Calculates Panchak (पञ्चक) and Bhadra (भद्रा) status:
 * - Panchak occurs when Moon is in Dhanishta (last half), Shatabhisha, Purva Bhadrapada, Uttara Bhadrapada, or Revati (Kumbha & Meena Rashi).
 * - Bhadra (Vishti Karana) occurs in specific tithi halves, with residence in Heaven, Netherworld, or Earth based on Moon Rashi.
 */
export function calculatePanchakAndBhadra(panchang: VedicPanchangData): {
  panchak: PanchakStatus;
  bhadra: BhadraStatus;
} {
  const weekday = panchang.date.getDay();
  const nakNum = panchang.nakshatraNumber;
  const lunarRashi = panchang.lunarRashi || '';

  // 1. Panchak Check:
  // Nakshatras 23 (Dhanishta), 24 (Shatabhisha), 25 (Purva Bhadrapada), 26 (Uttara Bhadrapada), 27 (Revati)
  // or Lunar Rashi Kumbha / Meena
  const isPanchak = [23, 24, 25, 26, 27].includes(nakNum) || lunarRashi.includes('कुंभ') || lunarRashi.includes('मीन');

  let panchakType = 'सामान्य पञ्चक';
  let panchakNature: 'auspicious' | 'moderate' | 'inauspicious' = 'moderate';
  let panchakDesc = 'चन्द्रमा कुंभ अथवा मीन राशि में स्थित होने से पञ्चक काल मान्य है।';
  let remedy = 'पञ्चक के दौरान दक्षिण दिशा यात्रा, छत ढलाई, चारपाई बुनना व तृण संग्रह से बचें।';

  if (isPanchak) {
    switch (weekday) {
      case 0:
        panchakType = 'रोग पञ्चक';
        panchakNature = 'inauspicious';
        panchakDesc = 'रविवार को आरंभ पञ्चक शारीरिक अस्वस्थता व कष्ट कारक माना गया है।';
        remedy = 'स्वास्थ्य का विशेष ध्यान रखें, नए उपचार या जोखिम न लें।';
        break;
      case 1:
        panchakType = 'राज पञ्चक';
        panchakNature = 'auspicious';
        panchakDesc = 'सोमवार को आरंभ पञ्चक शासकीय व प्रशासनिक कार्यों में विजय व सफलता देता है।';
        remedy = 'सरकारी कार्य, पदग्रहण व संपत्ति मामलों में अनुकूल।';
        break;
      case 2:
        panchakType = 'अग्नि पञ्चक';
        panchakNature = 'inauspicious';
        panchakDesc = 'मंगलवार को आरंभ पञ्चक में अग्नि भय, विवाद व औजार से सावधानी रखनी चाहिए।';
        remedy = 'विवादों से बचें, भूमि निर्माण व अग्नि कार्य में सतर्क रहें।';
        break;
      case 3:
      case 4:
        panchakType = 'दोषमुक्त पञ्चक';
        panchakNature = 'moderate';
        panchakDesc = 'बुधवार व गुरुवार का पञ्चक सामान्य व मध्यम फलदायी होता है।';
        remedy = 'केवल शास्त्रोक्त ५ मुख्य वर्जित कार्यों का परिहार करें।';
        break;
      case 5:
        panchakType = 'चोर पञ्चक';
        panchakNature = 'inauspicious';
        panchakDesc = 'शुक्रवार को आरंभ पञ्चक में धन हानि, यात्रा में चोरी या नुकसान की संभावना रहती है।';
        remedy = 'धन लेन-देन, कीमती सामान व यात्रा में विशेष सतर्कता रखें।';
        break;
      case 6:
        panchakType = 'मृत्यु पञ्चक';
        panchakNature = 'inauspicious';
        panchakDesc = 'शनिवार को आरंभ पञ्चक अत्यंत कष्टदायक माना गया है। कोई जोखिम न लें।';
        remedy = 'हनुमान चालीसा या महामृत्युंजय जप करें, नवीन कार्य प्रारंभ न करें।';
        break;
    }
  }

  const panchak: PanchakStatus = {
    isActive: isPanchak,
    type: panchakType,
    typeNameHindi: panchakType,
    nature: panchakNature,
    rashi: lunarRashi,
    nakshatra: panchang.nakshatra,
    description: panchakDesc,
    remedy,
    forbiddenActs: [
      '१. दक्षिण दिशा की यात्रा न करें।',
      '२. मकान की छत (लेंटर) न ढालें।',
      '३. चारपाई/पलंग बुनना या खरीदना त्याज्य रखें।',
      '४. तृण, लकड़ी अथवा ईंधनों का अनावश्यक संचय न करें।',
      '५. दाह संस्कार में ५ आटे/कुश के पुतले बनाकर विशेष पञ्चक शान्ति करें।',
    ],
  };

  // 2. Bhadra Check:
  // Bhadra corresponds to Vishti Karana (विष्टि करण)
  const isVishti = panchang.karana === 'विष्टि' || panchang.karanaNumber === 7;
  // Also check tithi for partial bhadra
  const tithiNum = panchang.tithiNumber;
  const isKrishna = panchang.paksha.includes('कृष्ण');
  const hasBhadraToday = isVishti ||
    (isKrishna && [3, 7, 10, 14].includes(tithiNum % 15)) ||
    (!isKrishna && [4, 8, 11, 15].includes(tithiNum % 15));

  let vas: 'स्वर्गलोक' | 'पाताललोक' | 'मृत्युलोक' | 'अनुपस्थित' = 'अनुपस्थित';
  let vasEnglish: 'heaven' | 'netherworld' | 'earth' | 'none' = 'none';
  let nature: 'shubh' | 'neutral' | 'varjya' = 'neutral';
  let impactDescription = 'आज दिन में भद्रा का कोई प्रतिकूल प्रभाव नहीं है।';
  let guidance = 'समस्त शुभ कार्य शास्त्रानुसार निर्विघ्न किए जा सकते हैं।';

  if (hasBhadraToday) {
    // Classical Bhadra Vas Rule based on Moon Rashi:
    // Mesha, Vrishabha, Mithuna, Kumbha -> Swarga Loka (Heaven) - "स्वर्गे भद्रा शुभं कुर्यात्" (Good, no harm on earth)
    // Karka, Simha, Dhanu, Makara -> Patala Loka (Netherworld) - "पाताले च धनागमा" (Wealth, no harm on earth)
    // Kanya, Tula, Vrishchika, Meena -> Mrityu Loka (Earth) - "मृत्युलोके यदा भद्रा सर्वकार्य विनाशिनी" (Destroys all work on Earth - STRICTLY AVOID)
    if (['मेष', 'वृषभ', 'मिथुन', 'कुंभ'].some((r) => lunarRashi.includes(r))) {
      vas = 'स्वर्गलोक';
      vasEnglish = 'heaven';
      nature = 'shubh';
      impactDescription = 'भद्रा स्वर्गलोक में स्थित है ("स्वर्गे भद्रा शुभं कुर्यात्")।';
      guidance = 'पृथ्वी पर इसका कोई दोष नहीं है। शुभ व मांगलिक कार्य निर्विघ्न संपन्न किए जा सकते हैं।';
    } else if (['कर्क', 'सिंह', 'धनु', 'मकर'].some((r) => lunarRashi.includes(r))) {
      vas = 'पाताललोक';
      vasEnglish = 'netherworld';
      nature = 'shubh';
      impactDescription = 'भद्रा पाताललोक में स्थित है ("पाताले च धनागमा")।';
      guidance = 'पृथ्वी पर भद्रा का वास नहीं है। यह धन-धान्य की वृद्धि करती है, शुभ कार्यों में दोष नहीं है।';
    } else {
      vas = 'मृत्युलोक';
      vasEnglish = 'earth';
      nature = 'varjya';
      impactDescription = '⚠️ भद्रा मृत्युलोक (पृथ्वी) में निवास कर रही है ("मृत्युलोके सर्वकार्य विनाशिनी")।';
      guidance = 'पृथ्वी पर भद्रा काल में विवाह, गृहप्रवेश, मुंडन, नवीन व्यापार व यात्रा सर्वथा त्याज्य है।';
    }
  }

  const bhadra: BhadraStatus = {
    isActive: hasBhadraToday,
    vas,
    vasEnglish,
    nature,
    impactDescription,
    guidance,
  };

  return { panchak, bhadra };
}
