import React, { useState, useEffect } from 'react';
import { AppReminder } from '../types';
import { getStoredReminders, saveReminder, deleteReminder } from '../services/storage';
import { scheduleNativeReminder, cancelNativeReminder } from '../lib/device';
import { Bell, Clock, Trash2, Plus, Check } from 'lucide-react';
import { useTranslation } from '../i18n';
import { UniversalStoryDeck, StorySlideItem } from './UniversalStoryDeck';

interface RemindersViewProps {
  onOpenUmaModal?: (query?: string) => void;
  onPrevChapter?: () => void;
  onNextChapter?: () => void;
}

export const RemindersView: React.FC<RemindersViewProps> = ({
  onOpenUmaModal,
  onPrevChapter,
  onNextChapter,
}) => {
  const { t } = useTranslation();
  const [reminders, setReminders] = useState<AppReminder[]>([]);
  const [title, setTitle] = useState('प्रातः सूर्य पूजा व पंचांग स्मरण');
  const [body, setBody] = useState('शुभ मुहूर्त में संकल्प व साधना');
  const [dateStr, setDateStr] = useState(() => new Date().toISOString().split('T')[0]);
  const [timeStr, setTimeStr] = useState('06:00');
  const [successMsg, setSuccessMsg] = useState('');

  const refreshList = () => {
    setReminders(getStoredReminders());
  };

  useEffect(() => {
    refreshList();
  }, []);

  const handleAddReminder = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const [y, m, d] = dateStr.split('-').map(Number);
    const [h, min] = timeStr.split(':').map(Number);
    const targetDate = new Date(y, m - 1, d, h, min);

    const newReminder: AppReminder = {
      id: `rem_${Date.now()}`,
      title: title.trim() || 'Shakti Panchang Reminder',
      body: body.trim() || 'शुभ समय स्मरण',
      timestamp: targetDate.getTime(),
      type: 'custom',
      createdAt: Date.now(),
    };

    saveReminder(newReminder);
    scheduleNativeReminder(newReminder.id, newReminder.title, newReminder.body || 'शुभ समय स्मरण', newReminder.timestamp || targetDate.getTime());
    refreshList();

    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }

    setSuccessMsg('रिमाइंडर सफलतापूर्वक सहेजा गया!');
    setTimeout(() => setSuccessMsg(''), 2500);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteReminder(id);
    cancelNativeReminder(id);
    refreshList();
  };

  const formatTimestamp = (ts: number) =>
    new Date(ts).toLocaleString('hi-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });

  const slides: StorySlideItem[] = [
    // Slide 1: Active Reminders List
    {
      id: 'active-list',
      title: 'सक्रिय व्रत व शुभ समय रिमाइंडर',
      subtitle: `${reminders.length} स्मरण सक्रिय`,
      badge: 'स्मृति सूची',
      icon: '🔔',
      voiceText: `आपके कुल ${reminders.length} रिमाइंडर सक्रिय हैं।`,
      content: (
        <div className="h-full flex flex-col justify-between py-1 space-y-2">
          {reminders.length === 0 ? (
            <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-center my-auto space-y-2">
              <Bell className="w-8 h-8 text-amber-500 mx-auto opacity-70" />
              <div className="text-xs font-bold text-[#5C3A21]">कोई रिमाइंडर सेट नहीं है</div>
              <p className="text-[11px] text-[#8C6239]">
                अगली स्लाइड पर जाकर प्रातःकाल, एकादशी या शुभ मुहूर्त का रिमाइंडर लगाएं।
              </p>
            </div>
          ) : (
            <div className="space-y-1.5 my-auto">
              {reminders.slice(0, 4).map((rem) => (
                <div
                  key={rem.id}
                  className="p-2.5 rounded-xl bg-white/90 border border-amber-300 flex items-center justify-between"
                >
                  <div className="min-w-0 pr-2">
                    <div className="font-black font-granth text-xs text-[#462B17] truncate">{rem.title}</div>
                    <div className="text-[10px] text-[#8C6239] flex items-center gap-1 mt-0.5">
                      <Clock className="w-2.5 h-2.5 text-amber-600" />
                      <span>{rem.timestamp ? formatTimestamp(rem.timestamp) : 'सक्रिय'}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => handleDelete(rem.id, e)}
                    className="p-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-800 transition cursor-pointer"
                    title="हटाएं"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="text-[10px] text-center text-[#8C6239]">
            डिवाइस नोटिफिकेशन द्वारा समय पर अलर्ट प्राप्त होगा।
          </div>
        </div>
      ),
    },

    // Slide 2: Add New Reminder
    {
      id: 'add-new',
      title: 'नया शुभ स्मरण सेट करें',
      subtitle: 'पूजा, संकल्प या मुहूर्त अलार्म',
      badge: 'नया रिमाइंडर',
      icon: '➕',
      voiceText: 'नया शुभ समय स्मरण सेट करें।',
      content: (
        <div className="h-full flex flex-col justify-between py-1 space-y-2">
          <div className="p-3 rounded-2xl bg-white/95 border border-amber-300 space-y-2 my-auto text-xs">
            <div>
              <label className="text-[10px] font-bold text-[#8C6239] block mb-0.5">शीर्षक (Title)</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className="w-full bg-[#FAF2E4] border border-[#DFCBB5] rounded-lg p-1.5 text-xs font-semibold text-[#5C3A21] outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              <div>
                <label className="text-[10px] font-bold text-[#8C6239] block mb-0.5">दिनांक (Date)</label>
                <input
                  type="date"
                  value={dateStr}
                  onChange={(e) => setDateStr(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full bg-[#FAF2E4] border border-[#DFCBB5] rounded-lg p-1.5 text-xs font-semibold text-[#5C3A21] outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-[#8C6239] block mb-0.5">समय (Time)</label>
                <input
                  type="time"
                  value={timeStr}
                  onChange={(e) => setTimeStr(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full bg-[#FAF2E4] border border-[#DFCBB5] rounded-lg p-1.5 text-xs font-semibold text-[#5C3A21] outline-none"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleAddReminder();
              }}
              className="w-full py-2 bg-[#5C3A21] text-[#FAF2E4] font-bold rounded-xl text-xs hover:bg-[#462B17] transition cursor-pointer flex items-center justify-center gap-1 shadow-sm mt-1"
            >
              <Plus className="w-3.5 h-3.5 text-amber-300" />
              <span>{successMsg || 'रिमाइंडर सहेजें'}</span>
            </button>
          </div>
          <div className="text-[10px] text-center text-[#8C6239]">
            नित्य प्रातःकाल व संध्याकाल उपासना का नियम बनाए रखें।
          </div>
        </div>
      ),
    },
  ];

  return (
    <UniversalStoryDeck
      slides={slides}
      headerTitle={t('nav.reminders', 'स्मृति व संकल्प')}
      headerIcon="🔔"
      chapterNumber={7}
      onOpenUma={onOpenUmaModal ? () => onOpenUmaModal('दैनिक साधना व व्रत नियम') : undefined}
      onPrevChapter={onPrevChapter}
      onNextChapter={onNextChapter}
      prevChapterLabel="पर्व व त्योहार"
      nextChapterLabel="व्रत कथा"
    />
  );
};
export default RemindersView;
