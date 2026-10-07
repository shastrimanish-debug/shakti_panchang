import React, { useState, useMemo } from 'react';
import {
  PLANETS_UPAY_DATA,
  MAJOR_DOSHAS_UPAY,
} from '../data/upayData';
import { KundaliData } from '../types';
import {
  Sparkles,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { useLanguage } from '../i18n';
import { UniversalStoryDeck, StorySlideItem } from './UniversalStoryDeck';

interface UpayViewProps {
  activeKundali: KundaliData | null;
  onOpenKundaliTab?: () => void;
  onOpenUmaWithQuery?: (query: string) => void;
  onPrevChapter?: () => void;
  onNextChapter?: () => void;
}

export const UpayView: React.FC<UpayViewProps> = ({
  activeKundali,
  onOpenKundaliTab,
  onOpenUmaWithQuery,
  onPrevChapter,
  onNextChapter,
}) => {
  const { language, t } = useLanguage();
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);

  const slides: StorySlideItem[] = [
    // Slide 1: Personalized Kundali Upay
    {
      id: 'personal-upay',
      title: activeKundali ? `${activeKundali.name} की कुण्डली उपाय` : 'व्यक्तिगत कुण्डली ग्रह शांति',
      subtitle: activeKundali ? `लग्न: ${activeKundali.lagnaRashi} • राशि: ${activeKundali.moonRashi}` : 'ग्रह शांति विश्लेषण',
      badge: 'कुण्डली अनुकूल',
      icon: '🪔',
      voiceText: 'आपकी कुण्डली के अनुसार ग्रह शांति व अचूक उपाय।',
      content: (
        <div className="h-full flex flex-col justify-between py-1 space-y-2">
          <div className="p-3.5 rounded-2xl bg-amber-50/90 border-2 border-amber-300 shadow-sm space-y-2 my-auto text-xs">
            <div className="font-black text-[#5C3A21] flex items-center gap-1.5 text-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#B56A00]" />
              <span>नित्य पावन वैदिक नियम</span>
            </div>
            <p className="text-[11px] text-[#3E2714] leading-relaxed">
              प्रातःकाल सूर्योदय के समय तांबे के लोटे से सूर्य देव को जल अर्पित करें और <strong>॥ ॐ सूर्याय नमः ॥</strong> का ११ बार जप करें।
            </p>
            <div className="p-2 rounded-xl bg-white border border-amber-200 text-[11px]">
              <span className="font-bold text-[#B56A00]">दैनिक दान: </span>
              <span>पक्षियों को दाना और गाय को नित्य पहली रोटी गुड़ के साथ दें।</span>
            </div>
          </div>
          <div className="text-[10px] text-center text-[#8C6239]">
            विस्तृत महादशा उपाय हेतु 'उमा परामर्श' प्राप्त करें।
          </div>
        </div>
      ),
    },

    // Slide 2: Sun, Moon & Mars
    {
      id: 'sun-moon-mars',
      title: 'सूर्य, चन्द्र व मंगल ग्रह उपाय',
      subtitle: 'आरोग्य, मानसिक शांति व पराक्रम',
      badge: 'तेज व शक्ति',
      icon: '☀️',
      voiceText: 'सूर्य, चन्द्रमा और मंगल ग्रह के अचूक वैदिक उपाय।',
      content: (
        <div className="h-full flex flex-col justify-between py-1 space-y-1.5">
          <div className="space-y-1.5 my-auto text-xs">
            <div className="p-2 rounded-xl bg-orange-50 border border-orange-200">
              <div className="font-bold text-orange-950">☀️ सूर्य शांति: पिता की सेवा व तांबे का दान</div>
              <p className="text-[10px] text-orange-900 mt-0.5">आदित्य हृदय स्तोत्र पाठ व रविवार को नमक रहित भोजन।</p>
            </div>
            <div className="p-2 rounded-xl bg-sky-50 border border-sky-200">
              <div className="font-bold text-sky-950">🌕 चन्द्र शांति: माता का आशीर्वाद व शिव अभिषेक</div>
              <p className="text-[10px] text-sky-900 mt-0.5">सोमवार को दूध व जल से शिवलिंग का अभिषेक व चांदी धारण।</p>
            </div>
            <div className="p-2 rounded-xl bg-rose-50 border border-rose-200">
              <div className="font-bold text-rose-950">🔴 मंगल शांति: हनुमान चालीसा व मसूर दान</div>
              <p className="text-[10px] text-rose-900 mt-0.5">मंगलवार को सिन्दूर अर्पण व छोटे भाइयों से मधुर संबंध।</p>
            </div>
          </div>
          <div className="text-[10px] text-center text-[#8C6239]">
            शुभ ग्रहों का मंत्र जप सदा फलदायी होता है।
          </div>
        </div>
      ),
    },

    // Slide 3: Mercury, Jupiter & Venus
    {
      id: 'mercury-jupiter-venus',
      title: 'बुध, गुरु व शुक्र ग्रह उपाय',
      subtitle: 'बुद्धि, ज्ञान, समृद्धि व सुख',
      badge: 'विद्या व वैभव',
      icon: '🌿',
      voiceText: 'बुध, बृहस्पति और शुक्र ग्रह के वैदिक उपाय।',
      content: (
        <div className="h-full flex flex-col justify-between py-1 space-y-1.5">
          <div className="space-y-1.5 my-auto text-xs">
            <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200">
              <div className="font-bold text-emerald-950">💚 बुध शांति: गौ सेवा व हरी मूंग का दान</div>
              <p className="text-[10px] text-emerald-900 mt-0.5">बुधवार को गणेश जी को दूर्वा अर्पित करें व किन्नरों का सम्मान करें।</p>
            </div>
            <div className="p-2 rounded-xl bg-amber-50 border border-amber-200">
              <div className="font-bold text-amber-950">💛 गुरु शांति: चने की दाल, हल्दी व गुरु सेवा</div>
              <p className="text-[10px] text-amber-900 mt-0.5">गुरुवार को केले के वृक्ष का पूजन व विष्णु सहस्रनाम पाठ।</p>
            </div>
            <div className="p-2 rounded-xl bg-purple-50 border border-purple-200">
              <div className="font-bold text-purple-950">🤍 शुक्र शांति: माँ लक्ष्मी पूजन व श्वेत वस्त्र</div>
              <p className="text-[10px] text-purple-900 mt-0.5">शुक्रवार को खीर का भोग व इत्र/सुगंध का प्रयोग।</p>
            </div>
          </div>
          <div className="text-[10px] text-center text-[#8C6239]">
            समस्त नवग्रह शांति मन्त्र नित्य कल्याण करते हैं।
          </div>
        </div>
      ),
    },

    // Slide 4: Saturn, Rahu & Ketu
    {
      id: 'saturn-rahu-ketu',
      title: 'शनि, राहु व केतु शांति उपाय',
      subtitle: 'साढ़ेसाती, ढैया व छाया ग्रह शांति',
      badge: 'छाया ग्रह शांति',
      icon: '🪐',
      voiceText: 'शनि, राहु और केतु ग्रह के अचूक वैदिक उपाय।',
      content: (
        <div className="h-full flex flex-col justify-between py-1 space-y-1.5">
          <div className="space-y-1.5 my-auto text-xs">
            <div className="p-2 rounded-xl bg-stone-100 border border-stone-300">
              <div className="font-bold text-stone-900">🖤 शनि शांति: सरसों तेल का छाया दान व पीपल पूजन</div>
              <p className="text-[10px] text-stone-800 mt-0.5">शनिवार सायं पीपल वृक्ष पर तिल तेल का दीप जलाएं व गरीबों की सहायता करें।</p>
            </div>
            <div className="p-2 rounded-xl bg-indigo-50 border border-indigo-200">
              <div className="font-bold text-indigo-950">🌌 राहु शांति: काले कुत्ते को रोटी व भैरव उपासना</div>
              <p className="text-[10px] text-indigo-900 mt-0.5">पक्षियों को बाजरा व सात प्रकार के अनाज (सप्तधान्य) का दान।</p>
            </div>
            <div className="p-2 rounded-xl bg-amber-50 border border-amber-200">
              <div className="font-bold text-amber-950">🚩 केतु शांति: गणेश अथर्वशीर्ष पाठ व कंबल दान</div>
              <p className="text-[10px] text-amber-900 mt-0.5">धार्मिक स्थलों पर ध्वजा अर्पण व असहायों को भोजन कराएं।</p>
            </div>
          </div>
          <div className="text-[10px] text-center text-[#8C6239]">
            भगवान शिव व हनुमान जी की उपासना से समस्त क्रूर ग्रह शांत होते हैं।
          </div>
        </div>
      ),
    },

    // Slide 5: Major Dosha Remedies
    {
      id: 'major-doshas',
      title: 'मांगलिक, कालसर्प व पितृ दोष उपाय',
      subtitle: 'प्रमुख जन्म कुण्डली दोष निवारण',
      badge: 'दोष मुक्ति',
      icon: '🛡️',
      voiceText: 'मांगलिक, कालसर्प और पितृ दोष निवारण उपाय।',
      content: (
        <div className="h-full flex flex-col justify-between py-1 space-y-1.5">
          <div className="space-y-1.5 my-auto text-xs">
            <div className="p-2 rounded-xl bg-rose-50 border border-rose-200">
              <div className="font-bold text-rose-950">🌺 मांगलिक दोष: कुंभ विवाह व मंगल चण्डिका स्तोत्र</div>
              <p className="text-[10px] text-rose-900 mt-0.5">मंगलवार को मसूर दाल दान व हनुमान जी को चोला अर्पण।</p>
            </div>
            <div className="p-2 rounded-xl bg-indigo-50 border border-indigo-200">
              <div className="font-bold text-indigo-950">🐍 कालसर्प योग: महामृत्युंजय जप व नाग-नागिन अर्पण</div>
              <p className="text-[10px] text-indigo-900 mt-0.5">नागपंचमी पर चांदी के नाग-नागिन बहते जल में प्रवाहित करें।</p>
            </div>
            <div className="p-2 rounded-xl bg-amber-50 border border-amber-200">
              <div className="font-bold text-amber-950">🕉️ पितृ दोष: अमावस्या तर्पण व पीपल पर जल</div>
              <p className="text-[10px] text-amber-900 mt-0.5">अमावस्या को ब्राह्मण भोजन, कौवे व गाय को ग्रास दें।</p>
            </div>
          </div>
          <div className="text-[10px] text-center text-[#8C6239]">
            श्रद्धा और नियम से किए गए उपाय अवश्य फल देते हैं।
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
      headerTitle="ग्रह शांति व चमत्कारी उपाय"
      headerIcon="🪔"
      chapterNumber={13}
      onOpenUma={onOpenUmaWithQuery ? () => onOpenUmaWithQuery('मेरी कुण्डली के अनुसार सबसे सटीक उपाय') : undefined}
      onPrevChapter={onPrevChapter}
      onNextChapter={onNextChapter}
      prevChapterLabel="दुर्गा सप्तशती"
      nextChapterLabel="अंकशास्त्र"
    />
  );
};
export default UpayView;
