import React, { useState, useMemo } from 'react';
import { 
  Sparkles, Share2, Scroll 
} from 'lucide-react';
import { 
  VRAT_KATHA_DATA, 
  VratKathaItem 
} from '../data/vratKathaData';
import { 
  getLocalizedVratKathaItem 
} from '../services/vratKathaMultilingual';
import { useLanguage } from '../i18n';
import { UniversalStoryDeck, StorySlideItem } from './UniversalStoryDeck';

interface VratKathaViewProps {
  onBackToPanchang?: () => void;
  onOpenUmaModal?: (query?: string) => void;
  onPrevChapter?: () => void;
  onNextChapter?: () => void;
}

export const VratKathaView: React.FC<VratKathaViewProps> = ({
  onBackToPanchang,
  onOpenUmaModal,
  onPrevChapter,
  onNextChapter,
}) => {
  const { t, language } = useLanguage();
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);

  const localizedKathas = useMemo(() => {
    return VRAT_KATHA_DATA.map((item) => getLocalizedVratKathaItem(item, language));
  }, [language]);

  const slides: StorySlideItem[] = localizedKathas.slice(0, 8).map((katha, idx) => {
    const handleShare = () => {
      const text = `॥ ${katha.title} ॥\n\n${katha.subtitle}\n\nश्लोक:\n${katha.shlok}\n\nअर्थ: ${katha.shlokMeaning}\n\n(शक्ति पंचांग)`;
      if (navigator.share) {
        navigator.share({ title: katha.title, text }).catch(() => {});
      }
    };

    return {
      id: katha.id || idx,
      title: katha.title,
      subtitle: katha.subtitle,
      badge: `कथा ${idx + 1}`,
      icon: '📜',
      voiceText: `${katha.title}। ${katha.subtitle}। श्लोक: ${katha.shlok}। भावार्थ: ${katha.shlokMeaning}।`,
      content: (
        <div className="h-full flex flex-col justify-between py-1 space-y-2">
          {/* Main Katha Card */}
          <div className="p-3.5 rounded-2xl bg-white/95 border border-amber-300 shadow-sm space-y-2 my-auto">
            {/* Shloka Box */}
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#FFF9EE] to-[#FFEEC9] border border-amber-300 text-center">
              <div className="text-[10px] font-black text-[#B56A00] uppercase tracking-wider">
                ॥ पावन मन्त्र व स्तुति ॥
              </div>
              <p className="font-granth text-xs sm:text-sm font-black text-[#462B17] mt-0.5 whitespace-pre-line">
                {katha.shlok}
              </p>
              <p className="text-[11px] text-[#735133] mt-1 font-medium italic">
                {katha.shlokMeaning}
              </p>
            </div>

            {/* Katha Highlights */}
            <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200 text-xs">
              <div className="text-[10px] font-bold text-[#8C6239] uppercase">व्रत माहात्म्य व फल</div>
              <p className="text-[#3E2714] text-[11px] mt-0.5 leading-relaxed">
                {katha.story ? (katha.story.length > 220 ? `${katha.story.slice(0, 220)}...` : katha.story) : katha.subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] text-[#8C6239]">
            <span>स्कन्द व पद्म पुराण प्रमाणिक कथा</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleShare();
              }}
              className="px-2.5 py-1 rounded-lg bg-emerald-700 text-white font-bold flex items-center gap-1 cursor-pointer"
            >
              <Share2 className="w-2.5 h-2.5" />
              <span>साझा करें</span>
            </button>
          </div>
        </div>
      ),
    };
  });

  return (
    <UniversalStoryDeck
      slides={slides}
      currentSlideIndex={activeSlideIndex}
      onSlideIndexChange={setActiveSlideIndex}
      headerTitle="व्रत कथा व आरती"
      headerIcon="📜"
      chapterNumber={8}
      onOpenUma={onOpenUmaModal ? () => onOpenUmaModal('व्रत कथा एवं पूजा विधि') : undefined}
      onPrevChapter={onPrevChapter}
      onNextChapter={onNextChapter}
      prevChapterLabel="स्मृति व संकल्प"
      nextChapterLabel="दैनिक राशिफल"
    />
  );
};
export default VratKathaView;
