export interface GitaShlokaItem {
  id: number;
  chapter: number;
  verse: number;
  sanskrit: string;
  transliteration: string;
  meaning: string;
  reflection: string;
}

export const GITA_SHLOKAS: GitaShlokaItem[] = [
  {
    id: 1,
    chapter: 2,
    verse: 47,
    sanskrit: "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन। मा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि॥",
    transliteration: "karman-yevadhikaraste ma phaleshu kadachana, ma karma-phala-hetur bhur ma te sango 'stv akarmani.",
    meaning: "तुम्हारा अधिकार केवल कर्म करने में है, उसके फलों में कभी नहीं। अतः तुम कर्मों के फल के हेतु मत बनो और तुम्हारी अकर्मणिता (काम न करने) में भी आसक्ति न हो।",
    reflection: "यह श्लोक हमें फल की चिंता किए बिना अपना सर्वश्रेष्ठ कर्म करने की प्रेरणा देता है।"
  },
  {
    id: 2,
    chapter: 4,
    verse: 7,
    sanskrit: "यदा यदा हि धर्मस्य ग्लानिर्भवति भारत। अभ्युत्थानमधर्मस्य तदात्मानं सृजाम्यहम्॥",
    transliteration: "yada yada hi dharmasya glanir bhavati bharata, abhyutthanam adharmasya tadatmanam srijamy aham.",
    meaning: "हे भारत! जब-जब धर्म की हानि और अधर्म की वृद्धि होती है, तब-तब मैं अपने रूप को रचता हूँ (अर्थात साकार रूप में प्रकट होता हूँ)।",
    reflection: "भगवान का यह वचन हमें विश्वास दिलाता है कि जब भी सच्चाई पर संकट आता है, ईश्वर हमारी रक्षा के लिए अवश्य आते हैं।"
  },
  {
    id: 3,
    chapter: 6,
    verse: 5,
    sanskrit: "उद्धरेदात्मनात्मानं नात्मानमअवसादयेत्। आत्मैव ह्यात्मनो बन्धुरआत्मैव रिपुः आत्मनः॥",
    transliteration: "uddhared atmanatmanam natmanam avasadayet,atmaiva hy atmano bandhur atmaiva ripu 'tmanah.",
    meaning: "मनुष्य को अपने द्वारा अपना उद्धार करना चाहिए, अपने को नीचे नहीं गिराना चाहिए। क्योंकि यह मनुष्य स्वयं ही अपना मित्र है और स्वयं ही अपना शत्रु है।",
    reflection: "हमारे जीवन की उन्नति या पतन का मुख्य कारण हम स्वयं हैं।"
  },
  {
    id: 4,
    chapter: 18,
    verse: 66,
    sanskrit: "सर्वधर्मान्परित्यज्य मामेकं शरणं व्रज। अहं त्वां सर्वपापेभ्यो मोक्षयिष्यामि मा शुचः॥",
    transliteration: "sarva-dharman parityajya mam ekam sharanam vraja, aham tvam sarva-papebhyo mokshayishyami ma shuchah.",
    meaning: "सम्पूर्ण धर्मों को (मुझमें) त्यागकर तुम केवल मेरी ही शरण में आओ। मैं तुम्हें सम्पूर्ण पापों से मुक्त कर दूंगा, तुम शोक मत करो।",
    reflection: "परमात्म-शरणागति ही समस्त भयों और दुखों से पार पाने का एकमात्र परम उपाय है।"
  }
];
