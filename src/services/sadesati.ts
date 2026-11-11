/**
 * शनि साढ़े साती एवं दैनिक गोचर (Planetary Transits & Shani Sade Sati Tracker)
 * Vedic Astrological Calculations for Shani Sade Sati, Kantaka Shani, Ashtama Shani,
 * and current planetary transits with respect to natal Moon and Lagna.
 */

import { KundaliData, PlanetPosition } from '../types';
import { RASHIS, calculatePlanetPositions } from './astronomy';

export interface SadeSatiPhase {
  phase: 'rising' | 'peak' | 'setting';
  name: string;
  hindiName: string;
  shaniRashi: string;
  startApprox: string;
  endApprox: string;
  isActive: boolean;
  intensity: 'तीव्र' | 'मध्यम' | 'हल्का';
  description: string;
  bodyImpact: string;
}

export interface SadeSatiStatus {
  isUnderSadeSati: boolean;
  isDhaiya: boolean;
  activePhase?: SadeSatiPhase;
  phaseNumber: number; // 0 = none, 1 = first/rising, 2 = second/peak, 3 = third/setting
  dhaiyaType?: 'कंटक शनि (चतुर्थ)' | 'अष्टम शनि (कष्टप्रद ढैया)' | 'कोई नहीं';
  shaniCurrentRashi: string;
  natalMoonRashi: string;
  summary: string;
  shaniTransitHouse: number; // 1 to 12 from natal Moon
  allPhases: SadeSatiPhase[];
  vedicRemedies: string[];
}

export interface PlanetTransitInfo {
  planet: string;
  englishName: string;
  currentRashi: string;
  currentDegree: number;
  houseFromMoon: number;
  isBenefic: boolean;
  nature: 'शुभ' | 'अशुभ' | 'सम';
  prediction: string;
}

/**
 * Standard Saturn periods (approx 2.5 years per sign)
 * Saturn ingress reference table for recent and upcoming decades
 */
interface ShaniIngress {
  rashi: string;
  rashiIdx: number;
  startDate: string;
  endDate: string;
}

export const SHANI_INGRESS_TABLE: ShaniIngress[] = [
  { rashi: 'तुला', rashiIdx: 6, startDate: '15 नवं 2011', endDate: '02 नवं 2014' },
  { rashi: 'वृश्चिक', rashiIdx: 7, startDate: '02 नवं 2014', endDate: '26 जन 2017' },
  { rashi: 'धनु', rashiIdx: 8, startDate: '26 जन 2017', endDate: '24 जन 2020' },
  { rashi: 'मकर', rashiIdx: 9, startDate: '24 जन 2020', endDate: '17 जन 2023' },
  { rashi: 'कुंभ', rashiIdx: 10, startDate: '17 जन 2023', endDate: '29 मार्च 2025' },
  { rashi: 'मीन', rashiIdx: 11, startDate: '29 मार्च 2025', endDate: '23 फर 2028' },
  { rashi: 'मेष', rashiIdx: 0, startDate: '23 फर 2028', endDate: '17 अप्रैल 2030' },
  { rashi: 'वृषभ', rashiIdx: 1, startDate: '17 अप्रैल 2030', endDate: '31 मई 2032' },
  { rashi: 'मिथुन', rashiIdx: 2, startDate: '31 मई 2032', endDate: '13 जुल 2034' },
  { rashi: 'कर्क', rashiIdx: 3, startDate: '13 जुल 2034', endDate: '27 अग 2036' },
  { rashi: 'सिंह', rashiIdx: 4, startDate: '27 अग 2036', endDate: '22 अक्टू 2038' },
  { rashi: 'कन्या', rashiIdx: 5, startDate: '22 अक्टू 2038', endDate: '08 नवं 2041' },
];

/**
 * Classical Vedic transit predictions for planets from Moon sign
 */
const TRANSIT_PREDICTIONS: Record<string, Record<number, { nature: 'शुभ' | 'अशुभ' | 'सम'; text: string }>> = {
  सूर्य: {
    1: { nature: 'अशुभ', text: 'स्थान हानि, नेत्र पीड़ा, थकान व व्यर्थ भागदौड़।' },
    2: { nature: 'अशुभ', text: 'आर्थिक व्यय, कुटुम्ब में मतभेद, वाणी में कटुता।' },
    3: { nature: 'शुभ', text: 'शत्रु विजय, पदोन्नति, साहस व पराक्रम में वृद्धि।' },
    4: { nature: 'अशुभ', text: 'पारिवारिक तनाव, माता के स्वास्थ्य की चिंता, भूमि-भवन विवाद।' },
    5: { nature: 'अशुभ', text: 'संतान को कष्ट, मानसिक उद्वेग, बुद्धि भ्रम।' },
    6: { nature: 'शुभ', text: 'शत्रु परास्त, ऋण मुक्ति, रोग निवारण व आरोग्य लाभ।' },
    7: { nature: 'अशुभ', text: 'दांपत्य में मतभेद, जीवनसाथी का स्वास्थ्य, यात्रा में कष्ट।' },
    8: { nature: 'अशुभ', text: 'आकस्मिक बाधाएं, सरकारी कार्य में रुकावट, उदर विकार।' },
    9: { nature: 'अशुभ', text: 'भाग्य में विलंब, पिता से वैचारिक मतभेद, धर्म में उदासीनता।' },
    10: { nature: 'शुभ', text: 'कार्य सिद्धि, राजकीय सम्मान, मान-प्रतिष्ठा व व्यापार विस्तार।' },
    11: { nature: 'शुभ', text: 'प्रचुर धन लाभ, मित्रों से सहयोग, समस्त मनोरथ पूर्ण।' },
    12: { nature: 'अशुभ', text: 'अनावश्यक धन व्यय, अनिद्रा, नेत्र कष्ट व विदेश गमन।' },
  },
  गुरु: {
    1: { nature: 'अशुभ', text: 'स्थान परिवर्तन, व्यर्थ की चिंताएं व मान-हानि का भय।' },
    2: { nature: 'शुभ', text: 'अखंड धन लाभ, कुटुंब में मांगलिक उत्सव, मधुर वाणी।' },
    3: { nature: 'अशुभ', text: 'सहोदरो से मतभेद, कार्यों में विघ्न व पराक्रम में कमी।' },
    4: { nature: 'अशुभ', text: 'स्वजनों से विरोध, मातृ कष्ट, गृह क्लेश।' },
    5: { nature: 'शुभ', text: 'संतान प्राप्ति, उच्च विद्या, बुद्धि प्रखरता व राजकृपा।' },
    6: { nature: 'अशुभ', text: 'शत्रु भय, स्वास्थ्य में नरमी, ऋण वृद्धि।' },
    7: { nature: 'शुभ', text: 'वैवाहिक सुख, साझेदारी में लाभ, यात्राएं सफल।' },
    8: { nature: 'अशुभ', text: 'शारीरिक कष्ट, अपयश का भय, कार्य में गतिरोध।' },
    9: { nature: 'शुभ', text: 'सर्वतोमुखी भाग्योदय, तीर्थ यात्रा, गुरु कृपा व प्रतिष्ठा।' },
    10: { nature: 'अशुभ', text: 'कर्म क्षेत्र में परिवर्तन, अधिकारी वर्ग से मनमुटाव।' },
    11: { nature: 'शुभ', text: 'अपूर्व धन वर्षा, पदोन्नति, अभीष्ट सिद्धि व पारिवारिक सुख।' },
    12: { nature: 'अशुभ', text: 'धार्मिक कार्यों में व्यय, वैराग्य भावना, यात्रा कष्ट।' },
  },
  शनि: {
    1: { nature: 'अशुभ', text: 'साढ़े साती शिखर: शारीरिक शिथिलता, अत्यधिक मानसिक दबाव व कठिन परिश्रम।' },
    2: { nature: 'अशुभ', text: 'साढ़े साती उतरती: धन संचय में कठिनाई, पारिवारिक उत्तरदायित्व, वाणी संयम आवश्यक।' },
    3: { nature: 'शुभ', text: 'अत्यंत शुभ फल: शत्रु नाश, अतुल्य पराक्रम, धन लाभ व वाहन सुख।' },
    4: { nature: 'अशुभ', text: 'कंटक शनि ढैया: मानसिक अशांति, गृह सुख में कमी, वाहन चलाते समय सावधानी।' },
    5: { nature: 'अशुभ', text: 'संतान को लेकर चिंता, सट्टे/जोखिम से हानि, विद्या में अवरोध।' },
    6: { nature: 'शुभ', text: 'सर्वत्र विजय: रोगों पर नियंत्रण, कानूनी विजय, प्रतिस्पर्धियों पर भारी विजय।' },
    7: { nature: 'अशुभ', text: 'साझेदारी व दांपत्य जीवन में धीरज रखें, व्यर्थ कलह से बचें।' },
    8: { nature: 'अशुभ', text: 'अष्टम ढैया: स्वास्थ्य के प्रति विशेष सजगता, जोखिम भरे कार्यों से दूर रहें।' },
    9: { nature: 'अशुभ', text: 'भाग्य में धीमापन, पिता के स्वास्थ्य की चिंता, धार्मिक परीक्षा।' },
    10: { nature: 'अशुभ', text: 'कार्यस्थल पर अत्यधिक श्रम, पदोन्नति में विलंब, धैर्य से सिद्धि।' },
    11: { nature: 'शुभ', text: 'दीर्घकालीन लाभ: अचल संपत्ति क्रय, स्थाई आमदनी में वृद्धि, विजय।' },
    12: { nature: 'अशुभ', text: 'साढ़े साती चढ़ती: व्यय वृद्धि, अनिद्रा, कानूनी उलझनों से बचाव।' },
  },
};

/**
 * Calculates Shani Sade Sati Status for a native based on their natal Moon Rashi
 * and current planetary positions
 */
export function calculateSadeSati(kundali: KundaliData, targetDate: Date = new Date()): SadeSatiStatus {
  const natalMoonRashi = kundali.moonRashi || 'मेष';
  const natalMoonIdx = RASHIS.indexOf(natalMoonRashi);

  // Compute current planetary positions for target date
  const currentPlanets = calculatePlanetPositions(
    targetDate,
    kundali.latitude || 25.3176,
    kundali.longitude || 82.9739
  );

  const currentSaturn = currentPlanets.find((p) => p.planet === 'शनि');
  const shaniRashi = currentSaturn?.rashi || 'मीन';
  const shaniRashiIdx = currentSaturn?.rashiNumber ? currentSaturn.rashiNumber - 1 : RASHIS.indexOf(shaniRashi);

  // House of Saturn from Natal Moon:
  // Moon sign = House 1
  const houseFromMoon = ((shaniRashiIdx - natalMoonIdx + 12) % 12) + 1;

  // 12th from Moon = First Phase (Rising)
  // 1st from Moon = Second Phase (Peak)
  // 2nd from Moon = Third Phase (Setting)
  const isRising = houseFromMoon === 12;
  const isPeak = houseFromMoon === 1;
  const isSetting = houseFromMoon === 2;
  const isUnderSadeSati = isRising || isPeak || isSetting;

  // Dhaiya: 4th from Moon (Kantaka Shani) or 8th from Moon (Ashtama Shani)
  const isKantakaDhaiya = houseFromMoon === 4;
  const isAshtamaDhaiya = houseFromMoon === 8;
  const isDhaiya = isKantakaDhaiya || isAshtamaDhaiya;

  let dhaiyaType: SadeSatiStatus['dhaiyaType'] = 'कोई नहीं';
  if (isKantakaDhaiya) dhaiyaType = 'कंटक शनि (चतुर्थ)';
  if (isAshtamaDhaiya) dhaiyaType = 'अष्टम शनि (कष्टप्रद ढैया)';

  let phaseNumber = 0;
  if (isRising) phaseNumber = 1;
  else if (isPeak) phaseNumber = 2;
  else if (isSetting) phaseNumber = 3;

  // Identify all three phases of the native's Sade Sati cycle based on ingress table
  const rashi12 = RASHIS[(natalMoonIdx + 11) % 12];
  const rashi1 = RASHIS[natalMoonIdx];
  const rashi2 = RASHIS[(natalMoonIdx + 1) % 12];

  const ingress12 = SHANI_INGRESS_TABLE.find((i) => i.rashi === rashi12);
  const ingress1 = SHANI_INGRESS_TABLE.find((i) => i.rashi === rashi1);
  const ingress2 = SHANI_INGRESS_TABLE.find((i) => i.rashi === rashi2);

  const allPhases: SadeSatiPhase[] = [
    {
      phase: 'rising',
      name: 'प्रथम चरण (चढ़ती साढ़े साती)',
      hindiName: 'प्रथम चरण — मस्तक पर शनि',
      shaniRashi: rashi12,
      startApprox: ingress12?.startDate || 'विगत/आगामी वर्ष',
      endApprox: ingress12?.endDate || 'ढाई वर्ष बाद',
      isActive: isRising,
      intensity: 'मध्यम',
      description: 'शनि देव चंद्र से द्वादश भाव में गोचर करते हैं। इस चरण में जातक के अनावश्यक व्यय, मानसिक चिंता व नींद की समस्या हो सकती है।',
      bodyImpact: 'सिर व मस्तक पर शनि का प्रभाव — विचारशीलता व अध्यात्म की वृद्धि।',
    },
    {
      phase: 'peak',
      name: 'द्वितीय चरण (शिखर साढ़े साती)',
      hindiName: 'द्वितीय चरण — हृदय पर शनि',
      shaniRashi: rashi1,
      startApprox: ingress1?.startDate || 'विगत/आगामी वर्ष',
      endApprox: ingress1?.endDate || 'ढाई वर्ष बाद',
      isActive: isPeak,
      intensity: 'तीव्र',
      description: 'शनि देव जन्म राशि (चंद्र) पर ही गोचर करते हैं। यह साढ़े साती का सबसे महत्वपूर्ण व कठोर परीक्षा का समय होता है। कठिन परिश्रम से ही सफलता मिलती है।',
      bodyImpact: 'हृदय व उदर पर शनि का प्रभाव — स्वास्थ्य व भावनात्मक स्थिरता बनाए रखें।',
    },
    {
      phase: 'setting',
      name: 'तृतीय चरण (उतरती साढ़े साती)',
      hindiName: 'तृतीय चरण — पैरों पर शनि',
      shaniRashi: rashi2,
      startApprox: ingress2?.startDate || 'विगत/आगामी वर्ष',
      endApprox: ingress2?.endDate || 'ढाई वर्ष बाद',
      isActive: isSetting,
      intensity: 'हल्का',
      description: 'शनि देव चंद्र से द्वितीय (धन व वाणी) भाव में गोचर करते हैं। धीरे-धीरे संकट टलने लगते हैं, आर्थिक लाभ व नवीन शुरुआत होती है।',
      bodyImpact: 'पैरों पर शनि का प्रभाव — अत्यधिक यात्राएं व पदोन्नति का समय।',
    },
  ];

  let summary = '';
  if (isUnderSadeSati) {
    if (isRising) {
      summary = `आपकी जन्म चंद्र राशि "${natalMoonRashi}" है। वर्तमान में शनि देव "${shaniRashi}" में गोचर कर रहे हैं (चंद्र से 12वें भाव में)। आपकी साढ़े साती का 'प्रथम चरण (चढ़ती साढ़े साती)' चल रहा है। आर्थिक संयम और स्वास्थ्य का ध्यान रखें।`;
    } else if (isPeak) {
      summary = `आपकी जन्म चंद्र राशि "${natalMoonRashi}" है और वर्तमान में शनि देव इसी राशि "${shaniRashi}" में गोचर कर रहे हैं। आपकी साढ़े साती का 'द्वितीय चरण (शिखर)' सक्रिय है। यह परीक्षा व आध्यात्मिक तपस्या का काल है।`;
    } else {
      summary = `आपकी जन्म चंद्र राशि "${natalMoonRashi}" है और शनि देव चंद्र से 2रे भाव "${shaniRashi}" में हैं। आपकी साढ़े साती का 'तृतीय चरण (उतरती साढ़े साती)' चल रहा है। कष्टों से मुक्ति व सफलता के द्वार खुल रहे हैं।`;
    }
  } else if (isDhaiya) {
    if (isKantakaDhaiya) {
      summary = `आपकी चंद्र राशि "${natalMoonRashi}" से शनि देव 4थे भाव में हैं। आप पर "कंटक शनि की ढैया" का प्रभाव है। पारिवारिक शांति बनाए रखें व वाहन सावधानी से चलाएं।`;
    } else {
      summary = `आपकी चंद्र राशि "${natalMoonRashi}" से शनि देव 8वें भाव में हैं। आप पर "अष्टम शनि की ढैया" का प्रभाव है। स्वास्थ्य का ध्यान रखें व नियमित हनुमान चालीसा का पाठ करें।`;
    }
  } else {
    summary = `शुभ समाचार! आपकी जन्म चंद्र राशि "${natalMoonRashi}" पर वर्तमान में शनि की साढ़े साती अथवा ढैया का कोई भी प्रतिकूल प्रभाव नहीं है। शनि देव चंद्र से ${houseFromMoon}वें भाव में अनुकूल गोचर कर रहे हैं।`;
  }

  const activePhase = allPhases.find((p) => p.isActive);

  const vedicRemedies = [
    'प्रति शनिवार को पीपल के वृक्ष के नीचे सरसों के तेल का चौमुखा दीपक जलाएं और 7 बार परिक्रमा करें।',
    'नित्य प्रातः अथवा संध्याकाल में श्री हनुमान चालीसा या बजरंग बाण का 3 बार पाठ करें।',
    'शनिवार को छाया दान करें: कटोरी में थोड़ा सरसों का तेल लेकर उसमें अपना मुख देखकर किसी ज़रूरतमंद को दान दें।',
    'शनि महामंत्र का 1 माला (108 बार) जप करें: "ॐ प्रां प्रीं प्रौं सः शनैश्चराय नमः"।',
    'श्रमिकों, सफाई कर्मियों, दिव्यांगों एवं असहाय जनों की यथासंभव सहायता व भोजन दान करें।',
    'काले कुत्ते अथवा कौवों को सरसों के तेल से चुपड़ी रोटी खिलाएं।',
  ];

  return {
    isUnderSadeSati,
    isDhaiya,
    activePhase,
    phaseNumber,
    dhaiyaType,
    shaniCurrentRashi: shaniRashi,
    natalMoonRashi,
    summary,
    shaniTransitHouse: houseFromMoon,
    allPhases,
    vedicRemedies,
  };
}

/**
 * Calculates current planetary transit (Gochar) positions with respect to native Moon sign
 */
export function calculateDailyTransits(kundali: KundaliData, targetDate: Date = new Date()): PlanetTransitInfo[] {
  const natalMoonRashi = kundali.moonRashi || 'मेष';
  const natalMoonIdx = RASHIS.indexOf(natalMoonRashi);

  const currentPlanets = calculatePlanetPositions(
    targetDate,
    kundali.latitude || 25.3176,
    kundali.longitude || 82.9739
  );

  return currentPlanets.map((p) => {
    const rashiIdx = p.rashiNumber - 1;
    const houseFromMoon = ((rashiIdx - natalMoonIdx + 12) % 12) + 1;

    let predictionText = 'सामान्य गोचर प्रभाव।';
    let nature: 'शुभ' | 'अशुभ' | 'सम' = 'सम';

    const planetLookup = TRANSIT_PREDICTIONS[p.planet];
    if (planetLookup && planetLookup[houseFromMoon]) {
      nature = planetLookup[houseFromMoon].nature;
      predictionText = planetLookup[houseFromMoon].text;
    } else {
      // General benefic houses for transit: 3, 6, 10, 11 for malefics; 1, 2, 5, 7, 9, 11 for benefics
      const isNaturalBenefic = ['गुरु', 'शुक्र', 'बुध', 'चंद्र'].includes(p.planet);
      if (isNaturalBenefic) {
        nature = [2, 5, 7, 9, 11].includes(houseFromMoon) ? 'शुभ' : [6, 8, 12].includes(houseFromMoon) ? 'अशुभ' : 'सम';
      } else {
        nature = [3, 6, 11].includes(houseFromMoon) ? 'शुभ' : [1, 2, 4, 7, 8, 12].includes(houseFromMoon) ? 'अशुभ' : 'सम';
      }
      predictionText = `चंद्र से ${houseFromMoon}वें भाव में गोचररत। ${nature === 'शुभ' ? 'अनुकूल फलदायक।' : nature === 'अशुभ' ? 'सावधानी अपेक्षित।' : 'मध्यम फल।'}`;
    }

    return {
      planet: p.planet,
      englishName: p.englishName,
      currentRashi: p.rashi,
      currentDegree: p.degreeInRashi,
      houseFromMoon,
      isBenefic: nature === 'शुभ',
      nature,
      prediction: predictionText,
    };
  });
}
