import React, { useState, useEffect } from 'react';
import { AppReminder } from '../types';
import { getStoredReminders, saveReminder, deleteReminder } from '../services/storage';
import { Bell, Clock, Trash2, Plus, Check } from 'lucide-react';

export const RemindersView: React.FC = () => {
  const [reminders, setReminders] = useState<AppReminder[]>([]);
  const [title, setTitle] = useState('उमा का शुभ समय reminder');
  const [body, setBody] = useState('Shakti Panchang का शुभ मुहूर्त याद दिलाना');
  const [dateStr, setDateStr] = useState(() => new Date().toISOString().split('T')[0]);
  const [timeStr, setTimeStr] = useState('10:00');
  const [successMsg, setSuccessMsg] = useState('');

  const refreshList = () => {
    setReminders(getStoredReminders());
  };

  useEffect(() => {
    refreshList();
  }, []);

  const handleAddReminder = (e: React.FormEvent) => {
    e.preventDefault();
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
    refreshList();

    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }

    setSuccessMsg('रिमाइंडर सफलतापूर्वक सहेजा गया!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleDelete = (id: string) => {
    deleteReminder(id);
    refreshList();
  };

  const formatTimestamp = (ts: number) =>
    new Date(ts).toLocaleString('hi-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Form Card */}
      <div className="bg-[#FAF2E4] border border-[#8C6239]/40 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-[#B56A00]" />
          <h2 className="text-xl font-black font-granth text-[#5C3A21]">
            शुभ समय एवं व्रत रिमाइंडर सेट करें
          </h2>
        </div>
        <p className="text-xs text-[#735133]">
          अमृत चौघड़िया, राहुकाल समाप्ति, एकादशी व्रत या किसी विशिष्ट कार्य के लिए स्मरण लगाएँ।
        </p>

        <form onSubmit={handleAddReminder} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-[#8C6239] mb-1">रिमाइंडर शीर्षक</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#F4E8D1] border border-[#8C6239]/40 rounded-lg p-2 text-xs sm:text-sm font-semibold text-[#5C3A21] outline-none"
              placeholder="शीर्षक लिखें..."
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#8C6239] mb-1">तारीख</label>
            <input
              type="date"
              value={dateStr}
              onChange={(e) => setDateStr(e.target.value)}
              className="w-full bg-[#F4E8D1] border border-[#8C6239]/40 rounded-lg p-2 text-xs sm:text-sm font-semibold text-[#5C3A21] outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#8C6239] mb-1">समय</label>
            <input
              type="time"
              value={timeStr}
              onChange={(e) => setTimeStr(e.target.value)}
              className="w-full bg-[#F4E8D1] border border-[#8C6239]/40 rounded-lg p-2 text-xs sm:text-sm font-semibold text-[#5C3A21] outline-none"
              required
            />
          </div>

          <div className="sm:col-span-2 md:col-span-4">
            <label className="block text-xs font-bold text-[#8C6239] mb-1">
              संदेश (उमा का संदेश)
            </label>
            <input
              type="text"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full bg-[#F4E8D1] border border-[#8C6239]/40 rounded-lg p-2 text-xs sm:text-sm font-semibold text-[#5C3A21] outline-none"
              placeholder="विवरण या संदेश..."
            />
          </div>

          <div className="sm:col-span-2 md:col-span-4 flex items-center justify-between mt-2">
            {successMsg && (
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                {successMsg}
              </span>
            )}
            <button
              type="submit"
              className="ml-auto px-5 py-2 bg-[#5C3A21] hover:bg-[#462B17] text-[#FAF2E4] text-xs sm:text-sm font-bold rounded-lg shadow-sm transition flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              रिमाइंडर जोड़ें (Save Reminder)
            </button>
          </div>
        </form>
      </div>

      {/* Reminders List */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-[#8C6239] uppercase tracking-wider">
          सक्रिय रिमाइंडर सूची ({reminders.length})
        </h3>
        {reminders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {reminders.map((r) => {
              const isPast = r.timestamp ? Date.now() > r.timestamp : false;
              return (
                <div
                  key={r.id}
                  className={`p-4 rounded-xl border flex items-start justify-between gap-3 ${
                    isPast
                      ? 'bg-[#FAF2E4]/60 border-[#8C6239]/20 opacity-70'
                      : 'bg-[#FAF2E4] border-[#8C6239]/40 shadow-xs'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#5C3A21]">{r.title}</span>
                      {isPast && (
                        <span className="text-[10px] bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded">
                          व्यतीत
                        </span>
                      )}
                    </div>
                    {r.body && <p className="text-xs text-[#735133]">{r.body}</p>}
                    {r.timestamp && (
                      <div className="text-[11px] font-bold text-[#B56A00] pt-1 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {formatTimestamp(r.timestamp)}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(r.id)}
                    className="p-1.5 text-rose-700 hover:bg-rose-100/50 rounded-lg transition cursor-pointer"
                    title="हटाएँ"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-[#FAF2E4] p-8 text-center rounded-xl border border-[#8C6239]/20 text-[#735133] text-sm">
            वर्तमान में कोई सक्रिय रिमाइंडर नहीं है। ऊपर दिए गए फॉर्म से नया रिमाइंडर जोड़ें।
          </div>
        )}
      </div>
    </div>
  );
};
