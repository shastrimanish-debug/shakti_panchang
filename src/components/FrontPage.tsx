import { useEffect } from "react";
import { SUPPORTED_LANGUAGES } from "../i18n";
import omLogo from "../assets/front-om.png";

type FrontPageProps = {
  language: string;
  daysRemaining: number;
  locked: boolean;
  onLanguage: (code: string) => void;
  onEnter: () => void;
};

export function FrontPage({ language, daysRemaining, locked, onLanguage, onEnter }: FrontPageProps) {
  useEffect(() => {
    const id = "front-indic-fonts";
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Noto+Sans+Gujarati:wght@600&family=Noto+Sans+Bengali:wght@600&family=Noto+Sans+Tamil:wght@600&family=Noto+Sans+Telugu:wght@600&family=Noto+Sans+Kannada:wght@600&family=Noto+Sans+Malayalam:wght@600&family=Noto+Sans+Gurmukhi:wght@600&family=Noto+Sans+Oriya:wght@600&display=swap";
    document.head.appendChild(link);
  }, []);

  return (
    <div
      className="fixed inset-0 z-[80] overflow-y-auto"
      style={{ background: "#3a140c", color: "#fff6e8" }}
    >
      <div className="mx-auto flex min-h-full w-full max-w-md flex-col items-center px-5 py-8">
        <div className="w-full flex-1 rounded-[28px] border border-[#d4a84a] px-4 py-6 text-center">
          <img
            src={omLogo}
            alt="शक्ति पंचांग"
            className="mx-auto h-40 w-40 rounded-3xl object-cover shadow-lg"
          />
          <h1 className="mt-4 font-granth text-4xl text-[#ffd682]">शक्ति पंचांग</h1>
          <p className="mt-1 text-xs tracking-[0.22em] text-[#e8c496]">SHAKTI PANCHANG</p>
          <div className="mx-auto mt-3 h-px w-32 bg-[#d4a84a]" />
          <p className="mt-3 text-lg text-[#fff6e8]">Powered by Shiv Shakti</p>

          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {SUPPORTED_LANGUAGES.map((item) => {
              const on = item.code === language;
              return (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => onLanguage(item.code)}
                  className="rounded-full border px-3 py-1.5 text-sm"
                  style={{
                    borderColor: on ? "#ffd682" : "#b4823c",
                    background: on ? "#9a3412" : "#3c1c10",
                    color: "#fff6e8",
                    fontFamily: '"Noto Sans Gujarati","Noto Sans Bengali","Noto Sans Tamil","Noto Sans Telugu","Noto Sans Kannada","Noto Sans Malayalam","Noto Sans Gurmukhi","Noto Sans Oriya",sans-serif',
                  }}
                >
                  {item.nativeName}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={onEnter}
            className="mt-6 w-full rounded-2xl border-2 border-[#ffd682] bg-[#9a3412] py-3.5 text-lg font-bold text-[#fff6e8]"
          >
            {locked ? "सदस्यता लें" : "प्रवेश करें"}
          </button>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-[#d4a84a]/70 bg-[#2a120a] px-3 py-4">
              <div className="text-2xl font-bold text-[#ffd682]">₹99</div>
              <div className="mt-1 text-sm text-[#fff6e8]">आजीवन · भारत</div>
            </div>
            <div className="rounded-2xl border border-[#d4a84a]/70 bg-[#2a120a] px-3 py-4">
              <div className="text-2xl font-bold text-[#ffd682]">$1</div>
              <div className="mt-1 text-sm text-[#fff6e8]">Lifetime · World</div>
            </div>
          </div>

          <p className="mt-5 text-base text-[#fff6e8]">
            {locked
              ? "७ दिन का निःशुल्क परीक्षण समाप्त"
              : `७ दिन निःशुल्क · ${daysRemaining} दिन शेष`}
          </p>
          <p className="mt-1 text-sm text-[#e8c496]">
            सात दिन बाद सदस्यता तक ऐप पूर्ण रूप से बंद
          </p>
        </div>
      </div>
    </div>
  );
}
