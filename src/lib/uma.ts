import { KundaliData, VedicPanchangData } from "../types";
import { analyzeKundali } from "../services/predictions";
import { DISHASHOOL_MAP, TRAVEL_REMEDIES } from "../services/disha";
import { getDayChoghadiya, getCurrentChoghadiya, getInauspiciousWindows, getAuspiciousWindows } from "../services/choghadiya";

export interface AskUmaParams {
  query: string;
  panchangContext?: string;
  kundaliContext?: string;
  chatHistory?: Array<{ sender: "user" | "uma"; text: string }>;
  panchang?: VedicPanchangData;
  activeKundali?: KundaliData | null;
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

/**
 * Ask Uma AI - Calls the full-stack server-side Gemini endpoint /api/uma/chat.
 * If server is unavailable, network fails, or API key is absent, seamlessly
 * falls back to deep local Vedic astrological calculations.
 */
export async function askUma(params: AskUmaParams): Promise<AskUmaResponse> {
  const { query, panchangContext, kundaliContext, chatHistory, panchang, activeKundali } = params;

  try {
    const res = await fetch("/api/uma/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query,
        panchangContext: panchangContext || "",
        kundaliContext: kundaliContext || "",
        chatHistory: chatHistory || [],
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.ok && data.text) {
        return {
          ok: true,
          text: data.text,
          source: "gemini",
          actionPayload: inferActionPayload(query),
        };
      }
    }
  } catch (err) {
    // Network or server error - seamlessly proceed to local engine
    console.warn("Uma server call fallback to local engine:", err);
  }

  // Fallback to advanced local Vedic calculation engine
  return localVedicInference(query, panchang, activeKundali);
}

function inferActionPayload(query: string): AskUmaResponse["actionPayload"] {
  const q = query.toLowerCase();
  if (q.includes("कुंडली") || q.includes("दशा") || q.includes("लग्न") || q.includes("ग्रह") || q.includes("kundali")) {
    return { type: "open_kundali", label: "सम्पूर्ण कुंडली चक्र देखें" };
  }
  if (q.includes("चौघड़िया") || q.includes("choghadiya")) {
    return { type: "open_choghadiya", label: "चौघड़िया तालिका देखें" };
  }
  if (q.includes("मुहूर्त") || q.includes("राहुकाल") || q.includes("अभिजित")) {
    return { type: "open_muhurat", label: "शुभ मुहूर्त व काल" };
  }
  if (q.includes("यात्रा") || q.includes("दिशाशूल") || q.includes("travel")) {
    return { type: "open_yatra", label: "यात्रा कैलकुलेटर देखें" };
  }
  return undefined;
}

/**
 * Advanced Local Vedic Inference Engine
 * Performs real astrological calculations on KundaliData & Panchang
 */
export function localVedicInference(
  query: string,
  panchang?: VedicPanchangData,
  kundali?: KundaliData | null
): AskUmaResponse {
  const q = query.toLowerCase().trim();

  // Helper for formatting time
  const formatT = (d: Date) =>
    d.toLocaleTimeString("hi-IN", { hour: "2-digit", minute: "2-digit" });

  // 1. FULL KUNDALI READING & REMEDIES
  if (
    q.includes("सम्पूर्ण") ||
    q.includes("पूरा फलादेश") ||
    q.includes("फुल रीडिंग") ||
    q.includes("कुंडली चेक") ||
    q.includes("कुंडली देखो") ||
    q.includes("kundali check") ||
    (q.includes("कुंडली") && q.includes("उपाय"))
  ) {
    if (!kundali) {
      return {
        ok: true,
        source: "local_vedic",
        text: `॥ ॐ नमः शिवाय ॥\n**उमा का परामर्श:**\nवर्तमान में आपकी कोई जन्म कुंडली सक्रिय नहीं है।\n\nसटीक फलादेश व उपायों के लिए कृपया ऐप में **'कुंडली'** टैब पर जाएं और अपना जन्म दिनांक, समय व स्थान दर्ज करें, अथवा सहेजी गई प्रोफाइल चुनें। इसके पश्चात मैं आपकी कुंडली के समस्त १२ भावों, ग्रहों और दशा का पूर्ण विश्लेषण करूँगी।`,
        actionPayload: { type: "open_kundali", label: "जन्म कुंडली बनाएँ" },
      };
    }

    const analysis = analyzeKundali(kundali);
    const lagnaLord = kundali.planets.find((p) => p.house === 1)?.planet || "लग्नेश";
    const dashaText = `वर्तमान में आपकी **${kundali.mahadasha}** की महादशा में **${kundali.antardasha}** की अंतर्दशा चल रही है।`;

    const yogasStr =
      analysis.yogas.length > 0
        ? analysis.yogas.map((y) => `• ${y}`).join("\n")
        : "• कुंडली में सामान्य शुभ ग्रह स्थिति विद्यमान है।";

    const doshaStr = kundali.isManglik
      ? `• **मांगलिक विचार:** जातक मांगलिक है (${kundali.manglikDescription || "प्रथम, चतुर्थ, सप्तम, अष्टम या द्वादश भाव में मंगल की स्थिति"})।`
      : "• **मांगलिक विचार:** जातक पूर्णतः अमंगल (नॉन-मांगलिक) है।";

    // Dynamic remedies based on Mahadasha lord
    const dashaRemedies: Record<string, string> = {
      सूर्य: "नित्य प्रातः तांबे के लोटे से सूर्यदेव को अर्घ्य दें और 'ॐ सूर्याय नमः' या आदित्य हृदय स्तोत्र का पाठ करें।",
      चंद्र: "सोमवार को शिवलिंग पर कच्चा दूध व जल अर्पित करें और 'ॐ नमः शिवाय' का १०८ बार मानसिक जप करें।",
      मंगल: "नित्य हनुमान चालीसा का पाठ करें, मंगलवार को लाल मसूर अथवा गुड़ का दान करें और 'ॐ भौमाय नमः' जपें।",
      बुध: "प्रतिदिन श्री गणेश संकट नाशन स्तोत्र का पाठ करें, बुधवार को गाय को हरा चारा खिलाएं और 'ॐ बुधाय नमः' जपें।",
      गुरु: "बृहस्पतिवार को भगवान विष्णु की आराधना करें, पीले चंदन का तिलक लगाएं और 'ॐ ग्रां ग्रीं ग्रौं सः गुरवे नमः' जपें।",
      शुक्र: "शुक्रवार को श्री सूक्त या कनकधारा स्तोत्र का पाठ करें, कन्याओं का आदर करें और 'ॐ शुं शुक्राय नमः' जपें।",
      शनि: "शनिवार को पीपल के वृक्ष के नीचे सरसों के तेल का दीपक प्रज्वलित करें, शनि चालीसा पढ़ें और काले तिल का दान करें।",
      राहु: "शनिवार या बुधवार को 'ॐ भ्रां भ्रीं भ्रौं सः राहवे नमः' का जप करें, भैरव जी की उपासना करें और पक्षियों को बाजरा डालें।",
      केतु: "श्री गणेश जी की आराधना करें, दुर्वा अर्पित करें और 'ॐ कें केतवे नमः' का जप करें। आवारा श्वान (कुत्ते) को रोटी दें।",
    };

    const mahaRemedy = dashaRemedies[kundali.mahadasha] || "नित्य गायत्री मंत्र का १०८ बार जप करें।";

    return {
      ok: true,
      source: "local_vedic",
      text: `॥ श्री गणेशाय नमः ॥\n**जातक:** ${kundali.name} | **लग्न:** ${kundali.lagnaRashi} | **चंद्र राशि:** ${kundali.moonRashi} (${kundali.nakshatra} नक्षत्र, चरण ${kundali.charan})\n\n**१. व्यक्तित्व व लग्न बल:**\nआपका लग्न ${kundali.lagnaRashi} है। यह लग्न आपको दृढ़ संकल्प, वैचारिक स्पष्टता एवं स्वाभिमान प्रदान करता है।\n\n**२. प्रमुख ग्रहीय योग:**\n${yogasStr}\n${doshaStr}\n\n**३. वर्तमान विंशोत्तरी दशा फल:**\n${dashaText}\n${kundali.mahadasha} महादशा जातक के जीवन में महत्वपूर्ण कर्मिक परिवर्तन और नई दिशा का संकेत देती है।\n\n**४. शास्त्रीय सात्विक उपाय (Remedies):**\n• **दशा शांति उपाय:** ${mahaRemedy}\n• **इष्टदेव आराधना:** अपने कुलदेवता / इष्टदेव का नित्य स्मरण करें।\n• **दान:** शनिवार व मंगलवार को असहायों की सेवा अथवा अन्नदान करें।\n• **सात्विक आचरण:** प्रातः सूर्य नमस्कार करें और संध्या समय घर में कर्पूर अथवा घी का दीप प्रज्वलित करें।`,
      actionPayload: { type: "open_kundali", label: "कुंडली चक्र विस्तार से देखें" },
    };
  }

  // 2. CAREER / JOB / BUSINESS (करियर, नौकरी, व्यापार, आजीविका)
  if (
    q.includes("करियर") ||
    q.includes("नौकरी") ||
    q.includes("जॉब") ||
    q.includes("व्यापार") ||
    q.includes("बिज़नेस") ||
    q.includes("career") ||
    q.includes("job") ||
    q.includes("business") ||
    q.includes("प्रमोशन")
  ) {
    if (!kundali) {
      return {
        ok: true,
        source: "local_vedic",
        text: `॥ ॐ नमः शिवाय ॥\nवैदिक ज्योतिष में करियर और आजीविका का विचार जन्म कुंडली के **दशम भाव (कर्म भाव)**, दशमेश, दशम भाव में स्थित ग्रहों, शनिदेव (कर्मकारक) एवं सूर्यदेव (प्रशासन व पद प्रतिष्ठा) की स्थिति से किया जाता है।\n\nअपनी कुंडली के अनुसार सटीक नौकरी या व्यापार के योग जानने हेतु कृपया 'कुंडली' टैब में जाकर अपनी जन्म पत्रिका लोड करें।`,
        actionPayload: { type: "open_kundali", label: "जन्म कुंडली बनाएँ" },
      };
    }

    const tenthHouse = kundali.planets.filter((p) => p.house === 10);
    const sunPos = kundali.planets.find((p) => p.planet === "सूर्य");
    const satPos = kundali.planets.find((p) => p.planet === "शनि");

    const tenthPlanets = tenthHouse.length > 0
      ? `दशम भाव में ${tenthHouse.map((p) => `${p.planet} (${p.rashi} राशि)`).join(", ")} स्थित हैं।`
      : "दशम भाव रिक्त है, अतः इसके स्वामी ग्रह की दृष्टि व दशा का मुख्य प्रभाव रहेगा।";

    return {
      ok: true,
      source: "local_vedic",
      text: `॥ ॐ सूर्याय नमः ॥\n**${kundali.name} जी की कुंडली में करियर व आजीविका विश्लेषण:**\n\n• **दशम भाव (कर्म क्षेत्र):** ${tenthPlanets}\n• **सूर्य व शनि की स्थिति:** सूर्य (${sunPos?.rashi || "सूर्य"}, भाव ${sunPos?.house || "—"}) एवं कर्मकारक शनि (${satPos?.rashi || "शनि"}, भाव ${satPos?.house || "—"}) हैं।\n• **दशा प्रभाव:** वर्तमान में **${kundali.mahadasha}-${kundali.antardasha}** चल रही है, जो आपके कार्यक्षेत्र में निर्णय लेने की क्षमता को प्रत्यक्ष प्रभावित करती है।\n\n**मार्गदर्शन व भविष्यकथन:**\nकुंडली के अनुसार स्थिरता और धैर्यपूर्वक अपने कौशल को निखारें। अनावश्यक रूप से कार्यस्थल पर टकराव से बचें। यदि नौकरी में पदोन्नति या स्थानांतरण चाहते हैं तो शुभ मुहूर्त में आवेदन करें।\n\n**करियर उन्नति के सात्विक उपाय:**\n१. नित्य प्रातः 'ॐ घृणिः सूर्याय नमः' मंत्र का उच्चारण करते हुए सूर्यदेव को जल अर्पित करें।\n२. शनिवार को संध्या समय पीपल वृक्ष के पास सरसों तेल का दीप जलाएं।\n३. श्री विष्णु सहस्रनाम या आदित्य हृदय स्तोत्र का पाठ आत्मविश्वास व यश में वृद्धि करेगा।`,
      actionPayload: { type: "open_kundali", label: "कर्म भाव व ग्रह स्थिति देखें" },
    };
  }

  // 3. MARRIAGE / RELATIONSHIPS / VIVAH / MANGLIK (विवाह, शादी, दांपत्य, मांगलिक)
  if (
    q.includes("विवाह") ||
    q.includes("शादी") ||
    q.includes("मैरिज") ||
    q.includes("marriage") ||
    q.includes("मांगलिक") ||
    q.includes("manglik") ||
    q.includes("जीवनसाथी") ||
    q.includes("सप्तम भाव")
  ) {
    if (!kundali) {
      return {
        ok: true,
        source: "local_vedic",
        text: `॥ ॐ उमामहेश्वराभ्यां नमः ॥\nवैदिक शास्त्र में विवाह का विचार जन्म कुंडली के **सप्तम भाव (जाया भाव)**, सप्तमेश, गुरु (कन्या हेतु पति कारक) तथा शुक्र (वर हेतु पत्नी कारक) के बल से किया जाता है।\n\nअपनी कुंडली के विवाह योग, दांपत्य सुख और मांगलिक दोष का सटीक विश्लेषण जानने के लिए 'कुंडली' टैब में अपना विवरण जोड़ें।`,
        actionPayload: { type: "open_kundali", label: "जन्म कुंडली बनाएँ" },
      };
    }

    const seventhHouse = kundali.planets.filter((p) => p.house === 7);
    const jupPos = kundali.planets.find((p) => p.planet === "गुरु");
    const venPos = kundali.planets.find((p) => p.planet === "शुक्र");

    const seventhText = seventhHouse.length > 0
      ? `सप्तम भाव में ${seventhHouse.map((p) => p.planet).join(", ")} विराजमान हैं।`
      : "सप्तम भाव पर शुभ ग्रहों की दृष्टि दांपत्य में सामंजस्य स्थापित करती है।";

    const manglikNotice = kundali.isManglik
      ? `⚠️ **मांगलिक प्रभाव:** आपकी कुंडली में मंगल ${kundali.manglikDescription || "विशेष भाव में"} स्थित होकर मांगलिक योग बना रहा है। विवाह के समय कुंडली मिलान में गुण व नाड़ी-भकूट विचार आवश्यक है।`
      : `✅ **अमंगल (Non-Manglik):** आपकी कुंडली में कोई मांगलिक दोष नहीं है।`;

    return {
      ok: true,
      source: "local_vedic",
      text: `॥ ॐ श्री उमा-महेश्वराय नमः ॥\n**${kundali.name} जी की कुंडली में विवाह व दांपत्य विचार:**\n\n• **सप्तम भाव स्थिति:** ${seventhText}\n• **गुरु व शुक्र कारक बल:** गुरु (${jupPos?.rashi || "—"}, भाव ${jupPos?.house || "—"}) तथा शुक्र (${venPos?.rashi || "—"}, भाव ${venPos?.house || "—"}) हैं।\n• ${manglikNotice}\n• **दशा प्रभाव:** वर्तमान दशा **${kundali.mahadasha}-${kundali.antardasha}** विवाह संबंधी वार्ताओं व संबंधों को गति प्रदान कर सकती है।\n\n**विवाह व दांपत्य सुख के सिद्ध उपाय:**\n१. प्रत्येक शुक्रवार को माँ लक्ष्मी अथवा माता पार्वती को लाल पुष्प व इत्र अर्पित करें।\n२. कन्या जातक बृहस्पतिवार को पीले वस्त्र पहनें और 'ॐ नमो भगवते वासुदेवाय' जपें।\n३. पुरुष जातक श्री सूक्त का पाठ करें और गौ-माता को गुड़ व रोटी दें।\n४. यदि मांगलिक दोष का प्रभाव हो, तो नित्य श्री हनुमान चालीसा व मंगल कवच का पाठ करें।`,
      actionPayload: { type: "open_kundali", label: "सप्तम भाव व कुंडली चक्र" },
    };
  }

  // 4. WEALTH / FINANCE / MONEY (धन, संपत्ति, कर्ज, रुपया)
  if (
    q.includes("धन") ||
    q.includes("पैसा") ||
    q.includes("कर्ज") ||
    q.includes("संपत्ति") ||
    q.includes("wealth") ||
    q.includes("money") ||
    q.includes("finance") ||
    q.includes("लाभ")
  ) {
    if (!kundali) {
      return {
        ok: true,
        source: "local_vedic",
        text: `॥ ॐ श्रीं ह्रीं क्लीं महालक्ष्म्यै नमः ॥\nधन व वैभव का विचार कुंडली के **द्वितीय भाव (धन संग्रह)** और **एकादश भाव (आय व लाभ)** तथा गुरु-शुक्र की स्थिति से होता है। सटीक गणना हेतु अपनी कुंडली लोड करें।`,
        actionPayload: { type: "open_kundali", label: "जन्म कुंडली बनाएँ" },
      };
    }

    const secondHouse = kundali.planets.filter((p) => p.house === 2);
    const eleventhHouse = kundali.planets.filter((p) => p.house === 11);

    return {
      ok: true,
      source: "local_vedic",
      text: `॥ ॐ महालक्ष्म्यै नमः ॥\n**${kundali.name} जी की कुंडली में धन व आर्थिक योग:**\n\n• **द्वितीय भाव (धन संचय):** ${secondHouse.length > 0 ? secondHouse.map((p) => p.planet).join(", ") : "शुभ दृष्टि"}।\n• **एकादश भाव (आय व लाभ):** ${eleventhHouse.length > 0 ? eleventhHouse.map((p) => p.planet).join(", ") : "कर्म अनुसार फल"}।\n• **दशा प्रभाव:** वर्तमान **${kundali.mahadasha}** की महादशा में धन के अपव्यय पर नियंत्रण रखना और निवेश में विवेक से काम लेना लाभप्रद रहेगा।\n\n**धन वृद्धि व कर्ज मुक्ति के वैदिक उपाय:**\n१. शुक्रवार को खीर बनाकर माँ लक्ष्मी को भोग लगाएं और श्री कनकधारा स्तोत्र का पाठ करें।\n२. घर की उत्तर दिशा (कुबेर स्थान) को सदैव स्वच्छ, प्रकाशमान व व्यवस्थित रखें।\n३. बुधवार को गाय को हरी घास या पालक खिलाएं, इससे बुध ग्रह की अनुकूलता से व्यापारिक लाभ बढ़ता है।`,
      actionPayload: { type: "open_kundali", label: "द्वितीय व एकादश भाव देखें" },
    };
  }

  // 5. SHANI / SADE SATI / DHAIYYA (शनि, साढ़ेसाती, ढैय्या)
  if (
    q.includes("शनि") ||
    q.includes("साढ़ेसाती") ||
    q.includes("ढैय्या") ||
    q.includes("sade sati") ||
    q.includes("saturn")
  ) {
    const moonR = kundali?.moonRashi || (panchang ? panchang.lunarRashi : "कर्क");
    return {
      ok: true,
      source: "local_vedic",
      text: `॥ ॐ शं शनैश्चराय नमः ॥\n**शनि व साढ़ेसाती विचार:**\nजातक की चंद्र राशि **${moonR}** है।\n\nशनिदेव न्याय के देवता और कर्मफलदाता हैं। साढ़ेसाती अथवा ढैय्या व्यक्ति को अनुशासित, विनम्र और परिश्रमी बनाने के लिए आती है, भयभीत होने की आवश्यकता नहीं है।\n\n**शनि शांति के सिद्ध सात्विक उपाय:**\n१. प्रत्येक शनिवार को सूर्यास्त के बाद पीपल के वृक्ष के नीचे सरसों के तेल का दीपक जलाएं।\n२. 'ॐ प्रां प्रीं प्रौं सः शनैश्चराय नमः' मंत्र का १०८ बार रुद्राक्ष माला से जप करें।\n३. शनिवार को काले तिल, उड़द की दाल अथवा कंबल का किसी जरूरतमंद को दान करें।\n४. प्रतिदिन हनुमान चालीसा अथवा सुंदरकांड का पाठ करें — श्री हनुमान जी के भक्तों पर शनिदेव सदा कृपालु रहते हैं।`,
      actionPayload: { type: "open_kundali", label: "शनि की स्थिति देखें" },
    };
  }

  // 6. HEALTH / DISEASE / AAYU (स्वास्थ्य, रोग, बीमारी, आयु)
  if (
    q.includes("स्वास्थ्य") ||
    q.includes("बीमारी") ||
    q.includes("रोग") ||
    q.includes("health") ||
    q.includes("तबीयत") ||
    q.includes("रोग निवारण")
  ) {
    return {
      ok: true,
      source: "local_vedic",
      text: `॥ ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम् ॥\n**स्वास्थ्य व आरोग्य विचार:**\nआरोग्य का विचार लग्न (तनु भाव), लग्नेश और सूर्यदेव (आत्मकारक व जीवनी शक्ति) से किया जाता है। रोग मुक्ति हेतु षष्ठ भाव का परिहार आवश्यक है।\n\n**स्वास्थ्य लाभ हेतु शास्त्रोक्त उपाय:**\n१. नित्य भगवान शिव का स्मरण करते हुए महामृत्युंजय मंत्र का ११ या २१ बार जप करें:\n*'ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम्। उर्वारुकमिव बन्धनान्मृत्योर्मुक्षीय माऽमृतात्॥'*\n२. प्रातः सूर्योदय के समय तांबे के पात्र से जल ग्रहण करें।\n३. सोमवार को शिवलिंग पर जल व बेलपत्र अर्पित करें।\n४. सात्विक भोजन ग्रहण करें और तनाव से मुक्ति हेतु प्राणायाम व ध्यान का अभ्यास करें।`,
      actionPayload: { type: "open_kundali", label: "लग्न व षष्ठ भाव स्थिति" },
    };
  }

  // 7. RAHU KAAL / CHOGHADIYA / PANCHANG / MUHURAT
  if (
    q.includes("राहु") ||
    q.includes("rahu") ||
    q.includes("अशुभ") ||
    q.includes("चौघड़िया") ||
    q.includes("मुहूर्त") ||
    q.includes("आज का") ||
    q.includes("आज की")
  ) {
    if (panchang) {
      const weekday = panchang.date.getDay();
      const inauspicious = getInauspiciousWindows(panchang.solar, weekday);
      const rahu = inauspicious.find((w) => w.title === "राहु काल");
      const dayChoghadiyas = getDayChoghadiya(panchang.solar, weekday);
      const { current, remainingMinutes } = getCurrentChoghadiya(dayChoghadiyas);

      const rahuStr = rahu ? `${formatT(rahu.start)} से ${formatT(rahu.end)} तक` : "प्रभावी";
      const currChog = current
        ? `वर्तमान में **${current.hindiName}** चौघड़िया सक्रिय है (लगभग ${remainingMinutes} मिनट शेष)।`
        : "";

      return {
        ok: true,
        source: "local_vedic",
        text: `॥ ॐ नमः शिवाय ॥\n**आज का पंचांग व कालखंड:**\n• **तिथि व वार:** ${panchang.weekday}, ${panchang.paksha} ${panchang.tithi}\n• **नक्षत्र:** ${panchang.nakshatra} (योग: ${panchang.yoga})\n• **राहु काल:** ${rahuStr} (इस समय नया कार्य प्रारंभ न करें)\n• **सूर्योदय-सूर्यास्त:** प्रातः ${formatT(panchang.solar.sunrise)} | सायं ${formatT(panchang.solar.sunset)}\n\n${currChog}\n\n**मार्गदर्शन:**\nशुभ कार्यों के लिए अमृत, शुभ अथवा लाभ चौघड़िया का चयन करें। राहुकाल में केवल दैनिक नित्यकर्म अथवा ईश-आराधना करें।`,
        actionPayload: { type: "open_choghadiya", label: "सम्पूर्ण चौघड़िया चक्र" },
      };
    }
  }

  // 8. TRAVEL / DISHASHOOL (यात्रा, दिशाशूल)
  if (q.includes("यात्रा") || q.includes("दिशाशूल") || q.includes("travel")) {
    if (panchang) {
      const weekday = panchang.date.getDay();
      const shoolDir = DISHASHOOL_MAP[weekday];
      const remedy = TRAVEL_REMEDIES[weekday];
      return {
        ok: true,
        source: "local_vedic",
        text: `॥ ॐ नमो भगवते वासुदेवाय ॥\nआज ${panchang.weekday} होने से **${shoolDir}** दिशा में दिशाशूल है।\n\n**शास्त्र निर्देश:**\nइस दिशा में यात्रा प्रारंभ करने से बचें।\n\n**सात्विक परिहार:**\nअत्यावश्यक होने पर प्रस्थान से पूर्व: **${remedy}**। इसके बाद पूर्व दिशा में पाँच पग चलकर यात्रा प्रारंभ करें, यात्रा निर्विघ्न होगी।`,
        actionPayload: { type: "open_yatra", label: "यात्रा कैलकुलेटर" },
      };
    }
  }

  // DEFAULT / GENERAL ASTROLOGICAL GUIDANCE
  const kundaliName = kundali ? `${kundali.name} जी की कुंडली (लग्न: ${kundali.lagnaRashi}, राशि: ${kundali.moonRashi}, दशा: ${kundali.mahadasha})` : "सामान्य वैदिक";

  return {
    ok: true,
    source: "local_vedic",
    text: `॥ ॐ श्री गणेशाय नमः ॥\n**उमा का वैदिक उत्तर:**\nआपके प्रश्न: *"^${query}"* पर मैंने सूक्ष्म ज्योतिषीय विचार किया है।\n\n• **संदर्भ:** ${kundaliName}\n• **वैदिक सिद्धांत:** किसी भी कार्य की सफलता में सही काल (मुहूर्त), जातक का पूर्वार्जित प्रारब्ध (कुंडली ग्रह बल) और वर्तमान पुरुषार्थ — ये तीनों कारक एक साथ कार्य करते हैं।\n\n**कल्याणकारी उपाय:**\n१. नित्य प्रातः गायत्री मंत्र का जप अथवा 'ॐ नमो भगवते वासुदेवाय' का पाठ करें।\n२. अपने माता-पिता व गुरुजनों का नित्य चरण स्पर्श कर आशीर्वाद लें।\n३. किसी भी नए कार्य का आरंभ शुभ चौघड़िया में श्री गणेश जी को दूर्वा अर्पित कर करें।\n\nआप मुझसे विवाह, करियर, धन, स्वास्थ्य, साढ़ेसाती, मांगलिक विचार या आज के शुभ चौघड़िया के विषय में भी विस्तार से पूछ सकते हैं।`,
    actionPayload: kundali ? { type: "open_kundali", label: "कुंडली विस्तार देखें" } : { type: "open_panchang", label: "दैनिक पंचांग देखें" },
  };
}
