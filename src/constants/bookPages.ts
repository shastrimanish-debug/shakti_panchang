import {
  Sun,
  Calendar,
  Clock,
  Compass,
  User,
  Heart,
  Gift,
  Bell,
  Sparkles,
  Timer,
  BookOpen,
  Home,
  Flame,
  Star,
  type LucideIcon,
} from 'lucide-react';

export interface BookPageItem {
  id: string;
  title: string;
  label: string;
  pageNumber: number;
  chapter: string;
  desc: string;
  icon: LucideIcon;
  screenTitle?: string;
}

/** Physical flip-book chapters */
export const FLIP_BOOK_CHAPTERS: BookPageItem[] = [
  {
    id: 'panchang',
    title: 'पंचांग',
    label: 'पंचांग',
    pageNumber: 1,
    chapter: '',
    desc: 'तिथि • नक्षत्र • योग • करण • सूर्य समय',
    icon: Calendar,
    screenTitle: '📜 पूरा पंचांग',
  },
  {
    id: 'rashifal',
    title: 'दैनिक राशिफल',
    label: 'राशिफल',
    pageNumber: 2,
    chapter: '',
    desc: 'मेष से मीन राशि का दैनिक गोचर फल व उपाय',
    icon: Star,
    screenTitle: '🌟 दैनिक राशिफल',
  },
  {
    id: 'kundali',
    title: 'कुंडली',
    label: 'कुंडली',
    pageNumber: 3,
    chapter: '',
    desc: 'जन्म कुंडली • वर्ग • दशा • फलित',
    icon: Sparkles,
    screenTitle: '🪐 जन्म कुंडली',
  },
  {
    id: 'muhurat',
    title: 'शुभ मुहूर्त',
    label: 'शुभ मुहूर्त',
    pageNumber: 4,
    chapter: '',
    desc: 'विवाह • गृहप्रवेश • कार्यारम्भ',
    icon: Clock,
    screenTitle: '🙏 काम के अनुसार मुहूर्त',
  },
  {
    id: 'choghadiya',
    title: 'शुभ समय',
    label: 'शुभ समय',
    pageNumber: 5,
    chapter: '',
    desc: 'चौघड़िया • राहुकाल • यमगण्ड • गुलिक',
    icon: Timer,
    screenTitle: '✨ शुभ समय सलाह',
  },
  {
    id: 'durga',
    title: 'दुर्गा सप्तशती',
    label: 'दुर्गा सप्तशती',
    pageNumber: 6,
    chapter: '',
    desc: '१३ सम्पूर्ण अध्याय, कवच, अर्गला, कीलक व कुंजिका',
    icon: Flame,
    screenTitle: '🔱 श्री दुर्गा सप्तशती',
  },
  {
    id: 'upay',
    title: 'चमत्कारी उपाय',
    label: 'ग्रह उपाय',
    pageNumber: 7,
    chapter: '',
    desc: 'कुंडली अनुसार ग्रह शांति, लाल किताब व चमत्कारी टोटके',
    icon: Sparkles,
    screenTitle: '🔮 ग्रह शांति व चमत्कारी उपाय',
  },
  {
    id: 'vastu',
    title: 'वास्तु शास्त्र',
    label: 'वास्तु',
    pageNumber: 8,
    chapter: '',
    desc: '८ दिशाएं, गृह निर्माण नियम व बिना तोड़-फोड़ के टिप्स',
    icon: Home,
    screenTitle: '🏡 वैदिक वास्तु शास्त्र',
  },
  {
    id: 'gita',
    title: 'गीता ज्ञान',
    label: 'गीता ज्ञान',
    pageNumber: 9,
    chapter: '',
    desc: 'श्रीमद्भगवद्गीता श्लोक ऑफ़ द डे व दिव्य उपदेश',
    icon: BookOpen,
    screenTitle: '📜 श्रीमद्भगवद्गीता ज्ञान',
  },
  {
    id: 'yatra',
    title: 'यात्रा',
    label: 'यात्रा',
    pageNumber: 10,
    chapter: '',
    desc: 'दिशाशूल • शुभ दिशा • यात्रा सलाह',
    icon: Compass,
    screenTitle: '🚗 यात्रा मुहूर्त',
  },
  {
    id: 'milan',
    title: 'कुंडली मिलान',
    label: 'मिलान',
    pageNumber: 11,
    chapter: '',
    desc: '३६ गुण मिलान • नाड़ी • भकूट दोष व PDF',
    icon: Heart,
    screenTitle: '💍 अष्टकूट मिलान व PDF',
  },
  {
    id: 'festivals',
    title: 'व्रत एवं त्योहार',
    label: 'व्रत एवं त्योहार',
    pageNumber: 12,
    chapter: '',
    desc: 'एकादशी • पूर्णिमा • अमावस्या • पर्व',
    icon: Gift,
    screenTitle: '📅 पर्व और व्रत',
  },
  {
    id: 'vratkatha',
    title: 'व्रत कथा व आरती',
    label: 'व्रत कथा',
    pageNumber: 13,
    chapter: '',
    desc: 'एकादशी, प्रदोष, सत्यनारायण कथा व आरती संग्रह',
    icon: BookOpen,
    screenTitle: '📖 व्रत कथा एवं आरती संग्रह',
  },
  {
    id: 'reminders',
    title: 'रिमाइंडर',
    label: 'रिमाइंडर',
    pageNumber: 14,
    chapter: '',
    desc: 'व्रत और शुभ समय के लिए धार्मिक सूचनाएँ',
    icon: Bell,
    screenTitle: '🔔 उमा Reminder',
  },
];

export const BOOK_PAGES: BookPageItem[] = [
  {
    id: 'panchang',
    title: 'दैनिक पंचांग व काल गणना',
    label: 'पंचांग',
    pageNumber: 1,
    chapter: 'प्रथम अध्याय',
    desc: 'तिथि, वार, नक्षत्र, योग, करण व अयनांश',
    icon: Sun,
    screenTitle: '📜 पूरा पंचांग',
  },
  {
    id: 'rashifal',
    title: 'दैनिक राशिफल (मेष से मीन)',
    label: 'राशिफल',
    pageNumber: 2,
    chapter: 'द्वितीय अध्याय',
    desc: 'सभी १२ राशियों का दैनिक गोचर फल, शुभ रंग, अंक व उपाय',
    icon: Star,
    screenTitle: '🌟 दैनिक राशिफल',
  },
  {
    id: 'choghadiya',
    title: 'चौघड़िया चक्र व मुहूर्त वेला',
    label: 'चौघड़िया',
    pageNumber: 3,
    chapter: 'तृतीय अध्याय',
    desc: 'दिन व रात्रि के अमृत, शुभ, लाभ व त्याज्य काल',
    icon: Clock,
    screenTitle: '✨ शुभ समय सलाह',
  },
  {
    id: 'kundali',
    title: 'जातक जन्म पत्रिका व विंशोत्तरी दशा',
    label: 'कुंडली',
    pageNumber: 4,
    chapter: 'चतुर्थ अध्याय',
    desc: 'लग्न चक्र, षोडश वर्ग, महादशा व फलादेश',
    icon: User,
    screenTitle: '🪐 जन्म कुंडली',
  },
  {
    id: 'durga',
    title: 'श्री दुर्गा सप्तशती सम्पूर्ण पाठ',
    label: 'दुर्गा सप्तशती',
    pageNumber: 5,
    chapter: 'पंचम अध्याय',
    desc: '१३ अध्याय, कवच, अर्गला, कीलक, सिद्ध कुंजिका व आरती',
    icon: Flame,
    screenTitle: '🔱 श्री दुर्गा सप्तशती सम्पूर्ण',
  },
  {
    id: 'upay',
    title: 'ग्रह शांति, लाल किताब व चमत्कारी उपाय',
    label: 'चमत्कारी उपाय',
    pageNumber: 6,
    chapter: 'षष्ठ अध्याय',
    desc: 'कुंडली के अनुसार ग्रह शांति, लाल किताब व तात्कालिक टोटके',
    icon: Sparkles,
    screenTitle: '🔮 ग्रह शांति व चमत्कारी उपाय',
  },
  {
    id: 'vastu',
    title: 'वैदिक वास्तु शास्त्र व चमत्कारी टिप्स',
    label: 'वास्तु शास्त्र',
    pageNumber: 7,
    chapter: 'सप्तम अध्याय',
    desc: '८ दिशाएं, गृह निर्माण नियम व बिना तोड़-फोड़ के उपाय',
    icon: Home,
    screenTitle: '🏡 वैदिक वास्तु शास्त्र',
  },
  {
    id: 'gita',
    title: 'श्रीमद्भगवद्गीता श्लोक ऑफ़ द डे',
    label: 'गीता ज्ञान',
    pageNumber: 8,
    chapter: 'अष्टम अध्याय',
    desc: 'दिव्य श्लोक, हिंदी भावार्थ व जीवन दर्शन',
    icon: BookOpen,
    screenTitle: '📜 श्रीमद्भगवद्गीता ज्ञान',
  },
  {
    id: 'muhurat',
    title: 'कार्य सिद्धि व शुभ मुहूर्त निर्णय',
    label: 'मुहूर्त',
    pageNumber: 9,
    chapter: 'नवम अध्याय',
    desc: 'विवाह, गृह प्रवेश, व्यापार, वाहन व नामकरण मुहूर्त',
    icon: Compass,
    screenTitle: '🙏 काम के अनुसार मुहूर्त',
  },
  {
    id: 'yatra',
    title: 'दिशाशूल विचार व यात्रा शुद्धि',
    label: 'यात्रा',
    pageNumber: 10,
    chapter: 'दशम अध्याय',
    desc: 'दैनिक दिशाशूल, यात्रा दूरी व शास्त्रोक्त सात्विक परिहार',
    icon: Compass,
    screenTitle: '🚗 यात्रा मुहूर्त',
  },
  {
    id: 'milan',
    title: 'अष्टकूट मिलान व वर-कन्या मेलापक (PDF)',
    label: 'मिलान',
    pageNumber: 11,
    chapter: 'एकादश अध्याय',
    desc: '36 गुण विचार, नाड़ी, भकूट, गण, योनि व PDF रिपोर्ट डाउनलोड',
    icon: Heart,
    screenTitle: 'कुंडली मिलान – 36 गुण व PDF',
  },
  {
    id: 'festivals',
    title: 'सनातन व्रत, पर्व व राष्ट्रीय उत्सव',
    label: 'व्रत/त्योहार',
    pageNumber: 12,
    chapter: 'द्वादश अध्याय',
    desc: 'एकादशी, प्रदोष, पूर्णिमा, अमावस्या, शिवरात्रि व समस्त व्रत',
    icon: Gift,
    screenTitle: '📅 पर्व और व्रत',
  },
  {
    id: 'vratkatha',
    title: 'व्रत कथा, पूजा विधि व आरती संग्रह',
    label: 'व्रत कथा',
    pageNumber: 13,
    chapter: 'त्रयोदश अध्याय',
    desc: 'एकादशी, प्रदोष, सत्यनारायण सम्पूर्ण कथा, स्तोत्र व आरती',
    icon: BookOpen,
    screenTitle: '📖 व्रत कथा एवं आरती संग्रह',
  },
  {
    id: 'reminders',
    title: 'वैदिक अनुष्ठान व धार्मिक संकल्प',
    label: 'रिमाइंडर',
    pageNumber: 14,
    chapter: 'चतुर्दश अध्याय',
    desc: 'नित्य पूजा, जप, साधना व व्यक्तिगत धार्मिक संकल्प स्मरण',
    icon: Bell,
    screenTitle: '🔔 उमा Reminder',
  },
];

const BOOK_PAGE_EN: Record<string, { title: string; label: string; desc: string; screenTitle?: string }> = {
  panchang: {
    title: 'Daily Panchang & Ephemeris',
    label: 'Panchang',
    desc: 'Tithi, Vaar, Nakshatra, Yoga, Karana & Ayanamsha',
    screenTitle: '📜 Complete Panchang',
  },
  rashifal: {
    title: 'Daily Horoscope (Aries to Pisces)',
    label: 'Horoscope',
    desc: 'Daily transit forecast, lucky colors, numbers & remedies',
    screenTitle: '🌟 Daily Horoscope',
  },
  choghadiya: {
    title: 'Choghadiya Muhurat & Auspicious Hours',
    label: 'Choghadiya',
    desc: 'Day & Night Amrit, Shubh, Labh & Avoidable periods',
    screenTitle: '✨ Auspicious Times',
  },
  kundali: {
    title: 'Vedic Janam Kundali & Vimshottari Dasha',
    label: 'Kundali',
    desc: 'Ascendant chart, divisional charts, dasha & life analysis',
    screenTitle: '🪐 Birth Chart (Kundali)',
  },
  durga: {
    title: 'Complete Shri Durga Saptashati Recitation',
    label: 'Durga Saptashati',
    desc: '13 Chapters, Kavach, Argala, Kilak, Siddha Kunjika & Aarti',
    screenTitle: '🔱 Complete Durga Saptashati',
  },
  upay: {
    title: 'Planetary Remedies & Lal Kitab Totke',
    label: 'Remedies',
    desc: 'Planetary peace, Vedic & Lal Kitab remedies',
    screenTitle: '🔮 Miraculous Remedies',
  },
  vastu: {
    title: 'Vedic Vastu Shastra & Home Principles',
    label: 'Vastu Shastra',
    desc: '8 Directions, home architecture & non-destructive remedies',
    screenTitle: '🏡 Vedic Vastu Shastra',
  },
  gita: {
    title: 'Shrimad Bhagavad Gita Shloka of the Day',
    label: 'Gita Shloka',
    desc: 'Divine verses, translation & life philosophy',
    screenTitle: '📜 Bhagavad Gita Wisdom',
  },
  muhurat: {
    title: 'Auspicious Muhurat & Event Timing',
    label: 'Muhurat',
    desc: 'Marriage, Griha Pravesh, Business & Vehicle Muhurat',
    screenTitle: '🙏 Auspicious Muhurat',
  },
  yatra: {
    title: 'Dishashool & Sacred Travel Direction Guide',
    label: 'Travel Guide',
    desc: 'Daily direction barriers, travel distance & Vedic remedies',
    screenTitle: '🚗 Travel Muhurat',
  },
  milan: {
    title: 'Kundali Milan & 36 Guna Matchmaking (PDF)',
    label: 'Matchmaking',
    desc: '36 Guna analysis, Nadi, Bhakoot, Gana & PDF download',
    screenTitle: '💍 Kundali Matchmaking',
  },
  festivals: {
    title: 'Vedic Fasting, Festivals & Holy Tithis',
    label: 'Festivals',
    desc: 'Ekadashi, Pradosh, Purnima, Amavasya, Shivratri & all fasts',
    screenTitle: '📅 Festivals & Fasts',
  },
  vratkatha: {
    title: 'Vrat Katha, Puja Rituals & Aarti Collection',
    label: 'Vrat Katha',
    desc: 'Ekadashi, Pradosh, Satyanarayan full kathas & stotras',
    screenTitle: '📖 Vrat Katha & Aarti',
  },
  reminders: {
    title: 'Vedic Rituals & Spiritual Reminders',
    label: 'Reminders',
    desc: 'Daily prayer, japa, sadhana & sacred reminders',
    screenTitle: '🔔 Spiritual Reminders',
  },
  shiva: {
    title: 'Sacred Shiva Mahimna Stotra',
    label: 'Shiva Stotra',
    desc: 'Complete Sanskrit verses with meaning & musical chanting',
    screenTitle: '🔱 Shiva Mahimna Stotra',
  },
  prarthana: {
    title: 'Daily Vedic Morning & Night Prayers',
    label: 'Daily Prayers',
    desc: 'Karagre Vasate Lakshmi, Bhojan mantra & Night Kshama prayer',
    screenTitle: '🪔 Daily Prayers & Mantras',
  },
  index: {
    title: 'Sacred Granth Table of Contents & Index',
    label: 'Granth Index',
    desc: 'Complete overview of all chapters, texts and tools',
    screenTitle: '📖 Granth Index',
  },
};

const BOOK_PAGE_GU: Record<string, { title: string; label: string; desc: string; screenTitle?: string }> = {
  panchang: {
    title: 'દૈનિક પંચાંગ અને કાળ ગણના',
    label: 'પંચાંગ',
    desc: 'તિથિ, વાર, નક્ષત્ર, યોગ, કરણ અને અયનાંશ',
    screenTitle: '📜 સંપૂર્ણ પંચાંગ',
  },
  rashifal: {
    title: 'દૈનિક રાશિફળ (મેષ થી મીન)',
    label: 'રાશિફળ',
    desc: 'તમામ ૧૨ રાશિઓનું દૈનિક ગોચર ફળ, શુભ રંગ, અંક અને ઉપાય',
    screenTitle: '🌟 દૈનિક રાશિફળ',
  },
  choghadiya: {
    title: 'ચોઘડિયા ચક્ર અને મુહૂર્ત વેળા',
    label: 'ચોઘડિયા',
    desc: 'દિવસ અને રાત્રિના અમૃત, શુભ, લાભ અને ત્યાજ્ય કાળ',
    screenTitle: '✨ શુભ સમય સલાહ',
  },
  kundali: {
    title: 'જાતક જન્મ પત્રિકા અને વિંશોત્તરી દશા',
    label: 'કુંડળી',
    desc: 'લગ્ન ચક્ર, ષોડશ વર્ગ, મહાદશા અને ફલાદેશ',
    screenTitle: '🪐 જન્મ કુંડળી',
  },
  durga: {
    title: 'શ્રી દુર્ગા સપ્તશતી સંપૂર્ણ પાઠ',
    label: 'દુર્ગા સપ્તશતી',
    desc: '૧૩ અધ્યાય, કવચ, અર્ગલા, કીલક, સિદ્ધ કુંજિકા અને આરતી',
    screenTitle: '🔱 શ્રી દુર્ગા સપ્તશતી સંપૂર્ણ',
  },
  upay: {
    title: 'ગ્રહ શાંતિ અને ચમત્કારી ઉપાય',
    label: 'ચમત્કારી ઉપાય',
    desc: 'કુંડળી અનુસાર ગ્રહ શાંતિ, લાલ કિતાબ અને તાત્કાલિક ટોટકા',
    screenTitle: '🔮 ગ્રહ શાંતિ અને ઉપાય',
  },
  vastu: {
    title: 'વૈદિક વાસ્તુ શાસ્ત્ર અને ચમત્કારી ટિપ્સ',
    label: 'વાસ્તુ શાસ્ત્ર',
    desc: '૮ દિશાઓ, ગૃહ નિર્માણ નિયમો અને તોડફોડ વગરના ઉપાય',
    screenTitle: '🏡 વૈદિક વાસ્તુ શાસ્ત્ર',
  },
  gita: {
    title: 'શ્રીમદ્ ભગવદ્ ગીતા શ્લોક ઓફ ધ ડે',
    label: 'ગીતા જ્ઞાન',
    desc: 'દિવ્ય શ્લોક, ગુજરાતી ભાવાર્થ અને જીવન દર્શન',
    screenTitle: '📜 શ્રીમદ્ ભગવદ્ ગીતા જ્ઞાન',
  },
  muhurat: {
    title: 'કાર્ય સિદ્ધિ અને શુભ મુહૂર્ત નિર્ણય',
    label: 'મુહૂર્ત',
    desc: 'લગ્ન, ગૃહ પ્રવેશ, વેપાર, વાહન અને નામકરણ મુહૂર્ત',
    screenTitle: '🙏 કાર્ય અનુસાર મુહૂર્ત',
  },
  yatra: {
    title: 'દિશાશૂળ વિચાર અને યાત્રા શુદ્ધિ',
    label: 'યાત્રા',
    desc: 'દૈનિક દિશાશૂળ, યાત્રા અંતર અને શાસ્ત્રોક્ત સાત્વિક પરિહાર',
    screenTitle: '🚗 યાત્રા મુહૂર્ત',
  },
  milan: {
    title: 'અષ્ટકૂટ મિલન અને વર-કન્યા મેળાપક (PDF)',
    label: 'મિલન',
    desc: '૩૬ ગુણ વિચાર, નાડી, ભકૂટ, ગણ, યોનિ અને PDF રિપોર્ટ',
    screenTitle: '💍 કુંડળી મિલન – ૩૬ ગુણ',
  },
  festivals: {
    title: 'સનાતન વ્રત, પર્વ અને રાષ્ટ્રીય ઉત્સવો',
    label: 'વ્રત/પર્વ',
    desc: 'એકાદશી, પ્રદોષ, પૂર્ણિમા, અમાવસ્યા, શિવરાત્રિ અને વ્રતો',
    screenTitle: '📅 પર્વ અને વ્રત',
  },
  vratkatha: {
    title: 'વ્રત કથા, પૂજા વિધિ અને આરતી સંગ્રહ',
    label: 'વ્રત કથા',
    desc: 'એકાદશી, પ્રદોષ, સત્યનારાયણ સંપૂર્ણ કથા, સ્તોત્ર અને આરતી',
    screenTitle: '📖 વ્રત કથા અને આરતી સંગ્રહ',
  },
  reminders: {
    title: 'વૈદિક અનુષ્ઠાન અને ધાર્મિક સંકલ્પ',
    label: 'રિમાઇન્ડર',
    desc: 'નિત્ય પૂજા, જપ, સાધના અને વ્યક્તિગત ધાર્મિક સંકલ્પ',
    screenTitle: '🔔 ઉમા Reminder',
  },
  shiva: {
    title: 'શ્રી શિવ મહિમ્ન સ્તોત્ર',
    label: 'શિવ સ્તોત્ર',
    desc: 'સંસ્કૃત શ્લોક, ગુજરાતી અર્થ અને સંગીતમય ગાન',
    screenTitle: '🔱 શિવ મહિમ્ન સ્તોત્ર',
  },
  prarthana: {
    title: 'દૈનિક વૈદિક પ્રભાત અને રાત્રિ પ્રાર્થનાઓ',
    label: 'દૈનિક પ્રાર્થના',
    desc: 'કરાગ્રે વસતે લક્ષ્મી, ભોજન મંત્ર અને ક્ષમા પ્રાર્થના',
    screenTitle: '🪔 દૈનિક પ્રાર્થના અને મંત્રો',
  },
  index: {
    title: 'સનાતન શક્તિ પંચાંગ ગ્રંથ અનુક્રમણિકા',
    label: 'ગ્રંથ સૂચિ',
    desc: 'તમામ અધ્યાયો, સ્તોત્રો અને સાધનોની સંપૂર્ણ યાદી',
    screenTitle: '📖 ગ્રંથ અનુક્રમણિકા',
  },
};

export function getLocalizedBookPage(page: BookPageItem, lang: string): BookPageItem {
  if (lang === 'en') {
    const enMeta = BOOK_PAGE_EN[page.id];
    if (!enMeta) {
      return {
        ...page,
        chapter: `Chapter ${page.pageNumber}`,
      };
    }
    return {
      ...page,
      title: enMeta.title,
      label: enMeta.label,
      chapter: `Chapter ${page.pageNumber}`,
      desc: enMeta.desc,
      screenTitle: enMeta.screenTitle || page.screenTitle,
    };
  }
  if (lang === 'gu') {
    const guMeta = BOOK_PAGE_GU[page.id];
    const guChapters = ['પ્રથમ અધ્યાય', 'દ્વિતીય અધ્યાય', 'તૃતીય અધ્યાય', 'ચતુર્થ અધ્યાય', 'પંચમ અધ્યાય', 'ષષ્ઠ અધ્યાય', 'સપ્તમ અધ્યાય', 'અષ્ટમ અધ્યાય', 'નવમ અધ્યાય', 'દશમ અધ્યાય', 'એકાદશ અધ્યાય', 'દ્વાદશ અધ્યાય', 'ત્રયોદશ અધ્યાય', 'ચતુર્દશ અધ્યાય', 'પંચદશ અધ્યાય', 'ષોડશ અધ્યાય', 'સપ્તદશ અધ્યાય'];
    const chapterName = guChapters[page.pageNumber - 1] || `અધ્યાય ${page.pageNumber}`;
    if (!guMeta) {
      return {
        ...page,
        chapter: chapterName,
      };
    }
    return {
      ...page,
      title: guMeta.title,
      label: guMeta.label,
      chapter: chapterName,
      desc: guMeta.desc,
      screenTitle: guMeta.screenTitle || page.screenTitle,
    };
  }
  return page;
}

export function getLocalizedBookPages(pages: BookPageItem[], lang: string): BookPageItem[] {
  return pages.map((p) => getLocalizedBookPage(p, lang));
}

