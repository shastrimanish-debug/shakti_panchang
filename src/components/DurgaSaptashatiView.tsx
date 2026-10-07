import React, { useState } from 'react';
import { DURGA_CHAPTERS, DURGA_ANGAS } from '../data/durgaSaptashatiData';
import { localizeAnga, localizeChapter, saptUi } from '../data/saptashatiLocale';
import { Sparkles, Share2 } from 'lucide-react';
import { openWhatsAppShare } from '../services/umaConsultationPdf';
import { useLanguage } from '../i18n';
import { UniversalStoryDeck, StorySlideItem } from './UniversalStoryDeck';

export const DurgaSaptashatiView: React.FC<{
  onOpenUmaModal?: (query?: string) => void;
  onPrevChapter?: () => void;
  onNextChapter?: () => void;
}> = ({ onOpenUmaModal, onPrevChapter, onNextChapter }) => {
  const { language, t } = useLanguage();
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);

  const slides: StorySlideItem[] = [
    // Slide 1: Durga Kavach
    {
      id: 'kavach',
      title: 'श्री चण्डी / दुर्गा कवचम्',
      subtitle: 'ब्रह्माजी कृत दिव्य रक्षा कवच',
      badge: 'सर्व रक्षा',
      icon: '🛡️',
      voiceText: 'ॐ चण्डिका देव्यै नमः। मार्कण्डेय उवाच। यद्गुह्यं परमं लोके सर्वरक्षाकरं नृणाम्।',
      content: (
        <div className="h-full flex flex-col justify-between py-1 space-y-2">
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#FFF8EE] to-[#FFEEC9] border-2 border-amber-400 text-center shadow-sm my-auto space-y-2">
            <div className="text-xs font-black text-[#B56A00] tracking-widest uppercase">
              ॥ श्री देवी कवचम् ॥
            </div>
            <p className="font-granth text-xs sm:text-sm font-black text-[#462B17] leading-relaxed whitespace-pre-line py-1">
              यद्गुह्यं परमं लोके सर्वरक्षाकरं नृणाम्।<br />
              यन्न कस्यचिदाख्यातं तन्मे ब्रूहि पितामह॥
            </p>
            <div className="p-2 rounded-xl bg-white/90 border border-amber-200 text-left text-xs">
              <div className="text-[10px] font-bold text-[#8C6239] uppercase">कवच माहात्म्य</div>
              <p className="text-[#3E2714] text-[11px] mt-0.5 leading-relaxed">
                यह कवच समस्त भय, रोग, शत्रु बाधा व संकटों से साधक की रक्षा करता है।
              </p>
            </div>
          </div>
          <div className="text-[10px] text-center text-[#8C6239]">
            प्रतिदिन प्रातः अथवा सायं कवच का पाठ करने से अभय की प्राप्ति होती है।
          </div>
        </div>
      ),
    },

    // Slide 2: Siddha Kunjika
    {
      id: 'kunjika',
      title: 'सिद्ध कुञ्जिका स्तोत्रम्',
      subtitle: 'भगवान शिव कृत मूल महामन्त्र',
      badge: 'महास्तोत्र',
      icon: '🔱',
      voiceText: 'ॐ ऐं ह्रीं क्लीं चामुण्डायै विच्चे। ॐ ग्लौं हुं क्लीं जूं सः ज्वालय ज्वालय ज्वल ज्वल प्रज्वल प्रज्वल ऐं ह्रीं क्लीं चामुण्डायै विच्चे ज्वल हं सं लं क्षं फट् स्वाहा।',
      content: (
        <div className="h-full flex flex-col justify-between py-1 space-y-2">
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#FFF8EE] to-[#FFEEC9] border-2 border-amber-400 text-center shadow-sm my-auto space-y-2">
            <div className="text-xs font-black text-[#B56A00] tracking-widest uppercase">
              ॥ नवार्ण महामन्त्र व कुञ्जिका ॥
            </div>
            <p className="font-granth text-xs sm:text-sm font-black text-[#8B1E1E] leading-relaxed whitespace-pre-line py-1">
              ॥ ॐ ऐं ह्रीं क्लीं चामुण्डायै विच्चे ॥
            </p>
            <div className="p-2 rounded-xl bg-white/90 border border-amber-200 text-left text-xs">
              <div className="text-[10px] font-bold text-[#8C6239] uppercase">शिव उवाच</div>
              <p className="text-[#3E2714] text-[11px] mt-0.5 leading-relaxed">
                कुञ्जिका पाठ मात्रेण दुर्गापाठफलं लभेत्। केवल इस स्तोत्र के पाठ से सम्पूर्ण सप्तशती का फल प्राप्त होता है।
              </p>
            </div>
          </div>
          <div className="text-[10px] text-center text-[#8C6239]">
            माँ भगवती चामुण्डा समस्त मनोकामनाएं पूर्ण करती हैं।
          </div>
        </div>
      ),
    },

    // Slide 3: 13 Chapters Essence
    {
      id: 'chapters-summary',
      title: 'सप्तशती के १३ अध्यायों का सार',
      subtitle: 'प्रथम, मध्यम व उत्तर चरित्र',
      badge: 'त्रिशक्ति',
      icon: '✨',
      voiceText: 'श्री दुर्गा सप्तशती के तेरह अध्याय महाकाली, महालक्ष्मी और महासरस्वती के प्राकट्य का वर्णन करते हैं।',
      content: (
        <div className="h-full flex flex-col justify-between py-1 space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 my-auto text-xs">
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200">
              <div className="font-bold text-rose-950">🌺 प्रथम चरित्र (अध्याय १)</div>
              <p className="text-[10px] text-rose-900 mt-0.5">
                महाकाली स्वरूप • मधु-कैटभ वध • योगनिद्रा स्तुति
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200">
              <div className="font-bold text-amber-950">🪔 मध्यम चरित्र (अध्याय २-४)</div>
              <p className="text-[10px] text-amber-900 mt-0.5">
                महालक्ष्मी स्वरूप • महिषासुर संहार • शक्रादि स्तुति
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-200">
              <div className="font-bold text-indigo-950">🕊️ उत्तर चरित्र (अध्याय ५-१३)</div>
              <p className="text-[10px] text-indigo-900 mt-0.5">
                महासरस्वती स्वरूप • शुम्भ-निशुम्भ वध • देवी वरदान
              </p>
            </div>
          </div>
          <div className="text-[10px] text-center text-[#8C6239]">
            सप्तशती पाठ से धर्म, अर्थ, काम और मोक्ष चारों पुरुषार्थों की सिद्धि होती है।
          </div>
        </div>
      ),
    },

    // Slide 4: Durga Aarti
    {
      id: 'aarti',
      title: 'श्री अम्बे जी की मंगल आरती',
      subtitle: 'जय अम्बे गौरी, मैया जय श्यामा गौरी',
      badge: 'महाआरती',
      icon: '🪔',
      voiceText: 'जय अम्बे गौरी, मैया जय श्यामा गौरी। तुमको निशदिन ध्यावत, हरि ब्रह्मा शिवरी।',
      content: (
        <div className="h-full flex flex-col justify-between py-1 space-y-2">
          <div className="p-3.5 rounded-2xl bg-white/95 border border-amber-300 shadow-sm my-auto text-center space-y-1.5">
            <div className="text-xs font-black text-[#B56A00] tracking-wider uppercase">
              ॥ श्री अम्बे जी की आरती ॥
            </div>
            <p className="font-granth text-xs sm:text-sm font-bold text-[#5C3A21] leading-relaxed whitespace-pre-line py-1">
              जय अम्बे गौरी, मैया जय श्यामा गौरी।<br />
              तुमको निशदिन ध्यावत, हरि ब्रह्मा शिवरी॥<br />
              मांग सिन्दूर विराजत, टीको मृगमद को।<br />
              उज्ज्वल से दोउ नैना, चन्द्रवदन नीको॥
            </p>
          </div>
          <div className="text-[10px] text-center text-[#8C6239]">
            ॥ ॐ श्री दुर्गार्पणमस्तु ॥
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
      headerTitle="श्री दुर्गा सप्तशती"
      headerIcon="🔱"
      chapterNumber={12}
      onOpenUma={onOpenUmaModal ? () => onOpenUmaModal('दुर्गा सप्तशती पाठ विधि एवं कवच मंत्र') : undefined}
      onPrevChapter={onPrevChapter}
      onNextChapter={onNextChapter}
      prevChapterLabel="वास्तु शास्त्र"
      nextChapterLabel="ग्रह उपाय"
    />
  );
};
export default DurgaSaptashatiView;
