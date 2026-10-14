export interface DevotionalTrack {
  id: string;
  title: string;
  category: 'stotra' | 'aarti' | 'mantra' | 'bhajan' | 'saptashati';
  deity: string;
  duration: string;
  audioUrl?: string; // Direct Public Domain Audio
  lyricsText: string;
  meaningText?: string;
  description: string;
}

export const SHIV_MAHIMNA_STOTRAM_TEXT = `॥ अथ श्री शिवमहिम्नस्तोत्रम् ॥

महिम्नः पारं ते परमविदुषो यद्यसदृशी।
स्तुतिर्ब्रह्मादीनामपि तदवसन्नास्त्वयि गिरः।
अथावाच्यः सर्वः स्वमतिपरिणामावधि गृणन्।
ममाप्येष स्तोत्रे हर निरपवादः परिकरः ॥ १ ॥

अतीतः पन्थानं तव च महिमा वाङ्मनसयोः।
अव्यावृत्त्या यं चकितमभिधत्ते श्रुतिरपि।
स कस्य स्तोतव्यः कतिविधगुणः कस्य विषयः।
पदे त्वर्वाचीने पतति न नमः कस्य मनसि ॥ २ ॥

मधुस्फीता वाचः परमममृतं निर्मितवतः।
तव ब्रह्मन किं वागपि सुरगुरोर्विस्मयपदम्।
मम त्वेतां वाणीं गुणकथनपुण्येन भवतः।
पुनामीत्यर्थेऽस्मिन पुरमथन बुद्धिर्व्यवसिता ॥ ३ ॥

तवैश्वर्यं यत्तज्जगदुदयरक्षाप्रलयकृत्।
त्रयीवस्तु व्यस्तं तिस्रुषु गुणभिन्नासु तनुषु।
अभव्यानामस्मिन वरद रमणीयाममणीयां।
कुतर्काभियुक्तां विदधति मनोमोहकमहीम् ॥ ४ ॥

किमीहः किंकायः स खलु किमुपायस्त्रिभुवनम्।
किमाधारो धाता सृजति किमुपादिश्य हतकाः।
अतर्क्यैश्वर्ये त्वय्यनवसरदुःस्थो हतधियः।
कुतर्कोऽयं कांश्चित् मुखरयति मोहाय जगतः ॥ ५ ॥

अजालोका लोकाः किमवयववन्तोऽपि जगताम्।
अधिष्ठातारं किं भवविधिरनादृत्य भवति।
अनीशो वा कुर्याद् भुवनजनने कः परिकरो।
यतो मन्दैस्त्वय्यमर्चितकुधियः संशयभृतः ॥ ६ ॥

त्रयी सांख्यं योगः पशुपतिमतं वैष्णवमिति।
प्रभिन्ने प्रस्थाने परमिदमदः पथ्यमिति च।
रुचीनां वैचित्र्यादृजुकुटिल नानापथजुषाम्।
नृणामेको गम्यस्त्वमसि पयसामर्णव इव ॥ ७ ॥

महोक्षः खट्वाङ्गं परशुरजिनं भस्म फणिनः।
कपालं चेतीयत्तव वरद तन्त्रोपकरणम्।
सुरास्तामृद्धिं स्मरविषयभूतामभिमुखाः।
भवन्तं नेच्छन्ति रजसि रममाणाः सुकृतिनः ॥ ८ ॥

ध्रुवं कश्चित् सर्वं सकलमपरस्त्वध्रुवमिदम्।
परो धौर्याधौर्ये जगति गदति त्वत्तमपरः।
समस्तमप्येतद् त्रिभिरपि च गामेषुरुचिभिः।
न विस्मय्यो देवः त्रिपुरहर मार्गो निरवधिः ॥ ९ ॥

तवैश्वर्यं यत्नाद्यदुपरि विरिञ्चिर्हरिरधः।
परिच्छेदूं यातावनलमनलस्कन्धवपुषः।
ततो भक्तिश्रद्धाभरगुरुगृणद्भ्यां गिरिश यत्।
स्वयं तस्थे ताभ्यां तव किमनुवृत्तिर्न फलति ॥ १० ॥`;

function chant(id: string, file: string) {
  const path = file.split("/").map((part) => encodeURIComponent(part)).join("/");
  return `https://archive.org/download/${id}/${path}`;
}

const SAPT = "DeviMahatmyamRecitation";

function saptPart(order: string, title: string, file: string, blurb: string): DevotionalTrack {
  return {
    id: `saptashati-${order}`,
    title,
    category: "saptashati",
    deity: "भगवती दुर्गा",
    duration: "गायन",
    audioUrl: chant(SAPT, file),
    lyricsText: `${title}\n\nयह पूरा भाग गा कर सुनाया जा रहा है। अगला भाग अपने आप चलेगा।`,
    meaningText: blurb,
    description: "संपूर्ण श्री दुर्गा सप्तशती — कवच, अर्गला, कीलक, १३ अध्याय, फिर कुंजिका।",
  };
}

const SAPTASHATI_PATH: DevotionalTrack[] = [
  saptPart("01", "१. देवी कवचम्", "Devi Mahatmyam Recitation/01 Devi Kavacham.mp3", "पाठ का आरंभ। देवी कवच शरीर और दिशाओं की रक्षा के लिए।"),
  saptPart("02", "२. अर्गला स्तोत्रम्", "Devi Mahatmyam Recitation/02 Argala Stotram.mp3", "कवच के बाद अर्गला। देवी से वरदान की स्तुति।"),
  saptPart("03", "३. कीलक स्तोत्रम्", "Devi Mahatmyam Recitation/03 Keelakam.mp3", "अर्गला के बाद कीलक। पाठ की सिद्धि का स्तोत्र।"),
  saptPart("04", "४. प्रथम अध्याय", "Devi Mahatmyam Recitation/05 Chapter 1 Pradamodhyayha.mp3", "मधु-कैटभ प्रसंग। तेरह अध्यायों में पहला।"),
  saptPart("05", "५. द्वितीय अध्याय", "Devi Mahatmyam Recitation/06 Chapter 2 Divitiyodhyayaha.mp3", "महिषासुर सेना का प्रसंग।"),
  saptPart("06", "६. तृतीय अध्याय", "Devi Mahatmyam Recitation/07 Chapter 3 Tritiyodhyayaha.mp3", "देवी की स्तुति और महिषासुर वध का आरंभ।"),
  saptPart("07", "७. चतुर्थ अध्याय", "Devi Mahatmyam Recitation/08 Chapter 4 Chaturthodhayayaha.mp3", "इन्द्रादि देवताओं द्वारा देवी की स्तुति।"),
  saptPart("08", "८. पञ्चम अध्याय", "Devi Mahatmyam Recitation/09 Chapter 5 Panchamodhyayaha.mp3", "देवी का संवाद और महिमा।"),
  saptPart("09", "९. षष्ठ अध्याय", "Devi Mahatmyam Recitation/10 Chapter 6 Shashtodhyayaha.mp3", "धूम्रलोचन वध।"),
  saptPart("10", "१०. सप्तम अध्याय", "Devi Mahatmyam Recitation/11 Chapter 7 Saptamodhyayaha.mp3", "चण्ड-मुण्ड वध।"),
  saptPart("11", "११. अष्टम अध्याय", "Devi Mahatmyam Recitation/12 Chapter 8 Ashtamodhyayaha.mp3", "रक्तबीज वध।"),
  saptPart("12", "१२. नवम अध्याय", "Devi Mahatmyam Recitation/13 Chapter 9 Navamodhyayaha.mp3", "निशुम्भ वध।"),
  saptPart("13", "१३. दशम अध्याय", "Devi Mahatmyam Recitation/14 Chapter 10 Dasamodhyayaha.mp3", "शुम्भ वध।"),
  saptPart("14", "१४. एकादश अध्याय", "Devi Mahatmyam Recitation/15 Chapter 11 Ekadhasadhyayaha.mp3", "देवताओं की नारायणी स्तुति।"),
  saptPart("15", "१५. द्वादश अध्याय", "Devi Mahatmyam Recitation/16 Chapter 12 Dwadhasodhyayaha.mp3", "देवी का वरदान।"),
  saptPart("16", "१६. त्रयोदश अध्याय", "Devi Mahatmyam Recitation/17 Chapter 13 Triodasadhyayaha.mp3", "सुरथ और समाधि वैश्य का फल। तेरहवाँ अध्याय।"),
  {
    id: "saptashati-kunjika",
    title: "१७. सिद्ध कुञ्जिका स्तोत्रम्",
    category: "saptashati",
    deity: "भगवती दुर्गा",
    duration: "गायन",
    audioUrl: chant("siddha-kunjika-stotram", "Siddha Kunjika Stotram.mp3"),
    lyricsText: "॥ श्री सिद्ध कुञ्जिका स्तोत्रम् ॥\n\nतेरह अध्यायों के बाद कुंजिका। यह सप्तशती पाठ का समापन स्तोत्र है।",
    meaningText: "रुद्रयामल का सिद्ध कुंजिका स्तोत्र। सप्तशती के अंत में बोला जाता है।",
    description: "कवच से कुंजिका तक संपूर्ण पाठ का अंतिम भाग।",
  },
];

export const DEVOTIONAL_AUDIO_TRACKS: DevotionalTrack[] = [
  {
    id: 'shiv-mahimna',
    title: 'श्री शिव महिम्न स्तोत्रम् (सम्पूर्ण १-१० श्लोक पाठ)',
    category: 'stotra',
    deity: 'भगवान शिव',
    duration: '08:45',
    audioUrl: chant("ShivaStotrasAndMantras", "07Shiva Mahimna Stotram.mp3"),
    lyricsText: SHIV_MAHIMNA_STOTRAM_TEXT,
    meaningText: 'गंधर्वराज पुष्पदन्त विरचित श्री शिव महिम्न स्तोत्रम् — भगवान शिव के अतुलनीय प्रभाव, महिमा एवं दिव्य स्वरूप की स्तुति।',
    description: 'गंभीर सुरीली वैदिक ध्वनि में श्री शिव महिम्न स्तोत्र। वृद्धजनों के लिए सुगम पाठ एवं भक्ति संगीत।',
  },
  {
    id: 'hanuman-chalisa-audio',
    title: 'श्री हनुमान चालीसा (मधुर स्वर पाठ)',
    category: 'bhajan',
    deity: 'श्री हनुमान जी',
    duration: '09:30',
    audioUrl: chant("HinduGodSongs", "Hanuman Chalisa.mp3"),
    lyricsText: `श्रीगुरु चरन सरोज रज निज मनु मुकुरु सुधारि। बरनउँ रघुबर बिमल जसु जो दायकु फल चारि॥
बुद्धिहीन तनु जानिके सुमिरौ पवन-कुमार। बल बुद्धि बिद्या देहु मोहिं हरहु कलेस बिकार॥

जय हनुमान ज्ञान गुन सागर। जय कपीस तिहुँ लोक उजागर॥
राम दूत अतुलित बल धामा। अंजनि-पुत्र पवनसुत नामा॥
महाबीर बिक्रम बजरंगी। कुमति निवार सुमति के संगी॥
कंचन बरन बिराज सुबेसा। कानन कुंडल कुंचित केसा॥
हाथ बज्र ओ ध्वजा बिराजै। काँधे मूँज जनेऊ साजै॥
संकर सुवन केसरीनंदन। तेज प्रताप महा जग बन्दन॥`,
    meaningText: 'गोस्वामी तुलसीदास कृत श्री हनुमान चालीसा — बल, बुद्धि, विद्या एवं आरोग्य प्रदाता संकटमोचन पाठ।',
    description: '100% सात्विक सुरों में श्री हनुमान चालीसा का गान।',
  },
  ...SAPTASHATI_PATH,
  {
    id: 'gayatri-mantra-21',
    title: 'श्री गायत्री महामंत्र (२१ बार दिव्य जाप)',
    category: 'mantra',
    deity: 'वेदमाता गायत्री',
    duration: '11:20',
    audioUrl: chant("HinduGodSongs", "Gayatri Mantra.mp3"),
    lyricsText: `ॐ भूर्भुवः स्वः। तत्सवितुर्वरेण्यं भर्गो देवस्य धीमहि। धियो यो नः प्रचोदयात्॥`,
    meaningText: 'सृष्टि के प्रकाशक परमात्मा हमारे अंतःकरण को सद्बुद्धि व सन्मार्ग से प्रकाशित करें।',
    description: 'बुद्धि, एकाग्रता एवं आध्यात्मिक शांति हेतु २१ बार दिव्य गायत्री जाप।',
  },
  {
    id: 'mahamrityunjaya-mantra',
    title: 'श्री महामृत्युंजय मंत्र (रोग-शोक नाशक १०८ जाप)',
    category: 'mantra',
    deity: 'भगवान त्र्यम्बक शिव',
    duration: '15:00',
    audioUrl: chant("ShivaStotrasAndMantras", "80Maha Mrityunjay Mantra.mp3"),
    lyricsText: `ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम्। उर्वारुकमिव बन्धनान्मृत्योर्मुक्षीय माऽमृतात्॥`,
    meaningText: 'हम त्रिनेत्रधारी सुगन्धित एवं पुष्टि को बढ़ाने वाले भगवान शिव की उपासना करते हैं। जिस प्रकार पका हुआ खरबूजा बेल से मुक्त होता है, उसी प्रकार हम मृत्यु से मुक्त होकर अमृतत्व प्राप्त करें।',
    description: 'स्वास्थ्य सुरक्षा एवं दीर्घायु हेतु महामृत्युंजय जाप।',
  },
  {
    id: 'ganesh-aarti',
    title: 'जय गणेश जय गणेश देवा (श्री गणेश आरती)',
    category: 'aarti',
    deity: 'भगवान श्री गणेश',
    duration: '04:30',
    audioUrl: chant("JaiGaneshJaiGaneshJaiGaneshDevaLordGaneshAarti", "Jai Ganesh Jai Ganesh Jai Ganesh Deva - Lord Ganesh Aarti.mp3"),
    lyricsText: `जय गणेश जय गणेश जय गणेश देवा।
माता जाकी पारवती पिता महादेवा॥

एक दन्त दयावन्त चार भुजाधारी।
माथे सिन्दूर सोहे मूसे की सवारी॥
पान चढ़े फूल चढ़े और चढ़े मेवा।
लड्डुअन का भोग लगे सन्त करें सेवा॥
अंधन को आँख देत कोढ़िन को काया।
बांझन को पुत्र देत निर्धन को माया॥`,
    meaningText: 'विघ्नहर्ता श्री गणेश जी की सर्व-मंगलकारिणी नित्य आरती।',
    description: 'सुरीले ढोलक, मंजीरा एवं घंटी की ध्वनि में गणेश आरती।',
  },
  {
    id: 'laxmi-aarti',
    title: 'श्री महालक्ष्मी मंत्र',
    category: 'mantra',
    deity: 'भगवती महालक्ष्मी',
    duration: '05:10',
    audioUrl: chant("HinduGodSongs", "Mahalakshmi Mantra.mp3"),
    lyricsText: `ॐ जय लक्ष्मी माता, मैया जय लक्ष्मी माता।
तुमको निसदिन ध्यावत, हर विष्णु विधाता॥
उमा रमा ब्रह्माणी, तुम ही जग-माता।
सूर्य चन्द्रमा ध्यावत, नारद ऋषि गाता॥
दुर्गा रूप निरंजनी, सुख सम्पति दाता।
जो कोई तुमको ध्यावत, ऋद्धि सिद्धि पाता॥`,
    meaningText: 'सुख-समृद्धि, वैभव एवं ऐश्वर्य प्रदायिनी श्री महालक्ष्मी आरती।',
    description: 'संध्याकालीन सात्विक आरती एवं धन-धान्य समृद्धि पाठ।',
  },
  {
    id: 'ram-stuti',
    title: 'श्री रामचन्द्र कृपालु भजु मन (श्री राम स्तुति)',
    category: 'stotra',
    deity: 'भगवान श्री राम',
    duration: '06:15',
    audioUrl: chant("SureshanandjiShriRamchandraKripaluBhajman", "Sureshanandji-Shri-Ramchandra-Kripalu-Bhajman.mp3"),
    lyricsText: `श्रीरामचन्द्र कृपालु भजु मन हरण भवभय दारुणम्।
नवकंज लोचन, कंज मुख, कर कंज, पद कंजारुणम्॥
कन्दर्प अगणित अमित छवि, नवनील नीरद सुन्दरम्।
पट पीत मानहु तड़ित रुचि शुचि नौमि जनक सुतावरम्॥`,
    meaningText: 'गोस्वामी तुलसीदास कृत भगवान श्री राम की करुणामयी पावन स्तुति।',
    description: 'भय-शोक नाशक एवं मनःशांति प्रदायक मधुर राम स्तुति।',
  },
  {
    id: 'shiva-tandav',
    title: 'श्री शिव ताण्डव स्तोत्रम्',
    category: 'stotra',
    deity: 'भगवान शिव',
    duration: 'गायन',
    audioUrl: chant("ShivaStotrasAndMantras", "36Shiva Tandav Stotram.mp3"),
    lyricsText: '॥ श्री शिवताण्डवस्तोत्रम् ॥\nजटाटवीगलज्जलप्रवाहपावितस्थले।',
    meaningText: 'रावणकृत शिव ताण्डव। शिव की नृत्यमयी महिमा।',
    description: 'शिव ताण्डव का पूरा गान।',
  },
  {
    id: 'shiva-kavach',
    title: 'श्री शिव कवचम्',
    category: 'stotra',
    deity: 'भगवान शिव',
    duration: 'गायन',
    audioUrl: chant("ShivaStotrasAndMantras", "08Shiva Kavacham.mp3"),
    lyricsText: '॥ श्री शिव कवचम् ॥',
    meaningText: 'शिव कवच रक्षा और अभय के लिए।',
    description: 'शिव कवच का पूरा गान।',
  },
  {
    id: 'shiva-panchakshar',
    title: 'श्री शिव पञ्चाक्षर स्तोत्रम्',
    category: 'stotra',
    deity: 'भगवान शिव',
    duration: 'गायन',
    audioUrl: chant("ShivaStotrasAndMantras", "24Shiva Panchakshar Stotram.mp3"),
    lyricsText: 'नागेन्द्रहाराय त्रिलोचनाय भस्माङ्गरागाय महेश्वराय।',
    meaningText: 'नमः शिवाय का पंचाक्षर स्तोत्र।',
    description: 'पंचाक्षर स्तोत्र का पूरा गान।',
  },
  {
    id: 'om-namah-shivaya',
    title: 'ॐ नमः शिवाय (जाप)',
    category: 'mantra',
    deity: 'भगवान शिव',
    duration: 'गायन',
    audioUrl: chant("HinduGodSongs", "Om Namah Shivaya.mp3"),
    lyricsText: 'ॐ नमः शिवाय।',
    meaningText: 'शिव पंचाक्षर मंत्र का जाप।',
    description: 'ॐ नमः शिवाय का सतत गान।',
  },
  {
    id: 'ganesh-mantra',
    title: 'श्री गणेश मंत्र',
    category: 'mantra',
    deity: 'भगवान श्री गणेश',
    duration: 'गायन',
    audioUrl: chant("HinduGodSongs", "Ganesh Mantra.mp3"),
    lyricsText: 'ॐ गं गणपतये नमः।',
    meaningText: 'विघ्नहर्ता गणेश मंत्र।',
    description: 'गणेश मंत्र का गान।',
  },
];
