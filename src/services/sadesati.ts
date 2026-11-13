/**
 * शनि साढ़े साती एवं दैनिक गोचर (Planetary Transits & Shani Sade Sati Tracker)
 * Vedic Astrological Calculations for Shani Sade Sati, Kantaka Shani, Ashtama Shani,
 * and current planetary transits with respect to natal Moon and Lagna.
 */

import { KundaliData } from '../types';
import { RASHIS, calculatePlanetPositions } from './astronomy';
import { trRashi } from '../i18n/vedicTranslate';

export interface SadeSatiPhase {
  phase: 'rising' | 'peak' | 'setting';
  name: string;
  hindiName: string;
  shaniRashi: string;
  startApprox: string;
  endApprox: string;
  isActive: boolean;
  intensity: string;
  description: string;
  bodyImpact: string;
}

export interface SadeSatiStatus {
  isUnderSadeSati: boolean;
  isDhaiya: boolean;
  activePhase?: SadeSatiPhase;
  phaseNumber: number; // 0 = none, 1 = first/rising, 2 = second/peak, 3 = third/setting
  dhaiyaType?: string;
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
  nature: string;
  prediction: string;
}

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

const INGRESS_MONTHS_EN: Record<string, string> = {
  'जन': 'Jan',
  'फर': 'Feb',
  'मार्च': 'Mar',
  'अप्रैल': 'Apr',
  'मई': 'May',
  'जुल': 'Jul',
  'अग': 'Aug',
  'अक्टू': 'Oct',
  'नवं': 'Nov',
};

const INGRESS_MONTHS_GU: Record<string, string> = {
  'जन': 'જાન્યુ',
  'फर': 'ફેબ્રુ',
  'मार्च': 'માર્ચ',
  'अप्रैल': 'એપ્રિલ',
  'मई': 'મે',
  'जुल': 'જુલાઈ',
  'अग': 'ઓગસ્ટ',
  'अक्टू': 'ઓક્ટો',
  'नवं': 'નવે',
};

function fmtIngressDate(raw: string, c: string): string {
  if (c === 'hi') return raw;
  const map = c === 'en' ? INGRESS_MONTHS_EN : INGRESS_MONTHS_GU;
  let out = raw;
  for (const [hiTok, locTok] of Object.entries(map)) {
    if (out.includes(hiTok)) out = out.replace(hiTok, locTok);
  }
  return out;
}

const TRANSIT_PREDICTIONS: Record<
  string,
  Record<number, { key: 'shubh' | 'ashubh' | 'sama'; hi: string; en: string; gu: string }>
> = {
  सूर्य: {
    1: { key: 'ashubh', hi: 'स्थान हानि, नेत्र पीड़ा, थकान व व्यर्थ भागदौड़।', en: 'Change of place, eye strain, fatigue, and unnecessary exertion.', gu: 'સ્થાન હાનિ, આંખોમાં થાક, અશાંતિ અને વ્યર્થ દોડધામ.' },
    2: { key: 'ashubh', hi: 'आर्थिक व्यय, कुटुम्ब में मतभेद, वाणी में कटुता।', en: 'Financial outflow, family disagreements, sharp speech.', gu: 'આર્થિક ખર્ચ, પરિવારમાં મતભેદ અને વાણીમાં કટુતા.' },
    3: { key: 'shubh', hi: 'शत्रु विजय, पदोन्नति, साहस व पराक्रम में वृद्धि।', en: 'Victory over rivals, promotion, heightened courage and valor.', gu: 'શત્રુ વિજય, બઢતી, સાહસ અને પરાક્રમમાં વૃદ્ધિ.' },
    4: { key: 'ashubh', hi: 'पारिवारिक तनाव, माता के स्वास्थ्य की चिंता, भूमि-भवन विवाद।', en: 'Domestic tension, concern for mother’s health, property disputes.', gu: 'પારિવારિક તણાવ, માતાના સ્વાસ્થ્યની ચિંતા, જમીન-મકાન વિવાદ.' },
    5: { key: 'ashubh', hi: 'संतान को कष्ट, मानसिक उद्वेग, बुद्धि भ्रम।', en: 'Concern regarding children, mental restlessness, clouded judgment.', gu: 'સંતાન સંબંધી ચિંતા, માનસિક ઉદ્વેગ અને બુદ્ધિ ભ્રમ.' },
    6: { key: 'shubh', hi: 'शत्रु परास्त, ऋण मुक्ति, रोग निवारण व आरोग्य लाभ।', en: 'Defeat of opponents, debt relief, recovery and vitality.', gu: 'શત્રુ પરાસ્ત, ઋણ મુક્તિ, રોગ નિવારણ અને આરોગ્ય લાભ.' },
    7: { key: 'ashubh', hi: 'दांपत्य में मतभेद, जीवनसाथी का स्वास्थ्य, यात्रा में कष्ट।', en: 'Spousal friction, partner’s health care, travel discomfort.', gu: 'દામ્પત્યમાં મતભેદ, જીવનસાથીનું સ્વાસ્થ્ય અને મુસાફરીમાં કષ્ટ.' },
    8: { key: 'ashubh', hi: 'आकस्मिक बाधाएं, सरकारी कार्य में रुकावट, उदर विकार।', en: 'Sudden hurdles, delays in official work, digestive sensitivity.', gu: 'આકસ્મિક અડચણો, સરકારી કામમાં રૂકાવટ અને પેટની તકલીફ.' },
    9: { key: 'ashubh', hi: 'भाग्य में विलंब, पिता से वैचारिक मतभेद, धर्म में उदासीनता।', en: 'Delayed luck, differences with father, spiritual restlessness.', gu: 'ભાગ્યમાં વિલંબ, પિતા સાથે વૈચારિક મતભેદ અને ધર્મમાં ઉદાસીનતા.' },
    10: { key: 'shubh', hi: 'कार्य सिद्धि, राजकीय सम्मान, मान-प्रतिष्ठा व व्यापार विस्तार।', en: 'Task accomplishment, official honor, prestige, and business expansion.', gu: 'કાર્ય સિદ્ધિ, રાજકીય સન્માન, માન-પ્રતિષ્ઠા અને વેપાર વિસ્તાર.' },
    11: { key: 'shubh', hi: 'प्रचुर धन लाभ, मित्रों से सहयोग, समस्त मनोरथ पूर्ण।', en: 'Abundant financial gains, support from friends, fulfilled desires.', gu: 'પ્રચુર ધન લાભ, મિત્રોનો સહયોગ અને તમામ મનોરથ પૂર્ણ.' },
    12: { key: 'ashubh', hi: 'अनावश्यक धन व्यय, अनिद्रा, नेत्र कष्ट व विदेश गमन।', en: 'Unplanned expenses, disturbed sleep, eye strain, distant travel.', gu: 'બિનજરૂરી ખર્ચ, અનિદ્રા, આંખની તકલીફ અને વિદેશ ગમન.' },
  },
  गुरु: {
    1: { key: 'ashubh', hi: 'स्थान परिवर्तन, व्यर्थ की चिंताएं व मान-हानि का भय।', en: 'Relocation, unnecessary worries, and concern over reputation.', gu: 'સ્થાન પરિવર્તન, વ્યર્થ ચિંતાઓ અને માન-હાનિનો ભય.' },
    2: { key: 'shubh', hi: 'अखंड धन लाभ, कुटुंब में मांगलिक उत्सव, मधुर वाणी।', en: 'Sustained wealth gains, auspicious family celebrations, sweet speech.', gu: 'અખંડ ધન લાભ, પરિવારમાં માંગલિક ઉત્સવ અને મધુર વાણી.' },
    3: { key: 'ashubh', hi: 'सहोदरो से मतभेद, कार्यों में विघ्न व पराक्रम में कमी।', en: 'Differences with siblings, minor obstacles, dip in initiative.', gu: 'ભાઈ-બહેનો સાથે મતભેદ, કાર્યોમાં વિઘ્ન અને પરાક્રમમાં કમી.' },
    4: { key: 'ashubh', hi: 'स्वजनों से विरोध, मातृ कष्ट, गृह क्लेश।', en: 'Friction with relatives, concern for mother, domestic unrest.', gu: 'સ્વજનો સાથે વિરોધ, માતૃ કષ્ટ અને ગૃહ ક્લેશ.' },
    5: { key: 'shubh', hi: 'संतान प्राप्ति, उच्च विद्या, बुद्धि प्रखरता व राजकृपा।', en: 'Progeny joy, higher learning, sharp intellect, and official favor.', gu: 'સંતાન સુખ, ઉચ્ચ વિદ્યા, બુદ્ધિ પ્રખરતા અને રાજકૃપા.' },
    6: { key: 'ashubh', hi: 'शत्रु भय, स्वास्थ्य में नरमी, ऋण वृद्धि।', en: 'Rival pressure, mild health dip, careful debt control needed.', gu: 'શત્રુ ભય, સ્વાસ્થ્યમાં નરમાશ અને ઋણ વૃદ્ધિ.' },
    7: { key: 'shubh', hi: 'वैवाहिक सुख, साझेदारी में लाभ, यात्राएं सफल।', en: 'Marital harmony, profitable partnerships, successful journeys.', gu: 'વૈવાહિક સુખ, ભાગીદારીમાં લાભ અને મુસાફરી સફળ.' },
    8: { key: 'ashubh', hi: 'शारीरिक कष्ट, अपयश का भय, कार्य में गतिरोध।', en: 'Physical fatigue, fear of blame, slow progress in tasks.', gu: 'શારીરિક કષ્ટ, અપયશનો ભય અને કાર્યમાં ગતિરોધ.' },
    9: { key: 'shubh', hi: 'सर्वतोमुखी भाग्योदय, तीर्थ यात्रा, गुरु कृपा व प्रतिष्ठा।', en: 'All-round rise of fortune, pilgrimage, mentor grace, and prestige.', gu: 'સર્વાંગી ભાગ્યોદય, તીર્થ યાત્રા, ગુરુ કૃપા અને પ્રતિષ્ઠા.' },
    10: { key: 'ashubh', hi: 'कर्म क्षेत्र में परिवर्तन, अधिकारी वर्ग से मनमुटाव।', en: 'Changes in workplace, cautious communication with superiors.', gu: 'કર્મક્ષેત્રમાં પરિવર્તન અને ઉપરી અધિકારીઓ સાથે મનદુઃખ.' },
    11: { key: 'shubh', hi: 'अपूर्व धन वर्षा, पदोन्नति, अभीष्ट सिद्धि व पारिवारिक सुख।', en: 'Remarkable financial inflow, promotion, wish fulfillment, family joy.', gu: 'અપૂર્વ ધન વર્ષા, બઢતી, ઈચ્છિત સિદ્ધિ અને પારિવારિક સુખ.' },
    12: { key: 'ashubh', hi: 'धार्मिक कार्यों में व्यय, वैराग्य भावना, यात्रा कष्ट।', en: 'Spending on noble causes, detachment mood, tiring travel.', gu: 'ધાર્મિક કાર્યોમાં ખર્ચ, વૈરાગ્ય ભાવના અને યાત્રા કષ્ટ.' },
  },
  शनि: {
    1: { key: 'ashubh', hi: 'साढ़े साती शिखर: शारीरिक शिथिलता, अत्यधिक मानसिक दबाव व कठिन परिश्रम।', en: 'Sade Sati Peak: physical fatigue, intense mental pressure, and demanding effort.', gu: 'સાડા સાતી શિખર: શારીરિક શિથિલતા, અતિ માનસિક દબાણ અને કઠિન પરિશ્રમ.' },
    2: { key: 'ashubh', hi: 'साढ़े साती उतरती: धन संचय में कठिनाई, पारिवारिक उत्तरदायित्व, वाणी संयम आवश्यक।', en: 'Setting Sade Sati: tight savings, family duties, mindful speech required.', gu: 'ઉતરતી સાડા સાતી: ધન સંચયમાં મુશ્કેલી, પારિવારિક જવાબદારી અને વાણી સંયમ જરૂરી.' },
    3: { key: 'shubh', hi: 'अत्यंत शुभ फल: शत्रु नाश, अतुल्य पराक्रम, धन लाभ व वाहन सुख।', en: 'Highly auspicious: triumph over rivals, bold valor, wealth & vehicle gains.', gu: 'અત્યંત શુભ ફળ: શત્રુ નાશ, અતુલ્ય પરાક્રમ, ધન લાભ અને વાહન સુખ.' },
    4: { key: 'ashubh', hi: 'कंटक शनि ढैया: मानसिक अशांति, गृह सुख में कमी, वाहन चलाते समय सावधानी।', en: 'Kantaka Shani Dhaiya: mental unrest, reduced domestic peace, caution while driving.', gu: 'કંટક શનિ ઢૈયા: માનસિક અશાંતિ, ગૃહ સુખમાં કમી અને વાહન ચલાવતા સાવચેતી.' },
    5: { key: 'ashubh', hi: 'संतान को लेकर चिंता, सट्टे/जोखिम से हानि, विद्या में अवरोध।', en: 'Worry over children, loss in speculation, study interruptions.', gu: 'સંતાન અંગે ચિંતા, સટ્ટા/જોખમથી નુકસાન અને વિદ્યામાં અવરોધ.' },
    6: { key: 'shubh', hi: 'सर्वत्र विजय: रोगों पर नियंत्रण, कानूनी विजय, प्रतिस्पर्धियों पर भारी विजय।', en: 'All-round triumph: recovery from ailments, legal success, victory over competitors.', gu: 'સર્વત્ર વિજય: રોગો પર નિયંત્રણ, કાયદાકીય વિજય અને સ્પર્ધકો પર ભવ્ય જીત.' },
    7: { key: 'ashubh', hi: 'साझेदारी व दांपत्य जीवन में धीरज रखें, व्यर्थ कलह से बचें।', en: 'Practice patience in partnerships & marriage; avoid needless arguments.', gu: 'ભાગીદારી અને દામ્પત્ય જીવનમાં ધીરજ રાખો, વ્યર્થ ક્લેશ ટાળો.' },
    8: { key: 'ashubh', hi: 'अष्टम ढैया: स्वास्थ्य के प्रति विशेष सजगता, जोखिम भरे कार्यों से दूर रहें।', en: 'Ashtama Dhaiya: extra care for health, avoid high-risk ventures.', gu: 'અષ્ટમ ઢૈયા: સ્વાસ્થ્ય પ્રત્યે વિશેષ જાગૃતિ, જોખમી કાર્યોથી દૂર રહો.' },
    9: { key: 'ashubh', hi: 'भाग्य में धीमापन, पिता के स्वास्थ्य की चिंता, धार्मिक परीक्षा।', en: 'Slower fortune, care for father’s health, test of patience & faith.', gu: 'ભાગ્યમાં ધીમાપણું, પિતાના સ્વાસ્થ્યની ચિંતા અને ધાર્મિક કસોટી.' },
    10: { key: 'ashubh', hi: 'कार्यस्थल पर अत्यधिक श्रम, पदोन्नति में विलंब, धैर्य से सिद्धि।', en: 'Heavy workload at career front, delayed promotion; steady patience wins.', gu: 'કાર્યસ્થળે અતિ પરિશ્રમ, બઢતીમાં વિલંબ અને ધૈર્યથી સિદ્ધિ.' },
    11: { key: 'shubh', hi: 'दीर्घकालीन लाभ: अचल संपत्ति क्रय, स्थाई आमदनी में वृद्धि, विजय।', en: 'Long-term gains: property acquisition, steady income growth, triumph.', gu: 'દીર્ઘકાલીન લાભ: સ્થાવર મિલકત ખરીદી, સ્થાયી આવકમાં વૃદ્ધિ અને વિજય.' },
    12: { key: 'ashubh', hi: 'साढ़े साती चढ़ती: व्यय वृद्धि, अनिद्रा, कानूनी उलझनों से बचाव।', en: 'Rising Sade Sati: rising expenses, disturbed sleep, avoid legal entanglements.', gu: 'ચઢતી સાડા સાતી: ખર્ચ વૃદ્ધિ, અનિદ્રા અને કાયદાકીય ગૂંચવણોથી બચાવ.' },
  },
};

function natureLabel(key: 'shubh' | 'ashubh' | 'sama', c: string): string {
  if (c === 'en') return key === 'shubh' ? 'Auspicious' : key === 'ashubh' ? 'Challenging' : 'Neutral';
  if (c === 'gu') return key === 'shubh' ? 'શુભ' : key === 'ashubh' ? 'અશુભ' : 'સમ';
  return key === 'shubh' ? 'शुभ' : key === 'ashubh' ? 'अशुभ' : 'सम';
}

/**
 * Calculates Shani Sade Sati Status for a native based on their natal Moon Rashi
 * and current planetary positions
 */
export function calculateSadeSati(
  kundali: KundaliData,
  targetDate: Date = new Date(),
  lang: string = 'hi'
): SadeSatiStatus {
  const c = (lang || 'hi').slice(0, 2).toLowerCase();
  const pick = (en: string, gu: string, hi: string) => (c === 'en' ? en : c === 'gu' ? gu : hi);

  const natalMoonRashi = kundali.moonRashi || 'मेष';
  const natalMoonIdx = RASHIS.indexOf(natalMoonRashi);

  const currentPlanets = calculatePlanetPositions(
    targetDate,
    kundali.latitude || 25.3176,
    kundali.longitude || 82.9739
  );

  const currentSaturn = currentPlanets.find((p) => p.planet === 'शनि');
  const shaniRashi = currentSaturn?.rashi || 'मीन';
  const shaniRashiIdx = currentSaturn?.rashiNumber ? currentSaturn.rashiNumber - 1 : RASHIS.indexOf(shaniRashi);

  const houseFromMoon = ((shaniRashiIdx - natalMoonIdx + 12) % 12) + 1;

  const isRising = houseFromMoon === 12;
  const isPeak = houseFromMoon === 1;
  const isSetting = houseFromMoon === 2;
  const isUnderSadeSati = isRising || isPeak || isSetting;

  const isKantakaDhaiya = houseFromMoon === 4;
  const isAshtamaDhaiya = houseFromMoon === 8;
  const isDhaiya = isKantakaDhaiya || isAshtamaDhaiya;

  let dhaiyaType: string = pick('None', 'કોઈ નહીં', 'कोई नहीं');
  if (isKantakaDhaiya) dhaiyaType = pick('Kantaka Shani (4th House)', 'કંટક શનિ (ચતુર્થ)', 'कंटक शनि (चतुर्थ)');
  if (isAshtamaDhaiya) dhaiyaType = pick('Ashtama Shani (8th House Dhaiya)', 'અષ્ટમ શનિ (કષ્ટપ્રદ ઢૈયા)', 'अष्टम शनि (कष्टप्रद ढैया)');

  let phaseNumber = 0;
  if (isRising) phaseNumber = 1;
  else if (isPeak) phaseNumber = 2;
  else if (isSetting) phaseNumber = 3;

  const rashi12 = RASHIS[(natalMoonIdx + 11) % 12];
  const rashi1 = RASHIS[natalMoonIdx];
  const rashi2 = RASHIS[(natalMoonIdx + 1) % 12];

  const ingress12 = SHANI_INGRESS_TABLE.find((i) => i.rashi === rashi12);
  const ingress1 = SHANI_INGRESS_TABLE.find((i) => i.rashi === rashi1);
  const ingress2 = SHANI_INGRESS_TABLE.find((i) => i.rashi === rashi2);

  const fallbackStart = pick('Past / Upcoming Year', 'ગત / આગામી વર્ષ', 'विगत/आगामी वर्ष');
  const fallbackEnd = pick('~2.5 Years Later', '~૨.૫ વર્ષ પછી', 'ढाई वर्ष बाद');

  const allPhases: SadeSatiPhase[] = [
    {
      phase: 'rising',
      name: pick('1st Phase (Rising Sade Sati)', 'પ્રથમ ચરણ (ચઢતી સાડા સાતી)', 'प्रथम चरण (चढ़ती साढ़े साती)'),
      hindiName: pick('Phase 1 — Saturn on Head', 'પ્રથમ ચરણ — મસ્તક પર શનિ', 'प्रथम चरण — मस्तक पर शनि'),
      shaniRashi: trRashi(rashi12, c),
      startApprox: ingress12 ? fmtIngressDate(ingress12.startDate, c) : fallbackStart,
      endApprox: ingress12 ? fmtIngressDate(ingress12.endDate, c) : fallbackEnd,
      isActive: isRising,
      intensity: pick('Moderate', 'મધ્યમ', 'मध्यम'),
      description: pick(
        'Saturn transits the 12th house from Natal Moon. This phase may trigger higher expenses, mental worries, and disturbed sleep.',
        'શનિ દેવ ચંદ્રથી દ્વાદશ ભાવમાં ગોચર કરે છે. આ ચરણમાં બિનજરૂરી ખર્ચ, માનસિક ચિંતા અને ઊંઘની સમસ્યા થઈ શકે છે.',
        'शनि देव चंद्र से द्वादश भाव में गोचर करते हैं। इस चरण में जातक के अनावश्यक व्यय, मानसिक चिंता व नींद की समस्या हो सकती है।'
      ),
      bodyImpact: pick(
        'Influence on head & crown — deepens contemplation and spiritual maturity.',
        'માથા અને મસ્તક પર શનિનો પ્રભાવ — વિચારશીલતા અને અધ્યાત્મની વૃદ્ધિ.',
        'सिर व मस्तक पर शनि का प्रभाव — विचारशीलता व अध्यात्म की वृद्धि।'
      ),
    },
    {
      phase: 'peak',
      name: pick('2nd Phase (Peak Sade Sati)', 'દ્વિતીય ચરણ (શિખર સાડા સાતી)', 'द्वितीय चरण (शिखर साढ़े साती)'),
      hindiName: pick('Phase 2 — Saturn on Heart', 'દ્વિતીય ચરણ — હૃદય પર શનિ', 'द्वितीय चरण — हृदय पर शनि'),
      shaniRashi: trRashi(rashi1, c),
      startApprox: ingress1 ? fmtIngressDate(ingress1.startDate, c) : fallbackStart,
      endApprox: ingress1 ? fmtIngressDate(ingress1.endDate, c) : fallbackEnd,
      isActive: isPeak,
      intensity: pick('Intense', 'તીવ્ર', 'तीव्र'),
      description: pick(
        'Saturn transits directly over Natal Moon. The most pivotal and testing period of Sade Sati—disciplined hard work brings enduring results.',
        'શનિ દેવ જન્મ રાશિ (ચંદ્ર) પર જ ગોચર કરે છે. આ સાડા સાતીનો સૌથી મહત્વપૂર્ણ અને કઠોર કસોટીનો સમય હોય છે. કઠિન પરિશ્રમથી જ સફળતા મળે છે.',
        'शनि देव जन्म राशि (चंद्र) पर ही गोचर करते हैं। यह साढ़े साती का सबसे महत्वपूर्ण व कठोर परीक्षा का समय होता है। कठिन परिश्रम से ही सफलता मिलती है।'
      ),
      bodyImpact: pick(
        'Influence on heart & core — maintain emotional steadiness and heart health.',
        'હૃદય અને ઉદર પર શનિનો પ્રભાવ — સ્વાસ્થ્ય અને ભાવનાત્મક સ્થિરતા જાળવો.',
        'हृदय व उदर पर शनि का प्रभाव — स्वास्थ्य व भावनात्मक स्थिरता बनाए रखें।'
      ),
    },
    {
      phase: 'setting',
      name: pick('3rd Phase (Setting Sade Sati)', 'તૃતીય ચરણ (ઉતરતી સાડા સાતી)', 'तृतीय चरण (उतरती साढ़े साती)'),
      hindiName: pick('Phase 3 — Saturn on Feet', 'તૃતીય ચરણ — પગ પર શનિ', 'तृतीय चरण — पैरों पर शनि'),
      shaniRashi: trRashi(rashi2, c),
      startApprox: ingress2 ? fmtIngressDate(ingress2.startDate, c) : fallbackStart,
      endApprox: ingress2 ? fmtIngressDate(ingress2.endDate, c) : fallbackEnd,
      isActive: isSetting,
      intensity: pick('Mild', 'હળવો', 'हल्का'),
      description: pick(
        'Saturn transits the 2nd house (wealth & speech) from Natal Moon. Hardships ease gradually, paving the way for gains and fresh beginnings.',
        'શનિ દેવ ચંદ્રથી દ્વિતીય (ધન અને વાણી) ભાવમાં ગોચર કરે છે. ધીમે-ધીમે સંકટ ટળવા લાગે છે, આર્થિક લાભ અને નવી શરૂઆત થાય છે.',
        'शनि देव चंद्र से द्वितीय (धन व वाणी) भाव में गोचर करते हैं। धीरे-धीरे संकट टलने लगते हैं, आर्थिक लाभ व नवीन शुरुआत होती है।'
      ),
      bodyImpact: pick(
        'Influence on feet — brings frequent travels and career advancement.',
        'પગ પર શનિનો પ્રભાવ — વધુ પડતી મુસાફરી અને બઢતીનો સમય.',
        'पैरों पर शनि का प्रभाव — अत्यधिक यात्राएं व पदोन्नति का समय।'
      ),
    },
  ];

  const dispNatal = trRashi(natalMoonRashi, c);
  const dispShani = trRashi(shaniRashi, c);
  let summary = '';
  if (isUnderSadeSati) {
    if (isRising) {
      summary = pick(
        `Your Natal Moon sign is "${dispNatal}". Currently Saturn transits "${dispShani}" (12th from Moon). You are in the 1st Phase (Rising Sade Sati). Practice financial discipline and prioritize health.`,
        `તમારી જન્મ ચંદ્ર રાશિ "${dispNatal}" છે. હાલમાં શનિ દેવ "${dispShani}"માં ગોચર કરી રહ્યા છે (ચંદ્રથી 12મા ભાવમાં). તમારી સાડા સાતીનું 'પ્રથમ ચરણ (ચઢતી સાડા સાતી)' ચાલી રહ્યું છે. આર્થિક સંયમ અને સ્વાસ્થ્યનું ધ્યાન રાખો.`,
        `आपकी जन्म चंद्र राशि "${natalMoonRashi}" है। वर्तमान में शनि देव "${shaniRashi}" में गोचर कर रहे हैं (चंद्र से 12वें भाव में)। आपकी साढ़े साती का 'प्रथम चरण (चढ़ती साढ़े साती)' चल रहा है। आर्थिक संयम और स्वास्थ्य का ध्यान रखें।`
      );
    } else if (isPeak) {
      summary = pick(
        `Your Natal Moon sign is "${dispNatal}" and Saturn is transiting the exact sign "${dispShani}". You are in the 2nd Phase (Peak Sade Sati)—a time for discipline, humility, and steady perseverance.`,
        `તમારી જન્મ ચંદ્ર રાશિ "${dispNatal}" છે અને હાલમાં શનિ દેવ આ જ રાશિ "${dispShani}"માં ગોચર કરી રહ્યા છે. તમારી સાડા સાતીનું 'દ્વિતીય ચરણ (શિખર)' સક્રિય છે. આ કસોટી અને આધ્યાત્મિક તપસ્યાનો કાળ છે.`,
        `आपकी जन्म चंद्र राशि "${natalMoonRashi}" है और वर्तमान में शनि देव इसी राशि "${shaniRashi}" में गोचर कर रहे हैं। आपकी साढ़े साती का 'द्वितीय चरण (शिखर)' सक्रिय है। यह परीक्षा व आध्यात्मिक तपस्या का काल है।`
      );
    } else {
      summary = pick(
        `Your Natal Moon sign is "${dispNatal}" and Saturn is in the 2nd house sign "${dispShani}". You are in the 3rd Phase (Setting Sade Sati)—hurdles are clearing and doors to success are opening.`,
        `તમારી જન્મ ચંદ્ર રાશિ "${dispNatal}" છે અને શનિ દેવ ચંદ્રથી બીજા ભાવ "${dispShani}"માં છે. તમારી સાડા સાતીનું 'તૃતીય ચરણ (ઉતરતી સાડા સાતી)' ચાલી રહ્યું છે. કષ્ટોમાંથી મુક્તિ અને સફળતાના દ્વાર ખૂલી રહ્યા છે.`,
        `आपकी जन्म चंद्र राशि "${natalMoonRashi}" है और शनि देव चंद्र से 2रे भाव "${shaniRashi}" में हैं। आपकी साढ़े साती का 'तृतीय चरण (उतरती साढ़े साती)' चल रहा है। कष्टों से मुक्ति व सफलता के द्वार खुल रहे हैं।`
      );
    }
  } else if (isDhaiya) {
    if (isKantakaDhaiya) {
      summary = pick(
        `Saturn is in the 4th house from your Moon sign "${dispNatal}". You are under "Kantaka Shani Dhaiya". Maintain domestic peace and drive carefully.`,
        `તમારી ચંદ્ર રાશિ "${dispNatal}"થી શનિ દેવ ચોથા ભાવમાં છે. તમારા પર "કંટક શનિની ઢૈયા"નો પ્રભાવ છે. પારિવારિક શાંતિ જાળવો અને વાહન સાવચેતીથી ચલાવો.`,
        `आपकी चंद्र राशि "${natalMoonRashi}" से शनि देव 4थे भाव में हैं। आप पर "कंटक शनि की ढैया" का प्रभाव है। पारिवारिक शांति बनाए रखें व वाहन सावधानी से चलाएं।`
      );
    } else {
      summary = pick(
        `Saturn is in the 8th house from your Moon sign "${dispNatal}". You are under "Ashtama Shani Dhaiya". Safeguard your health and recite Hanuman Chalisa regularly.`,
        `તમારી ચંદ્ર રાશિ "${dispNatal}"થી શનિ દેવ આઠમા ભાવમાં છે. તમારા પર "અષ્ટમ શનિની ઢૈયા"નો પ્રભાવ છે. સ્વાસ્થ્યનું ધ્યાન રાખો અને નિયમિત હનુમાન ચાલીસાનો પાઠ કરો.`,
        `आपकी चंद्र राशि "${natalMoonRashi}" से शनि देव 8वें भाव में हैं। आप पर "अष्टम शनि की ढैया" का प्रभाव है। स्वास्थ्य का ध्यान रखें व नियमित हनुमान चालीसा का पाठ करें।`
      );
    }
  } else {
    summary = pick(
      `Good news! Your Natal Moon sign "${dispNatal}" is currently free from both Sade Sati and Dhaiya. Saturn transits favorably in the ${houseFromMoon}th house from Moon.`,
      `શુભ સમાચાર! તમારી જન્મ ચંદ્ર રાશિ "${dispNatal}" પર હાલમાં શનિની સાડા સાતી અથવા ઢૈયાનો કોઈ પ્રતિકૂળ પ્રભાવ નથી. શનિ દેવ ચંદ્રથી ${houseFromMoon}મા ભાવમાં અનુકૂળ ગોચર કરી રહ્યા છે.`,
      `शुभ समाचार! आपकी जन्म चंद्र राशि "${natalMoonRashi}" पर वर्तमान में शनि की साढ़े साती अथवा ढैया का कोई भी प्रतिकूल प्रभाव नहीं है। शनि देव चंद्र से ${houseFromMoon}वें भाव में अनुकूल गोचर कर रहे हैं।`
    );
  }

  const activePhase = allPhases.find((p) => p.isActive);

  const vedicRemedies =
    c === 'en'
      ? [
          'Every Saturday evening, light a four-wick mustard oil lamp beneath a Peepal tree and perform 7 circumambulations.',
          'Recite Shri Hanuman Chalisa or Bajrang Baan thrice daily in the morning or evening.',
          'Perform Chhaya-Daan on Saturdays: look at your reflection in mustard oil in an iron/steel bowl and donate it to someone needy.',
          'Chant 1 mala (108 times) of Shani Mahamantra: "ॐ प्रां प्रीं प्रौं सः शनैश्चराय नमः".',
          'Serve laborers, sanitation workers, differently-abled people, and donate meals humbly.',
          'Feed chapati brushed with mustard oil to black dogs or crows.',
        ]
      : c === 'gu'
        ? [
            'દર શનિવારે પીપળાના વૃક્ષ નીચે સરસવના તેલનો ચાર મુખવાળો દીવો પ્રગટાવો અને 7 વાર પ્રદક્ષિણા કરો.',
            'નિત્ય સવારે અથવા સાંજે શ્રી હનુમાન ચાલીસા અથવા બજરંગ બાણનો 3 વાર પાઠ કરો.',
            'શનિવારે છાયા દાન કરો: વાટકીમાં થોડું સરસવનું તેલ લઈ તેમાં તમારો ચહેરો જોઈ કોઈ જરૂરિયાતમંદને દાન કરો.',
            'શનિ મહામંત્રની 1 માળા (108 વાર) જપ કરો: "ॐ प्रां प्रीं प्रौं सः शनैश्चराय नमः".',
            'શ્રમિકો, સફાઈકર્મીઓ, દિવ્યાંગો અને અસહાય લોકોને યથાશક્તિ મદદ અને ભોજન દાન કરો.',
            'કાળા કૂતરા અથવા કાગડાને સરસવનું તેલ લગાવેલી રોટલી ખવડાવો.',
          ]
        : [
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
    shaniCurrentRashi: dispShani,
    natalMoonRashi: dispNatal,
    summary,
    shaniTransitHouse: houseFromMoon,
    allPhases,
    vedicRemedies,
  };
}

/**
 * Calculates current planetary transit (Gochar) positions with respect to native Moon sign
 */
export function calculateDailyTransits(
  kundali: KundaliData,
  targetDate: Date = new Date(),
  lang: string = 'hi'
): PlanetTransitInfo[] {
  const c = (lang || 'hi').slice(0, 2).toLowerCase();
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

    let natureKey: 'shubh' | 'ashubh' | 'sama' = 'sama';
    let predictionText = '';

    const planetLookup = TRANSIT_PREDICTIONS[p.planet];
    if (planetLookup && planetLookup[houseFromMoon]) {
      const entry = planetLookup[houseFromMoon];
      natureKey = entry.key;
      predictionText = c === 'en' ? entry.en : c === 'gu' ? entry.gu : entry.hi;
    } else {
      const isNaturalBenefic = ['गुरु', 'शुक्र', 'बुध', 'चंद्र'].includes(p.planet);
      if (isNaturalBenefic) {
        natureKey = [2, 5, 7, 9, 11].includes(houseFromMoon)
          ? 'shubh'
          : [6, 8, 12].includes(houseFromMoon)
            ? 'ashubh'
            : 'sama';
      } else {
        natureKey = [3, 6, 11].includes(houseFromMoon)
          ? 'shubh'
          : [1, 2, 4, 7, 8, 12].includes(houseFromMoon)
            ? 'ashubh'
            : 'sama';
      }
      if (c === 'en') {
        predictionText = `Transiting House ${houseFromMoon} from Moon. ${
          natureKey === 'shubh'
            ? 'Favorable outcomes.'
            : natureKey === 'ashubh'
              ? 'Caution advised.'
              : 'Moderate results.'
        }`;
      } else if (c === 'gu') {
        predictionText = `ચંદ્રથી ${houseFromMoon}મા ભાવમાં ગોચર. ${
          natureKey === 'shubh'
            ? 'અનુકૂળ ફળદાયક.'
            : natureKey === 'ashubh'
              ? 'સાવચેતી અપેક્ષિત.'
              : 'મધ્યમ ફળ.'
        }`;
      } else {
        predictionText = `चंद्र से ${houseFromMoon}वें भाव में गोचररत। ${
          natureKey === 'shubh'
            ? 'अनुकूल फलदायक।'
            : natureKey === 'ashubh'
              ? 'सावधानी अपेक्षित।'
              : 'मध्यम फल।'
        }`;
      }
    }

    return {
      planet: p.planet,
      englishName: p.englishName,
      currentRashi: p.rashi,
      currentDegree: p.degreeInRashi,
      houseFromMoon,
      isBenefic: natureKey === 'shubh',
      nature: natureLabel(natureKey, c),
      prediction: predictionText,
    };
  });
}
