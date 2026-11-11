export type SadhanaEntry = {
  startedOn: string;
  done: string[];
};

export type SadhanaMap = Record<string, SadhanaEntry>;

const KEY = "shakti-saral-upay";

export function todayISO(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function loadSadhana(): SadhanaMap {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as SadhanaMap;
    if (!parsed || typeof parsed !== "object") return {};
    return parsed;
  } catch {
    return {};
  }
}

export function saveSadhana(map: SadhanaMap) {
  localStorage.setItem(KEY, JSON.stringify(map));
}

export function weekdayName(date = new Date()) {
  return ["रविवार", "सोमवार", "मंगलवार", "बुधवार", "गुरुवार", "शुक्रवार", "शनिवार"][
    date.getDay()
  ];
}

export function hiNum(value: number) {
  return String(value).replace(/\d/g, (digit) => "०१२३४५६७८९"[Number(digit)]);
}
