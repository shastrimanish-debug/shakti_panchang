import type { AyanamshaId } from "./calcSettings";

const T0 = 2415020.0; // 1900 Jan 0.5 TT (Swiss/IAE convention)
const PRECESSION_ARCSEC_PER_YEAR = 50.2388475;

/** Swiss-documented ayanamsa at 1900 Jan 0.5, without using Swiss library. */
const AYAN_T0: Record<AyanamshaId, number> = {
  lahiri: 22.46047, // 22°27′37.7″ Chitrapaksha
  raman: 21.01444, // 21°00′52″
  kp: 22.363889, // 22°21′50″ Krishnamurti–Newcomb
};

export const AYANAMSHA_NAMES: Record<AyanamshaId, string> = {
  lahiri: "लाहिरी अयनांश (चित्रपक्ष)",
  raman: "रमन अयनांश",
  kp: "के.पी. अयनांश (न्यूकॉम्ब)",
};

export function julianDay(date: Date): number {
  return date.getTime() / 86400000 + 2440587.5;
}

export function ayanamshaDegrees(jd: number, id: AyanamshaId = "lahiri"): number {
  const years = (jd - T0) / 365.242198781;
  const tCent = years / 100;
  // Newcomb-style quadratic so rate matches IAE ~50.26″ + 0.000222″ T
  const deltaArcsec =
    PRECESSION_ARCSEC_PER_YEAR * years + 0.000111 * (years * years);
  const nutationArcsec = 17.2 * Math.sin(((125.04 - 1934.14 * tCent) * Math.PI) / 180);
  return AYAN_T0[id] + deltaArcsec / 3600 + nutationArcsec / 3600;
}

export function formatDms(deg: number): string {
  const sign = deg < 0 ? "-" : "";
  const a = Math.abs(deg);
  const d = Math.floor(a);
  const mFloat = (a - d) * 60;
  const m = Math.floor(mFloat);
  const s = (mFloat - m) * 60;
  return `${sign}${d}° ${String(m).padStart(2, "0")}′ ${s.toFixed(1)}″`;
}
