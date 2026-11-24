import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  LayoutGrid,
  MapPin,
  Sparkles,
  Sun,
  UserRound,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Languages,
  Palette,
  MoreHorizontal,
  Search,
  X,
  Share2,
  Download,
  CheckCircle2,
  Loader2,
  Scale,
  Flame,
  Clock,
  Heart,
  BookOpen,
  Compass,
  Crown,
  Type,
  Sunrise,
  Sunset,
  Moon,
  Stars,
  History,
} from "lucide-react";
import { BOOK_PAGES, getLocalizedBookPage } from "../constants/bookPages";
import { VedicPanchangData, SavedLocation } from "../types";
import { getSyncedNow } from "../hooks/useUserDateTime";
import { MoonPhaseChart, generateHdMoonPanchangDataUrl } from "./MoonPhaseChart";
import { saveImageNative } from "../lib/device";
import { shareImageFile } from "../lib/shareHelper";
import { trVedic } from "../i18n/vedicTranslate";
import { useLanguage } from "../i18n";
import { triggerHapticSelection } from "../utils/haptics";
import { DailyShlokaCard } from "./DailyShlokaCard";
import { VedicDatePickerModal } from "./VedicDateTimePickerModals";
import { TithiNirnayaModal } from "./TithiNirnayaModal";
import { getDailyFestivalDecision } from "../services/tithiNirnaya";
import { calculateAgnivasa } from "../services/havan";

function clock(d?: Date) {
  if (!d) return "—";
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export const DrawerHostContext = React.createContext<{
  host: HTMLElement | null;
  close: () => void;
}>({ host: null, close: () => {} });

export const TabMenuContext = React.createContext<{
  register: (fn: () => boolean) => () => void;
  go: () => void;
}>({
  register: () => () => {},
  go: () => {},
});

export function useTabMenu(handler: () => boolean) {
  const { register } = useContext(TabMenuContext);
  const latest = useRef(handler);
  latest.current = handler;
  useEffect(() => register(() => latest.current()), [register]);
}

export function BoardMenuButton({
  open,
  onClick,
}: {
  open: boolean;
  onClick: () => void;
}) {
  const { t } = useLanguage();
  return (
    <motion.button
      type="button"
      className="bx-menu-btn cursor-pointer"
      data-open={open ? "true" : "false"}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.92 }}
      transition={{ type: "spring", stiffness: 450, damping: 25 }}
      onClick={() => {
        triggerHapticSelection();
        onClick();
      }}
      aria-expanded={open}
      aria-label={open ? t("common.close", "बंद करें") : t("nav.more", "मेनू")}
    >
      <span className="bx-menu-bars" aria-hidden="true">
        <span />
        <span />
        <span />
      </span>
    </motion.button>
  );
}

export function BoardDrawer({
  title,
  place,
  showBack,
  trialText,
  active,
  appFontSize = "normal",
  vipActive = false,
  onClose,
  onBack,
  onPlace,
  onLanguage,
  onTheme,
  onCycleFontSize,
  onVip,
  onWhatsApp,
  onServices,
  onPanchang,
  onKalnirnay,
  onKundali,
  onBhakti,
  onUma,
  onMore,
  onHost,
}: {
  title: string;
  place: string;
  showBack: boolean;
  trialText: string | null;
  active: string;
  appFontSize?: "normal" | "large" | "xlarge";
  vipActive?: boolean;
  onClose: () => void;
  onBack: () => void;
  onPlace: () => void;
  onLanguage: () => void;
  onTheme: () => void;
  onCycleFontSize?: () => void;
  onVip?: () => void;
  onWhatsApp?: () => void;
  onServices: () => void;
  onPanchang: () => void;
  onKalnirnay?: () => void;
  onKundali: () => void;
  onBhakti?: () => void;
  onUma: () => void;
  onMore: () => void;
  onHost: (el: HTMLDivElement | null) => void;
}) {
  const { t, language } = useLanguage();
  const brand =
    language === "en" ? "Shakti Panchang" :
    language === "gu" ? "શક્તિ પંચાંગ" :
    language === "mr" ? "शक्ती पंचांग" :
    language === "bn" ? "শক্তি পঞ্চাঙ্গ" :
    language === "ta" ? "சக்தி பஞ்சாங்கம்" :
    language === "te" ? "శక్తి పంచాంగం" :
    language === "kn" ? "ಶಕ್ತಿ ಪಂಚಾಂಗ" :
    language === "ml" ? "ശക്തി പഞ്ചാംഗം" :
    language === "pa" ? "ਸ਼ਕਤੀ ਪੰਚਾਂਗ" :
    language === "or" ? "ଶକ୍ତି ପଞ୍ଚାଙ୍ଗ" : "शक्ति पंचांग";

  const fontLabel =
    language === "en"
      ? appFontSize === "xlarge"
        ? "Font: A++"
        : appFontSize === "large"
        ? "Font: A+"
        : "Font: A"
      : language === "gu"
      ? appFontSize === "xlarge"
        ? "અક્ષર: અ++"
        : appFontSize === "large"
        ? "અક્ષર: અ+"
        : "અક્ષર: અ"
      : appFontSize === "xlarge"
      ? "अक्षर: अ++"
      : appFontSize === "large"
      ? "अक्षर: अ+"
      : "अक्षर: अ";

  const items = [
    { id: "panchang", label: language === "en" ? "Today" : language === "gu" ? "આજ" : "आज", icon: Sun, onClick: onPanchang },
    { id: "kalnirnay", label: language === "en" ? "Calendar" : language === "gu" ? "કેલેન્ડર" : "कैलेंडर", icon: Calendar, onClick: onKalnirnay || onServices },
    { id: "kundali", label: t("nav.kundali", "कुण्डली"), icon: UserRound, onClick: onKundali },
    { id: "bhakti_hub", label: language === "en" ? "Bhakti" : language === "gu" ? "ભક્તિ" : "भक्ति", icon: Flame, onClick: onBhakti || onServices },
    { id: "services", label: language === "en" ? "All" : language === "gu" ? "બધી" : "सभी", icon: LayoutGrid, onClick: onServices },
  ];

  return (
    <div className="bx-drawer-back" onClick={onClose}>
      <motion.aside
        initial={{ x: "-100%" }}
        animate={{ x: 0 }}
        exit={{ x: "-100%" }}
        transition={{ type: "spring", stiffness: 380, damping: 32 }}
        className="bx-drawer"
        role="dialog"
        aria-modal="true"
        aria-label={brand}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-2 pb-2 border-b" style={{ borderColor: "var(--bx-line)" }}>
          <div className="min-w-0">
            <div className="text-[15px] font-bold leading-none font-granth">{brand}</div>
            <div className="bx-kicker mt-1 truncate">{title}</div>
          </div>
          <motion.button
            type="button"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.9 }}
            className="bx-iconbtn cursor-pointer"
            onClick={() => {
              triggerHapticSelection();
              onClose();
            }}
            aria-label={t("common.close", "बंद करें")}
          >
            <X className="w-4 h-4" />
          </motion.button>
        </div>

        {showBack && (
          <motion.button
            type="button"
            whileTap={{ scale: 0.97 }}
            className="bx-navbtn w-full mt-3 cursor-pointer"
            onClick={() => {
              triggerHapticSelection();
              onBack();
            }}
          >
            <ChevronLeft className="w-4 h-4" />
            {t("nav.allServices", "सभी सेवाएँ")}
          </motion.button>
        )}

        <motion.button
          type="button"
          whileTap={{ scale: 0.97 }}
          className="bx-navbtn w-full mt-2.5 cursor-pointer justify-between"
          onClick={() => {
            triggerHapticSelection();
            onPlace();
          }}
        >
          <span className="flex items-center gap-2 min-w-0">
            <MapPin className="w-4 h-4 shrink-0" style={{ color: "var(--bx-gold)" }} />
            <span className="truncate">{place}</span>
          </span>
          <span className="text-[11px] font-bold opacity-75 shrink-0">
            {t("more.changeBtn", "बदलें")}
          </span>
        </motion.button>

        {trialText && (
          <div className="bx-kicker mt-2 px-1">{trialText}</div>
        )}

        <nav className="grid grid-cols-5 gap-1 mt-3" aria-label={t("nav.services", "मुख्य")}>
          {items.map((item) => {
            const on =
              active === item.id ||
              (item.id === "kundali" && active === "milan");
            const Icon = item.icon;
            return (
              <motion.button
                key={item.id}
                type="button"
                data-on={on ? "true" : "false"}
                whileTap={{ scale: 0.92 }}
                onClick={() => {
                  triggerHapticSelection();
                  item.onClick();
                }}
                className="bx-drawer-nav cursor-pointer"
              >
                <span className="bx-tile-icon w-7 h-7">
                  <Icon className="w-3.5 h-3.5" />
                </span>
                <span className="truncate max-w-full">{item.label}</span>
              </motion.button>
            );
          })}
        </nav>

        {/* Display & Preferences Controls */}
        <div className="grid grid-cols-2 gap-2 mt-3">
          <motion.button
            type="button"
            whileTap={{ scale: 0.96 }}
            className="bx-navbtn cursor-pointer"
            onClick={() => {
              triggerHapticSelection();
              onTheme();
            }}
          >
            <Palette className="w-4 h-4" />
            {t("common.theme", "थीम")}
          </motion.button>
          <motion.button
            type="button"
            whileTap={{ scale: 0.96 }}
            className="bx-navbtn cursor-pointer"
            onClick={() => {
              triggerHapticSelection();
              onLanguage();
            }}
          >
            <Languages className="w-4 h-4" />
            {t("common.language", "भाषा")}
          </motion.button>
          {onCycleFontSize && (
            <motion.button
              type="button"
              whileTap={{ scale: 0.96 }}
              className="bx-navbtn cursor-pointer"
              onClick={() => {
                triggerHapticSelection();
                onCycleFontSize();
              }}
            >
              <Type className="w-4 h-4" />
              {fontLabel}
            </motion.button>
          )}
          <motion.button
            type="button"
            whileTap={{ scale: 0.96 }}
            className="bx-navbtn cursor-pointer"
            onClick={() => {
              triggerHapticSelection();
              onMore();
            }}
          >
            <MoreHorizontal className="w-4 h-4" />
            {t("common.settings", "सेटिंग्स")}
          </motion.button>
        </div>

        {/* Quick Actions: WhatsApp Card, Uma AI & VIP */}
        <div className="space-y-2 mt-3">
          {onWhatsApp && (
            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              className="bx-navbtn w-full cursor-pointer"
              onClick={() => {
                triggerHapticSelection();
                onWhatsApp();
              }}
            >
              <Share2 className="w-4 h-4 text-emerald-600" />
              <span>{t("more.whatsappCardTitle", "व्हाट्सएप सुप्रभात कार्ड")}</span>
            </motion.button>
          )}
          <motion.button
            type="button"
            whileTap={{ scale: 0.97 }}
            className="bx-navbtn w-full cursor-pointer"
            onClick={() => {
              triggerHapticSelection();
              onUma();
            }}
          >
            <Sparkles className="w-4 h-4" style={{ color: "var(--bx-gold)" }} />
            <span>{t("more.umaCardTitle", "उमा वैदिक दैवज्ञ परामर्श")}</span>
          </motion.button>
          {onVip && (
            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              className={`bx-navbtn w-full cursor-pointer ${!vipActive ? "bx-navbtn-solid" : ""}`}
              onClick={() => {
                triggerHapticSelection();
                onVip();
              }}
            >
              <Crown className="w-4 h-4" style={{ color: vipActive ? "var(--bx-gold)" : "#FFD88A" }} />
              <span>
                {vipActive
                  ? language === "en"
                    ? "Lifetime VIP Active ✓"
                    : language === "gu"
                    ? "આજીવન VIP સક્રિય ✓"
                    : "आजीवन VIP सक्रिय ✓"
                  : language === "en"
                  ? "Unlock Lifetime VIP (₹99 / $1)"
                  : language === "gu"
                  ? "આજીવન VIP ખરીદો (₹99 / $1)"
                  : "आजीवन VIP खरीदें (₹99 / $1)"}
              </span>
            </motion.button>
          )}
        </div>

        <div ref={onHost} className="mt-3 empty:hidden" />
      </motion.aside>
    </div>
  );
}

export function BoardHeader({
  title,
  place,
  dateLabel,
  showBack,
  onBack,
  onPlace,
  onLanguage,
  onTheme,
}: {
  title: string;
  place: string;
  dateLabel: string;
  showBack: boolean;
  onBack: () => void;
  onPlace: () => void;
  onLanguage: () => void;
  onTheme: () => void;
}) {
  const { t, language } = useLanguage();
  const brand = language === "en" ? "Shakti" : language === "gu" ? "શક્તિ" : "शक्ति";
  return (
    <header className="bx-head shrink-0 z-40 flex items-center gap-1.5 px-2.5">
      {showBack ? (
        <button
          type="button"
          onClick={() => {
            triggerHapticSelection();
            onBack();
          }}
          className="bx-head-btn shrink-0"
          aria-label={t("nav.allServices", "सभी सेवाएँ")}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      ) : (
        <div className="min-w-0 shrink-0 max-w-[34%]">
          <div className="text-[15px] font-semibold leading-none">{brand}</div>
          <div className="bx-kicker mt-1 truncate">{dateLabel}</div>
        </div>
      )}
      <div className="flex-1 min-w-0 text-center px-1">
        <div className="text-[15px] font-semibold truncate">{showBack ? title : t("nav.allServices", "सभी सेवाएँ")}</div>
      </div>
      <button
        type="button"
        onClick={() => {
          triggerHapticSelection();
          onPlace();
        }}
        className="bx-head-btn max-w-[32%] min-w-0 shrink"
      >
        <MapPin className="w-3.5 h-3.5 shrink-0" />
        <span className="truncate">{place}</span>
      </button>
      <button
        type="button"
        onClick={() => {
          triggerHapticSelection();
          onTheme();
        }}
        className="bx-head-btn shrink-0"
        aria-label={t("common.theme", "थीम")}
        title={t("common.theme", "थीम")}
      >
        <Palette className="w-3.5 h-3.5" />
        <span className="text-[11px] font-semibold">{t("common.theme", "थीम")}</span>
      </button>
      <button
        type="button"
        onClick={() => {
          triggerHapticSelection();
          onLanguage();
        }}
        className="bx-head-btn shrink-0"
        aria-label={t("common.language", "भाषा")}
        title={t("common.changeLanguage", "भाषा बदलें")}
      >
        <Languages className="w-3.5 h-3.5" />
        <span className="text-[11px] font-semibold">{t("common.language", "भाषा")}</span>
      </button>
    </header>
  );
}

const JYOTISH_CHILD_TABS = new Set([
  "kundali",
  "milan",
  "prashna",
  "sadesati",
  "gochar",
  "rashifal",
  "numerology",
  "palmistry",
  "tarot",
  "gemology",
  "face_reading",
  "iching",
]);

const BHAKTI_CHILD_TABS = new Set([
  "bhakti_hub",
  "durga",
  "hanuman",
  "sundarkand",
  "vishnu_sahasranama",
  "granth_puran",
  "gita",
  "vratkatha",
  "audio_player",
  "havan",
  "devta_arpan",
  "shiv_tantra",
  "lal_kitab",
  "upay",
  "ravan_sanhita",
  "saral",
  "shastrokt",
  "sabar",
  "jain_mantras",
  "vastu",
  "reminders",
]);

export function BoardDock({
  active,
  onPanchang,
  onKalnirnay,
  onKundali,
  onBhakti,
  onServices,
}: {
  active: string;
  onPanchang: () => void;
  onKalnirnay: () => void;
  onKundali: () => void;
  onBhakti: () => void;
  onServices: () => void;
}) {
  const { language } = useLanguage();
  const labels = {
    panchang:
      language === "en" ? "Today" :
      language === "gu" ? "આજ" :
      language === "mr" ? "आज" :
      language === "bn" ? "আজ" :
      language === "ta" ? "இன்று" :
      language === "te" ? "ఈరోజు" :
      language === "kn" ? "ಇಂದು" :
      language === "ml" ? "ഇന്ന്" :
      language === "pa" ? "ਅੱਜ" :
      language === "or" ? "ଆଜି" : "आज",
    kalnirnay:
      language === "en" ? "Calendar" :
      language === "gu" ? "કેલેન્ડર" :
      language === "mr" ? "कॅलेंडर" :
      language === "bn" ? "ক্যালেন্ডার" :
      language === "ta" ? "நாட்காட்டி" :
      language === "te" ? "క్యాలెండర్" :
      language === "kn" ? "ಕ್ಯಾಲೆಂಡರ್" :
      language === "ml" ? "കലണ്ടർ" :
      language === "pa" ? "ਕੈਲੰਡਰ" :
      language === "or" ? "କ୍ୟାଲେଣ୍ଡର" : "कैलेंडर",
    kundali:
      language === "en" ? "Kundali" :
      language === "gu" ? "કુંડળી" :
      language === "mr" ? "कुंडली" :
      language === "bn" ? "কোষ্ঠী" :
      language === "ta" ? "ஜாதகம்" :
      language === "te" ? "కుండలి" :
      language === "kn" ? "ಕುಂಡಲಿ" :
      language === "ml" ? "ജാതകം" :
      language === "pa" ? "ਕੁੰਡਲੀ" :
      language === "or" ? "କୁଣ୍ଡଳୀ" : "कुंडली",
    bhakti:
      language === "en" ? "Bhakti" :
      language === "gu" ? "ભક્તિ" :
      language === "mr" ? "भक्ती" :
      language === "bn" ? "ভক্তি" :
      language === "ta" ? "பக்தி" :
      language === "te" ? "భక్తి" :
      language === "kn" ? "ಭಕ್ತಿ" :
      language === "ml" ? "ഭക്തി" :
      language === "pa" ? "ਭਗਤੀ" :
      language === "or" ? "ଭକ୍ତି" : "भक्ति",
    services:
      language === "en" ? "All" :
      language === "gu" ? "બધી" :
      language === "mr" ? "सर्व" :
      language === "bn" ? "সব সেবা" :
      language === "ta" ? "அனைத்தும்" :
      language === "te" ? "అన్నీ" :
      language === "kn" ? "ಎಲ್ಲಾ" :
      language === "ml" ? "എല്ലാം" :
      language === "pa" ? "ਸਭ" :
      language === "or" ? "ସବୁ" : "सभी",
  };

  const items = [
    {
      id: "panchang",
      label: labels.panchang,
      icon: Sun,
      onClick: onPanchang,
      isOn: active === "panchang" || active === "dashboard",
    },
    {
      id: "kalnirnay",
      label: labels.kalnirnay,
      icon: Calendar,
      onClick: onKalnirnay,
      isOn: active === "kalnirnay" || active === "festivals",
    },
    {
      id: "kundali",
      label: labels.kundali,
      icon: UserRound,
      onClick: onKundali,
      isOn: JYOTISH_CHILD_TABS.has(active),
    },
    {
      id: "bhakti_hub",
      label: labels.bhakti,
      icon: Flame,
      onClick: onBhakti,
      isOn: BHAKTI_CHILD_TABS.has(active),
    },
    {
      id: "services",
      label: labels.services,
      icon: LayoutGrid,
      onClick: onServices,
      isOn:
        active === "services" ||
        active === "index" ||
        active === "choghadiya" ||
        active === "muhurat" ||
        active === "yatra",
    },
  ];

  return (
    <nav className="bx-dock shrink-0 z-40 grid grid-cols-5" aria-label={labels.services}>
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            type="button"
            data-on={item.isOn ? "true" : "false"}
            aria-current={item.isOn ? "page" : undefined}
            onClick={() => {
              triggerHapticSelection();
              item.onClick();
            }}
            className="flex flex-col items-center justify-center gap-0.5 text-[10.5px] leading-tight min-w-0 px-0.5 cursor-pointer select-none"
          >
            <span className="bx-tile-icon flex items-center justify-center">
              <Icon className="w-[18px] h-[18px]" strokeWidth={item.isOn ? 2.3 : 1.9} />
            </span>
            <span className="truncate max-w-full">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

const SERVICE_GROUPS: { key: string; title: Record<string, string>; ids: string[] }[] = [
  {
    key: "today",
    title: {
      hi: "आज व पंचांग",
      en: "Today & Panchang",
      gu: "આજ અને પંચાંગ",
      mr: "आज व पंचांग",
      bn: "আজ ও পঞ্চাঙ্গ",
      ta: "இன்று & பஞ்சாங்கம்",
      te: "ఈరోజు & పంచాంగం",
      kn: "ಇಂದು & ಪಂಚಾಂಗ",
      ml: "ഇന്ന് & പഞ്ചാംഗം",
      pa: "ਅੱਜ ਅਤੇ ਪੰਚਾਂਗ",
      or: "ଆଜି ଓ ପଞ୍ଚାଙ୍ଗ",
    },
    ids: ["panchang", "havan", "kalnirnay", "choghadiya", "muhurat", "festivals", "yatra", "gochar", "rashifal"],
  },
  {
    key: "jyotish",
    title: {
      hi: "ज्योतिष व उपाय",
      en: "Astrology & Remedies",
      gu: "જ્યોતિષ અને ઉપાય",
      mr: "ज्योतिष व उपाय",
      bn: "জ্যোতিষ ও প্রতিকার",
      ta: "ஜோதிடம் & பரிகாரம்",
      te: "జ్యోతిష్యం & పరిహారాలు",
      kn: "ಜ್ಯೋತಿಷ್ಯ & ಪರಿಹಾರ",
      ml: "ജ്യോതിഷവും പരിഹാരങ്ങളും",
      pa: "ਜੋਤਿਸ਼ ਅਤੇ ਉਪਾਅ",
      or: "ଜ୍ୟୋତିଷ ଓ ପ୍ରତିକାର",
    },
    ids: ["kundali", "milan", "prashna", "sadesati", "lal_kitab", "ravan_sanhita", "saral", "shastrokt", "sabar", "numerology", "gemology", "jain_mantras"],
  },
  {
    key: "bhakti",
    title: {
      hi: "शास्त्र और पाठ",
      en: "Scriptures & Stotram",
      gu: "શાસ્ત્ર અને પાઠ",
      mr: "शास्त्र आणि पाठ",
      bn: "শাস্ত্র ও স্তোত্র পাঠ",
      ta: "சாஸ்திரங்கள் & ஸ்தோத்திரங்கள்",
      te: "శాస్త్రాలు & స్తోత్రాలు",
      kn: "ಶಾಸ್ತ್ರ ಮತ್ತು ಸ್ತೋತ್ರಗಳು",
      ml: "ശാസ്ത്രങ്ങളും സ്തോത്രങ്ങളും",
      pa: "ਸ਼ਾਸਤਰ ਅਤੇ ਪਾਠ",
      or: "ଶାସ୍ତ୍ର ଓ ସ୍ତୋତ୍ର ପାଠ",
    },
    ids: ["japamala", "durga", "hanuman", "sundarkand", "vishnu_sahasranama", "granth_puran", "gita", "vratkatha", "audio_player", "devta_arpan", "shiv_tantra", "vastu", "reminders"],
  },
  {
    key: "darshan",
    title: {
      hi: "दर्शन व विद्या",
      en: "Mystic Readings",
      gu: "દર્શન અને વિદ્યા",
      mr: "दर्शन व विद्या",
      bn: "দিব্য দর্শন",
      ta: "ஜோதிட வாசிப்பு",
      te: "దివ్య దర్శనం",
      kn: "ದರ್ಶನ",
      ml: "ദർശനം",
      pa: "ਦਰਸ਼ਨ",
      or: "ଦର୍ଶନ",
    },
    ids: ["palmistry", "tarot", "face_reading", "iching"],
  },
];

const BHAKTI_SEGMENTS: { key: string; title: Record<string, string>; ids: string[] }[] = [
  {
    key: "path",
    title: {
      hi: "पाठ व स्तोत्र",
      en: "Stotram & Path",
      gu: "પાઠ અને સ્તોત્ર",
      mr: "पाठ व स्तोत्र",
    },
    ids: ["durga", "hanuman", "sundarkand", "vishnu_sahasranama", "granth_puran", "gita", "vratkatha", "audio_player"],
  },
  {
    key: "upay",
    title: {
      hi: "उपाय व मंत्र",
      en: "Remedies & Mantras",
      gu: "ઉપાય અને મંત્ર",
      mr: "उपाय व मंत्र",
    },
    ids: ["lal_kitab", "ravan_sanhita", "saral", "shastrokt", "sabar", "jain_mantras"],
  },
  {
    key: "sadhana",
    title: {
      hi: "साधना व हवन",
      en: "Sadhana & Havan",
      gu: "સાધના અને હવન",
      mr: "साधना व हवन",
    },
    ids: ["japamala", "havan", "devta_arpan", "shiv_tantra", "vastu", "reminders"],
  },
];

const SEARCH_HINTS: Record<string, string> = {
  hi: "सेवा खोजें (जैसे कुंडली, हवन, दुर्गा...)",
  en: "Search 40+ services (Kundali, Havan, Gita...)",
  gu: "સેવા શોધો (કુંડળી, હવન, દુર્ગા...)",
  mr: "सेवा शोधा (कुंडली, हवन, दुर्गा...)",
  bn: "সেবা খুঁজুন",
  ta: "சேவையைத் தேடுங்கள்",
  te: "సేవను వెతకండి",
  kn: "ಸೇವೆಯನ್ನು ಹುಡುಕಿ",
  ml: "സേവനം തിരയുക",
  pa: "ਸੇਵਾ ਖੋਜੋ",
  or: "ସେବା ଖୋଜନ୍ତୁ",
};

const NO_MATCH_MESSAGES: Record<string, string> = {
  hi: "कोई सेवा इस नाम से नहीं मिली।",
  en: "No service matches that name.",
  gu: "આ નામની સેવા મળી નથી.",
  mr: "या नावाची कोणतीही सेवा आढळली नाही.",
  bn: "এই নামের কোনও পরিষেবা পাওয়া যায়নি।",
  ta: "இந்த பெயரில் எந்த சேவையும் கிடைக்கவில்லை.",
  te: "ఈ పేరుతో ఎటువంటి సేవ కనుగొనబడలేదు.",
  kn: "ಈ ಹೆಸರಿನ ಯಾವುದೇ ಸೇವೆ ಕಂಡುಬಂದಿಲ್ಲ.",
  ml: "ഈ പേരിൽ ഒരു സേവനവും കണ്ടെത്തിയില്ല.",
  pa: "ਇਸ ਨਾਮ ਦੀ ਕੋਈ ਸੇਵਾ ਨਹੀਂ ਮਿਲੀ।",
  or: "ଏହି ନାମରେ କୌଣସି ସେବା ମିଳିଲା ନାହିଁ।",
};

function groupTitle(title: Record<string, string>, language: string) {
  return title[language] || title.hi;
}

export function BhaktiHubBoard({
  language,
  onOpen,
}: {
  language: string;
  onOpen: (id: string) => void;
}) {
  const [segment, setSegment] = useState<string>("all");
  const pages = useMemo(
    () => BOOK_PAGES.map((page) => getLocalizedBookPage(page, language)),
    [language]
  );
  const byId = useMemo(() => new Map(pages.map((p) => [p.id, p])), [pages]);

  const allLabel =
    language === "en" ? "All" : language === "gu" ? "બધા" : language === "mr" ? "सर्व" : "सभी";
  const heading =
    language === "en"
      ? "Bhakti, Scriptures & Remedies"
      : language === "gu"
      ? "ભક્તિ, શાસ્ત્ર પાઠ અને ઉપાય"
      : "भक्ति, शास्त्र पाठ व सिद्ध उपाय";
  const subtitle =
    language === "en"
      ? "Stotrams, Nitya Havan, 108 Japa Mala, Lal Kitab & Mantras in one place"
      : language === "gu"
      ? "સ્તોત્ર પાઠ, નિત્ય હવન, ૧૦૮ જપ માળા, લાલ કિતાબ અને સિદ્ધ મંત્ર"
      : "संपूर्ण स्तोत्र-पाठ, नित्य हवन, १०८ जप माला, लाल किताब व सिद्ध मंत्र";

  const visibleSegments =
    segment === "all"
      ? BHAKTI_SEGMENTS
      : BHAKTI_SEGMENTS.filter((s) => s.key === segment);

  return (
    <div className="flex-1 min-h-0 flex flex-col bx-home">
      {/* Compact Header & Segmented Filter Tabs */}
      <div className="shrink-0 px-3 pt-3 pb-2 space-y-2.5 border-b" style={{ borderColor: "var(--bx-line)" }}>
        <div>
          <h2 className="font-granth font-bold text-lg leading-tight" style={{ color: "var(--bx-header)" }}>
            {heading}
          </h2>
          <p className="text-xs mt-0.5 opacity-80" style={{ color: "var(--bx-mute)" }}>
            {subtitle}
          </p>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
          {[
            { key: "all", label: allLabel },
            ...BHAKTI_SEGMENTS.map((s) => ({
              key: s.key,
              label: groupTitle(s.title, language),
            })),
          ].map((tab) => {
            const active = segment === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  triggerHapticSelection();
                  setSegment(tab.key);
                }}
                style={{
                  backgroundColor: active ? "var(--bx-header)" : "var(--bx-panel)",
                  color: active ? "#FFFFFF" : "var(--bx-ink)",
                  borderColor: active ? "var(--bx-gold)" : "var(--bx-line)",
                }}
                className="px-3 py-1.5 rounded-xl border text-xs font-bold whitespace-nowrap shrink-0 cursor-pointer transition active:scale-95"
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Smooth Native Vertical Scroll */}
      <div
        className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-3 pt-3 pb-8 space-y-5"
        style={{ WebkitOverflowScrolling: "touch", touchAction: "pan-y" }}
      >
        {visibleSegments.map((sec) => {
          const secPages = sec.ids
            .map((id) => byId.get(id))
            .filter((p): p is NonNullable<typeof p> => !!p);
          if (!secPages.length) return null;

          return (
            <section key={sec.key} className="space-y-2">
              <div className="flex items-center justify-between px-0.5">
                <h3
                  className="text-xs font-bold uppercase tracking-wider"
                  style={{ color: "var(--bx-mute)" }}
                >
                  {groupTitle(sec.title, language)}
                </h3>
                <span className="text-[11px] font-semibold opacity-70 tabular-nums" style={{ color: "var(--bx-mute)" }}>
                  {secPages.length}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
                {secPages.map((page) => {
                  const Icon = page.icon;
                  return (
                    <button
                      key={page.id}
                      type="button"
                      className="bx-tile bx-glass cursor-pointer text-left"
                      onClick={() => {
                        triggerHapticSelection();
                        onOpen(page.id);
                      }}
                    >
                      <span className="bx-tile-icon">
                        <Icon className="w-4 h-4" />
                      </span>
                      <span className="min-w-0">
                        <strong className="truncate block">{page.label}</strong>
                        <p className="line-clamp-2">{page.desc}</p>
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

export function ModuleBoard({
  language,
  recentIds = [],
  onOpen,
}: {
  language: string;
  recentIds?: string[];
  onOpen: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const pages = useMemo(
    () => BOOK_PAGES.map((page) => getLocalizedBookPage(page, language)),
    [language]
  );
  const byId = useMemo(() => new Map(pages.map((page) => [page.id, page])), [pages]);
  const q = query.trim().toLowerCase();
  const searchHint = SEARCH_HINTS[language] || SEARCH_HINTS.hi;

  const rank = (page: { label: string; title: string; desc: string }) => {
    const label = page.label.toLowerCase();
    const title = page.title.toLowerCase();
    if (label === q || label.startsWith(q)) return 0;
    if (label.includes(q)) return 1;
    if (title.includes(q)) return 2;
    return 3;
  };

  const matches = (page: { label: string; title: string; desc: string }) =>
    !q || `${page.label} ${page.title} ${page.desc}`.toLowerCase().includes(q);

  const recentPages = useMemo(
    () =>
      recentIds
        .map((id) => byId.get(id))
        .filter((p): p is NonNullable<typeof p> => !!p)
        .slice(0, 6),
    [recentIds, byId]
  );

  let sections = SERVICE_GROUPS.map((group) => ({
    key: group.key,
    title: groupTitle(group.title, language),
    pages: group.ids
      .map((id) => byId.get(id))
      .filter((page): page is NonNullable<typeof page> => !!page)
      .filter(matches),
  })).filter((group) => group.pages.length > 0);

  const used = new Set([...SERVICE_GROUPS.flatMap((group) => group.ids), "upay"]);
  const extra = pages.filter((page) => !used.has(page.id) && matches(page));
  if (extra.length) {
    sections.push({
      key: "more",
      title: language === "en" ? "More" : language === "gu" ? "વધુ" : language === "mr" ? "अधिक" : "अन्य सेवाएँ",
      pages: extra,
    });
  }

  if (q) {
    const hits = sections
      .flatMap((section) => section.pages)
      .sort((a, b) => rank(a) - rank(b));
    sections = hits.length ? [{ key: "search", title: searchHint, pages: hits }] : [];
  } else if (activeCategory !== "all") {
    sections = sections.filter((s) => s.key === activeCategory);
  }

  const allTabLabel =
    language === "en" ? "All" : language === "gu" ? "બધી" : language === "mr" ? "सर्व" : "सभी";
  const recentLabel =
    language === "en"
      ? "Recently Opened"
      : language === "gu"
      ? "તાજેતરમાં ખોલેલ"
      : "हाल ही में खोले गए";

  return (
    <div className="flex-1 min-h-0 flex flex-col bx-home">
      {/* Sticky Search + Category Filter Tabs */}
      <div className="shrink-0 px-3 pt-3 pb-2 space-y-2 border-b" style={{ borderColor: "var(--bx-line)" }}>
        <label className="bx-search relative block">
          <Search className="bx-search-icon" aria-hidden="true" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={searchHint}
            aria-label={searchHint}
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-full opacity-70 hover:opacity-100 cursor-pointer"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </label>

        {!q && (
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
            {[
              { key: "all", label: `${allTabLabel} (${pages.length - 1})` },
              ...SERVICE_GROUPS.map((g) => ({
                key: g.key,
                label: groupTitle(g.title, language),
              })),
            ].map((tab) => {
              const active = activeCategory === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => {
                    triggerHapticSelection();
                    setActiveCategory(tab.key);
                  }}
                  style={{
                    backgroundColor: active ? "var(--bx-header)" : "var(--bx-panel)",
                    color: active ? "#FFFFFF" : "var(--bx-ink)",
                    borderColor: active ? "var(--bx-gold)" : "var(--bx-line)",
                  }}
                  className="px-3 py-1.5 rounded-xl border text-xs font-bold whitespace-nowrap shrink-0 cursor-pointer transition active:scale-95"
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Smooth Vertical Scrolling Content (No ZeroScrollPager Pagination) */}
      <div
        className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-3 pt-3 pb-8 space-y-5"
        style={{ WebkitOverflowScrolling: "touch", touchAction: "pan-y" }}
      >
        {/* Recently Opened Horizontal Strip */}
        {!q && activeCategory === "all" && recentPages.length > 0 && (
          <section className="space-y-2">
            <div className="flex items-center gap-1.5 px-0.5">
              <History className="w-3.5 h-3.5" style={{ color: "var(--bx-gold)" }} />
              <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--bx-mute)" }}>
                {recentLabel}
              </h3>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              {recentPages.map((page) => {
                const Icon = page.icon;
                return (
                  <button
                    key={`recent-${page.id}`}
                    type="button"
                    onClick={() => {
                      triggerHapticSelection();
                      onOpen(page.id);
                    }}
                    style={{
                      backgroundColor: "var(--bx-panel)",
                      borderColor: "var(--bx-line)",
                      color: "var(--bx-ink)",
                    }}
                    className="shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold cursor-pointer active:scale-95 transition"
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: "var(--bx-mark)" }} />
                    <span className="whitespace-nowrap">{page.label}</span>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {sections.length === 0 && (
          <div className="bx-fact text-sm text-center py-6">
            {NO_MATCH_MESSAGES[language] || NO_MATCH_MESSAGES.hi}
          </div>
        )}

        {sections.map((section) => (
          <section key={section.key} className="space-y-2">
            <div className="flex items-center justify-between px-0.5">
              <h3
                className="text-xs font-bold uppercase tracking-wider"
                style={{ color: "var(--bx-mute)" }}
              >
                {section.title}
              </h3>
              <span className="text-[11px] font-semibold opacity-70 tabular-nums" style={{ color: "var(--bx-mute)" }}>
                {section.pages.length}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
              {section.pages.map((page) => {
                const Icon = page.icon;
                return (
                  <button
                    key={page.id}
                    type="button"
                    className="bx-tile bx-glass cursor-pointer text-left"
                    onClick={() => {
                      triggerHapticSelection();
                      onOpen(page.id);
                    }}
                  >
                    <span className="bx-tile-icon">
                      <Icon className="w-4 h-4" />
                    </span>
                    <span className="min-w-0">
                      <strong className="truncate block">{page.label}</strong>
                      <p className="line-clamp-2">{page.desc}</p>
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

export function TodayBoard({
  panchang,
  place,
  currentDate,
  onDateChange,
  onPlace,
  onWhatsApp,
  onOpen,
}: {
  panchang: VedicPanchangData | null;
  place: SavedLocation;
  currentDate?: Date;
  onDateChange?: (d: Date) => void;
  onPlace?: () => void;
  onWhatsApp: () => void;
  onOpen: (id: string) => void;
}) {
  const { t, language } = useLanguage();
  const [isSavingHd, setIsSavingHd] = useState(false);
  const [isSharingHd, setIsSharingHd] = useState(false);
  const [hdNotice, setHdNotice] = useState<string | null>(null);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isTithiNirnayaOpen, setIsTithiNirnayaOpen] = useState(false);

  if (!panchang) {
    return <div className="p-4 text-sm">{t("common.loading", "पंचांग गणना हो रही है।")}</div>;
  }

  const activeDate = currentDate || panchang.date || getSyncedNow();
  const dateLocale = language === "en" ? "en-US" : language === "gu" ? "gu-IN" : "hi-IN";
  const formattedDate = activeDate.toLocaleDateString(dateLocale, {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const handlePrevDay = () => {
    triggerHapticSelection();
    if (!onDateChange) return;
    const prev = new Date(activeDate);
    prev.setDate(prev.getDate() - 1);
    onDateChange(prev);
  };

  const handleNextDay = () => {
    triggerHapticSelection();
    if (!onDateChange) return;
    const next = new Date(activeDate);
    next.setDate(next.getDate() + 1);
    onDateChange(next);
  };

  const handleTodayReset = () => {
    triggerHapticSelection();
    if (!onDateChange) return;
    onDateChange(getSyncedNow());
  };

  const placeLabelKey = t("kundali.place", "स्थान");
  const dailyDecision = getDailyFestivalDecision(activeDate, panchang, language);
  const dailyAgnivasa = calculateAgnivasa(panchang, language);

  const formatPlaceDisplay = (name: string, lang: string): string => {
    if (!name) return "";
    if (lang === "en") {
      const match = name.match(/\(([^)]+)\)/);
      if (match && match[1]) {
        const flagMatch = name.match(/^(\p{Emoji}|\p{Extended_Pictographic}|\S+)\s+/u);
        const flag = flagMatch && !flagMatch[0].match(/[\u0900-\u097F]/) ? flagMatch[0] : "";
        return `${flag}${match[1]}`.trim();
      }
    }
    return name;
  };

  const masaDisplay =
    panchang.masa === "अश्विन"
      ? `${trVedic(panchang.masa, language)} (${language === "en" ? "Amanta / Purnimanta: Kartika" : language === "gu" ? "આસો / અમાન્ત" : "अमान्त / पूर्णिमान्त: कार्तिक"})`
      : trVedic(panchang.masa, language);

  const facts: [string, string][] = [
    [t("panchang.tithi", "तिथि"), trVedic(panchang.tithi, language)],
    [t("panchang.paksha", "पक्ष"), trVedic(panchang.paksha, language)],
    [t("panchang.nakshatra", "नक्षत्र"), `${trVedic(panchang.nakshatra, language)} · ${language === "en" ? "Charan" : language === "gu" ? "ચરણ" : "चरण"} ${panchang.pada}`],
    [t("panchang.yoga", "योग"), trVedic(panchang.yoga, language)],
    [t("panchang.karana", "करण"), trVedic(panchang.karana, language)],
    [t("panchang.weekday", "वार"), trVedic(panchang.weekday, language)],
    [t("panchang.shareMasaPaksha", "मास"), masaDisplay],
    [t("panchang.samvat", "संवत्"), trVedic(panchang.samvat, language)],
    [t("panchang.shakaSamvat", "शक"), trVedic(panchang.sakaSamvat, language)],
    [t("panchang.sunrise", "सूर्योदय"), clock(panchang.solar.sunrise)],
    [t("panchang.solarNoon", "मध्याह्न"), clock(panchang.solar.solarNoon)],
    [t("panchang.sunset", "सूर्यास्त"), clock(panchang.solar.sunset)],
    [t("panchang.sunSign", "सूर्य राशि"), trVedic(panchang.solarRashi, language)],
    [t("panchang.moonSign", "चंद्र राशि"), trVedic(panchang.lunarRashi, language)],
    [t("panchang.ayanamsha", "अयनांश"), `${trVedic(panchang.ayanamshaName, language)} · ${panchang.ayanamsha.toFixed(2)}°`],
    [placeLabelKey, formatPlaceDisplay(place.name, language)],
  ];

  // Super-App 4x2 Quick Shortcuts Grid
  const quickShortcuts = [
    {
      id: "kundali",
      label: language === "en" ? "Kundali" : language === "gu" ? "કુંડળી" : "कुंडली",
      icon: UserRound,
    },
    {
      id: "milan",
      label: language === "en" ? "Match" : language === "gu" ? "મિલાન" : "मिलान",
      icon: Heart,
    },
    {
      id: "choghadiya",
      label: language === "en" ? "Choghadiya" : language === "gu" ? "ચોઘડિયા" : "चौघड़िया",
      icon: Clock,
    },
    {
      id: "muhurat",
      label: language === "en" ? "Muhurat" : language === "gu" ? "મુહૂર્ત" : "मुहूर्त",
      icon: Compass,
    },
    {
      id: "festivals",
      label: language === "en" ? "Festivals" : language === "gu" ? "વ્રત-તહેવાર" : "व्रत-त्योहार",
      icon: Calendar,
    },
    {
      id: "rashifal",
      label: language === "en" ? "Rashifal" : language === "gu" ? "રાશિફળ" : "राशिफल",
      icon: Stars,
    },
    {
      id: "japamala",
      label: language === "en" ? "Japa Mala" : language === "gu" ? "જપ માળા" : "जप माला",
      icon: Sparkles,
    },
    {
      id: "services",
      label: language === "en" ? "All 40+" : language === "gu" ? "બધી સેવા" : "सभी सेवाएँ",
      icon: LayoutGrid,
    },
  ];

  const handleSaveHd = async () => {
    triggerHapticSelection();
    if (isSavingHd) return;
    setIsSavingHd(true);
    setHdNotice(null);
    try {
      const dataUrl = await generateHdMoonPanchangDataUrl(panchang, place.name);
      const slug = (panchang.solar.sunrise || new Date()).toISOString().slice(0, 10);
      await saveImageNative(dataUrl, `shakti-panchang-hd-${slug}.png`);
      setHdNotice(
        language === "en"
          ? "✓ Full HD (1080p) Panchang image saved!"
          : language === "gu"
          ? "✓ ફુલ એચડી (1080p) પંચાંગ ચિત્ર સેવ થઈ ગયું!"
          : "✓ Full HD (1080p) पंचांग चित्र सेव हो गया!"
      );
      setTimeout(() => setHdNotice(null), 4000);
    } catch {
      setHdNotice(
        language === "en"
          ? "Error saving HD image, please try again."
          : language === "gu"
          ? "HD સેવ કરવામાં ક્ષતિ આવી, પુનઃ પ્રયાસ કરો."
          : "HD सेव करने में त्रुटि हुई, पुनः प्रयास करें।"
      );
    } finally {
      setIsSavingHd(false);
    }
  };

  const handleShareHd = async () => {
    triggerHapticSelection();
    if (isSharingHd) return;
    setIsSharingHd(true);
    setHdNotice(null);
    try {
      const dataUrl = await generateHdMoonPanchangDataUrl(panchang, place.name);
      const slug = (panchang.solar.sunrise || new Date()).toISOString().slice(0, 10);
      const shareTitle =
        language === "en"
          ? `🕉️ *Today's Vedic Panchang & Lunar Phase (${place.name})*`
          : language === "gu"
          ? `🕉️ *આજનું વૈદિક પંચાંગ અને ચંદ્ર કળા (${place.name})*`
          : `🕉️ *आज का वैदिक पंचांग एवं चन्द्र कला (${place.name})*`;
      const shareText = [
        shareTitle,
        `• ${t("panchang.tithi", "तिथि")}: ${trVedic(panchang.paksha, language)} ${trVedic(panchang.tithi, language)}`,
        `• ${t("panchang.nakshatra", "नक्षत्र")}: ${trVedic(panchang.nakshatra, language)} (${language === "en" ? "Charan" : "चरण"} ${panchang.pada})`,
        `• ${t("panchang.yoga", "योग")}: ${trVedic(panchang.yoga, language)} | ${t("panchang.karana", "करण")}: ${trVedic(panchang.karana, language)}`,
        `• ${t("panchang.weekday", "वार")}: ${trVedic(panchang.weekday, language)} | ${t("panchang.shareMasaPaksha", "मास")}: ${trVedic(panchang.masa, language)}`,
        `• ${t("panchang.sunrise", "सूर्योदय")}: ${clock(panchang.solar.sunrise)} | ${t("panchang.sunset", "सूर्यास्त")}: ${clock(panchang.solar.sunset)}`,
        `• ${t("panchang.sunSign", "सूर्य राशि")}: ${trVedic(panchang.solarRashi, language)} | ${t("panchang.moonSign", "चन्द्र राशि")}: ${trVedic(panchang.lunarRashi, language)}`,
      ].join("\n");
      await shareImageFile({
        imageUri: dataUrl,
        fileName: `shakti-panchang-hd-${slug}.png`,
        title: language === "en" ? "Today's Vedic Panchang (Full HD)" : "आज का वैदिक पंचांग (Full HD)",
        text: shareText,
      });
    } catch {
      // User dismissed share sheet
    } finally {
      setIsSharingHd(false);
    }
  };

  return (
    <div
      className="flex-1 min-h-0 w-full bx-home overflow-y-auto overscroll-contain p-3 space-y-3.5 pb-10"
      style={{ WebkitOverflowScrolling: "touch", touchAction: "pan-y" }}
    >
      {/* 1. Compact Date Control Strip (City selector lives cleanly in the Top Bar) */}
      {onDateChange && (
        <section
          style={{
            backgroundColor: "var(--bx-panel)",
            borderColor: "var(--bx-line)",
          }}
          className="border rounded-2xl px-2 py-1.5 flex items-center justify-between gap-1.5"
        >
          <div className="flex items-center gap-0.5 min-w-0 flex-1">
            <button
              type="button"
              onClick={handlePrevDay}
              style={{ color: "var(--bx-ink)" }}
              className="w-9 h-9 rounded-xl flex items-center justify-center hover:opacity-80 active:scale-92 cursor-pointer shrink-0"
              title={t("common.prevDay", "पिछला दिन")}
              aria-label={t("common.prevDay", "पिछला दिन")}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => {
                triggerHapticSelection();
                setIsDatePickerOpen(true);
              }}
              className="flex-1 min-w-0 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-xl cursor-pointer transition active:scale-98"
              style={{ backgroundColor: "var(--bx-cream)", color: "var(--bx-ink)" }}
            >
              <Calendar className="w-3.5 h-3.5 shrink-0" style={{ color: "var(--bx-gold)" }} />
              <span className="text-xs font-bold truncate tabular-nums">
                {formattedDate}
              </span>
            </button>

            <button
              type="button"
              onClick={handleNextDay}
              style={{ color: "var(--bx-ink)" }}
              className="w-9 h-9 rounded-xl flex items-center justify-center hover:opacity-80 active:scale-92 cursor-pointer shrink-0"
              title={t("common.nextDay", "अगला दिन")}
              aria-label={t("common.nextDay", "अगला दिन")}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleTodayReset}
              style={{ backgroundColor: "var(--bx-header)", color: "#FFFFFF" }}
              className="h-9 px-2.5 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer active:scale-95 transition"
              title={t("common.todayBtn", "आज की तिथि पर लौटें")}
            >
              <RotateCcw className="w-3 h-3" />
              <span>{t("common.todayBtn", "आज")}</span>
            </button>
          </div>
        </section>
      )}

      {/* 2. Clean Today's Panchang Summary Hero Card */}
      <section
        style={{
          backgroundColor: "var(--bx-panel)",
          borderColor: "var(--bx-line)",
        }}
        className="border rounded-2xl p-3.5 space-y-3"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: "var(--bx-mute)" }}>
              <span>{trVedic(panchang.masa, language)}</span>
              <span>·</span>
              <span>{trVedic(panchang.samvat, language)}</span>
            </div>
            <h1 className="font-granth font-black text-xl sm:text-2xl leading-snug mt-0.5" style={{ color: "var(--bx-header)" }}>
              {trVedic(panchang.paksha, language)} {trVedic(panchang.tithi, language)}
            </h1>
            <div className="text-xs font-semibold mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5" style={{ color: "var(--bx-ink)" }}>
              <span>{trVedic(panchang.weekday, language)}</span>
              {panchang.tithiSpan && (
                <span className="text-[11px] font-bold text-rose-700 dark:text-amber-300 tabular-nums">
                  ({clock(panchang.tithiSpan.end)} {language === "gu" ? "સુધી" : language === "en" ? "ends" : "तक"} → {trVedic(panchang.tithiSpan.nextName, language)})
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleShareHd}
              disabled={isSharingHd}
              style={{
                backgroundColor: "var(--bx-cream)",
                borderColor: "var(--bx-line)",
                color: "var(--bx-header)",
              }}
              className="h-9 px-2.5 rounded-xl border text-xs font-bold flex items-center gap-1 cursor-pointer active:scale-95 transition"
              title={t("common.share", "शेयर करें")}
            >
              {isSharingHd ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Share2 className="w-3.5 h-3.5" />
              )}
              <span className="hidden xs:inline sm:inline">{t("common.share", "शेयर")}</span>
            </button>
            <button
              type="button"
              onClick={handleSaveHd}
              disabled={isSavingHd}
              style={{
                backgroundColor: "var(--bx-header)",
                color: "#FFFFFF",
              }}
              className="h-9 px-2.5 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer active:scale-95 transition"
              title={t("common.saveHd", "HD में सेव करें")}
            >
              {isSavingHd ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-200" />
              ) : (
                <Download className="w-3.5 h-3.5 text-amber-200" />
              )}
              <span>HD</span>
            </button>
          </div>
        </div>

        {/* 4-Stat Quick Panchang Strip (tabular numerals) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t" style={{ borderColor: "var(--bx-line)" }}>
          <div className="rounded-xl px-2.5 py-2" style={{ backgroundColor: "var(--bx-cream)" }}>
            <div className="flex items-center gap-1 text-[10.5px] font-bold" style={{ color: "var(--bx-mute)" }}>
              <Sunrise className="w-3 h-3" style={{ color: "var(--bx-gold)" }} />
              <span>{t("panchang.sunrise", "सूर्योदय")}</span>
            </div>
            <div className="text-sm font-extrabold mt-0.5 tabular-nums" style={{ color: "var(--bx-ink)" }}>
              {clock(panchang.solar.sunrise)}
            </div>
          </div>
          <div className="rounded-xl px-2.5 py-2" style={{ backgroundColor: "var(--bx-cream)" }}>
            <div className="flex items-center gap-1 text-[10.5px] font-bold" style={{ color: "var(--bx-mute)" }}>
              <Sunset className="w-3 h-3" style={{ color: "var(--bx-gold)" }} />
              <span>{t("panchang.sunset", "सूर्यास्त")}</span>
            </div>
            <div className="text-sm font-extrabold mt-0.5 tabular-nums" style={{ color: "var(--bx-ink)" }}>
              {clock(panchang.solar.sunset)}
            </div>
          </div>
          <div className="rounded-xl px-2.5 py-2" style={{ backgroundColor: "var(--bx-cream)" }}>
            <div className="flex items-center gap-1 text-[10.5px] font-bold" style={{ color: "var(--bx-mute)" }}>
              <Stars className="w-3 h-3" style={{ color: "var(--bx-gold)" }} />
              <span>{t("panchang.nakshatra", "नक्षत्र")}</span>
            </div>
            <div className="text-sm font-extrabold mt-0.5 truncate" style={{ color: "var(--bx-ink)" }}>
              {trVedic(panchang.nakshatra, language)}
            </div>
          </div>
          <div className="rounded-xl px-2.5 py-2" style={{ backgroundColor: "var(--bx-cream)" }}>
            <div className="flex items-center gap-1 text-[10.5px] font-bold" style={{ color: "var(--bx-mute)" }}>
              <Moon className="w-3 h-3" style={{ color: "var(--bx-gold)" }} />
              <span>{t("panchang.moonSign", "चंद्र राशि")}</span>
            </div>
            <div className="text-sm font-extrabold mt-0.5 truncate" style={{ color: "var(--bx-ink)" }}>
              {trVedic(panchang.lunarRashi, language)}
            </div>
          </div>
        </div>

        {hdNotice && (
          <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>{hdNotice}</span>
          </div>
        )}
      </section>

      {/* 3. Super-App 4x2 Quick Access Grid (Option 2 Combo) */}
      <section aria-label={t("nav.services", "त्वरित सेवाएँ")} className="grid grid-cols-4 gap-2">
        {quickShortcuts.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                triggerHapticSelection();
                onOpen(item.id);
              }}
              style={{
                backgroundColor: "var(--bx-panel)",
                borderColor: "var(--bx-line)",
                color: "var(--bx-ink)",
              }}
              className="flex flex-col items-center justify-center gap-1.5 py-2.5 px-1 rounded-2xl border cursor-pointer active:scale-94 transition"
            >
              <span
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{
                  backgroundColor: "var(--bx-mark-soft)",
                  color: "var(--bx-mark)",
                }}
              >
                <Icon className="w-[18px] h-[18px]" />
              </span>
              <span className="text-[11px] font-bold leading-tight text-center truncate w-full px-0.5">
                {item.label}
              </span>
            </button>
          );
        })}
      </section>

      {/* 4. Shastrokt Tithi Nirnaya & Daily Agnivasa Action Banners */}
      <div className="space-y-2">
        <button
          type="button"
          onClick={() => {
            triggerHapticSelection();
            setIsTithiNirnayaOpen(true);
          }}
          style={{
            backgroundColor: "#5C2D11",
            color: "#FFFFFF",
            borderColor: "var(--bx-gold)",
          }}
          className="bx-dark-surface w-full p-3 rounded-2xl border flex items-center justify-between gap-2.5 cursor-pointer active:scale-98 transition"
        >
          <div className="flex items-center gap-2.5 text-left min-w-0 flex-1">
            <div className="w-8 h-8 rounded-xl bg-white/15 border border-amber-300/35 flex items-center justify-center shrink-0">
              <Scale className="w-4 h-4" style={{ color: "#FDE68A" }} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold flex items-center gap-1.5 flex-wrap" style={{ color: "#FFFDF5" }}>
                <span>
                  {dailyDecision.isFestivalToday
                    ? `✨ ${dailyDecision.title}`
                    : dailyDecision.title}
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-400/20 border border-amber-400/30 font-bold" style={{ color: "#FDE68A" }}>
                  {dailyDecision.badgeText}
                </span>
              </div>
              <div className="text-[11px] leading-snug mt-0.5 line-clamp-2" style={{ color: "#FEF08A" }}>
                {dailyDecision.bannerNotice}
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 shrink-0" style={{ color: "#FDE68A" }} />
        </button>

        <button
          type="button"
          onClick={() => {
            triggerHapticSelection();
            onOpen("havan");
          }}
          style={{
            backgroundColor: "var(--bx-panel)",
            borderColor: dailyAgnivasa.isAuspicious ? "#059669" : "var(--bx-line)",
            color: "var(--bx-ink)",
          }}
          className="w-full p-3 rounded-2xl border flex items-center justify-between gap-2.5 cursor-pointer active:scale-98 transition"
        >
          <div className="flex items-center gap-2.5 text-left min-w-0 flex-1">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: "var(--bx-mark-soft)" }}
            >
              <Flame
                className={`w-4 h-4 ${dailyAgnivasa.isAuspicious ? "text-emerald-600" : "text-amber-600"}`}
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold truncate" style={{ color: "var(--bx-header)" }}>
                {dailyAgnivasa.title}
              </div>
              <div className="text-[11px] leading-snug mt-0.5 opacity-80 truncate">
                {dailyAgnivasa.badgeText} · {language === "en" ? "Open Nitya Havan Vidhi & Swaha Counter" : language === "gu" ? "નિત્ય હવન વિધિ અને સ્વાહા મંત્ર ખોલો" : "नित्य हवन विधि, समिधा व स्वाहा मंत्र"}
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 shrink-0 opacity-70" style={{ color: "var(--bx-header)" }} />
        </button>
      </div>

      {/* 5. Moon Phase & Tithi Orbit */}
      <MoonPhaseChart
        panchang={panchang}
        placeName={place.name}
        onWhatsApp={onWhatsApp}
      />

      {/* 6. Complete 16-Item Panchang Details Grid */}
      <section
        style={{
          backgroundColor: "var(--bx-panel)",
          borderColor: "var(--bx-line)",
        }}
        className="border rounded-2xl p-3.5 space-y-3"
      >
        <div className="flex items-center justify-between gap-2 border-b pb-2" style={{ borderColor: "var(--bx-line)" }}>
          <h2 className="font-granth font-bold text-base" style={{ color: "var(--bx-header)" }}>
            {t("panchang.fullDetailsTitle", "आज का सम्पूर्ण पंचांग विवरण")}
          </h2>
          <button
            type="button"
            onClick={() => {
              triggerHapticSelection();
              onWhatsApp();
            }}
            style={{ color: "var(--bx-mark)" }}
            className="text-xs font-bold flex items-center gap-1 cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{language === "en" ? "WhatsApp Card" : language === "gu" ? "કાર્ડ" : "व्हाट्सएप कार्ड"}</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {facts.map(([k, v]) =>
            k === placeLabelKey && onPlace ? (
              <button
                key={k}
                type="button"
                onClick={() => {
                  triggerHapticSelection();
                  onPlace();
                }}
                className="bx-fact bx-glass text-left cursor-pointer"
                title={t("common.changeCity", "शहर / स्थान बदलें")}
              >
                <div className="bx-kicker flex items-center justify-between gap-1">
                  <span>{k}</span>
                  <span style={{ color: "var(--bx-mark)" }} className="text-[10px] font-bold">
                    {t("more.changeBtn", "बदलें")} ▾
                  </span>
                </div>
                <b className="text-sm sm:text-base mt-1 block truncate">{v}</b>
              </button>
            ) : k === t("panchang.tithi", "तिथि") ? (
              <button
                key={k}
                type="button"
                onClick={() => {
                  triggerHapticSelection();
                  setIsTithiNirnayaOpen(true);
                }}
                className="bx-fact bx-glass text-left cursor-pointer col-span-2"
                title={language === "en" ? "View Shastric Tithi Proof" : "शास्त्रोक्त तिथि प्रमाण देखें"}
              >
                <div className="bx-kicker flex items-center justify-between gap-1">
                  <span>{k}</span>
                  <span style={{ color: "var(--bx-mark)" }} className="text-[10px] font-bold shrink-0">
                    {language === "en" ? "Shastric Proof ▾" : language === "gu" ? "શાસ્ત્રોક્ત નિર્ણય ▾" : "शास्त्रोक्त प्रमाण ▾"}
                  </span>
                </div>
                <div className="mt-1 space-y-0.5">
                  <b className="text-base block">{v}</b>
                  {panchang.tithiSpan && (
                    <span className="text-[11px] text-rose-700 dark:text-amber-300 font-bold block leading-tight tabular-nums">
                      {clock(panchang.tithiSpan.end)} {language === "gu" ? "સુધી" : language === "en" ? "ends" : "तक"} • {language === "gu" ? "ત્યારબાદ" : language === "en" ? "then" : "आगे"} {trVedic(panchang.tithiSpan.nextName, language)} {dailyDecision.nextTithiFestivalBadge ? `(${dailyDecision.nextTithiFestivalBadge})` : ""}
                    </span>
                  )}
                </div>
              </button>
            ) : (
              <div key={k} className="bx-fact bx-glass">
                <div className="bx-kicker">{k}</div>
                <b className="text-sm sm:text-base mt-1 block tabular-nums">{v}</b>
              </div>
            )
          )}
        </div>
      </section>

      {/* 7. Daily Rotating Sanskrit Shloka */}
      <DailyShlokaCard
        date={panchang.solar.sunrise || new Date()}
        onExploreMore={() => onOpen("granth_puran")}
      />

      {/* 8. Bottom Curated Links to Scriptures & Bhakti Hub */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          type="button"
          className="bx-tile bx-glass h-auto cursor-pointer text-left"
          onClick={() => {
            triggerHapticSelection();
            onOpen("granth_puran");
          }}
        >
          <span className="bx-tile-icon">
            <BookOpen className="w-4 h-4" />
          </span>
          <span className="min-w-0">
            <strong className="truncate block">
              {language === "en" ? "Granth & Upanishad" : language === "gu" ? "ગ્રંથ અને ઉપનિષદ" : "ग्रन्थ व उपनिषद्"}
            </strong>
            <p className="line-clamp-2">
              {language === "en" ? "Gita, Upanishads & 18 Puranas" : language === "gu" ? "ગીતા, ઉપનિષદ અને ૧૮ પુરાણ" : "गीता, उपनिषद् व अष्टादश पुराण"}
            </p>
          </span>
        </button>

        <button
          type="button"
          className="bx-tile bx-glass h-auto cursor-pointer text-left"
          onClick={() => {
            triggerHapticSelection();
            onOpen("bhakti_hub");
          }}
        >
          <span className="bx-tile-icon">
            <Flame className="w-4 h-4" />
          </span>
          <span className="min-w-0">
            <strong className="truncate block">
              {language === "en" ? "Bhakti & Remedies" : language === "gu" ? "ભક્તિ અને ઉપાય" : "भक्ति व उपाय"}
            </strong>
            <p className="line-clamp-2">
              {language === "en" ? "Path, Lal Kitab & Mantras" : language === "gu" ? "પાઠ, લાલ કિતાબ અને મંત્ર" : "स्तोत्र, लाल किताब व सिद्ध मंत्र"}
            </p>
          </span>
        </button>
      </div>

      <VedicDatePickerModal
        isOpen={isDatePickerOpen}
        value={activeDate.toISOString().split("T")[0]}
        onChange={(val) => {
          const [y, m, d] = val.split("-").map(Number);
          const newD = new Date(activeDate);
          newD.setFullYear(y, m - 1, d);
          onDateChange?.(newD);
        }}
        onClose={() => setIsDatePickerOpen(false)}
        title={t("panchang.selectPanchangDate", "पंचांग तिथि चुनें")}
      />

      <TithiNirnayaModal
        isOpen={isTithiNirnayaOpen}
        onClose={() => setIsTithiNirnayaOpen(false)}
        panchang={panchang}
        onDateSelect={onDateChange}
      />
    </div>
  );
}
