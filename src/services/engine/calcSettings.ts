export type AyanamshaId = "lahiri" | "raman" | "kp";
export type NodeType = "mean" | "true";
export type HouseSystem = "whole" | "sripati";
export type MasaSystem = "purnimanta" | "amanta";
export type EkadashiTradition = "smarta" | "vaishnava";

export interface CalcSettings {
  ayanamsha: AyanamshaId;
  nodeType: NodeType;
  houseSystem: HouseSystem;
  masaSystem: MasaSystem;
  ekadashiTradition: EkadashiTradition;
}

export const DEFAULT_CALC_SETTINGS: CalcSettings = {
  ayanamsha: "lahiri",
  nodeType: "mean",
  houseSystem: "whole",
  masaSystem: "purnimanta",
  ekadashiTradition: "smarta",
};

const KEY = "shakti_calc_settings_v1";

export const AYANAMSHA_LABELS: Record<AyanamshaId, string> = {
  lahiri: "लाहिरी / चित्रपक्ष",
  raman: "बी.वी. रमन",
  kp: "के.पी. / कृष्णमूर्ति",
};

export const NODE_LABELS: Record<NodeType, string> = {
  mean: "मध्य राहु (Mean)",
  true: "सत्य राहु (True)",
};

export const HOUSE_LABELS: Record<HouseSystem, string> = {
  whole: "राशि भाव (Whole Sign)",
  sripati: "श्रीपति भाव",
};

export const MASA_SYSTEM_LABELS: Record<MasaSystem, string> = {
  purnimanta: "पूर्णिमान्त (उत्तर भारत / काशी)",
  amanta: "अमान्त (गुजरात / महाराष्ट्र / दक्षिण)",
};

export const EKADASHI_TRADITION_LABELS: Record<EkadashiTradition, string> = {
  smarta: "स्मार्त (गृहस्थ मत)",
  vaishnava: "वैष्णव (दशमी विद्धा वर्जित)",
};

export function getCalcSettings(): CalcSettings {
  if (typeof window === "undefined") return { ...DEFAULT_CALC_SETTINGS };
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT_CALC_SETTINGS };
    const p = JSON.parse(raw) as Partial<CalcSettings>;
    return {
      ayanamsha: p.ayanamsha === "raman" || p.ayanamsha === "kp" ? p.ayanamsha : "lahiri",
      nodeType: p.nodeType === "true" ? "true" : "mean",
      houseSystem: p.houseSystem === "sripati" ? "sripati" : "whole",
      masaSystem: p.masaSystem === "amanta" ? "amanta" : "purnimanta",
      ekadashiTradition: p.ekadashiTradition === "vaishnava" ? "vaishnava" : "smarta",
    };
  } catch {
    return { ...DEFAULT_CALC_SETTINGS };
  }
}

export function setCalcSettings(next: CalcSettings): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
    window.dispatchEvent(new Event("shakti-calc-settings"));
  } catch {
    /* ignore */
  }
}
