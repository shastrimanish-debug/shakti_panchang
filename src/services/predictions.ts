import { KundaliData, PlanetPosition } from "../types";
import { RASHIS, calculatePlanetPositions } from "./astronomy";
import { DASHA_ORDER } from "./kundali";

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

const HOUSE_LABELS = [
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

const HOUSE_DASHA: Record<number, string> = {
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
  strength: "उच्च" | "मध्यम" | "सावधानी";
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

function dignity(p: PlanetPosition): string {
  if (EXALTATION[p.planet] === p.rashi) return "उच्च";
  if (DEBILITATION[p.planet] === p.rashi) return "नीच";
  if (OWN_SIGNS[p.planet]?.includes(p.rashi)) return "स्वक्षेत्र";
  return "सामान्य";
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

function detectYogas(k: KundaliData, map: Record<string, PlanetPosition>, houses: HouseInfo[]): string[] {
  const out: string[] = [];
  const sun = map["सूर्य"];
  const moon = map["चंद्र"];
  const mer = map["बुध"];
  const jup = map["गुरु"];
  const mar = map["मंगल"];
  const ven = map["शुक्र"];
  const sat = map["शनि"];

  if (sun && mer && sun.house === mer.house) {
    out.push(
      `बुधादित्य योग — सूर्य व बुध ${sun.rashi} राशि के ${sun.house} भाव में युति; बुद्धि, वाणी और प्रशासनिक क्षमता प्रबल।`,
    );
  }
  if (jup && moon) {
    const dist = ((jup.house - moon.house + 12) % 12) + 1;
    if ([1, 4, 7, 10].includes(dist) || jup.house === moon.house) {
      out.push(
        `गजकेसरी योग — गुरु (${jup.rashi}, भाव ${jup.house}) चंद्र (${moon.rashi}, भाव ${moon.house}) से केंद्र में; यश, नीति और स्थिर प्रतिष्ठा।`,
      );
    }
  }
  if (moon && mar && moon.house === mar.house) {
    out.push(
      `चंद्र-मंगल योग — चंद्र-मंगल युति भाव ${moon.house} में; उद्यम, संपत्ति और साहसिक धन-लाभ का योग।`,
    );
  }

  const l1 = houses[0];
  const l5 = houses[4];
  const l9 = houses[8];
  const l10 = houses[9];
  if (l1.lordHouse === l5.house || l1.lord === l5.lord) {
    out.push(`लग्नेश-पंचमेश संबंध — राजयोग संकेत; विद्या, संतान-सुख और नेतृत्व।`);
  }
  if (l1.lordHouse === l9.house || map[l1.lord]?.house === l9.house) {
    out.push(`लग्नेश-नवमेश संबंध — धर्म-राजयोग; भाग्य, गुरुकृपा और दीर्घ यात्रा।`);
  }
  if (l9.lordHouse === l10.house || map[l9.lord]?.house === l10.house) {
    out.push(`धर्म-कर्माधिपति योग — नवमेश-दशमेश संबंध; कर्मक्षेत्र में सम्मानित उन्नति।`);
  }
  if (ven && kendra(ven.house) && (dignity(ven) === "उच्च" || dignity(ven) === "स्वक्षेत्र")) {
    out.push(`मालव्य योग संकेत — शुक्र केंद्र में ${dignity(ven)}; सौंदर्य, कला और सुख-साधन।`);
  }
  if (jup && kendra(jup.house) && (dignity(jup) === "उच्च" || dignity(jup) === "स्वक्षेत्र")) {
    out.push(`हंस योग संकेत — गुरु केंद्र में ${dignity(jup)}; धर्म, नीति और गुरु-पद।`);
  }
  if (sat && kendra(sat.house) && (dignity(sat) === "उच्च" || dignity(sat) === "स्वक्षेत्र")) {
    out.push(`शश योग संकेत — शनि केंद्र में ${dignity(sat)}; धीरज, संगठन और दीर्घकालिक अधिकार।`);
  }
  if (sun && kendra(sun.house) && (dignity(sun) === "उच्च" || dignity(sun) === "स्वक्षेत्र")) {
    out.push(`रुचक/सूर्य-बल — सूर्य केंद्र में ${dignity(sun)}; आत्मतेज और नेतृत्व।`);
  }

  const d6 = houses[5];
  const d8 = houses[7];
  const d12 = houses[11];
  if ([6, 8, 12].includes(d6.lordHouse) || [6, 8, 12].includes(d8.lordHouse) || [6, 8, 12].includes(d12.lordHouse)) {
    out.push(`विपरीत राजयोग संकेत — 6/8/12 के स्वामी दुःस्थान में; बाधाओं से अप्रत्याशित उत्थान संभव।`);
  }

  if (out.length === 0) {
    out.push("इस कुंडली में शास्त्रीय राजयोग सामान्य स्तर पर हैं — पुरुषार्थ और दशा-समय निर्णायक रहेंगे।");
  }
  return out;
}

function detectDoshas(k: KundaliData, map: Record<string, PlanetPosition>): string[] {
  const out: string[] = [];
  const mars = map["मंगल"];
  const moon = map["चंद्र"];
  if (mars && [1, 4, 7, 8, 12].includes(mars.house)) {
    out.push(
      `कुज दोष संकेत — मंगल ${mars.rashi} राशि के ${mars.house} भाव में। विवाह-मिलान में शांति/उचित मिलान आवश्यक।`,
    );
  } else {
    out.push("कुज दोष का सामान्य संकेत नहीं मिला।");
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
      out.push("कालसर्प योग संकेत — सात ग्रह राहु-केतु अक्ष के एक ओर। धैर्य, शिव-साधना और दशा-विचार आवश्यक।");
    } else {
      out.push("कालसर्प योग का सामान्य संकेत नहीं मिला।");
    }
  }

  if (moon) {
    const h2 = (moon.house % 12) + 1;
    const h12 = ((moon.house - 2 + 12) % 12) + 1;
    const has2 = k.planets.some((p) => p.planet !== "चंद्र" && p.house === h2);
    const has12 = k.planets.some((p) => p.planet !== "चंद्र" && p.house === h12);
    if (!has2 && !has12) {
      out.push("केमद्रुम योग संकेत — चंद्र के 2-12 भाव रिक्त। मानसिक एकाकीपन; गुरु/केन्द्र संबंध से शमन।");
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
      out.push(`अस्त विचार — ${combust.map((p) => p.planet).join(", ")} सूर्य के सान्निध्य में; बाह्य फल क्षीण, आंतरिक तेज शेष।`);
    }
  }
  return out;
}

function strengthFrom(house: number, lordHouse: number, occupants: string[], lordDig: string): LifeAreaPrediction["strength"] {
  let score = 0;
  if (trikona(lordHouse) || kendra(lordHouse)) score += 2;
  if (dusthana(lordHouse)) score -= 1;
  if (lordDig === "उच्च" || lordDig === "स्वक्षेत्र") score += 2;
  if (lordDig === "नीच") score -= 2;
  if (occupants.some((p) => BENEFICS.has(p))) score += 1;
  if (occupants.some((p) => MALEFICS.has(p)) && !upachaya(house)) score -= 1;
  if (score >= 3) return "उच्च";
  if (score <= 0) return "सावधानी";
  return "मध्यम";
}

function fmtDate(d: Date) {
  return d.toLocaleDateString("hi-IN", { day: "numeric", month: "short", year: "numeric" });
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

function housePhalaLine(h: HouseInfo, map: Record<string, PlanetPosition>): string {
  const occ = h.occupants.length ? `स्थित ग्रह: ${h.occupants.join(", ")}` : "भाव रिक्त (भावेश से फल)";
  const lord = map[h.lord];
  const dig = lord ? dignity(lord) : "सामान्य";
  const lordNote = lord
    ? `भावेश ${h.lord} ${lord.rashi} राशि के ${lord.house} भाव में (${dig})`
    : `भावेश ${h.lord}`;
  const tone =
    kendra(h.lordHouse) || trikona(h.lordHouse)
      ? "शुभ फल प्रबल"
      : dusthana(h.lordHouse)
        ? "सावधानी व परिश्रम अपेक्षित"
        : "मिश्रित फल";
  return `भाव ${h.house} (${HOUSE_LABELS[h.house - 1]}) — राशि ${h.sign}। ${lordNote}। ${occ}। निष्कर्ष: ${tone}।`;
}

function antarLine(k: KundaliData, maha: string, antar: string): string {
  const map = byPlanet(k);
  const mp = map[maha];
  const ap = map[antar];
  const mh = mp?.house ?? 10;
  const ah = ap?.house ?? 1;
  const md = mp ? dignity(mp) : "सामान्य";
  const ad = ap ? dignity(ap) : "सामान्य";
  const theme = HOUSE_DASHA[ah] || HOUSE_DASHA[mh];
  const mix =
    BENEFICS.has(antar) && (kendra(ah) || trikona(ah))
      ? "अनुकूल प्रगति"
      : MALEFICS.has(antar) && dusthana(ah)
        ? "विलंब/परीक्षण"
        : "मिश्रित परिणाम";
  return `${maha}–${antar}: ${antar} भाव ${ah} (${ad}), ${maha} भाव ${mh} (${md}) — ${theme}; ${mix}।`;
}

function buildAreas(k: KundaliData, houses: HouseInfo[], map: Record<string, PlanetPosition>): LifeAreaPrediction[] {
  const { maha, antar } = currentDashaWindow(k);
  const timing = maha && antar
    ? `वर्तमान ${k.mahadasha} महादशा / ${k.antardasha} अंतर्दशा (${fmtDate(antar.startDate)}–${fmtDate(antar.endDate)})`
    : `${k.mahadasha} / ${k.antardasha}`;

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
    const dig = lord ? dignity(lord) : "सामान्य";
    const occ = hs.flatMap((h) => h.occupants.map((p) => `${p} (भाव ${h.house})`));
    const why = `${hs
      .map((h) => `भाव ${h.house} ${h.sign}, भावेश ${h.lord} भाव ${h.lordHouse} में`)
      .join("; ")}${occ.length ? `; ग्रह: ${occ.join(", ")}` : ""}।`;
    const strength = strengthFrom(primary.house, primary.lordHouse, primary.occupants, dig);
    const finding =
      strength === "उच्च"
        ? `${findingExtra} संकेत प्रबल हैं — अवसरों का सदुपयोग करें।`
        : strength === "सावधानी"
          ? `${findingExtra} मिश्रित/कठिन हैं — योजना और धैर्य आवश्यक।`
          : `${findingExtra} मध्यम हैं — सतत पुरुषार्थ से सिद्धि।`;
    return { id, title, finding, why, timing, strength, caution, remedy };
  };

  const l10 = houses[9];
  const careerField =
    l10.lord === "बुध" || l10.occupants.includes("बुध")
      ? "लेखन, वाणिज्य, आईटी, लेखा, संचार"
      : l10.lord === "गुरु" || l10.occupants.includes("गुरु")
        ? "शिक्षण, विधि, परामर्श, बैंक/वित्त, धर्म-सेवा"
        : l10.lord === "शुक्र" || l10.occupants.includes("शुक्र")
          ? "कला, डिज़ाइन, आतिथ्य, विलास, सौंदर्य"
          : l10.lord === "मंगल" || l10.occupants.includes("मंगल")
            ? "अभियांत्रिकी, सेना/पुलिस, शल्य, रियल एस्टेट"
            : l10.lord === "शनि" || l10.occupants.includes("शनि")
              ? "संगठन, श्रम, खनन, विधि-पालन, दीर्घ परियोजनाएँ"
              : l10.lord === "सूर्य" || l10.occupants.includes("सूर्य")
                ? "प्रशासन, सरकार, नेतृत्व, ऊर्जा"
                : "सेवा, प्रबंधन अथवा स्व-उद्यम";

  return [
    area(
      "personality",
      "व्यक्तित्व एवं स्वास्थ्य",
      [1],
      `${k.lagnaRashi} लग्न — स्वभाव, कांति और देह-बल`,
      "अति आत्मविश्वास या आलस्य से बचें; दिनचर्या नियमित रखें।",
      "लग्नेश के वार को व्रत, सूर्यार्घ्य और सात्विक आहार।",
    ),
    area(
      "career",
      "करियर / आजीविका",
      [10, 6],
      `दशम भाव ${l10.sign} — अनुकूल क्षेत्र: ${careerField}`,
      "दशा बदलते समय नौकरी/साझेदारी जल्दबाज़ी में न बदलें।",
      "दशमेश के मंत्र जप, गुरुजन सम्मान और कर्म में सत्यनिष्ठा।",
    ),
    area(
      "finance",
      "धन / वित्त",
      [2, 11],
      "द्वितीय-एकादश से कोष, वाणी और आय-स्रोत",
      "सट्टेबाज़ी और बिना कागज़ के ऋण से बचें।",
      "शुक्र/गुरु वार को दान, लक्ष्मी पूजन और बजट-अनुशासन।",
    ),
    area(
      "marriage",
      "विवाह / दांपत्य",
      [7],
      "सप्तम भाव से जीवनसाथी, साझेदारी और लोक-व्यवहार",
      "कुज/नाड़ी दोष होने पर मिलान और शांति अवश्य कराएँ।",
      "शुक्रवार को लक्ष्मी-नारायण पूजन; दंपति संवाद बढ़ाएँ।",
    ),
    area(
      "education",
      "शिक्षा / बुद्धि",
      [4, 5],
      "चतुर्थ-पंचम से विद्या, स्मृति और शोध-क्षमता",
      "एकाग्रता भंग होने पर रात्रि जागरण कम करें।",
      "बुध/गुरु साधना, सरस्वती वंदना, नियमित स्वाध्याय।",
    ),
    area(
      "children",
      "संतान",
      [5],
      "पंचम भाव से संतान-सुख, प्रेम और पुण्य",
      "पंचमेश दुर्बल हो तो संतान योजना में ज्योतिष परामर्श लें।",
      "गुरुवार को केले के वृक्ष को जल, बालकों को ज्ञान-दान।",
    ),
    area(
      "property",
      "भूमि / वाहन / गृह",
      [4],
      "चतुर्थ भाव से माता-सुख, घर और अचल संपत्ति",
      "दस्तावेज़ और दिशा-मुहूर्त बिना भूमि-क्रय न करें।",
      "वास्तु शुद्धि, माता का आशीर्वाद, शनिवार को तेल-दान।",
    ),
    area(
      "foreign",
      "विदेश / यात्रा",
      [9, 12],
      "नवम-द्वादश से दीर्घ यात्रा, विदेश वास और व्यय",
      "द्वादश व्यय अधिक हो तो यात्रा बजट बाँधें।",
      "नवमेश उपाय, तीर्थ और पासपोर्ट-कार्य शुभ मुहूर्त में।",
    ),
    area(
      "health",
      "स्वास्थ्य",
      [1, 6, 8],
      "लग्न-षष्ठ-अष्टम से रोग-क्षमता और आयु-बल",
      "षष्ठेश/अष्टमेश दशा में स्वास्थ्य जाँच न टालें।",
      "प्राणायाम, सूर्य नमस्कार, संबंधित ग्रह का दान-व्रत।",
    ),
  ];
}

function transitNotes(k: KundaliData): string[] {
  try {
    const now = new Date();
    const transits = calculatePlanetPositions(now, k.latitude, k.longitude, k.timezoneHours || 5.5);
    const lagnaIdx = (k.lagnaRashiNumber - 1 + 12) % 12;
    const lines: string[] = [];
    for (const name of ["गुरु", "शनि", "राहु", "मंगल"]) {
      const t = transits.find((p) => p.planet === name);
      if (!t) continue;
      const house = houseOfSign(lagnaIdx, t.rashi);
      lines.push(
        `गोचर ${name} ${t.rashi} में (लग्न से भाव ${house}${t.isRetrograde ? ", वक्री" : ""}) — ${HOUSE_DASHA[house]}।`,
      );
    }
    return lines;
  } catch {
    return [];
  }
}

export function analyzeKundali(k: KundaliData): ChartAnalysis {
  const map = byPlanet(k);
  const houses = buildHouses(k, map);
  const yogas = detectYogas(k, map, houses);
  const doshas = detectDoshas(k, map);
  const dignityOf: Record<string, string> = {};
  for (const p of k.planets) dignityOf[p.planet] = dignity(p);

  const { maha, antar } = currentDashaWindow(k);
  const mahaP = map[k.mahadasha];
  const antarP = map[k.antardasha];
  const dashaNarrative = `जातक ${k.name} की वर्तमान विंशोत्तरी ${k.mahadasha} महादशा (${maha ? fmtDate(maha.startDate) : "—"} से ${maha ? fmtDate(maha.endDate) : "—"}) तथा ${k.antardasha} अंतर्दशा चल रही है। ${k.mahadasha} जन्म कुंडली में ${mahaP ? `${mahaP.rashi} राशि के ${mahaP.house} भाव` : "अज्ञात भाव"} में ${mahaP ? dignity(mahaP) : ""} है; ${k.antardasha} ${antarP ? `${antarP.rashi} / भाव ${antarP.house}` : ""} में। फल: ${HOUSE_DASHA[mahaP?.house ?? 10]}। प्रत्यंतर ${k.pratyantardasha} सूक्ष्म समय को मोड़ देता है।`;

  const trans = transitNotes(k);
  const yearPhala = [
    dashaNarrative,
    ...trans.slice(0, 3),
    `चंद्र राशि ${k.moonRashi}, नक्षत्र ${k.nakshatra} चरण ${k.charan} — मानस और निर्णय इसी आधार पर गढ़ें।`,
  ];
  const areas = buildAreas(k, houses, map).map((a) => ({
    ...a,
    why: `${a.why} वर्तमान दशा ${k.mahadasha} महा / ${k.antardasha} अंतर / ${k.pratyantardasha} प्रत्यंतर।`,
    timing: [a.timing, trans[0], trans[1]].filter(Boolean).join(" "),
  }));
  const housePhala = houses.map((h) => housePhalaLine(h, map));

  const topYoga = yogas[0];
  const summaryLines = [
    `${k.lagnaRashi} लग्न, चंद्र ${k.moonRashi}, सूर्य ${k.sunRashi}। नक्षत्र ${k.nakshatra} (${k.charan} चरण), गण ${k.gana}, नाड़ी ${k.nadi}।`,
    `वर्तमान दशा: ${k.mahadasha}–${k.antardasha}–${k.pratyantardasha}।`,
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
    antarPhala: (mahaName, antarName) => antarLine(k, mahaName, antarName),
  };
}

export function professionalPdfAnswer(k: KundaliData): string {
  const a = analyzeKundali(k);
  const career = a.areas.find((x) => x.id === "career");
  const finance = a.areas.find((x) => x.id === "finance");
  const marriage = a.areas.find((x) => x.id === "marriage");
  const health = a.areas.find((x) => x.id === "health");
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
