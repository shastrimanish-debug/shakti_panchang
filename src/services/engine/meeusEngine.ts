/**
 * Engine B — Jean Meeus / Paul Schlyter (public-domain orbital elements).
 * Independent of astronomy-engine (XALEN). Used for cross-check, not Swiss.
 */
import { normalize360 } from "./time";

const DEG = Math.PI / 180;

function rev(x: number): number {
  return normalize360(x);
}

function kepler(Mdeg: number, e: number): number {
  let E = Mdeg;
  Mdeg = rev(Mdeg);
  for (let i = 0; i < 12; i++) {
    E = E - (E - (e * 180) / Math.PI * Math.sin(E * DEG) - Mdeg) / (1 - e * Math.cos(E * DEG));
  }
  return E;
}

export interface MeeusBody {
  name: string;
  tropicalLon: number;
  latitude: number;
}

function sunTropical(T: number): number {
  const L0 = rev(280.46646 + 36000.76983 * T + 0.0003032 * T * T);
  const M = rev(357.52911 + 35999.05029 * T - 0.0001537 * T * T);
  const C =
    (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(M * DEG) +
    (0.019993 - 0.000101 * T) * Math.sin(2 * M * DEG) +
    0.000289 * Math.sin(3 * M * DEG);
  return rev(L0 + C);
}

function moonTropical(T: number): { lon: number; lat: number } {
  const Lp = 218.3164477 + 481267.88123421 * T - 0.0015786 * T * T;
  const D = 297.8501921 + 445267.1114034 * T - 0.0018819 * T * T;
  const M = 357.5291092 + 35999.0502909 * T;
  const Mp = 134.9633964 + 477198.8675055 * T + 0.0087414 * T * T;
  const F = 93.272095 + 483202.0175233 * T - 0.0036539 * T * T;
  let lon =
    Lp +
    6.288774 * Math.sin(Mp * DEG) +
    1.274027 * Math.sin((2 * D - Mp) * DEG) +
    0.658314 * Math.sin(2 * D * DEG) +
    0.213618 * Math.sin(2 * Mp * DEG) -
    0.185116 * Math.sin(M * DEG) -
    0.114332 * Math.sin(2 * F * DEG) +
    0.058793 * Math.sin((2 * D - 2 * Mp) * DEG) +
    0.057066 * Math.sin((2 * D - M - Mp) * DEG) +
    0.05332 * Math.sin((2 * D + Mp) * DEG) +
    0.045758 * Math.sin((2 * D - M) * DEG) -
    0.040923 * Math.sin((M - Mp) * DEG) -
    0.03472 * Math.sin(D * DEG);
  const lat =
    5.128189 * Math.sin(F * DEG) +
    0.280606 * Math.sin((Mp + F) * DEG) +
    0.277693 * Math.sin((Mp - F) * DEG) +
    0.173238 * Math.sin((2 * D - F) * DEG);
  return { lon: rev(lon), lat };
}

type Elements = {
  N: number;
  i: number;
  w: number;
  a: number;
  e: number;
  M: number;
};

function el(T: number, planet: string): Elements {
  switch (planet) {
    case "Mercury":
      return {
        N: 48.3313 + 3.24587e-5 * T * 36525,
        i: 7.0047 + 5.0e-8 * T * 36525,
        w: 29.1241 + 1.01444e-5 * T * 36525,
        a: 0.387098,
        e: 0.205635 + 5.59e-10 * T * 36525,
        M: 168.6562 + 4.0923344368 * T * 36525,
      };
    case "Venus":
      return {
        N: 76.6799 + 2.4659e-5 * T * 36525,
        i: 3.3946 + 2.75e-8 * T * 36525,
        w: 54.891 + 1.38374e-5 * T * 36525,
        a: 0.72333,
        e: 0.006773 - 1.302e-9 * T * 36525,
        M: 48.0052 + 1.6021302244 * T * 36525,
      };
    case "Mars":
      return {
        N: 49.5574 + 2.11081e-5 * T * 36525,
        i: 1.8497 - 1.78e-8 * T * 36525,
        w: 286.5016 + 2.92961e-5 * T * 36525,
        a: 1.523688,
        e: 0.093405 + 2.516e-9 * T * 36525,
        M: 18.6021 + 0.5240207766 * T * 36525,
      };
    case "Jupiter":
      return {
        N: 100.4542 + 2.76854e-5 * T * 36525,
        i: 1.303 - 1.557e-7 * T * 36525,
        w: 273.8777 + 1.64505e-5 * T * 36525,
        a: 5.20256,
        e: 0.048498 + 4.469e-9 * T * 36525,
        M: 19.895 + 0.0830853001 * T * 36525,
      };
    case "Saturn":
      return {
        N: 113.6634 + 2.3898e-5 * T * 36525,
        i: 2.4886 - 1.081e-7 * T * 36525,
        w: 339.3939 + 2.97661e-5 * T * 36525,
        a: 9.55475,
        e: 0.055546 - 9.499e-9 * T * 36525,
        M: 316.967 + 0.0334442282 * T * 36525,
      };
    default:
      return { N: 0, i: 0, w: 0, a: 1, e: 0.0167, M: 0 };
  }
}

function earthHelio(T: number): { x: number; y: number; z: number } {
  const w = 282.9404 + 4.70935e-5 * T * 36525;
  const e = 0.016709 - 1.151e-9 * T * 36525;
  const M = rev(356.047 + 0.9856002585 * T * 36525);
  const E = kepler(M, e);
  const xv = Math.cos(E * DEG) - e;
  const yv = Math.sqrt(1 - e * e) * Math.sin(E * DEG);
  const v = Math.atan2(yv, xv) / DEG;
  const r = Math.sqrt(xv * xv + yv * yv);
  const lon = (v + w) * DEG;
  return { x: r * Math.cos(lon), y: r * Math.sin(lon), z: 0 };
}

function planetTropical(T: number, planet: string): { lon: number; lat: number } {
  const o = el(T, planet);
  const E = kepler(o.M, o.e);
  const xv = o.a * (Math.cos(E * DEG) - o.e);
  const yv = o.a * Math.sqrt(1 - o.e * o.e) * Math.sin(E * DEG);
  const v = Math.atan2(yv, xv);
  const r = Math.sqrt(xv * xv + yv * yv);
  const N = o.N * DEG;
  const i = o.i * DEG;
  const w = o.w * DEG;
  const xh =
    r * (Math.cos(N) * Math.cos(v + w) - Math.sin(N) * Math.sin(v + w) * Math.cos(i));
  const yh =
    r * (Math.sin(N) * Math.cos(v + w) + Math.cos(N) * Math.sin(v + w) * Math.cos(i));
  const zh = r * (Math.sin(v + w) * Math.sin(i));
  const earth = earthHelio(T);
  const xg = xh - earth.x;
  const yg = yh - earth.y;
  const zg = zh - earth.z;
  const lon = Math.atan2(yg, xg) / DEG;
  const lat = Math.atan2(zg, Math.sqrt(xg * xg + yg * yg)) / DEG;
  return { lon: rev(lon), lat };
}

export function meeusTropicalBodies(date: Date): Record<string, MeeusBody> {
  const jd = date.getTime() / 86400000 + 2440587.5;
  const T = (jd - 2451545.0) / 36525.0;
  const sun = sunTropical(T);
  const moon = moonTropical(T);
  const names = ["Mercury", "Venus", "Mars", "Jupiter", "Saturn"] as const;
  const out: Record<string, MeeusBody> = {
    Sun: { name: "Sun", tropicalLon: sun, latitude: 0 },
    Moon: { name: "Moon", tropicalLon: moon.lon, latitude: moon.lat },
  };
  for (const n of names) {
    const p = planetTropical(T, n);
    out[n] = { name: n, tropicalLon: p.lon, latitude: p.lat };
  }
  return out;
}

export function meanNodeTropical(date: Date): number {
  const jd = date.getTime() / 86400000 + 2440587.5;
  const T = (jd - 2451545.0) / 36525.0;
  return rev(125.0445479 - 1934.1362891 * T + 0.0020754 * T * T);
}
