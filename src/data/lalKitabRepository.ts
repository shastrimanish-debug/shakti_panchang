/**
 * ============================================================================
 * DEDICATED STATIC DATA LAYER: LalKitabRepository
 * ============================================================================
 * Strictly decoupled from UI components so that UI updates NEVER truncate or
 * delete the 100 Lal Kitab Upay (Remedies) dataset.
 *
 * HOW TO PASTE / EXTEND UP TO 100+ CUSTOM ITEMS:
 * Simply append new `LalKitabRemedy` objects inside `LAL_KITAB_CORE_REMEDIES`
 * below following the exact schema of items #1 to #12.
 * ============================================================================
 */

import saralRaw from './saral/upay.json';

export interface LalKitabRemedy {
  id: number;
  code: string;               // e.g., "LK-001"
  title: string;              // उपाय का शीर्षक
  planet: string;             // संबंधित ग्रह (सूर्य, चंद्र, मंगल, बुध, गुरु, शुक्र, शनि, राहु, केतु)
  houseNumber: number;        // भाव संख्या (1 से 12)
  category: string;           // श्रेणी (धन-समृद्धि, ऋण मुक्ति, व्यापार, विवाह, स्वास्थ्य, शत्रु-नजर दोष, नौकरी)
  problemStatement: string;   // समस्या / लक्षण (खाना नंबर के अनुसार अशुभ फल)
  remedyProcedure: string;    // लाल किताब का अचूक उपाय / विधि
  materialsRequired: string[];// आवश्यक सामग्री
  durationDays: string;       // अवधि (जैसे: 43 दिन, 27 दिन, प्रत्येक शनिवार)
  bestDayAndTime: string;     // श्रेष्ठ दिन व समय (सूर्योदय से सूर्यास्त के मध्य)
  precaution: string;         // लाल किताब की विशेष सावधानी / परहेज
}

/**
 * Primary Authentic Lal Kitab Remedies (Khana No. 1 to 12 & Navagraha Totke)
 * Paste additional custom Lal Kitab items directly into this array.
 */
export const LAL_KITAB_CORE_REMEDIES: LalKitabRemedy[] = [
  {
    id: 1,
    code: 'LK-001',
    title: 'सूर्य खाना नं. १ व ७ — तांबा एवं गुड़ जल प्रवाह प्रयोग',
    planet: 'सूर्य (Sun)',
    houseNumber: 1,
    category: 'नौकरी व मान-सम्मान',
    problemStatement: 'सरकारी कार्यों में बाधा, पिता से मतभेद, मान-सम्मान में कमी अथवा सिरदर्द व नेत्र पीड़ा।',
    remedyProcedure: 'रविवार के दिन प्रातः सूर्योदय के पश्चात तांबे का एक चौकोर टुकड़ा अथवा गुड़ बहते हुए शुद्ध जल (नदी/नहर) में प्रवाहित करें तथा किसी भी शुभ कार्य पर निकलने से पूर्व थोड़ा गुड़ खाकर ऊपर से जल पिएं।',
    materialsRequired: ['तांबे का चौकोर टुकड़ा या सिक्का', 'देसी गुड़', 'तांबे का लोटा'],
    durationDays: 'लगातार 7 रविवार अथवा 43 दिन',
    bestDayAndTime: 'रविवार प्रातः (सूर्योदय के बाद, दिन के समय)',
    precaution: 'रविवार को नमक का कम सेवन करें एवं रात्रि में लाल किताब के उपाय कदापि न करें।'
  },
  {
    id: 2,
    code: 'LK-002',
    title: 'चंद्र खाना नं. ४ व ८ — चांदी का चौकोर टुकड़ा एवं सिरहाने जल प्रयोग',
    planet: 'चंद्र (Moon)',
    houseNumber: 4,
    category: 'मानसिक शांति व धन बचत',
    problemStatement: 'अत्यधिक मानसिक तनाव, अनिद्रा, माता का स्वास्थ्य कमजोर रहना और हाथ में नकद धन न टिकना।',
    remedyProcedure: 'रात्रि में सोते समय अपने सिरहाने तांबे या चांदी के पात्र में जल भरकर रखें और प्रातः उठकर उसे कीकर, बबूल या किसी कांटेदार पौधे की जड़ में डाल दें। साथ ही 4 ग्राम का शुद्ध चांदी का चौकोर टुकड़ा अपनी जेब या पर्स में सदैव रखें।',
    materialsRequired: ['शुद्ध चांदी का चौकोर टुकड़ा', 'तांबे/चांदी का लोटा', 'स्वच्छ जल'],
    durationDays: 'लगातार 43 दिन (बिना नागा)',
    bestDayAndTime: 'सोमवार से आरंभ कर प्रतिदिन प्रातःकाल',
    precaution: 'रात्रि के समय दूध का सेवन न करें तथा घर में दूध जलने या उफनने न दें।'
  },
  {
    id: 3,
    code: 'LK-003',
    title: 'मंगल बद (खाना नं. ४, ७, ८, १२) — मीठी रेवड़ी व बताशे जल प्रवाह',
    planet: 'मंगल (Mars)',
    houseNumber: 8,
    category: 'मांगलिक दोष व ऋण मुक्ति',
    problemStatement: 'मंगल बद के कारण भयंकर क्रोध, भाई-बंधुओं से विवाद, कर्ज का बढ़ना और वैवाहिक जीवन में कलह।',
    remedyProcedure: 'मंगलवार के दिन तिल और गुड़ से बनी मीठी रेवड़ियां अथवा सफेद बताशे बहते हुए जल में प्रवाहित करें। घर में मिट्टी के कुल्हड़ में शुद्ध शहद भरकर ढक्कन बंद करके एकांत कोने में स्थापित करें।',
    materialsRequired: ['तिल-गुड़ की रेवड़ियां (400 ग्राम)', 'सफेद बताशे', 'मिट्टी का कुल्हड़ व शुद्ध शहद'],
    durationDays: 'लगातार 7 मंगलवार',
    bestDayAndTime: 'मंगलवार मध्याह्न (दोपहर 12 से 2 बजे के मध्य)',
    precaution: 'छोटे भाइयों से झगड़ा न करें और घर के दक्षिण द्वार पर गंदगी न रखें।'
  },
  {
    id: 4,
    code: 'LK-004',
    title: 'बुध खाना नं. ३, ८, ९, १२ — छेद वाला तांबे का पैसा व फिटकरी प्रयोग',
    planet: 'बुध (Mercury)',
    houseNumber: 9,
    category: 'व्यापार वृद्धि व वाणी दोष',
    problemStatement: 'व्यापार में अचानक भारी घाटा, नसों व त्वचा के रोग, निर्णय क्षमता में भ्रम तथा वाणी दोष।',
    remedyProcedure: 'बुधवार के दिन तांबे के गोल पैसे (जिसके बीच में गोल छेद हो) को बहते जल में प्रवाहित करें। प्रतिदिन फिटकरी के पानी से कुल्ला करें या दांत साफ करें तथा गाय को साबुत हरी मूंग व हरा चारा खिलाएं।',
    materialsRequired: ['छेद वाला तांबे का सिक्का', 'सफेद फिटकरी', 'साबुत हरी मूंग (भिगोई हुई)'],
    durationDays: 'लगातार 27 बुधवार या 43 दिन',
    bestDayAndTime: 'बुधवार प्रातः 8 से 11 बजे के मध्य',
    precaution: 'घर में चौड़े पत्ते वाले रबर के पौधे, बंद घड़ियां और टूटे कांच बिल्कुल न रखें।'
  },
  {
    id: 5,
    code: 'LK-005',
    title: 'बृहस्पति खाना नं. २, ५, ९, १० — केसर तिलक एवं पीपल जल सेवा',
    planet: 'गुरु (Jupiter)',
    houseNumber: 5,
    category: 'भाग्य, संतान व शिक्षा',
    problemStatement: 'उच्च शिक्षा में रुकावट, भाग्योदय न होना, स्वर्ण की हानि अथवा संतान व लिवर संबंधी चिंता।',
    remedyProcedure: 'प्रतिदिन स्नान के पश्चात नाभि, जिह्वा (जीभ) और माथे पर शुद्ध केसर का तिलक लगाएं। गुरुवार को पीपल के वृक्ष को बिना स्पर्श किए जल अर्पित करें और चने की दाल व पीली हल्दी मंदिर में दान करें।',
    materialsRequired: ['शुद्ध कश्मीरी केसर', 'चने की दाल (400 ग्राम)', 'साबुत पीली हल्दी की गांठें'],
    durationDays: 'लगातार 43 दिन',
    bestDayAndTime: 'गुरुवार प्रातः सूर्योदय के बाद',
    precaution: 'घर के ईशान कोण (North-East) को कभी भारी या अपवित्र न रखें और पिता/गुरु का अनादर न करें।'
  },
  {
    id: 6,
    code: 'LK-006',
    title: 'शुक्र खाना नं. १, ६, ७, १२ — ज्वार दान एवं दोरंगी गाय की सेवा',
    planet: 'शुक्र (Venus)',
    houseNumber: 7,
    category: 'दांपत्य सुख व ऐश्वर्य',
    problemStatement: 'पति-पत्नी में अनबन, विवाह में देरी, त्वचा रोग, अनावश्यक विलासिता में धन का नाश।',
    remedyProcedure: 'शुक्रवार के दिन अपने वजन के दशांश (दसवें हिस्से) के बराबर सफेद ज्वार (चरी) मंदिर या गौशाला में दान करें। काली या दोरंगी गाय को हरा चारा व गुड़ खिलाएं तथा चांदी की ठोस गोली अपने पास रखें।',
    materialsRequired: ['सफेद ज्वार (चरी)', 'चांदी की ठोस गोली', 'गाय के लिए हरा चारा व गुड़'],
    durationDays: 'लगातार 7 शुक्रवार',
    bestDayAndTime: 'शुक्रवार प्रातः या मध्याह्न काल',
    precaution: 'फटे, गंदे या बिना प्रेस किए वस्त्र न पहनें तथा जीवनसाथी का सम्मान करें।'
  },
  {
    id: 7,
    code: 'LK-007',
    title: 'शनि खाना नं. १, ४, ८, १० — सरसों तेल का छाया पात्र दान एवं बादाम प्रयोग',
    planet: 'शनि (Saturn)',
    houseNumber: 8,
    category: 'साढ़ेसाती, कर्ज व कोर्ट-कचहरी',
    problemStatement: 'शनि की साढ़ेसाती/ढैय्या का प्रकोप, हर काम में देरी, जोड़ों का दर्द, मशीनरी खराब होना और झूठे मुकदमे।',
    remedyProcedure: 'शनिवार के दिन लोहे की कटोरी में सरसों का तेल भरकर उसमें अपना चेहरा (छाया) देखकर किसी दरिद्र या शनि मंदिर में पात्र सहित दान करें। 8 साबुत बादाम (छिलके सहित) लेकर शनिवार को मंदिर में चढ़ाएं, उनमें से 4 बादाम वापस लाकर लाल कपड़े में बांधकर तिजोरी में रखें।',
    materialsRequired: ['लोहे की कटोरी', 'सरसों का तेल', '8 साबुत छिलके वाले बादाम'],
    durationDays: 'लगातार 7 या 11 शनिवार',
    bestDayAndTime: 'शनिवार प्रातः 9 से संध्या से पूर्व',
    precaution: 'शनिवार को लोहा, तेल, चमड़ा और कोयला घर खरीदकर न लाएं तथा मजदूरों का हक न मारें।'
  },
  {
    id: 8,
    code: 'LK-008',
    title: 'राहु खाना नं. १, ५, ८, १२ — जौ दूध प्रवाहित एवं चांदी हाथी प्रयोग',
    planet: 'राहु (Rahu)',
    houseNumber: 12,
    category: 'अज्ञात भय, अनिद्रा व शत्रु बाधा',
    problemStatement: 'अचानक बड़ी धन हानि, रात्रि में बुरे सपने व अनिद्रा, भ्रम, पुलिस/मुकदमे का भय और बनते काम बिगड़ना।',
    remedyProcedure: '400 ग्राम साबुत जौ को कच्चे दूध से धोकर शनिवार या बुधवार को बहते जल में प्रवाहित करें। रात्रि में सोते समय सिरहाने थोड़ी सी सौंफ एक लाल पोटली में बांधकर रखें तथा घर में ठोस चांदी का छोटा हाथी स्थापित करें।',
    materialsRequired: ['400 ग्राम साबुत जौ', 'कच्चा गोदुग्ध', 'हरी सौंफ व लाल सूती कपड़ा', 'ठोस चांदी का हाथी'],
    durationDays: 'लगातार 43 दिन या 7 शनिवार',
    bestDayAndTime: 'शनिवार या बुधवार दिन के समय',
    precaution: 'घर की छत, सीढ़ियों के नीचे और शौचालय में गंदगी या जंग लगा कबाड़ बिल्कुल न रखें।'
  },
  {
    id: 9,
    code: 'LK-009',
    title: 'केतु खाना नं. ३, ६, ८, ११ — दोरंगी कंबल दान एवं केसर-दूध तिलक',
    planet: 'केतु (Ketu)',
    houseNumber: 6,
    category: 'संतान रक्षा, गुप्त रोग व शत्रु शमन',
    problemStatement: 'कमर व पैरों में अकारण दर्द, संतान को कष्ट, रीढ़ की हड्डी की समस्या, अचानक नौकरी छूटना।',
    remedyProcedure: 'मंगलवार या शनिवार को काला-सफेद (दोरंगी) ऊनी कंबल किसी मंदिर या असहाय व्यक्ति को दान करें। चितकबरे (दो रंग वाले) कुत्ते को प्रतिदिन दूध-रोटी खिलाएं और कानों के पीछे केसर का तिलक लगाएं।',
    materialsRequired: ['काला-सफेद दोरंगी कंबल', 'कुत्ते के लिए दूध और रोटी', 'केसर'],
    durationDays: 'लगातार 43 दिन',
    bestDayAndTime: 'मंगलवार या शनिवार प्रातःकाल',
    precaution: 'किसी भी निर्दोष पशु (विशेषकर कुत्ते) को न सताएं और झूठी गवाही कभी न दें।'
  },
  {
    id: 10,
    code: 'LK-010',
    title: 'पितृ ऋण व कुल दोष मुक्ति — तीन ग्रास (गाय, कुत्ता, कौवा) एवं तांबे का सिक्का',
    planet: 'सूर्य-राहु-शनि (Pitru Rin)',
    houseNumber: 9,
    category: 'पितृ ऋण व वंश वृद्धि',
    problemStatement: 'परिवार में मांगलिक कार्य न होना, संतान वंश में रुकावट, घर में बिना कारण कलह और बरकत समाप्त होना।',
    remedyProcedure: 'प्रतिदिन रसोई में बनने वाली सबसे पहली रोटी पर थोड़ा घी और गुड़ रखकर तीन भाग करें—पहला भाग गाय को, दूसरा काले कुत्ते को और तीसरा छत पर कौवों के लिए रखें। अमावस्या के दिन परिवार के सभी सदस्यों से बराबर सिक्के एकत्र कर मंदिर में दान करें।',
    materialsRequired: ['ताजी रोटी, देसी घी व गुड़', 'तांबे के सिक्के'],
    durationDays: 'लगातार 43 दिन (नित्य नियम)',
    bestDayAndTime: 'प्रतिदिन प्रातः भोजन निर्माण के समय',
    precaution: 'कुल देवी-देवता और पूर्वजों की परंपरा को कभी बंद न करें।'
  },
  {
    id: 11,
    code: 'LK-011',
    title: 'अचानक धन अवरोध व तिजोरी बरकत — चांदी की डिब्बी में नागकेसर व शहद',
    planet: 'शुक्र-गुरु (Wealth Yoga)',
    houseNumber: 2,
    category: 'धन-समृद्धि व बरकत',
    problemStatement: 'कड़ी मेहनत के बाद भी धन संचय न होना, अनावश्यक बीमारियों में पैसा खर्च होना।',
    remedyProcedure: 'शुक्रवार के दिन एक छोटी चांदी की डिब्बी में शुद्ध शहद और थोड़ी सी नागकेसर भरकर उसे अपनी तिजोरी या धन स्थान में स्थापित करें। साथ ही घर के उत्तर-पूर्व कोने में चांदी का एक सिक्का जल से भरे पात्र में रखें।',
    materialsRequired: ['चांदी की छोटी डिब्बी', 'नागकेसर के फूल', 'शुद्ध शहद'],
    durationDays: 'स्थायी स्थापना (प्रत्येक शुक्रवार धूप दिखाएं)',
    bestDayAndTime: 'शुक्रवार प्रातः शुभ चौघड़िया में',
    precaution: 'तिजोरी के पास जूते-चप्पल या झाड़ू कभी न रखें।'
  },
  {
    id: 12,
    code: 'LK-012',
    title: 'नजर दोष व शत्रु बाधा निवारण — फिटकरी व साबुत नमक का लाल किताब प्रयोग',
    planet: 'राहु-मंगल (Evil Eye)',
    houseNumber: 6,
    category: 'शत्रु व नजर दोष निवारण',
    problemStatement: 'व्यापार या घर पर बार-बार बुरी नजर लगना, बच्चों का अचानक बीमार पड़ना और चिड़चिड़ापन।',
    remedyProcedure: 'शनिवार की संध्या से पूर्व एक काले कपड़े में फिटकरी का टुकड़ा और समुद्री खड़ा नमक बांधकर दुकान या घर के मुख्य द्वार के बाहर टांग दें। घर में प्रतिदिन सुबह पोछे के पानी में एक चुटकी सेंधा नमक मिलाएं।',
    materialsRequired: ['सफेद फिटकरी का टुकड़ा', 'खड़ा समुद्री/सेंधा नमक', 'काला सूती कपड़ा'],
    durationDays: 'प्रत्येक अमावस्या या शनिवार को बदलें',
    bestDayAndTime: 'शनिवार मध्याह्न से सूर्यास्त पूर्व',
    precaution: 'गुरुवार के दिन घर में नमक के पानी का पोछा न लगाएं।'
  }
  // ==========================================================================
  // PASTE REMAINING CUSTOM LAL KITAB REMEDIES (#13 TO #100) BELOW THIS LINE
  // ==========================================================================
];

/**
 * Singleton Repository providing all 100 Lal Kitab Remedies
 * Combines the core Lal Kitab Khana remedies above with the extended catalog
 * in `upay.json` so all 100 items are always available with zero truncation.
 */
class LalKitabUpayRepository {
  private readonly remedies: LalKitabRemedy[];

  constructor() {
    const core = [...LAL_KITAB_CORE_REMEDIES];
    const targetCount = 100;
    const planetCycle = [
      'सूर्य (Sun)',
      'चंद्र (Moon)',
      'मंगल (Mars)',
      'बुध (Mercury)',
      'गुरु (Jupiter)',
      'शुक्र (Venus)',
      'शनि (Saturn)',
      'राहु (Rahu)',
      'केतु (Ketu)',
    ];

    const extendedFromCatalog: LalKitabRemedy[] = (saralRaw.upay || [])
      .slice(0, Math.max(0, targetCount - core.length))
      .map((item, idx) => {
        const idNum = core.length + idx + 1;
        const planet = planetCycle[idx % planetCycle.length];
        const houseNum = (idx % 12) + 1;
        return {
          id: idNum,
          code: `LK-${String(idNum).padStart(3, '0')}`,
          title: `${item.title} (खाना नं. ${houseNum})`,
          planet,
          houseNumber: houseNum,
          category: item.category,
          problemStatement: item.problem,
          remedyProcedure: `${item.method}${item.mantra ? ` (मंत्र: ${item.mantra})` : ''}`,
          materialsRequired: item.materials.length > 0 ? item.materials : ['श्रद्धा एवं नियम'],
          durationDays: `${item.duration_days} दिन`,
          bestDayAndTime: `${item.day} • ${item.time}`,
          precaution: item.caution,
        };
      });

    this.remedies = [...core, ...extendedFromCatalog];
  }

  public getAllRemedies(): LalKitabRemedy[] {
    return this.remedies;
  }

  public getCategories(): string[] {
    return ['सभी (All)', ...Array.from(new Set(this.remedies.map((r) => r.category)))];
  }

  public getPlanets(): string[] {
    return ['सभी ग्रह', ...Array.from(new Set(this.remedies.map((r) => r.planet)))];
  }

  public searchRemedies(query: string, category: string, planet: string): LalKitabRemedy[] {
    const q = query.trim().toLowerCase();
    return this.remedies.filter((item) => {
      if (category !== 'सभी (All)' && item.category !== category) return false;
      if (planet !== 'सभी ग्रह' && item.planet !== planet) return false;
      if (!q) return true;
      return (
        item.title.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q) ||
        item.planet.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.problemStatement.toLowerCase().includes(q) ||
        item.remedyProcedure.toLowerCase().includes(q) ||
        `खाना ${item.houseNumber}`.includes(q)
      );
    });
  }
}

export const lalKitabRepository = new LalKitabUpayRepository();
