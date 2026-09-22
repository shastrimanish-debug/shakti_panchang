import { PlanetPosition } from '../types';
import { RASHIS, calculateVargaSign } from './astronomy';

export const SIGN_LORDS_ARRAY = [
  'मंगल', // मेष (0)
  'शुक्र', // वृषभ (1)
  'बुध',   // मिथुन (2)
  'चंद्र', // कर्क (3)
  'सूर्य', // सिंह (4)
  'बुध',   // कन्या (5)
  'शुक्र', // तुला (6)
  'मंगल', // वृश्चिक (7)
  'गुरु',  // धनु (8)
  'शनि',  // मकर (9)
  'शनि',  // कुंभ (10)
  'गुरु',  // मीन (11)
];

export const EXALTATION_INDEX: Record<string, number> = {
  सूर्य: 0,   // मेष
  चंद्र: 1,   // वृषभ
  मंगल: 9,   // मकर
  बुध: 5,    // कन्या
  गुरु: 3,   // कर्क
  शुक्र: 11, // मीन
  शनि: 6,    // तुला
  राहु: 1,   // वृषभ / मिथुन
  केतु: 7,   // वृश्चिक / धनु
};

export const DEBILITATION_INDEX: Record<string, number> = {
  सूर्य: 6,   // तुला
  चंद्र: 7,   // वृश्चिक
  मंगल: 3,   // कर्क
  बुध: 11,   // मीन
  गुरु: 9,   // मकर
  शुक्र: 5,   // कन्या
  शनि: 0,    // मेष
  राहु: 7,   // वृश्चिक
  केतु: 1,   // वृषभ
};

export const OWN_SIGNS_INDICES: Record<string, number[]> = {
  सूर्य: [4],
  चंद्र: [3],
  मंगल: [0, 7],
  बुध: [2, 5],
  गुरु: [8, 11],
  शुक्र: [1, 6],
  शनि: [9, 10],
  राहु: [10],
  केतु: [7],
};

export interface VargaPlanetItem {
  planet: string;
  englishName: string;
  rashiIndex: number;
  rashi: string;
  house: number; // 1 to 12 in this varga
  dignity: 'उच्च' | 'नीच' | 'स्वराशि' | 'मित्र' | 'सम' | 'शत्रु';
  isVargottama: boolean;
}

export interface VargaChartData {
  vargaDivision: number;
  vargaCode: string;
  vargaName: string;
  significance: string;
  lagnaRashiIndex: number;
  lagnaRashi: string;
  lagnaLord: string;
  planets: VargaPlanetItem[];
  houses: {
    house: number;
    rashiIndex: number;
    rashi: string;
    lord: string;
    occupants: string[];
  }[];
}

/**
 * Calculates complete positional details for all planets and houses in any Varga (D1 to D60)
 */
export function getVargaChartData(
  lagnaDegree: number,
  planets: PlanetPosition[],
  vargaDiv: number,
  vargaCode = `D${vargaDiv}`,
  vargaName = `D${vargaDiv} वर्गीय चक्र`,
  significance = 'वर्गीय सूक्ष्म फल'
): VargaChartData {
  const lagnaRashiIndex = calculateVargaSign(lagnaDegree, vargaDiv);
  const lagnaRashi = RASHIS[lagnaRashiIndex];
  const lagnaLord = SIGN_LORDS_ARRAY[lagnaRashiIndex];

  // Map planets
  const vargaPlanets: VargaPlanetItem[] = planets.map((p) => {
    const vSign = calculateVargaSign(p.degree, vargaDiv);
    const house = ((vSign - lagnaRashiIndex + 12) % 12) + 1;
    const d1Sign = Math.floor((p.degree % 360) / 30);
    const isVargottama = vSign === d1Sign;

    let dignity: 'उच्च' | 'नीच' | 'स्वराशि' | 'मित्र' | 'सम' | 'शत्रु' = 'सम';
    if (EXALTATION_INDEX[p.planet] === vSign) {
      dignity = 'उच्च';
    } else if (DEBILITATION_INDEX[p.planet] === vSign) {
      dignity = 'नीच';
    } else if (OWN_SIGNS_INDICES[p.planet]?.includes(vSign)) {
      dignity = 'स्वराशि';
    } else {
      const signLord = SIGN_LORDS_ARRAY[vSign];
      if (['गुरु', 'शुक्र', 'बुध', 'चंद्र'].includes(signLord)) {
        dignity = 'मित्र';
      } else {
        dignity = 'सम';
      }
    }

    return {
      planet: p.planet,
      englishName: p.englishName,
      rashiIndex: vSign,
      rashi: RASHIS[vSign],
      house,
      dignity,
      isVargottama,
    };
  });

  // Construct 12 houses
  const houses = Array.from({ length: 12 }, (_, i) => {
    const h = i + 1;
    const rIndex = (lagnaRashiIndex + i) % 12;
    const occupants = vargaPlanets.filter((p) => p.house === h).map((p) => p.planet);
    return {
      house: h,
      rashiIndex: rIndex,
      rashi: RASHIS[rIndex],
      lord: SIGN_LORDS_ARRAY[rIndex],
      occupants,
    };
  });

  return {
    vargaDivision: vargaDiv,
    vargaCode,
    vargaName,
    significance,
    lagnaRashiIndex,
    lagnaRashi,
    lagnaLord,
    planets: vargaPlanets,
    houses,
  };
}

// -------------------------------------------------------------
// 1. D10 DASHAMSHA (दशमांश - करियर, आजीविका व पद-प्रतिष्ठा)
// -------------------------------------------------------------
export interface D10CareerAnalysis {
  chart: VargaChartData;
  lagnaLordPlacement: string;
  tenthHouseLord: string;
  tenthHouseLordPlacement: string;
  tenthHouseOccupants: string[];
  kendraPlanets: string[];
  trikonaPlanets: string[];
  sunStatus: string;
  saturnStatus: string;
  careerFields: {
    title: string;
    suitability: 'सर्वोत्तम (Excellent)' | 'अनुकूल (Good)' | 'सामान्य (Moderate)';
    reason: string;
  }[];
  verdict: string;
  careerRemedies: string[];
}

export function analyzeD10Dashamsha(lagnaDegree: number, planets: PlanetPosition[]): D10CareerAnalysis {
  const chart = getVargaChartData(
    lagnaDegree,
    planets,
    10,
    'D10',
    'दशमांश चक्र (Dashamsha Chart)',
    'आजीविका, कार्यक्षेत्र, पद-प्रतिष्ठा, व्यवसाय, यश व करियर उत्थान'
  );

  const lagnaLord = chart.lagnaLord;
  const lagnaLordPlanet = chart.planets.find((p) => p.planet === lagnaLord);
  const lagnaLordHouse = lagnaLordPlanet?.house || 1;
  const lagnaLordPlacement = `दशमांश लग्नेश (${lagnaLord}) भाव ${lagnaLordHouse} (${lagnaLordPlanet?.rashi || ''}) में स्थित है।`;

  const tenthHouse = chart.houses[9]; // 10th house
  const tenthLord = tenthHouse.lord;
  const tenthLordPlanet = chart.planets.find((p) => p.planet === tenthLord);
  const tenthLordHouse = tenthLordPlanet?.house || 10;
  const tenthHouseLordPlacement = `दशमेश (${tenthLord}) दशमांश के भाव ${tenthLordHouse} (${tenthLordPlanet?.rashi || ''}) में स्थित है।`;

  const tenthHouseOccupants = tenthHouse.occupants;
  const kendraPlanets = chart.planets.filter((p) => [1, 4, 7, 10].includes(p.house)).map((p) => p.planet);
  const trikonaPlanets = chart.planets.filter((p) => [1, 5, 9].includes(p.house)).map((p) => p.planet);

  // Sun & Saturn analysis
  const sunP = chart.planets.find((p) => p.planet === 'सूर्य');
  const satP = chart.planets.find((p) => p.planet === 'शनि');
  const jupP = chart.planets.find((p) => p.planet === 'गुरु');
  const mercP = chart.planets.find((p) => p.planet === 'बुध');
  const marsP = chart.planets.find((p) => p.planet === 'मंगल');

  const sunStatus = sunP
    ? `सूर्य भाव ${sunP.house} (${sunP.rashi}) में ${sunP.dignity} है। ${
        [1, 10].includes(sunP.house) || sunP.dignity === 'उच्च' || sunP.dignity === 'स्वराशि'
          ? 'राजकीय प्रतिष्ठा, नेतृत्व व प्रशासनिक पदों में विशेष सफलता योग।'
          : 'मध्यम राजकीय प्रभाव, स्वावलंबन से सफलता।'
      }`
    : 'सूर्य सामान्य';

  const saturnStatus = satP
    ? `शनि भाव ${satP.house} (${satP.rashi}) में ${satP.dignity} है। ${
        [10, 11, 3, 6].includes(satP.house) || satP.dignity === 'उच्च' || satP.dignity === 'स्वराशि'
          ? 'दीर्घकालिक परिश्रम, संगठन क्षमता, जनता से जुड़े कार्य व उद्योग में दृढ़ सफलता।'
          : 'करियर में धैर्य एवं निरंतर निष्ठा अपेक्षित।'
      }`
    : 'शनि सामान्य';

  // Determine Career Archetypes
  const fields: D10CareerAnalysis['careerFields'] = [];

  // 1. Administrative / Govt / Leadership
  const hasGovt =
    (sunP && ([1, 10].includes(sunP.house) || sunP.dignity === 'उच्च' || sunP.dignity === 'स्वराशि')) ||
    (tenthLord === 'सूर्य' || tenthLord === 'गुरु' || tenthHouseOccupants.includes('सूर्य'));
  fields.push({
    title: 'प्रशासनिक सेवा, राजकाज व प्रबंधन (Govt & Leadership)',
    suitability: hasGovt ? 'सर्वोत्तम (Excellent)' : 'सामान्य (Moderate)',
    reason: hasGovt
      ? 'दशमांश में सूर्य/गुरु का प्रभाव प्रशासनिक अधिकार, उच्च प्रबंधन व राजकीय प्रतिष्ठा का निर्माण करता है।'
      : 'प्रशासनिक क्षेत्रों में प्रवेश हेतु विशेष प्रयास की आवश्यकता रहेगी।',
  });

  // 2. Technical, Engineering & IT
  const hasTech =
    (marsP && [1, 10, 3, 6].includes(marsP.house)) ||
    (satP && [10, 11].includes(satP.house)) ||
    (mercP && [1, 5, 10].includes(mercP.house));
  fields.push({
    title: 'अभियांत्रिकी, आईटी, सॉफ्टवेयर व तकनीकी क्षेत्र (Tech & Engineering)',
    suitability: hasTech ? 'सर्वोत्तम (Excellent)' : 'अनुकूल (Good)',
    reason: hasTech
      ? 'मंगल, बुध या शनि की दशमांश में केंद्र/त्रिकोण स्थिति तकनीकी कौशल, प्रोग्रामिंग, निर्माण व नवाचार के लिए अति उत्तम है।'
      : 'सामान्य तकनीकी समझ, प्रबंधन के साथ समन्वय से लाभ।',
  });

  // 3. Finance, Banking, Commerce & Business
  const hasBiz =
    (mercP && ([1, 2, 10, 11].includes(mercP.house) || mercP.dignity === 'उच्च' || mercP.dignity === 'स्वराशि')) ||
    (jupP && [2, 5, 9, 11].includes(jupP.house)) ||
    chart.houses[1].occupants.length > 0;
  fields.push({
    title: 'वाणिज्य, बैंकिंग, वित्त व स्वतंत्र व्यापार (Commerce & Finance)',
    suitability: hasBiz ? 'सर्वोत्तम (Excellent)' : 'अनुकूल (Good)',
    reason: hasBiz
      ? 'बुध व गुरु की अनुकूल स्थिति वित्तीय विश्लेषण, बैंकिंग, निवेश, शेयर बाजार व व्यापार में निरंतर धन लाभ कराती है।'
      : 'व्यापार में अनुभवी साझेदार का सहयोग हितकर रहेगा।',
  });

  // 4. Education, Advisory, Law & Judiciary
  const hasAdvisory =
    (jupP && ([1, 4, 5, 9, 10].includes(jupP.house) || jupP.dignity === 'उच्च' || jupP.dignity === 'स्वराशि')) ||
    tenthHouseOccupants.includes('गुरु');
  fields.push({
    title: 'शिक्षा, परामर्श, विधि, न्याय व धर्म (Education & Legal)',
    suitability: hasAdvisory ? 'सर्वोत्तम (Excellent)' : 'सामान्य (Moderate)',
    reason: hasAdvisory
      ? 'गुरु की दशमांश में गरिमापूर्ण उपस्थिति जातक को समाज में प्रतिष्ठित मार्गदर्शक, शिक्षक, अधिवक्ता या न्यायाधीश बनाती है।'
      : 'बौद्धिक कार्यों में निरंतर स्वाध्याय से उन्नति होगी।',
  });

  // Verdict
  let verdict = 'दशमांश चक्र संतुलित एवं अनुकूल है। स्वप्रयास एवं योजनाबद्ध कर्म से करियर में सतत प्रगति होगी।';
  if (kendraPlanets.length >= 3) {
    verdict = 'दशमांश चक्र में केंद्र बलवान होने से जातक का कर्मक्षेत्र प्रभावशाली रहेगा और समाज में कीर्ति व स्थिरता प्राप्त होगी।';
  } else if (tenthLordHouse === 10 || tenthLordHouse === 1 || tenthLordHouse === 11) {
    verdict = 'दशमेश की अत्यंत शुभ स्थिति होने से करियर में स्वतः उत्थान, मान-सम्मान एवं नेतृत्वकारी पद प्राप्त होंगे।';
  }

  const careerRemedies = [
    'दशमांश को बलवान करने हेतु नित्य प्रातः सूर्य देव को तांबे के लोटे से जल व कुमकुम मिश्रित अर्घ्य दें।',
    'कार्यस्थल पर सफलता व एकाग्रता हेतु गायत्री मंत्र अथवा अपने इष्ट मंत्र का 108 बार जप करें।',
    'दशमेश अनुकूलता के लिए गुरुवार को केसर तिलक लगाएं एवं शनिवार को दीपदान करें।',
    'प्रतिष्ठान व कार्यक्षेत्र में ईशान कोण (उत्तर-पूर्व) को सदा स्वच्छ व प्रकाशमान रखें।',
  ];

  return {
    chart,
    lagnaLordPlacement,
    tenthHouseLord: tenthLord,
    tenthHouseLordPlacement,
    tenthHouseOccupants,
    kendraPlanets,
    trikonaPlanets,
    sunStatus,
    saturnStatus,
    careerFields: fields,
    verdict,
    careerRemedies,
  };
}

// -------------------------------------------------------------
// 2. D7 SAPTAMSHA (सप्तमांश - संतान, संतति व वंश वृद्धि)
// -------------------------------------------------------------
export interface D7SaptamshaAnalysis {
  chart: VargaChartData;
  fifthHouseLord: string;
  fifthHousePlacement: string;
  fifthHouseOccupants: string[];
  seventhHouseLord: string;
  seventhHouseOccupants: string[];
  jupiterStatus: string;
  progenyBlissScore: number; // 1 to 10
  verdict: string;
  remedies: string[];
}

export function analyzeD7Saptamsha(lagnaDegree: number, planets: PlanetPosition[]): D7SaptamshaAnalysis {
  const chart = getVargaChartData(
    lagnaDegree,
    planets,
    7,
    'D7',
    'सप्तमांश चक्र (Saptamsha Chart)',
    'संतान, संतति सुख, वंश वृद्धि, पौत्र-पौत्री व पंचम भाव का सूक्ष्म फल'
  );

  const fifthHouse = chart.houses[4]; // 5th house
  const fifthLord = fifthHouse.lord;
  const fifthLordPlanet = chart.planets.find((p) => p.planet === fifthLord);
  const fifthLordHouse = fifthLordPlanet?.house || 5;
  const fifthHousePlacement = `पंचमेश (${fifthLord}) सप्तमांश के भाव ${fifthLordHouse} (${fifthLordPlanet?.rashi || ''}) में स्थित है।`;

  const seventhHouse = chart.houses[6]; // 7th house (2nd child)
  const seventhLord = seventhHouse.lord;

  const jupP = chart.planets.find((p) => p.planet === 'गुरु');
  const venusP = chart.planets.find((p) => p.planet === 'शुक्र');

  let progenyBlissScore = 7;
  let jupiterStatus = '';

  if (jupP) {
    if ([1, 4, 5, 9, 11].includes(jupP.house) || jupP.dignity === 'उच्च' || jupP.dignity === 'स्वराशि') {
      progenyBlissScore += 2;
      jupiterStatus = `संतान कारक गुरु भाव ${jupP.house} में ${jupP.dignity} स्थिति में हैं — अति शुभ संतान सुख व कुलदीपक संतति योग।`;
    } else if ([6, 8, 12].includes(jupP.house) || jupP.dignity === 'नीच') {
      progenyBlissScore -= 2;
      jupiterStatus = `संतान कारक गुरु भाव ${jupP.house} में स्थित हैं — संतान संबंधी मामलों में गुरु की शांति व मंत्र जप फलदायी रहेगा।`;
    } else {
      jupiterStatus = `संतान कारक गुरु भाव ${jupP.house} में सामान्य स्थिति में हैं।`;
    }
  }

  // Benefics in 5th house
  const hasBeneficIn5th = fifthHouse.occupants.some((pl) => ['गुरु', 'शुक्र', 'बुध', 'चंद्र'].includes(pl));
  if (hasBeneficIn5th) progenyBlissScore += 1;

  progenyBlissScore = Math.max(3, Math.min(10, progenyBlissScore));

  let verdict = '';
  if (progenyBlissScore >= 8) {
    verdict = 'सप्तमांश चक्र में उत्तम संतान योग विद्यमान है। संतति आज्ञाकारी, उच्च शिक्षा प्राप्त करने वाली एवं कुल का नाम रोशन करने वाली होगी।';
  } else if (progenyBlissScore >= 6) {
    verdict = 'सप्तमांश चक्र अनुसार सामान्य व शुभ संतान सुख प्राप्त होगा। संतान के स्वास्थ्य व विद्या हेतु समय-समय पर मार्गदर्शन हितकर रहेगा।';
  } else {
    verdict = 'सप्तमांश में पंचम भाव अथवा कारक गुरु पर कुछ पाप प्रभाव दृष्टिगोचर है। संतान सुख में विलंब निवारणार्थ वैदिक उपाय अनुकरणीय हैं।';
  }

  const remedies = [
    'संतान सुख, दीर्घायु व मेधावी बुद्धि हेतु नित्य "संतान गोपाल मंत्र" (ॐ देवकीसुत गोविंद वासुदेव जगत्पते...) का 1 माला जप करें।',
    'गुरुवार के दिन भगवान लक्ष्मीनारायण की पूजा करें एवं केले के वृक्ष को जल अर्पित करें।',
    'प्रतिवर्ष श्रीकृष्ण जन्माष्टमी अथवा गोपाष्टमी पर गौमाता को हरा चारा व गुड़ खिलाएं।',
    'संतान के जन्म नक्षत्र के दिन विद्वान ब्राह्मण द्वारा रुद्राभिषेक कराना परम कल्याणकारी रहता है।',
  ];

  return {
    chart,
    fifthHouseLord: fifthLord,
    fifthHousePlacement,
    fifthHouseOccupants: fifthHouse.occupants,
    seventhHouseLord: seventhLord,
    seventhHouseOccupants: seventhHouse.occupants,
    jupiterStatus,
    progenyBlissScore,
    verdict,
    remedies,
  };
}

// -------------------------------------------------------------
// 3. D3 DREKKANA (द्रेष्काण - सहोदर, पराक्रम व शौर्य)
// -------------------------------------------------------------
export interface D3DrekkanaAnalysis {
  chart: VargaChartData;
  thirdHouseLord: string;
  thirdHousePlacement: string;
  thirdHouseOccupants: string[];
  eleventhHouseLord: string;
  marsStatus: string;
  valourScore: number; // 1 to 10
  verdict: string;
  remedies: string[];
}

export function analyzeD3Drekkana(lagnaDegree: number, planets: PlanetPosition[]): D3DrekkanaAnalysis {
  const chart = getVargaChartData(
    lagnaDegree,
    planets,
    3,
    'D3',
    'द्रेष्काण चक्र (Drekkana Chart)',
    'सहोदर (भाई-बहन), पराक्रम, शारीरिक ऊर्जा, साहस, संकल्प शक्ति व तृतीय भाव का सूक्ष्म फल'
  );

  const thirdHouse = chart.houses[2]; // 3rd house
  const thirdLord = thirdHouse.lord;
  const thirdLordPlanet = chart.planets.find((p) => p.planet === thirdLord);
  const thirdLordHouse = thirdLordPlanet?.house || 3;
  const thirdHousePlacement = `तृतीयेश (${thirdLord}) द्रेष्काण के भाव ${thirdLordHouse} (${thirdLordPlanet?.rashi || ''}) में स्थित है।`;

  const eleventhHouse = chart.houses[10]; // 11th house (elder siblings)
  const eleventhLord = eleventhHouse.lord;

  const marsP = chart.planets.find((p) => p.planet === 'मंगल');
  let valourScore = 7;
  let marsStatus = '';

  if (marsP) {
    if ([1, 3, 6, 10].includes(marsP.house) || marsP.dignity === 'उच्च' || marsP.dignity === 'स्वराशि') {
      valourScore += 2;
      marsStatus = `भ्रातृ व पराक्रम कारक मंगल भाव ${marsP.house} में ${marsP.dignity} है — अदम्य साहस, नेतृत्व शक्ति व सहोदरों में प्रभाव।`;
    } else if ([8, 12].includes(marsP.house) || marsP.dignity === 'नीच') {
      valourScore -= 1;
      marsStatus = `मंगल भाव ${marsP.house} में स्थित हैं — भाई-बहनों से व्यवहार में मधुरता व धैर्य बनाए रखना आवश्यक।`;
    } else {
      marsStatus = `मंगल भाव ${marsP.house} में सामान्य स्थिति में हैं।`;
    }
  }

  valourScore = Math.max(3, Math.min(10, valourScore));

  let verdict = 'द्रेष्काण चक्र अनुसार जातक में स्वाभाविक साहस, संघर्ष क्षमता व अपने बलबूते पर लक्ष्य साधने की शक्ति विद्यमान है।';
  if (valourScore >= 8) {
    verdict = 'द्रेष्काण में तृतीय भाव व मंगल की स्थिति अत्यंत सशक्त है। जातक पराक्रमी, संकटों से न घबराने वाला एवं सहोदरों का रक्षक होगा।';
  }

  const remedies = [
    'पराक्रम एवं सहोदर सौहार्द हेतु मंगलवार को श्री हनुमान चालीसा अथवा सुंदरकांड का पाठ करें।',
    'छोटे भाइयों व सहकर्मियों का सम्मान करें एवं उनकी यथाशक्ति सहायता करें।',
    'मंगलवार को लाल मसूर अथवा गुड़ का दान मंगल दोष शांति व आत्मबल में वृद्धि करता है।',
  ];

  return {
    chart,
    thirdHouseLord: thirdLord,
    thirdHousePlacement,
    thirdHouseOccupants: thirdHouse.occupants,
    eleventhHouseLord: eleventhLord,
    marsStatus,
    valourScore,
    verdict,
    remedies,
  };
}

// -------------------------------------------------------------
// 4. MASTER SHODASHVARGA SUMMARY (वैशेषिकांश एवं वर्गोत्तम विश्लेषण)
// -------------------------------------------------------------
export const SHODASH_DIVISIONS = [1, 2, 3, 4, 7, 9, 10, 12, 16, 20, 24, 27, 30, 40, 45, 60];

export interface PlanetVargaRow {
  planet: string;
  d1Sign: string;
  d9Sign: string;
  isD9Vargottama: boolean;
  ownExaltedCount: number; // count across 16 vargas
  vaisheshikamshaTitle: string; // पारिजात, उत्तम, गोपुर, etc.
  vargaRashis: Record<number, string>;
}

export function calculateVaisheshikamshaSummary(
  lagnaDegree: number,
  planets: PlanetPosition[]
): PlanetVargaRow[] {
  return planets.map((p) => {
    const vargaRashis: Record<number, string> = {};
    let ownExaltedCount = 0;

    SHODASH_DIVISIONS.forEach((div) => {
      const vSign = calculateVargaSign(p.degree, div);
      vargaRashis[div] = RASHIS[vSign];

      const isExalted = EXALTATION_INDEX[p.planet] === vSign;
      const isOwn = OWN_SIGNS_INDICES[p.planet]?.includes(vSign);
      if (isExalted || isOwn) {
        ownExaltedCount += 1;
      }
    });

    const d1Sign = vargaRashis[1];
    const d9Sign = vargaRashis[9];
    const isD9Vargottama = d1Sign === d9Sign;

    let vaisheshikamshaTitle = 'सामान्य';
    if (ownExaltedCount >= 9) vaisheshikamshaTitle = 'श्रीधाम / शक्रवाहन (अति विशिष्ट)';
    else if (ownExaltedCount === 8) vaisheshikamshaTitle = 'ब्रह्मलोक (अति उच्च बल)';
    else if (ownExaltedCount === 7) vaisheshikamshaTitle = 'देवलोक (दिव्य सामर्थ्य)';
    else if (ownExaltedCount === 6) vaisheshikamshaTitle = 'पारावत (प्रचंड राजयोग)';
    else if (ownExaltedCount === 5) vaisheshikamshaTitle = 'सिंहासन (सम्मान व सत्ता)';
    else if (ownExaltedCount === 4) vaisheshikamshaTitle = 'गोपुर (स्थाई ऐश्वर्य)';
    else if (ownExaltedCount === 3) vaisheshikamshaTitle = 'उत्तम (श्रेष्ठ फल)';
    else if (ownExaltedCount === 2) vaisheshikamshaTitle = 'पारिजात (शुभ फल)';

    return {
      planet: p.planet,
      d1Sign,
      d9Sign,
      isD9Vargottama,
      ownExaltedCount,
      vaisheshikamshaTitle,
      vargaRashis,
    };
  });
}
