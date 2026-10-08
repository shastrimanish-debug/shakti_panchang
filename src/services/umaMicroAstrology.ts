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
  let karakInfo = 'सूर्य व शनि देव';

  if (/नौकरी|करियर|व्यापार|काम|धंधा|दुकान|बिजनेस|कारोबार|job|career|business|work|dhandha|promotion|office|salary/.test(q)) {
    targetHouse = 10;
    targetAreaName = 'आजीविका, पदोन्नति व कार्यक्षेत्र';
    karakInfo = 'कर्मेश सूर्य, बुध व शनि';
  } else if (/शादी|विवाह|दांपत्य|पति|पत्नी|प्रेम|मिलान|रिश्ता|लड़की|लड़का|तलाक|marriage|love|relationship|husband|wife|divorce|shadi|rishta/.test(q)) {
    targetHouse = 7;
    targetAreaName = 'विवाह, दांपत्य व संबंध';
    karakInfo = 'सप्तमेश शुक्र व देवगुरु बृहस्पति';
  } else if (/पैसा|धन|ऋण|लोन|कर्ज|बचत|आर्थिक|तंगी|रुपया|कमाई|money|finance|wealth|loan|debt|earning|income|saving/.test(q)) {
    targetHouse = 2;
    targetAreaName = 'धन संचय, कोष व आर्थिक उन्नति';
    karakInfo = 'धनेश व लाभेश गुरु-शुक्र';
  } else if (/सेहत|स्वास्थ्य|बीमार|रोग|दवा|तनाव|अनिद्रा|दर्द|बीमारी|health|disease|sick|tension|stress|pain|sleep/.test(q)) {
    targetHouse = 6;
    targetAreaName = 'आरोग्य, स्वास्थ्य व रोग निवारण';
    karakInfo = 'षष्ठेश व लग्नेश';
  } else if (/संतान|बच्चा|बेटा|बेटी|पुत्र|पुत्री|पढ़ाई|परीक्षा|शिक्षा|विद्या|child|children|education|study|exam|son|daughter/.test(q)) {
    targetHouse = 5;
    targetAreaName = 'विद्या, बुद्धि व संतान सुख';
    karakInfo = 'पंचमेश देवगुरु व बुध';
  } else if (/मकान|घर|भूमि|जमीन|वाहन|गाड़ी|प्रॉपर्टी|फ्लैट|house|home|land|property|car|vehicle|flat/.test(q)) {
    targetHouse = 4;
    targetAreaName = 'भूमि, भवन, वाहन व गृह-सुख';
    karakInfo = 'चतुर्थेश मंगल व शुक्र';
  } else if (/शनि|साढ़े|ढैया|shani|sade|dhaiya/.test(q)) {
    targetHouse = 8;
    targetAreaName = 'शनि प्रभाव, साढ़ेसाती व ढैया';
    karakInfo = 'कर्मफलदाता शनि देव';
  } else if (/राहु|केतु|कालसर्प|ग्रहण|rahu|ketu|kaal|sarp/.test(q)) {
    targetHouse = 8;
    targetAreaName = 'छाया ग्रह राहु-केतु प्रभाव';
    karakInfo = 'राहु व केतु';
  } else if (/दशा|महादशा|अंतर्दशा|dasha|mahadasha/.test(q)) {
    targetHouse = 1;
    targetAreaName = 'विंशोत्तरी महादशा व अंतर्दशा';
    karakInfo = `${profile.mahadasha} महादशा`;
  }

  const hInfo = profile.houseLords.find((h) => h.house === targetHouse) || profile.houseLords[0];
  const lordDetail = profile.planets[hInfo.lord];
  const dashaLordDetail = profile.planets[profile.mahadasha];

  // Past & Present observation based on actual mathematical configuration
  let pastPresentText = '';
  if (lordDetail && lordDetail.isRetrograde) {
    pastPresentText = `आपकी पत्रिका में ${hInfo.houseName} के स्वामी **${hInfo.lord}** वक्री स्थिति में हैं। वर्तमान में **${profile.mahadasha}** की महादशा और **${profile.antardasha}** की अंतर्दशा चल रही है। इसी कारण ${targetAreaName} को लेकर हाल के समय में मन में द्वंद्व, निर्णय लेने में संकोच और प्रयासों के अनुपात में परिणाम मिलने में थोड़ा विलंब देखने को मिला है।`;
  } else if (lordDetail && [6, 8, 12].includes(lordDetail.house)) {
    pastPresentText = `आपकी जन्मपत्रिका में ${targetHouse}वें भाव के स्वामी **${hInfo.lord}** ${lordDetail.house}वें भाव में स्थित हैं। इसके प्रभाव से पिछले दिनों में कागजी अड़चनें, अचानक व्यय अथवा कार्यों में अनपेक्षित मोड़ आए हैं।`;
  } else {
    pastPresentText = `आपकी जन्मपत्रिका के ${hInfo.houseName} का स्वामी **${hInfo.lord}** लग्न से ${lordDetail ? lordDetail.house : 1}वें भाव में ${lordDetail ? lordDetail.rashi : ''} राशि में स्थित है। वर्तमान ${profile.mahadasha} महादशा में ऊर्जा और कर्मठता में वृद्धि हुई है, यद्यपि परिस्थिति में पूर्ण स्थिरता लाने के लिए सूक्ष्म संतुलन की आवश्यकता है।`;
  }

  // Future trajectory
  let futureText = '';
  if (dashaLordDetail && (dashaLordDetail.dignity === 'उच्च' || dashaLordDetail.dignity === 'स्वक्षेत्र')) {
    futureText = `अच्छी बात यह है कि आपकी महादशा स्वामी **${profile.mahadasha}** पत्रिका में बली अवस्था में हैं। नवमांश (D9) में भी इनकी स्थिति शुभ संबल दे रही है। आगामी ६ से १२ महीनों में जब गोचर में बृहस्पति और सूर्य का अनुकूल कोण बनेगा, तो ${targetAreaName} में अवरोध दूर होंगे और नवीन शुभ अवसर प्राप्त होंगे।`;
  } else {
    futureText = `आगामी समय में गोचरीय ग्रहों के अनुकूल संचार और **${profile.antardasha}** अंतर्दशा की परिपक्वता से स्थिति संभलेगी। विशेषकर आने वाले समय में पुराने संपर्कों से लाभ और रुके हुए संकल्पों को पूर्ण करने की दिशा में प्रगति होगी।`;
  }

  // Tailored Micro Remedy
  let remedyPlanet = hInfo.lord;
  let remedyText = '';

  if (remedyPlanet === 'बुध') {
    remedyText = `• बुधवार को किसी कन्या को हरे फल अथवा हरी मूंग का दान करें।\n• नित्य प्रातः 'ॐ बुं बुधाय नमः' का २१ बार जप करें और तुलसी पत्र को जल अर्पित करें।`;
  } else if (remedyPlanet === 'सूर्य') {
    remedyText = `• नित्य प्रातः तांबे के लोटे में रोली, अक्षत व थोड़ा गुड़ मिलाकर उगते सूर्य को अर्घ्य दें।\n• 'आदित्य हृदय स्तोत्र' का पाठ करें अथवा 'ॐ सूर्याय नमः' का ११ बार जप करें।`;
  } else if (remedyPlanet === 'मंगल') {
    remedyText = `• मंगलवार को हनुमान जी को सिंदूर व चमेली का तेल या लाल पुष्प अर्पित करें।\n• 'हनुमान चालीसा' का नित्य पाठ करें और लाल मसूर की दाल का दान करें।`;
  } else if (remedyPlanet === 'शुक्र') {
    remedyText = `• शुक्रवार को माँ भगवती लक्ष्मी के सम्मुख घी का दीपक जलाकर खीर या बताशे का भोग लगाएं।\n• 'ॐ शुं शुक्राय नमः' का जप करें और इत्र का प्रयोग सात्विक रूप से करें।`;
  } else if (remedyPlanet === 'गुरु') {
    remedyText = `• गुरुवार को स्नान के जल में चुटकी भर हल्दी डालें और केले के वृक्ष या गुरुजनों का वंदन करें।\n• 'ॐ बृं बृहस्पतये नमः' का जप करें और पीले अन्न का दान करें।`;
  } else if (remedyPlanet === 'शनि') {
    remedyText = `• शनिवार की संध्या को पीपल के वृक्ष के नीचे सरसों के तेल का दीपक प्रज्वलित करें।\n• 'ॐ शं शनैश्चराय नमः' का जप करें और किसी जरूरतमंद को काले तिल या जूते-वस्त्र का दान करें।`;
  } else {
    remedyText = `• नित्य प्रातः 'ॐ नमो भगवते वासुदेवाय' का २१ बार स्मरण करें।\n• अपने कुलदेवता व माता-पिता के चरण स्पर्श कर दिन का आरंभ करें।`;
  }

  const panchangStr = panchang ? `\n(आज ${panchang.weekday}, ${panchang.paksha} ${panchang.tithi} तिथि का गोचर भी अनुकूल प्रभाव दे रहा है।)` : '';

  return `॥ ॐ श्री गणेशाय नमः ॥

सदा कल्याण हो, **${profile.name}** जी! मैं उमा हूँ।

आपकी पत्रिका (**लग्न: ${profile.lagnaRashi}**, **चंद्र राशि: ${profile.moonRashi}**, **नक्षत्र: ${profile.moonNakshatra}**, **महादशा: ${profile.mahadasha}** / **अंतर्दशा: ${profile.antardasha}**) के सूक्ष्म गणित के अनुसार:

🌿 **ग्रह स्थिति व वर्तमान परिस्थिति:**
${pastPresentText}

🔮 **आगामी ६–१२ महीनों का ज्योतिषीय मार्गदर्शन:**
${futureText}

🕉️ **शास्त्रोक्त सात्विक सूक्ष्म उपाय:**
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

  let domainTitle = 'शुभ वैदिक मार्गदर्शन';
  let principleText = '';
  let remedyText = '';

  if (/नौकरी|करियर|व्यापार|काम|धंधा|दुकान|बिजनेस|job|career|business|work/.test(q)) {
    domainTitle = 'कर्म व आजीविका विचार (Career & Business)';
    principleText = 'वैदिक ज्योतिष में दशम भाव कर्म और प्रतिष्ठा का प्रतीक है। सूर्य देव यश-सम्मान और अधिकारी पद के कारक हैं, बुध व्यापार और निर्णय के कारक हैं, तथा शनि देव कर्मठता और न्याय के कारक हैं। जब भी कर्मक्षेत्र में बाधा आए, सूर्य और शनि के समन्वय से भाग्य का द्वार खुलता है।';
    remedyText = '• नित्य प्रातः तांबे के पात्र से सूर्य नारायण को अर्घ्य दें और आदित्य हृदय स्तोत्र का पाठ करें।\n• शनिवार को किसी श्रमिक या जरूरतमंद व्यक्ति को भोजन कराएं।\n• कार्यस्थल पर ईशान कोण (उत्तर-पूर्व) को सदा स्वच्छ व प्रकाशवान रखें।';
  } else if (/शादी|विवाह|दांपत्य|पति|पत्नी|प्रेम|रिश्ता|marriage|love|relationship|shadi/.test(q)) {
    domainTitle = 'विवाह व दांपत्य विचार (Marriage & Harmony)';
    principleText = 'सप्तम भाव दांपत्य सुख का केन्द्र है। पुरुषों की पत्रिका में शुक्र और स्त्रियों की पत्रिका में देवगुरु बृहस्पति विवाह के प्रमुख कारक होते हैं। यदि विवाह में विलंब या दांपत्य में तनाव हो, तो गौरी-शंकर उपासना और गुरु-शुक्र की अनुकूलता सर्वोपरि मानी गई है।';
    remedyText = '• गुरुवार को भगवान विष्णु और माँ लक्ष्मी का एक साथ पूजन करें।\n• शिव-पार्वती के सम्मुख घी का दीपक जलाकर "ॐ नमः शिवाय" का जप करें।\n• कन्याएं माँ कात्यायनी मंत्र अथवा गौरी पूजन करें।';
  } else if (/पैसा|धन|ऋण|लोन|कर्ज|आर्थिक|money|wealth|finance|debt|loan/.test(q)) {
    domainTitle = 'धन-समृद्धि व ऋणमुक्ति विचार (Wealth & Debt Relief)';
    principleText = 'वैदिक सिद्धांत में द्वितीय भाव धन संचय और एकादश भाव आय व लाभ का है। देवगुरु बृहस्पति समृद्धि के दाता हैं और माँ महालक्ष्मी की कृपा से अष्ट-लक्ष्मी योग जागृत होता है। ऋण मुक्ति के लिए मंगलवार को भौम प्रदोष व मंगल ऋण मोचक स्तोत्र अचूक है।';
    remedyText = '• नित्य कनकधारा स्तोत्र अथवा श्रीसूक्त का पाठ करें।\n• मंगलवार को ऋण मोचक मंगल स्तोत्र का पाठ करें और हनुमान जी को गुड़ अर्पित करें।\n• शुक्रवार को संध्या समय घर के मुख्य द्वार पर दीपक अवश्य प्रज्वलित करें।';
  } else if (/सेहत|स्वास्थ्य|रोग|दवा|बीमार|health|disease|sick/.test(q)) {
    domainTitle = 'आरोग्य व स्वास्थ्य रक्षा (Health & Vitality)';
    principleText = 'लग्न और सूर्य आत्मा तथा देह के बल हैं, जबकि चंद्रमा मन के कारक हैं। किसी भी अरिष्ट या रोग की शांति हेतु महामृत्युंजय जप और सूर्य उपासना से श्रेष्ठ कोई औषधि नहीं है।';
    remedyText = '• नित्य १०८ बार महामृत्युंजय मंत्र: "ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम्। उर्वारुकमिव बन्धनान्मृत्यsourceर्मुक्षीय मामृतात्॥" का जप करें।\n• तांबे के पात्र में रखा जल प्रातः ग्रहण करें।\n• सोमवार को भगवान शिव का दुग्ध अथवा गंगाजल से अभिषेक करें।';
  } else if (/शनि|साढ़े|ढैया|shani|sade|dhaiya/.test(q)) {
    domainTitle = 'शनि कृपा व साढ़ेसाती विधान (Saturn Transit)';
    principleText = 'शनि देव दण्डनायक हैं, वे केवल व्यक्ति के कर्मों की परीक्षा लेते हैं। जो व्यक्ति सत्यवादी, विनम्र और कर्मनिष्ठ रहता है, शनि देव उसे रंक से राजा बना देते हैं। साढ़ेसाती में पीपल सेवा और दशरथ कृत शनि स्तोत्र परम कल्याणकारी हैं।';
    remedyText = '• शनिवार की संध्या पीपल के वृक्ष की जड़ में सरसों के तेल का चौमुखा दीपक लगाएं।\n• दशरथ कृत शनि स्तोत्र का पाठ करें।\n• असहाय, वृद्ध अथवा दिव्यांग व्यक्तियों का सम्मान व सेवा करें।';
  } else {
    domainTitle = 'वैदिक जीवन सूत्र व ग्रह शांति';
    principleText = 'सनातन वैदिक ज्योतिष का मूल ध्येय व्यक्ति को कर्म के प्रति जागरूक करना और परमात्मा के नियमों के साथ जीवन को संतुलित बनाना है। जब भाव शुद्ध हो और नित्य ईश-स्मरण हो, तो समस्त प्रतिकूल ग्रह भी अनुकूल फल देने लगते हैं।';
    remedyText = '• नित्य प्रातः गायत्री मंत्र अथवा "ॐ नमो भगवते वासुदेवाय" का २१ बार जप करें।\n• अपने इष्टदेव का स्मरण कर दिन का संकल्प लें।\n• पक्षियों को दाना और गाय को नित्य पहली रोटी दें।';
  }

  const todayStr = panchang
    ? `\n📅 **आज का पंचांग गोचर:** ${panchang.weekday}, ${panchang.paksha} पक्ष की **${panchang.tithi}** तिथि, **${panchang.nakshatra}** नक्षत्र।`
    : '';

  return `॥ ॐ श्री गणेशाय नमः ॥

प्रणाम यजमान! मैं **उमा** हूँ। आपके प्रश्न पर वैदिक ज्योतिष व शास्त्रों के अनुसार मेरा मार्गदर्शन:

📜 **${domainTitle}:**
${principleText}
${todayStr}

🕉️ **सात्विक एवं अचूक शास्त्रोक्त उपाय:**
${remedyText}

💡 *सुझाव: अपनी सटीक जन्म कुंडली, विंशोत्तरी महादशा और लग्न भाव के अनुसार सूक्ष्म व्यक्तिगत फलादेश देखने हेतु आप ऐप के 'कुंडली' टैब में अपना जन्म विवरण भी दर्ज कर सकते हैं। सनातन शक्ति पंचांग आपके साथ है!*`;
}
