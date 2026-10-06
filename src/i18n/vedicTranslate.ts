import i18n from './index';

// ==========================================
// ENGLISH MAPS
// ==========================================
export const WEEKDAYS_MAP_EN: Record<string, string> = {
  'रविवार': 'Sunday',
  'सोमवार': 'Monday',
  'मंगलवार': 'Tuesday',
  'बुधवार': 'Wednesday',
  'गुरुवार': 'Thursday',
  'शुक्रवार': 'Friday',
  'शनिवार': 'Saturday',
  'रवि': 'Sun',
  'सोम': 'Mon',
  'मंगल': 'Tue',
  'बुध': 'Wed',
  'गुरु': 'Thu',
  'शुक्र': 'Fri',
  'शनિ': 'Sat',
  'शनि': 'Sat',
};

export const PAKSHA_MAP_EN: Record<string, string> = {
  'शुक्ल पक्ष': 'Shukla Paksha',
  'कृष्ण पक्ष': 'Krishna Paksha',
  'शुक्ल': 'Shukla',
  'कृष्ण': 'Krishna',
};

export const RASHI_MAP_EN: Record<string, string> = {
  'मेष राशि': 'Aries (Mesha)',
  'वृषभ राशि': 'Taurus (Vrishabha)',
  'मिथुन राशि': 'Gemini (Mithuna)',
  'कर्क राशि': 'Cancer (Karka)',
  'सिंह राशि': 'Leo (Simha)',
  'कन्या राशि': 'Virgo (Kanya)',
  'तुला राशि': 'Libra (Tula)',
  'वृश्चिक राशि': 'Scorpio (Vrischika)',
  'धनु राशि': 'Sagittarius (Dhanu)',
  'मकर राशि': 'Capricorn (Makara)',
  'कुम्भ राशि': 'Aquarius (Kumbha)',
  'मीन राशि': 'Pisces (Meena)',
  'मेष': 'Aries (Mesha)',
  'वृषभ': 'Taurus (Vrishabha)',
  'मिथुन': 'Gemini (Mithuna)',
  'कर्क': 'Cancer (Karka)',
  'सिंह': 'Leo (Simha)',
  'कन्या': 'Virgo (Kanya)',
  'तुला': 'Libra (Tula)',
  'वृश्चिक': 'Scorpio (Vrischika)',
  'धनु': 'Sagittarius (Dhanu)',
  'मकर': 'Capricorn (Makara)',
  'कुम्भ': 'Aquarius (Kumbha)',
  'मीन': 'Pisces (Meena)',
};

export const PLANET_MAP_EN: Record<string, string> = {
  'सूर्य देव': 'Sun',
  'सूर्य': 'Sun',
  'चन्द्र देव': 'Moon',
  'चन्द्र': 'Moon',
  'चंद्र': 'Moon',
  'मंगल देव': 'Mars',
  'मंगल': 'Mars',
  'बुध देव': 'Mercury',
  'बुध': 'Mercury',
  'गुरु देव': 'Jupiter',
  'गुरु': 'Jupiter',
  'बृहस्पति': 'Jupiter',
  'शुक्र देव': 'Venus',
  'शुक्र': 'Venus',
  'शनि देव': 'Saturn',
  'शनि': 'Saturn',
  'राहु': 'Rahu',
  'केतु': 'Ketu',
};

export const TITHI_MAP_EN: Record<string, string> = {
  'पूर्णिमा': 'Purnima (Full Moon)',
  'अमावस्या': 'Amavasya (New Moon)',
  'प्रतिपदा': 'Pratipada',
  'द्वितीया': 'Dwitiya',
  'तृतीया': 'Tritiya',
  'चतुर्थी': 'Chaturthi',
  'पञ्चमी': 'Panchami',
  'पंचमी': 'Panchami',
  'षष्ठी': 'Shashthi',
  'सप्तमी': 'Saptami',
  'अष्टमी': 'Ashtami',
  'नवमी': 'Navami',
  'दशमी': 'Dashami',
  'एकादशी': 'Ekadashi',
  'द्वादशी': 'Dwadashi',
  'त्रयोदशी': 'Trayodashi',
  'चतुर्दशी': 'Chaturdashi',
};

export const NAKSHATRA_MAP_EN: Record<string, string> = {
  'अश्विनी': 'Ashwini',
  'भरणी': 'Bharani',
  'कृत्तिका': 'Krittika',
  'रोहिणी': 'Rohini',
  'मृગશિરા': 'Mrigashira',
  'मृगशिरा': 'Mrigashira',
  'आर्द्रा': 'Ardra',
  'पुनर्वसु': 'Punarvasu',
  'पुष्य': 'Pushya',
  'आश्लेषा': 'Ashlesha',
  'मघा': 'Magha',
  'पूर्वाफाल्गुनी': 'Purva Phalguni',
  'पूर्वा फाल्गुनी': 'Purva Phalguni',
  'उत्तराफाल्गुनी': 'Uttara Phalguni',
  'उत्तरा फाल्गुनी': 'Uttara Phalguni',
  'हस्त': 'Hasta',
  'चित्रा': 'Chitra',
  'स्वाति': 'Swati',
  'विशाखा': 'Vishakha',
  'अनुराधा': 'Anuradha',
  'ज्येष्ठा': 'Jyeshtha',
  'मूल': 'Mula',
  'पूर्वाषाढ़ा': 'Purva Ashadha',
  'पूर्वाषाढा': 'Purva Ashadha',
  'उत्तराषाढ़ा': 'Uttara Ashadha',
  'उत्तराषाढा': 'Uttara Ashadha',
  'श्रवण': 'Shravana',
  'धनिष्ठा': 'Dhanishta',
  'शतभिषा': 'Shatabhisha',
  'पूर्वाभाद्रपद': 'Purva Bhadrapada',
  'पूर्वा भाद्रपद': 'Purva Bhadrapada',
  'उत्तराभाद्रपद': 'Uttara Bhadrapada',
  'उत्तरा भाद्रपद': 'Uttara Bhadrapada',
  'रेवती': 'Revati',
};

export const YOGA_MAP_EN: Record<string, string> = {
  'विष्कम्भ': 'Vishkambha',
  'प्रीति': 'Priti',
  'आयुष्मान': 'Ayushman',
  'सौभाग्य': 'Saubhagya',
  'शोभन': 'Shobhana',
  'अतिगण्ड': 'Atiganda',
  'अतिगंड': 'Atiganda',
  'सुकर्मा': 'Sukarma',
  'धृति': 'Dhriti',
  'शूल': 'Shula',
  'गण्ड': 'Ganda',
  'गंड': 'Ganda',
  'वृद्धि': 'Vriddhi',
  'ध्रुव': 'Dhruva',
  'व्याघात': 'Vyaghata',
  'हर्षण': 'Harshana',
  'वज्र': 'Vajra',
  'सिद्धि': 'Siddhi',
  'व्यतीपात': 'Vyatipata',
  'वरीयान': 'Variyan',
  'परिघ': 'Parigha',
  'शिव': 'Shiva',
  'सिद्ध': 'Siddha',
  'साध्य': 'Sadhya',
  'शुभ': 'Shubha',
  'शुक्ल': 'Shukla',
  'ब्रह्म': 'Brahma',
  'ऐन्द्र': 'Aindra',
  'इन्द्र': 'Indra',
  'वैधृति': 'Vaidhriti',
};

export const KARANA_MAP_EN: Record<string, string> = {
  'बव': 'Bava',
  'बालव': 'Balava',
  'कौलव': 'Kaulava',
  'तैतिल': 'Taitila',
  'गर': 'Gara',
  'वणिज': 'Vanija',
  'विष्टि': 'Vishti (Bhadra)',
  'शकुनि': 'Shakuni',
  'चतुष्पाद': 'Chatushpada',
  'नाग': 'Naga',
  'किंस्तुघ्न': 'Kinstughna',
};

export const MASA_MAP_EN: Record<string, string> = {
  'चैत्र': 'Chaitra',
  'वैशाख': 'Vaishakha',
  'ज्येष्ठ': 'Jyeshtha',
  'आषाढ़': 'Ashadha',
  'आषाढ': 'Ashadha',
  'श्रावण': 'Shravana',
  'भाद्रपद': 'Bhadrapada',
  'भाद्र': 'Bhadrapada',
  'अश्विन': 'Ashwin',
  'आश्विन': 'Ashwin',
  'कार्तिक': 'Kartika',
  'मार्गशीर्ष': 'Margashirsha',
  'पौष': 'Pausha',
  'माघ': 'Magha',
  'फाल्गुन': 'Phalguna',
};

// ==========================================
// GUJARATI MAPS
// ==========================================
export const WEEKDAYS_MAP_GU: Record<string, string> = {
  'रविवार': 'રવિવાર',
  'सोमवार': 'સોમવાર',
  'मंगलवार': 'મંગળવાર',
  'बुधवार': 'બુધવાર',
  'गुरुवार': 'ગુરુવાર',
  'शुक्रवार': 'શુક્રવાર',
  'शनिवार': 'શનિવાર',
  'रवि': 'રવિ',
  'सोम': 'સોમ',
  'मंगल': 'મંગળ',
  'बुध': 'બુધ',
  'गुरु': 'ગુરુ',
  'शुक्र': 'શુક્ર',
  'शनि': 'શનિ',
};

export const PAKSHA_MAP_GU: Record<string, string> = {
  'शुक्ल पक्ष': 'શુક્લ પક્ષ',
  'कृष्ण पक्ष': 'કૃષ્ણ પક્ષ',
  'शुक्ल': 'શુક્લ',
  'कृष्ण': 'કૃષ્ણ',
};

export const RASHI_MAP_GU: Record<string, string> = {
  'मेष राशि': 'મેષ રાશિ',
  'वृषभ राशि': 'વૃષભ રાશિ',
  'मिथुन राशि': 'મિથુન રાશિ',
  'कर्क राशि': 'કર્ક રાશિ',
  'सिंह राशि': 'સિંહ રાશિ',
  'कन्या राशि': 'કન્યા રાશિ',
  'तुला राशि': 'તુલા રાશિ',
  'वृश्चिक राशि': 'વૃશ્ચિક રાશિ',
  'धनु राशि': 'ધન રાશિ',
  'मकर राशि': 'મકર રાશિ',
  'कुम्भ राशि': 'કુંભ રાશિ',
  'मीन राशि': 'મીન રાશિ',
  'मेष': 'મેષ',
  'वृषभ': 'વૃષભ',
  'मिथुन': 'મિથુન',
  'कर्क': 'કર્ક',
  'सिंह': 'સિંહ',
  'कन्या': 'કન્યા',
  'तुला': 'તુલા',
  'वृश्चिक': 'વૃશ્ચિક',
  'धनु': 'ધન',
  'मकर': 'મકર',
  'कुम्भ': 'કુંભ',
  'मीन': 'મીન',
};

export const PLANET_MAP_GU: Record<string, string> = {
  'सूर्य देव': 'સૂર્ય દેવ',
  'सूर्य': 'સૂર્ય',
  'चन्द्र देव': 'ચંદ્ર દેવ',
  'चन्द्र': 'ચંદ્ર',
  'चंद्र': 'ચંદ્ર',
  'मंगल देव': 'મંગળ દેવ',
  'मंगल': 'મંગળ',
  'बुध देव': 'બુધ દેવ',
  'बुध': 'બુધ',
  'गुरु देव': 'ગુરુ દેવ',
  'गुरु': 'ગુરુ',
  'बृहस्पति': 'બૃહસ્પતિ',
  'शुक्र देव': 'શુક્ર દેવ',
  'शुक्र': 'શુક્ર',
  'शनि देव': 'શનિ દેવ',
  'शनि': 'શનિ',
  'राहु': 'રાહુ',
  'केतु': 'કેતુ',
};

export const TITHI_MAP_GU: Record<string, string> = {
  'पूर्णिमा': 'પૂનમ (પૂર્ણિમા)',
  'अमावस्या': 'અમાસ (અમાવસ્યા)',
  'प्रतिपदा': 'એકમ (પ્રતિપદા)',
  'द्वितीया': 'બીજ (દ્વિતીયા)',
  'तृतीया': 'ત્રીજ (તૃતીયા)',
  'चतुर्थी': 'ચોથ (ચતુર્થી)',
  'पञ्चमी': 'પાંચમ (પંચમી)',
  'पंचमी': 'પાંચમ (પંચમી)',
  'षष्ठी': 'છઠ્ઠ (ષષ્ઠી)',
  'सप्तमी': 'સાતમ (સપ્તમી)',
  'अष्टमी': 'આઠમ (અષ્ટમી)',
  'नवमी': 'નોમ (નવમી)',
  'दशमी': 'દશમ (દશમી)',
  'एकादशी': 'અગિયારસ (એકાદશી)',
  'द्वादशी': 'બારસ (દ્વાદશી)',
  'त्रयोदशी': 'તેરસ (ત્રયોદશી)',
  'चतुर्दशी': 'ચૌદશ (ચતુર્દશી)',
};

export const NAKSHATRA_MAP_GU: Record<string, string> = {
  'अश्विनी': 'અશ્વિની',
  'भरणी': 'ભરણી',
  'कृत्तिका': 'કૃત્તિકા',
  'रोहिणी': 'રોહિણી',
  'मृगशिरा': 'મૃગશિરા',
  'आर्द्रा': 'આર્દ્રા',
  'पुनर्वसु': 'પુનર્વસુ',
  'पुष्य': 'પુષ્ય',
  'आश्लेषा': 'આશ્લેષા',
  'मघा': 'મઘા',
  'पूर्वाफाल्गुनी': 'પૂર્વા ફાલ્ગુની',
  'पूर्वा फाल्गुनी': 'પૂર્વા ફાલ્ગુની',
  'उत्तराफाल्गुनी': 'ઉત્તરા ફાલ્ગુની',
  'उत्तरा फाल्गुनी': 'ઉત્તરા ફાલ્ગુની',
  'हस्त': 'હસ્ત',
  'चित्रा': 'ચિત્રા',
  'स्वाति': 'સ્વાતિ',
  'विशाखा': 'વિશાખા',
  'अनुराधा': 'અનુરાધા',
  'ज्येष्ठा': 'જ્યેષ્ઠા',
  'मूल': 'મૂળ',
  'पूर्वाषाढ़ा': 'પૂર્વાષાઢા',
  'पूर्वाषाढा': 'પૂર્વાષાઢા',
  'उत्तराषाढ़ा': 'ઉત્તરાષાઢા',
  'उत्तराषाढा': 'ઉત્તરાષાઢા',
  'श्रवण': 'શ્રવણ',
  'धनिष्ठा': 'ધનિષ્ઠા',
  'शतभिषा': 'શતભિષા',
  'पूर्वाभाद्रपद': 'પૂર્વા ભાદ્રપદ',
  'पूर्वा भाद्रपद': 'પૂર્વા ભાદ્રપદ',
  'उत्तराभाद्रपद': 'ઉત્તરા ભાદ્રપદ',
  'उत्तरा भाद्रपद': 'ઉત્તરા ભાદ્રપદ',
  'रेवती': 'રેવતી',
};

export const YOGA_MAP_GU: Record<string, string> = {
  'विष्कम्भ': 'વિષ્કંભ',
  'प्रीति': 'પ્રીતિ',
  'आयुष्मान': 'આયુષ્માન',
  'सौभाग्य': 'સૌભાગ્ય',
  'शोभन': 'શોભન',
  'अतिगण्ड': 'અતિગંડ',
  'अतिगंड': 'અતિગંડ',
  'सुकर्मा': 'સુકર્મા',
  'धृति': 'ધૃતિ',
  'शूल': 'શૂળ',
  'गण्ड': 'ગંડ',
  'गंड': 'ગંડ',
  'वृद्धि': 'વૃદ્ધિ',
  'ध्रुव': 'ધ્રુવ',
  'व्याघात': 'વ્યાઘાત',
  'हर्षण': 'હર્ષણ',
  'वज्र': 'વજ્ર',
  'सिद्धि': 'સિદ્ધિ',
  'व्यतीपात': 'વ્યતીપાત',
  'वरीयान': 'વરીયાન',
  'परिघ': 'પરિઘ',
  'शिव': 'શિવ',
  'सिद्ध': 'સિદ્ધ',
  'साध्य': 'સાધ્ય',
  'शुभ': 'શુભ',
  'शुक्ल': 'શુક્લ',
  'ब्रह्म': 'બ્રહ્મ',
  'ऐन्द्र': 'ઐન્દ્ર',
  'इन्द्र': 'ઇન્દ્ર',
  'वैधृति': 'વૈધૃતિ',
};

export const KARANA_MAP_GU: Record<string, string> = {
  'बव': 'બવ',
  'बालव': 'બાલવ',
  'कौलव': 'કૌલવ',
  'तैतिल': 'તૈતિલ',
  'गर': 'ગર',
  'वणिज': 'વણિજ',
  'विष्टि': 'વિષ્ટિ (ભદ્રા)',
  'शकुनि': 'શકુનિ',
  'चतुष्पाद': 'ચતુષ્પાદ',
  'नाग': 'નાગ',
  'किंस्तुघ्न': 'કિંસ્તુઘ્ન',
};

export const MASA_MAP_GU: Record<string, string> = {
  'चैत्र': 'ચૈત્ર',
  'वैशाख': 'વૈશાખ',
  'ज्येष्ठ': 'જેઠ (જ્યેષ્ઠ)',
  'आषाढ़': 'અષાઢ',
  'आषाढ': 'અષાઢ',
  'श्रावण': 'શ્રાવણ',
  'भाद्रपद': 'ભાદરવો (ભાદ્રપદ)',
  'भाद्र': 'ભાદરવો',
  'अश्विन': 'આસો (આશ્વિન)',
  'आश्विन': 'આસો (આશ્વિન)',
  'कार्तिक': 'કારતક (કાર્તિક)',
  'मार्गशीर्ष': 'માગશર (માર્ગશીર્ષ)',
  'पौष': 'પોષ',
  'माघ': 'મહા (માઘ)',
  'फाल्गुन': 'ફાગણ (ફાલ્ગુન)',
};

// ==========================================
// GENERAL PHRASE REPLACEMENTS
// ==========================================
export const GENERAL_PHRASES_EN: [RegExp, string][] = [
  [/विक्रम संवत्/g, 'Vikram Samvat'],
  [/शक संवत्/g, 'Shaka Samvat'],
  [/संवत्/g, 'Samvat'],
  [/मास/g, 'Month'],
  [/पक्ष/g, 'Paksha'],
  [/चरण/g, 'Charan'],
  [/प्रथम चरण/g, 'First Charan'],
  [/द्वितीय चरण/g, 'Second Charan'],
  [/तृतीय चरण/g, 'Third Charan'],
  [/चतुर्थ चरण/g, 'Fourth Charan'],
  [/उत्तरायण/g, 'Uttarayana (Northward Sun)'],
  [/दक्षिणायन/g, 'Dakshinayana (Southward Sun)'],
  [/शिशिर/g, 'Shishira (Late Winter)'],
  [/वसन्त/g, 'Vasanta (Spring)'],
  [/ग्रीष्म/g, 'Grishma (Summer)'],
  [/वर्षा/g, 'Varsha (Monsoon)'],
  [/शरद/g, 'Sharad (Autumn)'],
  [/हेमन्त/g, 'Hemanta (Early Winter)'],
  [/सर्वार्थ सिद्धि योग/g, 'Sarvartha Siddhi Yoga (All-Accomplishing)'],
  [/अमृत सिद्धि योग/g, 'Amrit Siddhi Yoga (Nectarous Success)'],
  [/द्विपुष्कर योग/g, 'Dvipushkar Yoga'],
  [/त्रिपुष्कर योग/g, 'Tripushkar Yoga'],
  [/रवि योग/g, 'Ravi Yoga (Solar Blessings)'],
  [/आनन्दादि योग/g, 'Anandadi Yoga'],
  [/शुभ योग/g, 'Auspicious Yoga'],
  [/पञ्चक मुक्त/g, 'Panchak Free'],
  [/पंचक मुक्त/g, 'Panchak Free'],
  [/भद्रा मुक्त/g, 'Bhadra Free'],
  [/रोग पञ्चक/g, 'Roga Panchak (Illness Indicator)'],
  [/मृत्यु पञ्चक/g, 'Mrityu Panchak'],
  [/अग्नि पञ्चक/g, 'Agni Panchak'],
  [/राज पञ्चक/g, 'Raja Panchak (Auspicious)'],
  [/चोर पञ्चक/g, 'Chora Panchak'],
  [/स्वर्ग लोक भद्रा/g, 'Swarga Loka Bhadra (Auspicious)'],
  [/पाताल लोक भद्रा/g, 'Patala Loka Bhadra (Auspicious)'],
  [/पाताल लोक/g, 'Patala Loka'],
  [/मृत्यु लोक भद्रा/g, 'Mrityu Loka Bhadra (Inauspicious)'],
  [/मृत्यु लोक/g, 'Mrityu Loka'],
  [/अभिजित मुहूर्त/g, 'Abhijit Muhurat'],
  [/राहु काल/g, 'Rahu Kaal'],
  [/राहुकाल/g, 'Rahu Kaal'],
  [/यमगंड/g, 'Yamaganda'],
  [/यमगण्ड/g, 'Yamaganda'],
  [/गुलिक काल/g, 'Gulika Kaal'],
  [/गुलिककाल/g, 'Gulika Kaal'],
  [/अमृत काल/g, 'Amrit Kaal'],
  [/ब्रह्म मुहूर्त/g, 'Brahma Muhurat'],
  [/गोधूलि मुहूर्त/g, 'Godhuli Muhurat'],
  [/दिशाशूल/g, 'Dishashool'],
  [/पूर्व/g, 'East'],
  [/पश्चिम/g, 'West'],
  [/उत्तर/g, 'North'],
  [/दक्षिण/g, 'South'],
  [/ईशान/g, 'North-East'],
  [/आग्नेय/g, 'South-East'],
  [/नैऋत्य/g, 'South-West'],
  [/वायव्य/g, 'North-West'],
  [/शुभ/g, 'Auspicious'],
  [/अशुभ/g, 'Inauspicious'],
  [/त्याज्य/g, 'Avoidable'],
  [/वर्जित/g, 'Prohibited'],
];

export const GENERAL_PHRASES_GU: [RegExp, string][] = [
  [/विक्रम संवत्/g, 'વિક્રમ સંવત'],
  [/शक संवत्/g, 'શક સંવત'],
  [/संवत्/g, 'સંવત'],
  [/मास/g, 'માસ'],
  [/पक्ष/g, 'પક્ષ'],
  [/चरण/g, 'ચરણ'],
  [/प्रथम चरण/g, 'પ્રથમ ચરણ'],
  [/द्वितीय चरण/g, 'દ્વિતીય ચરણ'],
  [/तृतीय चरण/g, 'તૃતીય ચરણ'],
  [/चतुर्थ चरण/g, 'ચતુર્થ ચરણ'],
  [/उत्तरायण/g, 'ઉત્તરાયણ'],
  [/दक्षिणायन/g, 'દક્ષિણાયન'],
  [/शिशिर/g, 'શિશિર ઋતુ'],
  [/वसन्त/g, 'વસંત ઋતુ'],
  [/ग्रीष्म/g, 'ગ્રીષ્મ ઋતુ'],
  [/वर्षा/g, 'વર્ષા ઋતુ'],
  [/शरद/g, 'શરદ ઋતુ'],
  [/हेमन्त/g, 'હેમંત ઋતુ'],
  [/सर्वार्थ सिद्धि योग/g, 'સર્વાર્થ સિદ્ધિ યોગ'],
  [/अमृत सिद्धि योग/g, 'અમૃત સિદ્ધિ યોગ'],
  [/द्विपुष्कर योग/g, 'દ્વિપુષ્કર યોગ'],
  [/त्रिपुष्कर योग/g, 'ત્રિપુષ્કર યોગ'],
  [/रवि योग/g, 'રવિ યોગ'],
  [/आनन्दादि योग/g, 'આનંદાદિ યોગ'],
  [/शुभ योग/g, 'શુભ યોગ'],
  [/पञ्चक मुक्त/g, 'પંચક મુક્ત'],
  [/पंचक मुक्त/g, 'પંચક મુક્ત'],
  [/भद्रा मुक्त/g, 'ભદ્રા મુક્ત'],
  [/रोग पञ्चक/g, 'રોગ પંચક'],
  [/मृत्यु पञ्चक/g, 'મૃત્યુ પંચક'],
  [/अग्नि पञ्चक/g, 'અગ્નિ પંચક'],
  [/राज पञ्चक/g, 'રાજ પંચક (શુભ)'],
  [/चोर पञ्चक/g, 'ચોર પંચક'],
  [/स्वर्ग लोक भद्रा/g, 'સ્વર્ગ લોક ભદ્રા (શુભ)'],
  [/पाताल लोक भद्रा/g, 'પાતાળ લોક ભદ્રા (શુભ)'],
  [/पाताल लोक/g, 'પાતાળ લોક'],
  [/मृत्यु लोक भद्रा/g, 'મૃત્યુ લોક ભદ્રા (વર્જિત)'],
  [/मृत्यु लोक/g, 'મૃત્યુ લોક'],
  [/अभिजित मुहूर्त/g, 'અભિજિત મુહૂર્ત'],
  [/राहु काल/g, 'રાહુ કાળ'],
  [/राहुकाल/g, 'રાહુ કાળ'],
  [/यमगंड/g, 'યમગંડ'],
  [/यमगण्ड/g, 'યમગંડ'],
  [/गुलिक काल/g, 'ગુલિક કાળ'],
  [/गुलिककाल/g, 'ગુલિક કાળ'],
  [/अमृत काल/g, 'અમૃત કાળ'],
  [/ब्रह्म मुहूर्त/g, 'બ્રહ્મ મુહૂર્ત'],
  [/गोधूलि मुहूर्त/g, 'ગોધૂલિ મુહૂર્ત'],
  [/दिशाशूल/g, 'દિશાશૂળ'],
  [/पूर्व/g, 'પૂર્વ'],
  [/पश्चिम/g, 'પશ્ચિમ'],
  [/उत्तर/g, 'ઉત્તર'],
  [/दक्षिण/g, 'દક્ષિણ'],
  [/ईशान/g, 'ઈશાન'],
  [/आग्नेय/g, 'અગ્નિ'],
  [/नैऋत्य/g, 'નૈઋત્ય'],
  [/वायव्य/g, 'વાયવ્ય'],
  [/शुभ/g, 'શુભ'],
  [/अशुभ/g, 'અશુભ'],
  [/त्याज्य/g, 'ત્યાજ્ય'],
  [/वर्जित/g, 'વર્જિત'],
];

/**
 * Universal Vedic translator supporting English ('en'), Gujarati ('gu'), and Hindi ('hi')
 */
export function trVedic(term: string | undefined | null): string {
  if (!term) return '';
  const currentLang = i18n.language || 'hi';

  if (currentLang === 'en') {
    let result = term;
    if (WEEKDAYS_MAP_EN[result]) return WEEKDAYS_MAP_EN[result];
    if (PAKSHA_MAP_EN[result]) return PAKSHA_MAP_EN[result];
    if (RASHI_MAP_EN[result]) return RASHI_MAP_EN[result];
    if (PLANET_MAP_EN[result]) return PLANET_MAP_EN[result];
    if (TITHI_MAP_EN[result]) return TITHI_MAP_EN[result];
    if (NAKSHATRA_MAP_EN[result]) return NAKSHATRA_MAP_EN[result];
    if (YOGA_MAP_EN[result]) return YOGA_MAP_EN[result];
    if (KARANA_MAP_EN[result]) return KARANA_MAP_EN[result];
    if (MASA_MAP_EN[result]) return MASA_MAP_EN[result];

    for (const [regex, replacement] of GENERAL_PHRASES_EN) {
      result = result.replace(regex, replacement);
    }
    for (const [k, v] of Object.entries(PAKSHA_MAP_EN)) {
      if (result.includes(k)) result = result.replace(new RegExp(k, 'g'), v);
    }
    for (const [k, v] of Object.entries(TITHI_MAP_EN)) {
      if (result.includes(k)) result = result.replace(new RegExp(k, 'g'), v);
    }
    for (const [k, v] of Object.entries(NAKSHATRA_MAP_EN)) {
      if (result.includes(k)) result = result.replace(new RegExp(k, 'g'), v);
    }
    for (const [k, v] of Object.entries(YOGA_MAP_EN)) {
      if (result.includes(k)) result = result.replace(new RegExp(k, 'g'), v);
    }
    for (const [k, v] of Object.entries(KARANA_MAP_EN)) {
      if (result.includes(k)) result = result.replace(new RegExp(k, 'g'), v);
    }
    for (const [k, v] of Object.entries(MASA_MAP_EN)) {
      if (result.includes(k)) result = result.replace(new RegExp(k, 'g'), v);
    }
    for (const [k, v] of Object.entries(RASHI_MAP_EN)) {
      if (result.includes(k)) result = result.replace(new RegExp(k, 'g'), v);
    }
    for (const [k, v] of Object.entries(WEEKDAYS_MAP_EN)) {
      if (result.includes(k)) result = result.replace(new RegExp(k, 'g'), v);
    }
    return result;
  }

  if (currentLang === 'gu') {
    let result = term;
    if (WEEKDAYS_MAP_GU[result]) return WEEKDAYS_MAP_GU[result];
    if (PAKSHA_MAP_GU[result]) return PAKSHA_MAP_GU[result];
    if (RASHI_MAP_GU[result]) return RASHI_MAP_GU[result];
    if (PLANET_MAP_GU[result]) return PLANET_MAP_GU[result];
    if (TITHI_MAP_GU[result]) return TITHI_MAP_GU[result];
    if (NAKSHATRA_MAP_GU[result]) return NAKSHATRA_MAP_GU[result];
    if (YOGA_MAP_GU[result]) return YOGA_MAP_GU[result];
    if (KARANA_MAP_GU[result]) return KARANA_MAP_GU[result];
    if (MASA_MAP_GU[result]) return MASA_MAP_GU[result];

    for (const [regex, replacement] of GENERAL_PHRASES_GU) {
      result = result.replace(regex, replacement);
    }
    for (const [k, v] of Object.entries(PAKSHA_MAP_GU)) {
      if (result.includes(k)) result = result.replace(new RegExp(k, 'g'), v);
    }
    for (const [k, v] of Object.entries(TITHI_MAP_GU)) {
      if (result.includes(k)) result = result.replace(new RegExp(k, 'g'), v);
    }
    for (const [k, v] of Object.entries(NAKSHATRA_MAP_GU)) {
      if (result.includes(k)) result = result.replace(new RegExp(k, 'g'), v);
    }
    for (const [k, v] of Object.entries(YOGA_MAP_GU)) {
      if (result.includes(k)) result = result.replace(new RegExp(k, 'g'), v);
    }
    for (const [k, v] of Object.entries(KARANA_MAP_GU)) {
      if (result.includes(k)) result = result.replace(new RegExp(k, 'g'), v);
    }
    for (const [k, v] of Object.entries(MASA_MAP_GU)) {
      if (result.includes(k)) result = result.replace(new RegExp(k, 'g'), v);
    }
    for (const [k, v] of Object.entries(RASHI_MAP_GU)) {
      if (result.includes(k)) result = result.replace(new RegExp(k, 'g'), v);
    }
    for (const [k, v] of Object.entries(WEEKDAYS_MAP_GU)) {
      if (result.includes(k)) result = result.replace(new RegExp(k, 'g'), v);
    }
    return result;
  }

  return term;
}

export function trPlanet(planet: string): string {
  const currentLang = i18n.language || 'hi';
  if (currentLang === 'en' && PLANET_MAP_EN[planet]) {
    return PLANET_MAP_EN[planet];
  }
  if (currentLang === 'gu' && PLANET_MAP_GU[planet]) {
    return PLANET_MAP_GU[planet];
  }
  return planet;
}

export function trRashi(rashi: string): string {
  const currentLang = i18n.language || 'hi';
  if (currentLang === 'en' && RASHI_MAP_EN[rashi]) {
    return RASHI_MAP_EN[rashi];
  }
  if (currentLang === 'gu' && RASHI_MAP_GU[rashi]) {
    return RASHI_MAP_GU[rashi];
  }
  return rashi;
}

export function trWeekday(weekday: string): string {
  const currentLang = i18n.language || 'hi';
  if (currentLang === 'en' && WEEKDAYS_MAP_EN[weekday]) {
    return WEEKDAYS_MAP_EN[weekday];
  }
  if (currentLang === 'gu' && WEEKDAYS_MAP_GU[weekday]) {
    return WEEKDAYS_MAP_GU[weekday];
  }
  return weekday;
}

export function trChoghadiyaMeaning(meaning: string, hindiName?: string): string {
  const currentLang = i18n.language || 'hi';
  if (currentLang === 'en') {
    switch (hindiName) {
      case 'अमृत':
        return 'Best, nectarous, highly auspicious for all works';
      case 'शुभ':
        return 'Auspicious, excellent for religious, academic and business activities';
      case 'लाभ':
        return 'Profitable, wealth-generating, trade and business venture';
      case 'चर':
        return 'Dynamic, auspicious for travel, journey and vehicles';
      case 'चल':
        return 'Neutral, suitable for routine daily activities';
      case 'रोग':
        return 'Inauspicious, indicates illness or disputes, avoid starts';
      case 'काल':
        return 'Harmful, ruled by Saturn, leads to loss and delay, avoid';
      case 'उद्वेग':
        return 'Stressful, causes anxiety and disputes, avoid important tasks';
      default:
        return meaning;
    }
  }
  if (currentLang === 'gu') {
    switch (hindiName) {
      case 'अमृत':
        return 'સર્વોત્તમ, અમૃતતુલ્ય, તમામ કાર્યોમાં અક્ષય સફળતા આપે';
      case 'शुभ':
        return 'શુભ, પૂજા-પાઠ, વિદ્યા અને માંગલિક કાર્યો માટે ઉત્તમ';
      case 'लाभ':
        return 'લાભદાયી, વેપાર-વાણિજ્ય અને આર્થિક વૃદ્ધિ માટે અનુકૂળ';
      case 'चर':
        return 'ગતિશીલ, યાત્રા, પ્રવાસ અને વાહન કાર્ય માટે શ્રેષ્ઠ';
      case 'चल':
        return 'મધ્યમ, રોજિંદા સામાન્ય કાર્યો માટે યોગ્ય';
      case 'रोग':
        return 'અશુભ, વિવાદ અને રોગ પીડા કરાવનાર, નવા કાર્ય ત્યાજ્ય';
      case 'काल':
        return 'હાનિકારક, શનિ પ્રભાવિત, વિલંબ અને નુકસાનકારક, ત્યાજ્ય';
      case 'उद्वेग':
        return 'તણાવકારક, ચિંતા અને મનોવ્યથા કરાવનાર, મહત્વના કામ ટાળો';
      default:
        return meaning;
    }
  }
  return meaning;
}
