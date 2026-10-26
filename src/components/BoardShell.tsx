import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
} from "lucide-react";
import { BOOK_PAGES, getLocalizedBookPage } from "../constants/bookPages";
import { VedicPanchangData, SavedLocation } from "../types";
import { getSyncedNow } from "../hooks/useUserDateTime";
import { ZeroScrollPager } from "./ZeroScrollPager";
import { MoonPhaseChart, generateHdMoonPanchangDataUrl } from "./MoonPhaseChart";
import { saveImageNative } from "../lib/device";
import { shareImageFile } from "../lib/shareHelper";
import { trVedic } from "../i18n/vedicTranslate";
import { useLanguage } from "../i18n";
import { triggerHapticSelection } from "../utils/haptics";
import { DailyShlokaCard } from "./DailyShlokaCard";

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
      whileHover={{ scale: 1.05 }}
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
  onClose,
  onBack,
  onPlace,
  onLanguage,
  onTheme,
  onServices,
  onPanchang,
  onKundali,
  onUma,
  onMore,
  onHost,
}: {
  title: string;
  place: string;
  showBack: boolean;
  trialText: string | null;
  active: string;
  onClose: () => void;
  onBack: () => void;
  onPlace: () => void;
  onLanguage: () => void;
  onTheme: () => void;
  onServices: () => void;
  onPanchang: () => void;
  onKundali: () => void;
  onUma: () => void;
  onMore: () => void;
  onHost: (el: HTMLDivElement | null) => void;
}) {
  const { t, language } = useLanguage();
  const brand = language === "en" ? "Shakti" : language === "gu" ? "શક્તિ" : "शक्ति";
  const items = [
    { id: "services", label: t("nav.services", "सेवाएँ"), icon: LayoutGrid, onClick: onServices },
    { id: "panchang", label: t("nav.panchang", "पंचांग"), icon: Sun, onClick: onPanchang },
    { id: "kundali", label: t("nav.kundali", "कुण्डली"), icon: UserRound, onClick: onKundali },
    { id: "uma", label: t("nav.uma", "उमा"), icon: Sparkles, onClick: onUma },
    { id: "more", label: t("nav.more", "अधिक"), icon: MoreHorizontal, onClick: onMore },
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
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="text-[15px] font-semibold leading-none">{brand}</div>
            <div className="bx-kicker mt-1 truncate">{title}</div>
          </div>
          <motion.button
            type="button"
            whileHover={{ scale: 1.1 }}
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
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: "spring", stiffness: 420, damping: 28 }}
            whileHover={{ x: -2 }}
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
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 420, damping: 28, delay: 0.04 }}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.97 }}
          className="bx-navbtn w-full mt-2 cursor-pointer"
          onClick={() => {
            triggerHapticSelection();
            onPlace();
          }}
        >
          <MapPin className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{place}</span>
        </motion.button>
        {trialText && <div className="bx-kicker mt-2 px-1">{trialText}</div>}
        <nav className="grid grid-cols-5 gap-1 mt-3" aria-label={t("nav.services", "मुख्य")}>
          {items.map((item, idx) => {
            const on = item.id === "uma" ? false : active === item.id || (item.id === "kundali" && active === "milan");
            const Icon = item.icon;
            return (
              <motion.button
                key={item.id}
                type="button"
                data-on={on ? "true" : "false"}
                initial={{ opacity: 0, y: 10, scale: 0.94 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 420,
                  damping: 26,
                  delay: idx * 0.035,
                }}
                whileHover={{ scale: 1.04 }}
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
                {item.label}
              </motion.button>
            );
          })}
        </nav>
        <div className="grid grid-cols-2 gap-2 mt-3">
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: "spring", stiffness: 450, damping: 25 }}
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
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: "spring", stiffness: 450, damping: 25 }}
            className="bx-navbtn cursor-pointer"
            onClick={() => {
              triggerHapticSelection();
              onLanguage();
            }}
          >
            <Languages className="w-4 h-4" />
            {t("common.language", "भाषा")}
          </motion.button>
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
        aria-label="थीम"
        title="थीम बदलें"
      >
        <Palette className="w-3.5 h-3.5" />
        <span className="text-[11px] font-semibold">थीम</span>
      </button>
      <button
        type="button"
        onClick={() => {
          triggerHapticSelection();
          onLanguage();
        }}
        className="bx-head-btn shrink-0"
        aria-label={t("common.language", "भाषा")}
        title="भाषा बदलें"
      >
        <Languages className="w-3.5 h-3.5" />
        <span className="text-[11px] font-semibold">{t("common.language", "भाषा")}</span>
      </button>
    </header>
  );
}

export function BoardDock({
  active,
  onServices,
  onPanchang,
  onKundali,
  onUma,
  onMore,
}: {
  active: string;
  onServices: () => void;
  onPanchang: () => void;
  onKundali: () => void;
  onUma: () => void;
  onMore: () => void;
}) {
  const { t } = useLanguage();
  const items = [
    { id: "services", label: t("nav.services", "सेवाएँ"), icon: LayoutGrid, onClick: onServices },
    { id: "panchang", label: t("nav.panchang", "पंचांग"), icon: Sun, onClick: onPanchang },
    { id: "kundali", label: t("nav.kundali", "कुण्डली"), icon: UserRound, onClick: onKundali },
    { id: "uma", label: t("nav.uma", "उमा"), icon: Sparkles, onClick: onUma },
    { id: "more", label: t("nav.more", "अधिक"), icon: MoreHorizontal, onClick: onMore },
  ];
  return (
    <nav className="bx-dock shrink-0 z-40 grid grid-cols-5" aria-label={t("nav.services", "मुख्य")}>
      {items.map((item, idx) => {
        const on = item.id === "uma" ? false : active === item.id || (item.id === "kundali" && active === "milan");
        const Icon = item.icon;
        return (
          <motion.button
            key={item.id}
            type="button"
            data-on={on ? "true" : "false"}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              type: "spring",
              stiffness: 420,
              damping: 26,
              delay: idx * 0.025,
            }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => {
              triggerHapticSelection();
              item.onClick();
            }}
            className="flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium min-w-0 px-0.5 cursor-pointer"
          >
            <span className="bx-tile-icon w-7 h-7">
              <Icon className="w-3.5 h-3.5" />
            </span>
            {item.label}
          </motion.button>
        );
      })}
    </nav>
  );
}

const SERVICE_GROUPS: { title: Record<string, string>; ids: string[] }[] = [
  {
    title: { hi: "आज", en: "Today", gu: "આજ" },
    ids: ["panchang", "kalnirnay", "rashifal", "choghadiya", "muhurat", "yatra", "festivals"],
  },
  {
    title: { hi: "जन्म पत्रिका व लाल किताब", en: "Birth chart & Lal Kitab", gu: "જન્મ પત્રિકા અને લાલ કિતાબ" },
    ids: ["lal_kitab", "kundali", "milan", "prashna", "saral", "shastrokt", "sabar", "numerology", "gemology", "jain_mantras"],
  },
  {
    title: { hi: "शास्त्र और पाठ", en: "Scripture", gu: "શાસ્ત્ર" },
    ids: ["vishnu_sahasranama", "granth_puran", "devta_arpan", "durga", "audio_player", "hanuman", "sundarkand", "gita", "vratkatha", "vastu", "reminders"],
  },
  {
    title: { hi: "दर्शन", en: "Reading", gu: "દર્શન" },
    ids: ["palmistry", "tarot", "face_reading", "iching"],
  },
];

function groupTitle(title: Record<string, string>, language: string) {
  return title[language] || title.hi;
}

export function ModuleBoard({
  language,
  onOpen,
}: {
  language: string;
  onOpen: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const pages = BOOK_PAGES.map((page) => getLocalizedBookPage(page, language));
  const byId = useMemo(() => new Map(pages.map((page) => [page.id, page])), [pages]);
  const q = query.trim().toLowerCase();
  const searchHint = language === "en" ? "Find a service" : language === "gu" ? "સેવા શોધો" : "सेवा खोजें";
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
  let sections = SERVICE_GROUPS.map((group) => ({
    title: groupTitle(group.title, language),
    pages: group.ids
      .map((id) => byId.get(id))
      .filter((page): page is NonNullable<typeof page> => !!page)
      .filter(matches),
  })).filter((group) => group.pages.length > 0);
  const used = new Set([...SERVICE_GROUPS.flatMap((group) => group.ids), "upay"]);
  const extra = pages.filter((page) => !used.has(page.id) && matches(page));
  if (extra.length) {
    sections.push({ title: language === "en" ? "More" : language === "gu" ? "વધુ" : "और", pages: extra });
  }
  if (q) {
    const hits = sections
      .flatMap((section) => section.pages)
      .sort((a, b) => rank(a) - rank(b));
    sections = hits.length ? [{ title: searchHint, pages: hits }] : [];
  }

  return (
    <div className="flex-1 min-h-0 flex flex-col bx-home">
      <label className="bx-search px-3 pt-3 pb-1 shrink-0">
        <Search className="bx-search-icon" aria-hidden="true" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={`${searchHint} — ${pages.length}`}
          aria-label={searchHint}
        />
      </label>
      <ZeroScrollPager className="flex-1 min-h-0" contentClassName="px-3 pb-3 flex flex-col gap-3" resetKey={query}>
          {sections.length === 0 && (
            <div className="bx-fact text-sm">
              {language === "en" ? "No service matches that name." : language === "gu" ? "આ નામની સેવા મળી નથી." : "कोई सेवा इस नाम से नहीं मिली।"}
            </div>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 justify-items-stretch items-start content-start">
            {sections.flatMap((section) =>
              section.pages.map((page, idx) => {
                const Icon = page.icon;
                return (
                  <motion.button
                    key={page.id}
                    type="button"
                    initial={{ opacity: 0, y: 12, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 380,
                      damping: 26,
                      delay: Math.min(idx * 0.018, 0.25),
                    }}
                    whileHover={{ y: -3, scale: 1.015 }}
                    whileTap={{ scale: 0.95 }}
                    className="bx-tile bx-glass cursor-pointer"
                    onClick={() => {
                      triggerHapticSelection();
                      onOpen(page.id);
                    }}
                  >
                    <span className="bx-tile-icon">
                      <Icon className="w-4 h-4" />
                    </span>
                    <span>
                      <strong>{page.label}</strong>
                      <p>{page.desc}</p>
                    </span>
                  </motion.button>
                );
              }),
            )}
          </div>
      </ZeroScrollPager>
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
  const facts: [string, string][] = [
    [t("panchang.tithi", "तिथि"), trVedic(panchang.tithi)],
    [t("panchang.paksha", "पक्ष"), trVedic(panchang.paksha)],
    [t("panchang.nakshatra", "नक्षत्र"), `${trVedic(panchang.nakshatra)} · चरण ${panchang.pada}`],
    [t("panchang.yoga", "योग"), trVedic(panchang.yoga)],
    [t("panchang.karana", "करण"), trVedic(panchang.karana)],
    [t("panchang.weekday", "वार"), trVedic(panchang.weekday)],
    [t("panchang.shareMasaPaksha", "मास"), trVedic(panchang.masa)],
    [t("panchang.samvat", "संवत्"), panchang.samvat],
    [t("panchang.shakaSamvat", "शक"), panchang.sakaSamvat],
    [t("panchang.sunrise", "सूर्योदय"), clock(panchang.solar.sunrise)],
    [t("panchang.solarNoon", "मध्याह्न"), clock(panchang.solar.solarNoon)],
    [t("panchang.sunset", "सूर्यास्त"), clock(panchang.solar.sunset)],
    [t("panchang.sunSign", "सूर्य राशि"), trVedic(panchang.solarRashi)],
    [t("panchang.moonSign", "चंद्र राशि"), trVedic(panchang.lunarRashi)],
    [t("panchang.shareMoonSunSign", "अयनांश"), `${panchang.ayanamshaName} · ${panchang.ayanamsha.toFixed(2)}°`],
    [placeLabelKey, place.name],
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
      setHdNotice("✓ Full HD (1080p) पंचांग चित्र सेव हो गया!");
      setTimeout(() => setHdNotice(null), 4000);
    } catch {
      setHdNotice("HD सेव करने में त्रुटि हुई, पुनः प्रयास करें।");
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
      const shareText = [
        `🕉️ *आज का वैदिक पंचांग एवं चन्द्र कला (${place.name})*`,
        `• तिथि: ${trVedic(panchang.paksha)} ${trVedic(panchang.tithi)}`,
        `• नक्षत्र: ${trVedic(panchang.nakshatra)} (चरण ${panchang.pada})`,
        `• योग: ${trVedic(panchang.yoga)} | करण: ${trVedic(panchang.karana)}`,
        `• वार: ${trVedic(panchang.weekday)} | मास: ${trVedic(panchang.masa)}`,
        `• सूर्योदय: ${clock(panchang.solar.sunrise)} | सूर्यास्त: ${clock(panchang.solar.sunset)}`,
        `• सूर्य राशि: ${trVedic(panchang.solarRashi)} | चन्द्र राशि: ${trVedic(panchang.lunarRashi)}`,
      ].join("\n");
      await shareImageFile({
        imageUri: dataUrl,
        fileName: `shakti-panchang-hd-${slug}.png`,
        title: "आज का वैदिक पंचांग (Full HD)",
        text: shareText,
      });
    } catch {
      // User dismissed share sheet
    } finally {
      setIsSharingHd(false);
    }
  };

  return (
    <div className="flex-1 min-h-0 w-full bx-home overflow-y-auto overscroll-contain p-3 space-y-3.5 pb-24">
      {/* 0. Top Location (शहर चुनें) & Date Control Bar */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 28, delay: 0.02 }}
        className="bg-[#FAF2E4] border border-[#8C6239]/40 rounded-2xl p-2.5 sm:p-3 shadow-xs flex flex-wrap items-center justify-between gap-2"
      >
        <div className="flex items-center gap-1.5 flex-wrap">
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 450, damping: 26 }}
            onClick={() => {
              triggerHapticSelection();
              onPlace?.();
            }}
            style={{ backgroundColor: "#5C3A21", color: "#FAF2E4", borderColor: "#B56A00" }}
            className="px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
            title="शहर / स्थान बदलें"
          >
            <MapPin className="w-3.5 h-3.5 shrink-0" style={{ color: "#FFD88A" }} />
            <span className="truncate max-w-[130px] sm:max-w-[180px]">{place.name}</span>
            <span
              style={{ backgroundColor: "#B56A00", color: "#FFFFFF" }}
              className="text-[10px] px-1.5 py-0.5 rounded font-black shrink-0"
            >
              शहर बदलें ▾
            </span>
          </motion.button>

          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 450, damping: 26 }}
            onClick={() => {
              triggerHapticSelection();
              onOpen("kalnirnay");
            }}
            className="px-2.5 py-1.5 rounded-xl bg-[#F4E8D1] hover:bg-[#E8D5B5] border border-[#8C6239]/40 text-[#5C3A21] text-xs font-bold flex items-center gap-1 transition cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5 text-[#8B1E1E]" />
            <span>मासिक कैलेंडर</span>
          </motion.button>
        </div>

        {onDateChange && (
          <div className="flex items-center gap-1 bg-[#F4E8D1] px-1.5 py-1 rounded-xl border border-[#8C6239]/35">
            <motion.button
              type="button"
              whileTap={{ scale: 0.9 }}
              onClick={handlePrevDay}
              className="p-1 rounded-lg hover:bg-[#E5D2B8] text-[#5C3A21] cursor-pointer"
              title="पिछला दिन"
              aria-label="पिछला दिन"
            >
              <ChevronLeft className="w-4 h-4" />
            </motion.button>

            <label className="relative flex items-center px-1.5 cursor-pointer">
              <span className="text-xs font-bold text-[#5C3A21] whitespace-nowrap">
                📅 {formattedDate}
              </span>
              <input
                type="date"
                value={activeDate.toISOString().split("T")[0]}
                onChange={(e) => {
                  if (e.target.valueAsDate) onDateChange(e.target.valueAsDate);
                }}
                className="absolute inset-0 opacity-0 cursor-pointer w-full"
              />
            </label>

            <motion.button
              type="button"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.92 }}
              onClick={handleTodayReset}
              style={{ backgroundColor: "#8B1E1E", color: "#FFFFFF" }}
              className="px-2 py-0.5 rounded-md text-[11px] font-bold flex items-center gap-1 cursor-pointer"
              title="आज की तिथि पर लौटें"
            >
              <RotateCcw className="w-3 h-3" />
              <span>आज</span>
            </motion.button>

            <motion.button
              type="button"
              whileTap={{ scale: 0.9 }}
              onClick={handleNextDay}
              className="p-1 rounded-lg hover:bg-[#E5D2B8] text-[#5C3A21] cursor-pointer"
              title="अगला दिन"
              aria-label="अगला दिन"
            >
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          </div>
        )}
      </motion.section>

      {/* 1. First on Screen: Moon Phase & Tithi Orbit with Built-in Share & HD Save */}
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.99 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 380, damping: 28, delay: 0.06 }}
      >
        <MoonPhaseChart
          panchang={panchang}
          placeName={place.name}
          onWhatsApp={onWhatsApp}
        />
      </motion.div>

      {/* 2. Directly Below Moon Phase: Complete Panchang Details + Share & HD Save Options */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 380, damping: 28, delay: 0.1 }}
        className="bg-[#FAF2E4] border border-[#8C6239]/40 rounded-2xl p-3 sm:p-4 shadow-xs space-y-3"
      >
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#8C6239]/25 pb-2.5">
          <div>
            <div className="bx-kicker inline-flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#B56A00]" />
              <span>{t("common.today", "आज का सम्पूर्ण पंचांग विवरण")}</span>
            </div>
            <h3 className="font-granth font-black text-base sm:text-lg text-[#5C3A21] mt-0.5">
              {trVedic(panchang.paksha)} · {trVedic(panchang.tithi)} ({trVedic(panchang.weekday)})
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleShareHd}
              disabled={isSharingHd}
              className="px-3 py-1.5 rounded-xl bg-[#5C3A21] hover:bg-[#462B17] text-[#FAF2E4] text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
            >
              {isSharingHd ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#FFD88A]" />
              ) : (
                <Share2 className="w-3.5 h-3.5 text-[#FFD88A]" />
              )}
              <span>शेयर करें</span>
            </motion.button>

            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSaveHd}
              disabled={isSavingHd}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#B56A00] to-[#8B1E1E] hover:brightness-110 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
            >
              {isSavingHd ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-200" />
              ) : (
                <Download className="w-3.5 h-3.5 text-amber-200" />
              )}
              <span>HD में सेव करें</span>
            </motion.button>
          </div>
        </div>

        {hdNotice && (
          <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>{hdNotice}</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          {facts.map(([k, v]) =>
            k === placeLabelKey && onPlace ? (
              <motion.button
                key={k}
                type="button"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  triggerHapticSelection();
                  onPlace();
                }}
                className="bx-fact bx-glass text-left cursor-pointer hover:border-[#8B1E1E]"
                title="शहर / स्थान बदलें"
              >
                <div className="bx-kicker flex items-center justify-between gap-1">
                  <span>{k}</span>
                  <span className="text-[10px] font-bold underline text-[#8B1E1E]">शहर बदलें ▾</span>
                </div>
                <b className="text-base mt-1 flex items-center gap-1 truncate">
                  <MapPin className="w-3.5 h-3.5 text-[#B56A00] shrink-0" />
                  <span className="truncate">{v}</span>
                </b>
              </motion.button>
            ) : (
              <div key={k} className="bx-fact bx-glass">
                <div className="bx-kicker">{k}</div>
                <b className="text-base mt-1">{v}</b>
              </div>
            )
          )}
        </div>
      </motion.section>

      {/* 3. 3D Mini Kundali Glimpse Card */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 380, damping: 28, delay: 0.14 }}
        className="bx-kundali"
        aria-label="आज की कुंडली"
      >
        <div className="bx-kundali-stage">
          <svg viewBox="0 0 100 100" className="bx-kundali-plate" aria-hidden="true">
            <rect x="3" y="3" width="94" height="94" rx="2" />
            <polygon points="50,3 97,50 50,97 3,50" />
            <line x1="3" y1="3" x2="97" y2="97" />
            <line x1="97" y1="3" x2="3" y2="97" />
          </svg>
          <div className="bx-kundali-core">
            <span>ॐ</span>
            <b>{trVedic(panchang.tithi)}</b>
            <small>{trVedic(panchang.nakshatra)}</small>
          </div>
        </div>
        <div className="bx-kundali-meta">
          <span>{trVedic(panchang.weekday)}</span>
          <span>{t("panchang.sunSign", "सूर्य")} · {trVedic(panchang.solarRashi)}</span>
          <span>{t("panchang.moonSign", "चंद्र")} · {trVedic(panchang.lunarRashi)}</span>
        </div>
      </motion.section>

      {/* 4. Daily Rotating Sanskrit Shloka with Hindi Translation & Share Button */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 380, damping: 28, delay: 0.18 }}
      >
        <DailyShlokaCard
          date={panchang.solar.sunrise || new Date()}
          onExploreMore={() => onOpen("granth_puran")}
        />
      </motion.div>

      {/* 5. Quick Action Tiles */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 380, damping: 28, delay: 0.22 }}
        className="grid grid-cols-2 gap-2"
      >
        <motion.button
          type="button"
          whileHover={{ y: -2, scale: 1.01 }}
          whileTap={{ scale: 0.96 }}
          className="bx-tile bx-glass h-auto min-h-16 cursor-pointer"
          onClick={() => {
            triggerHapticSelection();
            onWhatsApp();
          }}
        >
          <strong>{t("common.share", "व्हाट्सएप कार्ड")}</strong>
          <p>{t("nav.panchang", "पंचांग साझा व HD सेव")}</p>
        </motion.button>
        <motion.button
          type="button"
          whileHover={{ y: -2, scale: 1.01 }}
          whileTap={{ scale: 0.96 }}
          className="bx-tile bx-glass h-auto min-h-16 cursor-pointer"
          onClick={() => {
            triggerHapticSelection();
            onOpen("choghadiya");
          }}
        >
          <strong>{t("nav.choghadiya", "चौघड़िया")}</strong>
          <p>{t("panchang.auspiciousTimings", "शुभ समय")}</p>
        </motion.button>
        <motion.button
          type="button"
          whileHover={{ y: -2, scale: 1.01 }}
          whileTap={{ scale: 0.96 }}
          className="bx-tile bx-glass h-auto min-h-16 cursor-pointer"
          onClick={() => {
            triggerHapticSelection();
            onOpen("muhurat");
          }}
        >
          <strong>{t("nav.muhurat", "मुहूर्त")}</strong>
          <p>{t("panchang.auspiciousTimings", "काम के अनुसार समय")}</p>
        </motion.button>
        <motion.button
          type="button"
          whileHover={{ y: -2, scale: 1.01 }}
          whileTap={{ scale: 0.96 }}
          className="bx-tile bx-glass h-auto min-h-16 cursor-pointer"
          onClick={() => {
            triggerHapticSelection();
            onOpen("rashifal");
          }}
        >
          <strong>{t("nav.rashifal", "राशिफल")}</strong>
          <p>{t("panchang.moonSign", "बारह राशियाँ")}</p>
        </motion.button>
        <motion.button
          type="button"
          whileHover={{ y: -2, scale: 1.008 }}
          whileTap={{ scale: 0.97 }}
          className="bx-tile bx-glass h-auto min-h-16 col-span-2 cursor-pointer"
          onClick={() => {
            triggerHapticSelection();
            onOpen("granth_puran");
          }}
        >
          <strong>{t("nav.granthPuran", "प्राचीन ग्रन्थ, उपनिषद् व महापुराण स्वाध्याय")}</strong>
          <p>{t("nav.granthPuranDesc", "श्रीमद्भगवद्गीता, १० प्रमुख उपनिषद्, अष्टादश महापुराण व वैदिक सूक्त सार")}</p>
        </motion.button>
      </motion.div>
    </div>
  );
}
