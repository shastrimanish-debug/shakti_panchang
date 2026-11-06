/**
 * शास्त्रोक्त तिथि व पर्व निर्णय सेवा (Dharmashastric Tithi & Festival Decision Service)
 *
 * Provides authoritative Shastric rules, mathematical calculations,
 * and a 10-Year (2025–2035) Vrat-Parva Dual-Tithi conflict resolution database
 * grounded in Nirnayasindhu, Dharmasindhu, and Skanda Purana.
 */

import { VedicPanchangData } from '../types';
import { getFestivalsForYear } from './festivals';

export interface ShastricRule {
  id: string;
  name: string;
  hindiName: string;
  guName?: string;
  karmaKala: string;
  karmaKalaEn?: string;
  karmaKalaGu?: string;
  principle: string;
  principleEn?: string;
  principleGu?: string;
  sanskritShloka: string;
  source: string;
  sourceEn?: string;
  sourceGu?: string;
  dualTithiRule: string;
  dualTithiRuleEn?: string;
  dualTithiRuleGu?: string;
  examples: string[];
  examplesEn?: string[];
  examplesGu?: string[];
}

export interface TenYearFestivalRecord {
  year: number;
  festivalId: string;
  festivalName: string;
  hindiName: string;
  guName?: string;
  observedDate: string; // YYYY-MM-DD
  tithiName: string;
  tithiStart: string;
  tithiEnd: string;
  hasConflict: boolean;
  conflictType?: 'दो_दिन_व्याप्ति' | 'तिथि_क्षय' | 'तिथि_वृद्धि' | 'भद्रा_दोष' | 'स्मार्त_वैष्णव_भेद';
  karmaKala: string;
  decisionReason: string;
  shastricPramana: string;
  alternateDateNote?: string;
}

export const SHASTRIC_RULES: ShastricRule[] = [
  {
    id: 'pradosha',
    name: 'Pradosha Vyapini (प्रदोष-व्यापिनी)',
    hindiName: 'प्रदोष-व्यापिनी नियम',
    guName: 'પ્રદોષ-વ્યાપિની નિયમ',
    karmaKala: 'सूर्यास्त के बाद २ घटी २४ पल (लगभग २ घण्टे २४ मिनट)',
    karmaKalaEn: '2 Ghatis and 24 Palas after sunset (~2 hours 24 minutes)',
    karmaKalaGu: 'સૂર્યાસ્ત પછી ૨ ઘડી ૨૪ પળ (આશરે ૨ કલાક ૨૪ મિનિટ)',
    principle: 'जिस दिन अभीष्ट तिथि प्रदोष काल में व्याप्त होती है, उसी दिन पूजन व व्रत का विधान है।',
    principleEn: 'Vratas and worship are observed on the day the desired Tithi prevails during Pradosha Kaala.',
    principleGu: 'જે દિવસે અભીષ્ટ તિથિ પ્રદોષ કાળમાં વ્યાપ્ત હોય તે દિવસે જ પૂજન અને વ્રતનો વિધાન છે.',
    sanskritShloka: 'कार्तिकस्यासिते पक्षे त्रयोदश्यां निशामुखे। यमदीपं बहिर्दद्यादपमृत्युर्विनश्यति॥ (स्कन्द पुराण / निर्णयसिन्धु)',
    source: 'निर्णयसिन्धु, धर्मसिन्धु, स्कन्द पुराण',
    sourceEn: 'Nirnayasindhu, Dharmasindhu, Skanda Purana',
    sourceGu: 'નિર્ણયસિંધુ, ધર્મસિંધુ, સ્કંદ પુરાણ',
    dualTithiRule: 'यदि दोनों दिन प्रदोष में तिथि व्याप्त हो या केवल प्रथम दिन व्याप्त हो, तो पूर्वविद्धा (प्रथम दिन) ही ग्राह्य है। यदि केवल दूसरे दिन व्याप्त हो तो द्वितीय दिन ग्राह्य है।',
    dualTithiRuleEn: 'If Tithi touches Pradosha on both days or on the first day only, Purvaviddha (Day 1) is accepted. If only on Day 2, Day 2 is accepted.',
    dualTithiRuleGu: 'જો બંને દિવસે પ્રદોષમાં તિથિ હોય અથવા પ્રથમ દિવસે હોય તો પ્રથમ દિવસ માન્ય રહે છે.',
    examples: ['धनतेरस (कार्तिक कृष्ण त्रयोदशी)', 'दीपावली लक्ष्मी पूजन (कार्तिक कृष्ण अमावस्या)', 'प्रदोष व्रत (त्रयोदशी)', 'मासिक शिवरात्रि'],
    examplesEn: ['Dhanteras (Kartik Krishna Trayodashi)', 'Diwali Lakshmi Puja (Kartik Krishna Amavasya)', 'Pradosha Vrata', 'Monthly Shivratri'],
    examplesGu: ['ધનતેરસ (કાર્તિક કૃષ્ણ ત્રયોદશી)', 'દિવાળી લક્ષ્મી પૂજન', 'પ્રદોષ વ્રત', 'માસિક શિવરાત્રિ'],
  },
  {
    id: 'nishita',
    name: 'Nishita Vyapini (निशीथ-व्यापिनी)',
    hindiName: 'निशीथ-व्यापिनी नियम',
    guName: 'નિશીથ-વ્યાપિની નિયમ',
    karmaKala: 'मध्यरात्रि का काल (रात्रि के ८वें मुहूर्त / रात ११:४० से १२:३० के मध्य)',
    karmaKalaEn: 'Midnight Muhurta (8th Muhurta of night / ~11:40 PM to 12:30 AM)',
    karmaKalaGu: 'મધ્યરાત્રિ કાળ (રાત્રિના ૮મા મુહૂર્ત / રાત્રે ૧૧:૪૦ થી ૧૨:૩૦ વચ્ચે)',
    principle: 'अर्धरात्रि में होने वाली पूजाओं हेतु जिस दिन निशीथ काल में तिथि विद्यमान हो, वही दिन मुख्य है।',
    principleEn: 'For nocturnal midnight rituals, the day the Tithi touches Nishita Kaala is authoritative.',
    principleGu: 'મધ્યરાત્રિ પૂજાઓ માટે જે દિવસે નિશીથ કાળમાં તિથિ હોય તે જ દિવસ મુખ્ય છે.',
    sanskritShloka: 'अर्धरात्रे यदा युक्ता निशीथे च विशेषतः। तदा सा शिवरात्रिः स्यात् सर्वपापप्रणाशिनी॥ (ईशान संहिता)',
    source: 'ईशान संहिता, निर्णयसिन्धु',
    sourceEn: 'Ishana Samhita, Nirnayasindhu',
    sourceGu: 'ઈશાન સંહિતા, નિર્ણયસિંધુ',
    dualTithiRule: 'दोनों दिन निशीथ में तिथि रहने पर अथवा केवल पहले दिन रहने पर पूर्वविद्धा ग्राह्य होती है।',
    dualTithiRuleEn: 'If Tithi touches Nishita on both nights or Day 1 night, Day 1 is accepted.',
    dualTithiRuleGu: 'બંને દિવસે નિશીથમાં તિથિ હોય કે પહેલા દિવસે હોય તો પૂર્વવિદ્ધા ગ્રાહ્ય છે.',
    examples: ['महाशिवरात्रि (फाल्गुन कृष्ण चतुर्दशी)', 'श्री कृष्ण जन्माष्टमी (भाद्रपद कृष्ण अष्टमी निशीथ व रोहिणी)'],
    examplesEn: ['Maha Shivratri (Phalguna Krishna Chaturdashi)', 'Krishna Janmashtami (Midnight Ashtami & Rohini)'],
    examplesGu: ['મહાશિવરાત્રિ', 'શ્રીકૃષ્ણ જન્માષ્ટમી'],
  },
  {
    id: 'madhyahna',
    name: 'Madhyahna Vyapini (मध्याह्न-व्यापिनी)',
    hindiName: 'मध्याह्न-व्यापिनी नियम',
    guName: 'મધ્યાહ્ન-વ્યાપિની નિયમ',
    karmaKala: 'दिन का तृतीय भाग (दिन के लगभग ११:०० से १:३० के मध्य)',
    karmaKalaEn: 'Third part of the daytime (~11:00 AM to 1:30 PM)',
    karmaKalaGu: 'દિવસનો ત્રીજો ભાગ (બપોરે ૧૧:૦૦ થી ૧:૩૦ વચ્ચે)',
    principle: 'जिन देवों का प्राकट्य मध्याह्न काल में हुआ, उनका व्रत व पूजन मध्याह्न-व्यापिनी तिथि में ही होता है।',
    principleEn: 'Deities who manifested at solar noon are worshipped only when the Tithi touches solar noon.',
    principleGu: 'જે દેવોનો પ્રાગટ્ય મધ્યાહ્ન કાળે થયો, તેમનો ઉત્સવ મધ્યાહ્ન-વ્યાપિની તિથિમાં જ થાય છે.',
    sanskritShloka: 'मध्याह्ने पूजयेद्देवं विघ्नेशं मोदकप्रियम्। मध्याह्नव्यापिनी चेत्स्याच्चतुर्थी गणनायक॥ (धर्मसिन्धु)',
    source: 'धर्मसिन्धु, भविष्योत्तर पुराण',
    sourceEn: 'Dharmasindhu, Bhavishyottara Purana',
    sourceGu: 'ધર્મસિંધુ, ભવિષ્યોત્તર પુરાણ',
    dualTithiRule: 'यदि दोनों दिन मध्याह्न में चतुर्थी या नवमी व्याप्त हो, तो पूर्वविद्धा को त्यागकर परविद्धा या शास्त्रोक्त युग्म नियम से निर्णय होता है।',
    dualTithiRuleEn: 'If Tithi spans solar noon on both days, Shastric pairing (Yugma) determines the authentic day.',
    dualTithiRuleGu: 'જો બંને દિવસે મધ્યાહ્નમાં તિથિ હોય તો શાસ્ત્રોક્ત યુગ્મ નિયમથી નિર્ણય થાય છે.',
    examples: ['श्री गणेश चतुर्थी (भाद्रपद शुक्ल चतुर्थी)', 'श्री राम नवमी (चैत्र शुक्ल नवमी मध्याह्न १२:००)'],
    examplesEn: ['Ganesh Chaturthi (Bhadrapada Shukla Chaturthi)', 'Shri Rama Navami (Chaitra Shukla Navami at Noon)'],
    examplesGu: ['શ્રી ગણેશ ચતુર્થી', 'શ્રી રામ નવમી'],
  },
  {
    id: 'udaya',
    name: 'Udaya Vyapini (उदय-व्यापिनी)',
    hindiName: 'उदय-व्यापिनी नियम',
    guName: 'ઉદય-વ્યાપિની નિયમ',
    karmaKala: 'प्रातः सूर्योदय काल (३ मुहूर्त या सूर्योदय स्पर्श)',
    karmaKalaEn: 'Sunrise instant and first 3 Muhurtas (Udaya Tithi)',
    karmaKalaGu: 'પ્રાતઃ સૂર્યોદય કાળ (૩ મુહૂર્ત કે સૂર્યોદય સ્પર્શ)',
    principle: 'अधिकांश स्मार्त व सार्वत्रिक व्रतों में सूर्योदय-कालिक तिथि (उदया तिथि) ही सर्वमान्य होती है।',
    principleEn: 'For general and Smartha fasting, the Tithi prevailing at local sunrise is authoritative.',
    principleGu: 'મોટાભાગના સ્માર્ત વ્રતોમાં સૂર્યોદય કાળની ઉદયા તિથિ સર્વમાન્ય ગણાય છે.',
    sanskritShloka: 'यस्योदये रवेस्तिथिः सैव सर्वत्र पूजिता। आदित्येऽस्तं गते रात्रिस्तिथिरन्या न गृह्यते॥',
    source: 'निर्णयसिन्धु, कालमाधव',
    sourceEn: 'Nirnayasindhu, Kalamiadhava',
    sourceGu: 'નિર્ણયસિંધુ, કાલમાધવ',
    dualTithiRule: 'एकादशी में यदि दशमी का वेध (अरुणोदय वेध) हो तो वह त्याज्य है; द्वादशी युक्त शुद्ध एकादशी ही ग्राह्य है।',
    dualTithiRuleEn: 'On Ekadashi, any overlap with Dashami at dawn is shunned; pure Ekadashi with Dvadashi is observed.',
    dualTithiRuleGu: 'એકાદશીમાં દશમીનો વેધ ત્યાજ્ય છે; શુદ્ધ દ્વાદશી યુક્ત એકાદશી જ ગ્રાહ્ય છે.',
    examples: ['एकादशी व्रत', 'अनंत चतुर्दशी', 'वट सावित्री व्रत', 'छठ पूजा पारण (सप्तमी उदय)'],
    examplesEn: ['Ekadashi Fasting', 'Ananta Chaturdashi', 'Vat Savitri Vrata', 'Chhath Puja Parana'],
    examplesGu: ['એકાદશી વ્રત', 'અનંત ચતુર્દશી', 'વટ સાવિત્રી વ્રત', 'છઠ પૂજા પારણ'],
  },
  {
    id: 'aparahna',
    name: 'Aparahna Vyapini (अपराह्ण-व्यापिनी)',
    hindiName: 'अपराह्ण-व्यापिनी नियम',
    guName: 'અપરાહ્ન-વ્યાપિની નિયમ',
    karmaKala: 'दिन का चौथा भाग (दोपहर १:३० से ४:०० के मध्य)',
    karmaKalaEn: 'Fourth quarter of the day (~1:30 PM to 4:00 PM)',
    karmaKalaGu: 'દિવસનો ચોથો ભાગ (બપોરે ૧:૩૦ થી ૪:૦૦ વચ્ચે)',
    principle: 'श्राद्ध, पितृ तर्पण एवं रक्षाबंधन का कर्मकाल अपराह्ण व्यापिनी तिथि है।',
    principleEn: 'Ancestral Tarpan, Shraddha, and Raksha Bandhan require Aparahna Tithi devoid of Bhadra.',
    principleGu: 'શ્રાદ્ધ, પિતૃતર્પણ અને રક્ષાબંધનનો કર્મકાળ અપરાહ્ન વ્યાપિની તિથિ છે.',
    sanskritShloka: 'अपराह्णे पितृणां तु दद्यात् पिण्डोदकं नरः। भद्रावर्जिते काले रक्षाबन्धनमिष्यते॥',
    source: 'हेमाद्रि, निर्णयसिन्धु',
    sourceEn: 'Hemadri, Nirnayasindhu',
    sourceGu: 'હેમાદ્રિ, નિર્ણયસિંધુ',
    dualTithiRule: 'रक्षाबंधन में पूर्णिमा अपराह्ण में भद्रारहित होनी चाहिए। यदि भद्रा हो तो भद्रा समाप्त होने तक या भद्रा-पुच्छ काल में ही रक्षासूत्र बांधना चाहिए।',
    dualTithiRuleEn: 'Raksha Bandhan requires Purnima during Aparahna without Bhadra. If Bhadra exists, tying is done after Bhadra ends or in Bhadra-Puccha.',
    dualTithiRuleGu: 'રક્ષાબંધનમાં ભદ્રારહિત અપરાહ્ન કાળ માન્ય છે; ભદ્રા હોય તો તેની સમાપ્તિ પછી જ રક્ષાસૂત્ર બાંધવું.',
    examples: ['रक्षाबंधन (श्रावण पूर्णिमा)', 'पितृ पक्ष श्राद्ध तर्पण (अपराह्ण व्यापिनी)'],
    examplesEn: ['Raksha Bandhan (Shravana Purnima)', 'Pitru Paksha Shraddha Tarpan'],
    examplesGu: ['રક્ષાબંધન', 'પિતૃ પક્ષ શ્રાદ્ધ તર્પણ'],
  },
  {
    id: 'chandrodaya',
    name: 'Chandrodaya Vyapini (चन्द्रोदय-व्यापिनी)',
    hindiName: 'चन्द्रोदय-व्यापिनी नियम',
    guName: 'ચંદ્રોદય-વ્યાપિની નિયમ',
    karmaKala: 'रात्रि में चन्द्रमा के उदय होने का काल',
    karmaKalaEn: 'Moment of Moonrise at night',
    karmaKalaGu: 'રાત્રે ચંદ્ર ઉદય થવાનો સમય',
    principle: 'जिस दिन चन्द्रमा का दर्शन व अर्घ्य अभीष्ट तिथि में संभव हो, उसी दिन वह व्रत मान्य होता है।',
    principleEn: 'Fasts requiring sighting and offering to the Moon are observed when Tithi is present at Moonrise.',
    principleGu: 'જે દિવસે ચંદ્રોદય સમયે અભીષ્ટ તિથિ હોય તે દિવસે તે વ્રત માન્ય થાય છે.',
    sanskritShloka: 'कार्तिककृष्णपक्षे तु चतुर्थी चन्द्रसंयुता। तत्रोपवासः कर्तव्यो यावच्चन्द्रोदयो भवेत्॥',
    source: 'निर्णयसिन्धु, व्रतराज',
    sourceEn: 'Nirnayasindhu, Vrataraja',
    sourceGu: 'નિર્ણયસિંધુ, વ્રતરાજ',
    dualTithiRule: 'जिस दिन चन्द्रोदय के समय चतुर्थी तिथि विद्यमान हो, उसी दिन करवा चौथ का व्रत व पारण मान्य है।',
    dualTithiRuleEn: 'Karwa Chauth is observed on the day Chaturthi exists at the local Moonrise time.',
    dualTithiRuleGu: 'જે દિવસે ચંદ્રોદય વખતે ચતુર્થી હોય તે દિવસે કરવા ચોથ માન્ય છે.',
    examples: ['करवा चौथ (कार्तिक कृष्ण चतुर्थी)', 'संकष्टी गणेश चतुर्थी (चन्द्र दर्शन)'],
    examplesEn: ['Karwa Chauth (Kartik Krishna Chaturthi)', 'Sankashti Ganesh Chaturthi'],
    examplesGu: ['કરવા ચોથ', 'સંકષ્ટી ગણેશ ચતુર્થી'],
  },
  {
    id: 'yugma',
    name: 'Yugma-Vakya Siddhanta (युग्म-वाक्य नियम)',
    hindiName: 'युग्म-वाक्य सिद्धांत',
    guName: 'યુગ્મ-વાક્ય સિદ્ધાંત',
    karmaKala: 'द्वि-तिथि संशय की स्थिति में तिथि युग्म की ग्राह्यता',
    karmaKalaEn: 'Authentic Tithi Pairing Doctrine in dual-tithi dilemmas',
    karmaKalaGu: 'બે તિથિ સંશય વખતે તિથિ જોડીની ગ્રાહ્યતા',
    principle: 'धर्मशास्त्र के अनुसार कुछ तिथियां पूर्व तिथि से युक्त तथा कुछ उत्तर तिथि से युक्त होकर अधिक पुण्य फलदायी होती हैं।',
    principleEn: 'Certain tithis yield highest merit when paired with preceding or succeeding compatible tithis.',
    principleGu: 'ધર્મશાસ્ત્ર મુજબ કેટલીક તિથિઓ આગળની કે પાછળની તિથિ સાથે જોડાવાથી અધિક પુણ્યદાયી બને છે.',
    sanskritShloka: 'युग्माग्नियुगखट्वक्षैः षष्ठीभाद्रपदैस्तथा। एकादशी द्वादशी च तथा सर्वाः फलप्रदाः॥',
    source: 'निर्णयसिन्धु, वसिष्ठ संहिता',
    sourceEn: 'Nirnayasindhu, Vasistha Samhita',
    sourceGu: 'નિર્ણયસિંધુ, વસિષ્ઠ સંહિતા',
    dualTithiRule: 'द्वितीया तृतीया के साथ, चतुर्थी पंचमी के साथ, षष्ठी सप्तमी के साथ, अष्टमी नवमी के साथ, एकादशी द्वादशी के साथ, चतुर्दशी पूर्णिमा के साथ युग्म बनाती है।',
    dualTithiRuleEn: 'Dvitiya pairs with Tritiya, Chaturthi with Panchami, Shashthi with Saptami, Ashtami with Navami, Ekadashi with Dvadashi.',
    dualTithiRuleGu: 'બીજ-ત્રીજ, ચોથ-પાંચમ, છઠ-સાતમ, આઠમ-નોમ, અગિયારસ-બારસ એકબીજા સાથે શુભ યુગ્મ બનાવે છે.',
    examples: ['द्वितीया-तृतीया संशय', 'अष्टमी-नवमी संशय', 'एकादशी-द्वादशी व्रत'],
    examplesEn: ['Dvitiya-Tritiya Resolution', 'Ashtami-Navami Resolution', 'Ekadashi-Dvadashi Pairing'],
    examplesGu: ['બીજ-ત્રીજ નિર્ણય', 'આઠમ-નોમ નિર્ણય', 'અગિયારસ-બારસ વ્રત'],
  },
];

/**
 * 10-Year Vrat-Parva Shastrokt Decision Database (2025 to 2035)
 * Explaining exact dates, timings, and why the day was chosen when dual tithis occur.
 */
export const TEN_YEAR_FESTIVAL_DECISIONS: TenYearFestivalRecord[] = [
  // --- 2025 ---
  {
    year: 2025,
    festivalId: 'dhanteras',
    festivalName: 'Dhanteras',
    hindiName: 'धनतेरस (धनत्रयोदशी व यम दीपदान)',
    observedDate: '2025-10-18',
    tithiName: 'कार्तिक कृष्ण त्रयोदशी',
    tithiStart: '18 अक्टूबर दोपहर 12:18 से',
    tithiEnd: '19 अक्टूबर दोपहर 01:52 तक',
    hasConflict: true,
    conflictType: 'दो_दिन_व्याप्ति',
    karmaKala: 'प्रदोष काल (शाम 05:48 से 08:12)',
    decisionReason: '18 अक्टूबर को सायंकाल प्रदोष काल में त्रयोदशी शत-प्रतिशत व्याप्त है। 19 अक्टूबर की शाम प्रदोष काल में त्रयोदशी समाप्त होकर चतुर्दशी लग जाएगी, अतः धनतेरस व यमदीपदान 18 अक्टूबर को ही शास्त्रसम्मत है।',
    shastricPramana: 'कार्तिकस्यासिते पक्षे त्रयोदश्यां निशामुखे। यमदीपं बहिर्दद्यादपमृत्युर्विनश्यति॥ (स्कन्द पुराण) — दिनद्वये प्रदोषव्याप्तौ पूर्वविद्धा ग्राह्या।',
    alternateDateNote: '19 अक्टूबर को केवल उदया तिथि है, पर प्रदोष काल में त्रयोदशी नहीं है, अतः 19 को धनतेरस नहीं हो सकता।',
  },
  {
    year: 2025,
    festivalId: 'diwali',
    festivalName: 'Diwali (Lakshmi Puja)',
    hindiName: 'दीपावली (महालक्ष्मी पूजन)',
    observedDate: '2025-10-20',
    tithiName: 'कार्तिक कृष्ण अमावस्या',
    tithiStart: '20 अक्टूबर दोपहर 03:44 से',
    tithiEnd: '21 अक्टूबर सायं 05:54 तक',
    hasConflict: true,
    conflictType: 'दो_दिन_व्याप्ति',
    karmaKala: 'प्रदोष व निशीथ काल (शाम 05:46 से रात्रि 12:40)',
    decisionReason: '20 अक्टूबर की रात्रि में प्रदोष काल, वृषभ स्थिर लग्न एवं महानिशीथ काल तीनों में अमावस्या पूर्ण रूप से विद्यमान है। 21 अक्टूबर को प्रदोष काल से पूर्व ही अमावस्या समाप्त हो जाएगी। अतः 20 अक्टूबर को ही दीपावली शास्त्रोक्त है।',
    shastricPramana: 'अमावस्यायां प्रदोषव्यापिन्यां लक्ष्मीं पूजयेत्। (धर्मसिन्धु / निर्णयसिन्धु)',
  },
  {
    year: 2025,
    festivalId: 'shivratri',
    festivalName: 'Maha Shivratri',
    hindiName: 'महाशिवरात्रि',
    observedDate: '2025-02-26',
    tithiName: 'फाल्गुन कृष्ण चतुर्दशी',
    tithiStart: '26 फरवरी प्रातः 11:08 से',
    tithiEnd: '27 फरवरी प्रातः 08:54 तक',
    hasConflict: false,
    karmaKala: 'निशीथ काल (रात्रि 12:08 से 12:58)',
    decisionReason: '26 फरवरी की मध्यरात्रि निशीथ काल में फाल्गुन कृष्ण चतुर्दशी पूर्ण रूप से व्याप्त है। 27 फरवरी की रात्रि में अमावस्या आ जाएगी।',
    shastricPramana: 'निशीथव्यापिनी ग्राह्या शिवरात्रिर्व्रते तिथिः। (ईशान संहिता)',
  },
  {
    year: 2025,
    festivalId: 'janmashtami',
    festivalName: 'Shri Krishna Janmashtami',
    hindiName: 'श्री कृष्ण जन्माष्टमी',
    observedDate: '2025-08-16',
    tithiName: 'भाद्रपद कृष्ण अष्टमी',
    tithiStart: '15 अगस्त रात्रि 11:49 से',
    tithiEnd: '16 अगस्त रात्रि 09:34 तक',
    hasConflict: true,
    conflictType: 'स्मार्त_वैष्णव_भेद',
    karmaKala: 'निशीथ काल व रोहिणी नक्षत्र',
    decisionReason: 'स्मार्त जन 15/16 की मध्यरात्रि निशीथ व्यापिनी अष्टमी में मनाएंगे, जबकि उदया तिथि व रोहिणी युत वैष्णव पर्व 16 अगस्त को मनाया जाएगा।',
    shastricPramana: 'अष्टमी रोहिणीयुक्ता निशीथे यदि लभ्यते। तदा सा मुख्या ज्ञेया... (निर्णयसिन्धु)',
  },

  // --- 2026 ---
  {
    year: 2026,
    festivalId: 'dhanteras',
    festivalName: 'Dhanteras',
    hindiName: 'धनतेरस (धन्वंतरि जयंती व यम दीपदान)',
    observedDate: '2026-11-06',
    tithiName: 'कार्तिक कृष्ण त्रयोदशी',
    tithiStart: '06 नवंबर प्रातः 10:31 से',
    tithiEnd: '07 नवंबर प्रातः 10:48 तक',
    hasConflict: true,
    conflictType: 'दो_दिन_व्याप्ति',
    karmaKala: 'प्रदोष काल (शाम 05:32 से 07:58)',
    decisionReason: '06 नवंबर को प्रातः 10:31 बजे त्रयोदशी (तेरस) का प्रवेश हो रहा है और यह संपूर्ण सायंकालीन प्रदोष काल में पूर्णतः व्याप्त है। 07 नवंबर को सूर्यास्त के प्रदोष काल में चतुर्दशी आ जाएगी। अतः धनतेरस, धन्वंतरि पूजन व यम दीपदान 06 नवंबर को ही शास्त्रसम्मत है।',
    shastricPramana: 'कार्तिकस्यासिते पक्षे त्रयोदश्यां निशामुखे। यमदीपं बहिर्दद्यादपमृत्युर्विनश्यति॥ (स्कन्द पुराण) — दिनद्वये प्रदोषव्याप्तौ पूर्वविद्धा ग्राह्या।',
    alternateDateNote: '07 नवंबर को केवल प्रातः काल उदया तिथि है, पर सायंकाल प्रदोष काल नहीं मिलेगा।',
  },
  {
    year: 2026,
    festivalId: 'narak-chaturdashi',
    festivalName: 'Narak Chaturdashi / Roop Chaudas',
    hindiName: 'नरक चतुर्दशी (रूप चौदस / छोटी दीवाली)',
    guName: 'નરક ચતુર્દશી (રૂપ ચૌદશ / કાળી ચૌદશ)',
    observedDate: '2026-11-07',
    tithiName: 'कार्तिक कृष्ण चतुर्दशी',
    tithiStart: '07 नवंबर प्रातः 10:48 से',
    tithiEnd: '08 नवंबर दोपहर 12:12 तक',
    hasConflict: true,
    conflictType: 'दो_दिन_व्याप्ति',
    karmaKala: 'प्रदोष काल (शाम 05:31 से 07:57) एवं अरुणोदय काल',
    decisionReason: '07 नवंबर को प्रातः 10:48 पर त्रयोदशी समाप्त होकर चतुर्दशी प्रारंभ होगी जो सायंकालीन प्रदोष काल में व्याप्त रहेगी। यमराज निमित्त 14 दीपकों का दीपदान एवं रूप चौदस 07 नवंबर सायंकाल संपन्न होगी। 08 नवंबर प्रातः अरुणोदय काल में चतुर्दशी में अभ्यंग स्नान होगा। अतः रूप चौदस का सायंकालीन पर्व 07 नवंबर को ही शास्त्रसम्मत है।',
    shastricPramana: 'ततोऽपराह्णे संव्याप्य नरकस्य चतुर्दशीम्। तैलाभ्यङ्गो निशि स्नाने यमलोकं न पश्यति॥ (निर्णयसिन्धु)',
    alternateDateNote: '08 नवंबर को सायंकाल अमावस्या लग जाने से रूप चौदस का दीपदान 07 नवंबर की शाम ही होगा।',
  },
  {
    year: 2026,
    festivalId: 'diwali',
    festivalName: 'Diwali (Lakshmi Puja)',
    hindiName: 'दीपावली (महालक्ष्मी पूजन)',
    observedDate: '2026-11-08',
    tithiName: 'कार्तिक कृष्ण अमावस्या',
    tithiStart: '08 नवंबर दोपहर 12:12 से',
    tithiEnd: '09 नवंबर दोपहर 01:45 तक',
    hasConflict: true,
    conflictType: 'दो_दिन_व्याप्ति',
    karmaKala: 'प्रदोष व निशीथ काल (शाम 05:31 से रात्रि 12:45)',
    decisionReason: '08 नवंबर को सायंकाल प्रदोष काल, वृषभ लग्न एवं निशीथ काल तीनों में अमावस्या व्याप्त है। 09 नवंबर की शाम प्रदोष काल में प्रतिपदा लग जाएगी। अतः दीपावली पूजन 08 नवंबर को ही होगा।',
    shastricPramana: 'अमावस्यायां प्रदोषव्यापिन्यां लक्ष्मीं पूजयेत्। (धर्मसिन्धु)',
  },
  {
    year: 2026,
    festivalId: 'shivratri',
    festivalName: 'Maha Shivratri',
    hindiName: 'महाशिवरात्रि',
    observedDate: '2026-02-15',
    tithiName: 'फाल्गुन कृष्ण चतुर्दशी',
    tithiStart: '15 फरवरी सायं 05:04 से',
    tithiEnd: '16 फरवरी सायं 05:34 तक',
    hasConflict: true,
    conflictType: 'दो_दिन_व्याप्ति',
    karmaKala: 'निशीथ काल (रात्रि 12:09 से 01:00)',
    decisionReason: '15 फरवरी की मध्यरात्रि में चतुर्दशी पूर्ण रूप से निशीथ व्यापिनी है। 16 फरवरी की मध्यरात्रि में अमावस्या आ जाएगी। अतः महाशिवरात्रि 15 फरवरी को ही होगी।',
    shastricPramana: 'निशीथव्यापिनी ग्राह्या शिवरात्रिर्व्रते तिथिः। (ईशान संहिता)',
  },
  {
    year: 2026,
    festivalId: 'rakshabandhan',
    festivalName: 'Raksha Bandhan',
    hindiName: 'रक्षाबंधन (श्रावणी पूर्णिमा)',
    observedDate: '2026-08-28',
    tithiName: 'श्रावण शुक्ल पूर्णिमा',
    tithiStart: '27 अगस्त रात्रि 08:24 से',
    tithiEnd: '28 अगस्त सायं 07:11 तक',
    hasConflict: true,
    conflictType: 'भद्रा_दोष',
    karmaKala: 'अपराह्ण काल (दोपहर 01:30 से 04:00)',
    decisionReason: '28 अगस्त को भद्रा प्रातः ही समाप्त हो जाएगी, और पूर्णिमा अपराह्ण काल में विद्यमान रहेगी। भद्रारहित अपराह्ण काल में रक्षाबंधन शास्त्रसम्मत है।',
    shastricPramana: 'भद्रायां द्वे न कर्तव्ये श्रावणी फाल्गुनी तथा। भद्रान्ते कार्यं रक्षाबन्धनम्॥ (निर्णयसिन्धु)',
  },

  // --- 2027 ---
  {
    year: 2027,
    festivalId: 'dhanteras',
    festivalName: 'Dhanteras',
    hindiName: 'धनतेरस (धनत्रयोदशी)',
    observedDate: '2027-10-28',
    tithiName: 'कार्तिक कृष्ण त्रयोदशी',
    tithiStart: '27 अक्टूबर रात्रि 10:14 से',
    tithiEnd: '28 अक्टूबर रात्रि 08:35 तक',
    hasConflict: true,
    conflictType: 'दो_दिन_व्याप्ति',
    karmaKala: 'प्रदोष काल (शाम 05:40 से 08:05)',
    decisionReason: '28 अक्टूबर को पूरे प्रदोष काल में त्रयोदशी विद्यमान है (रात 08:35 तक)। अतः 28 अक्टूबर ही धनतेरस का शुद्ध दिन है।',
    shastricPramana: 'प्रदोषव्यापिनी ग्राह्या त्रयोदशी यमदीपदाने। (निर्णयसिन्धु)',
  },
  {
    year: 2027,
    festivalId: 'diwali',
    festivalName: 'Diwali (Lakshmi Puja)',
    hindiName: 'दीपावली (महालक्ष्मी पूजन)',
    observedDate: '2027-10-29',
    tithiName: 'कार्तिक कृष्ण अमावस्या',
    tithiStart: '29 अक्टूबर प्रातः 06:42 से',
    tithiEnd: '30 अक्टूबर प्रातः 04:36 तक',
    hasConflict: false,
    karmaKala: 'प्रदोष व निशीथ काल',
    decisionReason: '29 अक्टूबर को शाम के प्रदोष व अर्धरात्रि निशीथ काल में अमावस्या का पूर्ण संयोग है।',
    shastricPramana: 'कार्तिकस्यासिते पक्षे प्रदोषे वा निशीथके। पूजनीया महालक्ष्मीः... (निर्णयसिन्धु)',
  },
  {
    year: 2027,
    festivalId: 'shivratri',
    festivalName: 'Maha Shivratri',
    hindiName: 'महाशिवरात्रि',
    observedDate: '2027-03-06',
    tithiName: 'फाल्गुन कृष्ण चतुर्दशी',
    tithiStart: '06 मार्च प्रातः 10:48 से',
    tithiEnd: '07 मार्च प्रातः 08:14 तक',
    hasConflict: false,
    karmaKala: 'निशीथ काल (रात्रि 12:07 से 12:57)',
    decisionReason: '06 मार्च की रात निशीथ में चतुर्दशी रहेगी, 07 मार्च की रात अमावस्या रहेगी।',
    shastricPramana: 'निशीथव्यापिनी ग्राह्या शिवरात्रिः। (धर्मसिन्धु)',
  },

  // --- 2028 ---
  {
    year: 2028,
    festivalId: 'dhanteras',
    festivalName: 'Dhanteras',
    hindiName: 'धनतेरस (धनत्रयोदशी)',
    observedDate: '2028-10-16',
    tithiName: 'कार्तिक कृष्ण त्रयोदशी',
    tithiStart: '16 अक्टूबर प्रातः 04:12 से',
    tithiEnd: '17 अक्टूबर प्रातः 02:40 तक',
    hasConflict: false,
    karmaKala: 'प्रदोष काल (शाम 05:51 से 08:16)',
    decisionReason: '16 अक्टूबर को दिन भर एवं सायंकाल प्रदोष काल में त्रयोदशी विद्यमान है।',
    shastricPramana: 'कार्तिकस्यासिते पक्षे त्रयोदश्यां निशामुखे... (स्कन्द पुराण)',
  },
  {
    year: 2028,
    festivalId: 'diwali',
    festivalName: 'Diwali (Lakshmi Puja)',
    hindiName: 'दीपावली (महालक्ष्मी पूजन)',
    observedDate: '2028-10-17',
    tithiName: 'कार्तिक कृष्ण अमावस्या',
    tithiStart: '17 अक्टूबर रात्रि 12:48 से',
    tithiEnd: '18 अक्टूबर रात्रि 11:15 तक',
    hasConflict: false,
    karmaKala: 'प्रदोष व निशीथ काल',
    decisionReason: '17 अक्टूबर को प्रदोष काल में अमावस्या की निर्विवाद उपस्थिति है।',
    shastricPramana: 'प्रदोषव्यापिनी चेदमावस्या तदैव पूजा कार्या। (धर्मसिन्धु)',
  },

  // --- 2029 ---
  {
    year: 2029,
    festivalId: 'dhanteras',
    festivalName: 'Dhanteras',
    hindiName: 'धनतेरस (धनत्रयोदशी)',
    observedDate: '2029-11-03',
    tithiName: 'कार्तिक कृष्ण त्रयोदशी',
    tithiStart: '03 नवंबर दोपहर 01:22 से',
    tithiEnd: '04 नवंबर दोपहर 02:48 तक',
    hasConflict: true,
    conflictType: 'दो_दिन_व्याप्ति',
    karmaKala: 'प्रदोष काल (शाम 05:34 से 08:00)',
    decisionReason: '03 नवंबर को सायंकाल प्रदोष काल में त्रयोदशी का प्रवेश हो चुका है, अतः यमदीपदान व धातु क्रय 03 नवंबर को प्रदोष काल में ही संपन्न होगा।',
    shastricPramana: 'दिनद्वये प्रदोषव्याप्तौ पूर्वदिने एव कुर्यात्। (निर्णयसिन्धु)',
  },
  {
    year: 2029,
    festivalId: 'diwali',
    festivalName: 'Diwali (Lakshmi Puja)',
    hindiName: 'दीपावली (महालक्ष्मी पूजन)',
    observedDate: '2029-11-05',
    tithiName: 'कार्तिक कृष्ण अमावस्या',
    tithiStart: '05 नवंबर सायं 04:10 से',
    tithiEnd: '06 नवंबर सायं 05:22 तक',
    hasConflict: true,
    conflictType: 'दो_दिन_व्याप्ति',
    karmaKala: 'प्रदोष व निशीथ काल',
    decisionReason: '05 नवंबर को प्रदोष व निशीथ दोनों में अमावस्या है। 06 नवंबर को सूर्यास्त के तुरंत बाद अमावस्या समाप्त हो जाएगी।',
    shastricPramana: 'प्रदोषव्यापिनी अमा ग्राह्या। (धर्मसिन्धु)',
  },

  // --- 2030 ---
  {
    year: 2030,
    festivalId: 'dhanteras',
    festivalName: 'Dhanteras',
    hindiName: 'धनतेरस (धनत्रयोदशी)',
    observedDate: '2030-10-24',
    tithiName: 'कार्तिक कृष्ण त्रयोदशी',
    tithiStart: '24 अक्टूबर प्रातः 07:18 से',
    tithiEnd: '25 अक्टूबर प्रातः 08:44 तक',
    hasConflict: true,
    conflictType: 'दो_दिन_व्याप्ति',
    karmaKala: 'प्रदोष काल (शाम 05:43 से 08:08)',
    decisionReason: '24 अक्टूबर को संपूर्ण दिन व सायंकाल प्रदोष में त्रयोदशी विद्यमान है। 25 अक्टूबर को केवल सुबह 08:44 तक ही त्रयोदशी है, शाम को नहीं। अतः 24 अक्टूबर ही शास्त्रसम्मत है।',
    shastricPramana: 'कार्तिकस्यासिते पक्षे त्रयोदश्यां निशामुखे... (स्कन्द पुराण)',
  },
  {
    year: 2030,
    festivalId: 'diwali',
    festivalName: 'Diwali (Lakshmi Puja)',
    hindiName: 'दीपावली (महालक्ष्मी पूजन)',
    observedDate: '2030-10-26',
    tithiName: 'कार्तिक कृष्ण अमावस्या',
    tithiStart: '26 अक्टूबर प्रातः 09:30 से',
    tithiEnd: '27 अक्टूबर प्रातः 10:15 तक',
    hasConflict: false,
    karmaKala: 'प्रदोष व निशीथ काल',
    decisionReason: '26 अक्टूबर को प्रदोष काल एवं निशीथ दोनों में अमावस्या पूर्ण रूप से प्राप्त हो रही है।',
    shastricPramana: 'अमावस्यायां प्रदोषे लक्ष्मीपूजनम्। (निर्णयसिन्धु)',
  },

  // --- 2031 ---
  {
    year: 2031,
    festivalId: 'dhanteras',
    festivalName: 'Dhanteras',
    hindiName: 'धनतेरस (धनत्रयोदशी)',
    observedDate: '2031-11-12',
    tithiName: 'कार्तिक कृष्ण त्रयोदशी',
    tithiStart: '12 नवंबर प्रातः 03:15 से',
    tithiEnd: '13 नवंबर प्रातः 04:30 तक',
    hasConflict: false,
    karmaKala: 'प्रदोष काल (शाम 05:29 से 07:54)',
    decisionReason: '12 नवंबर को प्रदोष काल में त्रयोदशी शत-प्रतिशत व्याप्त है।',
    shastricPramana: 'प्रदोषव्यापिनी त्रयोदशी ग्राह्या। (धर्मसिन्धु)',
  },
  {
    year: 2031,
    festivalId: 'diwali',
    festivalName: 'Diwali (Lakshmi Puja)',
    hindiName: 'दीपावली (महालक्ष्मी पूजन)',
    observedDate: '2031-11-14',
    tithiName: 'कार्तिक कृष्ण अमावस्या',
    tithiStart: '14 नवंबर प्रातः 05:40 से',
    tithiEnd: '15 नवंबर प्रातः 06:10 तक',
    hasConflict: false,
    karmaKala: 'प्रदोष व निशीथ काल',
    decisionReason: '14 नवंबर को रात भर अमावस्या रहेगी। अतः महालक्ष्मी पूजन 14 नवंबर को ही होगा।',
    shastricPramana: 'कार्तिकस्यासिते पक्षे प्रदोषे वा निशीथके। पूजनीया महालक्ष्मीः... (निर्णयसिन्धु)',
  },

  // --- 2032 ---
  {
    year: 2032,
    festivalId: 'dhanteras',
    festivalName: 'Dhanteras',
    hindiName: 'धनतेरस (धनत्रयोदशी)',
    observedDate: '2032-10-31',
    tithiName: 'कार्तिक कृष्ण त्रयोदशी',
    tithiStart: '31 अक्टूबर दोपहर 12:40 से',
    tithiEnd: '01 नवंबर दोपहर 01:50 तक',
    hasConflict: true,
    conflictType: 'दो_दिन_व्याप्ति',
    karmaKala: 'प्रदोष काल (शाम 05:36 से 08:02)',
    decisionReason: '31 अक्टूबर को शाम प्रदोष काल में त्रयोदशी है। 01 नवंबर की शाम को चतुर्दशी लग जाएगी, अतः धनतेरस 31 अक्टूबर को मनेगी।',
    shastricPramana: 'दिनद्वये प्रदोषव्याप्तौ पूर्वदिने एव कुर्यात्। (निर्णयसिन्धु)',
  },
  {
    year: 2032,
    festivalId: 'diwali',
    festivalName: 'Diwali (Lakshmi Puja)',
    hindiName: 'दीपावली (महालक्ष्मी पूजन)',
    observedDate: '2032-11-02',
    tithiName: 'कार्तिक कृष्ण अमावस्या',
    tithiStart: '02 नवंबर दोपहर 02:30 से',
    tithiEnd: '03 नवंबर दोपहर 03:15 तक',
    hasConflict: true,
    conflictType: 'दो_दिन_व्याप्ति',
    karmaKala: 'प्रदोष काल (शाम 05:35 से 08:01)',
    decisionReason: '02 नवंबर की शाम प्रदोष काल में अमावस्या प्राप्त हो रही है। 03 नवंबर की शाम को प्रतिपदा रहेगी।',
    shastricPramana: 'अमावस्यायां प्रदोषव्यापिन्यां लक्ष्मीं पूजयेत्। (धर्मसिन्धु)',
  },

  // --- 2033 ---
  {
    year: 2033,
    festivalId: 'dhanteras',
    festivalName: 'Dhanteras',
    hindiName: 'धनतेरस (धनत्रयोदशी)',
    observedDate: '2033-10-20',
    tithiName: 'कार्तिक कृष्ण त्रयोदशी',
    tithiStart: '20 अक्टूबर प्रातः 08:05 से',
    tithiEnd: '21 अक्टूबर प्रातः 09:20 तक',
    hasConflict: true,
    conflictType: 'दो_दिन_व्याप्ति',
    karmaKala: 'प्रदोष काल (शाम 05:46 से 08:12)',
    decisionReason: '20 अक्टूबर को प्रदोष काल में त्रयोदशी उपस्थित है। 21 अक्टूबर की शाम को चतुर्दशी आ जाएगी।',
    shastricPramana: 'कार्तिकस्यासिते पक्षे त्रयोदश्यां निशामुखे... (स्कन्द पुराण)',
  },
  {
    year: 2033,
    festivalId: 'diwali',
    festivalName: 'Diwali (Lakshmi Puja)',
    hindiName: 'दीपावली (महालक्ष्मी पूजन)',
    observedDate: '2033-10-22',
    tithiName: 'कार्तिक कृष्ण अमावस्या',
    tithiStart: '22 अक्टूबर प्रातः 10:15 से',
    tithiEnd: '23 अक्टूबर प्रातः 11:00 तक',
    hasConflict: false,
    karmaKala: 'प्रदोष व निशीथ काल',
    decisionReason: '22 अक्टूबर को सायंकाल प्रदोष व मध्यरात्रि निशीथ दोनों में अमावस्या उपलब्ध है।',
    shastricPramana: 'प्रदोषव्यापिनी अमा ग्राह्या। (निर्णयसिन्धु)',
  },

  // --- 2034 ---
  {
    year: 2034,
    festivalId: 'dhanteras',
    festivalName: 'Dhanteras',
    hindiName: 'धनतेरस (धनत्रयोदशी)',
    observedDate: '2034-11-08',
    tithiName: 'कार्तिक कृष्ण त्रयोदशी',
    tithiStart: '08 नवंबर दोपहर 02:10 से',
    tithiEnd: '09 नवंबर दोपहर 03:25 तक',
    hasConflict: true,
    conflictType: 'दो_दिन_व्याप्ति',
    karmaKala: 'प्रदोष काल (शाम 05:31 से 07:56)',
    decisionReason: '08 नवंबर को शाम प्रदोष काल में त्रयोदशी व्याप्त है। 09 नवंबर की शाम को चतुर्दशी आ जाएगी। अतः 08 नवंबर को ही धनतेरस का निर्णय है।',
    shastricPramana: 'दिनद्वये प्रदोषव्याप्तौ पूर्वदिने एव कुर्यात्। (धर्मसिन्धु)',
  },
  {
    year: 2034,
    festivalId: 'diwali',
    festivalName: 'Diwali (Lakshmi Puja)',
    hindiName: 'दीपावली (महालक्ष्मी पूजन)',
    observedDate: '2034-11-10',
    tithiName: 'कार्तिक कृष्ण अमावस्या',
    tithiStart: '10 नवंबर सायं 04:05 से',
    tithiEnd: '11 नवंबर सायं 04:50 तक',
    hasConflict: true,
    conflictType: 'दो_दिन_व्याप्ति',
    karmaKala: 'प्रदोष व निशीथ काल',
    decisionReason: '10 नवंबर की रात्रि में प्रदोष व निशीथ दोनों में अमावस्या व्याप्त है। 11 नवंबर की शाम प्रदोष से पूर्व ही अमावस्या समाप्त हो जाएगी।',
    shastricPramana: 'अमावस्यायां प्रदोषे निशीथे च लक्ष्मीपूजनम्। (निर्णयसिन्धु)',
  },

  // --- 2035 ---
  {
    year: 2035,
    festivalId: 'dhanteras',
    festivalName: 'Dhanteras',
    hindiName: 'धनतेरस (धनत्रयोदशी)',
    observedDate: '2035-10-28',
    tithiName: 'कार्तिक कृष्ण त्रयोदशी',
    tithiStart: '28 अक्टूबर प्रातः 06:15 से',
    tithiEnd: '29 अक्टूबर प्रातः 07:40 तक',
    hasConflict: true,
    conflictType: 'दो_दिन_व्याप्ति',
    karmaKala: 'प्रदोष काल (शाम 05:40 से 08:05)',
    decisionReason: '28 अक्टूबर को सायंकाल प्रदोष काल में त्रयोदशी पूर्ण रूप से उपस्थित है। 29 अक्टूबर की शाम प्रदोष काल में चतुर्दशी रहेगी। अतः 28 अक्टूबर को ही धनतेरस शास्त्रसम्मत है।',
    shastricPramana: 'कार्तिकस्यासिते पक्षे त्रयोदश्यां निशामुखे... (स्कन्द पुराण)',
  },
  {
    year: 2035,
    festivalId: 'diwali',
    festivalName: 'Diwali (Lakshmi Puja)',
    hindiName: 'दीपावली (महालक्ष्मी पूजन)',
    observedDate: '2035-10-30',
    tithiName: 'कार्तिक कृष्ण अमावस्या',
    tithiStart: '30 अक्टूबर प्रातः 08:30 से',
    tithiEnd: '31 अक्टूबर प्रातः 09:10 तक',
    hasConflict: false,
    karmaKala: 'प्रदोष व निशीथ काल',
    decisionReason: '30 अक्टूबर को पूरे प्रदोष काल एवं निशीथ काल में अमावस्या उपस्थित रहेगी।',
    shastricPramana: 'प्रदोषव्यापिनी अमा ग्राह्या। (धर्मसिन्धु)',
  },
];

/**
 * Explains how Tithi is mathematically and astronomically computed
 */
export function getTithiCalculationExplanation(language: string = 'hi') {
  return {
    formula: '(λ_moon - λ_sun) mod 360° / 12°',
    steps: [
      {
        step: 1,
        title: language === 'en' ? 'Calculate Apparent Longitudes' : language === 'gu' ? 'ચંદ્ર અને સૂર્યના ચોક્કસ ભોગാംશ' : 'सूर्य एवं चन्द्रमा के शुद्ध भोग अंश',
        desc: language === 'en'
          ? 'NASA JPL / Swiss Ephemeris sidereal planetary algorithms calculate exact sub-second coordinates with Lahiri Chitrapaksha Ayanamsha.'
          : language === 'gu'
          ? 'નાસા જેપીએલ તથા લહિરી ચિત્રપક્ષ અયનાંશ આધારિત શુદ્ધ ખગોળીય ગણતરીથી ચંદ્ર (λ_moon) અને સૂર્ય (λ_sun) ના કોણીય અંશ મેળવવામાં આવે છે.'
          : 'नासा JPL / स्विस एफिमरिस आधारित उच्च-परिशुद्ध खगोलीय एल्गोरिदम से लाहिरी चित्रपक्ष अयनांश घटाकर सूर्य (λ_sun) व चन्द्रमा (λ_moon) के शुद्ध निरयण भोग अंश ज्ञात किए जाते हैं।'
      },
      {
        step: 2,
        title: language === 'en' ? 'Determine Angular Difference (Elongation)' : language === 'gu' ? 'કોણીય અંતર (વિસ્તાર)' : 'कोणीय अन्तर (Elongation)',
        desc: language === 'en'
          ? 'Elongation = (Moon_Longitude - Sun_Longitude) % 360°. When Moon is conjunct with Sun (0°), it is Amavasya. At 180°, it is Purnima.'
          : language === 'gu'
          ? 'કોણીય અંતર = (ચંદ્ર - સૂર્ય) % ૩૬૦°. ૦° પર દર્શ અમાવાસ્યા અને ૧૮૦° પર પૂર્ણિમા થાય છે.'
          : 'कोणीय अन्तर = (चन्द्रमा - सूर्य) % ३६०°। जब दोनों शून्य अंश पर एक साथ होते हैं तो अमावस्या, और १८० अंश पर विपरीत होते हैं तो पूर्णिमा होती है।'
      },
      {
        step: 3,
        title: language === 'en' ? 'Divide into 12° Increments' : language === 'gu' ? '૧૨ અંશ પ્રતિ તિથિ વિભાજન' : '१२ अंश प्रति तिथि विभाजन',
        desc: language === 'en'
          ? 'Each 12° progression marks one tithi (Floor(Elongation / 12) + 1). Total 30 tithis (1-15 Shukla, 16-30 Krishna).'
          : language === 'gu'
          ? 'પ્રત્યેક ૧૨ અંશ વધતાં એક નવી તિથિ બને છે. કુલ ૩૦ તિથિઓ (૧-૧૫ શુક્લ, ૧૬-૩૦ કૃષ્ણ).'
          : 'प्रत्येक १२ अंश की वृद्धि एक तिथि बनाती है (Floor(अंतर / १२) + १)। कुल ३० तिथियां होती हैं (१ से १५ शुक्ल पक्ष, १६ से ३० कृष्ण पक्ष)।'
      },
      {
        step: 4,
        title: language === 'en' ? 'Variable Duration (19h to 26h)' : language === 'gu' ? 'તિથિનો પરિવર્તનશીલ સમયગાળો' : 'तिथि का परिवर्तनशील मान (१९ से २६ घंटे)',
        desc: language === 'en'
          ? "Due to Kepler's second law and the Moon's elliptical orbit (speed varying 11°48' to 15°14' per day), tithis vary from ~19 to ~26 hours. Hence a tithi can start at any minute of the day!"
          : language === 'gu'
          ? 'કેપ્લરના નિયમ મુજબ ચંદ્રની અંડાકાર કક્ષાને કારણે ચંદ્રની દૈનિક ગતિ બદલાય છે, જેથી તિથિનો સમય ૧૯ થી ૨૬ કલાક વચ્ચે બદલાય છે. આથી તિથિ દિવસના કોઈપણ સમયે શરૂ કે સમાપ્ત થઈ શકે છે.'
          : 'केप्लर के नियम और चन्द्रमा की अण्डाकार कक्षा के कारण चन्द्रमा की दैनिक गति ११°४८\' से १५°१४\' तक घटती-बढ़ती है। इसी कारण तिथि का मान १९ से २६ घण्टे के बीच बदलता रहता है।'
      },
      {
        step: 5,
        title: language === 'en' ? 'Root-Finding Exact Minute Calculation' : language === 'gu' ? 'ચોક્કસ મિનિટ નિર્ધારણ (દ્વિભાજન પદ્ધતિ)' : 'सूक्ष्म मिनट-सेकंड निर्धारण (Bisection Method)',
        desc: language === 'en'
          ? 'Our engine runs iterative mathematical root-finding (bisection) to locate the precise second when the Moon crosses the exact 12° boundary.'
          : language === 'gu'
          ? 'પંચાંગ એન્જિન બાયસેક્શન રૂટ-ફાઇન્ડિંગ દ્વારા તે ક્ષણ શોધે છે જ્યારે ચંદ્ર બરાબર ૧૨ અંશનો ગુણક પાર કરે છે.'
          : 'हमारा पंचांग इंजन बायसेक्शन (द्विभाजन) गणितीय विधि से वह सूक्ष्म सेकंड खोजता है जब चन्द्रमा ठीक १२ अंश की सीमा पार करता है, जिससे तिथि का सटीक प्रारंभ व समाप्ति समय मिलता है।'
      }
    ]
  };
}

/**
 * Multi-lingual helpers for 10-Year Conflict Resolver to ensure zero Hindi/English mixing.
 */
export const formatFestivalDisplayName = (rec: TenYearFestivalRecord, lang: string): string => {
  if (lang === 'en') return rec.festivalName;
  if (lang === 'gu') {
    if (rec.festivalId === 'dhanteras') return 'ધનતેરસ (ધનત્રયોદશી અને યમ દીપદાન)';
    if (rec.festivalId === 'diwali') return 'દીપાવલી (મહાલક્ષ્મી પૂજન)';
    if (rec.festivalId === 'shivratri') return 'મહાશિવરાત્રિ';
    if (rec.festivalId === 'janmashtami') return 'શ્રીકૃષ્ણ જન્માષ્ટમી';
    if (rec.festivalId === 'rakshabandhan') return 'રક્ષાબંધન (બળેવ)';
    if (rec.festivalId === 'ramnavami') return 'શ્રી રામ નવમી';
    if (rec.festivalId === 'ganeshotsav') return 'શ્રી ગણેશ ચતુર્થી';
    if (rec.festivalId === 'karwachauth') return 'કરવા ચોથ';
    if (rec.festivalId === 'holika') return 'હોલિકા દહન';
    return rec.guName || rec.hindiName;
  }
  return rec.hindiName;
};

export const formatConflictLabel = (conflictType: string | undefined, lang: string): string => {
  if (!conflictType) return lang === 'en' ? 'Dual-Tithi Span' : lang === 'gu' ? 'દ્વિ-તિથિ સંશય' : 'द्वि-तिथि संशय';
  if (lang === 'en') {
    switch (conflictType) {
      case 'दो_दिन_व्याप्ति': return '2-Day Tithi Span (Dual-Day)';
      case 'तिथि_क्षय': return 'Tithi Kshaya (Omitted Tithi)';
      case 'तिथि_वृद्धि': return 'Tithi Vriddhi (Extended Tithi)';
      case 'भद्रा_दोष': return 'Bhadra Avoidance (Muhurta)';
      case 'स्मार्त_वैष्णव_भेद': return 'Smartha vs Vaishnava Tradition';
      default: return 'Dual-Tithi Conflict';
    }
  }
  if (lang === 'gu') {
    switch (conflictType) {
      case 'दो_दिन_व्याप्ति': return 'બે દિવસ વ્યાપ્તિ';
      case 'तिथि_क्षय': return 'તિથિ ક્ષય';
      case 'तिथि_वृद्धि': return 'તિથિ વૃદ્ધિ';
      case 'भद्रा_दोष': return 'ભદ્રા દોષ નિવારણ';
      case 'स्मार्त_वैष्णव_भेद': return 'સ્માર્ત-વૈષ્ણવ મતભેદ';
      default: return 'દ્વિ-તિથિ સંશય';
    }
  }
  return conflictType.replace(/_/g, ' ');
};

export const formatTithiTiming = (timing: string, lang: string): string => {
  if (!timing || lang === 'hi') return timing;
  if (lang === 'en') {
    let s = timing;
    const months: [RegExp, string][] = [
      [/जनवरी/g, 'Jan'], [/फरवरी/g, 'Feb'], [/मार्च/g, 'Mar'], [/अप्रैल/g, 'Apr'],
      [/मई/g, 'May'], [/जून/g, 'Jun'], [/जुलाई/g, 'Jul'], [/अगस्त/g, 'Aug'],
      [/सितंबर/g, 'Sep'], [/अक्टूबर/g, 'Oct'], [/नवंबर/g, 'Nov'], [/दिसंबर/g, 'Dec']
    ];
    for (const [re, rep] of months) s = s.replace(re, rep);
    return s
      .replace(/दोपहर/g, 'Afternoon')
      .replace(/सायं|शाम/g, 'Evening')
      .replace(/रात|रात्रि/g, 'Night')
      .replace(/प्रातः|सुबह/g, 'Morning')
      .replace(/से/g, 'from')
      .replace(/तक/g, 'to');
  }
  if (lang === 'gu') {
    let s = timing;
    const monthsGu: [RegExp, string][] = [
      [/जनवरी/g, 'જાન્યુઆરી'], [/फरवरी/g, 'ફેબ્રુઆરી'], [/मार्च/g, 'માર્ચ'], [/अप्रैल/g, 'એપ્રિલ'],
      [/मई/g, 'મે'], [/जून/g, 'જૂન'], [/जुલાઈ/g, 'જુલાઈ'], [/अगस्त/g, 'ઓગસ્ટ'],
      [/सितंबर/g, 'સપ્ટેમ્બર'], [/अक्टूबर/g, 'ઓક્ટોબર'], [/नवंबर/g, 'નવેમ્બર'], [/दिसंबर/g, 'ડિસેમ્બર']
    ];
    for (const [re, rep] of monthsGu) s = s.replace(re, rep);
    return s
      .replace(/दोपहर/g, 'બપોરે')
      .replace(/सायं|शाम/g, 'સાંજે')
      .replace(/रात|रात्रि/g, 'રાત્રે')
      .replace(/प्रातः|सुबह/g, 'સવારે')
      .replace(/से/g, 'થી')
      .replace(/तक/g, 'સુધી');
  }
  return timing;
};

export const formatKarmaKala = (karmaKala: string, lang: string): string => {
  if (!karmaKala || lang === 'hi') return karmaKala;
  if (lang === 'en') {
    return karmaKala
      .replace(/प्रदोष काल/g, 'Pradosha Kaala (Sunset Twilight)')
      .replace(/निशीथ काल/g, 'Nishita Kaala (Midnight Muhurta)')
      .replace(/मध्याह्न काल/g, 'Madhyahna Kaala (Solar Noon)')
      .replace(/उदया तिथि/g, 'Udaya Tithi (Sunrise)')
      .replace(/अपराह्ण काल/g, 'Aparahna Kaala (Afternoon)')
      .replace(/शाम/g, 'Evening')
      .replace(/रात्रि|रात/g, 'Night')
      .replace(/सुबह|प्रातः/g, 'Morning')
      .replace(/दोपहर/g, 'Afternoon')
      .replace(/से/g, 'to')
      .replace(/तक/g, 'until');
  }
  if (lang === 'gu') {
    return karmaKala
      .replace(/प्रदोष काल/g, 'પ્રદોષ કાળ (સૂર્યાસ્ત સાંજ)')
      .replace(/निशीथ काल/g, 'નિશીથ કાળ (મધ્યરાત્રિ)')
      .replace(/मध्याह्न काल/g, 'મધ્યાહ્ન કાળ (બપોર)')
      .replace(/उदया तिथि/g, 'ઉદયા તિથિ (સૂર્યોદય)')
      .replace(/अपराह्ण काल/g, 'અપરાહ્ન કાળ')
      .replace(/शाम/g, 'સાંજે')
      .replace(/रात्रि|रात/g, 'રાત્રે')
      .replace(/सुबह|प्रातः/g, 'સવારે')
      .replace(/दोपहर/g, 'બપોરે')
      .replace(/से/g, 'થી')
      .replace(/तक/g, 'સુધી');
  }
  return karmaKala;
};

export const formatDecisionReason = (rec: TenYearFestivalRecord, lang: string): string => {
  if (lang === 'hi') return rec.decisionReason;
  if (lang === 'en') {
    // Check specific festival types for fluent English explanations
    if (rec.festivalId === 'dhanteras') {
      return `On ${rec.observedDate}, Trayodashi is fully present during Pradosha Kaala (evening after sunset). Under Skanda Purana and Nirnayasindhu rules, Dhanteras & Yama Deepam must be observed when Trayodashi covers Pradosha Kaala. On the succeeding day, Trayodashi ends before or at sunset, making this date authoritative.`;
    }
    if (rec.festivalId === 'narak-chaturdashi') {
      return `Chaturdashi commences at 10:48 AM on ${rec.observedDate} and covers evening Pradosha Kaala. Under Nirnayasindhu, 14-lamp Yama Deepam and Roop Chaudas are observed on the evening Chaturdashi touches Pradosha. Abhyanga Snana occurs before sunrise on the succeeding morning.`;
    }
    if (rec.festivalId === 'diwali') {
      return `On ${rec.observedDate}, Amavasya spans Pradosha Kaala, Vrishabha Sthira Lagna, and Nishita Kaala. Per Dharmasindhu, Lakshmi Puja is exclusively observed on the night Amavasya touches Pradosha.`;
    }
    if (rec.festivalId === 'shivratri') {
      return `Maha Shivratri requires Chaturdashi to be present at midnight (Nishita Kaala). On ${rec.observedDate}, Phalguna Krishna Chaturdashi covers the entire midnight hour, fulfilling the Ishana Samhita mandate.`;
    }
    if (rec.festivalId === 'janmashtami') {
      return `Ashtami Tithi prevails at midnight (Nishita Kaala) on ${rec.observedDate}, matching the authentic Rohini Nakshatra alignment for Shri Krishna Janmashtami.`;
    }
    if (rec.festivalId === 'rakshabandhan') {
      return `On ${rec.observedDate}, Purnima prevails during Aparahna (afternoon) and is free from the inauspicious Bhadra period. Per Hemadri, Raksha Bandhan is observed on this pure auspicious window.`;
    }
    // Generic fallback with translation
    return rec.decisionReason
      .replace(/अक्टूबर|नवंबर|दिसंबर|जनवरी|फरवरी|मार्च|अप्रैल|मई|जून|जुलाई|अगस्त|सितंबर/g, 'Date')
      .replace(/को सायंकाल/g, ' in the evening')
      .replace(/प्रदोष काल में/g, ' during Pradosha Kaala')
      .replace(/शत-प्रतिशत व्याप्त है/g, ' is 100% prevalent')
      .replace(/अतः .* शास्त्रसम्मत है।?/g, 'Hence, this date is authentic and certified per Shastric injunctions.');
  }
  if (lang === 'gu') {
    if (rec.festivalId === 'dhanteras') {
      return `${rec.observedDate} ના રોજ સાંજે પ્રદોષ કાળમાં ત્રયોદશી વ્યાપ્ત છે. સ્કંદ પુરાણ મુજબ ધનતેરસ અને યમ દીપદાન પ્રદોષ કાળમાં ત્રયોદશી હોવાથી આ જ દિવસે શાસ્ત્રસંમત છે.`;
    }
    if (rec.festivalId === 'narak-chaturdashi') {
      return `${rec.observedDate} ના રોજ સવારે ૧૦:૪૮ વાગ્યે ચતુર્દશી શરૂ થઈ સાંજે પ્રદોષ કાળમાં વ્યાપ્ત રહેશે. નિર્ણયસિંધુ મુજબ ૧૪ દીવાઓનું યમ દીપદાન અને રૂપ ચૌદશ આ જ સાંજે શાસ્ત્રસંમત છે.`;
    }
    if (rec.festivalId === 'diwali') {
      return `${rec.observedDate} ની રાત્રિએ પ્રદોષ કાળ, વૃષભ સ્થિર લગ્ન અને નિશીથ કાળ ત્રણેયમાં અમાસ વિદ્યમાન છે. ધર્મસિંધુ મુજબ આ જ દિવસે દીપાવલી માન્ય છે.`;
    }
    if (rec.festivalId === 'shivratri') {
      return `મહાશિવરાત્રિ માટે નિશીથ કાળ (મધ્યરાત્રિ) માં ચતુર્દશી હોવી અનિવાર્ય છે, જે ${rec.observedDate} ના રોજ સંપૂર્ણ વ્યાપ્ત છે.`;
    }
  }
  return rec.decisionReason;
};

export const formatAlternateNote = (rec: TenYearFestivalRecord, lang: string): string => {
  if (!rec.alternateDateNote || lang === 'hi') return rec.alternateDateNote || '';
  if (lang === 'en') {
    if (rec.festivalId === 'dhanteras') {
      return 'The subsequent day only has Udaya Tithi (sunrise touch) but Trayodashi is absent during evening Pradosha; hence observing Dhanteras on the next day is invalid per Nirnayasindhu.';
    }
    if (rec.festivalId === 'narak-chaturdashi') {
      return 'On the subsequent evening, Amavasya takes over before Pradosha begins; thus Roop Chaudas Deepam cannot be deferred to the next evening.';
    }
    if (rec.festivalId === 'diwali') {
      return 'On the other date, Amavasya ends before evening Pradosha commences, so Lakshmi Puja cannot be performed on that night.';
    }
    return 'The alternate date lacks the required Shastric Karma-Kala (muhurta span) and is rejected per Dharmashastra.';
  }
  if (lang === 'gu') {
    if (rec.festivalId === 'dhanteras') {
      return 'બીજા દિવસે માત્ર ઉદયા તિથિ છે, પરંતુ સાંજના પ્રદોષ કાળમાં તેરસ નથી, તેથી બીજા દિવસે ધનતેરસ ન થઈ શકે.';
    }
    if (rec.festivalId === 'narak-chaturdashi') {
      return 'બીજા દિવસે સાંજે અમાસ આવી જતી હોવાથી રૂપ ચૌદશનો દીપદાન આ જ સાંજે શક્ય છે.';
    }
    return 'બીજા દિવસે શાસ્ત્રોક્ત કર્મકાળ ઉપલબ્ધ ન હોવાથી તે ત્યાજ્ય છે.';
  }
  return rec.alternateDateNote;
};

export interface DailyFestivalDecision {
  isFestivalToday: boolean;
  festivalId?: string;
  festivalName: string;
  title: string;
  badgeText: string;
  bannerNotice: string;
  proofTitle: string;
  shlokQuote: string;
  shlokSource: string;
  explanation: string;
  ruleCategory: 'pradosha' | 'nishita' | 'madhyahna' | 'udaya' | 'general';
  nextTithiFestivalBadge?: string;
}

function formatClockTime(d?: Date): string {
  if (!d || !(d instanceof Date) || isNaN(d.getTime())) return '';
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/**
 * Calculates authoritative, date-specific Shastric decisions for any chosen day.
 * Distinguishes accurately between Dhanteras, Narak Chaturdashi, Diwali, Govardhan Puja, Bhai Dooj,
 * Ekadashi, Shivratri, and regular Tithis. Eliminates false Dhanteras reporting on unrelated dates.
 */
export function getDailyFestivalDecision(
  targetDate: Date,
  panchang?: VedicPanchangData | null,
  lang: string = 'hi'
): DailyFestivalDecision {
  const normalizedLang = lang.slice(0, 2).toLowerCase();
  const year = targetDate.getFullYear();
  const festivals = getFestivalsForYear(year);

  // Check if targetDate matches any calculated festival
  const matched = festivals.find((f) => {
    if (!f.date) return false;
    return (
      f.date.getFullYear() === targetDate.getFullYear() &&
      f.date.getMonth() === targetDate.getMonth() &&
      f.date.getDate() === targetDate.getDate()
    );
  });

  const spanEndStr = panchang?.tithiSpan ? formatClockTime(panchang.tithiSpan.end) : '';

  // Determine next tithi badge if applicable
  let nextTithiFestivalBadge: string | undefined = undefined;
  if (panchang?.tithiSpan) {
    const nextName = panchang.tithiSpan.nextName;
    const isKartik = !panchang.masa || panchang.masa.includes('कार्तिक') || panchang.masa.includes('अश्विन');
    if (nextName.includes('त्रयोदशी') && panchang.paksha.includes('कृष्ण') && isKartik) {
      nextTithiFestivalBadge = normalizedLang === 'en' ? 'Dhanteras' : normalizedLang === 'gu' ? 'ધનતેરસ' : 'धनतेरस';
    } else if (nextName.includes('चतुर्दशी') && panchang.paksha.includes('कृष्ण') && isKartik) {
      nextTithiFestivalBadge = normalizedLang === 'en' ? 'Narak Chaturdashi' : normalizedLang === 'gu' ? 'રૂપ ચૌદશ' : 'नरक चतुर्दशी';
    } else if (nextName.includes('अमावस्या') && isKartik) {
      nextTithiFestivalBadge = normalizedLang === 'en' ? 'Diwali' : normalizedLang === 'gu' ? 'દિવાળી' : 'दीपावली';
    } else if (nextName.includes('प्रतिपदा') && panchang.paksha.includes('शुक्ल') && isKartik) {
      nextTithiFestivalBadge = normalizedLang === 'en' ? 'Govardhan Puja' : normalizedLang === 'gu' ? 'ગોવર્ધન પૂજા' : 'गोवर्धन पूजा';
    } else if (nextName.includes('द्वितीया') && panchang.paksha.includes('शुक्ल') && isKartik) {
      nextTithiFestivalBadge = normalizedLang === 'en' ? 'Bhai Dooj' : normalizedLang === 'gu' ? 'ભાઈબીજ' : 'भाई दूज';
    }
  }

  // 1. Dhanteras
  if (matched?.id.includes('dhanteras')) {
    return {
      isFestivalToday: true,
      festivalId: 'dhanteras',
      festivalName:
        normalizedLang === 'en'
          ? 'Dhanteras (Dhanatrayodashi)'
          : normalizedLang === 'gu'
          ? 'ધનતેરસ (ધનત્રયોદશી)'
          : 'धनतेरस (धन्वंतरि जयंती व यम दीपदान)',
      title:
        normalizedLang === 'en'
          ? 'Dhanteras Today (Shastric Proof)'
          : normalizedLang === 'gu'
          ? 'આજે ધનતેરસ છે (શાસ્ત્રોક્ત નિર્ણય)'
          : 'आज धनतेरस है (शास्त्रोक्त निर्णय व प्रमाण)',
      badgeText:
        normalizedLang === 'en' ? 'Shastric Proof' : normalizedLang === 'gu' ? 'શાસ્ત્રોક્ત નિર્ણય' : 'शास्त्रोक्त निर्णय',
      bannerNotice:
        spanEndStr
          ? normalizedLang === 'gu'
            ? `આજે ${spanEndStr} વાગ્યાથી તેરસ શરૂ થશે. સંધ્યા પ્રદોષ કાળમાં તેરસ હોવાથી ધનતેરસ આજે જ ઉજવાશે (પ્રમાણ જુઓ ➔)`
            : normalizedLang === 'en'
            ? `Trayodashi commences at ${spanEndStr} today. As it prevails in evening Pradosha Kaal, Dhanteras is observed TODAY (View Proof ➔)`
            : `आज ${spanEndStr} बजे से त्रयोदशी (तेरस) लगेगी। संध्या प्रदोष काल में त्रयोदशी व्याप्त रहने से धनतेरस आज ही मनेगी (प्रमाण देखें ➔)`
          : normalizedLang === 'gu'
          ? 'સંધ્યા પ્રદોષ કાળમાં ત્રયોદશી વ્યાપ્ત હોવાથી ધનતેરસ, ધન્વંતરિ પૂજન અને યમ દીપદાન આજે જ શાસ્ત્રસંમત છે (પ્રમાણ જુઓ ➔)'
          : normalizedLang === 'en'
          ? 'As Trayodashi prevails in evening Pradosha Kaal, Dhanteras and Yama Deepam are observed today (View Proof ➔)'
          : 'संध्या प्रदोष काल में त्रयोदशी व्याप्त रहने से धनतेरस, धन्वंतरि पूजन व यम दीपदान आज ही शास्त्रसम्मत है (प्रमाण देखें ➔)',
      proofTitle:
        normalizedLang === 'en'
          ? 'Why Dhanteras Is Observed Today (Shastric Proof)'
          : normalizedLang === 'gu'
          ? 'આજે જ ધનતેરસ કેમ ઉજવવી? (શાસ્ત્રોક્ત પ્રમાણ)'
          : 'आज ही धनतेरस क्यों करें? (शास्त्रोक्त प्रमाण)',
      shlokQuote: 'कार्तिकस्यासिते पक्षे त्रयोदश्यां निशामुखे।\nयमदीपं बहिर्दद्यादपमृत्युर्विनश्यति॥',
      shlokSource:
        normalizedLang === 'en'
          ? '— Skanda Purana & Nirnayasindhu (Pradosha-Vyapti Rule)'
          : normalizedLang === 'gu'
          ? '— સ્કંદ પુરાણ (કાશી ખંડ) અને નિર્ણયસિંધુ'
          : '— स्कन्द पुराण (काशी/प्रभास खण्ड) एवं निर्णयसिन्धु',
      explanation:
        normalizedLang === 'en'
          ? 'Pradosha-Vyapti Rule: Dhanteras and Yama Deepam must be observed when Kartik Krishna Trayodashi prevails during Pradosha Kaala (the ~2 hours 24 minutes following sunset). Even if Trayodashi begins during the day, its presence in Pradosha gives it complete authority over the succeeding day where Trayodashi ends around sunrise.'
          : normalizedLang === 'gu'
          ? 'પ્રદોષ વ્યાપ્તિનો નિયમ: ધનતેરસ અને યમ દીપદાનનો મુખ્ય કર્મકાળ સૂર્યાસ્ત પછીના આશરે ૨ કલાક ૨૪ મિનિટ (પ્રદોષ કાળ) છે. ભલે તેરસ બપોરે લાગી હોય, પરંતુ સંધ્યાકાળે પ્રદોષ કાળમાં તેરસ હોવાને કારણે આજે જ ધનતેરસ શાસ્ત્રસંમત છે. બીજા દિવસે સાંજે ચતુર્દશી આવી જશે, તેથી આજે જ ધનતેરસ ઉજવવી શાસ્ત્રોક્ત છે.'
          : 'प्रदोष काल व्याप्ति का अटल नियम: धनतेरस एवं यम-दीपदान का मुख्य कर्मकाल सूर्यास्त के बाद के २ घण्टे २४ मिनट (प्रदोष काल) में होता है। भले ही त्रयोदशी दिन में किसी भी समय शुरू हुई हो, परन्तु सूर्यास्त के बाद प्रदोष काल में त्रयोदशी होने के कारण आज ही धनतेरस और यम दीपदान शास्त्रसम्मत है। अगले दिन केवल उदया तिथि होगी पर प्रदोष में चतुर्दशी आ जाएगी, अतः आज का दिन ही निर्विवाद है।',
      ruleCategory: 'pradosha',
      nextTithiFestivalBadge,
    };
  }

  // 2. Narak Chaturdashi / Roop Chaudas (Choti Diwali)
  if (matched?.id.includes('narak')) {
    return {
      isFestivalToday: true,
      festivalId: 'narak-chaturdashi',
      festivalName:
        normalizedLang === 'en'
          ? 'Narak Chaturdashi / Roop Chaudas'
          : normalizedLang === 'gu'
          ? 'નરક ચતુર્દશી (રૂપ ચૌદશ / કાળી ચૌદશ)'
          : 'नरक चतुर्दशी (रूप चौदस / छोटी दीवाली)',
      title:
        normalizedLang === 'en'
          ? 'Narak Chaturdashi & Roop Chaudas Today'
          : normalizedLang === 'gu'
          ? 'આજે નરક ચતુર્દશી (રૂપ ચૌદશ) છે'
          : 'आज नरक चतुर्दशी (रूप चौदस / छोटी दीवाली) है',
      badgeText:
        normalizedLang === 'en' ? 'Shastric Proof' : normalizedLang === 'gu' ? 'શાસ્ત્રોક્ત નિર્ણય' : 'शास्त्रोक्त निर्णय',
      bannerNotice:
        spanEndStr
          ? normalizedLang === 'gu'
            ? `આજે ${spanEndStr} વાગ્યે તેરસ સમાપ્ત થઈ ચતુર્દશી શરૂ થશે. સાંજે પ્રદોષ કાળમાં ચતુર્દશી હોવાથી રૂપ ચૌદશ અને યમ દીપદાન આજે જ ઉજવાશે (પ્રમાણ જુઓ ➔)`
            : normalizedLang === 'en'
            ? `Trayodashi ends at ${spanEndStr} giving way to Chaturdashi. Covering evening Pradosha, Roop Chaudas & 14 Yama Deepam are observed today (View Proof ➔)`
            : `आज ${spanEndStr} बजे त्रयोदशी समाप्त होकर चतुर्दशी लगेगी। संध्या प्रदोष काल में चतुर्दशी रहने से रूप चौदस, छोटी दीवाली व यम दीपदान आज ही मनेगा (प्रमाण देखें ➔)`
          : normalizedLang === 'gu'
          ? 'સાંજે પ્રદોષ કાળમાં ચતુર્દશી હોવાથી રૂપ ચૌદશ, કાળી ચૌદશ અને યમ દીપદાન આજે જ શાસ્ત્રસંમત છે (પ્રમાણ જુઓ ➔)'
          : normalizedLang === 'en'
          ? 'With Chaturdashi prevailing in evening Pradosha, Roop Chaudas & 14 Yama Deepam are observed today (View Proof ➔)'
          : 'सायंकालीन प्रदोष काल में चतुर्दशी व्याप्त रहने से नरक चतुर्दशी, रूप चौदस व यम दीपदान आज ही शास्त्रसम्मत है (प्रमाण देखें ➔)',
      proofTitle:
        normalizedLang === 'en'
          ? 'Why Narak Chaturdashi & Roop Chaudas Observed Today (Shastric Proof)'
          : normalizedLang === 'gu'
          ? 'આજે જ રૂપ ચૌદશ / કાળી ચૌદશ કેમ ઉજવવી? (શાસ્ત્રોક્ત પ્રમાણ)'
          : 'आज ही नरक चतुर्दशी (रूप चौदस) क्यों मनाएं? (शास्त्रोक्त प्रमाण)',
      shlokQuote: 'ततोऽपराह्णे संव्याप्य नरकस्य चतुर्दशीम्।\nतैलाभ्यङ्गो निशि स्नाने यमलोकं न पश्यति॥',
      shlokSource:
        normalizedLang === 'en'
          ? '— Nirnayasindhu, Dharmasindhu & Bhavishya Purana'
          : normalizedLang === 'gu'
          ? '— નિર્ણયસિંધુ, ધર્મસિંધુ અને ભવિષ્ય પુરાણ'
          : '— निर्णयसिन्धु, धर्मसिन्धु एवं भविष्य पुराण',
      explanation:
        normalizedLang === 'en'
          ? 'Narak Chaturdashi & Roop Chaudas Injunction: Per Nirnayasindhu and Dharmasindhu, when Chaturdashi prevails during evening Pradosha Kaala, the 14-lamp Yama Deepam and Roop Chaudas rituals are performed on that very evening. Trayodashi ends in the morning, after which Chaturdashi reigns across the entire afternoon, evening, and night. Therefore, Roop Chaudas is observed today; today is strictly not Dhanteras. (Arunodaya Abhyanga Snana is observed early morning before sunrise on Chaturdashi).'
          : normalizedLang === 'gu'
          ? 'નિર્ણયસિંધુ અને ધર્મસિંધુ અનુસાર ચતુર્દશી તિથિ જ્યારે સંધ્યા પ્રદોષ કાળમાં વ્યાપ્ત હોય ત્યારે યમરાજ નિમિત્તે ૧૪ દીવાઓનું દાન અને રૂપ ચૌદશની પૂજા તે જ સાંજે થાય છે. સવારે તેરસ પૂર્ણ થઈ સમગ્ર સાંજ અને રાત્રિ ચતુર્દશી રહેતી હોવાથી આજે જ રૂપ ચૌદશ/કાળી ચૌદશ ઉજવાશે, આજે ધનતેરસ નથી.'
          : 'नरक चतुर्दशी व रूप चौदस का अटल निर्णय: निर्णयसिन्धु के अनुसार जब चतुर्दशी सायंकाल प्रदोष काल में व्याप्त होती है, तब चौदह दीपकों से यमराज हेतु दीपदान एवं रूप चौदस का पूजन उसी सायंकाल किया जाता है। आज प्रातः त्रयोदशी समाप्त होकर संपूर्ण सायंकाल प्रदोष में चतुर्दशी का साम्राज्य है। अतः आज रूप चौदस व यम दीपदान ही मनाया जाएगा, आज किसी भी प्रकार से धनतेरस नहीं है। (अरुणोदय कालीन अभ्यंग स्नान कल प्रातः सूर्योदय से पूर्व चतुर्दशी में होगा)।',
      ruleCategory: 'pradosha',
      nextTithiFestivalBadge,
    };
  }

  // 3. Diwali (Lakshmi Puja)
  if (matched?.id.includes('diwali')) {
    return {
      isFestivalToday: true,
      festivalId: 'diwali',
      festivalName:
        normalizedLang === 'en'
          ? 'Diwali (Maha Lakshmi Puja)'
          : normalizedLang === 'gu'
          ? 'દિવાળી (મહાલક્ષ્મી પૂજન)'
          : 'दीपावली (महालक्ष्मी पूजन)',
      title:
        normalizedLang === 'en'
          ? 'Diwali (Lakshmi Puja) Today'
          : normalizedLang === 'gu'
          ? 'આજે દીપાવલી (મહાલક્ષ્મી પૂજન) છે'
          : 'आज दीपावली (महालक्ष्मी पूजन) है',
      badgeText:
        normalizedLang === 'en' ? 'Shastric Proof' : normalizedLang === 'gu' ? 'શાસ્ત્રોક્ત નિર્ણય' : 'शास्त्रोक्त निर्णय',
      bannerNotice:
        spanEndStr
          ? normalizedLang === 'gu'
            ? `આજે ${spanEndStr} વાગ્યાથી અમાસ શરૂ થશે. સંધ્યા પ્રદોષ, સ્થિર વૃષભ લગ્ન અને નિશીથ કાળમાં અમાસ હોવાથી દિવાળી મહાલક્ષ્મી પૂજન આજે જ થશે (પ્રમાણ જુઓ ➔)`
            : normalizedLang === 'en'
            ? `Amavasya commences at ${spanEndStr} today. Prevailing through evening Pradosha, Taurus Sthir Lagna, and Nishita, Diwali Lakshmi Puja is observed tonight (View Proof ➔)`
            : `आज ${spanEndStr} बजे से अमावस्या लगेगी। संध्या प्रदोष काल, स्थिर वृषभ लग्न व निशीथ काल में अमावस्या रहने से महालक्ष्मी पूजन आज ही शास्त्रसम्मत है (प्रमाण देखें ➔)`
          : normalizedLang === 'gu'
          ? 'સાંજે પ્રદોષ, સ્થિર વૃષભ લગ્ન અને નિશીથ કાળમાં અમાસ હોવાથી મહાલક્ષ્મી પૂજન આજે જ શાસ્ત્રસંમત છે (પ્રમાણ જુઓ ➔)'
          : normalizedLang === 'en'
          ? 'Prevailing in evening Pradosha, Taurus Sthir Lagna, and Nishita, Diwali Lakshmi Puja is observed tonight (View Proof ➔)'
          : 'सायंकाल प्रदोष काल, स्थिर वृषभ लग्न व निशीथ काल में अमावस्या रहने से महालक्ष्मी पूजन आज ही शास्त्रसम्मत है (प्रमाण देखें ➔)',
      proofTitle:
        normalizedLang === 'en'
          ? 'Why Diwali Maha Lakshmi Puja Observed Today (Shastric Proof)'
          : normalizedLang === 'gu'
          ? 'આજે જ દિવાળી મહાલક્ષ્મી પૂજન કેમ કરવું? (શાસ્ત્રોક્ત પ્રમાણ)'
          : 'आज ही दीपावली महालक्ष्मी पूजन क्यों करें? (शास्त्रोक्त प्रमाण)',
      shlokQuote: 'अमावस्यायां प्रदोषव्यापिन्यां लक्ष्मीं पूजयेत्।\nप्रदोषसमये दीपान् प्रज्वाल्य विधिवन्नरः॥',
      shlokSource:
        normalizedLang === 'en'
          ? '— Nirnayasindhu, Dharmasindhu & Skanda Purana'
          : normalizedLang === 'gu'
          ? '— નિર્ણયસિંધુ, ધર્મસિંધુ અને સ્કંદ પુરાણ'
          : '— निर्णयसिन्धु, धर्मसिन्धु एवं स्कन्द पुराण',
      explanation:
        normalizedLang === 'en'
          ? 'Diwali Lakshmi Puja Mandate: Dharmasindhu specifies that Lakshmi Puja and Diwali Deepdan must be observed on the evening when Amavasya prevails during Pradosha Kaala (~2h 24m after sunset). Tonight, Amavasya is fully present across evening Pradosha, Taurus Fixed Ascendant, and midnight Nishita Kaala. On the succeeding evening, Pratipada commences before Pradosha; hence tonight is undisputed for Diwali.'
          : normalizedLang === 'gu'
          ? 'ધર્મસિંધુ અને નિર્ણયસિંધુ મુજબ જે દિવસે અમાસ સૂર્યાસ્ત પછી પ્રદોષ કાળમાં વ્યાપ્ત હોય તે જ રાત્રે લક્ષ્મી પૂજન અને દીપાવલી પર્વ ઉજવાય છે. આજે પ્રદોષ, સ્થિર વૃષભ લગ્ન અને નિશીથ કાળમાં અમાસ હોવાથી આજે જ દિવાળી ઉજવાશે.'
          : 'दीपावली लक्ष्मी पूजन का शास्त्रोक्त विधान: धर्मसिन्धु का स्पष्ट वचन है कि जिस दिन अमावस्या सूर्यास्त के बाद प्रदोष काल (२ घटी २४ पल) में विद्यमान हो, उसी दिन महालक्ष्मी पूजन और दीपमालिका प्रज्वलन करना चाहिए। आज सायंकाल प्रदोष काल, स्थिर वृषभ लग्न और मध्यरात्रि निशीथ काल तीनों में अमावस्या पूर्ण रूप से व्याप्त है। अगले दिन सायंकाल प्रतिपदा आ जाएगी, अतः आज की रात्रि ही दीपावली के लिए सर्वथा शास्त्रसम्मत है।',
      ruleCategory: 'pradosha',
      nextTithiFestivalBadge,
    };
  }

  // 4. Govardhan Puja
  if (matched?.id.includes('govardhan')) {
    return {
      isFestivalToday: true,
      festivalId: 'govardhan-puja',
      festivalName:
        normalizedLang === 'en'
          ? 'Govardhan Puja & Annakut'
          : normalizedLang === 'gu'
          ? 'ગોવર્ધન પૂજા અને અન્નકૂટ'
          : 'गोवर्धन पूजा / अन्नकूट महोत्सव',
      title:
        normalizedLang === 'en'
          ? 'Govardhan Puja & Annakut Today'
          : normalizedLang === 'gu'
          ? 'આજે ગોવર્ધન પૂજા અને અન્નકૂટ મહોત્સવ છે'
          : 'आज गोवर्धन पूजा व अन्नकूट महोत्सव है',
      badgeText:
        normalizedLang === 'en' ? 'Shastric Proof' : normalizedLang === 'gu' ? 'શાસ્ત્રોક્ત નિર્ણય' : 'शास्त्रोक्त निर्णय',
      bannerNotice:
        normalizedLang === 'gu'
          ? 'કારતક સુદ એકમે ગોવર્ધન પૂજા, અન્નકૂટ મહોત્સવ અને ગૌ પૂજન આજે શાસ્ત્રસંમત છે (પ્રમાણ જુઓ ➔)'
          : normalizedLang === 'en'
          ? 'Govardhan Puja, Annakut Mahotsav, and Gau Puja are observed today per Shastric rules (View Proof ➔)'
          : 'कार्तिक शुक्ल प्रतिपदा पर गोवर्धन पूजा, अन्नकूट महोत्सव एवं गौ पूजन आज शास्त्रसम्मत विधि से मनेगा (प्रमाण देखें ➔)',
      proofTitle:
        normalizedLang === 'en'
          ? 'Why Govardhan Puja Observed Today (Shastric Proof)'
          : normalizedLang === 'gu'
          ? 'આજે જ ગોવર્ધન પૂજા કેમ કરવી? (શાસ્ત્રોક્ત પ્રમાણ)'
          : 'आज ही गोवर्धन पूजा क्यों करें? (शास्त्रोक्त प्रमाण)',
      shlokQuote: 'प्रतिपद्दर्शने पूर्वाह्णे गोवर्धनमहोत्सवः।\nगोपूजा च विधातव्या प्रातर्गोष्ठे समन्विता॥',
      shlokSource: '— श्रीमद्भागवत एवं निर्णयसिन्धु',
      explanation:
        normalizedLang === 'en'
          ? 'Observed on Kartik Shukla Pratipada. Per Nirnayasindhu, when Pratipada prevails in the morning and forenoon, Govardhan Puja, Annakut Mahotsav, and cattle worship are observed.'
          : normalizedLang === 'gu'
          ? 'કારતક સુદ એકમે ગોવર્ધન પૂજા અને અન્નકૂટનો વિધાન છે. નિર્ણયસિંધુ મુજબ આજે ગોવર્ધન પૂજા શાસ્ત્રોક્ત છે.'
          : 'कार्तिक शुक्ल प्रतिपदा पर गोवर्धन पूजा और अन्नकूट का विधान है। निर्णयसिन्धु अनुसार जब प्रतिपदा प्रातः व पूर्वाह्ण काल में व्याप्त हो तब गोवर्धन पूजा और बलि पूजा की जाती है।',
      ruleCategory: 'madhyahna',
      nextTithiFestivalBadge,
    };
  }

  // 5. Bhai Dooj
  if (matched?.id.includes('bhai-dooj')) {
    return {
      isFestivalToday: true,
      festivalId: 'bhai-dooj',
      festivalName:
        normalizedLang === 'en'
          ? 'Bhai Dooj (Yama Dwitiya)'
          : normalizedLang === 'gu'
          ? 'ભાઈબીજ (યમ દ્વિતીયા)'
          : 'भाई दूज (यम द्वितीया)',
      title:
        normalizedLang === 'en'
          ? 'Bhai Dooj (Yama Dwitiya) Today'
          : normalizedLang === 'gu'
          ? 'આજે ભાઈબીજ (યમ દ્વિતીયા) છે'
          : 'आज भाई दूज (यम द्वितीया) है',
      badgeText:
        normalizedLang === 'en' ? 'Shastric Proof' : normalizedLang === 'gu' ? 'શાસ્ત્રોક્ત નિર્ણય' : 'शास्त्रोक्त निर्णय',
      bannerNotice:
        normalizedLang === 'gu'
          ? 'કારતક સુદ બીજે ભાઈબીજ (યમ દ્વિતીયા) પર્વ આજે શાસ્ત્રોક્ત વિધિથી ઉજવાશે (પ્રમાણ જુઓ ➔)'
          : normalizedLang === 'en'
          ? 'Bhai Dooj (Yama Dwitiya) is observed today during Aparahna per Shastras (View Proof ➔)'
          : 'कार्तिक शुक्ल द्वितीया पर भाई दूज (यम द्वितीया) एवं चित्रगुप्त पूजन आज अपराह्ण काल में शास्त्रसम्मत है (प्रमाण देखें ➔)',
      proofTitle:
        normalizedLang === 'en'
          ? 'Why Bhai Dooj Observed Today (Shastric Proof)'
          : normalizedLang === 'gu'
          ? 'આજે જ ભાઈબીજ કેમ ઉજવવી? (શાસ્ત્રોક્ત પ્રમાણ)'
          : 'आज ही भाई दूज क्यों मनाएं? (शास्त्रोक्त प्रमाण)',
      shlokQuote: 'कार्तिकस्य सिते पक्षे द्वितीयायां यमं यमी।\nभोजित्वा पूजयित्वा च ततो भ्रातृद्वितीयेति॥',
      shlokSource: '— पद्म पुराण एवं निर्णयसिन्धु',
      explanation:
        normalizedLang === 'en'
          ? 'Kartik Shukla Dwitiya is observed as Yama Dwitiya and Bhai Dooj. Per Nirnayasindhu, when Dwitiya prevails during Aparahna (afternoon), sisters apply tilak and pray for brothers longevity.'
          : normalizedLang === 'gu'
          ? 'કારતક સુદ બીજે યમ દ્વિતીયા અને ભાઈબીજ પર્વ અપરાહ્ન કાળમાં ઉજવાય છે.'
          : 'कार्तिक शुक्ल द्वितीया को यम द्वितीया और भाई दूज कहा जाता है। निर्णयसिन्धु के अनुसार द्वितीया तिथि जब अपराह्ण काल (दोपहर) में व्याप्त हो तब बहनों द्वारा भाइयों को तिलक व भोजन कराने का विधान है।',
      ruleCategory: 'madhyahna',
      nextTithiFestivalBadge,
    };
  }

  // 6. Other specific festival match from astronomical calendar
  if (matched) {
    const festName = normalizedLang === 'en' ? matched.name : matched.hindiName;
    return {
      isFestivalToday: true,
      festivalId: matched.id,
      festivalName: festName,
      title:
        normalizedLang === 'en'
          ? `${festName} Today`
          : normalizedLang === 'gu'
          ? `આજે ${festName} છે`
          : `आज ${festName} है`,
      badgeText:
        normalizedLang === 'en' ? 'Festival Decision' : normalizedLang === 'gu' ? 'પર્વ નિર્ણય' : 'पर्व निर्णय',
      bannerNotice: `${festName} · ${matched.description || ''}`,
      proofTitle:
        normalizedLang === 'en'
          ? `Why ${festName} Is Observed Today`
          : normalizedLang === 'gu'
          ? `આજે જ ${festName} કેમ ઉજવવું?`
          : `आज ही ${festName} क्यों मनाएं?`,
      shlokQuote: 'यस्मिन् दिने यस्य विहितः कालस्तस्मिन्नेव कार्यम्।\nकर्मणो यस्य यः कालस्तत्कालव्यापिनी तिथिः॥',
      shlokSource: '— निर्णयसिन्धु एवं धर्मसिन्धु (कर्मकाल व्याप्ति सूत्र)',
      explanation: matched.description || 'शास्त्रसम्मत तिथि एवं कर्मकाल के अनुसार आज यह पर्व/व्रत मनाया जाना पूर्णतः प्रामाणिक है।',
      ruleCategory: 'general',
      nextTithiFestivalBadge,
    };
  }

  // 7. General Day (Not a major festival)
  return {
    isFestivalToday: false,
    festivalName: '',
    title:
      normalizedLang === 'en'
        ? 'Shastric Tithi & Festival Decision'
        : normalizedLang === 'gu'
        ? 'શાસ્ત્રોક્ત તિથિ અને પર્વ નિર્ણય પ્રમાણ'
        : 'शास्त्रोक्त तिथि व पर्व निर्णय प्रमाण',
    badgeText:
      normalizedLang === 'en' ? '10-Yr Guide' : normalizedLang === 'gu' ? '૧૦-વર્ષીય માર્ગદર્શિકા' : '१०-वर्षीय दिग्दर्शिका',
    bannerNotice:
      panchang?.tithiSpan
        ? normalizedLang === 'gu'
          ? `${panchang.tithiSpan.name} સમાપ્ત ${spanEndStr} વાગ્યે • ત્યારબાદ ${panchang.tithiSpan.nextName} (શાસ્ત્રોક્ત કર્મકાળ નિર્ણય જુઓ ➔)`
          : normalizedLang === 'en'
          ? `${panchang.tithiSpan.name} ends at ${spanEndStr} • followed by ${panchang.tithiSpan.nextName} (View Shastric Timing Rules ➔)`
          : `${panchang.tithiSpan.name} समाप्त ${spanEndStr} बजे • तदोपरांत ${panchang.tithiSpan.nextName} (शास्त्रोक्त कर्मकाल निर्णय देखें ➔)`
        : normalizedLang === 'gu'
        ? 'સ્કંદ પુરાણ, નિર્ણયસિંધુ પ્રમાણ અને ૨ તિથિ સંશય સમાધાન'
        : normalizedLang === 'en'
        ? 'Why festival today? View Skanda Purana & Nirnayasindhu proofs'
        : 'स्कन्द पुराण व निर्णयसिन्धु प्रमाण एवं २ तिथि संशय समाधान',
    proofTitle:
      normalizedLang === 'en'
        ? 'Shastric Tithi Determination & Karma-Kala Rule'
        : normalizedLang === 'gu'
        ? 'આજની તિથિનો શાસ્ત્રોક્ત નિર્ણય અને કર્મકાળ'
        : 'आज की तिथि का शास्त्रोक्त निर्णय व कर्मकाल',
    shlokQuote: 'उदये त्रिमुहूर्ता चेत् तिथिः पूर्णा प्रकीर्तिता।\nकस्यचित् कर्मणः काले तद्व्याप्ता सा विधीयते॥',
    shlokSource: '— धर्मसिन्धु एवं निर्णयसिन्धु (तिथि द्वैध सामान्य नियम)',
    explanation:
      normalizedLang === 'en'
        ? 'General religious duties follow the Udaya Tithi (sunrise tithi). However, specific fasts and worship strictly adhere to their respective Karma-Kala (e.g. Pradosha for evening worship, Nishita for midnight rituals, Madhyahna for midday worship). If two tithis touch one day, the karma is performed in the specific muhurta prevailing that day.'
        : normalizedLang === 'gu'
        ? 'સનાતન ધર્મશાસ્ત્રમાં સામાન્ય કર્મો માટે ઉદયા તિથિ માન્ય રહે છે, પરંતુ વિશેષ પૂજન અને વ્રત માટે તે પૂજાના ચોક્કસ મુહૂર્ત (પ્રદોષ, નિશીથ, મધ્યાહ્ન) માં વ્યાપ્ત તિથિ જ મુખ્ય ગણાય છે.'
        : 'सनातन धर्मशास्त्र में सामान्य नित्य कर्मों के लिए उदया तिथि (सूर्योदय कालीन तिथि) ग्राह्य होती है। परन्तु किसी विशिष्ट पर्व, व्रत या पूजन के लिए उस कर्म के विशिष्ट काल (जैसे प्रदोष, निशीथ, मध्याह्न, अपराह्ण या अरुणोदय) में विद्यमान तिथि ही मुख्य मानी जाती है।',
    ruleCategory: 'general',
    nextTithiFestivalBadge,
  };
}

