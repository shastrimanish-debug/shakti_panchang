import * as Astronomy from "astronomy-engine";
import { SolarTimes } from "../../types";
import { localMidnightUtc, timezoneHoursFor } from "./time";

function noaaEvent(dateUtc: Date, lat: number, lon: number, sunrise: boolean): Date {
  const y = dateUtc.getUTCFullYear();
  const startOfYear = Date.UTC(y, 0, 1);
  const dayOfYear = Math.floor((dateUtc.getTime() - startOfYear) / 86400000) + 1;
  const lngHour = lon / 15;
  const t = dayOfYear + ((sunrise ? 6 : 18) - lngHour) / 24;
  const M = 0.9856 * t - 3.289;
  const L = ((M + 1.916 * Math.sin((M * Math.PI) / 180) + 0.02 * Math.sin((2 * M * Math.PI) / 180) + 282.634) % 360 + 360) % 360;
  let RA = (Math.atan(0.91764 * Math.tan((L * Math.PI) / 180)) * 180) / Math.PI;
  RA = ((RA % 360) + 360) % 360;
  RA += Math.floor(L / 90) * 90 - Math.floor(RA / 90) * 90;
  RA /= 15;
  const sinDec = 0.39782 * Math.sin((L * Math.PI) / 180);
  const cosDec = Math.cos(Math.asin(sinDec));
  const cosH =
    (Math.cos((90.833 * Math.PI) / 180) - sinDec * Math.sin((lat * Math.PI) / 180)) /
    (cosDec * Math.cos((lat * Math.PI) / 180));
  if (cosH > 1 || cosH < -1) {
    return new Date(Date.UTC(y, dateUtc.getUTCMonth(), dateUtc.getUTCDate(), sunrise ? 0 : 12));
  }
  let H = sunrise ? 360 - (Math.acos(cosH) * 180) / Math.PI : (Math.acos(cosH) * 180) / Math.PI;
  H /= 15;
  let utcHour = (H + RA - 0.06571 * t - 6.622 - lngHour) % 24;
  if (utcHour < 0) utcHour += 24;
  return new Date(Date.UTC(y, dateUtc.getUTCMonth(), dateUtc.getUTCDate(), 0, Math.round(utcHour * 60)));
}

/** True UTC instants. Display with formatPlaceTime (Asia/Kolkata for India). */
export function calculateAccurateSolarTimes(
  date: Date,
  lat: number,
  lon: number,
  tzHours?: number,
): SolarTimes {
  const tz = tzHours ?? timezoneHoursFor(lat, lon);
  const midnight = localMidnightUtc(date, tz);
  const observer = new Astronomy.Observer(lat, lon, 0);
  try {
    const start = new Date(midnight.getTime() - 2 * 3600000);
    const rise = Astronomy.SearchRiseSet(Astronomy.Body.Sun, observer, +1, start, 1.7);
    const setStart = rise ? new Date(rise.date.getTime() + 30 * 60000) : start;
    const set = Astronomy.SearchRiseSet(Astronomy.Body.Sun, observer, -1, setStart, 1.2);
    const nextStart = new Date(midnight.getTime() + 22 * 3600000);
    const nextRise = Astronomy.SearchRiseSet(Astronomy.Body.Sun, observer, +1, nextStart, 1.6);
    if (rise && set && nextRise) {
      const sunrise = rise.date;
      const sunset = set.date;
      const nextSunrise = nextRise.date;
      return {
        sunrise,
        sunset,
        nextSunrise,
        solarNoon: new Date(sunrise.getTime() + (sunset.getTime() - sunrise.getTime()) / 2),
      };
    }
  } catch {
    /* NOAA fallback */
  }
  const y = date.getFullYear();
  const m = date.getMonth();
  const d = date.getDate();
  const base = new Date(Date.UTC(y, m, d));
  const sunrise = noaaEvent(base, lat, lon, true);
  const sunset = noaaEvent(base, lat, lon, false);
  const nextSunrise = noaaEvent(new Date(Date.UTC(y, m, d + 1)), lat, lon, true);
  return {
    sunrise,
    sunset,
    nextSunrise,
    solarNoon: new Date(sunrise.getTime() + (sunset.getTime() - sunrise.getTime()) / 2),
  };
}

export function dayMuhuratWindows(solar: SolarTimes) {
  const muhurta = 48 * 60000;
  const nightMid = new Date(
    solar.sunset.getTime() + (solar.nextSunrise.getTime() - solar.sunset.getTime()) / 2,
  );
  return {
    brahma: {
      title: "ब्रह्म मुहूर्त",
      start: new Date(solar.sunrise.getTime() - 2 * muhurta),
      end: new Date(solar.sunrise.getTime() - muhurta),
      kind: "shubh" as const,
    },
    pradosh: {
      title: "प्रदोष काल",
      start: solar.sunset,
      end: new Date(solar.sunset.getTime() + muhurta),
      kind: "shubh" as const,
    },
    nishith: {
      title: "निशीथ काल",
      start: new Date(nightMid.getTime() - muhurta / 2),
      end: new Date(nightMid.getTime() + muhurta / 2),
      kind: "tyajya" as const,
    },
    abhijit: {
      title: "अभिजित मुहूर्त",
      start: new Date(solar.solarNoon.getTime() - muhurta / 2),
      end: new Date(solar.solarNoon.getTime() + muhurta / 2),
      kind: "shubh" as const,
    },
  };
}
