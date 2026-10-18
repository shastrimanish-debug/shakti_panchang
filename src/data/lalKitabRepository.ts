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
}

type RawUpay = {
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
  caution: string;
};

const PLANETS = ["सूर्य", "चंद्र", "मंगल", "बुध", "गुरु", "शुक्र", "शनि", "राहु", "केतु"];

function planetOf(title: string) {
  return PLANETS.find((name) => title.includes(name)) || "सामान्य";
}

const REMEDIES: LalKitabRemedy[] = (raw.upay as RawUpay[]).map((item) => ({
  id: item.id,
  code: `LK-${String(item.id).padStart(3, "0")}`,
  title: item.title,
  planet: planetOf(item.title),
  houseNumber: 0,
  category: item.category,
  problemStatement: item.problem,
  remedyProcedure: item.mantra ? `${item.method}\nमंत्र: ${item.mantra}` : item.method,
  materialsRequired: item.materials?.length ? item.materials : ["साधारण घरेलू सामग्री"],
  durationDays: item.count ? `${item.duration_days} दिन · ${item.count} बार` : `${item.duration_days} दिन`,
  bestDayAndTime: `${item.day} · ${item.time}`,
  precaution: item.caution,
}));

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
        item.remedyProcedure.toLowerCase().includes(q)
      );
    });
  }
}

export const lalKitabRepository = new LalKitabUpayRepository();
export const LAL_KITAB_COUNT = REMEDIES.length;
