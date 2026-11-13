import { PlanetPosition } from "../types";
import { calculatePlanetPositions, RASHIS } from "./astronomy";
import { trPlanet, trRashi, trVedic } from "../i18n/vedicTranslate";
import i18n from "../i18n";

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

const RASHI_META_EXTRA: Record<string, {
  elementEn: string; elementGu: string;
  natureEn: string; natureGu: string;
  ishtaEn: string; ishtaGu: string;
  colorsEn: string[]; colorsGu: string[];
}> = {
  mesh: {
    elementEn: "Fire Element", elementGu: "અગ્નિ તત્વ",
    natureEn: "Movable Sign", natureGu: "ચર રાશિ",
    ishtaEn: "Lord Hanuman & Kartikeya", ishtaGu: "શ્રી હનુમાન જી અને કાર્તિકેય ભગવાન",
    colorsEn: ["Vermilion Red", "Saffron", "Coral Red"],
    colorsGu: ["સિંદૂરી લાલ", "કેસરી", "મૂંગા લાલ"],
  },
  vrishabh: {
    elementEn: "Earth Element", elementGu: "પૃથ્વી તત્વ",
    natureEn: "Fixed Sign", natureGu: "સ્થિર રાશિ",
    ishtaEn: "Maa Mahalakshmi & Maa Durga", ishtaGu: "મહાલક્ષ્મી અને મા દુર્ગા",
    colorsEn: ["Milky White", "Pink", "Light Blue"],
    colorsGu: ["દૂધિયા સફેદ", "ગુલાબી", "આછો વાદળી"],
  },
  mithun: {
    elementEn: "Air Element", elementGu: "વાયુ તત્વ",
    natureEn: "Dual Sign", natureGu: "દ્વિસ્વભાવ રાશિ",
    ishtaEn: "Lord Ganesha & Lord Vishnu", ishtaGu: "ભગવાન શ્રી ગણેશ અને શ્રી વિષ્ણુ",
    colorsEn: ["Emerald Green", "Light Yellow", "Parrot Green"],
    colorsGu: ["પન્ના લીલો", "આછો પીળો", "પોપટી લીલો"],
  },
  kark: {
    elementEn: "Water Element", elementGu: "જળ તત્વ",
    natureEn: "Movable Sign", natureGu: "ચર રાશિ",
    ishtaEn: "Lord Shiva (Ashutosh)", ishtaGu: "ભગવાન આશુતોષ શિવજી",
    colorsEn: ["Pearl White", "Silver White", "Soft Cream"],
    colorsGu: ["મોતી સફેદ", "ચાંદી જેવો ઉજ્જ્વળ", "આછો ક્રીમ"],
  },
  simh: {
    elementEn: "Fire Element", elementGu: "અગ્નિ તત્વ",
    natureEn: "Fixed Sign", natureGu: "સ્થિર રાશિ",
    ishtaEn: "Lord Suryanarayana & Shri Ram", ishtaGu: "ભગવાન સૂર્યનારાયણ અને શ્રી રામ",
    colorsEn: ["Golden Yellow", "Crimson Red", "Orange"],
    colorsGu: ["સોનેરી પીળો", "અરુણ લાલ", "નારંગી"],
  },
  kanya: {
    elementEn: "Earth Element", elementGu: "પૃથ્વી તત્વ",
    natureEn: "Dual Sign", natureGu: "દ્વિસ્વભાવ રાશિ",
    ishtaEn: "Lord Ganesha & Maa Tripurasundari", ishtaGu: "ભગવાન શ્રી ગણેશ અને મા ત્રિપુરસુંદરી",
    colorsEn: ["Tulsi Green", "Light Turquoise", "White"],
    colorsGu: ["તુલસી લીલો", "આછો ફિરોઝી", "સફેદ"],
  },
  tula: {
    elementEn: "Air Element", elementGu: "વાયુ તત્વ",
    natureEn: "Movable Sign", natureGu: "ચર રાશિ",
    ishtaEn: "Maa Mahalakshmi & Santoshi Mata", ishtaGu: "મા મહાલક્ષ્મી અને સંતોષી માતા",
    colorsEn: ["Crystal White", "Sky Blue", "Cream"],
    colorsGu: ["સ્ફટિક સફેદ", "આસમાની", "ક્રીમ"],
  },
  vrishchik: {
    elementEn: "Water Element", elementGu: "જળ તત્વ",
    natureEn: "Fixed Sign", natureGu: "સ્થિર રાશિ",
    ishtaEn: "Sankatmochan Hanuman & Mahakal", ishtaGu: "સંકટમોચન હનુમાન જી અને મહાકાલ",
    colorsEn: ["Deep Red", "Saffron", "Yellow"],
    colorsGu: ["ઘેરો લાલ", "કેસરી", "પીળો"],
  },
  dhanu: {
    elementEn: "Fire Element", elementGu: "અગ્નિ તત્વ",
    natureEn: "Dual Sign", natureGu: "દ્વિસ્વભાવ રાશિ",
    ishtaEn: "Lord Hari Vishnu & Dattatreya", ishtaGu: "ભગવાન શ્રી હરિ વિષ્ણુ અને દત્તાત્રેય",
    colorsEn: ["Turmeric Yellow", "Saffron", "Gold"],
    colorsGu: ["હળદર પીળો", "કેસરી", "સોનેરી"],
  },
  makar: {
    elementEn: "Earth Element", elementGu: "પૃથ્વી તત્વ",
    natureEn: "Movable Sign", natureGu: "ચર રાશિ",
    ishtaEn: "Shani Dev & Lord Shiva", ishtaGu: "શનિદેવ અને ભગવાન શિવ",
    colorsEn: ["Deep Blue", "Peacock Teal", "Sky Blue"],
    colorsGu: ["ઘેરો વાદળી", "મોરપીંછ રંગ", "આસમાની"],
  },
  kumbh: {
    elementEn: "Air Element", elementGu: "વાયુ તત્વ",
    natureEn: "Fixed Sign", natureGu: "સ્થિર રાશિ",
    ishtaEn: "Lord Mahadev & Shri Hanuman", ishtaGu: "મહાદેવ શિવ અને શ્રી હનુમાન",
    colorsEn: ["Sapphire Blue", "Violet", "Turquoise"],
    colorsGu: ["નીલમ વાદળી", "જાંબલી", "ફિરોઝી"],
  },
  meen: {
    elementEn: "Water Element", elementGu: "જળ તત્વ",
    natureEn: "Dual Sign", natureGu: "દ્વિસ્વભાવ રાશિ",
    ishtaEn: "Lord Lakshminarayana & Brihaspati", ishtaGu: "ભગવાન લક્ષ્મીનારાયણ અને બૃહસ્પતિ દેવ",
    colorsEn: ["Pitambari Yellow", "Saffron", "White"],
    colorsGu: ["પીતાંબરી પીળો", "કેસરી", "સફેદ"],
  },
};

export function getTranslatedRashiMeta(meta: RashiMetaItem, lang?: string): RashiMetaItem {
  const c = (lang || i18n.language || "hi").slice(0, 2).toLowerCase();
  const extra = RASHI_META_EXTRA[meta.id] || RASHI_META_EXTRA.mesh;
  if (c === "en") {
    return {
      ...meta,
      name: trRashi(meta.name, "en"),
      lord: trPlanet(meta.lord, "en"),
      element: extra.elementEn,
      nature: extra.natureEn,
      luckyColors: extra.colorsEn,
      ishtaDevta: extra.ishtaEn,
    };
  }
  if (c === "gu") {
    return {
      ...meta,
      name: trRashi(meta.name, "gu"),
      lord: trPlanet(meta.lord, "gu"),
      element: extra.elementGu,
      nature: extra.natureGu,
      luckyColors: extra.colorsGu,
      ishtaDevta: extra.ishtaGu,
    };
  }
  return meta;
}

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
  chandraBalRank: number;
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
const MOON_GOCHAR_GENERAL: Record<number, {
  bal: string; balEn: string; balGu: string;
  summary: string; summaryEn: string; summaryGu: string;
  rank: number;
}> = {
  1: {
    bal: "श्रेष्ठ चन्द्र बल (१ला भाव)",
    balEn: "Excellent Chandra Bal (1st House)",
    balGu: "શ્રેષ્ઠ ચંદ્ર બળ (૧લો ભાવ)",
    summary: "आज चंद्रमा आपकी ही राशि (प्रथम भाव) में गोचर कर रहा है। मन में प्रसन्नता, आत्मबल में वृद्धि, उत्तम भोजन, आदर-सम्मान और चेहरे पर विशेष तेज रहेगा।",
    summaryEn: "Today the Moon transits your own sign (1st house). Expect mental joy, heightened self-confidence, good meals, honor, and natural radiance.",
    summaryGu: "આજે ચંદ્ર તમારી જ રાશિ (પ્રથમ ભાવ) માં ગોચર કરે છે. મનમાં પ્રસન્નતા, આત્મબળમાં વૃદ્ધિ, ઉત્તમ ભોજન અને માન-સન્માન મળશે.",
    rank: 1,
  },
  2: {
    bal: "मध्यम चन्द्र बल (२रा भाव)",
    balEn: "Moderate Chandra Bal (2nd House)",
    balGu: "મધ્યમ ચંદ્ર બળ (૨જો ભાવ)",
    summary: "आज चंद्रमा आपकी राशि से द्वितीय धन व वाणी भाव में है। पारिवारिक चर्चा में संयमित वाणी रखें; अनावश्यक खर्च पर नियंत्रण रखने से कोष सुरक्षित रहेगा।",
    summaryEn: "The Moon transits your 2nd house of wealth and speech. Speak with restraint in family discussions and curb unnecessary expenses to protect savings.",
    summaryGu: "આજે ચંદ્ર તમારી રાશિથી દ્વિતીય ધન અને વાણી ભાવમાં છે. પારિવારિક ચર્ચામાં વાણી પર સંયમ રાખો અને બિનજરૂરી ખર્ચ ટાળો.",
    rank: 4,
  },
  3: {
    bal: "अति शुभ चन्द्र बल (३रा भाव)",
    balEn: "Highly Auspicious Chandra Bal (3rd House)",
    balGu: "અતિ શુભ ચંદ્ર બળ (૩જો ભાવ)",
    summary: "आज चंद्रमा आपकी राशि से तृतीय पराक्रम भाव में है। साहस, उत्साह, भाई-बंधुओं से सहयोग, छोटी लाभकारी यात्रा और रुके कार्यों में तुरंत सफलता मिलेगी।",
    summaryEn: "The Moon transits your 3rd house of valor. Courage, enthusiasm, support from siblings, rewarding short trips, and swift breakthroughs await.",
    summaryGu: "આજે ચંદ્ર તમારી રાશિથી તૃતીય પરાક્રમ ભાવમાં છે. સાહસ, ઉત્સાહ, ભાઈ-બહેનોનો સહયોગ, નાની લાભદાયી યાત્રા અને અટકેલા કાર્યોમાં સફળતા મળશે.",
    rank: 1,
  },
  4: {
    bal: "संयमपूर्ण चन्द्र बल (४था भाव)",
    balEn: "Calm Chandra Bal (4th House)",
    balGu: "સંયમપૂર્ણ ચંદ્ર બળ (૪થો ભાવ)",
    summary: "आज चंद्रमा आपकी राशि से चतुर्थ सुख भाव में है। घरेलू कार्यों और माता के स्वास्थ्य पर ध्यान दें; मन को शांत रखकर निर्णय लेना हितकर रहेगा।",
    summaryEn: "The Moon transits your 4th house of comforts. Tend to domestic matters and mother's well-being; make decisions with a calm mind.",
    summaryGu: "આજે ચંદ્ર તમારી રાશિથી ચતુર્થ સુખ ભાવમાં છે. ઘરેલું કાર્યો અને માતાના સ્વાસ્થ્ય પર ધ્યાન આપો; મન શાંત રાખીને નિર્ણય લો.",
    rank: 5,
  },
  5: {
    bal: "विचारशील चन्द्र बल (५वाँ भाव)",
    balEn: "Thoughtful Chandra Bal (5th House)",
    balGu: "વિચારશીલ ચંદ્ર બળ (૫મો ભાવ)",
    summary: "आज चंद्रमा आपकी राशि से पंचम बुद्धि व संतान भाव में है। भावनाओं में बहने के बजाय विवेक से काम लें; अध्ययन, मंत्र-साधना व संतान पक्ष पर ध्यान दें।",
    summaryEn: "The Moon transits your 5th house of intellect and children. Act with discernment rather than impulse; focus on study, sadhana, and children.",
    summaryGu: "આજે ચંદ્ર તમારી રાશિથી પંચમ બુદ્ધિ અને સંતાન ભાવમાં છે. લાગણીમાં વહેવાને બદલે વિવેકથી કામ લો; અભ્યાસ અને સાધનામાં ધ્યાન આપો.",
    rank: 4,
  },
  6: {
    bal: "विजयकारी चन्द्र बल (६ठा भाव)",
    balEn: "Victorious Chandra Bal (6th House)",
    balGu: "વિજયકારી ચંદ્ર બળ (૬ઠ્ઠો ભાવ)",
    summary: "आज चंद्रमा आपकी राशि से षष्ठ भाव में गोचर कर रहा है। विरोधियों पर विजय, पुराने विवादों का समाधान, स्वास्थ्य में सुधार और कठिन कार्यों में सिद्धि मिलेगी।",
    summaryEn: "The Moon transits your 6th house of victory. Triumph over rivals, resolution of old disputes, improved health, and success in tough tasks follow.",
    summaryGu: "આજે ચંદ્ર તમારી રાશિથી છઠ્ઠા ભાવમાં છે. વિરોધીઓ પર વિજય, જૂના વિવાદોનું સમાધાન, સ્વાસ્થ્ય સુધારો અને મુશ્કેલ કાર્યોમાં સિદ્ધિ મળશે.",
    rank: 2,
  },
  7: {
    bal: "शुभ चन्द्र बल (७वाँ भाव)",
    balEn: "Auspicious Chandra Bal (7th House)",
    balGu: "શુભ ચંદ્ર બળ (૭મો ભાવ)",
    summary: "आज चंद्रमा आपकी राशि से सप्तम भाव में है। साझेदारी के कार्यों में लाभ, दांपत्य जीवन में मधुरता, सामाजिक प्रतिष्ठा और व्यापारिक समझौतों में प्रगति होगी।",
    summaryEn: "The Moon transits your 7th house of partnerships. Gains in collaborations, marital harmony, social prestige, and smooth business deals are indicated.",
    summaryGu: "આજે ચંદ્ર તમારી રાશિથી સપ્તમ ભાવમાં છે. ભાગીદારીના કાર્યોમાં લાભ, દાંપત્ય જીવનમાં મધુરતા અને વેપારમાં પ્રગતિ થશે.",
    rank: 3,
  },
  8: {
    bal: "सावधानी का चन्द्र बल (८वाँ भाव)",
    balEn: "Cautious Chandra Bal (8th House)",
    balGu: "સાવચેતીનું ચંદ્ર બળ (૮મો ભાવ)",
    summary: "आज चंद्रमा आपकी राशि से अष्टम भाव में है। आज बड़े जोखिम, उधार लेन-देन और जल्दबाजी से बचें; शांत रहकर ईश्वर स्मरण करने से हर बाधा टल जाएगी।",
    summaryEn: "The Moon transits your 8th house. Avoid high-risk moves, lending money, and haste today; quiet prayer and patience will avert obstacles.",
    summaryGu: "આજે ચંદ્ર તમારી રાશિથી અષ્ટમ ભાવમાં છે. મોટું જોખમ, ઉધાર લેવડ-દેવડ અને ઉતાવળ ટાળો; શાંત ચિત્તે પ્રભુ સ્મરણથી વિઘ્નો દૂર થશે.",
    rank: 5,
  },
  9: {
    bal: "धर्म-कर्म चन्द्र बल (९वाँ भाव)",
    balEn: "Dharmic Chandra Bal (9th House)",
    balGu: "ધર્મ-કર્મ ચંદ્ર બળ (૯મો ભાવ)",
    summary: "आज चंद्रमा आपकी राशि से नवम भाग्य भाव में है। धर्म, आध्यात्मिक चिंतन, गुरुजनों के आशीर्वाद और धैर्यपूर्वक किए गए प्रयासों से भाग्योदय का मार्ग खुलेगा।",
    summaryEn: "The Moon transits your 9th house of fortune. Dharma, spiritual reflection, elders' blessings, and steady efforts open doors to luck.",
    summaryGu: "આજે ચંદ્ર તમારી રાશિથી નવમ ભાગ્ય ભાવમાં છે. ધર્મ, આધ્યાત્મિક ચિંતન, વડીલોના આશીર્વાદ અને ધીરજભર્યા પ્રયાસોથી ભાગ્યોદય થશે.",
    rank: 4,
  },
  10: {
    bal: "कार्यसिद्धि चन्द्र बल (१०वाँ भाव)",
    balEn: "Success Chandra Bal (10th House)",
    balGu: "કાર્યસિદ્ધિ ચંદ્ર બળ (૧૦મો ભાવ)",
    summary: "आज चंद्रमा आपकी राशि से दशम कर्म भाव में है। कार्यक्षेत्र में आपके कौशल की सराहना होगी, वरिष्ठों का सहयोग मिलेगा और इच्छित लक्ष्य समय पर पूरे होंगे।",
    summaryEn: "The Moon transits your 10th house of karma. Your workplace skills earn praise, seniors lend support, and key targets conclude right on time.",
    summaryGu: "આજે ચંદ્ર તમારી રાશિથી દશમ કર્મ ભાવમાં છે. કાર્યક્ષેત્રમાં તમારી કુશળતાની પ્રશંસા થશે, ઉપરી અધિકારીઓનો સહયોગ મળશે.",
    rank: 2,
  },
  11: {
    bal: "लाभकारी चन्द्र बल (११वाँ भाव)",
    balEn: "Gainful Chandra Bal (11th House)",
    balGu: "લાભકારી ચંદ્ર બળ (૧૧મો ભાવ)",
    summary: "आज चंद्रमा आपकी राशि से एकादश लाभ भाव में है। आकस्मिक धन लाभ, मित्रों से शुभ समाचार, रुके धन की प्राप्ति और मनोकामना पूर्ति का प्रबल योग है।",
    summaryEn: "The Moon transits your 11th house of gains. Unexpected financial windfalls, good news from friends, recovered dues, and wish fulfillment shine.",
    summaryGu: "આજે ચંદ્ર તમારી રાશિથી અગિયારમા લાભ ભાવમાં છે. આકસ્મિક ધનલાભ, મિત્રો તરફથી શુભ સમાચાર અને અટકેલા નાણાં પ્રાપ્તિના યોગ છે.",
    rank: 2,
  },
  12: {
    bal: "व्यय-संयम चन्द्र बल (१२वाँ भाव)",
    balEn: "Restrained Chandra Bal (12th House)",
    balGu: "વ્યય-સંયમ ચંદ્ર બળ (૧૨મો ભાવ)",
    summary: "आज चंद्रमा आपकी राशि से द्वादश व्यय भाव में है। अनावश्यक दौड़-धूप और फिजूलखर्ची से बचें; धार्मिक दान एवं रात्रि विश्राम पर विशेष ध्यान दें।",
    summaryEn: "The Moon transits your 12th house of expenditure. Avoid needless running around and extravagance; prioritize charity and restful sleep.",
    summaryGu: "આજે ચંદ્ર તમારી રાશિથી બારમા વ્યય ભાવમાં છે. બિનજરૂરી દોડધામ અને ખોટા ખર્ચથી બચો; દાન-પુણ્ય અને પૂરતા આરામ પર ધ્યાન આપો.",
    rank: 5,
  },
};

const LORD_HOUSE_EFFECT: Record<number, { hi: string; en: string; gu: string }> = {
  1: {
    hi: "व्यक्तित्व में निखार, स्वास्थ्य बल और स्वावलंबन से कार्य सिद्ध कराएगा",
    en: "enhances personality, vitality, and self-reliant accomplishment",
    gu: "વ્યક્તિત્વમાં નિખાર, સ્વાસ્થ્ય બળ અને સ્વાવલંબનથી કાર્ય સિદ્ધ કરાવશે",
  },
  2: {
    hi: "पारिवारिक समन्वय, मधुर वाणी से लाभ और पैतृक धन में वृद्धि का संकेत देगा",
    en: "brings family harmony, gains through pleasant speech, and growth in savings",
    gu: "પારિવારિક સંવાદિતા, મધુર વાણીથી લાભ અને બચતમાં વૃદ્ધિનો સંકેત આપશે",
  },
  3: {
    hi: "पराक्रम, आत्मविश्वास और नए संपर्क सूत्रों से विशेष उन्नति दिलाएगा",
    en: "grants valor, confidence, and notable progress via new networks",
    gu: "પરાક્રમ, આત્મવિશ્વાસ અને નવા સંપર્કોથી વિશેષ પ્રગતિ અપાવશે",
  },
  4: {
    hi: "भूमि, वाहन, गृह-सुख और मानसिक संतोष में स्थिरता प्रदान करेगा",
    en: "bestows domestic peace, property or vehicle comforts, and inner steadiness",
    gu: "જમીન, વાહન, ગૃહસુખ અને માનસિક સંતોષમાં સ્થિરતા આપશે",
  },
  5: {
    hi: "बौद्धिक कौशल, रचनात्मक योजनाओं और संतान पक्ष से शुभ फल दिलाएगा",
    en: "favors sharp intellect, creative initiatives, and joyful news from children",
    gu: "બૌદ્ધિક કુશળતા, સર્જનાત્મક યોજનાઓ અને સંતાન પક્ષે શુભ ફળ આપશે",
  },
  6: {
    hi: "कठिन प्रतिस्पर्धा में सफलता और अनुशासित दिनचर्या से कर्ज/रोग से मुक्ति दिलाएगा",
    en: "supports competitive triumph and relief from debt or ailments via discipline",
    gu: "સ્પર્ધામાં સફળતા અને શિસ્તબદ્ધ દિનચર્યાથી દેવા/રોગમાંથી મુક્તિ અપાવશે",
  },
  7: {
    hi: "व्यापारिक साझेदारी, जनसंपर्क और जीवनसाथी के सहयोग से प्रगति कराएगा",
    en: "drives growth through partnerships, public relations, and spousal support",
    gu: "વેપારી ભાગીદારી, જનસંપર્ક અને જીવનસાથીના સહયોગથી પ્રગતિ કરાવશે",
  },
  8: {
    hi: "गूढ़ ज्ञान, शोध कार्य और धैर्यपूर्वक संकट प्रबंधन की शक्ति देगा",
    en: "empowers deep research, occult insight, and calm crisis management",
    gu: "ગૂઢ જ્ઞાન, સંશોધન કાર્ય અને ધીરજપૂર્વક સંકટ નિવારણની શક્તિ આપશે",
  },
  9: {
    hi: "पितृ-गुरु कृपा, उच्च नैतिक बल और दूरगामी भाग्यवृद्धि का मार्ग प्रशस्त करेगा",
    en: "opens pathways to mentors' grace, righteousness, and enduring good fortune",
    gu: "વડીલ-ગુરુ કૃપા, ઉચ્ચ નૈતિક બળ અને દૂરગામી ભાગ્યવૃદ્ધિનો માર્ગ ખોલશે",
  },
  10: {
    hi: "पद-प्रतिष्ठा, नेतृत्व क्षमता और कर्मक्षेत्र में ठोस उपलब्धि दिलाएगा",
    en: "brings status, leadership authority, and solid achievements at work",
    gu: "પદ-પ્રતિષ્ઠા, નેતૃત્વ ક્ષમતા અને કર્મક્ષેત્રમાં નક્કર સિદ્ધિ અપાવશે",
  },
  11: {
    hi: "बहुमुखी आय के स्रोत, वरिष्ठ मित्रों का साथ और दीर्घकालीन लाभ दिलाएगा",
    en: "unlocks multiple income streams, loyal allies, and long-term gains",
    gu: "બહુમુખી આવકના સ્ત્રોત, મિત્રોનો સાથ અને લાંબા ગાળાનો લાભ આપશે",
  },
  12: {
    hi: "विदेश/दूरस्थ कार्यों, आध्यात्मिक चिंतन और शुभ कार्यों में निवेश कराएगा",
    en: "favors overseas or remote ventures, spiritual reflection, and charitable spending",
    gu: "વિદેશ/દૂરસ્થ કાર્યો, આધ્યાત્મિક ચિંતન અને શુભ કાર્યોમાં રોકાણ કરાવશે",
  },
};

const CAREER_BY_HOUSE: Record<number, { hi: string; en: string; gu: string }> = {
  1: {
    hi: "नई जिम्मेदारी और स्वतंत्र निर्णय क्षमता से कार्यस्थल पर आपकी अलग पहचान बनेगी।",
    en: "New responsibilities and independent judgment will set you apart at work.",
    gu: "નવી જવાબદારી અને સ્વતંત્ર નિર્ણય શક્તિથી કાર્યસ્થળે તમારી અલગ ઓળખ બનશે.",
  },
  2: {
    hi: "वाणी की कुशलता, बैंकिंग, हिसाब-किताब और पारिवारिक व्यवसाय में ठोस सफलता मिलेगी।",
    en: "Skillful communication boosts success in banking, accounts, and family business.",
    gu: "વાણીની કુશળતા, બેંકિંગ, હિસાબ અને પારિવારિક વ્યવસાયમાં નક્કર સફળતા મળશે.",
  },
  3: {
    hi: "संचार, मार्केटिंग, लेखन और स्वरोजगार में आपके साहसिक कदम सराहे जाएंगे।",
    en: "Bold strides in media, marketing, writing, and self-employment win appreciation.",
    gu: "સંચાર, માર્કેટિંગ, લેખન અને સ્વરોજગારમાં તમારા સાહસિક પગલાંની પ્રશંસા થશે.",
  },
  4: {
    hi: "रियल एस्टेट, शिक्षा, कृषि और घर से जुड़े कार्यों में स्थिर प्रगति के योग हैं।",
    en: "Steady momentum appears in real estate, education, agriculture, and home-based work.",
    gu: "રિયલ એસ્ટેટ, શિક્ષણ, કૃષિ અને ઘર સંબંધિત કાર્યોમાં સ્થિર પ્રગતિના યોગ છે.",
  },
  5: {
    hi: "नई परियोजनाओं की रूपरेखा, सलाहकार कार्य और बौद्धिक निर्णय आज सटीक बैठेंगे।",
    en: "Project planning, advisory roles, and analytical decisions prove spot-on today.",
    gu: "નવી યોજનાઓની રૂપરેખા, સલાહકાર કાર્ય અને બૌદ્ધિક નિર્ણયો આજે સચોટ ઠરશે.",
  },
  6: {
    hi: "नौकरीपेशा जातकों को कड़ी मेहनत का पूरा प्रतिफल मिलेगा; रुका हुआ काम आगे बढ़ेगा।",
    en: "Salaried professionals reap full rewards for hard work; stalled tasks resume.",
    gu: "નોકરિયાત વર્ગને મહેનતનું પૂરું ફળ મળશે; અટકેલું કામ આગળ વધશે.",
  },
  7: {
    hi: "व्यापारिक अनुबंध, क्लाइंट डीलिंग और साझेदारी के उपक्रमों में उत्तम गति आएगी।",
    en: "Business contracts, client negotiations, and joint ventures gain strong momentum.",
    gu: "વેપારી કરાર, ક્લાયન્ટ ડીલિંગ અને ભાગીદારીના કાર્યોમાં ઉત્તમ ગતિ આવશે.",
  },
  8: {
    hi: "तकनीकी, ऑडिट, गुप्त योजना और सूक्ष्म निरीक्षण वाले कार्यों में सावधानी से सफलता मिलेगी।",
    en: "Precision and patience bring success in technical, audit, and research work.",
    gu: "ટેકનિકલ, ઓડિટ અને સૂક્ષ્મ નિરીક્ષણ વાળા કાર્યોમાં સાવચેતીથી સફળતા મળશે.",
  },
  9: {
    hi: "उच्चाधिकारियों का मार्गदर्शन, स्थानांतरण या लंबी व्यावसायिक यात्रा लाभदायक रहेगी।",
    en: "Guidance from seniors, transfers, or long work trips turn highly productive.",
    gu: "ઉચ્ચ અધિકારીઓનું માર્ગદર્શન કે લાંબી વ્યવસાયિક યાત્રા લાભદાયી રહેશે.",
  },
  10: {
    hi: "पदोन्नति, राजकीय सम्मान और नेतृत्व की भूमिका में आज श्रेष्ठ प्रदर्शन का अवसर मिलेगा।",
    en: "Opportunities arise for promotion, recognition, and standout leadership performance.",
    gu: "પદોન્નતિ, માન-સન્માન અને નેતૃત્વની ભૂમિકામાં શ્રેષ્ઠ પ્રદર્શનની તક મળશે.",
  },
  11: {
    hi: "व्यावसायिक विस्तार, बड़े ऑर्डर की प्राप्ति और टीम के सहयोग से लक्ष्य पूरे होंगे।",
    en: "Business expansion, major orders, and seamless teamwork fulfill key goals.",
    gu: "વ્યવસાયિક વિસ્તાર, મોટા ઓર્ડર અને ટીમના સહયોગથી લક્ષ્યો પૂર્ણ થશે.",
  },
  12: {
    hi: "बहुराष्ट्रीय कंपनियों, आयात-निर्यात व ऑनलाइन कार्यों में नए अवसर प्राप्त होंगे।",
    en: "Fresh openings emerge in global firms, import-export, and online ventures.",
    gu: "બહુરાષ્ટ્રીય કંપનીઓ, આયાત-નિકાસ અને ઓનલાઇન કાર્યોમાં નવી તકો મળશે.",
  },
};

const WEALTH_BY_HOUSE: Record<number, { hi: string; en: string; gu: string }> = {
  1: {
    hi: "आत्मप्रयास से धनागम सुगम रहेगा; स्वयं के कौशल में किया गया निवेश फलदायी होगा।",
    en: "Self-driven income flows smoothly; investing in your own skills pays off well.",
    gu: "સ્વપ્રયત્નથી ધનાગમ સરળ રહેશે; પોતાની કુશળતામાં કરેલું રોકાણ ફળદાયી બનશે.",
  },
  2: {
    hi: "संचित कोष में वृद्धि, रुके हुए पेमेंट की वापसी और स्वर्ण/बचत योजनाओं से लाभ।",
    en: "Savings grow with pending payments clearing and steady returns from secure assets.",
    gu: "બચતમાં વધારો, અટકેલા પેમેન્ટની વસૂલાત અને બચત યોજનાઓથી લાભ થશે.",
  },
  3: {
    hi: "छोटे व्यापारिक सौदों, कमीशन और त्वरित निर्णयों से आर्थिक स्थिति मजबूत होगी।",
    en: "Quick trade deals, commissions, and timely calls strengthen your finances.",
    gu: "નાના વેપારી સોદા, કમિશન અને ત્વરિત નિર્ણયોથી આર્થિક સ્થિતિ મજબૂત થશે.",
  },
  4: {
    hi: "गृह-उपयोगी वस्तुओं, वाहन या अचल संपत्ति के मामलों में लाभकारी योग बन रहे हैं।",
    en: "Favorable financial alignment appears around home upgrades, vehicles, or property.",
    gu: "ઘરવપરાશની વસ્તુઓ, વાહન કે સ્થાવર મિલકતની બાબતોમાં લાભકારી યોગ છે.",
  },
  5: {
    hi: "पूर्व में किए गए निवेश, बौद्धिक श्रम और शिक्षण/परामर्श से उत्तम आर्थिक लाभ।",
    en: "Past investments, intellectual work, and consulting bring rewarding financial gains.",
    gu: "અગાઉ કરેલા રોકાણ, બૌદ્ધિક શ્રમ અને માર્ગદર્શનથી ઉત્તમ આર્થિક લાભ થશે.",
  },
  6: {
    hi: "पुराने ऋण चुकाने में सफलता मिलेगी; बजट बनाकर चलना आज विशेष लाभकारी रहेगा।",
    en: "Progress comes in clearing old dues; sticking to a clear budget pays dividends.",
    gu: "જૂનું દેવું ચૂકવવામાં સફળતા મળશે; બજેટ બનાવીને ચાલવું વિશેષ લાભદાયી રહેશે.",
  },
  7: {
    hi: "दैनिक व्यापार, खुदरा बिक्री और साझेदारी के लेन-देन में नकद प्रवाह बढ़ेगा।",
    en: "Daily trade, retail turnover, and partnership settlements boost cash flow.",
    gu: "દૈનિક વેપાર, છૂટક વેચાણ અને ભાગીદારીના વ્યવહારોમાં રોકડ પ્રવાહ વધશે.",
  },
  8: {
    hi: "अचानक रुका धन मिल सकता है, किंतु आज जोखिम भरे सट्टे या उधार देने से बचें।",
    en: "Stuck funds may surface unexpectedly, yet avoid speculative bets or lending today.",
    gu: "અચાનક અટકેલા નાણાં મળી શકે છે, પરંતુ આજે જોખમી સટ્ટા કે ઉધાર આપવાથી બચો.",
  },
  9: {
    hi: "भाग्य के सहयोग से आर्थिक अड़चनें दूर होंगी; धार्मिक या शुभ कार्यों में सार्थक व्यय।",
    en: "Fortune clears financial hurdles; meaningful spending on noble causes brings peace.",
    gu: "ભાગ્યના સહયોગથી આર્થિક અડચણો દૂર થશે; શુભ કાર્યોમાં સાર્થક ખર્ચ થશે.",
  },
  10: {
    hi: "कर्मक्षेत्र से बोनस, मानदेय या नए व्यावसायिक अनुबंध द्वारा धन वृद्धि के प्रबल योग।",
    en: "Strong prospects for bonuses, incentives, or fresh business contracts boost wealth.",
    gu: "કાર્યક્ષેત્રમાંથી બોનસ, માનદ વેતન કે નવા કરાર દ્વારા ધન વૃદ્ધિના પ્રબળ યોગ છે.",
  },
  11: {
    hi: "एकादश भाव सक्रिय होने से विविध स्रोतों से लाभ और आर्थिक मनोकामना की पूर्ति।",
    en: "Active 11th house brings multi-source gains and fulfillment of financial goals.",
    gu: "અગિયારમો ભાવ સક્રિય હોવાથી વિવિધ સ્ત્રોતોથી લાભ અને આર્થિક ઈચ્છા પૂર્ણ થશે.",
  },
  12: {
    hi: "बजट का संतुलन बनाए रखें; आज विलासिता या अनावश्यक वस्तुओं पर खर्च टालें।",
    en: "Keep your budget balanced today and hold back from luxury or impulse buying.",
    gu: "બજેટનું સંતુલન જાળવો; આજે મોજશોખ કે બિનજરૂરી વસ્તુઓ પાછળ ખર્ચ ટાળો.",
  },
};

const LOVE_BY_HOUSE: Record<number, { hi: string; en: string; gu: string }> = {
  1: {
    hi: "जीवनसाथी व परिजनों के साथ आत्मीयता बढ़ेगी; आपका सौम्य व्यवहार सबको जोड़े रखेगा।",
    en: "Warmth deepens with spouse and family; your gentle nature keeps everyone united.",
    gu: "જીવનસાથી અને પરિવારજનો સાથે આત્મીયતા વધશે; તમારો સૌમ્ય સ્વભાવ સૌને જોડી રાખશે.",
  },
  2: {
    hi: "कुटुंब में मांगलिक चर्चा और मधुर संवाद से पारिवारिक वातावरण आनंदमय रहेगा।",
    en: "Auspicious family talks and sweet dialogue keep the household cheerful.",
    gu: "પરિવારમાં માંગલિક ચર્ચા અને મધુર સંવાદથી ઘરનું વાતાવરણ આનંદમય રહેશે.",
  },
  3: {
    hi: "भाई-बहनों व मित्रों का भरपूर सहयोग मिलेगा; आपसी विश्वास और गहरा होगा।",
    en: "Strong warmth from siblings and close friends deepens mutual trust.",
    gu: "ભાઈ-બહેનો અને મિત્રોનો ભરપૂર સહયોગ મળશે; પરસ્પર વિશ્વાસ વધુ ગાઢ બનશે.",
  },
  4: {
    hi: "माता का स्नेह और घर के सदस्यों के साथ सुखद समय व्यतीत करने का अवसर मिलेगा।",
    en: "Mother's affection and peaceful quality time with family lift your spirits.",
    gu: "માતાનો સ્નેહ અને ઘરના સભ્યો સાથે સુખદ સમય પસાર કરવાની તક મળશે.",
  },
  5: {
    hi: "प्रेम संबंधों में प्रगाढ़ता और संतान की किसी उपलब्धि से मन में हर्ष रहेगा।",
    en: "Affection deepens in romance, and joyful news regarding children brightens your day.",
    gu: "પ્રેમ સંબંધોમાં ગાઢતા અને સંતાનની કોઈ સિદ્ધિથી મનમાં આનંદ રહેશે.",
  },
  6: {
    hi: "छोटी-छोटी बातों पर तर्क-वितर्क से बचें; धैर्य और क्षमाशीलता से संबंध मधुर रखें।",
    en: "Avoid bickering over minor matters; patience and forgiveness preserve harmony.",
    gu: "નાની-નાની વાતોમાં દલીલો ટાળો; ધીરજ અને ક્ષમાભાવથી સંબંધો મધુર રાખો.",
  },
  7: {
    hi: "वैवाहिक जीवन में उत्तम सामंजस्य रहेगा; जीवनसाथी की सलाह आज भाग्यवर्धक सिद्ध होगी।",
    en: "Marital harmony flourishes; your partner's insight brings good luck today.",
    gu: "વૈવાહિક જીવનમાં ઉત્તમ સુમેળ રહેશે; જીવનસાથીની સલાહ આજે ભાગ્યવર્ધક બનશે.",
  },
  8: {
    hi: "ससुराल पक्ष या पुराने पारिवारिक विषयों में शांत व संतुलित संवाद बनाए रखें।",
    en: "Maintain calm, balanced communication with in-laws and on older family topics.",
    gu: "સાસરી પક્ષ કે જૂના પારિવારિક વિષયોમાં શાંત અને સંતુલિત સંવાદ જાળવો.",
  },
  9: {
    hi: "परिवार के साथ देव-दर्शन या आध्यात्मिक चर्चा से घर में सकारात्मक ऊर्जा का संचार होगा।",
    en: "Temple visits or spiritual talks with loved ones fill the home with positive aura.",
    gu: "પરિવાર સાથે દેવ-દર્શન કે આધ્યાત્મિક ચર્ચાથી ઘરમાં સકારાત્મક ઊર્જા આવશે.",
  },
  10: {
    hi: "कार्य की व्यस्तता के बीच परिवार के लिए समय निकालें; वरिष्ठों का आशीर्वाद मिलेगा।",
    en: "Carve out time for family amid busy work; elders' blessings uplift the home.",
    gu: "કામની વ્યસ્તતા વચ્ચે પરિવાર માટે સમય કાઢો; વડીલોના આશીર્વાદ મળશે.",
  },
  11: {
    hi: "मित्र मंडली और सामाजिक समारोह में सहभागिता से मन प्रफुल्लित रहेगा।",
    en: "Social gatherings and warm camaraderie with friends keep your heart cheerful.",
    gu: "મિત્રમંડળ અને સામાજિક પ્રસંગોમાં સહભાગિતાથી મન પ્રફુલ્લિત રહેશે.",
  },
  12: {
    hi: "एकांत चिंतन और जीवनसाथी के प्रति भावनात्मक सहयोग से मानसिक शांति मिलेगी।",
    en: "Quiet reflection and tender emotional support for your partner bring peace.",
    gu: "એકાંત ચિંતન અને જીવનસાથી પ્રત્યે લાગણીશીલ સહકારથી માનસિક શાંતિ મળશે.",
  },
};

const HEALTH_BY_HOUSE: Record<number, { hi: string; en: string; gu: string }> = {
  1: {
    hi: "शारीरिक ऊर्जा और रोग-प्रतिरोधक क्षमता उत्तम रहेगी; प्रातः प्राणायाम जारी रखें।",
    en: "Physical vitality and immunity remain strong; continue morning pranayama.",
    gu: "શારીરિક ઊર્જા અને રોગપ્રતિકારક શક્તિ ઉત્તમ રહેશે; સવારે પ્રાણાયામ ચાલુ રાખો.",
  },
  2: {
    hi: "नेत्र, दंत एवं गले के स्वास्थ्य का ध्यान रखें; सात्विक व ताजा आहार ग्रहण करें।",
    en: "Care for eyes, teeth, and throat; choose fresh, sattvik home-cooked meals.",
    gu: "આંખ, દાંત અને ગળાના સ્વાસ્થ્યનું ધ્યાન રાખો; સાત્વિક અને તાજો આહાર લો.",
  },
  3: {
    hi: "कंधों व बाहुबल में स्फूर्ति रहेगी; नियमित टहलना स्वास्थ्य के लिए उत्तम रहेगा।",
    en: "Upper-body energy feels brisk; a regular brisk walk benefits well-being.",
    gu: "ખભા અને હાથમાં સ્ફૂર્તિ રહેશે; નિયમિત ચાલવું સ્વાસ્થ્ય માટે ઉત્તમ રહેશે.",
  },
  4: {
    hi: "छाती व पाचन का ध्यान रखें; रात्रि में गरिष्ठ भोजन से परहेज करें।",
    en: "Watch chest and digestion comfort; avoid heavy or oily meals at night.",
    gu: "છાતી અને પાચનનું ધ્યાન રાખો; રાત્રે ભારે ખોરાક લેવાનું ટાળો.",
  },
  5: {
    hi: "पित्त व एसिडिटी से बचने के लिए पर्याप्त जल पिएँ और मानसिक तनाव न लें।",
    en: "Stay hydrated and keep stress low to prevent acidity or Pitta imbalance.",
    gu: "પિત્ત અને એસિડિટીથી બચવા પૂરતું પાણી પીવો અને માનસિક તણાવ ન લો.",
  },
  6: {
    hi: "पुरानी स्वास्थ्य समस्या में सुधार होगा; अनुशासित दिनचर्या और योग अपनाएँ।",
    en: "Lingering health concerns improve; adopt a disciplined routine and yoga.",
    gu: "જૂની સ્વાસ્થ્ય સમસ્યામાં સુધારો થશે; નિયમિત દિનચર્યા અને યોગ અપનાવો.",
  },
  7: {
    hi: "कमर व गुर्दे के स्वास्थ्य हेतु जल का सेवन बढ़ाएँ; थकान होने पर विश्राम लें।",
    en: "Drink ample water for lower-back and kidney health; rest if fatigued.",
    gu: "કમર અને કિડનીના સ્વાસ્થ્ય માટે પાણી વધુ પીવો; થાક લાગે તો આરામ કરો.",
  },
  8: {
    hi: "वाहन सावधानी से चलाएँ और मौसम परिवर्तन से बचाव रखें।",
    en: "Drive mindfully today and protect yourself against seasonal shifts.",
    gu: "વાહન સાવચેતીથી ચલાવો અને હવામાનના ફેરફારથી બચીને રહો.",
  },
  9: {
    hi: "जंघाओं व नसों में हल्की थकान संभव है; सूर्य नमस्कार व स्ट्रेचिंग लाभकारी रहेगी।",
    en: "Mild leg stiffness is possible; gentle Surya Namaskar and stretching help.",
    gu: "પગ અને નસોમાં હળવો થાક શક્ય છે; સૂર્યનમસ્કાર અને સ્ટ્રેચિંગ લાભદાયી રહેશે.",
  },
  10: {
    hi: "घुटनों व जोड़ों के स्वास्थ्य पर ध्यान दें; लंबे समय तक एक ही मुद्रा में न बैठें।",
    en: "Care for knees and joints; avoid sitting continuously in one posture.",
    gu: "ઘૂંટણ અને સાંધાના સ્વાસ્થ્ય પર ધ્યાન આપો; લાંબો સમય એક જ સ્થિતિમાં ન બેસો.",
  },
  11: {
    hi: "स्वास्थ्य सामान्यतः उत्तम और स्फूर्तिदायक रहेगा; मन में सकारात्मक उत्साह बना रहेगा।",
    en: "Overall health stays upbeat and energetic; positive enthusiasm prevails.",
    gu: "સ્વાસ્થ્ય સામાન્ય રીતે ઉત્તમ અને સ્ફૂર્તિદાયક રહેશે; મનમાં ઉત્સાહ જળવાશે.",
  },
  12: {
    hi: "अनिद्रा व पैरों की थकान से बचने हेतु रात्रि में समय पर शयन करें।",
    en: "Keep a consistent bedtime to prevent restlessness or foot fatigue.",
    gu: "અનિદ્રા અને પગના થાકથી બચવા રાત્રે સમયસર સૂવાની ટેવ રાખો.",
  },
};

const RASHI_SPECIFIC_REMEDIES: Record<number, { hi: string[]; en: string[]; gu: string[] }> = {
  0: {
    hi: [
      "प्रातः स्नान के बाद तांबे के लोटे से सूर्य को अर्घ्य दें और हनुमान चालीसा का पाठ करें।",
      "माथे पर लाल चंदन या रोली का तिलक लगाएँ तथा 'ॐ अं अंगारकाय नमः' का ११ बार जप करें।",
      "हनुमान जी के मंदिर में चमेली के तेल का दीपक जलाएँ और गुड़-चने का भोग अर्पित करें।",
    ],
    en: [
      "After morning bath, offer water to the Sun in a copper vessel and recite Hanuman Chalisa.",
      "Apply red sandalwood tilak on the forehead and chant 'ॐ अं अंगारकाय नमः' 11 times.",
      "Light a jasmine-oil lamp at a Hanuman temple and offer jaggery with roasted gram.",
    ],
    gu: [
      "સવારે સ્નાન બાદ તાંબાના લોટાથી સૂર્યને અર્ઘ્ય આપો અને હનુમાન ચાલીસાનો પાઠ કરો.",
      "કપાળે લાલ ચંદન કે કંકુનું તિલક કરો અને 'ॐ अं अंगारकाय नमः' નો ૧૧ વાર જપ કરો.",
      "હનુમાનજીના મંદિરે ચમેલીના તેલનો દીવો કરો અને ગોળ-ચણાનો પ્રસાદ ધરાવો.",
    ],
  },
  1: {
    hi: [
      "माँ महालक्ष्मी के समक्ष घी का दीपक जलाएँ और 'ॐ शुं शुक्राय नमः' का २१ बार जप करें।",
      "गौ माता को हरा चारा या गुड़-रोटी खिलाएँ तथा सफेद चंदन का तिलक धारण करें।",
      "घर के मंदिर में सफेद पुष्प अर्पित करें और श्री सूक्त की ऋचाओं का स्मरण करें।",
    ],
    en: [
      "Light a ghee lamp before Maa Mahalakshmi and chant 'ॐ शुं शुक्राय नमः' 21 times.",
      "Feed green fodder or roti-jaggery to a cow and apply white sandalwood tilak.",
      "Offer white flowers at your home altar and recite verses of Shri Sukta.",
    ],
    gu: [
      "મા મહાલક્ષ્મી સમક્ષ ઘીનો દીવો કરો અને 'ॐ शुं शुक्राय नमः' નો ૨૧ વાર જપ કરો.",
      "ગૌમાતાને લીલું ઘાસ કે ગોળ-રોટલી ખવડાવો અને સફેદ ચંદનનું તિલક કરો.",
      "ઘરના મંદિરમાં સફેદ પુષ્પો અર્પણ કરો અને શ્રી સૂક્તનું સ્મરણ કરો.",
    ],
  },
  2: {
    hi: [
      "भगवान श्री गणेश को २१ दूर्वा दल अर्पित करें और 'ॐ बुं बुधाय नमः' का जप करें।",
      "पक्षियों को हरी मूंग का दाना डालें तथा कार्य पर निकलते समय सौंफ या इलायची लें।",
      "गौशाला में हरा पालक दान करें और विष्णु सहस्रनाम का संक्षिप्त पाठ करें।",
    ],
    en: [
      "Offer 21 Durva grass blades to Lord Ganesha and chant 'ॐ बुं बुधाय नमः'.",
      "Feed green moong grains to birds and take a pinch of fennel or cardamom before work.",
      "Donate fresh spinach at a goshala and recite verses from Vishnu Sahasranama.",
    ],
    gu: [
      "ભગવાન શ્રી ગણેશજીને ૨૧ દૂર્વા અર્પણ કરો અને 'ॐ बुं बुधाय नमः' નો જપ કરો.",
      "પક્ષીઓને લીલા મગ નાખો અને કામ પર નીકળતા સમયે વરિયાળી કે એલચી લો.",
      "ગૌશાળામાં લીલી પાલકનું દાન કરો અને વિષ્ણુ સહસ્રનામનો સંક્ષિપ્ત પાઠ કરો.",
    ],
  },
  3: {
    hi: [
      "भगवान शिव का जल व कच्चे दूध से अभिषेक करें तथा 'ॐ नमः शिवाय' का १०८ जप करें।",
      "माता के चरण स्पर्श कर आशीर्वाद लें और माथे पर भस्म या श्वेत चंदन का तिलक लगाएँ।",
      "शिवालय में अक्षत (अखंड चावल) और सफेद पुष्प अर्पित कर चंद्र देव का स्मरण करें।",
    ],
    en: [
      "Offer water and raw milk abhishek to Lord Shiva and chant 'ॐ नमः शिवाय' 108 times.",
      "Touch your mother's feet for blessings and apply sacred ash or white sandalwood tilak.",
      "Offer unbroken rice (Akshat) and white flowers at a Shiva temple.",
    ],
    gu: [
      "ભગવાન શિવનો જળ અને કાચા દૂધથી અભિષેક કરો અને 'ॐ नमः शिवाय' ના ૧૦૮ જપ કરો.",
      "માતાના ચરણ સ્પર્શ કરી આશીર્વાદ લો અને કપાળે ભસ્મ કે સફેદ ચંદનનું તિલક કરો.",
      "શિવાલયમાં અખંડ ચોખા અને સફેદ પુષ્પ અર્પણ કરી ચંદ્રદેવનું સ્મરણ કરો.",
    ],
  },
  4: {
    hi: [
      "उगते सूर्य को कुमकुम व लाल पुष्प मिश्रित जल से अर्घ्य दें और आदित्य हृदय स्तोत्र पढ़ें।",
      "पिता व गुरुजनों का आशीर्वाद लें तथा 'ॐ घृणिः सूर्याय नमः' का ११ बार जप करें।",
      "गेहूँ या गुड़ का दान करें और मस्तक पर केसर-रोली का तिलक लगाकर कार्य प्रारंभ करें।",
    ],
    en: [
      "Offer water mixed with kumkum and red petals to the rising Sun and recite Aditya Hridayam.",
      "Seek blessings of father and elders, and chant 'ॐ घृणिः सूर्याय नमः' 11 times.",
      "Donate wheat or jaggery and begin your day with a saffron-roli tilak.",
    ],
    gu: [
      "ઉગતા સૂર્યને કંકુ અને લાલ પુષ્પ મિશ્રિત જળથી અર્ઘ્ય આપો અને આદિત્ય હૃદય સ્તોત્ર વાંચો.",
      "પિતા અને ગુરુજનોના આશીર્વાદ લો તથા 'ॐ घृणिः सूर्याय नमः' નો ૧૧ વાર જપ કરો.",
      "ઘઉં કે ગોળનું દાન કરો અને કપાળે કેસર-કંકુનું તિલક લગાવી કાર્યની શરૂઆત કરો.",
    ],
  },
  5: {
    hi: [
      "प्रथम पूज्य श्री गणेश जी को मोदक/गुड़ और दूर्वा अर्पित कर अथर्वशीर्ष का पाठ करें।",
      "तुलसी जी में जल अर्पित कर घी का दीपक जलाएँ और 'ॐ नमो भगवते वासुदेवाय' जपें।",
      "छोटी कन्याओं को फल या मिष्ठान्न भेंट करें तथा हरे रुमाल को साथ रखें।",
    ],
    en: [
      "Offer modak/jaggery and Durva grass to Lord Ganesha and recite Ganapati Atharvashirsha.",
      "Water the sacred Tulsi plant, light a ghee lamp, and chant 'ॐ नमो भगवते वासुदेवाय'.",
      "Offer fruits or sweets to young girls and keep a green handkerchief with you.",
    ],
    gu: [
      "શ્રી ગણેશજીને મોદક/ગોળ અને દૂર્વા અર્પણ કરી અથર્વશીર્ષનો પાઠ કરો.",
      "તુલસીજીને જળ ચઢાવી ઘીનો દીવો કરો અને 'ॐ नमो भगवते वासुदेवाय' નો જપ કરો.",
      "નાની કન્યાઓને ફળ કે મીઠાઈ ભેટ આપો અને લીલો રૂમાલ સાથે રાખો.",
    ],
  },
  6: {
    hi: [
      "माँ दुर्गा या महालक्ष्मी को इत्र व कमल/गुलाब पुष्प अर्पित करें और कनकधारा स्तोत्र पढ़ें।",
      "दही-मिश्री का सेवन कर घर से निकलें और 'ॐ द्रां द्रीं द्रौं सः शुक्राय नमः' जपें।",
      "किसी जरूरतमंद को सफेद अन्न (चावल/चीनी) या वस्त्र का सहयोग प्रदान करें।",
    ],
    en: [
      "Offer fragrance and lotus/rose flowers to Maa Mahalakshmi and recite Kanakadhara Stotra.",
      "Take a spoon of curd with rock sugar before stepping out and chant 'ॐ द्रां द्रीं द्रौं सः शुक्राय नमः'.",
      "Donate white grains (rice/sugar) or clothing to someone in need.",
    ],
    gu: [
      "મા દુર્ગા કે મહાલક્ષ્મીને અત્તર અને કમળ/ગુલાબ અર્પણ કરી કનકધારા સ્તોત્ર વાંચો.",
      "દહીં-સાકર ખાઈને ઘરેથી નીકળો અને 'ॐ द्रां द्रीं द्रौं सः शुक्राय नमः' નો જપ કરો.",
      "કોઈ જરૂરિયાતમંદને સફેદ અનાજ (ચોખા/ખાંડ) કે વસ્ત્રનું દાન કરો.",
    ],
  },
  7: {
    hi: [
      "संकटमोचन हनुमान अष्टक का पाठ करें और लाल मसूर या गुड़ का दान करें।",
      "भगवान शिव को बिल्वपत्र अर्पित करें तथा 'ॐ क्रां क्रीं क्रौं सः भौमाय नमः' का जप करें।",
      "बंदरों या लाल गाय को गुड़-रोटी खिलाएँ और मस्तक पर केसरिया तिलक लगाएँ।",
    ],
    en: [
      "Recite Sankatmochan Hanuman Ashtak and donate red masoor lentils or jaggery.",
      "Offer Bilva leaves to Lord Shiva and chant 'ॐ क्रां क्रीं क्रौं सः भौमाय नमः'.",
      "Feed roti with jaggery to cows or monkeys and wear a saffron tilak.",
    ],
    gu: [
      "સંકટમોચન હનુમાન અષ્ટકનો પાઠ કરો અને લાલ મસૂર કે ગોળનું દાન કરો.",
      "ભગવાન શિવને બિલીપત્ર અર્પણ કરો અને 'ॐ क्रां क्रीं क्रौं सः भौमाय नमः' નો જપ કરો.",
      "ગાયને ગોળ-રોટલી ખવડાવો અને કપાળે કેસરિયું તિલક લગાવો.",
    ],
  },
  8: {
    hi: [
      "भगवान श्री हरि विष्णु को पीले पुष्प व चने की दाल अर्पित करें और केसर का तिलक लगाएँ।",
      "केले के वृक्ष या पीपल में जल चढ़ाएँ तथा 'ॐ बृं बृहस्पतये नमः' का २१ बार जप करें।",
      "गाय को भीगी हुई चने की दाल व गुड़ खिलाएँ तथा गीता के एक अध्याय का पाठ करें।",
    ],
    en: [
      "Offer yellow flowers and chana dal to Lord Vishnu and apply a saffron tilak.",
      "Offer water to a banana or Peepal tree and chant 'ॐ बृं बृहस्पतये नमः' 21 times.",
      "Feed soaked chana dal with jaggery to a cow and read a chapter of Bhagavad Gita.",
    ],
    gu: [
      "ભગવાન શ્રી હરિ વિષ્ણુને પીળા પુષ્પ અને ચણાની દાળ અર્પણ કરી કેસરનું તિલક કરો.",
      "કેળના વૃક્ષ કે પીપળે જળ ચઢાવો અને 'ॐ बृं बृहस्पतये नमः' નો ૨૧ વાર જપ કરો.",
      "ગાયને પલાળેલી ચણાની દાળ અને ગોળ ખવડાવો તથા ગીતાનો એક અધ્યાય વાંચો.",
    ],
  },
  9: {
    hi: [
      "पीपल के वृक्ष के नीचे सरसों के तेल का दीपक जलाएँ और 'ॐ शं शनैश्चराय नमः' जपें।",
      "हनुमान जी के दर्शन करें तथा श्रमिकों या असहाय जनों को अन्न/तिल का सहयोग दें।",
      "भगवान शिव के पंचाक्षरी मंत्र का जप करें और काले तिल मिश्रित जल शिवलिंग पर चढ़ाएँ।",
    ],
    en: [
      "Light a mustard-oil lamp under a Peepal tree and chant 'ॐ शं शनैश्चराय नमः'.",
      "Visit Lord Hanuman and help laborers or the needy with food or sesame.",
      "Chant Shiva's Panchakshari mantra and offer water with black sesame to Shivling.",
    ],
    gu: [
      "પીપળાના વૃક્ષ નીચે સરસવના તેલનો દીવો કરો અને 'ॐ शं शनैश्चराय नमः' નો જપ કરો.",
      "હનુમાનજીના દર્શન કરો અને શ્રમિકો કે જરૂરિયાતમંદોને અન્ન/તલની મદદ કરો.",
      "ભગવાન શિવના પંચાક્ષર મંત્રનો જપ કરો અને કાળા તલ મિશ્રિત જળ શિવલિંગ પર ચઢાવો.",
    ],
  },
  10: {
    hi: [
      "भगवान आशुतोष शिव का जलाभिषेक करें और शनि स्तोत्र या हनुमान बाहुक का पाठ करें।",
      "चींटियों को आटा-शक्कर डालें तथा 'ॐ प्रां प्रीं प्रौं सः शनैश्चराय नमः' का जप करें।",
      "पीपल की ७ परिक्रमा करें और पक्षियों के लिए स्वच्छ जल व दाने की व्यवस्था करें।",
    ],
    en: [
      "Perform Jalabhishek of Lord Shiva and recite Shani Stotra or Hanuman Bahuk.",
      "Feed flour with sugar to ants and chant 'ॐ प्रां प्रीं प्रौं सः शनैश्चराय नमः'.",
      "Take 7 circumambulations around a Peepal tree and provide clean water and grain for birds.",
    ],
    gu: [
      "ભગવાન શિવનો જળાભિષેક કરો અને શનિ સ્તોત્ર કે હનુમાન બાહુકનો પાઠ કરો.",
      "કીડીઓને લોટ-સાકર નાખો અને 'ॐ प्रां प्रीं प्रौं सः शनैश्चराय नमः' નો જપ કરો.",
      "પીપળાની ૭ પ્રદક્ષિણા કરો અને પક્ષીઓ માટે સ્વચ્છ પાણી અને દાણાની વ્યવસ્થા કરો.",
    ],
  },
  11: {
    hi: [
      "भगवान लक्ष्मीनारायण की पूजा करें और मस्तक व नाभि पर हल्दी-केसर का तिलक लगाएँ।",
      "'ॐ ग्रां ग्रीं ग्रौं सः गुरवे नमः' का जप करें तथा मंदिर में पीले फल दान करें।",
      "ब्राह्मण या गुरुजन का आशीर्वाद लें और गाय को बेसन के लड्डू या रोटी खिलाएँ।",
    ],
    en: [
      "Worship Lord Lakshminarayana and apply turmeric-saffron tilak on the forehead.",
      "Chant 'ॐ ग्रां ग्रीं ग्रौं सः गुरवे नमः' and donate yellow fruits at a temple.",
      "Seek blessings from elders/gurus and feed besan laddu or roti to a cow.",
    ],
    gu: [
      "ભગવાન લક્ષ્મીનારાયણની પૂજા કરો અને કપાળે હળદર-કેસરનું તિલક લગાવો.",
      "'ॐ ग्रां ग्रीं ग्रौं सः गुरवे नमः' નો જપ કરો અને મંદિરમાં પીળા ફળોનું દાન કરો.",
      "ગુરુજનોના આશીર્વાદ લો અને ગાયને ચણાના લોટનો લાડુ કે રોટલી ખવડાવો.",
    ],
  },
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

function pickTxt(lang: string, obj: { hi: string; en: string; gu: string }): string {
  if (lang === "en") return obj.en;
  if (lang === "gu") return obj.gu;
  return obj.hi;
}

function houseOrdinalEn(n: number): string {
  if (n === 1) return "1st";
  if (n === 2) return "2nd";
  if (n === 3) return "3rd";
  return `${n}th`;
}

export function buildDailyRashifal(
  rashiId: string,
  date: Date,
  latitude: number,
  longitude: number,
  timezoneHours = 5.5,
  lang?: string,
): DailyRashifal {
  const cLang = (lang || i18n.language || "hi").slice(0, 2).toLowerCase();
  const dateLocale = cLang === "en" ? "en-US" : cLang === "gu" ? "gu-IN" : "hi-IN";

  const janma = resolveRashiIndex(rashiId);
  const rawMeta = RASHI_META[janma] || RASHI_META[0];
  const locMeta = getTranslatedRashiMeta(rawMeta, cLang);
  const extra = RASHI_META_EXTRA[rawMeta.id] || RASHI_META_EXTRA.mesh;

  const planets = calculatePlanetPositions(date, latitude, longitude, timezoneHours);

  const moon = planets.find((p) => p.planet === "चंद्र");
  const sun = planets.find((p) => p.planet === "सूर्य");
  const jupiter = planets.find((p) => p.planet === "गुरु");
  const venus = planets.find((p) => p.planet === "शुक्र");
  const mercury = planets.find((p) => p.planet === "बुध");
  const mars = planets.find((p) => p.planet === "मंगल");
  const saturn = planets.find((p) => p.planet === "शनि");
  const lordPlanet = planets.find((p) => p.planet === rawMeta.lord);

  const rows: GocharRow[] = planets.map((p) => ({
    planet: trPlanet(p.planet, cLang),
    rashi: trRashi(p.rashi, cLang),
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

  const dayOfYear = Math.floor(
    (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000,
  );

  const moonInfo = MOON_GOCHAR_GENERAL[moonHouse] || MOON_GOCHAR_GENERAL[1];
  const lordEffectObj = LORD_HOUSE_EFFECT[lordHouse] || LORD_HOUSE_EFFECT[1];
  const lordEffect = pickTxt(cLang, lordEffectObj);

  const careerHouseKey = ((sunHouse + lordHouse + mercuryHouse + janma) % 12) + 1;
  const wealthHouseKey = ((venusHouse + jupiterHouse + lordHouse + janma * 2) % 12) + 1;
  const loveHouseKey = ((venusHouse + moonHouse + janma * 3) % 12) + 1;
  const healthHouseKey = ((marsHouse + saturnHouse + moonHouse + janma) % 12) + 1;

  const weekday = date.toLocaleDateString(dateLocale, { weekday: "long" });
  const dateLabel = date.toLocaleDateString(dateLocale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const lordRashiName = lordPlanet ? trRashi(lordPlanet.rashi, cLang) : "";

  const rashiLordStatus =
    cLang === "en"
      ? lordPlanet
        ? `Sign Lord ${locMeta.lord} in ${lordRashiName} (${houseOrdinalEn(lordHouse)} House, ${lordPlanet.isRetrograde ? "Retrograde" : "Direct"})`
        : `Sign Lord ${locMeta.lord} (${houseOrdinalEn(lordHouse)} House)`
      : cLang === "gu"
      ? lordPlanet
        ? `રાશિ સ્વામી ${locMeta.lord} ${lordRashiName} રાશિ (${lordHouse}મા ભાવમાં) ${lordPlanet.isRetrograde ? "વક્રી" : "માર્ગી"}`
        : `રાશિ સ્વામી ${locMeta.lord} (${lordHouse}મા ભાવમાં)`
      : lordPlanet
      ? `राशि स्वामी ${rawMeta.lord} ${lordPlanet.rashi} राशि (${lordHouse}वें भाव) में${lordPlanet.isRetrograde ? " वक्री" : " मार्गी"}`
      : `राशि स्वामी ${rawMeta.lord} (${lordHouse}वें भाव में)`;

  const moonSummary =
    cLang === "en" ? moonInfo.summaryEn : cLang === "gu" ? moonInfo.summaryGu : moonInfo.summary;

  const chandraBalText =
    cLang === "en" ? moonInfo.balEn : cLang === "gu" ? moonInfo.balGu : moonInfo.bal;

  const general =
    cLang === "en"
      ? `For ${locMeta.name} (${locMeta.element}) natives on ${weekday}: ${moonSummary} Your sign lord ${locMeta.lord} is placed in the ${houseOrdinalEn(lordHouse)} house (${lordRashiName}), which ${lordEffect}.`
      : cLang === "gu"
      ? `${locMeta.name} રાશિ (${locMeta.element}) ના જાતકો માટે આજે ${weekday} ના રોજ: ${moonSummary} તમારા રાશિ સ્વામી ${locMeta.lord} આજે ${lordHouse}મા ભાવ (${lordRashiName}) માં રહીને ${lordEffect}.`
      : `${rawMeta.name} राशि (${rawMeta.element}) के जातकों के लिए आज ${weekday} को ${moonInfo.summary} आपका राशि स्वामी ${rawMeta.lord} आज आपकी राशि से ${lordHouse}वें भाव (${lordPlanet?.rashi || ""}) में स्थित होकर ${lordEffect}।`;

  const careerText = pickTxt(cLang, CAREER_BY_HOUSE[careerHouseKey]);
  const career =
    cLang === "en"
      ? `With sign lord ${locMeta.lord} in the ${houseOrdinalEn(lordHouse)} and Sun in the ${houseOrdinalEn(sunHouse)} house: ${careerText}`
      : cLang === "gu"
      ? `રાશિ સ્વામી ${locMeta.lord} (${lordHouse}મો ભાવ) અને સૂર્ય (${sunHouse}મો ભાવ) ના ગોચરથી: ${careerText}`
      : `दशम/कर्म दृष्टि व राशि स्वामी ${rawMeta.lord} के ${lordHouse}वें भाव तथा सूर्य के ${sunHouse}वें भाव में गोचर से: ${careerText}`;

  const wealthText = pickTxt(cLang, WEALTH_BY_HOUSE[wealthHouseKey]);
  const wealth =
    cLang === "en"
      ? `Influenced by Jupiter (${houseOrdinalEn(jupiterHouse)}) and Venus (${houseOrdinalEn(venusHouse)}): ${wealthText}`
      : cLang === "gu"
      ? `ગુરુ (${jupiterHouse}મો ભાવ) અને શુક્ર (${venusHouse}મો ભાવ) ના પ્રભાવથી: ${wealthText}`
      : `गुरु (${jupiterHouse}वें भाव) व शुक्र (${venusHouse}वें भाव) के प्रभाव से: ${wealthText}`;

  const love = pickTxt(cLang, LOVE_BY_HOUSE[loveHouseKey]);
  const health = pickTxt(cLang, HEALTH_BY_HOUSE[healthHouseKey]);

  const remObj = RASHI_SPECIFIC_REMEDIES[janma] || RASHI_SPECIFIC_REMEDIES[0];
  const rashiRemedies = cLang === "en" ? remObj.en : cLang === "gu" ? remObj.gu : remObj.hi;
  const chosenRemedy = rashiRemedies[(dayOfYear + janma) % rashiRemedies.length];

  const colorList =
    cLang === "en" ? extra.colorsEn : cLang === "gu" ? extra.colorsGu : rawMeta.luckyColors;
  const luckyColor = colorList[(dayOfYear + janma) % colorList.length];
  const luckyNum = rawMeta.baseNumbers[(dayOfYear + janma) % rawMeta.baseNumbers.length];

  const remedy =
    cLang === "en"
      ? `${chosenRemedy} (Ishta Devta: ${locMeta.ishtaDevta} • Lucky Color: ${luckyColor} • Lucky No: ${luckyNum})`
      : cLang === "gu"
      ? `${chosenRemedy} (ઇષ્ટ સ્મરણ: ${locMeta.ishtaDevta} • શુભ રંગ: ${luckyColor} • શુભ અંક: ${luckyNum})`
      : `${chosenRemedy} (इष्ट स्मरण: ${rawMeta.ishtaDevta} • शुभ रंग: ${luckyColor} • शुभ अंक: ${luckyNum})`;

  const moonTransit = moon
    ? `${trRashi(moon.rashi, cLang)} (${trVedic(moon.nakshatra, cLang)})`
    : trRashi(RASHIS[janma], cLang);

  return {
    rashiId: rawMeta.id,
    rashiName: locMeta.name,
    rashiSymbol: rawMeta.symbol,
    rashiLord: locMeta.lord,
    dateLabel,
    moonTransit,
    chandraBal: chandraBalText,
    chandraBalRank: moonInfo.rank,
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
