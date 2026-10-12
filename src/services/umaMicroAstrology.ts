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
 * so that local responses are 100% dynamic, personalized, conversational and never static boilerplate!
 */
export function synthesizeDynamicMicroVerdict(
  k: KundaliData,
  userQuery: string,
  panchang?: VedicPanchangData | null
): string {
  const profile = buildMicroAstrologyProfile(k);
  const q = userQuery.toLowerCase();

  // Determine query domain & house
  let targetHouse = 10;
  let targetAreaName = 'आजीविका व कार्यक्षेत्र';

  if (/नौकरी|करियर|व्यापार|काम|धंधा|दुकान|बिजनेस|कारोबार|job|career|business|work|dhandha|promotion|office|salary/.test(q)) {
    targetHouse = 10;
    targetAreaName = 'आजीविका, पदोन्नति व कार्यक्षेत्र';
  } else if (/शादी|विवाह|दांपत्य|पति|पत्नी|प्रेम|मिलान|रिश्ता|लड़की|लड़का|तलाक|marriage|love|relationship|husband|wife|divorce|shadi|rishta/.test(q)) {
    targetHouse = 7;
    targetAreaName = 'विवाह, दांपत्य व संबंध';
  } else if (/पैसा|धन|ऋण|लोन|कर्ज|बचत|आर्थिक|तंगी|रुपया|कमाई|money|finance|wealth|loan|debt|earning|income|saving/.test(q)) {
    targetHouse = 2;
    targetAreaName = 'धन संचय, कोष व आर्थिक उन्नति';
  } else if (/सेहत|स्वास्थ्य|बीमार|रोग|दवा|तनाव|अनिद्रा|दर्द|बीमारी|health|disease|sick|tension|stress|pain|sleep/.test(q)) {
    targetHouse = 6;
    targetAreaName = 'आरोग्य, स्वास्थ्य व रोग निवारण';
  } else if (/संतान|बच्चा|बेटा|बेटी|पुत्र|पुत्री|पढ़ाई|परीक्षा|शिक्षा|विद्या|child|children|education|study|exam|son|daughter/.test(q)) {
    targetHouse = 5;
    targetAreaName = 'विद्या, बुद्धि व संतान सुख';
  } else if (/मकान|घर|भूमि|जमीन|वाहन|गाड़ी|प्रॉपर्टी|फ्लैट|house|home|land|property|car|vehicle|flat/.test(q)) {
    targetHouse = 4;
    targetAreaName = 'भूमि, भवन, वाहन व गृह-सुख';
  } else if (/शनि|साढ़े|ढैया|shani|sade|dhaiya/.test(q)) {
    targetHouse = 8;
    targetAreaName = 'शनि प्रभाव, साढ़ेसाती व ढैया';
  } else if (/राहु|केतु|कालसर्प|ग्रहण|rahu|ketu|kaal|sarp/.test(q)) {
    targetHouse = 8;
    targetAreaName = 'छाया ग्रह राहु-केतु प्रभाव';
  } else if (/दशा|महादशा|अंतर्दशा|dasha|mahadasha/.test(q)) {
    targetHouse = 1;
    targetAreaName = 'विंशोत्तरी महादशा व अंतर्दशा';
  }

  const hInfo = profile.houseLords.find((h) => h.house === targetHouse) || profile.houseLords[0];
  const lordDetail = profile.planets[hInfo.lord];
  const dashaLordDetail = profile.planets[profile.mahadasha];

  // Past & Present observation based on actual mathematical configuration
  let pastPresentText = '';
  if (lordDetail && lordDetail.isRetrograde) {
    pastPresentText = `आपकी जन्मपत्रिका में ${hInfo.houseName} के स्वामी **${hInfo.lord}** वक्री स्थिति में हैं। आपकी महादशा **${profile.mahadasha}** तथा अंतर्दशा **${profile.antardasha}** के सूक्ष्म प्रभाव से विगत महीनों में ${targetAreaName} के क्षेत्र में मानसिक तनाव, निर्णयों में संशय और अनपेक्षित विलंब की स्थिति बनी रही है।`;
  } else if (lordDetail && [6, 8, 12].includes(lordDetail.house)) {
    pastPresentText = `आपकी जन्मपत्रिका में ${targetHouse}वें भावेश **${hInfo.lord}** दुस्थान (${lordDetail.house}वें भाव) में स्थित हैं। इसके फलस्वरूप विगत १ से २ वर्षों में आपके सामने अचानक अनपेक्षित व्यय, स्वास्थ्य या प्रशासनिक कागजी अड़चनों का सामना करना पड़ा है।`;
  } else {
    pastPresentText = `आपकी जन्मपत्रिका में ${hInfo.houseName} का स्वामी **${hInfo.lord}** ${lordDetail ? lordDetail.house : 1}वें भाव में स्थित है। वर्तमान ${profile.mahadasha} महादशा के अंतर्गत विगत समय में आपने अपने पुरुषार्थ से स्थिति को संभाला है, यद्यपि पूर्ण स्थायित्व हेतु ग्रह बल की आवश्यकता है।`;
  }

  // Future trajectory
  let futureText = '';
  if (dashaLordDetail && (dashaLordDetail.dignity === 'उच्च' || dashaLordDetail.dignity === 'स्वक्षेत्र')) {
    futureText = `नवमांश (D-9) व दशमांश (D-10) चक्र की स्थिति के अनुसार, आगामी ६ से ९ महीनों में जब बृहस्पति एवं सूर्य का अनुकूल गोचर प्रभाव स्थापित होगा, तब ${targetAreaName} में आ रहे अवरोध स्वतः समाप्त होंगे और मध्य-अक्टूबर से नवीन आर्थिक व व्यावसायिक मार्ग प्रशस्त होंगे।`;
  } else {
    futureText = `आगामी समय में गोचरीय ग्रहों के अनुकूल कोण और **${profile.antardasha}** अंतर्दशा की परिपक्वता से स्थिति में सुधार होगा। विशेषकर आने वाले ४ से ८ महीनों में पुराने रुके हुए कार्यों में गति आएगी और नवीन संपर्कों से लाभ प्राप्त होगा।`;
  }

  // Tailored Micro Remedy
  let remedyPlanet = hInfo.lord;
  let remedyText = '';

  if (remedyPlanet === 'बुध') {
    remedyText = `• **मंत्र जप:** नित्य प्रातः 'ॐ बुं बुधाय नमः' मंत्र का १०८ बार तुलसी माला से जप करें।\n• **दान:** बुधवार संध्या समय हरे मूंग अथवा हरे वस्त्र का किसी योग्य व्यक्ति को दान करें।\n• **वास्तु/सात्विक नियम:** उत्तर दिशा में जल या पौधे रखकर स्वच्छता बनाए रखें।`;
  } else if (remedyPlanet === 'सूर्य') {
    remedyText = `• **मंत्र व अर्घ्य:** नित्य प्रातः तांबे के लोटे में रोली, अक्षत व गुड़ मिलाकर उगते सूर्य को अर्घ्य दें एवं 'आदित्य हृदय स्तोत्र' का पाठ करें।\n• **दान:** रविवार को गेहूं अथवा तांबे के पात्र का दान करें।\n• **वास्तु नियम:** पूर्व दिशा को सदा स्वच्छ व प्रकाशवान रखें।`;
  } else if (remedyPlanet === 'मंगल') {
    remedyText = `• **मंत्र जप:** मंगलवार को 'ॐ अं अंगारकाय नमः' का १०८ बार जप करें तथा श्री हनुमान चालीसा का पाठ करें।\n• **दान:** मंगलवार को लाल मसूर की दाल व गुड़ का दान करें।\n• **वास्तु नियम:** दक्षिण दिशा में लाल ध्वजा या स्वास्तिक स्थापित करें।`;
  } else if (remedyPlanet === 'शुक्र') {
    remedyText = `• **मंत्र जप:** शुक्रवार को 'ॐ शुं शुक्राय नमः' का १०८ बार जप करें।\n• **दान:** शुक्रवार को खीर, बताशे अथवा सफेद वस्त्र का दान करें।\n• **सात्विक नियम:** आचरण पवित्र रखें और घर के आग्नेय कोण (दक्षिण-पूर्व) में दीपक जलाएं।`;
  } else if (remedyPlanet === 'गुरु') {
    remedyText = `• **मंत्र जप:** गुरुवार को 'ॐ बृं बृहस्पतये नमः' का १०८ बार जप करें।\n• **दान:** गुरुवार को चने की दाल, हल्दी अथवा पीले वस्त्र का दान करें।\n• **वास्तु नियम:** ईशान कोण (उत्तर-पूर्व) में भगवान विष्णु का चित्र स्थापित करें।`;
  } else if (remedyPlanet === 'शनि') {
    remedyText = `• **मंत्र जप:** शनिवार संध्या पीपल के नीचे सरसों के तेल का दीपक जलाकर 'ॐ शं शनैश्चराय नमः' का १०८ बार जप करें।\n• **दान:** काले तिल, उड़द अथवा तेल का दान करें।\n• **वास्तु नियम:** पश्चिम दिशा को स्वच्छ रखें और वृद्ध-दिव्यांगों का सेवा-सत्कार करें।`;
  } else {
    remedyText = `• **मंत्र जप:** नित्य प्रातः 'ॐ नमो भगवते वासुदेवाय' मंत्र का १०८ बार जप करें।\n• **दान:** नित्य गौमाता को प्रथम रोटी व पक्षियों को अन्न-जल दें।`;
  }

  const panchangStr = panchang ? `\n(आज ${panchang.weekday}, ${panchang.paksha} पक्ष की ${panchang.tithi} तिथि का गोचर भी आपके लिए सहायक बन रहा है।)` : '';

  return `॥ ॐ श्री गणेशाय नमः ॥

आयुष्मान भव, यजमान **${profile.name}** जी! मैं उमा हूँ — ५० वर्षों की कठिन वैदिक साधना से युक्त आपकी प्रकांड ज्योतिष आचार्य।

आपकी जन्मपत्रिका (**लग्न: ${profile.lagnaRashi}**, **चंद्र: ${profile.moonRashi}**, **नक्षत्र: ${profile.moonNakshatra}**) का D-1, D-9 नवमांश व D-10 दशमांश स्तर पर सूक्ष्म विश्लेषण:

**Grah Dasha Analysis** (ग्रह दशा व सूक्ष्म गणना विश्लेषण):
• वर्तमान विंशोत्तरी: महादशा **${profile.mahadasha}** • अंतर्दशा **${profile.antardasha}** • प्रत्यंतर्दशा **${profile.pratyantardasha}**
• ${hInfo.houseName} भावेश **${hInfo.lord}** की स्थिति: लग्न से ${lordDetail ? lordDetail.house : 1}वें भाव में (${lordDetail ? lordDetail.rashi : ''} राशि, ${lordDetail ? lordDetail.degree.toFixed(1) : 15}°), नवमांश D-9: ${lordDetail ? lordDetail.navamshaRashi : ''}, दशमांश D-10: ${lordDetail ? lordDetail.dashamshaRashi : ''}।
• शनि गोचर: ${profile.sadeSatiSummary}

**Past Insights** (अतीत का रहस्योद्घाटन - Past Revelation Protocol):
${pastPresentText}

**Future Trajectory** (भविष्य का सटीक कालखंड - Surgical Future Predictions):
${futureText}

**Vedic Upay** (सात्विक एवं अचूक वैदिक उपाय - Mantras, Japa, Daan & Vastu):
${remedyText}${panchangStr}`;
}

/**
 * Universal Vedic Guidance Synthesizer when no birth chart is loaded yet:
 * Uses deep Parashari rules, Nakshatra energetics, Panchang data and scriptural wisdom.
 */
export function synthesizePanchangAstrologyVerdict(
  userQuery: string,
  panchang?: VedicPanchangData | null
): string {
  const q = userQuery.toLowerCase();

  let domainTitle = 'कर्म व आजीविका विचार';
  let principleText = '';
  let remedyText = '';

  if (/नौकरी|करियर|व्यापार|काम|धंधा|दुकान|बिजनेस|job|career|business|work/.test(q)) {
    domainTitle = 'कर्म व आजीविका विचार (Career & Business)';
    principleText = 'वैदिक ज्योतिष में दशम भाव कर्म और प्रतिष्ठा का प्रतीक है। सूर्य देव यश-सम्मान के, बुध व्यापार व बुद्धि के और शनि देव कर्मनिष्ठता के कारक हैं। जब भी कर्मक्षेत्र में अड़चन आए, दशम भाव और सूर्य-शनि के संतुलन से सफलता प्राप्त होती है।';
    remedyText = '• **मंत्र:** नित्य प्रातः "ॐ सूर्याय नमः" का १०८ बार जप करें एवं आदित्य हृदय स्तोत्र का पाठ करें。\n• **दान:** शनिवार को असहायों को अन्न व वस्त्र का दान करें।\n• **वास्तु:** कार्यस्थल के ईशान कोण (उत्तर-पूर्व) में स्वच्छता बनाए रखें।';
  } else if (/शादी|विवाह|दांपत्य|पति|पत्नी|प्रेम|रिश्ता|marriage|love|relationship|shadi/.test(q)) {
    domainTitle = 'विवाह व दांपत्य विचार (Marriage & Harmony)';
    principleText = 'सप्तम भाव दांपत्य सुख का केन्द्र है। पुरुषों हेतु शुक्र और स्त्रियों हेतु देवगुरु बृहस्पति विवाह के प्रमुख कारक होते हैं। जब गुरु और शुक्र की कृपा होती है, तो शीघ्र सुयोग्य जीवनसाथी का योग बनता है।';
    remedyText = '• **मंत्र:** गुरुवार को "ॐ बृं बृहस्पतये नमः" का १०८ बार जप करें।\n• **दान:** गुरुवार को पीले अन्न या हल्दी का दान करें।\n• **पूजा:** शिव-पार्वती के सम्मुख घी का दीपक जलाकर "ॐ नमः शिवाय" का जप करें।';
  } else if (/पैसा|धन|ऋण|लोन|कर्ज|आर्थिक|money|wealth|finance|debt|loan/.test(q)) {
    domainTitle = 'धन-समृद्धि व ऋणमुक्ति विचार (Wealth & Debt Relief)';
    principleText = 'द्वितीय भाव धन संचय और एकादश भाव आय का है। देवगुरु बृहस्पति समृद्धि के दाता हैं तथा महालक्ष्मी की कृपा से अष्ट-लक्ष्मी योग जागृत होता है। ऋणमुक्ति हेतु भौम प्रदोष व मंगल ऋण मोचक स्तोत्र सिद्ध माना गया है।';
    remedyText = '• **मंत्र:** नित्य "श्रीसूक्त" अथवा "कनकधारा स्तोत्र" का पाठ करें।\n• **दान:** मंगलवार को गुड़ व लाल वस्त्र का दान करें।\n• **वास्तु:** संध्या समय मुख्य द्वार पर दीपक प्रज्वलित करें।';
  } else if (/सेहत|स्वास्थ्य|रोग|दवा|बीमार|health|disease|sick/.test(q)) {
    domainTitle = 'आरोग्य व स्वास्थ्य रक्षा (Health & Vitality)';
    principleText = 'लग्न और सूर्य आत्मा व देह-बल के कारक हैं, जबकि चंद्रमा मन के स्वामी हैं। आरोग्य प्राप्ति हेतु महामृत्युंजय जप और सूर्य उपासना सर्वोपरि औषधि मानी गई है।';
    remedyText = '• **मंत्र:** नित्य १०८ बार महामृत्युंजय मंत्र: "ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम्। उर्वारुकमिव बन्धनान्मृत्यsourceर्मुक्षीय मामृतात्॥" का जप करें।\n• **दान:** सोमवार को दूध या सफेद अन्न का दान करें।';
  } else if (/शनि|साढ़े|ढैया|shani|sade|dhaiya/.test(q)) {
    domainTitle = 'शनि कृपा व साढ़ेसाती विधान (Saturn Transit)';
    principleText = 'शनि देव कर्मफलदाता हैं। जो व्यक्ति सत्यवादी, संयमित और कर्मनिष्ठ रहता है, शनि देव उसे हर विपत्ति से उबारकर राजा समान बना देते हैं।';
    remedyText = '• **मंत्र:** शनिवार संध्या पीपल के वृक्ष के नीचे "ॐ शं शनैश्चराय नमः" का १०८ बार जप करें।\n• **दान:** काले तिल, तेल या वस्त्र का दान करें।';
  } else {
    domainTitle = 'वैदिक जीवन सूत्र व ग्रह शांति';
    principleText = 'सनातन वैदिक ज्योतिष का मूल ध्येय व्यक्ति को कर्म के प्रति जागरूक करना और परमात्मा के विधान के साथ जीवन में संतुलन स्थापित करना है।';
    remedyText = '• **मंत्र:** नित्य प्रातः गायत्री मंत्र का २१ बार जप करें।\n• **दान:** पक्षियों को अन्न और गौमाता को प्रथम रोटी अर्पित करें।';
  }

  const todayStr = panchang
    ? `\n📅 **आज का पंचांग गोचर:** ${panchang.weekday}, ${panchang.paksha} पक्ष की **${panchang.tithi}** तिथि, **${panchang.nakshatra}** नक्षत्र।`
    : '';

  return `॥ ॐ श्री गणेशाय नमः ॥

सदा कल्याण हो, प्रिय यजमान! मैं उमा हूँ — ५० वर्षों की पराशारी व नाड़ी ज्योतिष साधना से युक्त आपकी प्रकांड वैदिक ज्योतिष आचार्य।

**Grah Dasha Analysis** (ग्रह दशा व सिद्धांत विश्लेषण):
• ${domainTitle}: ${principleText}${todayStr}

**Past Insights** (अतीत का रहस्योद्घाटन - Past Revelation Protocol):
• विगत समय में आपने अपने कर्मक्षेत्र व जीवन की परिस्थितियों में अत्यधिक धैर्य तथा मानसिक संघर्ष का अनुभव किया है।

**Future Trajectory** (भविष्य का सटीक कालखंड - Surgical Future Predictions):
• आगामी महीनों में शुभ गोचरीय प्रभाव स्थापित होने से आपके प्रयासों में सफलता और स्थिति में सकारात्मक परिवर्तन के स्पष्ट योग निर्मित हो रहे हैं।

**Vedic Upay** (सात्विक एवं अचूक वैदिक उपाय - Mantras, Japa, Daan & Vastu):
${remedyText}

💡 *विशेष सुझाव: अपनी जन्मकुंडली के D-1, D-9 नवमांश, D-10 दशमांश और विंशोत्तरी महादशा के अनुसार सटीक फलादेश देखने हेतु 'कुंडली' टैब में अपना सही जन्म विवरण दर्ज करें।*`;
}
