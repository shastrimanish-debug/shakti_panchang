/**
 * Instant 0ms Offline Dictionary & Smart Bilingual Extractor
 * Provides zero-latency translations for high-frequency module headings, tabs,
 * buttons, and Vedic terms before falling back to the batched live translator.
 */

export const AUTO_TRANSLATE_DICT_EN: Record<string, string> = {
  // Vastu Shastra
  'वैदिक वास्तु शास्त्र एवं दिशा ज्ञान': 'Vedic Vastu Shastra & Direction Guide',
  'वैदिक वास्तु शास्त्र': 'Vedic Vastu Shastra',
  '८ दिशाएं • गृह निर्माण नियम • बिना तोड़-फोड़ के उपाय': '8 Directions • Home Vastu Rules • No-Demolition Remedies',
  'स्टोरी व्यू': 'Story View',
  'कम्पास ग्रिड': 'Compass Grid',
  '८ दिशा ज्ञान': '8 Directions',
  'कमरे व स्थान वास्तु': 'Rooms & Zones Vastu',
  'दोष परीक्षक': 'Dosha Checker',
  'सरल उपाय': 'Simple Remedies',
  'वास्तु दोष परीक्षक': 'Vastu Dosha Checker',
  'बिना तोड़-फोड़ उपाय': 'No-Demolition Remedies',
  'शास्त्रोक्त नियम:': 'Vedic Rules:',
  'शास्त्रोक्त नियम': 'Vedic Rules',
  'दोष परिणाम:': 'Dosha Effects:',
  'दोष परिणाम': 'Dosha Effects',
  'सरल उपाय:': 'Simple Remedy:',
  'बिना तोड़-फोड़ के सरल उपाय:': 'Simple Remedy (No Demolition):',
  'सर्वोत्तम दिशा:': 'Best Direction:',
  'व्यक्तिगत घर/दुकान के वास्तु नक्शे की जांच हेतु': 'For personal home/shop Vastu plan analysis',
  'उमा वास्तु सलाह': 'Ask Uma Vastu',
  '← वास्तु शास्त्र ज्ञान सूची': '← Vastu Shastra Guide',
  'मुख्य द्वार': 'Main Entrance',
  'पूजा घर': 'Temple / Pooja Room',
  'रसोईघर': 'Kitchen',
  'शयनकक्ष': 'Master Bedroom',
  'शौचालय व स्नानघर': 'Toilet & Bathroom',
  'सीढ़ियां': 'Staircase',
  'अध्ययन कक्ष व बच्चों का कमरा': 'Children & Study Room',
  'जल टंकी व बोरवेल': 'Water Storage & Borewell',
  'ईशान कोण': 'North-East (Ishan)',
  'आग्नेय कोण': 'South-East (Agneya)',
  'नैऋत्य कोण': 'South-West (Nairutya)',
  'वायव्य कोण': 'North-West (Vayavya)',
  'ब्रह्मस्थान': 'Center (Brahmasthan)',
  'उत्तर दिशा': 'North Direction',
  'पूर्व दिशा': 'East Direction',
  'दक्षिण दिशा': 'South Direction',
  'पश्चिम दिशा': 'West Direction',

  // Shiv Tantra & Bhakti
  'शिव तंत्र विद्या': 'Shiv Tantra Vidya',
  'कश्मीर शैव दर्शन': 'Kashmir Shaivism',
  'तंत्र का मूल परिचय': 'Introduction to Tantra',
  'त्रिक दर्शन व चार उपाय': 'Trika Philosophy & 4 Upayas',
  'विज्ञान भैरव तंत्र (११२ विधियाँ)': 'Vigyan Bhairav Tantra (112 Methods)',
  'कुण्डलिनी एवं चक्र विज्ञान': 'Kundalini & Chakra Science',
  'आगम ग्रंथ व भ्रांति निवारण': 'Agama Scriptures & Myth Busting',
  'मुख्य ग्रंथ': 'Major Scriptures',
  'दैनिक अभ्यास:': 'Daily Practice:',
  'ध्यान प्रारंभ करें': 'Start Meditation',
  'सुनें': 'Listen',
  'रुकें': 'Stop',
  'शेयर करें': 'Share',
  'कॉपी करें': 'Copy',
  'कॉपी किया गया': 'Copied',
  'संपूर्ण विवरण': 'Complete Details',
  'सम्पूर्ण विवरण': 'Complete Details',

  // Common Vedic Module Labels & Buttons
  'राशिफल': 'Horoscope',
  'दैनिक राशिफल': 'Daily Horoscope',
  'जन्म कुंडली': 'Birth Chart (Kundali)',
  'कुंडली मिलान': 'Kundali Matching',
  'अंक ज्योतिष': 'Numerology',
  'हस्तरेखा ज्ञान': 'Palmistry',
  'मुख सामुद्रिक शास्त्र': 'Face Reading',
  'रत्न विज्ञान': 'Gemology',
  'प्रश्न ज्योतिष': 'Prashna Jyotish',
  'रावण संहिता': 'Ravan Sanhita',
  'लाल किताब उपाय': 'Lal Kitab Remedies',
  'शास्त्रोक्त उपाय': 'Vedic Remedies',
  'साढ़ेसाती व ढैय्या': 'Sade Sati & Dhaiya',
  'शनि साढ़ेसाती': 'Shani Sade Sati',
  'व्रत एवं त्योहार': 'Fasts & Festivals',
  'व्रत कथा एवं आरती': 'Vrat Katha & Aarti',
  'नित्य हवन विधि': 'Daily Havan Ritual',
  'देवता अर्पण': 'Deity Offering',
  'दैनिक गोचर': 'Daily Planetary Transit',
  'यात्रा मुहूर्त एवं दिशा शूल': 'Travel Muhurat & Disha Shool',
  'शुभ मुहूर्त': 'Auspicious Muhurat',
  'चौघड़िया': 'Choghadiya',
  'होरा चक्र': 'Hora Chakra',
  'शाबर मंत्र': 'Shabar Mantras',
  'जैन मंत्र': 'Jain Mantras',
  'दैनिक गीता श्लोक': 'Daily Gita Shloka',
  'उमा से पूछें': 'Ask Uma',
  'विस्तार से जानें': 'Learn More',
  'विस्तार से पढ़ें': 'Read Full',
  'बंद करें': 'Close',
  'वापस जाएं': 'Go Back',
  'खोजें': 'Search',
  'सभी': 'All',
  'शुभ': 'Auspicious',
  'अशुभ': 'Inauspicious',
  'सामान्य': 'Neutral',
  'अति शुभ': 'Highly Auspicious',
  'सर्वोत्तम': 'Best',
  'दोषपूर्ण': 'Defective',
  'महादोष': 'Severe Dosha',
  'उपाय:': 'Remedy:',
  'उपाय': 'Remedy',
  'विधि:': 'Method:',
  'विधि': 'Method',
  'लाभ:': 'Benefits:',
  'लाभ': 'Benefits',
  'फल:': 'Result:',
  'सावधानी:': 'Precaution:',
  'विशेष:': 'Note:',
  'महत्व:': 'Significance:',
  'प्रमुख विशेषताएं:': 'Key Highlights:',
  'सारांश': 'Summary',
  'परिचय': 'Introduction',
  'अध्याय': 'Chapter',
  'श्लोक': 'Verse',
  'मंत्र': 'Mantra',
  'यंत्र': 'Yantra',
  'तंत्र': 'Tantra',
  'अर्थ:': 'Meaning:',
  'भावार्थ:': 'Meaning:',
  'डाउनलोड करें': 'Download',
  'पीडीएफ डाउनलोड': 'Download PDF',
  'व्हाट्सएप पर शेयर करें': 'Share on WhatsApp',
  'पूर्व अध्याय': 'Prev Chapter',
  'अगला अध्याय': 'Next Chapter',
  '← पूर्व अध्याय': '← Prev Chapter',
  'अगला अध्याय →': 'Next Chapter →',
};

export const AUTO_TRANSLATE_DICT_GU: Record<string, string> = {
  // Vastu Shastra
  'वैदिक वास्तु शास्त्र एवं दिशा ज्ञान': 'વૈદિક વાસ્તુ શાસ્ત્ર અને દિશા જ્ઞાન',
  'वैदिक वास्तु शास्त्र': 'વૈદિક વાસ્તુ શાસ્ત્ર',
  '८ दिशाएं • गृह निर्माण नियम • बिना तोड़-फोड़ के उपाय': '૮ દિશાઓ • ગૃહ નિર્માણ નિયમો • તોડફોડ વિનાના ઉપાયો',
  'स्टोरी व्यू': 'સ્ટોરી વ્યૂ',
  'कम्पास ग्रिड': 'કંપાસ ગ્રિડ',
  '८ दिशा ज्ञान': '૮ દિશા જ્ઞાન',
  'कमरे व स्थान वास्तु': 'રૂમ અને સ્થાન વાસ્તુ',
  'दोष परीक्षक': 'દોષ પરીક્ષક',
  'सरल उपाय': 'સરળ ઉપાય',
  'वास्तु दोष परीक्षक': 'વાસ્તુ દોષ પરીક્ષક',
  'बिना तोड़-फोड़ उपाय': 'તોડફોડ વિનાના ઉપાય',
  'शास्त्रोक्त नियम:': 'શાસ્ત્રોક્ત નિયમો:',
  'शास्त्रोक्त नियम': 'શાસ્ત્રોક્ત નિયમો',
  'दोष परिणाम:': 'દોષ પરિણામ:',
  'दोष परिणाम': 'દોષ પરિણામ',
  'सरल उपाय:': 'સરળ ઉપાય:',
  'बिना तोड़-फोड़ के सरल उपाय:': 'તોડફોડ વિનાનો સરળ ઉપાય:',
  'सर्वोत्तम दिशा:': 'સર્વોત્તમ દિશા:',
  'व्यक्तिगत घर/दुकान के वास्तु नक्शे की जांच हेतु': 'વ્યક્તિગત ઘર/દુકાનના વાસ્તુ નકશાની તપાસ માટે',
  'उमा वास्तु सलाह': 'ઉમા વાસ્તુ સલાહ',
  '← वास्तु शास्त्र ज्ञान सूची': '← વાસ્તુ શાસ્ત્ર જ્ઞાન સૂચિ',

  // Common Labels
  'सुनें': 'સાંભળો',
  'रुकें': 'રોકો',
  'शेयर करें': 'શેર કરો',
  'कॉपी करें': 'કોપી કરો',
  'कॉपी किया गया': 'કોપી થયું',
  'संपूर्ण विवरण': 'સંપૂર્ણ વિગત',
  'सम्पूर्ण विवरण': 'સંપૂર્ણ વિગત',
  'उमा से पूछें': 'ઉમાને પૂછો',
  'विस्तार से जानें': 'વિગતવાર જાણો',
  'विस्तार से पढ़ें': 'વિગતવાર વાંચો',
  'बंद करें': 'બંધ કરો',
  'वापस जाएं': 'પાછા જાઓ',
  'खोजें': 'શોધો',
  'सभी': 'બધા',
  'शुभ': 'શુભ',
  'अशुभ': 'અશુભ',
  'सामान्य': 'સામાન્ય',
  'अति शुभ': 'અતિ શુભ',
  'सर्वोत्तम': 'સર્વોત્તમ',
  'दोषपूर्ण': 'દોષપૂર્ણ',
  'महादोष': 'મહાદોષ',
  'उपाय:': 'ઉપાય:',
  'उपाय': 'ઉપાય',
  'विधि:': 'વિધિ:',
  'विधि': 'વિધિ',
  'लाभ:': 'લાભ:',
  'लाभ': 'લાભ',
  'फल:': 'ફળ:',
  'सावधानी:': 'સાવચેતી:',
  'विशेष:': 'વિશેષ:',
  'महत्व:': 'મહત્વ:',
  'सारांश': 'સારાંશ',
  'परिचय': 'પરિચય',
  'अध्याय': 'અધ્યાય',
  'श्लोक': 'શ્લોક',
  'अर्थ:': 'અર્થ:',
  'भावार्थ:': 'ભાવાર્થ:',
  'डाउनलोड करें': 'ડાઉનલોડ કરો',
  'व्हाट्सएप पर शेयर करें': 'WhatsApp પર શેર કરો',
  '← पूर्व अध्याय': '← પૂર્વ અધ્યાય',
  'अगला अध्याय →': 'આગળનો અધ્યાય →',
};

/**
 * Exact native names of supported languages — NEVER auto-translate these!
 */
export const PROTECTED_LANGUAGE_NAMES = new Set<string>([
  'हिन्दी',
  'हिंदी',
  'English',
  'ગુજરાતી',
  'मराठी',
  'বাংলা',
  'தமிழ்',
  'తెలుగు',
  'ಕನ್ನಡ',
  'മലയാളം',
  'ਪੰਜਾਬੀ',
  'ଓଡ଼ିଆ',
  'ଓଡ଼િଆ',
]);

const DEVANAGARI_DIGITS = '०१२३४५६७८९';
const GUJARATI_DIGITS = '૦૧૨૩૪૫૬૭૮૯';

/**
 * Instant 0ms local translation attempt:
 * 1. Dictionary lookup (en / gu)
 * 2. Smart bilingual "Hindi (English)" extraction in English mode
 * 3. Devanagari-only numeral conversion (e.g. "१." -> "1." or "૧.")
 */
export function tryInstantLocalTranslate(raw: string, targetLang: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const lang = targetLang.slice(0, 2).toLowerCase();

  // 1. Pure Devanagari digits / numbering (e.g., "१.", "१२", "१०८")
  if (/^[\u0966-\u096F\s.,:%/()\-•·+]+$/.test(trimmed) && /[\u0966-\u096F]/.test(trimmed)) {
    if (lang === 'gu') {
      return trimmed.replace(/[०-९]/g, (d) => GUJARATI_DIGITS[DEVANAGARI_DIGITS.indexOf(d)] || d);
    }
    if (lang !== 'hi' && lang !== 'mr') {
      return trimmed.replace(/[०-९]/g, (d) => String(DEVANAGARI_DIGITS.indexOf(d)));
    }
  }

  // 2. Built-in instant offline dictionary
  if (lang === 'en' && AUTO_TRANSLATE_DICT_EN[trimmed]) {
    return AUTO_TRANSLATE_DICT_EN[trimmed];
  }
  if (lang === 'gu' && AUTO_TRANSLATE_DICT_GU[trimmed]) {
    return AUTO_TRANSLATE_DICT_GU[trimmed];
  }

  // 3. Smart Bilingual Extraction for English:
  // "मुख्य द्वार (Main Entrance)" -> "Main Entrance"
  // "मंत्र (Mantra)" -> "Mantra"
  // "पूजा घर (Temple / Meditation Area)" -> "Temple / Meditation Area"
  if (lang === 'en') {
    const hiThenEn = trimmed.match(
      /^[\u0900-\u097F0-9\s.,/&\-·•:]+?\s*\(([A-Za-z][A-Za-z0-9\s/&\-.,'"+:!?]+)\)\s*[:.]?$/
    );
    if (hiThenEn && hiThenEn[1]) {
      const trailingColon = trimmed.endsWith(':') ? ':' : '';
      return hiThenEn[1].trim() + trailingColon;
    }

    // "Sound Energy (नाद ब्रह्म)" -> "Sound Energy" when English part is already descriptive
    const enThenHiShort = trimmed.match(
      /^([A-Za-z][A-Za-z0-9\s/&\-.,'"+:!?]{2,})\s*\([\u0900-\u097F\s.,/&\-·•]+\)\s*$/
    );
    if (enThenHiShort && enThenHiShort[1]) {
      return enThenHiShort[1].trim();
    }
  }

  return null;
}
