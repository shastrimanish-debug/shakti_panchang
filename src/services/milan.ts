/**
 * Classical Ashtakoot 36 Guna Milan & Comprehensive Dosha Evaluation Engine
 * Pure Vedic rules following Brihat Parashara Hora Shastra, Muhurta Chintamani,
 * and standard classical North/South Indian matchmaking rules.
 */

import { KundaliData, AshtakootItem } from '../types';
import { RASHIS, NAKSHATRAS } from './astronomy';
import {
  checkManglik,
  getVarna,
  RASHI_VASHYAS,
  NAKSHATRA_GANAS,
  NAKSHATRA_YONIS,
  NAKSHATRA_NADIS,
} from './kundali';

export interface MilanEvaluationResult {
  totalScore: number;
  maxScore: number; // 36
  verdictGrade: 'excellent' | 'good' | 'average' | 'poor';
  verdict: string;
  items: AshtakootItem[];
  manglikAnalysis: {
    isCancelled: boolean;
    verdict: string;
    boyStatus: string;
    girlStatus: string;
    boyHouses: number[];
    girlHouses: number[];
    boyNote: string;
    girlNote: string;
    cancellationReason: string;
  };
  nadiDosha: {
    hasDosha: boolean;
    boyNadi: string;
    girlNadi: string;
    isPariharApplicable: boolean;
    pariharReason: string;
    remedy: string;
  };
  bhakootDosha: {
    hasDosha: boolean;
    relationType: string;
    diffRashi: number;
    boyRashi: string;
    girlRashi: string;
    isPariharApplicable: boolean;
    pariharReason: string;
    remedy: string;
  };
  ganaDosha: {
    hasDosha: boolean;
    boyGana: string;
    girlGana: string;
    isPariharApplicable: boolean;
    pariharReason: string;
  };
  conclusion: string;
  auspiciousRemedies: string[];
}

// Classical Rashi Lords
export const RASHI_LORDS = [
  'मंगल', 'शुक्र', 'बुध', 'चंद्र', 'सूर्य', 'बुध',
  'शुक्र', 'मंगल', 'गुरु', 'शनि', 'शनि', 'गुरु'
];

// Natural planetary friendships (Mitra / Shatru / Sama)
export const GRAHA_MAITRI_MATRIX: Record<string, { friends: string[]; enemies: string[]; neutral: string[] }> = {
  सूर्य: {
    friends: ['चंद्र', 'मंगल', 'गुरु'],
    enemies: ['शुक्र', 'शनि', 'राहु', 'केतु'],
    neutral: ['बुध'],
  },
  चंद्र: {
    friends: ['सूर्य', 'बुध'],
    enemies: [],
    neutral: ['मंगल', 'गुरु', 'शुक्र', 'शनि'],
  },
  मंगल: {
    friends: ['सूर्य', 'चंद्र', 'गुरु'],
    enemies: ['बुध'],
    neutral: ['शुक्र', 'शनि'],
  },
  बुध: {
    friends: ['सूर्य', 'शुक्र'],
    enemies: ['चंद्र'],
    neutral: ['मंगल', 'गुरु', 'शनि'],
  },
  गुरु: {
    friends: ['सूर्य', 'चंद्र', 'मंगल'],
    enemies: ['बुध', 'शुक्र'],
    neutral: ['शनि'],
  },
  शुक्र: {
    friends: ['बुध', 'शनि'],
    enemies: ['सूर्य', 'चंद्र'],
    neutral: ['मंगल', 'गुरु'],
  },
  शनि: {
    friends: ['बुध', 'शुक्र'],
    enemies: ['सूर्य', 'चंद्र', 'मंगल'],
    neutral: ['गुरु'],
  },
};

// Yoni animal compatibility table (0 to 4 score)
// Enemies: Horse-Buffalo, Elephant-Lion, Sheep-Monkey, Serpent-Mongoose, Dog-Deer, Cat-Rat, Cow-Tiger
const YONI_ENEMIES: [string, string][] = [
  ['अश्व', 'महिष'],
  ['गज', 'सिंह'],
  ['मेढ़ा', 'वानर'],
  ['सर्प', 'नकुल'],
  ['श्वान', 'मृग'],
  ['मार्जार', 'मूषक'],
  ['गौ', 'व्याघ्र'],
];

export function evaluateKundaliMilan(boy: KundaliData, girl: KundaliData): MilanEvaluationResult {
  const boyMoonIdx = RASHIS.indexOf(boy.moonRashi);
  const girlMoonIdx = RASHIS.indexOf(girl.moonRashi);
  const boyNakIdx = NAKSHATRAS.indexOf(boy.nakshatra);
  const girlNakIdx = NAKSHATRAS.indexOf(girl.nakshatra);

  const items: AshtakootItem[] = [];

  // ==========================================
  // 1. वर्ण (Varna) — 1 Point (जाति व अहंकार सामंजस्य)
  // ==========================================
  const varnas = ['ब्राह्मण', 'क्षत्रिय', 'वैश्य', 'शूद्र'];
  const boyVarnaIdx = varnas.indexOf(boy.varna);
  const girlVarnaIdx = varnas.indexOf(girl.varna);
  let varnaScore = 0;
  let varnaNote = '';
  if (boyVarnaIdx <= girlVarnaIdx) {
    varnaScore = 1;
    varnaNote = 'वर का वर्ण कन्या के समकक्ष या उच्च है। परस्पर अहंकार का संतुलन व सात्विक सामंजस्य उत्तम रहेगा।';
  } else {
    varnaScore = 0;
    varnaNote = 'कन्या का वर्ण वर से उच्च है। विचारों में असंतुलन संभव, यद्यपि अन्य गुणों से परिहार होता है।';
  }
  items.push({
    name: '१. वर्ण (Varna)',
    score: varnaScore,
    max: 1,
    note: varnaNote,
    boyValue: boy.varna,
    girlValue: girl.varna,
  });

  // ==========================================
  // 2. वश्य (Vashya) — 2 Points (पारस्परिक आकर्षण व नियंत्रण)
  // ==========================================
  let vashyaScore = 0;
  let vashyaNote = '';
  if (boy.vashya === girl.vashya) {
    vashyaScore = 2;
    vashyaNote = 'दोनों का एक ही वश्य होने से पारस्परिक प्रेम, समर्पण व वशीकरण पूर्ण रहेगा।';
  } else if (
    (boy.vashya === 'मानव' && ['चतुष्पाद', 'जलचर'].includes(girl.vashya)) ||
    (boy.vashya === 'वनचर' && girl.vashya === 'चतुष्पाद')
  ) {
    vashyaScore = 1.5;
    vashyaNote = 'वर का वश्य कन्या पर स्वाभाविक नियंत्रण रखता है। वैवाहिक जीवन सुखमय रहेगा।';
  } else if (boyMoonIdx % 2 === girlMoonIdx % 2) {
    vashyaScore = 1;
    vashyaNote = 'समान प्रकृति की राशियाँ होने से मध्यम वश्य सामंजस्य।';
  } else {
    vashyaScore = 0.5;
    vashyaNote = 'भिन्न वश्य होने से कभी-कभी विचारों में मतभेद संभव, आपसी समझ आवश्यक।';
  }
  items.push({
    name: '२. वश्य (Vashya)',
    score: vashyaScore,
    max: 2,
    note: vashyaNote,
    boyValue: boy.vashya,
    girlValue: girl.vashya,
  });

  // ==========================================
  // 3. तारा (Tara) — 3 Points (आयु, भाग्य व स्वास्थ्य)
  // ==========================================
  const taraBoyToGirl = ((girlNakIdx - boyNakIdx + 27) % 9) + 1;
  const taraGirlToBoy = ((boyNakIdx - girlNakIdx + 27) % 9) + 1;
  const inauspiciousTara = [3, 5, 7]; // 3=विपत्, 5=प्रत्यरि, 7=निधन

  const TARA_NAMES: Record<number, string> = {
    1: 'जन्म', 2: 'सम्पत', 3: 'विपत्', 4: 'क्षेम',
    5: 'प्रत्यरि', 6: 'साधक', 7: 'निधन', 8: 'मित्र', 9: 'परम मित्र'
  };

  const isBoyInauspicious = inauspiciousTara.includes(taraBoyToGirl);
  const isGirlInauspicious = inauspiciousTara.includes(taraGirlToBoy);

  let taraScore = 3;
  let taraNote = '';
  if (!isBoyInauspicious && !isGirlInauspicious) {
    taraScore = 3;
    taraNote = 'दोनों तरफ से शुभ तारा (क्षेम/साधक/मित्र/सम्पत)। दीर्घायु, भाग्यवृद्धि व कल्याणकारी योग।';
  } else if (!isBoyInauspicious || !isGirlInauspicious) {
    taraScore = 1.5;
    taraNote = 'एक पक्ष से तारा शुभ व दूसरे पक्ष से मध्यम है। मध्यम तारा शुद्धि प्राप्त होती है।';
  } else {
    taraScore = 0;
    taraNote = `दोनों ओर से विपत्/प्रत्यरि/निधन तारा। तारा दोष निवारण हेतु महामृत्युंजय जप श्रेयस्कर है।`;
  }
  items.push({
    name: '३. तारा (Tara)',
    score: taraScore,
    max: 3,
    note: taraNote,
    boyValue: `${TARA_NAMES[taraBoyToGirl] || 'तारा'} (${taraBoyToGirl})`,
    girlValue: `${TARA_NAMES[taraGirlToBoy] || 'तारा'} (${taraGirlToBoy})`,
  });

  // ==========================================
  // 4. योनि (Yoni) — 4 Points (शारीरिक, मानसिक व दैहिक सामंजस्य)
  // ==========================================
  const isHostileYoni = YONI_ENEMIES.some(
    ([a, b]) => (boy.yoni === a && girl.yoni === b) || (boy.yoni === b && girl.yoni === a)
  );

  let yoniScore = 2;
  let yoniNote = '';
  if (boy.yoni === girl.yoni) {
    yoniScore = 4;
    yoniNote = 'समान योनि होने से श्रेष्ठतम दैहिक, मानसिक व भावनात्मक सामंजस्य प्राप्त होगा।';
  } else if (isHostileYoni) {
    yoniScore = 0;
    yoniNote = `${boy.yoni} व ${girl.yoni} परस्पर शत्रु योनि हैं। दांपत्य में आकर्षण की कमी अथवा कलह की संभावना।`;
  } else {
    yoniScore = 2.5;
    yoniNote = 'मित्र अथवा सम योनि होने से सामान्य व संतोषप्रद शारीरिक एवं वैवाहिक सामंजस्य।';
  }
  items.push({
    name: '४. योनि (Yoni)',
    score: yoniScore,
    max: 4,
    note: yoniNote,
    boyValue: boy.yoni,
    girlValue: girl.yoni,
  });

  // ==========================================
  // 5. ग्रह मैत्री (Graha Maitri) — 5 Points (मानसिक विचार व मित्रता)
  // ==========================================
  const boyLord = RASHI_LORDS[boyMoonIdx];
  const girlLord = RASHI_LORDS[girlMoonIdx];

  let grahaScore = 3;
  let grahaNote = '';
  if (boyLord === girlLord) {
    grahaScore = 5;
    grahaNote = 'दोनों के राशि स्वामी एक ही ग्रह हैं! सर्वोच्च मित्रता, विचारों की एकात्मकता व प्रगाढ़ प्रेम।';
  } else {
    const boyRelations = GRAHA_MAITRI_MATRIX[boyLord];
    const girlRelations = GRAHA_MAITRI_MATRIX[girlLord];

    const boyConsidersGirlFriend = boyRelations?.friends.includes(girlLord);
    const girlConsidersBoyFriend = girlRelations?.friends.includes(boyLord);
    const boyConsidersGirlEnemy = boyRelations?.enemies.includes(girlLord);
    const girlConsidersBoyEnemy = girlRelations?.enemies.includes(boyLord);

    if (boyConsidersGirlFriend && girlConsidersBoyFriend) {
      grahaScore = 5;
      grahaNote = 'परस्पर अभिन्न मित्र ग्रह। पारिवारिक तालमेल व विचारों की अनुकूलता बहुत उत्तम।';
    } else if ((boyConsidersGirlFriend && !girlConsidersBoyEnemy) || (girlConsidersBoyFriend && !boyConsidersGirlEnemy)) {
      grahaScore = 4;
      grahaNote = 'एक मित्र व दूसरा सम ग्रह। अच्छा वैचारिक सामंजस्य रहेगा।';
    } else if (!boyConsidersGirlEnemy && !girlConsidersBoyEnemy) {
      grahaScore = 3;
      grahaNote = 'दोनों ग्रह परस्पर सम (तटस्थ) हैं। मध्यम मित्रता व सामान्य जीवन रहेगा।';
    } else if (boyConsidersGirlEnemy && girlConsidersBoyEnemy) {
      grahaScore = 0.5;
      grahaNote = 'दोनों के राशि स्वामी परस्पर शत्रु हैं। वैचारिक मतभेद होने की संभावना।';
    } else {
      grahaScore = 1;
      grahaNote = 'एक ओर से शत्रुता व दूसरी ओर से सम भाव। मध्यम-न्यून मित्रता।';
    }
  }
  items.push({
    name: '५. ग्रह मैत्री (Graha Maitri)',
    score: grahaScore,
    max: 5,
    note: grahaNote,
    boyValue: `${boy.moonRashi} (${boyLord})`,
    girlValue: `${girl.moonRashi} (${girlLord})`,
  });

  // ==========================================
  // 6. गण (Gana) — 6 Points (स्वभाव, आचरण व जीवनशैली)
  // ==========================================
  let ganaScore = 6;
  let ganaNote = '';
  let hasGanaDosha = false;
  let isGanaParihar = false;
  let ganaPariharReason = '';

  if (boy.gana === girl.gana) {
    ganaScore = 6;
    ganaNote = `दोनों का समान "${boy.gana}" गण होने से स्वभाव, रुचि व जीवनशैली में पूर्ण सामंजस्य रहेगा।`;
  } else if (
    (boy.gana === 'देव' && girl.gana === 'मनुष्य') ||
    (boy.gana === 'मनुष्य' && girl.gana === 'देव')
  ) {
    ganaScore = 5;
    ganaNote = 'देव व मनुष्य गण का उत्तम मेल। परस्पर आदर, संस्कार व सुखी गृहस्थी।';
  } else if (boy.gana === 'राक्षस' && girl.gana === 'देव') {
    ganaScore = 1;
    hasGanaDosha = true;
    ganaNote = 'वर राक्षस व कन्या देव गण होने से स्वभाव में अंतर रहेगा।';
  } else if (boy.gana === 'देव' && girl.gana === 'राक्षस') {
    ganaScore = 0;
    hasGanaDosha = true;
    ganaNote = 'कन्या राक्षस गण व वर देव गण होने से गण दोष। कन्या का स्वभाव तीव्र व प्रभावशाली रहेगा।';
  } else {
    // मनुष्य & राक्षस
    ganaScore = 0.5;
    hasGanaDosha = true;
    ganaNote = 'मनुष्य व राक्षस गण का मेल होने से गण भेद। धैर्य व परस्पर समझ की आवश्यकता।';
  }

  // Ganadosha Parihar checks (If Rashi lords are friends or Moon is in auspicious Tara)
  if (hasGanaDosha) {
    if (boyLord === girlLord || GRAHA_MAITRI_MATRIX[boyLord]?.friends.includes(girlLord)) {
      isGanaParihar = true;
      ganaPariharReason = 'राशि स्वामियों में मित्रता होने के कारण शास्त्रानुसार गण दोष का स्वतः परिहार हो जाता है।';
      ganaScore = Math.max(ganaScore, 3);
    } else if (boyMoonIdx === girlMoonIdx) {
      isGanaParihar = true;
      ganaPariharReason = 'समान राशि होने से गण दोष का परिहार शास्त्रसम्मत है।';
      ganaScore = Math.max(ganaScore, 4);
    }
  }

  items.push({
    name: '६. गण (Gana)',
    score: ganaScore,
    max: 6,
    note: isGanaParihar ? `${ganaNote} (${ganaPariharReason})` : ganaNote,
    boyValue: boy.gana,
    girlValue: girl.gana,
  });

  // ==========================================
  // 7. भकूट (Bhakoot) — 7 Points (वंश वृद्धि, प्रेम व दांपत्य सुख)
  // ==========================================
  const diffRashi = ((girlMoonIdx - boyMoonIdx + 12) % 12) + 1;
  const isBhakootDosha = [2, 6, 8, 12].includes(diffRashi);
  let bhakootScore = isBhakootDosha ? 0 : 7;
  let bhakootNote = '';
  let relationType = 'शुभ संबंध';
  let hasBhakoot = isBhakootDosha;
  let isBhakootParihar = false;
  let bhakootPariharReason = '';
  let bhakootRemedy = '';

  if (diffRashi === 6 || diffRashi === 8) {
    relationType = 'षडाष्टक (६-८) संबंध';
    bhakootNote = 'षडाष्टक संबंध होने से स्वास्थ्य बाधा व क्लेश की आशंका (भकूट दोष)।';
  } else if (diffRashi === 2 || diffRashi === 12) {
    relationType = 'द्विर्द्वादश (२-१२) संबंध';
    bhakootNote = 'द्विर्द्वादश संबंध होने से अत्यधिक व्यय व धन हानि की आशंका (भकूट दोष)।';
  } else if (diffRashi === 9 || diffRashi === 5) {
    relationType = 'नवपंचम (९-५) संबंध';
    bhakootScore = 7;
    bhakootNote = 'नवपंचम संबंध होने से धर्म, संतान, विद्या व परस्पर आदर में अत्यधिक वृद्धि।';
  } else {
    bhakootScore = 7;
    bhakootNote = 'परस्पर शुभ भाव संबंध होने से उत्तम दांपत्य, वंश वृद्धि व सुख-समृद्धि।';
  }

  // Bhakoot Parihars (Very important in practical matchmaking)
  if (isBhakootDosha) {
    if (boyLord === girlLord) {
      isBhakootParihar = true;
      bhakootPariharReason = 'दोनों राशियों के स्वामी एक ही ग्रह होने से भकूट दोष का पूर्णतः परिहार हो गया है।';
      bhakootScore = 7;
    } else if (
      GRAHA_MAITRI_MATRIX[boyLord]?.friends.includes(girlLord) &&
      GRAHA_MAITRI_MATRIX[girlLord]?.friends.includes(boyLord)
    ) {
      isBhakootParihar = true;
      bhakootPariharReason = 'दोनों राशि स्वामियों में परस्पर परम मित्रता होने से भकूट दोष निष्प्रभावी हो जाता है।';
      bhakootScore = 5;
    } else {
      bhakootRemedy = `${relationType} जनित भकूट दोष शांति हेतु विवाह पूर्व गोदान, ब्राह्मण भोजन अथवा भगवान शिव का रुद्राभिषेक कराएं।`;
    }
  }

  items.push({
    name: '७. भकूट (Bhakoot)',
    score: bhakootScore,
    max: 7,
    note: isBhakootParihar ? `${bhakootNote} (${bhakootPariharReason})` : bhakootNote,
    boyValue: `${boy.moonRashi} (${boyMoonIdx + 1})`,
    girlValue: `${girl.moonRashi} (${girlMoonIdx + 1})`,
  });

  // ==========================================
  // 8. नाड़ी (Nadi) — 8 Points (संतान, आनुवंशिकी व स्वास्थ्य)
  // ==========================================
  const isNadiDosha = boy.nadi === girl.nadi;
  let nadiScore = isNadiDosha ? 0 : 8;
  let nadiNote = '';
  let isNadiParihar = false;
  let nadiPariharReason = '';
  let nadiRemedy = '';

  if (!isNadiDosha) {
    nadiScore = 8;
    nadiNote = 'दोनों की नाड़ी भिन्न है (आदि/मध्य/अन्त्य)। नाड़ी दोष रहित श्रेष्ठ मिलान। उत्तम स्वास्थ्य, दीर्घायु व तेजस्वी संतान योग।';
  } else {
    // Both have same Nadi
    // Classical Parihars:
    // 1. Same Rashi but different Nakshatras
    // 2. Same Nakshatra but different Rashis (e.g. Krittika in Mesha vs Vrishabha)
    // 3. Same Nakshatra but different Padas / Charans
    if (boy.nakshatra !== girl.nakshatra) {
      isNadiParihar = true;
      nadiPariharReason = 'यद्यपि नाड़ी एक है, किन्तु दोनों के जन्म नक्षत्र भिन्न होने से शास्त्रानुसार नाड़ी दोष का परिहार हो जाता है।';
      nadiScore = 6;
      nadiNote = `समान ${boy.nadi} नाड़ी, पर भिन्न नक्षत्र होने से परिहार प्राप्त।`;
    } else if (boy.charan !== girl.charan) {
      isNadiParihar = true;
      nadiPariharReason = 'समान नक्षत्र होने पर भी नक्षत्र चरण भिन्न होने से नाड़ी दोष में परिहार लागू होता है।';
      nadiScore = 5;
      nadiNote = `समान नक्षत्र चरण भेद से परिहार।`;
    } else {
      nadiScore = 0;
      nadiNote = `समान ${boy.nadi} नाड़ी व समान नक्षत्र होने से "पूर्ण नाड़ी दोष"। संतान व स्वास्थ्य संबंधी बाधाएं संभव।`;
      nadiRemedy = 'विवाह पूर्व विद्वान ब्राह्मण द्वारा विधिवत "नाड़ी दोष शांति", स्वर्ण दान एवं महामृत्युंजय अनुष्ठान अवश्य कराएं।';
    }
  }

  items.push({
    name: '८. नाड़ी (Nadi)',
    score: nadiScore,
    max: 8,
    note: isNadiParihar ? `${nadiNote} (${nadiPariharReason})` : nadiNote,
    boyValue: `${boy.nadi} नाड़ी`,
    girlValue: `${girl.nadi} नाड़ी`,
  });

  // Calculate Total Score
  const totalScore = items.reduce((sum, item) => sum + item.score, 0);

  // Manglik Evaluation
  const boyManglik = checkManglik(boy);
  const girlManglik = checkManglik(girl);

  let isManglikCancelled = false;
  let cancellationReason = '';
  let manglikVerdict = '';

  if (boyManglik.isManglik && girlManglik.isManglik) {
    isManglikCancelled = true;
    cancellationReason = 'वर और कन्या दोनों की कुण्डलियाँ मांगलिक होने से शास्त्रानुसार "भौम-दोष साम्य" (दोष परिहार) हो गया है। अतः विवाह पूर्णतः शास्त्रसम्मत व शुभ है।';
    manglikVerdict = 'दोष परिहार (कुज दोष साम्य)';
  } else if (!boyManglik.isManglik && !girlManglik.isManglik) {
    isManglikCancelled = true;
    cancellationReason = 'दोनों ही जातक मांगलिक दोष से पूर्णतः मुक्त हैं।';
    manglikVerdict = 'मांगलिक दोष रहित';
  } else {
    isManglikCancelled = false;
    manglikVerdict = boyManglik.isManglik ? 'वर मांगलिक (कन्या अमंगलीय)' : 'कन्या मांगलिक (वर अमंगलीय)';
    cancellationReason = 'एक पक्ष मांगलिक होने की स्थिति में गुरु की मंगल पर दृष्टि, अथवा विवाह पूर्व कुम्भ-विवाह / अर्क-विवाह एवं महामृत्युंजय जप द्वारा दोष शमन किया जाता है।';
  }

  let verdict = '';
  let verdictGrade: MilanEvaluationResult['verdictGrade'] = 'excellent';

  if (totalScore >= 28) {
    verdict = `अति उत्तम व सर्वश्रेष्ठ मिलान (${totalScore}/36 गुण)। दांपत्य जीवन अत्यंत सुखमय, समृद्ध व दीर्घायु रहेगा।`;
    verdictGrade = 'excellent';
  } else if (totalScore >= 21) {
    verdict = `शुभ एवं अनुकूल मिलान (${totalScore}/36 गुण)। विवाह के लिए शास्त्रसम्मत व प्रशस्त है।`;
    verdictGrade = 'good';
  } else if (totalScore >= 18) {
    verdict = `मध्यम मिलान — विवाह योग्य (${totalScore}/36 गुण)। आवश्यक उपायों के साथ विवाह किया जा सकता है।`;
    verdictGrade = 'average';
  } else {
    verdict = `अस्वीकार्य / दोषयुक्त मिलान (${totalScore}/36 गुण)। 18 से कम गुण मिलने व दोष निवारण के बिना विवाह अनुशंसित नहीं है।`;
    verdictGrade = 'poor';
  }

  const auspiciousRemedies: string[] = [];
  if (nadiRemedy) auspiciousRemedies.push(nadiRemedy);
  if (bhakootRemedy) auspiciousRemedies.push(bhakootRemedy);
  if (!isManglikCancelled) {
    auspiciousRemedies.push('मांगलिक दोष शमन हेतु नित्य श्री हनुमान चालीसा का पाठ करें और मंगल चंडिका स्तोत्र पढ़ें।');
  }
  auspiciousRemedies.push('विवाह पूर्व कुलदेवी/कुलदेवता का पूजन व आशीर्वाद अवश्य ग्रहण करें।');
  auspiciousRemedies.push('गौरी-शंकर रुद्राक्ष अथवा शिव-पार्वती की संयुक्त आराधना से दांपत्य में अगाध प्रेम बना रहता है।');

  return {
    totalScore,
    maxScore: 36,
    verdictGrade,
    verdict,
    items,
    manglikAnalysis: {
      isCancelled: isManglikCancelled,
      verdict: manglikVerdict,
      boyStatus: boyManglik.isManglik ? 'मांगलिक' : 'अमंगलीय',
      girlStatus: girlManglik.isManglik ? 'मांगलिक' : 'अमंगलीय',
      boyHouses: boyManglik.houses,
      girlHouses: girlManglik.houses,
      boyNote: boyManglik.note,
      girlNote: girlManglik.note,
      cancellationReason,
    },
    nadiDosha: {
      hasDosha: isNadiDosha,
      boyNadi: boy.nadi,
      girlNadi: girl.nadi,
      isPariharApplicable: isNadiParihar,
      pariharReason: nadiPariharReason,
      remedy: nadiRemedy,
    },
    bhakootDosha: {
      hasDosha: hasBhakoot,
      relationType,
      diffRashi,
      boyRashi: boy.moonRashi,
      girlRashi: girl.moonRashi,
      isPariharApplicable: isBhakootParihar,
      pariharReason: bhakootPariharReason,
      remedy: bhakootRemedy,
    },
    ganaDosha: {
      hasDosha: hasGanaDosha,
      boyGana: boy.gana,
      girlGana: girl.gana,
      isPariharApplicable: isGanaParihar,
      pariharReason: ganaPariharReason,
    },
    conclusion: `${verdict} ${isManglikCancelled ? 'मांगलिक दोष का परिहार उपलब्ध है।' : 'मांगलिक दोष निवारण आवश्यक है।'}`,
    auspiciousRemedies,
  };
}

/**
 * Creates a compliant KundaliData instance directly from Rashi & Nakshatra selections
 * allowing instantaneous 36-guna calculation without requiring exact birth time.
 */
export function createQuickKundaliFromRashiNakshatra(
  name: string,
  rashiIdx: number,
  nakIdx: number,
  isManglik: boolean = false
): KundaliData {
  const varna = getVarna(rashiIdx);
  const vashya = RASHI_VASHYAS[rashiIdx] || 'मानव';
  const gana = NAKSHATRA_GANAS[nakIdx] || 'देव';
  const yoni = NAKSHATRA_YONIS[nakIdx] || 'अश्व';
  const nadi = NAKSHATRA_NADIS[nakIdx] || 'मध्य';
  const marsHouse = isManglik ? 1 : 3;

  return {
    name: name.trim() || 'जातक',
    birthDate: new Date(),
    birthTime: '12:00',
    birthPlace: 'भारत',
    latitude: 23.1765,
    longitude: 75.7885,
    timezoneHours: 5.5,
    lagnaDegree: 0,
    lagnaRashi: RASHIS[rashiIdx],
    lagnaRashiNumber: rashiIdx + 1,
    moonRashi: RASHIS[rashiIdx],
    sunRashi: RASHIS[rashiIdx],
    nakshatra: NAKSHATRAS[nakIdx],
    charan: '1',
    nadi,
    gana,
    yoni,
    varna,
    vashya,
    isManglik,
    mahadasha: 'सूर्य',
    antardasha: 'सूर्य',
    pratyantardasha: 'सूर्य',
    planets: [
      {
        planet: 'चंद्र',
        englishName: 'Moon',
        degree: rashiIdx * 30 + 15,
        degreeInRashi: 15,
        house: 1,
        rashi: RASHIS[rashiIdx],
        rashiNumber: rashiIdx + 1,
        isRetrograde: false,
        latitude: 0,
        speed: 13.2,
        nakshatra: NAKSHATRAS[nakIdx],
        pada: 1,
      },
      {
        planet: 'मंगल',
        englishName: 'Mars',
        degree: isManglik ? 15 : 75,
        degreeInRashi: 15,
        house: marsHouse,
        rashi: RASHIS[(rashiIdx + marsHouse - 1) % 12],
        rashiNumber: ((rashiIdx + marsHouse - 1) % 12) + 1,
        isRetrograde: false,
        latitude: 0,
        speed: 0.5,
        nakshatra: NAKSHATRAS[0],
        pada: 1,
      },
    ],
    dashaPeriods: [],
    antarPeriods: [],
    pratyantarPeriods: [],
    calculatedAt: new Date(),
  };
}
