import raw from "./sabar.json";

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

export const SABAR_MANTRAS = raw.mantras as SabarMantra[];
export const SABAR_CATEGORIES = [...new Set(SABAR_MANTRAS.map((item) => item.category))];
