/** India-first local civil time. Solar events are stored as true UTC instants. */

export function timezoneHoursFor(lat: number, lon: number): number {
  if (lon >= 67 && lon <= 97.6 && lat >= 6.4 && lat <= 37.6) return 5.5;
  return Math.round((lon / 15) * 2) / 2;
}

export function localMidnightUtc(date: Date, tzHours: number): Date {
  const y = date.getFullYear();
  const m = date.getMonth();
  const d = date.getDate();
  return new Date(Date.UTC(y, m, d) - tzHours * 3600000);
}

export function formatPlaceTime(d: Date, lat = 23.1765, lon = 75.7885): string {
  if (timezoneHoursFor(lat, lon) === 5.5) {
    return d.toLocaleTimeString("hi-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata",
    });
  }
  const tz = timezoneHoursFor(lat, lon);
  const shifted = new Date(d.getTime() + tz * 3600000);
  const hh = shifted.getUTCHours();
  const mm = shifted.getUTCMinutes();
  const am = hh >= 12 ? "अपराह्न" : "पूर्वाह्न";
  const h12 = ((hh + 11) % 12) + 1;
  return `${h12}:${String(mm).padStart(2, "0")} ${am}`;
}

export function formatPlaceDateTime(d: Date, lat = 23.1765, lon = 75.7885): string {
  const datePart =
    timezoneHoursFor(lat, lon) === 5.5
      ? d.toLocaleDateString("hi-IN", {
          day: "numeric",
          month: "short",
          timeZone: "Asia/Kolkata",
        })
      : `${d.getUTCDate()}/${d.getUTCMonth() + 1}`;
  return `${datePart}, ${formatPlaceTime(d, lat, lon)}`;
}

export function normalize360(deg: number): number {
  let n = deg % 360;
  if (n < 0) n += 360;
  return n;
}
