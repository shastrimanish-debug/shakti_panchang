import React, { useState, useMemo } from 'react';
import { Sparkles, Sun, Share2 } from 'lucide-react';
import { openWhatsAppShare } from '../services/umaConsultationPdf';
import { getStoredLocation } from '../services/storage';
import { buildDailyRashifal, RASHI_META } from '../services/dailyRashifal';
import { UniversalStoryDeck, StorySlideItem } from './UniversalStoryDeck';

interface DailyRashifalViewProps {
  personName?: string;
  lagnaRashi?: string;
  onOpenUmaModal?: (query?: string) => void;
  onPrevChapter?: () => void;
  onNextChapter?: () => void;
}

export const DailyRashifalView: React.FC<DailyRashifalViewProps> = ({
  personName,
  lagnaRashi,
  onOpenUmaModal,
  onPrevChapter,
  onNextChapter,
}) => {
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);
  const location = getStoredLocation();

  const slides: StorySlideItem[] = RASHI_META.map((meta) => {
    const live = buildDailyRashifal(
      meta.name,
      new Date(),
      location.latitude,
      location.longitude
    );

    const handleShare = () => {
      const text = `🌸 *दैनिक राशिफल - ${meta.name} राशि (${meta.symbol})* 🌸\n` +
        `📅 ${live.dateLabel}\n\n` +
        `✨ *सामान्य फल:* ${live.general}\n` +
        `💼 *करियर:* ${live.career}\n` +
        `💰 *धन:* ${live.wealth}\n` +
        `🪔 *उपाय:* ${live.remedy}\n\n` +
        `📖 *शक्ति पंचांग - वैदिक मार्गदर्शन*`;
      openWhatsAppShare(text);
    };

    return {
      id: meta.id,
      title: `${meta.name} राशि (${meta.symbol}) दैनिक राशिफल`,
      subtitle: `स्वामी: ${meta.lord} • गोचर: ${live.moonTransit}`,
      badge: `${meta.symbol} ${meta.name}`,
      icon: meta.symbol,
      voiceText: `${meta.name} राशि का आज का राशिफल। ${live.general}`,
      content: (
        <div className="h-full flex flex-col justify-between py-1 space-y-2">
          {/* General Forecast */}
          <div className="p-3 rounded-2xl bg-amber-50/90 border border-amber-200/90 shadow-xs space-y-2 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-[#5C3A21]">
              <Sun className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>ग्रह गोचर फलादेश</span>
            </div>
            <p className="text-[11px] text-[#462B17] leading-snug">{live.general}</p>

            <div className="grid grid-cols-2 gap-1.5 pt-1">
              <div className="p-2 rounded-xl bg-emerald-50/80 border border-emerald-200">
                <div className="text-[10px] font-bold text-emerald-800">💼 कार्यक्षेत्र (Career)</div>
                <p className="text-[11px] text-emerald-950 font-medium mt-0.5 leading-tight">{live.career}</p>
              </div>
              <div className="p-2 rounded-xl bg-amber-50/80 border border-amber-200">
                <div className="text-[10px] font-bold text-amber-800">💰 धन व लाभ (Wealth)</div>
                <p className="text-[11px] text-amber-950 font-medium mt-0.5 leading-tight">{live.wealth}</p>
              </div>
            </div>

            {/* Special Remedy */}
            <div className="p-2 rounded-xl bg-purple-50/80 border border-purple-200 text-xs">
              <div className="text-[10px] font-bold text-purple-800">🪔 अचूक वैदिक उपाय</div>
              <p className="text-[11px] text-purple-950 font-medium mt-0.5">{live.remedy}</p>
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] text-[#8C6239]">
            <span>गोचर: <strong className="text-[#5C3A21]">{live.moonTransit}</strong></span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleShare();
              }}
              className="px-2 py-0.5 rounded-lg bg-emerald-700 text-white font-bold flex items-center gap-1 cursor-pointer"
            >
              <Share2 className="w-2.5 h-2.5" />
              <span>शेयर</span>
            </button>
          </div>
        </div>
      ),
    };
  });

  return (
    <UniversalStoryDeck
      slides={slides}
      currentSlideIndex={activeSlideIndex}
      onSlideIndexChange={setActiveSlideIndex}
      headerTitle="दैनिक राशिफल (१२ राशियाँ)"
      headerIcon="♈"
      chapterNumber="६"
      onPrevChapter={onPrevChapter}
      onNextChapter={onNextChapter}
      onOpenUma={onOpenUmaModal}
    />
  );
};
