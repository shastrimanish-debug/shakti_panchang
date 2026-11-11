import raw from "./vastu501.json";

export type VastuUpay = {
  id: number;
  category: string;
  title: string;
  problem: string;
  location: string;
  purpose: string;
  materials: string;
  method: string;
  mantra: string;
  direction: string;
  duration: string;
  cost: string;
  difficulty: string;
  source: string;
  scope: string;
  context: string;
  caution: string;
};

type Raw = {
  id: number;
  category?: string;
  title?: string;
  problem?: string;
  location?: string;
  purpose?: string;
  materials?: string[] | string;
  method?: string;
  mantra?: string;
  direction?: string;
  duration?: string;
  cost?: string;
  difficulty?: string;
  scriptural_reference?: { source?: string; scope?: string };
  traditional_context?: string;
  caution?: string;
};

export const VASTU_NOTE = raw.disclaimer || "";
export const VASTU_501: VastuUpay[] = ((raw.upay || []) as Raw[]).map((item) => ({
  id: item.id,
  category: item.category || "",
  title: item.title || "",
  problem: item.problem || "",
  location: item.location || "",
  purpose: item.purpose || "",
  materials: Array.isArray(item.materials) ? item.materials.join(", ") : item.materials || "",
  method: item.method || "",
  mantra: item.mantra || "",
  direction: item.direction || "",
  duration: item.duration || "",
  cost: item.cost || "",
  difficulty: item.difficulty || "",
  source: item.scriptural_reference?.source || "",
  scope: item.scriptural_reference?.scope || "",
  context: item.traditional_context || "",
  caution: item.caution || "",
}));

export const VASTU_CATEGORIES = [...new Set(VASTU_501.map((item) => item.category).filter(Boolean))];
