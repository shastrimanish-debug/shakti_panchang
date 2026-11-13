import React, { useMemo, useState } from "react";
import { VASTU_501, VASTU_CATEGORIES, VASTU_NOTE, type VastuUpay } from "../data/vastu501";
import { useLanguage } from "../i18n";
import { trVedic } from "../i18n/vedicTranslate";

const CAT_LABELS: Record<string, { en: string; gu: string }> = {
  "प्रवेश व द्वार": { en: "Entrance & Door", gu: "પ્રવેશ અને દ્વાર" },
  "रसोई व अग्नि": { en: "Kitchen & Fire", gu: "રસોડું અને અગ્નિ" },
  "शयन व आराम": { en: "Bedroom & Rest", gu: "શયન અને આરામ" },
  "जल व स्नानघर": { en: "Water & Bathroom", gu: "જળ અને સ્નાનઘર" },
  "पूजा व अध्यात्म": { en: "Puja & Spirituality", gu: "પૂજા અને અધ્યાત્મ" },
  "धन व व्यापार": { en: "Wealth & Business", gu: "ધન અને વેપાર" },
  "शिक्षा व कार्य": { en: "Study & Work", gu: "શિક્ષા અને કાર્ય" },
  "दोष निवारण": { en: "Dosha Remedies", gu: "દોષ નિવારણ" },
  "सफाई व व्यवस्था": { en: "Cleanliness & Order", gu: "સફાઈ અને વ્યવસ્થા" },
  "प्रकृति व प्रकाश": { en: "Nature & Light", gu: "પ્રકૃતિ અને પ્રકાશ" },
};

export function Vastu501Panel() {
  const { language } = useLanguage();
  const cLang = (language || "hi").slice(0, 2).toLowerCase();
  const L = <T,>(hi: T, en: T, gu: T): T => (cLang === "en" ? en : cLang === "gu" ? gu : hi);

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const needle = query.trim().toLowerCase();
  const list = useMemo(
    () =>
      VASTU_501.filter((item) => {
        if (category !== "all" && item.category !== category) return false;
        if (!needle) return true;
        return `${item.title} ${item.location} ${item.purpose} ${item.category}`.toLowerCase().includes(needle);
      }),
    [category, needle],
  );
  const selected = VASTU_501.find((item) => item.id === selectedId) ?? null;

  const getCatLabel = (cat: string) => {
    if (cLang === "en" && CAT_LABELS[cat]) return CAT_LABELS[cat].en;
    if (cLang === "gu" && CAT_LABELS[cat]) return CAT_LABELS[cat].gu;
    return cLang === "hi" ? cat : trVedic(cat, cLang);
  };

  return (
    <div className="flex flex-col gap-1.5 min-h-0">
      <div className="shrink-0 flex flex-col gap-1.5 bg-[#fff7ef] pb-1">
        {selected ? (
          <button type="button" className="text-left text-sm font-semibold cursor-pointer" onClick={() => setSelectedId(null)}>
            ← {selected.id}. {selected.location}
          </button>
        ) : (
          <>
            <div className="text-[13px] font-semibold">
              {L(`वास्तु · बिना तोड़फोड़ · ${list.length}`, `Vastu · No Demolition · ${list.length}`, `વાસ્તુ · તોડફોડ વગર · ${list.length}`)}
            </div>
            <p className="text-[11px] leading-snug opacity-80">
              {cLang === "hi"
                ? VASTU_NOTE
                : cLang === "en"
                ? "Traditional Vedic Vastu remedies without structural demolition, aligned with directional elements & energy balance."
                : "તોડફોડ વગરના પરંપરાગત વૈદિક વાસ્તુ ઉપાયો, દિશા તત્વ અને ઊર્જા સંતુલન આધારિત."}
            </p>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={L("जगह या काम खोजें", "Search place or purpose...", "સ્થળ કે કાર્ય શોધો...")}
              className="w-full rounded-xl border px-3 py-1.5 text-sm bg-transparent"
            />
            <div className="flex gap-1.5 overflow-x-auto pb-0.5">
              <Chip active={category === "all"} onClick={() => setCategory("all")}>
                {L("सभी", "All", "બધા")}
              </Chip>
              {VASTU_CATEGORIES.map((item) => (
                <Chip key={item} active={category === item} onClick={() => setCategory(item)}>
                  {getCatLabel(item)}
                </Chip>
              ))}
            </div>
          </>
        )}
      </div>
      <div className="flex flex-col gap-1.5 pb-4">
        {selected ? (
          <Detail item={selected} cLang={cLang} />
        ) : (
          list.map((item) => (
            <button key={item.id} type="button" className="bx-verse text-left w-full cursor-pointer" onClick={() => setSelectedId(item.id)}>
              <div className="bx-kicker">{item.id} · {getCatLabel(item.category)} · {item.location}</div>
              <strong className="text-sm">{item.title.replace(/ — उपाय \d+$/, "")}</strong>
              <span className="text-xs opacity-80">{item.purpose} · {item.cost}</span>
            </button>
          ))
        )}
        {!selected && list.length === 0 ? (
          <article className="bx-verse">
            {L("इस खोज में कोई उपाय नहीं मिला।", "No remedies found for this search.", "આ શોધમાં કોઈ ઉપાય મળ્યો નથી.")}
          </article>
        ) : null}
      </div>
    </div>
  );
}

function Detail({ item, cLang }: { item: VastuUpay; cLang: string }) {
  const L = <T,>(hi: T, en: T, gu: T): T => (cLang === "en" ? en : cLang === "gu" ? gu : hi);
  const steps = item.method.split("\n").map((line) => line.trim()).filter(Boolean);
  return (
    <>
      <article className="bx-verse">
        <div className="bx-kicker">{item.location} · {item.difficulty} · {item.cost}</div>
        <p className="text-sm">{item.purpose}</p>
        <p className="text-xs opacity-80">{item.problem}</p>
      </article>
      {steps.map((step, index) => (
        <article key={index} className="bx-verse">
          <div className="bx-kicker">{L("चरण", "Step", "ચરણ")} {index + 1}</div>
          <p className="text-sm">{step}</p>
        </article>
      ))}
      <article className="bx-verse">
        <div className="bx-kicker">{L("सामग्री · समय", "Materials · Duration", "સામગ્રી · સમય")}</div>
        <p className="text-sm">{item.materials}</p>
        <p className="text-sm">{item.duration}</p>
      </article>
      <article className="bx-verse">
        <div className="bx-kicker">{L("दिशा", "Direction", "દિશા")}</div>
        <p className="text-sm">{trVedic(item.direction, cLang)}</p>
      </article>
      <article className="bx-verse">
        <div className="bx-kicker">{L("मंत्र", "Mantra", "મંત્ર")}</div>
        <p className="text-sm">{item.mantra}</p>
      </article>
      <article className="bx-verse">
        <div className="bx-kicker">{L("संदर्भ", "Reference", "સંદર્ભ")}</div>
        <p className="text-sm">{item.context}</p>
        <p className="text-xs opacity-80">{item.source}. {item.scope}</p>
      </article>
      <article className="bx-verse">
        <div className="bx-kicker">{L("सावधानी", "Caution", "સાવચેતી")}</div>
        <p className="text-sm">{item.caution}</p>
      </article>
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
