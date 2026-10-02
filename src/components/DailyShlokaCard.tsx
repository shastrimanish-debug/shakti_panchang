import React, { useState, useEffect } from 'react';
import { getDailyShloka, DailyShloka, SHLOKAS } from '../constants/shlokas';
import { BookOpen, Copy, Check, Volume2, VolumeX, Sparkles, RefreshCw } from 'lucide-react';

interface DailyShlokaCardProps {
  date?: Date;
}

export const DailyShlokaCard: React.FC<DailyShlokaCardProps> = ({ date = new Date() }) => {
  const [shloka, setShloka] = useState<DailyShloka>(() => getDailyShloka(date));
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Update shloka when date changes
  useEffect(() => {
    setShloka(getDailyShloka(date));
  }, [date]);

  // Clean up speech synthesis on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleCopy = async () => {
    const textToCopy = `॥ दैनिक सुभाषितम् ॥\n\n${shloka.sanskrit}\n\nभावार्थ:\n${shloka.hindi}\n\n— ${shloka.source}\n(शक्ति पंचांग)`;
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
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(`${shloka.sanskrit}। भावार्थ। ${shloka.hindi}`);
    utterance.lang = 'hi-IN';
    utterance.rate = 0.85; // Slightly slower, respectful recitation pace
    utterance.pitch = 1.0;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleNextShloka = () => {
    const currentIndex = SHLOKAS.findIndex((s) => s.id === shloka.id);
    const nextIndex = (currentIndex + 1) % SHLOKAS.length;
    setShloka(SHLOKAS[nextIndex]);
    if (isSpeaking && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  return (
    <div className="bg-[#FAF2E4] border border-[#8C6239]/35 rounded-xl p-3 sm:p-3.5 shadow-xs relative overflow-hidden transition-all">
      {/* Subtle sacred watermark background ornament */}
      <div className="absolute -right-4 -bottom-6 text-7xl font-granth text-[#5C3A21]/5 select-none pointer-events-none">
        ॐ
      </div>

      {/* Top Header Bar */}
      <div className="flex items-center justify-between gap-2 border-b border-[#8C6239]/20 pb-2">
        <div className="flex items-center gap-1.5">
          <span className="w-5 h-5 rounded-full bg-[#5C3A21] text-[#FAF2E4] flex items-center justify-center text-[10px] font-bold font-granth shadow-inner">
            ॐ
          </span>
          <span className="text-xs font-black font-granth tracking-wide text-[#5C3A21]">
            दैनिक सुभाषितम्
          </span>
          <span className="text-[10px] font-semibold text-[#8C6239] bg-[#F4E8D1] px-1.5 py-0.2 rounded border border-[#8C6239]/20">
            आज का श्लोक
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1">
          {typeof window !== 'undefined' && 'speechSynthesis' in window && (
            <button
              type="button"
              onClick={handleSpeak}
              className={`p-1 rounded-md transition cursor-pointer ${
                isSpeaking
                  ? 'bg-[#B56A00] text-white shadow-2xs'
                  : 'text-[#8C6239] hover:bg-[#F4E8D1]'
              }`}
              title={isSpeaking ? 'ध्वनि रोकें' : 'श्लोक सुनें'}
            >
              {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
          )}

          <button
            type="button"
            onClick={handleCopy}
            className={`p-1 rounded-md transition cursor-pointer ${
              copied
                ? 'bg-emerald-700 text-white shadow-2xs'
                : 'text-[#8C6239] hover:bg-[#F4E8D1]'
            }`}
            title="श्लोक व भावार्थ कॉपी करें"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            onClick={handleNextShloka}
            className="p-1 rounded-md text-[#8C6239] hover:bg-[#F4E8D1] transition cursor-pointer"
            title="अन्य सुभाषित देखें"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Sanskrit Shloka Verse */}
      <div className="pt-2.5 pb-2 text-center">
        <blockquote className="font-granth text-xs sm:text-sm font-black text-[#5C3A21] leading-relaxed whitespace-pre-line tracking-wide">
          {shloka.sanskrit}
        </blockquote>
      </div>

      {/* Hindi Translation Section */}
      <div className="bg-[#FFF9EE] border border-[#8C6239]/25 rounded-lg p-2.5 mt-1 space-y-1">
        <div className="text-[10px] font-black uppercase text-[#B56A00] tracking-wider flex items-center gap-1">
          <Sparkles className="w-2.5 h-2.5 text-[#B56A00]" />
          <span>हिन्दी भावार्थ:</span>
        </div>
        <p className="text-xs text-[#3E2714] leading-relaxed font-medium">
          {shloka.hindi}
        </p>
      </div>

      {/* Source Reference Tag */}
      <div className="flex items-center justify-between pt-2 text-[10px] text-[#8C6239] font-bold">
        <span className="flex items-center gap-1">
          <BookOpen className="w-3 h-3 text-[#B56A00]" />
          <span>स्रोत: {shloka.source}</span>
        </span>
        {copied && (
          <span className="text-emerald-800 text-[10px] font-bold animate-in fade-in">
            प्रतिलिपि हो गई!
          </span>
        )}
      </div>
    </div>
  );
};
