import React from "react";
import { ZeroScrollPager } from "./ZeroScrollPager";

export type PathVerse = { n: number; kind?: string; text: string };

export function ScripturePathView({ title, verses }: { title: string; verses: PathVerse[] }) {
  return (
    <div className="w-full h-full min-h-0 flex flex-col overflow-hidden">
      <div className="shrink-0 px-3 pt-1 text-[13px] font-semibold truncate">{title}</div>
      <ZeroScrollPager className="flex-1 min-h-0" contentClassName="px-2 pt-1 pb-0.5 flex flex-col gap-1.5" resetKey={`${title}-${verses.length}`}>
        {verses.map((verse) => (
          <article key={`${verse.kind || "v"}-${verse.n}`} className="bx-verse">
            <div className="bx-kicker">{verse.kind ? `${verse.kind} · ` : ""}{verse.n} / {verses.length}</div>
            <p className="bx-sans font-granth text-[15px] whitespace-pre-wrap">{verse.text}</p>
          </article>
        ))}
      </ZeroScrollPager>
    </div>
  );
}

export default ScripturePathView;
