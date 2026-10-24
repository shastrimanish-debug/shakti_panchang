import React, { useMemo, useState } from "react";
import { SHASTROKT_DEITIES, SHASTROKT_NOTE, SHASTROKT_UPAY, type ShastroktUpay } from "../data/shastrokt";
import { useTabMenu } from "./BoardShell";
import { ShlokaPosterModal, ShlokaPosterData } from "./ShlokaPosterModal";

export function ShastroktUpayView() {
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
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
      <div className="shrink-0 relative z-10 px-3 pt-1 pb-2 flex flex-col gap-1.5 bg-[#fff7ef]">
        {selected ? (
          <button type="button" className="text-left text-sm font-semibold truncate" onClick={() => setSelectedId(null)}>
            ← {selected.id}. {selected.title}
          </button>
        ) : (
          <>
            <div className="text-[13px] font-bold" style={{ color: "#4A0E0E" }}>501 मंत्र · {list.length}</div>
            <p className="text-[11px] leading-snug font-semibold" style={{ color: "#4A2511" }}>{SHASTROKT_NOTE}</p>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="मंत्र, देवता या उद्देश्य खोजें"
              className="w-full rounded-xl border px-3 py-1.5 text-sm bg-white"
              style={{ color: "#1F1006", borderColor: "#C89D66" }}
            />
            <div className="flex gap-1.5 overflow-x-auto pb-0.5">
              <Chip active={deity === "all"} onClick={() => setDeity("all")}>सभी</Chip>
              {SHASTROKT_DEITIES.map((item) => (
                <Chip key={item} active={deity === item} onClick={() => setDeity(item)}>{item}</Chip>
              ))}
            </div>
          </>
        )}
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-2 pb-16 flex flex-col gap-1.5">
        {selected ? <Detail item={selected} /> : list.map((item) => (
          <button key={item.id} type="button" className="bx-verse text-left w-full" onClick={() => setSelectedId(item.id)}>
            <div className="bx-kicker">{item.id} · {item.deity}</div>
            <strong className="text-sm font-bold" style={{ color: "#241004" }}>{item.title}</strong>
            <span className="text-xs font-semibold" style={{ color: "#4A0E0E" }}>{item.mantra}</span>
          </button>
        ))}
        {!selected && list.length === 0 ? <article className="bx-verse">इस खोज में कोई मंत्र नहीं मिला।</article> : null}
      </div>
    </div>
  );
}

function Detail({ item }: { item: ShastroktUpay }) {
  const [posterData, setPosterData] = useState<ShlokaPosterData | null>(null);
  const steps: [string, string][] = [
    ["तैयारी", item.preparation],
    ["पूजा", item.worship],
    ["संकल्प", item.sankalp],
    ["जप", item.japaProcess],
    ["सावधानी", item.precautions],
  ];
  return (
    <>
      <div className="flex justify-end px-1 pt-1">
        <button
          type="button"
          onClick={() =>
            setPosterData({
              title: item.title,
              reference: `${item.deity} · ${item.category}`,
              sanskrit: item.mantra,
              meaning: `उद्देश्य: ${item.purpose}\nविधि: ${item.method}\nफल: ${item.benefit}`,
              accentTag: "🕉️ शास्त्रोक्त वैदिक मंत्र",
            })
          }
          style={{ backgroundColor: "#6E1409", color: "#FFFFFF" }}
          className="px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer"
        >
          📸 स्टेटस कार्ड
        </button>
      </div>
      <article className="bx-verse">
        <div className="bx-kicker">{item.deity} · {item.category}</div>
        <p className="font-granth font-bold text-[18px] leading-relaxed" style={{ color: "#4A0E0E" }}>{item.mantra}</p>
        <p className="text-sm font-semibold" style={{ color: "#241004" }}>{item.purpose}</p>
      </article>
      <article className="bx-verse">
        <div className="bx-kicker">संक्षिप्त विधि</div>
        <p className="text-sm">{item.method}</p>
      </article>
      <article className="bx-verse">
        <div className="bx-kicker">दिन · समय · माला</div>
        <p className="text-sm">{item.day}</p>
        <p className="text-sm">{item.time} · {item.direction}</p>
        <p className="text-sm">{item.mala}</p>
        <p className="text-xs opacity-80">{item.planet}</p>
      </article>
      <article className="bx-verse">
        <div className="bx-kicker">संख्या · संकल्प</div>
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
        <div className="bx-kicker">परंपरागत फल</div>
        <p className="text-sm">{item.benefit}</p>
      </article>
      <article className="bx-verse">
        <div className="bx-kicker">स्रोत</div>
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
