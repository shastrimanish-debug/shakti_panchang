import raw from "./sabar.json";

type RawVidhi = {
  preparation?: string;
  worship?: string;
  japa_process?: string;
};

type RawEntry = {
  id: number;
  category?: string;
  deity?: string;
  title?: string;
  mantra?: string;
  purpose?: string;
  ruling_planet?: string;
  best_day?: string;
  best_time?: string;
  mala_type?: string;
  direction?: string;
  sankalp_days?: string;
  target_japa?: string;
  detailed_vidhi?: RawVidhi;
  source_status?: string;
};

export type SabarMantra = {
  id: number;
  category: string;
  deity: string;
  title: string;
  mantra: string;
  use: string;
  planet: string;
  day: string;
  time: string;
  mala: string;
  direction: string;
  days: string;
  japa: string;
  preparation: string;
  worship: string;
  japaProcess: string;
  caution: string;
};

export const SABAR_NOTE = "साधक अपने विवेक के अनुसार उपयोग करें। शक्ति पंचांग ने ये मंत्र आपकी सुविधा के लिए उपलब्ध करवाए हैं, परिणाम की कोई गारंटी नहीं लेता।";

export const SABAR_MANTRAS: SabarMantra[] = ((raw.entries || []) as RawEntry[]).map((item) => {
  const vidhi = item.detailed_vidhi || {};
  return {
    id: item.id,
    category: item.category || "शाबर मंत्र",
    deity: item.deity || "",
    title: item.title || "",
    mantra: item.mantra || "",
    use: item.purpose || "",
    planet: item.ruling_planet || "",
    day: item.best_day || "",
    time: item.best_time || "",
    mala: item.mala_type || "",
    direction: item.direction || "",
    days: item.sankalp_days || "",
    japa: item.target_japa || "",
    preparation: vidhi.preparation || "",
    worship: vidhi.worship || "",
    japaProcess: vidhi.japa_process || "",
    caution: SABAR_NOTE,
  };
});

export const SABAR_DEITIES = [...new Set(SABAR_MANTRAS.map((item) => item.deity).filter(Boolean))];
