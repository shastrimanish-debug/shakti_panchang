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
import { trRashi, trPlanet, trVedic } from '../i18n/vedicTranslate';

const MILAN_TERMS_EN: Record<string, string> = {
  'ब्राह्मण': 'Brahmin',
  'क्षत्रिय': 'Kshatriya',
  'वैश्य': 'Vaishya',
  'शूद्र': 'Shudra',
  'मानव': 'Manava (Human)',
  'चतुष्पाद': 'Chatushpada (Quadruped)',
  'जलचर': 'Jalachara (Aquatic)',
  'वनचर': 'Vanachara (Wild)',
  'कीट': 'Keeta (Insect)',
  'देव': 'Deva (Divine)',
  'मनुष्य': 'Manushya (Human)',
  'राक्षस': 'Rakshasa (Fierce)',
  'आदि': 'Adi',
  'मध्य': 'Madhya',
  'अन्त्य': 'Antya',
  'अश्व': 'Ashwa (Horse)',
  'गज': 'Gaja (Elephant)',
  'मेढ़ा': 'Mesha (Sheep)',
  'सर्प': 'Sarpa (Serpent)',
  'श्वान': 'Shwana (Dog)',
  'मार्जार': 'Marjara (Cat)',
  'मूषक': 'Mushaka (Rat)',
  'गौ': 'Gau (Cow)',
  'महिष': 'Mahisha (Buffalo)',
  'व्याघ्र': 'Vyaghra (Tiger)',
  'मृग': 'Mriga (Deer)',
  'वानर': 'Vanara (Monkey)',
  'नकुल': 'Nakula (Mongoose)',
  'सिंह': 'Simha (Lion)',
};

const MILAN_TERMS_GU: Record<string, string> = {
  'ब्राह्मण': 'બ્રાહ્મણ',
  'क्षत्रिय': 'ક્ષત્રિય',
  'वैश्य': 'વૈશ્ય',
  'शूद्र': 'શૂદ્ર',
  'मानव': 'માનવ',
  'चतुष्पाद': 'ચતુષ્પાદ',
  'जलचर': 'જળચર',
  'वनचर': 'વનચર',
  'कीट': 'કીટ',
  'देव': 'દેવ',
  'मनुष्य': 'મનુષ્ય',
  'राक्षस': 'રાક્ષસ',
  'आदि': 'આદિ',
  'मध्य': 'મધ્ય',
  'अन्त्य': 'અંત્ય',
  'अश्व': 'અશ્વ',
  'गज': 'ગજ',
  'मेढ़ा': 'મેષ (ઘેટું)',
  'सर्प': 'સર્પ',
  'श्वान': 'શ્વાન',
  'मार्जार': 'માર્જાર',
  'मूषक': 'મૂષક',
  'गौ': 'ગૌ',
  'महिष': 'મહિષ',
  'व्याघ्र': 'વ્યાઘ્ર',
  'मृग': 'મૃગ',
  'वानर': 'વાનર',
  'नकुल': 'નકુલ',
  'सिंह': 'સિંહ',
};

function trMilanTerm(term: string, c: string): string {
  if (!term) return '';
  if (c === 'en') return MILAN_TERMS_EN[term] || trVedic(term, 'en');
  if (c === 'gu') return MILAN_TERMS_GU[term] || trVedic(term, 'gu');
  return term;
}

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
  rajjuVedha: {
    boyRajju: string;
    girlRajju: string;
    hasRajjuDosha: boolean;
    hasVedhaDosha: boolean;
    note: string;
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

export function evaluateKundaliMilan(
  boy: KundaliData,
  girl: KundaliData,
  lang: string = 'hi'
): MilanEvaluationResult {
  const c = (lang || 'hi').slice(0, 2).toLowerCase();
  const pick = (en: string, gu: string, hi: string) => (c === 'en' ? en : c === 'gu' ? gu : hi);

  const boyMoonIdx = RASHIS.indexOf(boy.moonRashi);
  const girlMoonIdx = RASHIS.indexOf(girl.moonRashi);
  const boyNakIdx = NAKSHATRAS.indexOf(boy.nakshatra);
  const girlNakIdx = NAKSHATRAS.indexOf(girl.nakshatra);

  const items: AshtakootItem[] = [];

  // ==========================================
  // 1. वर्ण (Varna) — 1 Point
  // ==========================================
  const varnas = ['ब्राह्मण', 'क्षत्रिय', 'वैश्य', 'शूद्र'];
  const boyVarnaIdx = varnas.indexOf(boy.varna);
  const girlVarnaIdx = varnas.indexOf(girl.varna);
  let varnaScore = 0;
  let varnaNote = '';
  if (boyVarnaIdx <= girlVarnaIdx) {
    varnaScore = 1;
    varnaNote = pick(
      'Groom Varna is equal to or higher than Bride. Ego balance and harmonious temperament remain strong.',
      'વરનો વર્ણ કન્યાના સમકક્ષ અથવા ઉચ્ચ છે. પરસ્પર અહંકારનું સંતુલન અને સાત્વિક સુમેળ ઉત્તમ રહેશે.',
      'वर का वर्ण कन्या के समकक्ष या उच्च है। परस्पर अहंकार का संतुलन व सात्विक सामंजस्य उत्तम रहेगा।'
    );
  } else {
    varnaScore = 0;
    varnaNote = pick(
      'Bride Varna is higher than Groom. Minor ego differences possible, though other Kootas balance this.',
      'કન્યાનો વર્ણ વર કરતાં ઉચ્ચ છે. વિચારોમાં અસંતુલન સંભવ, જોકે અન્ય ગુણોથી પરિહાર થાય છે.',
      'कन्या का वर्ण वर से उच्च है। विचारों में असंतुलन संभव, यद्यपि अन्य गुणों से परिहार होता है।'
    );
  }
  items.push({
    name: pick('1. Varna (Temperament)', '૧. વર્ણ (Varna)', '१. वर्ण (Varna)'),
    score: varnaScore,
    max: 1,
    note: varnaNote,
    boyValue: trMilanTerm(boy.varna, c),
    girlValue: trMilanTerm(girl.varna, c),
  });

  // ==========================================
  // 2. वश्य (Vashya) — 2 Points
  // ==========================================
  let vashyaScore = 0;
  let vashyaNote = '';
  if (boy.vashya === girl.vashya) {
    vashyaScore = 2;
    vashyaNote = pick(
      'Identical Vashya ensures deep mutual attraction, devotion, and natural understanding.',
      'બંનેનું વશ્ય સમાન હોવાથી પરસ્પર પ્રેમ, સમર્પણ અને આકર્ષણ પૂર્ણ રહેશે.',
      'दोनों का एक ही वश्य होने से पारस्परिक प्रेम, समर्पण व वशीकरण पूर्ण रहेगा।'
    );
  } else if (
    (boy.vashya === 'मानव' && ['चतुष्पाद', 'जलचर'].includes(girl.vashya)) ||
    (boy.vashya === 'वनचर' && girl.vashya === 'चतुष्पाद')
  ) {
    vashyaScore = 1.5;
    vashyaNote = pick(
      'Compatible Vashya dynamics create a supportive and joyful married life.',
      'વરનું વશ્ય કન્યા પર સ્વાભાવિક નિયંત્રણ અને સહયોગ રાખે છે. દામ્પત્ય જીવન સુખમય રહેશે.',
      'वर का वश्य कन्या पर स्वाभाविक नियंत्रण रखता है। वैवाहिक जीवन सुखमय रहेगा।'
    );
  } else if (boyMoonIdx % 2 === girlMoonIdx % 2) {
    vashyaScore = 1;
    vashyaNote = pick(
      'Similar sign polarity offers moderate Vashya harmony.',
      'સમાન પ્રકૃતિની રાશિઓ હોવાથી મધ્યમ વશ્ય સુમેળ.',
      'समान प्रकृति की राशियाँ होने से मध्यम वश्य सामंजस्य।'
    );
  } else {
    vashyaScore = 0.5;
    vashyaNote = pick(
      'Different Vashya may cause occasional disagreements; mutual patience is advised.',
      'ભિન્ન વશ્ય હોવાથી ક્યારેક વિચારોમાં મતભેદ સંભવ, પરસ્પર સમજદારી જરૂરી.',
      'भिन्न वश्य होने से कभी-कभी विचारों में मतभेद संभव, आपसी समझ आवश्यक।'
    );
  }
  items.push({
    name: pick('2. Vashya (Harmony)', '૨. વશ્ય (Vashya)', '२. वश्य (Vashya)'),
    score: vashyaScore,
    max: 2,
    note: vashyaNote,
    boyValue: trMilanTerm(boy.vashya, c),
    girlValue: trMilanTerm(girl.vashya, c),
  });

  // ==========================================
  // 3. तारा (Tara) — 3 Points
  // ==========================================
  const taraBoyToGirl = ((girlNakIdx - boyNakIdx + 27) % 9) + 1;
  const taraGirlToBoy = ((boyNakIdx - girlNakIdx + 27) % 9) + 1;
  const inauspiciousTara = [3, 5, 7];

  const TARA_NAMES_HI: Record<number, string> = {
    1: 'जन्म', 2: 'सम्पत', 3: 'विपत्', 4: 'क्षेम',
    5: 'प्रत्यरि', 6: 'साधक', 7: 'निधन', 8: 'मित्र', 9: 'परम मित्र'
  };
  const TARA_NAMES_GU: Record<number, string> = {
    1: 'જન્મ', 2: 'સંપત', 3: 'વિપત', 4: 'ક્ષેમ',
    5: 'પ્રત્યરિ', 6: 'સાધક', 7: 'નિધન', 8: 'મિત્ર', 9: 'પરમ મિત્ર'
  };
  const TARA_NAMES_EN: Record<number, string> = {
    1: 'Janma', 2: 'Sampat', 3: 'Vipat', 4: 'Kshema',
    5: 'Pratyari', 6: 'Sadhaka', 7: 'Naidhana', 8: 'Mitra', 9: 'Parama Mitra'
  };
  const TARA_NAMES = c === 'en' ? TARA_NAMES_EN : c === 'gu' ? TARA_NAMES_GU : TARA_NAMES_HI;

  const isBoyInauspicious = inauspiciousTara.includes(taraBoyToGirl);
  const isGirlInauspicious = inauspiciousTara.includes(taraGirlToBoy);

  let taraScore = 3;
  let taraNote = '';
  if (!isBoyInauspicious && !isGirlInauspicious) {
    taraScore = 3;
    taraNote = pick(
      'Auspicious Tara from both sides (Kshema/Sadhaka/Mitra/Sampat). Indicates longevity, fortune, and well-being.',
      'બંને તરફથી શુભ તારા (ક્ષેમ/સાધક/મિત્ર/સંપત). દીર્ઘાયુ, ભાગ્યવૃદ્ધિ અને કલ્યાણકારી યોગ.',
      'दोनों तरफ से शुभ तारा (क्षेम/साधक/मित्र/सम्पत)। दीर्घायु, भाग्यवृद्धि व कल्याणकारी योग।'
    );
  } else if (!isBoyInauspicious || !isGirlInauspicious) {
    taraScore = 1.5;
    taraNote = pick(
      'Auspicious Tara from one side and moderate from the other. Balanced Tara purity.',
      'એક પક્ષે તારા શુભ અને બીજા પક્ષે મધ્યમ છે. મધ્યમ તારા શુદ્ધિ પ્રાપ્ત થાય છે.',
      'एक पक्ष से तारा शुभ व दूसरे पक्ष से मध्यम है। मध्यम तारा शुद्धि प्राप्त होती है।'
    );
  } else {
    taraScore = 0;
    taraNote = pick(
      'Vipat/Pratyari/Naidhana Tara from both sides. Mahamrityunjaya Japa is recommended for pacification.',
      'બંને તરફથી વિપત/પ્રત્યરિ/નિધન તારા. તારા દોષ નિવારણ માટે મહામૃત્યુંજય જપ શ્રેયસ્કર છે.',
      'दोनों ओर से विपत्/प्रत्यरि/निधन तारा। तारा दोष निवारण हेतु महामृत्युंजय जप श्रेयस्कर है।'
    );
  }
  const fallbackTara = pick('Tara', 'તારા', 'तारा');
  items.push({
    name: pick('3. Tara (Destiny & Health)', '૩. તારા (Tara)', '३. तारा (Tara)'),
    score: taraScore,
    max: 3,
    note: taraNote,
    boyValue: `${TARA_NAMES[taraBoyToGirl] || fallbackTara} (${taraBoyToGirl})`,
    girlValue: `${TARA_NAMES[taraGirlToBoy] || fallbackTara} (${taraGirlToBoy})`,
  });

  // ==========================================
  // 4. योनि (Yoni) — 4 Points
  // ==========================================
  const isHostileYoni = YONI_ENEMIES.some(
    ([a, b]) => (boy.yoni === a && girl.yoni === b) || (boy.yoni === b && girl.yoni === a)
  );
  const boyYoniLabel = trMilanTerm(boy.yoni, c);
  const girlYoniLabel = trMilanTerm(girl.yoni, c);

  let yoniScore = 2;
  let yoniNote = '';
  if (boy.yoni === girl.yoni) {
    yoniScore = 4;
    yoniNote = pick(
      'Same Yoni promises peak physical, emotional, and instinctive compatibility.',
      'સમાન યોનિ હોવાથી શ્રેષ્ઠ શારીરિક, માનસિક અને ભાવનાત્મક સુમેળ પ્રાપ્ત થશે.',
      'समान योनि होने से श्रेष्ठतम दैहिक, मानसिक व भावनात्मक सामंजस्य प्राप्त होगा।'
    );
  } else if (isHostileYoni) {
    yoniScore = 0;
    yoniNote = pick(
      `${boyYoniLabel} and ${girlYoniLabel} are mutually inimical Yonis. Differences in intimacy or temperament may arise.`,
      `${boyYoniLabel} અને ${girlYoniLabel} પરસ્પર શત્રુ યોનિ છે. દામ્પત્યમાં આકર્ષણની કમી અથવા ક્લેશની સંભાવના.`,
      `${boy.yoni} व ${girl.yoni} परस्पर शत्रु योनि हैं। दांपत्य में आकर्षण की कमी अथवा कलह की संभावना।`
    );
  } else {
    yoniScore = 2.5;
    yoniNote = pick(
      'Friendly or neutral Yonis ensure satisfactory physical and marital harmony.',
      'મિત્ર અથવા સમ યોનિ હોવાથી સામાન્ય અને સંતોષકારક શારીરિક તથા વૈવાહિક સુમેળ.',
      'मित्र अथवा सम योनि होने से सामान्य व संतोषप्रद शारीरिक एवं वैवाहिक सामंजस्य।'
    );
  }
  items.push({
    name: pick('4. Yoni (Compatibility)', '૪. યોનિ (Yoni)', '४. योनि (Yoni)'),
    score: yoniScore,
    max: 4,
    note: yoniNote,
    boyValue: boyYoniLabel,
    girlValue: girlYoniLabel,
  });

  // ==========================================
  // 5. ग्रह मैत्री (Graha Maitri) — 5 Points
  // ==========================================
  const boyLord = RASHI_LORDS[boyMoonIdx];
  const girlLord = RASHI_LORDS[girlMoonIdx];

  let grahaScore = 3;
  let grahaNote = '';
  if (boyLord === girlLord) {
    grahaScore = 5;
    grahaNote = pick(
      'Same Moon Sign Lord! Highest mental friendship, unity of thought, and enduring affection.',
      'બંનેના રાશિ સ્વામી એક જ ગ્રહ છે! સર્વોચ્ચ મિત્રતા, વિચારોની એકતા અને પ્રગાઢ પ્રેમ.',
      'दोनों के राशि स्वामी एक ही ग्रह हैं! सर्वोच्च मित्रता, विचारों की एकात्मकता व प्रगाढ़ प्रेम।'
    );
  } else {
    const boyRelations = GRAHA_MAITRI_MATRIX[boyLord];
    const girlRelations = GRAHA_MAITRI_MATRIX[girlLord];

    const boyConsidersGirlFriend = boyRelations?.friends.includes(girlLord);
    const girlConsidersBoyFriend = girlRelations?.friends.includes(boyLord);
    const boyConsidersGirlEnemy = boyRelations?.enemies.includes(girlLord);
    const girlConsidersBoyEnemy = girlRelations?.enemies.includes(boyLord);

    if (boyConsidersGirlFriend && girlConsidersBoyFriend) {
      grahaScore = 5;
      grahaNote = pick(
        'Mutual close friends among sign lords. Exceptional family rapport and intellectual alignment.',
        'પરસ્પર અભિન્ન મિત્ર ગ્રહો. પારિવારિક તાલમેલ અને વિચારોની અનુકૂળતા ખૂબ ઉત્તમ.',
        'परस्पर अभिन्न मित्र ग्रह। पारिवारिक तालमेल व विचारों की अनुकूलता बहुत उत्तम।'
      );
    } else if ((boyConsidersGirlFriend && !girlConsidersBoyEnemy) || (girlConsidersBoyFriend && !boyConsidersGirlEnemy)) {
      grahaScore = 4;
      grahaNote = pick(
        'One friendly and one neutral lord creates strong intellectual understanding.',
        'એક મિત્ર અને બીજો સમ ગ્રહ. સારો વૈચારિક સુમેળ રહેશે.',
        'एक मित्र व दूसरा सम ग्रह। अच्छा वैचारिक सामंजस्य रहेगा।'
      );
    } else if (!boyConsidersGirlEnemy && !girlConsidersBoyEnemy) {
      grahaScore = 3;
      grahaNote = pick(
        'Both sign lords are neutral to each other. Moderate friendship and balanced domestic life.',
        'બંને ગ્રહો પરસ્પર સમ (તટસ્થ) છે. મધ્યમ મિત્રતા અને સામાન્ય જીવન રહેશે.',
        'दोनों ग्रह परस्पर सम (तटस्थ) हैं। मध्यम मित्रता व सामान्य जीवन रहेगा।'
      );
    } else if (boyConsidersGirlEnemy && girlConsidersBoyEnemy) {
      grahaScore = 0.5;
      grahaNote = pick(
        'Sign lords are mutual enemies. Differences of opinion are likely without conscious empathy.',
        'બંનેના રાશિ સ્વામી પરસ્પર શત્રુ છે. વૈચારિક મતભેદ થવાની સંભાવના.',
        'दोनों के राशि स्वामी परस्पर शत्रु हैं। वैचारिक मतभेद होने की संभावना।'
      );
    } else {
      grahaScore = 1;
      grahaNote = pick(
        'One-sided enmity and neutral relation. Mild to moderate mental alignment.',
        'એક તરફથી શત્રુતા અને બીજી તરફથી સમ ભાવ. મધ્યમ-ન्यून મિત્રતા.',
        'एक ओर से शत्रुता व दूसरी ओर से सम भाव। मध्यम-न्यून मित्रता।'
      );
    }
  }
  items.push({
    name: pick('5. Graha Maitri (Mental Rapport)', '૫. ગ્રહ મૈત્રી (Graha Maitri)', '५. ग्रह मैत्री (Graha Maitri)'),
    score: grahaScore,
    max: 5,
    note: grahaNote,
    boyValue: `${trRashi(boy.moonRashi, c)} (${trPlanet(boyLord, c)})`,
    girlValue: `${trRashi(girl.moonRashi, c)} (${trPlanet(girlLord, c)})`,
  });

  // ==========================================
  // 6. गण (Gana) — 6 Points
  // ==========================================
  let ganaScore = 6;
  let ganaNote = '';
  let hasGanaDosha = false;
  let isGanaParihar = false;
  let ganaPariharReason = '';
  const boyGanaLabel = trMilanTerm(boy.gana, c);
  const girlGanaLabel = trMilanTerm(girl.gana, c);

  if (boy.gana === girl.gana) {
    ganaScore = 6;
    ganaNote = pick(
      `Identical "${boyGanaLabel}" Gana ensures complete harmony in nature, lifestyle, and values.`,
      `બંનેનો સમાન "${boyGanaLabel}" ગણ હોવાથી સ્વભાવ, રુચિ અને જીવનશૈલીમાં પૂર્ણ સુમેળ રહેશે.`,
      `दोनों का समान "${boy.gana}" गण होने से स्वभाव, रुचि व जीवनशैली में पूर्ण सामंजस्य रहेगा।`
    );
  } else if (
    (boy.gana === 'देव' && girl.gana === 'मनुष्य') ||
    (boy.gana === 'मनुष्य' && girl.gana === 'देव')
  ) {
    ganaScore = 5;
    ganaNote = pick(
      'Deva and Manushya Gana combination brings mutual respect, good values, and happy domesticity.',
      'દેવ અને મનુષ્ય ગણનો ઉત્તમ મેળ. પરસ્પર આદર, સંસ્કાર અને સુખી ગૃહસ્થ જીવન.',
      'देव व मनुष्य गण का उत्तम मेल। परस्पर आदर, संस्कार व सुखी गृहस्थी।'
    );
  } else if (boy.gana === 'राक्षस' && girl.gana === 'देव') {
    ganaScore = 1;
    hasGanaDosha = true;
    ganaNote = pick(
      'Groom Rakshasa and Bride Deva Gana creates contrast in temperament.',
      'વર રાક્ષસ અને કન્યા દેવ ગણ હોવાથી સ્વભાવમાં અંતર રહેશે.',
      'वर राक्षस व कन्या देव गण होने से स्वभाव में अंतर रहेगा।'
    );
  } else if (boy.gana === 'देव' && girl.gana === 'राक्षस') {
    ganaScore = 0;
    hasGanaDosha = true;
    ganaNote = pick(
      'Bride Rakshasa and Groom Deva Gana forms Gana Dosha; the bride has a strong, assertive nature.',
      'કન્યા રાક્ષસ ગણ અને વર દેવ ગણ હોવાથી ગણ દોષ. કન્યાનો સ્વભાવ તીવ્ર અને પ્રભાવશાળી રહેશે.',
      'कन्या राक्षस गण व वर देव गण होने से गण दोष। कन्या का स्वभाव तीव्र व प्रभावशाली रहेगा।'
    );
  } else {
    ganaScore = 0.5;
    hasGanaDosha = true;
    ganaNote = pick(
      'Manushya and Rakshasa Gana combination causes Gana Dosha; patience and mutual understanding are essential.',
      'મનુષ્ય અને રાક્ષસ ગણના મેળાપથી ગણ ભેદ. ધૈર્ય અને પરસ્પર સમજણ જરૂરી.',
      'मनुष्य व राक्षस गण का मेल होने से गण भेद। धैर्य व परस्पर समझ की आवश्यकता।'
    );
  }

  if (hasGanaDosha) {
    if (boyLord === girlLord || GRAHA_MAITRI_MATRIX[boyLord]?.friends.includes(girlLord)) {
      isGanaParihar = true;
      ganaPariharReason = pick(
        'Due to friendly Rashi lords, Gana Dosha is cancelled as per Vedic texts.',
        'રાશિ સ્વામીઓમાં મિત્રતા હોવાથી શાસ્ત્રાનુસાર ગણ દોષનો સ્વતઃ પરિહાર થાય છે.',
        'राशि स्वामियों में मित्रता होने के कारण शास्त्रानुसार गण दोष का स्वतः परिहार हो जाता है।'
      );
      ganaScore = Math.max(ganaScore, 3);
    } else if (boyMoonIdx === girlMoonIdx) {
      isGanaParihar = true;
      ganaPariharReason = pick(
        'Same Moon Rashi cancels Gana Dosha according to classical principles.',
        'સમાન રાશિ હોવાથી ગણ દોષનો પરિહાર શાસ્ત્રસંમત છે.',
        'समान राशि होने से गण दोष का परिहार शास्त्रसम्मत है।'
      );
      ganaScore = Math.max(ganaScore, 4);
    }
  }

  items.push({
    name: pick('6. Gana (Temperament)', '૬. ગણ (Gana)', '६. गण (Gana)'),
    score: ganaScore,
    max: 6,
    note: isGanaParihar ? `${ganaNote} (${ganaPariharReason})` : ganaNote,
    boyValue: boyGanaLabel,
    girlValue: girlGanaLabel,
  });

  // ==========================================
  // 7. भकूट (Bhakoot) — 7 Points
  // ==========================================
  const diffRashi = ((girlMoonIdx - boyMoonIdx + 12) % 12) + 1;
  const isBhakootDosha = [2, 6, 8, 12].includes(diffRashi);
  let bhakootScore = isBhakootDosha ? 0 : 7;
  let bhakootNote = '';
  let relationType = pick('Auspicious Relation', 'શુભ સંબંધ', 'शुभ संबंध');
  const hasBhakoot = isBhakootDosha;
  let isBhakootParihar = false;
  let bhakootPariharReason = '';
  let bhakootRemedy = '';

  if (diffRashi === 6 || diffRashi === 8) {
    relationType = pick('Shadashtaka (6-8) Relation', 'ષડાષ્ટક (૬-૮) સંબંધ', 'षडाष्टक (६-८) संबंध');
    bhakootNote = pick(
      '6-8 placement causes Bhakoot Dosha indicating health hurdles or friction.',
      'ષડાષ્ટક સંબંધ હોવાથી સ્વાસ્થ્ય બાધા અને ક્લેશની આશંકા (ભકૂટ દોષ).',
      'षडाष्टक संबंध होने से स्वास्थ्य बाधा व क्लेश की आशंका (भकूट दोष)।'
    );
  } else if (diffRashi === 2 || diffRashi === 12) {
    relationType = pick('Dwirdwadasha (2-12) Relation', 'દ્વિર્દ્વાદશ (૨-૧૨) સંબંધ', 'द्विर्द्वादश (२-१२) संबंध');
    bhakootNote = pick(
      '2-12 placement causes Bhakoot Dosha indicating excess expenditure or financial strain.',
      'દ્વિર્દ્વાદશ સંબંધ હોવાથી વધુ પડતો ખર્ચ અને ધન હાનિની આશંકા (ભકૂટ દોષ).',
      'द्विर्द्वादश संबंध होने से अत्यधिक व्यय व धन हानि की आशंका (भकूट दोष)।'
    );
  } else if (diffRashi === 9 || diffRashi === 5) {
    relationType = pick('Navapanchama (9-5) Relation', 'નવપંચમ (૯-૫) સંબંધ', 'नवपंचम (९-५) संबंध');
    bhakootScore = 7;
    bhakootNote = pick(
      '9-5 trine placement blesses dharma, progeny, wisdom, and deep mutual respect.',
      'નવપંચમ સંબંધ હોવાથી ધર્મ, સંતાન, વિદ્યા અને પરસ્પર આદરમાં અત્યધિક વૃદ્ધિ.',
      'नवपंचम संबंध होने से धर्म, संतान, विद्या व परस्पर आदर में अत्यधिक वृद्धि।'
    );
  } else {
    bhakootScore = 7;
    bhakootNote = pick(
      'Auspicious mutual sign placement grants marital bliss, lineage growth, and prosperity.',
      'પરસ્પર શુભ ભાવ સંબંધ હોવાથી ઉત્તમ દામ્પત્ય, વંશ વૃદ્ધિ અને સુખ-સમૃદ્ધિ.',
      'परस्पर शुभ भाव संबंध होने से उत्तम दांपत्य, वंश वृद्धि व सुख-समृद्धि।'
    );
  }

  if (isBhakootDosha) {
    if (boyLord === girlLord) {
      isBhakootParihar = true;
      bhakootPariharReason = pick(
        'Both Moon signs share the same planetary lord, completely cancelling Bhakoot Dosha.',
        'બંને રાશિઓના સ્વામી એક જ ગ્રહ હોવાથી ભકૂટ દોષનો સંપૂર્ણ પરિહાર થઈ ગયો છે.',
        'दोनों राशियों के स्वामी एक ही ग्रह होने से भकूट दोष का पूर्णतः परिहार हो गया है।'
      );
      bhakootScore = 7;
    } else if (
      GRAHA_MAITRI_MATRIX[boyLord]?.friends.includes(girlLord) &&
      GRAHA_MAITRI_MATRIX[girlLord]?.friends.includes(boyLord)
    ) {
      isBhakootParihar = true;
      bhakootPariharReason = pick(
        'Both sign lords are mutual fast friends, neutralizing Bhakoot Dosha.',
        'બંને રાશિ સ્વામીઓમાં પરસ્પર પરમ મિત્રતા હોવાથી ભકૂટ દોષ નિષ્પ્રભાવી થઈ જાય છે.',
        'दोनों राशि स्वामियों में परस्पर परम मित्रता होने से भकूट दोष निष्प्रभावी हो जाता है।'
      );
      bhakootScore = 5;
    } else {
      bhakootRemedy = pick(
        `To pacify Bhakoot Dosha arising from ${relationType}, perform Go-daan, feed Brahmins, or perform Shiva Rudrabhishek before marriage.`,
        `${relationType} જનિત ભકૂટ દોષ શાંતિ માટે લગ્ન પહેલાં ગૌદાન, બ્રાહ્મણ ભોજન અથવા ભગવાન શિવનો રુદ્રાભિષેક કરાવો.`,
        `${relationType} जनित भकूट दोष शांति हेतु विवाह पूर्व गोदान, ब्राह्मण भोजन अथवा भगवान शिव का रुद्राभिषेक कराएं।`
      );
    }
  }

  items.push({
    name: pick('7. Bhakoot (Love & Prosperity)', '૭. ભકૂટ (Bhakoot)', '७. भकूट (Bhakoot)'),
    score: bhakootScore,
    max: 7,
    note: isBhakootParihar ? `${bhakootNote} (${bhakootPariharReason})` : bhakootNote,
    boyValue: `${trRashi(boy.moonRashi, c)} (${boyMoonIdx + 1})`,
    girlValue: `${trRashi(girl.moonRashi, c)} (${girlMoonIdx + 1})`,
  });

  // ==========================================
  // 8. नाड़ी (Nadi) — 8 Points
  // ==========================================
  const isNadiDosha = boy.nadi === girl.nadi;
  let nadiScore = isNadiDosha ? 0 : 8;
  let nadiNote = '';
  let isNadiParihar = false;
  let nadiPariharReason = '';
  let nadiRemedy = '';
  const boyNadiLabel = trMilanTerm(boy.nadi, c);
  const girlNadiLabel = trMilanTerm(girl.nadi, c);

  if (!isNadiDosha) {
    nadiScore = 8;
    nadiNote = pick(
      'Different Nadis (Adi/Madhya/Antya). Free from Nadi Dosha—excellent health, longevity, and bright progeny.',
      'બંનેની નાડી ભિન્ન છે (આદિ/મધ્ય/અંત્ય). નાડી દોષ રહિત શ્રેષ્ઠ મિલાપ. ઉત્તમ સ્વાસ્થ્ય, દીર્ઘાયુ અને તેજસ્વી સંતાન યોગ.',
      'दोनों की नाड़ी भिन्न है (आदि/मध्य/अन्त्य)। नाड़ी दोष रहित श्रेष्ठ मिलान। उत्तम स्वास्थ्य, दीर्घायु व तेजस्वी संतान योग।'
    );
  } else {
    if (boy.nakshatra !== girl.nakshatra) {
      isNadiParihar = true;
      nadiPariharReason = pick(
        'Although Nadis are identical, different birth Nakshatras cancel Nadi Dosha per Shastras.',
        'જોકે નાડી એક છે, પરંતુ બંનેના જન્મ નક્ષત્ર ભિન્ન હોવાથી શાસ્ત્રાનુસાર નાડી દોષનો પરિહાર થાય છે.',
        'यद्यपि नाड़ी एक है, किन्तु दोनों के जन्म नक्षत्र भिन्न होने से शास्त्रानुसार नाड़ी दोष का परिहार हो जाता है।'
      );
      nadiScore = 6;
      nadiNote = pick(
        `Same ${boyNadiLabel} Nadi, cancelled due to different Nakshatras.`,
        `સમાન ${boyNadiLabel} નાડી, પરંતુ ભિન્ન નક્ષત્ર હોવાથી પરિહાર પ્રાપ્ત.`,
        `समान ${boy.nadi} नाड़ी, पर भिन्न नक्षत्र होने से परिहार प्राप्त।`
      );
    } else if (boy.charan !== girl.charan) {
      isNadiParihar = true;
      nadiPariharReason = pick(
        'Different Nakshatra Charan (Pada) mitigates Nadi Dosha even in the same Nakshatra.',
        'સમાન નક્ષત્ર હોવા છતાં નક્ષત્ર ચરણ ભિન્ન હોવાથી નાડી દોષમાં પરિહાર લાગુ થાય છે.',
        'समान नक्षत्र होने पर भी नक्षत्र चरण भिन्न होने से नाड़ी दोष में परिहार लागू होता है।'
      );
      nadiScore = 5;
      nadiNote = pick(
        'Same Nakshatra, mitigated by different Charan (Pada).',
        'સમાન નક્ષત્ર ચરણ ભેદથી પરિહાર.',
        'समान नक्षत्र चरण भेद से परिहार।'
      );
    } else {
      nadiScore = 0;
      nadiNote = pick(
        `Same ${boyNadiLabel} Nadi and same Nakshatra create Full Nadi Dosha. Health or progeny delays possible.`,
        `સમાન ${boyNadiLabel} નાડી અને સમાન નક્ષત્ર હોવાથી "પૂર્ણ નાડી દોષ". સંતાન અને સ્વાસ્થ્ય સંબંધી અડચણો સંભવ.`,
        `समान ${boy.nadi} नाड़ी व समान नक्षत्र होने से "पूर्ण नाड़ी दोष"। संतान व स्वास्थ्य संबंधी बाधाएं संभव।`
      );
      nadiRemedy = pick(
        'Perform proper "Nadi Dosha Shanti", Swarna-daan, and Mahamrityunjaya Anushthana through a learned priest prior to marriage.',
        'લગ્ન પહેલાં વિદ્વાન બ્રાહ્મણ દ્વારા વિધિવત "નાડી દોષ શાંતિ", સુવર્ણ દાન અને મહામૃત્યુંજય અનુષ્ઠાન અવશ્ય કરાવો.',
        'विवाह पूर्व विद्वान ब्राह्मण द्वारा विधिवत "नाड़ी दोष शांति", स्वर्ण दान एवं महामृत्युंजय अनुष्ठान अवश्य कराएं।'
      );
    }
  }

  items.push({
    name: pick('8. Nadi (Health & Progeny)', '૮. નાડી (Nadi)', '८. नाड़ी (Nadi)'),
    score: nadiScore,
    max: 8,
    note: isNadiParihar ? `${nadiNote} (${nadiPariharReason})` : nadiNote,
    boyValue: `${boyNadiLabel} ${pick('Nadi', 'નાડી', 'नाड़ी')}`,
    girlValue: `${girlNadiLabel} ${pick('Nadi', 'નાડી', 'नाड़ी')}`,
  });

  // Calculate Total Score
  const totalScore = items.reduce((sum, item) => sum + item.score, 0);

  // Manglik Evaluation
  const boyManglik = checkManglik(boy, c);
  const girlManglik = checkManglik(girl, c);

  let isManglikCancelled = false;
  let cancellationReason = '';
  let manglikVerdict = '';

  if (boyManglik.isManglik && girlManglik.isManglik) {
    isManglikCancelled = true;
    cancellationReason = pick(
      'Both horoscopes have Manglik Yoga, creating "Bhauma Dosha Samya" (mutual cancellation). Marriage is completely auspicious.',
      'વર અને કન્યા બંનેની કુંડળીઓ માંગલિક હોવાથી શાસ્ત્રાનુસાર "ભૌમ-દોષ સામ્ય" (દોષ પરિહાર) થઈ ગયો છે. આથી લગ્ન પૂર્ણતઃ શાસ્ત્રસંમત અને શુભ છે.',
      'वर और कन्या दोनों की कुण्डलियाँ मांगलिक होने से शास्त्रानुसार "भौम-दोष साम्य" (दोष परिहार) हो गया है। अतः विवाह पूर्णतः शास्त्रसम्मत व शुभ है।'
    );
    manglikVerdict = pick('Dosha Cancelled (Mutual Manglik Balance)', 'દોષ પરિહાર (કુજ દોષ સામ્ય)', 'दोष परिहार (कुज दोष साम्य)');
  } else if (!boyManglik.isManglik && !girlManglik.isManglik) {
    isManglikCancelled = true;
    cancellationReason = pick(
      'Both natives are completely free from Manglik Dosha.',
      'બંને જાતકો માંગલિક દોષથી સંપૂર્ણપણે મુક્ત છે.',
      'दोनों ही जातक मांगलिक दोष से पूर्णतः मुक्त हैं।'
    );
    manglikVerdict = pick('Free from Manglik Dosha', 'માંગલિક દોષ રહિત', 'मांगलिक दोष रहित');
  } else {
    isManglikCancelled = false;
    manglikVerdict = boyManglik.isManglik
      ? pick('Groom Manglik (Bride Non-Manglik)', 'વર માંગલિક (કન્યા અમંગલીય)', 'वर मांगलिक (कन्या अमंगलीय)')
      : pick('Bride Manglik (Groom Non-Manglik)', 'કન્યા માંગલિક (વર અમંગલીય)', 'कन्या मांगलिक (वर अमंगलीय)');
    cancellationReason = pick(
      'When only one partner is Manglik, Jupiter aspecting Mars or pre-marital Kumbha-Vivah / Arka-Vivah and Mahamrityunjaya Japa pacifies the dosha.',
      'એક પક્ષ માંગલિક હોય ત્યારે ગુરુની મંગળ પર દૃષ્ટિ, અથવા લગ્ન પહેલાં કુંભ-વિવાહ / અર્ક-વિવાહ તથા મહામૃત્યુંજય જપ દ્વારા દોષ શમન થાય છે.',
      'एक पक्ष मांगलिक होने की स्थिति में गुरु की मंगल पर दृष्टि, अथवा विवाह पूर्व कुम्भ-विवाह / अर्क-विवाह एवं महामृत्युंजय जप द्वारा दोष शमन किया जाता है।'
    );
  }

  let verdict = '';
  let verdictGrade: MilanEvaluationResult['verdictGrade'] = 'excellent';

  if (totalScore >= 28) {
    verdict = pick(
      `Supreme & Highly Auspicious Match (${totalScore}/36 Gunas). Married life will be joyous, prosperous, and long-lasting.`,
      `અતિ ઉત્તમ અને સર્વશ્રેષ્ઠ મિલાપ (${totalScore}/36 ગુણ). દામ્પત્ય જીવન અત્યંત સુખમય, સમૃદ્ધ અને દીર્ઘાયુ રહેશે.`,
      `अति उत्तम व सर्वश्रेष्ठ मिलान (${totalScore}/36 गुण)। दांपत्य जीवन अत्यंत सुखमय, समृद्ध व दीर्घायु रहेगा।`
    );
    verdictGrade = 'excellent';
  } else if (totalScore >= 21) {
    verdict = pick(
      `Auspicious & Favorable Match (${totalScore}/36 Gunas). Recommended and scripturally approved for marriage.`,
      `શુભ અને અનુકૂળ મિલાપ (${totalScore}/36 ગુણ). લગ્ન માટે શાસ્ત્રસંમત અને પ્રશસ્ત છે.`,
      `शुभ एवं अनुकूल मिलान (${totalScore}/36 गुण)। विवाह के लिए शास्त्रसम्मत व प्रशस्त है।`
    );
    verdictGrade = 'good';
  } else if (totalScore >= 18) {
    verdict = pick(
      `Moderate Match — Acceptable (${totalScore}/36 Gunas). Marriage can proceed with recommended Vedic remedies.`,
      `મધ્યમ મિલાપ — લગ્ન યોગ્ય (${totalScore}/36 ગુણ). આવશ્યક ઉપાયો સાથે લગ્ન કરી શકાય છે.`,
      `मध्यम मिलान — विवाह योग्य (${totalScore}/36 गुण)। आवश्यक उपायों के साथ विवाह किया जा सकता है।`
    );
    verdictGrade = 'average';
  } else {
    verdict = pick(
      `Incompatible / Dosha-Prone Match (${totalScore}/36 Gunas). Below 18 Gunas; not recommended without thorough Dosha cancellation & remedies.`,
      `અસ્વીકાર્ય / દોષયુક્ત મિલાપ (${totalScore}/36 ગુણ). 18થી ઓછા ગુણ અને દોષ નિવારણ વગર લગ્ન અનુશંસિત નથી.`,
      `अस्वीकार्य / दोषयुक्त मिलान (${totalScore}/36 गुण)। 18 से कम गुण मिलने व दोष निवारण के बिना विवाह अनुशंसित नहीं है।`
    );
    verdictGrade = 'poor';
  }

  const auspiciousRemedies: string[] = [];
  if (nadiRemedy) auspiciousRemedies.push(nadiRemedy);
  if (bhakootRemedy) auspiciousRemedies.push(bhakootRemedy);
  if (!isManglikCancelled) {
    auspiciousRemedies.push(pick(
      'To pacify Manglik Dosha, recite Shri Hanuman Chalisa and Mangal Chandika Stotra daily.',
      'માંગલિક દોષ શમન માટે નિત્ય શ્રી હનુમાન ચાલીસાનો પાઠ કરો અને મંગળ ચંડિકા સ્તોત્ર વાંચો.',
      'मांगलिक दोष शमन हेतु नित्य श्री हनुमान चालीसा का पाठ करें और मंगल चंडिका स्तोत्र पढ़ें।'
    ));
  }
  auspiciousRemedies.push(pick(
    'Seek blessings and perform Kuladevi/Kuladevata puja prior to marriage ceremonies.',
    'લગ્ન પહેલાં કુળદેવી/કુળદેવતાનું પૂજન અને આશીર્વાદ અવશ્ય ગ્રહણ કરો.',
    'विवाह पूर्व कुलदेवी/कुलदेवता का पूजन व आशीर्वाद अवश्य ग्रहण करें।'
  ));
  auspiciousRemedies.push(pick(
    'Wearing Gauri-Shankar Rudraksha or joint worship of Shiva-Parvati strengthens lifelong marital harmony.',
    'ગૌરી-શંકર રુદ્રાક્ષ અથવા શિવ-પાર્વતીની સંયુક્ત આરાધનાથી દામ્પત્યમાં અગાધ પ્રેમ જળવાઈ રહે છે.',
    'गौरी-शंकर रुद्राक्ष अथवा शिव-पार्वती की संयुक्त आराधना से दांपत्य में अगाध प्रेम बना रहता है।'
  ));

  // Rajju & Vedha Evaluation
  const RAJJU_GROUPS_HI = ['पाद रज्जु', 'कटि रज्जु', 'नाभि रज्जु', 'कण्ठ रज्जु', 'शिरो रज्जु'];
  const RAJJU_GROUPS_GU = ['પાદ રજ્જુ', 'કટિ રજ્જુ', 'નાભિ રજ્જુ', 'કંઠ રજ્જુ', 'શિરો રજ્જુ'];
  const RAJJU_GROUPS_EN = ['Pada Rajju (Feet)', 'Kati Rajju (Waist)', 'Nabhi Rajju (Navel)', 'Kantha Rajju (Throat)', 'Shiro Rajju (Head)'];
  const RAJJU_GROUPS = c === 'en' ? RAJJU_GROUPS_EN : c === 'gu' ? RAJJU_GROUPS_GU : RAJJU_GROUPS_HI;

  const getRajju = (nak: number) => {
    const pos = nak % 9;
    if (pos === 0 || pos === 8) return RAJJU_GROUPS[0];
    if (pos === 1 || pos === 7) return RAJJU_GROUPS[1];
    if (pos === 2 || pos === 6) return RAJJU_GROUPS[2];
    if (pos === 3 || pos === 5) return RAJJU_GROUPS[3];
    return RAJJU_GROUPS[4];
  };
  const boyRajju = getRajju(boyNakIdx >= 0 ? boyNakIdx : 0);
  const girlRajju = getRajju(girlNakIdx >= 0 ? girlNakIdx : 0);
  const hasRajjuDosha = boyRajju === girlRajju && boyLord !== girlLord;

  const VEDHA_PAIRS: [number, number][] = [
    [0, 17], [1, 16], [2, 15], [3, 14], [5, 21],
    [6, 20], [7, 19], [8, 18], [9, 26], [10, 25],
    [11, 24], [12, 23], [4, 22],
  ];
  const hasVedhaDosha = VEDHA_PAIRS.some(
    ([a, b]) => (boyNakIdx === a && girlNakIdx === b) || (boyNakIdx === b && girlNakIdx === a)
  );

  let rajjuVedhaNote = pick(
    'Free from Rajju & Vedha Dosha — strong marital longevity and fortune.',
    'રજ્જુ અને વેધ દોષથી મુક્ત — વૈવાહિક આયુષ્ય અને સૌભાગ્ય સુદૃઢ છે.',
    'रज्जु एवं वेध दोष से मुक्त — वैवाहिक आयुष्य व सौभाग्य सुदृढ़ है।'
  );
  if (hasVedhaDosha) {
    rajjuVedhaNote = pick(
      'Nakshatra Vedha Dosha is present; Nakshatra Shanti Puja before marriage is advisable.',
      'નક્ષત્ર વેધ દોષ ઉપસ્થિત છે; લગ્ન પહેલાં નક્ષત્ર શાંતિ પૂજન કરાવવું શ્રેયસ્કર છે.',
      'नक्षत्र वेध दोष उपस्थित है; विवाह पूर्व नक्षत्र शांति पूजन कराना श्रेयस्कर है।'
    );
  } else if (hasRajjuDosha) {
    rajjuVedhaNote = pick(
      `Both share "${boyRajju}" (Rajju Samya), though Graha Maitri/Tara purity offers mitigation.`,
      `બંનેનું "${boyRajju}" સમાન હોવાથી રજ્જુ સામ્ય છે, પરંતુ ગ્રહ મૈત્રી/તારા શુદ્ધિથી પરિહાર સંભવ છે.`,
      `दोनों का "${boyRajju}" समान होने से रज्जु साम्य है, किंतु ग्रह मैत्री/तारा शुद्धि से परिहार संभव है।`
    );
  }

  return {
    totalScore,
    maxScore: 36,
    verdictGrade,
    verdict,
    items,
    manglikAnalysis: {
      isCancelled: isManglikCancelled,
      verdict: manglikVerdict,
      boyStatus: boyManglik.isManglik ? pick('Manglik', 'માંગલિક', 'मांगलिक') : pick('Non-Manglik', 'અમંગલીય', 'अमंगलीय'),
      girlStatus: girlManglik.isManglik ? pick('Manglik', 'માંગલિક', 'मांगलिक') : pick('Non-Manglik', 'અમંગલીય', 'अमंगलीय'),
      boyHouses: boyManglik.houses,
      girlHouses: girlManglik.houses,
      boyNote: boyManglik.note,
      girlNote: girlManglik.note,
      cancellationReason,
    },
    nadiDosha: {
      hasDosha: isNadiDosha,
      boyNadi: boyNadiLabel,
      girlNadi: girlNadiLabel,
      isPariharApplicable: isNadiParihar,
      pariharReason: nadiPariharReason,
      remedy: nadiRemedy,
    },
    bhakootDosha: {
      hasDosha: hasBhakoot,
      relationType,
      diffRashi,
      boyRashi: trRashi(boy.moonRashi, c),
      girlRashi: trRashi(girl.moonRashi, c),
      isPariharApplicable: isBhakootParihar,
      pariharReason: bhakootPariharReason,
      remedy: bhakootRemedy,
    },
    ganaDosha: {
      hasDosha: hasGanaDosha,
      boyGana: boyGanaLabel,
      girlGana: girlGanaLabel,
      isPariharApplicable: isGanaParihar,
      pariharReason: ganaPariharReason,
    },
    rajjuVedha: {
      boyRajju,
      girlRajju,
      hasRajjuDosha,
      hasVedhaDosha,
      note: rajjuVedhaNote,
    },
    conclusion: `${verdict} ${
      isManglikCancelled
        ? pick('Manglik Dosha cancellation applies.', 'માંગલિક દોષનો પરિહાર ઉપલબ્ધ છે.', 'मांगलिक दोष का परिहार उपलब्ध है।')
        : pick('Manglik Dosha pacification is advised.', 'માંગલિક દોષ નિવારણ આવશ્યક છે.', 'मांगलिक दोष निवारण आवश्यक है।')
    }`,
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
  isManglik: boolean = false,
  charan: number = 1,
  lagnaRashiIdx?: number,
  lang: string = 'hi'
): KundaliData {
  const c = (lang || 'hi').slice(0, 2).toLowerCase();
  const varna = getVarna(rashiIdx);
  const vashya = RASHI_VASHYAS[rashiIdx] || 'मानव';
  const gana = NAKSHATRA_GANAS[nakIdx] || 'देव';
  const yoni = NAKSHATRA_YONIS[nakIdx] || 'अश्व';
  const nadi = NAKSHATRA_NADIS[nakIdx] || 'मध्य';
  const effectiveLagnaIdx = typeof lagnaRashiIdx === 'number' ? lagnaRashiIdx : rashiIdx;
  const marsHouse = isManglik ? 7 : 3;
  const moonHouse = ((rashiIdx - effectiveLagnaIdx + 12) % 12) + 1;
  const safeCharan = Math.max(1, Math.min(4, charan));

  return {
    name: name.trim() || (c === 'en' ? 'Native' : c === 'gu' ? 'જાતક' : 'जातक'),
    birthDate: new Date(),
    birthTime: '12:00',
    birthPlace: c === 'en' ? 'India' : c === 'gu' ? 'ભારત' : 'भारत',
    latitude: 23.1765,
    longitude: 75.7885,
    timezoneHours: 5.5,
    lagnaDegree: effectiveLagnaIdx * 30 + 15,
    lagnaRashi: RASHIS[effectiveLagnaIdx],
    lagnaRashiNumber: effectiveLagnaIdx + 1,
    moonRashi: RASHIS[rashiIdx],
    sunRashi: RASHIS[rashiIdx],
    nakshatra: NAKSHATRAS[nakIdx],
    charan: String(safeCharan),
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
        house: moonHouse,
        rashi: RASHIS[rashiIdx],
        rashiNumber: rashiIdx + 1,
        isRetrograde: false,
        latitude: 0,
        speed: 13.2,
        nakshatra: NAKSHATRAS[nakIdx],
        pada: safeCharan,
      },
      {
        planet: 'मंगल',
        englishName: 'Mars',
        degree: ((effectiveLagnaIdx + marsHouse - 1) % 12) * 30 + 15,
        degreeInRashi: 15,
        house: marsHouse,
        rashi: RASHIS[(effectiveLagnaIdx + marsHouse - 1) % 12],
        rashiNumber: ((effectiveLagnaIdx + marsHouse - 1) % 12) + 1,
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
