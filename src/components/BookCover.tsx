import { BookOpen, Crown, FileText, Sparkles } from "lucide-react";
import { useLicense } from "@/lib/license-client";

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
      ? `निःशुल्क — ${status.daysRemaining} दिन`
      : status.entitled
        ? `प्रीमियम — ${status.daysRemaining} दिन`
        : "Shakti Panchang Premium";

  return (
    <div className="h-full w-full flex items-center justify-center px-6 py-8 text-center text-[#5C3A21]">
      <div className="max-w-md w-full">
        <p className="text-base sm:text-lg font-extrabold">॥ श्री गणेशाय नमः ॥</p>

        <div className="mt-7 flex justify-center text-[#B56A00]">
          <BookOpen className="w-[88px] h-[88px]" strokeWidth={1.4} />
        </div>

        <h1 className="mt-4 font-granth text-[34px] leading-none font-black">शक्ति पंचांग</h1>
        <p className="mt-2 text-[17px] font-bold leading-snug">
          सम्पूर्ण वैदिक पंचांग एवं ज्योतिष ग्रंथ
        </p>

        <div className="mt-8 flex flex-col items-stretch gap-2.5">
          <button
            type="button"
            data-no-flip
            onClick={() => onOpenBook()}
            className="min-h-12 inline-flex items-center justify-center gap-2 rounded-full bg-[#5C3A21] text-[#FAF2E4] font-bold px-5"
          >
            <BookOpen className="w-5 h-5" />
            ग्रंथ खोलें
          </button>
          <button
            type="button"
            data-no-flip
            onClick={() => onOpenBook("kundali")}
            className="min-h-12 inline-flex items-center justify-center gap-2 rounded-full border-2 border-[#5C3A21] text-[#5C3A21] font-bold px-5 bg-transparent"
          >
            <FileText className="w-5 h-5" />
            जन्म पत्रिका व PDF
          </button>
          <button
            type="button"
            data-no-flip
            onClick={onOpenUma}
            className="min-h-12 inline-flex items-center justify-center gap-2 rounded-full border-2 border-[#5C3A21] text-[#5C3A21] font-bold px-5 bg-transparent"
          >
            <Sparkles className="w-5 h-5 text-[#B56A00]" />
            उमा से मार्गदर्शन
          </button>
          <button
            type="button"
            data-no-flip
            onClick={onOpenPremium}
            className="min-h-12 inline-flex items-center justify-center gap-2 rounded-full border-2 border-[#B56A00] text-[#5C3A21] font-bold px-5 bg-[#FFF3DC]"
          >
            <Crown className="w-5 h-5 text-[#B56A00]" />
            {trialLabel}
          </button>
        </div>

        <p className="mt-6 text-sm font-extrabold text-[#5C3A21]">Powered by SHIV SHAKTI</p>
        <p className="mt-3 text-xs text-black/50">बाएँ / दाएँ स्वाइप करके पन्ना पलटें</p>
      </div>
    </div>
  );
}
