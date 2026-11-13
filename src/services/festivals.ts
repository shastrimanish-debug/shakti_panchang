import { FestivalItem } from '../types';
import { getSunMoonSidereal } from './astronomy';

// Cache generated festivals per year for zero-latency retrieval
const YEAR_FESTIVALS_CACHE = new Map<number, FestivalItem[]>();

type WatchPoint = 'sunrise' | 'madhyahna' | 'aparahna' | 'pradosh' | 'nishita';

function norm360(deg: number): number {
  const n = deg % 360;
  return n < 0 ? n + 360 : n;
}

function tithiIndex(date: Date): number {
  const { sunSidereal, moonSidereal } = getSunMoonSidereal(date);
  return Math.floor(norm360(moonSidereal - sunSidereal) / 12);
}

function sunRashiIndex(date: Date): number {
  return Math.floor(getSunMoonSidereal(date).sunSidereal / 30) % 12;
}

/** IST civil noon, so the calendar day does not drift with the server timezone. */
function civilNoon(year: number, month: number, day: number): Date {
  return new Date(year, month, day, 12, 0, 0);
}

function watchInstant(year: number, month: number, day: number, when: WatchPoint): Date {
  // Hours are UTC equivalents of India Standard Time.
  if (when === 'sunrise') return new Date(Date.UTC(year, month, day, 0, 50, 0));
  if (when === 'madhyahna') return new Date(Date.UTC(year, month, day, 6, 40, 0));
  if (when === 'aparahna') return new Date(Date.UTC(year, month, day, 9, 30, 0));
  if (when === 'pradosh') return new Date(Date.UTC(year, month, day, 13, 10, 0));
  // Nishita of this civil date = midnight that ends the day (00:00 IST next morning).
  return new Date(Date.UTC(year, month, day, 18, 30, 0));
}

/**
 * First IST civil day in an inclusive window whose chosen muhurta
 * falls in `tithi` (0 = Shukla Pratipada ... 29 = Amavasya).
 * Optional sidereal sun rashi keeps a wide window from grabbing the wrong month.
 */
function findTithiDay(
  year: number,
  fromMonth: number,
  fromDay: number,
  toMonth: number,
  toDay: number,
  tithi: number,
  when: WatchPoint,
  sunRashi?: number,
): Date | null {
  const cursor = civilNoon(year, fromMonth, fromDay);
  const end = civilNoon(year, toMonth, toDay);
  while (cursor.getTime() <= end.getTime()) {
    const month = cursor.getMonth();
    const day = cursor.getDate();
    const instant = watchInstant(year, month, day, when);
    if (tithiIndex(instant) === tithi && (sunRashi === undefined || sunRashiIndex(instant) === sunRashi)) {
      return civilNoon(year, month, day);
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return null;
}

function addDays(base: Date, days: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}

/** IST calendar day when sidereal Sun crosses `targetDeg` (0 = Mesha). */
function solarIngressDate(year: number, targetDeg: number, fromMonth: number, toMonth: number): Date {
  let lo = Date.UTC(year, fromMonth, 1);
  let hi = Date.UTC(year, toMonth, 28, 18);
  const rel = (t: number) => {
    const sun = getSunMoonSidereal(new Date(t)).sunSidereal;
    if (targetDeg === 0) return sun > 180 ? sun - 360 : sun;
    return sun - targetDeg;
  };
  if (!(rel(lo) < 0 && rel(hi) >= 0)) {
    lo = Date.UTC(year, fromMonth, 1) - 20 * 86400000;
    hi = Date.UTC(year, toMonth, 28) + 20 * 86400000;
  }
  for (let i = 0; i < 48; i++) {
    const mid = (lo + hi) / 2;
    if (rel(mid) < 0) lo = mid;
    else hi = mid;
  }
  const ist = new Date(hi + 5.5 * 3600000);
  return civilNoon(ist.getUTCFullYear(), ist.getUTCMonth(), ist.getUTCDate());
}

const TITHI = {
  pratipada: 0,
  dwitiya: 1,
  tritiya: 2,
  chaturthi: 3,
  panchami: 4,
  shashthi: 5,
  ashtami: 7,
  navami: 8,
  dashami: 9,
  ekadashi: 10,
  trayodashi: 12,
  chaturdashi: 13,
  purnima: 14,
  krishnaChaturthi: 18,
  krishnaAshtami: 22,
  krishnaTrayodashi: 27,
  krishnaChaturdashi: 28,
  amavasya: 29,
};

/**
 * Calculates all authentic Vedic Hindu festivals, fasts, and sacred tithis
 * for ANY Gregorian year (1900 to 2150) using high-precision astronomical engine.
 * Dates follow the muhurta on which the tithi is actually observed
 * (sunrise, midday, afternoon, pradosh or nishita) — not "new moon instant + N days".
 */
export function getFestivalsForYear(year: number): FestivalItem[] {
  if (YEAR_FESTIVALS_CACHE.has(year)) {
    return YEAR_FESTIVALS_CACHE.get(year)!;
  }

  const festivals: FestivalItem[] = [];
  const on = (
    fromMonth: number,
    fromDay: number,
    toMonth: number,
    toDay: number,
    tithi: number,
    when: WatchPoint,
    sunRashi?: number,
  ) => findTithiDay(year, fromMonth, fromDay, toMonth, toDay, tithi, when, sunRashi);

  const push = (item: FestivalItem | null) => {
    if (item && item.date) festivals.push(item);
  };

  const makar = solarIngressDate(year, 270, 0, 0);
  const mesha = solarIngressDate(year, 0, 3, 3);

  push({
    id: `fest-${year}-lohri`,
    date: addDays(makar, -1),
    name: 'Lohri',
    hindiName: 'लोहड़ी',
    type: 'पर्व',
    description: 'पंजाब व उत्तर भारत का प्रमुख अग्नि पूजन व नवान्न उत्सव, मकर संक्रांति से पूर्व संध्या पर उल्लास।',
  });
  push({
    id: `fest-${year}-makar-sankranti`,
    date: makar,
    name: 'Makar Sankranti',
    hindiName: 'मकर संक्रांति',
    type: 'पर्व',
    description: 'सूर्य देव का धनु से मकर राशि में प्रवेश, उत्तरायण पुण्य काल, पवित्र गंगा स्नान, तिल-गुड़ एवं खिचड़ी दान का महापर्व।',
  });
  push({
    id: `fest-${year}-baisakhi`,
    date: mesha,
    name: 'Baisakhi / Mesha Sankranti',
    hindiName: 'बैसाखी (मेष संक्रांति)',
    type: 'पर्व',
    description: 'सौर नववर्ष, सूर्य का मेष राशि में प्रवेश, खालसा पंथ स्थापना दिवस एवं रबी फसल कटाई का उत्सव।',
  });

  const mauni = on(0, 10, 0, 28, TITHI.amavasya, 'sunrise', 9);
  if (mauni) {
    push({
      id: `fest-${year}-mauni-amavasya`,
      date: mauni,
      name: 'Mauni Amavasya',
      hindiName: 'मौनी अमावस्या',
      type: 'अमावस्या',
      description: 'माघ कृष्ण अमावस्या, मौन व्रत, त्रिवेणी संगम व पवित्र नदियों में स्नान का महापुण्यकारी दिवस।',
    });
  }
  const vasant = on(0, 15, 1, 5, TITHI.panchami, 'sunrise');
  if (vasant) {
    push({
      id: `fest-${year}-vasant-panchami`,
      date: vasant,
      name: 'Vasant Panchami',
      hindiName: 'वसंत पंचमी (सरस्वती पूजा)',
      type: 'पर्व',
      description: 'माघ शुक्ल पंचमी, ज्ञान, विद्या, कला व वाणी की अधिष्ठात्री भगवती मां सरस्वती का प्राकट्योत्सव एवं ऋतुराज वसंत का आगमन।',
    });
  }

  const shivratri = on(1, 8, 2, 5, TITHI.krishnaChaturdashi, 'nishita');
  if (shivratri) {
    push({
      id: `fest-${year}-maha-shivratri`,
      date: shivratri,
      name: 'Maha Shivratri',
      hindiName: 'महाशिवरात्रि',
      type: 'व्रत',
      description: 'फाल्गुन कृष्ण चतुर्दशी, देवाधिदेव महादेव व माता पार्वती का महाकल्याणकारी विवाह उत्सव एवं चार प्रहर रुद्राभिषेक।',
    });
  }

  const holiPurnima = on(1, 20, 2, 12, TITHI.purnima, 'sunrise');
  if (holiPurnima) {
    push({
      id: `fest-${year}-holika-dahan`,
      date: holiPurnima,
      name: 'Holika Dahan',
      hindiName: 'होलिका दहन',
      type: 'पर्व',
      description: 'फाल्गुन पूर्णिमा की संध्या, भक्त प्रह्लाद की रक्षा, अधर्म व काम-क्रोध की आहुति एवं अग्नि पूजन।',
    });
    push({
      id: `fest-${year}-holi`,
      date: addDays(holiPurnima, 1),
      name: 'Holi / Dhulandi',
      hindiName: 'होली (धुलेंडी - रंगोत्सव)',
      type: 'पर्व',
      description: 'रंगों का महापर्व, वसंतोत्सव, आपसी सद्भाव, प्रेम व उल्लास का पावन उत्सव।',
    });
  }

  const chaitraStart = on(2, 12, 3, 8, TITHI.pratipada, 'madhyahna', 11) || on(2, 12, 3, 8, TITHI.pratipada, 'madhyahna');
  if (chaitraStart) {
    const samvatYear = year + 57;
    push({
      id: `fest-${year}-chaitra-navratri-start`,
      date: chaitraStart,
      name: 'Chaitra Navratri / Hindu New Year',
      hindiName: `चैत्र नवरात्रि / नव संवत्सरारंभ (वि॰सं॰ ${samvatYear})`,
      type: 'पर्व',
      description: `विक्रम संवत् ${samvatYear} का शुभारंभ, गुड़ी पड़वा, उगादी, घटस्थापना एवं शक्ति स्वरूपा मां दुर्गा की नवदिवसीय उपासना।`,
    });
  }
  const ramNavami = on(2, 20, 3, 8, TITHI.navami, 'madhyahna');
  if (ramNavami) {
    push({
      id: `fest-${year}-ram-navami`,
      date: ramNavami,
      name: 'Ram Navami',
      hindiName: 'श्री राम नवमी',
      type: 'पर्व',
      description: 'चैत्र शुक्ल नवमी, मध्याह्न में मर्यादा पुरुषोत्तम भगवान श्री रामचंद्र जी का पावन अवतरण दिवस।',
    });
  }
  const chaitraPu = on(2, 25, 3, 12, TITHI.purnima, 'sunrise');
  if (chaitraPu) {
    push({
      id: `fest-${year}-hanuman-jayanti`,
      date: chaitraPu,
      name: 'Hanuman Jayanti',
      hindiName: 'श्री हनुमान जयंती',
      type: 'पर्व',
      description: 'चैत्र पूर्णिमा पर पवनपुत्र, कलयुग के जाग्रत देव संकटमोचन श्री हनुमान जी का जन्मोत्सव।',
    });
  }

  const akshaya = on(3, 12, 4, 5, TITHI.tritiya, 'sunrise');
  if (akshaya) {
    push({
      id: `fest-${year}-akshaya-tritiya`,
      date: akshaya,
      name: 'Akshaya Tritiya',
      hindiName: 'अक्षय तृतीया (आखा तीज)',
      type: 'पर्व',
      description: 'वैशाख शुक्ल तृतीया, अबूझ सिद्ध मुहूर्त, परशुराम जयंती, स्वर्ण क्रय व अक्षय पुण्य अर्जन।',
    });
  }
  const buddha = on(3, 25, 4, 12, TITHI.purnima, 'sunrise');
  if (buddha) {
    push({
      id: `fest-${year}-buddha-purnima`,
      date: buddha,
      name: 'Buddha Purnima / Vaishakha Purnima',
      hindiName: 'बुद्ध पूर्णिमा (वैशाख पूर्णिमा)',
      type: 'पर्व',
      description: 'भगवान बुद्ध का जन्म, ज्ञान प्राप्ति व महापरिनिर्वाण दिवस, सत्यनारायण व्रत व जल दान।',
    });
  }
  const ganga = on(4, 20, 5, 15, TITHI.dashami, 'sunrise');
  if (ganga) {
    push({
      id: `fest-${year}-ganga-dussehra`,
      date: ganga,
      name: 'Ganga Dussehra',
      hindiName: 'गंगा दशहरा',
      type: 'पर्व',
      description: 'ज्येष्ठ शुक्ल दशमी, मां पतितपाविनी भागीरथी गंगा का स्वर्ग से भूतल पर अवतरण दिवस।',
    });
  }
  const nirjala = on(4, 25, 5, 20, TITHI.ekadashi, 'sunrise');
  if (nirjala) {
    push({
      id: `fest-${year}-nirjala-ekadashi`,
      date: nirjala,
      name: 'Nirjala Ekadashi',
      hindiName: 'निर्जला एकादशी (भीमसेनी एकादशी)',
      type: 'एकादशी',
      description: 'ज्येष्ठ शुक्ल एकादशी, बिना जल ग्रहण किए समस्त 24 एकादशियों का पुण्य फल प्रदान करने वाला महाव्रत।',
    });
  }

  const rath = on(6, 5, 6, 22, TITHI.dwitiya, 'sunrise');
  if (rath) {
    push({
      id: `fest-${year}-jagannath-rath-yatra`,
      date: rath,
      name: 'Jagannath Rath Yatra',
      hindiName: 'जगन्नाथ रथयात्रा',
      type: 'पर्व',
      description: 'आषाढ़ शुक्ल द्वितीया, पुरी में महाप्रभु श्री जगन्नाथ, बलभद्र व सुभद्रा की भव्य रथयात्रा।',
    });
  }
  const devshayani = on(6, 10, 6, 28, TITHI.ekadashi, 'sunrise');
  if (devshayani) {
    push({
      id: `fest-${year}-devshayani-ekadashi`,
      date: devshayani,
      name: 'Devshayani Ekadashi',
      hindiName: 'देवशयनी एकादशी (आषाढ़ी एकादशी)',
      type: 'एकादशी',
      description: 'आषाढ़ शुक्ल एकादशी, भगवान श्री विष्णु का योगनिद्रा में शयन, चातुर्मास महाव्रत का शुभारंभ।',
    });
  }
  const guruPu = on(6, 15, 7, 8, TITHI.purnima, 'sunrise');
  if (guruPu) {
    push({
      id: `fest-${year}-guru-purnima`,
      date: guruPu,
      name: 'Guru Purnima',
      hindiName: 'गुरु पूर्णिमा (व्यास पूर्णिमा)',
      type: 'पर्व',
      description: 'आषाढ़ पूर्णिमा, महर्षि वेदव्यास जी की जयंती, गुरुजनों के प्रति श्रद्धा व पादपूजन का पावन पर्व।',
    });
  }
  const hariyali = guruPu ? on(guruPu.getMonth(), guruPu.getDate(), guruPu.getMonth() === 6 ? 7 : guruPu.getMonth(), Math.min(28, guruPu.getDate() + 8), TITHI.tritiya, 'sunrise') : on(7, 1, 7, 15, TITHI.tritiya, 'sunrise');
  if (hariyali) {
    push({
      id: `fest-${year}-hariyali-teej`,
      date: hariyali,
      name: 'Hariyali Teej',
      hindiName: 'हरियाली तीज',
      type: 'व्रत',
      description: 'श्रावण शुक्ल तृतीया, सुहागिनों द्वारा भगवान शिव व माता पार्वती का पूजन, अखंड सौभाग्य का व्रत।',
    });
  }
  const nag = guruPu
    ? on(guruPu.getMonth(), guruPu.getDate(), 7, 20, TITHI.panchami, 'sunrise')
    : on(7, 1, 7, 20, TITHI.panchami, 'sunrise');
  if (nag) {
    push({
      id: `fest-${year}-nag-panchami`,
      date: nag,
      name: 'Nag Panchami',
      hindiName: 'नाग पंचमी',
      type: 'पर्व',
      description: 'श्रावण शुक्ल पंचमी, नाग देवताओं की पूजा, कालसर्प दोष निवारण एवं दुग्ध अर्पण।',
    });
  }
  const rakhi = on(7, 15, 8, 5, TITHI.purnima, 'sunrise');
  if (rakhi) {
    push({
      id: `fest-${year}-raksha-bandhan`,
      date: rakhi,
      name: 'Raksha Bandhan',
      hindiName: 'रक्षाबंधन',
      type: 'पर्व',
      description: 'श्रावण पूर्णिमा, भाई-बहन के अटूट स्नेह का प्रतीक, रक्षा सूत्र व कजरी पूर्णिमा।',
    });
  }
  const janmashtami = on(7, 25, 8, 12, TITHI.krishnaAshtami, 'nishita');
  if (janmashtami) {
    push({
      id: `fest-${year}-krishna-janmashtami`,
      date: janmashtami,
      name: 'Krishna Janmashtami',
      hindiName: 'श्री कृष्ण जन्माष्टमी',
      type: 'पर्व',
      description: 'भाद्रपद कृष्ण अष्टमी, निशीथ काल, भगवान योगेश्वर श्री कृष्ण का पावन प्राकट्योत्सव।',
    });
  }

  const ganesh = on(8, 5, 8, 22, TITHI.chaturthi, 'madhyahna');
  const hartalikaFound = on(8, 1, 8, 18, TITHI.tritiya, 'pradosh');
  const hartalika = ganesh && hartalikaFound && hartalikaFound.getTime() >= ganesh.getTime()
    ? addDays(ganesh, -1)
    : hartalikaFound;
  if (hartalika) {
    push({
      id: `fest-${year}-hartalika-teej`,
      date: hartalika,
      name: 'Hartalika Teej',
      hindiName: 'हरतालिका तीज',
      type: 'व्रत',
      description: 'भाद्रपद शुक्ल तृतीया, अखंड सौभाग्य व सुयोग्य वर प्राप्ति हेतु माता पार्वती व शिवजी का निर्जल व्रत।',
    });
  }
  if (ganesh) {
    push({
      id: `fest-${year}-ganesh-chaturthi`,
      date: ganesh,
      name: 'Ganesh Chaturthi',
      hindiName: 'गणेश चतुर्थी (विनायक चतुर्थी)',
      type: 'पर्व',
      description: 'भाद्रपद शुक्ल चतुर्थी, प्रथम पूज्य विघ्नहर्ता भगवान श्री गणेश का जन्मोत्सव एवं दसोत्सव स्थापना।',
    });
  }
  const anant = on(8, 16, 9, 2, TITHI.chaturdashi, 'sunrise');
  if (anant) {
    push({
      id: `fest-${year}-anant-chaturdashi`,
      date: anant,
      name: 'Anant Chaturdashi',
      hindiName: 'अनंत चतुर्दशी (गणेश विसर्जन)',
      type: 'पर्व',
      description: 'भाद्रपद शुक्ल चतुर्दशी, भगवान विष्णु के अनंत स्वरूप का पूजन, 14 गांठों का अनंत सूत्र एवं गणेश विसर्जन।',
    });
  }

  const bhadraPu = on(8, 10, 9, 5, TITHI.purnima, 'sunrise');
  if (bhadraPu) {
    push({
      id: `fest-${year}-pitru-paksha-start`,
      date: bhadraPu,
      name: 'Pitru Paksha Start',
      hindiName: 'पितृ पक्ष (श्राद्ध महालय) आरंभ',
      type: 'पर्व',
      description: 'भाद्रपद पूर्णिमा से आश्विन अमावस्या तक, पूर्वजों के प्रति कृतज्ञता, तर्पण व पिंडदान का 16 दिवसीय काल।',
    });
  }
  const mahalaya = on(9, 1, 9, 18, TITHI.amavasya, 'sunrise');
  if (mahalaya) {
    push({
      id: `fest-${year}-sarva-pitru-amavasya`,
      date: mahalaya,
      name: 'Sarva Pitru Amavasya',
      hindiName: 'सर्वपितृ अमावस्या (महालया विसर्जन)',
      type: 'अमावस्या',
      description: 'आश्विन कृष्ण अमावस्या, समस्त ज्ञात-अज्ञात पितरों के श्राद्ध, तर्पण व विदाई का परम पावन दिन।',
    });
  }
  const shardiya = on(9, 6, 9, 18, TITHI.pratipada, 'sunrise') || on(9, 6, 9, 18, TITHI.pratipada, 'madhyahna');
  if (shardiya) {
    push({
      id: `fest-${year}-shardiya-navratri-start`,
      date: shardiya,
      name: 'Shardiya Navratri Ghatasthapana',
      hindiName: 'शारदीय नवरात्रि घटस्थापना',
      type: 'पर्व',
      description: 'आश्विन शुक्ल प्रतिपदा, कलश स्थापना, देवी भगवती के नौ रूपों की दिव्य आराधना का शुभारंभ।',
    });
  }
  const durgaAshtami = on(9, 14, 9, 24, TITHI.ashtami, 'sunrise');
  if (durgaAshtami) {
    push({
      id: `fest-${year}-durga-ashtami`,
      date: durgaAshtami,
      name: 'Durga Ashtami (Maha Ashtami)',
      hindiName: 'दुर्गा महाष्टमी (महागौरी पूजन)',
      type: 'पर्व',
      description: 'आश्विन शुक्ल अष्टमी, मां महागौरी पूजन, कन्या पूजन व संधि पूजा।',
    });
  }
  const mahaNavami = on(9, 15, 9, 25, TITHI.navami, 'madhyahna');
  if (mahaNavami) {
    push({
      id: `fest-${year}-maha-navami`,
      date: mahaNavami,
      name: 'Maha Navami',
      hindiName: 'महानवमी (सिद्धिदात्री पूजन)',
      type: 'पर्व',
      description: 'आश्विन शुक्ल नवमी, मां सिद्धिदात्री पूजन, हवन, पूर्णाहुति व कन्या भोजन।',
    });
  }
  const dussehra = on(9, 16, 9, 26, TITHI.dashami, 'aparahna');
  if (dussehra) {
    push({
      id: `fest-${year}-dussehra`,
      date: dussehra,
      name: 'Dussehra / Vijayadashami',
      hindiName: 'दशहरा (विजयादशमी)',
      type: 'पर्व',
      description: 'अधर्म पर धर्म व रावण पर भगवान श्री राम की विजय, अपराजिता पूजन एवं शस्त्र पूजन का महापर्व।',
    });
  }
  const sharad = on(9, 18, 10, 2, TITHI.purnima, 'pradosh');
  if (sharad) {
    push({
      id: `fest-${year}-sharad-purnima`,
      date: sharad,
      name: 'Sharad Purnima',
      hindiName: 'शरद पूर्णिमा (कोजागरी / रास पूर्णिमा)',
      type: 'पूर्णिमा',
      description: 'आश्विन पूर्णिमा, 16 कलाओं से युक्त अमृतमयी चंद्र किरणें, खीर का भोग एवं महालक्ष्मी का पृथ्वी भ्रमण।',
    });
  }
  const karwa = on(9, 22, 10, 6, TITHI.krishnaChaturthi, 'pradosh');
  if (karwa) {
    push({
      id: `fest-${year}-karwa-chauth`,
      date: karwa,
      name: 'Karwa Chauth',
      hindiName: 'करवा चौथ (कर्क चतुर्थी)',
      type: 'व्रत',
      description: 'कार्तिक कृष्ण चतुर्थी, सुहागिनों द्वारा पति की दीर्घायु हेतु चंद्र दर्शन पर्यंत निर्जला व्रत।',
    });
  }
  const ahoi = on(9, 25, 10, 8, TITHI.krishnaAshtami, 'sunrise');
  if (ahoi) {
    push({
      id: `fest-${year}-ahoi-ashtami`,
      date: ahoi,
      name: 'Ahoi Ashtami',
      hindiName: 'अहोई अष्टमी',
      type: 'व्रत',
      description: 'कार्तिक कृष्ण अष्टमी, संतान की दीर्घायु व कल्याण हेतु माताओं द्वारा तारों को अर्घ्य देकर व्रत।',
    });
  }

  const dhanteras = on(10, 1, 10, 12, TITHI.krishnaTrayodashi, 'pradosh', 6);
  if (dhanteras) {
    push({
      id: `fest-${year}-dhanteras`,
      date: dhanteras,
      name: 'Dhanteras',
      hindiName: 'धनतेरस (धन्वंतरि जयंती / कुबेर पूजन)',
      type: 'पर्व',
      description: 'कार्तिक कृष्ण त्रयोदशी, आरोग्य के देव भगवान धन्वंतरि प्राकट्य दिवस, यम दीपदान व नवीन धातु क्रय।',
    });
  }
  const narak = on(10, 2, 10, 14, TITHI.krishnaChaturdashi, 'pradosh', 6);
  if (narak) {
    push({
      id: `fest-${year}-narak-chaturdashi`,
      date: narak,
      name: 'Narak Chaturdashi / Roop Chaudas',
      hindiName: 'नरक चतुर्दशी (छोटी दीवाली / रूप चौदस)',
      type: 'पर्व',
      description: 'कार्तिक कृष्ण चतुर्दशी, भगवान श्री कृष्ण द्वारा नरकासुर वध स्मृति, यम तर्पण एवं उबटन स्नान।',
    });
  }
  const diwali = on(10, 3, 10, 16, TITHI.amavasya, 'pradosh', 6);
  if (diwali) {
    push({
      id: `fest-${year}-diwali`,
      date: diwali,
      name: 'Diwali',
      hindiName: 'दीपावली (महालक्ष्मी पूजन)',
      type: 'पर्व',
      description: 'कार्तिक अमावस्या, प्रकाश का महापर्व, धन-धान्य व ऐश्वर्य प्रदाता भगवती महालक्ष्मी व श्री गणेश का महापूजन।',
    });
    const govardhan = on(10, diwali.getDate(), 10, 18, TITHI.pratipada, 'aparahna') || addDays(diwali, 1);
    push({
      id: `fest-${year}-govardhan-puja`,
      date: govardhan,
      name: 'Govardhan Puja / Annakut',
      hindiName: 'गोवर्धन पूजा / अन्नकूट महोत्सव',
      type: 'पर्व',
      description: 'कार्तिक शुक्ल प्रतिपदा, प्रकृति व गौ संवर्धन, भगवान श्री कृष्ण द्वारा इंद्र दंभ दलन व गोवर्धन धारण स्मृति।',
    });
    const bhaiDooj = on(10, diwali.getDate(), 10, 20, TITHI.dwitiya, 'madhyahna') || addDays(diwali, 2);
    push({
      id: `fest-${year}-bhai-dooj`,
      date: bhaiDooj,
      name: 'Bhai Dooj',
      hindiName: 'भाई दूज (यम द्वितीया)',
      type: 'पर्व',
      description: 'कार्तिक शुक्ल द्वितीया, यमुना जी द्वारा यमराज के सत्कार की स्मृति, भाई के दीर्घायु हेतु तिलक पर्व।',
    });
    const chhath = on(10, diwali.getDate(), 10, 22, TITHI.shashthi, 'pradosh');
    if (chhath) {
      push({
        id: `fest-${year}-chhath-puja`,
        date: chhath,
        name: 'Chhath Puja',
        hindiName: 'छठ पूजा (सूर्य षष्ठी संध्या अर्घ्य)',
        type: 'व्रत',
        description: 'कार्तिक शुक्ल षष्ठी, भगवान भास्कर व छठी मइया का 36 घंटे का निर्जला महापर्व, अस्ताचलगामी सूर्य को अर्घ्य।',
      });
    }
    const uthani = on(10, diwali.getDate(), 11, 5, TITHI.ekadashi, 'sunrise');
    if (uthani) {
      push({
        id: `fest-${year}-dev-uthani-ekadashi`,
        date: uthani,
        name: 'Dev Uthani Ekadashi / Tulsi Vivah',
        hindiName: 'देवउठनी एकादशी (प्रबोधिनी / तुलसी विवाह)',
        type: 'एकादशी',
        description: 'कार्तिक शुक्ल एकादशी, श्री हरि विष्णु का योगनिद्रा से जागरण, चातुर्मास समापन एवं तुलसी-शालिग्राम विवाह।',
      });
    }
  }

  const kartikPu = on(10, 15, 11, 5, TITHI.purnima, 'sunrise');
  if (kartikPu) {
    push({
      id: `fest-${year}-kartik-purnima`,
      date: kartikPu,
      name: 'Kartik Purnima / Dev Diwali',
      hindiName: 'कार्तिक पूर्णिमा (देव दीपावली / त्रिपुरारी पूर्णिमा)',
      type: 'पूर्णिमा',
      description: 'कार्तिक पूर्णिमा, भगवान शिव द्वारा त्रिपुरासुर संहार, काशी में देवताओं की दीपावली एवं पवित्र गंगा स्नान।',
    });
  }
  const gita = on(11, 1, 11, 20, TITHI.ekadashi, 'sunrise');
  if (gita) {
    push({
      id: `fest-${year}-gita-jayanti`,
      date: gita,
      name: 'Gita Jayanti / Mokshada Ekadashi',
      hindiName: 'गीता जयंती / मोक्षदा एकादशी',
      type: 'एकादशी',
      description: 'मार्गशीर्ष शुक्ल एकादशी, कुरुक्षेत्र के समर में योगेश्वर श्री कृष्ण द्वारा अर्जुन को श्रीमद्भगवद्गीता उपदेश दिवस।',
    });
  }
  const paushaPu = on(11, 10, 11, 31, TITHI.purnima, 'sunrise');
  if (paushaPu) {
    push({
      id: `fest-${year}-paush-purnima`,
      date: paushaPu,
      name: 'Paush Purnima',
      hindiName: 'पौष पूर्णिमा',
      type: 'पूर्णिमा',
      description: 'पौष मास की पूर्णिमा, प्रयागराज माघ मेले का औपचारिक शुभारंभ, पवित्र नदी स्नान व दान।',
    });
  }

  festivals.sort((a, b) => a.date.getTime() - b.date.getTime());
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
        synonyms.some((syn) => nameL.includes(syn) || hindiL.includes(syn) || descL.includes(syn));
      const matchesT = type === 'all' || f.type === type;
      if (matchesQ && matchesT) results.push({ year: y, festival: f });
    }
  }
  return results;
}

export function getUpcomingFestivals(count = 6, fromDate = new Date()): FestivalItem[] {
  const y = fromDate.getFullYear();
  const all = [...getFestivalsForYear(y), ...getFestivalsForYear(y + 1)];
  const target = fromDate.getTime() - 24 * 3600 * 1000;
  return all
    .filter((f) => f.date.getTime() >= target)
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, count);
}

export const MAJOR_FESTIVALS_2025_2026: FestivalItem[] = [
  ...getFestivalsForYear(2025),
  ...getFestivalsForYear(2026),
];

const FESTIVAL_META_LOC: Record<string, { guTitle?: string; enDesc: string; guDesc: string }> = {
  'lohri': { guTitle: 'લોહડી', enDesc: 'Harvest bonfire festival celebrated on the eve of Makar Sankranti.', guDesc: 'મકર સંક્રાંતિ પૂર્વેનો પવિત્ર અગ્નિ પૂજન અને લણણી ઉત્સવ.' },
  'makar-sankranti': { guTitle: 'મકર સંક્રાંતિ (ઉત્તરાયણ)', enDesc: 'Sun enters Capricorn (Uttarayana); sacred river bathing, til-gud & charity.', guDesc: 'સૂર્યનો મકર રાશિમાં પ્રવેશ, ઉત્તરાયણ પુણ્ય કાળ અને તલ-ગોળ દાનનું મહાપર્વ.' },
  'baisakhi': { guTitle: 'વૈશાખી (મેષ સંક્રાંતિ)', enDesc: 'Solar New Year as Sun enters Aries; harvest celebration.', guDesc: 'સૌર નવવર્ષ અને સૂર્યનો મેષ રાશિમાં પ્રવેશ.' },
  'mauni-amavasya': { guTitle: 'મૌની અમાસ', enDesc: 'Magha Krishna Amavasya; silent vow, sacred bathing & charity.', guDesc: 'મહા કૃષ્ણ અમાસ, મૌન વ્રત અને પવિત્ર નદી સ્નાનનો મહાપુણ્યકારી દિવસ.' },
  'vasant-panchami': { guTitle: 'વસંત પંચમી (સરસ્વતી પૂજન)', enDesc: 'Magha Shukla Panchami dedicated to Goddess Saraswati, wisdom, arts & spring.', guDesc: 'મહા સુદ પંચમી, વિદ્યા અને વાણીની અધિષ્ઠાત્રી મા સરસ્વતીનું પૂજન અને વસંતોત્સવ.' },
  'maha-shivratri': { guTitle: 'મહાશિવરાત્રિ', enDesc: 'Falgun Krishna Chaturdashi; sacred wedding night of Lord Shiva & Maa Parvati with four-prahar Rudrabhishek.', guDesc: 'ફાગણ વદ ચૌદસ, ભગવાન શિવ અને મા પાર્વતીનું મહાપર્વ અને ચાર પ્રહર રુદ્રાભિષેક.' },
  'holika-dahan': { guTitle: 'હોલિકા દહન', enDesc: 'Falgun Purnima evening; sacred bonfire symbolizing victory of devotion.', guDesc: 'ફાગણ પૂર્ણિમાની સાંજે ભક્ત પ્રહલાદની રક્ષા અને અગ્નિ પૂજનનું પર્વ.' },
  'holi': { guTitle: 'હોળી / ધુળેટી (રંગોત્સવ)', enDesc: 'Festival of colors celebrating joy, spring and harmony.', guDesc: 'રંગો, વસંત અને પરસ્પર પ્રેમ-સદ્ભાવનો મહાઉત્સવ.' },
  'chaitra-navratri-start': { guTitle: 'ચૈત્ર નવરાત્રિ / હિન્દુ નવવર્ષ', enDesc: 'Hindu New Year (Vikram Samvat), Gudi Padwa, Ugadi & 9-day Maa Durga worship.', guDesc: 'વિક્રમ સંવત નવવર્ષ પ્રારંભ, ઘટસ્થાપન અને મા દુર્ગાની નવદિવસીય ઉપાસના.' },
  'ram-navami': { guTitle: 'શ્રી રામ નવમી', enDesc: 'Chaitra Shukla Navami; sacred noon birth celebration of Lord Shri Rama.', guDesc: 'ચૈત્ર સુદ નોમ, મર્યાદા પુરુષોત્તમ ભગવાન શ્રી રામનો પાવન પ્રાગટ્ય દિવસ.' },
  'hanuman-jayanti': { guTitle: 'શ્રી હનુમાન જયંતિ', enDesc: 'Chaitra Purnima celebration of Lord Hanuman’s divine birth.', guDesc: 'ચૈત્ર પૂર્ણિમાના રોજ સંકટમોચન શ્રી હનુમાનજીનો જન્મોત્સવ.' },
  'akshaya-tritiya': { guTitle: 'અક્ષય તૃતીયા (અખાત્રીજ)', enDesc: 'Vaishakha Shukla Tritiya; self-auspicious Abujh Muhurat for charity & sacred starts.', guDesc: 'વૈશાખ સુદ ત્રીજ, સ્વયંસિદ્ધ અબૂઝ મુહૂર્ત, પરશુરામ જયંતિ અને અક્ષય પુણ્ય દાન.' },
  'buddha-purnima': { guTitle: 'બુદ્ધ પૂર્ણિમા (વૈશાખ પૂર્ણિમા)', enDesc: 'Vaishakha Purnima commemorating Lord Buddha, Satyanarayan Vrat & charity.', guDesc: 'ભગવાન બુદ્ધ જયંતિ, સત્યનારાયણ વ્રત અને જળ દાન.' },
  'ganga-dussehra': { guTitle: 'ગંગા દશેરા', enDesc: 'Jyeshtha Shukla Dashami celebrating Goddess Ganga’s descent to Earth.', guDesc: 'જેઠ સુદ દશમ, પતિતપાવની મા ગંગાનો પૃથ્વી પર અવતરણ દિવસ.' },
  'nirjala-ekadashi': { guTitle: 'નિર્જળા એકાદશી (ભીમસેની અગિયારસ)', enDesc: 'Jyeshtha Shukla Ekadashi; supreme waterless fast bestowing fruit of all 24 Ekadashis.', guDesc: 'જેઠ સુદ અગિયારસ, બધી ૨૪ એકાદશીઓનું ફળ આપનારું મહાવ્રત.' },
  'jagannath-rath-yatra': { guTitle: 'જગન્નાથ રથયાત્રા', enDesc: 'Ashadha Shukla Dwitiya; grand chariot festival of Lord Jagannath, Balabhadra & Subhadra.', guDesc: 'અષાઢ સુદ બીજ, મહાપ્રભુ શ્રી જગન્નાથ, બલભદ્ર અને સુભદ્રાજીની ભવ્ય રથયાત્રા.' },
  'devshayani-ekadashi': { guTitle: 'દેવશયની એકાદશી (અષાઢી અગિયારસ)', enDesc: 'Ashadha Shukla Ekadashi marking Lord Vishnu’s cosmic rest and Chaturmas start.', guDesc: 'અષાઢ સુદ અગિયારસ, ભગવાન વિષ્ણુનું યોગનિદ્રા શયન અને ચાતુર્માસ પ્રારંભ.' },
  'guru-purnima': { guTitle: 'ગુરુ પૂર્ણિમા (વ્યાસ પૂર્ણિમા)', enDesc: 'Ashadha Purnima honoring Maharishi Ved Vyasa and spiritual teachers.', guDesc: 'અષાઢ પૂર્ણિમા, મહર્ષિ વેદવ્યાસ જયંતિ અને ગુરુજનોના પૂજનનો પાવન દિવસ.' },
  'hariyali-teej': { guTitle: 'હરિયાળી ત્રીજ', enDesc: 'Shravan Shukla Tritiya; Shiv-Parvati worship for marital bliss.', guDesc: 'શ્રાવણ સુદ ત્રીજ, શિવ-પાર્વતી પૂજન અને અખંડ સૌભાગ્યનું વ્રત.' },
  'nag-panchami': { guTitle: 'નાગ પંચમી', enDesc: 'Shravan Shukla Panchami dedicated to Serpent Deities and Kaal Sarp remedy.', guDesc: 'શ્રાવણ સુદ પાંચમ, નાગ દેવતાનું પૂજન અને કાલસર્પ દોષ નિવારણ.' },
  'raksha-bandhan': { guTitle: 'રક્ષાબંધન', enDesc: 'Shravan Purnima celebrating the sacred bond of protection between siblings.', guDesc: 'શ્રાવણ પૂર્ણિમા, ભાઈ-બહેનના પવિત્ર સ્નેહ અને રક્ષાસૂત્રનું મહાપર્વ.' },
  'krishna-janmashtami': { guTitle: 'શ્રીકૃષ્ણ જન્માષ્ટમી', enDesc: 'Bhadrapada Krishna Ashtami Nishita Kaal celebration of Lord Krishna’s birth.', guDesc: 'ભાદરવા વદ આઠમ, નિશીથ કાળમાં ભગવાન શ્રીકૃષ્ણનો પાવન પ્રાગટ્યોત્સવ.' },
  'hartalika-teej': { guTitle: 'હરતાલિકા ત્રીજ', enDesc: 'Bhadrapada Shukla Tritiya; strict fast worshipping Maa Parvati & Lord Shiva.', guDesc: 'ભાદરવા સુદ ત્રીજ, મા પાર્વતી અને શિવજીનું નિર્જળા સૌભાગ્ય વ્રત.' },
  'ganesh-chaturthi': { guTitle: 'ગણેશ ચતુર્થી', enDesc: 'Bhadrapada Shukla Chaturthi; birth & installation of Lord Ganesha.', guDesc: 'ભાદરવા સુદ ચોથ, વિઘ્નહર્તા શ્રી ગણેશજીનો જન્મોત્સવ અને સ્થાપના.' },
  'anant-chaturdashi': { guTitle: 'અનંત ચતુર્દશી (ગણેશ વિસર્જન)', enDesc: 'Bhadrapada Shukla Chaturdashi; Anant Vishnu puja and Ganesh Visarjan.', guDesc: 'ભાદરવા સુદ ચૌદસ, અનંત સ્વરૂપ વિષ્ણુ પૂજન અને ગણેશ વિસર્જન.' },
  'pitru-paksha-start': { guTitle: 'પિતૃ પક્ષ (શ્રાદ્ધ પક્ષ) પ્રારંભ', enDesc: '16-day sacred period of Tarpan and Shraddha honoring ancestors.', guDesc: 'પૂર્વજો પ્રત્યે કૃતજ્ઞતા, તર્પણ અને શ્રાદ્ધનો ૧૬ દિવસીય પવિત્ર કાળ.' },
  'sarva-pitru-amavasya': { guTitle: 'સર્વપિતૃ અમાસ', enDesc: 'Ashwin Amavasya; concluding Shraddha & Tarpan for all ancestors.', guDesc: 'આસો વદ અમાસ, સમસ્ત જ્ઞાત-અજ્ઞાત પિતૃઓના તર્પણ અને વિદાયનો પાવન દિવસ.' },
  'shardiya-navratri-start': { guTitle: 'શારદીય નવરાત્રિ ઘટસ્થાપના', enDesc: 'Ashwin Shukla Pratipada; Kalash Sthapana & 9-night Goddess Durga worship.', guDesc: 'આસો સુદ એકમ, ઘટસ્થાપના અને નવદુર્ગાની ભક્તિ-ઉપાસનાનો મહાપર્વ.' },
  'durga-ashtami': { guTitle: 'દુર્ગા મહાષ્ટમી', enDesc: 'Ashwin Shukla Ashtami; Maa Mahagauri worship, Kanya Puja & Sandhi Puja.', guDesc: 'આસો સુદ આઠમ, મા મહાગૌરી પૂજન, કન્યા પૂજન અને હવન.' },
  'maha-navami': { guTitle: 'મહાનવમી (સિદ્ધિદાત્રી પૂજન)', enDesc: 'Ashwin Shukla Navami; Maa Siddhidatri puja and Navratri Purnahuti.', guDesc: 'આસો સુદ નોમ, મા સિદ્ધિદાત્રી પૂજન અને નવરાત્રિ પૂર્ણાહુતિ.' },
  'dussehra': { guTitle: 'દશેરા / વિજયાદશમી', enDesc: 'Victory of Dharma over Adharma; Lord Rama’s triumph & Shastra Puja.', guDesc: 'અધર્મ પર ધર્મ અને શ્રી રામના વિજયનું મહાપર્વ, શસ્ત્ર અને અપરાજિતા પૂજન.' },
  'sharad-purnima': { guTitle: 'શરદ પૂર્ણિમા (કોજાગરી / રાસ પૂર્ણિમા)', enDesc: 'Ashwin Purnima; nectarous moonlight of 16 Kalas, kheer offering & Maa Lakshmi.', guDesc: 'આસો પૂર્ણિમા, ૧૬ કળાઓથી યુક્ત અમૃતમય ચંદ્રકિરણો અને દૂધ-પૌંઆનો ભોગ.' },
  'karwa-chauth': { guTitle: 'કરવા ચોથ', enDesc: 'Kartik Krishna Chaturthi; marital fast observed till Moonrise.', guDesc: 'કારતક વદ ચોથ, સૌભાગ્યવતી મહિલાઓ દ્વારા ચંદ્રોદય સુધી નિર્જળા વ્રત.' },
  'ahoi-ashtami': { guTitle: 'અહોઈ અષ્ટમી', enDesc: 'Kartik Krishna Ashtami; mothers’ fast for children’s longevity and well-being.', guDesc: 'કારતક વદ આઠમ, સંતાનોના દીર્ઘાયુ અને કલ્યાણ માટેનું માતૃ વ્રત.' },
  'dhanteras': { guTitle: 'ધનતેરસ (ધન્વંતરિ જયંતિ)', enDesc: 'Kartik Krishna Trayodashi; Lord Dhanvantari Jayanti, Kubera puja & Yama Deepdan.', guDesc: 'કારતક વદ તેરસ, આરોગ્યના દેવ ધન્વંતરિ જયંતિ, કુબેર પૂજન અને યમ દીપદાન.' },
  'narak-chaturdashi': { guTitle: 'કાળી ચૌદશ / રૂપ ચૌદશ', enDesc: 'Kartik Krishna Chaturdashi (Chhoti Diwali / Kali Chaudas).', guDesc: 'કારતક વદ ચૌદસ (કાળી ચૌદશ / રૂપ ચૌદશ).' },
  'diwali': { guTitle: 'દીપાવલી (મહાલક્ષ્મી પૂજન)', enDesc: 'Kartik Amavasya; Festival of Lights & evening Mahalakshmi-Ganesh worship.', guDesc: 'કારતક અમાસ, પ્રકાશનું મહાપર્વ અને મહાલક્ષ્મી-ગણેશ મહાપૂજન.' },
  'govardhan-puja': { guTitle: 'ગોવર્ધન પૂજા / બેસતું વર્ષ (અન્નકૂટ)', enDesc: 'Kartik Shukla Pratipada; Annakut Mahotsav & Govardhan worship.', guDesc: 'કારતક સુદ એકમ, અન્નકૂટ મહોત્સવ અને ગોવર્ધન પૂજન.' },
  'bhai-dooj': { guTitle: 'ભાઈ બીજ (યમ દ્વિતીયા)', enDesc: 'Kartik Shukla Dwitiya celebrating siblings’ bond and long life.', guDesc: 'કારતક સુદ બીજ, ભાઈ-બહેનના સ્નેહ અને દીર્ઘાયુ તિલકનું પર્વ.' },
  'chhath-puja': { guTitle: 'છઠ પૂજા (સૂર્ય ષષ્ઠી)', enDesc: 'Kartik Shukla Shashthi; 36-hour fast and Arghya to Surya Dev.', guDesc: 'કારતક સુદ છઠ, ભગવાન ભાસ્કર અને છઠી મૈયાનું મહાવ્રત અને અર્ઘ્ય.' },
  'dev-uthani-ekadashi': { guTitle: 'દેવઉઠની એકાદશી / તુલસી વિવાહ', enDesc: 'Kartik Shukla Ekadashi; Lord Vishnu’s awakening, Chaturmas end & Tulsi Vivah.', guDesc: 'કારતક સુદ અગિયારસ, શ્રી હરિ વિષ્ણુનું જાગરણ, ચાતુર્માસ સમાપન અને તુલસી વિવાહ.' },
  'kartik-purnima': { guTitle: 'કાર્તિક પૂર્ણિમા (દેવ દિવાળી)', enDesc: 'Kartik Purnima, Dev Diwali, sacred river bath & Deepdan.', guDesc: 'કારતક પૂર્ણિમા, દેવ દિવાળી, ત્રિપુરારી પૂર્ણિમા અને પવિત્ર દીપદાન.' },
  'gita-jayanti': { guTitle: 'ગીતા જયંતિ / મોક્ષદા એકાદશી', enDesc: 'Margashirsha Shukla Ekadashi celebrating Shrimad Bhagavad Gita discourse.', guDesc: 'માગશર સુદ અગિયારસ, શ્રીમદ્ ભગવદ્ ગીતા ઉપદેશ અને મોક્ષદા એકાદશી.' },
  'paush-purnima': { guTitle: 'પોષ પૂર્ણિમા', enDesc: 'Pausha Purnima marking Magh Mela bathing and charity.', guDesc: 'પોષ પૂર્ણિમા, માઘ મેળા સ્નાન અને પવિત્ર દાનનું પર્વ.' },
};

export function getLocalizedFestival(
  fest: FestivalItem,
  lang: string = 'hi'
): { title: string; type: string; description: string } {
  const c = (lang || 'hi').slice(0, 2).toLowerCase();
  if (c === 'hi') {
    return {
      title: fest.hindiName || fest.name,
      type: fest.type || '',
      description: fest.description || '',
    };
  }
  const key = fest.id.replace(/^fest-\d{4}-/, '');
  const meta = FESTIVAL_META_LOC[key];
  const typeMapEn: Record<string, string> = {
    'पर्व': 'Festival',
    'व्रत': 'Vrat',
    'एकादशी': 'Ekadashi',
    'अमावस्या': 'Amavasya',
    'पूर्णिमा': 'Purnima',
  };
  const typeMapGu: Record<string, string> = {
    'पर्व': 'પર્વ',
    'व्रत': 'વ્રત',
    'एकादशी': 'એકાદશી',
    'अमावस्या': 'અમાસ',
    'पूर्णिमा': 'પૂર્ણિમા',
  };
  if (c === 'en') {
    return {
      title: fest.name,
      type: typeMapEn[fest.type || ''] || fest.type || '',
      description: meta?.enDesc || fest.description || '',
    };
  }
  return {
    title: meta?.guTitle || fest.hindiName || fest.name,
    type: typeMapGu[fest.type || ''] || fest.type || '',
    description: meta?.guDesc || fest.description || '',
  };
}

