/**
 * शास्त्रोक्त तिथि व पर्व निर्णय सेवा (Dharmashastric Tithi & Festival Decision Service)
 *
 * Provides authoritative Shastric rules, mathematical calculations,
 * and a 10-Year (2025–2035) Vrat-Parva Dual-Tithi conflict resolution database
 * grounded in Nirnayasindhu, Dharmasindhu, and Skanda Purana.
 */

export interface ShastricRule {
  id: string;
  name: string;
  hindiName: string;
  karmaKala: string;
  principle: string;
  sanskritShloka: string;
  source: string;
  dualTithiRule: string;
  examples: string[];
}

export interface TenYearFestivalRecord {
  year: number;
  festivalId: string;
  festivalName: string;
  hindiName: string;
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
    karmaKala: 'सूर्यास्त के बाद २ घटी २४ पल (लगभग २ घण्टे २४ मिनट)',
    principle: 'जिस दिन अभीष्ट तिथि प्रदोष काल में व्याप्त होती है, उसी दिन पूजन व व्रत का विधान है।',
    sanskritShloka: 'कार्तिकस्यासिते पक्षे त्रयोदश्यां निशामुखे। यमदीपं बहिर्दद्यादपमृत्युर्विनश्यति॥ (स्कन्द पुराण / निर्णयसिन्धु)',
    source: 'निर्णयसिन्धु, धर्मसिन्धु, स्कन्द पुराण',
    dualTithiRule: 'यदि दोनों दिन प्रदोष में तिथि व्याप्त हो या केवल प्रथम दिन व्याप्त हो, तो पूर्वविद्धा (प्रथम दिन) ही ग्राह्य है। यदि केवल दूसरे दिन व्याप्त हो तो द्वितीय दिन ग्राह्य है।',
    examples: ['धनतेरस (कार्तिक कृष्ण त्रयोदशी)', 'दीपावली लक्ष्मी पूजन (कार्तिक कृष्ण अमावस्या)', 'प्रदोष व्रत (त्रयोदशी)', 'मासिक शिवरात्रि'],
  },
  {
    id: 'nishita',
    name: 'Nishita Vyapini (निशीथ-व्यापिनी)',
    hindiName: 'निशीथ-व्यापिनी नियम',
    karmaKala: 'मध्यरात्रि का काल (रात्रि के ८वें मुहूर्त / रात ११:४० से १२:३० के मध्य)',
    principle: 'अर्धरात्रि में होने वाली पूजाओं हेतु जिस दिन निशीथ काल में तिथि विद्यमान हो, वही दिन मुख्य है।',
    sanskritShloka: 'अर्धरात्रे यदा युक्ता निशीथे च विशेषतः। तदा सा शिवरात्रिः स्यात् सर्वपापप्रणाशिनी॥ (ईशान संहिता)',
    source: 'ईशान संहिता, निर्णयसिन्धु',
    dualTithiRule: 'दोनों दिन निशीथ में तिथि रहने पर अथवा केवल पहले दिन रहने पर पूर्वविद्धा ग्राह्य होती है।',
    examples: ['महाशिवरात्रि (फाल्गुन कृष्ण चतुर्दशी)', 'श्री कृष्ण जन्माष्टमी (भाद्रपद कृष्ण अष्टमी निशीथ व रोहिणी)'],
  },
  {
    id: 'madhyahna',
    name: 'Madhyahna Vyapini (मध्याह्न-व्यापिनी)',
    hindiName: 'मध्याह्न-व्यापिनी नियम',
    karmaKala: 'दिन का तृतीय भाग (दिन के लगभग ११:०० से १:३० के मध्य)',
    principle: 'जिन देवों का प्राकट्य मध्याह्न काल में हुआ, उनका व्रत व पूजन मध्याह्न-व्यापिनी तिथि में ही होता है।',
    sanskritShloka: 'मध्याह्ने पूजयेद्देवं विघ्नेशं मोदकप्रियम्। मध्याह्नव्यापिनी चेत्स्याच्चतुर्थी गणनायक॥ (धर्मसिन्धु)',
    source: 'धर्मसिन्धु, भविष्योत्तर पुराण',
    dualTithiRule: 'यदि दोनों दिन मध्याह्न में चतुर्थी या नवमी व्याप्त हो, तो पूर्वविद्धा को त्यागकर परविद्धा या शास्त्रोक्त युग्म नियम से निर्णय होता है।',
    examples: ['श्री गणेश चतुर्थी (भाद्रपद शुक्ल चतुर्थी)', 'श्री राम नवमी (चैत्र शुक्ल नवमी मध्याह्न १२:००)'],
  },
  {
    id: 'udaya',
    name: 'Udaya Vyapini (उदय-व्यापिनी)',
    hindiName: 'उदय-व्यापिनी नियम',
    karmaKala: 'प्रातः सूर्योदय काल (३ मुहूर्त या सूर्योदय स्पर्श)',
    principle: 'अधिकांश स्मार्त व सार्वत्रिक व्रतों में सूर्योदय-कालिक तिथि (उदया तिथि) ही सर्वमान्य होती है।',
    sanskritShloka: 'यस्योदये रवेस्तिथिः सैव सर्वत्र पूजिता। आदित्येऽस्तं गते रात्रिस्तिथिरन्या न गृह्यते॥',
    source: 'निर्णयसिन्धु, कालमाधव',
    dualTithiRule: 'एकादशी में यदि दशमी का वेध (अरुणोदय वेध) हो तो वह त्याज्य है; द्वादशी युक्त शुद्ध एकादशी ही ग्राह्य है।',
    examples: ['एकादशी व्रत', 'अनंत चतुर्दशी', 'वट सावित्री व्रत', 'छठ पूजा पारण (सप्तमी उदय)'],
  },
  {
    id: 'aparahna',
    name: 'Aparahna Vyapini (अपराह्ण-व्यापिनी)',
    hindiName: 'अपराह्ण-व्यापिनी नियम',
    karmaKala: 'दिन का चौथा भाग (दोपहर १:३० से ४:०० के मध्य)',
    principle: 'श्राद्ध, पितृ तर्पण एवं रक्षाबंधन का कर्मकाल अपराह्ण व्यापिनी तिथि है।',
    sanskritShloka: 'अपराह्णे पितृणां तु दद्यात् पिण्डोदकं नरः। भद्रावर्जिते काले रक्षाबन्धनमिष्यते॥',
    source: 'हेमाद्रि, निर्णयसिन्धु',
    dualTithiRule: 'रक्षाबंधन में पूर्णिमा अपराह्ण में भद्रारहित होनी चाहिए। यदि भद्रा हो तो भद्रा समाप्त होने तक या भद्रा-पुच्छ काल में ही रक्षासूत्र बांधना चाहिए।',
    examples: ['रक्षाबंधन (श्रावण पूर्णिमा)', 'पितृ पक्ष श्राद्ध तर्पण (अपराह्ण व्यापिनी)'],
  },
  {
    id: 'chandrodaya',
    name: 'Chandrodaya Vyapini (चन्द्रोदय-व्यापिनी)',
    hindiName: 'चन्द्रोदय-व्यापिनी नियम',
    karmaKala: 'रात्रि में चन्द्रमा के उदय होने का काल',
    principle: 'जिस दिन चन्द्रमा का दर्शन व अर्घ्य अभीष्ट तिथि में संभव हो, उसी दिन वह व्रत मान्य होता है।',
    sanskritShloka: 'कार्तिककृष्णपक्षे तु चतुर्थी चन्द्रसंयुता। तत्रोपवासः कर्तव्यो यावच्चन्द्रोदयो भवेत्॥',
    source: 'निर्णयसिन्धु, व्रतराज',
    dualTithiRule: 'जिस दिन चन्द्रोदय के समय चतुर्थी तिथि विद्यमान हो, उसी दिन करवा चौथ का व्रत व पारण मान्य है।',
    examples: ['करवा चौथ (कार्तिक कृष्ण चतुर्थी)', 'संकष्टी गणेश चतुर्थी (चन्द्र दर्शन)'],
  },
  {
    id: 'yugma',
    name: 'Yugma-Vakya Siddhanta (युग्म-वाक्य नियम)',
    hindiName: 'युग्म-वाक्य सिद्धांत',
    karmaKala: 'द्वि-तिथि संशय की स्थिति में तिथि युग्म की ग्राह्यता',
    principle: 'धर्मशास्त्र के अनुसार कुछ तिथियां पूर्व तिथि से युक्त तथा कुछ उत्तर तिथि से युक्त होकर अधिक पुण्य फलदायी होती हैं।',
    sanskritShloka: 'युग्माग्नियुगखट्वक्षैः षष्ठीभाद्रपदैस्तथा। एकादशी द्वादशी च तथा सर्वाः फलप्रदाः॥',
    source: 'निर्णयसिन्धु, वसिष्ठ संहिता',
    dualTithiRule: 'द्वितीया तृतीया के साथ, चतुर्थी पंचमी के साथ, षष्ठी सप्तमी के साथ, अष्टमी नवमी के साथ, एकादशी द्वादशी के साथ, चतुर्दशी पूर्णिमा के साथ युग्म बनाती है।',
    examples: ['द्वितीया-तृतीया संशय', 'अष्टमी-नवमी संशय', 'एकादशी-द्वादशी व्रत'],
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
    tithiStart: '06 नवंबर प्रातः 06:44 से',
    tithiEnd: '07 नवंबर प्रातः 08:31 तक',
    hasConflict: true,
    conflictType: 'दो_दिन_व्याप्ति',
    karmaKala: 'प्रदोष काल (शाम 05:32 से 07:58)',
    decisionReason: '06 नवंबर को संपूर्ण दिन तथा सायंकालीन प्रदोष काल में त्रयोदशी पूर्णतः व्याप्त है। 07 नवंबर को सूर्योदय के कुछ ही देर बाद (08:31 AM) त्रयोदशी समाप्त हो जाएगी और शाम को प्रदोष में चतुर्दशी रहेगी। अतः धनतेरस, धन्वंतरि पूजन व यम दीपदान 06 नवंबर को ही शास्त्रसम्मत है।',
    shastricPramana: 'कार्तिकस्यासिते पक्षे त्रयोदश्यां निशामुखे। यमदीपं बहिर्दद्यादपमृत्युर्विनश्यति॥ (स्कन्द पुराण)',
    alternateDateNote: '07 नवंबर को केवल प्रातः काल की थोड़ी सी उदया तिथि है, पर प्रदोष काल नहीं मिलेगा।',
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
