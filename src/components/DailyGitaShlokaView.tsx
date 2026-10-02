import React, { useState } from 'react';
import { GITA_SHLOKAS, GitaShlokaItem } from '../data/gitaShlokas';
import { BookOpen, Sparkles, Volume2, Share2 } from 'lucide-react';
import { openWhatsAppShare } from '../services/umaConsultationPdf';

export const DailyGitaShlokaView: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const shloka = GITA_SHLOKAS[currentIndex];

  const handleShare = () => {
    const text = `📜 *श्रीमद्भगवद्गीता श्लोक (अध्याय ${shloka.chapter}, श्लोक ${shloka.verse})* 📜\n\n${shloka.sanskrit}\n\n*अर्थ:* ${shloka.meaning}\n\nशक्ति पंचांग से साभार।`;
    openWhatsAppShare(text);
  };

  const handleSpeak = () => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(shloka.sanskrit + '. ' + shloka.meaning);
    utt.lang = 'hi-IN';
    utt.rate = 0.8;
    window.speechSynthesis.speak(utt);
  };

  return (
    <div className="w-full space-y-4 animate-in fade-in duration-200">
      {/* Header */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#5C3A21] via-[#8C6239] to-[#5C3A21] text-[#FAF2E4] shadow-md border border-[#FFD88A]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#FAF2E4]/10 border border-[#FFD88A]/40 flex items-center justify-center shrink-0">
            <BookOpen className="w-6 h-6 text-[#FFD88A]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold font-granth text-[#FFD88A]">
                श्रीमद्भगवद्गीता ज्ञान (Shloka of the Day)
              </h2>
              <span className="text-[10px] bg-[#B56A00] text-white px-2 py-0.5 rounded-full font-bold">
                दिव्य वाणी
              </span>
            </div>
            <p className="text-xs text-[#FAF2E4]/80 mt-0.5">
              जीवन दर्शन, कर्मयोग एवं भगवान श्रीकृष्ण के अमर उपदेश
            </p>
          </div>
        </div>
      </div>

      {/* Shloka Card */}
      <div className="p-5 sm:p-7 rounded-2xl bg-[#FAF2E4] border border-[#8C6239]/25 shadow-xs space-y-4 text-center">
        <div className="inline-block px-3 py-1 rounded-full bg-[#B56A00] text-white text-xs font-bold">
          अध्याय {shloka.chapter} • श्लोक {shloka.verse}
        </div>

        <p className="font-granth text-lg sm:text-xl font-bold text-[#5C3A21] leading-relaxed whitespace-pre-line py-2">
          {shloka.sanskrit}
        </p>

        <p className="text-xs italic text-[#735133]">
          {shloka.transliteration}
        </p>

        <div className="p-4 rounded-xl bg-white border border-[#8C6239]/20 text-left space-y-2">
          <h4 className="text-xs font-bold text-[#8C6239] uppercase tracking-wider">
            सरल हिंदी भावार्थ
          </h4>
          <p className="text-xs sm:text-sm text-[#3E2714] leading-relaxed">
            {shloka.meaning}
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-[#FBF0DD] border border-[#B56A00]/30 text-left space-y-1 text-xs">
          <h4 className="font-bold text-[#5C3A21] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#B56A00]" />
            <span>जीवन में चिंतन व अनुप्रयोग</span>
          </h4>
          <p className="text-[#735133] leading-relaxed">{shloka.reflection}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleSpeak}
            className="px-4 py-2 rounded-xl bg-[#5C3A21] text-[#FAF2E4] text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Volume2 className="w-4 h-4 text-[#FFD88A]" />
            <span>श्लोक श्रवण करें</span>
          </button>

          <button
            type="button"
            onClick={handleShare}
            className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>व्हाट्सएप शेयर</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentIndex((idx) => (idx + 1) % GITA_SHLOKAS.length)}
            className="px-4 py-2 rounded-xl bg-[#EADBCC] hover:bg-[#D9C4A9] text-[#5C3A21] text-xs font-bold cursor-pointer"
          >
            <span>अगला श्लोक ➔</span>
          </button>
        </div>
      </div>
    </div>
  );
};
