export interface DevtaOfferingItem {
  id: string;
  item_icon: string;
  holy_symbol: string;
  action_text: string;
  highlighted_benefit: string;
  mantra?: string;
  best_time?: string;
  category?: 'wealth' | 'health' | 'marriage' | 'protection' | 'education' | 'graha' | 'career' | 'all';
  rules_note?: string;
}

export interface DevtaModule {
  deity: string;
  deity_id: string;
  header_title: string;
  holy_symbol: string;
  ruling_planet?: string;
  best_day?: string;
  fav_color?: string;
  accent_gradient: string;
  avatar_icon: string;
  short_intro: string;
  main_arpan_mantra: string;
  prohibited_items: string[]; // क्या कभी न चढ़ाएं (वर्जित)
  offerings: DevtaOfferingItem[];
}

export interface DevtaArpanData {
  module: string;
  module_version: string;
  language: string;
  theme_config: {
    background_color: string;
    primary_text_color: string;
    highlight_color: string;
    secondary_element_color: string;
  };
  devta_arpan_modules: DevtaModule[];
  general_puja_rules: string[];
  religious_disclaimer: string;
}

export const DEVTA_ARPAN_DATA: DevtaArpanData = {
  module: "Devta Arpan Fal",
  module_version: "2.0.0",
  language: "hi",
  theme_config: {
    background_color: "#FFF9F0",
    primary_text_color: "#333333",
    highlight_color: "#B64D18",
    secondary_element_color: "#966A45"
  },
  general_puja_rules: [
    "अर्पण करते समय मुख पूर्व (East) या उत्तर (North) दिशा की ओर होना चाहिए।",
    "सभी सामग्री शुद्ध, जल से प्रक्षालित और अप्रयुक्त (अखंडित) होनी चाहिए।",
    "भगवान शिव को कभी भी तुलसी, केतकी, सिंदूर, हल्दी या शंख से जल नहीं चढ़ाया जाता।",
    "भगवान गणेश को कभी भी तुलसी पत्र अर्पित न करें।",
    "सूर्य देव को शंख से जल अर्घ्य देना वर्जित माना गया है। तांबे के पात्र का ही प्रयोग करें।",
    "अर्पण के समय मन में द्वेष, क्रोध न रखें; निष्काम या सात्विक संकल्प से अर्पण करें।"
  ],
  religious_disclaimer: "यह सामग्री सनातन धर्मग्रंथों, शिवपुराण, देवी भागवत, भविष्य पुराण और लोक-परंपराओं पर आधारित है। अर्पण सात्विक श्रद्धा, शुद्धि व भक्ति भाव से करें।",
  devta_arpan_modules: [
    {
      deity: "भगवान गणेश",
      deity_id: "ganesh",
      header_title: "गणेश जी पर क्या चढ़ाने से क्या फल मिलता है? 卐",
      holy_symbol: "卐",
      ruling_planet: "बुध व केतु",
      best_day: "बुधवार व चतुर्थी तिथि",
      fav_color: "सिंदूरी लाल व पीला",
      accent_gradient: "from-amber-600 via-orange-500 to-red-600",
      avatar_icon: "🐘",
      short_intro: "प्रथम पूज्य विघ्नहर्ता गणेश जी बुद्धि, ऋद्धि-सिद्धि व कार्य सिद्धि के स्वामी हैं।",
      main_arpan_mantra: "ॐ गं गणपतये नमः ॥ इदं दूर्वादिकं नैवेद्यं समर्पयामि ॥",
      prohibited_items: ["तुलसी पत्र (सर्वथा वर्जित)", "टूटे हुए अक्षत (चावल)", "सफेद जनेऊ बिना हल्दी"],
      offerings: [
        {
          id: "ganesh_01",
          item_icon: "🌿",
          holy_symbol: "卐",
          action_text: "दूर्वा (घास - 21 दल) चढ़ाने से –",
          highlighted_benefit: "मानसिक शांति व धन वृद्धि",
          mantra: "ॐ गणाधिपाय नमः दूर्वादलं समर्पयामि ॥",
          best_time: "प्रातःकाल शुक्ल पक्ष चतुर्थी या बुधवार",
          category: "wealth",
          rules_note: "21 दूर्वा की गांठें बनाकर अर्पण करें। जड़ सहित साफ दूर्वा लें।"
        },
        {
          id: "ganesh_02",
          item_icon: "🥟",
          holy_symbol: "卐",
          action_text: "मोदक या लड्डू का भोग लगाने से –",
          highlighted_benefit: "मनोकामना पूर्ति व विघ्न निवारण",
          mantra: "ॐ मोदकप्रियाय नमः मोदकं समर्पयामि ॥",
          best_time: "संध्या आरती अथवा प्रातः पूजन",
          category: "wealth"
        },
        {
          id: "ganesh_03",
          item_icon: "🔴",
          holy_symbol: "卐",
          action_text: "सिंदूर चढ़ाने से –",
          highlighted_benefit: "सौभाग्य व संकटों से रक्षा",
          mantra: "सिन्दूरं शोभनं रक्तं सौभाग्यं सुखवर्धनम्। शुभदं कामदं चैव सिन्दूरं प्रतिगृह्यताम्॥",
          best_time: "प्रातः पूजन",
          category: "protection",
          rules_note: "घी या चमेली के तेल में मिलाकर मस्तक पर त्रिपुण्ड्र या तिलक लगाएं।"
        },
        {
          id: "ganesh_04",
          item_icon: "🌺",
          holy_symbol: "卐",
          action_text: "लाल गुड़हल (अड़हुल) चढ़ाने से –",
          highlighted_benefit: "कार्यों में निर्विघ्न सफलता व पदोन्नति",
          mantra: "ॐ विकटाय नमः रक्तपुष्पं समर्पयामि ॥",
          best_time: "बुधवार प्रातः",
          category: "career"
        },
        {
          id: "ganesh_05",
          item_icon: "🍃",
          holy_symbol: "卐",
          action_text: "शमी पत्र चढ़ाने से –",
          highlighted_benefit: "बुध व शनि दोष शांति, तीक्ष्ण बुद्धि",
          mantra: "शमी शमयते पापं शमी लोहितकण्टका। धारिण्यर्जुनबाणानां रामस्य प्रियवादिनी॥",
          best_time: "बुधवार व शनिवार",
          category: "graha"
        },
        {
          id: "ganesh_06",
          item_icon: "🌰",
          holy_symbol: "卐",
          action_text: "साबुत सुपारी व जनेऊ चढ़ाने से –",
          highlighted_benefit: "नए व्यापार व गृह प्रवेश में अखण्ड लाभ",
          mantra: "ॐ ऋद्धि-सिद्धि समेताय श्रीगणेशाय नमः पूगीफलं समर्पयामि ॥",
          best_time: "नूतन कार्य आरंभ पूर्व",
          category: "wealth"
        }
      ]
    },
    {
      deity: "भगवान शिव (शिवलिंग)",
      deity_id: "shivling",
      header_title: "शिवलिंग पर क्या चढ़ाने से क्या फल मिलता है? 🔱",
      holy_symbol: "🔱",
      ruling_planet: "चंद्रमा, गुरु व शनि",
      best_day: "सोमवार, प्रदोष व महाशिवरात्रि",
      fav_color: "धवल श्वेत व भस्म",
      accent_gradient: "from-sky-700 via-indigo-600 to-slate-900",
      avatar_icon: "🔱",
      short_intro: "देवाधिदेव महादेव आशुतोष हैं। एक लोटा जल और तीन पत्तियों के बेलपत्र से भी शीघ्र प्रसन्न होकर सर्व मनोकामना पूर्ण करते हैं।",
      main_arpan_mantra: "ॐ नमः शिवाय ॥ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम्। उर्वारुकमिव बन्धनान्मृत्य pushy मुक्तिं च मामृतात्॥",
      prohibited_items: ["तुलसी पत्र", "केतकी व चंपा के फूल", "हल्दी व कुमकुम/सिंदूर", "शंख से जल अर्पण", "नारियल का जल"],
      offerings: [
        {
          id: "shivling_01",
          item_icon: "🍃",
          holy_symbol: "🔱",
          action_text: "अखंड बेलपत्र (3 दल) चढ़ाने से –",
          highlighted_benefit: "त्रिताप नाश, 3 जन्मों के पाप मुक्ति व महालक्ष्मी",
          mantra: "त्रिदलं त्रिगुणाकारं त्रिनेत्रं च त्रियायुधम्। त्रिजन्मपापसंहारं बिल्वपत्रं शिवार्पणम्॥",
          best_time: "प्रातः काल (चतुर्थी, अष्टमी, नवमी, चतुर्दशी, संक्रांति को न तोड़ें)",
          category: "wealth",
          rules_note: "चिकना भाग शिवलिंग की ओर करके, अनामिका व अंगूठे से अर्पित करें।"
        },
        {
          id: "shivling_02",
          item_icon: "⚫",
          holy_symbol: "🔱",
          action_text: "काली मिर्च चढ़ाने से –",
          highlighted_benefit: "असाध्य रोग मुक्ति व नकारात्मक शक्तियों का नाश",
          mantra: "ॐ नमः शिवाय मरीचं समर्पयामि ॥",
          best_time: "सोमवार व मासिक शिवरात्रि",
          category: "health"
        },
        {
          id: "shivling_03",
          item_icon: "🥣",
          holy_symbol: "🔱",
          action_text: "गाय का शुद्ध घी चढ़ाने से –",
          highlighted_benefit: "मानसिक ऊर्जा, तेजस्विता व वंश वृद्धि",
          mantra: "घृतं शोधितं दिव्यं पावनं पुष्टिदायकम्। गृहाण परमेशान घृतस्नानं प्रदीयते॥",
          best_time: "प्रदोष काल",
          category: "health"
        },
        {
          id: "shivling_04",
          item_icon: "🛢️",
          holy_symbol: "🔱",
          action_text: "सरसों का तेल चढ़ाने से –",
          highlighted_benefit: "शत्रुओं का दमन व कोर्ट-कचहरी में विजय",
          mantra: "ॐ रुद्राय नमः तैलस्नानं समर्पयामि ॥",
          best_time: "शनिवार प्रदोष काल",
          category: "protection"
        },
        {
          id: "shivling_05",
          item_icon: "🥛",
          holy_symbol: "🔱",
          action_text: "कच्चा गाय का दूध चढ़ाने से –",
          highlighted_benefit: "आरोग्य, उत्तम संतान व चंद्रमा दोष शांति",
          mantra: "कामधेनुसमुद्भूतं सर्वेषां जीवनं परम्। पावनं यज्ञहेतुश्च पयः स्नानार्थमर्पितम्॥",
          best_time: "सोमवार ब्रह्ममुहूर्त या प्रातः काल",
          category: "health",
          rules_note: "तांबे के लोटे में दूध न डालें; पीतल, चांदी या कांसे के पात्र का उपयोग करें।"
        },
        {
          id: "shivling_06",
          item_icon: "🌾",
          holy_symbol: "🔱",
          action_text: "अखंड अक्षत (बिना टूटा चावल) चढ़ाने से –",
          highlighted_benefit: "अक्षय धन संपदा व कर्जों से त्वरित मुक्ति",
          mantra: "अक्षताश्च सुरश्रेष्ठ कुंकुमाक्ताः सुशोभिताः। मया निवेदिता भक्त्या गृहाण परमेश्वर॥",
          best_time: "सोमवार",
          category: "wealth"
        },
        {
          id: "shivling_07",
          item_icon: "🍯",
          holy_symbol: "🔱",
          action_text: "शुद्ध शहद चढ़ाने से –",
          highlighted_benefit: "वाक् शुद्धि, सम्मोहन व ऐश्वर्य की प्राप्ति",
          mantra: "मधु वातो ऋतायते मधु क्षरन्ति सिन्धवः। माध्वीर्नः सन्त्वोषधीः॥",
          best_time: "सोमवार",
          category: "marriage"
        },
        {
          id: "shivling_08",
          item_icon: "🎋",
          holy_symbol: "🔱",
          action_text: "गन्ने का रस चढ़ाने से –",
          highlighted_benefit: "अपार धन-धान्य, वैभव व राजयोग सिद्धि",
          mantra: "ॐ पार्वतीपतये नमः इक्षुरसं समर्पयामि ॥",
          best_time: "सावन मास व शिवरात्रि",
          category: "wealth"
        },
        {
          id: "shivling_09",
          item_icon: "🌵",
          holy_symbol: "🔱",
          action_text: "धतूरा व भांग चढ़ाने से –",
          highlighted_benefit: "विषम संकटों से रक्षा, विषहरण व भयमुक्ति",
          mantra: "ॐ महादेवाय नमः धत्तूरपुष्पं फलं च समर्पयामि ॥",
          best_time: "त्रयोदशी प्रदोष",
          category: "protection"
        },
        {
          id: "shivling_10",
          item_icon: "🌿",
          holy_symbol: "🔱",
          action_text: "शमी पत्र चढ़ाने से –",
          highlighted_benefit: "शनि की साढ़ेसाती व ढैय्या के कष्टों का शमन",
          mantra: "ॐ शं शनैश्चराय नमः शिवप्रियाय शमीपत्रं समर्पयामि ॥",
          best_time: "शनिवार",
          category: "graha"
        }
      ]
    },
    {
      deity: "माता पार्वती",
      deity_id: "parvati",
      header_title: "माता पार्वती पर क्या चढ़ाने से क्या फल मिलता है? 🌸",
      holy_symbol: "🌸",
      ruling_planet: "चंद्रमा व शुक्र",
      best_day: "सोमवार व शुक्रवार, तीज, करवाचौथ",
      fav_color: "लाल, गुलाबी व पीला",
      accent_gradient: "from-rose-600 via-pink-500 to-amber-500",
      avatar_icon: "🌸",
      short_intro: "आदिशक्ति पार्वती जी अखंड सौभाग्य, वैवाहिक सुख, संतान रक्षा व मनोवांछित वर प्रदान करने वाली जगज्जननी हैं।",
      main_arpan_mantra: "सर्वमङ्गलमाङ्गल्ये शिवे सर्वार्थसाधिके। शरण्ये त्र्यम्बके गौरि नारायणि नमोऽस्तु ते॥",
      prohibited_items: ["बासी या मुरझाए फूल", "टूटी हुई चूड़ियां"],
      offerings: [
        {
          id: "parvati_01",
          item_icon: "💄",
          holy_symbol: "🌸",
          action_text: "सुहाग सामग्री (सिंदूर, चूड़ी, बिंदी) चढ़ाने से –",
          highlighted_benefit: "अखंड सौभाग्य व सुखी दांपत्य जीवन",
          mantra: "सौभाग्यद्रव्यं दिव्यं च कंकणानि च भूषणम्। गृहाण वरदे देवि पतिमायुष्यवर्धनम्॥",
          best_time: "शुक्रवार या हरतालिका तीज/करवाचौथ",
          category: "marriage"
        },
        {
          id: "parvati_02",
          item_icon: "🥢",
          holy_symbol: "🌸",
          action_text: "लौंग का जोड़ा चढ़ाने से –",
          highlighted_benefit: "रुके हुए कठिन कार्य पूर्ण होना",
          mantra: "ॐ महागौर्ये नमः लवंगयुग्मं समर्पयामि ॥",
          best_time: "शुक्ल पक्ष शुक्रवार",
          category: "career"
        },
        {
          id: "parvati_03",
          item_icon: "🧣",
          holy_symbol: "🌸",
          action_text: "लाल चुनरी चढ़ाने से –",
          highlighted_benefit: "विशेष मनोकामना पूर्ति व मान-सम्मान",
          mantra: "वस्त्रं च दिव्यं सूक्ष्मं च नानारत्नविभूषितम्। गृहाण देवि कल्याणि लोकवन्द्ये नमोऽस्तु ते॥",
          best_time: "नवरात्रि या शुक्रवार",
          category: "wealth"
        },
        {
          id: "parvati_04",
          item_icon: "🥥",
          holy_symbol: "🌸",
          action_text: "साबुत पानीदार नारियल चढ़ाने से –",
          highlighted_benefit: "पारिवारिक शांति व कलह मुक्ति",
          mantra: "श्रीफलं च मया दत्तं सुखशान्तिकरं परम्। गृहाण जगतां मातः पार्वती वरदा भव॥",
          best_time: "पूर्णिमा या सोमवार",
          category: "health"
        },
        {
          id: "parvati_05",
          item_icon: "🌿",
          holy_symbol: "🌸",
          action_text: "मेहंदी अर्पित करने से –",
          highlighted_benefit: "शीघ्र विवाह योग व मनचाहा जीवनसाथी",
          mantra: "ॐ उमायै नमः मेंहदीं समर्पयामि ॥",
          best_time: "सोमवार व शुक्रवार",
          category: "marriage"
        }
      ]
    },
    {
      deity: "भगवान हनुमान",
      deity_id: "hanuman",
      header_title: "हनुमान जी पर क्या चढ़ाने से क्या फल मिलता है? 🚩",
      holy_symbol: "🚩",
      ruling_planet: "मंगल व शनि",
      best_day: "मंगलवार, शनिवार व हनुमान जयंती",
      fav_color: "सिंदूरी लाल व नारंगी",
      accent_gradient: "from-red-600 via-orange-500 to-amber-600",
      avatar_icon: "🚩",
      short_intro: "संकटमोचन पवनपुत्र हनुमान जी कलयुग के प्रत्यक्ष जाग्रत देव हैं। सर्व भय, ग्रह पीड़ा व बाधाओं का तात्कालिक शमन करते हैं।",
      main_arpan_mantra: "ॐ हं हनुमते रुद्रात्मकाय हुं फट् ॥ मनोजवं मारुततुल्यवेगं जितेन्द्रियं बुद्धिमतां वरिष्ठम्॥",
      prohibited_items: ["सफेद फूल", "चरणामृत (हनुमान जी को नहीं दिया जाता)", "बासी तेल या अपवित्र सामग्री"],
      offerings: [
        {
          id: "hanuman_01",
          item_icon: "🔴",
          holy_symbol: "🚩",
          action_text: "सिंदूर व चमेली का तेल (चोला) चढ़ाने से –",
          highlighted_benefit: "सर्व संकट, भूत-पिशाच बाधा व अकाल मृत्यु से रक्षा",
          mantra: "सिन्दूरं शोभनं रक्तं वायुपुत्रस्य तुष्टये। मया समर्पितं भक्त्या गृहाण कपिसत्तम॥",
          best_time: "मंगलवार या शनिवार प्रातः/संध्या",
          category: "protection",
          rules_note: "पुरुष साधक चोला चढ़ा सकते हैं। सिंदूर में चमेली का तेल मिलाएं।"
        },
        {
          id: "hanuman_02",
          item_icon: "🌿",
          holy_symbol: "🚩",
          action_text: "तुलसी दल (माला) चढ़ाने से –",
          highlighted_benefit: "श्री राम की अमोघ कृपा व जन्म-जन्मांतर की तृप्ति",
          mantra: "तुलसीदलैः समभ्यर्च्य रामदूतं महाबलम्। सर्वपापविनिर्मुक्तो याति विष्णोः परं पदम्॥",
          best_time: "मंगलवार प्रातः",
          category: "education",
          rules_note: "तुलसी के पत्तों पर राम नाम लिखकर माला पहनाने से हनुमान जी सर्वाधिक प्रसन्न होते हैं।"
        },
        {
          id: "hanuman_03",
          item_icon: "🟠",
          holy_symbol: "🚩",
          action_text: "बूंदी या बेसन के लड्डू चढ़ाने से –",
          highlighted_benefit: "मंगल व शनि ग्रह दोष शांति, शारीरिक बल",
          mantra: "मोदकं स्वादुसंयुक्तं नैवेद्यं प्रतिगृह्यताम्। अंजनीगर्भसम्भूत पवनपुत्र नमोऽस्तु ते॥",
          best_time: "मंगलवार",
          category: "graha"
        },
        {
          id: "hanuman_04",
          item_icon: "🍃",
          holy_symbol: "🚩",
          action_text: "मीठा बीड़ा पान चढ़ाने से –",
          highlighted_benefit: "अत्यंत कठिन व अटके कार्यों का बीड़ा उठना (सफलता)",
          mantra: "ताम्बूलं च मया दत्तं कर्पूरादिसुवासितम्। गृहाण वानरश्रेष्ठ कार्यसिद्धिं कुरु प्रभो॥",
          best_time: "मंगलवार संध्या",
          category: "career"
        },
        {
          id: "hanuman_05",
          item_icon: "🥣",
          holy_symbol: "🚩",
          action_text: "गुड़ और भुने चने का भोग लगाने से –",
          highlighted_benefit: "कर्ज मुक्ति व मंगल ग्रह के कुप्रभाव का शमन",
          mantra: "ॐ रामदूताय नमः गुडचणकं समर्पयामि ॥",
          best_time: "मंगलवार",
          category: "wealth"
        },
        {
          id: "hanuman_06",
          item_icon: "🌸",
          holy_symbol: "🚩",
          action_text: "आक (मदार) के फूलों की माला चढ़ाने से –",
          highlighted_benefit: "शनि की साढ़ेसाती व राहु के अनिष्ट का निवारण",
          mantra: "ॐ नमो भगवते आंजनेयाय महाबलाय स्वाहा ॥",
          best_time: "शनिवार प्रातः",
          category: "graha"
        }
      ]
    },
    {
      deity: "माता लक्ष्मी",
      deity_id: "lakshmi",
      header_title: "माता लक्ष्मी पर क्या चढ़ाने से क्या फल मिलता है? 🪷",
      holy_symbol: "🪷",
      ruling_planet: "शुक्र",
      best_day: "शुक्रवार, धनतेरस, दीपावली व शरद पूर्णिमा",
      fav_color: "गुलाबी, रक्त वर्ण व पीला",
      accent_gradient: "from-pink-600 via-rose-500 to-amber-500",
      avatar_icon: "🪷",
      short_intro: "महालक्ष्मी धन, ऐश्वर्य, यश, सौभाग्य और श्री (सौन्दर्य) की अधिष्ठात्री देवी हैं।",
      main_arpan_mantra: "ॐ श्रीं ह्रीं श्रीं कमले कमलालये प्रसीद प्रसीद श्रीं ह्रीं श्रीं ॐ महालक्ष्म्यै नमः ॥",
      prohibited_items: ["सफेद फूल (विधवा भाव का प्रतीक)", "कड़वा तेल", "भगवान विष्णु के बिना केवल उग्र पूजन"],
      offerings: [
        {
          id: "lakshmi_01",
          item_icon: "🪷",
          holy_symbol: "🪷",
          action_text: "कमल का फूल चढ़ाने से –",
          highlighted_benefit: "स्थाई धन, मान-प्रतिष्ठा व ऐश्वर्य",
          mantra: "पद्मानने पद्मविपद्मपत्रे पद्मप्रिये पद्मदलायताक्षि। विश्वप्रिये विष्णुमनोऽनुकूले त्वत्पादपद्मं मयि सन्निधत्स्व॥",
          best_time: "शुक्रवार प्रातः अथवा गोधूलि वेला",
          category: "wealth"
        },
        {
          id: "lakshmi_02",
          item_icon: "🍚",
          holy_symbol: "🪷",
          action_text: "चावल व गाय के दूध की खीर का भोग लगाने से –",
          highlighted_benefit: "दरिद्रता का समूल नाश व कुल वृद्धि",
          mantra: "क्षीरान्नं पायसं दिव्यं शर्कराघृतमिश्रितम्। नैवेद्यं प्रतिगृह्यतां महालक्ष्मि नमोऽस्तु ते॥",
          best_time: "शुक्रवार रात्रि अथवा पूर्णिमा",
          category: "wealth"
        },
        {
          id: "lakshmi_03",
          item_icon: "📿",
          holy_symbol: "🪷",
          action_text: "कमलगट्टे की माला या दाने चढ़ाने से –",
          highlighted_benefit: "व्यापार में भारी मुनाफा व धन वर्षा",
          mantra: "ॐ ह्रीं श्रीं क्लीं महालक्ष्म्यै नमः ॥",
          best_time: "दीपावली या शुक्रवार",
          category: "wealth"
        },
        {
          id: "lakshmi_04",
          item_icon: "🐚",
          holy_symbol: "🪷",
          action_text: "पीली कौड़ी (11 कौड़ियां) चढ़ाने से –",
          highlighted_benefit: "तिजोरी व गल्ले में अटूट बरकत",
          mantra: "ॐ श्रीं श्रियै नमः पीतकौपीनं समर्पयामि ॥",
          best_time: "धनतेरस व शुक्रवार",
          category: "wealth",
          rules_note: "कौड़ियों को हल्दी में रंगकर लाल वस्त्र में बांधकर तिजोरी में रखें।"
        },
        {
          id: "lakshmi_05",
          item_icon: "🍬",
          holy_symbol: "🪷",
          action_text: "बताशा व मखाना चढ़ाने से –",
          highlighted_benefit: "शुक्र ग्रह की अनुकूलता, सुख-विलास",
          mantra: "ॐ महालक्ष्म्यै नमः मिष्ठान्नं समर्पयामि ॥",
          best_time: "शुक्रवार",
          category: "graha"
        },
        {
          id: "lakshmi_06",
          item_icon: "🌾",
          holy_symbol: "🪷",
          action_text: "साबुत धनिया बीज चढ़ाने से –",
          highlighted_benefit: "घर में कभी धन-अन्न की कमी न होना",
          mantra: "ॐ धनदायै नमः धान्यबीजं समर्पयामि ॥",
          best_time: "दीपावली व शुक्रवार",
          category: "wealth"
        }
      ]
    },
    {
      deity: "भगवान विष्णु",
      deity_id: "vishnu",
      header_title: "विष्णु जी पर क्या चढ़ाने से क्या फल मिलता है? 🐚",
      holy_symbol: "🐚",
      ruling_planet: "बृहस्पति (गुरु) व बुध",
      best_day: "गुरुवार व एकादशी तिथि",
      fav_color: "पीला व स्वर्ण",
      accent_gradient: "from-amber-600 via-yellow-500 to-amber-700",
      avatar_icon: "🐚",
      short_intro: "जगतपालक भगवान श्रीहरि विष्णु जी धर्म, सुख-शांति, वैवाहिक मंगल और मोक्ष के दाता हैं।",
      main_arpan_mantra: "ॐ नमो भगवते वासुदेवाय ॥ शांताकारं भुजगशयनं पद्मनाभं सुरेशं विश्वाधारं गगनसदृशं मेघवर्णं शुभांगम्॥",
      prohibited_items: ["अक्षत (बिना हल्दी रंगे चावल)", "धतूरा व आक के फूल", "अगस्त्य के फूल"],
      offerings: [
        {
          id: "vishnu_01",
          item_icon: "🌿",
          holy_symbol: "🐚",
          action_text: "तुलसी दल चढ़ाने से –",
          highlighted_benefit: "असीम श्रीहरि कृपा, वैकुंठ पद व मोक्ष",
          mantra: "तुलसी विष्णुप्रेयसि नित्यं भक्त्या समर्पिता। पापं हरसि मे देवि भवसि त्वं मोक्षदायिनी॥",
          best_time: "प्रतिदिन (द्वादशी, रविवार व संक्रांति को न तोड़ें)",
          category: "wealth",
          rules_note: "तुलसी के बिना श्रीहरि भोग स्वीकार नहीं करते।"
        },
        {
          id: "vishnu_02",
          item_icon: "🌼",
          holy_symbol: "🐚",
          action_text: "पीले पुष्प (गेंदा, कनेर, चंपा) चढ़ाने से –",
          highlighted_benefit: "सुख-समृद्धि व गुरु ग्रह की शुभता",
          mantra: "पीतपुष्पैः समायुक्तं सुगन्धि सुमनोहरम्। मया दत्तं गृहाणेश विष्णो लोकप्रभावन॥",
          best_time: "गुरुवार प्रातः",
          category: "graha"
        },
        {
          id: "vishnu_03",
          item_icon: "🟡",
          holy_symbol: "🐚",
          action_text: "केसर या हल्दी का तिलक लगाने से –",
          highlighted_benefit: "शीघ्र विवाह योग व वैवाहिक क्लेश मुक्ति",
          mantra: "हरिद्राचूर्णसंयुक्तं कुंकुमेन समन्वितम्। तिलकं धारयामीश प्रसन्नो भव सर्वदा॥",
          best_time: "गुरुवार",
          category: "marriage"
        },
        {
          id: "vishnu_04",
          item_icon: "🥛",
          holy_symbol: "🐚",
          action_text: "पंचामृत (दूध, दही, घी, शहद, शर्करा) चढ़ाने से –",
          highlighted_benefit: "आरोग्य, उत्तम स्वास्थ्य व आयु वृद्धि",
          mantra: "पञ्चामृतं मयानीतं पयो दधि घृतं मधु। शर्करा च समायुक्तं स्नानार्थं प्रतिगृह्यताम्॥",
          best_time: "एकादशी व पूर्णिमा",
          category: "health"
        },
        {
          id: "vishnu_05",
          item_icon: "🍌",
          holy_symbol: "🐚",
          action_text: "केला व भीगी चने की दाल-गुड़ भोग लगाने से –",
          highlighted_benefit: "बृहस्पति ग्रह दोष शांति, पदोन्नति व संतान सुख",
          mantra: "ॐ विष्णवे नमः कदलीफलसहितं चणकगुडं समर्पयामि ॥",
          best_time: "गुरुवार",
          category: "career"
        }
      ]
    },
    {
      deity: "माता सरस्वती",
      deity_id: "saraswati",
      header_title: "माता सरस्वती पर क्या चढ़ाने से क्या फल मिलता है? 📖",
      holy_symbol: "📖",
      ruling_planet: "बुध व गुरु",
      best_day: "गुरुवार, बुधवार व बसंत पंचमी",
      fav_color: "धवल श्वेत व बसंती पीला",
      accent_gradient: "from-amber-400 via-yellow-300 to-sky-400",
      avatar_icon: "📖",
      short_intro: "ज्ञान, वाणी, बुद्धि, संगीत व विद्या की अधिष्ठात्री मां भगवती सरस्वती हैं।",
      main_arpan_mantra: "ॐ ऐं सरस्वत्यै ऐं नमः ॥ या कुन्देन्दुतुषारहारधवला या शुभ्रवस्त्रावृता या वीणावरदण्डमण्डितकरा या श्वेतपद्मासना॥",
      prohibited_items: ["अशुद्ध पुस्तकें या कलम", "मांसाहारी या तामसिक वातावरण"],
      offerings: [
        {
          id: "saraswati_01",
          item_icon: "💮",
          holy_symbol: "📖",
          action_text: "श्वेत पुष्प (चमेली, कुंद) या श्वेत चंदन चढ़ाने से –",
          highlighted_benefit: "विद्या, उच्च बुद्धि व तीव्र एकाग्रता",
          mantra: "शुक्लपुष्पं च मेधाया दायिनी शुभदायिनी। गृहाण मातर्देवेशि सरस्वति नमोऽस्तु ते॥",
          best_time: "प्रातःकाल",
          category: "education"
        },
        {
          id: "saraswati_02",
          item_icon: "🍬",
          holy_symbol: "📖",
          action_text: "मिश्री व मखाने का भोग लगाने से –",
          highlighted_benefit: "वाणी में माधुर्य व सम्मोहन",
          mantra: "ॐ वाग्देव्यै नमः खण्डशर्करां समर्पयामि ॥",
          best_time: "बसंत पंचमी अथवा बुधवार",
          category: "career"
        },
        {
          id: "saraswati_03",
          item_icon: "🦚",
          holy_symbol: "📖",
          action_text: "मोरपंख चढ़ाने से –",
          highlighted_benefit: "कला, रचनात्मकता व स्मरण शक्ति में वृद्धि",
          mantra: "ॐ सरस्वत्यै नमः मयूरपिच्छं समर्पयामि ॥",
          best_time: "बसंत पंचमी",
          category: "education"
        },
        {
          id: "saraswati_04",
          item_icon: "🖊️",
          holy_symbol: "📖",
          action_text: "कलम (Pen) व पुस्तक अर्पित करने से –",
          highlighted_benefit: "परीक्षा व प्रतियोगी परीक्षाओं में शत-प्रतिशत सफलता",
          mantra: "लेखनीं च मया दत्तां विद्यावृद्धिकरीं पराम्। गृहाण वरदे देवि ज्ञानं देहि नमोऽस्तु ते॥",
          best_time: "परीक्षा से पूर्व या बसंत पंचमी",
          category: "education"
        }
      ]
    },
    {
      deity: "माता काली",
      deity_id: "kali",
      header_title: "माता काली पर क्या चढ़ाने से क्या फल मिलता है? 🗡️",
      holy_symbol: "🗡️",
      ruling_planet: "राहु, केतु व शनि",
      best_day: "शनिवार, मंगलवार व अमावस्या",
      fav_color: "काला व गहरा लाल",
      accent_gradient: "from-purple-900 via-rose-950 to-black",
      avatar_icon: "🗡️",
      short_intro: "महाकाली काल की संहारक और भक्तों की रक्षा करने वाली परम दयालु माता हैं। तंत्र-बाधा व भय का नाश करती हैं।",
      main_arpan_mantra: "ॐ क्रीं कालिकायै नमः ॥ ॐ जयंती मंगला काली भद्रकाली कपालिनी। दुर्गा क्षमा शिवा धात्री स्वाहा स्वधा नमोऽस्तु ते॥",
      prohibited_items: ["झूठ या कपट युक्त पूजन", "तुलसी पत्र", "अपवित्र वस्त्र"],
      offerings: [
        {
          id: "kali_01",
          item_icon: "🍋",
          holy_symbol: "🗡️",
          action_text: "नींबू की माला (11 या 21 नींबू) चढ़ाने से –",
          highlighted_benefit: "शत्रुओं, बुरी नजर व तंत्र-बाधा का समूल नाश",
          mantra: "ॐ क्रीं कालिकायै नमः निम्बूमालां समर्पयामि ॥",
          best_time: "अमावस्या या शनिवार रात्रि",
          category: "protection"
        },
        {
          id: "kali_02",
          item_icon: "⚫",
          holy_symbol: "🗡️",
          action_text: "काले तिल व उड़द चढ़ाने से –",
          highlighted_benefit: "राहु-केतु व शनि महादशा के दोषों का निवारण",
          mantra: "ॐ काल्यै नमः कृष्णतिलान् समर्पयामि ॥",
          best_time: "शनिवार",
          category: "graha"
        },
        {
          id: "kali_03",
          item_icon: "🌺",
          holy_symbol: "🗡️",
          action_text: "108 लाल गुड़हल (अड़हुल) पुष्प चढ़ाने से –",
          highlighted_benefit: "अज्ञात भय, डिप्रेशन व कालसर्प दोष से मुक्ति",
          mantra: "ॐ जयंती मंगला काली रक्तपुष्पं समर्पयामि ॥",
          best_time: "मंगलवार व शनिवार",
          category: "protection"
        },
        {
          id: "kali_04",
          item_icon: "🍃",
          holy_symbol: "🗡️",
          action_text: "मीठा पान चढ़ाने से –",
          highlighted_benefit: "मुकदमों व कोर्ट-कचहरी में विजय",
          mantra: "ताम्बूलं च मया दत्तं गृहाण परमेश्वरि ॥",
          best_time: "शनिवार रात्रि",
          category: "career"
        }
      ]
    },
    {
      deity: "भैरव बाबा",
      deity_id: "bhairav",
      header_title: "भैरव बाबा पर क्या चढ़ाने से क्या फल मिलता है? 🐾",
      holy_symbol: "🐾",
      ruling_planet: "शनि व राहु",
      best_day: "रविवार, शनिवार व कालाष्टमी",
      fav_color: "काला व नीला",
      accent_gradient: "from-stone-900 via-amber-950 to-neutral-900",
      avatar_icon: "🐾",
      short_intro: "भगवान शिव के पांचवें अवतार काल भैरव काशी के कोतवाल और अकाल मृत्यु व संकटों के संहारक हैं।",
      main_arpan_mantra: "ॐ भ्रं भैरवाय नमः ॥ तीक्ष्णदंष्ट्र महाकाय कल्पान्तदहनोपम। भैरवाय नमस्तुभ्यं अनुज्ञां दातुमर्हसि॥",
      prohibited_items: ["तुलसी पत्र", "अपवित्र या जूठी सामग्री"],
      offerings: [
        {
          id: "bhairav_01",
          item_icon: "🛢️",
          holy_symbol: "🐾",
          action_text: "सरसों का तेल व दीपक चढ़ाने से –",
          highlighted_benefit: "शनि दोष शांति व जीवन में स्थिरता",
          mantra: "ॐ भैरवाय नमः तैलदीपकं समर्पयामि ॥",
          best_time: "शनिवार व रविवार संध्या",
          category: "graha"
        },
        {
          id: "bhairav_02",
          item_icon: "🥨",
          holy_symbol: "🐾",
          action_text: "इमरती या जलेबी का भोग लगाने से –",
          highlighted_benefit: "दुर्घटनाओं, अकाल मृत्यु व आकस्मिक विपदा से बचाव",
          mantra: "ॐ बटुक भैरवाय नमः मिष्ठान्नं निवेदयामि ॥",
          best_time: "रविवार प्रातः अथवा संध्या",
          category: "protection"
        },
        {
          id: "bhairav_03",
          item_icon: "🧆",
          holy_symbol: "🐾",
          action_text: "उड़द के वड़े चढ़ाने से –",
          highlighted_benefit: "गुप्त शत्रुओं का नाश व व्यापारिक सुरक्षा",
          mantra: "माषवटकांश्च नैवेद्यं गृहाण बटुकप्रभो ॥",
          best_time: "शनिवार व कालाष्टमी",
          category: "protection"
        },
        {
          id: "bhairav_04",
          item_icon: "🐕",
          holy_symbol: "🐾",
          action_text: "काले श्वान (कुत्ते) को मीठी रोटी खिलाने से –",
          highlighted_benefit: "भैरव जी की अमोघ कृपा व राहु शांति",
          mantra: "ॐ श्वानवाहनाय भैरवाय नमः ॥",
          best_time: "रविवार व शनिवार",
          category: "graha"
        }
      ]
    },
    {
      deity: "भगवान सूर्य (सूर्य नारायण)",
      deity_id: "surya",
      header_title: "सूर्य देव को क्या अर्पण करने से क्या फल मिलता है? ☀️",
      holy_symbol: "☀️",
      ruling_planet: "सूर्य (नवग्रहों के राजा)",
      best_day: "रविवार व सप्तमी तिथि",
      fav_color: "लाल, नारंगी व तांबिया",
      accent_gradient: "from-amber-600 via-orange-500 to-yellow-500",
      avatar_icon: "☀️",
      short_intro: "प्रत्यक्ष देवता भगवान सूर्य आरोग्य, मान-प्रतिष्ठा, आत्मबल, नेत्र ज्योति और पिता के कारक हैं।",
      main_arpan_mantra: "ॐ घृणिः सूर्याय नमः ॥ ॐ नमो भगवते श्रीसूर्यायादित्याय अहोवाहिन्यै नमः॥",
      prohibited_items: ["शंख से जल अर्पण (सूर्य को शंख से अर्घ्य सर्वथा वर्जित)", "लोहे या प्लास्टिक के लोटे से अर्घ्य", "बिना स्नान अर्घ्य देना"],
      offerings: [
        {
          id: "surya_01",
          item_icon: "🪔",
          holy_symbol: "☀️",
          action_text: "तांबे के लोटे से जल, रोली व अक्षत अर्घ्य देने से –",
          highlighted_benefit: "मान-सम्मान, पद-प्रतिष्ठा व सरकारी नौकरी में सफलता",
          mantra: "एहि सूर्य सहस्त्रांशो तेजोराशे जगत्पते। अनुकम्पय मां भक्त्या गृहाणार्घ्यं दिवाकर॥",
          best_time: "सूर्योदय के 1 घंटे के भीतर",
          category: "career",
          rules_note: "दोनों हाथ सिर से ऊपर उठाकर अर्घ्य दें। जल की धार पैरों पर न पड़े।"
        },
        {
          id: "surya_02",
          item_icon: "🌺",
          holy_symbol: "☀️",
          action_text: "लाल कनेर या लाल गुड़हल पुष्प चढ़ाने से –",
          highlighted_benefit: "तेजस्वी आभा, नेत्र आरोग्य व आत्मबल वृद्धि",
          mantra: "ॐ भास्कराय नमः रक्तपुष्पं समर्पयामि ॥",
          best_time: "रविवार प्रातः",
          category: "health"
        },
        {
          id: "surya_03",
          item_icon: "🍯",
          holy_symbol: "☀️",
          action_text: "गुड़ व गेहूं का अर्पण / भोग लगाने से –",
          highlighted_benefit: "सूर्य की महादशा में शुभ फल व पिता से मधुर संबंध",
          mantra: "ॐ आदित्याय नमः गुडगोधूमं समर्पयामि ॥",
          best_time: "रविवार",
          category: "graha"
        }
      ]
    },
    {
      deity: "भगवान शनि देव",
      deity_id: "shani",
      header_title: "शनि देव पर क्या चढ़ाने से क्या फल मिलता है? 🪐",
      holy_symbol: "🪐",
      ruling_planet: "शनि (कर्मफल दाता व दंडाधिकारी)",
      best_day: "शनिवार व शनिश्चरी अमावस्या",
      fav_color: "काला व गहरा नीला",
      accent_gradient: "from-slate-800 via-indigo-950 to-blue-900",
      avatar_icon: "🪐",
      short_intro: "कर्मफल प्रदाता शनि देव न्याय के स्वामी हैं। निष्कपट सेवा व सात्विक अर्पण से अत्यंत प्रसन्न होकर रंक को राजा बना देते हैं।",
      main_arpan_mantra: "ॐ शं शनैश्चराय नमः ॥ नीलांजनसमाभासं रविपुत्रं यमाग्रजम्। छायामार्तण्डसम्भूतं तं नमामि शनैश्चरम्॥",
      prohibited_items: ["तांबे के पात्र में तेल (तांबे में तेल विष समान माना गया है)", "शनि प्रतिमा की आंखों में सीधा देखना", "पश्चिम दिशा के अतिरिक्त पीठ दिखाना"],
      offerings: [
        {
          id: "shani_01",
          item_icon: "🛢️",
          holy_symbol: "🪐",
          action_text: "सरसों या तिल का तेल चढ़ाने से –",
          highlighted_benefit: "साढ़ेसाती, ढैय्या व शनि महादशा के कष्टों का शमन",
          mantra: "ॐ प्रां प्रीं प्रौं सः शनैश्चराय नमः तैलस्नानं समर्पयामि ॥",
          best_time: "शनिवार संध्या",
          category: "graha",
          rules_note: "लोहे के पात्र में तेल लेकर अपना चेहरा देखकर छाया दान करें।"
        },
        {
          id: "shani_02",
          item_icon: "💙",
          holy_symbol: "🪐",
          action_text: "नीला अपराजिता पुष्प चढ़ाने से –",
          highlighted_benefit: "कर्म बाधा निवारण व न्याय एवं मुकदमों में विजय",
          mantra: "ॐ मन्दगतये नमः नीलपुष्पं समर्पयामि ॥",
          best_time: "शनिवार प्रातः",
          category: "career"
        },
        {
          id: "shani_03",
          item_icon: "🌿",
          holy_symbol: "🪐",
          action_text: "शमी पत्र व काले तिल चढ़ाने से –",
          highlighted_benefit: "अकाल मृत्यु भय मुक्ति व दीर्घायु",
          mantra: "शमी शमयते पापं शमी शत्रुविनाशिनी ॥",
          best_time: "शनिवार",
          category: "health"
        },
        {
          id: "shani_04",
          item_icon: "⚫",
          holy_symbol: "🪐",
          action_text: "साबुत काली उड़द चढ़ाने से –",
          highlighted_benefit: "व्यापार में हानि से रक्षा व आकस्मिक लाभ",
          mantra: "ॐ छायापुत्राय नमः माषधान्यं समर्पयामि ॥",
          best_time: "शनिवार",
          category: "wealth"
        }
      ]
    },
    {
      deity: "माता दुर्गा",
      deity_id: "durga",
      header_title: "मां दुर्गा पर क्या चढ़ाने से क्या फल मिलता है? 🦁",
      holy_symbol: "🦁",
      ruling_planet: "राहु व नवग्रह",
      best_day: "शुक्रवार, मंगलवार, अष्टमी व नवरात्रि",
      fav_color: "लाल व सुनहरी",
      accent_gradient: "from-red-700 via-rose-600 to-amber-600",
      avatar_icon: "🦁",
      short_intro: "दुर्गतिनाशिनी मां दुर्गा समस्त विपत्तियों, दैहिक-दैविक-भौतिक तापों को हरने वाली पराशक्ति हैं।",
      main_arpan_mantra: "ॐ दुं दुर्गायै नमः ॥ सर्वमंगलमांगल्ये शिवे सर्वार्थसाधिके। शरण्ये त्र्यंबके गौरि नारायणि नमोऽस्तु ते॥",
      prohibited_items: ["दूर्वा (दुर्गा जी को दूर्वा नहीं चढ़ाई जाती)", "आक व मदार के फूल", "तुलसी पत्र"],
      offerings: [
        {
          id: "durga_01",
          item_icon: "🌺",
          holy_symbol: "🦁",
          action_text: "लाल अड़हुल (गुड़हल) व लाल चुनरी चढ़ाने से –",
          highlighted_benefit: "शत्रु पराजय, सर्व संकट नाश व मान-सम्मान",
          mantra: "ॐ दुर्गतिनाशिन्यै नमः रक्तपुष्पं समर्पयामि ॥",
          best_time: "नवरात्रि अथवा शुक्रवार",
          category: "protection"
        },
        {
          id: "durga_02",
          item_icon: "🥢",
          holy_symbol: "🦁",
          action_text: "कपूर आरती व लौंग का जोड़ा चढ़ाने से –",
          highlighted_benefit: "घर की नकारात्मक ऊर्जा का नाश व सुखद वातावरण",
          mantra: "कर्पूरगौरं करुणावतारं... ॐ दुर्गायै कर्पूरनीरंजनं समर्पयामि ॥",
          best_time: "संध्या आरती",
          category: "health"
        },
        {
          id: "durga_03",
          item_icon: "🥥",
          holy_symbol: "🦁",
          action_text: "नारियल व हलवा-पूरी का भोग लगाने से –",
          highlighted_benefit: "मनोवांछित फल की प्राप्ति व संतान सुख",
          mantra: "ॐ महामायायै नमः महाभोगं निवेदयामि ॥",
          best_time: "अष्टमी व नवमी तिथि",
          category: "wealth"
        }
      ]
    },
    {
      deity: "श्री कुबेर देव",
      deity_id: "kuber",
      header_title: "कुबेर जी पर क्या चढ़ाने से क्या फल मिलता है? 💰",
      holy_symbol: "💰",
      ruling_planet: "बुध व शुक्र",
      best_day: "धनतेरस, गुरुवार व पूर्णिमा",
      fav_color: "पीला व सुनहरा",
      accent_gradient: "from-yellow-600 via-amber-500 to-yellow-700",
      avatar_icon: "💰",
      short_intro: "धनाधिपति यक्षराज कुबेर देव देवताओं के कोषाध्यक्ष हैं। स्थाई संपत्ति और समृद्धि के दाता हैं।",
      main_arpan_mantra: "ॐ यक्षाय कुबेराय वैश्रवणाय धनधान्याधिपतये धनधान्यसमृद्धिं मे देहि दापय स्वाहा ॥",
      prohibited_items: ["अशुद्ध स्थान पर पूजन", "काले वस्त्र"],
      offerings: [
        {
          id: "kuber_01",
          item_icon: "📿",
          holy_symbol: "💰",
          action_text: "कमलगट्टा व साबुत धनिया चढ़ाने से –",
          highlighted_benefit: "तिजोरी में स्थाई धन संचय व दरिद्रता का नाश",
          mantra: "ॐ धनाध्यक्षाय नमः कमलगट्ठां समर्पयामि ॥",
          best_time: "धनतेरस व शुक्रवार",
          category: "wealth"
        },
        {
          id: "kuber_02",
          item_icon: "🌾",
          holy_symbol: "💰",
          action_text: "पीला अक्षत व सुपारी चढ़ाने से –",
          highlighted_benefit: "व्यापार में अटका हुआ धन प्राप्त होना",
          mantra: "ॐ वैश्रवणाय नमः पीताक्षतं समर्पयामि ॥",
          best_time: "गुरूवार",
          category: "wealth"
        }
      ]
    },
    {
      deity: "भगवान कार्तिकेय (स्कंद)",
      deity_id: "kartikeya",
      header_title: "कार्तिकेय जी पर क्या चढ़ाने से क्या फल मिलता है? 🦚",
      holy_symbol: "🦚",
      ruling_planet: "मंगल (सेनापति)",
      best_day: "मंगलवार व स्कंद षष्ठी",
      fav_color: "लाल व सिंदूरी",
      accent_gradient: "from-rose-600 via-red-600 to-orange-500",
      avatar_icon: "🦚",
      short_intro: "देवसेनापति भगवान कार्तिकेय मंगल ग्रह के अधिष्ठाता, शौर्य, पराक्रम और भूमि विवाद में विजय प्रदाता हैं।",
      main_arpan_mantra: "ॐ षण्मुखाय नमः ॥ ॐ तत्पुरुषाय विद्महे महासेनाय धीमहि तन्नः षण्मुखः प्रचोदयात्॥",
      prohibited_items: ["तामसिक विचार", "अशुद्ध मन"],
      offerings: [
        {
          id: "kartikeya_01",
          item_icon: "🌺",
          holy_symbol: "🦚",
          action_text: "लाल पुष्प व सिंदूर चढ़ाने से –",
          highlighted_benefit: "मंगल दोष निवारण, भूमि विवाद में विजय व शौर्य",
          mantra: "ॐ स्कन्दाय नमः रक्तपुष्पं समर्पयामि ॥",
          best_time: "मंगलवार व षष्ठी तिथि",
          category: "graha"
        },
        {
          id: "kartikeya_02",
          item_icon: "⚪",
          holy_symbol: "🦚",
          action_text: "विभूति (भस्म) अर्पित करने से –",
          highlighted_benefit: "शत्रुओं पर वर्चस्व व मानसिक निर्भीकता",
          mantra: "ॐ महासेनाय नमः भस्म समर्पयामि ॥",
          best_time: "मंगलवार",
          category: "protection"
        }
      ]
    }
  ]
};
