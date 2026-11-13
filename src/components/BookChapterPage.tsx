import { BookOpen, Sparkles, Landmark } from "lucide-react";
import type { BookPageItem } from "../constants/bookPages";
import { useLanguage } from "../i18n";

interface BookChapterPageProps {
  page: BookPageItem;
  onOpenChapter: () => void;
  onOpenUma: () => void;
}

export function BookChapterPage({ page, onOpenChapter, onOpenUma }: BookChapterPageProps) {
  const { language } = useLanguage();
  const cLang = (language || "hi").slice(0, 2).toLowerCase();
  const L = (hi: string, en: string, gu: string) =>
    cLang === "en" ? en : cLang === "gu" ? gu : hi;
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
            {L("यह अध्याय खोलें", "Open This Chapter", "આ અધ્યાય ખોલો")}
          </button>
          <button
            type="button"
            data-no-flip
            onClick={onOpenUma}
            className="min-h-12 inline-flex items-center justify-center gap-2 rounded-full border-2 border-[#B56A00] text-[#5C3A21] font-bold px-5 bg-transparent"
          >
            <Sparkles className="w-5 h-5 text-[#B56A00]" />
            {L("उमा — इस पन्ने की जानकारी", "Uma — About This Page", "ઉમા — આ પૃષ્ઠની માહિતી")}
          </button>
        </div>
        <p className="mt-5 text-xs text-black/55">
          {L("बाएँ/दाएँ स्वाइप करके पन्ना पलटें", "Swipe left/right to turn page", "ડાબે/જમણે સ્વાઇપ કરીને પૃષ્ઠ ફેરવો")}
        </p>
      </div>
    </div>
  );
}

export function BookBackCover({ onOpenUma }: { onOpenUma: () => void }) {
  const { language } = useLanguage();
  const cLang = (language || "hi").slice(0, 2).toLowerCase();
  const L = (hi: string, en: string, gu: string) =>
    cLang === "en" ? en : cLang === "gu" ? gu : hi;
  return (
    <div className="h-full w-full flex items-center justify-center px-7 py-10 text-center text-[#5C3A21]">
      <div className="max-w-sm">
        <Landmark className="w-[70px] h-[70px] mx-auto text-[#B56A00]" strokeWidth={1.35} />
        <h2 className="mt-4 text-[28px] font-black">{L("शक्ति पंचांग", "Shakti Panchang", "શક્તિ પંચાંગ")}</h2>
        <p className="mt-2 text-base font-bold">{L("ज्ञान • समय • संस्कार", "Wisdom • Time • Tradition", "જ્ઞાન • સમય • સંસ્કાર")}</p>
        <button
          type="button"
          data-no-flip
          onClick={onOpenUma}
          className="mt-8 min-h-12 inline-flex items-center justify-center gap-2 rounded-full border-2 border-[#B56A00] text-[#5C3A21] font-bold px-5"
        >
          <Sparkles className="w-5 h-5 text-[#B56A00]" />
          {L("उमा से पूछें", "Ask Uma", "ઉમાને પૂછો")}
        </button>
        <p className="mt-5 text-sm font-extrabold">Powered by SHIV SHAKTI</p>
      </div>
    </div>
  );
}
