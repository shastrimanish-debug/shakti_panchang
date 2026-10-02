import { BookOpen, FileText, Sparkles, Flame, Home, Compass } from "lucide-react";
import { ShaktiLogo } from "./ShaktiLogo";

interface BookCoverProps {
  onOpenBook: (targetTabId?: string) => void;
  onOpenIndex: () => void;
  currentLocationName?: string;
  onOpenLocation?: () => void;
  onOpenUma?: () => void;
  onOpenPremium?: () => void;
}

export function BookCover({
  onOpenBook,
  onOpenIndex,
  onOpenUma,
}: BookCoverProps) {
  return (
    <div className="w-full flex items-center justify-center px-3 py-6 sm:py-10 text-center animate-in fade-in zoom-in-95 duration-300">
      <div className="max-w-md w-full bg-[#FAF2E4] dark:bg-[#2A1508] backdrop-blur-2xl rounded-3xl p-6 sm:p-8 border-2 border-[#B56A00] shadow-[0_20px_60px_rgba(92,58,33,0.25)] text-[#5C3A21] dark:text-[#FAF2E4] relative overflow-hidden">
        {/* Decorative corner vedic motifs */}
        <div className="absolute top-2 left-2 text-[#B56A00]/40 font-granth text-xs">卐</div>
        <div className="absolute top-2 right-2 text-[#B56A00]/40 font-granth text-xs">卐</div>

        <p className="text-xs sm:text-sm font-extrabold tracking-widest text-[#B56A00] dark:text-amber-400 uppercase">
          ॥ श्री गणेशाय नमः ॥ • काशी-उज्जैन परंपरा
        </p>

        <div className="mt-5 flex justify-center">
          <div className="p-3.5 bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 rounded-3xl shadow-[0_10px_30px_rgba(245,158,11,0.45)] transform hover:rotate-2 transition-transform duration-300">
            <ShaktiLogo size={84} className="rounded-2xl" />
          </div>
        </div>

        <h1 className="mt-4 font-granth text-3xl sm:text-4xl leading-tight font-black text-[#462B17] dark:text-amber-200">
          शक्ति पंचांग ग्रंथ
        </h1>
        <p className="mt-1 text-xs sm:text-sm font-bold text-[#8C6239] dark:text-stone-300">
          वैदिक पंचांग, दुर्गा सप्तशती, वास्तु, कुण्डली एवं मुहूर्त
        </p>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col items-stretch gap-2.5">
          {/* Main Index / Table of Contents Button */}
          <button
            type="button"
            data-no-flip
            onClick={onOpenIndex}
            className="min-h-12 inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#5C3A21] via-[#8C6239] to-[#5C3A21] text-[#FAF2E4] font-black px-5 hover:brightness-110 transition cursor-pointer shadow-lg active:scale-97 m3-touch border border-[#FFD88A]/50"
          >
            <BookOpen className="w-5 h-5 text-[#FFD88A]" />
            <span>📖 ग्रंथ खोलें (अनुक्रमणिका / Index)</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              data-no-flip
              onClick={() => onOpenBook("panchang")}
              className="min-h-11 inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#F4E8D1] hover:bg-[#EADBCC] text-[#5C3A21] font-bold px-3 transition cursor-pointer shadow-2xs text-xs border border-[#8C6239]/20"
            >
              <span>📜 दैनिक पंचांग</span>
            </button>

            <button
              type="button"
              data-no-flip
              onClick={() => onOpenBook("kundali")}
              className="min-h-11 inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#F4E8D1] hover:bg-[#EADBCC] text-[#5C3A21] font-bold px-3 transition cursor-pointer shadow-2xs text-xs border border-[#8C6239]/20"
            >
              <span>🪐 जन्म कुण्डली</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              data-no-flip
              onClick={() => onOpenBook("durga")}
              className="min-h-11 inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-rose-800 to-amber-800 text-white font-bold px-3 transition cursor-pointer shadow-2xs text-xs"
            >
              <Flame className="w-3.5 h-3.5 text-amber-300" />
              <span>दुर्गा सप्तशती</span>
            </button>

            <button
              type="button"
              data-no-flip
              onClick={() => onOpenBook("vastu")}
              className="min-h-11 inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#F4E8D1] hover:bg-[#EADBCC] text-[#5C3A21] font-bold px-3 transition cursor-pointer shadow-2xs text-xs border border-[#8C6239]/20"
            >
              <Home className="w-3.5 h-3.5 text-[#B56A00]" />
              <span>वास्तु शास्त्र</span>
            </button>
          </div>

          {onOpenUma && (
            <button
              type="button"
              data-no-flip
              onClick={onOpenUma}
              className="min-h-12 mt-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-stone-950 font-black px-5 hover:brightness-105 transition cursor-pointer shadow-[0_6px_25px_rgba(245,158,11,0.5)] active:scale-97 m3-touch border border-white"
            >
              <Sparkles className="w-5 h-5 fill-stone-950 text-stone-950" />
              <span>उमा से परामर्श लें ✨</span>
            </button>
          )}
        </div>

        {/* Powered by SHIV SHAKTI Footer */}
        <div className="mt-5 pt-3 border-t border-[#8C6239]/20 text-center">
          <p className="text-[11px] font-extrabold tracking-widest text-[#8C6239] dark:text-amber-300/80">
            शक्ति पंचांग • <span className="text-[#B56A00] dark:text-amber-400">Powered by SHIV SHAKTI</span>
          </p>
        </div>
      </div>
    </div>
  );
}
