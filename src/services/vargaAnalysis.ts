import { PlanetPosition } from '../types';
import { RASHIS, calculateVargaSign } from './astronomy';
import { trPlanet, trRashi } from '../i18n/vedicTranslate';

const pickL = (lang: string, hi: string, en: string, gu: string) => {
  const c = (lang || 'hi').slice(0, 2).toLowerCase();
  return c === 'en' ? en : c === 'gu' ? gu : hi;
};

const trDignity = (dignity: string, lang: string) => {
  const c = (lang || 'hi').slice(0, 2).toLowerCase();
  if (c === 'en') {
    const m: Record<string, string> = {
      उच्च: 'Exalted',
      नीच: 'Debilitated',
      स्वराशि: 'Own Sign',
      मित्र: 'Friendly',
      सम: 'Neutral',
      शत्रु: 'Enemy',
    };
    return m[dignity] || dignity;
  }
  if (c === 'gu') {
    const m: Record<string, string> = {
      उच्च: 'ઉચ્ચ',
      नीच: 'નીચ',
      स्वराशि: 'સ્વરાશિ',
      मित्र: 'મિત્ર',
      सम: 'સમ',
      शत्रु: 'શત્રુ',
    };
    return m[dignity] || dignity;
  }
  return dignity;
};

export const SIGN_LORDS_ARRAY = [
  'मंगल', // मेष (0)
  'शुक्र', // वृषभ (1)
  'बुध',   // मिथुन (2)
  'चंद्र', // कर्क (3)
  'सूर्य', // सिंह (4)
  'बुध',   // कन्या (5)
  'शुक्र', // तुला (6)
  'मंगल', // वृश्चिक (7)
  'गुरु',  // धनु (8)
  'शनि',  // मकर (9)
  'शनि',  // कुंभ (10)
  'गुरु',  // मीन (11)
];

export const EXALTATION_INDEX: Record<string, number> = {
  सूर्य: 0,   // मेष
  चंद्र: 1,   // वृषभ
  मंगल: 9,   // मकर
  बुध: 5,    // कन्या
  गुरु: 3,   // कर्क
  शुक्र: 11, // मीन
  शनि: 6,    // तुला
  राहु: 1,   // वृषभ / मिथुन
  केतु: 7,   // वृश्चिक / धनु
};

export const DEBILITATION_INDEX: Record<string, number> = {
  सूर्य: 6,   // तुला
  चंद्र: 7,   // वृश्चिक
  मंगल: 3,   // कर्क
  बुध: 11,  // मीन
  गुरु: 9,   // मकर
  शुक्र: 5,   // कन्या
  शनि: 0,    // मेष
  राहु: 7,   // वृश्चिक
  केतु: 1,   // वृषभ
};

export const OWN_SIGNS_INDICES: Record<string, number[]> = {
  सूर्य: [4],
  चंद्र: [3],
  मंगल: [0, 7],
  बुध: [2, 5],
  गुरु: [8, 11],
  शुक्र: [1, 6],
  शनि: [9, 10],
  राहु: [10],
  केतु: [7],
};

export interface VargaPlanetItem {
  planet: string;
  englishName: string;
  rashiIndex: number;
  rashi: string;
  house: number; // 1 to 12 in this varga
  dignity: 'उच्च' | 'नीच' | 'स्वराशि' | 'मित्र' | 'सम' | 'शत्रु';
  isVargottama: boolean;
}

export interface VargaChartData {
  vargaDivision: number;
  vargaCode: string;
  vargaName: string;
  significance: string;
  lagnaRashiIndex: number;
  lagnaRashi: string;
  lagnaLord: string;
  planets: VargaPlanetItem[];
  houses: {
    house: number;
    rashiIndex: number;
    rashi: string;
    lord: string;
    occupants: string[];
  }[];
}

/**
 * Calculates complete positional details for all planets and houses in any Varga (D1 to D60)
 */
export function getVargaChartData(
  lagnaDegree: number,
  planets: PlanetPosition[],
  vargaDiv: number,
  vargaCode = `D${vargaDiv}`,
  vargaName = `D${vargaDiv} वर्गीय चक्र`,
  significance = 'वर्गीय सूक्ष्म फल'
): VargaChartData {
  const lagnaRashiIndex = calculateVargaSign(lagnaDegree, vargaDiv);
  const lagnaRashi = RASHIS[lagnaRashiIndex];
  const lagnaLord = SIGN_LORDS_ARRAY[lagnaRashiIndex];

  // Map planets
  const vargaPlanets: VargaPlanetItem[] = planets.map((p) => {
    const vSign = calculateVargaSign(p.degree, vargaDiv);
    const house = ((vSign - lagnaRashiIndex + 12) % 12) + 1;
    const d1Sign = Math.floor((p.degree % 360) / 30);
    const isVargottama = vSign === d1Sign;

    let dignity: 'उच्च' | 'नीच' | 'स्वराशि' | 'मित्र' | 'सम' | 'शत्रु' = 'सम';
    if (EXALTATION_INDEX[p.planet] === vSign) {
      dignity = 'उच्च';
    } else if (DEBILITATION_INDEX[p.planet] === vSign) {
      dignity = 'नीच';
    } else if (OWN_SIGNS_INDICES[p.planet]?.includes(vSign)) {
      dignity = 'स्वराशि';
    } else {
      const signLord = SIGN_LORDS_ARRAY[vSign];
      if (['गुरु', 'शुक्र', 'बुध', 'चंद्र'].includes(signLord)) {
        dignity = 'मित्र';
      } else {
        dignity = 'सम';
      }
    }

    return {
      planet: p.planet,
      englishName: p.englishName,
      rashiIndex: vSign,
      rashi: RASHIS[vSign],
      house,
      dignity,
      isVargottama,
    };
  });

  // Construct 12 houses
  const houses = Array.from({ length: 12 }, (_, i) => {
    const h = i + 1;
    const rIndex = (lagnaRashiIndex + i) % 12;
    const occupants = vargaPlanets.filter((p) => p.house === h).map((p) => p.planet);
    return {
      house: h,
      rashiIndex: rIndex,
      rashi: RASHIS[rIndex],
      lord: SIGN_LORDS_ARRAY[rIndex],
      occupants,
    };
  });

  return {
    vargaDivision: vargaDiv,
    vargaCode,
    vargaName,
    significance,
    lagnaRashiIndex,
    lagnaRashi,
    lagnaLord,
    planets: vargaPlanets,
    houses,
  };
}

// -------------------------------------------------------------
// 1. D10 DASHAMSHA (दशमांश - करियर, आजीविका व पद-प्रतिष्ठा)
// -------------------------------------------------------------
export interface D10CareerAnalysis {
  chart: VargaChartData;
  lagnaLordPlacement: string;
  tenthHouseLord: string;
  tenthHouseLordPlacement: string;
  tenthHouseOccupants: string[];
  kendraPlanets: string[];
  trikonaPlanets: string[];
  sunStatus: string;
  saturnStatus: string;
  careerFields: {
    title: string;
    suitability: string;
    isTop?: boolean;
    reason: string;
  }[];
  verdict: string;
  careerRemedies: string[];
}

export function analyzeD10Dashamsha(
  lagnaDegree: number,
  planets: PlanetPosition[],
  lang: string = 'hi'
): D10CareerAnalysis {
  const chart = getVargaChartData(
    lagnaDegree,
    planets,
    10,
    'D10',
    pickL(lang, 'दशमांश चक्र (Dashamsha Chart)', 'D10 Dashamsha Chart (Career)', 'દશમાંશ ચક્ર (D10 Dashamsha)'),
    pickL(
      lang,
      'आजीविका, कार्यक्षेत्र, पद-प्रतिष्ठा, व्यवसाय, यश व करियर उत्थान',
      'Profession, career trajectory, status, business, and authority',
      'આજીવિકા, કાર્યક્ષેત્ર, પદ-પ્રતિષ્ઠા, વ્યવસાય અને કારકિર્દી ઉન્નતિ'
    )
  );

  const lagnaLord = chart.lagnaLord;
  const lagnaLordPlanet = chart.planets.find((p) => p.planet === lagnaLord);
  const lagnaLordHouse = lagnaLordPlanet?.house || 1;
  const llName = trPlanet(lagnaLord, lang);
  const llRashi = lagnaLordPlanet?.rashi ? trRashi(lagnaLordPlanet.rashi, lang) : '';
  const lagnaLordPlacement = pickL(
    lang,
    `दशमांश लग्नेश (${llName}) भाव ${lagnaLordHouse} (${llRashi}) में स्थित है।`,
    `D10 Lagna Lord (${llName}) is placed in House ${lagnaLordHouse} (${llRashi}).`,
    `દશમાંશ લગ્નેશ (${llName}) ભાવ ${lagnaLordHouse} (${llRashi}) માં સ્થિત છે.`
  );

  const tenthHouse = chart.houses[9]; // 10th house
  const tenthLord = tenthHouse.lord;
  const tenthLordPlanet = chart.planets.find((p) => p.planet === tenthLord);
  const tenthLordHouse = tenthLordPlanet?.house || 10;
  const tlName = trPlanet(tenthLord, lang);
  const tlRashi = tenthLordPlanet?.rashi ? trRashi(tenthLordPlanet.rashi, lang) : '';
  const tenthHouseLordPlacement = pickL(
    lang,
    `दशमेश (${tlName}) दशमांश के भाव ${tenthLordHouse} (${tlRashi}) में स्थित है।`,
    `10th Lord (${tlName}) is placed in House ${tenthLordHouse} (${tlRashi}) of D10.`,
    `દશમેશ (${tlName}) દશમાંશના ભાવ ${tenthLordHouse} (${tlRashi}) માં સ્થિત છે.`
  );

  const tenthHouseOccupants = tenthHouse.occupants;
  const kendraPlanets = chart.planets.filter((p) => [1, 4, 7, 10].includes(p.house)).map((p) => p.planet);
  const trikonaPlanets = chart.planets.filter((p) => [1, 5, 9].includes(p.house)).map((p) => p.planet);

  // Sun & Saturn analysis
  const sunP = chart.planets.find((p) => p.planet === 'सूर्य');
  const satP = chart.planets.find((p) => p.planet === 'शनि');
  const jupP = chart.planets.find((p) => p.planet === 'गुरु');
  const mercP = chart.planets.find((p) => p.planet === 'बुध');
  const marsP = chart.planets.find((p) => p.planet === 'मंगल');

  const sunStatus = sunP
    ? pickL(
        lang,
        `सूर्य भाव ${sunP.house} (${trRashi(sunP.rashi, lang)}) में ${trDignity(sunP.dignity, lang)} है। ${
          [1, 10].includes(sunP.house) || sunP.dignity === 'उच्च' || sunP.dignity === 'स्वराशि'
            ? 'राजकीय प्रतिष्ठा, नेतृत्व व प्रशासनिक पदों में विशेष सफलता योग।'
            : 'मध्यम राजकीय प्रभाव, स्वावलंबन से सफलता।'
        }`,
        `Sun is ${trDignity(sunP.dignity, lang)} in House ${sunP.house} (${trRashi(sunP.rashi, lang)}). ${
          [1, 10].includes(sunP.house) || sunP.dignity === 'उच्च' || sunP.dignity === 'स्वराशि'
            ? 'Strong yoga for authority, leadership, and prestigious roles.'
            : 'Moderate state influence; success comes through self-reliance.'
        }`,
        `સૂર્ય ભાવ ${sunP.house} (${trRashi(sunP.rashi, lang)}) માં ${trDignity(sunP.dignity, lang)} છે. ${
          [1, 10].includes(sunP.house) || sunP.dignity === 'उच्च' || sunP.dignity === 'स्वराशि'
            ? 'રાજકીય પ્રતિષ્ઠા, નેતૃત્વ અને વહીવટી પદોમાં વિશેષ સફળતા યોગ.'
            : 'મધ્યમ રાજકીય પ્રભાવ, સ્વાવલંબનથી સફળતા.'
        }`
      )
    : pickL(lang, 'सूर्य सामान्य', 'Sun Normal', 'સૂર્ય સામાન્ય');

  const saturnStatus = satP
    ? pickL(
        lang,
        `शनि भाव ${satP.house} (${trRashi(satP.rashi, lang)}) में ${trDignity(satP.dignity, lang)} है। ${
          [10, 11, 3, 6].includes(satP.house) || satP.dignity === 'उच्च' || satP.dignity === 'स्वराशि'
            ? 'दीर्घकालिक परिश्रम, संगठन क्षमता, जनता से जुड़े कार्य व उद्योग में दृढ़ सफलता।'
            : 'करियर में धैर्य एवं निरंतर निष्ठा अपेक्षित।'
        }`,
        `Saturn is ${trDignity(satP.dignity, lang)} in House ${satP.house} (${trRashi(satP.rashi, lang)}). ${
          [10, 11, 3, 6].includes(satP.house) || satP.dignity === 'उच्च' || satP.dignity === 'स्वराशि'
            ? 'Steadfast success through persistence, organization, public work, and industry.'
            : 'Patience and consistent dedication are key in career.'
        }`,
        `શનિ ભાવ ${satP.house} (${trRashi(satP.rashi, lang)}) માં ${trDignity(satP.dignity, lang)} છે. ${
          [10, 11, 3, 6].includes(satP.house) || satP.dignity === 'उच्च' || satP.dignity === 'स्वराशि'
            ? 'દીર્ઘકાલીન પરિશ્રમ, સંગઠન ક્ષમતા અને ઉદ્યોગમાં દૃઢ સફળતા.'
            : 'કારકિર્દીમાં ધૈર્ય અને નિરંતર નિષ્ઠા અપેક્ષિત.'
        }`
      )
    : pickL(lang, 'शनि सामान्य', 'Saturn Normal', 'શનિ સામાન્ય');

  const fields: D10CareerAnalysis['careerFields'] = [];

  // 1. Administrative / Govt / Leadership
  const hasGovt =
    (sunP && ([1, 10].includes(sunP.house) || sunP.dignity === 'उच्च' || sunP.dignity === 'स्वराशि')) ||
    (tenthLord === 'सूर्य' || tenthLord === 'गुरु' || tenthHouseOccupants.includes('सूर्य'));
  fields.push({
    title: pickL(
      lang,
      'प्रशासनिक सेवा, राजकाज व प्रबंधन',
      'Administration, Government & Leadership',
      'વહીવટી સેવા, રાજકાજ અને મેનેજમેન્ટ'
    ),
    suitability: hasGovt
      ? pickL(lang, 'सर्वोत्तम (Excellent)', 'Excellent', 'સર્વોત્તમ (Excellent)')
      : pickL(lang, 'सामान्य (Moderate)', 'Moderate', 'સામાન્ય (Moderate)'),
    isTop: !!hasGovt,
    reason: hasGovt
      ? pickL(
          lang,
          'दशमांश में सूर्य/गुरु का प्रभाव प्रशासनिक अधिकार, उच्च प्रबंधन व राजकीय प्रतिष्ठा का निर्माण करता है।',
          'Sun/Jupiter strength in D10 builds administrative authority, senior management, and public recognition.',
          'દશમાંશમાં સૂર્ય/ગુરુનો પ્રભાવ વહીવટી અધિકાર, ઉચ્ચ મેનેજમેન્ટ અને રાજકીય પ્રતિષ્ઠા આપે છે.'
        )
      : pickL(
          lang,
          'प्रशासनिक क्षेत्रों में प्रवेश हेतु विशेष प्रयास की आवश्यकता रहेगी।',
          'Dedicated effort and preparation are helpful for administrative roles.',
          'વહીવટી ક્ષેત્રોમાં પ્રવેશ માટે વિશેષ પ્રયાસની જરૂર રહેશે.'
        ),
  });

  // 2. Technical, Engineering & IT
  const hasTech =
    (marsP && [1, 10, 3, 6].includes(marsP.house)) ||
    (satP && [10, 11].includes(satP.house)) ||
    (mercP && [1, 5, 10].includes(mercP.house));
  fields.push({
    title: pickL(
      lang,
      'अभियांत्रिकी, आईटी, सॉफ्टवेयर व तकनीकी क्षेत्र',
      'Engineering, IT, Software & Technical Fields',
      'એન્જિનિયરિંગ, આઈટી, સોફ્ટવેર અને ટેકનિકલ ક્ષેત્ર'
    ),
    suitability: hasTech
      ? pickL(lang, 'सर्वोत्तम (Excellent)', 'Excellent', 'સર્વોત્તમ (Excellent)')
      : pickL(lang, 'अनुकूल (Good)', 'Good', 'અનુકૂળ (Good)'),
    isTop: !!hasTech,
    reason: hasTech
      ? pickL(
          lang,
          'मंगल, बुध या शनि की दशमांश में केंद्र/त्रिकोण स्थिति तकनीकी कौशल, प्रोग्रामिंग, निर्माण व नवाचार के लिए अति उत्तम है।',
          'Kendra/Trikona placement of Mars, Mercury, or Saturn in D10 strongly favors engineering, coding, and innovation.',
          'મંગળ, બુધ કે શનિની દશમાંશમાં કેન્દ્ર/ત્રિકોણ સ્થિતિ ટેકનિકલ કૌશલ્ય, પ્રોગ્રામિંગ અને નિર્માણ માટે ઉત્તમ છે.'
        )
      : pickL(
          lang,
          'सामान्य तकनीकी समझ, प्रबंधन के साथ समन्वय से लाभ।',
          'Good technical aptitude; combining engineering with management yields strong gains.',
          'સામાન્ય ટેકનિકલ સમજ, મેનેજમેન્ટ સાથે સંકલનથી લાભ.'
        ),
  });

  // 3. Finance, Banking, Commerce & Business
  const hasBiz =
    (mercP && ([1, 2, 10, 11].includes(mercP.house) || mercP.dignity === 'उच्च' || mercP.dignity === 'स्वराशि')) ||
    (jupP && [2, 5, 9, 11].includes(jupP.house)) ||
    chart.houses[1].occupants.length > 0;
  fields.push({
    title: pickL(
      lang,
      'वाणिज्य, बैंकिंग, वित्त व स्वतंत्र व्यापार',
      'Commerce, Banking, Finance & Business',
      'વાણિજ્ય, બેંકિંગ, નાણાં અને સ્વતંત્ર વેપાર'
    ),
    suitability: hasBiz
      ? pickL(lang, 'सर्वोत्तम (Excellent)', 'Excellent', 'સર્વોત્તમ (Excellent)')
      : pickL(lang, 'अनुकूल (Good)', 'Good', 'અનુકૂળ (Good)'),
    isTop: !!hasBiz,
    reason: hasBiz
      ? pickL(
          lang,
          'बुध व गुरु की अनुकूल स्थिति वित्तीय विश्लेषण, बैंकिंग, निवेश, शेयर बाजार व व्यापार में निरंतर धन लाभ कराती है।',
          'Favorable Mercury and Jupiter bring sustained gains in finance, banking, investment, and independent trade.',
          'બુધ અને ગુરુની અનુકૂળ સ્થિતિ નાણાકીય વિશ્લેષણ, બેંકિંગ, રોકાણ અને વેપારમાં નિરંતર ધન લાભ કરાવે છે.'
        )
      : pickL(
          lang,
          'व्यापार में अनुभवी साझेदार का सहयोग हितकर रहेगा।',
          'Guidance from an experienced advisor or partner will benefit commercial ventures.',
          'વેપારમાં અનુભવી ભાગીદારનો સહયોગ હિતકર રહેશે.'
        ),
  });

  // 4. Education, Advisory, Law & Judiciary
  const hasAdvisory =
    (jupP && ([1, 4, 5, 9, 10].includes(jupP.house) || jupP.dignity === 'उच्च' || jupP.dignity === 'स्वराशि')) ||
    tenthHouseOccupants.includes('गुरु');
  fields.push({
    title: pickL(
      lang,
      'शिक्षा, परामर्श, विधि, न्याय व धर्म',
      'Education, Consulting, Law & Judiciary',
      'શિક્ષણ, પરામર્શ, કાયદો, ન્યાય અને ધર્મ'
    ),
    suitability: hasAdvisory
      ? pickL(lang, 'सर्वोत्तम (Excellent)', 'Excellent', 'સર્વોત્તમ (Excellent)')
      : pickL(lang, 'सामान्य (Moderate)', 'Moderate', 'સામાન્ય (Moderate)'),
    isTop: !!hasAdvisory,
    reason: hasAdvisory
      ? pickL(
          lang,
          'गुरु की दशमांश में गरिमापूर्ण उपस्थिति जातक को समाज में प्रतिष्ठित मार्गदर्शक, शिक्षक, अधिवक्ता या न्यायाधीश बनाती है।',
          'Dignified Jupiter in D10 shapes respected mentors, educators, consultants, and legal minds.',
          'ગુરુની દશમાંશમાં ગરિમાપૂર્ણ હાજરી જાતકને સમાજમાં પ્રતિષ્ઠિત માર્ગદર્શક, શિક્ષક કે વકીલ બનાવે છે.'
        )
      : pickL(
          lang,
          'बौद्धिक कार्यों में निरंतर स्वाध्याय से उन्नति होगी।',
          'Continuous study and expertise build steady growth in intellectual fields.',
          'બૌદ્ધિક કાર્યોમાં નિરંતર સ્વાધ્યાયથી ઉન્નતિ થશે.'
        ),
  });

  // Verdict
  let verdict = pickL(
    lang,
    'दशमांश चक्र संतुलित एवं अनुकूल है। स्वप्रयास एवं योजनाबद्ध कर्म से करियर में सतत प्रगति होगी।',
    'The D10 Dashamsha chart is balanced and supportive. Self-effort and disciplined planning bring steady career progress.',
    'દશમાંશ ચક્ર સંતુલિત અને અનુકૂળ છે. સ્વપ્રયાસ અને આયોજનબદ્ધ કર્મથી કારકિર્દીમાં સતત પ્રગતિ થશે.'
  );
  if (kendraPlanets.length >= 3) {
    verdict = pickL(
      lang,
      'दशमांश चक्र में केंद्र बलवान होने से जातक का कर्मक्षेत्र प्रभावशाली रहेगा और समाज में कीर्ति व स्थिरता प्राप्त होगी।',
      'Strong Kendra houses in D10 endow an impactful profession, social prestige, and lasting career stability.',
      'દશમાંશ ચક્રમાં કેન્દ્ર બળવાન હોવાથી જાતકનું કર્મક્ષેત્ર પ્રભાવશાળી રહેશે અને સમાજમાં કીર્તિ અને સ્થિરતા મળશે.'
    );
  } else if (tenthLordHouse === 10 || tenthLordHouse === 1 || tenthLordHouse === 11) {
    verdict = pickL(
      lang,
      'दशमेश की अत्यंत शुभ स्थिति होने से करियर में स्वतः उत्थान, मान-सम्मान एवं नेतृत्वकारी पद प्राप्त होंगे।',
      'The auspicious placement of the 10th Lord brings organic elevation, recognition, and leadership positions.',
      'દશમેશની અત્યંત શુભ સ્થિતિ હોવાથી કારકિર્દીમાં સ્વતઃ ઉત્થાન, માન-સન્માન અને નેતૃત્વના પદ પ્રાપ્ત થશે.'
    );
  }

  const careerRemedies = [
    pickL(
      lang,
      'दशमांश को बलवान करने हेतु नित्य प्रातः सूर्य देव को तांबे के लोटे से जल व कुमकुम मिश्रित अर्घ्य दें।',
      'To strengthen D10 authority, offer Arghya water mixed with kumkum to the rising Sun in a copper vessel each morning.',
      'દશમાંશને બળવાન બનાવવા નિત્ય પ્રાતઃ સૂર્યદેવને તાંબાના લોટાથી કંકુ મિશ્રિત જળ અર્ઘ્ય અર્પણ કરો.'
    ),
    pickL(
      lang,
      'कार्यस्थल पर सफलता व एकाग्रता हेतु गायत्री मंत्र अथवा अपने इष्ट मंत्र का 108 बार जप करें।',
      'Chant Gayatri Mantra or your Ishta Mantra 108 times for focus, clarity, and workplace success.',
      'કાર્યસ્થળે સફળતા અને એકાગ્રતા માટે ગાયત્રી મંત્ર અથવા ઇષ્ટ મંત્રનો ૧૦૮ વાર જપ કરો.'
    ),
    pickL(
      lang,
      'दशमेश अनुकूलता के लिए गुरुवार को केसर तिलक लगाएं एवं शनिवार को दीपदान करें।',
      'Apply saffron tilak on Thursdays and offer a sesame oil lamp on Saturdays to harmonize career lords.',
      'દશમેશની અનુકૂળતા માટે ગુરુવારે કેસર તિલક લગાવો અને શનિવારે દીપદાન કરો.'
    ),
    pickL(
      lang,
      'प्रतिष्ठान व कार्यक्षेत्र में ईशान कोण (उत्तर-पूर्व) को सदा स्वच्छ व प्रकाशमान रखें।',
      'Keep the North-East (Ishanya) corner of your workspace clean, uncluttered, and well-lit.',
      'કાર્યક્ષેત્ર અને ઓફિસમાં ઈશાન ખૂણો (ઉત્તર-પૂર્વ) સદા સ્વચ્છ અને પ્રકાશિત રાખો.'
    ),
  ];

  return {
    chart,
    lagnaLordPlacement,
    tenthHouseLord: tenthLord,
    tenthHouseLordPlacement,
    tenthHouseOccupants,
    kendraPlanets,
    trikonaPlanets,
    sunStatus,
    saturnStatus,
    careerFields: fields,
    verdict,
    careerRemedies,
  };
}

// -------------------------------------------------------------
// 2. D7 SAPTAMSHA (सप्तमांश - संतान, संतति व वंश वृद्धि)
// -------------------------------------------------------------
export interface D7SaptamshaAnalysis {
  chart: VargaChartData;
  fifthHouseLord: string;
  fifthHousePlacement: string;
  fifthHouseOccupants: string[];
  seventhHouseLord: string;
  seventhHouseOccupants: string[];
  jupiterStatus: string;
  progenyBlissScore: number; // 1 to 10
  verdict: string;
  remedies: string[];
}

export function analyzeD7Saptamsha(
  lagnaDegree: number,
  planets: PlanetPosition[],
  lang: string = 'hi'
): D7SaptamshaAnalysis {
  const chart = getVargaChartData(
    lagnaDegree,
    planets,
    7,
    'D7',
    pickL(lang, 'सप्तमांश चक्र (Saptamsha Chart)', 'D7 Saptamsha Chart (Progeny)', 'સપ્તમાંશ ચક્ર (D7 Saptamsha)'),
    pickL(
      lang,
      'संतान, संतति सुख, वंश वृद्धि, पौत्र-पौत्री व पंचम भाव का सूक्ष्म फल',
      'Progeny, children’s well-being, lineage continuity, and 5th house fruits',
      'સંતાન, સંતતિ સુખ, વંશ વૃદ્ધિ અને પંચમ ભાવનું સૂક્ષ્મ ફળ'
    )
  );

  const fifthHouse = chart.houses[4]; // 5th house
  const fifthLord = fifthHouse.lord;
  const fifthLordPlanet = chart.planets.find((p) => p.planet === fifthLord);
  const fifthLordHouse = fifthLordPlanet?.house || 5;
  const flName = trPlanet(fifthLord, lang);
  const flRashi = fifthLordPlanet?.rashi ? trRashi(fifthLordPlanet.rashi, lang) : '';
  const fifthHousePlacement = pickL(
    lang,
    `पंचमेश (${flName}) सप्तमांश के भाव ${fifthLordHouse} (${flRashi}) में स्थित है।`,
    `5th Lord (${flName}) is placed in House ${fifthLordHouse} (${flRashi}) of D7.`,
    `પંચમેશ (${flName}) સપ્તમાંશના ભાવ ${fifthLordHouse} (${flRashi}) માં સ્થિત છે.`
  );

  const seventhHouse = chart.houses[6]; // 7th house (2nd child)
  const seventhLord = seventhHouse.lord;

  const jupP = chart.planets.find((p) => p.planet === 'गुरु');

  let progenyBlissScore = 7;
  let jupiterStatus = '';

  if (jupP) {
    if ([1, 4, 5, 9, 11].includes(jupP.house) || jupP.dignity === 'उच्च' || jupP.dignity === 'स्वराशि') {
      progenyBlissScore += 2;
      jupiterStatus = pickL(
        lang,
        `संतान कारक गुरु भाव ${jupP.house} में ${trDignity(jupP.dignity, lang)} स्थिति में हैं — अति शुभ संतान सुख व कुलदीपक संतति योग।`,
        `Putrakaraka Jupiter is ${trDignity(jupP.dignity, lang)} in House ${jupP.house} — highly auspicious for progeny happiness and wise children.`,
        `સંતાન કારક ગુરુ ભાવ ${jupP.house} માં ${trDignity(jupP.dignity, lang)} સ્થિતિમાં છે — અતિ શુભ સંતાન સુખ યોગ.`
      );
    } else if ([6, 8, 12].includes(jupP.house) || jupP.dignity === 'नीच') {
      progenyBlissScore -= 2;
      jupiterStatus = pickL(
        lang,
        `संतान कारक गुरु भाव ${jupP.house} में स्थित हैं — संतान संबंधी मामलों में गुरु की शांति व मंत्र जप फलदायी रहेगा।`,
        `Jupiter is in House ${jupP.house} — Jupiter pacification and sacred mantra japa bring auspicious harmony for progeny matters.`,
        `સંતાન કારક ગુરુ ભાવ ${jupP.house} માં સ્થિત છે — સંતાન સંબંધી બાબતોમાં ગુરુની શાંતિ અને મંત્ર જપ ફળદાયી રહેશે.`
      );
    } else {
      jupiterStatus = pickL(
        lang,
        `संतान कारक गुरु भाव ${jupP.house} में सामान्य स्थिति में हैं।`,
        `Progeny significator Jupiter is evenly placed in House ${jupP.house}.`,
        `સંતાન કારક ગુરુ ભાવ ${jupP.house} માં સામાન્ય સ્થિતિમાં છે.`
      );
    }
  }

  // Benefics in 5th house
  const hasBeneficIn5th = fifthHouse.occupants.some((pl) => ['गुरु', 'शुक्र', 'बुध', 'चंद्र'].includes(pl));
  if (hasBeneficIn5th) progenyBlissScore += 1;

  progenyBlissScore = Math.max(3, Math.min(10, progenyBlissScore));

  let verdict = '';
  if (progenyBlissScore >= 8) {
    verdict = pickL(
      lang,
      'सप्तमांश चक्र में उत्तम संतान योग विद्यमान है। संतति आज्ञाकारी, उच्च शिक्षा प्राप्त करने वाली एवं कुल का नाम रोशन करने वाली होगी।',
      'D7 Saptamsha reveals an auspicious Santan Yoga. Offspring tend to be virtuous, well-educated, and bring honor to the family.',
      'સપ્તમાંશ ચક્રમાં ઉત્તમ સંતાન યોગ વિદ્યમાન છે. સંતતિ આજ્ઞાકારી, ઉચ્ચ શિક્ષણ પ્રાપ્ત કરનાર અને કુળનું નામ રોશન કરનાર હશે.'
    );
  } else if (progenyBlissScore >= 6) {
    verdict = pickL(
      lang,
      'सप्तमांश चक्र अनुसार सामान्य व शुभ संतान सुख प्राप्त होगा। संतान के स्वास्थ्य व विद्या हेतु समय-समय पर मार्गदर्शन हितकर रहेगा।',
      'D7 indicates steady and harmonious progeny bliss. Timely guidance in education and wellness ensures bright growth.',
      'સપ્તમાંશ ચક્ર મુજબ સામાન્ય અને શુભ સંતાન સુખ પ્રાપ્ત થશે. સંતાનના સ્વાસ્થ્ય અને વિદ્યા માટે યોગ્ય માર્ગદર્શન હિતકર રહેશે.'
    );
  } else {
    verdict = pickL(
      lang,
      'सप्तमांश में पंचम भाव अथवा कारक गुरु पर कुछ पाप प्रभाव दृष्टिगोचर है। संतान सुख में विलंब निवारणार्थ वैदिक उपाय अनुकरणीय हैं।',
      'Some mild affliction appears on the 5th house or Jupiter in D7. Classical Vedic remedies help remove delays and strengthen blessings.',
      'સપ્તમાંશમાં પંચમ ભાવ અથવા કારક ગુરુ પર કેટલોક પાપ પ્રભાવ જણાય છે. સંતાન સુખ માટે વૈદિક ઉપાયો અનુકરણીય છે.'
    );
  }

  const remedies = [
    pickL(
      lang,
      'संतान सुख, दीर्घायु व मेधावी बुद्धि हेतु नित्य "संतान गोपाल मंत्र" (ॐ देवकीसुत गोविंद वासुदेव जगत्पते...) का 1 माला जप करें।',
      'Chant 1 mala (108 times) of the sacred Santana Gopala Mantra daily for progeny bliss, longevity, and bright intellect.',
      'સંતાન સુખ, દીર્ઘાયુ અને મેધાવી બુદ્ધિ માટે નિત્ય "સંતાન ગોપાલ મંત્ર" ની ૧ માળા જપ કરો.'
    ),
    pickL(
      lang,
      'गुरुवार के दिन भगवान लक्ष्मीनारायण की पूजा करें एवं केले के वृक्ष को जल अर्पित करें।',
      'Worship Lord Lakshminarayana on Thursdays and offer water to a banana tree.',
      'ગુરુવારના દિવસે ભગવાન લક્ષ્મીનારાયણની પૂજા કરો અને કેળના વૃક્ષને જળ અર્પણ કરો.'
    ),
    pickL(
      lang,
      'प्रतिवर्ष श्रीकृष्ण जन्माष्टमी अथवा गोपाष्टमी पर गौमाता को हरा चारा व गुड़ खिलाएं।',
      'Feed green fodder and jaggery to sacred cows on Janmashtami, Gopashtami, or Thursdays.',
      'દર વર્ષે શ્રીકૃષ્ણ જન્માષ્ટમી કે ગોપાષ્ટમી પર ગૌમાતાને લીલું ઘાસ અને ગોળ ખવડાવો.'
    ),
    pickL(
      lang,
      'संतान के जन्म नक्षत्र के दिन विद्वान ब्राह्मण द्वारा रुद्राभिषेक कराना परम कल्याणकारी रहता है।',
      'Performing Rudrabhishek on the child’s birth Nakshatra day bestows enduring protection and harmony.',
      'સંતાનના જન્મ નક્ષત્રના દિવસે વિદ્વાન બ્રાહ્મણ દ્વારા રુદ્રાભિષેક કરાવવો પરમ કલ્યાણકારી રહે છે.'
    ),
  ];

  return {
    chart,
    fifthHouseLord: fifthLord,
    fifthHousePlacement,
    fifthHouseOccupants: fifthHouse.occupants,
    seventhHouseLord: seventhLord,
    seventhHouseOccupants: seventhHouse.occupants,
    jupiterStatus,
    progenyBlissScore,
    verdict,
    remedies,
  };
}

// -------------------------------------------------------------
// 3. D3 DREKKANA (द्रेष्काण - सहोदर, पराक्रम व शौर्य)
// -------------------------------------------------------------
export interface D3DrekkanaAnalysis {
  chart: VargaChartData;
  thirdHouseLord: string;
  thirdHousePlacement: string;
  thirdHouseOccupants: string[];
  eleventhHouseLord: string;
  marsStatus: string;
  valourScore: number; // 1 to 10
  verdict: string;
  remedies: string[];
}

export function analyzeD3Drekkana(
  lagnaDegree: number,
  planets: PlanetPosition[],
  lang: string = 'hi'
): D3DrekkanaAnalysis {
  const chart = getVargaChartData(
    lagnaDegree,
    planets,
    3,
    'D3',
    pickL(lang, 'द्रेष्काण चक्र (Drekkana Chart)', 'D3 Drekkana Chart (Courage & Siblings)', 'દ્રેષ્કાણ ચક્ર (D3 Drekkana)'),
    pickL(
      lang,
      'सहोदर (भाई-बहन), पराक्रम, शारीरिक ऊर्जा, साहस, संकल्प शक्ति व तृतीय भाव का सूक्ष्म फल',
      'Siblings, courage, physical vitality, initiative, willpower, and 3rd house fruits',
      'સહોદર (ભાઈ-બહેન), પરાક્રમ, શારીરિક ઊર્જા, સાહસ અને તૃતીય ભાવનું સૂક્ષ્મ ફળ'
    )
  );

  const thirdHouse = chart.houses[2]; // 3rd house
  const thirdLord = thirdHouse.lord;
  const thirdLordPlanet = chart.planets.find((p) => p.planet === thirdLord);
  const thirdLordHouse = thirdLordPlanet?.house || 3;
  const thName = trPlanet(thirdLord, lang);
  const thRashi = thirdLordPlanet?.rashi ? trRashi(thirdLordPlanet.rashi, lang) : '';
  const thirdHousePlacement = pickL(
    lang,
    `तृतीयेश (${thName}) द्रेष्काण के भाव ${thirdLordHouse} (${thRashi}) में स्थित है।`,
    `3rd Lord (${thName}) is placed in House ${thirdLordHouse} (${thRashi}) of D3.`,
    `તૃતીયેશ (${thName}) દ્રેષ્કાણના ભાવ ${thirdLordHouse} (${thRashi}) માં સ્થિત છે.`
  );

  const eleventhHouse = chart.houses[10]; // 11th house (elder siblings)
  const eleventhLord = eleventhHouse.lord;

  const marsP = chart.planets.find((p) => p.planet === 'मंगल');
  let valourScore = 7;
  let marsStatus = '';

  if (marsP) {
    if ([1, 3, 6, 10].includes(marsP.house) || marsP.dignity === 'उच्च' || marsP.dignity === 'स्वराशि') {
      valourScore += 2;
      marsStatus = pickL(
        lang,
        `भ्रातृ व पराक्रम कारक मंगल भाव ${marsP.house} में ${trDignity(marsP.dignity, lang)} है — अदम्य साहस, नेतृत्व शक्ति व सहोदरों में प्रभाव।`,
        `Bhratrukaraka Mars is ${trDignity(marsP.dignity, lang)} in House ${marsP.house} — indomitable courage, leadership, and harmony with siblings.`,
        `ભ્રાતૃ અને પરાક્રમ કારક મંગળ ભાવ ${marsP.house} માં ${trDignity(marsP.dignity, lang)} છે — અદમ્ય સાહસ અને નેતૃત્વ શક્તિ.`
      );
    } else if ([8, 12].includes(marsP.house) || marsP.dignity === 'नीच') {
      valourScore -= 1;
      marsStatus = pickL(
        lang,
        `मंगल भाव ${marsP.house} में स्थित हैं — भाई-बहनों से व्यवहार में मधुरता व धैर्य बनाए रखना आवश्यक।`,
        `Mars is placed in House ${marsP.house} — maintaining patience and warmth with siblings is advised.`,
        `મંગળ ભાવ ${marsP.house} માં સ્થિત છે — ભાઈ-બહેનો સાથે વ્યવહારમાં મધુરતા અને ધૈર્ય રાખવું જરૂરી.`
      );
    } else {
      marsStatus = pickL(
        lang,
        `मंगल भाव ${marsP.house} में सामान्य स्थिति में हैं।`,
        `Mars is evenly placed in House ${marsP.house}.`,
        `મંગળ ભાવ ${marsP.house} માં સામાન્ય સ્થિતિમાં છે.`
      );
    }
  }

  valourScore = Math.max(3, Math.min(10, valourScore));

  let verdict = pickL(
    lang,
    'द्रेष्काण चक्र अनुसार जातक में स्वाभाविक साहस, संघर्ष क्षमता व अपने बलबूते पर लक्ष्य साधने की शक्ति विद्यमान है।',
    'The D3 Drekkana chart shows natural grit, resilience, and the self-confidence to achieve ambitious goals.',
    'દ્રેષ્કાણ ચક્ર મુજબ જાતકમાં સ્વાભાવિક સાહસ, સંઘર્ષ ક્ષમતા અને પોતાના બળ પર લક્ષ્ય સિદ્ધ કરવાની શક્તિ છે.'
  );
  if (valourScore >= 8) {
    verdict = pickL(
      lang,
      'द्रेष्काण में तृतीय भाव व मंगल की स्थिति अत्यंत सशक्त है। जातक पराक्रमी, संकटों से न घबराने वाला एवं सहोदरों का रक्षक होगा।',
      'Strong 3rd house and Mars in D3 grant exceptional valor, fearlessness in challenges, and protective support toward siblings.',
      'દ્રેષ્કાણમાં તૃતીય ભાવ અને મંગળની સ્થિતિ અત્યંત સશક્ત છે. જાતક પરાક્રમી અને સહોદરોનો રક્ષક બનશે.'
    );
  }

  const remedies = [
    pickL(
      lang,
      'पराक्रम एवं सहोदर सौहार्द हेतु मंगलवार को श्री हनुमान चालीसा अथवा सुंदरकांड का पाठ करें।',
      'Recite Sri Hanuman Chalisa or Sundarkand on Tuesdays to boost courage and sibling harmony.',
      'પરાક્રમ અને સહોદર સૌહાર્દ માટે મંગળવારે શ્રી હનુમાન ચાલીસા અથવા સુંદરકાંડનો પાઠ કરો.'
    ),
    pickL(
      lang,
      'छोटे भाइयों व सहकर्मियों का सम्मान करें एवं उनकी यथाशक्ति सहायता करें।',
      'Respect and support younger siblings and teammates whenever possible.',
      'નાના ભાઈઓ અને સહકર્મીઓનું સન્માન કરો અને તેમની યથાશક્તિ મદદ કરો.'
    ),
    pickL(
      lang,
      'मंगलवार को लाल मसूर अथवा गुड़ का दान मंगल दोष शांति व आत्मबल में वृद्धि करता है।',
      'Donating red masoor lentils or jaggery on Tuesdays pacifies Mars and elevates willpower.',
      'મંગળવારે લાલ મસૂર અથવા ગોળનું દાન મંગળ દોષ શાંતિ અને આત્મબળમાં વૃદ્ધિ કરે છે.'
    ),
  ];

  return {
    chart,
    thirdHouseLord: thirdLord,
    thirdHousePlacement,
    thirdHouseOccupants: thirdHouse.occupants,
    eleventhHouseLord: eleventhLord,
    marsStatus,
    valourScore,
    verdict,
    remedies,
  };
}

// -------------------------------------------------------------
// 4. MASTER SHODASHVARGA SUMMARY (वैशेषिकांश एवं वर्गोत्तम विश्लेषण)
// -------------------------------------------------------------
export const SHODASH_DIVISIONS = [1, 2, 3, 4, 7, 9, 10, 12, 16, 20, 24, 27, 30, 40, 45, 60];

export interface PlanetVargaRow {
  planet: string;
  d1Sign: string;
  d9Sign: string;
  isD9Vargottama: boolean;
  ownExaltedCount: number; // count across 16 vargas
  vaisheshikamshaTitle: string; // पारिजात, उत्तम, गोपुर, etc.
  vargaRashis: Record<number, string>;
}

export function calculateVaisheshikamshaSummary(
  lagnaDegree: number,
  planets: PlanetPosition[],
  lang: string = 'hi'
): PlanetVargaRow[] {
  return planets.map((p) => {
    const vargaRashis: Record<number, string> = {};
    let ownExaltedCount = 0;

    SHODASH_DIVISIONS.forEach((div) => {
      const vSign = calculateVargaSign(p.degree, div);
      vargaRashis[div] = RASHIS[vSign];

      const isExalted = EXALTATION_INDEX[p.planet] === vSign;
      const isOwn = OWN_SIGNS_INDICES[p.planet]?.includes(vSign);
      if (isExalted || isOwn) {
        ownExaltedCount += 1;
      }
    });

    const d1Sign = vargaRashis[1];
    const d9Sign = vargaRashis[9];
    const isD9Vargottama = d1Sign === d9Sign;

    let vaisheshikamshaTitle = pickL(lang, 'सामान्य', 'Normal', 'સામાન્ય');
    if (ownExaltedCount >= 9) {
      vaisheshikamshaTitle = pickL(lang, 'श्रीधाम / शक्रवाहन (अति विशिष्ट)', 'Sridhama / Shakra (Rare)', 'શ્રીધામ / શક્રવાહન (અતિ વિશિષ્ટ)');
    } else if (ownExaltedCount === 8) {
      vaisheshikamshaTitle = pickL(lang, 'ब्रह्मलोक (अति उच्च बल)', 'Brahmaloka (Supreme)', 'બ્રહ્મલોક (અતિ ઉચ્ચ બળ)');
    } else if (ownExaltedCount === 7) {
      vaisheshikamshaTitle = pickL(lang, 'देवलोक (दिव्य सामर्थ्य)', 'Devaloka (Divine)', 'દેવલોક (દિવ્ય સામર્થ્ય)');
    } else if (ownExaltedCount === 6) {
      vaisheshikamshaTitle = pickL(lang, 'पारावत (प्रचंड राजयोग)', 'Paravata (Rajayoga)', 'પારાવત (પ્રચંડ રાજયોગ)');
    } else if (ownExaltedCount === 5) {
      vaisheshikamshaTitle = pickL(lang, 'सिंहासन (सम्मान व सत्ता)', 'Simhasana (Throne)', 'સિંહાસન (સન્માન અને સત્તા)');
    } else if (ownExaltedCount === 4) {
      vaisheshikamshaTitle = pickL(lang, 'गोपुर (स्थाई ऐश्वर्य)', 'Gopura (Prosperity)', 'ગોપુર (સ્થાયી ઐશ્વર્ય)');
    } else if (ownExaltedCount === 3) {
      vaisheshikamshaTitle = pickL(lang, 'उत्तम (श्रेष्ठ फल)', 'Uttamamsa (Superior)', 'ઉત્તમ (શ્રેષ્ઠ ફળ)');
    } else if (ownExaltedCount === 2) {
      vaisheshikamshaTitle = pickL(lang, 'पारिजात (शुभ फल)', 'Parijatamsa (Auspicious)', 'પારિજાત (શુભ ફળ)');
    }

    return {
      planet: p.planet,
      d1Sign,
      d9Sign,
      isD9Vargottama,
      ownExaltedCount,
      vaisheshikamshaTitle,
      vargaRashis,
    };
  });
}
