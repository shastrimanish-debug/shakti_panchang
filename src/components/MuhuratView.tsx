import React, { useState } from 'react';
import { VedicPanchangData } from '../types';
import { MUHURAT_ACTIVITIES, getMuhuratGuidance, getDailyMuhuratDetails } from '../services/muhurat';
import { DISHASHOOL_MAP } from '../services/disha';
import { useTranslation } from '../i18n';
import { trVedic } from '../i18n/vedicTranslate';
import {
  Sparkles,
  CheckCircle2,
  Calendar,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { UniversalStoryDeck, StorySlideItem } from './UniversalStoryDeck';

interface MuhuratViewProps {
  panchang: VedicPanchangData;
  onOpenUmaModal?: (query?: string) => void;
  onPrevChapter?: () => void;
  onNextChapter?: () => void;
}

export const MuhuratView: React.FC<MuhuratViewProps> = ({
  panchang,
  onOpenUmaModal,
  onPrevChapter,
  onNextChapter,
}) => {
  const { t } = useTranslation();
  const [selectedActivity, setSelectedActivity] = useState(MUHURAT_ACTIVITIES[0]);
  const weekday = panchang.date.getDay();
  const shoolDirection = DISHASHOOL_MAP[weekday];
  const guidance = getMuhuratGuidance(selectedActivity, panchang, shoolDirection);
  const dailyRows = getDailyMuhuratDetails(panchang);

  const slides: StorySlideItem[] = [
    // Slide 1: Daily Muhurats
    {
      id: 'daily',
      title: t('muhurat.todayTab', 'आज के प्रमुख शुभ मुहूर्त'),
      subtitle: 'अभिजित, अमृत व ब्रह्म मुहूर्त',
      badge: 'दैनिक काल',
      icon: '✨',
      voiceText: 'आज के मुख्य शुभ मुहूर्त। अभिजित काल और अमृत काल।',
      content: (
        <div className="h-full flex flex-col justify-between py-1 space-y-2">
          <div className="space-y-1.5 my-auto">
            {dailyRows.slice(0, 5).map((row, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl bg-white/80 border border-[#E8DCCB] flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-black font-granth text-[#462B17]">{trVedic(row.title)}</div>
                  <div className="text-[10px] text-[#8C6239]">{row.note}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-mono font-black text-[#B56A00]">{row.start} - {row.end}</div>
                  <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                    row.kind === 'shubh' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {row.kind === 'shubh' ? 'शुभ' : 'त्याज्य'}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="text-[10px] text-center text-[#8C6239]">
            अभिजित मुहूर्त में किए गए सभी कार्य निर्विघ्न सम्पन्न होते हैं।
          </div>
        </div>
      ),
    },

    // Slide 2: Vivah & Griha Pravesh Dates
    {
      id: 'vivah-griha',
      title: 'वार्षिक विवाह व गृहप्रवेश मुहूर्त',
      subtitle: 'शास्त्रसम्मत पावन तिथियां',
      badge: 'मांगलिक काल',
      icon: '💒',
      voiceText: 'आगामी शुभ विवाह और गृहप्रवेश के पावन मुहूर्त।',
      content: (
        <div className="h-full flex flex-col justify-between py-1 space-y-2">
          <div className="p-3 rounded-2xl bg-amber-50/90 border border-amber-300 space-y-2 my-auto">
            <div className="text-xs font-bold text-[#5C3A21] flex items-center gap-1.5 border-b border-amber-200 pb-1">
              <Calendar className="w-3.5 h-3.5 text-amber-600" />
              <span>शुभ विवाह मुहूर्त चक्र</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              <div className="p-2 rounded-xl bg-white border border-amber-200">
                <div className="font-bold text-[#462B17]">शुक्ल पक्ष त्रयोदशी</div>
                <div className="text-[10px] text-[#8C6239]">रोहिणी / मृगशिरा नक्षत्र</div>
              </div>
              <div className="p-2 rounded-xl bg-white border border-amber-200">
                <div className="font-bold text-[#462B17]">शुक्ल पक्ष द्वितीया</div>
                <div className="text-[10px] text-[#8C6239]">उत्तराफाल्गुनी नक्षत्र</div>
              </div>
              <div className="p-2 rounded-xl bg-white border border-amber-200">
                <div className="font-bold text-[#462B17]">कृष्ण पक्ष पंचमी</div>
                <div className="text-[10px] text-[#8C6239]">हस्त / चित्रा नक्षत्र</div>
              </div>
              <div className="p-2 rounded-xl bg-white border border-amber-200">
                <div className="font-bold text-[#462B17]">शुक्ल पक्ष एकादशी</div>
                <div className="text-[10px] text-[#8C6239]">अनुराधा / रेवती नक्षत्र</div>
              </div>
            </div>
          </div>
          <div className="text-[10px] text-center text-[#8C6239]">
            विस्तृत कुण्डली मिलान व लग्न शुद्धि हेतु 'उमा परामर्श' लें।
          </div>
        </div>
      ),
    },

    // Slide 3: Activity Specific Guidance
    {
      id: 'activity',
      title: 'कार्य अनुसार मुहूर्त परामर्श',
      subtitle: trVedic(selectedActivity),
      badge: guidance.grade === 'excellent' || guidance.grade === 'good' ? 'शुभ समय' : 'सावधानी',
      icon: '🎯',
      voiceText: `${selectedActivity} के लिए मुहूर्त परामर्श।`,
      content: (
        <div className="h-full flex flex-col justify-between py-1 space-y-2">
          {/* Activity picker */}
          <div className="flex flex-wrap gap-1 justify-center shrink-0">
            {MUHURAT_ACTIVITIES.slice(0, 5).map((act) => (
              <button
                key={act}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedActivity(act);
                }}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                  selectedActivity === act
                    ? 'bg-[#5C3A21] text-white shadow-xs'
                    : 'bg-white/80 text-[#5C3A21] border border-[#E8DCCB]'
                }`}
              >
                {trVedic(act)}
              </button>
            ))}
          </div>

          <div className={`p-3.5 rounded-2xl border-2 my-auto ${
            guidance.grade === 'excellent' || guidance.grade === 'good'
              ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950'
              : 'bg-amber-50/90 border-amber-300 text-[#5C3A21]'
          }`}>
            <div className="flex items-center gap-1.5 font-black text-xs mb-1">
              {guidance.grade === 'excellent' || guidance.grade === 'good' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <ShieldCheck className="w-4 h-4 text-amber-600" />
              )}
              <span>{guidance.gradeText}</span>
            </div>
            <p className="text-xs font-medium leading-relaxed">
              {guidance.recommendations.join(' ')}
            </p>
          </div>

          <div className="text-[10px] text-center text-[#8C6239]">
            शुभ होरा व शुभ चौघड़िया में कार्य प्रारम्भ करना लाभप्रद रहता है।
          </div>
        </div>
      ),
    },

    // Slide 4: Vedic Muhurat Principles
    {
      id: 'rules',
      title: 'वैदिक मुहूर्त शास्त्र नियम',
      subtitle: 'शास्त्र सम्मत शुद्धि',
      badge: 'सिद्धांत',
      icon: '📜',
      voiceText: 'वैदिक मुहूर्त शास्त्र के नियम।',
      content: (
        <div className="h-full flex flex-col justify-between py-1 space-y-2">
          <div className="p-3 rounded-2xl bg-white/90 border border-[#E8DCCB] space-y-2 my-auto text-xs">
            <div className="flex items-start gap-2">
              <span className="text-[#B56A00] font-black">१.</span>
              <span><strong>तिथि शुद्धि:</strong> रिक्ता तिथियां (४, ९, १४) शुभ कार्यों में त्याज्य हैं।</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[#B56A00] font-black">२.</span>
              <span><strong>वार शुद्धि:</strong> गुरुवार व शुक्रवार सर्वकार्य सिद्धिकारक माने गए हैं।</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[#B56A00] font-black">३.</span>
              <span><strong>नक्षत्र शुद्धि:</strong> स्थिर नक्षत्र (रोहिणी, उत्तरा) निर्माण व गृहप्रवेश हेतु उत्तम हैं।</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[#B56A00] font-black">४.</span>
              <span><strong>राहुकाल व भद्रा:</strong> इस काल में कोई भी शुभ शुभारम्भ न करें।</span>
            </div>
          </div>
          <div className="text-[10px] text-center text-[#8C6239]">
            ॐ सर्वे भवन्तु सुखिनः सर्वे सन्तु निरामयाः।
          </div>
        </div>
      ),
    },
  ];

  return (
    <UniversalStoryDeck
      slides={slides}
      headerTitle={t('nav.muhurat', 'शुभ मुहूर्त')}
      headerIcon="✨"
      chapterNumber={3}
      currentDate={panchang.date}
      onOpenUma={onOpenUmaModal ? () => onOpenUmaModal('शुभ मुहूर्त परामर्श') : undefined}
      onPrevChapter={onPrevChapter}
      onNextChapter={onNextChapter}
      prevChapterLabel="चौघड़िया"
      nextChapterLabel="यात्रा दिशाशूल"
    />
  );
};
export default MuhuratView;
