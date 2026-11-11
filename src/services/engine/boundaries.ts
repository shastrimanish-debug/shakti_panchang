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

function angForward(from: number, target: number): number {
  return (normalize360(target) - normalize360(from) + 360) % 360;
}

/** Next time the chosen angle, moving forward, lands on `target`. */
function findForward(from: Date, target: number, kind: "tithi" | "nak" | "yoga"): Date {
  const start = from.getTime();
  let prevT = start;
  let prevRemain = angForward(phase(new Date(prevT), kind), target);
  if (prevRemain < 0.02) return new Date(start);
  const horizon = start + 50 * 3600000;
  const step = 12 * 60000;
  for (let t = start + step; t <= horizon; t += step) {
    const remain = angForward(phase(new Date(t), kind), target);
    if (remain > prevRemain + 0.4) {
      let lo = prevT;
      let hi = t;
      for (let i = 0; i < 28; i++) {
        const mid = (lo + hi) / 2;
        const r = angForward(phase(new Date(mid), kind), target);
        if (r > 180) hi = mid;
        else lo = mid;
      }
      return new Date((lo + hi) / 2);
    }
    prevT = t;
    prevRemain = remain;
  }
  return new Date(prevT);
}

/** Most recent time at or before `from` when the angle was `target`. */
function findBackward(from: Date, target: number, kind: "tithi" | "nak" | "yoga"): Date {
  const begin = from.getTime() - 50 * 3600000;
  let cursor = begin;
  let last = new Date(begin);
  for (let n = 0; n < 6 && cursor <= from.getTime(); n++) {
    const hit = findForward(new Date(cursor), target, kind);
    if (hit.getTime() > from.getTime() + 1000) break;
    last = hit;
    cursor = hit.getTime() + 20 * 60000;
  }
  return last;
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
  const step = 360 / 27;
  const tithiPhase = phase(sunrise, "tithi");
  const nakPhase = phase(sunrise, "nak");
  const yogaPhase = phase(sunrise, "yoga");
  const tithiIdx = Math.floor(tithiPhase / 12);
  const nakIdx = Math.floor(nakPhase / step);
  const yogaIdx = Math.floor(yogaPhase / step);
  const karIdx = Math.floor(tithiPhase / 6);

  const tithiStart = findBackward(sunrise, (tithiIdx % 30) * 12, "tithi");
  const tithiEnd = findForward(new Date(sunrise.getTime() + 1000), ((tithiIdx + 1) % 30) * 12, "tithi");
  const nakStart = findBackward(sunrise, (nakIdx % 27) * step, "nak");
  const nakEnd = findForward(new Date(sunrise.getTime() + 1000), ((nakIdx + 1) % 27) * step, "nak");
  const yogaStart = findBackward(sunrise, (yogaIdx % 27) * step, "yoga");
  const yogaEnd = findForward(new Date(sunrise.getTime() + 1000), ((yogaIdx + 1) % 27) * step, "yoga");
  const karStart = findBackward(sunrise, (karIdx % 60) * 6, "tithi");
  const karEnd = findForward(new Date(sunrise.getTime() + 1000), ((karIdx + 1) % 60) * 6, "tithi");

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
