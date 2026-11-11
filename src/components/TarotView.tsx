import React, { useState } from 'react';
import {
  drawRandomTarotCards,
  DrawnTarotCard,
} from '../services/spiritualModules';
import { useTranslation } from '../i18n';
import { Sparkles, RefreshCw } from 'lucide-react';
import { UniversalStoryDeck, StorySlideItem } from './UniversalStoryDeck';

interface TarotViewProps {
  onOpenUmaWithQuery?: (query: string) => void;
  onPrevChapter?: () => void;
  onNextChapter?: () => void;
}

export const TarotView: React.FC<TarotViewProps> = ({
  onOpenUmaWithQuery,
  onPrevChapter,
  onNextChapter,
}) => {
  const { t } = useTranslation();
  const [dailyCard, setDailyCard] = useState<DrawnTarotCard>(() => drawRandomTarotCards(1)[0]);
  const [threeCards, setThreeCards] = useState<DrawnTarotCard[]>(() => drawRandomTarotCards(3));
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);

  const handleRedrawDaily = () => {
    setDailyCard(drawRandomTarotCards(1)[0]);
  };

  const handleRedrawThree = () => {
    setThreeCards(drawRandomTarotCards(3));
  };

  const slides: StorySlideItem[] = [
    // Slide 1: Daily 1-Card Guidance
    {
      id: 'daily-card',
      title: 'दैनिक टैरो अंतर्ज्ञान (Daily Card)',
      subtitle: `${t(dailyCard.card.nameKey, { defaultValue: `Card ${dailyCard.card.id}` })} (${dailyCard.isReversed ? 'Reversed' : 'Upright'})`,
      badge: dailyCard.isReversed ? 'पुनरावलोकन' : 'सकारात्मक ऊर्जा',
      icon: '🔮',
      voiceText: `आज का टैरो कार्ड: ${dailyCard.card.id}। संदेश: ${t(dailyCard.isReversed ? dailyCard.card.reversedMeaningKey : dailyCard.card.uprightMeaningKey, { defaultValue: 'सकारात्मक ऊर्जा' })}।`,
      content: (
        <div className="h-full flex flex-col justify-between py-1 space-y-2">
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#FFF8EE] to-[#FFEEC9] border-2 border-amber-400 text-center shadow-sm my-auto space-y-2">
            <div className="w-12 h-16 mx-auto rounded-xl bg-gradient-to-tr from-purple-900 via-indigo-950 to-stone-900 border-2 border-amber-400 flex flex-col items-center justify-center text-amber-300 shadow-md">
              <span className="text-xl">🎴</span>
              <span className="text-[8px] font-mono mt-0.5">{dailyCard.card.id}</span>
            </div>

            <div>
              <h4 className="font-black font-granth text-base text-[#462B17]">
                {t(dailyCard.card.nameKey, { defaultValue: `Card ${dailyCard.card.id}` })}
              </h4>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-900 font-bold">
                {dailyCard.isReversed ? 'उल्टा (Reversed)' : 'सीधा (Upright)'}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-white/90 border border-amber-200 text-left text-xs">
              <div className="text-[10px] font-bold text-[#8C6239] uppercase">दिव्य संदेश</div>
              <p className="text-[#3E2714] text-[11px] mt-0.5 leading-snug">
                {t(dailyCard.isReversed ? dailyCard.card.reversedMeaningKey : dailyCard.card.uprightMeaningKey, { defaultValue: 'सकारात्मक ऊर्जा' })}
              </p>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRedrawDaily();
              }}
              className="px-3 py-1.5 rounded-xl bg-[#5C3A21] text-[#FAF2E4] text-xs font-bold transition flex items-center justify-center gap-1 mx-auto cursor-pointer"
            >
              <RefreshCw className="w-3 h-3 text-amber-300" />
              <span>नया कार्ड निकालें</span>
            </button>
          </div>
          <div className="text-[10px] text-center text-[#8C6239]">
            टैरो अंतरात्मा की सूक्ष्म ऊर्जा को प्रकट करता है।
          </div>
        </div>
      ),
    },

    // Slide 2: 3-Card Spread (Past, Present, Future)
    {
      id: 'three-card-spread',
      title: 'त्रिकाल टैरो प्रसार (Past, Present, Future)',
      subtitle: 'भूतकाल, वर्तमान स्थिति एवं भविष्य फल',
      badge: 'त्रिकाल चक्र',
      icon: '🎴',
      voiceText: 'त्रिकाल टैरो प्रसार। भूत, वर्तमान और भविष्य।',
      content: (
        <div className="h-full flex flex-col justify-between py-1 space-y-1.5">
          <div className="space-y-1.5 my-auto text-xs">
            {threeCards.map((dc, i) => (
              <div
                key={i}
                className="p-2 rounded-xl bg-white/95 border border-amber-300 flex items-center justify-between"
              >
                <div className="min-w-0 pr-2">
                  <div className="text-[9px] font-bold text-[#B56A00] uppercase">
                    {i === 0 ? '१. भूतकाल (Past)' : i === 1 ? '२. वर्तमान (Present)' : '३. भविष्य (Future)'}
                  </div>
                  <div className="font-black font-granth text-xs text-[#462B17] truncate">
                    {t(dc.card.nameKey, { defaultValue: `Card ${dc.card.id}` })}
                  </div>
                  <p className="text-[10px] text-[#735133] truncate mt-0.5">
                    {t(dc.isReversed ? dc.card.reversedMeaningKey : dc.card.uprightMeaningKey, { defaultValue: '' })}
                  </p>
                </div>
                <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-900 font-bold shrink-0">
                  {dc.isReversed ? 'Rev' : 'Up'}
                </span>
              </div>
            ))}

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRedrawThree();
              }}
              className="w-full py-1.5 rounded-xl bg-amber-100 border border-amber-300 text-[#5C3A21] text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer mt-1"
            >
              <RefreshCw className="w-3 h-3 text-amber-600" />
              <span>त्रिकाल प्रसार पुनः शफ़ल करें</span>
            </button>
          </div>
          <div className="text-[10px] text-center text-[#8C6239]">
            तीन कार्ड भूत, वर्तमान और भविष्य की सूक्ष्म ऊर्जा दर्शाते हैं।
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
      headerTitle="टैरो मार्गदर्शन (Tarot Intuition)"
      headerIcon="🎴"
      chapterNumber={12}
      onPrevChapter={onPrevChapter}
      onNextChapter={onNextChapter}
      onOpenUma={onOpenUmaWithQuery ? () => onOpenUmaWithQuery('टैरो कार्ड परामर्श व भविष्य दर्शन') : undefined}
    />
  );
};
export default TarotView;
