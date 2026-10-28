import React, { useState, useEffect } from 'react';
import { Sun, Share2, Sparkles, HeartHandshake } from 'lucide-react';
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
  lagnaRashi,
  onOpenUmaModal,
  onPrevChapter,
  onNextChapter,
}) => {
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(() => {
    if (!lagnaRashi) return 0;
    const idx = RASHI_META.findIndex(
      (r) => r.name === lagnaRashi.trim() || r.id === lagnaRashi.trim().toLowerCase()
    );
    return idx >= 0 ? idx : 0;
  });

  useEffect(() => {
    if (!lagnaRashi) return;
    const idx = RASHI_META.findIndex(
      (r) => r.name === lagnaRashi.trim() || r.id === lagnaRashi.trim().toLowerCase()
    );
    if (idx >= 0) {
      setActiveSlideIndex(idx);
    }
  }, [lagnaRashi]);

  const location = getStoredLocation();

  const slides: StorySlideItem[] = RASHI_META.map((meta, index) => {
    const live = buildDailyRashifal(
      meta.id,
      new Date(),
      location.latitude,
      location.longitude
    );

    const handleShare = () => {
      const text =
        `🌸 *दैनिक राशिफल - ${meta.name} राशि (${meta.symbol})* 🌸\n` +
        `📅 ${live.dateLabel} | ${live.chandraBal}\n` +
        `🪐 ${live.rashiLordStatus}\n\n` +
        `✨ *गोचर फलादेश:* ${live.general}\n\n` +
        `💼 *कार्यक्षेत्र:* ${live.career}\n\n` +
        `💰 *धन व लाभ:* ${live.wealth}\n\n` +
        `❤️ *परिवार व प्रेम:* ${live.love}\n\n` +
        `🌿 *स्वास्थ्य:* ${live.health}\n\n` +
        `🎨 *शुभ रंग:* ${live.luckyColor} | 🔢 *शुभ अंक:* ${live.luckyNumber}\n` +
        `🪔 *अचूक उपाय:* ${live.remedy}\n\n` +
        `📖 *शक्ति पंचांग - वैदिक मार्गदर्शन*`;
      openWhatsAppShare(text);
    };

    return {
      id: meta.id,
      title: `${meta.name} राशि (${meta.symbol}) दैनिक राशिफल`,
      subtitle: `${live.rashiLordStatus} • ${live.chandraBal}`,
      badge: `${meta.symbol} ${meta.name}`,
      icon: meta.symbol,
      voiceText: `${meta.name} राशि का आज का राशिफल। ${live.chandraBal}। ${live.general} कार्यक्षेत्र में: ${live.career} धन एवं लाभ: ${live.wealth} आज का वैदिक उपाय: ${live.remedy}`,
      content: (
        <div className="h-full flex flex-col justify-between py-0.5 space-y-1.5">
          {/* Quick 12-Rashi Selector Strip */}
          <div className="grid grid-cols-6 gap-1 bg-[#FAF2E4]/95 p-1.5 rounded-xl border border-[#8C6239]/35">
            {RASHI_META.map((r, rIdx) => {
              const isSelected = rIdx === index;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveSlideIndex(rIdx);
                  }}
                  className={`px-1 py-1 rounded-lg text-[10px] font-bold flex items-center justify-center gap-0.5 transition cursor-pointer ${
                    isSelected
                      ? 'bg-[#8B1E1E] text-[#FAF2E4] shadow-xs'
                      : 'bg-[#F4E8D1] text-[#5C3A21] hover:bg-[#E8D5B5]'
                  }`}
                >
                  <span>{r.symbol}</span>
                  <span className="truncate">{r.name}</span>
                </button>
              );
            })}
          </div>

          {/* Main Forecast Card */}
          <div className="p-2.5 rounded-2xl bg-amber-50/90 border border-amber-200/90 shadow-xs space-y-1.5 text-xs flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-1 font-bold text-[#5C3A21] mb-1">
                <div className="flex items-center gap-1">
                  <Sun className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>{meta.name} गोचर फलादेश ({live.chandraBal})</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-200/80 text-[#5C3A21] font-extrabold shrink-0">
                  शुभ रंग: {live.luckyColor} • अंक: {live.luckyNumber}
                </span>
              </div>
              <p className="text-[11px] text-[#462B17] leading-snug">{live.general}</p>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              <div className="p-2 rounded-xl bg-emerald-50/85 border border-emerald-200">
                <div className="text-[10px] font-bold text-emerald-800">💼 कार्यक्षेत्र (Career)</div>
                <p className="text-[10.5px] text-emerald-950 font-medium mt-0.5 leading-tight">{live.career}</p>
              </div>
              <div className="p-2 rounded-xl bg-amber-50/85 border border-amber-200">
                <div className="text-[10px] font-bold text-amber-800">💰 धन व लाभ (Wealth)</div>
                <p className="text-[10.5px] text-amber-950 font-medium mt-0.5 leading-tight">{live.wealth}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              <div className="p-1.5 rounded-xl bg-rose-50/80 border border-rose-200">
                <div className="text-[10px] font-bold text-rose-800 flex items-center gap-1">
                  <HeartHandshake className="w-3 h-3 shrink-0" />
                  <span>परिवार व प्रेम</span>
                </div>
                <p className="text-[10px] text-rose-950 font-medium mt-0.5 leading-tight">{live.love}</p>
              </div>
              <div className="p-1.5 rounded-xl bg-sky-50/80 border border-sky-200">
                <div className="text-[10px] font-bold text-sky-800 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 shrink-0" />
                  <span>स्वास्थ्य व ऊर्जा</span>
                </div>
                <p className="text-[10px] text-sky-950 font-medium mt-0.5 leading-tight">{live.health}</p>
              </div>
            </div>

            {/* Special Remedy */}
            <div className="p-2 rounded-xl bg-purple-50/85 border border-purple-200 text-xs">
              <div className="text-[10px] font-bold text-purple-800">🪔 {meta.name} राशि विशेष वैदिक उपाय</div>
              <p className="text-[10.5px] text-purple-950 font-medium mt-0.5 leading-tight">{live.remedy}</p>
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] text-[#8C6239]">
            <span>
              चंद्र गोचर: <strong className="text-[#5C3A21]">{live.moonTransit}</strong>
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleShare();
              }}
              className="px-2.5 py-1 rounded-lg bg-emerald-700 text-white font-bold flex items-center gap-1 cursor-pointer"
            >
              <Share2 className="w-2.5 h-2.5" />
              <span>{meta.name} राशिफल शेयर</span>
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
