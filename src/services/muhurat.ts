import { VedicPanchangData } from '../types';
import { getDayChoghadiya, getInauspiciousWindows, getAuspiciousWindows } from './choghadiya';

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
  shoolDirection?: string
): MuhuratGuidanceResult {
  const weekday = panchang.date.getDay();
  const dayChoghadiyas = getDayChoghadiya(panchang.solar, weekday);
  const inauspicious = getInauspiciousWindows(panchang.solar, weekday);
  const auspicious = getAuspiciousWindows(panchang.solar);

  const reasons: string[] = [];
  const recommendations: string[] = [];
  let grade: 'excellent' | 'good' | 'neutral' | 'avoid' = 'good';

  const fmt = (d: Date) =>
    d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

  const avoidWindows = inauspicious.map((w) => ({
    title: w.title,
    start: fmt(w.start),
    end: fmt(w.end),
  }));

  const suitableWindows: Array<{ title: string; start: string; end: string }> = [];
  const abhijit = auspicious.find((w) => w.title === 'अभिजित मुहूर्त');
  if (abhijit && weekday !== 3) {
    suitableWindows.push({
      title: 'अभिजित मुहूर्त (श्रेष्ठ)',
      start: fmt(abhijit.start),
      end: fmt(abhijit.end),
    });
  }

  for (const c of dayChoghadiyas) {
    if (['Amrit', 'Shubh', 'Labh'].includes(c.name)) {
      suitableWindows.push({
        title: `${c.hindiName} चौघड़िया (${c.meaning.split('—')[0].trim()})`,
        start: fmt(c.start),
        end: fmt(c.end),
      });
    }
  }

  switch (activity) {
    case 'विवाह':
      if (['चतुर्थी', 'नवमी', 'चतुर्दशी', 'अमावस्या'].includes(panchang.tithi)) {
        grade = 'avoid';
        reasons.push(`आज ${panchang.tithi} रिक्ता/अमावस्या तिथि है, जो विवाह कर्म हेतु वर्जित मानी जाती है।`);
      } else if (
        [
          'रोहिणी', 'मृगशीर्ष', 'मघा', 'उत्तरा फाल्गुनी', 'हस्त', 'स्वाती',
          'अनुराधा', 'मूल', 'उत्तराषाढ़ा', 'उत्तराभाद्रपद', 'रेवती'
        ].includes(panchang.nakshatra)
      ) {
        grade = 'excellent';
        reasons.push(`नक्षत्र ${panchang.nakshatra} विवाह हेतु अत्यंत प्रशस्त व मंगलकारी है।`);
      } else {
        grade = 'neutral';
        reasons.push('सामान्य नक्षत्र स्थिति है। विवाह लग्न व वर-कन्या की कुंडली मेलापक आवश्यक है।');
      }
      recommendations.push('राहुकाल में विवाह फेरे अथवा लग्न विसर्जन न करें।');
      recommendations.push('गोधूलि वेला अथवा अभिजित मुहूर्त में कार्य प्रारंभ करना उत्तम रहेगा।');
      break;

    case 'गृह प्रवेश':
      if (weekday === 2 || weekday === 0) {
        grade = 'neutral';
        reasons.push('मंगलवार या रविवार को गृह प्रवेश सामान्यतः मध्यम माना जाता है; गुरुवार या शुक्रवार श्रेष्ठ रहते हैं।');
      } else if (['द्वितीया', 'तृतीया', 'पंचमी', 'सप्तमी', 'दशमी', 'एकादशी', 'द्वादशी', 'त्रयोदशी'].includes(panchang.tithi)) {
        grade = 'excellent';
        reasons.push(`तिथि ${panchang.tithi} स्थिर गृह प्रवेश के लिए शुभ मानी जाती है।`);
      }
      recommendations.push('प्रातः काल सूर्योदय के पश्चात् शुभ चौघड़िया में कलश पूजन कर प्रवेश करें।');
      recommendations.push('राहु काल के समय मुख्य द्वार पूजन न करें।');
      break;

    case 'वाहन खरीद':
      if (weekday === 6) {
        grade = 'avoid';
        reasons.push('शनिवार को नवीन लोहे/वाहन का क्रय पारंपरिक रूप से टाला जाता है।');
      } else if (['चर', 'लाभ', 'अमृत'].some((l) => dayChoghadiyas.some((c) => c.hindiName === l))) {
        grade = 'good';
        reasons.push('आज गतिमान व शुभ चौघड़िया वाहन क्रय व पूजन के लिए अनुकूल हैं।');
      }
      recommendations.push('वाहन डिलीवरी चर अथवा लाभ चौघड़िया में लें।');
      recommendations.push('हनुमान मंदिर अथवा गणेश मंदिर में वाहन पूजा अवश्य कराएं।');
      break;

    case 'नया व्यापार':
      if (['लाभ', 'अमृत'].some((l) => dayChoghadiyas.some((c) => c.hindiName === l))) {
        grade = 'excellent';
        reasons.push('लाभ व अमृत चौघड़िया व्यापार के विस्तार व स्थायी लाभ के लिए श्रेष्ठ हैं।');
      }
      if (weekday === 3 || weekday === 4 || weekday === 5) {
        reasons.push('बुधवार/गुरुवार/शुक्रवार व्यापार आरंभ, दुकान उद्घाटन व बहीखाता पूजन हेतु सर्वोत्तम माने गए हैं।');
      }
      recommendations.push('अभिजित मुहूर्त में प्रथम वित्तीय लेन-देन या उद्घाटन करें।');
      break;

    case 'यात्रा':
      if (shoolDirection) {
        reasons.push(`आज का दिशाशूल: ${shoolDirection} दिशा।`);
      }
      recommendations.push('चर चौघड़िया में यात्रा प्रारंभ करना गति व सुरक्षा प्रदान करता है।');
      recommendations.push('राहुकाल में घर से बाहर प्रस्थान न करें।');
      break;

    case 'भूमि / प्रॉपर्टी':
      if (panchang.tithi === 'अमावस्या') {
        grade = 'avoid';
        reasons.push('अमावस्या को भूमि पूजन या रजिस्ट्री से बचना चाहिए।');
      } else {
        grade = 'good';
        reasons.push('स्थिर नक्षत्र व लाभ चौघड़िया में भूमि पूजन व रजिस्ट्री शुभकारी है।');
      }
      recommendations.push('शुभ चौघड़िया में नींव पूजन या दस्तावेज हस्ताक्षर करें।');
      break;

    case 'शिक्षा / विद्यारंभ':
      grade = 'good';
      reasons.push('गुरुवार/बुधवार अथवा अमृत चौघड़िया विद्यारंभ, ट्यूशन या नई पुस्तक अध्ययन के लिए अनुकूल हैं।');
      recommendations.push('मां सरस्वती का वंदन कर शुभ समय में अध्ययन आरंभ करें।');
      break;

    case 'नामकरण':
      grade = 'excellent';
      reasons.push(`तिथि ${panchang.tithi} एवं नक्षत्र ${panchang.nakshatra} नामकरण संस्कार हेतु शुभ संकेत दे रहे हैं।`);
      recommendations.push('प्रातः काल शुभ चौघड़िया में बालक का नामकरण व आशीर्वाद समारोह करें।');
      break;

    default:
      grade = 'good';
      reasons.push('दिन के शुभ चौघड़िया और अभिजित मुहूर्त सामान्य शुभ कार्यों के लिए उपयुक्त हैं।');
      recommendations.push('राहुकाल व यमगण्ड काल का त्याग कर कार्य संपन्न करें।');
  }

  const gradeText =
    grade === 'excellent'
      ? 'अति शुभ मुहूर्त'
      : grade === 'good'
      ? 'शुभ संकेत'
      : grade === 'neutral'
      ? 'मिश्रित फलदायी'
      : 'सावधानी बरतें';

  const statusColor =
    grade === 'excellent'
      ? 'text-emerald-700 bg-emerald-50 border-emerald-300'
      : grade === 'good'
      ? 'text-amber-800 bg-amber-50 border-amber-300'
      : grade === 'neutral'
      ? 'text-blue-800 bg-blue-50 border-blue-300'
      : 'text-rose-800 bg-rose-50 border-rose-300';

  return {
    activity,
    grade,
    gradeText,
    statusColor,
    suitableWindows,
    avoidWindows,
    recommendations,
    reasons,
  };
}
