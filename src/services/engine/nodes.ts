import * as Astronomy from "astronomy-engine";
import { normalize360 } from "./time";

export function meanNodeTropical(date: Date): number {
  const jd = date.getTime() / 86400000 + 2440587.5;
  const T = (jd - 2451545.0) / 36525.0;
  return normalize360(125.0445479 - 1934.1362891 * T + 0.0020754 * T * T);
}

/** Osculating (true) lunar node from Moon's ecliptic plane — free, no Swiss. */
export function trueNodeTropical(date: Date): number {
  try {
    const t0 = Astronomy.MakeTime(date);
    const t1 = Astronomy.MakeTime(new Date(date.getTime() + 12 * 60000));
    const e0 = Astronomy.Ecliptic(Astronomy.GeoVector(Astronomy.Body.Moon, t0, false));
    const e1 = Astronomy.Ecliptic(Astronomy.GeoVector(Astronomy.Body.Moon, t1, false));
    const toCart = (lon: number, lat: number) => {
      const lr = (lon * Math.PI) / 180;
      const br = (lat * Math.PI) / 180;
      return {
        x: Math.cos(br) * Math.cos(lr),
        y: Math.cos(br) * Math.sin(lr),
        z: Math.sin(br),
      };
    };
    const a = toCart(e0.elon, e0.elat);
    const b = toCart(e1.elon, e1.elat);
    const nx = a.y * b.z - a.z * b.y;
    const ny = a.z * b.x - a.x * b.z;
    const node = (Math.atan2(nx, -ny) * 180) / Math.PI;
    if (!Number.isFinite(node)) return meanNodeTropical(date);
    return normalize360(node);
  } catch {
    return meanNodeTropical(date);
  }
}
