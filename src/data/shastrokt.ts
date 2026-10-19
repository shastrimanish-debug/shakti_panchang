import raw from "./mantra501.json";

export type ShastroktUpay = {
  id: number;
  category: string;
  deity: string;
  title: string;
  mantra: string;
  purpose: string;
  method: string;
  japa: string;
  benefit: string;
  caution: string;
  source: string;
  planet: string;
  day: string;
  time: string;
  mala: string;
  direction: string;
  days: string;
  target: string;
  preparation: string;
  worship: string;
  sankalp: string;
  japaProcess: string;
  precautions: string;
};

type Raw = {
  id: number;
  category?: string;
  deity?: string;
  title?: string;
  mantra?: string;
  purpose?: string;
  method?: string;
  japa_count?: string;
  traditional_benefit?: string;
  caution?: string;
  source_status?: string;
  ruling_planet?: string;
  best_day?: string;
  best_time?: string;
  mala_type?: string;
  direction?: string;
  sankalp_days?: string;
  target_japa?: string;
  detailed_vidhi?: {
    preparation?: string;
    worship?: string;
    sankalp?: string;
    japa_process?: string;
    precautions?: string;
  };
};

const entries = (raw.entries || []) as Raw[];

export const SHASTROKT_NOTE = raw.important_note || "";
export const SHASTROKT_UPAY: ShastroktUpay[] = entries.map((item) => {
  const vidhi = item.detailed_vidhi || {};
  return {
    id: item.id,
    category: item.category || "",
    deity: item.deity || "",
    title: item.title || "",
    mantra: item.mantra || "",
    purpose: item.purpose || "",
    method: item.method || "",
    japa: item.japa_count || "",
    benefit: item.traditional_benefit || "",
    caution: item.caution || "",
    source: item.source_status || "",
    planet: item.ruling_planet || "",
    day: item.best_day || "",
    time: item.best_time || "",
    mala: item.mala_type || "",
    direction: item.direction || "",
    days: item.sankalp_days || "",
    target: item.target_japa || "",
    preparation: vidhi.preparation || "",
    worship: vidhi.worship || "",
    sankalp: vidhi.sankalp || "",
    japaProcess: vidhi.japa_process || "",
    precautions: vidhi.precautions || "",
  };
});

export const SHASTROKT_DEITIES = [...new Set(SHASTROKT_UPAY.map((item) => item.deity).filter(Boolean))];
