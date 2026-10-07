import React, { useState, useMemo } from 'react';
import { KundaliData } from '../types';
import {
  calculateMulank,
  calculateBhagyank,
  calculateNamank,
  calculatePersonalYear,
  calculateLoshuGrid,
  NUMBER_DATA,
} from '../services/numerology';
import { Sparkles, Hash } from 'lucide-react';
import { useLanguage } from '../i18n';
import { UniversalStoryDeck, StorySlideItem } from './UniversalStoryDeck';

interface NumerologyViewProps {
  activeKundali?: KundaliData | null;
  onOpenKundaliTab?: () => void;
  onOpenUmaWithQuery?: (query: string) => void;
  onPrevChapter?: () => void;
  onNextChapter?: () => void;
}

export const NumerologyView: React.FC<NumerologyViewProps> = ({
  activeKundali,
  onOpenKundaliTab,
  onOpenUmaWithQuery,
  onPrevChapter,
  onNextChapter,
}) => {
  const { language, t } = useLanguage();
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);

  const defaultDate = useMemo(() => {
    if (activeKundali?.birthDate) {
      const d = new Date(activeKundali.birthDate);
      if (!isNaN(d.getTime())) return d;
    }
    return new Date(1995, 9, 28);
  }, [activeKundali]);

  const name = activeKundali?.name || 'साधक';
  const day = defaultDate.getDate();
  const month = defaultDate.getMonth() + 1;
  const year = defaultDate.getFullYear();

  const mulankNum = calculateMulank(day);
  const bhagyankNum = calculateBhagyank(day, month, year);
  const namankData = calculateNamank(name, 'chaldean');
  const personalYear = calculatePersonalYear(day, month, new Date().getFullYear());
  const loshu = calculateLoshuGrid(day, month, year);

  const mulank = NUMBER_DATA[mulankNum] || NUMBER_DATA[1];
  const bhagyank = NUMBER_DATA[bhagyankNum] || NUMBER_DATA[1];
  const namank = NUMBER_DATA[namankData.single] || NUMBER_DATA[1];

  const slides: StorySlideItem[] = [
    // Slide 1: Core Numbers
    {
      id: 'core-numbers',
      title: `${name} — वैदिक अंक शास्त्र`,
      subtitle: `जन्म: ${day}/${month}/${year}`,
      badge: `मूलांक ${mulank.number} • भाग्यांक ${bhagyank.number}`,
      icon: '🔢',
      voiceText: `आपका मूलांक ${mulank.number} और भाग्यांक ${bhagyank.number} है। स्वामी ग्रह: ${mulank.planet}।`,
      content: (
        <div className="h-full flex flex-col justify-between py-1 space-y-2">
          <div className="p-3.5 rounded-2xl bg-amber-50/90 border-2 border-amber-300 shadow-sm space-y-2 my-auto text-xs">
            <div className="grid grid-cols-3 gap-1.5 text-center">
              <div className="p-2 rounded-xl bg-white border border-amber-200">
                <div className="text-[10px] text-[#8C6239] font-bold">मूलांक (Driver)</div>
                <div className="text-xl font-black text-[#5C3A21]">{mulank.number}</div>
                <div className="text-[9px] text-amber-800">{mulank.planet}</div>
              </div>
              <div className="p-2 rounded-xl bg-white border border-amber-200">
                <div className="text-[10px] text-[#8C6239] font-bold">भाग्यांक (Conductor)</div>
                <div className="text-xl font-black text-[#5C3A21]">{bhagyank.number}</div>
                <div className="text-[9px] text-amber-800">{bhagyank.planet}</div>
              </div>
              <div className="p-2 rounded-xl bg-white border border-amber-200">
                <div className="text-[10px] text-[#8C6239] font-bold">नामांक (Name)</div>
                <div className="text-xl font-black text-[#5C3A21]">{namankData.single}</div>
                <div className="text-[9px] text-amber-800">{namank.planet}</div>
              </div>
            </div>

            <div className="p-2 rounded-xl bg-white border border-amber-200">
              <div className="font-bold text-[#5C3A21]">🌟 स्वभाव एवं विशेषताएँ:</div>
              <p className="text-[11px] text-[#6E472A] mt-0.5 leading-snug">
                मूलांक {mulank.number} के जातक दृढ़ संकल्पी, नेतृत्व क्षमता से युक्त और आत्मविश्वासी होते हैं।
              </p>
            </div>
          </div>
          <div className="text-[10px] text-center text-[#8C6239]">
            शुभ अंक: {mulank.friendlyNumbers.join(', ')} • शुभ रंग: {mulank.luckyColors.join(', ')}
          </div>
        </div>
      ),
    },

    // Slide 2: Lo Shu Grid
    {
      id: 'loshu-grid',
      title: 'लो-शू ग्रिड (Lo Shu Magic Grid)',
      subtitle: '3x3 वैदिक अंक चक्र व तत्व विश्लेषण',
      badge: 'ऊर्जा चक्र',
      icon: '📐',
      voiceText: 'लो-शू ग्रिड 3x3 अंक चक्र।',
      content: (
        <div className="h-full flex flex-col justify-between py-1 space-y-2">
          <div className="p-3 rounded-2xl bg-white/95 border border-amber-300 my-auto space-y-2">
            <div className="grid grid-cols-3 gap-1.5 max-w-[200px] mx-auto text-center font-mono text-sm font-black">
              {[4, 9, 2, 3, 5, 7, 8, 1, 6].map((num) => {
                const count = loshu.counts[num] || 0;
                return (
                  <div
                    key={num}
                    className={`h-12 rounded-xl flex flex-col items-center justify-center border ${
                      count > 0
                        ? 'bg-amber-100 border-amber-500 text-[#462B17]'
                        : 'bg-stone-50 border-stone-200 text-stone-300'
                    }`}
                  >
                    <span>{num}</span>
                    {count > 0 && <span className="text-[8px] text-amber-800">x{count}</span>}
                  </div>
                );
              })}
            </div>
          </div>
          <div className="text-[10px] text-center text-[#8C6239]">
            लो-शू ग्रिड आपके जीवन के विचार, इच्छा और कर्म शक्ति का प्रतिनिधित्व करता है।
          </div>
        </div>
      ),
    },

    // Slide 3: Personal Year & Remedies
    {
      id: 'personal-year',
      title: `व्यक्तिगत वर्ष ${new Date().getFullYear()} फल`,
      subtitle: `Personal Year ${personalYear.yearNum}`,
      badge: `वर्ष प्रभाव`,
      icon: '✨',
      voiceText: `आपका व्यक्तिगत वर्ष अंक ${personalYear.yearNum} है। ${personalYear.theme}।`,
      content: (
        <div className="h-full flex flex-col justify-between py-1 space-y-2">
          <div className="p-3.5 rounded-2xl bg-amber-50/90 border-2 border-amber-300 shadow-sm space-y-2 my-auto text-xs">
            <div className="text-center py-1">
              <div className="text-2xl font-black font-granth text-[#5C3A21]">
                अंक {personalYear.yearNum} — {personalYear.theme}
              </div>
            </div>
            <p className="text-[11px] text-[#3E2714] leading-relaxed">
              {personalYear.advice}
            </p>
            <div className="p-2 rounded-xl bg-white border border-amber-200 text-[11px]">
              <span className="font-bold text-[#B56A00]">अंक उपाय: </span>
              <span>{mulank.mantra}</span>
            </div>
          </div>
          <div className="text-[10px] text-center text-[#8C6239]">
            मोबाइल व वाहन नंबर अनुकूलता हेतु 'उमा परामर्श' प्राप्त करें।
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
      headerTitle="अंक ज्योतिष (Numerology)"
      headerIcon="🔢"
      chapterNumber={14}
      onOpenUma={onOpenUmaWithQuery ? () => onOpenUmaWithQuery('मेरे मूलांक व भाग्यांक का पूर्ण विश्लेषण') : undefined}
      onPrevChapter={onPrevChapter}
      onNextChapter={onNextChapter}
      prevChapterLabel="ग्रह उपाय"
      nextChapterLabel="हस्तरेखा"
    />
  );
};
export default NumerologyView;
