/**
 * Vedic & Chaldean Numerology Engine (अंक ज्योतिष शास्त्र)
 * Full working calculations for Mulank, Bhagyank, Namank, Loshu Grid & Upay.
 */

export interface NumberInfo {
  number: number;
  planet: string;
  planetEn: string;
  deity: string;
  element: string;
  nature: string;
  luckyColors: string[];
  luckyDays: string[];
  luckyDates: number[];
  luckyGem: string;
  subGem: string;
  rudraksha: string;
  yantra: string;
  mantra: string;
  japaCount: number;
  charity: string[];
  friendlyNumbers: number[];
  enemyNumbers: number[];
  neutralNumbers: number[];
  traits: string[];
  careers: string[];
  healthAdvice: string[];
  waterBottleColor: string;
}

export const NUMBER_DATA: Record<number, NumberInfo> = {
  1: {
    number: 1,
    planet: 'सूर्य (Sun)',
    planetEn: 'Sun',
    deity: 'भगवान सूर्य नारायण',
    element: 'अग्नि (Fire)',
    nature: 'नेतृत्व, आत्मविश्वास, स्वाभिमान, सृजनशीलता',
    luckyColors: ['सुनहरा (Golden)', 'नारंगी (Orange)', 'पीला (Yellow)'],
    luckyDays: ['रविवार (Sunday)', 'सोमवार (Monday)'],
    luckyDates: [1, 10, 19, 28],
    luckyGem: 'माणिक्य (Ruby)',
    subGem: 'गार्नेट / लाल अकीक',
    rudraksha: '१ मुखी या १२ मुखी रुद्राक्ष',
    yantra: 'श्री सूर्य यंत्र (Surya Yantra)',
    mantra: 'ॐ ह्रां ह्रीं ह्रौं सः सूर्याय नमः',
    japaCount: 7000,
    charity: ['तांबा', 'गुड़', 'गेहूं', 'लाल वस्त्र', 'मसूर दाल'],
    friendlyNumbers: [1, 2, 3, 5, 9],
    enemyNumbers: [6, 8],
    neutralNumbers: [4, 7],
    traits: ['जन्मजात नेता', 'दृढ़ संकल्पी', 'आत्मनिर्भर', 'सम्मान प्रिय'],
    careers: ['प्रशासनिक सेवा', 'राजनीति', 'उद्योगपति', 'चिकित्सा (सर्जरी)', 'सरकारी विभाग'],
    healthAdvice: ['हृदय व नेत्रों का विशेष ध्यान रखें। नित्य प्रातः सूर्य नमस्कार करें।'],
    waterBottleColor: 'तांबे का पात्र या सुनहरी/नारंगी बोतल',
  },
  2: {
    number: 2,
    planet: 'चन्द्रमा (Moon)',
    planetEn: 'Moon',
    deity: 'भगवान शिव व माता पार्वती',
    element: 'जल (Water)',
    nature: 'कल्पनाशीलता, सौम्यता, संवेदनशीलता, कूटनीति',
    luckyColors: ['सफेद (White)', 'दूधिया (Cream)', 'हल्का हरा (Light Green)'],
    luckyDays: ['सोमवार (Monday)', 'रविवार (Sunday)'],
    luckyDates: [2, 11, 20, 29],
    luckyGem: 'मोती (Pearl)',
    subGem: 'मूनस्टोन (Moonstone)',
    rudraksha: '२ मुखी रुद्राक्ष',
    yantra: 'श्री चन्द्र यंत्र (Chandra Yantra)',
    mantra: 'ॐ श्रां श्रीं श्रौं सः चन्द्रमसे नमः',
    japaCount: 11000,
    charity: ['चांदी', 'चावल', 'दूध', 'मिश्री', 'सफेद वस्त्र'],
    friendlyNumbers: [1, 2, 3, 5],
    enemyNumbers: [4, 8, 9],
    neutralNumbers: [6, 7],
    traits: ['सहानुभूतिपूर्ण', 'कलात्मक', 'शांतिप्रिय', 'उत्कृष्ट सलाहकार'],
    careers: ['कला व संगीत', 'मनोविज्ञान', 'डेयरी/जल उत्पाद', 'हॉस्पिटैलिटी', 'लेखन'],
    healthAdvice: ['मानसिक तनाव व कफ से बचें। पूर्णिमा को शिवलिंग पर कच्चा दूध अर्पित करें।'],
    waterBottleColor: 'चांदी का पात्र या सफेद/पारदर्शी कांच की बोतल',
  },
  3: {
    number: 3,
    planet: 'बृहस्पति (Jupiter)',
    planetEn: 'Jupiter',
    deity: 'देवगुरु बृहस्पति व भगवान विष्णु',
    element: 'आकाश (Ether)',
    nature: 'ज्ञान, विवेक, आध्यात्म, विस्तार, गुरु तुल्य',
    luckyColors: ['पीला (Yellow)', 'केसरिया (Saffron)', 'स्वर्ण'],
    luckyDays: ['गुरुवार (Thursday)', 'मंगलवार (Tuesday)'],
    luckyDates: [3, 12, 21, 30],
    luckyGem: 'पुखराज (Yellow Sapphire)',
    subGem: 'सुनहला (Citrine)',
    rudraksha: '५ मुखी रुद्राक्ष',
    yantra: 'श्री बृहस्पति यंत्र (Guru Yantra)',
    mantra: 'ॐ ग्रां ग्रीं ग्रौं सः गुरवे नमः',
    japaCount: 19000,
    charity: ['चना दाल', 'हल्दी', 'केला', 'पीले वस्त्र', 'धार्मिक ग्रंथ'],
    friendlyNumbers: [1, 2, 3, 9],
    enemyNumbers: [6],
    neutralNumbers: [4, 5, 7, 8],
    traits: ['ज्ञान पिपासु', 'सत्यवादी', 'परामर्शदाता', 'धार्मिक व उदार'],
    careers: ['शिक्षा व शोध', 'अध्यापन', 'कानून (वकालत)', 'बैंकिंग व वित्त', 'धार्मिक उपदेशक'],
    healthAdvice: ['यकृत (लिवर) व पाचन का ध्यान रखें। अत्यधिक मीठे से परहेज करें।'],
    waterBottleColor: 'पीली कांच की बोतल या पीतल का पात्र',
  },
  4: {
    number: 4,
    planet: 'राहु (Rahu)',
    planetEn: 'Rahu',
    deity: 'माँ सरस्वती व भगवान भैरव',
    element: 'वायु (Air/Wood)',
    nature: 'यथार्थवादी, क्रांतिकारी, संगठक, तकनीकी प्रतिभा',
    luckyColors: ['नीला (Blue)', 'स्लेटी (Grey)', 'खाकी'],
    luckyDays: ['शनिवार (Saturday)', 'रविवार (Sunday)'],
    luckyDates: [4, 13, 22, 31],
    luckyGem: 'गोमेद (Hessonite)',
    subGem: 'टूरमैलीन (Brown Tourmaline)',
    rudraksha: '८ मुखी रुद्राक्ष',
    yantra: 'श्री राहु यंत्र (Rahu Yantra)',
    mantra: 'ॐ भ्रां भ्रीं भ्रौं सः राहवे नमः',
    japaCount: 18000,
    charity: ['उड़द', 'नारियल', 'सिक्का (सिक्का जल प्रवाह)', 'काले तिल', 'कंबल'],
    friendlyNumbers: [1, 5, 6, 7],
    enemyNumbers: [2, 4, 8, 9],
    neutralNumbers: [3],
    traits: ['तकनीकी दिमाग', 'व्यवस्थापक', 'परिश्रमी', 'रूढ़ि विरोधी'],
    careers: ['सॉफ्टवेयर/आईटी', 'अनुसंधान', 'इंजीनियरिंग', 'मीडिया/एविएशन', 'शेयर बाजार'],
    healthAdvice: ['अचानक होने वाली बीमारियों व वायु दोष से सतर्क रहें। नित्य पक्षियों को दाना डालें।'],
    waterBottleColor: 'नीली या ग्रे रंग की कांच की बोतल',
  },
  5: {
    number: 5,
    planet: 'बुध (Mercury)',
    planetEn: 'Mercury',
    deity: 'भगवान गणेश व नारायण',
    element: 'पृथ्वी (Earth)',
    nature: 'बुद्धि, संतुलन, वाणी, व्यापार, चपलता',
    luckyColors: ['हरा (Green)', 'हल्का खाकी', 'पिस्ता'],
    luckyDays: ['बुधवार (Wednesday)', 'शुक्रवार (Friday)'],
    luckyDates: [5, 14, 23],
    luckyGem: 'पन्ना (Emerald)',
    subGem: 'पेरिडॉट / ओनेक्स (Green Onyx)',
    rudraksha: '४ मुखी या १० मुखी रुद्राक्ष',
    yantra: 'श्री बुध यंत्र (Budh Yantra)',
    mantra: 'ॐ ब्रां ब्रीं ब्रौं सः बुधाय नमः',
    japaCount: 9000,
    charity: ['साबुत मूंग', 'हरी सब्जियां', 'कांसे का पात्र', 'हरे वस्त्र'],
    friendlyNumbers: [1, 2, 3, 5, 6],
    enemyNumbers: [],
    neutralNumbers: [4, 7, 8, 9],
    traits: ['कुशल वक्ता', 'व्यापारिक समझ', 'अनुकूलनशीलता', 'हास्य विनोद'],
    careers: ['व्यापार/वाणिज्य', 'मार्केटिंग', 'संचार/पत्रकारिता', 'बैंकिंग', 'सीए/अकाउंटेंसी'],
    healthAdvice: ['स्नायु तंत्र (नर्वस सिस्टम) का ध्यान रखें। गाय को हरी दूर्वा व पालक खिलाएं।'],
    waterBottleColor: 'हरी कांच की बोतल (Green solarized water)',
  },
  6: {
    number: 6,
    planet: 'शुक्र (Venus)',
    planetEn: 'Venus',
    deity: 'माँ महालक्ष्मी',
    element: 'जल/धातु (Metal/Water)',
    nature: 'सौंदर्य, प्रेम, आकर्षण, कला, विलासिता',
    luckyColors: ['चमकदार सफेद (Shining White)', 'गुलाबी (Pink)', 'हल्का नीला'],
    luckyDays: ['शुक्रवार (Friday)', 'बुधवार (Wednesday)'],
    luckyDates: [6, 15, 24],
    luckyGem: 'हीरा (Diamond)',
    subGem: 'ओपल (Opal) / अमेरिकन डायमंड / जरकन',
    rudraksha: '६ मुखी रुद्राक्ष',
    yantra: 'श्री शुक्र यंत्र (Shukra Yantra)',
    mantra: 'ॐ द्रां द्रीं द्रौं सः शुक्राय नमः',
    japaCount: 16000,
    charity: ['खीर', 'चांदी', 'इत्र', 'सफेद रेशमी वस्त्र', 'चावल व कपूर'],
    friendlyNumbers: [1, 4, 5, 6, 7],
    enemyNumbers: [3],
    neutralNumbers: [2, 8, 9],
    traits: ['आकर्षक व्यक्तित्व', 'कला मर्मज्ञ', 'पारिवारिक सुख', 'भौतिक समृद्धि'],
    careers: ['फैशन व सौंदर्य', 'सिनेमा/अभिनय', 'ज्वैलरी', 'इंटीरियर डिजाइन', 'लग्जरी वाहन'],
    healthAdvice: ['मधुमेह व हार्मोनल संतुलन का ध्यान रखें। सुगंधित इत्र का प्रयोग करें।'],
    waterBottleColor: 'पारदर्शी कांच की बोतल या चांदी का गिलास',
  },
  7: {
    number: 7,
    planet: 'केतु (Ketu)',
    planetEn: 'Ketu',
    deity: 'भगवान गणेश जी',
    element: 'धातु/जल (Metal)',
    nature: 'रहस्य, शोध, आध्यात्म, एकांत, अंतर्ज्ञान',
    luckyColors: ['हल्का पीला', 'सफेद', 'हल्का हरा', 'चितकबरा'],
    luckyDays: ['सोमवार (Monday)', 'गुरुवार (Thursday)'],
    luckyDates: [7, 16, 25],
    luckyGem: 'लहसुनिया (Cat’s Eye)',
    subGem: 'टाइगर आई (Tiger Eye)',
    rudraksha: '९ मुखी रुद्राक्ष',
    yantra: 'श्री केतु यंत्र (Ketu Yantra)',
    mantra: 'ॐ स्रां स्रीं स्रौं सः केतवे नमः',
    japaCount: 17000,
    charity: ['काले-सफेद तिल', 'सप्तधान्य', 'कंबल', 'कुत्तों को भोजन'],
    friendlyNumbers: [1, 4, 5, 6],
    enemyNumbers: [2, 9],
    neutralNumbers: [3, 7, 8],
    traits: ['गहरी अंतर्दृष्टि', 'दार्शनिक', 'अध्यात्म प्रिय', 'स्वतंत्र विचार'],
    careers: ['शोध व अनुसंधान', 'दर्शनशास्त्र', 'ज्योतिष/अध्यात्म', 'डेटा एनालिसिस', 'अन्वेषण'],
    healthAdvice: ['मानसिक अशांति से बचें, ध्यान करें। काले-सफेद कुत्ते को रोटी खिलाएं।'],
    waterBottleColor: 'मिट्टी का पात्र या क्रिस्टल बोतल',
  },
  8: {
    number: 8,
    planet: 'शनि (Saturn)',
    planetEn: 'Saturn',
    deity: 'भगवान शनि देव व हनुमान जी',
    element: 'पृथ्वी (Earth)',
    nature: 'कर्मठ, न्यायप्रिय, संघर्ष, धैर्य, चिरस्थायी सफलता',
    luckyColors: ['गहरा नीला (Dark Blue)', 'काला (Black)', 'जामुनी'],
    luckyDays: ['शनिवार (Saturday)', 'बुधवार (Wednesday)'],
    luckyDates: [8, 17, 26],
    luckyGem: 'नीलम (Blue Sapphire)',
    subGem: 'नीली (Iolite) / एमेथिस्ट (Amethyst)',
    rudraksha: '७ मुखी या १४ मुखी रुद्राक्ष',
    yantra: 'श्री शनि यंत्र (Shani Yantra)',
    mantra: 'ॐ प्रां प्रीं प्रौं सः शनैश्चराय नमः',
    japaCount: 23000,
    charity: ['सरसों का तेल', 'लोहा', 'काले उड़द', 'काले तिल', 'जूते/छाता'],
    friendlyNumbers: [4, 5, 6],
    enemyNumbers: [1, 2, 9],
    neutralNumbers: [3, 7, 8],
    traits: ['कठोर परिश्रमी', 'न्यायी', 'गंभीर', 'धैर्यवान व संगठक'],
    careers: ['न्यायपालिका व वकालत', 'रियल एस्टेट', 'खनन/ऑयल/स्टील', 'श्रम विभाग', 'उद्योग'],
    healthAdvice: ['जोड़ों का दर्द व वायु विकार से बचें। शनिवार को सरसों के तेल का दीपक जलाएं।'],
    waterBottleColor: 'गहरे नीले रंग की बोतल या लोहे/स्टील पात्र',
  },
  9: {
    number: 9,
    planet: 'मंगल (Mars)',
    planetEn: 'Mars',
    deity: 'श्री हनुमान जी व कार्तिकेय',
    element: 'अग्नि (Fire)',
    nature: 'ऊर्जा, पराक्रम, गति, सेनापति, परोपकार',
    luckyColors: ['लाल (Red)', 'गुलाबी', 'केसरिया (Saffron)'],
    luckyDays: ['मंगलवार (Tuesday)', 'रविवार (Sunday)'],
    luckyDates: [9, 18, 27],
    luckyGem: 'मूंगा (Red Coral)',
    subGem: 'कार्नेलियन (Red Carnelian)',
    rudraksha: '३ मुखी रुद्राक्ष',
    yantra: 'श्री मंगल यंत्र (Mangal Yantra)',
    mantra: 'ॐ क्रां क्रीं क्रौं सः भौमाय नमः',
    japaCount: 10000,
    charity: ['तांबा', 'मसूर दाल', 'लाल चंदन', 'गुड़', 'सिंदूर'],
    friendlyNumbers: [1, 2, 3, 5],
    enemyNumbers: [4, 8],
    neutralNumbers: [6, 7, 9],
    traits: ['साहसी', 'उत्साही', 'मददगार', 'सैनिक वृत्ति व दृढ़'],
    careers: ['सेना व पुलिस', 'खेलकूद', 'सर्जरी/चिकित्सा', 'इंजीनियरिंग', 'अग्नि व विद्युत उद्योग'],
    healthAdvice: ['रक्तचाप व क्रोध पर नियंत्रण रखें। मंगलवार को हनुमान चालीसा का पाठ करें।'],
    waterBottleColor: 'तांबे का पात्र या लाल/केसरिया बोतल',
  },
};

// Chaldean letter values
export const CHALDEAN_MAP: Record<string, number> = {
  A: 1, I: 1, J: 1, Q: 1, Y: 1,
  B: 2, K: 2, R: 2,
  C: 3, G: 3, L: 3, S: 3,
  D: 4, M: 4, T: 4,
  E: 5, H: 5, N: 5, X: 5,
  U: 6, V: 6, W: 6,
  O: 7, Z: 7,
  F: 8, P: 8,
};

// Pythagorean letter values
export const PYTHAGOREAN_MAP: Record<string, number> = {
  A: 1, J: 1, S: 1,
  B: 2, K: 2, T: 2,
  C: 3, L: 3, U: 3,
  D: 4, M: 4, V: 4,
  E: 5, N: 5, W: 5,
  F: 6, O: 6, X: 6,
  G: 7, P: 7, Y: 7,
  H: 8, Q: 8, Z: 8,
  I: 9, R: 9,
};

/** Reduce any number to single digit (1-9) */
export function reduceToSingleDigit(num: number): number {
  while (num > 9) {
    let sum = 0;
    while (num > 0) {
      sum += num % 10;
      num = Math.floor(num / 10);
    }
    num = sum;
  }
  return num === 0 ? 9 : num;
}

/** Calculate Mulank (Root / Psychic Number) from day of birth */
export function calculateMulank(day: number): number {
  return reduceToSingleDigit(day);
}

/** Calculate Bhagyank (Destiny / Life Path Number) from full Date of Birth */
export function calculateBhagyank(day: number, month: number, year: number): number {
  const sum = day + month + year;
  return reduceToSingleDigit(sum);
}

/** Calculate Name Number (Namank) using Chaldean or Pythagorean */
export function calculateNamank(
  name: string,
  system: 'chaldean' | 'pythagorean' = 'chaldean'
): { compound: number; single: number; breakdown: { char: string; val: number }[] } {
  const map = system === 'chaldean' ? CHALDEAN_MAP : PYTHAGOREAN_MAP;
  const upper = name.toUpperCase().replace(/[^A-Z]/g, '');
  const breakdown: { char: string; val: number }[] = [];
  let compound = 0;

  for (const ch of upper) {
    const val = map[ch] || 0;
    breakdown.push({ char: ch, val });
    compound += val;
  }

  const single = compound > 0 ? reduceToSingleDigit(compound) : 1;
  return { compound, single, breakdown };
}

/** Calculate Kua Number */
export function calculateKuaNumber(year: number, gender: 'male' | 'female' = 'male'): number {
  let yrSum = reduceToSingleDigit(year);
  let kua = 0;
  if (gender === 'male') {
    kua = 11 - yrSum;
    if (kua === 5) kua = 2; // In Feng Shui, male 5 becomes 2
  } else {
    kua = yrSum + 4;
    if (kua === 5) kua = 8; // In Feng Shui, female 5 becomes 8
  }
  return reduceToSingleDigit(kua);
}

/** Calculate Personal Year Number */
export function calculatePersonalYear(day: number, month: number, targetYear: number = new Date().getFullYear()): {
  yearNum: number;
  theme: string;
  themeGu: string;
  advice: string;
  adviceGu: string;
} {
  const yearSum = reduceToSingleDigit(targetYear);
  const yearNum = reduceToSingleDigit(day + month + yearSum);

  const forecast: Record<number, { theme: string; themeGu: string; advice: string; adviceGu: string }> = {
    1: {
      theme: 'नई शुरुआत, नए संकल्प, स्वतंत्रता और नेतृत्व का वर्ष',
      themeGu: 'નવી શરૂઆત, નવા સંકલ્પો, સ્વતંત્રતા અને નેતૃત્વનું વર્ષ',
      advice: 'नया व्यवसाय, नया कार्य या नौकरी बदलने के लिए सर्वोत्तम वर्ष। सक्रिय रहें और पहल करें।',
      adviceGu: 'નવો વ્યવસાય, નવું કાર્ય કે કારકિર્દી બદલવા માટે ઉત્તમ વર્ષ. સક્રિય રહો.',
    },
    2: {
      theme: 'धैर्य, सहयोग, साझेदारी व संबंधों को संवारने का वर्ष',
      themeGu: 'ધીરજ, સહયોગ, ભાગીદારી અને સંબંધો મજબૂત કરવાનું વર્ષ',
      advice: 'जल्दबाजी से बचें। सामूहिक कार्य और कूटनीति से काम लें। भावनात्मक संतुलन रखें।',
      adviceGu: 'ઉતાવળ ટાળો. સામૂહિક કાર્ય અને સમજદારીથી કામ લો.',
    },
    3: {
      theme: 'सृजनशीलता, सामाजिक विस्तार, ज्ञान व आर्थिक उन्नति',
      themeGu: 'સર્જનાત્મકતા, સામાજિક વિસ્તાર, જ્ઞાન અને આર્થિક પ્રગતિ',
      advice: 'अपनी रचनात्मक प्रतिभा दिखाएं। नए मित्र व संपर्क बनेंगे। आत्मविश्वास से कार्य करें।',
      adviceGu: 'નવી પ્રતિભા ઉજાગર કરો. આત્મવિશ્વાસથી આગળ વધો.',
    },
    4: {
      theme: 'कठिन परिश्रम, अनुशासन, नींव मजबूत करने और व्यवस्था का वर्ष',
      themeGu: 'કઠિન પરિશ્રમ, શિસ્ત, મજબૂત પાયો અને વ્યવસ્થાનું વર્ષ',
      advice: 'शॉर्टकट से बचें। दीर्घकालिक लक्ष्यों पर ध्यान दें और स्वास्थ्य की अनदेखी न करें।',
      adviceGu: 'શોર્ટકટ ટાળો. લાંબા ગાળાના લક્ષ્યો પર ધ્યાન આપો.',
    },
    5: {
      theme: 'परिवर्तन, रोमांच, यात्रा, स्वतंत्रता और नए अवसरों का वर्ष',
      themeGu: 'પરિવર્તન, રોમાંચ, યાત્રા, સ્વતંત્રતા અને નવી તકોનું વર્ષ',
      advice: 'बदलावों को खुले दिल से अपनाएं। यात्रा के योग बनेंगे। एकाग्रता बनाए रखें।',
      adviceGu: 'બદલાવોને સ્વીકારો. નવી યાત્રા અને ઉત્સાહ રહેશે.',
    },
    6: {
      theme: 'परिवार, प्रेम, दांपत्य सुख, घर की सजावट और जिम्मेदारी का वर्ष',
      themeGu: 'પરિવાર, પ્રેમ, દાંપત્ય સુખ, ગૃહ નિર્માણ અને જવાબદારીનું વર્ષ',
      advice: 'पारिवारिक सुख व संबंधों पर ध्यान दें। घर या वाहन क्रय के लिए अनुकूल समय है।',
      adviceGu: 'પરિવાર અને સંબંધોને પ્રાથમિકતા આપો. શુભ માંગલિક કાર્યો થશે.',
    },
    7: {
      theme: 'आत्म-मंथन, शोध, आध्यात्मिक उन्नति और ज्ञानार्जन का वर्ष',
      themeGu: 'આત્મ-મંથન, સંશોધન, આધ્યાત્મિક ઉન્નતિ અને જ્ઞાનનું વર્ષ',
      advice: 'आंतरिक शांति के लिए समय निकालें। बड़े आर्थिक जोखिम से बचें और ध्यान-साधना करें।',
      adviceGu: 'શાંતિ અને એકાગ્રતા રાખો. આર્થિક જોખમ ટાળો.',
    },
    8: {
      theme: 'कर्म फल, अधिकार, पदोन्नति, धन लाभ और भौतिक सफलता का वर्ष',
      themeGu: 'કર્મ ફળ, અધિકાર, પદોન્નતિ, ધન પ્રાપ્તિ અને સફળતાનું વર્ષ',
      advice: 'अथक परिश्रम का पूर्ण फल मिलेगा। न्यायप्रिय और निष्पक्ष रहें। वित्तीय प्रबंधन रखें।',
      adviceGu: 'પરિશ્રમનું શ્રેષ્ઠ ફળ મળશે. આર્થિક યોજનાઓ સફળ થશે.',
    },
    9: {
      theme: 'पूर्णता, विसर्जन, दान-पुण्य, परोपकार व अगले चक्र की तैयारी का वर्ष',
      themeGu: 'પૂર્ણતા, મુક્તિ, દાન-પુણ્ય, પરોપકાર અને નવા ચક્રની તૈયારીનું વર્ષ',
      advice: 'पुरानी समस्याओं को समाप्त करें। दूसरों की सहायता करें और क्षमा भाव रखें।',
      adviceGu: 'જૂની ગૂંચવણો દૂર કરો. બીજાની મદદ કરો અને ક્ષમા રાખો.',
    },
  };

  const f = forecast[yearNum] || forecast[1];
  return { yearNum, ...f };
}

/** Loshu Grid Planes */
export interface LoshuPlane {
  name: string;
  nameGu: string;
  numbers: number[];
  isComplete: boolean;
  presentCount: number;
  significance: string;
  significanceGu: string;
}

export interface LoshuGridResult {
  matrix: {
    row1: number[][]; // [ [4], [9], [2] ]
    row2: number[][]; // [ [3], [5], [7] ]
    row3: number[][]; // [ [8], [1], [6] ]
  };
  counts: Record<number, number>; // How many times each digit 1-9 appears
  missingNumbers: number[];
  completedPlanes: LoshuPlane[];
  incompletePlanes: LoshuPlane[];
  goldenRajYoga: boolean; // 4-5-6
  silverRajYoga: boolean; // 2-5-8
}

/** Build Loshu Grid from Date of Birth + Mulank + Bhagyank */
export function calculateLoshuGrid(day: number, month: number, year: number): LoshuGridResult {
  const mulank = calculateMulank(day);
  const bhagyank = calculateBhagyank(day, month, year);

  // Extract all digits from birthdate components
  const allDigitsStr = `${day}${month}${year}${mulank}${bhagyank}`;
  const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 };

  for (const ch of allDigitsStr) {
    const digit = parseInt(ch, 10);
    if (digit >= 1 && digit <= 9) {
      counts[digit] = (counts[digit] || 0) + 1;
    }
  }

  const missingNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter((n) => counts[n] === 0);

  // Check 8 classical planes
  const planesRaw: { name: string; nameGu: string; numbers: number[]; sig: string; sigGu: string }[] = [
    {
      name: 'मानसिक तल (Mental Plane)',
      nameGu: 'માનસિક તલ (Mental Plane)',
      numbers: [4, 9, 2],
      sig: 'तीव्र स्मृति, बुद्धिमत्ता, उच्च विश्लेषण क्षमता व निर्णय शक्ति',
      sigGu: 'તીવ્ર સ્મરણ શક્તિ, બુદ્ધિપ્રતિભા અને શ્રેષ્ઠ વિશ્લેષણ',
    },
    {
      name: 'भावनात्मक तल (Emotional/Spiritual Plane)',
      nameGu: 'ભાવનાત્મક તલ (Emotional Plane)',
      numbers: [3, 5, 7],
      sig: 'सहानुभूति, अंतर्ज्ञान, आध्यात्मिक संवेदनशीलता व संबंध निर्वहन',
      sigGu: 'સહાનુભૂતિ, આત્મીયતા, ઊંડી સંવેદના અને આધ્યાત્મિક જ્ઞાન',
    },
    {
      name: 'व्यावहारिक तल (Practical/Material Plane)',
      nameGu: 'વ્યવહારિક તલ (Practical Plane)',
      numbers: [8, 1, 6],
      sig: 'व्यावहारिक चातुर्य, भौतिक सफलता, व्यवस्थापन व कर्मठता',
      sigGu: 'વ્યવહાર કુશળતા, ભૌતિક સંપત્તિ અને કાર્યસિદ્ધિ',
    },
    {
      name: 'विचार तल (Thought Plane)',
      nameGu: 'વિચાર તલ (Thought Plane)',
      numbers: [4, 3, 8],
      sig: 'दूरदर्शिता, योजना निर्माण, योजनाबद्ध दृष्टि व बौद्धिक गहराई',
      sigGu: 'દૂરદર્શિતા, યોજના ઘડતર અને ઊંડી બૌદ્ધિક સમજ',
    },
    {
      name: 'संकल्प तल (Will Power Plane)',
      nameGu: 'સંકલ્પ તલ (Will Power Plane)',
      numbers: [9, 5, 1],
      sig: 'अदम्य इच्छाशक्ति, लक्ष्य सिद्धि, पराक्रम व नेतृत्व सामर्थ्य',
      sigGu: 'અડગ મનોબળ, લક્ષ્ય સિદ્ધિ અને નેતૃત્વ ક્ષમતા',
    },
    {
      name: 'कर्म तल (Action Plane)',
      nameGu: 'કર્મ તલ (Action Plane)',
      numbers: [2, 7, 6],
      sig: 'योजनाओं को क्रियान्वित करना, त्वरित निर्णय व सक्रियता',
      sigGu: 'યોજનાઓનું સચોટ અમલીકરણ અને સક્રિય કાર્યશૈલી',
    },
    {
      name: 'स्वर्ण राजयोग (Golden Raj Yoga)',
      nameGu: 'સ્વર્ણ રાજયોગ (Golden Raj Yoga)',
      numbers: [4, 5, 6],
      sig: 'महालक्ष्मी कृपा, अकूत संपत्ति, मान-सम्मान व जीवन में सर्वतोमुखी समृद्धि',
      sigGu: 'મહાલક્ષ્મી કૃપા, અખૂટ ધન-સંપત્તિ અને સર્વોચ્ચ સમૃદ્ધિ',
    },
    {
      name: 'सिल्वर राजयोग (Silver / Earth Element Yoga)',
      nameGu: 'સિલ્વર રાજયોગ (Silver Earth Yoga)',
      numbers: [2, 5, 8],
      sig: 'भूमि, भवन, अचल संपत्ति, स्थायी स्थिरता व दीर्घकालीन समृद्धि',
      sigGu: 'જમીન-મકાન, સ્થાવર મિલકત અને સ્થાયી આર્થિક સુરક્ષા',
    },
  ];

  const completedPlanes: LoshuPlane[] = [];
  const incompletePlanes: LoshuPlane[] = [];

  for (const p of planesRaw) {
    const present = p.numbers.filter((num) => counts[num] > 0);
    const isComplete = present.length === p.numbers.length;
    const planeObj: LoshuPlane = {
      name: p.name,
      nameGu: p.nameGu,
      numbers: p.numbers,
      isComplete,
      presentCount: present.length,
      significance: p.sig,
      significanceGu: p.sigGu,
    };
    if (isComplete) {
      completedPlanes.push(planeObj);
    } else {
      incompletePlanes.push(planeObj);
    }
  }

  // Canonical Loshu placement:
  // [4, 9, 2]
  // [3, 5, 7]
  // [8, 1, 6]
  const matrix = {
    row1: [
      Array(counts[4]).fill(4),
      Array(counts[9]).fill(9),
      Array(counts[2]).fill(2),
    ],
    row2: [
      Array(counts[3]).fill(3),
      Array(counts[5]).fill(5),
      Array(counts[7]).fill(7),
    ],
    row3: [
      Array(counts[8]).fill(8),
      Array(counts[1]).fill(1),
      Array(counts[6]).fill(6),
    ],
  };

  const goldenRajYoga = counts[4] > 0 && counts[5] > 0 && counts[6] > 0;
  const silverRajYoga = counts[2] > 0 && counts[5] > 0 && counts[8] > 0;

  return {
    matrix,
    counts,
    missingNumbers,
    completedPlanes,
    incompletePlanes,
    goldenRajYoga,
    silverRajYoga,
  };
}

/** Missing number remedies */
export const MISSING_NUMBER_REMEDIES: Record<number, { title: string; titleGu: string; remedies: string[]; remediesGu: string[] }> = {
  1: {
    title: 'अंक १ का अभाव (आत्मविश्वास व पहचान की कमी)',
    titleGu: 'અંક ૧ નો અભાવ (આત્મવિશ્વાસ અને ઓળખની કમી)',
    remedies: [
      'नित्य प्रातः तांबे के लोटे से सूर्य देव को जल (अर्घ्य) अर्पित करें।',
      'घर की उत्तर दिशा को सदैव स्वच्छ व खुला रखें; वहां पानी का छोटा फव्वारा या जल कलश रखें।',
      'रविवार को लाल वस्त्र या तांबे की वस्तु का दान करें।',
    ],
    remediesGu: [
      'રોજ સવારે તાંબાના લોટાથી સૂર્યદેવને જળ અર્ઘ્ય આપો.',
      'ઘરની ઉત્તર દિશા સ્વચ્છ રાખો; ત્યાં જળનું પાત્ર કે કળશ સ્થાપિત કરો.',
      'રવિવારે લાલ વસ્ત્ર કે તાંબાનું દાન કરો.',
    ],
  },
  2: {
    title: 'अंक २ का अभाव (भावनात्मक अस्थिरता व संबंध में बाधा)',
    titleGu: 'અંક ૨ નો અભાવ (ભાવનાત્મક અસ્થિરતા અને સંબંધોમાં કમી)',
    remedies: [
      'माता अथवा मातृ-तुल्य स्त्रियों के चरण स्पर्श कर नित्य आशीर्वाद लें।',
      'चांदी का चौकोर टुकड़ा अपने पर्स में रखें या चांदी की अंगूठी धारण करें।',
      'घर के नैऋत्य कोण (दक्षिण-पश्चिम) में दो क्रिस्टल हंस या क्वार्ट्ज रखें।',
    ],
    remediesGu: [
      'માતાના ચરણ સ્પર્શ કરી રોજ આશીર્વાદ લો.',
      'ચાંદીનો ચોરસ ટુકડો પર્સમાં રાખો અથવા ચાંદીની વીંટી પહેરો.',
      'દક્ષિણ-પશ્ચિમ ખૂણામાં બે ક્રિસ્ટલ હંસ અથવા ક્વાર્ટ્ઝ રાખો.',
    ],
  },
  3: {
    title: 'अंक ३ का अभाव (ज्ञान, गुरु कृपा व विस्तार में कमी)',
    titleGu: 'અંક ૩ નો અભાવ (જ્ઞાન, ગુરુકૃપા અને વિકાસમાં અવરોધ)',
    remedies: [
      'गुरुजनों, विद्वानों व संतों का आदर करें और गुरुवार को विष्णु सहस्रनाम पढ़ें।',
      'घर के ईशान कोण (उत्तर-पूर्व) में तुलसी का पौधा लगाएं व जल दें।',
      'पीले रंग की कलम का प्रयोग करें व गले में तुलसी अथवा हल्दी की माला धारण करें।',
    ],
    remediesGu: [
      'ગુરુજનો અને વડીલોનું સન્માન કરો; ગુરુવારે વિષ્ણુ સહસ્રનામ વાંચો.',
      'ઘરના ઈશાન ખૂણામાં તુલસીનો છોડ વાવો.',
      'ગળામાં તુલસી કે હળદરની માળા ધારણ કરો.',
    ],
  },
  4: {
    title: 'अंक ४ का अभाव (धन संचय व अनुशासन में कठिनाई)',
    titleGu: 'અંક ૪ નો અભાવ (બચત અને શિસ્તમાં મુશ્કેલી)',
    remedies: [
      'घर के आग्नेय कोण (दक्षिण-पूर्व) में लकड़ी की विंड चाइम (Wind Chime) लगाएं।',
      'धन खर्च करने में अनुशासन रखें और हर महीने निश्चित राशि की बचत करें।',
      'रुद्राक्ष की माला अथवा हरे रंग का अवेंट्यूरिन ब्रेसलेट धारण करें।',
    ],
    remediesGu: [
      'ઘરના અગ્નિ ખૂણામાં લાકડાની વિન્ડ ચાઈમ લગાવો.',
      'પૈસાના ખર્ચમાં શિસ્ત રાખો અને નિયમિત બચત કરો.',
      'રુદ્રાક્ષ કે ગ્રીન એવેન્ચ્યુરિન બ્રેસલેટ પહેરો.',
    ],
  },
  5: {
    title: 'अंक ५ का अभाव (संतुलन, संवाद व निर्णय शक्ति का अभाव)',
    titleGu: 'અંક ૫ નો અભાવ (સંતુલન, સંવાદ અને વાણીમાં દોષ)',
    remedies: [
      'घर के मध्य भाग (ब्रह्मस्थान) को एकदम खुला, स्वच्छ और भार-मुक्त रखें।',
      'बुधवार को गाय को हरा चारा अथवा पक्षियों को मूंग दाल खिलाएं।',
      'हरी कांच की बोतल में जल भरकर धूप में रखें और उस जल का सेवन करें।',
    ],
    remediesGu: [
      'ઘરના બ્રહ્મસ્થાન (મધ્ય ભાગ) ને સાફ અને વજન વગરનું રાખો.',
      'બુધવારે ગાયને લીલું ઘાસ કે પક્ષીઓને મગ ખવડાવો.',
      'લીલી કાચની બોટલમાં સૂર્યપ્રકાશિત જળ પીવો.',
    ],
  },
  6: {
    title: 'अंक ६ का अभाव (भौतिक सुख, विलासिता व आकर्षण की कमी)',
    titleGu: 'અંક ૬ નો અભાવ (ભૌતિક સુખ, લક્ઝરી અને વૈભવમાં કમી)',
    remedies: [
      'घर के वायव्य कोण (उत्तर-पश्चिम) में धातु की ६ रॉड वाली विंड चाइम लगाएं।',
      'चांदी का ब्रेसलेट अथवा कड़ा धारण करें व सुगंधित इत्र का नित्य प्रयोग करें।',
      'शुक्रवार को माँ महालक्ष्मी की आरती करें व कन्याओं को खीर खिलाएं।',
    ],
    remediesGu: [
      'ઉત્તર-પશ્ચિમ ખૂણામાં ધાતુની વિન્ડ ચાઈમ લગાવો.',
      'ચાંદીનું કડું પહેરો અને સુગંધિત અત્તર લગાવો.',
      'શુક્રવારે મહાલક્ષ્મી પૂજા કરો અને કન્યાઓને ખીર ખવડાવો.',
    ],
  },
  7: {
    title: 'अंक ७ का अभाव (संतान सुख, एकाग्रता व शोध क्षमता में कमी)',
    titleGu: 'અંક ૭ નો અભાવ (સંતાન સુખ, એકાગ્રતા અને આધ્યાત્મમાં કમી)',
    remedies: [
      'घर की पश्चिम दिशा में सफेद या धातु की वस्तुएं रखें।',
      'नियमित रूप से भगवान गणेश जी को दूर्वा अर्पित करें और संकटनाशन स्तोत्र पढ़ें।',
      'काले-सफेद कुत्ते को रोटी दें और आध्यात्मिक ध्यान करें।',
    ],
    remediesGu: [
      'ઘરની પશ્ચિમ દિશામાં ધાતુની વસ્તુઓ રાખો.',
      'ગણેશજીને દૂર્વા અર્પણ કરો અને સંકટનાશન સ્તોત્ર વાંચો.',
      'કુતરાને રોટલી ખવડાવો અને ધ્યાન કરો.',
    ],
  },
  8: {
    title: 'अंक ८ का अभाव (दृढ़ता, संपत्ति व स्थिरता में बाधा)',
    titleGu: 'અંક ૮ નો અભાવ (સ્થિરતા, મિલકત અને પરિશ્રમમાં અડચણ)',
    remedies: [
      'घर के ईशान कोण में क्रिस्टल या नीले रंग का पिरामिड रखें।',
      'शनिवार को पीपल के वृक्ष के नीचे सरसों के तेल का दीपक प्रज्वलित करें।',
      'श्रमजीवियों व जरूरतमंदों की सहायता करें और शनिवार को काले तिल का दान करें।',
    ],
    remediesGu: [
      'ઘરના ઈશાન ખૂણામાં ક્રિસ્ટલ પિરામિડ રાખો.',
      'શનિવારે પીપળા નીચે સરસવના તેલનો દીવો કરો.',
      'ગરીબો અને શ્રમિકોને મદદ કરો.',
    ],
  },
  9: {
    title: 'अंक ९ का अभाव (ऊर्जा, उत्साह, सामाजिक प्रतिष्ठा व शौर्य की कमी)',
    titleGu: 'અંક ૯ નો અભાવ (ઊર્જા, ઉત્સાહ, સામાજિક પ્રતિષ્ઠામાં કમી)',
    remedies: [
      'घर की दक्षिण दिशा में लाल बल्ब अथवा तांबे का सूर्य यंत्र लगाएं।',
      'नित्य हनुमान चालीसा का पाठ करें और सुंदरकांड सुनें।',
      'मंगलवार को मसूर की दाल या गुड़ का दान करें और लाल कलावा बांधें।',
    ],
    remediesGu: [
      'ઘરની દક્ષિણ દિશામાં લાલ પ્રકાશ કે તાંબાનું સૂર્ય યંત્ર લગાવો.',
      'રોજ હનુમાન ચાલીસા વાંચો.',
      'મંગળવારે ગોળ કે મસૂર દાળનું દાન કરો.',
    ],
  },
};

/** Evaluate Mobile / Vehicle Number Compatibility */
export function analyzeNumberCompatibility(
  inputNumber: string,
  userMulank: number,
  userBhagyank: number
): {
  totalSum: number;
  singleDigit: number;
  rating: number; // 0 to 100
  verdict: 'excellent' | 'favorable' | 'neutral' | 'avoid';
  verdictHi: string;
  verdictGu: string;
  verdictEn: string;
  advice: string;
  adviceGu: string;
  adviceEn: string;
} {
  const digits = inputNumber.replace(/[^0-9]/g, '');
  if (!digits) {
    return {
      totalSum: 0,
      singleDigit: 0,
      rating: 50,
      verdict: 'neutral',
      verdictHi: 'संख्या दर्ज करें',
      verdictGu: 'નંબર દાખલ કરો',
      verdictEn: 'Enter digits',
      advice: 'कृपया मान्य संख्या दर्ज करें।',
      adviceGu: 'કૃપા કરીને માન્ય નંબર દાખલ કરો.',
      adviceEn: 'Please enter valid digits.',
    };
  }

  let totalSum = 0;
  for (const ch of digits) {
    totalSum += parseInt(ch, 10);
  }
  const singleDigit = reduceToSingleDigit(totalSum);

  const mulankInfo = NUMBER_DATA[userMulank] || NUMBER_DATA[1];
  const isFriendly = mulankInfo.friendlyNumbers.includes(singleDigit);
  const isEnemy = mulankInfo.enemyNumbers.includes(singleDigit);

  let rating = 65;
  let verdict: 'excellent' | 'favorable' | 'neutral' | 'avoid' = 'neutral';

  if (singleDigit === userMulank || singleDigit === userBhagyank) {
    rating = 95;
    verdict = 'excellent';
  } else if (isFriendly) {
    rating = 85;
    verdict = 'favorable';
  } else if (isEnemy) {
    rating = 35;
    verdict = 'avoid';
  } else {
    rating = 60;
    verdict = 'neutral';
  }

  // Penalty for negative combinations like excessive 4s or 8s if enemy
  const count4 = (digits.match(/4/g) || []).length;
  const count8 = (digits.match(/8/g) || []).length;
  if ((userMulank === 1 || userMulank === 2) && (count8 >= 2 || count4 >= 3)) {
    rating = Math.max(25, rating - 20);
    verdict = 'avoid';
  }

  const verdictHi =
    verdict === 'excellent'
      ? 'अति शुभ व फलदायी (उत्कृष्ट)'
      : verdict === 'favorable'
      ? 'अनुकूल व शुभ'
      : verdict === 'avoid'
      ? 'प्रतिकूल (बदलाव की सलाह)'
      : 'सामान्य (तटस्थ)';

  const verdictGu =
    verdict === 'excellent'
      ? 'અતિ શુભ અને ફળદાયી (ઉત્કૃષ્ટ)'
      : verdict === 'favorable'
      ? 'અનુકૂળ અને લાભકારી'
      : verdict === 'avoid'
      ? 'પ્રતિકૂળ (બદલવાની સલાહ)'
      : 'સામાન્ય (તટસ્થ)';

  const verdictEn =
    verdict === 'excellent'
      ? 'Highly Auspicious (Excellent)'
      : verdict === 'favorable'
      ? 'Harmonious & Favorable'
      : verdict === 'avoid'
      ? 'Challenging / Incompatible'
      : 'Neutral';

  const advice =
    verdict === 'excellent' || verdict === 'favorable'
      ? `इस संख्या का योग अंक ${singleDigit} (${NUMBER_DATA[singleDigit]?.planetEn}) है, जो आपके मूलांक ${userMulank} के साथ पूर्ण सामंजस्य में है। यह व्यापार, सुरक्षा और उन्नति देगा।`
      : verdict === 'avoid'
      ? `इस संख्या का योग अंक ${singleDigit} (${NUMBER_DATA[singleDigit]?.planetEn}) आपके मूलांक ${userMulank} का विरोधी अंक है। संभव हो तो इस नंबर को अंक ${mulankInfo.friendlyNumbers.join(', ')} के योग वाले नंबर से बदलें।`
      : `इस संख्या का योग अंक ${singleDigit} तटस्थ है। दैनिक उपयोग में कोई बड़ा दोष नहीं है।`;

  const adviceGu =
    verdict === 'excellent' || verdict === 'favorable'
      ? `આ નંબરનો કુલ યોગ અંક ${singleDigit} (${NUMBER_DATA[singleDigit]?.planetEn}) છે, જે તમારા મૂળાંક ${userMulank} સાથે સંપૂર્ણ અનુકૂળ છે. આ પ્રગતિ અને સુરક્ષા આપશે.`
      : verdict === 'avoid'
      ? `આ નંબરનો યોગ અંક ${singleDigit} તમારા મૂળાંક ${userMulank} નો શત્રુ અંક છે. શક્ય હોય તો અંક ${mulankInfo.friendlyNumbers.join(', ')} ના સરવાળા વાળો નંબર પસંદ કરો.`
      : `આ નંબરનો યોગ અંક ${singleDigit} તટસ્થ છે. દૈનિક ઉપયોગ માટે સામાન્ય છે.`;

  const adviceEn =
    verdict === 'excellent' || verdict === 'favorable'
      ? `The reduced sum of this number is ${singleDigit} (${NUMBER_DATA[singleDigit]?.planetEn}), which is highly compatible with your Root Number ${userMulank}. Excellent for progress and safety.`
      : verdict === 'avoid'
      ? `The reduced sum is ${singleDigit} (${NUMBER_DATA[singleDigit]?.planetEn}), which is in conflict with your Root Number ${userMulank}. Consider using friendly numbers like ${mulankInfo.friendlyNumbers.join(', ')}.`
      : `The reduced sum is ${singleDigit}, which is neutral with your Root Number. Safe for routine use.`;

  return {
    totalSum,
    singleDigit,
    rating,
    verdict,
    verdictHi,
    verdictGu,
    verdictEn,
    advice,
    adviceGu,
    adviceEn,
  };
}

/** Authentic Navagraha Sacred Yantra Grids (3x3 Magic Squares) */
export const NAVAGRAHA_YANTRAS: Record<number, { name: string; nameGu: string; nameEn: string; grid: number[][]; total: number }> = {
  1: {
    name: 'श्री सूर्य यंत्र (Surya Yantra)',
    nameGu: 'શ્રી સૂર્ય યંત્ર',
    nameEn: 'Shri Surya Yantra',
    grid: [
      [6, 1, 8],
      [7, 5, 3],
      [2, 9, 4],
    ],
    total: 15,
  },
  2: {
    name: 'श्री चन्द्र यंत्र (Chandra Yantra)',
    nameGu: 'શ્રી ચંદ્ર યંત્ર',
    nameEn: 'Shri Chandra Yantra',
    grid: [
      [7, 2, 9],
      [8, 6, 4],
      [3, 10, 5],
    ],
    total: 18,
  },
  3: {
    name: 'श्री बृहस्पति यंत्र (Guru Yantra)',
    nameGu: 'શ્રી ગુરુ યંત્ર',
    nameEn: 'Shri Brihaspati (Guru) Yantra',
    grid: [
      [10, 5, 12],
      [11, 9, 7],
      [6, 13, 8],
    ],
    total: 27,
  },
  4: {
    name: 'श्री राहु यंत्र (Rahu Yantra)',
    nameGu: 'શ્રી રાહુ યંત્ર',
    nameEn: 'Shri Rahu Yantra',
    grid: [
      [13, 8, 15],
      [14, 12, 10],
      [9, 16, 11],
    ],
    total: 36,
  },
  5: {
    name: 'श्री बुध यंत्र (Budh Yantra)',
    nameGu: 'શ્રી બુધ યંત્ર',
    nameEn: 'Shri Budh Yantra',
    grid: [
      [9, 4, 11],
      [10, 8, 6],
      [5, 12, 7],
    ],
    total: 24,
  },
  6: {
    name: 'श्री शुक्र यंत्र (Shukra Yantra)',
    nameGu: 'શ્રી શુક્ર યંત્ર',
    nameEn: 'Shri Shukra Yantra',
    grid: [
      [11, 6, 13],
      [12, 10, 8],
      [7, 14, 9],
    ],
    total: 30,
  },
  7: {
    name: 'श्री केतु यंत्र (Ketu Yantra)',
    nameGu: 'શ્રી કેતુ યંત્ર',
    nameEn: 'Shri Ketu Yantra',
    grid: [
      [14, 9, 16],
      [15, 13, 11],
      [10, 17, 12],
    ],
    total: 39,
  },
  8: {
    name: 'श्री शनि यंत्र (Shani Yantra)',
    nameGu: 'શ્રી શનિ યંત્ર',
    nameEn: 'Shri Shani Yantra',
    grid: [
      [12, 7, 14],
      [13, 11, 9],
      [8, 15, 10],
    ],
    total: 33,
  },
  9: {
    name: 'श्री मंगल यंत्र (Mangal Yantra)',
    nameGu: 'શ્રી મંગળ યંત્ર',
    nameEn: 'Shri Mangal Yantra',
    grid: [
      [8, 3, 10],
      [9, 7, 5],
      [4, 11, 6],
    ],
    total: 21,
  },
};

/** Suggest Name Spelling Optimization */
export function suggestNameCorrections(
  currentName: string,
  userMulank: number,
  userBhagyank: number,
  system: 'chaldean' | 'pythagorean' = 'chaldean'
): {
  currentSingle: number;
  currentCompound: number;
  isHarmonious: boolean;
  idealNumbers: number[];
  suggestions: {
    modifiedName: string;
    compound: number;
    single: number;
    notes: string;
    notesGu: string;
    notesEn: string;
  }[];
} {
  const currentCalc = calculateNamank(currentName, system);
  const mulankData = NUMBER_DATA[userMulank] || NUMBER_DATA[1];
  const idealNumbers = [1, 3, 5, 6].filter(
    (n) => mulankData.friendlyNumbers.includes(n) || n === userMulank || n === userBhagyank
  );
  if (idealNumbers.length === 0) idealNumbers.push(1, 5, 6);

  const isHarmonious = idealNumbers.includes(currentCalc.single);

  const suggestions: {
    modifiedName: string;
    compound: number;
    single: number;
    notes: string;
    notesGu: string;
    notesEn: string;
  }[] = [];

  const cleanName = currentName.trim();
  if (!cleanName) {
    return {
      currentSingle: 1,
      currentCompound: 0,
      isHarmonious: true,
      idealNumbers,
      suggestions: [],
    };
  }

  // Generate candidate variations by subtle letter additions or doubling
  const candidateSuffixes = ['a', 'e', 'i', 'h', 'n', 'r', 's', 'k'];
  const tried = new Set<string>();

  for (const sfx of candidateSuffixes) {
    const candidate = `${cleanName}${sfx.toUpperCase()}`;
    if (tried.has(candidate)) continue;
    tried.add(candidate);

    const calc = calculateNamank(candidate, system);
    if (idealNumbers.includes(calc.single) && calc.single !== currentCalc.single) {
      suggestions.push({
        modifiedName: candidate,
        compound: calc.compound,
        single: calc.single,
        notes: `अंत में '${sfx.toUpperCase()}' जोड़ने से नामांक ${calc.single} (${NUMBER_DATA[calc.single]?.planetEn}) बनता है जो मूलांक ${userMulank} के अनुकूल है।`,
        notesGu: `છેડે '${sfx.toUpperCase()}' ઉમેરવાથી નામાંક ${calc.single} બને છે જે અનુકૂળ છે.`,
        notesEn: `Adding '${sfx.toUpperCase()}' results in Name Number ${calc.single} (${NUMBER_DATA[calc.single]?.planetEn}), which is harmonious with Root Number ${userMulank}.`,
      });
      if (suggestions.length >= 3) break;
    }
  }

  return {
    currentSingle: currentCalc.single,
    currentCompound: currentCalc.compound,
    isHarmonious,
    idealNumbers,
    suggestions,
  };
}

/** Generate formatted WhatsApp share text for complete Numerology analysis */
export function generateNumerologyWhatsAppText(params: {
  name: string;
  day: number;
  month: number;
  year: number;
  gender?: 'male' | 'female';
  language?: 'hi' | 'gu' | 'en';
}): string {
  const { name, day, month, year, gender = 'male', language = 'hi' } = params;
  const mulank = calculateMulank(day);
  const bhagyank = calculateBhagyank(day, month, year);
  const namank = calculateNamank(name);
  const kua = calculateKuaNumber(year, gender);
  const personalYear = calculatePersonalYear(day, month, new Date().getFullYear());
  const loshu = calculateLoshuGrid(day, month, year);
  const mulankInfo = NUMBER_DATA[mulank] || NUMBER_DATA[1];
  const dateStr = `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;

  if (language === 'gu') {
    return `✨ *સનાતન શક્તિ અંક જ્યોતિષ કુંડળી વિશ્લેષણ* ✨
👤 *જાતક:* ${name || 'શ્રીમાન/શ્રીમતી'}
📅 *જન્મ તારીખ:* ${dateStr}

🔢 *મુખ્ય અંક ગણતરી:*
• *મૂળાંક (Root No):* ${mulank} (${mulankInfo.planet})
• *ભાગ્યાંક (Destiny No):* ${bhagyank} (${NUMBER_DATA[bhagyank]?.planet})
• *નામાંક (Name No):* ${namank.single} (કુલ યોગ: ${namank.compound})
• *કુઆ અંક (Kua No):* ${kua}
• *વ્યક્તિગત વર્ષ ${new Date().getFullYear()}:* અંક ${personalYear.yearNum} (${personalYear.themeGu})

🌟 *શુભ નિર્દેશ:*
• *શુભ રંગ:* ${mulankInfo.luckyColors.join(', ')}
• *શુભ વાર:* ${mulankInfo.luckyDays.join(', ')}
• *શુભ તારીખો:* ${mulankInfo.luckyDates.join(', ')}
• *શુભ રત્ન:* ${mulankInfo.luckyGem} (${mulankInfo.subGem})
• *રુદ્રાક્ષ:* ${mulankInfo.rudraksha}
• *બીજ મંત્ર:* ${mulankInfo.mantra}

🧭 *લો-શૂ ગ્રીડ રાજયોગ:*
${loshu.goldenRajYoga ? '✅ સ્વર્ણ રાજયોગ (4-5-6) સક્રિય!\n' : ''}${loshu.silverRajYoga ? '✅ સિલ્વર રાજયોગ (2-5-8) સક્રિય!\n' : ''}• ગેરહાજર અંક: ${loshu.missingNumbers.join(', ') || 'કોઈ નહીં'}

🙏 *દાન સામગ્રી:* ${mulankInfo.charity.join(', ')}

📲 *સનાતન શક્તિ પંચાંગ દ્વારા નિર્મિત*`;
  }

  if (language === 'en') {
    return `✨ *Sanatan Shakti Vedic Numerology Report* ✨
👤 *Native:* ${name || 'Dear Seeker'}
📅 *Date of Birth:* ${dateStr}

🔢 *Core Numerology Numbers:*
• *Root / Psychic Number (Mulank):* ${mulank} (${mulankInfo.planetEn})
• *Destiny / Life Path Number (Bhagyank):* ${bhagyank} (${NUMBER_DATA[bhagyank]?.planetEn})
• *Name Vibration Number (Namank):* ${namank.single} (Compound: ${namank.compound})
• *Kua Number:* ${kua}
• *Personal Year ${new Date().getFullYear()}:* Number ${personalYear.yearNum} (${personalYear.theme})

🌟 *Auspicious Parameters:*
• *Lucky Colors:* ${mulankInfo.luckyColors.join(', ')}
• *Lucky Days:* ${mulankInfo.luckyDays.join(', ')}
• *Lucky Dates:* ${mulankInfo.luckyDates.join(', ')}
• *Auspicious Gemstone:* ${mulankInfo.luckyGem}
• *Rudraksha:* ${mulankInfo.rudraksha}
• *Beej Mantra:* ${mulankInfo.mantra}

🧭 *Lo Shu Grid Planes:*
${loshu.goldenRajYoga ? '✅ Golden Raj Yoga (4-5-6) Present!\n' : ''}${loshu.silverRajYoga ? '✅ Silver Raj Yoga (2-5-8) Present!\n' : ''}• Missing Numbers: ${loshu.missingNumbers.join(', ') || 'None'}

🙏 *Charity Items:* ${mulankInfo.charity.join(', ')}

📲 *Generated by Sanatan Shakti Panchang*`;
  }

  return `✨ *सनातन शक्ति वैदिक अंक ज्योतिष विश्लेषण* ✨
👤 *जातक:* ${name || 'महानुभाव'}
📅 *जन्म तिथि:* ${dateStr}

🔢 *मुख्य अंक शास्त्र चक्र:*
• *मूलांक (Driver / Root Number):* ${mulank} (${mulankInfo.planet})
• *भाग्यांक (Conductor / Destiny Number):* ${bhagyank} (${NUMBER_DATA[bhagyank]?.planet})
• *नामांक (Name Number):* ${namank.single} (संयुक्त योग: ${namank.compound})
• *कुआ अंक (Kua Number):* ${kua}
• *व्यक्तिगत वर्ष ${new Date().getFullYear()}:* अंक ${personalYear.yearNum} (${personalYear.theme})

🌟 *शुभ ज्योतिषीय पैरामीटर्स:*
• *शुभ रंग:* ${mulankInfo.luckyColors.join(', ')}
• *शुभ वार:* ${mulankInfo.luckyDays.join(', ')}
• *शुभ तारीखें:* ${mulankInfo.luckyDates.join(', ')}
• *शुभ रत्न:* ${mulankInfo.luckyGem} (उपरत्न: ${mulankInfo.subGem})
• *रुद्राक्ष:* ${mulankInfo.rudraksha}
• *वैदिक बीज मंत्र:* ${mulankInfo.mantra}
• *इष्ट देव:* ${mulankInfo.deity}

🧭 *लो शू चक्र (Lo Shu Grid):*
${loshu.goldenRajYoga ? '✅ स्वर्ण राजयोग (4-5-6) सक्रिय!\n' : ''}${loshu.silverRajYoga ? '✅ सिल्वर राजयोग (2-5-8) सक्रिय!\n' : ''}• अभाव वाले अंक (Missing): ${loshu.missingNumbers.join(', ') || 'कोई नहीं'}

🙏 *दान सामग्री:* ${mulankInfo.charity.join(', ')}
💧 *जल पात्र सुझाव:* ${mulankInfo.waterBottleColor}

📲 *सनातन शक्ति पंचांग ऐप द्वारा निर्मित*`;
}
