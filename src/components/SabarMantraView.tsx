import React, { useMemo, useState } from "react";
import { SABAR_DEITIES, SABAR_MANTRAS, SABAR_NOTE, type SabarMantra } from "../data/saral/sabar";
import { shareTextContent } from "../lib/shareHelper";
import { Share2 } from "lucide-react";
import { useTabMenu } from "./BoardShell";

export function SabarMantraView() {
  const [query, setQuery] = useState("");
  const [deity, setDeity] = useState("all");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const needle = query.trim().toLowerCase();
  const list = useMemo(
    () =>
      SABAR_MANTRAS.filter((item) => {
        if (deity !== "all" && item.deity !== deity) return false;
        if (!needle) return true;
        return `${item.title} ${item.use} ${item.mantra} ${item.deity} ${item.planet}`.toLowerCase().includes(needle);
      }),
    [deity, needle],
  );
  const selected = SABAR_MANTRAS.find((item) => item.id === selectedId) ?? null;
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
            <div className="text-[13px] font-semibold">शाबर मंत्र · {list.length}</div>
            <p className="text-[11px] leading-snug opacity-80">{SABAR_NOTE}</p>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="मंत्र, देवता या काम खोजें"
              className="w-full rounded-xl border px-3 py-1.5 text-sm bg-transparent"
            />
            <div className="flex gap-1.5 overflow-x-auto pb-0.5">
              <Chip active={deity === "all"} onClick={() => setDeity("all")}>सभी</Chip>
              {SABAR_DEITIES.map((item) => (
                <Chip key={item} active={deity === item} onClick={() => setDeity(item)}>{item}</Chip>
              ))}
            </div>
          </>
        )}
      </div>
      <div className="flex-1 min-h-0 w-full overflow-y-auto overscroll-contain px-2 pb-16 flex flex-col gap-1.5">
        {selected ? <Detail item={selected} /> : list.map((item) => (
          <button key={item.id} type="button" className="bx-verse text-left w-full" onClick={() => setSelectedId(item.id)}>
            <div className="bx-kicker">{item.deity}</div>
            <strong className="text-sm">{item.title}</strong>
            <span className="text-xs opacity-80">{item.use} · {item.day}</span>
          </button>
        ))}
        {!selected && list.length === 0 ? <article className="bx-verse">कोई साबर मंत्र इस खोज में नहीं मिला।</article> : null}
      </div>
    </div>
  );
}

function Detail({ item }: { item: SabarMantra }) {
  const handleShare = () => {
    const text = `॥ ${item.title} ॥\n(${item.deity})\n\nमंत्र:\n${item.mantra}\n\nउद्देश्य: ${item.use}\nदिन: ${item.day}\nसमय: ${item.time}\nदिशा: ${item.direction}\nमाला: ${item.mala}\nजप: ${item.japa}\nसंकल्प: ${item.days}\n\nतैयारी: ${item.preparation}\nपूजा: ${item.worship}\nजप विधि: ${item.japaProcess}\n\n${item.caution}\n\n_शक्ति पंचांग_`;
    shareTextContent({ title: item.title, text });
  };

  return (
    <>
      <div className="flex justify-end px-1 pt-1">
        <button
          type="button"
          onClick={handleShare}
          className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 bg-[#25D366] text-white rounded-lg shadow-xs"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>व्हाट्सएप शेयर</span>
        </button>
      </div>

      <article className="bx-verse">
        <div className="bx-kicker">{item.deity} · पूरा मंत्र</div>
        <p className="font-granth whitespace-pre-wrap text-[16px] leading-relaxed">{item.mantra}</p>
        <p className="text-sm">{item.use}</p>
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
        <p className="text-sm">{item.days}</p>
      </article>
      {item.preparation ? (
        <article className="bx-verse">
          <div className="bx-kicker">तैयारी</div>
          <p className="text-sm">{item.preparation}</p>
        </article>
      ) : null}
      {item.worship ? (
        <article className="bx-verse">
          <div className="bx-kicker">पूजा</div>
          <p className="text-sm">{item.worship}</p>
        </article>
      ) : null}
      {item.japaProcess ? (
        <article className="bx-verse">
          <div className="bx-kicker">जप</div>
          <p className="text-sm">{item.japaProcess}</p>
        </article>
      ) : null}
      <article className="bx-verse">
        <div className="bx-kicker">स्रोत</div>
        <p className="text-xs leading-relaxed">{item.caution}</p>
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
