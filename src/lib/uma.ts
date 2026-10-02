import { KundaliData, PlanetPosition, VedicPanchangData } from "../types";
import { getLicenseStatus } from "./license-client";
import { calculateSadeSati } from "../services/sadesati";

export interface UmaResponse {
  ok: boolean;
  text: string;
  source: "local_vedic" | "gemini" | "hybrid";
  actionPayload?: {
    type: "open_panchang" | "open_choghadiya" | "open_kundali" | "open_yatra" | "open_muhurat";
    label: string;
  };
}

export interface AskUmaParams {
  query: string;
  panchangContext?: string;
  kundaliContext?: string;
  chatHistory?: Array<{ sender: "user" | "uma"; text: string }>;
  panchang?: VedicPanchangData | null;
  activeKundali?: KundaliData | null;
  systemPrompt?: string;
}

export interface AskUmaResponse {
  ok: boolean;
  text: string;
  source: "gemini" | "local_vedic";
  actionPayload?: {
    type: "open_panchang" | "open_choghadiya" | "open_kundali" | "open_yatra" | "open_muhurat";
    label: string;
  };
}

export async function askUma(params: AskUmaParams): Promise<AskUmaResponse> {
  const { query, panchang, activeKundali } = params;
  const localRes = await generateUma({ query, kundali: activeKundali, panchang });
  return {
    ok: localRes.ok,
    text: localRes.text,
    source: "local_vedic",
    actionPayload: localRes.actionPayload,
  };
}

function planetLine(p?: PlanetPosition): string {
  if (!p) return "";
  return `${p.planet} ${p.rashi} राशि में, लग्न से ${p.house}वें भाव में${p.isRetrograde ? " (वक्री)" : ""}`;
}

function occupants(kundali: KundaliData, house: number): string {
  const names = (kundali.planets || []).filter((p) => p.house === house).map((p) => p.planet);
  return names.length ? names.join(", ") : "कोई ग्रह नहीं";
}

function chartAnswer(kundali: KundaliData, query: string, panchang?: VedicPanchangData | null): string {
  const q = query.toLowerCase();
  const sun = kundali.planets?.find((p) => p.planet === "सूर्य");
  const moon = kundali.planets?.find((p) => p.planet === "चंद्र");
  const mars = kundali.planets?.find((p) => p.planet === "मंगल");
  const mercury = kundali.planets?.find((p) => p.planet === "बुध");
  const jupiter = kundali.planets?.find((p) => p.planet === "गुरु");
  const venus = kundali.planets?.find((p) => p.planet === "शुक्र");
  const saturn = kundali.planets?.find((p) => p.planet === "शनि");
  let sadeLine = "";
  try {
    const sade = calculateSadeSati(kundali);
    sadeLine = sade.isUnderSadeSati
      ? `साढ़ेसाती चल रही है। ${sade.summary}`
      : sade.isDhaiya
        ? `ढैया है: ${sade.dhaiyaType || "शनि का विशेष गोचर"}। ${sade.summary}`
        : `साढ़ेसाती नहीं है। शनि अभी ${sade.shaniCurrentRashi} में, चंद्र राशि से ${sade.shaniTransitHouse}वें भाव में।`;
  } catch {
    sadeLine = planetLine(saturn);
  }

  const head = `॥ ॐ श्री गणेशाय नमः ॥\n${kundali.name} जी, लग्न ${kundali.lagnaRashi}, चंद्र ${kundali.moonRashi} (${kundali.nakshatra}), महादशा ${kundali.mahadasha}, अंतरदशा ${kundali.antardasha}।`;
  const today = panchang ? `\nआज ${panchang.weekday}, ${panchang.tithi}, नक्षत्र ${panchang.nakshatra}।` : "";

  if (/नौकरी|करियर|व्यापार|काम|धंधा|job|career/.test(q)) {
    return `${head}${today}\n\nकर्म भाव (दसवाँ) में: ${occupants(kundali, 10)}।\n${planetLine(sun)}\n${planetLine(saturn)}\n${planetLine(mercury)}\n${planetLine(jupiter)}\n\nदशा ${kundali.mahadasha}/${kundali.antardasha} इसी कर्मफल को अभी खोल रही है।`;
  }
  if (/शादी|विवाह|दांपत्य|पति|पत्नी|प्रेम|मिलान/.test(q)) {
    return `${head}\n\nसप्तम भाव में: ${occupants(kundali, 7)}।\n${planetLine(venus)}\n${planetLine(jupiter)}\nमांगलिक: ${kundali.isManglik ? `हाँ। ${kundali.manglikDescription || "मंगल दोष की शांति करें।"}` : "स्पष्ट मांगलिक दोष नहीं दिखता।"}`;
  }
  if (/पैसा|धन|ऋण|लोन/.test(q)) {
    return `${head}\n\nद्वितीय भाव में: ${occupants(kundali, 2)}। एकादश भाव में: ${occupants(kundali, 11)}।\n${planetLine(jupiter)}\n${planetLine(venus)}`;
  }
  if (/सेहत|स्वास्थ्य|बीमार|रोग/.test(q)) {
    return `${head}\n\nषष्ठ भाव में: ${occupants(kundali, 6)}। अष्टम में: ${occupants(kundali, 8)}।\n${planetLine(moon)}\n${planetLine(sun)}\n${sadeLine}\n\nयह चिकित्सा नहीं है। दशा में शरीर वाला भाव कमजोर हो तो जाँच कराएँ।`;
  }
  if (/शनि|साढ़े|ढैया/.test(q)) {
    return `${head}\n${sadeLine}\n${planetLine(saturn)}\nउपाय: शनिवार को तिल का दीप और हनुमान चालीसा।`;
  }
  if (/मंगल|मांगलिक/.test(q)) {
    return `${head}\n${planetLine(mars)}\n${kundali.isManglik ? `मांगलिक स्थिति है। ${kundali.manglikDescription || ""}` : "जन्म पत्रिका में मांगलिक दोष अंकित नहीं है।"}\nहनुमान उपासना इस ग्रह का सीधा उपाय है।`;
  }

  const graha = (kundali.planets || [])
    .map((p) => `${p.planet}: ${p.rashi}, भाव ${p.house}${p.isRetrograde ? ", वक्री" : ""}`)
    .join("\n");
  return `${head}${today}\n\n${sadeLine}\n\nग्रह स्थिति:\n${graha}\n\nपूछें: नौकरी, विवाह, धन, स्वास्थ्य, शनि या मंगल। उत्तर इसी पत्रिका से होगा।`;
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

    // 0. Greeting & Introduction
    if (q.includes("नमस्ते") || q.includes("हेलो") || q.includes("hello") || q.includes("hi") || q.includes("परिचय") || q.includes("तुम कौन हो") || q.includes("प्रणाम")) {
      return {
        ok: true,
        source: "local_vedic",
        text: `॥ ॐ श्री गणेशाय नमः ॥\nप्रणाम यजमान! मैं **उमा** हूँ — आपकी वैदिक ज्योतिष आचार्य और कर्मकाण्ड पुरोहित। आज (${panchang?.weekday || 'सोमवार'}, ${panchang?.paksha || 'कृष्ण'} पक्ष) मैं एक वैदिक ब्राह्मण की तरह आपको गणेश स्थापना, गणेश पूजन, करवा चौथ या किसी भी अनुष्ठान का संकल्प, मंत्रोच्चार और विधि-विधान पूरे सस्वर और श्रद्धा के साथ करवा सकती हूँ। आप मुझसे पूछिए — आज कौन सा पूजन करवाना है?`,
        actionPayload: kundali ? { type: "open_kundali", label: "कुंडली विश्लेषण देखें" } : { type: "open_panchang", label: "आज का पंचांग देखें" }
      };
    }

    // 1. GANPATI STHAPANA / PUJAN GUIDANCE BY UMA
    if (q.includes("गणेश स्थापना") || q.includes("गणपति स्थापना") || q.includes("गणेश पूजा") || q.includes("गणेश पूजन") || q.includes("sthapana") || q.includes("पूजन करवाओ") || q.includes("पूजा करवाओ")) {
      return {
        ok: true,
        source: "local_vedic",
        text: `॥ ॐ वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ। निर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा॥\n\n**यजमान! आइए, मैं आपको वैदिक ब्राह्मण की तरह श्री गणेश स्थापना और पूजन करवाती हूँ। अपने आसन पर पूर्व या उत्तर की ओर मुख करके बैठ जाइए:**\n\n**चरण १: आचमन व पवित्रीकरण**\nहाथ में जल लेकर बोलें: *'ॐ अपवित्रः पवित्रो वा सर्वावस्थां गतोपि वा। यः स्मरेत्पुण्डरीकाक्षं स बाह्याभ्यन्तरः शुचिः॥'* (तीन बार जल आचमन करें)\n\n**चरण २: संकल्प (हाथ में अक्षत, पुष्प और जल लेकर)**\nबोलें: *'ममोपात्त-समस्त-दुर्व्ययक्षयपूर्वकं श्रीगणपति प्रीत्यर्थं मम सपरिवारस्य क्षेमारोग्यैश्वर्यवृद्धये श्रीगणेश पूजनमहं करिष्ये।'* (जल को जमीन पर छोड़ दें)\n\n**चरण ३: भगवान गणेश का आह्वान (प्रतिमा या सुपारी पर)**\n*'ॐ भूर्भुवः स्वः श्रीगणेशाय नमः। इहागच्छ इह तिष्ठ, सुप्रतिष्ठितो वरदो भव।'*\n\n**चरण ४: षोडशोपचार पूजन व दूर्वा अर्पण**\nगणेश जी को सिंदूर लगाएं और २१ दूर्वा चढ़ाते हुए बोलें: \n*'दूर्वाङ्कुरान् समर्पयामि ॐ गं गणपतये नमः। इदं दुर्वादलं समर्पयामि॥'* \n\nअब मोदक का भोग लगाएं और मेरी सिखाई गई गणेश आरती गाएं! बोलिए गणपति बाप्पा मोरया!`,
        actionPayload: { type: "open_panchang", label: "व्रत कथा व विधि देखें" }
      };
    }

    // 2. KARWA CHAUTH PUJAN GUIDANCE BY UMA
    if (q.includes("करवा चौथ") || q.includes("karwa") || q.includes("chauth") || q.includes("चौथ पूजा")) {
      return {
        ok: true,
        source: "local_vedic",
        text: `॥ करवा चौथ व्रत पूजन विधान — उमा द्वारा मार्गदर्शन ॥\n\n**सौभाग्यवती बहनों, आइए करवा चौथ का पूजन विधिपूर्वक संपन्न करें:**\n\n**संकल्प मंत्र:**\n*'करकचतुर्थी व्रतमिदं करिष्ये व्रतसंस्थितः। पतिसौभाग्यवृद्धयर्थं सुसंस्थिता भवाम्यहम्॥'* \n\n**पूजन विधि:**\n१. दीवार पर गेरू से चौका बनाकर करवा, सूर्य और चंद्रमा का चित्र बनाएं अथवा कैलेंडर स्थापित करें।\n२. माँ गौरी और भगवान गणेश का रोधि, अक्षत, धूप और पुष्प से पूजन करें।\n३. माँ पार्वती को सुहाग की पिटारी (बिंदी, चूड़ी, सिंदूर) अर्पित करें।\n४. संध्याकाल में करवा चौथ की कथा सुनें और चंद्रमा उदय होने पर छलनी से चंद्र दर्शन कर अर्घ्य दें।`,
        actionPayload: { type: "open_panchang", label: "व्रत कथा सूची देखें" }
      };
    }

    // Chart questions must win over the generic "आज" panchang reply.
    if (kundali && /नौकरी|करियर|व्यापार|शादी|विवाह|दांपत्य|धन|पैसा|स्वास्थ्य|सेहत|शनि|साढ़े|मंगल|मांगलिक|दशा|कुंडली|लग्न/.test(q)) {
      return {
        ok: true,
        source: "local_vedic",
        text: chartAnswer(kundali, query, panchang),
        actionPayload: { type: "open_kundali", label: "जन्मकुंडली विस्तार देखें" },
      };
    }

    // 3. PANCHANG / TITHI / SOMWAR
    if (q.includes("आज") || q.includes("सोमवार") || q.includes("कृष्ण") || q.includes("शुक्ल") || q.includes("पक्ष") || q.includes("तिथि") || q.includes("पंचांग")) {
      const wDay = panchang?.weekday || "सोमवार";
      const pKash = panchang?.paksha || "कृष्ण";
      const tth = panchang?.tithi || "द्वितीया";
      return {
        ok: true,
        source: "local_vedic",
        text: `॥ ॐ नमः शिवाय ॥\nयजमान, आज ${wDay} को ${pKash} पक्ष की **${tth}** तिथि है। आज के दिन भगवान शिव का जलाभिषेक और महामृत्युंजय मंत्र का जप करने से सभी कष्ट दूर होते हैं। आप मुझसे कोई भी अनुष्ठान या पूजा विधि पूछ सकती हैं!`,
        actionPayload: { type: "open_panchang", label: "सम्पूर्ण पंचांग देखें" }
      };
    }

    // 4. KUNDALI / PATRIKA
    if (q.includes("कुंडली") || q.includes("पत्री") || q.includes("पत्रिका") || q.includes("लग्न") || q.includes("दशा")) {
      if (kundali) {
        return {
          ok: true,
          source: "local_vedic",
          text: chartAnswer(kundali, query, panchang),
          actionPayload: { type: "open_kundali", label: "जन्मकुंडली विस्तार देखें" },
        };
      }
      return {
        ok: true,
        source: "local_vedic",
        text: `॥ ॐ श्री गणेशाय नमः ॥\nयजमान, बिना जन्म तिथि, समय और स्थान के दशा नहीं खुलती। पहले कुंडली बनाएँ, फिर नौकरी, विवाह, धन या शनि पूछें।`,
        actionPayload: { type: "open_kundali", label: "जन्मकुंडली बनाएँ" },
      };
    }

    if (kundali) {
      return {
        ok: true,
        source: "local_vedic",
        text: chartAnswer(kundali, query, panchang),
        actionPayload: { type: "open_kundali", label: "जन्मकुंडली विस्तार देखें" },
      };
    }

    // DEFAULT / GENERAL ASTROLOGICAL & PUJAN GUIDANCE
    return {
      ok: true,
      source: "local_vedic",
      text: `॥ ॐ श्री गणेशाय नमः ॥\nप्रणाम यजमान! आपके प्रश्न पर मैंने वैदिक ज्योतिष और कर्मकाण्ड के नियमों के अनुसार विचार किया है। \n\n**उमा का पुरोहितीय मार्गदर्शन:**\nकिसी भी धार्मिक अनुष्ठान, गणेश स्थापना, सत्यनारायण कथा या व्रत पूजन को विधि-विधान से करने पर उसका शत-प्रतिशत फल प्राप्त होता है। \n\nआप मुझसे पूछिए — **"उमा जी, गणेश स्थापना कैसे करें?"**, **"करवा चौथ की पूजा विधि बताओ"**, या **"सत्यनारायण व्रत कथा सुनाओ"**, और मैं एक वैदिक ब्राह्मण की तरह आपको पूरी विधि और मंत्र करवाऊंगी!`,
      actionPayload: { type: "open_panchang", label: "व्रत कथा व विधि देखें" }
    };

  } catch (err) {
    console.error("Uma generation error:", err);
    return {
      ok: true,
      source: "local_vedic",
      text: `॥ ॐ नमः शिवाय ॥\nप्रणाम यजमान! भगवान शिव और गणेश जी की कृपा से आपका हर कार्य मंगलमय हो। कृपया अपना प्रश्न दोहराएं, मैं पूरी विधि के साथ पूजन संपन्न करवाऊँगी।`,
      actionPayload: { type: "open_panchang", label: "पंचांग देखें" }
    };
  }
}
