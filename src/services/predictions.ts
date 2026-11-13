import { KundaliData, PlanetPosition } from "../types";
import { RASHIS, calculatePlanetPositions } from "./astronomy";
import { DASHA_ORDER } from "./kundali";
import { trPlanet, trRashi, trVedic } from "../i18n/vedicTranslate";

export const SIGN_LORDS: Record<string, string> = {
  मेष: "मंगल",
  वृषभ: "शुक्र",
  मिथुन: "बुध",
  कर्क: "चंद्र",
  सिंह: "सूर्य",
  कन्या: "बुध",
  तुला: "शुक्र",
  वृश्चिक: "मंगल",
  धनु: "गुरु",
  मकर: "शनि",
  कुंभ: "शनि",
  मीन: "गुरु",
};

const EXALTATION: Record<string, string> = {
  सूर्य: "मेष",
  चंद्र: "वृषभ",
  मंगल: "मकर",
  बुध: "कन्या",
  गुरु: "कर्क",
  शुक्र: "मीन",
  शनि: "तुला",
};

const DEBILITATION: Record<string, string> = {
  सूर्य: "तुला",
  चंद्र: "वृश्चिक",
  मंगल: "कर्क",
  बुध: "मीन",
  गुरु: "मकर",
  शुक्र: "कन्या",
  शनि: "मेष",
};

const OWN_SIGNS: Record<string, string[]> = {
  सूर्य: ["सिंह"],
  चंद्र: ["कर्क"],
  मंगल: ["मेष", "वृश्चिक"],
  बुध: ["मिथुन", "कन्या"],
  गुरु: ["धनु", "मीन"],
  शुक्र: ["वृषभ", "तुला"],
  शनि: ["मकर", "कुंभ"],
};

const BENEFICS = new Set(["गुरु", "शुक्र", "बुध", "चंद्र"]);
const MALEFICS = new Set(["शनि", "मंगल", "राहु", "केतु", "सूर्य"]);

const HOUSE_LABELS_HI = [
  "तनु / व्यक्तित्व",
  "धन / वाणी / परिवार",
  "सहज / पराक्रम / सहोदर",
  "सुख / माता / भूमि",
  "सुत / विद्या / बुद्धि",
  "रिपु / रोग / ऋण",
  "जाया / विवाह / साझेदारी",
  "आयु / गूढ़ / आकस्मिक",
  "धर्म / भाग्य / पिता",
  "कर्म / यश / आजीविका",
  "लाभ / मित्र / आय",
  "व्यय / विदेश / मोक्ष",
];

const HOUSE_LABELS_EN = [
  "Tanu / Self & Personality",
  "Dhana / Wealth, Speech & Family",
  "Sahaja / Courage & Siblings",
  "Sukha / Home, Mother & Property",
  "Suta / Education, Intellect & Progeny",
  "Ripu / Service, Health & Debts",
  "Jaya / Marriage & Partnerships",
  "Ayur / Longevity, Research & Sudden Events",
  "Dharma / Fortune, Father & Wisdom",
  "Karma / Career, Fame & Authority",
  "Labha / Gains, Friends & Income",
  "Vyaya / Expenses, Foreign Lands & Moksha",
];

const HOUSE_LABELS_GU = [
  "તનુ / વ્યક્તિત્વ અને સ્વાસ્થ્ય",
  "ધન / વાણી અને પરિવાર",
  "સહજ / પરાક્રમ અને ભાઈ-બહેન",
  "સુખ / માતા અને ભૂમિ-વાહન",
  "સુત / વિદ્યા, બુદ્ધિ અને સંતાન",
  "રિપુ / રોગ, શત્રુ અને ઋણ",
  "જાયા / લગ્ન અને ભાગીદારી",
  "આયુ / ગૂઢ જ્ઞાન અને આકસ્મિક ઘટના",
  "ધર્મ / ભાગ્ય, પિતા અને ઉચ્ચ શિક્ષણ",
  "કર્મ / યશ, પદ અને આજીવિકા",
  "લાભ / મિત્રો અને આવક",
  "વ્યય / વિદેશ, ખર્ચ અને મોક્ષ",
];

const HOUSE_DASHA_HI: Record<number, string> = {
  1: "स्वास्थ्य, आत्मविश्वास और व्यक्तिगत छवि पर बल",
  2: "धन-संचय, वाणी और पारिवारिक जिम्मेदारियाँ",
  3: "साहस, छोटे उद्यम, संचार और अल्पकालिक यात्रा",
  4: "गृह-सुख, माता, वाहन और अचल संपत्ति",
  5: "शिक्षा, संतान, सट्टा और रचनात्मक बुद्धि",
  6: "सेवा, प्रतिस्पर्धा, ऋण-रोग तथा शत्रु पर विजय का प्रयास",
  7: "विवाह, साझेदारी और सार्वजनिक संबंध",
  8: "रूपांतरण, गूढ़ ज्ञान, बीमा/विरासत और आकस्मिक घटनाएँ",
  9: "भाग्य, धर्म, उच्च शिक्षा, गुरु और दीर्घ यात्रा",
  10: "कर्मक्षेत्र, पद, यश और प्रशासनिक जिम्मेदारी",
  11: "लाभ, मित्र-मण्डल, नेटवर्क और मनोकामना पूर्ति",
  12: "व्यय, विदेश, एकांत साधना और मोक्ष-मार्ग",
};

const HOUSE_DASHA_EN: Record<number, string> = {
  1: "focus on health, confidence, and personal identity",
  2: "wealth accumulation, speech, and family responsibilities",
  3: "courage, initiative, communication, and short journeys",
  4: "domestic happiness, mother, vehicles, and real estate",
  5: "education, progeny, investments, and creative intellect",
  6: "service, competition, debts/health management, and overcoming rivals",
  7: "marriage, partnerships, and public relations",
  8: "transformation, occult research, inheritance, and sudden shifts",
  9: "fortune, dharma, higher education, mentors, and long travels",
  10: "career achievements, rank, fame, and leadership duties",
  11: "financial gains, friendships, networks, and fulfillment of desires",
  12: "expenses, foreign connections, solitude, and spiritual liberation",
};

const HOUSE_DASHA_GU: Record<number, string> = {
  1: "સ્વાસ્થ્ય, આત્મવિશ્વાસ અને વ્યક્તિગત છબી પર ભાર",
  2: "ધન-સંચય, વાણી અને પારિવારિક જવાબદારીઓ",
  3: "સાહસ, નાના ઉદ્યમ, સંચાર અને ટૂંકી મુસાફરી",
  4: "ગૃહ-સુખ, માતા, વાહન અને સ્થાવર મિલકત",
  5: "શિક્ષણ, સંતાન, રોકાણ અને રચનાત્મક બુદ્ધિ",
  6: "સેવા, સ્પર્ધા, ઋણ-રોગ અને શત્રુ પર વિજયનો પ્રયાસ",
  7: "લગ્ન, ભાગીદારી અને જાહેર સંબંધો",
  8: "પરિવર્તન, ગૂઢ જ્ઞાન, વારસો અને આકસ્મિક ઘટનાઓ",
  9: "ભાગ્ય, ધર્મ, ઉચ્ચ શિક્ષણ, ગુરુકૃપા અને લાંબી યાત્રા",
  10: "કર્મક્ષેત્ર, પદ, યશ અને વહીવટી જવાબદારી",
  11: "લાભ, મિત્ર-મંડળ, નેટવર્ક અને મનોકામના પૂર્તિ",
  12: "ખર્ચ, વિદેશ, એકાંત સાધના અને મોક્ષ-માર્ગ",
};

function getHouseLabels(c: string) {
  return c === "en" ? HOUSE_LABELS_EN : c === "gu" ? HOUSE_LABELS_GU : HOUSE_LABELS_HI;
}

function getHouseDasha(c: string) {
  return c === "en" ? HOUSE_DASHA_EN : c === "gu" ? HOUSE_DASHA_GU : HOUSE_DASHA_HI;
}

export interface HouseInfo {
  house: number;
  sign: string;
  lord: string;
  lordHouse: number;
  occupants: string[];
}

export interface LifeAreaPrediction {
  id: string;
  title: string;
  finding: string;
  why: string;
  timing: string;
  strength: string;
  strengthKey?: "high" | "medium" | "caution";
  caution: string;
  remedy: string;
}

export interface ChartAnalysis {
  houses: HouseInfo[];
  yogas: string[];
  doshas: string[];
  dignityOf: Record<string, string>;
  areas: LifeAreaPrediction[];
  housePhala: string[];
  dashaNarrative: string;
  yearPhala: string[];
  summaryLines: string[];
  antarPhala: (maha: string, antar: string) => string;
}

function byPlanet(k: KundaliData): Record<string, PlanetPosition> {
  const map: Record<string, PlanetPosition> = {};
  for (const p of k.planets) map[p.planet] = p;
  return map;
}

type DignityKey = "exalted" | "debilitated" | "own" | "normal";

function dignityKey(p: PlanetPosition): DignityKey {
  if (EXALTATION[p.planet] === p.rashi) return "exalted";
  if (DEBILITATION[p.planet] === p.rashi) return "debilitated";
  if (OWN_SIGNS[p.planet]?.includes(p.rashi)) return "own";
  return "normal";
}

function dignityLabel(key: DignityKey, c: string): string {
  if (c === "en") {
    return key === "exalted" ? "Exalted" : key === "debilitated" ? "Debilitated" : key === "own" ? "Own Sign" : "Normal";
  }
  if (c === "gu") {
    return key === "exalted" ? "ઉચ્ચ" : key === "debilitated" ? "નીચ" : key === "own" ? "સ્વક્ષેત્ર" : "સામાન્ય";
  }
  return key === "exalted" ? "उच्च" : key === "debilitated" ? "नीच" : key === "own" ? "स्वक्षेत्र" : "सामान्य";
}

function kendra(h: number) {
  return [1, 4, 7, 10].includes(h);
}
function trikona(h: number) {
  return [1, 5, 9].includes(h);
}
function upachaya(h: number) {
  return [3, 6, 10, 11].includes(h);
}
function dusthana(h: number) {
  return [6, 8, 12].includes(h);
}

function houseOfSign(lagnaIdx: number, sign: string): number {
  const si = RASHIS.indexOf(sign);
  if (si < 0) return 1;
  return ((si - lagnaIdx + 12) % 12) + 1;
}

function buildHouses(k: KundaliData, map: Record<string, PlanetPosition>): HouseInfo[] {
  const lagnaIdx = (k.lagnaRashiNumber - 1 + 12) % 12;
  const occ: Record<number, string[]> = {};
  for (let i = 1; i <= 12; i++) occ[i] = [];
  for (const p of k.planets) occ[p.house]?.push(p.planet);

  return Array.from({ length: 12 }, (_, i) => {
    const house = i + 1;
    const sign = RASHIS[(lagnaIdx + i) % 12];
    const lord = SIGN_LORDS[sign];
    const lordPos = map[lord];
    return {
      house,
      sign,
      lord,
      lordHouse: lordPos?.house ?? house,
      occupants: occ[house] || [],
    };
  });
}

function detectYogas(k: KundaliData, map: Record<string, PlanetPosition>, houses: HouseInfo[], c: string): string[] {
  const pick = (en: string, gu: string, hi: string) => (c === "en" ? en : c === "gu" ? gu : hi);
  const out: string[] = [];
  const sun = map["सूर्य"];
  const moon = map["चंद्र"];
  const mer = map["बुध"];
  const jup = map["गुरु"];
  const mar = map["मंगल"];
  const ven = map["शुक्र"];
  const sat = map["शनि"];

  if (sun && mer && sun.house === mer.house) {
    const sr = trRashi(sun.rashi, c);
    out.push(pick(
      `Budhaditya Yoga — Sun and Mercury conjoin in House ${sun.house} (${sr}); grants sharp intellect, eloquence, and administrative skill.`,
      `બુધાદિત્ય યોગ — સૂર્ય અને બુધ ${sr} રાશિના ${sun.house}મા ભાવમાં યુતિ; બુદ્ધિ, વાણી અને વહીવટી ક્ષમતા પ્રબળ.`,
      `बुधादित्य योग — सूर्य व बुध ${sun.rashi} राशि के ${sun.house} भाव में युति; बुद्धि, वाणी और प्रशासनिक क्षमता प्रबल।`
    ));
  }
  if (jup && moon) {
    const dist = ((jup.house - moon.house + 12) % 12) + 1;
    if ([1, 4, 7, 10].includes(dist) || jup.house === moon.house) {
      out.push(pick(
        `Gajakesari Yoga — Jupiter (${trRashi(jup.rashi, c)}, H${jup.house}) is in Kendra from Moon (${trRashi(moon.rashi, c)}, H${moon.house}); bestows fame, wisdom, and lasting honor.`,
        `ગજકેસરી યોગ — ગુરુ (${trRashi(jup.rashi, c)}, ભાવ ${jup.house}) ચંદ્ર (${trRashi(moon.rashi, c)}, ભાવ ${moon.house})થી કેન્દ્રમાં; યશ, નીતિ અને સ્થિર પ્રતિષ્ઠા.`,
        `गजकेसरी योग — गुरु (${jup.rashi}, भाव ${jup.house}) चंद्र (${moon.rashi}, भाव ${moon.house}) से केंद्र में; यश, नीति और स्थिर प्रतिष्ठा।`
      ));
    }
  }
  if (moon && mar && moon.house === mar.house) {
    out.push(pick(
      `Chandra-Mangala Yoga — Moon and Mars conjoin in House ${moon.house}; favors enterprise, property, and bold financial gains.`,
      `ચંદ્ર-મંગળ યોગ — ચંદ્ર-મંગળ યુતિ ભાવ ${moon.house}માં; ઉદ્યમ, સંપત્તિ અને સાહસિક ધન-લાભનો યોગ.`,
      `चंद्र-मंगल योग — चंद्र-मंगल युति भाव ${moon.house} में; उद्यम, संपत्ति और साहसिक धन-लाभ का योग।`
    ));
  }

  const l1 = houses[0];
  const l5 = houses[4];
  const l9 = houses[8];
  const l10 = houses[9];
  if (l1.lordHouse === l5.house || l1.lord === l5.lord) {
    out.push(pick(
      `Lagna-5th Lord Raja Yoga — indicates learning, progeny happiness, and natural leadership.`,
      `લગ્નેશ-પંચમેશ સંબંધ — રાજયોગ સંકેત; વિદ્યા, સંતાન-સુખ અને નેતૃત્વ.`,
      `लग्नेश-पंचमेश संबंध — राजयोग संकेत; विद्या, संतान-सुख और नेतृत्व।`
    ));
  }
  if (l1.lordHouse === l9.house || map[l1.lord]?.house === l9.house) {
    out.push(pick(
      `Lagna-9th Lord Dharma-Raja Yoga — blesses fortune, divine grace, and long auspicious journeys.`,
      `લગ્નેશ-નવમેશ સંબંધ — ધર્મ-રાજયોગ; ભાગ્ય, ગુરુકૃપા અને લાંબી યાત્રા.`,
      `लग्नेश-नवमेश संबंध — धर्म-राजयोग; भाग्य, गुरुकृपा और दीर्घ यात्रा।`
    ));
  }
  if (l9.lordHouse === l10.house || map[l9.lord]?.house === l10.house) {
    out.push(pick(
      `Dharma-Karmadhipati Yoga — 9th and 10th lords connect; brings respected rise in profession.`,
      `ધર્મ-કર્માધિપતિ યોગ — નવમેશ-દશમેશ સંબંધ; કર્મક્ષેત્રમાં સન્માનિત ઉન્નતિ.`,
      `धर्म-कर्माधिपति योग — नवमेश-दशमेश संबंध; कर्मक्षेत्र में सम्मानित उन्नति।`
    ));
  }
  if (ven && kendra(ven.house)) {
    const vd = dignityKey(ven);
    if (vd === "exalted" || vd === "own") {
      out.push(pick(
        `Malavya Yoga Indication — Venus in Kendra (${dignityLabel(vd, c)}); grants refinement, arts, and comforts.`,
        `માલવ્ય યોગ સંકેત — શુક્ર કેન્દ્રમાં ${dignityLabel(vd, c)}; સૌંદર્ય, કલા અને સુખ-સાધન.`,
        `मालव्य योग संकेत — शुक्र केंद्र में ${dignityLabel(vd, c)}; सौंदर्य, कला और सुख-साधन।`
      ));
    }
  }
  if (jup && kendra(jup.house)) {
    const jd = dignityKey(jup);
    if (jd === "exalted" || jd === "own") {
      out.push(pick(
        `Hamsa Yoga Indication — Jupiter in Kendra (${dignityLabel(jd, c)}); grants righteousness, counsel, and honor.`,
        `હંસ યોગ સંકેત — ગુરુ કેન્દ્રમાં ${dignityLabel(jd, c)}; ધર્મ, નીતિ અને ગુરુ-પદ.`,
        `हंस योग संकेत — गुरु केंद्र में ${dignityLabel(jd, c)}; धर्म, नीति और गुरु-पद।`
      ));
    }
  }
  if (sat && kendra(sat.house)) {
    const sd = dignityKey(sat);
    if (sd === "exalted" || sd === "own") {
      out.push(pick(
        `Shasha Yoga Indication — Saturn in Kendra (${dignityLabel(sd, c)}); grants patience, organization, and enduring authority.`,
        `શશ યોગ સંકેત — શનિ કેન્દ્રમાં ${dignityLabel(sd, c)}; ધીરજ, સંગઠન અને દીર્ઘકાલીન અધિકાર.`,
        `शश योग संकेत — शनि केंद्र में ${dignityLabel(sd, c)}; धीरज, संगठन और दीर्घकालिक अधिकार।`
      ));
    }
  }
  if (sun && kendra(sun.house)) {
    const sud = dignityKey(sun);
    if (sud === "exalted" || sud === "own") {
      out.push(pick(
        `Ruchaka / Surya-Bala — Sun in Kendra (${dignityLabel(sud, c)}); grants inner radiance and leadership.`,
        `રુચક/સૂર્ય-બળ — સૂર્ય કેન્દ્રમાં ${dignityLabel(sud, c)}; આત્મતેજ અને નેતૃત્વ.`,
        `रुचक/सूर्य-बल — सूर्य केंद्र में ${dignityLabel(sud, c)}; आत्मतेज और नेतृत्व।`
      ));
    }
  }

  const d6 = houses[5];
  const d8 = houses[7];
  const d12 = houses[11];
  if ([6, 8, 12].includes(d6.lordHouse) || [6, 8, 12].includes(d8.lordHouse) || [6, 8, 12].includes(d12.lordHouse)) {
    out.push(pick(
      `Vipareeta Raja Yoga Indication — 6th/8th/12th lords in Dusthana; unexpected rise emerges through overcoming obstacles.`,
      `વિપરીત રાજયોગ સંકેત — 6/8/12ના સ્વામી દુઃસ્થાનમાં; અવરોધોમાંથી અણધાર્યો ઉત્થાન સંભવ.`,
      `विपरीत राजयोग संकेत — 6/8/12 के स्वामी दुःस्थान में; बाधाओं से अप्रत्याशित उत्थान संभव।`
    ));
  }

  if (out.length === 0) {
    out.push(pick(
      "Classical Raja Yogas are at a balanced baseline — personal effort and Dasha timing will be decisive.",
      "આ કુંડળીમાં શાસ્ત્રીય રાજયોગ સામાન્ય સ્તર પર છે — પુરુષાર્થ અને દશા-સમય નિર્ણાયક રહેશે.",
      "इस कुंडली में शास्त्रीय राजयोग सामान्य स्तर पर हैं — पुरुषार्थ और दशा-समय निर्णायक रहेंगे।"
    ));
  }
  return out;
}

function detectDoshas(k: KundaliData, map: Record<string, PlanetPosition>, c: string): string[] {
  const pick = (en: string, gu: string, hi: string) => (c === "en" ? en : c === "gu" ? gu : hi);
  const out: string[] = [];
  const mars = map["मंगल"];
  const moon = map["चंद्र"];
  if (mars && [1, 4, 7, 8, 12].includes(mars.house)) {
    out.push(pick(
      `Kuja (Manglik) Dosha Indication — Mars in House ${mars.house} (${trRashi(mars.rashi, c)}). Proper chart matching or Shanti is advised before marriage.`,
      `કુજ (માંગલિક) દોષ સંકેત — મંગળ ${trRashi(mars.rashi, c)} રાશિના ${mars.house}મા ભાવમાં. લગ્ન-મિલાપમાં શાંતિ/યોગ્ય મિલાપ આવશ્યક.`,
      `कुज दोष संकेत — मंगल ${mars.rashi} राशि के ${mars.house} भाव में। विवाह-मिलान में शांति/उचित मिलान आवश्यक।`
    ));
  } else {
    out.push(pick(
      "No major Kuja (Manglik) Dosha indication found.",
      "કુજ દોષનો સામાન્ય સંકેત મળ્યો નથી.",
      "कुज दोष का सामान्य संकेत नहीं मिला।"
    ));
  }

  const rahu = map["राहु"];
  const ketu = map["केतु"];
  if (rahu && ketu) {
    const others = k.planets.filter((p) => p.planet !== "राहु" && p.planet !== "केतु");
    const rahuDeg = rahu.degree;
    const ketuDeg = ketu.degree;
    const span = ((ketuDeg - rahuDeg) % 360 + 360) % 360;
    const side = others.map((p) => {
      const v = ((p.degree - rahuDeg) % 360 + 360) % 360;
      return v <= span;
    });
    if (side.every(Boolean) || side.every((x) => !x)) {
      out.push(pick(
        "Kaal Sarp Yoga Indication — all seven planets lie on one side of the Rahu-Ketu axis. Patience, Shiva worship, and Dasha review help.",
        "કાલસર્પ યોગ સંકેત — સાત ગ્રહો રાહુ-કેતુ અક્ષની એક બાજુએ. ધૈર્ય, શિવ-સાધના અને દશા-વિચાર આવશ્યક.",
        "कालसर्प योग संकेत — सात ग्रह राहु-केतु अक्ष के एक ओर। धैर्य, शिव-साधना और दशा-विचार आवश्यक।"
      ));
    } else {
      out.push(pick(
        "No Kaal Sarp Yoga indication found.",
        "કાલસર્પ યોગનો સામાન્ય સંકેત મળ્યો નથી.",
        "कालसर्प योग का सामान्य संकेत नहीं मिला।"
      ));
    }
  }

  if (moon) {
    const h2 = (moon.house % 12) + 1;
    const h12 = ((moon.house - 2 + 12) % 12) + 1;
    const has2 = k.planets.some((p) => p.planet !== "चंद्र" && p.house === h2);
    const has12 = k.planets.some((p) => p.planet !== "चंद्र" && p.house === h12);
    if (!has2 && !has12) {
      out.push(pick(
        "Kemadruma Yoga Indication — Houses 2 and 12 from Moon are vacant, causing occasional mental solitude; mitigated by Jupiter/Kendra strength.",
        "કેમદ્રુમ યોગ સંકેત — ચંદ્રના 2-12 ભાવ ખાલી. માનસિક એકાકીપણું; ગુરુ/કેન્દ્ર સંબંધથી શમન.",
        "केमद्रुम योग संकेत — चंद्र के 2-12 भाव रिक्त। मानसिक एकाकीपन; गुरु/केन्द्र संबंध से शमन।"
      ));
    }
  }

  const sun = map["सूर्य"];
  if (sun) {
    const combust = k.planets.filter((p) => {
      if (p.planet === "सूर्य" || p.planet === "राहु" || p.planet === "केतु") return false;
      const d = Math.min(Math.abs(p.degree - sun.degree), 360 - Math.abs(p.degree - sun.degree));
      const limit = p.planet === "चंद्र" ? 12 : p.planet === "बुध" ? 14 : 10;
      return d < limit;
    });
    if (combust.length) {
      const names = combust.map((p) => trPlanet(p.planet, c)).join(", ");
      out.push(pick(
        `Combust (Asta) — ${names} close to the Sun; external expression softens while inner strength persists.`,
        `અસ્ત વિચાર — ${names} સૂર્યના સાંનિધ્યમાં; બાહ્ય ફળ ક્ષીણ, આંતરિક તેજ શેષ.`,
        `अस्त विचार — ${names} सूर्य के सान्निध्य में; बाह्य फल क्षीण, आंतरिक तेज शेष।`
      ));
    }
  }

  const angD = (d1: number, d2: number) => {
    const diff = Math.abs(d1 - d2) % 360;
    return diff > 180 ? 360 - diff : diff;
  };
  const sunP = map["सूर्य"];
  const moonP = map["चंद्र"];
  const rahuP = map["राहु"];
  const ketuP = map["केतु"];

  if (sunP && rahuP && (sunP.rashi === rahuP.rashi || sunP.house === rahuP.house || angD(sunP.degree, rahuP.degree) <= 15.0)) {
    out.unshift(pick(
      `Surya-Rahu Grahan Yoga — Sun & Rahu conjoin in ${trRashi(sunP.rashi, c)} (H${sunP.house}). Mahamrityunjaya Japa & Aditya Hridayam safeguard confidence and father's well-being.`,
      `સૂર્ય-રાહુ ગ્રહણ યોગ સંકેત — ${trRashi(sunP.rashi, c)} રાશિ (${sunP.house}મા ભાવ)માં સૂર્ય અને રાહુની યુતિ. આત્મબળ, પિતા અને પ્રતિષ્ઠા રક્ષણ માટે મહામૃત્યુંજય જપ અને આદિત્યહૃદય પાઠ વિહિત.`,
      `सूर्य-राहु ग्रहण योग संकेत — ${sunP.rashi} राशि (${sunP.house}वें भाव) में सूर्य और राहु की युति। आत्मबल, पिता व प्रतिष्ठा संरक्षण हेतु महामृत्युंजय जप व आदित्यहृदय पाठ विहित।`
    ));
  } else if (sunP && ketuP && (sunP.rashi === ketuP.rashi || sunP.house === ketuP.house || angD(sunP.degree, ketuP.degree) <= 15.0)) {
    out.unshift(pick(
      `Surya-Ketu Grahan Yoga — Sun & Ketu conjoin in ${trRashi(sunP.rashi, c)} (H${sunP.house}). Surya Arghya pacifies self-doubt and career obstacles.`,
      `સૂર્ય-કેતુ ગ્રહણ યોગ સંકેત — ${trRashi(sunP.rashi, c)} રાશિ (${sunP.house}મા ભાવ)માં સૂર્ય અને કેતુની યુતિ. આત્મ-સંશય અને આજીવિકા અવરોધ શમન માટે સૂર્ય ઉપાસના આવશ્યક.`,
      `सूर्य-केतु ग्रहण योग संकेत — ${sunP.rashi} राशि (${sunP.house}वें भाव) में सूर्य और केतु की युति। आत्म-संशय व आजीविका अवरोध शमन हेतु सूर्य उपासना आवश्यक।`
    ));
  }

  if (moonP && rahuP && (moonP.rashi === rahuP.rashi || moonP.house === rahuP.house || angD(moonP.degree, rahuP.degree) <= 15.0)) {
    out.unshift(pick(
      `Chandra-Rahu Grahan Yoga — Moon & Rahu conjoin in ${trRashi(moonP.rashi, c)} (H${moonP.house}). Shiva Rudrabhishek calms mental stress and restlessness.`,
      `ચંદ્ર-રાહુ ગ્રહણ યોગ (કપાલિકા દોષ) સંકેત — ${trRashi(moonP.rashi, c)} રાશિ (${moonP.house}મા ભાવ)માં ચંદ્ર અને રાહુની યુતિ. માનસિક તણાવ અને ભય શમન માટે એકાદશવાર રુદ્રાભિષેક અને શિવ-સાધના શ્રેયસ્કર.`,
      `चंद्र-राहु ग्रहण योग (कपालिका दोष) संकेत — ${moonP.rashi} राशि (${moonP.house}वें भाव) में चंद्रमा और राहु की युति। मानसिक तनाव, अनिद्रा व भय शमन हेतु एकादशवार रुद्राभिषेक व शिव-साधना श्रेयस्कर।`
    ));
  } else if (moonP && ketuP && (moonP.rashi === ketuP.rashi || moonP.house === ketuP.house || angD(moonP.degree, ketuP.degree) <= 15.0)) {
    out.unshift(pick(
      `Chandra-Ketu Grahan Yoga — Moon & Ketu conjoin in ${trRashi(moonP.rashi, c)} (H${moonP.house}). Shiva worship brings emotional clarity and peace.`,
      `ચંદ્ર-કેતુ ગ્રહણ યોગ સંકેત — ${trRashi(moonP.rashi, c)} રાશિ (${moonP.house}મા ભાવ)માં ચંદ્ર અને કેતુની યુતિ. માનસિક વિષાદ નિવારણ માટે શિવ રુદ્રાભિષેક વિહિત.`,
      `चंद्र-केतु ग्रहण योग संकेत — ${moonP.rashi} राशि (${moonP.house}वें भाव) में चंद्रमा और केतु की युति। मानसिक विषाद व वैराग्य-भ्रम निवारण हेतु शिव रुद्राभिषेक विहित।`
    ));
  }

  return out;
}

function strengthFrom(
  house: number,
  lordHouse: number,
  occupants: string[],
  lordDig: DignityKey,
  c: string
): { key: "high" | "medium" | "caution"; label: string } {
  let score = 0;
  if (trikona(lordHouse) || kendra(lordHouse)) score += 2;
  if (dusthana(lordHouse)) score -= 1;
  if (lordDig === "exalted" || lordDig === "own") score += 2;
  if (lordDig === "debilitated") score -= 2;
  if (occupants.some((p) => BENEFICS.has(p))) score += 1;
  if (occupants.some((p) => MALEFICS.has(p)) && !upachaya(house)) score -= 1;

  if (score >= 3) {
    return {
      key: "high",
      label: c === "en" ? "High" : c === "gu" ? "ઉચ્ચ" : "उच्च",
    };
  }
  if (score <= 0) {
    return {
      key: "caution",
      label: c === "en" ? "Caution" : c === "gu" ? "સાવચેતી" : "सावधानी",
    };
  }
  return {
    key: "medium",
    label: c === "en" ? "Moderate" : c === "gu" ? "મધ્યમ" : "मध्यम",
  };
}

function fmtDate(d: Date, c: string = "hi") {
  const locale = c === "en" ? "en-IN" : c === "gu" ? "gu-IN" : "hi-IN";
  return d.toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" });
}

function currentDashaWindow(k: KundaliData) {
  const now = new Date();
  const maha = k.dashaPeriods.find((d) => now >= d.startDate && now < d.endDate) || k.dashaPeriods[0];
  const antar =
    k.antarPeriods.find((a) => a.maha === maha?.planet && now >= a.startDate && now < a.endDate) ||
    k.antarPeriods.find((a) => a.maha === maha?.planet) ||
    k.antarPeriods[0];
  return { maha, antar };
}

function housePhalaLine(h: HouseInfo, map: Record<string, PlanetPosition>, c: string): string {
  const labels = getHouseLabels(c);
  const occNames = h.occupants.map((p) => trPlanet(p, c)).join(", ");
  const lord = map[h.lord];
  const digKey = lord ? dignityKey(lord) : "normal";
  const dig = dignityLabel(digKey, c);
  const lordHouseNum =
    lord && typeof lord.house === "number" && !Number.isNaN(lord.house) && lord.house > 0
      ? lord.house
      : h.lordHouse > 0
        ? h.lordHouse
        : 1;

  if (c === "en") {
    const occ = h.occupants.length ? `Occupants: ${occNames}` : "House vacant (judged via lord)";
    const lordNote = lord
      ? `Lord ${trPlanet(h.lord, c)} in ${trRashi(lord.rashi, c)} (House ${lordHouseNum}, ${dig})`
      : `Lord ${trPlanet(h.lord, c)}`;
    const tone =
      kendra(h.lordHouse) || trikona(h.lordHouse)
        ? "Strong auspicious results"
        : dusthana(h.lordHouse)
          ? "Caution and steady effort advised"
          : "Mixed outcomes";
    return `House ${h.house} (${labels[h.house - 1]}) — Sign ${trRashi(h.sign, c)}. ${lordNote}. ${occ}. Verdict: ${tone}.`;
  }

  if (c === "gu") {
    const occ = h.occupants.length ? `સ્થિત ગ્રહ: ${occNames}` : "ભાવ ખાલી (ભાવેશ પરથી ફળ)";
    const lordNote = lord
      ? `ભાવેશ ${trPlanet(h.lord, c)} ${trRashi(lord.rashi, c)} રાશિના ${lordHouseNum}મા ભાવમાં (${dig})`
      : `ભાવેશ ${trPlanet(h.lord, c)}`;
    const tone =
      kendra(h.lordHouse) || trikona(h.lordHouse)
        ? "શુભ ફળ પ્રબળ"
        : dusthana(h.lordHouse)
          ? "સાવચેતી અને પરિશ્રમ અપેક્ષિત"
          : "મિશ્રિત ફળ";
    return `ભાવ ${h.house} (${labels[h.house - 1]}) — રાશિ ${trRashi(h.sign, c)}. ${lordNote}. ${occ}. નિષ્કર્ષ: ${tone}.`;
  }

  const occ = h.occupants.length ? `स्थित ग्रह: ${h.occupants.join(", ")}` : "भाव रिक्त (भावेश से फल)";
  const lordNote = lord
    ? `भावेश ${h.lord} ${lord.rashi} राशि के ${lordHouseNum}वें भाव में (${dig})`
    : `भावेश ${h.lord}`;
  const tone =
    kendra(h.lordHouse) || trikona(h.lordHouse)
      ? "शुभ फल प्रबल"
      : dusthana(h.lordHouse)
        ? "सावधानी व परिश्रम अपेक्षित"
        : "मिश्रित फल";
  return `भाव ${h.house} (${labels[h.house - 1]}) — राशि ${h.sign}। ${lordNote}। ${occ}। निष्कर्ष: ${tone}।`;
}

function antarLine(k: KundaliData, maha: string, antar: string, c: string): string {
  const map = byPlanet(k);
  const mp = map[maha];
  const ap = map[antar];
  const mh = mp?.house ?? 10;
  const ah = ap?.house ?? 1;
  const md = dignityLabel(mp ? dignityKey(mp) : "normal", c);
  const ad = dignityLabel(ap ? dignityKey(ap) : "normal", c);
  const dashaThemes = getHouseDasha(c);
  const theme = dashaThemes[ah] || dashaThemes[mh];

  if (c === "en") {
    const mix =
      BENEFICS.has(antar) && (kendra(ah) || trikona(ah))
        ? "Favorable progress"
        : MALEFICS.has(antar) && dusthana(ah)
          ? "Delays / Testing phase"
          : "Balanced outcomes";
    return `${trPlanet(maha, c)}–${trPlanet(antar, c)}: ${trPlanet(antar, c)} in H${ah} (${ad}), ${trPlanet(maha, c)} in H${mh} (${md}) — ${theme}; ${mix}.`;
  }

  if (c === "gu") {
    const mix =
      BENEFICS.has(antar) && (kendra(ah) || trikona(ah))
        ? "અનુકૂળ પ્રગતિ"
        : MALEFICS.has(antar) && dusthana(ah)
          ? "વિલંબ / કસોટી"
          : "મિશ્રિત પરિણામ";
    return `${trPlanet(maha, c)}–${trPlanet(antar, c)}: ${trPlanet(antar, c)} ભાવ ${ah} (${ad}), ${trPlanet(maha, c)} ભાવ ${mh} (${md}) — ${theme}; ${mix}.`;
  }

  const mix =
    BENEFICS.has(antar) && (kendra(ah) || trikona(ah))
      ? "अनुकूल प्रगति"
      : MALEFICS.has(antar) && dusthana(ah)
        ? "विलंब/परीक्षण"
        : "मिश्रित परिणाम";
  return `${maha}–${antar}: ${antar} भाव ${ah} (${ad}), ${maha} भाव ${mh} (${md}) — ${theme}; ${mix}।`;
}

function buildAreas(k: KundaliData, houses: HouseInfo[], map: Record<string, PlanetPosition>, c: string): LifeAreaPrediction[] {
  const pick = (en: string, gu: string, hi: string) => (c === "en" ? en : c === "gu" ? gu : hi);
  const { maha, antar } = currentDashaWindow(k);
  const timing =
    maha && antar
      ? pick(
          `Current ${trPlanet(k.mahadasha, c)} Mahadasha / ${trPlanet(k.antardasha, c)} Antardasha (${fmtDate(antar.startDate, c)}–${fmtDate(antar.endDate, c)})`,
          `વર્તમાન ${trPlanet(k.mahadasha, c)} મહાદશા / ${trPlanet(k.antardasha, c)} અંતર્દશા (${fmtDate(antar.startDate, c)}–${fmtDate(antar.endDate, c)})`,
          `वर्तमान ${k.mahadasha} महादशा / ${k.antardasha} अंतर्दशा (${fmtDate(antar.startDate, c)}–${fmtDate(antar.endDate, c)})`
        )
      : `${trPlanet(k.mahadasha, c)} / ${trPlanet(k.antardasha, c)}`;

  const area = (
    id: string,
    title: string,
    houseNums: number[],
    findingExtra: string,
    caution: string,
    remedy: string,
  ): LifeAreaPrediction => {
    const hs = houseNums.map((n) => houses[n - 1]);
    const primary = hs[0];
    const lord = map[primary.lord];
    const digKey = lord ? dignityKey(lord) : "normal";
    const occ = hs.flatMap((h) =>
      h.occupants.map((p) =>
        pick(`${trPlanet(p, c)} (H${h.house})`, `${trPlanet(p, c)} (ભાવ ${h.house})`, `${p} (भाव ${h.house})`)
      )
    );
    const why = pick(
      `${hs.map((h) => `H${h.house} ${trRashi(h.sign, c)}, Lord ${trPlanet(h.lord, c)} in H${h.lordHouse}`).join("; ")}${occ.length ? `; Planets: ${occ.join(", ")}` : ""}.`,
      `${hs.map((h) => `ભાવ ${h.house} ${trRashi(h.sign, c)}, ભાવેશ ${trPlanet(h.lord, c)} ભાવ ${h.lordHouse}માં`).join("; ")}${occ.length ? `; ગ્રહ: ${occ.join(", ")}` : ""}.`,
      `${hs.map((h) => `भाव ${h.house} ${h.sign}, भावेश ${h.lord} भाव ${h.lordHouse} में`).join("; ")}${occ.length ? `; ग्रह: ${occ.join(", ")}` : ""}।`
    );
    const st = strengthFrom(primary.house, primary.lordHouse, primary.occupants, digKey, c);
    const finding =
      st.key === "high"
        ? pick(
            `${findingExtra} — strong indications; make full use of upcoming opportunities.`,
            `${findingExtra} સંકેત પ્રબળ છે — તકોનો સદુપયોગ કરો.`,
            `${findingExtra} संकेत प्रबल हैं — अवसरों का सदुपयोग करें।`
          )
        : st.key === "caution"
          ? pick(
              `${findingExtra} — mixed/challenging indications; steady planning and patience are essential.`,
              `${findingExtra} મિશ્રિત/કઠિન છે — આયોજન અને ધૈર્ય આવશ્યક.`,
              `${findingExtra} मिश्रित/कठिन हैं — योजना और धैर्य आवश्यक।`
            )
          : pick(
              `${findingExtra} — moderate indications; consistent effort brings success.`,
              `${findingExtra} મધ્યમ છે — સતત પુરુષાર્થથી સિદ્ધિ.`,
              `${findingExtra} मध्यम हैं — सतत पुरुषार्थ से सिद्धि।`
            );
    return { id, title, finding, why, timing, strength: st.label, strengthKey: st.key, caution, remedy };
  };

  const l10 = houses[9];
  const careerField =
    l10.lord === "बुध" || l10.occupants.includes("बुध")
      ? pick("Writing, Commerce, IT, Accounting, Communications", "લેખન, વાણિજ્ય, આઈટી, એકાઉન્ટિંગ, સંચાર", "लेखन, वाणिज्य, आईटी, लेखा, संचार")
      : l10.lord === "गुरु" || l10.occupants.includes("गुरु")
        ? pick("Teaching, Law, Advisory, Banking/Finance, Spiritual Service", "શિક્ષણ, કાયદો, પરામર્શ, બેંકિંગ/નાણાં, ધર્મ-સેવા", "शिक्षण, विधि, परामर्श, बैंक/वित्त, धर्म-सेवा")
        : l10.lord === "शुक्र" || l10.occupants.includes("शुक्र")
          ? pick("Arts, Design, Hospitality, Luxury, Media & Aesthetics", "કલા, ડિઝાઇન, આતિથ્ય, વિલાસ, સૌંદર્ય", "कला, डिज़ाइन, आतिथ्य, विलास, सौंदर्य")
          : l10.lord === "मंगल" || l10.occupants.includes("मंगल")
            ? pick("Engineering, Defense/Police, Surgery, Real Estate", "એન્જિનિયરિંગ, સેના/પોલીસ, શસ્ત્રક્રિયા, રિયલ એસ્ટેટ", "अभियांत्रिकी, सेना/पुलिस, शल्य, रियल एस्टेट")
            : l10.lord === "शनि" || l10.occupants.includes("शनि")
              ? pick("Organization, Industry, Compliance, Long-term Projects", "સંગઠન, ઉદ્યોગ, કાયદો-પાલન, દીર્ઘ પરિયોજનાઓ", "संगठन, श्रम, खनन, विधि-पालन, दीर्घ परियोजनाएँ")
              : l10.lord === "सूर्य" || l10.occupants.includes("सूर्य")
                ? pick("Administration, Government, Leadership, Energy", "વહીવટ, સરકાર, નેતૃત્વ, ઊર્જા", "प्रशासन, सरकार, नेतृत्व, ऊर्जा")
                : pick("Service, Management, or Independent Enterprise", "સેવા, મેનેજમેન્ટ અથવા સ્વ-ઉદ્યમ", "सेवा, प्रबंधन अथवा स्व-उद्यम");

  return [
    area(
      "personality",
      pick("Personality & Health", "વ્યક્તિત્વ અને સ્વાસ્થ્ય", "व्यक्तित्व एवं स्वास्थ्य"),
      [1],
      pick(
        `${trRashi(k.lagnaRashi, c)} Ascendant — temperament, aura, and vitality`,
        `${trRashi(k.lagnaRashi, c)} લગ્ન — સ્વભાવ, કાંતિ અને દેહ-બળ`,
        `${k.lagnaRashi} लग्न — स्वभाव, कांति और देह-बल`
      ),
      pick("Avoid overconfidence or lethargy; keep a disciplined daily routine.", "અતિ આત્મવિશ્વાસ કે આળસથી બચો; દિનચર્યા નિયમિત રાખો.", "अति आत्मविश्वास या आलस्य से बचें; दिनचर्या नियमित रखें।"),
      pick("Observe fast on Lagna lord’s weekday, offer Surya Arghya, and follow sattvic diet.", "લગ્નેશના વારે વ્રત, સૂર્યાર્ઘ્ય અને સાત્વિક આહાર.", "लग्नेश के वार को व्रत, सूर्यार्घ्य और सात्विक आहार।")
    ),
    area(
      "career",
      pick("Career & Livelihood", "કારકિર્દી / આજીવિકા", "करियर / आजीविका"),
      [10, 6],
      pick(
        `10th House ${trRashi(l10.sign, c)} — Favorable fields: ${careerField}`,
        `દશમ ભાવ ${trRashi(l10.sign, c)} — અનુકૂળ ક્ષેત્ર: ${careerField}`,
        `दशम भाव ${l10.sign} — अनुकूल क्षेत्र: ${careerField}`
      ),
      pick("Avoid impulsive job or partnership switches during Dasha transitions.", "દશા બદલાતા સમયે નોકરી/ભાગીદારી ઉતાવળે ન બદલો.", "दशा बदलते समय नौकरी/साझेदारी जल्दबाज़ी में न बदलें।"),
      pick("Chant 10th lord mantra, honor mentors, and maintain integrity at work.", "દશમેશના મંત્ર જપ, ગુરુજન સન્માન અને કર્મમાં સત્યનિષ્ઠા.", "दशमेश के मंत्र जप, गुरुजन सम्मान और कर्म में सत्यनिष्ठा।")
    ),
    area(
      "finance",
      pick("Wealth & Finance", "ધન / નાણાં", "धन / वित्त"),
      [2, 11],
      pick("2nd & 11th houses govern reserves, speech, and income streams", "દ્વિતીય-એકાદશથી કોષ, વાણી અને આવક-સ્ત્રોત", "द्वितीय-एकादश से कोष, वाणी और आय-स्रोत"),
      pick("Avoid speculation and undocumented lending.", "સટ્ટાબાજી અને કાગળ વગરની ઉધારીથી બચો.", "सट्टेबाज़ी और बिना कागज़ के ऋण से बचें।"),
      pick("Charity on Fridays/Thursdays, Lakshmi Puja, and strict budgeting.", "શુક્ર/ગુરુ વારે દાન, લક્ષ્મી પૂજન અને બજેટ-અનુશાસન.", "शुक्र/गुरु वार को दान, लक्ष्मी पूजन और बजट-अनुशासन।")
    ),
    area(
      "marriage",
      pick("Marriage & Partnerships", "લગ્ન / દામ્પત્ય", "विवाह / दांपत्य"),
      [7],
      pick("7th house governs spouse, partnerships, and social conduct", "સપ્તમ ભાવથી જીવનસાથી, ભાગીદારી અને લોક-વ્યવહાર", "सप्तम भाव से जीवनसाथी, साझेदारी और लोक-व्यवहार"),
      pick("If Kuja or Nadi Dosha exists, ensure proper matching and pacification.", "કુજ/નાડી દોષ હોય તો મિલાપ અને શાંતિ અવશ્ય કરાવો.", "कुज/नाड़ी दोष होने पर मिलान और शांति अवश्य कराएँ।"),
      pick("Worship Lakshmi-Narayana on Fridays and nurture open couple dialogue.", "શુક્રવારે લક્ષ્મી-નારાયણ પૂજન; દંપતી સંવાદ વધારો.", "शुक्रवार को लक्ष्मी-नारायण पूजन; दंपति संवाद बढ़ाएँ।")
    ),
    area(
      "education",
      pick("Education & Intellect", "શિક્ષણ / બુદ્ધિ", "शिक्षा / बुद्धि"),
      [4, 5],
      pick("4th & 5th houses rule learning, memory, and analytical depth", "ચતુર્થ-પંચમથી વિદ્યા, સ્મૃતિ અને શોધ-ક્ષમતા", "चतुर्थ-पंचम से विद्या, स्मृति और शोध-क्षमता"),
      pick("Reduce late nights if focus wavers.", "એકાગ્રતા ભંગ થાય તો રાત્રિ જાગરણ ઓછું કરો.", "एकाग्रता भंग होने पर रात्रि जागरण कम करें।"),
      pick("Mercury/Jupiter sadhana, Saraswati Vandana, and regular self-study.", "બુધ/ગુરુ સાધના, સરસ્વતી વંદના, નિયમિત સ્વાધ્યાય.", "बुध/गुरु साधना, सरस्वती वंदना, नियमित स्वाध्याय।")
    ),
    area(
      "children",
      pick("Children & Progeny", "સંતાન", "संतान"),
      [5],
      pick("5th house indicates progeny bliss, affection, and Purva Punya", "પંચમ ભાવથી સંતાન-સુખ, પ્રેમ અને પુણ્ય", "पंचम भाव से संतान-सुख, प्रेम और पुण्य"),
      pick("If the 5th lord is weak, consult an astrologer during family planning.", "પંચમેશ દુર્બળ હોય તો સંતાન આયોજનમાં જ્યોતિષ પરામર્શ લો.", "पंचमेश दुर्बल हो तो संतान योजना में ज्योतिष परामर्श लें।"),
      pick("Water a banana tree on Thursdays and donate educational items to children.", "ગુરુવારે કેળાના વૃક્ષને જળ, બાળકોને જ્ઞાન-દાન.", "गुरुवार को केले के वृक्ष को जल, बालकों को ज्ञान-दान।")
    ),
    area(
      "property",
      pick("Land, Vehicles & Home", "ભૂમિ / વાહન / ગૃહ", "भूमि / वाहन / गृह"),
      [4],
      pick("4th house rules mother’s blessings, home comfort, and immovable assets", "ચતુર્થ ભાવથી માતા-સુખ, ઘર અને સ્થાવર મિલકત", "चतुर्थ भाव से माता-सुख, घर और अचल संपत्ति"),
      pick("Never buy property without verifying documents and auspicious Muhurat.", "દસ્તાવેજ અને દિશા-મુહૂર્ત વગર ભૂમિ-ખરીદી ન કરો.", "दस्तावेज़ और दिशा-मुहूर्त बिना भूमि-क्रय न करें।"),
      pick("Maintain Vastu harmony, seek mother’s blessings, donate oil on Saturdays.", "વાસ્તુ શુદ્ધિ, માતાના આશીર્વાદ, શનિવારે તેલ-દાન.", "वास्तु शुद्धि, माता का आशीर्वाद, शनिवार को तेल-दान।")
    ),
    area(
      "foreign",
      pick("Foreign & Travel", "વિદેશ / યાત્રા", "विदेश / यात्रा"),
      [9, 12],
      pick("9th & 12th houses indicate long journeys, overseas stays, and expenses", "નવમ-દ્વાદશથી લાંબી યાત્રા, વિદેશ વાસ અને ખર્ચ", "नवम-द्वादश से दीर्घ यात्रा, विदेश वास और व्यय"),
      pick("Set clear travel budgets when 12th house expenditure rises.", "દ્વાદશ ખર્ચ વધુ હોય તો યાત્રા બજેટ નક્કી રાખો.", "द्वादश व्यय अधिक हो तो यात्रा बजट बाँधें।"),
      pick("9th lord remedies, pilgrimage, and initiating passport work in Shubha Muhurat.", "નવમેશ ઉપાય, તીર્થ અને પાસપોર્ટ-કાર્ય શુભ મુહૂર્તમાં.", "नवमेश उपाय, तीर्थ और पासपोर्ट-कार्य शुभ मुहूर्त में।")
    ),
    area(
      "health",
      pick("Health & Vitality", "સ્વાસ્થ્ય", "स्वास्थ्य"),
      [1, 6, 8],
      pick("1st, 6th & 8th houses reflect immunity, resilience, and longevity", "લગ્ન-ષષ્ઠ-અષ્ટમથી રોગ-ક્ષમતા અને આયુ-બળ", "लग्न-षष्ठ-अष्टम से रोग-क्षमता और आयु-बल"),
      pick("Never delay medical checkups during 6th or 8th lord Dashas.", "ષષ્ઠેશ/અષ્ટમેશ દશામાં સ્વાસ્થ્ય તપાસ ટાળશો નહીં.", "षष्ठेश/अष्टमेश दशा में स्वास्थ्य जाँच न टालें।"),
      pick("Practice Pranayama, Surya Namaskar, and weekday charity for relevant planets.", "પ્રાણાયામ, સૂર્ય નમસ્કાર, સંબંધિત ગ્રહનું દાન-વ્રત.", "प्राणायाम, सूर्य नमस्कार, संबंधित ग्रह का दान-व्रत।")
    ),
  ];
}

function transitNotes(k: KundaliData, c: string): string[] {
  try {
    const now = new Date();
    const transits = calculatePlanetPositions(now, k.latitude, k.longitude, k.timezoneHours || 5.5);
    const lagnaIdx = (k.lagnaRashiNumber - 1 + 12) % 12;
    const dashaThemes = getHouseDasha(c);
    const lines: string[] = [];
    for (const name of ["गुरु", "शनि", "राहु", "मंगल"]) {
      const t = transits.find((p) => p.planet === name);
      if (!t) continue;
      const house = houseOfSign(lagnaIdx, t.rashi);
      if (c === "en") {
        lines.push(`Transit ${trPlanet(name, c)} in ${trRashi(t.rashi, c)} (House ${house} from Lagna${t.isRetrograde ? ", Retrograde" : ""}) — ${dashaThemes[house]}.`);
      } else if (c === "gu") {
        lines.push(`ગોચર ${trPlanet(name, c)} ${trRashi(t.rashi, c)}માં (લગ્નથી ભાવ ${house}${t.isRetrograde ? ", વક્રી" : ""}) — ${dashaThemes[house]}.`);
      } else {
        lines.push(`गोचर ${name} ${t.rashi} में (लग्न से भाव ${house}${t.isRetrograde ? ", वक्री" : ""}) — ${dashaThemes[house]}।`);
      }
    }
    return lines;
  } catch {
    return [];
  }
}

export function analyzeKundali(k: KundaliData, lang: string = "hi"): ChartAnalysis {
  const c = (lang || "hi").slice(0, 2).toLowerCase();
  const map = byPlanet(k);
  const houses = buildHouses(k, map);
  const yogas = detectYogas(k, map, houses, c);
  const doshas = detectDoshas(k, map, c);
  const dignityOf: Record<string, string> = {};
  for (const p of k.planets) dignityOf[p.planet] = dignityLabel(dignityKey(p), c);

  const { maha, antar } = currentDashaWindow(k);
  const mahaP = map[k.mahadasha];
  const antarP = map[k.antardasha];
  const dashaThemes = getHouseDasha(c);

  const mahaHouseNum =
    mahaP && typeof mahaP.house === "number" && !Number.isNaN(mahaP.house) && mahaP.house > 0 ? mahaP.house : 0;
  const antarHouseNum =
    antarP && typeof antarP.house === "number" && !Number.isNaN(antarP.house) && antarP.house > 0 ? antarP.house : 0;

  let dashaNarrative = "";
  if (c === "en") {
    const mahaLoc = mahaP ? `${trRashi(mahaP.rashi, c)} (House ${mahaHouseNum || 1})` : "chart";
    const antarLoc = antarP ? `${trRashi(antarP.rashi, c)} (House ${antarHouseNum || 1})` : "chart";
    const mahaDig = mahaP ? dignityLabel(dignityKey(mahaP), c) : "";
    dashaNarrative = `${k.name} is currently under Vimshottari ${trPlanet(k.mahadasha, c)} Mahadasha (${maha ? fmtDate(maha.startDate, c) : "—"} to ${maha ? fmtDate(maha.endDate, c) : "—"}) and ${trPlanet(k.antardasha, c)} Antardasha. ${trPlanet(k.mahadasha, c)} is placed in ${mahaLoc} (${mahaDig}); ${trPlanet(k.antardasha, c)} is in ${antarLoc}. Theme: ${dashaThemes[mahaP?.house ?? 10]}. Pratyantardasha of ${trPlanet(k.pratyantardasha, c)} shapes immediate timing.`;
  } else if (c === "gu") {
    const mahaHouseStr = mahaHouseNum ? `${mahaHouseNum}મા ` : "";
    const antarHouseStr = antarHouseNum ? `${antarHouseNum}મા ` : "";
    dashaNarrative = `જાતક ${k.name}ની વર્તમાન વિંશોત્તરી ${trPlanet(k.mahadasha, c)} મહાદશા (${maha ? fmtDate(maha.startDate, c) : "—"} થી ${maha ? fmtDate(maha.endDate, c) : "—"}) અને ${trPlanet(k.antardasha, c)} અંતર્દશા ચાલી રહી છે. ${trPlanet(k.mahadasha, c)} જન્મ કુંડળીમાં ${mahaP ? `${trRashi(mahaP.rashi, c)} રાશિના ${mahaHouseStr}ભાવમાં` : "અજ્ઞાત ભાવમાં"} ${mahaP ? dignityLabel(dignityKey(mahaP), c) : ""} છે; ${trPlanet(k.antardasha, c)} ${antarP ? `${trRashi(antarP.rashi, c)} રાશિના ${antarHouseStr}ભાવમાં` : ""}. ફળ: ${dashaThemes[mahaP?.house ?? 10]}. પ્રત્યંતર ${trPlanet(k.pratyantardasha, c)} સૂક્ષ્મ સમયને વળાંક આપે છે.`;
  } else {
    const mahaHouseStr = mahaHouseNum ? `${mahaHouseNum}वें ` : "";
    const antarHouseStr = antarHouseNum ? `${antarHouseNum}वें ` : "";
    dashaNarrative = `जातक ${k.name} की वर्तमान विंशोत्तरी ${k.mahadasha} महादशा (${maha ? fmtDate(maha.startDate, c) : "—"} से ${maha ? fmtDate(maha.endDate, c) : "—"}) तथा ${k.antardasha} अंतर्दशा चल रही है। ${k.mahadasha} जन्म कुंडली में ${mahaP ? `${mahaP.rashi} राशि के ${mahaHouseStr}भाव` : "अज्ञात भाव"} में ${mahaP ? dignityLabel(dignityKey(mahaP), c) : ""} है; ${k.antardasha} ${antarP ? `${antarP.rashi} राशि के ${antarHouseStr}भाव` : ""} में। फल: ${dashaThemes[mahaP?.house ?? 10]}। प्रत्यंतर ${k.pratyantardasha} सूक्ष्म समय को मोड़ देता है।`;
  }

  const trans = transitNotes(k, c);
  const yearPhala = [
    ...trans.slice(0, 3),
    c === "en"
      ? `Moon Sign ${trRashi(k.moonRashi, c)}, Nakshatra ${trVedic(k.nakshatra, c)} Pada ${k.charan} — align mindset and key decisions accordingly.`
      : c === "gu"
        ? `ચંદ્ર રાશિ ${trRashi(k.moonRashi, c)}, નક્ષત્ર ${trVedic(k.nakshatra, c)} ચરણ ${k.charan} — મન અને નિર્ણયો આ આધારે ઘડો.`
        : `चंद्र राशि ${k.moonRashi}, नक्षत्र ${k.nakshatra} चरण ${k.charan} — मानस और निर्णय इसी आधार पर गढ़ें।`,
  ];
  const areas = buildAreas(k, houses, map, c).map((a) => ({
    ...a,
    why:
      c === "en"
        ? `${a.why} Active Dasha: ${trPlanet(k.mahadasha, c)} Maha / ${trPlanet(k.antardasha, c)} Antar / ${trPlanet(k.pratyantardasha, c)} Pratyantar.`
        : c === "gu"
          ? `${a.why} વર્તમાન દશા ${trPlanet(k.mahadasha, c)} મહા / ${trPlanet(k.antardasha, c)} અંતર / ${trPlanet(k.pratyantardasha, c)} પ્રત્યંતર.`
          : `${a.why} वर्तमान दशा ${k.mahadasha} महा / ${k.antardasha} अंतर / ${k.pratyantardasha} प्रत्यंतर।`,
    timing: [a.timing, trans[0], trans[1]].filter(Boolean).join(" "),
  }));
  const housePhala = houses.map((h) => housePhalaLine(h, map, c));

  const topYoga = yogas[0];
  const summaryLines = [
    c === "en"
      ? `${trRashi(k.lagnaRashi, c)} Ascendant, Moon ${trRashi(k.moonRashi, c)}, Sun ${trRashi(k.sunRashi, c)}. Nakshatra ${trVedic(k.nakshatra, c)} (Pada ${k.charan}), Gana ${trVedic(k.gana, c)}, Nadi ${trVedic(k.nadi, c)}.`
      : c === "gu"
        ? `${trRashi(k.lagnaRashi, c)} લગ્ન, ચંદ્ર ${trRashi(k.moonRashi, c)}, સૂર્ય ${trRashi(k.sunRashi, c)}. નક્ષત્ર ${trVedic(k.nakshatra, c)} (${k.charan} ચરણ), ગણ ${trVedic(k.gana, c)}, નાડી ${trVedic(k.nadi, c)}.`
        : `${k.lagnaRashi} लग्न, चंद्र ${k.moonRashi}, सूर्य ${k.sunRashi}। नक्षत्र ${k.nakshatra} (${k.charan} चरण), गण ${k.gana}, नाड़ी ${k.nadi}।`,
    c === "en"
      ? `Current Dasha: ${trPlanet(k.mahadasha, c)}–${trPlanet(k.antardasha, c)}–${trPlanet(k.pratyantardasha, c)}.`
      : c === "gu"
        ? `વર્તમાન દશા: ${trPlanet(k.mahadasha, c)}–${trPlanet(k.antardasha, c)}–${trPlanet(k.pratyantardasha, c)}.`
        : `वर्तमान दशा: ${k.mahadasha}–${k.antardasha}–${k.pratyantardasha}।`,
    topYoga,
    doshas[0],
  ];

  return {
    houses,
    yogas,
    doshas,
    dignityOf,
    areas,
    housePhala,
    dashaNarrative,
    yearPhala,
    summaryLines,
    antarPhala: (mahaName, antarName) => antarLine(k, mahaName, antarName, c),
  };
}

export function professionalPdfAnswer(k: KundaliData, lang: string = "hi"): string {
  const currentLang = (lang || "hi").slice(0, 2).toLowerCase();
  const a = analyzeKundali(k, currentLang);
  const career = a.areas.find((x) => x.id === "career");
  const finance = a.areas.find((x) => x.id === "finance");
  const marriage = a.areas.find((x) => x.id === "marriage");
  const health = a.areas.find((x) => x.id === "health");

  if (currentLang === "en") {
    return [
      `Native: ${k.name} • Place: ${k.birthPlace} • Ascendant: ${trRashi(k.lagnaRashi, "en")} • Moon: ${trRashi(k.moonRashi, "en")} • Nakshatra: ${trVedic(k.nakshatra, "en")} (${k.charan})`,
      a.dashaNarrative,
      `Yoga: ${a.yogas[0] || "Auspicious Raja Yoga"}`,
      `Dosha: ${a.doshas[0] || "None"}`,
      career ? `Career — ${career.finding} Reason: ${career.why}` : "",
      finance ? `Finance — ${finance.finding}` : "",
      marriage ? `Marriage — ${marriage.finding}` : "",
      health ? `Health — ${health.finding}` : "",
      `Caution: ${career?.caution || "Take major decisions after consulting Dasha and Transit."}`,
      `Remedy: ${career?.remedy || "Ishta Devta prayers and righteous karma."}`,
    ]
      .filter(Boolean)
      .join("\n");
  }

  if (currentLang === "gu") {
    return [
      `જાતક: ${k.name} • સ્થળ: ${k.birthPlace} • લગ્ન: ${trRashi(k.lagnaRashi, "gu")} • ચંદ્ર: ${trRashi(k.moonRashi, "gu")} • નક્ષત્ર: ${trVedic(k.nakshatra, "gu")} (${k.charan})`,
      a.dashaNarrative,
      `યોગ: ${a.yogas[0] || "શુભ રાજયોગ"}`,
      `દોષ: ${a.doshas[0] || "કોઈ નહીં"}`,
      career ? `કારકિર્દી — ${career.finding} કારણ: ${career.why}` : "",
      finance ? `નાણાકીય — ${finance.finding}` : "",
      marriage ? `લગ્ન — ${marriage.finding}` : "",
      health ? `આરોગ્ય — ${health.finding}` : "",
      `સાવચેતી: ${career?.caution || "મહત્વપૂર્ણ નિર્ણયો દશા-ગોચર જોઈને લો."}`,
      `ઉપાય: ${career?.remedy || "ઇષ્ટદેવ સ્મરણ અને સત્કર્મ."}`,
    ]
      .filter(Boolean)
      .join("\n");
  }

  return [
    `जातक: ${k.name} • स्थान: ${k.birthPlace} • लग्न: ${k.lagnaRashi} • चंद्र: ${k.moonRashi} • नक्षत्र: ${k.nakshatra} (${k.charan})`,
    a.dashaNarrative,
    `योग: ${a.yogas[0]}`,
    `दोष: ${a.doshas[0]}`,
    career ? `करियर — ${career.finding} कारण: ${career.why}` : "",
    finance ? `वित्त — ${finance.finding}` : "",
    marriage ? `विवाह — ${marriage.finding}` : "",
    health ? `स्वास्थ्य — ${health.finding}` : "",
    `सावधानी: ${career?.caution || "महत्त्वपूर्ण निर्णय दशा-गोचर देखकर लें।"}`,
    `उपाय: ${career?.remedy || "इष्टदेव स्मरण और सत्य कर्म।"}`,
  ]
    .filter(Boolean)
    .join("\n");
}

export function isDummyKundaliName(name: string): boolean {
  const n = (name || "").trim();
  return !n || n === "श्री जातक" || n === "जातक" || n === "वर (Boy)" || n === "कन्या (Girl)";
}
