import React, { useState, useEffect } from 'react';
import { AppReminder } from '../types';
import { getStoredReminders, saveReminder, deleteReminder } from '../services/storage';
import { scheduleNativeReminder, cancelNativeReminder } from '../lib/device';
import { Bell, Clock, Trash2, Plus, Check } from 'lucide-react';
import { useLanguage } from '../i18n';
import { UniversalStoryDeck, StorySlideItem } from './UniversalStoryDeck';

function pickL<T>(lang: string, hi: T, en: T, gu: T): T {
  const l = (lang || 'hi').slice(0, 2).toLowerCase();
  if (l === 'en') return en;
  if (l === 'gu') return gu;
  return hi;
}

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
  const { t, language } = useLanguage();
  const [reminders, setReminders] = useState<AppReminder[]>([]);
  const defaultTitle = pickL(language, 'प्रातः सूर्य पूजा व पंचांग स्मरण', 'Morning Surya Puja & Panchang Reminder', 'સવારની સૂર્ય પૂજા અને પંચાંગ સ્મરણ');
  const defaultBody = pickL(language, 'शुभ मुहूर्त में संकल्प व साधना', 'Vow & Sadhana in auspicious Muhurat', 'શુભ મુહૂર્તમાં સંકલ્પ અને સાધના');
  const [title, setTitle] = useState(defaultTitle);
  const [hasEditedTitle, setHasEditedTitle] = useState(false);
  const [body, setBody] = useState(defaultBody);
  const [dateStr, setDateStr] = useState(() => new Date().toISOString().split('T')[0]);
  const [timeStr, setTimeStr] = useState('05:00');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (!hasEditedTitle) {
      setTitle(defaultTitle);
      setBody(defaultBody);
    }
  }, [language, hasEditedTitle, defaultTitle, defaultBody]);

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
    const fallbackBody = pickL(language, 'शुभ समय स्मरण', 'Auspicious Time Reminder', 'શુભ સમય સ્મરણ');

    const newReminder: AppReminder = {
      id: `rem_${Date.now()}`,
      title: title.trim() || 'Shakti Panchang Reminder',
      body: body.trim() || fallbackBody,
      timestamp: targetDate.getTime(),
      type: 'custom',
      createdAt: Date.now(),
    };

    saveReminder(newReminder);
    scheduleNativeReminder(newReminder.id, newReminder.title, newReminder.body || fallbackBody, newReminder.timestamp || targetDate.getTime());
    refreshList();

    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }

    setSuccessMsg(pickL(language, 'रिमाइंडर सफलतापूर्वक सहेजा गया!', 'Reminder saved successfully!', 'રિમાઇન્ડર સફળતાપૂર્વક સેવ થયું!'));
    setTimeout(() => setSuccessMsg(''), 2500);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteReminder(id);
    cancelNativeReminder(id);
    refreshList();
  };

  const locale = language === 'en' ? 'en-US' : language === 'gu' ? 'gu-IN' : 'hi-IN';

  const formatTimestamp = (ts: number) =>
    new Date(ts).toLocaleString(locale, {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });

  const slides: StorySlideItem[] = [
    // Slide 1: Active Reminders List
    {
      id: 'active-list',
      title: pickL(language, 'सक्रिय व्रत व शुभ समय रिमाइंडर', 'Active Vrat & Auspicious Reminders', 'સક્રિય વ્રત અને શુભ સમય રિમાઇન્ડર'),
      subtitle: pickL(language, `${reminders.length} स्मरण सक्रिय`, `${reminders.length} active reminders`, `${reminders.length} સ્મરણ સક્રિય`),
      badge: pickL(language, 'स्मृति सूची', 'Reminders', 'સ્મૃતિ યાદી'),
      icon: '🔔',
      voiceText: pickL(
        language,
        `आपके कुल ${reminders.length} रिमाइंडर सक्रिय हैं।`,
        `You have ${reminders.length} active reminders.`,
        `તમારા કુલ ${reminders.length} રિમાઇન્ડર સક્રિય છે.`
      ),
      content: (
        <div className="h-full flex flex-col justify-between py-1 space-y-2">
          {reminders.length === 0 ? (
            <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-center my-auto space-y-2">
              <Bell className="w-8 h-8 text-amber-500 mx-auto opacity-70" />
              <div className="text-xs font-bold text-[#5C3A21]">
                {pickL(language, 'कोई रिमाइंडर सेट नहीं है', 'No reminders set yet', 'કોઈ રિમાઇન્ડર સેટ નથી')}
              </div>
              <p className="text-[11px] text-[#8C6239]">
                {pickL(
                  language,
                  'अगली स्लाइड पर जाकर प्रातःकाल, एकादशी या शुभ मुहूर्त का रिमाइंडर लगाएं।',
                  'Swipe to the next slide to set a reminder for morning puja, Ekadashi, or auspicious Muhurat.',
                  'આગળની સ્લાઇડ પર જઈને સવારની પૂજા, એકાદશી કે શુભ મુહૂર્તનું રિમાઇન્ડર સેટ કરો.'
                )}
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
                      <span>{rem.timestamp ? formatTimestamp(rem.timestamp) : pickL(language, 'सक्रिय', 'Active', 'સક્રિય')}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => handleDelete(rem.id, e)}
                    className="p-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-800 transition cursor-pointer"
                    title={pickL(language, 'हटाएं', 'Delete', 'દૂર કરો')}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="text-[10px] text-center text-[#8C6239]">
            {pickL(
              language,
              'डिवाइस नोटिफिकेशन द्वारा समय पर अलर्ट प्राप्त होगा।',
              'You will receive a timely alert via device notification.',
              'ડિવાઇસ નોટિફિકેશન દ્વારા સમયસર એલર્ટ પ્રાપ્ત થશે.'
            )}
          </div>
        </div>
      ),
    },

    // Slide 2: Add New Reminder
    {
      id: 'add-new',
      title: pickL(language, 'नया शुभ स्मरण सेट करें', 'Set New Auspicious Reminder', 'નવું શુભ સ્મરણ સેટ કરો'),
      subtitle: pickL(language, 'पूजा, संकल्प या मुहूर्त अलार्म', 'Puja, Sankalpa or Muhurat alarm', 'પૂજા, સંકલ્પ કે મુહૂર્ત એલાર્મ'),
      badge: pickL(language, 'नया रिमाइंडर', 'New Reminder', 'નવું રિમાઇન્ડર'),
      icon: '➕',
      voiceText: pickL(language, 'नया शुभ समय स्मरण सेट करें।', 'Set a new auspicious time reminder.', 'નવું શુભ સમય સ્મરણ સેટ કરો.'),
      content: (
        <div className="h-full flex flex-col justify-between py-1 space-y-2">
          <div className="p-3 rounded-2xl bg-white/95 border border-amber-300 space-y-2 my-auto text-xs">
            <div>
              <label className="text-[10px] font-bold text-[#8C6239] block mb-0.5">
                {pickL(language, 'शीर्षक (Title)', 'Title', 'શીર્ષક (Title)')}
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setHasEditedTitle(true);
                  setTitle(e.target.value);
                }}
                onClick={(e) => e.stopPropagation()}
                className="w-full bg-[#FAF2E4] border border-[#DFCBB5] rounded-lg p-1.5 text-xs font-semibold text-[#5C3A21] outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              <div>
                <label className="text-[10px] font-bold text-[#8C6239] block mb-0.5">
                  {pickL(language, 'दिनांक (Date)', 'Date', 'તારીખ (Date)')}
                </label>
                <input
                  type="date"
                  value={dateStr}
                  onChange={(e) => setDateStr(e.target.value)}
                  onClick={(e) => {
                    e.stopPropagation();
                    try {
                      (e.currentTarget as any).showPicker?.();
                    } catch {}
                  }}
                  className="w-full bg-[#FAF2E4] border border-[#DFCBB5] rounded-lg p-1.5 text-xs font-semibold text-[#5C3A21] outline-none cursor-pointer"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-[#8C6239] block mb-0.5">
                  {pickL(language, 'समय (Time)', 'Time', 'સમય (Time)')}
                </label>
                <input
                  type="time"
                  value={timeStr}
                  onChange={(e) => setTimeStr(e.target.value)}
                  onClick={(e) => {
                    e.stopPropagation();
                    try {
                      (e.currentTarget as any).showPicker?.();
                    } catch {}
                  }}
                  className="w-full bg-[#FAF2E4] border border-[#DFCBB5] rounded-lg p-1.5 text-xs font-semibold text-[#5C3A21] outline-none cursor-pointer"
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
              <span>{successMsg || pickL(language, 'रिमाइंडर सहेजें', 'Save Reminder', 'રિમાઇન્ડર સેવ કરો')}</span>
            </button>
          </div>
          <div className="text-[10px] text-center text-[#8C6239]">
            {pickL(
              language,
              'नित्य प्रातःकाल व संध्याकाल उपासना का नियम बनाए रखें।',
              'Maintain your daily morning and evening worship routine.',
              'નિત્ય સવાર અને સાંજની ઉપાસનાનો નિયમ જાળવી રાખો.'
            )}
          </div>
        </div>
      ),
    },
  ];

  return (
    <UniversalStoryDeck
      slides={slides}
      headerTitle={t('nav.reminders', pickL(language, 'स्मृति व संकल्प', 'Reminders & Vows', 'સ્મૃતિ અને સંકલ્પ'))}
      headerIcon="🔔"
      chapterNumber={7}
      onOpenUma={
        onOpenUmaModal
          ? () =>
              onOpenUmaModal(
                pickL(language, 'दैनिक साधना व व्रत नियम', 'Daily Sadhana & Vrat discipline', 'દૈનિક સાધના અને વ્રત નિયમ')
              )
          : undefined
      }
      onPrevChapter={onPrevChapter}
      onNextChapter={onNextChapter}
      prevChapterLabel={pickL(language, 'पर्व व त्योहार', 'Festivals', 'પર્વ અને તહેવારો')}
      nextChapterLabel={pickL(language, 'व्रत कथा', 'Vrat Katha', 'વ્રત કથા')}
    />
  );
};
export default RemindersView;
