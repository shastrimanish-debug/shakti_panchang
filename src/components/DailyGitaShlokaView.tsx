import React, { useState } from 'react';
import { GITA_SHLOKAS, getLocalizedGitaShloka } from '../data/gitaShlokas';
import { shlokaChrome } from '../constants/shlokas';
import { Sparkles, Share2 } from 'lucide-react';
import { openWhatsAppShare } from '../services/umaConsultationPdf';
import { useLanguage } from '../i18n';
import { UniversalStoryDeck, StorySlideItem } from './UniversalStoryDeck';

export const DailyGitaShlokaView: React.FC<{
  onOpenUmaModal?: (query?: string) => void;
  onPrevChapter?: () => void;
  onNextChapter?: () => void;
}> = ({ onOpenUmaModal, onPrevChapter, onNextChapter }) => {
  const { language, t } = useLanguage();
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);
  const chrome = shlokaChrome(language);

  const slides: StorySlideItem[] = GITA_SHLOKAS.slice(0, 10).map((shloka, idx) => {
    const localized = getLocalizedGitaShloka(shloka, language);

    const handleShare = () => {
      const text = `*${chrome.gitaTitle} (${chrome.chapter} ${shloka.chapter}, ${chrome.verse} ${shloka.verse})*\n\n${shloka.sanskrit}\n\n*${chrome.meaningWord}:* ${localized.meaning}\n\n(${t('common.appName', 'शक्ति पंचांग')})`;
      openWhatsAppShare(text);
    };

    return {
      id: idx,
      title: `${chrome.chapter} ${shloka.chapter} • ${chrome.verse} ${shloka.verse}`,
      subtitle: chrome.gitaTitle,
      badge: `श्लोक ${idx + 1}`,
      icon: '📖',
      voiceText: `${shloka.sanskrit}। भावार्थ: ${localized.meaning}।`,
      content: (
        <div className="h-full flex flex-col justify-between py-1 space-y-2">
          {/* Sanskrit Card */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#FFF8EE] to-[#FBE8C8] border-2 border-amber-400 text-center shadow-sm my-auto space-y-2">
            <div className="text-xs font-black text-[#B56A00] tracking-wider uppercase">
              ॥ श्रीमद्भगवद्गीता ॥
            </div>
            <p className="font-granth text-sm sm:text-base font-black text-[#462B17] leading-relaxed whitespace-pre-line py-1">
              {shloka.sanskrit}
            </p>
            <div className="p-2.5 rounded-xl bg-white/90 border border-amber-200 text-left">
              <div className="text-[10px] font-bold text-[#8C6239] uppercase">{chrome.meaningHead}</div>
              <p className="text-xs text-[#3E2714] font-medium mt-0.5 leading-relaxed">
                {localized.meaning}
              </p>
            </div>
            <div className="p-2 rounded-xl bg-amber-100/70 border border-amber-300 text-left text-xs">
              <div className="font-bold text-[#5C3A21] flex items-center gap-1 text-[11px]">
                <Sparkles className="w-3 h-3 text-[#B56A00]" />
                <span>{chrome.reflectHead}</span>
              </div>
              <p className="text-[#6E472A] text-[11px] mt-0.5 font-medium leading-tight">
                {localized.reflection}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] text-[#8C6239]">
            <span>यदा यदा हि धर्मस्य ग्लानिर्भवति भारत</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleShare();
              }}
              className="px-2.5 py-1 rounded-lg bg-emerald-700 text-white font-bold flex items-center gap-1 cursor-pointer"
            >
              <Share2 className="w-2.5 h-2.5" />
              <span>शेयर</span>
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
      headerTitle={chrome.gitaTitle}
      headerIcon="📖"
      chapterNumber={10}
      onOpenUma={onOpenUmaModal ? () => onOpenUmaModal('गीता श्लोक का अर्थ एवं मार्गदर्शन') : undefined}
      onPrevChapter={onPrevChapter}
      onNextChapter={onNextChapter}
      prevChapterLabel="दैनिक राशिफल"
      nextChapterLabel="वास्तु शास्त्र"
    />
  );
};
export default DailyGitaShlokaView;
