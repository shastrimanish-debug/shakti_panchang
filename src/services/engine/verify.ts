import * as Astronomy from "astronomy-engine";
import { ayanamshaDegrees, formatDms } from "./ayanamsha";
import { getCalcSettings } from "./calcSettings";
import { meeusTropicalBodies, meanNodeTropical as meeusMeanNode } from "./meeusEngine";
import { meanNodeTropical, trueNodeTropical } from "./nodes";
import { normalize360 } from "./time";

export interface EngineRow {
  planet: string;
  xalenDeg: number;
  meeusDeg: number;
  deltaArcsec: number;
  xalenDms: string;
  meeusDms: string;
}

export interface EngineVerify {
  at: Date;
  ayanamsha: number;
  ayanamshaName: string;
  rows: EngineRow[];
  maxDeltaArcsec: number;
  note: string;
}

const NAMES: { en: string; hi: string; body: Astronomy.Body | "Node" }[] = [
  { en: "Sun", hi: "सूर्य", body: Astronomy.Body.Sun },
  { en: "Moon", hi: "चंद्र", body: Astronomy.Body.Moon },
  { en: "Node", hi: "राहु", body: "Node" },
];

export function verifyEngines(date: Date): EngineVerify {
  const settings = getCalcSettings();
  const jd = date.getTime() / 86400000 + 2440587.5;
  const aya = ayanamshaDegrees(jd, settings.ayanamsha);
  const t = Astronomy.MakeTime(date);
  const meeus = meeusTropicalBodies(date);
  const rows: EngineRow[] = [];

  for (const n of NAMES) {
    let tropA: number;
    let tropB: number;
    if (n.body === "Node") {
      tropA = settings.nodeType === "true" ? trueNodeTropical(date) : meanNodeTropical(date);
      tropB = meeusMeanNode(date);
    } else {
      tropA = normalize360(Astronomy.Ecliptic(Astronomy.GeoVector(n.body, t, false)).elon);
      tropB = meeus[n.en]?.tropicalLon ?? tropA;
    }
    const sidA = normalize360(tropA - aya);
    const sidB = normalize360(tropB - aya);
    let d = sidA - sidB;
    if (d > 180) d -= 360;
    if (d < -180) d += 360;
    const deltaArcsec = Math.abs(d) * 3600;
    rows.push({
      planet: n.hi,
      xalenDeg: sidA,
      meeusDeg: sidB,
      deltaArcsec,
      xalenDms: formatDms(sidA % 30),
      meeusDms: formatDms(sidB % 30),
    });
  }

  const maxDeltaArcsec = Math.max(...rows.map((r) => r.deltaArcsec));
  return {
    at: date,
    ayanamsha: aya,
    ayanamshaName: settings.ayanamsha,
    rows,
    maxDeltaArcsec,
    note:
      "ग्रह स्थिति मुख्य इंजन XALEN (VSOP87) से। जाँच पट्टी सूर्य-चंद्र-राहु पर मीयस से मिलाती है। बुध-शनि केवल XALEN। Swiss Ephemeris नहीं।",
  };
}
