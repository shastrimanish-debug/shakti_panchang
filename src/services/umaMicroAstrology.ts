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
 * Answers the actual question from this chart. Two different questions must not
 * come back as the same three-paragraph script.
 */
export function synthesizeDynamicMicroVerdict(
  k: KundaliData,
  userQuery: string,
  panchang?: VedicPanchangData | null
): string {
  const profile = buildMicroAstrologyProfile(k);
  const q = userQuery.toLowerCase();
  const asked = userQuery.trim();
  const dasha = `अभी ${profile.mahadasha} महादशा, ${profile.antardasha} अंतर्दशा और ${profile.pratyantardasha} प्रत्यंतर चल रही है।`;
  const today = panchang
    ? `आज ${panchang.weekday}, ${panchang.paksha} पक्ष की ${panchang.tithi}, नक्षत्र ${panchang.nakshatra}।`
    : '';

  if (/लग्न\s*(क्या|कौन|कितना|बता)|mera lagna|my lagna|लग्न राशि/.test(q)) {
    const lord = profile.planets[profile.lagnaLord];
    return `आपका लग्न **${profile.lagnaRashi}** है। लग्नेश **${profile.lagnaLord}** ${profile.lagnaLordHouse}वें भाव में हैं। ${lord ? planetLine(lord) : ''} चंद्र **${profile.moonRashi}** के **${profile.moonNakshatra}** नक्षत्र में हैं। ${dasha}`;
  }

  if (/महादशा|अंतर्दशा|प्रत्यंतर|दशा क्या|which dasha|current dasha|दशा चल/.test(q)) {
    const lord = profile.planets[profile.mahadasha];
    return `${profile.name} जी, ${dasha} महादशा के स्वामी की स्थिति: ${planetLine(lord)} ${profile.sadeSatiSummary}`;
  }

  if (/मांगलिक|मंगल दोष|manglik/.test(q) && !/नौकरी|शादी के उपाय/.test(q)) {
    const mars = profile.planets['मंगल'];
    return `${profile.name} जी, पत्रिका में मांगलिक स्थिति: **${profile.manglikStatus}**। ${planetLine(mars)} विवाह का असली फल सप्तम भाव और शुक्र/गुरु से देखें, केवल मंगल के भाव से नहीं।`;
  }

  if (/साढ़े|ढैया|sade sati|sadesati/.test(q)) {
    const shani = profile.planets['शनि'];
    return `${profile.name} जी, ${profile.sadeSatiSummary} जन्म का शनि: ${planetLine(shani)} चंद्र राशि ${profile.moonRashi} है, साढ़ेसाती इसी राशि से गिनी जाती है। उपाय: ${PLANET_REMEDY['शनि']}`;
  }

  const askedPlanet = namedPlanet(q);
  if (askedPlanet && /कहाँ|कहां|कौन से भाव|किस भाव|कितने|स्थिति|position|house|क्या फल/.test(q)) {
    const p = profile.planets[askedPlanet];
    return `${profile.name} जी, आपने ${askedPlanet} की स्थिति पूछी। ${planetLine(p)} ${dasha} ${PLANET_REMEDY[askedPlanet] ? `यदि इस ग्रह की शांति करनी हो: ${PLANET_REMEDY[askedPlanet]}` : ''}`;
  }

  const topic = topicOf(q);
  if (topic) {
    const house = profile.houseLords.find((h) => h.house === topic.house)!;
    const lord = profile.planets[house.lord];
    const karaka = profile.planets[topic.karaka];
    const people = house.occupants.length ? house.occupants.join(', ') : 'कोई ग्रह नहीं';
    const eleventh = topic.house === 2 ? profile.houseLords.find((h) => h.house === 11) : null;
    const extra = eleventh
      ? ` आय का भाव ११, उसके स्वामी ${eleventh.lord} ${eleventh.lordPlacementHouse}वें भाव में हैं।`
      : '';
    const tight = lord && ([6, 8, 12].includes(lord.house) || lord.isRetrograde || lord.dignity === 'नीच');
    const outlook = tight
      ? `इसलिए ${topic.title} में देरी, दोबारा मेहनत या कागज़ी अड़चन बनती है। फल कटता नहीं, समय लगता है।`
      : `इसलिए ${topic.title} का दरवाज़ा बंद नहीं है। दशा साथ दे तो काम बनता है।`;
    const remedy = tight ? `\n\nइस प्रश्न का उपाय ${house.lord} का है: ${PLANET_REMEDY[house.lord] || PLANET_REMEDY['गुरु']}` : '';
    return `${profile.name} जी, आपके शब्द थे: «${asked}»\n\n${topic.title} का उत्तर इस पत्रिका में ${topic.house}वें भाव से है। वह भाव **${house.sign}** का है, स्वामी **${house.lord}**। ${planetLine(lord)} इस भाव में ${people} बैठे हैं। कारक ${topic.karaka}: ${planetLine(karaka)}${extra}\n\n${dasha} ${outlook}${today ? ` ${today}` : ''}${remedy}`;
  }

  if (/ग्रह|कुंडली|पत्रिका|फल|भविष्य|क्या होगा|कैसा रहेगा|बताओ|batao|horoscope/.test(q)) {
    const lines = ['सूर्य', 'चंद्र', 'मंगल', 'बुध', 'गुरु', 'शुक्र', 'शनि', 'राहु', 'केतु']
      .map((name) => {
        const p = profile.planets[name];
        return p ? `• ${name}: ${p.rashi} ${p.degree.toFixed(0)}°, भाव ${p.house}${p.isRetrograde ? ', वक्री' : ''}` : '';
      })
      .filter(Boolean)
      .join('\n');
    const hit = profile.keyAfflictions[0] || profile.keyStrengths[0] || 'कोई एक ग्रह बहुत अधिक पीड़ित नहीं है।';
    return `${profile.name} जी, आपने पूछा: «${asked}»\n\nलग्न **${profile.lagnaRashi}**, चंद्र **${profile.moonRashi}** (${profile.moonNakshatra})। ${dasha} ${profile.sadeSatiSummary}\nसबसे पहले जो बात पत्रिका कहती है: ${hit}\n\n${lines}\n\nकोई एक विषय पूछें — नौकरी, शादी, धन, सेहत, दशा या किसी एक ग्रह का नाम — उसी का सीधा उत्तर दूँगी, पूरा रटा हुआ लेख नहीं।`;
  }

  return `${profile.name} जी, «${asked}» का सीधा ज्योतिषीय शीर्षक पत्रिका में नहीं मिला, इसलिए मैं अनुमान की बात नहीं बनाऊँगी।\n\nजो पक्का है: लग्न **${profile.lagnaRashi}**, चंद्र **${profile.moonRashi}**, नक्षत्र **${profile.moonNakshatra}**। ${dasha} ${today}\nनौकरी, शादी, धन, सेहत, मकान, साढ़ेसाती, या सूर्य से केतु तक किसी एक ग्रह का नाम लिख दें। उसी का भाव, राशि, अंश और उपाय बताऊँगी।`;
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
    principleText = 'लग्न देह का बल है और चंद्र मन का। रोग-शांति में महामृत्युंजय जप मुख्य है: ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम्। उर्वारुकमिव बन्धनान्मृत्योर्मुक्षीय मामृतात्॥';
    remedyText = '• यह मंत्र १०८ बार जपें।\n• ताँबे के पात्र का जल प्रातः पिएँ।\n• सोमवार को शिवजी पर जल चढ़ाएँ।';
  } else if (/शनि|साढ़े|ढैया|shani|sade|dhaiya/.test(q)) {
    domainTitle = 'शनि कृपा व साढ़ेसाती विधान (Saturn Transit)';
    principleText = 'शनि देव कर्मफलदाता हैं। जो व्यक्ति सत्यवादी, संयमित और कर्मनिष्ठ रहता है, शनि देव उसे हर विपत्ति से उबारकर राजा समान बना देते हैं।';
    remedyText = '• **मंत्र:** शनिवार संध्या पीपल के वृक्ष के नीचे "ॐ शं शनैश्चराय नमः" का १०८ बार जप करें।\n• **दान:** काले तिल, तेल या वस्त्र का दान करें।';
  } else {
    domainTitle = `आपके प्रश्न का उत्तर`;
    principleText = `आपने पूछा: «${userQuery.trim()}». इसका एक ही रटा उत्तर नहीं दूँगी। बिना जन्म पत्रिका के मैं केवल आज का पंचांग और शास्त्र का सामान्य नियम बता सकती हूँ। व्यक्तिगत फल के लिए कुंडली टैब में नाम, तिथि, समय और स्थान भर दें, फिर यही प्रश्न दोबारा पूछें।`;
    remedyText = 'कुंडली खुलते ही उसी प्रश्न का भाव, भावेश, अंश और दशा लिख कर उत्तर आएगा।';
  }

  const todayStr = panchang
    ? `\n📅 **आज का पंचांग गोचर:** ${panchang.weekday}, ${panchang.paksha} पक्ष की **${panchang.tithi}** तिथि, **${panchang.nakshatra}** नक्षत्र।`
    : '';

  return `॥ ॐ श्री गणेशाय नमः ॥\n\n**${domainTitle}**\n${principleText}${todayStr}\n\n${remedyText}`;
}
