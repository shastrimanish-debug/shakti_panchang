import { BookOpen, Sparkles, Landmark } from "lucide-react";
import type { BookPageItem } from "../constants/bookPages";

interface BookChapterPageProps {
  page: BookPageItem;
  onOpenChapter: () => void;
  onOpenUma: () => void;
}

export function BookChapterPage({ page, onOpenChapter, onOpenUma }: BookChapterPageProps) {
  const Icon = page.icon;
  return (
    <div className="h-full w-full flex items-center justify-center px-7 py-10 text-center text-[#3E2714]">
      <div className="max-w-sm w-full">
        <Icon className="w-[72px] h-[72px] mx-auto text-[#B56A00]" strokeWidth={1.35} />
        <h2 className="mt-5 text-[30px] font-black text-[#5C3A21] leading-none tracking-tight">
          {page.title}
        </h2>
        <p className="mt-2.5 text-base font-medium leading-relaxed">{page.desc}</p>

        <div className="mt-7 flex flex-col items-stretch gap-2.5">
          <button
            type="button"
            data-no-flip
            onClick={onOpenChapter}
            className="min-h-12 inline-flex items-center justify-center gap-2 rounded-full bg-[#B56A00] text-white font-bold px-5 shadow-sm"
          >
            <BookOpen className="w-5 h-5" />
            यह अध्याय खोलें
          </button>
          <button
            type="button"
            data-no-flip
            onClick={onOpenUma}
            className="min-h-12 inline-flex items-center justify-center gap-2 rounded-full border-2 border-[#B56A00] text-[#5C3A21] font-bold px-5 bg-transparent"
          >
            <Sparkles className="w-5 h-5 text-[#B56A00]" />
            उमा — इस पन्ने की जानकारी
          </button>
        </div>
        <p className="mt-5 text-xs text-black/55">बाएँ/दाएँ स्वाइप करके पन्ना पलटें</p>
      </div>
    </div>
  );
}

export function BookBackCover({ onOpenUma }: { onOpenUma: () => void }) {
  return (
    <div className="h-full w-full flex items-center justify-center px-7 py-10 text-center text-[#5C3A21]">
      <div className="max-w-sm">
        <Landmark className="w-[70px] h-[70px] mx-auto text-[#B56A00]" strokeWidth={1.35} />
        <h2 className="mt-4 text-[28px] font-black">शक्ति पंचांग</h2>
        <p className="mt-2 text-base font-bold">ज्ञान • समय • संस्कार</p>
        <button
          type="button"
          data-no-flip
          onClick={onOpenUma}
          className="mt-8 min-h-12 inline-flex items-center justify-center gap-2 rounded-full border-2 border-[#B56A00] text-[#5C3A21] font-bold px-5"
        >
          <Sparkles className="w-5 h-5 text-[#B56A00]" />
          उमा से पूछें
        </button>
        <p className="mt-5 text-sm font-extrabold">Powered by SHIV SHAKTI</p>
      </div>
    </div>
  );
}
