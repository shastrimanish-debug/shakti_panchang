import React, { useMemo, useState } from "react";
import { SHASTROKT_DEITIES, SHASTROKT_NOTE, SHASTROKT_UPAY, type ShastroktUpay } from "../data/shastrokt";
import { useTabMenu } from "./BoardShell";
import { ShlokaPosterModal, ShlokaPosterData } from "./ShlokaPosterModal";
import { useLanguage } from "../i18n";
import { trVedic } from "../i18n/vedicTranslate";

const SHASTROKT_DEITY_LABELS: Record<string, { en: string; gu: string }> = {
  "शिव": { en: "Shiva", gu: "શિવ" },
  "गणेश": { en: "Ganesha", gu: "ગણેશ" },
  "विष्णु": { en: "Vishnu", gu: "વિષ્ણુ" },
  "कृष्ण": { en: "Krishna", gu: "કૃષ્ણ" },
  "राम": { en: "Rama", gu: "રામ" },
  "देवी": { en: "Devi", gu: "દેવી" },
  "लक्ष्मी": { en: "Lakshmi", gu: "લક્ષ્મી" },
  "सरस्वती": { en: "Saraswati", gu: "સરસ્વતી" },
  "हनुमान": { en: "Hanuman", gu: "હનુમાન" },
  "सूर्य": { en: "Surya", gu: "સૂર્ય" },
  "शनि": { en: "Shani", gu: "શનિ" },
  "कार्तिकेय": { en: "Kartikeya", gu: "કાર્તિકેય" },
  "दत्तात्रेय": { en: "Dattatreya", gu: "દત્તાત્રેય" },
  "नृसिंह": { en: "Narasimha", gu: "નૃસિંહ" },
  "वासुदेव": { en: "Vasudeva", gu: "વાસુદેવ" },
  "दुर्गा": { en: "Durga", gu: "દુર્ગા" },
  "सार्वभौमिक": { en: "Universal", gu: "સાર્વભૌમિક" },
  "गुरु": { en: "Guru", gu: "ગુરુ" },
};

function trShastroktDeity(d: string, cLang: string): string {
  if (cLang === "en") return SHASTROKT_DEITY_LABELS[d]?.en || trVedic(d, "en");
  if (cLang === "gu") return SHASTROKT_DEITY_LABELS[d]?.gu || trVedic(d, "gu");
  return d;
}

export function ShastroktUpayView() {
  const { language } = useLanguage();
  const cLang = (language || "hi").slice(0, 2).toLowerCase();
  const L = <T,>(hi: T, en: T, gu: T): T => (cLang === "en" ? en : cLang === "gu" ? gu : hi);

  const [query, setQuery] = useState("");
  const [deity, setDeity] = useState("all");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const needle = query.trim().toLowerCase();
  const list = useMemo(
    () =>
      SHASTROKT_UPAY.filter((item) => {
        if (deity !== "all" && item.deity !== deity) return false;
        if (!needle) return true;
        return `${item.title} ${item.mantra} ${item.deity} ${item.purpose} ${item.planet}`.toLowerCase().includes(needle);
      }),
    [deity, needle],
  );
  const selected = SHASTROKT_UPAY.find((item) => item.id === selectedId) ?? null;
  useTabMenu(() => {
    if (selectedId == null) return false;
    setSelectedId(null);
    return true;
  });

  return (
    <div className="flex-1 min-h-0 h-full w-full flex flex-col overflow-hidden">
      <div className="shrink-0 relative z-10 px-3 pt-1 pb-2 flex flex-col gap-1.5 bg-[#fff7ef]">
        {selected ? (
          <button type="button" className="text-left text-sm font-semibold truncate" onClick={() => setSelectedId(null)}>
            ← {selected.id}. {selected.title}
          </button>
        ) : (
          <>
            <div className="text-[13px] font-bold" style={{ color: "#4A0E0E" }}>
              {L(`501 मंत्र · ${list.length}`, `501 Mantras · ${list.length}`, `૫૦૧ મંત્રો · ${list.length}`)}
            </div>
            <p className="text-[11px] leading-snug font-semibold" style={{ color: "#4A2511" }}>
              {L(
                SHASTROKT_NOTE,
                "Authentic Shastrokt Vedic mantras and Sattvic remedies for daily worship, planetary harmony, and spiritual growth.",
                "દૈનિક ઉપાસના, ગ્રહ શાંતિ અને આધ્યાત્મિક ઉન્નતિ માટે પ્રામાણિક શાસ્ત્રોક્ત વૈદિક મંત્રો અને સાત્વિક ઉપાયો."
              )}
            </p>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={L("मंत्र, देवता या उद्देश्य खोजें", "Search mantra, deity or purpose...", "મંત્ર, દેવતા અથવા હેતુ શોધો...")}
              className="w-full rounded-xl border px-3 py-1.5 text-sm bg-white"
              style={{ color: "#1F1006", borderColor: "#C89D66" }}
            />
            <div className="flex gap-1.5 overflow-x-auto pb-0.5">
              <Chip active={deity === "all"} onClick={() => setDeity("all")}>
                {L("सभी", "All", "બધા")}
              </Chip>
              {SHASTROKT_DEITIES.map((item) => (
                <Chip key={item} active={deity === item} onClick={() => setDeity(item)}>
                  {trShastroktDeity(item, cLang)}
                </Chip>
              ))}
            </div>
          </>
        )}
      </div>
      <div
        className="flex-1 min-h-0 h-full w-full overflow-y-auto overscroll-y-contain px-2 pb-28 flex flex-col gap-1.5"
        style={{ WebkitOverflowScrolling: "touch", touchAction: "pan-y" }}
      >
        {selected ? <Detail item={selected} /> : list.map((item) => (
          <button
            key={item.id}
            type="button"
            className="bx-verse text-left w-full cursor-pointer"
            style={{ touchAction: "pan-y" }}
            onClick={() => setSelectedId(item.id)}
          >
            <div className="bx-kicker">{item.id} · {trShastroktDeity(item.deity, cLang)}</div>
            <strong className="text-sm font-bold" style={{ color: "#241004" }}>{item.title}</strong>
            <span className="text-xs font-semibold" style={{ color: "#4A0E0E" }}>{item.mantra}</span>
          </button>
        ))}
        {!selected && list.length === 0 ? (
          <article className="bx-verse">
            {L("इस खोज में कोई मंत्र नहीं मिला।", "No mantras matched your search.", "આ શોધમાં કોઈ મંત્ર મળ્યો નથી.")}
          </article>
        ) : null}
      </div>
    </div>
  );
}

function Detail({ item }: { item: ShastroktUpay }) {
  const { language } = useLanguage();
  const cLang = (language || "hi").slice(0, 2).toLowerCase();
  const L = <T,>(hi: T, en: T, gu: T): T => (cLang === "en" ? en : cLang === "gu" ? gu : hi);

  const [posterData, setPosterData] = useState<ShlokaPosterData | null>(null);
  const steps: [string, string][] = [
    [L("तैयारी", "Preparation", "તૈયારી"), item.preparation],
    [L("पूजा", "Worship", "પૂજા"), item.worship],
    [L("संकल्प", "Sankalpa", "સંકલ્પ"), item.sankalp],
    [L("जप", "Japa Process", "જપ વિધિ"), item.japaProcess],
    [L("सावधानी", "Precautions", "સાવધાની"), item.precautions],
  ];
  return (
    <>
      <div className="flex justify-end px-1 pt-1">
        <button
          type="button"
          onClick={() =>
            setPosterData({
              title: item.title,
              reference: `${trShastroktDeity(item.deity, cLang)} · ${item.category}`,
              sanskrit: item.mantra,
              meaning: `${L("उद्देश्य:", "Purpose:", "હેતુ:")} ${item.purpose}\n${L("विधि:", "Method:", "વિધિ:")} ${item.method}\n${L("फल:", "Benefit:", "ફળ:")} ${item.benefit}`,
              accentTag: L("🕉️ शास्त्रोक्त वैदिक मंत्र", "🕉️ Shastrokt Vedic Mantra", "🕉️ શાસ્ત્રોક્ત વૈદિક મંત્ર"),
            })
          }
          style={{ backgroundColor: "#6E1409", color: "#FFFFFF" }}
          className="px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer"
        >
          {L("📸 स्टेटस कार्ड", "📸 Status Card", "📸 સ્ટેટસ કાર્ડ")}
        </button>
      </div>
      <article className="bx-verse">
        <div className="bx-kicker">{trShastroktDeity(item.deity, cLang)} · {item.category}</div>
        <p className="font-granth font-bold text-[18px] leading-relaxed" style={{ color: "#4A0E0E" }}>{item.mantra}</p>
        <p className="text-sm font-semibold" style={{ color: "#241004" }}>{item.purpose}</p>
      </article>
      <article className="bx-verse">
        <div className="bx-kicker">{L("संक्षिप्त विधि", "Brief Method", "સંક્ષિપ્ત વિધિ")}</div>
        <p className="text-sm">{item.method}</p>
      </article>
      <article className="bx-verse">
        <div className="bx-kicker">{L("दिन · समय · माला", "Day · Time · Mala", "વાર · સમય · માળા")}</div>
        <p className="text-sm">{item.day}</p>
        <p className="text-sm">{item.time} · {item.direction}</p>
        <p className="text-sm">{item.mala}</p>
        <p className="text-xs opacity-80">{item.planet}</p>
      </article>
      <article className="bx-verse">
        <div className="bx-kicker">{L("संख्या · संकल्प", "Count · Sankalpa", "સંખ્યા · સંકલ્પ")}</div>
        <p className="text-sm">{item.japa}</p>
        <p className="text-sm">{item.target}</p>
        <p className="text-sm">{item.days}</p>
      </article>
      {steps.map(([label, text]) => text ? (
        <article key={label} className="bx-verse">
          <div className="bx-kicker">{label}</div>
          <p className="text-sm">{text}</p>
        </article>
      ) : null)}
      <article className="bx-verse">
        <div className="bx-kicker">{L("परंपरागत फल", "Traditional Benefit", "પરંપરાગત ફળ")}</div>
        <p className="text-sm">{item.benefit}</p>
      </article>
      <article className="bx-verse">
        <div className="bx-kicker">{L("स्रोत", "Source", "સ્રોત")}</div>
        <p className="text-xs leading-relaxed font-semibold" style={{ color: "#241004" }}>{item.source}</p>
        <p className="text-xs leading-relaxed font-semibold" style={{ color: "#4A2511" }}>{item.caution}</p>
      </article>
      <ShlokaPosterModal
        isOpen={posterData !== null}
        onClose={() => setPosterData(null)}
        data={posterData}
      />
    </>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="shrink-0 rounded-full px-3 py-1 text-[11px] font-bold"
      style={{ background: active ? "#5C3A21" : "#F4E8D1", color: active ? "#FAF2E4" : "#3a2414" }}
    >
      {children}
    </button>
  );
}
