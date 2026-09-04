import {
  KundaliData,
  PlanetPosition,
  DashaPeriod,
  AntarDashaPeriod,
  DashaPratyantarPeriod,
  AshtakootItem,
} from '../types';
import {
  RASHIS,
  NAKSHATRAS,
  calculatePlanetPositions,
  calculateLagnaDegree,
} from './astronomy';

export const DASHA_ORDER = [
  'केतु', 'शुक्र', 'सूर्य', 'चंद्र', 'मंगल', 'राहु', 'गुरु', 'शनि', 'बुध'
];

export const DASHA_YEARS: Record<string, number> = {
  केतु: 7,
  शुक्र: 20,
  सूर्य: 6,
  चंद्र: 10,
  मंगल: 7,
  राहु: 18,
  गुरु: 16,
  शनि: 19,
  बुध: 17,
};

export const NAKSHATRA_GANAS = [
  'देव', 'मनुष्य', 'राक्षस', 'मनुष्य', 'देव', 'मनुष्य', 'देव', 'देव', 'राक्षस',
  'राक्षस', 'मनुष्य', 'मनुष्य', 'देव', 'राक्षस', 'देव', 'राक्षस', 'देव', 'राक्षस',
  'राक्षस', 'मनुष्य', 'मनुष्य', 'देव', 'राक्षस', 'राक्षस', 'मनुष्य', 'मनुष्य', 'देव'
];

export const NAKSHATRA_YONIS = [
  'अश्व', 'गज', 'मेढ़ा', 'सर्प', 'सर्प', 'श्वान', 'मार्जार', 'मेढ़ा', 'मार्जार',
  'मूषक', 'मूषक', 'गौ', 'महिष', 'व्याघ्र', 'महिष', 'व्याघ्र', 'मृग', 'मृग',
  'श्वान', 'वानर', 'नकुल', 'वानर', 'सिंह', 'अश्व', 'सिंह', 'गौ', 'गज'
];

export const NAKSHATRA_NADIS = [
  'आदि', 'मध्य', 'अन्त्य', 'अन्त्य', 'मध्य', 'आदि', 'आदि', 'मध्य', 'अन्त्य',
  'अन्त्य', 'मध्य', 'आदि', 'आदि', 'मध्य', 'अन्त्य', 'अन्त्य', 'मध्य', 'आदि',
  'आदि', 'मध्य', 'अन्त्य', 'अन्त्य', 'मध्य', 'आदि', 'आदि', 'मध्य', 'अन्त्य'
];

export const RASHI_VASHYAS = [
  'चतुष्पाद', 'चतुष्पाद', 'मानव', 'जलचर', 'वनचर', 'मानव',
  'मानव', 'कीट', 'द्विपद/मानव', 'जलचर', 'मानव', 'जलचर'
];

export function getVarna(rashiIdx: number): string {
  if ([3, 7, 11].includes(rashiIdx)) return 'ब्राह्मण';
  if ([0, 4, 8].includes(rashiIdx)) return 'क्षत्रिय';
  if ([1, 5, 9].includes(rashiIdx)) return 'वैश्य';
  return 'शूद्र';
}

function parseTimeString(timeStr: string): { hours: number; minutes: number; seconds: number } {
  let s = timeStr.trim().toUpperCase().replace(/\s+/g, '');
  const isPM = s.endsWith('PM');
  const isAM = s.endsWith('AM');
  if (isPM || isAM) s = s.slice(0, -2);
  s = s.replace('.', ':');
  const parts = s.split(':').map((p) => parseInt(p, 10) || 0);
  let h = parts[0] ?? 12;
  const m = parts[1] ?? 0;
  const sec = parts[2] ?? 0;
  if (isPM && h < 12) h += 12;
  if (isAM && h === 12) h = 0;
  return {
    hours: Math.min(23, Math.max(0, h)),
    minutes: Math.min(59, Math.max(0, m)),
    seconds: Math.min(59, Math.max(0, sec)),
  };
}

export function calculatePratyantarPeriods(
  maha: string,
  antar: string,
  startDate: Date,
  endDate: Date
): DashaPratyantarPeriod[] {
  const antarIdx = DASHA_ORDER.indexOf(antar);
  const totalDurationMs = endDate.getTime() - startDate.getTime();
  const periods: DashaPratyantarPeriod[] = [];
  let currentStart = new Date(startDate);

  for (let i = 0; i < 9; i++) {
    const pratyantar = DASHA_ORDER[(antarIdx + i) % 9];
    const weight = (DASHA_YEARS[pratyantar] || 7) / 120.0;
    const duration = totalDurationMs * weight;
    const endMs = i === 8 ? endDate.getTime() : currentStart.getTime() + duration;
    const currentEnd = new Date(endMs);
    const days = (endMs - currentStart.getTime()) / (1000 * 60 * 60 * 24);

    periods.push({
      maha,
      antar,
      pratyantar,
      startDate: new Date(currentStart),
      endDate: currentEnd,
      days: Math.round(days * 10) / 10,
    });
    currentStart = currentEnd;
  }
  return periods;
}

export function calculateKundali(
  name: string,
  birthDate: Date,
  birthTime: string,
  birthPlace: string = 'उज्जैन',
  latitude: number = 23.1765,
  longitude: number = 75.7885,
  timezoneHours: number = 5.5
): KundaliData {
  const { hours, minutes, seconds } = parseTimeString(birthTime);
  const y = birthDate.getFullYear();
  const m = birthDate.getMonth();
  const d = birthDate.getDate();

  // UTC moment of birth
  const utcMs = Date.UTC(y, m, d, hours, minutes, seconds) - timezoneHours * 3600000;
  const birthMoment = new Date(utcMs);

  const planets = calculatePlanetPositions(birthMoment, latitude, longitude, timezoneHours);
  const lagnaDegree = calculateLagnaDegree(birthMoment, latitude, longitude, timezoneHours);
  const lagnaRashiIdx = Math.floor(lagnaDegree / 30) % 12;

  const moon = planets.find((p) => p.planet === 'चंद्र') || planets[1];
  const sun = planets.find((p) => p.planet === 'सूर्य') || planets[0];

  const moonRashiIdx = Math.floor(moon.degree / 30) % 12;
  const nakSpan = 360 / 27;
  const nakIdx = Math.floor(moon.degree / nakSpan) % 27;
  const pada = Math.floor((moon.degree % nakSpan) / (nakSpan / 4)) + 1;

  const varna = getVarna(moonRashiIdx);
  const vashya = RASHI_VASHYAS[moonRashiIdx] || 'मानव';
  const gana = NAKSHATRA_GANAS[nakIdx] || 'देव';
  const yoni = NAKSHATRA_YONIS[nakIdx] || 'अश्व';
  const nadi = NAKSHATRA_NADIS[nakIdx] || 'मध्य';

  // Vimshottari Mahadasha balance
  const lordCycle = DASHA_ORDER;
  const firstDashaLord = lordCycle[nakIdx % 9];
  const dashaIndex = DASHA_ORDER.indexOf(firstDashaLord);
  const nakProgress = (moon.degree % nakSpan) / nakSpan;
  const remainingFraction = 1 - nakProgress;
  const firstDashaYears = (DASHA_YEARS[firstDashaLord] || 7) * remainingFraction;

  const dashaPeriods: DashaPeriod[] = [];
  let dashaPointer = new Date(birthMoment);
  const now = new Date();

  for (let i = 0; i < 9; i++) {
    const planet = DASHA_ORDER[(dashaIndex + i) % 9];
    const durationYears = i === 0 ? firstDashaYears : DASHA_YEARS[planet] || 7;
    const endMs = dashaPointer.getTime() + durationYears * 365.25 * 86400000;
    const endDate = new Date(endMs);

    dashaPeriods.push({
      planet,
      startDate: new Date(dashaPointer),
      endDate,
      years: durationYears,
    });
    dashaPointer = endDate;
  }

  // Antardashas
  const antarPeriods: AntarDashaPeriod[] = [];
  for (const dp of dashaPeriods) {
    const mahaYears = DASHA_YEARS[dp.planet] || 7;
    const mahaIdx = DASHA_ORDER.indexOf(dp.planet);
    let antarPointer = new Date(dp.startDate);

    for (let j = 0; j < 9; j++) {
      const antarPlanet = DASHA_ORDER[(mahaIdx + j) % 9];
      const fraction = (DASHA_YEARS[antarPlanet] || 7) / 120.0;
      const antarYears = mahaYears * fraction;
      const endMs = j === 8 ? dp.endDate.getTime() : antarPointer.getTime() + antarYears * 365.25 * 86400000;
      const endAntar = new Date(endMs);

      antarPeriods.push({
        maha: dp.planet,
        antar: antarPlanet,
        startDate: new Date(antarPointer),
        endDate: endAntar,
        years: antarYears,
      });
      antarPointer = endAntar;
    }
  }

  const currentMaha = dashaPeriods.find((d) => now >= d.startDate && now < d.endDate) || dashaPeriods[0];
  const currentAntar =
    antarPeriods.find((a) => a.maha === currentMaha.planet && now >= a.startDate && now < a.endDate) ||
    antarPeriods[0];
  const pratyantars = calculatePratyantarPeriods(
    currentMaha.planet,
    currentAntar.antar,
    currentAntar.startDate,
    currentAntar.endDate
  );
  const currentPratyantar =
    pratyantars.find((p) => now >= p.startDate && now < p.endDate) || pratyantars[0];

  return {
    name,
    birthDate,
    birthTime,
    birthPlace,
    latitude,
    longitude,
    timezoneHours,
    lagnaDegree,
    lagnaRashi: RASHIS[lagnaRashiIdx],
    lagnaRashiNumber: lagnaRashiIdx + 1,
    moonRashi: RASHIS[moonRashiIdx],
    sunRashi: RASHIS[Math.floor(sun.degree / 30) % 12],
    nakshatra: NAKSHATRAS[nakIdx],
    charan: `${pada}`,
    nadi,
    gana,
    yoni,
    varna,
    vashya,
    mahadasha: currentMaha.planet,
    antardasha: currentAntar.antar,
    pratyantardasha: currentPratyantar.pratyantar,
    planets,
    dashaPeriods,
    antarPeriods,
    pratyantarPeriods: pratyantars,
    calculatedAt: new Date(),
  };
}

export function checkManglik(kundali: KundaliData): { isManglik: boolean; houses: number[]; note: string } {
  const mars = kundali.planets.find((p) => p.planet === 'मंगल');
  if (!mars) return { isManglik: false, houses: [], note: 'मंगल स्थिति सामान्य' };

  const manglikHouses = [1, 4, 7, 8, 12];
  const lagnaHouse = mars.house;
  const isLagnaManglik = manglikHouses.includes(lagnaHouse);

  const moon = kundali.planets.find((p) => p.planet === 'चंद्र');
  const moonMarsHouse = moon ? ((mars.rashiNumber - moon.rashiNumber + 12) % 12) + 1 : 1;
  const isMoonManglik = manglikHouses.includes(moonMarsHouse);

  const houses: number[] = [];
  if (isLagnaManglik) houses.push(lagnaHouse);
  if (isMoonManglik && !houses.includes(moonMarsHouse)) houses.push(moonMarsHouse);

  const isManglik = isLagnaManglik || isMoonManglik;
  let note = '';
  if (isManglik) {
    note = `लग्न/चंद्र से ${houses.join(', ')} भाव में मंगल स्थित होने से मांगलिक योग।`;
  } else {
    note = 'मांगलिक दोष रहित कुंडली।';
  }

  return { isManglik, houses, note };
}

export function calculateAshtakootMilan(boy: KundaliData, girl: KundaliData) {
  const boyMoonIdx = RASHIS.indexOf(boy.moonRashi);
  const girlMoonIdx = RASHIS.indexOf(girl.moonRashi);
  const boyNakIdx = NAKSHATRAS.indexOf(boy.nakshatra);
  const girlNakIdx = NAKSHATRAS.indexOf(girl.nakshatra);

  const items: AshtakootItem[] = [];

  // 1. Varna (1 Point)
  const varnas = ['ब्राह्मण', 'क्षत्रिय', 'वैश्य', 'शूद्र'];
  const boyVarnaIdx = varnas.indexOf(boy.varna);
  const girlVarnaIdx = varnas.indexOf(girl.varna);
  const varnaScore = boyVarnaIdx <= girlVarnaIdx ? 1 : 0;
  items.push({
    name: 'वर्ण (Varna)',
    score: varnaScore,
    max: 1,
    note: varnaScore === 1 ? 'अनुकूल वर्ण सामंजस्य' : 'वर्ण भिन्नता',
    boyValue: boy.varna,
    girlValue: girl.varna,
  });

  // 2. Vashya (2 Points)
  const vashyaScore = boy.vashya === girl.vashya ? 2 : boyMoonIdx % 2 === girlMoonIdx % 2 ? 1 : 0.5;
  items.push({
    name: 'वश्य (Vashya)',
    score: vashyaScore,
    max: 2,
    note: vashyaScore >= 1 ? 'पारस्परिक आकर्षण व नियंत्रण' : 'मध्यम वश्य प्रभाव',
    boyValue: boy.vashya,
    girlValue: girl.vashya,
  });

  // 3. Tara (3 Points)
  const taraBoyToGirl = ((girlNakIdx - boyNakIdx + 27) % 9) + 1;
  const taraGirlToBoy = ((boyNakIdx - girlNakIdx + 27) % 9) + 1;
  const inauspiciousTara = [3, 5, 7];
  let taraScore = 3;
  if (inauspiciousTara.includes(taraBoyToGirl) && inauspiciousTara.includes(taraGirlToBoy)) {
    taraScore = 0;
  } else if (inauspiciousTara.includes(taraBoyToGirl) || inauspiciousTara.includes(taraGirlToBoy)) {
    taraScore = 1.5;
  }
  items.push({
    name: 'तारा (Tara)',
    score: taraScore,
    max: 3,
    note: taraScore >= 2 ? 'दीर्घायु व भाग्य वृद्धि' : 'सामान्य तारा शुद्धि',
    boyValue: `तारा ${taraBoyToGirl}`,
    girlValue: `तारा ${taraGirlToBoy}`,
  });

  // 4. Yoni (4 Points)
  const yoniScore = boy.yoni === girl.yoni ? 4 : 2;
  items.push({
    name: 'योनि (Yoni)',
    score: yoniScore,
    max: 4,
    note: yoniScore === 4 ? 'उत्तम शारीरिक व मानसिक सामंजस्य' : 'मित्र योनि मिलन',
    boyValue: boy.yoni,
    girlValue: girl.yoni,
  });

  // 5. Graha Maitri (5 Points)
  const RASHI_LORDS = [
    'मंगल', 'शुक्र', 'बुध', 'चंद्र', 'सूर्य', 'बुध',
    'शुक्र', 'मंगल', 'गुरु', 'शनि', 'शनि', 'गुरु'
  ];
  const boyLord = RASHI_LORDS[boyMoonIdx];
  const girlLord = RASHI_LORDS[girlMoonIdx];
  const grahaMaitriScore = boyLord === girlLord ? 5 : boyMoonIdx % 4 === girlMoonIdx % 4 ? 4 : 3;
  items.push({
    name: 'ग्रह मैत्री (Graha Maitri)',
    score: grahaMaitriScore,
    max: 5,
    note: grahaMaitriScore >= 4 ? 'राशि स्वामियों में उत्तम मित्रता' : 'सामान्य ग्रह मैत्री',
    boyValue: boyLord,
    girlValue: girlLord,
  });

  // 6. Gana (6 Points)
  let ganaScore = 6;
  if (boy.gana === girl.gana) {
    ganaScore = 6;
  } else if (
    (boy.gana === 'देव' && girl.gana === 'मनुष्य') ||
    (boy.gana === 'मनुष्य' && girl.gana === 'देव')
  ) {
    ganaScore = 5;
  } else if (boy.gana === 'राक्षस' || girl.gana === 'राक्षस') {
    ganaScore = 1;
  }
  items.push({
    name: 'गण (Gana)',
    score: ganaScore,
    max: 6,
    note: ganaScore >= 5 ? 'समान स्वभाव व विचार' : 'गण भेद परिहार विचारणीय',
    boyValue: boy.gana,
    girlValue: girl.gana,
  });

  // 7. Bhakoot (7 Points)
  const diffRashi = ((girlMoonIdx - boyMoonIdx + 12) % 12) + 1;
  const isBhakootDosha = [2, 6, 8, 12].includes(diffRashi);
  const bhakootScore = isBhakootDosha ? 0 : 7;
  items.push({
    name: 'भकूट (Bhakoot)',
    score: bhakootScore,
    max: 7,
    note: bhakootScore === 7 ? 'शुभ राशि संबंध, वंश व स्वास्थ्य वृद्धि' : 'षडाष्टक/द्विर्द्वादश भकूट दोष',
    boyValue: boy.moonRashi,
    girlValue: girl.moonRashi,
  });

  // 8. Nadi (8 Points)
  const isNadiDosha = boy.nadi === girl.nadi;
  const nadiScore = isNadiDosha ? 0 : 8;
  items.push({
    name: 'नाड़ी (Nadi)',
    score: nadiScore,
    max: 8,
    note: nadiScore === 8 ? 'निर्दोष नाड़ी, उत्तम संतति सुख' : 'समान नाड़ी दोष (परिहार अपेक्षित)',
    boyValue: boy.nadi,
    girlValue: girl.nadi,
  });

  const totalScore = items.reduce((sum, item) => sum + item.score, 0);

  let verdict = 'उत्कृष्ट मिलान';
  let verdictGrade: 'excellent' | 'good' | 'average' | 'poor' = 'excellent';
  if (totalScore >= 28) {
    verdict = 'अति उत्तम मिलान (28-36 गुण)';
    verdictGrade = 'excellent';
  } else if (totalScore >= 21) {
    verdict = 'शुभ एवं प्रशस्त मिलान (21-27 गुण)';
    verdictGrade = 'good';
  } else if (totalScore >= 18) {
    verdict = 'मध्यम मिलान — विवाह योग्य (18-20 गुण)';
    verdictGrade = 'average';
  } else {
    verdict = 'अस्वीकार्य / दोषयुक्त मिलान (18 से कम गुण)';
    verdictGrade = 'poor';
  }

  const boyManglik = checkManglik(boy);
  const girlManglik = checkManglik(girl);

  let isManglikCancelled = false;
  let cancellationReason = '';
  let manglikVerdict = '';

  if (boyManglik.isManglik && girlManglik.isManglik) {
    isManglikCancelled = true;
    cancellationReason = 'दोनों कुण्डलियाँ मांगलिक होने से शास्त्रानुसार "कुज-दोष साम्य" (दोष परिहार) हो गया है। विवाह शास्त्रसम्मत है।';
    manglikVerdict = 'दोष परिहार (कुज दोष साम्य)';
  } else if (!boyManglik.isManglik && !girlManglik.isManglik) {
    isManglikCancelled = true;
    cancellationReason = 'दोनों पक्ष मांगलिक दोष से मुक्त हैं।';
    manglikVerdict = 'मांगलिक दोष रहित';
  } else {
    isManglikCancelled = false;
    manglikVerdict = boyManglik.isManglik ? 'वर मांगलिक (कन्या अमंगलीय)' : 'कन्या मांगलिक (वर अमंगलीय)';
    cancellationReason = 'एक पक्ष मांगलिक होने पर गुरु की दृष्टि अथवा कुम्भ-विवाह / अर्क-विवाह एवं महामृत्युंजय जप द्वारा परिहार किया जा सकता है।';
  }

  let nadiRemedy = '';
  if (isNadiDosha) {
    if (boy.moonRashi !== girl.moonRashi || boy.charan !== girl.charan) {
      nadiRemedy = 'यद्यपि समान नाड़ी है, किन्तु वर-कन्या के नक्षत्र चरण या चंद्र राशि में भेद होने से नाड़ी दोष में शास्त्रीय परिहार प्राप्त होता है।';
    } else {
      nadiRemedy = 'एक ही नाड़ी व एक ही चरण होने से पूर्ण नाड़ी दोष। विवाह पूर्व विद्वान ब्राह्मण द्वारा नाड़ी दोष शांति व महामृत्युंजय जप आवश्यक है।';
    }
  }

  let bhakootRelation = '';
  let bhakootRemedy = '';
  if (isBhakootDosha) {
    if (diffRashi === 6 || diffRashi === 8) bhakootRelation = 'षडाष्टक (6-8) संबंध';
    else if (diffRashi === 2 || diffRashi === 12) bhakootRelation = 'द्विर्द्वादश (2-12) संबंध';
    else if (diffRashi === 9 || diffRashi === 5) bhakootRelation = 'नवपंचम (9-5) संबंध';

    if (boyLord === girlLord) {
      bhakootRemedy = 'दोनों राशियों के स्वामी एक ही ग्रह होने से भकूट दोष का स्वतः परिहार हो जाता है।';
    } else {
      bhakootRemedy = `${bhakootRelation} होने से भकूट दोष। राशि स्वामियों की मित्रता अथवा दान-शांति द्वारा परिहार विचारणीय है।`;
    }
  }

  const recommendations: string[] = [];
  if (isNadiDosha) recommendations.push(nadiRemedy);
  if (isBhakootDosha) recommendations.push(bhakootRemedy);
  if (!isManglikCancelled) recommendations.push(cancellationReason);
  if (totalScore >= 18) recommendations.push('36 में से 18 से अधिक गुण प्राप्त होने से वैवाहिक संबंध अनुकूल माना जाता है।');

  const manglikAnalysis = {
    isBoyManglik: boyManglik.isManglik,
    boyManglikHouses: boyManglik.houses,
    boyNote: boyManglik.note,
    isGirlManglik: girlManglik.isManglik,
    girlManglikHouses: girlManglik.houses,
    girlNote: girlManglik.note,
    isCancelled: isManglikCancelled,
    cancellationReason,
    verdict: manglikVerdict,
  };

  return {
    items,
    totalScore,
    maxScore: 36,
    verdict,
    verdictGrade,
    recommendations,
    manglikAnalysis,
    nadiDosha: {
      hasDosha: isNadiDosha,
      boyNadi: boy.nadi,
      girlNadi: girl.nadi,
      remedy: nadiRemedy,
    },
    bhakootDosha: {
      hasDosha: isBhakootDosha,
      diffHouses: diffRashi,
      relationType: bhakootRelation,
      remedy: bhakootRemedy,
    },
  };
}

export function generatePrashnaKundali(
  question: string,
  latitude: number = 23.1765,
  longitude: number = 75.7885
): KundaliData {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', { hour12: false });
  const title = question ? `प्रश्न: ${question}` : 'प्रश्न चक्र';
  return calculateKundali(title, now, timeStr, 'तात्कालिक स्थान', latitude, longitude, 5.5);
}

export const VEDIC_REMEDIES_BY_RASHI: Record<
  string,
  {
    gemstone: string;
    devata: string;
    color: string;
    mantra: string;
    remedies: string[];
  }
> = {
  मेष: {
    gemstone: 'मूंगा (Red Coral)',
    devata: 'भगवान श्री हनुमान जी',
    color: 'लाल एवं सिंदूरी (Red)',
    mantra: 'ॐ क्रां क्रीं क्रौं सः भौमाय नमः',
    remedies: [
      'मंगलवार को हनुमान चालीसा पढ़ें।',
      'तांबे के बर्तन में जल पिएं और लाल पुष्प अर्पित करें।',
      'मसूर दाल एवं गुड़ का दान करें।',
    ],
  },
  वृषभ: {
    gemstone: 'हीरा अथवा ओपल (Diamond / Opal)',
    devata: 'भगवती महालक्ष्मी जी',
    color: 'श्वेत एवं चमकीला',
    mantra: 'ॐ द्रां द्रीं द्रौं सः शुक्राय नमः',
    remedies: [
      'शुक्रवार को श्री सूक्त या कनकधारा स्तोत्र का पाठ करें।',
      'सफेद चंदन, मिश्री अथवा खीर का दान करें।',
      'गौमाता की सेवा करें एवं उन्हें हरा चारा खिलाएं।',
    ],
  },
  मिथुन: {
    gemstone: 'पन्ना (Emerald)',
    devata: 'भगवान श्री गणेश जी',
    color: 'हरा (Green)',
    mantra: 'ॐ ब्रां ब्रीं ब्रौं सः बुधाय नमः',
    remedies: [
      'बुधवार को गणेश जी को 21 दूर्वा दल अर्पित करें।',
      'मूंग दाल या हरी सब्जियों का दान करें।',
      'तुलसी के पौधे में नित्य जल अर्पित करें।',
    ],
  },
  कर्क: {
    gemstone: 'मोती (Pearl)',
    devata: 'देवाधिदेव महादेव शिव',
    color: 'दूधिया सफेद (Milk White)',
    mantra: 'ॐ श्रां श्रीं श्रौं सः चंद्रमसे नमः',
    remedies: [
      'सोमवार को शिवलिंग पर कच्चा दूध एवं जल से अभिषेक करें।',
      'पूर्णिमा के दिन चंद्र दर्शन एवं अर्घ्य दें।',
      'माता जी का चरण स्पर्श कर आशीर्वाद लें।',
    ],
  },
  सिंह: {
    gemstone: 'माणिक्य (Ruby)',
    devata: 'भगवान भुवन भास्कर सूर्य नारायण',
    color: 'केसरिया एवं सुनहरा (Gold/Orange)',
    mantra: 'ॐ ह्रां ह्रीं ह्रौं सः सूर्याय नमः',
    remedies: [
      'प्रातःकाल तांबे के लोटे में जल, रोली व अक्षत डालकर सूर्य को अर्घ्य दें।',
      'आदित्य हृदय स्तोत्र का नित्य पाठ करें।',
      'पिता का सम्मान करें एवं गेहूं-गुड़ का दान करें।',
    ],
  },
  कन्या: {
    gemstone: 'पन्ना (Emerald)',
    devata: 'भगवान श्री विष्णु एवं गणेश जी',
    color: 'हरा व हल्का पीला',
    mantra: 'ॐ बुं बुधाय नमः',
    remedies: [
      'बुधवार को गणेश अथर्वशीर्ष का पाठ करें।',
      'पक्षी को दाना डालें और गाय को हरा चारा खिलाएं।',
      'विष्णु सहस्रनाम का श्रवण या पाठ करें।',
    ],
  },
  तुला: {
    gemstone: 'हीरा अथवा ओपल (Diamond / Opal)',
    devata: 'माता दुर्गा एवं महालक्ष्मी',
    color: 'सफेद, गुलाबी व क्रीम',
    mantra: 'ॐ शुं शुक्राय नमः',
    remedies: [
      'शुक्रवार को कन्याओं को मीठा भोजन अथवा फल दान करें।',
      'सुगंधित इत्र एवं चंदन का प्रयोग करें।',
      'दुर्गा सप्तशती का अर्गला स्तोत्र पाठ करें।',
    ],
  },
  वृश्चिक: {
    gemstone: 'मूंगा (Red Coral)',
    devata: 'श्री कार्तिकेय एवं हनुमान जी',
    color: 'गहरा लाल व नारंगी',
    mantra: 'ॐ अं अंगारकाय नमः',
    remedies: [
      'मंगलवार को हनुमान जी को सिंदूर व चमेली का तेल अर्पित करें।',
      'ऋणमोचक मंगल स्तोत्र का पाठ करें।',
      'छोटे भाइयों का सहयोग करें।',
    ],
  },
  धनु: {
    gemstone: 'पुखराज (Yellow Sapphire)',
    devata: 'भगवान श्री हरि विष्णु',
    color: 'पीला (Yellow)',
    mantra: 'ॐ ग्रां ग्रीं ग्रौं सः गुरवे नमः',
    remedies: [
      'गुरुवार को चने की दाल, बेसन के लड्डू व हल्दी का दान करें।',
      'केले के वृक्ष की जड़ में जल अर्पित करें व दीपक जलाएं।',
      'गुरुजनों एवं ब्राह्मणों का आदर-सत्कार करें।',
    ],
  },
  मकर: {
    gemstone: 'नीलम (Blue Sapphire) अथवा जमुनिया',
    devata: 'भगवान शनिदेव एवं शिव जी',
    color: 'नीला एवं काला',
    mantra: 'ॐ प्रां प्रीं प्रौं सः शनैश्चराय नमः',
    remedies: [
      'शनिवार को पीपल के वृक्ष के नीचे सरसों के तेल का दीपक जलाएं।',
      'शनि चालीसा या दशरथकृत शनि स्तोत्र का पाठ करें।',
      'काले तिल, उड़द दाल अथवा कंबल का दान करें।',
    ],
  },
  कुंभ: {
    gemstone: 'नीलम (Blue Sapphire) अथवा कटैला',
    devata: 'भगवान रुद्र एवं शनिदेव',
    color: 'आसमानी व गहरा नीला',
    mantra: 'ॐ शं शनैश्चराय नमः',
    remedies: [
      'शनिवार को छाया दान (कटोरी में तेल लेकर अपना चेहरा देखकर दान) करें।',
      'हनुमान बाहुक का पाठ करें।',
      'श्रमिकों और जरूरतमंदों की सेवा करें।',
    ],
  },
  मीन: {
    gemstone: 'पुखराज (Yellow Sapphire)',
    devata: 'भगवान श्री नारायण एवं दत्तात्रेय',
    color: 'हल्दी पीला एवं केसरिया',
    mantra: 'ॐ बृं बृहस्पतये नमः',
    remedies: [
      'गुरुवार को सत्यनारायण कथा अथवा विष्णु सहस्रनाम पाठ करें।',
      'केसर का तिलक लगाएं और सोने के आभूषण धारण करें।',
      'विद्यार्थियों को पुस्तकें या अध्ययन सामग्री भेंट करें।',
    ],
  },
};

export function getVedicRemedies(kundali: KundaliData) {
  const rashi = kundali.moonRashi || 'मेष';
  const data = VEDIC_REMEDIES_BY_RASHI[rashi] || VEDIC_REMEDIES_BY_RASHI['मेष'];
  return {
    luckyGemstone: data.gemstone,
    ishtaDevata: data.devata,
    luckyColor: data.color,
    mantra: data.mantra,
    remedies: data.remedies,
  };
}
