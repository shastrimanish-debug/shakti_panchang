import React, { useState } from 'react';
import {
  VASTU_DIRECTIONS,
  VASTU_ROOM_GUIDES,
  CHAMTKARI_VASTU_TIPS,
  VastuDirection,
  VastuZone,
} from '../data/vastuData';
import {
  Compass,
  Home,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ChevronRight,
  BookOpen,
  Info,
  Sliders,
  HelpCircle,
} from 'lucide-react';
import { useLanguage } from '../i18n';
import { UniversalStoryDeck, StorySlideItem } from './UniversalStoryDeck';
import { ZeroScrollPager } from './ZeroScrollPager';

type VastuTab = 'directions' | 'rooms' | 'checker' | 'remedies' | 'stories';

// Extended Room Vastu Data for rich coverage
const EXTENDED_ROOM_GUIDES = [
  ...VASTU_ROOM_GUIDES,
  {
    id: 'toilet',
    title: 'शौचालय व स्नानघर (Toilet & Bathroom)',
    bestDirection: 'पश्चिम (West) अथवा वायव्य कोण (North-West)',
    importance: 'नकारात्मक ऊर्जा का निष्कासन स्थान। गलत दिशा में होने पर भयंकर वास्तु दोष उत्पन्न होता है।',
    rules: [
      'ईशान कोण (उत्तर-पूर्व) में शौचालय कभी न बनाएं, इससे भारी धन हानि व वंश वृद्धि में बाधा आती है।',
      'कमोड का ढक्कन सदैव बंद रखें और शौचालय की दीवार रसोईघर से सटी नहीं होनी चाहिए।',
      'स्नानघर में नीले रंग की बाल्टी व मग रखना अत्यंत शुभ माना जाता है।',
      'शौचालय में कांच की कटोरी में खड़ा समुद्री नमक रखें जो नकारात्मकता सोख लेता है।'
    ],
    doshaConsequence: 'ईशान या पूर्व में शौचालय से गंभीर बीमारियां, ऋण व मानसिक संताप रहता है।',
    remedyWithoutDemolition: 'शौचालय के दरवाजे पर बाहर की ओर तांबे की पट्टी या शीशा लगाएं। अंदर समुद्री नमक की कटोरी रखें व दरवाज़ा बंद रखें।'
  },
  {
    id: 'staircase',
    title: 'सीढ़ियां (Staircase)',
    bestDirection: 'दक्षिण (South) या पश्चिम (West) या नैऋत्य कोण (South-West)',
    importance: 'सीढ़ियां भारी निर्माण का प्रतीक हैं, इनका सही स्थान भवन में संतुलन बनाए रखता है।',
    rules: [
      'सीढ़ियों की संख्या सदैव विषम (Odd) होनी चाहिए जैसे 11, 15, 17, 21 आदि।',
      'सीढ़ियां चढ़ते समय घुमाव घड़ी की सुई की दिशा (Clockwise) में होना चाहिए।',
      'सीढ़ियों के नीचे कभी भी पूजा घर, रसोई या शौचालय न बनाएं।',
      'उत्तर-पूर्व (ईशान) कोण में भारी सीढ़ी कभी न बनवाएं।'
    ],
    doshaConsequence: 'ईशान में सीढ़ी होने से मानसिक अशांति, व्यापारिक घाटा और घर के मुखिया पर कर्ज बढ़ता है।',
    remedyWithoutDemolition: 'सीढ़ियों के नीचे का स्थान खाली व स्वच्छ रखें। वहां पीतल के 2 पिरामिड लगाएं।'
  },
  {
    id: 'children_study',
    title: 'अध्ययन कक्ष व बच्चों का कमरा (Children & Study)',
    bestDirection: 'पूर्व (East), उत्तर (North) अथवा पश्चिम (West)',
    importance: 'बौद्धिक विकास, एकाग्रता और उज्ज्वल भविष्य का आधार।',
    rules: [
      'पढ़ते समय बच्चे का मुख पूर्व अथवा उत्तर दिशा की ओर होना चाहिए।',
      'स्टडी टेबल के ठीक ऊपर कोई बीम (Beam) नहीं होना चाहिए।',
      'कमरे में माँ सरस्वती का चित्र अथवा हंस की मूर्ति लगाएं।',
      'कमरे की दीवारें हल्के हरे, पीले या हल्के नीले रंग की होनी चाहिए।'
    ],
    doshaConsequence: 'दक्षिण-पश्चिम में बच्चों का कमरा होने से पढ़ाई में मन नहीं लगता और जिद्दीपन बढ़ता है।',
    remedyWithoutDemolition: 'स्टडी टेबल पर स्फटिक का पिरामिड या सरस्वती यंत्र रखें। प्रतिदिन गायत्री मंत्र का जप कराएं।'
  },
  {
    id: 'water_tank',
    title: 'जल टंकी व बोरवेल (Water Storage & Borewell)',
    bestDirection: 'भूमिगत टंकी/बोरवेल: ईशान (NE)। ओवरहेड टंकी: नैऋत्य (SW) या दक्षिण',
    importance: 'जल तत्व समृद्धि और जीवन धारा का प्रतीक है।',
    rules: [
      'भूमिगत पानी की टंकी, कुआं या बोरवेल सदैव ईशान कोण (उत्तर-पूर्व) में ही होना चाहिए।',
      'छत पर ओवरहेड वाटर टैंक सदैव नैऋत्य कोण (दक्षिण-पश्चिम) या दक्षिण में होना चाहिए।',
      'आग्नेय (अग्नि) कोण में पानी का गड्ढा कभी न बनवाएं।',
      'पानी का रिसाव (Leakage) तुरंत ठीक कराएं, यह धन अपव्यय का सूचक है।'
    ],
    doshaConsequence: 'आग्नेय में जल होने से शत्रु भय, अग्नि दुर्घटना व गृह क्लेश होता है।',
    remedyWithoutDemolition: 'यदि बोरवेल गलत दिशा में हो तो उसके आसपास हरा पेंट करें और आग्नेय में लाल बल्ब जलाएं।'
  }
];

// Matrix of Room vs Direction Vastu evaluation
const VASTU_EVALUATOR: Record<string, Record<string, { rating: 'best' | 'good' | 'average' | 'bad' | 'severe'; title: string; desc: string; remedy: string }>> = {
  main_door: {
    ishan: { rating: 'best', title: 'अति शुभ (ईशान द्वार)', desc: 'देवताओं की कृपा, सुख-समृद्धि व आरोग्य की प्राप्ति।', remedy: 'मुख्य द्वार पर ॐ व स्वस्तिक लगाएं।' },
    poorva: { rating: 'best', title: 'अति शुभ (इन्द्र द्वार)', desc: 'सूर्य देव की कृपा, समाज में प्रतिष्ठा व यश की वृद्धि।', remedy: 'तांबे का सूर्य यंत्र लगाएं।' },
    uttar: { rating: 'best', title: 'अति शुभ (कुबेर द्वार)', desc: 'कुबेर व लक्ष्मी का वास, निरंतर धन आगमन।', remedy: 'द्वार पर चांदी का स्वस्तिक व तुलसी रखें।' },
    pashchim: { rating: 'good', title: 'शुभ (वरुण द्वार)', desc: 'व्यापारिक लाभ व समृद्धिप्रद।', remedy: 'सफेद रंग का प्रयोग करें।' },
    aagneya: { rating: 'bad', title: 'दोषपूर्ण (आग्नेय द्वार)', desc: 'अग्नि दोष, क्रोध व महिलाओं को स्वास्थ्य कष्ट।', remedy: 'द्वार के बाहर लाल स्वस्तिक व पीतल पिरामिड लगाएं।' },
    dakshin: { rating: 'severe', title: 'महादोष (यम द्वार)', desc: 'अचानक दुर्घटनाएं, ऋण भार व अशांति।', remedy: 'हनुमान जी का पंचमुखी चित्र व सिद्ध वास्तु यंत्र लगाएं।' },
    nairutya: { rating: 'severe', title: 'महादोष (नैऋत्य द्वार)', desc: 'मानसिक तनाव, असफलता व पारिवारिक कलह।', remedy: 'पीतल का स्वास्तिक लगाएं व नैऋत्य को भारी रखें।' },
    vayavya: { rating: 'average', title: 'मध्यम (वायव्य द्वार)', desc: 'अत्यधिक यात्राएं व चंचलता।', remedy: 'श्वेत रंग व गणेश प्रतिमा लगाएं।' },
  },
  kitchen: {
    aagneya: { rating: 'best', title: 'सर्वोत्तम (अग्नि स्थान)', desc: 'अन्नपूर्णा कृपा, उत्तम स्वास्थ्य व समृद्धि।', remedy: 'पूर्व दिशा की ओर मुख करके भोजन बनाएं।' },
    vayavya: { rating: 'good', title: 'शुभ (द्वितीय विकल्प)', desc: 'अतिथि सत्कार व शांतिप्रद।', remedy: 'गैस चूल्हा पूर्व की ओर रखें।' },
    ishan: { rating: 'severe', title: 'घोर वास्तु दोष', desc: 'स्वास्थ्य हानि, संतान कष्ट व धन हानि।', remedy: 'गैस चूल्हे के नीचे पीला/हरा संगमरमर स्लैब रखें व आग्नेय में लाल बल्ब जलाएं।' },
    dakshin: { rating: 'average', title: 'सामान्य', desc: 'मानसिक अशांति रह सकती है।', remedy: 'रसोई में हरा पेंट कराएं।' },
    nairutya: { rating: 'bad', title: 'दोषपूर्ण', desc: 'गृहस्वामी को पाचन विकार व कलह।', remedy: 'रसोई में कांच की कटोरी में सेंधा नमक रखें।' },
    poorva: { rating: 'good', title: 'शुभ', desc: 'स्वास्थ्य अनुकूल रहता है।', remedy: 'चूल्हा आग्नेय में रखें।' },
    uttar: { rating: 'bad', title: 'दोषपूर्ण', desc: 'अनावश्यक धन व्यय व व्यापार हानि।', remedy: 'रसोई में पीला रंग रखें।' },
    pashchim: { rating: 'average', title: 'मध्यम', desc: 'भोजन की बर्बादी हो सकती है।', remedy: 'अन्नपूर्णा माता का चित्र लगाएं।' },
  },
  pooja_room: {
    ishan: { rating: 'best', title: 'परम पावन (देव कोण)', desc: 'ईश्वरीय ऊर्जा, शांति व आध्यात्मिक उन्नति।', remedy: 'नित्य प्रातः जल कलश व धूप-दीप जलाएं।' },
    poorva: { rating: 'best', title: 'अति शुभ', desc: 'ज्ञान, विवेक व उच्च चेतना।', remedy: 'पूर्व की ओर मुख करके पूजन करें।' },
    uttar: { rating: 'good', title: 'शुभ', desc: 'धन व समृद्धिप्रद।', remedy: 'कुबेर व लक्ष्मी जी का पूजन करें।' },
    dakshin: { rating: 'severe', title: 'महादोष', desc: 'पूजा का पूर्ण फल नहीं मिलता, अशान्ति।', remedy: 'मंदिर को ईशान कोण में स्थानांतरित करें।' },
    nairutya: { rating: 'severe', title: 'महादोष', desc: 'पितृ दोष व मानसिक भटकाव।', remedy: 'यहाँ केवल पूर्वजों के चित्र रखें, देव मंदिर ईशान में ले जाएं।' },
    aagneya: { rating: 'bad', title: 'दोषपूर्ण', desc: 'क्रोध व उग्रता बढ़ती है।', remedy: 'मंदिर में तांबे का जल कलश रखें।' },
    pashchim: { rating: 'good', title: 'शुभ (जैन/गुरु मंदिर)', desc: 'साधना में सफलता।', remedy: 'सफेद वस्त्र का प्रयोग करें।' },
    vayavya: { rating: 'average', title: 'मध्यम', desc: 'मन चंचल रहता है।', remedy: 'हनुमान जी की उपासना करें।' },
  },
  master_bedroom: {
    nairutya: { rating: 'best', title: 'सर्वोत्तम (गृहस्वामी स्थान)', desc: 'स्थिरता, दांपत्य सुख व नेतृत्व शक्ति।', remedy: 'सोते समय सिर दक्षिण में रखें।' },
    dakshin: { rating: 'good', title: 'अति शुभ', desc: 'गहरी नींद व उत्तम स्वास्थ्य।', remedy: 'भारी अलमारी दक्षिण दीवार पर रखें।' },
    pashchim: { rating: 'good', title: 'शुभ', desc: 'संतान सुख व सफलता।', remedy: 'नीला या स्लेटी रंग रखें।' },
    ishan: { rating: 'bad', title: 'दोषपूर्ण', desc: 'दांपत्य जीवन में अनबन व अनिद्रा।', remedy: 'इसे बच्चों या बुजुर्गों का ध्यान कक्ष बनाएं।' },
    aagneya: { rating: 'severe', title: 'महादोष', desc: 'पति-पत्नी में अकारण झगड़े व क्रोध।', remedy: 'बेड को दक्षिण-पश्चिम में खिसकाएं व कपूर जलाएं।' },
    vayavya: { rating: 'average', title: 'अतिथि/कन्या कक्ष हेतु शुभ', desc: 'नवविवाहित जोड़ों हेतु शुभ।', remedy: 'श्वेत रंग का प्रयोग करें।' },
    poorva: { rating: 'average', title: 'मध्यम', desc: 'अत्यधिक ऊर्जा से अनिद्रा।', remedy: 'हल्के रंगों का प्रयोग करें।' },
    uttar: { rating: 'bad', title: 'दोषपूर्ण', desc: 'धन हानि व स्वास्थ्य संबंधी समस्याएं।', remedy: 'सिर कभी उत्तर में रखकर न सोएं।' },
  },
};

export const VastuView: React.FC<{
  onOpenUmaModal?: (query?: string) => void;
  onPrevChapter?: () => void;
  onNextChapter?: () => void;
}> = ({ onOpenUmaModal, onPrevChapter, onNextChapter }) => {
  const { language, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<VastuTab>('directions');
  const [selectedDirection, setSelectedDirection] = useState<string>('ishan');
  const [selectedRoomCheck, setSelectedRoomCheck] = useState<string>('kitchen');
  const [selectedDirCheck, setSelectedDirCheck] = useState<string>('aagneya');
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);

  const activeDirData = VASTU_DIRECTIONS.find((d) => d.id === selectedDirection) || VASTU_DIRECTIONS[0];
  const evalResult = VASTU_EVALUATOR[selectedRoomCheck]?.[selectedDirCheck] || {
    rating: 'average',
    title: 'सामान्य स्थिति',
    desc: 'मध्यम फलप्रद स्थिति है।',
    remedy: 'घर में नियमित गूगल-कपूर की धूनी दें।'
  };

  const slides: StorySlideItem[] = [
    {
      id: 'ishan-entrance',
      title: 'ईशान कोण (NE) व मुख्य द्वार वास्तु',
      subtitle: 'जल तत्व • देव स्थान • सकारात्मक ऊर्जा',
      badge: 'सर्वश्रेष्ठ ऊर्जा',
      icon: '🧭',
      voiceText: 'ईशान कोण और मुख्य द्वार वास्तु। ईशान कोण में पूजा घर और खुला स्थान होना चाहिए।',
      content: (
        <div className="h-full flex flex-col justify-between py-1 space-y-2">
          <div className="p-3.5 rounded-2xl bg-white/95 border border-amber-300 shadow-xs space-y-2 my-auto text-xs">
            <div className="p-2 rounded-xl bg-emerald-50/80 border border-emerald-200">
              <div className="font-bold text-emerald-900 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>ईशान कोण (उत्तर-पूर्व): पूजा कक्ष व जल</span>
              </div>
              <p className="text-[11px] text-emerald-950 mt-0.5">
                ईशान कोण को सदा स्वच्छ, हल्का और पवित्र रखें। यहाँ मंदिर या गंगाजल का कलश स्थापित करना अत्यंत शुभ है।
              </p>
            </div>
            <div className="p-2 rounded-xl bg-amber-50/80 border border-amber-200">
              <div className="font-bold text-[#5C3A21] flex items-center gap-1">
                <Home className="w-3.5 h-3.5 text-amber-600" />
                <span>मुख्य द्वार (Main Entrance): ॐ व स्वस्तिक</span>
              </div>
              <p className="text-[11px] text-[#6E472A] mt-0.5">
                मुख्य द्वार पर सिन्दूर से ॐ व स्वस्तिक बनाएं। द्वार के सम्मुख अंधेरा या जूता-चप्पल न रखें।
              </p>
            </div>
          </div>
          <div className="text-[10px] text-center text-[#8C6239]">
            विश्वकर्मा संहिता अनुसार ईशान कोण से दिव्य ऊर्जा का प्रवेश होता है।
          </div>
        </div>
      ),
    },
    {
      id: 'agneya-kitchen',
      title: 'आग्नेय कोण (SE) व रसोई घर वास्तु',
      subtitle: 'अग्नि तत्व • अन्नपूर्णा वास • स्वास्थ्य',
      badge: 'अग्नि वेला',
      icon: '🔥',
      voiceText: 'आग्नेय कोण और रसोई घर वास्तु।',
      content: (
        <div className="h-full flex flex-col justify-between py-1 space-y-2">
          <div className="p-3.5 rounded-2xl bg-white/95 border border-amber-300 shadow-xs space-y-2 my-auto text-xs">
            <div className="p-2 rounded-xl bg-amber-50/80 border border-amber-200">
              <div className="font-bold text-amber-900">🔥 चूल्हा व गैस की सही दिशा</div>
              <p className="text-[11px] text-[#5C3A21] mt-0.5">
                रसोई घर दक्षिण-पूर्व (आग्नेय) में हो और भोजन बनाते समय मुख पूर्व दिशा की ओर होना चाहिए।
              </p>
            </div>
            <div className="p-2 rounded-xl bg-rose-50/80 border border-rose-200">
              <div className="font-bold text-rose-900 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                <span>सावधानी: अग्नि व जल का संतुलन</span>
              </div>
              <p className="text-[11px] text-rose-950 mt-0.5">
                गैस चूल्हा और पानी का नल (सिंक) कभी बिल्कुल पास-पास न रखें। दोनों के बीच लकड़ी का विभाजन रखें।
              </p>
            </div>
          </div>
          <div className="text-[10px] text-center text-[#8C6239]">
            माँ अन्नपूर्णा का स्मरण कर पहली रोटी गाय हेतु निकालें।
          </div>
        </div>
      ),
    },
    {
      id: 'nairutya-wealth',
      title: 'नैऋत्य कोण (SW) व धन तिजोरी',
      subtitle: 'पृथ्वी तत्व • स्थिरता • धन वृद्धि',
      badge: 'स्थिरता',
      icon: '💰',
      voiceText: 'नैऋत्य कोण और धन तिजोरी वास्तु।',
      content: (
        <div className="h-full flex flex-col justify-between py-1 space-y-2">
          <div className="p-3.5 rounded-2xl bg-white/95 border border-amber-300 shadow-xs space-y-2 my-auto text-xs">
            <div className="p-2 rounded-xl bg-amber-50/80 border border-amber-200">
              <div className="font-bold text-[#5C3A21]">💰 धन स्थान व तिजोरी की दिशा</div>
              <p className="text-[11px] text-[#6E472A] mt-0.5">
                अलमारी या तिजोरी दक्षिण दीवार से सटाकर रखें, ताकि उसका मुख उत्तर (कुबेर दिशा) की ओर खुले।
              </p>
            </div>
            <div className="p-2 rounded-xl bg-emerald-50/80 border border-emerald-200">
              <div className="font-bold text-emerald-900">🛏️ मुख्य शयनकक्ष (Master Bed)</div>
              <p className="text-[11px] text-emerald-950 mt-0.5">
                सोते समय सिर दक्षिण या पूर्व दिशा में होना चाहिए। उत्तर में सिर करके कभी न सोएं।
              </p>
            </div>
          </div>
          <div className="text-[10px] text-center text-[#8C6239]">
            उत्तर दिशा के स्वामी भगवान कुबेर धन और समृद्धि प्रदान करते हैं।
          </div>
        </div>
      ),
    },
    {
      id: 'remedies-simple',
      title: 'बिना तोड़-फोड़ के चमत्कारी वास्तु उपाय',
      subtitle: 'सरल एवं अचूक वैदिक समाधान',
      badge: 'दोष निवारण',
      icon: '✨',
      voiceText: 'बिना तोड़-फोड़ के चमत्कारी वास्तु उपाय।',
      content: (
        <div className="h-full flex flex-col justify-between py-1 space-y-2">
          <div className="p-3.5 rounded-2xl bg-white/95 border border-amber-300 shadow-xs space-y-1.5 my-auto text-xs">
            <div className="flex items-start gap-1.5">
              <span className="text-amber-600 font-bold">१.</span>
              <span><strong>समुद्री नमक:</strong> कांच की कटोरी में खड़ा नमक रखकर शौचालय व कोनों में रखें।</span>
            </div>
            <div className="flex items-start gap-1.5">
              <span className="text-amber-600 font-bold">२.</span>
              <span><strong>कपूर आरती:</strong> नित्य सायं भीमसेनी कपूर व लौंग जलाकर घर में घुमाएं।</span>
            </div>
            <div className="flex items-start gap-1.5">
              <span className="text-amber-600 font-bold">३.</span>
              <span><strong>तुलसी का पौधा:</strong> पूर्व या उत्तर दिशा में पावन तुलसी दल स्थापित करें।</span>
            </div>
            <div className="flex items-start gap-1.5">
              <span className="text-amber-600 font-bold">४.</span>
              <span><strong>पीतल का पिरामिड:</strong> मुख्य द्वार दोष निवारण हेतु अष्टकोणीय दर्पण या पिरामिड लगाएं।</span>
            </div>
          </div>
          <div className="text-[10px] text-center text-[#8C6239]">
            घर में मधुर शंख ध्वनि व ॐ का उच्चारण सभी नकारात्मक तरंगों को नष्ट करता है।
          </div>
        </div>
      ),
    },
  ];

  if (activeTab === 'stories') {
    return (
      <div className="h-full w-full flex flex-col min-h-0 relative">
        <div className="p-2 bg-amber-50 border-b border-amber-200 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('directions')}
            className="text-xs font-bold text-amber-900 bg-white px-3 py-1.5 rounded-lg border border-amber-300 flex items-center gap-1"
          >
            ← वास्तु शास्त्र ज्ञान सूची
          </button>
          <span className="text-xs font-black text-[#5C3A21]">स्टोरी व्यू</span>
        </div>
        <div className="flex-1 min-h-0">
          <UniversalStoryDeck
            slides={slides}
            currentSlideIndex={activeSlideIndex}
            onSlideIndexChange={setActiveSlideIndex}
            headerTitle="वैदिक वास्तु शास्त्र"
            headerIcon="🏡"
            chapterNumber={11}
            onOpenUma={onOpenUmaModal ? () => onOpenUmaModal('घर का वास्तु दोष एवं निवारण उपाय') : undefined}
            onPrevChapter={onPrevChapter}
            onNextChapter={onNextChapter}
            prevChapterLabel="गीता श्लोक"
            nextChapterLabel="दुर्गा सप्तशती"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-0 flex flex-col bg-[#FAF6EE] text-[#3E2714] overflow-hidden">
      {/* Top Header */}
      <div className="shrink-0 p-3 bg-white border-b border-amber-200 shadow-xs flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏡</span>
            <div>
              <h1 className="text-base font-black text-[#5C3A21] font-granth leading-tight">
                वैदिक वास्तु शास्त्र एवं दिशा ज्ञान
              </h1>
              <p className="text-[11px] text-[#8C6239] font-medium">
                ८ दिशाएं • गृह निर्माण नियम • बिना तोड़-फोड़ के उपाय
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setActiveTab('stories')}
            className="px-2.5 py-1 rounded-lg bg-amber-500 text-white text-xs font-bold flex items-center gap-1 shadow-xs hover:bg-amber-600 transition"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>स्टोरी व्यू</span>
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pt-1 border-t border-amber-100">
          <button
            type="button"
            onClick={() => setActiveTab('directions')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition flex items-center gap-1 cursor-pointer ${
              activeTab === 'directions'
                ? 'bg-[#B56A00] text-white shadow-xs'
                : 'bg-amber-50 text-[#5C3A21] hover:bg-amber-100'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>८ दिशा ज्ञान</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('rooms')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition flex items-center gap-1 cursor-pointer ${
              activeTab === 'rooms'
                ? 'bg-[#B56A00] text-white shadow-xs'
                : 'bg-amber-50 text-[#5C3A21] hover:bg-amber-100'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>कमरे व स्थान वास्तु</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('checker')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition flex items-center gap-1 cursor-pointer ${
              activeTab === 'checker'
                ? 'bg-[#B56A00] text-white shadow-xs'
                : 'bg-amber-50 text-[#5C3A21] hover:bg-amber-100'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>वास्तु दोष चेकर</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('remedies')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition flex items-center gap-1 cursor-pointer ${
              activeTab === 'remedies'
                ? 'bg-[#B56A00] text-white shadow-xs'
                : 'bg-amber-50 text-[#5C3A21] hover:bg-amber-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>अचूक उपाय</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <ZeroScrollPager className="flex-1 min-h-0" contentClassName="p-3 space-y-4" resetKey={activeTab}>
        {/* TAB 1: 8 DIRECTIONS (८ दिशाएं) */}
        {activeTab === 'directions' && (
          <div className="space-y-3">
            {/* Direction Selector Grid */}
            <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-5">
              {VASTU_DIRECTIONS.map((dir) => (
                <button
                  key={dir.id}
                  type="button"
                  onClick={() => setSelectedDirection(dir.id)}
                  className={`p-2 rounded-xl text-center border transition cursor-pointer flex flex-col items-center justify-center ${
                    selectedDirection === dir.id
                      ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                      : 'bg-white border-amber-200 text-[#5C3A21] hover:border-amber-400'
                  }`}
                >
                  <span className="text-xs font-black truncate">{dir.hindiName.split(' ')[0]}</span>
                  <span className="text-[9px] opacity-80">{dir.ruler.split(' ')[0]}</span>
                </button>
              ))}
            </div>

            {/* Selected Direction Detail Card */}
            <div className="p-4 rounded-2xl bg-white border-2 border-amber-300 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-amber-100 pb-2">
                <div>
                  <h2 className="text-lg font-black font-granth text-[#5C3A21]">
                    {activeDirData.name}
                  </h2>
                  <p className="text-xs text-[#8C6239]">
                    स्वामी: <strong>{activeDirData.ruler}</strong> • ग्रह: <strong>{activeDirData.planet}</strong> • तत्व: <strong>{activeDirData.element}</strong>
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold border border-amber-200">
                  {activeDirData.color}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* DO's (सर्वश्रेष्ठ निर्माण) */}
                <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200 space-y-1.5">
                  <div className="font-bold text-emerald-900 flex items-center gap-1 text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>यहाँ क्या होना चाहिए (शुभ निर्माण):</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-emerald-950 text-[11px]">
                    {activeDirData.idealFor.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>

                {/* DON'Ts (क्या न बनाएं) */}
                <div className="p-3 rounded-xl bg-rose-50/80 border border-rose-200 space-y-1.5">
                  <div className="font-bold text-rose-900 flex items-center gap-1 text-xs">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>यहाँ क्या कदापि न बनाएं (वर्जित):</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-rose-950 text-[11px]">
                    {activeDirData.avoid.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Exact Remedy */}
              <div className="p-3 rounded-xl bg-amber-50/90 border border-amber-300 text-xs space-y-1">
                <div className="font-bold text-[#5C3A21] flex items-center gap-1">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>दोष निवारण उपाय (बिना तोड़े):</span>
                </div>
                <p className="text-[11px] text-[#6E472A] leading-relaxed">
                  {activeDirData.remedy}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ROOMS & SPACES (कमरे व स्थान वास्तु) */}
        {activeTab === 'rooms' && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {EXTENDED_ROOM_GUIDES.map((room) => (
                <div
                  key={room.id}
                  className="p-3.5 rounded-2xl bg-white border border-amber-200/90 shadow-xs space-y-2 hover:border-amber-400 transition"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-black text-[#5C3A21] font-granth">
                        {room.title}
                      </h3>
                      <p className="text-[11px] text-amber-800 font-bold">
                        सर्वोत्तम दिशा: {room.bestDirection}
                      </p>
                    </div>
                  </div>

                  <p className="text-[11px] text-stone-600 leading-snug">
                    {room.importance}
                  </p>

                  <div className="space-y-1 bg-amber-50/60 p-2 rounded-xl text-[11px]">
                    <span className="font-bold text-[#8C6239]">शास्त्रोक्त नियम:</span>
                    <ul className="list-disc list-inside space-y-0.5 text-[#3E2714]">
                      {room.rules.map((r, idx) => (
                        <li key={idx}>{r}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-2 rounded-xl bg-rose-50/70 border border-rose-200 text-[11px] text-rose-950">
                    <strong>दोष परिणाम: </strong>{room.doshaConsequence}
                  </div>

                  <div className="p-2 rounded-xl bg-emerald-50/70 border border-emerald-200 text-[11px] text-emerald-950">
                    <strong>सरल उपाय: </strong>{room.remedyWithoutDemolition}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: VASTU CHECKER TOOL (वास्तु दोष चेकर) */}
        {activeTab === 'checker' && (
          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-white border-2 border-amber-300 shadow-sm space-y-3">
              <div className="flex items-center gap-2 border-b border-amber-100 pb-2">
                <ShieldCheck className="w-5 h-5 text-amber-600" />
                <h2 className="text-sm font-black text-[#5C3A21]">
                  वास्तु दोष परीक्षक एवं त्वरित निवारण
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Select Room */}
                <div>
                  <label className="block text-xs font-bold text-[#8C6239] mb-1">
                    १. कमरा या स्थान चुनें:
                  </label>
                  <select
                    value={selectedRoomCheck}
                    onChange={(e) => setSelectedRoomCheck(e.target.value)}
                    className="w-full p-2 rounded-xl border border-amber-300 bg-amber-50/50 text-xs font-bold text-[#5C3A21] focus:outline-none"
                  >
                    <option value="main_door">मुख्य द्वार (Main Door)</option>
                    <option value="kitchen">रसोईघर (Kitchen)</option>
                    <option value="pooja_room">पूजा घर (Pooja Room)</option>
                    <option value="master_bedroom">मास्टर बेडरूम (Bedroom)</option>
                  </select>
                </div>

                {/* Select Direction */}
                <div>
                  <label className="block text-xs font-bold text-[#8C6239] mb-1">
                    २. यह किस दिशा में स्थित है?
                  </label>
                  <select
                    value={selectedDirCheck}
                    onChange={(e) => setSelectedDirCheck(e.target.value)}
                    className="w-full p-2 rounded-xl border border-amber-300 bg-amber-50/50 text-xs font-bold text-[#5C3A21] focus:outline-none"
                  >
                    <option value="ishan">ईशान कोण (North-East / उत्तर-पूर्व)</option>
                    <option value="poorva">पूर्व दिशा (East)</option>
                    <option value="aagneya">आग्नेय कोण (South-East / दक्षिण-पूर्व)</option>
                    <option value="dakshin">दक्षिण दिशा (South)</option>
                    <option value="nairutya">नैऋत्य कोण (South-West / दक्षिण-पश्चिम)</option>
                    <option value="pashchim">पश्चिम दिशा (West)</option>
                    <option value="vayavya">वायव्य कोण (North-West / उत्तर-पश्चिम)</option>
                    <option value="uttar">उत्तर दिशा (North)</option>
                  </select>
                </div>
              </div>

              {/* Evaluation Output Result */}
              <div
                className={`p-4 rounded-2xl border space-y-2 ${
                  evalResult.rating === 'best'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                    : evalResult.rating === 'good'
                    ? 'bg-blue-50 border-blue-300 text-blue-950'
                    : evalResult.rating === 'average'
                    ? 'bg-amber-50 border-amber-300 text-amber-950'
                    : 'bg-rose-50 border-rose-300 text-rose-950'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black font-granth text-base">
                    {evalResult.title}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                      evalResult.rating === 'best' || evalResult.rating === 'good'
                        ? 'bg-emerald-200 text-emerald-900'
                        : 'bg-rose-200 text-rose-900'
                    }`}
                  >
                    {evalResult.rating === 'best'
                      ? 'उत्तम शुभ'
                      : evalResult.rating === 'good'
                      ? 'शुभ अनुकूल'
                      : evalResult.rating === 'average'
                      ? 'मध्यम'
                      : 'वास्तु दोष'}
                  </span>
                </div>

                <p className="text-xs leading-relaxed">{evalResult.desc}</p>

                <div className="p-2.5 rounded-xl bg-white/90 border border-current text-xs space-y-1">
                  <div className="font-bold flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>बिना तोड़-फोड़ के त्वरित उपाय:</span>
                  </div>
                  <p className="text-[11px] font-medium">{evalResult.remedy}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: REMEDIES WITHOUT DEMOLITION (अचूक उपाय) */}
        {activeTab === 'remedies' && (
          <div className="space-y-3">
            <div className="p-3 rounded-2xl bg-amber-100/70 border border-amber-300 text-xs text-[#5C3A21] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-700 shrink-0" />
              <span>
                ये सभी उपाय <strong>वैदिक विश्वकर्मा संहिता</strong> पर आधारित हैं, जिन्हें बिना किसी तोड़-फोड़ के सरलता से किया जा सकता है।
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {CHAMTKARI_VASTU_TIPS.map((tip) => (
                <div
                  key={tip.id}
                  className="p-4 rounded-2xl bg-white border border-amber-200/90 shadow-xs space-y-2 hover:border-amber-400 transition"
                >
                  <h3 className="text-sm font-black text-[#5C3A21] font-granth flex items-center gap-1.5">
                    <span className="text-amber-600">✦</span>
                    <span>{tip.title}</span>
                  </h3>

                  <p className="text-xs text-amber-900 font-medium bg-amber-50/80 p-2 rounded-xl border border-amber-200/60">
                    <strong>उद्देश्य: </strong>{tip.purpose}
                  </p>

                  <div className="text-[11px] space-y-1">
                    <div>
                      <strong>सामग्री: </strong>
                      <span className="text-stone-700">{tip.materials}</span>
                    </div>
                    <div>
                      <strong>सर्वोत्तम समय: </strong>
                      <span className="text-stone-700">{tip.bestTime}</span>
                    </div>
                  </div>

                  <div className="pt-1">
                    <span className="text-[11px] font-bold text-[#8C6239]">चरणबद्ध प्रयोग विधि:</span>
                    <ol className="list-decimal list-inside space-y-1 text-[11px] text-[#3E2714] mt-0.5">
                      {tip.method.map((m, idx) => (
                        <li key={idx}>{m}</li>
                      ))}
                    </ol>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </ZeroScrollPager>

      {/* Footer Ask Uma Button */}
      {onOpenUmaModal && (
        <div className="p-2.5 bg-white border-t border-amber-200 shrink-0 flex items-center justify-between">
          <span className="text-xs text-[#8C6239] font-medium">
            व्यक्तिगत घर/दुकान के वास्तु नक्शे की जांच हेतु
          </span>
          <button
            type="button"
            onClick={() => onOpenUmaModal('मेरे मकान का नक्शा व वास्तु दोष उपाय बताएं')}
            className="px-3 py-1.5 rounded-xl bg-[#5C3A21] text-amber-200 text-xs font-bold flex items-center gap-1 hover:bg-[#462B17] transition cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>उमा वास्तु सलाह</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default VastuView;
