import React, { useMemo, useState } from "react";
import { SABAR_CATEGORIES, SABAR_MANTRAS, type SabarMantra } from "../data/saral/sabar";
import { ZeroScrollPager } from "./ZeroScrollPager";

export function SabarMantraView() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const needle = query.trim().toLowerCase();
  const list = useMemo(
    () =>
      SABAR_MANTRAS.filter((item) => {
        if (category !== "all" && item.category !== category) return false;
        if (!needle) return true;
        return `${item.title} ${item.use} ${item.mantra} ${item.category}`.toLowerCase().includes(needle);
      }),
    [category, needle],
  );
  const selected = SABAR_MANTRAS.find((item) => item.id === selectedId) ?? null;

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="shrink-0 px-3 pt-1 pb-1 flex flex-col gap-1.5">
        {selected ? (
          <button type="button" className="text-left text-sm font-semibold truncate" onClick={() => setSelectedId(null)}>
            ← {selected.id}. {selected.title}
          </button>
        ) : (
          <>
            <div className="text-[13px] font-semibold">साबर मंत्र · {list.length}</div>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="मंत्र या काम खोजें"
              className="w-full rounded-xl border px-3 py-1.5 text-sm bg-transparent"
            />
            <div className="flex gap-1.5 overflow-x-auto pb-0.5">
              <Chip active={category === "all"} onClick={() => setCategory("all")}>सभी</Chip>
              {SABAR_CATEGORIES.map((item) => (
                <Chip key={item} active={category === item} onClick={() => setCategory(item)}>{item}</Chip>
              ))}
            </div>
          </>
        )}
      </div>
      <ZeroScrollPager
        className="flex-1 min-h-0"
        contentClassName="px-2 pb-1 flex flex-col gap-1.5"
        resetKey={selected ? `sabar-${selected.id}` : `list-${category}-${needle}`}
      >
        {selected ? <Detail item={selected} /> : list.map((item) => (
          <button key={item.id} type="button" className="bx-verse text-left w-full" onClick={() => setSelectedId(item.id)}>
            <div className="bx-kicker">{item.id} · {item.category}</div>
            <strong className="text-sm">{item.title}</strong>
            <span className="text-xs opacity-80">{item.use} · {item.japa} · {item.day}</span>
          </button>
        ))}
        {!selected && list.length === 0 ? <article className="bx-verse">कोई साबर मंत्र इस खोज में नहीं मिला।</article> : null}
      </ZeroScrollPager>
    </div>
  );
}

function Detail({ item }: { item: SabarMantra }) {
  return (
    <>
      <article className="bx-verse">
        <div className="bx-kicker">{item.category} · पूरा मंत्र</div>
        <p className="font-granth whitespace-pre-wrap text-[16px] leading-relaxed">{item.mantra}</p>
      </article>
      <article className="bx-verse">
        <div className="bx-kicker">जाप और समय</div>
        <p>{item.japa} · {item.day}</p>
        <p className="text-xs opacity-80">{item.use}</p>
      </article>
      {item.vidhi.map((step, index) => (
        <article key={index} className="bx-verse">
          <div className="bx-kicker">विधि · चरण {index + 1}</div>
          <p>{step}</p>
        </article>
      ))}
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
