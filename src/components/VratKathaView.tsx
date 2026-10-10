import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Share2, Volume2, VolumeX, Search, Copy, Check } from 'lucide-react';
import { VRAT_KATHA_DATA, VRAT_KATHA_CATEGORIES, VratKathaItem } from '../data/vratKathaData';
import { getLocalizedVratKathaItem } from '../services/vratKathaMultilingual';
import { openWhatsAppShare } from '../services/umaConsultationPdf';
import { useLanguage } from '../i18n';
import { speakUma, stopUmaSpeech } from '../lib/umaSpeech';
import { ZeroScrollPager } from './ZeroScrollPager';
import { DrawerHostContext } from './BoardShell';

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
  const { language } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [activeChapterIndex, setActiveChapterIndex] = useState<number>(0);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg'>('base');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const localizedKathas = useMemo(() => {
    return VRAT_KATHA_DATA.map((item) => getLocalizedVratKathaItem(item, language));
  }, [language]);

  const filteredKathas = useMemo(() => {
    return localizedKathas.filter((katha) => {
      const matchesCat = selectedCategory === 'all' || katha.category === selectedCategory;
      const matchesSearch =
        !searchQuery.trim() ||
        katha.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        katha.subtitle.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [localizedKathas, selectedCategory, searchQuery]);

  const currentKatha: VratKathaItem = filteredKathas[selectedIndex] || filteredKathas[0] || localizedKathas[0];

  const handleSpeakKatha = () => {
    if (isSpeaking) {
      stopUmaSpeech();
      setIsSpeaking(false);
      return;
    }
    const currentChapterText = currentKatha.katha[activeChapterIndex] || currentKatha.description;
    const speechContent = `${currentKatha.title}। ${currentKatha.subtitle}। श्लोक: ${currentKatha.shlok}। भावार्थ: ${currentKatha.shlokMeaning}। ${currentChapterText}`;
    setIsSpeaking(true);
    void speakUma(speechContent, {
      rate: 0.88,
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };

  const handleShareKatha = () => {
    const text = `॥ ${currentKatha.title} ॥\n\n${currentKatha.subtitle}\n\nश्लोक:\n${currentKatha.shlok}\n\nभावार्थ: ${currentKatha.shlokMeaning}\n\n(शक्ति पंचांग - व्रत कथा संग्रह)`;
    openWhatsAppShare(text);
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const drawer = React.useContext(DrawerHostContext);
  const host = drawer.host;
  const body = (currentKatha.katha && currentKatha.katha[activeChapterIndex]) || currentKatha.description || "";
  const blocks = body.split(/\n+/).map((line) => line.trim()).filter(Boolean);
  const size = fontSize === "sm" ? "text-[15px]" : fontSize === "lg" ? "text-[20px]" : "text-[17px]";

  const tools = (
    <div className="flex flex-col gap-2 text-sm">
      <div className="flex flex-wrap gap-1.5">
        {VRAT_KATHA_CATEGORIES.map((cat) => (
          <button key={cat.id} type="button" className="bx-iconbtn h-auto px-2 text-xs" onClick={() => { setSelectedCategory(cat.id); setSelectedIndex(0); setActiveChapterIndex(0); }}>
            {cat.label}
          </button>
        ))}
      </div>
      <label className="flex items-center gap-2">
        <Search className="w-4 h-4 shrink-0" />
        <input value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setSelectedIndex(0); setActiveChapterIndex(0); }} placeholder="कथा खोजें" className="w-full bg-transparent outline-none" />
      </label>
      <div className="flex flex-wrap gap-1.5">
        <button type="button" className="bx-iconbtn" onClick={() => setFontSize(fontSize === "sm" ? "base" : fontSize === "base" ? "lg" : "sm")}>अ</button>
        <button type="button" className="bx-iconbtn" onClick={handleSpeakKatha}>{isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}</button>
        <button type="button" className="bx-iconbtn" onClick={() => handleCopyText(currentKatha.id, `${currentKatha.title}\n${currentKatha.shlok}`)}>{copiedId ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}</button>
        <button type="button" className="bx-iconbtn" onClick={handleShareKatha}><Share2 className="w-4 h-4" /></button>
        {onOpenUmaModal && <button type="button" className="bx-iconbtn" onClick={() => onOpenUmaModal(currentKatha.title)}>उमा</button>}
      </div>
      <div className="max-h-40 overflow-y-auto flex flex-col gap-1">
        {filteredKathas.map((katha, idx) => (
          <button key={katha.id || idx} type="button" className="text-left text-xs px-2 py-1 rounded-lg" style={{ background: idx === selectedIndex ? "var(--bx-mark)" : "transparent", color: idx === selectedIndex ? "var(--bx-cream)" : "inherit" }} onClick={() => { setSelectedIndex(idx); setActiveChapterIndex(0); }}>
            {katha.title}
          </button>
        ))}
      </div>
      {currentKatha.katha && currentKatha.katha.length > 1 && (
        <div className="flex flex-wrap gap-1">
          {currentKatha.katha.map((_, idx) => (
            <button key={idx} type="button" className="bx-iconbtn h-auto px-2 text-xs" onClick={() => setActiveChapterIndex(idx)}>अध्याय {idx + 1}</button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="flex-1 min-h-0 w-full flex flex-col overflow-hidden">
      <div className="shrink-0 px-3 pt-1 text-[13px] font-semibold truncate">{currentKatha.title}</div>
      {host ? createPortal(tools, host) : null}
      <ZeroScrollPager className="flex-1 min-h-0" contentClassName="px-2 pt-1 pb-0.5 flex flex-col gap-1.5" resetKey={`${currentKatha.id}-${activeChapterIndex}-${fontSize}`}>
        {currentKatha.shlok ? <article className="bx-verse"><div className="bx-kicker">श्लोक</div><p className={`font-granth whitespace-pre-wrap ${size}`}>{currentKatha.shlok}</p></article> : null}
        {currentKatha.shlokMeaning ? <article className="bx-verse"><div className="bx-kicker">भावार्थ</div><p className={size}>{currentKatha.shlokMeaning}</p></article> : null}
        {blocks.map((line, idx) => (
          <article key={idx} className="bx-verse">
            <div className="bx-kicker">अध्याय {activeChapterIndex + 1} · {idx + 1}/{blocks.length}</div>
            <p className={`whitespace-pre-wrap ${size}`}>{line}</p>
          </article>
        ))}
        {(currentKatha.rules || []).map((rule, idx) => (
          <article key={`r${idx}`} className="bx-verse"><div className="bx-kicker">विधि</div><p className={size}>{rule}</p></article>
        ))}
      </ZeroScrollPager>
    </div>
  );
};

export default VratKathaView;
