import React, { useState } from 'react';
import { BOOK_PAGES, getLocalizedBookPages } from '../constants/bookPages';
import { BookOpen, ChevronRight, Sparkles } from 'lucide-react';
import { useTranslation } from '../i18n';
import { UniversalStoryDeck, StorySlideItem } from './UniversalStoryDeck';

interface GranthIndexViewProps {
  onSelectTab: (tabId: string) => void;
  onReturnToCover?: () => void;
}

export const GranthIndexView: React.FC<GranthIndexViewProps> = ({
  onSelectTab,
}) => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || 'hi';
  const localizedPages = getLocalizedBookPages(BOOK_PAGES, currentLang);
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);

  // Group pages into chunks of 6 per slide
  const CHUNK_SIZE = 6;
  const chunkCount = Math.ceil(localizedPages.length / CHUNK_SIZE);
  const slides: StorySlideItem[] = [];

  for (let i = 0; i < chunkCount; i++) {
    const chunk = localizedPages.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
    slides.push({
      id: `index-chunk-${i}`,
      title: `सनातन शक्ति पंचांग अनुक्रमणिका (${i + 1}/${chunkCount})`,
      subtitle: `अध्याय ${i * CHUNK_SIZE + 1} से ${Math.min((i + 1) * CHUNK_SIZE, localizedPages.length)}`,
      badge: 'ग्रन्थ सूची',
      icon: '📖',
      voiceText: `ग्रन्थ अनुक्रमणिका भाग ${i + 1}। अपने इच्छित अध्याय पर टैप करें।`,
      content: (
        <div className="h-full flex flex-col justify-between py-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 my-auto">
            {chunk.map((page) => {
              const Icon = page.icon || BookOpen;
              return (
                <button
                  key={page.id}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectTab(page.id);
                  }}
                  className="p-2 rounded-xl bg-white/95 border border-amber-300 hover:border-amber-500 shadow-xs flex items-center justify-between group cursor-pointer transition text-left active:scale-95"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-900 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-[#8C4A00]" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[9px] font-bold text-[#B56A00] uppercase">
                        {page.chapter}
                      </div>
                      <div className="font-black font-granth text-xs text-[#462B17] truncate">
                        {page.title}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-[#8C6239] group-hover:translate-x-0.5 transition-transform shrink-0" />
                </button>
              );
            })}
          </div>
          <div className="text-[10px] text-center text-[#8C6239]">
            किसी भी अध्याय पर टैप करके सीधे उस पृष्ठ पर जाएं।
          </div>
        </div>
      ),
    });
  }

  return (
    <UniversalStoryDeck
      slides={slides}
      currentSlideIndex={activeSlideIndex}
      onSlideIndexChange={setActiveSlideIndex}
      headerTitle="ग्रन्थ अनुक्रमणिका"
      headerIcon="📖"
      chapterNumber="विषय-सूची"
    />
  );
};
export default GranthIndexView;
