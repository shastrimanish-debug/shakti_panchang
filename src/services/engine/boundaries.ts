import * as Astronomy from "astronomy-engine";
import { ayanamshaDegrees } from "./ayanamsha";
import { getCalcSettings } from "./calcSettings";
import { normalize360 } from "./time";
import type { PanchangSpan } from "../../types";

const NAK = [
  "अश्विनी", "भरणी", "कृत्तिका", "रोहिणी", "मृगशीर्ष", "आर्द्रा",
  "पुनर्वसु", "पुष्य", "आश्लेषा", "मघा", "पूर्वा फाल्गुनी", "उत्तरा फाल्गुनी",
  "हस्त", "चित्रा", "स्वाती", "विशाखा", "अनुराधा", "ज्येष्ठा",
  "मूल", "पूर्वाषाढ़ा", "उत्तराषाढ़ा", "श्रवण", "धनिष्ठा", "शतभिषा",
  "पूर्वाभाद्रपद", "उत्तराभाद्रपद", "रेवती",
];
const YOG = [
  "विष्कम्भ", "प्रीति", "आयुष्मान", "सौभाग्य", "शोभन", "अतिगण्ड",
  "सुकर्मा", "धृति", "शूल", "गण्ड", "वृद्धि", "ध्रुव",
  "व्याघात", "हर्षण", "वज्र", "सिद्धि", "व्यतीपात", "वरीयान",
  "परिघ", "शिव", "सिद्ध", "साध्य", "शुभ", "शुक्ल",
  "ब्रह्म", "इन्द्र", "वैधृति",
];
const TITHI = [
  "प्रतिपदा", "द्वितीया", "तृतीया", "चतुर्थी", "पंचमी", "षष्ठी",
  "सप्तमी", "अष्टमी", "नवमी", "दशमी", "एकादशी", "द्वादशी",
  "त्रयोदशी", "चतुर्दशी", "पूर्णिमा",
];
const KAR = ["बव", "बालव", "कौलव", "तैतिल", "गर", "वणिज", "विष्टि (भद्रा)"];

function tropicalSunMoon(date: Date): { sun: number; moon: number } {
  const t = Astronomy.MakeTime(date);
  const sun = Astronomy.Ecliptic(Astronomy.GeoVector(Astronomy.Body.Sun, t, false)).elon;
  const moon = Astronomy.Ecliptic(Astronomy.GeoVector(Astronomy.Body.Moon, t, false)).elon;
  return { sun: normalize360(sun), moon: normalize360(moon) };
}

function siderealSunMoon(date: Date): { sun: number; moon: number } {
  const { sun, moon } = tropicalSunMoon(date);
  const aya = ayanamshaDegrees(date.getTime() / 86400000 + 2440587.5, getCalcSettings().ayanamsha);
  return { sun: normalize360(sun - aya), moon: normalize360(moon - aya) };
}

function phase(date: Date, kind: "tithi" | "nak" | "yoga"): number {
  const { sun, moon } = siderealSunMoon(date);
  if (kind === "tithi") return normalize360(moon - sun);
  if (kind === "nak") return normalize360(moon);
  return normalize360(moon + sun);
}

function findCrossing(left: Date, right: Date, target: number, kind: "tithi" | "nak" | "yoga"): Date {
  let lo = left.getTime();
  let hi = right.getTime();
  const tgt = normalize360(target);
  for (let i = 0; i < 28; i++) {
    const mid = (lo + hi) / 2;
    const p = phase(new Date(mid), kind);
    let d = p - tgt;
    if (d > 180) d -= 360;
    if (d < -180) d += 360;
    if (d < 0) lo = mid;
    else hi = mid;
  }
  return new Date((lo + hi) / 2);
}

function tithiName(idx: number): string {
  const i = ((idx % 30) + 30) % 30;
  if (i === 14) return "पूर्णिमा";
  if (i === 29) return "अमावस्या";
  return `${i < 15 ? "शुक्ल" : "कृष्ण"} ${TITHI[i % 15]}`;
}

function karanaName(idx: number): string {
  const i = ((idx % 60) + 60) % 60;
  if (i === 0) return "किंस्तुघ्न";
  if (i >= 57) return (["शकुनि", "चतुष्पद", "नाग"] as const)[i - 57];
  return KAR[(i - 1) % 7];
}

export function computeDayBoundaries(date: Date, sunrise: Date, nextSunrise: Date): {
  tithiSpan: PanchangSpan;
  nakshatraSpan: PanchangSpan;
  yogaSpan: PanchangSpan;
  karanaSpan: PanchangSpan;
} {
  const probe = new Date(sunrise.getTime() + 6 * 3600000);
  const dayStart = new Date(sunrise.getTime() - 18 * 3600000);
  const dayEnd = new Date(nextSunrise.getTime() + 18 * 3600000);
  const tithiPhase = phase(sunrise, "tithi");
  const nakPhase = phase(sunrise, "nak");
  const yogaPhase = phase(sunrise, "yoga");
  const tithiIdx = Math.floor(tithiPhase / 12);
  const nakIdx = Math.floor(nakPhase / (360 / 27));
  const yogaIdx = Math.floor(yogaPhase / (360 / 27));
  const karIdx = Math.floor(tithiPhase / 6);

  const tithiStart = findCrossing(dayStart, probe, tithiIdx * 12, "tithi");
  const tithiEnd = findCrossing(probe, dayEnd, (tithiIdx + 1) * 12, "tithi");
  const nakStart = findCrossing(dayStart, probe, nakIdx * (360 / 27), "nak");
  const nakEnd = findCrossing(probe, dayEnd, (nakIdx + 1) * (360 / 27), "nak");
  const yogaStart = findCrossing(dayStart, probe, yogaIdx * (360 / 27), "yoga");
  const yogaEnd = findCrossing(probe, dayEnd, (yogaIdx + 1) * (360 / 27), "yoga");
  const karStart = findCrossing(dayStart, probe, karIdx * 6, "tithi");
  const karEnd = findCrossing(probe, dayEnd, (karIdx + 1) * 6, "tithi");

  return {
    tithiSpan: {
      name: tithiName(tithiIdx),
      nextName: tithiName(tithiIdx + 1),
      start: tithiStart,
      end: tithiEnd,
    },
    nakshatraSpan: {
      name: NAK[nakIdx % 27],
      nextName: NAK[(nakIdx + 1) % 27],
      start: nakStart,
      end: nakEnd,
    },
    yogaSpan: {
      name: YOG[yogaIdx % 27],
      nextName: YOG[(yogaIdx + 1) % 27],
      start: yogaStart,
      end: yogaEnd,
    },
    karanaSpan: {
      name: karanaName(karIdx),
      nextName: karanaName(karIdx + 1),
      start: karStart,
      end: karEnd,
    },
  };
}
