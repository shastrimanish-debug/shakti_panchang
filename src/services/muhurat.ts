import { VedicPanchangData } from '../types';
import { getDayChoghadiya, getInauspiciousWindows, getAuspiciousWindows } from './choghadiya';
import { formatPlaceTime } from './engine/time';
import { trVedic, trWeekday, trChoghadiyaMeaning } from '../i18n/vedicTranslate';

export const MUHURAT_ACTIVITIES = [
  'सामान्य शुभ कार्य',
  'यात्रा',
  'नया व्यापार',
  'वाहन खरीद',
  'भूमि / प्रॉपर्टी',
  'गृह प्रवेश',
  'शिक्षा / विद्यारंभ',
  'नामकरण',
  'विवाह',
];

export interface MuhuratGuidanceResult {
  activity: string;
  grade: 'excellent' | 'good' | 'neutral' | 'avoid';
  gradeText: string;
  statusColor: string;
  suitableWindows: Array<{ title: string; start: string; end: string }>;
  avoidWindows: Array<{ title: string; start: string; end: string }>;
  recommendations: string[];
  reasons: string[];
}

export function getMuhuratGuidance(
  activity: string,
  panchang: VedicPanchangData,
  shoolDirection?: string,
  lang: string = 'hi'
): MuhuratGuidanceResult {
  const c = (lang || 'hi').slice(0, 2).toLowerCase();
  const L = (hi: string, en: string, gu: string) => (c === 'en' ? en : c === 'gu' ? gu : hi);
  const weekday = panchang.date.getDay();
  const dayChoghadiyas = getDayChoghadiya(panchang.solar, weekday);
  const inauspicious = getInauspiciousWindows(panchang.solar, weekday);
  const auspicious = getAuspiciousWindows(panchang.solar);

  const reasons: string[] = [];
  const recommendations: string[] = [];
  let grade: 'excellent' | 'good' | 'neutral' | 'avoid' = 'good';

  const fmt = (d: Date) => formatPlaceTime(d);

  const avoidWindows = inauspicious.map((w) => ({
    title: trVedic(w.title, c),
    start: fmt(w.start),
    end: fmt(w.end),
  }));

  const suitableWindows: Array<{ title: string; start: string; end: string }> = [];
  const abhijit = auspicious.find((w) => w.title === 'अभिजित मुहूर्त');
  if (abhijit && weekday !== 3) {
    suitableWindows.push({
      title: L('अभिजित मुहूर्त (श्रेष्ठ)', 'Abhijit Muhurat (Best)', 'અભિજિત મુહૂર્ત (શ્રેષ્ઠ)'),
      start: fmt(abhijit.start),
      end: fmt(abhijit.end),
    });
  }

  for (const ch of dayChoghadiyas) {
    if (['Amrit', 'Shubh', 'Labh'].includes(ch.name)) {
      const mText = trChoghadiyaMeaning(ch.meaning, ch.hindiName, c).split('—')[0].split(',')[0].trim();
      suitableWindows.push({
        title: `${trVedic(ch.hindiName, c)} ${L('चौघड़िया', 'Choghadiya', 'ચોઘડિયું')} (${mText})`,
        start: fmt(ch.start),
        end: fmt(ch.end),
      });
    }
  }

  const locTithi = trVedic(panchang.tithi, c);
  const locNak = trVedic(panchang.nakshatra, c);
  const locWeek = trWeekday(panchang.weekday, c);
  const locPaksha = trVedic(panchang.paksha, c);
  const locYoga = trVedic(panchang.yoga, c);
  const locKarana = trVedic(panchang.karana, c);

  switch (activity) {
    case 'विवाह':
      if (['चतुर्थी', 'नवमी', 'चतुर्दशी', 'अमावस्या'].includes(panchang.tithi)) {
        grade = 'avoid';
        reasons.push(L(
          `आज ${panchang.tithi} रिक्ता/अमावस्या तिथि है, जो विवाह कर्म हेतु वर्जित मानी जाती है।`,
          `Today is ${locTithi} (Rikta/Amavasya tithi), traditionally avoided for marriage rituals.`,
          `આજે ${locTithi} રિક્તા/અમાસ તિથિ છે, જે વિવાહ કાર્ય માટે વર્જિત મનાય છે.`
        ));
      } else if (
        [
          'रोहिणी', 'मृगशीर्ष', 'मघा', 'उत्तरा फाल्गुनी', 'हस्त', 'स्वाती',
          'अनुराधा', 'मूल', 'उत्तराषाढ़ा', 'उत्तराभाद्रपद', 'रेवती'
        ].includes(panchang.nakshatra)
      ) {
        grade = 'excellent';
        reasons.push(L(
          `नक्षत्र ${panchang.nakshatra} विवाह हेतु अत्यंत प्रशस्त व मंगलकारी है।`,
          `${locNak} Nakshatra is highly auspicious for marriage ceremonies.`,
          `${locNak} નક્ષત્ર વિવાહ માટે અત્યંત પ્રશસ્ત અને મંગળકારી છે.`
        ));
      } else {
        grade = 'neutral';
        reasons.push(L(
          'सामान्य नक्षत्र स्थिति है। विवाह लग्न व वर-कन्या की कुंडली मेलापक आवश्यक है।',
          'Moderate Nakshatra influence today. Consult Lagna Shuddhi and Ashtakoot Kundali matching.',
          'સામાન્ય નક્ષત્ર સ્થિતિ છે. વિવાહ લગ્ન અને કુંડળી મિલાન આવશ્યક છે.'
        ));
      }
      recommendations.push(L('राहुकाल में विवाह फेरे अथवा लग्न विसर्जन न करें।', 'Avoid Rahu Kaal for wedding rituals.', 'રાહુકાળમાં વિવાહ ફેરા ન કરવા.'));
      recommendations.push(L('गोधूलि वेला अथवा अभिजित मुहूर्त में कार्य प्रारंभ करना उत्तम रहेगा।', 'Godhuli Bela or Abhijit Muhurat is highly favorable for auspicious beginnings.', 'ગોધૂલિ વેળા અથવા અભિજિત મુહૂર્તમાં કાર્ય આરંભ કરવો ઉત્તમ છે.'));
      break;

    case 'गृह प्रवेश':
      if (weekday === 2 || weekday === 0) {
        grade = 'neutral';
        reasons.push(L(
          'मंगलवार या रविवार को गृह प्रवेश सामान्यतः मध्यम माना जाता है; गुरुवार या शुक्रवार श्रेष्ठ रहते हैं।',
          'Tuesday and Sunday are moderate for Griha Pravesh; Thursday or Friday is generally preferred.',
          'મંગળવાર કે રવિવારે ગૃહપ્રવેશ મધ્યમ મનાય છે; ગુરુવાર કે શુક્રવાર શ્રેષ્ઠ રહે છે.'
        ));
      } else if (['द्वितीया', 'तृतीया', 'पंचमी', 'सप्तमी', 'दशमी', 'एकादशी', 'द्वादशी', 'त्रयोदशी'].includes(panchang.tithi)) {
        grade = 'excellent';
        reasons.push(L(
          `तिथि ${panchang.tithi} स्थिर गृह प्रवेश के लिए शुभ मानी जाती है।`,
          `${locTithi} tithi is auspicious for stable Griha Pravesh rituals.`,
          `${locTithi} તિથિ સ્થિર ગૃહપ્રવેશ માટે શુભ મનાય છે.`
        ));
      }
      recommendations.push(L('प्रातः काल सूर्योदय के पश्चात् शुभ चौघड़िया में कलश पूजन कर प्रवेश करें।', 'Enter after sunrise during an auspicious Choghadiya following Kalash Puja.', 'સવારે સૂર્યોદય પછી શુભ ચોઘડિયામાં કળશ પૂજન કરી પ્રવેશ કરો.'));
      recommendations.push(L('राहु काल के समय मुख्य द्वार पूजन न करें।', 'Avoid threshold worship during Rahu Kaal.', 'રાહુકાળના સમયે મુખ્ય દ્વાર પૂજન ન કરવું.'));
      break;

    case 'वाहन खरीद':
      if (weekday === 6) {
        grade = 'avoid';
        reasons.push(L('शनिवार को नवीन लोहे/वाहन का क्रय पारंपरिक रूप से टाला जाता है।', 'Buying new vehicles/iron on Saturday is traditionally avoided.', 'શનિવારે નવું વાહન કે લોખંડ ખરીદવું પરંપરાગત રીતે ટાળવામાં આવે છે.'));
      } else if (['चर', 'लाभ', 'अमृत'].some((l) => dayChoghadiyas.some((ch) => ch.hindiName === l))) {
        grade = 'good';
        reasons.push(L('आज गतिमान व शुभ चौघड़िया वाहन क्रय व पूजन के लिए अनुकूल हैं।', 'Dynamic and auspicious Choghadiyas today favor vehicle purchase & puja.', 'આજે ચર અને શુભ ચોઘડિયા વાહન ખરીદી અને પૂજન માટે અનુકૂળ છે.'));
      }
      recommendations.push(L('वाहन डिलीवरी चर अथवा लाभ चौघड़िया में लें।', 'Take vehicle delivery during Chara or Labha Choghadiya.', 'વાહનની ડિલિવરી ચર અથવા લાભ ચોઘડિયામાં લેવી.'));
      recommendations.push(L('हनुमान मंदिर अथवा गणेश मंदिर में वाहन पूजा अवश्य कराएं।', 'Perform vehicle puja at a Ganesha or Hanuman temple.', 'ગણેશ અથવા હનુમાન મંદિરમાં વાહન પૂજન અવશ્ય કરાવો.'));
      break;

    case 'नया व्यापार':
      if (['लाभ', 'अमृत'].some((l) => dayChoghadiyas.some((ch) => ch.hindiName === l))) {
        grade = 'excellent';
        reasons.push(L('लाभ व अमृत चौघड़िया व्यापार के विस्तार व स्थायी लाभ के लिए श्रेष्ठ हैं।', 'Labha & Amrit Choghadiyas are ideal for business launches and lasting gains.', 'લાભ અને અમૃત ચોઘડિયા વેપાર વિસ્તાર માટે શ્રેષ્ઠ છે.'));
      }
      if (weekday === 3 || weekday === 4 || weekday === 5) {
        reasons.push(L('बुधवार/गुरुवार/शुक्रवार व्यापार आरंभ, दुकान उद्घाटन व बहीखाता पूजन हेतु सर्वोत्तम माने गए हैं।', 'Wednesday, Thursday, and Friday are supreme for new ventures and ledger worship.', 'બુધવાર/ગુરુવાર/શુક્રવાર નવા વેપાર અને દુકાન ઉદ્ઘાટન માટે ઉત્તમ છે.'));
      }
      recommendations.push(L('अभिजित मुहूर्त में प्रथम वित्तीय लेन-देन या उद्घाटन करें।', 'Initiate your first transaction or opening in Abhijit Muhurat.', 'અભિજિત મુહૂર્તમાં પ્રથમ વ્યવહાર કે ઉદ્ઘાટન કરો.'));
      break;

    case 'यात्रा':
      if (shoolDirection) {
        reasons.push(L(`आज का दिशाशूल: ${shoolDirection} दिशा।`, `Today's Dishashool: ${trVedic(shoolDirection, 'en')} direction.`, `આજનું દિશાશૂળ: ${trVedic(shoolDirection, 'gu')} દિશા.`));
      }
      recommendations.push(L('चर चौघड़िया में यात्रा प्रारंभ करना गति व सुरक्षा प्रदान करता है।', 'Departing in Chara Choghadiya supports smooth movement and safety.', 'ચર ચોઘડિયામાં યાત્રા શરૂ કરવાથી ગતિ અને સુરક્ષા મળે છે.'));
      recommendations.push(L('राहुकाल में घर से बाहर प्रस्थान न करें।', 'Avoid starting travel during Rahu Kaal.', 'રાહુકાળમાં ઘરની બહાર પ્રસ્થાન ન કરવું.'));
      break;

    case 'भूमि / प्रॉपर्टी':
      if (panchang.tithi === 'अमावस्या') {
        grade = 'avoid';
        reasons.push(L('अमावस्या को भूमि पूजन या रजिस्ट्री से बचना चाहिए।', 'Avoid land registration or Bhoomi Pujan on Amavasya.', 'અમાસના દિવસે ભૂમિ પૂજન કે દસ્તાવેજ નોંધણી ટાળવી જોઈએ.'));
      } else {
        grade = 'good';
        reasons.push(L('स्थिर नक्षत्र व लाभ चौघड़िया में भूमि पूजन व रजिस्ट्री शुभकारी है।', 'Fixed Nakshatras and Labha Choghadiya favor property agreements.', 'સ્થિર નક્ષત્ર અને લાભ ચોઘડિયામાં ભૂમિ પૂજન શુભ રહે છે.'));
      }
      recommendations.push(L('शुभ चौघड़िया में नींव पूजन या दस्तावेज हस्ताक्षर करें।', 'Sign agreements or perform foundation puja during Shubh Choghadiya.', 'શુભ ચોઘડિયામાં પાયા પૂજન અથવા દસ્તાવેજ પર સહી કરો.'));
      break;

    case 'शिक्षा / विद्यारंभ':
      grade = 'good';
      reasons.push(L('गुरुवार/बुधवार अथवा अमृत चौघड़िया विद्यारंभ, ट्यूशन या नई पुस्तक अध्ययन के लिए अनुकूल हैं।', 'Thursday/Wednesday and Amrit Choghadiya favor study, courses, and Vidyarambha.', 'ગુરુવાર/બુધવાર અને અમૃત ચોઘડિયું વિદ્યારંભ અને અભ્યાસ માટે ઉત્તમ છે.'));
      recommendations.push(L('मां सरस्वती का वंदन कर शुभ समय में अध्ययन आरंभ करें।', 'Pray to Goddess Saraswati before beginning new study.', 'મા સરસ્વતીનું વંદન કરીને શુભ સમયે અભ્યાસ આરંભ કરો.'));
      break;

    case 'नामकरण':
      grade = 'excellent';
      reasons.push(L(`तिथि ${panchang.tithi} एवं नक्षत्र ${panchang.nakshatra} नामकरण संस्कार हेतु शुभ संकेत दे रहे हैं।`, `${locTithi} and ${locNak} Nakshatra indicate favorable conditions for Namakaran.`, `${locTithi} તિથિ અને ${locNak} નક્ષત્ર નામકરણ સંસ્કાર માટે શુભ છે.`));
      recommendations.push(L('प्रातः काल शुभ चौघड़िया में बालक का नामकरण व आशीर्वाद समारोह करें।', 'Perform morning naming and blessing rituals during Shubh Choghadiya.', 'સવારે શુભ ચોઘડિયામાં નામકરણ વિધિ સંપન્ન કરો.'));
      break;

    default:
      grade = 'good';
      reasons.push(L('दिन के शुभ चौघड़िया और अभिजित मुहूर्त सामान्य शुभ कार्यों के लिए उपयुक्त हैं।', 'Auspicious Choghadiyas and Abhijit Muhurat support routine sacred and daily tasks.', 'દિવસના શુભ ચોઘડિયા અને અભિજિત મુહૂર્ત સામાન્ય શુભ કાર્યો માટે યોગ્ય છે.'));
      recommendations.push(L('राहुकाल व यमगण्ड काल का त्याग कर कार्य संपन्न करें।', 'Avoid Rahu Kaal and Yamaganda windows when starting work.', 'રાહુકાળ અને યમગંડ કાળનો ત્યાગ કરીને કાર્ય સંપન્ન કરો.'));
  }

  reasons.unshift(L(
    `आज ${panchang.weekday}, ${panchang.paksha} ${panchang.tithi}, नक्षत्र ${panchang.nakshatra}, योग ${panchang.yoga}, करण ${panchang.karana}।`,
    `Today: ${locWeek}, ${locPaksha} ${locTithi}, Nakshatra ${locNak}, Yoga ${locYoga}, Karana ${locKarana}.`,
    `આજે ${locWeek}, ${locPaksha} ${locTithi}, નક્ષત્ર ${locNak}, યોગ ${locYoga}, કરણ ${locKarana}.`
  ));
  if (!recommendations.length) {
    recommendations.push(L('राहुकाल व यमगण्ड काल का त्याग कर कार्य संपन्न करें।', 'Avoid Rahu Kaal and Yamaganda windows when starting work.', 'રાહુકાળ અને યમગંડ કાળનો ત્યાગ કરીને કાર્ય સંપન્ન કરો.'));
  }

  const gradeText =
    grade === 'excellent'
      ? L('अति शुभ मुहूर्त', 'Highly Auspicious Muhurat', 'અતિ શુભ મુહૂર્ત')
      : grade === 'good'
      ? L('शुभ संकेत', 'Auspicious Indication', 'શુભ સંકેત')
      : grade === 'neutral'
      ? L('मिश्रित फलदायी', 'Mixed / Moderate', 'મિશ્ર ફળદાયી')
      : L('सावधानी बरतें', 'Exercise Caution', 'સાવચેતી રાખો');

  const statusColor =
    grade === 'excellent'
      ? 'text-emerald-700 bg-emerald-50 border-emerald-300'
      : grade === 'good'
      ? 'text-amber-800 bg-amber-50 border-amber-300'
      : grade === 'neutral'
      ? 'text-blue-800 bg-blue-50 border-blue-300'
      : 'text-rose-800 bg-rose-50 border-rose-300';

  return {
    activity: trVedic(activity, c),
    grade,
    gradeText,
    statusColor,
    suitableWindows,
    avoidWindows,
    recommendations,
    reasons,
  };
}

export interface DailyMuhuratRow {
  title: string;
  start: string;
  end: string;
  kind: 'shubh' | 'tyajya';
  note: string;
}

/** Today's named Vedic muhurat windows with localized labels and clock times. */
export function getDailyMuhuratDetails(panchang: VedicPanchangData, lang: string = 'hi'): DailyMuhuratRow[] {
  const c = (lang || 'hi').slice(0, 2).toLowerCase();
  const L = (hi: string, en: string, gu: string) => (c === 'en' ? en : c === 'gu' ? gu : hi);
  const fmt = (d: Date) => formatPlaceTime(d);
  const solar = panchang.solar;
  const weekday = panchang.date.getDay();
  const dayLen = solar.sunset.getTime() - solar.sunrise.getTime();
  const slot = dayLen / 15;
  const muhurta = 48 * 60000;
  const nightMid = new Date(
    solar.sunset.getTime() + (solar.nextSunrise.getTime() - solar.sunset.getTime()) / 2
  );
  const shubh = getAuspiciousWindows(solar);
  const tyajya = getInauspiciousWindows(solar, weekday);
  const pick = (title: string) => shubh.find((w) => w.title === title);

  const brahma = pick('ब्रह्म मुहूर्त');
  const abhijit = pick('अभिजित मुहूर्त');
  const godhuli = pick('गोधूलि मुहूर्त');
  const amrit = pick('अमृत काल');

  const rows: DailyMuhuratRow[] = [];
  const pushWin = (
    title: string,
    start: Date,
    end: Date,
    kind: 'shubh' | 'tyajya',
    note: string
  ) => {
    rows.push({ title, start: fmt(start), end: fmt(end), kind, note });
  };

  if (brahma) pushWin(L(brahma.title, 'Brahma Muhurat', 'બ્રહ્મ મુહૂર્ત'), brahma.start, brahma.end, 'shubh', L('योग, जप, अध्ययन — दिन का श्रेष्ठ आरंभ', 'Yoga, Japa, study — finest start to the day', 'યોગ, જપ, અધ્યયન — દિવસનો શ્રેષ્ઠ આરંભ'));
  pushWin(L('सूर्योदय', 'Sunrise', 'સૂર્યોદય'), solar.sunrise, solar.sunrise, 'shubh', L('संध्या वंदन, स्नान, अर्घ्य, दान', 'Sandhya prayer, bath, Surya Arghya & charity', 'સંધ્યા વંદન, સ્નાન, અર્ઘ્ય, દાન'));
  if (abhijit && weekday !== 3) {
    pushWin(L('अभिजित मुहूर्त', 'Abhijit Muhurat', 'અભિજિત મુહૂર્ત'), abhijit.start, abhijit.end, 'shubh', L('विजय काल — बुधवार को त्याज्य, शेष दिन श्रेष्ठ', 'Victory window — best except Wednesdays', 'વિજય કાળ — બુધવાર સિવાય શ્રેષ્ઠ'));
  } else if (abhijit) {
    pushWin(L('अभिजित मुहूर्त', 'Abhijit Muhurat', 'અભિજિત મુહૂર્ત'), abhijit.start, abhijit.end, 'tyajya', L('बुधवार को अभिजित मुहूर्त वर्जित', 'Abhijit Muhurat avoided on Wednesdays', 'બુધવારે અભિજિત મુહૂર્ત વર્જિત'));
  }
  pushWin(
    L('विजय मुहूर्त', 'Vijaya Muhurat', 'વિજય મુહૂર્ત'),
    new Date(solar.sunrise.getTime() + 10 * slot),
    new Date(solar.sunrise.getTime() + 11 * slot),
    'shubh',
    L('कार्यसिद्धि, यात्रा, नया आरंभ', 'Accomplishment, travel, auspicious ventures', 'કાર્યસિદ્ધિ, યાત્રા, નવો આરંભ')
  );
  if (amrit) pushWin(L(amrit.title, 'Amrit Kaal', 'અમૃત કાળ'), amrit.start, amrit.end, 'shubh', L('मांगलिक व नवीन कार्य', 'Auspicious & sacred beginnings', 'માંગલિક અને નવીન કાર્ય'));
  if (godhuli) pushWin(L(godhuli.title, 'Godhuli Muhurat', 'ગોધૂલિ મુહૂર્ત'), godhuli.start, godhuli.end, 'shubh', L('गृह प्रवेश, गो-सेवा, सांध्य पूजन', 'Griha Pravesh, Gau-seva, dusk prayer', 'ગૃહપ્રવેશ, ગૌ-સેવા, સાંજનું પૂજન'));
  pushWin(L('प्रदोष काल', 'Pradosh Kaal', 'પ્રદોષ કાળ'), solar.sunset, new Date(solar.sunset.getTime() + muhurta), 'shubh', L('शिव पूजन, दीपदान', 'Shiva worship & evening lamp offering', 'શિવ પૂજન, દીપદાન'));
  pushWin(
    L('निशीथ काल', 'Nishita Kaal', 'નિશીથ કાળ'),
    new Date(nightMid.getTime() - muhurta / 2),
    new Date(nightMid.getTime() + muhurta / 2),
    'tyajya',
    L('मध्यरात्रि — सामान्य शुभ कार्य न करें', 'Midnight — avoid routine auspicious starts', 'મધ્યરાત્રિ — સામાન્ય શુભ કાર્ય ટાળો')
  );
  pushWin(L('सूर्यास्त', 'Sunset', 'સૂર્યાસ્ત'), solar.sunset, solar.sunset, 'tyajya', L('संध्या बेला के बाद नया शुभ कार्य टालें', 'Avoid new ventures around dusk transition', 'સંધ્યા સમય પછી નવું શુભ કાર્ય ટાળો'));

  for (const w of tyajya) {
    pushWin(
      trVedic(w.title, c),
      w.start,
      w.end,
      'tyajya',
      L(w.description || 'नया शुभ कार्य न करें', 'Avoid new auspicious beginnings during this window', 'નવા શુભ કાર્યનો આરંભ ન કરવો')
    );
  }

  return rows;
}
