import React, { useMemo, useState } from "react";
import {
  Calendar,
  LayoutGrid,
  MapPin,
  Sparkles,
  Sun,
  UserRound,
  ChevronLeft,
  Languages,
  Palette,
} from "lucide-react";
import { BOOK_PAGES, getLocalizedBookPage } from "../constants/bookPages";
import { VedicPanchangData, SavedLocation } from "../types";
import { ZeroScrollPager } from "./ZeroScrollPager";
import { trVedic } from "../i18n/vedicTranslate";
import { useLanguage } from "../i18n";

function clock(d?: Date) {
  if (!d) return "—";
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
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
          onClick={onBack}
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
        onClick={onPlace}
        className="bx-head-btn max-w-[32%] min-w-0 shrink"
      >
        <MapPin className="w-3.5 h-3.5 shrink-0" />
        <span className="truncate">{place}</span>
      </button>
      <button type="button" onClick={onTheme} className="bx-head-btn shrink-0" aria-label="थीम">
        <Palette className="w-4 h-4" />
      </button>
      <button type="button" onClick={onLanguage} className="bx-head-btn shrink-0" aria-label={t("common.language", "भाषा")}>
        <Languages className="w-4 h-4" />
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
}: {
  active: string;
  onServices: () => void;
  onPanchang: () => void;
  onKundali: () => void;
  onUma: () => void;
}) {
  const { t } = useLanguage();
  const items = [
    { id: "services", label: t("nav.services", "सेवाएँ"), icon: LayoutGrid, onClick: onServices },
    { id: "panchang", label: t("nav.panchang", "पंचांग"), icon: Sun, onClick: onPanchang },
    { id: "kundali", label: t("nav.kundali", "कुण्डली"), icon: UserRound, onClick: onKundali },
    { id: "uma", label: t("nav.uma", "उमा"), icon: Sparkles, onClick: onUma },
  ];
  return (
    <nav className="bx-dock shrink-0 z-40 grid grid-cols-4" aria-label={t("nav.services", "मुख्य")}>
      {items.map((item) => {
        const on = item.id === "uma" ? false : active === item.id || (item.id === "kundali" && active === "milan");
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            type="button"
            data-on={on ? "true" : "false"}
            onClick={item.onClick}
            className="flex flex-col items-center justify-center gap-0.5 text-[11px] font-medium"
          >
            <span className="bx-tile-icon w-7 h-7">
              <Icon className="w-3.5 h-3.5" />
            </span>
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}

const SERVICE_GROUPS: { title: Record<string, string>; ids: string[] }[] = [
  {
    title: { hi: "आज", en: "Today", gu: "આજ" },
    ids: ["panchang", "rashifal", "choghadiya", "muhurat", "yatra", "festivals"],
  },
  {
    title: { hi: "जन्म पत्रिका", en: "Birth chart", gu: "જન્મ પત્રિકા" },
    ids: ["kundali", "milan", "upay", "numerology", "gemology"],
  },
  {
    title: { hi: "शास्त्र और पाठ", en: "Scripture", gu: "શાસ્ત્ર" },
    ids: ["durga", "gita", "vratkatha", "vastu", "reminders"],
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
  const used = new Set(SERVICE_GROUPS.flatMap((group) => group.ids));
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
    <div className="flex-1 min-h-0 flex flex-col">
      <label className="bx-search px-3 pt-3 pb-1 shrink-0">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={`${searchHint} — ${pages.length}`}
          aria-label={searchHint}
        />
      </label>
      <ZeroScrollPager className="flex-1 min-h-0" resetKey={`${language}-${q}`} label={searchHint}>
        <div className="px-3 pb-3 flex flex-col gap-3">
          {sections.length === 0 && (
            <div className="bx-fact text-sm">
              {language === "en" ? "No service matches that name." : language === "gu" ? "આ નામની સેવા મળી નથી." : "कोई सेवा इस नाम से नहीं मिली।"}
            </div>
          )}
          {sections.map((section) => (
            <section key={section.title} className="flex flex-col gap-2">
              <div className="bx-kicker px-1">{section.title}</div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {section.pages.map((page) => {
                  const Icon = page.icon;
                  return (
                    <button key={page.id} type="button" className="bx-tile" onClick={() => onOpen(page.id)}>
                      <span className="bx-tile-icon">
                        <Icon className="w-4 h-4" />
                      </span>
                      <span>
                        <strong>{page.label}</strong>
                        <p>{page.desc}</p>
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </ZeroScrollPager>
    </div>
  );
}

export function TodayBoard({
  panchang,
  place,
  onWhatsApp,
  onOpen,
}: {
  panchang: VedicPanchangData | null;
  place: SavedLocation;
  onWhatsApp: () => void;
  onOpen: (id: string) => void;
}) {
  const { t } = useLanguage();
  if (!panchang) {
    return <div className="p-4 text-sm">{t("common.loading", "पंचांग गणना हो रही है।")}</div>;
  }
  const facts: [string, string][] = [
    [t("panchang.tithi", "तिथि"), trVedic(panchang.tithi)],
    [t("panchang.paksha", "पक्ष"), trVedic(panchang.paksha)],
    [t("panchang.nakshatra", "नक्षत्र"), `${trVedic(panchang.nakshatra)} · ${panchang.pada}`],
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
    [t("kundali.place", "स्थान"), place.name],
  ];
  return (
    <ZeroScrollPager className="flex-1 min-h-0" resetKey={panchang.date.toDateString()} label={t("nav.panchang", "पंचांग")}>
      <div className="p-3 space-y-2">
        <div className="bx-fact">
          <div className="bx-kicker inline-flex items-center gap-1">
            <Calendar className="w-3 h-3" /> {t("common.today", "आज")}
          </div>
          <b className="mt-1">{trVedic(panchang.tithi)}</b>
          <div className="text-sm mt-1" style={{ color: "var(--bx-mute)" }}>
            {trVedic(panchang.weekday)} · {trVedic(panchang.nakshatra)}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {facts.map(([k, v]) => (
            <div key={k} className="bx-fact">
              <div className="bx-kicker">{k}</div>
              <b className="text-base mt-1">{v}</b>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button type="button" className="bx-tile h-auto min-h-16" onClick={onWhatsApp}>
            <strong>{t("common.share", "साझा करें")}</strong>
            <p>{t("nav.panchang", "पंचांग")}</p>
          </button>
          <button type="button" className="bx-tile h-auto min-h-16" onClick={() => onOpen("choghadiya")}>
            <strong>{t("nav.choghadiya", "चौघड़िया")}</strong>
            <p>{t("panchang.auspiciousTimings", "शुभ समय")}</p>
          </button>
          <button type="button" className="bx-tile h-auto min-h-16" onClick={() => onOpen("muhurat")}>
            <strong>{t("nav.muhurat", "मुहूर्त")}</strong>
            <p>{t("panchang.auspiciousTimings", "काम के अनुसार समय")}</p>
          </button>
          <button type="button" className="bx-tile h-auto min-h-16" onClick={() => onOpen("rashifal")}>
            <strong>{t("nav.rashifal", "राशिफल")}</strong>
            <p>{t("panchang.moonSign", "बारह राशियाँ")}</p>
          </button>
        </div>
      </div>
    </ZeroScrollPager>
  );
}
