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
  const { query, panchang, activeKundali, panchangContext, kundaliContext, chatHistory, systemPrompt } = params;

  // Try Gemini AI consultation proxy first
  try {
    const lic = getLicenseStatus();
    const resp = await fetch("/api/uma/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-license-token": lic.token,
      },
      body: JSON.stringify({
        query,
        panchangContext,
        kundaliContext,
        chatHistory,
        systemPrompt,
        licenseToken: lic.token,
      }),
    });

    if (resp.ok) {
      const data = await resp.json();
      if (data.ok && data.text) {
        return {
          ok: true,
          text: data.text,
          source: "gemini",
        };
      }
    }
  } catch (err) {
    console.warn("Backend /api/uma/chat call failed, switching to local Vedic engine:", err);
  }

  // Fallback to local offline Vedic astrology engine
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

  const head = `॥ ॐ श्री गणेशाय नमः ॥\n\nसदा कल्याण हो, ${kundali.name} जी।\n\nआपकी पत्रिका (लग्न: ${kundali.lagnaRashi}, चंद्र राशि: ${kundali.moonRashi}, नक्षत्र: ${kundali.nakshatra}, वर्तमान महादशा: ${kundali.mahadasha}, अंतर्दशा: ${kundali.antardasha}) का सूक्ष्म अध्ययन करने पर:`;
  const today = panchang ? `\nआज ${panchang.weekday}, ${panchang.tithi}, नक्षत्र ${panchang.nakshatra} का गोचर प्रभाव भी सक्रिय है।` : "";

  if (/नौकरी|करियर|व्यापार|काम|धंधा|job|career|business/.test(q)) {
    return `${head}${today}\n\n**१. वर्तमान व हालिया स्थिति (Past & Present Insights):**\nकर्म भाव (दशम) में ${occupants(kundali, 10)} की स्थिति और वर्तमान ${kundali.mahadasha} महादशा के कारण पिछले कुछ समय से कार्यक्षेत्र में परिश्रम की तुलना में फल मिलने में विलंब या अनिश्चितता का अनुभव हुआ है। मानसिक रूप से जिम्मेदारियों का भारी दबाव रहा है।\n\n**२. आगामी मार्ग (Next 6–12 Months Path):**\nआगामी ६ से १२ महीनों में गोचर ग्रह आपके दशम और एकादश भाव पर अनुकूल दृष्टि डालेंगे। विशेषकर अंतर्दशा के परिवर्तन के साथ नए अवसर, पदोन्नति या व्यवसाय में नए संपर्क स्थापित होंगे।\n\n**३. सूक्ष्म शास्त्रोक्त उपाय (Micro-Remedy):**\nआपके दशमेश व कर्म कारक ग्रह के बलवर्धन हेतु: बुधवार की सांध्यवेला में किसी जरूरतमंद विद्यार्थी या कन्या को हरी मूंग की दाल अथवा हरे फल का दान करें, तथा नित्य प्रातः ॐ नमो भगवते वासुदेवाय का २१ बार जप करें।`;
  }
  if (/शादी|विवाह|दांपत्य|पति|पत्नी|प्रेम|मिलान|marriage|love/.test(q)) {
    return `${head}\n\n**१. वर्तमान व हालिया स्थिति (Past & Present Insights):**\nसप्तम भाव में ${occupants(kundali, 7)} की स्थिति और शुक्र/गुरु के प्रभाव से रिश्तों में संवाद की कमी या अपेक्षाओं का असंतुलन बना रहा है। ${kundali.isManglik ? "मंगल की विशेष स्थिति के कारण स्वभाव में उग्रता या वैचारिक मतभेद उभरे हैं।" : "दशा के प्रभाव से संबंध में मानसिक खिंचाव रहा है।"}\n\n**२. आगामी मार्ग (Next 6–12 Months Path):**\nआगामी महीनों में गुरु का शुभ गोचर सप्तम भाव को संबल देगा। विवाह योग्य जातकों के लिए शीघ्र ही योग्य प्रस्ताव व दांपत्य में सामंजस्य की स्थिति बनेगी।\n\n**३. सूक्ष्म शास्त्रोक्त उपाय (Micro-Remedy):**\nसप्तम भाव की शांति हेतु: शुक्रवार के दिन सायंकाल घी का दीपक जलाकर माँ लक्ष्मी के समक्ष श्वेत पुष्प अर्पित करें और किसी सुहागिन महिला को मिश्री व सफेद वस्त्र/खीर का दान दें।`;
  }
  if (/पैसा|धन|ऋण|लोन|money|finance|wealth/.test(q)) {
    return `${head}\n\n**१. वर्तमान व हालिया स्थिति (Past & Present Insights):**\nद्वितीय (धन) भाव में ${occupants(kundali, 2)} एवं एकादश (लाभ) भाव में ${occupants(kundali, 11)} की स्थिति दर्शाती है कि आय के साधन बने रहने के बावजूद अप्रत्याशित पारिवारिक या आकस्मिक खर्चों के कारण बचत में रुकावट आई है।\n\n**२. आगामी मार्ग (Next 6–12 Months Path):**\nआगामी ६ माह में धन के नए स्रोत खुलेंगे। रुका हुआ धन धीरे-धीरे प्राप्त होने लगेगा और ऋण के दबाव में कमी आएगी।\n\n**३. सूक्ष्म शास्त्रोक्त उपाय (Micro-Remedy):**\nधन संचय हेतु: गुरुवार के दिन प्रातः स्नान के जल में एक चुटकी हल्दी डालकर स्नान करें, और बेसन के २ लड्डू किसी वृद्ध ब्राह्मण या गौमाता को अर्पित करें।`;
  }
  if (/सेहत|स्वास्थ्य|बीमार|रोग|health/.test(q)) {
    return `${head}\n\n**१. वर्तमान व हालिया स्थिति (Past & Present Insights):**\nषष्ठ भाव में ${occupants(kundali, 6)} एवं अष्टम में ${occupants(kundali, 8)} की स्थिति तथा ${sadeLine} के कारण मानसिक तनाव, अनिद्रा अथवा पाचन/वात जनित शिथिलता का अनुभव रहा है।\n\n**२. आगामी मार्ग (Next 6–12 Months Path):**\nदशा में शुभ ग्रह के प्रत्यंतर प्रवेश से स्वास्थ्य में सुधार होगा। ऊर्जा और स्फूर्ति में वृद्धि होगी।\n\n**३. सूक्ष्म शास्त्रोक्त उपाय (Micro-Remedy):**\nआरोग्य रक्षा हेतु: सोमवार के दिन तांबे के लोटे में जल व दुर्वा डालकर भगवान शिव को 'ॐ जूं सः' मंत्र का ११ बार जप करते हुए अर्पित करें।`;
  }
  if (/शनि|साढ़े|ढैया|shani|sade|dhaiya/.test(q)) {
    return `${head}\n\n**१. वर्तमान व हालिया स्थिति (Past & Present Insights):**\n${sadeLine}\n${planetLine(saturn)}। पिछले समय में कार्यों में विलंब, मानसिक बेचैनी व अत्यधिक श्रम की अनुभूति रही है।\n\n**२. आगामी मार्ग (Next 6–12 Months Path):**\nशनि देव न्यायप्रिय हैं; आगामी महीनों में आपके धैर्य का फल मिलना प्रारंभ होगा। रुका हुआ कार्य धीरे-धीरे गति पकड़ेगा।\n\n**३. सूक्ष्म शास्त्रोक्त उपाय (Micro-Remedy):**\nशनिवार की संध्या को काले तिल व सरसों के तेल का दीपक पीपल वृक्ष के नीचे प्रज्वलित करें, एवं किसी दिव्यांग या असहाय व्यक्ति को तिल-गुड़ या भोजन अर्पित करें।`;
  }
  if (/मंगल|मांगलिक|manglik|mars/.test(q)) {
    return `${head}\n\n**१. वर्तमान व हालिया स्थिति (Past & Present Insights):**\n${planetLine(mars)}। ${kundali.isManglik ? `आपकी पत्रिका में मांगलिक योग सक्रिय है (${kundali.manglikDescription || "प्रथम/चतुर्थ/सप्तम/अष्टम/द्वादश भाव में मंगल"})। इसके प्रभाव से स्वभाव में शीघ्र उत्तेजना, अधीरता या संबंधों में तीक्ष्णता का अनुभव रहा है।` : "जन्म पत्रिका में अमंगल दोष नहीं है, परंतु मंगल के तेज से कार्यों में उतावलापन रहा है।"}\n\n**२. आगामी मार्ग (Next 6–12 Months Path):**\nआगामी गोचर में मंगल का बल आपको साहस व निर्णय शक्ति देगा। भूमि, भवन व तकनीकी कार्यों में सफलता के मार्ग प्रशस्त होंगे।\n\n**३. सूक्ष्म शास्त्रोक्त उपाय (Micro-Remedy):**\nमंगल शांति व सामंजस्य हेतु: मंगलवार के दिन तंदूर की मीठी रोटी या गुड़-चना बंदरों/लाल गाय को खिलाएं और मस्तक पर नित्य लाल चंदन या केसर का तिलक लगाएं।`;
  }

  const graha = (kundali.planets || [])
    .map((p) => `${p.planet}: ${p.rashi}, भाव ${p.house}${p.isRetrograde ? ", वक्री" : ""}`)
    .join("\n");
  return `${head}${today}\n\n**१. वर्तमान दशा व हालिया स्थिति (Past & Present Insights):**\nआपकी पत्रिका में ${kundali.mahadasha} महादशा एवं ${kundali.antardasha} अंतर्दशा प्रभावी है। हाल के समय में जीवन में बड़े परिवर्तनों और वैचारिक मंथन का दौर रहा है।\n\n**२. आगामी मार्ग (Next 6–12 Months Path):**\nग्रह गोचर के अनुसार आगामी ६ से १२ महीने आपके आत्मबल और कर्मक्षेत्र में नई दिशा निर्धारित करेंगे।\n\n**३. सूक्ष्म शास्त्रोक्त उपाय (Micro-Remedy):**\nअपने लग्न के अधिपति ग्रह के बलवर्धन हेतु: नित्य प्रातः सूर्य देव को तांबे के पात्र से कुमकुम व अक्षत मिश्रित जल अर्पित करें और 'ॐ नमो भगवते वासुदेवाय' का २१ बार जप करें।\n\n(ग्रह स्थिति संक्षेप: ${sadeLine})`;
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

    // 2.5 SHIV MAHIMANA STOTRA
    if (q.includes("महिम्न") || q.includes("शिव महिम्न") || q.includes("pushpdant") || q.includes("महिमान")) {
      return {
        ok: true,
        source: "local_vedic",
        text: `॥ श्री शिव महिम्न स्तोत्र (गंधर्वराज पुष्पदंत रचित) ॥\n\nमहिम्नः पारं ते परमविदुषो यद्यपि विधुः\nस्तुवन्तो ब्रह्माणो अपि हरनभयद्वेतयितुमः।\nतदस्यात्मनः क्लेशो हरसि महतां च प्रमदतः\nस्तवोह्यर्वाचीनः क्व च मम मतिः क च तव गुणान् ॥१॥\n\nअतीतपंथानं तव च महिमा वाङ्मनसयो-\nर्जगत्याः प्रणेता त्वमसि खलु सर्वेषु च विभो।\nकथं स्तुत्यः स्तुत्यः कथमपि च ते ध्यानविषयो\nभवेद् देव त्राहि प्रणतभयहारिन् शिव विभो ॥२॥\n\n**उमा का पुरोहितीय उपदेश:**\nशिव महिम्न स्तोत्र का पाठ गंधर्वराज पुष्पदंत ने किया था। इसके नित्य पाठ से मनुष्य के समस्त पाप नष्ट होते हैं और भगवान शिव की असीम कृपा प्राप्त होती है।`,
        actionPayload: { type: "open_panchang", label: "व्रत कथा व आरती देखें" }
      };
    }

    // 2.6 DAILY PRAYERS (MORNING, BHOJAN, SANDHYA, SLEEP)
    if (q.includes("सुबह") || q.includes("उठते") || q.includes("कराग्रे") || q.includes("प्रातः स्मरण")) {
      return {
        ok: true,
        source: "local_vedic",
        text: `॥ प्रातः स्मरण एवं करदर्शन मंत्र ॥\n\nकराग्रे वसते लक्ष्मीः करमध्ये सरस्वती।\nकरमूले तू गोविन्दः प्रभाते करदर्शनम्॥\n\n**भूमि वंदन (पैर रखने से पूर्व):**\nसमुद्रवसने देवी पर्वतपण्डितमंडिते।\nविष्णुपत्नि नमस्तुभ्यं पादस्पर्शं क्षमस्व मे॥\n\n**उमा का उपदेश:**\nप्रातःकाल शय्या से उठते ही दोनों हथेलियों के दर्शन करने से लक्ष्मी, सरस्वती और विष्णु जी का आशीर्वाद प्राप्त होता है।`,
        actionPayload: { type: "open_panchang", label: "नित्य मंत्र देखें" }
      };
    }

    if (q.includes("भोजन") || q.includes("खाना") || q.includes("ब्रह्मार्पणं") || q.includes("प्रसाद")) {
      return {
        ok: true,
        source: "local_vedic",
        text: `॥ भोजन के समय का पवित्र मंत्र (अन्नपूर्णा स्तुति) ॥\n\nब्रह्मार्पणं ब्रह्म हविर्ब्रह्माग्नौ ब्रह्मणा हुतम्।\nब्रह्मैव तेन गन्तव्यं ब्रह्मकर्मसमाधिना॥\n\n**अन्नपूर्णा मंत्र:**\nॐ अन्नपूर्णे सदापूर्णे शङ्करप्राणवल्लभे।\nज्ञानवैराग्यसिद्ध्यर्थं भिक्षां देहि च पार्ति च॥\n\n**उमा का उपदेश:**\nभोजन ग्रहण करने से पूर्व इस मंत्र का पाठ करने से भोजन प्रसाद बन जाता है और शरीर व मन दोनों सात्विक रहते हैं।`,
        actionPayload: { type: "open_panchang", label: "पंचांग देखें" }
      };
    }

    if (q.includes("संध्या") || q.includes("प्रदोष") || q.includes("गुरुर्ब्रह्मा") || q.includes("दीप प्रज्वलन")) {
      return {
        ok: true,
        source: "local_vedic",
        text: `॥ संध्या समय एवं दीप प्रज्वलन मंत्र ॥\n\nशुभं करोतु कल्याणं आरोग्यं धनसम्पदाम्।\nशत्रुबुद्धिविनाशाय दीपज्योतिर्नमोऽस्तु ते॥\n\n**गुरु वंदना:**\nगुरुर्ब्रह्मा गुरुर्विष्णुः गुरुर्देवो महेश्वरः।\nगुरुः साक्षात् परं ब्रह्म तस्मै श्रीगुरवे नमः॥\n\n**उमा का उपदेश:**\nसंध्याकाल में घर में दीपक जलाते समय इस मंत्र का उच्चारण करने से घर में नकारात्मक ऊर्जा समाप्त होती है और लक्ष्मी का वास होता है।`,
        actionPayload: { type: "open_panchang", label: "पंचांग देखें" }
      };
    }

    if (q.includes("सोने") || q.includes("रात्रि") || q.includes("शयन") || q.includes("अच्युतं") || q.includes("करचरण") || q.includes("क्षमा")) {
      return {
        ok: true,
        source: "local_vedic",
        text: `॥ रात्रि को सोते समय की शिव क्षमा प्रार्थना ॥\n\nकरचरणकृतं वा कायजं कर्मजं वा\nश्रवणनयनजं वा मानसं वा अपराधम्।\nविहितमविहितं वा सर्वमेतत्क्षमस्व\nजय जय करुणाब्धे श्रीमहादेव शम्भो॥\n\n**उमा का पुरोहितीय उपदेश:**\nरात्रि को शयन से पूर्व इस शिव क्षमा प्रार्थना का पाठ करने से दिनभर में अनजाने में हाथ, पैर, वाणी, मन या कर्म से हुए समस्त पाप और अपराध भगवान शिव क्षमा कर देते हैं और शांत व पवित्र नींद आती है।`,
        actionPayload: { type: "open_panchang", label: "पंचांग देखें" }
      };
    }

    // 2.7 ALL OTHER VRAT KATHAS (SATYANARAYAN, HARTALIKA, CHHATH, DHANTERAS, DEEPAWALI, EKADASHI)
    if (q.includes("सत्यनारायण") || q.includes("हरतालिका") || q.includes("छठ") || q.includes("धनतेरस") || q.includes("दीपावली") || q.includes("एकादशी") || q.includes("व्रत कथा")) {
      return {
        ok: true,
        source: "local_vedic",
        text: `॥ वैदिक व्रत कथा एवं पूजन विधान — उमा द्वारा मार्गदर्शन ॥\n\nयजमान, आपने जिस व्रत या कथा (सत्यनारायण, हरतालिका तीज, छठ पूजा, धनतेरस, दीपावली या एकादशी) का स्मरण किया है, उसकी संपूर्ण कथा, संस्कृत श्लोक और विधि-विधान हमारे ऐप के **"व्रत कथा व आरती"** अध्याय में सस्वर और विस्तार से उपलब्ध है!\n\nआप ऐप के मेनू से **व्रत कथा** खोलकर पूर्ण स्कन्दपुराण व शिवपुराणोक्त कथा का पाठ कर सकती हैं। बोलिए भगवान विष्णु और माता पार्वती की जय!`,
        actionPayload: { type: "open_panchang", label: "व्रत कथा अध्याय खोलें" }
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
