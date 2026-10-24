import React, { useState, useEffect } from 'react';
import { getDailyShloka, DailyShloka, SHLOKAS, getLocalizedDailyShloka, shlokaChrome } from '../constants/shlokas';
import { BookOpen, Copy, Check, Volume2, VolumeX, Sparkles, RefreshCw, Share2 } from 'lucide-react';
import { umaVoice } from '../services/UmaVoiceService';
import { useLanguage } from '../i18n';
import { triggerHapticSelection } from '../utils/haptics';

interface DailyShlokaCardProps {
  date?: Date;
  onExploreMore?: () => void;
}

export const DailyShlokaCard: React.FC<DailyShlokaCardProps> = ({ date = new Date(), onExploreMore }) => {
  const { language } = useLanguage();
  const [shloka, setShloka] = useState<DailyShloka>(() => getDailyShloka(date));
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const loc = getLocalizedDailyShloka(shloka, language);
  const chrome = shlokaChrome(language);

  // Update shloka when date changes
  useEffect(() => {
    setShloka(getDailyShloka(date));
  }, [date]);

  // Clean up speech synthesis on unmount
  useEffect(() => {
    return () => {
      umaVoice.stop();
    };
  }, []);

  const handleCopy = async () => {
    triggerHapticSelection();
    const textToCopy = `॥ ${loc.title} ॥\n\n${shloka.sanskrit}\n\n${loc.meaningLabel}\n${loc.meaning}\n\n— ${shloka.source}\n(${language === 'en' ? 'Shakti Panchang' : language === 'gu' ? 'શક્તિ પંચાંગ' : 'शक्ति पंचांग'})`;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = textToCopy;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const handleSpeak = () => {
    triggerHapticSelection();
    if (isSpeaking) {
      umaVoice.stop();
      setIsSpeaking(false);
      return;
    }
    setIsSpeaking(true);
    void umaVoice.speak(`${shloka.sanskrit}। ${loc.meaning}`, {
      rate: 0.88,
      pitch: 1.02,
      voiceStyle: 'pandit',
      sanskritOnly: true,
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };

  const handleNextShloka = () => {
    triggerHapticSelection();
    const currentIndex = SHLOKAS.findIndex((s) => s.id === shloka.id);
    const nextIndex = (currentIndex + 1) % SHLOKAS.length;
    setShloka(SHLOKAS[nextIndex]);
    if (isSpeaking) {
      umaVoice.stop();
      setIsSpeaking(false);
    }
  };

  const handleShare = async () => {
    triggerHapticSelection();
    const shareTitle = `🕉️ ${loc.title} — ${shloka.source}`;
    const shareText = `🕉️ *${loc.title}*\n\n🪔 *संस्कृत श्लोक:* \n"${shloka.sanskrit}"\n\n📖 *${loc.meaningLabel}*\n${loc.meaning}\n\n📚 *${chrome.source}* ${shloka.source}\n\n✨ *सनातन शक्ति पंचांग* से प्रतिदिन प्राप्त करें पावन सुभाषितम् व श्लोक:\nhttps://shastrimanish-debug.github.io/shakti_panchang/`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
        });
        return;
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
      }
    }

    // Direct WhatsApp share fallback
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(whatsappUrl, '_blank');
  };

  const shareButtonLabel = language === 'en' ? 'Share' : language === 'gu' ? 'શેર કરો' : 'साझा करें';
  const nextButtonLabel = language === 'en' ? 'Rotate' : language === 'gu' ? 'બીજો શ્લોક' : 'अगला श्लोक';

  return (
    <div className="bg-[#FAF2E4] border border-[#8C6239]/35 rounded-2xl p-3.5 sm:p-4 shadow-sm relative overflow-hidden transition-all bx-glass">
      {/* Subtle sacred watermark background ornament */}
      <div className="absolute -right-4 -bottom-6 text-7xl font-granth text-[#5C3A21]/5 select-none pointer-events-none">
        ॐ
      </div>

      {/* Top Header Bar */}
      <div className="flex items-center justify-between gap-2 border-b border-[#8C6239]/20 pb-2.5">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="w-5 h-5 rounded-full bg-[#5C3A21] text-[#FAF2E4] flex items-center justify-center text-[10px] font-bold font-granth shadow-inner shrink-0">
            ॐ
          </span>
          <span className="text-xs font-black font-granth tracking-wide text-[#5C3A21] truncate">
            {loc.title}
          </span>
          <span className="text-[10px] font-semibold text-[#8C6239] bg-[#F4E8D1] px-1.5 py-0.2 rounded border border-[#8C6239]/20 shrink-0">
            {loc.badge}
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={handleSpeak}
            className={`p-1.5 rounded-lg transition cursor-pointer ${
              isSpeaking
                ? 'bg-[#B56A00] text-white shadow-2xs'
                : 'text-[#8C6239] hover:bg-[#F4E8D1]'
            }`}
            title={isSpeaking ? chrome.stop : chrome.listen}
            aria-label={isSpeaking ? chrome.stop : chrome.listen}
          >
            {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className={`p-1.5 rounded-lg transition cursor-pointer ${
              copied
                ? 'bg-emerald-700 text-white shadow-2xs'
                : 'text-[#8C6239] hover:bg-[#F4E8D1]'
            }`}
            title={chrome.copy}
            aria-label={chrome.copy}
          >
            {copied ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5 text-[#8C6239]" />}
          </button>

          <button
            type="button"
            onClick={handleNextShloka}
            className="p-1.5 rounded-lg text-[#8C6239] hover:bg-[#F4E8D1] transition cursor-pointer"
            title={chrome.next}
            aria-label={chrome.next}
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Sanskrit Shloka Verse */}
      <div className="pt-3 pb-2.5 text-center px-1">
        <blockquote className="font-granth text-xs sm:text-sm font-black text-[#5C3A21] leading-relaxed whitespace-pre-line tracking-wide">
          {shloka.sanskrit}
        </blockquote>
      </div>

      {/* Localized Translation Section */}
      <div className="bg-[#FFF9EE] border border-[#8C6239]/25 rounded-xl p-2.5 sm:p-3 mt-1 space-y-1">
        <div className="text-[10px] font-black uppercase text-[#B56A00] tracking-wider flex items-center gap-1">
          <Sparkles className="w-2.5 h-2.5 text-[#B56A00]" />
          <span>{loc.meaningLabel}</span>
        </div>
        <p className="text-xs text-[#3E2714] leading-relaxed font-medium">
          {loc.meaning}
        </p>
      </div>

      {/* Source Reference & Prominent Share Action Bar */}
      <div className="flex items-center justify-between pt-2.5 text-[11px] text-[#8C6239] font-bold gap-2">
        <div className="flex items-center gap-1.5 min-w-0 truncate">
          <BookOpen className="w-3.5 h-3.5 text-[#B56A00] shrink-0" />
          <span className="truncate">{chrome.source}{shloka.source}</span>
          {copied && (
            <span className="text-emerald-800 text-[10px] font-bold ml-1 animate-in fade-in shrink-0">
              {loc.copiedMsg}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleNextShloka}
            className="px-2.5 py-1 rounded-lg bg-[#F4E8D1] hover:bg-[#EBD8BD] text-[#5C3A21] border border-[#8C6239]/30 text-[11px] font-bold flex items-center gap-1 transition cursor-pointer shadow-2xs"
            title={chrome.next}
          >
            <RefreshCw className="w-3 h-3 text-[#8C6239]" />
            <span>{nextButtonLabel}</span>
          </button>

          <button
            type="button"
            onClick={handleShare}
            className="px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-bold flex items-center gap-1 transition cursor-pointer shadow-xs active:scale-95"
            title={shareButtonLabel}
          >
            <Share2 className="w-3 h-3 text-white" />
            <span>{shareButtonLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
