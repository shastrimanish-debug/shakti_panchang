import * as Astronomy from 'astronomy-engine';
import { FestivalItem } from '../types';
import { getSunMoonSidereal, RASHIS } from './astronomy';

// Cache generated festivals per year for zero-latency retrieval
const YEAR_FESTIVALS_CACHE = new Map<number, FestivalItem[]>();

/**
 * Calculates all authentic Vedic Hindu festivals, fasts, and sacred tithis
 * for ANY Gregorian year (1900 to 2150) using high-precision astronomical engine.
 */
export function getFestivalsForYear(year: number): FestivalItem[] {
  if (YEAR_FESTIVALS_CACHE.has(year)) {
    return YEAR_FESTIVALS_CACHE.get(year)!;
  }

  const festivals: FestivalItem[] = [];

  // Helper to safely construct local Date at noon to prevent TZ edge-cases
  const makeDate = (y: number, m: number, d: number) => new Date(y, m, d, 12, 0, 0);

  // -------------------------------------------------------------
  // 1. SOLAR FESTIVALS (संक्रांति आधारित पर्व)
  // -------------------------------------------------------------
  // A. Makar Sankranti (Ingress of Sidereal Sun into 270 deg / Makar)
  let msDay = 14;
  for (let d = 13; d <= 16; d++) {
    const testDate = new Date(Date.UTC(year, 0, d, 6, 0));
    const { sunSidereal } = getSunMoonSidereal(testDate);
    if (sunSidereal >= 270 && sunSidereal < 272) {
      msDay = d;
      break;
    }
  }
  const makarSankrantiDate = makeDate(year, 0, msDay);
  const lohriDate = makeDate(year, 0, msDay - 1);

  festivals.push({
    id: `fest-${year}-lohri`,
    date: lohriDate,
    name: 'Lohri',
    hindiName: 'लोहड़ी',
    type: 'पर्व',
    description: 'पंजाब व उत्तर भारत का प्रमुख अग्नि पूजन व नवान्न उत्सव, मकर संक्रांति से पूर्व संध्या पर उल्लास।',
  });

  festivals.push({
    id: `fest-${year}-makar-sankranti`,
    date: makarSankrantiDate,
    name: 'Makar Sankranti',
    hindiName: 'मकर संक्रांति',
    type: 'पर्व',
    description: 'सूर्य देव का धनु से मकर राशि में प्रवेश, उत्तरायण पुण्य काल, पवित्र गंगा स्नान, तिल-गुड़ एवं खिचड़ी दान का महापर्व।',
  });

  // B. Baisakhi / Mesha Sankranti (Around April 13-14)
  let baisakhiDay = 13;
  for (let d = 13; d <= 15; d++) {
    const testDate = new Date(Date.UTC(year, 3, d, 6, 0));
    const { sunSidereal } = getSunMoonSidereal(testDate);
    if (sunSidereal >= 0 && sunSidereal < 2) {
      baisakhiDay = d;
      break;
    }
  }
  festivals.push({
    id: `fest-${year}-baisakhi`,
    date: makeDate(year, 3, baisakhiDay),
    name: 'Baisakhi / Mesha Sankranti',
    hindiName: 'बैसाखी (मेष संक्रांति)',
    type: 'पर्व',
    description: 'सौर नववर्ष, सूर्य का मेष राशि में प्रवेश, खालसा पंथ स्थापना दिवस एवं रबी फसल कटाई का उत्सव।',
  });

  // -------------------------------------------------------------
  // 2. ASTRONOMICAL LUNAR CYCLES (अमावस्या एवं पूर्णिमा संकलन)
  // -------------------------------------------------------------
  // Scan moon phases from Dec 15 of previous year to Jan 15 of next year
  const searchStart = new Date(Date.UTC(year - 1, 11, 10));
  const searchEnd = new Date(Date.UTC(year + 1, 0, 20));

  // Collect All Amavasyas with Sun's Sidereal Zodiac Sign
  const amavasyas: { date: Date; sunRashi: string; rashiIndex: number }[] = [];
  let curAm = searchStart;
  while (curAm < searchEnd) {
    const am = Astronomy.SearchMoonPhase(0, curAm, 35);
    if (!am) break;
    const amDate = new Date(am.date.getTime() + 5.5 * 3600000); // Convert to IST
    const { sunSidereal } = getSunMoonSidereal(am.date);
    const rashiIdx = Math.floor(sunSidereal / 30) % 12;
    amavasyas.push({
      date: makeDate(amDate.getFullYear(), amDate.getMonth(), amDate.getDate()),
      sunRashi: RASHIS[rashiIdx],
      rashiIndex: rashiIdx,
    });
    curAm = new Date(am.date.getTime() + 20 * 86400000);
  }

  // Collect All Purnimas
  const purnimas: { date: Date; moonRashi: string; rashiIndex: number }[] = [];
  let curPu = searchStart;
  while (curPu < searchEnd) {
    const pu = Astronomy.SearchMoonPhase(180, curPu, 35);
    if (!pu) break;
    const puDate = new Date(pu.date.getTime() + 5.5 * 3600000);
    const { moonSidereal } = getSunMoonSidereal(pu.date);
    const rashiIdx = Math.floor(moonSidereal / 30) % 12;
    purnimas.push({
      date: makeDate(puDate.getFullYear(), puDate.getMonth(), puDate.getDate()),
      moonRashi: RASHIS[rashiIdx],
      rashiIndex: rashiIdx,
    });
    curPu = new Date(pu.date.getTime() + 20 * 86400000);
  }

  // Helper to add days to a Date
  const addDays = (base: Date, days: number) => {
    const d = new Date(base);
    d.setDate(d.getDate() + days);
    return d;
  };

  // -------------------------------------------------------------
  // 3. MAP LUNISOLAR MONTHS FOR THE YEAR
  // -------------------------------------------------------------
  // Amavasyas by Sun Rashi in current year:
  // Kumbha (कुंभ) -> Phalguna Amavasya
  // Meena (मीन) -> Chaitra Amavasya
  // Mesha (मेष) -> Vaishakha Amavasya
  // Vrishabha (वृषभ) -> Jyeshtha Amavasya
  // Mithuna (मिथुन) -> Ashadha Amavasya
  // Karka (कर्क) -> Shravana Amavasya
  // Simha (सिंह) -> Bhadrapada Amavasya
  // Kanya (कन्या) -> Ashwin Amavasya (Mahalaya)
  // Tula (तुला) -> Kartika Amavasya (Diwali)
  // Vrischika (वृश्चिक) -> Margashirsha Amavasya
  // Dhanu (धनु) -> Pausha Amavasya
  // Makar (मकर) -> Magha Amavasya (Mauni Amavasya)

  const findAmavasya = (rashi: string) => {
    return amavasyas.find((a) => a.sunRashi === rashi && a.date.getFullYear() === year)?.date ||
      amavasyas.find((a) => a.sunRashi === rashi)?.date;
  };

  const findPurnimaInMonth = (approxMonth: number) => {
    return purnimas.find((p) => p.date.getFullYear() === year && p.date.getMonth() === approxMonth)?.date;
  };

  // A. MAGHA & PHALGUNA (Jan / Feb / March)
  const maghaAm = findAmavasya('मकर');
  if (maghaAm && maghaAm.getFullYear() === year) {
    festivals.push({
      id: `fest-${year}-mauni-amavasya`,
      date: maghaAm,
      name: 'Mauni Amavasya',
      hindiName: 'मौनी अमावस्या',
      type: 'अमावस्या',
      description: 'माघ कृष्ण अमावस्या, मौन व्रत, त्रिवेणी संगम व पवित्र नदियों में स्नान का महापुण्यकारी दिवस।',
    });

    // Vasant Panchami is Shukla Panchami (approx 5 days after Magha Amavasya)
    const vasantDate = addDays(maghaAm, 5);
    festivals.push({
      id: `fest-${year}-vasant-panchami`,
      date: vasantDate,
      name: 'Vasant Panchami',
      hindiName: 'वसंत पंचमी (सरस्वती पूजा)',
      type: 'पर्व',
      description: 'माघ शुक्ल पंचमी, ज्ञान, विद्या, कला व वाणी की अधिष्ठात्री भगवती मां सरस्वती का प्राकट्योत्सव एवं ऋतुराज वसंत का आगमन।',
    });
  }

  // Magha Purnima
  const maghaPu = findPurnimaInMonth(1) || findPurnimaInMonth(0);
  if (maghaPu && maghaPu.getFullYear() === year) {
    festivals.push({
      id: `fest-${year}-magha-purnima`,
      date: maghaPu,
      name: 'Magha Purnima',
      hindiName: 'माघ पूर्णिमा (माघी पूर्णिमा)',
      type: 'पूर्णिमा',
      description: 'माघ मास का अंतिम महापुण्य स्नान, प्रयागराज कल्पवास का समापन एवं सत्यनारायण पूजन।',
    });
  }

  // Phalguna Amavasya & Maha Shivratri
  const phalgunaAm = findAmavasya('कुंभ');
  if (phalgunaAm && phalgunaAm.getFullYear() === year) {
    // Maha Shivratri is Krishna Chaturdashi (1 day before Phalguna Amavasya)
    const shivratriDate = addDays(phalgunaAm, -1);
    festivals.push({
      id: `fest-${year}-maha-shivratri`,
      date: shivratriDate,
      name: 'Maha Shivratri',
      hindiName: 'महाशिवरात्रि',
      type: 'व्रत',
      description: 'फाल्गुन कृष्ण चतुर्दशी, देवाधिदेव महादेव व माता पार्वती का महाकल्याणकारी विवाह उत्सव एवं चार प्रहर रुद्राभिषेक।',
    });

    festivals.push({
      id: `fest-${year}-phalguna-amavasya`,
      date: phalgunaAm,
      name: 'Phalguna Amavasya',
      hindiName: 'फाल्गुन अमावस्या',
      type: 'अमावस्या',
      description: 'फाल्गुन मास की दर्श अमावस्या, पितरों का तर्पण व शांति कर्म।',
    });
  }

  // Phalguna Purnima (Holi / Holika Dahan)
  const holiPurnima = findPurnimaInMonth(2) || purnimas.find((p) => p.date.getFullYear() === year && p.date.getMonth() === 1 && p.date.getDate() > 20)?.date;
  if (holiPurnima && holiPurnima.getFullYear() === year) {
    festivals.push({
      id: `fest-${year}-holika-dahan`,
      date: holiPurnima,
      name: 'Holika Dahan',
      hindiName: 'होलिका दहन',
      type: 'पर्व',
      description: 'फाल्गुन पूर्णिमा की संध्या, भक्त प्रह्लाद की रक्षा, अधर्म व काम-क्रोध की आहुति एवं अग्नि पूजन।',
    });

    festivals.push({
      id: `fest-${year}-holi`,
      date: addDays(holiPurnima, 1),
      name: 'Holi / Dhulandi',
      hindiName: 'होली (धुलेंडी - रंगोत्सव)',
      type: 'पर्व',
      description: 'रंगों का महापर्व, वसंतोत्सव, आपसी सद्भाव, प्रेम व उल्लास का पावन उत्सव।',
    });
  }

  // B. CHAITRA (March / April)
  // Chaitra Navratri / Hindu New Year begins 1 day after Phalguna Amavasya (or Meena Amavasya cycle)
  const chaitraStartAm = phalgunaAm || findAmavasya('कुंभ');
  if (chaitraStartAm && chaitraStartAm.getFullYear() === year) {
    const navratriStart = addDays(chaitraStartAm, 1);
    const samvatYear = year + 57;

    festivals.push({
      id: `fest-${year}-chaitra-navratri-start`,
      date: navratriStart,
      name: 'Chaitra Navratri / Hindu New Year',
      hindiName: `चैत्र नवरात्रि / नव संवत्सरारंभ (वि॰सं॰ ${samvatYear})`,
      type: 'पर्व',
      description: `विक्रम संवत् ${samvatYear} का शुभारंभ, गुड़ी पड़वा, उगादी, घटस्थापना एवं शक्ति स्वरूपा मां दुर्गा की नवदिवसीय उपासना।`,
    });

    // Ram Navami is 8 days after Navratri start (Navami tithi)
    const ramNavamiDate = addDays(navratriStart, 8);
    festivals.push({
      id: `fest-${year}-ram-navami`,
      date: ramNavamiDate,
      name: 'Ram Navami',
      hindiName: 'श्री राम नवमी',
      type: 'पर्व',
      description: 'चैत्र शुक्ल नवमी, मर्यादा पुरुषोत्तम भगवान श्री रामचंद्र जी का पावन अवतरण दिवस।',
    });
  }

  // Chaitra Purnima (Hanuman Jayanti)
  const chaitraPu = findPurnimaInMonth(3) || findPurnimaInMonth(2);
  if (chaitraPu && chaitraPu.getFullYear() === year) {
    festivals.push({
      id: `fest-${year}-hanuman-jayanti`,
      date: chaitraPu,
      name: 'Hanuman Jayanti',
      hindiName: 'श्री हनुमान जयंती',
      type: 'पर्व',
      description: 'चैत्र पूर्णिमा पर पवनपुत्र, कलयुग के जाग्रत देव संकटमोचन श्री हनुमान जी का जन्मोत्सव।',
    });
  }

  // C. VAISHAKHA & JYESHTHA (April / May / June)
  const chaitraAm = findAmavasya('मीन');
  if (chaitraAm && chaitraAm.getFullYear() === year) {
    // Akshaya Tritiya: Vaishakha Shukla Tritiya (3 days after Chaitra Amavasya)
    const akshayaDate = addDays(chaitraAm, 3);
    festivals.push({
      id: `fest-${year}-akshaya-tritiya`,
      date: akshayaDate,
      name: 'Akshaya Tritiya',
      hindiName: 'अक्षय तृतीया (आखा तीज)',
      type: 'पर्व',
      description: 'वैशाख शुक्ल तृतीया, अबूझ सिद्ध मुहूर्त, परशुराम जयंती, स्वर्ण क्रय व अक्षय पुण्य अर्जन।',
    });
  }

  // Vaishakha Purnima (Buddha Purnima)
  const vaishakhaPu = findPurnimaInMonth(4) || findPurnimaInMonth(3);
  if (vaishakhaPu && vaishakhaPu.getFullYear() === year) {
    festivals.push({
      id: `fest-${year}-buddha-purnima`,
      date: vaishakhaPu,
      name: 'Buddha Purnima / Vaishakha Purnima',
      hindiName: 'बुद्ध पूर्णिमा (वैशाख पूर्णिमा)',
      type: 'पर्व',
      description: 'भगवान बुद्ध का जन्म, ज्ञान प्राप्ति व महापरिनिर्वाण दिवस, सत्यनारायण व्रत व जल दान।',
    });
  }

  // Ganga Dussehra & Nirjala Ekadashi (Jyeshtha)
  const vaishakhaAm = findAmavasya('मेष');
  if (vaishakhaAm && vaishakhaAm.getFullYear() === year) {
    festivals.push({
      id: `fest-${year}-ganga-dussehra`,
      date: addDays(vaishakhaAm, 10),
      name: 'Ganga Dussehra',
      hindiName: 'गंगा दशहरा',
      type: 'पर्व',
      description: 'ज्येष्ठ शुक्ल दशमी, मां पतितपाविनी भागीरथी गंगा का स्वर्ग से भूतल पर अवतरण दिवस।',
    });

    festivals.push({
      id: `fest-${year}-nirjala-ekadashi`,
      date: addDays(vaishakhaAm, 11),
      name: 'Nirjala Ekadashi',
      hindiName: 'निर्जला एकादशी (भीमसेनी एकादशी)',
      type: 'एकादशी',
      description: 'ज्येष्ठ शुक्ल एकादशी, बिना जल ग्रहण किए समस्त 24 एकादशियों का पुण्य फल प्रदान करने वाला महाव्रत।',
    });
  }

  // D. ASHADHA & SHRAVANA (June / July / August)
  const jyeshthaAm = findAmavasya('वृषभ');
  if (jyeshthaAm && jyeshthaAm.getFullYear() === year) {
    festivals.push({
      id: `fest-${year}-jagannath-rath-yatra`,
      date: addDays(jyeshthaAm, 2),
      name: 'Jagannath Rath Yatra',
      hindiName: 'जगन्नाथ रथयात्रा',
      type: 'पर्व',
      description: 'आषाढ़ शुक्ल द्वितीया, पुरी में महाप्रभु श्री जगन्नाथ, बलभद्र व सुभद्रा की भव्य रथयात्रा।',
    });

    festivals.push({
      id: `fest-${year}-devshayani-ekadashi`,
      date: addDays(jyeshthaAm, 11),
      name: 'Devshayani Ekadashi',
      hindiName: 'देवशयनी एकादशी (आषाढ़ी एकादशी)',
      type: 'एकादशी',
      description: 'आषाढ़ शुक्ल एकादशी, भगवान श्री विष्णु का योगनिद्रा में शयन, चातुर्मास महाव्रत का शुभारंभ।',
    });
  }

  // Ashadha Purnima (Guru Purnima)
  const ashadhaPu = findPurnimaInMonth(6) || findPurnimaInMonth(5);
  if (ashadhaPu && ashadhaPu.getFullYear() === year) {
    festivals.push({
      id: `fest-${year}-guru-purnima`,
      date: ashadhaPu,
      name: 'Guru Purnima',
      hindiName: 'गुरु पूर्णिमा (व्यास पूर्णिमा)',
      type: 'पर्व',
      description: 'आषाढ़ पूर्णिमा, महर्षि वेदव्यास जी की जयंती, गुरुजनों के प्रति श्रद्धा व पादपूजन का पावन पर्व।',
    });
  }

  // Hariyali Teej & Nag Panchami (Shravana)
  const ashadhaAm = findAmavasya('मिथुन');
  if (ashadhaAm && ashadhaAm.getFullYear() === year) {
    festivals.push({
      id: `fest-${year}-hariyali-teej`,
      date: addDays(ashadhaAm, 3),
      name: 'Hariyali Teej',
      hindiName: 'हरियाली तीज',
      type: 'व्रत',
      description: 'श्रावण शुक्ल तृतीया, सुहागिनों द्वारा भगवान शिव व माता पार्वती का पूजन, अखंड सौभाग्य का व्रत।',
    });

    festivals.push({
      id: `fest-${year}-nag-panchami`,
      date: addDays(ashadhaAm, 5),
      name: 'Nag Panchami',
      hindiName: 'नाग पंचमी',
      type: 'पर्व',
      description: 'श्रावण शुक्ल पंचमी, नाग देवताओं की पूजा, कालसर्प दोष निवारण एवं दुग्ध अर्पण।',
    });
  }

  // Shravana Purnima (Raksha Bandhan)
  const shravanaPu = findPurnimaInMonth(7) || findPurnimaInMonth(8);
  if (shravanaPu && shravanaPu.getFullYear() === year) {
    festivals.push({
      id: `fest-${year}-raksha-bandhan`,
      date: shravanaPu,
      name: 'Raksha Bandhan',
      hindiName: 'रक्षाबंधन',
      type: 'पर्व',
      description: 'श्रावण पूर्णिमा, भाई-बहन के अटूट स्नेह का प्रतीक, रक्षा सूत्र व कजरी पूर्णिमा।',
    });

    // Krishna Janmashtami is approx 8 days after Shravana Purnima (Bhadrapada Krishna Ashtami)
    const janmashtamiDate = addDays(shravanaPu, 8);
    festivals.push({
      id: `fest-${year}-krishna-janmashtami`,
      date: janmashtamiDate,
      name: 'Krishna Janmashtami',
      hindiName: 'श्री कृष्ण जन्माष्टमी',
      type: 'पर्व',
      description: 'भाद्रपद कृष्ण अष्टमी, रोहिणी नक्षत्र, भगवान योगेश्वर श्री कृष्ण का पावन प्राकट्योत्सव।',
    });
  }

  // E. BHADRAPADA & ASHWIN (August / September / October)
  const shravanaAm = findAmavasya('कर्क') || findAmavasya('सिंह');
  if (shravanaAm && shravanaAm.getFullYear() === year) {
    festivals.push({
      id: `fest-${year}-hartalika-teej`,
      date: addDays(shravanaAm, 3),
      name: 'Hartalika Teej',
      hindiName: 'हरतालिका तीज',
      type: 'व्रत',
      description: 'भाद्रपद शुक्ल तृतीया, अखंड सौभाग्य व सुयोग्य वर प्राप्ति हेतु माता पार्वती व शिवजी का निर्जल व्रत।',
    });

    festivals.push({
      id: `fest-${year}-ganesh-chaturthi`,
      date: addDays(shravanaAm, 4),
      name: 'Ganesh Chaturthi',
      hindiName: 'गणेश चतुर्थी (विनायक चतुर्थी)',
      type: 'पर्व',
      description: 'भाद्रपद शुक्ल चतुर्थी, प्रथम पूज्य विघ्नहर्ता भगवान श्री गणेश का जन्मोत्सव एवं दसोत्सव स्थापना।',
    });

    festivals.push({
      id: `fest-${year}-anant-chaturdashi`,
      date: addDays(shravanaAm, 14),
      name: 'Anant Chaturdashi',
      hindiName: 'अनंत चतुर्दशी (गणेश विसर्जन)',
      type: 'पर्व',
      description: 'भाद्रपद शुक्ल चतुर्दशी, भगवान विष्णु के अनंत स्वरूप का पूजन, 14 गांठों का अनंत सूत्र एवं गणेश विसर्जन।',
    });
  }

  // Pitru Paksha & Shardiya Navratri
  const bhadrapadaPu = findPurnimaInMonth(8) || findPurnimaInMonth(7);
  if (bhadrapadaPu && bhadrapadaPu.getFullYear() === year) {
    festivals.push({
      id: `fest-${year}-pitru-paksha-start`,
      date: bhadrapadaPu,
      name: 'Pitru Paksha Start',
      hindiName: 'पितृ पक्ष (श्राद्ध महालय) आरंभ',
      type: 'पर्व',
      description: 'भाद्रपद पूर्णिमा से आश्विन अमावस्या तक, पूर्वजों के प्रति कृतज्ञता, तर्पण व पिंडदान का 16 दिवसीय काल।',
    });
  }

  // Sarva Pitru Amavasya (Mahalaya - Sun in Kanya)
  const ashwinAm = findAmavasya('कन्या');
  if (ashwinAm && ashwinAm.getFullYear() === year) {
    festivals.push({
      id: `fest-${year}-sarva-pitru-amavasya`,
      date: ashwinAm,
      name: 'Sarva Pitru Amavasya',
      hindiName: 'सर्वपितृ अमावस्या (महालया विसर्जन)',
      type: 'अमावस्या',
      description: 'आश्विन कृष्ण अमावस्या, समस्त ज्ञात-अज्ञात पितरों के श्राद्ध, तर्पण व विदाई का परम पावन दिन।',
    });

    // Shardiya Navratri begins day after Mahalaya
    const shardiyaStart = addDays(ashwinAm, 1);
    festivals.push({
      id: `fest-${year}-shardiya-navratri-start`,
      date: shardiyaStart,
      name: 'Shardiya Navratri Ghatasthapana',
      hindiName: 'शारदीय नवरात्रि घटस्थापना',
      type: 'पर्व',
      description: 'आश्विन शुक्ल प्रतिपदा, कलश स्थापना, देवी भगवती के नौ रूपों की दिव्य आराधना का शुभारंभ।',
    });

    festivals.push({
      id: `fest-${year}-durga-ashtami`,
      date: addDays(shardiyaStart, 7),
      name: 'Durga Ashtami (Maha Ashtami)',
      hindiName: 'दुर्गा महाष्टमी (महागौरी पूजन)',
      type: 'पर्व',
      description: 'आश्विन शुक्ल अष्टमी, मां महागौरी पूजन, कन्या पूजन व संधि पूजा।',
    });

    festivals.push({
      id: `fest-${year}-maha-navami`,
      date: addDays(shardiyaStart, 8),
      name: 'Maha Navami',
      hindiName: 'महानवमी (सिद्धिदात्री पूजन)',
      type: 'पर्व',
      description: 'आश्विन शुक्ल नवमी, मां सिद्धिदात्री पूजन, हवन, पूर्णाहुति व कन्या भोजन।',
    });

    festivals.push({
      id: `fest-${year}-dussehra`,
      date: addDays(shardiyaStart, 9),
      name: 'Dussehra / Vijayadashami',
      hindiName: 'दशहरा (विजयादशमी)',
      type: 'पर्व',
      description: 'अधर्म पर धर्म व रावण पर भगवान श्री राम की विजय, अपराजिता पूजन एवं शस्त्र पूजन का महापर्व।',
    });
  }

  // Sharad Purnima (Ashwin Purnima)
  const ashwinPu = findPurnimaInMonth(9) || findPurnimaInMonth(10);
  if (ashwinPu && ashwinPu.getFullYear() === year) {
    festivals.push({
      id: `fest-${year}-sharad-purnima`,
      date: ashwinPu,
      name: 'Sharad Purnima',
      hindiName: 'शरद पूर्णिमा (कोजागरी / रास पूर्णिमा)',
      type: 'पूर्णिमा',
      description: 'आश्विन पूर्णिमा, 16 कलाओं से युक्त अमृतमयी चंद्र किरणें, खीर का भोग एवं महालक्ष्मी का पृथ्वी भ्रमण।',
    });

    // Karwa Chauth is 4 days after Sharad Purnima (Kartik Krishna Chaturthi)
    festivals.push({
      id: `fest-${year}-karwa-chauth`,
      date: addDays(ashwinPu, 4),
      name: 'Karwa Chauth',
      hindiName: 'करवा चौथ (कर्क चतुर्थी)',
      type: 'व्रत',
      description: 'कार्तिक कृष्ण चतुर्थी, सुहागिनों द्वारा पति की दीर्घायु हेतु चंद्र दर्शन पर्यंत निर्जला व्रत।',
    });

    // Ahoi Ashtami (8 days after Sharad Purnima)
    festivals.push({
      id: `fest-${year}-ahoi-ashtami`,
      date: addDays(ashwinPu, 8),
      name: 'Ahoi Ashtami',
      hindiName: 'अहोई अष्टमी',
      type: 'व्रत',
      description: 'कार्तिक कृष्ण अष्टमी, संतान की दीर्घायु व कल्याण हेतु माताओं द्वारा तारों को अर्घ्य देकर व्रत।',
    });
  }

  // F. KARTIKA & DEEPOTSAV (October / November)
  // Diwali: Amavasya with Sun in Tula (तुला)
  const kartikaAm = findAmavasya('तुला');
  if (kartikaAm && kartikaAm.getFullYear() === year) {
    // Dhanteras: 2 days before Diwali (Trayodashi)
    festivals.push({
      id: `fest-${year}-dhanteras`,
      date: addDays(kartikaAm, -2),
      name: 'Dhanteras',
      hindiName: 'धनतेरस (धन्वंतरि जयंती / कुबेर पूजन)',
      type: 'पर्व',
      description: 'कार्तिक कृष्ण त्रयोदशी, आरोग्य के देव भगवान धन्वंतरि प्राकट्य दिवस, यम दीपदान व नवीन धातु क्रय।',
    });

    // Narak Chaturdashi / Choti Diwali
    festivals.push({
      id: `fest-${year}-narak-chaturdashi`,
      date: addDays(kartikaAm, -1),
      name: 'Narak Chaturdashi / Roop Chaudas',
      hindiName: 'नरक चतुर्दशी (छोटी दीवाली / रूप चौदस)',
      type: 'पर्व',
      description: 'कार्तिक कृष्ण चतुर्दशी, भगवान श्री कृष्ण द्वारा नरकासुर वध स्मृति, यम तर्पण एवं उबटन स्नान।',
    });

    // Diwali (Lakshmi Puja)
    festivals.push({
      id: `fest-${year}-diwali`,
      date: kartikaAm,
      name: 'Diwali',
      hindiName: 'दीपावली (महालक्ष्मी पूजन)',
      type: 'पर्व',
      description: 'कार्तिक अमावस्या, प्रकाश का महापर्व, धन-धान्य व ऐश्वर्य प्रदाता भगवती महालक्ष्मी व श्री गणेश का महापूजन।',
    });

    // Govardhan Puja / Annakut (Day after Diwali)
    festivals.push({
      id: `fest-${year}-govardhan-puja`,
      date: addDays(kartikaAm, 1),
      name: 'Govardhan Puja / Annakut',
      hindiName: 'गोवर्धन पूजा / अन्नकूट महोत्सव',
      type: 'पर्व',
      description: 'कार्तिक शुक्ल प्रतिपदा, प्रकृति व गौ संवर्धन, भगवान श्री कृष्ण द्वारा इंद्र दंभ दलन व गोवर्धन धारण स्मृति।',
    });

    // Bhai Dooj (2 days after Diwali)
    festivals.push({
      id: `fest-${year}-bhai-dooj`,
      date: addDays(kartikaAm, 2),
      name: 'Bhai Dooj',
      hindiName: 'भाई दूज (यम द्वितीया)',
      type: 'पर्व',
      description: 'कार्तिक शुक्ल द्वितीया, यमुना जी द्वारा यमराज के सत्कार की स्मृति, भाई के दीर्घायु हेतु तिलक पर्व।',
    });

    // Chhath Puja (6 days after Diwali)
    festivals.push({
      id: `fest-${year}-chhath-puja`,
      date: addDays(kartikaAm, 6),
      name: 'Chhath Puja',
      hindiName: 'छठ पूजा (सूर्य षष्ठी संध्या अर्घ्य)',
      type: 'व्रत',
      description: 'कार्तिक शुक्ल षष्ठी, भगवान भास्कर व छठी मइया का 36 घंटे का निर्जला महापर्व, अस्ताचलगामी सूर्य को अर्घ्य।',
    });

    // Dev Uthani Ekadashi (11 days after Diwali)
    festivals.push({
      id: `fest-${year}-dev-uthani-ekadashi`,
      date: addDays(kartikaAm, 11),
      name: 'Dev Uthani Ekadashi / Tulsi Vivah',
      hindiName: 'देवउठनी एकादशी (प्रबोधिनी / तुलसी विवाह)',
      type: 'एकादशी',
      description: 'कार्तिक शुक्ल एकादशी, श्री हरि विष्णु का योगनिद्रा से जागरण, चातुर्मास समापन एवं तुलसी-शालिग्राम विवाह।',
    });
  }

  // Kartik Purnima (Dev Diwali)
  const kartikPu = findPurnimaInMonth(10) || findPurnimaInMonth(11);
  if (kartikPu && kartikPu.getFullYear() === year) {
    festivals.push({
      id: `fest-${year}-kartik-purnima`,
      date: kartikPu,
      name: 'Kartik Purnima / Dev Diwali',
      hindiName: 'कार्तिक पूर्णिमा (देव दीपावली / त्रिपुरारी पूर्णिमा)',
      type: 'पूर्णिमा',
      description: 'कार्तिक पूर्णिमा, भगवान शिव द्वारा त्रिपुरासुर संहार, काशी में देवताओं की दीपावली एवं पवित्र गंगा स्नान।',
    });
  }

  // G. MARGASHIRSHA & PAUSHA (November / December)
  const margashirshaAm = findAmavasya('वृश्चिक');
  if (margashirshaAm && margashirshaAm.getFullYear() === year) {
    festivals.push({
      id: `fest-${year}-gita-jayanti`,
      date: addDays(margashirshaAm, 11),
      name: 'Gita Jayanti / Mokshada Ekadashi',
      hindiName: 'गीता जयंती / मोक्षदा एकादशी',
      type: 'एकादशी',
      description: 'मार्गशीर्ष शुक्ल एकादशी, कुरुक्षेत्र के समर में योगेश्वर श्री कृष्ण द्वारा अर्जुन को श्रीमद्भगवद्गीता उपदेश दिवस।',
    });
  }

  const paushaPu = findPurnimaInMonth(11) || findPurnimaInMonth(0);
  if (paushaPu && paushaPu.getFullYear() === year) {
    festivals.push({
      id: `fest-${year}-paush-purnima`,
      date: paushaPu,
      name: 'Paush Purnima',
      hindiName: 'पौष पूर्णिमा',
      type: 'पूर्णिमा',
      description: 'पौष मास की पूर्णिमा, प्रयागराज माघ मेले का औपचारिक शुभारंभ, पवित्र नदी स्नान व दान।',
    });
  }

  // Sort all festivals strictly by chronological date
  festivals.sort((a, b) => a.date.getTime() - b.date.getTime());

  // Deduplicate by ID just in case
  const uniqueMap = new Map<string, FestivalItem>();
  festivals.forEach((f) => uniqueMap.set(f.id, f));
  const result = Array.from(uniqueMap.values());

  YEAR_FESTIVALS_CACHE.set(year, result);
  return result;
}

/**
 * Filter festivals for a specific year by text query and category type
 */
export function filterFestivals(
  query = '',
  type = 'all',
  targetYear = new Date().getFullYear()
): FestivalItem[] {
  const fests = getFestivalsForYear(targetYear);
  const cleanQ = query.toLowerCase().trim();

  return fests.filter((f) => {
    const matchesQ =
      !cleanQ ||
      f.name.toLowerCase().includes(cleanQ) ||
      f.hindiName.toLowerCase().includes(cleanQ) ||
      f.description.toLowerCase().includes(cleanQ);
    const matchesT = type === 'all' || f.type === type;
    return matchesQ && matchesT;
  });
}

/**
 * Search across a span of 200 years (e.g., 1925 to 2125)
 * for a specific festival name, e.g. "दीवाली", "होली", "शिवरात्रि", "करवा चौथ"
 */
export interface CenturySearchResult {
  year: number;
  festival: FestivalItem;
}

export function searchFestivalsAcrossCenturies(
  query: string,
  startYear = 1925,
  endYear = 2125,
  type = 'all'
): CenturySearchResult[] {
  const cleanQ = query.toLowerCase().trim();
  if (!cleanQ && type === 'all') {
    return [];
  }

  // Synonym expansions for common Indian festival queries
  const synonyms: string[] = [cleanQ];
  if (cleanQ.includes('दिवाली') || cleanQ.includes('diwali')) synonyms.push('दीपावली', 'महालक्ष्मी');
  if (cleanQ.includes('दीपावली')) synonyms.push('दिवाली', 'diwali');
  if (cleanQ.includes('शिवरात्रि') || cleanQ.includes('shivratri')) synonyms.push('महाशिवरात्रि');
  if (cleanQ.includes('राखी') || cleanQ.includes('rakhi')) synonyms.push('रक्षाबंधन');
  if (cleanQ.includes('करवाचौथ')) synonyms.push('करवा चौथ');
  if (cleanQ.includes('जन्माष्टमी') || cleanQ.includes('janmashtami')) synonyms.push('कृष्ण', 'गोकुलाष्टमी');
  if (cleanQ.includes('दशहरा') || cleanQ.includes('dussehra')) synonyms.push('विजयादशमी');
  if (cleanQ.includes('छठ') || cleanQ.includes('chhath')) synonyms.push('छठ पूजा', 'सूर्य षष्ठी');
  if (cleanQ.includes('रामनवमी')) synonyms.push('राम नवमी', 'राम');
  if (cleanQ.includes('गणेश') || cleanQ.includes('ganesh')) synonyms.push('विनायक', 'चतुर्थी');
  if (cleanQ.includes('होली') || cleanQ.includes('holi')) synonyms.push('होलिका', 'धुलेंडी');
  if (cleanQ.includes('नवरात्रि') || cleanQ.includes('navratri')) synonyms.push('चैत्र नवरात्रि', 'शारदीय नवरात्रि');

  const results: CenturySearchResult[] = [];
  for (let y = startYear; y <= endYear; y++) {
    const list = getFestivalsForYear(y);
    for (const f of list) {
      const nameL = f.name.toLowerCase();
      const hindiL = f.hindiName.toLowerCase();
      const descL = f.description.toLowerCase();

      const matchesQ =
        !cleanQ ||
        synonyms.some(
          (syn) =>
            nameL.includes(syn) ||
            hindiL.includes(syn) ||
            descL.includes(syn)
        );

      const matchesT = type === 'all' || f.type === type;
      if (matchesQ && matchesT) {
        results.push({ year: y, festival: f });
      }
    }
  }

  return results;
}

/**
 * Return upcoming festivals starting from today or fromDate
 */
export function getUpcomingFestivals(count = 6, fromDate = new Date()): FestivalItem[] {
  const y = fromDate.getFullYear();
  const all = [...getFestivalsForYear(y), ...getFestivalsForYear(y + 1)];
  const target = fromDate.getTime() - 24 * 3600 * 1000;
  return all
    .filter((f) => f.date.getTime() >= target)
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, count);
}

// Backward compatibility export
export const MAJOR_FESTIVALS_2025_2026: FestivalItem[] = [
  ...getFestivalsForYear(2025),
  ...getFestivalsForYear(2026),
];
