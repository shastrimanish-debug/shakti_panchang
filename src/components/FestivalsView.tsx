import React, { useState, useMemo } from 'react';
import { FestivalItem } from '../types';
import { getFestivalsForYear } from '../services/festivals';
import { saveAppReminder } from '../services/storage';
import {
  Sparkles,
  Calendar,
  Bell,
  Check,
  Download,
} from 'lucide-react';
import { useTranslation } from '../i18n';
import { trVedic } from '../i18n/vedicTranslate';
import { UniversalStoryDeck, StorySlideItem } from './UniversalStoryDeck';

interface FestivalsViewProps {
  currentDate: Date;
  onNavigateToReminders?: () => void;
  onDateSelect?: (date: Date) => void;
  onOpenUmaModal?: (query?: string) => void;
  onPrevChapter?: () => void;
  onNextChapter?: () => void;
}

export const FestivalsView: React.FC<FestivalsViewProps> = ({
  currentDate,
  onNavigateToReminders,
  onDateSelect,
  onOpenUmaModal,
  onPrevChapter,
  onNextChapter,
}) => {
  const { t, i18n } = useTranslation();
  const [addedReminderId, setAddedReminderId] = useState<string | null>(null);

  const selectedYear = currentDate.getFullYear() || 2026;
  const festivals = useMemo(() => getFestivalsForYear(selectedYear), [selectedYear]);

  const upcomingList = useMemo(() => {
    const today = new Date(currentDate);
    today.setHours(0, 0, 0, 0);
    return festivals
      .filter((f) => f.date >= today)
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [festivals, currentDate]);

  const handleAddReminder = (fest: FestivalItem, e: React.MouseEvent) => {
    e.stopPropagation();
    saveAppReminder({
      id: `fest_${fest.name}_${fest.date.toISOString()}`,
      title: fest.name,
      category: fest.type === 'major' ? 'vrat' : 'festival',
      date: fest.date.toISOString().split('T')[0],
      time: '06:00',
      description: `${fest.name} - ${fest.tithi || ''} ${fest.description || ''}`,
      notifyBefore: 15,
      soundEnabled: true,
      isActive: true,
    });
    setAddedReminderId(fest.name);
    setTimeout(() => setAddedReminderId(null), 2000);
  };

  // Chunk upcoming into slides of 3 items each
  const upcomingChunk1 = upcomingList.slice(0, 3);
  const upcomingChunk2 = upcomingList.slice(3, 6);
  const majorFestivals = festivals.filter((f) => f.type === 'major').slice(0, 4);

  const slides: StorySlideItem[] = [
    // Slide 1: Next 3 Upcoming Festivals
    {
      id: 'upcoming-1',
      title: 'आगामी प्रमुख व्रत व महापर्व',
      subtitle: `${selectedYear} • आगामी तिथियां (भाग १)`,
      badge: 'निकटतम पर्व',
      icon: '🪔',
      voiceText: `आगामी पर्व: ${upcomingChunk1.map((f) => f.name).join(', ')}।`,
      content: (
        <div className="h-full flex flex-col justify-between py-1 space-y-2">
          <div className="space-y-1.5 my-auto">
            {upcomingChunk1.map((fest, idx) => {
              const daysDiff = Math.ceil((fest.date.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
              const isAdded = addedReminderId === fest.name;
              return (
                <div
                  key={idx}
                  className="p-3 rounded-2xl bg-white/90 border border-amber-300 shadow-xs flex items-center justify-between"
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-base">{fest.icon || '🪔'}</span>
                      <h4 className="font-black font-granth text-xs sm:text-sm text-[#462B17] truncate">
                        {fest.name}
                      </h4>
                    </div>
                    <div className="text-[10px] text-[#8C6239] mt-0.5 font-medium">
                      {fest.date.toLocaleDateString('hi-IN', { weekday: 'short', day: 'numeric', month: 'short' })} • {fest.tithi || ''}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold">
                      {daysDiff === 0 ? 'आज' : `${daysDiff} दिन`}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => handleAddReminder(fest, e)}
                      className="p-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500 text-stone-900 transition cursor-pointer"
                      title="स्मृति जोड़ें"
                    >
                      {isAdded ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Bell className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="text-[10px] text-center text-[#8C6239]">
            घंटी आइकन दबाकर त्योहार की स्मृति (Reminder) सेट करें।
          </div>
        </div>
      ),
    },

    // Slide 2: Next 3 Upcoming (Part 2)
    {
      id: 'upcoming-2',
      title: 'आगामी व्रत व पर्व (भाग २)',
      subtitle: `${selectedYear} • अग्रिम सूची`,
      badge: 'मासिक पर्व',
      icon: '🕉️',
      voiceText: `अग्रिम पर्व: ${upcomingChunk2.map((f) => f.name).join(', ')}।`,
      content: (
        <div className="h-full flex flex-col justify-between py-1 space-y-2">
          <div className="space-y-1.5 my-auto">
            {upcomingChunk2.map((fest, idx) => {
              const daysDiff = Math.ceil((fest.date.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
              const isAdded = addedReminderId === fest.name;
              return (
                <div
                  key={idx}
                  className="p-3 rounded-2xl bg-white/90 border border-amber-300 shadow-xs flex items-center justify-between"
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-base">{fest.icon || '🌺'}</span>
                      <h4 className="font-black font-granth text-xs sm:text-sm text-[#462B17] truncate">
                        {fest.name}
                      </h4>
                    </div>
                    <div className="text-[10px] text-[#8C6239] mt-0.5 font-medium">
                      {fest.date.toLocaleDateString('hi-IN', { weekday: 'short', day: 'numeric', month: 'short' })} • {fest.tithi || ''}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold">
                      {daysDiff} दिन
                    </span>
                    <button
                      type="button"
                      onClick={(e) => handleAddReminder(fest, e)}
                      className="p-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500 text-stone-900 transition cursor-pointer"
                      title="स्मृति जोड़ें"
                    >
                      {isAdded ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Bell className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="text-[10px] text-center text-[#8C6239]">
            सभी पर्व शास्त्रसम्मत सूर्य-सिद्धान्त गणना पर आधारित हैं।
          </div>
        </div>
      ),
    },

    // Slide 3: Major Sanatan Festivals of the Year
    {
      id: 'major-sanatan',
      title: `सनातन महापर्व (${selectedYear})`,
      subtitle: 'दीपावली, महाशिवरात्रि, नवरात्रि, जन्माष्टमी',
      badge: 'महापर्व',
      icon: '✨',
      voiceText: 'सनातन धर्म के प्रमुख वार्षिक महापर्व।',
      content: (
        <div className="h-full flex flex-col justify-between py-1 space-y-2">
          <div className="grid grid-cols-2 gap-2 my-auto">
            {majorFestivals.map((fest, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100/60 border border-amber-300 flex flex-col justify-between"
              >
                <div className="flex items-center gap-1">
                  <span className="text-base">{fest.icon || '🪔'}</span>
                  <span className="font-black font-granth text-xs text-[#462B17] truncate">{fest.name}</span>
                </div>
                <div className="text-[10px] font-bold text-amber-800 mt-1">
                  {fest.date.toLocaleDateString('hi-IN', { day: 'numeric', month: 'short' })}
                </div>
                <div className="text-[9px] text-[#735133] truncate">{fest.tithi || 'शुक्ल पक्ष'}</div>
              </div>
            ))}
          </div>
          <div className="text-[10px] text-center text-[#8C6239]">
            धर्मो रक्षति रक्षितः • सनातन संस्कृति के पावन उत्सव
          </div>
        </div>
      ),
    },
  ];

  return (
    <UniversalStoryDeck
      slides={slides}
      headerTitle={t('nav.festivals', 'पर्व व त्योहार')}
      headerIcon="🪔"
      chapterNumber={6}
      currentDate={currentDate}
      onOpenUma={onOpenUmaModal ? () => onOpenUmaModal('आगामी त्योहार व व्रत पूजन विधि') : undefined}
      onPrevChapter={onPrevChapter}
      onNextChapter={onNextChapter}
      prevChapterLabel="कुण्डली"
      nextChapterLabel="स्मृति व संकल्प"
    />
  );
};
export default FestivalsView;
