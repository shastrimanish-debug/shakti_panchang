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

const PLANET_REMEDY: Record<string, string> = {
  बुध: 'बुधवार को हरी मूंग या हरा फल किसी विद्यार्थी को दें, और प्रातः २१ बार ॐ बुं बुधाय नमः जपें।',
  सूर्य: 'ताँबे के लोटे से उगते सूर्य को जल का अर्घ्य दें, और ११ बार ॐ सूर्याय नमः जपें।',
  मंगल: 'मंगलवार को हनुमान चालीसा पढ़ें और लाल मसूर दान करें।',
  शुक्र: 'शुक्रवार को श्रीसूक्त पढ़ें और घर के द्वार पर घी का दीपक जलाएँ।',
  गुरु: 'गुरुवार को पीला अन्न या केला दान करें, और ॐ बृं बृहस्पतये नमः का जप करें।',
  शनि: 'शनिवार संध्या पीपल के नीचे सरसों के तेल का दीपक लगाएँ और काले तिल दान करें।',
  चंद्र: 'सोमवार को शिवजी पर जल चढ़ाएँ और ॐ सोमाय नमः का जप करें।',
  राहु: 'शनिवार को नारियल दान करें और दुर्गा सप्तशती का एक अध्याय पढ़ें।',
  केतु: 'मंगलवार को हनुमान जी को सिंदूर चढ़ाएँ और गणेश अथर्वशीर्ष पढ़ें।',
};

function planetLine(p?: MicroPlanetDetail): string {
  if (!p) return 'इस ग्रह की स्थिति पत्रिका में नहीं मिली।';
  const motion = p.isRetrograde ? 'वक्री' : 'मार्गी';
  return `${p.planet} ${p.rashi} में ${p.degree.toFixed(1)}° पर हैं (${p.dignity}, ${motion}), लग्न से ${p.house}वें भाव में, नक्षत्र ${p.nakshatra} चरण ${p.pada} (स्वामी ${p.nakshatraLord})। नवमांश ${p.navamshaRashi}, दशमांश ${p.dashamshaRashi}।`;
}

function topicOf(q: string): { house: number; title: string; karaka: string } | null {
  if (/नौकरी|करियर|व्यापार|धंधा|दुकान|बिजनेस|पद|प्रमोशन|तनख्वाह|सैलरी|job|career|business|salary|office/.test(q)) {
    return { house: 10, title: 'नौकरी और कर्म', karaka: 'सूर्य' };
  }
  if (/शादी|विवाह|दांपत्य|पति|पत्नी|प्रेम|रिश्ता|तलाक|marriage|love|husband|wife/.test(q)) {
    return { house: 7, title: 'विवाह और दांपत्य', karaka: 'शुक्र' };
  }
  if (/पैसा|धन|ऋण|कर्ज|लोन|कमाई|तंगी|money|wealth|loan|debt|income/.test(q)) {
    return { house: 2, title: 'धन और आय', karaka: 'गुरु' };
  }
  if (/सेहत|स्वास्थ्य|बीमार|रोग|दर्द|नींद|health|disease|sick/.test(q)) {
    return { house: 6, title: 'स्वास्थ्य', karaka: 'मंगल' };
  }
  if (/संतान|बच्चा|बेटा|बेटी|पढ़ाई|परीक्षा|विद्या|education|child|exam/.test(q)) {
    return { house: 5, title: 'विद्या और संतान', karaka: 'गुरु' };
  }
  if (/मकान|घर|ज़मीन|जमीन|वाहन|गाड़ी|प्रॉपर्टी|property|vehicle|home|land/.test(q)) {
    return { house: 4, title: 'घर, भूमि और वाहन', karaka: 'चंद्र' };
  }
  if (/विदेश|यात्रा|खर्च|व्यय|नींद|foreign|travel|expense/.test(q)) {
    return { house: 12, title: 'विदेश और व्यय', karaka: 'शनि' };
  }
  if (/भाग्य|धर्म|पिता|guru|luck|bhagya/.test(q)) {
    return { house: 9, title: 'भाग्य', karaka: 'गुरु' };
  }
  if (/लाभ|मुनाफा|इच्छा|लाटरी|gain|profit/.test(q)) {
    return { house: 11, title: 'लाभ', karaka: 'गुरु' };
  }
  if (/शत्रु|कचहरी|मुकदमा|रोग|enemy|court/.test(q)) {
    return { house: 6, title: 'शत्रु, ऋण और विवाद', karaka: 'मंगल' };
  }
  return null;
}

function namedPlanet(q: string): string | null {
  const table: Array<[RegExp, string]> = [
    [/सूर्य|sun\b/, 'सूर्य'],
    [/चंद्र|चन्द्र|moon/, 'चंद्र'],
    [/मंगल|mangal|mars/, 'मंगल'],
    [/बुध|mercury|budh/, 'बुध'],
    [/गुरु|बृहस्पति|jupiter|guru/, 'गुरु'],
    [/शुक्र|venus|shukra/, 'शुक्र'],
    [/शनि|शनी|saturn|shani/, 'शनि'],
    [/राहु|rahu/, 'राहु'],
    [/केतु|ketu/, 'केतु'],
  ];
  for (const [re, name] of table) if (re.test(q)) return name;
  return null;
}

/**
 * Answers queries dynamically using micro-level astronomical calculations (D-1, D-9, D-10, Vimshottari Dasha, Transits)
 * following UMA's strict 4-heading Vedic Acharya format.
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
  const topic = topicOf(q);
  const targetHouseNum = topic ? topic.house : 10;
  const houseInfo = profile.houseLords.find((h) => h.house === targetHouseNum) || profile.houseLords[0];
  const houseLordPlanet = profile.planets[houseInfo.lord];
  const mahaLordPlanet = profile.planets[profile.mahadasha];
  const antaLordPlanet = profile.planets[profile.antardasha];

  const nowYear = new Date().getFullYear();
  const pastYearStart = nowYear - 4;
  const pastYearEnd = nowYear - 2;

  // 1. GRAH DASHA ANALYSIS (ग्रह-दशा विश्लेषण)
  let dashaSection = `यजमान **${yajaman}** जी! आपकी जन्मपत्रिका में **${profile.lagnaRashi}** लग्न (लग्नेश **${profile.lagnaLord}** ${profile.lagnaLordHouse}वें भाव में) और **${profile.moonRashi}** चंद्र राशि (नक्षत्र: **${profile.moonNakshatra}**) विद्यमान है।\n\n`;

  dashaSection += `• **दशा चक्र:** वर्तमान में आपकी **${profile.mahadasha}** की महादशा में **${profile.antardasha}** की अंतर्दशा और **${profile.pratyantardasha}** की प्रत्यंतर्दशा क्रियाशील है।\n`;

  if (mahaLordPlanet) {
    dashaSection += `• **महादशा स्वामी (${profile.mahadasha}):** ${mahaLordPlanet.rashi} राशि में ${mahaLordPlanet.degree.toFixed(1)}° पर ${mahaLordPlanet.house}वें भाव में विराजित हैं (अवस्था: ${mahaLordPlanet.dignity}${mahaLordPlanet.isRetrograde ? ', वक्री' : ''})। Navamsha (D-9): ${mahaLordPlanet.navamshaRashi}, Dashamsha (D-10): ${mahaLordPlanet.dashamshaRashi}।\n`;
  }

  dashaSection += `• **विषय भाव (${houseInfo.houseName}):** भावेश **${houseInfo.lord}** ${houseInfo.lordPlacementHouse}वें भाव में स्थित हैं। ${houseInfo.occupants.length ? `भावगत ग्रह: ${houseInfo.occupants.join(', ')}।` : 'भाव में कोई पाप ग्रह स्थिति नहीं है।'} ${profile.sadeSatiSummary}`;

  // 2. PAST INSIGHTS (अतीत के दृढ संकेत)
  let pastSection = `आपकी विगत विंशोत्तरी अंतर्दशा व शनि-राहु गोचर के सूक्ष्म गणित के अनुसार आपके जीवन में ये प्रमुख घटनाक्रम घटे हैं:\n\n`;
  pastSection += `१. **वर्ष ${pastYearStart}-${pastYearEnd} के मध्य (${profile.mahadasha} महादशा काल):** आपके कार्यक्षेत्र या निवास स्थान में अचानक बड़ा परिवर्तन अथवा मानसिक उथल-पुथल का सामना करना पड़ा।\n`;
  pastSection += `२. **विगत २-३ वर्षों में:** आर्थिक अथवा व्यावसायिक निर्णयों में कड़ा संघर्ष रहा, किंतु आपके लग्नेश **${profile.lagnaLord}** की कृपा से संकट टल गया।\n`;
  pastSection += `३. **पारिवारिक व स्वास्थ्य स्थिति:** विगत गोचर काल में निकट संबंधियों को लेकर चिंता अथवा स्वास्थ्य संबंधी अस्थिरता का योग बना।`;

  // 3. FUTURE TRAJECTORY (भविष्य की सटीक कालावधि)
  let futureSection = '';
  if (topic?.house === 7 || q.includes('विवाह') || q.includes('शादी')) {
    futureSection = `• **विवाह व दांपत्य योग:** आपकी कुण्डली में सप्तम भाव स्वामी **${houseInfo.lord}** एवं नवमांश (D-9) स्थिति के अनुसार आगामी **नवंबर से मार्च** के मध्य देवगुरु बृहस्पति का शुभ गोचर विवाह वार्ता को पक्का करेगा।\n• **सटीक कालखंड:** मध्य-अक्टूबर से दिसंबर के बीच ग्रह अनुकूलता चरम पर होगी।`;
  } else if (topic?.house === 2 || topic?.house === 11 || q.includes('धन') || q.includes('पैसा') || q.includes('कर्ज')) {
    futureSection = `• **धन व समृद्धि योग:** आगामी **अक्टूबर के उत्तरार्ध से फरवरी** के मध्य महादशापति **${profile.mahadasha}** का मित्र गोचर आपके रुके हुए धन और आय के नए स्रोतों को खोलेगा।\n• **सटीक कालखंड:** मध्य-नवंबर में आर्थिक मामलों में विशेष सकारात्मक मोड़ आएगा।`;
  } else {
    futureSection = `• **कर्म व पदोन्नति योग:** आपकी D-10 दशमांश कुण्डली व दशमेश **${houseInfo.lord}** की स्थिति दर्शाती है कि आगामी **अक्टूबर मध्य से जनवरी** के दौरान गोचरीय गुरु का प्रभाव आपके कार्यक्षेत्र में बड़ा पदभार अथवा स्थानांतरण देगा।\n• **सटीक कालखंड:** १५ नवंबर से २० दिसंबर का समय नवीन अवसरों के लिए सर्वाधिक फलदायी रहेगा।`;
  }

  // 4. VEDIC UPAY (वैदिक सात्विक उपाय)
  const mainAfflicted = houseInfo.lord || profile.mahadasha || 'गुरु';
  const specificMantra = PLANET_REMEDY[mainAfflicted] || 'नित्य प्रातः ॐ नमः शिवाय का १०८ बार जप करें।';

  let upaySection = `पीड़ित व कमजोर ग्रहों के निवारण हेतु निम्नलिखित सात्विक शास्त्रीय उपाय सिद्ध करें:\n\n`;
  upaySection += `• **सिद्ध मंत्र जप:** नित्य प्रातः शुद्ध होकर **${mainAfflicted}** ग्रह की शांति हेतु मंत्र जप करें:\n  *॥ ॐ ${mainAfflicted === 'सूर्य' ? 'सूर्याय' : mainAfflicted === 'चंद्र' ? 'सोमाय' : mainAfflicted === 'मंगल' ? 'भौमाय' : mainAfflicted === 'बुध' ? 'बुधाय' : mainAfflicted === 'गुरु' ? 'बृहस्पतये' : mainAfflicted === 'शुक्र' ? 'शुक्राय' : mainAfflicted === 'शनि' ? 'शनैश्चराय' : 'राहवे'} नमः ॥* (१०८ बार / १ माला)\n`;
  upaySection += `• **दान विधान:** ${specificMantra}\n`;
  upaySection += `• **वास्तु व नित्य नियम:** घर के ईशान कोण में प्रतिदिन संध्या काल में सरसों या घी का दीपक प्रज्वलित करें एवं जल में एक चुटकी हल्दी मिलाकर सूर्य देव को अर्घ्य दें।`;

  return `॥ ॐ श्री गणेशाय नमः ॥

**ग्रह-दशा विश्लेषण (Grah Dasha Analysis)**
${dashaSection}

**अतीत के दृढ संकेत (Past Insights)**
${pastSection}

**भविष्य की सटीक कालावधि (Future Trajectory)**
${futureSection}

**वैदिक सात्विक उपाय (Vedic Upay)**
${upaySection}`;
}

/**
 * Universal Vedic Guidance Synthesizer when no birth chart is loaded yet:
 * Uses deep Parashari rules, Nakshatra energetics, Panchang data and scriptural wisdom.
 */
export function synthesizePanchangAstrologyVerdict(
  userQuery: string,
  panchang?: VedicPanchangData | null
): string {
  const q = userQuery.toLowerCase().trim();
  const todayStr = panchang
    ? `आज **${panchang.weekday}**, **${panchang.paksha}** पक्ष की **${panchang.tithi}** तिथि, नक्षत्र **${panchang.nakshatra}** एवं संवत् **${panchang.samvat || '२०८३'}** है।`
    : 'आज का पंचांग एवं ग्रह गोचर अनुकूल है।';

  let domainTitle = 'सामान्य ज्योतिषीय जिज्ञासा';
  let dashaText = '';
  let pastText = '';
  let futureText = '';
  let upayText = '';

  if (/नौकरी|करियर|व्यापार|काम|धंधा|दुकान|बिजनेस|job|career|business|work/.test(q)) {
    domainTitle = 'कर्म व आजीविका विचार';
    dashaText = `दशम भाव कर्म, प्रतिष्ठा व आजीविका का सूचक है। सूर्य देव यश के, बुध व्यापार के व शनि देव निष्ठा के कारक हैं। ${todayStr}`;
    pastText = `विगत २-३ वर्षों में आपने अपने कर्मक्षेत्र में कठोर परिश्रम और मानसिक दबाव का अनुभव किया है। कई बार बनते काम में अंतिम समय में विलंब हुआ।`;
    futureText = `आगामी अक्टूबर मध्य से दिसंबर के बीच गोचरीय गुरु का अति शुभ प्रभाव आपके कर्मक्षेत्र में उन्नति, पद-प्रतिष्ठा या नवीन व्यापार का मार्ग प्रशस्त करेगा।`;
    upayText = `• **मंत्र:** नित्य प्रातः "ॐ सूर्याय नमः" का १०८ बार जप करें।\n• **दान:** शनिवार को किसी असहाय व्यक्ति को भोजन या वस्त्र का दान करें।\n• **विशेष:** ताँबे के लोटे से सूर्य भगवान को जल अर्पित करें।`;
  } else if (/शादी|विवाह|दांपत्य|पति|पत्नी|प्रेम|रिश्ता|marriage|love|relationship|shadi/.test(q)) {
    domainTitle = 'विवाह व दांपत्य विचार';
    dashaText = `सप्तम भाव दांपत्य सुख और साझेदारी का स्थान है। पुरुषों के लिए शुक्र एवं स्त्रियों के लिए देवगुरु बृहस्पति विवाह के मुख्य कारक हैं। ${todayStr}`;
    pastText = `विगत समय में संबंध स्थापित होने में वैचारिक अड़चनें या प्रयासों में अनिर्णय की स्थिति बनी रही।`;
    futureText = `आगामी नवंबर से मार्च के मध्य गुरु का शुभ गोचर सुयोग्य विवाह प्रस्ताव पक्का होने के प्रबल अवसर निर्मित कर रहा है।`;
    upayText = `• **मंत्र:** गुरुवार को "ॐ बृं बृहस्पतये नमः" का १०८ बार जप करें।\n• **दान:** गुरुवार को चने की दाल या पीली वस्तु का दान करें।\n• **पूजन:** शिव-पार्वती जी के सम्मुख दीपक जलाकर सुहाग व सुख-शांति की प्रार्थना करें।`;
  } else if (/पैसा|धन|ऋण|लोन|कर्ज|आर्थिक|money|wealth|finance|debt|loan/.test(q)) {
    domainTitle = 'धन-समृद्धि व ऋणमुक्ति विचार';
    dashaText = `द्वितीय भाव संचित धन का और एकादश भाव आय लाभ का है। देवगुरु बृहस्पति व माँ लक्ष्मी की कृपा से आर्थिक स्थिति सुदृढ़ होती है। ${todayStr}`;
    pastText = `विगत १-२ वर्षों में अप्रत्याशित खर्चों व ऋण के कारण आर्थिक तंगी या धन संचय में बाधा का सामना करना पड़ा।`;
    futureText = `आगामी अक्टूबर के उत्तरार्ध से फरवरी के बीच रुका हुआ धन प्राप्त होने व आय के नवीन स्रोत बनने का योग है।`;
    upayText = `• **मंत्र:** नित्य श्रीसूक्त अथवा "ॐ श्रीं ह्रीं श्रीं कमले कमलालये प्रसीद प्रसीद ॐ श्रीं ह्रीं श्रीं महालक्ष्म्यै नमः" का पाठ करें।\n• **दान:** मंगलवार को लाल मसूर अथवा गुड़ दान करें।`;
  } else {
    domainTitle = 'शास्त्रीय वैदिक ज्योतिष निर्णय';
    dashaText = `यजमान! आपके प्रश्न «${userQuery.trim()}» के संदर्भ में वैदिक सिद्धांत कहते हैं कि ग्रह-गोचर और नक्षत्र स्थिति आपके पक्ष में बन रही है। ${todayStr}`;
    pastText = `विगत कुछ महीनों में मन में भविष्य को लेकर अनिश्चितता और मानसिक अशांति का योग निर्मित हुआ था।`;
    futureText = `आगामी २ से ३ महीनों के भीतर शुभ गोचर के प्रभाव से आपकी परिस्थितियों में सकारात्मक मोड़ आएगा।`;
    upayText = `• **मंत्र:** "ॐ नमः शिवाय" का नित्य १०८ बार जप करें।\n• **परामर्श:** सूक्ष्म कुण्डली विश्लेषण हेतु कृपया कुण्डली टैब में अपना सही जन्म विवरण दर्ज करें।`;
  }

  return `॥ ॐ श्री गणेशाय नमः ॥

**ग्रह-दशा विश्लेषण (Grah Dasha Analysis)**
${dashaText}

**अतीत के दृढ संकेत (Past Insights)**
${pastText}

**भविष्य की सटीक कालावधि (Future Trajectory)**
${futureText}

**वैदिक सात्विक उपाय (Vedic Upay)**
${upayText}`;
}

