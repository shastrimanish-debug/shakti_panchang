import { KundaliData, VedicPanchangData } from "../types";
import { getLicenseStatus } from "./license-client";
import {
  synthesizeDynamicMicroVerdict,
  synthesizePanchangAstrologyVerdict,
  buildMicroAstrologyContextPrompt,
  generateTraditionalUpayParchi,
} from "../services/umaMicroAstrology";
import {
  calculateMulank,
  calculateBhagyank,
  calculateNamank,
  calculateKuaNumber,
  calculatePersonalYear,
  calculateLoshuGrid,
  NUMBER_DATA,
  MISSING_NUMBER_REMEDIES,
  reduceToSingleDigit,
} from "../services/numerology";
import {
  getDayChoghadiya,
  getCurrentChoghadiya,
  getInauspiciousWindows,
  getAuspiciousWindows,
} from "../services/choghadiya";
import { DISHASHOOL_MAP, TRAVEL_REMEDIES } from "../services/disha";
import { calculateKundali } from "../services/kundali";
import { getSavedKundaliProfiles } from "../services/storage";
import { getUmaApiEndpoints } from "../services/UmaVoiceService";

export type UmaActionType =
  | "open_panchang"
  | "open_choghadiya"
  | "open_kundali"
  | "open_yatra"
  | "open_muhurat"
  | "open_numerology"
  | "open_vastu"
  | "open_palmistry"
  | "open_gemology"
  | "open_upay";

export interface UmaResponse {
  ok: boolean;
  text: string;
  source: "local_vedic" | "gemini" | "hybrid";
  actionPayload?: {
    type: UmaActionType;
    label: string;
  };
}

export interface AskUmaParams {
  query: string;
  panchangContext?: string;
  kundaliContext?: string;
  numerologyContext?: string;
  forceNumerology?: boolean;
  chatHistory?: Array<{ sender: "user" | "uma"; text: string }>;
  panchang?: VedicPanchangData | null;
  activeKundali?: KundaliData | null;
  systemPrompt?: string;
}

export interface AskUmaResponse {
  ok: boolean;
  text: string;
  source: "gemini" | "grok" | "openrouter" | "local_vedic";
  actionPayload?: {
    type: UmaActionType;
    label: string;
  };
}

export type UmaLinkState = "online" | "local" | "nokey";

export async function pingUmaServer(): Promise<{ state: UmaLinkState; providers: string[] }> {
  try {
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      return { state: "local", providers: ["local_vedic"] };
    }
    const endpoints = getUmaApiEndpoints("/api/health");
    for (const url of endpoints) {
      const healthResp = await fetch(url, { signal: AbortSignal.timeout(2500) }).catch(() => null);
      if (healthResp && healthResp.ok) {
        const data = await healthResp.json().catch(() => null);
        if (data?.hasGeminiKey) {
          return { state: "online", providers: ["gemini", "local_vedic"] };
        }
        return { state: "local", providers: ["local_vedic"] };
      }
    }
    return { state: "local", providers: ["local_vedic"] };
  } catch {
    return { state: "local", providers: ["local_vedic"] };
  }
}

/**
 * Detects whether a query is primarily about Ank Jyotish (Numerology)
 */
export function isNumerologyQuery(query: string): boolean {
  const q = (query || "").toLowerCase();
  return /अंक|मूलांक|भाग्यांक|नामांक|लो-शू|लो शू|लोशू|कुआं|कुआ अंक|स्पेलिंग|नेम सुधार|नाम सुधार|व्यक्तिगत वर्ष|व्यक्तिगत मास|मोबाइल नंबर|मोबाइल अंक|वाहन नंबर|वाहन अंक|गाड़ी नंबर|लकी नंबर|शुभ अंक|पिनैकल|शिखर अंक|mulank|moolank|bhagyank|namank|numerology|loshu|lo shu|kua number|personal year|name spelling|lucky number|ank jyotish|ankjyotish/.test(
    q
  );
}

/**
 * Compound Number Esoteric Vibration Dictionary (Chaldean 10 to 52)
 */
const COMPOUND_VIBRATIONS: Record<number, { title: string; nature: "अति शुभ" | "शुभ" | "सावधानी/संघर्ष"; desc: string }> = {
  10: { title: "भाग्य चक्र (Wheel of Fortune)", nature: "अति शुभ", desc: "सम्मान, आत्मविश्वास व उतार-चढ़ाव के बाद उच्च सफलता का सूचक।" },
  11: { title: "गुप्त अग्नि व अंतर्ज्ञान अंक", nature: "सावधानी/संघर्ष", desc: "तीव्र अंतर्दृष्टि किंतु निर्णयों में द्विविधा से बचना आवश्यक।" },
  12: { title: "त्याग व मानसिक मंथन अंक", nature: "सावधानी/संघर्ष", desc: "दूसरों के लिए अधिक श्रम; अनुबंधों में सतर्कता रखें।" },
  13: { title: "कायाकल्प व नवनिर्माण अंक", nature: "सावधानी/संघर्ष", desc: "अप्रत्याशित परिवर्तन के माध्यम से नई शक्ति व भाग्योदय।" },
  14: { title: "व्यापारिक गतिशीलता व संचार अंक", nature: "शुभ", desc: "जनसंपर्क, मीडिया, व्यापार व धन प्रवाह में तीव्रता।" },
  15: { title: "आकर्षण, कला व लक्ष्मी कृपा अंक", nature: "अति शुभ", desc: "सम्मोहन शक्ति, वाणी से धन लाभ और उच्च लोगों से सहयोग।" },
  16: { title: "ढहता मीनार (Shattered Citadel - चेतावनी अंक)", nature: "सावधानी/संघर्ष", desc: "अहंकार या अति-विश्वास से बचें; नामांक को 15, 19, 23 या 24 पर लाना श्रेष्ठ।" },
  17: { title: "अमर सप्तर्षि तारा (Star of the Magi)", nature: "अति शुभ", desc: "प्रारंभिक संघर्ष के बाद स्थायी प्रसिद्धि, अध्यात्म और अटूट यश।" },
  18: { title: "सूर्य-शनि द्वंद्व व रक्त-संघर्ष अंक", nature: "सावधानी/संघर्ष", desc: "पारिवारिक/व्यावसायिक विवाद की आशंका; स्पेलिंग सुधारकर 19 या 23 करना उत्तम।" },
  19: { title: "स्वर्ग का राजकुमार (Prince of Heaven)", nature: "अति शुभ", desc: "सर्वोच्च सफलता, राजकीय सम्मान, सौभाग्य और हर संकट से विजय।" },
  20: { title: "आध्यात्मिक जागरण (The Awakening)", nature: "शुभ", desc: "भौतिक दौड़ से अधिक उच्च उद्देश्य, नई योजना और विलंब से भाग्योदय।" },
  21: { title: "ब्रह्माण्ड मुकुट (Crown of the Magi)", nature: "अति शुभ", desc: "कठोर परिश्रम के पश्चात निश्चित विजय, उच्च पद और धन-संपदा।" },
  22: { title: "मास्टर बिल्डर / भ्रम से सावधानी", nature: "सावधानी/संघर्ष", desc: "बड़े सपने किंतु व्यावहारिक सतर्कता अत्यंत आवश्यक।" },
  23: { title: "राजकीय सिंह तारा (Royal Star of the Lion)", nature: "अति शुभ", desc: "उच्चाधिकारियों का संरक्षण, प्रचंड भाग्योदय, व्यापार व करियर में शीर्ष सिद्धि।" },
  24: { title: "शुक्र का प्रेम, धन व सौभाग्य अंक", nature: "अति शुभ", desc: "विपरीत लिंग एवं वरिष्ठ जनों से सहयोग, आभूषण, कला व अखंड लक्ष्मी योग।" },
  25: { title: "अनुभवजन्य प्रज्ञा व विजय अंक", nature: "शुभ", desc: "पूर्व अनुभवों व सूक्ष्म विश्लेषण से २५ वर्ष के बाद विशेष भाग्योदय।" },
  26: { title: "शनि-सूर्य साझेदारी चेतावनी अंक", nature: "सावधानी/संघर्ष", desc: "गलत साझेदारी या निवेश से हानि संभव; स्पेलिंग को 23, 24 या 27 पर सुधारें।" },
  27: { title: "राजदंड अंक (The Sceptre)", nature: "अति शुभ", desc: "नेतृत्व क्षमता, बौद्धिक अधिकार, प्रशासन और स्वतंत्र निर्णय से सफलता।" },
  28: { title: "विरोधाभास व कानूनी सतर्कता अंक", nature: "सावधानी/संघर्ष", desc: "प्रारंभिक लाभ के बाद विश्वासघात से बचाव जरूरी; नामांक सुधार हितकारी।" },
  29: { title: "अनिश्चितता व भावनात्मक परीक्षा अंक", nature: "सावधानी/संघर्ष", desc: "मित्रों के चयन में सावधानी रखें; नाम स्पेलिंग को 23, 24 या 32 करें।" },
  30: { title: "बृहस्पति की एकाग्र मेधा अंक", nature: "शुभ", desc: "शिक्षा, परामर्श, दर्शन व ज्ञान के बल पर प्रतिष्ठा।" },
  31: { title: "आत्मनिर्भर एकांत साधक अंक", nature: "शुभ", desc: "स्वयं के दम पर मौलिक कार्य खड़ा करने की क्षमता।" },
  32: { title: "जादुई संचार व जन-आकर्षण अंक", nature: "अति शुभ", desc: "23 के समान ही राष्ट्रव्यापी संपर्क, व्यापार विस्तार व लोकप्रियता प्रदाता।" },
  33: { title: "कुबेर व गुरु-शुक्र महा-अंक", nature: "अति शुभ", desc: "अखंड धन, सात्विक ऐश्वर्य, समाज में सम्मान और दैवीय कृपा।" },
  37: { title: "राजकीय मैत्री व स्वर्णिम आकर्षण अंक", nature: "अति शुभ", desc: "सूर्य (1) और केतु (7) के योग से हर कार्य में चमत्कारिक सफलता व समृद्धि।" },
  41: { title: "नेतृत्व व अजेय विजय अंक", nature: "अति शुभ", desc: "19 और 23 के समान उच्च पद व व्यापारिक साम्राज्य प्रदाता।" },
  42: { title: "शुक्र-चंद्र ऐश्वर्य अंक", nature: "अति शुभ", desc: "24 के समान ही धन, सुख-सुविधा और कलात्मक सफलता।" },
  45: { title: "मंगल-बुध रणनीतिक विजय अंक", nature: "अति शुभ", desc: "तीव्र बुद्धि व साहस से बड़े प्रोजेक्ट्स में सफलता।" },
  46: { title: "राजमुकुट व स्थायी संपत्ति अंक", nature: "अति शुभ", desc: "भूमि, भवन, नेतृत्व व दीर्घकालिक धन कोष।" },
  50: { title: "स्वतंत्र मेधा व व्यापार सम्राट अंक", nature: "अति शुभ", desc: "बुध की सर्वोच्च ऊर्जा से व्यापार, आईटी व वित्त में बड़ी सफलता।" },
  51: { title: "योद्धा सेनापति अंक", nature: "अति शुभ", desc: "प्रशासन, सेना, राजनीति व साहसिक उपक्रमों में त्वरित उन्नति।" },
};

function getCompoundVibrationDetail(compound: number): { title: string; nature: string; desc: string } {
  if (COMPOUND_VIBRATIONS[compound]) return COMPOUND_VIBRATIONS[compound];
  const single = reduceToSingleDigit(compound);
  if ([1, 3, 5, 6].includes(single)) {
    return {
      title: `शुभ संयुक्त स्पंदन (${compound})`,
      nature: "शुभ",
      desc: "यह संयुक्त अंक आपके कर्म व बौद्धिक प्रयासों को सकारात्मक गति प्रदान करता है।",
    };
  }
  return {
    title: `कर्मप्रधान संयुक्त स्पंदन (${compound})`,
    nature: "सावधानी/संघर्ष",
    desc: "यह संयुक्त अंक धैर्य व कठिन परिश्रम के पश्चात ही स्थायी फल देता है।",
  };
}

/**
 * Computes Chaldean letter-by-letter breakdown string (e.g. M(4)+A(1)+N(5)...)
 */
function buildLetterByLetterBreakdown(rawName: string): {
  chaldeanFormula: string;
  pythagoreanFormula: string;
} {
  const CHALDEAN_MAP: Record<string, number> = {
    A: 1, I: 1, J: 1, Q: 1, Y: 1,
    B: 2, K: 2, R: 2,
    C: 3, G: 3, L: 3, S: 3,
    D: 4, M: 4, T: 4,
    E: 5, H: 5, N: 5, X: 5,
    U: 6, V: 6, W: 6,
    O: 7, Z: 7,
    F: 8, P: 8,
  };
  const PYTHAGOREAN_MAP: Record<string, number> = {
    A: 1, J: 1, S: 1,
    B: 2, K: 2, T: 2,
    C: 3, L: 3, U: 3,
    D: 4, M: 4, V: 4,
    E: 5, N: 5, W: 5,
    F: 6, O: 6, X: 6,
    G: 7, P: 7, Y: 7,
    H: 8, Q: 8, Z: 8,
    I: 9, R: 9,
  };

  const clean = (rawName || "YAJAMAN").toUpperCase().replace(/[^A-Z]/g, "");
  if (!clean) {
    return { chaldeanFormula: "Y(1)+A(1)+J(1)+A(1)+M(4)+A(1)+N(5)", pythagoreanFormula: "Y(7)+A(1)+J(1)+A(1)+M(4)+A(1)+N(5)" };
  }

  const cParts: string[] = [];
  const pParts: string[] = [];
  for (const ch of clean) {
    cParts.push(`${ch}(${CHALDEAN_MAP[ch] || 1})`);
    pParts.push(`${ch}(${PYTHAGOREAN_MAP[ch] || 1})`);
  }
  return {
    chaldeanFormula: cParts.join(" + "),
    pythagoreanFormula: pParts.join(" + "),
  };
}

/**
 * Analyzes adjacent 2-digit pairs in a Mobile or Vehicle number
 */
function analyzeDigitPairsMicro(digitsStr: string): {
  pairsStr: string;
  shubhPairs: string[];
  cautionPairs: string[];
  last4Compound: number;
  last4Single: number;
} {
  const digits = digitsStr.replace(/\D/g, "");
  const SHUBH_PAIRS: Record<string, string> = {
    "19": "सूर्य-मंगल नेतृत्व व उच्च पद योग",
    "91": "प्रशासनिक शक्ति व सम्मान योग",
    "37": "गुरु-केतु आध्यात्मिक व शैक्षिक राजयोग",
    "73": "उच्च प्रज्ञा व परामर्श सफलता योग",
    "56": "बुध-शुक्र अखंड लक्ष्मी व व्यापार प्रवाह",
    "65": "आर्थिक समृद्धि व लग्जरी योग",
    "15": "सूर्य-बुध बुधादित्य व्यापार सिद्धि",
    "51": "तीव्र निर्णय व बैंकिंग लाभ योग",
    "25": "चंद्र-बुध जनसंपर्क व तरल धन योग",
    "52": "मीडिया, वाणी व कोष वृद्धि योग",
    "39": "गुरु-मंगल पराक्रम व भूमि-विजय योग",
    "93": "ऊर्जा व प्रतिष्ठा वृद्धि योग",
    "69": "शुक्र-मंगल आकर्षण व संपत्ति योग",
    "96": "कला व उद्यम सिद्धि योग",
    "35": "गुरु-बुध ज्ञान व व्यापार विस्तार",
    "53": "वित्तीय प्रबंधन व लाभ योग",
  };
  const CAUTION_PAIRS: Record<string, string> = {
    "28": "चंद्र-शनि विष योग (मानसिक तनाव/विलंब)",
    "82": "शनि-चंद्र भावनात्मक उतार-चढ़ाव",
    "48": "राहु-शनि संघर्ष व अनावश्यक देरी",
    "84": "शनि-राहु आकस्मिक अवरोध",
    "18": "सूर्य-शनि पिता/अधिकारी मतभेद व संघर्ष",
    "81": "शनि-सूर्य अधिकार द्वंद्व",
    "26": "चंद्र-शुक्र अनियंत्रित व्यय",
    "62": "भावुकता से आर्थिक हानि",
    "44": "राहु द्वित्व — भ्रम व अस्थिरता",
    "88": "शनि द्वित्व — कठोर श्रम के बाद विलंब से फल",
  };

  const allPairs: string[] = [];
  const shubhFound: string[] = [];
  const cautionFound: string[] = [];

  for (let i = 0; i < digits.length - 1; i++) {
    const pair = digits.slice(i, i + 2);
    if (pair === "00") continue;
    allPairs.push(pair);
    if (SHUBH_PAIRS[pair]) {
      shubhFound.push(`**${pair}** (${SHUBH_PAIRS[pair]})`);
    } else if (CAUTION_PAIRS[pair]) {
      cautionFound.push(`**${pair}** (${CAUTION_PAIRS[pair]})`);
    }
  }

  const last4 = digits.slice(-4);
  let last4Compound = 0;
  for (const ch of last4) last4Compound += parseInt(ch, 10) || 0;
  const last4Single = reduceToSingleDigit(last4Compound);

  return {
    pairsStr: allPairs.join(" → "),
    shubhPairs: Array.from(new Set(shubhFound)),
    cautionPairs: Array.from(new Set(cautionFound)),
    last4Compound,
    last4Single,
  };
}

/**
 * Computes harmonious Chaldean spelling suggestions when current name vibration is not in friendlyNumbers
 */
function buildNameSpellingSuggestions(
  rawName: string,
  currentCompound: number,
  currentSingle: number,
  friendlyNumbers: number[],
  mulankNum: number,
  bhagyankNum: number
): string {
  const cleanName = (rawName || "YAJAMAN").trim().toUpperCase().replace(/[^A-Z\s]/g, "") || "YAJAMAN";
  const badCompounds = [16, 18, 22, 26, 28, 29, 35, 38, 43, 44, 47, 48];
  const isFriendly =
    (friendlyNumbers.includes(currentSingle) || currentSingle === mulankNum || currentSingle === bhagyankNum) &&
    !badCompounds.includes(currentCompound);

  const letterAdditions: Array<{ char: string; val: number; hint: string }> = [
    { char: "A", val: 1, hint: "'A' (सूर्य अक्षर, मान +1)" },
    { char: "I", val: 1, hint: "'I' (सूर्य अक्षर, मान +1)" },
    { char: "E", val: 5, hint: "'E' (बुध अक्षर, मान +5)" },
    { char: "N", val: 5, hint: "'N' (बुध अक्षर, मान +5)" },
    { char: "S", val: 3, hint: "'S' (गुरु अक्षर, मान +3)" },
    { char: "U", val: 6, hint: "'U' (शुक्र अक्षर, मान +6)" },
    { char: "R", val: 2, hint: "'R' (चंद्र अक्षर, मान +2)" },
  ];

  const suggestions: string[] = [];
  const firstWord = cleanName.split(/\s+/)[0] || cleanName;
  const restWords = cleanName.split(/\s+/).slice(1).join(" ");

  for (const item of letterAdditions) {
    const newCompound = currentCompound + item.val;
    const newSingle = reduceToSingleDigit(newCompound);
    if (
      (friendlyNumbers.includes(newSingle) || newSingle === mulankNum || newSingle === bhagyankNum) &&
      newSingle !== 8 &&
      !badCompounds.includes(newCompound)
    ) {
      const modifiedFirst = `${firstWord}${item.char}`;
      const fullModified = restWords ? `${modifiedFirst} ${restWords}` : modifiedFirst;
      const planetName = NUMBER_DATA[newSingle]?.planet?.split(" ")[0] || "शुभ ग्रह";
      const vib = getCompoundVibrationDetail(newCompound);
      suggestions.push(
        `  • **${fullModified}** → संयुक्त अंक **${newCompound}** (*${vib.title}*) → नामांक **${newSingle}** (${planetName} प्रधान — ${item.hint} जोड़ने पर)`
      );
      if (suggestions.length >= 3) break;
    }
  }

  if (isFriendly) {
    const vib = getCompoundVibrationDetail(currentCompound);
    return `✓ **आपका वर्तमान नाम «${cleanName}» (संयुक्त अंक ${currentCompound} [${vib.title}] → नामांक ${currentSingle})** आपके मूलांक ${mulankNum} व भाग्यांक ${bhagyankNum} के **१००% अनुकूल एवं राजयोगकारी** है! स्पेलिंग बदलने की आवश्यकता नहीं है; केवल हस्ताक्षर में पहला अक्षर बड़ा रखें, नीचे बाएं से दाएं १५° ऊपर उठती हुई रेखा खींचें और अंत में बिंदु (.) लगाएं।`;
  }

  if (suggestions.length === 0) {
    return `⚠️ आपका वर्तमान नाम **«${cleanName}»** (संयुक्त अंक ${currentCompound} → नामांक ${currentSingle}) आपके मूलांक ${mulankNum} से सम/संघर्षकारी है। इसे मित्र अंक (**${friendlyNumbers.join(", ")}**) के शुभ संयुक्त अंक (19, 23, 24, 32, 37, 41) पर लाने हेतु नाम में 'A' (+1) या 'E' (+5) का समावेश करें।`;
  }

  return `⚠️ आपका वर्तमान नाम **«${cleanName}»** (संयुक्त अंक ${currentCompound} → नामांक ${currentSingle}) मूलांक ${mulankNum} व भाग्यांक ${bhagyankNum} से पूर्ण सामंजस्य में नहीं है। कीरो/कॉल्डियन सूक्ष्म ध्वनि-स्पंदन गणित के अनुसार ये संशोधित स्पेलिंग विकल्प सर्वोत्तम हैं:\n${suggestions.join("\n")}`;
}

/**
 * Full Offline Deterministic Ank Jyotish (Numerology) Micro-Synthesis Engine
 */
export function synthesizeNumerologyVerdict(
  userQuery: string,
  kundali?: KundaliData | null,
  panchang?: VedicPanchangData | null
): UmaResponse {
  const q = (userQuery || "").trim();

  // Check if user has a saved Kundali in storage if none was passed
  const effectiveKundali = kundali || (typeof window !== "undefined" ? getSavedKundaliProfiles()[0] || null : null);

  // 1. Extract Name from query or effectiveKundali
  let personName = effectiveKundali?.name || "YAJAMAN";
  const nameMatch =
    q.match(/(?:मेरा\s+)?नाम[:\s-]+([A-Za-z\u0900-\u097F\s]{2,35}?)(?:,|है|जन्म|तिथि|मूलांक|\.|;|$)/i) ||
    q.match(/name[:\s-]+([A-Za-z\s]{2,35}?)(?:,|is|dob|birth|\.|;|$)/i) ||
    q.match(/\b([A-Z][a-z]+\s+[A-Z][a-z]+)\b/) ||
    q.match(/\b([A-Z]{3,}(?:\s+[A-Z]{2,})?)\b/);
  if (nameMatch && nameMatch[1]) {
    const candidate = nameMatch[1]
      .replace(/^(?:मेरा\s+|आपका\s+|जातक\s+|का\s+|नाम\s+)+/i, "")
      .trim();
    if (
      candidate.length >= 2 &&
      !/^(AM|PM|DOB|DL|MH|UP|MP|RJ|GJ|HR|UK|BIHAR|INDIA|JUPITER|MARS|SUN|MOON|VENUS|SATURN|MERCURY)$/i.test(candidate)
    ) {
      personName = candidate;
    }
  }

  // 2. Extract Birth Date (DD/MM/YYYY or DD-MM-YYYY or YYYY-MM-DD) from query or effectiveKundali
  let day = 28;
  let month = 10;
  let year = 1995;
  let hasExplicitDob = false;

  const dmyMatch = q.match(/\b(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})\b/);
  const ymdMatch = q.match(/\b(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})\b/);

  if (dmyMatch) {
    day = Math.min(31, Math.max(1, parseInt(dmyMatch[1], 10)));
    month = Math.min(12, Math.max(1, parseInt(dmyMatch[2], 10)));
    year = parseInt(dmyMatch[3], 10);
    hasExplicitDob = true;
  } else if (ymdMatch) {
    year = parseInt(ymdMatch[1], 10);
    month = Math.min(12, Math.max(1, parseInt(ymdMatch[2], 10)));
    day = Math.min(31, Math.max(1, parseInt(ymdMatch[3], 10)));
    hasExplicitDob = true;
  } else if (effectiveKundali?.birthDate) {
    const kd = new Date(effectiveKundali.birthDate);
    if (!isNaN(kd.getTime())) {
      day = kd.getDate();
      month = kd.getMonth() + 1;
      year = kd.getFullYear();
      hasExplicitDob = true;
    }
  } else if (panchang?.date) {
    const pd = new Date(panchang.date);
    if (!isNaN(pd.getTime())) {
      day = pd.getDate();
      month = pd.getMonth() + 1;
      year = pd.getFullYear();
    }
  }

  const explicitMulankMatch =
    q.match(/(?:मूलांक|mulank|moolank)\s*[:\-]?\s*([1-9१-९])/i) ||
    q.match(/अंक\s*([1-9१-९])\s*का/i);
  const explicitBhagyankMatch = q.match(/(?:भाग्यांक|bhagyank)\s*[:\-]?\s*([1-9१-९])/i);

  const parseHindiDigit = (str: string): number => {
    const map: Record<string, number> = {
      "१": 1, "२": 2, "३": 3, "४": 4, "५": 5, "६": 6, "७": 7, "८": 8, "९": 9,
      "1": 1, "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7, "8": 8, "9": 9,
    };
    return map[str] || parseInt(str, 10) || 1;
  };

  let mulankNum = calculateMulank(day);
  if (explicitMulankMatch && !hasExplicitDob) {
    mulankNum = parseHindiDigit(explicitMulankMatch[1]);
    day = mulankNum;
  }

  let bhagyankNum = calculateBhagyank(day, month, year);
  if (explicitBhagyankMatch) {
    bhagyankNum = parseHindiDigit(explicitBhagyankMatch[1]);
  }

  const gender: "male" | "female" = /स्त्री|महिला|लड़की|female|woman|girl/i.test(q) ? "female" : "male";

  // Core Numerology Calculations
  const mulank = NUMBER_DATA[mulankNum] || NUMBER_DATA[1];
  const bhagyank = NUMBER_DATA[bhagyankNum] || NUMBER_DATA[1];
  const chaldean = calculateNamank(personName, "chaldean");
  const pythagorean = calculateNamank(personName, "pythagorean");
  const letterBreakdown = buildLetterByLetterBreakdown(personName);
  const compoundVib = getCompoundVibrationDetail(chaldean.compound);
  const namankInfo = NUMBER_DATA[chaldean.single] || NUMBER_DATA[1];
  const kuaNum = calculateKuaNumber(year, gender);
  const kuaInfo = NUMBER_DATA[kuaNum] || NUMBER_DATA[1];

  const refDate = panchang?.date || new Date();
  const currentYear = refDate.getFullYear();
  const currentMonth = refDate.getMonth() + 1;
  const currentDayOfMonth = refDate.getDate();

  // 3-Tier Time Cycles: Personal Year, Personal Month, Personal Day
  const personalYear = calculatePersonalYear(day, month, currentYear);
  const personalMonthNum = reduceToSingleDigit(personalYear.yearNum + currentMonth);
  const personalDayNum = reduceToSingleDigit(personalMonthNum + currentDayOfMonth);
  const pMonthData = NUMBER_DATA[personalMonthNum] || NUMBER_DATA[1];
  const pDayData = NUMBER_DATA[personalDayNum] || NUMBER_DATA[1];

  // 4 Life Pinnacle Cycles (शिखर चक्र व भाग्योदय आयु काल)
  const monthSingle = reduceToSingleDigit(month);
  const yearSingle = reduceToSingleDigit(year);
  const p1EndAge = 36 - bhagyankNum;
  const p2EndAge = p1EndAge + 9;
  const p3EndAge = p2EndAge + 9;
  const pinnacle1 = reduceToSingleDigit(mulankNum + monthSingle);
  const pinnacle2 = reduceToSingleDigit(mulankNum + yearSingle);
  const pinnacle3 = reduceToSingleDigit(pinnacle1 + pinnacle2);
  const pinnacle4 = reduceToSingleDigit(monthSingle + yearSingle);

  const challenge1 = Math.abs(mulankNum - monthSingle) || 1;
  const challenge2 = Math.abs(mulankNum - yearSingle) || 2;
  const mainChallenge = Math.abs(challenge1 - challenge2) || 1;

  // Lo Shu 8-Plane Micro-Matrix
  const loshu = calculateLoshuGrid(day, month, year);
  const planeDefs = [
    { name: "बौद्धिक/मानसिक तल (Mental Plane)", nums: [4, 9, 2] },
    { name: "भावनात्मक/आध्यात्मिक तल (Emotional Plane)", nums: [3, 5, 7] },
    { name: "व्यावहारिक/भौतिक तल (Practical Plane)", nums: [8, 1, 6] },
    { name: "विचार/योजना तल (Thought Plane)", nums: [4, 3, 8] },
    { name: "दृढ़ इच्छाशक्ति तल (Will Plane)", nums: [9, 5, 1] },
    { name: "कर्म/तत्परता तल (Action Plane)", nums: [2, 7, 6] },
    { name: "स्वर्ण राजयोग (Golden Raj Yoga)", nums: [4, 5, 6] },
    { name: "रजत/पृथ्वी राजयोग (Silver Raj Yoga)", nums: [2, 5, 8] },
  ];

  const planePercentLines = planeDefs
    .map((pl) => {
      const presentCount = pl.nums.filter((n) => (loshu.counts[n] || 0) > 0).length;
      const pct = Math.round((presentCount / 3) * 100);
      return `  - **${pl.name} (${pl.nums.join("-")}):** **${pct}% सक्रिय** (${presentCount}/3 अंक उपस्थित)`;
    })
    .join("\n");

  // Extract Mobile or Vehicle Number from query for Pair-by-Pair Micro-Scan
  const mobileMatch = q.match(/(?:मोबाइल(?:\s*नंबर)?[:\s-]*)?(\b[6-9]\d{9}\b)/);
  const vehicleMatch = q.match(/\b([A-Z]{2}\s*\d{1,2}\s*[A-Z]{1,3}\s*\d{4})\b/i);

  let mobileSection = "";
  if (mobileMatch) {
    const mStr = mobileMatch[1];
    let mSum = 0;
    for (const ch of mStr) mSum += parseInt(ch, 10) || 0;
    const mSingle = reduceToSingleDigit(mSum);
    const mData = NUMBER_DATA[mSingle] || NUMBER_DATA[1];
    const mFriendly = mulank.friendlyNumbers.includes(mSingle) || bhagyank.friendlyNumbers.includes(mSingle);
    const pairAnalysis = analyzeDigitPairsMicro(mStr);

    mobileSection =
      `\n• **📱 मोबाइल नंबर सूक्ष्म अंक-युग्म स्कैन (${mStr}):**\n` +
      `  - **कुल संयुक्त योग:** **${mSum} → एकल अंक ${mSingle}** (${mData.planet}) | अंतिम ४ अंक योग: **${pairAnalysis.last4Compound} → ${pairAnalysis.last4Single}**\n` +
      `  - **अंक-युग्म श्रृंखला (Digit Pairs):** ${pairAnalysis.pairsStr}\n` +
      `  - **शुभ धन/राजयोग युग्म:** ${pairAnalysis.shubhPairs.length ? pairAnalysis.shubhPairs.join(", ") : "सामान्य युग्म"}\n` +
      `  - **सावधानी/संघर्ष युग्म:** ${pairAnalysis.cautionPairs.length ? pairAnalysis.cautionPairs.join(", ") : "कोई अशुभ युग्म नहीं ✓"}\n` +
      `  - **निर्णय:** यह मोबाइल नंबर आपके मूलांक ${mulankNum} व भाग्यांक ${bhagyankNum} के लिए **${
        mFriendly && pairAnalysis.cautionPairs.length === 0
          ? "सर्वोत्तम, धन-आकर्षक व भाग्योदयकारी ✓"
          : mFriendly
          ? "कुल योग शुभ है किंतु आंतरिक युग्मों के संतुलन हेतु फोन के पीछे लाल/पीले रंग से अपना कुआं अंक (" + kuaNum + ") लिखें"
          : "संघर्षकारी ⚠️ — मित्र अंक (" + mulank.friendlyNumbers.join(", ") + ") के कुल योग व 19/37/56/65 युग्म वाला नंबर लें"
      }**।`;
  }

  let vehicleSection = "";
  if (vehicleMatch) {
    const vStr = vehicleMatch[1].toUpperCase();
    const cleaned = vStr.replace(/[^A-Z0-9]/g, "");
    let vSum = 0;
    for (const ch of cleaned) {
      if (/[0-9]/.test(ch)) vSum += parseInt(ch, 10);
      else vSum += calculateNamank(ch, "chaldean").single;
    }
    const vSingle = reduceToSingleDigit(vSum);
    const vData = NUMBER_DATA[vSingle] || NUMBER_DATA[1];
    const vFriendly = mulank.friendlyNumbers.includes(vSingle) || bhagyank.friendlyNumbers.includes(vSingle);
    const vPairs = analyzeDigitPairsMicro(vStr);

    vehicleSection =
      `\n• **🚗 वाहन नंबर सूक्ष्म परीक्षण (${vStr}):**\n` +
      `  - **अक्षर+अंक संयुक्त योग:** **${vSum} → वाहन मूलांक ${vSingle}** (${vData.planet}) | अंतिम ४ अंक (${vStr.slice(-4)}) योग: **${vPairs.last4Compound} → ${vPairs.last4Single}**\n` +
      `  - **निर्णय:** यह वाहन अंक आपके लिए **${
        vFriendly && vSingle !== 8
          ? "सुरक्षित, मंगलमय व समृद्धिदायक ✓"
          : "सामान्य/सतर्कता अपेक्षित ⚠️ (वाहन में तांबे का स्वस्तिक या मारुति यंत्र स्थापित करें)"
      }** है।`;
  }

  // Mulank-Bhagyank relationship
  const isDriverConductorFriendly =
    mulank.friendlyNumbers.includes(bhagyankNum) ||
    bhagyank.friendlyNumbers.includes(mulankNum) ||
    mulankNum === bhagyankNum;
  const isDriverConductorEnemy =
    mulank.enemyNumbers.includes(bhagyankNum) || bhagyank.enemyNumbers.includes(mulankNum);

  const synergyScore = isDriverConductorFriendly ? 94 : isDriverConductorEnemy ? 74 : 84;
  const synergyVerdict = isDriverConductorFriendly
    ? `आपका **मूलांक ${mulankNum} (${mulank.planet.split(" ")[0]})** और **भाग्यांक ${bhagyankNum} (${bhagyank.planet.split(" ")[0]})** परस्पर **परम मित्र (${synergyScore}% सामंजस्य)** हैं! यह संयोग जीवन में उच्च पद, तीव्र भाग्योदय, स्थायी कोष और नेतृत्व प्रदान करता है।`
    : isDriverConductorEnemy
    ? `आपका **मूलांक ${mulankNum} (${mulank.planet.split(" ")[0]})** और **भाग्यांक ${bhagyankNum} (${bhagyank.planet.split(" ")[0]})** में ग्रहीय द्वंद्व (${synergyScore}% सामंजस्य) है, जिससे ३२-३५ वर्ष की आयु तक संघर्ष के बाद बड़ी सफलता मिलती है। नामांक व मित्र सेतु अंक (**${mulank.friendlyNumbers.join(", ")}**) से यह दोष पूर्णतः शांत हो जाता है।`
    : `आपका **मूलांक ${mulankNum} (${mulank.planet.split(" ")[0]})** और **भाग्यांक ${bhagyankNum} (${bhagyank.planet.split(" ")[0]})** परस्पर **सम व संतुलित (${synergyScore}% सामंजस्य)** हैं। सही नामांक स्पेलिंग से आपको स्थिर उन्नति व ऐश्वर्य की प्राप्ति होगी।`;

  const presentNumsStr = [1, 2, 3, 4, 5, 6, 7, 8, 9]
    .filter((n) => (loshu.counts[n] || 0) > 0)
    .map((n) => `**${n}** (x${loshu.counts[n]} — ${loshu.counts[n] >= 3 ? "अति-आवृत्ति/प्रबल" : loshu.counts[n] === 2 ? "द्विगुणित बल" : "संतुलित"})`)
    .join(", ");

  const missingRemediesList = loshu.missingNumbers
    .slice(0, 5)
    .map((m) => {
      const rem = MISSING_NUMBER_REMEDIES[m];
      return rem ? `  - **${rem.title}:** ${rem.remedies[0]}` : "";
    })
    .filter(Boolean)
    .join("\n");

  const spellingAdvice = buildNameSpellingSuggestions(
    personName,
    chaldean.compound,
    chaldean.single,
    mulank.friendlyNumbers,
    mulankNum,
    bhagyankNum
  );

  const dobLabel = `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}/${year}`;
  const dobDigitsMath = `${String(day).padStart(2, "0").split("").join("+")}+${String(month).padStart(2, "0").split("").join("+")}+${String(year).split("").join("+")}`;

  const text = `॥ ॐ श्री गणेशाय नमः • सूक्ष्म वैदिक एवं कॉल्डियन अंक-शास्त्र निर्णय ॥

**१. त्वरित सूक्ष्म अंक फलादेश (Executive Micro-Numerology Verdict)**
कल्याणमस्तु यजमान **${personName}** जी! जन्म तिथि **${dobLabel}** के सूक्ष्म अंक-गणित के अनुसार आपका **मूलांक (Driver) ${mulankNum}** तथा **भाग्यांक (Conductor) ${bhagyankNum}** (${dobDigitsMath} → ${bhagyankNum}) है। ${synergyVerdict}

**२. अक्षर-दर-अक्षर नामांक स्पंदन एवं चतुर्मुखी अंक-गणित (Micro Core Math)**
• **मूलांक (Driver): अंक ${mulankNum}** (${ day } → ${mulankNum}) — स्वामी: **${mulank.planet}** | देवता: ${mulank.deity} | तत्व: ${mulank.element}
  *मूल शक्ति:* ${mulank.nature}
• **भाग्यांक (Conductor): अंक ${bhagyankNum}** (${dobDigitsMath} → ${bhagyankNum}) — स्वामी: **${bhagyank.planet}** | देवता: ${bhagyank.deity}
  *प्रारब्ध दिशा:* ${bhagyank.nature}
• **कॉल्डियन (Chaldean) अक्षर-गणित («${personName.toUpperCase()}»):**
  - *सूत्र:* \`${letterBreakdown.chaldeanFormula}\` = **संयुक्त अंक ${chaldean.compound} → एकल नामांक ${chaldean.single}** (${namankInfo.planet.split(" ")[0]})
  - *संयुक्त अंक ${chaldean.compound} का गुप्त स्पंदन:* **${compoundVib.title} (${compoundVib.nature})** — ${compoundVib.desc}
• **पाइथागोरियन (Pythagorean) अक्षर-गणित:**
  - *सूत्र:* \`${letterBreakdown.pythagoreanFormula}\` = **संयुक्त अंक ${pythagorean.compound} → एकल अंक ${pythagorean.single}**
• **लो-शू कुआं एंजेल अंक (Kua Number): अंक ${kuaNum}** (${kuaInfo.planet.split(" ")[0]}) — बाएं हाथ की कलाई पर हरे/नीले पेन से प्रतिदिन **${kuaNum}** लिखें।${mobileSection}${vehicleSection}

**३. लो-शू ग्रिड (3x3) अष्ट-तल प्रतिशत एवं राजयोग सूक्ष्म मैट्रिक्स**
• **ग्रिड में उपस्थित अंक व आवृत्ति भार:** ${presentNumsStr || mulankNum}
• **अनुपस्थित (Missing) अंक:** **${loshu.missingNumbers.length > 0 ? loshu.missingNumbers.join(", ") : "कोई नहीं (१००% पूर्ण ग्रिड)"}**
• **लो-शू के ८ तलों (8 Planes) की सक्रियता प्रतिशत:**
${planePercentLines}

**४. त्रि-स्तरीय काल-चक्र (वर्ष-मास-दिवस) एवं ४ जीवन शिखर (Pinnacles)**
• **व्यक्तिगत वर्ष ${currentYear} (Personal Year):** **अंक ${personalYear.yearNum}** (*${personalYear.theme}*) — ${personalYear.advice}
• **वर्तमान व्यक्तिगत मास (Personal Month ${currentMonth}/${currentYear}):** **अंक ${personalMonthNum}** (${pMonthData.planet.split(" ")[0]} प्रभाव) | **आज का व्यक्तिगत दिवस (Personal Day):** **अंक ${personalDayNum}** (${pDayData.planet.split(" ")[0]} प्रभाव)
• **जीवन के ४ महा-शिखर चक्र (4 Life Pinnacles & Breakthrough Ages):**
  १. *प्रथम शिखर (आयु 0 से ${p1EndAge} वर्ष):* **शिखर अंक ${pinnacle1}** (${NUMBER_DATA[pinnacle1]?.planet.split(" ")[0]}) | चुनौती अंक: ${challenge1}
  २. *द्वितीय शिखर (आयु ${p1EndAge + 1} से ${p2EndAge} वर्ष):* **शिखर अंक ${pinnacle2}** (${NUMBER_DATA[pinnacle2]?.planet.split(" ")[0]}) — **मुख्य करियर व धन विस्तार काल** | चुनौती अंक: ${challenge2}
  ३. *तृतीय सर्वोच्च शिखर (आयु ${p2EndAge + 1} से ${p3EndAge} वर्ष):* **शिखर अंक ${pinnacle3}** (${NUMBER_DATA[pinnacle3]?.planet.split(" ")[0]}) — **स्वर्णिम संपत्ति व प्रतिष्ठा काल** | मुख्य चुनौती: ${mainChallenge}
  ४. *चतुर्थ शिखर (आयु ${p3EndAge + 1} वर्ष से आजीवन):* **शिखर अंक ${pinnacle4}** (${NUMBER_DATA[pinnacle4]?.planet.split(" ")[0]}) — स्थायी ऐश्वर्य व आध्यात्मिक नेतृत्व
• **सर्वोत्तम करियर/व्यापार क्षेत्र:** ${Array.from(new Set([...mulank.careers, ...bhagyank.careers])).slice(0, 8).join(", ")}।
• **शुभ मित्र अंक:** **${mulank.friendlyNumbers.join(", ")}** | **शुभ तिथियां:** **${mulank.luckyDates.join(", ")}** | **शुभ वार:** ${mulank.luckyDays.join(", ")} | **शुभ रंग:** ${mulank.luckyColors.join(", ")}

**५. नाम स्पेलिंग सुधार, ६-सूत्रीय अंक-पर्ची एवं अचूक उपाय**
• **नामांक स्पेलिंग परीक्षण:**
${spellingAdvice}
• **भाग्य रत्न व रुद्राक्ष:** मुख्य रत्न: **${mulank.luckyGem}** (भाग्यांक सहायक रत्न: ${bhagyank.luckyGem}) | रुद्राक्ष: **${mulank.rudraksha}**
• **सूर्य-जल रंग चिकित्सा:** ${mulank.waterBottleColor} में पेयजल भरकर धूप में चार्ज कर नित्य पिएं।
• **सिद्ध अंक मंत्र जप:** *${mulank.mantra}* (नित्य ${mulank.japaCount})
${missingRemediesList ? `• **अनुपस्थित अंकों (${loshu.missingNumbers.slice(0, 5).join(", ")}) को जागृत करने के उपाय:**\n${missingRemediesList}\n` : ""}
📋 **पारंपरिक अंक-ज्योतिष उपाय पर्ची (६-सूत्रीय विधान):**
॥ श्री ॥
श्री **${personName}** जी (मूलांक ${mulankNum} • भाग्यांक ${bhagyankNum} • नामांक ${chaldean.single})
① **${mulank.luckyGem.split("(")[0].trim()}** + **${bhagyank.luckyGem.split("(")[0].trim()}** रत्न अथवा **${mulank.rudraksha}** धारण करें।
② **${mulank.luckyDays[0] || "गुरुवार"}** का सात्विक उपवास एवं शुभ रंग (**${mulank.luckyColors.slice(0, 2).join(", ")}**) का प्रयोग करें।
③ प्रतिदिन **${mulank.mantra}** का **${mulank.japaCount}** जप करें।
④ बाएं हाथ की कलाई पर प्रतिदिन हरे/नीले पेन से अपना **कुआं एंजेल अंक (${kuaNum})** लिखें।
⑤ गाय और कुत्ते को रोटी खिलावें तथा ${mulank.waterBottleColor} का सूर्य-चार्ज जल पिएं।
⑥ लो-शू अनुपस्थित अंक (**${loshu.missingNumbers.slice(0, 3).join(", ") || "5"}**) संतुलन एवं नामांक स्पेलिंग (**संयुक्त अंक ${chaldean.compound}**) सिद्ध करें।
                                          ॥ शुभम् ॥

---
[अगले प्रश्न]:
• मेरे नाम (${personName}) की स्पेलिंग और हस्ताक्षर को संयुक्त अंक 19, 23 या 24 पर कैसे सेट करें?
• मेरे मोबाइल नंबर और वाहन नंबर के अंक-युग्म (Digit Pairs) मेरे मूलांक ${mulankNum} के लिए कैसे हैं?
• मेरे लो-शू ग्रिड के अनुपस्थित अंकों (${loshu.missingNumbers.slice(0, 3).join(", ") || "5"}) के लिए कौन सा क्रिस्टल या ब्रेसलेट धारण करें?`;

  return {
    ok: true,
    source: "local_vedic",
    text,
    actionPayload: {
      type: "open_numerology",
      label: "अंक ज्योतिष व लो-शू चक्र खोलें",
    },
  };
}

/**
 * Offline Live Choghadiya, Rahukal, Muhurat & Dishashool Synthesis
 */
function synthesizeLiveMuhuratPanchangVerdict(
  query: string,
  panchang?: VedicPanchangData | null
): UmaResponse {
  const q = query.toLowerCase();
  const now = panchang?.date || new Date();
  const weekdayNum = now.getDay();
  const fmt = (d: Date) =>
    d.toLocaleTimeString("hi-IN", { hour: "2-digit", minute: "2-digit" });

  const solar = panchang?.solar || {
    sunrise: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 6, 15),
    sunset: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 18, 15),
    nextSunrise: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 6, 15),
    solarNoon: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 15),
  };

  const dayChog = getDayChoghadiya(solar, weekdayNum);
  const currentChogInfo = getCurrentChoghadiya(dayChog, new Date());
  const inauspicious = getInauspiciousWindows(solar, weekdayNum);
  const auspicious = getAuspiciousWindows(solar);

  const rahu = inauspicious.find((w) => w.title === "राहु काल");
  const yama = inauspicious.find((w) => w.title.includes("यमगण्ड"));
  const gulika = inauspicious.find((w) => w.title.includes("गुलिक"));
  const abhijit = auspicious.find((w) => w.title.includes("अभिजित"));
  const brahma = auspicious.find((w) => w.title.includes("ब्रह्म"));

  const shubhChogs = dayChog
    .filter((c) => c.nature === "auspicious" || c.nature === "neutral")
    .map((c) => `• **${c.hindiName} चौघड़िया (${c.nature === "auspicious" ? "शुभ" : "चर/सामान्य"}):** ${fmt(c.start)} से ${fmt(c.end)} — *${c.meaning}*`)
    .join("\n");

  const dishaDir = DISHASHOOL_MAP[weekdayNum] || "पूर्व";
  const dishaRemedy = TRAVEL_REMEDIES[weekdayNum] || "दही या धनिया खाकर प्रस्थान करें।";

  const wDay = panchang?.weekday || "आज";
  const paksha = panchang?.paksha || "शुक्ल";
  const tithi = panchang?.tithi || "शुभ तिथि";
  const nakshatra = panchang?.nakshatra || "शुभ नक्षत्र";
  const yoga = panchang?.yoga || "सिद्ध";
  const karana = panchang?.karana || "बव";
  const moonRashi = panchang?.lunarRashi || "शुभ राशि";

  const isYatra = /यात्रा|दिशाशूल|प्रस्थान|दिशा/.test(q);
  const isChoghadiya = /चौघड़िया|राहुकाल|अभिजित|मुहूर्त/.test(q);

  const text = `॥ ॐ सूर्याय नमः • वैदिक पंचांग, चौघड़िया एवं मुहूर्त सूक्ष्म निर्णय ॥

**१. त्वरित मुहूर्त निष्कर्ष (Executive Verdict)**
प्रणाम यजमान! आज **${wDay}** (${now.toLocaleDateString("hi-IN")}), **${paksha} पक्ष** की **${tithi}** तिथि एवं **${nakshatra}** नक्षत्र है। ${
    currentChogInfo.current
      ? `इस समय **${currentChogInfo.current.hindiName} चौघड़िया** (${fmt(currentChogInfo.current.start)} – ${fmt(currentChogInfo.current.end)}) चल रहा है, जो **${currentChogInfo.current.meaning}** के लिए जाना जाता है।`
      : `आज का अभिजित मुहूर्त ${abhijit ? `${fmt(abhijit.start)} से ${fmt(abhijit.end)}` : "मध्याह्न काल"} में सर्वश्रेष्ठ है।`
  }

**२. आज के पंचांग के ५ अंग एवं सूर्योदय गणित**
• **तिथि:** ${paksha} पक्ष, ${tithi} | **वार:** ${wDay}
• **नक्षत्र:** ${nakshatra} | **योग:** ${yoga} | **करण:** ${karana}
• **चंद्र राशि:** ${moonRashi} | **संवत्:** ${panchang?.samvat || "विक्रम संवत् २०८३"}
• **सूर्योदय:** ${fmt(solar.sunrise)} | **सूर्यास्त:** ${fmt(solar.sunset)}

**३. आज के श्रेष्ठ शुभ मुहूर्त एवं चौघड़िया (Auspicious Windows)**
• **अभिजित मुहूर्त (सर्वश्रेष्ठ):** ${abhijit ? `${fmt(abhijit.start)} से ${fmt(abhijit.end)}` : "11:48 AM से 12:36 PM"}
• **ब्रह्म मुहूर्त:** ${brahma ? `${fmt(brahma.start)} से ${fmt(brahma.end)}` : "प्रातः 04:30 से 05:18"}
${shubhChogs}

**४. त्याज्य अशुभ काल (राहुकाल व यमगण्ड — नया कार्य वर्जित)**
• **राहु काल:** **${rahu ? `${fmt(rahu.start)} से ${fmt(rahu.end)}` : "दोपहर काल"}** *(इस समय नया समझौता, यात्रा या निवेश न करें)*
• **यमगण्ड काल:** ${yama ? `${fmt(yama.start)} से ${fmt(yama.end)}` : "प्रभावी"}
• **गुलिक काल:** ${gulika ? `${fmt(gulika.start)} से ${fmt(gulika.end)}` : "प्रभावी"}

**५. यात्रा दिशाशूल एवं सात्विक परिहार**
• **आज का दिशाशूल:** आज **${wDay}** को **${dishaDir}** दिशा में दिशाशूल रहता है।
• **शास्त्रीय परिहार उपाय:** यदि ${dishaDir} दिशा में यात्रा अपरिहार्य हो, तो **${dishaRemedy}** तथा *"ॐ गं गणपतये नमः"* का ११ बार जप कर पहले ५ कदम विपरीत दिशा में चलकर प्रस्थान करें।

---
[अगले प्रश्न]:
• आज नया व्यापार, वाहन क्रय या शुभ कार्य किस चौघड़िया में करें?
• मेरे मूलांक व भाग्यांक के अनुसार आज का व्यक्तिगत दिवस कैसा रहेगा?
• मेरी जन्म कुंडली के अनुसार आज का तारा बल और चंद्र बल कैसा है?`;

  return {
    ok: true,
    source: "local_vedic",
    text,
    actionPayload: isYatra
      ? { type: "open_yatra", label: "यात्रा व दिशाशूल चक्र देखें" }
      : isChoghadiya
      ? { type: "open_choghadiya", label: "आज का चौघड़िया चक्र देखें" }
      : { type: "open_panchang", label: "सम्पूर्ण पंचांग देखें" },
  };
}

/**
 * Offline Vastu, Palmistry (Hastrekha) & Gemology (Ratna/Rudraksha) Synthesis
 */
function synthesizeSpecializedShastraVerdict(
  query: string,
  kundali?: KundaliData | null
): UmaResponse | null {
  const q = query.toLowerCase();

  // 1. VASTU SHASTRA
  if (/वास्तु|ईशान|आग्नेय|नैऋत्य|वायव्य|रसोई|तिजोरी|मुख्य द्वार|बेडरूम|शयनकक्ष|पूजा घर|vastu/.test(q)) {
    return {
      ok: true,
      source: "local_vedic",
      text: `॥ ॐ वास्तुपुरुषायाय नमः • विश्वकर्मा प्रकाश एवं मयमतम् वास्तु सूक्ष्म निर्णय ॥

**१. त्वरित वास्तु फलादेश (Executive Vastu Takeaway)**
प्रणाम यजमान! बिना तोड़-फोड़ के वैदिक पंचतत्व (जल, अग्नि, पृथ्वी, वायु, आकाश) एवं १६ महावास्तु ज़ोन के संतुलन से घर व कार्यस्थल का वास्तु दोष १००% शांत किया जा सकता है।

**२. अष्ट-दिशा एवं पंचतत्व सूक्ष्म गणित**
• **ईशान कोण (North-East 0°–45° — जल व देवगुरु बृहस्पति तत्व):** यह वास्तु पुरुष का शिरोभाग (मस्तिष्क) है। यहाँ मंदिर, जल पात्र, ध्यान कक्ष रखें। यहाँ भारी सामान, सीढ़ियां या शौचालय होने पर न्यूरो/आर्थिक बाधा आती है (निवारण: समुद्री नमक व स्फटिक श्रीयंत्र)।
• **आग्नेय कोण (South-East 112.5°–157.5° — अग्नि व शुक्र तत्व):** यहाँ रसोईघर (पूर्व मुखी होकर भोजन बनाना) एवं विद्युत उपकरण सर्वोत्तम फल देते हैं; इससे नकद धन प्रवाह (Cash Flow) बना रहता है।
• **नैऋत्य कोण (South-West 202.5°–247.5° — पृथ्वी व राहु/शनि तत्व):** यह गृहस्वामी के शयनकक्ष (Master Bedroom) व भारी अलमारी के लिए सर्वश्रेष्ठ है; इससे नेतृत्व, स्थिरता व बचत बढ़ती है।
• **उत्तर एवं कुबेर स्थान (North 337.5°–22.5° — बुध व कुबेर):** तिजोरी का पृष्ठ भाग दक्षिण दीवार से सटा हो और उसका मुख **उत्तर** (कुबेर) या **पूर्व** (इंद्र) दिशा की ओर खुले।

**३. बिना तोड़-फोड़ के ५ अचूक सात्विक वास्तु उपाय**
१. **मुख्य द्वार ऊर्जा (द्वार वेध निवारण):** मुख्य द्वार के दोनों ओर अष्टगंध/सिंदूर से **स्वस्तिक (卐)** बनाएं और ऊपर पंचमुखी हनुमान जी स्थापित करें।
२. **नकारात्मक ऊर्जा हरण:** घर के पोंछे के पानी में गुरुवार को छोड़कर एक चुटकी **सेंधा नमक (Rock Salt)** व फिटकरी मिलाएं।
३. **ईशान कोण शुद्धि:** ईशान कोण में कांच या तांबे के पात्र में स्वच्छ जल व गुलाब की पंखुड़ियां रखें तथा प्रतिदिन बदलें।
४. **कुबेर कोष पोटली:** तिजोरी में लाल वस्त्र में ५ गोमती चक्र, ११ पीली कौड़ियां, १ चांदी का सिक्का और साबुत हल्दी की गांठ बांधकर रखें।
५. **सायंकाल धूप-दीप:** नित्य संध्या में भीमसेनी कपूर और २ लौंग जलाकर पूरे घर में आरती की ध्वनि करें।

---
[अगले प्रश्न]:
• धन वृद्धि और कर्ज मुक्ति के लिए तिजोरी व लॉकर किस कोण में रखें?
• मेरे मूलांक व कुआं अंक के अनुसार मेरी सबसे शुभ दिशा कौन सी है?
• मेरी कुंडली के चतुर्थ भाव (D-4) के अनुसार भूमि व मकान बनने का योग कब है?`,
      actionPayload: { type: "open_vastu", label: "वास्तु शास्त्र अध्याय खोलें" },
    };
  }

  // 2. PALMISTRY / SAMUDRIK SHASTRA
  if (/हस्तरेखा|हथेली|जीवन रेखा|हृदय रेखा|मस्तिष्क रेखा|भाग्य रेखा|विवाह रेखा|सूर्य रेखा|मणिबंध|पर्वत|सामुद्रिक|palmistry|palm line|life line|fate line/.test(q)) {
    return {
      ok: true,
      source: "local_vedic",
      text: `॥ ॐ सामुद्रिक शास्त्राय नमः • नारद एवं गरुड़ पुराणोक्त हस्तरेखा सूक्ष्म निर्णय ॥

**१. त्वरित हस्तरेखा निष्कर्ष (Samudrik Verdict)**
यजमान! सामुद्रिक शास्त्र के अनुसार बायां हाथ आपके जन्मजात प्रारब्ध (D-1) और दायां/सक्रिय हाथ आपके वर्तमान पुरुषार्थ व कर्म (D-9/D-10) का दर्पण है।

**२. प्रमुख रेखाओं, ग्रह पर्वतों एवं धन कोठरी का सूक्ष्म गणित**
• **जीवन रेखा (Life Line — शुक्र पर्वत को घेरती हुई):** यदि यह गहरी, गुलाबी और बिना द्वीप/कटाव के हो, तो ८०+ वर्ष की दीर्घायु, प्रबल रोग-प्रतिरोधक क्षमता और अचल संपत्ति देती है।
• **भाग्य/शनि रेखा (Fate Line — मणिबंध से मध्यमा उंगली तक):** मणिबंध या चंद्र पर्वत से निकलकर शनि पर्वत तक जाने वाली स्पष्ट रेखा २८, ३२ या ३५ वर्ष की आयु के बाद प्रचंड भाग्योदय व स्थायी धन दर्शाती है।
• **धन की कोठरी (Money Triangle — राहु क्षेत्र):** मस्तिष्क रेखा, भाग्य रेखा और बुध रेखा से मिलकर हथेली के मध्य में बनने वाला बंद त्रिभुज करोड़पति कोष व अटूट संचित धन का लक्षण है।
• **सूर्य रेखा (Apollo Line — अनामिका के नीचे):** यह रेखा राजकीय सम्मान, उच्च प्रशासनिक पद, ख्याति और यश दिलाती है।
• **M-चिह्न, मत्स्य चिह्न व गज-लक्ष्मी योग:** हथेली में स्पष्ट 'M' का निशान या केतु/मणिबंध के पास मछली (Fish) का चिह्न आकस्मिक धन लाभ व स्वअर्जित साम्राज्य का राजयोग है।

**३. हस्त-पर्वत जागृत करने के वैदिक उपाय**
१. **प्रातः कर-दर्शन:** सुबह जागते ही दोनों हथेलियां मिलाकर दर्शन करें — *"कराग्रे वसते लक्ष्मीः करमध्ये सरस्वती। करमूले तु गोविन्दः प्रभाते करदर्शनम्॥"*
२. **गुरु व सूर्य पर्वत बल:** नित्य अनामिका उंगली से केसर/रक्त चंदन का तिलक मस्तक पर लगाएं।
३. **सात्विक दान:** अपने हाथों से गौ-ग्रास, पक्षियों को सप्तधान्य और अन्न दान करने से हथेली की राहु रेखाएं (आड़ी बाधा रेखाएं) निष्प्रभावी हो जाती हैं।

---
[अगले प्रश्न]:
• हथेली में धन की कोठरी (Money Triangle) और राजयोग चिह्न कैसे पहचानें?
• मेरी जन्म कुंडली और मूलांक के अनुसार मेरा भाग्य रत्न कौन सा है?
• मेरे नाम की स्पेलिंग और हस्ताक्षर को भाग्यशाली कैसे बनाएं?`,
      actionPayload: { type: "open_palmistry", label: "हस्तरेखा अध्याय खोलें" },
    };
  }

  // 3. GEMOLOGY / RATNA & RUDRAKSHA
  if (/रत्न|रुद्राक्ष|पुखराज|नीलम|माणिक्य|मोती|पन्ना|मूंगा|हीरा|ओपल|गोमेद|लहसुनिया|उपरत्न|कौन सा पत्थर|अंगूठी|gemstone|rudraksha/.test(q)) {
    const lagnaRashi = kundali?.lagnaRashi || "मेष";
    const moonRashi = kundali?.moonRashi || "वृषभ";
    const dasha = kundali?.mahadasha || "गुरु";
    const antar = kundali?.antardasha || "शुक्र";

    const LAGNA_GEM_MAP: Record<string, { lagnaGem: string; bhagyaGem: string; panchottarGem: string; avoid: string; rudraksha: string; metal: string; finger: string }> = {
      "मेष": { lagnaGem: "मूंगा (Red Coral - मंगल)", bhagyaGem: "पुखराज (Yellow Sapphire - गुरु)", panchottarGem: "माणिक्य (Ruby - सूर्य)", avoid: "पन्ना, हीरा व नीलम", rudraksha: "३ मुखी व ५ मुखी रुद्राक्ष", metal: "स्वर्ण या तांबा", finger: "अनामिका / तर्जनी" },
      "वृषभ": { lagnaGem: "हीरा / ओपल (Diamond/Opal - शुक्र)", bhagyaGem: "नीलम (Blue Sapphire - शनि)", panchottarGem: "पन्ना (Emerald - बुध)", avoid: "पुखराज, मूंगा व मोती", rudraksha: "६ मुखी व ७ मुखी रुद्राक्ष", metal: "चांदी या प्लैटिनम", finger: "मध्यमा / कनिष्ठा" },
      "मिथुन": { lagnaGem: "पन्ना (Emerald - बुध)", bhagyaGem: "नीलम (Blue Sapphire - शनि)", panchottarGem: "हीरा / ओपल (शुक्र)", avoid: "मूंगा व माणिक्य", rudraksha: "४ मुखी व ६ मुखी रुद्राक्ष", metal: "स्वर्ण या चांदी", finger: "कनिष्ठा / मध्यमा" },
      "कर्क": { lagnaGem: "मोती (Natural Pearl - चंद्र)", bhagyaGem: "पुखराज (Yellow Sapphire - गुरु)", panchottarGem: "मूंगा (Red Coral - मंगल)", avoid: "नीलम, हीरा व पन्ना", rudraksha: "२ मुखी व ३ मुखी रुद्राक्ष", metal: "चांदी या स्वर्ण", finger: "कनिष्ठा / तर्जनी" },
      "सिंह": { lagnaGem: "माणिक्य (Ruby - सूर्य)", bhagyaGem: "मूंगा (Red Coral - मंगल)", panchottarGem: "पुखराज (Yellow Sapphire - गुरु)", avoid: "नीलम व हीरा", rudraksha: "१ मुखी या १२ मुखी व ३ मुखी रुद्राक्ष", metal: "स्वर्ण या तांबा", finger: "अनामिका / तर्जनी" },
      "कन्या": { lagnaGem: "पन्ना (Emerald - बुध)", bhagyaGem: "हीरा / ओपल (शुक्र)", panchottarGem: "नीलम (शनि)", avoid: "मूंगा, मोती व माणिक्य", rudraksha: "४ मुखी व ६ मुखी रुद्राक्ष", metal: "स्वर्ण या चांदी", finger: "कनिष्ठा / मध्यमा" },
      "तुला": { lagnaGem: "हीरा / सफेद जरकन / ओपल (शुक्र)", bhagyaGem: "नीलम (Blue Sapphire - शनि)", panchottarGem: "पन्ना (Emerald - बुध)", avoid: "माणिक्य, मूंगा व पुखराज", rudraksha: "६ मुखी व ७ मुखी रुद्राक्ष", metal: "चांदी या पंचधातु", finger: "मध्यमा / कनिष्ठा" },
      "वृश्चिक": { lagnaGem: "मूंगा (Red Coral - मंगल)", bhagyaGem: "मोती (Pearl - चंद्र)", panchottarGem: "पुखराज (Yellow Sapphire - गुरु)", avoid: "पन्ना, हीरा व नीलम", rudraksha: "३ मुखी व ५ मुखी रुद्राक्ष", metal: "स्वर्ण, तांबा या चांदी", finger: "अनामिका / तर्जनी" },
      "धनु": { lagnaGem: "पुखराज (Yellow Sapphire - गुरु)", bhagyaGem: "माणिक्य (Ruby - सूर्य)", panchottarGem: "मूंगा (Red Coral - मंगल)", avoid: "हीरा, नीलम व पन्ना", rudraksha: "५ मुखी व १/१२ मुखी रुद्राक्ष", metal: "स्वर्ण या पीतल", finger: "तर्जनी / अनामिका" },
      "मकर": { lagnaGem: "नीलम (Blue Sapphire - शनि)", bhagyaGem: "पन्ना (Emerald - बुध)", panchottarGem: "हीरा / ओपल (शुक्र)", avoid: "माणिक्य, मोती व मूंगा", rudraksha: "७ मुखी व ६ मुखी रुद्राक्ष", metal: "पंचधातु या चांदी", finger: "मध्यमा / कनिष्ठा" },
      "कुंभ": { lagnaGem: "नीलम (Blue Sapphire - शनि)", bhagyaGem: "हीरा / ओपल (शुक्र)", panchottarGem: "पन्ना (Emerald - बुध)", avoid: "माणिक्य, मोती व मूंगा", rudraksha: "७ मुखी व ४ मुखी रुद्राक्ष", metal: "पंचधातु या चांदी", finger: "मध्यमा / कनिष्ठा" },
      "मीन": { lagnaGem: "पुखराज (Yellow Sapphire - गुरु)", bhagyaGem: "मूंगा (Red Coral - मंगल)", panchottarGem: "मोती (Pearl - चंद्र)", avoid: "पन्ना, हीरा व नीलम", rudraksha: "५ मुखी व २ मुखी रुद्राक्ष", metal: "स्वर्ण या चांदी", finger: "तर्जनी / अनामिका" },
    };

    const gInfo = LAGNA_GEM_MAP[lagnaRashi] || LAGNA_GEM_MAP["मेष"];

    return {
      ok: true,
      source: "local_vedic",
      text: `॥ ॐ रत्नेश्वराय नमः • त्रिकोण सिद्धांत आधारित रत्न एवं रुद्राक्ष सूक्ष्म निर्णय ॥

**१. त्वरित रत्न परामर्श (Executive Gemology Verdict)**
${
  kundali
    ? `यजमान **${kundali.name}** जी! आपकी **${lagnaRashi} लग्न** व **${moonRashi} राशि** (सक्रिय दशा: **${dasha}–${antar}**) के त्रिकोण (१-५-९ भाव) गणित के अनुसार आपके लिए **${gInfo.bhagyaGem}** और **${gInfo.lagnaGem}** सर्वोत्तम जीवन-रत्न हैं।`
    : `यजमान! वैदिक रत्न शास्त्र में सदैव लग्नेश (प्रथम भाव), पंचमेश (बुद्धि/इष्ट) और भाग्येश (नवम भाव) के रत्न ही धारण किए जाते हैं; षष्ठ, अष्टम व द्वादश (मारक/त्रिक) भाव के रत्न कभी नहीं पहने जाते।`
}

**२. आपके लिए शुभ रत्न, धातु, उंगली एवं रुद्राक्ष गणित (${lagnaRashi} लग्न आधार पर)**
• **लग्न रत्न (स्वास्थ्य, व्यक्तित्व व आत्मबल हेतु):** **${gInfo.lagnaGem}**
• **भाग्य रत्न (भाग्योदय, धन व करियर हेतु):** **${gInfo.bhagyaGem}**
• **पंचम/विद्या-इष्ट रत्न (प्रज्ञा व संतान सुख हेतु):** **${gInfo.panchottarGem}**
• **धारण धातु व उंगली:** धातु: **${gInfo.metal}** | उंगली: दाएं हाथ की **${gInfo.finger}**
• **सर्वश्रेष्ठ वैदिक रुद्राक्ष:** **${gInfo.rudraksha}** *(रुद्राक्ष का कोई दुष्प्रभाव नहीं होता और यह तुरंत सकारात्मक आभा मंडल बनाता है)*
• **❌ वर्जित रत्न (भूलकर भी न पहनें):** **${gInfo.avoid}**

**३. रत्न प्राण-प्रतिष्ठा एवं धारण विधि**
१. **रत्ती भार:** अपने शरीर के वजन के प्रति १० किलोग्राम पर १ रत्ती (उदा. ६० किलो वजन हेतु ६.२५ रत्ती) दोषरहित रत्न चुनें।
२. **पंचामृत अभिषेक:** धारण करने से पूर्व संबंधित ग्रह के वार को प्रातः शुक्ल पक्ष की होरा में कच्चे दूध, गंगाजल, शहद, घी व शक्कर (पंचामृत) से स्नान कराएं।
३. **मंत्र जाग्रति:** धूप-दीप दिखाकर संबंधित ग्रह के बीज मंत्र का १०८ बार जप करके दाएं हाथ की निर्दिष्ट उंगली में धारण करें।

---
[अगले प्रश्न]:
• मेरे मूलांक व भाग्यांक के अनुसार कौन सा रत्न और रुद्राक्ष शुभ है?
• मेरी कुंडली में वर्तमान महादशा (${dasha}–${antar}) के लिए कौन सा उपरत्न या जड़ी धारण करें?
• बिना रत्न खरीदे ग्रहों को बली करने की वैदिक औषधि व मंत्र विधान क्या है?`,
      actionPayload: { type: "open_gemology", label: "रत्न विज्ञान अध्याय खोलें" },
    };
  }

  // D. RAVAN SANHITA UPAY MODULE
  if (/रावण संहिता|ravan sanhita|बिल्व पत्र|पीली कौड़ी|गोमती चक्र|कमलगट्टा/.test(q)) {
    const salutation = kundali?.name ? `${kundali.name} जी` : "प्रिय यजमान";
    return {
      ok: true,
      source: "local_vedic",
      text: `जी ${salutation}, रावण संहिता और लोक-परंपरा के धन व समृद्धि उपायों में आपके प्रश्न के अनुसार आपकी ${lagnaRashi} लग्न और ${moonRashi} राशि (वर्तमान दशा: ${dasha}–${antar}) के लिए यह प्रयोग अत्यंत शुभ संकल्प वाला रहेगा।\n\nइसे करते समय सबसे मुख्य नियम यह है कि इसे शुक्ल पक्ष के निर्दिष्ट वार की प्रातःकालीन शुभ चौघड़िया (अमृत या शुभ वेला) में स्नान के बाद शांत और सात्विक मन से करें। भगवान शिव और माता महालक्ष्मी का स्मरण करते हुए अपना संकल्प स्पष्ट रखें, और इसके साथ अपने दैनिक कर्म व आर्थिक अनुशासन को भी सुदृढ़ बनाए रखें।\n\nहमारे ऐप के 'रावण संहिता महा-उपाय' अध्याय में धन-बरकत, व्यापार-वृद्धि, नौकरी उन्नति और कर्ज-मुक्ति के सभी १५ उपाय संपूर्ण सामग्री, विधि और सावधानी सहित उपलब्ध हैं।\n\n---\n[अगले प्रश्न]:\n• तिजोरी और व्यापार में बरकत के लिए मेरे लग्न के अनुसार सबसे शुभ दिन कौन सा है?\n• कर्ज-मुक्ति और धन संचय के लिए कौन सा दैनिक मंत्र सबसे प्रभावशाली है?\n• आज का शुभ चौघड़िया और अभिजीत मुहूर्त कब है?`,
      actionPayload: { type: "open_upay", label: "रावण संहिता महा-उपाय खोलें" },
    };
  }

  return null;
}

export async function askUma(params: AskUmaParams): Promise<AskUmaResponse> {
  const {
    query,
    panchang,
    activeKundali,
    panchangContext,
    kundaliContext,
    numerologyContext,
    forceNumerology,
    chatHistory,
    systemPrompt,
  } = params;

  const isNumQuery = Boolean(forceNumerology) || isNumerologyQuery(query);

  // For Numerology queries (or when user is in the Ank Jyotish tab), ALWAYS run the deterministic
  // Micro-Numerology Engine using the query + numerologyContext and NEVER jump to someone else's Kundali!
  if (isNumQuery) {
    const combinedNumQuery = numerologyContext
      ? `${numerologyContext}\nप्रश्न: ${query}`
      : query;
    const numRes = synthesizeNumerologyVerdict(combinedNumQuery, activeKundali, panchang);
    return {
      ok: true,
      text: numRes.text,
      source: "local_vedic",
      actionPayload: {
        type: "open_numerology",
        label: "अंक ज्योतिष व लो-शू चक्र देखें",
      },
    };
  }

  // Automatically pick up saved Kundali if activeKundali prop was not passed
  const effectiveKundali =
    activeKundali ||
    tryParseKundaliFromQuery(query) ||
    (typeof window !== "undefined" ? getSavedKundaliProfiles()[0] || null : null);

  // 1. ALWAYS compute our 100% deterministic Sookshma Ganit (Micro-Calculation) response first!
  const localRes = await generateUma({ query, kundali: effectiveKundali, panchang });

  // Build automatic numerology + micro-astrology context for online Gemini AI
  let autoNumerologyCtx = numerologyContext || "";
  if (!autoNumerologyCtx && effectiveKundali) {
    const localNum = synthesizeNumerologyVerdict(query, effectiveKundali, panchang);
    autoNumerologyCtx = `\n[अंक ज्योतिष सूक्ष्म गणना]:\n${localNum.text}`;
  }

  const microKundaliCtx =
    kundaliContext || (effectiveKundali ? buildMicroAstrologyContextPrompt(effectiveKundali, panchang) : "");
  const combinedKundaliContext = [microKundaliCtx, autoNumerologyCtx, `\n[शास्त्रीय सूक्ष्म गणना संदर्भ]:\n${localRes.text}`]
    .filter(Boolean)
    .join("\n\n");

  const defaultAction: AskUmaResponse["actionPayload"] =
    localRes.actionPayload ||
    (effectiveKundali
      ? { type: "open_kundali", label: "जन्मकुंडली विस्तार देखें" }
      : { type: "open_panchang", label: "आज का पंचांग देखें" });

  // Primary online API endpoint (/api/uma/chat)
  if (typeof navigator === "undefined" || navigator.onLine !== false) {
    try {
      const lic = getLicenseStatus();
      const endpoints = getUmaApiEndpoints("/api/uma/chat");
      let resp: Response | null = null;
      for (const url of endpoints) {
        const r = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-license-token": lic.token,
          },
          signal: AbortSignal.timeout(15000),
          body: JSON.stringify({
            query,
            panchangContext,
            kundaliContext: combinedKundaliContext,
            chatHistory,
            systemPrompt,
            licenseToken: lic.token,
          }),
        }).catch(() => null);
        if (r && r.ok) {
          resp = r;
          break;
        }
      }

      if (resp && resp.ok) {
        const data = await resp.json();
        if (data?.ok && typeof data.text === "string" && data.text.trim()) {
          const aiText = data.text.trim();
          let finalText = aiText;
          const parchi = generateTraditionalUpayParchi(effectiveKundali, panchang);

          // If the chart does NOT have Grahan Yog, ensure AI never outputs "⑥ ग्रहण योग शान्ति करावें।"
          if (!parchi.detectedDoshaYoga.includes("ग्रहण")) {
            finalText = finalText.replace(/⑥\s*[^\n]*ग्रहण[^\n]*/g, `⑥ ${parchi.points[5]}`);
          }

          const wantsParchi = /उपाय पर्ची|पर्ची|पूरी कुंडली|संपूर्ण कुंडली|संपूर्ण फलादेश|upay parchi/i.test(query);
          if (wantsParchi && !finalText.includes("①")) {
            const parchiBlock = `\n\n📋 पारंपरिक ज्योतिषीय उपाय पर्ची (उपाय पत्रक — संक्षिप्त ६-सूत्रीय विधान):\n${parchi.formattedTextBlock}\n(💡 नीचे दिए '📋 उपाय पर्ची' बटन पर क्लिक करके आप इस पारंपरिक लेटरहेड पर्ची को देख, संपादित व डाउनलोड/शेयर कर सकते हैं।)`;
            if (finalText.includes("[अगले प्रश्न]")) {
              const idx = finalText.indexOf("[अगले प्रश्न]");
              finalText = `${finalText.slice(0, idx).trim()}${parchiBlock}\n\n---\n${finalText.slice(idx)}`;
            } else {
              finalText = `${finalText.trim()}${parchiBlock}`;
            }
          }

          return {
            ok: true,
            text: finalText,
            source: "gemini",
            actionPayload: defaultAction,
          };
        }
      }
    } catch (err) {
      console.warn("/api/uma/chat unavailable, using 100% deterministic Sookshma Ganit engine:", err);
    }
  }

  // 100% Deterministic Local Vedic & Numerology Sookshma Ganit Engine (Works completely offline!)
  return {
    ok: localRes.ok,
    text: localRes.text,
    source: "local_vedic",
    actionPayload: localRes.actionPayload || defaultAction,
  };
}

function chartAnswer(kundali: KundaliData, query: string, panchang?: VedicPanchangData | null): string {
  return synthesizeDynamicMicroVerdict(kundali, query, panchang);
}

/**
 * Attempts to construct a temporary Kundali on-the-fly if the user typed their birth date/time in chat
 */
function tryParseKundaliFromQuery(query: string): KundaliData | null {
  const dmyMatch = query.match(/\b(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})\b/);
  const ymdMatch = query.match(/\b(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})\b/);
  if (!dmyMatch && !ymdMatch) return null;

  let day = 1;
  let month = 1;
  let year = 1995;
  if (dmyMatch) {
    day = parseInt(dmyMatch[1], 10);
    month = parseInt(dmyMatch[2], 10);
    year = parseInt(dmyMatch[3], 10);
  } else if (ymdMatch) {
    year = parseInt(ymdMatch[1], 10);
    month = parseInt(ymdMatch[2], 10);
    day = parseInt(ymdMatch[3], 10);
  }

  const timeMatch = query.match(/\b(\d{1,2}):(\d{2})\s*(AM|PM|am|pm)?\b/);
  const timeStr = timeMatch
    ? `${timeMatch[1].padStart(2, "0")}:${timeMatch[2]} ${(timeMatch[3] || "AM").toUpperCase()}`
    : "10:30 AM";

  try {
    const d = new Date(year, month - 1, day);
    return calculateKundali("यजमान", d, timeStr, "नई दिल्ली", 28.6139, 77.209, 5.5);
  } catch {
    return null;
  }
}

export async function generateUma({
  query,
  kundali,
  panchang,
}: {
  query: string;
  kundali?: KundaliData | null;
  panchang?: VedicPanchangData | null;
}): Promise<UmaResponse> {
  try {
    const q = (query || "").toLowerCase().trim();

    // 1. ANK JYOTISH / NUMEROLOGY (HIGHEST PRIORITY WHEN NUMEROLOGY KEYWORDS PRESENT)
    if (isNumerologyQuery(query)) {
      return synthesizeNumerologyVerdict(query, kundali, panchang);
    }

    // 2. Pure Greeting & Introduction
    const isPureGreeting =
      /^(नमस्ते|प्रणाम|हेलो|hello|hi|hey|hii|radhe radhe|jai shri krishna|om|hari om|jai jinendra|sat sri akaal|जय श्री राम|जय श्री कृष्ण|हर हर महादेव|तुम कौन हो|परिचय|who are you)[\s!.,?]*$/i.test(
        q
      ) ||
      q === "hi" ||
      q === "hello" ||
      q === "hey" ||
      q === "नमस्ते" ||
      q === "प्रणाम";

    if (isPureGreeting) {
      const savedK = kundali || (typeof window !== "undefined" ? getSavedKundaliProfiles()[0] || null : null);
      return {
        ok: true,
        source: "local_vedic",
        text: `॥ ॐ श्री गणेशाय नमः ॥\nप्रणाम यजमान${savedK ? ` **${savedK.name}** जी` : ""}! मैं **उमा** हूँ — आपकी सूक्ष्म वैदिक ज्योतिष (पराशरी, जैमिनी, कृष्णमूर्ति KP, षोडशवर्ग D1-D60, अष्टकवर्ग, तात्कालिक प्रश्न-कुण्डली) एवं अंक-शास्त्र आचार्य।\n\n${
          savedK
            ? `✓ **आपकी पत्रिका सक्रिय है:** लग्न **${savedK.lagnaRashi}**, चंद्र **${savedK.moonRashi} (${savedK.nakshatra})**, दशा: **${savedK.mahadasha}–${savedK.antardasha}–${savedK.pratyantardasha}**।\n\n`
            : ""
        }आप मुझसे सूक्ष्म गणितीय गणना के साथ पूछ सकते हैं:\n• **📜 सूक्ष्म कुण्डली व KP निर्णय:** अंश-कला-विकला, KP उपनक्षत्र (Sub-Lord), D-9 नवमांश, D-10 दशमांश, D-60 षष्ट्यंश, सर्वाष्टकवर्ग बिंदु, प्रत्यंतर व सूक्ष्म दशा तारीखें\n• **🔢 सूक्ष्म अंक ज्योतिष:** कॉल्डियन/पाइथागोरियन अक्षर-गणित, संयुक्त अंक (19, 23, 24), लो-शू ८-तल प्रतिशत, ४ जीवन शिखर (Pinnacles) व मोबाइल/वाहन अंक-युग्म स्कैन\n• **🔮 तात्कालिक प्रश्न-कुण्डली व मुहूर्त:** प्रश्न लग्न स्पष्ट, सक्रिय होरा, चौघड़िया, राहुकाल, तारा बल, चंद्र बल, वास्तु व रत्न निर्णय`,
        actionPayload: savedK
          ? { type: "open_kundali", label: "कुंडली विश्लेषण देखें" }
          : { type: "open_panchang", label: "आज का पंचांग देखें" },
      };
    }

    // 3. GANPATI STHAPANA / PUJAN GUIDANCE BY UMA
    if (
      q.includes("गणेश स्थापना") ||
      q.includes("गणपति स्थापना") ||
      q.includes("गणेश पूजा") ||
      q.includes("गणेश पूजन") ||
      q.includes("sthapana") ||
      q.includes("पूजन करवाओ") ||
      q.includes("पूजा करवाओ")
    ) {
      return {
        ok: true,
        source: "local_vedic",
        text: `॥ ॐ वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ। निर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा॥\n\n**यजमान! आइए, मैं आपको वैदिक ब्राह्मण की तरह श्री गणेश स्थापना और षोडशोपचार पूजन करवाती हूँ। अपने आसन पर पूर्व या उत्तर की ओर मुख करके बैठ जाइए:**\n\n**चरण १: आचमन व पवित्रीकरण**\nहाथ में जल लेकर बोलें: *'ॐ अपवित्रः पवित्रो वा सर्वावस्थां गतोपि वा। यः स्मरेत्पुण्डरीकाक्षं स बाह्याभ्यन्तरः शुचिः॥'* (तीन बार जल आचमन करें)\n\n**चरण २: संकल्प (हाथ में अक्षत, पुष्प और जल लेकर)**\nबोलें: *'ममोपात्त-समस्त-दुर्व्ययक्षयपूर्वकं श्रीगणपति प्रीत्यर्थं मम सपरिवारस्य क्षेमारोग्यैश्वर्यवृद्धये श्रीगणेश पूजनमहं करिष्ये।'* (जल को जमीन पर छोड़ दें)\n\n**चरण ३: भगवान गणेश का आह्वान (प्रतिमा या सुपारी पर)**\n*'ॐ भूर्भुवः स्वः श्रीगणेशाय नमः। इहागच्छ इह तिष्ठ, सुप्रतिष्ठितो वरदो भव।'*\n\n**चरण ४: षोडशोपचार पूजन व दूर्वा अर्पण**\nगणेश जी को सिंदूर लगाएं और २१ दूर्वा चढ़ाते हुए बोलें: \n*'दूर्वाङ्कुरान् समर्पयामि ॐ गं गणपतये नमः। इदं दुर्वादलं समर्पयामि॥'* \n\nअब मोदक का भोग लगाएं और गणेश आरती गाएं! बोलिए गणपति बाप्पा मोरया!`,
        actionPayload: { type: "open_panchang", label: "व्रत कथा व विधि देखें" },
      };
    }

    // 4. KARWA CHAUTH PUJAN GUIDANCE
    if (q.includes("करवा चौथ") || q.includes("karwa") || q.includes("chauth") || q.includes("चौथ पूजा")) {
      return {
        ok: true,
        source: "local_vedic",
        text: `॥ करवा चौथ व्रत पूजन विधान — उमा द्वारा मार्गदर्शन ॥\n\n**सौभाग्यवती बहनों, आइए करवा चौथ का पूजन विधिपूर्वक संपन्न करें:**\n\n**संकल्प मंत्र:**\n*'करकचतुर्थी व्रतमिदं करिष्ये व्रतसंस्थितः। पतिसौभाग्यवृद्धयर्थं सुसंस्थिता भवाम्यहम्॥'* \n\n**पूजन विधि:**\n१. दीवार पर गेरू से चौका बनाकर करवा, सूर्य और चंद्रमा का चित्र बनाएं अथवा कैलेंडर स्थापित करें।\n२. माँ गौरी और भगवान गणेश का रोली, अक्षत, धूप और पुष्प से पूजन करें।\n३. माँ पार्वती को सुहाग की पिटारी (बिंदी, चूड़ी, सिंदूर) अर्पित करें।\n४. संध्याकाल में करवा चौथ की कथा सुनें और चंद्रमा उदय होने पर छलनी से चंद्र दर्शन कर अर्घ्य दें।`,
        actionPayload: { type: "open_panchang", label: "व्रत कथा सूची देखें" },
      };
    }

    // 5. SHIV MAHIMNA STOTRA
    if (q.includes("महिम्न") || q.includes("शिव महिम्न") || q.includes("pushpdant") || q.includes("महिमान")) {
      return {
        ok: true,
        source: "local_vedic",
        text: `॥ श्री शिव महिम्न स्तोत्र (गंधर्वराज पुष्पदंत रचित) ॥\n\nमहिम्नः पारं ते परमविदुषो यद्यपि विधुः\nस्तुवन्तो ब्रह्माणो अपि हरनभयद्वेतयितुमः।\nतदस्यात्मनः क्लेशो हरसि महतां च प्रमदतः\nस्तवोह्यर्वाचीनः क्व च मम मतिः क च तव गुणान् ॥१॥\n\nअतीतपंथानं तव च महिमा वाङ्मनसयो-\nर्जगत्याः प्रणेता त्वमसि खलु सर्वेषु च विभो।\nकथं स्तुत्यः स्तुत्यः कथमपि च ते ध्यानविषयो\nभवेद् देव त्राहि प्रणतभयहारिन् शिव विभो ॥२॥\n\n**उमा का पुरोहितीय उपदेश:**\nशिव महिम्न स्तोत्र का पाठ गंधर्वराज पुष्पदंत ने किया था। इसके नित्य पाठ से मनुष्य के समस्त पाप नष्ट होते हैं और भगवान शिव की असीम कृपा प्राप्त होती है।`,
        actionPayload: { type: "open_panchang", label: "व्रत कथा व आरती देखें" },
      };
    }

    // 6. DAILY PRAYERS
    if (q.includes("सुबह") || q.includes("उठते") || q.includes("कराग्रे") || q.includes("प्रातः स्मरण")) {
      return {
        ok: true,
        source: "local_vedic",
        text: `॥ प्रातः स्मरण एवं करदर्शन मंत्र ॥\n\nकराग्रे वसते लक्ष्मीः करमध्ये सरस्वती।\nकरमूले तु गोविन्दः प्रभाते करदर्शनम्॥\n\n**भूमि वंदन (पैर रखने से पूर्व):**\nसमुद्रवसने देवि पर्वतस्तनमण्डिते।\nविष्णुपत्नि नमस्तुभ्यं पादस्पर्शं क्षमस्व मे॥\n\n**उमा का उपदेश:**\nप्रातःकाल शय्या से उठते ही दोनों हथेलियों के दर्शन करने से लक्ष्मी, सरस्वती और विष्णु जी का आशीर्वाद प्राप्त होता है।`,
        actionPayload: { type: "open_panchang", label: "नित्य मंत्र देखें" },
      };
    }

    if (q.includes("भोजन") || q.includes("खाना") || q.includes("ब्रह्मार्पणं") || q.includes("प्रसाद")) {
      return {
        ok: true,
        source: "local_vedic",
        text: `॥ भोजन के समय का पवित्र मंत्र (अन्नपूर्णा स्तुति) ॥\n\nब्रह्मार्पणं ब्रह्म हविर्ब्रह्माग्नौ ब्रह्मणा हुतम्।\nब्रह्मैव तेन गन्तव्यं ब्रह्मकर्मसमाधिना॥\n\n**अन्नपूर्णा मंत्र:**\nॐ अन्नपूर्णे सदापूर्णे शङ्करप्राणवल्लभे।\nज्ञानवैराग्यसिद्ध्यर्थं भिक्षां देहि च पार्वति॥\n\n**उमा का उपदेश:**\nभोजन ग्रहण करने से पूर्व इस मंत्र का पाठ करने से भोजन प्रसाद बन जाता है और शरीर व मन दोनों सात्विक रहते हैं।`,
        actionPayload: { type: "open_panchang", label: "पंचांग देखें" },
      };
    }

    if (q.includes("संध्या") || q.includes("प्रदोष") || q.includes("गुरुर्ब्रह्मा") || q.includes("दीप प्रज्वलन")) {
      return {
        ok: true,
        source: "local_vedic",
        text: `॥ संध्या समय एवं दीप प्रज्वलन मंत्र ॥\n\nशुभं करोति कल्याणमारोग्यं धनसम्पदा।\nशत्रुबुद्धिविनाशाय दीपज्योतिर्नमोऽस्तु ते॥\n\n**गुरु वंदना:**\nगुरुर्ब्रह्मा गुरुर्विष्णुः गुरुर्देवो महेश्वरः।\nगुरुः साक्षात् परं ब्रह्म तस्मै श्रीगुरवे नमः॥\n\n**उमा का उपदेश:**\nसंध्याकाल में घर में दीपक जलाते समय इस मंत्र का उच्चारण करने से घर में नकारात्मक ऊर्जा समाप्त होती है और लक्ष्मी का वास होता है।`,
        actionPayload: { type: "open_panchang", label: "पंचांग देखें" },
      };
    }

    if (q.includes("सोने") || q.includes("रात्रि") || q.includes("शयन") || q.includes("अच्युतं") || q.includes("करचरण") || q.includes("क्षमा")) {
      return {
        ok: true,
        source: "local_vedic",
        text: `॥ रात्रि को सोते समय की शिव क्षमा प्रार्थना ॥\n\nकरचरणकृतं वाक्कायजं कर्मजं वा\nश्रवणनयनजं वा मानसं वाऽपराधम्।\nविहितमविहितं वा सर्वमेतत्क्षमस्व\nजय जय करुणाब्धे श्रीमहादेव शम्भो॥\n\n**उमा का पुरोहितीय उपदेश:**\nरात्रि को शयन से पूर्व इस शिव क्षमा प्रार्थना का पाठ करने से दिनभर में अनजाने में हाथ, पैर, वाणी, मन या कर्म से हुए समस्त पाप और अपराध भगवान शिव क्षमा कर देते हैं और शांत व पवित्र नींद आती है।`,
        actionPayload: { type: "open_panchang", label: "पंचांग देखें" },
      };
    }

    // 7. VRAT KATHAS
    if (
      q.includes("सत्यनारायण") ||
      q.includes("हरतालिका") ||
      q.includes("छठ") ||
      q.includes("धनतेरस") ||
      q.includes("दीपावली") ||
      q.includes("एकादशी") ||
      q.includes("व्रत कथा")
    ) {
      return {
        ok: true,
        source: "local_vedic",
        text: `॥ वैदिक व्रत कथा एवं पूजन विधान — उमा द्वारा मार्गदर्शन ॥\n\nयजमान, आपने जिस व्रत या कथा (सत्यनारायण, हरतालिका तीज, छठ पूजा, धनतेरस, दीपावली या एकादशी) का स्मरण किया है, उसकी संपूर्ण कथा, संस्कृत श्लोक और विधि-विधान हमारे ऐप के **"व्रत कथा व आरती"** अध्याय में सस्वर और विस्तार से उपलब्ध है!\n\nआप ऐप के मेनू से **व्रत कथा** खोलकर पूर्ण स्कन्दपुराण व शिवपुराणोक्त कथा का पाठ कर सकते हैं। बोलिए भगवान विष्णु और माता पार्वती की जय!`,
        actionPayload: { type: "open_panchang", label: "व्रत कथा अध्याय खोलें" },
      };
    }

    // 8. SPECIALIZED SHASTRA MODULES (VASTU, PALMISTRY, GEMOLOGY/RUDRAKSHA)
    const effectiveKundali =
      kundali ||
      tryParseKundaliFromQuery(query) ||
      (typeof window !== "undefined" ? getSavedKundaliProfiles()[0] || null : null);

    const specialized = synthesizeSpecializedShastraVerdict(query, effectiveKundali);
    if (specialized) {
      return specialized;
    }

    // 9. PANCHANG / CHOGHADIYA / RAHUKAL / MUHURAT / DISHASHOOL INQUIRIES
    const asksToday = /आज|तिथि|पंचांग|मुहूर्त|चौघड़िया|राहुकाल|राहु काल|दिशाशूल|अभिजित|यमगण्ड|गुलिक|सूर्योदय|सूर्यास्त/.test(q);
    const asksChart = /नौकरी|शादी|विवाह|दशा|कुंडली|लग्न|सेहत|पैसा|धन|महादशा|साढ़ेसाती|मांगलिक|कर्ज|व्यापार|ऐप|app|career|job|marriage|loan|debt/.test(q);
    if (asksToday && !asksChart) {
      return synthesizeLiveMuhuratPanchangVerdict(query, panchang);
    }

    // 10. KUNDALI / ASTROLOGY INQUIRIES (With saved Kundali OR parsed DOB from query)
    if (effectiveKundali) {
      return {
        ok: true,
        source: "local_vedic",
        text: chartAnswer(effectiveKundali, query, panchang),
        actionPayload: { type: "open_kundali", label: "जन्मकुंडली विस्तार देखें" },
      };
    }

    // 11. Real-Time Tatkalik Prashna Kundali (तात्कालिक प्रश्न-कुण्डली एवं होरा सूक्ष्म निर्णय)
    return {
      ok: true,
      source: "local_vedic",
      text: synthesizePanchangAstrologyVerdict(query, panchang),
      actionPayload: { type: "open_kundali", label: "जन्मकुंडली बनाएं व फलादेश देखें" },
    };
  } catch (err) {
    console.error("Uma generation error:", err);
    return {
      ok: true,
      source: "local_vedic",
      text: `॥ ॐ नमः शिवाय ॥\nप्रणाम यजमान! भगवान शिव और श्रीगणेश जी की कृपा से आपका हर कार्य मंगलमय हो। कृपया अपना प्रश्न साझा करें, मैं प्रामाणिक सूक्ष्म वैदिक एवं अंक-ज्योतिष मार्गदर्शन प्रस्तुत करूँगी।`,
      actionPayload: { type: "open_panchang", label: "पंचांग देखें" },
    };
  }
}
