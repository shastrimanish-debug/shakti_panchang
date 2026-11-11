import raw from "./jain201.json";

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

type RawVidhi = {
  preparation?: string;
  worship?: string;
  japa_process?: string;
  closing?: string;
};

type RawEntry = {
  id: number;
  category?: string;
  title?: string;
  deity?: string;
  mantra?: string;
  text_type?: string;
  tradition_scope?: string;
  meaning_or_intent?: string;
  complete_vidhi?: RawVidhi;
  target_japa?: number;
  duration_days?: string;
  best_day?: string;
  best_time?: string;
  authenticity_note?: string;
};

export const JAIN_NOTE = "साधक अपने विवेक के अनुसार उपयोग करें। शक्ति पंचांग ने ये पाठ आपकी सुविधा के लिए उपलब्ध करवाए हैं, परिणाम की कोई गारंटी नहीं लेता।";

export const JAIN_MANTRAS: JainMantra[] = ((raw.entries || []) as RawEntry[]).map((item) => {
  const vidhi = item.complete_vidhi || {};
  return {
    id: item.id,
    title: item.title || "",
    category: item.category || "",
    mantra: item.mantra || "",
    japSankhya: item.target_japa ? `${item.target_japa} बार` : "सुविधा अनुसार",
    mala: item.deity || "",
    disha: item.tradition_scope || "",
    samay: [item.best_day, item.best_time, item.duration_days].filter(Boolean).join(" · "),
    vastra: item.text_type || "",
    naivedya: "नैवेद्य आवश्यक नहीं",
    niyam: JAIN_NOTE,
    vidhi: [
      vidhi.preparation ? `तैयारी: ${vidhi.preparation}` : "",
      vidhi.worship ? `स्मरण: ${vidhi.worship}` : "",
      vidhi.japa_process ? `पाठ: ${vidhi.japa_process}` : "",
      vidhi.closing ? `समापन: ${vidhi.closing}` : "",
    ].filter(Boolean).join("\n\n"),
    phala: [item.meaning_or_intent, item.authenticity_note].filter(Boolean).join("\n\n"),
  };
});

export const JAIN_ALL = `सभी ${JAIN_MANTRAS.length} पाठ`;

export const JAIN_MANTRA_CATEGORIES = [
  JAIN_ALL,
  ...Array.from(new Set(JAIN_MANTRAS.map((item) => item.category))),
];
