import React, { useState, useEffect } from 'react';
import { VedicPanchangData, ChoghadiyaItem } from '../types';
import {
  getDayChoghadiya,
  getNightChoghadiya,
  getCurrentChoghadiya,
  getInauspiciousWindows,
  getAuspiciousWindows,
} from '../services/choghadiya';
import { formatPlaceTime } from '../services/engine/time';
import {
  Clock,
  Sun,
  Moon,
  Sparkles,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { useLanguage } from '../i18n';
import { trVedic, trPlanet, trWeekday, trChoghadiyaMeaning } from '../i18n/vedicTranslate';
import { UniversalStoryDeck, StorySlideItem } from './UniversalStoryDeck';

interface ChoghadiyaViewProps {
  panchang: VedicPanchangData;
  onOpenUmaModal?: (query?: string) => void;
  onPrevChapter?: () => void;
  onNextChapter?: () => void;
}

export const ChoghadiyaView: React.FC<ChoghadiyaViewProps> = ({
  panchang,
  onOpenUmaModal,
  onPrevChapter,
  onNextChapter,
}) => {
  const { t, language } = useLanguage();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  const weekday = panchang.date.getDay();
  const dayChoghadiyas = getDayChoghadiya(panchang.solar, weekday);
  const nightChoghadiyas = getNightChoghadiya(panchang.solar, weekday);
  const activeDayNight = currentTime >= panchang.solar.sunrise && currentTime < panchang.solar.sunset ? dayChoghadiyas : nightChoghadiyas;

  const { current, remainingMinutes } = getCurrentChoghadiya(activeDayNight, currentTime);
  const inauspiciousWindows = getInauspiciousWindows(panchang.solar, weekday);
  const auspiciousWindows = getAuspiciousWindows(panchang.solar);

  const formatTime = (d: Date) => formatPlaceTime(d);

  const getBadgeClass = (nature: ChoghadiyaItem['nature']) => {
    switch (nature) {
      case 'auspicious':
        return 'bg-emerald-500/20 text-emerald-800 border-emerald-400 font-black';
      case 'neutral':
        return 'bg-amber-500/20 text-amber-800 border-amber-400 font-bold';
      default:
        return 'bg-rose-500/20 text-rose-800 border-rose-400 font-bold';
    }
  };

  const getNatureLabel = (nature: ChoghadiyaItem['nature']) => {
    switch (nature) {
      case 'auspicious':
        return t('choghadiya.auspicious', 'शुभ (अमृत/लाभ/शुभ)');
      case 'neutral':
        return t('choghadiya.neutral', 'मध्यम (चल)');
      default:
        return t('choghadiya.inauspicious', 'त्याज्य (रोग/उद्वेग/काल)');
    }
  };

  const slides: StorySlideItem[] = [
    // Slide 1: Current Active Choghadiya
    {
      id: 'current',
      title: t('choghadiya.currentChoghadiya', 'वर्तमान चालू चौघड़िया'),
      subtitle: `${trWeekday(panchang.weekday)} • ${formatPlaceTime(currentTime)}`,
      badge: current ? getNatureLabel(current.nature) : 'सक्रिय',
      icon: '⏳',
      voiceText: current
        ? `वर्तमान चौघड़िया ${current.hindiName} है। यह ${getNatureLabel(current.nature)} है। लगभग ${remainingMinutes} मिनट शेष हैं।`
        : 'वर्तमान चौघड़िया',
      content: (
        <div className="h-full flex flex-col justify-between py-1">
          {current ? (
            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#FFF8EE] via-[#FFF3DD] to-[#FBE8C8] border-2 border-amber-400 shadow-md flex flex-col justify-between my-auto">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#8C6239] uppercase tracking-wider flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span>सक्रिय वेला</span>
                </span>
                <span className={`text-[11px] px-2.5 py-0.5 rounded-full border ${getBadgeClass(current.nature)}`}>
                  {getNatureLabel(current.nature)}
                </span>
              </div>

              <div className="text-center my-3">
                <div className="text-3xl sm:text-4xl font-black font-granth text-[#462B17] tracking-tight">
                  {trVedic(current.hindiName)}
                </div>
                <p className="text-xs text-[#735133] mt-1 font-medium max-w-xs mx-auto">
                  {trChoghadiyaMeaning(current.meaning, current.hindiName)}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-amber-300/60 text-xs">
                <div className="p-2 rounded-xl bg-white/80 border border-amber-200">
                  <div className="text-[10px] text-[#8C6239] font-bold">समय सीमा</div>
                  <div className="font-black text-[#5C3A21]">
                    {formatTime(current.start)} - {formatTime(current.end)}
                  </div>
                </div>
                <div className="p-2 rounded-xl bg-white/80 border border-amber-200">
                  <div className="text-[10px] text-[#8C6239] font-bold">शेष अवधि</div>
                  <div className="font-black text-amber-800">
                    ~{remainingMinutes} {t('common.mins', 'मिनट')}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-center">
              चौघड़िया गणना चालू है...
            </div>
          )}

          <div className="p-2 rounded-xl bg-amber-50/90 border border-amber-200/80 text-[11px] text-center text-[#6E472A] font-medium">
            💡 यात्रा, व्यापार व शुभ कार्य प्रारम्भ करने से पूर्व चौघड़िया देखें।
          </div>
        </div>
      ),
    },

    // Slide 2: Day Choghadiya Slots
    {
      id: 'day-choghadiya',
      title: `${t('choghadiya.day', 'दिन का चौघड़िया')} (८ मुहूर्त)`,
      subtitle: `${t('choghadiya.daySpan', 'सूर्योदय से सूर्यास्त')}`,
      badge: 'दिन काल',
      icon: '☀️',
      voiceText: 'दिन के आठ चौघड़िया मुहूर्त। शुभ, लाभ, अमृत, चल, काल, शुभ, रोग और उद्वेग।',
      content: (
        <div className="h-full flex flex-col justify-between py-1">
          <div className="grid grid-cols-2 gap-1.5 my-auto">
            {dayChoghadiyas.map((item, idx) => {
              const isActive = currentTime >= item.start && currentTime < item.end;
              return (
                <div
                  key={idx}
                  className={`p-2 rounded-xl border transition-all ${
                    isActive
                      ? 'bg-amber-100/90 border-amber-500 shadow-xs ring-2 ring-amber-400'
                      : 'bg-white/80 border-[#E8DCCB]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-black font-granth text-xs text-[#462B17]">
                      {trVedic(item.hindiName)}
                    </span>
                    <span className={`text-[9px] px-1.5 py-0.2 rounded border ${getBadgeClass(item.nature)}`}>
                      {item.nature === 'auspicious' ? 'शुभ' : item.nature === 'neutral' ? 'मध्यम' : 'त्याज्य'}
                    </span>
                  </div>
                  <div className="text-[10px] font-mono font-bold text-[#735133] mt-0.5">
                    {formatTime(item.start)} - {formatTime(item.end)}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="text-[10px] text-center text-[#8C6239] font-medium">
            दिन में शुभ, अमृत व लाभ चौघड़िया सर्वश्रेष्ठ माने गए हैं।
          </div>
        </div>
      ),
    },

    // Slide 3: Night Choghadiya Slots
    {
      id: 'night-choghadiya',
      title: `${t('choghadiya.night', 'रात का चौघड़िया')} (८ मुहूर्त)`,
      subtitle: `${t('choghadiya.nightSpan', 'सूर्यास्त से सूर्योदय')}`,
      badge: 'रात्रि काल',
      icon: '🌙',
      voiceText: 'रात्रि के आठ चौघड़िया मुहूर्त।',
      content: (
        <div className="h-full flex flex-col justify-between py-1">
          <div className="grid grid-cols-2 gap-1.5 my-auto">
            {nightChoghadiyas.map((item, idx) => {
              const isActive = currentTime >= item.start && currentTime < item.end;
              return (
                <div
                  key={idx}
                  className={`p-2 rounded-xl border transition-all ${
                    isActive
                      ? 'bg-indigo-100/90 border-indigo-500 shadow-xs ring-2 ring-indigo-400'
                      : 'bg-white/80 border-[#E8DCCB]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-black font-granth text-xs text-[#2A1D36]">
                      {trVedic(item.hindiName)}
                    </span>
                    <span className={`text-[9px] px-1.5 py-0.2 rounded border ${getBadgeClass(item.nature)}`}>
                      {item.nature === 'auspicious' ? 'शुभ' : item.nature === 'neutral' ? 'मध्यम' : 'त्याज्य'}
                    </span>
                  </div>
                  <div className="text-[10px] font-mono font-bold text-[#564268] mt-0.5">
                    {formatTime(item.start)} - {formatTime(item.end)}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="text-[10px] text-center text-[#8C6239] font-medium">
            रात्रि में शुभ, अमृत व लाभ चौघड़िया साधना व यात्रा हेतु उपयुक्त हैं।
          </div>
        </div>
      ),
    },

    // Slide 4: Auspicious & Inauspicious Windows
    {
      id: 'windows',
      title: 'दैनिक शुभाशुभ वेला (मुहूर्त)',
      subtitle: 'अभिजित, अमृत, ब्रह्म व राहुकाल',
      badge: 'वेला चक्र',
      icon: '✨',
      voiceText: 'दैनिक शुभ मुहूर्त और अशुभ वेला।',
      content: (
        <div className="h-full flex flex-col justify-between py-1 space-y-2">
          {/* Auspicious */}
          <div className="p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200">
            <div className="text-xs font-bold text-emerald-900 mb-1 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>शुभ मुहूर्त (Auspicious)</span>
            </div>
            <div className="space-y-1">
              {auspiciousWindows.slice(0, 3).map((w, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-emerald-950">{trVedic(w.title)}</span>
                  <span className="font-mono font-bold text-emerald-800">
                    {formatTime(w.start)} - {formatTime(w.end)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Inauspicious */}
          <div className="p-2.5 rounded-xl bg-rose-50/80 border border-rose-200">
            <div className="text-xs font-bold text-rose-900 mb-1 flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
              <span>अशुभ काल (Inauspicious)</span>
            </div>
            <div className="space-y-1">
              {inauspiciousWindows.slice(0, 3).map((w, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-rose-950">{trVedic(w.title)}</span>
                  <span className="font-mono font-bold text-rose-800">
                    {formatTime(w.start)} - {formatTime(w.end)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="text-[10px] text-center text-[#8C6239]">
            राहुकाल में शुभ कार्य वर्जित रहते हैं। अभिजित मुहूर्त सर्वकार्य सिद्धिकारक है।
          </div>
        </div>
      ),
    },
  ];

  return (
    <UniversalStoryDeck
      slides={slides}
      headerTitle={t('nav.choghadiya', 'चौघड़िया चक्र')}
      headerIcon="⏳"
      chapterNumber={2}
      currentDate={panchang.date}
      onOpenUma={onOpenUmaModal ? () => onOpenUmaModal('आज का चौघड़िया फल') : undefined}
      onPrevChapter={onPrevChapter}
      onNextChapter={onNextChapter}
      prevChapterLabel="पंचांग"
      nextChapterLabel="शुभ मुहूर्त"
    />
  );
};
export default ChoghadiyaView;
