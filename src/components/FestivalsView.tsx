import React, { useState, useMemo } from 'react';
import { FestivalItem } from '../types';
import { getFestivalsForYear } from '../services/festivals';
import { saveAppReminder } from '../services/storage';
import {
  Sparkles,
  Calendar,
  Bell,
  Check,
  Flame,
  Sun,
  Moon,
  Star,
  Scale,
} from 'lucide-react';
import { useTranslation } from '../i18n';
import { UniversalStoryDeck, StorySlideItem } from './UniversalStoryDeck';
import { TithiNirnayaModal } from './TithiNirnayaModal';

interface FestivalsViewProps {
  currentDate: Date;
  onNavigateToReminders?: () => void;
  onDateSelect?: (date: Date) => void;
  onOpenUmaModal?: (query?: string) => void;
  onPrevChapter?: () => void;
  onNextChapter?: () => void;
}

const MAJOR_NAMES = [
  'मकर संक्रांति',
  'महाशिवरात्रि',
  'होली',
  'श्री राम नवमी',
  'हनुमान जयंती',
  'अक्षय तृतीया',
  'रक्षाबंधन',
  'श्री कृष्ण जन्माष्टमी',
  'गणेश चतुर्थी',
  'शारदीय नवरात्रि',
  'दशहरा',
  'करवा चौथ',
  'धनतेरस',
  'दीपावली',
  'गोवर्धन पूजा',
  'भाई दूज',
  'छठ पूजा',
  'देवउठनी एकादशी',
];

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
  const [isTithiNirnayaOpen, setIsTithiNirnayaOpen] = useState(false);

  const selectedYear = currentDate.getFullYear() || 2026;
  const festivals = useMemo(() => getFestivalsForYear(selectedYear), [selectedYear]);

  const upcomingList = useMemo(() => {
    const today = new Date(currentDate);
    today.setHours(0, 0, 0, 0);
    return festivals
      .filter((f) => {
        const festDate = new Date(f.date);
        festDate.setHours(0, 0, 0, 0);
        return festDate >= today;
      })
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [festivals, currentDate]);

  const handleAddReminder = (fest: FestivalItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const title = fest.hindiName || fest.name;
    saveAppReminder({
      id: `fest_${fest.name}_${fest.date.toISOString()}`,
      title,
      category: fest.type === 'व्रत' || fest.type === 'एकादशी' ? 'vrat' : 'festival',
      date: fest.date.toISOString().split('T')[0],
      notes: `${title} - ${fest.tithi || ''} ${fest.description || ''}`,
    });
    setAddedReminderId(fest.name);
    setTimeout(() => setAddedReminderId(null), 2000);
  };

  // Upgraded chunking: 5 items per slide to fill the screen rich and complete
  const upcomingChunk1 = upcomingList.slice(0, 5);
  const upcomingChunk2 = upcomingList.slice(5, 10);

  // Annual Major Sanatan Festivals
  const majorFestivals = useMemo(() => {
    return festivals
      .filter((f) =>
        MAJOR_NAMES.some((m) => (f.hindiName && f.hindiName.includes(m)) || f.name.toLowerCase().includes(m.toLowerCase()))
      )
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(0, 8);
  }, [festivals]);

  // Sacred Ekadashi & Pradosh Fasting Dates
  const vratsList = useMemo(() => {
    const today = new Date(currentDate);
    today.setHours(0, 0, 0, 0);
    return festivals
      .filter((f) => {
        const isVrat = f.type === 'एकादशी' || f.type === 'व्रत' || f.name.toLowerCase().includes('ekadashi') || f.name.toLowerCase().includes('pradosh');
        const festDate = new Date(f.date);
        festDate.setHours(0, 0, 0, 0);
        return isVrat && festDate >= today;
      })
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(0, 5);
  }, [festivals, currentDate]);

  const renderFestivalCard = (fest: FestivalItem, idx: number, iconChar = '🪔') => {
    const targetDate = new Date(fest.date);
    targetDate.setHours(0, 0, 0, 0);
    const today = new Date(currentDate);
    today.setHours(0, 0, 0, 0);
    const daysDiff = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const isAdded = addedReminderId === fest.name;
    const displayName = fest.hindiName || fest.name;

    return (
      <div
        key={idx}
        className="p-2.5 sm:p-3 rounded-2xl bg-white/95 border border-amber-300/80 shadow-xs hover:border-amber-500 transition space-y-1"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-sm shrink-0">{iconChar}</span>
              <h4 className="font-black font-granth text-xs sm:text-sm text-[#462B17] truncate">
                {displayName}
              </h4>
              {fest.type && (
                <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 text-[9px] font-bold border border-amber-300">
                  {fest.type}
                </span>
              )}
            </div>

            <div className="text-[10px] sm:text-[11px] text-[#8C6239] mt-0.5 font-bold flex items-center gap-1.5 flex-wrap">
              <span>
                {fest.date.toLocaleDateString('hi-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
              {fest.tithi && <span className="text-[#5C3A21]">• {fest.tithi}</span>}
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                daysDiff === 0
                  ? 'bg-rose-600 text-white animate-pulse'
                  : daysDiff === 1
                  ? 'bg-amber-600 text-white'
                  : 'bg-amber-100 text-[#8C4A00] border border-amber-300'
              }`}
            >
              {daysDiff === 0 ? 'आज' : daysDiff === 1 ? 'कल' : `${daysDiff} दिन शेष`}
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

        {fest.description && (
          <p className="text-[10px] text-stone-700 leading-snug pt-0.5 line-clamp-2">
            {fest.description}
          </p>
        )}
      </div>
    );
  };

  const slides: StorySlideItem[] = [
    // Slide 1: Next 5 Upcoming Festivals
    {
      id: 'upcoming-1',
      title: 'आगामी प्रमुख व्रत व महापर्व (निकटतम)',
      subtitle: `${selectedYear} • आगामी पर्व तिथियाँ (सूची १)`,
      badge: `${upcomingChunk1.length} पर्व`,
      icon: '🪔',
      voiceText: `आगामी निकटतम प्रमुख पर्व हैं: ${upcomingChunk1.map((f) => f.hindiName || f.name).join(', ')}।`,
      content: (
        <div className="h-full flex flex-col justify-between py-1 space-y-2">
          <div className="space-y-2 overflow-y-auto max-h-[460px] pr-0.5">
            {upcomingChunk1.map((fest, idx) => renderFestivalCard(fest, idx, '🪔'))}
          </div>
          <div className="text-[10px] text-center text-[#8C6239] pt-1 border-t border-amber-200/60 shrink-0">
            🔔 घंटी आइकन दबाकर किसी भी पर्व की स्मृति (Reminder) तुरंत सेट करें।
          </div>
        </div>
      ),
    },

    // Slide 2: Next 5 Upcoming (Part 2)
    {
      id: 'upcoming-2',
      title: 'अग्रिम व्रत व उत्सव सूची (भाग २)',
      subtitle: `${selectedYear} • आगामी तिथियाँ (सूची २)`,
      badge: `${upcomingChunk2.length} पर्व`,
      icon: '🌺',
      voiceText: `अग्रिम पर्व सूची में शामिल हैं: ${upcomingChunk2.map((f) => f.hindiName || f.name).join(', ')}।`,
      content: (
        <div className="h-full flex flex-col justify-between py-1 space-y-2">
          <div className="space-y-2 overflow-y-auto max-h-[460px] pr-0.5">
            {upcomingChunk2.map((fest, idx) => renderFestivalCard(fest, idx, '🌺'))}
          </div>
          <div className="text-[10px] text-center text-[#8C6239] pt-1 border-t border-amber-200/60 shrink-0">
            शास्त्रसम्मत सूर्य-सिद्धान्त गणना अनुसार व्रत व मुहूर्त काल।
          </div>
        </div>
      ),
    },

    // Slide 3: Major Sanatan Festivals of the Year (8 items in 2 cols)
    {
      id: 'major-sanatan',
      title: `वार्षिक सनातन महापर्व (${selectedYear})`,
      subtitle: 'दीपावली, महाशिवरात्रि, नवरात्रि, जन्माष्टमी, रक्षाबंधन आदि',
      badge: `${majorFestivals.length} महापर्व`,
      icon: '✨',
      voiceText: `सनातन धर्म के प्रमुख वार्षिक महापर्व: ${majorFestivals.map((f) => f.hindiName || f.name).slice(0, 4).join(', ')} आदि।`,
      content: (
        <div className="h-full flex flex-col justify-between py-1 space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 overflow-y-auto max-h-[460px] pr-0.5">
            {majorFestivals.map((fest, idx) => {
              const isAdded = addedReminderId === fest.name;
              return (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-gradient-to-br from-[#FFF9EE] to-amber-100/70 border border-amber-300 shadow-xs flex flex-col justify-between space-y-1.5"
                >
                  <div className="flex items-start justify-between gap-1.5">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1">
                        <span className="text-sm">🪔</span>
                        <span className="font-black font-granth text-xs sm:text-sm text-[#462B17] truncate">
                          {fest.hindiName || fest.name}
                        </span>
                      </div>
                      <div className="text-[11px] font-bold text-amber-900 mt-0.5">
                        {fest.date.toLocaleDateString('hi-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => handleAddReminder(fest, e)}
                      className="p-1 rounded-lg bg-amber-500/20 hover:bg-amber-500 text-stone-900 transition cursor-pointer shrink-0"
                      title="स्मृति जोड़ें"
                    >
                      {isAdded ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Bell className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {fest.description && (
                    <p className="text-[10px] text-stone-600 line-clamp-2 leading-tight">
                      {fest.description}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
          <div className="text-[10px] text-center text-[#8C6239] pt-1 border-t border-amber-200/60 shrink-0">
            धर्मो रक्षति रक्षितः • सनातन संस्कृति के पावन उत्सव एवं महापर्व
          </div>
        </div>
      ),
    },

    // Slide 4: Sacred Ekadashi & Vrats of the Year
    {
      id: 'vrats-list',
      title: 'पवित्र एकादशी एवं उपवास तिथियाँ',
      subtitle: `${selectedYear} • मोक्षदा, निर्जला, देवउठनी एवं मुख्य एकादशी`,
      badge: `${vratsList.length} उपवास`,
      icon: '🕉️',
      voiceText: 'सनातन परंपरा में एकादशी एवं उपवास का विशेष आध्यात्मिक महत्व है।',
      content: (
        <div className="h-full flex flex-col justify-between py-1 space-y-2">
          <div className="space-y-2 overflow-y-auto max-h-[460px] pr-0.5">
            {vratsList.length > 0 ? (
              vratsList.map((fest, idx) => renderFestivalCard(fest, idx, '🕉️'))
            ) : (
              <div className="text-center py-6 text-xs text-[#8C6239]">
                वर्तमान वर्ष के सभी एकादशी व व्रत तिथियाँ उपलब्ध हैं।
              </div>
            )}
          </div>
          <div className="text-[10px] text-center text-[#8C6239] pt-1 border-t border-amber-200/60 shrink-0">
            एकादशी व्रत से मन की शुद्धि, सात्विक ऊर्जा एवं भगवान श्री हरि की कृपा प्राप्त होती है।
          </div>
        </div>
      ),
    },

    // Slide 5: 10-Year Shastric Festival Conflict Resolver (2025-2035)
    {
      id: 'shastric-nirnaya',
      title: '१०-वर्षीय शास्त्रोक्त पर्व निर्णय (2025-2035)',
      subtitle: 'द्वि-तिथि संशय समाधान • निर्णयसिन्धु व धर्मसिन्धु प्रमाण',
      badge: '१०-वर्षीय दिग्दर्शिका',
      icon: '⚖️',
      voiceText: 'सनातन धर्मशास्त्र के काल-व्याप्ति सिद्धांत अनुसार १०-वर्षीय पर्व निर्णय एवं प्रमाण।',
      content: (
        <div className="h-full flex flex-col justify-between py-1 space-y-2.5">
          <div className="space-y-2 overflow-y-auto max-h-[440px] pr-0.5">
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#4A2610] to-[#6A3716] text-amber-50 border border-amber-300 shadow-xs space-y-2.5">
              <div className="flex items-center gap-1.5 text-amber-300 font-bold text-xs">
                <Scale className="w-4 h-4" />
                <span>शास्त्रोक्त काल-व्याप्ति व द्वि-तिथि समाधान</span>
              </div>
              <p className="text-xs text-amber-100/90 leading-relaxed">
                जब एक दिन में २ तिथियां हों अथवा कोई तिथि २ दिनों में व्याप्त हो (जैसे धनतेरस, दीपावली, महाशिवरात्रि), तो धर्मशास्त्र (निर्णयसिन्धु, धर्मसिन्धु, स्कन्द पुराण) के कर्मकाल नियमानुसार किस दिन त्योहार मनाना चाहिए — इसका १० वर्षों (२०२५ से २०३५) का सूक्ष्म गणितीय व श्लोक प्रमाण सहित निर्णय।
              </p>
              <button
                type="button"
                onClick={() => setIsTithiNirnayaOpen(true)}
                className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-black text-xs transition flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
              >
                <Scale className="w-4 h-4" />
                <span>१०-वर्षीय शास्त्रोक्त पर्व निर्णय दिग्दर्शिका खोलें ➔</span>
              </button>
            </div>

            <div className="p-3 rounded-xl bg-white/95 border border-amber-200 text-xs space-y-2">
              <span className="font-bold text-[#8C4A00] block text-xs">प्रमुख कर्मकाल व्याप्ति नियम:</span>
              <ul className="space-y-1 text-stone-700 text-[11px]">
                <li>• <strong>प्रदोष काल (संध्या):</strong> धनतेरस, दीपावली लक्ष्मी पूजन, प्रदोष व्रत।</li>
                <li>• <strong>निशीथ काल (मध्यरात्रि):</strong> महाशिवरात्रि, श्री कृष्ण जन्माष्टमी।</li>
                <li>• <strong>मध्याह्न काल (दोपहर):</strong> श्री गणेश चतुर्थी, श्री राम नवमी।</li>
                <li>• <strong>उदया तिथि (प्रातः):</strong> एकादशी व्रत, अनंत चतुर्दशी।</li>
              </ul>
            </div>
          </div>

          <div className="text-[10px] text-center text-[#8C6239] pt-1 border-t border-amber-200/60 shrink-0">
            धर्मो रक्षति रक्षितः • धर्मसिन्धु व निर्णयसिन्धु आधारित प्रामाणिक निर्णय
          </div>
        </div>
      ),
    },
  ];

  return (
    <>
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

      <TithiNirnayaModal
        isOpen={isTithiNirnayaOpen}
        onClose={() => setIsTithiNirnayaOpen(false)}
        initialTab="10year"
        onDateSelect={onDateSelect}
      />
    </>
  );
};

export default FestivalsView;
