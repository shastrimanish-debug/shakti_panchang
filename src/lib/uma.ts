import { KundaliData, PlanetPosition, VedicPanchangData } from "../types";
import { getLicenseStatus } from "./license-client";
import { calculateSadeSati } from "../services/sadesati";
import {
  synthesizeDynamicMicroVerdict,
  synthesizePanchangAstrologyVerdict,
  buildMicroAstrologyContextPrompt,
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

const UMA_PHP_URL = "https://myshivshakti.in/shaktipanchang/uma/v1/uma.php";

export type UmaLinkState = "online" | "local" | "nokey";

export async function pingUmaServer(): Promise<{ state: UmaLinkState; providers: string[] }> {
  try {
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      return { state: "local", providers: ["local_vedic"] };
    }
    const healthResp = await fetch("/api/health", { signal: AbortSignal.timeout(2500) }).catch(() => null);
    if (healthResp && healthResp.ok) {
      return { state: "online", providers: ["gemini", "local_vedic"] };
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
  return /अंक|मूलांक|भाग्यांक|नामांक|लो-शू|लो शू|लोशू|कुआं|कुआ अंक|स्पेलिंग|नेम सुधार|नाम सुधार|व्यक्तिगत वर्ष|मोबाइल नंबर|मोबाइल अंक|वाहन नंबर|वाहन अंक|गाड़ी नंबर|लकी नंबर|शुभ अंक|mulank|moolank|bhagyank|namank|numerology|loshu|lo shu|kua number|personal year|name spelling|lucky number|ank jyotish|ankjyotish/.test(
    q
  );
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
  const isFriendly = friendlyNumbers.includes(currentSingle) || currentSingle === mulankNum || currentSingle === bhagyankNum;

  // Chaldean letter values for quick adjustments
  const letterAdditions: Array<{ char: string; val: number; hint: string }> = [
    { char: "A", val: 1, hint: "'A' (सूर्य का अक्षर, मान +1)" },
    { char: "I", val: 1, hint: "'I' (सूर्य का अक्षर, मान +1)" },
    { char: "E", val: 5, hint: "'E' (बुध का अक्षर, मान +5)" },
    { char: "N", val: 5, hint: "'N' (बुध का अक्षर, मान +5)" },
    { char: "S", val: 3, hint: "'S' (गुरु का अक्षर, मान +3)" },
    { char: "U", val: 6, hint: "'U' (शुक्र का अक्षर, मान +6)" },
    { char: "R", val: 2, hint: "'R' (चंद्र का अक्षर, मान +2)" },
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
      newCompound !== 18 &&
      newCompound !== 26 &&
      newCompound !== 35 &&
      newCompound !== 44
    ) {
      const modifiedFirst = `${firstWord}${item.char}`;
      const fullModified = restWords ? `${modifiedFirst} ${restWords}` : modifiedFirst;
      const planetName = NUMBER_DATA[newSingle]?.planet?.split(" ")[0] || "शुभ ग्रह";
      suggestions.push(
        `• **${fullModified}** → संयुक्त अंक **${newCompound}**, नामांक **${newSingle}** (${planetName} प्रधान — ${item.hint} जोड़ने पर)`
      );
      if (suggestions.length >= 3) break;
    }
  }

  if (isFriendly) {
    return `✓ **आपका वर्तमान नाम «${cleanName}» (संयुक्त अंक ${currentCompound} → नामांक ${currentSingle})** आपके मूलांक ${mulankNum} व भाग्यांक ${bhagyankNum} के **पूर्णतः अनुकूल एवं शुभ** है! आपको स्पेलिंग बदलने की आवश्यकता नहीं है; केवल हस्ताक्षर करते समय नाम के नीचे ऊपर उठती हुई रेखा खींचें और अंत में बिंदु (.) लगाएं।`;
  }

  if (suggestions.length === 0) {
    return `⚠️ आपका वर्तमान नाम **«${cleanName}»** (संयुक्त अंक ${currentCompound} → नामांक ${currentSingle}) आपके मूलांक ${mulankNum} से सम/प्रतिकूल है। इसे मित्र अंक (**${friendlyNumbers.join(", ")}**) पर लाने हेतु नाम में 1 या 5 मान वाले अक्षर (A, I, E, N) का समावेश करें।`;
  }

  return `⚠️ आपका वर्तमान नाम **«${cleanName}»** (संयुक्त अंक ${currentCompound} → नामांक ${currentSingle}) मूलांक ${mulankNum} के लिए थोड़ा संघर्षकारी है। भाग्योदय हेतु कीरो/कॉल्डियन पद्धति के अनुसार ये शुभ स्पेलिंग विकल्प सर्वोत्तम हैं:\n${suggestions.join("\n")}`;
}

/**
 * Full Offline Deterministic Ank Jyotish (Numerology) Synthesis Engine
 */
export function synthesizeNumerologyVerdict(
  userQuery: string,
  kundali?: KundaliData | null,
  panchang?: VedicPanchangData | null
): UmaResponse {
  const q = (userQuery || "").trim();
  const qLower = q.toLowerCase();

  // 1. Extract Name from query or activeKundali
  let personName = kundali?.name || "यजमान";
  const nameMatch =
    q.match(/नाम[:\s-]+([A-Za-z\u0900-\u097F\s]{2,30}?)(?:,|है|जन्म|तिथि|मूलांक|\.|;|$)/i) ||
    q.match(/name[:\s-]+([A-Za-z\s]{2,30}?)(?:,|is|dob|birth|\.|;|$)/i) ||
    q.match(/\b([A-Z]{3,}(?:\s+[A-Z]{2,})?)\b/);
  if (nameMatch && nameMatch[1]) {
    const candidate = nameMatch[1].trim();
    if (!/^(AM|PM|DOB|DL|MH|UP|MP|RJ|GJ|HR|UK|BIHAR|INDIA)$/.test(candidate)) {
      personName = candidate;
    }
  }

  // 2. Extract Birth Date (DD/MM/YYYY or DD-MM-YYYY or YYYY-MM-DD) from query or activeKundali
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
  } else if (kundali?.birthDate) {
    const kd = new Date(kundali.birthDate);
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

  // Check if user explicitly asked about a specific Mulank / Bhagyank number
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

  // Gender detection
  const gender: "male" | "female" = /स्त्री|महिला|लड़की|female|woman|girl/i.test(q) ? "female" : "male";

  // Perform full Numerology Calculations
  const mulank = NUMBER_DATA[mulankNum] || NUMBER_DATA[1];
  const bhagyank = NUMBER_DATA[bhagyankNum] || NUMBER_DATA[1];
  const chaldean = calculateNamank(personName, "chaldean");
  const pythagorean = calculateNamank(personName, "pythagorean");
  const namankInfo = NUMBER_DATA[chaldean.single] || NUMBER_DATA[1];
  const kuaNum = calculateKuaNumber(year, gender);
  const kuaInfo = NUMBER_DATA[kuaNum] || NUMBER_DATA[1];
  const currentYear = (panchang?.date || new Date()).getFullYear();
  const personalYear = calculatePersonalYear(day, month, currentYear);
  const loshu = calculateLoshuGrid(day, month, year);

  // Extract optional Mobile or Vehicle Number from query
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
    mobileSection = `\n• **📱 मोबाइल नंबर विश्लेषण (${mStr}):** कुल अंक योग = **${mSum} → मूलांक ${mSingle}** (${mData.planet})। यह नंबर आपके मूलांक ${mulankNum} के लिए **${
      mFriendly ? "अत्यंत शुभ व भाग्योदयकारी ✓" : "सामान्य/संघर्षकारी ⚠️ (मित्र अंक " + mulank.friendlyNumbers.join(", ") + " के कुल योग वाला नंबर श्रेष्ठ रहेगा)"
    }** है।`;
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
    vehicleSection = `\n• **🚗 वाहन नंबर विश्लेषण (${vStr}):** कुल योग अंक = **${vSingle}** (${vData.planet})। यह वाहन अंक आपके लिए **${
      vFriendly ? "सुरक्षित, शुभ व समृद्धिदायक ✓" : "सामान्य ⚠️ (वाहन में श्री यंत्र या हनुमान चालीसा स्थापित करें)"
    }** है।`;
  }

  // Mulank-Bhagyank relationship
  const isDriverConductorFriendly =
    mulank.friendlyNumbers.includes(bhagyankNum) ||
    bhagyank.friendlyNumbers.includes(mulankNum) ||
    mulankNum === bhagyankNum;
  const isDriverConductorEnemy =
    mulank.enemyNumbers.includes(bhagyankNum) || bhagyank.enemyNumbers.includes(mulankNum);

  const synergyVerdict = isDriverConductorFriendly
    ? `आपका **मूलांक ${mulankNum} (${mulank.planet.split(" ")[0]})** और **भाग्यांक ${bhagyankNum} (${bhagyank.planet.split(" ")[0]})** परस्पर **परम मित्र** हैं! यह संयोग जीवन में उच्च पद, तीव्र भाग्योदय, स्थायी धन और मान-सम्मान प्रदान करता है।`
    : isDriverConductorEnemy
    ? `आपका **मूलांक ${mulankNum} (${mulank.planet.split(" ")[0]})** और **भाग्यांक ${bhagyankNum} (${bhagyank.planet.split(" ")[0]})** में वैचारिक द्वंद्व रहता है, जिसके कारण प्रारंभिक संघर्ष के बाद ही बड़ी सफलता मिलती है। नामांक व मित्र अंक (${mulank.friendlyNumbers.join(", ")}) के संतुलन से यह दोष पूर्णतः शांत हो जाता है।`
    : `आपका **मूलांक ${mulankNum} (${mulank.planet.split(" ")[0]})** और **भाग्यांक ${bhagyankNum} (${bhagyank.planet.split(" ")[0]})** परस्पर **सम व संतुलित** हैं। सुनियोजित कर्म और सही नामांक स्पेलिंग से आपको जीवन में स्थिर उन्नति व ऐश्वर्य की प्राप्ति होगी।`;

  // Lo Shu Grid Planes & Missing Remedies
  const completedPlanes = loshu.completedPlanes || [];
  const planesSummary =
    completedPlanes.length > 0
      ? completedPlanes.map((p) => `**${p.name}** (${p.numbers.join("-")}: ${p.significance})`).join("; ")
      : "कोई पूर्ण रेखा नहीं (कर्म व इच्छाशक्ति के संतुलन से सफलता)";

  const rajYogaSummary =
    loshu.goldenRajYoga && loshu.silverRajYoga
      ? "🌟 **महा-राजयोग:** आपके लो-शू चक्र में **स्वर्ण राजयोग (4-5-6)** एवं **रजत राजयोग (2-5-8)** दोनों पूर्ण हैं! यह करोड़पति योग, भूमि-भवन और अखंड ऐश्वर्य का द्योतक है।"
      : loshu.goldenRajYoga
      ? "✨ **स्वर्ण राजयोग (4-5-6 पूर्ण):** आपके लो-शू चक्र में गोल्डन राजयोग सक्रिय है, जो जीवन में उच्च कोटि की प्रसिद्धि, धन और प्रबंधन क्षमता देता है।"
      : loshu.silverRajYoga
      ? "🥈 **रजत/पृथ्वी राजयोग (2-5-8 पूर्ण):** आपके लो-शू चक्र में सिल्वर राजयोग सक्रिय है, जो अचल संपत्ति, भूमि, मकान और स्थायी कोष प्रदान करता है।"
      : `अंक **5 (बुध/ब्रह्मस्थान)** ${
          (loshu.counts[5] || 0) > 0
            ? "आपके ग्रिड में उपस्थित है जो पूरे चक्र को ऊर्जा देता है"
            : "अनुपस्थित है, अतः केंद्र बल बढ़ाने हेतु पन्ना/तुलसी या क्रिस्टल ब्रेसलेट धारण करना अत्यंत शुभ रहेगा"
        }।`;

  const presentNumsStr = [1, 2, 3, 4, 5, 6, 7, 8, 9]
    .filter((n) => (loshu.counts[n] || 0) > 0)
    .map((n) => `${n} (x${loshu.counts[n]})`)
    .join(", ");

  const missingRemediesList = loshu.missingNumbers
    .slice(0, 4)
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

  const text = `॥ ॐ श्री गणेशाय नमः ॥
॥ वैदिक अंक-ज्योतिष एवं लो-शू चक्र सूक्ष्म निर्णय — विदुषी उमा ॥

**१. त्वरित अंक फलादेश (Executive Numerology Verdict)**
कल्याणमस्तु यजमान **${personName}** जी! जन्म तिथि **${dobLabel}** की सूक्ष्म अंक-गणना के अनुसार आपका **मूलांक (Driver) ${mulankNum}** तथा **भाग्यांक (Conductor) ${bhagyankNum}** है। ${synergyVerdict}

**२. चतुर्मुखी अंक-गणित एवं ग्रह स्वामित्व (Core Numbers Math)**
• **मूलांक (Driver Number): अंक ${mulankNum}** — स्वामी: **${mulank.planet}** | देवता: ${mulank.deity} | तत्व: ${mulank.element}
  *स्वभाव व शक्ति:* ${mulank.nature}
• **भाग्यांक (Conductor Number): अंक ${bhagyankNum}** — स्वामी: **${bhagyank.planet}** | देवता: ${bhagyank.deity}
  *भाग्य दिशा:* ${bhagyank.nature}
• **नामांक (Chaldean Name Number): संयुक्त अंक ${chaldean.compound} → एकल अंक ${chaldean.single}** (${namankInfo.planet.split(" ")[0]}) | पाइथागोरियन नामांक: **${pythagorean.single}** (${pythagorean.compound})
• **कुआं अंक (Lo Shu Kua Angel Number): अंक ${kuaNum}** (${kuaInfo.planet.split(" ")[0]}) — इसे प्रतिदिन बाएं हाथ की कलाई पर नीले/हरे पेन से लिखना आपके लिए धन व अवसर आकर्षित करेगा।${mobileSection}${vehicleSection}

**३. लो-शू ग्रिड (3x3), राजयोग एवं तत्व विश्लेषण**
• **ग्रिड में उपस्थित अंक:** ${presentNumsStr || mulankNum}
• **अनुपस्थित (Missing) अंक:** ${loshu.missingNumbers.length > 0 ? loshu.missingNumbers.join(", ") : "कोई नहीं (सम्पूर्ण ग्रिड)"}
• **निर्मित योग रेखाएं:** ${planesSummary}
• **राजयोग स्थिति:** ${rajYogaSummary}

**४. व्यक्तिगत वर्ष ${currentYear} एवं करियर/व्यापार दिशा**
• **व्यक्तिगत वर्ष अंक (Personal Year ${currentYear}): अंक ${personalYear.yearNum}** — **${personalYear.theme}**
  *वार्षिक मार्गदर्शन:* ${personalYear.advice}
• **सर्वोत्तम करियर व व्यापार क्षेत्र:** ${Array.from(new Set([...mulank.careers, ...bhagyank.careers])).slice(0, 8).join(", ")}।
• **शुभ सहयोगी अंक:** **${mulank.friendlyNumbers.join(", ")}** | **शुभ तिथियां:** **${mulank.luckyDates.join(", ")}**
• **शुभ वार:** ${mulank.luckyDays.join(", ")} | **शुभ रंग:** ${mulank.luckyColors.join(", ")}

**५. नाम स्पेलिंग सुधार एवं अचूक अंक-ज्योतिष उपाय**
• **नामांक स्पेलिंग परीक्षण:**
${spellingAdvice}
• **भाग्य रत्न व रुद्राक्ष:** रत्न: **${mulank.luckyGem}** (अथवा भाग्यांक रत्न: ${bhagyank.luckyGem}) | रुद्राक्ष: **${mulank.rudraksha}**
• **सूर्य-जल चिकित्सा:** ${mulank.waterBottleColor} में पेयजल भरकर धूप में चार्ज कर नित्य पिएं।
• **सिद्ध अंक मंत्र जप:** *${mulank.mantra}* (नित्य ${mulank.japaCount})
${missingRemediesList ? `• **अनुपस्थित अंकों (${loshu.missingNumbers.slice(0, 4).join(", ")}) के विशेष उपाय:**\n${missingRemediesList}` : ""}

---
[अगले प्रश्न]:
• मेरे नाम (${personName}) की स्पेलिंग और हस्ताक्षर को और अधिक भाग्यशाली कैसे बनाएं?
• मेरे मूलांक ${mulankNum} व भाग्यांक ${bhagyankNum} के अनुसार कौन सा व्यापार या नौकरी सर्वोत्तम है?
• मेरे लो-शू ग्रिड के अनुपस्थित अंकों (${loshu.missingNumbers.slice(0, 3).join(", ") || "5"}) को जागृत करने के सरल घरेलू उपाय बताएं।`;

  return {
    ok: true,
    source: "local_vedic",
    text,
    actionPayload: {
      type: "open_numerology",
      label: "अंक ज्योतिष व लो-शू चक्र देखें",
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

  const text = `॥ ॐ सूर्याय नमः • वैदिक पंचांग, चौघड़िया एवं मुहूर्त निर्णय ॥

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
• मेरे मूलांक व भाग्यांक के अनुसार आज का दिन कैसा रहेगा?
• मेरी जन्म कुंडली के अनुसार वर्तमान गोचर का फल बताएं।`;

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
      text: `॥ ॐ वास्तुपुरुषायाय नमः • विश्वकर्मा प्रकाश एवं मयमतम् वास्तु निर्णय ॥

**१. त्वरित वास्तु फलादेश (Executive Vastu Takeaway)**
प्रणाम यजमान! बिना तोड़-फोड़ के वैदिक पंचतत्व (जल, अग्नि, पृथ्वी, वायु, आकाश) के संतुलन से घर व कार्यस्थल का वास्तु दोष १००% शांत किया जा सकता है।

**२. अष्ट-दिशा एवं पंचतत्व सूक्ष्म गणित**
• **ईशान कोण (North-East — जल व गुरु तत्व):** यह देवस्थान व मानसिक शांति का कोण है। यहाँ मंदिर, जल स्रोत या ध्यान कक्ष रखें। यहाँ भारी सामान या शौचालय कभी न रखें।
• **आग्नेय कोण (South-East — अग्नि व शुक्र तत्व):** यहाँ रसोईघर (पूर्व मुखी होकर भोजन बनाना) एवं विद्युत उपकरण सर्वोत्तम फल देते हैं।
• **नैऋत्य कोण (South-West — पृथ्वी व राहु/शनि तत्व):** यह गृहस्वामी के शयनकक्ष (Master Bedroom) व भारी अलमारी के लिए सर्वश्रेष्ठ है; इससे नेतृत्व व स्थिरता बढ़ती है।
• **उत्तर एवं कुबेर स्थान (North — बुध व कुबेर):** तिजोरी का मुख **उत्तर** या **पूर्व** दिशा की ओर खुलना चाहिए; इससे अखंड धन प्रवाह बना रहता है।

**३. बिना तोड़-फोड़ के ५ अचूक सात्विक वास्तु उपाय**
१. **मुख्य द्वार ऊर्जा:** मुख्य द्वार पर अष्टगंध या सिंदूर से **स्वस्तिक (卐)** बनाएं और पंचमुखी हनुमान जी अथवा गणेश जी स्थापित करें।
२. **नकारात्मक ऊर्जा हरण:** घर के पोंछे के पानी में गुरुवार को छोड़कर थोड़ा **सेंधा नमक (Rock Salt)** या समुद्री नमक मिलाएं।
३. **ईशान कोण शुद्धि:** ईशान कोण (उत्तर-पूर्व) में कांच के पात्र में जल व गुलाब की पंखुड़ियां अथवा स्फटिक श्री यंत्र स्थापित करें।
४. **धन आकर्षण:** तिजोरी में लाल वस्त्र में ५ गोमती चक्र, ११ कौड़ियां और साबुत हल्दी की गांठ बांधकर रखें।
५. **सायंकाल धूप-दीप:** नित्य संध्या में कपूर और लौंग जलाकर पूरे घर में आरती की ध्वनि करें।

---
[अगले प्रश्न]:
• धन वृद्धि के लिए तिजोरी और लॉकर किस दिशा में रखें?
• मेरे मूलांक व कुआं अंक के अनुसार मेरी शुभ दिशा कौन सी है?
• मेरी कुंडली के अनुसार भूमि व मकान बनने का योग कब है?`,
      actionPayload: { type: "open_vastu", label: "वास्तु शास्त्र अध्याय खोलें" },
    };
  }

  // 2. PALMISTRY / SAMUDRIK SHASTRA
  if (/हस्तरेखा|हथेली|जीवन रेखा|हृदय रेखा|मस्तिष्क रेखा|भाग्य रेखा|विवाह रेखा|सूर्य रेखा|मणिबंध|पर्वत|सामुद्रिक|palmistry|palm line|life line|fate line/.test(q)) {
    return {
      ok: true,
      source: "local_vedic",
      text: `॥ ॐ सामुद्रिक शास्त्राय नमः • नारद एवं गरुड़ पुराणोक्त हस्तरेखा निर्णय ॥

**१. त्वरित हस्तरेखा निष्कर्ष (Samudrik Verdict)**
यजमान! सामुद्रिक शास्त्र के अनुसार हथेली की रेखाएं आपके कर्म, विचार और प्रारब्ध का दर्पण हैं। पुरुषों के दाएं हाथ (कर्म हाथ) और स्त्रियों के बाएं हाथ (अथवा सक्रिय कर्म हाथ) से सटीक फलित देखा जाता है।

**२. प्रमुख रेखाओं एवं ग्रह पर्वतों का शास्त्रीय गणित**
• **जीवन रेखा (Life Line — शुक्र पर्वत को घेरती हुई):** यदि यह गहरी, गुलाबी और बिना टूटी हो, तो दीर्घायु, उत्तम रोग-प्रतिरोधक क्षमता और पारिवारिक सुख देती है।
• **भाग्य रेखा (Fate/Saturn Line — मणिबंध से शनि पर्वत तक):** मध्यमा उंगली के नीचे शनि पर्वत तक जाने वाली स्पष्ट रेखा ३०-३५ वर्ष की आयु के बाद प्रचंड भाग्योदय व स्थायी धन दर्शाती है।
• **हृदय एवं मस्तिष्क रेखा:** गुरु पर्वत (तर्जनी के नीचे) तक जाने वाली हृदय रेखा सात्विक प्रेम व निष्ठा देती है; समानांतर व लंबी मस्तिष्क रेखा तीव्र विश्लेषण क्षमता देती है।
• **सूर्य रेखा (Apollo Line — अनामिका के नीचे):** यह रेखा राजकीय सम्मान, उच्च पद, व्यापारिक ख्याति और समाज में प्रतिष्ठा दिलाती है।
• **M-चिह्न, मत्स्य चिह्न व त्रिभुज:** हथेली में 'M' का निशान या भाग्य रेखा पर मछली (Fish) का चिह्न आकस्मिक धन लाभ व स्वअर्जित संपत्ति का प्रबल राजयोग है।

**३. हस्त-ऊर्जा जागृत करने के वैदिक उपाय**
१. **प्रातः कर-दर्शन:** सुबह जागते ही दोनों हथेलियां मिलाकर दर्शन करें — *"कराग्रे वसते लक्ष्मीः करमध्ये सरस्वती। करमूले तु गोविन्दः प्रभाते करदर्शनम्॥"*
२. **गुरु व सूर्य पर्वत बल:** नित्य तर्जनी व अनामिका से चंदन/केसर का तिलक मस्तक पर लगाएं।
३. **सात्विक दान:** अपने हाथों से गौ-ग्रास, पक्षियों को सप्तधान्य और अन्न दान करने से हथेली की अशुभ आड़ी रेखाएं भी शुभ फल देने लगती हैं।

---
[अगले प्रश्न]:
• हथेली में धन की कोठरी (Money Triangle) कैसे बनती है?
• मेरी जन्म कुंडली और मूलांक के अनुसार मेरा भाग्य रत्न कौन सा है?
• मेरे नाम की स्पेलिंग और हस्ताक्षर कैसे सुधारें?`,
      actionPayload: { type: "open_palmistry", label: "हस्तरेखा अध्याय खोलें" },
    };
  }

  // 3. GEMOLOGY / RATNA & RUDRAKSHA
  if (/रत्न|रुद्राक्ष|पुखराज|नीलम|माणिक्य|मोती|पन्ना|मूंगा|हीरा|ओपल|गोमेद|लहसुनिया|उपरत्न|कौन सा पत्थर|अंगूठी|gemstone|rudraksha/.test(q)) {
    const lagnaRashi = kundali?.lagnaRashi || "मेष";
    const moonRashi = kundali?.moonRashi || "वृषभ";
    const dasha = kundali?.mahadasha || "गुरु";

    const LAGNA_GEM_MAP: Record<string, { lagnaGem: string; bhagyaGem: string; panchottarGem: string; avoid: string; rudraksha: string }> = {
      "मेष": { lagnaGem: "मूंगा (Red Coral - मंगल)", bhagyaGem: "पुखराज (Yellow Sapphire - गुरु)", panchottarGem: "माणिक्य (Ruby - सूर्य)", avoid: "पन्ना, हीरा व नीलम", rudraksha: "३ मुखी व ५ मुखी रुद्राक्ष" },
      "वृषभ": { lagnaGem: "हीरा / ओपल (Diamond/Opal - शुक्र)", bhagyaGem: "नीलम (Blue Sapphire - शनि)", panchottarGem: "पन्ना (Emerald - बुध)", avoid: "पुखराज, मूंगा व मोती", rudraksha: "६ मुखी व ७ मुखी रुद्राक्ष" },
      "मिथुन": { lagnaGem: "पन्ना (Emerald - बुध)", bhagyaGem: "नीलम (Blue Sapphire - शनि)", panchottarGem: "हीरा / ओपल (शुक्र)", avoid: "मूंगा व माणिक्य", rudraksha: "४ मुखी व ६ मुखी रुद्राक्ष" },
      "कर्क": { lagnaGem: "मोती (Natural Pearl - चंद्र)", bhagyaGem: "पुखराज (Yellow Sapphire - गुरु)", panchottarGem: "मूंगा (Red Coral - मंगल)", avoid: "नीलम, हीरा व पन्ना", rudraksha: "२ मुखी व ३ मुखी रुद्राक्ष" },
      "सिंह": { lagnaGem: "माणिक्य (Ruby - सूर्य)", bhagyaGem: "मूंगा (Red Coral - मंगल)", panchottarGem: "पुखराज (Yellow Sapphire - गुरु)", avoid: "नीलम व हीरा", rudraksha: "१ मुखी या १२ मुखी व ३ मुखी रुद्राक्ष" },
      "कन्या": { lagnaGem: "पन्ना (Emerald - बुध)", bhagyaGem: "हीरा / ओपल (शुक्र)", panchottarGem: "नीलम (शनि)", avoid: "मूंगा, मोती व माणिक्य", rudraksha: "४ मुखी व ६ मुखी रुद्राक्ष" },
      "तुला": { lagnaGem: "हीरा / सफेद जरकन / ओपल (शुक्र)", bhagyaGem: "पन्ना (Emerald - बुध)", panchottarGem: "नीलम (Blue Sapphire - शनि)", avoid: "माणिक्य, मूंगा व पुखराज", rudraksha: "६ मुखी व ७ मुखी रुद्राक्ष" },
      "वृश्चिक": { lagnaGem: "मूंगा (Red Coral - मंगल)", bhagyaGem: "मोती (Pearl - चंद्र)", panchottarGem: "पुखराज (Yellow Sapphire - गुरु)", avoid: "पन्ना, हीरा व नीलम", rudraksha: "३ मुखी व ५ मुखी रुद्राक्ष" },
      "धनु": { lagnaGem: "पुखराज (Yellow Sapphire - गुरु)", bhagyaGem: "माणिक्य (Ruby - सूर्य)", panchottarGem: "मूंगा (Red Coral - मंगल)", avoid: "हीरा, नीलम व पन्ना", rudraksha: "५ मुखी व १/१२ मुखी रुद्राक्ष" },
      "मकर": { lagnaGem: "नीलम (Blue Sapphire - शनि)", bhagyaGem: "पन्ना (Emerald - बुध)", panchottarGem: "हीरा / ओपल (शुक्र)", avoid: "माणिक्य, मोती व मूंगा", rudraksha: "७ मुखी व ६ मुखी रुद्राक्ष" },
      "कुंभ": { lagnaGem: "नीलम (Blue Sapphire - शनि)", bhagyaGem: "हीरा / ओपल (शुक्र)", panchottarGem: "पन्ना (Emerald - बुध)", avoid: "माणिक्य, मोती व मूंगा", rudraksha: "७ मुखी व ४ मुखी रुद्राक्ष" },
      "मीन": { lagnaGem: "पुखराज (Yellow Sapphire - गुरु)", bhagyaGem: "मूंगा (Red Coral - मंगल)", panchottarGem: "मोती (Pearl - चंद्र)", avoid: "पन्ना, हीरा व नीलम", rudraksha: "५ मुखी व २ मुखी रुद्राक्ष" },
    };

    const gInfo = LAGNA_GEM_MAP[lagnaRashi] || LAGNA_GEM_MAP["मेष"];

    return {
      ok: true,
      source: "local_vedic",
      text: `॥ ॐ रत्नेश्वराय नमः • त्रिकोण सिद्धांत आधारित रत्न एवं रुद्राक्ष निर्णय ॥

**१. त्वरित रत्न परामर्श (Executive Gemology Verdict)**
${
  kundali
    ? `यजमान **${kundali.name}** जी! आपकी **${lagnaRashi} लग्न** व **${moonRashi} राशि** (महादशा: **${dasha}**) के त्रिकोण (१-५-९ भाव) गणित के अनुसार आपके लिए **${gInfo.bhagyaGem}** और **${gInfo.lagnaGem}** सर्वोत्तम जीवन-रत्न हैं।`
    : `यजमान! वैदिक रत्न शास्त्र में सदैव लग्नेश (प्रथम भाव), पंचमेश (बुद्धि/इष्ट) और भाग्येश (नवम भाव) के रत्न ही धारण किए जाते हैं; षष्ठ, अष्टम व द्वादश भाव के रत्न कभी नहीं पहने जाते।`
}

**२. आपके लिए शुभ रत्न एवं रुद्राक्ष गणित (${lagnaRashi} लग्न आधार पर)**
• **लग्न रत्न (स्वास्थ्य व आत्मबल हेतु):** **${gInfo.lagnaGem}**
• **भाग्य रत्न (भाग्योदय, धन व करियर हेतु):** **${gInfo.bhagyaGem}**
• **पंचम/विद्या-इष्ट रत्न:** **${gInfo.panchottarGem}**
• **सर्वश्रेष्ठ वैदिक रुद्राक्ष:** **${gInfo.rudraksha}** *(रुद्राक्ष का कोई दुष्प्रभाव नहीं होता और यह तुरंत सकारात्मक आभा मंडल बनाता है)*
• **❌ वर्जित रत्न (कभी न पहनें):** **${gInfo.avoid}**

**३. रत्न प्राण-प्रतिष्ठा एवं धारण विधि**
१. **रत्ती भार:** अपने शरीर के वजन के प्रति १० किलोग्राम पर १ रत्ती (उदा. ६० किलो वजन हेतु ६ से सवा ६ रत्ती) दोषरहित रत्न चुनें।
२. **पंचामृत अभिषेक:** धारण करने से पूर्व संबंधित ग्रह के वार को प्रातः कच्चे दूध, गंगाजल, शहद, घी व शक्कर (पंचामृत) से स्नान कराएं।
३. **मंत्र जाग्रति:** धूप-दीप दिखाकर संबंधित ग्रह के बीज मंत्र का १०८ बार जप करके दाएं हाथ की निर्दिष्ट उंगली में धारण करें।

---
[अगले प्रश्न]:
• मेरे मूलांक व भाग्यांक के अनुसार कौन सा रत्न और रुद्राक्ष शुभ है?
• मेरी कुंडली में वर्तमान महादशा (${dasha}) के लिए कौन सा उपाय करें?
• बिना रत्न खरीदे ग्रहों को बली करने की वैदिक औषधि व जड़ (जड़ी) कौन सी है?`,
      actionPayload: { type: "open_gemology", label: "रत्न विज्ञान अध्याय खोलें" },
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
    chatHistory,
    systemPrompt,
  } = params;

  const isNumQuery = isNumerologyQuery(query);

  // Build automatic numerology context so online AI also knows exact numbers
  let autoNumerologyCtx = numerologyContext || "";
  if (!autoNumerologyCtx && (isNumQuery || activeKundali)) {
    const localNum = synthesizeNumerologyVerdict(query, activeKundali, panchang);
    autoNumerologyCtx = `\n[अंक ज्योतिष सूक्ष्म गणना]:\n${localNum.text}`;
  }

  const combinedKundaliContext = [kundaliContext, autoNumerologyCtx].filter(Boolean).join("\n\n");

  const defaultAction: AskUmaResponse["actionPayload"] = isNumQuery
    ? { type: "open_numerology", label: "अंक ज्योतिष व लो-शू चक्र देखें" }
    : activeKundali
    ? { type: "open_kundali", label: "जन्मकुंडली विस्तार देखें" }
    : { type: "open_panchang", label: "आज का पंचांग देखें" };

  // Primary online API endpoint (/api/uma/chat)
  if (typeof navigator === "undefined" || navigator.onLine !== false) {
    try {
      const lic = getLicenseStatus();
      const resp = await fetch("/api/uma/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-license-token": lic.token,
        },
        signal: AbortSignal.timeout(18000),
        body: JSON.stringify({
          query,
          panchangContext,
          kundaliContext: combinedKundaliContext,
          chatHistory,
          systemPrompt,
          licenseToken: lic.token,
        }),
      });

      if (resp.ok) {
        const data = await resp.json();
        if (data?.ok && typeof data.text === "string" && data.text.trim()) {
          const provider = data?.provider;
          const source =
            provider === "grok" || provider === "openrouter" || provider === "gemini"
              ? provider
              : "gemini";
          return {
            ok: true,
            text: data.text.trim(),
            source,
            actionPayload: defaultAction,
          };
        }
      }
    } catch (err) {
      console.warn("/api/uma/chat primary call failed, trying backup/offline:", err);
    }

    // Backup external server call
    try {
      const lic = getLicenseStatus();
      const resp = await fetch(UMA_PHP_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-license-token": lic.token,
        },
        signal: AbortSignal.timeout(8000),
        body: JSON.stringify({
          query,
          panchangContext,
          kundaliContext: combinedKundaliContext,
          chatHistory,
          systemPrompt,
          licenseToken: lic.token,
        }),
      });

      if (resp.ok) {
        const data = await resp.json();
        if (data?.ok && typeof data.text === "string" && data.text.trim()) {
          return {
            ok: true,
            text: data.text.trim(),
            source: "gemini",
            actionPayload: defaultAction,
          };
        }
      }
    } catch (err) {
      console.warn("UMA_PHP_URL backup failed, using 100% deterministic local Vedic engine:", err);
    }
  }

  // 100% Deterministic Local Vedic & Numerology Calculation Engine (Works completely offline!)
  const localRes = await generateUma({ query, kundali: activeKundali, panchang });
  return {
    ok: localRes.ok,
    text: localRes.text,
    source: "local_vedic",
    actionPayload: localRes.actionPayload,
  };
}

function chartAnswer(kundali: KundaliData, query: string, panchang?: VedicPanchangData | null): string {
  return synthesizeDynamicMicroVerdict(kundali, query, panchang);
}

/**
 * Attempts to construct a temporary Kundali on-the-fly if the user typed their birth date/time in chat
 * while offline and without a saved activeKundali.
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
      return {
        ok: true,
        source: "local_vedic",
        text: `॥ ॐ श्री गणेशाय नमः ॥\nप्रणाम यजमान! मैं **उमा** हूँ — आपकी वैदिक ज्योतिष एवं अंक-शास्त्र आचार्य। ५० वर्षों के अखंड पराशारी, जैमिनी, नाड़ी सिद्धांत और कीरो/लो-शू अंक ज्योतिष अनुभव से मैं आपकी जन्मपत्रिका व अंक-चक्र का सूक्ष्म विश्लेषण करने के लिए उपस्थित हूँ (ऑनलाइन व ऑफ़लाइन दोनों स्थितियों में १००% सटीक गणना)।\n\nआप मुझसे पूछ सकते हैं:\n• **🔢 अंक ज्योतिष:** मूलांक, भाग्यांक, नाम स्पेलिंग सुधार, लो-शू राजयोग, मोबाइल व वाहन नंबर जांच\n• **📜 जन्म कुण्डली:** D-1, D-9 नवमांश, D-10 दशमांश, विंशोत्तरी दशा, करियर, विवाह, धन व कर्ज मुक्ति\n• **📅 पंचांग व मुहूर्त:** आज का चौघड़िया, राहुकाल, अभिजित मुहूर्त, यात्रा दिशाशूल, वास्तु व रत्न परामर्श`,
        actionPayload: kundali
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
        text: `॥ ॐ वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ। निर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा॥\n\n**यजमान! आइए, मैं आपको वैदिक ब्राह्मण की तरह श्री गणेश स्थापना और पूजन करवाती हूँ। अपने आसन पर पूर्व या उत्तर की ओर मुख करके बैठ जाइए:**\n\n**चरण १: आचमन व पवित्रीकरण**\nहाथ में जल लेकर बोलें: *'ॐ अपवित्रः पवित्रो वा सर्वावस्थां गतोपि वा। यः स्मरेत्पुण्डरीकाक्षं स बाह्याभ्यन्तरः शुचिः॥'* (तीन बार जल आचमन करें)\n\n**चरण २: संकल्प (हाथ में अक्षत, पुष्प और जल लेकर)**\nबोलें: *'ममोपात्त-समस्त-दुर्व्ययक्षयपूर्वकं श्रीगणपति प्रीत्यर्थं मम सपरिवारस्य क्षेमारोग्यैश्वर्यवृद्धये श्रीगणेश पूजनमहं करिष्ये।'* (जल को जमीन पर छोड़ दें)\n\n**चरण ३: भगवान गणेश का आह्वान (प्रतिमा या सुपारी पर)**\n*'ॐ भूर्भुवः स्वः श्रीगणेशाय नमः। इहागच्छ इह तिष्ठ, सुप्रतिष्ठितो वरदो भव।'*\n\n**चरण ४: षोडशोपचार पूजन व दूर्वा अर्पण**\nगणेश जी को सिंदूर लगाएं और २१ दूर्वा चढ़ाते हुए बोलें: \n*'दूर्वाङ्कुरान् समर्पयामि ॐ गं गणपतये नमः। इदं दुर्वादलं समर्पयामि॥'* \n\nअब मोदक का भोग लगाएं और मेरी सिखाई गई गणेश आरती गाएं! बोलिए गणपति बाप्पा मोरया!`,
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
    const specialized = synthesizeSpecializedShastraVerdict(query, kundali);
    if (specialized) {
      return specialized;
    }

    // 9. PANCHANG / CHOGHADIYA / RAHUKAL / MUHURAT / DISHASHOOL INQUIRIES
    const asksToday = /आज|तिथि|पंचांग|मुहूर्त|चौघड़िया|राहुकाल|राहु काल|दिशाशूल|अभिजित|यमगण्ड|गुलिक|सूर्योदय|सूर्यास्त/.test(q);
    const asksChart = /नौकरी|शादी|विवाह|दशा|कुंडली|लग्न|सेहत|पैसा|धन|महादशा|साढ़ेसाती|मांगलिक|कर्ज|व्यापार/.test(q);
    if (asksToday && !asksChart) {
      return synthesizeLiveMuhuratPanchangVerdict(query, panchang);
    }

    // 10. KUNDALI / ASTROLOGY INQUIRIES (With saved Kundali OR parsed DOB from query)
    const effectiveKundali = kundali || tryParseKundaliFromQuery(query);
    if (effectiveKundali) {
      return {
        ok: true,
        source: "local_vedic",
        text: chartAnswer(effectiveKundali, query, panchang),
        actionPayload: { type: "open_kundali", label: "जन्मकुंडली विस्तार देखें" },
      };
    }

    // 11. Dynamic Vedic Guidance without Kundali (Uses live Panchang & Gochar math)
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
      text: `॥ ॐ नमः शिवाय ॥\nप्रणाम यजमान! भगवान शिव और श्रीगणेश जी की कृपा से आपका हर कार्य मंगलमय हो। कृपया अपना प्रश्न साझा करें, मैं प्रामाणिक वैदिक एवं अंक-ज्योतिष मार्गदर्शन प्रस्तुत करूँगी।`,
      actionPayload: { type: "open_panchang", label: "पंचांग देखें" },
    };
  }
}
