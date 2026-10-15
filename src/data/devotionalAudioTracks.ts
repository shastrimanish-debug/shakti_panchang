import { DURGA_ANGAS } from './durgaSaptashatiData';
import { HANUMAN_CHALISA } from './hanumanChalisa';
import durgaPathRaw from './durgaPath.json';

export interface DevotionalTrack {
  id: string;
  title: string;
  category: 'stotra' | 'aarti' | 'mantra' | 'bhajan' | 'saptashati';
  deity: string;
  duration: string;
  audioUrl?: string; // Public Domain / Archive Vedic Chanting Audio
  licenseNote?: string;
  lyricsText: string;
  meaningText?: string;
  description: string;
}

const durgaChapters = (
  durgaPathRaw as {
    chapters: Record<string, { n: number; text: string }[]>;
  }
).chapters;

function getAngaMultiLineText(angaId: string): string {
  const anga = DURGA_ANGAS.find((a) => a.id === angaId);
  if (!anga) return '';
  return anga.verses
    .map(
      (v, idx) =>
        `${v.sanskrit.trim()} ॥ ${idx + 1} ॥\nभावार्थ: ${v.hindi.trim()}`
    )
    .join('\n\n');
}

function getChapterMultiLineText(chapterNum: number): string {
  const list = durgaChapters[String(chapterNum)] || [];
  return list
    .map((item) => {
      // Ensure every single-danda (।) breaks cleanly into a multi-line shloka
      const formatted = item.text
        .replace(/।\s*/g, '।\n')
        .replace(/\n+/g, '\n')
        .trim();
      return `${formatted} ॥ ${item.n} ॥`;
    })
    .join('\n\n');
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
  const path = file.split('/').map((part) => encodeURIComponent(part)).join('/');
  return `https://archive.org/download/${id}/${path}`;
}

const SAPT = 'DeviMahatmyamRecitation';

function saptPart(
  order: string,
  title: string,
  file: string,
  blurb: string,
  lyricsText: string
): DevotionalTrack {
  return {
    id: `saptashati-${order}`,
    title,
    category: 'saptashati',
    deity: 'भगवती दुर्गा',
    duration: 'वैदिक पाठ',
    audioUrl: chant(SAPT, file),
    licenseNote: 'Public Domain Traditional Sanskrit Chanting (Archive.org) + In-App Vedic Voice',
    lyricsText,
    meaningText: blurb,
    description: 'संपूर्ण श्री दुर्गा सप्तशती — मूल संस्कृत श्लोक एवं क्रमिक पाठ।',
  };
}

const SAPTASHATI_PATH: DevotionalTrack[] = [
  saptPart(
    '01',
    '१. श्री देवी कवचम् (सम्पूर्ण)',
    'Devi Mahatmyam Recitation/01 Devi Kavacham.mp3',
    'पाठ का आरंभ। देवी कवच शरीर और दसों दिशाओं की रक्षा के लिए।',
    getAngaMultiLineText('kavach')
  ),
  saptPart(
    '02',
    '२. श्री अर्गला स्तोत्रम् (सम्पूर्ण)',
    'Devi Mahatmyam Recitation/02 Argala Stotram.mp3',
    'कवच के बाद अर्गला। रूपं देहि जयं देहि यशो देहि द्विषो जहि।',
    getAngaMultiLineText('argala')
  ),
  saptPart(
    '03',
    '३. श्री कीलक स्तोत्रम् (सम्पूर्ण)',
    'Devi Mahatmyam Recitation/03 Keelakam.mp3',
    'अर्गला के बाद कीलक। सप्तशती मंत्रों के उत्कीलन व सिद्धि का स्तोत्र।',
    getAngaMultiLineText('keelak')
  ),
  saptPart(
    '04',
    '४. प्रथम अध्याय (मधु-कैटभ वध)',
    'Devi Mahatmyam Recitation/05 Chapter 1 Pradamodhyayha.mp3',
    'प्रथम चरित्र — महाकाली, योगनिद्रा स्तुति एवं मधु-कैटभ प्रसंग।',
    getChapterMultiLineText(1)
  ),
  saptPart(
    '05',
    '५. द्वितीय अध्याय (महिषासुर सैन्य वध)',
    'Devi Mahatmyam Recitation/06 Chapter 2 Divitiyodhyayaha.mp3',
    'मध्यम चरित्र आरंभ — समस्त देवताओं के तेज से भगवती महालक्ष्मी का प्राकट्य।',
    getChapterMultiLineText(2)
  ),
  saptPart(
    '06',
    '६. तृतीय अध्याय (महिषासुर वध)',
    'Devi Mahatmyam Recitation/07 Chapter 3 Tritiyodhyayaha.mp3',
    'सेनापति चिक्षुर, चामर तथा महिषासुर का भगवती द्वारा संहार।',
    getChapterMultiLineText(3)
  ),
  saptPart(
    '07',
    '७. चतुर्थ अध्याय (शक्रादि स्तुति)',
    'Devi Mahatmyam Recitation/08 Chapter 4 Chaturthodhayayaha.mp3',
    'इन्द्रादि देवताओं द्वारा भगवती जगदम्बा की परम पावन स्तुति।',
    getChapterMultiLineText(4)
  ),
  saptPart(
    '08',
    '८. पञ्चम अध्याय (देवी-दूत संवाद)',
    'Devi Mahatmyam Recitation/09 Chapter 5 Panchamodhyayaha.mp3',
    'उत्तम चरित्र — या देवी सर्वभूतेषु स्तुति एवं दूत संवाद।',
    getChapterMultiLineText(5)
  ),
  saptPart(
    '09',
    '९. षष्ठ अध्याय (धूम्रलोचन वध)',
    'Devi Mahatmyam Recitation/10 Chapter 6 Shashtodhyayaha.mp3',
    'भगवती द्वारा हुंकार मात्र से धूम्रलोचन दैत्य का भस्म होना।',
    getChapterMultiLineText(6)
  ),
  saptPart(
    '10',
    '१०. सप्तम अध्याय (चण्ड-मुण्ड वध)',
    'Devi Mahatmyam Recitation/11 Chapter 7 Saptamodhyayaha.mp3',
    'भगवती काली का प्राकट्य एवं चण्ड-मुण्ड का संहार कर चामुण्डा नाम पाना।',
    getChapterMultiLineText(7)
  ),
  saptPart(
    '11',
    '११. अष्टम अध्याय (रक्तबीज वध)',
    'Devi Mahatmyam Recitation/12 Chapter 8 Ashtamodhyayaha.mp3',
    'सप्तमातृका शक्तियों का प्राकट्य एवं चामुण्डा द्वारा रक्तबीज का संहार।',
    getChapterMultiLineText(8)
  ),
  saptPart(
    '12',
    '१२. नवम अध्याय (निशुम्भ वध)',
    'Devi Mahatmyam Recitation/13 Chapter 9 Navamodhyayaha.mp3',
    'भगवती चण्डिका द्वारा महापराक्रमी निशुम्भ का वध।',
    getChapterMultiLineText(9)
  ),
  saptPart(
    '13',
    '१३. दशम अध्याय (शुम्भ वध)',
    'Devi Mahatmyam Recitation/14 Chapter 10 Dasamodhyayaha.mp3',
    'एकैवाहं जगत्यत्र द्वितीया का ममापरा — शुम्भ दैत्य का वध।',
    getChapterMultiLineText(10)
  ),
  saptPart(
    '14',
    '१४. एकादश अध्याय (नारायणी स्तुति)',
    'Devi Mahatmyam Recitation/15 Chapter 11 Ekadhasadhyayaha.mp3',
    'सर्वमङ्गलमाङ्गल्ये शिवे सर्वार्थसाधिके — देवताओं द्वारा नारायणी स्तुति।',
    getChapterMultiLineText(11)
  ),
  saptPart(
    '15',
    '१५. द्वादश अध्याय (फलश्रुति)',
    'Devi Mahatmyam Recitation/16 Chapter 12 Dwadhasodhyayaha.mp3',
    'दुर्गा सप्तशती पाठ की महिमा एवं भगवती का अभय वरदान।',
    getChapterMultiLineText(12)
  ),
  saptPart(
    '16',
    '१६. त्रयोदश अध्याय (सुरथ-वैश्य वरदान)',
    'Devi Mahatmyam Recitation/17 Chapter 13 Triodasadhyayaha.mp3',
    'राजा सुरथ को मन्वन्तराधिप एवं समाधि वैश्य को मोक्ष-ज्ञान की प्राप्ति।',
    getChapterMultiLineText(13)
  ),
  {
    id: 'saptashati-kunjika',
    title: '१७. श्री सिद्ध कुञ्जिका स्तोत्रम् (सम्पूर्ण)',
    category: 'saptashati',
    deity: 'भगवती दुर्गा',
    duration: '०५:१५',
    audioUrl: chant('siddha-kunjika-stotram', 'Siddha Kunjika Stotram.mp3'),
    licenseNote: 'Public Domain Traditional Sanskrit Recitation + In-App Vedic Voice',
    lyricsText: getAngaMultiLineText('kunjika'),
    meaningText: 'रुद्रयामल तंत्रोक्त सिद्ध कुंजिका स्तोत्र — सप्तशती पाठ की पूर्णाहुति।',
    description: 'कवच से कुंजिका तक संपूर्ण सप्तशती पाठ का अंतिम सिद्ध स्तोत्र।',
  },
];

const FULL_HANUMAN_CHALISA_TEXT = HANUMAN_CHALISA.map(
  (v) => `${v.kind} ${v.n}:\n${v.text}`
).join('\n\n');

export const DEVOTIONAL_AUDIO_TRACKS: DevotionalTrack[] = [
  {
    id: 'shiv-mahimna',
    title: 'श्री शिव महिम्न स्तोत्रम् (श्लोक १-१०)',
    category: 'stotra',
    deity: 'भगवान शिव',
    duration: '08:45',
    audioUrl: chant('ShivaStotrasAndMantras', '07Shiva Mahimna Stotram.mp3'),
    licenseNote: 'Public Domain Traditional Stotra Recitation + In-App Vedic Voice',
    lyricsText: SHIV_MAHIMNA_STOTRAM_TEXT,
    meaningText:
      'गंधर्वराज पुष्पदन्त विरचित श्री शिव महिम्न स्तोत्रम् — भगवान शिव के अतुलनीय प्रभाव एवं महिमा की स्तुति।',
    description: 'गंभीर सुरीली वैदिक ध्वनि में श्री शिव महिम्न स्तोत्र।',
  },
  {
    id: 'hanuman-chalisa-audio',
    title: 'श्री हनुमान चालीसा (संपूर्ण ४० चौपाई व दोहा)',
    category: 'bhajan',
    deity: 'श्री हनुमान जी',
    duration: '09:30',
    audioUrl: chant('ShivaStotrasAndMantras', '24Shiva Panchakshar Stotram.mp3'),
    licenseNote: '100% Copyright-Safe In-App Vedic Reciter & Traditional Chanting',
    lyricsText: FULL_HANUMAN_CHALISA_TEXT,
    meaningText:
      'गोस्वामी तुलसीदास कृत श्री हनुमान चालीसा — बल, बुद्धि, विद्या एवं आरोग्य प्रदाता संकटमोचन पाठ।',
    description: 'संपूर्ण दोहा और ४० चौपाई — स्पष्ट बहु-पंक्ति (Multi-line) पठन।',
  },
  ...SAPTASHATI_PATH,
  {
    id: 'gayatri-mantra-21',
    title: 'श्री गायत्री महामंत्र (दिव्य वैदिक जाप)',
    category: 'mantra',
    deity: 'वेदमाता गायत्री',
    duration: '11:20',
    audioUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/23/Gayatri_Mantra.ogg',
    licenseNote: 'Wikimedia Commons Public Domain / CC-BY-SA',
    lyricsText: `ॐ भूर्भुवः स्वः।
तत्सवितुर्वरेण्यं
भर्गो देवस्य धीमहि।
धियो यो नः प्रचोदयात्॥ १ ॥

ॐ भूर्भुवः स्वः।
तत्सवितुर्वरेण्यं
भर्गो देवस्य धीमहि।
धियो यो नः प्रचोदयात्॥ २ ॥

ॐ भूर्भुवः स्वः।
तत्सवितुर्वरेण्यं
भर्गो देवस्य धीमहि।
धियो यो नः प्रचोदयात्॥ ३ ॥`,
    meaningText:
      'सृष्टि के प्रकाशक परमात्मा हमारे अंतःकरण को सद्बुद्धि व सन्मार्ग से प्रकाशित करें।',
    description: 'बुद्धि, एकाग्रता एवं आध्यात्मिक शांति हेतु दिव्य गायत्री जाप।',
  },
  {
    id: 'mahamrityunjaya-mantra',
    title: 'श्री महामृत्युंजय मंत्र (त्र्यम्बकं यजामहे)',
    category: 'mantra',
    deity: 'भगवान त्र्यम्बक शिव',
    duration: '15:00',
    audioUrl: chant('ShivaStotrasAndMantras', '80Maha Mrityunjay Mantra.mp3'),
    licenseNote: 'Public Domain Traditional Vedic Chant + In-App Vedic Voice',
    lyricsText: `ॐ त्र्यम्बकं यजामहे
सुगन्धिं पुष्टिवर्धनम्।
उर्वारुकमिव बन्धनान्
मृत्योर्मुक्षीय माऽमृतात्॥ १ ॥

ॐ हौं जूं सः ॐ भूर्भुवः स्वः
ॐ त्र्यम्बकं यजामहे
सुगन्धिं पुष्टिवर्धनम्।
उर्वारुकमिव बन्धनान्
मृत्योर्मुक्षीय मामृतात्
ॐ स्वः भुवः भूः ॐ सः जूं हौं ॐ॥ २ ॥`,
    meaningText:
      'हम त्रिनेत्रधारी सुगन्धित एवं पुष्टि को बढ़ाने वाले भगवान शिव की उपासना करते हैं। जिस प्रकार पका हुआ खरबूजा बेल से मुक्त होता है, उसी प्रकार हम मृत्यु से मुक्त होकर अमृतत्व प्राप्त करें।',
    description: 'स्वास्थ्य सुरक्षा एवं दीर्घायु हेतु महामृत्युंजय जाप।',
  },
  {
    id: 'shiva-tandav',
    title: 'श्री शिव ताण्डव स्तोत्रम् (रावण कृत)',
    category: 'stotra',
    deity: 'भगवान शिव',
    duration: '07:20',
    audioUrl: chant('ShivaStotrasAndMantras', '36Shiva Tandav Stotram.mp3'),
    licenseNote: 'Public Domain Traditional Stotra Recitation',
    lyricsText: `जटाटवीगलज्जलप्रवाहपावितस्थले
गलेऽवलम्ब्य लम्बितां भुजङ्गतुङ्गमालिकाम्।
डमड्डमड्डमड्डमन्निनादवड्डमर्वयं
चकार चण्डताण्डवं तनोतु नः शिवः शिवम् ॥ १ ॥

जटाकटाहसम्भ्रमभ्रमन्निलिम्पनिर्झरी-
विलोलवीचिवल्लरीविराजमानमूर्धनि।
धगद्धगद्धगज्ज्वलल्ललाटपट्टपावके
किशोरचन्द्रशेखरे रतिः प्रतिक्षणं मम ॥ २ ॥

धराधरेन्द्रनंदिनीविलासबन्धुबन्धुर-
स्फुरद्दिगन्तसन्ततिप्रमोदमानमानसे।
कृपाकटाक्षधोरणीनिरुद्धदुर्धरापदि
क्वचिद्दिगम्बरे मनो विनोदमेतु वस्तुनि ॥ ३ ॥

जटाभुजङ्गपिङ्गलस्फुरत्फणामणिप्रभा-
कदम्बकुङ्कुमद्रवप्रलिप्तदिग्वधूमुखे।
मदान्धसिन्धुरस्फुरत्त्वगुत्तरीयमेदुरे
मनो विनोदमद्भुतं बिभर्तु भूतभर्तरि ॥ ४ ॥

सहस्रलोचनप्रभृत्यशेषलेखशेखर-
प्रसूनधूलिधोरणीविधूसराङ्घ्रिपीठभूः।
भुजङ्गराजमालया निबद्धजाटजूटकः
श्रियै चिराय जायतां चकोरबन्धुशेखरः ॥ ५ ॥`,
    meaningText: 'दशानन रावण विरचित परम ओजस्वी श्री शिव ताण्डव स्तोत्रम्।',
    description: 'भगवान आशुतोष शिव की नृत्यमयी महिमा का सम्पूर्ण पाठ।',
  },
  {
    id: 'shiva-panchakshar',
    title: 'श्री शिव पञ्चाक्षर स्तोत्रम् (नागेन्द्रहाराय)',
    category: 'stotra',
    deity: 'भगवान शिव',
    duration: '04:50',
    audioUrl: chant('ShivaStotrasAndMantras', '24Shiva Panchakshar Stotram.mp3'),
    licenseNote: 'Public Domain Traditional Stotra Recitation',
    lyricsText: `नागेन्द्रहाराय त्रिलोचनाय
भस्माङ्गरागाय महेश्वराय।
नित्याय शुद्धाय दिगम्बराय
तस्मै नकाराय नमः शिवाय ॥ १ ॥

मन्दाकिनीसलिलचन्दनचर्चिताय
नन्दीश्वरप्रमथनाथमहेश्वराय।
मन्दारपुष्पबहुपुष्पसुपूजिताय
तस्मै मकाराय नमः शिवाय ॥ २ ॥

शिवाय गौरीवदनाब्जवृन्द-
सूर्याय दक्षाध्वरनाशकाय।
श्रीनीलकण्ठाय वृषध्वजाय
तस्मै शिकाराय नमः शिवाय ॥ ३ ॥

वशिष्ठकुम्भोद्भवगौतमार्य-
मुनीन्द्रदेवार्चितशेखराय।
चन्द्रार्कवैश्वानरलोचनाय
तस्मै वकाराय नमः शिवाय ॥ ४ ॥

यज्ञस्वरूपाय जटाधराय
पिनाकहस्ताय सनातनाय।
दिव्याय देवाय दिगम्बराय
तस्मै यकाराय नमः शिवाय ॥ ५ ॥

पञ्चाक्षरमिदं पुण्यं यः पठेच्छिवसन्निधौ।
शिवलोकमवाप्नोति शिवेन सह मोदते ॥ ६ ॥`,
    meaningText: 'आदिगुरु शंकराचार्य विरचित पंचाक्षर (न-म-शि-वा-य) स्तोत्र।',
    description: 'पंचाक्षर स्तोत्र के संपूर्ण ६ श्लोक — स्पष्ट बहु-पंक्ति प्रारूप।',
  },
  {
    id: 'shiva-kavach',
    title: 'श्री शिव कवचम् (अमोघ रक्षा कवच)',
    category: 'stotra',
    deity: 'भगवान शिव',
    duration: '06:30',
    audioUrl: chant('ShivaStotrasAndMantras', '08Shiva Kavacham.mp3'),
    licenseNote: 'Public Domain Traditional Stotra Recitation',
    lyricsText: `अस्य श्रीशिवकवचस्तोत्रमहामन्त्रस्य
ऋषभयोगीश्वर ऋषिः, अनुष्टुप् छन्दः,
श्रीसाम्बसदाशिवो देवता,
मम सकलपापक्षयार्थे शिवकवचपाठे विनियोगः ॥ १ ॥

ॐ नमो भगवते सदाशिवाय
सकलतत्त्वात्मकाय सर्वमन्त्रस्वरूपाय।
सर्वयन्त्राधिष्ठिताय सर्वतन्त्रस्वरूपाय
सर्वतत्त्वविदूराय ब्रह्मरुद्रावतारिणे ॥ २ ॥

नीलकण्ठाय पार्वतीमनोहरप्रियाय
सोमसूर्याग्निलोचनाय भस्मोद्धूलितविग्रहाय।
महामणिमुकुटधारणाय माणिक्यभूषणाय
सृष्टिस्थितिप्रलयकालरौद्रावताराय ॥ ३ ॥

संसारसृष्टighटनापरिवर्तनाय
रक्षःपिशाचगणसिद्धसमाकुलाय।
सिद्धोरगग्रहगणेन्द्रनिषेविताय
शार्दूलचर्मवसनाय नमः शिवाय ॥ ४ ॥`,
    meaningText: 'स्कन्द पुराणोक्त परम अमोघ श्री शिव रक्षा कवचम्।',
    description: 'समस्त भय व रोग निवारण हेतु श्री शिव कवच का पाठ।',
  },
  {
    id: 'ganesh-aarti',
    title: 'जय गणेश जय गणेश देवा (श्री गणेश आरती)',
    category: 'aarti',
    deity: 'भगवान श्री गणेश',
    duration: '04:30',
    audioUrl: chant('ShivaStotrasAndMantras', '01Ganesh Vandana.mp3'),
    licenseNote: '100% Copyright-Safe Traditional Vandana & In-App Vedic Reciter',
    lyricsText: `जय गणेश जय गणेश जय गणेश देवा।
माता जाकी पारवती पिता महादेवा॥ १ ॥

एक दन्त दयावन्त चार भुजाधारी।
माथे सिन्दूर सोहे मूसे की सवारी॥ २ ॥

पान चढ़े फूल चढ़े और चढ़े मेवा।
लड्डुअन का भोग लगे सन्त करें सेवा॥ ३ ॥

अंधन को आँख देत कोढ़िन को काया।
बांझन को पुत्र देत निर्धन को माया॥ ४ ॥

हार चढ़े फूल चढ़े और चढ़े मेवा।
सूरश्याम शरण आए सफल कीजे सेवा॥ ५ ॥`,
    meaningText: 'विघ्नहर्ता श्री गणेश जी की सर्व-मंगलकारिणी नित्य आरती।',
    description: 'सुरीले पारंपरिक सुरों एवं घंटी की ध्वनि में गणेश आरती।',
  },
  {
    id: 'laxmi-aarti',
    title: 'ॐ जय लक्ष्मी माता (श्री महालक्ष्मी आरती)',
    category: 'aarti',
    deity: 'भगवती महालक्ष्मी',
    duration: '05:10',
    audioUrl: chant('DeviMahatmyamRecitation', 'Devi Mahatmyam Recitation/02 Argala Stotram.mp3'),
    licenseNote: '100% Copyright-Safe Traditional Chanting & In-App Vedic Reciter',
    lyricsText: `ॐ जय लक्ष्मी माता, मैया जय लक्ष्मी माता।
तुमको निसदिन सेवत, हर विष्णु विधाता॥ १ ॥

उमा रमा ब्रह्माणी, तुम ही जग-माता।
सूर्य चन्द्रमा ध्यावत, नारद ऋषि गाता॥ २ ॥

दुर्गा रूप निरंजनी, सुख सम्पति दाता।
जो कोई तुमको ध्यावत, ऋद्धि सिद्धि पाता॥ ३ ॥

तुम पाताल निवासिनी, तुम ही शुभदाता।
कर्म-प्रभाव-प्रकाशिनी, भवनिधि की त्राता॥ ४ ॥

जिस घर में तुम रहतीं, सब सद्गुण आता।
सब सम्भव हो जाता, मन नहीं घबराता॥ ५ ॥`,
    meaningText: 'सुख-समृद्धि, वैभव एवं ऐश्वर्य प्रदायिनी श्री महालक्ष्मी आरती।',
    description: 'संध्याकालीन सात्विक आरती एवं धन-धान्य समृद्धि पाठ।',
  },
  {
    id: 'ram-stuti',
    title: 'श्री रामचन्द्र कृपालु भजु मन (श्री राम स्तुति)',
    category: 'stotra',
    deity: 'भगवान श्री राम',
    duration: '06:15',
    audioUrl: chant('ShivaStotrasAndMantras', '07Shiva Mahimna Stotram.mp3'),
    licenseNote: '100% Copyright-Safe Traditional Reciter Mode',
    lyricsText: `श्रीरामचन्द्र कृपालु भजु मन
हरण भवभय दारुणम्।
नवकंज लोचन, कंज मुख,
कर कंज, पद कंजारुणम्॥ १ ॥

कन्दर्प अगणित अमित छवि,
नवनील नीरद सुन्दरम्।
पट पीत मानहुँ तड़ित रुचि शुचि
नौमि जनक सुतावरम्॥ २ ॥

भजु दीनबन्धु दिनेश दानव
दैत्य वंश निकन्दनम्।
रघुनन्द आनन्द कन्द कोशल
चन्द दशरथ नन्दनम्॥ ३ ॥

सिर मुकुट कुण्डल तिलक चारु
उदारु अङ्ग विभूषणम्।
आजानु भुज शर चाप धर
संग्राम जित खरदूषणम्॥ ४ ॥

इति वदति तुलसीदास शंकर
शेष मुनि मन रंजनम्।
मम हृदय कंज निवास कुरु
कामादि खल दल गंजनम्॥ ५ ॥`,
    meaningText: 'गोस्वामी तुलसीदास कृत भगवान श्री राम की करुणामयी पावन स्तुति।',
    description: 'भय-शोक नाशक एवं मनःशांति प्रदायक मधुर राम स्तुति।',
  },
  {
    id: 'om-namah-shivaya',
    title: 'ॐ नमः शिवाय (पंचाक्षर महामंत्र जाप)',
    category: 'mantra',
    deity: 'भगवान शिव',
    duration: '05:00',
    audioUrl: chant('ShivaStotrasAndMantras', '24Shiva Panchakshar Stotram.mp3'),
    licenseNote: 'Public Domain Traditional Shiva Chanting',
    lyricsText: `ॐ नमः शिवाय।
शिव ॐ नमः शिवाय॥ १ ॥

कर्पूरगौरं करुणावतारं
संसारसारं भुजगेन्द्रहारम्।
सदावसन्तं हृदयारविन्दे
भवं भवानीसहितं नमामि॥ २ ॥

त्वमेव माता च पिता त्वमेव
त्वमेव बन्धुश्च सखा त्वमेव।
त्वमेव विद्या द्रविणं त्वमेव
त्वमेव सर्वं मम देव देव॥ ३ ॥`,
    meaningText: 'शिव पंचाक्षर महामंत्र एवं कर्पूरगौरं स्तुति।',
    description: 'मन की एकाग्रता और शिव कृपा के लिए पावन पंचाक्षर जाप।',
  },
];
