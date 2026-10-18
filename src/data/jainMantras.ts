import raw from "./jain501.json";

export interface JainMantra {
  id: number;
  title: string;
  category: string;
  mantra: string;
  beej?: string;
  riddhi?: string;
  japSankhya: string;
  mala: string;
  disha: string;
  samay: string;
  vastra: string;
  naivedya: string;
  niyam: string;
  vidhi: string;
  phala: string;
}

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

export const JAIN_ALL = "सभी 501 मंत्र";

export const JAIN_MANTRAS: JainMantra[] = (raw.upay as RawUpay[]).map((item) => ({
  id: item.id,
  title: item.title,
  category: item.category,
  mantra: item.mantra,
  japSankhya: item.count ? `${item.count} बार` : "निश्चित संख्या नहीं",
  mala: item.difficulty,
  disha: "सुविधा अनुसार",
  samay: `${item.day} · ${item.time} · ${item.duration_days} दिन`,
  vastra: item.materials.join(", "),
  naivedya: item.cost,
  niyam: item.caution,
  vidhi: item.method,
  phala: `${item.problem}\n${item.basis}`,
}));

export const JAIN_MANTRA_CATEGORIES = [
  JAIN_ALL,
  ...Array.from(new Set(JAIN_MANTRAS.map((item) => item.category))),
];
