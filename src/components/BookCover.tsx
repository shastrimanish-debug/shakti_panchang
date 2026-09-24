import { BookOpen, FileText, Sparkles } from "lucide-react";
import { ShaktiLogo } from "./ShaktiLogo";

interface BookCoverProps {
  onOpenBook: (targetTabId?: string) => void;
  currentLocationName?: string;
  onOpenLocation?: () => void;
  onOpenUma?: () => void;
  onOpenPremium?: () => void;
}

export function BookCover({
  onOpenBook,
  onOpenUma,
}: BookCoverProps) {
  return (
    <div className="w-full flex items-center justify-center px-4 py-8 text-center animate-in fade-in zoom-in-95 duration-200">
      <div className="max-w-sm w-full bg-white/90 dark:bg-[#2A1508]/90 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 border border-amber-500/30 shadow-[0_15px_45px_rgba(92,58,33,0.15)] text-[#5C3A21] dark:text-[#FAF2E4]">
        <p className="text-xs sm:text-sm font-extrabold tracking-widest text-amber-600 dark:text-amber-400 uppercase">
          ॥ श्री गणेशाय नमः ॥
        </p>

        <div className="mt-5 flex justify-center">
          <div className="p-3 bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 rounded-3xl shadow-[0_10px_30px_rgba(245,158,11,0.4)]">
            <ShaktiLogo size={80} className="rounded-2xl" />
          </div>
        </div>

        <h1 className="mt-4 font-granth text-3xl sm:text-4xl leading-tight font-black text-[#462B17] dark:text-amber-200">
          शक्ति पंचांग
        </h1>
        <p className="mt-1 text-xs sm:text-sm font-bold text-[#8C6239] dark:text-stone-300">
          सम्पूर्ण वैदिक पंचांग, मुहूर्त एवं कुण्डली
        </p>

        <div className="mt-7 flex flex-col items-stretch gap-3">
          <button
            type="button"
            data-no-flip
            onClick={() => onOpenBook("panchang")}
            className="min-h-12 inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#5C3A21] to-[#381E0C] text-[#FAF2E4] font-black px-5 hover:brightness-110 transition cursor-pointer shadow-lg active:scale-97 m3-touch border border-amber-500/40"
          >
            <BookOpen className="w-5 h-5 text-amber-300" />
            <span>पंचांग खोलें</span>
          </button>

          <button
            type="button"
            data-no-flip
            onClick={() => onOpenBook("kundali")}
            className="min-h-12 inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-[#8C6239]/40 text-[#5C3A21] dark:text-amber-200 font-bold px-5 bg-amber-50/50 dark:bg-stone-900/50 hover:bg-amber-100/60 transition cursor-pointer active:scale-97 m3-touch"
          >
            <FileText className="w-5 h-5 text-amber-600" />
            <span>जन्म कुण्डली बनाएं</span>
          </button>

          {onOpenUma && (
            <button
              type="button"
              data-no-flip
              onClick={onOpenUma}
              className="min-h-12 inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-stone-950 font-black px-5 hover:brightness-105 transition cursor-pointer shadow-[0_6px_25px_rgba(245,158,11,0.5)] active:scale-97 m3-touch border border-white"
            >
              <Sparkles className="w-5 h-5 fill-stone-950 text-stone-950" />
              <span>उमा AI से परामर्श लें ✨</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
