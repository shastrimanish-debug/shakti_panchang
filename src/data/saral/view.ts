import type { Upay } from "./catalog";
import bn from "./bodies/bn.json";
import en from "./bodies/en.json";
import gu from "./bodies/gu.json";
import kn from "./bodies/kn.json";
import ml from "./bodies/ml.json";
import mr from "./bodies/mr.json";
import pa from "./bodies/pa.json";
import ta from "./bodies/ta.json";
import te from "./bodies/te.json";
import or from "./bodies/or.json";
import { gloss } from "./glossary";
import { mantraMeaning } from "./mantras";
import type { LangCode } from "./languages";

export type Body = {
  title: string;
  problem: string;
  method: string;
  caution: string;
  basis: string;
};

export const BODY_PACKS: Partial<Record<LangCode, Record<string, Body>>> = {
  en: en as Record<string, Body>,
  gu: gu as Record<string, Body>,
  mr: mr as Record<string, Body>,
  bn: bn as Record<string, Body>,
  ta: ta as Record<string, Body>,
  te: te as Record<string, Body>,
  kn: kn as Record<string, Body>,
  ml: ml as Record<string, Body>,
  pa: pa as Record<string, Body>,
  or: or as Record<string, Body>,
};

export function viewOf(item: Upay, lang: LangCode) {
  const translated =
    lang === "hi" ? undefined : (BODY_PACKS[lang]?.[String(item.id)] ?? BODY_PACKS.en?.[String(item.id)]);
  return {
    title: translated?.title ?? item.title,
    problem: translated?.problem ?? item.problem,
    method: translated?.method ?? item.method,
    caution: translated?.caution ?? item.caution,
    basis: translated?.basis ?? item.basis,
    category: gloss(lang, item.category),
    day: gloss(lang, item.day),
    time: gloss(lang, item.time),
    cost: gloss(lang, item.cost),
    difficulty: gloss(lang, item.difficulty),
    materials: item.materials.map((material) => gloss(lang, material)),
    mantra: item.mantra,
    mantraMeaning: mantraMeaning(item.mantra, lang),
  };
}
