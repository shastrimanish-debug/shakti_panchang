import React, { useState } from 'react';
import {
  NAVARATNA_DATA,
  GemstoneData,
} from '../services/spiritualModules';
import { useTranslation, useLanguage } from '../i18n';
import { Sparkles, ShieldCheck } from 'lucide-react';
import { UniversalStoryDeck, StorySlideItem } from './UniversalStoryDeck';

interface GemologyViewProps {
  onOpenUmaWithQuery?: (query: string) => void;
  onPrevChapter?: () => void;
  onNextChapter?: () => void;
}

export const GemologyView: React.FC<GemologyViewProps> = ({
  onOpenUmaWithQuery,
  onPrevChapter,
  onNextChapter,
}) => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const cLang = (language || 'hi').slice(0, 2).toLowerCase();
  const L = <T,>(hi: T, en: T, gu: T): T => (cLang === 'en' ? en : cLang === 'gu' ? gu : hi);

  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);

  const slides: StorySlideItem[] = [
    // Slide 1: Navaratna Overview
    {
      id: 'navaratna-overview',
      title: L('वैदिक नवरत्न विज्ञान', 'Vedic Navaratna Gemology', 'વૈદિક નવરત્ન વિજ્ઞાન'),
      subtitle: L('९ ग्रहों के दिव्य ऊर्जावान रत्न', 'Energizing Gemstones of 9 Planets', '૯ ગ્રહોના દિવ્ય ઊર્જાવાન રત્નો'),
      badge: L('नवरत्न चक्र', 'Navaratna Cycle', 'નવરત્ન ચક્ર'),
      icon: '💎',
      voiceText: L(
        'वैदिक नवरत्न विज्ञान। नौ ग्रहों के शुभ रत्न और उनके फल।',
        'Vedic Navaratna Gemology. Auspicious gemstones for the nine planets and their benefits.',
        'વૈદિક નવરત્ન વિજ્ઞાન. નવ ગ્રહોના શુભ રત્નો અને તેમના ફળ.'
      ),
      content: (
        <div className="h-full flex flex-col justify-between py-1 space-y-2">
          <div className="p-3.5 rounded-2xl bg-amber-50/90 border-2 border-amber-300 shadow-sm my-auto space-y-2">
            <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
              <div className="p-2 rounded-xl bg-white border border-amber-200">
                <span className="text-base">🔴</span>
                <div className="font-bold text-[#462B17]">{L('माणिक्य (Ruby)', 'Ruby (Manikya)', 'માણેક (Ruby)')}</div>
                <div className="text-[9px] text-[#8C6239]">{L('सूर्य देव', 'Sun (Surya)', 'સૂર્ય દેવ')}</div>
              </div>
              <div className="p-2 rounded-xl bg-white border border-amber-200">
                <span className="text-base">⚪</span>
                <div className="font-bold text-[#462B17]">{L('मोती (Pearl)', 'Pearl (Moti)', 'મોતી (Pearl)')}</div>
                <div className="text-[9px] text-[#8C6239]">{L('चन्द्र देव', 'Moon (Chandra)', 'ચંદ્ર દેવ')}</div>
              </div>
              <div className="p-2 rounded-xl bg-white border border-amber-200">
                <span className="text-base">🔺</span>
                <div className="font-bold text-[#462B17]">{L('मूंगा (Coral)', 'Red Coral (Moonga)', 'મૂંગા (Coral)')}</div>
                <div className="text-[9px] text-[#8C6239]">{L('मंगल देव', 'Mars (Mangal)', 'મંગળ દેવ')}</div>
              </div>
              <div className="p-2 rounded-xl bg-white border border-amber-200">
                <span className="text-base">🟢</span>
                <div className="font-bold text-[#462B17]">{L('पन्ना (Emerald)', 'Emerald (Panna)', 'પન્ના (Emerald)')}</div>
                <div className="text-[9px] text-[#8C6239]">{L('बुध देव', 'Mercury (Budha)', 'બુધ દેવ')}</div>
              </div>
              <div className="p-2 rounded-xl bg-white border border-amber-200">
                <span className="text-base">💛</span>
                <div className="font-bold text-[#462B17]">{L('पुखराज (Sapphire)', 'Yellow Sapphire', 'પોખરાજ (Sapphire)')}</div>
                <div className="text-[9px] text-[#8C6239]">{L('गुरु देव', 'Jupiter (Guru)', 'ગુરુ દેવ')}</div>
              </div>
              <div className="p-2 rounded-xl bg-white border border-amber-200">
                <span className="text-base">💎</span>
                <div className="font-bold text-[#462B17]">{L('हीरा (Diamond)', 'Diamond (Heera)', 'હીરો (Diamond)')}</div>
                <div className="text-[9px] text-[#8C6239]">{L('शुक्र देव', 'Venus (Shukra)', 'શુક્ર દેવ')}</div>
              </div>
            </div>
          </div>
          <div className="text-[10px] text-center text-[#8C6239]">
            {L(
              'रत्न जातक के आभामंडल (Aura) को ऊर्जावान बनाकर ग्रहों के शुभ प्रभाव बढ़ाते हैं।',
              'Gemstones energize the native’s aura and amplify benefic planetary vibrations.',
              'રત્નો જાતકના આભામંડળને ઊર્જાવાન બનાવી ગ્રહોના શુભ પ્રભાવ વધારે છે.'
            )}
          </div>
        </div>
      ),
    },

    // Slide 2: Pukhraj, Manikya & Moti
    {
      id: 'gems-group-1',
      title: L('पुखराज, माणिक्य एवं मोती', 'Yellow Sapphire, Ruby & Pearl', 'પોખરાજ, માણેક અને મોતી'),
      subtitle: L('ज्ञान, तेज व मानसिक शांति', 'Wisdom, Vitality & Peace of Mind', 'જ્ઞાન, તેજ અને માનસિક શાંતિ'),
      badge: L('देव गुरु व सूर्य', 'Jupiter & Sun', 'દેવ ગુરુ અને સૂર્ય'),
      icon: '✨',
      voiceText: L(
        'पुखराज, माणिक्य और मोती रत्न का फलित और धारण विधि।',
        'Benefits and wearing rituals for Yellow Sapphire, Ruby, and Pearl.',
        'પોખરાજ, માણેક અને મોતી રત્નનું ફળ અને ધારણ વિધિ.'
      ),
      content: (
        <div className="h-full flex flex-col justify-between py-1 space-y-1.5">
          <div className="space-y-1.5 my-auto text-xs">
            <div className="p-2 rounded-xl bg-amber-100/70 border border-amber-300">
              <div className="font-bold text-amber-950">
                {L('💛 पीला पुखराज (गुरु): सुख, समृद्धि व विद्या', '💛 Yellow Sapphire (Jupiter): Prosperity, Wisdom & Grace', '💛 પીળો પોખરાજ (ગુરુ): સુખ, સમૃદ્ધિ અને વિદ્યા')}
              </div>
              <p className="text-[10px] text-amber-900 mt-0.5">
                {L('तर्जनी उंगली • स्वर्ण धातु • गुरुवार प्रातःकाल', 'Index Finger • Gold • Thursday Morning', 'તર્જની આંગળી • સુવર્ણ ધાતુ • ગુરુવાર સવારે')}
              </p>
            </div>
            <div className="p-2 rounded-xl bg-rose-50 border border-rose-200">
              <div className="font-bold text-rose-950">
                {L('🔴 माणिक्य (सूर्य): नेतृत्व, आत्मविश्वास व आरोग्य', '🔴 Ruby (Sun): Leadership, Confidence & Health', '🔴 માણેક (સૂર્ય): નેતૃત્વ, આત્મવિશ્વાસ અને આરોગ્ય')}
              </div>
              <p className="text-[10px] text-rose-900 mt-0.5">
                {L('अनामिका उंगली • तांबा/स्वर्ण • रविवार प्रातःकाल', 'Ring Finger • Copper/Gold • Sunday Morning', 'અનામિકા આંગળી • તાંબુ/સુવર્ણ • રવિવાર સવારે')}
              </p>
            </div>
            <div className="p-2 rounded-xl bg-sky-50 border border-sky-200">
              <div className="font-bold text-sky-950">
                {L('⚪ सच्चा मोती (चन्द्र): मानसिक शांति व सौम्यता', '⚪ Natural Pearl (Moon): Mental Calm & Serenity', '⚪ સાચું મોતી (ચંદ્ર): માનસિક શાંતિ અને સૌમ્યતા')}
              </div>
              <p className="text-[10px] text-sky-900 mt-0.5">
                {L('कनिष्ठिका उंगली • चांदी धातु • सोमवार सायं', 'Little Finger • Silver • Monday Evening', 'કનિષ્ઠિકા આંગળી • ચાંદી ધાતુ • સોમવાર સાંજે')}
              </p>
            </div>
          </div>
          <div className="text-[10px] text-center text-[#8C6239]">
            {L(
              'रत्न सदैव प्राण प्रतिष्ठित व शुद्ध करवाकर ही धारण करें।',
              'Always purify and energize gemstones with Prana Pratishtha before wearing.',
              'રત્ન હંમેશા પ્રાણ-પ્રતિષ્ઠિત અને શુદ્ધ કરાવીને જ ધારણ કરો.'
            )}
          </div>
        </div>
      ),
    },

    // Slide 3: Neelam, Panna, Moonga
    {
      id: 'gems-group-2',
      title: L('नीलम, पन्ना, मूंगा व हीरा', 'Blue Sapphire, Emerald, Coral & Diamond', 'નીલમ, પન્ના, મૂંગા અને હીરો'),
      subtitle: L('शनि, बुध, मंगल व शुक्र के दिव्य रत्न', 'Divine Gemstones of Saturn, Mercury, Mars & Venus', 'શનિ, બુધ, મંગળ અને શુક્રના દિવ્ય રત્નો'),
      badge: L('कर्म व शक्ति', 'Karma & Power', 'કર્મ અને શક્તિ'),
      icon: '👑',
      voiceText: L(
        'नीलम, पन्ना, मूंगा और हीरा रत्न का फलित।',
        'Effects of Blue Sapphire, Emerald, Red Coral, and Diamond.',
        'નીલમ, પન્ના, મૂંગા અને હીરા રત્નનું ફળ.'
      ),
      content: (
        <div className="h-full flex flex-col justify-between py-1 space-y-1.5">
          <div className="space-y-1.5 my-auto text-xs">
            <div className="p-2 rounded-xl bg-indigo-50 border border-indigo-200">
              <div className="font-bold text-indigo-950">
                {L('💙 नीलम (शनि): न्याय, अनुशासन व त्वरित फल', '💙 Blue Sapphire (Saturn): Justice, Discipline & Swift Results', '💙 નીલમ (શનિ): ન્યાય, શિસ્ત અને ઝડપી ફળ')}
              </div>
              <p className="text-[10px] text-indigo-900 mt-0.5">
                {L('मध्यमा उंगली • पंचधातु/चांदी • शनिवार सायं', 'Middle Finger • Panchdhatu/Silver • Saturday Evening', 'મધ્યમા આંગળી • પંચધાતુ/ચાંદી • શનિવાર સાંજે')}
              </p>
            </div>
            <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200">
              <div className="font-bold text-emerald-950">
                {L('💚 पन्ना (बुध): व्यापार, वाणी व बुद्धि प्रखरता', '💚 Emerald (Mercury): Business, Speech & Intellect', '💚 પન્ના (બુધ): વેપાર, વાણી અને બુદ્ધિ પ્રખરતા')}
              </div>
              <p className="text-[10px] text-emerald-900 mt-0.5">
                {L('कनिष्ठिका उंगली • कांस्य/स्वर्ण • बुधवार प्रातः', 'Little Finger • Gold/Bronze • Wednesday Morning', 'કનિષ્ઠિકા આંગળી • સુવર્ણ/કાંસુ • બુધવાર સવારે')}
              </p>
            </div>
            <div className="p-2 rounded-xl bg-red-50 border border-red-200">
              <div className="font-bold text-red-950">
                {L('🔺 लाल मूंगा (मंगल): पराक्रम व भूमि-भवन लाभ', '🔺 Red Coral (Mars): Valor, Property & Energy', '🔺 લાલ મૂંગા (મંગળ): પરાક્રમ અને ભૂમિ-ભવન લાભ')}
              </div>
              <p className="text-[10px] text-red-900 mt-0.5">
                {L('अनामिका उंगली • तांबा/स्वर्ण • मंगलवार प्रातः', 'Ring Finger • Copper/Gold • Tuesday Morning', 'અનામિકા આંગળી • તાંબુ/સુવર્ણ • મંગળવાર સવારે')}
              </p>
            </div>
          </div>
          <div className="text-[10px] text-center text-[#8C6239]">
            {L(
              "अपनी कुण्डली के अनुसार अनुकूल रत्न जानने हेतु 'उमा परामर्श' लें।",
              "Take 'Uma Consultation' to find the most suitable gemstone for your Kundali.",
              "તમારી કુંડળી મુજબ અનુકૂળ રત્ન જાણવા માટે 'ઉમા પરામર્શ' લો."
            )}
          </div>
        </div>
      ),
    },
  ];

  return (
    <UniversalStoryDeck
      slides={slides}
      currentSlideIndex={activeSlideIndex}
      onSlideIndexChange={setActiveSlideIndex}
      headerTitle={t('nav.gemology', L('रत्न विज्ञान (Gemology)', 'Vedic Gemology', 'રત્ન વિજ્ઞાન (Gemology)'))}
      headerIcon="💎"
      chapterNumber={17}
      onOpenUma={onOpenUmaWithQuery ? () => onOpenUmaWithQuery(L('मेरी कुण्डली के लिए सर्वश्रेष्ठ रत्न कौन सा है', 'Which gemstone is best suited for my Kundali?', 'મારી કુંડળી માટે કયું રત્ન શ્રેષ્ઠ છે?')) : undefined}
      onPrevChapter={onPrevChapter}
      onNextChapter={onNextChapter}
      prevChapterLabel={t('nav.tarot', L('टैरो कार्ड', 'Tarot Cards', 'ટેરો કાર્ડ'))}
      nextChapterLabel={t('nav.faceReading', L('सामुद्रिक मुखाकृति', 'Face Reading', 'સામુદ્રિક મુખાકૃતિ'))}
    />
  );
};
export default GemologyView;
