import raw from "./sabar.json";

type RawUpay = {
  id: number;
  category: string;
  title: string;
  problem: string;
  materials: string[];
  method: string;
  mantra: string;
  count: number;
  duration_days: number;
  day: string;
  time: string;
  cost: string;
  difficulty: string;
  basis: string;
  caution: string;
};

export type SabarMantra = {
  id: number;
  category: string;
  title: string;
  use: string;
  mantra: string;
  vidhi: string[];
  japa: string;
  day: string;
  caution: string;
};

function japa(item: RawUpay) {
  if (!item.count) return `${item.duration_days} दिन`;
  return `${item.count} बार · ${item.duration_days} दिन · ${item.time}`;
}

export const SABAR_MANTRAS: SabarMantra[] = (raw.upay as RawUpay[]).map((item) => ({
  id: item.id,
  category: item.category,
  title: item.title,
  use: item.problem,
  mantra: item.mantra,
  vidhi: item.method.split("\n").map((line) => line.trim()).filter(Boolean),
  japa: japa(item),
  day: item.day,
  caution: item.caution,
}));

export const SABAR_CATEGORIES = [...new Set(SABAR_MANTRAS.map((item) => item.category))];
