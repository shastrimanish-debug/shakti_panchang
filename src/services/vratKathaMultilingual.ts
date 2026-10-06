import { VratKathaItem, VRAT_KATHA_CATEGORIES, VRAT_KATHA_DATA } from '../data/vratKathaData';

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

// Full translations for Kathas in Gujarati & English
export const KATHA_TRANSLATIONS: Record<
  string,
  {
    gu: {
      title: string;
      subtitle: string;
      vedaSource: string;
      shlokMeaning: string;
      description: string;
      rules: string[];
      kathaSummary?: string[];
    };
    en: {
      title: string;
      subtitle: string;
      vedaSource: string;
      shlokMeaning: string;
      description: string;
      rules: string[];
      kathaSummary?: string[];
    };
  }
> = {
  'satyanarayan-katha': {
    gu: {
      title: 'શ્રી સત્યનારાયણ વ્રત કથા (રેવાખંડના સાતેય અધ્યાય, ગુજરાતી અનુવાદ સાથે)',
      subtitle: 'સ્કંદપુરાણ, રેવાખંડ. સાત અધ્યાય: શ્લોક અને દરેક અધ્યાયની ગુજરાતી કથા',
      vedaSource: 'સ્કંદપુરાણ, રેવાખંડ (અધ્યાય ૧ થી ૭)',
      shlokMeaning: 'જે સત્યના વ્રતને ધારણ કરનારા છે, સત્યમાં જ તત્પર છે, ત્રણેય કાળમાં સત્ય સ્વરૂપ છે અને સમસ્ત સત્યના મૂળ ઉદ્ગમ છે, તેવા ભગવાન સત્યનારાયણના શરણે હું જાઉં છું.',
      description: 'સ્કંદપુરાણના રેવાખંડમાં વર્ણવેલી શ્રી સત્યનારાયણ ભગવાનની સંપૂર્ણ વ્રત કથા. આ કથા સાંભળવાથી કલિયુગમાં સર્વ મનોકામનાઓ પૂર્ણ થાય છે અને ઘરમાં સુખ, શાંતિ અને સમૃદ્ધિ આવે છે.',
      rules: [
        'પ્રભાતે વહેલા ઊઠીને સ્નાન કરી નિર્મળ વસ્ત્રો ધારણ કરો અને વ્રતનો સંકલ્પ લો.',
        'પૂજા મંડપમાં કેળના સ્તંભો, આંબાના પાન અને પુષ્પોથી વેદી શણગારો.',
        'સત્યનારાયણ ભગવાનની મૂર્તિ કે સોપારી સ્થાપી પંચામૃત, ફળ, પાન, સોપારી, કેળાં અને શીરો/પંજરીનો ભોગ ધરાવો.',
        'પરિવાર અને બ્રાહ્મણ સાથે બેસીને શ્રદ્ધાપૂર્વક કથાનું શ્રવણ કરો અને અંતમાં આરતી કરી પ્રસાદ વહેંચો.'
      ],
      kathaSummary: [
        '॥ પ્રથમ અધ્યાય: નૈમિષારણ્યમાં શૌનક ઋષિનો પ્રશ્ન ॥\nનૈમિષારણ્ય તીર્થમાં શૌનકાદિ મુનિઓએ સૂતજીને પૂછ્યું કે કલિયુગમાં મનુષ્યો અલ્પાયુ અને ચિંતાગ્રસ્ત હશે, તો કયા સરળ વ્રતથી ઉત્તમ પુણ્ય અને મનોવાંછિત ફળ મળે? સૂતજીએ કહ્યું કે આ જ પ્રશ્ન નારદજીએ ભગવાન વિષ્ણુને પૂછ્યો હતો અને ભગવાને શ્રી સત્યનારાયણ વ્રતનો ઉપદેશ આપ્યો હતો.',
        '॥ દ્વિતીય અધ્યાય: કાશીના ગરીબ બ્રાહ્મણની કથા ॥\nકાશી નગરીમાં એક અત્યંત નિર્ધન બ્રાહ્મણ ભિક્ષા માંગી નિર્વાહ કરતો હતો. ભગવાને વૃદ્ધ બ્રાહ્મણનું રૂપ ધરી તેને શ્રી સત્યનારાયણ વ્રત કરવાની વિધિ બતાવી. બ્રાહ્મણે ભક્તિભાવથી વ્રત કર્યું અને તેના સર્વ દુઃખો દૂર થઈ ગયા અને તે ધનધાન્યવાન બન્યો.',
        '॥ તૃતીય અધ્યાય: લાકડા વેચનાર કઠિયારાનો ઉદ્ધાર ॥\nએક દિવસ એ જ બ્રાહ્મણ વ્રત કરતો હતો ત્યારે એક કઠિયારો તરસ્યો થઈ ત્યાં આવ્યો. તેણે વ્રતની મહિમા જાણી સંકલ્પ કર્યો કે આજે લાકડાં વેચી જે ધન મળશે તેનાથી સત્યનારાયણની પૂજા કરીશ. તે દિવસે બમણું ધન મળ્યું અને તેણે ભક્તિભાવથી વ્રત કર્યું, જેના ફળસ્વરૂપે તેને પુત્રરત્ન અને અખંડ સમૃદ્ધિ પ્રાપ્ત થઈ.',
        '॥ ચતુર્થ અધ્યાય: સાધુ વાણિયા અને કલાવતીની કથા ॥\nઉલ્કામુખ નામના રાજા સમુદ્ર કિનારે વ્રત કરતા હતા ત્યારે સાધુ નામનો વાણિયો ત્યાં આવ્યો. તેણે સંતાન પ્રાપ્તિ માટે વ્રતનો સંકલ્પ કર્યો. તેને કલાવતી નામની સુંદર પુત્રી પ્રાપ્ત થઈ, પરંતુ તેણે વ્રત કરવાનું ટાળ્યું. કલાવતીના વિવાહ પછી પણ વ્રત ભૂલી જતાં ભગવાન રુષ્ટ થયા અને વેપારમાં તેના પર ચોરીનો ખોટો આરોપ લાગતાં રાજા ચંદ્રકેતુએ તેને અને તેના જમાઈને કેદ કર્યા.',
        '॥ પંચમ અધ્યાય: કારાગાર મુક્તિ અને રાજાનું સ્વપ્ન ॥\nસાધુ વાણિયાનું ઘર પણ લૂંટાઈ ગયું. તેની પત્ની લીલાવતી અને પુત્રી કલાવતી ભિક્ષા માંગવા લાગ્યા. એક દિવસ કલાવતીએ મંદિરમાં સત્યનારાયણની કથા સાંભળી અને પ્રસાદ લીધો. લીલાવતીએ પણ પસ્તાવો કરી વ્રત કર્યું. ભગવાને રાજા ચંદ્રકેતુને સ્વપ્નમાં આદેશ આપ્યો કે બંને વાણિયા નિર્દોષ છે, તેમને મુક્ત કરો અને તેમનું ધન બમણું કરીને પાછું આપો.',
        '॥ ષષ્ઠ અધ્યાય: જહાજ અને પ્રસાદની ઉપેક્ષા ॥\nમુક્ત થઈ સાધુ વાણિયો વહાણ લઈને નીકળ્યો ત્યારે ભગવાને સંન્યાસી રૂપે પૂછ્યું કે વહાણમાં શું છે? વાણિયાએ ઘમંડથી કહ્યું કે માત્ર વેલા અને પાંદડાં છે. ભગવાને તથાસ્તુ કહ્યું અને ધન પાંદડાં થઈ ગયું. વાણિયાએ ક્ષમા માંગી ત્યારે ફરી ધન પ્રાપ્ત થયું. ઘરે પહોંચી કલાવતી પતિના મિલનની ઉતાવળમાં પ્રસાદ ખાધા વગર દોડી ગઈ, જેથી તેનું વહાણ જળમાં ડૂબી ગયું. પશ્ચાત્તાપ કરી પાછા આવી પ્રસાદ ગ્રહણ કર્યો ત્યારે જમાઈ અને વહાણ સહીસલામત પાછા મળ્યા.',
        '॥ સપ્તમ અધ્યાય: રાજા તુંગધ્વજ અને ગોવાળોની કથા ॥\nરાજા તુંગધ્વજે જંગલમાં ગોવાળોને સત્યનારાયણની પૂજા કરતા જોયા પરંતુ અભિમાનવશ પ્રણામ ન કર્યા કે પ્રસાદ ન લીધો. પરિણામે તેમના સો પુત્રો અને રાજ્ય નાશ પામ્યા. રાજાએ ભૂલ સ્વીકારી ગોવાળો સાથે વ્રત કર્યું અને પ્રસાદ લીધો ત્યારે ભગવાનની કૃપાથી રાજ્ય અને પુત્રો પુનઃ પ્રાપ્ત થયા. અંતે સર્વે વૈકુંઠધામને પામ્યા.'
      ]
    },
    en: {
      title: 'Shri Satyanarayan Vrat Katha (All 7 Chapters with English Meaning)',
      subtitle: 'Skanda Purana, Reva Khanda. Seven Chapters: Sanskrit verses & English translation',
      vedaSource: 'Skanda Purana, Reva Khanda (Chapters 1 to 7)',
      shlokMeaning: 'I take refuge in Lord Satyanarayana, who embodies the vow of truth, who is devoted to truth, who is the eternal truth in all three times, and who is the ultimate source of all existence.',
      description: 'The complete sacred Katha of Lord Satyanarayan from Skanda Purana. Reciting or listening to this story bestows peace, prosperity, resolution of obstacles, and spiritual liberation in the Kali Yuga.',
      rules: [
        'Wake up early at Brahma Muhurta, take a purifying bath, and take a solemn vow (Sankalpa).',
        'Decorate the puja altar with banana trunks, mango leaves, flowers, and holy cloth.',
        'Install the idol or betel nut representation of Lord Satyanarayan, offering Panchamrita, fresh fruits, betel leaves, bananas, and panjiri/prasad.',
        'Listen to the story with devotion alongside family and friends, conclude with Aarti, and partake in the sacred Prasad.'
      ],
      kathaSummary: [
        '॥ Chapter 1: The Inquiry of Sage Shaunaka in Naimisharanya ॥\nIn the sacred forest of Naimisharanya, sage Shaunaka asked Suta Goswami: In the age of Kali, humans have short lives and endless anxieties; by what simple vow can they attain supreme virtue and fulfill their desires? Suta revealed that sage Narada had asked the same question to Lord Vishnu, who prescribed the Satyanarayan Vrat.',
        '॥ Chapter 2: The Poor Brahmin of Varanasi ॥\nIn the holy city of Kashi, an impoverished Brahmin struggled for food. Lord Vishnu appeared in the guise of an elderly ascetic and instructed him to perform the Satyanarayan Puja. The Brahmin performed it with pure devotion, and all his poverty was eradicated, blessing him with abundance.',
        '॥ Chapter 3: The Salvation of the Woodcutter ॥\nWhile the Brahmin was performing the vow, a thirsty woodcutter arrived. Learning about the glory of Lord Satyanarayan, he pledged to use that day’s earnings to perform the puja. He received double the price for his firewood, performed the ritual, and was blessed with sons and everlasting happiness.',
        '॥ Chapter 4: The Merchant Sadhu and Kalavati ॥\nA wealthy merchant named Sadhu observed King Ulkamukha performing the vow and resolved to perform it once he had a child. A beautiful daughter, Kalavati, was born to his wife Lilavati, yet he postponed the vow repeatedly. After Kalavati’s marriage, he still forgot his promise. Consequently, while trading in Ratnasarapur, he and his son-in-law were falsely accused of royal theft and imprisoned by King Chandraketu.',
        '॥ Chapter 5: Release from Prison and the King’s Dream ॥\nBack home, thieves plundered the merchant’s wealth. Mother and daughter wandered begging. One evening, Kalavati witnessed a Satyanarayan Puja in a Brahmin’s home and partook of the prasad. Realizing their neglect, Lilavati performed the vow. Pleased, Lord Satyanarayan commanded King Chandraketu in a dream to release the innocent merchants immediately and return their wealth twofold.',
        '॥ Chapter 6: The Testing at Sea and Disregard of Prasad ॥\nOn their return journey, Lord Satyanarayan tested the merchant in the guise of a wandering monk, asking what was aboard his ship. Arrogantly, the merchant replied it was merely dry leaves. The Lord said "So be it," and all jewels turned to leaves. Repenting sincerely, the merchant prayed, and his fortune was restored. Reaching his home port, daughter Kalavati rushed to meet her husband without eating the holy prasad; instantly, his boat sank. Only when she returned, confessed, and revered the prasad did the ship and her husband resurface safely.',
        '॥ Chapter 7: King Tungadhwaja and the Cowherds ॥\nKing Tungadhwaja encountered cowherd boys performing the Satyanarayan Vrat in the woods. Full of royal pride, he refused to bow or accept the prasad. Consequently, his sons perished and his kingdom declined. Humbled, the king returned to the forest, worshipped Lord Satyanarayan alongside the cowherds, and partook of the prasad, restoring his kingdom and family.'
      ]
    }
  },
  'ganpati-sthapana-pujan': {
    gu: {
      title: 'શ્રી ગણેશ સ્થાપના અને સંપૂર્ણ વૈદિક પૂજન વિધિ',
      subtitle: 'ગણેશ પુરાણ, મુદ્ગલ પુરાણ અને વૈદિક પદ્ધતિથી પ્રાણપ્રતિષ્ઠા અને પૂજન',
      vedaSource: 'ગણેશ પુરાણ અને અથર્વશીર્ષ',
      shlokMeaning: 'જેમનું મુખ વક્ર છે, શરીર વિશાળ છે અને જે કરોડો સૂર્ય સમાન તેજસ્વી છે, તેવા ભગવાન ગણેશ મારા તમામ કાર્યો નિર્વિઘ્ને પૂર્ણ કરો.',
      description: 'શ્રી ગણેશ ઉત્સવ અને કોઈપણ શુભ કાર્યના પ્રારંભે ભગવાન ગણેશની સ્થાપના, ષોડશોપચાર પૂજન, દૂર્વા અર્પણ અને અથર્વશીર્ષ પાઠની સંપૂર્ણ શાસ્ત્રોક્ત વિધિ.',
      rules: [
        'ઈશાન અથવા ઉત્તર દિશામાં બાજોઠ પર લાલ કે પીળું વસ્ત્ર પાથરી ચોખાની ઢગલી પર કળશ સ્થાપના કરો.',
        'ગણેશજીની મૂર્તિને સ્નાન કરાવી ચંદન, કંકુ, અક્ષત અને સિંદૂર અર્પણ કરો.',
        'ગણેશજીને પ્રિય ૨૧ દૂર્વા (દુર્વાંકુર) અને મોદક/લાડુનો ભોગ ધરાવો.'
      ]
    },
    en: {
      title: 'Shri Ganesh Sthapana & Complete Vedic Puja Vidhi',
      subtitle: 'Ganesh Purana, Mudgala Purana & Vedic Prana-Pratishtha method',
      vedaSource: 'Ganesh Purana & Atharvashirsha',
      shlokMeaning: 'O Lord with the curved trunk and immense cosmic form, whose radiance equals millions of suns, please remove all obstacles from my endeavors forever.',
      description: 'The authentic scriptural guidelines for invoking Lord Ganesha, establishing the sacred altar, 16-step Shodashopachara worship, offering sacred Durva grass, and chanting Ganapati Atharvashirsha.',
      rules: [
        'Place a red or yellow cloth on a wooden pedestal facing East or North-East, and set the Kalash on unbroken rice grains.',
        'Anoint Lord Ganesha with fragrant water, sandalwood paste, kumkum, and vermilion.',
        'Offer 21 blades of sacred Durva grass, red hibiscus flowers, and modak sweets with full devotion.'
      ]
    }
  },
  'pradosh-vrat': {
    gu: {
      title: 'પ્રદોષ વ્રત કથા (ભગવાન ભોળાનાથ શિવ)',
      subtitle: 'શિવ પુરાણ, કોટિરુદ્ર સંહિતા અનુસાર વ્રત કથા અને સંધ્યાકાળ પૂજન વિધિ',
      vedaSource: 'શિવ પુરાણ, કોટિરુદ્ર સંહિતા',
      shlokMeaning: 'ત્રિનેત્રધારી, સુગંધિત અને પુષ્ટિવર્ધક ભગવાન શિવની અમે ઉપાસના કરીએ છીએ. તેઓ આપણને મૃત્યુના બંધનમાંથી મુક્ત કરી અમૃતત્વ પ્રદાન કરે.',
      description: 'ત્રયોદશી તિથિના સંધ્યાકાળે (પ્રદોષ કાળ) કરવામાં આવતું અત્યંત કલ્યાણકારી વ્રત. આ વ્રત કરવાથી સર્વ પાપો નષ્ટ થાય છે, સંતાન સુખ અને અકાળ મૃત્યુથી રક્ષણ મળે છે.',
      rules: [
        'ત્રયોદશીના દિવસે નિરાહાર અથવા ફળાહાર રહી શિવ પંચાક્ષર મંત્ર "ૐ નમઃ શિવાય" નો જપ કરો.',
        'સૂર્યાસ્તના ૪૫ મિનિટ પહેલાંથી ૪૫ મિનિટ પછીના પ્રદોષ કાળમાં શિવલિંગ પર ગંગાજળ, દૂધ અને બીલીપત્ર અર્પણ કરો.',
        'શિવજીની આરતી કરી સફેદ મીઠાઈ કે ખીરનો ભોગ ધરાવો.'
      ]
    },
    en: {
      title: 'Pradosh Vrat Katha (Lord Shiva Twilight Vow)',
      subtitle: 'Shiva Purana, Kotirudra Samhita: Twilight worship rules and katha',
      vedaSource: 'Shiva Purana, Kotirudra Samhita',
      shlokMeaning: 'We worship the Three-Eyed Lord Shiva, who is fragrant and nourishes all beings. May He liberate us from death and bondage into the nectar of immortality.',
      description: 'The sacred fast observed on the 13th lunar day (Trayodashi) during twilight (Pradosha Kala). It grants fulfillment of desires, progeny, protection from untimely afflictions, and spiritual liberation.',
      rules: [
        'Observe fasting on Trayodashi day and continuously chant the Panchakshara mantra "Om Namah Shivaya".',
        'Perform Abhishekam with milk, honey, Ganga water, and Bilva leaves during the Pradosha window around sunset.',
        'Conclude with the solemn Aarti and distribute white sweets or kheer prasad.'
      ]
    }
  },
  'nirjala-ekadashi': {
    gu: {
      title: 'નિર્જળા એકાદશી (ભીમસેની એકાદશી) વ્રત કથા',
      subtitle: 'પદ્મ પુરાણ, ઉત્તર ખંડ: વર્ષની ૨૪ એકાદશીઓનું સંપૂર્ણ પુણ્ય આપનાર મહાવ્રત',
      vedaSource: 'પદ્મ પુરાણ, ઉત્તર ખંડ',
      shlokMeaning: 'શાંત સ્વરૂપ, શેષશય્યા પર શયન કરનારા, પદ્મનાભ અને દેવોના દેવ એવા ભગવાન વિષ્ણુને હું વંદન કરું છું જે સંસારના ભયને હરે છે.',
      description: 'જે સાધક આખા વર્ષમાં બધી એકાદશીઓ ન કરી શકે, તે માત્ર જેઠ સુદ અગિયારસે પાણી પીધા વગર (નિર્જળા) આ વ્રત કરે તો તેને વર્ષની તમામ ૨૪ એકાદશીઓનું પુણ્ય પ્રાપ્ત થાય છે.',
      rules: [
        'એકાદશીના સૂર્યોદયથી બારસના સૂર્યોદય સુધી જળ અને અન્નનો ત્યાગ કરો.',
        'ભગવાન વિષ્ણુની તુલસીદળ અને પંચામૃતથી પૂજા કરો અને રાત્રે જાગરણ કરી ભજન-કીર્તન કરો.',
        'બારસના દિવસે બ્રાહ્મણ કે જરૂરિયાતમંદને જળથી ભરેલો કળશ, પંખો અને અનાજ દાન કરી પારણાં કરો.'
      ]
    },
    en: {
      title: 'Nirjala Ekadashi (Bhimseni Ekadashi) Vrat Katha',
      subtitle: 'Padma Purana, Uttara Khanda: The supreme fast yielding the merit of all 24 Ekadashis',
      vedaSource: 'Padma Purana, Uttara Khanda',
      shlokMeaning: 'Salutations to Lord Vishnu, of peaceful countenance, resting on the serpent Shesha, with a lotus in His navel, the Lord of gods, dispeller of worldly fears.',
      description: 'Observed on Jyeshtha Shukla Ekadashi without consuming even a drop of water. Sage Vyasa instructed Bhima that observing this single rigorous fast bestows the entire merit of all 24 annual Ekadashis.',
      rules: [
        'Refrain completely from water and food from sunrise of Ekadashi to sunrise of Dwadashi.',
        'Worship Lord Vishnu with fragrant Tulsi leaves, incense, and spend the night in spiritual vigil.',
        'On Dwadashi morning, donate water pitchers, fans, and grains to Brahmins and seekers before breaking the fast.'
      ]
    }
  },
  'karwa-chauth-sampurna': {
    gu: {
      title: 'કરવા ચોથ વ્રત કથા અને સંપૂર્ણ પૂજન વિધિ',
      subtitle: 'સ્કંદ પુરાણ અને ભવિષ્યોત્તર પુરાણ: અખંડ સૌભાગ્ય અને દીર્ઘાયુષ્ય આપનાર વ્રત',
      vedaSource: 'સ્કંદ પુરાણ, ભવિષ્યોત્તર પુરાણ',
      shlokMeaning: 'સમસ્ત મંગળોનું મંગળ કરનારી, કલ્યાણમયી, સર્વ અર્થ સિદ્ધ કરનારી, શરણાગતોની રક્ષક ત્રિનેત્રી નારાયણી દેવીને નમસ્કાર.',
      description: 'આસો વદ ચોથના દિવસે સુહાગન સ્ત્રીઓ પોતાના પતિના દીર્ઘાયુષ્ય, આરોગ્ય અને અખંડ સૌભાગ્ય માટે નિર્જળા વ્રત રાખે છે અને રાત્રે ચંદ્ર દર્શન કરી અર્ઘ્ય આપે છે.',
      rules: [
        'સવારે સૂર્યોદય પહેલાં સરગી આરોગી વ્રતનો સંકલ્પ લો અને આખો દિવસ નિર્જળા રહો.',
        'બપોરે કે સંધ્યાકાળે ગૌરી-ગણેશ અને करवा માતાની પૂજા કરી વ્રત કથા સાંભળો.',
        'રાત્રે ચંદ્ર ઉદય થાય ત્યારે ચાળણીથી ચંદ્ર અને પતિદેવનું દર્શન કરી અર્ઘ્ય આપો અને પતિના હાથે જળ પીને વ્રત ખોલો.'
      ]
    },
    en: {
      title: 'Karwa Chauth Vrat Katha & Complete Puja Vidhi',
      subtitle: 'Skanda Purana & Bhavishyottara Purana: Sacred vow for marital longevity and bliss',
      vedaSource: 'Skanda Purana & Bhavishyottara Purana',
      shlokMeaning: 'Auspicious of all auspiciousness, benevolent, fulfiller of all aims, refuge of the helpless, three-eyed Goddess Narayani, salutations unto You.',
      description: 'Celebrated on the fourth day of the waning moon in Kartik/Ashwin. Married women observe a strict waterless fast from dawn until moonrise praying for the health, longevity, and prosperity of their spouses.',
      rules: [
        'Consume Sargi before sunrise and take the vow of complete waterless fasting throughout the day.',
        'Assemble in the evening to worship Goddess Gauri and Karwa Mata, listening to the traditional story.',
        'At moonrise, offer Arghya to the moon through a sieve, view the spouse, and break the fast by sipping water from their hands.'
      ]
    }
  },
  'ganesh-aarti': {
    gu: {
      title: 'શ્રી ગણેશજીની આરતી (જય ગણેશ જય ગણેશ દેવા)',
      subtitle: 'પાર્વતી નંદન વિઘ્નહર્તા ગણેશ આરતી (સંપૂર્ણ સ્તુતિ)',
      vedaSource: 'પારંપરિક સનાતન આરતી સંગ્રહ',
      shlokMeaning: 'જય ગણેશ, જય ગણેશ, જય ગણેશ દેવા! માતા જેમની પાર્વતી અને પિતા મહાદેવ છે, તેવા વિઘ્નહર્તા ગણેશજીની અમે આરતી ઉતારીએ છીએ.',
      description: 'કોઈપણ પૂજા, વિધિ કે શુભ કાર્યના આરંભ અને સમાપને ગવાતી સર્વશ્રેષ્ઠ ગણેશ આરતી. આ આરતી ગાવાથી સર્વ વિઘ્નો નાશ પામે છે અને રિદ્ધિ-સિદ્ધિ પ્રાપ્ત થાય છે.',
      rules: ['ઘીનો દીવો પ્રગટાવી આરતી કરો અને મોદક કે લાડુનો પ્રસાદ ધરાવો.']
    },
    en: {
      title: 'Shri Ganesh Aarti (Jai Ganesh Jai Ganesh Deva)',
      subtitle: 'Parvati Nandan Vighnaharta Ganesh Aarti (Complete Chanting)',
      vedaSource: 'Traditional Sanatan Aarti Collection',
      shlokMeaning: 'Victory to Lord Ganesha, whose mother is Goddess Parvati and father is Lord Shiva. We perform Aarti unto the remover of all obstacles.',
      description: 'The beloved universal Aarti sung at the beginning and conclusion of all auspicious Vedic rituals, invoking joy, intellect, and worldly success.',
      rules: ['Light a camphor or pure ghee lamp, ring the bell, and offer modak sweets.']
    }
  },
  'shiv-aarti': {
    gu: {
      title: 'ભગવાન શિવજીની આરતી (ૐ જય શિવ ઓમકારા)',
      subtitle: 'શિવપુરાણોક્ત સંપૂર્ણ કૈલાશપતિ શિવ આરતી',
      vedaSource: 'શિવ પુરાણ સંગ્રહ',
      shlokMeaning: 'ૐ જય શિવ ઓમકારા, ભોલે હર શિવ ઓમકારા! બ્રહ્મા, વિષ્ણુ અને સદાશિવ અર્ધાંગી ધારા.',
      description: 'ભોળાનાથ મહાદેવની દિવ્ય આરતી. સોમવારે અને પ્રદોષના દિવસે આ આરતી ગાવાથી મનોકામનાઓ પૂર્ણ થાય છે અને માનસિક શાંતિ મળે છે.',
      rules: ['બિલ્વપત્ર, ગંગાજળ અર્પણ કરી કપૂરથી આરતી કરો.']
    },
    en: {
      title: 'Lord Shiva Aarti (Om Jai Shiv Omkara)',
      subtitle: 'Complete Kailashpati Shiva Aarti from Shiva Purana traditions',
      vedaSource: 'Shiva Purana Collection',
      shlokMeaning: 'Glory to Lord Shiva, the embodiment of Omkara! Brahma, Vishnu, and Sadashiva unite in His cosmic harmony.',
      description: 'The sublime evening hymn to Lord Shiva sung in temples worldwide, bringing profound peace, fearless confidence, and spiritual liberation.',
      rules: ['Offer Bilva leaves and holy water, performing Aarti with pure burning camphor.']
    }
  },
  'laxmi-aarti': {
    gu: {
      title: 'માતા લક્ષ્મીજીની આરતી (ૐ જય લક્ષ્મી માતા)',
      subtitle: 'ધન, વૈભવ અને ઐશ્વર્ય પ્રદાત્રી શ્રી મહાલક્ષ્મી આરતી',
      vedaSource: 'શ્રી સૂક્ત અને પદ્મ પુરાણ',
      shlokMeaning: 'ૐ જય લક્ષ્મી માતા, મૈયા જય લક્ષ્મી માતા! તુમકો નિશદિન સેવત, હરિ વિષ્ણુ વિધાતા.',
      description: 'દીપાવલી, શુક્રવાર અને ધનતેરસના દિવસે ગવાતી માતા લક્ષ્મીની પરમ પવિત્ર આરતી. આનાથી ઘરમાં કદી દરિદ્રતા આવતી નથી અને સુખ-સમૃદ્ધિનો વાસ રહે છે.',
      rules: ['કમળનું પુષ્પ, અક્ષત, ખીર અર્પણ કરી ઘીના દીવાથી આરતી કરો.']
    },
    en: {
      title: 'Mata Lakshmi Aarti (Om Jai Lakshmi Mata)',
      subtitle: 'Goddess of Wealth & Fortune Mahalakshmi Aarti',
      vedaSource: 'Shri Suktam & Padma Purana',
      shlokMeaning: 'Glory to Mother Lakshmi, served continuously by Lord Vishnu, bestower of spiritual and material abundance.',
      description: 'The radiant hymn dedicated to Goddess Lakshmi sung on Diwali, Fridays, and Dhanteras to invite auspiciousness, harmony, and righteous prosperity.',
      rules: ['Offer fresh lotus or red flowers, milk sweets, and perform Aarti with a pure ghee wick.']
    }
  },
  'hanuman-aarti': {
    gu: {
      title: 'શ્રી હનુમાનજીની આરતી (આરતી કીજૈ હનુમાન લલા કી)',
      subtitle: 'દુષ્ટ દલન રઘુનાથ કલા કી — સંપૂર્ણ હનુમાન આરતી',
      vedaSource: 'રામચરિતમાનસ સંગ્રહ',
      shlokMeaning: 'આરતી કરો પવનપુત્ર હનુમાન લાલાની, જે દુષ્ટોનું દલન કરનારા અને શ્રી રામના પરમ ભક્ત છે.',
      description: 'સંકટમોચન હનુમાનજીની આ આરતી મંગળવાર અને શનિવારે ગાવાથી સર્વ ભય, રોગ, શનિદોષ અને નકારાત્મક શક્તિઓ નાશ પામે છે.',
      rules: ['સિંદૂર, ચમેલીનું તેલ, લાલ પુષ્પ અને બૂંદી/ગોળ-ચણાનો ભોગ ધરાવો.']
    },
    en: {
      title: 'Shri Hanuman Aarti (Aarti Kije Hanuman Lala Ki)',
      subtitle: 'Dispeller of Evils, Devotee of Lord Rama — Complete Hanuman Aarti',
      vedaSource: 'Ramcharitmanas Collection',
      shlokMeaning: 'Perform Aarti unto the beloved Son of the Wind, Lord Hanuman, who destroys distress, overcomes negative forces, and gladdens Lord Rama.',
      description: 'The powerful protective hymn to Lord Hanuman sung on Tuesdays and Saturdays to dispel anxieties, ward off planetary afflictions, and cultivate immense inner strength.',
      rules: ['Offer vermilion, jasmine oil, red flowers, and sweets made from jaggery and gram.']
    }
  }
};

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
