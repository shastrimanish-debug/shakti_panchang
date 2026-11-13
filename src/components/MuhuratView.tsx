import React, { useState } from 'react';
import { VedicPanchangData } from '../types';
import { MUHURAT_ACTIVITIES, getMuhuratGuidance, getDailyMuhuratDetails } from '../services/muhurat';
import { DISHASHOOL_MAP } from '../services/disha';
import { useTranslation, useLanguage } from '../i18n';
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
  const { language } = useLanguage();
  const cLang = (language || 'hi').slice(0, 2).toLowerCase();
  const L = <T,>(hi: T, en: T, gu: T): T => (cLang === 'en' ? en : cLang === 'gu' ? gu : hi);

  const [selectedActivity, setSelectedActivity] = useState(MUHURAT_ACTIVITIES[0]);
  const weekday = panchang.date.getDay();
  const shoolDirection = DISHASHOOL_MAP[weekday];
  const guidance = getMuhuratGuidance(selectedActivity, panchang, shoolDirection, cLang);
  const dailyRows = getDailyMuhuratDetails(panchang, cLang);

  const slides: StorySlideItem[] = [
    // Slide 1: Daily Muhurats
    {
      id: 'daily',
      title: t('muhurat.todayTab', L('आज के प्रमुख शुभ मुहूर्त', "Today's Major Auspicious Muhurats", 'આજના મુખ્ય શુભ મુહૂર્ત')),
      subtitle: L('अभिजित, अमृत व ब्रह्म मुहूर्त', 'Abhijit, Amrit & Brahma Muhurat', 'અભિજિત, અમૃત અને બ્રહ્મ મુહૂર્ત'),
      badge: L('दैनिक काल', 'Daily Periods', 'દૈનિક કાળ'),
      icon: '✨',
      voiceText: L(
        'आज के मुख्य शुभ मुहूर्त। अभिजित काल और अमृत काल।',
        "Today's key auspicious muhurats, Abhijit Kaal and Amrit Kaal.",
        'આજના મુખ્ય શુભ મુહૂર્ત. અભિજિત કાળ અને અમૃત કાળ.'
      ),
      content: (
        <div className="h-full flex flex-col justify-between py-1 space-y-2">
          <div className="space-y-1.5 my-auto">
            {dailyRows.slice(0, 5).map((row, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl bg-white/80 border border-[#E8DCCB] flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-black font-granth text-[#462B17]">{trVedic(row.title, cLang)}</div>
                  <div className="text-[10px] text-[#8C6239]">{row.note}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-mono font-black text-[#B56A00]">{row.start} - {row.end}</div>
                  <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                    row.kind === 'shubh' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {row.kind === 'shubh' ? L('शुभ', 'Auspicious', 'શુભ') : L('त्याज्य', 'Avoidable', 'ત્યાજ્ય')}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="text-[10px] text-center text-[#8C6239]">
            {L(
              'अभिजित मुहूर्त में किए गए सभी कार्य निर्विघ्न सम्पन्न होते हैं।',
              'All works begun during Abhijit Muhurat conclude without obstacles.',
              'અભિજિત મુહૂર્તમાં શરૂ કરેલા બધા કાર્યો નિર્વિઘ્ન સંપન્ન થાય છે.'
            )}
          </div>
        </div>
      ),
    },

    // Slide 2: Vivah & Griha Pravesh Dates
    {
      id: 'vivah-griha',
      title: L('वार्षिक विवाह व गृहप्रवेश मुहूर्त', 'Annual Marriage & Griha Pravesh Muhurat', 'વાર્ષિક લગ્ન અને ગૃહપ્રવેશ મુહૂર્ત'),
      subtitle: L('शास्त्रसम्मत पावन तिथियां', 'Scripturally Sacred Tithis', 'શાસ્ત્રોક્ત પાવન તિથિઓ'),
      badge: L('मांगलिक काल', 'Mangalik Timing', 'માંગલિક કાળ'),
      icon: '💒',
      voiceText: L(
        'आगामी शुभ विवाह और गृहप्रवेश के पावन मुहूर्त।',
        'Sacred upcoming timings for auspicious marriage and Griha Pravesh.',
        'આગામી શુભ લગ્ન અને ગૃહપ્રવેશના પાવન મુહૂર્ત.'
      ),
      content: (
        <div className="h-full flex flex-col justify-between py-1 space-y-2">
          <div className="p-3 rounded-2xl bg-amber-50/90 border border-amber-300 space-y-2 my-auto">
            <div className="text-xs font-bold text-[#5C3A21] flex items-center gap-1.5 border-b border-amber-200 pb-1">
              <Calendar className="w-3.5 h-3.5 text-amber-600" />
              <span>{L('शुभ विवाह मुहूर्त चक्र', 'Auspicious Marriage Muhurat Cycle', 'શુભ લગ્ન મુહૂર્ત ચક્ર')}</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              <div className="p-2 rounded-xl bg-white border border-amber-200">
                <div className="font-bold text-[#462B17]">{L('शुक्ल पक्ष त्रयोदशी', 'Shukla Paksha Trayodashi', 'શુક્લ પક્ષ તેરસ')}</div>
                <div className="text-[10px] text-[#8C6239]">{L('रोहिणी / मृगशिरा नक्षत्र', 'Rohini / Mrigashira Nakshatra', 'રોહિણી / મૃગશિરા નક્ષત્ર')}</div>
              </div>
              <div className="p-2 rounded-xl bg-white border border-amber-200">
                <div className="font-bold text-[#462B17]">{L('शुक्ल पक्ष द्वितीया', 'Shukla Paksha Dwitiya', 'શુક્લ પક્ષ બીજ')}</div>
                <div className="text-[10px] text-[#8C6239]">{L('उत्तराफाल्गुनी नक्षत्र', 'Uttara Phalguni Nakshatra', 'ઉત્તરા ફાલ્ગુની નક્ષત્ર')}</div>
              </div>
              <div className="p-2 rounded-xl bg-white border border-amber-200">
                <div className="font-bold text-[#462B17]">{L('कृष्ण पक्ष पंचमी', 'Krishna Paksha Panchami', 'કૃષ્ણ પક્ષ પાંચમ')}</div>
                <div className="text-[10px] text-[#8C6239]">{L('हस्त / चित्रा नक्षत्र', 'Hasta / Chitra Nakshatra', 'હસ્ત / ચિત્રા નક્ષત્ર')}</div>
              </div>
              <div className="p-2 rounded-xl bg-white border border-amber-200">
                <div className="font-bold text-[#462B17]">{L('शुक्ल पक्ष एकादशी', 'Shukla Paksha Ekadashi', 'શુક્લ પક્ષ અગિયારસ')}</div>
                <div className="text-[10px] text-[#8C6239]">{L('अनुराधा / रेवती नक्षत्र', 'Anuradha / Revati Nakshatra', 'અનુરાધા / રેવતી નક્ષત્ર')}</div>
              </div>
            </div>
          </div>
          <div className="text-[10px] text-center text-[#8C6239]">
            {L(
              "विस्तृत कुण्डली मिलान व लग्न शुद्धि हेतु 'उमा परामर्श' लें।",
              "Take 'Uma Consultation' for detailed Kundali Matching and Lagna Shuddhi.",
              "વિગતવાર કુંડળી મિલાન અને લગ્ન શુદ્ધિ માટે 'ઉમા પરામર્શ' લો."
            )}
          </div>
        </div>
      ),
    },

    // Slide 3: Activity Specific Guidance
    {
      id: 'activity',
      title: L('कार्य अनुसार मुहूर्त परामर्श', 'Activity-Specific Muhurat Guidance', 'કાર્ય મુજબ મુહૂર્ત પરામર્શ'),
      subtitle: trVedic(selectedActivity, cLang),
      badge: guidance.grade === 'excellent' || guidance.grade === 'good'
        ? L('शुभ समय', 'Favorable', 'શુભ સમય')
        : L('सावधानी', 'Caution', 'સાવચેતી'),
      icon: '🎯',
      voiceText: L(
        `${selectedActivity} के लिए मुहूर्त परामर्श।`,
        `Muhurat guidance for ${trVedic(selectedActivity, 'en')}.`,
        `${trVedic(selectedActivity, 'gu')} માટે મુહૂર્ત પરામર્શ.`
      ),
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
                {trVedic(act, cLang)}
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
            {L(
              'शुभ होरा व शुभ चौघड़िया में कार्य प्रारम्भ करना लाभप्रद रहता है।',
              'Starting work during auspicious Hora and Choghadiya is beneficial.',
              'શુભ હોરા અને શુભ ચોઘડિયામાં કાર્ય શરૂ કરવું લાભદાયી રહે છે.'
            )}
          </div>
        </div>
      ),
    },

    // Slide 4: Vedic Muhurat Principles
    {
      id: 'rules',
      title: L('वैदिक मुहूर्त शास्त्र नियम', 'Vedic Muhurat Shastra Rules', 'વૈદિક મુહૂર્ત શાસ્ત્ર નિયમો'),
      subtitle: L('शास्त्र सम्मत शुद्धि', 'Scriptural Purity', 'શાસ્ત્રોક્ત શુદ્ધિ'),
      badge: L('सिद्धांत', 'Principles', 'સિદ્ધાંત'),
      icon: '📜',
      voiceText: L(
        'वैदिक मुहूर्त शास्त्र के नियम।',
        'Principles of Vedic Muhurat Shastra.',
        'વૈદિક મુહૂર્ત શાસ્ત્રના નિયમો.'
      ),
      content: (
        <div className="h-full flex flex-col justify-between py-1 space-y-2">
          <div className="p-3 rounded-2xl bg-white/90 border border-[#E8DCCB] space-y-2 my-auto text-xs">
            <div className="flex items-start gap-2">
              <span className="text-[#B56A00] font-black">{L('१.', '1.', '૧.')}</span>
              <span><strong>{L('तिथि शुद्धि:', 'Tithi Shuddhi:', 'તિથિ શુદ્ધિ:')}</strong> {L('रिक्ता तिथियां (४, ९, १४) शुभ कार्यों में त्याज्य हैं।', 'Rikta Tithis (4, 9, 14) are avoided for auspicious undertakings.', 'રિક્તા તિથિઓ (૪, ૯, ૧૪) શુભ કાર્યોમાં ત્યાજ્ય છે.')}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[#B56A00] font-black">{L('२.', '2.', '૨.')}</span>
              <span><strong>{L('वार शुद्धि:', 'Vara Shuddhi:', 'વાર શુદ્ધિ:')}</strong> {L('गुरुवार व शुक्रवार सर्वकार्य सिद्धिकारक माने गए हैं।', 'Thursday and Friday are considered favorable for all works.', 'ગુરુવાર અને શુક્રવાર સર્વકાર્ય સિદ્ધિકારક મનાય છે.')}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[#B56A00] font-black">{L('३.', '3.', '૩.')}</span>
              <span><strong>{L('नक्षत्र शुद्धि:', 'Nakshatra Shuddhi:', 'નક્ષત્ર શુદ્ધિ:')}</strong> {L('स्थिर नक्षत्र (रोहिणी, उत्तरा) निर्माण व गृहप्रवेश हेतु उत्तम हैं।', 'Fixed Nakshatras (Rohini, Uttara) are best for construction & Griha Pravesh.', 'સ્થિર નક્ષત્ર (રોહિણી, ઉત્તરા) નિર્માણ અને ગૃહપ્રવેશ માટે ઉત્તમ છે.')}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[#B56A00] font-black">{L('४.', '4.', '૪.')}</span>
              <span><strong>{L('राहुकाल व भद्रा:', 'Rahu Kaal & Bhadra:', 'રાહુકાળ અને ભદ્રા:')}</strong> {L('इस काल में कोई भी शुभ शुभारम्भ न करें।', 'Do not begin any auspicious work during these periods.', 'આ સમયમાં કોઈ પણ શુભ કાર્યનો પ્રારંભ ન કરવો.')}</span>
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
      headerTitle={t('nav.muhurat', L('शुभ मुहूर्त', 'Auspicious Muhurat', 'શુભ મુહૂર્ત'))}
      headerIcon="✨"
      chapterNumber={3}
      currentDate={panchang.date}
      onOpenUma={onOpenUmaModal ? () => onOpenUmaModal(L('शुभ मुहूर्त परामर्श', 'Auspicious Muhurat Consultation', 'શુભ મુહૂર્ત પરામર્શ')) : undefined}
      onPrevChapter={onPrevChapter}
      onNextChapter={onNextChapter}
      prevChapterLabel={t('nav.choghadiya', L('चौघड़िया', 'Choghadiya', 'ચોઘડિયા'))}
      nextChapterLabel={t('nav.yatra', L('यात्रा दिशाशूल', 'Yatra Dishashool', 'યાત્રા દિશાશૂળ'))}
    />
  );
};
export default MuhuratView;
