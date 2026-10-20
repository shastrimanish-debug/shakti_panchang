import { KundaliData, PlanetPosition, VedicPanchangData } from '../types';
import { RASHIS, NAKSHATRAS, NAKSHATRA_LORDS } from './astronomy';
import { SIGN_LORDS } from './predictions';
import { calculateSadeSati, calculateDailyTransits, PlanetTransitInfo } from './sadesati';

export interface MicroHouseLordInfo {
  house: number;
  houseName: string;
  sign: string;
  lord: string;
  lordPlacementHouse: number;
  lordDignity: 'उच्च' | 'नीच' | 'स्वक्षेत्र' | 'मित्र' | 'सम' | 'शत्रु';
  isLordRetrograde: boolean;
  occupants: string[];
}

export interface MicroPlanetDetail {
  planet: string;
  house: number;
  rashi: string;
  degree: number;
  isRetrograde: boolean;
  nakshatra: string;
  pada: number;
  nakshatraLord: string;
  navamshaRashi: string; // D9
  dashamshaRashi: string; // D10
  dignity: 'उच्च' | 'नीच' | 'स्वक्षेत्र' | 'सामान्य';
}

export interface MicroAstrologyProfile {
  name: string;
  lagnaRashi: string;
  lagnaLord: string;
  lagnaLordHouse: number;
  moonRashi: string;
  moonNakshatra: string;
  mahadasha: string;
  antardasha: string;
  pratyantardasha: string;
  houseLords: MicroHouseLordInfo[];
  planets: Record<string, MicroPlanetDetail>;
  sadeSatiSummary: string;
  manglikStatus: string;
  keyAfflictions: string[];
  keyStrengths: string[];
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
  1: 'तनु (प्रथम - व्यक्तित्व व देह)',
  2: 'धन (द्वितीय - वाणी व संपत्ति)',
  3: 'सहज (तृतीय - पराक्रम व भ्राता)',
  4: 'सुख (चतुर्थ - माता, गृह व वाहन)',
  5: 'सुत (पंचम - बुद्धि, विद्या व संतान)',
  6: 'रिपु (षष्ठ - रोग, ऋण व शत्रु)',
  7: 'जाया (सप्तम - दांपत्य व साझेदारी)',
  8: 'आयु (अष्टम - आयु, संकट व गूढ़ ज्ञान)',
  9: 'धर्म (नवम - भाग्य, धर्म व गुरु)',
  10: 'कर्म (दशम - आजीविका, पद व व्यापार)',
  11: 'लाभ (एकादश - आय, लाभ व सफलता)',
  12: 'व्यय (द्वादश - व्यय, मोक्ष व विदेश)',
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
 * Calculates dynamic consultation timelines based on a target reference date.
 * Guarantees zero hardcoded month names or static years!
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

  const nearStart = addMonths(2);
  const nearEnd = addMonths(5);
  const peakMonth = addMonths(4);
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

/**
 * Perform complete micro-astrological calculation for a Kundali
 */
export function buildMicroAstrologyProfile(k: KundaliData): MicroAstrologyProfile {
  const lagnaIdx = (k.lagnaRashiNumber - 1 + 12) % 12;
  const planetsMap: Record<string, MicroPlanetDetail> = {};
  const houseOccupants: Record<number, string[]> = {};
  for (let i = 1; i <= 12; i++) houseOccupants[i] = [];

  for (const p of k.planets) {
    const pRashiIdx = RASHIS.indexOf(p.rashi);
    const navD9 = calculateNavamshaRashi(pRashiIdx >= 0 ? pRashiIdx : 0, p.degreeInRashi || p.degree || 15);
    const d10 = calculateDashamshaRashi(pRashiIdx >= 0 ? pRashiIdx : 0, p.degreeInRashi || p.degree || 15);

    let dig: 'उच्च' | 'नीच' | 'स्वक्षेत्र' | 'सामान्य' = 'सामान्य';
    if (EXALTATION_MAP[p.planet] === p.rashi) dig = 'उच्च';
    else if (DEBILITATION_MAP[p.planet] === p.rashi) dig = 'नीच';
    else if (OWN_SIGNS_MAP[p.planet]?.includes(p.rashi)) dig = 'स्वक्षेत्र';

    const nakshatraIdx = NAKSHATRAS.indexOf(p.nakshatra);
    const nakLord = nakshatraIdx >= 0 ? NAKSHATRA_LORDS[nakshatraIdx % 9] : 'अज्ञात';

    planetsMap[p.planet] = {
      planet: p.planet,
      house: p.house,
      rashi: p.rashi,
      degree: p.degreeInRashi || p.degree || 15,
      isRetrograde: !!p.isRetrograde,
      nakshatra: p.nakshatra,
      pada: p.pada || 1,
      nakshatraLord: nakLord,
      navamshaRashi: navD9,
      dashamshaRashi: d10,
      dignity: dig,
    };

    if (p.house >= 1 && p.house <= 12) {
      houseOccupants[p.house].push(p.planet);
    }
  }

  // Calculate House Lords (1 to 12)
  const houseLords: MicroHouseLordInfo[] = [];
  const keyAfflictions: string[] = [];
  const keyStrengths: string[] = [];

  for (let h = 1; h <= 12; h++) {
    const signIdx = (lagnaIdx + h - 1) % 12;
    const signName = RASHIS[signIdx];
    const lordPlanetName = SIGN_LORDS[signName] || 'गुरु';
    const lordDetail = planetsMap[lordPlanetName];

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
    };
    houseLords.push(houseInfo);

    if (lordDetail && [6, 8, 12].includes(lordDetail.house)) {
      keyAfflictions.push(`${h}वें भाव का स्वामी ${lordPlanetName} ${lordDetail.house}वें (त्रिक/दुस्थान) भाव में स्थित है`);
    }
    if (lordDetail && lordDetail.isRetrograde) {
      keyAfflictions.push(`${h}वें भाव का स्वामी ${lordPlanetName} वक्री गति में है`);
    }
    if (lordDetail && lordDetail.dignity === 'उच्च') {
      keyStrengths.push(`${h}वें भाव का स्वामी ${lordPlanetName} उच्च राशि में विराजित है`);
    }
    if (lordDetail && lordDetail.dignity === 'स्वक्षेत्र') {
      keyStrengths.push(`${h}वें भावेश ${lordPlanetName} स्वक्षेत्री होकर बली है`);
    }
  }

  let sadeSatiSummary = 'साढ़ेसाती नहीं है।';
  try {
    const sade = calculateSadeSati(k);
    sadeSatiSummary = sade.isUnderSadeSati
      ? `शनि की साढ़ेसाती प्रभावी (${sade.summary})`
      : sade.isDhaiya
        ? `शनि की ढैया प्रभावी (${sade.dhaiyaType || 'गोचर ढैया'})`
        : `साढ़ेसाती नहीं है, शनि वर्तमान में ${sade.shaniCurrentRashi} में गोचर कर रहे हैं।`;
  } catch {
    /* fallback */
  }

  const lagnaLordName = SIGN_LORDS[k.lagnaRashi] || 'गुरु';
  const lagnaLordDetail = planetsMap[lagnaLordName];

  return {
    name: k.name || 'जातक',
    lagnaRashi: k.lagnaRashi,
    lagnaLord: lagnaLordName,
    lagnaLordHouse: lagnaLordDetail ? lagnaLordDetail.house : 1,
    moonRashi: k.moonRashi,
    moonNakshatra: k.nakshatra,
    mahadasha: k.mahadasha,
    antardasha: k.antardasha,
    pratyantardasha: k.pratyantardasha,
    houseLords,
    planets: planetsMap,
    sadeSatiSummary,
    manglikStatus: k.isManglik ? `मांगलिक योग (${k.manglikDescription || 'मंगल लग्न/सप्तम/अष्टम/द्वादश में'})` : 'अमंगल रहित / सामान्य',
    keyAfflictions,
    keyStrengths,
  };
}

/**
 * Build rich micro-astrology context formatted string for Gemini AI Prompt
 */
export function buildMicroAstrologyContextPrompt(k: KundaliData): string {
  const profile = buildMicroAstrologyProfile(k);

  const houseDetails = profile.houseLords
    .map((h) => {
      const occStr = h.occupants.length ? `[स्थित ग्रह: ${h.occupants.join(', ')}]` : '[रिक्त भाव]';
      return `भाव ${h.house} (${h.sign}): भावेश = ${h.lord} (जो ${h.lordPlacementHouse}वें भाव में है, अवस्था: ${h.lordDignity}${h.isLordRetrograde ? ', वक्री' : ''}) ${occStr}`;
    })
    .join('\n');

  const planetDetails = Object.values(profile.planets)
    .map((p) => {
      return `${p.planet}: ${p.rashi} राशि (${p.degree.toFixed(1)}°), भाव ${p.house}, नक्षत्र: ${p.nakshatra} (चरण ${p.pada}, स्वामी ${p.nakshatraLord}), D9 नवमांश: ${p.navamshaRashi}, D10 दशमांश: ${p.dashamshaRashi}, अवस्था: ${p.dignity}${p.isRetrograde ? ' (वक्री)' : ''}`;
    })
    .join('\n');

  return `========================================================
सूक्ष्म ज्योतिषीय गणना एवं वर्ग विश्लेषण डेटा (MICRO ASTROLOGY METRICS):
========================================================
जातक नाम: ${profile.name}
लग्न राशि: ${profile.lagnaRashi} (लग्नेश: ${profile.lagnaLord}, जो ${profile.lagnaLordHouse}वें भाव में स्थित हैं)
चंद्र राशि: ${profile.moonRashi} (चंद्र नक्षत्र: ${profile.moonNakshatra})
विंशोत्तरी दशा: महादशा ${profile.mahadasha} • अंतर्दशा ${profile.antardasha} • प्रत्यंतर्दशा ${profile.pratyantardasha}
मांगलिक स्थिति: ${profile.manglikStatus}
शनि गोचर स्थिति: ${profile.sadeSatiSummary}

प्रत्येक भाव व भावेश की स्थिति (12 House Lords Micro Placement):
${houseDetails}

ग्रहों की सूक्ष्म स्थिति, नवमांश (D9) व दशमांश (D10) गणित:
${planetDetails}

मुख्य ग्रह स्थिति/क्लेश (Afflictions):
${profile.keyAfflictions.length ? profile.keyAfflictions.join('; ') : 'कोई मुख्य दुस्थान भावेश क्लेश नहीं'}

मुख्य बल व शुभ योग (Strengths):
${profile.keyStrengths.length ? profile.keyStrengths.join('; ') : 'सामान्य ग्रह स्थिति'}
========================================================`;
}

const PLANET_REMEDY: Record<string, { mantra: string; japaCount: string; daan: string; habit: string }> = {
  सूर्य: {
    mantra: '॥ ॐ ह्रां ह्रीं ह्रौं सः सूर्याय नमः ॥ अथवा ॥ ॐ घृणिः सूर्याय नमः ॥',
    japaCount: '१०८ बार नित्य प्रातः',
    daan: 'रविवार को ताँबे का पात्र, गुड़, गेहूँ या लाल चंदन किसी सुपात्र या मंदिर में दें।',
    habit: 'नित्य प्रातः उगते सूर्य को तांबे के लोटे से रोली-अक्षत मिश्रित जल का अर्घ्य दें एवं पिता का चरण स्पर्श करें।',
  },
  चंद्र: {
    mantra: '॥ ॐ श्रां श्रीं श्रौं सः चंद्रमसे नमः ॥ अथवा ॥ ॐ सों सोमाय नमः ॥',
    japaCount: '१०८ बार सायंकाल',
    daan: 'सोमवार को दूध, दही, चावल, श्वेत वस्त्र या मिश्री का दान करें।',
    habit: 'प्रति सोमवार शिवलिंग पर कच्चा दूध व जल चढ़ाएं, चांदी का चौकोर टुकड़ा अपने पास रखें व माता का आशीर्वाद लें।',
  },
  मंगल: {
    mantra: '॥ ॐ क्रां क्रीं क्रौं सः भौमाय नमः ॥ अथवा ॥ ॐ अं अंगारकाय नमः ॥',
    japaCount: '१०८ बार मंगलवार प्रातः',
    daan: 'मंगलवार को लाल मसूर की दाल, लाल वस्त्र, गुड़ या ताँबा दान करें।',
    habit: 'नित्य श्री हनुमान चालीसा व ऋणमोचक मंगल स्तोत्र का पाठ करें, मीठी तंदूरी रोटी पक्षियों/कुत्तों को दें।',
  },
  बुध: {
    mantra: '॥ ॐ ब्रां ब्रीं ब्रौं सः बुधाय नमः ॥ अथवा ॥ ॐ बुं बुधाय नमः ॥',
    japaCount: '१०८ बार बुधवार प्रातः',
    daan: 'बुधवार को साबुत हरी मूंग, हरी सब्जियाँ, हरे फल या काँसे का बर्तन दान करें।',
    habit: 'श्रीगणेश जी को २१ दूर्वा दल अर्पित करें, गणेश संकटनाशन स्तोत्र पढ़ें, कन्याओं का आदर कर दक्षिणा दें।',
  },
  गुरु: {
    mantra: '॥ ॐ ग्रां ग्रीं ग्रौं सः गुरवे नमः ॥ अथवा ॥ ॐ बृं बृहस्पतये नमः ॥',
    japaCount: '१०८ बार गुरुवार प्रातः',
    daan: 'गुरुवार को चने की दाल, पीला वस्त्र, केला, केसर, हल्दी या धार्मिक ग्रंथ का दान करें।',
    habit: 'नित्य मस्तक व नाभि पर केसर अथवा हल्दी का तिलक लगाएं, पीपल के वृक्ष को जल दें एवं गुरुजनों का सम्मान करें।',
  },
  शुक्र: {
    mantra: '॥ ॐ द्रां द्रीं द्रौं सः शुक्राय नमः ॥ अथवा ॥ ॐ शुं शुक्राय नमः ॥',
    japaCount: '१०८ बार शुक्रवार संध्या',
    daan: 'शुक्रवार को श्वेत वस्त्र, चावल, चीनी, घी, कपूर या सफेद मिठाई का दान करें।',
    habit: 'श्रीसूक्त या कनकधारा स्तोत्र का पाठ करें, घर के मंदिर में शुद्ध देशी घी का दीपक जलाएं, इत्र का प्रयोग करें।',
  },
  शनि: {
    mantra: '॥ ॐ प्रां प्रीं प्रौं सः शनैश्चराय नमः ॥ अथवा ॥ ॐ शं शनैश्चराय नमः ॥',
    japaCount: '१०८ बार शनिवार संध्याकाल',
    daan: 'शनिवार को सरसों का तेल, काले उड़द, काला कंबल, जूते-चप्पल या लोहे का सामान दान करें।',
    habit: 'शनिवार संध्या पीपल के नीचे सरसों के तेल का दीपक प्रज्वलित करें, छाया दान करें और श्रमिकों व असहायों की सेवा करें।',
  },
  राहु: {
    mantra: '॥ ॐ भ्रां भ्रीं भ्रौं सः राहवे नमः ॥ अथवा ॥ ॐ रां राहवे नमः ॥',
    japaCount: '१०८ बार रात्रि के समय',
    daan: 'शनिवार अथवा बुधवार को जटा वाला सूखा नारियल, काले तिल, जौ या मूली का दान करें।',
    habit: 'नारियल बहते जल में प्रवाहित करें, भैरव चालीसा पढ़ें, ससुराल पक्ष से संबंध सौहार्दपूर्ण रखें व नशा न करें।',
  },
  केतु: {
    mantra: '॥ ॐ स्रां स्रीं स्रौं सः केतवे नमः ॥ अथवा ॥ ॐ कें केतवे नमः ॥',
    japaCount: '१०८ बार प्रातः अथवा संध्या',
    daan: 'दो-रंगा (काला-सफेद) कंबल, तिल, उड़द या गर्म वस्त्र जरूरतमंद को दान करें।',
    habit: 'दो-रंगे कुत्ते को मीठी रोटी खिलाएं, गणेश अथर्वशीर्ष का नित्य पाठ करें व कानों में स्वर्ण धारण करें।',
  },
};

export interface TopicInsight {
  house: number;
  title: string;
  karaka: string;
  category: 'career' | 'finance' | 'marriage' | 'health' | 'education' | 'property' | 'travel' | 'spiritual' | 'general';
  shloka: string;
  shlokaMeaning: string;
  followUps: string[];
}

export function detectConsultationTopic(query: string): TopicInsight {
  const q = query.toLowerCase().trim();

  // 1. App / Startup / Career / Job / Promotion / Business
  if (/app|application|startup|website|youtube|channel|project|काम|कामयाब|सफल|सफलता|job|career|business|dhandha|धंधा|दुकान|सैलरी|प्रमोशन|तनख्वाह|नौकरी|करियर|पद|सक्सेस|success|growth|tarakki|tarqqi|इंटरव्यू|interview/.test(q)) {
    return {
      house: 10,
      title: 'कर्म, आजीविका, व्यापार व डिजिटल परियोजना सफलता',
      karaka: 'सूर्य',
      category: 'career',
      shloka: '॥ कर्मण्येवाधिकारस्ते मा फलेषु कदाचन। मा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि॥',
      shlokaMeaning: 'श्रीमद्भगवद्गीता के अनुसार निष्काम भाव से किया गया पुरुषार्थ दशम भाव के कर्मेश व सूर्य की कृपा से अक्षय सिद्धि देता है।',
      followUps: [
        'कार्यक्षेत्र में बड़ी सफलता हेतु अनुकूल दिशा और शुभ मुहूर्त क्या है?',
        'क्या मेरी कुंडली में स्वतंत्र व्यापार उत्तम है अथवा नौकरी?',
        'करियर में विघ्न निवारण हेतु कौन सा रुद्राक्ष या रत्न धारण करें?'
      ]
    };
  }

  // 2. Debt / Karja / Loan / Udhaar / Recovery
  if (/कर्ज|करजा|ऋण|लोन|उधार|किस्त|emi|karja|karza|kardja|loan|debt|udhaar|utarega|utrega|chukega|तंगी|कंगाली|दिवालिया/.test(q)) {
    return {
      house: 6,
      title: 'ऋण मुक्ति, कर्ज निवारण व आर्थिक शांति योग',
      karaka: 'मंगल',
      category: 'finance',
      shloka: '॥ ऋणहर्ता सर्वसिद्धिप्रदो देवो धरणीगर्भसंभवः। कुमारो शक्तिहस्तश्च मङ्गलो मङ्गलं प्रदः॥',
      shlokaMeaning: 'धरणीपुत्र मंगल देव की आराधना से षष्ठ भाव जनित समस्त प्रकार के ऋण व बाधाओं का समूल नाश होता है।',
      followUps: [
        'कर्ज से शीघ्र मुक्ति हेतु ऋणमोचक मंगल स्तोत्र की जप विधि बताएं।',
        'मेरी कुंडली में धन आगमन के नए स्रोत कब से खुलेंगे?',
        'अचानक धन लाभ व रुका हुआ पैसा वापस पाने के अचूक उपाय क्या हैं?'
      ]
    };
  }

  // 3. Marriage / Relationship / Love / Divorce / Manglik
  if (/शादी|विवाह|दांपत्य|पति|पत्नी|प्रेम|रिश्ता|तलाक|shadi|shaadi|marriage|love|husband|wife|rishta|bf|gf|सगाई|जीवनसाथी|विवाह कब/.test(q)) {
    return {
      house: 7,
      title: 'विवाह, दांपत्य सुख, सुयोग्य जीवनसाथी व मांगलिक विचार',
      karaka: 'शुक्र',
      category: 'marriage',
      shloka: '॥ कात्यायनि महामाये महायोगिन्यधीश्वरि। नन्दगोपसुतं देवि पतिं मे कुरु ते नमः॥',
      shlokaMeaning: 'भगवती कात्यायनी की कृपा से सप्तम भावगत समस्त अड़चनें दूर होकर सुयोग्य वर/कन्या की प्राप्ति होती है।',
      followUps: [
        'मेरी कुंडली में जीवनसाथी का स्वभाव, रूप-रंग और दिशा कैसी होगी?',
        'क्या मेरी कुंडली में मांगलिक दोष है और उसका सरल परिहार क्या है?',
        'शीघ्र विवाह हेतु कौन सा व्रत, मंत्र अथवा दान सर्वश्रेष्ठ है?'
      ]
    };
  }

  // 4. Wealth / Money / Finance / Earnings / Bank Balance
  if (/पैसा|धन|कमाई|आय|रुपया|money|wealth|finance|paisa|kamai|earning|income|bank balance|लक्ष्मी|दरिद्रता|अमीरी/.test(q)) {
    return {
      house: 2,
      title: 'अखंड धन संपदा, संचित कोष व आय वृद्धि योग',
      karaka: 'गुरु',
      category: 'finance',
      shloka: '॥ ॐ सर्वाबाधाविनिर्मुक्तो धनधान्यसुतान्वितः। मनुष्यो मत्प्रसादेन भविष्यति न संशयः॥',
      shlokaMeaning: 'महामाया महालक्ष्मी के अनुग्रह से द्वितीय (धन) व एकादश (लाभ) भाव परिपुष्ट होकर अखंड समृद्धि प्रदान करते हैं।',
      followUps: [
        'स्थाई धन संचय के लिए तिजोरी/कार्यस्थल पर कौन सा यंत्र स्थापित करें?',
        'मेरी जन्मपत्रिका के अनुसार इष्टदेव कौन हैं जिनकी पूजा से भाग्योदय हो?',
        'आगामी वर्ष में निवेश व संपत्ति क्रय करने का सबसे शुभ समय क्या है?'
      ]
    };
  }

  // 5. Health / Disease / Sickness / Longevity
  if (/सेहत|स्वास्थ्य|बीमार|रोग|दर्द|नींद|health|disease|sick|bimari|bimar|doctor|dawai|अस्पताल|कष्ट|तबीयत/.test(q)) {
    return {
      house: 6,
      title: 'आरोग्य लाभ, स्वास्थ्य रक्षा व दीर्घायु योग',
      karaka: 'मंगल',
      category: 'health',
      shloka: '॥ ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम्। उर्वारुकमिव बन्धनान्मृत्योर्मुक्षीय माऽमृतात्॥',
      shlokaMeaning: 'भगवान महामृत्युंजय की उपासना से अकाल मृत्यु, असाध्य व्याधियां व शारीरिक क्लेश नष्ट होते हैं।',
      followUps: [
        'रोग मुक्ति हेतु महामृत्युंजय जप की शास्त्रीय विधि क्या है?',
        'शारीरिक व मानसिक शांति हेतु कौन सा भोजन व दिनचर्या रखें?',
        'स्वास्थ्य रक्षा के लिए कौन सा ताबीज या रक्षा सूत्र धारण करें?'
      ]
    };
  }

  // 6. Child / Education / Exam / Intellect
  if (/संतान|बच्चा|बेटा|बेटी|पढ़ाई|परीक्षा|विद्या|education|child|exam|result|bachha|bacha|pass|गर्भाधान|डिग्री/.test(q)) {
    return {
      house: 5,
      title: 'उच्च विद्या, मेधा शक्ति व संतान सुख योग',
      karaka: 'गुरु',
      category: 'education',
      shloka: '॥ ॐ सरस्वत्यै च विद्महे ब्रह्मपुत्र्यै च धीमहि। तन्नो देवी प्रचोदयात्॥',
      shlokaMeaning: 'माँ सरस्वती एवं देवगुरु बृहस्पति की कृपा से पंचम भाव जाग्रत होकर प्रखर बुद्धि व श्रेष्ठ संतति प्रदान करता है।',
      followUps: [
        'प्रतियोगी परीक्षा में शीर्ष सफलता हेतु स्मरण शक्ति कैसे बढ़ाएं?',
        'संतान सुख में आ रहे विलंब के निवारण हेतु गोपाल सहस्रनाम विधि बताएं।',
        'विद्या व एकाग्रता के लिए कौन सा अध्ययन कक्ष वास्तु नियम अपनाएं?'
      ]
    };
  }

  // 7. Property / House / Land / Vehicle
  if (/मकान|घर|ज़मीन|जमीन|वाहन|गाड़ी|प्रॉपर्टी|property|vehicle|home|land|car|makan|gaadi|फ्लैट/.test(q)) {
    return {
      house: 4,
      title: 'गृह निर्माण, अचल संपत्ति, भूमि व वाहन प्राप्ति योग',
      karaka: 'चंद्र',
      category: 'property',
      shloka: '॥ ॐ वास्तुपुरुषाय नमः। सर्वदोषनिवारणाय गृहप्रवेशे सौख्यं देहि॥',
      shlokaMeaning: 'चतुर्थ भाव व भूमिपुत्र मंगल के बली होने से जातक को भूमि, भवन व श्रेष्ठ वाहन सुख की प्राप्ति होती है।',
      followUps: [
        'नया मकान या फ्लैट खरीदने के लिए आगामी महीनों में कौन सा मुहूर्त सर्वोत्तम है?',
        'घर में सुख-शांति व वास्तु दोष निवारण हेतु क्या करें?',
        'वाहन क्रय करते समय किस रंग व दिन का चयन करना चाहिए?'
      ]
    };
  }

  // 8. Foreign / Travel / Visa / Settlement
  if (/विदेश|यात्रा|खर्च|व्यय|foreign|travel|expense|visa|passport|videsh|पीआर|pr|इमिग्रेशन/.test(q)) {
    return {
      house: 12,
      title: 'विदेश यात्रा, वीज़ा प्राप्ति व सुदूर प्रवास योग',
      karaka: 'शनि',
      category: 'travel',
      shloka: '॥ ॐ नमो भगवते वासुदेवाय। सर्वयात्रासु सिद्धिमस्तु मे॥',
      shlokaMeaning: 'द्वादश व नवम भाव का परस्पर संबंध जातक को सागर पार प्रतिष्ठा व विदेशी भूमि पर भाग्योदय कराता है।',
      followUps: [
        'वीज़ा व विदेश यात्रा में आ रही रुकावटों को कैसे दूर करें?',
        'क्या मेरी पत्रिका में विदेश में स्थाई निवास (PR) का योग है?',
        'यात्रा के दौरान दिशाशूल व राहुकाल से बचने के शास्त्रीय नियम क्या हैं?'
      ]
    };
  }

  // Default General Astrology / Fate / Destiny
  return {
    house: 9,
    title: 'सर्वतोमुखी भाग्योदय, ग्रह शांति व आत्मिक उन्नति योग',
    karaka: 'गुरु',
    category: 'general',
    shloka: '॥ ग्रहा राज्यं प्रयच्छन्ति ग्रहा राज्यं हरन्ति च। ग्रहैर्व्याप्तमिदं सर्वं त्रैलोक्यं सचराचरम्॥',
    shlokaMeaning: 'नवग्रह ही मनुष्य के संचित कर्मों के अनुसार सुख-दुःख व उत्थान-पतन का विधान करते हैं।',
    followUps: [
      'मेरी कुंडली के अनुसार मेरा भाग्योदय किस वर्ष व किस आयु में होगा?',
      'वर्तमान दशा शांति हेतु प्रतिदिन कौन सा सरल सात्विक नियम अपनाएं?',
      'मेरी पत्रिका के मुख्य राजयोग और केंद्र-त्रिकोण बल का विवरण दें।'
    ]
  };
}

/**
 * Answers queries dynamically using micro-level astronomical calculations (D-1, D-9, D-10, Vimshottari Dasha, Transits)
 * following UMA's strict, authoritative 5-heading Vedic Acharya consultation framework with 100% dynamic dates.
 */
export function synthesizeDynamicMicroVerdict(
  k: KundaliData,
  userQuery: string,
  panchang?: VedicPanchangData | null
): string {
  const profile = buildMicroAstrologyProfile(k);
  const q = userQuery.toLowerCase().trim();
  const yajaman = profile.name || 'यजमान';

  // Topic determination
  const topic = detectConsultationTopic(q);
  const targetHouseNum = topic.house;
  const houseInfo = profile.houseLords.find((h) => h.house === targetHouseNum) || profile.houseLords[0];
  const houseLordPlanet = profile.planets[houseInfo.lord];
  const mahaLordPlanet = profile.planets[profile.mahadasha];
  const lagnaLordPlanet = profile.planets[profile.lagnaLord];

  // Dynamic time calculations from current system date (Zero hardcoding!)
  const baseDate = panchang?.date || new Date();
  const windows = getDynamicTimeWindows(baseDate);

  // Dynamic live planetary transits relative to native's Moon
  let transitInsights = '';
  try {
    const dailyTransits = calculateDailyTransits(k, baseDate);
    const jupiterTransit = dailyTransits.find((t) => t.planet === 'गुरु');
    const saturnTransit = dailyTransits.find((t) => t.planet === 'शनि');
    const rahuTransit = dailyTransits.find((t) => t.planet === 'राहु');

    const transitParts: string[] = [];
    if (jupiterTransit) {
      transitParts.push(`देवगुरु बृहस्पति वर्तमान में ${jupiterTransit.currentRashi} राशि में चंद्र से ${jupiterTransit.houseFromMoon}वें भाव में गोचररत हैं (${jupiterTransit.nature === 'शुभ' ? 'अति अनुकूल व वर्धनकारी प्रभाव' : 'मध्यम फल'})`);
    }
    if (saturnTransit) {
      transitParts.push(`न्यायाधीश शनि देव ${saturnTransit.currentRashi} में चंद्र से ${saturnTransit.houseFromMoon}वें भाव में भ्रमणशील हैं (${profile.sadeSatiSummary})`);
    }
    if (rahuTransit) {
      transitParts.push(`राहु देव ${rahuTransit.currentRashi} में स्थित होकर छाया प्रभाव डाल रहे हैं`);
    }
    transitInsights = transitParts.join('; ');
  } catch {
    transitInsights = profile.sadeSatiSummary;
  }

  // 1. EXECUTIVE TAKEAWAY (त्वरित फलादेश)
  let executiveSummary = '';
  if (topic.category === 'career') {
    executiveSummary = `हाँ यजमान **${yajaman}** जी! आपकी जन्मपत्रिका में दशमेश **${houseInfo.lord}** तथा D-10 दशमांश चक्र के अनुसार आपके इस कार्य/परियोजना में **सफलता व विस्तार का प्रबल योग** विद्यमान है। धैर्यपूर्वक किया गया पुरुषार्थ आगामी **${windows.nearTimeline}** के मध्य शुभ फल प्रदान करेगा।`;
  } else if (topic.category === 'finance') {
    executiveSummary = `निश्चिंत रहें यजमान **${yajaman}** जी! आपकी जन्मपत्रिका के षष्ठ (ऋण) व द्वितीय (धन कोष) भाव के सूक्ष्म गणित के अनुसार **ऋण मुक्ति व आर्थिक स्थिरता के स्पष्ट योग** बन रहे हैं। आगामी **${windows.mediumTimeline}** के दौरान धन आगमन के नवीन मार्ग प्रशस्त होंगे।`;
  } else if (topic.category === 'marriage') {
    executiveSummary = `शुभ समाचार है यजमान **${yajaman}** जी! आपकी कुण्डली के सप्तम भाव (जाया) व D-9 नवमांश चक्र के अनुसार आगामी **${windows.nearTimeline}** के मध्य देवगुरु बृहस्पति की कृपा से विवाह वार्ता परिपक्व होने व दांपत्य सुख प्राप्ति के अनुकूल अवसर निर्मित हो रहे हैं।`;
  } else if (topic.category === 'health') {
    executiveSummary = `यजमान **${yajaman}** जी, लग्नेश **${profile.lagnaLord}** एवं षष्ठेश की स्थिति दर्शाती है कि आगामी **${windows.nearTimeline}** के दौरान उचित सात्विक उपाय व महामृत्युंजय साधना से स्वास्थ्य में उल्लेखनीय सुधार व आरोग्य लाभ प्राप्त होगा।`;
  } else {
    executiveSummary = `कल्याणमस्तु यजमान **${yajaman}** जी! आपके प्रश्न के संदर्भ में पराशारी सिद्धांत यह प्रमाणित करते हैं कि आपकी पत्रिका में लग्नेश **${profile.lagnaLord}** का बल उत्तम है और वर्तमान परिस्थितियां आगामी **${windows.nearTimeline}** के मध्य आपके पक्ष में सकारात्मक करवट लेंगी।`;
  }

  // 2. GRAH DASHA ANALYSIS (सूक्ष्म ग्रह-दशा विश्लेषण)
  let dashaSection = `• **लग्न व चंद्र विन्यास:** आपकी पत्रिका में **${profile.lagnaRashi}** लग्न (लग्नेश: **${profile.lagnaLord}**, भाव ${profile.lagnaLordHouse} में, अवस्था: ${lagnaLordPlanet?.dignity || 'बली'}) एवं **${profile.moonRashi}** चंद्र राशि (नक्षत्र: **${profile.moonNakshatra}**) स्थापित है।\n`;
  dashaSection += `• **विंशोत्तरी दशा चक्र:** वर्तमान समय में आप पर **${profile.mahadasha}** की महादशा में **${profile.antardasha}** की अंतर्दशा एवं **${profile.pratyantardasha}** की प्रत्यंतर्दशा क्रियाशील है।\n`;
  if (mahaLordPlanet) {
    dashaSection += `• **महादशापति स्थिति:** महादशा स्वामी ${profile.mahadasha} अपनी ${mahaLordPlanet.rashi} राशि में ${mahaLordPlanet.degree.toFixed(1)}° पर ${mahaLordPlanet.house}वें भाव में स्थित हैं (अवस्था: ${mahaLordPlanet.dignity})। D-9 नवमांश: ${mahaLordPlanet.navamshaRashi}, D-10 दशमांश: ${mahaLordPlanet.dashamshaRashi}।\n`;
  }
  dashaSection += `• **प्रश्न सम्बद्ध भाव (${houseInfo.houseName}):** इस भाव के स्वामी **${houseInfo.lord}** ${houseInfo.lordPlacementHouse}वें भाव में विराजित हैं। ${houseInfo.occupants.length ? `भाव में स्थित ग्रह: ${houseInfo.occupants.join(', ')}।` : 'भाव में कोई पाप कर्तरी दोष नहीं है।'} \n`;
  dashaSection += `• **गोचर प्रभाव (Current Transits):** ${transitInsights}।`;

  // 3. PAST INSIGHTS (अतीत के दृढ संकेत)
  let pastSection = `आपकी जन्मपत्रिका के विगत दशा चक्र व शनि-राहु गोचर के सूक्ष्म अध्ययन से अतीत के निम्नलिखित संकेत प्रत्यक्ष होते हैं:\n`;
  pastSection += `१. **${windows.pastSpan} के मध्य:** आपके जीवन में कार्यक्षेत्र, निवास स्थान अथवा आर्थिक निर्णयों में अचानक अनपेक्षित बदलाव व मानसिक दबाव का दौर आया था।\n`;
  pastSection += `२. **विगत १२ से १८ महीनों में:** आपने अपने कर्म में कठोर परिश्रम किया किंतु कतिपय कानूनी/पारिवारिक या तकनीकी अवरोधों के कारण अपेक्षित परिणाम मिलने में विलंब का सामना करना पड़ा।\n`;
  pastSection += `३. **आंतरिक मनोदशा:** लग्नेश **${profile.lagnaLord}** के शुभ प्रभाव से विषम परिस्थितियों में भी आपका धैर्य अडिग रहा और संकट टलते गए।`;

  // 4. FUTURE TRAJECTORY (भविष्य की सटीक कालावधि)
  let futureSection = `गोचरीय ग्रहों (विशेषकर देवगुरु बृहस्पति व शनि देव) के संचरण और विंशोत्तरी अंतर्दशा के आधार पर भावी समय-चक्र इस प्रकार रहेगा:\n\n`;
  futureSection += `• **प्रारंभिक गतिशीलता काल:** आगामी **${windows.nearTimeline}** के दौरान आपकी अटकी हुई योजनाएं गति पकड़ेंगी और परिस्थितियों में स्पष्ट सुधार दृष्टिगोचर होगा।\n`;
  futureSection += `• **सर्वोत्तम भाग्योदय खिड़की (Golden Window):** विशेषकर **${windows.peakMonth}** का समय आपके लिए अति शुभ रहेगा। इस अवधि में गोचरीय ग्रह आपकी कुण्डली के अनुकूल भावों को दृष्टि देंगे (अनुकूलता स्तर: **८८% से ९४%**)।\n`;
  futureSection += `• **दीर्घकालिक विस्तार:** आगामी **${windows.mediumTimeline}** तक आपके जीवन में स्थायित्व, सम्मान और आर्थिक समृद्धि का चक्र सुदृढ़ रूप से स्थापित हो जाएगा।`;

  // 5. VEDIC UPAY (सात्विक वैदिक उपाय)
  const mainRemedyPlanet = houseInfo.lord || profile.mahadasha || 'गुरु';
  const rem = PLANET_REMEDY[mainRemedyPlanet] || PLANET_REMEDY['गुरु'];

  let upaySection = `${topic.shloka}\n*अर्थ:* ${topic.shlokaMeaning}\n\n`;
  upaySection += `उपरोक्त शास्त्रीय विधान के अनुसार विघ्नों के निवारण व अभीष्ट फल की शीघ्र प्राप्ति हेतु निम्नलिखित सात्विक उपाय सिद्ध करें:\n\n`;
  upaySection += `१. **सिद्ध ग्रह मंत्र जप:** नित्य प्रातः शुद्ध होकर **${mainRemedyPlanet}** ग्रह के बीज मंत्र का जप करें:\n   *${rem.mantra}* (${rem.japaCount})\n`;
  upaySection += `२. **सात्विक दान विधान:** ${rem.daan}\n`;
  upaySection += `३. **दैनिक आचार व नियम:** ${rem.habit}\n`;
  upaySection += `४. **सर्व-संकट निवारण:** नित्य प्रातः सूर्य देव को तांबे के लोटे से जल का अर्घ्य दें एवं संध्याकाल में घर के मंदिर में देशी कपूर प्रज्वलित करें।`;

  // Format response with UMA's 5 sections and dynamic follow-up suggestions
  return `॥ ॐ श्री गणेशाय नमः ॥

**१. त्वरित फलादेश (Executive Takeaway)**
${executiveSummary}

**२. सूक्ष्म ग्रह-दशा विश्लेषण (Grah Dasha Analysis)**
${dashaSection}

**३. अतीत के दृढ संकेत (Past Insights)**
${pastSection}

**४. भविष्य की सटीक कालावधि (Future Trajectory)**
${futureSection}

**५. सात्विक वैदिक उपाय (Vedic Upay)**
${upaySection}

---
[अगले प्रश्न]:
• ${topic.followUps[0]}
• ${topic.followUps[1]}
• ${topic.followUps[2]}`;
}

/**
 * Universal Vedic Guidance Synthesizer when no birth chart is loaded yet:
 * Dynamically uses current Panchang (Tithi, Nakshatra, Weekday, Season, Year)
 * and dynamic month mathematics to provide an authoritative consultation,
 * along with a polite invitation to enter birth details.
 */
export function synthesizePanchangAstrologyVerdict(
  userQuery: string,
  panchang?: VedicPanchangData | null
): string {
  const q = userQuery.toLowerCase().trim();
  const baseDate = panchang?.date || new Date();
  const windows = getDynamicTimeWindows(baseDate);
  const topic = detectConsultationTopic(q);

  const todayStr = panchang
    ? `आज **${panchang.weekday}**, **${panchang.paksha}** पक्ष की **${panchang.tithi}** तिथि, नक्षत्र **${panchang.nakshatra}** एवं संवत् **${panchang.samvat || '२०८३'}** है।`
    : `आज दिनांक **${baseDate.toLocaleDateString('hi-IN')}**, दिन **${windows.currentMonthName} ${windows.currentYear}** का गोचरीय संचरण क्रियाशील है।`;

  const rem = PLANET_REMEDY[topic.karaka] || PLANET_REMEDY['सूर्य'];

  let executiveSummary = '';
  let dashaAnalysis = '';
  let pastInsights = '';
  let futureTrajectory = '';

  if (topic.category === 'career') {
    executiveSummary = `यजमान! आपके प्रश्न *(क्या मेरी ऐप/परियोजना/कार्य सफल होगा)* के उत्तर में वैदिक ज्योतिष के सार्वभौमिक नियम यह प्रमाणित करते हैं कि दशम भाव (कर्म) और एकादश भाव (सिद्धि) के कारक ग्रह सूर्य व देवगुरु बृहस्पति आपकी योजना में उत्तम कर्मबल दर्शाते हैं।`;
    dashaAnalysis = `• **पंचांग व प्रश्न कुंडली गणना:** ${todayStr}\n• **ग्रह कारक:** कार्यक्षेत्र व यश के कारक सूर्य देव तथा व्यापार व विस्तार के कारक बुध व गुरु देव गोचर में बली अवस्था की ओर अग्रसर हैं।\n• **मुहूर्त बल:** आज का दिन शुभ संकल्पों को आगे बढ़ाने हेतु प्रशस्त है।`;
    pastInsights = `• विगत **${windows.pastSpan}** के दौरान आपने कार्य निर्माण, योजना और रणनीति में अथक श्रम किया किंतु कतिपय अनिश्चितताओं और विलंब से मन व्यथित रहा।`;
    futureTrajectory = `• **सटीक समय सीमा:** आगामी **${windows.nearTimeline}** के मध्य गोचरीय गुरु व बुध का अनुकूल संचरण आपकी ऐप/कार्य को गति, यश व सकारात्मक यूजर स्वीकृति प्रदान करेगा (अनुकूलता खिड़की: **${windows.peakMonth}**)।`;
  } else if (topic.category === 'finance') {
    executiveSummary = `यजमान! आपके प्रश्न *(ऋण मुक्ति व धन समृद्धि)* के संबंध में वैदिक सिद्धांत यह स्पष्ट करते हैं कि षष्ठ भाव (ऋण) व द्वितीय भाव (कोष) पर देवगुरु बृहस्पति का शुभ प्रभाव अवश्य फलित होगा। आपका कर्ज निश्चित रूप से उतरेगा।`;
    dashaAnalysis = `• **पंचांग व प्रश्न कुंडली गणना:** ${todayStr}\n• **ग्रह कारक:** ऋण निवारण के कारक मंगल देव एवं धन प्रदाता माँ महालक्ष्मी व देवगुरु बृहस्पति का गोचरीय संचरण आपके संचित धन में वृद्धि हेतु मार्ग खोल रहा है।`;
    pastInsights = `• विगत **${windows.pastSpan}** में अप्रत्याशित पारिवारिक व व्यावसायिक व्ययों के कारण आर्थिक भार बढ़ा और मन में अशांति बनी रही।`;
    futureTrajectory = `• **सटीक समय सीमा:** आगामी **${windows.mediumTimeline}** के दौरान अचानक धन प्राप्ति, पुराने कर्ज चुकता होने एवं आय के नवीन स्रोत बनने के प्रबल योग हैं।`;
  } else if (topic.category === 'marriage') {
    executiveSummary = `यजमान! विवाह व दांपत्य के विषय में वैदिक ज्योतिष सिद्धांत कहते हैं कि सप्तम भाव के कारक शुक्र देव व देवगुरु बृहस्पति की कृपा से सुयोग्य रिश्ते का मार्ग प्रशस्त हो रहा है।`;
    dashaAnalysis = `• **पंचांग व गोचर:** ${todayStr}\n• **कारक ग्रह:** देवगुरु बृहस्पति का शुभ गोचर विवाह वार्ता में आ रही विघ्न-बाधाओं को शांत करने में पूर्ण सक्षम है।`;
    pastInsights = `• विगत समय में संबंध स्थापित होने के प्रयासों में अनिर्णय की स्थिति अथवा वैचारिक अड़चनों का सामना करना पड़ा था।`;
    futureTrajectory = `• **सटीक समय सीमा:** आगामी **${windows.nearTimeline}** के मध्य सुयोग्य जीवनसाथी से परिचय व विवाह पक्का होने के अनुकूल योग निर्मित हो रहे हैं।`;
  } else {
    executiveSummary = `यजमान! आपके प्रश्न *«${userQuery.trim()}»* के संदर्भ में वैदिक ज्योतिषीय गोचर सिद्धांत यह इंगित करते हैं कि वर्तमान ग्रह-नक्षत्र संचरण आपके संकल्पों को सिद्धि प्रदान करने की दिशा में अग्रसर है।`;
    dashaAnalysis = `• **पंचांग एवं दिनमान स्थिति:** ${todayStr}\n• **गोचर सिद्धांत:** शुभ ग्रहों का वर्तमान भ्रमण यह दर्शाता है कि धैर्य व सात्विक आचरण से आपकी परिस्थितियां शीघ्र अनुकूल होंगी।`;
    pastInsights = `• विगत **${windows.pastSpan}** के मध्य जीवन में अनपेक्षित संघर्ष व मानसिक उद्वेग का सामना करना पड़ा था।`;
    futureTrajectory = `• **सटीक समय सीमा:** आगामी **${windows.nearTimeline}** के भीतर शुभ गोचर के प्रभाव से आपकी परिस्थितियों में निर्णायक सकारात्मक मोड़ आएगा।`;
  }

  const notice = `\n\n*(नोट: व्यक्तिगत लग्न, चंद्र राशि व सूक्ष्म विंशोत्तरी दशा स्तर पर १००% अचूक फलादेश प्राप्त करने हेतु नीचे दिए 'जन्म विवरण भरें' बटन द्वारा अपनी जन्म कुंडली जोड़ें।)*`;

  return `॥ ॐ श्री गणेशाय नमः ॥

**१. त्वरित फलादेश (Executive Takeaway)**
${executiveSummary}

**२. सूक्ष्म ग्रह-दशा विश्लेषण (Grah Dasha Analysis)**
${dashaAnalysis}

**३. अतीत के दृढ संकेत (Past Insights)**
${pastInsights}

**४. भविष्य की सटीक कालावधि (Future Trajectory)**
${futureTrajectory}

**५. सात्विक वैदिक उपाय (Vedic Upay)**
${topic.shloka}
*अर्थ:* ${topic.shlokaMeaning}

• **सिद्ध मंत्र:** नित्य प्रातः ${rem.mantra} (${rem.japaCount})
• **सात्विक दान:** ${rem.daan}
• **दैनिक आचार:** ${rem.habit}
${notice}

---
[अगले प्रश्न]:
• ${topic.followUps[0]}
• ${topic.followUps[1]}
• ${topic.followUps[2]}`;
}
