/** Global local civil time engine. Solar events are stored as true UTC instants. */

export function timezoneHoursFor(lat: number, lon: number): number {
  // Nepal (UTC+5:45)
  if (lon >= 80 && lon <= 88.5 && lat >= 26.3 && lat <= 30.5) return 5.75;
  // India & Sri Lanka (UTC+5:30)
  if (lon >= 67 && lon <= 97.6 && lat >= 5.5 && lat <= 37.6) return 5.5;
  // USA & Canada standard timezones by longitude
  if (lat >= 24 && lat <= 60 && lon >= -130 && lon <= -65) {
    if (lon < -114) return -8; // Pacific (PST)
    if (lon < -102) return -7; // Mountain (MST)
    if (lon < -85) return -6;  // Central (CST)
    return -5; // Eastern (EST)
  }
  // UK / Ireland
  if (lat >= 50 && lat <= 60 && lon >= -10 && lon <= 2) return 0;
  // Western / Central Europe (Germany, France, Netherlands, Switzerland, Italy)
  if (lat >= 35 && lat <= 65 && lon > 2 && lon <= 25) return 1;
  // UAE, Oman (UTC+4)
  if (lat >= 15 && lat <= 30 && lon >= 51.5 && lon <= 60) return 4;
  // Saudi Arabia, Qatar, Kuwait, Bahrain (UTC+3)
  if (lat >= 15 && lat <= 33 && lon >= 34 && lon < 51.5) return 3;
  // Australia
  if (lat >= -45 && lat <= -10 && lon >= 110 && lon <= 160) {
    if (lon < 129) return 8; // Western Australia (Perth)
    if (lon < 140) return 9.5; // South Australia (Adelaide)
    return 10; // Eastern Australia (Sydney, Melbourne, Brisbane)
  }
  // New Zealand (UTC+12)
  if (lat >= -50 && lat <= -30 && lon >= 165 && lon <= 180) return 12;
  // Singapore & Malaysia & Bali (UTC+8)
  if (lat >= -10 && lat <= 7 && lon >= 99 && lon <= 120) return 8;
  // Japan (UTC+9)
  if (lat >= 30 && lat <= 46 && lon >= 128 && lon <= 146) return 9;
  // Indian Ocean Islands - Mauritius, Réunion, Seychelles (UTC+4)
  if (lat >= -22 && lat <= -4 && lon >= 55 && lon <= 58.5) return 4;
  // East Africa - Kenya, Uganda, Tanzania, Ethiopia, Madagascar, Somalia (UTC+3)
  if (lat >= -26 && lat <= 15 && lon >= 29 && lon <= 51) {
    if (lat >= -12 && lat <= 6 && lon >= 29 && lon <= 42) return 3; // Kenya, Uganda, Tanzania
    if (lat >= 3 && lat <= 15 && lon >= 33 && lon <= 48) return 3; // Ethiopia, Somalia
    if (lat >= -26 && lat <= -12 && lon >= 43 && lon <= 51) return 3; // Madagascar
  }
  // Central & Southern Africa - South Africa, Zimbabwe, Zambia, Malawi, Mozambique, Botswana, Rwanda, Egypt, Sudan (UTC+2)
  if (lat >= -35 && lat <= 32 && lon >= 17 && lon <= 36) {
    if (lat >= -35 && lat <= -22) return 2; // South Africa, Lesotho, Eswatini
    if (lat >= -22 && lat <= -9 && lon >= 18 && lon <= 36) return 2; // Zimbabwe, Zambia, Malawi, Mozambique, Botswana
    if (lat >= -3 && lat <= 5 && lon >= 28 && lon <= 31) return 2; // Rwanda, Burundi
    if (lat >= 10 && lat <= 32 && lon >= 22 && lon <= 36) return 2; // Egypt, Sudan
  }
  // West Africa - Nigeria, Cameroon, DR Congo west, Angola, Niger (UTC+1)
  if (lat >= -18 && lat <= 15 && lon >= 2 && lon <= 18) return 1;
  // West Africa coastal GMT - Ghana, Ivory Coast, Senegal, Mali, Guinea (UTC+0)
  if (lat >= 4 && lat <= 20 && lon >= -18 && lon <= 2) return 0;

  // Fallback to closest standard hour by longitude
  return Math.round(lon / 15);
}

export function localMidnightUtc(date: Date, tzHours: number): Date {
  const y = date.getFullYear();
  const m = date.getMonth();
  const d = date.getDate();
  return new Date(Date.UTC(y, m, d) - tzHours * 3600000);
}

export function formatPlaceTime(d: Date, lat = 23.1765, lon = 75.7885, tzHoursParam?: number): string {
  const tz = tzHoursParam ?? timezoneHoursFor(lat, lon);
  if (tz === 5.5) {
    return d.toLocaleTimeString("hi-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata",
    });
  }
  const shifted = new Date(d.getTime() + tz * 3600000);
  const hh = shifted.getUTCHours();
  const mm = shifted.getUTCMinutes();
  const am = hh >= 12 ? "अपराह्न" : "पूर्वाह्न";
  const h12 = ((hh + 11) % 12) + 1;
  return `${h12}:${String(mm).padStart(2, "0")} ${am} (UTC${tz >= 0 ? `+${tz}` : tz})`;
}

export function formatPlaceDateTime(d: Date, lat = 23.1765, lon = 75.7885, tzHoursParam?: number): string {
  const tz = tzHoursParam ?? timezoneHoursFor(lat, lon);
  const datePart =
    tz === 5.5
      ? d.toLocaleDateString("hi-IN", {
          day: "numeric",
          month: "short",
          timeZone: "Asia/Kolkata",
        })
      : `${d.getUTCDate()}/${d.getUTCMonth() + 1}`;
  return `${datePart}, ${formatPlaceTime(d, lat, lon, tz)}`;
}

export function normalize360(deg: number): number {
  let n = deg % 360;
  if (n < 0) n += 360;
  return n;
}
