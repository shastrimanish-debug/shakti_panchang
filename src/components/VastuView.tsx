import React, { useState } from 'react';
import {
  VASTU_DIRECTIONS,
  VASTU_ROOM_GUIDES,
  CHAMTKARI_VASTU_TIPS,
} from '../data/vastuData';
import {
  Compass,
  Home,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { useLanguage } from '../i18n';
import { UniversalStoryDeck, StorySlideItem } from './UniversalStoryDeck';

export const VastuView: React.FC<{
  onOpenUmaModal?: (query?: string) => void;
  onPrevChapter?: () => void;
  onNextChapter?: () => void;
}> = ({ onOpenUmaModal, onPrevChapter, onNextChapter }) => {
  const { language, t } = useLanguage();
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);

  const slides: StorySlideItem[] = [
    // Slide 1: Northeast (Ishan) & Main Entrance
    {
      id: 'ishan-entrance',
      title: 'ईशान कोण (NE) व मुख्य द्वार वास्तु',
      subtitle: 'जल तत्व • देव स्थान • सकारात्मक ऊर्जा',
      badge: 'सर्वश्रेष्ठ ऊर्जा',
      icon: '🧭',
      voiceText: 'ईशान कोण और मुख्य द्वार वास्तु। ईशान कोण में पूजा घर और खुला स्थान होना चाहिए।',
      content: (
        <div className="h-full flex flex-col justify-between py-1 space-y-2">
          <div className="p-3.5 rounded-2xl bg-white/95 border border-amber-300 shadow-sm space-y-2 my-auto text-xs">
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

    // Slide 2: Southeast (Agneya) & Kitchen
    {
      id: 'agneya-kitchen',
      title: 'आग्नेय कोण (SE) व रसोई घर वास्तु',
      subtitle: 'अग्नि तत्व • अन्नपूर्णा वास • स्वास्थ्य',
      badge: 'अग्नि वेला',
      icon: '🔥',
      voiceText: 'आग्नेय कोण और रसोई घर वास्तु।',
      content: (
        <div className="h-full flex flex-col justify-between py-1 space-y-2">
          <div className="p-3.5 rounded-2xl bg-white/95 border border-amber-300 shadow-sm space-y-2 my-auto text-xs">
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

    // Slide 3: Southwest (Nairutya) & Wealth Safe
    {
      id: 'nairutya-wealth',
      title: 'नैऋत्य कोण (SW) व धन तिजोरी',
      subtitle: 'पृथ्वी तत्व • स्थिरता • धन वृद्धि',
      badge: 'स्थिरता',
      icon: '💰',
      voiceText: 'नैऋत्य कोण और धन तिजोरी वास्तु।',
      content: (
        <div className="h-full flex flex-col justify-between py-1 space-y-2">
          <div className="p-3.5 rounded-2xl bg-white/95 border border-amber-300 shadow-sm space-y-2 my-auto text-xs">
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

    // Slide 4: Remedies Without Demolition
    {
      id: 'remedies-simple',
      title: 'बिना तोड़-फोड़ के चमत्कारी वास्तु उपाय',
      subtitle: 'सरल एवं अचूक वैदिक समाधान',
      badge: 'दोष निवारण',
      icon: '✨',
      voiceText: 'बिना तोड़-फोड़ के चमत्कारी वास्तु उपाय।',
      content: (
        <div className="h-full flex flex-col justify-between py-1 space-y-2">
          <div className="p-3.5 rounded-2xl bg-white/95 border border-amber-300 shadow-sm space-y-1.5 my-auto text-xs">
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

  return (
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
  );
};
export default VastuView;
