import { useEffect } from "react";
import { SUPPORTED_LANGUAGES } from "../i18n";
import omLogo from "../assets/front-om.png";

type FrontPageProps = {
  language: string;
  daysRemaining: number;
  locked: boolean;
  vipActive?: boolean;
  onLanguage: (code: string) => void;
  onEnter: () => void;
};

interface FrontI18n {
  title: string;
  sub: string;
  enter: string;
  subscribe: string;
  lifetimeIn: string;
  lifetimeWorld: string;
  trialExp: string;
  trialRem: (d: number) => string;
  trialNote: string;
  vipTitle: string;
  vipSub: string;
}

const FRONT_PAGE_I18N: Record<string, FrontI18n> = {
  hi: {
    title: "शक्ति पंचांग",
    sub: "SHAKTI PANCHANG",
    enter: "प्रवेश करें",
    subscribe: "सदस्यता लें",
    lifetimeIn: "आजीवन · भारत",
    lifetimeWorld: "Lifetime · World",
    trialExp: "७ दिन का निःशुल्क परीक्षण समाप्त",
    trialRem: (d) => `७ दिन निःशुल्क · ${d} दिन शेष`,
    trialNote: "सात दिन बाद सदस्यता तक ऐप पूर्ण रूप से बंद",
    vipTitle: "आजीवन VIP सदस्यता सक्रिय ✓",
    vipSub: "सभी वैदिक सेवाएँ आजीवन अनलॉक हैं",
  },
  gu: {
    title: "શક્તિ પંચાંગ",
    sub: "SHAKTI PANCHANG",
    enter: "પ્રવેશ કરો",
    subscribe: "સભ્યપદ લો",
    lifetimeIn: "આજીવન · ભારત",
    lifetimeWorld: "Lifetime · World",
    trialExp: "૭ દિવસનું મફત પરીક્ષણ પૂર્ણ",
    trialRem: (d) => `૭ દિવસ મફત · ${d} દિવસ બાકી`,
    trialNote: "સાત દિવસ પછી સભ્યપદ સુધી એપ સંપૂર્ણ બંધ રહેશે",
    vipTitle: "આજીવન VIP સભ્યપદ સક્રિય ✓",
    vipSub: "તમામ વૈદિક સુવિધાઓ આજીવન અનલોક છે",
  },
  en: {
    title: "Shakti Panchang",
    sub: "VEDIC ALMANAC & ASTROLOGY",
    enter: "Enter App",
    subscribe: "Subscribe Now",
    lifetimeIn: "Lifetime · India",
    lifetimeWorld: "Lifetime · World",
    trialExp: "7-Day Free Trial Expired",
    trialRem: (d) => `7 Days Free · ${d} Days Left`,
    trialNote: "App locks after 7 days until ₹99 / $1 lifetime pass",
    vipTitle: "Lifetime VIP Active ✓",
    vipSub: "All premium features unlocked permanently",
  },
  mr: {
    title: "शक्ति पंचांग",
    sub: "SHAKTI PANCHANG",
    enter: "प्रवेश करा",
    subscribe: "सदस्यता घ्या",
    lifetimeIn: "आजीवन · भारत",
    lifetimeWorld: "Lifetime · World",
    trialExp: "७ दिवसांची विनामूल्य चाचणी समाप्त",
    trialRem: (d) => `७ दिवस विनामूल्य · ${d} दिवस शिल्लक`,
    trialNote: "सात दिवसांनंतर सदस्यतेपर्यंत ॲप पूर्णपणे बंद राहील",
    vipTitle: "आजीवन VIP सदस्यता सक्रिय ✓",
    vipSub: "सर्व वैदिक सेवा आजीवन अनलॉक आहेत",
  },
  bn: {
    title: "শক্তি পঞ্চাঙ্গ",
    sub: "SHAKTI PANCHANG",
    enter: "প্রবেশ করুন",
    subscribe: "সাবস্ক্রাইব করুন",
    lifetimeIn: "আজীবন · ভারত",
    lifetimeWorld: "Lifetime · World",
    trialExp: "৭ দিনের বিনামূল্যে ট্রায়াল সমাপ্ত",
    trialRem: (d) => `৭ দিন বিনামূল্যে · ${d} দিন বাকি`,
    trialNote: "সাত দিন পর সাবস্ক্রিপশন ছাড়া অ্যাপ বন্ধ থাকবে",
    vipTitle: "আজীবন VIP সদস্যতা সক্রিয় ✓",
    vipSub: "সকল বৈদিক সেবা আজীবন আনলক করা হয়েছে",
  },
  ta: {
    title: "சக்தி பஞ்சாங்கம்",
    sub: "SHAKTI PANCHANG",
    enter: "உள்நுழையவும்",
    subscribe: "சந்தா பெறவும்",
    lifetimeIn: "வாழ்நாள் · இந்தியா",
    lifetimeWorld: "Lifetime · World",
    trialExp: "7 நாட்கள் இலவச சோதனை முடிந்தது",
    trialRem: (d) => `7 நாட்கள் இலவசம் · ${d} நாட்கள் மீதம்`,
    trialNote: "7 நாட்களுக்குப் பிறகு சந்தா அவசியம்",
    vipTitle: "வாழ்நாள் VIP செயலில் உள்ளது ✓",
    vipSub: "அனைத்து சேவைகளும் வாழ்நாள் முழுவதும் திறக்கப்பட்டுள்ளன",
  },
  te: {
    title: "శక్తి పంచాంగం",
    sub: "SHAKTI PANCHANG",
    enter: "ప్రవేశించండి",
    subscribe: "సభ్యత్వం పొందండి",
    lifetimeIn: "జీవితకాలం · భారతదేశం",
    lifetimeWorld: "Lifetime · World",
    trialExp: "7 రోజుల ఉచిత ట్రయల్ ముగిసింది",
    trialRem: (d) => `7 రోజులు ఉచితం · ${d} రోజులు మిగిలాయి`,
    trialNote: "7 రోజుల తర్వాత సభ్యత్వం అవసరం",
    vipTitle: "జీవితకాల VIP యాక్టివ్ ✓",
    vipSub: "అన్ని సేవలు జీవితకాలం అన్‌లాక్ చేయబడ్డాయి",
  },
  kn: {
    title: "ಶಕ್ತಿ ಪಂಚಾಂಗ",
    sub: "SHAKTI PANCHANG",
    enter: "ಪ್ರವೇಶಿಸಿ",
    subscribe: "ಚಂದಾದಾರರಾಗಿ",
    lifetimeIn: "ಆಜೀವ · ಭಾರತ",
    lifetimeWorld: "Lifetime · World",
    trialExp: "7 ದಿನಗಳ ಉಚಿತ ಪ್ರಯೋಗ ಮುಗಿದಿದೆ",
    trialRem: (d) => `7 ದಿನ ಉಚಿತ · ${d} ದಿನ ಬಾಕಿ`,
    trialNote: "7 ದಿನಗಳ ನಂತರ ಚಂದಾದಾರಿಕೆ ಅಗತ್ಯವಿದೆ",
    vipTitle: "ಆಜೀವ VIP ಸಕ್ರಿಯವಾಗಿದೆ ✓",
    vipSub: "ಎಲ್ಲಾ ಸೇವೆಗಳು ಆಜೀವ ಅನ್‌ಲಾಕ್ ಆಗಿವೆ",
  },
  ml: {
    title: "ശക്തി പഞ്ചാംഗം",
    sub: "SHAKTI PANCHANG",
    enter: "പ്രവേശിക്കുക",
    subscribe: "സബ്‌സ്‌ക്രൈബ് ചെയ്യുക",
    lifetimeIn: "ആജീവനാന്തം · ഇന്ത്യ",
    lifetimeWorld: "Lifetime · World",
    trialExp: "7 ദിവസത്തെ സൗജന്യ ട്രയൽ കഴിഞ്ഞു",
    trialRem: (d) => `7 ദിവസം സൗജന്യം · ${d} ദിവസം ബാക്കി`,
    trialNote: "7 ദിവസത്തിന് ശേഷം സബ്‌സ്‌ക്രിപ്ഷൻ വേണം",
    vipTitle: "ആജീവനാന്ത VIP സജീവമാണ് ✓",
    vipSub: "എല്ലാ സേവനങ്ങളും ആജീവനാന്തം അൺലോക്ക് ചെയ്‌തു",
  },
  pa: {
    title: "ਸ਼ਕਤੀ ਪੰਚਾਂਗ",
    sub: "SHAKTI PANCHANG",
    enter: "ਦਾਖਲ ਹੋਵੋ",
    subscribe: "ਮੈਂਬਰਸ਼ਿਪ ਲਵੋ",
    lifetimeIn: "ਜੀਵਨ ਭਰ · ਭਾਰਤ",
    lifetimeWorld: "Lifetime · World",
    trialExp: "7 ਦਿਨਾਂ ਦਾ ਮੁਫ਼ਤ ਟਰਾਇਲ ਸਮਾਪਤ",
    trialRem: (d) => `7 ਦਿਨ ਮੁਫ਼ਤ · ${d} ਦਿਨ ਬਾਕੀ`,
    trialNote: "7 ਦਿਨਾਂ ਬਾਅਦ ਮੈਂਬਰਸ਼ਿਪ ਤੱਕ ਐਪ ਬੰਦ ਰਹੇਗੀ",
    vipTitle: "ਜੀਵਨ ਭਰ VIP ਸਰਗਰਮ ✓",
    vipSub: "ਸਾਰੀਆਂ ਸੇਵਾਵਾਂ ਜੀਵਨ ਭਰ ਲਈ ਅਨਲੌਕ ਹਨ",
  },
  or: {
    title: "ଶକ୍ତି ପଞ୍ଚାଙ୍ଗ",
    sub: "SHAKTI PANCHANG",
    enter: "ପ୍ରବେଶ କରନ୍ତୁ",
    subscribe: "ସଦସ୍ୟତା ନିଅନ୍ତୁ",
    lifetimeIn: "ଆଜୀବନ · ଭାରତ",
    lifetimeWorld: "Lifetime · World",
    trialExp: "୭ ଦିନର ମାଗଣା ପରୀକ୍ଷଣ ସମାପ୍ତ",
    trialRem: (d) => `୭ ଦିନ ମାଗଣା · ${d} ଦିନ ବାକି`,
    trialNote: "ସାତ ଦିନ ପରେ ସଦସ୍ୟତା ବିନା ଆପ୍ ବନ୍ଦ ରହିବ",
    vipTitle: "ଆଜୀବନ VIP ସକ୍ରିୟ ✓",
    vipSub: "ସମସ୍ତ ସେବା ଆଜୀବନ ଅନ୍‌ଲକ୍ ଅଛି",
  },
};

export function FrontPage({ language, daysRemaining, locked, vipActive, onLanguage, onEnter }: FrontPageProps) {
  useEffect(() => {
    const id = "front-indic-fonts";
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Noto+Sans+Gujarati:wght@600&family=Noto+Sans+Bengali:wght@600&family=Noto+Sans+Tamil:wght@600&family=Noto+Sans+Telugu:wght@600&family=Noto+Sans+Kannada:wght@600&family=Noto+Sans+Malayalam:wght@600&family=Noto+Sans+Gurmukhi:wght@600&family=Noto+Sans+Oriya:wght@600&display=swap";
    document.head.appendChild(link);
  }, []);

  const curLang = FRONT_PAGE_I18N[language] || FRONT_PAGE_I18N.hi;

  return (
    <div
      className="fixed inset-0 z-[80] overflow-y-auto"
      style={{ background: "#3a140c", color: "#fff6e8" }}
    >
      <div className="mx-auto flex min-h-full w-full max-w-md flex-col items-center justify-center px-3.5 py-3 sm:px-5 sm:py-6">
        <div className="w-full rounded-[24px] sm:rounded-[28px] border border-[#d4a84a] px-3.5 py-4 sm:px-5 sm:py-6 text-center">
          <img
            src={omLogo}
            alt={curLang.title}
            className="mx-auto h-28 w-28 sm:h-36 sm:w-36 rounded-3xl object-cover shadow-lg"
          />
          <h1 className="mt-3 font-granth text-3xl sm:text-4xl text-[#ffd682] leading-tight">{curLang.title}</h1>
          <p className="mt-1 text-[11px] sm:text-xs tracking-[0.2em] text-[#e8c496]">{curLang.sub}</p>
          <div className="mx-auto mt-2.5 h-px w-28 bg-[#d4a84a]" />
          <p className="mt-2 text-base sm:text-lg text-[#fff6e8]">Powered by Shiv Shakti</p>

          <div data-no-translate="true" className="mt-3.5 flex flex-wrap justify-center gap-1.5 sm:gap-2">
            {SUPPORTED_LANGUAGES.map((item) => {
              const on = item.code === language;
              return (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => onLanguage(item.code)}
                  className="rounded-full border px-2.5 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm transition cursor-pointer"
                  style={{
                    borderColor: on ? "#ffd682" : "#b4823c",
                    background: on ? "#9a3412" : "#3c1c10",
                    color: "#fff6e8",
                    fontWeight: on ? 700 : 500,
                    transform: on ? "scale(1.04)" : "scale(1)",
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
            className="mt-4 w-full rounded-2xl border-2 border-[#ffd682] bg-[#9a3412] py-3 text-base sm:text-lg font-bold text-[#fff6e8] transition hover:brightness-110 active:scale-[0.99] cursor-pointer shadow-lg"
          >
            {locked ? curLang.subscribe : curLang.enter}
          </button>

          <div className="mt-3.5 grid grid-cols-2 gap-2.5 sm:gap-3">
            <div className="rounded-2xl border border-[#d4a84a]/70 bg-[#2a120a] px-3 py-2.5 sm:py-3.5">
              <div className="text-xl sm:text-2xl font-bold text-[#ffd682]">₹99</div>
              <div className="mt-0.5 text-xs sm:text-sm text-[#fff6e8]">{curLang.lifetimeIn}</div>
            </div>
            <div className="rounded-2xl border border-[#d4a84a]/70 bg-[#2a120a] px-3 py-2.5 sm:py-3.5">
              <div className="text-xl sm:text-2xl font-bold text-[#ffd682]">$1</div>
              <div className="mt-0.5 text-xs sm:text-sm text-[#fff6e8]">{curLang.lifetimeWorld}</div>
            </div>
          </div>

          <p className="mt-3 text-sm sm:text-base font-semibold text-[#ffd682]">
            {vipActive
              ? curLang.vipTitle
              : locked
              ? curLang.trialExp
              : curLang.trialRem(daysRemaining)}
          </p>
          <p className="mt-0.5 text-xs sm:text-sm text-[#e8c496]">
            {vipActive ? curLang.vipSub : curLang.trialNote}
          </p>
        </div>
      </div>
    </div>
  );
}
