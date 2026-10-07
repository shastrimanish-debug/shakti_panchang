import React, { useState } from 'react';
import {
  NAVARATNA_DATA,
  GemstoneData,
} from '../services/spiritualModules';
import { useTranslation } from '../i18n';
import { Sparkles, ShieldCheck } from 'lucide-react';
import { UniversalStoryDeck, StorySlideItem } from './UniversalStoryDeck';

interface GemologyViewProps {
  onOpenUmaWithQuery?: (query: string) => void;
  onPrevChapter?: () => void;
  onNextChapter?: () => void;
}

export const GemologyView: React.FC<GemologyViewProps> = ({
  onOpenUmaWithQuery,
  onPrevChapter,
  onNextChapter,
}) => {
  const { t } = useTranslation();
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);

  const slides: StorySlideItem[] = [
    // Slide 1: Navaratna Overview
    {
      id: 'navaratna-overview',
      title: 'वैदिक नवरत्न विज्ञान',
      subtitle: '९ ग्रहों के दिव्य ऊर्जावान रत्न',
      badge: 'नवरत्न चक्र',
      icon: '💎',
      voiceText: 'वैदिक नवरत्न विज्ञान। नौ ग्रहों के शुभ रत्न और उनके फल।',
      content: (
        <div className="h-full flex flex-col justify-between py-1 space-y-2">
          <div className="p-3.5 rounded-2xl bg-amber-50/90 border-2 border-amber-300 shadow-sm my-auto space-y-2">
            <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
              <div className="p-2 rounded-xl bg-white border border-amber-200">
                <span className="text-base">🔴</span>
                <div className="font-bold text-[#462B17]">माणिक्य (Ruby)</div>
                <div className="text-[9px] text-[#8C6239]">सूर्य देव</div>
              </div>
              <div className="p-2 rounded-xl bg-white border border-amber-200">
                <span className="text-base">⚪</span>
                <div className="font-bold text-[#462B17]">मोती (Pearl)</div>
                <div className="text-[9px] text-[#8C6239]">चन्द्र देव</div>
              </div>
              <div className="p-2 rounded-xl bg-white border border-amber-200">
                <span className="text-base">🔺</span>
                <div className="font-bold text-[#462B17]">मूंगा (Coral)</div>
                <div className="text-[9px] text-[#8C6239]">मंगल देव</div>
              </div>
              <div className="p-2 rounded-xl bg-white border border-amber-200">
                <span className="text-base">🟢</span>
                <div className="font-bold text-[#462B17]">पन्ना (Emerald)</div>
                <div className="text-[9px] text-[#8C6239]">बुध देव</div>
              </div>
              <div className="p-2 rounded-xl bg-white border border-amber-200">
                <span className="text-base">💛</span>
                <div className="font-bold text-[#462B17]">पुखराज (Sapphire)</div>
                <div className="text-[9px] text-[#8C6239]">गुरु देव</div>
              </div>
              <div className="p-2 rounded-xl bg-white border border-amber-200">
                <span className="text-base">💎</span>
                <div className="font-bold text-[#462B17]">हीरा (Diamond)</div>
                <div className="text-[9px] text-[#8C6239]">शुक्र देव</div>
              </div>
            </div>
          </div>
          <div className="text-[10px] text-center text-[#8C6239]">
            रत्न जातक के आभामंडल (Aura) को ऊर्जावान बनाकर ग्रहों के शुभ प्रभाव बढ़ाते हैं।
          </div>
        </div>
      ),
    },

    // Slide 2: Pukhraj, Manikya & Moti
    {
      id: 'gems-group-1',
      title: 'पुखराज, माणिक्य एवं मोती',
      subtitle: 'ज्ञान, तेज व मानसिक शांति',
      badge: 'देव गुरु व सूर्य',
      icon: '✨',
      voiceText: 'पुखराज, माणिक्य और मोती रत्न का फलित और धारण विधि।',
      content: (
        <div className="h-full flex flex-col justify-between py-1 space-y-1.5">
          <div className="space-y-1.5 my-auto text-xs">
            <div className="p-2 rounded-xl bg-amber-100/70 border border-amber-300">
              <div className="font-bold text-amber-950">💛 पीला पुखराज (गुरु): सुख, समृद्धि व विद्या</div>
              <p className="text-[10px] text-amber-900 mt-0.5">तर्जनी उंगली • स्वर्ण धातु • गुरुवार प्रातःकाल</p>
            </div>
            <div className="p-2 rounded-xl bg-rose-50 border border-rose-200">
              <div className="font-bold text-rose-950">🔴 माणिक्य (सूर्य): नेतृत्व, आत्मविश्वास व आरोग्य</div>
              <p className="text-[10px] text-rose-900 mt-0.5">अनामिका उंगली • तांबा/स्वर्ण • रविवार प्रातःकाल</p>
            </div>
            <div className="p-2 rounded-xl bg-sky-50 border border-sky-200">
              <div className="font-bold text-sky-950">⚪ सच्चा मोती (चन्द्र): मानसिक शांति व सौम्यता</div>
              <p className="text-[10px] text-sky-900 mt-0.5">कनिष्ठिका उंगली • चांदी धातु • सोमवार सायं</p>
            </div>
          </div>
          <div className="text-[10px] text-center text-[#8C6239]">
            रत्न सदैव प्राण प्रतिष्ठित व शुद्ध करवाकर ही धारण करें।
          </div>
        </div>
      ),
    },

    // Slide 3: Neelam, Panna, Moonga
    {
      id: 'gems-group-2',
      title: 'नीलम, पन्ना, मूंगा व हीरा',
      subtitle: 'शनि, बुध, मंगल व शुक्र के दिव्य रत्न',
      badge: 'कर्म व शक्ति',
      icon: '👑',
      voiceText: 'नीलम, पन्ना, मूंगा और हीरा रत्न का फलित।',
      content: (
        <div className="h-full flex flex-col justify-between py-1 space-y-1.5">
          <div className="space-y-1.5 my-auto text-xs">
            <div className="p-2 rounded-xl bg-indigo-50 border border-indigo-200">
              <div className="font-bold text-indigo-950">💙 नीलम (शनि): न्याय, अनुशासन व त्वरित फल</div>
              <p className="text-[10px] text-indigo-900 mt-0.5">मध्यमा उंगली • पंचधातु/चांदी • शनिवार सायं</p>
            </div>
            <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200">
              <div className="font-bold text-emerald-950">💚 पन्ना (बुध): व्यापार, वाणी व बुद्धि प्रखरता</div>
              <p className="text-[10px] text-emerald-900 mt-0.5">कनिष्ठिका उंगली • कांस्य/स्वर्ण • बुधवार प्रातः</p>
            </div>
            <div className="p-2 rounded-xl bg-red-50 border border-red-200">
              <div className="font-bold text-red-950">🔺 लाल मूंगा (मंगल): पराक्रम व भूमि-भवन लाभ</div>
              <p className="text-[10px] text-red-900 mt-0.5">अनामिका उंगली • तांबा/स्वर्ण • मंगलवार प्रातः</p>
            </div>
          </div>
          <div className="text-[10px] text-center text-[#8C6239]">
            अपनी कुण्डली के अनुसार अनुकूल रत्न जानने हेतु 'उमा परामर्श' लें।
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
      headerTitle="रत्न विज्ञान (Gemology)"
      headerIcon="💎"
      chapterNumber={17}
      onOpenUma={onOpenUmaWithQuery ? () => onOpenUmaWithQuery('मेरी कुण्डली के लिए सर्वश्रेष्ठ रत्न कौन सा है') : undefined}
      onPrevChapter={onPrevChapter}
      onNextChapter={onNextChapter}
      prevChapterLabel="टैरो कार्ड"
      nextChapterLabel="सामुद्रिक मुखाकृति"
    />
  );
};
export default GemologyView;
