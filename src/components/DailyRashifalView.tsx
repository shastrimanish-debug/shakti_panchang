import React, { useState, useMemo } from 'react';
import { Sparkles, Sun, Share2 } from 'lucide-react';
import { openWhatsAppShare } from '../services/umaConsultationPdf';
import { getStoredLocation } from '../services/storage';
import { buildDailyRashifal, RASHI_META } from '../services/dailyRashifal';
import { UniversalStoryDeck, StorySlideItem } from './UniversalStoryDeck';

export const DailyRashifalView: React.FC<{
  personName?: string;
  lagnaRashi?: string;
  onOpenUmaModal?: (query?: string) => void;
  onPrevChapter?: () => void;
  onNextChapter?: () => void;
}> = ({ personName, lagnaRashi, onOpenUmaModal, onPrevChapter, onNextChapter }) => {
  const matched = RASHI_META.find((r) => lagnaRashi?.startsWith(r.name));
  const initialIndex = matched ? RASHI_META.findIndex((r) => r.id === matched.id) : 0;
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(initialIndex >= 0 ? initialIndex : 0);

  const place = useMemo(() => getStoredLocation(), []);
  const today = useMemo(() => new Date(), []);

  const slides: StorySlideItem[] = RASHI_META.map((rashi) => {
    const live = buildDailyRashifal(
      rashi.id,
      today,
      place.latitude,
      place.longitude,
      place.timezoneHours,
    );

    const handleShare = () => {
      const text = `🌟 *${live.dateLabel} का दैनिक राशिफल — ${rashi.name}* 🌟\nचंद्र गोचर: ${live.moonTransit}\n\nसामान्य: ${live.general}\nकरियर: ${live.career}\nधन: ${live.wealth}\nउपाय: ${live.remedy}\n\nग्रह स्थिति आज की गणना से। शक्ति पंचांग।`;
      openWhatsAppShare(text);
    };

    return {
      id: rashi.id,
      title: `${rashi.name} (${rashi.symbol})`,
      subtitle: `स्वामी: ${rashi.lord} • चंद्र गोचर: ${live.moonTransit}`,
      badge: `शुभ अंक: ${live.luckyNumber} • रंग: ${live.luckyColor}`,
      icon: rashi.symbol,
      voiceText: `${rashi.name} का आज का राशिफल। सामान्य फल: ${live.general}। करियर: ${live.career}। उपाय: ${live.remedy}।`,
      content: (
        <div className="h-full flex flex-col justify-between py-1 space-y-2">
          {/* Main Rashifal Card */}
          <div className="p-3.5 rounded-2xl bg-white/90 border border-amber-300 shadow-sm space-y-2 my-auto">
            {/* General */}
            <div className="p-2 rounded-xl bg-amber-50/80 border border-amber-200">
              <div className="text-[10px] font-bold text-[#8C6239] uppercase">सामान्य प्रभाव</div>
              <p className="text-xs text-[#462B17] font-medium mt-0.5 leading-snug">{live.general}</p>
            </div>

            {/* Career & Wealth */}
            <div className="grid grid-cols-2 gap-1.5 text-xs">
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
            <span>शुभ अंक: <strong className="text-[#5C3A21]">{live.luckyNumber}</strong> • रंग: <strong className="text-[#5C3A21]">{live.luckyColor}</strong></span>
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
      headerTitle="दैनिक राशिफल"
      headerIcon="♈"
      chapterNumber={9}
      currentDate={today}
      onOpenUma={onOpenUmaModal ? () => onOpenUmaModal('आज का विस्तृत राशिफल व गोचर') : undefined}
      onPrevChapter={onPrevChapter}
      onNextChapter={onNextChapter}
      prevChapterLabel="व्रत कथा"
      nextChapterLabel="गीता श्लोक"
    />
  );
};
export default DailyRashifalView;
