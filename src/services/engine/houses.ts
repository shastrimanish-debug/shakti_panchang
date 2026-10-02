import { normalize360 } from "./time";
import type { HouseSystem } from "./calcSettings";

export function midheavenTropical(ramcDeg: number, epsDeg: number): number {
  const ramc = (ramcDeg * Math.PI) / 180;
  const eps = (epsDeg * Math.PI) / 180;
  const y = Math.sin(ramc);
  const x = Math.cos(ramc) * Math.cos(eps);
  return normalize360((Math.atan2(y, x) * 180) / Math.PI);
}

/** 12 Sripati (Porphyry-style) sidereal cusps, index 0 = house 1. */
export function sripatiCusps(ascSidereal: number, mcSidereal: number): number[] {
  const cusps = new Array<number>(12);
  const ic = normalize360(mcSidereal + 180);
  const dsc = normalize360(ascSidereal + 180);
  const trisect = (from: number, to: number) => {
    let span = normalize360(to - from);
    if (span === 0) span = 360;
    return [from, normalize360(from + span / 3), normalize360(from + (2 * span) / 3)];
  };
  const q1 = trisect(ascSidereal, ic);
  const q2 = trisect(ic, dsc);
  const q3 = trisect(dsc, mcSidereal);
  const q4 = trisect(mcSidereal, ascSidereal);
  cusps[0] = q1[0];
  cusps[1] = q1[1];
  cusps[2] = q1[2];
  cusps[3] = q2[0];
  cusps[4] = q2[1];
  cusps[5] = q2[2];
  cusps[6] = q3[0];
  cusps[7] = q3[1];
  cusps[8] = q3[2];
  cusps[9] = q4[0];
  cusps[10] = q4[1];
  cusps[11] = q4[2];
  return cusps;
}

export function houseFromCusps(lon: number, cusps: number[]): number {
  const L = normalize360(lon);
  for (let i = 0; i < 12; i++) {
    const a = cusps[i];
    const b = cusps[(i + 1) % 12];
    const span = normalize360(b - a);
    const d = normalize360(L - a);
    if (d < span || span === 0) return i + 1;
  }
  return 1;
}

export function wholeSignHouse(planetSign: number, lagnaSign: number): number {
  return ((planetSign - lagnaSign + 12) % 12) + 1;
}

export function planetHouse(
  lon: number,
  lagnaDegree: number,
  system: HouseSystem,
  cusps?: number[],
): number {
  if (system === "sripati" && cusps && cusps.length === 12) {
    return houseFromCusps(lon, cusps);
  }
  return wholeSignHouse(Math.floor(normalize360(lon) / 30) % 12, Math.floor(normalize360(lagnaDegree) / 30) % 12);
}
