export type GeoPlace = {
  name: string;
  latitude: number;
  longitude: number;
  state?: string;
  district?: string;
  country?: string;
  type?: string;
};

type NominatimHit = {
  lat: string;
  lon: string;
  name?: string;
  display_name?: string;
  address?: Record<string, string>;
};

const UA = "ShaktiPanchang/1.2 (vedic panchang)";

function mapHit(item: NominatimHit, fallbackQuery: string): GeoPlace {
  const addr = item.address || {};
  const name =
    addr.village || addr.town || addr.city || addr.suburb || addr.hamlet || addr.county || item.name || fallbackQuery;
  const state = addr.state || addr.state_district || addr.region || "";
  const country = addr.country || "विश्व";
  const dist = addr.county || addr.state_district || addr.district || "";
  const label = dist
    ? `${name} (${dist}, ${state || country})`
    : state
      ? `${name} (${state}, ${country})`
      : `${name} (${country})`;
  return {
    name: label,
    latitude: parseFloat(item.lat),
    longitude: parseFloat(item.lon),
    state: state || undefined,
    district: dist || undefined,
    country,
    type: addr.village || addr.hamlet ? "village" : "city",
  };
}

export async function searchPlaces(input: { data: { query: string } }): Promise<GeoPlace[]> {
  const query = (input?.data?.query || "").trim().slice(0, 80);
  if (query.length < 2) return [];
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=12&addressdetails=1&accept-language=hi,en`;
  const res = await fetch(url, { headers: { Accept: "application/json", "User-Agent": UA } });
  if (!res.ok) return [];
  const json = (await res.json()) as NominatimHit[];
  if (!Array.isArray(json)) return [];
  return json.filter((item) => item.lat && item.lon).map((item) => mapHit(item, query));
}

export async function reverseGeocode(input: {
  data: { latitude: number; longitude: number };
}): Promise<GeoPlace> {
  const latitude = Number(input.data.latitude);
  const longitude = Number(input.data.longitude);
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=hi,en`;
  try {
    const res = await fetch(url, { headers: { Accept: "application/json", "User-Agent": UA } });
    if (res.ok) {
      const item = (await res.json()) as NominatimHit;
      if (item?.lat) return mapHit(item, "GPS");
    }
  } catch {
    /* ignore */
  }
  return {
    name: `वर्तमान जीपीएस स्थान (${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°)`,
    latitude,
    longitude,
    type: "gps",
  };
}
