import React, { useMemo, useState } from "react";
import { VASTU_501, VASTU_CATEGORIES, VASTU_NOTE, type VastuUpay } from "../data/vastu501";

export function Vastu501Panel() {
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

  return (
    <div className="flex flex-col gap-1.5 min-h-0">
      <div className="shrink-0 flex flex-col gap-1.5 bg-[#fff7ef] pb-1">
        {selected ? (
          <button type="button" className="text-left text-sm font-semibold" onClick={() => setSelectedId(null)}>
            ← {selected.id}. {selected.location}
          </button>
        ) : (
          <>
            <div className="text-[13px] font-semibold">वास्तु · बिना तोड़फोड़ · {list.length}</div>
            <p className="text-[11px] leading-snug opacity-80">{VASTU_NOTE}</p>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="जगह या काम खोजें"
              className="w-full rounded-xl border px-3 py-1.5 text-sm bg-transparent"
            />
            <div className="flex gap-1.5 overflow-x-auto pb-0.5">
              <Chip active={category === "all"} onClick={() => setCategory("all")}>सभी</Chip>
              {VASTU_CATEGORIES.map((item) => (
                <Chip key={item} active={category === item} onClick={() => setCategory(item)}>{item}</Chip>
              ))}
            </div>
          </>
        )}
      </div>
      <div className="flex flex-col gap-1.5 pb-4">
        {selected ? <Detail item={selected} /> : list.map((item) => (
          <button key={item.id} type="button" className="bx-verse text-left w-full" onClick={() => setSelectedId(item.id)}>
            <div className="bx-kicker">{item.id} · {item.category} · {item.location}</div>
            <strong className="text-sm">{item.title.replace(/ — उपाय \d+$/, "")}</strong>
            <span className="text-xs opacity-80">{item.purpose} · {item.cost}</span>
          </button>
        ))}
        {!selected && list.length === 0 ? <article className="bx-verse">इस खोज में कोई उपाय नहीं मिला।</article> : null}
      </div>
    </div>
  );
}

function Detail({ item }: { item: VastuUpay }) {
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
          <div className="bx-kicker">चरण {index + 1}</div>
          <p className="text-sm">{step}</p>
        </article>
      ))}
      <article className="bx-verse">
        <div className="bx-kicker">सामग्री · समय</div>
        <p className="text-sm">{item.materials}</p>
        <p className="text-sm">{item.duration}</p>
      </article>
      <article className="bx-verse">
        <div className="bx-kicker">दिशा</div>
        <p className="text-sm">{item.direction}</p>
      </article>
      <article className="bx-verse">
        <div className="bx-kicker">मंत्र</div>
        <p className="text-sm">{item.mantra}</p>
      </article>
      <article className="bx-verse">
        <div className="bx-kicker">संदर्भ</div>
        <p className="text-sm">{item.context}</p>
        <p className="text-xs opacity-80">{item.source}. {item.scope}</p>
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
      style={{ background: active ? "#5C3A21" : "#F4E8D1", color: active ? "#FAF2E4" : "#3a2414" }}
    >
      {children}
    </button>
  );
}
