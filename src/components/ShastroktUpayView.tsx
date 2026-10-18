import React, { useMemo, useState } from "react";
import { SHASTROKT_CATEGORIES, SHASTROKT_DISCLAIMER, SHASTROKT_UPAY, type ShastroktUpay } from "../data/shastrokt";
import { useTabMenu } from "./BoardShell";

export function ShastroktUpayView() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const needle = query.trim().toLowerCase();
  const list = useMemo(
    () =>
      SHASTROKT_UPAY.filter((item) => {
        if (category !== "all" && item.category !== category) return false;
        if (!needle) return true;
        return `${item.title} ${item.purpose} ${item.category} ${item.verse} ${item.evidence}`.toLowerCase().includes(needle);
      }),
    [category, needle],
  );
  const selected = SHASTROKT_UPAY.find((item) => item.id === selectedId) ?? null;
  useTabMenu(() => {
    if (selectedId == null) return false;
    setSelectedId(null);
    return true;
  });

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="shrink-0 px-3 pt-1 pb-1 flex flex-col gap-1.5">
        {selected ? (
          <button type="button" className="text-left text-sm font-semibold truncate" onClick={() => setSelectedId(null)}>
            ← {selected.id}. {selected.title}
          </button>
        ) : (
          <>
            <div className="text-[13px] font-semibold">शास्त्रोक्त सात्त्विक उपाय · {list.length}</div>
            <p className="text-[11px] leading-snug opacity-80">{SHASTROKT_DISCLAIMER}</p>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="उद्देश्य, श्रेणी या श्लोक खोजें"
              className="w-full rounded-xl border px-3 py-1.5 text-sm bg-transparent"
            />
            <div className="flex gap-1.5 overflow-x-auto pb-0.5">
              <Chip active={category === "all"} onClick={() => setCategory("all")}>सभी</Chip>
              {SHASTROKT_CATEGORIES.map((item) => (
                <Chip key={item} active={category === item} onClick={() => setCategory(item)}>{item}</Chip>
              ))}
            </div>
          </>
        )}
      </div>
      <div className="flex-1 min-h-0 w-full overflow-y-auto overscroll-contain px-2 pb-16 flex flex-col gap-1.5">
        {selected ? <Detail item={selected} /> : list.map((item) => (
          <button key={item.id} type="button" className="bx-verse text-left w-full" onClick={() => setSelectedId(item.id)}>
            <div className="bx-kicker">{item.id} · {item.category}</div>
            <strong className="text-sm">{item.title}</strong>
            <span className="text-xs opacity-80">{item.purpose} · {item.verse}</span>
          </button>
        ))}
        {!selected && list.length === 0 ? <article className="bx-verse">इस खोज में कोई उपाय नहीं मिला।</article> : null}
      </div>
    </div>
  );
}

function Detail({ item }: { item: ShastroktUpay }) {
  const steps = item.method.split("\n").map((line) => line.trim()).filter(Boolean);
  return (
    <>
      <article className="bx-verse">
        <div className="bx-kicker">{item.category} · {item.evidence}</div>
        <p>{item.purpose}</p>
      </article>
      {steps.map((step, index) => (
        <article key={index} className="bx-verse">
          <div className="bx-kicker">विधि · चरण {index + 1}</div>
          <p>{step}</p>
        </article>
      ))}
      <article className="bx-verse">
        <div className="bx-kicker">सामग्री · समय</div>
        <p>{item.materials.join(", ")}</p>
        <p className="text-xs opacity-80">{item.count}</p>
        <p className="text-xs opacity-80">{item.duration} · {item.cost}</p>
      </article>
      <article className="bx-verse">
        <div className="bx-kicker">शास्त्रीय संदर्भ · {item.verse}</div>
        <p className="font-granth whitespace-pre-wrap text-[16px] leading-relaxed">{item.original}</p>
        <p className="text-xs opacity-80">{item.source}</p>
        <p className="text-sm">{item.scope}</p>
      </article>
      <article className="bx-verse">
        <div className="bx-kicker">मंत्र</div>
        <p className="text-sm">{item.mantra}</p>
      </article>
      <article className="bx-verse">
        <div className="bx-kicker">सावधानी</div>
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
      style={{ background: active ? "var(--bx-mark, #5C3A21)" : "var(--bx-panel, #F4E8D1)", color: active ? "var(--bx-cream, #FAF2E4)" : "inherit" }}
    >
      {children}
    </button>
  );
}
