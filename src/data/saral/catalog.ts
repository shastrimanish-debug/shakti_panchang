import raw from "./upay.json";

export type Upay = {
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

export const TITLE = raw.title;
export const DISCLAIMER = raw.disclaimer;
export const UPAY: Upay[] = raw.upay;

export const CATEGORIES = [...new Set(UPAY.map((item) => item.category))];

export const DIFFICULTIES = ["बहुत सरल", "सरल", "मध्यम"] as const;

export function matchesWeekday(dayField: string, weekday: string) {
  return dayField.includes(weekday) || dayField.includes("प्रतिदिन");
}

export function japaLabel(item: Upay) {
  if (!item.count) return "जाप आवश्यक नहीं";
  if (item.count === 1) return "एक पाठ";
  return `${item.count} बार`;
}
