import { SavedLocation, KundaliData, AppReminder } from "../types";
import { isDummyKundaliName } from "./predictions";

const STORAGE_KEY_LOCATION = "shakti_selected_location";
const STORAGE_KEY_PROFILES = "shakti_saved_kundali_profiles_v2";
const LEGACY_PROFILE_KEYS = ["shakti_saved_kundali_profiles_v1"];
const STORAGE_KEY_REMINDERS = "shakti_app_reminders_v1";
const STORAGE_KEY_CUSTOM_LOCS = "shakti_panchang_user_custom_locations";

function canStore(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

export const DEFAULT_LOCATION: SavedLocation = {
  name: "उज्जैन (Ujjain)",
  latitude: 23.1765,
  longitude: 75.7885,
  state: "मध्य प्रदेश",
  country: "भारत",
  type: "pilgrimage",
};

export function getStoredLocation(): SavedLocation {
  if (!canStore()) return DEFAULT_LOCATION;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LOCATION);
    if (raw) {
      const parsed = JSON.parse(raw) as SavedLocation;
      if (parsed?.name && Number.isFinite(parsed.latitude) && Number.isFinite(parsed.longitude)) {
        return parsed;
      }
    }
  } catch {
    /* ignore */
  }
  return DEFAULT_LOCATION;
}

export function setStoredLocation(loc: SavedLocation): void {
  if (!canStore()) return;
  try {
    localStorage.setItem(STORAGE_KEY_LOCATION, JSON.stringify(loc));
  } catch {
    /* ignore */
  }
}

function reviveKundali(p: Record<string, unknown>): KundaliData {
  const asDate = (v: unknown) => new Date(String(v ?? Date.now()));
  const revivePeriod = (d: Record<string, unknown>) => ({
    ...d,
    startDate: asDate(d.startDate),
    endDate: asDate(d.endDate),
  });
  return {
    ...(p as unknown as KundaliData),
    birthDate: asDate(p.birthDate),
    calculatedAt: asDate(p.calculatedAt),
    dashaPeriods: ((p.dashaPeriods as Record<string, unknown>[]) || []).map(revivePeriod) as KundaliData["dashaPeriods"],
    antarPeriods: ((p.antarPeriods as Record<string, unknown>[]) || []).map(revivePeriod) as KundaliData["antarPeriods"],
    pratyantarPeriods: ((p.pratyantarPeriods as Record<string, unknown>[]) || []).map(revivePeriod) as KundaliData["pratyantarPeriods"],
  };
}

export function isPackagedDummyProfile(p: KundaliData): boolean {
  if (isDummyKundaliName(p.name)) return true;
  const d = new Date(p.birthDate);
  if (
    Number.isFinite(d.getTime()) &&
    d.getFullYear() === 1995 &&
    d.getMonth() === 0 &&
    d.getDate() === 1 &&
    (p.birthTime === "12:00" || p.birthTime === "12:00:00")
  ) {
    return true;
  }
  return false;
}

function readProfileArray(raw: string | null): KundaliData[] {
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw) as Record<string, unknown>[];
    return arr.map(reviveKundali).filter((p) => !isPackagedDummyProfile(p));
  } catch {
    return [];
  }
}

export function getSavedKundaliProfiles(): KundaliData[] {
  if (!canStore()) return [];
  return readProfileArray(localStorage.getItem(STORAGE_KEY_PROFILES));
}

export function purgePackagedDummyProfiles(): void {
  if (!canStore()) return;
  try {
    const kept = new Map<string, KundaliData>();
    for (const key of [...LEGACY_PROFILE_KEYS, STORAGE_KEY_PROFILES]) {
      const list = readProfileArray(localStorage.getItem(key));
      for (const p of list) {
        kept.set(`${p.name}|${p.birthTime}|${p.birthPlace}`, p);
      }
      if (key !== STORAGE_KEY_PROFILES) localStorage.removeItem(key);
    }
    localStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify([...kept.values()].slice(0, 30)));
  } catch {
    /* ignore */
  }
}

export function saveKundaliProfile(profile: KundaliData): void {
  if (!canStore()) return;
  if (isPackagedDummyProfile(profile)) return;
  try {
    const existing = getSavedKundaliProfiles().filter(
      (p) => !(p.name === profile.name && p.birthTime === profile.birthTime),
    );
    existing.unshift(profile);
    localStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify(existing.slice(0, 30)));
  } catch {
    /* ignore */
  }
}

export function deleteSavedKundaliProfile(name: string, birthTime: string): void {
  if (!canStore()) return;
  try {
    const existing = getSavedKundaliProfiles().filter(
      (p) => !(p.name === name && p.birthTime === birthTime),
    );
    localStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify(existing));
  } catch {
    /* ignore */
  }
}

export function getStoredReminders(): AppReminder[] {
  if (!canStore()) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_REMINDERS);
    if (raw) return JSON.parse(raw) as AppReminder[];
  } catch {
    /* ignore */
  }
  return [];
}

export function saveReminder(rem: AppReminder): void {
  if (!canStore()) return;
  try {
    const list = getStoredReminders();
    list.unshift(rem);
    localStorage.setItem(STORAGE_KEY_REMINDERS, JSON.stringify(list.slice(0, 50)));
  } catch {
    /* ignore */
  }
}

export const saveAppReminder = saveReminder;

export function deleteReminder(id: string): void {
  if (!canStore()) return;
  try {
    const filtered = getStoredReminders().filter((r) => r.id !== id);
    localStorage.setItem(STORAGE_KEY_REMINDERS, JSON.stringify(filtered));
  } catch {
    /* ignore */
  }
}

export function getUserCustomLocations(): SavedLocation[] {
  if (!canStore()) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CUSTOM_LOCS);
    if (raw) return JSON.parse(raw) as SavedLocation[];
  } catch {
    /* ignore */
  }
  return [];
}

export function saveUserCustomLocation(loc: SavedLocation): void {
  if (!canStore()) return;
  try {
    const existing = getUserCustomLocations().filter((l) => l.name !== loc.name);
    existing.unshift(loc);
    localStorage.setItem(STORAGE_KEY_CUSTOM_LOCS, JSON.stringify(existing.slice(0, 50)));
  } catch {
    /* ignore */
  }
}
