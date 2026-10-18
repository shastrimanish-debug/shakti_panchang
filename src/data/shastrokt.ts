import raw from "./shastrokt501.json";

export type ShastroktUpay = {
  id: number;
  category: string;
  title: string;
  purpose: string;
  materials: string[];
  method: string;
  mantra: string;
  count: string;
  duration: string;
  source: string;
  verse: string;
  original: string;
  scope: string;
  url: string | null;
  evidence: string;
  cost: string;
  caution: string;
};

type Raw = {
  id: number;
  category: string;
  title: string;
  purpose: string;
  materials: string[];
  method: string;
  mantra: string;
  count: string;
  duration: string;
  scriptural_reference: {
    source: string;
    chapter_verse: string;
    original_text_or_pointer: string;
    url: string | null;
    scope: string;
  };
  evidence_status: string;
  cost: string;
  caution: string;
};

export const SHASTROKT_TITLE = raw.title;
export const SHASTROKT_DISCLAIMER = raw.disclaimer;
export const SHASTROKT_UPAY: ShastroktUpay[] = (raw.upay as Raw[]).map((item) => ({
  id: item.id,
  category: item.category,
  title: item.title,
  purpose: item.purpose,
  materials: item.materials,
  method: item.method,
  mantra: item.mantra,
  count: item.count,
  duration: item.duration,
  source: item.scriptural_reference.source,
  verse: item.scriptural_reference.chapter_verse,
  original: item.scriptural_reference.original_text_or_pointer,
  scope: item.scriptural_reference.scope,
  url: item.scriptural_reference.url,
  evidence: item.evidence_status,
  cost: item.cost,
  caution: item.caution,
}));

export const SHASTROKT_CATEGORIES = [...new Set(SHASTROKT_UPAY.map((item) => item.category))];
