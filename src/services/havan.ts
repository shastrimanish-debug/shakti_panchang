import { VedicPanchangData } from '../types';
import { getDayChoghadiya, getAuspiciousWindows, getInauspiciousWindows } from './choghadiya';
import { formatPlaceTime } from './engine/time';
import { trVedic } from '../i18n/vedicTranslate';

export type AgnivasaResidence = 'prithvi' | 'akasha' | 'patala';

export interface AgnivasaResult {
  residence: AgnivasaResidence;
  isAuspicious: boolean;
  tithi30: number;
  weekday1to7: number;
  sumTotal: number;
  remainder: number;
  title: string;
  badgeText: string;
  shastricVerse: string;
  fruitDescription: string;
  practicalGuidance: string;
  nityaExceptionNote: string;
  formulaDisplay: string;
}

export interface WeekdayHavanGuide {
  weekdayIndex: number;
  deity: string;
  planet: string;
  samidha: string;
  samagri: string;
  ahutiOilOrGhee: string;
  benefit: string;
  varaMantra: string;
}

export interface HavanMantraItem {
  id: string;
  deity: string;
  focusTag: string;
  sanskrit: string;
  transliteration: string;
  meaning: string;
  recommendedCount: number;
}

export interface HavanVidhiStep {
  step: number;
  title: string;
  instruction: string;
  mantra?: string;
}

export interface HavanTimingSummary {
  bestWindowLabel: string;
  bestWindowTime: string;
  avoidLabel: string;
  avoidTime: string;
}

function getLang(lang?: string): 'hi' | 'en' | 'gu' {
  const c = (lang || 'hi').slice(0, 2).toLowerCase();
  if (c === 'en') return 'en';
  if (c === 'gu') return 'gu';
  return 'hi';
}

function toDevanagariDigits(val: number | string): string {
  const map = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
  return String(val).replace(/\d/g, (d) => map[Number(d)] ?? d);
}

function toGujaratiDigits(val: number | string): string {
  const map = ['૦', '૧', '૨', '૩', '૪', '૫', '૬', '૭', '૮', '૯'];
  return String(val).replace(/\d/g, (d) => map[Number(d)] ?? d);
}

/**
 * Classical Vedic Agnivasa Calculation (Muhurat Chintamani / Nirnaya Sindhu):
 *   Total = Continuous Lunar Tithi (1..30; Shukla 1-15, Krishna 16-30)
 *         + Weekday (Sunday = 1 .. Saturday = 7)
 *         + 1
 *   Remainder = Total % 4:
 *     - 0 or 3 => Prithvi (Earth)  -> Shubh / Kalyanakari (Auspicious for Havan)
 *     - 1      => Akasha (Sky)     -> Ashubh / Prananashaka (Avoid Kamya Havan)
 *     - 2      => Patala (Nether)  -> Ashubh / Dhananashaka (Avoid Kamya Havan)
 */
export function calculateAgnivasa(
  panchang: VedicPanchangData,
  lang: string = 'hi'
): AgnivasaResult {
  const c = getLang(lang);
  const L = <T,>(hi: T, en: T, gu: T): T => (c === 'en' ? en : c === 'gu' ? gu : hi);

  const rawTithi = Math.max(1, Math.min(30, panchang.tithiNumber || 1));
  const isKrishna = (panchang.paksha || '').includes('कृष्ण');
  const tithi30 = rawTithi <= 15 && isKrishna ? rawTithi + 15 : rawTithi;
  const weekday1to7 = (panchang.date.getDay() % 7) + 1; // Sun=1 .. Sat=7
  const sumTotal = tithi30 + weekday1to7 + 1;
  const remainder = sumTotal % 4;

  const isPrithvi = remainder === 0 || remainder === 3;
  const residence: AgnivasaResidence = isPrithvi
    ? 'prithvi'
    : remainder === 1
      ? 'akasha'
      : 'patala';

  const fmtNum = (n: number) =>
    c === 'en' ? String(n) : c === 'gu' ? toGujaratiDigits(n) : toDevanagariDigits(n);

  const formulaDisplay = L(
    `(${fmtNum(tithi30)} + ${fmtNum(weekday1to7)} + १) ÷ ४ → शेष ${fmtNum(remainder)}`,
    `(${tithi30} + ${weekday1to7} + 1) ÷ 4 → Remainder ${remainder}`,
    `(${fmtNum(tithi30)} + ${fmtNum(weekday1to7)} + ૧) ÷ ૪ → શેષ ${fmtNum(remainder)}`
  );

  const shastricVerse =
    'तिथिं च वारसहितां कृत्वा वै वेदभाजिताम् । शून्ये च वेदावशिष्टे पृथिव्यामग्निवासरः ॥';

  const nityaExceptionNote = L(
    'नित्य देवयज्ञ (पाँच दैनिक घृताहुति), नवरात्रि हवन, ग्रहण तथा गुरु-निर्दिष्ट नित्य साधना में अग्निवास दोष नहीं लगता।',
    'Daily obligatory Agnihotra (5 simple ghee ahutis), Navaratri havan, eclipse rituals & daily devayagya are exempt from Agnivasa restrictions.',
    'નિત્ય દેવયજ્ઞ (૫ દૈનિક ઘૃતાહુતિ), નવરાત્રિ હવન, ગ્રહણ તથા ગુરુ-નિર્દિષ્ટ નિત્ય સાધનામાં અગ્નિવાસ દોષ લાગતો નથી.'
  );

  if (residence === 'prithvi') {
    return {
      residence,
      isAuspicious: true,
      tithi30,
      weekday1to7,
      sumTotal,
      remainder,
      title: L(
        'पृथ्वी पर अग्निवास — हवन अत्यंत शुभ',
        'Agnivasa on Earth — Havan is Auspicious',
        'પૃથ્વી પર અગ્નિવાસ — હવન અત્યંત શુભ'
      ),
      badgeText: L('पृथ्वी वास · शुभ', 'Prithvi · Auspicious', 'પૃથ્વી વાસ · શુભ'),
      shastricVerse,
      fruitDescription: L(
        'आज अग्निदेव का वास पृथ्वी लोक में है। शास्त्रों के अनुसार पृथ्वी स्थित अग्नि में आहुति देने से आरोग्य, गृह-शांति, सुख-सौभाग्य एवं सर्वसिद्धि प्राप्त होती है।',
        'Today Agni resides on Earth (Prithvi). Offerings into sacred fire today bestow peace, vitality, domestic harmony and spiritual fulfillment.',
        'આજે અગ્નિદેવનો વાસ પૃથ્વી લોકમાં છે. શાસ્ત્ર અનુસાર પૃથ્વી પર અગ્નિવાસમાં હવન કરવાથી આરોગ્ય, ગૃહ-શાંતિ અને સુખ-સૌભાગ્યની પ્રાપ્તિ થાય છે.'
      ),
      practicalGuidance: L(
        'गृह-शांति, नवग्रह हवन, गायत्री यज्ञ, वास्तु हवन व काम्य अनुष्ठान आज निश्चिंत होकर संपन्न किए जा सकते हैं।',
        'Ideal day for Griha Shanti, Gayatri Yagya, Navagraha Havan, Vastu purification, and sankalpa rituals.',
        'ગૃહ-શાંતિ, નવગ્રહ હવન, ગાયત્રી યજ્ઞ, વાસ્તુ હવન અને કામ્ય અનુષ્ઠાન આજે નિશ્ચિંતપણે કરી શકાય છે.'
      ),
      nityaExceptionNote,
      formulaDisplay,
    };
  }

  if (residence === 'akasha') {
    return {
      residence,
      isAuspicious: false,
      tithi30,
      weekday1to7,
      sumTotal,
      remainder,
      title: L(
        'आकाश में अग्निवास — काम्य हवन वर्जित',
        'Agnivasa in Sky — Avoid Special Havan',
        'આકાશમાં અગ્નિવાસ — કામ્ય હવન વર્જિત'
      ),
      badgeText: L('आकाश वास · वर्जित', 'Akasha · Avoid', 'આકાશ વાસ · વર્જિત'),
      shastricVerse,
      fruitDescription: L(
        'आज अग्निवास आकाश (स्वर्ग/शून्य) में होने से विशेष काम्य हवन या नवीन यज्ञ अनुष्ठान वर्जित माना जाता है; शास्त्रीय मत से यह प्राण-तेज का क्षय करता है।',
        'Agni resides in the Sky (Akasha) today. Special wish-fulfilling (Kamya) Havans or new fire ceremonies should be deferred to a Prithvi Agnivasa day.',
        'આજે અગ્નિવાસ આકાશમાં હોવાથી વિશેષ કામ્ય હવન કે નવું યજ્ઞ અનુષ્ઠાન ટાળવું જોઈએ.'
      ),
      practicalGuidance: L(
        'आज नवीन काम्य हवन टालें। इसके स्थान पर धूप-दीप आरती, गायत्री जप या केवल ५ सात्विक नित्य घृताहुति की जा सकती है।',
        'Defer major Kamya Havan today. Perform calm lamp/incense worship, mantra japa, or light 5 daily nitya ghee ahutis.',
        'આજે વિશેષ કામ્ય હવન ટાળો. તેના બદલે ધૂપ-દીપ આરતી, મંત્ર જાપ કે ૫ સાત્વિક નિત્ય ઘૃતાહુતિ કરી શકાય છે.'
      ),
      nityaExceptionNote,
      formulaDisplay,
    };
  }

  return {
    residence,
    isAuspicious: false,
    tithi30,
    weekday1to7,
    sumTotal,
    remainder,
    title: L(
      'पाताल में अग्निवास — काम्य हवन वर्जित',
      'Agnivasa in Patala — Avoid Special Havan',
      'પાતાળમાં અગ્નિવાસ — કામ્ય હવન વર્જિત'
    ),
    badgeText: L('पाताल वास · वर्जित', 'Patala · Avoid', 'પાતાળ વાસ · વર્જિત'),
    shastricVerse,
    fruitDescription: L(
      'आज अग्नि का वास पाताल लोक में है। मुहूर्त शास्त्र के अनुसार पाताल अग्निवास में काम्य हवन करने से अर्थ-हानि या श्रम की निष्फलता की आशंका रहती है।',
      'Agni resides in the Netherworld (Patala) today. Performing wish-fulfilling Havans today is traditionally avoided as it is considered unproductive for wealth.',
      'આજે અગ્નિનો વાસ પાતાળ લોકમાં છે. મુહૂર્ત શાસ્ત્ર મુજબ આ દિવસે કામ્ય હવન કરવાથી ધન-હાનિ કે શ્રમની નિષ્ફળતાની આશંકા રહે છે.'
    ),
    practicalGuidance: L(
      'बड़े हवन व प्रतिष्ठान यज्ञ अगले पृथ्वी-अग्निवास दिन पर करें। आज कर्पूर व गुग्गुल धूप, स्तोत्र पाठ एवं नित्य संध्या पूजन श्रेष्ठ है।',
      'Postpone major ceremonies to the next Prithvi Agnivasa day. Offer camphor & guggul incense, stotra recitation, and daily prayers.',
      'મોટા હવન અને યજ્ઞ આગામી પૃથ્વી અગ્નિવાસના દિવસે કરો. આજે કપૂર અને ગૂગળ ધૂપ તથા સ્તોત્ર પાઠ ઉત્તમ છે.'
    ),
    nityaExceptionNote,
    formulaDisplay,
  };
}

export function getDailyHavanGuide(
  panchang: VedicPanchangData,
  lang: string = 'hi'
): WeekdayHavanGuide {
  const c = getLang(lang);
  const L = <T,>(hi: T, en: T, gu: T): T => (c === 'en' ? en : c === 'gu' ? gu : hi);
  const day = panchang.date.getDay();

  const guides: Record<number, WeekdayHavanGuide> = {
    0: {
      weekdayIndex: 0,
      deity: L('भगवान सूर्यनारायण व गायत्री माता', 'Lord Surya & Goddess Gayatri', 'ભગવાન સૂર્યનારાયણ અને ગાયત્રી માતા'),
      planet: L('सूर्य (रविवार)', 'Sun (Sunday)', 'સૂર્ય (રવિવાર)'),
      samidha: L('अर्क (मदार), आम या बेल की सूखी समिधा', 'Arka (Calotropis), Mango or Bel wood', 'આંકડો (અર્ક), આંબો કે બીલીની સમિધા'),
      samagri: L('लाल चंदन चूर्ण, गुड़, गेहूँ दाने, कर्पूर व शुद्ध गाय का घी', 'Red sandalwood powder, jaggery, wheat grains, camphor & cow ghee', 'લાલ ચંદન, ગોળ, ઘઉં, કપૂર અને શુદ્ધ ગાયનું ઘી'),
      ahutiOilOrGhee: L('शुद्ध देसी गाय का घी', 'Pure Deshi Cow Ghee', 'શુદ્ધ દેશી ગાયનું ઘી'),
      benefit: L('आत्मबल, नेत्र-आरोग्य, यश-तेज व पित्त-शांति प्रदान करता है।', 'Bestows vitality, confidence, leadership clarity and eye/heart wellness.', 'આત્મબળ, આરોગ્ય, તેજ અને યશ-કીર્તિ પ્રદાન કરે છે.'),
      varaMantra: 'ॐ ह्रीं सूर्याय नमः इदं सूर्याय न मम स्वाहा॥',
    },
    1: {
      weekdayIndex: 1,
      deity: L('भगवान शिव (महामृत्युंजय) व चंद्रदेव', 'Lord Shiva & Chandra Dev', 'ભગવાન શિવ અને ચંદ્રદેવ'),
      samidha: L('पलाश (ढाक) अथवा आम व चंदन की समिधा', 'Palasha (Flame of Forest) or Sandalwood', 'ખાખરો (પલાશ) અથવા આંબો અને ચંદન સમિધા'),
      planet: L('चन्द्रमा (सोमवार)', 'Moon (Monday)', 'ચંદ્ર (સોમવાર)'),
      samagri: L('सफेद तिल, खीर या मिश्री, अक्षत (साबुत चावल), कर्पूर व गुग्गुल', 'White sesame seeds, rock sugar, whole unbroken rice, camphor & guggul', 'સફેદ તલ, સાકર, અખંડ ચોખા, કપૂર અને ગૂગળ'),
      ahutiOilOrGhee: L('गौघृत व किंचित् मधुर खीर/मिश्री', 'Cow ghee with sweet unbroken rice/sugar', 'ગાયનું ઘી અને સાકર/ખીર'),
      benefit: L('मानसिक शांति, पारिवारिक स्नेह, शीतलता व चंद्र-बल में वृद्धि।', 'Calms the mind, removes anxiety, nurtures domestic peace and emotional steadiness.', 'માનસિક શાંતિ, પરિવારમાં સ્નેહ અને ચંદ્ર બળમાં વૃદ્ધિ થાય છે.'),
      varaMantra: 'ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम् उर्वारुकमिव बन्धनान्मृत्योर्मुक्षीय मामृतात् स्वाहा॥',
    },
    2: {
      weekdayIndex: 2,
      deity: L('श्री हनुमान जी व मंगलदेव', 'Sri Hanuman & Mangala Dev', 'શ્રી હનુમાનજી અને મંગળદેવ'),
      samidha: L('खदिर (कत्था), नीम अथवा आम की समिधा', 'Khadira (Acacia catechu) or Neem wood', 'ખેર (ખદીર), લીમડો અથવા આંબાની સમિધા'),
      planet: L('मंगल (मंगलवार)', 'Mars (Tuesday)', 'મંગળ (મંગળવાર)'),
      samagri: L('लाल पुष्प गुग्गुल, जौ, काले-सफेद तिल, गुड़ व शुद्ध गौघृत', 'Guggul, barley, sesame seeds, jaggery & cow ghee', 'ગૂગળ, જવ, તલ, ગોળ અને શુદ્ધ ગાયનું ઘી'),
      ahutiOilOrGhee: L('शुद्ध गाय का घी', 'Pure Cow Ghee', 'શુદ્ધ ગાયનું ઘી'),
      benefit: L('ऋण-बाधा निवारण, साहस, गृह रक्षा एवं मंगल दोष शांति।', 'Protects the household, builds courage, and pacifies Mars imbalances.', 'ઋણ-બાધા નિવારણ, સાહસ, ગૃહ રક્ષા અને મંગળ દોષ શાંતિ.'),
      varaMantra: 'ॐ हं हनुमते रुद्रात्मकाय हुं फट् स्वाहा॥',
    },
    3: {
      weekdayIndex: 3,
      deity: L('श्री गणेश जी व भगवान नारायण', 'Lord Ganesha & Sri Narayana', 'શ્રી ગણેશજી અને ભગવાન નારાયણ'),
      samidha: L('अपामार्ग (चिरचिटा), दूर्वा मिश्रित या आम की समिधा', 'Apamarga (Prickly Chaff Flower) or Mango wood', 'અપામાર્ગ (અઘેડો), દૂર્વા મિશ્રિત કે આંબાની સમિધા'),
      planet: L('बुध (बुधवार)', 'Mercury (Wednesday)', 'બુધ (બુધવાર)'),
      samagri: L('हरी इलायची, दूर्वा चूर्ण, जौ, तिल, शहद व गौघृत', 'Green cardamom, barley, sesame, honey drops & cow ghee', 'લીલી એલચી, દૂર્વા, જવ, તલ, મધ અને ગાયનું ઘી'),
      ahutiOilOrGhee: L('गौघृत व किंचित् मधु', 'Cow Ghee with a touch of honey', 'ગાયનું ઘી અને મધ'),
      benefit: L('बुद्धि-विवेक, वाणी मधुरता, विद्या एवं व्यापार सिद्धि।', 'Sharpens intellect, clarity of speech, learning and business harmony.', 'બુદ્ધિ-વિવેક, વાણીની મધુરતા, વિદ્યા અને વેપાર સિદ્ધિ.'),
      varaMantra: 'ॐ गं गणपतये नमः इदं गणपतये न मम स्वाहा॥',
    },
    4: {
      weekdayIndex: 4,
      deity: L('बृहस्पतिदेव, इष्टगुरु व भगवान विष्णु', 'Guru Brihaspati & Lord Vishnu', 'ગુરુ બૃહસ્પતિ અને ભગવાન વિષ્ણુ'),
      samidha: L('पीपल (अश्वत्थ) अथवा आम की पवित्र समिधा', 'Peepal (Ashwattha) or Sacred Mango wood', 'પીપળો (અશ્વત્થ) અથવા આંબાની પવિત્ર સમિધા'),
      planet: L('गुरु / बृहस्पति (गुरुवार)', 'Jupiter (Thursday)', 'ગુરુ / બૃહસ્પતિ (ગુરુવાર)'),
      samagri: L('हल्दी मिश्रित अक्षत, चना दाल चूर्ण, केसर, जौ, तिल व गौघृत', 'Saffron/turmeric rice, barley, sesame, yellow flowers & cow ghee', 'હળદર-કેસર, જવ, તલ, પીળા પુષ્પ અને ગાયનું ઘી'),
      ahutiOilOrGhee: L('शुद्ध गाय का घी', 'Pure Cow Ghee', 'શુદ્ધ ગાયનું ઘી'),
      benefit: L('ज्ञान, सौभाग्य, संतान सुख, गुरु कृपा एवं धर्म-वृद्धि।', 'Attracts wisdom, fortune, auspiciousness and divine grace.', 'જ્ઞાન, સૌભાગ્ય, સંતાન સુખ અને ગુરુ કૃપા પ્રાપ્ત થાય છે.'),
      varaMantra: 'ॐ नमो भगवते वासुदेवाय इदं विष्णवे न मम स्वाहा॥',
    },
    5: {
      weekdayIndex: 5,
      deity: L('माँ दुर्गा, माँ लक्ष्मी एवं शुक्रदेव', 'Goddess Durga, Mahalakshmi & Shukra', 'મા દુર્ગા, મહાલક્ષ્મી અને શુક્રદેવ'),
      samidha: L('गूलर (उदुम्बर), चंदन अथवा आम की समिधा', 'Udumbara (Cluster Fig) or Sandalwood', 'ઉંબરો (ઉદુંબર), ચંદન કે આંબાની સમિધા'),
      planet: L('शुक्र (शुक्रवार)', 'Venus (Friday)', 'શુક્ર (શુક્રવાર)'),
      samagri: L('कमलगट्टा चूर्ण, मिश्री, सफेद तिल, गुलाब पंखुड़ी, कर्पूर व गौघृत', 'Lotus seed powder, rock sugar, white sesame, rose petals & cow ghee', 'કમળકાકડી, સાકર, સફેદ તલ, ગુલાબ પાંદડી અને ગાયનું ઘી'),
      ahutiOilOrGhee: L('सुगंधित गौघृत व मिश्री', 'Fragrant Cow Ghee with crystal sugar', 'સુગંધિત ગાયનું ઘી અને સાકર'),
      benefit: L('धन-धान्य, लक्ष्मी कृपा, दाम्पत्य माधुर्य एवं नकारात्मक ऊर्जा निवारण।', 'Invites abundance, marital harmony, grace and home purification.', 'ધન-ધાન્ય, લક્ષ્મી કૃપા, દાંપત્ય માધુર્ય અને નકારાત્મક ઊર્જા નાશ.'),
      varaMantra: 'ॐ ऐं ह्रीं क्लीं चामुण्डायै विच्चे स्वाहा॥',
    },
    6: {
      weekdayIndex: 6,
      deity: L('भगवान भैरव, हनुमान जी व शनिदेव', 'Lord Bhairava, Hanuman & Shani Dev', 'ભગવાન ભૈરવ, હનુમાનજી અને શનિદેવ'),
      samidha: L('शमी वृक्ष की पवित्र समिधा अथवा आम की लकड़ी', 'Shami wood (Prosopis cineraria) or Mango wood', 'શમી (ખીજડો) અથવા આંબાની પવિત્ર સમિધા'),
      planet: L('शनि (शनिवार)', 'Saturn (Saturday)', 'શનિ (શનિવાર)'),
      samagri: L('काले तिल, जौ, गुग्गुल, लौंग जोड़ा, बताशा व गौघृत', 'Black sesame, barley, guggul, whole cloves & cow ghee', 'કાળા તલ, જવ, ગૂગળ, લવિંગ, પતાશા અને ગાયનું ઘી'),
      ahutiOilOrGhee: L('गौघृत (काले तिल सहित)', 'Cow Ghee with black sesame seeds', 'ગાયનું ઘી (કાળા તલ સાથે)'),
      benefit: L('साढ़े साती व ढैया कष्ट शांति, वास्तु दोष व भूत-बाधा निवारण।', 'Pacifies Shani Sade Sati/Dhaiya stress and clears stagnant home energy.', 'સાડાસાતી અને ઢૈયા કષ્ટ શાંતિ તથા ગૃહ વાતાવરણ શુદ્ધિ.'),
      varaMantra: 'ॐ शं शनैश्चराय नमः इदं शनैश्चराय न मम स्वाहा॥',
    },
  };

  return guides[day] || guides[0];
}

export function getBestHavanTiming(
  panchang: VedicPanchangData,
  lang: string = 'hi'
): HavanTimingSummary {
  const c = getLang(lang);
  const L = <T,>(hi: T, en: T, gu: T): T => (c === 'en' ? en : c === 'gu' ? gu : hi);
  const fmt = (d: Date) => formatPlaceTime(d);
  const weekday = panchang.date.getDay();

  const auspicious = getAuspiciousWindows(panchang.solar);
  const choghadiyas = getDayChoghadiya(panchang.solar, weekday);
  const inauspicious = getInauspiciousWindows(panchang.solar, weekday);

  const abhijit = weekday !== 3 ? auspicious.find((w) => w.title === 'अभिजित मुहूर्त') : undefined;
  const bestChog = choghadiyas.find((ch) => ch.name === 'Amrit' || ch.name === 'Shubh');
  const rahu = inauspicious.find((w) => w.title === 'राहु काल');

  let bestWindowLabel = L('प्रातः स्नात वेला (सूर्योदय के बाद)', 'Morning Sacred Hour (Post-Sunrise)', 'સવારનો પવિત્ર સમય (સૂર્યોદય પછી)');
  let bestWindowTime = `${fmt(panchang.solar.sunrise)} – ${fmt(new Date(panchang.solar.sunrise.getTime() + 90 * 60000))}`;

  if (abhijit) {
    bestWindowLabel = L('अभिजित मुहूर्त (सर्वोत्तम)', 'Abhijit Muhurat (Supreme)', 'અભિજિત મુહૂર્ત (સર્વોત્તમ)');
    bestWindowTime = `${fmt(abhijit.start)} – ${fmt(abhijit.end)}`;
  } else if (bestChog) {
    bestWindowLabel = `${trVedic(bestChog.hindiName, c)} ${L('चौघड़िया', 'Choghadiya', 'ચોઘડિયું')}`;
    bestWindowTime = `${fmt(bestChog.start)} – ${fmt(bestChog.end)}`;
  }

  return {
    bestWindowLabel,
    bestWindowTime,
    avoidLabel: L('राहु काल (हवन प्रारंभ टालें)', 'Rahu Kaal (Avoid starting)', 'રાહુકાળ (હવન આરંભ ટાળો)'),
    avoidTime: rahu ? `${fmt(rahu.start)} – ${fmt(rahu.end)}` : '—',
  };
}

export function getNityaHavanMantras(lang: string = 'hi'): HavanMantraItem[] {
  const c = getLang(lang);
  const L = <T,>(hi: T, en: T, gu: T): T => (c === 'en' ? en : c === 'gu' ? gu : hi);

  return [
    {
      id: 'ganesh',
      deity: L('प्रथम आहुति — श्री गणेश', '1st Offering — Lord Ganesha', 'પ્રથમ આહુતિ — શ્રી ગણેશ'),
      focusTag: L('विघ्ननाश', 'Obstacle Removal', 'વિઘ્નનાશ'),
      sanskrit: 'ॐ गं गणपतये नमः इदं गणपतये इदं न मम स्वाहा॥',
      transliteration: 'Om Gam Ganapataye Namah Idam Ganapataye Idam Na Mama Swaha',
      meaning: L(
        'समस्त विघ्नों के निवारण एवं शुभ कार्य की निर्विघ्न सिद्धि हेतु प्रथम आहुति।',
        'Opening oblation invoking Lord Ganesha to remove all obstacles.',
        'સમસ્ત વિઘ્નોના નિવારણ અને શુભ સિદ્ધિ માટે પ્રથમ આહુતિ.'
      ),
      recommendedCount: 3,
    },
    {
      id: 'agni',
      deity: L('अग्निदेव एवं प्रजापति', 'Agni Dev & Prajapati', 'અગ્નિદેવ અને પ્રજાપતિ'),
      focusTag: L('अग्नि प्रतिष्ठा', 'Sacred Fire', 'અગ્નિ પ્રતિષ્ઠા'),
      sanskrit: 'ॐ भूर्भुवः स्वः अग्नये इदमग्नये इदं न मम स्वाहा॥',
      transliteration: 'Om Bhur Bhuvah Swah Agnaye Idam Agnaye Idam Na Mama Swaha',
      meaning: L(
        'पवित्र अग्नि में देवताओं तक हविष्य पहुँचाने वाले अग्निदेव को समर्पित आहुति।',
        'Sacred ghee offering to Agni Dev who carries oblations to all cosmic forces.',
        'પવિત્ર અગ્નિ દ્વારા દેવતાઓ સુધી હવિષ્ય પહોંચાડનાર અગ્નિદેવને આહુતિ.'
      ),
      recommendedCount: 3,
    },
    {
      id: 'gayatri',
      deity: L('वेदमाता गायत्री महामन्त्र', 'Vedamata Gayatri Mahamantra', 'વેદમાતા ગાયત્રી મહામંત્ર'),
      focusTag: L('सद्बुद्धि व तेज', 'Wisdom & Light', 'સદ્બુદ્ધિ અને તેજ'),
      sanskrit: 'ॐ भूर्भुवः स्वः तत्सवितुर्वरेण्यं भर्गो देवस्य धीमहि धियो यो नः प्रचोदयात् स्वाहा॥',
      transliteration: 'Om Bhur Bhuvah Swah Tat Savitur Varenyam Bhargo Devasya Dhimahi Dhiyo Yo Nah Prachodayat Swaha',
      meaning: L(
        'सविता देव के पावन तेज से सद्बुद्धि व आध्यात्मिक प्रकाश की प्रार्थना।',
        'Universal Vedic prayer seeking divine illumination and clarity of intellect.',
        'સવિતા દેવના પાવન તેજથી સદ્બુદ્ધિ અને આધ્યાત્મિક પ્રકાશની પ્રાર્થના.'
      ),
      recommendedCount: 11,
    },
    {
      id: 'mahamrityunjaya',
      deity: L('भगवान शिव — महामृत्युंजय', 'Lord Shiva — Mahamrityunjaya', 'ભગવાન શિવ — મહામૃત્યુંજય'),
      focusTag: L('आरोग्य व रक्षा', 'Health & Protection', 'આરોગ્ય અને રક્ષા'),
      sanskrit: 'ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम् उर्वारुकमिव बन्धनान्मृत्योर्मुक्षीय मामृतात् स्वाहा॥',
      transliteration: 'Om Tryambakam Yajamahe Sugandhim Pushtivardhanam Urvarukamiva Bandhanan Mrityor Mukshiya Mamritat Swaha',
      meaning: L(
        'दीर्घायु, रोग-निवारण एवं संपूर्ण परिवार के अभय व स्वास्थ्य रक्षा हेतु।',
        'For healing, vitality, longevity, and freedom from fear or illness.',
        'દીર્ઘાયુ, રોગ-નિવારણ તથા પરિવારના સ્વાસ્થ્ય અને રક્ષા માટે.'
      ),
      recommendedCount: 5,
    },
    {
      id: 'navarna_devi',
      deity: L('माँ दुर्गा — सर्वमंगल', 'Goddess Durga — Sarva Mangala', 'મા દુર્ગા — સર્વમંગળ'),
      focusTag: L('शक्ति व कल्याण', 'Grace & Strength', 'શક્તિ અને કલ્યાણ'),
      sanskrit: 'ॐ सर्वमङ्गलमाङ्गल्ये शिवे सर्वार्थसाधिके शरण्ये त्र्यम्बके गौरि नारायणि नमोऽस्तु ते स्वाहा॥',
      transliteration: 'Om Sarva Mangala Mangalye Shive Sarvartha Sadhike Sharanye Tryambake Gauri Narayani Namostute Swaha',
      meaning: L(
        'घर की नकारात्मक ऊर्जा शुद्धि, सुख-समृद्धि एवं भगवती कृपा प्राप्ति हेतु।',
        'Invoking auspiciousness, protection, and abundance from Divine Mother Durga.',
        'ઘરની નકારાત્મક ઊર્જા શુદ્ધિ અને ભગવતીની કૃપા પ્રાપ્તિ માટે.'
      ),
      recommendedCount: 5,
    },
    {
      id: 'navagraha',
      deity: L('नवग्रह शान्ति आहुति', 'Navagraha Peace Offering', 'નવગ્રહ શાંતિ આહુતિ'),
      focusTag: L('ग्रह-दोष शान्ति', 'Planetary Peace', 'ગ્રહ-દોષ શાંતિ'),
      sanskrit: 'ॐ ब्रह्मामुरारिस्त्रिपुरान्तकारी भानुः शशी भूमिसुतो बुधश्च गुरुश्च शुक्रः शनिराहुकेतवः सर्वे ग्रहाः शान्तिकरा भवन्तु स्वाहा॥',
      transliteration: 'Om Brahma Muraris Tripurantakari Bhanuh Shashi Bhumisuto Budhashcha Gurushcha Shukrah Shani Rahu Ketavah Sarve Grahah Shantikara Bhavantu Swaha',
      meaning: L(
        'नौ ग्रहों के सम्यक् संतुलन व गोचर-दशा की प्रतिकूलता दूर करने की संयुक्त आहुति।',
        'Collective oblation seeking harmony and peace from all nine planetary forces.',
        'નવગ્રહોના સંતુલન અને ગોચર-દશાની પ્રતિકૂળતા દૂર કરવાની સંયુક્ત આહુતિ.'
      ),
      recommendedCount: 3,
    },
    {
      id: 'purnahuti',
      deity: L('पूर्णाहुति एवं शान्ति', 'Purnahuti (Final Offering)', 'પૂર્ણાહુતિ અને શાંતિ'),
      focusTag: L('यज्ञ पूर्णता', 'Completion', 'યજ્ઞ પૂર્ણતા'),
      sanskrit: 'ॐ पूर्णमदः पूर्णमिदं पूर्णात्पूर्णमुदच्यते पूर्णस्य पूर्णमादाय पूर्णमेवावशिष्यते स्वाहा॥',
      transliteration: 'Om Purnamadah Purnamidam Purnat Purnamudachyate Purnasya Purnamadaya Purnamevavashishyate Swaha',
      meaning: L(
        'यज्ञ की संपूर्णता के लिए नारियल गोला/सुपारी एवं घी धार से अंतिम पूर्णाहुति।',
        'Final complete oblation dedicating all virtues of the Havan to the Supreme.',
        'યજ્ઞની પૂર્ણતા માટે શ્રીફળ/સોપારી અને ઘીની અંતિમ પૂર્ણાહુતિ.'
      ),
      recommendedCount: 1,
    },
  ];
}

export function getNityaHavanSteps(lang: string = 'hi'): HavanVidhiStep[] {
  const c = getLang(lang);
  const L = <T,>(hi: T, en: T, gu: T): T => (c === 'en' ? en : c === 'gu' ? gu : hi);

  return [
    {
      step: 1,
      title: L('१. स्नान, आसन व पवित्रीकरण', '1. Purification & Sacred Posture', '૧. સ્નાન, આસન અને પવિત્રીકરણ'),
      instruction: L(
        'पूर्व या उत्तर मुख होकर स्वच्छ आसन पर बैठें। तांबे के पात्र में जल, आम/तांबे का कुण्ड, शुद्ध गाय का घी, हवन सामग्री और कर्पूर पास रखें। तीन बार आचमन करें।',
        'Sit facing East or North on a clean mat. Keep a copper havan kund, cow ghee, camphor, samidha wood and havan samagri ready. Sip water three times (Achamana).',
        'પૂર્વ કે ઉત્તર મુખ રાખી પવિત્ર આસન પર બેસો. તાંબાનો હવન કુંડ, ગાયનું ઘી, હવન સામગ્રી અને કપૂર સાથે રાખો.'
      ),
      mantra: 'ॐ अपवित्रः पवित्रो वा सर्वावस्थां गतोऽपि वा । यः स्मरेत्पुण्डरीकाक्षं स बाह्याभ्यन्तरः शुचिः ॥',
    },
    {
      step: 2,
      title: L('२. पञ्चाङ्ग संकल्प एवं अग्नि प्रज्वलन', '2. Panchang Sankalpa & Kindling Fire', '૨. પંચાંગ સંકલ્પ અને અગ્નિ પ્રજ્વલન'),
      instruction: L(
        'दाहिने हाथ में जल-अक्षत लेकर आज की तिथि, वार, नक्षत्र व अपने गोत्र-नाम का संकल्प लें। हवन कुण्ड में कर्पूर व समिधा प्रज्वलित कर अग्निदेव को प्रणाम करें।',
        'Hold water and rice grains in your right palm, recite today’s Tithi, Vara and city Sankalpa, then kindle pure camphor and dried samidha inside the kund.',
        'જમણા હાથમાં જળ-અક્ષત લઈ આજની તિથિ, વાર અને શહેરનો સંકલ્પ કરો. કુંડમાં કપૂર અને સમિધા પ્રજ્વલિત કરી અગ્નિદેવને વંદન કરો.'
      ),
      mantra: 'ॐ अग्नये नमः । अस्मिन् कुण्डे प्रज्वलितोऽसि भूर्भुवः स्वः ॥',
    },
    {
      step: 3,
      title: L('३. घृताहुति एवं देव-मन्त्र स्वाहा', '3. Sacred Ghee & Mantra Ahutis', '૩. ઘૃતાહુતિ અને દેવ-મંત્ર સ્વાહા'),
      instruction: L(
        'प्रत्येक मंत्र के अंत में "स्वाहा" उच्चारण करते हुए अग्नि के मध्य भाग में शुद्ध घी व सामग्री की आहुति दें। दैनिक संक्षिप्त हवन में ५, ११ या २१ आहुति पर्याप्त हैं।',
        'At every "Swaha", offer pure ghee and samagri gently into the center of the sacred flame. 5, 11 or 21 oblations suffice for a serene daily Havan.',
        'દરેક મંત્રના અંતે "સ્વાહા" ઉચ્ચાર સાથે અગ્નિના મધ્યમાં શુદ્ધ ઘી અને સામગ્રીની આહુતિ આપો. દૈનિક હવનમાં ૫, ૧૧ કે ૨૧ આહુતિ પૂરતી છે.'
      ),
    },
    {
      step: 4,
      title: L('४. पूर्णाहुति एवं वसोर्धारा', '4. Purnahuti (Final Dedication)', '૪. પૂર્ણાહુતિ અને વસોર્ધારા'),
      instruction: L(
        'अंत में शेष बची सामग्री, सुपारी या सूखे गोले के टुकड़े पर घी लगाकर खड़े होकर संपूर्ण मन से पूर्णाहुति अर्पित करें।',
        'Stand respectfully and offer the final oblation (with remaining samagri/ghee) into the fire with full gratitude.',
        'અંતે બાકી રહેલી સામગ્રી કે સોપારી પર ઘી લગાવી ઊભા થઈ સંપૂર્ણ શ્રદ્ધાથી પૂર્ણાહુતિ અર્પણ કરો.'
      ),
      mantra: 'ॐ पूर्णमदः पूर्णमिदं पूर्णात्पूर्णमुदच्यते । पूर्णस्य पूर्णमादाय पूर्णमेवावशिष्यते स्वाहा ॥',
    },
    {
      step: 5,
      title: L('५. कर्पूर आरती, भस्म व क्षमा प्रार्थना', '5. Aarti, Bhasma & Peace Prayer', '૫. કપૂર આરતી, ભસ્મ અને ક્ષમા પ્રાર્થના'),
      instruction: L(
        'अग्नि की तीन प्रदक्षिणा कर आरती उतारें। यज्ञ के ठंडा होने पर पवित्र भस्म (तिलक) मस्तक व कण्ठ पर लगाएं और परिवार की सुख-शांति हेतु क्षमा प्रार्थना करें।',
        'Perform Aarti, apply a pinch of cooled sacred ash (Bhasma) to the forehead, and conclude with a peace prayer for all beings.',
        'કપૂર આરતી ઉતારો. હવન શાંત થયા પછી પવિત્ર ભસ્મ મસ્તક પર ધારણ કરો અને સર્વના કલ્યાણની પ્રાર્થના કરો.'
      ),
      mantra: 'ॐ शान्तिः शान्तिः शान्तिः । सर्वे भवन्तु सुखिनः सर्वे सन्तु निरामयाः ॥',
    },
  ];
}

export function buildDailySankalpaText(
  panchang: VedicPanchangData,
  locationName: string,
  lang: string = 'hi'
): string {
  const c = getLang(lang);
  const tithiLoc = trVedic(panchang.tithi, c);
  const pakshaLoc = trVedic(panchang.paksha, c);
  const weekdayLoc = trVedic(panchang.weekday, c);
  const nakLoc = trVedic(panchang.nakshatra, c);
  const masaLoc = trVedic(panchang.masa, c);
  const samvatLoc = trVedic(panchang.samvat, c);
  const parenMatch = locationName.match(/^([^()]+?)\s*\(([^)]+)\)/);
  const cleanPlace =
    c === 'en'
      ? parenMatch
        ? /[A-Za-z]/.test(parenMatch[2])
          ? parenMatch[2].trim()
          : /[A-Za-z]/.test(parenMatch[1])
          ? parenMatch[1].trim()
          : locationName
        : locationName
      : locationName;

  if (c === 'en') {
    return `Om Vishnur Vishnur Vishnuh. On this sacred day of ${samvatLoc}, ${masaLoc}, ${pakshaLoc}, ${tithiLoc}, ${weekdayLoc}, under ${nakLoc} Nakshatra, at ${cleanPlace}, I humbly perform this Nitya Devayagya Havan for purity of mind, family wellness, and cosmic harmony.`;
  }
  if (c === 'gu') {
    return `ॐ વિષ્ણુર્વિષ્ણુર્વિષ્ણુઃ । શ્રીમદ્ભગવતો મહાપુરુષસ્ય આજ્ઞયા ${samvatLoc} અંતર્ગત ${masaLoc}, ${pakshaLoc}, ${tithiLoc} તિથૌ, ${weekdayLoc}, ${nakLoc} નક્ષત્રે, ${cleanPlace} નગરે આત્મશુદ્ધિ, ગૃહ-શાંતિ તથા સપરિવાર આરોગ્ય-કલ્યાણાર્થે અહં નિત્ય દેવયજ્ઞ હવનં કરિષ્યે ॥`;
  }
  return `ॐ विष्णुर्विष्णुर्विष्णुः । श्रीमद्भगवतो महापुरुषस्य विष्णोराज्ञया प्रवर्तमानस्य ${samvatLoc} अन्तर्गत ${masaLoc}, ${pakshaLoc}, ${tithiLoc} तिथौ, ${weekdayLoc}, ${nakLoc} नक्षत्रे, ${cleanPlace} स्थाने आत्मशुद्धि, गृह-शान्ति एवं सपरिवार आरोग्य-सौभाग्यावाप्तये अहं नित्य देवयज्ञ हवनं करिष्ये ॥`;
}
