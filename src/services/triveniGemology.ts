/**
 * त्रिवेणी रत्न शोधन सेवा (Triveni Gemology Service)
 * 
 * 100% Authentic Shastric Tri-Fold Gemstone Determination:
 * 1. Janma Kundali (Lagna Lord, Trikona 1-5-9, Yogakaraka, Maraka/Trik Elimination)
 * 2. Ank Jyotish (Mulank, Bhagyank, Deva/Danava Gana Alignment)
 * 3. Gotra & Rishi Kula (Element, Preferred Metal, Sankalpa Mantra)
 */

import { KundaliData, PlanetPosition } from '../types';

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
  ganaClassification: 'देव गण (Satva)' | 'दानव / भौतिक गण (Rajas)' | 'मिश्रित गण (Harmonized)';
  
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

const NUM_PLANET_MAP: Record<number, { name: string; gem: string; rudraksha: string; gana: 'deva' | 'danava' }> = {
  1: { name: 'सूर्य', gem: 'माणिक्य (Ruby)', rudraksha: '१ मुखी या १२ मुखी रुद्राक्ष', gana: 'deva' },
  2: { name: 'चंद्र', gem: 'सच्चा मोती (Pearl)', rudraksha: '२ मुखी रुद्राक्ष', gana: 'deva' },
  3: { name: 'गुरु', gem: 'पीला पुखराज (Yellow Sapphire)', rudraksha: '५ मुखी रुद्राक्ष', gana: 'deva' },
  4: { name: 'राहु', gem: 'गोमेद (Hessonite)', rudraksha: '८ मुखी रुद्राक्ष', gana: 'danava' },
  5: { name: 'बुध', gem: 'पन्ना (Emerald)', rudraksha: '४ मुखी रुद्राक्ष', gana: 'danava' },
  6: { name: 'शुक्र', gem: 'हीरा / ओपल (Diamond/Opal)', rudraksha: '६ मुखी रुद्राक्ष', gana: 'danava' },
  7: { name: 'केतु', gem: 'लहसुनिया (Cat\'s Eye)', rudraksha: '९ मुखी रुद्राक्ष', gana: 'danava' },
  8: { name: 'शनि', gem: 'नीलम / जमुनिया (Blue Sapphire)', rudraksha: '७ मुखी रुद्राक्ष', gana: 'danava' },
  9: { name: 'मंगल', gem: 'मूँगा (Red Coral)', rudraksha: '३ मुखी रुद्राक्ष', gana: 'deva' },
};

const RASHIS = ['मेष', 'वृषभ', 'मिथुन', 'कर्क', 'सिंह', 'कन्या', 'तुला', 'वृश्चिक', 'धनु', 'मकर', 'कुंभ', 'मीन'];
const SIGN_LORDS: Record<string, string> = {
  मेष: 'मंगल', वृषभ: 'शुक्र', मिथुन: 'बुध', कर्क: 'चंद्र', सिंह: 'सूर्य', कन्या: 'बुध',
  तुला: 'शुक्र', वृश्चिक: 'मंगल', धनु: 'गुरु', मकर: 'शनि', कुंभ: 'शनि', मीन: 'गुरु',
};

const GEM_SPECS: Record<string, { gem: string; gemEn: string; subGem: string; defaultMetal: string; finger: string; day: string; choghadiya: string; beejMantra: string }> = {
  सूर्य: { gem: 'माणिक्य', gemEn: 'Ruby', subGem: 'गार्नेट अथवा लाल अकीक', defaultMetal: 'तांबे या सोने में', finger: 'अनामिका (Ring Finger)', day: 'रविवार', choghadiya: 'अमृत अथवा शुभ', beejMantra: 'ॐ ह्रां ह्रीं ह्रौं सः सूर्याय नमः' },
  चंद्र: { gem: 'सच्चा मोती', gemEn: 'Natural Pearl', subGem: 'मूनस्टोन अथवा चंद्रकांत मणि', defaultMetal: 'शुद्ध चांदी में', finger: 'कनिष्ठिका (Little Finger)', day: 'सोमवार', choghadiya: 'अमृत', beejMantra: 'ॐ श्रां श्रीं श्रौं सः चंद्रमसे नमः' },
  मंगल: { gem: 'मूँगा', gemEn: 'Italian Red Coral', subGem: 'लाल अकीक अथवा कार्नेलियन', defaultMetal: 'तांबे या सोने में', finger: 'अनामिका (Ring Finger)', day: 'मंगलवार', choghadiya: 'शुभ अथवा लाभ', beejMantra: 'ॐ क्रां क्रीं क्रौं सः भौमाय नमः' },
  बुध: { gem: 'पन्ना', gemEn: 'Zambian Emerald', subGem: 'मरगद अथवा जेड (Green Jade)', defaultMetal: 'चांदी या पंचधातु में', finger: 'कनिष्ठिका (Little Finger)', day: 'बुधवार', choghadiya: 'शुभ अथवा चर', beejMantra: 'ॐ ब्रां ब्रीं ब्रौं सः बुधाय नमः' },
  गुरु: { gem: 'पीला पुखराज', gemEn: 'Yellow Sapphire', subGem: 'सुनहला (Citrine) अथवा पीला पुखराज', defaultMetal: 'सोने या पीतल में', finger: 'तर्जनी (Index Finger)', day: 'गुरुवार', choghadiya: 'अमृत अथवा शुभ', beejMantra: 'ॐ ग्रां ग्रीं ग्रौं सः गुरवे नमः' },
  शुक्र: { gem: 'ओपल अथवा हीरा', gemEn: 'Australian Opal / Diamond', subGem: 'सफेद जरकन अथवा स्फटिक', defaultMetal: 'चांदी या प्लेटिनम में', finger: 'अनामिका अथवा तर्जनी', day: 'शुक्रवार', choghadiya: 'शुभ अथवा लाभ', beejMantra: 'ॐ द्रां द्रीं द्रौं सः शुक्राय नमः' },
  शनि: { gem: 'नीलम अथवा जमुनिया', gemEn: 'Blue Sapphire / Amethyst', subGem: 'नीली अथवा कटैला (Amethyst)', defaultMetal: 'पंचधातु या चांदी में', finger: 'मध्यमा (Middle Finger)', day: 'शनिवार', choghadiya: 'लाभ अथवा अमृत', beejMantra: 'ॐ प्रां प्रीं प्रौं सः शनैश्चराय नमः' },
  राहु: { gem: 'गोमेद', gemEn: 'Hessonite Garnet', subGem: 'टूरमैलीन अथवा भूरा अकीक', defaultMetal: 'अष्टधातु या चांदी में', finger: 'मध्यमा (Middle Finger)', day: 'शनिवार (सायंकाल)', choghadiya: 'शुभ', beejMantra: 'ॐ भ्रां भ्रीं भ्रौं सः राहवे नमः' },
  केतु: { gem: 'लहसुनिया', gemEn: 'Cat\'s Eye Chrysoberyl', subGem: 'वैदूर्य अथवा हकीक', defaultMetal: 'पंचधातु में', finger: 'कनिष्ठिका (Little Finger)', day: 'गुरुवार / शनिवार', choghadiya: 'लाभ', beejMantra: 'ॐ स्रां स्रीं स्रौं सः केतवे नमः' },
};

/**
 * Calculates complete Triveni Ratna Shodhan by synthesizing Kundali + Ank Jyotish + Gotra.
 */
export function calculateTriveniGemology(
  kundali?: KundaliData | null,
  gotraId?: string
): TriveniRatnaResult {
  const selectedGotra = GOTRA_LIST.find((g) => g.id === gotraId) || GOTRA_LIST[0]; // default Kashyapa
  const name = kundali?.name || 'यजमान';

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

  let ganaClassification: 'देव गण (Satva)' | 'दानव / भौतिक गण (Rajas)' | 'मिश्रित गण (Harmonized)' = 'मिश्रित गण (Harmonized)';
  if (mInfo.gana === 'deva' && bInfo.gana === 'deva') {
    ganaClassification = 'देव गण (Satva)';
  } else if (mInfo.gana === 'danava' && bInfo.gana === 'danava') {
    ganaClassification = 'दानव / भौतिक गण (Rajas)';
  }

  // 2. Kundali House Lords & Planets
  const lagnaRashiNum = kundali?.lagnaRashiNumber || 1;
  const lagnaSignIdx = (lagnaRashiNum - 1) % 12;
  const lagnaSign = kundali?.lagnaRashi || RASHIS[lagnaSignIdx];
  const lagnaLord = SIGN_LORDS[lagnaSign] || 'सूर्य';

  const getHouseLord = (h: number) => {
    const signIdx = (lagnaSignIdx + h - 1) % 12;
    return SIGN_LORDS[RASHIS[signIdx]] || 'सूर्य';
  };

  const h5Lord = getHouseLord(5); // पंचमेश (बुद्धि, प्रज्ञा, इष्ट)
  const h9Lord = getHouseLord(9); // भाग्येश (धर्म, भाग्य, यश)
  const h2Lord = getHouseLord(2); // द्वितीयेश (मारक)
  const h7Lord = getHouseLord(7); // सप्तमेश (मारक)
  const h6Lord = getHouseLord(6); // षष्ठेश (रोग, रिपु, ऋण)
  const h8Lord = getHouseLord(8); // अष्टमेश (आयु, छिद्र)
  const h12Lord = getHouseLord(12); // द्वादशेश (व्यय, हानि)

  // Yogakaraka detection
  let yogakaraka: string | undefined = undefined;
  if (lagnaSign === 'वृषभ' || lagnaSign === 'तुला') yogakaraka = 'शनि';
  else if (lagnaSign === 'कर्क' || lagnaSign === 'सिंह') yogakaraka = 'मंगल';
  else if (lagnaSign === 'मकर' || lagnaSign === 'कुंभ') yogakaraka = 'शुक्र';

  // Strict Maraka & Trik Lords list (excluding lords who also own lagna or trikona)
  const trikLords = Array.from(new Set([h6Lord, h8Lord, h12Lord, h2Lord, h7Lord])).filter(
    (pl) => pl !== lagnaLord && pl !== h9Lord && pl !== h5Lord && pl !== yogakaraka
  );

  const forbiddenGems: ForbiddenGemDetail[] = trikLords.map((pl) => {
    const spec = GEM_SPECS[pl];
    let roleStr = '';
    if (pl === h6Lord) roleStr += 'षष्ठेश (रोग/ऋण) ';
    if (pl === h8Lord) roleStr += 'अष्टमेश (संकट/बाधा) ';
    if (pl === h12Lord) roleStr += 'द्वादशेश (व्यय/हानि) ';
    if (pl === h2Lord || pl === h7Lord) roleStr += 'मारक ';
    return {
      gem: spec ? spec.gem : pl,
      planet: pl,
      role: roleStr.trim(),
      reason: `यह ग्रह आपकी कुंडली में अशुभ/मारक भाव का स्वामी है। इसका रत्न पहनने से उस भाव की नकारात्मक रश्मियां बढ़ेंगी।`,
    };
  });

  // Calculate Best Metal respecting Gotra and Planet
  const resolveMetal = (planet: string): string => {
    const pMetal = GEM_SPECS[planet]?.defaultMetal || 'स्वर्ण';
    // If Gotra specifically favors silver and gem is Moon/Venus/Mercury
    if (selectedGotra.favoredMetals.some((m) => m.includes('चांदी')) && ['चंद्र', 'शुक्र', 'बुध'].includes(planet)) {
      return 'शुद्ध चांदी (गोत्र संमत)';
    }
    // If Gotra favors copper/gold and gem is Sun/Mars/Jupiter
    if (selectedGotra.favoredMetals.some((m) => m.includes('तांबा')) && ['सूर्य', 'मंगल'].includes(planet)) {
      return 'तांबे या पंचधातु में (गोत्र संमत)';
    }
    return `${selectedGotra.favoredMetals[0]} अथवा ${pMetal}`;
  };

  // Primary Life Stone = Lagna Lord
  const lSpec = GEM_SPECS[lagnaLord] || GEM_SPECS['गुरु'];
  const primaryLifeStone: TriveniGemstoneDetail = {
    gem: lSpec.gem,
    gemEn: lSpec.gemEn,
    subGem: lSpec.subGem,
    planet: lagnaLord,
    planetRole: 'लग्नेश (जीवन व स्वास्थ्य रक्षक)',
    weightRatti: '५.२५ से ७.२५ रत्ती',
    metal: resolveMetal(lagnaLord),
    finger: lSpec.finger,
    day: lSpec.day,
    choghadiya: lSpec.choghadiya,
    beejMantra: lSpec.beejMantra,
    shastricReason: `आपकी ${lagnaSign} लग्न के स्वामी ${lagnaLord} हैं। लग्नेश का रत्न जीवन-भर शरीर, आरोग्यता, आत्मविश्वास और आत्मरक्षा का कार्य करता है।`,
  };

  // Secondary Bhagya / Yogakaraka Stone
  const secondaryPlanet = yogakaraka || (h9Lord !== lagnaLord ? h9Lord : h5Lord);
  let secondaryBhagyaStone: TriveniGemstoneDetail | undefined = undefined;
  if (secondaryPlanet && secondaryPlanet !== lagnaLord && !trikLords.includes(secondaryPlanet)) {
    const sSpec = GEM_SPECS[secondaryPlanet] || GEM_SPECS['गुरु'];
    const roleLabel = yogakaraka === secondaryPlanet ? 'परम योगकारक' : h9Lord === secondaryPlanet ? 'भाग्येश (नवमेश)' : 'पंचमेश (विद्या व इष्ट)';
    secondaryBhagyaStone = {
      gem: sSpec.gem,
      gemEn: sSpec.gemEn,
      subGem: sSpec.subGem,
      planet: secondaryPlanet,
      planetRole: roleLabel,
      weightRatti: '५.२५ से ६.२५ रत्ती',
      metal: resolveMetal(secondaryPlanet),
      finger: sSpec.finger,
      day: sSpec.day,
      choghadiya: sSpec.choghadiya,
      beejMantra: sSpec.beejMantra,
      shastricReason: `आपकी कुंडली में ${secondaryPlanet} ${roleLabel} होकर भाग्योदय, धन लाभ एवं यश वृद्धि का कारक है। इसे लग्नेश के साथ धारण करना अति शुभ है।`,
    };
  }

  // Remedial Rudraksha for Numerology Harmony
  // If Mulank planet is a Maraka in Kundali, give Rudraksha instead of gem!
  let rudrakshaPlanet = mInfo.name;
  let rudrakshaMukhi = mInfo.rudraksha;
  let rudrakshaBenefits = `मूलांक ${mulank} के स्वामी ${mInfo.name} के बल संवर्धन हेतु`;
  if (trikLords.includes(mInfo.name)) {
    rudrakshaBenefits = `मूलांक ${mulank} के स्वामी ${mInfo.name} कुंडली में मारक/त्रिकेश हैं, अतः इनका रत्न वर्जित है। केवल यह रुद्राक्ष धारण करने से बिना किसी दुष्प्रभाव के शांति व उन्नति मिलेगी।`;
  } else {
    rudrakshaBenefits = `मूलांक ${mulank} व भाग्यांक ${bhagyank} की दिव्य तरंगों को जाग्रत कर ओज व तेज प्रदान करता है।`;
  }

  const sankalpaMantra = `॥ ॐ अद्य श्रीगोत्रोत्पन्नः (गोत्र: ${selectedGotra.name}), श्री ${name} नामाहं, मम कायिक-वाचिक-मानसिक संचित पाप शमनार्थं, श्री ${lagnaLord} व ${secondaryPlanet || lagnaLord} ग्रह प्रीत्यर्थं, ${selectedGotra.deity} कृपा प्राप्त्यर्थं, इदं ${primaryLifeStone.gem} रत्नम् शुभ मुहूर्ते धारयामि। ॐ तत्सत् ॥`;

  const verdictSummary = `यजमान ${name} जी! आपकी ${lagnaSign} लग्न, मूलांक ${mulank} (स्वामी: ${mInfo.name}) एवं ${selectedGotra.name} के त्रिविध शोधन के अनुसार आपके लिए **${primaryLifeStone.gem}** जीवन-रत्न तथा **${secondaryBhagyaStone ? secondaryBhagyaStone.gem : 'पुखराज'}** भाग्य-रत्न के रूप में १००% शास्त्रसम्मत है।`;

  return {
    personName: name,
    lagnaSign,
    lagnaLord,
    moonSign: kundali?.moonRashi || 'वृषभ',
    nakshatra: kundali?.nakshatra || 'रोहिणी',
    mulank,
    mulankPlanet: mInfo.name,
    mulankGem: mInfo.gem,
    bhagyank,
    bhagyankPlanet: bInfo.name,
    bhagyankGem: bInfo.gem,
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
