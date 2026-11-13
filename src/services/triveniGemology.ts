/**
 * त्रिवेणी रत्न शोधन सेवा (Triveni Gemology Service)
 * 
 * 100% Authentic Shastric Tri-Fold Gemstone Determination:
 * 1. Janma Kundali (Lagna Lord, Trikona 1-5-9, Yogakaraka, Maraka/Trik Elimination)
 * 2. Ank Jyotish (Mulank, Bhagyank, Deva/Danava Gana Alignment)
 * 3. Gotra & Rishi Kula (Element, Preferred Metal, Sankalpa Mantra)
 */

import { KundaliData, PlanetPosition } from '../types';
import { trPlanet, trRashi, trVedic, trWeekday } from '../i18n/vedicTranslate';

export interface GotraProfile {
  id: string;
  name: string;
  nameEn: string;
  rishi: string;
  element: string; // अग्नि, पृथ्वी, वायु, जल, आकाश
  elementEn: string;
  favoredMetals: string[];
  deity: string;
  description: string;
}

export const GOTRA_LIST: GotraProfile[] = [
  {
    id: 'kashyapa',
    name: 'कश्यप (Kashyapa)',
    nameEn: 'Kashyapa',
    rishi: 'महर्षि कश्यप (आदित्य-पिता)',
    element: 'अग्नि / तेजस (Fire/Solar)',
    elementEn: 'Fire / Solar',
    favoredMetals: ['स्वर्ण (Gold)', 'तांबा (Copper)'],
    deity: 'भगवान सूर्यनारायण एवं श्री हरि विष्णु',
    description: 'कश्यप गोत्र सूर्य और अग्नि तत्व प्रधान है। इसमें स्वर्ण और तांबे में जड़े रत्न विशेष रूप से ऊर्जावान फल देते हैं। (अज्ञात गोत्र में भी कश्यप गोत्र मान्य है)।',
  },
  {
    id: 'bharadwaja',
    name: 'भारद्वाज (Bharadwaja)',
    nameEn: 'Bharadwaja',
    rishi: 'महर्षि भारद्वाज (ज्ञान व आयुर्वेद मर्मज्ञ)',
    element: 'पृथ्वी / बृहस्पति (Earth/Jupiter)',
    elementEn: 'Earth / Jupiter',
    favoredMetals: ['स्वर्ण (Gold)', 'पीतल (Brass)', 'पंचधातु (Panchadhatu)'],
    deity: 'देवगुरु बृहस्पति एवं मां दुर्गा',
    description: 'भारद्वाज गोत्र ज्ञान, विद्या व स्थायित्व का प्रतीक है। स्वर्ण व पंचधातु में रत्न धारण करना कल्याणकारी माना गया है।',
  },
  {
    id: 'vashistha',
    name: 'वशिष्ठ (Vashistha)',
    nameEn: 'Vashistha',
    rishi: 'ब्रह्मर्षि वशिष्ठ (सूर्यवंश के कुलगुरु)',
    element: 'वायु व आकाश (Air & Ether)',
    elementEn: 'Air & Ether',
    favoredMetals: ['स्वर्ण (Gold)', 'पंचधातु (Panchadhatu)'],
    deity: 'भगवान शिव एवं मर्यादा पुरुषोत्तम श्री राम',
    description: 'वशिष्ठ गोत्र ब्रह्मतेज व सात्विक संतुलन का द्योतक है। रत्न की प्राण-प्रतिष्ठा में शिव-राम संकल्प श्रेष्ठ माना जाता है।',
  },
  {
    id: 'shandilya',
    name: 'शांडिल्य (Shandilya)',
    nameEn: 'Shandilya',
    rishi: 'महर्षि शांडिल्य (भक्ति सूत्र प्रणेता)',
    element: 'जल व सोम (Water/Lunar)',
    elementEn: 'Water / Lunar',
    favoredMetals: ['शुद्ध चांदी (Silver)', 'सफेद स्वर्ण (White Gold)'],
    deity: 'भगवती महालक्ष्मी व भगवान श्री कृष्ण',
    description: 'शांडिल्य गोत्र भक्ति, शीतलता और सौम्यता से युक्त है। चांदी या श्वेत धातु में रत्न विशेष फलदायी सिद्ध होते हैं।',
  },
  {
    id: 'gautama',
    name: 'गौतम (Gautama)',
    nameEn: 'Gautama',
    rishi: 'महर्षि गौतम (न्याय व धर्म ज्ञाता)',
    element: 'पृथ्वी (Earth)',
    elementEn: 'Earth',
    favoredMetals: ['स्वर्ण (Gold)', 'चांदी (Silver)'],
    deity: 'मां गायत्री एवं भगवान शिव',
    description: 'गौतम गोत्र न्याय, तप और धर्मानुष्ठान का प्रतीक है। स्वर्ण व रजत दोनों धातुएं इनके लिए पूर्ण अनुकूल हैं।',
  },
  {
    id: 'parashara',
    name: 'पराशर (Parashara)',
    nameEn: 'Parashara',
    rishi: 'महर्षि पराशर (बृहत्पाराशर होराशास्त्र प्रवर्तक)',
    element: 'अग्नि व तेजस (Cosmic Fire)',
    elementEn: 'Cosmic Fire',
    favoredMetals: ['स्वर्ण (Gold)', 'अष्टधातु (Ashtadhatu)'],
    deity: 'महाविष्णु एवं महर्षि वेदव्यास',
    description: 'ज्योतिष के आदि प्रवर्तक महर्षि पराशर का गोत्र काल-विधान में अति पावन है। स्वर्ण और अष्टधातु अंगूठी अत्यंत शुभ होती है।',
  },
  {
    id: 'garga',
    name: 'गर्ग (Garga)',
    nameEn: 'Garga',
    rishi: 'महर्षि गर्ग (खगोल व गर्ग संहिता रचयिता)',
    element: 'जल व आकाश (Water/Ether)',
    elementEn: 'Water / Ether',
    favoredMetals: ['चांदी (Silver)', 'स्वर्ण (Gold)'],
    deity: 'श्री कृष्ण एवं राधा रानी',
    description: 'गर्ग गोत्र नक्षत्र-विद्या व प्रज्ञा का आश्रय है। चांदी या स्वर्ण में रत्न जड़वाने से मानसिक शांति व निर्णय क्षमता बढ़ती है।',
  },
  {
    id: 'vatsa',
    name: 'वत्स / जमदग्नि (Vatsa / Jamadagni)',
    nameEn: 'Vatsa / Jamadagni',
    rishi: 'महर्षि भृगु, च्यवन व जमदग्नि',
    element: 'अग्नि व पृथ्वी (Fire/Earth)',
    elementEn: 'Fire / Earth',
    favoredMetals: ['स्वर्ण (Gold)', 'तांबा (Copper)'],
    deity: 'भगवान परशुराम एवं शिव',
    description: 'वत्स गोत्र पराक्रम, शौर्य और तप का प्रतीक है। तांबा और स्वर्ण में मूंगा, माणिक्य व पुखराज अत्यधिक फलते हैं।',
  },
  {
    id: 'kaushika',
    name: 'कौशिक / विश्वामित्र (Kaushika)',
    nameEn: 'Kaushika',
    rishi: 'राजर्षि विश्वामित्र (गायत्री मंत्र द्रष्टा)',
    element: 'प्रचंड अग्नि (Radiant Fire)',
    elementEn: 'Radiant Fire',
    favoredMetals: ['तांबा (Copper)', 'स्वर्ण (Gold)'],
    deity: 'मां वेदमाता गायत्री एवं सूर्यदेव',
    description: 'कौशिक गोत्र संकल्प शक्ति और तेजस्विता प्रदान करता है। तांबा और स्वर्ण में रत्न पहनना अत्यंत शुभ है।',
  },
  {
    id: 'angirasa',
    name: 'अंगिरा (Angirasa)',
    nameEn: 'Angirasa',
    rishi: 'महर्षि अंगिरा (अग्नि-पुत्र)',
    element: 'अग्नि (Fire)',
    elementEn: 'Fire',
    favoredMetals: ['स्वर्ण (Gold)', 'पीतल (Brass)'],
    deity: 'देवगुरु बृहस्पति एवं अग्निदेव',
    description: 'अंगिरा गोत्र गुरु तत्व व ज्ञान का मूल है। स्वर्ण धातु में पीला पुखराज या माणिक्य विशेष लाभ देता है।',
  },
  {
    id: 'bhrigu',
    name: 'भृगु (Bhrigu)',
    nameEn: 'Bhrigu',
    rishi: 'महर्षि भृगु (भृगु संहिता प्रणेता)',
    element: 'जल व शुक्र (Water/Venus)',
    elementEn: 'Water / Venus',
    favoredMetals: ['चांदी (Silver)', 'सफेद स्वर्ण (White Gold)'],
    deity: 'भगवती महालक्ष्मी व शुक्राचार्य',
    description: 'भृगु गोत्र ऐश्वर्य, सौंदर्य और लक्ष्मी कृपा का प्रतीक है। चांदी में ओपल, हीरा या पन्ना अत्यंत अनुकूल रहता है।',
  },
  {
    id: 'atri',
    name: 'अत्रि (Atri)',
    nameEn: 'Atri',
    rishi: 'महर्षि अत्रि एवं माता अनसूया',
    element: 'सोम व जल (Lunar/Water)',
    elementEn: 'Lunar / Water',
    favoredMetals: ['चांदी (Silver)', 'पंचधातु (Panchadhatu)'],
    deity: 'भगवान दत्तात्रेय एवं चंद्रदेव',
    description: 'अत्रि गोत्र एकाग्रता, पारिवारिक सुख और मानसिक शांति प्रदान करता है। चांदी में मोती या पन्ना विशेष शुभ है।',
  },
  {
    id: 'pulastya',
    name: 'पुलस्त्य (Pulastya)',
    nameEn: 'Pulastya',
    rishi: 'ब्रह्मर्षि पुलस्त्य (सप्तर्षि एवं पुराण-संहिता प्रवक्ता)',
    element: 'आकाश व तेजस (Ether & Cosmic Radiance)',
    elementEn: 'Ether & Cosmic Radiance',
    favoredMetals: ['स्वर्ण (Gold)', 'पंचधातु (Panchadhatu)', 'तांबा (Copper)'],
    deity: 'भगवान शिव एवं श्री हरि विष्णु',
    description: 'पुलस्त्य गोत्र ब्रह्मा जी के मानस पुत्र महर्षि पुलस्त्य से उद्भूत है, जो पुराण-प्रवक्ता व महान तपस्वी थे। स्वर्ण व पंचधातु में रत्न धारण करना विशेष फलप्रद और सुरक्षादायक होता है।',
  },
  {
    id: 'agastya',
    name: 'अगस्त्य (Agastya)',
    nameEn: 'Agastya',
    rishi: 'महर्षि अगस्त्य (आदित्यहृदय स्तोत्र प्रणेता)',
    element: 'अग्नि व समुद्र-तेज (Fire & Oceanic Energy)',
    elementEn: 'Fire & Oceanic Energy',
    favoredMetals: ['तांबा (Copper)', 'स्वर्ण (Gold)', 'पंचधातु (Panchadhatu)'],
    deity: 'भगवान सूर्यनारायण एवं कार्तिकेय',
    description: 'अगस्त्य गोत्र अदम्य इच्छाशक्ति, आध्यात्मिक विजय और तेजस्विता का प्रतीक है। तांबा व स्वर्ण में माणिक्य या मूंगा धारण करना अति शुभ है।',
  },
  {
    id: 'vishvamitra',
    name: 'विश्वामित्र (Vishvamitra)',
    nameEn: 'Vishvamitra',
    rishi: 'महर्षि विश्वामित्र (गायत्री मंत्र द्रष्टा)',
    element: 'प्रचंड तेजस (Radiant Fire)',
    elementEn: 'Radiant Fire',
    favoredMetals: ['स्वर्ण (Gold)', 'तांबा (Copper)'],
    deity: 'वेदमाता गायत्री एवं भगवान राम',
    description: 'विश्वामित्र गोत्र तपस्या और सिद्धि का पर्याय है। गायत्री संकल्प पूर्वक स्वर्ण अथवा तांबे में रत्न धारण श्रेष्ठ फल देता है।',
  },
  {
    id: 'jamadagni',
    name: 'जमदग्नि (Jamadagni)',
    nameEn: 'Jamadagni',
    rishi: 'महर्षि जमदग्नि (भृगुवंश शिरोमणि)',
    element: 'अग्नि व पृथ्वी (Fire & Earth)',
    elementEn: 'Fire & Earth',
    favoredMetals: ['स्वर्ण (Gold)', 'पंचधातु (Panchadhatu)'],
    deity: 'भगवान परशुराम एवं शिव',
    description: 'जमदग्नि गोत्र शौर्य, सत्य और दृढ़ संकल्प का परिचायक है। पंचधातु व स्वर्ण में रत्न धारण रक्षा कवच समान फल देता है।',
  },
  {
    id: 'harita',
    name: 'हारीत (Harita)',
    nameEn: 'Harita',
    rishi: 'महर्षि हारीत (धर्मशास्त्रकार)',
    element: 'वायु व पृथ्वी (Air & Earth)',
    elementEn: 'Air & Earth',
    favoredMetals: ['स्वर्ण (Gold)', 'चांदी (Silver)'],
    deity: 'भगवान सूर्य एवं महाविष्णु',
    description: 'हारीत गोत्र धर्म, न्याय और विद्या का प्रतीक है। स्वर्ण और रजत दोनों धातुएं इनके लिए अत्यंत शुभ हैं।',
  },
  {
    id: 'mudgala',
    name: 'मुद्गल (Mudgala)',
    nameEn: 'Mudgala',
    rishi: 'महर्षि मुद्गल (मुद्गल उपनिषद प्रणेता)',
    element: 'जल व आकाश (Water & Ether)',
    elementEn: 'Water & Ether',
    favoredMetals: ['चांदी (Silver)', 'पंचधातु (Panchadhatu)'],
    deity: 'भगवान श्री गणेश एवं शिव',
    description: 'मुद्गल गोत्र गणेश भक्ति, विवेक और शांति का प्रतीक है। चांदी में पन्ना, मोती या पुखराज धारण करना शुभप्रद है।',
  },
  {
    id: 'kaundinya',
    name: 'कौण्डिन्य (Kaundinya)',
    nameEn: 'Kaundinya',
    rishi: 'महर्षि कौण्डिन्य (वैदिक श्रौत ऋषि)',
    element: 'पृथ्वी व तेजस (Earth & Light)',
    elementEn: 'Earth & Light',
    favoredMetals: ['स्वर्ण (Gold)', 'तांबा (Copper)'],
    deity: 'भगवान शिव एवं मां भगवती',
    description: 'कौण्डिन्य गोत्र स्थिरता, परिवार कल्याण और प्रतिष्ठा का प्रतीक है। स्वर्ण या अष्टधातु में रत्न शुभ फलदायी होते हैं।',
  },
  {
    id: 'dhanvantari',
    name: 'धन्वन्तरि (Dhanvantari)',
    nameEn: 'Dhanvantari',
    rishi: 'भगवान धन्वन्तरि (आयुर्वेद प्रवर्तक)',
    element: 'अमृत व जल (Nectar & Water)',
    elementEn: 'Nectar & Water',
    favoredMetals: ['स्वर्ण (Gold)', 'चांदी (Silver)', 'कांस्य/पीतल (Brass)'],
    deity: 'भगवान धन्वन्तरि एवं महाविष्णु',
    description: 'धन्वन्तरि गोत्र आरोग्य, दीर्घायु और कल्याण का प्रतीक है। स्वर्ण या चांदी में रत्न स्वास्थ्य और समृद्धि प्रदान करता है।',
  },
  {
    id: 'marichi',
    name: 'मरीचि (Marichi)',
    nameEn: 'Marichi',
    rishi: 'ब्रह्मर्षि मरीचि (आदि प्रजापति)',
    element: 'ब्रह्मतेज व प्रकाश (Cosmic Light)',
    elementEn: 'Cosmic Light',
    favoredMetals: ['स्वर्ण (Gold)', 'तांबा (Copper)'],
    deity: 'भगवान सूर्यनारायण एवं ब्रह्मा जी',
    description: 'मरीचि गोत्र सूर्य रश्मियों और ज्ञान की आदि किरण का प्रतीक है। स्वर्ण में माणिक्य व पुखराज अत्यधिक फलदायी है।',
  },
];

export interface TriveniGemstoneDetail {
  gem: string;
  gemEn: string;
  subGem: string;
  planet: string;
  planetRole: string; // लग्नेश, भाग्येश, पंचमेश, योगकारक
  weightRatti: string;
  metal: string;
  finger: string;
  day: string;
  choghadiya: string;
  beejMantra: string;
  shastricReason: string;
}

export interface ForbiddenGemDetail {
  gem: string;
  planet: string;
  role: string;
  reason: string;
}

export interface TriveniRatnaResult {
  personName: string;
  lagnaSign: string;
  lagnaLord: string;
  moonSign: string;
  nakshatra: string;
  
  // Ank Jyotish
  mulank: number;
  mulankPlanet: string;
  mulankGem: string;
  bhagyank: number;
  bhagyankPlanet: string;
  bhagyankGem: string;
  ganaClassification: string;
  
  // Gotra Details
  gotra: GotraProfile;
  
  // Synthesized Recommendations
  primaryLifeStone: TriveniGemstoneDetail;
  secondaryBhagyaStone?: TriveniGemstoneDetail;
  
  // Protective Rudraksha
  remedialRudraksha: {
    mukhi: string;
    planet: string;
    benefits: string;
  };
  
  // Forbidden Gems
  forbiddenGems: ForbiddenGemDetail[];
  
  // Authentic Vedic Sankalpa Mantra
  sankalpaMantra: string;
  
  // Executive Shastric Verdict
  verdictSummary: string;
}

const GOTRA_I18N: Record<string, {
  en: { name: string; rishi: string; element: string; favoredMetals: string[]; deity: string; description: string };
  gu: { name: string; rishi: string; element: string; favoredMetals: string[]; deity: string; description: string };
}> = {
  kashyapa: {
    en: {
      name: 'Kashyapa',
      rishi: 'Maharishi Kashyapa (Father of Adityas)',
      element: 'Fire / Solar',
      favoredMetals: ['Gold', 'Copper'],
      deity: 'Lord Suryanarayana & Sri Hari Vishnu',
      description: 'Kashyapa Gotra is governed by solar and fire elements. Gemstones set in gold and copper yield highly energized results (also valid when Gotra is unknown).',
    },
    gu: {
      name: 'કશ્યપ (Kashyapa)',
      rishi: 'મહર્ષિ કશ્યપ (આદિત્ય-પિતા)',
      element: 'અગ્નિ / તેજસ (Fire/Solar)',
      favoredMetals: ['સુવર્ણ (Gold)', 'તાંબું (Copper)'],
      deity: 'ભગવાન સૂર્યનારાયણ અને શ્રી હરિ વિષ્ણુ',
      description: 'કશ્યપ ગોત્ર સૂર્ય અને અગ્નિ તત્વ પ્રધાન છે. તેમાં સુવર્ણ અને તાંબામાં જડેલા રત્નો વિશેષ ઊર્જાવાન ફળ આપે છે (અજ્ઞાત ગોત્રમાં પણ કશ્યપ ગોત્ર માન્ય છે).',
    },
  },
  bharadwaja: {
    en: {
      name: 'Bharadwaja',
      rishi: 'Maharishi Bharadwaja (Master of Veda & Ayurveda)',
      element: 'Earth / Jupiter',
      favoredMetals: ['Gold', 'Brass', 'Panchadhatu'],
      deity: 'Brihaspati (Jupiter) & Maa Durga',
      description: 'Bharadwaja Gotra symbolizes wisdom, learning, and stability. Wearing gemstones in gold or Panchadhatu is deeply auspicious.',
    },
    gu: {
      name: 'ભારદ્વાજ (Bharadwaja)',
      rishi: 'મહર્ષિ ભારદ્વાજ (જ્ઞાન અને આયુર્વેદ મર્મજ્ઞ)',
      element: 'પૃથ્વી / બૃહસ્પતિ',
      favoredMetals: ['સુવર્ણ (Gold)', 'પિત્તળ (Brass)', 'પંચધાતુ'],
      deity: 'દેવગુરુ બૃહસ્પતિ અને મા દુર્ગા',
      description: 'ભારદ્વાજ ગોત્ર જ્ઞાન, વિદ્યા અને સ્થિરતાનું પ્રતીક છે. સુવર્ણ અને પંચધાતુમાં રત્ન ધારણ કરવું કલ્યાણકારી મનાય છે.',
    },
  },
  vashistha: {
    en: {
      name: 'Vashistha',
      rishi: 'Brahmarishi Vashistha (Preceptor of Suryavamsha)',
      element: 'Air & Ether',
      favoredMetals: ['Gold', 'Panchadhatu'],
      deity: 'Lord Shiva & Sri Rama',
      description: 'Vashistha Gotra represents Brahma-tejas and sattvic balance. Consecrating gemstones with Shiva-Rama Sankalpa is supreme.',
    },
    gu: {
      name: 'વશિષ્ઠ (Vashistha)',
      rishi: 'બ્રહ્મર્ષિ વશિષ્ઠ (સૂર્યવંશના કુલગુરુ)',
      element: 'વાયુ અને આકાશ',
      favoredMetals: ['સુવર્ણ (Gold)', 'પંચધાતુ'],
      deity: 'ભગવાન શિવ અને શ્રી રામ',
      description: 'વશિષ્ઠ ગોત્ર બ્રહ્મતેજ અને સાત્વિક સંતુલનનું દ્યોતક છે. રત્નની પ્રાણ-પ્રતિષ્ઠામાં શિવ-રામ સંકલ્પ શ્રેષ્ઠ ગણાય છે.',
    },
  },
  shandilya: {
    en: {
      name: 'Shandilya',
      rishi: 'Maharishi Shandilya (Author of Bhakti Sutras)',
      element: 'Water / Lunar',
      favoredMetals: ['Pure Silver', 'White Gold'],
      deity: 'Goddess Mahalakshmi & Sri Krishna',
      description: 'Shandilya Gotra embodies devotion, coolness, and grace. Gemstones set in silver or white gold yield fruitful results.',
    },
    gu: {
      name: 'શાંડિલ્ય (Shandilya)',
      rishi: 'મહર્ષિ શાંડિલ્ય (ભક્તિ સૂત્ર પ્રણેતા)',
      element: 'જળ અને સોમ',
      favoredMetals: ['શુદ્ધ ચાંદી (Silver)', 'સફેદ સુવર્ણ'],
      deity: 'ભગવતી મહાલક્ષ્મી અને ભગવાન શ્રી કૃષ્ણ',
      description: 'શાંડિલ્ય ગોત્ર ભક્તિ, શીતળતા અને સૌમ્યતાથી યુક્ત છે. ચાંદી કે શ્વેત ધાતુમાં રત્ન વિશેષ ફળદાયી સિદ્ધ થાય છે.',
    },
  },
  gautama: {
    en: {
      name: 'Gautama',
      rishi: 'Maharishi Gautama (Sage of Nyaya & Dharma)',
      element: 'Earth',
      favoredMetals: ['Gold', 'Silver'],
      deity: 'Maa Gayatri & Lord Shiva',
      description: 'Gautama Gotra signifies righteousness, austerity, and dharma. Both gold and silver are completely harmonious.',
    },
    gu: {
      name: 'ગૌતમ (Gautama)',
      rishi: 'મહર્ષિ ગૌતમ (ન્યાય અને ધર્મ જ્ઞાતા)',
      element: 'પૃથ્વી',
      favoredMetals: ['સુવર્ણ (Gold)', 'ચાંદી (Silver)'],
      deity: 'મા ગાયત્રી અને ભગવાન શિવ',
      description: 'ગૌતમ ગોત્ર ન્યાય, તપ અને ધર્માનુષ્ઠાનનું પ્રતીક છે. સુવર્ણ અને રજત બંને ધાતુઓ સંપૂર્ણ અનુકૂળ છે.',
    },
  },
  parashara: {
    en: {
      name: 'Parashara',
      rishi: 'Maharishi Parashara (Father of Brihat Parashara Hora Shastra)',
      element: 'Cosmic Fire',
      favoredMetals: ['Gold', 'Ashtadhatu'],
      deity: 'Mahavishnu & Maharishi Vedavyasa',
      description: 'The sacred Gotra of Maharishi Parashara, progenitor of Vedic astrology. Gold and Ashtadhatu rings are deeply auspicious.',
    },
    gu: {
      name: 'પરાશર (Parashara)',
      rishi: 'મહર્ષિ પરાશર (બૃહત્પરાશર હોરાશાસ્ત્ર પ્રવર્તક)',
      element: 'અગ્નિ અને તેજસ',
      favoredMetals: ['સુવર્ણ (Gold)', 'અષ્ટધાતુ'],
      deity: 'મહાવિષ્ણુ અને મહર્ષિ વેદવ્યાસ',
      description: 'જ્યોતિષના આદિ પ્રવર્તક મહર્ષિ પરાશરનું ગોત્ર કાલ-વિધાનમાં અતિ પાવન છે. સુવર્ણ અને અષ્ટધાતુ વીંટી અત્યંત શુભ હોય છે.',
    },
  },
  garga: {
    en: {
      name: 'Garga',
      rishi: 'Maharishi Garga (Astronomer & Author of Garga Samhita)',
      element: 'Water / Ether',
      favoredMetals: ['Silver', 'Gold'],
      deity: 'Sri Krishna & Radha Rani',
      description: 'Garga Gotra houses Nakshatra wisdom and intuition. Setting gems in silver or gold enhances peace of mind and clarity.',
    },
    gu: {
      name: 'ગર્ગ (Garga)',
      rishi: 'મહર્ષિ ગર્ગ (ખગોળ અને ગર્ગ સંહિતા રચયિતા)',
      element: 'જળ અને આકાશ',
      favoredMetals: ['ચાંદી (Silver)', 'સુવર્ણ (Gold)'],
      deity: 'શ્રી કૃષ્ણ અને રાધા રાણી',
      description: 'ગર્ગ ગોત્ર નક્ષત્ર-વિદ્યા અને પ્રજ્ઞાનો આશ્રય છે. ચાંદી કે સુવર્ણમાં રત્ન જડાવવાથી માનસિક શાંતિ અને નિર્ણય ક્ષમતા વધે છે.',
    },
  },
  vatsa: {
    en: {
      name: 'Vatsa / Jamadagni',
      rishi: 'Maharishi Bhrigu, Chyavana & Jamadagni',
      element: 'Fire / Earth',
      favoredMetals: ['Gold', 'Copper'],
      deity: 'Lord Parashurama & Lord Shiva',
      description: 'Vatsa Gotra symbolizes valor, strength, and penance. Coral, Ruby, and Yellow Sapphire in copper or gold excel.',
    },
    gu: {
      name: 'વત્સ / જમદગ્નિ (Vatsa)',
      rishi: 'મહર્ષિ ભૃગુ, ચ્યવન અને જમદગ્નિ',
      element: 'અગ્નિ અને પૃથ્વી',
      favoredMetals: ['સુવર્ણ (Gold)', 'તાંબું (Copper)'],
      deity: 'ભગવાન પરશુરામ અને શિવ',
      description: 'વત્સ ગોત્ર પરાક્રમ, શૌર્ય અને તપનું પ્રતીક છે. તાંબું અને સુવર્ણમાં પરવાળું, માણેક અને પોખરાજ અત્યંત ફળે છે.',
    },
  },
  kaushika: {
    en: {
      name: 'Kaushika / Vishvamitra',
      rishi: 'Rajarshi Vishvamitra (Seer of Gayatri Mantra)',
      element: 'Radiant Fire',
      favoredMetals: ['Copper', 'Gold'],
      deity: 'Vedamata Gayatri & Surya Dev',
      description: 'Kaushika Gotra bestows willpower and radiance. Wearing gems set in copper or gold is highly auspicious.',
    },
    gu: {
      name: 'કૌશિક / વિશ્વામિત્ર (Kaushika)',
      rishi: 'રાજર્ષિ વિશ્વામિત્ર (ગાયત્રી મંત્ર દ્રષ્ટા)',
      element: 'પ્રચંડ અગ્નિ',
      favoredMetals: ['તાંબું (Copper)', 'સુવર્ણ (Gold)'],
      deity: 'મા વેદમાતા ગાયત્રી અને સૂર્યદેવ',
      description: 'કૌશિક ગોત્ર સંકલ્પ શક્તિ અને તેજસ્વિતા પ્રદાન કરે છે. તાંબું અને સુવર્ણમાં રત્ન પહેરવું અત્યંત શુભ છે.',
    },
  },
  angirasa: {
    en: {
      name: 'Angirasa',
      rishi: 'Maharishi Angirasa (Son of Agni)',
      element: 'Fire',
      favoredMetals: ['Gold', 'Brass'],
      deity: 'Brihaspati & Agni Dev',
      description: 'Angirasa Gotra is the root of Guru-tattva and sacred knowledge. Yellow Sapphire or Ruby in gold yields special benefits.',
    },
    gu: {
      name: 'અંગિરા (Angirasa)',
      rishi: 'મહર્ષિ અંગિરા (અગ્નિ-પુત્ર)',
      element: 'અગ્નિ',
      favoredMetals: ['સુવર્ણ (Gold)', 'પિત્તળ (Brass)'],
      deity: 'દેવગુરુ બૃહસ્પતિ અને અગ્નિદેવ',
      description: 'અંગિરા ગોત્ર ગુરુ તત્વ અને જ્ઞાનનું મૂળ છે. સુવર્ણ ધાતુમાં પોખરાજ કે માણેક વિશેષ લાભ આપે છે.',
    },
  },
  bhrigu: {
    en: {
      name: 'Bhrigu',
      rishi: 'Maharishi Bhrigu (Author of Bhrigu Samhita)',
      element: 'Water / Venus',
      favoredMetals: ['Silver', 'White Gold'],
      deity: 'Goddess Mahalakshmi & Shukracharya',
      description: 'Bhrigu Gotra signifies abundance, beauty, and Lakshmi grace. Opal, Diamond, or Emerald in silver suits wonderfully.',
    },
    gu: {
      name: 'ભૃગુ (Bhrigu)',
      rishi: 'મહર્ષિ ભૃગુ (ભૃગુ સંહિતા પ્રણેતા)',
      element: 'જળ અને શુક્ર',
      favoredMetals: ['ચાંદી (Silver)', 'સફેદ સુવર્ણ'],
      deity: 'ભગવતી મહાલક્ષ્મી અને શુક્રાચાર્ય',
      description: 'ભૃગુ ગોત્ર ઐશ્વર્ય, સૌંદર્ય અને લક્ષ્મી કૃપાનું પ્રતીક છે. ચાંદીમાં ઓપલ, હીરો કે પન્ના અત્યંત અનુકૂળ રહે છે.',
    },
  },
  atri: {
    en: {
      name: 'Atri',
      rishi: 'Maharishi Atri & Mata Anasuya',
      element: 'Lunar / Water',
      favoredMetals: ['Silver', 'Panchadhatu'],
      deity: 'Lord Dattatreya & Chandra Dev',
      description: 'Atri Gotra grants focus, family harmony, and mental calm. Pearl or Emerald in silver is especially auspicious.',
    },
    gu: {
      name: 'અત્રિ (Atri)',
      rishi: 'મહર્ષિ અત્રિ અને માતા અનસૂયા',
      element: 'સોમ અને જળ',
      favoredMetals: ['ચાંદી (Silver)', 'પંચધાતુ'],
      deity: 'ભગવાન દત્તાત્રેય અને ચંદ્રદેવ',
      description: 'અત્રિ ગોત્ર એકાગ્રતા, પારિવારિક સુખ અને માનસિક શાંતિ આપે છે. ચાંદીમાં મોતી કે પન્ના વિશેષ શુભ છે.',
    },
  },
  pulastya: {
    en: {
      name: 'Pulastya',
      rishi: 'Brahmarishi Pulastya (Saptarishi & Purana Narrator)',
      element: 'Ether & Cosmic Radiance',
      favoredMetals: ['Gold', 'Panchadhatu', 'Copper'],
      deity: 'Lord Shiva & Sri Hari Vishnu',
      description: 'Pulastya Gotra originates from Brahmarishi Pulastya. Wearing gemstones in gold or Panchadhatu offers divine protection.',
    },
    gu: {
      name: 'પુલસ્ત્ય (Pulastya)',
      rishi: 'બ્રહ્મર્ષિ પુલસ્ત્ય (સપ્તર્ષિ અને પુરાણ-સંહિતા પ્રવક્તા)',
      element: 'આકાશ અને તેજસ',
      favoredMetals: ['સુવર્ણ (Gold)', 'પંચધાતુ', 'તાંબું (Copper)'],
      deity: 'ભગવાન શિવ અને શ્રી હરિ વિષ્ણુ',
      description: 'પુલસ્ત્ય ગોત્ર બ્રહ્માજીના માનસ પુત્ર મહર્ષિ પુલસ્ત્યથી ઉદ્ભવેલ છે. સુવર્ણ અને પંચધાતુમાં રત્ન ધારણ કરવું વિશેષ ફળપ્રદ અને સુરક્ષાદાયક છે.',
    },
  },
  agastya: {
    en: {
      name: 'Agastya',
      rishi: 'Maharishi Agastya (Seer of Aditya Hridaya Stotra)',
      element: 'Fire & Oceanic Energy',
      favoredMetals: ['Copper', 'Gold', 'Panchadhatu'],
      deity: 'Lord Suryanarayana & Kartikeya',
      description: 'Agastya Gotra stands for indomitable will and spiritual victory. Ruby or Red Coral in copper or gold is highly auspicious.',
    },
    gu: {
      name: 'અગસ્ત્ય (Agastya)',
      rishi: 'મહર્ષિ અગસ્ત્ય (આદિત્યહૃદય સ્તોત્ર પ્રણેતા)',
      element: 'અગ્નિ અને સમુદ્ર-તેજ',
      favoredMetals: ['તાંબું (Copper)', 'સુવર્ણ (Gold)', 'પંચધાતુ'],
      deity: 'ભગવાન સૂર્યનારાયણ અને કાર્તિકેય',
      description: 'અગસ્ત્ય ગોત્ર અદમ્ય ઇચ્છાશક્તિ અને આધ્યાત્મિક વિજયનું પ્રતીક છે. તાંબું અને સુવર્ણમાં માણેક કે પરવાળું ધારણ કરવું અતિ શુભ છે.',
    },
  },
  vishvamitra: {
    en: {
      name: 'Vishvamitra',
      rishi: 'Maharishi Vishvamitra (Seer of Gayatri Mantra)',
      element: 'Radiant Fire',
      favoredMetals: ['Gold', 'Copper'],
      deity: 'Vedamata Gayatri & Lord Rama',
      description: 'Vishvamitra Gotra represents penance and siddhi. Wearing gems in gold or copper with Gayatri Sankalpa excels.',
    },
    gu: {
      name: 'વિશ્વામિત્ર (Vishvamitra)',
      rishi: 'મહર્ષિ વિશ્વામિત્ર (ગાયત્રી મંત્ર દ્રષ્ટા)',
      element: 'પ્રચંડ તેજસ',
      favoredMetals: ['સુવર્ણ (Gold)', 'તાંબું (Copper)'],
      deity: 'વેદમાતા ગાયત્રી અને ભગવાન રામ',
      description: 'વિશ્વામિત્ર ગોત્ર તપસ્યા અને સિદ્ધિનો પર્યાય છે. ગાયત્રી સંકલ્પ પૂર્વક સુવર્ણ કે તાંબામાં રત્ન ધારણ શ્રેષ્ઠ ફળ આપે છે.',
    },
  },
  jamadagni: {
    en: {
      name: 'Jamadagni',
      rishi: 'Maharishi Jamadagni (Crown of Bhrigu Lineage)',
      element: 'Fire & Earth',
      favoredMetals: ['Gold', 'Panchadhatu'],
      deity: 'Lord Parashurama & Lord Shiva',
      description: 'Jamadagni Gotra signifies courage, truth, and resolve. Wearing gems in Panchadhatu or gold acts like a protective shield.',
    },
    gu: {
      name: 'જમદગ્નિ (Jamadagni)',
      rishi: 'મહર્ષિ જમદગ્નિ (ભૃગુવંશ શિરોમણિ)',
      element: 'અગ્નિ અને પૃથ્વી',
      favoredMetals: ['સુવર્ણ (Gold)', 'પંચધાતુ'],
      deity: 'ભગવાન પરશુરામ અને શિવ',
      description: 'જમદગ્નિ ગોત્ર શૌર્ય, સત્ય અને દૃઢ સંકલ્પનું પરિચાયક છે. પંચધાતુ અને સુવર્ણમાં રત્ન ધારણ રક્ષા કવચ સમાન ફળ આપે છે.',
    },
  },
  harita: {
    en: {
      name: 'Harita',
      rishi: 'Maharishi Harita (Dharmashastra Sage)',
      element: 'Air & Earth',
      favoredMetals: ['Gold', 'Silver'],
      deity: 'Lord Surya & Mahavishnu',
      description: 'Harita Gotra symbolizes dharma, justice, and learning. Both gold and silver are deeply auspicious.',
    },
    gu: {
      name: 'હારીત (Harita)',
      rishi: 'મહર્ષિ હારીત (ધર્મશાસ્ત્રકાર)',
      element: 'વાયુ અને પૃથ્વી',
      favoredMetals: ['સુવર્ણ (Gold)', 'ચાંદી (Silver)'],
      deity: 'ભગવાન સૂર્ય અને મહાવિષ્ણુ',
      description: 'હારીત ગોત્ર ધર્મ, ન્યાય અને વિદ્યાનું પ્રતીક છે. સુવર્ણ અને રજત બંને ધાતુઓ અત્યંત શુભ છે.',
    },
  },
  mudgala: {
    en: {
      name: 'Mudgala',
      rishi: 'Maharishi Mudgala (Seer of Mudgala Upanishad)',
      element: 'Water & Ether',
      favoredMetals: ['Silver', 'Panchadhatu'],
      deity: 'Lord Ganesha & Lord Shiva',
      description: 'Mudgala Gotra signifies Ganesha devotion, wisdom, and peace. Emerald, Pearl, or Yellow Sapphire in silver is auspicious.',
    },
    gu: {
      name: 'મુદ્ગલ (Mudgala)',
      rishi: 'મહર્ષિ મુદ્ગલ (મુદ્ગલ ઉપનિષદ પ્રણેતા)',
      element: 'જળ અને આકાશ',
      favoredMetals: ['ચાંદી (Silver)', 'પંચધાતુ'],
      deity: 'ભગવાન શ્રી ગણેશ અને શિવ',
      description: 'મુદ્ગલ ગોત્ર ગણેશ ભક્તિ, વિવેક અને શાંતિનું પ્રતીક છે. ચાંદીમાં પન્ના, મોતી કે પોખરાજ ધારણ કરવું શુભપ્રદ છે.',
    },
  },
  kaundinya: {
    en: {
      name: 'Kaundinya',
      rishi: 'Maharishi Kaundinya (Vedic Shrauta Rishi)',
      element: 'Earth & Light',
      favoredMetals: ['Gold', 'Copper'],
      deity: 'Lord Shiva & Maa Bhagavati',
      description: 'Kaundinya Gotra symbolizes stability, family welfare, and prestige. Gold or Ashtadhatu settings give blessed results.',
    },
    gu: {
      name: 'કૌણ્ડિન્ય (Kaundinya)',
      rishi: 'મહર્ષિ કૌણ્ડિન્ય (વૈદિક શ્રૌત ઋષિ)',
      element: 'પૃથ્વી અને તેજસ',
      favoredMetals: ['સુવર્ણ (Gold)', 'તાંબું (Copper)'],
      deity: 'ભગવાન શિવ અને મા ભગવતી',
      description: 'કૌણ્ડિન્ય ગોત્ર સ્થિરતા, પરિવાર કલ્યાણ અને પ્રતિષ્ઠાનું પ્રતીક છે. સુવર્ણ કે અષ્ટધાતુમાં રત્ન શુભ ફળદાયી હોય છે.',
    },
  },
  dhanvantari: {
    en: {
      name: 'Dhanvantari',
      rishi: 'Lord Dhanvantari (Originator of Ayurveda)',
      element: 'Nectar & Water',
      favoredMetals: ['Gold', 'Silver', 'Brass'],
      deity: 'Lord Dhanvantari & Mahavishnu',
      description: 'Dhanvantari Gotra signifies health, longevity, and well-being. Gems in gold or silver nurture vitality and prosperity.',
    },
    gu: {
      name: 'ધન્વન્તરિ (Dhanvantari)',
      rishi: 'ભગવાન ધન્વન્તરિ (આયુર્વેદ પ્રવર્તક)',
      element: 'અમૃત અને જળ',
      favoredMetals: ['સુવર્ણ (Gold)', 'ચાંદી (Silver)', 'કાંસ્ય/પિત્તળ'],
      deity: 'ભગવાન ધન્વન્તરિ અને મહાવિષ્ણુ',
      description: 'ધન્વન્તરિ ગોત્ર આરોગ્ય, દીર્ઘાયુ અને કલ્યાણનું પ્રતીક છે. સુવર્ણ કે ચાંદીમાં રત્ન સ્વાસ્થ્ય અને સમૃદ્ધિ પ્રદાન કરે છે.',
    },
  },
  marichi: {
    en: {
      name: 'Marichi',
      rishi: 'Brahmarishi Marichi (Primal Prajapati)',
      element: 'Cosmic Light',
      favoredMetals: ['Gold', 'Copper'],
      deity: 'Lord Suryanarayana & Brahma Ji',
      description: 'Marichi Gotra represents solar rays and the primal ray of wisdom. Ruby and Yellow Sapphire in gold thrive well.',
    },
    gu: {
      name: 'મરીચિ (Marichi)',
      rishi: 'બ્રહ્મર્ષિ મરીચિ (આદિ પ્રજાપતિ)',
      element: 'બ્રહ્મતેજ અને પ્રકાશ',
      favoredMetals: ['સુવર્ણ (Gold)', 'તાંબું (Copper)'],
      deity: 'ભગવાન સૂર્યનારાયણ અને બ્રહ્મા જી',
      description: 'મરીચિ ગોત્ર સૂર્ય રશ્મિઓ અને જ્ઞાનની આદિ કિરણનું પ્રતીક છે. સુવર્ણમાં માણેક અને પોખરાજ અત્યંત ફળદાયી છે.',
    },
  },
};

export function getLocalizedGotra(g: GotraProfile, lang: string = 'hi'): GotraProfile {
  const c = (lang || 'hi').slice(0, 2).toLowerCase();
  const loc = c === 'en' ? GOTRA_I18N[g.id]?.en : c === 'gu' ? GOTRA_I18N[g.id]?.gu : undefined;
  if (!loc) return g;
  return {
    ...g,
    name: loc.name,
    rishi: loc.rishi,
    element: loc.element,
    favoredMetals: loc.favoredMetals,
    deity: loc.deity,
    description: loc.description,
  };
}

// Helpers
function sumDigitsToOne(n: number): number {
  let val = Math.abs(n);
  while (val > 9) {
    let sum = 0;
    while (val > 0) {
      sum += val % 10;
      val = Math.floor(val / 10);
    }
    val = sum;
  }
  return val === 0 ? 9 : val;
}

const NUM_PLANET_MAP: Record<number, {
  name: string;
  gem: string;
  gemEn: string;
  gemGu: string;
  rudraksha: string;
  rudrakshaEn: string;
  rudrakshaGu: string;
  gana: 'deva' | 'danava';
}> = {
  1: { name: 'सूर्य', gem: 'माणिक्य (Ruby)', gemEn: 'Ruby', gemGu: 'માણેક (Ruby)', rudraksha: '१ मुखी या १२ मुखी रुद्राक्ष', rudrakshaEn: '1 Mukhi or 12 Mukhi Rudraksha', rudrakshaGu: '૧ મુખી અથવા ૧૨ મુખી રુદ્રાક્ષ', gana: 'deva' },
  2: { name: 'चंद्र', gem: 'सच्चा मोती (Pearl)', gemEn: 'Natural Pearl', gemGu: 'સાચું મોતી (Pearl)', rudraksha: '२ मुखी रुद्राक्ष', rudrakshaEn: '2 Mukhi Rudraksha', rudrakshaGu: '૨ મુખી રુદ્રાક્ષ', gana: 'deva' },
  3: { name: 'गुरु', gem: 'पीला पुखराज (Yellow Sapphire)', gemEn: 'Yellow Sapphire', gemGu: 'પીળો પોખરાજ (Yellow Sapphire)', rudraksha: '५ मुखी रुद्राक्ष', rudrakshaEn: '5 Mukhi Rudraksha', rudrakshaGu: '૫ મુખી રુદ્રાક્ષ', gana: 'deva' },
  4: { name: 'राहु', gem: 'गोमेद (Hessonite)', gemEn: 'Hessonite Garnet', gemGu: 'ગોમેદ (Hessonite)', rudraksha: '८ मुखी रुद्राक्ष', rudrakshaEn: '8 Mukhi Rudraksha', rudrakshaGu: '૮ મુખી રુદ્રાક્ષ', gana: 'danava' },
  5: { name: 'बुध', gem: 'पन्ना (Emerald)', gemEn: 'Emerald', gemGu: 'પન્ના (Emerald)', rudraksha: '४ मुखी रुद्राक्ष', rudrakshaEn: '4 Mukhi Rudraksha', rudrakshaGu: '૪ મુખી રુદ્રાક્ષ', gana: 'danava' },
  6: { name: 'शुक्र', gem: 'हीरा / ओपल (Diamond/Opal)', gemEn: 'Diamond / Opal', gemGu: 'હીરો / ઓપલ (Diamond/Opal)', rudraksha: '६ मुखी रुद्राक्ष', rudrakshaEn: '6 Mukhi Rudraksha', rudrakshaGu: '૬ મુખી રુદ્રાક્ષ', gana: 'danava' },
  7: { name: 'केतु', gem: 'लहसुनिया (Cat\'s Eye)', gemEn: 'Cat\'s Eye', gemGu: 'લસણિયા (Cat\'s Eye)', rudraksha: '९ मुखी रुद्राक्ष', rudrakshaEn: '9 Mukhi Rudraksha', rudrakshaGu: '૯ મુખી રુદ્રાક્ષ', gana: 'danava' },
  8: { name: 'शनि', gem: 'नीलम / जमुनिया (Blue Sapphire)', gemEn: 'Blue Sapphire / Amethyst', gemGu: 'નીલમ / જમુનિયા (Blue Sapphire)', rudraksha: '७ मुखी रुद्राक्ष', rudrakshaEn: '7 Mukhi Rudraksha', rudrakshaGu: '૭ મુખી રુદ્રાક્ષ', gana: 'danava' },
  9: { name: 'मंगल', gem: 'मूँगा (Red Coral)', gemEn: 'Red Coral', gemGu: 'પરવાળું (Red Coral)', rudraksha: '३ मुखी रुद्राक्ष', rudrakshaEn: '3 Mukhi Rudraksha', rudrakshaGu: '૩ મુખી રુદ્રાક્ષ', gana: 'deva' },
};

const RASHIS = ['मेष', 'वृषभ', 'मिथुन', 'कर्क', 'सिंह', 'कन्या', 'तुला', 'वृश्चिक', 'धनु', 'मकर', 'कुंभ', 'मीन'];
const SIGN_LORDS: Record<string, string> = {
  मेष: 'मंगल', वृषभ: 'शुक्र', मिथुन: 'बुध', कर्क: 'चंद्र', सिंह: 'सूर्य', कन्या: 'बुध',
  तुला: 'शुक्र', वृश्चिक: 'मंगल', धनु: 'गुरु', मकर: 'शनि', कुंभ: 'शनि', मीन: 'गुरु',
};

const GEM_SPECS: Record<string, {
  gem: string; gemEn: string; gemGu: string;
  subGem: string; subGemEn: string; subGemGu: string;
  defaultMetal: string; defaultMetalEn: string; defaultMetalGu: string;
  finger: string; fingerEn: string; fingerGu: string;
  day: string;
  choghadiya: string; choghadiyaEn: string; choghadiyaGu: string;
  beejMantra: string;
}> = {
  सूर्य: {
    gem: 'माणिक्य', gemEn: 'Ruby', gemGu: 'માણેક',
    subGem: 'गार्नेट अथवा लाल अकीक', subGemEn: 'Garnet or Red Agate', subGemGu: 'ગાર્નેટ અથવા લાલ અકીક',
    defaultMetal: 'तांबे या सोने में', defaultMetalEn: 'Copper or Gold', defaultMetalGu: 'તાંબું કે સુવર્ણ',
    finger: 'अनामिका (Ring Finger)', fingerEn: 'Ring Finger', fingerGu: 'અનામિકા આંગળી',
    day: 'रविवार',
    choghadiya: 'अमृत अथवा शुभ', choghadiyaEn: 'Amrit or Shubh', choghadiyaGu: 'અમૃત અથવા શુભ',
    beejMantra: 'ॐ ह्रां ह्रीं ह्रौं सः सूर्याय नमः',
  },
  चंद्र: {
    gem: 'सच्चा मोती', gemEn: 'Natural Pearl', gemGu: 'સાચું મોતી',
    subGem: 'मूनस्टोन अथवा चंद्रकांत मणि', subGemEn: 'Moonstone', subGemGu: 'મૂનસ્ટોન અથવા ચંદ્રકાંત મણિ',
    defaultMetal: 'शुद्ध चांदी में', defaultMetalEn: 'Pure Silver', defaultMetalGu: 'શુદ્ધ ચાંદી',
    finger: 'कनिष्ठिका (Little Finger)', fingerEn: 'Little Finger', fingerGu: 'કનિષ્ઠિકા આંગળી',
    day: 'सोमवार',
    choghadiya: 'अमृत', choghadiyaEn: 'Amrit', choghadiyaGu: 'અમૃત',
    beejMantra: 'ॐ श्रां श्रीं श्रौं सः चंद्रमसे नमः',
  },
  मंगल: {
    gem: 'मूँगा', gemEn: 'Italian Red Coral', gemGu: 'પરવાળું (મૂંગા)',
    subGem: 'लाल अकीक अथवा कार्नेलियन', subGemEn: 'Red Agate or Carnelian', subGemGu: 'લાલ અકીક અથવા કાર્નેલિયન',
    defaultMetal: 'तांबे या सोने में', defaultMetalEn: 'Copper or Gold', defaultMetalGu: 'તાંબું કે સુવર્ણ',
    finger: 'अनामिका (Ring Finger)', fingerEn: 'Ring Finger', fingerGu: 'અનામિકા આંગળી',
    day: 'मंगलवार',
    choghadiya: 'शुभ अथवा लाभ', choghadiyaEn: 'Shubh or Labh', choghadiyaGu: 'શુભ અથવા લાભ',
    beejMantra: 'ॐ क्रां क्रीं क्रौं सः भौमाय नमः',
  },
  बुध: {
    gem: 'पन्ना', gemEn: 'Zambian Emerald', gemGu: 'પન્ના',
    subGem: 'मरगद अथवा जेड (Green Jade)', subGemEn: 'Green Jade or Peridot', subGemGu: 'મરગદ અથવા ગ્રીન જેડ',
    defaultMetal: 'चांदी या पंचधातु में', defaultMetalEn: 'Silver or Panchadhatu', defaultMetalGu: 'ચાંદી કે પંચધાતુ',
    finger: 'कनिष्ठिका (Little Finger)', fingerEn: 'Little Finger', fingerGu: 'કનિષ્ઠિકા આંગળી',
    day: 'बुधवार',
    choghadiya: 'शुभ अथवा चर', choghadiyaEn: 'Shubh or Char', choghadiyaGu: 'શુભ અથવા ચર',
    beejMantra: 'ॐ ब्रां ब्रीं ब्रौं सः बुधाय नमः',
  },
  गुरु: {
    gem: 'पीला पुखराज', gemEn: 'Yellow Sapphire', gemGu: 'પીળો પોખરાજ',
    subGem: 'सुनहला (Citrine) अथवा पीला पुखराज', subGemEn: 'Citrine or Yellow Topaz', subGemGu: 'સુનહલા (Citrine) અથવા ટોપાઝ',
    defaultMetal: 'सोने या पीतल में', defaultMetalEn: 'Gold or Brass', defaultMetalGu: 'સુવર્ણ કે પિત્તળ',
    finger: 'तर्जनी (Index Finger)', fingerEn: 'Index Finger', fingerGu: 'તર્જની આંગળી',
    day: 'गुरुवार',
    choghadiya: 'अमृत अथवा शुभ', choghadiyaEn: 'Amrit or Shubh', choghadiyaGu: 'અમૃત અથવા શુભ',
    beejMantra: 'ॐ ग्रां ग्रीं ग्रौं सः गुरवे नमः',
  },
  शुक्र: {
    gem: 'ओपल अथवा हीरा', gemEn: 'Australian Opal / Diamond', gemGu: 'ઓપલ અથવા હીરો',
    subGem: 'सफेद जरकन अथवा स्फटिक', subGemEn: 'White Zircon or Quartz Crystal', subGemGu: 'સફેદ ઝરકન અથવા સ્ફટિક',
    defaultMetal: 'चांदी या प्लेटिनम में', defaultMetalEn: 'Silver or Platinum', defaultMetalGu: 'ચાંદી કે પ્લેટિનમ',
    finger: 'अनामिका अथवा तर्जनी', fingerEn: 'Ring or Index Finger', fingerGu: 'અનામિકા અથવા તર્જની',
    day: 'शुक्रवार',
    choghadiya: 'शुभ अथवा लाभ', choghadiyaEn: 'Shubh or Labh', choghadiyaGu: 'શુભ અથવા લાભ',
    beejMantra: 'ॐ द्रां द्रीं द्रौं सः शुक्राय नमः',
  },
  शनि: {
    gem: 'नीलम अथवा जमुनिया', gemEn: 'Blue Sapphire / Amethyst', gemGu: 'નીલમ અથવા જમુનિયા',
    subGem: 'नीली अथवा कटैला (Amethyst)', subGemEn: 'Iolite or Amethyst', subGemGu: 'નીલી અથવા કટૈલા (Amethyst)',
    defaultMetal: 'पंचधातु या चांदी में', defaultMetalEn: 'Panchadhatu or Silver', defaultMetalGu: 'પંચધાતુ કે ચાંદી',
    finger: 'मध्यमा (Middle Finger)', fingerEn: 'Middle Finger', fingerGu: 'મધ્યમા આંગળી',
    day: 'शनिवार',
    choghadiya: 'लाभ अथवा अमृत', choghadiyaEn: 'Labh or Amrit', choghadiyaGu: 'લાભ અથવા અમૃત',
    beejMantra: 'ॐ प्रां प्रीं प्रौं सः शनैश्चराय नमः',
  },
  राहु: {
    gem: 'गोमेद', gemEn: 'Hessonite Garnet', gemGu: 'ગોમેદ',
    subGem: 'टूरमैलीन अथवा भूरा अकीक', subGemEn: 'Tourmaline or Brown Agate', subGemGu: 'ટૂરમેલીન અથવા ભૂરો અકીક',
    defaultMetal: 'अष्टधातु या चांदी में', defaultMetalEn: 'Ashtadhatu or Silver', defaultMetalGu: 'અષ્ટધાતુ કે ચાંદી',
    finger: 'मध्यमा (Middle Finger)', fingerEn: 'Middle Finger', fingerGu: 'મધ્યમા આંગળી',
    day: 'शनिवार',
    choghadiya: 'शुभ', choghadiyaEn: 'Shubh', choghadiyaGu: 'શુભ',
    beejMantra: 'ॐ भ्रां भ्रीं भ्रौं सः राहवे नमः',
  },
  केतु: {
    gem: 'लहसुनिया', gemEn: 'Cat\'s Eye Chrysoberyl', gemGu: 'લસણિયા (Cat\'s Eye)',
    subGem: 'वैदूर्य अथवा हकीक', subGemEn: 'Beryl or Agate', subGemGu: 'વૈદૂર્ય અથવા હકીક',
    defaultMetal: 'पंचधातु में', defaultMetalEn: 'Panchadhatu', defaultMetalGu: 'પંચધાતુ',
    finger: 'कनिष्ठिका (Little Finger)', fingerEn: 'Little Finger', fingerGu: 'કનિષ્ઠિકા આંગળી',
    day: 'गुरुवार',
    choghadiya: 'लाभ', choghadiyaEn: 'Labh', choghadiyaGu: 'લાભ',
    beejMantra: 'ॐ स्रां स्रीं स्रौं सः केतवे नमः',
  },
};

/**
 * Calculates complete Triveni Ratna Shodhan by synthesizing Kundali + Ank Jyotish + Gotra.
 */
export function calculateTriveniGemology(
  kundali?: KundaliData | null,
  gotraId?: string,
  lang: string = 'hi'
): TriveniRatnaResult {
  const currentLang = (lang || 'hi').slice(0, 2).toLowerCase();
  const baseGotra = GOTRA_LIST.find((g) => g.id === gotraId) || GOTRA_LIST[0]; // default Kashyapa
  const selectedGotra = getLocalizedGotra(baseGotra, currentLang);
  const name = kundali?.name || (currentLang === 'en' ? 'Yajman' : currentLang === 'gu' ? 'યજમાન' : 'यजमान');

  // 1. Birth Date & Ank Jyotish
  let mulank = 1;
  let bhagyank = 1;
  if (kundali?.birthDate) {
    const bd = new Date(kundali.birthDate);
    const day = bd.getDate();
    const month = bd.getMonth() + 1;
    const year = bd.getFullYear();
    mulank = sumDigitsToOne(day);
    bhagyank = sumDigitsToOne(day + month + year);
  }
  const mInfo = NUM_PLANET_MAP[mulank] || NUM_PLANET_MAP[1];
  const bInfo = NUM_PLANET_MAP[bhagyank] || NUM_PLANET_MAP[1];

  let ganaClassification = currentLang === 'en'
    ? 'Mixed Gana (Harmonized)'
    : currentLang === 'gu'
    ? 'મિશ્રિત ગણ (Harmonized)'
    : 'मिश्रित गण (Harmonized)';
  if (mInfo.gana === 'deva' && bInfo.gana === 'deva') {
    ganaClassification = currentLang === 'en'
      ? 'Deva Gana (Sattvic)'
      : currentLang === 'gu'
      ? 'દેવ ગણ (સત્વ)'
      : 'देव गण (Satva)';
  } else if (mInfo.gana === 'danava' && bInfo.gana === 'danava') {
    ganaClassification = currentLang === 'en'
      ? 'Danava / Material Gana (Rajasic)'
      : currentLang === 'gu'
      ? 'દાનવ / ભૌતિક ગણ (રજસ)'
      : 'दानव / भौतिक गण (Rajas)';
  }

  // 2. Kundali House Lords & Planets (Canonical Hindi keys for calculation)
  const lagnaRashiNum = kundali?.lagnaRashiNumber || 1;
  const lagnaSignIdx = (lagnaRashiNum - 1) % 12;
  const rawLagnaSign = kundali?.lagnaRashi || RASHIS[lagnaSignIdx];
  const rawLagnaLord = SIGN_LORDS[rawLagnaSign] || 'सूर्य';

  const getHouseLord = (h: number) => {
    const signIdx = (lagnaSignIdx + h - 1) % 12;
    return SIGN_LORDS[RASHIS[signIdx]] || 'सूर्य';
  };

  const h5Lord = getHouseLord(5); // पंचमेश
  const h9Lord = getHouseLord(9); // भाग्येश
  const h2Lord = getHouseLord(2); // द्वितीयेश
  const h7Lord = getHouseLord(7); // सप्तमेश
  const h6Lord = getHouseLord(6); // षष्ठेश
  const h8Lord = getHouseLord(8); // अष्टमेश
  const h12Lord = getHouseLord(12); // द्वादशेश

  // Yogakaraka detection
  let yogakaraka: string | undefined = undefined;
  if (rawLagnaSign === 'वृषभ' || rawLagnaSign === 'तुला') yogakaraka = 'शनि';
  else if (rawLagnaSign === 'कर्क' || rawLagnaSign === 'सिंह') yogakaraka = 'मंगल';
  else if (rawLagnaSign === 'मकर' || rawLagnaSign === 'कुंभ') yogakaraka = 'शुक्र';

  // Strict Maraka & Trik Lords list (excluding lords who also own lagna or trikona)
  const trikLords = Array.from(new Set([h6Lord, h8Lord, h12Lord, h2Lord, h7Lord])).filter(
    (pl) => pl !== rawLagnaLord && pl !== h9Lord && pl !== h5Lord && pl !== yogakaraka
  );

  const forbiddenGems: ForbiddenGemDetail[] = trikLords.map((pl) => {
    const spec = GEM_SPECS[pl];
    let roleStr = '';
    if (currentLang === 'en') {
      if (pl === h6Lord) roleStr += '6th Lord (Debt/Health) ';
      if (pl === h8Lord) roleStr += '8th Lord (Obstacles) ';
      if (pl === h12Lord) roleStr += '12th Lord (Loss) ';
      if (pl === h2Lord || pl === h7Lord) roleStr += 'Maraka ';
    } else if (currentLang === 'gu') {
      if (pl === h6Lord) roleStr += 'ષષ્ઠેશ (રોગ/ઋણ) ';
      if (pl === h8Lord) roleStr += 'અષ્ટમેશ (સંકટ/બાધા) ';
      if (pl === h12Lord) roleStr += 'દ્વાદશેશ (વ્યય/હાનિ) ';
      if (pl === h2Lord || pl === h7Lord) roleStr += 'મારક ';
    } else {
      if (pl === h6Lord) roleStr += 'षष्ठेश (रोग/ऋण) ';
      if (pl === h8Lord) roleStr += 'अष्टमेश (संकट/बाधा) ';
      if (pl === h12Lord) roleStr += 'द्वादशेश (व्यय/हानि) ';
      if (pl === h2Lord || pl === h7Lord) roleStr += 'मारक ';
    }
    return {
      gem: spec ? (currentLang === 'en' ? spec.gemEn : currentLang === 'gu' ? spec.gemGu : spec.gem) : trPlanet(pl, currentLang),
      planet: trPlanet(pl, currentLang),
      role: roleStr.trim(),
      reason: currentLang === 'en'
        ? 'This planet owns an adverse or Maraka house in your chart. Wearing its gemstone may amplify obstacles.'
        : currentLang === 'gu'
        ? 'આ ગ્રહ તમારી કુંડળીમાં અશુભ કે મારક ભાવનો સ્વામી છે. તેનું રત્ન પહેરવાથી નકારાત્મક અસર વધી શકે છે.'
        : 'यह ग्रह आपकी कुंडली में अशुभ/मारक भाव का स्वामी है। इसका रत्न पहनने से उस भाव की नकारात्मक रश्मियां बढ़ेंगी।',
    };
  });

  // Calculate Best Metal respecting base Gotra and Planet
  const resolveMetal = (planet: string): string => {
    const spec = GEM_SPECS[planet];
    if (baseGotra.favoredMetals.some((m) => m.includes('चांदी')) && ['चंद्र', 'शुक्र', 'बुध'].includes(planet)) {
      return currentLang === 'en' ? 'Pure Silver (Gotra aligned)' : currentLang === 'gu' ? 'શુદ્ધ ચાંદી (ગોત્ર સંમત)' : 'शुद्ध चांदी (गोत्र संमत)';
    }
    if (baseGotra.favoredMetals.some((m) => m.includes('तांबा')) && ['सूर्य', 'मंगल'].includes(planet)) {
      return currentLang === 'en' ? 'Copper or Panchadhatu (Gotra aligned)' : currentLang === 'gu' ? 'તાંબા કે પંચધાતુમાં (ગોત્ર સંમત)' : 'तांबे या पंचधातु में (गोत्र संमत)';
    }
    if (currentLang === 'en') {
      const pMetalEn = spec?.defaultMetalEn || 'Gold';
      return `${selectedGotra.favoredMetals[0]} or ${pMetalEn}`;
    }
    if (currentLang === 'gu') {
      const pMetalGu = spec?.defaultMetalGu || 'સુવર્ણ';
      return `${selectedGotra.favoredMetals[0]} અથવા ${pMetalGu}`;
    }
    const pMetal = spec?.defaultMetal || 'स्वर्ण';
    return `${baseGotra.favoredMetals[0]} अथवा ${pMetal}`;
  };

  const locLagnaSign = trRashi(rawLagnaSign, currentLang);
  const locLagnaLord = trPlanet(rawLagnaLord, currentLang);

  // Primary Life Stone = Lagna Lord
  const lSpec = GEM_SPECS[rawLagnaLord] || GEM_SPECS['गुरु'];
  const primaryLifeStone: TriveniGemstoneDetail = {
    gem: currentLang === 'en' ? lSpec.gemEn : currentLang === 'gu' ? lSpec.gemGu : lSpec.gem,
    gemEn: lSpec.gemEn,
    subGem: currentLang === 'en' ? lSpec.subGemEn : currentLang === 'gu' ? lSpec.subGemGu : lSpec.subGem,
    planet: locLagnaLord,
    planetRole: currentLang === 'en' ? 'Ascendant Lord (Life & Health)' : currentLang === 'gu' ? 'લગ્નેશ (જીવન અને સ્વાસ્થ્ય રક્ષક)' : 'लग्नेश (जीवन व स्वास्थ्य रक्षक)',
    weightRatti: currentLang === 'en' ? '5.25 to 7.25 Ratti' : currentLang === 'gu' ? '૫.૨૫ થી ૭.૨૫ રત્તી' : '५.२५ से ७.२५ रत्ती',
    metal: resolveMetal(rawLagnaLord),
    finger: currentLang === 'en' ? lSpec.fingerEn : currentLang === 'gu' ? lSpec.fingerGu : lSpec.finger,
    day: trWeekday(lSpec.day, currentLang),
    choghadiya: currentLang === 'en' ? lSpec.choghadiyaEn : currentLang === 'gu' ? lSpec.choghadiyaGu : lSpec.choghadiya,
    beejMantra: lSpec.beejMantra,
    shastricReason: currentLang === 'en'
      ? `The lord of your Ascendant (${locLagnaSign}) is ${locLagnaLord}. The Lagna Lord gemstone protects lifelong health, confidence, and vitality.`
      : currentLang === 'gu'
      ? `તમારા ${locLagnaSign} લગ્નના સ્વામી ${locLagnaLord} છે. લગ્નેશનું રત્ન જીવનભર આરોગ્ય, આત્મવિશ્વાસ અને રક્ષા પ્રદાન કરે છે.`
      : `आपकी ${rawLagnaSign} लग्न के स्वामी ${rawLagnaLord} हैं। लग्नेश का रत्न जीवन-भर शरीर, आरोग्यता, आत्मविश्वास और आत्मरक्षा का कार्य करता है।`,
  };

  // Secondary Bhagya / Yogakaraka Stone
  const secondaryPlanet = yogakaraka || (h9Lord !== rawLagnaLord ? h9Lord : h5Lord);
  let secondaryBhagyaStone: TriveniGemstoneDetail | undefined = undefined;
  if (secondaryPlanet && secondaryPlanet !== rawLagnaLord && !trikLords.includes(secondaryPlanet)) {
    const sSpec = GEM_SPECS[secondaryPlanet] || GEM_SPECS['गुरु'];
    const locSecPlanet = trPlanet(secondaryPlanet, currentLang);
    const roleLabel = currentLang === 'en'
      ? (yogakaraka === secondaryPlanet ? 'Supreme Yogakaraka' : h9Lord === secondaryPlanet ? 'Fortune Lord (9th)' : '5th Lord (Wisdom)')
      : currentLang === 'gu'
      ? (yogakaraka === secondaryPlanet ? 'પરમ યોગકારક' : h9Lord === secondaryPlanet ? 'ભાગ્યેશ (નવમેશ)' : 'પંચમેશ (વિદ્યા અને ઇષ્ટ)')
      : (yogakaraka === secondaryPlanet ? 'परम योगकारक' : h9Lord === secondaryPlanet ? 'भाग्येश (नवमेश)' : 'पंचमेश (विद्या व इष्ट)');
    secondaryBhagyaStone = {
      gem: currentLang === 'en' ? sSpec.gemEn : currentLang === 'gu' ? sSpec.gemGu : sSpec.gem,
      gemEn: sSpec.gemEn,
      subGem: currentLang === 'en' ? sSpec.subGemEn : currentLang === 'gu' ? sSpec.subGemGu : sSpec.subGem,
      planet: locSecPlanet,
      planetRole: roleLabel,
      weightRatti: currentLang === 'en' ? '5.25 to 6.25 Ratti' : currentLang === 'gu' ? '૫.૨૫ થી ૬.૨૫ રત્તી' : '५.२५ से ६.२५ रत्ती',
      metal: resolveMetal(secondaryPlanet),
      finger: currentLang === 'en' ? sSpec.fingerEn : currentLang === 'gu' ? sSpec.fingerGu : sSpec.finger,
      day: trWeekday(sSpec.day, currentLang),
      choghadiya: currentLang === 'en' ? sSpec.choghadiyaEn : currentLang === 'gu' ? sSpec.choghadiyaGu : sSpec.choghadiya,
      beejMantra: sSpec.beejMantra,
      shastricReason: currentLang === 'en'
        ? `Being ${roleLabel} in your chart, ${locSecPlanet} accelerates fortune, prosperity, and recognition alongside your Life Stone.`
        : currentLang === 'gu'
        ? `તમારી કુંડળીમાં ${locSecPlanet} ${roleLabel} હોવાથી ભાગ્યોદય, ધન લાભ અને યશ વૃદ્ધિમાં અતિ શુભ છે.`
        : `आपकी कुंडली में ${secondaryPlanet} ${roleLabel} होकर भाग्योदय, धन लाभ एवं यश वृद्धि का कारक है। इसे लग्नेश के साथ धारण करना अति शुभ है।`,
    };
  }

  // Remedial Rudraksha for Numerology Harmony
  const rudrakshaPlanet = trPlanet(mInfo.name, currentLang);
  const rudrakshaMukhi = currentLang === 'en' ? mInfo.rudrakshaEn : currentLang === 'gu' ? mInfo.rudrakshaGu : mInfo.rudraksha;
  let rudrakshaBenefits = '';
  if (trikLords.includes(mInfo.name)) {
    rudrakshaBenefits = currentLang === 'en'
      ? `Life Path ${mulank} lord (${rudrakshaPlanet}) is a functional Maraka in your horoscope, so its gemstone is avoided. Wearing this sacred Rudraksha harmonizes numerology safely without side effects.`
      : currentLang === 'gu'
      ? `મૂળાંક ${mulank} ના સ્વામી (${rudrakshaPlanet}) કુંડળીમાં મારક હોવાથી રત્ન વર્જ્ય છે. આ રુદ્રાક્ષ ધારણ કરવાથી કોઈ પણ દુષ્પ્રભાવ વગર શાંતિ અને ઉન્નતિ મળે છે.`
      : `मूलांक ${mulank} के स्वामी ${mInfo.name} कुंडली में मारक/त्रिकेश हैं, अतः इनका रत्न वर्जित है। केवल यह रुद्राक्ष धारण करने से बिना किसी दुष्प्रभाव के शांति व उन्नति मिलेगी।`;
  } else {
    rudrakshaBenefits = currentLang === 'en'
      ? `Awakens auspicious vibrations of Life Path ${mulank} and Destiny Number ${bhagyank} for radiance and steadiness.`
      : currentLang === 'gu'
      ? `મૂળાંક ${mulank} અને ભાગ્યાંક ${bhagyank} ની દિવ્ય તરંગોને જાગ્રત કરી તેજ અને શાંતિ પ્રદાન કરે છે.`
      : `मूलांक ${mulank} व भाग्यांक ${bhagyank} की दिव्य तरंगों को जाग्रत कर ओज व तेज प्रदान करता है।`;
  }

  // Authentic Sanskrit Sankalpa Mantra (keep Sanskrit & canonical forms untouched)
  const sankalpaMantra = `॥ ॐ अद्य श्रीगोत्रोत्पन्नः (गोत्र: ${baseGotra.name}), श्री ${name} नामाहं, मम कायिक-वाचिक-मानसिक संचित पाप शमनार्थं, श्री ${rawLagnaLord} व ${secondaryPlanet || rawLagnaLord} ग्रह प्रीत्यर्थं, ${baseGotra.deity} कृपा प्राप्त्यर्थं, इदं ${lSpec.gem} रत्नम् शुभ मुहूर्ते धारयामि। ॐ तत्सत् ॥`;

  const verdictSummary = currentLang === 'en'
    ? `Dear ${name}! Based on Triveni Gemology synthesis (Horoscope + Life Path ${mulank} + ${selectedGotra.nameEn} Gotra), **${primaryLifeStone.gem}** as your Life Stone and **${secondaryBhagyaStone ? secondaryBhagyaStone.gem : 'Yellow Sapphire'}** as your Fortune Stone are 100% aligned with Vedic Shastras.`
    : currentLang === 'gu'
    ? `યજમાન ${name} જી! તમારા ${locLagnaSign} લગ્ન, મૂળાંક ${mulank} અને ${selectedGotra.name} ના ત્રિવિધ શોધન મુજબ **${primaryLifeStone.gem}** જીવન-રત્ન અને **${secondaryBhagyaStone ? secondaryBhagyaStone.gem : 'પોખરાજ'}** ભાગ્ય-રત્ન ૧૦૦% શાસ્ત્રસંમત છે.`
    : `यजमान ${name} जी! आपकी ${rawLagnaSign} लग्न, मूलांक ${mulank} (स्वामी: ${mInfo.name}) एवं ${baseGotra.name} के त्रिविध शोधन के अनुसार आपके लिए **${primaryLifeStone.gem}** जीवन-रत्न तथा **${secondaryBhagyaStone ? secondaryBhagyaStone.gem : 'पुखराज'}** भाग्य-रत्न के रूप में १००% शास्त्रसम्मत है।`;

  return {
    personName: name,
    lagnaSign: locLagnaSign,
    lagnaLord: locLagnaLord,
    moonSign: trRashi(kundali?.moonRashi || 'वृषभ', currentLang),
    nakshatra: trVedic(kundali?.nakshatra || 'रोहिणी', currentLang),
    mulank,
    mulankPlanet: trPlanet(mInfo.name, currentLang),
    mulankGem: currentLang === 'en' ? mInfo.gemEn : currentLang === 'gu' ? mInfo.gemGu : mInfo.gem,
    bhagyank,
    bhagyankPlanet: trPlanet(bInfo.name, currentLang),
    bhagyankGem: currentLang === 'en' ? bInfo.gemEn : currentLang === 'gu' ? bInfo.gemGu : bInfo.gem,
    ganaClassification,
    gotra: selectedGotra,
    primaryLifeStone,
    secondaryBhagyaStone,
    remedialRudraksha: {
      mukhi: rudrakshaMukhi,
      planet: rudrakshaPlanet,
      benefits: rudrakshaBenefits,
    },
    forbiddenGems,
    sankalpaMantra,
    verdictSummary,
  };
}
