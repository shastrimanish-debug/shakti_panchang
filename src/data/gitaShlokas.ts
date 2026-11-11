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
    sanskrit: "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।\nमा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि॥",
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
    sanskrit: "यदा यदा हि धर्मस्य ग्लानिर्भवति भारत।\nअभ्युत्थानमधर्मस्य तदात्मानं सृजाम्यहम्॥",
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
    sanskrit: "उद्धरेदात्मनात्मानं नात्मानमवसादयेत्।\nआत्मैव ह्यात्मनो बन्धुरात्मैव रिपुरात्मनः॥",
    transliteration: "uddhared atmanatmanam natmanam avasadayet, atmaiva hy atmano bandhur atmaiva ripu 'tmanah.",
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
    sanskrit: "सर्वधर्मान्परित्यज्य मामेकं शरणं व्रज।\nअहं त्वां सर्वपापेभ्यो मोक्षयिष्यामि मा शुचः॥",
    transliteration: "sarva-dharman parityajya mam ekam sharanam vraja, aham tvam sarva-papebhyo mokshayishyami ma shuchah.",
    meaning: "सम्पूर्ण धर्मों को (मुझमें) त्यागकर तुम केवल मेरी ही शरण में आओ। मैं तुम्हें सम्पूर्ण पापों से मुक्त कर दूंगा, तुम शोक मत करो।",
    reflection: "परमात्म-शरणागति ही समस्त भयों और दुखों से पार पाने का एकमात्र परम उपाय है।",
    meaning_gu: "સર્વ ધર્મોનો (ફળાસક્તિનો) ત્યાગ કરી માત્ર મારી એકની શરણમાં આવો. હું તમને સર્વ પાપોમાંથી મુક્ત કરીશ, તમે શોક ન કરો.",
    reflection_gu: "પરમાત્માની અનન્ય શરણાગતિ જ સમસ્ત ભય અને ચિંતાઓમાંથી મુક્તિ આપનારો પરમ માર્ગ છે.",
    meaning_en: "Abandoning all varieties of dharmas, simply surrender unto Me alone. I shall liberate you from all sinful reactions; do not grieve.",
    reflection_en: "Unconditional surrender to the Supreme Divine is the ultimate refuge dispelling all worldly anxieties."
  },
  {
    id: 5,
    chapter: 2,
    verse: 20,
    sanskrit: "न जायते म्रियते वा कदाचिन् नाहं भूत्वा भविता वा न भूयः।\nअजो नित्यः शाश्वतोऽयं पुराणो न हन्यते हन्यमाने शरीरे॥",
    transliteration: "na jayate mriyate va kadacin nayam bhutva bhavita va na bhuyah, ajo nityah sasvato 'yam purano na hanyate hanyamane sarire.",
    meaning: "आत्मा कभी न जन्म लेती है और न कभी मरती है। वह अजन्मा, नित्य, शाश्वत और पुरातन है। शरीर के मारे जाने पर भी आत्मा नहीं मारी जाती।",
    reflection: "यह श्लोक आत्म-तत्व की अमरता का साक्षात्कार कराकर मृत्यु के भय को नष्ट करता है।",
    meaning_gu: "આત્મા ક્યારેય જન્મતો નથી કે મરતો નથી. આ આત્મા અજન્મા, નિત્ય, શાશ્વત અને પુરાતન છે.",
    reflection_gu: "આ શ્લોક આત્માની અમરતાનું ભાન કરાવી મૃત્યુના ભયને નષ્ટ કરે છે.",
    meaning_en: "The soul is never born nor does it die at any time. It is unborn, eternal, ever-existing, and primeval. It is not slain when the body is slain.",
    reflection_en: "This verse reveals the eternal nature of consciousness beyond physical dissolution."
  },
  {
    id: 6,
    chapter: 9,
    verse: 22,
    sanskrit: "अनन्याश्चिन्तयन्तो मां ये जनाः पर्युपासते।\nतेषां नित्याभियुक्तानां योगक्षेमं वहाम्यहम्॥",
    transliteration: "ananyas cintayanto mam ye janah paryupasate, tesam nityabhiyuktanam yoga-ksemam vahamy aham.",
    meaning: "जो अनन्य प्रेमी भक्त निरंतर मेरा चिंतन करते हुए मेरी उपासना करते हैं, उन नित्य-निरंतर मुझमें लगे हुए पुरुषों का योगक्षेम (अप्राप्त की प्राप्ति और प्राप्त की रक्षा) मैं स्वयं वहन करता हूँ।",
    reflection: "ईश्वर अपने अनन्य भक्तों की संपूर्ण आवश्यकताओं की रक्षा की जिम्मेदारी स्वयं लेते हैं।",
    meaning_gu: "જે અનન્ય પ્રેમી ભક્તો નિરંતર મારું ચિંતન કરતા મારી ઉપાસના કરે છે, તે નિત્ય-નિરંતર મારામાં લાગેલા પુરુષોનું યોગક્ષેમ હું સ્વયં વહન કરું છું.",
    reflection_gu: "ઈશ્વર પોતાના અનન્ય ભક્તોની સંપૂર્ણ જરૂરિયાતોની રક્ષાની જવાબદારી સ્વયં લે છે.",
    meaning_en: "For those who always worship Me with exclusive devotion, meditating on My transcendental form, to them I carry what they lack and preserve what they have.",
    reflection_en: "Divine providence unfailingly supports and sustains those whose devotion is total and undivided."
  },
  {
    id: 7,
    chapter: 2,
    verse: 62,
    sanskrit: "ध्यायतो विषयान्पुंसः सङ्गस्तेषूपजायते।\nसङ्गात् सञ्जायते कामः कामात्क्रोधोऽभिजायते॥",
    transliteration: "dhyayato visayan pumsah sangas tesupajayate, sangat sanjayate kamah kamat krodho 'bhijayate.",
    meaning: "विषयों का चिंतन करने वाले पुरुष की उन विषयों में आसक्ति हो जाती है, आसक्ति से काम (कामना) उत्पन्न होता है और काम में बाधा पड़ने पर क्रोध उत्पन्न होता है।",
    reflection: "मन के विचारों की दिशा ही हमारे बंधनों और दुखों का कारण बनती है।",
    meaning_gu: "વિષયોનું ચિંતન કરનાર મનુષ્યની તે વિષયોમાં આસક્તિ પેદા થાય છે. આસક્તિમાંથી કામના ઉત્પન્ન થાય છે અને કામનામાં બાધા પડતાં ક્રોધ જન્મે છે.",
    reflection_gu: "મનના વિચારોની દિશા જ આપણા બંધનો અને દુઃખોનું કારણ બને છે.",
    meaning_en: "While contemplating the objects of the senses, a person develops attachment for them, and from such attachment lust develops, and from lust anger arises.",
    reflection_en: "Unchecked desire and sensory obsession inevitably lead to frustration and emotional turmoil."
  },
  {
    id: 8,
    chapter: 11,
    verse: 12,
    sanskrit: "दिवि सूर्यसहस्रस्य भवेद्युगपदुत्थिता।\nयदि भाः सदृशी सा स्याद्भासस्तस्य महात्मनः॥",
    transliteration: "divi surya-sahasrasya bhaved yugapad utthita, yadi bhah sadrsi sa syad bhasas tasya mahatmanah.",
    meaning: "आकाश में यदि एक साथ सहस्रों (हजारों) सूर्यों का प्रकाश उदित हो जाए, तो भी वह उस महात्मा विश्र्वरूप परमेश्वर के प्रकाश के सदृश कदाचित ही हो।",
    reflection: "भगवान के विश्वरूप की अलौकिक, अनन्त और असीम दिव्य कांति का वर्णन।",
    meaning_gu: "આકાશમાં જો એક સાથે હજારો સૂર્યોનો પ્રકાશ ઉદિત થાય, તો પણ તે મહાત્મા વિશ્ચરૂપ પરમેશ્વરના પ્રકાશ જેવો કદાચ જ હોય.",
    reflection_gu: "ભગવાનના વિશ્વરૂપની અલૌકિક, અનંત અને અસીમ દિવ્ય કાંતિનું વર્ણન.",
    meaning_en: "If hundreds of thousands of suns were to rise at once into the sky, their radiance might resemble the effulgence of the Supreme Lord in that universal form.",
    reflection_en: "This captures the staggering, limitless cosmic light of the Supreme Consciousness."
  }
];

import { localizedGitaText } from '../constants/shlokas';

export function getLocalizedGitaShloka(shloka: GitaShlokaItem, lang: string): { meaning: string; reflection: string } {
  return localizedGitaText(
    shloka.id,
    lang,
    shloka.meaning,
    shloka.reflection,
    shloka.meaning_gu,
    shloka.reflection_gu,
    shloka.meaning_en,
    shloka.reflection_en,
  );
}
