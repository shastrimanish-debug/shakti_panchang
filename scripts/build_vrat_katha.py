# -*- coding: utf-8 -*-
import json

data_ts_header = """import { VratKathaItem, VRAT_KATHA_CATEGORIES, VRAT_KATHA_DATA } from '../data/vratKathaData';

export const VRAT_KATHA_CATEGORIES_LOCALIZED: Record<string, { id: string; label: string }[]> = {
  hi: [
    { id: 'all', label: 'सभी कथाएं व आरतियाँ' },
    { id: 'ekadashi', label: 'एकादशी व्रत कथा' },
    { id: 'vrat', label: 'प्रमुख व्रत व स्थापना' },
    { id: 'festival', label: 'पर्व कथा' },
    { id: 'aarti', label: 'आरती संग्रह & मंत्र' },
  ],
  gu: [
    { id: 'all', label: 'બધી કથાઓ અને આરતી' },
    { id: 'ekadashi', label: 'એકાદશી વ્રત કથા' },
    { id: 'vrat', label: 'મુખ્ય વ્રત અને સ્થાપના' },
    { id: 'festival', label: 'પર્વ કથા' },
    { id: 'aarti', label: 'આરતી સંગ્રહ અને મંત્રો' },
  ],
  en: [
    { id: 'all', label: 'All Kathas & Aartis' },
    { id: 'ekadashi', label: 'Ekadashi Vrat Katha' },
    { id: 'vrat', label: 'Major Vrats & Rituals' },
    { id: 'festival', label: 'Festival Legends' },
    { id: 'aarti', label: 'Aarti Collection & Mantras' },
  ],
};

export function getLocalizedVratCategories(lang: string) {
  return VRAT_KATHA_CATEGORIES_LOCALIZED[lang] || VRAT_KATHA_CATEGORIES_LOCALIZED.en;
}

export interface LocalizedKathaItemEntry {
  title: string;
  subtitle: string;
  vedaSource: string;
  shlokMeaning: string;
  description: string;
  rules: string[];
  kathaSummary: string[];
}

export const KATHA_TRANSLATIONS: Record<
  string,
  {
    gu: LocalizedKathaItemEntry;
    en: LocalizedKathaItemEntry;
  }
> = """

translations = {
  "satyanarayan-katha": {
    "gu": {
      "title": "શ્રી સત્યનારાયણ વ્રત કથા (સ્કંદપુરાણ રેવાખંડ, સાતેય અધ્યાય ગુજરાતીમાં)",
      "subtitle": "સ્કંદપુરાણ, રેવાખંડ: સાત અધ્યાય - શ્લોક અને દરેક અધ્યાયની સંપૂર્ણ ગુજરાતી કથા",
      "vedaSource": "સ્કંદપુરાણ, રેવાખંડ (અધ્યાય ૧ થી ૭)",
      "shlokMeaning": "જે સત્યના વ્રતને ધારણ કરનારા છે, સત્યમાં જ તત્પર છે, ત્રણેય કાળમાં સત્ય સ્વરૂપ છે અને સમસ્ત સત્યના મૂળ ઉદ્ગમ છે, તેવા ભગવાન સત્યનારાયણના શરણે હું જાઉં છું.",
      "description": "સ્કંદપુરાણના રેવાખંડમાં વર્ણવેલી શ્રી સત્યનારાયણ ભગવાનની સંપૂર્ણ વ્રત કથા. આ કથા સાંભળવાથી કલિયુગમાં સર્વ મનોકામનાઓ પૂર્ણ થાય છે અને ઘરમાં સુખ, શાંતિ અને સમૃદ્ધિ આવે છે.",
      "rules": [
        "પ્રભાતે વહેલા ઊઠીને સ્નાન કરી નિર્મળ વસ્ત્રો ધારણ કરો અને વ્રતનો સંકલ્પ લો.",
        "પૂજા મંડપમાં કેળના સ્તંભો, આંબાના પાન અને પુષ્પોથી વેદી શણગારો.",
        "સત્યનારાયણ ભગવાનની મૂર્તિ કે સોપારી સ્થાપી પંચામૃત, ફળ, પાન, સોપારી, કેળાં અને શીરો/પંજરીનો ભોગ ધરાવો.",
        "પરિવાર અને બ્રાહ્મણ સાથે બેસીને શ્રદ્ધાપૂર્વક કથાનું શ્રવણ કરો અને અંતમાં આરતી કરી પ્રસાદ વહેંચો."
      ],
      "kathaSummary": [
        "॥ પ્રથમ અધ્યાય: નૈમિષારણ્યમાં શૌનક ઋષિનો પ્રશ્ન ॥\nનૈમિષારણ્ય તીર્થમાં શૌનકાદિ મુનિઓએ સૂતજીને પૂછ્યું કે કલિયુગમાં મનુષ્યો અલ્પાયુ અને ચિંતાગ્રસ્ત હશે, તો કયા સરળ વ્રતથી ઉત્તમ પુણ્ય અને મનોવાંછિત ફળ મળે? સૂતજીએ કહ્યું કે આ જ પ્રશ્ન નારદજીએ ભગવાન વિષ્ણુને પૂછ્યો હતો અને ભગવાને શ્રી સત્યનારાયણ વ્રતનો ઉપદેશ આપ્યો હતો.",
        "॥ દ્વિતીય અધ્યાય: કાશીના ગરીબ બ્રાહ્મણની કથા ॥\nકાશી નગરીમાં એક અત્યંત નિર્ધન બ્રાહ્મણ ભિક્ષા માંગી નિર્વાહ કરતો હતો. ભગવાને વૃદ્ધ બ્રાહ્મણનું રૂપ ધરી તેને શ્રી સત્યનારાયણ વ્રત કરવાની વિધિ બતાવી. બ્રાહ્મણે ભક્તિભાવથી વ્રત કર્યું અને તેના સર્વ દુઃખો દૂર થઈ ગયા અને તે ધનધાન્યવાન બન્યો.",
        "॥ તૃતીય અધ્યાય: લાકડા વેચનાર કઠિયારાનો ઉદ્ધાર ॥\nએક દિવસ એ જ બ્રાહ્મણ વ્રત કરતો હતો ત્યારે એક કઠિયારો તરસ્યો થઈ ત્યાં આવ્યો. તેણે વ્રતની મહિમા જાણી સંકલ્પ કર્યો કે આજે લાકડાં વેચી જે ધન મળશે તેનાથી સત્યનારાયણની પૂજા કરીશ. તે દિવસે બમણું ધન મળ્યું અને તેણે ભક્તિભાવથી વ્રત કર્યું, જેના ફળસ્વરૂપે તેને પુત્રરત્ન અને અખંડ સમૃદ્ધિ પ્રાપ્ત થઈ.",
        "॥ ચતુર્થ અધ્યાય: સાધુ વાણિયા અને કલાવતીની કથા ॥\nઉલ્કામુખ નામના રાજા સમુદ્ર કિનારે વ્રત કરતા હતા ત્યારે સાધુ નામનો વાણિયો ત્યાં આવ્યો. તેણે સંતાન પ્રાપ્તિ માટે વ્રતનો સંકલ્પ કર્યો. તેને કલાવતી નામની સુંદર પુત્રી પ્રાપ્ત થઈ, પરંતુ તેણે વ્રત કરવાનું ટાળ્યું. કલાવતીના વિવાહ પછી પણ વ્રત ભૂલી જતાં ભગવાન રુષ્ટ થયા અને વેપારમાં તેના પર ચોરીનો ખોટો આરોપ લાગતાં રાજા ચંદ્રકેતુએ તેને અને તેના જમાઈને કેદ કર્યા.",
        "॥ પંચમ અધ્યાય: કારાગાર મુક્તિ અને રાજાનું સ્વપ્ન ॥\nસાધુ વાણિયાનું ઘર પણ લૂંટાઈ ગયું. તેની પત્ની લીલાવતી અને પુત્રી કલાવતી ભિક્ષા માંગવા લાગ્યા. એક દિવસ કલાવતીએ મંદિરમાં સત્યનારાયણની કથા સાંભળી અને પ્રસાદ લીધો. લીલાવતીએ પણ પસ્તાવો કરી વ્રત કર્યું. ભગવાને રાજા ચંદ્રકેતુને સ્વપ્નમાં આદેશ આપ્યો કે બંને વાણિયા નિર્દોષ છે, તેમને મુક્ત કરો અને તેમનું ધન બમણું કરીને પાછું આપો.",
        "॥ ષષ્ઠ અધ્યાય: જહાજ અને પ્રસાદની ઉપેક્ષા ॥\nમુક્ત થઈ સાધુ વાણિયો વહાણ લઈને નીકળ્યો ત્યારે ભગવાને સંન્યાસી રૂપે પૂછ્યું કે વહાણમાં શું છે? વાણિયાએ ઘમંડથી કહ્યું કે માત્ર વેલા અને પાંદડાં છે. ભગવાને તથાસ્તુ કહ્યું અને ધન પાંદડાં થઈ ગયું. વાણિયાએ ક્ષમા માંગી ત્યારે ફરી ધન પ્રાપ્ત થયું. ઘરે પહોંચી કલાવતી પતિના મિલનની ઉતાવળમાં પ્રસાદ ખાધા વગર દોડી ગઈ, જેથી તેનું વહાણ જળમાં ડૂબી ગયું. પશ્ચાત્તાપ કરી પાછા આવી પ્રસાદ ગ્રહણ કર્યો ત્યારે જમાઈ અને વહાણ સહીસલામત પાછા મળ્યા.",
        "॥ સપ્તમ અધ્યાય: રાજા તુંગધ્વજ અને ગોવાળોની કથા ॥\nરાજા તુંગધ્વજે જંગલમાં ગોવાળોને સત્યનારાયણની પૂજા કરતા જોયા પરંતુ અભિમાનવશ પ્રણામ ન કર્યા કે પ્રસાદ ન લીધો. પરિણામે તેમના સો પુત્રો અને રાજ્ય નાશ પામ્યા. રાજાએ ભૂલ સ્વીકારી ગોવાળો સાથે વ્રત કર્યું અને પ્રસાદ લીધો ત્યારે ભગવાનની કૃપાથી રાજ્ય અને પુત્રો પુનઃ પ્રાપ્ત થયા. અંતે સર્વે વૈકુંઠધામને પામ્યા."
      ]
    },
    "en": {
      "title": "Shri Satyanarayan Vrat Katha (Skanda Purana Reva Khanda, All 7 Chapters in English)",
      "subtitle": "Skanda Purana, Reva Khanda: Seven Chapters with verses and comprehensive narrative",
      "vedaSource": "Skanda Purana, Reva Khanda (Chapters 1 to 7)",
      "shlokMeaning": "I take refuge in Lord Satyanarayana, who embodies the vow of truth, who is devoted to truth, who is the eternal truth in all three times, and who is the ultimate source of all existence.",
      "description": "The complete sacred Katha of Lord Satyanarayan from Skanda Purana. Reciting or listening to this story bestows peace, prosperity, resolution of obstacles, and spiritual liberation in the Kali Yuga.",
      "rules": [
        "Wake up early at Brahma Muhurta, take a purifying bath, and take a solemn vow (Sankalpa).",
        "Decorate the puja altar with banana trunks, mango leaves, flowers, and holy cloth.",
        "Install the idol or betel nut representation of Lord Satyanarayan, offering Panchamrita, fresh fruits, betel leaves, bananas, and panjiri/prasad.",
        "Listen to the story with devotion alongside family and friends, conclude with Aarti, and partake in the sacred Prasad."
      ],
      "kathaSummary": [
        "॥ Chapter 1: The Inquiry of Sage Shaunaka in Naimisharanya ॥\nIn the sacred forest of Naimisharanya, sage Shaunaka asked Suta Goswami: In the age of Kali, humans have short lives and endless anxieties; by what simple vow can they attain supreme virtue and fulfill their desires? Suta revealed that sage Narada had asked the same question to Lord Vishnu, who prescribed the Satyanarayan Vrat.",
        "॥ Chapter 2: The Poor Brahmin of Varanasi ॥\nIn the holy city of Kashi, an impoverished Brahmin struggled for food. Lord Vishnu appeared in the guise of an elderly ascetic and instructed him to perform the Satyanarayan Puja. The Brahmin performed it with pure devotion, and all his poverty was eradicated, blessing him with abundance.",
        "॥ Chapter 3: The Salvation of the Woodcutter ॥\nWhile the Brahmin was performing the vow, a thirsty woodcutter arrived. Learning about the glory of Lord Satyanarayan, he pledged to use that day's earnings to perform the puja. He received double the price for his firewood, performed the ritual, and was blessed with sons and everlasting happiness.",
        "॥ Chapter 4: The Merchant Sadhu and Kalavati ॥\nA wealthy merchant named Sadhu observed King Ulkamukha performing the vow and resolved to perform it once he had a child. A beautiful daughter, Kalavati, was born to his wife Lilavati, yet he postponed the vow repeatedly. After Kalavati's marriage, he still forgot his promise. Consequently, while trading in Ratnasarapur, he and his son-in-law were falsely accused of royal theft and imprisoned by King Chandraketu.",
        "॥ Chapter 5: Release from Prison and the King's Dream ॥\nBack home, thieves plundered the merchant's wealth. Mother and daughter wandered begging. One evening, Kalavati witnessed a Satyanarayan Puja in a Brahmin's home and partook of the prasad. Realizing their neglect, Lilavati performed the vow. Pleased, Lord Satyanarayan commanded King Chandraketu in a dream to release the innocent merchants immediately and return their wealth twofold.",
        "॥ Chapter 6: The Testing at Sea and Disregard of Prasad ॥\nOn their return journey, Lord Satyanarayan tested the merchant in the guise of a wandering monk, asking what was aboard his ship. Arrogantly, the merchant replied it was merely dry leaves. The Lord said 'So be it,' and all jewels turned to leaves. Repenting sincerely, the merchant prayed, and his fortune was restored. Reaching his home port, daughter Kalavati rushed to meet her husband without eating the holy prasad; instantly, his boat sank. Only when she returned, confessed, and revered the prasad did the ship and her husband resurface safely.",
        "॥ Chapter 7: King Tungadhwaja and the Cowherds ॥\nKing Tungadhwaja encountered cowherd boys performing the Satyanarayan Vrat in the woods. Full of royal pride, he refused to bow or accept the prasad. Consequently, his sons perished and his kingdom declined. Humbled, the king returned to the forest, worshipped Lord Satyanarayan alongside the cowherds, and partook of the prasad, restoring his kingdom and family."
      ]
    }
  },
  "ganpati-sthapana-pujan": {
    "gu": {
      "title": "શ્રી ગણેશ સ્થાપના અને સંપૂર્ણ વૈદિક પૂજન વિધિ",
      "subtitle": "ગણેશ પુરાણ, મુદ્ગલ પુરાણ અને વૈદિક પદ્ધતિથી પ્રાણપ્રતિષ્ઠા અને ષોડશોપચાર પૂજન",
      "vedaSource": "ગણેશ પુરાણ અને અથર્વશીર્ષ",
      "shlokMeaning": "જેમનું મુખ વક્ર છે, શરીર વિશાળ છે અને જે કરોડો સૂર્ય સમાન તેજસ્વી છે, તેવા ભગવાન ગણેશ મારા તમામ કાર્યો નિર્વિઘ્ને પૂર્ણ કરો.",
      "description": "શ્રી ગણેશ ઉત્સવ અને કોઈપણ શુભ કાર્યના પ્રારંભે ભગવાન ગણેશની સ્થાપના, ષોડશોપચાર પૂજન, દૂર્વા અર્પણ અને અથર્વશીર્ષ પાઠની સંપૂર્ણ શાસ્ત્રોક્ત વિધિ.",
      "rules": [
        "ઈશાન અથવા ઉત્તર દિશામાં બાજોઠ પર લાલ કે પીળું વસ્ત્ર પાથરી ચોખાની ઢગલી પર કળશ સ્થાપના કરો.",
        "ગણેશજીની મૂર્તિને સ્નાન કરાવી ચંદન, કંકુ, અક્ષત અને સિંદૂર અર્પણ કરો.",
        "ગણેશજીને પ્રિય ૨૧ દૂર્વા (દુર્વાંકુર) અને મોદક/લાડુનો ભોગ ધરાવો."
      ],
      "kathaSummary": [
        "॥ પગથિયું ૧: આસન, આચમન અને પવિત્રીકરણ ॥\nશુભ મુહૂર્તમાં ઉત્તરાભિમુખ કે પૂર્વાભિમુખ બેસી ત્રણ વાર આચમન કરો: 'ૐ કેશવાય નમઃ, ૐ નારાયણાય નમઃ, ૐ માધવાય નમઃ' અને હાથ ધોઈ લો. હાથમાં પવિત્રી ધારણ કરી સ્વસ્તિવાચન મંત્રો સાથે સમગ્ર પૂજા સામગ્રી અને પોતાના પર ગંગાજળ છાંટો.",
        "॥ પગથિયું ૨: સંકલ્પ અને કળશ સ્થાપના ॥\nહાથમાં જળ, અક્ષત, પુષ્પ અને દક્ષિણા લઈ દેશ-કાળ અને પોતાના ગોત્ર-નામ સાથે શુભ સંકલ્પ બોલો. ત્યારબાદ બાજોઠ પર અષ્ટદળ કમળ દોરી જળ ભરેલો તાંબાનો કળશ મૂકો. કળશમાં ગંગાજળ, સોપારી, સિક્કો અને પંચપલ્લવ (આંબાના પાન) મૂકી ઉપર નાળિયેર સ્થાપિત કરો.",
        "॥ પગથિયું ૩: શ્રી ગણેશ પ્રાણપ્રતિષ્ઠા અને ષોડશોપચાર ॥\nગણેશજીની પ્રતિમાને સ્પર્શ કરી 'ૐ અસ્ય પ્રાણાઃ પ્રતિષ્ઠન્તુ' મંત્ર બોલી પ્રાણપ્રતિષ્ઠા કરો. ત્યારબાદ પાદ્ય, અર્ઘ્ય, આચમનીય, પંચામૃત સ્નાન, શુદ્ધોદક સ્નાન કરાવો. વસ્ત્ર અને યજ્ઞોપવીત અર્પણ કરી રક્ત ચંદન, કંકુ, અક્ષત અને સિંદૂર લગાવો. ૨૧ દૂર્વા મંત્ર સાથે અર્પણ કરો.",
        "॥ પગથિયું ૪: મોદક નૈવેદ્ય, આરતી અને ક્ષમા પ્રાર્થના ॥\nમોદક અથવા લાડુનો ભોગ ધરાવી આચમન કરાવો. તાંબૂલ (પાન-સોપારી) અને દક્ષિણા અર્પણ કરો. કપૂર કે ઘીના દીવાથી આરતી ઉતારી મંત્રપુષ્પાંજલિ અર્પણ કરો અને અંતમાં 'આવાહનં ન જાનામિ...' કહી પૂજામાં રહી ગયેલી ત્રુટિઓ માટે ક્ષમા યાચના કરો."
      ]
    },
    "en": {
      "title": "Shri Ganesh Sthapana & Complete Vedic Puja Vidhi",
      "subtitle": "Ganesh Purana, Mudgala Purana & Vedic Prana-Pratishtha with 16-step worship",
      "vedaSource": "Ganesh Purana & Atharvashirsha",
      "shlokMeaning": "O Lord with the curved trunk and immense cosmic form, whose radiance equals millions of suns, please remove all obstacles from my endeavors forever.",
      "description": "The authentic scriptural guidelines for invoking Lord Ganesha, establishing the sacred altar, 16-step Shodashopachara worship, offering sacred Durva grass, and chanting Ganapati Atharvashirsha.",
      "rules": [
        "Place a red or yellow cloth on a wooden pedestal facing East or North-East, and set the Kalash on unbroken rice grains.",
        "Anoint Lord Ganesha with fragrant water, sandalwood paste, kumkum, and vermilion.",
        "Offer 21 blades of sacred Durva grass, red hibiscus flowers, and modak sweets with full devotion."
      ],
      "kathaSummary": [
        "॥ Step 1: Sacred Seat, Purification & Achamana ॥\nSit facing East or North in the auspicious Muhurta. Perform three sips of sanctified water (Achamana) chanting 'Om Keshavaya Namah, Om Narayanaya Namah, Om Madhavaya Namah'. Sprinkle Ganga water over yourself and the sacred altar implements to invoke inner and outer purity.",
        "॥ Step 2: Sacred Sankalpa & Kalash Consecration ॥\nHold sanctified water, unbroken rice (Akshata), flowers, and a coin in your right palm. Recite the Vedic Sankalpa declaring your name, gotra, and purpose of worship. Establish the consecrated water pot (Kalash) adorned with mango twigs, sacred thread, and coconut.",
        "॥ Step 3: Prana-Pratishtha & 16-Step Shodashopachara ॥\nInvoke the living divine presence into Lord Ganesha's idol with Prana-Pratishtha mantras. Offer sacred bath with Panchamrita followed by pure water, red silk vastra, Janeu (sacred thread), fragrant red sandalwood paste, sindoor, and 21 blades of fresh Durva grass.",
        "॥ Step 4: Modak Offering, Concluding Aarti & Prayer for Forgiveness ॥\nPresent sweet Modakas and seasonal fruits as Naivedya. Offer betel leaves (Tambula) and Dakshina. Conclude with reverent camphor Aarti, Mantra Pushpanjali, and recite the prayer of forgiveness ('Avahanam Na Janami...') seeking grace for any unintentional shortcomings."
      ]
    }
  },
  "swasti-vachan": {
    "gu": {
      "title": "સંપૂર્ણ વૈદિક સ્વસ્તિવાચન (મંગલાચરણ અને શાંતિ પાઠ)",
      "subtitle": "ઋગ્વેદ અને યજુર્વેદના સનાતન મંગલકારી શાંતિ અને કલ્યાણ મંત્રો",
      "vedaSource": "ઋગ્વેદ અને શુક્લ યજુર્વેદ (અધ્યાય ૧૯)",
      "shlokMeaning": "વિશ્વભરમાંથી સર્વ કલ્યાણકારી અને ઉત્તમ વિચારો અમારી પાસે આવો, જે અમને સતત પ્રેરિત કરે અને કોઈ પણ દિશામાંથી અડચણ વગર પહોંચે.",
      "description": "કોઈપણ વૈદિક યજ્ઞ, પંચાંગ વાંચન, ગણેશ પૂજન કે શુભ કાર્યના પ્રારંભે પઢવામાં આવતું પરમ પવિત્ર સ્વસ્તિવાચન. આ મંત્રોના ઉચ્ચારણથી વાતાવરણની તમામ નકારાત્મકતા શાંત થઈ જાય છે.",
      "rules": [
        "પૂજા આસન પર પૂર્વ અથવા ઉત્તર મુખ રાખી બેસો.",
        "હાથમાં પીળા અક્ષત (ચોખા) અને પુષ્પ ધારણ કરો.",
        "મંત્રોના શ્રવણ કે ઉચ્ચારણ સાથે ચારેય દિશાઓમાં અક્ષતની વૃષ્ટિ કરી સર્વ મંગલની કામના કરો."
      ],
      "kathaSummary": [
        "॥ પ્રથમ ભાગ: ઋગ્વેદિય મંગલાચરણ ॥\n'ૐ આ નો ભદ્રાઃ ક્રતવો યન્તુ વિશ્વતોऽદબ્ધાસો અપરીતાસ ઉદ્ભિદઃ।' - આ મંત્રથી પ્રાર્થના કરવામાં આવે છે કે સંપૂર્ણ બ્રહ્માંડમાંથી સદ્વિચારો અને દિવ્ય ઊર્જા આપણી ચેતનામાં પ્રવેશે. દેવતાઓ આપણી રક્ષા માટે સદાય તત્પર રહે અને કોઈ દાનવ આપણને વિહ્વળ ન કરી શકે.",
        "॥ દ્વિતીય ભાગ: મહાદેવોનું સ્વસ્તિ આવાહન ॥\n'ૐ સ્વસ્તિ ન ઇન્દ્રો વૃદ્ધશ્રવાઃ સ્વસ્તિ નઃ પૂષા વિશ્વવેદાઃ। સ્વસ્તિ નસ્તાર્ક્ષ્યો અરિષ્ટનેમિઃ સ્વસ્તિ નો બૃહસ્પતિર્દધાતુ॥' - સર્વશક્તિમાન ઇન્દ્રદેવ અમારું કલ્યાણ કરો, સર્વજ્ઞ પૂષા અમારું મંગલ કરો, ગરુડ ભગવાન વિઘ્નોનું શમન કરો અને દેવગુરુ બૃહસ્પતિ અમને સદ્બુદ્ધિ અને દીર્ઘાયુષ્ય પ્રદાન કરો.",
        "॥ તૃતીય ભાગ: વૈદિક મહા શાંતિ પાઠ ॥\n'ૐ દ્યૌઃ શાનિતરન્તરિક્ષં શાનિતઃ પૃથિવી શાનિતરાપઃ શાનિતરોષધયઃ શાનિતઃ। વનસ્પતયઃ શાનિતર્વિશ્વેદેવાઃ શાનિતર્બ્રહ્મ શાનિતઃ સર્વં શાનિતઃ શાંતિરેવ શાનિતઃ સા મા શાનિતરેધિ॥' - સ્વર્ગલોક, અંતરિક્ષ, પૃથ્વી, જળ, વનસ્પતિઓ અને ઔષધિઓ સૌ શાંત રહો. સર્વત્ર પરમ શાંતિનો વાસ થાઓ."
      ]
    },
    "en": {
      "title": "Complete Vedic Swasti Vachan (Auspicious Invocations & Vedic Shanti Path)",
      "subtitle": "Rigveda & Shukla Yajurveda (Chapter 19) eternal mantras of peace and universal grace",
      "vedaSource": "Rigveda & Shukla Yajurveda",
      "shlokMeaning": "May noble and auspicious thoughts come to us from every corner of the universe, unobstructed, free, and continuously uplifting.",
      "description": "The sacred opening chants recited before any Vedic ceremony, Panchang reading, puja, or milestone event to harmonize the environment and evoke divine benevolence.",
      "rules": [
        "Sit on a purified asana facing East or North.",
        "Hold sanctified yellow rice (Akshata) and sacred flowers in both hands.",
        "Sprinkle the Akshata in all cardinal directions while meditating on universal peace and divine harmony."
      ],
      "kathaSummary": [
        "॥ Part 1: Rigvedic Invocation of Universal Grace ॥\n'Om Aa No Bhadrah Kratavo Yantu Vishwato...' - We pray that sublime, unassailable, and truth-illuminating wisdom descends upon our intellect from all corners of the universe. May the celestial guardians be ever watchful over our families and communities.",
        "॥ Part 2: Vedic Invocations to the Cosmic Deities ॥\n'Om Swasti Na Indro Vriddhashravah Swasti Nah Pusha Vishwavedah...' - May illustrious Indra grant us auspiciousness; may all-knowing Pusha nurture us; may Garuda protect us from all perils; and may Brihaspati bestow profound wisdom and longevity.",
        "॥ Part 3: The Universal Cosmic Shanti Mantra ॥\n'Om Dyauh Shantir Antariksham Shantih Prithivi Shantir Apah Shantir Oshadhayah Shantih...' - May peace prevail in the heavens, peace in the atmosphere, peace on earth, peace in the waters, peace in the healing flora. May universal peace encompass all existence, and may that peace abide within my heart."
      ]
    }
  },
  "pradosh-vrat": {
    "gu": {
      "title": "પ્રદોષ વ્રત કથા અને સંધ્યાકાળ શિવ પૂજન વિધિ",
      "subtitle": "શિવ પુરાણ, કોટિરુદ્ર સંહિતા અનુસાર વ્રત કથા અને પ્રદોષકાળ પૂજન વિધિ",
      "vedaSource": "શિવ પુરાણ, કોટિરુદ્ર સંહિતા",
      "shlokMeaning": "ત્રિનેત્રધારી, સુગંધિત અને પુષ્ટિવર્ધક ભગવાન શિવની અમે ઉપાસના કરીએ છીએ. તેઓ આપણને મૃત્યુના બંધનમાંથી મુક્ત કરી અમૃતત્વ પ્રદાન કરે.",
      "description": "ત્રયોદશી તિથિના સંધ્યાકાળે (પ્રદોષ કાળ) કરવામાં આવતું અત્યંત કલ્યાણકારી વ્રત. આ વ્રત કરવાથી સર્વ પાપો નષ્ટ થાય છે, સંતાન સુખ અને અકાળ મૃત્યુથી રક્ષણ મળે છે.",
      "rules": [
        "ત્રયોદશીના દિવસે નિરાહાર અથવા ફળાહાર રહી શિવ પંચાક્ષર મંત્ર 'ૐ નમઃ શિવાય' નો જપ કરો.",
        "સૂર્યાસ્તના ૪૫ મિનિટ પહેલાંથી ૪૫ મિનિટ પછીના પ્રદોષ કાળમાં શિવલિંગ પર ગંગાજળ, દૂધ અને બીલીપત્ર અર્પણ કરો.",
        "શિવજીની આરતી કરી સફેદ મીઠાઈ કે ખીરનો ભોગ ધરાવો."
      ],
      "kathaSummary": [
        "॥ અધ્યાય ૧: પ્રદોષ કાળનું મહાત્મ્ય અને બ્રાહ્મણીની કથા ॥\nપ્રાચીન કાળમાં એક અત્યંત ધર્મનિષ્ઠ વિધવા બ્રાહ્મણી પોતાના પુત્ર સાથે ભિક્ષા માંગી નિર્વાહ કરતી હતી. એક દિવસ તેને નદી કિનારે વિદર્ભ દેશનો અનાથ રાજકુમાર ધર્મગુપ્ત મળ્યો, જેનું રાજ્ય શત્રુઓએ છીનવી લીધું હતું. દયાળુ બ્રાહ્મણીએ તેને પોતાના પુત્ર સમાન પાળી મોટો કર્યો.",
        "॥ અધ્યાય ૨: શાંડિલ્ય ઋષિનો ઉપદેશ અને પ્રદોષ વ્રત ॥\nએક દિવસ બંને બાળકો શાંડિલ્ય ઋષિના આશ્રમે ગયા. ઋષિએ તેમને ભગવાન શિવના પ્રદોષ વ્રતનો મહિમા સમજાવ્યો અને વિધિપૂર્વક વ્રત કરવાનો ઉપદેશ આપ્યો. ઘેર આવી બ્રાહ્મણી અને બંને પુત્રોએ શ્રદ્ધાપૂર્વક ત્રયોદશી તિથિએ પ્રદોષ કાળમાં શિવલિંગની પૂજા કરી વ્રત શરૂ કર્યું.",
        "॥ અધ્યાય ૩: શત્રુઓ પર વિજય અને રાજપ્રાપ્તિ ॥\nવ્રતના પ્રભાવથી રાજકુમાર ધર્મગુપ્તને વનમાં ગાંધર્વરાજની કન્યા અંશુમતી સાથે ભેટો થયો. ગાંધર્વરાજે શિવજીની પ્રેરણાથી પોતાની પુત્રીના વિવાહ ધર્મગુપ્ત સાથે કર્યા. ગાંધર્વ સેનાની સહાયથી ધર્મગુપ્તે શત્રુઓને પરાજિત કરી પોતાનું છીનવાયેલું રાજ્ય પાછું મેળવ્યું અને બ્રાહ્મણી તથા તેના પુત્રને રાજમહેલમાં ઉચ્ચ સન્માન આપ્યું. પ્રદોષ વ્રતથી સર્વ કષ્ટો નાશ પામે છે."
      ]
    },
    "en": {
      "title": "Pradosh Vrat Katha & Twilight Shiva Worship",
      "subtitle": "Shiva Purana, Kotirudra Samhita: Twilight fast guidelines and sacred legend",
      "vedaSource": "Shiva Purana, Kotirudra Samhita",
      "shlokMeaning": "We worship the Three-Eyed Lord Shiva, who is fragrant and nourishes all beings. May He liberate us from death and bondage into the nectar of immortality.",
      "description": "The sacred fast observed on the 13th lunar day (Trayodashi) during twilight (Pradosha Kala). It grants fulfillment of desires, progeny, protection from untimely afflictions, and spiritual liberation.",
      "rules": [
        "Observe fasting on Trayodashi day and continuously chant the Panchakshara mantra 'Om Namah Shivaya'.",
        "Perform Abhishekam with milk, honey, Ganga water, and Bilva leaves during the Pradosha window around sunset.",
        "Conclude with the solemn Aarti and distribute white sweets or kheer prasad."
      ],
      "kathaSummary": [
        "॥ Chapter 1: The Destitute Brahmin Mother & Prince Dharmagupta ॥\nIn ancient times, a virtuous Brahmin widow lived by begging. One day by the riverbank, she discovered Prince Dharmagupta of Vidarbha wandering hungry after enemies had usurped his father's kingdom. Moved by compassion, the noble woman adopted him alongside her own son.",
        "॥ Chapter 2: Guidance of Sage Shandilya & The Pradosha Fast ॥\nThe boys visited the hermitage of Sage Shandilya, who initiated them into the sacred mysteries of Lord Shiva's Pradosh Vrat. The Brahmin mother and both boys resolved to observe the fast on Trayodashi twilight with continuous milk Abhishekam and Bilva leaves.",
        "॥ Chapter 3: Divine Alliance, Reclaimed Kingdom & Eternal Merit ॥\nBy Lord Shiva's grace, Prince Dharmagupta encountered Princess Anshumati of the celestial Gandharvas in the forest. Pleased by Shiva's omen, the Gandharva king wed his daughter to Dharmagupta and provided a mighty army. Dharmagupta vanquished his foes, reclaimed his throne, and honored the Brahmin family. Observing Pradosha dispels all misfortune."
      ]
    }
  },
  "nirjala-ekadashi": {
    "gu": {
      "title": "નિર્જળા એકાદશી (ભીમસેની એકાદશી) વ્રત કથા",
      "subtitle": "પદ્મ પુરાણ, ઉત્તર ખંડ: વર્ષની ૨૪ એકાદશીઓનું સંપૂર્ણ પુણ્ય આપનાર મહાવ્રત",
      "vedaSource": "પદ્મ પુરાણ, ઉત્તર ખંડ",
      "shlokMeaning": "શાંત સ્વરૂપ, શેષશય્યા પર શયન કરનારા, પદ્મનાભ અને દેવોના દેવ એવા ભગવાન વિષ્ણુને હું વંદન કરું છું જે સંસારના ભયને હરે છે.",
      "description": "જે સાધક આખા વર્ષમાં બધી એકાદશીઓ ન કરી શકે, તે માત્ર જેઠ સુદ અગિયારસે પાણી પીધા વગર (નિર્જળા) આ વ્રત કરે તો તેને વર્ષની તમામ ૨૪ એકાદશીઓનું પુણ્ય પ્રાપ્ત થાય છે.",
      "rules": [
        "એકાદશીના સૂર્યોદયથી બારસના સૂર્યોદય સુધી જળ અને અન્નનો ત્યાગ કરો.",
        "ભગવાન વિષ્ણુની તુલસીદળ અને પંચામૃતથી પૂજા કરો અને રાત્રે જાગરણ કરી ભજન-કીર્તન કરો.",
        "બારસના દિવસે બ્રાહ્મણ કે જરૂરિયાતમંદને જળથી ભરેલો કળશ, પંખો અને અનાજ દાન કરી પારણાં કરો."
      ],
      "kathaSummary": [
        "॥ અધ્યાય ૧: ભીમસેન અને મહર્ષિ વેદવ્યાસનો સંવાદ ॥\nમહાભારત કાળમાં યુધિષ્ઠિર, અર્જુન, નકુલ, સહદેવ અને દ્રૌપદી દરેક એકાદશીનું કઠોર વ્રત રાખતા હતા. પરંતુ ભીમસેનના પેટમાં 'વૃક' નામનો જઠરાગ્નિ પ્રજ્વલિત હોવાથી તે ભૂખ્યા રહી શકતા નહોતા. ભીમે વ્યાસજીને પ્રાર્થના કરી કે મને એવું એક વ્રત બતાવો જેનાથી વિના પરિશ્રમે વર્ષભરની સર્વ એકાદશીઓનું ફળ મળે.",
        "॥ અધ્યાય ૨: નિર્જળા એકાદશીનો આદેશ અને કઠોર નિયમ ॥\nમહર્ષિ વ્યાસે કહ્યું કે જ્યેષ્ઠ માસના શુક્લ પક્ષની એકાદશીના દિવસે સૂર્યોદયથી બીજા દિવસના સૂર્યોદય સુધી જળનો એક ટીપો પણ ન પીવો. માત્ર આચમનમાં ગળા નીચે ન ઉતરે તેટલું જળ સ્પર્શ કરી શકાય. આ એક જ વ્રત કરવાથી આખા વર્ષની ૨૪ એકાદશીઓનું પુણ્ય મળે છે.",
        "॥ અધ્યાય ૩: ભીમનું વ્રત અને મહાવિષ્ણુની કૃપા ॥\nભીમસેને આ કઠિન વ્રત સ્વીકાર્યું. રાત્રિના અંત સુધીમાં ભૂખ અને તરસથી બેહોશ થઈ ગયા, ત્યારે ભાઈઓએ ગંગાજળ છાંટી સચેત કર્યા. દ્વાદશીના પ્રભાતે વિષ્ણુ પૂજા કરી, બ્રાહ્મણોને સુવર્ણ, કળશ અને મિષ્ટાન્ન દાન આપી પારણાં કર્યા. આ વ્રતથી ભીમ પરમ ગતિને પામ્યા."
      ]
    },
    "en": {
      "title": "Nirjala Ekadashi (Bhimseni Ekadashi) Vrat Katha",
      "subtitle": "Padma Purana, Uttara Khanda: Supreme fast yielding merit of all 24 annual Ekadashis",
      "vedaSource": "Padma Purana, Uttara Khanda",
      "shlokMeaning": "Salutations to Lord Vishnu, of peaceful countenance, resting on the serpent Shesha, with a lotus in His navel, the Lord of gods, dispeller of worldly fears.",
      "description": "Observed on Jyeshtha Shukla Ekadashi without consuming even a drop of water. Sage Vyasa instructed Bhima that observing this single rigorous fast bestows the entire merit of all 24 annual Ekadashis.",
      "rules": [
        "Refrain completely from water and food from sunrise of Ekadashi to sunrise of Dwadashi.",
        "Worship Lord Vishnu with fragrant Tulsi leaves, incense, and spend the night in spiritual vigil.",
        "On Dwadashi morning, donate water pitchers, fans, and grains to Brahmins and seekers before breaking the fast."
      ],
      "kathaSummary": [
        "॥ Chapter 1: The Dilemma of Mighty Bhimasena & Sage Vyasa ॥\nWhile Yudhishthira, Arjuna, Nakula, Sahadeva, and Draupadi observed every fortnightly Ekadashi fast strictly, Bhima struggled because of his roaring gastric fire ('Vrika Agni'). Bhima appealed to grandfather Vedavyasa for a singular spiritual observance that could grant the full merit of all Ekadashis without fasting twice every month.",
        "॥ Chapter 2: The Sacred Mandate of Waterless Fast in Scorching Jyeshtha ॥\nSage Vyasa instructed him to observe Jyeshtha Shukla Ekadashi without drinking even a drop of water from sunrise until sunrise of Dwadashi. By abstaining from both grain and water on this solitary intense summer day, one reaps the divine fruits of all twenty-four annual Ekadashis.",
        "॥ Chapter 3: Bhima's Heroic Fast & Lord Vishnu's Liberation ॥\nBhima undertook the rigorous fast. By midnight he collapsed from exhaustion, but remained steadfast until dawn. The Pandavas revived him with holy Ganga water on Dwadashi. Bhima worshipped Lord Vishnu, fed Brahmins, donated water pitchers, and broke his fast, winning eternal spiritual liberation."
      ]
    }
  },
  "karwa-chauth-sampurna": {
    "gu": {
      "title": "કરવા ચોથ વ્રત કથા અને સંપૂર્ણ પૂજન વિધિ",
      "subtitle": "સ્કંદ પુરાણ અને ભવિષ્યોત્તર પુરાણ: અખંડ સૌભાગ્ય અને દીર્ઘાયુષ્ય આપનાર વ્રત",
      "vedaSource": "સ્કંદ પુરાણ, ભવિષ્યોત્તર પુરાણ",
      "shlokMeaning": "સમસ્ત મંગળોનું મંગળ કરનારી, કલ્યાણમયી, સર્વ અર્થ સિદ્ધ કરનારી, શરણાગતોની રક્ષક ત્રિનેત્રી નારાયણી દેવીને નમસ્કાર.",
      "description": "આસો વદ ચોથના દિવસે સુહાગન સ્ત્રીઓ પોતાના પતિના દીર્ઘાયુષ્ય, આરોગ્ય અને અખંડ સૌભાગ્ય માટે નિર્જળા વ્રત રાખે છે અને રાત્રે ચંદ્ર દર્શન કરી અર્ઘ્ય આપે છે.",
      "rules": [
        "સવારે સૂર્યોદય પહેલાં સરગી આરોગી વ્રતનો સંકલ્પ લો અને આખો દિવસ નિર્જળા રહો.",
        "બપોરે કે સંધ્યાકાળે ગૌરી-ગણેશ અને करवा માતાની પૂજા કરી વ્રત કથા સાંભળો.",
        "રાત્રે ચંદ્ર ઉદય થાય ત્યારે ચાળણીથી ચંદ્ર અને પતિદેવનું દર્શન કરી અર્ઘ્ય આપો અને પતિના હાથે જળ પીને વ્રત ખોલો."
      ],
      "kathaSummary": [
        "॥ અધ્યાય ૧: વીરાવતી અને સાત સ્નેહી ભાઈઓની કથા ॥\nએક નગરમાં એક ધનિક વેપારીને સાત પુત્રો અને વીરાવતી નામની એક લાડકી પુત્રી હતી. વિવાહ પછી વીરાવતીએ પિયરમાં પ્રથમ કરવા ચોથનું નિર્જળા વ્રત રાખ્યું. સાંજ પડતાં ભૂખ-તરસથી તે વ્યાકુળ થઈ બેહોશ થવા લાગી. બહેનની પીડા ન જોઈ શકતાં સાતેય ભાઈઓએ દૂર પીપળાના ઝાડ પર દીવો મૂકી ચાળણી આડી ધરી કૃત્રિમ ચંદ્ર દર્શાવ્યો.",
        "॥ અધ્યાય ૨: અસત્ય ચંદ્ર દર્શન અને પતિનું સંકટ ॥\nવીરાવતીએ ભાઈઓના કહેવાથી અસત્ય ચંદ્રને અર્ઘ્ય આપી ભોજન શરૂ કર્યું. પ્રથમ કોળિયો લેતાં જ વાળ નીકળ્યો, બીજામાં છીંક આવી અને ત્રીજા કોળિયે સમાચાર આવ્યા કે તેના પતિનું મૃત્યુ થઈ ગયું છે. વીરાવતી આખી રાત રડતી રહી. ત્યારે ઇન્દ્રાણી દેવી પ્રગટ થયા અને જણાવ્યું કે અધૂરા અને ખોટા ચંદ્ર દર્શનને કારણે આ શાપ થયો છે.",
        "॥ અધ્યાય ૩: પશ્ચાત્તાપ, મા ગૌરીની કૃપા અને પુનર્જીવન ॥\nવીરાવતીએ બારેય માસની ચોથનું વ્રત નિયમપૂર્વક કર્યું અને ફરી કરવા ચોથના દિવસે સાચા મનથી મા ગૌરીની પૂજા કરી. દેવીની કૃપાથી તેના પતિના શરીરમાંથી સોય-કાંટા દૂર થયા અને તે પુનર્જીવિત થઈ ઊઠ્યો. ત્યારથી અખંડ સૌભાગ્ય માટે આ વ્રત પવિત્ર મનાય છે."
      ]
    },
    "en": {
      "title": "Karwa Chauth Vrat Katha & Complete Puja Vidhi",
      "subtitle": "Skanda Purana & Bhavishyottara Purana: Sacred vow for marital longevity and bliss",
      "vedaSource": "Skanda Purana & Bhavishyottara Purana",
      "shlokMeaning": "Auspicious of all auspiciousness, benevolent, fulfiller of all aims, refuge of the helpless, three-eyed Goddess Narayani, salutations unto You.",
      "description": "Celebrated on the fourth day of the waning moon in Kartik/Ashwin. Married women observe a strict waterless fast from dawn until moonrise praying for the health, longevity, and prosperity of their spouses.",
      "rules": [
        "Consume Sargi before sunrise and take the vow of complete waterless fasting throughout the day.",
        "Assemble in the evening to worship Goddess Gauri and Karwa Mata, listening to the traditional story.",
        "At moonrise, offer Arghya to the moon through a sieve, view the spouse, and break the fast by sipping water from their hands."
      ],
      "kathaSummary": [
        "॥ Chapter 1: The Devoted Queen Veeravati & Seven Loving Brothers ॥\nIn ancient times, a virtuous queen named Veeravati observed her maiden Karwa Chauth fast at her parents' home. Suffering from intense thirst and hunger under the strict waterless regimen, she grew faint as evening arrived. Unable to bear her agony, her seven brothers climbed a distant peepal tree and illuminated a lamp behind a sieve to mimic the moon.",
        "॥ Chapter 2: The Premature Moonrise & Terrible Omen ॥\nBelieving it to be the true moon, Veeravati offered Arghya and broke her fast. Instantly, tragic news arrived that her husband, the King, had fallen critically ill into a coma. Weeping bitterly through the night, Goddess Indrani appeared and revealed the deception of the simulated moon.",
        "॥ Chapter 3: Penance, Grace of Goddess Gauri & Resurrection ॥\nVeeravati observed strict penance throughout the year across all monthly Sankashti Chaturthis. On the next Karwa Chauth, she observed the fast with complete purity and true moonrise devotion. Goddess Gauri removed all needles of suffering from the King's body and restored him to vibrant life."
      ]
    }
  },
  "sukhkarta-dukhharta-aarti": {
    "gu": {
      "title": "શ્રી ગણેશ પ્રસિદ્ધ આરતી - સુખકર્તા દુઃખહર્તા",
      "subtitle": "શ્રી સમર્થ રામદાસ સ્વામી વિરચિત સુપ્રસિદ્ધ મરાઠી ગણેશ આરતી (ગુજરાતી ભાવાર્થ સાથે)",
      "vedaSource": "સંત રામદાસ ભક્તિ સંગ્રહ",
      "shlokMeaning": "સુખ આપનારા અને દુઃખ હરનારા, સર્વ વિઘ્નોનું નિવારણ કરનારા અને પ્રેમની વૃષ્ટિ કરનારા ગણેશજીની અમે આરતી ઉતારીએ છીએ.",
      "description": "મહારાષ્ટ્ર અને સમગ્ર ભારતમાં ગણેશોત્સવ દરમિયાન ગવાતી પરમ લોકપ્રિય આરતી. આ આરતીના ગાનથી ઘરમાં મંગલકારી ઊર્જા અને સમૃદ્ધિનો સંચાર થાય છે.",
      "rules": ["પંચારતી કે ઘીનો દીવો પ્રગટાવી મોદકનો ભોગ ધરાવો."],
      "kathaSummary": [
        "॥ પ્રથમ કડી ॥\nસુખકર્તા દુઃખહર્તા વાર્તા વિઘ્નાચી। નુરવી પૂર્વી પ્રેમ કૃપા જયાચી। સર્વાંગી સુંદર ઉટી શિંદુરાચી। કંઠી ઝળકે માળ મુક્તાફળાંચી॥\nજય દેવ જય દેવ જય મંગલમૂર્તી! દર્શનમાત્રે મનકામના પૂર્તી॥\n(અર્થ: હે ગણેશજી, આપ સુખના દાતા અને દુઃખોના નાશક છો. આપના દર્શન માત્રથી ભક્તોના મનોરથ પૂર્ણ થાય છે.)",
        "॥ દ્વિતીય કડી ॥\nરત્નખચિત ફરા તુજ ગૌરીકુમરા। ચંદનાચી ઉટી કુંકુમકેશરા। હીરાજડિત મુકુટ શોભતો બરા। રુણઝુણતી નૂપુરે ચરણી ઘાગરિયાં॥\n(અર્થ: માતા ગૌરીના પુત્ર, આપના લલાટે ચંદન અને કંકુ-કેસરનું તિલક શોભે છે. આપના મસ્તક પર હીરાજડિત મુગટ અને ચરણોમાં ઝાંઝર ઝણકે છે.)",
        "॥ તૃતીય કડી ॥\nલંબોદર પીતાંબર ફણિવરબંધના। સરળ સોંડ વક્રતુંડ ત્રિનયના। દાસ રામાચા વાટ પાહે સદના। સંકટી પાવાવે નિર્વાણી રક્ષાવે સુરવરવંદના॥\n(અર્થ: હે લંબોદર, પીતાંબરધારી અને ત્રિનેત્રધારી દેવ! રામદાસ આપની રાહ જુએ છે. કટોકટીના સમયે આપ અમારા રક્ષક બનો.)"
      ]
    },
    "en": {
      "title": "Shri Ganesh Aarti - Sukhkarta Dukhharta",
      "subtitle": "Composed by Sant Samarth Ramdas Swami with complete verse-by-verse English meaning",
      "vedaSource": "Sant Ramdas Devotional Treasury",
      "shlokMeaning": "O Lord who creates auspicious joy, removes all suffering, and fulfills desires of devotees with infinite love and mercy, victory unto You.",
      "description": "The quintessential Marathi Ganesh Aarti sung in homes and temples worldwide during Ganesh Chaturthi, radiating uplifting spiritual vitality and joyous blessings.",
      "rules": ["Wave a pure ghee lamp in circular motions and offer modakas with wholehearted devotion."],
      "kathaSummary": [
        "॥ Stanza 1: The Bestower of Auspicious Joy ॥\n'Sukhkarta Dukhharta Varta Vighnachi...' - You create joy, dispel sorrows, and conquer all obstacles. Your holy body is adorned with vermilion and radiant pearl necklaces. Victory unto You, O Mangalamurti! Mere sight of You fulfills all aspirations.",
        "॥ Stanza 2: The Splendor of Mother Gauri's Son ॥\n'Ratnakhachita Phara Tuj Gaurikumara...' - Adorned with jeweled seats, fragrant sandalwood, saffron, and diamonds in Your crown. Sweet anklets tinkle at Your divine feet as You bless the assembly.",
        "॥ Stanza 3: Refuge of Samarth Ramdas ॥\n'Lambodara Pitambara Phanivarabandhana...' - O broad-bellied deity draped in yellow silk, with a curved trunk and three eyes! Servant Ramdas awaits Your grace at his doorstep; protect us from perils and grant divine salvation."
      ]
    }
  },
  "karpura-gauram-mantra-pushpanjali": {
    "gu": {
      "title": "કર્પૂરગૌરં કરુણાવતારમ્ અને સંપૂર્ણ વૈદિક મંત્રપુષ્પાંજલિ",
      "subtitle": "યજુર્વેદ અને સનાતન વૈદિક સ્તુતિ: પૂજાના સમાપને અર્પણ થતી પરમ પવિત્ર પુષ્પાંજલિ",
      "vedaSource": "શુક્લ યજુર્વેદ અને શિવ સ્તુતિ",
      "shlokMeaning": "જેમનું શરીર કપૂર સમાન ઉજ્જવળ છે, જે કરુણાના સાક્ષાત્ અવતાર છે, સંસારના સારરૂપ છે અને ભુજંગહાર ધારણ કરે છે, તેવા ભગવાન શિવને હું માતા ભવાની સાથે પ્રણામ કરું છું.",
      "description": "કોઈપણ આરતી કે પૂજનના અંતમાં બોલવામાં આવતી પરમ પવિત્ર સ્તુતિ અને દેવતાઓને પુષ્પ અર્પણ કરવાની વૈદિક મંત્રપુષ્પાંજલિ.",
      "rules": ["હાથમાં પુષ્પ અને અક્ષત ધારણ કરી બંને હાથ જોડી મંત્ર પઢો અને અંતમાં ભગવાનના ચરણોમાં પુષ્પ અર્પણ કરો."],
      "kathaSummary": [
        "॥ ભાગ ૧: કર્પૂરગૌરં સ્તુતિ ॥\n'કર્પૂરગૌરં કરુણાવતારં સંસારસારં ભુજગેન્દ્રહારમ્। સદાવસન્તં હૃદયારવિન્દે ભવં ભવાનીસહિતં નમામિ॥' - કપૂર જેવા શ્વેત અને કરુણામય મહાદેવ મારા હૃદયકમળમાં માતા પાર્વતી સાથે સદાય નિવાસ કરો.",
        "॥ ભાગ ૨: વૈદિક મંત્રપુષ્પાંજલિ ॥\n'ૐ યજ્ઞેન યજ્ઞમયજન્ત દેવાસ્તાનિ ધર્માણિ પ્રથમાન્યાસન્। તે હ નાકં મહિમાનઃ સચન્ત યત્ર પૂર્વે સાધ્યાઃ સન્તિ દેવાઃ॥' - દેવતાઓએ યજ્ઞ દ્વારા બ્રહ્માંડનું પોષણ કર્યું. એ જ ધર્મ સર્વોપરી છે. જ્યાં પૂર્વકાળના દેવતાઓ નિવાસ કરે છે, તે પરમધામને આપણે પ્રાપ્ત કરીએ.",
        "॥ ભાગ ૩: સામ્રાજ્ય અને સમસ્ત કલ્યાણ પ્રાર્થના ॥\n'ૐ રાજાધિરાજાય પ્રસાહ્ય સાહિને નમો વયં વૈશ્રવણાય કુર્મહે...' - સમસ્ત દિશાઓમાં ધર્મનું સામ્રાજ્ય સ્થપાય, પ્રજા સુખી રહે, ધન-ધાન્ય અને આધ્યાત્મિક જ્ઞાનની વૃદ્ધિ થાય તે માટે અમે સર્વેશ્વરને પુષ્પાંજલિ અર્પણ કરીએ છીએ."
      ]
    },
    "en": {
      "title": "Karpura Gauram Karunavataram & Complete Mantra Pushpanjali",
      "subtitle": "Shukla Yajurveda & Shiva Stuti: The concluding floral offering of Vedic worship",
      "vedaSource": "Shukla Yajurveda & Shiva Stuti",
      "shlokMeaning": "Pure white as camphor, incarnation of compassion, essence of worldly existence, garlanded by the serpent king—I bow to Lord Shiva alongside Mother Bhavani.",
      "description": "The timeless verses chanted at the conclusion of every Aarti and Puja ceremony to offer fragrant flowers and seek cosmic peace.",
      "rules": ["Hold fresh flowers and unbroken rice grains in cupped hands and gently offer them at the deity's feet."],
      "kathaSummary": [
        "॥ Part 1: The Hymn of Pure Compassion ॥\n'Karpura Gauram Karunavataram Samsarasaram Bhujagendra Haram...' - Salutations to Lord Shiva, luminous like camphor, who abides forever within the lotus of the devotee's heart together with Mother Bhavani.",
        "॥ Part 2: Vedic Invocation of Righteous Action ॥\n'Om Yajnena Yajnam Ayajanta Devastani Dharmani Prathamanyasan...' - By sacred worship the divine guardians sustained the cosmos. May we attain that supreme spiritual realm where noble seers and devas dwell in perpetual light.",
        "॥ Part 3: Prayer for Universal Sovereignty & Floral Offering ॥\n'Om Rajadhirajaya Prasahya Sahine...' - We bow to the Sovereign Lord who fulfills all noble desires. May righteousness, wisdom, and peace flourish across all continents as we offer these sacred blossoms."
      ]
    }
  },
  "ganesh-aarti": {
    "gu": {
      "title": "શ્રી ગણેશજીની આરતી (જય ગણેશ જય ગણેશ દેવા)",
      "subtitle": "પાર્વતી નંદન વિઘ્નહર્તા ગણેશ આરતી (સંપૂર્ણ ગુજરાતી સ્તુતિ)",
      "vedaSource": "પારંપરિક સનાતન આરતી સંગ્રહ",
      "shlokMeaning": "જય ગણેશ, જય ગણેશ, જય ગણેશ દેવા! માતા જેમની પાર્વતી અને પિતા મહાદેવ છે, તેવા વિઘ્નહર્તા ગણેશજીની અમે આરતી ઉતારીએ છીએ.",
      "description": "કોઈપણ પૂજા, વિધિ કે શુભ કાર્યના આરંભ અને સમાપને ગવાતી સર્વશ્રેષ્ઠ ગણેશ આરતી. આ આરતી ગાવાથી સર્વ વિઘ્નો નાશ પામે છે.",
      "rules": ["ઘીનો દીવો પ્રગટાવી આરતી કરો અને મોદક કે લાડુનો પ્રસાદ ધરાવો."],
      "kathaSummary": [
        "॥ પ્રથમ કડી ॥\nજય ગણેશ જય ગણેશ જય ગણેશ દેવા। માતા જાકી પાર્વતી પિતા મહાદેવા॥\nએક દન્ત દયાવન્ત ચાર ભુજાધારી। માથે સિન્દૂર સોહે મૂસે કી સવારી॥\n(અર્થ: હે ગણેશજી, આપ એકદંત, દયાળુ અને ચાર ભુજાવાળા છો. આપના મસ્તકે સિંદૂર શોભે છે અને આપ ઉંદર પર સવારી કરો છો.)",
        "॥ દ્વિતીય કડી ॥\nપાન ચઢે ફૂલ ચઢે ઔર ચઢે મેવા। લડુઅન કા ભોગ લગે સન્ત કરેં સેવા॥\nઅંધન કો આંખ દેત કોઢિન કો કાયા। બાંઝન કો પુત્ર દેત નિર્ધન કો માયા॥\n(અર્થ: આપ ભક્તોને પાન, પુષ્પ અને લાડુનો ભોગ સ્વીકારી અંધજનને દૃષ્ટિ, નિઃસંતાનને પુત્ર અને ગરીબને ધન પ્રદાન કરો છો.)",
        "॥ તૃતીય કડી ॥\n'સૂર' શ્યામ શરણ આયે સફલ કીજે સેવા। જય ગણેશ જય ગણેશ જય ગણેશ દેવા॥\n(અર્થ: આપના ચરણે આવેલા દીનજનોના સર્વ કાર્યો નિર્વિઘ્ને સિદ્ધ કરો.)"
      ]
    },
    "en": {
      "title": "Shri Ganesh Aarti (Jai Ganesh Jai Ganesh Deva)",
      "subtitle": "Parvati Nandan Vighnaharta Ganesh Aarti (Complete Chanting with Meaning)",
      "vedaSource": "Traditional Sanatan Aarti Collection",
      "shlokMeaning": "Victory to Lord Ganesha, whose mother is Goddess Parvati and father is Lord Shiva. We perform Aarti unto the remover of all obstacles.",
      "description": "The beloved universal Aarti sung at the beginning and conclusion of all auspicious Vedic rituals, invoking joy, intellect, and worldly success.",
      "rules": ["Light a camphor or pure ghee lamp, ring the bell, and offer modak sweets."],
      "kathaSummary": [
        "॥ Stanza 1: The Divine Lineage & Radiant Form ॥\n'Jai Ganesh Jai Ganesh Jai Ganesh Deva...' - Victory to Lord Ganesha, beloved son of Goddess Parvati and Lord Shiva. With single tusk, compassionate eyes, four mighty hands, vermilion forehead, riding upon His humble mouse.",
        "॥ Stanza 2: The Offerings & Miracles of Grace ॥\n'Paan Chadhe Phool Chadhe Aur Chadhe Meva...' - We offer betel leaves, fragrant blossoms, dry fruits, and sacred modakas. You bestow sight to the blind, health to the afflicted, children to the childless, and prosperity to the impoverished.",
        "॥ Stanza 3: Seeking Eternal Refuge ॥\nSurrender unto Your lotus feet brings complete success in worldly and spiritual pursuits. Victory to Lord Ganesha, dispeller of all darkness!"
      ]
    }
  },
  "shiv-aarti": {
    "gu": {
      "title": "ભગવાન શિવજીની આરતી (ૐ જય શિવ ઓમકારા)",
      "subtitle": "શિવપુરાણોક્ત સંપૂર્ણ કૈલાશપતિ શિવ આરતી (ગુજરાતી ભાવાર્થ)",
      "vedaSource": "શિવ પુરાણ સંગ્રહ",
      "shlokMeaning": "ૐ જય શિવ ઓમકારા, ભોલે હર શિવ ઓમકારા! બ્રહ્મા, વિષ્ણુ અને સદાશિવ અર્ધાંગી ધારા.",
      "description": "ભોળાનાથ મહાદેવની દિવ્ય આરતી. સોમવારે અને પ્રદોષના દિવસે આ આરતી ગાવાથી મનોકામનાઓ પૂર્ણ થાય છે અને માનસિક શાંતિ મળે છે.",
      "rules": ["બિલ્વપત્ર, ગંગાજળ અર્પણ કરી કપૂરથી આરતી કરો."],
      "kathaSummary": [
        "॥ પ્રથમ કડી ॥\nૐ જય શિવ ઓમકારા, ભોલે હર શિવ ઓમકારા। બ્રહ્મા વિષ્ણુ સદાશિવ અર્ધાંગી ધારા॥\n(અર્થ: ૐકાર સ્વરૂપ ભગવાન શિવની જય હો! આપનામાં જ બ્રહ્મા, વિષ્ણુ અને મહેશ ત્રણેય દિવ્ય શક્તિઓ સમાયેલી છે.)",
        "॥ દ્વિતીય કડી ॥\nએકાનન ચતુરનન પંચાનન રાજે। હંસાસન ગરુડાસન વૃષવાહન સાજે॥\nબે ભુજ ચાર ચતુર્ભુજ દસ ભુજ અતિ સોહે। ત્રિગુણ રૂપ નિરખતા ત્રિભુવન જન મોહે॥\n(અર્થ: એક મુખ (વિષ્ણુ), ચાર મુખ (બ્રહ્મા) અને પાંચ મુખ (શિવ) સાથે આપ નંદી પર બિરાજમાન છો. આપનું ત્રિગુણ સ્વરૂપ ત્રણેય લોકને મોહિત કરે છે.)",
        "॥ તૃતીય કડી ॥\nઅક્ષમાલા વનમાલા રુણ્ડમાલા ધારી। ચંદન મૃગમદ સોહે ભાલે શશિધારી॥\nત્રિગુણ શિવજી કી આરતી જો કોઈ નર ગાવે। કહત શિવાનન્દ સ્વામી મનવાંછિત ફલ પાવે॥\n(અર્થ: રુદ્રાક્ષ, વનમાળા અને મુંડમાળા ધારણ કરનારા ચંદ્રશેખર શિવજીની આ આરતી જે ગાય છે, તેને સર્વ મનોવાંછિત ફળ પ્રાપ્ત થાય છે.)"
      ]
    },
    "en": {
      "title": "Lord Shiva Aarti (Om Jai Shiv Omkara)",
      "subtitle": "Complete Kailashpati Shiva Aarti from Shiva Purana with English verses",
      "vedaSource": "Shiva Purana Collection",
      "shlokMeaning": "Glory to Lord Shiva, the embodiment of Omkara! Brahma, Vishnu, and Sadashiva unite in His cosmic harmony.",
      "description": "The sublime evening hymn to Lord Shiva sung in temples worldwide, bringing profound peace, fearless confidence, and spiritual liberation.",
      "rules": ["Offer Bilva leaves and holy water, performing Aarti with pure burning camphor."],
      "kathaSummary": [
        "॥ Stanza 1: The Cosmic Harmony of Omkara ॥\n'Om Jai Shiv Omkara, Bhole Har Shiv Omkara...' - Hail Lord Shiva, the eternal cosmic resonance. In You converge Brahma the creator, Vishnu the preserver, and Sadashiva the supreme liberator.",
        "॥ Stanza 2: The Multi-Faced Cosmic Forms ॥\n'Ekanana Chaturanana Panchanana Raje...' - Manifesting as single-faced, four-faced, and five-faced; mounted on swan, eagle, and Nandi bull; with two, four, and ten arms holding trident, drum, and fire. The three worlds revere Your cosmic dance.",
        "॥ Stanza 3: Garlands of Renunciation & Fruit of Chanting ॥\n'Akshamala Vanamala Rundamala Dhari...' - Bearing rosary beads, forest garlands, and the crescent moon on Your forehead. Whoever chants this hymn of the Three-fold Shiva with pure heart attains all cherished blessings."
      ]
    }
  },
  "laxmi-aarti": {
    "gu": {
      "title": "માતા લક્ષ્મીજીની આરતી (ૐ જય લક્ષ્મી માતા)",
      "subtitle": "ધન, વૈભવ અને ઐશ્વર્ય પ્રદાત્રી શ્રી મહાલક્ષ્મી આરતી (ગુજરાતી ભાવાર્થ)",
      "vedaSource": "શ્રી સૂક્ત અને પદ્મ પુરાણ",
      "shlokMeaning": "ૐ જય લક્ષ્મી માતા, મૈયા જય લક્ષ્મી માતા! તુમકો નિશદિન સેવત, હરિ વિષ્ણુ વિધાતા.",
      "description": "દીપાવલી, શુક્રવાર અને ધનતેરસના દિવસે ગવાતી માતા લક્ષ્મીની પરમ પવિત્ર આરતી. આનાથી ઘરમાં કદી દરિદ્રતા આવતી નથી.",
      "rules": ["કમળનું પુષ્પ, અક્ષત, ખીર અર્પણ કરી ઘીના દીવાથી આરતી કરો."],
      "kathaSummary": [
        "॥ પ્રથમ કડી ॥\nૐ જય લક્ષ્મી માતા, મૈયા જય લક્ષ્મી માતા। તુમકો નિશદિન સેવત, હરિ વિષ્ણુ વિધાતા॥\n(અર્થ: હે મહાલક્ષ્મી માતા, આપની જય હો! ભગવાન શ્રી હરિ વિષ્ણુ સદાય આપની સેવા અને આરાધના કરે છે.)",
        "॥ દ્વિતીય કડી ॥\nઉમા રમા બ્રહ્માણી, તુમ હી જગમાતા। સૂર્ય-ચન્દ્રમા ધ્યાવત, નારદ ઋષિ ગાતા॥\nદુર્ગારૂપ નિરંજની, સુખ-સમ્પત્તિ દાતા। જો કોઈ તુમકો ધ્યાવત, ઋદ્ધિ-સિદ્ધિ ધન પાતા॥\n(અર્થ: આપ જ પાર્વતી, લક્ષ્મી અને સરસ્વતી રૂપે સમસ્ત સંસારના માતા છો. આપની કૃપાથી સાધકને સુખ, સમૃદ્ધિ અને અખંડ ઐશ્વર્ય મળે છે.)",
        "॥ તૃતીય કડી ॥\nજિસ ઘર મેં તુમ રહતી, તહં સબ સદ્ગુણ આતા। સબ સંભવ હો જાતા, મન નહીં ઘબરાતા॥\nશ્રી લક્ષ્મીજી કી આરતી, જો કોઈ નર ગાવે। ઉર આનંદ સમાવે, પાપ સકલ કટ જાવે॥\n(અર્થ: જે ઘરમાં આપનો વાસ હોય ત્યાં સર્વ સદ્ગુણો અને શાંતિ પ્રવેશે છે. આ આરતી ગાવાથી સર્વ પાપ નષ્ટ થાય છે.)"
      ]
    },
    "en": {
      "title": "Mata Lakshmi Aarti (Om Jai Lakshmi Mata)",
      "subtitle": "Goddess of Wealth & Fortune Mahalakshmi Aarti with full English meaning",
      "vedaSource": "Shri Suktam & Padma Purana",
      "shlokMeaning": "Glory to Mother Lakshmi, served continuously by Lord Vishnu, bestower of spiritual and material abundance.",
      "description": "The radiant hymn dedicated to Goddess Lakshmi sung on Diwali, Fridays, and Dhanteras to invite auspiciousness, harmony, and righteous prosperity.",
      "rules": ["Offer fresh lotus or red flowers, milk sweets, and perform Aarti with a pure ghee wick."],
      "kathaSummary": [
        "॥ Stanza 1: Sovereign Consort of Lord Vishnu ॥\n'Om Jai Lakshmi Mata, Maiya Jai Lakshmi Mata...' - Victory to Mother Lakshmi, reverently served day and night by Lord Vishnu and the cosmic guardians.",
        "॥ Stanza 2: The Mother of Cosmic Manifestations ॥\n'Uma Rama Brahmani, Tum Hi Jagmata...' - You embody Uma, Rama, and Brahmani as the single mother of all realms. Sages and celestial lights meditate upon Your boundless grace.",
        "॥ Stanza 3: Divine Abode in Virtuous Homes ॥\n'Jis Ghar Mein Tum Rahti, Tahan Sab Sadguna Aata...' - In whichever home You dwell, noble virtues, harmony, and abundance flourish naturally. Chanting this Aarti removes sorrow and fills the heart with blissful serenity."
      ]
    }
  },
  "hanuman-aarti": {
    "gu": {
      "title": "શ્રી હનુમાનજીની આરતી (આરતી કીજૈ હનુમાન લલા કી)",
      "subtitle": "દુષ્ટ દલન રઘુનાથ કલા કી - સંપૂર્ણ હનુમાન આરતી (ગુજરાતી ભાવાર્થ)",
      "vedaSource": "રામચરિતમાનસ સંગ્રહ",
      "shlokMeaning": "આરતી કરો પવનપુત્ર હનુમાન લાલાની, જે દુષ્ટોનું દલન કરનારા અને શ્રી રામના પરમ ભક્ત છે.",
      "description": "સંકટમોચન હનુમાનજીની આ આરતી મંગળવાર અને શનિવારે ગાવાથી સર્વ ભય, રોગ, શનિદોષ અને નકારાત્મક શક્તિઓ નાશ પામે છે.",
      "rules": ["સિંદૂર, ચમેલીનું તેલ, લાલ પુષ્પ અને બૂંદી/ગોળ-ચણાનો ભોગ ધરાવો."],
      "kathaSummary": [
        "॥ પ્રથમ કડી ॥\nઆરતી કીજૈ હનુમાન લલા કી। દુષ્ટ દલન રઘુનાથ કલા કી॥\nજાકે બલ સે ગિરિવર કાંપે। રોગ દોષ જાકે ઢિંગ ન ચાંપે॥\n(અર્થ: પવનપુત્ર હનુમાનજીની આરતી કરો, જેમના બાહુબળથી પર્વતો પણ ધ્રૂજે છે અને જેમનું સ્મરણ કરવાથી રોગ અને દોષ ક્યારેય નજીક આવતા નથી.)",
        "॥ દ્વિતીય કડી ॥\nઅંજની પુત્ર મહા બલદાઈ। સન્તન કે પ્રભુ સદા સહાઈ॥\nદે બીરા રઘુનાથ પઠાએ। લંકા સો કોટ સમુદ્ર લંઘાએ॥\nલંકા સી કોટ સમુદ્ર સી ખાઈ। જાત પવનસુત બાર ન લાઈ॥\n(અર્થ: અંજની માતાના પુત્ર હનુમાનજી સંતોના સદા સહાયક છે. શ્રી રામની આજ્ઞા પાળી તેમણે એક છલાંગમાં વિશાળ સમુદ્ર પાર કરી લંકા બાળી નાખી.)",
        "॥ તૃતીય કડી ॥\nલક્ષ્મણ મૂર્છિત પડે સકારે। આનિ સંજીવન પ્રાન ઉબારે॥\nપૈઠિ પાતાલ તોરિ જમકારે। અહિરાવન કી ભુજા ઉખારે॥\nઆરતી કીજૈ હનુમાન લલા કી, દુષ્ટ દલન રઘુનાથ કલા કી॥\n(અર્થ: લક્ષ્મણજી મૂર્છિત થતાં દ્રોણાગિરિ પર્વત લાવી સંજીવનીથી પ્રાણ બચાવ્યા. પાતાળમાં અહિરાવણનો વધ કરી રામ-લક્ષ્મણને મુક્ત કરાવ્યા.)"
      ]
    },
    "en": {
      "title": "Shri Hanuman Aarti (Aarti Kije Hanuman Lala Ki)",
      "subtitle": "Dispeller of Evils, Devotee of Lord Rama with English meaning",
      "vedaSource": "Ramcharitmanas Collection",
      "shlokMeaning": "Perform Aarti unto the beloved Son of the Wind, Lord Hanuman, who destroys distress, overcomes negative forces, and gladdens Lord Rama.",
      "description": "The powerful protective hymn to Lord Hanuman sung on Tuesdays and Saturdays to dispel anxieties, ward off planetary afflictions, and cultivate immense inner strength.",
      "rules": ["Offer vermilion, jasmine oil, red flowers, and sweets made from jaggery and gram."],
      "kathaSummary": [
        "॥ Stanza 1: The Matchless Valor of the Son of Wind ॥\n'Aarti Kije Hanuman Lala Ki, Dusht Dalan Raghunath Kala Ki...' - Perform Aarti unto beloved child Hanuman, dispeller of wicked forces. Before His prowess mighty mountains tremble, and no disease or negative affliction dare approach His devotee.",
        "॥ Stanza 2: Crossing the Ocean & Incinerating Lanka ॥\n'Anjani Putra Maha Baldai...' - Mother Anjana's valiant son, ever the champion of righteous seekers. Undertaking Lord Rama's mission, He leaped across the vast ocean effortlessly and reduced demon king Ravana's arrogant fortress to ashes.",
        "॥ Stanza 3: Sanjeevani Herb & Deliverance of Sages ॥\n'Lakshman Murchhit Pade Sakare, Aani Sanjivan Pran Ubare...' - When Lakshmana lay stricken on the battlefield, Hanuman flew to the Himalayas and carried Mount Dronagiri, saving his life with the Sanjeevani herb. In the netherworld, He slew Mahiravana and liberated Rama."
      ]
    }
  },
  "hartalika-teej": {
    "gu": {
      "title": "શ્રી હરતાલિકા તીજ વ્રત કથા અને પૂજન વિધાન",
      "subtitle": "શિવપુરાણ અનુસાર અખંડ સૌભાગ્ય અને મનગમતા પતિ પ્રાપ્તિનું પરમ પાવન વ્રત",
      "vedaSource": "શિવ પુરાણ, રુદ્ર સંહિતા (પાર્વતી ખંડ)",
      "shlokMeaning": "જેમનું અર્ધું શરીર ગૌરીમય અને અર્ધું શિવમય છે, તેવા જગતના માતા-પિતા પાર્વતી અને પરમેશ્વર શિવને અમે નમન કરીએ છીએ.",
      "description": "ભાદરવા સુદ ત્રીજના દિવસે સુહાગન અને કુમારિકાઓ દ્વારા કરવામાં આવતું કઠોર નિર્જળા વ્રત. માતા પાર્વતીએ ભગવાન શિવને પતિ રૂપે પામવા આ તપ કર્યું હતું.",
      "rules": [
        "ભાદરવા સુદ ત્રીજે સૂર્યોદયથી બીજા દિવસ સુધી અન્ન-જળનો સંપૂર્ણ ત્યાગ કરો.",
        "નદીની રેતી કે માટીથી શિવ, પાર્વતી અને ગણેશજીની પ્રતિમા બનાવી ફૂલ, બીલીપત્ર અને સોળ શૃંગાર અર્પણ કરો.",
        "રાત્રે ચાર પ્રહર જાગરણ કરી કથા શ્રવણ કરો અને બીજા દિવસે વિસર્જન બાદ પારણાં કરો."
      ],
      "kathaSummary": [
        "॥ અધ્યાય ૧: માતા પાર્વતીની બાળપણની તપસ્યા અને નારદજીનું આગમન ॥\nહિમાલયરાજ હિમાવાનના ઘેર માતા પાર્વતીએ અવતાર ધારણ કર્યો. બાળપણથી જ તેમનું મન ભગવાન શિવમાં પરોવાયેલું હતું. એક દિવસ દેવર્ષિ નારદે હિમાવાન પાસે જઈ ભગવાન વિષ્ણુ તરફથી વિવાહનો પ્રસ્તાવ મૂક્યો. પિતાએ વિષ્ણુજી સાથે વિવાહ સ્વીકારી લીધા ત્યારે પાર્વતીજી અત્યંત દુઃખી થયા.",
        "॥ અધ્યાય ૨: સખીઓ દ્વારા હરણ અને ગુપ્ત વનવાસ ॥\nપાર્વતીજીએ પોતાની પ્રિય સખીને કહ્યું કે હું માત્ર ભગવાન શંકરને જ વરીશ. સખીઓએ પાર્વતીજીનું 'હરણ' કરી (ગુપ્ત રીતે ઉપાડી જઈ) ગાઢ જંગલમાં એક ગુફામાં છુપાવી દીધા. આથી આ વ્રતનું નામ 'હરતાલિકા' (હરિત + આલિકા: સખીઓ દ્વારા હરણ કરાયેલી) પડ્યું. ત્યાં ગંગા કિનારે માતાએ કઠોર તપ શરૂ કર્યું.",
        "॥ અધ્યાય ૩: રેતીના શિવલિંગની પૂજા અને શિવજીનું વરદાન ॥\nભાદરવા સુદ ત્રીજના દિવસે માતાએ રેતીનું શિવલિંગ બનાવી નિરાહાર રહી રાત્રિ જાગરણ કરી શિવજીની આરાધના કરી. માતાના અખંડ તપથી પ્રસન્ન થઈ ભગવાન શિવે પ્રગટ થઈ મનોવાંછિત વરદાન આપ્યું અને તેમને પત્ની રૂપે સ્વીકાર્યા. આ વ્રતથી અખંડ સૌભાગ્યની પ્રાપ્તિ થાય છે."
      ]
    },
    "en": {
      "title": "Shri Hartalika Teej Vrat Katha & Worship Guidelines",
      "subtitle": "Shiva Purana, Rudra Samhita: The austere penance of Mother Parvati for Lord Shiva",
      "vedaSource": "Shiva Purana, Rudra Samhita",
      "shlokMeaning": "Salutations unto Goddess Parvati and Lord Shiva, the eternal divine parents of the universe whose half-form is united in eternal Ardhanarishwara.",
      "description": "Celebrated on Bhadrapada Shukla Tritiya with a strict waterless fast by married women and maidens seeking marital harmony, virtuous spouses, and enduring bliss.",
      "rules": [
        "Observe complete fasting without food or water throughout day and night of Bhadrapada Shukla Tritiya.",
        "Craft idols of Shiva, Parvati, and Ganesha from sacred clay or river sand, offering sixteen auspicious ornaments (Shodasha Shringara).",
        "Keep a night-long vigil with four quarters of prayer, concluding with immersion of idols and feast on Chaturthi morning."
      ],
      "kathaSummary": [
        "॥ Chapter 1: The Devotion of Child Parvati & Sage Narada's Proposal ॥\nMother Parvati reincarnated as the daughter of King Himavan. From tender infancy, her soul was absorbed in devotion to Lord Shiva. Sometime later, Sage Narada visited Himavan proposing marriage with Lord Vishnu. When Himavan agreed, Parvati wept in despair as her heart belonged solely to Mahadeva.",
        "॥ Chapter 2: The Loving Abduction by Confidantes into the Deep Forest ॥\nParvati confided in her close friends ('Alika'), who secretly abducted ('Harita') and hid her in a remote forest cavern along the Ganga. Thus the fast is named 'Hartalika'. In the dense wilderness, she undertook severe penance, enduring freezing cold, burning heat, and torrential rains.",
        "॥ Chapter 3: Clay Shivalinga Worship & Lord Shiva's Eternal Marriage Boon ॥\nOn Bhadrapada Shukla Tritiya, Parvati fashioned a Shivalinga from riverbed sand and observed a completely waterless vigil. Moved by her unwavering tapas, Lord Shiva appeared and granted her the cherished boon to become His eternal divine consort. Observing this fast blesses women with boundless auspiciousness."
      ]
    }
  },
  "chhath-puja": {
    "gu": {
      "title": "શ્રી છઠ પૂજા અને સૂર્ય ષષ્ઠી વ્રત કથા, અર્ઘ્ય વિધિ અને મંત્ર",
      "subtitle": "બ્રહ્મવૈવર્ત પુરાણ: પ્રત્યક્ષ દેવ ભગવાન સૂર્ય અને છઠી મૈયાની ઉપાસનાનું મહાપર્વ",
      "vedaSource": "બ્રહ્મવૈવર્ત પુરાણ, પ્રકૃતિ ખંડ",
      "shlokMeaning": "હે સૂર્યદેવ! આપ આદિદેવ છો, આપ જ બ્રહ્માંડના નેત્ર છો. આપ સમસ્ત જગતને જીવન અને તેજ આપનારા છો. આપને મારા વારંવાર પ્રણામ.",
      "description": "કાર્તિક શુક્લ ષષ્ઠીના દિવસે ઉજવાતું ચાર દિવસનું મહાવ્રત. નહાય-ખાય, ખરના, સંધ્યા અર્ઘ્ય અને ઉષા અર્ઘ્ય દ્વારા સૂર્યદેવ અને ષષ્ઠી દેવીની પૂજાથી સંતાન સુખ અને આરોગ્ય મળે છે.",
      "rules": [
        "ચાર દિવસ સુધી શુદ્ધ સાત્વિકતા, સ્નાન અને જમીન પર શયન કરો.",
        "ષષ્ઠીની સંધ્યાએ ડૂબતા સૂર્યને અને સપ્તમીના પ્રભાતે ઊગતા સૂર્યને જળમાં ઊભા રહી દૂધ અને ગંગાજળથી અર્ઘ્ય આપો.",
        "વાંસના સૂપડામાં ઠેકુઆ, ફળ, શેરડી, નાળિયેર અને મૂળા-હળદર અર્પણ કરો."
      ],
      "kathaSummary": [
        "॥ દિવસ ૧ અને ૨: નહાય-ખાય અને ખરના વિધિ ॥\nપ્રથમ દિવસે સ્નાન કરી શુદ્ધ ઘીમાં બનેલા ભાત-ચણાની દાળ અને દૂધીનું સેવન કરાય છે. બીજા દિવસે દિવસભર નિર્જળા રહી સાંજે ગોળની ખીર અને રોટલી બનાવી છઠી મૈયાને ભોગ ધરાવી 'ખરના' કરાય છે, જે પછી ૩૬ કલાકનું કઠોર નિર્જળા વ્રત શરૂ થાય છે.",
        "॥ દિવસ ૩ અને ૪: સંધ્યા અર્ઘ્ય, ઉષા અર્ઘ્ય અને ષષ્ઠી કથા ॥\nબ્રહ્મવૈવર્ત પુરાણ અનુસાર રાજા પ્રિયવ્રત અને રાણી માલિનીને વર્ષો સુધી સંતાન નહોતું. મહર્ષિ કશ્યપે પુત્રકામેષ્ટિ યજ્ઞ કરાવ્યો પરંતુ પુત્ર મૃત જન્મ્યો. રાજા દુઃખમાં પ્રાણ ત્યાગવા તૈયાર થયા ત્યારે બ્રહ્માજીની માનસપુત્રી દેવસેના (છઠી મૈયા) પ્રગટ થયા.",
        "॥ કથા સાર: સંતાન સુખ અને સૂર્ય ઉપાસના ॥\nદેવીએ કહ્યું કે હું પ્રકૃતિના છઠ્ઠા અંશથી પ્રગટ થઈ છું તેથી મારું નામ ષષ્ઠી છે. રાજાએ વિધિપૂર્વક સૂર્ય અને ષષ્ઠી દેવીની પૂજા કરી અને તેમનો પુત્ર સજીવન થયો. ત્યારથી સંતાન રક્ષા, દીર્ઘાયુષ્ય અને રોગમુક્તિ માટે છઠ પર્વ દેશ-વિદેશમાં શ્રદ્ધાથી ઉજવાય છે."
      ]
    },
    "en": {
      "title": "Shri Chhath Puja & Surya Shashthi Vrat Katha with Arghya Mantras",
      "subtitle": "Brahma Vaivarta Purana: The four-day solar festival honoring Lord Surya & Chhathi Maiya",
      "vedaSource": "Brahma Vaivarta Purana, Prakriti Khanda",
      "shlokMeaning": "O Sun God, supreme primal deity of the cosmos, eye of the universe, source of all life and illumination, salutations unto You.",
      "description": "Celebrated in Kartik Shukla Shashthi, this rigorous 36-hour waterless festival expresses reverence to the setting and rising sun, bestowing vitality, progeny, and cures from chronic ailments.",
      "rules": [
        "Maintain supreme purity, sleeping on floor mats and cooking in dedicated brass or earthen pots.",
        "Stand waist-deep in natural flowing water offering raw milk and sanctified water to the setting sun (Sandhya Arghya) and rising sun (Usha Arghya).",
        "Offer bamboo winnows loaded with Thekua, sugarcane stalks, whole coconuts, ginger, and turmeric roots."
      ],
      "kathaSummary": [
        "॥ Stage 1 & 2: Nahay-Khay & Kharna Rites ॥\nOn Day 1, devotees bathe at sunrise and partake of sanctified bottle gourd curry and rice. On Day 2 (Kharna), they fast all day, preparing jaggery kheer on mango-wood fires at dusk. Following this single sweet meal, a formidable 36-hour waterless fast begins.",
        "॥ Stage 3 & 4: Evening Arghya, Morning Arghya & The Legend of King Priyavrata ॥\nIn the Brahma Vaivarta Purana, King Priyavrata and Queen Malini were childless. When a son was born stillborn through yajna, the grief-stricken king prepared to end his life. Suddenly, the luminous Goddess Devasena (Chhathi Maiya), sixth manifestation of primordial cosmic nature, appeared.",
        "॥ Spiritual Essence: Progeny, Healing & Solar Grace ॥\nGoddess Devasena touched the infant, bringing him instantly back to life. She instructed the king to observe the solar Shashthi fast on riverbanks. The king obeyed, and his lineage flourished with invincible heirs. Chhath Puja remains the sublime worship of visible divinity in nature."
      ]
    }
  },
  "dhanteras": {
    "gu": {
      "title": "ધનતેરસ (ધનત્રયોદશી) મહાપૂજન વિધિ, ધન્વન્તરિ-કુબેર મંત્ર અને કથા",
      "subtitle": "સ્કંદપુરાણ અને પદ્મપુરાણ: આયુર્વેદના જનક ધન્વન્તરિ અને ધનાધિપતિ કુબેર પૂજન",
      "vedaSource": "સ્કંદ પુરાણ અને પદ્મ પુરાણ",
      "shlokMeaning": "અમૃત કળશ ધારણ કરનારા, સર્વ રોગો અને ભયનો નાશ કરનારા, ત્રણેય લોકના સ્વામી ભગવાન ધન્વન્તરિને હું નમન કરું છું.",
      "description": "આસો વદ તેરસના દિવસે ભગવાન ધન્વન્તરિ, કુબેર અને યમરાજનું પૂજન થાય છે. આ દિવસે વાસણ કે સોના-ચાંદીની ખરીદી કરવી અને યમદીપદાન કરવું અત્યંત શુભ મનાય છે.",
      "rules": [
        "સાંજે ઘરના મુખ્ય દ્વાર પર દક્ષિણ દિશા તરફ મુખ રાખી ચાર મુખી દીવો (યમ દીપક) પ્રગટાવો.",
        "ભગવાન ધન્વન્તરિની પૂજા કરી આરોગ્ય અને કુબેરજીની પૂજા કરી સ્થિર લક્ષ્મીની પ્રાર્થના કરો.",
        "તાંબુ, પિત્તળ, ચાંદી કે ધાતુના નવા વાસણો ખરીદી ઘરમાં લાવો."
      ],
      "kathaSummary": [
        "॥ ભાગ ૧: સમુદ્ર મંથન અને ભગવાન ધન્વન્તરિનું પ્રાગટ્ય ॥\nદેવો અને દાનવો વચ્ચે જ્યારે સમુદ્ર મંથન થયું, ત્યારે આસો વદ તેરસના દિવસે ક્ષીરસાગરમાંથી હાથમાં અમૃત ભરેલો સુવર્ણ કળશ લઈ ભગવાન ધન્વન્તરિ પ્રગટ થયા. તેઓ આયુર્વેદના જનક અને આરોગ્યના દેવતા છે. તેથી આ દિવસને ધનતેરસ કે રાષ્ટ્રીય આયુર્વેદ દિવસ તરીકે ઉજવવામાં આવે છે.",
        "॥ ભાગ ૨: યમદીપદાન અને રાજા હિમના પુત્રની કથા ॥\nરાજા હિમના પુત્રની કુંડળીમાં લગ્નના ચોથા દિવસે સાપના ડંખથી અકાળ મૃત્યુનો યોગ હતો. તેની ચતુર પત્નીએ ચોથા દિવસે આખા શયનખંડમાં સોના-ચાંદીના સિક્કા અને ઘરેણાં ઢગલા કરી દીધા અને ચારેય બાજુ અસંખ્ય દીવા પ્રગટાવ્યા. જ્યારે યમરાજ સર્પ બની આવ્યા ત્યારે દીવાઓ અને રત્નોના અંધાધૂંધ તેજથી તેમની આંખો અંજાઈ ગઈ અને તેઓ ડંખ મારી ન શક્યા.",
        "॥ ભાગ ૩: અકાળ મૃત્યુ નિવારણ અને કુબેર આશીર્વાદ ॥\nરાણી આખી રાત પંચાંગ અને ભજનો ગાતી રહી જેથી રાજકુમાર સૂઈ ન શક્યો. સૂર્યોદય થતાં યમરાજ ખાલી હાથે પાછા ફર્યા. આથી ધનતેરસની રાત્રે દક્ષિણ દિશામાં યમદીપદાન કરવાથી પરિવારમાં અકાળ મૃત્યુનો ભય કાયમ માટે ટળી જાય છે."
      ]
    },
    "en": {
      "title": "Dhanteras (Dhanatrayodashi) Maha Puja Vidhi, Dhanvantari & Kuber Mantras with Katha",
      "subtitle": "Skanda Purana & Padma Purana: Appearance of divine healer Dhanvantari & Kuber worship",
      "vedaSource": "Skanda Purana & Padma Purana",
      "shlokMeaning": "Salutations to Lord Dhanvantari, holding the nectar urn in His four hands, dispeller of all ailments, sovereign physician of the three worlds.",
      "description": "Celebrated on Kartik Krishna Trayodashi. Dedicated to Lord Dhanvantari for radiant health, Lord Kuber for righteous wealth, and Lord Yama for protection from untimely demise.",
      "rules": [
        "At twilight, light a four-wick mustard oil lamp (Yama Deepam) facing south at the main doorway.",
        "Purchase metal utensils (brass, copper, silver, or gold) symbolizing enduring prosperity.",
        "Worship Lord Dhanvantari offering coriander seeds and batasha sweets."
      ],
      "kathaSummary": [
        "॥ Part 1: Samudra Manthan & Appearance of Divine Healer Dhanvantari ॥\nDuring the cosmic churning of the Ocean of Milk (Samudra Manthan), Lord Dhanvantari emerged on Kartik Krishna Trayodashi bearing a golden urn brimming with Amrita (nectar of immortality). He is revered as the divine founder of Ayurveda who cures all physical and mental afflictions.",
        "॥ Part 2: The Yama Deepam Legend & King Hima's Young Prince ॥\nAstrologers predicted that King Hima's sixteen-year-old son would perish of snakebite on the fourth night of his marriage. His clever young bride heaped all their gold, silver, and brass vessels at the chamber entrance and illuminated hundreds of lamps, singing sacred hymns through the night.",
        "॥ Part 3: Overcoming Untimely Demise with Radiant Light ॥\nWhen Lord Yama arrived disguised as a venomous serpent, the dazzling brilliance of the lamps and gold blinded his eyes. Unable to enter, he coiled harmlessly atop the ornaments listening to holy chants until sunrise passed. Lighting a lamp to Yama on Dhanteras wards off untimely demise forever."
      ]
    }
  },
  "deepawali": {
    "gu": {
      "title": "દીપાવલી મહાલક્ષ્મી અને ગણેશ પૂજન વિધાન, કનકધારા સ્તોત્ર અને કથા",
      "subtitle": "સ્કંદપુરાણ અને શ્રીસૂક્ત: દીપોત્સવ, ચોપડા પૂજન અને કનકધારા સ્તોત્રનો મહિમા",
      "vedaSource": "સ્કંદ પુરાણ, વૈષ્ણવ ખંડ",
      "shlokMeaning": "કમળના આસન પર બિરાજમાન, શ્વેત વસ્ત્રો ધારણ કરનારી, સમસ્ત ઐશ્વર્ય આપનારી જગતજનની મહાલક્ષ્મીને હું નમસ્કાર કરું છું.",
      "description": "આસો વદ અમાસની પાવન રાત્રિએ મહાલક્ષ્મી, મહાકાળી, મહાસરસ્વતી અને શ્રી ગણેશજીનું વિધિવત ષોડશોપચાર પૂજન. આ રાત્રિએ પૂજા કરવાથી દરિદ્રતાનો નાશ થાય છે.",
      "rules": [
        "ઈશાન ખૂણામાં બાજોઠ પર લાલ વસ્ત્ર પાથરી લક્ષ્મી-ગણેશ, કુબેર અને કળશ સ્થાપના કરો.",
        "કંકુ, અક્ષત, કમળનું પુષ્પ, ખીલ-પતાસા અને મીઠાઈનો ભોગ ધરાવો.",
        "ઘીનો અખંડ દીવો પ્રગટાવી શ્રી સૂક્ત અને કનકધારા સ્તોત્રનો પાઠ કરો."
      ],
      "kathaSummary": [
        "॥ ભાગ ૧: દીપાવલીની પાવન રાત્રિ અને લક્ષ્મી પ્રાગટ્ય ॥\nસમુદ્ર મંથન દરમિયાન આસો વદ અમાસની ઘોર અમાવાસ્યાએ ક્ષીરસાગરમાંથી માતા લક્ષ્મી કમળના આસન પર બિરાજમાન થઈ પ્રગટ થયા. દેવતાઓએ તેમના સ્વાગત માટે દીપમાળા પ્રગટાવી. માતાએ ભગવાન વિષ્ણુને પોતાના સ્વામી તરીકે વરમાળા પહેરાવી. આથી આ રાત્રિએ દીપો પ્રગટાવી લક્ષ્મીજીનું સ્વાગત કરાય છે.",
        "॥ ભાગ ૨: શ્રી રામનું અયોધ્યા પુનરાગમન અને ઉત્સવ ॥\nચૌદ વર્ષનો વનવાસ પૂર્ણ કરી અને લંકાપતિ રાવણનો વધ કરી ભગવાન શ્રી રામ, માતા સીતા અને લક્ષ્મણજી આસો અમાસે અયોધ્યા પાછા ફર્યા હતા. અયોધ્યાવાસીઓએ ઘીના દીવા પ્રગટાવી અંધકારને દૂર કરી દીપોત્સવ મનાવ્યો હતો.",
        "॥ ભાગ ૩: આદિ શંકરાચાર્ય અને કનકધારા સ્તોત્ર કથા ॥\nજગતગુરુ આદિ શંકરાચાર્ય જ્યારે ભિક્ષા માટે એક અત્યંત ગરીબ વૃદ્ધ સ્ત્રીના ઘરે ગયા, ત્યારે ઘરમાં અન્ન ન હોવાથી તેણે માત્ર એક સુકાયેલું આંબળું શ્રદ્ધાપૂર્વક દાન કર્યું. શંકરાચાર્યનું હૃદય દ્રવી ઊઠ્યું અને તેમણે તત્કાળ માતા લક્ષ્મીની સ્તુતિમાં ૨૧ શ્લોકોવાળા 'કનકધારા સ્તોત્ર'ની રચના કરી. માતા લક્ષ્મીએ પ્રસન્ન થઈ તે ગરીબ બ્રાહ્મણીના આંગણામાં સોનાના આંબળાંની વર્ષા કરી દીધી. દીપાવલીએ આ સ્તોત્ર પઢવાથી કદી દરિદ્રતા આવતી નથી."
      ]
    },
    "en": {
      "title": "Deepawali Mahalakshmi & Ganesh Puja Vidhan with Kanakadhara Stotra",
      "subtitle": "Skanda Purana & Shri Suktam: Festival of Lights, Chopda Pujan & golden rain legend",
      "vedaSource": "Skanda Purana, Vaishnava Khanda",
      "shlokMeaning": "Seated gracefully upon a golden lotus, clad in pristine white garments, bestower of all prosperity, Mother Mahalakshmi, salutations unto You.",
      "description": "Celebrated on Kartik Amavasya night. Devotees perform 16-step worship of Goddess Mahalakshmi, Lord Ganesha, and Kuber to invite enduring enlightenment and abundance.",
      "rules": [
        "Establish Lakshmi, Ganesha, Kuber, and water Kalash on a red silk cloth in the North-East sanctuary.",
        "Offer whole unbroken rice, lotus flowers, puffed rice (Kheel), batasha, and pure ghee sweets.",
        "Illuminate earthen ghee lamps in every room and recite Shri Suktam or Kanakadhara Stotra."
      ],
      "kathaSummary": [
        "॥ Part 1: Emergence of Goddess Mahalakshmi from the Ocean of Milk ॥\nOn the darkest night of Kartik Amavasya, Goddess Mahalakshmi emerged from the cosmic ocean churned by gods and titans. Celestial elephants showered her with holy waters as the Devatas lit thousands of earthen lamps in adoration. Choosing Lord Vishnu as Her eternal consort, She proclaimed eternal prosperity for those who honor truth and generosity.",
        "॥ Part 2: Return of Lord Rama to Ayodhya after 14 Years ॥\nHaving vanquished the demon king Ravana and completed fourteen years of exile, Lord Sri Rama, Sita Devi, and Lakshmana returned triumphant to Ayodhya on this Amavasya night. The joyful citizens dispelled the nocturnal gloom with rows of sparkling earthen lamps (Deepavali).",
        "॥ Part 3: Adi Shankaracharya & The Golden Rain of Kanakadhara ॥\nWhen young Adi Shankaracharya begged for alms at an impoverished widow's cottage, she wept having nothing to offer except a single withered gooseberry (Amla). Moved by her supreme charity, Shankara spontaneously composed the twenty-one verses of Kanakadhara Stotra. Goddess Lakshmi showered a deluge of pure golden gooseberries into the widow's hut. Reciting this on Diwali dispels all debt and hardship."
      ]
    }
  },
  "shiv-mahimana-stotra": {
    "gu": {
      "title": "શ્રી શિવ મહિમ્ન સ્તોત્ર (પુષ્પદંત ગંધર્વ રચિત)",
      "subtitle": "શિવભક્તિનું સર્વોચ્ચ સ્તોત્ર: ૩૫ અલૌકિક શ્લોકો અને પુષ્પદંત ગંધર્વની કથા",
      "vedaSource": "સનાતન શિવ સ્તુતિ પરંપરા",
      "shlokMeaning": "હે શિવ! આપના અપરંપાર મહિમાની સ્તુતિ કરવા બ્રહ્માદિ દેવો પણ અસમર્થ છે, તો મારી આ વાણી જો આપનું ગુણગાન કરે તો તેમાં કોઈ દોષ નથી.",
      "description": "પુષ્પદંત નામના ગંધર્વે રચેલું શિવ મહિમ્ન સ્તોત્ર સંસ્કૃત સાહિત્યનું સૌથી સુંદર અને શક્તિશાળી સ્તોત્ર ગણાય છે. આ સ્તોત્રના નિયમિત પાઠથી સર્વ પાપ નષ્ટ થાય છે.",
      "rules": ["પ્રભાતે કે પ્રદોષ કાળમાં શિવલિંગ સામે બેસી પવિત્ર મનથી પાઠ કરો."],
      "kathaSummary": [
        "॥ ભાગ ૧: પુષ્પદંત ગંધર્વ અને રાજા ચિત્રરથનું શિવ-ઉદ્યાન ॥\nદેવરાજ ઇન્દ્રની સભાનો મુખ્ય ગાયક પુષ્પદંત ગંધર્વ શિવજીનો પરમ ભક્ત હતો. કાશીના રાજા ચિત્રરથના સુંદર બગીચામાંથી રોજ તાજા ફૂલો ચૂંટી તે શિવપૂજા કરતો. અદ્રશ્ય થવાની વિદ્યાના કારણે કોઈ તેને પકડી શકતું નહોતું.",
        "॥ ભાગ ૨: શિવ નિર્માલ્યનું ઉલ્લંઘન અને શક્તિ-હરણ ॥\nચોરી પકડવા રાજાએ બગીચાના રસ્તા પર ભગવાન શિવ પર ચઢાવેલા નિર્માલ્ય બિલ્વપત્ર અને પુષ્પો પાથરી દીધા. અજાણતા પુષ્પદંતના પગ શિવ નિર્માલ્ય પર પડ્યા અને તેનું ઘોર અપમાન થતાં તેની અદ્રશ્ય થવાની અને ઉડવાની દિવ્ય શક્તિ તત્કાળ નાશ પામી.",
        "॥ ભાગ ૩: ૩૫ શ્લોકોની રચના અને મહાદેવની પ્રસન્નતા ॥\nપોતાની ભૂલનો પસ્તાવો કરી પુષ્પદંતે ભગવાન શિવની ક્ષમા યાચના માટે અત્યંત ભાવવિભોર ૩૫ શ્લોકોવાળા 'મહિમ્ન સ્તોત્ર'ની રચના કરી. શિવજી અતિ પ્રસન્ન થયા અને તેને પુનઃ દિવ્ય શક્તિઓ પ્રદાન કરી. આ સ્તોત્રનો પાઠ અશ્વમેધ યજ્ઞ સમાન પુણ્ય આપે છે."
      ]
    },
    "en": {
      "title": "Shri Shiva Mahimna Stotra (Composed by Pushpadanta Gandharva)",
      "subtitle": "The pinnacle of Shiva adoration: 35 transcendent verses and the Gandharva legend",
      "vedaSource": "Sanatan Shaiva Stuti Tradition",
      "shlokMeaning": "O Lord Shiva! If even Brahma and the great gods cannot fathom the outer boundaries of Your glory, then my humble effort to praise You is blameless.",
      "description": "Composed by Gandharva king Pushpadanta, this hymn is universally acknowledged as one of the most sublime philosophical and poetic masterpieces in Sanskrit.",
      "rules": ["Chant in the peaceful morning twilight or during Pradosha before a consecrated Shivalinga."],
      "kathaSummary": [
        "॥ Part 1: Pushpadanta's Invisible Theft in King Chitraratha's Garden ॥\nPushpadanta, the celestial king of Gandharvas, was an ardent devotee of Lord Shiva. Each dawn he used his power of invisibility to pluck divine blossoms from King Chitraratha's royal gardens to worship Mahadeva, baffling the royal guards.",
        "॥ Part 2: The Desecration of Nirmalya & Loss of Mystic Powers ॥\nTo catch the unseen intruder, the wise king scattered previously offered sacred Bilva leaves (Nirmalya) across garden paths. Unwittingly stepping upon the sanctified offerings, Pushpadanta committed sacrilege and instantly forfeited his celestial flying powers.",
        "॥ Part 3: Composition of 35 Verses & Divine Absolution ॥\nTrapped on earth, Pushpadanta poured his soul into thirty-five magnificent verses glorifying the cosmic, formless, and all-compassionate nature of Shiva. Lord Shiva appeared in boundless grace, restoring his celestial radiance and declaring that reciting this hymn equals the merit of an Ashwamedha sacrifice."
      ]
    }
  },
  "nitya-prarthana-mantra": {
    "gu": {
      "title": "નિત્ય દૈનિક પ્રાર્થના અને શ્લોક (પ્રભાત, ભોજન, સંધ્યા અને શયન સમયે)",
      "subtitle": "દૈનિક જીવનને આધ્યાત્મિક બનાવતા સનાતન સંસ્કાર શ્લોકો (ગુજરાતી ભાવાર્થ સહિત)",
      "vedaSource": "સનાતન સ્મૃતિ અને નિત્યકર્મ વિધિ",
      "shlokMeaning": "હાથના અગ્રભાગમાં લક્ષ્મી, મધ્યમાં સરસ્વતી અને મૂળમાં બ્રહ્મા-ગોવિંદનો વાસ છે, તેથી પ્રભાતે હથેળીઓનું દર્શન કરવું જોઈએ.",
      "description": "સવારથી રાત સુધી આપણા રોજીંદા કાર્યોને પવિત્ર યજ્ઞ બનાવતા દૈનિક શ્લોકો. જાગતી વખતે, પૃથ્વી સ્પર્શ, સ્નાન, ભોજન અને રાત્રે સૂતી વખતના મંત્રો.",
      "rules": ["રોજ સવારે પથારીમાં જાગતાં જ હથેળીઓ જોડી આંખો ખોલો."],
      "kathaSummary": [
        "॥ ૧. પ્રભાત કર દર્શન શ્લોક ॥\n'કરાગ્રે વસતે લક્ષ્મીઃ કરમધ્યે સરસ્વતી। કરમૂલે સ્થિતો બ્રહ્મા પ્રભાતે કરદર્શનમ્॥'\n(અર્થ: હથેળીના અગ્રભાગમાં ધનદાત્રી લક્ષ્મી, મધ્યમાં વિદ્યાદાત્રી સરસ્વતી અને મૂળમાં બ્રહ્મા-વિષ્ણુ રહે છે. સવારે ઊઠતાં જ પોતાના હાથનું દર્શન કરી દિવસનો પ્રારંભ કરો.)",
        "॥ ૨. પૃથ્વી ક્ષમા યાચના શ્લોક ॥\n'સમુદ્રવસને દેવી પર્વતસ્તનમંડલે। વિષ્ણુપત્નિ નમસ્તુભ્યં પાદસ્પર્શં ક્ષમસ્વમે॥'\n(અર્થ: સમુદ્ર રૂપી વસ્ત્રો ધારણ કરનારી અને વિષ્ણુપ્રિયા એવી પૃથ્વી માતા! મારા પગ આપના પર મૂકવા બદલ મને ક્ષમા કરો.)",
        "॥ ૩. ભોજન પૂર્વેનો શ્લોક ॥\n'બ્રહ્માર્પણં બ્રહ્મ હવિર્બ્રહ્માગ્નૌ બ્રહ્મણા હુતમ્। બ્રહ્મૈવ તેન ગન્તવ્યં બ્રહ્મકર્મસમાધિના॥'\n(અર્થ: ભોજન, અગ્નિ અને ગ્રહણ કરનાર સૌ બ્રહ્મસ્વરૂપ છે. ભોજનને ઈશ્વરીય પ્રસાદ માની શાંતિથી ગ્રહણ કરો.)",
        "॥ ૪. રાત્રિ શયન પૂર્વે શિવ ક્ષમા પ્રાર્થના ॥\n'કરચરણકૃતં વાક્કાયજં કર્મજં વા શ્રવણનયનજં વા માનસં વાપરાધમ્। વિહિતમવિહિતં વા સર્વમેતત્ ક્ષમસ્વ જય જય કરુણાબ્ધે શ્રીમહાદેવ શમ્ભો॥'\n(અર્થ: દિવસ દરમિયાન હાથ, પગ, વાણી કે મનથી જે પણ દોષ થયા હોય, હે કરુણાસાગર મહાદેવ શિવ, તે સર્વ ક્ષમા કરી મને શાંત નિંદ્રા પ્રદાન કરો.)"
      ]
    },
    "en": {
      "title": "Daily Vedic Prayers & Shlokas (Awakening, Meals, Dusk & Sleep)",
      "subtitle": "Essential Sanatan verses transforming daily life into conscious spiritual communion",
      "vedaSource": "Sanatan Smriti & Nityakarma Traditions",
      "shlokMeaning": "At the fingertips dwells Lakshmi, in the palm dwells Saraswati, at the base dwells Govinda; therefore contemplate your palms upon awakening.",
      "description": "The essential daily mantras for contemplation upon rising, stepping on Mother Earth, taking meals, and surrendering to sleep at night.",
      "rules": ["Open your eyes at dawn directly facing joined palms and recite the Karadarshana verse."],
      "kathaSummary": [
        "॥ 1. Morning Palm Contemplation (Karadarshana) ॥\n'Karagre Vasate Lakshmi Kara-madhye Saraswati, Kara-mule Tu Govindah Prabhate Karadarshanam.'\n(Meaning: At the tips of my fingers resides Lakshmi; in the middle dwells Saraswati; at the base rests Govinda. I gaze upon my palms at dawn to align my deeds with righteousness and virtue.)",
        "॥ 2. Reverence & Forgiveness to Mother Earth ॥\n'Samudra Vasane Devi Parvata Stana Mandale, Vishnu Patni Namastubhyam Pada Sparsham Kshamasva Me.'\n(Meaning: O Mother Earth, robed by the vast oceans, sacred consort of Lord Vishnu, please forgive me as my feet step upon You today.)",
        "॥ 3. Mealtime Offering (Brahmarpanam) ॥\n'Brahmarpanam Brahma Havir Brahmagnau Brahmana Hutam, Brahmaiva Tena Gantavyam Brahma Karma Samadhina.'\n(Meaning: The offering is Brahman, the oblation is Brahman, consumed in the sacrificial fire of Brahman. By recognizing the divine in nourishment, one attains supreme consciousness.)",
        "॥ 4. Nighttime Prayer for Forgiveness & Peaceful Sleep ॥\n'Kara Charana Kritam Vak Kayajam Karmajam Va Shravana Nayannajam Va Manasam Vaparadham, Vihitam Avihitam Va Sarvam Etat Kshamasva Jaya Jaya Karunabdhe Shri Mahadeva Shambho.'\n(Meaning: Whatever transgressions were committed by hand, feet, words, senses, or thoughts, conscious or unconscious—forgive them all, O Ocean of Mercy, Lord Shiva.)"
      ]
    }
  }
}

footer_ts = """

export function getLocalizedVratKathaItem(item: VratKathaItem, lang: string): VratKathaItem {
  if (lang === 'hi') {
    return item;
  }
  const trans = KATHA_TRANSLATIONS[item.id]?.[lang as 'gu' | 'en'];
  if (!trans) {
    return item;
  }
  return {
    ...item,
    title: trans.title || item.title,
    subtitle: trans.subtitle || item.subtitle,
    vedaSource: trans.vedaSource || item.vedaSource,
    shlokMeaning: trans.shlokMeaning || item.shlokMeaning,
    description: trans.description || item.description,
    rules: trans.rules && trans.rules.length > 0 ? trans.rules : item.rules,
    katha: trans.kathaSummary && trans.kathaSummary.length > 0 ? trans.kathaSummary : item.katha,
  };
}
"""

with open('src/services/vratKathaMultilingual.ts', 'w', encoding='utf-8') as f:
    f.write(data_ts_header)
    f.write(json.dumps(translations, indent=2, ensure_ascii=False))
    f.write(footer_ts)

print("Successfully written vratKathaMultilingual.ts with all 18 items!")
