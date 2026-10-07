import React, { useState } from 'react';
import {
  castIChingCoins,
  IChingHexagram,
  IChingLine,
} from '../services/spiritualModules';
import { useTranslation } from '../i18n';
import { Sparkles, Coins, RefreshCw } from 'lucide-react';
import { UniversalStoryDeck, StorySlideItem } from './UniversalStoryDeck';

interface IChingViewProps {
  onOpenUmaWithQuery?: (query: string) => void;
  onPrevChapter?: () => void;
  onNextChapter?: () => void;
}

export const IChingView: React.FC<IChingViewProps> = ({
  onOpenUmaWithQuery,
  onPrevChapter,
  onNextChapter,
}) => {
  const { t } = useTranslation();
  const [castResult, setCastResult] = useState<{
    lines: IChingLine[];
    hexagram: IChingHexagram;
    coinsTosses: { toss: [number, number, number]; lineVal: number }[];
  }>(() => castIChingCoins());
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);

  const hex = castResult.hexagram;

  const slides: StorySlideItem[] = [
    // Slide 1: Hexagram & Coin Oracle
    {
      id: 'hexagram-overview',
      title: `${hex.chineseChar} ${t(hex.nameKey, hex.englishName)}`,
      subtitle: `Hexagram #${hex.number} • ${t(hex.elementKey, hex.trigrams.join('/'))}`,
      badge: 'आई-चिंग दैवज्ञ',
      icon: '☯️',
      voiceText: `आई चिंग हेक्साग्राम संख्या ${hex.number}। ${t(hex.nameKey, hex.englishName)}। निर्णय: ${t(hex.judgmentKey, '')}।`,
      content: (
        <div className="h-full flex flex-col justify-between py-1 space-y-2">
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#FFF8EE] to-[#FFEEC9] border-2 border-amber-400 text-center shadow-sm my-auto space-y-2">
            <div className="flex items-center justify-center gap-3">
              <span className="text-3xl">{hex.chineseChar}</span>
              <div className="text-left">
                <div className="text-xs font-black text-[#B56A00]">हेक्साग्राम #{hex.number}</div>
                <div className="font-black font-granth text-base text-[#462B17]">
                  {t(hex.nameKey, hex.englishName)}
                </div>
              </div>
            </div>

            {/* 6 lines visual */}
            <div className="flex flex-col gap-1 max-w-[120px] mx-auto py-1">
              {[...castResult.lines].reverse().map((line, i) => (
                <div key={i} className="flex items-center justify-center gap-1 h-2">
                  {line.isYang ? (
                    <div className="w-full h-1.5 bg-[#5C3A21] rounded-full" />
                  ) : (
                    <div className="w-full flex items-center justify-between gap-1.5">
                      <div className="w-1/2 h-1.5 bg-[#5C3A21] rounded-full" />
                      <div className="w-1/2 h-1.5 bg-[#5C3A21] rounded-full" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="p-2.5 rounded-xl bg-white/90 border border-amber-200 text-left text-xs">
              <div className="text-[10px] font-bold text-[#8C6239] uppercase">दैवज्ञ निर्णय (Judgment)</div>
              <p className="text-[#3E2714] text-[11px] mt-0.5 leading-snug">
                {t(hex.judgmentKey, '')}
              </p>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setCastResult(castIChingCoins());
              }}
              className="px-3 py-1.5 rounded-xl bg-[#5C3A21] text-[#FAF2E4] text-xs font-bold transition flex items-center justify-center gap-1 mx-auto cursor-pointer"
            >
              <RefreshCw className="w-3 h-3 text-amber-300" />
              <span>सिक्के पुनः उछालें (Cast Coins)</span>
            </button>
          </div>
          <div className="text-[10px] text-center text-[#8C6239]">
            यिन और यांग का संतुलन प्रकृति और जीवन का सार्वभौमिक सत्य है।
          </div>
        </div>
      ),
    },

    // Slide 2: Image & Guidance
    {
      id: 'image-advice',
      title: 'दैवज्ञ प्रतीक एवं कर्म मार्गदर्शन',
      subtitle: 'The Image & Spiritual Advice',
      badge: 'कर्म सूत्र',
      icon: '✨',
      voiceText: `मार्गदर्शन: ${t(hex.imageKey, '')}। सलाह: ${t(hex.adviceKey, '')}।`,
      content: (
        <div className="h-full flex flex-col justify-between py-1 space-y-1.5">
          <div className="space-y-2 my-auto text-xs">
            <div className="p-3 rounded-2xl bg-amber-50/90 border border-amber-300">
              <div className="font-bold text-[#5C3A21] text-xs">🌊 प्रतीक एवं प्रकृति (The Image)</div>
              <p className="text-[11px] text-[#6E472A] mt-1 leading-relaxed">
                {t(hex.imageKey, '')}
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-300">
              <div className="font-bold text-emerald-950 text-xs">💡 व्यावहारिक सलाह (Practical Action)</div>
              <p className="text-[11px] text-emerald-900 mt-1 leading-relaxed">
                {t(hex.adviceKey, '')}
              </p>
            </div>
          </div>
          <div className="text-[10px] text-center text-[#8C6239]">
            विस्तृत प्रश्न मार्गदर्शन हेतु 'उमा परामर्श' प्राप्त करें।
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
      headerTitle="आई-चिंग (I-Ching Oracle)"
      headerIcon="☯️"
      chapterNumber={19}
      onOpenUma={onOpenUmaWithQuery ? () => onOpenUmaWithQuery('आई चिंग हेक्साग्राम का गहरा अर्थ') : undefined}
      onPrevChapter={onPrevChapter}
      onNextChapter={onNextChapter}
      prevChapterLabel="सामुद्रिक मुखाकृति"
      nextChapterLabel="पंचांग"
    />
  );
};
export default IChingView;
