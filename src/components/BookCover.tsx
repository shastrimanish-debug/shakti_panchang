import { BookOpen, Crown, FileText, Sparkles, Lock } from "lucide-react";
import { useLicense } from "@/lib/license-client";
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
  onOpenPremium,
}: BookCoverProps) {
  const { status, loading } = useLicense();

  const trialLabel = loading
    ? "सदस्यता जाँच…"
    : status.entitled && status.kind === "trial"
      ? `निःशुल्क परीक्षण — ${status.daysRemaining} दिन शेष`
      : status.entitled
        ? status.kind === "lifetime"
          ? "आजीवन VIP सदस्यता सक्रिय"
          : `वार्षिक सदस्यता सक्रिय (${status.daysRemaining} दिन)`
        : "परीक्षण समाप्त • केवल पंचांग मुख्य पृष्ठ फ्री";

  return (
    <div className="h-full w-full flex items-center justify-center px-6 py-8 text-center text-[#5C3A21]">
      <div className="max-w-md w-full">
        <p className="text-base sm:text-lg font-extrabold">॥ श्री गणेशाय नमः ॥</p>

        <div className="mt-7 flex justify-center">
          <ShaktiLogo size={96} className="shadow-2xl rounded-3xl" />
        </div>

        <h1 className="mt-4 font-granth text-[34px] leading-none font-black">शक्ति पंचांग</h1>
        <p className="mt-2 text-[17px] font-bold leading-snug">
          सम्पूर्ण वैदिक पंचांग एवं ज्योतिष ग्रंथ
        </p>

        <div className="mt-8 flex flex-col items-stretch gap-2.5">
          <button
            type="button"
            data-no-flip
            onClick={() => onOpenBook("panchang")}
            className="min-h-12 inline-flex items-center justify-center gap-2 rounded-full bg-[#5C3A21] text-[#FAF2E4] font-bold px-5 hover:bg-[#462B17] transition cursor-pointer shadow-xs active:scale-98"
          >
            <BookOpen className="w-5 h-5" />
            ग्रंथ खोलें (मुख्य पंचांग)
          </button>
          <button
            type="button"
            data-no-flip
            onClick={() => onOpenBook("kundali")}
            className="min-h-12 inline-flex items-center justify-center gap-2 rounded-full border-2 border-[#5C3A21] text-[#5C3A21] font-bold px-5 bg-transparent hover:bg-[#F4E8D1] transition cursor-pointer active:scale-98"
          >
            <FileText className="w-5 h-5" />
            <span>जन्म पत्रिका व PDF</span>
            {!status.entitled && <Lock className="w-3.5 h-3.5 text-[#B56A00]" />}
          </button>
          <button
            type="button"
            data-no-flip
            onClick={onOpenUma}
            className="min-h-12 inline-flex items-center justify-center gap-2 rounded-full border-2 border-[#5C3A21] text-[#5C3A21] font-bold px-5 bg-transparent hover:bg-[#F4E8D1] transition cursor-pointer active:scale-98"
          >
            <Sparkles className="w-5 h-5 text-[#B56A00]" />
            <span>उमा से मार्गदर्शन</span>
            {!status.entitled && <Lock className="w-3.5 h-3.5 text-[#B56A00]" />}
          </button>
          <button
            type="button"
            data-no-flip
            onClick={onOpenPremium}
            className={`min-h-12 inline-flex items-center justify-center gap-2 rounded-full border-2 font-bold px-5 transition cursor-pointer active:scale-98 ${
              status.entitled
                ? 'border-[#B56A00] text-[#5C3A21] bg-[#FFF3DC] hover:bg-[#FFE8BF]'
                : 'border-amber-600 text-amber-950 bg-amber-100 hover:bg-amber-200'
            }`}
          >
            <Crown className="w-5 h-5 text-[#B56A00]" />
            <span>{trialLabel}</span>
          </button>
        </div>

        <p className="mt-6 text-sm font-extrabold text-[#5C3A21]">काशी-उज्जैन परंपरानुसार अचूक गणित</p>
        <p className="mt-2 text-xs text-black/60">
          ७ दिन निःशुल्क परीक्षण • उसके बाद केवल पंचांग मुख्य पृष्ठ फ्री रहेगा
        </p>
      </div>
    </div>
  );
}
