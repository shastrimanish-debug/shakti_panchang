import React, { useState, useMemo } from 'react';
import { FestivalItem } from '../types';
import { getFestivalsForYear, getLocalizedFestival } from '../services/festivals';
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
import { useTranslation, useLanguage } from '../i18n';
import { trVedic } from '../i18n/vedicTranslate';
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
  const { t } = useTranslation();
  const { language } = useLanguage();
  const cLang = (language || 'hi').slice(0, 2).toLowerCase();
  const L = <T,>(hi: T, en: T, gu: T): T => (cLang === 'en' ? en : cLang === 'gu' ? gu : hi);
  const dateLocale = cLang === 'en' ? 'en-US' : cLang === 'gu' ? 'gu-IN' : 'hi-IN';

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
    const loc = getLocalizedFestival(fest, cLang);
    const title = loc.title;
    saveAppReminder({
      id: `fest_${fest.name}_${fest.date.toISOString()}`,
      title,
      category: fest.type === 'व्रत' || fest.type === 'एकादशी' ? 'vrat' : 'festival',
      date: fest.date.toISOString().split('T')[0],
      notes: `${title} - ${fest.tithi ? trVedic(fest.tithi, cLang) : ''} ${loc.description || ''}`,
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
    const loc = getLocalizedFestival(fest, cLang);

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
                {loc.title}
              </h4>
              {loc.type && (
                <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 text-[9px] font-bold border border-amber-300">
                  {loc.type}
                </span>
              )}
            </div>

            <div className="text-[10px] sm:text-[11px] text-[#8C6239] mt-0.5 font-bold flex items-center gap-1.5 flex-wrap">
              <span>
                {fest.date.toLocaleDateString(dateLocale, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
              {fest.tithi && <span className="text-[#5C3A21]">• {trVedic(fest.tithi, cLang)}</span>}
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
              {daysDiff === 0
                ? L('आज', 'Today', 'આજે')
                : daysDiff === 1
                ? L('कल', 'Tomorrow', 'કાલે')
                : L(`${daysDiff} दिन शेष`, `${daysDiff} days left`, `${daysDiff} દિવસ બાકી`)}
            </span>
            <button
              type="button"
              onClick={(e) => handleAddReminder(fest, e)}
              className="p-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500 text-stone-900 transition cursor-pointer"
              title={L('स्मृति जोड़ें', 'Add Reminder', 'સ્મૃતિ ઉમેરો')}
            >
              {isAdded ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Bell className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {loc.description && (
          <p className="text-[10px] text-stone-700 leading-snug pt-0.5 line-clamp-2">
            {loc.description}
          </p>
        )}
      </div>
    );
  };

  const slides: StorySlideItem[] = [
    // Slide 1: Next 5 Upcoming Festivals
    {
      id: 'upcoming-1',
      title: L('आगामी प्रमुख व्रत व महापर्व (निकटतम)', 'Upcoming Major Vrats & Festivals (Nearest)', 'આગામી મુખ્ય વ્રત અને મહાપર્વ (નજીકના)'),
      subtitle: L(`${selectedYear} • आगामी पर्व तिथियाँ (सूची १)`, `${selectedYear} • Upcoming Festival Dates (List 1)`, `${selectedYear} • આગામી પર્વ તિથિઓ (સૂચિ ૧)`),
      badge: L(`${upcomingChunk1.length} पर्व`, `${upcomingChunk1.length} Festivals`, `${upcomingChunk1.length} પર્વ`),
      icon: '🪔',
      voiceText: L(
        `आगामी निकटतम प्रमुख पर्व हैं: ${upcomingChunk1.map((f) => getLocalizedFestival(f, cLang).title).join(', ')}।`,
        `Upcoming nearest major festivals are: ${upcomingChunk1.map((f) => getLocalizedFestival(f, cLang).title).join(', ')}.`,
        `આગામી નજીકના મુખ્ય પર્વ છે: ${upcomingChunk1.map((f) => getLocalizedFestival(f, cLang).title).join(', ')}.`
      ),
      content: (
        <div className="h-full flex flex-col justify-between py-1 space-y-2">
          <div className="space-y-2 overflow-y-auto max-h-[460px] pr-0.5">
            {upcomingChunk1.map((fest, idx) => renderFestivalCard(fest, idx, '🪔'))}
          </div>
          <div className="text-[10px] text-center text-[#8C6239] pt-1 border-t border-amber-200/60 shrink-0">
            {L(
              '🔔 घंटी आइकन दबाकर किसी भी पर्व की स्मृति (Reminder) तुरंत सेट करें।',
              '🔔 Tap the bell icon to set a reminder for any festival immediately.',
              '🔔 ઘંટડી આઇકન દબાવીને કોઈપણ પર્વનું રિમાઇન્ડર તરત સેટ કરો.'
            )}
          </div>
        </div>
      ),
    },

    // Slide 2: Next 5 Upcoming (Part 2)
    {
      id: 'upcoming-2',
      title: L('अग्रिम व्रत व उत्सव सूची (भाग २)', 'Upcoming Vrats & Festivals (Part 2)', 'આગામી વ્રત અને ઉત્સવ સૂચિ (ભાગ ૨)'),
      subtitle: L(`${selectedYear} • आगामी तिथियाँ (सूची २)`, `${selectedYear} • Upcoming Dates (List 2)`, `${selectedYear} • આગામી તિથિઓ (સૂચિ ૨)`),
      badge: L(`${upcomingChunk2.length} पर्व`, `${upcomingChunk2.length} Festivals`, `${upcomingChunk2.length} પર્વ`),
      icon: '🌺',
      voiceText: L(
        `अग्रिम पर्व सूची में शामिल हैं: ${upcomingChunk2.map((f) => getLocalizedFestival(f, cLang).title).join(', ')}।`,
        `Further upcoming festivals include: ${upcomingChunk2.map((f) => getLocalizedFestival(f, cLang).title).join(', ')}.`,
        `આગામી પર્વ સૂચિમાં સામેલ છે: ${upcomingChunk2.map((f) => getLocalizedFestival(f, cLang).title).join(', ')}.`
      ),
      content: (
        <div className="h-full flex flex-col justify-between py-1 space-y-2">
          <div className="space-y-2 overflow-y-auto max-h-[460px] pr-0.5">
            {upcomingChunk2.map((fest, idx) => renderFestivalCard(fest, idx, '🌺'))}
          </div>
          <div className="text-[10px] text-center text-[#8C6239] pt-1 border-t border-amber-200/60 shrink-0">
            {L(
              'शास्त्रसम्मत सूर्य-सिद्धान्त गणना अनुसार व्रत व मुहूर्त काल।',
              'Vrat and Muhurat timings calculated as per authentic Surya-Siddhanta.',
              'શાસ્ત્રોક્ત સૂર્ય-સિદ્ધાંત ગણતરી મુજબ વ્રત અને મુહૂર્ત કાળ.'
            )}
          </div>
        </div>
      ),
    },

    // Slide 3: Major Sanatan Festivals of the Year (8 items in 2 cols)
    {
      id: 'major-sanatan',
      title: L(`वार्षिक सनातन महापर्व (${selectedYear})`, `Annual Sanatan Mahaparvas (${selectedYear})`, `વાર્ષિક સનાતન મહાપર્વ (${selectedYear})`),
      subtitle: L(
        'दीपावली, महाशिवरात्रि, नवरात्रि, जन्माष्टमी, रक्षाबंधन आदि',
        'Deepavali, Mahashivratri, Navratri, Janmashtami, Raksha Bandhan etc.',
        'દિવાળી, મહાશિવરાત્રી, નવરાત્રી, જન્માષ્ટમી, રક્ષાબંધન વગેરે'
      ),
      badge: L(`${majorFestivals.length} महापर्व`, `${majorFestivals.length} Major`, `${majorFestivals.length} મહાપર્વ`),
      icon: '✨',
      voiceText: L(
        `सनातन धर्म के प्रमुख वार्षिक महापर्व: ${majorFestivals.map((f) => getLocalizedFestival(f, cLang).title).slice(0, 4).join(', ')} आदि।`,
        `Major annual Sanatan festivals: ${majorFestivals.map((f) => getLocalizedFestival(f, cLang).title).slice(0, 4).join(', ')} and more.`,
        `સનાતન ધર્મના મુખ્ય વાર્ષિક મહાપર્વ: ${majorFestivals.map((f) => getLocalizedFestival(f, cLang).title).slice(0, 4).join(', ')} વગેરે.`
      ),
      content: (
        <div className="h-full flex flex-col justify-between py-1 space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 overflow-y-auto max-h-[460px] pr-0.5">
            {majorFestivals.map((fest, idx) => {
              const isAdded = addedReminderId === fest.name;
              const loc = getLocalizedFestival(fest, cLang);
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
                          {loc.title}
                        </span>
                      </div>
                      <div className="text-[11px] font-bold text-amber-900 mt-0.5">
                        {fest.date.toLocaleDateString(dateLocale, { weekday: 'short', day: 'numeric', month: 'short' })}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => handleAddReminder(fest, e)}
                      className="p-1 rounded-lg bg-amber-500/20 hover:bg-amber-500 text-stone-900 transition cursor-pointer shrink-0"
                      title={L('स्मृति जोड़ें', 'Add Reminder', 'સ્મૃતિ ઉમેરો')}
                    >
                      {isAdded ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Bell className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {loc.description && (
                    <p className="text-[10px] text-stone-600 line-clamp-2 leading-tight">
                      {loc.description}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
          <div className="text-[10px] text-center text-[#8C6239] pt-1 border-t border-amber-200/60 shrink-0">
            {L(
              'धर्मो रक्षति रक्षितः • सनातन संस्कृति के पावन उत्सव एवं महापर्व',
              'Dharmo Rakshati Rakshitah • Sacred Festivals of Sanatan Culture',
              'ધર્મો રક્ષતિ રક્ષિતઃ • સનાતન સંસ્કૃતિના પાવન ઉત્સવો અને મહાપર્વ'
            )}
          </div>
        </div>
      ),
    },

    // Slide 4: Sacred Ekadashi & Vrats of the Year
    {
      id: 'vrats-list',
      title: L('पवित्र एकादशी एवं उपवास तिथियाँ', 'Sacred Ekadashi & Fasting Dates', 'પવિત્ર એકાદશી અને ઉપવાસ તિથિઓ'),
      subtitle: L(
        `${selectedYear} • मोक्षदा, निर्जला, देवउठनी एवं मुख्य एकादशी`,
        `${selectedYear} • Mokshada, Nirjala, Devuthani & Major Ekadashis`,
        `${selectedYear} • મોક્ષદા, નિર્જલા, દેવઉઠી અને મુખ્ય એકાદશી`
      ),
      badge: L(`${vratsList.length} उपवास`, `${vratsList.length} Vrats`, `${vratsList.length} ઉપવાસ`),
      icon: '🕉️',
      voiceText: L(
        'सनातन परंपरा में एकादशी एवं उपवास का विशेष आध्यात्मिक महत्व है।',
        'Ekadashi and sacred fasts hold special spiritual significance in Sanatan tradition.',
        'સનાતન પરંપરામાં એકાદશી અને ઉપવાસનું વિશેષ આધ્યાત્મિક મહત્વ છે.'
      ),
      content: (
        <div className="h-full flex flex-col justify-between py-1 space-y-2">
          <div className="space-y-2 overflow-y-auto max-h-[460px] pr-0.5">
            {vratsList.length > 0 ? (
              vratsList.map((fest, idx) => renderFestivalCard(fest, idx, '🕉️'))
            ) : (
              <div className="text-center py-6 text-xs text-[#8C6239]">
                {L(
                  'वर्तमान वर्ष के सभी एकादशी व व्रत तिथियाँ उपलब्ध हैं।',
                  'All Ekadashi and Vrat dates for the current year are available.',
                  'વર્તમાન વર્ષની તમામ એકાદશી અને વ્રત તિથિઓ ઉપલબ્ધ છે.'
                )}
              </div>
            )}
          </div>
          <div className="text-[10px] text-center text-[#8C6239] pt-1 border-t border-amber-200/60 shrink-0">
            {L(
              'एकादशी व्रत से मन की शुद्धि, सात्विक ऊर्जा एवं भगवान श्री हरि की कृपा प्राप्त होती है।',
              'Ekadashi fasting brings mental purity, Sattvic energy, and Lord Sri Hari’s grace.',
              'એકાદશી વ્રતથી મનની શુદ્ધિ, સાત્વિક ઊર્જા અને ભગવાન શ્રી હરિની કૃપા પ્રાપ્ત થાય છે.'
            )}
          </div>
        </div>
      ),
    },

    // Slide 5: 10-Year Shastric Festival Conflict Resolver (2025-2035)
    {
      id: 'shastric-nirnaya',
      title: L('१०-वर्षीय शास्त्रोक्त पर्व निर्णय (2025-2035)', '10-Year Shastric Festival Decisions (2025-2035)', '૧૦-વર્ષીય શાસ્ત્રોક્ત પર્વ નિર્ણય (2025-2035)'),
      subtitle: L(
        'द्वि-तिथि संशय समाधान • निर्णयसिन्धु व धर्मसिन्धु प्रमाण',
        'Dual-Tithi Conflict Resolver • Nirnayasindhu & Dharmasindhu Proof',
        'દ્વિ-તિથિ સંશય સમાધાન • નિર્ણયસિંધુ અને ધર્મસિંધુ પ્રમાણ'
      ),
      badge: L('१०-वर्षीय दिग्दर्शिका', '10-Year Guide', '૧૦-વર્ષીય દિગ્દર્શિકા'),
      icon: '⚖️',
      voiceText: L(
        'सनातन धर्मशास्त्र के काल-व्याप्ति सिद्धांत अनुसार १०-वर्षीय पर्व निर्णय एवं प्रमाण।',
        '10-year festival decisions and scriptural proofs based on Dharmashastra Kaal-Vyapti rules.',
        'સનાતન ધર્મશાસ્ત્રના કાળ-વ્યાપ્તિ સિદ્ધાંત મુજબ ૧૦-વર્ષીય પર્વ નિર્ણય અને પ્રમાણ.'
      ),
      content: (
        <div className="h-full flex flex-col justify-between py-1 space-y-2.5">
          <div className="space-y-2 overflow-y-auto max-h-[440px] pr-0.5">
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#4A2610] to-[#6A3716] text-amber-50 border border-amber-300 shadow-xs space-y-2.5">
              <div className="flex items-center gap-1.5 text-amber-300 font-bold text-xs">
                <Scale className="w-4 h-4" />
                <span>{L('शास्त्रोक्त काल-व्याप्ति व द्वि-तिथि समाधान', 'Shastric Kaal-Vyapti & Dual-Tithi Resolver', 'શાસ્ત્રોક્ત કાળ-વ્યાપ્તિ અને દ્વિ-તિથિ સમાધાન')}</span>
              </div>
              <p className="text-xs text-amber-100/90 leading-relaxed">
                {L(
                  'जब एक दिन में २ तिथियां हों अथवा कोई तिथि २ दिनों में व्याप्त हो (जैसे धनतेरस, दीपावली, महाशिवरात्रि), तो धर्मशास्त्र (निर्णयसिन्धु, धर्मसिन्धु, स्कन्द पुराण) के कर्मकाल नियमानुसार किस दिन त्योहार मनाना चाहिए — इसका १० वर्षों (२०२५ से २०३५) का सूक्ष्म गणितीय व श्लोक प्रमाण सहित निर्णय।',
                  'When two Tithis fall on one day or one Tithi spans two days (e.g., Dhanteras, Deepavali, Mahashivratri), consult exact 10-year (2025–2035) scriptural verdicts from Nirnayasindhu, Dharmasindhu & Skanda Purana with astronomical timings and shloka proofs.',
                  'જ્યારે એક દિવસમાં ૨ તિથિઓ હોય અથવા કોઈ તિથિ ૨ દિવસમાં વ્યાપ્ત હોય (જેમ કે ધનતેરસ, દિવાળી, મહાશિવરાત્રી), ત્યારે નિર્ણયસિંધુ અને ધર્મસિંધુના નિયમો મુજબ કયા દિવસે ઉત્સવ ઉજવવો — તેનો ૨૦૨૫ થી ૨૦૩૫ સુધીનો શ્લોક પ્રમાણ સહિત નિર્ણય.'
                )}
              </p>
              <button
                type="button"
                onClick={() => setIsTithiNirnayaOpen(true)}
                className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-black text-xs transition flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
              >
                <Scale className="w-4 h-4" />
                <span>{L('१०-वर्षीय शास्त्रोक्त पर्व निर्णय दिग्दर्शिका खोलें ➔', 'Open 10-Year Shastric Festival Guide ➔', '૧૦-વર્ષીય શાસ્ત્રોક્ત પર્વ નિર્ણય દિગ્દર્શિકા ખોલો ➔')}</span>
              </button>
            </div>

            <div className="p-3 rounded-xl bg-white/95 border border-amber-200 text-xs space-y-2">
              <span className="font-bold text-[#8C4A00] block text-xs">
                {L('प्रमुख कर्मकाल व्याप्ति नियम:', 'Key Karmakaal Vyapti Rules:', 'મુખ્ય કર્મકાળ વ્યાપ્તિ નિયમો:')}
              </span>
              <ul className="space-y-1 text-stone-700 text-[11px]">
                <li>• <strong>{L('प्रदोष काल (संध्या):', 'Pradosh Kaal (Dusk):', 'પ્રદોષ કાળ (સંધ્યા):')}</strong> {L('धनतेरस, दीपावली लक्ष्मी पूजन, प्रदोष व्रत।', 'Dhanteras, Deepavali Lakshmi Pujan, Pradosh Vrat.', 'ધનતેરસ, દિવાળી લક્ષ્મી પૂજન, પ્રદોષ વ્રત.')}</li>
                <li>• <strong>{L('निशीथ काल (मध्यरात्रि):', 'Nishitha Kaal (Midnight):', 'નિશીથ કાળ (મધ્યરાત્રિ):')}</strong> {L('महाशिवरात्रि, श्री कृष्ण जन्माष्टमी।', 'Mahashivratri, Sri Krishna Janmashtami.', 'મહાશિવરાત્રી, શ્રી કૃષ્ણ જન્માષ્ટમી.')}</li>
                <li>• <strong>{L('मध्याह्न काल (दोपहर):', 'Madhyahna Kaal (Midday):', 'મધ્યાહ્ન કાળ (બપોર):')}</strong> {L('श्री गणेश चतुर्थी, श्री राम नवमी।', 'Sri Ganesh Chaturthi, Sri Rama Navami.', 'શ્રી ગણેશ ચતુર્થી, શ્રી રામ નવમી.')}</li>
                <li>• <strong>{L('उदया तिथि (प्रातः):', 'Udaya Tithi (Sunrise):', 'ઉદયા તિથિ (સૂર્યોદય):')}</strong> {L('एकादशी व्रत, अनंत चतुर्दशी।', 'Ekadashi Vrat, Anant Chaturdashi.', 'એકાદશી વ્રત, અનંત ચતુર્દશી.')}</li>
              </ul>
            </div>
          </div>

          <div className="text-[10px] text-center text-[#8C6239] pt-1 border-t border-amber-200/60 shrink-0">
            {L(
              'धर्मो रक्षति रक्षितः • धर्मसिन्धु व निर्णयसिन्धु आधारित प्रामाणिक निर्णय',
              'Dharmo Rakshati Rakshitah • Authentic Decisions Based on Dharmasindhu & Nirnayasindhu',
              'ધર્મો રક્ષતિ રક્ષિતઃ • ધર્મસિંધુ અને નિર્ણયસિંધુ આધારિત પ્રમાણભૂત નિર્ણય'
            )}
          </div>
        </div>
      ),
    },
  ];

  return (
    <>
      <UniversalStoryDeck
        slides={slides}
        headerTitle={t('nav.festivals', L('पर्व व त्योहार', 'Festivals & Vrats', 'પર્વ અને તહેવારો'))}
        headerIcon="🪔"
        chapterNumber={6}
        currentDate={currentDate}
        onOpenUma={onOpenUmaModal ? () => onOpenUmaModal(L('आगामी त्योहार व व्रत पूजन विधि', 'Upcoming festivals and vrat puja vidhi', 'આગામી તહેવારો અને વ્રત પૂજન વિધિ')) : undefined}
        onPrevChapter={onPrevChapter}
        onNextChapter={onNextChapter}
        prevChapterLabel={t('nav.kundali', L('कुण्डली', 'Kundali', 'કુંડળી'))}
        nextChapterLabel={t('nav.reminders', L('स्मृति व संकल्प', 'Reminders & Sankalp', 'સ્મૃતિ અને સંકલ્પ'))}
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
