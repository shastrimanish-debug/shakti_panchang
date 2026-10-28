import { PlanetPosition } from "../types";
import { calculatePlanetPositions, RASHIS } from "./astronomy";

export interface RashiMetaItem {
  id: string;
  name: string;
  symbol: string;
  lord: string;
  element: string;
  nature: string;
  luckyColors: string[];
  baseNumbers: number[];
  ishtaDevta: string;
}

export const RASHI_META: RashiMetaItem[] = [
  {
    id: "mesh",
    name: "मेष",
    symbol: "♈",
    lord: "मंगल",
    element: "अग्नि तत्व",
    nature: "चर राशि",
    luckyColors: ["सिंदूरी लाल", "केसरिया", "मूंगा लाल"],
    baseNumbers: [9, 1, 3],
    ishtaDevta: "श्री हनुमान जी एवं कार्तिकेय भगवान",
  },
  {
    id: "vrishabh",
    name: "वृषभ",
    symbol: "♉",
    lord: "शुक्र",
    element: "पृथ्वी तत्व",
    nature: "स्थिर राशि",
    luckyColors: ["दूधिया सफेद", "गुलाबी", "हल्का नीला"],
    baseNumbers: [6, 2, 7],
    ishtaDevta: "महालक्ष्मी एवं माँ दुर्गा",
  },
  {
    id: "mithun",
    name: "मिथुन",
    symbol: "♊",
    lord: "बुध",
    element: "वायु तत्व",
    nature: "द्विस्वभाव राशि",
    luckyColors: ["पन्ना हरा", "हल्का पीला", "धानी हरा"],
    baseNumbers: [5, 3, 6],
    ishtaDevta: "भगवान श्री गणेश एवं श्री विष्णु",
  },
  {
    id: "kark",
    name: "कर्क",
    symbol: "♋",
    lord: "चंद्र",
    element: "जल तत्व",
    nature: "चर राशि",
    luckyColors: ["मोती सफेद", "चाँदी सा उज्ज्वल", "हल्का क्रीम"],
    baseNumbers: [2, 7, 9],
    ishtaDevta: "भगवान आशुतोष शिवजी",
  },
  {
    id: "simh",
    name: "सिंह",
    symbol: "♌",
    lord: "सूर्य",
    element: "अग्नि तत्व",
    nature: "स्थिर राशि",
    luckyColors: ["सुनहरा पीला", "अरुण लाल", "नारंगी"],
    baseNumbers: [1, 4, 9],
    ishtaDevta: "भगवान सूर्यनारायण एवं श्री राम",
  },
  {
    id: "kanya",
    name: "कन्या",
    symbol: "♍",
    lord: "बुध",
    element: "पृथ्वी तत्व",
    nature: "द्विस्वभाव राशि",
    luckyColors: ["तुलसी हरा", "हल्का फिरोजी", "सफेद"],
    baseNumbers: [5, 6, 8],
    ishtaDevta: "भगवान श्री गणेश एवं माँ त्रिपुरसुंदरी",
  },
  {
    id: "tula",
    name: "तुला",
    symbol: "♎",
    lord: "शुक्र",
    element: "वायु तत्व",
    nature: "चर राशि",
    luckyColors: ["स्फटिक सफेद", "आसमानी", "क्रीम"],
    baseNumbers: [6, 5, 8],
    ishtaDevta: "माँ महालक्ष्मी एवं संतोषी माता",
  },
  {
    id: "vrishchik",
    name: "वृश्चिक",
    symbol: "♏",
    lord: "मंगल",
    element: "जल तत्व",
    nature: "स्थिर राशि",
    luckyColors: ["गहरा लाल", "केसरिया", "पीला"],
    baseNumbers: [9, 3, 1],
    ishtaDevta: "संकटमोचन हनुमान जी एवं महाकाल",
  },
  {
    id: "dhanu",
    name: "धनु",
    symbol: "♐",
    lord: "गुरु",
    element: "अग्नि तत्व",
    nature: "द्विस्वभाव राशि",
    luckyColors: ["हल्दी पीला", "केसरिया", "सुनहरा"],
    baseNumbers: [3, 9, 1],
    ishtaDevta: "भगवान श्री हरि विष्णु एवं दत्तात्रेय",
  },
  {
    id: "makar",
    name: "मकर",
    symbol: "♑",
    lord: "शनि",
    element: "पृथ्वी तत्व",
    nature: "चर राशि",
    luckyColors: ["गहरा नीला", "मोरपंखी", "आसमानी"],
    baseNumbers: [8, 4, 6],
    ishtaDevta: "शनिदेव एवं भगवान शिव",
  },
  {
    id: "kumbh",
    name: "कुंभ",
    symbol: "♒",
    lord: "शनि",
    element: "वायु तत्व",
    nature: "स्थिर राशि",
    luckyColors: ["नीलम नीला", "बैंगनी", "फिरोजी"],
    baseNumbers: [8, 2, 5],
    ishtaDevta: "महादेव शिव एवं श्री हनुमान",
  },
  {
    id: "meen",
    name: "मीन",
    symbol: "♓",
    lord: "गुरु",
    element: "जल तत्व",
    nature: "द्विस्वभाव राशि",
    luckyColors: ["पीताम्बरी पीला", "केसरिया", "सफेद"],
    baseNumbers: [3, 7, 9],
    ishtaDevta: "भगवान लक्ष्मीनारायण एवं बृहस्पति देव",
  },
];

export interface GocharRow {
  planet: string;
  rashi: string;
  house: number;
  retrograde: boolean;
}

export interface DailyRashifal {
  rashiId: string;
  rashiName: string;
  rashiSymbol: string;
  rashiLord: string;
  dateLabel: string;
  moonTransit: string;
  chandraBal: string;
  rashiLordStatus: string;
  luckyColor: string;
  luckyNumber: string;
  general: string;
  career: string;
  wealth: string;
  love: string;
  health: string;
  remedy: string;
  rows: GocharRow[];
}

const RASHI_INDEX: Record<string, number> = {
  mesh: 0,
  vrishabh: 1,
  mithun: 2,
  kark: 3,
  simh: 4,
  kanya: 5,
  tula: 6,
  vrishchik: 7,
  dhanu: 8,
  makar: 9,
  kumbh: 10,
  meen: 11,
  मेष: 0,
  वृषभ: 1,
  वृष: 1,
  मिथुन: 2,
  कर्क: 3,
  सिंह: 4,
  कन्या: 5,
  तुला: 6,
  वृश्चिक: 7,
  धनु: 8,
  मकर: 9,
  कुंभ: 10,
  कुम्भ: 10,
  मीन: 11,
};

// Classical Moon Gochar Phal from Janma Rashi (1 to 12)
const MOON_GOCHAR_GENERAL: Record<number, { bal: string; summary: string }> = {
  1: {
    bal: "श्रेष्ठ चन्द्र बल (१ला भाव)",
    summary: "आज चंद्रमा आपकी ही राशि (प्रथम भाव) में गोचर कर रहा है। मन में प्रसन्नता, आत्मबल में वृद्धि, उत्तम भोजन, आदर-सम्मान और चेहरे पर विशेष तेज रहेगा।",
  },
  2: {
    bal: "मध्यम चन्द्र बल (२रा भाव)",
    summary: "आज चंद्रमा आपकी राशि से द्वितीय धन व वाणी भाव में है। पारिवारिक चर्चा में संयमित वाणी रखें; अनावश्यक खर्च पर नियंत्रण रखने से कोष सुरक्षित रहेगा।",
  },
  3: {
    bal: "अति शुभ चन्द्र बल (३रा भाव)",
    summary: "आज चंद्रमा आपकी राशि से तृतीय पराक्रम भाव में है। साहस, उत्साह, भाई-बंधुओं से सहयोग, छोटी लाभकारी यात्रा और रुके कार्यों में तुरंत सफलता मिलेगी।",
  },
  4: {
    bal: "संयमपूर्ण चन्द्र बल (४था भाव)",
    summary: "आज चंद्रमा आपकी राशि से चतुर्थ सुख भाव में है। घरेलू कार्यों और माता के स्वास्थ्य पर ध्यान दें; मन को शांत रखकर निर्णय लेना हितकर रहेगा।",
  },
  5: {
    bal: "विचारशील चन्द्र बल (५वाँ भाव)",
    summary: "आज चंद्रमा आपकी राशि से पंचम बुद्धि व संतान भाव में है। भावनाओं में बहने के बजाय विवेक से काम लें; अध्ययन, मंत्र-साधना व संतान पक्ष पर ध्यान दें।",
  },
  6: {
    bal: "विजयकारी चन्द्र बल (६ठा भाव)",
    summary: "आज चंद्रमा आपकी राशि से षष्ठ भाव में गोचर कर रहा है। विरोधियों पर विजय, पुराने विवादों का समाधान, स्वास्थ्य में सुधार और कठिन कार्यों में सिद्धि मिलेगी।",
  },
  7: {
    bal: "शुभ चन्द्र बल (७वाँ भाव)",
    summary: "आज चंद्रमा आपकी राशि से सप्तम भाव में है। साझेदारी के कार्यों में लाभ, दांपत्य जीवन में मधुरता, सामाजिक प्रतिष्ठा और व्यापारिक समझौतों में प्रगति होगी।",
  },
  8: {
    bal: "सावधानी का चन्द्र बल (८वाँ भाव)",
    summary: "आज चंद्रमा आपकी राशि से अष्टम भाव में है। आज बड़े जोखिम, उधार लेन-देन और जल्दबाजी से बचें; शांत रहकर ईश्वर स्मरण करने से हर बाधा टल जाएगी।",
  },
  9: {
    bal: "धर्म-कर्म चन्द्र बल (९वाँ भाव)",
    summary: "आज चंद्रमा आपकी राशि से नवम भाग्य भाव में है। धर्म, आध्यात्मिक चिंतन, गुरुजनों के आशीर्वाद और धैर्यपूर्वक किए गए प्रयासों से भाग्योदय का मार्ग खुलेगा।",
  },
  10: {
    bal: "कार्यसिद्धि चन्द्र बल (१०वाँ भाव)",
    summary: "आज चंद्रमा आपकी राशि से दशम कर्म भाव में है। कार्यक्षेत्र में आपके कौशल की सराहना होगी, वरिष्ठों का सहयोग मिलेगा और इच्छित लक्ष्य समय पर पूरे होंगे।",
  },
  11: {
    bal: "लाभकारी चन्द्र बल (११वाँ भाव)",
    summary: "आज चंद्रमा आपकी राशि से एकादश लाभ भाव में है। आकस्मिक धन लाभ, मित्रों से शुभ समाचार, रुके धन की प्राप्ति और मनोकामना पूर्ति का प्रबल योग है।",
  },
  12: {
    bal: "व्यय-संयम चन्द्र बल (१२वाँ भाव)",
    summary: "आज चंद्रमा आपकी राशि से द्वादश व्यय भाव में है। अनावश्यक दौड़-धूप और फिजूलखर्ची से बचें; धार्मिक दान एवं रात्रि विश्राम पर विशेष ध्यान दें।",
  },
};

// Rashi Lord transit effect by house (1 to 12)
const LORD_HOUSE_EFFECT: Record<number, string> = {
  1: "व्यक्तित्व में निखार, स्वास्थ्य बल और स्वावलंबन से कार्य सिद्ध कराएगा",
  2: "पारिवारिक समन्वय, मधुर वाणी से लाभ और पैतृक धन में वृद्धि का संकेत देगा",
  3: "पराक्रम, आत्मविश्वास और नए संपर्क सूत्रों से विशेष उन्नति दिलाएगा",
  4: "भूमि, वाहन, गृह-सुख और मानसिक संतोष में स्थिरता प्रदान करेगा",
  5: "बौद्धिक कौशल, रचनात्मक योजनाओं और संतान पक्ष से शुभ फल दिलाएगा",
  6: "कठिन प्रतिस्पर्धा में सफलता और अनुशासित दिनचर्या से कर्ज/रोग से मुक्ति दिलाएगा",
  7: "व्यापारिक साझेदारी, जनसंपर्क और जीवनसाथी के सहयोग से प्रगति कराएगा",
  8: "गूढ़ ज्ञान, शोध कार्य और धैर्यपूर्वक संकट प्रबंधन की शक्ति देगा",
  9: "पितृ-गुरु कृपा, उच्च नैतिक बल और दूरगामी भाग्यवृद्धि का मार्ग प्रशस्त करेगा",
  10: "पद-प्रतिष्ठा, नेतृत्व क्षमता और कर्मक्षेत्र में ठोस उपलब्धि दिलाएगा",
  11: "बहुमुखी आय के स्रोत, वरिष्ठ मित्रों का साथ और दीर्घकालीन लाभ दिलाएगा",
  12: "विदेश/दूरस्थ कार्यों, आध्यात्मिक चिंतन और शुभ कार्यों में निवेश कराएगा",
};

const CAREER_BY_HOUSE: Record<number, string> = {
  1: "नई जिम्मेदारी और स्वतंत्र निर्णय क्षमता से कार्यस्थल पर आपकी अलग पहचान बनेगी।",
  2: "वाणी की कुशलता, बैंकिंग, हिसाब-किताब और पारिवारिक व्यवसाय में ठोस सफलता मिलेगी।",
  3: "संचार, मार्केटिंग, लेखन और स्वरोजगार में आपके साहसिक कदम सराहे जाएंगे।",
  4: "रियल एस्टेट, शिक्षा, कृषि और घर से जुड़े कार्यों में स्थिर प्रगति के योग हैं।",
  5: "नई परियोजनाओं की रूपरेखा, सलाहकार कार्य और बौद्धिक निर्णय आज सटीक बैठेंगे।",
  6: "नौकरीपेशा जातकों को कड़ी मेहनत का पूरा प्रतिफल मिलेगा; रुका हुआ काम आगे बढ़ेगा।",
  7: "व्यापारिक अनुबंध, क्लाइंट डीलिंग और साझेदारी के उपक्रमों में उत्तम गति आएगी।",
  8: "तकनीकी, ऑडिट, गुप्त योजना और सूक्ष्म निरीक्षण वाले कार्यों में सावधानी से सफलता मिलेगी।",
  9: "उच्चाधिकारियों का मार्गदर्शन, स्थानांतरण या लंबी व्यावसायिक यात्रा लाभदायक रहेगी।",
  10: "पदोन्नति, राजकीय सम्मान और नेतृत्व की भूमिका में आज श्रेष्ठ प्रदर्शन का अवसर मिलेगा।",
  11: "व्यावसायिक विस्तार, बड़े ऑर्डर की प्राप्ति और टीम के सहयोग से लक्ष्य पूरे होंगे।",
  12: "बहुराष्ट्रीय कंपनियों, आयात-निर्यात व ऑनलाइन कार्यों में नए अवसर प्राप्त होंगे।",
};

const WEALTH_BY_HOUSE: Record<number, string> = {
  1: "आत्मप्रयास से धनागम सुगम रहेगा; स्वयं के कौशल में किया गया निवेश फलदायी होगा।",
  2: "संचित कोष में वृद्धि, रुके हुए पेमेंट की वापसी और स्वर्ण/बचत योजनाओं से लाभ।",
  3: "छोटे व्यापारिक सौदों, कमीशन और त्वरित निर्णयों से आर्थिक स्थिति मजबूत होगी।",
  4: "गृह-उपयोगी वस्तुओं, वाहन या अचल संपत्ति के मामलों में लाभकारी योग बन रहे हैं।",
  5: "पूर्व में किए गए निवेश, बौद्धिक श्रम और शिक्षण/परामर्श से उत्तम आर्थिक लाभ।",
  6: "पुराने ऋण चुकाने में सफलता मिलेगी; बजट बनाकर चलना आज विशेष लाभकारी रहेगा।",
  7: "दैनिक व्यापार, खुदरा बिक्री और साझेदारी के लेन-देन में नकद प्रवाह बढ़ेगा।",
  8: "अचानक रुका धन मिल सकता है, किंतु आज जोखिम भरे सट्टे या उधार देने से बचें।",
  9: "भाग्य के सहयोग से आर्थिक अड़चनें दूर होंगी; धार्मिक या शुभ कार्यों में सार्थक व्यय।",
  10: "कर्मक्षेत्र से बोनस, मानदेय या नए व्यावसायिक अनुबंध द्वारा धन वृद्धि के प्रबल योग।",
  11: "एकादश भाव सक्रिय होने से विविध स्रोतों से लाभ और आर्थिक मनोकामना की पूर्ति।",
  12: "बजट का संतुलन बनाए रखें; आज विलासिता या अनावश्यक वस्तुओं पर खर्च टालें।",
};

const LOVE_BY_HOUSE: Record<number, string> = {
  1: "जीवनसाथी व परिजनों के साथ आत्मीयता बढ़ेगी; आपका सौम्य व्यवहार सबको जोड़े रखेगा।",
  2: "कुटुंब में मांगलिक चर्चा और मधुर संवाद से पारिवारिक वातावरण आनंदमय रहेगा।",
  3: "भाई-बहनों व मित्रों का भरपूर सहयोग मिलेगा; आपसी विश्वास और गहरा होगा।",
  4: "माता का स्नेह और घर के सदस्यों के साथ सुखद समय व्यतीत करने का अवसर मिलेगा।",
  5: "प्रेम संबंधों में प्रगाढ़ता और संतान की किसी उपलब्धि से मन में हर्ष रहेगा।",
  6: "छोटी-छोटी बातों पर तर्क-वितर्क से बचें; धैर्य और क्षमाशीलता से संबंध मधुर रखें।",
  7: "वैवाहिक जीवन में उत्तम सामंजस्य रहेगा; जीवनसाथी की सलाह आज भाग्यवर्धक सिद्ध होगी।",
  8: "ससुराल पक्ष या पुराने पारिवारिक विषयों में शांत व संतुलित संवाद बनाए रखें।",
  9: "परिवार के साथ देव-दर्शन या आध्यात्मिक चर्चा से घर में सकारात्मक ऊर्जा का संचार होगा।",
  10: "कार्य की व्यस्तता के बीच परिवार के लिए समय निकालें; वरिष्ठों का आशीर्वाद मिलेगा।",
  11: "मित्र मंडली और सामाजिक समारोह में सहभागिता से मन प्रफुल्लित रहेगा।",
  12: "एकांत चिंतन और जीवनसाथी के प्रति भावनात्मक सहयोग से मानसिक शांति मिलेगी।",
};

const HEALTH_BY_HOUSE: Record<number, string> = {
  1: "शारीरिक ऊर्जा और रोग-प्रतिरोधक क्षमता उत्तम रहेगी; प्रातः प्राणायाम जारी रखें।",
  2: "नेत्र, दंत एवं गले के स्वास्थ्य का ध्यान रखें; सात्विक व ताजा आहार ग्रहण करें।",
  3: "कंधों व बाहुबल में स्फूर्ति रहेगी; नियमित टहलना स्वास्थ्य के लिए उत्तम रहेगा।",
  4: "छाती व पाचन का ध्यान रखें; रात्रि में गरिष्ठ भोजन से परहेज करें।",
  5: "पित्त व एसिडिटी से बचने के लिए पर्याप्त जल पिएँ और मानसिक तनाव न लें।",
  6: "पुरानी स्वास्थ्य समस्या में सुधार होगा; अनुशासित दिनचर्या और योग अपनाएँ।",
  7: "कमर व गुर्दे के स्वास्थ्य हेतु जल का सेवन बढ़ाएँ; थकान होने पर विश्राम लें।",
  8: "वाहन सावधानी से चलाएँ और मौसम परिवर्तन से बचाव रखें।",
  9: "जंघाओं व नसों में हल्की थकान संभव है; सूर्य नमस्कार व स्ट्रेचिंग लाभकारी रहेगी।",
  10: "घुटनों व जोड़ों के स्वास्थ्य पर ध्यान दें; लंबे समय तक एक ही मुद्रा में न बैठें।",
  11: "स्वास्थ्य सामान्यतः उत्तम और स्फूर्तिदायक रहेगा; मन में सकारात्मक उत्साह बना रहेगा।",
  12: "अनिद्रा व पैरों की थकान से बचने हेतु रात्रि में समय पर शयन करें।",
};

const RASHI_SPECIFIC_REMEDIES: Record<number, string[]> = {
  0: [
    "प्रातः स्नान के बाद तांबे के लोटे से सूर्य को अर्घ्य दें और हनुमान चालीसा का पाठ करें।",
    "माथे पर लाल चंदन या रोली का तिलक लगाएँ तथा 'ॐ अं अंगारकाय नमः' का ११ बार जप करें।",
    "हनुमान जी के मंदिर में चमेली के तेल का दीपक जलाएँ और गुड़-चने का भोग अर्पित करें।",
  ],
  1: [
    "माँ महालक्ष्मी के समक्ष घी का दीपक जलाएँ और 'ॐ शुं शुक्राय नमः' का २१ बार जप करें।",
    "गौ माता को हरा चारा या गुड़-रोटी खिलाएँ तथा सफेद चंदन का तिलक धारण करें।",
    "घर के मंदिर में सफेद पुष्प अर्पित करें और श्री सूक्त की ऋचाओं का स्मरण करें।",
  ],
  2: [
    "भगवान श्री गणेश को २१ दूर्वा दल अर्पित करें और 'ॐ बुं बुधाय नमः' का जप करें।",
    "पक्षियों को हरी मूंग का दाना डालें तथा कार्य पर निकलते समय सौंफ या इलायची लें।",
    "गौशाला में हरा पालक दान करें और विष्णु सहस्रनाम का संक्षिप्त पाठ करें।",
  ],
  3: [
    "भगवान शिव का जल व कच्चे दूध से अभिषेक करें तथा 'ॐ नमः शिवाय' का १०८ जप करें।",
    "माता के चरण स्पर्श कर आशीर्वाद लें और माथे पर भस्म या श्वेत चंदन का तिलक लगाएँ।",
    "शिवालय में अक्षत (अखंड चावल) और सफेद पुष्प अर्पित कर चंद्र देव का स्मरण करें।",
  ],
  4: [
    "उगते सूर्य को कुमकुम व लाल पुष्प मिश्रित जल से अर्घ्य दें और आदित्य हृदय स्तोत्र पढ़ें।",
    "पिता व गुरुजनों का आशीर्वाद लें तथा 'ॐ घृणिः सूर्याय नमः' का ११ बार जप करें।",
    "गेहूँ या गुड़ का दान करें और मस्तक पर केसर-रोली का तिलक लगाकर कार्य प्रारंभ करें।",
  ],
  5: [
    "प्रथम पूज्य श्री गणेश जी को मोदक/गुड़ और दूर्वा अर्पित कर अथर्वशीर्ष का पाठ करें।",
    "तुलसी जी में जल अर्पित कर घी का दीपक जलाएँ और 'ॐ नमो भगवते वासुदेवाय' जपें।",
    "छोटी कन्याओं को फल या मिष्ठान्न भेंट करें तथा हरे रुमाल को साथ रखें।",
  ],
  6: [
    "माँ दुर्गा या महालक्ष्मी को इत्र व कमल/गुलाब पुष्प अर्पित करें और कनकधारा स्तोत्र पढ़ें।",
    "दही-मिश्री का सेवन कर घर से निकलें और 'ॐ द्रां द्रीं द्रौं सः शुक्राय नमः' जपें।",
    "किसी जरूरतमंद को सफेद अन्न (चावल/चीनी) या वस्त्र का सहयोग प्रदान करें।",
  ],
  7: [
    "संकटमोचन हनुमान अष्टक का पाठ करें और लाल मसूर या गुड़ का दान करें।",
    "भगवान शिव को बिल्वपत्र अर्पित करें तथा 'ॐ क्रां क्रीं क्रौं सः भौमाय नमः' का जप करें।",
    "बंदरों या लाल गाय को गुड़-रोटी खिलाएँ और मस्तक पर केसरिया तिलक लगाएँ।",
  ],
  8: [
    "भगवान श्री हरि विष्णु को पीले पुष्प व चने की दाल अर्पित करें और केसर का तिलक लगाएँ।",
    "केले के वृक्ष या पीपल में जल चढ़ाएँ तथा 'ॐ बृं बृहस्पतये नमः' का २१ बार जप करें।",
    "गाय को भीगी हुई चने की दाल व गुड़ खिलाएँ तथा गीता के एक अध्याय का पाठ करें।",
  ],
  9: [
    "पीपल के वृक्ष के नीचे सरसों के तेल का दीपक जलाएँ और 'ॐ शं शनैश्चराय नमः' जपें।",
    "हनुमान जी के दर्शन करें तथा श्रमिकों या असहाय जनों को अन्न/तिल का सहयोग दें।",
    "भगवान शिव के पंचाक्षरी मंत्र का जप करें और काले तिल मिश्रित जल शिवलिंग पर चढ़ाएँ।",
  ],
  10: [
    "भगवान आशुतोष शिव का जलाभिषेक करें और शनि स्तोत्र या हनुमान बाहुक का पाठ करें।",
    "चींटियों को आटा-शक्कर डालें तथा 'ॐ प्रां प्रीं प्रौं सः शनैश्चराय नमः' का जप करें।",
    "पीपल की ७ परिक्रमा करें और पक्षियों के लिए स्वच्छ जल व दाने की व्यवस्था करें।",
  ],
  11: [
    "भगवान लक्ष्मीनारायण की पूजा करें और मस्तक व नाभि पर हल्दी-केसर का तिलक लगाएँ।",
    "'ॐ ग्रां ग्रीं ग्रौं सः गुरवे नमः' का जप करें तथा मंदिर में पीले फल दान करें।",
    "ब्राह्मण या गुरुजन का आशीर्वाद लें और गाय को बेसन के लड्डू या रोटी खिलाएँ।",
  ],
};

function houseFrom(planetSign: number, janmaSign: number): number {
  const p = planetSign >= 1 ? planetSign - 1 : 0;
  return ((p - janmaSign + 12) % 12) + 1;
}

function resolveRashiIndex(rashiIdOrName: string): number {
  const cleaned = (rashiIdOrName || "").trim().toLowerCase();
  if (cleaned in RASHI_INDEX) {
    return RASHI_INDEX[cleaned];
  }
  if (rashiIdOrName && rashiIdOrName.trim() in RASHI_INDEX) {
    return RASHI_INDEX[rashiIdOrName.trim()];
  }
  const foundIdx = RASHI_META.findIndex(
    (r) =>
      r.id.toLowerCase() === cleaned ||
      r.name === rashiIdOrName.trim() ||
      rashiIdOrName.includes(r.name),
  );
  return foundIdx >= 0 ? foundIdx : 0;
}

export function buildDailyRashifal(
  rashiId: string,
  date: Date,
  latitude: number,
  longitude: number,
  timezoneHours = 5.5,
): DailyRashifal {
  const janma = resolveRashiIndex(rashiId);
  const meta = RASHI_META[janma] || RASHI_META[0];
  const planets = calculatePlanetPositions(date, latitude, longitude, timezoneHours);

  const moon = planets.find((p) => p.planet === "चंद्र");
  const sun = planets.find((p) => p.planet === "सूर्य");
  const jupiter = planets.find((p) => p.planet === "गुरु");
  const venus = planets.find((p) => p.planet === "शुक्र");
  const mercury = planets.find((p) => p.planet === "बुध");
  const mars = planets.find((p) => p.planet === "मंगल");
  const saturn = planets.find((p) => p.planet === "शनि");
  const lordPlanet = planets.find((p) => p.planet === meta.lord);

  const rows: GocharRow[] = planets.map((p) => ({
    planet: p.planet,
    rashi: p.rashi,
    house: houseFrom(p.rashiNumber, janma),
    retrograde: p.isRetrograde,
  }));

  const moonHouse = moon ? houseFrom(moon.rashiNumber, janma) : ((janma + 1) % 12) + 1;
  const lordHouse = lordPlanet ? houseFrom(lordPlanet.rashiNumber, janma) : ((janma + 4) % 12) + 1;
  const sunHouse = sun ? houseFrom(sun.rashiNumber, janma) : ((janma + 9) % 12) + 1;
  const jupiterHouse = jupiter ? houseFrom(jupiter.rashiNumber, janma) : ((janma + 8) % 12) + 1;
  const venusHouse = venus ? houseFrom(venus.rashiNumber, janma) : ((janma + 6) % 12) + 1;
  const mercuryHouse = mercury ? houseFrom(mercury.rashiNumber, janma) : ((janma + 2) % 12) + 1;
  const saturnHouse = saturn ? houseFrom(saturn.rashiNumber, janma) : ((janma + 10) % 12) + 1;
  const marsHouse = mars ? houseFrom(mars.rashiNumber, janma) : ((janma + 5) % 12) + 1;

  // Deterministic daily variation index per Rashi + day
  const dayOfYear = Math.floor(
    (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000,
  );

  const moonInfo = MOON_GOCHAR_GENERAL[moonHouse] || MOON_GOCHAR_GENERAL[1];
  const lordEffect = LORD_HOUSE_EFFECT[lordHouse] || LORD_HOUSE_EFFECT[1];

  // Combine houses uniquely per Rashi so Career, Wealth, Love, Health, Remedy are always distinct across all 12 signs
  const careerHouseKey = ((sunHouse + lordHouse + mercuryHouse + janma) % 12) + 1;
  const wealthHouseKey = ((venusHouse + jupiterHouse + lordHouse + janma * 2) % 12) + 1;
  const loveHouseKey = ((venusHouse + moonHouse + janma * 3) % 12) + 1;
  const healthHouseKey = ((marsHouse + saturnHouse + moonHouse + janma) % 12) + 1;

  const weekday = date.toLocaleDateString("hi-IN", { weekday: "long" });
  const dateLabel = date.toLocaleDateString("hi-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const rashiLordStatus = lordPlanet
    ? `राशि स्वामी ${meta.lord} ${lordPlanet.rashi} राशि (${lordHouse}वें भाव) में${lordPlanet.isRetrograde ? " वक्री" : " मार्गी"}`
    : `राशि स्वामी ${meta.lord} (${lordHouse}वें भाव में)`;

  const general = `${meta.name} राशि (${meta.element}) के जातकों के लिए आज ${weekday} को ${moonInfo.summary} आपका राशि स्वामी ${meta.lord} आज आपकी राशि से ${lordHouse}वें भाव (${lordPlanet?.rashi || ""}) में स्थित होकर ${lordEffect}।`;

  const career = `दशम/कर्म दृष्टि व राशि स्वामी ${meta.lord} के ${lordHouse}वें भाव तथा सूर्य के ${sunHouse}वें भाव में गोचर से: ${CAREER_BY_HOUSE[careerHouseKey]}`;

  const wealth = `गुरु (${jupiterHouse}वें भाव) व शुक्र (${venusHouse}वें भाव) के प्रभाव से: ${WEALTH_BY_HOUSE[wealthHouseKey]}`;

  const love = `${LOVE_BY_HOUSE[loveHouseKey]}`;

  const health = `${HEALTH_BY_HOUSE[healthHouseKey]}`;

  const rashiRemedies = RASHI_SPECIFIC_REMEDIES[janma] || RASHI_SPECIFIC_REMEDIES[0];
  const chosenRemedy = rashiRemedies[(dayOfYear + janma) % rashiRemedies.length];
  const luckyColor = meta.luckyColors[(dayOfYear + janma) % meta.luckyColors.length];
  const luckyNum = meta.baseNumbers[(dayOfYear + janma) % meta.baseNumbers.length];

  const remedy = `${chosenRemedy} (इष्ट स्मरण: ${meta.ishtaDevta} • शुभ रंग: ${luckyColor} • शुभ अंक: ${luckyNum})`;

  return {
    rashiId: meta.id,
    rashiName: meta.name,
    rashiSymbol: meta.symbol,
    rashiLord: meta.lord,
    dateLabel,
    moonTransit: moon ? `${moon.rashi} (${moon.nakshatra})` : RASHIS[janma],
    chandraBal: moonInfo.bal,
    rashiLordStatus,
    luckyColor,
    luckyNumber: String(luckyNum),
    general,
    career,
    wealth,
    love,
    health,
    remedy,
    rows,
  };
}
