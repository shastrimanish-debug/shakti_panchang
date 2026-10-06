export interface GitaShlokaItem {
  id: number;
  chapter: number;
  verse: number;
  sanskrit: string;
  transliteration: string;
  meaning: string;
  reflection: string;
  meaning_gu?: string;
  reflection_gu?: string;
  meaning_en?: string;
  reflection_en?: string;
}

export const GITA_SHLOKAS: GitaShlokaItem[] = [
  {
    id: 1,
    chapter: 2,
    verse: 47,
    sanskrit: "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन। मा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि॥",
    transliteration: "karman-yevadhikaraste ma phaleshu kadachana, ma karma-phala-hetur bhur ma te sango 'stv akarmani.",
    meaning: "तुम्हारा अधिकार केवल कर्म करने में है, उसके फलों में कभी नहीं। अतः तुम कर्मों के फल के हेतु मत बनो और तुम्हारी अकर्मणिता (काम न करने) में भी आसक्ति न हो।",
    reflection: "यह श्लोक हमें फल की चिंता किए बिना अपना सर्वश्रेष्ठ कर्म करने की प्रेरणा देता है।",
    meaning_gu: "તમારો અધિકાર માત્ર કર્તવ્ય કર્મ કરવામાં છે, તેના ફળોમાં ક્યારેય નહીં. તેથી તમે કર્મના ફળની કામના વાળા ન બનો અને અકર્મ (કર્મ ન કરવા) માં પણ તમારી આસક્તિ ન થાય.",
    reflection_gu: "આ શ્લોક આપણને પરિણામની ચિંતા કર્યા વિના નિઃસ્વાર્થ ભાવે ઉત્તમ કર્મ કરવાની દિવ્ય પ્રેરણા આપે છે.",
    meaning_en: "You have a right only to perform your prescribed duties, never to the fruits of action. Let not the fruit of action be your motive, nor let there be any attachment to inaction.",
    reflection_en: "This verse inspires us to dedicate ourselves entirely to righteous action without anxiety about outcomes."
  },
  {
    id: 2,
    chapter: 4,
    verse: 7,
    sanskrit: "यदा यदा हि धर्मस्य ग्लानिर्भवति भारत। अभ्युत्थानमधर्मस्य तदात्માનં सृजाम्यहम्॥",
    transliteration: "yada yada hi dharmasya glanir bhavati bharata, abhyutthanam adharmasya tadatmanam srijamy aham.",
    meaning: "हे भारत! जब-जब धर्म की हानि और अधर्म की वृद्धि होती है, तब-तब मैं अपने रूप को रचता हूँ (अर्थात साकार रूप में प्रकट होता हूँ)।",
    reflection: "भगवान का यह वचन हमें विश्वास दिलाता है कि जब भी सच्चाई पर संकट आता है, ईश्वर हमारी रक्षा के लिए अवश्य आते हैं।",
    meaning_gu: "હે ભારત! જ્યારે જ્યારે ધર્મની હાનિ અને અધર્મનો ઉદય થાય છે, ત્યારે ત્યારે હું પોતાના આત્માનું સર્જન કરું છું (સાકાર રૂપે પ્રગટ થાઉં છું).",
    reflection_gu: "ભગવાનનું આ વચન આપણને વિશ્વાસ અપાવે છે કે જ્યારે પણ સત્ય પર સંકટ આવે ત્યારે ઈશ્વર ધર્મની રક્ષા માટે અવશ્ય પ્રગટે છે.",
    meaning_en: "Whenever there is a decline in righteousness and a predominant rise of unrighteousness, at that time I manifest Myself, O descendant of Bharata.",
    reflection_en: "This assurance instills deep faith that the divine order always intervenes to protect cosmic truth and goodness."
  },
  {
    id: 3,
    chapter: 6,
    verse: 5,
    sanskrit: "उद्धरेदात्मनात्मानं नात्मानमअवसादयेत्। आत्मैव ह्यात्मनो बन्धुरआत्मैव रिपुः आत्मनः॥",
    transliteration: "uddhared atmanatmanam natmanam avasadayet,atmaiva hy atmano bandhur atmaiva ripu 'tmanah.",
    meaning: "मनुष्य को अपने द्वारा अपना उद्धार करना चाहिए, अपने को नीचे नहीं गिराना चाहिए। क्योंकि यह मनुष्य स्वयं ही अपना मित्र है और स्वयं ही अपना शत्रु है।",
    reflection: "हमारे जीवन की उन्नति या पतन का मुख्य कारण हम स्वयं हैं।",
    meaning_gu: "મનુષ્યે પોતાના મન દ્વારા પોતાનો ઉદ્ધાર કરવો જોઈએ, પોતાને અધોગતિમાં પાડવો ન જોઈએ. કારણ કે આ મનુષ્ય પોતે જ પોતાનો મિત્ર છે અને પોતે જ પોતાનો શત્રુ છે.",
    reflection_gu: "આપણા આત્મ-વિકાસ અથવા પતનનો મુખ્ય નિર્ણાયક આપણો પોતાનો સંકલ્પ અને મન છે.",
    meaning_en: "One must elevate oneself by one's own mind, and not degrade oneself. The mind is indeed the friend of the self, and the mind is also the enemy of the self.",
    reflection_en: "We are the primary architects of our own elevation or downfall through self-mastery."
  },
  {
    id: 4,
    chapter: 18,
    verse: 66,
    sanskrit: "सर्वधर्मान्परित्यज्य मामेकं शरणं व्रज। अहं त्वां सर्वपापेभ्यो मोक्षयिष्यामि मा शुचः॥",
    transliteration: "sarva-dharman parityajya mam ekam sharanam vraja, aham tvam sarva-papebhyo mokshayishyami ma shuchah.",
    meaning: "सम्पूर्ण धर्मों को (मुझमें) त्यागकर तुम केवल मेरी ही शरण में आओ। मैं तुम्हें सम्पूर्ण पापों से मुक्त कर दूंगा, तुम शोक मत करो।",
    reflection: "परमात्म-शरणागति ही समस्त भयों और दुखों से पार पाने का एकमात्र परम उपाय है।",
    meaning_gu: "સર્વ ધર્મોનો (ફળાસક્તિનો) ત્યાગ કરી માત્ર મારી એકની શરણમાં આવો. હું તમને સર્વ પાપોમાંથી મુક્ત કરીશ, તમે શોક ન કરો.",
    reflection_gu: "પરમાત્માની અનન્ય શરણાગતિ જ સમસ્ત ભય અને ચિંતાઓમાંથી મુક્તિ આપનારો પરમ માર્ગ છે.",
    meaning_en: "Abandoning all varieties of dharmas, simply surrender unto Me alone. I shall liberate you from all sinful reactions; do not grieve.",
    reflection_en: "Unconditional surrender to the Supreme Divine is the ultimate refuge dispelling all worldly anxieties."
  }
];

export function getLocalizedGitaShloka(shloka: GitaShlokaItem, lang: string): { meaning: string; reflection: string } {
  if (lang === 'gu') {
    return {
      meaning: shloka.meaning_gu || shloka.meaning,
      reflection: shloka.reflection_gu || shloka.reflection,
    };
  }
  if (lang === 'en') {
    return {
      meaning: shloka.meaning_en || shloka.meaning,
      reflection: shloka.reflection_en || shloka.reflection,
    };
  }
  return {
    meaning: shloka.meaning,
    reflection: shloka.reflection,
  };
}

