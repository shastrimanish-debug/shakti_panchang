import { PlanetPosition } from "../types";
import { calculatePlanetPositions, RASHIS } from "./astronomy";
import { RASHI_FORECASTS } from "../data/rashifalData";

export interface GocharRow {
  planet: string;
  rashi: string;
  house: number;
  retrograde: boolean;
}

export interface DailyRashifal {
  dateLabel: string;
  moonTransit: string;
  general: string;
  career: string;
  wealth: string;
  love: string;
  health: string;
  remedy: string;
  rows: GocharRow[];
}

const RASHI_INDEX: Record<string, number> = {
  mesh: 0,
  vrishabh: 1,
  mithun: 2,
  kark: 3,
  simh: 4,
  kanya: 5,
  tula: 6,
  vrishchik: 7,
  dhanu: 8,
  makar: 9,
  kumbh: 10,
  meen: 11,
};

const HOUSE_FRUIT: Record<number, string> = {
  1: "शरीर और मनोबल पर सीधा असर",
  2: "परिवार और संचित धन का विषय",
  3: "साहस, हाथ का काम और छोटी यात्रा",
  4: "घर, माता और मन की शांति",
  5: "बुद्धि, संतान और विद्या",
  6: "रोग, ऋण और प्रतिद्वंद्वी पर विजय",
  7: "दांपत्य और साझेदारी",
  8: "अचानक चिंता और गुप्त खर्च",
  9: "भाग्य, गुरु और लंबा मार्ग",
  10: "नौकरी, मान और कार्यसिद्धि",
  11: "आय और इच्छा की पूर्ति",
  12: "व्यय, एकांत और थकान",
};

const MANTRA: Record<string, string> = {
  सूर्य: "आज सूर्य को जल चढ़ाकर ॐ घृणिः सूर्याय नमः का ११ जप करें।",
  चंद्र: "आज चावल और दूध का दान, तथा ॐ सोमाय नमः का ११ जप करें।",
  मंगल: "हनुमान चालीसा और ॐ क्रां क्रीं क्रौं सः भौमाय नमः। लाल मसूर का दान।",
  बुध: "गणेश जी को दूर्वा और ॐ ब्रां ब्रीं ब्रौं सः बुधाय नमः। हरी वस्तु दान।",
  गुरु: "पीली वस्तु या चना दान, ॐ ग्रां ग्रीं ग्रौं सः गुरवे नमः।",
  शुक्र: "श्वेत वस्त्र और खीर, ॐ द्रां द्रीं द्रौं सः शुक्राय नमः।",
  शनि: "शनिवार का तेल दीप और ॐ प्रां प्रीं प्रौं सः शनैश्चराय नमः। तिल दान।",
  राहु: "ॐ भ्राम भ्रीं भ्रौं सः राहवे नमः, और काले तिल का दान।",
  केतु: "ॐ स्रां स्रीं स्रौं सः केतवे नमः। भूरे कुत्ते को रोटी।",
};

function houseFrom(planetSign: number, janmaSign: number): number {
  const p = planetSign >= 1 ? planetSign - 1 : 0;
  return ((p - janmaSign + 12) % 12) + 1;
}

function sentence(planet: PlanetPosition | undefined, janmaSign: number): string {
  if (!planet) return "";
  const house = houseFrom(planet.rashiNumber, janmaSign);
  const retro = planet.isRetrograde ? " वक्री है, इसलिए काम दोहरा होकर धीमा चलेगा।" : "।";
  return `${planet.planet} आज ${planet.rashi} में है, आपकी राशि से ${house}वें भाव में${retro} ${HOUSE_FRUIT[house] || ""}।`;
}

function pick(planets: PlanetPosition[], names: string[]): PlanetPosition[] {
  return names
    .map((name) => planets.find((p) => p.planet === name))
    .filter((p): p is PlanetPosition => Boolean(p));
}

export function buildDailyRashifal(
  rashiId: string,
  date: Date,
  latitude: number,
  longitude: number,
  timezoneHours = 5.5,
): DailyRashifal {
  const janma = RASHI_INDEX[rashiId] ?? 0;
  const meta = RASHI_FORECASTS.find((r) => r.id === rashiId);
  const planets = calculatePlanetPositions(date, latitude, longitude, timezoneHours);
  const moon = planets.find((p) => p.planet === "चंद्र");
  const rows: GocharRow[] = planets.map((p) => ({
    planet: p.planet,
    rashi: p.rashi,
    house: houseFrom(p.rashiNumber, janma),
    retrograde: p.isRetrograde,
  }));

  const afflicted = [...planets].sort((a, b) => score(b, janma) - score(a, janma))[0];
  const weekday = date.toLocaleDateString("hi-IN", { weekday: "long" });
  const dateLabel = date.toLocaleDateString("hi-IN", { day: "numeric", month: "long", year: "numeric" });

  return {
    dateLabel,
    moonTransit: moon ? `${moon.rashi} (${moon.nakshatra})` : RASHIS[janma],
    general: `${weekday}, ${dateLabel}। जन्म राशि ${meta?.name.split(" ")[0] || RASHIS[janma]}। ${sentence(moon, janma)} चंद्र का गोचर हर ढाई दिन में बदलता है, इसलिए यह फल कल वही नहीं रहेगा।`,
    career: pick(planets, ["सूर्य", "बुध", "गुरु"]).map((p) => sentence(p, janma)).join(" "),
    wealth: pick(planets, ["शुक्र", "गुरु"]).map((p) => sentence(p, janma)).join(" "),
    love: sentence(planets.find((p) => p.planet === "शुक्र"), janma),
    health: pick(planets, ["शनि", "मंगल"]).map((p) => sentence(p, janma)).join(" "),
    remedy: afflicted ? `${afflicted.planet} आज सबसे अधिक ध्यान माँग रहा है। ${MANTRA[afflicted.planet] || meta?.prediction.remedy || ""}` : meta?.prediction.remedy || "",
    rows,
  };
}

function score(planet: PlanetPosition, janmaSign: number): number {
  const house = houseFrom(planet.rashiNumber, janmaSign);
  let n = planet.isRetrograde ? 2 : 0;
  if (house === 8) n += 4;
  if (house === 12) n += 3;
  if (house === 6) n += 2;
  return n;
}
