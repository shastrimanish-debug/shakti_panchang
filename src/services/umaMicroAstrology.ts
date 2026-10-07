import { KundaliData, PlanetPosition, VedicPanchangData } from '../types';
import { RASHIS, NAKSHATRAS, NAKSHATRA_LORDS } from './astronomy';
import { SIGN_LORDS } from './predictions';
import { calculateSadeSati } from './sadesati';

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
 * Calculate Navamsha Rashi (D9) micro position
 */
export function calculateNavamshaRashi(rashiIndex: number, degree: number): string {
  const totalMinutes = degree * 60;
  const navamshaPart = Math.floor(totalMinutes / 200) % 9; // 3°20' = 200 minutes
  // Fire signs (Mesh, Simh, Dhanu): start Mesh (0)
  // Earth signs (Vrishabh, Kanya, Makar): start Makar (9)
  // Air signs (Mithun, Tula, Kumbh): start Tula (6)
  // Water signs (Kark, Vrishchik, Meen): start Kark (3)
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
  const isOdd = rashiIndex % 2 === 0; // 0-indexed: Even number = Odd sign
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

    // Track micro afflictions & strengths
    if (lordDetail && [6, 8, 12].includes(lordDetail.house)) {
      keyAfflictions.push(`${h}वें भाव का स्वामी ${lordPlanetName} ${lordDetail.house}वें (दुस्थान) भाव में स्थित है`);
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
    manglikStatus: k.isManglik ? `मांगलिक दोष प्रभावी (${k.manglikDescription || 'मंगल लग्न/सप्तम/अष्टम/द्वादश में'})` : 'अमंगल / सामान्य',
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

/**
 * Dynamic Local Micro Verdict Synthesizer:
 * Calculates exact house lords, retrogrades, and Dasha interactions mathematically
 * so that local responses are 100% dynamic and personalized, never static template boilerplate!
 */
export function synthesizeDynamicMicroVerdict(
  k: KundaliData,
  userQuery: string,
  panchang?: VedicPanchangData | null
): string {
  const profile = buildMicroAstrologyProfile(k);
  const q = userQuery.toLowerCase();

  // Determine query domain
  let targetHouse = 10;
  let targetAreaName = 'कार्यक्षेत्र व आजीविका (Career/Business)';
  let primaryKarak = 'सूर्य व शनि';

  if (/नौकरी|करियर|व्यापार|काम|धंधा|दुकान|बिजनेस|कारोबार|job|career|business|work|dhandha|loss|growth|sales|customer/.test(q)) {
    targetHouse = 10;
    targetAreaName = 'कर्म व आजीविका (Career)';
    primaryKarak = 'सूर्य, बुध व शनि';
  } else if (/शादी|विवाह|दांपत्य|पति|पत्नी|प्रेम|मिलान|रिश्ता|लड़की|लड़का|तलाक|marriage|love|relationship|husband|wife|divorce|shadi|rishta/.test(q)) {
    targetHouse = 7;
    targetAreaName = 'दांपत्य व संबंध (Marriage & Relationship)';
    primaryKarak = 'शुक्र, गुरु व मंगल';
  } else if (/पैसा|धन|ऋण|लोन|कर्ज|बचत|आर्थिक|तंगी|रुपया|कमाई|money|finance|wealth|loan|debt|earning|income|saving/.test(q)) {
    targetHouse = 2;
    targetAreaName = 'धन संचय व लाभ (Wealth & Finance)';
    primaryKarak = 'गुरु, शुक्र व बुध';
  } else if (/सेहत|स्वास्थ्य|बीमार|रोग|दवा|तनाव|अनिद्रा|दर्द|बीमारी|health|disease|sick|tension|stress|pain|sleep/.test(q)) {
    targetHouse = 6;
    targetAreaName = 'आरोग्य व स्वास्थ्य (Health & Well-being)';
    primaryKarak = 'सूर्य, चंद्र व लग्नेश';
  } else if (/संतान|बच्चा|बेटा|बेटी|पुत्र|पुत्री|पढ़ाई|परीक्षा|शिक्षा|विद्या|child|children|education|study|exam|son|daughter/.test(q)) {
    targetHouse = 5;
    targetAreaName = 'पंचम भाव (शिक्षा व संतान)';
    primaryKarak = 'गुरु व बुध';
  } else if (/मकान|घर|भूमि|जमीन|वाहन|गाड़ी|प्रॉपर्टी|फ्लैट|house|home|land|property|car|vehicle|flat/.test(q)) {
    targetHouse = 4;
    targetAreaName = 'भूमि-भवन व सुख (Property & Home)';
    primaryKarak = 'मंगल व शुक्र';
  } else if (/शनि|साढ़े|ढैया|shani|sade|dhaiya/.test(q)) {
    targetHouse = 8;
    targetAreaName = 'शनि गोचर व साढ़ेसाती (Saturn Transit)';
    primaryKarak = 'शनि देव';
  } else if (/राहु|केतु|महादशा|अंतर्दशा|दशा|rahu|ketu|dasha|mahadasha/.test(q)) {
    targetHouse = 1;
    targetAreaName = 'दशा प्रभाव (Dasha Analysis)';
    primaryKarak = profile.mahadasha;
  }

  const hInfo = profile.houseLords.find((h) => h.house === targetHouse) || profile.houseLords[9];
  const lordDetail = profile.planets[hInfo.lord];
  const dashaLordDetail = profile.planets[profile.mahadasha];

  // Micro observation based on actual math
  let pastPresentMicro = `आपकी पत्रिका के ${hInfo.houseName} का स्वामी **${hInfo.lord}** है, जो वर्तमान में ${lordDetail ? `${lordDetail.house}वें भाव में ${lordDetail.rashi} राशि में` : 'विशेष स्थिति में'} स्थित है। `;
  if (lordDetail && lordDetail.isRetrograde) {
    pastPresentMicro += `चूँकि ${hInfo.lord} वक्री अवस्था में है और वर्तमान में ${profile.mahadasha} की महादशा प्रभावी है, इसलिए हाल के ६-८ महीनों में ${targetAreaName} में मानसिक ऊहापोह, विलंब तथा प्रयासों के अनुरूप फल प्राप्त न होने की स्थिति का सामना करना पड़ा है।`;
  } else if (lordDetail && [6, 8, 12].includes(lordDetail.house)) {
    pastPresentMicro += `चूँकि ${targetHouse}वें भाव का स्वामी ${hInfo.lord} ${lordDetail.house}वें दुस्थान भाव में स्थित है, इसलिए पिछले समय में अप्रत्याशित अड़चनें, कागजी रुकावटें तथा ऊर्जा का अत्यधिक व्यय हुआ है।`;
  } else {
    pastPresentMicro += `वर्तमान में ${profile.mahadasha} महादशा में ${profile.antardasha} की अंतर्दशा के प्रभाव से इस क्षेत्र में निर्णय लेने में द्वंद्व और अतिरिक्त प्रयास की आवश्यकता बनी हुई है।`;
  }

  // Micro path forward based on Navamsha & Dasha
  let futureMicro = `आगामी ६ से १२ महीनों में जब ${profile.antardasha} अंतर्दशा का गोचर परिवर्तन होगा, तो D9 नवमांश में ${lordDetail ? lordDetail.navamshaRashi : 'शुभ'} स्थिति के कारण ${targetAreaName} में सकारात्मक मोड़ आएगा। `;
  if (dashaLordDetail && dashaLordDetail.dignity === 'उच्च') {
    futureMicro += `आपकी महादशा स्वामी ${profile.mahadasha} उच्च अवस्था में बली है, अतः रुका हुआ कार्य शीघ्र गति पकड़ेगा और नवीन विश्वसनीय अवसर प्राप्त होंगे।`;
  } else {
    futureMicro += `गोचर में बृहस्पति और सूर्य का अनुकूल प्रभाव आपके ${targetHouse}वें भाव को संबल देगा, जिससे परिस्थिति में स्पष्ट सुधार और नवीन मार्ग प्रशस्त होंगे।`;
  }

  // Micro hyper-specific remedy targeted at the afflicted planet
  let remedyPlanet = hInfo.lord;
  let remedyText = '';

  if (remedyPlanet === 'बुध') {
    remedyText = `चूँकि आपके ${targetHouse}वें भाव के स्वामी बुध ${lordDetail ? lordDetail.house : 8}वें भाव में हैं, बुधवार की संध्या को किसी जरूरतमंद कन्या को हरे मूंग या हरी सब्जियाँ दान करें और 'ॐ बुं बुधाय नमः' का जप करें।`;
  } else if (remedyPlanet === 'सूर्य') {
    remedyText = `चूँकि आपके भावेश सूर्य देव हैं, नित्य प्रातः तांबे के पात्र में रोली व अक्षत मिलाकर सूर्य नारायण को अर्घ्य दें और आदित्य हृदय स्तोत्र का पाठ करें।`;
  } else if (remedyPlanet === 'मंगल') {
    remedyText = `चूँकि आपके ${targetHouse}वें भावेश मंगल हैं, मंगलवार के दिन तांबे का सिक्का या लाल मसूर दान करें और हनुमान जी को गुड़-चना अर्पित करें।`;
  } else if (remedyPlanet === 'शुक्र') {
    remedyText = `चूँकि आपके भावेश शुक्र देव हैं, शुक्रवार को माँ लक्ष्मी के सम्मुख खीर या सफेद मिष्ठान का भोग लगाएं और किसी सुहागिन महिला को वस्त्र दान दें।`;
  } else if (remedyPlanet === 'गुरु') {
    remedyText = `चूँकि आपके भावेश देवगुरु बृहस्पति हैं, गुरुवार को स्नान के जल में चुटकी भर हल्दी डालें और किसी वृद्ध ब्राह्मण/पीपल वृक्ष की सेवा करें।`;
  } else if (remedyPlanet === 'शनि') {
    remedyText = `चूँकि आपके भावेश शनि देव हैं, शनिवार की संध्या को पीपल के नीचे सरसों के तेल का दीपक जलाएं और असहाय व्यक्ति की सहायता करें।`;
  } else {
    remedyText = `नित्य प्रातः अपने इष्टदेव का स्मरण करें और 'ॐ नमो भगवते वासुदेवाय' का २१ बार जप करें।`;
  }

  const todayStr = panchang ? `\nआज ${panchang.weekday}, ${panchang.tithi} तिथि का पंचांग गोचर भी सक्रिय है।` : '';

  return `॥ ॐ श्री गणेशाय नमः ॥\n\nसदा कल्याण हो, ${profile.name} जी। मैं उमा हूँ।\n\nआपकी जन्मपत्रिका (लग्न: **${profile.lagnaRashi}**, चंद्र: **${profile.moonRashi}**, नक्षत्र: **${profile.moonNakshatra}**, महादशा: **${profile.mahadasha}**, अंतर्दशा: **${profile.antardasha}**) की सूक्ष्म ग्रह-गणित का विश्लेषण करने पर:${todayStr}\n\n**१. हालिया स्थिति का सूक्ष्म विश्लेषण (Past & Present Insights):**\n${pastPresentMicro}\n\n**२. आगामी ६–१२ महीनों का मार्ग (The Path Forward):**\n${futureMicro}\n\n**३. अचूक शास्त्रोक्त सूक्ष्म उपाय (Micro-Remedy):**\n${remedyText}`;
}
