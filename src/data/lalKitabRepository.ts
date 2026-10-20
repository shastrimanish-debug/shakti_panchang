import raw from "./lal501.json";

export interface LalKitabRemedy {
  id: number;
  code: string;
  title: string;
  planet: string;
  houseNumber: number;
  category: string;
  problemStatement: string;
  remedyProcedure: string;
  materialsRequired: string[];
  durationDays: string;
  bestDayAndTime: string;
  precaution: string;
  mantra?: string;
  sourceNote?: string;
  sourceUrl?: string;
}

type RawUpay = {
  id: number;
  category: string;
  title: string;
  planet?: string;
  problem: string;
  materials: string[];
  procedure?: string;
  method?: string;
  mantra?: string;
  count?: number;
  duration_days?: number | null;
  day?: string;
  time?: string;
  frequency?: string | null;
  caution: string;
  source_note?: string;
  source_url?: string;
};

const PLANETS = ["सूर्य", "चंद्र", "मंगल", "बुध", "गुरु", "शुक्र", "शनि", "राहु", "केतु", "सर्वग्रह"];

function extractHouseNumber(title: string): number {
  const match = title.match(/खाना\s*(?:नंबर\s*|नं\.\s*)?(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

function resolvePlanet(item: RawUpay): string {
  if (item.planet && item.planet.trim()) {
    return item.planet.trim();
  }
  const found = PLANETS.find((name) => item.title.includes(name));
  return found || "सर्वग्रह";
}

function resolveDuration(item: RawUpay): string {
  if (item.duration_days) {
    if (item.count) {
      return `${item.duration_days} दिन (${item.count} बार)`;
    }
    return `${item.duration_days} दिन लगातार`;
  }
  return "नियमित / आवश्यकतानुसार";
}

function resolveTiming(item: RawUpay): string {
  if (item.frequency && item.frequency.trim()) {
    return item.frequency.trim();
  }
  if (item.day || item.time) {
    return [item.day, item.time].filter(Boolean).join(" · ");
  }
  return "दिन के समय (सूर्योदय से पूर्वार्ह्न)";
}

const REMEDIES: LalKitabRemedy[] = ((raw as any).upay as RawUpay[]).map((item) => {
  const procedureText = item.procedure || item.method || "";
  const planet = resolvePlanet(item);
  const house = extractHouseNumber(item.title);

  return {
    id: item.id,
    code: `LK-${String(item.id).padStart(3, "0")}`,
    title: item.title,
    planet,
    houseNumber: house,
    category: item.category || `${planet} उपाय`,
    problemStatement: item.problem || "ग्रह दोष शांति एवं सामान्य जीवन कष्ट निवारण",
    remedyProcedure: procedureText,
    materialsRequired: item.materials && item.materials.length > 0 ? item.materials : ["साधारण घरेलू / पूजन सामग्री"],
    durationDays: resolveDuration(item),
    bestDayAndTime: resolveTiming(item),
    precaution: item.caution || "दिन के उजाले में उपाय करें; कर्ज लेकर दान न करें; किसी जीव को कष्ट न पहुँचाएँ।",
    mantra: item.mantra || undefined,
    sourceNote: item.source_note || undefined,
    sourceUrl: item.source_url || undefined,
  };
});

class LalKitabUpayRepository {
  public getAllRemedies(): LalKitabRemedy[] {
    return REMEDIES;
  }

  public getCategories(): string[] {
    return ["सभी (All)", ...Array.from(new Set(REMEDIES.map((item) => item.category)))];
  }

  public getPlanets(): string[] {
    return ["सभी ग्रह", ...Array.from(new Set(REMEDIES.map((item) => item.planet)))];
  }

  public searchRemedies(query: string, category: string, planet: string): LalKitabRemedy[] {
    const q = query.trim().toLowerCase();
    return REMEDIES.filter((item) => {
      if (category !== "सभी (All)" && item.category !== category) return false;
      if (planet !== "सभी ग्रह" && item.planet !== planet) return false;
      if (!q) return true;
      return (
        item.title.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q) ||
        item.planet.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.problemStatement.toLowerCase().includes(q) ||
        item.remedyProcedure.toLowerCase().includes(q) ||
        (item.mantra && item.mantra.toLowerCase().includes(q)) ||
        (item.materialsRequired && item.materialsRequired.some((m) => m.toLowerCase().includes(q)))
      );
    });
  }
}

export const lalKitabRepository = new LalKitabUpayRepository();
export const LAL_KITAB_COUNT = REMEDIES.length;
